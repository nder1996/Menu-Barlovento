// Configuración de la base de datos
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar a SQLite
const dbPath = path.join(__dirname, '..', 'db', 'menu.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

module.exports = db;
