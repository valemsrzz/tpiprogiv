// Importamos la función de notificación desde el archivo de utilidades
import { showNotification } from './utils.js';
import { handleLogout } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('#logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

});

// Cuando el DOM está completamente cargado, inicializamos la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Obtenemos referencias a los elementos del DOM que necesitaremos
    const dniInput = document.getElementById('dni');
    const buscarBtn = document.getElementById('buscarAlumno');
    const guardarBtn = document.getElementById('guardarCambios');

    // Configuramos los event listeners para todos los campos de notas
    const inputs = document.querySelectorAll('input[type="number"]:not([readonly])');
    inputs.forEach(input => {
        input.addEventListener('change', handleGradeChange);
    });

    // Configuramos el event listener para el botón de búsqueda
    buscarBtn.addEventListener('click', async () => {
        const dni = dniInput.value;
        // Validamos que se haya ingresado un DNI
        if (!dni) {
            showNotification('warning', 'Por favor ingrese un DNI');
            return;
        }

        try {
            // Realizamos la petición al servidor para buscar al alumno
            const response = await fetch(`http://localhost:3000/api/calificaciones/alumno/${dni}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // Manejamos los diferentes estados de la respuesta
            if (!response.ok) {
                if (response.status === 401) {
                    showNotification('error', 'No hay sesión activa. Por favor, inicie sesión nuevamente.');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                    return;
                }
                throw new Error('Error al buscar alumno');
            }

            const data = await response.json();

            // Verificamos que se hayan recibido datos del alumno
            if (!data.alumno) {
                throw new Error('No se encontraron datos del alumno');
            }

            // Actualizamos el nombre del alumno en el formulario
            const nombreInput = document.getElementById('nombre');
            if (nombreInput) {
                nombreInput.value = `${data.alumno.nombre} ${data.alumno.apellido}`;
                showNotification('success', 'Alumno encontrado exitosamente');
            }
            
            // Rellenamos las calificaciones si existen
            if (data.calificaciones && data.calificaciones.length > 0) {
                fillExistingGrades(data.calificaciones);
            } else {
                showNotification('info', 'No se encontraron calificaciones para este alumno');
            }
            
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', error.message || 'Error al buscar alumno');
        }
    });

    // Configuramos el event listener para el botón de guardar
    guardarBtn.addEventListener('click', saveGrades);
});

// Función para rellenar las calificaciones existentes en el formulario
function fillExistingGrades(calificaciones) {
    // Limpiamos todos los campos de notas
    document.querySelectorAll('input[type="number"]').forEach(input => input.value = '');

    // Rellenamos cada calificación en su campo correspondiente
    calificaciones.forEach(calificacion => {
        const row = document.querySelector(`tr[data-materia-id="${calificacion.id_materia}"]`);
        if (row) {
            try {
                // Obtenemos referencias a todos los campos de notas
                const p1_inf1 = document.getElementById(`${calificacion.id_materia}_p1_inf1`);
                const p1_inf2 = document.getElementById(`${calificacion.id_materia}_p1_inf2`);
                const p1_final = document.getElementById(`${calificacion.id_materia}_p1_final`);
                
                const p2_inf1 = document.getElementById(`${calificacion.id_materia}_p2_inf1`);
                const p2_inf2 = document.getElementById(`${calificacion.id_materia}_p2_inf2`);
                const p2_final = document.getElementById(`${calificacion.id_materia}_p2_final`);

                // Asignamos los valores si existen
                if (p1_inf1 && calificacion.primer_informe1) p1_inf1.value = calificacion.primer_informe1;
                if (p1_inf2 && calificacion.primer_informe2) p1_inf2.value = calificacion.primer_informe2;
                if (p1_final && calificacion.primer_final) p1_final.value = calificacion.primer_final;
                
                if (p2_inf1 && calificacion.segundo_informe1) p2_inf1.value = calificacion.segundo_informe1;
                if (p2_inf2 && calificacion.segundo_informe2) p2_inf2.value = calificacion.segundo_informe2;
                if (p2_final && calificacion.segundo_final) p2_final.value = calificacion.segundo_final;

            } catch (error) {
                console.error(`Error al establecer notas para la materia ${calificacion.id_materia}:`, error);
            }
        }
    });
}

// Función para manejar el cambio de una calificación
function handleGradeChange(event) {
    const input = event.target;
    // Extraemos el identificador de la materia y el período del ID del campo
    const [subject, period] = input.id.split('_');
    const mainPeriod = period.includes('p1') ? 'p1' : 'p2';
    
    // Validamos la nota y calculamos el promedio si es válida
    if (validateGrade(input)) {
        calculateFinal(subject, mainPeriod);
    }
}

// Función para calcular la nota final de un período
function calculateFinal(subject, period) {
    // Obtenemos los valores de los informes
    const inf1 = parseFloat(document.getElementById(`${subject}_${period}_inf1`).value) || 0;
    const inf2 = parseFloat(document.getElementById(`${subject}_${period}_inf2`).value) || 0;
    
    // Calculamos el promedio si ambos informes tienen nota
    if (inf1 && inf2) {
        const final = (inf1 + inf2) / 2;
        document.getElementById(`${subject}_${period}_final`).value = final.toFixed(2);
    }
}

// Función para guardar todas las calificaciones
async function saveGrades() {
    const dni = document.getElementById('dni').value;
    if (!dni) {
        showNotification('warning', 'Por favor, primero busque un alumno');
        return;
    }
    
    try {
        // Verificamos que el alumno exista
        const alumnoResponse = await fetch(`http://localhost:3000/api/calificaciones/alumno/${dni}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Manejamos errores de autenticación
        if (!alumnoResponse.ok) {
            if (alumnoResponse.status === 401) {
                showNotification('error', 'No hay sesión activa. Por favor, inicie sesión nuevamente.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            throw new Error('Error al obtener información del alumno');
        }
        
        // Procesamos la respuesta
        const alumnoData = await alumnoResponse.json();
        const id_alumno = alumnoData.alumno.id;

        // Obtenemos todas las materias del formulario
        const materias = document.querySelectorAll('tr[data-materia-id]');
        let actualizacionesExitosas = 0;
        let actualizacionesFallidas = 0;

        // Procesamos cada materia
        for (const materia of materias) {
            const id_materia = materia.getAttribute('data-materia-id');
            
            try {
                // Verificamos si ya existe un registro de calificación
                const checkResponse = await fetch(`http://localhost:3000/api/calificaciones/verificar/${id_alumno}/${id_materia}`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Si no existe, creamos uno nuevo
                if (!checkResponse.ok) {
                    const createResponse = await fetch('http://localhost:3000/api/calificaciones/crear', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
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

                // Definimos todas las calificaciones posibles
                const calificaciones = [
                    { tipo: 'primer_informe1', elemento: `${id_materia}_p1_inf1` },
                    { tipo: 'primer_informe2', elemento: `${id_materia}_p1_inf2` },
                    { tipo: 'primer_final', elemento: `${id_materia}_p1_final` },
                    { tipo: 'segundo_informe1', elemento: `${id_materia}_p2_inf1` },
                    { tipo: 'segundo_informe2', elemento: `${id_materia}_p2_inf2` },
                    { tipo: 'segundo_final', elemento: `${id_materia}_p2_final` }
                ];

                // Procesamos cada calificación
                for (const cal of calificaciones) {
                    const input = document.getElementById(cal.elemento);
                    if (input && input.value && !input.readOnly) {
                        const valor = parseFloat(input.value);
                        
                        // Validamos y guardamos la nota
                        if (valor >= 1 && valor <= 10) {
                            const response = await fetch('http://localhost:3000/api/calificaciones/actualizar', {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json'
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

        // Mostramos el resultado final
        if (actualizacionesFallidas > 0) {
            showNotification('warning', `Proceso completado con algunos errores. ${actualizacionesExitosas} notas guardadas, ${actualizacionesFallidas} fallidas.`);
        } else {
            showNotification('success', 'Todas las calificaciones fueron guardadas exitosamente');
        }
        
    } catch (error) {
        console.error('Error general:', error);
        showNotification('error', error.message || 'Error al guardar las calificaciones');
    }
}

// Función para validar que una calificación esté en el rango correcto
function validateGrade(input) {
    const value = parseFloat(input.value);
    if (value < 1 || value > 10) {
        showNotification('error', 'Las notas deben estar entre 1 y 10');
        input.value = '';
        return false;
    }
    return true;
}