<?php
session_start();
session_destroy();
header('Location: ../login-register.html');
exit;
?>