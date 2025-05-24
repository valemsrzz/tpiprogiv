// Importamos la función de notificación
import { showNotification } from './utils.js';

// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {
    // Obtiene el formulario de login por su ID
    const loginForm = document.getElementById('loginForm');

    // Agrega un evento para manejar el envío del formulario
    loginForm.addEventListener('submit', async (e) => {
        // Previene el comportamiento por defecto del formulario
        e.preventDefault();
        
        // Obtiene los valores de los campos DNI y contraseña, eliminando espacios en blanco del DNI
        const dni = document.getElementById('usuario').value.trim();
        const password = document.getElementById('contraseña').value;

        // Muestra en consola los datos que se intentan enviar (para depuración)
        console.log('Intentando login con:', { dni, password });

        try {
            // Realiza la petición al servidor para el login
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Incluye las cookies en la petición
                body: JSON.stringify({ 
                    dni,
                    password,
                    // Agrega una marca de tiempo para registro
                    timestamp: new Date().toISOString()
                }) 
            });

            // Convierte la respuesta a JSON
            const data = await response.json();
            // Muestra la respuesta completa del servidor (para depuración)
            console.log('Respuesta completa del servidor:', data);

            // Si la respuesta no es exitosa, muestra un mensaje de error
            if (!response.ok) {
                showNotification('error', data.message || 'Error en el inicio de sesión');
                return;
            }

            // Si el login es exitoso, redirige según el rol del usuario
            if (data.success) {
                showNotification('success', '¡Inicio de sesión exitoso!');
                // Espera un momento para que se vea la notificación antes de redirigir
                setTimeout(() => {
                    // Redirige a diferentes páginas según el rol del usuario
                    if (data.role === 'alumno') {
                        window.location.href = 'inicio-alumno.html';  // Página para alumnos
                    } else if (data.role === 'profesor') {
                        window.location.href = 'inicio-profesor.html';  // Página para profesores
                    } else if (data.role === 'admin' || data.role === 'administrador') { 
                        window.location.href = 'administrador.html';  // Página para administradores
                    }
                }, 1500);
            }

        } catch (error) {
            // Maneja cualquier error que ocurra durante la petición
            console.error('Error completo:', error);
            showNotification('error', 'Error al conectar con el servidor');
        }
    });
});
