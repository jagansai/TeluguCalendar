node .\scripts\populateShortThidi.js
pwsh -File .\scripts\build-android.ps1 -FestivalsToken te_festivals
pwsh -NoProfile -Command "npm run start -- --reset-cache"
pwsh -File .\scripts\deploy-android.ps1 -Variant debug -AvdName "Medium_Phone_API_36.0"  
