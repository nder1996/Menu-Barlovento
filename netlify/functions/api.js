// Esta función maneja las llamadas a la API en Netlify utilizando SQLite directamente
const serverless = require('serverless-http');

// Configurar variable de entorno para indicar que estamos en Netlify
process.env.NETLIFY = 'true';

// Importar la aplicación del servidor
const app = require('../../backend/server');

// Crear el handler para Netlify
const handler = serverless(app);

// Exportar el handler
exports.handler = handler;