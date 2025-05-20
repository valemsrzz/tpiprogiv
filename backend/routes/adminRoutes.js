// Importa el módulo Express para crear el enrutador
const express = require('express');
// Crea una nueva instancia del enrutador de Express
const router = express.Router();
// Importa el controlador de administrador que contiene la lógica de las rutas
const adminController = require('../controllers/adminController');
// Importa los middleware de autenticación y verificación de rol de administrador
const { verifyToken, isAdmin } = require('../middleware/auth');

// Ruta POST para crear nuevos usuarios
// Utiliza los middleware de verificación de token y rol de administrador
router.post('/users', [verifyToken, isAdmin], adminController.createUser);

// Ruta GET para obtener la lista de usuarios pendientes de aprobación
// También protegida por los middleware de autenticación y rol
router.get('/pending-users', [verifyToken, isAdmin], adminController.getPendingUsers);

// Ruta PUT para aprobar un usuario específico por su ID
// Requiere autenticación y rol de administrador
router.put('/approve-user/:userId', [verifyToken, isAdmin], adminController.approveUser);

// Exporta el enrutador para ser utilizado en la aplicación principal
module.exports = router;