const createUser = async (req, res) => {
    try {
        const userData = req.body;
        // Users created by admin are automatically active
        userData.estado = 'activo';
        
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, apellido, email, username, password, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userData.nombre, userData.apellido, userData.email, userData.username, hashedPassword, userData.rol, userData.estado]
        );

        res.json({ success: true, message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

const getPendingUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, nombre, apellido, email, username, rol FROM usuarios WHERE estado = "pendiente"'
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios pendientes' });
    }
};

const approveUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await db.query(
            'UPDATE usuarios SET estado = "activo" WHERE id = ?',
            [userId]
        );
        res.json({ success: true, message: 'Usuario aprobado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al aprobar usuario' });
    }
};