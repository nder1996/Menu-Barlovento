// Modelo para la tabla MENU
const { getDatabase } = require('./db-netlify');

class Menu {
  static async getAll(callback) {
    try {
      const db = await getDatabase();
      db.all('SELECT * FROM menu', [], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  static async getById(id, callback) {
    try {
      const db = await getDatabase();
      db.get('SELECT * FROM menu WHERE id = ?', [id], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  static async getByCategoriaId(categoriaId, callback) {
    try {
      const db = await getDatabase();
      db.all('SELECT * FROM menu WHERE categoriaId = ?', [categoriaId], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  static async create({ categoriaId, nombre, descripcion, precio, imagen }, callback) {
    try {
      const db = await getDatabase();
      db.run('INSERT INTO menu (categoriaId, nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?, ?)', 
        [categoriaId, nombre, descripcion, precio, imagen], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  static async update(id, { categoriaId, nombre, descripcion, precio, imagen }, callback) {
    try {
      const db = await getDatabase();
      db.run('UPDATE menu SET categoriaId = ?, nombre = ?, descripcion = ?, precio = ?, imagen = ? WHERE id = ?', 
        [categoriaId, nombre, descripcion, precio, imagen, id], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  static async delete(id, callback) {
    try {
      const db = await getDatabase();
      db.run('DELETE FROM menu WHERE id = ?', [id], callback);
    } catch (error) {
      callback(error);
    }
  }
}

module.exports = Menu;
