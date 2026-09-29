// about.js - Fully Connected to Backend
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

  // System Elements
  const systemNameShort = document.getElementById('systemNameShort');
  const footerOrgName = document.getElementById('footerOrgName');
  const aboutTitle = document.getElementById('aboutTitle');
  const aboutDescription = document.getElementById('aboutDescription');
  const missionText = document.getElementById('missionText');
  const visionText = document.getElementById('visionText');

  // Stats Elements
  const statCitizens = document.getElementById('statCitizens');
  const statDocuments = document.getElementById('statDocuments');
  const statAnnouncements = document.getElementById('statAnnouncements');
  const statServices = document.getElementById('statServices');

  // FAQ Elements
  const faqQuestions = document.querySelectorAll('.faq-question');

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
    const title = document.querySelector('.hero-title');
    const subtitle = document.querySelector('.hero-subtitle');
    if (title) title.textContent = isEnglish ? 'About LAMS' : 'Kuhusu LAMS';
    if (subtitle) subtitle.textContent = isEnglish ? 'Digital platform for modern local governance' : 'Jukwaa la kidijitali kwa utawala wa kisasa wa mitaa';
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
  async function loadAboutData() {
    try {
      console.log('🏛️ [LAMS] Loading about page data...');
      
      // Load System Settings
      await loadSystemSettings();
      
      // Load Statistics
      await loadStatistics();
      
      console.log('✅ [LAMS] About page data loaded successfully');
    } catch (error) {
      console.error('❌ [LAMS] Error loading about data:', error);
    }
  }

  // ============================================================
  // 8a. LOAD SYSTEM SETTINGS
  // ============================================================
  async function loadSystemSettings() {
    try {
      console.log('📋 [LAMS] Loading system settings...');
      
      let settings = null;
      
      // Try super-admin settings (if authenticated)
      try {
        const res = await API.superAdmin.getSettings();
        if (res.success && res.data) {
          settings = res.data;
          console.log('✅ [LAMS] System settings loaded');
        }
      } catch (e) {
        console.log('ℹ️ [LAMS] Settings not available (may need login)');
      }
      
      // Apply settings if available
      if (settings) {
        // System Name
        if (settings.system_name) {
          if (systemNameShort) systemNameShort.textContent = settings.system_name;
          if (aboutTitle) aboutTitle.textContent = `What is ${settings.system_name}?`;
        }
        if (settings.organization_name) {
          if (footerOrgName) footerOrgName.textContent = settings.organization_name;
        }
        if (settings.description) {
          if (aboutDescription) aboutDescription.textContent = settings.description;
        }
        if (settings.mission) {
          if (missionText) missionText.textContent = settings.mission;
        }
        if (settings.vision) {
          if (visionText) visionText.textContent = settings.vision;
        }
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
      
      // Try public about stats
      try {
        const res = await API.public.getAboutStats();
        if (res.success && res.data) {
          stats = res.data;
          console.log('✅ [LAMS] Statistics loaded from public endpoint');
        }
      } catch (e) {
        console.log('ℹ️ [LAMS] Public about stats not available');
      }
      
      // Fallback: try home stats
      if (!stats) {
        try {
          const res = await API.public.getHomeStats();
          if (res.success && res.data) {
            stats = res.data;
            console.log('✅ [LAMS] Statistics loaded from home stats endpoint');
          }
        } catch (e) {
          console.log('ℹ️ [LAMS] Home stats not available');
        }
      }
      
      // Apply stats
      if (stats) {
        const citizens = stats.citizens_served || stats.registered_citizens || stats.total_citizens || 0;
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
  // 9. ANIMATE NUMBER
  // ============================================================
  function animateNumber(element, target, duration = 2000) {
    if (!element) return;
    
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
  // 10. FAQ ACCORDION
  // ============================================================
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const isActive = faqItem.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(item => { 
        item.classList.remove('active'); 
        item.querySelector('.faq-question').setAttribute('aria-expanded', 'false'); 
      });
      if (!isActive) { 
        faqItem.classList.add('active'); 
        question.setAttribute('aria-expanded', 'true'); 
      }
    });
  });

  // ============================================================
  // 11. SCROLL REVEAL
  // ============================================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.scroll-reveal, .stat-item, .mv-card, .value-card, .benefit-card, .timeline-item').forEach(el => {
    el.classList.add('scroll-reveal');
    observer.observe(el);
  });

  // ============================================================
  // 12. SMOOTH SCROLL
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' }); }
    });
  });

  // ============================================================
  // 13. INITIALIZE
  // ============================================================
  console.log('🏛️ LAMS About Page Ready');
  
  // Load all data
  await loadAboutData();
});

// Add loading indicator styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .scroll-reveal { opacity: 0; transform: translateY(25px); transition: opacity 0.5s ease, transform 0.5s ease; }
  .scroll-reveal.revealed { opacity: 1; transform: translateY(0); }
  .stat-number { transition: all 0.1s ease; }
`;
document.head.appendChild(styleSheet);