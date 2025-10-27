<?php
session_start();

// Si ya hay sesión, redirigir a principal
if (isset($_SESSION['current_user_id'])) {
    header('Location: principal.php');
    exit;
}

// Si no hay sesión, redirigir al login
header('Location: login-register.html');
exit;
?>