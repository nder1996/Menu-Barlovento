// Función para inicializar la base de datos en Netlify
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const os = require('os');

// Definir las rutas de la base de datos y su respaldo
const sourceDbPath = path.join(__dirname, '../../backend/db/menu.db');
const netlifyDbPath = path.join(os.tmpdir(), 'menu.db');

// Función para copiar la base de datos al directorio temporal
const copyDatabaseFile = () => {
  try {
    console.log('Copiando base de datos al directorio temporal...');
    fs.copyFileSync(sourceDbPath, netlifyDbPath);
    console.log('Base de datos copiada correctamente:', netlifyDbPath);
    return true;
  } catch (error) {
    console.error('Error al copiar la base de datos:', error);
    return false;
  }
};

// Función para crear un esquema básico si no hay base de datos de origen
const createBasicSchema = () => {
  return new Promise((resolve, reject) => {
    console.log('Creando esquema básico de base de datos...');
    const db = new sqlite3.Database(netlifyDbPath, (err) => {
      if (err) return reject(err);
      
      db.serialize(() => {
        // Crear tablas basadas en tu esquema existente
        db.run(`CREATE TABLE IF NOT EXISTS categoria (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          imagen TEXT
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS menu (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          descripcion TEXT,
          precio REAL NOT NULL,
          categoriaId INTEGER,
          imagen TEXT,
          FOREIGN KEY (categoriaId) REFERENCES categoria(id)
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS pedido (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          mesa INTEGER,
          total REAL,
          estado TEXT DEFAULT 'pendiente'
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS detallePedido (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pedidoId INTEGER,
          menuId INTEGER,
          cantidad INTEGER,
          precio REAL,
          FOREIGN KEY (pedidoId) REFERENCES pedido(id),
          FOREIGN KEY (menuId) REFERENCES menu(id)
        )`, (err) => {
          if (err) {
            db.close();
            reject(err);
          } else {
            db.close();
            resolve();
          }
        });
      });
    });
  });
};

// Función para inicializar la base de datos
exports.handler = async (event, context) => {
  try {
    // Intentar copiar la base de datos existente
    const copied = copyDatabaseFile();
    
    // Si no se pudo copiar, crear un esquema básico
    if (!copied) {
      await createBasicSchema();
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Base de datos inicializada correctamente',
        location: netlifyDbPath
      })
    };
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Error al inicializar la base de datos',
        details: error.message
      })
    };
  }
};
