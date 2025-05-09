const db = require('../config/db');

const Calificaciones = {
    // Obtener calificaciones de un alumno
    getByAlumno: async (id_alumno) => {
        try {
            const [rows] = await db.query(
                `SELECT c.*, m.nombre as materia_nombre 
                FROM calificaciones c 
                JOIN materias m ON c.id_materia = m.id 
                WHERE c.id_alumno = ?`,
                [id_alumno]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Crear nueva calificación
    create: async (calificacionData) => {
        try {
            const [result] = await db.query(
                'INSERT INTO calificaciones (id_alumno, id_materia, nota, periodo) VALUES (?, ?, ?, ?)',
                [calificacionData.id_alumno, calificacionData.id_materia, calificacionData.nota, calificacionData.periodo]
            );
            return result;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar calificación
    update: async (id, calificacionData) => {
        try {
            const [result] = await db.query(
                'UPDATE calificaciones SET nota = ? WHERE id = ?',
                [calificacionData.nota, id]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = Calificaciones;