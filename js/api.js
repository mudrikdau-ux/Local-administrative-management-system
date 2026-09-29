// ============================================================
// LAMS - Complete Frontend API Service Layer
// ============================================================
// Version: 3.0.8 - Fixed Profile Photo Caching & Enhanced Debug
// Connects to all backend endpoints for Citizen, Admin & Super Admin
// ============================================================

const API = (() => {
    'use strict';

    // ============================================================
    // 1. CONFIGURATION
    // ============================================================
    const CONFIG = {
        BASE_URL: localStorage.getItem('lams_api_url') || 'http://localhost:5000',
        API_URL: localStorage.getItem('lams_api_url') || 'http://localhost:5000/api',
        SOCKET_URL: localStorage.getItem('lams_socket_url') || 'http://localhost:5000',
        TIMEOUT: 30000,
        RETRY_COUNT: 1,
        RETRY_DELAY: 1000,
    };

    console.log('🔧 [API] Config loaded:', CONFIG);

    // ============================================================
    // 2. TOKEN & SESSION MANAGEMENT
    // ============================================================
    const TOKEN_KEY = 'lams_token';
    const USER_KEY = 'lams_user';
    const SESSION_KEY = 'lams_user_session';
    let _isClearingSession = false;

    const getToken = () => {
        const token = localStorage.getItem(TOKEN_KEY);
        console.log('🔑 [API] getToken:', token ? token.substring(0, 30) + '...' : 'null');
        return token;
    };
    
    const setToken = (token) => {
        console.log('🔑 [API] setToken:', token ? token.substring(0, 30) + '...' : 'null');
        localStorage.setItem(TOKEN_KEY, token);
    };
    
    const removeToken = () => {
        console.log('🔑 [API] removeToken called');
        localStorage.removeItem(TOKEN_KEY);
    };

    const getSession = () => {
        try { 
            const session = JSON.parse(localStorage.getItem(SESSION_KEY)); 
            console.log('👤 [API] getSession:', session ? session.role : 'null');
            return session; 
        } catch { 
            console.log('👤 [API] getSession: failed to parse');
            return null; 
        }
    };

    const setSession = (session) => {
        console.log('👤 [API] setSession:', session ? session.role : 'null');
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        if (session) localStorage.setItem(USER_KEY, JSON.stringify(session));
        localStorage.removeItem('lams_session_cleared');
    };

    const clearSession = () => {
        if (_isClearingSession) {
            console.log('⚠️ [API] clearSession: already clearing, skipping');
            return;
        }
        console.log('🔄 [API] clearSession: clearing session');
        _isClearingSession = true;
        try {
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(USER_KEY);
            removeToken();
            localStorage.setItem('lams_session_cleared', Date.now().toString());
            console.log('✅ [API] clearSession: session cleared');
        } catch (e) {
            console.error('❌ [API] clearSession error:', e);
        } finally {
            setTimeout(() => { 
                _isClearingSession = false; 
                console.log('✅ [API] clearSession: unlock');
            }, 100);
        }
    };

    const isAuthenticated = () => {
        const cleared = localStorage.getItem('lams_session_cleared');
        if (cleared && (Date.now() - parseInt(cleared) < 5000)) {
            console.log('🔒 [API] isAuthenticated: session was recently cleared (within 5s)');
            return false;
        }
        const token = getToken();
        const session = getSession();
        const result = !!token && !!session;
        console.log('🔒 [API] isAuthenticated:', result, 'token:', !!token, 'session:', !!session);
        return result;
    };

    const getUserRole = () => { 
        const s = getSession(); 
        const role = s?.role || null;
        console.log('👤 [API] getUserRole:', role);
        return role;
    };
    
    const getUser = () => { 
        try { 
            const user = JSON.parse(localStorage.getItem(USER_KEY)); 
            console.log('👤 [API] getUser:', user ? user.full_name : 'null');
            return user; 
        } catch { 
            return null; 
        }
    };

    const isOnLoginPage = () => {
        const path = window.location.pathname.toLowerCase();
        const result = path.includes('login.html') || path.includes('forgot-password.html') || path === '/' || path === '/index.html';
        console.log('📍 [API] isOnLoginPage:', result, 'path:', path);
        return result;
    };

    // ============================================================
    // 3. CORE FETCH WRAPPER
    // ============================================================
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    const buildHeaders = (contentType = 'application/json', extraHeaders = {}) => {
        const headers = { 'Accept': 'application/json', ...extraHeaders };
        if (contentType) headers['Content-Type'] = contentType;
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('📨 [API] buildHeaders: added Authorization header');
        } else {
            console.log('⚠️ [API] buildHeaders: NO token found');
        }
        return headers;
    };

    const handleResponse = async (response) => {
        console.log('📨 [API] handleResponse: status:', response.status);
        
        let data;
        try {
            const ct = response.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
                data = await response.json();
                console.log('📨 [API] handleResponse: JSON data received');
            } else if (ct.includes('text/plain')) {
                data = { message: await response.text() };
                console.log('📨 [API] handleResponse: text data received');
            } else if (ct.includes('pdf') || ct.includes('octet-stream') || ct.includes('image')) {
                console.log('📨 [API] handleResponse: binary data (file)');
                return response;
            } else {
                data = { message: 'Response received' };
                console.log('📨 [API] handleResponse: unknown content type');
            }
        } catch (e) { 
            console.log('📨 [API] handleResponse: parse error', e);
            data = { message: 'Failed to parse response' }; 
        }

        if (!response.ok) {
            console.log('❌ [API] handleResponse: error response', response.status, data);
            
            if (response.status === 401) {
                console.log('🔒 [API] handleResponse: 401 Unauthorized - clearing session');
                clearSession();
                window.dispatchEvent(new CustomEvent('lams:unauthorized', { 
                    detail: { message: 'Session expired. Please login again.' } 
                }));
                if (!isOnLoginPage()) {
                    console.log('🔀 [API] handleResponse: redirecting to login.html');
                    setTimeout(() => { 
                        console.log('🔀 [API] handleResponse: executing redirect');
                        window.location.href = 'login.html'; 
                    }, 500);
                } else {
                    console.log('📍 [API] handleResponse: already on login page, not redirecting');
                }
            }
            return { 
                success: false, 
                status: response.status, 
                message: data?.message || `Error ${response.status}`, 
                errors: data?.errors || null 
            };
        }

        console.log('✅ [API] handleResponse: success');
        return { 
            success: true, 
            status: response.status, 
            data: data?.data || data, 
            message: data?.message || 'Success', 
            meta: data?.pagination || data?.meta || null 
        };
    };

    const apiRequest = async (endpoint, method = 'GET', data = null, isFormData = false, retries = CONFIG.RETRY_COUNT) => {
        const url = `${CONFIG.API_URL}${endpoint}`;
        console.log(`📨 [API] apiRequest: ${method} ${url}`);
        
        const ct = isFormData ? null : 'application/json';
        const headers = buildHeaders(ct);
        const options = { 
            method, 
            headers, 
            signal: AbortSignal.timeout(CONFIG.TIMEOUT),
            cache: 'no-store' // ✅ FIX: Prevent caching
        };
        
        if (data && method !== 'GET') {
            options.body = isFormData ? data : JSON.stringify(data);
            console.log(`📨 [API] apiRequest: body size:`, options.body ? options.body.length : 0);
        }

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                if (attempt > 0) {
                    console.log(`🔄 [API] apiRequest: retry ${attempt}`);
                    await sleep(CONFIG.RETRY_DELAY * attempt);
                }
                const response = await fetch(url, options);
                return await handleResponse(response);
            } catch (error) {
                console.log(`❌ [API] apiRequest: error`, error.name, error.message);
                if (error.name === 'AbortError') {
                    return { success: false, message: 'Request timeout.', isTimeout: true };
                }
                if (attempt === retries) {
                    return { success: false, message: 'Network error. Server may be unreachable.', isNetworkError: true };
                }
            }
        }
    };

    // ============================================================
    // 4. HELPERS
    // ============================================================
    const qs = (p) => { 
        if (!p) return ''; 
        const sp = new URLSearchParams(); 
        Object.entries(p).forEach(([k,v]) => { 
            if (v !== undefined && v !== null && v !== '') sp.append(k, String(v)); 
        }); 
        const q = sp.toString(); 
        return q ? `?${q}` : ''; 
    };
    
    const paginated = (e, page, limit, filters = {}) => `${e}${qs({ page, limit, ...filters })}`;

    // ============================================================
    // 5. AUTH API (Super Admin / Admin / Citizen)
    // ============================================================
    const AuthAPI = {
        // Super Admin
        login: async (email, password) => {
            console.log('🔐 [AuthAPI] login:', email);
            const res = await apiRequest('/auth/login', 'POST', { email, password });
            return res;
        },
        verifyOTP: async (email, otp) => {
            console.log('🔐 [AuthAPI] verifyOTP:', email);
            const res = await apiRequest('/auth/login/verify-otp', 'POST', { email, otp });
            if (res.success && res.data?.token) { 
                console.log('✅ [AuthAPI] verifyOTP: token received, setting session');
                setToken(res.data.token); 
                setSession(res.data.user); 
            } else {
                console.log('❌ [AuthAPI] verifyOTP: failed', res.message);
            }
            return res;
        },
        logout: async () => {
            const role = getUserRole();
            console.log('🔐 [AuthAPI] logout:', role);
            let ep = '/auth/logout';
            if (role === 'admin') ep = '/admin-auth/logout';
            else if (role === 'citizen') ep = '/citizen/auth/logout';
            try { await apiRequest(ep, 'POST'); } catch (e) { console.log('⚠️ [AuthAPI] logout: error', e); } 
            clearSession();
            return { success: true, message: 'Logged out.' };
        },
        getProfile: async () => {
            const role = getUserRole();
            console.log('👤 [AuthAPI] getProfile:', role);
            // ✅ FIX: Add cache-busting
            const cacheBuster = `?_t=${Date.now()}`;
            if (role === 'admin') return apiRequest(`/admin-auth/profile${cacheBuster}`);
            if (role === 'citizen') return apiRequest(`/citizen/auth/profile${cacheBuster}`);
            return apiRequest(`/auth/profile${cacheBuster}`);
        },

        // Admin Auth
        adminLogin: async (email, password) => {
            console.log('🔐 [AuthAPI] adminLogin:', email);
            return apiRequest('/admin-auth/login', 'POST', { email, password });
        },
        adminVerifyOTP: async (email, otp) => {
            console.log('🔐 [AuthAPI] adminVerifyOTP:', email);
            const res = await apiRequest('/admin-auth/verify-otp', 'POST', { email, otp });
            if (res.success && res.data?.token) { 
                console.log('✅ [AuthAPI] adminVerifyOTP: token received');
                setToken(res.data.token); 
                setSession(res.data.admin || res.data.user); 
            }
            return res;
        },
        adminResendOTP: async (email) => {
            console.log('🔐 [AuthAPI] adminResendOTP:', email);
            return apiRequest('/admin-auth/resend-otp', 'POST', { email });
        },
        adminForgotPassword: async (email) => {
            console.log('🔐 [AuthAPI] adminForgotPassword:', email);
            return apiRequest('/admin-auth/forgot-password', 'POST', { email });
        },
        adminResetPassword: async (email, otp, newPassword) => {
            console.log('🔐 [AuthAPI] adminResetPassword:', email);
            return apiRequest('/admin-auth/reset-password', 'POST', { email, otp, new_password: newPassword });
        },

        // Citizen Auth
        citizenLogin: async (email, password) => {
            console.log('🔐 [AuthAPI] citizenLogin:', email);
            return apiRequest('/citizen/auth/login', 'POST', { email, password });
        },
        citizenVerifyOTP: async (email, otp) => {
            console.log('🔐 [AuthAPI] citizenVerifyOTP:', email);
            const res = await apiRequest('/citizen/auth/verify-otp', 'POST', { email, otp });
            if (res.success && res.data?.token) { 
                console.log('✅ [AuthAPI] citizenVerifyOTP: token received');
                setToken(res.data.token); 
                setSession(res.data.user); 
            }
            return res;
        },
        citizenResendOTP: async (email) => {
            console.log('🔐 [AuthAPI] citizenResendOTP:', email);
            return apiRequest('/citizen/auth/resend-otp', 'POST', { email });
        },
        citizenForgotPassword: async (email) => {
            console.log('🔐 [AuthAPI] citizenForgotPassword:', email);
            return apiRequest('/citizen/auth/forgot-password', 'POST', { email });
        },
        citizenVerifyResetOTP: async (email, otp) => {
            console.log('🔐 [AuthAPI] citizenVerifyResetOTP:', email);
            return apiRequest('/citizen/auth/verify-reset-otp', 'POST', { email, otp });
        },
        citizenResetPassword: async (email, otp, newPassword, confirmPassword) => {
            console.log('🔐 [AuthAPI] citizenResetPassword:', email);
            return apiRequest('/citizen/auth/reset-password', 'POST', { email, otp, new_password: newPassword, confirm_password: confirmPassword });
        },

        isAuthenticated, getUserRole, getSession, setSession, clearSession, getUser,
    };

    // ============================================================
    // 6. CITIZEN API
    // ============================================================
    const CitizenAPI = {
        getProfile: () => apiRequest(`/citizen/profile?_t=${Date.now()}`),
        updateProfile: (data) => apiRequest('/citizen/profile', 'PUT', data),
        updatePhoto: (fd) => apiRequest('/citizen/profile/photo', 'PUT', fd, true),
        changePassword: (cp, np, cf) => apiRequest('/citizen/profile/change-password', 'PUT', { current_password: cp, new_password: np, confirm_password: cf }),

        getApplications: (page = 1, limit = 10, filters = {}) => apiRequest(paginated('/citizen/applications', page, limit, filters)),
        createApplication: (data) => apiRequest('/citizen/applications', 'POST', data),
        getApplication: (id) => apiRequest(`/citizen/applications/${id}`),
        downloadDoc: (id) => apiRequest(`/citizen/applications/${id}/download`),

        getPayments: (page = 1, limit = 10, filters = {}) => apiRequest(paginated('/citizen/payments', page, limit, filters)),
        getPaymentSummary: () => apiRequest('/citizen/payments/summary'),
        getPaymentHistory: (page = 1, limit = 20) => apiRequest(paginated('/citizen/payments/history', page, limit)),
        makePayment: (paymentId, method, phone) => {
            const methodMap = {
                'mobile': 'mpesa', 'mpesa': 'mpesa',
                'tigo': 'tigo_pesa', 'tigo_pesa': 'tigo_pesa',
                'airtel': 'airtel_money', 'airtel_money': 'airtel_money',
                'bank': 'bank_transfer', 'bank_transfer': 'bank_transfer',
                'card': 'bank_transfer', 'cash': 'cash'
            };
            const validMethod = methodMap[method] || 'mpesa';
            return apiRequest('/citizen/payments/pay', 'POST', { 
                payment_id: paymentId, payment_method: validMethod, phone_number: phone 
            });
        },
        getReceipt: (id) => apiRequest(`/citizen/payments/${id}/receipt`),

        getDocuments: (page = 1, limit = 10, filters = {}) => apiRequest(paginated('/citizen/documents', page, limit, filters)),
        downloadDocument: (id) => apiRequest(`/citizen/documents/${id}/download`),
        printDocument: (id) => apiRequest(`/citizen/documents/${id}/print`),
        shareDocument: (id, email) => apiRequest(`/citizen/documents/${id}/share`, 'POST', { recipient_email: email }),

        getAnnouncements: (page = 1, limit = 10, filters = {}) => apiRequest(paginated('/citizen/announcements', page, limit, filters)),
        getAnnouncement: (id) => apiRequest(`/citizen/announcements/${id}`),

        getConversations: () => apiRequest('/citizen/messages/conversations'),
        searchConversations: (q) => apiRequest(`/citizen/messages/search?query=${encodeURIComponent(q)}`),
        getMessages: (convId, page = 1, limit = 50) => apiRequest(paginated(`/citizen/messages/conversation/${convId}`, page, limit)),
        sendMessage: (convId, message, type = 'text') => apiRequest('/citizen/messages/send', 'POST', { conversation_id: convId, message, message_type: type }),
        markRead: (convId) => apiRequest(`/citizen/messages/read/${convId}`, 'PATCH'),
        getUnreadCount: () => apiRequest('/citizen/messages/unread-count'),

        getDashboard: () => apiRequest('/citizen/dashboard'),
        getDashboardSummary: () => apiRequest('/citizen/dashboard/summary'),
        getRecentActivities: (limit = 10) => apiRequest(`/citizen/dashboard/recent-activities?limit=${limit}`),

        getNotifications: (limit = 10) => apiRequest(`/citizen/dashboard/notifications?limit=${limit}`),
        markNotifRead: (id) => apiRequest(`/citizen/dashboard/notifications/${id}/read`, 'PATCH'),
        markAllNotifsRead: () => apiRequest('/citizen/dashboard/notifications/read-all', 'PATCH'),

        contactAdmin: (subject, message) => apiRequest('/citizen/support/contact-admin', 'POST', { subject, message }),
        getFAQs: (category) => apiRequest(`/citizen/support/faqs${category ? '?category=' + encodeURIComponent(category) : ''}`),
        reportIssue: (title, desc, priority = 'medium') => apiRequest('/citizen/support/report-issue', 'POST', { issue_title: title, issue_description: desc, priority }),
        getGuides: (category) => apiRequest(`/citizen/support/guides${category ? '?category=' + encodeURIComponent(category) : ''}`),
    };

    // ============================================================
    // 7. ADMIN API
    // ============================================================
    const AdminAPI = {
        getProfile: () => apiRequest(`/admin/profile?_t=${Date.now()}`),
        updateProfile: (data) => apiRequest('/admin/profile', 'PUT', data),
        updatePhoto: (fd) => apiRequest('/admin/profile/photo', 'PUT', fd, true),
        removePhoto: () => apiRequest('/admin/profile/photo', 'DELETE'),
        changePassword: (cp, np, cf) => apiRequest('/admin/profile/change-password', 'PUT', { current_password: cp, new_password: np, confirm_new_password: cf }),
        getCitizens: (page = 1, limit = 10, filters = {}) => apiRequest(paginated('/admin/citizens', page, limit, filters)),
        getCitizen: (id) => apiRequest(`/admin/citizens/${id}`),
        createCitizen: (data) => apiRequest('/admin/citizens', 'POST', data),
        updateCitizen: (id, data) => apiRequest(`/admin/citizens/${id}`, 'PUT', data),
        deleteCitizen: (id) => apiRequest(`/admin/citizens/${id}`, 'DELETE'),
        resetCitizenPassword: (id) => apiRequest(`/admin/citizens/${id}/reset-password`, 'PUT'),
        getWardStats: () => apiRequest('/admin/citizens/stats'),
        getDocuments: (page = 1, limit = 10, filters = {}) => apiRequest(paginated('/admin/documents', page, limit, filters)),
        getDocument: (id) => apiRequest(`/admin/documents/${id}`),
        uploadDocument: (requestId, fd) => apiRequest(`/admin/documents/upload/${requestId}`, 'POST', fd, true),
        sendDocument: (requestId) => apiRequest(`/admin/documents/send/${requestId}`, 'POST'),
        previewDocument: (requestId) => apiRequest(`/admin/documents/preview/${requestId}`),
        downloadDocument: (requestId) => apiRequest(`/admin/documents/download/${requestId}`),
        getDocumentTypes: () => apiRequest('/admin/documents/types'),
        getDocumentStats: () => apiRequest('/admin/documents/stats'),
        cancelRequest: (requestId) => apiRequest(`/admin/documents/cancel/${requestId}`, 'PUT'),
        getPayments: (page = 1, limit = 10, filters = {}) => apiRequest(paginated('/admin/payments', page, limit, filters)),
        getPayment: (id) => apiRequest(`/admin/payments/${id}`),
        getPaymentSummary: () => apiRequest('/admin/payments/summary'),
        createPayment: (data) => apiRequest('/admin/payments', 'POST', data),
        updatePaymentStatus: (id, status) => apiRequest(`/admin/payments/${id}/status`, 'PUT', { payment_status: status }),
        getCitizenPayments: (cid) => apiRequest(`/admin/payments/citizen/${cid}`),
        getPaymentStats: () => apiRequest('/admin/payments/statistics'),
        getAnnouncements: (page = 1, limit = 10, filters = {}) => apiRequest(paginated('/admin/announcements', page, limit, filters)),
        getAnnouncement: (id) => apiRequest(`/admin/announcements/${id}`),
        createAnnouncement: (fd) => apiRequest('/admin/announcements', 'POST', fd, true),
        updateAnnouncement: (id, fd) => apiRequest(`/admin/announcements/${id}`, 'PUT', fd, true),
        deleteAnnouncement: (id) => apiRequest(`/admin/announcements/${id}`, 'DELETE'),
        publishAnnouncement: (id) => apiRequest(`/admin/announcements/${id}/publish`, 'PATCH'),
        unpublishAnnouncement: (id) => apiRequest(`/admin/announcements/${id}/unpublish`, 'PATCH'),
        getAnnouncementStats: () => apiRequest('/admin/announcements/stats'),
        getConversations: () => apiRequest('/admin/messages/conversations'),
        searchConversations: (q) => apiRequest(`/admin/messages/search?query=${encodeURIComponent(q)}`),
        getMessages: (citizenId, page = 1, limit = 50) => apiRequest(paginated(`/admin/messages/conversation/${citizenId}`, page, limit)),
        sendMessage: (receiverId, message, type = 'text') => apiRequest('/admin/messages/send', 'POST', { receiver_id: receiverId, message, message_type: type }),
        markRead: (convId) => apiRequest(`/admin/messages/read/${convId}`, 'PATCH'),
        getUnreadCount: () => apiRequest('/admin/messages/unread-count'),
        getDashboardSummary: () => apiRequest('/admin/reports/dashboard-summary'),
        getCitizensChart: () => apiRequest('/admin/reports/citizens-chart'),
        getPaymentsChart: () => apiRequest('/admin/reports/payments-chart'),
        getDocumentsChart: () => apiRequest('/admin/reports/documents-chart'),
        generateReport: (type, filters = {}) => apiRequest('/admin/reports/generate', 'POST', { report_type: type, filters }),
        downloadReport: (reportId) => apiRequest(`/admin/reports/download/${reportId}`),
        shareReport: (reportId, method, recipient) => apiRequest('/admin/reports/share', 'POST', { reportId, method, recipient }),
        getReportHistory: (page = 1, limit = 10, filters = {}) => apiRequest(paginated('/admin/reports/history', page, limit, filters)),
        getDashboard: () => apiRequest('/admin/dashboard'),
        getOverview: () => apiRequest('/admin/dashboard/overview'),
        getRecentActivities: (limit = 10) => apiRequest(`/admin/dashboard/recent-activities?limit=${limit}`),
        globalSearch: (q) => apiRequest(`/admin/dashboard/search?query=${encodeURIComponent(q)}`),
        getSettings: () => apiRequest('/admin/settings'),
        updateSettings: (data) => apiRequest('/admin/settings', 'PUT', data),
    };

    // ============================================================
    // 8. SUPER ADMIN API
    // ============================================================
    const SuperAdminAPI = {
        getDashboard: () => {
            console.log('📊 [SuperAdminAPI] getDashboard called');
            return apiRequest(`/super-admin/dashboard?_t=${Date.now()}`);
        },
        getStats: () => apiRequest(`/super-admin/dashboard/statistics?_t=${Date.now()}`),
        getAdmins: (page = 1, limit = 10, filters = {}) => apiRequest(paginated('/super-admin/users', page, limit, filters)),
        getAdmin: (id) => apiRequest(`/super-admin/users/${id}`),
        createAdmin: (fd) => apiRequest('/super-admin/admins', 'POST', fd, true),
        updateAdmin: (id, fd) => apiRequest(`/super-admin/users/${id}`, 'PUT', fd, true),
        deleteAdmin: (id) => apiRequest(`/super-admin/users/${id}`, 'DELETE'),
        suspendAdmin: (id) => apiRequest(`/super-admin/users/${id}/suspend`, 'PUT'),
        activateAdmin: (id) => apiRequest(`/super-admin/users/${id}/activate`, 'PUT'),
        resetAdminPassword: (id, newPassword) => apiRequest(`/super-admin/users/${id}/reset-password?_t=${Date.now()}`, 'PUT', { new_password: newPassword }),
        getSystemStats: () => apiRequest(`/super-admin/stats?_t=${Date.now()}`),
        getWards: () => apiRequest(`/super-admin/wards?_t=${Date.now()}`),
        addWard: (name) => apiRequest('/super-admin/wards', 'POST', { ward_name: name }),
        deleteWard: (id) => apiRequest(`/super-admin/wards/${id}`, 'DELETE'),
        getPositions: () => apiRequest(`/super-admin/positions?_t=${Date.now()}`),
        addPosition: (name) => apiRequest('/super-admin/positions', 'POST', { position_name: name }),
        deletePosition: (id) => apiRequest(`/super-admin/positions/${id}`, 'DELETE'),
        transferLeader: (data) => apiRequest('/super-admin/transfer', 'POST', data),
        getTransferHistory: () => apiRequest(`/super-admin/transfer/history?_t=${Date.now()}`),
        getAdminTransfers: (adminId) => apiRequest(`/super-admin/users/${adminId}/transfers`),
        extendTerm: (adminId, newEndDate, reason) => apiRequest(`/super-admin/users/${adminId}/extend-term`, 'PUT', { new_end_date: newEndDate, reason }),
        endTerm: (adminId, endDate, reason) => apiRequest(`/super-admin/users/${adminId}/end-term`, 'PUT', { end_date: endDate, reason }),
        getCitizens: (page = 1, limit = 10, filters = {}) => apiRequest(paginated('/super-admin/citizens', page, limit, filters)),
        getCitizen: (id) => apiRequest(`/super-admin/citizens/${id}`),
        searchCitizens: (q) => apiRequest(`/super-admin/citizens/search?q=${encodeURIComponent(q)}`),
        filterCitizens: (filters) => apiRequest(`/super-admin/citizens/filter?${qs(filters)}`),
        getCitizenStats: () => apiRequest(`/super-admin/citizens/statistics?_t=${Date.now()}`),
        getWardStats: () => apiRequest(`/super-admin/citizens/wards/statistics?_t=${Date.now()}`),
        getCitizensByWard: (wardId) => apiRequest(`/super-admin/citizens/wards/${wardId}`),
        getAuditLogs: (page = 1, limit = 20, filters = {}) => apiRequest(paginated('/super-admin/audit-logs', page, limit, filters)),
        getAuditLog: (id) => apiRequest(`/super-admin/audit-logs/${id}`),
        getAuditStats: () => apiRequest(`/super-admin/audit-logs/statistics?_t=${Date.now()}`),
        exportAuditCSV: (filters = {}) => apiRequest(`/super-admin/audit-logs/export/csv?${qs(filters)}&_t=${Date.now()}`),
        exportAuditPDF: (filters = {}) => apiRequest(`/super-admin/audit-logs/export/pdf?${qs(filters)}&_t=${Date.now()}`),
        getSecurityDashboard: () => apiRequest(`/super-admin/security/dashboard?_t=${Date.now()}`),
        getLoginActivity: (page = 1, limit = 20, filters = {}) => apiRequest(paginated('/super-admin/security/logins', page, limit, filters)),
        getLoginDetail: (id) => apiRequest(`/super-admin/security/logins/${id}`),
        searchAccount: (email) => apiRequest(`/super-admin/security/search-account?email=${encodeURIComponent(email)}`),
        lockAccount: (email) => apiRequest('/super-admin/security/lock-account', 'PUT', { email }),
        unlockAccount: (email) => apiRequest('/super-admin/security/unlock-account', 'PUT', { email }),
        getAlerts: (page = 1, limit = 20, filters = {}) => apiRequest(paginated('/super-admin/security/alerts', page, limit, filters)),
        markAlertRead: (id) => apiRequest(`/super-admin/security/alerts/${id}/read`, 'PUT'),
        forceLogout: (userId, email) => apiRequest('/super-admin/security/force-logout', 'POST', { user_id: userId, email }),
        getSecurityStats: () => apiRequest(`/super-admin/security/statistics?_t=${Date.now()}`),
        getReports: () => apiRequest(`/super-admin/reports/history?_t=${Date.now()}`),
        
        // Report generation
        generateCitizenReport: (filters = {}) => {
            console.log('📊 [SuperAdminAPI] generateCitizenReport called with filters:', filters);
            return apiRequest('/super-admin/reports/citizens', 'POST', filters);
        },
        generateAdminReport: (filters = {}) => {
            console.log('📊 [SuperAdminAPI] generateAdminReport called with filters:', filters);
            return apiRequest('/super-admin/reports/admins', 'POST', filters);
        },
        generateAuditReport: (filters = {}) => {
            console.log('📊 [SuperAdminAPI] generateAuditReport called with filters:', filters);
            return apiRequest('/super-admin/reports/audit', 'POST', filters);
        },
        generateFullReport: () => {
            console.log('📊 [SuperAdminAPI] generateFullReport called');
            return apiRequest('/super-admin/reports/full-system', 'POST');
        },
        
        // Report download
        downloadReport: (fileName) => {
            console.log('📊 [SuperAdminAPI] downloadReport called:', fileName);
            return apiRequest(`/super-admin/reports/download/${fileName}?_t=${Date.now()}`);
        },
        viewReport: (fileName) => {
            console.log('📊 [SuperAdminAPI] viewReport called:', fileName);
            return apiRequest(`/super-admin/reports/view/${fileName}?_t=${Date.now()}`);
        },
        deleteReport: (id) => {
            console.log('📊 [SuperAdminAPI] deleteReport called:', id);
            return apiRequest(`/super-admin/reports/history/${id}`, 'DELETE');
        },
        
        getNotifications: (page = 1, limit = 10) => apiRequest(paginated('/super-admin/notifications', page, limit)),
        getUnreadCount: () => apiRequest('/super-admin/notifications/unread-count'),
        markNotifRead: (id) => apiRequest(`/super-admin/notifications/${id}/read`, 'PUT'),
        markAllNotifsRead: () => apiRequest('/super-admin/notifications/read-all', 'PUT'),
        deleteNotif: (id) => apiRequest(`/super-admin/notifications/${id}`, 'DELETE'),
        clearAllNotifs: () => apiRequest('/super-admin/notifications/clear-all', 'DELETE'),
        getSettings: () => apiRequest('/super-admin/settings'),
        updateSettings: (data) => apiRequest('/super-admin/settings', 'PUT', data),
        updateTheme: (theme) => apiRequest('/super-admin/settings/theme', 'PUT', { theme }),
        updateLanguage: (language) => apiRequest('/super-admin/settings/language', 'PUT', { language }),
        updateNotifSettings: (data) => apiRequest('/super-admin/settings/notifications', 'PUT', data),
        getBackups: () => apiRequest('/super-admin/backups'),
        createBackup: () => apiRequest('/super-admin/backups/create', 'POST'),
        downloadBackup: (id) => apiRequest(`/super-admin/backups/download/${id}`),
        getSystemHealth: () => apiRequest('/system/health'),
        getProfile: () => {
            console.log('👤 [SuperAdminAPI] getProfile called');
            // ✅ FIX: Add cache-busting timestamp
            return apiRequest(`/super-admin/profile?_t=${Date.now()}`);
        },
        updateProfile: (data) => apiRequest('/super-admin/profile', 'PUT', data),
        updatePhoto: (fd) => {
            console.log('📸 [SuperAdminAPI] updatePhoto called');
            return apiRequest('/super-admin/profile/image?_t=' + Date.now(), 'PUT', fd, true);
        },
        removePhoto: () => apiRequest('/super-admin/profile/image', 'DELETE'),
        changePassword: (cp, np, cf) => apiRequest('/super-admin/profile/password', 'PUT', { current_password: cp, new_password: np, confirm_password: cf }),
        getRecentActivities: (limit = 10) => apiRequest(`/super-admin/dashboard/activities?limit=${limit}&_t=${Date.now()}`),
    };

    // ============================================================
    // 9. PUBLIC API (No Auth)
    // ============================================================
    const PublicAPI = {
        getHomeStats: () => apiRequest('/public/home/statistics'),
        getAboutStats: () => apiRequest('/public/about/statistics'),
        getAnnouncements: (page = 1, limit = 12, filters = {}) => apiRequest(paginated('/public/announcements', page, limit, filters)),
        getAnnouncement: (id) => apiRequest(`/public/announcements/${id}`),
        sendContact: (data) => apiRequest('/public/contact/send-message', 'POST', data),
        verifyDocument: (code) => apiRequest(`/public/verify-document/${code}`),
    };

    // ============================================================
    // 10. SOCKET.IO
    // ============================================================
    let socket = null;
    let listeners = [];

    const SocketAPI = {
        init: (token) => {
            const t = token || getToken();
            if (!t || typeof io === 'undefined') return null;
            if (socket?.connected) return socket;
            socket = io(CONFIG.SOCKET_URL, { auth: { token: t }, transports: ['websocket', 'polling'] });
            socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
            socket.on('disconnect', () => console.log('[Socket] Disconnected'));
            return socket;
        },
        getSocket: () => socket,
        isConnected: () => socket?.connected,
        join: (room) => { if (socket?.connected) socket.emit('join_room', room); },
        send: (receiverId, message, type = 'text') => { if (socket?.connected) { socket.emit('send_message', { receiver_id: receiverId, message, message_type: type }); return true; } return false; },
        typing: (convId, receiverId) => { if (socket?.connected) socket.emit('typing', { conversation_id: convId, receiver_id: receiverId }); },
        stopTyping: (convId, receiverId) => { if (socket?.connected) socket.emit('stop_typing', { conversation_id: convId, receiver_id: receiverId }); },
        markRead: (convId) => { if (socket?.connected) socket.emit('mark_read', { conversation_id: convId }); },
        on: (event, cb) => { if (socket) { socket.on(event, cb); listeners.push({ event, cb }); } },
        off: (event, cb) => { if (socket) { socket.off(event, cb); listeners = listeners.filter(l => !(l.event === event && l.cb === cb)); } },
        removeAll: () => { if (socket) { listeners.forEach(l => socket.off(l.event, l.cb)); listeners = []; } },
        disconnect: () => { if (socket) { socket.removeAllListeners(); socket.disconnect(); socket = null; listeners = []; } },
    };

    // ============================================================
    // 11. EXPORT
    // ============================================================
    console.log('✅ [API] API initialized successfully');
    console.log('📊 [API] API_URL:', CONFIG.API_URL);
    console.log('📊 [API] BASE_URL:', CONFIG.BASE_URL);
    
    return {
        CONFIG,
        getToken, setToken, removeToken,
        getSession, setSession, clearSession,
        isAuthenticated, getUserRole, getUser,
        apiRequest, qs, paginated,
        auth: AuthAPI,
        citizen: CitizenAPI,
        admin: AdminAPI,
        superAdmin: SuperAdminAPI,
        public: PublicAPI,
        socket: SocketAPI,
    };
})();

// Global exposure
if (typeof window !== 'undefined') {
    window.API = API;
    console.log('🌐 [API] Exposed to window.API');
}
if (typeof module !== 'undefined' && module.exports) module.exports = API;