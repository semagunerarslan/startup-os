@echo off
title StartUp OS - LaunchFlow Hizli Baslatici
color 0b

echo ====================================================================
echo    StartUp OS - LaunchFlow Hizli Calistirici (Sunucu Baslatiliyor)
echo ====================================================================
echo.

:: Dogrudan sunucuyu baslat
call npm start

if %errorlevel% neq 0 (
    color 0c
    echo.
    echo HATA: Sunucu baslatilamadi!
    echo Eger gereksinimler yuklenmediyse, lutfen once start.bat dosyasini calistirin.
    echo.
    pause
)
