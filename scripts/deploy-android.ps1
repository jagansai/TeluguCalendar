param(
  [ValidateSet('debug','release')]
  [string]$Variant = 'release',
  [string]$AvdName,
  [switch]$SkipBuild,
  [switch]$WhatIf,
  [switch]$Release,
  [ValidateSet('apk','aab')]
  [string]$Format,
  [switch]$StartMetro,
  [int]$MetroPort = 8081
)

$ErrorActionPreference = 'Stop'

function Write-Step($msg) { Write-Host "[deploy] $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Warning $msg }
function Write-Err($msg) { Write-Host $msg -ForegroundColor Red }

function Get-RepoRoot {
  Split-Path -Parent $PSScriptRoot
}

function Get-AndroidSdkPath {
  $repo = Get-RepoRoot
  $localProps = Join-Path $repo 'android/local.properties'
  if (Test-Path $localProps) {
    $line = Select-String -Path $localProps -Pattern '^sdk.dir=' -SimpleMatch | Select-Object -First 1
    if ($line) { return ($line.Line -replace '^sdk.dir=', '').Trim() }
  }
  if ($env:ANDROID_SDK_ROOT) { return $env:ANDROID_SDK_ROOT }
  if ($env:ANDROID_HOME) { return $env:ANDROID_HOME }
  throw 'Android SDK path not found. Set ANDROID_SDK_ROOT or ensure android/local.properties has sdk.dir='
}

function Get-AdbPath {
  try { return (Get-Command adb -ErrorAction Stop).Source } catch {
    $sdk = Get-AndroidSdkPath
    $adb = Join-Path $sdk 'platform-tools/adb.exe'
    if (Test-Path $adb) { return $adb }
    throw 'adb not found in PATH or SDK platform-tools.'
  }
}

function Get-EmulatorPath {
  $sdk = Get-AndroidSdkPath
  $emu = Join-Path $sdk 'emulator/emulator.exe'
  if (Test-Path $emu) { return $emu }
  throw 'emulator.exe not found. Please install Android Emulator via SDK Manager.'
}

function Get-ConnectedDevices {
  param([string]$Adb)
  $out = & $Adb devices
  $lines = $out | ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('List of devices') }
  $devices = @()
  foreach ($l in $lines) {
    $parts = ($l -split '\s+')
    if ($parts.Count -ge 2 -and $parts[1] -eq 'device') { $devices += $parts[0] }
  }
  return $devices
}

function Ensure-DeviceOnline {
  param([string]$Adb, [string]$AvdName)
  $devs = Get-ConnectedDevices -Adb $Adb
  if ($devs.Count -gt 0) { return $true }

  Write-Step 'No online devices. Attempting to start an emulator.'
  $emu = Get-EmulatorPath
  if (-not $AvdName) {
    $avds = & $emu -list-avds
    if (-not $avds) { throw 'No AVDs found. Create one in Android Studio AVD Manager.' }
    $AvdName = ($avds | Select-Object -First 1).Trim()
  }
  Write-Step "Starting AVD '$AvdName'..."
  if (-not $WhatIf) {
    Start-Process -FilePath $emu -ArgumentList @('-avd', $AvdName, '-netdelay', 'none', '-netspeed', 'full') | Out-Null
  } else {
    Write-Step "DRY RUN: would start emulator: $emu -avd $AvdName"
  }

  # Wait for device to appear and fully boot
  $timeoutSec = 300
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $timeoutSec) {
    Start-Sleep -Seconds 5
    $devs = Get-ConnectedDevices -Adb $Adb
    if ($devs.Count -gt 0) {
      # Check boot completed
      $serial = $devs[0]
      $boot = & $Adb -s $serial shell getprop sys.boot_completed 2>$null
      if ($boot -and $boot.Trim() -eq '1') { return $true }
    }
    Write-Step 'Waiting for emulator to boot...'
  }
  throw 'Timed out waiting for emulator to boot.'
}

function Build-App {
  param([string]$Variant, [string]$Format)
  $repo = Get-RepoRoot
  $buildScript = Join-Path $repo 'scripts/build-android.ps1'
  if (-not (Test-Path $buildScript)) { throw "Build script not found: $buildScript" }
  if ($WhatIf) { Write-Step "DRY RUN: would build Android ($Variant)"; return }
  if ($Variant -eq 'release') {
    if ($Format) { & pwsh -File $buildScript -Release -Format $Format }
    else { & pwsh -File $buildScript -Release }
  } else {
    & pwsh -File $buildScript
  }
}

