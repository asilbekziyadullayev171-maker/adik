@echo off
chcp 65001 >nul
title Shifonuri - GitHub ga yuklash
cls
echo ======================================================================
echo          Shifonuri Loyihasini GitHub ga Joylash (Push)
echo ======================================================================
echo.
echo 1-QADAM:
echo Agar hali GitHub da yangi repozitoriy ochmagan bo'lsangiz:
echo Brauzerda https://github.com/new ga kiring va yangi repozitoriy yarating.
echo (Masalan nomi: shifonuri)
echo.
echo ======================================================================
set /p REPO_URL="GitHub repozitoriy havolasini kiriting (masalan: https://github.com/username/shifonuri.git): "

if "%REPO_URL%"=="" (
    echo [XATOLIK] Havola kiritilmadi!
    pause
    exit /b 1
)

echo.
echo 2-QADAM: Git sozlanmoqda...
git branch -M main
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo 3-QADAM: Kodlar GitHub ga yuklanmoqda (git push)...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [XATOLIK] Yuklashda xatolik yuz berdi.
    echo Iltimos, GitHub login/parolingiz yoki Personal Access Token to'g'riligini tekshiring.
) else (
    echo.
    echo ======================================================================
    echo  [MUVAFFAQIYATLI] Barcha kodlar GitHub ga muvaffaqiyatli yuklandi!
    echo ======================================================================
)

echo.
pause
