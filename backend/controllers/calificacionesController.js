const db = require('../db'); // Importamos la conexión a la base de datos

// Función para obtener las calificaciones de un alumno por su DNI
exports.getCalificacionesByDNI = async (req, res) => {
    const dni = req.params.dni;
    
    try {
        // Buscamos al alumno en la base de datos, seleccionando solo los campos necesarios
        const [alumnos] = await db.promise().query(
            'SELECT id, nombre, apellido, dni, id_curso, rol FROM usuarios WHERE dni = ? AND rol = "alumno"',
            [dni]
        );

        // Si no encontramos al alumno, devolvemos un error
        if (alumnos.length === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        const alumno = alumnos[0];

        // Obtenemos todas las calificaciones del alumno junto con los nombres de las materias
        const [calificaciones] = await db.promise().query(
            'SELECT c.id_materia, m.nombre as materia, c.primer_informe1, c.primer_informe2, c.primer_final, ' +
            'c.segundo_informe1, c.segundo_informe2, c.segundo_final ' +
            'FROM calificaciones c ' +
            'JOIN materias m ON c.id_materia = m.id ' +
            'WHERE c.id_alumno = ?',
            [alumno.id]
        );

        // Devolvemos los datos del alumno y sus calificaciones
        res.json({
            alumno,
            calificaciones
        });
    } catch (error) {
        // Manejamos cualquier error que ocurra durante el proceso
        console.error('Error al obtener calificaciones:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Función para guardar o actualizar las calificaciones de un alumno
exports.saveCalificaciones = async (req, res) => {
    const dni = req.params.dni;
    const { calificaciones } = req.body;

    try {
        // Buscamos al alumno por su DNI
        const [alumnos] = await db.promise().query(
            'SELECT id FROM usuarios WHERE dni = ? AND rol = "alumno"',
            [dni]
        );

        // Si no encontramos al alumno, devolvemos un error
        if (alumnos.length === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        const alumnoId = alumnos[0].id;

        // Iteramos sobre cada calificación para actualizarla o crearla
        for (const calificacion of calificaciones) {
            // Verificamos si ya existe una calificación para esta materia
            const [existing] = await db.promise().query(
                'SELECT id FROM calificaciones WHERE id_alumno = ? AND id_materia = ?',
                [alumnoId, calificacion.id_materia]
            );

            if (existing.length > 0) {
                // Si existe, actualizamos la calificación
                await db.promise().query(
                    `UPDATE calificaciones SET 
                        primer_informe1 = ?,
                        primer_informe2 = ?,
                        primer_final = ?,
                        segundo_informe1 = ?,
                        segundo_informe2 = ?,
                        segundo_final = ?
                    WHERE id_alumno = ? AND id_materia = ?`,
                    [
                        calificacion.primer_informe1,
                        calificacion.primer_informe2,
                        calificacion.primer_final,
                        calificacion.segundo_informe1,
                        calificacion.segundo_informe2,
                        calificacion.segundo_final,
                        alumnoId,
                        calificacion.id_materia
                    ]
                );
            } else {
                // Si no existe, creamos una nueva calificación
                await db.promise().query(
                    `INSERT INTO calificaciones (
                        id_alumno, 
                        id_materia, 
                        primer_informe1,
                        primer_informe2,
                        primer_final,
                        segundo_informe1,
                        segundo_informe2,
                        segundo_final
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        alumnoId,
                        calificacion.id_materia,
                        calificacion.primer_informe1,
                        calificacion.primer_informe2,
                        calificacion.primer_final,
                        calificacion.segundo_informe1,
                        calificacion.segundo_informe2,
                        calificacion.segundo_final
                    ]
                );
            }
        }

        // Devolvemos mensaje de éxito
        res.json({ success: true, message: 'Calificaciones guardadas exitosamente' });
    } catch (error) {
        // Manejamos cualquier error que ocurra durante el proceso
        console.error('Error al guardar calificaciones:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};