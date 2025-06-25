#!/bin/bash

# Script Bash para ejecutar Casa Barlovento (Linux/macOS)
# Autor: Sistema de Gestión Casa Barlovento
# Fecha: 2025

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Función para mostrar el header
show_header() {
    echo -e "${CYAN}=================================================="
    echo -e "       🏖️  CASA BARLOVENTO - MENU DIGITAL  🏖️      "
    echo -e "==================================================${NC}"
    echo ""
}

# Función para verificar si Node.js está instalado
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✅ Node.js encontrado: $NODE_VERSION${NC}"
        return 0
    else
        echo -e "${RED}❌ Node.js no está instalado o no está en el PATH${NC}"
        echo -e "${YELLOW}   Por favor instala Node.js desde: https://nodejs.org/${NC}"
        return 1
    fi
}

# Función para verificar si npm está disponible
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo -e "${GREEN}✅ npm encontrado: $NPM_VERSION${NC}"
        return 0
    else
        echo -e "${RED}❌ npm no está disponible${NC}"
        return 1
    fi
}

# Función para instalar dependencias
install_dependencies() {
    echo -e "${BLUE}📦 Instalando dependencias...${NC}"
    
    # Instalar dependencias del backend
    if [ -f "package.json" ]; then
        echo -e "${CYAN}   Instalando dependencias del proyecto principal...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Error al instalar dependencias del proyecto principal${NC}"
            return 1
        fi
    fi
    
    # Instalar dependencias de Netlify Functions
    if [ -f "netlify/functions/package.json" ]; then
        echo -e "${CYAN}   Instalando dependencias de Netlify Functions...${NC}"
        cd netlify/functions
        npm install
        exit_code=$?
        cd ../..
        if [ $exit_code -ne 0 ]; then
            echo -e "${RED}❌ Error al instalar dependencias de Netlify Functions${NC}"
            return 1
        fi
    fi
    
    echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
    return 0
}

# Función para inicializar la base de datos
initialize_database() {
    echo -e "${BLUE}🗄️  Inicializando base de datos...${NC}"
    
    if [ -f "prepare-db.js" ]; then
        node prepare-db.js
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Base de datos inicializada correctamente${NC}"
            return 0
        else
            echo -e "${RED}❌ Error al inicializar la base de datos${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  Archivo prepare-db.js no encontrado${NC}"
        return 0
    fi
}

# Función para mostrar el menú de opciones
show_menu() {
    echo ""
    echo -e "${MAGENTA}🚀 ¿Qué deseas hacer?${NC}"
    echo ""
    echo -e "${WHITE}1. 🌐 Ejecutar en modo desarrollo (Netlify Dev)${NC}"
    echo -e "${WHITE}2. 🖥️  Ejecutar solo el backend (Node.js)${NC}"
    echo -e "${WHITE}3. 📦 Solo instalar dependencias${NC}"
    echo -e "${WHITE}4. 🗄️  Solo inicializar base de datos${NC}"
    echo -e "${WHITE}5. 🔧 Preparar para Netlify${NC}"
    echo -e "${WHITE}6. 📊 Ver logs del servidor${NC}"
    echo -e "${WHITE}7. 🧹 Limpiar y reinstalar todo${NC}"
    echo -e "${WHITE}8. ❌ Salir${NC}"
    echo ""
}

# Función para ejecutar en modo desarrollo con Netlify
start_netlify_dev() {
    echo -e "${BLUE}🌐 Iniciando Netlify Dev...${NC}"
    echo -e "${CYAN}   La aplicación estará disponible en: http://localhost:8888${NC}"
    echo -e "${YELLOW}   Presiona Ctrl+C para detener el servidor${NC}"
    echo ""
    
    # Verificar si netlify-cli está instalado
    if ! command -v netlify &> /dev/null; then
        echo -e "${RED}❌ Netlify CLI no está instalado${NC}"
        echo -e "${YELLOW}   Instalando Netlify CLI...${NC}"
        npm install -g netlify-cli
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Error al instalar Netlify CLI${NC}"
            return 1
        fi
    fi
    
    netlify dev
}

