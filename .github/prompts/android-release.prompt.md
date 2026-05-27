---
mode: 'agent'
description: 'Prepare a new Android release for the TeluguCalendar app'
---

Prepare the next Android release for the TeluguCalendar app by following the process in [ANDROID_RELEASE_PROCESS.md](../../ANDROID_RELEASE_PROCESS.md).

## Steps

1. **Read current versions** from:
   - `package.json` → `"version"` field
   - `android/app/build.gradle` → `versionCode` and `versionName`

2. **Determine new version** using patch bump (x.x.N+1) unless a minor or major bump is warranted:
   - `package.json`: increment patch version
   - `android/app/build.gradle`: increment `versionCode` by 1, update `versionName` to match

3. **Update both files** with the new version values.

4. **Update the examples** in `ANDROID_RELEASE_PROCESS.md` to reflect the new current → next version numbers in:
   - Step 1 code block
   - Step 2 code block
   - Quick Reference Checklist lines
   - Example Release Cycle section

5. **Report the build command** to run (do not run it automatically):
   ```powershell
   .\scripts\build-android.ps1 -Release -FestivalsToken te_festivals2026
   ```
   Adjust the year token if a newer festival JSON file exists under `assets/`.

6. **Summarize** what was changed and remind the user to upload the AAB to Google Play Console after a successful build.
