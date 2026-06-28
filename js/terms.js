// terms.js - LAMS Terms and Conditions Page
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==================== DOM REFERENCES ====================
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const agreeCheckbox = document.getElementById('agreeCheckbox');
  const acceptBtn = document.getElementById('acceptBtn');
  const declineBtn = document.getElementById('declineBtn');
  const declineModalOverlay = document.getElementById('declineModalOverlay');
  const backToTopBtn = document.getElementById('backToTop');
  const tocLinks = document.querySelectorAll('.toc-link');
  const termsSections = document.querySelectorAll('.terms-section');
  const lastUpdatedDate = document.getElementById('lastUpdatedDate');
  const toastContainer = document.getElementById('toastContainer');

  // ==================== SET LAST UPDATED DATE ====================
  const now = new Date();
  lastUpdatedDate.textContent = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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

  // ==================== TABLE OF CONTENTS ACTIVE TRACKING ====================
  function updateActiveTocLink() {
    let currentSection = '';
    const scrollPosition = window.scrollY + 120;

    termsSections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (scrollPosition >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  // Smooth scroll to section when clicking TOC links
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ==================== CHECKBOX → ENABLE ACCEPT BUTTON ====================
  agreeCheckbox.addEventListener('change', function() {
    acceptBtn.disabled = !this.checked;
  });

  // ==================== ACCEPT & CONTINUE ====================
  acceptBtn.addEventListener('click', function() {
    if (!agreeCheckbox.checked) return;

    // Save acceptance status
    localStorage.setItem('lams_terms_accepted', 'true');
    localStorage.setItem('lams_terms_accepted_date', new Date().toISOString());

    showToast('success', 'Terms accepted! Redirecting...');

    // Determine redirect URL
    setTimeout(() => {
      const referrer = document.referrer;
      const previousPage = localStorage.getItem('lams_previous_page');

      if (previousPage && previousPage !== window.location.href) {
        window.location.href = previousPage;
      } else if (referrer && !referrer.includes('terms')) {
        window.location.href = referrer;
      } else {
        // Fallback: go to registration or index
        window.location.href = 'index.html';
      }
    }, 800);
  });

  // ==================== DECLINE ====================
  declineBtn.addEventListener('click', function() {
    openDeclineModal();
  });

  function openDeclineModal() {
    declineModalOverlay.classList.add('active');
  }

  window.closeDeclineModal = function() {
    declineModalOverlay.classList.remove('active');
  };

  window.redirectToHome = function() {
    localStorage.setItem('lams_terms_accepted', 'false');
    window.location.href = 'index.html';
  };

  // Close modal on overlay click
  declineModalOverlay.addEventListener('click', function(e) {
    if (e.target === declineModalOverlay) {
      closeDeclineModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && declineModalOverlay.classList.contains('active')) {
      closeDeclineModal();
    }
  });

  // ==================== BACK TO TOP ====================
  window.addEventListener('scroll', () => {
    // Show/hide back to top button
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }

    // Update TOC active link
    updateActiveTocLink();
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ==================== STORE PREVIOUS PAGE ====================
  // Store the referring page when arriving at terms page
  if (document.referrer && !document.referrer.includes('terms')) {
    localStorage.setItem('lams_previous_page', document.referrer);
  }

  // ==================== TOAST ====================
  function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      info: 'fa-info-circle',
      warning: 'fa-exclamation-triangle'
    };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // ==================== INITIAL STATE ====================
  // Check if user already accepted terms
  const termsAccepted = localStorage.getItem('lams_terms_accepted');
  if (termsAccepted === 'true') {
    agreeCheckbox.checked = true;
    acceptBtn.disabled = false;
  }

  // Initial TOC update
  updateActiveTocLink();

  console.log('📜 LAMS Terms & Conditions - Ready');
  console.log('✅ Dark mode ready');
  console.log('✅ TOC active tracking ready');
  console.log('✅ Agreement section functional');
});