const Categoria = require('../models/categoria');
const { logOperation } = require('../utils/logger');

// Controlador para categorías
const categoriaController = {
  
  // Obtener todas las categorías
  getAllCategorias: (req, res) => {
    logOperation('READ', '/api/categorias', { query: req.query });
    Categoria.getAll((err, rows) => {
      if (err) {
        logOperation('ERROR', '/api/categorias', null, { error: err.message });
        res.status(500).json({ error: err.message });
        return;
      }
      logOperation('SUCCESS', '/api/categorias', null, { count: rows.length });
      res.json(rows);
    });
  },
  
  // Obtener una categoría por ID
  getCategoriaById: (req, res) => {
    logOperation('READ', `/api/categorias/${req.params.id}`, { id: req.params.id });
    Categoria.getById(req.params.id, (err, row) => {
      if (err) {
        logOperation('ERROR', `/api/categorias/${req.params.id}`, { id: req.params.id }, { error: err.message });
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        logOperation('NOT_FOUND', `/api/categorias/${req.params.id}`, { id: req.params.id });
        res.status(404).json({ error: 'Categoría no encontrada' });
        return;
      }
      logOperation('SUCCESS', `/api/categorias/${req.params.id}`, { id: req.params.id }, { found: true });
      res.json(row);
    });
  },
  
  // Crear una nueva categoría
  createCategoria: (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      logOperation('VALIDATION_ERROR', '/api/categorias', req.body, { error: 'El nombre de la categoría es requerido' });
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }
    
    Categoria.create({ nombre, descripcion }, function(err, result) {
      if (err) {
        logOperation('ERROR', '/api/categorias', req.body, { error: err.message });
        res.status(500).json({ error: err.message });
        return;
      }
      logOperation('CREATE', '/api/categorias', req.body, { id: this.lastID });
      res.status(201).json({ 
        id: this.lastID, 
        nombre, 
        descripcion, 
        message: 'Categoría creada correctamente' 
      });
    });
  },
  
  // Actualizar una categoría existente
  updateCategoria: (req, res) => {
    const { nombre, descripcion } = req.body;
    const id = req.params.id;
    
    if (!nombre) {
      logOperation('VALIDATION_ERROR', `/api/categorias/${id}`, req.body, { error: 'El nombre de la categoría es requerido' });
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }
    
    // Verificar que la categoría existe
    Categoria.getById(id, (err, row) => {
      if (err) {
        logOperation('ERROR', `/api/categorias/${id}`, req.body, { error: err.message });
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!row) {
        logOperation('NOT_FOUND', `/api/categorias/${id}`, req.body);
        res.status(404).json({ error: 'Categoría no encontrada' });
        return;
      }
      
      // Actualizar la categoría
      Categoria.update(id, { nombre, descripcion }, function(err) {
        if (err) {
          logOperation('ERROR', `/api/categorias/${id}`, req.body, { error: err.message });
          res.status(500).json({ error: err.message });
          return;
        }
        
        logOperation('UPDATE', `/api/categorias/${id}`, req.body);
        res.json({ 
          id: parseInt(id), 
          nombre, 
          descripcion, 
          message: 'Categoría actualizada correctamente' 
        });
      });
    });
  },
  
  // Eliminar una categoría
  deleteCategoria: (req, res) => {
    const id = req.params.id;
    
    // Verificar que la categoría existe
    Categoria.getById(id, (err, row) => {
      if (err) {
        logOperation('ERROR', `/api/categorias/${id}`, { id }, { error: err.message });
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!row) {
        logOperation('NOT_FOUND', `/api/categorias/${id}`, { id });
        res.status(404).json({ error: 'Categoría no encontrada' });
        return;
      }
      
      // Eliminar la categoría
      Categoria.delete(id, function(err) {
        if (err) {
          logOperation('ERROR', `/api/categorias/${id}`, { id }, { error: err.message });
          res.status(500).json({ error: err.message });
          return;
        }
        
        logOperation('DELETE', `/api/categorias/${id}`, { id });
        res.json({ 
          id: parseInt(id), 
          message: 'Categoría eliminada correctamente' 
        });
      });
    });
  }
};

module.exports = categoriaController;
