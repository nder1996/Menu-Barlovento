// Configuración de base de datos para entorno Netlify
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const os = require('os');

// Crear función para obtener la conexión de base de datos
function getDatabase() {
  return new Promise((resolve, reject) => {
    let dbPath;
    
    if (process.env.NETLIFY) {
      // En Netlify, usar directorio temporal
      dbPath = path.join(os.tmpdir(), 'menu.db');
      
      // Verificar si la BD ya existe en tmp
      if (!fs.existsSync(dbPath)) {
        console.log('Inicializando base de datos en Netlify...');
        initializeDatabase(dbPath)
          .then(() => {
            const db = new sqlite3.Database(dbPath);
            resolve(db);
          })
          .catch(reject);
      } else {
        const db = new sqlite3.Database(dbPath);
        resolve(db);
      }
    } else {
      // En desarrollo local, usar ruta normal
      dbPath = path.join(__dirname, '..', 'db', 'menu.db');
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) reject(err);
        else resolve(db);
      });
    }
  });
}

// Función para inicializar la base de datos con esquema y datos
async function initializeDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      
      console.log('Creando esquema de base de datos...');
      
      db.serialize(() => {
        // Crear tablas
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
        )`, async (err) => {
          if (err) {
            db.close();
            return reject(err);
          }
          
          // Insertar datos iniciales
          await insertInitialData(db);
          db.close();
          resolve();
        });
      });
    });
  });
}

// Función para insertar datos iniciales
function insertInitialData(db) {
  return new Promise((resolve, reject) => {
    console.log('Insertando datos iniciales...');
    
    // Verificar si ya hay datos
    db.get("SELECT COUNT(*) as count FROM categoria", (err, row) => {
      if (err) return reject(err);
      
      if (row.count > 0) {
        console.log('Los datos ya existen, omitiendo inserción inicial');
        return resolve();
      }
      
      // Insertar categorías
      const categorias = [
        { nombre: 'Especialidades', imagen: '/assets/img/categoria_especialidades.webp' },
        { nombre: 'Mariscos', imagen: '/assets/img/categoria_mariscos.webp' },
        { nombre: 'Pescado', imagen: '/assets/img/categoria_pescado.webp' },
        { nombre: 'Saludable', imagen: '/assets/img/categoria_saludable.webp' },
        { nombre: 'Bebidas', imagen: '/assets/img/categoria_bebida.webp' },
        { nombre: 'Acompañamientos', imagen: '/assets/img/categoria_aconpañamientos.webp' }
      ];
      
      db.serialize(() => {
        const stmtCategoria = db.prepare("INSERT INTO categoria (nombre, imagen) VALUES (?, ?)");
        categorias.forEach(cat => {
          stmtCategoria.run(cat.nombre, cat.imagen);
        });
        stmtCategoria.finalize();
        
        // Insertar algunos elementos de menú de ejemplo
        const menuItems = [
          { nombre: 'Paella Valenciana', descripcion: 'Arroz con mariscos frescos', precio: 25.99, categoriaId: 1 },
          { nombre: 'Camarones al Ajillo', descripcion: 'Camarones en salsa de ajo', precio: 18.50, categoriaId: 2 },
          { nombre: 'Pescado a la Plancha', descripcion: 'Pescado fresco del día', precio: 22.00, categoriaId: 3 },
          { nombre: 'Ensalada Mediterránea', descripcion: 'Ensalada fresca con aceite de oliva', precio: 12.50, categoriaId: 4 },
          { nombre: 'Sangría de la Casa', descripcion: 'Bebida refrescante de frutas', precio: 8.00, categoriaId: 5 },
          { nombre: 'Patatas Bravas', descripcion: 'Patatas con salsa picante', precio: 6.50, categoriaId: 6 }
        ];
        
        const stmtMenu = db.prepare("INSERT INTO menu (nombre, descripcion, precio, categoriaId) VALUES (?, ?, ?, ?)");
        menuItems.forEach(item => {
          stmtMenu.run(item.nombre, item.descripcion, item.precio, item.categoriaId);
        });
        stmtMenu.finalize(() => {
          console.log('Datos iniciales insertados correctamente');
          resolve();
        });
      });
    });
  });
}

module.exports = {
  getDatabase,
  initializeDatabase
};
