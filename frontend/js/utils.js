// Utilidad para mostrar notificaciones
function showNotification(type, message) {
    // Crea un nuevo elemento div para la notificación
    const notification = document.createElement('div');
    
    // Asigna las clases CSS: 'notification' y el tipo específico (success, error, warning, info)
    notification.className = `notification ${type}`;
    
    // Establece el mensaje de la notificación
    notification.textContent = message;
    
    // Agrega la notificación al cuerpo del documento
    document.body.appendChild(notification);
    
    // Elimina la notificación después de 3 segundos (3000 milisegundos)
    setTimeout(() => notification.remove(), 3000);
}

// Exporta la función para poder usarla en otros archivos
export { showNotification };