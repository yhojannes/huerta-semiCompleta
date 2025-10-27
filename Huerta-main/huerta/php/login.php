<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Datos de conexión
$servername = 'localhost';
$database   = 'practica';
$username   = 'root';
$password   = '';

$conexion = mysqli_connect($servername, $username, $password, $database);

if (!$conexion) {
    echo json_encode([
        "status" => "error",
        "message" => "Error en la conexión: " . mysqli_connect_error()
    ]);
    exit;
}

if (isset($_POST['email'], $_POST['password'])) {
    $correo = $_POST['email'];
    $passwordIngresada = $_POST['password'];

    $stmt = mysqli_prepare($conexion, "SELECT usuario_id, firstName, lastName, email, pass FROM usuarios WHERE email = ?");
    mysqli_stmt_bind_param($stmt, "s", $correo);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    if ($fila = mysqli_fetch_assoc($resultado)) {
        if (password_verify($passwordIngresada, $fila['pass'])) {
            $_SESSION['current_user_id'] = $fila['usuario_id'];
            $_SESSION['current_user_name'] = $fila['firstName'] . ' ' . $fila['lastName'];
            
            echo json_encode([
                "status" => "success",
                "message" => "Inicio de sesión exitoso",
                "redirect" => "/principal.php",
                "user" => [
                    "id" => $fila['usuario_id'],
                    "firstName" => $fila['firstName'],
                    "lastName" => $fila['lastName'],
                    "email" => $fila['email']
                ]
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "La contraseña es incorrecta"
            ]);
        }
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "El correo no está registrado"
        ]);
    }

    mysqli_stmt_close($stmt);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Faltan datos en el formulario"
    ]);
}

mysqli_close($conexion);
?>