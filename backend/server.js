// Importación de módulos necesarios
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const db = require('./db');

// Variables de entorno
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configuración de middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas de páginas principales
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});
app.get('/registrouser.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/registrouser.html'));
});

// Rutas específicas por rol de usuario
// Rutas para alumnos
app.get('/inicio-alumno.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/inicio-alumno.html'));
});
app.get('/vistaalumn.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/vistaalumn.html'));
});

// Rutas para profesores
app.get('/inicio-profesor.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/inicio-profesor.html'));
});
app.get('/calificaciones.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/calificaciones.html'));
});

// Ruta para administrador
app.get('/administrador.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/administrador.html'));
});

// Configuración de rutas API
const authRoutes = require('./routes/authRoutes');
const gradesRoutes = require('./routes/grades');
const userRoutes = require('./routes/users');
app.use('/api/auth', authRoutes); 
app.use('/api/grades', gradesRoutes);
app.use('/api/users', userRoutes);

// Manejadores de errores
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error en el servidor',
        message: NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = db;