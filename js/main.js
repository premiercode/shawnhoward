/* =====================================================================
   Shawn Howard — progressive enhancement
   The page is fully usable without this file. Each module is
   self-contained and guarded.
   ===================================================================== */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Header: solid background once the page scrolls ------------- */
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* --- Mobile nav: disclosure button, closes on link/Escape -------- */
  function initMobileNav() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;
    toggle.hidden = false;

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    nav.addEventListener('focusout', (e) => {
      if (nav.classList.contains('is-open') && !nav.contains(e.relatedTarget) && e.relatedTarget !== toggle) setOpen(false);
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* --- Ticker: visible pause control (WCAG 2.2.2) ----------------- */
  function initTicker() {
    const ticker = document.querySelector('[data-ticker]');
    const button = document.querySelector('[data-ticker-toggle]');
    if (!ticker || !button || prefersReducedMotion) return;
    button.hidden = false;
    button.addEventListener('click', () => {
      const paused = ticker.classList.toggle('is-paused');
      button.setAttribute('aria-pressed', String(paused));
      button.textContent = paused ? 'Play' : 'Pause';
    });
  }

  /* --- Reveal sections as they scroll into view -------------------- */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }

  /* --- Inquiry form ------------------------------------------------
     Client-side checks + honeypot. Preview only: nothing is sent.
     At launch, request a reCAPTCHA v3 token here and POST to the
     form endpoint for server-side verification.                     */
  function initInquiry() {
    const form = document.querySelector('[data-inquiry]');
    if (!form) return;
    const status = form.querySelector('[data-status]');
    const messages = {
      name: 'Enter your name.',
      email: 'Enter an email like name@example.com.',
      type: 'Choose the type of inquiry.',
      message: 'Tell us a little about the job.',
    };

    const showError = (field, text) => {
      const error = document.getElementById(field.getAttribute('aria-describedby'));
      field.setAttribute('aria-invalid', String(Boolean(text)));
      if (error) { error.textContent = text; error.hidden = !text; }
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (form.elements.website.value) return; // bot filled the honeypot

      const invalid = [];
      form.querySelectorAll('[required]').forEach((field) => {
        const ok = field.value.trim() !== '' && field.checkValidity();
        showError(field, ok ? '' : messages[field.name]);
        if (!ok) invalid.push(field);
      });
      if (invalid.length) {
        status.textContent = invalid.length === 1 ? '1 field needs attention.' : `${invalid.length} fields need attention.`;
        invalid[0].focus();
        return;
      }

      status.textContent = 'Thanks! This is a design preview, so the form isn\'t connected yet. At launch, inquiries will go straight to Shawn.';
      form.reset();
      form.querySelectorAll('[required]').forEach((f) => { showError(f, ''); f.removeAttribute('aria-invalid'); });
    });
  }

  function initYear() {
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  initHeader();
  initMobileNav();
  initTicker();
  initReveal();
  initInquiry();
  initYear();
})();