# Función para ejecutar solo el backend
start_backend() {
    echo -e "${BLUE}🖥️  Iniciando solo el backend...${NC}"
    echo -e "${CYAN}   El servidor estará disponible en: http://localhost:3000${NC}"
    echo -e "${YELLOW}   Presiona Ctrl+C para detener el servidor${NC}"
    echo ""
    
    if [ -f "backend/server.js" ]; then
        cd backend
        node server.js
        cd ..
    else
        echo -e "${RED}❌ Archivo backend/server.js no encontrado${NC}"
    fi
}

# Función para preparar para Netlify
prepare_netlify() {
    echo -e "${BLUE}🔧 Preparando para Netlify...${NC}"
    
    # Instalar dependencias si es necesario
    if ! install_dependencies; then
        echo -e "${RED}❌ Error al instalar dependencias${NC}"
        return 1
    fi
    
    if [ -f "prepare-netlify.js" ]; then
        node prepare-netlify.js
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Preparación para Netlify completada${NC}"
            echo -e "${CYAN}   Ahora puedes hacer deploy con: netlify deploy --prod${NC}"
        else
            echo -e "${RED}❌ Error en la preparación para Netlify${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Archivo prepare-netlify.js no encontrado${NC}"
    fi
}

# Función para ver logs
show_logs() {
    echo -e "${BLUE}📊 Logs del servidor:${NC}"
    echo ""
    
    if [ -f "server.log" ]; then
        tail -50 server.log
    elif [ -f "backend/server.log" ]; then
        tail -50 backend/server.log
    else
        echo -e "${YELLOW}⚠️  No se encontraron archivos de log${NC}"
    fi
}

# Función para limpiar y reinstalar
clean_install() {
    echo -e "${BLUE}🧹 Limpiando e instalando todo...${NC}"
    
    # Eliminar node_modules
    if [ -d "node_modules" ]; then
        echo -e "${CYAN}   Eliminando node_modules...${NC}"
        rm -rf node_modules
    fi
    
    if [ -d "netlify/functions/node_modules" ]; then
        echo -e "${CYAN}   Eliminando netlify/functions/node_modules...${NC}"
        rm -rf netlify/functions/node_modules
    fi
    
    # Reinstalar dependencias
    install_dependencies
    initialize_database
}

# Script principal
main() {
    show_header
    
    # Verificar requisitos
    if ! check_nodejs || ! check_npm; then
        echo ""
        echo -e "${RED}❌ Faltan requisitos necesarios. Por favor instálalos e intenta de nuevo.${NC}"
        read -p "Presiona Enter para salir"
        exit 1
    fi
    
    # Mostrar menú y procesar selección
    while true; do
        show_menu
        read -p "Selecciona una opción (1-8): " choice
        
        case $choice in
            1)
                if install_dependencies && initialize_database; then
                    start_netlify_dev
                fi
                ;;
            2)
                if install_dependencies && initialize_database; then
                    start_backend
                fi
                ;;
            3)
                install_dependencies
                read -p "Presiona Enter para continuar"
                ;;
            4)
                initialize_database
                read -p "Presiona Enter para continuar"
                ;;
            5)
                prepare_netlify
                read -p "Presiona Enter para continuar"
                ;;
            6)
                show_logs
                read -p "Presiona Enter para continuar"
                ;;
            7)
                clean_install
                read -p "Presiona Enter para continuar"
                ;;
            8)
                echo -e "${GREEN}👋 ¡Hasta luego!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Opción inválida. Por favor selecciona un número del 1 al 8.${NC}"
                sleep 2
                ;;
        esac
    done
}

# Hacer el script ejecutable y ejecutar
chmod +x "$0"
main
