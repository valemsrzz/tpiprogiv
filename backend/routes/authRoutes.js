// Importamos los módulos necesarios para el enrutador
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// Ruta para manejar el inicio de sesión de usuarios
router.post('/login', login);

// Ruta para manejar el cierre de sesión
router.post('/logout', (req, res) => {
    // Destruye la sesión actual del usuario
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Error al cerrar sesión' });
        res.json({ success: true, redirect: '/login.html' });
    });
});

// Ruta para verificar si existe una sesión activa del usuario
router.get('/check', (req, res) => {
    // Verifica si hay información del usuario almacenada en la sesión
    if (req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
});

// Ruta para registrar un nuevo usuario (por defecto como alumno pendiente)
router.post('/register', async (req, res) => {
    // Extraemos los datos necesarios del cuerpo de la petición
    const { nombre, apellido, dni, email, password } = req.body;

    try {
        // Encriptamos la contraseña por seguridad antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Preparamos la consulta SQL para insertar el nuevo usuario en la base de datos
        const query = `
            INSERT INTO usuarios 
            (nombre, apellido, dni, email, password, username, rol, estado) 
            VALUES (?, ?, ?, ?, ?, ?, 'alumno', 'pendiente')
        `;
        // Generamos el nombre de usuario a partir del correo electrónico
        const username = email.split('@')[0];

        // Ejecutamos la consulta en la base de datos
        db.query(query, [nombre, apellido, dni, email, hashedPassword, username], (err) => {
            if (err) {
                // Si el usuario ya existe, devolvemos un error
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'El usuario ya existe' });
                }
                return res.status(500).json({ error: 'Error al registrar usuario' });
            }
            // Si todo sale bien, enviamos una respuesta exitosa
            res.json({ success: true });
        });
    } catch (error) {
        // Manejamos cualquier error que ocurra durante el proceso
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

// Exportamos el enrutador para que pueda ser utilizado en la aplicación principal
module.exports = router;
