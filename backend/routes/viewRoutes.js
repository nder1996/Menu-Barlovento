const express = require('express');
const path = require('path');
const router = express.Router();

// Rutas para vistas
router.get('/example', (req, res) => {
  // Si existe example.html, si no, se maneja con el middleware de error 404
  res.sendFile('example.html', { root: path.join(__dirname, '../../frontend/views') });
});

// Ruta para el menú - envía el archivo HTML directamente
router.get('/menu', (req, res) => {
  res.sendFile('menu/menu.html', { root: path.join(__dirname, '../../frontend/views') });
});

// Ruta para los pedidos - envía el archivo HTML directamente
router.get('/pedidos', (req, res) => {
  res.sendFile('pedido/pedidos.html', { root: path.join(__dirname, '../../frontend/views') });
});

// Ruta para las categorías - envía el archivo HTML directamente
router.get('/categorias', (req, res) => {
  res.sendFile('categoriaMeu/categoriaMenu.html', { root: path.join(__dirname, '../../frontend/views') });
});

// Ruta para la carta del restaurante - envía el archivo HTML directamente
router.get('/carta', (req, res) => {
  res.sendFile('hotelMenu/hotelMenu.html', { root: path.join(__dirname, '../../frontend/views') });
});

// Ruta para la página principal (redirecciona al menú)
router.get('/', (req, res) => {
  res.redirect('/menu');
});

// Agrega más rutas según sea necesario
module.exports = router;