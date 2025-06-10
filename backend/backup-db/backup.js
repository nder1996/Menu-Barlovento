const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class BackupService extends EventEmitter {
    constructor(config = {}) {
        super();

        // Configuración por defecto
        this.config = {
            dbPath: config.dbPath || path.join(__dirname, '../db/menu.db'),
            backupDir: config.backupDir || path.join(__dirname, '../backups'),
            intervalHours: config.intervalHours || 1,
            maxBackups: config.maxBackups || 24,
            autoStart: config.autoStart !== false, // true por defecto
            prefix: config.prefix || 'backup',
            ...config
        };

        this.isRunning = false;
        this.intervalId = null;
        this.stats = {
            totalBackups: 0,
            lastBackup: null,
            errors: 0,
            startTime: null
        };

        // Auto-iniciar si está habilitado
        if (this.config.autoStart) {
            this.start();
        }
    }    /**
     * Inicia el servicio de respaldo
     */
    start() {
        if (this.isRunning) {
            this.log('El servicio de respaldo ya está ejecutándose');
            return;
        }

        this.log('Iniciando sistema de respaldo automático...');
        this.stats.startTime = new Date();

        // Crear backup inicial
        this.createBackup();

        // Programar backups automáticos - convertir horas a milisegundos
        const intervalMs = this.config.intervalHours * 60 * 60 * 1000; // 1 hora = 60 min * 60 seg * 1000 ms
        this.intervalId = setInterval(() => {
            this.log('Ejecutando respaldo programado...');
            this.createBackup();
        }, intervalMs);

        this.isRunning = true;
        this.log(`Sistema de respaldo configurado para ejecutarse cada ${this.config.intervalHours} hora(s)`);
        this.emit('started');
    }

    /**
     * Detiene el servicio de respaldo
     */
    stop() {
        if (!this.isRunning) {
            this.log('El servicio de respaldo no está ejecutándose');
            return;
        }

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isRunning = false;
        this.log('Sistema de respaldo detenido');
        this.emit('stopped');
    }    /**
     * Crea una copia de seguridad manual
     */
    async createBackup() {
        try {
            // Verificar que existe la base de datos
            if (!fs.existsSync(this.config.dbPath)) {
                throw new Error(`Base de datos no encontrada: ${this.config.dbPath}`);
            }

            // Crear directorio de backups si no existe
            await this.ensureBackupDirectory();

            // Generar nombre del archivo
            const backupFileName = this.generateBackupFileName();
            const backupPath = path.join(this.config.backupDir, backupFileName);

            // Copiar la base de datos
            await this.copyFile(this.config.dbPath, backupPath);

            // Verificar que el archivo de backup se creó correctamente
            if (!fs.existsSync(backupPath)) {
                throw new Error(`No se pudo crear el archivo de backup: ${backupPath}`);
            }

            this.log(`✅ Backup creado exitosamente: ${backupFileName}`);

            // Actualizar estadísticas
            this.stats.totalBackups++;
            this.stats.lastBackup = new Date();

            try {
                // Obtener el tamaño del archivo antes de emitir el evento
                const fileSize = fs.statSync(backupPath).size;
                
                // Emitir evento de backup creado
                this.emit('backupCreated', {
                    fileName: backupFileName,
                    path: backupPath,
                    size: fileSize
                });
                
                // Limpiar backups antiguos DESPUÉS de verificar que el nuevo está OK
                await this.cleanOldBackups();
                
                return backupPath;
            } catch (statsError) {
                // Si hay un error al obtener stats, simplemente lo registramos pero no fallamos
                this.log(`Advertencia: Error al obtener información del archivo: ${statsError.message}`, 'warn');
                // Aún así intentamos limpiar backups antiguos
                await this.cleanOldBackups();
                return backupPath;
            }

        } catch (error) {
            this.stats.errors++;
            this.log(`❌ Error al crear backup: ${error.message}`, 'error');
            this.emit('error', error);
            // No lanzamos el error para evitar que se rompa la aplicación
            return null; // Indicamos que no se creó el backup
        }
    }

    /**
     * Restaura una copia de seguridad
     */
    async restoreBackup(backupFileName) {
        try {
            const backupPath = path.join(this.config.backupDir, backupFileName);

            if (!fs.existsSync(backupPath)) {
                throw new Error(`Backup no encontrado: ${backupFileName}`);
            }

            // Crear backup de la base actual antes de restaurar
            const currentBackupName = `current_${this.generateBackupFileName()}`;
            const currentBackupPath = path.join(this.config.backupDir, currentBackupName);

            if (fs.existsSync(this.config.dbPath)) {
                await this.copyFile(this.config.dbPath, currentBackupPath);
                this.log(`Backup de seguridad creado: ${currentBackupName}`);
            }

            // Restaurar el backup seleccionado
            await this.copyFile(backupPath, this.config.dbPath);

            this.log(`✅ Base de datos restaurada desde: ${backupFileName}`);
            this.emit('backupRestored', { fileName: backupFileName });

            return true;

        } catch (error) {
            this.log(`❌ Error al restaurar backup: ${error.message}`, 'error');
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Lista todos los backups disponibles
     */
    async listBackups() {
        try {
            if (!fs.existsSync(this.config.backupDir)) {
                return [];
            }

            const files = await this.readDirectory(this.config.backupDir);

            const backups = files
                .filter(file => file.endsWith('.db') && file.startsWith(this.config.prefix))
                .map(file => {
                    const filePath = path.join(this.config.backupDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        name: file,
                        path: filePath,
                        size: stats.size,
                        created: stats.mtime,
                        age: Date.now() - stats.mtime.getTime()
                    };
                })
                .sort((a, b) => b.created.getTime() - a.created.getTime());

            return backups;

        } catch (error) {
            this.log(`❌ Error al listar backups: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Obtiene estadísticas del servicio
     */
    getStats() {
        return {
            ...this.stats,
            isRunning: this.isRunning,
            config: { ...this.config },
            uptime: this.stats.startTime ? Date.now() - this.stats.startTime.getTime() : 0
        };
    }    /**
     * Limpia backups antiguos manteniendo todos los del día actual y solo uno por cada día anterior
     */
    async cleanOldBackups() {
        try {
            const backups = await this.listBackups();

            this.log(`Total de backups: ${backups.length}`);

            // Si no hay backups o sólo hay uno, no hacemos nada
            if (backups.length <= 1) {
                return;
            }

            // Agrupar los backups por fecha (YYYY-MM-DD)
            const backupsByDate = {};
            const today = new Date().toISOString().slice(0, 10); // formato YYYY-MM-DD

            // Agrupar backups por fecha
            backups.forEach(backup => {
                // Extraer la fecha del nombre del archivo (formato esperado: prefix_YYYY-MM-DD_HH-MM-SS.db)
                const dateMatch = backup.name.match(/(\d{4}-\d{2}-\d{2})/);
                if (dateMatch) {
                    const backupDate = dateMatch[1];
                    if (!backupsByDate[backupDate]) {
                        backupsByDate[backupDate] = [];
                    }
                    backupsByDate[backupDate].push(backup);
                }
            });

            let deletedCount = 0;
            
            // Procesar cada grupo de backups por fecha
            for (const [date, dateBackups] of Object.entries(backupsByDate)) {
                // Para el día actual, mantenemos hasta 24 backups (o el máximo configurado)
                if (date === today) {
                    this.log(`Procesando ${dateBackups.length} backups del día de hoy (${date})`);
                    
                    // Si hay más backups del máximo permitido para hoy
                    if (dateBackups.length > this.config.maxBackups) {
                        const toDelete = dateBackups.slice(this.config.maxBackups);
                        this.log(`Eliminando ${toDelete.length} backups antiguos de hoy...`);
                        
                        for (const backup of toDelete) {
                            try {
                                await this.deleteFile(backup.path);
                                this.log(`🗑️ Backup eliminado (hoy): ${backup.name}`);
                                deletedCount++;
                            } catch (err) {
                                this.log(`No se pudo eliminar ${backup.name}: ${err.message}`, 'warn');
                            }
                        }
                    }
                } else {
                    // Para días anteriores, solo mantenemos el backup más reciente
                    if (dateBackups.length > 1) {
                        this.log(`Manteniendo solo 1 backup del día ${date} (de ${dateBackups.length} disponibles)`);
                        
                        // El primer backup es el más reciente (por el orden en listBackups)
                        const toKeep = dateBackups[0];
                        const toDelete = dateBackups.slice(1);
                        
                        this.log(`Manteniendo backup más reciente de ${date}: ${toKeep.name}`);
                        
                        for (const backup of toDelete) {
                            try {
                                await this.deleteFile(backup.path);
                                this.log(`🗑️ Backup antiguo eliminado (${date}): ${backup.name}`);
                                deletedCount++;
                            } catch (err) {
                                this.log(`No se pudo eliminar ${backup.name}: ${err.message}`, 'warn');
                            }
                        }
                    } else {
                        this.log(`Manteniendo único backup del día ${date}: ${dateBackups[0].name}`);
                    }
                }
            }

            if (deletedCount > 0) {
                this.emit('oldBackupsCleared', { deleted: deletedCount });
            }

        } catch (error) {
            this.log(`❌ Error al limpiar backups antiguos: ${error.message}`, 'error');
        }
    }

    // MÉTODOS PRIVADOS

    /**
     * Genera nombre único para el archivo de backup
     */
    generateBackupFileName() {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
        return `${this.config.prefix}_${dateStr}_${timeStr}.db`;
    }

    /**
     * Asegura que el directorio de backups existe
     */
    async ensureBackupDirectory() {
        if (!fs.existsSync(this.config.backupDir)) {
            fs.mkdirSync(this.config.backupDir, { recursive: true });
            this.log(`📁 Directorio de backups creado: ${this.config.backupDir}`);
        }
    }

    /**
     * Copia un archivo de forma asíncrona
     */
    copyFile(source, destination) {
        return new Promise((resolve, reject) => {
            fs.copyFile(source, destination, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Lee un directorio de forma asíncrona
     */
    readDirectory(dirPath) {
        return new Promise((resolve, reject) => {
            fs.readdir(dirPath, (err, files) => {
                if (err) reject(err);
                else resolve(files);
            });
        });
    }    /**
     * Elimina un archivo de forma asíncrona
     */
    deleteFile(filePath) {
        return new Promise((resolve, reject) => {
            // Verificar primero si el archivo existe antes de intentar eliminarlo
            if (!fs.existsSync(filePath)) {
                this.log(`Archivo no encontrado, no se puede eliminar: ${filePath}`, 'warn');
                return resolve(); // No fallamos, simplemente continuamos
            }
            
            fs.unlink(filePath, (err) => {
                if (err) {
                    this.log(`Error al eliminar archivo ${filePath}: ${err.message}`, 'warn');
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Sistema de logging
     */
    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
        console.log(`[${timestamp}] ${prefix} BackupService: ${message}`);

        this.emit('log', { timestamp, level, message });
    }
}

// Función de conveniencia para crear una instancia con configuración simple
function createBackupService(config) {
    return new BackupService(config);
}

// NO creamos una instancia por defecto para evitar duplicados
// ya que la instancia se crea explícitamente en server.js

module.exports = {
    BackupService,
    createBackupService
};