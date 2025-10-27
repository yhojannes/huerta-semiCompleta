// Variables globales
let plants = [];
let currentPlant = null;
let isEditing = false;

// API Base URL - Nombre correcto del archivo
const API_BASE = 'api-galeria.php';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Cargar plantas desde la base de datos
    await loadPlants();

    // Event listeners
    setupEventListeners();

    // Scroll effects
    setupScrollEffects();
}

// Setup Event Listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterPlants(e.target.value);
    });

    // API Search
    document.getElementById('apiSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchPlantAPI();
        }
    });

    // Mobile menu
    document.getElementById('mobileMenuToggle').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('active');
    });

    // Form ripple effect
    document.querySelectorAll('.ripple-btn').forEach(btn => {
        btn.addEventListener('click', createRipple);
    });
}

// Cargar plantas desde la base de datos
async function loadPlants() {
    try {
        console.log('🔄 Cargando plantas desde:', `${API_BASE}?action=all`);
        const response = await fetch(`${API_BASE}?action=all`);
        console.log('📡 Respuesta recibida:', response.status);
        const result = await response.json();
        console.log('📦 Datos recibidos:', result);
        
        if (result.success) {
            plants = result.data;
            renderPlants();
            updatePlantCount();
        } else {
            console.error('Error al cargar plantas:', result.error);
            showNotification('Error al cargar las plantas', 'error');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        showNotification('Error de conexión con el servidor', 'error');
    }
}

// Renderizar plantas en la galería
function renderPlants(plantsToRender = plants) {
    const grid = document.getElementById('plantsGrid');
    const emptyState = document.getElementById('emptyState');

    if (plantsToRender.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    grid.innerHTML = '';

    plantsToRender.forEach(plant => {
        const card = createPlantCard(plant);
        grid.appendChild(card);
    });
}

// Crear card de planta
function createPlantCard(plant) {
    const card = document.createElement('div');
    card.className = 'plant-card';
    card.onclick = () => openDetailModal(plant);

    const waterIcons = getWaterIcons(plant.waterNeeds);
    const difficultyClass = `difficulty-${plant.difficulty}`;

    card.innerHTML = `
        <div class="plant-image-container">
            <img src="${plant.image}" alt="${plant.name}" class="plant-image" onerror="this.src='https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800'">
            <span class="plant-difficulty ${difficultyClass}">${plant.difficulty}</span>
        </div>
        <div class="plant-info">
            <h3 class="plant-name">${plant.name}</h3>
            <p class="plant-scientific">${plant.scientificName}</p>
            <p class="plant-description">${plant.description}</p>
            <div class="plant-stats">
                <div class="stat-item">
                    ${waterIcons}
                </div>
                <div class="stat-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="3" fill="#f59e0b"/>
                        <path d="M8 1V3M8 13V15M15 8H13M3 8H1" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    <span style="text-transform: capitalize">${plant.sunlight}</span>
                </div>
                <div class="stat-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="3" y="4" width="10" height="9" rx="1" stroke="#8b5cf6" stroke-width="1.5"/>
                        <path d="M11 2V4M5 2V4M3 6H13" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    <span style="text-transform: capitalize">${plant.season}</span>
                </div>
            </div>
        </div>
    `;

    return card;
}

// Obtener iconos de agua según necesidad
function getWaterIcons(waterNeeds) {
    const iconCount = waterNeeds === 'baja' ? 1 : waterNeeds === 'media' ? 2 : 3;
    let icons = '';
    for (let i = 0; i < iconCount; i++) {
        icons += `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C8 2 4 6 4 9C4 11.21 5.79 13 8 13C10.21 13 12 11.21 12 9C12 6 8 2 8 2Z" fill="#3b82f6"/>
            </svg>
        `;
    }
    return icons;
}

// Filtrar plantas
function filterPlants(searchTerm) {
    const filtered = plants.filter(plant =>
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderPlants(filtered);
}

// Actualizar contador de plantas
function updatePlantCount() {
    document.getElementById('plantCountText').textContent = plants.length + ' plantas';
}

// Abrir modal de agregar/editar
function openAddModal() {
    document.getElementById('addModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (!isEditing) {
        resetForm();
    }
}

// Cerrar modal de agregar/editar
function closeAddModal() {
    document.getElementById('addModal').classList.remove('active');
    document.body.style.overflow = '';
    resetForm();
}

// Resetear formulario
function resetForm() {
    document.getElementById('plantForm').reset();
    document.getElementById('plantId').value = '';
    document.getElementById('modalTitle').innerHTML = `
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 8 C 12 12, 12 16, 16 20 C 20 16, 20 12, 16 8" fill="white"/>
            <circle cx="16" cy="22" r="2" fill="white"/>
        </svg>
        Nueva Planta
    `;
    document.getElementById('submitText').textContent = 'Agregar Planta';
    document.getElementById('apiResults').innerHTML = '';
    document.getElementById('apiResults').classList.remove('active');
    isEditing = false;
    currentPlant = null;
}

// Buscar planta en API externa (Trefle o Perenual)
async function searchPlantAPI() {
    const searchInput = document.getElementById('apiSearchInput');
    const searchBtn = document.getElementById('apiSearchBtn');
    const resultsContainer = document.getElementById('apiResults');
    const query = searchInput.value.trim();

    if (!query) {
        showNotification('Por favor ingresa un término de búsqueda', 'warning');
        return;
    }

    searchBtn.textContent = 'Buscando...';
    searchBtn.disabled = true;

    try {
        // Usando Perenual API (gratuita con límites)
        // Alternativa: Puedes usar Trefle API
        const apiKey = 'sk-ccOQ673fc7b8a68117919'; // Regístrate en perenual.com para obtener tu API key
        const apiUrl = `https://perenual.com/api/species-list?key=${apiKey}&q=${encodeURIComponent(query)}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            displayAPIResults(data.data.slice(0, 5)); // Mostrar solo 5 resultados
        } else {
            resultsContainer.innerHTML = '<p style="padding: 16px; text-align: center; color: #6b7280;">No se encontraron resultados</p>';
            resultsContainer.classList.add('active');
        }
    } catch (error) {
        console.error('Error al buscar en API:', error);
        showNotification('Error al buscar plantas. Intenta nuevamente.', 'error');
        
        // Fallback: Usar búsqueda de Unsplash para imágenes
        searchPlantFallback(query);
    } finally {
        searchBtn.textContent = 'Buscar';
        searchBtn.disabled = false;
    }
}

// Búsqueda fallback usando solo datos básicos
function searchPlantFallback(query) {
    const resultsContainer = document.getElementById('apiResults');
    
    const mockResult = {
        name: query.charAt(0).toUpperCase() + query.slice(1),
        scientificName: `${query.charAt(0).toUpperCase() + query.slice(1)} spp.`,
        image: `https://source.unsplash.com/800x600/?${encodeURIComponent(query)},plant`,
        description: `Planta ${query} ideal para cultivo en huerta escolar. Requiere cuidados básicos y es una excelente opción educativa.`
    };
    
    displayAPIResults([mockResult]);
}

// Mostrar resultados de API
function displayAPIResults(results) {
    const resultsContainer = document.getElementById('apiResults');
    resultsContainer.innerHTML = '';
    resultsContainer.classList.add('active');

    results.forEach(result => {
        // Adaptar formato según la API
        const plantData = {
            name: result.common_name || result.name || 'Nombre desconocido',
            scientificName: result.scientific_name || result.scientificName || 'N/A',
            image: result.default_image?.medium_url || result.image || `https://source.unsplash.com/800x600/?${encodeURIComponent(result.common_name || 'plant')},plant`,
            description: result.description || `Planta ${result.common_name || result.name} para cultivo en huerta escolar.`
        };

        const resultItem = document.createElement('div');
        resultItem.className = 'api-result-item';
        resultItem.innerHTML = `
            <div class="api-result-info">
                <img src="${plantData.image}" alt="${plantData.name}" class="api-result-image" onerror="this.src='https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400'">
                <div>
                    <div class="api-result-name">${plantData.name}</div>
                    <div class="api-result-scientific">${plantData.scientificName}</div>
                </div>
            </div>
            <button onclick='useAPIResult(${JSON.stringify(plantData).replace(/'/g, "&#39;")})' class="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13 4L6 11L3 8" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Usar
            </button>
        `;
        resultsContainer.appendChild(resultItem);
    });
}

// Usar resultado de API
function useAPIResult(result) {
    document.getElementById('plantName').value = result.name;
    document.getElementById('scientificName').value = result.scientificName;
    document.getElementById('plantImage').value = result.image;
    document.getElementById('plantDescription').value = result.description;
    
    document.getElementById('apiResults').innerHTML = '';
    document.getElementById('apiResults').classList.remove('active');
    document.getElementById('apiSearchInput').value = '';
    
    showNotification('Datos de la planta cargados exitosamente', 'success');
}

// Manejar envío de formulario
async function handleSubmit(event) {
    event.preventDefault();

    const formData = {
        usuario_id: 1,
        nombre: document.getElementById('plantName').value,
        nombre_cientifico: document.getElementById('scientificName').value,
        descripcion: document.getElementById('plantDescription').value,
        riego: document.getElementById('waterNeeds').value,
        luz_solar: document.getElementById('sunlight').value,
        tiempo_crecimiento: document.getElementById('growthTime').value,
        temporada: document.getElementById('season').value,
        dificultad: document.getElementById('difficulty').value,
        imagen_url: document.getElementById('plantImage').value,
        beneficios: document.getElementById('benefits').value,
        cuidados: document.getElementById('care').value,
        categoria: 'hortalizas'
    };


    try {
        let response;
        
        if (isEditing) {
            // Actualizar planta existente
            const plantId = document.getElementById('plantId').value;
            response = await fetch(`${API_BASE}?action=update&id=${plantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        } else {
            // Crear nueva planta
            response = await fetch(`${API_BASE}?action=create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }

        const result = await response.json();

        if (result.success) {
            await loadPlants(); // Recargar plantas
            closeAddModal();
            showNotification(
                isEditing ? 'Planta actualizada exitosamente' : 'Planta agregada exitosamente',
                'success'
            );
        } else {
            showNotification('Error: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error al guardar planta:', error);
        showNotification('Error de conexión al guardar', 'error');
    }
}

// Abrir modal de detalles
function openDetailModal(plant) {
    currentPlant = plant;
    const modal = document.getElementById('detailModal');
    
    document.getElementById('detailImage').src = plant.image;
    document.getElementById('detailName').textContent = plant.name;
    document.getElementById('detailScientific').textContent = plant.scientificName;
    
    const difficultyBadge = document.getElementById('detailDifficulty');
    difficultyBadge.textContent = plant.difficulty;
    difficultyBadge.className = `detail-badge difficulty-${plant.difficulty}`;
    
    document.getElementById('detailDescriptionText').textContent = plant.description;
    document.getElementById('detailWater').textContent = plant.waterNeeds.charAt(0).toUpperCase() + plant.waterNeeds.slice(1);
    document.getElementById('detailSun').textContent = plant.sunlight.charAt(0).toUpperCase() + plant.sunlight.slice(1);
    document.getElementById('detailSeason').textContent = plant.season.charAt(0).toUpperCase() + plant.season.slice(1);
    document.getElementById('detailGrowth').textContent = plant.growthTime || 'Variable';
    
    // Mostrar/ocultar secciones opcionales
    const benefitsSection = document.getElementById('detailBenefitsSection');
    const careSection = document.getElementById('detailCareSection');
    
    if (plant.benefits) {
        benefitsSection.style.display = 'block';
        document.getElementById('detailBenefits').textContent = plant.benefits;
    } else {
        benefitsSection.style.display = 'none';
    }
    
    if (plant.care) {
        careSection.style.display = 'block';
        document.getElementById('detailCare').textContent = plant.care;
    } else {
        careSection.style.display = 'none';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal de detalles
function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
    document.body.style.overflow = '';
    currentPlant = null;
}

// Editar planta actual
function editCurrentPlant() {
    if (!currentPlant) return;
    
    isEditing = true;
    
    document.getElementById('plantId').value = currentPlant.id;
    document.getElementById('plantName').value = currentPlant.name;
    document.getElementById('scientificName').value = currentPlant.scientificName;
    if (document.getElementById('plantCategory')) {
        document.getElementById('plantCategory').value = currentPlant.category || 'hortalizas';
    }
    document.getElementById('plantDescription').value = currentPlant.description;
    document.getElementById('waterNeeds').value = currentPlant.waterNeeds;
    document.getElementById('sunlight').value = currentPlant.sunlight;
    document.getElementById('growthTime').value = currentPlant.growthTime;
    document.getElementById('season').value = currentPlant.season;
    document.getElementById('difficulty').value = currentPlant.difficulty;
    document.getElementById('plantImage').value = currentPlant.image;
    document.getElementById('benefits').value = currentPlant.benefits;
    document.getElementById('care').value = currentPlant.care;
    
    document.getElementById('modalTitle').innerHTML = `
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M24 4L28 8L12 24H8V20L24 4Z" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Editar Planta
    `;
    document.getElementById('submitText').textContent = 'Guardar Cambios';
    
    closeDetailModal();
    openAddModal();
}

// Eliminar planta actual
async function deleteCurrentPlant() {
    if (!currentPlant) return;
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta planta?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}?action=delete&id=${currentPlant.id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            await loadPlants();
            closeDetailModal();
            showNotification('Planta eliminada exitosamente', 'success');
        } else {
            showNotification('Error al eliminar: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error al eliminar planta:', error);
        showNotification('Error de conexión al eliminar', 'error');
    }
}

// Scroll effects
function setupScrollEffects() {
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        const scrollProgress = document.getElementById('scrollProgress');
        const floatingBtn = document.getElementById('floatingBtn');
        
        // Navbar scroll effect
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Scroll progress
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollProgress.style.width = scrolled + '%';
        
        // Floating button
        if (window.scrollY > 500) {
            floatingBtn.classList.add('visible');
        } else {
            floatingBtn.classList.remove('visible');
        }
    });
}

function scrollToTop() {
    window.location.href = 'principal.php';
}

// Scroll to gallery
function scrollToGallery() {
    document.getElementById('gallery').scrollIntoView({
        behavior: 'smooth'
    });
}

window.addEventListener("load", () => {
    const navbar = document.querySelector(".navbar");
    setTimeout(() => navbar.classList.add("visible"), 300);
});

// Create ripple effect
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    
    const bgColors = {
        success: 'linear-gradient(135deg, #22c55e, #16a34a)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${bgColors[type] || bgColors.success};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        animation: slideIn 0.3s ease;
        font-weight: 600;
        max-width: 400px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        if (document.getElementById('addModal').classList.contains('active')) {
            closeAddModal();
        }
        if (document.getElementById('detailModal').classList.contains('active')) {
            closeDetailModal();
        }
    }
});