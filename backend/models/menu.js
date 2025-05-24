// Modelo para la tabla MENU
const db = require('./db');

class Menu {
  static getAll(callback) {
    db.all('SELECT * FROM MENU', [], callback);
  }
  static getById(id, callback) {
    db.get('SELECT * FROM MENU WHERE id = ?', [id], callback);
  }
  static create({ idCategoria, nombre, descripcion, precio, createAt, updateAt, estado }, callback) {
    db.run('INSERT INTO MENU (idCategoria, nombre, descripcion, precio, createAt, updateAt, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', [idCategoria, nombre, descripcion, precio, createAt, updateAt, estado], callback);
  }
  static update(id, { idCategoria, nombre, descripcion, precio, updateAt, estado }, callback) {
    db.run('UPDATE MENU SET idCategoria = ?, nombre = ?, descripcion = ?, precio = ?, updateAt = ?, estado = ? WHERE id = ?', [idCategoria, nombre, descripcion, precio, updateAt, estado, id], callback);
  }
  static delete(id, callback) {
    db.run('DELETE FROM MENU WHERE id = ?', [id], callback);
  }
}

module.exports = Menu;
