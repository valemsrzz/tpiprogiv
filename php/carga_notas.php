<?php
include 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $estudiante_id = $_POST['estudiante_id'];
    $materia_id = $_POST['materia_id'];
    $division = $_POST['division'];
    $nota_1 = $_POST['nota_1'];
    $nota_2 = $_POST['nota_2'];
    $nota_final = $_POST['nota_final'];

    $stmt = $conn->prepare("INSERT INTO calificaciones (estudiante_id, materia_id, division, nota_1, nota_2, nota_final)
                            VALUES (?, ?, ?, ?, ?, ?)");
    if ($stmt->execute([$estudiante_id, $materia_id, $division, $nota_1, $
