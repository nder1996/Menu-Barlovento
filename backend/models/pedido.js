// Modelo para la tabla PEDIDO
const db = require('./db');

class Pedido {
  static getAll(callback) {
  const query = `
    SELECT 
      p.*,
      m.precio AS precio_plato_principal,
      (
        SELECT COALESCE(SUM(m2.precio * dp.cantidad), 0)
        FROM DETALLE_PEDIDO dp
        JOIN MENU m2 ON dp.idMenu = m2.id
        WHERE dp.idPedido = p.id
      ) AS precio_total
    FROM PEDIDO p
    LEFT JOIN DETALLE_PEDIDO dp ON p.id = dp.idPedido
    LEFT JOIN MENU m ON dp.idMenu = m.id
    GROUP BY p.id
  `;
  db.all(query, [], callback);
}

  static getById(id, callback) {
    const query = `
      SELECT 
        p.*, 
        m.precio AS precio_plato_principal,
        (
          SELECT COALESCE(SUM(m2.precio * dp.cantidad), 0)
          FROM DETALLE_PEDIDO dp
          JOIN MENU m2 ON dp.idMenu = m2.id
          WHERE dp.idPedido = p.id
        ) AS precio_total
      FROM PEDIDO p
      LEFT JOIN MENU m ON p.idMenu = m.id
      WHERE p.id = ?
    `;
    db.get(query, [id], callback);
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

  // Método para obtener la factura de un pedido
  static getFacturaById(pedidoId, callback) {
    console.log('Obteniendo factura para pedido ID:', pedidoId);
    const query = `
      SELECT
        p.id AS pedido_id,
        p.createAt AS fecha,
        p.numeroMesa,
        (
          SELECT json_group_array(
            json_object(
              'plato', m.nombre,
              'cantidad', dp.cantidad,
              'precio', m.precio,
              'total', m.precio * dp.cantidad
            )
          )
          FROM DETALLE_PEDIDO dp
          JOIN MENU m ON dp.idMenu = m.id
          WHERE dp.idPedido = p.id
        ) AS detalles,
        (
          SELECT COALESCE(SUM(m.precio * dp.cantidad), 0)
          FROM DETALLE_PEDIDO dp
          JOIN MENU m ON dp.idMenu = m.id
          WHERE dp.idPedido = p.id
        ) AS precio_total
      FROM PEDIDO p
      WHERE p.id = ?
    `;
    
    db.get(query, [pedidoId], (err, row) => {
      if (err) {
        console.error('Error en la consulta de factura:', err);
        return callback(err);
      }
      console.log('Resultado de la factura:', row);
      
      // Asegurar que los detalles sean un array
      if (row && row.detalles) {
        try {
          if (typeof row.detalles === 'string') {
            row.detalles = JSON.parse(row.detalles);
          }
        } catch (e) {
          console.error('Error al procesar detalles:', e);
          row.detalles = [];
        }
      } else if (row) {
        row.detalles = [];
      }
      
      callback(null, row);
    });
  }
}

module.exports = Pedido;
