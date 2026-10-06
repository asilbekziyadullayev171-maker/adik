@echo off
chcp 65001 >nul
title Shifokor Veb Ilovasini Vercel ga joylash
cls
echo ======================================================================
echo          Shifokor Veb Ilovasini Vercel (Internet) ga joylash
echo ======================================================================
echo.
echo 1/2. Loyiha tekshirilmoqda va build qilinmoqda...
cd /d "%~dp0doctor-web"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [XATOLIK] Build xatosi yuz berdi!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2/2. Vercel ga yuklanmoqda...
echo.
echo Agar birinchi marta bo'lsa, Vercel hisobingizga kirishni so'raydi.
echo Savollarga "Y" (Ha) deb Enter bosing.
echo.
call npx vercel --prod
echo.
echo ======================================================================
echo  [MUVAFFAQIYATLI] Shifokor veb ilovasi internetga muvaffaqiyatli joylandi!
echo ======================================================================
echo.
pause
