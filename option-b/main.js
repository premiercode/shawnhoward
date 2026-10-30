/* =====================================================================
   Shawn Howard — Option B: progressive enhancement
   The page is fully readable without this file. Each module is guarded.
   ===================================================================== */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --- Masthead: solid once the page scrolls ----------------------- */
  function initMasthead() {
    const header = document.querySelector('[data-header]');
    if (!header) return;
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* --- Mobile menu: full-screen title card, Escape + focus loop ---- */
  function initMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-nav]');
    const label = document.querySelector('[data-menu-label]');
    if (!toggle || !nav) return;
    toggle.hidden = false;
    const mobile = window.matchMedia('(max-width: 900px)');

    const isOpen = () => nav.classList.contains('is-open');
    const setOpen = (open, returnFocus = false) => {
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
      if (label) label.textContent = open ? 'Close' : 'Menu';
      if (open) nav.querySelector('a')?.focus();
      else if (returnFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => setOpen(!isOpen()));
    nav.addEventListener('click', (e) => { if (e.target.closest('a') && isOpen()) setOpen(false); });

    document.addEventListener('keydown', (e) => {
      if (!isOpen()) return;
      if (e.key === 'Escape') { setOpen(false, true); return; }
      if (e.key !== 'Tab') return;
      // Keep focus inside the open menu (toggle + links)
      const items = [toggle, ...nav.querySelectorAll('a')];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    mobile.addEventListener('change', (e) => { if (!e.matches && isOpen()) setOpen(false); });
  }

  /* --- Active section marker in the nav --------------------------- */
  function initScrollSpy() {
    const links = [...document.querySelectorAll('.nav a[href^="#"]')];
    const map = new Map();
    links.forEach((a) => {
      const el = document.querySelector(a.getAttribute('href'));
      if (el) map.set(el, a);
    });
    if (!map.size || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.removeAttribute('aria-current'));
        map.get(entry.target)?.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, el) => io.observe(el));
  }

  /* --- Scroll reveals --------------------------------------------- */
  function initReveals() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    // Stagger siblings that share a parent (venues, services, etc.)
    els.forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      const i = sibs.indexOf(el);
      if (i > 0) el.style.setProperty('--d', `${Math.min(i, 4) * 90}ms`);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  }

  /* --- End-credit roll: seamless loop + pause control -------------- */
  function initRoll() {
    const roll = document.querySelector('[data-roll]');
    if (!roll) return;
    const track = roll.querySelector('[data-roll-track]');
    const list = track?.querySelector('.roll__list');
    const btn = roll.querySelector('[data-roll-toggle]');
    const label = roll.querySelector('[data-roll-label]');
    if (!track || !list || !btn) return;

    const measure = () => track.style.setProperty('--roll-h', `${list.offsetHeight}px`);

    const sync = () => {
      // Under reduced motion the credits are a static list: no control needed
      btn.hidden = reduceMotion.matches;
      if (!reduceMotion.matches) measure();
    };
    sync();
    reduceMotion.addEventListener('change', sync);
    window.addEventListener('resize', measure, { passive: true });
    document.fonts?.ready.then(measure);

    btn.addEventListener('click', () => {
      const paused = roll.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', String(paused));
      btn.querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause');
      label.textContent = paused ? 'Play credits' : 'Pause credits';
    });
  }

  /* --- Inquiry form: preview only ---------------------------------- */
  function initForm() {
    const form = document.querySelector('[data-inquiry]');
    const status = form?.querySelector('[data-status]');
    if (!form || !status) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.classList.remove('is-error');

      // Honeypot: a filled "website" field means a bot. Pretend success.
      if (form.elements.website && form.elements.website.value.trim() !== '') {
        status.textContent = 'Thanks. This is a design preview, so the form is not connected yet.';
        return;
      }

      const required = [...form.querySelectorAll('[required]')];
      required.forEach((f) => f.setAttribute('aria-invalid', String(!f.checkValidity())));
      const firstBad = required.find((f) => !f.checkValidity());
      if (firstBad) {
        status.classList.add('is-error');
        status.textContent = 'Please complete your name, a valid email, the type of inquiry and a short message.';
        firstBad.focus();
        return;
      }

      // PLACEHOLDER: grecaptcha.execute(SITE_KEY, { action: 'inquiry' }) -> set g-recaptcha-response -> POST
      status.textContent = 'Thanks. This is a design preview, not connected yet, so nothing was sent.';
    });

    form.addEventListener('input', (e) => {
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }

  function initYear() {
    const y = document.querySelector('[data-year]');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  initMasthead();
  initMenu();
  initScrollSpy();
  initReveals();
  initRoll();
  initForm();
  initYear();
})();
