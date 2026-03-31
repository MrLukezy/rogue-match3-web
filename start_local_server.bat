@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"

set "PORT=8765"

for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /R /C:"IPv4.*:"') do (
    set "IP=%%A"
    goto :ip_found
)

:ip_found
if defined IP set "IP=%IP: =%"
if not defined IP set "IP=127.0.0.1"

echo ==========================================
echo   Rogue Match3 Local Server
echo ==========================================
echo.
echo Project directory: %cd%
echo Local address:     http://127.0.0.1:%PORT%/
echo LAN address:       http://%IP%:%PORT%/
echo.
echo Tips:
echo 1. Keep this window open while playing.
echo 2. Other devices on the same LAN can open the LAN address.
echo 3. If Windows Firewall prompts, allow Python on private networks.
echo.
echo Starting server...
echo.

python -m http.server %PORT% --bind 0.0.0.0

echo.
echo Server stopped.
pause
