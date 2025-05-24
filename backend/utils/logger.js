const fs = require('fs');
const path = require('path');

// Configuración de logging
const logFile = fs.createWriteStream(path.join(__dirname, '..', 'server.log'), { flags: 'a' });

// Función para registrar operaciones en el log
function logOperation(operation, route, data = null, result = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    route,
    data,
    result
  };
  logFile.write(JSON.stringify(logEntry) + '\n');
  console.log(`[${timestamp}] ${operation} - ${route}`);
}

// Función para registrar información
function info(message) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'INFO',
    message
  };
  logFile.write(JSON.stringify(logEntry) + '\n');
  console.log(`[${timestamp}] [INFO] ${message}`);
}

// Función para registrar errores
function error(message) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'ERROR',
    message
  };
  logFile.write(JSON.stringify(logEntry) + '\n');
  console.error(`[${timestamp}] [ERROR] ${message}`);
}

module.exports = { logOperation, info, error };
