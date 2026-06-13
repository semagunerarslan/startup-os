@echo off
title StartUp OS - LaunchFlow Otomatik Kurulum ve Baslatici
color 0a

echo ====================================================================
echo    StartUp OS - LaunchFlow Proje Yonetim Yazilimi Baslaticisi
echo ====================================================================
echo.

:: Node.js kurulu mu kontrol et
node -v >nul 2>&1
if %errorlevel% equ 0 (
    echo [+] Node.js zaten yuklu.
    goto check_modules
)

:: Node.js yuklu degilse indir ve kur
color 0b
echo [-] Node.js sisteminizde bulunamadi!
echo [!] Node.js resmi sunucularindan otomatik indiriliyor...
echo [i] Bu islem internet hiziniza bagli olarak 1-2 dakika surebilir, lutfen bekleyin...
echo.

:: PowerShell ile MSI indir
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.15.0/node-v20.15.0-x64.msi' -OutFile 'node_installer.msi'"

if not exist node_installer.msi (
    color 0c
    echo HATA: Node.js indirilemedi. Lutfen internet baglantinizi kontrol edin.
    echo.
    pause
    exit /b
)

echo [+] Indirme tamamlandi.
echo [!] Node.js arka planda otomatik kuruluyor (Tiklama gerektirmez)...
echo [i] Lutfen ekraniniza gelecek olan yonetici onayina (Evet/Yes) tiklayin.
echo.

:: MSI yukleyiciyi pasif modda baslat (Kullanici tiklamasi gerektirmez, sadece ilerleme cubugu gosterir)
msiexec /i node_installer.msi /passive /norestart
del node_installer.msi

:: PATH degiskenini guncelle (pencereyi kapatmadan kullanabilmek icin)
set "PATH=%PATH%;C:\Program Files\nodejs\;C:\Program Files (x86)\nodejs\"

:: Tekrar kontrol et
node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0c
    echo HATA: Node.js kuruldu ancak sistem tarafindan hala algilanamadi.
    echo Lutfen bu pencereyi kapatip start.bat dosyasini tekrar calistirin.
    echo.
    pause
    exit /b
)

color 0a
echo [+] Node.js basariyla kuruldu ve etkinlestirildi!
echo.

:check_modules
echo [+] Gereksinimler kontrol ediliyor...
echo.

:: node_modules klasoru yoksa kurulum yap
if not exist node_modules (
    echo [i] Bagimli paketler yukleniyor [npm install]...
    echo [i] Bu islem ilk seferde biraz zaman alabilir...
    call npm install
) else (
    echo [+] Bagimli paketler [node_modules] zaten mevcut.
)

echo.
echo ====================================================================
echo    Sunucu Baslatiliyor... (Tarayiciniz otomatik acilacaktir)
echo ====================================================================
echo.

:: lite-server sunucusunu baslat
call npm start

pause
