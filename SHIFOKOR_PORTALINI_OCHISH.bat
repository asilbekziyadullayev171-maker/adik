@echo off
chcp 65001 >nul
title QishloqMed - Shifokor Telemeditsina Portali
cls
echo ======================================================================
echo          QishloqMed - Shifokor Telemeditsina Portali
echo ======================================================================
echo.
echo Brauzer avtomatik ochilmoqda: http://localhost:3001/
echo.

start http://localhost:3001/

cd /d "%~dp0doctor-web"
npm run dev -- --host 0.0.0.0 --port 3001
pause
