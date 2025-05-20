// Importaciones necesarias (no mostradas en el código original)
const bcrypt = require('bcrypt');
const db = require('../db');

// Función asincrónica para crear un nuevo usuario
const createUser = async (req, res) => {
    try {
        // Obtenemos los datos del usuario del cuerpo de la petición
        const userData = req.body;
        
        // Establecemos el estado como 'activo' ya que es creado por un administrador
        userData.estado = 'activo';
        
        // Encriptamos la contraseña por seguridad antes de guardarla
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Realizamos la inserción en la base de datos con todos los datos del usuario
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, apellido, email, username, password, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userData.nombre, userData.apellido, userData.email, userData.username, hashedPassword, userData.rol, userData.estado]
        );

        // Enviamos una respuesta exitosa al cliente
        res.json({ success: true, message: 'Usuario creado exitosamente' });
    } catch (error) {
        // Si ocurre algún error, lo registramos y enviamos una respuesta de error
        console.error(error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

// Función para obtener la lista de usuarios pendientes de aprobación
const getPendingUsers = async (req, res) => {
    try {
        // Consultamos los usuarios con estado 'pendiente'
        // Note que solo seleccionamos los campos necesarios por seguridad
        const [users] = await db.query(
            'SELECT id, nombre, apellido, email, username, rol FROM usuarios WHERE estado = "pendiente"'
        );
        // Enviamos la lista de usuarios pendientes como respuesta
        res.json(users);
    } catch (error) {
        // Manejamos cualquier error que ocurra durante la consulta
        res.status(500).json({ message: 'Error al obtener usuarios pendientes' });
    }
};

// Función para aprobar un usuario que está en estado pendiente
const approveUser = async (req, res) => {
    try {
        // Extraemos el ID del usuario de los parámetros de la URL
        const { userId } = req.params;
        
        // Actualizamos el estado del usuario a 'activo'
        await db.query(
            'UPDATE usuarios SET estado = "activo" WHERE id = ?',
            [userId]
        );
        
        // Enviamos una respuesta exitosa
        res.json({ success: true, message: 'Usuario aprobado exitosamente' });
    } catch (error) {
        // Manejamos cualquier error durante la actualización
        res.status(500).json({ message: 'Error al aprobar usuario' });
    }
};

// Exportamos las funciones para ser utilizadas en las rutas
module.exports = {
    createUser,
    getPendingUsers,
    approveUser
};