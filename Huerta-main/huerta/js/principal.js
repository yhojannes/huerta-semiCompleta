
// Registrar plugin de ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Inicializar Lenis (scroll suave)
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: "vertical",
  gestureDirection: "vertical",
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

// Animación continua del scroll
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Pantalla de carga animada
window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("loading-screen");
  const mainContent = document.getElementById("main-content");
  const loadingProgress = document.querySelector(".loading-progress");
  const loadingPercentage = document.querySelector(".loading-percentage");

  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 100) progress = 100;
    loadingPercentage.textContent = Math.floor(progress) + "%";
    if (progress >= 100) clearInterval(progressInterval);
  }, 100);

  gsap.fromTo(loadingProgress, { width: "0%" }, { width: "100%", duration: 3, ease: "power1.inOut" });
  gsap.to(".stem", { height: 60, duration: 2, ease: "back.out(1.7)" });
  gsap.to(".leaf-1", { opacity: 1, rotation: -45, duration: 1, delay: 1.5, ease: "back.out(1.7)" });
  gsap.to(".leaf-2", { opacity: 1, rotation: 45, duration: 1, delay: 2, ease: "back.out(1.7)" });
  gsap.to(".loading-content h2", { opacity: 1, y: 0, duration: 1, delay: 0.5 });
  gsap.to(".loading-percentage", { opacity: 1, y: 0, duration: 1, delay: 0.8 });

  setTimeout(() => {
    gsap.to(loadingScreen, {
      opacity: 0,
      scale: 0.8,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        loadingScreen.style.display = "none";
        mainContent.style.display = "block";
        mainContent.style.opacity = "1";

        initMainAnimations();
        new HeroCarousel();
        new ActivityModal();
      },
    });
  }, 3000);
});

// Animaciones principales
function initMainAnimations() {
  const heroTl = gsap.timeline();
  heroTl
    .fromTo(".hero-title", { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
    .fromTo(".hero-description", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5")
    .fromTo(".hero-buttons .btn", { opacity: 0, y: 30, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.2, ease: "back.out(1.7)" }, "-=0.3")
    .fromTo(".scroll-indicator", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");

  if (document.querySelector(".hero-carousel")) {
    gsap.fromTo(".hero-carousel", { opacity: 0, scale: 0.8, rotationX: 15 }, {
      opacity: 1,
      scale: 1,
      rotationX: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".hero",
        start: "top 80%",
      },
    });
  }

  gsap.fromTo(".benefits .benefit-card", { opacity: 0, y: 60, rotationX: -15 }, {
    opacity: 1,
    y: 0,
    rotationX: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".benefits",
      start: "top 80%",
    },
  });

  gsap.fromTo(".activity-card", { opacity: 0, scale: 0.5, rotation: -10 }, {
    opacity: 1,
    scale: 1,
    rotation: 0,
    duration: 0.7,
    stagger: 0.15,
    ease: "back.out(1.7)",
    scrollTrigger: {
      trigger: ".activities",
      start: "top 80%",
    },
  });

  gsap.fromTo(".testimonial-card", { opacity: 0, x: -100, rotationY: -15 }, {
    opacity: 1,
    x: 0,
    rotationY: 0,
    duration: 0.8,
    stagger: 0.3,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".testimonials",
      start: "top 80%",
    },
  });
}

// Carrusel del Hero (fondo animado)
class HeroCarousel {
  constructor() {
    this.slides = document.querySelectorAll(".hero-slide");
    this.currentIndex = 0;
    this.interval = null;
    this.delay = 5000;
    this.transition = 1;

    // Verifica si hay slides antes de iniciar
    if (this.slides.length > 0) {
      this.init();
    }
  }

  init() {
    // Mostrar solo la primera imagen
    this.slides.forEach((s, i) => {
      s.style.opacity = i === 0 ? "1" : "0";
    });

    // Iniciar el autoplay
    this.startAutoplay();
  }

  goToSlide(index) {
    if (index === this.currentIndex) return;

    const currentSlide = this.slides[this.currentIndex];
    const nextSlide = this.slides[index];

    gsap.to(currentSlide, { opacity: 0, duration: this.transition, ease: "power2.inOut" });
    gsap.to(nextSlide, { opacity: 1, duration: this.transition, ease: "power2.inOut" });

    this.currentIndex = index;
  }

  nextSlide() {
    const next = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(next);
  }

  startAutoplay() {
    this.stopAutoplay();
    this.interval = setInterval(() => this.nextSlide(), this.delay);
  }

  stopAutoplay() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  resetAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }
}


