// Importamos la conexión a la base de datos
const db = require('../config/db');

// Definimos el objeto Calificaciones que contendrá todos los métodos relacionados con calificaciones
const Calificaciones = {
    // Método para obtener todas las calificaciones de un alumno específico
    getByAlumno: async (id_alumno) => {
        try {
            // Realizamos una consulta JOIN para obtener las calificaciones con los nombres de las materias
            const [rows] = await db.query(
                `SELECT c.*, m.nombre as materia_nombre 
                FROM calificaciones c 
                JOIN materias m ON c.id_materia = m.id 
                WHERE c.id_alumno = ?`,
                [id_alumno]
            );
            // Devolvemos los resultados de la consulta
            return rows;
        } catch (error) {
            // Si ocurre un error, lo propagamos
            throw error;
        }
    },

    // Método para crear una nueva calificación en la base de datos
    create: async (calificacionData) => {
        try {
            // Insertamos la nueva calificación con los datos proporcionados
            const [result] = await db.query(
                'INSERT INTO calificaciones (id_alumno, id_materia, nota, periodo) VALUES (?, ?, ?, ?)',
                [calificacionData.id_alumno, calificacionData.id_materia, calificacionData.nota, calificacionData.periodo]
            );
            // Devolvemos el resultado de la inserción
            return result;
        } catch (error) {
            // Si ocurre un error, lo propagamos
            throw error;
        }
    },

    // Método para actualizar una calificación existente
    update: async (id, calificacionData) => {
        try {
            // Actualizamos la nota de la calificación específica
            const [result] = await db.query(
                'UPDATE calificaciones SET nota = ? WHERE id = ?',
                [calificacionData.nota, id]
            );
            // Devolvemos el resultado de la actualización
            return result;
        } catch (error) {
            // Si ocurre un error, lo propagamos
            throw error;
        }
    }
};

// Exportamos el modelo para ser utilizado en otras partes de la aplicación
module.exports = Calificaciones;