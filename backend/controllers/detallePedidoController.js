const db = require('../models/db');
const DetallePedido = require('../models/detallePedido');

// Función para registrar operaciones de log
const { logOperation } = require('../utils/logger');

// Controlador de Detalles de Pedido
const detallePedidoController = {
  
  // Obtener todos los detalles
  getAllDetalles: (req, res) => {
    logOperation('READ', '/api/detalles');
    DetallePedido.getAll((err, rows) => {
      if (err) {
        logOperation('ERROR', '/api/detalles', null, { error: err.message });
        res.status(500).json({ error: err.message });
        return;
      }
      logOperation('SUCCESS', '/api/detalles', null, { count: rows.length });
      res.json(rows);
    });
  },

  // Obtener todos los detalles de un pedido
  getAllDetallesByPedidoId: (req, res) => {
    const { idPedido } = req.params;
    logOperation('READ', `/api/pedidos/${idPedido}/detalles`, { idPedido });
    DetallePedido.getAll((err, rows) => {
      if (err) {
        logOperation('ERROR', `/api/pedidos/${idPedido}/detalles`, { idPedido }, { error: err.message });
        res.status(500).json({ error: err.message });
        return;
      }
      logOperation('SUCCESS', `/api/pedidos/${idPedido}/detalles`, { idPedido }, { count: rows.length });
      res.json(rows);
    });
  },
  
  // Obtener un detalle específico por ID
  getDetalleById: (req, res) => {
    logOperation('READ', `/api/detalles/${req.params.id}`, { id: req.params.id });
    DetallePedido.getById(req.params.id, (err, row) => {
      if (err) {
        logOperation('ERROR', `/api/detalles/${req.params.id}`, { id: req.params.id }, { error: err.message });
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        logOperation('NOT_FOUND', `/api/detalles/${req.params.id}`, { id: req.params.id });
        res.status(404).json({ error: 'Detalle de pedido no encontrado' });
        return;
      }
      logOperation('SUCCESS', `/api/detalles/${req.params.id}`, { id: req.params.id }, { found: true });
      res.json(row);
    });
  },
  
  // Crear un nuevo detalle de pedido
  createDetalle: (req, res) => {
    const { idPedido, observacion, cantidad } = req.body;
    
    if (!idPedido || !cantidad) {
      logOperation('VALIDATION_ERROR', '/api/detalles', req.body, { error: 'idPedido y cantidad son requeridos' });
      return res.status(400).json({ error: 'idPedido y cantidad son requeridos' });
    }
    
    logOperation('CREATE', '/api/detalles', { idPedido, observacion, cantidad });
    
    DetallePedido.create({ idPedido, observacion, cantidad }, (err) => {
      if (err) {
        logOperation('ERROR', '/api/detalles', req.body, { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      logOperation('SUCCESS', '/api/detalles', req.body);
      res.status(201).json({ message: 'Detalle de pedido creado correctamente' });
    });
  },
  
  // Actualizar un detalle de pedido
  updateDetalle: (req, res) => {
    const { idPedido, observacion, cantidad } = req.body;
    
    logOperation('UPDATE', `/api/detalles/${req.params.id}`, { id: req.params.id, observacion, cantidad });
    
    DetallePedido.update(req.params.id, { idPedido, observacion, cantidad }, (err) => {
      if (err) {
        logOperation('ERROR', `/api/detalles/${req.params.id}`, req.body, { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      logOperation('SUCCESS', `/api/detalles/${req.params.id}`, req.body);
      res.json({ message: 'Detalle de pedido actualizado correctamente' });
    });
  },
  
  // Eliminar un detalle de pedido
  deleteDetalle: (req, res) => {
    logOperation('DELETE', `/api/detalles/${req.params.id}`, { id: req.params.id });
    
    DetallePedido.delete(req.params.id, (err) => {
      if (err) {
        logOperation('ERROR', `/api/detalles/${req.params.id}`, null, { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      logOperation('SUCCESS', `/api/detalles/${req.params.id}`);
      res.json({ message: 'Detalle de pedido eliminado correctamente' });
    });
  }
};

module.exports = detallePedidoController;