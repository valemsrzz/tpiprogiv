const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { authMiddleware } = require('../routes/auth');
const db = require('../db');

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username }); // Debug log

    try {
        const [users] = await db.promise().query(
            'SELECT * FROM usuarios WHERE username = ?', // Removed filters temporarily for debugging
            [username]
        );
        
        console.log('Found users:', users.length); // Debug log
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado o pendiente de aprobación' });
        }

        const user = users[0];
        console.log('User found:', { 
            username: user.username, 
            rol: user.rol, 
            estado: user.estado 
        }); // Debug log

        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Password valid:', validPassword); // Debug log

        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Set user session
        req.session.user = {
            id: user.id,
            username: user.username,
            rol: user.rol,
            estado: user.estado
        };

        res.json({ 
            success: true, 
            redirect: user.rol === 'admin' ? '/administrador.html' : '/dashboard.html',
            role: user.rol
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Logout route
router.post('/logout', authMiddleware, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.json({ success: true });
    });
});

// Check session status
router.get('/check', (req, res) => {
    if (req.session.user) {
        res.json({ 
            authenticated: true, 
            user: req.session.user 
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Register route
router.post('/register', async (req, res) => {
    const { nombre, apellido, dni, email, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = 'INSERT INTO usuarios (nombre, apellido, dni, email, password, estado) VALUES (?, ?, ?, ?, ?, "pendiente")';
        db.query(query, [nombre, apellido, dni, email, hashedPassword], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Usuario ya existe' });
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