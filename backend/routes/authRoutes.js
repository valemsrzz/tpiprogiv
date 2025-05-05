// Importación de módulos necesarios
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { authMiddleware } = require('../routes/auth');
const db = require('../db');

// Ruta de inicio de sesión
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Intento de inicio de sesión:', { username });

    try {
        // Buscar usuario en la base de datos
        const [users] = await db.promise().query(
            'SELECT * FROM usuarios WHERE username = ?',
            [username]
        );
        console.log('Usuarios encontrados:', users.length);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado o pendiente de aprobación' });
        }

        const user = users[0];
        console.log('Usuario encontrado:', { 
            username: user.username, 
            rol: user.rol, 
            estado: user.estado 
        });

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Contraseña válida:', validPassword);

        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Establecer sesión de usuario
        req.session.user = {
            id: user.id,
            username: user.username,
            rol: user.rol,
            estado: user.estado
        };

        // Determinar redirección según rol
        let redirectPath;
        switch(user.rol) {
            case 'alumno':
                redirectPath = '/inicio-alumno.html';
                break;
            case 'profesor':
                redirectPath = '/inicio-profesor.html';
                break;
            case 'admin':
                redirectPath = '/administrador.html';
                break;
            default:
                redirectPath = '/login.html';
        }

        res.json({ 
            success: true, 
            redirect: redirectPath,
            role: user.rol
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta de cierre de sesión
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.json({ 
            success: true,
            redirect: '/login.html'  // Agregamos redirección explícita al login
        });
    });
});

// Ruta para verificar estado de sesión
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

// Ruta de registro de usuario
router.post('/register', async (req, res) => {
    const { nombre, apellido, dni, email, password } = req.body;
    
    try {
        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insertar nuevo usuario
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