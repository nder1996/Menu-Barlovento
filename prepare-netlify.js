/* 
* Script para preparar el proyecto para despliegue en Netlify
*/

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Preparando proyecto para despliegue en Netlify...\n');

// Asegurarse de que exista el directorio netlify/functions
const netlifyFunctionsDir = path.join(__dirname, 'netlify', 'functions');
if (!fs.existsSync(netlifyFunctionsDir)) {
  fs.mkdirSync(netlifyFunctionsDir, { recursive: true });
  console.log('✅ Directorio netlify/functions creado');
} else {
  console.log('✅ Directorio netlify/functions ya existe');
}

// Comprobar si existe el archivo netlify.toml
const netlifyTomlPath = path.join(__dirname, 'netlify.toml');
if (!fs.existsSync(netlifyTomlPath)) {
  console.log('❌ No se encontró netlify.toml. Creando archivo de configuración básico...');
  
  const configContent = `[build]
  publish = "frontend/public"
  command = "echo No build command needed"

[dev]
  command = "npm start"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"`;
  
  fs.writeFileSync(netlifyTomlPath, configContent);
  console.log('✅ Archivo netlify.toml creado');
} else {
  console.log('✅ Archivo netlify.toml ya existe');
}

// Verificar que existe la función API
const apiFunctionPath = path.join(netlifyFunctionsDir, 'api.js');
if (!fs.existsSync(apiFunctionPath)) {
  console.log('❌ No se encontró la función API. Creando archivo de función básico...');
  
  const apiFunctionContent = `// Esta función maneja las llamadas a la API en Netlify
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Configura el origen de tu API
  const API_ORIGIN = process.env.API_ENDPOINT || 'http://localhost:3000';
  
  try {
    // Extraer información de la solicitud
    const path = event.path.replace('/.netlify/functions/api/', '');
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};
    const queryParams = event.queryStringParameters || {};
    
    // Construir la URL completa para reenviar la solicitud
    let url = \`\${API_ORIGIN}/\${path}\`;
    const queryString = new URLSearchParams(queryParams).toString();
    if (queryString) {
      url += \`?\${queryString}\`;
    }
    
    // Configurar opciones para la solicitud fetch
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...event.headers
      }
    };
    
    // Agregar body para métodos POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    // Realizar la solicitud y esperar la respuesta
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    // Devolver la respuesta al cliente
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    // Manejar errores
    console.error('Error en API function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor', details: error.message })
    };
  }
};`;
  
  fs.writeFileSync(apiFunctionPath, apiFunctionContent);
  console.log('✅ Archivo de función API creado');
} else {
  console.log('✅ Archivo de función API ya existe');
}

// Verificar que existe el archivo _redirects en frontend/public
const redirectsPath = path.join(__dirname, 'frontend', 'public', '_redirects');
if (!fs.existsSync(redirectsPath)) {
  console.log('❌ No se encontró el archivo _redirects. Creando archivo de redirecciones básico...');
  
  const redirectsContent = `# Redirige las llamadas a la API a las funciones de Netlify
/api/*  /.netlify/functions/api/:splat  200

# Redirige todas las demás rutas no encontradas a index.html para SPA routing
/*    /index.html   200`;
  
  fs.writeFileSync(redirectsPath, redirectsContent);
  console.log('✅ Archivo _redirects creado');
} else {
  console.log('✅ Archivo _redirects ya existe');
}

// Verificar si .env existe
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ No se encontró el archivo .env. Creando archivo de variables de entorno básico...');
  
  const envContent = `# Variables de entorno para desarrollo local con Netlify Dev
API_ENDPOINT=http://localhost:3000`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env creado');
} else {
  console.log('✅ Archivo .env ya existe');
}

// Verificar si netlify-cli está instalado
try {
  console.log('🔍 Verificando si netlify-cli está instalado...');
  execSync('npx netlify --version', { stdio: 'ignore' });
  console.log('✅ netlify-cli está disponible');
} catch (error) {
  console.log('❌ netlify-cli no está instalado. Se recomienda instalarlo:');
  console.log('   npm install -g netlify-cli');
  console.log('   o');
  console.log('   npm install netlify-cli --save-dev');
}

// Instalar dependencias para las funciones de Netlify
console.log('\n📦 Instalando dependencias para las funciones de Netlify...');
try {
  process.chdir(path.join(__dirname, 'netlify', 'functions'));
  execSync('npm install', { stdio: 'inherit' });
  process.chdir(__dirname);
  console.log('✅ Dependencias instaladas correctamente');
} catch (error) {
  console.error('❌ Error al instalar dependencias:', error.message);
  process.chdir(__dirname);
}

console.log('\n✅ Proyecto preparado para despliegue en Netlify');
console.log('\n📋 Pasos para desplegar en Netlify:');
console.log('1️⃣  Ejecuta: npx netlify login');
console.log('2️⃣  Ejecuta: npx netlify init');
console.log('3️⃣  Sigue las instrucciones para vincular tu repositorio');
console.log('4️⃣  Ejecuta: npx netlify deploy --prod\n');
console.log('🧪 Para probar localmente el sitio:');
console.log('   npx netlify dev\n');
console.log('💡 Nota: Esta configuración utiliza SQLite dentro de las funciones Netlify.');
console.log('   Ten en cuenta que la base de datos se creará en un directorio temporal');
console.log('   y los datos no persistirán entre ejecuciones de función.');
