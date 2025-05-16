document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('usuario').value;
        const password = document.getElementById('contraseña').value;

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }) 
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            if (!response.ok) {
                alert(data.message || 'Error en el inicio de sesión');
                return;
            }

            // Guardar el token y username en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userDNI', username);
            localStorage.setItem('userRole', data.role);

            if (data.success) {
                if (data.role === 'alumno') {
                    window.location.href = 'inicio-alumno.html';
                } else if (data.role === 'profesor') {
                    window.location.href = 'inicio-profesor.html';
                } else if (data.role === 'admin') {
                    window.location.href = 'administrador.html';
                }
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    });
});
