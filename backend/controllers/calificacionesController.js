const db = require('../db');

exports.getCalificacionesByDNI = async (req, res) => {
    const dni = req.params.dni;
    
    try {
        // Solo seleccionamos las columnas que sabemos que existen
        const [alumnos] = await db.promise().query(
            'SELECT id, nombre, apellido, dni, id_curso, rol FROM usuarios WHERE dni = ? AND rol = "alumno"',
            [dni]
        );

        if (alumnos.length === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        const alumno = alumnos[0];

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
        console.error('Error al obtener calificaciones:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};