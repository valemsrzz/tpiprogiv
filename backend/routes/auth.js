// Importamos el módulo Express para crear el enrutador
const express = require('express');
const router = express.Router();
// Importamos las funciones de login y registro del controlador de autenticación
const { login, register } = require('../controllers/authController');

// Definimos las rutas básicas de autenticación
router.post('/login', login);      // Ruta para iniciar sesión
router.post('/register', register); // Ruta para registrarse

// Middleware para verificar si el usuario está autenticado
const authMiddleware = (req, res, next) => {
    // Verifica si existe una sesión de usuario
    if (!req.session.user) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    next(); // Continúa con la siguiente función si está autenticado
};

// Middleware para verificar si el usuario es administrador
const adminMiddleware = (req, res, next) => {
    // Obtiene el rol del usuario y lo convierte a minúsculas
    const role = req.session.user?.rol?.toLowerCase();
    // Verifica si el rol existe y si es admin o administrador
    if (!role || (role !== 'admin' && role !== 'administrador')) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    next(); // Continúa si es administrador
};

// Middleware para verificar si el usuario es alumno
const alumnoMiddleware = (req, res, next) => {
    // Obtiene el rol del usuario y lo convierte a minúsculas
    const role = req.session.user?.rol?.toLowerCase();
    // Verifica si el rol existe y si es alumno
    if (!role || role !== 'alumno') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    next(); // Continúa si es alumno
};

// Ruta para verificar el estado de la sesión del usuario
router.get('/check-session', authMiddleware, (req, res) => {
    // Devuelve la información de autenticación y datos básicos del usuario
    res.json({
        authenticated: true,
        user: {
            rol: req.session.user.rol,
            dni: req.session.user.dni
        }
    });
});

// Exportamos los middleware y el enrutador para ser usados en otras partes de la aplicación
module.exports = {
    authMiddleware,
    adminMiddleware,
    alumnoMiddleware,
    router
};