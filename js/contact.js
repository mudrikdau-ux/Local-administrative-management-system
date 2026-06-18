// contact.js

document.addEventListener('DOMContentLoaded', () => {
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

  // Set current year in footer
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ==================== BACKGROUND IMAGE MANAGEMENT ====================
  // Background images are set via JavaScript, NOT in CSS
  function setPageHeaderBackground() {
    if (pageHeader) {
      const headerBgUrl = 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';
      pageHeader.style.backgroundImage = `url('${headerBgUrl}')`;
      pageHeader.style.backgroundSize = 'cover';
      pageHeader.style.backgroundPosition = 'center';
      pageHeader.style.backgroundRepeat = 'no-repeat';
      pageHeader.style.position = 'relative';
      
      // Add overlay
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
      
      // Make text white for readability
      const h1 = pageHeader.querySelector('h1');
      const p = pageHeader.querySelector('p');
      if (h1) h1.style.color = '#fff';
      if (p) p.style.color = 'rgba(255,255,255,0.9)';
    }
  }

  function setMapBackground() {
    if (mapContainer) {
      // Zanzibar Mpendae coordinates
      // Mpendae is located in Zanzibar Urban/West Region
      // Coordinates: approximately -6.1659° S, 39.2026° E
      const mpendaeLat = -6.1659;
      const mpendaeLng = 39.2026;
      const zoomLevel = 16;
      
      mapContainer.innerHTML = `
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.6200!2d${mpendaeLng}!3d${mpendaeLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c4bae169bd6f1%3A0x4e3dfcf3a2c5c9e1!2sMpendae%2C%20Zanzibar%2C%20Tanzania!5e0!3m2!1sen!2stz!4v1680000000000"
          width="100%"
          height="100%"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="LAMS Office Location - Mpendae, Zanzibar">
        </iframe>
      `;
      
      // Also update the office location text to reflect Zanzibar Mpendae
      const locationInfoDiv = document.querySelector('.location-info');
      if (locationInfoDiv) {
        const paragraphs = locationInfoDiv.querySelectorAll('p');
        if (paragraphs.length >= 2) {
          paragraphs[0].textContent = 'Mpendae Area, Zanzibar Urban/West Region';
          paragraphs[1].textContent = 'Zanzibar, Tanzania';
        }
      }
      
      // Update office name
      const officeNameEl = document.getElementById('officeName');
      if (officeNameEl) {
        officeNameEl.textContent = 'LAMS Office - Mpendae, Zanzibar';
      }
    }
  }

  // Initialize backgrounds
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

  // ==================== LANGUAGE TOGGLE (English/Swahili) ====================
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
      submitBtn: '<i class="fas fa-paper-plane"></i> Send Message',
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
      ctaMessageBtn: '<i class="fas fa-paper-plane"></i> Send Message',
      ctaLoginBtn: '<i class="fas fa-sign-in-alt"></i> Login',
      footerDesc: 'Modernizing local administration for better community service delivery.',
      quickLinksTitle: 'Quick Links',
      contactInfoFooterTitle: 'Contact Info',
      footerRights: 'Local Administration Management System. All Rights Reserved.',
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
      messageMin: 'Message must be at least 10 characters'
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
      submitBtn: '<i class="fas fa-paper-plane"></i> Tuma Ujumbe',
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
      ctaMessageBtn: '<i class="fas fa-paper-plane"></i> Tuma Ujumbe',
      ctaLoginBtn: '<i class="fas fa-sign-in-alt"></i> Ingia',
      footerDesc: 'Kuboresha utawala wa mtaa kwa utoaji bora wa huduma za jamii.',
      quickLinksTitle: 'Viungo vya Haraka',
      contactInfoFooterTitle: 'Mawasiliano',
      footerRights: 'Mfumo wa Usimamizi wa Utawala wa Mtaa. Haki Zote Zimehifadhiwa.',
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
      messageMin: 'Ujumbe lazima uwe na herufi angalau 10'
    }
  };

  let currentLang = localStorage.getItem('lams_language') || 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    
    if (langText) langText.textContent = lang === 'en' ? 'EN' : 'SW';
    
    // Apply translations to all elements with IDs matching translation keys
    for (const [key, value] of Object.entries(t)) {
      const el = document.getElementById(key);
      if (el) {
        if (key === 'submitBtn' || key === 'ctaMessageBtn' || key === 'ctaLoginBtn') {
          el.innerHTML = value;
        } else {
          el.textContent = value;
        }
      }
    }
    
    // Update placeholders
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    if (fullNameInput) fullNameInput.placeholder = t.fullNamePlaceholder;
    if (emailInput) emailInput.placeholder = t.emailPlaceholder;
    if (phoneInput) phoneInput.placeholder = t.phonePlaceholder;
    if (messageInput) messageInput.placeholder = t.messagePlaceholder;
    
    // Update subject select options
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

  // Apply saved language on load
  applyLanguage(currentLang);

  // ==================== CONTACT FORM VALIDATION & SUBMISSION ====================
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

  // Clear error messages on input
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

  // ==================== ADMIN INBOX INTEGRATION ====================
  function saveMessageToAdminInbox(messageData) {
    // Get existing messages from localStorage
    let inboxMessages = [];
    const storedMessages = localStorage.getItem('lams_admin_inbox');
    if (storedMessages) {
      try {
        inboxMessages = JSON.parse(storedMessages);
      } catch (e) {
        console.warn('Failed to parse existing inbox messages:', e);
        inboxMessages = [];
      }
    }

    // Create new message object
    const newMessage = {
      id: Date.now(),
      ...messageData,
      status: 'unread',
      receivedAt: new Date().toISOString(),
      repliedAt: null,
      replyMessage: null
    };

    // Add to beginning of array (newest first)
    inboxMessages.unshift(newMessage);

    // Save back to localStorage
    localStorage.setItem('lams_admin_inbox', JSON.stringify(inboxMessages));

    // Dispatch custom event for real-time updates (if admin panel is open)
    window.dispatchEvent(new CustomEvent('lamsNewMessage', { 
      detail: { message: newMessage } 
    }));

    // Also store in session storage for same-session access
    sessionStorage.setItem('lams_admin_inbox', JSON.stringify(inboxMessages));

    console.log('✅ Message saved to Admin Inbox:', newMessage.id);
    return newMessage;
  }

  // Form submission
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const t = translations[currentLang];
    
    // Reset all error messages
    fullNameError.textContent = '';
    emailError.textContent = '';
    phoneError.textContent = '';
    subjectError.textContent = '';
    messageError.textContent = '';

    let isValid = true;

    // Validate Full Name
    if (!fullNameInput.value.trim()) {
      fullNameError.textContent = t.fullNameRequired;
      isValid = false;
    } else if (fullNameInput.value.trim().length < 3) {
      fullNameError.textContent = t.fullNameMin;
      isValid = false;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      emailError.textContent = t.emailRequired;
      isValid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      emailError.textContent = t.emailInvalid;
      isValid = false;
    }

    // Validate Phone (optional but must be valid if provided)
    if (phoneInput.value.trim() && !/^[\d\s+\-()]{7,15}$/.test(phoneInput.value.trim())) {
      phoneError.textContent = t.phoneInvalid;
      isValid = false;
    }

    // Validate Subject
    if (!subjectInput.value) {
      subjectError.textContent = t.subjectRequired;
      isValid = false;
    }

    // Validate Message
    if (!messageInput.value.trim()) {
      messageError.textContent = t.messageRequired;
      isValid = false;
    } else if (messageInput.value.trim().length < 10) {
      messageError.textContent = t.messageMin;
      isValid = false;
    }

    // If valid, save to admin inbox and show success
    if (isValid) {
      const messageData = {
        fullName: fullNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        subject: subjectInput.value,
        subjectLabel: subjectInput.options[subjectInput.selectedIndex]?.text || subjectInput.value,
        message: messageInput.value.trim(),
        language: currentLang,
        location: 'Mpendae, Zanzibar'
      };

      // Save to Admin Inbox
      saveMessageToAdminInbox(messageData);

      // Hide the form
      contactForm.classList.add('hidden');
      // Show success message
      formSuccess.classList.add('show');
      // Scroll to success message
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Log for debugging
      console.log('📩 Contact form submitted and saved to admin inbox:', messageData);
    } else {
      // Scroll to the first error
      const firstError = document.querySelector('.error-message:not(:empty)');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  // Send Another Message button
  sendAnotherBtn.addEventListener('click', () => {
    contactForm.reset();
    [fullNameError, emailError, phoneError, subjectError, messageError].forEach(el => {
      if (el) el.textContent = '';
    });
    contactForm.classList.remove('hidden');
    formSuccess.classList.remove('show');
    contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

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

  // ==================== SCROLL REVEAL ANIMATION ====================
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
  console.log('✅ Admin inbox integration ready');
  console.log('✅ Background images managed via JavaScript');
  console.log('✅ Form validation active');
});