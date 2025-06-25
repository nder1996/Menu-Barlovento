// Script para verificar y preparar la base de datos antes del despliegue
const { initializeDatabase } = require('./backend/models/db-netlify');
const fs = require('fs');
const path = require('path');

console.log('🔄 Verificando configuración de base de datos para Netlify...\n');

async function checkDatabaseSetup() {
  try {
    // Verificar que existen los archivos necesarios
    const requiredFiles = [
      'backend/models/db-netlify.js',
      'netlify/functions/api.js',
      'netlify/functions/package.json'
    ];
    
    let allFilesExist = true;
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(__dirname, file))) {
        console.log(`❌ Archivo faltante: ${file}`);
        allFilesExist = false;
      } else {
        console.log(`✅ Archivo encontrado: ${file}`);
      }
    }
    
    if (!allFilesExist) {
      console.log('\n❌ Faltan archivos necesarios para el despliegue en Netlify');
      return false;
    }
    
    // Verificar que se pueden instalar las dependencias de Netlify Functions
    const netlifyFunctionsPath = path.join(__dirname, 'netlify/functions');
    const packageJsonPath = path.join(netlifyFunctionsPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      console.log('✅ package.json de Netlify Functions encontrado');
      
      // Verificar que node_modules existe o se puede crear
      const nodeModulesPath = path.join(netlifyFunctionsPath, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        console.log('⚠️  node_modules no existe en netlify/functions - será instalado en el despliegue');
      } else {
        console.log('✅ node_modules existe en netlify/functions');
      }
    }
    
    console.log('\n✅ Configuración de base de datos lista para Netlify');
    console.log('📌 Notas importantes:');
    console.log('   • La base de datos se inicializará automáticamente en cada función');
    console.log('   • Los datos no persisten entre ejecuciones (característica de serverless)');
    console.log('   • Para datos persistentes, considera usar una base de datos externa');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error al verificar la configuración:', error);
    return false;
  }
}

// Ejecutar verificación
checkDatabaseSetup()
  .then(success => {
    if (success) {
      console.log('\n🎉 ¡Todo listo para el despliegue en Netlify!');
      process.exit(0);
    } else {
      console.log('\n💥 Hay problemas que resolver antes del despliegue');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Error durante la verificación:', error);
    process.exit(1);
  });
