@echo off
chcp 65001 >nul
title Vexa - Guncelleme yayinlaniyor
cd /d "%~dp0"
rem One-click release: bumps the version, builds Windows, uploads to GitHub.
rem GitHub Actions then adds the Android, iOS and macOS builds to the same release.

set "NODE=%~dp0.tools\node\node.exe"
set "PATH=%~dp0.tools\node;%LOCALAPPDATA%\Microsoft\WinGet\Links;%PATH%"
where gh >nul 2>nul || ( echo  [!] GitHub CLI bulunamadi. & pause & exit /b 1 )
where git >nul 2>nul || ( echo  [!] Git bulunamadi. & pause & exit /b 1 )
if not exist "%NODE%" ( echo  [!] .tools\node\node.exe bulunamadi. & pause & exit /b 1 )
gh auth status >nul 2>nul || ( echo  GitHub girisi gerekiyor, tarayici acilacak... & gh auth login --hostname github.com --git-protocol https --web )

echo  [1/4] Surum numarasi artiriliyor...
for /f "delims=" %%v in ('"%NODE%" scripts\bump.mjs') do set VER=%%v
echo        Yeni surum: %VER%

echo  [2/4] Kod GitHub'a gonderiliyor...
git add -A
git commit -q -m "Vexa v%VER%"
git tag v%VER%
git push -q origin HEAD --tags || ( echo  [!] Kod gonderilemedi. & pause & exit /b 1 )

echo  [3/4] Kurulum dosyasi olusturuluyor ve yayinlaniyor...
for /f "delims=" %%t in ('gh auth token') do set GH_TOKEN=%%t
set CSC_IDENTITY_AUTO_DISCOVERY=false
"%NODE%" node_modules\vite\bin\vite.js build || ( echo  [!] Derleme basarisiz. & pause & exit /b 1 )
"%NODE%" node_modules\electron-builder\cli.js --win nsis --x64 --publish always
if errorlevel 1 ( echo  [!] Yayinlama basarisiz. & pause & exit /b 1 )
set GH_TOKEN=

echo  [4/4] Bitti!
echo.
echo  Vexa v%VER% yayinda. Windows kullanicilari otomatik guncellenecek.
echo  https://github.com/tvman78/Vexa/releases
pause
