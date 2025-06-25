// Este script se ejecuta en la fase de construcción de Netlify para copiar la base de datos
const fs = require('fs');
const path = require('path');

console.log('📦 Preparando base de datos SQLite para despliegue en Netlify...');

// Definir las rutas de origen y destino
const sourceDbPath = path.join(__dirname, 'backend', 'db', 'menu.db');
const destDir = path.join(__dirname, 'netlify', 'functions', 'db');
const destDbPath = path.join(destDir, 'menu.db');

// Crear el directorio de destino si no existe
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`✅ Directorio ${destDir} creado`);
}

// Copiar la base de datos
try {
  if (fs.existsSync(sourceDbPath)) {
    fs.copyFileSync(sourceDbPath, destDbPath);
    console.log('✅ Base de datos SQLite copiada correctamente para las funciones de Netlify');
  } else {
    console.error('❌ No se encontró la base de datos en:', sourceDbPath);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error al copiar la base de datos:', error);
  process.exit(1);
}
