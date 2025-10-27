<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['current_user_id'])) {
    header('Location: ../login-register.html');
    exit;
}

$currentUserId = $_SESSION['current_user_id'] ?? null;

if (!$currentUserId) {
    die('<h2 style="color:red;text-align:center;margin-top:50px;">⚠️ Debes iniciar sesión primero.</h2>');
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE usuario_id = :usuario_id");
$stmt->execute([':usuario_id' => $currentUserId]);
$currentUser = $stmt->fetch();

if (!$currentUser) {
    die('<h2 style="color:red;text-align:center;margin-top:50px;">⚠️ Usuario no encontrado en la base de datos.</h2>');
}

// Definir avatar DESPUÉS de obtener $currentUser
// Si el usuario no tiene avatar, usar un avatar generado por UI Avatars
if (!empty($currentUser['avatar_url']) && $currentUser['avatar_url'] !== 'img/placeholder.svg') {
    $avatar = $currentUser['avatar_url'];
} else {
    // Generar avatar con iniciales
    $name = urlencode($currentUser['firstName'] . ' ' . $currentUser['lastName']);
    $avatar = "https://ui-avatars.com/api/?name={$name}&background=4f46e5&color=fff&size=128";
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comentarios</title>
    <link rel="stylesheet" href="../css/comentarios.css">
    <link rel="icon" type="image/png" href="../img/planta.png">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
</head>
<body>

    <div class="comments-container">
        <!-- 🟢 Encabezado -->
        <div class="comments-header">
            <div class="header-content">
                <h2 class="comments-title">Comentarios</h2>
                <a href="principal.php" id="backToHome" style="
                bottom: 1rem;
                right: 1rem;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #10b981, #059669);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                text-decoration: none;">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M7 13L2 8M2 8L7 3M2 8H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
                <div class="comments-stats">
                    <span class="stat-item">
                        <span class="stat-number" id="total-comments">0</span>
                        <span class="stat-label">comentarios</span>
                    </span>
                    <span class="stat-divider">·</span>
                    <span class="stat-item">
                        <span class="stat-number" id="total-participants">0</span>
                        <span class="stat-label">participantes</span>
                    </span>
                </div>
            </div>
        </div>

        <div class="new-comment-section">
            <div class="user-avatar">
                <img 
                    src="<?php echo htmlspecialchars($avatar); ?>" 
                    alt="Tu avatar"
                >
            </div>

            <div class="comment-form">
                <textarea 
                    id="new-comment-input"
                    class="comment-input" 
                    placeholder="Comparte tu opinión de manera constructiva..."
                    rows="1"
                ></textarea>

                <div class="form-actions" style="justify-content: flex-end;">
                    <!-- Botón publicar -->
                    <button id="submit-comment-btn" class="submit-btn" disabled>
                        <span>Publicar</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 8L14 8M14 8L9 3M14 8L9 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- 💬 Lista de comentarios -->
        <div id="comments-list" class="comments-list">
            <!-- Comentarios dinámicos (se cargan con JS) -->
        </div>

        <!-- 📽 Botón cargar más -->
        <div class="load-more-section" id="load-more-section" style="display: none;">
            <button id="load-more-btn" class="load-more-btn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4V16M10 16L6 12M10 16L14 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Cargar más comentarios</span>
            </button>
        </div>
    </div>

    <!-- 📝 Pasar usuario actual al frontend -->
    <script>
        window.currentUser = <?php echo json_encode($currentUser, JSON_UNESCAPED_UNICODE); ?>;
    </script>

    <!-- JS principal -->
    <script src="../js/comentarios.js"></script>
</body>
</html>