// 🆕 DATOS DE ACTIVIDADES CON INFORMACIÓN DETALLADA
const activitiesData = {
  siembra: {
    title: "Siembra",
    badge: "Nuevo",
    badgeClass: "badge-primary",
    image: "../img/IMG_20250901_113332.jpg",
    description: "La siembra es el primer paso fundamental en el cultivo. Aprende las técnicas correctas para sembrar distintas plantas y hortalizas según la temporada, garantizando un crecimiento saludable desde el inicio.",
    duration: "2-3 horas",
    participants: "10-15 estudiantes",
    difficulty: "Principiante",
    steps: [
      "Preparar el terreno removiendo la tierra y eliminando maleza",
      "Hacer surcos o hoyos según el tipo de planta a sembrar",
      "Colocar las semillas a la profundidad adecuada (2-3 veces su tamaño)",
      "Cubrir con tierra suavemente sin compactar en exceso",
      "Regar abundantemente pero sin encharcar",
      "Marcar la zona sembrada con etiquetas identificativas",
      "Realizar seguimiento diario de la germinación",
    ],
  },
  riego: {
    title: "Riego y Cuidado",
    badge: "Popular",
    badgeClass: "badge-secondary",
    image: "../img/IMG_20250922_063910.jpg",
    description: "El riego y cuidado constante son esenciales para mantener la huerta viva y productiva. Aprende a identificar las necesidades hídricas de cada planta y las mejores prácticas de mantenimiento diario.",
    duration: "30-45 min diarios",
    participants: "5-8 estudiantes",
    difficulty: "Fácil",
    steps: [
      "Revisar la humedad del suelo antes de regar (insertar dedo 5cm)",
      "Regar en las primeras horas de la mañana o al atardecer",
      "Aplicar agua directamente a la base de las plantas",
      "Evitar mojar las hojas para prevenir enfermedades",
      "Eliminar malezas que compitan por nutrientes",
      "Revisar plagas y enfermedades en hojas y tallos",
      "Aplicar compost o abono orgánico mensualmente",
    ],
  },
};

// 🆕 MODAL DE ACTIVIDADES
class ActivityModal {
  constructor() {
    this.modal = document.getElementById("activityModal");
    this.closeBtn = document.getElementById("closeModal");
    this.init();
  }

