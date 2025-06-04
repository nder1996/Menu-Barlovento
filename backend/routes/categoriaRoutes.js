const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// Rutas para categorías
router.get('/categorias', categoriaController.getAllCategorias);
router.get('/categorias/:id', categoriaController.getCategoriaById);
router.post('/categorias', categoriaController.createCategoria);
router.put('/categorias/:id', categoriaController.updateCategoria);
router.delete('/categorias/:id', categoriaController.deleteCategoria);

module.exports = router;
