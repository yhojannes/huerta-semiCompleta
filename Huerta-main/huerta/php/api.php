<?php
require_once 'config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 🔹 Conexión a la base de datos
$pdo = getDBConnection();

// 🔹 Obtener el ID del usuario actual desde la sesión
if (!isset($_SESSION['current_user_id'])) {
    sendJSON(['error' => 'Usuario no autenticado'], 401);
}
$currentUserId = $_SESSION['current_user_id'];

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

/* ==========================
   GET: Obtener comentarios
========================== */
if ($method === 'GET' && $action === 'comments') {
    $filter = $_GET['filter'] ?? 'all';
    $sort = $_GET['sort'] ?? 'newest';
    $limit = intval($_GET['limit'] ?? 20);
    $offset = intval($_GET['offset'] ?? 0);
    $parentId = $_GET['parent_id'] ?? null;

    $query = "
        SELECT 
            c.comentario_id AS id,
            c.content,
            c.likes_count,
            c.replies_count,
            c.is_edited,
            c.created_at,
            c.parent_id,
            u.usuario_id,
            u.firstName,
            u.lastName,
            u.avatar_url,
            EXISTS(
                SELECT 1 FROM comentarios_like 
                WHERE comentario_id = c.comentario_id AND usuario_id = :current_user_id
            ) as is_liked_by_current_user
        FROM comentarios c
        INNER JOIN usuarios u ON c.usuario_id = u.usuario_id
    ";

    if ($parentId !== null) {
        $query .= " WHERE c.parent_id = :parent_id";
    } else {
        $query .= " WHERE c.parent_id IS NULL";
    }

    switch ($sort) {
        case 'oldest': $query .= " ORDER BY c.created_at ASC"; break;
        case 'popular': $query .= " ORDER BY c.likes_count DESC, c.created_at DESC"; break;
        case 'replies': $query .= " ORDER BY c.replies_count DESC, c.created_at DESC"; break;
        case 'newest':
        default: $query .= " ORDER BY c.created_at DESC"; break;
    }

    $query .= " LIMIT :limit OFFSET :offset";

    $stmt = $pdo->prepare($query);
    $stmt->bindValue(':current_user_id', $currentUserId, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    if ($parentId !== null) $stmt->bindValue(':parent_id', intval($parentId), PDO::PARAM_INT);

    $stmt->execute();
    $comments = $stmt->fetchAll();

    $statsQuery = "SELECT COUNT(DISTINCT c.comentario_id) as total_comments, COUNT(DISTINCT c.usuario_id) as total_participants FROM comentarios c";
    $stats = $pdo->query($statsQuery)->fetch();

    sendJSON([
        'success' => true,
        'comments' => $comments,
        'stats' => $stats,
        'has_more' => count($comments) === $limit
    ]);
}

/* ==========================
   GET: Obtener respuestas
========================== */
if ($method === 'GET' && $action === 'replies') {
    $commentId = intval($_GET['comment_id'] ?? 0);
    if ($commentId <= 0) sendJSON(['error' => 'ID de comentario inválido'], 400);

    $query = "
        SELECT 
            c.comentario_id AS id,
            c.content,
            c.likes_count,
            c.replies_count,
            c.is_edited,
            c.created_at,
            c.parent_id,
            u.usuario_id,
            u.firstName,
            u.lastName,
            u.avatar_url,
            EXISTS(
                SELECT 1 FROM comentarios_like 
                WHERE comentario_id = c.comentario_id AND usuario_id = :current_user_id
            ) as is_liked_by_current_user
        FROM comentarios c
        INNER JOIN usuarios u ON c.usuario_id = u.usuario_id
        WHERE c.parent_id = :comment_id
        ORDER BY c.created_at ASC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->bindValue(':current_user_id', $currentUserId, PDO::PARAM_INT);
    $stmt->bindValue(':comment_id', $commentId, PDO::PARAM_INT);
    $stmt->execute();

    sendJSON([
        'success' => true,
        'replies' => $stmt->fetchAll()
    ]);
}

/* ==========================
   POST: Crear comentario
========================== */
if ($method === 'POST' && $action === 'create') {
    $input = json_decode(file_get_contents('php://input'), true);
    $content = sanitizeInput($input['content'] ?? '');
    $parentId = isset($input['parent_id']) ? intval($input['parent_id']) : null;

    if (!validateInput($content, 1, 5000)) sendJSON(['error' => 'El contenido del comentario es inválido'], 400);

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO comentarios (usuario_id, parent_id, content) VALUES (:usuario_id, :parent_id, :content)");
        $stmt->execute([
            ':usuario_id' => $currentUserId,
            ':parent_id' => $parentId,
            ':content' => $content
        ]);
        $commentId = $pdo->lastInsertId();

        if ($parentId !== null) {
            $stmt = $pdo->prepare("UPDATE comentarios SET replies_count = replies_count + 1 WHERE comentario_id = :parent_id");
            $stmt->execute([':parent_id' => $parentId]);
        }

        $pdo->commit();

        $stmt = $pdo->prepare("
            SELECT 
                c.comentario_id AS id,
                c.content,
                c.likes_count,
                c.replies_count,
                c.is_edited,
                c.created_at,
                c.parent_id,
                u.usuario_id,
                u.firstName,
                u.lastName,
                u.avatar_url,
                FALSE as is_liked_by_current_user
            FROM comentarios c
            INNER JOIN usuarios u ON c.usuario_id = u.usuario_id
            WHERE c.comentario_id = :comment_id
        ");
        $stmt->execute([':comment_id' => $commentId]);
        $comment = $stmt->fetch();

        sendJSON(['success' => true, 'message' => 'Comentario publicado exitosamente', 'comment' => $comment], 201);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendJSON(['error' => 'Error al crear el comentario'], 500);
    }
}

/* ==========================
   POST: Toggle Like
========================== */
if ($method === 'POST' && $action === 'toggle_like') {
    $input = json_decode(file_get_contents('php://input'), true);
    $commentId = intval($input['comment_id'] ?? 0);
    if ($commentId <= 0) sendJSON(['error' => 'ID de comentario inválido'], 400);

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT comentario_like_id FROM comentarios_like WHERE comentario_id = :comment_id AND usuario_id = :usuario_id");
        $stmt->execute([':comment_id' => $commentId, ':usuario_id' => $currentUserId]);
        $existingLike = $stmt->fetch();

        if ($existingLike) {
            $stmt = $pdo->prepare("DELETE FROM comentarios_like WHERE comentario_id = :comment_id AND usuario_id = :usuario_id");
            $stmt->execute([':comment_id' => $commentId, ':usuario_id' => $currentUserId]);
            $stmt = $pdo->prepare("UPDATE comentarios SET likes_count = GREATEST(0, likes_count - 1) WHERE comentario_id = :comment_id");
            $stmt->execute([':comment_id' => $commentId]);
            $isLiked = false;
        } else {
            $stmt = $pdo->prepare("INSERT INTO comentarios_like (comentario_id, usuario_id) VALUES (:comment_id, :usuario_id)");
            $stmt->execute([':comment_id' => $commentId, ':usuario_id' => $currentUserId]);
            $stmt = $pdo->prepare("UPDATE comentarios SET likes_count = likes_count + 1 WHERE comentario_id = :comment_id");
            $stmt->execute([':comment_id' => $commentId]);
            $isLiked = true;
        }

        $stmt = $pdo->prepare("SELECT likes_count FROM comentarios WHERE comentario_id = :comment_id");
        $stmt->execute([':comment_id' => $commentId]);
        $likesCount = $stmt->fetchColumn();

        $pdo->commit();

        sendJSON(['success' => true, 'is_liked' => $isLiked, 'likes_count' => $likesCount]);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendJSON(['error' => 'Error al procesar el like'], 500);
    }
}

