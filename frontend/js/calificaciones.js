// Verifica la autenticación del usuario cuando se carga la página
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Hace una petición para verificar si el usuario está autenticado
        const response = await fetch('http://localhost:3000/api/auth/check');
        const data = await response.json();
        // Si no está autenticado o no es profesor, redirige al login
        if (!data.authenticated || data.user.rol !== 'profesor') {
            window.location.href = 'login.html';
            return;
        }

        // Carga los datos iniciales necesarios
        cargarCursos();
        cargarMaterias();

        // Configura los event listeners para los filtros de selección
        document.getElementById('selectCurso').addEventListener('change', cargarAlumnos);
        document.getElementById('selectMateria').addEventListener('change', cargarNotas);
        document.getElementById('selectPeriodo').addEventListener('change', cargarNotas);
    } catch (error) {
        console.error('Error de autenticación:', error);
        window.location.href = 'login.html';
    }
});

// Función para cargar la lista de cursos disponibles
async function cargarCursos() {
    try {
        // Obtiene la lista de cursos del servidor
        const response = await fetch('http://localhost:3000/api/cursos');
        const cursos = await response.json();
        const select = document.getElementById('selectCurso');
        
        // Agrega cada curso como una opción en el selector
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = curso.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar cursos:', error);
    }
}

// Función para cargar la lista de materias disponibles
async function cargarMaterias() {
    try {
        // Obtiene la lista de materias del servidor
        const response = await fetch('http://localhost:3000/api/materias');
        const materias = await response.json();
        const select = document.getElementById('selectMateria');
        
        // Agrega cada materia como una opción en el selector
        materias.forEach(materia => {
            const option = document.createElement('option');
            option.value = materia.id;
            option.textContent = materia.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar materias:', error);
    }
}

// Función para cargar la lista de alumnos de un curso específico
async function cargarAlumnos() {
    const cursoId = document.getElementById('selectCurso').value;
    if (!cursoId) return;

    try {
        // Obtiene la lista de alumnos del curso seleccionado
        const response = await fetch(`http://localhost:3000/api/usuarios/alumnos/curso/${cursoId}`);
        const alumnos = await response.json();
        mostrarTablaAlumnos(alumnos);
    } catch (error) {
        console.error('Error al cargar alumnos:', error);
    }
}

// Función para cargar las notas según los filtros seleccionados
async function cargarNotas() {
    const cursoId = document.getElementById('selectCurso').value;
    const materiaId = document.getElementById('selectMateria').value;
    const periodo = document.getElementById('selectPeriodo').value;

    if (!cursoId || !materiaId || !periodo) return;

    try {
        // Obtiene las notas según los filtros seleccionados
        const response = await fetch(`http://localhost:3000/api/calificaciones/curso/${cursoId}/materia/${materiaId}/periodo/${periodo}`, {
            credentials: 'include' // Incluye las cookies de sesión
        });
        const notas = await response.json();
        
        // Actualiza las notas en la tabla
        const inputs = document.querySelectorAll('.nota-input');
        inputs.forEach(input => {
            const alumnoId = input.dataset.alumnoId;
            const notaAlumno = notas.find(n => n.id_alumno === parseInt(alumnoId));
            if (notaAlumno) {
                input.value = notaAlumno.nota;
            } else {
                input.value = '';
            }
        });
    } catch (error) {
        console.error('Error al cargar notas:', error);
    }
}

// Función para guardar una nota individual
async function guardarNota(alumnoId) {
    const materiaId = document.getElementById('selectMateria').value;
    const periodo = document.getElementById('selectPeriodo').value;
    const nota = document.querySelector(`input[data-alumno-id="${alumnoId}"]`).value;

    // Validación de campos requeridos
    if (!nota || !materiaId || !periodo) {
        alert('Por favor complete todos los campos');
        return;
    }

    try {
        // Envía la nota al servidor para guardarla
        const response = await fetch('http://localhost:3000/api/calificaciones/actualizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                id_alumno: alumnoId,
                id_materia: materiaId,
                tipo: `${periodo === '1' ? 'primer' : 'segundo'}_informe1`,
                valor: parseInt(nota)
            })
        });

        if (response.ok) {
            alert('Nota guardada exitosamente');
        } else {
            const data = await response.json();
            throw new Error(data.error || 'Error al guardar la nota');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Error al guardar la nota');
    }
}

// Función para mostrar la tabla de alumnos con sus campos de notas
function mostrarTablaAlumnos(alumnos) {
    const tbody = document.querySelector('#tablaNotas tbody');
    tbody.innerHTML = '';

    // Crea una fila por cada alumno con sus campos de notas
    alumnos.forEach(alumno => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${alumno.apellido}, ${alumno.nombre}</td>
            <td>${alumno.dni}</td>
            <td><input type="number" min="1" max="10" class="nota-input" data-alumno-id="${alumno.id}"></td>
            <td><button class="btn-guardar" onclick="guardarNota(${alumno.id})">Guardar</button></td>
        `;
        tbody.appendChild(tr);
    });
}