function Get-ApkPath {
  param([string]$Variant)
  $repo = Get-RepoRoot
  if ($Variant -eq 'release') {
    $p = Join-Path $repo 'android/app/build/outputs/apk/release/app-release.apk'
  } else {
    $p = Join-Path $repo 'android/app/build/outputs/apk/debug/app-debug.apk'
  }
  if (-not (Test-Path $p)) { throw "APK not found at $p. Build may have failed." }
  return $p
}

function Install-Apk {
  param([string]$Adb, [string]$ApkPath, [string]$PackageName)
  $devices = Get-ConnectedDevices -Adb $Adb
  if ($devices.Count -eq 0) { throw 'No devices online to install to.' }
  foreach ($d in $devices) {
    Write-Step "Installing to $d ..."
    if ($WhatIf) { Write-Step "DRY RUN: adb -s $d install -r $ApkPath"; continue }
    & $Adb -s $d install -r $ApkPath
    if ($LASTEXITCODE -ne 0) {
      Write-Warn 'Install failed, attempting uninstall + reinstall (signature mismatch likely).'
      & $Adb -s $d uninstall $PackageName | Out-Null
      & $Adb -s $d install $ApkPath
      if ($LASTEXITCODE -ne 0) { throw "Install failed on $d" }
    }
  }
}

function Ensure-AdbReverse {
  param([string]$Adb, [int]$Port)
  $devices = Get-ConnectedDevices -Adb $Adb
  if ($devices.Count -eq 0) { return }
  foreach ($d in $devices) {
    Write-Step "Setting up adb reverse tcp:$Port on $d"
    if ($WhatIf) { Write-Step "DRY RUN: adb -s $d reverse tcp:$Port tcp:$Port"; continue }
    & $Adb -s $d reverse tcp:$Port tcp:$Port | Out-Null
  }
}

function Ensure-MetroRunning {
  param([int]$Port)
  try {
    $tnc = Test-NetConnection -ComputerName 'localhost' -Port $Port -WarningAction SilentlyContinue
    if ($tnc -and $tnc.TcpTestSucceeded) {
      Write-Step "Metro already listening on $Port"
      return
    }
  } catch { }

  $repo = Get-RepoRoot
  Write-Step "Starting Metro on port $Port ..."
  if ($WhatIf) { Write-Step "DRY RUN: npm run start"; return }
  Start-Process -FilePath "npm" -ArgumentList @('run','start') -WorkingDirectory $repo -WindowStyle Minimized | Out-Null
}

function Main {
  if ($Release) { $Variant = 'release' }
  Write-Step "Variant: $Variant"
  $adb = Get-AdbPath
  Write-Step "ADB: $adb"
  if (-not $WhatIf) { & $adb start-server | Out-Null }

  Ensure-DeviceOnline -Adb $adb -AvdName $AvdName | Out-Null

  # For debug builds, ensure Metro and adb reverse are ready unless explicitly disabled
  if ($Variant -eq 'debug') {
    if ($PSBoundParameters.ContainsKey('StartMetro') -and -not $StartMetro.IsPresent) {
      # user passed -StartMetro:$false
    } else {
      Ensure-MetroRunning -Port $MetroPort
    }
    Ensure-AdbReverse -Adb $adb -Port $MetroPort
  }

  # Decide effective output format for build/install flow
  $effectiveFormat = $Format
  if (-not $effectiveFormat) {
    # Default to APK for install flows; only build AAB when explicitly requested
    $effectiveFormat = ($Variant -eq 'release') ? 'apk' : ''
  }

  if (-not $SkipBuild) { Build-App -Variant $Variant -Format $effectiveFormat }

  # If building an AAB, skip install and just report the output path
  if ($Variant -eq 'release' -and $effectiveFormat -eq 'aab') {
    $repo = Get-RepoRoot
    $aab = Join-Path $repo 'android/app/build/outputs/bundle/release/app-release.aab'
    if (-not (Test-Path $aab)) { throw "AAB not found at $aab" }
    Write-Step "AAB built: $aab"
    Write-Step 'Done.'
    return
  }

  $apk = Get-ApkPath -Variant $Variant
  Write-Step "APK: $apk"
  $packageName = 'com.telugufestivalreminderclean'
  Install-Apk -Adb $adb -ApkPath $apk -PackageName $packageName
  Write-Step 'Done.'
}

Main
