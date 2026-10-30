/* =====================================================================
   Shawn Howard, Option C: progressive enhancement only.
   The page reads fine without this file.
   ===================================================================== */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Mobile menu: disclosure button; closes on link, Escape, resize */
  function initMenu() {
    const nav = document.querySelector('[data-nav]');
    const toggle = document.querySelector('[data-menu-toggle]');
    if (!nav || !toggle) return;
    toggle.hidden = false;

    const label = toggle.querySelector('.nav__toggle-label');
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Close' : 'Menu';
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.querySelector('.nav__list').addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* --- Gentle reveal as sections enter the viewport ----------------- */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach((el) => io.observe(el));
  }

  /* --- Inquiry form: validation + honeypot. Preview only, nothing is sent.
     At launch: request a reCAPTCHA v3 token (grecaptcha.execute), place it
     in g-recaptcha-response, POST to the endpoint and verify server-side. */
  function initInquiry() {
    const form = document.querySelector('[data-inquiry]');
    if (!form) return;
    const status = form.querySelector('[data-status]');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (form.elements.website && form.elements.website.value) return; // honeypot tripped

      let firstInvalid = null;
      form.querySelectorAll('[required]').forEach((field) => {
        const ok = field.value.trim() !== '' && field.checkValidity();
        field.setAttribute('aria-invalid', String(!ok));
        if (!ok && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        status.textContent = 'Please fill in your name, a valid email, the type of inquiry and a short description of the job.';
        firstInvalid.focus();
        return;
      }

      status.textContent = 'Thank you. This is a design preview, not connected: nothing was sent. At launch, inquiries will go straight to Shawn.';
      form.reset();
      form.querySelectorAll('[aria-invalid]').forEach((f) => f.removeAttribute('aria-invalid'));
    });

    form.addEventListener('input', (e) => {
      const f = e.target;
      if (f.getAttribute('aria-invalid') === 'true' && f.value.trim() !== '' && f.checkValidity()) {
        f.setAttribute('aria-invalid', 'false');
      }
    });
  }

  function initYear() {
    const y = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = y; });
  }

  initMenu();
  initReveal();
  initInquiry();
  initYear();
})();