/* ==========================
   DELETE: Eliminar comentario
========================== */
if ($method === 'DELETE' && $action === 'delete') {
    $commentId = intval($_GET['comment_id'] ?? 0);
    if ($commentId <= 0) sendJSON(['error' => 'ID de comentario inválido'], 400);

    $stmt = $pdo->prepare("SELECT usuario_id, parent_id FROM comentarios WHERE comentario_id = :comment_id");
    $stmt->execute([':comment_id' => $commentId]);
    $comment = $stmt->fetch();

    if (!$comment) sendJSON(['error' => 'Comentario no encontrado'], 404);
    if ($comment['usuario_id'] != $currentUserId) sendJSON(['error' => 'No tienes permiso para eliminar este comentario'], 403);

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("DELETE FROM comentarios WHERE comentario_id = :comment_id");
        $stmt->execute([':comment_id' => $commentId]);

        if ($comment['parent_id'] !== null) {
            $stmt = $pdo->prepare("UPDATE comentarios SET replies_count = GREATEST(0, replies_count - 1) WHERE comentario_id = :parent_id");
            $stmt->execute([':parent_id' => $comment['parent_id']]);
        }

        $pdo->commit();
        sendJSON(['success' => true, 'message' => 'Comentario eliminado exitosamente']);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendJSON(['error' => 'Error al eliminar el comentario'], 500);
    }
}

/* ==========================
   PUT: Editar comentario
========================== */
if ($method === 'PUT' && $action === 'update') {
    $input = json_decode(file_get_contents('php://input'), true);
    $commentId = intval($input['comment_id'] ?? 0);
    $content = sanitizeInput($input['content'] ?? '');

    if ($commentId <= 0) sendJSON(['error' => 'ID de comentario inválido'], 400);
    if (!validateInput($content, 1, 5000)) sendJSON(['error' => 'El contenido del comentario es inválido'], 400);

    $stmt = $pdo->prepare("SELECT usuario_id FROM comentarios WHERE comentario_id = :comment_id");
    $stmt->execute([':comment_id' => $commentId]);
    $comment = $stmt->fetch();

    if (!$comment) sendJSON(['error' => 'Comentario no encontrado'], 404);
    if ($comment['usuario_id'] != $currentUserId) sendJSON(['error' => 'No tienes permiso para editar este comentario'], 403);

    try {
        $stmt = $pdo->prepare("UPDATE comentarios SET content = :content, is_edited = TRUE WHERE comentario_id = :comment_id");
        $stmt->execute([':content' => $content, ':comment_id' => $commentId]);
        sendJSON(['success' => true, 'message' => 'Comentario actualizado exitosamente']);
    } catch (Exception $e) {
        sendJSON(['error' => 'Error al actualizar el comentario'], 500);
    }
}

// Endpoint no encontrado
sendJSON(['error' => 'Endpoint no encontrado'], 404);
?>