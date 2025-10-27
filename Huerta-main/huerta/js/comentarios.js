// Import GSAP
const gsap = window.gsap

// Initialize GSAP
gsap.registerPlugin()

// Estado de la aplicación
const state = {
  currentFilter: "all",
  currentSort: "newest",
  offset: 0,
  limit: 20,
  hasMore: true,
  isLoading: false,
}

// DOM Elements
const commentInput = document.getElementById("new-comment-input")
const submitBtn = document.getElementById("submit-comment-btn")
const filterBtns = document.querySelectorAll(".filter-btn")
const sortOptions = document.querySelectorAll(".sort-option")
const loadMoreBtn = document.getElementById("load-more-btn")
const loadMoreSection = document.getElementById("load-more-section")
const commentsList = document.getElementById("comments-list")
const totalCommentsEl = document.getElementById("total-comments")
const totalParticipantsEl = document.getElementById("total-participants")

// Función para obtener el nombre completo del usuario
function getFullName(user) {
  const firstName = user.firstName || ''
  const lastName = user.lastName || ''
  return `${firstName} ${lastName}`.trim() || 'Usuario'
}

// Función para obtener el avatar
function getAvatar(user) {
  if (user.avatar_url && user.avatar_url !== 'img/placeholder.svg') {
    return user.avatar_url
  }
  const name = getFullName(user)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&size=128`
}

async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Error en la petición")
    }

    return data
  } catch (error) {
    console.error("API Error:", error)
    showNotification("Error: " + error.message, "error")
    throw error
  }
}

async function loadComments(append = false) {
  if (state.isLoading) return

  state.isLoading = true

  try {
    const params = new URLSearchParams({
      action: "comments",
      filter: state.currentFilter,
      sort: state.currentSort,
      limit: state.limit,
      offset: append ? state.offset : 0,
    })

    const data = await apiRequest(`api.php?${params}`)

    console.log("Loaded comments:", data)

    // Update stats
    if (data.stats) {
      totalCommentsEl.textContent = data.stats.total_comments
      totalParticipantsEl.textContent = data.stats.total_participants
    }

    // Update state
    state.hasMore = data.has_more
    state.offset = append ? state.offset + data.comments.length : data.comments.length

    // Render comments
    if (!append) {
      commentsList.innerHTML = ""
    }

    data.comments.forEach((comment, index) => {
      const commentEl = createCommentElement(comment)
      commentsList.appendChild(commentEl)

      // Animate entrance
      gsap.from(commentEl, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        delay: index * 0.1,
        ease: "power2.out",
      })
    })

    // Show/hide load more button
    loadMoreSection.style.display = state.hasMore ? "flex" : "none"
  } catch (error) {
    console.error("Error loading comments:", error)
  } finally {
    state.isLoading = false
  }
}

function createCommentElement(comment) {
  const article = document.createElement("article")
  article.className = "comment"
  article.dataset.commentId = comment.id

  const timeAgo = getTimeAgo(comment.created_at)
  const fullName = getFullName(comment)
  const avatar = getAvatar(comment)

  article.innerHTML = `
        <div class="comment-sidebar">
            <div class="user-avatar">
                <img src="${avatar}" alt="${fullName}">
            </div>
            ${comment.replies_count > 0 ? '<div class="thread-line"></div>' : ""}
        </div>
        
        <div class="comment-content">
            <div class="comment-header">
                <div class="user-info">
                    <span class="user-name">${fullName}</span>
                </div>
                <div class="comment-meta">
                    <time class="comment-time" datetime="${comment.created_at}">${timeAgo}</time>
                </div>
            </div>
            
            <div class="comment-body">${formatCommentContent(comment.content)}</div>
            
            <div class="comment-actions">
                <button class="action-btn like-btn ${comment.is_liked_by_current_user ? "liked" : ""}" data-comment-id="${comment.id}">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="${comment.is_liked_by_current_user ? "currentColor" : "none"}">
                        <path d="M9 15.5L3.5 10C1.5 8 1.5 4.5 3.5 2.5C5.5 0.5 9 2 9 2C9 2 12.5 0.5 14.5 2.5C16.5 4.5 16.5 8 14.5 10L9 15.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                    <span class="action-count">${comment.likes_count}</span>
                </button>
                
                <button class="action-btn reply-btn" data-comment-id="${comment.id}">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M5 9H13M5 9L8 6M5 9L8 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Responder</span>
                </button>
            </div>
            
            ${
              comment.replies_count > 0
                ? `
                <div class="replies" data-parent-id="${comment.id}">
                    <button class="load-more-replies" data-comment-id="${comment.id}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 4V12M4 8H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <span>Ver ${comment.replies_count} respuesta${comment.replies_count > 1 ? "s" : ""}</span>
                    </button>
                </div>
            `
                : ""
            }
        </div>
    `

  // Add event listeners
  setupCommentEventListeners(article)

  return article
}

function formatCommentContent(content) {
  return content.replace(/@(\w+\s?\w+)/g, '<span class="mention">@$1</span>').replace(/\n/g, "<br>")
}

function getTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return "hace unos segundos"
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`
  if (seconds < 604800) return `hace ${Math.floor(seconds / 86400)} días`
  return date.toLocaleDateString("es-ES")
}

