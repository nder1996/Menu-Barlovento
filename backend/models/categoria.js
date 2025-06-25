// Modelo para la tabla CATEGORIA
const { getDatabase } = require('./db-netlify');

class Categoria {
  static async getAll(callback) {
    try {
      const db = await getDatabase();
      db.all('SELECT * FROM categoria', [], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  static async getById(id, callback) {
    try {
      const db = await getDatabase();
      db.get('SELECT * FROM categoria WHERE id = ?', [id], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  static async create({ nombre, imagen }, callback) {
    try {
      const db = await getDatabase();
      db.run('INSERT INTO categoria (nombre, imagen) VALUES (?, ?)', [nombre, imagen], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  static async update(id, { nombre, imagen }, callback) {
    try {
      const db = await getDatabase();
      db.run('UPDATE categoria SET nombre = ?, imagen = ? WHERE id = ?', [nombre, imagen, id], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  static async delete(id, callback) {
    try {
      const db = await getDatabase();
      db.run('DELETE FROM categoria WHERE id = ?', [id], callback);
    } catch (error) {
      callback(error);
    }
  }
}

module.exports = Categoria;
