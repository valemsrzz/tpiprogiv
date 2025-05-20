// Importamos los módulos necesarios
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('./auth');

// Aplicamos el middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Ruta para obtener información del alumno y sus calificaciones por DNI
router.get('/alumno/:dni', async (req, res) => {
    const dni = req.params.dni;
    console.log('Buscando estudiante con DNI:', dni);
    
    try {
        // Obtenemos la información del alumno
        const [alumnos] = await db.promise().query(
            'SELECT id, nombre, apellido, dni, id_curso FROM usuarios WHERE dni = ? AND rol = "alumno"',
            [dni]
        );

        if (alumnos.length === 0) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        const alumno = alumnos[0];

        // Obtenemos la información del curso
        const [cursoInfo] = await db.promise().query(
            'SELECT nombre FROM cursos WHERE id = ?',
            [alumno.id_curso]
        );

        alumno.curso = cursoInfo.length > 0 ? cursoInfo[0].nombre : 'No asignado';

        // Obtenemos las calificaciones
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
        console.error('Error completo:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Ruta para verificar si existe una calificación
router.get('/verificar/:id_alumno/:id_materia', async (req, res) => {
    const { id_alumno, id_materia } = req.params;
    try {
        const [calificaciones] = await db.promise().query(
            'SELECT * FROM calificaciones WHERE id_alumno = ? AND id_materia = ?',
            [id_alumno, id_materia]
        );
        res.json({ exists: calificaciones.length > 0 });
    } catch (error) {
        console.error('Error al verificar calificación:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Ruta para crear un nuevo registro de calificación
router.post('/crear', async (req, res) => {
    const { id_alumno, id_materia } = req.body;
    try {
        await db.promise().query(
            'INSERT INTO calificaciones (id_alumno, id_materia) VALUES (?, ?)',
            [id_alumno, id_materia]
        );
        res.json({ success: true, message: 'Registro de calificación creado' });
    } catch (error) {
        console.error('Error al crear calificación:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Ruta para actualizar calificaciones
router.post('/actualizar', async (req, res) => {
    const { id_alumno, id_materia, tipo, valor } = req.body;
    
    try {
        // Verificamos que estén todos los campos requeridos
        if (!id_alumno || !id_materia || !tipo || valor === undefined) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        // Validamos el tipo de calificación
        const tiposValidos = [
            'primer_informe1', 'primer_informe2', 'primer_final',
            'segundo_informe1', 'segundo_informe2', 'segundo_final'
        ];
        
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({ error: 'Tipo de calificación inválido' });
        }

        // Validamos el valor de la calificación
        const valorNumerico = parseFloat(valor);
        if (isNaN(valorNumerico) || valorNumerico < 1 || valorNumerico > 10) {
            return res.status(400).json({ error: 'La calificación debe estar entre 1 y 10' });
        }

        // Verificamos si existe el registro
        const [existingRecord] = await db.promise().query(
            'SELECT * FROM calificaciones WHERE id_alumno = ? AND id_materia = ?',
            [id_alumno, id_materia]
        );

        // Creamos el registro si no existe
        if (existingRecord.length === 0) {
            await db.promise().query(
                'INSERT INTO calificaciones (id_alumno, id_materia) VALUES (?, ?)',
                [id_alumno, id_materia]
            );
        }

        // Actualizamos la calificación
        await db.promise().query(
            `UPDATE calificaciones SET ${tipo} = ? WHERE id_alumno = ? AND id_materia = ?`,
            [valorNumerico, id_alumno, id_materia]
        );

        res.json({ success: true, message: 'Calificación actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar calificación:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Exportamos el enrutador para ser usado en la aplicación principal
module.exports = router;