function setupCommentEventListeners(commentEl) {
  // Like button
  const likeBtn = commentEl.querySelector(".like-btn")
  if (likeBtn) {
    likeBtn.addEventListener("click", handleLikeClick)
  }

  // Reply button
  const replyBtn = commentEl.querySelector(".reply-btn")
  if (replyBtn) {
    replyBtn.addEventListener("click", handleReplyClick)
  }

  // Load replies button
  const loadRepliesBtn = commentEl.querySelector(".load-more-replies")
  if (loadRepliesBtn) {
    loadRepliesBtn.addEventListener("click", handleLoadReplies)
  }

  // Thread line hover animation
  const threadLine = commentEl.querySelector(".thread-line")
  if (threadLine) {
    commentEl.addEventListener("mouseenter", () => {
      gsap.to(threadLine, {
        scaleY: 1.05,
        background: "var(--color-accent)",
        duration: 0.3,
      })
    })

    commentEl.addEventListener("mouseleave", () => {
      gsap.to(threadLine, {
        scaleY: 1,
        background: "var(--color-border-light)",
        duration: 0.3,
      })
    })
  }

  // Avatar hover animation
  const avatar = commentEl.querySelector(".user-avatar img")
  if (avatar) {
    avatar.addEventListener("mouseenter", function () {
      gsap.to(this, {
        scale: 1.1,
        duration: 0.3,
        ease: "back.out(1.7)",
      })
    })

    avatar.addEventListener("mouseleave", function () {
      gsap.to(this, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      })
    })
  }
}

async function handleLikeClick(e) {
  const btn = e.currentTarget
  const commentId = btn.dataset.commentId
  const countSpan = btn.querySelector(".action-count")
  const svg = btn.querySelector("svg")

  try {
    const data = await apiRequest("api.php?action=toggle_like", {
      method: "POST",
      body: JSON.stringify({ comment_id: commentId }),
    })

    console.log("Like toggled:", data)

    // Update UI
    if (data.is_liked) {
      btn.classList.add("liked")
      svg.setAttribute("fill", "currentColor")

      // Animate like
      gsap
        .timeline()
        .to(svg, {
          scale: 1.3,
          duration: 0.2,
          ease: "back.out(2)",
        })
        .to(svg, {
          scale: 1,
          duration: 0.3,
          ease: "elastic.out(1, 0.5)",
        })

      createLikeParticles(btn)
    } else {
      btn.classList.remove("liked")
      svg.setAttribute("fill", "none")

      // Animate unlike
      gsap.to(svg, {
        scale: 0.8,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
      })
    }

    countSpan.textContent = data.likes_count
  } catch (error) {
    console.error("Error toggling like:", error)
  }
}

function createLikeParticles(button) {
  const rect = button.getBoundingClientRect()

  for (let i = 0; i < 6; i++) {
    const particle = document.createElement("div")
    particle.style.position = "fixed"
    particle.style.left = rect.left + rect.width / 2 + "px"
    particle.style.top = rect.top + rect.height / 2 + "px"
    particle.style.width = "6px"
    particle.style.height = "6px"
    particle.style.borderRadius = "50%"
    particle.style.background = "#ef4444"
    particle.style.pointerEvents = "none"
    particle.style.zIndex = "1000"
    document.body.appendChild(particle)

    const angle = (Math.PI * 2 * i) / 6
    const distance = 30 + Math.random() * 20

    gsap.to(particle, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: 0,
      scale: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => particle.remove(),
    })
  }
}

function handleReplyClick(e) {
  const btn = e.currentTarget
  const commentId = btn.dataset.commentId
  const comment = btn.closest(".comment")
  const commentContent = comment.querySelector(".comment-content")

  let replyForm = commentContent.querySelector(".reply-form")

  if (replyForm) {
    gsap.to(replyForm, {
      opacity: 0,
      height: 0,
      duration: 0.3,
      onComplete: () => replyForm.remove(),
    })
  } else {
    replyForm = createReplyForm(commentId)
    commentContent.appendChild(replyForm)

    gsap.from(replyForm, {
      opacity: 0,
      height: 0,
      duration: 0.3,
      ease: "power2.out",
    })

    replyForm.querySelector("textarea").focus()
  }
}

