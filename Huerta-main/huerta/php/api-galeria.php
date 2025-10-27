<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Incluir configuración de base de datos
require_once 'database.php';

// Configurar headers CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

error_log("API Call - Method: $method, Action: $action");

try {
    switch ($method) {
        case 'GET': handleGet($action); break;
        case 'POST': handlePost($action); break;
        case 'PUT': handlePut($action); break;
        case 'DELETE': handleDelete($action); break;
        default: sendResponse(['success' => false, 'error' => 'Método HTTP no permitido'], 405);
    }
} catch (Exception $e) {
    sendResponse(['success' => false, 'error' => $e->getMessage()], 500);
}

/* =========================
   FUNCIONES PRINCIPALES
   ========================= */

function handleGet($action) {
    if ($action === 'all' || $action === '') {
        getAllPlants();
    } elseif ($action === 'one') {
        if (!isset($_GET['id'])) sendResponse(['success' => false, 'error' => 'ID requerido'], 400);
        getPlantById($_GET['id']);
    } elseif ($action === 'search') {
        if (!isset($_GET['q'])) sendResponse(['success' => false, 'error' => 'Parámetro q requerido'], 400);
        searchPlants($_GET['q']);
    } else {
        sendResponse(['success' => false, 'error' => 'Acción GET no válida. Use: all, one, search'], 400);
    }
}

function handlePost($action) {
    if ($action === 'create') createPlant();
    else sendResponse(['success' => false, 'error' => 'Acción POST no válida. Use: create'], 400);
}

function handlePut($action) {
    if ($action === 'update') {
        if (!isset($_GET['id'])) sendResponse(['success' => false, 'error' => 'ID requerido'], 400);
        updatePlant($_GET['id']);
    } else {
        sendResponse(['success' => false, 'error' => 'Acción PUT no válida. Use: update'], 400);
    }
}

function handleDelete($action) {
    if ($action === 'delete') {
        if (!isset($_GET['id'])) sendResponse(['success' => false, 'error' => 'ID requerido'], 400);
        deletePlant($_GET['id']);
    } else {
        sendResponse(['success' => false, 'error' => 'Acción DELETE no válida. Use: delete'], 400);
    }
}

/* =========================
   CRUD DE PLANTAS
   ========================= */

function getAllPlants() {
    global $conn;

    $sql = "SELECT * FROM plantas ORDER BY fecha_creacion DESC";
    $result = $conn->query($sql);

    if (!$result) sendResponse(['success' => false, 'error' => 'Error en la consulta: ' . $conn->error], 500);

    $plantas = [];
    while ($row = $result->fetch_assoc()) {
        $plantas[] = formatPlantData($row);
    }

    sendResponse(['success' => true, 'data' => $plantas, 'count' => count($plantas)]);
}

function getPlantById($id) {
    global $conn;

    $id = intval($id);
    $sql = "SELECT * FROM plantas WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) sendResponse(['success' => false, 'error' => 'Error al preparar consulta: ' . $conn->error], 500);

    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) sendResponse(['success' => false, 'error' => 'Planta no encontrada'], 404);

    $planta = $result->fetch_assoc();
    sendResponse(['success' => true, 'data' => formatPlantData($planta)]);
}

