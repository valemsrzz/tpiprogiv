const Calificaciones = require('../models/calificaciones');

const calificacionesController = {
    // Obtener calificaciones de un alumno
    getCalificacionesAlumno: async (req, res) => {
        try {
            const id_alumno = req.params.id;
            const calificaciones = await Calificaciones.getByAlumno(id_alumno);
            res.json(calificaciones);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Crear nueva calificación
    createCalificacion: async (req, res) => {
        try {
            const result = await Calificaciones.create(req.body);
            res.status(201).json({ message: 'Calificación creada exitosamente', id: result.insertId });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Actualizar calificación
    updateCalificacion: async (req, res) => {
        try {
            const id = req.params.id;
            await Calificaciones.update(id, req.body);
            res.json({ message: 'Calificación actualizada exitosamente' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = calificacionesController;