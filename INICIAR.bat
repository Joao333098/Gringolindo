@echo off
REM ======================================
REM GRINGOLINDO - Script de Inicio Windows
REM ======================================

title Gringolindo - Discord Bot Admin Panel

echo.
echo ========================================
echo   GRINGOLINDO - Iniciando Sistema
echo ========================================
echo.

REM Verificar se Python esta instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado!
    echo Instale Python: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Verificar se Node.js esta instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Python e Node.js encontrados!
echo.

REM Executar script de inicializacao
python inicia.py

pause
