// login.js - LAMS Login System (Connected to Backend via api.js)
document.addEventListener('DOMContentLoaded', () => {

  // ==================== DOM REFERENCES ====================
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const languageToggle = document.getElementById('languageToggle');
  const langText = document.querySelector('.lang-text');
  
  const stepLogin = document.getElementById('stepLogin');
  const stepOTP = document.getElementById('stepOTP');
  const stepSuccess = document.getElementById('stepSuccess');
  
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const togglePassword = document.getElementById('togglePassword');
  const loginBtn = document.getElementById('loginBtn');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  
  const roleTabs = document.querySelectorAll('.role-tab');
  
  const otpForm = document.getElementById('otpForm');
  const otpInputs = document.querySelectorAll('.otp-input');
  const otpError = document.getElementById('otpError');
  const timerDisplay = document.getElementById('timerDisplay');
  const otpTimer = document.getElementById('otpTimer');
  const resendOtpBtn = document.getElementById('resendOtpBtn');
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const otpEmailDisplay = document.getElementById('otpEmailDisplay');
  
  const successMessage = document.getElementById('successMessage');
  const redirectMessage = document.getElementById('redirectMessage');
  
  const toastContainer = document.getElementById('toastContainer');
  
  const forgotPasswordModalOverlay = document.getElementById('forgotPasswordModalOverlay');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const forgotPasswordModalContent = document.getElementById('forgotPasswordModalContent');
  
  document.getElementById('year').textContent = new Date().getFullYear();

  // ==================== STATE ====================
  let selectedRole = 'citizen';
  let loginEmailValue = '';
  let timerInterval = null;
  let timerSeconds = 60;
  let isSubmitting = false;

  // ==================== CHECK IF API LOADED ====================
  if (!window.API) {
    showToast('error', 'System initialization error. Please refresh the page.');
    console.error('❌ api.js not loaded!');
    return;
  }

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

  // ==================== AUTO REDIRECT IF LOGGED IN (FIXED) ====================
  // 🔑 NEW: If session was cleared recently, don't auto-redirect
  if (wasSessionCleared()) {
    console.log('🔑 Session was recently cleared, staying on login page');
    localStorage.removeItem('lams_session_cleared');
  } 
  else if (window.API.isAuthenticated() && !isOnLoginPage()) {
    const session = window.API.getSession();
    if (session && session.role) {
      redirectToDashboard(session.role);
      return;
    }
  }

  // If authenticated but on login page, clear any stale session to start fresh
  if (window.API.isAuthenticated() && isOnLoginPage()) {
    const session = window.API.getSession();
    if (session && session._redirected) {
      window.API.clearSession();
    }
  }

  // ==================== DARK/LIGHT MODE ====================
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // ==================== LANGUAGE TOGGLE ====================
  let isEnglish = true;
  
  function updateUILanguage() {
    if (isEnglish) {
      document.querySelector('.form-header h2').textContent = 'Welcome Back';
      document.querySelector('.form-header p').textContent = 'Sign in to access your account';
      const sa = document.querySelector('.role-tab[data-role="super_admin"]');
      const ad = document.querySelector('.role-tab[data-role="admin"]');
      const ci = document.querySelector('.role-tab[data-role="citizen"]');
      if (sa) sa.innerHTML = '<i class="fas fa-crown"></i> Super Admin';
      if (ad) ad.innerHTML = '<i class="fas fa-user-tie"></i> Admin';
      if (ci) ci.innerHTML = '<i class="fas fa-user"></i> Citizen';
      loginEmail.placeholder = 'Enter your email address';
      loginPassword.placeholder = 'Enter your password';
      loginBtn.querySelector('.btn-text').textContent = 'Sign In';
      forgotPasswordLink.textContent = 'Forgot Password?';
      document.querySelector('.remember-me span').textContent = 'Remember me';
      document.querySelector('.visual-content h1').textContent = 'Local Administration Management System';
      document.querySelector('.visual-subtitle').textContent = 'Secure digital platform for efficient local government services and community management.';
      document.querySelector('.features-title').textContent = 'Why Our Authentication System?';
      const otpH = document.querySelector('#stepOTP .form-header h2');
      const otpS = document.querySelector('#stepOTP .form-header p');
      if (otpH) otpH.textContent = 'Verify OTP Code';
      if (otpS) otpS.textContent = 'A 6-digit verification code has been sent to your email';
      verifyOtpBtn.querySelector('.btn-text').textContent = 'Verify OTP';
      if (resendOtpBtn) resendOtpBtn.innerHTML = '<i class="fas fa-redo"></i> Resend Code';
      if (backToLoginBtn) backToLoginBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Login';
    } else {
      document.querySelector('.form-header h2').textContent = 'Karibu Tena';
      document.querySelector('.form-header p').textContent = 'Ingia kufikia akaunti yako';
      const sa = document.querySelector('.role-tab[data-role="super_admin"]');
      const ad = document.querySelector('.role-tab[data-role="admin"]');
      const ci = document.querySelector('.role-tab[data-role="citizen"]');
      if (sa) sa.innerHTML = '<i class="fas fa-crown"></i> Msimamizi Mkuu';
      if (ad) ad.innerHTML = '<i class="fas fa-user-tie"></i> Afisa';
      if (ci) ci.innerHTML = '<i class="fas fa-user"></i> Mwananchi';
      loginEmail.placeholder = 'Weka anwani yako ya barua pepe';
      loginPassword.placeholder = 'Weka nenosiri lako';
      loginBtn.querySelector('.btn-text').textContent = 'Ingia';
      forgotPasswordLink.textContent = 'Umesahau Nenosiri?';
      document.querySelector('.remember-me span').textContent = 'Nikumbuke';
      document.querySelector('.visual-content h1').textContent = 'Mfumo wa Usimamizi wa Utawala wa Mitaa';
      document.querySelector('.visual-subtitle').textContent = 'Jukwaa salama la kidijitali kwa huduma bora za serikali za mitaa na usimamizi wa jamii.';
      document.querySelector('.features-title').textContent = 'Kwa Nini Mfumo Wetu wa Uthibitishaji?';
      const otpH = document.querySelector('#stepOTP .form-header h2');
      const otpS = document.querySelector('#stepOTP .form-header p');
      if (otpH) otpH.textContent = 'Thibitisha Nambari ya OTP';
      if (otpS) otpS.textContent = 'Nambari ya uthibitishaji ya tarakimu 6 imetumwa kwa barua pepe yako';
      verifyOtpBtn.querySelector('.btn-text').textContent = 'Thibitisha OTP';
      if (resendOtpBtn) resendOtpBtn.innerHTML = '<i class="fas fa-redo"></i> Tuma Tena';
      if (backToLoginBtn) backToLoginBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Rudi Kwenye Ingia';
    }
  }
  languageToggle.addEventListener('click', () => {
    isEnglish = !isEnglish;
    langText.textContent = isEnglish ? 'EN' : 'SW';
    updateUILanguage();
  });

  // ==================== TOAST ====================
  function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '<i class="fas fa-check-circle"></i>', error: '<i class="fas fa-times-circle"></i>', info: '<i class="fas fa-info-circle"></i>', warning: '<i class="fas fa-exclamation-triangle"></i>' };
    toast.innerHTML = `${icons[type] || icons.info} ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 4000);
  }

  // ==================== ROLE TABS ====================
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedRole = tab.getAttribute('data-role');
      const placeholders = { super_admin: 'superadmin@lams.go.tz', admin: 'admin@lams.go.tz', citizen: 'citizen@lams.go.tz' };
      loginEmail.placeholder = placeholders[selectedRole] || 'Enter your email';
      loginEmail.focus();
    });
  });

  // ==================== FORGOT PASSWORD (ROLE-BASED) ====================
  forgotPasswordLink.addEventListener('click', function(e) {
    e.preventDefault();
    if (selectedRole === 'citizen') {
      window.location.href = 'forgot-password.html';
      return;
    }
    const isSuperAdmin = selectedRole === 'super_admin';
    forgotPasswordModalContent.innerHTML = `
      <div class="modal-icon ${isSuperAdmin ? 'danger' : 'warning'}"><i class="fas ${isSuperAdmin ? 'fa-shield-alt' : 'fa-exclamation-triangle'}"></i></div>
      <h2>${isSuperAdmin ? 'Super Admin Password' : 'Admin Password Reset'}</h2>
      <p>${isSuperAdmin ? 'Super Admin accounts are managed directly at the database level. Please contact the Database Administrator (System Controller) for password assistance.' : 'Password reset for Admin accounts is managed by the Super Administrator. Please contact your Super Admin for assistance.'}</p>
      <button class="btn btn-primary" onclick="document.getElementById('forgotPasswordModalOverlay').classList.remove('active')"><i class="fas fa-check"></i> OK</button>
    `;
    forgotPasswordModalOverlay.classList.add('active');
  });
  forgotPasswordModalOverlay.addEventListener('click', function(e) { if (e.target === forgotPasswordModalOverlay) forgotPasswordModalOverlay.classList.remove('active'); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && forgotPasswordModalOverlay.classList.contains('active')) forgotPasswordModalOverlay.classList.remove('active'); });

  // ==================== PASSWORD TOGGLE ====================
  togglePassword.addEventListener('click', () => {
    const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    loginPassword.setAttribute('type', type);
    togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
  });

  // ==================== SET BUTTON LOADING ====================
  function setBtnLoading(btn, loading) {
    btn.disabled = loading;
    btn.querySelector('.btn-text').style.display = loading ? 'none' : '';
    btn.querySelector('.btn-loader').style.display = loading ? 'flex' : 'none';
  }

  // ==================== LOGIN FORM SUBMISSION ====================
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    emailError.textContent = '';
    passwordError.textContent = '';

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    let valid = true;

    if (!email) { emailError.textContent = 'Email address is required'; valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { emailError.textContent = 'Please enter a valid email address'; valid = false; }
    if (!password) { passwordError.textContent = 'Password is required'; valid = false; }
    else if (password.length < 6) { passwordError.textContent = 'Password must be at least 6 characters'; valid = false; }
    if (!valid) return;

    isSubmitting = true;
    setBtnLoading(loginBtn, true);

    try {
      let response;
      if (selectedRole === 'citizen') {
        response = await window.API.auth.citizenLogin(email, password);
      } else if (selectedRole === 'admin') {
        response = await window.API.auth.adminLogin(email, password);
      } else {
        response = await window.API.auth.login(email, password);
      }

      if (response.success) {
        loginEmailValue = email;
        showToast('success', 'Credentials verified! Please enter OTP.');
        switchToOTPStep(email);
      } else {
        showToast('error', response.message || 'Login failed. Please try again.');
        if (response.errors) {
          const firstError = response.errors[0];
          if (firstError.param === 'email') emailError.textContent = firstError.msg;
          else if (firstError.param === 'password') passwordError.textContent = firstError.msg;
        }
      }
    } catch (error) {
      showToast('error', 'Network error. Please check your connection.');
      console.error('Login error:', error);
    } finally {
      isSubmitting = false;
      setBtnLoading(loginBtn, false);
    }
  });

  // ==================== SWITCH TO OTP STEP ====================
  function switchToOTPStep(email) {
    stepLogin.classList.remove('active');
    stepOTP.classList.add('active');
    otpEmailDisplay.textContent = email;
    otpInputs.forEach(input => input.value = '');
    otpInputs[0].focus();
    otpError.textContent = '';
    startOTPTimer();
  }

  // ==================== OTP INPUT HANDLING ====================
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      if (!/^\d$/.test(e.target.value)) { input.value = ''; return; }
      if (e.target.value && index < 5) otpInputs[index + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) otpInputs[index - 1].focus();
      if (e.key === 'Enter') otpForm.dispatchEvent(new Event('submit'));
    });
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste = e.clipboardData.getData('text').trim();
      if (/^\d{6}$/.test(paste)) {
        paste.split('').forEach((d, i) => { if (otpInputs[i]) otpInputs[i].value = d; });
        otpInputs[5].focus();
      }
    });
  });

  // ==================== OTP TIMER ====================
  function startOTPTimer() {
    clearInterval(timerInterval);
    timerSeconds = 60;
    updateTimerDisplay();
    resendOtpBtn.disabled = true;
    otpTimer.classList.remove('expired');
    timerInterval = setInterval(() => {
      timerSeconds--;
      updateTimerDisplay();
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        otpTimer.classList.add('expired');
        resendOtpBtn.disabled = false;
        timerDisplay.textContent = '00:00';
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // ==================== RESEND OTP ====================
  resendOtpBtn.addEventListener('click', async () => {
    if (timerSeconds > 0 || isSubmitting) return;
    isSubmitting = true;
    resendOtpBtn.disabled = true;
    try {
      let response;
      if (selectedRole === 'citizen') {
        response = await window.API.auth.citizenResendOTP(loginEmailValue);
      } else if (selectedRole === 'admin') {
        response = await window.API.auth.adminResendOTP(loginEmailValue);
      } else {
        response = await window.API.auth.resendOTP(loginEmailValue, selectedRole);
      }
      if (response.success) {
        showToast('info', 'New OTP sent to your email.');
        otpInputs.forEach(i => i.value = '');
        otpInputs[0].focus();
        otpError.textContent = '';
        startOTPTimer();
      } else {
        showToast('error', response.message || 'Failed to resend OTP.');
        resendOtpBtn.disabled = false;
      }
    } catch (error) {
      showToast('error', 'Network error.');
      resendOtpBtn.disabled = false;
    } finally {
      isSubmitting = false;
    }
  });

  // ==================== BACK TO LOGIN ====================
  backToLoginBtn.addEventListener('click', () => {
    stepOTP.classList.remove('active');
    stepLogin.classList.add('active');
    clearInterval(timerInterval);
    otpInputs.forEach(i => i.value = '');
    otpError.textContent = '';
  });

  // ==================== OTP VERIFICATION ====================
  otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (timerSeconds <= 0) {
      otpError.textContent = 'OTP has expired. Please request a new one.';
      showToast('error', 'OTP expired!');
      return;
    }

    const enteredOTP = Array.from(otpInputs).map(i => i.value).join('');
    if (enteredOTP.length !== 6) {
      otpError.textContent = 'Please enter all 6 digits';
      return;
    }

    isSubmitting = true;
    setBtnLoading(verifyOtpBtn, true);

    try {
      let response;
      if (selectedRole === 'citizen') {
        response = await window.API.auth.citizenVerifyOTP(loginEmailValue, enteredOTP);
      } else if (selectedRole === 'admin') {
        response = await window.API.auth.adminVerifyOTP(loginEmailValue, enteredOTP);
      } else {
        response = await window.API.auth.verifyOTP(loginEmailValue, enteredOTP);
      }

      if (response.success) {
        otpError.textContent = '';
        clearInterval(timerInterval);
        showToast('success', 'OTP verified successfully!');
        switchToSuccessStep();
      } else {
        otpError.textContent = response.message || 'Incorrect OTP. Please try again.';
        showToast('error', response.message || 'Invalid OTP code!');
        otpInputs.forEach(i => i.value = '');
        otpInputs[0].focus();
      }
    } catch (error) {
      showToast('error', 'Network error.');
      console.error('OTP error:', error);
    } finally {
      isSubmitting = false;
      setBtnLoading(verifyOtpBtn, false);
    }
  });

  // ==================== SUCCESS & REDIRECT ====================
  function switchToSuccessStep() {
    stepOTP.classList.remove('active');
    stepSuccess.classList.add('active');

    const messages = {
      super_admin: { success: 'Super Admin Access Granted!', redirect: 'Redirecting to Super Admin Dashboard...', url: 'superadmin.html' },
      admin: { success: 'Admin Access Granted!', redirect: 'Redirecting to Admin Dashboard...', url: 'admin.html' },
      citizen: { success: 'Login Successful!', redirect: 'Redirecting to Citizen Portal...', url: 'citizen.html' }
    };
    const msg = messages[selectedRole] || messages.citizen;
    successMessage.textContent = msg.success;
    redirectMessage.textContent = msg.redirect;

    setTimeout(() => { window.location.href = msg.url; }, 2000);
  }

  function redirectToDashboard(role) {
    const urls = { super_admin: 'superadmin.html', admin: 'admin.html', citizen: 'citizen.html' };
    window.location.href = urls[role] || 'index.html';
  }

  // ==================== INITIALIZATION ====================
  const defaultTab = document.querySelector('.role-tab[data-role="citizen"]');
  if (defaultTab) {
    roleTabs.forEach(t => t.classList.remove('active'));
    defaultTab.classList.add('active');
    selectedRole = 'citizen';
    loginEmail.placeholder = 'citizen@lams.go.tz';
  }
  setTimeout(() => loginEmail.focus(), 500);

  console.log('🔐 LAMS Login System - Connected to Backend via api.js');
  console.log('👑 Super Admin: superadmin@lams.go.tz');
  console.log('👔 Admin: admin@lams.go.tz');
  console.log('👤 Citizen: citizen@lams.go.tz');
});