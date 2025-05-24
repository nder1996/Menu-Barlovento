const db = require('../models/db');
const Pedido = require('../models/pedido');

// Función para registrar operaciones de log
const { logOperation } = require('../utils/logger');

// Controlador de Pedidos
const pedidoController = {
  // Obtener todos los pedidos
  getAllPedidos: (req, res) => {
    logOperation('READ', '/api/pedidos', { query: req.query });
    // Filtros (mesa, fecha)
    const filtros = {
      mesa: req.query.mesa,
      fecha: req.query.fecha
    };
    Pedido.getAll((err, rows) => {
      if (err) {
        logOperation('ERROR', '/api/pedidos', null, { error: err.message });
        res.status(500).json({ error: err.message });
        return;
      }
      logOperation('SUCCESS', '/api/pedidos', null, { count: rows.length });
      res.json(rows);
    });
  },
  // Obtener pedido por ID
  getPedidoById: (req, res) => {
    logOperation('READ', `/api/pedidos/${req.params.id}`, { id: req.params.id });
    Pedido.getById(req.params.id, (err, row) => {
      if (err) {
        logOperation('ERROR', `/api/pedidos/${req.params.id}`, { id: req.params.id }, { error: err.message });
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        logOperation('NOT_FOUND', `/api/pedidos/${req.params.id}`, { id: req.params.id });
        res.status(404).json({ error: 'Pedido no encontrado' });
        return;
      }
      logOperation('SUCCESS', `/api/pedidos/${req.params.id}`, { id: req.params.id }, { found: true });
      res.json(row);
    });
  },
  // Crear pedido
  createPedido: (req, res) => {
    const { idMenu, numeroMesa, createAt, updateAt } = req.body;
    if (!idMenu || !numeroMesa) {
      logOperation('VALIDATION_ERROR', '/api/pedidos', req.body, { error: 'idMenu y numeroMesa son requeridos' });
      return res.status(400).json({ error: 'idMenu y numeroMesa son requeridos' });
    }
    Pedido.create({ idMenu, numeroMesa, createAt, updateAt }, (err) => {
      if (err) {
        logOperation('ERROR', '/api/pedidos', req.body, { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      logOperation('SUCCESS', '/api/pedidos', req.body);
      res.status(201).json({ message: 'Pedido creado correctamente' });
    });
  },
  // Actualizar pedido
  updatePedido: (req, res) => {
    const { idMenu, numeroMesa, updateAt } = req.body;
    Pedido.update(req.params.id, { idMenu, numeroMesa, updateAt }, (err) => {
      if (err) {
        logOperation('ERROR', `/api/pedidos/${req.params.id}`, req.body, { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      logOperation('SUCCESS', `/api/pedidos/${req.params.id}`, req.body);
      res.json({ message: 'Pedido actualizado correctamente' });
    });
  },
  // Eliminar pedido
  deletePedido: (req, res) => {
    Pedido.delete(req.params.id, (err) => {
      if (err) {
        logOperation('ERROR', `/api/pedidos/${req.params.id}`, null, { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      logOperation('SUCCESS', `/api/pedidos/${req.params.id}`);
      res.json({ message: 'Pedido eliminado correctamente' });
    });
  }
};

module.exports = pedidoController;
