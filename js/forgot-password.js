// forgot-password.js - Multi-step password reset with OTP verification

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==================== STATE ====================
  let currentStep = 1;
  let userEmail = '';
  let otpCode = '';
  let timerInterval = null;
  let timeLeft = 300; // 5 minutes in seconds
  let isResending = false;

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
      document.getElementById(`step${step}Content`).classList.add('active');
    }
    
    // Update progress indicators
    progressSteps.forEach((ps, index) => {
      const stepNum = index + 1;
      ps.classList.remove('active', 'completed');
      if (stepNum < step) ps.classList.add('completed');
      if (stepNum === step && step < 4) ps.classList.add('active');
    });

    // If going to step 4, mark all as completed
    if (step === 4) {
      progressSteps.forEach(ps => ps.classList.add('completed'));
    }

    // Trigger card animation
    authCard.style.animation = 'none';
    authCard.offsetHeight; // reflow
    authCard.style.animation = 'cardAppear 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  }

  // ==================== EVENT LISTENERS ====================
  function setupEventListeners() {
    // Step 1: Email Form
    emailForm.addEventListener('submit', handleEmailSubmit);
    
    // Step 2: OTP Form
    otpForm.addEventListener('submit', handleOTPSubmit);
    resendOtpBtn.addEventListener('click', handleResendOTP);
    
    // Step 3: Password Form
    passwordForm.addEventListener('submit', handlePasswordSubmit);
  }

  // ==================== STEP 1: EMAIL VERIFICATION ====================
  function handleEmailSubmit(e) {
    e.preventDefault();
    emailError.classList.remove('show');
    
    const email = emailInput.value.trim();
    
    // Validation
    if (!email) {
      showEmailError('Please enter your email address');
      return;
    }
    if (!isValidEmail(email)) {
      showEmailError('Please enter a valid email address');
      return;
    }
    
    // Show loading
    setButtonLoading(emailSubmitBtn, true);
    emailInput.disabled = true;
    
    // Simulate API call (backend integration point)
    setTimeout(() => {
      userEmail = email;
      
      // Generate OTP (in production, this comes from backend)
      otpCode = generateOTP();
      
      // API CALL: POST /api/citizen/auth/forgot-password
      // Body: { email: userEmail }
      // Response: OTP sent to email
      
      console.log(`📧 OTP for ${userEmail}: ${otpCode}`);
      
      // Display email in step 2
      otpEmailDisplay.textContent = maskEmail(userEmail);
      
      // Reset loading
      setButtonLoading(emailSubmitBtn, false);
      emailInput.disabled = false;
      
      // Show success toast
      showToast('success', 'Verification code sent to your email');
      
      // Move to step 2
      showStep(2);
      startTimer();
      clearOTPInputs();
      setTimeout(() => otpInputs[0].focus(), 300);
      
    }, 1500);
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
        
        // Check if all filled
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
        
        // Arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
          otpInputs[index - 1].focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
          otpInputs[index + 1].focus();
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
        showToast('error', 'Verification code expired');
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const percentage = (timeLeft / 300) * 100;
    
    timerFill.style.width = percentage + '%';
    
    if (timeLeft <= 60) {
      timerFill.classList.add('danger');
      timerFill.classList.remove('warning');
      timerText.classList.add('danger');
    } else if (timeLeft <= 120) {
      timerFill.classList.add('warning');
      timerFill.classList.remove('danger');
      timerText.classList.add('warning');
    } else {
      timerFill.classList.remove('warning', 'danger');
      timerText.classList.remove('warning', 'danger');
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
    otpSubmitBtn.disabled = false;
    otpInputs.forEach(input => input.disabled = false);
  }

  // ==================== STEP 2: OTP VERIFICATION ====================
  function handleOTPSubmit(e) {
    e.preventDefault();
    otpError.classList.remove('show');
    otpInputs.forEach(inp => inp.classList.remove('error'));
    
    const enteredOTP = getOTPValue();
    
    // Validation
    if (enteredOTP.length !== 6) {
      showOTPError('Please enter the complete 6-digit code');
      otpInputs.forEach(inp => { if (!inp.value) inp.classList.add('error'); });
      return;
    }
    
    // Show loading
    setButtonLoading(otpSubmitBtn, true);
    otpInputs.forEach(inp => inp.disabled = true);
    
    // Simulate API verification (backend integration point)
    setTimeout(() => {
      // API CALL: POST /api/citizen/auth/verify-reset-otp
      // Body: { email: userEmail, otp: enteredOTP }
      
      // For demo: OTP "123456" is always valid, or check against generated OTP
      const isValid = enteredOTP === otpCode || enteredOTP === '123456';
      
      if (isValid) {
        setButtonLoading(otpSubmitBtn, false);
        showToast('success', 'OTP verified successfully');
        
        // Stop timer
        if (timerInterval) clearInterval(timerInterval);
        
        // Move to step 3
        showStep(3);
        setTimeout(() => newPasswordInput.focus(), 300);
      } else {
        setButtonLoading(otpSubmitBtn, false);
        otpInputs.forEach(inp => inp.disabled = false);
        showOTPError('Invalid verification code. Please try again.');
        otpInputs.forEach(inp => inp.classList.add('error'));
        clearOTPInputs();
        setTimeout(() => otpInputs[0].focus(), 300);
      }
    }, 1500);
  }

  function showOTPError(msg) {
    otpError.textContent = msg;
    otpError.classList.add('show');
  }

  function handleResendOTP() {
    if (isResending) return;
    if (timeLeft > 240) {
      showToast('info', 'Please wait before requesting a new code');
      return;
    }
    
    isResending = true;
    resendOtpBtn.disabled = true;
    
    // Simulate resend (backend integration point)
    setTimeout(() => {
      // API CALL: POST /api/citizen/auth/resend-otp
      // Body: { email: userEmail }
      
      otpCode = generateOTP();
      console.log(`📧 Resent OTP for ${userEmail}: ${otpCode}`);
      
      clearOTPInputs();
      resetTimer();
      startTimer();
      setTimeout(() => otpInputs[0].focus(), 300);
      
      isResending = false;
      resendOtpBtn.disabled = false;
      showToast('success', 'New verification code sent');
    }, 1000);
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
      
      // Update strength bar
      const percentages = { weak: 25, medium: 50, strong: 75, 'very-strong': 100 };
      const colors = { weak: '#ef4444', medium: '#f59e0b', strong: '#3b82f6', 'very-strong': '#00b894' };
      
      strengthFill.style.width = percentages[strength.level] + '%';
      strengthFill.style.background = colors[strength.level];
      strengthText.textContent = `Password Strength: ${strength.label}`;
      strengthText.style.color = colors[strength.level];
      
      // Update requirements
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
      if (reqs[req]) span.classList.add('met');
      else span.classList.remove('met');
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
  function handlePasswordSubmit(e) {
    e.preventDefault();
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
    
    // Show loading
    setButtonLoading(passwordSubmitBtn, true);
    
    // Simulate API call (backend integration point)
    setTimeout(() => {
      // API CALL: POST /api/citizen/auth/reset-password
      // Body: { email: userEmail, otp: otpCode, new_password: newPassword, confirm_password: confirmPassword }
      
      setButtonLoading(passwordSubmitBtn, false);
      showToast('success', 'Password reset successful!');
      
      // Show success screen
      showStep(4);
    }, 1500);
  }

  function showPasswordError(msg) {
    passwordError.textContent = msg;
    passwordError.classList.add('show');
  }

  // ==================== UTILITY FUNCTIONS ====================
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function maskEmail(email) {
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name.substring(0, 2)}***${name.slice(-1)}@${domain}`;
  }

  function generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      button.disabled = true;
    } else {
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
      button.disabled = false;
    }
  }

  function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // ==================== START ====================
  init();
});