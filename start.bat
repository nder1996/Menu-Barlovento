@echo off
REM Script Batch para ejecutar Casa Barlovento
REM Autor: Sistema de Gestión Casa Barlovento
REM Fecha: 2025

title Casa Barlovento - Menu Digital
color 0B

echo ==================================================
echo        🏖️  CASA BARLOVENTO - MENU DIGITAL  🏖️     
echo ==================================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado o no está en el PATH
    echo    Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js encontrado: %NODE_VERSION%
)

REM Verificar si npm está disponible
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm no está disponible
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm encontrado: %NPM_VERSION%
)

:MENU
echo.
echo 🚀 ¿Qué deseas hacer?
echo.
echo 1. 🌐 Ejecutar en modo desarrollo (Netlify Dev)
echo 2. 🖥️  Ejecutar solo el backend (Node.js)
echo 3. 📦 Solo instalar dependencias
echo 4. 🗄️  Solo inicializar base de datos
echo 5. 🔧 Preparar para Netlify
echo 6. 📊 Ver logs del servidor
echo 7. 🧹 Limpiar y reinstalar todo
echo 8. ❌ Salir
echo.

set /p choice="Selecciona una opción (1-8): "

if "%choice%"=="1" goto NETLIFY_DEV
if "%choice%"=="2" goto BACKEND_ONLY
if "%choice%"=="3" goto INSTALL_DEPS
if "%choice%"=="4" goto INIT_DB
if "%choice%"=="5" goto PREPARE_NETLIFY
if "%choice%"=="6" goto SHOW_LOGS
if "%choice%"=="7" goto CLEAN_INSTALL
if "%choice%"=="8" goto EXIT
echo ❌ Opción inválida. Por favor selecciona un número del 1 al 8.
timeout /t 2 >nul
goto MENU

:INSTALL_DEPS
echo 📦 Instalando dependencias...
if exist "package.json" (
    echo    Instalando dependencias del proyecto principal...
    call npm install
    if errorlevel 1 (
        echo ❌ Error al instalar dependencias del proyecto principal
        pause
        goto MENU
    )
)

if exist "netlify\functions\package.json" (
    echo    Instalando dependencias de Netlify Functions...
    cd netlify\functions
    call npm install
    if errorlevel 1 (
        echo ❌ Error al instalar dependencias de Netlify Functions
        cd ..\..
        pause
        goto MENU
    )
    cd ..\..
)

echo ✅ Dependencias instaladas correctamente
pause
goto MENU

:INIT_DB
echo 🗄️  Inicializando base de datos...
if exist "prepare-db.js" (
    node prepare-db.js
    if errorlevel 1 (
        echo ❌ Error al inicializar la base de datos
        pause
        goto MENU
    ) else (
        echo ✅ Base de datos inicializada correctamente
    )
) else (
    echo ⚠️  Archivo prepare-db.js no encontrado
)
pause
goto MENU

:NETLIFY_DEV
call :INSTALL_DEPS_QUIET
call :INIT_DB_QUIET
echo 🌐 Iniciando Netlify Dev...
echo    La aplicación estará disponible en: http://localhost:8888
echo    Presiona Ctrl+C para detener el servidor
echo.

REM Verificar si netlify-cli está instalado
netlify --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Netlify CLI no está instalado
    echo    Instalando Netlify CLI...
    call npm install -g netlify-cli
    if errorlevel 1 (
        echo ❌ Error al instalar Netlify CLI
        pause
        goto MENU
    )
)

netlify dev
goto MENU

:BACKEND_ONLY
call :INSTALL_DEPS_QUIET
call :INIT_DB_QUIET
echo 🖥️  Iniciando solo el backend...
echo    El servidor estará disponible en: http://localhost:3000
echo    Presiona Ctrl+C para detener el servidor
echo.

if exist "backend\server.js" (
    cd backend
    node server.js
    cd ..
) else (
    echo ❌ Archivo backend\server.js no encontrado
    pause
)
goto MENU

:PREPARE_NETLIFY
echo 🔧 Preparando para Netlify...
if exist "prepare-netlify.js" (
    node prepare-netlify.js
    if errorlevel 1 (
        echo ❌ Error en la preparación para Netlify
    ) else (
        echo ✅ Preparación para Netlify completada
    )
) else (
    echo ⚠️  Archivo prepare-netlify.js no encontrado
)
pause
goto MENU

:SHOW_LOGS
echo 📊 Logs del servidor:
echo.
if exist "server.log" (
    type server.log
) else if exist "backend\server.log" (
    type backend\server.log
) else (
    echo ⚠️  No se encontraron archivos de log
)
pause
goto MENU

:CLEAN_INSTALL
echo 🧹 Limpiando e instalando todo...
if exist "node_modules" (
    echo    Eliminando node_modules...
    rmdir /s /q node_modules
)
if exist "netlify\functions\node_modules" (
    echo    Eliminando netlify\functions\node_modules...
    rmdir /s /q netlify\functions\node_modules
)
call :INSTALL_DEPS_QUIET
call :INIT_DB_QUIET
goto MENU

:INSTALL_DEPS_QUIET
if exist "package.json" (
    call npm install >nul 2>&1
)
if exist "netlify\functions\package.json" (
    cd netlify\functions
    call npm install >nul 2>&1
    cd ..\..
)
exit /b

:INIT_DB_QUIET
if exist "prepare-db.js" (
    node prepare-db.js >nul 2>&1
)
exit /b

:EXIT
echo 👋 ¡Hasta luego!
timeout /t 2 >nul
exit /b 0
