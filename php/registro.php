<?php
include 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST['nombre'];
    $apellido = $_POST['apellido'];
    $email = $_POST['email'];
    $telefono = $_POST['telefono'];
    $dni = $_POST['dni'];
    $usuario = $_POST['usuario'];
    $contraseña = password_hash($_POST['contraseña'], PASSWORD_DEFAULT);

    // Insertar los datos en la tabla de solicitudes
    $stmt = $conn->prepare("INSERT INTO solicitudes_registro (nombre, apellido, email, telefono, dni, nombre_usuario, contraseña) 
                            VALUES (?, ?, ?, ?, ?, ?, ?)");

    if ($stmt->execute([$nombre, $apellido, $email, $telefono, $dni, $usuario, $contraseña])) {
        echo "✅ Registro enviado. Espera la aprobación del administrador.";
    } else {
        echo "❌ Error al enviar la solicitud de registro.";
    }
}
?>
