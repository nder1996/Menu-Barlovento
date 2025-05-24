const express = require('express');
const menuRoutes = require('./menuRoutes');
const pedidoRoutes = require('./pedidoRoutes');
const detallePedidoRoutes = require('./detallePedidoRoutes');

const router = express.Router();

// Agrupar todas las rutas
router.use('/menu', menuRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/detalles-pedido', detallePedidoRoutes);

module.exports = router;