# Menu-Barlovento

Proyecto de menú digital con backend en Express/SQLite y frontend estático. Despliega automáticamente en Netlify.

## 📁 Estructura del Proyecto

```
root/
├── backend/                # Servidor Express y base de datos
│   ├── db/menu.db         # Base de datos SQLite
│   ├── controllers/       # Lógica de rutas y controladores
│   ├── models/            # Definición de esquemas de datos
│   ├── routes/            # Rutas del servidor
│   └── server.js          # Punto de entrada del servidor
├── frontend/public/       # Archivos estáticos de la SPA
│   ├── index.html
│   ├── _redirects         # Redirecciones para SPA y API
│   ├── assets/            # Imágenes, libs, CSS y JS
│   └── src/               # Controladores de cliente y views estáticas
├── netlify/               # Funciones serverless de Netlify
│   ├── functions/api.js   # Proxy a API local o remota
│   ├── functions/db-init.js  # Inicializa o copia SQLite
│   └── functions/db/menu.db  # DB copiada a funciones
├── prepare-netlify.js     # Script para crear netlify.toml, _redirects, funciones, .env
├── prepare-db.js          # Copia la base de datos a netlify/functions/db
├── netlify.toml           # Configuración de build y redirecciones
├── package.json           # Scripts, dependencias y configuración de Netlify
└── README.md              # Documentación (este archivo)
```

## 🔧 Instalación y Desarrollo Local

1. Clonar el repositorio:
   ```bash
git clone https://github.com/nder1996/Menu-Barlovento.git
cd Menu-Barlovento
```
2. Instalar dependencias:
   ```bash
npm install
```
3. Ejecutar servidor local y SPA:
   ```bash
npm run dev         # Inicia Express con nodemon
npm start           # Inicia Netlify Dev (SPA + funciones)
```
4. Abrir en el navegador:
   ```
http://localhost:8888   # Netlify Dev sirve SPA y funciones
http://localhost:3000   # Solo el backend Express
```

## 🚀 Flujo de Despliegue Automático en Netlify

Cada vez que haces push a la rama principal (`main` o `master`), Netlify:

1. Clona el repositorio.
2. Ejecuta `npm run netlify-build`:
   - `prepare-netlify.js`: crea `netlify.toml`, `_redirects`, directorios y funciones.
   - `prepare-db.js`: copia la base de datos SQLite en `netlify/functions/db`.
3. Usa `netlify.toml` para:
   - Publicar `frontend/public`.
   - Ejecutar `echo No build command needed`.
   - Configurar las redirecciones SPA y API.
4. Despliega los archivos estáticos y serverless functions en la CDN de Netlify.

## 📜 Scripts Principales

| Script               | Descripción                                                  |
|----------------------|--------------------------------------------------------------|
| `npm run dev`        | Levanta Express con nodemon para desarrollo backend.         |
| `npm start`          | Levanta el servidor en producción local.                     |
| `npm run prepare-netlify` | Genera netlify.toml, funciones y .env para Netlify.    |
| `npm run prepare-db` | Copia la base de datos en el directorio de funciones.        |
| `npm run netlify-build` | Prepara todo para Netlify (`prepare-netlify` + `prepare-db`). |
| `npm run netlify-dev`   | Prepara DB y levanta Netlify Dev (SPA + funciones).      |
| `npm run deploy`     | Ejecuta `netlify-build` y `netlify deploy --prod`.           |

## 🌐 Despliegue por Consola

1. Instalar Netlify CLI (si no está):
   ```bash
npm install -g netlify-cli
```
2. Login en Netlify:
   ```bash
npx netlify login
```
3. Inicializar o enlazar sitio:
   ```bash
npx netlify init
```
4. Desplegar automáticamente:
   ```bash
npm run deploy
```

**Nota:** Netlify genera un subdominio aleatorio (por ejemplo `https://illustrious-dasik-accb04.netlify.app`). Tu URL será diferente y puedes cambiarla en el panel de Netlify en **Domain management** o asignar un dominio propio.

# Opción manual paso a paso:
```bash
npm run prepare-netlify   # genera netlify.toml, funciones y .env
npm run prepare-db        # copia la base de datos a funciones
npx netlify deploy --prod --dir=frontend/public
```

## 🔑 Variables de Entorno

- `API_ENDPOINT`: URL base de tu backend (por defecto `http://localhost:3000`).

## 🤝 Contribuciones

Abre un issue o pull request. ¡Todo aporte es bienvenido!
