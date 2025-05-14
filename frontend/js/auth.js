// Función para manejar el inicio de sesión
async function handleLogin(event) {
    event.preventDefault();
    
    const dni = document.getElementById('dni').value;
    const password = document.getElementById('password').value;

    try {
        console.log('Intentando login con DNI:', dni);
        
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dni, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Guardar el token y DNI en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userDNI', dni);
            console.log('DNI y token guardados en localStorage');
            
            // Redirigir según el rol
            if (data.role === 'alumno') {
                window.location.href = `vistaalumn.html?dni=${dni}`;
            } else if (data.role === 'profesor') {
                window.location.href = 'calificaciones.html';
            }
        } else {
            alert(data.message || 'Error en el inicio de sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error en el servidor');
    }
}

// Función para manejar el cierre de sesión
function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem('userDNI');
    localStorage.removeItem('token'); // También eliminar el token al cerrar sesión
    window.location.href = 'login.html';
}