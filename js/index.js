// index.js
document.addEventListener('DOMContentLoaded', () => {
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

  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Mobile Menu
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

  // Theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') { body.classList.add('dark-mode'); themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; }
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // Language
  let isEnglish = true;
  languageToggle.addEventListener('click', () => {
    isEnglish = !isEnglish;
    langText.textContent = isEnglish ? 'EN' : 'SW';
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroTitle) heroTitle.textContent = isEnglish ? 'Local Administration Management System' : 'Mfumo wa Usimamizi wa Utawala wa Mitaa';
    if (heroSubtitle) heroSubtitle.textContent = isEnglish ? 'Digital transformation for modern governance' : 'Mabadiliko ya kidijitali kwa utawala wa kisasa';
  });

  // Scroll
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
    backToTopBtn.classList.toggle('visible', window.scrollY > 500);
  });

  // Scroll Reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        const numberEl = entry.target.querySelector('.stat-number');
        if (numberEl && !numberEl.classList.contains('counted')) {
          const target = parseInt(numberEl.getAttribute('data-target'), 10);
          if (!isNaN(target)) {
            numberEl.classList.add('counted');
            let current = 0;
            const step = target / 125;
            const timer = setInterval(() => {
              current += step;
              if (current >= target) { numberEl.textContent = target.toLocaleString(); clearInterval(timer); }
              else { numberEl.textContent = Math.floor(current).toLocaleString(); }
            }, 16);
          }
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.scroll-reveal, .stat-item, .service-card, .contact-card').forEach(el => observer.observe(el));

  // Back to Top
  backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetElement = document.querySelector(this.getAttribute('href'));
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({ top: targetElement.offsetTop - 70, behavior: 'smooth' });
      }
    });
  });

  console.log('🏛️ LAMS Homepage Ready');
});