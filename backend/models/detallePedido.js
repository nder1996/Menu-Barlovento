// Modelo para la tabla DETALLE_PEDIDO
const db = require('./db');

class DetallePedido {
  // Obtener todos los detalles de pedidos
  static getAll(callback) {
    db.all('SELECT * FROM DETALLE_PEDIDO', [], callback);
  }
  
  // Obtener un detalle específico por ID
  static getById(id, callback) {
    const query = `
      SELECT dp.*,
             m.nombre as nombrePlato,
             m.precio as precioPlato,
             m.descripcion as descripcionPlato
      FROM DETALLE_PEDIDO dp
      LEFT JOIN MENU m ON dp.idMenu = m.id
      WHERE dp.id = ?
    `;
    db.get(query, [id], callback);
  }
  
  // Obtener todos los detalles de un pedido específico
  static getByPedidoId(idPedido, callback) {
    const query = `
      SELECT dp.*,
             m.nombre as nombrePlato,
             m.precio as precioPlato,
             m.descripcion as descripcionPlato
      FROM DETALLE_PEDIDO dp
      LEFT JOIN MENU m ON dp.idMenu = m.id
      WHERE dp.idPedido = ?
    `;
    db.all(query, [idPedido], callback);
  }
  
  // Crear un nuevo detalle de pedido
  static create({ idPedido, observacion, cantidad, idMenu }, callback) {
    db.run(
      'INSERT INTO DETALLE_PEDIDO (idPedido, observacion, cantidad, idMenu) VALUES (?, ?, ?, ?)',
      [idPedido, observacion, cantidad, idMenu],
      callback
    );
  }
  
  // Actualizar un detalle de pedido existente
  static update(id, { idPedido, observacion, cantidad, idMenu }, callback) {
    db.run(
      'UPDATE DETALLE_PEDIDO SET idPedido = ?, observacion = ?, cantidad = ?, idMenu = ? WHERE id = ?',
      [idPedido, observacion, cantidad, idMenu, id],
      callback
    );
  }
  
  // Eliminar un detalle de pedido
  static delete(id, callback) {
    db.run('DELETE FROM DETALLE_PEDIDO WHERE id = ?', [id], callback);
  }
}

module.exports = DetallePedido;