  init() {
    if (this.closeBtn) this.closeBtn.addEventListener("click", () => this.close());

    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) this.close();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.classList.contains("active")) this.close();
    });

    this.attachCardListeners();
  }

  attachCardListeners() {
    // Esperar un momento para asegurar que las tarjetas existan
    setTimeout(() => {
      const cards = document.querySelectorAll(".activity-card");
      cards.forEach((card, index) => {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
          const activityKey = index === 0 ? "siembra" : "riego";
          this.open(activityKey);
        });
      });
    }, 100);
  }

  open(activityKey) {
    const activity = activitiesData[activityKey];
    if (!activity || !this.modal) return;

    // Actualizar contenido del modal
    const modalTitle = document.getElementById("modalTitle");
    const modalBadge = document.getElementById("modalBadge");
    const modalImage = document.getElementById("modalImage");
    const modalDescription = document.getElementById("modalDescription");
    const modalDuration = document.getElementById("modalDuration");
    const modalParticipants = document.getElementById("modalParticipants");
    const modalDifficulty = document.getElementById("modalDifficulty");
    const stepsList = document.getElementById("modalSteps");

    if (modalTitle) modalTitle.textContent = activity.title;
    if (modalBadge) {
      modalBadge.textContent = activity.badge;
      modalBadge.className = `modal-badge ${activity.badgeClass}`;
    }
    if (modalImage) modalImage.src = activity.image;
    if (modalDescription) modalDescription.textContent = activity.description;
    if (modalDuration) modalDuration.textContent = activity.duration;
    if (modalParticipants) modalParticipants.textContent = activity.participants;
    if (modalDifficulty) modalDifficulty.textContent = activity.difficulty;

    if (stepsList) {
      stepsList.innerHTML = "";
      activity.steps.forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step;
        stepsList.appendChild(li);
      });
    }

    // 🔥 Detener el scroll suave de Lenis en el fondo
    lenis.stop();
    
    // 🔥 Bloquear el scroll del body
    document.body.style.overflow = 'hidden';
    
    this.modal.classList.add("active");
    this.modal.style.zIndex = "99999";
    
    // 🔥 Scroll al inicio del modal
    const modalContainer = document.querySelector('.modal-container');
    if (modalContainer) {
      modalContainer.scrollTop = 0;
    }

    gsap.fromTo(".modal-container", 
      { opacity: 0, scale: 0.8, y: 50 }, 
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
    );
  }

  close() {
    gsap.to(".modal-container", {
      opacity: 0,
      scale: 0.8,
      y: 50,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        this.modal.classList.remove("active");
        // 🔥 Restaurar scroll de la página
        document.body.style.overflow = '';
        // 🔥 Reactivar Lenis
        lenis.start();
      },
    });
  }
}

// Scroll suave en enlaces internos
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      lenis.scrollTo(target, { offset: -80, duration: 1.5 });
    }
  });
});

// Navbar dinámica
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  const hero = document.querySelector(".hero");
  const heroHeight = hero ? hero.offsetHeight : 0;
  const scrolled = window.scrollY > heroHeight - 100;

  navbar.classList.toggle("visible", scrolled);
  navbar.classList.toggle("scrolled", window.scrollY > heroHeight);
});

// Barra de progreso del scroll
window.addEventListener("scroll", () => {
  const scrollProgress = document.querySelector(".scroll-progress-bar");
  const scrollTop = window.pageYOffset;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;

  scrollProgress.style.width = scrollPercent + "%";
});

// Botón flotante "volver arriba"
const floatingBtn = document.getElementById("scrollToTop");
window.addEventListener("scroll", () => {
  floatingBtn.classList.toggle("visible", window.scrollY > 300);
});
floatingBtn.addEventListener("click", () => {
  lenis.scrollTo(0, { duration: 2 });
});

// Efecto ripple (onda al clic)
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = button.querySelector(".ripple");

  if (!ripple) return;

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = x + "px";
  ripple.style.top = y + "px";
  ripple.style.transform = "scale(0)";
  ripple.style.opacity = "1";

  requestAnimationFrame(() => {
    ripple.style.transform = "scale(4)";
    ripple.style.opacity = "0";
  });
}

document.querySelectorAll(".ripple-btn").forEach((button) => {
  button.addEventListener("click", createRipple);
});

// Botones magnéticos
document.querySelectorAll(".magnetic-btn").forEach((button) => {
  button.addEventListener("mousemove", function (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gsap.to(this, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
  });

  button.addEventListener("mouseleave", function () {
    gsap.to(this, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  });
});

// Efecto tilt en tarjetas
document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("mousemove", function (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(this, { rotationX: rotateX, rotationY: rotateY, transformPerspective: 1000, duration: 0.3, ease: "power2.out" });
  });

  card.addEventListener("mouseleave", function () {
    gsap.to(this, { rotationX: 0, rotationY: 0, duration: 0.5, ease: "power2.out" });
  });
});

// Menú móvil
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    mobileMenuToggle.classList.toggle("active");
  });
}

// Scroll indicator
document.querySelector(".scroll-indicator")?.addEventListener("click", () => {
  lenis.scrollTo("#benefits", { offset: -80, duration: 1.5 });
});

// Intersection Observer para aparición de elementos
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
    }
  });
}, observerOptions);

document.querySelectorAll(".benefit-card, .activity-card, .testimonial-card").forEach((el) => {
  observer.observe(el);
});