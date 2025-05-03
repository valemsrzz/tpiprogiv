document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos existentes
    loadGrades();
    
    // Agregar event listeners a todos los inputs
    const inputs = document.querySelectorAll('input[type="number"]:not([readonly])');
    inputs.forEach(input => {
        input.addEventListener('change', handleGradeChange);
    });
});

// Función para cargar notas existentes
async function loadGrades() {
    try {
        const studentId = document.getElementById('nombre').value;
        const curso = document.getElementById('curso').value;
        
        const response = await fetch(`/api/grades/${studentId}/${curso}`);
        const data = await response.json();
        
        if (data.grades) {
            fillGradeInputs(data.grades);
        }
    } catch (error) {
        console.error('Error loading grades:', error);
    }
}

// Función para llenar los inputs con las notas
function fillGradeInputs(grades) {
    Object.entries(grades).forEach(([subjectId, subjectGrades]) => {
        Object.entries(subjectGrades).forEach(([period, grade]) => {
            const input = document.getElementById(`${subjectId}_${period}`);
            if (input) {
                input.value = grade;
                calculateFinal(subjectId, period.includes('p1') ? 'p1' : 'p2');
            }
        });
    });
}

// Manejar cambios en las notas
function handleGradeChange(event) {
    const input = event.target;
    const [subject, period] = input.id.split('_');
    const mainPeriod = period.includes('p1') ? 'p1' : 'p2';
    
    calculateFinal(subject, mainPeriod);
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

// Guardar cambios
async function saveGrades() {
    try {
        const studentId = document.getElementById('nombre').value;
        const curso = document.getElementById('curso').value;
        
        if (!studentId || !curso) {
            alert('Por favor, seleccione un estudiante y curso');
            return;
        }

        const grades = collectGrades();

        const response = await fetch('/api/grades/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId,
                curso,
                grades
            })
        });

        if (response.ok) {
            alert('Notas guardadas exitosamente');
        } else {
            alert('Error al guardar las notas');
        }
    } catch (error) {
        console.error('Error saving grades:', error);
        alert('Error al conectar con el servidor');
    }
}

// Recolectar todas las notas
function collectGrades() {
    const grades = {};
    const inputs = document.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        if (input.value) {
            const [subject, period, type] = input.id.split('_');
            if (!grades[subject]) {
                grades[subject] = {};
            }
            grades[subject][`${period}_${type}`] = parseFloat(input.value);
        }
    });
    
    return grades;
}

// Event listener para el botón de guardar
document.querySelector('.btn').addEventListener('click', saveGrades);

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