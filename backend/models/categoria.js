// Modelo para la tabla CATEGORIA
const db = require('./db');

class Categoria {
  static getAll(callback) {
    db.all('SELECT * FROM CATEGORIA', [], callback);
  }
  static getById(id, callback) {
    db.get('SELECT * FROM CATEGORIA WHERE id = ?', [id], callback);
  }
  static create({ nombre, descripcion }, callback) {
    db.run('INSERT INTO CATEGORIA (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion], callback);
  }
  static update(id, { nombre, descripcion }, callback) {
    db.run('UPDATE CATEGORIA SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion, id], callback);
  }
  static delete(id, callback) {
    db.run('DELETE FROM CATEGORIA WHERE id = ?', [id], callback);
  }
}

module.exports = Categoria;
