// citizen.js - LAMS Citizen Portal (Fully Fixed - No Auth Loop)
document.addEventListener('DOMContentLoaded', () => {

  // ==================== HELPER FUNCTIONS ====================
  const isOnLoginPage = () => {
    const path = window.location.pathname.toLowerCase();
    return path.includes('login.html') || path.includes('forgot-password.html') || path === '/' || path === '/index.html';
  };

  // 🔑 NEW: Check if session was cleared recently
  const wasSessionCleared = () => {
    const cleared = localStorage.getItem('lams_session_cleared');
    if (!cleared) return false;
    const elapsed = Date.now() - parseInt(cleared);
    return elapsed < 3000; // Within last 3 seconds
  };

  // ==================== AUTH CHECK (FIXED) ====================
  // 🔑 NEW: If session was cleared recently, redirect to login immediately
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
  if (session.role !== 'citizen') {
    if (!isOnLoginPage()) {
      window.location.href = 'login.html';
    }
    return;
  }
  let profileData = {};
  const BASE_URL = 'http://localhost:5000';
  const API_URL = BASE_URL + '/api';

  // ==================== DOM REFS ====================
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-page]');
  const pageContents = document.querySelectorAll('.page-content');
  const themeToggle = document.getElementById('themeToggle');
  const notificationBtn = document.getElementById('notificationBtn');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const notifBadge = document.getElementById('notifBadge');
  const markAllReadBtn = document.getElementById('markAllRead');
  const backToTopBtn = document.getElementById('backToTop');
  const userDropdownBtn = document.getElementById('userDropdownBtn');
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  const citizenSearch = document.getElementById('citizenSearch');
  const toastContainer = document.getElementById('toastContainer');

  // ==================== STATE ====================
  let currentPage = 'dashboard';
  let applications = [];
  let payments = [];
  let currentPaymentId = null;
  let messagesLoaded = false;

  // ==================== AUTH HEADER HELPER ====================
  function getAuthHeaders() {
    const token = window.API.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // ==================== TOKEN-AWARE FETCH FOR FILES ====================
  async function fetchWithAuth(url, options = {}) {
    const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
    return fetch(url, { ...options, headers });
  }

  // ==================== TOAST ====================
  function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // ==================== THEME ====================
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') { body.classList.add('dark-mode'); themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; }
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // ==================== NAVIGATION ====================
  function navigateToPage(pageName) {
    currentPage = pageName;
    sidebarLinks.forEach(l => l.classList.remove('active'));
    const link = document.querySelector(`.sidebar-link[data-page="${pageName}"]`);
    if (link) link.classList.add('active');
    pageContents.forEach(p => p.classList.remove('active'));
    const page = document.getElementById(`page-${pageName}`);
    if (page) page.classList.add('active');
    if (window.innerWidth <= 992) sidebar.classList.remove('active');

    switch (pageName) {
      case 'dashboard': loadDashboard(); break;
      case 'applications': loadApplications(); break;
      case 'payments': loadPayments(); break;
      case 'messages': loadMessages(); break;
      case 'announcements': loadAnnouncements(); break;
      case 'documents': loadDocuments(); break;
      case 'profile': loadProfile(); break;
    }
  }

  sidebarLinks.forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); navigateToPage(link.getAttribute('data-page')); }));
  document.querySelectorAll('[data-page]').forEach(el => { if (!el.classList.contains('sidebar-link')) el.addEventListener('click', () => navigateToPage(el.getAttribute('data-page'))); });

  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('active'));

  // ==================== DROPDOWNS ====================
  notificationBtn?.addEventListener('click', (e) => { e.stopPropagation(); notificationDropdown?.classList.toggle('active'); userDropdownMenu?.classList.remove('active'); });
  userDropdownBtn?.addEventListener('click', (e) => { e.stopPropagation(); userDropdownMenu?.classList.toggle('active'); notificationDropdown?.classList.remove('active'); });
  document.addEventListener('click', () => {
    notificationDropdown?.classList.remove('active');
    userDropdownMenu?.classList.remove('active');
  });

  // ==================== LOGOUT ====================
  document.getElementById('logoutSidebarBtn')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('logoutModalOverlay')?.classList.add('active'); });
  document.getElementById('logoutDropdownBtn')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('logoutModalOverlay')?.classList.add('active'); });
  document.getElementById('logoutCancelBtn')?.addEventListener('click', () => document.getElementById('logoutModalOverlay')?.classList.remove('active'));
  document.getElementById('logoutConfirmBtn')?.addEventListener('click', async () => {
    try { await window.API.auth.logout(); } catch (e) {}
    window.location.href = 'login.html';
  });

  // ==================== MODAL CLOSERS ====================
  document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('active'); }));

  // ==================== BACK TO TOP ====================
  window.addEventListener('scroll', () => backToTopBtn?.classList.toggle('visible', window.scrollY > 400));
  backToTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ==================== UPDATE SIDEBAR ====================
  function updateUI() {
    const name = profileData.full_name || session.full_name || 'Citizen';
    document.getElementById('sidebarCitizenName').textContent = name;
    document.getElementById('headerUserName').textContent = name.split(' ')[0];
    document.getElementById('dashboardCitizenName').textContent = name;
    const photo = profileData.profile_photo || profileData.citizen_photo;
    if (photo) {
      const imgUrl = photo.startsWith('http') || photo.startsWith('/') ? photo : BASE_URL + '/' + photo;
      document.getElementById('sidebarAvatarImg').src = imgUrl;
      document.getElementById('profileAvatarImg').src = imgUrl;
    }
  }

  // ==================== REAL-TIME CLOCK ====================
  function updateClock() {
    const now = new Date();
    const ce = document.getElementById('realTimeClock');
    const de = document.getElementById('realTimeDate');
    if (ce) ce.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (de) de.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // ==================== DASHBOARD ====================
  async function loadDashboard() {
    try {
      const res = await window.API.citizen.getDashboard();
      if (res.success) {
        const d = res.data || res;
        const s = d.summary || d;
        document.getElementById('dashPending').textContent = s.pending_applications || 0;
        document.getElementById('dashCompleted').textContent = s.approved_applications || 0;
        document.getElementById('dashUnread').textContent = d.unread_messages || 0;

        document.getElementById('dashboardStatsGrid').innerHTML = `
          <div class="stat-card"><div class="stat-icon"><i class="fas fa-file-alt"></i></div><div class="stat-info"><span class="stat-number">${s.total_applications || 0}</span><span class="stat-label">Total Applications</span></div></div>
          <div class="stat-card"><div class="stat-icon" style="color:#f59e0b;"><i class="fas fa-clock"></i></div><div class="stat-info"><span class="stat-number">${s.pending_applications || 0}</span><span class="stat-label">Pending</span></div></div>
          <div class="stat-card"><div class="stat-icon" style="color:#00b894;"><i class="fas fa-check-circle"></i></div><div class="stat-info"><span class="stat-number">${s.approved_applications || 0}</span><span class="stat-label">Approved</span></div></div>
          <div class="stat-card"><div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div><div class="stat-info"><span class="stat-number">${s.total_payments_made || 0}</span><span class="stat-label">Payments Made</span></div></div>
          <div class="stat-card"><div class="stat-icon" style="color:#f59e0b;"><i class="fas fa-envelope"></i></div><div class="stat-info"><span class="stat-number">${d.unread_messages || 0}</span><span class="stat-label">Unread Messages</span></div></div>
          <div class="stat-card"><div class="stat-icon" style="color:#8b5cf6;"><i class="fas fa-bell"></i></div><div class="stat-info"><span class="stat-number">${s.total_notifications || 0}</span><span class="stat-label">Notifications</span></div></div>
        `;

        const activities = d.recent_activities || [];
        document.getElementById('dashboardActivityList').innerHTML = activities.length > 0
          ? activities.slice(0, 8).map(a => `<div class="activity-item"><i class="fas fa-${a.activity_type === 'payment' ? 'credit-card' : 'file-alt'}" style="color:var(--primary);"></i><div><p>${a.activity || a.description}</p><small>${a.created_at ? new Date(a.created_at).toLocaleString() : ''}</small></div></div>`).join('')
          : '<p style="color:var(--text-light);">No recent activity</p>';
      }
    } catch (e) { console.error('Dashboard error:', e); }
  }

  // ==================== APPLICATIONS ====================
  async function loadApplications() {
    try {
      const res = await window.API.citizen.getApplications();
      applications = res.success ? (res.data || []) : [];
      const tbody = document.getElementById('appTableBody');
      if (applications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">No applications. Click "New" to submit.</td></tr>';
        return;
      }
      tbody.innerHTML = applications.map(a => {
        const payStatus = (a.payment_status || a.pay_status || '').toLowerCase();
        const isUnpaid = payStatus === 'unpaid' || payStatus === 'pending';
        const isPaid = payStatus === 'paid';
        return `
        <tr>
          <td><div class="table-avatar-default">${(a.citizen_name || profileData.full_name || '?').charAt(0).toUpperCase()}</div></td>
          <td><strong>#${a.id || 'N/A'}</strong></td>
          <td>${a.document_type || 'N/A'}</td>
          <td>${a.date || (a.created_at ? a.created_at.split('T')[0] : 'N/A')}</td>
          <td><span class="status-badge status-${(a.status || 'pending').toLowerCase()}">${a.status || 'Pending'}</span></td>
          <td>
            <button class="btn-sm view-app-btn" data-id="${a.id}"><i class="fas fa-eye"></i> View</button>
            ${isUnpaid ? `<button class="btn-sm btn-primary pay-app-btn" data-id="${a.id}"><i class="fas fa-credit-card"></i> Pay Now</button>` : ''}
            ${isPaid ? `<span class="status-badge status-paid" style="margin-left:4px;"><i class="fas fa-check"></i> Paid</span>` : ''}
          </td>
        </tr>`;
      }).join('');
      tbody.querySelectorAll('.view-app-btn').forEach(b => b.addEventListener('click', () => viewApplication(b.dataset.id)));
      tbody.querySelectorAll('.pay-app-btn').forEach(b => b.addEventListener('click', () => openPaymentModalForApp(b.dataset.id)));
    } catch (e) { console.error('Apps error:', e); }
  }

  function viewApplication(id) {
    const app = applications.find(a => a.id == id);
    if (!app) return;
    const content = document.getElementById('appDetailContent');
    const payStatus = (app.payment_status || app.pay_status || '').toLowerCase();
    content.innerHTML = `
      <button class="modal-close modal-close-btn" onclick="document.getElementById('appDetailModalOverlay').classList.remove('active')">&times;</button>
      <h2>Application #${app.id}</h2>
      <p><strong>Type:</strong> ${app.document_type || 'N/A'}</p>
      <p><strong>Status:</strong> <span class="status-badge status-${(app.status || 'pending').toLowerCase()}">${app.status || 'Pending'}</span></p>
      <p><strong>Date:</strong> ${app.date || (app.created_at ? app.created_at.split('T')[0] : 'N/A')}</p>
      <p><strong>Payment:</strong> <span class="status-badge status-${payStatus || 'unpaid'}">${app.payment_status || app.pay_status || 'Unpaid'}</span></p>
      ${payStatus === 'unpaid' || payStatus === 'pending' ? `<button class="btn btn-primary btn-full" id="payFromDetailBtn"><i class="fas fa-credit-card"></i> Pay Now</button>` : ''}
    `;
    document.getElementById('appDetailModalOverlay').classList.add('active');
    setTimeout(() => {
      const payBtn = document.getElementById('payFromDetailBtn');
      if (payBtn) payBtn.addEventListener('click', () => { document.getElementById('appDetailModalOverlay').classList.remove('active'); openPaymentModalForApp(id); });
    }, 100);
  }

  document.getElementById('newApplicationBtn')?.addEventListener('click', () => document.getElementById('appModalOverlay')?.classList.add('active'));
  document.getElementById('appModalCloseBtn')?.addEventListener('click', () => document.getElementById('appModalOverlay')?.classList.remove('active'));
  document.getElementById('appModalCancelBtn')?.addEventListener('click', () => document.getElementById('appModalOverlay')?.classList.remove('active'));

  document.getElementById('applicationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const docType = document.getElementById('appDocType').value;
    if (!docType) return showToast('error', 'Select a document type');
    try {
      const res = await window.API.citizen.createApplication({
        document_type: docType,
        reason: document.getElementById('appReason').value,
        additional_notes: document.getElementById('appNotes').value
      });
      if (res.success) {
        showToast('success', 'Application submitted!');
        document.getElementById('appModalOverlay').classList.remove('active');
        loadApplications();
        loadPayments();
      } else showToast('error', res.message || 'Failed');
    } catch (err) { showToast('error', 'Network error'); }
  });

  document.getElementById('appStatusFilter')?.addEventListener('change', function() {
    const f = this.value.toLowerCase();
    document.querySelectorAll('#appTableBody tr').forEach(r => {
      const b = r.querySelector('.status-badge');
      r.style.display = (f === 'all' || (b && b.textContent.trim().toLowerCase() === f)) ? '' : 'none';
    });
  });

  // ==================== PAYMENTS ====================
  async function loadPayments() {
    try {
      const res = await window.API.citizen.getPayments();
      payments = res.success ? (res.data || []) : [];
      const tbody = document.getElementById('paymentTableBody');
      if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No payments found.</td></tr>';
      } else {
        tbody.innerHTML = payments.map(p => {
          const status = (p.status || p.payment_status || 'unpaid').toLowerCase();
          return `
          <tr>
            <td><strong>#${p.payment_id || p.id || 'N/A'}</strong></td>
            <td>${p.document_type || 'N/A'}</td>
            <td>TZS ${parseInt(p.amount || 0).toLocaleString()}</td>
            <td>${p.date || (p.created_at ? p.created_at.split('T')[0] : 'N/A')}</td>
            <td><span class="status-badge status-${status}">${p.status || p.payment_status || 'Unpaid'}</span></td>
            <td>
              ${status === 'unpaid' || status === 'pending' ? `<button class="btn-sm btn-primary pay-now-btn" data-id="${p.id}"><i class="fas fa-credit-card"></i> Pay Now</button>` : `<button class="btn-sm receipt-btn" data-id="${p.id}"><i class="fas fa-download"></i> Receipt</button>`}
            </td>
          </tr>`;
        }).join('');
      }
      tbody.querySelectorAll('.pay-now-btn').forEach(b => b.addEventListener('click', () => openPaymentModal(b.dataset.id)));
      tbody.querySelectorAll('.receipt-btn').forEach(b => b.addEventListener('click', () => downloadReceipt(b.dataset.id)));

      // History
      const historyBody = document.getElementById('paymentHistoryBody');
      const paid = payments.filter(p => (p.status || p.payment_status || '').toLowerCase() === 'paid');
      historyBody.innerHTML = paid.length > 0
        ? paid.map(p => `<tr><td>#${p.payment_id || p.id}</td><td>${p.document_type || 'N/A'}</td><td>TZS ${parseInt(p.amount||0).toLocaleString()}</td><td>${p.date||''}</td><td>${p.method || p.payment_method || 'N/A'}</td><td><span class="status-badge status-paid">Paid</span></td></tr>`).join('')
        : '<tr><td colspan="6" style="text-align:center;">No history</td></tr>';

      // Outstanding
      const unpaid = payments.filter(p => (p.status || p.payment_status || '').toLowerCase() === 'unpaid');
      const total = unpaid.reduce((s, p) => s + parseInt(p.amount || 0), 0);
      const card = document.getElementById('outstandingBalanceCard');
      if (total > 0) { card.style.display = 'flex'; document.getElementById('outstandingAmount').textContent = 'TZS ' + total.toLocaleString(); }
      else card.style.display = 'none';
    } catch (e) { console.error('Payments error:', e); }
  }

  function openPaymentModalForApp(appId) {
    const payment = payments.find(p => p.id == appId || p.document_request_id == appId);
    if (payment) openPaymentModal(payment.id);
    else showToast('info', 'No payment found. Submit an application first.');
  }

  function openPaymentModal(id) {
    currentPaymentId = id;
    const payment = payments.find(p => p.id == id);
    if (!payment) return showToast('error', 'Payment not found');
    document.getElementById('paymentDetails').innerHTML = `
      <p><strong>Payment ID:</strong> #${payment.payment_id || payment.id}</p>
      <p><strong>Document:</strong> ${payment.document_type || 'N/A'}</p>
      <p><strong>Amount:</strong> <span style="font-size:1.3rem;font-weight:700;color:var(--primary);">TZS ${parseInt(payment.amount || 0).toLocaleString()}</span></p>
    `;
    document.getElementById('paymentPhone').value = profileData.phone || '';
    document.getElementById('paymentModalOverlay').classList.add('active');
  }

  document.getElementById('paymentModalCloseBtn')?.addEventListener('click', () => document.getElementById('paymentModalOverlay')?.classList.remove('active'));

  document.getElementById('processPaymentBtn')?.addEventListener('click', async () => {
    const method = document.getElementById('paymentMethod').value;
    const phone = document.getElementById('paymentPhone').value.trim();
    if (!phone) return showToast('error', 'Enter phone number');
    if (!currentPaymentId) return showToast('error', 'No payment selected');

    // Map payment method to valid ENUM values in the database
    const methodMap = { mobile: 'mpesa', bank: 'bank_transfer', card: 'bank_transfer' };
    const dbMethod = methodMap[method] || 'mpesa';

    const btn = document.getElementById('processPaymentBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    try {
      const res = await window.API.citizen.makePayment(currentPaymentId, dbMethod, phone);
      if (res.success) {
        showToast('success', 'Payment successful!');
        document.getElementById('paymentModalOverlay').classList.remove('active');
        loadPayments();
        loadApplications();
        loadDocuments();
      } else {
        showToast('error', res.message || 'Payment failed');
      }
    } catch (e) { showToast('error', 'Network error'); }
    finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-lock"></i> Pay Now'; }
  });

  async function downloadReceipt(id) {
    try {
      // Use fetchWithAuth to include token
      const token = window.API.getToken();
      const response = await fetch(`${API_URL}/citizen/payments/${id}/receipt`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `Receipt_${id}.pdf`; a.click(); URL.revokeObjectURL(url);
        showToast('success', 'Receipt downloaded!');
      } else {
        showToast('error', 'Receipt not available');
      }
    } catch (e) { showToast('error', 'Download failed'); }
  }

  document.getElementById('payOutstandingBtn')?.addEventListener('click', () => {
    const unpaid = payments.find(p => (p.status || p.payment_status || '').toLowerCase() === 'unpaid');
    if (unpaid) openPaymentModal(unpaid.id);
    else showToast('info', 'No unpaid payments');
  });

  document.getElementById('paymentStatusFilter')?.addEventListener('change', function() {
    const f = this.value.toLowerCase();
    document.querySelectorAll('#paymentTableBody tr').forEach(r => {
      const b = r.querySelector('.status-badge');
      r.style.display = (f === 'all' || (b && b.textContent.trim().toLowerCase() === f)) ? '' : 'none';
    });
  });
  document.getElementById('paymentSearchInput')?.addEventListener('input', function() {
    const s = this.value.toLowerCase();
    document.querySelectorAll('#paymentTableBody tr').forEach(r => { r.style.display = r.textContent.toLowerCase().includes(s) ? '' : 'none'; });
  });

  // ==================== MESSAGES ====================
  async function loadMessages() {
    try {
      const convRes = await window.API.citizen.getConversations();
      if (convRes.success && convRes.data && convRes.data.length > 0) {
        const conv = convRes.data[0];
        document.getElementById('citizenChatContactName').textContent = conv.participant_name || 'Administrator';
        const msgRes = await window.API.citizen.getMessages(conv.id);
        const msgs = msgRes.success ? (msgRes.data || msgRes.messages || []) : [];
        const chatBody = document.getElementById('citizenChatBody');
        chatBody.innerHTML = msgs.length > 0
          ? msgs.map(m => {
              const isSent = (m.sender_role || m.senderRole) === 'citizen';
              return `<div class="msg ${isSent ? 'sent' : 'received'}"><div class="bubble">${m.message}</div><small>${new Date(m.created_at).toLocaleTimeString()}</small></div>`;
            }).join('')
          : '<p class="chat-placeholder">No messages yet. Type below to start!</p>';
        chatBody.scrollTop = chatBody.scrollHeight;
        messagesLoaded = true;
      }
    } catch (e) { console.error('Messages error:', e); }
  }

  async function sendCitizenMessage() {
    const input = document.getElementById('citizenChatInput');
    const text = input.value.trim();
    if (!text) return;
    input.disabled = true;
    try {
      const convRes = await window.API.citizen.getConversations();
      const convId = convRes.success && convRes.data?.length > 0 ? convRes.data[0].id : null;
      if (convId) {
        await window.API.citizen.sendMessage(convId, text);
        input.value = '';
        await loadMessages();
      } else {
        showToast('error', 'No conversation found');
      }
    } catch (e) { showToast('error', 'Failed to send'); }
    finally { input.disabled = false; input.focus(); }
  }

  document.getElementById('citizenSendBtn')?.addEventListener('click', sendCitizenMessage);
  document.getElementById('citizenChatInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendCitizenMessage(); });

  // ==================== ANNOUNCEMENTS ====================
  async function loadAnnouncements() {
    try {
      const res = await window.API.citizen.getAnnouncements();
      const announcements = res.success ? (res.data || []) : [];
      const grid = document.getElementById('citizenAnnouncementGrid');
      grid.innerHTML = announcements.length > 0
        ? announcements.map(a => {
            const imgHTML = a.image
              ? `<img src="${a.image.startsWith('http') || a.image.startsWith('/') ? a.image : BASE_URL + '/' + a.image}" alt="${a.title}" style="width:100%;height:180px;object-fit:cover;border-radius:8px 8px 0 0;" onerror="this.style.display='none';">`
              : '';
            return `
            <div class="announcement-card" style="overflow:hidden;">
              ${imgHTML}
              <div style="padding:18px;">
                <span class="cat-badge">${a.category || 'General'}</span>
                <h3>${a.title}</h3>
                <p class="announcement-date"><i class="far fa-calendar-alt"></i> ${a.published_at ? new Date(a.published_at).toLocaleDateString() : a.date || ''}</p>
                <p>${(a.description || a.content || '').substring(0, 120)}...</p>
                <a class="read-more-link announce-read-btn" data-id="${a.id}">Read More <i class="fas fa-arrow-right"></i></a>
              </div>
            </div>`;
          }).join('')
        : '<p style="text-align:center;">No announcements</p>';

      grid.querySelectorAll('.announce-read-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const a = announcements.find(x => x.id == this.dataset.id);
          if (!a) return;
          const detailImg = a.image ? `<img src="${a.image.startsWith('http') || a.image.startsWith('/') ? a.image : BASE_URL + '/' + a.image}" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;margin-bottom:15px;" onerror="this.style.display='none';">` : '';
          document.getElementById('announcementContent').innerHTML = `
            <button class="modal-close modal-close-btn" onclick="document.getElementById('announcementModalOverlay').classList.remove('active')">&times;</button>
            ${detailImg}
            <h2>${a.title}</h2>
            <span class="cat-badge">${a.category || 'General'}</span>
            <p class="announcement-date"><i class="far fa-calendar-alt"></i> ${a.published_at ? new Date(a.published_at).toLocaleDateString() : a.date || ''}</p>
            <p style="margin-top:15px;line-height:1.8;">${a.description || a.content || 'No details.'}</p>
          `;
          document.getElementById('announcementModalOverlay').classList.add('active');
        });
      });
    } catch (e) { console.error('Announcements error:', e); }
  }

  // ==================== DOCUMENTS ====================
  async function loadDocuments() {
    try {
      const res = await window.API.citizen.getDocuments();
      const docs = res.success ? (res.data || []) : [];
      const tbody = document.getElementById('documentsTableBody');
      tbody.innerHTML = docs.length > 0
        ? docs.map(d => `
            <tr>
              <td><strong>${d.document_type || d.name || 'Document'}</strong></td>
              <td>${d.document_type || 'N/A'}</td>
              <td>${d.issueDate || d.issue_date || (d.sent_at ? new Date(d.sent_at).toLocaleDateString() : 'N/A')}</td>
              <td><span class="status-badge status-approved">Ready</span></td>
              <td>
                <button class="btn-sm dl-btn" data-id="${d.id}"><i class="fas fa-download"></i></button>
                <button class="btn-sm print-btn" data-id="${d.id}"><i class="fas fa-print"></i></button>
                <button class="btn-sm share-btn" data-id="${d.id}"><i class="fas fa-share"></i></button>
              </td>
            </tr>`).join('')
        : '<tr><td colspan="5" style="text-align:center;">No documents. Make a payment first.</td></tr>';

      tbody.querySelectorAll('.dl-btn').forEach(b => b.addEventListener('click', async function() {
        try {
          const token = window.API.getToken();
          const id = this.dataset.id;
          const response = await fetch(`${API_URL}/citizen/documents/${id}/download`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `document_${id}`; a.click(); URL.revokeObjectURL(url);
            showToast('success', 'Downloaded!');
          } else {
            showToast('error', 'Download failed');
          }
        } catch (e) { showToast('error', 'Network error'); }
      }));

      tbody.querySelectorAll('.print-btn').forEach(b => b.addEventListener('click', () => {
        const token = window.API.getToken();
        const url = `${API_URL}/citizen/documents/${b.dataset.id}/print`;
        window.open(url + '?token=' + encodeURIComponent(token), '_blank');
      }));

      tbody.querySelectorAll('.share-btn').forEach(b => b.addEventListener('click', () => {
        const email = prompt('Enter recipient email:');
        if (email) {
          window.API.citizen.shareDocument(b.dataset.id, email).then(res => {
            showToast(res.success ? 'success' : 'error', res.message || (res.success ? 'Shared!' : 'Failed'));
          });
        }
      }));
    } catch (e) { console.error('Documents error:', e); }
  }

  // ==================== PROFILE ====================
  async function loadProfile() {
    try {
      const res = await window.API.citizen.getProfile();
      if (res.success) {
        const p = res.data?.profile || res.data?.user || res.data || {};
        profileData = p;
        document.getElementById('profileDisplayName').textContent = p.full_name || session.full_name || 'Citizen';
        document.getElementById('profileName').textContent = p.full_name || '-';
        document.getElementById('profileEmail').textContent = p.email || session.email || '-';
        document.getElementById('profilePhone').textContent = p.phone || '-';
        document.getElementById('profileAddress').textContent = p.address || '-';
        document.getElementById('profileWard').textContent = p.ward_name || session.ward_name || '-';
        updateUI();
      }
    } catch (e) { console.error('Profile error:', e); }
  }

  document.getElementById('openProfileEditBtn')?.addEventListener('click', () => {
    document.getElementById('editProfileName').value = profileData.full_name || '';
    document.getElementById('editProfileEmail').value = profileData.email || session.email || '';
    document.getElementById('editProfilePhone').value = profileData.phone || '';
    document.getElementById('editProfileAddress').value = profileData.address || '';
    document.getElementById('profileEditModalOverlay').classList.add('active');
  });
  document.getElementById('profileEditCloseBtn')?.addEventListener('click', () => document.getElementById('profileEditModalOverlay')?.classList.remove('active'));

  document.getElementById('profileEditForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      full_name: document.getElementById('editProfileName').value,
      email: document.getElementById('editProfileEmail').value,
      address: document.getElementById('editProfileAddress').value
    };
    const phone = document.getElementById('editProfilePhone').value.trim();
    if (phone) data.phone = phone;
    try {
      const res = await window.API.citizen.updateProfile(data);
      if (res.success) { showToast('success', 'Profile updated!'); document.getElementById('profileEditModalOverlay').classList.remove('active'); loadProfile(); }
      else showToast('error', res.message || 'Update failed');
    } catch (err) { showToast('error', 'Network error'); }
  });

  document.getElementById('profilePhotoUpload')?.addEventListener('change', async function() {
    const file = this.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToast('error', 'Please select an image');
    const fd = new FormData(); fd.append('profile_photo', file);
    try {
      const res = await window.API.citizen.updatePhoto(fd);
      if (res.success) { showToast('success', 'Photo updated!'); loadProfile(); }
      else showToast('error', res.message || 'Failed');
    } catch (e) { showToast('error', 'Upload failed'); }
  });

  document.getElementById('openPasswordBtn')?.addEventListener('click', () => {
    document.getElementById('passwordChangeForm')?.reset();
    document.getElementById('passwordModalOverlay')?.classList.add('active');
  });
  document.getElementById('passwordModalCloseBtn')?.addEventListener('click', () => document.getElementById('passwordModalOverlay')?.classList.remove('active'));

  document.getElementById('passwordChangeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cp = document.getElementById('currentPassword').value;
    const np = document.getElementById('newPassword').value;
    const cf = document.getElementById('confirmPassword').value;
    if (np !== cf) return showToast('error', 'Passwords do not match');
    if (np.length < 6) return showToast('error', 'Minimum 6 characters');
    try {
      const res = await window.API.citizen.changePassword(cp, np, cf);
      if (res.success) { showToast('success', 'Password changed!'); document.getElementById('passwordModalOverlay').classList.remove('active'); }
      else showToast('error', res.message || 'Failed');
    } catch (e) { showToast('error', 'Network error'); }
  });

  // ==================== HELP ====================
  document.getElementById('contactAdminBtn')?.addEventListener('click', async () => {
    const subject = prompt('Subject:');
    const message = prompt('Message:');
    if (subject && message) {
      try { const res = await window.API.citizen.contactAdmin(subject, message); showToast(res.success ? 'success' : 'error', res.message || 'Sent!'); } catch (e) {}
    }
  });
  document.getElementById('viewFaqBtn')?.addEventListener('click', async () => {
    try {
      const res = await window.API.citizen.getFAQs();
      if (res.success) {
        const faqs = res.data || [];
        alert(faqs.length > 0 ? faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n') : 'No FAQs available');
      }
    } catch (e) {}
  });
  document.getElementById('reportIssueBtn')?.addEventListener('click', async () => {
    const title = prompt('Issue Title:');
    const desc = prompt('Description:');
    if (title && desc) {
      try { const res = await window.API.citizen.reportIssue(title, desc); showToast(res.success ? 'success' : 'error', res.message || 'Reported!'); } catch (e) {}
    }
  });

  // ==================== SEARCH ====================
  citizenSearch?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const t = citizenSearch.value.toLowerCase();
      if (t.includes('app')) navigateToPage('applications');
      else if (t.includes('pay')) navigateToPage('payments');
      else if (t.includes('msg') || t.includes('chat')) navigateToPage('messages');
      else if (t.includes('doc')) navigateToPage('documents');
      else if (t.includes('profile') || t.includes('account')) navigateToPage('profile');
      else if (t.includes('announce')) navigateToPage('announcements');
      else if (t.includes('help') || t.includes('support')) navigateToPage('help');
    }
  });

  // ==================== INIT ====================
  async function init() {
    await loadProfile();
    updateUI();
    updateClock();
    navigateToPage('dashboard');
    console.log('👤 LAMS Citizen Portal - Fully Fixed');
  }

  init();
});