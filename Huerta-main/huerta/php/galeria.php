<?php
session_start();

if (!isset($_SESSION['current_user_id'])) {
    header('Location: ../login-register.html');
    exit;
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Plantas</title>
    <link rel="icon" type="image/png" href="../img/planta.png">
    <link rel="stylesheet" href="../css/galeria.css">
</head>
<body>

    <!-- Header -->
    <nav class="navbar visible" id="navbar">
        <div class="nav-container">
            <div class="nav-brand">
                <h1>Huerta Escolar</h1>
            </div>
            <div class="nav-links" id="navLinks">
                <a href="logout.php" class="btn btn-outline ripple-btn">
                    <span>Cerrar sesión</span>
                    <div class="ripple"></div>
                </a>
                <button onclick="openAddModal()" class="btn btn-primary ripple-btn">
                    Agregar Planta
                </button>
            </div>
            <div class="mobile-menu-toggle" id="mobileMenuToggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" id="home">
        <video class="hero-video" autoplay muted loop playsinline>
            <source src="../videos/VID-20251026-WA0037.mp4" type="video/mp4">
            Tu navegador no soporta videos HTML5.
        </video>

        <div class="hero-overlay"></div>

        <div class="hero-content">
            <h1 class="hero-title">
                Descubre el Mundo
                <span class="hero-subtitle">de las Plantas</span>
            <div class="hero-buttons">
                <button onclick="scrollToGallery()" class="btn btn-primary btn-lg ripple-btn">
                    Explorar Galería
                </button>
                <button onclick="openAddModal()" class="btn btn-outline btn-lg ripple-btn">
                    Agregar Planta
                </button>
            </div>
        </div>
    </section>

    <!-- Search Section -->
    <section class="search-section" id="gallery">
        <div class="container">
            <div class="search-container">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="#6b7280" stroke-width="2"/>
                    <path d="M14 14L18 18" stroke="#6b7280" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Buscar plantas por nombre o nombre científico..."
                    class="search-input"
                >
            </div>
        </div>
    </section>

    <!-- Plants Gallery -->
    <section class="gallery-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Nuestra Colección</h2>
                <p class="section-description">
                    Explora <span id="plantCountText" class="plant-count-highlight">0 plantas</span> perfectas para cultivar
                </p>
            </div>
            <div id="plantsGrid" class="plants-grid">
                <!-- Plants will be loaded here via JavaScript -->
            </div>
            <div id="emptyState" class="empty-state" style="display: none;">
                <div class="empty-icon">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="38" fill="#dcfce7"/>
                        <path d="M40 20 C 30 30, 30 40, 40 50 C 50 40, 50 30, 40 20" fill="#22c55e"/>
                        <circle cx="40" cy="56" r="6" fill="#16a34a"/>
                    </svg>
                </div>
                <h3>No hay plantas aún</h3>
                <p>Comienza agregando tu primera planta a la galería</p>
                <button onclick="openAddModal()" class="btn btn-primary btn-lg">
                    Agregar Planta
                </button>
            </div>
        </div>
    </section>

    <!-- Add/Edit Modal -->
    <div id="addModal" class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h2 id="modalTitle">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M16 8 C 12 12, 12 16, 16 20 C 20 16, 20 12, 16 8" fill="white"/>
                        <circle cx="16" cy="22" r="2" fill="white"/>
                    </svg>
                    Nueva Planta
                </h2>
                <button onclick="closeAddModal()" class="modal-close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>

            <div class="modal-content">
                <!-- API Search Section -->
                <div class="api-search-section">
                    <h3>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="9" cy="9" r="7" stroke="#22c55e" stroke-width="2"/>
                            <path d="M14 14L18 18" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Buscar en Base de Datos de Plantas
                    </h3>
                    <div class="api-search-controls">
                        <input 
                            type="text" 
                            id="apiSearchInput" 
                            placeholder="Ej: tomate, lechuga, zanahoria..."
                            class="api-search-input"
                        >
                        <button onclick="searchPlantAPI()" class="btn btn-primary" id="apiSearchBtn">
                            Buscar
                        </button>
                    </div>
                    <div id="apiResults" class="api-results"></div>
                </div>

                <!-- Form -->
                <form id="plantForm" onsubmit="handleSubmit(event)">
                    <input type="hidden" id="plantId">
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Nombre Común *</label>
                            <input type="text" id="plantName" required placeholder="Ej: Tomate" autocomplete="off">
                        </div>

                        <div class="form-group">
                            <label>Nombre Científico *</label>
                            <input type="text" id="scientificName" required placeholder="Ej: Solanum lycopersicum" autocomplete="off">
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Categoría *</label>
                            <select id="plantCategory" required>
                                <option value="hortalizas">Hortalizas</option>
                                <option value="hierbas">Hierbas Aromáticas</option>
                                <option value="flores">Flores</option>
                                <option value="frutas">Frutas</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>URL de Imagen *</label>
                            <input type="url" id="plantImage" required placeholder="https://ejemplo.com/imagen.jpg" autocomplete="off">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Descripción *</label>
                        <textarea id="plantDescription" required rows="3" placeholder="Describe la planta..."></textarea>
                    </div>

                    <div class="form-grid-4">
                        <div class="form-group">
                            <label>Riego</label>
                            <select id="waterNeeds">
                                <option value="baja">Bajo</option>
                                <option value="media" selected>Medio</option>
                                <option value="alta">Alto</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Luz Solar</label>
                            <select id="sunlight">
                                <option value="pleno" selected>Pleno Sol</option>
                                <option value="parcial">Sol Parcial</option>
                                <option value="sombra">Sombra</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Temporada</label>
                            <select id="season">
                                <option value="primavera" selected>Primavera</option>
                                <option value="verano">Verano</option>
                                <option value="otoño">Otoño</option>
                                <option value="invierno">Invierno</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Dificultad</label>
                            <select id="difficulty">
                                <option value="facil" selected>Fácil</option>
                                <option value="media">Media</option>
                                <option value="dificil">Difícil</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Tiempo de Crecimiento</label>
                        <input type="text" id="growthTime" placeholder="Ej: 60-80 días" autocomplete="off">
                    </div>

                    <div class="form-group">
                        <label>Beneficios</label>
                        <textarea id="benefits" rows="2" placeholder="Beneficios de cultivar esta planta..."></textarea>
                    </div>

                    <div class="form-group">
                        <label>Cuidados</label>
                        <textarea id="care" rows="2" placeholder="Consejos de cuidado..."></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-lg btn-submit">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M16 5L7.5 13.5L4 10" stroke="white" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            <span id="submitText">Agregar Planta</span>
                        </button>
                        <button type="button" onclick="closeAddModal()" class="btn btn-outline btn-lg">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Detail Modal -->
    <div id="detailModal" class="modal-overlay">
        <div class="modal-container detail-modal">
            <div class="detail-image-container">
                <img id="detailImage" src="" alt="">
                <div class="detail-overlay"></div>
                <button onclick="closeDetailModal()" class="modal-close detail-close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <div class="detail-header">
                    <span id="detailDifficulty" class="detail-badge"></span>
                    <h2 id="detailName"></h2>
                    <p id="detailScientific"></p>
                </div>
            </div>

            <div class="modal-content">
                <div class="detail-description">
                    <h3>Descripción</h3>
                    <p id="detailDescriptionText"></p>
                </div>

                <div class="detail-stats">
                    <div class="stat-card stat-water">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <path d="M14 4C14 4 8 12 8 17C8 20.31 10.69 23 14 23C17.31 23 20 20.31 20 17C20 12 14 4 14 4Z" fill="#3b82f6"/>
                        </svg>
                        <p class="stat-label">Riego</p>
                        <p id="detailWater" class="stat-value"></p>
                    </div>
                    <div class="stat-card stat-sun">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="5" fill="#f59e0b"/>
                            <path d="M14 2V6M14 22V26M26 14H22M6 14H2M22.36 5.64L19.78 8.22M8.22 19.78L5.64 22.36M22.36 22.36L19.78 19.78M8.22 8.22L5.64 5.64" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <p class="stat-label">Luz</p>
                        <p id="detailSun" class="stat-value"></p>
                    </div>
                    <div class="stat-card stat-season">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <rect x="5" y="7" width="18" height="16" rx="2" stroke="#8b5cf6" stroke-width="2"/>
                            <path d="M19 4V7M9 4V7M5 11H23" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <p class="stat-label">Temporada</p>
                        <p id="detailSeason" class="stat-value"></p>
                    </div>
                    <div class="stat-card stat-growth">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <path d="M14 8C11 11 11 14 14 17C17 14 17 11 14 8Z" fill="#22c55e"/>
                            <circle cx="14" cy="20" r="2" fill="#16a34a"/>
                        </svg>
                        <p class="stat-label">Crecimiento</p>
                        <p id="detailGrowth" class="stat-value"></p>
                    </div>
                </div>

                <div id="detailBenefitsSection" class="detail-section benefits-section">
                    <h3>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M16 6L7.5 14.5L4 11" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Beneficios
                    </h3>
                    <p id="detailBenefits"></p>
                </div>

                <div id="detailCareSection" class="detail-section care-section">
                    <h3>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="8" stroke="#3b82f6" stroke-width="2"/>
                            <path d="M10 6V10L13 13" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Cuidados
                    </h3>
                    <p id="detailCare"></p>
                </div>

                <div class="detail-actions">
                    <button onclick="editCurrentPlant()" class="btn btn-primary btn-lg">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M14 2L18 6L8 16H4V12L14 2Z" stroke="white" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Editar
                    </button>
                    <button onclick="deleteCurrentPlant()" class="btn btn-danger btn-lg">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M3 5H17M7 5V3H13V5M8 9V15M12 9V15M5 5L6 17H14L15 5" stroke="white" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="scroll-progress">
        <div class="scroll-progress-bar" id="scrollProgress"></div>
    </div>

    <button class="floating-btn" id="floatingBtn" onclick="scrollToTop()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 22V12H15V22" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </button>

    <script src="../js/galeria.js"></script>
</body>
</html>