const express = require('express');
const router = express.Router();
const detallePedidoController = require('../controllers/detallePedidoController');

// Rutas para detalles de pedidos
router.get('/:id', detallePedidoController.getDetalleById);
router.post('/', detallePedidoController.createDetalle);
router.put('/:id', detallePedidoController.updateDetalle);
router.delete('/:id', detallePedidoController.deleteDetalle);

module.exports = router;
