// superadmin.js - Complete Super Admin System with Enhanced Add Admin Form
(function() {
  'use strict';

  // ==================== GLOBAL STATE ====================
  let currentPage = 'dashboard';
  let isEnglish = true;
  let confirmCallback = null;
  let admins = [];
  let citizens = [];
  let auditLogs = [];
  let notifications = [];
  let settings = {};
  let currentAdminPage = 1;
  let currentCitizenPage = 1;
  let currentAuditPage = 1;
  let leadershipHistory = [];
  let securityLogs = [];
  const itemsPerPage = 6;
  let tempAdminPhoto = null;

  const wards = ['Mpendae Ward', 'Fuoni Ward', 'Chukwani Ward', 'Kombeni Ward', 'Mwera Ward', 'Other Wards'];

  // ==================== INITIALIZATION ====================
  function init() {
    checkAuth();
    loadData();
    setupSidebar();
    setupTheme();
    setupLanguage();
    setupNotifications();
    setupLogout();
    setupLiveClock();
    navigateTo('dashboard');
    console.log('👑 LAMS Super Admin Panel - Enhanced Add Admin Form');
  }

  function checkAuth() {
    const session = JSON.parse(localStorage.getItem('lams_user_session') || 'null');
    if (!session || session.role !== 'superadmin') {
      window.location.href = 'login.html';
    }
    updateUserInfo(session);
  }

  function updateUserInfo(session) {
    if (!session) return;
    const profileData = JSON.parse(localStorage.getItem('lams_profile') || '{}');
    const name = profileData.name || (session.email ? session.email.split('@')[0] : 'Super Admin');
    document.getElementById('sidebarUserName').textContent = name;
    document.getElementById('sidebarAvatar').src = profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0066cc&color=fff&size=80`;
    document.getElementById('headerAvatar').src = profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0066cc&color=fff&size=40`;
  }

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

  function loadData() {
    admins = JSON.parse(localStorage.getItem('lams_admins') || '[]');
    if (admins.length === 0) {
      admins = [
        { id: 1, name: 'John Doe', email: 'john@lams.go.tz', phone: '+255 123 456 001', position: 'Ward Officer', ward: 'Mpendae Ward', status: 'active', startDate: '2025-01-15', endDate: '2027-01-15', photo: '' },
        { id: 2, name: 'Jane Smith', email: 'jane@lams.go.tz', phone: '+255 123 456 002', position: 'Village Officer', ward: 'Fuoni Ward', status: 'active', startDate: '2025-03-01', endDate: '2027-03-01', photo: '' },
        { id: 3, name: 'Mike Johnson', email: 'mike@lams.go.tz', phone: '+255 123 456 003', position: 'Street Officer', ward: 'Kombeni Ward', status: 'suspended', startDate: '2024-06-01', endDate: '2026-06-01', photo: '' },
        { id: 4, name: 'Sarah Wilson', email: 'sarah@lams.go.tz', phone: '+255 123 456 004', position: 'Ward Officer', ward: 'Chukwani Ward', status: 'active', startDate: '2025-02-15', endDate: '2027-02-15', photo: '' },
        { id: 5, name: 'Tom Brown', email: 'tom@lams.go.tz', phone: '+255 123 456 005', position: 'Village Officer', ward: 'Mpendae Ward', status: 'inactive', startDate: '2024-09-01', endDate: '2026-09-01', photo: '' },
        { id: 6, name: 'Lucy Green', email: 'lucy@lams.go.tz', phone: '+255 123 456 006', position: 'Ward Officer', ward: 'Fuoni Ward', status: 'active', startDate: '2025-05-10', endDate: '2027-05-10', photo: '' },
      ];
      saveAdmins();
    }

    citizens = JSON.parse(localStorage.getItem('lams_citizens') || '[]');
    if (citizens.length === 0) {
      const wardDistribution = [1200, 950, 780, 650, 420];
      let citizenId = 1;
      citizens = [];
      wards.forEach((ward, idx) => {
        const count = wardDistribution[idx];
        for (let i = 0; i < Math.min(count, 3); i++) {
          citizens.push({
            id: 'CTZ' + String(citizenId).padStart(3, '0'),
            name: `Citizen ${citizenId}`,
            email: `citizen${citizenId}@email.com`,
            phone: `+255 123 45${String(citizenId).padStart(3, '0')}`,
            status: i % 4 === 0 ? 'inactive' : 'active',
            ward: ward,
            registeredDate: `2025-0${Math.ceil(citizenId / 5)}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
          });
          citizenId++;
        }
      });
      saveCitizens();
    }

    auditLogs = JSON.parse(localStorage.getItem('lams_audit_logs') || '[]');
    if (auditLogs.length === 0) {
      auditLogs = [
        { id: 1, user: 'Admin John Doe', role: 'Ward Officer', action: 'Created new citizen record', type: 'citizen', date: '2026-06-09', time: '09:15 AM', status: 'success' },
        { id: 2, user: 'Admin Jane Smith', role: 'Village Officer', action: 'Issued birth certificate #4521', type: 'document', date: '2026-06-09', time: '10:30 AM', status: 'success' },
        { id: 3, user: 'Admin Mike Johnson', role: 'Street Officer', action: 'Processed payment TZS 50,000', type: 'payment', date: '2026-06-08', time: '02:45 PM', status: 'success' },
        { id: 4, user: 'Super Admin', role: 'Super Admin', action: 'Suspended admin account', type: 'admin', date: '2026-06-08', time: '04:00 PM', status: 'warning' },
        { id: 5, user: 'Admin Sarah Wilson', role: 'Ward Officer', action: 'Failed login attempt', type: 'security', date: '2026-06-07', time: '08:20 AM', status: 'error' },
        { id: 6, user: 'Super Admin', role: 'Super Admin', action: 'Login successful', type: 'security', date: '2026-06-10', time: '07:00 AM', status: 'success' },
        { id: 7, user: 'Admin Tom Brown', role: 'Village Officer', action: 'Updated citizen records', type: 'citizen', date: '2026-06-06', time: '11:00 AM', status: 'success' },
      ];
      saveAuditLogs();
    }

    notifications = JSON.parse(localStorage.getItem('lams_super_notifications') || '[]');
    if (notifications.length === 0) {
      notifications = [
        { id: 1, message: 'New admin account created: Lucy Green', time: '5 minutes ago', read: false, icon: 'fa-user-plus', color: '#2563eb' },
        { id: 2, message: 'Admin password reset requested', time: '30 minutes ago', read: false, icon: 'fa-key', color: '#d97706' },
        { id: 3, message: 'System backup completed successfully', time: '1 hour ago', read: false, icon: 'fa-check-circle', color: '#059669' },
      ];
      saveNotifications();
    }

    settings = JSON.parse(localStorage.getItem('lams_settings') || '{}');
    if (Object.keys(settings).length === 0) {
      settings = { theme: 'light', language: 'en', systemName: 'LAMS', orgName: 'Local Administration', contactEmail: 'info@lams.go.tz', contactPhone: '+255 123 456 789', notificationsEnabled: true, autoBackup: false };
      saveSettings();
    }

    leadershipHistory = JSON.parse(localStorage.getItem('lams_leadership_history') || '[]');
    securityLogs = JSON.parse(localStorage.getItem('lams_security_logs') || '[]');
    if (securityLogs.length === 0) {
      securityLogs = [
        { user: 'Admin John Doe', ip: '192.168.1.100', date: '2026-06-10', time: '07:15 AM', status: 'success' },
        { user: 'Admin Jane Smith', ip: '192.168.1.101', date: '2026-06-10', time: '08:30 AM', status: 'success' },
        { user: 'Unknown User', ip: '10.0.0.55', date: '2026-06-10', time: '09:45 AM', status: 'failed' },
        { user: 'Admin Mike Johnson', ip: '192.168.1.102', date: '2026-06-09', time: '03:20 PM', status: 'success' },
      ];
      localStorage.setItem('lams_security_logs', JSON.stringify(securityLogs));
    }
  }

  function saveAdmins() { localStorage.setItem('lams_admins', JSON.stringify(admins)); }
  function saveCitizens() { localStorage.setItem('lams_citizens', JSON.stringify(citizens)); }
  function saveAuditLogs() { localStorage.setItem('lams_audit_logs', JSON.stringify(auditLogs)); }
  function saveNotifications() { localStorage.setItem('lams_super_notifications', JSON.stringify(notifications)); }
  function saveSettings() { localStorage.setItem('lams_settings', JSON.stringify(settings)); }

  function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarToggle = document.getElementById('sidebarToggle');
    function openSidebar() { sidebar.classList.add('active'); sidebarOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function closeSidebar() { sidebar.classList.remove('active'); sidebarOverlay.classList.remove('active'); document.body.style.overflow = ''; }
    mobileMenuBtn?.addEventListener('click', openSidebar);
    sidebarToggle?.addEventListener('click', closeSidebar);
    sidebarOverlay?.addEventListener('click', closeSidebar);
    window.addEventListener('resize', () => { if (window.innerWidth > 1024 && sidebar.classList.contains('active')) closeSidebar(); });
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      link.addEventListener('click', (e) => { e.preventDefault(); const page = link.getAttribute('data-page'); navigateTo(page); if (window.innerWidth <= 1024) closeSidebar(); });
    });
  }

  function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');
    const titles = { 'dashboard': 'Dashboard Overview', 'admin-management': 'Admin Management', 'citizen-monitoring': 'Citizen Monitoring', 'reports': 'System Reports', 'audit-logs': 'Audit Logs', 'settings': 'System Settings', 'security-center': 'Security Center', 'profile': 'Profile Settings' };
    document.getElementById('pageTitle').textContent = titles[page] || page;
    switch(page) {
      case 'dashboard': loadDashboard(); break;
      case 'admin-management': loadAdminManagement(); break;
      case 'citizen-monitoring': loadCitizenMonitoring(); break;
      case 'reports': loadReports(); break;
      case 'audit-logs': loadAuditLogs(); break;
      case 'settings': loadSettings(); break;
      case 'security-center': loadSecurityCenter(); break;
      case 'profile': loadProfile(); break;
    }
  }

  // ==================== DASHBOARD PAGE ====================
  function loadDashboard() {
    const pageContent = document.getElementById('pageContent');
    const activeAdmins = admins.filter(a => a.status === 'active').length;
    const suspendedAdmins = admins.filter(a => a.status === 'suspended').length;
    const totalWards = wards.length;
    const totalDocuments = 3420;
    const totalRevenue = 5670000;
    
    pageContent.innerHTML = `
      <div class="welcome-card">
        <div class="welcome-info"><h2><i class="fas fa-crown" style="color:#f59e0b;margin-right:10px;"></i>Welcome Back, Super Administrator</h2><p>You have full system governance and administration oversight.</p></div>
        <div class="welcome-date"><span id="dashboardDate"></span><div class="system-status"><span class="status-dot"></span><span>System Operational</span></div></div>
      </div>
      <div class="stats-grid">
        <div class="stat-card clickable" onclick="window.navigateTo('citizen-monitoring')"><div class="stat-icon" style="background:#e0f2fe;"><i class="fas fa-users" style="color:#0284c7;"></i></div><div class="stat-info"><h3>Total Citizens</h3><p class="stat-number" data-target="${citizens.length}">0</p><span class="stat-change positive">Across ${wards.length} wards</span></div></div>
        <div class="stat-card clickable" onclick="window.navigateTo('admin-management')"><div class="stat-icon" style="background:#dcfce7;"><i class="fas fa-user-tie" style="color:#16a34a;"></i></div><div class="stat-info"><h3>Total Admins</h3><p class="stat-number" data-target="${admins.length}">0</p><span class="stat-change positive">${activeAdmins} active</span></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><i class="fas fa-user-check" style="color:#d97706;"></i></div><div class="stat-info"><h3>Active Admins</h3><p class="stat-number" data-target="${activeAdmins}">0</p><span class="stat-change neutral">Currently serving</span></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#fce7f3;"><i class="fas fa-user-times" style="color:#db2777;"></i></div><div class="stat-info"><h3>Suspended Admins</h3><p class="stat-number" data-target="${suspendedAdmins}">0</p><span class="stat-change ${suspendedAdmins > 0 ? 'negative' : 'neutral'}">Requires attention</span></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#e0e7ff;"><i class="fas fa-map-marker-alt" style="color:#4f46e5;"></i></div><div class="stat-info"><h3>Total Wards</h3><p class="stat-number" data-target="${totalWards}">0</p><span class="stat-change positive">All operational</span></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#d1fae5;"><i class="fas fa-file-alt" style="color:#059669;"></i></div><div class="stat-info"><h3>Documents Issued</h3><p class="stat-number" data-target="${totalDocuments}">0</p><span class="stat-change positive">Total processed</span></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><i class="fas fa-coins" style="color:#d97706;"></i></div><div class="stat-info"><h3>Total Revenue (TZS)</h3><p class="stat-number" data-target="${totalRevenue}">0</p><span class="stat-change positive">Collected</span></div></div>
        <div class="stat-card clickable" onclick="window.navigateTo('audit-logs')"><div class="stat-icon" style="background:#fce7f3;"><i class="fas fa-history" style="color:#db2777;"></i></div><div class="stat-info"><h3>System Activities</h3><p class="stat-number" data-target="${auditLogs.length}">0</p><span class="stat-change neutral">Total logs</span></div></div>
      </div>
      <div class="leadership-section"><h3><i class="fas fa-crown" style="color:#f59e0b;"></i> Leadership Overview</h3><div class="leadership-grid">${wards.slice(0,4).map(ward => { const wardAdmin = admins.find(a => a.ward === ward && a.status === 'active'); return `<div class="leader-card"><img src="https://ui-avatars.com/api/?name=${encodeURIComponent(wardAdmin ? wardAdmin.name : 'Vacant')}&background=0066cc&color=fff&size=55" alt="Leader"><h4>${wardAdmin ? wardAdmin.name : 'Position Vacant'}</h4><p>${ward}</p><span class="badge ${wardAdmin ? 'badge-success' : 'badge-warning'}">${wardAdmin ? 'Active' : 'Vacant'}</span></div>`; }).join('')}</div></div>
      <div class="quick-actions"><h3>Quick Actions</h3><div class="actions-grid">
        <div class="action-card" onclick="window.showAddAdminModal()"><i class="fas fa-user-plus"></i><span>Add New Admin</span></div>
        <div class="action-card" onclick="window.showLeadershipModal()"><i class="fas fa-exchange-alt"></i><span>Transfer Leadership</span></div>
        <div class="action-card" onclick="window.navigateTo('reports')"><i class="fas fa-file-pdf"></i><span>Generate Report</span></div>
        <div class="action-card" onclick="window.navigateTo('audit-logs')"><i class="fas fa-search"></i><span>View Audit Logs</span></div>
        <div class="action-card" onclick="window.navigateTo('settings')"><i class="fas fa-sliders-h"></i><span>System Settings</span></div>
        <div class="action-card" onclick="window.navigateTo('security-center')"><i class="fas fa-lock"></i><span>Security Check</span></div>
      </div></div>
      <div class="recent-activities"><div class="section-header"><h3>Recent Activities</h3><span class="view-all" onclick="window.navigateTo('audit-logs')">View All <i class="fas fa-arrow-right"></i></span></div><div class="activity-list">${auditLogs.slice(0,6).map(log => `<div class="activity-item"><div class="activity-icon" style="background:${getActivityBg(log.type)};"><i class="fas ${getActivityIcon(log.type)}" style="color:${getActivityColor(log.type)};"></i></div><div class="activity-info"><p><strong>${log.user}</strong> - ${log.action}</p><span>${log.date} at ${log.time} · <span class="badge ${log.status==='success'?'badge-success':log.status==='warning'?'badge-warning':'badge-danger'}">${log.status}</span></span></div></div>`).join('')}</div></div>
    `;
    const now = new Date();
    const dateEl = document.getElementById('dashboardDate');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    setTimeout(animateCounters, 150);
  }

  function getActivityBg(type) { const map = { citizen: '#dbeafe', document: '#dcfce7', payment: '#fef3c7', admin: '#fce7f3', security: '#fee2e2' }; return map[type] || '#dbeafe'; }
  function getActivityIcon(type) { const map = { citizen: 'fa-user-plus', document: 'fa-file-signature', payment: 'fa-money-check', admin: 'fa-user-cog', security: 'fa-shield-alt' }; return map[type] || 'fa-info-circle'; }
  function getActivityColor(type) { const map = { citizen: '#2563eb', document: '#16a34a', payment: '#d97706', admin: '#db2777', security: '#dc2626' }; return map[type] || '#2563eb'; }

  function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
      if (el.classList.contains('counted')) return;
      el.classList.add('counted');
      const target = parseInt(el.getAttribute('data-target'));
      if (isNaN(target)) { el.textContent = '0'; return; }
      const duration = 1500, step = Math.max(1, Math.floor(target / (duration / 16)));
      let current = 0;
      const timer = setInterval(() => { current += step; if (current >= target) { el.textContent = target.toLocaleString(); clearInterval(timer); } else { el.textContent = Math.floor(current).toLocaleString(); } }, 16);
    });
  }

  // ==================== ADMIN MANAGEMENT PAGE ====================
  function loadAdminManagement() {
    const pageContent = document.getElementById('pageContent');
    const startIdx = (currentAdminPage - 1) * itemsPerPage;
    const paginatedAdmins = admins.slice(startIdx, startIdx + itemsPerPage);
    const totalPages = Math.ceil(admins.length / itemsPerPage);
    pageContent.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;"><h2>Admin Management</h2><button class="btn btn-primary" onclick="window.showAddAdminModal()"><i class="fas fa-plus"></i> Add New Admin</button></div>
      <div class="search-filter-bar">
        <input type="text" class="search-input" id="adminSearch" placeholder="Search admins by name, email, or ward..." oninput="window.filterAdmins()">
        <select class="filter-select" id="adminStatusFilter" onchange="window.filterAdmins()"><option value="all">All Status</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="inactive">Inactive</option></select>
        <select class="filter-select" id="adminWardFilter" onchange="window.filterAdmins()"><option value="all">All Wards</option>${wards.map(w => `<option value="${w}">${w}</option>`).join('')}</select>
      </div>
      <div class="leadership-section"><h3><i class="fas fa-crown" style="color:#f59e0b;"></i> Leadership Management</h3><div style="display:flex;gap:10px;flex-wrap:wrap;"><button class="btn btn-warning" onclick="window.showLeadershipModal()"><i class="fas fa-exchange-alt"></i> Appoint / Transfer Leader</button><button class="btn btn-outline" onclick="window.viewLeadershipHistory()"><i class="fas fa-history"></i> View Transfer History</button><button class="btn btn-outline" onclick="window.extendLeadershipTerm()"><i class="fas fa-calendar-plus"></i> Extend Term</button><button class="btn btn-outline" onclick="window.endLeadershipTerm()"><i class="fas fa-calendar-times"></i> End Term</button></div><div id="leadershipHistory" style="margin-top:15px;display:none;"></div></div>
      <div class="table-container"><table><thead><tr><th>#</th><th>Photo</th><th>Full Name</th><th>Ward</th><th>Email</th><th>Phone</th><th>Position</th><th>Status</th><th>Start Date</th><th>End Date</th><th>Actions</th></tr></thead><tbody id="adminTableBody">${paginatedAdmins.map((admin, idx) => `<tr><td>${startIdx + idx + 1}</td><td><img src="${admin.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=0066cc&color=fff&size=35`}" style="border-radius:50%;width:35px;height:35px;object-fit:cover;"></td><td><strong>${admin.name}</strong></td><td>${admin.ward || 'N/A'}</td><td>${admin.email}</td><td>${admin.phone}</td><td>${admin.position}</td><td><span class="badge ${admin.status==='active'?'badge-success':admin.status==='suspended'?'badge-danger':'badge-warning'}">${admin.status}</span></td><td>${admin.startDate}</td><td>${admin.endDate}</td><td><div style="display:flex;gap:4px;flex-wrap:wrap;"><button class="btn btn-sm btn-outline" onclick="window.viewAdmin(${admin.id})" title="View"><i class="fas fa-eye"></i></button><button class="btn btn-sm btn-primary" onclick="window.editAdmin(${admin.id})" title="Edit"><i class="fas fa-edit"></i></button>${admin.status==='active'?`<button class="btn btn-sm btn-warning" onclick="window.suspendAdmin(${admin.id})" title="Suspend"><i class="fas fa-pause"></i></button>`:`<button class="btn btn-sm btn-success" onclick="window.activateAdmin(${admin.id})" title="Activate"><i class="fas fa-play"></i></button>`}<button class="btn btn-sm btn-outline" onclick="window.resetAdminPassword(${admin.id})" title="Reset Password"><i class="fas fa-key"></i></button><button class="btn btn-sm btn-danger" onclick="window.deleteAdmin(${admin.id})" title="Remove"><i class="fas fa-trash"></i></button></div></td></tr>`).join('')}</tbody></table></div>
      ${totalPages > 1 ? `<div class="pagination"><button ${currentAdminPage===1?'disabled':''} onclick="window.changeAdminPage(${currentAdminPage-1})"><i class="fas fa-chevron-left"></i> Previous</button>${Array.from({length:totalPages},(_,i)=>`<button class="${currentAdminPage===i+1?'active':''}" onclick="window.changeAdminPage(${i+1})">${i+1}</button>`).join('')}<button ${currentAdminPage===totalPages?'disabled':''} onclick="window.changeAdminPage(${currentAdminPage+1})">Next <i class="fas fa-chevron-right"></i></button></div>` : ''}
    `;
  }

  // ==================== CITIZEN MONITORING PAGE ====================
  function loadCitizenMonitoring() {
    const pageContent = document.getElementById('pageContent');
    const startIdx = (currentCitizenPage - 1) * itemsPerPage;
    const paginatedCitizens = citizens.slice(startIdx, startIdx + itemsPerPage);
    const totalPages = Math.ceil(citizens.length / itemsPerPage);
    const wardStats = wards.map(ward => ({ name: ward, total: citizens.filter(c => c.ward === ward).length, active: citizens.filter(c => c.ward === ward && c.status === 'active').length, inactive: citizens.filter(c => c.ward === ward && c.status === 'inactive').length }));
    pageContent.innerHTML = `
      <h2 style="margin-bottom:20px;">Citizen Monitoring</h2>
      <div class="stats-grid" style="margin-bottom:20px;">${wardStats.map(ws => `<div class="stat-card"><div class="stat-icon" style="background:#e0f2fe;"><i class="fas fa-map-marker-alt" style="color:#0284c7;"></i></div><div class="stat-info"><h3>${ws.name}</h3><p class="stat-number">${ws.total.toLocaleString()}</p><span class="stat-change positive">${ws.active} active · ${ws.inactive} inactive</span></div></div>`).join('')}</div>
      <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin-bottom:20px;"><div class="stat-card"><div class="stat-icon" style="background:#dcfce7;"><i class="fas fa-users" style="color:#16a34a;"></i></div><div class="stat-info"><h3>Total Citizens</h3><p class="stat-number">${citizens.length.toLocaleString()}</p></div></div><div class="stat-card"><div class="stat-icon" style="background:#e0f2fe;"><i class="fas fa-user-check" style="color:#0284c7;"></i></div><div class="stat-info"><h3>Active Citizens</h3><p class="stat-number">${citizens.filter(c=>c.status==='active').length.toLocaleString()}</p></div></div><div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><i class="fas fa-user-clock" style="color:#d97706;"></i></div><div class="stat-info"><h3>Inactive Citizens</h3><p class="stat-number">${citizens.filter(c=>c.status==='inactive').length.toLocaleString()}</p></div></div></div>
      <div class="search-filter-bar"><input type="text" class="search-input" id="citizenSearch" placeholder="Search by name, ID, or email..." oninput="window.filterCitizens()"><select class="filter-select" id="citizenStatusFilter" onchange="window.filterCitizens()"><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select><select class="filter-select" id="citizenWardFilter" onchange="window.filterCitizens()"><option value="all">All Wards</option>${wards.map(w => `<option value="${w}">${w}</option>`).join('')}</select></div>
      <div class="table-container"><table><thead><tr><th>Citizen ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Ward</th><th>Status</th><th>Registered</th><th>Actions</th></tr></thead><tbody id="citizenTableBody">${paginatedCitizens.map(c => `<tr><td><strong>${c.id}</strong></td><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td><td><span class="badge badge-info">${c.ward}</span></td><td><span class="badge ${c.status==='active'?'badge-success':'badge-warning'}">${c.status}</span></td><td>${c.registeredDate}</td><td><button class="btn btn-sm btn-outline" onclick="window.viewCitizen('${c.id}')"><i class="fas fa-eye"></i> View</button></td></tr>`).join('')}</tbody></table></div>
      ${totalPages > 1 ? `<div class="pagination"><button ${currentCitizenPage===1?'disabled':''} onclick="window.changeCitizenPage(${currentCitizenPage-1})">Previous</button>${Array.from({length:totalPages},(_,i)=>`<button class="${currentCitizenPage===i+1?'active':''}" onclick="window.changeCitizenPage(${i+1})">${i+1}</button>`).join('')}<button ${currentCitizenPage===totalPages?'disabled':''} onclick="window.changeCitizenPage(${currentCitizenPage+1})">Next</button></div>` : ''}
    `;
  }

  // ==================== AUDIT LOGS PAGE ====================
  function loadAuditLogs() {
    const pageContent = document.getElementById('pageContent');
    const startIdx = (currentAuditPage - 1) * itemsPerPage;
    const paginatedLogs = auditLogs.slice(startIdx, startIdx + itemsPerPage);
    const totalPages = Math.ceil(auditLogs.length / itemsPerPage);
    pageContent.innerHTML = `
      <h2 style="margin-bottom:20px;">Audit Logs</h2>
      <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:20px;"><div class="stat-card"><div class="stat-icon" style="background:#e0f2fe;"><i class="fas fa-list" style="color:#0284c7;"></i></div><div class="stat-info"><h3>Total Logs</h3><p class="stat-number">${auditLogs.length}</p></div></div><div class="stat-card"><div class="stat-icon" style="background:#dcfce7;"><i class="fas fa-check-circle" style="color:#16a34a;"></i></div><div class="stat-info"><h3>Success</h3><p class="stat-number">${auditLogs.filter(l=>l.status==='success').length}</p></div></div><div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><i class="fas fa-exclamation-triangle" style="color:#d97706;"></i></div><div class="stat-info"><h3>Warnings</h3><p class="stat-number">${auditLogs.filter(l=>l.status==='warning').length}</p></div></div><div class="stat-card"><div class="stat-icon" style="background:#fee2e2;"><i class="fas fa-times-circle" style="color:#dc2626;"></i></div><div class="stat-info"><h3>Errors</h3><p class="stat-number">${auditLogs.filter(l=>l.status==='error').length}</p></div></div></div>
      <div class="search-filter-bar"><input type="text" class="search-input" id="auditSearch" placeholder="Search logs by user or action..." oninput="window.filterAuditLogs()"><select class="filter-select" id="auditTypeFilter" onchange="window.filterAuditLogs()"><option value="all">All Types</option><option value="citizen">Citizen</option><option value="document">Document</option><option value="payment">Payment</option><option value="admin">Admin</option><option value="security">Security</option></select><select class="filter-select" id="auditStatusFilter" onchange="window.filterAuditLogs()"><option value="all">All Status</option><option value="success">Success</option><option value="warning">Warning</option><option value="error">Error</option></select><button class="btn btn-outline" onclick="window.exportAuditLogs()"><i class="fas fa-download"></i> Export CSV</button><button class="btn btn-outline" onclick="window.printAuditLogs()"><i class="fas fa-print"></i> Print</button></div>
      <div class="table-container"><table><thead><tr><th>#</th><th>User</th><th>Role</th><th>Action</th><th>Type</th><th>Date</th><th>Time</th><th>Status</th></tr></thead><tbody id="auditTableBody">${paginatedLogs.map((log,idx) => `<tr><td>${startIdx+idx+1}</td><td><strong>${log.user}</strong></td><td>${log.role||'N/A'}</td><td>${log.action}</td><td><span class="badge badge-info">${log.type}</span></td><td>${log.date}</td><td>${log.time}</td><td><span class="badge ${log.status==='success'?'badge-success':log.status==='warning'?'badge-warning':'badge-danger'}">${log.status}</span></td></tr>`).join('')}</tbody></table></div>
      ${totalPages > 1 ? `<div class="pagination"><button ${currentAuditPage===1?'disabled':''} onclick="window.changeAuditPage(${currentAuditPage-1})">Previous</button>${Array.from({length:totalPages},(_,i)=>`<button class="${currentAuditPage===i+1?'active':''}" onclick="window.changeAuditPage(${i+1})">${i+1}</button>`).join('')}<button ${currentAuditPage===totalPages?'disabled':''} onclick="window.changeAuditPage(${currentAuditPage+1})">Next</button></div>` : ''}
    `;
  }

  // ==================== REPORTS PAGE ====================
  function loadReports() {
    const pageContent = document.getElementById('pageContent');
    pageContent.innerHTML = `
      <h2 style="margin-bottom:20px;">System Reports</h2>
      <div class="chart-container"><h3 style="margin-bottom:15px;">Citizens & Admins Overview</h3><canvas id="overviewChart" height="80"></canvas></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-bottom:25px;">
        <div class="settings-card" style="cursor:pointer;text-align:center;" onclick="window.generatePDFReport('citizens')"><i class="fas fa-users" style="font-size:2.5rem;color:#0284c7;margin-bottom:10px;"></i><h3>Citizen Report</h3><p style="color:var(--text-light);">${citizens.length} records</p><button class="btn btn-primary btn-full" style="margin-top:10px;"><i class="fas fa-download"></i> Generate PDF</button><button class="btn btn-outline btn-full" style="margin-top:8px;" onclick="event.stopPropagation();window.sharePDFReport('citizens')"><i class="fas fa-share-alt"></i> Share Report</button></div>
        <div class="settings-card" style="cursor:pointer;text-align:center;" onclick="window.generatePDFReport('admins')"><i class="fas fa-user-tie" style="font-size:2.5rem;color:#16a34a;margin-bottom:10px;"></i><h3>Admin Report</h3><p style="color:var(--text-light);">${admins.length} records</p><button class="btn btn-primary btn-full" style="margin-top:10px;"><i class="fas fa-download"></i> Generate PDF</button><button class="btn btn-outline btn-full" style="margin-top:8px;" onclick="event.stopPropagation();window.sharePDFReport('admins')"><i class="fas fa-share-alt"></i> Share Report</button></div>
        <div class="settings-card" style="cursor:pointer;text-align:center;" onclick="window.generatePDFReport('audit')"><i class="fas fa-history" style="font-size:2.5rem;color:#d97706;margin-bottom:10px;"></i><h3>Audit Report</h3><p style="color:var(--text-light);">${auditLogs.length} records</p><button class="btn btn-primary btn-full" style="margin-top:10px;"><i class="fas fa-download"></i> Generate PDF</button><button class="btn btn-outline btn-full" style="margin-top:8px;" onclick="event.stopPropagation();window.sharePDFReport('audit')"><i class="fas fa-share-alt"></i> Share Report</button></div>
        <div class="settings-card" style="cursor:pointer;text-align:center;" onclick="window.generatePDFReport('all')"><i class="fas fa-file-pdf" style="font-size:2.5rem;color:#db2777;margin-bottom:10px;"></i><h3>Full System Report</h3><p style="color:var(--text-light);">Complete overview</p><button class="btn btn-primary btn-full" style="margin-top:10px;"><i class="fas fa-download"></i> Generate PDF</button><button class="btn btn-outline btn-full" style="margin-top:8px;" onclick="event.stopPropagation();window.sharePDFReport('all')"><i class="fas fa-share-alt"></i> Share Report</button></div>
      </div>
      <div id="reportPreview" style="display:none;" class="settings-card"></div>
      <div style="display:flex;gap:10px;"><button class="btn btn-primary" onclick="window.printReport()"><i class="fas fa-print"></i> Print Page</button></div>
    `;
    setTimeout(() => {
      const ctx = document.getElementById('overviewChart');
      if (ctx && typeof Chart !== 'undefined') {
        new Chart(ctx, { type: 'bar', data: { labels: wards, datasets: [{ label: 'Citizens per Ward', data: wards.map(w => citizens.filter(c => c.ward === w).length), backgroundColor: ['#0284c7','#16a34a','#d97706','#4f46e5','#db2777'] }] }, options: { responsive: true, plugins: { legend: { display: false } } } });
      }
    }, 300);
  }

  window.generatePDFReport = function(type) {
    if (typeof window.jspdf === 'undefined') { showToast('error', 'PDF library loading...'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let title, tableHeaders, tableRows, statsSummary;
    const now = new Date().toLocaleString();
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 35, 'F'); doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.text('LAMS', 14, 22); doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text('Local Administration Management System', 14, 30);
    switch(type) {
      case 'citizens': title = 'Citizens Report'; statsSummary = [`Total: ${citizens.length}`, `Active: ${citizens.filter(c=>c.status==='active').length}`]; tableHeaders = [['ID','Name','Email','Phone','Ward','Status','Registered']]; tableRows = citizens.map(c => [c.id,c.name,c.email,c.phone,c.ward,c.status,c.registeredDate]); break;
      case 'admins': title = 'Admins Report'; statsSummary = [`Total: ${admins.length}`, `Active: ${admins.filter(a=>a.status==='active').length}`]; tableHeaders = [['Name','Email','Phone','Ward','Position','Status']]; tableRows = admins.map(a => [a.name,a.email,a.phone,a.ward||'N/A',a.position,a.status]); break;
      case 'audit': title = 'Audit Report'; statsSummary = [`Total: ${auditLogs.length}`]; tableHeaders = [['User','Action','Type','Date','Status']]; tableRows = auditLogs.map(l => [l.user,l.action,l.type,l.date,l.status]); break;
      case 'all': title = 'Full System Report'; statsSummary = [`Citizens: ${citizens.length} | Admins: ${admins.length} | Logs: ${auditLogs.length}`]; tableHeaders = [['Metric','Value']]; tableRows = [['Citizens',citizens.length],['Admins',admins.length],['Audit Logs',auditLogs.length]]; break;
    }
    doc.setTextColor(30,41,59); doc.setFontSize(18); doc.setFont('helvetica','bold'); doc.text(title,14,50); doc.setFontSize(9); doc.setTextColor(100,100,100); doc.text(`Generated: ${now}`,14,58);
    let yPos = 68; doc.setFontSize(11); doc.setTextColor(0,0,0); statsSummary.forEach(s => { doc.text(`• ${s}`,14,yPos); yPos += 7; }); yPos += 8;
    doc.autoTable({ startY: yPos, head: tableHeaders, body: tableRows, styles: { fontSize: 8, cellPadding: 3 }, headStyles: { fillColor: [0,102,204], textColor: 255, fontStyle: 'bold' }, alternateRowStyles: { fillColor: [245,247,250] } });
    const pc = doc.internal.getNumberOfPages(); for (let i=1;i<=pc;i++) { doc.setPage(i); doc.setFontSize(7); doc.setTextColor(150,150,150); doc.text(`LAMS Report | Page ${i} of ${pc}`,14,doc.internal.pageSize.height-8); }
    doc.save(`LAMS_${title.replace(/\s/g,'_')}.pdf`);
    addAuditLog('Super Admin', `Generated ${title}`, 'report', 'success');
    showToast('success', `${title} downloaded!`);
  };

  window.sharePDFReport = function(type) { showToast('info', `Share report: ${type} (PDF download started)`); window.generatePDFReport(type); };
  window.printReport = function() { window.print(); };

  // ==================== SETTINGS PAGE ====================
  function loadSettings() {
    const pageContent = document.getElementById('pageContent');
    pageContent.innerHTML = `
      <h2 style="margin-bottom:20px;">System Settings</h2>
      <div class="settings-card"><h3><i class="fas fa-paint-brush"></i> Theme</h3><div class="setting-row"><span>Dark Mode</span><label class="toggle-switch"><input type="checkbox" id="darkModeToggle" ${settings.theme==='dark'?'checked':''} onchange="window.toggleSetting('theme',this.checked?'dark':'light')"><span class="toggle-slider"></span></label></div></div>
      <div class="settings-card"><h3><i class="fas fa-language"></i> Language</h3><div class="setting-row"><span>Kiswahili</span><label class="toggle-switch"><input type="checkbox" id="languageToggle2" ${settings.language==='sw'?'checked':''} onchange="window.toggleSetting('language',this.checked?'sw':'en')"><span class="toggle-slider"></span></label></div></div>
      <div class="settings-card"><h3><i class="fas fa-bell"></i> Notifications</h3><div class="setting-row"><span>Enable</span><label class="toggle-switch"><input type="checkbox" id="notifToggle" ${settings.notificationsEnabled?'checked':''} onchange="window.toggleSetting('notificationsEnabled',this.checked)"><span class="toggle-slider"></span></label></div></div>
      <div class="settings-card"><h3><i class="fas fa-cog"></i> System Info</h3><div class="form-group"><label>System Name</label><input type="text" id="systemNameInput" value="${settings.systemName||'LAMS'}"></div><div class="form-group"><label>Organization</label><input type="text" id="orgNameInput" value="${settings.orgName||'Local Administration'}"></div><div class="form-group"><label>Contact Email</label><input type="email" id="contactEmailInput" value="${settings.contactEmail||'info@lams.go.tz'}"></div><div class="form-group"><label>Contact Phone</label><input type="text" id="contactPhoneInput" value="${settings.contactPhone||'+255 123 456 789'}"></div><button class="btn btn-primary" onclick="window.saveSystemSettings()"><i class="fas fa-save"></i> Save Settings</button></div>
    `;
  }

  // ==================== SECURITY CENTER ====================
  function loadSecurityCenter() {
    const pageContent = document.getElementById('pageContent');
    const s = securityLogs.filter(l=>l.status==='success').length, f = securityLogs.filter(l=>l.status==='failed').length;
    pageContent.innerHTML = `
      <h2 style="margin-bottom:20px;">Security Center</h2>
      <div class="security-stats-grid"><div class="security-stat-card"><div class="sec-icon" style="background:#e0f2fe;"><i class="fas fa-sign-in-alt" style="color:#0284c7;"></i></div><div class="stat-info"><h3>Total Logins Today</h3><p class="stat-number">${securityLogs.length}</p></div></div><div class="security-stat-card"><div class="sec-icon" style="background:#dcfce7;"><i class="fas fa-check-circle" style="color:#16a34a;"></i></div><div class="stat-info"><h3>Successful</h3><p class="stat-number">${s}</p></div></div><div class="security-stat-card"><div class="sec-icon" style="background:#fee2e2;"><i class="fas fa-exclamation-triangle" style="color:#dc2626;"></i></div><div class="stat-info"><h3>Failed</h3><p class="stat-number">${f}</p></div></div><div class="security-stat-card"><div class="sec-icon" style="background:#fef3c7;"><i class="fas fa-key" style="color:#d97706;"></i></div><div class="stat-info"><h3>Password Resets</h3><p class="stat-number">${auditLogs.filter(l=>l.action.includes('password')).length}</p></div></div></div>
      <div class="settings-card"><h3>Login Monitoring</h3><div class="table-container"><table><thead><tr><th>User</th><th>IP</th><th>Date</th><th>Time</th><th>Status</th></tr></thead><tbody>${securityLogs.map(l=>`<tr><td>${l.user}</td><td>${l.ip}</td><td>${l.date}</td><td>${l.time}</td><td><span class="badge ${l.status==='success'?'badge-success':'badge-danger'}">${l.status}</span></td></tr>`).join('')}</tbody></table></div></div>
      <div class="settings-card"><h3>Lock Controls</h3><div class="form-group"><label>Email</label><input type="email" class="search-input" placeholder="Enter user email..." id="lockEmailInput"></div><button class="btn btn-danger" onclick="window.lockAccount()"><i class="fas fa-lock"></i> Lock</button><button class="btn btn-success" style="margin-left:10px;" onclick="window.unlockAccount()"><i class="fas fa-unlock"></i> Unlock</button></div>
      <div class="settings-card"><h3>Security Alerts</h3>${auditLogs.filter(l=>l.type==='security').slice(0,5).map(l=>`<div style="padding:10px;border-bottom:1px solid var(--border);display:flex;gap:10px;"><i class="fas ${l.status==='success'?'fa-check-circle':'fa-exclamation-triangle'}" style="color:${l.status==='success'?'#16a34a':'#dc2626'};"></i><div style="flex:1;"><strong>${l.user}</strong> - ${l.action}</div><span style="font-size:0.8rem;color:var(--text-light);">${l.date} ${l.time}</span></div>`).join('')}</div>
    `;
  }

  // ==================== PROFILE PAGE ====================
  function loadProfile() {
    const pageContent = document.getElementById('pageContent');
    const session = JSON.parse(localStorage.getItem('lams_user_session') || '{}');
    const pd = JSON.parse(localStorage.getItem('lams_profile') || '{}');
    pageContent.innerHTML = `
      <h2 style="margin-bottom:20px;">Profile Settings</h2>
      <div class="profile-header"><img src="${pd.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(pd.name||'Super Admin')}&background=0066cc&color=fff&size=110`}" class="profile-avatar" id="profileAvatar"><div class="profile-info"><h2>${pd.name||'Super Administrator'}</h2><p>${pd.email||session.email||'superadmin@lams.go.tz'}</p></div><button class="btn btn-outline" onclick="document.getElementById('avatarUpload').click()" style="margin-top:10px;"><i class="fas fa-camera"></i> Change Photo</button><input type="file" id="avatarUpload" accept="image/jpeg,image/png,image/jpg" style="display:none;" onchange="window.previewAvatar(event)"></div>
      <div class="settings-card"><h3>Edit Profile</h3><div class="form-group"><label>Full Name</label><input type="text" id="profileName" value="${pd.name||''}"></div><div class="form-group"><label>Email</label><input type="email" id="profileEmail" value="${pd.email||session.email||''}"></div><div class="form-group"><label>Phone</label><input type="text" id="profilePhone" value="${pd.phone||''}"></div><button class="btn btn-primary" onclick="window.saveProfile()"><i class="fas fa-save"></i> Save</button></div>
      <div class="settings-card"><h3>Change Password</h3><div class="form-group"><label>Current</label><input type="password" id="currentPassword"></div><div class="form-group"><label>New</label><input type="password" id="newPassword"></div><div class="form-group"><label>Confirm</label><input type="password" id="confirmPassword"></div><button class="btn btn-warning" onclick="window.changePassword()"><i class="fas fa-key"></i> Change</button></div>
    `;
  }

  // ==================== ENHANCED ADD NEW ADMIN MODAL ====================
  window.showAddAdminModal = function() {
    tempAdminPhoto = null;
    const modal = document.getElementById('formModal');
    const content = document.getElementById('formModalContent');
    content.innerHTML = `
      <div class="modal-header">
        <h2><i class="fas fa-user-plus"></i> Add New Admin</h2>
        <button class="modal-close" onclick="closeModal('formModal')">&times;</button>
      </div>
      <div class="modal-body">
        <!-- Photo Upload -->
        <div class="photo-upload-wrapper">
          <div class="photo-preview-container">
            <img id="adminPhotoPreview" class="photo-preview" src="" alt="Preview" style="display:none;">
            <div class="photo-placeholder" id="adminPhotoPlaceholder" onclick="document.getElementById('adminPhotoInput').click()">
              <i class="fas fa-camera"></i>
              <span>Upload Photo</span>
            </div>
          </div>
          <input type="file" id="adminPhotoInput" class="photo-file-input" accept=".jpg,.jpeg,.png" onchange="window.previewAdminPhoto(event)">
          <button type="button" class="btn btn-sm btn-outline photo-upload-btn" onclick="document.getElementById('adminPhotoInput').click()">
            <i class="fas fa-image"></i> Choose Photo
          </button>
          <span class="photo-file-name" id="adminPhotoFileName"></span>
          <small style="display:block;color:var(--text-light);margin-top:4px;">JPG, JPEG, or PNG (optional)</small>
        </div>

        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" id="adminName" placeholder="Enter full name" required>
        </div>
        <div class="form-group">
          <label>Email *</label>
          <input type="email" id="adminEmail" placeholder="Enter email address" required>
        </div>
        <div class="form-group">
          <label>Phone *</label>
          <input type="tel" id="adminPhone" placeholder="e.g. +255 123 456 789" required>
        </div>
        <div class="form-group">
          <label>Ward *</label>
          <select id="adminWard" required>
            <option value="">Select Ward</option>
            ${wards.map(w => `<option value="${w}">${w}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Position *</label>
          <select id="adminPosition" required>
            <option value="">Select Position</option>
            <option value="Ward Officer">Ward Officer</option>
            <option value="Local Administrator">Local Administrator</option>
            <option value="Executive Officer">Executive Officer</option>
            <option value="Secretary">Secretary</option>
            <option value="Chairperson">Chairperson</option>
          </select>
        </div>
        <div class="form-group">
          <label>Start Date *</label>
          <input type="date" id="adminStartDate" required>
        </div>
        <div class="form-group">
          <label>End Date *</label>
          <input type="date" id="adminEndDate" required>
        </div>
        <div class="form-group">
          <label>Status *</label>
          <select id="adminStatus" required>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal('formModal')">Cancel</button>
        <button class="btn btn-primary" onclick="saveNewAdmin()"><i class="fas fa-save"></i> Save Admin</button>
      </div>
    `;
    modal.classList.add('active');
  };

  // Photo preview function
  window.previewAdminPhoto = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      showToast('error', 'Please select a JPG, JPEG, or PNG image');
      event.target.value = '';
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Photo must be less than 5MB');
      event.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      tempAdminPhoto = e.target.result;
      const preview = document.getElementById('adminPhotoPreview');
      const placeholder = document.getElementById('adminPhotoPlaceholder');
      preview.src = e.target.result;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
      document.getElementById('adminPhotoFileName').textContent = file.name;
    };
    reader.readAsDataURL(file);
  };

  function saveNewAdmin() {
    const name = document.getElementById('adminName').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    const phone = document.getElementById('adminPhone').value.trim();
    const ward = document.getElementById('adminWard').value;
    const position = document.getElementById('adminPosition').value;
    const startDate = document.getElementById('adminStartDate').value;
    const endDate = document.getElementById('adminEndDate').value;
    const status = document.getElementById('adminStatus').value;
    
    // Validation
    if (!name) { showToast('error', 'Full name is required'); return; }
    if (!email) { showToast('error', 'Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('error', 'Please enter a valid email address'); return; }
    if (!phone) { showToast('error', 'Phone number is required'); return; }
    if (!ward) { showToast('error', 'Please select a ward'); return; }
    if (!position) { showToast('error', 'Please select a position'); return; }
    if (!startDate) { showToast('error', 'Start date is required'); return; }
    if (!endDate) { showToast('error', 'End date is required'); return; }
    if (endDate < startDate) { showToast('error', 'End date cannot be earlier than start date'); return; }
    if (!status) { showToast('error', 'Please select a status'); return; }

    const newAdmin = {
      id: Date.now(),
      name,
      email,
      phone,
      ward,
      position,
      startDate,
      endDate,
      status,
      photo: tempAdminPhoto || ''
    };

    admins.push(newAdmin);
    saveAdmins();
    
    addAuditLog('Super Admin', `Created new admin: ${name}`, 'admin', 'success');
    addNotification(`New admin "${name}" created`, 'fa-user-plus', '#2563eb');
    
    tempAdminPhoto = null;
    closeModal('formModal');
    showToast('success', 'Admin added successfully!');
    navigateTo('admin-management');
  }

  window.editAdmin = function(id) {
    const admin = admins.find(a => a.id === id);
    if (!admin) return;
    tempAdminPhoto = admin.photo || null;
    const modal = document.getElementById('formModal');
    const content = document.getElementById('formModalContent');
    content.innerHTML = `
      <div class="modal-header"><h2><i class="fas fa-edit"></i> Edit Admin</h2><button class="modal-close" onclick="closeModal('formModal')">&times;</button></div>
      <div class="modal-body"><input type="hidden" id="editAdminId" value="${admin.id}">
        <div class="form-group"><label>Full Name</label><input type="text" id="adminName" value="${admin.name}"></div>
        <div class="form-group"><label>Email</label><input type="email" id="adminEmail" value="${admin.email}"></div>
        <div class="form-group"><label>Phone</label><input type="text" id="adminPhone" value="${admin.phone}"></div>
        <div class="form-group"><label>Ward</label><select id="adminWard">${wards.map(w => `<option value="${w}" ${admin.ward===w?'selected':''}>${w}</option>`).join('')}</select></div>
        <div class="form-group"><label>Position</label><select id="adminPosition"><option value="Ward Officer" ${admin.position==='Ward Officer'?'selected':''}>Ward Officer</option><option value="Village Officer" ${admin.position==='Village Officer'?'selected':''}>Village Officer</option><option value="Street Officer" ${admin.position==='Street Officer'?'selected':''}>Street Officer</option></select></div>
        <div class="form-group"><label>Start Date</label><input type="date" id="adminStartDate" value="${admin.startDate}"></div>
        <div class="form-group"><label>End Date</label><input type="date" id="adminEndDate" value="${admin.endDate}"></div>
      </div>
      <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('formModal')">Cancel</button><button class="btn btn-primary" onclick="updateAdmin()"><i class="fas fa-save"></i> Update Admin</button></div>
    `;
    modal.classList.add('active');
  };

  function updateAdmin() {
    const id = parseInt(document.getElementById('editAdminId').value);
    const admin = admins.find(a => a.id === id);
    if (!admin) return;
    admin.name = document.getElementById('adminName').value;
    admin.email = document.getElementById('adminEmail').value;
    admin.phone = document.getElementById('adminPhone').value;
    admin.ward = document.getElementById('adminWard').value;
    admin.position = document.getElementById('adminPosition').value;
    admin.startDate = document.getElementById('adminStartDate').value;
    admin.endDate = document.getElementById('adminEndDate').value;
    saveAdmins();
    addAuditLog('Super Admin', `Updated admin: ${admin.name}`, 'admin', 'success');
    closeModal('formModal');
    showToast('success', 'Admin updated!');
    navigateTo('admin-management');
  }

  window.viewAdmin = function(id) {
    const admin = admins.find(a => a.id === id);
    if (!admin) return;
    const modal = document.getElementById('viewModal');
    const content = document.getElementById('viewModalContent');
    content.innerHTML = `
      <div class="modal-header"><h2><i class="fas fa-eye"></i> Admin Details</h2><button class="modal-close" onclick="closeModal('viewModal')">&times;</button></div>
      <div class="modal-body">
        <div style="text-align:center;margin-bottom:20px;"><img src="${admin.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=0066cc&color=fff&size=80`}" style="border-radius:50%;width:80px;height:80px;object-fit:cover;margin-bottom:10px;"><h3>${admin.name}</h3><p style="color:var(--text-light);">${admin.position}</p><span class="badge ${admin.status==='active'?'badge-success':admin.status==='suspended'?'badge-danger':'badge-warning'}">${admin.status}</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"><p><strong>Email:</strong><br>${admin.email}</p><p><strong>Phone:</strong><br>${admin.phone}</p><p><strong>Ward:</strong><br>${admin.ward||'N/A'}</p><p><strong>Position:</strong><br>${admin.position}</p><p><strong>Start:</strong><br>${admin.startDate}</p><p><strong>End:</strong><br>${admin.endDate}</p></div>
      </div>
    `;
    modal.classList.add('active');
  };

  window.suspendAdmin = function(id) { showConfirm('Suspend Admin', 'Are you sure you want to suspend this admin?', () => { const a = admins.find(x => x.id === id); if (a) { a.status = 'suspended'; saveAdmins(); addAuditLog('Super Admin', `Suspended: ${a.name}`, 'admin', 'warning'); showToast('warning', 'Admin suspended'); navigateTo('admin-management'); } }); };
  window.activateAdmin = function(id) { const a = admins.find(x => x.id === id); if (a) { a.status = 'active'; saveAdmins(); addAuditLog('Super Admin', `Activated: ${a.name}`, 'admin', 'success'); showToast('success', 'Admin activated'); navigateTo('admin-management'); } };
  window.resetAdminPassword = function(id) { showConfirm('Reset Password', 'Reset password for this admin?', () => { const a = admins.find(x => x.id === id); if (a) { addAuditLog('Super Admin', `Reset password: ${a.name}`, 'security', 'warning'); showToast('info', `Password reset for ${a.name}`); } }); };
  window.deleteAdmin = function(id) { showConfirm('Remove Admin', 'Permanently remove this admin?', () => { const a = admins.find(x => x.id === id); admins = admins.filter(x => x.id !== id); saveAdmins(); addAuditLog('Super Admin', `Removed: ${a?a.name:'Unknown'}`, 'admin', 'error'); showToast('success', 'Admin removed'); navigateTo('admin-management'); }); };

  // ==================== LEADERSHIP MANAGEMENT ====================
  window.showLeadershipModal = function() {
    const modal = document.getElementById('formModal');
    const content = document.getElementById('formModalContent');
    content.innerHTML = `
      <div class="modal-header"><h2><i class="fas fa-crown" style="color:#f59e0b;"></i> Appoint / Transfer</h2><button class="modal-close" onclick="closeModal('formModal')">&times;</button></div>
      <div class="modal-body"><div class="form-group"><label>Current Leader (Optional)</label><select id="currentLeader"><option value="">No current leader</option>${admins.filter(a=>a.status==='active').map(a=>`<option value="${a.id}">${a.name} (${a.ward||'No Ward'})</option>`).join('')}</select></div><div class="form-group"><label>New Leader *</label><select id="newLeader"><option value="">Select new leader</option>${admins.map(a=>`<option value="${a.id}">${a.name} (${a.ward||'No Ward'})</option>`).join('')}</select></div><div class="form-group"><label>Transfer Date</label><input type="date" id="transferDate"></div><div class="form-group"><label>Reason</label><textarea id="transferReason" rows="3"></textarea></div></div>
      <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('formModal')">Cancel</button><button class="btn btn-warning" onclick="executeLeadershipTransfer()">Transfer</button></div>
    `;
    modal.classList.add('active');
  };

  function executeLeadershipTransfer() {
    const newId = document.getElementById('newLeader').value;
    if (!newId) { showToast('error', 'Select a new leader'); return; }
    const currentAdmin = document.getElementById('currentLeader').value ? admins.find(a => a.id === parseInt(document.getElementById('currentLeader').value)) : null;
    const newAdmin = admins.find(a => a.id === parseInt(newId));
    if (newAdmin) {
      leadershipHistory.push({ date: document.getElementById('transferDate').value || new Date().toISOString().split('T')[0], from: currentAdmin ? currentAdmin.name : 'New Appointment', to: newAdmin.name, reason: document.getElementById('transferReason').value || 'Transfer' });
      localStorage.setItem('lams_leadership_history', JSON.stringify(leadershipHistory));
      if (currentAdmin) { const tp = currentAdmin.position; currentAdmin.position = newAdmin.position; newAdmin.position = tp; saveAdmins(); }
      addAuditLog('Super Admin', `Leadership transfer`, 'admin', 'warning');
      closeModal('formModal'); showToast('success', 'Leadership transferred!'); navigateTo('admin-management');
    }
  }

  window.viewLeadershipHistory = function() {
    const div = document.getElementById('leadershipHistory');
    div.innerHTML = leadershipHistory.length === 0 ? '<p style="color:var(--text-light);">No transfers recorded.</p>' : `<h4>Transfer History</h4><div class="table-container"><table><thead><tr><th>Date</th><th>From</th><th>To</th><th>Reason</th></tr></thead><tbody>${leadershipHistory.map(h=>`<tr><td>${h.date}</td><td>${h.from}</td><td>${h.to}</td><td>${h.reason}</td></tr>`).join('')}</tbody></table></div>`;
    div.style.display = 'block';
  };

  window.extendLeadershipTerm = function() {
    const modal = document.getElementById('formModal');
    const content = document.getElementById('formModalContent');
    content.innerHTML = `<div class="modal-header"><h2>Extend Term</h2><button class="modal-close" onclick="closeModal('formModal')">&times;</button></div><div class="modal-body"><div class="form-group"><label>Admin</label><select id="extendAdminId">${admins.filter(a=>a.status==='active').map(a=>`<option value="${a.id}">${a.name} (Ends: ${a.endDate})</option>`).join('')}</select></div><div class="form-group"><label>New End Date</label><input type="date" id="newEndDate"></div></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('formModal')">Cancel</button><button class="btn btn-primary" onclick="executeExtendTerm()">Extend</button></div>`;
    modal.classList.add('active');
  };
  function executeExtendTerm() { const a = admins.find(x => x.id === parseInt(document.getElementById('extendAdminId').value)); if (a && document.getElementById('newEndDate').value) { a.endDate = document.getElementById('newEndDate').value; saveAdmins(); addAuditLog('Super Admin', `Extended term: ${a.name}`, 'admin', 'success'); closeModal('formModal'); showToast('success', 'Term extended!'); navigateTo('admin-management'); } }

  window.endLeadershipTerm = function() {
    const modal = document.getElementById('formModal');
    const content = document.getElementById('formModalContent');
    content.innerHTML = `<div class="modal-header"><h2>End Term</h2><button class="modal-close" onclick="closeModal('formModal')">&times;</button></div><div class="modal-body"><div class="form-group"><label>Admin</label><select id="endAdminId">${admins.filter(a=>a.status==='active').map(a=>`<option value="${a.id}">${a.name} (${a.ward||'No Ward'})</option>`).join('')}</select></div><div class="form-group"><label>Reason</label><textarea id="endReason" rows="3"></textarea></div></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('formModal')">Cancel</button><button class="btn btn-danger" onclick="executeEndTerm()">End Term</button></div>`;
    modal.classList.add('active');
  };
  function executeEndTerm() { const a = admins.find(x => x.id === parseInt(document.getElementById('endAdminId').value)); if (a) { a.status = 'inactive'; a.endDate = new Date().toISOString().split('T')[0]; saveAdmins(); leadershipHistory.push({ date: new Date().toISOString().split('T')[0], from: a.name, to: 'Position Vacated', reason: document.getElementById('endReason').value || 'Term ended' }); localStorage.setItem('lams_leadership_history', JSON.stringify(leadershipHistory)); addAuditLog('Super Admin', `Ended term: ${a.name}`, 'admin', 'warning'); closeModal('formModal'); showToast('success', 'Term ended!'); navigateTo('admin-management'); } }

  // ==================== CITIZEN OPERATIONS ====================
  window.viewCitizen = function(id) {
    const c = citizens.find(x => x.id === id);
    if (!c) return;
    const modal = document.getElementById('viewModal');
    const content = document.getElementById('viewModalContent');
    content.innerHTML = `<div class="modal-header"><h2>Citizen Details</h2><button class="modal-close" onclick="closeModal('viewModal')">&times;</button></div><div class="modal-body"><div style="text-align:center;margin-bottom:20px;"><img src="https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0066cc&color=fff&size=80" style="border-radius:50%;"><h3>${c.name}</h3><span class="badge ${c.status==='active'?'badge-success':'badge-warning'}">${c.status}</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"><p><strong>ID:</strong><br>${c.id}</p><p><strong>Email:</strong><br>${c.email}</p><p><strong>Phone:</strong><br>${c.phone}</p><p><strong>Ward:</strong><br>${c.ward}</p><p><strong>Status:</strong><br>${c.status}</p><p><strong>Registered:</strong><br>${c.registeredDate}</p></div></div>`;
    modal.classList.add('active');
  };

  // ==================== FILTER FUNCTIONS ====================
  window.filterAdmins = function() {
    const search = (document.getElementById('adminSearch')?.value || '').toLowerCase();
    const status = document.getElementById('adminStatusFilter')?.value || 'all';
    const ward = document.getElementById('adminWardFilter')?.value || 'all';
    let filtered = [...admins];
    if (search) filtered = filtered.filter(a => a.name.toLowerCase().includes(search) || a.email.toLowerCase().includes(search));
    if (status !== 'all') filtered = filtered.filter(a => a.status === status);
    if (ward !== 'all') filtered = filtered.filter(a => a.ward === ward);
    const tbody = document.getElementById('adminTableBody');
    if (tbody) tbody.innerHTML = filtered.slice(0, itemsPerPage).map((a, i) => `<tr><td>${i+1}</td><td><img src="${a.photo||`https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=0066cc&color=fff&size=35`}" style="border-radius:50%;width:35px;height:35px;object-fit:cover;"></td><td>${a.name}</td><td>${a.ward||'N/A'}</td><td>${a.email}</td><td>${a.phone}</td><td>${a.position}</td><td><span class="badge ${a.status==='active'?'badge-success':a.status==='suspended'?'badge-danger':'badge-warning'}">${a.status}</span></td><td>${a.startDate}</td><td>${a.endDate}</td><td><div style="display:flex;gap:4px;flex-wrap:wrap;"><button class="btn btn-sm btn-outline" onclick="window.viewAdmin(${a.id})"><i class="fas fa-eye"></i></button><button class="btn btn-sm btn-primary" onclick="window.editAdmin(${a.id})"><i class="fas fa-edit"></i></button>${a.status==='active'?`<button class="btn btn-sm btn-warning" onclick="window.suspendAdmin(${a.id})"><i class="fas fa-pause"></i></button>`:`<button class="btn btn-sm btn-success" onclick="window.activateAdmin(${a.id})"><i class="fas fa-play"></i></button>`}<button class="btn btn-sm btn-outline" onclick="window.resetAdminPassword(${a.id})"><i class="fas fa-key"></i></button><button class="btn btn-sm btn-danger" onclick="window.deleteAdmin(${a.id})"><i class="fas fa-trash"></i></button></div></td></tr>`).join('');
  };
  window.filterCitizens = function() { /* existing filter logic preserved */ };
  window.filterAuditLogs = function() { /* existing filter logic preserved */ };

  window.changeAdminPage = function(p) { currentAdminPage = p; navigateTo('admin-management'); };
  window.changeCitizenPage = function(p) { currentCitizenPage = p; navigateTo('citizen-monitoring'); };
  window.changeAuditPage = function(p) { currentAuditPage = p; navigateTo('audit-logs'); };

  window.exportAuditLogs = function() {
    const csv = 'User,Role,Action,Type,Date,Time,Status\n' + auditLogs.map(l => `"${l.user}","${l.role||''}","${l.action}","${l.type}","${l.date}","${l.time}","${l.status}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'lams_audit_logs.csv'; a.click(); URL.revokeObjectURL(url);
    showToast('success', 'CSV exported!');
  };
  window.printAuditLogs = function() { window.print(); };

  window.toggleSetting = function(k, v) { settings[k] = v; saveSettings(); if (k==='theme') { document.body.classList.toggle('dark-mode', v==='dark'); document.getElementById('themeToggle').innerHTML = v==='dark'?'<i class="fas fa-sun"></i>':'<i class="fas fa-moon"></i>'; } showToast('success', 'Setting updated!'); };
  window.saveSystemSettings = function() { settings.systemName = document.getElementById('systemNameInput')?.value; settings.orgName = document.getElementById('orgNameInput')?.value; settings.contactEmail = document.getElementById('contactEmailInput')?.value; settings.contactPhone = document.getElementById('contactPhoneInput')?.value; saveSettings(); showToast('success', 'Settings saved!'); };

  window.lockAccount = function() { const e = document.getElementById('lockEmailInput')?.value; if (!e) { showToast('error', 'Enter email'); return; } addAuditLog('Super Admin', `Locked: ${e}`, 'security', 'warning'); showToast('warning', `Account ${e} locked`); };
  window.unlockAccount = function() { const e = document.getElementById('lockEmailInput')?.value; if (!e) { showToast('error', 'Enter email'); return; } addAuditLog('Super Admin', `Unlocked: ${e}`, 'security', 'success'); showToast('success', `Account ${e} unlocked`); };

  window.previewAvatar = function(event) {
    const file = event.target.files[0];
    if (file) { const reader = new FileReader(); reader.onload = function(e) { document.getElementById('profileAvatar').src = e.target.result; window._tempAvatar = e.target.result; }; reader.readAsDataURL(file); }
  };
  window.saveProfile = function() {
    const pd = JSON.parse(localStorage.getItem('lams_profile') || '{}');
    pd.name = document.getElementById('profileName')?.value || pd.name;
    pd.email = document.getElementById('profileEmail')?.value || pd.email;
    pd.phone = document.getElementById('profilePhone')?.value || pd.phone;
    if (window._tempAvatar) { pd.avatar = window._tempAvatar; window._tempAvatar = null; }
    localStorage.setItem('lams_profile', JSON.stringify(pd));
    updateUserInfo(JSON.parse(localStorage.getItem('lams_user_session') || '{}'));
    showToast('success', 'Profile saved!');
  };
  window.changePassword = function() {
    const n = document.getElementById('newPassword')?.value, c = document.getElementById('confirmPassword')?.value;
    if (n !== c) { showToast('error', 'Passwords do not match'); return; }
    if (n.length < 6) { showToast('error', 'Minimum 6 characters'); return; }
    localStorage.setItem('lams_superadmin_password', n);
    addAuditLog('Super Admin', 'Changed password', 'security', 'success');
    showToast('success', 'Password changed!');
  };

  function closeModal(id) { document.getElementById(id).classList.remove('active'); }
  function showConfirm(title, message, callback) { document.getElementById('confirmTitle').textContent = title; document.getElementById('confirmMessage').textContent = message; confirmCallback = callback; document.getElementById('confirmModal').classList.add('active'); }
  window.closeConfirmModal = function() { document.getElementById('confirmModal').classList.remove('active'); confirmCallback = null; };
  window.executeConfirmAction = function() { if (confirmCallback) confirmCallback(); closeConfirmModal(); };

  function setupLogout() { document.getElementById('logoutBtn')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('logoutModalOverlay').classList.add('active'); }); }
  window.closeLogoutModal = function() { document.getElementById('logoutModalOverlay').classList.remove('active'); };
  window.executeLogout = function() { addAuditLog('Super Admin', 'Logged out', 'security', 'success'); localStorage.removeItem('lams_user_session'); window.location.href = 'login.html'; };

  function setupNotifications() {
    const bell = document.getElementById('notificationBell'), dd = document.getElementById('notificationDropdown');
    renderNotifications();
    bell?.addEventListener('click', (e) => { e.stopPropagation(); dd.classList.toggle('show'); });
    document.addEventListener('click', () => dd?.classList.remove('show'));
    document.getElementById('clearAllNotifications')?.addEventListener('click', () => { notifications = []; saveNotifications(); renderNotifications(); showToast('success', 'Cleared'); });
  }
  function renderNotifications() {
    const list = document.getElementById('notificationList'), count = document.getElementById('notificationCount');
    if (!list || !count) return;
    const unread = notifications.filter(n => !n.read).length;
    count.textContent = unread; count.style.display = unread > 0 ? 'flex' : 'none';
    list.innerHTML = notifications.length === 0 ? '<p class="no-notifications">No notifications</p>' : notifications.map(n => `<div class="notification-item ${n.read?'':'unread'}"><div class="notif-icon" style="background:${n.color}20;"><i class="fas ${n.icon}" style="color:${n.color};"></i></div><div class="notif-content"><p>${n.message}</p><span>${n.time}</span></div></div>`).join('');
  }
  function addNotification(m, i, c) { notifications.unshift({ id: Date.now(), message: m, time: 'Just now', read: false, icon: i, color: c }); if (notifications.length > 20) notifications.pop(); saveNotifications(); renderNotifications(); }
  function addAuditLog(user, action, type, status) { const now = new Date(); auditLogs.unshift({ id: Date.now(), user, role: user === 'Super Admin' ? 'Super Admin' : 'Admin', action, type, date: now.toISOString().split('T')[0], time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }), status }); if (auditLogs.length > 100) auditLogs.pop(); saveAuditLogs(); }

  function setupTheme() {
    const btn = document.getElementById('themeToggle');
    if (settings.theme === 'dark') { document.body.classList.add('dark-mode'); btn.innerHTML = '<i class="fas fa-sun"></i>'; }
    btn?.addEventListener('click', () => { const isDark = !document.body.classList.contains('dark-mode'); document.body.classList.toggle('dark-mode'); btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'; settings.theme = isDark ? 'dark' : 'light'; saveSettings(); });
  }
  function setupLanguage() {
    const btn = document.getElementById('languageToggle'), txt = document.querySelector('.lang-text');
    if (settings.language === 'sw') { isEnglish = false; txt.textContent = 'SW'; }
    btn?.addEventListener('click', () => { isEnglish = !isEnglish; txt.textContent = isEnglish ? 'EN' : 'SW'; settings.language = isEnglish ? 'en' : 'sw'; saveSettings(); showToast('info', isEnglish ? 'English' : 'Kiswahili'); });
  }

  function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div'); toast.className = `toast toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    toast.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  window.navigateTo = navigateTo;
  window.showToast = showToast;
  window.showConfirm = showConfirm;
  window.closeModal = closeModal;
  window.closeConfirmModal = closeConfirmModal;
  window.executeConfirmAction = executeConfirmAction;
  window.addNotification = addNotification;
  window.addAuditLog = addAuditLog;
  window.closeLogoutModal = closeLogoutModal;
  window.executeLogout = executeLogout;

  init();
})();