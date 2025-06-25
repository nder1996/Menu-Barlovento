# Scripts de Ejecución - Casa Barlovento

Este directorio contiene scripts ejecutores para facilitar el desarrollo y despliegue de la aplicación Casa Barlovento.

## 🚀 Scripts Disponibles

### Windows

#### PowerShell (`start.ps1`)
```powershell
# Ejecutar con PowerShell
.\start.ps1
```

#### Batch (`start.bat`)
```cmd
# Ejecutar con Command Prompt
start.bat
```

### Linux/macOS

#### Bash (`start.sh`)
```bash
# Hacer ejecutable y ejecutar
chmod +x start.sh
./start.sh
```

## 📋 Funcionalidades

Todos los scripts incluyen las siguientes opciones:

1. **🌐 Ejecutar en modo desarrollo (Netlify Dev)**
   - Instala dependencias automáticamente
   - Inicializa la base de datos
   - Ejecuta `netlify dev` para desarrollo local
   - Disponible en: `http://localhost:8888`

2. **🖥️ Ejecutar solo el backend (Node.js)**
   - Instala dependencias automáticamente
   - Inicializa la base de datos
   - Ejecuta solo el servidor backend
   - Disponible en: `http://localhost:3000`

3. **📦 Solo instalar dependencias**
   - Instala dependencias del proyecto principal
   - Instala dependencias de Netlify Functions

4. **🗄️ Solo inicializar base de datos**
   - Ejecuta el script `prepare-db.js`
   - Configura la base de datos SQLite

5. **🔧 Preparar para Netlify**
   - Ejecuta el script `prepare-netlify.js`
   - Prepara el proyecto para despliegue

6. **📊 Ver logs del servidor**
   - Muestra los últimos logs del servidor
   - Útil para debugging

7. **🧹 Limpiar y reinstalar todo**
   - Elimina `node_modules`
   - Reinstala todas las dependencias
   - Reinicializa la base de datos

8. **❌ Salir**
   - Cierra el script

## 🔧 Requisitos Previos

- **Node.js** (versión 14 o superior)
- **npm** (incluido con Node.js)
- **Netlify CLI** (se instala automáticamente si no está presente)

## 🎯 Uso Recomendado

### Para Desarrollo Local
```bash
# Opción 1: Modo desarrollo completo con Netlify
./start.sh  # y seleccionar opción 1
```

### Para Testing del Backend
```bash
# Opción 2: Solo backend
./start.sh  # y seleccionar opción 2
```

### Para Despliegue
```bash
# Preparar para Netlify
./start.sh  # y seleccionar opción 5
```

## 🐛 Troubleshooting

### Error: "Node.js no está instalado"
- Descargar e instalar Node.js desde: https://nodejs.org/
- Reiniciar la terminal después de la instalación

### Error: "Netlify CLI no está instalado"
- El script intentará instalarlo automáticamente
- Si falla, ejecutar manualmente: `npm install -g netlify-cli`

### Error: "Puerto en uso"
- Verificar que no haya otros procesos ejecutándose en los puertos 3000 o 8888
- Cerrar otras instancias de la aplicación

### Error de permisos (Linux/macOS)
```bash
chmod +x start.sh
```

## 📁 Estructura de Archivos

```
Menu-Barlovento/
├── start.ps1          # Script PowerShell para Windows
├── start.bat          # Script Batch para Windows
├── start.sh           # Script Bash para Linux/macOS
├── package.json       # Dependencias principales
├── prepare-db.js      # Script de inicialización de DB
├── prepare-netlify.js # Script de preparación para Netlify
└── netlify/
    └── functions/
        └── package.json # Dependencias de Netlify Functions
```

## 🌟 Características Especiales

- **Verificación automática de requisitos**
- **Instalación automática de dependencias**
- **Colores y emojis para mejor UX**
- **Manejo de errores robusto**
- **Compatible con múltiples plataformas**
- **Logs informativos**
- **Menú interactivo**

## 📞 Soporte

Si encuentras algún problema con los scripts, verifica:

1. Que Node.js esté instalado y en el PATH
2. Que tengas permisos de escritura en el directorio
3. Que no haya conflictos de puertos
4. Que la estructura de archivos sea correcta

---

*Scripts creados para facilitar el desarrollo de Casa Barlovento - Sistema de Gestión de Menú Digital* 🏖️
