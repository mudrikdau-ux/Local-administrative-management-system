// admin.js
document.addEventListener('DOMContentLoaded', () => {
  // ==================== STORAGE & DEFAULT DATA ====================
  const store = {
    citizens: JSON.parse(localStorage.getItem('lams_citizens')) || [
      { id:'C001', name:'Maria Joseph', email:'maria@email.com', phone:'+255 765 432 109', address:'Dar es Salaam', status:'Alive', regDate:'2026-01-15' },
      { id:'C002', name:'Peter Mwangi', email:'peter@email.com', phone:'+255 654 321 098', address:'Nairobi', status:'Alive', regDate:'2026-02-20' },
      { id:'C003', name:'John Doe', email:'john@email.com', phone:'+255 543 210 987', address:'Arusha', status:'Deceased', regDate:'2025-11-10' },
      { id:'C004', name:'Sarah Kimaro', email:'sarah@email.com', phone:'+255 432 109 876', address:'Moshi', status:'Alive', regDate:'2026-03-05' }
    ],
    documents: JSON.parse(localStorage.getItem('lams_documents')) || [
      { id:'DOC001', citizen:'Maria Joseph', type:'Residence Letter', date:'2026-06-10', payment:'Paid', status:'Ready', fileData: null, fileName: null, notes: '' },
      { id:'DOC002', citizen:'Peter Mwangi', type:'Business Letter', date:'2026-06-15', payment:'Unpaid', status:'Pending', fileData: null, fileName: null, notes: '' },
      { id:'DOC003', citizen:'Sarah Kimaro', type:'Confirmation Letter', date:'2026-06-12', payment:'Paid', status:'Sent', fileData: null, fileName: null, notes: '' }
    ],
    payments: JSON.parse(localStorage.getItem('lams_payments')) || [
      { id:'PAY001', citizen:'Maria Joseph', doc:'Residence Letter', amount:15000, method:'M-Pesa', date:'2026-06-10', status:'Paid' },
      { id:'PAY002', citizen:'Peter Mwangi', doc:'Business Letter', amount:25000, method:'Airtel Money', date:'2026-06-15', status:'Unpaid' },
      { id:'PAY003', citizen:'Sarah Kimaro', doc:'Confirmation Letter', amount:10000, method:'Tigo Pesa', date:'2026-06-12', status:'Paid' }
    ],
    announcements: JSON.parse(localStorage.getItem('lams_announcements')) || [
      { id:'ANN001', title:'Community Meeting', category:'Meeting', desc:'Discussing water project', date:'2026-06-25', status:'Published' },
      { id:'ANN002', title:'Health Campaign', category:'Health', desc:'Free checkup', date:'2026-06-20', status:'Draft' }
    ],
    messages: JSON.parse(localStorage.getItem('lams_messages')) || {
      'Maria Joseph': [{ sender:'Maria Joseph', text:'Hello Admin, I need assistance with my residence document.', time:'10:30 AM' }, { sender:'Admin', text:'Hello Maria! How can I help?', time:'10:35 AM' }],
      'Peter Mwangi': [{ sender:'Peter Mwangi', text:'Thank you for the update.', time:'09:15 AM' }]
    },
    notifications: JSON.parse(localStorage.getItem('lams_notifications')) || [
      { text:'New citizen registered: Maria Joseph', time:'10 minutes ago', unread:true },
      { text:'Document #DOC003 issued successfully', time:'25 minutes ago', unread:true }
    ],
    profile: JSON.parse(localStorage.getItem('lams_profile')) || { name:'Administrator', email:'admin@lams.go.tz', phone:'+255 123 456 789', avatar:'' },
    password: localStorage.getItem('lams_admin_password') || 'admin123'
  };

  function save(key) { localStorage.setItem(`lams_${key}`, JSON.stringify(store[key])); }
  function savePassword(pwd) { localStorage.setItem('lams_admin_password', pwd); }

  // ==================== DOM REFERENCES ====================
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

  // ==================== PAGE NAVIGATION ====================
  function navigateToPage(pageName) {
    document.querySelectorAll('.sidebar-link[data-page]').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-link[data-page="${pageName}"]`);
    if (activeLink) activeLink.classList.add('active');
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(`page-${pageName}`);
    if (page) page.classList.add('active');
    if (window.innerWidth <= 992) sidebar.classList.remove('active');
    if (pageName === 'dashboard') updateDashboardStats();
    if (pageName === 'reports') renderCharts();
    if (pageName === 'messages') renderInbox();
  }

  document.querySelectorAll('.sidebar-link[data-page]').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); navigateToPage(link.dataset.page); window.location.hash = link.dataset.page; });
  });
  document.querySelectorAll('[data-page]').forEach(el => {
    if (!el.classList.contains('sidebar-link')) el.addEventListener('click', () => navigateToPage(el.dataset.page));
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) navigateToPage(hash);
  });
  if (window.location.hash) navigateToPage(window.location.hash.replace('#', ''));
  else navigateToPage('dashboard');

  // ==================== SIDEBAR TOGGLE ====================
  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('active'));

  // ==================== THEME ====================
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') { body.classList.add('dark-mode'); themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; if(settingTheme) settingTheme.value = 'dark'; }
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if(settingTheme) settingTheme.value = isDark ? 'dark' : 'light';
  });
  if(settingTheme) settingTheme.addEventListener('change', () => {
    if(settingTheme.value === 'dark') { body.classList.add('dark-mode'); themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; }
    else { body.classList.remove('dark-mode'); themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; }
    localStorage.setItem('theme', settingTheme.value);
  });

  // ==================== NOTIFICATIONS ====================
  function renderNotifications() {
    notifListContainer.innerHTML = store.notifications.map(n => `<div class="notif-item ${n.unread ? 'unread' : ''}"><i class="fas fa-bell"></i><div><p>${n.text}</p><small>${n.time}</small></div></div>`).join('');
    const unreadCount = store.notifications.filter(n => n.unread).length;
    notifBadge.textContent = unreadCount || '0';
  }
  document.getElementById('notificationBtn').addEventListener('click', (e) => { e.stopPropagation(); notificationDropdown.classList.toggle('active'); });
  document.getElementById('markAllRead').addEventListener('click', () => { store.notifications.forEach(n => n.unread = false); save('notifications'); renderNotifications(); });
  document.addEventListener('click', (e) => { 
    if(!notificationDropdown.contains(e.target)) notificationDropdown.classList.remove('active'); 
    if(!profileDropdownMenu.contains(e.target) && e.target !== profileDropdownBtn) profileDropdownMenu.classList.remove('active');
    // Close any open action dropdowns
    document.querySelectorAll('.action-dropdown-menu.active').forEach(d => d.classList.remove('active'));
  });
  profileDropdownBtn.addEventListener('click', (e) => { e.stopPropagation(); profileDropdownMenu.classList.toggle('active'); });
  renderNotifications();

  // ==================== CLOCK ====================
  function updateClock() {
    const now = new Date();
    document.getElementById('liveDate').textContent = now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    document.getElementById('liveClock').textContent = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  }
  setInterval(updateClock, 1000); updateClock();

  // ==================== TOAST ====================
  function showToast(message, isError = false) {
    const toast = document.getElementById('successToast');
    const toastMsg = document.getElementById('toastMessage');
    toastMsg.textContent = message;
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // ==================== DASHBOARD STATS ====================
  function updateDashboardStats() {
    const stats = [
      { icon:'fa-users', label:'Total Citizens', value: store.citizens.length },
      { icon:'fa-file-alt', label:'Document Requests', value: store.documents.length },
      { icon:'fa-check-circle', label:'Documents Sent', value: store.documents.filter(d => d.status === 'Sent').length },
      { icon:'fa-clock', label:'Pending Requests', value: store.documents.filter(d => d.status === 'Pending' || d.status === 'Ready').length },
      { icon:'fa-money-bill-wave', label:'Paid Transactions', value: store.payments.filter(p => p.status === 'Paid').length },
      { icon:'fa-coins', label:'Total Revenue (TZS)', value: store.payments.reduce((sum,p) => sum + (p.status === 'Paid' ? p.amount : 0), 0).toLocaleString() },
      { icon:'fa-bullhorn', label:'Announcements', value: store.announcements.length },
      { icon:'fa-comments', label:'Messages', value: Object.values(store.messages).flat().filter(m => m.sender !== 'Admin').length }
    ];
    document.getElementById('dashboardStatsGrid').innerHTML = stats.map(s => `
      <div class="stat-card"><div class="stat-icon"><i class="fas ${s.icon}"></i></div><div class="stat-info"><span class="stat-number">${s.value}</span><span class="stat-label">${s.label}</span></div></div>
    `).join('');
    const activities = [];
    store.citizens.slice(-2).forEach(c => activities.push({ icon:'fa-user-plus', text:`Citizen added: ${c.name}`, time:'Recently' }));
    store.documents.slice(-1).forEach(d => activities.push({ icon:'fa-file-alt', text:`Document request: ${d.type}`, time:'Recently' }));
    document.getElementById('activityFeed').innerHTML = activities.map(a => `<div class="activity-item"><i class="fas ${a.icon}"></i><div><p>${a.text}</p><small>${a.time}</small></div></div>`).join('') || '<p>No recent activity</p>';
  }

  // ==================== CITIZENS ====================
  function renderCitizens() {
    const tbody = document.getElementById('citizenTableBody');
    tbody.innerHTML = store.citizens.map(c => `
      <tr>
        <td>#${c.id}</td><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td><td>${c.address}</td>
        <td><span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span></td><td>${c.regDate}</td>
        <td>
          <button class="btn-sm btn-edit" data-id="${c.id}">Edit</button>
          <button class="btn-sm btn-delete" data-id="${c.id}">Delete</button>
        </td>
      </tr>
    `).join('');
    document.querySelectorAll('#citizenTableBody .btn-edit').forEach(b => b.addEventListener('click', () => editCitizen(b.dataset.id)));
    document.querySelectorAll('#citizenTableBody .btn-delete').forEach(b => b.addEventListener('click', () => { if(confirm('Delete citizen?')) { store.citizens = store.citizens.filter(c => c.id !== b.dataset.id); save('citizens'); renderCitizens(); addNotification('Citizen deleted'); } }));
  }
  function editCitizen(id) {
    const c = store.citizens.find(c => c.id === id); if(!c) return;
    document.getElementById('citizenEditId').value = c.id;
    document.getElementById('cName').value = c.name;
    document.getElementById('cEmail').value = c.email;
    document.getElementById('cPhone').value = c.phone;
    document.getElementById('cAddress').value = c.address;
    document.getElementById('cStatus').value = c.status;
    document.getElementById('citizenModalTitle').textContent = 'Edit Citizen';
    openModal('citizenModalOverlay', 'citizenModal');
  }
  document.getElementById('addCitizenBtn').addEventListener('click', () => {
    document.getElementById('citizenForm').reset(); document.getElementById('citizenEditId').value = '';
    document.getElementById('citizenModalTitle').textContent = 'Add New Citizen';
    openModal('citizenModalOverlay', 'citizenModal');
  });
  document.getElementById('citizenForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('citizenEditId').value;
    const data = {
      id: editId || 'C' + (store.citizens.length + 1).toString().padStart(3,'0'),
      name: document.getElementById('cName').value,
      email: document.getElementById('cEmail').value,
      phone: document.getElementById('cPhone').value,
      address: document.getElementById('cAddress').value,
      status: document.getElementById('cStatus').value,
      regDate: editId ? store.citizens.find(c => c.id === editId)?.regDate : new Date().toISOString().split('T')[0]
    };
    if (editId) store.citizens = store.citizens.map(c => c.id === editId ? data : c);
    else store.citizens.push(data);
    save('citizens'); renderCitizens(); closeModal('citizenModalOverlay', 'citizenModal');
    addNotification(editId ? 'Citizen updated' : 'New citizen added');
  });
  document.getElementById('citizenSearch').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#citizenTableBody tr').forEach(row => row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none');
  });
  document.getElementById('citizenStatusFilter').addEventListener('change', (e) => {
    const val = e.target.value;
    document.querySelectorAll('#citizenTableBody tr').forEach(row => {
      if (val === 'all') row.style.display = '';
      else row.style.display = row.querySelector('.status-badge').textContent.trim() === val ? '' : 'none';
    });
  });
  renderCitizens();

  // ==================== DOCUMENTS (MODIFIED) ====================
  function renderDocuments() {
    const tbody = document.getElementById('docTableBody');
    tbody.innerHTML = store.documents.map(d => {
      const canSend = d.payment === 'Paid' && d.status !== 'Sent' && d.fileData;
      const waitingPayment = d.payment === 'Unpaid';
      return `
        <tr>
          <td>${d.citizen}</td><td>${d.type}</td><td>${d.date}</td>
          <td><span class="status-badge status-${d.payment.toLowerCase()}">${d.payment}</span></td>
          <td><span class="status-badge status-${d.status.toLowerCase()}">${d.status}</span></td>
          <td>
            <div class="action-dropdown-wrapper">
              <button class="btn-sm btn-action" data-doc-id="${d.id}" onclick="toggleActionDropdown(event, '${d.id}')">
                <i class="fas fa-ellipsis-v"></i> Action
              </button>
              <div class="action-dropdown-menu" id="actionMenu-${d.id}">
                <button onclick="viewDocumentRequest('${d.id}')"><i class="fas fa-eye"></i> View Request</button>
                <button onclick="openUploadModal('${d.id}')"><i class="fas fa-upload"></i> Upload Document</button>
                <button onclick="previewDocument('${d.id}')"><i class="fas fa-file-pdf"></i> Preview Document</button>
                <button onclick="sendDocument('${d.id}')" ${!canSend ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                  <i class="fas fa-paper-plane"></i> ${waitingPayment ? 'Waiting For Payment' : 'Send Document'}
                </button>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Global functions for document actions
  window.toggleActionDropdown = function(event, docId) {
    event.stopPropagation();
    document.querySelectorAll('.action-dropdown-menu.active').forEach(d => d.classList.remove('active'));
    const menu = document.getElementById('actionMenu-' + docId);
    if (menu) menu.classList.toggle('active');
  };

  window.viewDocumentRequest = function(docId) {
    const doc = store.documents.find(d => d.id === docId);
    if (!doc) return;
    alert(`Document Request Details:\n\nCitizen: ${doc.citizen}\nType: ${doc.type}\nDate: ${doc.date}\nPayment: ${doc.payment}\nStatus: ${doc.status}\nNotes: ${doc.notes || 'None'}`);
    document.querySelectorAll('.action-dropdown-menu.active').forEach(d => d.classList.remove('active'));
  };

  window.openUploadModal = function(docId) {
    const doc = store.documents.find(d => d.id === docId);
    if (!doc) return;
    document.getElementById('docUploadId').value = doc.id;
    document.getElementById('docUploadCitizen').value = doc.citizen;
    document.getElementById('docUploadType').value = doc.type;
    document.getElementById('docUploadNotes').value = doc.notes || '';
    document.getElementById('docUploadFile').value = '';
    openModal('docUploadModalOverlay', 'docUploadModal');
    document.querySelectorAll('.action-dropdown-menu.active').forEach(d => d.classList.remove('active'));
  };

  window.previewDocument = function(docId) {
    const doc = store.documents.find(d => d.id === docId);
    if (!doc) return;
    const previewContent = document.getElementById('docPreviewContent');
    if (doc.fileData) {
      if (doc.fileName && doc.fileName.match(/\.(jpg|jpeg|png)$/i)) {
        previewContent.innerHTML = `<img src="${doc.fileData}" alt="Document Preview" style="max-width:100%;max-height:400px;border-radius:8px;">`;
      } else if (doc.fileName && doc.fileName.match(/\.pdf$/i)) {
        previewContent.innerHTML = `<iframe src="${doc.fileData}" width="100%" height="400px" style="border-radius:8px;"></iframe>`;
      } else {
        previewContent.innerHTML = `<p>File: ${doc.fileName || 'Document'}</p><a href="${doc.fileData}" download="${doc.fileName}" class="btn btn-primary"><i class="fas fa-download"></i> Download</a>`;
      }
    } else {
      previewContent.innerHTML = '<p>No document uploaded yet.</p>';
    }
    openModal('docPreviewModalOverlay', 'docPreviewModal');
    document.querySelectorAll('.action-dropdown-menu.active').forEach(d => d.classList.remove('active'));
  };

  window.sendDocument = function(docId) {
    const doc = store.documents.find(d => d.id === docId);
    if (!doc) return;
    if (doc.payment !== 'Paid') {
      showToast('Cannot send: Payment is unpaid', true);
      return;
    }
    if (!doc.fileData) {
      showToast('Please upload a document first', true);
      return;
    }
    doc.status = 'Sent';
    save('documents');
    renderDocuments();
    addNotification(`Document ${doc.id} sent to ${doc.citizen}`);
    showToast('Document sent successfully!');
    document.querySelectorAll('.action-dropdown-menu.active').forEach(d => d.classList.remove('active'));
  };

  // Document Upload Form
  document.getElementById('docUploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const docId = document.getElementById('docUploadId').value;
    const doc = store.documents.find(d => d.id === docId);
    if (!doc) return;
    
    const fileInput = document.getElementById('docUploadFile');
    const file = fileInput.files[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        doc.fileData = ev.target.result;
        doc.fileName = file.name;
        doc.notes = document.getElementById('docUploadNotes').value;
        if (doc.status === 'Pending') doc.status = 'Ready';
        save('documents');
        renderDocuments();
        closeModal('docUploadModalOverlay', 'docUploadModal');
        showToast('Document uploaded successfully!');
        addNotification(`Document uploaded for ${doc.citizen}`);
      };
      reader.readAsDataURL(file);
    } else {
      doc.notes = document.getElementById('docUploadNotes').value;
      save('documents');
      closeModal('docUploadModalOverlay', 'docUploadModal');
      showToast('Notes saved');
    }
  });

  renderDocuments();

  // ==================== PAYMENTS ====================
  function renderPayments() {
    const tbody = document.getElementById('paymentTableBody');
    tbody.innerHTML = store.payments.map(p => `
      <tr>
        <td>#${p.id}</td><td>${p.citizen}</td><td>${p.doc}</td><td>${p.amount.toLocaleString()}</td>
        <td>${p.method}</td><td>${p.date}</td><td><span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span></td>
      </tr>
    `).join('');
    const totalRevenue = store.payments.filter(p=>p.status==='Paid').reduce((s,p)=>s+p.amount,0);
    document.getElementById('paymentStatsGrid').innerHTML = `
      <div class="stat-card"><div class="stat-icon" style="color:#00b894;"><i class="fas fa-coins"></i></div><div class="stat-info"><span class="stat-number">${totalRevenue.toLocaleString()}</span><span class="stat-label">Total Revenue (TZS)</span></div></div>
      <div class="stat-card"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><span class="stat-number">${store.payments.filter(p=>p.status==='Paid').length}</span><span class="stat-label">Paid</span></div></div>
      <div class="stat-card"><div class="stat-icon" style="color:#f59e0b;"><i class="fas fa-clock"></i></div><div class="stat-info"><span class="stat-number">${store.payments.filter(p=>p.status==='Unpaid').length}</span><span class="stat-label">Unpaid</span></div></div>
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
      else row.style.display = row.querySelector('.status-badge').textContent.trim() === val ? '' : 'none';
    });
  });
  renderPayments();

  // ==================== ANNOUNCEMENTS ====================
  function renderAnnouncements() {
    const tbody = document.getElementById('announcementTableBody');
    tbody.innerHTML = store.announcements.map(a => `
      <tr>
        <td>${a.title}</td><td><span class="cat-badge cat-${a.category.toLowerCase()}">${a.category}</span></td><td>${a.date}</td>
        <td><span class="status-badge status-${a.status.toLowerCase()}">${a.status}</span></td>
        <td>
          <button class="btn-sm btn-edit" data-id="${a.id}">Edit</button>
          <button class="btn-sm btn-delete" data-id="${a.id}">Delete</button>
          <button class="btn-sm btn-toggle" data-id="${a.id}">${a.status==='Published'?'Unpublish':'Publish'}</button>
        </td>
      </tr>
    `).join('');
    document.querySelectorAll('#announcementTableBody .btn-edit').forEach(b => b.addEventListener('click', () => editAnnouncement(b.dataset.id)));
    document.querySelectorAll('#announcementTableBody .btn-delete').forEach(b => b.addEventListener('click', () => { if(confirm('Delete?')) { store.announcements = store.announcements.filter(a => a.id !== b.dataset.id); save('announcements'); renderAnnouncements(); } }));
    document.querySelectorAll('.btn-toggle').forEach(b => b.addEventListener('click', () => {
      const a = store.announcements.find(a => a.id === b.dataset.id);
      if(a) { a.status = a.status === 'Published' ? 'Draft' : 'Published'; save('announcements'); renderAnnouncements(); addNotification(`Announcement ${a.status}`); }
    }));
  }
  function editAnnouncement(id) {
    const a = store.announcements.find(a => a.id === id); if(!a) return;
    document.getElementById('announcementEditId').value = a.id;
    document.getElementById('annTitle').value = a.title;
    document.getElementById('annCategory').value = a.category;
    document.getElementById('annDesc').value = a.desc;
    document.getElementById('announcementModalTitle').textContent = 'Edit Announcement';
    openModal('announcementModalOverlay', 'announcementModal');
  }
  document.getElementById('createAnnouncementBtn').addEventListener('click', () => {
    document.getElementById('announcementForm').reset(); document.getElementById('announcementEditId').value = '';
    document.getElementById('announcementModalTitle').textContent = 'Create Announcement';
    openModal('announcementModalOverlay', 'announcementModal');
  });
  document.getElementById('announcementForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('announcementEditId').value;
    const data = {
      id: editId || 'ANN' + (store.announcements.length + 1).toString().padStart(3,'0'),
      title: document.getElementById('annTitle').value,
      category: document.getElementById('annCategory').value,
      desc: document.getElementById('annDesc').value,
      date: new Date().toISOString().split('T')[0],
      status: 'Published'
    };
    if(editId) store.announcements = store.announcements.map(a => a.id === editId ? data : a);
    else store.announcements.push(data);
    save('announcements'); renderAnnouncements(); closeModal('announcementModalOverlay', 'announcementModal');
  });
  renderAnnouncements();

  // ==================== MESSAGES ====================
  function renderInbox() {
    const inbox = document.getElementById('messageInbox');
    const citizens = Object.keys(store.messages);
    inbox.innerHTML = citizens.map(c => `<div class="inbox-item" data-contact="${c}"><i class="fas fa-user-circle"></i><div><strong>${c}</strong><small>${store.messages[c].slice(-1)[0].text.substring(0,25)}...</small></div></div>`).join('');
    document.querySelectorAll('.inbox-item').forEach(item => item.addEventListener('click', () => {
      document.querySelectorAll('.inbox-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      openChat(item.dataset.contact);
    }));
  }
  function openChat(contact) {
    document.getElementById('chatContactName').textContent = contact;
    document.getElementById('chatOnlineStatus').innerHTML = '<i class="fas fa-circle"></i> Online';
    document.getElementById('adminChatInput').disabled = false;
    document.getElementById('adminSendBtn').disabled = false;
    const body = document.getElementById('adminChatBody');
    body.innerHTML = store.messages[contact].map(m => `
      <div class="msg ${m.sender === 'Admin' ? 'sent' : 'received'}"><div class="bubble">${m.text}</div><small>${m.time}</small></div>
    `).join('');
    body.scrollTop = body.scrollHeight;
  }
  document.getElementById('adminSendBtn').addEventListener('click', sendMessage);
  document.getElementById('adminChatInput').addEventListener('keypress', (e) => { if(e.key==='Enter') sendMessage(); });
  function sendMessage() {
    const input = document.getElementById('adminChatInput');
    const contact = document.getElementById('chatContactName').textContent;
    if(!input.value.trim() || contact === 'Select a conversation') return;
    const msg = { sender:'Admin', text:input.value.trim(), time:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
    store.messages[contact].push(msg);
    save('messages');
    const body = document.getElementById('adminChatBody');
    body.innerHTML += `<div class="msg sent"><div class="bubble">${msg.text}</div><small>${msg.time}</small></div>`;
    body.scrollTop = body.scrollHeight;
    input.value = '';
  }
  renderInbox();

  // ==================== REPORTS & CHARTS ====================
  function renderCharts() {
    setTimeout(() => {
      const ctx1 = document.getElementById('revenueChart')?.getContext('2d');
      const ctx2 = document.getElementById('citizenChart')?.getContext('2d');
      if(window.revenueChartInstance) window.revenueChartInstance.destroy();
      if(window.citizenChartInstance) window.citizenChartInstance.destroy();
      if(ctx1) window.revenueChartInstance = new Chart(ctx1, { type:'bar', data:{ labels:['Paid','Unpaid'], datasets:[{ label:'Payments', data:[store.payments.filter(p=>p.status==='Paid').length, store.payments.filter(p=>p.status==='Unpaid').length], backgroundColor:['#00b894','#f59e0b'] }] } });
      if(ctx2) window.citizenChartInstance = new Chart(ctx2, { type:'doughnut', data:{ labels:['Active','Inactive','Deceased'], datasets:[{ data:[store.citizens.filter(c=>c.status==='Alive').length, store.citizens.filter(c=>c.status==='Inactive').length, store.citizens.filter(c=>c.status==='Deceased').length], backgroundColor:['#00b894','#f59e0b','#ef4444'] }] } });
    }, 300);
  }

  // PDF Report Generation using jsPDF
  function generatePDFReport(title, tableData, statsSummary) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('LAMS', 14, 20);
    doc.setFontSize(10);
    doc.text('Local Administration Management System', 14, 28);
    
    // Title
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.text(title, 14, 45);
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 53);
    
    // Stats Summary
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary', 14, 65);
    doc.setFontSize(10);
    let yPos = 75;
    statsSummary.forEach(stat => {
      doc.text(`${stat.label}: ${stat.value}`, 14, yPos);
      yPos += 8;
    });
    
    // Table
    yPos += 10;
    doc.autoTable({
      startY: yPos,
      head: [tableData.headers],
      body: tableData.rows,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [0, 102, 204], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('LAMS Admin Panel - Official Report', 14, doc.internal.pageSize.height - 10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    }
    
    return doc;
  }

  function downloadPDF(doc, filename) {
    doc.save(filename);
  }

  function sharePDF(doc, filename) {
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });
    
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        title: filename,
        files: [file]
      }).then(() => {
        showToast('Report shared successfully!');
      }).catch((err) => {
        console.log('Share failed:', err);
        downloadPDF(doc, filename);
        showToast('Share not supported. Report downloaded instead.');
      });
    } else {
      // Fallback: create a temporary link for sharing
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Web Share not supported. Report downloaded.');
    }
  }

  // Citizens Report
  document.getElementById('genCitizenReport')?.addEventListener('click', () => {
    const statsSummary = [
      { label: 'Total Citizens', value: store.citizens.length },
      { label: 'Active Citizens', value: store.citizens.filter(c => c.status === 'Alive').length },
      { label: 'Inactive Citizens', value: store.citizens.filter(c => c.status === 'Inactive').length },
      { label: 'Deceased Citizens', value: store.citizens.filter(c => c.status === 'Deceased').length }
    ];
    const tableData = {
      headers: ['ID', 'Name', 'Email', 'Phone', 'Address', 'Status', 'Registration Date'],
      rows: store.citizens.map(c => [c.id, c.name, c.email, c.phone, c.address, c.status, c.regDate])
    };
    const doc = generatePDFReport('Citizens Report', tableData, statsSummary);
    downloadPDF(doc, 'LAMS_Citizens_Report.pdf');
    showToast('Citizens report generated successfully!');
  });

  // Payments Report
  document.getElementById('genPaymentReport')?.addEventListener('click', () => {
    const totalRevenue = store.payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
    const statsSummary = [
      { label: 'Total Transactions', value: store.payments.length },
      { label: 'Paid Transactions', value: store.payments.filter(p => p.status === 'Paid').length },
      { label: 'Unpaid Transactions', value: store.payments.filter(p => p.status === 'Unpaid').length },
      { label: 'Total Revenue (TZS)', value: totalRevenue.toLocaleString() }
    ];
    const tableData = {
      headers: ['Payment ID', 'Citizen', 'Document', 'Amount (TZS)', 'Method', 'Date', 'Status'],
      rows: store.payments.map(p => [p.id, p.citizen, p.doc, p.amount.toLocaleString(), p.method, p.date, p.status])
    };
    const doc = generatePDFReport('Payments Report', tableData, statsSummary);
    downloadPDF(doc, 'LAMS_Payments_Report.pdf');
    showToast('Payments report generated successfully!');
  });

  // Documents Report
  document.getElementById('genDocReport')?.addEventListener('click', () => {
    const statsSummary = [
      { label: 'Total Documents', value: store.documents.length },
      { label: 'Documents Sent', value: store.documents.filter(d => d.status === 'Sent').length },
      { label: 'Pending Documents', value: store.documents.filter(d => d.status === 'Pending').length },
      { label: 'Ready Documents', value: store.documents.filter(d => d.status === 'Ready').length }
    ];
    const tableData = {
      headers: ['ID', 'Citizen', 'Type', 'Date', 'Payment', 'Status'],
      rows: store.documents.map(d => [d.id, d.citizen, d.type, d.date, d.payment, d.status])
    };
    const doc = generatePDFReport('Documents Report', tableData, statsSummary);
    downloadPDF(doc, 'LAMS_Documents_Report.pdf');
    showToast('Documents report generated successfully!');
  });

  // Share Report Buttons
  document.querySelectorAll('.share-report-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const reportType = this.dataset.report;
      let doc, filename, statsSummary, tableData;
      
      switch(reportType) {
        case 'citizens':
          statsSummary = [
            { label: 'Total Citizens', value: store.citizens.length },
            { label: 'Active', value: store.citizens.filter(c => c.status === 'Alive').length }
          ];
          tableData = {
            headers: ['ID', 'Name', 'Email', 'Phone', 'Status'],
            rows: store.citizens.map(c => [c.id, c.name, c.email, c.phone, c.status])
          };
          filename = 'LAMS_Citizens_Report.pdf';
          break;
        case 'payments':
          const totalRevenue = store.payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
          statsSummary = [
            { label: 'Total Transactions', value: store.payments.length },
            { label: 'Total Revenue (TZS)', value: totalRevenue.toLocaleString() }
          ];
          tableData = {
            headers: ['ID', 'Citizen', 'Amount', 'Status'],
            rows: store.payments.map(p => [p.id, p.citizen, p.amount.toLocaleString(), p.status])
          };
          filename = 'LAMS_Payments_Report.pdf';
          break;
        case 'documents':
          statsSummary = [
            { label: 'Total Documents', value: store.documents.length },
            { label: 'Sent', value: store.documents.filter(d => d.status === 'Sent').length }
          ];
          tableData = {
            headers: ['ID', 'Citizen', 'Type', 'Payment', 'Status'],
            rows: store.documents.map(d => [d.id, d.citizen, d.type, d.payment, d.status])
          };
          filename = 'LAMS_Documents_Report.pdf';
          break;
      }
      
      doc = generatePDFReport(reportType.charAt(0).toUpperCase() + reportType.slice(1) + ' Report', tableData, statsSummary);
      sharePDF(doc, filename);
    });
  });

  // ==================== PROFILE ====================
  document.getElementById('editProfileBtn').addEventListener('click', () => {
    document.getElementById('pName').value = store.profile.name;
    document.getElementById('pEmail').value = store.profile.email;
    document.getElementById('pPhone').value = store.profile.phone;
    document.getElementById('pAvatarFile').value = '';
    openModal('profileModalOverlay', 'profileModal');
  });
  
  document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('pAvatarFile');
    const file = fileInput.files[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        store.profile = {
          name: document.getElementById('pName').value,
          email: document.getElementById('pEmail').value,
          phone: document.getElementById('pPhone').value,
          avatar: ev.target.result
        };
        save('profile');
        updateProfileUI();
        closeModal('profileModalOverlay', 'profileModal');
        showToast('Profile updated successfully!');
      };
      reader.readAsDataURL(file);
    } else {
      store.profile = {
        name: document.getElementById('pName').value,
        email: document.getElementById('pEmail').value,
        phone: document.getElementById('pPhone').value,
        avatar: store.profile.avatar
      };
      save('profile');
      updateProfileUI();
      closeModal('profileModalOverlay', 'profileModal');
      showToast('Profile updated successfully!');
    }
  });
  
  function updateProfileUI() {
    document.getElementById('profileDisplayName').textContent = store.profile.name;
    document.getElementById('profileEmail').textContent = store.profile.email;
    document.getElementById('profilePhone').textContent = store.profile.phone;
    const avatarPreview = document.getElementById('profileAvatarPreview');
    if (store.profile.avatar) {
      avatarPreview.src = store.profile.avatar;
    }
  }
  updateProfileUI();

  // ==================== CHANGE PASSWORD ====================
  document.getElementById('changePasswordBtn').addEventListener('click', () => {
    document.getElementById('passwordForm').reset();
    document.getElementById('passwordStrength').textContent = '';
    document.getElementById('passwordMatch').textContent = '';
    openModal('passwordModalOverlay', 'passwordModal');
  });

  document.getElementById('newPassword').addEventListener('input', function() {
    const pwd = this.value;
    const strengthEl = document.getElementById('passwordStrength');
    if (pwd.length < 6) {
      strengthEl.textContent = 'Weak - Minimum 6 characters';
      strengthEl.style.color = '#ef4444';
    } else if (pwd.length < 8) {
      strengthEl.textContent = 'Medium';
      strengthEl.style.color = '#f59e0b';
    } else if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/)) {
      strengthEl.textContent = 'Strong';
      strengthEl.style.color = '#00b894';
    } else {
      strengthEl.textContent = 'Medium - Add uppercase & numbers';
      strengthEl.style.color = '#f59e0b';
    }
  });

  document.getElementById('confirmPassword').addEventListener('input', function() {
    const matchEl = document.getElementById('passwordMatch');
    if (this.value === document.getElementById('newPassword').value) {
      matchEl.textContent = 'Passwords match';
      matchEl.style.color = '#00b894';
    } else {
      matchEl.textContent = 'Passwords do not match';
      matchEl.style.color = '#ef4444';
    }
  });

  document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const currentPwd = document.getElementById('currentPassword').value;
    const newPwd = document.getElementById('newPassword').value;
    const confirmPwd = document.getElementById('confirmPassword').value;

    // Validate current password
    if (currentPwd !== store.password) {
      showToast('Current password is incorrect', true);
      return;
    }

    // Validate new password
    if (newPwd.length < 6) {
      showToast('New password must be at least 6 characters', true);
      return;
    }

    // Check match
    if (newPwd !== confirmPwd) {
      showToast('Passwords do not match', true);
      return;
    }

    // Save
    store.password = newPwd;
    savePassword(newPwd);
    closeModal('passwordModalOverlay', 'passwordModal');
    showToast('Password changed successfully!');
    addNotification('Admin password updated');
  });

  // ==================== SETTINGS ====================
  document.getElementById('settingLanguage').addEventListener('change', (e) => alert(`Language set to ${e.target.value}`));

  // ==================== LOGOUT ====================
  function openLogoutModal() { openModal('logoutModalOverlay', 'logoutModal'); }
  document.getElementById('logoutSidebarLink').addEventListener('click', (e) => { e.preventDefault(); openLogoutModal(); });
  document.getElementById('logoutDropdownLink').addEventListener('click', (e) => { e.preventDefault(); openLogoutModal(); });
  document.getElementById('confirmLogoutBtn').addEventListener('click', () => { window.location.href = 'login.html'; });

  // ==================== UTILS ====================
  function openModal(overlayId, modalId) {
    document.getElementById(overlayId).classList.add('active');
    document.getElementById(modalId).classList.add('active');
  }
  function closeModal(overlayId, modalId) {
    document.getElementById(overlayId).classList.remove('active');
    document.getElementById(modalId).classList.remove('active');
  }
  document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', () => {
    o.classList.remove('active');
    document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  }));
  document.querySelectorAll('.modal-close-btn').forEach(b => b.addEventListener('click', () => {
    b.closest('.modal').classList.remove('active');
    document.querySelectorAll('.modal-overlay.active').forEach(o => o.classList.remove('active'));
  }));

  function addNotification(text) {
    store.notifications.unshift({ text, time:'Just now', unread:true });
    save('notifications'); renderNotifications();
  }

  // Back to top
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => { if(window.scrollY > 400) backToTop.classList.add('visible'); else backToTop.classList.remove('visible'); });
  backToTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  // Initial renders
  updateDashboardStats();
  renderCitizens();
  renderDocuments();
  renderPayments();
  renderAnnouncements();
  renderInbox();
  console.log('🏛️ LAMS Admin Panel fully upgraded and functional.');
});