// Importar la función de notificación
import { showNotification } from './utils.js';

// Agregar un event listener al formulario de registro cuando se envía
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    // Prevenir el comportamiento por defecto del formulario
    e.preventDefault();
    
    // Crear un objeto con los datos del formulario
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
        // Realizar la petición POST al servidor para crear el usuario
        const response = await fetch('http://localhost:3000/api/users/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        // Obtener la respuesta del servidor
        const data = await response.json();
        
        // Verificar si el registro fue exitoso
        if (data.success) {
            // Mostrar notificación de éxito y redirigir al login
            showNotification('Registro exitoso', 'success');
            window.location.href = '/login.html';
        } else {
            // Mostrar notificación de error con el mensaje del servidor
            showNotification(data.error || 'Error en el registro', 'error');
        }
    } catch (error) {
        // Manejar errores de la petición
        console.error('Error:', error);
        showNotification('Error al procesar el registro', 'error');
    }
});