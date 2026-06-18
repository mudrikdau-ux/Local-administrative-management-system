// announcement.js

document.addEventListener('DOMContentLoaded', () => {
  // ==================== DOM ELEMENTS ====================
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTopBtn = document.getElementById('backToTop');
  const yearSpan = document.getElementById('year');
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');
  const categoryFilter = document.getElementById('categoryFilter');
  const announcementGrid = document.getElementById('announcementGrid');
  const noResults = document.getElementById('noResults');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const resultsCount = document.getElementById('resultsCount');
  const resultsInfo = document.getElementById('resultsInfo');
  
  // Language elements
  const languageToggle = document.getElementById('languageToggle');
  const langText = document.querySelector('.lang-text');
  
  // Modals
  const loginModalOverlay = document.getElementById('loginModalOverlay');
  const loginModal = document.getElementById('loginModal');
  const loginModalClose = document.getElementById('loginModalClose');
  const loginCancelBtn = document.getElementById('loginCancelBtn');
  const detailsModalOverlay = document.getElementById('detailsModalOverlay');
  const detailsModal = document.getElementById('detailsModal');
  const detailsModalClose = document.getElementById('detailsModalClose');

  // Set current year
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ==================== LANGUAGE SYSTEM ====================
  let currentLang = localStorage.getItem('lams_language') || 'en';
  
  const translations = {
    en: {
      pageTitle: 'Announcements',
      pageSubtitle: 'Stay informed with the latest updates from your local administration',
      searchPlaceholder: 'Search announcements by title...',
      resultsLabel: 'announcements found',
      noResultsTitle: 'No announcements found',
      noResultsText: 'Try adjusting your search or filter criteria',
      loadingText: 'Loading announcements...',
      loginRequired: 'Login Required',
      loginRequiredText: 'Please login to view the full announcement details.',
      loginNow: 'Login Now',
      cancel: 'Cancel',
      shareLabel: 'Share:',
      readMore: 'Read More',
      footerDesc: 'Modernizing local administration for better community service delivery.',
      quickLinksTitle: 'Quick Links',
      contactTitle: 'Contact Info',
      footerRights: 'Local Administration Management System. All Rights Reserved.',
      // Category translations for filter
      allCategories: 'All Categories',
      general: 'General Announcements',
      notice: 'Community Notices',
      event: 'Events',
      emergency: 'Emergency Notices',
      meeting: 'Community Meetings',
      development: 'Development Projects',
      // Category display names
      generalDisplay: 'General',
      noticeDisplay: 'Notice',
      eventDisplay: 'Event',
      emergencyDisplay: 'Emergency',
      meetingDisplay: 'Meeting',
      developmentDisplay: 'Development'
    },
    sw: {
      pageTitle: 'Matangazo',
      pageSubtitle: 'Pata taarifa za hivi punde kutoka kwa utawala wako wa mtaa',
      searchPlaceholder: 'Tafuta matangazo kwa kichwa...',
      resultsLabel: 'matangazo yamepatikana',
      noResultsTitle: 'Hakuna matangazo yaliyopatikana',
      noResultsText: 'Jaribu kubadilisha vigezo vya utafutaji au chujio',
      loadingText: 'Inapakia matangazo...',
      loginRequired: 'Inahitajika Kuingia',
      loginRequiredText: 'Tafadhali ingia ili kuona maelezo kamili ya tangazo.',
      loginNow: 'Ingia Sasa',
      cancel: 'Ghairi',
      shareLabel: 'Shiriki:',
      readMore: 'Soma Zaidi',
      footerDesc: 'Kuboresha utawala wa mtaa kwa utoaji bora wa huduma za jamii.',
      quickLinksTitle: 'Viungo vya Haraka',
      contactTitle: 'Mawasiliano',
      footerRights: 'Mfumo wa Usimamizi wa Utawala wa Mtaa. Haki Zote Zimehifadhiwa.',
      // Category translations for filter
      allCategories: 'Makundi Yote',
      general: 'Matangazo ya Jumla',
      notice: 'Notisi za Jamii',
      event: 'Matukio',
      emergency: 'Notisi za Dharura',
      meeting: 'Mikutano ya Jamii',
      development: 'Miradi ya Maendeleo',
      // Category display names
      generalDisplay: 'Jumla',
      noticeDisplay: 'Notisi',
      eventDisplay: 'Tukio',
      emergencyDisplay: 'Dharura',
      meetingDisplay: 'Mkutano',
      developmentDisplay: 'Maendeleo'
    }
  };

  function applyLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    
    // Update language toggle button
    if (langText) {
      langText.textContent = lang === 'en' ? 'EN' : 'SW';
    }
    
    // Update page header
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    if (pageTitle) pageTitle.textContent = t.pageTitle;
    if (pageSubtitle) pageSubtitle.textContent = t.pageSubtitle;
    
    // Update search placeholder
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
    
    // Update results label
    const resultsLabel = document.getElementById('resultsLabel');
    if (resultsLabel) resultsLabel.textContent = t.resultsLabel;
    
    // Update no results
    const noResultsTitle = document.getElementById('noResultsTitle');
    const noResultsText = document.getElementById('noResultsText');
    if (noResultsTitle) noResultsTitle.textContent = t.noResultsTitle;
    if (noResultsText) noResultsText.textContent = t.noResultsText;
    
    // Update loading
    const loadingText = document.getElementById('loadingText');
    if (loadingText) loadingText.textContent = t.loadingText;
    
    // Update login modal
    const loginModalTitle = document.getElementById('loginModalTitle');
    const loginModalText = document.getElementById('loginModalText');
    const loginNowBtn = document.getElementById('loginNowBtn');
    const loginCancelBtn = document.getElementById('loginCancelBtn');
    if (loginModalTitle) loginModalTitle.textContent = t.loginRequired;
    if (loginModalText) loginModalText.textContent = t.loginRequiredText;
    if (loginNowBtn) loginNowBtn.textContent = t.loginNow;
    if (loginCancelBtn) loginCancelBtn.textContent = t.cancel;
    
    // Update share label
    const shareLabel = document.getElementById('shareLabel');
    if (shareLabel) shareLabel.textContent = t.shareLabel;
    
    // Update footer
    const footerDesc = document.getElementById('footerDesc');
    const quickLinksTitle = document.getElementById('quickLinksTitle');
    const contactTitle = document.getElementById('contactTitle');
    const footerRights = document.getElementById('footerRights');
    if (footerDesc) footerDesc.textContent = t.footerDesc;
    if (quickLinksTitle) quickLinksTitle.textContent = t.quickLinksTitle;
    if (contactTitle) contactTitle.textContent = t.contactTitle;
    if (footerRights) footerRights.textContent = t.footerRights;
    
    // Update category filter options
    updateCategoryFilter(lang);
    
    // Save language preference
    localStorage.setItem('lams_language', lang);
    
    // Re-render announcements (updates category labels and Read More buttons)
    filterAnnouncements();
  }

  function updateCategoryFilter(lang) {
    if (!categoryFilter) return;
    
    const t = translations[lang];
    const options = categoryFilter.querySelectorAll('option');
    
    options.forEach(option => {
      const value = option.value;
      if (value === 'all') {
        option.textContent = t.allCategories;
      } else if (t[value]) {
        option.textContent = t[value];
      }
    });
  }

  // Language toggle event
  if (languageToggle) {
    languageToggle.addEventListener('click', () => {
      const newLang = currentLang === 'en' ? 'sw' : 'en';
      applyLanguage(newLang);
    });
  }

  // ==================== ANNOUNCEMENT DATA SOURCE ====================
  function getAnnouncements() {
    const storedAnnouncements = localStorage.getItem('lams_announcements');
    if (storedAnnouncements) {
      try {
        const parsed = JSON.parse(storedAnnouncements);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse stored announcements:', e);
      }
    }

    const sessionAnnouncements = sessionStorage.getItem('lams_announcements');
    if (sessionAnnouncements) {
      try {
        const parsed = JSON.parse(sessionAnnouncements);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse session announcements:', e);
      }
    }

    return getDefaultAnnouncements();
  }

  function getDefaultAnnouncements() {
    return [
      { 
        id: 1, 
        title: 'Monthly Community Health Screening', 
        title_sw: 'Uchunguzi wa Afya ya Jamii wa Kila Mwezi',
        category: 'general', 
        date: '2026-06-20', 
        summary: 'Free health screening for all community members at the central health center.', 
        summary_sw: 'Uchunguzi wa afya bure kwa wanajamii wote katika kituo cha afya cha kati.',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
        content: 'The local administration is pleased to announce the monthly community health screening program. All residents are invited to participate in this free health initiative.',
        content_sw: 'Utawala wa mtaa unafurahi kutangaza programu ya uchunguzi wa afya ya jamii ya kila mwezi. Wakazi wote wanaalikwa kushiriki katika mpango huu wa afya wa bure.',
        author: 'Health Department'
      },
      { 
        id: 2, 
        title: 'Public Notice: New Business Permit Guidelines', 
        title_sw: 'Notisi ya Umma: Miongozo Mpya ya Vibali vya Biashara',
        category: 'notice', 
        date: '2026-06-18', 
        summary: 'Updated guidelines for business permit applications effective next month.', 
        summary_sw: 'Miongozo iliyosasishwa ya maombi ya vibali vya biashara kuanzia mwezi ujao.',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
        content: 'The Local Administration Office issues a public notice regarding updated business permit guidelines effective from July 1, 2026.',
        content_sw: 'Ofisi ya Utawala wa Mtaa inatoa notisi ya umma kuhusu miongozo iliyosasishwa ya vibali vya biashara kuanzia Julai 1, 2026.',
        author: 'Administration Office'
      },
      { 
        id: 3, 
        title: 'Quarterly Community Development Forum', 
        title_sw: 'Jukwaa la Maendeleo ya Jamii la Kila Robo',
        category: 'meeting', 
        date: '2026-06-25', 
        summary: 'Join us to discuss infrastructure projects and community improvement initiatives.', 
        summary_sw: 'Jiunge nasi kujadili miradi ya miundombinu na mipango ya kuboresha jamii.',
        image: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
        content: 'All community members are invited to attend the Quarterly Community Development Forum.',
        content_sw: 'Wanajamii wote wanaalikwa kuhudhuria Jukwaa la Maendeleo ya Jamii la Kila Robo.',
        author: 'Development Committee'
      },
      { 
        id: 4, 
        title: 'New Public Library Construction Begins', 
        title_sw: 'Ujenzi wa Maktaba Mpya ya Umma Waanza',
        category: 'development', 
        date: '2026-06-15', 
        summary: 'Construction of the new state-of-the-art public library has commenced.', 
        summary_sw: 'Ujenzi wa maktaba mpya ya kisasa ya umma umeanza.',
        image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
        content: 'Construction of the new public library has officially begun. Expected completion by December 2026.',
        content_sw: 'Ujenzi wa maktaba mpya ya umma umeanza rasmi. Inatarajiwa kukamilika ifikapo Desemba 2026.',
        author: 'Infrastructure Department'
      },
      { 
        id: 5, 
        title: 'Emergency Weather Alert: Heavy Rainfall', 
        title_sw: 'Tahadhari ya Dharura ya Hali ya Hewa: Mvua Kubwa',
        category: 'emergency', 
        date: '2026-06-14', 
        summary: 'Heavy rainfall expected from June 20-22. Take necessary precautions.', 
        summary_sw: 'Mvua kubwa inatarajiwa kuanzia Juni 20-22. Chukua tahadhari muhimu.',
        image: 'https://images.unsplash.com/photo-1527482797697-8795b05eeb6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
        content: 'EMERGENCY ALERT: Heavy rainfall warning for June 20-22. Emergency response teams are on standby.',
        content_sw: 'TAHADHARI YA DHARURA: Onyo la mvua kubwa kwa Juni 20-22. Vikosi vya kukabiliana na dharura viko tayari.',
        author: 'Emergency Services'
      },
      { 
        id: 6, 
        title: 'Free ICT Training for Youth', 
        title_sw: 'Mafunzo ya Bure ya TEKNOLOJIA kwa Vijana',
        category: 'general', 
        date: '2026-06-12', 
        summary: 'Registration open for free ICT training program for youth aged 18-30.', 
        summary_sw: 'Usajili wazi kwa programu ya mafunzo ya TEKNOLOJIA ya bure kwa vijana wenye umri wa miaka 18-30.',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
        content: 'Free ICT training program for youth aged 18-30. Limited slots available.',
        content_sw: 'Programu ya mafunzo ya TEKNOLOJIA ya bure kwa vijana wenye umri wa miaka 18-30. Nafasi chache zinapatikana.',
        author: 'Education Department'
      }
    ];
  }

  // ==================== CHECK AUTH STATUS ====================
  function isLoggedIn() {
    const auth = localStorage.getItem('lams_auth') || sessionStorage.getItem('lams_auth');
    if (auth) {
      try {
        const authData = JSON.parse(auth);
        return authData.isLoggedIn === true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  // ==================== RENDER ANNOUNCEMENTS ====================
  function renderAnnouncements(announcementsToRender) {
    if (!announcementGrid) return;

    announcementGrid.innerHTML = '';

    if (!announcementsToRender || announcementsToRender.length === 0) {
      noResults.style.display = 'block';
      if (resultsInfo) resultsInfo.style.display = 'none';
      return;
    }

    noResults.style.display = 'none';
    if (resultsInfo) {
      resultsInfo.style.display = 'block';
      resultsCount.textContent = announcementsToRender.length;
    }

    const sorted = [...announcementsToRender].sort((a, b) => new Date(b.date) - new Date(a.date));
    const t = translations[currentLang];

    sorted.forEach((ann, index) => {
      const card = document.createElement('div');
      card.className = 'announcement-card';
      card.style.animationDelay = `${index * 0.05}s`;
      card.setAttribute('data-id', ann.id);
      card.setAttribute('data-category', ann.category);

      const categoryLabel = getCategoryDisplayName(ann.category);
      const title = currentLang === 'sw' && ann.title_sw ? ann.title_sw : ann.title;
      const summary = currentLang === 'sw' && ann.summary_sw ? ann.summary_sw : ann.summary;
      const dateFormatted = formatDate(ann.date);

      card.innerHTML = `
        <div class="card-image">
          <img src="${ann.image || 'https://images.unsplash.com/photo-1559223607-a43c990c692c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1559223607-a43c990c692c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
          <span class="card-category-badge category-${ann.category}">${categoryLabel}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(title)}</h3>
          <div class="card-date">
            <i class="far fa-calendar-alt"></i> ${dateFormatted}
          </div>
          <p class="card-summary">${escapeHtml(summary || '')}</p>
          <div class="card-footer">
            <button class="btn btn-primary read-more-btn" data-id="${ann.id}">
              ${t.readMore} <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>`;

      announcementGrid.appendChild(card);
    });

    attachReadMoreEvents();
  }

  function getCategoryDisplayName(category) {
    const t = translations[currentLang];
    const displayKey = category + 'Display';
    return t[displayKey] || t[category] || category;
  }

  function attachReadMoreEvents() {
    document.querySelectorAll('.read-more-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const announcementId = this.getAttribute('data-id');
        handleReadMore(announcementId);
      });
    });

    document.querySelectorAll('.announcement-card').forEach(card => {
      card.addEventListener('click', function(e) {
        if (e.target.closest('button')) return;
        const announcementId = this.getAttribute('data-id');
        handleReadMore(announcementId);
      });
      card.style.cursor = 'pointer';
    });
  }

  // ==================== HANDLE READ MORE ====================
  function handleReadMore(announcementId) {
    const id = parseInt(announcementId, 10);
    
    if (isLoggedIn()) {
      showAnnouncementDetails(id);
    } else {
      showLoginRequiredModal();
    }
  }

  // ==================== LOGIN REQUIRED MODAL ====================
  function showLoginRequiredModal() {
    loginModalOverlay.classList.add('active');
    loginModal.classList.add('active');
    body.style.overflow = 'hidden';
  }

  function closeLoginModal() {
    loginModalOverlay.classList.remove('active');
    loginModal.classList.remove('active');
    body.style.overflow = '';
  }

  if (loginModalClose) loginModalClose.addEventListener('click', closeLoginModal);
  if (loginCancelBtn) loginCancelBtn.addEventListener('click', closeLoginModal);
  if (loginModalOverlay) loginModalOverlay.addEventListener('click', closeLoginModal);

  // ==================== ANNOUNCEMENT DETAILS MODAL ====================
  function showAnnouncementDetails(announcementId) {
    const announcements = getAnnouncements();
    const ann = announcements.find(a => a.id === announcementId);
    if (!ann) return;

    const title = currentLang === 'sw' && ann.title_sw ? ann.title_sw : ann.title;
    const content = currentLang === 'sw' && ann.content_sw ? ann.content_sw : (ann.content || ann.summary || '');

    document.getElementById('detailsModalImage').src = ann.image || 'https://images.unsplash.com/photo-1559223607-a43c990c692c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    document.getElementById('detailsModalImage').alt = title;
    document.getElementById('detailsModalTitle').textContent = title;
    
    document.getElementById('detailsModalDate').innerHTML = 
      `<i class="far fa-calendar-alt"></i> ${formatDate(ann.date)}`;
    
    const authorEl = document.getElementById('detailsModalAuthor');
    if (ann.author) {
      authorEl.style.display = 'flex';
      authorEl.innerHTML = `<i class="fas fa-user"></i> ${escapeHtml(ann.author)}`;
    } else {
      authorEl.style.display = 'none';
    }

    const categoryEl = document.getElementById('detailsModalCategory');
    categoryEl.textContent = getCategoryDisplayName(ann.category);
    categoryEl.className = `announcement-category category-${ann.category}`;

    document.getElementById('detailsModalContent').textContent = content;

    detailsModalOverlay.classList.add('active');
    detailsModal.classList.add('active');
    body.style.overflow = 'hidden';
  }

  function closeDetailsModal() {
    detailsModalOverlay.classList.remove('active');
    detailsModal.classList.remove('active');
    body.style.overflow = '';
  }

  if (detailsModalClose) detailsModalClose.addEventListener('click', closeDetailsModal);
  if (detailsModalOverlay) detailsModalOverlay.addEventListener('click', closeDetailsModal);

  // ==================== SEARCH & FILTER ====================
  function filterAnnouncements() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const announcements = getAnnouncements();

    let filtered = announcements.filter(ann => {
      const annTitle = currentLang === 'sw' && ann.title_sw ? ann.title_sw.toLowerCase() : ann.title.toLowerCase();
      const annSummary = currentLang === 'sw' && ann.summary_sw ? ann.summary_sw.toLowerCase() : (ann.summary || '').toLowerCase();
      
      const matchesSearch = searchTerm === '' || 
        annTitle.includes(searchTerm) || 
        annSummary.includes(searchTerm) ||
        getCategoryDisplayName(ann.category).toLowerCase().includes(searchTerm);
      
      const matchesCategory = category === 'all' || ann.category === category;
      
      return matchesSearch && matchesCategory;
    });

    if (clearSearch) {
      clearSearch.style.display = searchTerm ? 'flex' : 'none';
    }

    renderAnnouncements(filtered);
  }

  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterAnnouncements, 300);
  });

  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      searchInput.value = '';
      clearSearch.style.display = 'none';
      filterAnnouncements();
      searchInput.focus();
    });
  }

  categoryFilter.addEventListener('change', filterAnnouncements);

  // ==================== UTILITY FUNCTIONS ====================
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const locale = currentLang === 'sw' ? 'sw-TZ' : 'en-US';
    return date.toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== HAMBURGER MENU ====================
  function openMenu() {
    navMenu.classList.add('active');
    menuOverlay.classList.add('active');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    body.style.overflow = 'hidden';
  }
  
  function closeMenu() {
    navMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  }
  
  hamburger.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    navMenu.classList.contains('active') ? closeMenu() : openMenu(); 
  });
  
  menuOverlay.addEventListener('click', closeMenu);
  
  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  
  document.addEventListener('keydown', (e) => { 
    if (e.key === 'Escape') {
      if (navMenu.classList.contains('active')) { 
        closeMenu(); 
        hamburger.focus(); 
      }
      if (loginModal.classList.contains('active')) closeLoginModal();
      if (detailsModal.classList.contains('active')) closeDetailsModal();
    }
  });
  
  window.addEventListener('resize', () => { 
    if (window.innerWidth > 992 && navMenu.classList.contains('active')) closeMenu(); 
  });

  // ==================== DARK/LIGHT MODE ====================
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') { 
    body.classList.add('dark-mode'); 
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; 
  }
  
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // ==================== STICKY NAVBAR & BACK TO TOP ====================
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ==================== LISTEN FOR NEW ANNOUNCEMENTS ====================
  window.addEventListener('storage', (e) => {
    if (e.key === 'lams_announcements') {
      filterAnnouncements();
    }
  });

  window.addEventListener('lamsAnnouncementsUpdated', () => {
    filterAnnouncements();
  });

  // ==================== INITIALIZATION ====================
  // Apply saved language
  applyLanguage(currentLang);
  
  // Initial render
  filterAnnouncements();
  
  window.dispatchEvent(new Event('scroll'));
  
  console.log('📢 LAMS Announcements Page - Initialized');
  console.log('🌐 Language:', currentLang.toUpperCase());
  console.log('✅ Auto-loading admin announcements');
  console.log('✅ Auth-gated Read More functionality');
  console.log('✅ Search & Filter ready');
});