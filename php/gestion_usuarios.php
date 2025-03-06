<?php
include 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id = $_POST['id'];
    $accion = $_POST['accion'];

    if ($accion == 'aceptar') {
        $stmt = $conn->prepare("UPDATE usuarios SET aceptado = TRUE WHERE id = ?");
        $stmt->execute([$id]);
        echo "✅ Alumno aceptado.";
    } elseif ($accion == 'eliminar') {
        $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ?");
        $stmt->execute([$id]);
        echo "🗑️ Alumno eliminado.";
    }
}
?>
