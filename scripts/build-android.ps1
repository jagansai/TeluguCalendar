param(
  [switch]$Release
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

$gradleCmd = if ($Release) { "assembleRelease" } else { "assembleDebug" }

Write-Host "Building Android ($gradleCmd)..."
Push-Location "$repo/android"
try {
  if (Test-Path .\gradlew.bat) {
    .\gradlew.bat copyFestivalJson $gradleCmd
  } else {
    ./gradlew copyFestivalJson $gradleCmd
  }
}
finally {
  Pop-Location
}

Write-Host "Done. APK/AAB is under android/app/build/outputs."
