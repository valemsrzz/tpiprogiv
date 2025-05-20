// Importación de módulos necesarios para el servidor
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const db = require('./db');

// Definición de variables de entorno
const PORT = process.env.PORT || 3000;        // Puerto del servidor
const NODE_ENV = process.env.NODE_ENV || 'development';    // Entorno de desarrollo

// Configuración de middleware para CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: 'http://localhost:3000', // Origen permitido para las peticiones
    credentials: true // Habilita el envío de cookies y credenciales
}));

// Middleware para procesar datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de las sesiones de usuario
app.use(session({
    secret: 'your_secret_key',    // Clave secreta para firmar la cookie de sesión
    resave: false,                // No guardar la sesión si no hay cambios
    saveUninitialized: true,      // Guardar sesiones no inicializadas
    cookie: { 
        secure: false,            // false para HTTP, true para HTTPS
        httpOnly: true,           // Previene acceso desde JavaScript del cliente
        maxAge: 24 * 60 * 60 * 1000 // Duración de la cookie (24 horas)
    }
}));

// Configuración para servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas para las páginas principales
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});
app.get('/registrouser.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/registrouser.html'));
});

// Rutas específicas para alumnos
app.get('/inicio-alumno.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/inicio-alumno.html'));
});
app.get('/vistaalumn.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/vistaalumn.html'));
});

// Rutas específicas para profesores
app.get('/inicio-profesor.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/inicio-profesor.html'));
});
app.get('/calificaciones.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/calificaciones.html'));
});

// Ruta específica para el administrador
app.get('/administrador.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/administrador.html'));
});

// Importación y configuración de las rutas de la API
const authRoutes = require('./routes/authRoutes');         // Rutas de autenticación
const userRoutes = require('./routes/users');             // Rutas de usuarios
const calificacionesRoutes = require('./routes/calificacionesRoutes');  // Rutas de calificaciones

// Registro de las rutas de la API
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/calificaciones', calificacionesRoutes);

// Manejador para rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador global de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error en el servidor',
        // Solo muestra el mensaje de error en desarrollo
        message: NODE_ENV === 'development' ? err.message : undefined
    });
});

// Inicialización del servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Exportación de la conexión a la base de datos
module.exports = db;