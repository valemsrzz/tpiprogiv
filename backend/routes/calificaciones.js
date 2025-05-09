const express = require('express');
const router = express.Router();
const calificacionesController = require('../controllers/calificacionesController');
const { verifyToken, isProfesor } = require('../middleware/auth');

// Rutas protegidas
router.get('/alumno/:id', verifyToken, calificacionesController.getCalificacionesAlumno);
router.post('/', [verifyToken, isProfesor], calificacionesController.createCalificacion);
router.put('/:id', [verifyToken, isProfesor], calificacionesController.updateCalificacion);

module.exports = router;