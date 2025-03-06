const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../models/db');
const router = express.Router();

// 1️⃣ Registrar usuario en "usuarios_pendientes"
router.post('/registro', async (req, res) => {
    const { nombre, apellido, correo, telefono, dni, nombre_usuario, contraseña } = req.body;
    
    try {
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        
        // Insertar en la tabla usuarios_pendientes
        const [result] = await pool.query(`
            INSERT INTO usuarios_pendientes (nombre, apellido, correo, telefono, dni, nombre_usuario, contraseña)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nombre, apellido, correo, telefono, dni, nombre_usuario, hashedPassword]
        );

        res.status(201).json({ message: "Registro en espera de aprobación" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el registro" });
    }
});

// 2️⃣ Aprobar usuario y moverlo a "usuarios"
router.post('/aprobar/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener usuario pendiente
        const [rows] = await pool.query(`SELECT * FROM usuarios_pendientes WHERE id = ?`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const usuario = rows[0];

        // Mover a la tabla definitiva (usuarios)
        await pool.query(`
            INSERT INTO usuarios (nombre, apellido, correo, telefono, dni, nombre_usuario, contraseña, rol)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [usuario.nombre, usuario.apellido, usuario.correo, usuario.telefono, usuario.dni, usuario.nombre_usuario, usuario.contraseña, 'alumno']
        );

        // Eliminar de usuarios_pendientes
        await pool.query(`DELETE FROM usuarios_pendientes WHERE id = ?`, [id]);

        res.json({ message: "Usuario aprobado y registrado correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al aprobar usuario" });
    }
});

// 3️⃣ Rechazar usuario (Eliminarlo de "usuarios_pendientes")
router.delete('/rechazar/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar usuario pendiente
        await pool.query(`DELETE FROM usuarios_pendientes WHERE id = ?`, [id]);

        res.json({ message: "Usuario rechazado y eliminado" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar usuario" });
    }
});

module.exports = router;
