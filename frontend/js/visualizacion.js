import { handleLogout } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('#logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

});

// Agrega un event listener que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Verifica si hay una sesión activa haciendo una petición al servidor
        const response = await fetch('http://localhost:3000/api/auth/check', {
            credentials: 'include',  // Incluye las cookies de sesión
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Si no hay una sesión válida, redirige al login
        if (!response.ok) {
            console.log('No hay sesión activa, redirigiendo a login');
            window.location.href = 'login.html';
            return;
        }

        // Obtiene los datos del usuario de la respuesta
        const userData = await response.json();
        console.log('Datos del usuario:', userData);

        // Si el usuario está autenticado y tiene datos, carga su información
        if (userData.authenticated && userData.user) {
            loadStudentInfo(userData.user.dni);
        } else {
            console.error('Datos de usuario incompletos:', userData);
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        window.location.href = 'login.html';
    }
});

// Función para cargar la información del estudiante usando su DNI
async function loadStudentInfo(userDNI) {
    try {
        console.log('Cargando información para DNI:', userDNI);
        
        // Hace una petición para obtener las calificaciones del alumno
        const response = await fetch(`http://localhost:3000/api/calificaciones/alumno/${userDNI}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos recibidos del servidor:', data);
        
        // Verifica que existan datos del alumno
        if (!data.alumno) {
            throw new Error('No se recibieron datos del alumno');
        }
        
        // Actualiza la información del alumno en la página
        actualizarInformacionAlumno(data.alumno);
        
        // Si hay calificaciones, actualiza la tabla
        if (data.calificaciones) {
            updateGradesTable(data.calificaciones);
        } else {
            console.warn('No se recibieron calificaciones');
        }
    } catch (error) {
        console.error('Error al cargar datos del alumno:', error);
    }
}

// Función para actualizar la información básica del alumno en la página
function actualizarInformacionAlumno(alumno) {
    const nameElement = document.getElementById('studentName');
    const classElement = document.getElementById('studentClass');
    
    if (nameElement) {
        // Construye el nombre completo verificando que existan nombre y apellido
        const nombreCompleto = [
            alumno.nombre || '',
            alumno.apellido || ''
        ].filter(Boolean).join(' ');
        
        nameElement.textContent = nombreCompleto || 'Nombre no disponible';
    } else {
        console.error('Error: Elemento studentName no encontrado');
    }
    
    if (classElement) {
        // Muestra el curso si existe
        classElement.textContent = alumno.curso ? `${alumno.curso}` : 'Curso no disponible';
    } else {
        console.error('Error: Elemento studentClass no encontrado');
    }
}

// Función para actualizar la tabla de calificaciones
function updateGradesTable(calificaciones) {
    // Recorre cada calificación recibida
    calificaciones.forEach(calificacion => {
        // Busca la fila correspondiente a la materia
        const row = document.querySelector(`tr[data-materia-id="${calificacion.id_materia}"]`);
        if (row) {
            // Actualiza cada celda de calificación en la fila
            const celdas = row.querySelectorAll('td[data-type]');
            celdas.forEach(celda => {
                const tipo = celda.getAttribute('data-type');
                celda.textContent = calificacion[tipo] || '-';
            });
        }
    });
}
