@echo off
echo Detecting MongoDB Version...
set DB_PATH=%TEMP%\mongo_data_27019
if not exist "%DB_PATH%" mkdir "%DB_PATH%"
if exist "%DB_PATH%\mongod.lock" del "%DB_PATH%\mongod.lock"

set MONGO_BIN=
if exist "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" set MONGO_BIN="C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" set MONGO_BIN="C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" set MONGO_BIN="C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
if exist "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" set MONGO_BIN="C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe"
if exist "C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe" set MONGO_BIN="C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe"
if exist "C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" set MONGO_BIN="C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe"
if exist "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" set MONGO_BIN="C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"

if "%MONGO_BIN%"=="" (
    echo.
    echo ERROR: Could not find MongoDB installed in C:\Program Files\MongoDB\Server.
    echo Please verify your installation.
    pause
    exit /b
)

echo Found MongoDB at: %MONGO_BIN%
echo Starting on Port 27019...
%MONGO_BIN% --dbpath "%DB_PATH%" --port 27019 --bind_ip 127.0.0.1
pause
