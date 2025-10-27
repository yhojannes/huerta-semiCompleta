// Variables globales
let currentPanel = "login"
let isLoading = false
const gsap = window.gsap

// Inicialización cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  initializeAnimations()
  setupEventListeners()
  setupFormValidation()

  // Efectos hover en botones y enlaces
  const buttons = document.querySelectorAll(".submit-btn, .switch-link")
  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      gsap.to(this, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out",
      })
    })
    button.addEventListener("mouseleave", function () {
      gsap.to(this, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      })
    })
  })
})

// Animaciones GSAP iniciales
function initializeAnimations() {
  gsap.to(".shape-1", { rotation: 360, duration: 20, repeat: -1, ease: "none" })
  gsap.to(".shape-2", { rotation: -360, duration: 25, repeat: -1, ease: "none" })
  gsap.to(".shape-3", { y: "+=20", duration: 4, repeat: -1, yoyo: true, ease: "power2.inOut" })

  gsap.fromTo(
    ".auth-container",
    { scale: 0.9, opacity: 0, y: 50 },
    { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" },
  )
  gsap.fromTo(
    ".form-header",
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" },
  )
  gsap.fromTo(
    ".input-group",
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, duration: 0.5, delay: 0.5, stagger: 0.1, ease: "power2.out" },
  )
  gsap.fromTo(
    ".submit-btn",
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration: 0.5, delay: 0.8, ease: "back.out(1.7)" },
  )
}

// Event listeners
function setupEventListeners() {
  document.getElementById("loginForm").addEventListener("submit", handleLogin)
  document.getElementById("registerForm").addEventListener("submit", handleRegister)

  // Inputs para animaciones
  const inputs = document.querySelectorAll("input")
  inputs.forEach((input) => {
    input.addEventListener("focus", handleInputFocus)
    input.addEventListener("blur", handleInputBlur)
    input.addEventListener("input", handleInputChange)
  })

  // Validación de contraseña en tiempo real
  document.getElementById("registerPassword").addEventListener("input", updatePasswordStrength)
  document.getElementById("confirmPassword").addEventListener("blur", validatePasswordMatch)

  // Enlaces para cambiar panel
  document.querySelectorAll(".switch-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      if (this.textContent.includes("Regístrate")) {
        switchToRegister()
      } else {
        switchToLogin()
      }
    })
  })
}

// Validación de formularios
function setupFormValidation() {
  const forms = document.querySelectorAll(".auth-form")
  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input[required]")
    inputs.forEach((input) => {
      input.addEventListener("blur", validateInput)
    })
  })
}

// Animaciones de input
function handleInputFocus(e) {
  const inputGroup = e.target.closest(".input-group")
  gsap.to(inputGroup.querySelector(".input-line"), { scaleX: 1, duration: 0.3, ease: "power2.out" })
  gsap.to(inputGroup.querySelector("label"), { color: "#8b5cf6", duration: 0.3, ease: "power2.out" })
}
function handleInputBlur(e) {
  const inputGroup = e.target.closest(".input-group")
  if (!e.target.value) {
    gsap.to(inputGroup.querySelector(".input-line"), { scaleX: 0, duration: 0.3, ease: "power2.out" })
    gsap.to(inputGroup.querySelector("label"), { color: "#9ca3af", duration: 0.3, ease: "power2.out" })
  }
}
function handleInputChange(e) {
  const inputGroup = e.target.closest(".input-group")
  const label = inputGroup.querySelector("label")
  if (e.target.value) {
    gsap.to(label, { y: -12, scale: 0.85, color: "#8b5cf6", duration: 0.3, ease: "power2.out" })
  } else {
    gsap.to(label, { y: 0, scale: 1, color: "#9ca3af", duration: 0.3, ease: "power2.out" })
  }
}

