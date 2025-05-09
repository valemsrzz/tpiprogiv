// Verificar si el usuario está autenticado y es profesor
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.rol !== 'profesor') {
        window.location.href = 'login.html';
        return;
    }

    cargarCursos();
    cargarMaterias();

    // Event listeners para los filtros
    document.getElementById('selectCurso').addEventListener('change', cargarAlumnos);
    document.getElementById('selectMateria').addEventListener('change', cargarNotas);
    document.getElementById('selectPeriodo').addEventListener('change', cargarNotas);
});

async function cargarCursos() {
    try {
        const response = await fetch('http://localhost:3000/api/cursos');
        const cursos = await response.json();
        const select = document.getElementById('selectCurso');
        
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

async function cargarMaterias() {
    try {
        const response = await fetch('http://localhost:3000/api/materias');
        const materias = await response.json();
        const select = document.getElementById('selectMateria');
        
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

async function cargarAlumnos() {
    const cursoId = document.getElementById('selectCurso').value;
    if (!cursoId) return;

    try {
        const response = await fetch(`http://localhost:3000/api/usuarios/alumnos/curso/${cursoId}`);
        const alumnos = await response.json();
        mostrarTablaAlumnos(alumnos);
    } catch (error) {
        console.error('Error al cargar alumnos:', error);
    }
}

async function cargarNotas() {
    const cursoId = document.getElementById('selectCurso').value;
    const materiaId = document.getElementById('selectMateria').value;
    const periodo = document.getElementById('selectPeriodo').value;

    if (!cursoId || !materiaId || !periodo) return;

    try {
        const response = await fetch(`http://localhost:3000/api/calificaciones/curso/${cursoId}/materia/${materiaId}/periodo/${periodo}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const notas = await response.json();
        
        // Actualizar las notas en la tabla
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

function mostrarTablaAlumnos(alumnos) {
    const tbody = document.querySelector('#tablaNotas tbody');
    tbody.innerHTML = '';

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

async function guardarNota(alumnoId) {
    const materiaId = document.getElementById('selectMateria').value;
    const periodo = document.getElementById('selectPeriodo').value;
    const nota = document.querySelector(`input[data-alumno-id="${alumnoId}"]`).value;

    if (!nota || !materiaId || !periodo) {
        alert('Por favor complete todos los campos');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/calificaciones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                id_alumno: alumnoId,
                id_materia: materiaId,
                nota: parseInt(nota),
                periodo: parseInt(periodo)
            })
        });

        if (response.ok) {
            alert('Nota guardada exitosamente');
        } else {
            throw new Error('Error al guardar la nota');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar la nota');
    }
}