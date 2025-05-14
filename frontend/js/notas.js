// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a elementos del DOM
    const dniInput = document.getElementById('dni');
    const buscarBtn = document.getElementById('buscarAlumno');
    const guardarBtn = document.getElementById('guardarCambios');

    // Configurar event listeners para inputs numéricos
    const inputs = document.querySelectorAll('input[type="number"]:not([readonly])');
    inputs.forEach(input => {
        input.addEventListener('change', handleGradeChange);
    });

    // Event listener para el botón de búsqueda
    buscarBtn.addEventListener('click', async () => {
        const dni = dniInput.value;
        if (!dni) {
            alert('Por favor ingrese un DNI');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No hay sesión activa. Por favor, inicie sesión nuevamente.');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch(`http://localhost:3000/api/calificaciones/alumno/${dni}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al buscar alumno');
            }

            if (!data.alumno) {
                throw new Error('No se encontraron datos del alumno');
            }

            const nombreInput = document.getElementById('nombre');
            if (nombreInput) {
                nombreInput.value = `${data.alumno.nombre} ${data.alumno.apellido}`;
            }
            
            if (data.calificaciones && data.calificaciones.length > 0) {
                fillExistingGrades(data.calificaciones);
            } else {
                console.log('No se encontraron calificaciones para este alumno');
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error al buscar alumno');
        }
    });

    // Event listener para el botón guardar
    guardarBtn.addEventListener('click', saveGrades);
});

// Función para llenar las calificaciones existentes
function fillExistingGrades(calificaciones) {
    // Clear existing values first
    document.querySelectorAll('input[type="number"]').forEach(input => input.value = '');

    calificaciones.forEach(calificacion => {
        const row = document.querySelector(`tr[data-materia-id="${calificacion.id_materia}"]`);
        if (row) {
            try {
                // Primer parcial
                const p1_inf1 = document.getElementById(`${calificacion.id_materia}_p1_inf1`);
                const p1_inf2 = document.getElementById(`${calificacion.id_materia}_p1_inf2`);
                const p1_final = document.getElementById(`${calificacion.id_materia}_p1_final`);
                
                // Segundo parcial
                const p2_inf1 = document.getElementById(`${calificacion.id_materia}_p2_inf1`);
                const p2_inf2 = document.getElementById(`${calificacion.id_materia}_p2_inf2`);
                const p2_final = document.getElementById(`${calificacion.id_materia}_p2_final`);

                // Set values if they exist
                if (p1_inf1 && calificacion.primer_informe1) p1_inf1.value = calificacion.primer_informe1;
                if (p1_inf2 && calificacion.primer_informe2) p1_inf2.value = calificacion.primer_informe2;
                if (p1_final && calificacion.primer_final) p1_final.value = calificacion.primer_final;
                
                if (p2_inf1 && calificacion.segundo_informe1) p2_inf1.value = calificacion.segundo_informe1;
                if (p2_inf2 && calificacion.segundo_informe2) p2_inf2.value = calificacion.segundo_informe2;
                if (p2_final && calificacion.segundo_final) p2_final.value = calificacion.segundo_final;

            } catch (error) {
                console.error(`Error setting grades for subject ${calificacion.id_materia}:`, error);
            }
        }
    });
}

// Manejar cambios en las notas
function handleGradeChange(event) {
    const input = event.target;
    const [subject, period] = input.id.split('_');
    const mainPeriod = period.includes('p1') ? 'p1' : 'p2';
    
    if (validateGrade(input)) {
        calculateFinal(subject, mainPeriod);
    }
}

// Calcular nota final
function calculateFinal(subject, period) {
    const inf1 = parseFloat(document.getElementById(`${subject}_${period}_inf1`).value) || 0;
    const inf2 = parseFloat(document.getElementById(`${subject}_${period}_inf2`).value) || 0;
    
    if (inf1 && inf2) {
        const final = (inf1 + inf2) / 2;
        document.getElementById(`${subject}_${period}_final`).value = final.toFixed(2);
    }
}

// Función para guardar calificaciones
async function saveGrades() {
    const dni = document.getElementById('dni').value;
    if (!dni) {
        alert('Por favor, primero busque un alumno');
        return;
    }
    
    try {
        const alumnoResponse = await fetch(`http://localhost:3000/api/calificaciones/alumno/${dni}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!alumnoResponse.ok) {
            throw new Error('Error al obtener información del alumno');
        }
        
        const alumnoData = await alumnoResponse.json();
        const id_alumno = alumnoData.alumno.id;

        // Recolectar todas las calificaciones que tienen valor
        const materias = document.querySelectorAll('tr[data-materia-id]');
        let actualizacionesExitosas = 0;
        let actualizacionesFallidas = 0;

        for (const materia of materias) {
            const id_materia = materia.getAttribute('data-materia-id');
            
            // Primero verificar si existe la calificación
            try {
                const checkResponse = await fetch(`http://localhost:3000/api/calificaciones/verificar/${id_alumno}/${id_materia}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!checkResponse.ok) {
                    // Si no existe, crear el registro
                    const createResponse = await fetch('http://localhost:3000/api/calificaciones/crear', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            id_alumno,
                            id_materia
                        })
                    });

                    if (!createResponse.ok) {
                        throw new Error('Error al crear registro de calificación');
                    }
                }

                // Proceder con la actualización
                const calificaciones = [
                    { tipo: 'primer_informe1', elemento: `${id_materia}_p1_inf1` },
                    { tipo: 'primer_informe2', elemento: `${id_materia}_p1_inf2` },
                    { tipo: 'primer_final', elemento: `${id_materia}_p1_final` },
                    { tipo: 'segundo_informe1', elemento: `${id_materia}_p2_inf1` },
                    { tipo: 'segundo_informe2', elemento: `${id_materia}_p2_inf2` },
                    { tipo: 'segundo_final', elemento: `${id_materia}_p2_final` }
                ];

                for (const cal of calificaciones) {
                    const input = document.getElementById(cal.elemento);
                    if (input && input.value && !input.readOnly) {
                        const valor = parseFloat(input.value);
                        
                        if (valor >= 1 && valor <= 10) {
                            const response = await fetch('http://localhost:3000/api/calificaciones/actualizar', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify({
                                    id_alumno,
                                    id_materia,
                                    tipo: cal.tipo,
                                    valor
                                })
                            });

                            if (response.ok) {
                                actualizacionesExitosas++;
                            } else {
                                actualizacionesFallidas++;
                                console.error(`Error al guardar ${cal.tipo} para materia ${id_materia}`);
                            }
                        }
                    }
                }
            } catch (error) {
                actualizacionesFallidas++;
                console.error(`Error procesando materia ${id_materia}:`, error);
            }
        }

        if (actualizacionesFallidas > 0) {
            alert(`Proceso completado con algunos errores. ${actualizacionesExitosas} notas guardadas, ${actualizacionesFallidas} fallidas.`);
        } else {
            alert('Todas las calificaciones fueron guardadas exitosamente');
        }
        
    } catch (error) {
        console.error('Error general:', error);
        alert(error.message || 'Error al guardar las calificaciones');
    }
}

// Validación de notas
function validateGrade(input) {
    const value = parseFloat(input.value);
    if (value < 1 || value > 10) {
        alert('Las notas deben estar entre 1 y 10');
        input.value = '';
        return false;
    }
    return true;
}