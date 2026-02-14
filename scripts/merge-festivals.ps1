# Script to merge Telugu festival JSON files with proper UTF-8 encoding
# This fixes Unicode corruption issues

$ErrorActionPreference = "Stop"

# Define paths
$assetsDir = Join-Path $PSScriptRoot ".." "assets"
$te2025File = Join-Path $assetsDir "te_festivals2025.json"
$te2026File = Join-Path $assetsDir "te_festivals2026.json"
$outputFile = Join-Path $assetsDir "festivals.json"

Write-Host "Merging festival files with proper UTF-8 encoding..." -ForegroundColor Cyan

# Read JSON files with UTF-8 encoding
$festivals2025 = Get-Content -Path $te2025File -Raw -Encoding UTF8 | ConvertFrom-Json
$festivals2026 = Get-Content -Path $te2026File -Raw -Encoding UTF8 | ConvertFrom-Json

Write-Host "Loaded $($festivals2025.Count) entries from 2025"
Write-Host "Loaded $($festivals2026.Count) entries from 2026"

# Combine arrays
$allFestivals = @($festivals2025) + @($festivals2026)

Write-Host "Total entries: $($allFestivals.Count)" -ForegroundColor Green

# Convert to JSON with proper formatting and UTF-8 encoding
$json = $allFestivals | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($outputFile, $json, [System.Text.Encoding]::UTF8)

Write-Host "Successfully created $outputFile with proper UTF-8 encoding" -ForegroundColor Green
