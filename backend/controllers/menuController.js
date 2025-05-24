const db = require('../models/db');
const Menu = require('../models/menu');
const Categoria = require('../models/categoria');

// Función para registrar operaciones de log
const { logOperation } = require('../utils/logger');


// Controlador del Menú
const menuController = {
  
  // Obtener todos los platos del menú
  getAllPlatos: (req, res) => {
    logOperation('READ', '/api/platos', { query: req.query });
    Menu.getAll((err, rows) => {
      if (err) {
        logOperation('ERROR', '/api/platos', null, { error: err.message });
        res.status(500).json({ error: err.message });
        return;
      }
      logOperation('SUCCESS', '/api/platos', null, { count: rows.length });
      res.json(rows);
    });
  },
  
  // Obtener un plato por ID
  getPlatoById: (req, res) => {
    logOperation('READ', `/api/platos/${req.params.id}`, { id: req.params.id });
    Menu.getById(req.params.id, (err, row) => {
      if (err) {
        logOperation('ERROR', `/api/platos/${req.params.id}`, { id: req.params.id }, { error: err.message });
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        logOperation('NOT_FOUND', `/api/platos/${req.params.id}`, { id: req.params.id });
        res.status(404).json({ error: 'Plato no encontrado' });
        return;
      }
      logOperation('SUCCESS', `/api/platos/${req.params.id}`, { id: req.params.id }, { found: true });
      res.json(row);
    });
  },
  
  // Crear un nuevo plato
  createPlato: (req, res) => {
    const { idCategoria, nombre, descripcion, precio, createAt, updateAt, estado } = req.body;
    if (!idCategoria || !nombre || !precio) {
      logOperation('VALIDATION_ERROR', '/api/platos', req.body, { error: 'idCategoria, nombre y precio son requeridos' });
      return res.status(400).json({ error: 'idCategoria, nombre y precio son requeridos' });
    }
    Menu.create({ idCategoria, nombre, descripcion, precio, createAt, updateAt, estado }, (err) => {
      if (err) {
        logOperation('ERROR', '/api/platos', req.body, { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      logOperation('SUCCESS', '/api/platos', req.body);
      res.status(201).json({ message: 'Plato creado correctamente' });
    });
  },
  
  // Actualizar un plato
  updatePlato: (req, res) => {
    const { idCategoria, nombre, descripcion, precio, updateAt, estado } = req.body;
    Menu.update(req.params.id, { idCategoria, nombre, descripcion, precio, updateAt, estado }, (err) => {
      if (err) {
        logOperation('ERROR', `/api/platos/${req.params.id}`, req.body, { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      logOperation('SUCCESS', `/api/platos/${req.params.id}`, req.body);
      res.json({ message: 'Plato actualizado correctamente' });
    });
  },
  
  // Eliminar un plato
  deletePlato: (req, res) => {
    Menu.delete(req.params.id, (err) => {
      if (err) {
        logOperation('ERROR', `/api/platos/${req.params.id}`, null, { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      logOperation('SUCCESS', `/api/platos/${req.params.id}`);
      res.json({ message: 'Plato eliminado correctamente' });
    });
  },
  
  // Obtener todas las categorías
  getAllCategorias: (req, res) => {
    Categoria.getAll((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
};

module.exports = menuController;
