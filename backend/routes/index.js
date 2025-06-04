const express = require('express');
const menuRoutes = require('./menuRoutes');
const pedidoRoutes = require('./pedidoRoutes');
const detallePedidoRoutes = require('./detallePedidoRoutes');
const categoriaRoutes = require('./categoriaRoutes');
const menuController = require('../controllers/menuController');
const categoriaController = require('../controllers/categoriaController');

const router = express.Router();

// Rutas principales para el frontend
router.get('/platos', menuController.getAllPlatos);
router.post('/platos', menuController.createPlato);
router.get('/platos/:id', menuController.getPlatoById);
router.put('/platos/:id', menuController.updatePlato);
router.delete('/platos/:id', menuController.deletePlato);

// Rutas para categorías
router.get('/categorias', categoriaController.getAllCategorias);
router.get('/categorias/:id', categoriaController.getCategoriaById);
router.post('/categorias', categoriaController.createCategoria);
router.put('/categorias/:id', categoriaController.updateCategoria);
router.delete('/categorias/:id', categoriaController.deleteCategoria);

// Rutas adicionales (agrupadas por módulos)
router.use('/menu', menuRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/detalles-pedido', detallePedidoRoutes);
router.use('/categorias', categoriaRoutes);

module.exports = router;