// citizen.js - Professional Version with Enhanced Payment Flow
document.addEventListener('DOMContentLoaded', () => {
  // ==================== DATA STORE ====================
  function getStore(key, defaultValue) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }
  function setStore(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  let applications = getStore('citizen_applications', [
    { id: 'APP-001', docType: 'Residence Confirmation Letter', date: '2026-06-10', status: 'Approved', reason: 'For bank account opening', notes: '' },
    { id: 'APP-002', docType: 'Identity Confirmation Letter', date: '2026-06-15', status: 'Pending', reason: 'For passport application', notes: '' },
    { id: 'APP-003', docType: 'Business Permit Support Letter', date: '2026-06-18', status: 'Pending', reason: 'Starting small business', notes: 'Need for Mtaa office' },
    { id: 'APP-004', docType: 'Recommendation Letter', date: '2026-05-20', status: 'Approved', reason: 'Job application', notes: '' },
  ]);

  let payments = getStore('citizen_payments', [
    { id: 'PAY-001', appId: 'APP-001', docType: 'Residence Confirmation Letter', description: 'Document Processing Fee', amount: 15000, date: '2026-06-10', status: 'Paid', method: 'Mobile Money', transactionId: 'TXN-001', controlNumber: '991412345678' },
    { id: 'PAY-002', appId: 'APP-004', docType: 'Recommendation Letter', description: 'Document Processing Fee', amount: 10000, date: '2026-05-20', status: 'Paid', method: 'Bank Transfer', transactionId: 'TXN-002', controlNumber: '991487654321' },
    { id: 'PAY-003', appId: 'APP-002', docType: 'Identity Confirmation Letter', description: 'Certificate Issuance Fee', amount: 25000, date: '2026-06-15', status: 'Unpaid', method: '', transactionId: '', controlNumber: '' },
    { id: 'PAY-004', appId: 'APP-003', docType: 'Business Permit Support Letter', description: 'Business Permit Fee', amount: 30000, date: '2026-06-18', status: 'Unpaid', method: '', transactionId: '', controlNumber: '' },
  ]);

  let documents = getStore('citizen_documents', [
    { id: 'DOC-001', appId: 'APP-001', name: 'Residence Confirmation Letter', type: 'Official Letter', issueDate: '2026-06-10', status: 'Ready' },
    { id: 'DOC-002', appId: 'APP-004', name: 'Recommendation Letter', type: 'Official Letter', issueDate: '2026-05-20', status: 'Ready' },
  ]);

  let profile = getStore('citizen_profile', {
    name: 'Maria Joseph', email: 'maria.joseph@email.com', phone: '+255 765 432 109',
    address: '45 Mtaa Street, Dar es Salaam', nationalId: 'TZ-1990-12345678',
    photo: 'https://ui-avatars.com/api/?name=Maria+Joseph&background=0066cc&color=fff&size=120'
  });

  let notifications = getStore('citizen_notifications', [
    { id: 1, message: 'Your Residence Letter has been approved!', time: '2 hours ago', read: false, icon: 'fa-check-circle', color: '#00b894' },
    { id: 2, message: 'Payment of TZS 15,000 confirmed.', time: '5 hours ago', read: false, icon: 'fa-credit-card', color: '#0066cc' },
    { id: 3, message: 'New message from Local Administrator.', time: '1 day ago', read: false, icon: 'fa-envelope', color: '#f59e0b' },
  ]);

  let chatHistory = getStore('citizen_chat_admin', [
    { sender: 'admin', text: 'Hello Maria! How can I help you today?', time: '10:30 AM' },
    { sender: 'citizen', text: 'I wanted to check the status of my residence letter application.', time: '10:32 AM' },
    { sender: 'admin', text: 'Your application has been approved! You can download the document from your portal.', time: '10:35 AM' },
    { sender: 'citizen', text: 'Thank you so much for the quick update!', time: '10:36 AM' },
  ]);

  let supportChatHistory = getStore('citizen_chat_support', [
    { sender: 'support', text: 'Hello! I\'m the Support Assistant. How can I help you today?', time: '09:00 AM' },
  ]);

  let currentChatTab = 'admin';
  let currentPaymentPage = 1;
  let proPaymentData = null;
  let proPaymentStep = 1;
  const itemsPerPage = 5;

  function saveAllData() {
    setStore('citizen_applications', applications);
    setStore('citizen_payments', payments);
    setStore('citizen_documents', documents);
    setStore('citizen_profile', profile);
    setStore('citizen_notifications', notifications);
    setStore('citizen_chat_admin', chatHistory);
    setStore('citizen_chat_support', supportChatHistory);
  }

  // ==================== AVATAR HELPER ====================
  function getAvatarHTML(photo, name) {
    if (photo && photo.startsWith('http')) return `<img src="${photo}" alt="Avatar" class="table-avatar">`;
    if (photo && photo.startsWith('data:')) return `<img src="${photo}" alt="Avatar" class="table-avatar">`;
    const initials = (name || '?').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    return `<div class="table-avatar-default">${initials}</div>`;
  }

  // ==================== ANNOUNCEMENT IMAGE HELPER ====================
  function getAnnouncementImageHTML(image, title) {
    if (image && (image.startsWith('http') || image.startsWith('data:') || image.startsWith('/uploads/'))) {
      return `<img src="${image}" alt="${title}" class="announcement-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">`;
    }
    return `<div class="announcement-img-placeholder"><i class="fas fa-bullhorn"></i></div>`;
  }

  function getAnnouncementDetailImageHTML(image, title) {
    if (image && (image.startsWith('http') || image.startsWith('data:') || image.startsWith('/uploads/'))) {
      return `<img src="${image}" alt="${title}" class="announcement-detail-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">`;
    }
    return `<div class="announcement-detail-placeholder"><i class="fas fa-bullhorn"></i></div>`;
  }

  // ==================== PDF RECEIPT GENERATOR ====================
  function generatePDFReceipt(payment) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('LAMS - Local Administration', pageWidth / 2, 18, { align: 'center' });
    doc.text('Management System', pageWidth / 2, 28, { align: 'center' });
    doc.setTextColor(0, 102, 204); doc.setFontSize(16);
    doc.text('OFFICIAL PAYMENT RECEIPT', pageWidth / 2, 45, { align: 'center' });
    doc.setDrawColor(0, 102, 204); doc.line(15, 50, pageWidth - 15, 50);
    doc.setTextColor(30, 41, 59); doc.setFontSize(10);
    const leftX = 15, rightX = pageWidth / 2 + 5, lineHeight = 8;
    let yPos = 60;
    const addRow = (label, value, x, y) => { doc.setFont('helvetica', 'bold'); doc.text(label + ':', x, y); doc.setFont('helvetica', 'normal'); doc.text(value || 'N/A', x + 45, y); };
    addRow('Receipt No', payment.id, leftX, yPos); addRow('Transaction ID', payment.transactionId || 'N/A', rightX, yPos); yPos += lineHeight;
    addRow('Date', payment.date, leftX, yPos); addRow('Time', new Date().toLocaleTimeString(), rightX, yPos); yPos += lineHeight + 4;
    doc.setFillColor(240, 248, 255); doc.rect(15, yPos, pageWidth - 30, 8, 'F'); doc.setFontSize(11); doc.text('APPLICANT DETAILS', leftX, yPos + 5.5); yPos += 12; doc.setFontSize(10);
    addRow('Full Name', profile.name, leftX, yPos); addRow('National ID', profile.nationalId, rightX, yPos); yPos += lineHeight;
    addRow('Email', profile.email, leftX, yPos); addRow('Phone', profile.phone, rightX, yPos); yPos += lineHeight;
    addRow('Address', profile.address, leftX, yPos); yPos += lineHeight + 4;
    doc.setFillColor(240, 248, 255); doc.rect(15, yPos, pageWidth - 30, 8, 'F'); doc.setFontSize(11); doc.text('PAYMENT DETAILS', leftX, yPos + 5.5); yPos += 12; doc.setFontSize(10);
    addRow('Service', payment.docType, leftX, yPos); addRow('Description', payment.description, rightX, yPos); yPos += lineHeight;
    addRow('Payment Method', payment.method, leftX, yPos); addRow('Control Number', payment.controlNumber || 'N/A', rightX, yPos); yPos += lineHeight;
    doc.setFontSize(14); doc.setTextColor(0, 102, 204); doc.text('Amount Paid: TZS ' + payment.amount.toLocaleString(), pageWidth / 2, yPos + 10, { align: 'center' }); yPos += 20;
    doc.setTextColor(0, 184, 148); doc.setFontSize(12); doc.text('STATUS: PAID', pageWidth / 2, yPos, { align: 'center' });
    doc.setDrawColor(0, 102, 204); doc.line(15, yPos + 10, pageWidth - 15, yPos + 10);
    doc.setTextColor(71, 85, 105); doc.setFontSize(8);
    doc.text('This is an official receipt from LAMS.', pageWidth / 2, yPos + 18, { align: 'center' });
    doc.text('Generated on: ' + new Date().toLocaleString(), pageWidth / 2, yPos + 24, { align: 'center' });
    doc.save(`LAMS_Receipt_${payment.id}.pdf`);
  }

  // ==================== DOM REFERENCES ====================
  const body = document.body, sidebar = document.getElementById('sidebar'), sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-page]'), pageContents = document.querySelectorAll('.page-content');
  const themeToggle = document.getElementById('themeToggle'), languageToggle = document.getElementById('languageToggle'), langText = document.querySelector('.lang-text');
  const notificationBtn = document.getElementById('notificationBtn'), notificationDropdown = document.getElementById('notificationDropdown'), notifBadge = document.getElementById('notifBadge'), markAllRead = document.getElementById('markAllRead');
  const backToTopBtn = document.getElementById('backToTop'), userDropdownBtn = document.getElementById('userDropdownBtn'), userDropdownMenu = document.getElementById('userDropdownMenu'), citizenSearch = document.getElementById('citizenSearch');

  // ==================== TOAST ====================
  function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }
  window.showToast = showToast;

  function addNotification(message, icon, color) {
    notifications.unshift({ id: Date.now(), message, time: 'Just now', read: false, icon, color });
    if (notifications.length > 20) notifications.pop();
    saveAllData(); updateNotificationBadge(); renderNotifications();
  }

  // ==================== PAGE NAVIGATION ====================
  function navigateToPage(pageName) {
    sidebarLinks.forEach(link => { link.classList.remove('active'); if (link.getAttribute('data-page') === pageName) link.classList.add('active'); });
    pageContents.forEach(page => { page.classList.remove('active'); if (page.id === `page-${pageName}`) page.classList.add('active'); });
    document.querySelector('.page-content-wrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.innerWidth <= 992) sidebar.classList.remove('active');
    switch(pageName) { case 'dashboard': updateDashboard(); break; case 'applications': renderApplications(); break; case 'payments': renderPayments(); break; case 'messages': renderMessages(); break; case 'announcements': renderAnnouncements(); break; case 'documents': renderDocuments(); break; case 'profile': updateProfileDisplay(); break; }
  }
  sidebarLinks.forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); navigateToPage(link.getAttribute('data-page')); window.location.hash = link.getAttribute('data-page'); }); });
  document.querySelectorAll('[data-page]').forEach(el => { if (!el.classList.contains('sidebar-link')) el.addEventListener('click', () => { const p = el.getAttribute('data-page'); if (p) navigateToPage(p); }); });
  function handleHashChange() { const hash = window.location.hash.replace('#', ''); if (hash && document.getElementById(`page-${hash}`)) navigateToPage(hash); }
  window.addEventListener('hashchange', handleHashChange); handleHashChange();

  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
  document.addEventListener('click', (e) => { if (window.innerWidth <= 992 && !sidebar.contains(e.target) && e.target !== sidebarToggle && !sidebarToggle.contains(e.target)) sidebar.classList.remove('active'); });

  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') { body.classList.add('dark-mode'); themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; }
  themeToggle.addEventListener('click', () => { body.classList.toggle('dark-mode'); const isDark = body.classList.contains('dark-mode'); themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'; localStorage.setItem('theme', isDark ? 'dark' : 'light'); });

  let isEnglish = true;
  languageToggle.addEventListener('click', () => { isEnglish = !isEnglish; langText.textContent = isEnglish ? 'EN' : 'SW'; showToast('info', isEnglish ? 'Language: English' : 'Lugha: Kiswahili'); });

  function updateClock() { const now = new Date(); const ce = document.getElementById('realTimeClock'), de = document.getElementById('realTimeDate'); if (ce) ce.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); if (de) de.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
  setInterval(updateClock, 1000); updateClock();

  function updateNotificationBadge() { const unread = notifications.filter(n => !n.read).length; notifBadge.textContent = unread; notifBadge.style.display = unread > 0 ? 'flex' : 'none'; }
  function renderNotifications() { const list = document.getElementById('notifList'); if (notifications.length === 0) list.innerHTML = '<p class="no-notifications">No new notifications</p>'; else { list.innerHTML = notifications.map(n => `<div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}"><i class="fas ${n.icon}" style="color:${n.color};"></i><div><p>${n.message}</p><small>${n.time}</small></div></div>`).join(''); list.querySelectorAll('.notif-item').forEach(item => { item.addEventListener('click', function() { const id = parseInt(this.getAttribute('data-id')); notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n); saveAllData(); renderNotifications(); }); }); } updateNotificationBadge(); }
  notificationBtn.addEventListener('click', (e) => { e.stopPropagation(); notificationDropdown.classList.toggle('active'); userDropdownMenu.classList.remove('active'); });
  document.addEventListener('click', (e) => { if (!notificationDropdown.contains(e.target) && e.target !== notificationBtn && !notificationBtn.contains(e.target)) notificationDropdown.classList.remove('active'); if (!userDropdownMenu.contains(e.target) && e.target !== userDropdownBtn && !userDropdownBtn.contains(e.target)) userDropdownMenu.classList.remove('active'); });
  markAllRead.addEventListener('click', () => { notifications = notifications.map(n => ({ ...n, read: true })); saveAllData(); renderNotifications(); showToast('success', 'All notifications marked as read'); });
  userDropdownBtn.addEventListener('click', (e) => { e.stopPropagation(); userDropdownMenu.classList.toggle('active'); notificationDropdown.classList.remove('active'); });

  // ==================== LOGOUT ====================
  const logoutModalOverlay = document.getElementById('logoutModalOverlay'), logoutModal = document.getElementById('logoutModal');
  function openLogoutModal() { logoutModalOverlay.classList.add('active'); logoutModal.classList.add('active'); }
  function closeLogoutModal() { logoutModalOverlay.classList.remove('active'); logoutModal.classList.remove('active'); }
  window.closeLogoutModal = closeLogoutModal;
  window.confirmLogout = function() { closeLogoutModal(); showToast('info', 'Logging out...'); setTimeout(() => { window.location.href = 'login.html'; }, 1000); };
  document.getElementById('logoutSidebarBtn').addEventListener('click', (e) => { e.preventDefault(); openLogoutModal(); });
  document.getElementById('logoutDropdownBtn').addEventListener('click', (e) => { e.preventDefault(); openLogoutModal(); });
  document.getElementById('logoutCancelBtn').addEventListener('click', closeLogoutModal);
  document.getElementById('logoutConfirmBtn').addEventListener('click', window.confirmLogout);
  logoutModalOverlay.addEventListener('click', function(e) { if (e.target === logoutModalOverlay) closeLogoutModal(); });
  logoutModal.addEventListener('click', function(e) { e.stopPropagation(); });

  window.addEventListener('scroll', () => { if (window.scrollY > 400) backToTopBtn.classList.add('visible'); else backToTopBtn.classList.remove('visible'); });
  backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ==================== DASHBOARD ====================
  function updateDashboard() {
    const pendingApps = applications.filter(a => a.status === 'Pending' || a.status === 'Processing').length;
    const approvedApps = applications.filter(a => a.status === 'Approved').length;
    const paidPayments = payments.filter(p => p.status === 'Paid').length;
    const unreadNotifs = notifications.filter(n => !n.read).length;
    document.getElementById('dashboardCitizenName').textContent = profile.name;
    document.getElementById('dashPending').textContent = pendingApps;
    document.getElementById('dashCompleted').textContent = approvedApps;
    document.getElementById('statTotalApps').setAttribute('data-target', applications.length);
    document.getElementById('statPending').setAttribute('data-target', pendingApps);
    document.getElementById('statApproved').setAttribute('data-target', approvedApps);
    document.getElementById('statPayments').setAttribute('data-target', paidPayments);
    document.getElementById('statNotifs').setAttribute('data-target', unreadNotifs);
    const activityList = document.getElementById('dashboardActivityList');
    const activities = [];
    applications.slice(0, 3).forEach(app => activities.push({ icon: 'fa-file-alt', color: app.status === 'Approved' ? '#00b894' : '#f59e0b', text: `${app.docType} - ${app.status}`, time: app.date }));
    payments.filter(p => p.status === 'Paid').slice(0, 2).forEach(pay => activities.push({ icon: 'fa-credit-card', color: '#0066cc', text: `Payment of TZS ${pay.amount.toLocaleString()}`, time: pay.date }));
    activityList.innerHTML = activities.map(a => `<div class="activity-item"><i class="fas ${a.icon}" style="color:${a.color};"></i><div><p>${a.text}</p><small>${a.time}</small></div></div>`).join('') || '<p style="color:var(--text-light);">No recent activity</p>';
    updateSidebarBadges();
  }
  function updateSidebarBadges() { const pa = applications.filter(a => a.status === 'Pending' || a.status === 'Processing').length, up = payments.filter(p => p.status === 'Unpaid').length; document.getElementById('appBadge').textContent = pa; document.getElementById('appBadge').style.display = pa > 0 ? '' : 'none'; document.getElementById('paymentBadge').textContent = up; document.getElementById('paymentBadge').style.display = up > 0 ? '' : 'none'; }

  // ==================== APPLICATIONS ====================
  function renderApplications() {
    const tbody = document.getElementById('appTableBody');
    tbody.innerHTML = applications.map(app => {
      const relatedPayment = payments.find(p => p.appId === app.id && p.status === 'Unpaid');
      const paidPayment = payments.find(p => p.appId === app.id && p.status === 'Paid');
      return `
        <tr>
          <td>${getAvatarHTML(profile.photo, profile.name)}</td>
          <td><strong>#${app.id}</strong></td>
          <td>${app.docType}</td>
          <td>${app.date}</td>
          <td><span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span></td>
          <td>
            <button class="btn-sm view-app-btn" data-id="${app.id}" title="View Details"><i class="fas fa-eye"></i> View</button>
            ${relatedPayment ? `<button class="btn-sm btn-primary pay-now-btn" data-id="${app.id}" title="Pay Now"><i class="fas fa-credit-card"></i> Pay Now</button>` : ''}
            ${paidPayment ? `<span class="status-badge status-paid" style="margin-left:4px;"><i class="fas fa-check"></i> Paid</span>` : (relatedPayment ? '' : '<span class="status-badge status-paid" style="margin-left:4px;"><i class="fas fa-check"></i> Paid</span>')}
          </td>
        </tr>
      `;
    }).join('');
    tbody.querySelectorAll('.view-app-btn').forEach(btn => { btn.addEventListener('click', function() { viewApplication(this.getAttribute('data-id')); }); });
    tbody.querySelectorAll('.pay-now-btn').forEach(btn => { btn.addEventListener('click', function() { openProfessionalPayment(this.getAttribute('data-id')); }); });
  }

  function viewApplication(appId) {
    const app = applications.find(a => a.id === appId); if (!app) return;
    const payment = payments.find(p => p.appId === appId);
    const content = document.getElementById('appDetailContent');
    content.innerHTML = `<button class="modal-close modal-close-btn" id="appDetailCloseBtn">&times;</button><h2>Application Details</h2><p><strong>App ID:</strong> #${app.id}</p><p><strong>Document:</strong> ${app.docType}</p><p><strong>Date:</strong> ${app.date}</p><p><strong>Status:</strong> <span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span></p><p><strong>Reason:</strong> ${app.reason || 'N/A'}</p><p><strong>Notes:</strong> ${app.notes || 'N/A'}</p>${payment ? `<p><strong>Payment:</strong> <span class="status-badge status-${payment.status === 'Paid' ? 'paid' : 'unpaid'}">${payment.status}</span> - TZS ${payment.amount.toLocaleString()}</p>` : ''}${payment && payment.status === 'Unpaid' ? `<button class="btn btn-primary" id="payFromDetailBtn"><i class="fas fa-credit-card"></i> Pay Now</button>` : ''}`;
    const overlay = document.getElementById('appDetailModalOverlay'), modal = document.getElementById('appDetailModal');
    overlay.classList.add('active'); modal.classList.add('active');
    document.getElementById('appDetailCloseBtn').addEventListener('click', closeAppDetailModal);
    const payBtn = document.getElementById('payFromDetailBtn');
    if (payBtn) payBtn.addEventListener('click', () => { closeAppDetailModal(); openProfessionalPayment(appId); });
  }
  function closeAppDetailModal() { document.getElementById('appDetailModalOverlay').classList.remove('active'); document.getElementById('appDetailModal').classList.remove('active'); }
  document.getElementById('appDetailModalOverlay').addEventListener('click', function(e) { if (e.target === this) closeAppDetailModal(); });

  // ==================== NEW APPLICATION MODAL ====================
  const appModalOverlay = document.getElementById('appModalOverlay'), appModal = document.getElementById('appModal'), appModalContent = document.getElementById('appModalContent');
  function openAppModal() { appModalOverlay.classList.add('active'); appModal.classList.add('active'); }
  function closeAppModal() { appModalOverlay.classList.remove('active'); appModal.classList.remove('active'); document.getElementById('applicationForm').reset(); }
  document.getElementById('newApplicationBtn').addEventListener('click', openAppModal);
  document.getElementById('appModalCloseBtn').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closeAppModal(); });
  document.getElementById('appModalCancelBtn').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closeAppModal(); });
  appModalOverlay.addEventListener('click', function(e) { if (e.target === appModalOverlay) closeAppModal(); });
  appModalContent.addEventListener('click', function(e) { e.stopPropagation(); });
  document.getElementById('applicationForm').addEventListener('submit', function(e) {
    e.preventDefault(); const docType = document.getElementById('appDocType').value, reason = document.getElementById('appReason').value, notes = document.getElementById('appNotes').value;
    if (!docType) { showToast('error', 'Please select a document type'); return; }
    const appId = 'APP-' + String(applications.length + 1).padStart(3, '0'), today = new Date().toISOString().split('T')[0];
    applications.push({ id: appId, docType, date: today, status: 'Pending', reason, notes });
    const amounts = { 'Residence Confirmation Letter': 15000, 'Identity Confirmation Letter': 25000, 'Business Permit Support Letter': 30000, 'Recommendation Letter': 10000, 'Custom Request': 20000 };
    const payId = 'PAY-' + String(payments.length + 1).padStart(3, '0');
    payments.push({ id: payId, appId, docType, description: 'Document Processing Fee', amount: amounts[docType] || 20000, date: today, status: 'Unpaid', method: '', transactionId: '', controlNumber: '' });
    saveAllData(); addNotification('New application: ' + docType, 'fa-file-alt', '#f59e0b'); showToast('success', 'Application submitted!'); closeAppModal(); updateDashboard(); renderApplications(); renderPayments(); updateSidebarBadges();
  });
  document.getElementById('appStatusFilter').addEventListener('change', function(e) { const f = e.target.value; document.querySelectorAll('#appTableBody tr').forEach(row => { const b = row.querySelector('.status-badge'); row.style.display = (f === 'all' || (b && b.textContent.trim() === f)) ? '' : 'none'; }); });
  document.getElementById('appSearchInput').addEventListener('input', function(e) { const s = e.target.value.toLowerCase(); document.querySelectorAll('#appTableBody tr').forEach(row => { row.style.display = row.textContent.toLowerCase().includes(s) ? '' : 'none'; }); });

  // ==================== PROFESSIONAL PAYMENT FLOW ====================
  function openProfessionalPayment(appId) {
    const payment = payments.find(p => p.appId === appId && p.status === 'Unpaid');
    if (!payment) { showToast('info', 'No unpaid payment found for this application'); return; }
    proPaymentData = { appId, payment }; proPaymentStep = 1;
    document.getElementById('proPaymentModalOverlay').classList.add('active');
    document.getElementById('proPaymentModal').classList.add('active');
    renderProPaymentStep();
  }
  function closeProPayment() { document.getElementById('proPaymentModalOverlay').classList.remove('active'); document.getElementById('proPaymentModal').classList.remove('active'); proPaymentData = null; proPaymentStep = 1; }
  document.getElementById('proPaymentCloseBtn').addEventListener('click', closeProPayment);
  document.getElementById('proPaymentModalOverlay').addEventListener('click', function(e) { if (e.target === this) closeProPayment(); });

  function renderProPaymentStep() {
    const content = document.getElementById('proPaymentStepContent');
    const navBtns = document.getElementById('paymentNavButtons');
    document.querySelectorAll('#paymentSteps .step').forEach(s => { s.classList.remove('active', 'completed'); const stepNum = parseInt(s.getAttribute('data-step')); if (stepNum < proPaymentStep) s.classList.add('completed'); if (stepNum === proPaymentStep) s.classList.add('active'); });

    switch(proPaymentStep) {
      case 1:
        content.innerHTML = `<h3>Select Payment Method</h3>
          <div class="payment-method-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:15px;">
            <button class="payment-method-card" data-method="mobile" onclick="selectProPaymentMethod('mobile')"><i class="fas fa-mobile-alt" style="font-size:2rem;color:var(--primary);display:block;margin-bottom:8px;"></i>Mobile Money</button>
            <button class="payment-method-card" data-method="visa" onclick="selectProPaymentMethod('visa')"><i class="fab fa-cc-visa" style="font-size:2rem;color:#1a1f71;display:block;margin-bottom:8px;"></i>Visa Card</button>
            <button class="payment-method-card" data-method="mastercard" onclick="selectProPaymentMethod('mastercard')"><i class="fab fa-cc-mastercard" style="font-size:2rem;color:#eb001b;display:block;margin-bottom:8px;"></i>MasterCard</button>
            <button class="payment-method-card" data-method="bank" onclick="selectProPaymentMethod('bank')"><i class="fas fa-university" style="font-size:2rem;color:#475569;display:block;margin-bottom:8px;"></i>Bank Transfer</button>
          </div>`;
        navBtns.innerHTML = '';
        break;
      case 2:
        const methodLabels = { mobile: 'Mobile Money', visa: 'Visa Card', mastercard: 'MasterCard', bank: 'Bank Transfer' };
        let detailsHTML = `<h3>${methodLabels[proPaymentData.method]} Details</h3>`;
        if (proPaymentData.method === 'mobile') {
          detailsHTML += `<div class="form-group"><label>Mobile Number *</label><input type="text" id="mobileNumber" placeholder="e.g. 255 7XX XXX XXX"></div>
            <div class="form-group"><label>Network Provider *</label><select id="networkProvider"><option value="">Select Network</option><option>M-Pesa</option><option>Airtel Money</option><option>Tigo Pesa</option><option>HaloPesa</option></select></div>`;
        } else if (proPaymentData.method === 'visa' || proPaymentData.method === 'mastercard') {
          detailsHTML += `<div class="form-group"><label>Card Holder Name *</label><input type="text" id="cardHolder" placeholder="As shown on card"></div>
            <div class="form-group"><label>Card Number *</label><input type="text" id="cardNumber" placeholder="1234 5678 9012 3456"></div>
            <div style="display:flex;gap:12px;"><div class="form-group" style="flex:1;"><label>Expiry Date *</label><input type="text" id="cardExpiry" placeholder="MM/YY"></div><div class="form-group" style="flex:1;"><label>CVV *</label><input type="text" id="cardCVV" placeholder="123"></div></div>`;
        } else {
          detailsHTML += `<div class="form-group"><label>Bank Name *</label><select id="bankName"><option value="">Select Bank</option><option>CRDB Bank</option><option>NMB Bank</option><option>NBC Bank</option><option>Other</option></select></div>
            <div class="form-group"><label>Account Number *</label><input type="text" id="bankAccount" placeholder="Enter account number"></div>`;
        }
        content.innerHTML = detailsHTML;
        navBtns.innerHTML = `<button class="btn btn-outline" onclick="proPaymentStep=1;renderProPaymentStep();">Back</button><button class="btn btn-primary" onclick="goToSecurityStep()">Continue</button>`;
        break;
      case 3:
        content.innerHTML = `<h3><i class="fas fa-shield-alt"></i> Security Verification</h3><p style="color:var(--text-light);margin-bottom:15px;">Enter your payment PIN to authorize this transaction</p>
          <div class="form-group"><label>Payment PIN *</label><input type="password" id="paymentPin" placeholder="Enter your 4-6 digit PIN" maxlength="6" style="font-size:1.2rem;letter-spacing:5px;text-align:center;"></div>
          <p style="font-size:0.8rem;color:var(--text-light);"><i class="fas fa-lock"></i> Your PIN is encrypted and secure</p>`;
        navBtns.innerHTML = `<button class="btn btn-outline" onclick="proPaymentStep=2;renderProPaymentStep();">Back</button><button class="btn btn-primary" onclick="goToReviewStep()">Verify & Continue</button>`;
        break;
      case 4:
        content.innerHTML = `<h3>Review Payment</h3>
          <div class="payment-review-card">
            <div class="review-row"><span class="review-label">Application ID</span><span class="review-value">#${proPaymentData.appId}</span></div>
            <div class="review-row"><span class="review-label">Document Type</span><span class="review-value">${proPaymentData.payment.docType}</span></div>
            <div class="review-row"><span class="review-label">Amount</span><span class="review-value" style="color:var(--primary);font-weight:700;">TZS ${proPaymentData.payment.amount.toLocaleString()}</span></div>
            <div class="review-row"><span class="review-label">Payment Method</span><span class="review-value">${methodLabels[proPaymentData.method] || 'N/A'}</span></div>
            <div class="review-row"><span class="review-label">Date</span><span class="review-value">${new Date().toLocaleDateString()}</span></div>
          </div>`;
        navBtns.innerHTML = `<button class="btn btn-outline" onclick="proPaymentStep=3;renderProPaymentStep();">Back</button><button class="btn btn-primary" onclick="confirmProPayment()"><i class="fas fa-lock"></i> Confirm Payment</button>`;
        break;
    }
  }

  window.selectProPaymentMethod = function(method) { proPaymentData.method = method; proPaymentStep = 2; renderProPaymentStep(); };
  window.goToSecurityStep = function() { proPaymentStep = 3; renderProPaymentStep(); };
  window.goToReviewStep = function() { proPaymentStep = 4; renderProPaymentStep(); };
  window.confirmProPayment = function() {
    const payment = proPaymentData.payment;
    payment.status = 'Paid';
    payment.method = { mobile: 'Mobile Money', visa: 'Visa Card', mastercard: 'MasterCard', bank: 'Bank Transfer' }[proPaymentData.method] || 'Online Payment';
    payment.transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    payment.controlNumber = '9914' + Math.random().toString().substr(2, 8);
    const app = applications.find(a => a.id === proPaymentData.appId);
    if (app) { app.status = 'Approved'; if (!documents.find(d => d.appId === proPaymentData.appId)) { documents.push({ id: 'DOC-' + String(documents.length + 1).padStart(3, '0'), appId: proPaymentData.appId, name: app.docType, type: 'Official Letter', issueDate: new Date().toISOString().split('T')[0], status: 'Ready' }); } }
    saveAllData(); closeProPayment(); document.getElementById('successMessageText').textContent = 'Your payment of TZS ' + payment.amount.toLocaleString() + ' has been processed. Your document request is now being processed.'; document.getElementById('successModalOverlay').classList.add('active'); document.getElementById('successModal').classList.add('active');
    addNotification('Payment of TZS ' + payment.amount.toLocaleString() + ' confirmed', 'fa-credit-card', '#0066cc');
    updateDashboard(); renderApplications(); renderPayments(); renderDocuments(); updateSidebarBadges();
  };
  window.closeSuccessModal = function() { document.getElementById('successModalOverlay').classList.remove('active'); document.getElementById('successModal').classList.remove('active'); };

  document.addEventListener('click', function(e) {
    if (e.target.closest('.payment-method-card')) {
      document.querySelectorAll('.payment-method-card').forEach(c => { c.style.border = '2px solid var(--border)'; c.style.background = 'var(--bg)'; });
      const card = e.target.closest('.payment-method-card');
      card.style.border = '2px solid var(--primary)';
      card.style.background = 'rgba(0,102,204,0.05)';
    }
  });

  // ==================== PAYMENTS ====================
  function renderPayments(page = 1) {
    currentPaymentPage = page;
    const tbody = document.getElementById('paymentTableBody');
    const startIdx = (page - 1) * itemsPerPage;
    const paginated = payments.slice(startIdx, startIdx + itemsPerPage);
    tbody.innerHTML = paginated.map(p => `
      <tr>
        <td>#${p.id}</td><td>${p.docType}</td><td>${p.description}</td>
        <td>TZS ${p.amount.toLocaleString()}</td><td>${p.date}</td>
        <td><span class="status-badge ${p.status === 'Paid' ? 'status-paid' : 'status-unpaid'}">${p.status}</span></td>
        <td>${p.status === 'Unpaid' ? `<button class="btn-sm btn-primary pay-hero-btn" data-id="${p.appId}"><i class="fas fa-credit-card"></i> Pay Now</button>` : `<button class="btn-sm receipt-btn" data-id="${p.id}"><i class="fas fa-download"></i> Receipt</button>`}</td>
      </tr>
    `).join('');
    tbody.querySelectorAll('.pay-hero-btn').forEach(btn => { btn.addEventListener('click', function() { openProfessionalPayment(this.getAttribute('data-id')); }); });
    tbody.querySelectorAll('.receipt-btn').forEach(btn => { btn.addEventListener('click', function() { const p = payments.find(p => p.id === this.getAttribute('data-id')); if (p) { generatePDFReceipt(p); showToast('success', 'Receipt downloaded!'); } }); });

    const historyBody = document.getElementById('paymentHistoryBody');
    const paidPayments = payments.filter(p => p.status === 'Paid');
    historyBody.innerHTML = paidPayments.map(p => `<tr><td>#${p.id}</td><td>${p.docType}</td><td>TZS ${p.amount.toLocaleString()}</td><td>${p.date}</td><td>${p.method || 'N/A'}</td><td><span class="status-badge status-paid">Paid</span></td></tr>`).join('') || '<tr><td colspan="6" style="text-align:center;">No payment history</td></tr>';

    const totalPages = Math.ceil(payments.length / itemsPerPage);
    const pagDiv = document.getElementById('paymentPagination');
    if (totalPages > 1) { pagDiv.innerHTML = `<button ${page===1?'disabled':''} class="pag-btn" data-page="${page-1}">Previous</button>${Array.from({length:totalPages},(_,i)=>`<button class="${page===i+1?'active':''} pag-btn" data-page="${i+1}">${i+1}</button>`).join('')}<button ${page===totalPages?'disabled':''} class="pag-btn" data-page="${page+1}">Next</button>`; pagDiv.querySelectorAll('.pag-btn').forEach(btn=>{btn.addEventListener('click',function(){renderPayments(parseInt(this.getAttribute('data-page')));});}); } else { pagDiv.innerHTML = ''; }
    updateOutstandingBalance();
  }

  function updateOutstandingBalance() {
    const unpaidTotal = payments.filter(p => p.status === 'Unpaid').reduce((sum, p) => sum + p.amount, 0);
    const hero = document.getElementById('outstandingBalanceHero');
    if (unpaidTotal > 0) { hero.style.display = 'block'; document.getElementById('outstandingBalanceAmount').textContent = 'TZS ' + unpaidTotal.toLocaleString(); }
    else { hero.style.display = 'none'; }
  }

  document.getElementById('payOutstandingHeroBtn').addEventListener('click', function() {
    const firstUnpaid = payments.find(p => p.status === 'Unpaid');
    if (firstUnpaid) openProfessionalPayment(firstUnpaid.appId);
    else showToast('info', 'No unpaid payments found');
  });

  document.getElementById('paymentStatusFilter').addEventListener('change', function(e) { const f = e.target.value; document.querySelectorAll('#paymentTableBody tr').forEach(row => { const b = row.querySelector('.status-badge'); row.style.display = (f === 'all' || (b && b.textContent.trim() === f)) ? '' : 'none'; }); });
  document.getElementById('paymentSearchInput').addEventListener('input', function(e) { const s = e.target.value.toLowerCase(); document.querySelectorAll('#paymentTableBody tr').forEach(row => { row.style.display = row.textContent.toLowerCase().includes(s) ? '' : 'none'; }); });

  // ==================== MESSAGES / CHAT ====================
  function renderMessages() { renderChatHistory(); }
  function renderChatHistory() { const chatBody = document.getElementById('citizenChatBody'); const history = currentChatTab === 'admin' ? chatHistory : supportChatHistory; chatBody.innerHTML = history.map(msg => `<div class="msg ${msg.sender==='citizen'?'sent':'received'}"><div class="bubble">${msg.text}</div><small>${msg.time}</small></div>`).join(''); setTimeout(() => { chatBody.scrollTop = chatBody.scrollHeight; }, 50); }
  const chatInput = document.getElementById('citizenChatInput'), sendBtn = document.getElementById('citizenSendBtn');
  function sendMessage() { const text = chatInput.value.trim(); if (!text) return; const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); if (currentChatTab === 'admin') chatHistory.push({ sender: 'citizen', text, time: timeStr }); else supportChatHistory.push({ sender: 'citizen', text, time: timeStr }); saveAllData(); renderChatHistory(); chatInput.value = ''; chatInput.focus();
    setTimeout(() => { const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); if (currentChatTab === 'admin') { chatHistory.push({ sender: 'admin', text: 'Thank you for your message. We will respond shortly.', time: replyTime }); } else { const lt = text.toLowerCase(); let reply = 'Thank you for reaching out. How can I assist you further?'; if (lt.includes('application')) reply = 'Submit new applications from "My Applications". Select document type and fill in the details.'; else if (lt.includes('payment')) reply = 'Make payments from "Payments" menu. Click "Pay Now" on any unpaid item.'; else if (lt.includes('document')) reply = 'Once payment is confirmed, documents appear in "My Documents".'; supportChatHistory.push({ sender: 'support', text: reply, time: replyTime }); } saveAllData(); renderChatHistory(); }, 1500); }
  sendBtn.addEventListener('click', sendMessage); chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
  document.querySelectorAll('.inbox-item').forEach(item => { item.addEventListener('click', () => { document.querySelectorAll('.inbox-item').forEach(i => i.classList.remove('active')); item.classList.add('active'); currentChatTab = item.getAttribute('data-chat'); document.getElementById('citizenChatContactName').textContent = currentChatTab === 'admin' ? 'Local Administrator' : 'Support Assistant'; document.getElementById('chatHeaderIcon').className = currentChatTab === 'admin' ? 'fas fa-user-tie' : 'fas fa-headset'; renderChatHistory(); }); });

  // ==================== ANNOUNCEMENTS WITH IMAGES ====================
  const announcementsData = [
    { id: 1, category: 'event', catClass: 'cat-meeting', catLabel: 'Event', title: 'Community Meeting', date: 'June 25, 2026', content: 'Quarterly town hall meeting at the Community Hall.', fullContent: 'Quarterly town hall meeting at the Community Hall. All residents are invited to discuss development plans.', image: '' },
    { id: 2, category: 'notice', catClass: 'cat-notice', catLabel: 'Notice', title: 'New Business Guidelines', date: 'June 18, 2026', content: 'Updated business permit application guidelines.', fullContent: 'Updated business permit guidelines effective next month.', image: '' },
    { id: 3, category: 'alert', catClass: 'cat-emergency', catLabel: 'Alert', title: 'Weather Warning', date: 'June 14, 2026', content: 'Heavy rainfall expected from June 20-22.', fullContent: 'Take necessary precautions and avoid low-lying areas.', image: '' },
    { id: 4, category: 'event', catClass: 'cat-health', catLabel: 'Health', title: 'Free Health Screening', date: 'June 12, 2026', content: 'Free screening at Central Health Center.', fullContent: 'Free health screening this Saturday from 8 AM to 4 PM.', image: '' },
    { id: 5, category: 'notice', catClass: 'cat-development', catLabel: 'Development', title: 'New Library Construction', date: 'June 8, 2026', content: 'Construction of new public library begins.', fullContent: 'Expected completion December 2026.', image: '' },
  ];

  function renderAnnouncements() {
    const grid = document.getElementById('citizenAnnouncementGrid');
    grid.innerHTML = announcementsData.map(a => `
      <div class="announcement-card" data-category="${a.category}">
        ${getAnnouncementImageHTML(a.image, a.title)}
        <div class="announcement-body">
          <span class="cat-badge ${a.catClass}">${a.catLabel}</span>
          <h3>${a.title}</h3>
          <p class="announcement-date"><i class="far fa-calendar-alt"></i> ${a.date}</p>
          <p>${a.content}</p>
          <a class="read-more-link announce-read-btn" data-id="${a.id}">Read More <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    `).join('');
    grid.querySelectorAll('.announce-read-btn').forEach(btn => { btn.addEventListener('click', function() { openAnnouncement(parseInt(this.getAttribute('data-id'))); }); });
  }

  function openAnnouncement(id) {
    const a = announcementsData.find(x => x.id === id);
    if (!a) return;
    document.getElementById('announcementContent').innerHTML = `
      <button class="modal-close modal-close-btn" id="announceCloseBtn">&times;</button>
      ${getAnnouncementDetailImageHTML(a.image, a.title)}
      <span class="cat-badge ${a.catClass}">${a.catLabel}</span>
      <h2>${a.title}</h2>
      <p class="announcement-date"><i class="far fa-calendar-alt"></i> ${a.date}</p>
      <p style="margin-top:15px;line-height:1.8;">${a.fullContent}</p>
    `;
    const overlay = document.getElementById('announcementModalOverlay'), modal = document.getElementById('announcementModal');
    overlay.classList.add('active'); modal.classList.add('active');
    document.getElementById('announceCloseBtn').addEventListener('click', closeAnnouncementModal);
  }
  function closeAnnouncementModal() { document.getElementById('announcementModalOverlay').classList.remove('active'); document.getElementById('announcementModal').classList.remove('active'); }
  document.getElementById('announcementModalOverlay').addEventListener('click', function(e) { if (e.target === this) closeAnnouncementModal(); });
  document.querySelectorAll('.filter-btn').forEach(btn => { btn.addEventListener('click', () => { document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); const filter = btn.getAttribute('data-filter'); document.querySelectorAll('#citizenAnnouncementGrid .announcement-card').forEach(card => { card.style.display = (filter === 'all' || card.getAttribute('data-category') === filter) ? '' : 'none'; }); }); });

  // ==================== DOCUMENTS ====================
  function renderDocuments() { const tbody = document.getElementById('documentsTableBody'); if (documents.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No documents available. Make a payment to access documents.</td></tr>'; return; } tbody.innerHTML = documents.map(d => `<tr><td>${d.name}</td><td>#${d.id}</td><td>${d.type}</td><td>${d.issueDate}</td><td><span class="status-badge status-approved">${d.status}</span></td><td><button class="btn-sm dl-btn" data-id="${d.id}"><i class="fas fa-download"></i> Download</button><button class="btn-sm print-btn" data-id="${d.id}" style="margin-left:4px;"><i class="fas fa-print"></i></button><button class="btn-sm share-btn" data-id="${d.id}" style="margin-left:4px;"><i class="fas fa-share"></i></button></td></tr>`).join(''); tbody.querySelectorAll('.dl-btn').forEach(b => b.addEventListener('click', function() { showToast('success', 'Downloading document #' + this.getAttribute('data-id')); })); tbody.querySelectorAll('.print-btn').forEach(b => b.addEventListener('click', () => window.print())); tbody.querySelectorAll('.share-btn').forEach(b => b.addEventListener('click', function() { if (navigator.share) navigator.share({ title: 'LAMS Document', url: window.location.href }); else showToast('info', 'Share link copied!'); })); }

  // ==================== PROFILE ====================
  function updateProfileDisplay() { document.getElementById('profileAvatarImg').src = profile.photo; document.getElementById('profileDisplayName').textContent = profile.name; document.getElementById('profileName').textContent = profile.name; document.getElementById('profileEmail').textContent = profile.email; document.getElementById('profilePhone').textContent = profile.phone; document.getElementById('profileAddress').textContent = profile.address || 'Not set'; document.getElementById('sidebarCitizenName').textContent = profile.name; document.getElementById('sidebarAvatarImg').src = profile.photo; document.getElementById('headerUserName').textContent = profile.name.split(' ')[0]; }
  document.getElementById('openProfileEditBtn').addEventListener('click', openProfileEditModal);
  function openProfileEditModal() { document.getElementById('editProfileName').value = profile.name; document.getElementById('editProfileEmail').value = profile.email; document.getElementById('editProfilePhone').value = profile.phone; document.getElementById('editProfileAddress').value = profile.address || ''; document.getElementById('profileEditModalOverlay').classList.add('active'); document.getElementById('profileEditModal').classList.add('active'); }
  function closeProfileEditModal() { document.getElementById('profileEditModalOverlay').classList.remove('active'); document.getElementById('profileEditModal').classList.remove('active'); }
  document.getElementById('profileEditCloseBtn').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closeProfileEditModal(); });
  document.getElementById('profileEditModalOverlay').addEventListener('click', function(e) { if (e.target === this) closeProfileEditModal(); });
  document.getElementById('profileEditModalContent').addEventListener('click', function(e) { e.stopPropagation(); });
  document.getElementById('profileEditForm').addEventListener('submit', function(e) { e.preventDefault(); profile.name = document.getElementById('editProfileName').value; profile.email = document.getElementById('editProfileEmail').value; profile.phone = document.getElementById('editProfilePhone').value; profile.address = document.getElementById('editProfileAddress').value; saveAllData(); updateProfileDisplay(); updateDashboard(); closeProfileEditModal(); showToast('success', 'Profile updated!'); });
  document.getElementById('profilePhotoUpload').addEventListener('change', function(event) { const file = event.target.files[0]; if (!file) return; if (!file.type.startsWith('image/')) { showToast('error', 'Please select an image file'); return; } const reader = new FileReader(); reader.onload = function(e) { profile.photo = e.target.result; saveAllData(); updateProfileDisplay(); showToast('success', 'Profile photo updated!'); }; reader.readAsDataURL(file); });
  document.getElementById('openPasswordBtn').addEventListener('click', () => { document.getElementById('passwordModalOverlay').classList.add('active'); document.getElementById('passwordModal').classList.add('active'); });
  function closePasswordModal() { document.getElementById('passwordModalOverlay').classList.remove('active'); document.getElementById('passwordModal').classList.remove('active'); document.getElementById('passwordChangeForm').reset(); document.getElementById('passwordStrength').innerHTML = ''; }
  document.getElementById('passwordModalCloseBtn').addEventListener('click', closePasswordModal);
  document.getElementById('passwordModalOverlay').addEventListener('click', function(e) { if (e.target === this) closePasswordModal(); });
  document.getElementById('passwordModalContent').addEventListener('click', function(e) { e.stopPropagation(); });
  document.getElementById('passwordChangeForm').addEventListener('submit', function(e) { e.preventDefault(); const np = document.getElementById('newPassword').value, cp = document.getElementById('confirmPassword').value; if (np !== cp) { showToast('error', 'Passwords do not match'); return; } if (np.length < 6) { showToast('error', 'Minimum 6 characters'); return; } showToast('success', 'Password changed!'); closePasswordModal(); });
  document.getElementById('newPassword').addEventListener('input', function(e) { const v = e.target.value, d = document.getElementById('passwordStrength'); if (!v) { d.innerHTML = ''; return; } let s = 'Weak', c = '#ef4444'; if (v.length >= 8) { s = 'Medium'; c = '#f59e0b'; } if (v.length >= 10 && /[A-Z]/.test(v) && /[0-9]/.test(v)) { s = 'Strong'; c = '#00b894'; } d.innerHTML = `<small style="color:${c};">Password Strength: ${s}</small>`; });

  window.showFAQ = function() { showToast('info', 'FAQ: Apply via My Applications > New Application.\nPay via Payments > Pay Now.\nDownload via My Documents after payment.'); };

  citizenSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') { const t = citizenSearch.value.toLowerCase(); if (t.includes('app')) navigateToPage('applications'); else if (t.includes('pay')) navigateToPage('payments'); else if (t.includes('msg')) navigateToPage('messages'); else if (t.includes('doc')) navigateToPage('documents'); else if (t.includes('profile')) navigateToPage('profile'); else if (t.includes('announce')) navigateToPage('announcements'); else if (t.includes('help')) navigateToPage('help'); else showToast('info', 'Searching: ' + citizenSearch.value); } });

  function init() { updateProfileDisplay(); updateDashboard(); renderApplications(); renderPayments(); renderAnnouncements(); renderDocuments(); renderNotifications(); updateNotificationBadge(); updateSidebarBadges(); updateClock(); }
  init();
  console.log('👤 LAMS Citizen Portal v2.0 - Professional Payment Flow Ready');
});