// Cargar usuarios pendientes
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
                    <button onclick="approveUser(${user.id})" class="approve-btn">Aprobar</button>
                    <button onclick="deleteUser(${user.id})" class="reject-btn">Rechazar</button>
                </td>
            `;
            pendingList.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading pending users:', error);
    }
}

// Aprobar usuario
async function approveUser(userId) {
    try {
        const response = await fetch(`/api/users/approve/${userId}`, {
            method: 'POST',
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            alert('Usuario aprobado exitosamente');
            loadPendingUsers();
            loadAllUsers();
        }
    } catch (error) {
        console.error('Error approving user:', error);
    }
}

// Eliminar usuario
async function deleteUser(userId) {
    if (confirm('¿Está seguro de rechazar este usuario?')) {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                alert('Usuario rechazado');
                loadPendingUsers();
                loadAllUsers();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }
}

// Agregar nuevo usuario manualmente
document.getElementById('addUserBtn').addEventListener('click', async () => {
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
            // Limpiar formulario
            document.querySelectorAll('.add-user-form input').forEach(input => input.value = '');
            document.getElementById('rol').value = '';
        } else {
            alert(data.error || 'Error al crear usuario');
        }
    } catch (error) {
        console.error('Error creating user:', error);
    }
});

// Cargar todos los usuarios
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
                    <button onclick="deleteUser(${user.id})" class="delete-btn">Eliminar</button>
                </td>
            `;
            userList.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}


// At the start of the file
async function checkAdminAccess() {
    try {
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
        console.error('Error checking admin access:', error);
        window.location.href = '/login.html';
    }
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    loadPendingUsers();
    loadAllUsers();
});
