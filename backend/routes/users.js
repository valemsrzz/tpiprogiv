const express = require('express');
const router = express.Router();
const db = require('../db');
const { adminMiddleware, authMiddleware } = require('./auth');
const bcrypt = require('bcrypt');

// Get all users (admin only)
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

// Get pending users (admin only)
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

// Approve user (admin only)
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

// Create user (admin only)
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

// Create user (public registration)
router.post('/create', async (req, res) => {
    console.log('Received registration request:', req.body);
    const { nombre, email, telefono, dni, username, password, id_curso } = req.body;

    if (!nombre || !dni || !email || !telefono || !username || !password || !id_curso) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        // First get the course ID from the name
        const [courseResult] = await db.promise().query('SELECT id FROM cursos WHERE nombre = ?', [id_curso]);
        
        if (courseResult.length === 0) {
            return res.status(400).json({ error: 'Curso no válido' });
        }

        const courseId = courseResult[0].id;
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO usuarios (nombre, dni, email, telefono, username, password, id_curso, rol, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'alumno', 'pendiente')
        `;

        await db.promise().query(query, [
            nombre, 
            dni, 
            email, 
            telefono, 
            username, 
            hashedPassword, 
            courseId  // Using the numeric ID instead of the course name
        ]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

// Eliminar usuario (admin only)
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

module.exports = router;  // Make sure this line is at the end of the file
