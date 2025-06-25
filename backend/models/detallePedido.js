// Modelo para la tabla detallePedido
const { getDatabase } = require('./db-netlify');

class DetallePedido {
  // Obtener todos los detalles de pedidos
  static async getAll(callback) {
    try {
      const db = await getDatabase();
      db.all('SELECT * FROM detallePedido', [], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  // Obtener un detalle específico por ID
  static async getById(id, callback) {
    try {
      const db = await getDatabase();
      const query = `
        SELECT dp.*,
               m.nombre as nombrePlato,
               m.precio as precioPlato,
               m.descripcion as descripcionPlato
        FROM detallePedido dp
        LEFT JOIN menu m ON dp.menuId = m.id
        WHERE dp.id = ?
      `;
      db.get(query, [id], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  // Obtener todos los detalles de un pedido específico
  static async getByPedidoId(pedidoId, callback) {
    try {
      const db = await getDatabase();
      const query = `
        SELECT dp.*,
               m.nombre as nombrePlato,
               m.precio as precioPlato,
               m.descripcion as descripcionPlato
        FROM detallePedido dp        LEFT JOIN menu m ON dp.menuId = m.id
        WHERE dp.pedidoId = ?
      `;
      db.all(query, [pedidoId], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  // Crear un nuevo detalle de pedido
  static async create({ pedidoId, cantidad, menuId, precio }, callback) {
    try {
      const db = await getDatabase();
      db.run(
        'INSERT INTO detallePedido (pedidoId, cantidad, menuId, precio) VALUES (?, ?, ?, ?)',
        [pedidoId, cantidad, menuId, precio],
        callback
      );
    } catch (error) {
      callback(error);
    }
  }
  
  // Actualizar un detalle de pedido existente
  static async update(id, { pedidoId, cantidad, menuId, precio }, callback) {
    try {
      const db = await getDatabase();
      db.run(
        'UPDATE detallePedido SET pedidoId = ?, cantidad = ?, menuId = ?, precio = ? WHERE id = ?',
        [pedidoId, cantidad, menuId, precio, id],
        callback
      );
    } catch (error) {
      callback(error);
    }
  }
  
  // Eliminar un detalle de pedido
  static async delete(id, callback) {
    try {
      const db = await getDatabase();
      db.run('DELETE FROM detallePedido WHERE id = ?', [id], callback);
    } catch (error) {
      callback(error);
    }
  }
  }
}

module.exports = DetallePedido;