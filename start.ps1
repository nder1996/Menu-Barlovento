# Script PowerShell para ejecutar Casa Barlovento
# Autor: Sistema de Gestión Casa Barlovento
# Fecha: 2025

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       🏖️  CASA BARLOVENTO - MENU DIGITAL  🏖️      " -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar si Node.js está instalado
function Test-NodeJs {
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "❌ Node.js no está instalado o no está en el PATH" -ForegroundColor Red
        Write-Host "   Por favor instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
        return $false
    }
}

# Función para verificar si npm está disponible
function Test-Npm {
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "❌ npm no está disponible" -ForegroundColor Red
        return $false
    }
}

# Función para instalar dependencias
function Install-Dependencies {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Blue
    
    # Instalar dependencias del backend
    if (Test-Path ".\package.json") {
        Write-Host "   Instalando dependencias del proyecto principal..." -ForegroundColor Cyan
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error al instalar dependencias del proyecto principal" -ForegroundColor Red
            return $false
        }
    }
    
    # Instalar dependencias de Netlify Functions
    if (Test-Path ".\netlify\functions\package.json") {
        Write-Host "   Instalando dependencias de Netlify Functions..." -ForegroundColor Cyan
        Push-Location ".\netlify\functions"
        npm install
        $exitCode = $LASTEXITCODE
        Pop-Location
        if ($exitCode -ne 0) {
            Write-Host "❌ Error al instalar dependencias de Netlify Functions" -ForegroundColor Red
            return $false
        }
    }
    
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
    return $true
}

# Función para inicializar la base de datos
function Initialize-Database {
    Write-Host "🗄️  Inicializando base de datos..." -ForegroundColor Blue
    
    if (Test-Path ".\prepare-db.js") {
        node .\prepare-db.js
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Base de datos inicializada correctamente" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Error al inicializar la base de datos" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "⚠️  Archivo prepare-db.js no encontrado" -ForegroundColor Yellow
        return $true
    }
}

# Función para mostrar el menú de opciones
function Show-Menu {
    Write-Host ""
    Write-Host "🚀 ¿Qué deseas hacer?" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "1. 🌐 Ejecutar en modo desarrollo (Netlify Dev)" -ForegroundColor White
    Write-Host "2. 🖥️  Ejecutar solo el backend (Node.js)" -ForegroundColor White
    Write-Host "3. 📦 Solo instalar dependencias" -ForegroundColor White
    Write-Host "4. 🗄️  Solo inicializar base de datos" -ForegroundColor White
    Write-Host "5. 🔧 Preparar para Netlify" -ForegroundColor White
    Write-Host "6. 📊 Ver logs del servidor" -ForegroundColor White
    Write-Host "7. 🧹 Limpiar y reinstalar todo" -ForegroundColor White
    Write-Host "8. ❌ Salir" -ForegroundColor White
    Write-Host ""
}

# Función para ejecutar en modo desarrollo con Netlify
function Start-NetlifyDev {
    Write-Host "🌐 Iniciando Netlify Dev..." -ForegroundColor Blue
    Write-Host "   La aplicación estará disponible en: http://localhost:8888" -ForegroundColor Cyan
    Write-Host "   Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
    Write-Host ""
    
    # Verificar si netlify-cli está instalado
    try {
        netlify --version 2>$null | Out-Null
    }
    catch {
        Write-Host "❌ Netlify CLI no está instalado" -ForegroundColor Red
        Write-Host "   Instalando Netlify CLI..." -ForegroundColor Yellow
        npm install -g netlify-cli
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error al instalar Netlify CLI" -ForegroundColor Red
            return
        }
    }
    
    netlify dev
}

# Función para ejecutar solo el backend
function Start-Backend {
    Write-Host "🖥️  Iniciando solo el backend..." -ForegroundColor Blue
    Write-Host "   El servidor estará disponible en: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
    Write-Host ""
    
    if (Test-Path ".\backend\server.js") {
        Push-Location ".\backend"
        node server.js
        Pop-Location
    } else {
        Write-Host "❌ Archivo backend/server.js no encontrado" -ForegroundColor Red
    }
}

# Función para preparar para Netlify
function Prepare-Netlify {
    Write-Host "🔧 Preparando para Netlify..." -ForegroundColor Blue
    
    if (Test-Path ".\prepare-netlify.js") {
        node .\prepare-netlify.js
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Preparación para Netlify completada" -ForegroundColor Green
        } else {
            Write-Host "❌ Error en la preparación para Netlify" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  Archivo prepare-netlify.js no encontrado" -ForegroundColor Yellow
    }
}

# Función para ver logs
function Show-Logs {
    Write-Host "📊 Logs del servidor:" -ForegroundColor Blue
    Write-Host ""
    
    if (Test-Path ".\server.log") {
        Get-Content ".\server.log" -Tail 50
    } elseif (Test-Path ".\backend\server.log") {
        Get-Content ".\backend\server.log" -Tail 50
    } else {
        Write-Host "⚠️  No se encontraron archivos de log" -ForegroundColor Yellow
    }
}

# Función para limpiar y reinstalar
function Clean-Install {
    Write-Host "🧹 Limpiando e instalando todo..." -ForegroundColor Blue
    
    # Eliminar node_modules
    if (Test-Path ".\node_modules") {
        Write-Host "   Eliminando node_modules..." -ForegroundColor Cyan
        Remove-Item ".\node_modules" -Recurse -Force
    }
    
    if (Test-Path ".\netlify\functions\node_modules") {
        Write-Host "   Eliminando netlify/functions/node_modules..." -ForegroundColor Cyan
        Remove-Item ".\netlify\functions\node_modules" -Recurse -Force
    }
    
    # Reinstalar dependencias
    Install-Dependencies
    Initialize-Database
}

# Script principal
function Main {
    # Verificar requisitos
    if (-not (Test-NodeJs) -or -not (Test-Npm)) {
        Write-Host ""
        Write-Host "❌ Faltan requisitos necesarios. Por favor instálalos e intenta de nuevo." -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    
    # Mostrar menú y procesar selección
    while ($true) {
        Show-Menu
        $choice = Read-Host "Selecciona una opción (1-8)"
        
        switch ($choice) {
            "1" {
                if ((Install-Dependencies) -and (Initialize-Database)) {
                    Start-NetlifyDev
                }
                break
            }
            "2" {
                if ((Install-Dependencies) -and (Initialize-Database)) {
                    Start-Backend
                }
                break
            }
            "3" {
                Install-Dependencies
                break
            }
            "4" {
                Initialize-Database
                break
            }
            "5" {
                Prepare-Netlify
                break
            }
            "6" {
                Show-Logs
                Read-Host "Presiona Enter para continuar"
                break
            }
            "7" {
                Clean-Install
                break
            }
            "8" {
                Write-Host "👋 ¡Hasta luego!" -ForegroundColor Green
                exit 0
            }
            default {
                Write-Host "❌ Opción inválida. Por favor selecciona un número del 1 al 8." -ForegroundColor Red
                Start-Sleep -Seconds 2
            }
        }
    }
}

# Ejecutar el script principal
Main
