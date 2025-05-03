async function handleLogout(event) {
    event.preventDefault();
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = '/login.html';
        } else {
            console.error('Error al cerrar sesión');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}