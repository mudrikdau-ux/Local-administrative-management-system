// forgot-password.js - Multi-step password reset with OTP verification
// Version: 2.1 - Fixed OTP reuse issue

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const API = window.API;
  if (!API) { 
    console.error('❌ API not loaded!');
    showToast('error', 'System initialization error. Please refresh the page.');
    return;
  }

  // ==================== STATE ====================
  let currentStep = 1;
  let userEmail = '';
  let verifiedOTP = '';  // Store verified OTP for password reset
  let otpCode = '';
  let timerInterval = null;
  let timeLeft = 300; // 5 minutes
  let isResending = false;
  let isSubmitting = false;

  // ==================== DOM REFERENCES ====================
  const authCard = document.getElementById('authCard');
  const step1Content = document.getElementById('step1Content');
  const step2Content = document.getElementById('step2Content');
  const step3Content = document.getElementById('step3Content');
  const successContent = document.getElementById('successContent');
  const progressSteps = document.querySelectorAll('.progress-step');

  // Step 1
  const emailForm = document.getElementById('emailForm');
  const emailInput = document.getElementById('emailInput');
  const emailError = document.getElementById('emailError');
  const emailSubmitBtn = document.getElementById('emailSubmitBtn');

  // Step 2
  const otpForm = document.getElementById('otpForm');
  const otpInputs = document.querySelectorAll('.otp-input');
  const otpError = document.getElementById('otpError');
  const otpSubmitBtn = document.getElementById('otpSubmitBtn');
  const otpEmailDisplay = document.getElementById('otpEmailDisplay');
  const timerFill = document.getElementById('timerFill');
  const timerText = document.getElementById('timerText');
  const timerWrapper = document.getElementById('timerWrapper');
  const resendOtpBtn = document.getElementById('resendOtpBtn');

  // Step 3
  const passwordForm = document.getElementById('passwordForm');
  const newPasswordInput = document.getElementById('newPasswordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');
  const passwordError = document.getElementById('passwordError');
  const passwordSubmitBtn = document.getElementById('passwordSubmitBtn');
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');
  const passwordStrength = document.getElementById('passwordStrength');
  const passwordRequirements = document.getElementById('passwordRequirements');

  // ==================== INITIALIZATION ====================
  function init() {
    loadTheme();
    showStep(1);
    setupOTPInputs();
    setupPasswordToggle();
    setupPasswordStrength();
    setupEventListeners();
    otpSubmitBtn.disabled = true;
    console.log('🔐 LAMS Forgot Password - Ready');
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') document.body.classList.add('dark-mode');
  }

  // ==================== STEP NAVIGATION ====================
  function showStep(step) {
    currentStep = step;
    
    // Hide all steps
    [step1Content, step2Content, step3Content, successContent].forEach(el => el.classList.remove('active'));
    
    // Show current step
    if (step === 4) {
      successContent.classList.add('active');
    } else {
      const stepEl = document.getElementById(`step${step}Content`);
      if (stepEl) stepEl.classList.add('active');
    }
    
    // Update progress indicators
    progressSteps.forEach((ps, index) => {
      const stepNum = index + 1;
      ps.classList.remove('active', 'completed');
      if (stepNum < step) ps.classList.add('completed');
      if (stepNum === step && step < 4) ps.classList.add('active');
    });

    if (step === 4) {
      progressSteps.forEach(ps => ps.classList.add('completed'));
    }

    // Trigger card animation
    authCard.style.animation = 'none';
    authCard.offsetHeight;
    authCard.style.animation = 'cardAppear 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  }

  // ==================== EVENT LISTENERS ====================
  function setupEventListeners() {
    emailForm.addEventListener('submit', handleEmailSubmit);
    otpForm.addEventListener('submit', handleOTPSubmit);
    resendOtpBtn.addEventListener('click', handleResendOTP);
    passwordForm.addEventListener('submit', handlePasswordSubmit);
    
    // Reset form when going back to step 1 (optional)
    document.querySelectorAll('.footer-link[href="login.html"]').forEach(link => {
      link.addEventListener('click', () => {
        clearSession();
      });
    });
  }

  // ==================== STEP 1: EMAIL VERIFICATION ====================
  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;
    
    emailError.classList.remove('show');
    emailInput.classList.remove('error');
    
    const email = emailInput.value.trim();
    
    // Validation
    if (!email) {
      showEmailError('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showEmailError('Please enter a valid email address');
      return;
    }
    
    isSubmitting = true;
    setButtonLoading(emailSubmitBtn, true);
    emailInput.disabled = true;

    try {
      // Call citizen forgot password endpoint
      const res = await API.auth.citizenForgotPassword(email);
      console.log('📧 Forgot password response:', res);
      
      if (res.success) {
        userEmail = email;
        verifiedOTP = ''; // Reset stored OTP
        otpCode = res.data?.otp || generateOTP();
        console.log(`📧 OTP for ${userEmail}: ${otpCode}`);
        
        otpEmailDisplay.textContent = maskEmail(userEmail);
        
        setButtonLoading(emailSubmitBtn, false);
        emailInput.disabled = false;
        showToast('success', 'Verification code sent to your email');
        
        // Move to step 2
        showStep(2);
        startTimer();
        clearOTPInputs();
        otpSubmitBtn.disabled = true;
        otpInputs.forEach(input => input.disabled = false);
        setTimeout(() => otpInputs[0].focus(), 400);
      } else {
        // Check if error message indicates admin or super admin
        const msg = res.message || '';
        if (msg.toLowerCase().includes('admin') || msg.toLowerCase().includes('super')) {
          showToast('info', msg);
        } else {
          showEmailError(msg || 'Email not found. Please check and try again.');
        }
        setButtonLoading(emailSubmitBtn, false);
        emailInput.disabled = false;
        isSubmitting = false;
      }
    } catch (error) {
      console.error('❌ Email submit error:', error);
      showEmailError('Network error. Please check your connection.');
      setButtonLoading(emailSubmitBtn, false);
      emailInput.disabled = false;
      isSubmitting = false;
    }
    
    isSubmitting = false;
  }

  function showEmailError(msg) {
    emailError.textContent = msg;
    emailError.classList.add('show');
    emailInput.classList.add('error');
    setTimeout(() => emailInput.classList.remove('error'), 2000);
  }

  // ==================== OTP INPUT HANDLING ====================
  function setupOTPInputs() {
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Only allow numbers
        if (!/^\d*$/.test(value)) {
          e.target.value = '';
          return;
        }
        
        // Clear error on input
        otpError.classList.remove('show');
        otpInputs.forEach(inp => inp.classList.remove('error'));
        
        // Auto-move to next
        if (value.length === 1 && index < 5) {
          otpInputs[index + 1].focus();
          input.classList.add('filled');
        }
        
        // Enable submit button if all filled
        const allFilled = Array.from(otpInputs).every(inp => inp.value.length === 1);
        if (allFilled && timeLeft > 0) {
          otpSubmitBtn.disabled = false;
        }
        
        if (index === 5 && value.length === 1) {
          input.classList.add('filled');
        }
      });
      
      input.addEventListener('keydown', (e) => {
        // Move back on backspace
        if (e.key === 'Backspace' && !input.value && index > 0) {
          otpInputs[index - 1].focus();
          otpInputs[index - 1].classList.remove('filled');
        }
        
        // Submit on Enter
        if (e.key === 'Enter') {
          e.preventDefault();
          otpForm.dispatchEvent(new Event('submit'));
        }
      });
      
      // Paste support
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasteData = (e.clipboardData || window.clipboardData).getData('text');
        const digits = pasteData.replace(/\D/g, '').substring(0, 6);
        
        if (digits.length > 0) {
          digits.split('').forEach((digit, i) => {
            if (otpInputs[i]) {
              otpInputs[i].value = digit;
              otpInputs[i].classList.add('filled');
            }
          });
          
          // Focus last filled or next empty
          const focusIndex = Math.min(digits.length, 5);
          otpInputs[focusIndex].focus();
          
          // Enable submit if all filled
          const allFilled = Array.from(otpInputs).every(inp => inp.value.length === 1);
          if (allFilled && timeLeft > 0) {
            otpSubmitBtn.disabled = false;
          }
        }
      });
    });
  }

  function clearOTPInputs() {
    otpInputs.forEach(input => {
      input.value = '';
      input.classList.remove('filled', 'error');
    });
    otpError.classList.remove('show');
    otpSubmitBtn.disabled = true;
  }

  function getOTPValue() {
    return Array.from(otpInputs).map(input => input.value).join('');
  }

  // ==================== TIMER ====================
  function startTimer() {
    timeLeft = 300;
    updateTimerDisplay();
    
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerFill.style.width = '0%';
        timerText.innerHTML = 'Code expired. <strong style="color:#ef4444;">Please request a new one.</strong>';
        timerText.classList.add('danger');
        otpSubmitBtn.disabled = true;
        otpInputs.forEach(input => input.disabled = true);
        verifiedOTP = ''; // Clear stored OTP on expiry
        showToast('error', 'Verification code expired');
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const percentage = (timeLeft / 300) * 100;
    
    timerFill.style.width = percentage + '%';
    
    // Reset classes
    timerFill.classList.remove('warning', 'danger');
    timerText.classList.remove('warning', 'danger');
    
    if (timeLeft <= 60) {
      timerFill.classList.add('danger');
      timerText.classList.add('danger');
    } else if (timeLeft <= 120) {
      timerFill.classList.add('warning');
      timerText.classList.add('warning');
    }
    
    timerText.innerHTML = `Code expires in: <strong>${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</strong>`;
  }

  function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timeLeft = 300;
    timerFill.classList.remove('warning', 'danger');
    timerFill.style.width = '100%';
    timerText.classList.remove('warning', 'danger');
    timerText.innerHTML = 'Code expires in: <strong>05:00</strong>';
    otpSubmitBtn.disabled = true;
    otpInputs.forEach(input => input.disabled = false);
    verifiedOTP = ''; // Clear stored OTP on timer reset
  }

  // ==================== STEP 2: OTP VERIFICATION ====================
  async function handleOTPSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;
    
    otpError.classList.remove('show');
    otpInputs.forEach(inp => inp.classList.remove('error'));
    
    const enteredOTP = getOTPValue();
    
    // Validation
    if (enteredOTP.length !== 6) {
      showOTPError('Please enter the complete 6-digit code');
      otpInputs.forEach(inp => { if (!inp.value) inp.classList.add('error'); });
      return;
    }
    
    if (timeLeft <= 0) {
      showOTPError('OTP has expired. Please request a new one.');
      return;
    }
    
    isSubmitting = true;
    setButtonLoading(otpSubmitBtn, true);
    otpInputs.forEach(inp => inp.disabled = true);

    try {
      console.log('🔐 Verifying OTP for:', userEmail);
      const res = await API.auth.citizenVerifyResetOTP(userEmail, enteredOTP);
      console.log('🔐 OTP verification response:', res);
      
      if (res.success) {
        // ✅ STORE THE VERIFIED OTP FOR PASSWORD RESET
        verifiedOTP = enteredOTP;
        console.log('✅ Verified OTP stored:', verifiedOTP);
        
        setButtonLoading(otpSubmitBtn, false);
        otpInputs.forEach(inp => inp.disabled = false);
        showToast('success', 'OTP verified successfully');
        
        if (timerInterval) clearInterval(timerInterval);
        
        // Move to step 3
        showStep(3);
        setTimeout(() => newPasswordInput.focus(), 400);
        isSubmitting = false;
      } else {
        setButtonLoading(otpSubmitBtn, false);
        otpInputs.forEach(inp => inp.disabled = false);
        showOTPError(res.message || 'Invalid verification code. Please try again.');
        otpInputs.forEach(inp => inp.classList.add('error'));
        clearOTPInputs();
        otpSubmitBtn.disabled = true;
        verifiedOTP = ''; // Clear stored OTP on failure
        setTimeout(() => otpInputs[0].focus(), 400);
        isSubmitting = false;
      }
    } catch (error) {
      console.error('❌ OTP verify error:', error);
      setButtonLoading(otpSubmitBtn, false);
      otpInputs.forEach(inp => inp.disabled = false);
      showOTPError('Network error. Please try again.');
      verifiedOTP = ''; // Clear stored OTP on error
      isSubmitting = false;
    }
  }

  function showOTPError(msg) {
    otpError.textContent = msg;
    otpError.classList.add('show');
  }

  // ==================== RESEND OTP ====================
  async function handleResendOTP() {
    if (isResending || isSubmitting) return;
    
    isResending = true;
    resendOtpBtn.disabled = true;
    verifiedOTP = ''; // ✅ Clear stored OTP on resend

    try {
      const res = await API.auth.citizenResendOTP(userEmail);
      console.log('📧 Resend OTP response:', res);
      
      if (res.success) {
        otpCode = res.data?.otp || generateOTP();
        console.log(`📧 Resent OTP for ${userEmail}: ${otpCode}`);
        
        clearOTPInputs();
        resetTimer();
        startTimer();
        otpInputs.forEach(input => input.disabled = false);
        otpSubmitBtn.disabled = true;
        setTimeout(() => otpInputs[0].focus(), 400);
        showToast('success', 'New verification code sent');
      } else {
        showToast('error', res.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      showToast('error', 'Network error. Please try again.');
    } finally {
      isResending = false;
      resendOtpBtn.disabled = false;
    }
  }

  // ==================== PASSWORD STRENGTH ====================
  function setupPasswordStrength() {
    newPasswordInput.addEventListener('input', () => {
      const password = newPasswordInput.value;
      
      if (password.length > 0) {
        passwordStrength.classList.add('show');
      } else {
        passwordStrength.classList.remove('show');
      }
      
      const strength = checkPasswordStrength(password);
      const percentages = { weak: 25, medium: 50, strong: 75, 'very-strong': 100 };
      const colors = { weak: '#ef4444', medium: '#f59e0b', strong: '#3b82f6', 'very-strong': '#00b894' };
      
      strengthFill.style.width = percentages[strength.level] + '%';
      strengthFill.style.background = colors[strength.level];
      strengthText.textContent = `Password Strength: ${strength.label}`;
      strengthText.style.color = colors[strength.level];
      
      updatePasswordRequirements(password);
    });
  }

  function checkPasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { level: 'weak', label: 'Weak' };
    if (score <= 4) return { level: 'medium', label: 'Medium' };
    if (score <= 6) return { level: 'strong', label: 'Strong' };
    return { level: 'very-strong', label: 'Very Strong' };
  }

  function updatePasswordRequirements(password) {
    const reqs = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    };
    
    Object.keys(reqs).forEach(req => {
      const span = document.querySelector(`[data-req="${req}"]`);
      if (span) {
        if (reqs[req]) span.classList.add('met');
        else span.classList.remove('met');
      }
    });
  }

  // ==================== PASSWORD TOGGLE ====================
  function setupPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    });
  }

  // ==================== STEP 3: RESET PASSWORD ====================
  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;
    
    passwordError.classList.remove('show');
    
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validation
    if (!newPassword) {
      showPasswordError('Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      showPasswordError('Password must be at least 6 characters');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      showPasswordError('Password must contain at least 1 uppercase letter');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      showPasswordError('Password must contain at least 1 lowercase letter');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      showPasswordError('Password must contain at least 1 number');
      return;
    }
    if (newPassword !== confirmPassword) {
      showPasswordError('Passwords do not match');
      return;
    }
    
    // ✅ Check if we have a verified OTP
    if (!verifiedOTP) {
      showPasswordError('OTP verification required. Please go back and verify your OTP.');
      return;
    }
    
    isSubmitting = true;
    setButtonLoading(passwordSubmitBtn, true);

    try {
      // ✅ Use the stored verified OTP
      const res = await API.auth.citizenResetPassword(userEmail, verifiedOTP, newPassword, confirmPassword);
      console.log('🔑 Password reset response:', res);
      
      if (res.success) {
        setButtonLoading(passwordSubmitBtn, false);
        showToast('success', 'Password reset successful!');
        // Clear stored OTP for security
        verifiedOTP = '';
        showStep(4);
        isSubmitting = false;
      } else {
        setButtonLoading(passwordSubmitBtn, false);
        // If error says OTP expired, reset the flow
        const msg = res.message || '';
        if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
          showPasswordError('OTP has expired or is invalid. Please restart the process.');
          verifiedOTP = '';
          // Reset to step 1 after a moment
          setTimeout(() => {
            showStep(1);
            resetTimer();
            clearOTPInputs();
            verifiedOTP = '';
          }, 2500);
        } else {
          showPasswordError(msg || 'Failed to reset password. Please try again.');
        }
        isSubmitting = false;
      }
    } catch (error) {
      console.error('❌ Password reset error:', error);
      setButtonLoading(passwordSubmitBtn, false);
      showPasswordError('Network error. Please try again.');
      isSubmitting = false;
    }
  }

  function showPasswordError(msg) {
    passwordError.textContent = msg;
    passwordError.classList.add('show');
  }

  // ==================== UTILITY FUNCTIONS ====================
  function maskEmail(email) {
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name.substring(0, 2)}***${name.slice(-1)}@${domain}`;
  }

  function generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function setButtonLoading(button, isLoading) {
    if (!button) return;
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
      if (btnText) btnText.style.display = 'none';
      if (btnLoader) btnLoader.style.display = 'inline-flex';
      button.disabled = true;
    } else {
      if (btnText) btnText.style.display = 'inline';
      if (btnLoader) btnLoader.style.display = 'none';
      button.disabled = false;
    }
  }

  function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function clearSession() {
    // Clear any session data if needed
    try {
      if (window.API && window.API.clearSession) {
        window.API.clearSession();
      }
    } catch (e) {
      // Ignore
    }
  }

  // ==================== START ====================
  init();
});