const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

// Ruta de inicio de sesión
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await db.promise().query(
            'SELECT * FROM usuarios WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const user = users[0];

        // Bloqueo para alumnos pendientes
        if (user.rol === 'alumno' && user.estado === 'pendiente') {
            return res.status(403).json({ error: 'Esperando aprobación del administrador' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            rol: user.rol,
            estado: user.estado
        };

        let redirectPath = '/login.html';
        if (user.rol === 'alumno') redirectPath = '/inicio-alumno.html';
        if (user.rol === 'profesor') redirectPath = '/inicio-profesor.html';
        if (user.rol === 'admin') redirectPath = '/administrador.html';

        res.json({ success: true, redirect: redirectPath, role: user.rol });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta de cierre de sesión
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Error al cerrar sesión' });
        res.json({ success: true, redirect: '/login.html' });
    });
});

// Verificar sesión
router.get('/check', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
});

// Registro de usuario nuevo (por defecto: alumno, estado pendiente)
router.post('/register', async (req, res) => {
    const { nombre, apellido, dni, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO usuarios 
            (nombre, apellido, dni, email, password, username, rol, estado) 
            VALUES (?, ?, ?, ?, ?, ?, 'alumno', 'pendiente')
        `;
        const username = email.split('@')[0];

        db.query(query, [nombre, apellido, dni, email, hashedPassword, username], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'El usuario ya existe' });
                }
                return res.status(500).json({ error: 'Error al registrar usuario' });
            }
            res.json({ success: true });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

module.exports = router;
