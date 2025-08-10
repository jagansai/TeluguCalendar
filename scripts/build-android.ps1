param(
  [switch]$Release,
  [ValidateSet('apk','aab')]
  [string]$Format
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Split-Path -Parent $root

Write-Host "Copying festivals2025.json to Android assets..."
Copy-Item -Force -Path "$repo/assets/festivals2025.json" -Destination "$repo/android/app/src/main/assets/festivals2025.json"

# Copy app icon into Android resources for adaptive icon
$iconSrc = Join-Path $repo 'assets/app_icon.png'
$iconDstDir = Join-Path $repo 'android/app/src/main/res/drawable-nodpi'
$iconDst = Join-Path $iconDstDir 'ic_launcher_foreground.png'
if (Test-Path $iconSrc) {
  if (-not (Test-Path $iconDstDir)) { New-Item -ItemType Directory -Force -Path $iconDstDir | Out-Null }
  Write-Host "Copying app icon to $iconDst"
  Copy-Item -Force -Path $iconSrc -Destination $iconDst
} else {
  Write-Warning "App icon not found at $iconSrc. Skipping icon copy."
}

function Get-GradleCmd {
  param([bool]$IsRelease, [string]$Format)
  if (-not $IsRelease) { return 'assembleDebug' }
  if (-not $Format -or $Format -eq '') { $Format = 'aab' }
  switch ($Format) {
    'apk' { return 'assembleRelease' }
    'aab' { return 'bundleRelease' }
    default { throw "Unknown format '$Format'" }
  }
}

function Resolve-UploadProps {
  # Reads Gradle properties from project android/gradle.properties and user %USERPROFILE%\.gradle\gradle.properties
  $projPropsPath = Join-Path $repo 'android/gradle.properties'
  $userPropsPath = Join-Path $env:USERPROFILE '.gradle/gradle.properties'
  $props = @{}
  foreach ($p in @($projPropsPath, $userPropsPath)) {
    if (Test-Path $p) {
      Get-Content $p | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#') -and $line -match '^(?<k>[^=]+)=(?<v>.*)$') {
          $props[$Matches['k'].Trim()] = $Matches['v'].Trim()
        }
      }
    }
  }
  return $props
}

function Ensure-UploadSigning {
  # Prevent accidental release builds without upload keystore
  $props = Resolve-UploadProps
  $keys = @('MYAPP_UPLOAD_STORE_FILE','MYAPP_UPLOAD_KEY_ALIAS','MYAPP_UPLOAD_STORE_PASSWORD','MYAPP_UPLOAD_KEY_PASSWORD')
  $missing = @()
  foreach ($k in $keys) { if (-not $props.ContainsKey($k) -or [string]::IsNullOrWhiteSpace($props[$k])) { $missing += $k } }
  if ($missing.Count -gt 0) {
    throw "Missing upload keystore Gradle properties: $($missing -join ', '). Add them to android/gradle.properties or %USERPROFILE%\.gradle\gradle.properties before building a Release AAB."
  }
  # Validate keystore file exists, resolving relative path to android/app
  $storeFile = $props['MYAPP_UPLOAD_STORE_FILE']
  $appDir = Join-Path $repo 'android/app'
  if ($storeFile.StartsWith('./')) { $ksPath = Join-Path $appDir ($storeFile.Substring(2)) }
  elseif ([System.IO.Path]::IsPathRooted($storeFile)) { $ksPath = $storeFile }
  else { $ksPath = Join-Path $appDir $storeFile }
  if (-not (Test-Path $ksPath)) { throw "Upload keystore not found at: $ksPath (from MYAPP_UPLOAD_STORE_FILE=$storeFile)" }
}

$gradleCmd = Get-GradleCmd -IsRelease:$Release.IsPresent -Format:$Format

Write-Host "Building Android ($gradleCmd)..."
Push-Location "$repo/android"
try {
  if ($Release) { Ensure-UploadSigning }
  if (Test-Path .\gradlew.bat) {
    .\gradlew.bat copyFestivalJson $gradleCmd
  } else {
    ./gradlew copyFestivalJson $gradleCmd
  }
}
finally {
  Pop-Location
}

# Echo output location for convenience
if ($gradleCmd -eq 'bundleRelease') {
  Write-Host "Done. AAB is under android/app/build/outputs/bundle/release/app-release.aab"
} elseif ($gradleCmd -eq 'assembleRelease') {
  Write-Host "Done. APK is under android/app/build/outputs/apk/release/app-release.apk"
} elseif ($gradleCmd -eq 'assembleDebug') {
  Write-Host "Done. APK is under android/app/build/outputs/apk/debug/app-debug.apk"
} else {
  Write-Host "Done. APK/AAB is under android/app/build/outputs."
}
