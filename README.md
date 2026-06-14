# Huerta Escolar — Sistema de Gestión Web

Aplicación web fullstack para la gestión de una huerta escolar automatizada con Arduino. Permite registrar plantas, gestionar usuarios, subir fotos a una galería y participar en una sección de comentarios con respuestas anidadas y sistema de likes.

---

## Tecnologías utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** PHP con PDO
- **Base de datos:** MySQL
- **Hardware:** Arduino (sistema de riego automatizado)

---

## Funcionalidades principales

-  Registro e inicio de sesión de usuarios con sesiones PHP
-  Galería de plantas con categorías, dificultad, temporada y necesidad de agua
-  Sistema de comentarios con respuestas anidadas, likes y edición
-  API REST en PHP para operaciones CRUD
-  Panel de administración de plantas
-  Integración con sistema de riego automatizado (Arduino + MySQL)
-  Diseño responsive con CSS propio

---

## Estructura de la base de datos

```
usuarios         → Registro y autenticación de usuarios
plantas          → Catálogo de plantas con información detallada
comentarios      → Sistema de comentarios con respuestas anidadas
comentarios_like → Control de likes por usuario
```

---

## Estructura del proyecto

```
huerta/
├── css/
│   ├── principal.css
│   ├── galeria.css
│   ├── comentarios.css
│   └── login-register.css
├── js/
│   ├── principal.js
│   ├── galeria.js
│   ├── comentarios.js
│   └── login-register.js
├── php/
│   ├── config.php
│   ├── database.php
│   ├── api.php
│   ├── api-galeria.php
│   ├── principal.php
│   ├── galeria.php
│   ├── comentarios.php
│   ├── login.php
│   ├── registro.php
│   ├── logout.php
│   └── index.php
├── img/
├── videos/
└── login-register.html
huerta.sql
```

---

## Instalación local

1. Clonar el repositorio:
```bash
git clone https://github.com/yhojannes/huerta-semiCompleta.git
```

2. Importar la base de datos en MySQL:
```bash
mysql -u root -p < huerta.sql
```

3. Configurar las credenciales de la base de datos en `huerta/php/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_contraseña');
define('DB_NAME', 'practica');
```

4. Servir el proyecto con un servidor local como XAMPP o WAMP apuntando a la carpeta `huerta/`.

5. Acceder en el navegador:
```
http://localhost/huerta/login-register.html
```

---

## Usuario de prueba

```
Email: admin@example.com
Contraseña: 1234
```

---

## Contexto del proyecto

Este proyecto fue desarrollado como parte de la formación técnica en el **SENA** (Servicio Nacional de Aprendizaje), en el programa de **Análisis y Desarrollo de Software**. La huerta escolar es un proyecto real integrado con sensores Arduino para automatizar el sistema de riego según las necesidades de cada planta registrada en la base de datos.

---

## Autor

**Yhojannes**  
Estudiante de Análisis y Desarrollo de Software — SENA  
Medellín, Colombia  
GitHub: [@yhojannes](https://github.com/yhojannes)
