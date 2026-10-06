@echo off
chcp 65001 >nul
title QishloqMed - Hamshira APK Yaratish (Android Build)
cls
echo ======================================================================
echo          QishloqMed - Hamshira APK Yaratish (Android)
echo ======================================================================
echo.
echo 1/3. TypeScript va Vite build tayyorlanmoqda...
cd /d "%~dp0nurse-app"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [XATOLIK] Build jarayonida xatolik yuz berdi!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2/3. Android loyihasiga sinxronlashtirilmoqda...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo [XATOLIK] Capacitor sync xatoligi!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 3/3. Gradle orqali APK yig'ilmoqda...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo [XATOLIK] APK yig'ishda xatolik yuz berdi!
    pause
    exit /b %ERRORLEVEL%
)

copy /Y "app\build\outputs\apk\debug\app-debug.apk" "%~dp0QishloqMed-Hamshira.apk" >nul
echo.
echo ======================================================================
echo  [MUVAFFAQIYATLI] Yangi APK tayyor: QishloqMed-Hamshira.apk
echo ======================================================================
echo.
pause
