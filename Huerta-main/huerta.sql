CREATE DATABASE practica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE practica;

CREATE TABLE usuarios(
usuario_id INT PRIMARY KEY AUTO_INCREMENT,
firstName VARCHAR(50),
lastName VARCHAR(100),
email VARCHAR(100) UNIQUE,
avatar_url VARCHAR(255) DEFAULT '../img/man-157699_1280.png',
pass VARCHAR(100)
);
SELECT * FROM usuarios;
INSERT INTO usuarios (usuario_id, firstName, email, pass)
VALUES (1, 'Administrador', 'admin@example.com', '1234');

CREATE TABLE comentarios (
comentario_id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
parent_id INT NULL,
content TEXT NOT NULL,
likes_count INT DEFAULT 0,
replies_count INT DEFAULT 0,
is_edited BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
FOREIGN KEY (parent_id) REFERENCES comentarios(comentario_id) ON DELETE CASCADE,
INDEX idx_parent_id (parent_id),
INDEX idx_registro_id (usuario_id),
INDEX idx_created_at (created_at)
);

CREATE TABLE comentarios_like (
comentario_like_id INT AUTO_INCREMENT PRIMARY KEY,
comentario_id INT NOT NULL,
usuario_id INT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (comentario_id) REFERENCES comentarios(comentario_id) ON DELETE CASCADE,
FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
UNIQUE KEY unique_like (comentario_id, usuario_id),
INDEX idx_comentario_id (comentario_id),
INDEX idx_registro_id (usuario_id)
);

CREATE TABLE plantas (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
nombre VARCHAR(255) NOT NULL,
nombre_cientifico VARCHAR(255),
categoria ENUM('hortalizas', 'hierbas', 'flores', 'frutas') NOT NULL,
descripcion TEXT NOT NULL,
dificultad ENUM('facil', 'media', 'dificil') NOT NULL,
tiempo_cosecha VARCHAR(100),
riego VARCHAR(100),
luz_solar VARCHAR(100) DEFAULT 'pleno',
tiempo_crecimiento VARCHAR(100) DEFAULT '',
temporada VARCHAR(100) DEFAULT 'primavera',
beneficios TEXT,
cuidados TEXT,
imagen_url VARCHAR(500),
fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
INDEX idx_categoria (categoria),
INDEX idx_dificultad (dificultad),
INDEX idx_fecha (fecha_creacion)
);

ALTER TABLE plantas
ADD COLUMN luz_solar VARCHAR(100) DEFAULT 'pleno' AFTER riego,
ADD COLUMN tiempo_crecimiento VARCHAR(100) DEFAULT '' AFTER luz_solar,
ADD COLUMN temporada VARCHAR(100) DEFAULT 'primavera' AFTER tiempo_crecimiento;

