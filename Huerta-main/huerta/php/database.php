<?php
/**
 * Configuración de Base de Datos - Galería de Plantas
 * Huerta Escolar
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'practica');

// Crear conexión
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);

// Verificar conexión
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Establecer charset
$conn->set_charset("utf8mb4");

// Crear base de datos si no existe
$sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
if (!$conn->query($sql)) {
    die("Error al crear la base de datos: " . $conn->error);
}

// Seleccionar la base de datos
$conn->select_db(DB_NAME);

// Crear tabla de plantas si no existe (usando tu estructura)
$sql = "CREATE TABLE IF NOT EXISTS plantas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    nombre_cientifico VARCHAR(255),
    categoria ENUM('hortalizas', 'hierbas', 'flores', 'frutas') DEFAULT 'hortalizas',
    descripcion TEXT NOT NULL,
    dificultad ENUM('facil', 'media', 'dificil') NOT NULL DEFAULT 'facil',
    tiempo_crecimiento VARCHAR(100),
    necesidad_agua ENUM('baja', 'media', 'alta') DEFAULT 'media',
    luz_solar ENUM('pleno', 'parcial', 'sombra') DEFAULT 'pleno',
    temporada ENUM('primavera', 'verano', 'otoño', 'invierno') DEFAULT 'primavera',
    beneficios TEXT,
    cuidados TEXT,
    imagen_url VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_dificultad (dificultad),
    INDEX idx_fecha (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if (!$conn->query($sql)) {
    die("Error al crear la tabla: " . $conn->error);
}

// Insertar datos de ejemplo si la tabla está vacía
$result = $conn->query("SELECT COUNT(*) as count FROM plantas");
$row = $result->fetch_assoc();

if ($row['count'] == 0) {
    $plantas_ejemplo = [
        [
            'usuario_id' => 1,
            'nombre' => 'Tomate',
            'nombre_cientifico' => 'Solanum lycopersicum',
            'categoria' => 'hortalizas',
            'descripcion' => 'Variedad de tomate pequeño, dulce y fácil de cultivar. Perfecta para estudiantes principiantes. Produce frutos en racimos abundantes.',
            'necesidad_agua' => 'alta',
            'luz_solar' => 'pleno',
            'tiempo_crecimiento' => '60-70 días',
            'temporada' => 'primavera',
            'dificultad' => 'facil',
            'imagen_url' => 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800',
            'beneficios' => 'Rico en vitaminas C, A y licopeno. Excelente para ensaladas. Los estudiantes aprenden sobre polinización y crecimiento de frutos.',
            'cuidados' => 'Regar regularmente sin mojar las hojas. Colocar tutor o guía. Requiere mucha luz solar. Fertilizar cada 2 semanas.'
        ],
        [
            'usuario_id' => 1,
            'nombre' => 'Lechuga Romana',
            'nombre_cientifico' => 'Lactuca sativa var. longifolia',
            'categoria' => 'hortalizas',
            'descripcion' => 'Hortaliza de hojas crujientes y alargadas. Crecimiento rápido que permite ver resultados en poco tiempo. Ideal para huertos escolares.',
            'necesidad_agua' => 'media',
            'luz_solar' => 'parcial',
            'tiempo_crecimiento' => '45-55 días',
            'temporada' => 'otoño',
            'dificultad' => 'facil',
            'imagen_url' => 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800',
            'beneficios' => 'Rica en fibra, vitamina K y folato. Crece rápido, perfecto para motivar a los estudiantes. Bajo mantenimiento.',
            'cuidados' => 'Mantener suelo húmedo. Proteger del sol intenso del mediodía. Cosechar hojas exteriores primero. Plantar en sucesión para cosecha continua.'
        ],
        [
            'usuario_id' => 1,
            'nombre' => 'Zanahoria',
            'nombre_cientifico' => 'Daucus carota',
            'categoria' => 'hortalizas',
            'descripcion' => 'Raíz comestible naranja, dulce y crujiente. Enseña a los niños sobre vegetales que crecen bajo tierra. Variedad cilíndrica y uniforme.',
            'necesidad_agua' => 'media',
            'luz_solar' => 'pleno',
            'tiempo_crecimiento' => '70-80 días',
            'temporada' => 'primavera',
            'dificultad' => 'media',
            'imagen_url' => 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800',
            'beneficios' => 'Altísima en betacaroteno (vitamina A). Enseña paciencia y desarrollo de raíces. Excelente para la vista.',
            'cuidados' => 'Suelo suelto y profundo sin piedras. Riego regular pero moderado. Ralear plántulas a 5cm de distancia. Evitar suelos compactados.'
        ],
        [
            'usuario_id' => 1,
            'nombre' => 'Fresa',
            'nombre_cientifico' => 'Fragaria × ananassa',
            'categoria' => 'frutas',
            'descripcion' => 'Planta rastrera que produce deliciosos frutos rojos. Los estudiantes disfrutan viendo crecer y probando las fresas. Excelente para macetas.',
            'necesidad_agua' => 'alta',
            'luz_solar' => 'pleno',
            'tiempo_crecimiento' => '90-120 días',
            'temporada' => 'primavera',
            'dificultad' => 'media',
            'imagen_url' => 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800',
            'beneficios' => 'Rica en vitamina C y antioxidantes. Motiva a los estudiantes con frutos dulces y atractivos. Enseña sobre reproducción por estolones.',
            'cuidados' => 'Mantener suelo húmedo. Fertilizar mensualmente. Remover estolones si quieres más frutos. Proteger de babosas y pájaros con malla.'
        ]
    ];

    $stmt = $conn->prepare("INSERT INTO plantas (usuario_id, nombre, nombre_cientifico, categoria, descripcion, riego, luz_solar, tiempo_crecimiento, temporada, dificultad, imagen_url, beneficios, cuidados) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    foreach ($plantas_ejemplo as $planta) {
        $stmt->bind_param(
            "sssssssssssss",
            $planta['usuario_id'],
            $planta['nombre'],
            $planta['nombre_cientifico'],
            $planta['categoria'],
            $planta['descripcion'],
            $planta['necesidad_agua'],
            $planta['luz_solar'],
            $planta['tiempo_crecimiento'],
            $planta['temporada'],
            $planta['dificultad'],
            $planta['imagen_url'],
            $planta['beneficios'],
            $planta['cuidados']
        );
        $stmt->execute();
    }

    $stmt->close();
}

// Función para sanitizar datos de entrada
function sanitize_input($data) {
    global $conn;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $conn->real_escape_string($data);
}

// Función para responder en JSON
function json_response($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
?>