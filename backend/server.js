
// server.js - Servidor principal para Menu-Barlovento
const viewRoutes = require('./routes/viewRoutes');
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');
const apiRoutes = require('./routes');
const { createBackupService } = require('./backup-db/backup');
// Inicialización de la app
const app = express();
const PORT = process.env.PORT || 3000;

const backupService = createBackupService({
  dbPath: path.join(__dirname, 'db', 'menu.db'),
  backupDir: path.join(__dirname, 'backups'),
  intervalHours: 1,   // Intervalo de 1 hora para generar 24 copias diarias
  maxBackups: 24      // Mantener hasta 24 copias del día actual
});


// LiveReload solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  const livereload = require('livereload');
  const connectLivereload = require('connect-livereload');
  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch([
    path.join(__dirname, '..', 'frontend'),
    path.join(__dirname, 'server.js')
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
app.use(cors({
  origin: '*',  // Permitir todas las solicitudes en desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Accept']
}));
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

// Servir archivos estáticos desde frontend/public
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Servir archivos estáticos desde frontend/views
// Esto es crucial para acceder a los archivos .js en las carpetas de vistas
app.use('/views', express.static(path.join(__dirname, '..', 'frontend', 'views')));

// Rutas API
app.use('/api', apiRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'index.html'));
});

// Rutas para vistas
app.use('/', viewRoutes);

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  const isApiRequest = req.originalUrl.startsWith('/api');
  if (isApiRequest) {
    return res.status(404).json({ error: 'Ruta de API no encontrada' });
  }
  
  // Si es una solicitud de archivo y no se encuentra, devolver 404 con mensaje JSON
  if (req.originalUrl.match(/\.(js|css|png|jpg|jpeg|gif|svg)$/)) {
    logger.error(`Archivo no encontrado: ${req.originalUrl}`);
    return res.status(404).json({ error: `Archivo no encontrado: ${req.originalUrl}` });
  }
  
  // Para otras rutas, redirigir a la página principal
  res.redirect('/');
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`Servidor iniciado en http://localhost:${PORT}`);
  logger.info(`Archivos estáticos servidos desde: ${path.join(__dirname, '..', 'frontend', 'public')}`);
  logger.info(`Archivos de vistas servidos desde: ${path.join(__dirname, '..', 'frontend', 'views')}`);
});