function searchPlants($query) {
    global $conn;

    $searchTerm = "%" . $conn->real_escape_string($query) . "%";
    $sql = "SELECT * FROM plantas WHERE nombre LIKE ? OR nombre_cientifico LIKE ? OR descripcion LIKE ? ORDER BY nombre ASC";
    $stmt = $conn->prepare($sql);
    if (!$stmt) sendResponse(['success' => false, 'error' => 'Error al preparar consulta: ' . $conn->error], 500);

    $stmt->bind_param("sss", $searchTerm, $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();

    $plantas = [];
    while ($row = $result->fetch_assoc()) $plantas[] = formatPlantData($row);

    sendResponse(['success' => true, 'data' => $plantas, 'count' => count($plantas)]);
}

function createPlant() {
    global $conn;

    $input = file_get_contents('php://input');
    error_log("Input recibido: " . $input);

    $data = json_decode($input, true);
    if (!$data) sendResponse(['success' => false, 'error' => 'Datos JSON inválidos', 'raw_input' => $input], 400);

    error_log("Datos decodificados: " . print_r($data, true));

    // Campos requeridos
    if (empty($data['nombre']) || empty($data['nombre_cientifico']) || empty($data['descripcion']) || empty($data['imagen_url'])) {
        $missing = [];
        if (empty($data['nombre'])) $missing[] = 'nombre';
        if (empty($data['nombre_cientifico'])) $missing[] = 'nombre_cientifico';
        if (empty($data['descripcion'])) $missing[] = 'descripcion';
        if (empty($data['imagen_url'])) $missing[] = 'imagen_url';
        sendResponse(['success' => false, 'error' => 'Campos requeridos faltantes: ' . implode(', ', $missing)], 400);
    }

    // ✅ FIX: Asignar valores a variables ANTES de bind_param
    $usuario_id = isset($data['usuario_id']) ? intval($data['usuario_id']) : 1;
    $nombre = $conn->real_escape_string($data['nombre']);
    $nombre_cientifico = $conn->real_escape_string($data['nombre_cientifico']);
    
    // Asignar valores por defecto a variables separadas
    $categoria_default = 'hortalizas';
    $categoria = isset($data['categoria']) ? $conn->real_escape_string($data['categoria']) : $categoria_default;
    
    $descripcion = $conn->real_escape_string($data['descripcion']);
    
    $riego_default = 'media';
    $riego = isset($data['riego']) ? $conn->real_escape_string($data['riego']) : 
             (isset($data['waterNeeds']) ? $conn->real_escape_string($data['waterNeeds']) : $riego_default);
    
    $luz_default = 'pleno';
    $luz_solar = isset($data['luz_solar']) ? $conn->real_escape_string($data['luz_solar']) : 
                 (isset($data['sunlight']) ? $conn->real_escape_string($data['sunlight']) : $luz_default);
    
    $tiempo_default = '';
    $tiempo_crecimiento = isset($data['tiempo_crecimiento']) ? $conn->real_escape_string($data['tiempo_crecimiento']) : 
                          (isset($data['growthTime']) ? $conn->real_escape_string($data['growthTime']) : $tiempo_default);
    
    $temporada_default = 'primavera';
    $temporada = isset($data['temporada']) ? $conn->real_escape_string($data['temporada']) : 
                 (isset($data['season']) ? $conn->real_escape_string($data['season']) : $temporada_default);
    
    $dificultad_default = 'facil';
    $dificultad = isset($data['dificultad']) ? $conn->real_escape_string($data['dificultad']) : 
                  (isset($data['difficulty']) ? $conn->real_escape_string($data['difficulty']) : $dificultad_default);
    
    $imagen_url = $conn->real_escape_string($data['imagen_url']);
    
    $beneficios_default = '';
    $beneficios = isset($data['beneficios']) ? $conn->real_escape_string($data['beneficios']) : $beneficios_default;
    
    $cuidados_default = '';
    $cuidados = isset($data['cuidados']) ? $conn->real_escape_string($data['cuidados']) : $cuidados_default;

    $sql = "INSERT INTO plantas (
        usuario_id, nombre, nombre_cientifico, categoria, descripcion,
        riego, luz_solar, tiempo_crecimiento, temporada,
        dificultad, imagen_url, beneficios, cuidados
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if (!$stmt) sendResponse(['success' => false, 'error' => 'Error al preparar consulta: ' . $conn->error], 500);

    $stmt->bind_param(
        "issssssssssss",
        $usuario_id,
        $nombre,
        $nombre_cientifico,
        $categoria,
        $descripcion,
        $riego,
        $luz_solar,
        $tiempo_crecimiento,
        $temporada,
        $dificultad,
        $imagen_url,
        $beneficios,
        $cuidados
    );

    if ($stmt->execute()) {
        sendResponse(['success' => true, 'message' => 'Planta creada exitosamente', 'id' => $conn->insert_id], 201);
    } else {
        sendResponse(['success' => false, 'error' => 'Error al crear planta: ' . $stmt->error], 500);
    }
}

function updatePlant($id) {
    global $conn;

    $id = intval($id);
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) sendResponse(['success' => false, 'error' => 'Datos JSON inválidos'], 400);

    $check = $conn->query("SELECT id FROM plantas WHERE id = $id");
    if ($check->num_rows === 0) sendResponse(['success' => false, 'error' => 'Planta no encontrada'], 404);

    // ✅ FIX: Asignar valores por defecto a variables
    $nombre = isset($data['nombre']) ? $data['nombre'] : '';
    $nombre_cientifico = isset($data['nombre_cientifico']) ? $data['nombre_cientifico'] : '';
    $categoria = isset($data['categoria']) ? $data['categoria'] : 'hortalizas';
    $descripcion = isset($data['descripcion']) ? $data['descripcion'] : '';
    $riego = isset($data['riego']) ? $data['riego'] : 'media';
    $luz_solar = isset($data['luz_solar']) ? $data['luz_solar'] : 'pleno';
    $tiempo_crecimiento = isset($data['tiempo_crecimiento']) ? $data['tiempo_crecimiento'] : '';
    $temporada = isset($data['temporada']) ? $data['temporada'] : 'primavera';
    $dificultad = isset($data['dificultad']) ? $data['dificultad'] : 'facil';
    $imagen_url = isset($data['imagen_url']) ? $data['imagen_url'] : '';
    $beneficios = isset($data['beneficios']) ? $data['beneficios'] : '';
    $cuidados = isset($data['cuidados']) ? $data['cuidados'] : '';

    $sql = "UPDATE plantas SET 
        nombre=?, nombre_cientifico=?, categoria=?, descripcion=?, 
        riego=?, luz_solar=?, tiempo_crecimiento=?, temporada=?, 
        dificultad=?, imagen_url=?, beneficios=?, cuidados=? 
        WHERE id=?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) sendResponse(['success' => false, 'error' => 'Error al preparar consulta: ' . $conn->error], 500);

    $stmt->bind_param(
        "ssssssssssssi",
        $nombre,
        $nombre_cientifico,
        $categoria,
        $descripcion,
        $riego,
        $luz_solar,
        $tiempo_crecimiento,
        $temporada,
        $dificultad,
        $imagen_url,
        $beneficios,
        $cuidados,
        $id
    );

    if ($stmt->execute()) sendResponse(['success' => true, 'message' => 'Planta actualizada exitosamente']);
    else sendResponse(['success' => false, 'error' => 'Error al actualizar: ' . $stmt->error], 500);
}

