const bcrypt = require('bcrypt');
const db = require('../db');

// LOGIN DE USUARIO
const login = async (req, res) => {
    try {
        const { dni, password } = req.body;

        // Buscar usuario por DNI
        const [users] = await db.promise().query(
            'SELECT id, nombre, apellido, password, rol, estado, email FROM usuarios WHERE dni = ?',
            [dni]
        );
        const user = users[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }

        // Verificar estado
        if (user.estado !== 'activo') {
            const msg = user.estado === 'pendiente'
                ? 'Tu cuenta está pendiente de aprobación por el administrador.'
                : 'Tu cuenta ha sido desactivada. Contacta al administrador.';
            return res.status(403).json({ success: false, message: msg });
        }

        // Crear token simple (en producción usar JWT)
        const token = Buffer.from(`${user.id}-${Date.now()}`).toString('base64');

        // Guardar token en sesión
        req.session.user = {
            id: user.id,
            rol: user.rol,
            token: token
        };

        // Redirección según rol
        let redirect;
        switch (user.rol) {
            case 'admin':
                redirect = '/administrador.html';
                break;
            case 'profesor':
                redirect = '/profesor.html';
                break;
            case 'alumno':
                redirect = '/alumno.html';
                break;
            default:
                redirect = '/login.html';
        }

        res.json({
            success: true,
            redirect,
            role: user.rol,
            token: token
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// REGISTRO DE USUARIO AUTOGESTIONADO (rol alumno, estado pendiente)
const register = async (req, res) => {
    try {
        const { nombre, email, telefono, dni, username, password, id_curso } = req.body;

        if (!nombre || !dni || !email || !telefono || !username || !password || !id_curso) {
            return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
        }

        // Validar que el curso exista
        const [courseResult] = await db.promise().query('SELECT id FROM cursos WHERE nombre = ?', [id_curso]);
        if (courseResult.length === 0) {
            return res.status(400).json({ success: false, message: 'Curso no válido' });
        }

        const courseId = courseResult[0].id;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario con estado pendiente
        await db.promise().query(
            'INSERT INTO usuarios (nombre, dni, email, telefono, username, password, id_curso, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?, "alumno", "pendiente")',
            [nombre, dni, email, telefono, username, hashedPassword, courseId]
        );

        res.json({ success: true, message: 'Registro exitoso. Esperando aprobación del administrador.' });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, message: 'Error en el registro' });
    }
};

module.exports = {
    login,
    register
};
