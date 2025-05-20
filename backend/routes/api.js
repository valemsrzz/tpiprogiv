// Importamos el módulo Express para crear el enrutador
const express = require('express');
const router = express.Router();

// Importamos los controladores necesarios
const authController = require('../controllers/authController');
const calificacionesController = require('../controllers/calificacionesController');
const userController = require('../controllers/userController');

// Rutas de autenticación
router.post('/auth/login', authController.login);          // Ruta para iniciar sesión
router.post('/auth/register', authController.register);    // Ruta para registrar nuevo usuario
router.get('/auth/user/:dni', authController.getUserByDNI); // Ruta para obtener usuario por DNI

// Rutas de calificaciones
router.get('/calificaciones/:dni', calificacionesController.getCalificacionesByDNI);  // Obtener calificaciones por DNI
router.post('/calificaciones/:dni', calificacionesController.saveCalificaciones);      // Guardar calificaciones por DNI

// Rutas de usuarios
router.get('/users', userController.getAllUsers);                    // Obtener todos los usuarios
router.get('/users/pending', userController.getPendingUsers);        // Obtener usuarios pendientes de aprobación
router.post('/users/approve/:id', userController.approveUser);       // Aprobar un usuario específico
router.post('/users/create/admin', userController.createUserAdmin);  // Crear usuario desde el panel de administrador
router.post('/users/create', authController.register);               // Registro público de usuarios
router.delete('/users/:id', userController.deleteUser);             // Eliminar un usuario

// Exportamos el enrutador para ser usado en la aplicación principal
module.exports = router;