// Modelo para la tabla DETALLE_PEDIDO
const db = require('./db');

class DetallePedido {
  static getAll(callback) {
    db.all('SELECT * FROM DETALLE_PEDIDO', [], callback);
  }
  static getById(id, callback) {
    db.get('SELECT * FROM DETALLE_PEDIDO WHERE id = ?', [id], callback);
  }
  static create({ idPedido, observacion, cantidad }, callback) {
    db.run('INSERT INTO DETALLE_PEDIDO (idPedido, observacion, cantidad) VALUES (?, ?, ?)', [idPedido, observacion, cantidad], callback);
  }
  static update(id, { idPedido, observacion, cantidad }, callback) {
    db.run('UPDATE DETALLE_PEDIDO SET idPedido = ?, observacion = ?, cantidad = ? WHERE id = ?', [idPedido, observacion, cantidad, id], callback);
  }
  static delete(id, callback) {
    db.run('DELETE FROM DETALLE_PEDIDO WHERE id = ?', [id], callback);
  }
}

module.exports = DetallePedido;
