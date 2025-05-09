document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('correo').value,
        telefono: document.getElementById('telefono').value,
        dni: document.getElementById('DNI').value,
        username: document.getElementById('usuario').value,
        password: document.getElementById('contraseña').value,
        id_curso: document.getElementById('curso').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/users/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Registro exitoso');
            window.location.href = '/login.html';
        } else {
            alert(data.error || 'Error en el registro');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar el registro');
    }
});