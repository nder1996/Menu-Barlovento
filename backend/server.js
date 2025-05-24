// server.js - Servidor principal para Menu-Barlovento

const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');
const apiRoutes = require('./routes');

// Inicialización de la app
const app = express();
const PORT = process.env.PORT || 3000;

// LiveReload solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  const livereload = require('livereload');
  const connectLivereload = require('connect-livereload');
  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch([
    path.join(__dirname, 'public'),
    path.join(__dirname, 'app.js')
  ]);
  liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
      liveReloadServer.refresh('/');
    }, 100);
  });
  // Middleware para LiveReload
  app.use(connectLivereload());
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Desactivar caché para desarrollo
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Expires', '-1');
  res.set('Pragma', 'no-cache');
  next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Rutas API
app.use('/api', apiRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'index.html'));
});

// Servir archivos estáticos desde la carpeta backend
app.use('/backend', express.static(path.join(__dirname, 'backend')));
// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`Servidor iniciado en http://localhost:${PORT}`);
});