// Cambiar panel
function switchToRegister() {
  if (currentPanel === "register" || isLoading) return
  currentPanel = "register"
  const loginPanel = document.getElementById("loginPanel")
  const registerPanel = document.getElementById("registerPanel")
  gsap.to(loginPanel, {
    opacity: 0,
    x: -50,
    duration: 0.4,
    ease: "power2.inOut",
    onComplete: () => {
      loginPanel.classList.remove("active")
      registerPanel.classList.add("active")
      gsap.fromTo(registerPanel, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.inOut" })
      gsap.fromTo(
        registerPanel.querySelectorAll(".input-group"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, delay: 0.2, ease: "power2.out" },
      )
    },
  })
}
function switchToLogin() {
  if (currentPanel === "login" || isLoading) return
  currentPanel = "login"
  const loginPanel = document.getElementById("loginPanel")
  const registerPanel = document.getElementById("registerPanel")
  gsap.to(registerPanel, {
    opacity: 0,
    x: 50,
    duration: 0.4,
    ease: "power2.inOut",
    onComplete: () => {
      registerPanel.classList.remove("active")
      loginPanel.classList.add("active")
      gsap.fromTo(loginPanel, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.inOut" })
      gsap.fromTo(
        loginPanel.querySelectorAll(".input-group"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, delay: 0.2, ease: "power2.out" },
      )
    },
  })
}

// Login
async function handleLogin(e) {
  e.preventDefault()
  if (isLoading) return
  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value
  if (!validateEmail(email)) {
    showNotification("Por favor ingresa un email válido", "error")
    return
  }
  if (password.length < 6) {
    showNotification("La contraseña debe tener al menos 6 caracteres", "error")
    return
  }
  setLoading(true, "loginForm")

  try {
    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)

    const response = await fetch("./php/login.php", {
      method: "POST",
      body: formData,
    })
    
    const text = await response.text()
    console.log("Respuesta del servidor:", text)

    let result
    try {
      result = JSON.parse(text)
    } catch (e) {
      showNotification("El servidor no devolvió JSON válido", "error")
      setLoading(false, "loginForm")
      return
    }

    if (result.status === "success") {
      showNotification("¡Inicio de sesión exitoso!", "success")
      gsap.to(".auth-container", { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.inOut" })

      if (result.usuario) {
        localStorage.setItem("user", JSON.stringify(result.usuario))
      }

      setTimeout(() => {
        window.location.href = "./php/principal.php"
      }, 1200)
    } else {
      showNotification(result.message, "error")
    }
  } catch (error) {
    console.error("Error en el fetch:", error)
    showNotification("Error al iniciar sesión. Verifica tus credenciales.", "error")
  } finally {
    setLoading(false, "loginForm")
  }
}

// Registro
async function handleRegister(e) {
  e.preventDefault()

  if (isLoading) return

  const firstName = document.getElementById("firstName").value
  const lastName = document.getElementById("lastName").value
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const acceptTerms = document.getElementById("acceptTerms") ? document.getElementById("acceptTerms").checked : true
  ;["firstName", "lastName", "registerEmail", "registerPassword", "confirmPassword"].forEach(clearFieldError)

  if (!firstName.trim() || !lastName.trim()) {
    showNotification("Por favor completa todos los campos", "error")
    return
  }
  if (!validateEmail(email)) {
    showNotification("Por favor ingresa un email válido", "error")
    return
  }
  if (password.length < 8) {
    showNotification("La contraseña debe tener al menos 8 caracteres", "error")
    return
  }
  if (password !== confirmPassword) {
    showNotification("Las contraseñas no coinciden", "error")
    return
  }
  if (!acceptTerms) {
    showNotification("Debes aceptar los términos y condiciones", "error")
    return
  }

  const form = document.getElementById("registerForm")
  const formData = new FormData(form)

  try {
    const response = await fetch("./php/registro.php", {
      method: "POST",
      body: formData,
    })

    // 🔎 Revisa si la respuesta es realmente JSON
    const text = await response.text()
    console.log("Respuesta del servidor:", text)

    let result
    try {
      result = JSON.parse(text) // intentar parsear JSON
    } catch (e) {
      showNotification("El servidor no devolvió JSON válido", "error")
      return
    }

    showNotification(result.message, result.status)

    if (result.status === "success") {
      form.reset()

      const strengthFill = document.querySelector(".strength-fill")
      const strengthText = document.querySelector(".strength-text")
      gsap.to(strengthFill, { width: "0%", duration: 0.3 })
      strengthText.textContent = ""

      const registerPanel = document.getElementById("registerPanel")
      const labels = registerPanel.querySelectorAll("label")
      labels.forEach((label) => {
        gsap.to(label, { y: 0, scale: 1, color: "#9ca3af", duration: 0.3 })
      })

      const inputLines = registerPanel.querySelectorAll(".input-line")
      inputLines.forEach((line) => {
        gsap.to(line, { scaleX: 0, duration: 0.3 })
      })

      setTimeout(() => {
        switchToLogin()
      }, 1000)
    }
  } catch (error) {
    console.error("Error en el fetch:", error)
    showNotification("Error al crear la cuenta", "error")
  }
}

// Estado de carga
function setLoading(loading, formId) {
  isLoading = loading
  const form = document.getElementById(formId)
  const submitBtn = form.querySelector(".submit-btn")
  if (loading) {
    submitBtn.classList.add("loading")
    submitBtn.disabled = true
    gsap.to(submitBtn.querySelector(".btn-loader"), { rotation: 360, duration: 1, repeat: -1, ease: "none" })
  } else {
    submitBtn.classList.remove("loading")
    submitBtn.disabled = false
    gsap.killTweensOf(submitBtn.querySelector(".btn-loader"))
  }
}

function showFieldError(inputId, message) {
  const inputGroup = document.getElementById(inputId).closest(".input-group")
  const errorDiv = inputGroup.querySelector(".input-error-message")
  inputGroup.classList.add("input-error")
  errorDiv.textContent = message
}

function clearFieldError(inputId) {
  const inputGroup = document.getElementById(inputId).closest(".input-group")
  const errorDiv = inputGroup.querySelector(".input-error-message")
  inputGroup.classList.remove("input-error")
  errorDiv.textContent = ""
}

// Fortaleza de contraseña
function updatePasswordStrength() {
  const password = document.getElementById("registerPassword").value
  const strengthFill = document.querySelector(".strength-fill")
  const strengthText = document.querySelector(".strength-text")
  let strength = 0
  let text = "Muy débil"
  let color = "#ef4444"
  if (password.length >= 8) strength += 25
  if (/[a-z]/.test(password)) strength += 25
  if (/[A-Z]/.test(password)) strength += 25
  if (/[0-9]/.test(password)) strength += 25
  if (strength >= 100) {
    text = "Muy Fuerte"
    color = "#6ee7b7"
  } else if (strength >= 75) {
    text = "Fuerte"
    color = "#10b981"
  } else if (strength >= 50) {
    text = "Media"
    color = "#f59e0b"
  } else if (strength >= 25) {
    text = "Débil"
    color = "#ef4444"
  }
  gsap.to(strengthFill, { width: `${strength}%`, backgroundColor: color, duration: 0.3, ease: "power2.out" })
  strengthText.textContent = `Fortaleza: ${text}`
  strengthText.style.color = color
}

// Validar coincidencia de contraseñas
function validatePasswordMatch() {
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const inputGroup = document.getElementById("confirmPassword").closest(".input-group")
  if (confirmPassword && password !== confirmPassword) {
    inputGroup.classList.add("input-error")
    showNotification("Las contraseñas no coinciden", "error")
  } else {
    inputGroup.classList.remove("input-error")
  }
}

// Validar input individual
function validateInput(e) {
  const input = e.target
  const inputGroup = input.closest(".input-group")
  if (input.type === "email" && !validateEmail(input.value)) {
    inputGroup.classList.add("input-error")
    return false
  }
  if (input.required && !input.value.trim()) {
    inputGroup.classList.add("input-error")
    return false
  }
  inputGroup.classList.remove("input-error")
  return true
}

// Validar email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Toggle visibilidad de contraseña
function togglePassword(inputId) {
  const input = document.getElementById(inputId)
  const toggle = input.parentElement.querySelector(".password-toggle")
  const eyeOpen = toggle.querySelector(".eye-open")
  const eyeClosed = toggle.querySelector(".eye-closed")
  if (input.type === "password") {
    input.type = "text"
    eyeOpen.style.display = "none"
    eyeClosed.style.display = "inline"
  } else {
    input.type = "password"
    eyeOpen.style.display = "inline"
    eyeClosed.style.display = "none"
  }
}

/* Notification */
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification")
  const icon = notification.querySelector(".notification-icon")
  const msg = notification.querySelector(".notification-message")
  notification.className = `notification show ${type}`
  icon.textContent = type === "success" ? "✔️" : "❌"
  msg.textContent = message
  setTimeout(() => {
    notification.classList.remove("show")
  }, 2500)
}
