import { handleLogout } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('#logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

});

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
            row.innerHTML = `
                <td>${user.nombre}</td>
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
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
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

// Función para cargar todos los usuarios
async function loadAllUsers() {
    try {
        const response = await fetch('/api/users', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();

        const userList = document.getElementById('userList');
        userList.innerHTML = '';

        data.users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.nombre} ${user.apellido || ''}</td>
                <td>${user.username}</td>
                <td>${user.id_curso || 'No asignado'}</td>
                <td>${user.rol}</td>
                <td>
                    <button class="delete-btn" data-userid="${user.id}">Eliminar</button>
                </td>
            `;
            
            // Agregar event listener al botón de eliminar
            const deleteBtn = row.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteUser(user.id));
            
            userList.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
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

// Event listener cuando se carga el documento
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    loadPendingUsers();
    loadAllUsers();
});

// Función para cargar usuarios pendientes (versión alternativa)
async function cargarUsuariosPendientes() {
    try {
        // Obtiene usuarios pendientes usando token de autorización
        const response = await fetch('http://localhost:3000/api/admin/pending-users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const usuarios = await response.json();
        mostrarUsuariosPendientes(usuarios);
    } catch (error) {
        console.error('Error al cargar usuarios pendientes:', error);
    }
}

// Función para mostrar usuarios pendientes en la tabla
function mostrarUsuariosPendientes(usuarios) {
    const tbody = document.querySelector('#tablaPendientes tbody');
    tbody.innerHTML = '';

    usuarios.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.apellido}, ${usuario.nombre}</td>
            <td>${usuario.email}</td>
            <td>${usuario.username}</td>
            <td>
                <button onclick="aprobarUsuario(${usuario.id})" class="btn-aprobar">Aprobar</button>
                <button onclick="rechazarUsuario(${usuario.id})" class="btn-rechazar">Rechazar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para aprobar un usuario pendiente
async function aprobarUsuario(userId) {
    try {
        // Envía petición para aprobar usuario usando token
        const response = await fetch(`http://localhost:3000/api/admin/approve-user/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            alert('Usuario aprobado exitosamente');
            // Recarga las tablas
            cargarUsuariosPendientes();
            cargarUsuarios();
        }
    } catch (error) {
        console.error('Error al aprobar usuario:', error);
        alert('Error al aprobar usuario');
    }
}

// Event listener adicional para cargar usuarios pendientes
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuariosPendientes();
});
