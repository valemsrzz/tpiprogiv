// Importación de módulos necesarios
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { adminMiddleware } = require('./auth');
const { register } = require('../controllers/authController');

// Ruta para obtener todos los usuarios (solo accesible por administradores)
router.get('/', adminMiddleware, async (req, res) => {
    try {
        // Consulta para obtener datos básicos de todos los usuarios
        const [results] = await db.promise().query(
            'SELECT id, nombre, apellido, username, id_curso, rol FROM usuarios'
        );
        res.json({ success: true, users: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Ruta para obtener usuarios pendientes de aprobación (solo administradores)
router.get('/pending', adminMiddleware, async (req, res) => {
    try {
        // Consulta para obtener usuarios con estado pendiente
        const [results] = await db.promise().query(
            'SELECT id, nombre, email, dni, id_curso FROM usuarios WHERE estado = "pendiente"'
        );
        res.json({ success: true, users: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener usuarios pendientes' });
    }
});

// Ruta para aprobar un usuario (solo administradores)
router.post('/approve/:id', adminMiddleware, async (req, res) => {
    try {
        // Actualiza el estado del usuario a "activo"
        await db.promise().query(
            'UPDATE usuarios SET estado = "activo" WHERE id = ?',
            [req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al aprobar usuario' });
    }
});

// Ruta para crear usuario desde el panel de administración (estado activo por defecto)
router.post('/create/admin', adminMiddleware, async (req, res) => {
    // Extraemos los datos del cuerpo de la petición
    const { nombre, apellido, dni, email, telefono, username, password, rol } = req.body;
    try {
        // Encriptamos la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insertamos el nuevo usuario con estado activo
        await db.promise().query(
            'INSERT INTO usuarios (nombre, apellido, dni, email, telefono, username, password, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "activo")',
            [nombre, apellido, dni, email, telefono, username, hashedPassword, rol]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

// Ruta para registro público de usuarios (estado pendiente por defecto)
router.post('/create', register);

// Ruta para eliminar usuario (solo administradores)
router.delete('/:id', adminMiddleware, async (req, res) => {
    const userId = req.params.id;
    try {
        // Intentamos eliminar el usuario
        const [result] = await db.promise().query('DELETE FROM usuarios WHERE id = ?', [userId]);
        // Verificamos si se eliminó algún usuario
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

// Exportamos el enrutador para ser usado en la aplicación principal
module.exports = router;
