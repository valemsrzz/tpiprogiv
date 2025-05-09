document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('usuario').value.toLowerCase();
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
                // Mostrar el mensaje exacto del backend (por ej., cuenta pendiente)
                alert(data.message || 'Error en el inicio de sesión');
                return;
            }

            if (data.success) {
                window.location.href = data.redirect;
            }

        } catch (error) {
            console.error('Error completo:', error);
            alert('Error al conectar con el servidor');
        }
    });
});
