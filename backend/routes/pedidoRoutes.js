const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const router = express.Router();

// Rutas para pedidos
router.get('/', pedidoController.getAllPedidos);
router.get('/:id', pedidoController.getPedidoById);
router.post('/', pedidoController.createPedido);
router.put('/:id', pedidoController.updatePedido);
router.delete('/:id', pedidoController.deletePedido);
// Nueva ruta para obtener la factura de un pedido
router.get('/:id/factura', pedidoController.getFacturaById);

module.exports = router;
