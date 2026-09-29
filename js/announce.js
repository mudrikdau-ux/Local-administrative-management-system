// announcement.js - Fully Connected to Backend
document.addEventListener('DOMContentLoaded', async () => {
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
  
  // Pagination elements
  const paginationContainer = document.getElementById('paginationContainer');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const paginationInfo = document.getElementById('paginationInfo');
  
  // System elements
  const systemNameShort = document.getElementById('systemNameShort');
  const footerOrgName = document.getElementById('footerOrgName');
  
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

  // ==================== STATE ====================
  let currentPage = 1;
  const perPage = 6;
  let totalPages = 0;
  let totalItems = 0;
  let currentFilter = 'all';
  let currentSearch = '';
  let announcementsCache = [];
  let isFetching = false;

  // ==================== SET YEAR & SYSTEM NAME ====================
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Load system settings
  async function loadSystemSettings() {
    try {
      const res = await API.superAdmin.getSettings();
      if (res.success && res.data) {
        if (res.data.system_name && systemNameShort) {
          systemNameShort.textContent = res.data.system_name;
        }
        if (res.data.organization_name && footerOrgName) {
          footerOrgName.textContent = res.data.organization_name;
        }
      }
    } catch (e) {
      console.log('ℹ️ [LAMS] Settings not available (may need login)');
    }
  }
  await loadSystemSettings();

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
      prevPage: 'Previous',
      nextPage: 'Next',
      pageOf: 'Page {page} of {total}'
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
      prevPage: 'Iliyopita',
      nextPage: 'Inayofuata',
      pageOf: 'Ukurasa {page} wa {total}'
    }
  };

  function applyLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    
    if (langText) langText.textContent = lang === 'en' ? 'EN' : 'SW';
    
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    if (pageTitle) pageTitle.textContent = t.pageTitle;
    if (pageSubtitle) pageSubtitle.textContent = t.pageSubtitle;
    
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
    
    const resultsLabel = document.getElementById('resultsLabel');
    if (resultsLabel) resultsLabel.textContent = t.resultsLabel;
    
    const noResultsTitle = document.getElementById('noResultsTitle');
    const noResultsText = document.getElementById('noResultsText');
    if (noResultsTitle) noResultsTitle.textContent = t.noResultsTitle;
    if (noResultsText) noResultsText.textContent = t.noResultsText;
    
    const loadingText = document.getElementById('loadingText');
    if (loadingText) loadingText.textContent = t.loadingText;
    
    const loginModalTitle = document.getElementById('loginModalTitle');
    const loginModalText = document.getElementById('loginModalText');
    const loginNowBtn = document.getElementById('loginNowBtn');
    const loginCancelBtn = document.getElementById('loginCancelBtn');
    if (loginModalTitle) loginModalTitle.textContent = t.loginRequired;
    if (loginModalText) loginModalText.textContent = t.loginRequiredText;
    if (loginNowBtn) loginNowBtn.textContent = t.loginNow;
    if (loginCancelBtn) loginCancelBtn.textContent = t.cancel;
    
    const shareLabel = document.getElementById('shareLabel');
    if (shareLabel) shareLabel.textContent = t.shareLabel;
    
    localStorage.setItem('lams_language', lang);
  }

  if (languageToggle) {
    languageToggle.addEventListener('click', () => {
      const newLang = currentLang === 'en' ? 'sw' : 'en';
      applyLanguage(newLang);
      fetchAnnouncements(currentPage);
    });
  }

  // ==================== CHECK AUTH STATUS ====================
  function isLoggedIn() {
    return API.isAuthenticated();
  }

  // ==================== FETCH ANNOUNCEMENTS FROM BACKEND ====================
  async function fetchAnnouncements(page = 1) {
    if (isFetching) return;
    isFetching = true;
    
    showLoading(true);
    
    try {
      const filters = {};
      if (currentSearch) filters.search = currentSearch;
      if (currentFilter !== 'all') filters.category = currentFilter;
      
      console.log(`📢 [LAMS] Fetching announcements page ${page}...`);
      const res = await API.public.getAnnouncements(page, perPage, filters);
      
      if (res.success) {
        let announcements = [];
        let total = 0;
        
        if (res.data && Array.isArray(res.data)) {
          announcements = res.data;
          total = res.meta?.total_records || res.meta?.total || announcements.length;
        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
          announcements = res.data.data;
          total = res.data.pagination?.total_records || res.meta?.total || announcements.length;
        }
        
        totalItems = total;
        totalPages = Math.ceil(total / perPage) || 1;
        
        announcementsCache = announcements;
        renderAnnouncements(announcements);
        updatePagination(page);
        
        console.log(`✅ [LAMS] Loaded ${announcements.length} announcements (total: ${total})`);
      } else {
        console.error('❌ [LAMS] Failed to fetch announcements:', res.message);
        renderAnnouncements([]);
        showError(res.message || 'Failed to load announcements.');
      }
    } catch (error) {
      console.error('❌ [LAMS] Error fetching announcements:', error);
      renderAnnouncements([]);
      showError('Unable to connect to server. Please try again later.');
    } finally {
      showLoading(false);
      isFetching = false;
    }
  }

  // ==================== RENDER ANNOUNCEMENTS ====================
  function renderAnnouncements(announcements) {
    if (!announcementGrid) return;

    announcementGrid.innerHTML = '';

    if (!announcements || announcements.length === 0) {
      noResults.style.display = 'block';
      if (resultsInfo) resultsInfo.style.display = 'none';
      if (paginationContainer) paginationContainer.style.display = 'none';
      return;
    }

    noResults.style.display = 'none';
    if (resultsInfo) {
      resultsInfo.style.display = 'block';
      resultsCount.textContent = totalItems || announcements.length;
    }

    const t = translations[currentLang];

    announcements.forEach((ann, index) => {
      const card = document.createElement('div');
      card.className = 'announcement-card';
      card.style.animationDelay = `${index * 0.05}s`;
      card.setAttribute('data-id', ann.id);
      card.setAttribute('data-category', ann.category || 'general');

      const category = ann.category || 'general';
      const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
      const title = ann.title || 'Announcement';
      const summary = ann.description || ann.summary || '';
      const dateFormatted = formatDate(ann.published_at || ann.created_at || ann.date);
      const imageUrl = ann.image || 'image/meeting.png';

      card.innerHTML = `
        <div class="card-image">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='image/health.png'">
          <span class="card-category-badge category-${category}">${escapeHtml(categoryLabel)}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(title)}</h3>
          <div class="card-date">
            <i class="far fa-calendar-alt"></i> ${dateFormatted}
          </div>
          <p class="card-summary">${escapeHtml(summary.substring(0, 150))}${summary.length > 150 ? '...' : ''}</p>
          <div class="card-footer">
            <button class="btn btn-primary read-more-btn" data-id="${ann.id}">
              ${t.readMore} <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>`;

      announcementGrid.appendChild(card);
    });

    attachReadMoreEvents();
    
    // Show pagination
    if (paginationContainer) {
      paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
    }
  }

  // ==================== ATTACH READ MORE EVENTS ====================
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
  async function showAnnouncementDetails(announcementId) {
    try {
      const res = await API.public.getAnnouncement(announcementId);
      
      if (res.success && res.data) {
        const ann = res.data;
        
        const title = ann.title || 'Announcement';
        const content = ann.description || ann.content || ann.summary || '';
        const category = ann.category || 'general';
        const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
        const dateFormatted = formatDate(ann.published_at || ann.created_at || ann.date);
        const imageUrl = ann.image || 'image/public.png';

        document.getElementById('detailsModalImage').src = imageUrl;
        document.getElementById('detailsModalImage').alt = title;
        document.getElementById('detailsModalTitle').textContent = title;
        
        document.getElementById('detailsModalDate').innerHTML = 
          `<i class="far fa-calendar-alt"></i> ${dateFormatted}`;
        
        const authorEl = document.getElementById('detailsModalAuthor');
        if (ann.created_by_name || ann.author) {
          authorEl.style.display = 'flex';
          authorEl.innerHTML = `<i class="fas fa-user"></i> ${escapeHtml(ann.created_by_name || ann.author || 'Administrator')}`;
        } else {
          authorEl.style.display = 'none';
        }

        const categoryEl = document.getElementById('detailsModalCategory');
        categoryEl.textContent = categoryLabel;
        categoryEl.className = `announcement-category category-${category}`;

        document.getElementById('detailsModalContent').textContent = content;

        detailsModalOverlay.classList.add('active');
        detailsModal.classList.add('active');
        body.style.overflow = 'hidden';
      } else {
        showToast('error', 'Unable to load announcement details.');
      }
    } catch (error) {
      console.error('❌ [LAMS] Error loading announcement details:', error);
      showToast('error', 'Failed to load announcement details.');
    }
  }

  function closeDetailsModal() {
    detailsModalOverlay.classList.remove('active');
    detailsModal.classList.remove('active');
    body.style.overflow = '';
  }

  if (detailsModalClose) detailsModalClose.addEventListener('click', closeDetailsModal);
  if (detailsModalOverlay) detailsModalOverlay.addEventListener('click', closeDetailsModal);

  // ==================== PAGINATION ====================
  function updatePagination(page) {
    currentPage = page;
    const t = translations[currentLang];
    
    if (prevPageBtn) {
      prevPageBtn.disabled = page <= 1;
    }
    if (nextPageBtn) {
      nextPageBtn.disabled = page >= totalPages;
    }
    if (paginationInfo) {
      paginationInfo.textContent = t.pageOf.replace('{page}', page).replace('{total}', totalPages);
    }
  }

  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        fetchAnnouncements(currentPage - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        fetchAnnouncements(currentPage + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ==================== SEARCH & FILTER ====================
  function handleSearchAndFilter() {
    currentSearch = searchInput.value.trim();
    currentPage = 1;
    fetchAnnouncements(1);
    
    if (clearSearch) {
      clearSearch.style.display = currentSearch ? 'flex' : 'none';
    }
  }

  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(handleSearchAndFilter, 400);
  });

  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      searchInput.value = '';
      clearSearch.style.display = 'none';
      currentSearch = '';
      currentPage = 1;
      fetchAnnouncements(1);
      searchInput.focus();
    });
  }

  categoryFilter.addEventListener('change', () => {
    currentFilter = categoryFilter.value;
    currentPage = 1;
    fetchAnnouncements(1);
  });

  // ==================== LOAD CATEGORIES ====================
  async function loadCategories() {
    try {
      // Try to get categories from backend
      const res = await API.public.getAnnouncements(1, 1);
      if (res.success && res.data) {
        // Extract unique categories from announcements
        const categories = new Set();
        let items = res.data;
        if (res.data.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }
        items.forEach(ann => {
          if (ann.category) categories.add(ann.category);
        });
        
        // Add default categories if none found
        if (categories.size === 0) {
          ['all', 'general', 'notice', 'event', 'emergency', 'meeting', 'development'].forEach(c => categories.add(c));
        }
        
        // Update filter dropdown
        const t = translations[currentLang];
        categoryFilter.innerHTML = '';
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = t.allCategories || 'All Categories';
        categoryFilter.appendChild(allOption);
        
        categories.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat;
          const label = cat.charAt(0).toUpperCase() + cat.slice(1);
          option.textContent = label;
          categoryFilter.appendChild(option);
        });
      }
    } catch (e) {
      console.log('ℹ️ [LAMS] Using default categories');
      // Default categories already in HTML
    }
  }

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

  function showLoading(show) {
    if (loadingIndicator) {
      loadingIndicator.style.display = show ? 'block' : 'none';
    }
    if (announcementGrid) {
      announcementGrid.style.display = show ? 'none' : 'grid';
    }
    if (noResults) {
      noResults.style.display = 'none';
    }
    if (paginationContainer) {
      paginationContainer.style.display = 'none';
    }
  }

  function showError(message) {
    noResults.style.display = 'block';
    const noResultsTitle = document.getElementById('noResultsTitle');
    const noResultsText = document.getElementById('noResultsText');
    if (noResultsTitle) noResultsTitle.textContent = 'Error Loading Announcements';
    if (noResultsText) noResultsText.textContent = message || 'Please try again later.';
    if (resultsInfo) resultsInfo.style.display = 'none';
    if (paginationContainer) paginationContainer.style.display = 'none';
  }

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
    
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 4000);
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

  // ==================== INITIALIZATION ====================
  // Apply language
  applyLanguage(currentLang);
  
  // Load categories
  await loadCategories();
  
  // Fetch announcements
  await fetchAnnouncements(1);
  
  window.dispatchEvent(new Event('scroll'));
  
  console.log('📢 LAMS Announcements Page - Initialized');
  console.log('🌐 Language:', currentLang.toUpperCase());
  console.log('✅ Connected to backend via API');
  console.log('✅ Search & Filter ready');
  console.log('✅ Pagination ready');
});

// Add toast animation styles
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
`;
document.head.appendChild(styleSheet);