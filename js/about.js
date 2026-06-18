// about.js
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
  const faqQuestions = document.querySelectorAll('.faq-question');

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
    const title = document.querySelector('.hero-title');
    const subtitle = document.querySelector('.hero-subtitle');
    if (title) title.textContent = isEnglish ? 'About LAMS' : 'Kuhusu LAMS';
    if (subtitle) subtitle.textContent = isEnglish ? 'Digital platform for modern local governance' : 'Jukwaa la kidijitali kwa utawala wa kisasa wa mitaa';
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
          numberEl.classList.add('counted');
          const target = parseInt(numberEl.getAttribute('data-target'), 10);
          if (!isNaN(target)) {
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
  document.querySelectorAll('.scroll-reveal, .stat-item').forEach(el => observer.observe(el));

  // FAQ Accordion
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const isActive = faqItem.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(item => { item.classList.remove('active'); item.querySelector('.faq-question').setAttribute('aria-expanded', 'false'); });
      if (!isActive) { faqItem.classList.add('active'); question.setAttribute('aria-expanded', 'true'); }
    });
  });

  // Back to Top
  backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' }); }
    });
  });

  console.log('🏛️ LAMS About Page Ready');
});