// Modelo para la tabla PEDIDO
const db = require('./db');

class Pedido {
  static getAll(callback) {
    db.all('SELECT * FROM PEDIDO', [], callback);
  }
  static getById(id, callback) {
    db.get('SELECT * FROM PEDIDO WHERE id = ?', [id], callback);
  }
  static create({ idMenu, numeroMesa, createAt, updateAt }, callback) {
    db.run('INSERT INTO PEDIDO (idMenu, numeroMesa, createAt, updateAt) VALUES (?, ?, ?, ?)', [idMenu, numeroMesa, createAt, updateAt], callback);
  }
  static update(id, { idMenu, numeroMesa, updateAt }, callback) {
    db.run('UPDATE PEDIDO SET idMenu = ?, numeroMesa = ?, updateAt = ? WHERE id = ?', [idMenu, numeroMesa, updateAt, id], callback);
  }
  static delete(id, callback) {
    db.run('DELETE FROM PEDIDO WHERE id = ?', [id], callback);
  }
}

module.exports = Pedido;