function createReplyForm(parentId) {
  const form = document.createElement("div")
  form.className = "reply-form"
  form.style.marginTop = "1rem"
  
  // Obtener avatar del usuario actual
  const currentUserAvatar = getAvatar(window.currentUser)
  
  form.innerHTML = `
        <div style="display: flex; gap: 1rem;">
            <div class="user-avatar small">
                <img src="${currentUserAvatar}" alt="Tu avatar">
            </div>
            <div style="flex: 1;">
                <textarea 
                    class="comment-input reply-textarea" 
                    placeholder="Escribe tu respuesta..."
                    rows="2"
                    style="min-height: 60px;"
                ></textarea>
                <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
                    <button class="cancel-reply-btn" style="padding: 0.5rem 1rem; border: 1px solid var(--color-border); background: transparent; border-radius: 0.5rem; cursor: pointer; font-weight: 500; color: var(--color-text-secondary);">
                        Cancelar
                    </button>
                    <button class="submit-reply-btn" style="padding: 0.5rem 1rem; border: none; background: var(--color-accent); color: white; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                        Responder
                    </button>
                </div>
            </div>
        </div>
    `

  const textarea = form.querySelector("textarea")
  const cancelBtn = form.querySelector(".cancel-reply-btn")
  const submitBtn = form.querySelector(".submit-reply-btn")

  cancelBtn.addEventListener("click", () => {
    gsap.to(form, {
      opacity: 0,
      height: 0,
      duration: 0.3,
      onComplete: () => form.remove(),
    })
  })

  submitBtn.addEventListener("click", async () => {
    const content = textarea.value.trim()
    if (!content) return

    submitBtn.disabled = true
    submitBtn.textContent = "Enviando..."

    try {
      const data = await apiRequest("api.php?action=create", {
        method: "POST",
        body: JSON.stringify({
          content: content,
          parent_id: parentId,
        }),
      })

      console.log("Reply created:", data)

      gsap.to(form, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        onComplete: () => {
          form.remove()
          showNotification("Respuesta publicada exitosamente")
          loadComments()
        },
      })
    } catch (error) {
      console.error("Error creating reply:", error)
      submitBtn.disabled = false
      submitBtn.textContent = "Responder"
    }
  })

  return form
}

async function handleLoadReplies(e) {
  const btn = e.currentTarget
  const commentId = btn.dataset.commentId
  const repliesContainer = btn.closest(".replies")

  btn.disabled = true
  btn.querySelector("span").textContent = "Cargando..."

  try {
    const data = await apiRequest(`api.php?action=replies&comment_id=${commentId}`)

    console.log("Loaded replies:", data)

    // Remove the load button
    btn.remove()

    // Add replies
    data.replies.forEach((reply, index) => {
      const replyEl = createReplyElement(reply)
      repliesContainer.appendChild(replyEl)

      gsap.from(replyEl, {
        opacity: 0,
        x: -20,
        duration: 0.4,
        delay: index * 0.1,
        ease: "power2.out",
      })
    })
  } catch (error) {
    console.error("Error loading replies:", error)
    btn.disabled = false
    btn.querySelector("span").textContent = "Ver respuestas"
  }
}

function createReplyElement(reply) {
  const article = document.createElement("article")
  article.className = "comment reply"
  article.dataset.commentId = reply.id

  const timeAgo = getTimeAgo(reply.created_at)
  const fullName = getFullName(reply)
  const avatar = getAvatar(reply)

  article.innerHTML = `
        <div class="comment-sidebar">
            <div class="user-avatar small">
                <img src="${avatar}" alt="${fullName}">
            </div>
        </div>
        
        <div class="comment-content">
            <div class="comment-header">
                <div class="user-info">
                    <span class="user-name">${fullName}</span>
                </div>
                <div class="comment-meta">
                    <time class="comment-time" datetime="${reply.created_at}">${timeAgo}</time>
                </div>
            </div>
            
            <div class="comment-body">${formatCommentContent(reply.content)}</div>
            
            <div class="comment-actions">
                <button class="action-btn like-btn ${reply.is_liked_by_current_user ? "liked" : ""}" data-comment-id="${reply.id}">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="${reply.is_liked_by_current_user ? "currentColor" : "none"}">
                        <path d="M9 15.5L3.5 10C1.5 8 1.5 4.5 3.5 2.5C5.5 0.5 9 2 9 2C9 2 12.5 0.5 14.5 2.5C16.5 4.5 16.5 8 14.5 10L9 15.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                    <span class="action-count">${reply.likes_count}</span>
                </button>
                
                <button class="action-btn reply-btn" data-comment-id="${reply.parent_id}">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M5 9H13M5 9L8 6M5 9L8 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Responder</span>
                </button>
            </div>
        </div>
    `

  setupCommentEventListeners(article)

  return article
}

