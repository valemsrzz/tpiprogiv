async function handleLogout(event) {
    event.preventDefault();
    try {
        const response = await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
            window.location.href = data.redirect || '/login.html';
        } else {
            console.error('Error al cerrar sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        window.location.href = '/login.html';
    }
}