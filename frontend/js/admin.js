import { handleLogout } from './auth.js';

// Inicialización centralizada
document.addEventListener('DOMContentLoaded', init);

function init() {
    console.log('Iniciando panel de administración...');

    // 1. Configurar Logout
    const logoutButton = document.querySelector('#logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    // 2. Configurar Buscador
    const searchInput = document.getElementById('searchUser');
    if (searchInput) {
        console.log('Buscador configurado correctamente');
        searchInput.addEventListener('input', handleSearch);
    } else {
        console.error('ERROR: No se encontró el input #searchUser');
    }

    // 3. Cargar datos iniciales
    checkAdminAccess();
    loadPendingUsers();
    loadAllUsers();
}

// Función de búsqueda
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    console.log('Buscando:', searchTerm);

    const filteredUsers = allUsers.filter(user => {
        const nombre = (user.nombre || '').toLowerCase();
        const apellido = (user.apellido || '').toLowerCase();
        const username = (user.username || '').toLowerCase();
        
        return nombre.includes(searchTerm) || 
               apellido.includes(searchTerm) || 
               username.includes(searchTerm);
    });

    console.log(`Encontrados: ${filteredUsers.length} usuarios`);
    renderUsers(filteredUsers);
}

// Función para cargar usuarios pendientes de aprobación
async function loadPendingUsers() {
    try {
        const response = await fetch('/api/users/pending', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();

        const pendingList = document.getElementById('pendingList');
        pendingList.innerHTML = '';

        data.users.forEach(user => {
            const row = document.createElement('tr');
            // CORRECCIÓN: Mostramos nombre_completo en lugar de solo nombre
            row.innerHTML = `
                <td>${user.nombre_completo}</td>
                <td>${user.email}</td>
                <td>${user.dni}</td>
                <td>${user.id_curso || 'No asignado'}</td>
                <td>
                    <button class="approve-btn" data-userid="${user.id}">Aprobar</button>
                    <button class="reject-btn" data-userid="${user.id}">Rechazar</button>
                </td>
            `;
            
            // Agregar event listeners a los botones
            const approveBtn = row.querySelector('.approve-btn');
            const rejectBtn = row.querySelector('.reject-btn');
            
            approveBtn.addEventListener('click', () => approveUser(user.id));
            rejectBtn.addEventListener('click', () => deleteUser(user.id));
            
            pendingList.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar usuarios pendientes:', error);
    }
}

// Función para aprobar un usuario
async function approveUser(userId) {
    try {
        // Envía petición para aprobar el usuario
        const response = await fetch(`/api/users/approve/${userId}`, {
            method: 'POST',
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            alert('Usuario aprobado exitosamente');
            // Recarga las listas de usuarios
            loadPendingUsers();
            loadAllUsers();
        }
    } catch (error) {
        console.error('Error al aprobar usuario:', error);
    }
}

// Función para eliminar un usuario
async function deleteUser(userId) {
    if (confirm('¿Está seguro de rechazar este usuario?')) {
        try {
            // Envía petición para eliminar el usuario
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                alert('Usuario rechazado');
                // Recarga las listas de usuarios
                loadPendingUsers();
                loadAllUsers();
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
        }
    }
}

// Event listener para el botón de agregar usuario
document.getElementById('addUserBtn').addEventListener('click', async () => {
    // Recopila los datos del formulario
    const userData = {
        nombre_completo: document.getElementById('nombre_completo').value,
        dni: document.getElementById('dni').value,
        telefono: document.getElementById('telefono').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        email: document.getElementById('email').value,
        rol: document.getElementById('rol').value
    };

    try {
        // Envía petición para crear nuevo usuario
        const response = await fetch('/api/users/create/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            alert('Usuario creado exitosamente');
            loadAllUsers();
            // Limpia el formulario
            document.querySelectorAll('.add-user-form input').forEach(input => input.value = '');
            document.getElementById('rol').value = '';
        } else {
            alert(data.error || 'Error al crear usuario');
        }
    } catch (error) {
        console.error('Error al crear usuario:', error);
    }
});

// Variable global para almacenar los usuarios cargados
let allUsers = [];

// Función para cargar todos los usuarios
async function loadAllUsers() {
    try {
        const response = await fetch('/api/users', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        
        console.log('Datos de usuarios recibidos:', data); // Para depuración

        // Guardamos todos los usuarios en la variable global
        allUsers = data.users || [];
        // Renderizamos la lista completa inicialmente
        renderUsers(allUsers);

    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

// Función para renderizar la tabla de usuarios
function renderUsers(usersToRender) {
    const userList = document.getElementById('userList');
    if (!userList) return;

    userList.innerHTML = '';

    if (!usersToRender || usersToRender.length === 0) {
        userList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No se encontraron usuarios</td></tr>';
        return;
    }

    usersToRender.forEach(user => {
        // MEJORA VISUAL: Priorizamos Nombre y Apellido. Si no existen, mostramos el username limpio.
        const nombre_completo = user.nombre_completo || ''; 
        
        // Si hay nombre O apellido, los mostramos. Si no, mostramos el username tal cual.
        let nombre_completoMostrar = (nombre_completo) ? `${nombre_completo}`.trim() : user.username;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${nombre_completoMostrar}</td>
            <td>${user.username || 'Desconocido'}</td>
            <td>${user.id_curso || 'No asignado'}</td>
            <td>${user.rol || 'Sin rol'}</td>
            <td>
                <button class="delete-btn" data-userid="${user.id}">Eliminar</button>
            </td>
        `;
        
        // Agregar event listener al botón de eliminar
        const deleteBtn = row.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteUser(user.id));
        }
        
        userList.appendChild(row);
    });
}

// Función para verificar el acceso de administrador
async function checkAdminAccess() {
    try {
        // Verifica si el usuario tiene permisos de administrador
        const response = await fetch('/api/users', {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 403) {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error al verificar acceso de administrador:', error);
        window.location.href = '/login.html';
    }
}
