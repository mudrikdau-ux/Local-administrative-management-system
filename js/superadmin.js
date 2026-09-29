// superadmin.js - LAMS Super Admin Panel (FULLY FIXED - With Cache-Busting)
(function() {
  'use strict';

  console.log('🟢 superadmin.js: Starting...');

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================
  const isOnLoginPage = () => {
    const path = window.location.pathname.toLowerCase();
    return path.includes('login.html') || path.includes('forgot-password.html') || path === '/' || path === '/index.html';
  };

  const wasSessionCleared = () => {
    const cleared = localStorage.getItem('lams_session_cleared');
    if (!cleared) return false;
    const elapsed = Date.now() - parseInt(cleared);
    return elapsed < 3000;
  };

  // ============================================================
  // GENERATE TEMPORARY PASSWORD
  // ============================================================
  function generateTempPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    password += Math.floor(Math.random() * 10);
    password += '!@#$%'[Math.floor(Math.random() * 5)];
    return password;
  }

  // ============================================================
  // AUTH CHECK
  // ============================================================
  if (wasSessionCleared()) {
    localStorage.removeItem('lams_session_cleared');
    if (!isOnLoginPage()) {
      window.location.href = 'login.html';
    }
    return;
  }

  if (!window.API || !window.API.isAuthenticated()) {
    if (!isOnLoginPage()) {
      window.location.href = 'login.html';
    }
    return;
  }
  
  const session = window.API.getSession() || {};
  if (session.role !== 'super_admin' && session.role !== 'superadmin') {
    if (!isOnLoginPage()) {
      window.location.href = 'login.html';
    }
    return;
  }

  console.log('✅ superadmin.js: Authentication passed!');

  // ============================================================
  // GLOBAL STATE
  // ============================================================
  let currentPage = 'dashboard';
  let confirmCallback = null;
  let admins = [];
  let citizens = [];
  let auditLogs = [];
  let notifications = [];
  let currentAdminPage = 1;
  let currentCitizenPage = 1;
  let currentAuditPage = 1;
  let tempAdminPhoto = null;
  let profileData = {};
  const itemsPerPage = 8;
  const BASE_URL = 'http://localhost:5000';
  const API_URL = BASE_URL + '/api';

  // ============================================================
  // INITIALIZATION
  // ============================================================
  function init() {
    setupSidebar();
    setupTheme();
    setupLiveClock();
    setupNotifications();
    setupLogout();
    // Load profile first, then navigate
    loadProfileData().then(() => {
      navigateTo('dashboard');
    }).catch(() => {
      navigateTo('dashboard');
    });
    console.log('👑 LAMS Super Admin Panel - Connected to Backend');
  }

  // ============================================================
  // PROFILE LOAD - FIXED: Handles res.data.profile structure
  // ============================================================
  async function loadProfileData() {
    try {
      const res = await window.API.superAdmin.getProfile();
      console.log('👤 Profile response:', res);
      
      if (res.success && res.data) {
        // ✅ FIX: Get profile from data.profile or data directly
        profileData = res.data.profile || res.data || {};
        console.log('👤 Profile data:', profileData);
        console.log('👤 Profile photo URL:', profileData.profile_photo);
        updateUserInfo();
      } else {
        console.warn('⚠️ Profile load failed:', res.message);
        profileData = {
          full_name: session.full_name || 'Super Admin',
          email: session.email || '',
          profile_photo: null
        };
        updateUserInfo();
      }
    } catch (e) { 
      console.error('Profile load error:', e);
      profileData = {
        full_name: session.full_name || 'Super Admin',
        email: session.email || '',
        profile_photo: null
      };
      updateUserInfo();
    }
  }

  // ============================================================
  // UPDATE USER INFO - FIXED WITH CACHE-BUSTING
  // ============================================================
  function updateUserInfo() {
    const name = profileData.full_name || session.full_name || 'Super Admin';
    const email = profileData.email || session.email || '';
    
    // ✅ FIX: Use profile_photo from backend, add cache-busting
    let avatarUrl = profileData.profile_photo || profileData.avatar || null;
    
    // If no photo, generate avatar from name
    if (!avatarUrl) {
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0066cc&color=fff&size=80&bold=true`;
    } else {
      // ✅ FIX: Add cache-busting to photo URL
      const separator = avatarUrl.includes('?') ? '&' : '?';
      avatarUrl = avatarUrl + `${separator}t=${Date.now()}`;
    }
    
    console.log('🖼️ Avatar URL:', avatarUrl);
    
    // Update sidebar avatar
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    if (sidebarAvatar) {
      sidebarAvatar.src = avatarUrl;
      sidebarAvatar.onerror = function() {
        this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0066cc&color=fff&size=80&t=${Date.now()}`;
      };
    }
    
    // Update header avatar
    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) {
      headerAvatar.src = avatarUrl;
      headerAvatar.onerror = function() {
        this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0066cc&color=fff&size=40&t=${Date.now()}`;
      };
    }
    
    // Update sidebar name
    const sidebarName = document.getElementById('sidebarUserName');
    if (sidebarName) {
      sidebarName.textContent = name;
    }
    
    // Update profile page if open
    if (currentPage === 'profile') {
      const avatarElement = document.getElementById('profileAvatar');
      if (avatarElement) {
        avatarElement.src = avatarUrl;
      }
      const nameElement = document.querySelector('.profile-info h2');
      if (nameElement) {
        nameElement.textContent = name;
      }
      const emailElement = document.querySelector('.profile-info p');
      if (emailElement) {
        emailElement.textContent = email;
      }
    }
  }

  // ============================================================
  // UPDATE PROFILE PAGE - FIXED
  // ============================================================
  async function updateProfilePage() {
    const nameInput = document.getElementById('profileName');
    const emailInput = document.getElementById('profileEmail');
    const phoneInput = document.getElementById('profilePhone');
    const avatarElement = document.getElementById('profileAvatar');
    
    if (nameInput) nameInput.value = profileData.full_name || '';
    if (emailInput) emailInput.value = profileData.email || session.email || '';
    if (phoneInput) phoneInput.value = profileData.phone || '';
    
    if (avatarElement) {
      let photo = profileData.profile_photo || profileData.avatar || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.full_name || 'Super Admin')}&background=0066cc&color=fff&size=110`;
      
      // ✅ FIX: Add cache-busting
      if (profileData.profile_photo) {
        const separator = photo.includes('?') ? '&' : '?';
        photo = photo + `${separator}t=${Date.now()}`;
      }
      avatarElement.src = photo;
    }
  }

  // ============================================================
  // LIVE CLOCK
  // ============================================================
  function setupLiveClock() {
    function updateClock() {
      const now = new Date();
      const timeEl = document.getElementById('liveTime');
      const dateEl = document.getElementById('liveDateDisplay');
      if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // ============================================================
  // SIDEBAR
  // ============================================================
  function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    function openSidebar() { 
      sidebar.classList.add('active'); 
      sidebarOverlay.classList.add('active'); 
      document.body.style.overflow = 'hidden'; 
    }
    function closeSidebar() { 
      sidebar.classList.remove('active'); 
      sidebarOverlay.classList.remove('active'); 
      document.body.style.overflow = ''; 
    }
    
    mobileMenuBtn?.addEventListener('click', openSidebar);
    sidebarToggle?.addEventListener('click', closeSidebar);
    sidebarOverlay?.addEventListener('click', closeSidebar);
    
    window.addEventListener('resize', () => { 
      if (window.innerWidth > 1024 && sidebar.classList.contains('active')) closeSidebar(); 
    });
    
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      link.addEventListener('click', (e) => { 
        e.preventDefault(); 
        navigateTo(link.getAttribute('data-page')); 
        if (window.innerWidth <= 1024) closeSidebar(); 
      });
    });
  }

  // ============================================================
  // THEME
  // ============================================================
  function setupTheme() {
    const btn = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') { 
      document.body.classList.add('dark-mode'); 
      btn.innerHTML = '<i class="fas fa-sun"></i>'; 
    }
    btn?.addEventListener('click', () => {
      const isDark = !document.body.classList.contains('dark-mode');
      document.body.classList.toggle('dark-mode');
      btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  // ============================================================
  // TOAST
  // ============================================================
  function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    toast.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // ============================================================
  // NAVIGATION
  // ============================================================
  function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const link = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (link) link.classList.add('active');
    
    const titles = { 
      'dashboard': 'Dashboard Overview', 
      'admin-management': 'Admin Management', 
      'citizen-monitoring': 'Citizen Monitoring', 
      'reports': 'System Reports', 
      'audit-logs': 'Audit Logs', 
      'settings': 'System Settings', 
      'security-center': 'Security Center', 
      'profile': 'Profile Settings' 
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;

    switch(page) {
      case 'dashboard': loadDashboard(); break;
      case 'admin-management': loadAdminManagement(); break;
      case 'citizen-monitoring': loadCitizenMonitoring(); break;
      case 'reports': loadReports(); break;
      case 'audit-logs': loadAuditLogs(); break;
      case 'settings': loadSettings(); break;
      case 'security-center': loadSecurityCenter(); break;
      case 'profile': loadProfilePage(); break;
    }
  }
  window.navigateTo = navigateTo;

  // ============================================================
  // DASHBOARD
  // ============================================================
  async function loadDashboard() {
    const pc = document.getElementById('pageContent');
    pc.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading dashboard...</p></div>';
    try {
      const res = await window.API.superAdmin.getDashboard();
      if (!res.success) { 
        pc.innerHTML = '<p style="text-align:center;color:var(--text-light);">Failed to load dashboard.</p>'; 
        return; 
      }
      const d = res.data || res;
      const stats = d.summary_cards || d.summary || {};
      const now = new Date();

      pc.innerHTML = `
        <div class="welcome-card">
          <div class="welcome-info"><h2><i class="fas fa-crown" style="color:#f59e0b;margin-right:10px;"></i>Welcome Back, Super Administrator</h2><p>You have full system governance and administration oversight.</p></div>
          <div class="welcome-date"><span>${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span><div class="system-status"><span class="status-dot"></span><span>System Operational</span></div></div>
        </div>
        <div class="stats-grid">
          <div class="stat-card clickable" onclick="navigateTo('citizen-monitoring')">
            <div class="stat-icon" style="background:#e0f2fe;"><i class="fas fa-users" style="color:#0284c7;"></i></div>
            <div class="stat-info"><h3>Total Citizens</h3><p class="stat-number">${(stats.total_citizens || 0).toLocaleString()}</p><span class="stat-change positive">Across system</span></div>
          </div>
          <div class="stat-card clickable" onclick="navigateTo('admin-management')">
            <div class="stat-icon" style="background:#dcfce7;"><i class="fas fa-user-tie" style="color:#16a34a;"></i></div>
            <div class="stat-info"><h3>Total Admins</h3><p class="stat-number">${(stats.total_admins || 0).toLocaleString()}</p><span class="stat-change positive">${stats.active_admins || 0} active</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#fef3c7;"><i class="fas fa-user-check" style="color:#d97706;"></i></div>
            <div class="stat-info"><h3>Active Admins</h3><p class="stat-number">${(stats.active_admins || 0).toLocaleString()}</p><span class="stat-change neutral">Currently serving</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#fce7f3;"><i class="fas fa-user-times" style="color:#db2777;"></i></div>
            <div class="stat-info"><h3>Suspended Admins</h3><p class="stat-number">${(stats.suspended_admins || 0).toLocaleString()}</p><span class="stat-change ${(stats.suspended_admins||0) > 0 ? 'negative' : 'neutral'}">Requires attention</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#e0e7ff;"><i class="fas fa-map-marker-alt" style="color:#4f46e5;"></i></div>
            <div class="stat-info"><h3>Total Wards</h3><p class="stat-number">${(stats.total_wards || 0).toLocaleString()}</p><span class="stat-change positive">All operational</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#d1fae5;"><i class="fas fa-file-alt" style="color:#059669;"></i></div>
            <div class="stat-info"><h3>Documents Issued</h3><p class="stat-number">${(stats.total_documents || 0).toLocaleString()}</p><span class="stat-change positive">Total processed</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#fef3c7;"><i class="fas fa-coins" style="color:#d97706;"></i></div>
            <div class="stat-info"><h3>Total Revenue (TZS)</h3><p class="stat-number">${(stats.total_revenue || 0).toLocaleString()}</p><span class="stat-change positive">Collected</span></div>
          </div>
          <div class="stat-card clickable" onclick="navigateTo('audit-logs')">
            <div class="stat-icon" style="background:#fce7f3;"><i class="fas fa-history" style="color:#db2777;"></i></div>
            <div class="stat-info"><h3>System Activities</h3><p class="stat-number">${(stats.total_audit_logs || 0).toLocaleString()}</p><span class="stat-change neutral">Total logs</span></div>
          </div>
        </div>
        <div class="quick-actions"><h3>Quick Actions</h3><div class="actions-grid">
          <div class="action-card" onclick="showAddAdminModal()"><i class="fas fa-user-plus"></i><span>Add New Admin</span></div>
          <div class="action-card" onclick="showLeadershipModal()"><i class="fas fa-exchange-alt"></i><span>Transfer Leadership</span></div>
          <div class="action-card" onclick="navigateTo('reports')"><i class="fas fa-file-pdf"></i><span>Generate Report</span></div>
          <div class="action-card" onclick="navigateTo('audit-logs')"><i class="fas fa-search"></i><span>View Audit Logs</span></div>
          <div class="action-card" onclick="navigateTo('settings')"><i class="fas fa-sliders-h"></i><span>System Settings</span></div>
          <div class="action-card" onclick="navigateTo('security-center')"><i class="fas fa-lock"></i><span>Security Check</span></div>
        </div></div>
        <div class="recent-activities"><div class="section-header"><h3>Recent Activities</h3><span class="view-all" onclick="navigateTo('audit-logs')">View All <i class="fas fa-arrow-right"></i></span></div><div class="activity-list" id="dashActivityList"><p style="color:var(--text-light);">Loading activities...</p></div></div>
      `;

      // Load recent activities
      try {
        const actRes = await window.API.superAdmin.getRecentActivities(8);
        const activities = actRes.success ? (actRes.data || actRes.activities || []) : [];
        const actList = document.getElementById('dashActivityList');
        if (actList) {
          actList.innerHTML = activities.length > 0
            ? activities.map(a => `<div class="activity-item"><div class="activity-icon" style="background:${getActivityBg(a.type||a.activity_type)};"><i class="fas ${getActivityIcon(a.type||a.activity_type)}" style="color:${getActivityColor(a.type||a.activity_type)};"></i></div><div class="activity-info"><p><strong>${a.user || a.email || 'System'}</strong> - ${a.action || a.description}</p><span>${a.created_at ? new Date(a.created_at).toLocaleString() : ''}</span></div></div>`).join('')
            : '<p style="color:var(--text-light);">No recent activity</p>';
        }
      } catch (e) {}

    } catch (e) { console.error('Dashboard error:', e); pc.innerHTML = '<p style="text-align:center;color:var(--danger);">Error loading dashboard.</p>'; }
  }

  function getActivityBg(type) { const map = { citizen: '#dbeafe', document: '#dcfce7', payment: '#fef3c7', admin: '#fce7f3', security: '#fee2e2' }; return map[type] || '#dbeafe'; }
  function getActivityIcon(type) { const map = { citizen: 'fa-user-plus', document: 'fa-file-signature', payment: 'fa-money-check', admin: 'fa-user-cog', security: 'fa-shield-alt' }; return map[type] || 'fa-info-circle'; }
  function getActivityColor(type) { const map = { citizen: '#2563eb', document: '#16a34a', payment: '#d97706', admin: '#db2777', security: '#dc2626' }; return map[type] || '#2563eb'; }

  // ============================================================
  // ADMIN MANAGEMENT - FIXED DATA STRUCTURE
  // ============================================================
  async function loadAdminManagement() {
    const pc = document.getElementById('pageContent');
    pc.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading admins...</p></div>';
    try {
      console.log('📊 loadAdminManagement: Calling API...');
      const res = await window.API.superAdmin.getAdmins(currentAdminPage, itemsPerPage);
      console.log('📊 loadAdminManagement: Response:', res);
      
      if (res.success) {
        admins = res.data?.admins || res.admins || res.data || res.users || [];
        console.log('📊 loadAdminManagement: Admins found:', admins.length);
      } else {
        console.error('❌ loadAdminManagement: Failed:', res.message);
        pc.innerHTML = `<p style="text-align:center;color:var(--danger);">Error loading admins: ${res.message || 'Unknown error'}</p>`;
        return;
      }
      
      const totalPages = res.meta?.total_pages || Math.ceil((res.total || admins.length) / itemsPerPage);
      const wardsRes = await window.API.superAdmin.getWards();
      const wards = wardsRes.success ? (wardsRes.data?.wards || wardsRes.wards || wardsRes.data || []) : [];

      pc.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2>Admin Management</h2>
          <button class="btn btn-primary" onclick="showAddAdminModal()"><i class="fas fa-plus"></i> Add New Admin</button>
        </div>
        <div class="search-filter-bar">
          <input type="text" class="search-input" id="adminSearch" placeholder="Search admins..." oninput="filterAdmins()">
          <select class="filter-select" id="adminStatusFilter" onchange="filterAdmins()">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          <select class="filter-select" id="adminWardFilter" onchange="filterAdmins()">
            <option value="all">All Wards</option>
            ${wards.map(w => `<option value="${w.id}">${w.ward_name || w.name}</option>`).join('')}
          </select>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Photo</th>
                <th>Full Name</th>
                <th>Ward</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Position</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="adminTableBody">${renderAdminRows(admins)}</tbody>
          </table>
        </div>
        ${totalPages > 1 ? `<div class="pagination">
          <button ${currentAdminPage===1?'disabled':''} onclick="changeAdminPage(${currentAdminPage-1})"><i class="fas fa-chevron-left"></i> Previous</button>
          ${Array.from({length:totalPages},(_,i)=>`<button class="${currentAdminPage===i+1?'active':''}" onclick="changeAdminPage(${i+1})">${i+1}</button>`).join('')}
          <button ${currentAdminPage===totalPages?'disabled':''} onclick="changeAdminPage(${currentAdminPage+1})">Next <i class="fas fa-chevron-right"></i></button>
        </div>` : ''}
      `;
    } catch (e) { 
      console.error('❌ loadAdminManagement: Error:', e); 
      pc.innerHTML = `<p style="text-align:center;color:var(--danger);">Error loading admins: ${e.message}</p>`; 
    }
  }

  function renderAdminRows(adminList) {
    if (!adminList || adminList.length === 0) {
      return '<tr><td colspan="11" style="text-align:center;padding:30px;">No admins found</td></tr>';
    }
    
    return adminList.map((a, i) => {
      let photoUrl = a.profile_photo || a.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.full_name||a.name||'Admin')}&background=0066cc&color=fff&size=35`;
      
      // ✅ FIX: Add cache-busting for admin photos
      if (a.profile_photo) {
        const separator = photoUrl.includes('?') ? '&' : '?';
        photoUrl = photoUrl + `${separator}t=${Date.now()}`;
      }
      
      const status = a.status || 'active';
      return `<tr>
        <td>${(currentAdminPage-1)*itemsPerPage + i + 1}</td>
        <td><img src="${photoUrl}" style="border-radius:50%;width:35px;height:35px;object-fit:cover;"></td>
        <td><strong>${a.full_name || a.name || 'N/A'}</strong></td>
        <td>${a.ward_name || a.ward || 'N/A'}</td>
        <td>${a.email || 'N/A'}</td>
        <td>${a.phone || 'N/A'}</td>
        <td>${a.position_name || a.position || 'N/A'}</td>
        <td><span class="badge ${status==='active'?'badge-success':status==='suspended'?'badge-danger':'badge-warning'}">${status}</span></td>
        <td>${a.start_date ? new Date(a.start_date).toLocaleDateString() : 'N/A'}</td>
        <td>${a.end_date ? new Date(a.end_date).toLocaleDateString() : 'N/A'}</td>
        <td>
          <div style="display:flex;gap:4px;flex-wrap:wrap;">
            <button class="btn btn-sm btn-outline" onclick="viewAdmin(${a.id})"><i class="fas fa-eye"></i></button>
            <button class="btn btn-sm btn-primary" onclick="editAdmin(${a.id})"><i class="fas fa-edit"></i></button>
            ${status==='active' ? 
              `<button class="btn btn-sm btn-warning" onclick="suspendAdmin(${a.id})"><i class="fas fa-pause"></i></button>` : 
              `<button class="btn btn-sm btn-success" onclick="activateAdmin(${a.id})"><i class="fas fa-play"></i></button>`
            }
            <button class="btn btn-sm btn-outline" onclick="resetAdminPassword(${a.id})"><i class="fas fa-key"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deleteAdmin(${a.id})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  window.filterAdmins = function() {
    const search = (document.getElementById('adminSearch')?.value || '').toLowerCase();
    const status = document.getElementById('adminStatusFilter')?.value || 'all';
    const ward = document.getElementById('adminWardFilter')?.value || 'all';
    let filtered = [...admins];
    if (search) filtered = filtered.filter(a => (a.full_name||a.name||'').toLowerCase().includes(search) || (a.email||'').toLowerCase().includes(search));
    if (status !== 'all') filtered = filtered.filter(a => a.status === status);
    if (ward !== 'all') filtered = filtered.filter(a => (a.ward_id == ward || a.ward_name === ward || a.ward === ward));
    document.getElementById('adminTableBody').innerHTML = renderAdminRows(filtered.slice(0, itemsPerPage));
  };

  window.changeAdminPage = function(p) { currentAdminPage = p; loadAdminManagement(); };

  // ============================================================
  // VIEW ADMIN
  // ============================================================
  window.viewAdmin = function(id) {
    const a = admins.find(x => x.id == id);
    if (!a) {
      showToast('error', 'Admin not found');
      return;
    }
    let photo = a.profile_photo||a.photo||`https://ui-avatars.com/api/?name=${encodeURIComponent(a.full_name||a.name||'A')}&background=0066cc&color=fff&size=80`;
    
    // ✅ FIX: Add cache-busting
    if (a.profile_photo) {
      const separator = photo.includes('?') ? '&' : '?';
      photo = photo + `${separator}t=${Date.now()}`;
    }
    
    document.getElementById('viewModalContent').innerHTML = `
      <div class="modal-header"><h2>Admin Details</h2><button class="modal-close" onclick="closeModal('viewModal')">&times;</button></div>
      <div class="modal-body">
        <div style="text-align:center;"><img src="${photo}" style="border-radius:50%;width:80px;height:80px;"><h3>${a.full_name||a.name}</h3></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <p><strong>Email:</strong> ${a.email}</p>
          <p><strong>Phone:</strong> ${a.phone}</p>
          <p><strong>Ward:</strong> ${a.ward_name||a.ward}</p>
          <p><strong>Position:</strong> ${a.position_name||a.position}</p>
          <p><strong>Start:</strong> ${a.start_date ? new Date(a.start_date).toLocaleDateString() : 'N/A'}</p>
          <p><strong>End:</strong> ${a.end_date ? new Date(a.end_date).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    `;
    document.getElementById('viewModal').classList.add('active');
  };

  // ============================================================
  // EDIT ADMIN - FIXED: Loads positions from backend with IDs
  // ============================================================
  window.editAdmin = function(id) {
    const a = admins.find(x => x.id == id);
    if (!a) {
      showToast('error', 'Admin not found');
      return;
    }
    
    tempAdminPhoto = null;
    const modal = document.getElementById('formModal');
    const content = document.getElementById('formModalContent');
    
    // Load wards AND positions from backend
    Promise.all([
      window.API.superAdmin.getWards(),
      window.API.superAdmin.getPositions()
    ]).then(([wRes, pRes]) => {
      const wards = wRes.success ? (wRes.data?.wards || wRes.wards || wRes.data || []) : [];
      const positions = pRes.success ? (pRes.data?.positions || pRes.positions || pRes.data || []) : [];
      
      console.log('📊 Positions loaded:', positions);
      
      let wardsHTML = wards.map(w => 
        `<option value="${w.id}" ${w.id == a.ward_id ? 'selected' : ''}>${w.ward_name || w.name}</option>`
      ).join('');
      
      let positionsHTML = positions.map(p => 
        `<option value="${p.id}" ${p.id == a.position_id ? 'selected' : ''}>${p.position_name || p.name}</option>`
      ).join('');
      
      // If no positions found, add default options
      if (!positionsHTML) {
        positionsHTML = `
          <option value="1" ${a.position_id == 1 ? 'selected' : ''}>Ward Officer</option>
          <option value="2" ${a.position_id == 2 ? 'selected' : ''}>Local Administrator</option>
          <option value="3" ${a.position_id == 3 ? 'selected' : ''}>Executive Officer</option>
          <option value="4" ${a.position_id == 4 ? 'selected' : ''}>Secretary</option>
          <option value="5" ${a.position_id == 5 ? 'selected' : ''}>Chairperson</option>
        `;
      }
      
      // ✅ FIX: Add cache-busting to existing photo
      let existingPhoto = a.profile_photo || '';
      if (existingPhoto) {
        const separator = existingPhoto.includes('?') ? '&' : '?';
        existingPhoto = existingPhoto + `${separator}t=${Date.now()}`;
      }
      
      content.innerHTML = `
        <div class="modal-header">
          <h2><i class="fas fa-user-edit"></i> Edit Admin</h2>
          <button class="modal-close" onclick="closeModal('formModal')">&times;</button>
        </div>
        <div class="modal-body">
          <div class="photo-upload-wrapper">
            <div class="photo-preview-container">
              <img id="adminPhotoPreview" class="photo-preview" src="${existingPhoto}" style="${a.profile_photo ? 'display:block;' : 'display:none;'}">
              <div class="photo-placeholder" id="adminPhotoPlaceholder" onclick="document.getElementById('adminPhotoInput').click()" style="${a.profile_photo ? 'display:none;' : ''}">
                <i class="fas fa-camera"></i>
                <span>Upload Photo</span>
              </div>
            </div>
            <input type="file" id="adminPhotoInput" class="photo-file-input" accept=".jpg,.jpeg,.png" onchange="previewAdminPhoto(event)">
            <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('adminPhotoInput').click()">
              <i class="fas fa-image"></i> Change Photo
            </button>
            <small style="display:block;color:var(--text-light);margin-top:4px;">JPG/PNG (optional)</small>
          </div>
          <div class="form-group"><label>Full Name *</label><input type="text" id="adminName" value="${a.full_name || ''}" required></div>
          <div class="form-group"><label>Email *</label><input type="email" id="adminEmail" value="${a.email || ''}" required></div>
          <div class="form-group"><label>Phone *</label><input type="tel" id="adminPhone" value="${a.phone || ''}" required></div>
          <div class="form-group">
            <label>Ward *</label>
            <select id="adminWard" required>
              <option value="">Select Ward</option>
              ${wardsHTML}
            </select>
          </div>
          <div class="form-group">
            <label>Position *</label>
            <select id="adminPosition" required>
              <option value="">Select Position</option>
              ${positionsHTML}
            </select>
          </div>
          <div class="form-group"><label>Start Date *</label><input type="date" id="adminStartDate" value="${a.start_date ? a.start_date.split('T')[0] : ''}" required></div>
          <div class="form-group"><label>End Date *</label><input type="date" id="adminEndDate" value="${a.end_date ? a.end_date.split('T')[0] : ''}" required></div>
          <div class="form-group">
            <label>Status</label>
            <select id="adminStatus">
              <option value="active" ${a.status === 'active' ? 'selected' : ''}>Active</option>
              <option value="inactive" ${a.status === 'inactive' ? 'selected' : ''}>Inactive</option>
              <option value="suspended" ${a.status === 'suspended' ? 'selected' : ''}>Suspended</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('formModal')">Cancel</button>
          <button class="btn btn-primary" onclick="saveEditAdmin(${id})"><i class="fas fa-save"></i> Update Admin</button>
        </div>
      `;
      modal.classList.add('active');
    }).catch((e) => {
      console.error('❌ Error loading data:', e);
      showToast('error', 'Failed to load form data');
    });
  };

  // ============================================================
  // SAVE EDIT ADMIN - FIXED: Sends numeric position ID
  // ============================================================
  window.saveEditAdmin = async function(id) {
    const name = document.getElementById('adminName').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    const phone = document.getElementById('adminPhone').value.trim();
    const ward = document.getElementById('adminWard').value;
    const positionId = document.getElementById('adminPosition').value;
    const startDate = document.getElementById('adminStartDate').value;
    const endDate = document.getElementById('adminEndDate').value;
    const status = document.getElementById('adminStatus').value;

    if (!name || !email || !phone || !ward || !positionId || !startDate || !endDate) {
      showToast('error', 'All fields required');
      return;
    }
    if (endDate < startDate) {
      showToast('error', 'End date before start date');
      return;
    }

    console.log('📊 Sending update data:', {
      full_name: name,
      email: email,
      phone: phone,
      ward_id: parseInt(ward),
      position_id: parseInt(positionId),
      start_date: startDate,
      end_date: endDate,
      status: status
    });

    const fd = new FormData();
    fd.append('full_name', name);
    fd.append('email', email);
    fd.append('phone', phone);
    fd.append('ward_id', parseInt(ward));
    fd.append('position_id', parseInt(positionId));
    fd.append('start_date', startDate);
    fd.append('end_date', endDate);
    fd.append('status', status);
    fd.append('performed_by', session.id || 1);

    const photoInput = document.getElementById('adminPhotoInput');
    if (photoInput.files[0]) fd.append('profile_photo', photoInput.files[0]);

    try {
      const res = await window.API.superAdmin.updateAdmin(id, fd);
      console.log('📊 Update response:', res);
      
      if (res.success) {
        showToast('success', 'Admin updated successfully!');
        closeModal('formModal');
        loadAdminManagement();
      } else {
        showToast('error', res.message || 'Failed to update admin');
        console.error('❌ Update failed:', res);
      }
    } catch (e) {
      console.error('❌ Update admin error:', e);
      showToast('error', 'Error: ' + (e.message || 'Unknown error'));
    }
  };

  // ============================================================
  // ADMIN ACTIONS
  // ============================================================
  window.suspendAdmin = function(id) { 
    showConfirm('Suspend Admin', 'Suspend this admin?', async () => { 
      try { 
        await window.API.superAdmin.suspendAdmin(id); 
        showToast('warning', 'Suspended'); 
        loadAdminManagement(); 
      } catch(e){} 
    }); 
  };

  window.activateAdmin = function(id) { 
    showConfirm('Activate Admin', 'Activate this admin?', async () => { 
      try { 
        await window.API.superAdmin.activateAdmin(id); 
        showToast('success', 'Activated'); 
        loadAdminManagement(); 
      } catch(e){} 
    }); 
  };

  // ============================================================
  // RESET ADMIN PASSWORD - WITH EMAIL NOTIFICATION
  // ============================================================
  window.resetAdminPassword = function(id) {
    const a = admins.find(x => x.id == id);
    if (!a) {
      showToast('error', 'Admin not found');
      return;
    }
    
    const tempPassword = generateTempPassword();
    
    showConfirm(
      'Reset Password', 
      `Reset password for ${a.full_name || a.name}? They will receive an email with the new password.`,
      async () => { 
        try {
          showToast('info', 'Resetting password...');
          
          const res = await window.API.superAdmin.resetAdminPassword(id, tempPassword);
          console.log('📊 Reset password response:', res);
          
          if (res.success) {
            showToast('success', 'Password reset successfully!');
            if (res.data?.email_sent) {
              showToast('success', 'Email notification sent to admin');
            } else if (res.temporary_password) {
              showToast('warning', `Temporary password: ${res.temporary_password}`);
            } else {
              showToast('warning', `Email not sent. Temporary password: ${tempPassword}`);
            }
            loadAdminManagement();
          } else {
            showToast('error', res.message || 'Failed to reset password');
          }
        } catch(e) {
          console.error('❌ Reset password error:', e);
          showToast('error', 'Failed to reset password: ' + e.message);
        }
      }
    );
  };

  window.deleteAdmin = function(id) { 
    showConfirm('Delete Admin', 'Permanently remove this admin?', async () => { 
      try { 
        await window.API.superAdmin.deleteAdmin(id); 
        showToast('success', 'Removed'); 
        loadAdminManagement(); 
      } catch(e){} 
    }); 
  };

  // ============================================================
  // ADD ADMIN MODAL
  // ============================================================
  window.showAddAdminModal = async function() {
    tempAdminPhoto = null;
    const modal = document.getElementById('formModal');
    const content = document.getElementById('formModalContent');
    let wardsHTML = '<option value="">Select Ward</option>';
    let positionsHTML = '<option value="">Select Position</option>';
    
    try {
      const [wRes, pRes] = await Promise.all([
        window.API.superAdmin.getWards(),
        window.API.superAdmin.getPositions()
      ]);
      
      const wards = wRes.success ? (wRes.data?.wards || wRes.wards || wRes.data || []) : [];
      const positions = pRes.success ? (pRes.data?.positions || pRes.positions || pRes.data || []) : [];
      
      wardsHTML += wards.map(w => `<option value="${w.id}">${w.ward_name || w.name}</option>`).join('');
      
      if (positions.length > 0) {
        positionsHTML += positions.map(p => `<option value="${p.id}">${p.position_name || p.name}</option>`).join('');
      } else {
        positionsHTML += '<option value="1">Ward Officer</option><option value="2">Local Administrator</option><option value="3">Executive Officer</option><option value="4">Secretary</option><option value="5">Chairperson</option>';
      }
    } catch (e) {
      console.error('Error loading form data:', e);
    }

    content.innerHTML = `
      <div class="modal-header"><h2><i class="fas fa-user-plus"></i> Add New Admin</h2><button class="modal-close" onclick="closeModal('formModal')">&times;</button></div>
      <div class="modal-body">
        <div class="photo-upload-wrapper">
          <div class="photo-preview-container"><img id="adminPhotoPreview" class="photo-preview" src="" style="display:none;"><div class="photo-placeholder" id="adminPhotoPlaceholder" onclick="document.getElementById('adminPhotoInput').click()"><i class="fas fa-camera"></i><span>Upload Photo</span></div></div>
          <input type="file" id="adminPhotoInput" class="photo-file-input" accept=".jpg,.jpeg,.png" onchange="previewAdminPhoto(event)">
          <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('adminPhotoInput').click()"><i class="fas fa-image"></i> Choose Photo</button>
          <small style="display:block;color:var(--text-light);margin-top:4px;">JPG/PNG (optional)</small>
        </div>
        <div class="form-group"><label>Full Name *</label><input type="text" id="adminName" required></div>
        <div class="form-group"><label>Email *</label><input type="email" id="adminEmail" required></div>
        <div class="form-group"><label>Phone *</label><input type="tel" id="adminPhone" required></div>
        <div class="form-group"><label>Ward *</label><select id="adminWard" required>${wardsHTML}</select></div>
        <div class="form-group"><label>Position *</label><select id="adminPosition" required>${positionsHTML}</select></div>
        <div class="form-group"><label>Start Date *</label><input type="date" id="adminStartDate" required></div>
        <div class="form-group"><label>End Date *</label><input type="date" id="adminEndDate" required></div>
        <div class="form-group"><label>Status</label><select id="adminStatus"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
      </div>
      <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('formModal')">Cancel</button><button class="btn btn-primary" onclick="saveNewAdmin()"><i class="fas fa-save"></i> Save Admin</button></div>
    `;
    modal.classList.add('active');
  };

  window.previewAdminPhoto = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!['image/jpeg','image/jpg','image/png'].includes(file.type)) return showToast('error','JPG/PNG only');
    if (file.size > 5*1024*1024) return showToast('error','Max 5MB');
    const reader = new FileReader();
    reader.onload = function(e) {
      tempAdminPhoto = e.target.result;
      document.getElementById('adminPhotoPreview').src = e.target.result;
      document.getElementById('adminPhotoPreview').style.display = 'block';
      document.getElementById('adminPhotoPlaceholder').style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  window.saveNewAdmin = async function() {
    const name = document.getElementById('adminName').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    const phone = document.getElementById('adminPhone').value.trim();
    const ward = document.getElementById('adminWard').value;
    const position = document.getElementById('adminPosition').value;
    const startDate = document.getElementById('adminStartDate').value;
    const endDate = document.getElementById('adminEndDate').value;
    const status = document.getElementById('adminStatus').value;

    if (!name||!email||!phone||!ward||!position||!startDate||!endDate) return showToast('error','All fields required');
    if (endDate < startDate) return showToast('error','End date before start date');

    const fd = new FormData();
    fd.append('full_name', name);
    fd.append('email', email);
    fd.append('phone', phone);
    fd.append('ward_id', ward);
    fd.append('position_id', position);
    fd.append('start_date', startDate);
    fd.append('end_date', endDate);
    fd.append('status', status||'active');
    fd.append('performed_by', session.id||1);

    const photoInput = document.getElementById('adminPhotoInput');
    if (photoInput.files[0]) fd.append('profile_photo', photoInput.files[0]);

    try {
      const res = await window.API.superAdmin.createAdmin(fd);
      if (res.success) {
        showToast('success','Admin created!');
        closeModal('formModal');
        loadAdminManagement();
      } else showToast('error', res.message||'Failed');
    } catch (e) { showToast('error','Network error'); }
  };

  // ============================================================
  // CITIZEN MONITORING - FIXED DATA STRUCTURE
  // ============================================================
  async function loadCitizenMonitoring() {
    const pc = document.getElementById('pageContent');
    pc.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading citizens...</p></div>';
    try {
      console.log('📊 loadCitizenMonitoring: Calling API...');
      const res = await window.API.superAdmin.getCitizens(currentCitizenPage, itemsPerPage);
      console.log('📊 loadCitizenMonitoring: Response:', res);
      
      if (res.success) {
        citizens = res.data?.citizens || res.citizens || res.data || [];
        console.log('📊 loadCitizenMonitoring: Citizens found:', citizens.length);
      } else {
        console.error('❌ loadCitizenMonitoring: Failed:', res.message);
        pc.innerHTML = `<p style="text-align:center;color:var(--danger);">Error loading citizens: ${res.message || 'Unknown error'}</p>`;
        return;
      }
      
      const totalPages = res.meta?.total_pages || Math.ceil((res.total || citizens.length) / itemsPerPage);
      const wardsRes = await window.API.superAdmin.getWards();
      const wards = wardsRes.success ? (wardsRes.data?.wards || wardsRes.wards || wardsRes.data || []) : [];
      const statsRes = await window.API.superAdmin.getCitizenStats();
      const stats = statsRes.success ? (statsRes.data || statsRes.statistics || {}) : {};

      pc.innerHTML = `
        <h2 style="margin-bottom:20px;">Citizen Monitoring</h2>
        <div class="stats-grid" style="margin-bottom:20px;">
          <div class="stat-card"><div class="stat-icon" style="background:#dcfce7;"><i class="fas fa-users" style="color:#16a34a;"></i></div><div class="stat-info"><h3>Total Citizens</h3><p class="stat-number">${(stats.total_citizens || citizens.length).toLocaleString()}</p></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:#e0f2fe;"><i class="fas fa-user-check" style="color:#0284c7;"></i></div><div class="stat-info"><h3>Active Citizens</h3><p class="stat-number">${(stats.active_citizens || 0).toLocaleString()}</p></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><i class="fas fa-user-clock" style="color:#d97706;"></i></div><div class="stat-info"><h3>Inactive Citizens</h3><p class="stat-number">${(stats.inactive_citizens || 0).toLocaleString()}</p></div></div>
        </div>
        <div class="search-filter-bar">
          <input type="text" class="search-input" id="citizenSearch" placeholder="Search by name, ID, or email..." oninput="filterCitizens()">
          <select class="filter-select" id="citizenStatusFilter" onchange="filterCitizens()">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select class="filter-select" id="citizenWardFilter" onchange="filterCitizens()">
            <option value="all">All Wards</option>
            ${wards.map(w => `<option value="${w.id}">${w.ward_name || w.name}</option>`).join('')}
          </select>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Citizen ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Ward</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="citizenTableBody">
              ${citizens.map(c => `
                <tr>
                  <td><strong>${c.id || c.citizen_id || 'N/A'}</strong></td>
                  <td>${c.full_name || c.name || 'N/A'}</td>
                  <td>${c.email || 'N/A'}</td>
                  <td>${c.phone || 'N/A'}</td>
                  <td><span class="badge badge-info">${c.ward_name || c.ward || 'N/A'}</span></td>
                  <td><span class="badge ${(c.status || 'active') === 'active' ? 'badge-success' : 'badge-warning'}">${c.status || 'active'}</span></td>
                  <td>${c.registration_date ? new Date(c.registration_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button class="btn btn-sm btn-outline" onclick="viewCitizen('${c.id || c.citizen_id}')">
                      <i class="fas fa-eye"></i> View
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${totalPages > 1 ? `<div class="pagination">
          <button ${currentCitizenPage===1?'disabled':''} onclick="changeCitizenPage(${currentCitizenPage-1})">Previous</button>
          ${Array.from({length:totalPages},(_,i)=>`<button class="${currentCitizenPage===i+1?'active':''}" onclick="changeCitizenPage(${i+1})">${i+1}</button>`).join('')}
          <button ${currentCitizenPage===totalPages?'disabled':''} onclick="changeCitizenPage(${currentCitizenPage+1})">Next</button>
        </div>` : ''}
      `;
    } catch (e) { 
      console.error('❌ loadCitizenMonitoring: Error:', e); 
      pc.innerHTML = `<p style="text-align:center;color:var(--danger);">Error loading citizens: ${e.message}</p>`; 
    }
  }

  window.filterCitizens = function() {
    const search = (document.getElementById('citizenSearch')?.value || '').toLowerCase();
    const status = document.getElementById('citizenStatusFilter')?.value || 'all';
    const ward = document.getElementById('citizenWardFilter')?.value || 'all';
    let filtered = [...citizens];
    if (search) filtered = filtered.filter(c => (c.full_name||c.name||'').toLowerCase().includes(search) || (c.email||'').toLowerCase().includes(search) || (c.id||'').toString().includes(search));
    if (status !== 'all') filtered = filtered.filter(c => c.status === status);
    if (ward !== 'all') filtered = filtered.filter(c => c.ward_id == ward || c.ward_name === ward || c.ward === ward);
    document.getElementById('citizenTableBody').innerHTML = filtered.slice(0, itemsPerPage).map(c => `
      <tr>
        <td><strong>${c.id || c.citizen_id || 'N/A'}</strong></td>
        <td>${c.full_name || c.name || 'N/A'}</td>
        <td>${c.email || 'N/A'}</td>
        <td>${c.phone || 'N/A'}</td>
        <td><span class="badge badge-info">${c.ward_name || c.ward || 'N/A'}</span></td>
        <td><span class="badge ${(c.status || 'active') === 'active' ? 'badge-success' : 'badge-warning'}">${c.status || 'active'}</span></td>
        <td>${c.registration_date ? new Date(c.registration_date).toLocaleDateString() : 'N/A'}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="viewCitizen('${c.id || c.citizen_id}')">
            <i class="fas fa-eye"></i> View
          </button>
        </td>
      </tr>
    `).join('');
  };

  window.viewCitizen = function(id) {
    const c = citizens.find(x => x.id == id || x.citizen_id == id);
    if (!c) {
      showToast('error', 'Citizen not found');
      return;
    }
    document.getElementById('viewModalContent').innerHTML = `
      <div class="modal-header"><h2>Citizen Details</h2><button class="modal-close" onclick="closeModal('viewModal')">&times;</button></div>
      <div class="modal-body">
        <div style="text-align:center;margin-bottom:20px;">
          <h3>${c.full_name || c.name}</h3>
          <span class="badge ${(c.status || 'active') === 'active' ? 'badge-success' : 'badge-warning'}">${c.status || 'active'}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <p><strong>ID:</strong> ${c.id || c.citizen_id}</p>
          <p><strong>Email:</strong> ${c.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${c.phone || 'N/A'}</p>
          <p><strong>Ward:</strong> ${c.ward_name || c.ward || 'N/A'}</p>
          <p><strong>Status:</strong> ${c.status || 'active'}</p>
          <p><strong>Registered:</strong> ${c.registration_date ? new Date(c.registration_date).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    `;
    document.getElementById('viewModal').classList.add('active');
  };

  window.changeCitizenPage = function(p) { currentCitizenPage = p; loadCitizenMonitoring(); };

  // ============================================================
  // AUDIT LOGS
  // ============================================================
  async function loadAuditLogs() {
    const pc = document.getElementById('pageContent');
    pc.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading audit logs...</p></div>';
    try {
      const res = await window.API.superAdmin.getAuditLogs(currentAuditPage, itemsPerPage);
      auditLogs = res.success ? (res.data?.logs || res.logs || res.data || []) : [];
      const totalPages = res.meta?.total_pages || Math.ceil((res.total || auditLogs.length) / itemsPerPage);

      pc.innerHTML = `
        <h2 style="margin-bottom:20px;">Audit Logs</h2>
        <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:20px;">
          <div class="stat-card"><div class="stat-icon" style="background:#e0f2fe;"><i class="fas fa-list" style="color:#0284c7;"></i></div><div class="stat-info"><h3>Total Logs</h3><p class="stat-number">${auditLogs.length}</p></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:#dcfce7;"><i class="fas fa-check-circle" style="color:#16a34a;"></i></div><div class="stat-info"><h3>Success</h3><p class="stat-number">${auditLogs.filter(l=>l.status==='success').length}</p></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><i class="fas fa-exclamation-triangle" style="color:#d97706;"></i></div><div class="stat-info"><h3>Warnings</h3><p class="stat-number">${auditLogs.filter(l=>l.status==='warning').length}</p></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:#fee2e2;"><i class="fas fa-times-circle" style="color:#dc2626;"></i></div><div class="stat-info"><h3>Errors</h3><p class="stat-number">${auditLogs.filter(l=>l.status==='error').length}</p></div></div>
        </div>
        <div class="search-filter-bar">
          <input type="text" class="search-input" id="auditSearch" placeholder="Search logs..." oninput="filterAuditLogs()">
          <select class="filter-select" id="auditTypeFilter" onchange="filterAuditLogs()"><option value="all">All Types</option><option value="citizen">Citizen</option><option value="document">Document</option><option value="payment">Payment</option><option value="admin">Admin</option><option value="security">Security</option></select>
          <select class="filter-select" id="auditStatusFilter" onchange="filterAuditLogs()"><option value="all">All Status</option><option value="success">Success</option><option value="warning">Warning</option><option value="error">Error</option></select>
          <button class="btn btn-outline" onclick="exportAuditCSV()"><i class="fas fa-download"></i> Export CSV</button>
          <button class="btn btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
        </div>
        <div class="table-container"><table><thead><tr><th>#</th><th>User</th><th>Role</th><th>Action</th><th>Type</th><th>Date</th><th>Time</th><th>Status</th></tr></thead><tbody id="auditTableBody">${auditLogs.map((l,i) => `<tr><td>${(currentAuditPage-1)*itemsPerPage+i+1}</td><td><strong>${l.user||l.email||'N/A'}</strong></td><td>${l.role||'N/A'}</td><td>${l.action||l.description||'N/A'}</td><td><span class="badge badge-info">${l.type||l.entity_type||'N/A'}</span></td><td>${l.date||(l.created_at?l.created_at.split('T')[0]:'N/A')}</td><td>${l.time||(l.created_at?new Date(l.created_at).toLocaleTimeString():'N/A')}</td><td><span class="badge ${l.status==='success'?'badge-success':l.status==='warning'?'badge-warning':'badge-danger'}">${l.status||'N/A'}</span></td></tr>`).join('')}</tbody></table></div>
        ${totalPages > 1 ? `<div class="pagination"><button ${currentAuditPage===1?'disabled':''} onclick="changeAuditPage(${currentAuditPage-1})">Previous</button>${Array.from({length:totalPages},(_,i)=>`<button class="${currentAuditPage===i+1?'active':''}" onclick="changeAuditPage(${i+1})">${i+1}</button>`).join('')}<button ${currentAuditPage===totalPages?'disabled':''} onclick="changeAuditPage(${currentAuditPage+1})">Next</button></div>` : ''}
      `;
    } catch (e) { console.error('Audit error:', e); pc.innerHTML = '<p style="text-align:center;color:var(--danger);">Error loading audit logs.</p>'; }
  }

  window.filterAuditLogs = function() {
    const search = (document.getElementById('auditSearch')?.value || '').toLowerCase();
    const type = document.getElementById('auditTypeFilter')?.value || 'all';
    const status = document.getElementById('auditStatusFilter')?.value || 'all';
    let filtered = [...auditLogs];
    if (search) filtered = filtered.filter(l => (l.user||l.email||'').toLowerCase().includes(search) || (l.action||l.description||'').toLowerCase().includes(search));
    if (type !== 'all') filtered = filtered.filter(l => l.type === type || l.entity_type === type);
    if (status !== 'all') filtered = filtered.filter(l => l.status === status);
    document.getElementById('auditTableBody').innerHTML = filtered.slice(0, itemsPerPage).map((l,i) => `<tr><td>${i+1}</td><td><strong>${l.user||l.email||'N/A'}</strong></td><td>${l.role||'N/A'}</td><td>${l.action||l.description||'N/A'}</td><td><span class="badge badge-info">${l.type||l.entity_type||'N/A'}</span></td><td>${l.date||(l.created_at?l.created_at.split('T')[0]:'N/A')}</td><td>${l.time||(l.created_at?new Date(l.created_at).toLocaleTimeString():'N/A')}</td><td><span class="badge ${l.status==='success'?'badge-success':l.status==='warning'?'badge-warning':'badge-danger'}">${l.status||'N/A'}</span></td></tr>`).join('');
  };

  window.exportAuditCSV = function() {
    const csv = 'User,Role,Action,Type,Date,Time,Status\n' + auditLogs.map(l => `"${l.user||l.email||''}","${l.role||''}","${l.action||l.description||''}","${l.type||''}","${l.date||''}","${l.time||''}","${l.status||''}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'lams_audit_logs.csv'; a.click(); URL.revokeObjectURL(url);
    showToast('success', 'CSV exported!');
  };

  window.changeAuditPage = function(p) { currentAuditPage = p; loadAuditLogs(); };

  // ============================================================
  // REPORTS - FULLY FIXED WITH FIXED URL CONSTRUCTION
  // ============================================================
  async function loadReports() {
    const pc = document.getElementById('pageContent');
    pc.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading reports...</p></div>';
    try {
      const [statsRes, wardsRes] = await Promise.all([
        window.API.superAdmin.getDashboard(),
        window.API.superAdmin.getWards()
      ]);
      const stats = statsRes.success ? (statsRes.data?.summary_cards || statsRes.data || {}) : {};
      const wards = wardsRes.success ? (wardsRes.data?.wards || wardsRes.wards || wardsRes.data || []) : [];

      pc.innerHTML = `
        <h2 style="margin-bottom:20px;">System Reports</h2>
        <div class="chart-container"><h3 style="margin-bottom:15px;">Citizens & Admins Overview</h3><canvas id="overviewChart" height="80"></canvas></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-bottom:25px;">
          <div class="settings-card" style="cursor:pointer;text-align:center;" onclick="generateReport('citizens')"><i class="fas fa-users" style="font-size:2.5rem;color:#0284c7;"></i><h3>Citizen Report</h3><p style="color:var(--text-light);">${stats.total_citizens||0} records</p><button class="btn btn-primary btn-full" style="margin-top:10px;"><i class="fas fa-download"></i> Generate PDF</button></div>
          <div class="settings-card" style="cursor:pointer;text-align:center;" onclick="generateReport('admins')"><i class="fas fa-user-tie" style="font-size:2.5rem;color:#16a34a;"></i><h3>Admin Report</h3><p style="color:var(--text-light);">${stats.total_admins||0} records</p><button class="btn btn-primary btn-full" style="margin-top:10px;"><i class="fas fa-download"></i> Generate PDF</button></div>
          <div class="settings-card" style="cursor:pointer;text-align:center;" onclick="generateReport('audit')"><i class="fas fa-history" style="font-size:2.5rem;color:#d97706;"></i><h3>Audit Report</h3><p style="color:var(--text-light);">${stats.total_audit_logs||0} records</p><button class="btn btn-primary btn-full" style="margin-top:10px;"><i class="fas fa-download"></i> Generate PDF</button></div>
          <div class="settings-card" style="cursor:pointer;text-align:center;" onclick="generateFullSystemReport()"><i class="fas fa-file-pdf" style="font-size:2.5rem;color:#db2777;"></i><h3>Full System Report</h3><p style="color:var(--text-light);">Complete overview</p><button class="btn btn-primary btn-full" style="margin-top:10px;"><i class="fas fa-download"></i> Generate PDF</button></div>
        </div>
        <div style="display:flex;gap:10px;"><button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Print Page</button></div>
      `;

      setTimeout(() => {
        const ctx = document.getElementById('overviewChart');
        if (ctx && typeof Chart !== 'undefined' && wards.length > 0) {
          new Chart(ctx, { type: 'bar', data: { labels: wards.map(w => w.ward_name||w.name), datasets: [{ label: 'Citizens per Ward', data: wards.map(() => Math.floor(Math.random()*100)), backgroundColor: ['#0284c7','#16a34a','#d97706','#4f46e5','#db2777'] }] }, options: { responsive: true, plugins: { legend: { display: false } } } });
        }
      }, 300);
    } catch (e) { console.error('Reports error:', e); }
  }

  // ============================================================
  // GENERATE REPORT - FIXED URL CONSTRUCTION
  // ============================================================
  window.generateReport = async function(type) {
    try {
      showToast('info', 'Generating report...');
      
      let res;
      if (type === 'citizens') {
        res = await window.API.superAdmin.generateCitizenReport({});
      } else if (type === 'admins') {
        res = await window.API.superAdmin.generateAdminReport({});
      } else if (type === 'audit') {
        res = await window.API.superAdmin.generateAuditReport({});
      } else {
        showToast('error', 'Invalid report type');
        return;
      }
      
      console.log('📊 Report response:', res);
      
      if (!res.success) {
        showToast('error', res.message || 'Failed to generate report');
        return;
      }
      
      let downloadUrl = null;
      let fileName = null;
      let reportId = null;
      
      if (res.data) {
        if (res.data.download_url) {
          downloadUrl = res.data.download_url;
          fileName = res.data.file_name || `${type}_report.pdf`;
          reportId = res.data.report_id;
        } else if (res.data.file_path) {
          downloadUrl = res.data.file_path;
          fileName = res.data.file_name || `${type}_report.pdf`;
          reportId = res.data.report_id;
        } else if (res.data.url) {
          downloadUrl = res.data.url;
          fileName = res.data.file_name || `${type}_report.pdf`;
          reportId = res.data.report_id;
        }
      }
      
      if (!downloadUrl) {
        if (res.download_url) {
          downloadUrl = res.download_url;
          fileName = res.file_name || `${type}_report.pdf`;
          reportId = res.report_id;
        } else if (res.file_path) {
          downloadUrl = res.file_path;
          fileName = res.file_name || `${type}_report.pdf`;
          reportId = res.report_id;
        }
      }
      
      if (downloadUrl) {
        let fullUrl = downloadUrl;
        
        if (downloadUrl.startsWith('/api/')) {
          fullUrl = `${BASE_URL}${downloadUrl}?t=${Date.now()}`;
        } else if (downloadUrl.startsWith('http')) {
          const separator = downloadUrl.includes('?') ? '&' : '?';
          fullUrl = `${downloadUrl}${separator}t=${Date.now()}`;
        } else {
          fullUrl = `${API_URL}${downloadUrl}?t=${Date.now()}`;
        }
        
        console.log('📊 Download URL:', fullUrl);
        
        const newWindow = window.open(fullUrl, '_blank');
        if (!newWindow || newWindow.closed) {
          const a = document.createElement('a');
          a.href = fullUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        showToast('success', 'Report generated and downloading!');
      } else if (reportId) {
        const fullUrl = `${BASE_URL}/api/super-admin/reports/download/${reportId}?t=${Date.now()}`;
        console.log('📊 Constructed download URL from report_id:', fullUrl);
        
        const newWindow = window.open(fullUrl, '_blank');
        if (!newWindow || newWindow.closed) {
          const a = document.createElement('a');
          a.href = fullUrl;
          a.download = `${type}_report_${Date.now()}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        showToast('success', 'Report generated and downloading!');
      } else {
        console.log('📊 Report data (no download URL):', res.data);
        showToast('warning', 'Report generated but no download URL found. Check console for data.');
        
        if (res.data && typeof res.data === 'object') {
          try {
            if (res.data.pdfContent || res.data.content) {
              const content = res.data.pdfContent || res.data.content;
              if (typeof content === 'string' && content.length > 100) {
                const byteCharacters = atob(content);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${type}_report_${Date.now()}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('success', 'Report downloaded!');
                return;
              }
            }
            
            const jsonStr = JSON.stringify(res.data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_report_data_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('info', 'Report data downloaded as JSON');
          } catch (e) {
            console.error('❌ Could not create download:', e);
            showToast('error', 'Could not download report data');
          }
        }
      }
    } catch (e) {
      console.error('❌ Generate report error:', e);
      showToast('error', 'Failed to generate report: ' + e.message);
    }
  };

  // ============================================================
  // GENERATE FULL SYSTEM REPORT - FIXED URL CONSTRUCTION
  // ============================================================
  window.generateFullSystemReport = async function() {
    try {
      showToast('info', 'Generating full system report...');
      const res = await window.API.superAdmin.generateFullReport();
      console.log('📊 Full report response:', res);
      
      if (!res.success) {
        showToast('error', res.message || 'Failed to generate full report');
        return;
      }
      
      let downloadUrl = null;
      let fileName = null;
      let reportId = null;
      
      if (res.data) {
        if (res.data.download_url) {
          downloadUrl = res.data.download_url;
          fileName = res.data.file_name || 'full_system_report.pdf';
          reportId = res.data.report_id;
        } else if (res.data.file_path) {
          downloadUrl = res.data.file_path;
          fileName = res.data.file_name || 'full_system_report.pdf';
          reportId = res.data.report_id;
        } else if (res.data.url) {
          downloadUrl = res.data.url;
          fileName = res.data.file_name || 'full_system_report.pdf';
          reportId = res.data.report_id;
        }
      }
      
      if (!downloadUrl) {
        if (res.download_url) {
          downloadUrl = res.download_url;
          fileName = res.file_name || 'full_system_report.pdf';
          reportId = res.report_id;
        } else if (res.file_path) {
          downloadUrl = res.file_path;
          fileName = res.file_name || 'full_system_report.pdf';
          reportId = res.report_id;
        }
      }
      
      if (downloadUrl) {
        let fullUrl = downloadUrl;
        
        if (downloadUrl.startsWith('/api/')) {
          fullUrl = `${BASE_URL}${downloadUrl}?t=${Date.now()}`;
        } else if (downloadUrl.startsWith('http')) {
          const separator = downloadUrl.includes('?') ? '&' : '?';
          fullUrl = `${downloadUrl}${separator}t=${Date.now()}`;
        } else {
          fullUrl = `${API_URL}${downloadUrl}?t=${Date.now()}`;
        }
        
        console.log('📊 Download URL:', fullUrl);
        
        const newWindow = window.open(fullUrl, '_blank');
        if (!newWindow || newWindow.closed) {
          const a = document.createElement('a');
          a.href = fullUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        showToast('success', 'Full system report generated and downloading!');
      } else if (reportId) {
        const fullUrl = `${BASE_URL}/api/super-admin/reports/download/${reportId}?t=${Date.now()}`;
        console.log('📊 Constructed download URL from report_id:', fullUrl);
        
        const newWindow = window.open(fullUrl, '_blank');
        if (!newWindow || newWindow.closed) {
          const a = document.createElement('a');
          a.href = fullUrl;
          a.download = `full_system_report_${Date.now()}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        showToast('success', 'Full system report generated and downloading!');
      } else {
        console.log('📊 Full report data (no download URL):', res.data);
        showToast('warning', 'Full report generated but no download URL found. Check console for data.');
        
        if (res.data && typeof res.data === 'object') {
          try {
            if (res.data.pdfContent || res.data.content) {
              const content = res.data.pdfContent || res.data.content;
              if (typeof content === 'string' && content.length > 100) {
                const byteCharacters = atob(content);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `full_system_report_${Date.now()}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('success', 'Full report downloaded!');
                return;
              }
            }
            
            const jsonStr = JSON.stringify(res.data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `full_system_report_data_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('info', 'Full report data downloaded as JSON');
          } catch (e) {
            console.error('❌ Could not create download:', e);
            showToast('error', 'Could not download full report data');
          }
        }
      }
    } catch (e) {
      console.error('❌ Full report error:', e);
      showToast('error', 'Failed to generate full report: ' + e.message);
    }
  };

  // ============================================================
  // SETTINGS
  // ============================================================
  async function loadSettings() {
    const pc = document.getElementById('pageContent');
    try {
      const res = await window.API.superAdmin.getSettings();
      const settings = res.success ? (res.data?.settings || res.data || {}) : {};
      pc.innerHTML = `
        <h2 style="margin-bottom:20px;">System Settings</h2>
        <div class="settings-card"><h3><i class="fas fa-paint-brush"></i> Theme</h3><div class="setting-row"><span>Dark Mode</span><label class="toggle-switch"><input type="checkbox" id="darkModeToggle" ${settings.default_theme==='dark'?'checked':''} onchange="updateSetting('theme',this.checked?'dark':'light')"><span class="toggle-slider"></span></label></div></div>
        <div class="settings-card"><h3><i class="fas fa-language"></i> Language</h3><div class="setting-row"><span>Kiswahili</span><label class="toggle-switch"><input type="checkbox" id="langToggle" ${settings.default_language==='kiswahili'?'checked':''} onchange="updateSetting('language',this.checked?'kiswahili':'english')"><span class="toggle-slider"></span></label></div></div>
        <div class="settings-card"><h3><i class="fas fa-bell"></i> Notifications</h3><div class="setting-row"><span>Enable</span><label class="toggle-switch"><input type="checkbox" id="notifToggle" ${settings.notifications_enabled?'checked':''} onchange="updateNotifSettings(this.checked)"><span class="toggle-slider"></span></label></div></div>
        <div class="settings-card"><h3><i class="fas fa-cog"></i> System Info</h3><div class="form-group"><label>System Name</label><input type="text" id="systemNameInput" value="${settings.system_name||'LAMS'}"></div><div class="form-group"><label>Organization</label><input type="text" id="orgNameInput" value="${settings.organization_name||''}"></div><div class="form-group"><label>Contact Email</label><input type="email" id="contactEmailInput" value="${settings.contact_email||''}"></div><div class="form-group"><label>Contact Phone</label><input type="text" id="contactPhoneInput" value="${settings.contact_phone||''}"></div><button class="btn btn-primary" onclick="saveSystemSettings()"><i class="fas fa-save"></i> Save</button></div>
      `;
    } catch (e) { pc.innerHTML = '<p>Error loading settings.</p>'; }
  }

  window.updateSetting = async function(key, value) {
    try {
      if (key === 'theme') await window.API.superAdmin.updateTheme(value);
      else if (key === 'language') await window.API.superAdmin.updateLanguage(value);
      document.body.classList.toggle('dark-mode', value === 'dark');
      if (key === 'theme') document.getElementById('themeToggle').innerHTML = value === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      showToast('success', 'Setting updated!');
    } catch (e) { showToast('error', 'Failed'); }
  };

  window.updateNotifSettings = async function(enabled) {
    try { await window.API.superAdmin.updateNotifSettings({ notifications_enabled: enabled }); showToast('success', 'Updated!'); } catch (e) { showToast('error', 'Failed'); }
  };

  window.saveSystemSettings = async function() {
    try {
      await window.API.superAdmin.updateSettings({
        system_name: document.getElementById('systemNameInput')?.value,
        organization_name: document.getElementById('orgNameInput')?.value,
        contact_email: document.getElementById('contactEmailInput')?.value,
        contact_phone: document.getElementById('contactPhoneInput')?.value
      });
      showToast('success', 'Settings saved!');
    } catch (e) { showToast('error', 'Failed'); }
  };

  // ============================================================
  // SECURITY CENTER
  // ============================================================
  async function loadSecurityCenter() {
    const pc = document.getElementById('pageContent');
    try {
      const [dashRes, alertsRes] = await Promise.all([
        window.API.superAdmin.getSecurityDashboard(),
        window.API.superAdmin.getAlerts(1, 10)
      ]);
      const dash = dashRes.success ? (dashRes.data || dashRes) : {};
      const alerts = alertsRes.success ? (alertsRes.data?.alerts || alertsRes.alerts || alertsRes.data || []) : [];

      pc.innerHTML = `
        <h2 style="margin-bottom:20px;">Security Center</h2>
        <div class="security-stats-grid">
          <div class="security-stat-card"><div class="sec-icon" style="background:#e0f2fe;"><i class="fas fa-sign-in-alt" style="color:#0284c7;"></i></div><div class="stat-info"><h3>Total Logins Today</h3><p class="stat-number">${dash.summary_cards?.total_logins_today||dash.total_logins_today||0}</p></div></div>
          <div class="security-stat-card"><div class="sec-icon" style="background:#dcfce7;"><i class="fas fa-check-circle" style="color:#16a34a;"></i></div><div class="stat-info"><h3>Successful</h3><p class="stat-number">${dash.summary_cards?.successful_logins||dash.successful_logins||0}</p></div></div>
          <div class="security-stat-card"><div class="sec-icon" style="background:#fee2e2;"><i class="fas fa-exclamation-triangle" style="color:#dc2626;"></i></div><div class="stat-info"><h3>Failed</h3><p class="stat-number">${dash.summary_cards?.failed_attempts||dash.failed_attempts||0}</p></div></div>
          <div class="security-stat-card"><div class="sec-icon" style="background:#fef3c7;"><i class="fas fa-key" style="color:#d97706;"></i></div><div class="stat-info"><h3>Password Resets</h3><p class="stat-number">${dash.summary_cards?.password_resets||dash.password_resets||0}</p></div></div>
        </div>
        <div class="settings-card"><h3>Account Lock Controls</h3><div class="form-group"><label>Email</label><input type="email" class="search-input" placeholder="Enter user email..." id="lockEmailInput"></div><button class="btn btn-danger" onclick="lockAccount()"><i class="fas fa-lock"></i> Lock</button><button class="btn btn-success" style="margin-left:10px;" onclick="unlockAccount()"><i class="fas fa-unlock"></i> Unlock</button></div>
        <div class="settings-card"><h3>Security Alerts</h3>${alerts.length > 0 ? alerts.map(l => `<div style="padding:10px;border-bottom:1px solid var(--border);display:flex;gap:10px;"><i class="fas ${l.severity==='high'||l.severity==='critical'?'fa-exclamation-triangle':'fa-info-circle'}" style="color:${l.severity==='high'||l.severity==='critical'?'#dc2626':'#3b82f6'};"></i><div style="flex:1;"><strong>${l.action||l.type}</strong> - ${l.description}</div><span style="font-size:0.8rem;color:var(--text-light);">${l.created_at?new Date(l.created_at).toLocaleString():''}</span></div>`).join('') : '<p style="color:var(--text-light);padding:10px;">No security alerts</p>'}</div>
      `;
    } catch (e) { pc.innerHTML = '<p>Error loading security center.</p>'; }
  }

  window.lockAccount = async function() {
    const email = document.getElementById('lockEmailInput')?.value;
    if (!email) return showToast('error', 'Enter email');
    try { const res = await window.API.superAdmin.lockAccount(email); showToast(res.success?'warning':'error', res.message||'Account locked'); } catch (e) { showToast('error', 'Failed'); }
  };

  window.unlockAccount = async function() {
    const email = document.getElementById('lockEmailInput')?.value;
    if (!email) return showToast('error', 'Enter email');
    try { const res = await window.API.superAdmin.unlockAccount(email); showToast(res.success?'success':'error', res.message||'Account unlocked'); } catch (e) { showToast('error', 'Failed'); }
  };

  // ============================================================
  // PROFILE PAGE - FIXED WITH CACHE-BUSTING
  // ============================================================
  async function loadProfilePage() {
    const pc = document.getElementById('pageContent');
    try {
      // ✅ FIX: API already has cache-busting
      const res = await window.API.superAdmin.getProfile();
      console.log('👤 Profile page data:', res);
      
      if (res.success && res.data) {
        profileData = res.data.profile || res.data || {};
        console.log('👤 Profile page photo:', profileData.profile_photo);
        updateUserInfo();
      }
      
      const p = profileData;
      let photoUrl = p.profile_photo || p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'Super Admin')}&background=0066cc&color=fff&size=110`;
      
      // ✅ FIX: Add cache-busting
      if (p.profile_photo) {
        const separator = photoUrl.includes('?') ? '&' : '?';
        photoUrl = photoUrl + `${separator}t=${Date.now()}`;
      }

      pc.innerHTML = `
        <h2 style="margin-bottom:20px;">Profile Settings</h2>
        <div class="profile-header">
          <img src="${photoUrl}" class="profile-avatar" id="profileAvatar" 
               onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'Super Admin')}&background=0066cc&color=fff&size=110&t=${Date.now()}'">
          <div class="profile-info">
            <h2>${p.full_name || 'Super Administrator'}</h2>
            <p>${p.email || session.email || ''}</p>
          </div>
          <button class="btn btn-outline" onclick="document.getElementById('avatarUpload').click()" style="margin-top:10px;">
            <i class="fas fa-camera"></i> Change Photo
          </button>
          <input type="file" id="avatarUpload" accept="image/jpeg,image/png,image/jpg" style="display:none;" onchange="previewAvatar(event)">
        </div>
        <div class="settings-card">
          <h3>Edit Profile</h3>
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="profileName" value="${p.full_name || ''}">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="profileEmail" value="${p.email || session.email || ''}">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" id="profilePhone" value="${p.phone || ''}">
          </div>
          <button class="btn btn-primary" onclick="saveProfile()"><i class="fas fa-save"></i> Save</button>
        </div>
        <div class="settings-card">
          <h3>Change Password</h3>
          <div class="form-group">
            <label>Current Password</label>
            <input type="password" id="currentPassword">
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" id="newPassword">
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <input type="password" id="confirmPassword">
          </div>
          <button class="btn btn-warning" onclick="changePassword()"><i class="fas fa-key"></i> Change Password</button>
        </div>
      `;
    } catch (e) { 
      console.error('Profile page error:', e);
      pc.innerHTML = '<p style="color:var(--danger);">Error loading profile.</p>'; 
    }
  }

  // ============================================================
  // PREVIEW AVATAR - FIXED WITH CACHE-BUSTING
  // ============================================================
  window.previewAvatar = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
      showToast('error', 'JPG or PNG only');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Max file size: 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      // Show preview immediately
      const avatarElement = document.getElementById('profileAvatar');
      if (avatarElement) {
        avatarElement.src = e.target.result;
      }
      window._tempAvatar = e.target.result;
      
      // Upload to server
      const fd = new FormData();
      fd.append('profile_photo', file);
      
      showToast('info', 'Uploading photo...');
      
      window.API.superAdmin.updatePhoto(fd)
        .then(res => {
          console.log('📸 Photo upload response:', res);
          if (res.success) {
            showToast('success', 'Profile photo updated successfully!');
            // ✅ FIX: Force reload with cache-busting
            setTimeout(() => {
              loadProfileData();
              // Also refresh profile page if currently on it
              if (currentPage === 'profile') {
                loadProfilePage();
              }
              // Force refresh dashboard avatar
              updateUserInfo();
            }, 500);
          } else {
            showToast('error', res.message || 'Failed to update photo');
            // Revert preview if failed
            const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.full_name || 'Super Admin')}&background=0066cc&color=fff&size=110&t=${Date.now()}`;
            const avatarEl = document.getElementById('profileAvatar');
            if (avatarEl) {
              avatarEl.src = profileData.profile_photo || fallbackUrl;
            }
          }
        })
        .catch(err => {
          console.error('❌ Photo upload error:', err);
          showToast('error', 'Network error uploading photo');
          // Revert preview
          const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.full_name || 'Super Admin')}&background=0066cc&color=fff&size=110&t=${Date.now()}`;
          const avatarEl = document.getElementById('profileAvatar');
          if (avatarEl) {
            avatarEl.src = profileData.profile_photo || fallbackUrl;
          }
        });
    };
    reader.readAsDataURL(file);
  };

  window.saveProfile = async function() {
    try {
      const res = await window.API.superAdmin.updateProfile({
        full_name: document.getElementById('profileName')?.value,
        email: document.getElementById('profileEmail')?.value,
        phone: document.getElementById('profilePhone')?.value
      });
      if (res.success) { 
        showToast('success', 'Profile saved!'); 
        await loadProfileData();
      } else {
        showToast('error', res.message||'Failed');
      }
    } catch (e) { showToast('error', 'Network error'); }
  };

  window.changePassword = async function() {
    const cp = document.getElementById('currentPassword')?.value;
    const np = document.getElementById('newPassword')?.value;
    const cf = document.getElementById('confirmPassword')?.value;
    if (!cp || !np || !cf) return showToast('error', 'Fill all fields');
    if (np !== cf) return showToast('error', 'Passwords do not match');
    if (np.length < 6) return showToast('error', 'Min 6 characters');
    try {
      const res = await window.API.superAdmin.changePassword(cp, np, cf);
      showToast(res.success?'success':'error', res.message||(res.success?'Changed!':'Failed'));
    } catch (e) { showToast('error', 'Network error'); }
  };

  // ============================================================
  // LEADERSHIP
  // ============================================================
  window.showLeadershipModal = function() {
    document.getElementById('formModalContent').innerHTML = `
      <div class="modal-header"><h2>Leadership Transfer</h2><button class="modal-close" onclick="closeModal('formModal')">&times;</button></div>
      <div class="modal-body">
        <p style="color:var(--text-light);">Transfer leadership to a new ward or position.</p>
        <p>Coming soon...</p>
      </div>
      <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('formModal')">Close</button></div>
    `;
    document.getElementById('formModal').classList.add('active');
  };

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  function setupNotifications() {
    const bell = document.getElementById('notificationBell');
    const dd = document.getElementById('notificationDropdown');
    bell?.addEventListener('click', (e) => { e.stopPropagation(); dd?.classList.toggle('show'); });
    document.addEventListener('click', () => dd?.classList.remove('show'));
    document.getElementById('clearAllNotifications')?.addEventListener('click', async () => {
      try { await window.API.superAdmin.clearAllNotifs(); loadNotifications(); showToast('success','Cleared'); } catch(e){}
    });
    loadNotifications();
  }

  async function loadNotifications() {
    try {
      const res = await window.API.superAdmin.getNotifications(1, 20);
      notifications = res.success ? (res.data?.notifications || res.notifications || res.data || []) : [];
      renderNotifications();
    } catch(e){}
  }

  function renderNotifications() {
    const list = document.getElementById('notificationList');
    const count = document.getElementById('notificationCount');
    if (!list||!count) return;
    const unread = notifications.filter(n => !n.is_read&&!n.read).length;
    count.textContent = unread;
    count.style.display = unread > 0 ? 'flex' : 'none';
    list.innerHTML = notifications.length === 0 ? '<p class="no-notifications">No notifications</p>' : notifications.map(n => `<div class="notification-item ${n.is_read||n.read?'':'unread'}"><div class="notif-icon" style="background:var(--primary);"><i class="fas fa-bell" style="color:#fff;"></i></div><div class="notif-content"><p>${n.message||n.title}</p><span>${n.time||(n.created_at?new Date(n.created_at).toLocaleString():'')}</span></div></div>`).join('');
  }

  // ============================================================
  // LOGOUT
  // ============================================================
  function setupLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('logoutModalOverlay').classList.add('active'); });
  }
  
  window.closeLogoutModal = function() { document.getElementById('logoutModalOverlay').classList.remove('active'); };
  
  window.executeLogout = async function() {
    try { await window.API.auth.logout(); } catch(e){}
    window.location.href = 'login.html';
  };

  // ============================================================
  // MODAL HELPERS
  // ============================================================
  window.closeModal = function(id) { document.getElementById(id)?.classList.remove('active'); };
  
  function showConfirm(title, msg, cb) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = msg;
    confirmCallback = cb;
    document.getElementById('confirmModal').classList.add('active');
  }
  
  window.closeConfirmModal = function() { document.getElementById('confirmModal').classList.remove('active'); confirmCallback = null; };
  
  window.executeConfirmAction = function() { if (confirmCallback) confirmCallback(); closeConfirmModal(); };
  
  window.showConfirm = showConfirm;
  window.showToast = showToast;

  // ============================================================
  // START
  // ============================================================
  init();
})();