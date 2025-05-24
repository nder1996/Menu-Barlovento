const express = require('express');
const detallePedidoController = require('../controllers/detallePedidoController');
const router = express.Router();

// Rutas para detalles de pedido
router.get('/pedido/:idPedido', detallePedidoController.getAllDetallesByPedidoId);
router.get('/:id', detallePedidoController.getDetalleById);
router.post('/', detallePedidoController.createDetalle);
router.put('/:id', detallePedidoController.updateDetalle);
router.delete('/:id', detallePedidoController.deleteDetalle);

module.exports = router;