// Auto-resize textarea
commentInput.addEventListener("input", function () {
  this.style.height = "auto"
  this.style.height = this.scrollHeight + "px"

  if (this.value.trim().length > 0) {
    submitBtn.disabled = false
    gsap.to(submitBtn, {
      scale: 1.05,
      duration: 0.2,
      ease: "back.out(1.7)",
    })
  } else {
    submitBtn.disabled = true
    gsap.to(submitBtn, {
      scale: 1,
      duration: 0.2,
    })
  }
})

submitBtn.addEventListener("click", async () => {
  const content = commentInput.value.trim()
  if (!content) return

  submitBtn.disabled = true
  const originalText = submitBtn.innerHTML
  submitBtn.innerHTML = "<span>Publicando...</span>"

  try {
    const data = await apiRequest("api.php?action=create", {
      method: "POST",
      body: JSON.stringify({ content: content }),
    })

    console.log("Comment created:", data)

    gsap.to(commentInput, {
      scale: 0.98,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        commentInput.value = ""
        commentInput.style.height = "auto"
        submitBtn.innerHTML = originalText
        showNotification("Comentario publicado exitosamente")
        loadComments()
      },
    })
  } catch (error) {
    console.error("Error creating comment:", error)
    submitBtn.disabled = false
    submitBtn.innerHTML = originalText
  }
})

// Filter buttons
filterBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    filterBtns.forEach((b) => b.classList.remove("active"))
    this.classList.add("active")

    state.currentFilter = this.dataset.filter
    state.offset = 0

    gsap.fromTo(this, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: "back.out(1.7)" })

    gsap.to(commentsList.children, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      stagger: 0.05,
      onComplete: () => loadComments(),
    })
  })
})

// Sort options
sortOptions.forEach((option) => {
  option.addEventListener("click", function () {
    sortOptions.forEach((o) => o.classList.remove("active"))
    this.classList.add("active")

    state.currentSort = this.dataset.sort
    state.offset = 0

    gsap.to(commentsList.children, {
      opacity: 0,
      x: -30,
      duration: 0.3,
      stagger: 0.03,
      onComplete: () => loadComments(),
    })
  })
})

// Load more comments
if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", function () {
    gsap.to(this, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    })

    loadComments(true)
  })
}

// Notification system
function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.textContent = message
  notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${type === "error" ? "#ef4444" : "var(--color-accent)"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: var(--shadow-xl);
        font-weight: 600;
        z-index: 1000;
        opacity: 0;
    `

  document.body.appendChild(notification)

  gsap
    .timeline()
    .to(notification, {
      opacity: 1,
      y: -10,
      duration: 0.3,
      ease: "back.out(1.7)",
    })
    .to(notification, {
      opacity: 0,
      y: 10,
      duration: 0.3,
      delay: 2,
      onComplete: () => notification.remove(),
    })
}

// Initialize entrance animations
gsap.from(".comments-header", {
  opacity: 0,
  y: -30,
  duration: 0.6,
  ease: "power2.out",
})

gsap.from(".new-comment-section", {
  opacity: 0,
  y: 20,
  duration: 0.6,
  delay: 0.2,
  ease: "power2.out",
})

// ============================================
// ANIMACIONES DEL BOTÓN DE REGRESO
// ============================================

const backButton = document.getElementById('backToHome');

if (backButton) {
  // Animación de entrada épica
  gsap.from(backButton, {
    opacity: 0,
    x: -100,
    scale: 0,
    rotation: -180,
    duration: 0.8,
    delay: 0.4,
    ease: "back.out(1.7)"
  });

  // Efecto de ripple al hacer click
  backButton.addEventListener('click', function(e) {
    // Prevenir navegación inmediata
    e.preventDefault();
    
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    this.appendChild(ripple);
    
    // Animación de salida con explosión
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('span');
      particle.classList.add('particle');
      this.appendChild(particle);
      
      const angle = (Math.PI * 2 * i) / 12;
      const distance = 60;
      
      gsap.to(particle, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 1,
        scale: 1.5,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => particle.remove()
      });
      
      gsap.to(particle, {
        opacity: 0,
        delay: 0.3,
        duration: 0.3
      });
    }
    
    // Animación del botón y redirección
    gsap.to(this, {
      scale: 0,
      rotation: 360,
      opacity: 0,
      duration: 0.5,
      ease: "back.in(1.7)",
      onComplete: () => {
        window.location.href = this.href;
      }
    });
    
    setTimeout(() => ripple.remove(), 600);
  });

  // Partículas al hacer hover
  backButton.addEventListener('mouseenter', function() {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const particle = document.createElement('span');
        particle.classList.add('particle');
        this.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 50;
        
        gsap.to(particle, {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          opacity: 1,
          scale: 1.5,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(particle, {
              opacity: 0,
              scale: 0,
              duration: 0.4,
              onComplete: () => particle.remove()
            });
          }
        });
      }, i * 60);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Sistema de comentarios inicializado")
  console.log("Usuario actual:", window.currentUser)
  loadComments()
})