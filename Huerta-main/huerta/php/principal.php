<?php
session_start();

if (!isset($_SESSION['current_user_id'])) {
    header('Location: ../login-register.html');
    exit;
}

$firstName = explode(' ', $_SESSION['current_user_name'])[0];
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="../img/planta.png">
    <title>Huerta Escolar</title>
    <link rel="stylesheet" href="../css/principal.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.19/bundled/lenis.min.js"></script>
</head>
<body>
    <!-- Pantalla de carga -->
    <div id="loading-screen">
        <div class="loading-content">
            <div class="plant-animation">
                <div class="seed"></div>
                <div class="stem"></div>
                <div class="leaves">
                    <div class="leaf leaf-1"></div>
                    <div class="leaf leaf-2"></div>
                </div>
            </div>
            <h2>Cargando huerta...</h2>
            <div class="loading-bar">
                <div class="loading-progress"></div>
            </div>
            <div class="loading-percentage">0%</div>
        </div>
    </div>

    <!-- Contenido principal -->
    <div id="main-content" style="display:none;">
        <!-- Navbar -->
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-brand">
                    <h1>Huerta Escolar</h1>
                </div>
                <div class="nav-links">
                    <a href="logout.php" class="btn btn-outline ripple-btn">
                        <span>Cerrar sesión</span>
                        <div class="ripple"></div>
                    </a>
                    <a href="galeria.php" class="btn btn-primary ripple-btn">
                        <span>Galería</span>
                        <div class="ripple"></div>
                    </a>
                </div>
                <div class="mobile-menu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>

        <!-- Hero con Carrusel de Fondo -->
        <section class="hero">
            <!-- Carrusel de fondo -->
            <div class="hero-carousel">
                <div class="hero-slide active">
                    <img src="../img/IMG_20250901_113332.jpg" alt="Huerta 1">
                </div>
                <div class="hero-slide">
                    <img src="../img/IMG_20250922_063910.jpg" alt="Huerta 2">
                </div>
                <div class="hero-slide">
                    <img src="../img/IMG_20250922_064607.jpg" alt="Huerta 3">
                </div>
            </div>

            <!-- Overlay oscuro -->
            <div class="hero-overlay"></div>

            <!-- Contenido del Hero -->
            <div class="hero-content">
                <h1 class="hero-title">
                    Bienvenid@ <span id="user-name"><?php echo htmlspecialchars($firstName); ?></span> a <span class="hero-subtitle">La Huerta Escolar</span>
                </h1>
                <p class="hero-description">
                    Un espacio para aprender, sembrar, cuidar y cosechar juntos.
                </p>
                <div class="hero-buttons">
                    <a href="galeria.php" class="btn btn-primary btn-lg magnetic-btn ripple-btn">
                        <span>Ver Galería</span>
                        <div class="ripple"></div>
                    </a>
                </div>
            </div>

            <!-- Indicadores del carrusel -->
            <!-- div class="hero-carousel-indicators"></div> -->

            <div class="scroll-indicator">
                <div class="scroll-arrow"></div>
            </div>
        </section>

        <!-- Beneficios -->
        <section id="benefits" class="benefits">
            <div class="section-header">
                <h2 class="section-title">Beneficios de la Huerta</h2>
                <p class="section-description">Descubre todo lo que ganamos al cultivar juntos en nuestra huerta escolar</p>
            </div>
            <div class="benefits-grid">
                <div class="benefit-card tilt-card">
                    <img src="../img/IMG-20251020-WA0076.jpg" alt="Aprendizaje práctico" class="benefit-image">
                    <h3>Aprendizaje Práctico</h3>
                    <p>Conoce el ciclo completo de las plantas desde la semilla hasta la cosecha, experimentando cada etapa del proceso.</p>
                    <div class="card-glow"></div>
                </div>
                <div class="benefit-card tilt-card">
                    <img src="../img/IMG-20251020-WA0078.jpg" alt="Trabajo en equipo" class="benefit-image">
                    <h3>Trabajo en Equipo</h3>
                    <p>Fortalece la colaboración entre estudiantes y docentes mientras trabajamos juntos por un objetivo común.</p>
                    <div class="card-glow"></div>
                </div>
                <div class="benefit-card tilt-card">
                    <img src="../img/IMG_20250922_064044.jpg" alt="Sostenibilidad" class="benefit-image">
                    <h3>Sostenibilidad</h3>
                    <p>Promueve el cuidado del medio ambiente y desarrolla hábitos saludables para toda la vida.</p>
                    <div class="card-glow"></div>
                </div>
            </div>
        </section>

        <!-- Actividades -->
       <section id="activities" class="activities">
            <div class="section-header">
                <h2 class="section-title">Actividades de la Huerta</h2>
                <p class="section-description">Descubre las actividades que realizamos día a día en nuestra huerta</p>
            </div>

            <div class="activities-grid">
                <!-- Tarjeta 1 -->
                <div class="activity-card interactive-card" data-activity="siembra">
                <span class="activity-badge badge-primary pulse-badge">Nuevo</span>
                <h3>Siembra</h3>
                <p>Aprende las técnicas correctas para sembrar distintas plantas y hortalizas según la temporada.</p>
                <div class="card-overlay"></div>
                </div>

                <!-- Tarjeta 2 -->
                <div class="activity-card interactive-card" data-activity="riego">
                <span class="activity-badge badge-secondary pulse-badge">Popular</span>
                <h3>Riego y Cuidado</h3>
                <p>Mantén la huerta viva y saludable con el cuidado diario y la dedicación de toda la comunidad.</p>
                <div class="card-overlay"></div>
                </div>
            </div>
        </section>


        <!-- Testimonios -->
        <section id="testimonials" class="testimonials">
            <div class="section-header">
                <h2 class="section-title">Experiencias</h2>
                <p class="section-description">Lo que opinan nuestros estudiantes</p>
            </div>
            <div class="testimonials-grid">
                <div class="testimonial-card">
                    <p>"Gracias a la huerta aprendí cómo cultivar mis propios alimentos."</p>
                    <div class="testimonial-author">
                        <div class="author-avatar">M</div>
                        <div class="author-info">
                            <h4>María González</h4>
                            <span>Estudiante</span>
                        </div>
                    </div>
                </div>
                <div class="testimonial-card">
                    <p>"Es un proyecto que conecta a los niños con la naturaleza."</p>
                    <div class="testimonial-author">
                        <div class="author-avatar">J</div>
                        <div class="author-info">
                            <h4>Juan Pérez</h4>
                            <span>Docente</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="see-comments-link">
                <a href="comentarios.php" class="modern-link">
                    💬 Ver lo que dicen los demás
                </a>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Sobre la Huerta</h3>
                    <p>La huerta escolar es un proyecto educativo que impulsa la conciencia ambiental, el trabajo en equipo y el compromiso con un futuro sostenible para todos.</p>
                </div>

                <div class="footer-section">
                    <h4>Navegación</h4>
                    <ul>
                        <li><a href="#benefits">Galería</a></li>
                        <li><a href="#activities">Actividades</a></li>
                        <li><a href="#testimonials">Experiencias</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4>Contacto</h4>
                    <ul>
                        <li><a href="mailto:info@huertaescolar.com">info@huertaescolar.com</a></li>
                        <li><a href="tel:+573001234567">+57 300 123 4567</a></li>
                    </ul>
                    <p>Esta huerta escolar pertenece a la <strong>Institución Educativa El Bosque</strong>, comprometida con la sostenibilidad y el aprendizaje ambiental.</p>
                </div>

                <div class="footer-section creators">
                    <h4>Creadores</h4>
                    <ul>
                        <li>Yhojannes Uran</li>
                        <li>Jhonatan Reynel</li>
                        <li>Juan David Zabala</li>
                        <li>Brayan Arley Gaviria</li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; 2025 Huerta Escolar. Todos los derechos reservados. Cultivando el futuro juntos.</p>
            </div>
        </footer>
    </div>

    <!-- Modal para actividades -->
    <div class="modal-overlay" id="activityModal">
        <div class="modal-container">
            <button class="modal-close" id="closeModal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            
            <div class="modal-content">
                <div class="modal-badge" id="modalBadge"></div>
                <h2 class="modal-title" id="modalTitle"></h2>
                <div class="modal-image-container">
                    <img src="" alt="" id="modalImage" class="modal-image">
                </div>
                <div class="modal-description" id="modalDescription"></div>
                
                <div class="modal-details">
                    <div class="detail-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span id="modalDuration"></span>
                    </div>
                    <div class="detail-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span id="modalParticipants"></span>
                    </div>
                    <div class="detail-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span id="modalDifficulty"></span>
                    </div>
                </div>
                
                <div class="modal-steps">
                    <h3>Pasos a seguir:</h3>
                    <ol id="modalSteps"></ol>
                </div>
            </div>
        </div>
    </div>

    <!-- Scroll progress indicator -->
    <div class="scroll-progress">
        <div class="scroll-progress-bar"></div>
    </div>

    <!-- Floating action button -->
    <div class="floating-btn" id="scrollToTop">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 14L12 9L17 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </div>

    <script type="module" src="../js/principal.js"></script>
</body>
</html>