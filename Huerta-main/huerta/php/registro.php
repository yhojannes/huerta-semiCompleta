<?php
header('Content-Type: application/json');

// Datos de conexión
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "practica";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Error en la conexión con la base de datos."]);
    exit();
}

// Capturar y limpiar datos
$firstName = trim($_POST['firstName'] ?? '');
$lastName = trim($_POST['lastName'] ?? '');
$email = trim($_POST['registerEmail'] ?? '');
$pass = trim($_POST['registerPassword'] ?? '');

// Validar campos
if (!$firstName || !$lastName || !$email || !$pass) {
    echo json_encode(["status" => "error", "message" => "Todos los campos son obligatorios."]);
    exit();
}

// Verificar si el correo ya existe
$sql_check = $conn->prepare("SELECT email FROM usuarios WHERE email = ?");
$sql_check->bind_param("s", $email);
$sql_check->execute();
$sql_check->store_result();

if ($sql_check->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "El correo ya está registrado."]);
    $sql_check->close();
    $conn->close();
    exit();
}
$sql_check->close();

$hashed_pass = password_hash($pass, PASSWORD_DEFAULT);

// Insertar nuevo registro
$sql = $conn->prepare("INSERT INTO usuarios (firstName, lastName, email, pass) VALUES (?, ?, ?, ?)");
$sql->bind_param("ssss", $firstName, $lastName, $email, $hashed_pass);

if ($sql->execute()) {
    echo json_encode(["status" => "success", "message" => "Registro exitoso."]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al registrar el usuario."]);
}

$sql->close();
$conn->close();
?>