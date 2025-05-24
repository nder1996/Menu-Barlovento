const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Rutas para el menú
router.get('/', menuController.getAllPlatos);
router.get('/:id', menuController.getPlatoById);
router.post('/', menuController.createPlato);
router.put('/:id', menuController.updatePlato);
router.delete('/:id', menuController.deletePlato);

// Rutas para categorías
router.get('/categorias/all', menuController.getAllCategorias);

module.exports = router;
