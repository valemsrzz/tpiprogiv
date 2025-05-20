const bcrypt = require('bcrypt');  // Importamos bcrypt para el cifrado de contraseñas
const db = require('../config/db'); // Importamos la conexión a la base de datos

// Función para crear un nuevo usuario
const createUser = async (req, res) => {
    try {
        // Extraemos todos los datos necesarios del cuerpo de la petición
        const { nombre, apellido, dni, telefono, username, password, email, rol } = req.body;

        // Encriptamos la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Los usuarios creados por el administrador están automáticamente activos
        const estado = 'activo';

        // Insertamos el nuevo usuario en la base de datos
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, apellido, dni, telefono, username, password, email, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido, dni, telefono, username, hashedPassword, email, rol, estado]
        );

        // Enviamos respuesta exitosa
        res.json({ 
            success: true, 
            message: 'Usuario creado exitosamente',
            userId: result.insertId 
        });

    } catch (error) {
        // Manejamos cualquier error que ocurra durante la creación
        console.error('Error creating user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear usuario',
            error: error.message 
        });
    }
};

// Función para obtener usuarios pendientes de aprobación
const getPendingUsers = async (req, res) => {
    try {
        // Consultamos todos los usuarios con estado pendiente
        const [users] = await db.query(
            'SELECT id, nombre, apellido, email, dni, id_curso FROM usuarios WHERE estado = "pendiente"'
        );
        res.json({ success: true, users });
    } catch (error) {
        // Manejamos errores en la consulta
        console.error('Error getting pending users:', error);
        res.status(500).json({ success: false, message: 'Error al obtener usuarios pendientes' });
    }
};

// Función para aprobar un usuario pendiente
const approveUser = async (req, res) => {
    try {
        // Obtenemos el ID del usuario a aprobar
        const { id } = req.params;
        // Actualizamos su estado a activo
        await db.query(
            'UPDATE usuarios SET estado = "activo" WHERE id = ?',
            [id]
        );
        res.json({ success: true, message: 'Usuario aprobado exitosamente' });
    } catch (error) {
        // Manejamos errores en la actualización
        console.error('Error approving user:', error);
        res.status(500).json({ success: false, message: 'Error al aprobar usuario' });
    }
};

// Función para eliminar un usuario
const deleteUser = async (req, res) => {
    try {
        // Obtenemos el ID del usuario a eliminar
        const { id } = req.params;
        // Eliminamos el usuario de la base de datos
        await db.query(
            'DELETE FROM usuarios WHERE id = ?',
            [id]
        );
        res.json({ success: true, message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        // Manejamos errores en la eliminación
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
    }
};

// Función para obtener todos los usuarios
const getAllUsers = async (req, res) => {
    try {
        // Consultamos todos los usuarios con información básica
        const [users] = await db.query(
            'SELECT id, nombre, apellido, username, id_curso, rol FROM usuarios'
        );
        res.json({ success: true, users });
    } catch (error) {
        // Manejamos errores en la consulta
        console.error('Error getting all users:', error);
        res.status(500).json({ success: false, message: 'Error al obtener todos los usuarios' });
    }
};

// Exportamos todas las funciones para ser utilizadas en las rutas
module.exports = {
    createUser,
    getPendingUsers,
    approveUser,
    deleteUser,
    getAllUsers
};