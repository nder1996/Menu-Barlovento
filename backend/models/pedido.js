// Modelo para la tabla PEDIDO
const { getDatabase } = require('./db-netlify');

class Pedido {
  static async getAll(callback) {
    try {
      const db = await getDatabase();
      const query = `
        SELECT 
          p.*,
          COALESCE(SUM(dp.precio * dp.cantidad), 0) AS total_calculado
        FROM pedido p
        LEFT JOIN detallePedido dp ON p.id = dp.pedidoId
        GROUP BY p.id
        ORDER BY p.fecha DESC
      `;
      db.all(query, [], callback);
    } catch (error) {
      callback(error);
    }
  }
  static async getById(id, callback) {
    try {
      const db = await getDatabase();
      const query = `
        SELECT 
          p.*,
          COALESCE(SUM(dp.precio * dp.cantidad), 0) AS total_calculado
        FROM pedido p
        LEFT JOIN detallePedido dp ON p.id = dp.pedidoId
        WHERE p.id = ?
        GROUP BY p.id
      `;
      db.get(query, [id], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  static async create({ mesa, total }, callback) {
    try {
      const db = await getDatabase();
      const currentTime = new Date().toISOString();
      db.run('INSERT INTO pedido (mesa, total, fecha, estado) VALUES (?, ?, ?, ?)', 
        [mesa, total || 0, currentTime, 'pendiente'], 
        callback);
    } catch (error) {
      callback(error);
    }
  }
  
  static async update(id, { mesa, total, estado }, callback) {
    try {
      const db = await getDatabase();
      db.run('UPDATE pedido SET mesa = ?, total = ?, estado = ? WHERE id = ?', 
        [mesa, total, estado || 'pendiente', id], callback);
    } catch (error) {
      callback(error);
    }
  }
  
  static async delete(id, callback) {
    try {
      const db = await getDatabase();
      db.run('DELETE FROM pedido WHERE id = ?', [id], callback);
    } catch (error) {
      callback(error);
    }
  }

  // Método para obtener la factura de un pedido
  static async getFacturaById(pedidoId, callback) {
    try {
      const db = await getDatabase();
      console.log('Obteniendo factura para pedido ID:', pedidoId);
      const query = `
        SELECT
          p.id AS pedido_id,
          p.fecha,
          p.mesa,
          p.total AS precio_total,
          p.estado
        FROM pedido p
        WHERE p.id = ?
      `;
      
      db.get(query, [pedidoId], (err, pedido) => {
        if (err) {
          console.error('Error en la consulta de factura:', err);
          return callback(err);
        }
        
        if (!pedido) {
          return callback(null, null);
        }
        
        // Obtener detalles del pedido
        const detallesQuery = `
          SELECT
            m.nombre AS plato,
            dp.cantidad,
            dp.precio,
            (dp.cantidad * dp.precio) AS total
          FROM detallePedido dp
          JOIN menu m ON dp.menuId = m.id
          WHERE dp.pedidoId = ?
        `;
        
        db.all(detallesQuery, [pedidoId], (err, detalles) => {
          if (err) {
            console.error('Error obteniendo detalles:', err);
            return callback(err);
          }
          
          pedido.detalles = detalles || [];
          console.log('Resultado de la factura:', pedido);
          callback(null, pedido);
        });
      });
    } catch (error) {
      callback(error);
    }
  }
}

module.exports = Pedido;
