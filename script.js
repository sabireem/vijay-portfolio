/* ═══════════════════════════════════════════════════════
   Obsidian Terminal — Portfolio JS
   Spring-physics animations, IntersectionObserver reveals,
   theme persistence, typing effect, form UX.
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── DOM REFS ───
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const loader      = $('#loader');
  const navbar      = $('#navbar');
  const navLinks    = $('#navLinks');
  const hamburger   = $('#hamburger');
  const themeToggle = $('#themeToggle');
  const themeIcon   = $('#themeIcon');
  const typingEl    = $('#typingText');
  const backToTop   = $('#backToTop');
  const contactForm = $('#contactForm');

  // ─── REDUCED MOTION CHECK (Vercel §Animation) ───
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ─── LOADER ───
  window.addEventListener('load', () => {
    const delay = prefersReducedMotion.matches ? 100 : 800;
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => { loader.style.display = 'none'; }, 600);
    }, delay);
  });

  // ─── THEME TOGGLE ───
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    themeIcon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    // Vercel: <meta name="theme-color"> should match background
    const metaTheme = $('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#1A1A1A' : '#FFFDF7');
    }
  }

  const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
  setTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ─── NAVBAR SCROLL ───
  // Vercel: debounce/throttle high-frequency events
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const sy = window.scrollY;
        navbar.classList.toggle('scrolled', sy > 40);
        backToTop.classList.toggle('visible', sy > 500);
        highlightNav();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ─── ACTIVE NAV LINK ───
  const sections = $$('section[id]');
  function highlightNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      const link = $(`a[href="#${id}"]`, navLinks);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      }
    });
  }

  // ─── HAMBURGER ───
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  $$('a', navLinks).forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // ─── TYPING EFFECT ───
  const phrases = [
    'Senior Data Analyst',
    'Data Engineering Expert',
    'ML & Forecasting Specialist',
    'BI Dashboard Architect',
    'Cloud Data Pipeline Builder',
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    if (prefersReducedMotion.matches) {
      // Static display for reduced motion
      typingEl.textContent = phrases[0];
      return;
    }

    const current = phrases[phraseIndex];
    let speed;

    if (isDeleting) {
      typingEl.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      speed = 35;
    } else {
      typingEl.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      speed = 70;
    }

    if (!isDeleting && charIndex === current.length) {
      speed = 2200; // pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      speed = 500;
    }

    setTimeout(typeEffect, speed);
  }
  typeEffect();

  // ─── SCROLL REVEAL (IntersectionObserver) ───
  const revealElements = $$('.reveal-up');

  if (!prefersReducedMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  // ─── SKILL BARS (animate on scroll into view) ───
  const skillCategories = $$('.skills__category');

  function initSkillBars() {
    $$('.skill-bar').forEach((bar) => {
      const level = bar.getAttribute('data-level');
      bar.style.setProperty('--fill', level + '%');
    });
  }

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // ui-ux-pro-max §7: stagger 30-50ms per item
          const bars = $$('.skill-bar', entry.target);
          bars.forEach((bar, i) => {
            setTimeout(() => bar.classList.add('animated'), i * 120);
          });
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  skillCategories.forEach((cat) => skillObserver.observe(cat));
  initSkillBars();

  // ─── BACK TO TOP ───
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ─── SMOOTH SCROLL (Vercel: links use proper navigation) ───
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      const target = $(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        // Update URL without page jump (Vercel: URL reflects state)
        history.pushState(null, '', href);
      }
    });
  });

  // ─── CONTACT FORM ───
  // Vercel: inline validation, focus first error on submit, errors include fix
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name    = $('#contactName');
    const email   = $('#contactEmail');
    const message = $('#contactMessage');
    const nameErr = $('#nameError');
    const emailErr = $('#emailError');
    const msgErr  = $('#messageError');

    // Reset errors
    [nameErr, emailErr, msgErr].forEach((el) => (el.textContent = ''));
    [name, email, message].forEach((el) => (el.style.borderColor = ''));

    // Validate name
    if (!name.value.trim()) {
      nameErr.textContent = 'Name is required. Please enter your full name.';
      name.style.borderColor = 'var(--danger)';
      valid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      emailErr.textContent = 'Email is required. Enter a valid email address.';
      email.style.borderColor = 'var(--danger)';
      valid = false;
    } else if (!emailRegex.test(email.value)) {
      emailErr.textContent = 'Invalid format. Try: you@example.com';
      email.style.borderColor = 'var(--danger)';
      valid = false;
    }

    // Validate message
    if (!message.value.trim()) {
      msgErr.textContent = 'Message is required. Write a few lines.';
      message.style.borderColor = 'var(--danger)';
      valid = false;
    }

    if (valid) {
      const btn = $('button[type="submit"]', contactForm);
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message Sent!';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        btn.style.opacity = '';
        contactForm.reset();
      }, 3000);
    } else {
      // Vercel: focus first error on submit
      const firstInvalid = contactForm.querySelector('[style*="border-color"]');
      if (firstInvalid) firstInvalid.focus();
    }
  });

  // ─── STAGGER DELAYS for grid children ───
  // ui-ux-pro-max §7: stagger list/grid items 30-50ms
  function addStaggerDelays(selector, baseDelayMs) {
    $$(selector).forEach((el, i) => {
      el.style.transitionDelay = `${baseDelayMs + i * 50}ms`;
    });
  }
  addStaggerDelays('.project-card', 0);
  addStaggerDelays('.cert-card', 0);
  addStaggerDelays('.skills__category', 0);

  // ─── INITIAL SCROLL CHECK ───
  onScroll();

})();
