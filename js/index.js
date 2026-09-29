// index.js - Fully Connected to Backend
document.addEventListener('DOMContentLoaded', async () => {
  // ============================================================
  // 1. DOM REFERENCES
  // ============================================================
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTopBtn = document.getElementById('backToTop');
  const languageToggle = document.getElementById('languageToggle');
  const langText = document.querySelector('.lang-text');
  const yearSpan = document.getElementById('year');

  // System Name Elements
  const systemNameShort = document.getElementById('systemNameShort');
  const heroTitle = document.getElementById('heroTitle');
  const heroSubtitle = document.getElementById('heroSubtitle');
  const orgTagline = document.getElementById('orgTagline');
  const orgDescription = document.getElementById('orgDescription');
  const footerOrgName = document.getElementById('footerOrgName');

  // Contact Elements
  const contactPhone = document.getElementById('contactPhone');
  const contactEmail = document.getElementById('contactEmail');
  const contactAddress = document.getElementById('contactAddress');

  // Stats Elements
  const statCitizens = document.getElementById('statCitizens');
  const statDocuments = document.getElementById('statDocuments');
  const statAnnouncements = document.getElementById('statAnnouncements');
  const statServices = document.getElementById('statServices');

  // Announcements Elements
  const announcementsGrid = document.getElementById('announcementsGrid');
  const announcementsLoading = document.getElementById('announcementsLoading');
  const announcementsError = document.getElementById('announcementsError');
  const announcementsErrorMessage = document.getElementById('announcementsErrorMessage');
  const announcementsEmpty = document.getElementById('announcementsEmpty');

  // ============================================================
  // 2. SET YEAR
  // ============================================================
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ============================================================
  // 3. MOBILE MENU
  // ============================================================
  function openMenu() {
    navMenu.classList.add('active');
    menuOverlay.classList.add('active');
    hamburger.classList.add('active');
    body.style.overflow = 'hidden';
  }
  function closeMenu() {
    navMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    hamburger.classList.remove('active');
    body.style.overflow = '';
  }
  hamburger.addEventListener('click', (e) => { e.stopPropagation(); navMenu.classList.contains('active') ? closeMenu() : openMenu(); });
  menuOverlay.addEventListener('click', closeMenu);
  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && navMenu.classList.contains('active')) { closeMenu(); hamburger.focus(); } });
  window.addEventListener('resize', () => { if (window.innerWidth > 992 && navMenu.classList.contains('active')) closeMenu(); });

  // ============================================================
  // 4. THEME
  // ============================================================
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') { body.classList.add('dark-mode'); themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; }
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // ============================================================
  // 5. LANGUAGE TOGGLE
  // ============================================================
  let isEnglish = true;
  languageToggle.addEventListener('click', () => {
    isEnglish = !isEnglish;
    langText.textContent = isEnglish ? 'EN' : 'SW';
    if (heroTitle) heroTitle.textContent = isEnglish ? 'Local Administration Management System' : 'Mfumo wa Usimamizi wa Utawala wa Mitaa';
    if (heroSubtitle) heroSubtitle.textContent = isEnglish ? 'Digital transformation for modern governance' : 'Mabadiliko ya kidijitali kwa utawala wa kisasa';
  });

  // ============================================================
  // 6. SCROLL
  // ============================================================
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
    backToTopBtn.classList.toggle('visible', window.scrollY > 500);
  });

  // ============================================================
  // 7. BACK TO TOP
  // ============================================================
  backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ============================================================
  // 8. LOAD DATA FROM BACKEND
  // ============================================================
  async function loadHomeData() {
    try {
      console.log('🏛️ [LAMS] Loading home data...');
      
      // 8a. Load System Settings
      await loadSystemSettings();
      
      // 8b. Load Statistics
      await loadStatistics();
      
      // 8c. Load Announcements
      await loadAnnouncements();
      
      console.log('✅ [LAMS] Home data loaded successfully');
    } catch (error) {
      console.error('❌ [LAMS] Error loading home data:', error);
    }
  }

  // ============================================================
  // 8a. LOAD SYSTEM SETTINGS
  // ============================================================
  async function loadSystemSettings() {
    try {
      console.log('📋 [LAMS] Loading system settings...');
      
      // Try to get settings from public endpoint or super-admin endpoint
      let settings = null;
      
      // Try public endpoint first (if available)
      try {
        const res = await API.public.getHomeStats?.() || { success: false };
        // If public endpoint doesn't return settings, try super-admin
      } catch (e) {
        console.log('ℹ️ [LAMS] Public stats endpoint not available for settings');
      }
      
      // Try super-admin settings (if authenticated)
      try {
        const res = await API.superAdmin.getSettings();
        if (res.success && res.data) {
          settings = res.data;
          console.log('✅ [LAMS] System settings loaded via super-admin');
        }
      } catch (e) {
        console.log('ℹ️ [LAMS] Settings not available (may need login)');
      }
      
      // Apply settings if available
      if (settings) {
        // System Name
        if (settings.system_name) {
          if (systemNameShort) systemNameShort.textContent = settings.system_name;
          if (heroTitle) heroTitle.textContent = settings.system_name;
        }
        if (settings.organization_name) {
          if (orgTagline) orgTagline.textContent = `Dedicated to serving our community through ${settings.organization_name}`;
          if (footerOrgName) footerOrgName.textContent = settings.organization_name;
        }
        if (settings.description) {
          if (orgDescription) orgDescription.textContent = settings.description;
        }
        // Contact
        if (settings.contact_phone && contactPhone) contactPhone.textContent = settings.contact_phone;
        if (settings.contact_email && contactEmail) contactEmail.textContent = settings.contact_email;
        if (settings.system_address && contactAddress) contactAddress.textContent = settings.system_address;
      }
    } catch (error) {
      console.error('❌ [LAMS] Error loading settings:', error);
    }
  }

  // ============================================================
  // 8b. LOAD STATISTICS
  // ============================================================
  async function loadStatistics() {
    try {
      console.log('📊 [LAMS] Loading statistics...');
      
      let stats = null;
      
      // Try public home stats
      try {
        const res = await API.public.getHomeStats();
        if (res.success && res.data) {
          stats = res.data;
          console.log('✅ [LAMS] Statistics loaded from public endpoint');
        }
      } catch (e) {
        console.log('ℹ️ [LAMS] Public stats not available');
      }
      
      // Fallback: try super-admin stats
      if (!stats) {
        try {
          const res = await API.superAdmin.getStats?.();
          if (res.success && res.data) {
            stats = res.data;
            console.log('✅ [LAMS] Statistics loaded from super-admin endpoint');
          }
        } catch (e) {
          console.log('ℹ️ [LAMS] Super-admin stats not available');
        }
      }
      
      // Apply stats
      if (stats) {
        // Map backend fields to frontend
        const citizens = stats.registered_citizens || stats.total_citizens || 0;
        const documents = stats.documents_issued || stats.total_documents || 0;
        const announcements = stats.announcements || 0;
        const services = stats.services_completed || 0;
        
        animateNumber(statCitizens, citizens);
        animateNumber(statDocuments, documents);
        animateNumber(statAnnouncements, announcements);
        animateNumber(statServices, services);
      } else {
        // Show "Data unavailable" gracefully
        [statCitizens, statDocuments, statAnnouncements, statServices].forEach(el => {
          if (el) el.textContent = '—';
        });
      }
    } catch (error) {
      console.error('❌ [LAMS] Error loading statistics:', error);
      [statCitizens, statDocuments, statAnnouncements, statServices].forEach(el => {
        if (el) el.textContent = '—';
      });
    }
  }

  // ============================================================
  // 8c. LOAD ANNOUNCEMENTS
  // ============================================================
  async function loadAnnouncements(page = 1, limit = 6) {
    try {
      console.log('📢 [LAMS] Loading announcements...');
      
      // Show loading
      announcementsLoading.style.display = 'block';
      announcementsGrid.style.display = 'none';
      announcementsError.style.display = 'none';
      announcementsEmpty.style.display = 'none';
      
      // Fetch announcements
      const res = await API.public.getAnnouncements(page, limit);
      
      announcementsLoading.style.display = 'none';
      
      if (res.success && res.data && res.data.length > 0) {
        renderAnnouncements(res.data);
        announcementsGrid.style.display = 'grid';
      } else {
        announcementsGrid.style.display = 'none';
        announcementsEmpty.style.display = 'block';
      }
    } catch (error) {
      console.error('❌ [LAMS] Error loading announcements:', error);
      announcementsLoading.style.display = 'none';
      announcementsError.style.display = 'block';
      announcementsErrorMessage.textContent = error.message || 'Unable to load announcements. Please try again later.';
    }
  }

  // ============================================================
  // 8d. RENDER ANNOUNCEMENTS
  // ============================================================
  function renderAnnouncements(announcements) {
    if (!announcementsGrid) return;
    
    announcementsGrid.innerHTML = '';
    
    announcements.forEach((announcement, index) => {
      const card = document.createElement('div');
      card.className = 'announcement-card scroll-reveal';
      card.style.animationDelay = `${index * 0.1}s`;
      
      // Get image URL or placeholder
      const imageUrl = announcement.image || '';
      const imageHtml = imageUrl 
        ? `<img src="${imageUrl}" alt="${announcement.title || 'Announcement'}" class="announcement-img" onerror="this.style.display='none'">`
        : `<div class="announcement-img" style="display:flex;align-items:center;justify-content:center;background:var(--border-color);color:var(--text-light);">
            <i class="fas fa-bullhorn" style="font-size:2.5rem;"></i>
           </div>`;
      
      const categoryColors = {
        meeting: '#3b82f6',
        health: '#00b894',
        emergency: '#ef4444',
        development: '#8b5cf6',
        education: '#f59e0b',
        security: '#dc2626',
        environment: '#10b981',
        sports: '#8b5cf6',
        general: '#6366f1',
        other: '#6b7280'
      };
      
      const category = announcement.category || 'general';
      const categoryColor = categoryColors[category] || '#6366f1';
      
      // Format date
      const date = announcement.published_at || announcement.created_at;
      const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Recent';
      
      // Truncate description
      const excerpt = announcement.description 
        ? announcement.description.substring(0, 120) + (announcement.description.length > 120 ? '...' : '')
        : '';
      
      card.innerHTML = `
        ${imageHtml}
        <div class="announcement-body">
          <span class="announcement-category" style="background:${categoryColor}22;color:${categoryColor}">
            ${category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
          <h3 class="announcement-title">${announcement.title || 'Announcement'}</h3>
          <p class="announcement-excerpt">${excerpt || 'No description available.'}</p>
          <div class="announcement-meta">
            <span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
            <span class="announcement-link" data-id="${announcement.id}" onclick="viewAnnouncement(${announcement.id})">
              Read More <i class="fas fa-arrow-right"></i>
            </span>
          </div>
        </div>
      `;
      
      announcementsGrid.appendChild(card);
      
      // Observe for scroll animation
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      observer.observe(card);
    });
  }

  // ============================================================
  // 8e. VIEW ANNOUNCEMENT (Global function)
  // ============================================================
  window.viewAnnouncement = async function(id) {
    try {
      // Try to get full announcement from backend
      const res = await API.public.getAnnouncement(id);
      
      if (res.success && res.data) {
        // If public viewing is allowed, show the announcement
        // For now, redirect to announcements page with ID
        window.location.href = `announce.html?id=${id}`;
      } else {
        // If authentication required, show message and redirect to login
        showToast('info', 'Please login to view full announcement details.');
        setTimeout(() => {
          window.location.href = `login.html?redirect=announce.html?id=${id}`;
        }, 1500);
      }
    } catch (error) {
      console.error('❌ [LAMS] Error viewing announcement:', error);
      showToast('error', 'Unable to load announcement. Please try again.');
    }
  };

  // ============================================================
  // 9. ANIMATE NUMBER
  // ============================================================
  function animateNumber(element, target, duration = 2000) {
    if (!element) return;
    
    // If target is 0, just display 0
    if (target === 0 || target === '—') {
      element.textContent = target === '—' ? '—' : '0';
      return;
    }
    
    const start = 0;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = Math.round(target).toLocaleString();
        clearInterval(timer);
      } else {
        element.textContent = Math.round(current).toLocaleString();
      }
    }, 16);
  }

  // ============================================================
  // 10. TOAST NOTIFICATION (for user feedback)
  // ============================================================
  function showToast(type, message) {
    const existing = document.querySelector('.toast-container');
    if (!existing) {
      const container = document.createElement('div');
      container.className = 'toast-container';
      container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(container);
    }
    
    const container = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    toast.style.cssText = `
      padding: 14px 22px;
      border-radius: 12px;
      color: #fff;
      font-size: 0.88rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      animation: toastIn 0.4s ease, toastOut 0.4s ease 3s forwards;
      min-width: 280px;
      background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : type === 'warning' ? '#d97706' : '#2563eb'};
    `;
    container.appendChild(toast);
    
    // Clean up after animation
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 4000);
  }

  // ============================================================
  // 11. SMOOTH SCROLL
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetElement = document.querySelector(this.getAttribute('href'));
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({ top: targetElement.offsetTop - 70, behavior: 'smooth' });
      }
    });
  });

  // ============================================================
  // 12. SCROLL REVEAL (for service cards, stat items, contact cards)
  // ============================================================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  
  document.querySelectorAll('.service-card, .contact-card, .stat-item').forEach(el => {
    el.classList.add('scroll-reveal');
    revealObserver.observe(el);
  });

  // ============================================================
  // 13. INITIALIZE
  // ============================================================
  console.log('🏛️ LAMS Homepage Ready');
  
  // Load all data
  await loadHomeData();
});

// Add toast animation styles if not present
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes toastIn {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes toastOut {
    from { opacity: 1; }
    to { opacity: 0; transform: translateY(-10px); }
  }
  .scroll-reveal { opacity: 0; transform: translateY(25px); transition: opacity 0.5s ease, transform 0.5s ease; }
  .scroll-reveal.revealed { opacity: 1; transform: translateY(0); }
`;
document.head.appendChild(styleSheet);