<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'practica');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => '❌ Error de conexión a la base de datos: ' . $e->getMessage()]);
        exit;
    }
}

function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// ==============================
// 🧼 SANITIZAR ENTRADAS DE USUARIO
// ==============================
function sanitizeInput($data) {
    if (!is_string($data)) return $data;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// ==============================
// ✅ VALIDAR CAMPOS DE TEXTO
// ==============================
function validateInput($data, $minLength = 1, $maxLength = 5000) {
    if (!is_string($data)) return false;
    $length = strlen(trim($data));
    return $length >= $minLength && $length <= $maxLength;
}
?>
