const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('./auth');

// Add authentication middleware to all routes
router.use(authMiddleware);

// Route to get student information and grades by DNI
router.get('/alumno/:dni', async (req, res) => {
    const dni = req.params.dni;
    console.log('Searching student with DNI:', dni);
    
    try {
        // Get student information
        const [alumnos] = await db.promise().query(
            'SELECT id, nombre, apellido, dni, id_curso FROM usuarios WHERE dni = ? AND rol = "alumno"',
            [dni]
        );

        if (alumnos.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const alumno = alumnos[0];

        // Get course information
        const [cursoInfo] = await db.promise().query(
            'SELECT nombre FROM cursos WHERE id = ?',
            [alumno.id_curso]
        );

        alumno.curso = cursoInfo.length > 0 ? cursoInfo[0].nombre : 'Not assigned';

        // Get grades
        const [calificaciones] = await db.promise().query(
            'SELECT c.id_materia, m.nombre as materia, c.primer_informe1, c.primer_informe2, c.primer_final, ' +
            'c.segundo_informe1, c.segundo_informe2, c.segundo_final ' +
            'FROM calificaciones c ' +
            'JOIN materias m ON c.id_materia = m.id ' +
            'WHERE c.id_alumno = ?',
            [alumno.id]
        );

        res.json({
            alumno,
            calificaciones
        });
    } catch (error) {
        console.error('Complete error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to verify if a grade exists
router.get('/verificar/:id_alumno/:id_materia', async (req, res) => {
    const { id_alumno, id_materia } = req.params;
    try {
        const [calificaciones] = await db.promise().query(
            'SELECT * FROM calificaciones WHERE id_alumno = ? AND id_materia = ?',
            [id_alumno, id_materia]
        );
        res.json({ exists: calificaciones.length > 0 });
    } catch (error) {
        console.error('Error verifying grade:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to create a new grade record
router.post('/crear', async (req, res) => {
    const { id_alumno, id_materia } = req.body;
    try {
        await db.promise().query(
            'INSERT INTO calificaciones (id_alumno, id_materia) VALUES (?, ?)',
            [id_alumno, id_materia]
        );
        res.json({ success: true, message: 'Grade record created' });
    } catch (error) {
        console.error('Error creating grade:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to update grades
router.post('/actualizar', async (req, res) => {
    const { id_alumno, id_materia, tipo, valor } = req.body;
    
    try {
        // Verify required fields
        if (!id_alumno || !id_materia || !tipo || valor === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate grade type
        const tiposValidos = [
            'primer_informe1', 'primer_informe2', 'primer_final',
            'segundo_informe1', 'segundo_informe2', 'segundo_final'
        ];
        
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({ error: 'Invalid grade type' });
        }

        // Validate grade value
        const valorNumerico = parseFloat(valor);
        if (isNaN(valorNumerico) || valorNumerico < 1 || valorNumerico > 10) {
            return res.status(400).json({ error: 'Grade must be between 1 and 10' });
        }

        // Check if record exists
        const [existingRecord] = await db.promise().query(
            'SELECT * FROM calificaciones WHERE id_alumno = ? AND id_materia = ?',
            [id_alumno, id_materia]
        );

        // Create record if it doesn't exist
        if (existingRecord.length === 0) {
            await db.promise().query(
                'INSERT INTO calificaciones (id_alumno, id_materia) VALUES (?, ?)',
                [id_alumno, id_materia]
            );
        }

        // Update the grade
        await db.promise().query(
            `UPDATE calificaciones SET ${tipo} = ? WHERE id_alumno = ? AND id_materia = ?`,
            [valorNumerico, id_alumno, id_materia]
        );

        res.json({ success: true, message: 'Grade updated successfully' });
    } catch (error) {
        console.error('Error updating grade:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;