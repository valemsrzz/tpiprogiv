document.addEventListener('DOMContentLoaded', () => {
    loadStudentInfo();
    loadGrades();
});

async function loadStudentInfo() {
    try {
        const response = await fetch('/api/student/info');
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('studentName').textContent = data.nombre;
            document.getElementById('studentClass').textContent = data.curso;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadGrades() {
    try {
        const response = await fetch('/api/student/grades');
        const data = await response.json();
        
        if (response.ok) {
            updateGradesTable(data.grades);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateGradesTable(grades) {
    // Update each subject's grades in the table
    Object.entries(grades).forEach(([subject, gradeData]) => {
        const cells = document.querySelectorAll(`[data-subject="${subject}"]`);
        cells.forEach(cell => {
            const period = cell.dataset.period;
            const type = cell.dataset.type;
            cell.textContent = gradeData[`${period}_${type}`] || '-';
        });
    });
}