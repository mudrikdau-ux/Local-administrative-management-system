document.addEventListener('DOMContentLoaded', () => {
  const API = window.API;
  if (!API) { console.error('API not loaded'); return; }

  let currentAdmin = null;
  let citizens = [];
  let documents = [];
  let payments = [];
  let announcements = [];
  let notifications = [];
  let messages = {};
  let selectedChatContact = null;
  let currentPage = 'dashboard';
  let socket = null;

  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const themeToggle = document.getElementById('themeToggle');
  const settingTheme = document.getElementById('settingTheme');
  const notifBadge = document.getElementById('notifBadge');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const notifListContainer = document.getElementById('notifListContainer');
  const profileDropdownMenu = document.getElementById('profileDropdownMenu');
  const profileDropdownBtn = document.getElementById('profileDropdownBtn');

  function showToast(message, isError = false) {
    const toast = document.getElementById('successToast');
    const toastMsg = document.getElementById('toastMessage');
    toastMsg.textContent = message;
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function updateClock() {
    const now = new Date();
    document.getElementById('liveDate').textContent = now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    document.getElementById('liveClock').textContent = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  }
  setInterval(updateClock, 1000); updateClock();

  function navigateToPage(pageName) {
    currentPage = pageName;
    document.querySelectorAll('.sidebar-link[data-page]').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-link[data-page="${pageName}"]`);
    if (activeLink) activeLink.classList.add('active');
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(`page-${pageName}`);
    if (page) page.classList.add('active');
    if (window.innerWidth <= 992) sidebar.classList.remove('active');
    if (pageName === 'dashboard') loadDashboard();
    if (pageName === 'reports') renderCharts();
    if (pageName === 'messages') loadConversations();
    if (pageName === 'citizens') loadCitizens();
    if (pageName === 'documents') loadDocuments();
    if (pageName === 'payments') loadPayments();
    if (pageName === 'announcements') loadAnnouncements();
    if (pageName === 'profile') loadProfile();
    if (pageName === 'settings') loadSettings();
  }

  document.querySelectorAll('.sidebar-link[data-page]').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); navigateToPage(link.dataset.page); });
  });
  document.querySelectorAll('[data-page]').forEach(el => {
    if (!el.classList.contains('sidebar-link')) el.addEventListener('click', () => navigateToPage(el.dataset.page));
  });

  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('active'));

  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') { body.classList.add('dark-mode'); themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; if(settingTheme) settingTheme.value = 'dark'; }
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if(settingTheme) settingTheme.value = isDark ? 'dark' : 'light';
    if (API && API.isAuthenticated()) {
      API.admin.updateSettings({ theme: isDark ? 'dark' : 'light' }).catch(() => {});
    }
  });
  if(settingTheme) settingTheme.addEventListener('change', () => {
    if(settingTheme.value === 'dark') { body.classList.add('dark-mode'); themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; }
    else { body.classList.remove('dark-mode'); themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; }
    localStorage.setItem('theme', settingTheme.value);
    if (API && API.isAuthenticated()) {
      API.admin.updateSettings({ theme: settingTheme.value }).catch(() => {});
    }
  });

  profileDropdownBtn.addEventListener('click', (e) => { e.stopPropagation(); profileDropdownMenu.classList.toggle('active'); });
  document.addEventListener('click', (e) => {
    if(!notificationDropdown.contains(e.target)) notificationDropdown.classList.remove('active');
    if(!profileDropdownMenu.contains(e.target) && e.target !== profileDropdownBtn) profileDropdownMenu.classList.remove('active');
    document.querySelectorAll('.action-dropdown-menu.active').forEach(d => d.classList.remove('active'));
  });

  document.getElementById('logoutSidebarLink').addEventListener('click', (e) => { e.preventDefault(); openLogoutModal(); });
  document.getElementById('logoutDropdownLink').addEventListener('click', (e) => { e.preventDefault(); openLogoutModal(); });
  document.getElementById('confirmLogoutBtn').addEventListener('click', async () => {
    try { await API.auth.logout(); } catch(e) {}
    window.location.href = 'login.html';
  });

  function openLogoutModal() { openModal('logoutModalOverlay', 'logoutModal'); }
  function openModal(overlayId, modalId) { document.getElementById(overlayId).classList.add('active'); document.getElementById(modalId).classList.add('active'); }
  function closeModal(overlayId, modalId) { document.getElementById(overlayId).classList.remove('active'); document.getElementById(modalId).classList.remove('active'); }
  document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', () => {
    o.classList.remove('active');
    document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  }));
  document.querySelectorAll('.modal-close-btn').forEach(b => b.addEventListener('click', () => {
    b.closest('.modal').classList.remove('active');
    document.querySelectorAll('.modal-overlay.active').forEach(o => o.classList.remove('active'));
  }));

  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => { if(window.scrollY > 400) backToTop.classList.add('visible'); else backToTop.classList.remove('visible'); });
  backToTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  async function checkAuth() {
    const token = API.getToken();
    if (!token) { window.location.href = 'login.html'; return false; }
    try {
      const res = await API.admin.getProfile();
      if (res.success) {
        currentAdmin = res.data?.admin || res.data || {};
        updateUserInfo();
        return true;
      } else { window.location.href = 'login.html'; return false; }
    } catch(e) { window.location.href = 'login.html'; return false; }
  }

  function updateUserInfo() {
    const name = currentAdmin?.full_name || currentAdmin?.name || 'Administrator';
    document.getElementById('profileDisplayName').textContent = name;
    document.getElementById('dashboardGreeting').textContent = `Welcome back, ${name}`;
    const email = currentAdmin?.email || 'admin@lams.go.tz';
    document.getElementById('profileEmail').textContent = email;
    const phone = currentAdmin?.phone || '+255 123 456 789';
    document.getElementById('profilePhone').textContent = phone;
    const ward = currentAdmin?.ward_name || 'Not Assigned';
    document.getElementById('profileWard').textContent = ward;
    const pos = currentAdmin?.position_name || 'Administrator';
    document.getElementById('profilePosition').textContent = pos;
    if (currentAdmin?.profile_photo) {
      document.getElementById('profileAvatarPreview').src = currentAdmin.profile_photo;
    }
  }

  function renderNotifications() {
    notifListContainer.innerHTML = (notifications || []).map(n => 
      `<div class="notif-item ${n.is_read ? '' : 'unread'}"><i class="fas fa-bell"></i><div><p>${n.message || n.title}</p><small>${n.created_at ? new Date(n.created_at).toLocaleString() : 'Just now'}</small></div></div>`
    ).join('');
    const unreadCount = (notifications || []).filter(n => !n.is_read).length;
    notifBadge.textContent = unreadCount || '0';
  }

  document.getElementById('notificationBtn').addEventListener('click', (e) => { e.stopPropagation(); notificationDropdown.classList.toggle('active'); });
  document.getElementById('markAllRead').addEventListener('click', async () => {
    try { await API.admin.markAllNotifsRead(); loadNotifications(); } catch(e) {}
  });

  async function loadNotifications() {
    try {
      const res = await API.admin.getNotifications(1, 20);
      if (res.success) { notifications = res.data?.notifications || res.data || []; renderNotifications(); }
    } catch(e) { console.error('Load notifications error:', e); }
  }

  async function loadDashboard() {
    try {
      const res = await API.admin.getDashboard();
      if (res.success) {
        const data = res.data || {};
        const stats = data.overview || data.summary_cards || {};
        document.getElementById('dashboardStatsGrid').innerHTML = `
          <div class="stat-card"><div class="stat-icon"><i class="fas fa-users"></i></div><div class="stat-info"><span class="stat-number">${stats.total_citizens || 0}</span><span class="stat-label">Total Citizens</span></div></div>
          <div class="stat-card"><div class="stat-icon"><i class="fas fa-file-alt"></i></div><div class="stat-info"><span class="stat-number">${stats.document_requests || 0}</span><span class="stat-label">Document Requests</span></div></div>
          <div class="stat-card"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><span class="stat-number">${stats.documents_sent || 0}</span><span class="stat-label">Documents Sent</span></div></div>
          <div class="stat-card"><div class="stat-icon" style="color:#f59e0b;"><i class="fas fa-clock"></i></div><div class="stat-info"><span class="stat-number">${stats.pending_requests || 0}</span><span class="stat-label">Pending Requests</span></div></div>
          <div class="stat-card"><div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div><div class="stat-info"><span class="stat-number">${stats.paid_transactions || 0}</span><span class="stat-label">Paid Transactions</span></div></div>
          <div class="stat-card"><div class="stat-icon" style="color:#f59e0b;"><i class="fas fa-coins"></i></div><div class="stat-info"><span class="stat-number">${(stats.total_revenue || 0).toLocaleString()}</span><span class="stat-label">Total Revenue (TZS)</span></div></div>
          <div class="stat-card"><div class="stat-icon"><i class="fas fa-bullhorn"></i></div><div class="stat-info"><span class="stat-number">${stats.announcements || 0}</span><span class="stat-label">Announcements</span></div></div>
          <div class="stat-card"><div class="stat-icon"><i class="fas fa-comments"></i></div><div class="stat-info"><span class="stat-number">${stats.unread_messages || 0}</span><span class="stat-label">Unread Messages</span></div></div>
        `;
        const activities = data.recent_activities || data.activities || [];
        document.getElementById('activityFeed').innerHTML = activities.length > 0 ? activities.slice(0,5).map(a => 
          `<div class="activity-item"><i class="fas fa-${a.type === 'citizen' ? 'user-plus' : a.type === 'document' ? 'file-alt' : a.type === 'payment' ? 'credit-card' : 'bell'}"></i><div><p>${a.description || a.action}</p><small>${a.created_at ? new Date(a.created_at).toLocaleString() : 'Just now'}</small></div></div>`
        ).join('') : '<p style="color:var(--text-light);">No recent activity</p>';
      }
    } catch(e) { console.error('Dashboard error:', e); }
  }

  async function loadCitizens() {
    try {
      const res = await API.admin.getCitizens(1, 100);
      if (res.success) { citizens = res.data?.data || res.data || []; renderCitizens(); }
    } catch(e) { console.error('Load citizens error:', e); }
  }

  function renderCitizens() {
    const tbody = document.getElementById('citizenTableBody');
    if (!citizens || citizens.length === 0) { tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;">No citizens found</td></tr>'; return; }
    tbody.innerHTML = citizens.map(c => `
      <tr>
        <td><img src="${c.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name||c.name)}&background=0066cc&color=fff&size=32`}" class="avatar-sm" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22%3E%3Crect width=%2232%22 height=%2232%22 fill=%22%230066cc%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.35em%22 fill=%22white%22 font-size=%2214%22 font-family=%22Arial%22%3E${(c.full_name||c.name||'?').charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E'"></td>
        <td><strong>#${c.id || c.citizen_id}</strong></td>
        <td>${c.full_name || c.name}</td>
        <td>${c.email || 'N/A'}</td>
        <td>${c.phone || 'N/A'}</td>
        <td>${c.address || 'N/A'}</td>
        <td><span class="status-badge status-${(c.status||'active').toLowerCase()}">${c.status || 'Active'}</span></td>
        <td>${c.registration_date ? new Date(c.registration_date).toLocaleDateString() : 'N/A'}</td>
        <td><button class="btn-sm btn-edit" data-id="${c.id || c.citizen_id}">Edit</button><button class="btn-sm btn-delete" data-id="${c.id || c.citizen_id}">Delete</button></td>
      </tr>
    `).join('');
    document.querySelectorAll('#citizenTableBody .btn-edit').forEach(b => b.addEventListener('click', () => editCitizen(b.dataset.id)));
    document.querySelectorAll('#citizenTableBody .btn-delete').forEach(b => b.addEventListener('click', () => deleteCitizen(b.dataset.id)));
  }

  document.getElementById('addCitizenBtn').addEventListener('click', () => {
    document.getElementById('citizenForm').reset();
    document.getElementById('citizenEditId').value = '';
    document.getElementById('citizenModalTitle').textContent = 'Add New Citizen';
    openModal('citizenModalOverlay', 'citizenModal');
  });

  document.getElementById('citizenForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('citizenEditId').value;
    const data = {
      full_name: document.getElementById('cName').value,
      email: document.getElementById('cEmail').value || undefined,
      phone: document.getElementById('cPhone').value,
      address: document.getElementById('cAddress').value || undefined,
      status: document.getElementById('cStatus').value
    };
    try {
      let res;
      if (editId) { res = await API.admin.updateCitizen(editId, data); }
      else { res = await API.admin.createCitizen(data); }
      if (res.success) { showToast(editId ? 'Citizen updated!' : 'Citizen added!'); closeModal('citizenModalOverlay', 'citizenModal'); loadCitizens(); loadDashboard(); }
      else { showToast(res.message || 'Failed', true); }
    } catch(e) { showToast('Network error', true); }
  });

  async function editCitizen(id) {
    const c = citizens.find(c => (c.id || c.citizen_id) == id);
    if (!c) return;
    document.getElementById('citizenEditId').value = c.id || c.citizen_id;
    document.getElementById('cName').value = c.full_name || c.name;
    document.getElementById('cEmail').value = c.email || '';
    document.getElementById('cPhone').value = c.phone || '';
    document.getElementById('cAddress').value = c.address || '';
    document.getElementById('cStatus').value = c.status || 'active';
    document.getElementById('citizenModalTitle').textContent = 'Edit Citizen';
    openModal('citizenModalOverlay', 'citizenModal');
  }

  async function deleteCitizen(id) {
    if (!confirm('Delete this citizen?')) return;
    try {
      const res = await API.admin.deleteCitizen(id);
      if (res.success) { showToast('Citizen deleted'); loadCitizens(); loadDashboard(); }
      else { showToast(res.message || 'Failed', true); }
    } catch(e) { showToast('Network error', true); }
  }

  document.getElementById('citizenSearch').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#citizenTableBody tr').forEach(row => row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none');
  });
  document.getElementById('citizenStatusFilter').addEventListener('change', (e) => {
    const val = e.target.value;
    document.querySelectorAll('#citizenTableBody tr').forEach(row => {
      if (val === 'all') row.style.display = '';
      else row.style.display = (row.querySelector('.status-badge')?.textContent?.trim()?.toLowerCase() || '') === val ? '' : 'none';
    });
  });

  async function loadDocuments() {
    try {
      const res = await API.admin.getDocuments(1, 100);
      if (res.success) { documents = res.data?.data || res.data || []; renderDocuments(); }
    } catch(e) { console.error('Load documents error:', e); }
  }

  function renderDocuments() {
    const tbody = document.getElementById('docTableBody');
    if (!documents || documents.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">No document requests</td></tr>'; return; }
    tbody.innerHTML = documents.map(d => {
      const canSend = (d.payment_status === 'paid' || d.payment_status === 'exempted') && d.request_status !== 'completed' && d.file_path;
      return `
      <tr>
        <td><img src="https://ui-avatars.com/api/?name=${encodeURIComponent(d.citizen_name||'')}&background=0066cc&color=fff&size=32" class="avatar-sm"></td>
        <td>${d.citizen_name}</td>
        <td>${d.document_type}</td>
        <td>${d.date_requested ? new Date(d.date_requested).toLocaleDateString() : 'N/A'}</td>
        <td><span class="status-badge status-${(d.payment_status||'unpaid').toLowerCase()}">${d.payment_status || 'Unpaid'}</span></td>
        <td><span class="status-badge status-${(d.request_status||'pending').toLowerCase()}">${d.request_status || 'Pending'}</span></td>
        <td>
          <div class="action-dropdown-wrapper">
            <button class="btn-sm btn-action" onclick="toggleDocAction(event, '${d.id}')"><i class="fas fa-ellipsis-v"></i> Action</button>
            <div class="action-dropdown-menu" id="docActionMenu-${d.id}">
              <button onclick="viewDoc('${d.id}')"><i class="fas fa-eye"></i> View</button>
              <button onclick="uploadDoc('${d.id}')"><i class="fas fa-upload"></i> Upload</button>
              ${d.file_path ? `<button onclick="previewDoc('${d.id}')"><i class="fas fa-file-pdf"></i> Preview</button>` : ''}
              <button onclick="sendDoc('${d.id}')" ${!canSend ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                <i class="fas fa-paper-plane"></i> ${canSend ? 'Send' : d.payment_status === 'paid' ? 'No File' : 'Waiting Payment'}
              </button>
            </div>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  window.toggleDocAction = function(e, id) {
    e.stopPropagation();
    document.querySelectorAll('.action-dropdown-menu.active').forEach(d => d.classList.remove('active'));
    const menu = document.getElementById('docActionMenu-' + id);
    if (menu) menu.classList.toggle('active');
  };

  window.viewDoc = function(id) {
    const doc = documents.find(d => (d.id || d.document_request_id) == id);
    if (!doc) return;
    alert(`Document Details:\nCitizen: ${doc.citizen_name}\nType: ${doc.document_type}\nDate: ${doc.date_requested}\nPayment: ${doc.payment_status}\nStatus: ${doc.request_status}\nNotes: ${doc.notes || 'None'}`);
    document.querySelectorAll('.action-dropdown-menu.active').forEach(d => d.classList.remove('active'));
  };

  window.uploadDoc = function(id) {
    const doc = documents.find(d => (d.id || d.document_request_id) == id);
    if (!doc) return;
    document.getElementById('docUploadId').value = doc.id || doc.document_request_id;
    document.getElementById('docUploadCitizen').value = doc.citizen_name;
    document.getElementById('docUploadType').value = doc.document_type;
    document.getElementById('docUploadNotes').value = doc.notes || '';
    document.getElementById('docUploadFile').value = '';
    openModal('docUploadModalOverlay', 'docUploadModal');
    document.querySelectorAll('.action-dropdown-menu.active').forEach(d => d.classList.remove('active'));
  };

  window.previewDoc = function(id) {
    const doc = documents.find(d => (d.id || d.document_request_id) == id);
    if (!doc || !doc.file_path) return;
    const previewContent = document.getElementById('docPreviewContent');
    const fileExt = (doc.file_path || '').split('.').pop()?.toLowerCase();
    if (['jpg','jpeg','png'].includes(fileExt)) {
      previewContent.innerHTML = `<img src="${doc.file_path}" alt="Preview" style="max-width:100%;max-height:400px;border-radius:8px;" onerror="this.innerHTML='<p>Cannot preview this file</p>'">`;
    } else if (fileExt === 'pdf') {
      previewContent.innerHTML = `<iframe src="${doc.file_path}" width="100%" height="400px" style="border-radius:8px;"></iframe>`;
    } else {
      previewContent.innerHTML = `<p>File: ${doc.file_path.split('/').pop()}</p><a href="${doc.file_path}" download class="btn btn-primary"><i class="fas fa-download"></i> Download</a>`;
    }
    openModal('docPreviewModalOverlay', 'docPreviewModal');
    document.querySelectorAll('.action-dropdown-menu.active').forEach(d => d.classList.remove('active'));
  };

  window.sendDoc = async function(id) {
    try {
      const res = await API.admin.sendDocument(id);
      if (res.success) { showToast('Document sent!'); loadDocuments(); loadDashboard(); }
      else { showToast(res.message || 'Failed', true); }
    } catch(e) { showToast('Network error', true); }
    document.querySelectorAll('.action-dropdown-menu.active').forEach(d => d.classList.remove('active'));
  };

  document.getElementById('docUploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const docId = document.getElementById('docUploadId').value;
    const fileInput = document.getElementById('docUploadFile');
    const notes = document.getElementById('docUploadNotes').value;
    if (!fileInput.files[0]) { showToast('Please select a file', true); return; }
    const fd = new FormData();
    fd.append('document', fileInput.files[0]);
    fd.append('notes', notes);
    try {
      const res = await API.admin.uploadDocument(docId, fd);
      if (res.success) { showToast('Document uploaded!'); closeModal('docUploadModalOverlay', 'docUploadModal'); loadDocuments(); }
      else { showToast(res.message || 'Upload failed', true); }
    } catch(e) { showToast('Network error', true); }
  });

  async function loadPayments() {
    try {
      const res = await API.admin.getPayments(1, 100);
      if (res.success) { payments = res.data?.data || res.data || []; renderPayments(); }
    } catch(e) { console.error('Load payments error:', e); }
  }

  function renderPayments() {
    const tbody = document.getElementById('paymentTableBody');
    if (!payments || payments.length === 0) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">No payments found</td></tr>'; return; }
    tbody.innerHTML = payments.map(p => `
      <tr>
        <td><img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.citizen_name||'')}&background=0066cc&color=fff&size=32" class="avatar-sm"></td>
        <td><strong>#${p.payment_id}</strong></td>
        <td>${p.citizen_name}</td>
        <td>${p.document_type || 'N/A'}</td>
        <td>${(p.amount || 0).toLocaleString()}</td>
        <td>${p.payment_method || 'N/A'}</td>
        <td>${p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'N/A'}</td>
        <td><span class="status-badge status-${(p.payment_status||'unpaid').toLowerCase()}">${p.payment_status || 'Unpaid'}</span></td>
      </tr>
    `).join('');
    const totalRevenue = payments.filter(p => p.payment_status === 'paid').reduce((s,p) => s + (p.amount || 0), 0);
    document.getElementById('paymentStatsGrid').innerHTML = `
      <div class="stat-card"><div class="stat-icon" style="color:#00b894;"><i class="fas fa-coins"></i></div><div class="stat-info"><span class="stat-number">${totalRevenue.toLocaleString()}</span><span class="stat-label">Total Revenue (TZS)</span></div></div>
      <div class="stat-card"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><span class="stat-number">${payments.filter(p => p.payment_status === 'paid').length}</span><span class="stat-label">Paid</span></div></div>
      <div class="stat-card"><div class="stat-icon" style="color:#f59e0b;"><i class="fas fa-clock"></i></div><div class="stat-info"><span class="stat-number">${payments.filter(p => p.payment_status === 'unpaid' || p.payment_status === 'pending').length}</span><span class="stat-label">Unpaid</span></div></div>
    `;
  }

  document.getElementById('paymentSearch').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#paymentTableBody tr').forEach(row => row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none');
  });
  document.getElementById('paymentStatusFilter').addEventListener('change', (e) => {
    const val = e.target.value;
    document.querySelectorAll('#paymentTableBody tr').forEach(row => {
      if(val==='all') row.style.display='';
      else row.style.display = (row.querySelector('.status-badge')?.textContent?.trim()?.toLowerCase() || '') === val ? '' : 'none';
    });
  });

  async function loadAnnouncements() {
    try {
      const res = await API.admin.getAnnouncements(1, 100);
      if (res.success) { announcements = res.data?.data || res.data || []; renderAnnouncements(); }
    } catch(e) { console.error('Load announcements error:', e); }
  }

  function renderAnnouncements() {
    const tbody = document.getElementById('announcementTableBody');
    if (!announcements || announcements.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">No announcements</td></tr>'; return; }
    tbody.innerHTML = announcements.map(a => `
      <tr>
        <td>${a.title}</td>
        <td><span class="status-badge status-${(a.category||'general').toLowerCase()}">${a.category || 'General'}</span></td>
        <td>${a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A'}</td>
        <td><span class="status-badge status-${(a.status||'unpublished').toLowerCase()}">${a.status || 'Unpublished'}</span></td>
        <td><button class="btn-sm btn-edit" data-id="${a.id}">Edit</button><button class="btn-sm btn-delete" data-id="${a.id}">Delete</button><button class="btn-sm ${a.status === 'published' ? 'btn-warning' : 'btn-success'}" onclick="toggleAnnouncement('${a.id}')">${a.status === 'published' ? 'Unpublish' : 'Publish'}</button></td>
      </tr>
    `).join('');
    document.querySelectorAll('#announcementTableBody .btn-edit').forEach(b => b.addEventListener('click', () => editAnnouncement(b.dataset.id)));
    document.querySelectorAll('#announcementTableBody .btn-delete').forEach(b => b.addEventListener('click', () => deleteAnnouncement(b.dataset.id)));
  }

  window.toggleAnnouncement = async function(id) {
    const a = announcements.find(a => a.id == id);
    if (!a) return;
    try {
      const res = a.status === 'published' ? await API.admin.unpublishAnnouncement(id) : await API.admin.publishAnnouncement(id);
      if (res.success) { showToast(a.status === 'published' ? 'Unpublished' : 'Published'); loadAnnouncements(); loadDashboard(); }
    } catch(e) { showToast('Failed', true); }
  };

  async function deleteAnnouncement(id) {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await API.admin.deleteAnnouncement(id);
      if (res.success) { showToast('Deleted'); loadAnnouncements(); }
      else { showToast(res.message || 'Failed', true); }
    } catch(e) { showToast('Network error', true); }
  }

  document.getElementById('createAnnouncementBtn').addEventListener('click', () => {
    document.getElementById('announcementForm').reset();
    document.getElementById('announcementEditId').value = '';
    document.getElementById('announcementModalTitle').textContent = 'Create Announcement';
    openModal('announcementModalOverlay', 'announcementModal');
  });

  function editAnnouncement(id) {
    const a = announcements.find(a => a.id == id);
    if (!a) return;
    document.getElementById('announcementEditId').value = a.id;
    document.getElementById('annTitle').value = a.title;
    document.getElementById('annCategory').value = a.category || 'general';
    document.getElementById('annDesc').value = a.description || '';
    document.getElementById('announcementModalTitle').textContent = 'Edit Announcement';
    openModal('announcementModalOverlay', 'announcementModal');
  }

  document.getElementById('announcementForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('announcementEditId').value;
    const data = {
      title: document.getElementById('annTitle').value,
      category: document.getElementById('annCategory').value,
      description: document.getElementById('annDesc').value
    };
    try {
      let res;
      if (editId) { res = await API.admin.updateAnnouncement(editId, data); }
      else { const fd = new FormData(); Object.keys(data).forEach(k => fd.append(k, data[k])); res = await API.admin.createAnnouncement(fd); }
      if (res.success) { showToast(editId ? 'Updated!' : 'Created!'); closeModal('announcementModalOverlay', 'announcementModal'); loadAnnouncements(); loadDashboard(); }
      else { showToast(res.message || 'Failed', true); }
    } catch(e) { showToast('Network error', true); }
  });

  async function loadConversations() {
    try {
      const res = await API.admin.getConversations();
      if (res.success) {
        const convs = res.data || res.conversations || [];
        const inbox = document.getElementById('messageInbox');
        if (!convs || convs.length === 0) { inbox.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-light);">No conversations</div>'; return; }
        inbox.innerHTML = convs.map(c => `
          <div class="inbox-item" data-id="${c.citizen_id}">
            <i class="fas fa-user-circle"></i>
            <div><strong>${c.citizen_name}</strong><small>${c.last_message ? c.last_message.substring(0,30) + '...' : 'No messages'}</small></div>
            ${c.unread_count > 0 ? `<span class="badge" style="position:relative;top:0;">${c.unread_count}</span>` : ''}
          </div>
        `).join('');
        inbox.querySelectorAll('.inbox-item').forEach(item => item.addEventListener('click', () => {
          document.querySelectorAll('.inbox-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          openChat(item.dataset.id, item.querySelector('strong')?.textContent || 'Citizen');
        }));
        if (convs.length > 0) { document.querySelector('.inbox-item')?.click(); }
      }
    } catch(e) { console.error('Load conversations error:', e); }
  }

  async function openChat(citizenId, citizenName) {
    selectedChatContact = citizenId;
    document.getElementById('chatContactName').textContent = citizenName || 'Citizen';
    document.getElementById('chatOnlineStatus').innerHTML = '<i class="fas fa-circle" style="color:#00b894;"></i> Online';
    document.getElementById('adminChatInput').disabled = false;
    document.getElementById('adminSendBtn').disabled = false;
    const body = document.getElementById('adminChatBody');
    try {
      const res = await API.admin.getMessages(citizenId, 1, 100);
      const msgs = res.success ? (res.data?.messages || res.data || []) : [];
      body.innerHTML = msgs.length > 0 ? msgs.map(m => `
        <div class="msg ${m.sender_role === 'admin' ? 'sent' : 'received'}">
          <div class="bubble">${m.message}</div>
          <small>${m.created_at ? new Date(m.created_at).toLocaleTimeString() : ''}</small>
        </div>
      `).join('') : '<div class="chat-placeholder">No messages yet</div>';
      body.scrollTop = body.scrollHeight;
      await API.admin.markRead(citizenId);
    } catch(e) { body.innerHTML = '<div class="chat-placeholder">Error loading messages</div>'; }
  }

  document.getElementById('adminSendBtn').addEventListener('click', sendAdminMessage);
  document.getElementById('adminChatInput').addEventListener('keypress', (e) => { if(e.key==='Enter') sendAdminMessage(); });

  async function sendAdminMessage() {
    const input = document.getElementById('adminChatInput');
    const msg = input.value.trim();
    if (!msg || !selectedChatContact) return;
    try {
      const res = await API.admin.sendMessage(selectedChatContact, msg);
      if (res.success) {
        input.value = '';
        const body = document.getElementById('adminChatBody');
        body.innerHTML += `<div class="msg sent"><div class="bubble">${msg}</div><small>Just now</small></div>`;
        body.scrollTop = body.scrollHeight;
        // Update last message in inbox
        const inboxItem = document.querySelector(`.inbox-item[data-id="${selectedChatContact}"]`);
        if (inboxItem) { inboxItem.querySelector('small').textContent = msg.substring(0,30) + '...'; }
      }
    } catch(e) { showToast('Failed to send', true); }
  }

  function renderCharts() {
    setTimeout(() => {
      const ctx1 = document.getElementById('revenueChart')?.getContext('2d');
      const ctx2 = document.getElementById('citizenChart')?.getContext('2d');
      if(window.revenueChartInstance) window.revenueChartInstance.destroy();
      if(window.citizenChartInstance) window.citizenChartInstance.destroy();
      const paid = payments?.filter(p => p.payment_status === 'paid').length || 0;
      const unpaid = payments?.filter(p => p.payment_status === 'unpaid' || p.payment_status === 'pending').length || 0;
      const active = citizens?.filter(c => c.status === 'active').length || 0;
      const inactive = citizens?.filter(c => c.status === 'inactive').length || 0;
      const deceased = citizens?.filter(c => c.status === 'deceased').length || 0;
      if(ctx1) window.revenueChartInstance = new Chart(ctx1, { type:'bar', data:{ labels:['Paid','Unpaid'], datasets:[{ label:'Payments', data:[paid, unpaid], backgroundColor:['#00b894','#f59e0b'] }] } });
      if(ctx2) window.citizenChartInstance = new Chart(ctx2, { type:'doughnut', data:{ labels:['Active','Inactive','Deceased'], datasets:[{ data:[active, inactive, deceased], backgroundColor:['#00b894','#f59e0b','#ef4444'] }] } });
    }, 300);
  }

  function generatePDFReport(title, tableData, statsSummary) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFillColor(0,102,204);
    doc.rect(0,0,210,30,'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(20);
    doc.setFont('helvetica','bold');
    doc.text('LAMS',14,20);
    doc.setFontSize(10);
    doc.text('Local Administration Management System',14,28);
    doc.setTextColor(30,41,59);
    doc.setFontSize(16);
    doc.text(title,14,45);
    doc.setFontSize(10);
    doc.setTextColor(100,100,100);
    doc.text(`Generated: ${new Date().toLocaleString()}`,14,53);
    doc.setFontSize(12);
    doc.setTextColor(0,0,0);
    doc.text('Summary',14,65);
    doc.setFontSize(10);
    let yPos = 75;
    statsSummary.forEach(stat => { doc.text(`${stat.label}: ${stat.value}`,14,yPos); yPos += 8; });
    yPos += 10;
    doc.autoTable({ startY:yPos, head:[tableData.headers], body:tableData.rows, styles:{ fontSize:9, cellPadding:4 }, headStyles:{ fillColor:[0,102,204], textColor:255, fontStyle:'bold' }, alternateRowStyles:{ fillColor:[245,247,250] } });
    const pageCount = doc.internal.getNumberOfPages();
    for (let i=1; i<=pageCount; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150,150,150); doc.text('LAMS Admin Panel - Official Report',14,doc.internal.pageSize.height-10); doc.text(`Page ${i} of ${pageCount}`,doc.internal.pageSize.width-25,doc.internal.pageSize.height-10); }
    return doc;
  }

  document.getElementById('genCitizenReport')?.addEventListener('click', () => {
    const stats = [{ label:'Total Citizens', value:citizens?.length || 0 }, { label:'Active', value:citizens?.filter(c => c.status === 'active').length || 0 }];
    const table = { headers:['ID','Name','Email','Phone','Status'], rows: (citizens || []).map(c => [c.id || c.citizen_id, c.full_name || c.name, c.email, c.phone, c.status]) };
    const doc = generatePDFReport('Citizens Report', table, stats);
    doc.save('LAMS_Citizens_Report.pdf');
    showToast('Citizens report generated!');
  });

  document.getElementById('genPaymentReport')?.addEventListener('click', () => {
    const totalRevenue = (payments || []).filter(p => p.payment_status === 'paid').reduce((s,p) => s + (p.amount || 0), 0);
    const stats = [{ label:'Total Transactions', value:payments?.length || 0 }, { label:'Total Revenue (TZS)', value:totalRevenue.toLocaleString() }];
    const table = { headers:['Payment ID','Citizen','Amount','Status'], rows: (payments || []).map(p => [p.payment_id, p.citizen_name, p.amount?.toLocaleString() || '0', p.payment_status]) };
    const doc = generatePDFReport('Payments Report', table, stats);
    doc.save('LAMS_Payments_Report.pdf');
    showToast('Payments report generated!');
  });

  document.getElementById('genDocReport')?.addEventListener('click', () => {
    const stats = [{ label:'Total Documents', value:documents?.length || 0 }, { label:'Sent', value:documents?.filter(d => d.request_status === 'completed').length || 0 }];
    const table = { headers:['Citizen','Type','Payment','Status'], rows: (documents || []).map(d => [d.citizen_name, d.document_type, d.payment_status, d.request_status]) };
    const doc = generatePDFReport('Documents Report', table, stats);
    doc.save('LAMS_Documents_Report.pdf');
    showToast('Documents report generated!');
  });

  document.querySelectorAll('.share-report-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const reportType = this.dataset.report;
      let doc, filename, stats, table;
      if (reportType === 'citizens') {
        stats = [{ label:'Total Citizens', value:citizens?.length || 0 }];
        table = { headers:['ID','Name','Email','Status'], rows: (citizens || []).map(c => [c.id || c.citizen_id, c.full_name || c.name, c.email, c.status]) };
        filename = 'LAMS_Citizens_Report.pdf';
      } else if (reportType === 'payments') {
        const totalRevenue = (payments || []).filter(p => p.payment_status === 'paid').reduce((s,p) => s + (p.amount || 0), 0);
        stats = [{ label:'Total Revenue (TZS)', value:totalRevenue.toLocaleString() }];
        table = { headers:['Payment ID','Citizen','Amount','Status'], rows: (payments || []).map(p => [p.payment_id, p.citizen_name, p.amount?.toLocaleString() || '0', p.payment_status]) };
        filename = 'LAMS_Payments_Report.pdf';
      } else {
        stats = [{ label:'Total Documents', value:documents?.length || 0 }];
        table = { headers:['Citizen','Type','Status'], rows: (documents || []).map(d => [d.citizen_name, d.document_type, d.request_status]) };
        filename = 'LAMS_Documents_Report.pdf';
      }
      doc = generatePDFReport(reportType.charAt(0).toUpperCase() + reportType.slice(1) + ' Report', table, stats);
      if (navigator.share && navigator.canShare) {
        const pdfBlob = doc.output('blob');
        const file = new File([pdfBlob], filename, { type:'application/pdf' });
        if (navigator.canShare({ files:[file] })) { navigator.share({ title:filename, files:[file] }).catch(() => doc.save(filename)); }
        else { doc.save(filename); showToast('Report downloaded'); }
      } else { doc.save(filename); showToast('Report downloaded'); }
    });
  });

  async function loadProfile() {
    try {
      const res = await API.admin.getProfile();
      if (res.success) {
        currentAdmin = res.data?.admin || res.data || {};
        updateUserInfo();
        document.getElementById('pName').value = currentAdmin.full_name || currentAdmin.name || '';
        document.getElementById('pEmail').value = currentAdmin.email || '';
        document.getElementById('pPhone').value = currentAdmin.phone || '';
      }
    } catch(e) { console.error('Load profile error:', e); }
  }

  document.getElementById('editProfileBtn').addEventListener('click', () => {
    document.getElementById('pName').value = currentAdmin?.full_name || currentAdmin?.name || '';
    document.getElementById('pEmail').value = currentAdmin?.email || '';
    document.getElementById('pPhone').value = currentAdmin?.phone || '';
    document.getElementById('pAvatarFile').value = '';
    openModal('profileModalOverlay', 'profileModal');
  });

  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      full_name: document.getElementById('pName').value,
      email: document.getElementById('pEmail').value,
      phone: document.getElementById('pPhone').value
    };
    const fileInput = document.getElementById('pAvatarFile');
    try {
      let res;
      if (fileInput.files[0]) {
        const fd = new FormData();
        Object.keys(data).forEach(k => fd.append(k, data[k]));
        fd.append('profile_photo', fileInput.files[0]);
        res = await API.admin.updatePhoto(fd);
      } else {
        res = await API.admin.updateProfile(data);
      }
      if (res.success) { showToast('Profile updated!'); closeModal('profileModalOverlay', 'profileModal'); loadProfile(); }
      else { showToast(res.message || 'Failed', true); }
    } catch(e) { showToast('Network error', true); }
  });

  document.getElementById('changePasswordBtn').addEventListener('click', () => {
    document.getElementById('passwordForm').reset();
    document.getElementById('passwordStrength').textContent = '';
    document.getElementById('passwordMatch').textContent = '';
    openModal('passwordModalOverlay', 'passwordModal');
  });

  document.getElementById('newPassword').addEventListener('input', function() {
    const pwd = this.value;
    const strengthEl = document.getElementById('passwordStrength');
    if (pwd.length < 6) { strengthEl.textContent = 'Weak - Minimum 6 characters'; strengthEl.style.color = '#ef4444'; }
    else if (pwd.length < 8) { strengthEl.textContent = 'Medium'; strengthEl.style.color = '#f59e0b'; }
    else if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/)) { strengthEl.textContent = 'Strong'; strengthEl.style.color = '#00b894'; }
    else { strengthEl.textContent = 'Medium - Add uppercase & numbers'; strengthEl.style.color = '#f59e0b'; }
  });

  document.getElementById('confirmPassword').addEventListener('input', function() {
    const matchEl = document.getElementById('passwordMatch');
    if (this.value === document.getElementById('newPassword').value) { matchEl.textContent = 'Passwords match'; matchEl.style.color = '#00b894'; }
    else { matchEl.textContent = 'Passwords do not match'; matchEl.style.color = '#ef4444'; }
  });

  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPwd = document.getElementById('currentPassword').value;
    const newPwd = document.getElementById('newPassword').value;
    const confirmPwd = document.getElementById('confirmPassword').value;
    if (newPwd.length < 6) { showToast('Minimum 6 characters', true); return; }
    if (newPwd !== confirmPwd) { showToast('Passwords do not match', true); return; }
    try {
      const res = await API.admin.changePassword(currentPwd, newPwd, confirmPwd);
      if (res.success) { showToast('Password changed!'); closeModal('passwordModalOverlay', 'passwordModal'); }
      else { showToast(res.message || 'Failed', true); }
    } catch(e) { showToast('Network error', true); }
  });

  document.getElementById('settingLanguage').addEventListener('change', (e) => {
    if (API && API.isAuthenticated()) { API.admin.updateSettings({ language: e.target.value }).catch(() => {}); }
  });

  document.getElementById('settingTheme').addEventListener('change', (e) => {
    const isDark = e.target.value === 'dark';
    body.classList.toggle('dark-mode', isDark);
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', e.target.value);
    if (API && API.isAuthenticated()) { API.admin.updateSettings({ theme: e.target.value }).catch(() => {}); }
  });

  document.getElementById('notifEmail').addEventListener('change', function() {
    if (API && API.isAuthenticated()) { API.admin.updateSettings({ email_notifications: this.checked }).catch(() => {}); }
  });

  async function loadSettings() {
    try {
      const res = await API.admin.getSettings();
      if (res.success) {
        const settings = res.data || {};
        if (settings.language) document.getElementById('settingLanguage').value = settings.language;
        if (settings.theme) {
          document.getElementById('settingTheme').value = settings.theme;
          if (settings.theme === 'dark') { body.classList.add('dark-mode'); themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; }
          else { body.classList.remove('dark-mode'); themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; }
        }
        if (settings.email_notifications !== undefined) document.getElementById('notifEmail').checked = settings.email_notifications;
      }
    } catch(e) { console.error('Load settings error:', e); }
  }

  document.getElementById('globalSearch').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.trim();
      if (!query || query.length < 2) { showToast('Enter at least 2 characters', true); return; }
      try {
        const res = await API.admin.globalSearch(query);
        if (res.success) {
          const results = res.data || res.results || {};
          let msg = 'Search Results:\n';
          if (results.citizens?.length) msg += `\nCitizens: ${results.citizens.length}`;
          if (results.documents?.length) msg += `\nDocuments: ${results.documents.length}`;
          if (results.payments?.length) msg += `\nPayments: ${results.payments.length}`;
          if (results.announcements?.length) msg += `\nAnnouncements: ${results.announcements.length}`;
          if (msg === 'Search Results:\n') msg = 'No results found';
          showToast(msg);
        }
      } catch(e) { showToast('Search failed', true); }
    }
  });

  const searchInput = document.getElementById('globalSearch');
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      const query = searchInput.value.trim();
      if (query && query.length >= 2) {
        try {
          const res = await API.admin.globalSearch(query);
          if (res.success) {
            const results = res.data || res.results || {};
            let total = 0;
            Object.values(results).forEach(arr => { if (Array.isArray(arr)) total += arr.length; });
            if (total > 0) showToast(`Found ${total} results for "${query}"`);
          }
        } catch(e) {}
      }
    }, 500);
  });

  const backToTopBtn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) backToTopBtn.classList.add('visible');
    else backToTopBtn.classList.remove('visible');
  });
  backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  async function initSocket() {
    try {
      socket = API.socket.init();
      if (socket) {
        socket.on('receive_message', (data) => {
          if (data.sender_role !== 'admin' && currentPage === 'messages') {
            const body = document.getElementById('adminChatBody');
            if (body && data.conversation_id) {
              body.innerHTML += `<div class="msg received"><div class="bubble">${data.message}</div><small>Just now</small></div>`;
              body.scrollTop = body.scrollHeight;
            }
            loadConversations();
          }
        });
        socket.on('typing_indicator', (data) => {
          if (data.is_typing && data.role === 'citizen') {
            document.getElementById('chatOnlineStatus').innerHTML = '<i class="fas fa-circle" style="color:#f59e0b;"></i> Typing...';
          } else {
            document.getElementById('chatOnlineStatus').innerHTML = '<i class="fas fa-circle" style="color:#00b894;"></i> Online';
          }
        });
      }
    } catch(e) { console.log('Socket init error:', e); }
  }

  async function init() {
    const authed = await checkAuth();
    if (!authed) return;
    await loadNotifications();
    await loadDashboard();
    await loadCitizens();
    await loadDocuments();
    await loadPayments();
    await loadAnnouncements();
    await loadConversations();
    await loadProfile();
    await loadSettings();
    initSocket();
    const hash = window.location.hash.replace('#', '');
    if (hash) navigateToPage(hash);
    console.log('🏛️ LAMS Admin Panel - Fully Connected to Backend');
  }

  init();
});