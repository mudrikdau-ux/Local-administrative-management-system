// login.js - LAMS Login with Role-Based Forgot Password Logic
document.addEventListener('DOMContentLoaded', () => {

  // ==================== DOM REFERENCES ====================
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const languageToggle = document.getElementById('languageToggle');
  const langText = document.querySelector('.lang-text');
  
  // Step elements
  const stepLogin = document.getElementById('stepLogin');
  const stepOTP = document.getElementById('stepOTP');
  const stepSuccess = document.getElementById('stepSuccess');
  
  // Login form
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const togglePassword = document.getElementById('togglePassword');
  const loginBtn = document.getElementById('loginBtn');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  
  // Role tabs
  const roleTabs = document.querySelectorAll('.role-tab');
  
  // OTP form
  const otpForm = document.getElementById('otpForm');
  const otpInputs = document.querySelectorAll('.otp-input');
  const otpError = document.getElementById('otpError');
  const timerDisplay = document.getElementById('timerDisplay');
  const otpTimer = document.getElementById('otpTimer');
  const resendOtpBtn = document.getElementById('resendOtpBtn');
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const otpEmailDisplay = document.getElementById('otpEmailDisplay');
  
  // Success
  const successMessage = document.getElementById('successMessage');
  const redirectMessage = document.getElementById('redirectMessage');
  
  // Toast
  const toastContainer = document.getElementById('toastContainer');
  
  // Forgot Password Modal
  const forgotPasswordModalOverlay = document.getElementById('forgotPasswordModalOverlay');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const forgotPasswordModalContent = document.getElementById('forgotPasswordModalContent');
  
  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // ==================== STATE VARIABLES ====================
  let selectedRole = 'citizen';
  let generatedOTP = '';
  let timerInterval = null;
  let timerSeconds = 60;

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
      
      const superAdminTab = document.querySelector('.role-tab[data-role="superadmin"]');
      const adminTab = document.querySelector('.role-tab[data-role="admin"]');
      const citizenTab = document.querySelector('.role-tab[data-role="citizen"]');
      
      if (superAdminTab) superAdminTab.innerHTML = '<i class="fas fa-crown"></i> Super Admin';
      if (adminTab) adminTab.innerHTML = '<i class="fas fa-user-tie"></i> Admin';
      if (citizenTab) citizenTab.innerHTML = '<i class="fas fa-user"></i> Citizen';
      
      loginEmail.placeholder = 'Enter your email address';
      loginPassword.placeholder = 'Enter your password';
      loginBtn.querySelector('.btn-text').textContent = 'Sign In';
      forgotPasswordLink.textContent = 'Forgot Password?';
      document.querySelector('.remember-me span').textContent = 'Remember me';
      document.querySelector('.visual-content h1').textContent = 'Local Administration Management System';
      document.querySelector('.visual-subtitle').textContent = 'Secure digital platform for efficient local government services and community management.';
      document.querySelector('.features-title').textContent = 'Why Our Authentication System?';
      
      const demoHint = document.querySelector('.demo-hint');
      if (demoHint) {
        demoHint.innerHTML = `
          <p><i class="fas fa-info-circle"></i> Demo Credentials:</p>
          <p>👑 <strong>superadmin@lams.go.tz</strong> | 👔 <strong>admin@lams.go.tz</strong> | 👤 <strong>citizen@lams.go.tz</strong></p>
          <p>Any password (min 6 characters) works for demo</p>
        `;
      }
      
      const otpHeader = document.querySelector('#stepOTP .form-header h2');
      const otpSubtext = document.querySelector('#stepOTP .form-header p');
      if (otpHeader) otpHeader.textContent = 'Verify OTP Code';
      if (otpSubtext) otpSubtext.textContent = 'A 6-digit verification code has been sent to your email';
      const verifyBtnText = verifyOtpBtn.querySelector('.btn-text');
      if (verifyBtnText) verifyBtnText.textContent = 'Verify OTP';
      if (resendOtpBtn) resendOtpBtn.innerHTML = '<i class="fas fa-redo"></i> Resend Code';
      if (backToLoginBtn) backToLoginBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Login';
      
    } else {
      document.querySelector('.form-header h2').textContent = 'Karibu Tena';
      document.querySelector('.form-header p').textContent = 'Ingia kufikia akaunti yako';
      
      const superAdminTab = document.querySelector('.role-tab[data-role="superadmin"]');
      const adminTab = document.querySelector('.role-tab[data-role="admin"]');
      const citizenTab = document.querySelector('.role-tab[data-role="citizen"]');
      
      if (superAdminTab) superAdminTab.innerHTML = '<i class="fas fa-crown"></i> Msimamizi Mkuu';
      if (adminTab) adminTab.innerHTML = '<i class="fas fa-user-tie"></i> Afisa';
      if (citizenTab) citizenTab.innerHTML = '<i class="fas fa-user"></i> Mwananchi';
      
      loginEmail.placeholder = 'Weka anwani yako ya barua pepe';
      loginPassword.placeholder = 'Weka nenosiri lako';
      loginBtn.querySelector('.btn-text').textContent = 'Ingia';
      forgotPasswordLink.textContent = 'Umesahau Nenosiri?';
      document.querySelector('.remember-me span').textContent = 'Nikumbuke';
      document.querySelector('.visual-content h1').textContent = 'Mfumo wa Usimamizi wa Utawala wa Mitaa';
      document.querySelector('.visual-subtitle').textContent = 'Jukwaa salama la kidijitali kwa huduma bora za serikali za mitaa na usimamizi wa jamii.';
      document.querySelector('.features-title').textContent = 'Kwa Nini Mfumo Wetu wa Uthibitishaji?';
      
      const demoHint = document.querySelector('.demo-hint');
      if (demoHint) {
        demoHint.innerHTML = `
          <p><i class="fas fa-info-circle"></i> Vitambulisho vya Onyesho:</p>
          <p>👑 <strong>superadmin@lams.go.tz</strong> | 👔 <strong>admin@lams.go.tz</strong> | 👤 <strong>citizen@lams.go.tz</strong></p>
          <p>Nenosiri lolote (herufi 6+) linafanya kazi kwa onyesho</p>
        `;
      }
      
      const otpHeader = document.querySelector('#stepOTP .form-header h2');
      const otpSubtext = document.querySelector('#stepOTP .form-header p');
      if (otpHeader) otpHeader.textContent = 'Thibitisha Nambari ya OTP';
      if (otpSubtext) otpSubtext.textContent = 'Nambari ya uthibitishaji ya tarakimu 6 imetumwa kwa barua pepe yako';
      const verifyBtnText = verifyOtpBtn.querySelector('.btn-text');
      if (verifyBtnText) verifyBtnText.textContent = 'Thibitisha OTP';
      if (resendOtpBtn) resendOtpBtn.innerHTML = '<i class="fas fa-redo"></i> Tuma Tena';
      if (backToLoginBtn) backToLoginBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Rudi Kwenye Ingia';
    }
  }

  languageToggle.addEventListener('click', () => {
    isEnglish = !isEnglish;
    langText.textContent = isEnglish ? 'EN' : 'SW';
    updateUILanguage();
  });

  // ==================== TOAST NOTIFICATION SYSTEM ====================
  window.showToast = function(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = '';
    switch(type) {
      case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
      case 'error': icon = '<i class="fas fa-times-circle"></i>'; break;
      case 'info': icon = '<i class="fas fa-info-circle"></i>'; break;
      case 'warning': icon = '<i class="fas fa-exclamation-triangle"></i>'; break;
    }
    toast.innerHTML = `${icon} ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 4000);
  };

  // ==================== ROLE TAB SWITCHING ====================
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedRole = tab.getAttribute('data-role');
      
      switch(selectedRole) {
        case 'superadmin':
          loginEmail.placeholder = isEnglish ? 'superadmin@lams.go.tz' : 'superadmin@lams.go.tz';
          break;
        case 'admin':
          loginEmail.placeholder = isEnglish ? 'admin@lams.go.tz' : 'admin@lams.go.tz';
          break;
        case 'citizen':
          loginEmail.placeholder = isEnglish ? 'citizen@lams.go.tz' : 'citizen@lams.go.tz';
          break;
      }
      loginEmail.focus();
    });
  });

  // ==================== ROLE-BASED FORGOT PASSWORD ====================
  forgotPasswordLink.addEventListener('click', function(e) {
    e.preventDefault();
    openForgotPasswordModal();
  });

  function openForgotPasswordModal() {
    let iconClass = '';
    let title = '';
    let message = '';
    let buttonsHTML = '';

    switch(selectedRole) {
      case 'citizen':
        // Citizen: redirect to dedicated forgot password page
        window.location.href = 'forgot-password.html';
        return; // Exit early, no modal needed

      case 'admin':
        iconClass = 'fa-exclamation-triangle warning';
        title = isEnglish ? 'Admin Password Reset' : 'Uwekaji Upya wa Nenosiri la Afisa';
        message = isEnglish 
          ? 'Password reset for Admin accounts is managed by the Super Administrator. Please contact your Super Admin for assistance.'
          : 'Uwekaji upya wa nenosiri kwa akaunti za Afisa unasimamiwa na Msimamizi Mkuu. Tafadhali wasiliana na Msimamizi Mkuu wako kwa msaada.';
        buttonsHTML = `
          <button class="btn btn-outline" onclick="closeForgotPasswordModal()">
            <i class="fas fa-times"></i> ${isEnglish ? 'Cancel' : 'Ghairi'}
          </button>
          <button class="btn btn-warning" onclick="closeForgotPasswordModal()">
            <i class="fas fa-headset"></i> ${isEnglish ? 'Contact Super Admin' : 'Wasiliana na Msimamizi Mkuu'}
          </button>
        `;
        break;

      case 'superadmin':
        iconClass = 'fa-shield-alt danger';
        title = isEnglish ? 'Super Admin Password' : 'Nenosiri la Msimamizi Mkuu';
        message = isEnglish
          ? 'Super Admin accounts are managed directly at the database level. Please contact the Database Administrator (System Controller) for password assistance.'
          : 'Akaunti za Msimamizi Mkuu zinasimamiwa moja kwa moja kwenye kiwango cha hifadhidata. Tafadhali wasiliana na Msimamizi wa Hifadhidata (Mdhibiti wa Mfumo) kwa msaada wa nenosiri.';
        buttonsHTML = `
          <button class="btn btn-primary" onclick="closeForgotPasswordModal()">
            <i class="fas fa-check"></i> ${isEnglish ? 'OK' : 'Sawa'}
          </button>
        `;
        break;
    }

    forgotPasswordModalContent.innerHTML = `
      <div class="modal-icon ${iconClass.includes('warning') ? 'warning' : 'danger'}">
        <i class="fas ${iconClass}"></i>
      </div>
      <h2>${title}</h2>
      <p>${message}</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:10px;">
        ${buttonsHTML}
      </div>
    `;

    forgotPasswordModalOverlay.classList.add('active');
  }

  window.closeForgotPasswordModal = function() {
    forgotPasswordModalOverlay.classList.remove('active');
  };

  // Close modal when clicking overlay
  forgotPasswordModalOverlay.addEventListener('click', function(e) {
    if (e.target === forgotPasswordModalOverlay) {
      closeForgotPasswordModal();
    }
  });

  // Prevent modal close when clicking inside modal
  forgotPasswordModal.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && forgotPasswordModalOverlay.classList.contains('active')) {
      closeForgotPasswordModal();
    }
  });

  // ==================== PASSWORD TOGGLE ====================
  togglePassword.addEventListener('click', () => {
    const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    loginPassword.setAttribute('type', type);
    togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
  });

  // ==================== LOGIN FORM VALIDATION & SUBMISSION ====================
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    emailError.textContent = '';
    passwordError.textContent = '';
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    let isValid = true;

    if (!email) {
      emailError.textContent = isEnglish ? 'Email address is required' : 'Anwani ya barua pepe inahitajika';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.textContent = isEnglish ? 'Please enter a valid email address' : 'Tafadhali weka anwani sahihi ya barua pepe';
      isValid = false;
    }

    if (!password) {
      passwordError.textContent = isEnglish ? 'Password is required' : 'Nenosiri linahitajika';
      isValid = false;
    } else if (password.length < 6) {
      passwordError.textContent = isEnglish ? 'Password must be at least 6 characters' : 'Nenosiri lazima liwe na angalau herufi 6';
      isValid = false;
    }

    if (!isValid) return;

    loginBtn.disabled = true;
    loginBtn.querySelector('.btn-text').style.display = 'none';
    loginBtn.querySelector('.btn-loader').style.display = 'flex';

    setTimeout(() => {
      loginBtn.disabled = false;
      loginBtn.querySelector('.btn-text').style.display = '';
      loginBtn.querySelector('.btn-loader').style.display = 'none';

      const emailLower = email.toLowerCase();
      let validEmail = false;
      let errorMessage = '';
      
      switch(selectedRole) {
        case 'superadmin':
          validEmail = emailLower.includes('superadmin');
          errorMessage = isEnglish ? 
            'Please use a Super Admin email (superadmin@lams.go.tz)' : 
            'Tafadhali tumia barua pepe ya Msimamizi Mkuu (superadmin@lams.go.tz)';
          break;
        case 'admin':
          validEmail = emailLower.includes('admin') && !emailLower.includes('superadmin');
          errorMessage = isEnglish ? 
            'Please use an Admin email (admin@lams.go.tz)' : 
            'Tafadhali tumia barua pepe ya Afisa (admin@lams.go.tz)';
          break;
        case 'citizen':
          validEmail = emailLower.includes('citizen');
          errorMessage = isEnglish ? 
            'Please use a Citizen email (citizen@lams.go.tz)' : 
            'Tafadhali tumia barua pepe ya Mwananchi (citizen@lams.go.tz)';
          break;
      }
      
      if (!validEmail) {
        showToast('warning', errorMessage);
        return;
      }

      showToast('success', isEnglish ? 'Credentials verified! Please enter OTP.' : 'Vitambulisho vimethibitishwa! Tafadhali weka OTP.');
      switchToOTPStep(email);
    }, 1500);
  });

  // ==================== SWITCH TO OTP STEP ====================
  function switchToOTPStep(email) {
    stepLogin.classList.remove('active');
    stepOTP.classList.add('active');
    otpEmailDisplay.textContent = email;
    
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔑 Generated OTP (simulation):', generatedOTP);
    showToast('info', `Demo OTP: ${generatedOTP}`);
    
    otpInputs.forEach(input => input.value = '');
    otpInputs[0].focus();
    otpError.textContent = '';
    
    startOTPTimer();
  }

  // ==================== OTP INPUT HANDLING ====================
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      if (!/^\d$/.test(value)) { input.value = ''; return; }
      if (value && index < otpInputs.length - 1) { otpInputs[index + 1].focus(); }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) { otpInputs[index - 1].focus(); }
    });
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').trim();
      if (/^\d{6}$/.test(pastedData)) {
        const digits = pastedData.split('');
        otpInputs.forEach((inp, i) => { inp.value = digits[i] || ''; });
        otpInputs[otpInputs.length - 1].focus();
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
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // ==================== RESEND OTP ====================
  resendOtpBtn.addEventListener('click', () => {
    if (timerSeconds > 0) return;
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔑 New OTP generated:', generatedOTP);
    showToast('info', `New OTP sent! Demo: ${generatedOTP}`);
    otpInputs.forEach(input => input.value = '');
    otpInputs[0].focus();
    otpError.textContent = '';
    startOTPTimer();
  });

  // ==================== BACK TO LOGIN ====================
  backToLoginBtn.addEventListener('click', () => {
    stepOTP.classList.remove('active');
    stepLogin.classList.add('active');
    clearInterval(timerInterval);
    otpInputs.forEach(input => input.value = '');
    otpError.textContent = '';
  });

  // ==================== OTP VERIFICATION ====================
  otpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (timerSeconds <= 0) {
      otpError.textContent = isEnglish ? 'OTP has expired. Please request a new one.' : 'OTP imekwisha muda. Tafadhali ombi mpya.';
      showToast('error', isEnglish ? 'OTP expired!' : 'OTP imekwisha!');
      return;
    }

    const enteredOTP = Array.from(otpInputs).map(input => input.value).join('');
    
    if (enteredOTP.length !== 6) {
      otpError.textContent = isEnglish ? 'Please enter all 6 digits' : 'Tafadhali weka tarakimu zote 6';
      return;
    }

    verifyOtpBtn.disabled = true;
    verifyOtpBtn.querySelector('.btn-text').style.display = 'none';
    verifyOtpBtn.querySelector('.btn-loader').style.display = 'flex';

    setTimeout(() => {
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.querySelector('.btn-text').style.display = '';
      verifyOtpBtn.querySelector('.btn-loader').style.display = 'none';

      if (enteredOTP === generatedOTP) {
        otpError.textContent = '';
        clearInterval(timerInterval);
        showToast('success', isEnglish ? 'OTP verified successfully!' : 'OTP imethibitishwa!');
        switchToSuccessStep();
      } else {
        otpError.textContent = isEnglish ? 'Incorrect OTP. Please try again.' : 'OTP si sahihi. Tafadhali jaribu tena.';
        showToast('error', isEnglish ? 'Invalid OTP code!' : 'Nambari ya OTP si sahihi!');
        otpInputs.forEach(input => input.value = '');
        otpInputs[0].focus();
      }
    }, 1200);
  });

  // ==================== SUCCESS & REDIRECT ====================
  function switchToSuccessStep() {
    stepOTP.classList.remove('active');
    stepSuccess.classList.add('active');

    let successMsg = '';
    let redirectMsg = '';
    let redirectUrl = '';
    
    switch(selectedRole) {
      case 'superadmin':
        successMsg = isEnglish ? 'Super Admin Access Granted!' : 'Ufikiaji wa Msimamizi Mkuu Umekubaliwa!';
        redirectMsg = isEnglish ? 'Redirecting to Super Admin Dashboard...' : 'Inaelekeza kwenye Dashibodi ya Msimamizi Mkuu...';
        redirectUrl = 'superadmin.html';
        break;
      case 'admin':
        successMsg = isEnglish ? 'Admin Access Granted!' : 'Ufikiaji wa Afisa Umekubaliwa!';
        redirectMsg = isEnglish ? 'Redirecting to Admin Dashboard...' : 'Inaelekeza kwenye Dashibodi ya Afisa...';
        redirectUrl = 'admin.html';
        break;
      case 'citizen':
        successMsg = isEnglish ? 'Login Successful!' : 'Umeingia kwa Mafanikio!';
        redirectMsg = isEnglish ? 'Redirecting to Citizen Portal...' : 'Inaelekeza kwenye Lango la Mwananchi...';
        redirectUrl = 'citizen.html';
        break;
    }
    
    successMessage.textContent = successMsg;
    redirectMessage.textContent = redirectMsg;
    
    const userSession = {
      role: selectedRole,
      email: otpEmailDisplay.textContent,
      loginTime: new Date().toISOString(),
      isAuthenticated: true
    };
    localStorage.setItem('lams_user_session', JSON.stringify(userSession));
    
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2000);
  }

  // ==================== INITIALIZATION ====================
  const defaultActiveTab = document.querySelector('.role-tab[data-role="citizen"]');
  if (defaultActiveTab) {
    roleTabs.forEach(t => t.classList.remove('active'));
    defaultActiveTab.classList.add('active');
    selectedRole = 'citizen';
    loginEmail.placeholder = 'citizen@lams.go.tz';
  }
  
  setTimeout(() => loginEmail.focus(), 500);

  console.log('🔐 LAMS Login System - Role-Based Forgot Password Active');
  console.log('✅ Citizens → forgot-password.html');
  console.log('✅ Admins → Contact Super Admin modal');
  console.log('✅ Super Admins → Contact DB Administrator modal');
  console.log('👑 Super Admin: superadmin@lams.go.tz');
  console.log('👔 Admin: admin@lams.go.tz');
  console.log('👤 Citizen: citizen@lams.go.tz');
});