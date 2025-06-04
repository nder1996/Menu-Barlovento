const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Rutas para el menú
router.get('/platos', menuController.getAllPlatos);
router.get('/platos/:id', menuController.getPlatoById);
router.post('/platos', menuController.createPlato);
router.put('/platos/:id', menuController.updatePlato);
router.delete('/platos/:id', menuController.deletePlato);
router.get('/categorias', menuController.getAllCategorias);

module.exports = router;
