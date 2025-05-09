const bcrypt = require('bcrypt');
const db = require('../config/db');

const createUser = async (req, res) => {
    try {
        const { nombre, apellido, dni, telefono, username, password, email, rol } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Users created by admin are automatically active
        const estado = 'activo';

        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, apellido, dni, telefono, username, password, email, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido, dni, telefono, username, hashedPassword, email, rol, estado]
        );

        res.json({ 
            success: true, 
            message: 'Usuario creado exitosamente',
            userId: result.insertId 
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear usuario',
            error: error.message 
        });
    }
};

// ... rest of the controller methods ...

module.exports = {
    createUser,
    getPendingUsers,
    approveUser,
    deleteUser,
    getAllUsers
};