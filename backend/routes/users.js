// Importación de módulos necesarios
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { adminMiddleware } = require('./auth');
const { register } = require('../controllers/authController'); // Ruta corregida según tu estructura

// Obtener todos los usuarios (solo admin)
router.get('/', adminMiddleware, async (req, res) => {
    try {
        const [results] = await db.promise().query(
            'SELECT id, nombre, apellido, username, id_curso, rol FROM usuarios'
        );
        res.json({ success: true, users: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Obtener usuarios pendientes (solo admin)
router.get('/pending', adminMiddleware, async (req, res) => {
    try {
        const [results] = await db.promise().query(
            'SELECT id, nombre, email, dni, id_curso FROM usuarios WHERE estado = "pendiente"'
        );
        res.json({ success: true, users: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener usuarios pendientes' });
    }
});

// Aprobar usuario (solo admin)
router.post('/approve/:id', adminMiddleware, async (req, res) => {
    try {
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

// Crear usuario desde panel admin (activo por defecto)
router.post('/create/admin', adminMiddleware, async (req, res) => {
    const { nombre, apellido, dni, email, telefono, username, password, rol } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
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

// Registro público de usuarios (estado: pendiente)
router.post('/create', register);

// Eliminar usuario (solo admin)
router.delete('/:id', adminMiddleware, async (req, res) => {
    const userId = req.params.id;
    try {
        const [result] = await db.promise().query('DELETE FROM usuarios WHERE id = ?', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

module.exports = router;
