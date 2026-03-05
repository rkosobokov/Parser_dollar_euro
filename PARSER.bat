@echo off
setlocal enabledelayedexpansion

set COUNT=0
set MAX_COUNT=48
set INTERVAL=1800  :: 30 minutes in seconds

:loop
if %COUNT% geq %MAX_COUNT% goto :done

echo [%DATE% %TIME%] Start (%COUNT%/48)...
call "yandex.bat"

:: Start countdown
set /a REMAINING=%INTERVAL%
echo.
echo Waiting until next run...

:countdown
set /a HOURS=!REMAINING! / 3600
set /a MINUTES=(!REMAINING! %% 3600) / 60
set /a SECONDS=!REMAINING! %% 60

:: Format with leading zeros
if !HOURS! LSS 10 set HOURS=0!HOURS!
if !MINUTES! LSS 10 set MINUTES=0!MINUTES!
if !SECONDS! LSS 10 set SECONDS=0!SECONDS!

:: Print each update on a new line (column format)
echo Remaining: !HOURS!:!MINUTES!:!SECONDS!

:: Wait 1 second
timeout /t 1 /nobreak >nul

set /a REMAINING-=1
if !REMAINING! GTR 0 goto :countdown

echo.
echo.
set /a COUNT+=1
goto :loop

:done
echo Done.
pause