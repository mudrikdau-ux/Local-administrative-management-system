// contact.js - Fully Connected to Backend
document.addEventListener('DOMContentLoaded', async () => {
  // ==================== DOM ELEMENTS ====================
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTopBtn = document.getElementById('backToTop');
  const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
  const languageToggle = document.getElementById('languageToggle');
  const langText = document.querySelector('.lang-text');
  const yearSpan = document.getElementById('year');
  const faqQuestions = document.querySelectorAll('.faq-question');
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const sendAnotherBtn = document.getElementById('sendAnother');
  const pageHeader = document.getElementById('pageHeader');
  const mapContainer = document.getElementById('mapContainer');

  // System elements
  const systemNameShort = document.getElementById('systemNameShort');
  const footerOrgName = document.getElementById('footerOrgName');

  // Contact info elements
  const contactPhone = document.getElementById('contactPhone');
  const contactEmail = document.getElementById('contactEmail');
  const contactAddress = document.getElementById('contactAddress');
  const contactHours = document.getElementById('contactHours');
  const officeAddress = document.getElementById('officeAddress');

  // ==================== SET YEAR & SYSTEM NAME ====================
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ==================== LOAD SYSTEM SETTINGS ====================
  async function loadSystemSettings() {
    try {
      const res = await API.superAdmin.getSettings();
      if (res.success && res.data) {
        const settings = res.data;
        
        if (settings.system_name && systemNameShort) {
          systemNameShort.textContent = settings.system_name;
        }
        if (settings.organization_name && footerOrgName) {
          footerOrgName.textContent = settings.organization_name;
        }
        if (settings.contact_phone && contactPhone) {
          contactPhone.textContent = settings.contact_phone;
        }
        if (settings.contact_email && contactEmail) {
          contactEmail.textContent = settings.contact_email;
        }
        if (settings.system_address && contactAddress) {
          contactAddress.innerHTML = settings.system_address.replace(/\n/g, '<br>');
        }
        if (settings.office_hours && contactHours) {
          contactHours.textContent = settings.office_hours;
        }
        if (settings.system_address && officeAddress) {
          officeAddress.textContent = settings.system_address;
        }
        
        console.log('✅ [LAMS] System settings loaded');
      }
    } catch (e) {
      console.log('ℹ️ [LAMS] Settings not available (may need login)');
    }
  }
  await loadSystemSettings();

  // ==================== BACKGROUND IMAGE MANAGEMENT ====================
  function setPageHeaderBackground() {
    if (pageHeader) {
      const headerBgUrl = 'image/contact.png'; // Replace with your desired image URL
      pageHeader.style.backgroundImage = `url('${headerBgUrl}')`;
      pageHeader.style.backgroundSize = 'cover';
      pageHeader.style.backgroundPosition = 'center';
      pageHeader.style.backgroundRepeat = 'no-repeat';
      pageHeader.style.position = 'relative';
      
      let overlay = pageHeader.querySelector('.header-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'header-overlay';
        overlay.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.55);
          pointer-events: none;
        `;
        pageHeader.insertBefore(overlay, pageHeader.firstChild);
      }
      
      const h1 = pageHeader.querySelector('h1');
      const p = pageHeader.querySelector('p');
      if (h1) h1.style.color = '#fff';
      if (p) p.style.color = 'rgba(255,255,255,0.9)';
    }
  }

  function setMapBackground() {
    if (mapContainer) {
      // Google Maps Embed API iframe - already in HTML
      // Ensure the iframe is properly styled
      const iframe = mapContainer.querySelector('iframe');
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = '0';
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
      }
    }
  }

  setPageHeaderBackground();
  setMapBackground();

  // ==================== HAMBURGER MENU ====================
  function openMenu() {
    navMenu.classList.add('active');
    menuOverlay.classList.add('active');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    navMenu.classList.contains('active') ? closeMenu() : openMenu();
  });

  menuOverlay.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      closeMenu();
      hamburger.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && navMenu.classList.contains('active')) {
      closeMenu();
    }
  });

  // ==================== DARK/LIGHT MODE TOGGLE ====================
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
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
  const translations = {
    en: {
      pageTitle: 'Contact Us',
      pageSubtitle: 'We are here to help you',
      contactInfoTitle: 'Get In Touch',
      phoneTitle: 'Phone',
      phoneNote: 'Available during working hours',
      emailTitle: 'Email',
      emailNote: 'We respond within 24 hours',
      locationTitle: 'Location',
      locationNote: 'Mpendae, Zanzibar',
      hoursTitle: 'Working Hours',
      hoursNote: 'Weekend: Emergency only',
      formTitle: 'Send Us a Message',
      fullNameLabel: 'Full Name',
      emailLabel: 'Email Address',
      phoneLabel: 'Phone Number',
      subjectLabel: 'Subject',
      messageLabel: 'Message',
      submitBtnText: 'Send Message',
      successTitle: 'Message Sent Successfully!',
      successText: 'Thank you for contacting us. We will get back to you shortly.',
      sendAnother: 'Send Another Message',
      locationSectionTitle: 'Our Location',
      officeName: 'LAMS Office - Mpendae, Zanzibar',
      socialTitle: 'Connect With Us',
      faqTitle: 'Frequently Asked Questions',
      faq1Question: 'How can I contact the administration?',
      faq1Answer: 'Call us at +255 123 456 789, email info@lams.go.tz, or visit our office in Mpendae, Zanzibar during working hours.',
      faq2Question: 'What services can I request?',
      faq2Answer: 'You can request citizen registration, document applications, payment processing, and general inquiries.',
      faq3Question: 'How long does a response take?',
      faq3Answer: 'We respond to all inquiries within 24 hours during working days.',
      ctaTitle: 'Need Assistance?',
      ctaText: 'Contact our administration team today',
      fullNamePlaceholder: 'Enter your full name',
      emailPlaceholder: 'Enter your email address',
      phonePlaceholder: 'Enter your phone number',
      messagePlaceholder: 'Write your message here...',
      selectSubject: 'Select a subject',
      generalInquiry: 'General Inquiry',
      documentApp: 'Document Application',
      paymentIssue: 'Payment Issue',
      complaint: 'Complaint',
      suggestion: 'Suggestion',
      other: 'Other',
      fullNameRequired: 'Full name is required',
      fullNameMin: 'Name must be at least 3 characters',
      emailRequired: 'Email address is required',
      emailInvalid: 'Please enter a valid email address',
      phoneInvalid: 'Please enter a valid phone number',
      subjectRequired: 'Please select a subject',
      messageRequired: 'Message is required',
      messageMin: 'Message must be at least 10 characters',
      sending: 'Sending...',
      successMessage: 'Your message has been sent successfully!',
      errorTryAgain: 'Failed to send message. Please try again.',
      rateLimit: 'Too many requests. Please wait a few minutes before trying again.'
    },
    sw: {
      pageTitle: 'Wasiliana Nasi',
      pageSubtitle: 'Tuko hapa kukusaidia',
      contactInfoTitle: 'Wasiliana Nasi',
      phoneTitle: 'Simu',
      phoneNote: 'Inapatikana wakati wa saa za kazi',
      emailTitle: 'Barua Pepe',
      emailNote: 'Tunajibu ndani ya masaa 24',
      locationTitle: 'Mahali',
      locationNote: 'Mpendae, Zanzibar',
      hoursTitle: 'Saa za Kazi',
      hoursNote: 'Mwishoni mwa wiki: Dharura tu',
      formTitle: 'Tutumie Ujumbe',
      fullNameLabel: 'Jina Kamili',
      emailLabel: 'Anwani ya Barua Pepe',
      phoneLabel: 'Nambari ya Simu',
      subjectLabel: 'Mada',
      messageLabel: 'Ujumbe',
      submitBtnText: 'Tuma Ujumbe',
      successTitle: 'Ujumbe Umetumwa kwa Mafanikio!',
      successText: 'Asante kwa kuwasiliana nasi. Tutakujibu hivi karibuni.',
      sendAnother: 'Tuma Ujumbe Mwingine',
      locationSectionTitle: 'Mahali Petu',
      officeName: 'Ofisi ya LAMS - Mpendae, Zanzibar',
      socialTitle: 'Ungana Nasi',
      faqTitle: 'Maswali Yanayoulizwa Mara kwa Mara',
      faq1Question: 'Ninawezaje kuwasiliana na utawala?',
      faq1Answer: 'Piga simu +255 123 456 789, tuma barua pepe info@lams.go.tz, au tembelea ofisi yetu Mpendae, Zanzibar wakati wa saa za kazi.',
      faq2Question: 'Ni huduma gani ninaweza kuomba?',
      faq2Answer: 'Unaweza kuomba usajili wa raia, maombi ya hati, usindikaji wa malipo, na maswali ya jumla.',
      faq3Question: 'Inachukua muda gani kupata jibu?',
      faq3Answer: 'Tunajibu maswali yote ndani ya masaa 24 wakati wa siku za kazi.',
      ctaTitle: 'Unahitaji Msaada?',
      ctaText: 'Wasiliana na timu yetu ya utawala leo',
      fullNamePlaceholder: 'Ingiza jina lako kamili',
      emailPlaceholder: 'Ingiza anwani yako ya barua pepe',
      phonePlaceholder: 'Ingiza nambari yako ya simu',
      messagePlaceholder: 'Andika ujumbe wako hapa...',
      selectSubject: 'Chagua mada',
      generalInquiry: 'Uchunguzi wa Jumla',
      documentApp: 'Maombi ya Hati',
      paymentIssue: 'Suala la Malipo',
      complaint: 'Malalamiko',
      suggestion: 'Pendekezo',
      other: 'Nyingine',
      fullNameRequired: 'Jina kamili linahitajika',
      fullNameMin: 'Jina lazima liwe na herufi angalau 3',
      emailRequired: 'Anwani ya barua pepe inahitajika',
      emailInvalid: 'Tafadhali ingiza anwani halali ya barua pepe',
      phoneInvalid: 'Tafadhali ingiza nambari halali ya simu',
      subjectRequired: 'Tafadhali chagua mada',
      messageRequired: 'Ujumbe unahitajika',
      messageMin: 'Ujumbe lazima uwe na herufi angalau 10',
      sending: 'Inatuma...',
      successMessage: 'Ujumbe wako umetumwa kwa mafanikio!',
      errorTryAgain: 'Imeshindwa kutuma ujumbe. Tafadhali jaribu tena.',
      rateLimit: 'Maombi mengi sana. Tafadhali subiri dakika chache kabla ya kujaribu tena.'
    }
  };

  let currentLang = localStorage.getItem('lams_language') || 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    
    if (langText) langText.textContent = lang === 'en' ? 'EN' : 'SW';
    
    for (const [key, value] of Object.entries(t)) {
      const el = document.getElementById(key);
      if (el) {
        el.textContent = value;
      }
    }
    
    const submitBtnText = document.getElementById('submitBtnText');
    if (submitBtnText) submitBtnText.textContent = t.submitBtnText;
    
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    if (fullNameInput) fullNameInput.placeholder = t.fullNamePlaceholder;
    if (emailInput) emailInput.placeholder = t.emailPlaceholder;
    if (phoneInput) phoneInput.placeholder = t.phonePlaceholder;
    if (messageInput) messageInput.placeholder = t.messagePlaceholder;
    
    const subjectSelect = document.getElementById('subject');
    if (subjectSelect) {
      const options = subjectSelect.querySelectorAll('option');
      options.forEach(option => {
        const value = option.value;
        if (value === '') {
          option.textContent = t.selectSubject;
        } else if (value === 'general') {
          option.textContent = t.generalInquiry;
        } else if (value === 'document') {
          option.textContent = t.documentApp;
        } else if (value === 'payment') {
          option.textContent = t.paymentIssue;
        } else if (value === 'complaint') {
          option.textContent = t.complaint;
        } else if (value === 'suggestion') {
          option.textContent = t.suggestion;
        } else if (value === 'other') {
          option.textContent = t.other;
        }
      });
    }
    
    localStorage.setItem('lams_language', lang);
  }

  if (languageToggle) {
    languageToggle.addEventListener('click', () => {
      const newLang = currentLang === 'en' ? 'sw' : 'en';
      applyLanguage(newLang);
    });
  }

  applyLanguage(currentLang);

  // ==================== CONTACT FORM HANDLING ====================
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const subjectInput = document.getElementById('subject');
  const messageInput = document.getElementById('message');

  const fullNameError = document.getElementById('fullNameError');
  const emailError = document.getElementById('emailError');
  const phoneError = document.getElementById('phoneError');
  const subjectError = document.getElementById('subjectError');
  const messageError = document.getElementById('messageError');

  [fullNameInput, emailInput, phoneInput, subjectInput, messageInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        const errorElement = document.getElementById(input.id + 'Error');
        if (errorElement) errorElement.textContent = '';
      });
      input.addEventListener('change', () => {
        const errorElement = document.getElementById(input.id + 'Error');
        if (errorElement) errorElement.textContent = '';
      });
    }
  });

  // ==================== FORM SUBMISSION ====================
  let isSubmitting = false;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const t = translations[currentLang];
    
    fullNameError.textContent = '';
    emailError.textContent = '';
    phoneError.textContent = '';
    subjectError.textContent = '';
    messageError.textContent = '';

    let isValid = true;

    if (!fullNameInput.value.trim()) {
      fullNameError.textContent = t.fullNameRequired;
      isValid = false;
    } else if (fullNameInput.value.trim().length < 3) {
      fullNameError.textContent = t.fullNameMin;
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      emailError.textContent = t.emailRequired;
      isValid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      emailError.textContent = t.emailInvalid;
      isValid = false;
    }

    if (phoneInput.value.trim() && !/^[\d\s+\-()]{7,15}$/.test(phoneInput.value.trim())) {
      phoneError.textContent = t.phoneInvalid;
      isValid = false;
    }

    if (!subjectInput.value) {
      subjectError.textContent = t.subjectRequired;
      isValid = false;
    }

    if (!messageInput.value.trim()) {
      messageError.textContent = t.messageRequired;
      isValid = false;
    } else if (messageInput.value.trim().length < 10) {
      messageError.textContent = t.messageMin;
      isValid = false;
    }

    if (!isValid) {
      const firstError = document.querySelector('.error-message:not(:empty)');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const formData = {
      full_name: fullNameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      subject: subjectInput.value,
      message: messageInput.value.trim()
    };

    isSubmitting = true;
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    submitBtn.disabled = true;
    submitBtnText.textContent = t.sending;

    try {
      console.log('📨 [LAMS] Sending contact message...');
      const res = await API.public.sendContact(formData);
      console.log('📨 [LAMS] Response:', res);

      if (res.success) {
        contactForm.classList.add('hidden');
        formSuccess.classList.add('show');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        contactForm.reset();
      } else {
        if (res.message && res.message.toLowerCase().includes('too many')) {
          showToast('error', t.rateLimit);
        } else {
          showToast('error', res.message || t.errorTryAgain);
        }
      }
    } catch (error) {
      console.error('❌ [LAMS] Contact form error:', error);
      showToast('error', t.errorTryAgain);
    } finally {
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtnText.textContent = t.submitBtnText;
    }
  });

  // ==================== SEND ANOTHER ====================
  sendAnotherBtn.addEventListener('click', () => {
    contactForm.reset();
    [fullNameError, emailError, phoneError, subjectError, messageError].forEach(el => {
      if (el) el.textContent = '';
    });
    contactForm.classList.remove('hidden');
    formSuccess.classList.remove('show');
    contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // ==================== SHOW TOAST ====================
  function showToast(type, message) {
    const existing = document.querySelector('.toast-container');
    if (!existing) {
      const container = document.createElement('div');
      container.className = 'toast-container';
      container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(container);
    }
    
    const container = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    toast.style.cssText = `
      padding: 14px 22px;
      border-radius: 12px;
      color: #fff;
      font-size: 0.88rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      animation: toastIn 0.4s ease, toastOut 0.4s ease 3s forwards;
      min-width: 280px;
      background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : type === 'warning' ? '#d97706' : '#2563eb'};
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 4000);
  }

  // ==================== FAQ ACCORDION ====================
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const isActive = faqItem.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        faqItem.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ==================== SCROLL REVEAL ====================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  scrollRevealElements.forEach(el => revealObserver.observe(el));

  // ==================== STICKY NAVBAR & BACK TO TOP ====================
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ==================== SMOOTH SCROLLING ====================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === "#" || href === "#!") return;
      
      const targetElement = document.querySelector(href);
      if (targetElement) {
        e.preventDefault();
        const navHeight = document.getElementById('navbar').offsetHeight;
        window.scrollTo({
          top: targetElement.offsetTop - navHeight,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==================== INITIALIZATION ====================
  window.dispatchEvent(new Event('scroll'));

  console.log('📞 LAMS Contact Page - Initialized');
  console.log('📍 Location: Mpendae, Zanzibar');
  console.log('✅ Language:', currentLang.toUpperCase());
  console.log('✅ Connected to backend via API');
  console.log('✅ Google Maps Embed API iframe loaded');
  console.log('✅ Form submission ready');
});

// Add toast animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes toastIn {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes toastOut {
    from { opacity: 1; }
    to { opacity: 0; transform: translateY(-10px); }
  }
`;
document.head.appendChild(styleSheet);