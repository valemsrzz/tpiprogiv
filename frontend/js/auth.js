// Importamos la función de notificación
import { showNotification } from './utils.js';

// Función para manejar el inicio de sesión
async function handleLogin(event) {
    // Previene el comportamiento por defecto del formulario
    event.preventDefault();
    
    // Obtiene los valores de DNI y contraseña del formulario
    const dni = document.getElementById('dni').value;
    const password = document.getElementById('password').value;

    try {
        // Muestra en consola el intento de inicio de sesión
        console.log('Intentando login con DNI:', dni);
        
        // Realiza la petición al servidor para autenticar
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dni, password })
        });

        // Obtiene la respuesta del servidor en formato JSON
        const data = await response.json();
        
        if (response.ok) {
            // Si la autenticación es exitosa, guarda el token y DNI en el almacenamiento local
            localStorage.setItem('token', data.token);
            localStorage.setItem('userDNI', dni);
            console.log('DNI y token guardados en localStorage');
            
            showNotification('success', '¡Inicio de sesión exitoso!');
            
            // Espera un momento antes de redirigir
            setTimeout(() => {
                // Redirige al usuario según su rol
                if (data.role === 'alumno') {
                    window.location.href = `vistaalumn.html?dni=${dni}`;
                } else if (data.role === 'profesor') {
                    window.location.href = 'calificaciones.html';
                }
            }, 1500);
        } else {
            // Si hay un error, muestra el mensaje de error
            showNotification('error', data.message || 'Error en el inicio de sesión');
        }
    } catch (error) {
        // Maneja cualquier error que ocurra durante el proceso
        console.error('Error:', error);
        showNotification('error', 'Error en el servidor');
    }
}

// Función para manejar el cierre de sesión
function handleLogout(event) {
    // Previene el comportamiento por defecto del enlace
    event.preventDefault();
    
    // Elimina los datos de la sesión del almacenamiento local
    localStorage.removeItem('userDNI');
    localStorage.removeItem('token');
    
    showNotification('info', 'Sesión cerrada exitosamente');
    
    // Espera un momento antes de redirigir
    setTimeout(() => {
        // Redirige al usuario a la página de login
        window.location.href = 'login.html';
    }, 1500);
}

export { handleLogin, handleLogout };