function deletePlant($id) {
    global $conn;
    $id = intval($id);
    $check = $conn->query("SELECT id FROM plantas WHERE id = $id");
    if ($check->num_rows === 0) sendResponse(['success' => false, 'error' => 'Planta no encontrada'], 404);

    $stmt = $conn->prepare("DELETE FROM plantas WHERE id = ?");
    if (!$stmt) sendResponse(['success' => false, 'error' => 'Error al preparar consulta: ' . $conn->error], 500);

    $stmt->bind_param("i", $id);
    if ($stmt->execute()) sendResponse(['success' => true, 'message' => 'Planta eliminada exitosamente']);
    else sendResponse(['success' => false, 'error' => 'Error al eliminar: ' . $stmt->error], 500);
}

/* =========================
   UTILIDADES
   ========================= */

function formatPlantData($row) {
    return [
        'id' => (int)$row['id'],
        'usuario_id' => (int)$row['usuario_id'],
        'name' => $row['nombre'],
        'scientificName' => $row['nombre_cientifico'],
        'category' => $row['categoria'],
        'description' => $row['descripcion'],
        'waterNeeds' => $row['riego'],
        'sunlight' => $row['luz_solar'],
        'growthTime' => $row['tiempo_crecimiento'],
        'season' => $row['temporada'],
        'difficulty' => $row['dificultad'],
        'image' => $row['imagen_url'],
        'benefits' => $row['beneficios'],
        'care' => $row['cuidados'],
        'createdAt' => $row['fecha_creacion'],
        'updatedAt' => $row['fecha_actualizacion']
    ];
}

function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
?>