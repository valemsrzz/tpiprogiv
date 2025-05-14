document.addEventListener('DOMContentLoaded', () => {
    // Intentar obtener el DNI de la URL
    const urlParams = new URLSearchParams(window.location.search);
    let userDNI = urlParams.get('dni');
    
    console.log('DNI obtenido de la URL:', userDNI);
    
    // Si no hay DNI en la URL, intentar obtenerlo del localStorage como respaldo
    if (!userDNI) {
        userDNI = localStorage.getItem('userDNI');
        console.log('DNI obtenido del localStorage:', userDNI);
    }
    
    if (!userDNI) {
        console.log('No se encontró DNI, redirigiendo a login');
        window.location.href = 'login.html';
        return;
    }

    // Verificar la ruta correcta de la API
    loadStudentInfo(userDNI);
    loadGrades(userDNI);
});

async function loadStudentInfo(userDNI) {
    try {
        // Usar la ruta correcta para obtener información del alumno
        const response = await fetch(`http://localhost:3000/api/estudiantes/${userDNI}`);
        
        if (!response.ok) {
            console.error('Error al cargar datos del alumno:', response.status);
            return;
        }
        
        const data = await response.json();
        
        document.getElementById('studentName').textContent = `${data.nombre} ${data.apellido}`;
        document.getElementById('studentClass').textContent = data.curso;
    } catch (error) {
        console.error('Error cargando información del estudiante:', error);
    }
}

async function loadGrades(userDNI) {
    try {
        // Usar la ruta correcta para obtener calificaciones
        const response = await fetch(`http://localhost:3000/api/notas/estudiante/${userDNI}`);
        
        if (!response.ok) {
            console.error('Error al cargar calificaciones:', response.status);
            return;
        }
        
        const data = await response.json();
        updateGradesTable(data);
    } catch (error) {
        console.error('Error cargando calificaciones:', error);
    }
}

function updateGradesTable(calificaciones) {
    calificaciones.forEach(calificacion => {
        const row = document.querySelector(`tr[data-materia-id="${calificacion.id_materia}"]`);
        if (row) {
            const cells = {
                'primer_informe1': calificacion.primer_informe1,
                'primer_informe2': calificacion.primer_informe2,
                'primer_final': calificacion.primer_final,
                'segundo_informe1': calificacion.segundo_informe1,
                'segundo_informe2': calificacion.segundo_informe2,
                'segundo_final': calificacion.segundo_final
            };

            Object.entries(cells).forEach(([type, value]) => {
                const cell = row.querySelector(`[data-type="${type}"]`);
                if (cell) {
                    cell.textContent = value || '-';
                }
            });
        }
    });
}