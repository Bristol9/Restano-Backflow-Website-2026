(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('open', !isOpen);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
      });
    });

    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target) && !menuButton.contains(event.target)) {
        menuButton.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
      }
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  document.querySelectorAll('#year').forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });

  const consentKey = 'restano-cookie-preferences-v1';
  let lastFocusedElement = null;

  const consentMarkup = `
    <aside class="cookie-banner" role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-description" hidden>
      <div class="cookie-banner-copy">
        <span class="cookie-label">Privacy choice</span>
        <h2 id="cookie-title">A simple cookie notice</h2>
        <p id="cookie-description">This site uses essential browser storage to remember your choice. No analytics or advertising cookies are currently active.</p>
        <a href="cookie-policy.html">Read the cookie policy</a>
      </div>
      <div class="cookie-banner-actions">
        <button class="button button-cookie-secondary" type="button" data-cookie-essential>Use essential only</button>
        <button class="button button-primary" type="button" data-cookie-accept>Accept</button>
        <button class="cookie-manage-link" type="button" data-cookie-manage>Manage choices</button>
      </div>
    </aside>
    <div class="cookie-modal-backdrop" hidden>
      <section class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title">
        <button class="cookie-modal-close" type="button" aria-label="Close cookie settings" data-cookie-close>×</button>
        <span class="cookie-label">Privacy controls</span>
        <h2 id="cookie-settings-title">Cookie settings</h2>
        <p>This website currently uses essential storage only. Optional categories are listed so the preference panel is ready if site features change later.</p>
        <div class="cookie-option">
          <div><strong>Essential</strong><small>Required to remember your preference and operate the website.</small></div>
          <span class="cookie-required">Always on</span>
        </div>
        <label class="cookie-option cookie-option-disabled">
          <div><strong>Analytics</strong><small>Not currently installed or used.</small></div>
          <input type="checkbox" data-cookie-analytics disabled>
          <span class="cookie-switch" aria-hidden="true"></span>
        </label>
        <label class="cookie-option cookie-option-disabled">
          <div><strong>Marketing</strong><small>Not currently installed or used.</small></div>
          <input type="checkbox" data-cookie-marketing disabled>
          <span class="cookie-switch" aria-hidden="true"></span>
        </label>
        <div class="cookie-modal-actions">
          <button class="button button-cookie-secondary" type="button" data-cookie-save-essential>Use essential only</button>
          <button class="button button-primary" type="button" data-cookie-save>Save settings</button>
        </div>
      </section>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', consentMarkup);

  const banner = document.querySelector('.cookie-banner');
  const backdrop = document.querySelector('.cookie-modal-backdrop');
  const modal = document.querySelector('.cookie-modal');

  const readConsent = () => {
    try {
      return JSON.parse(localStorage.getItem(consentKey));
    } catch {
      return null;
    }
  };

  const saveConsent = (source) => {
    try {
      localStorage.setItem(consentKey, JSON.stringify({
        essential: true,
        analytics: false,
        marketing: false,
        source,
        updatedAt: new Date().toISOString()
      }));
    } catch {
      // The site continues to function when browser storage is unavailable.
    }
    banner.hidden = true;
    closePreferences();
  };

  const openPreferences = () => {
    lastFocusedElement = document.activeElement;
    backdrop.hidden = false;
    document.body.classList.add('cookie-modal-open');
    window.requestAnimationFrame(() => backdrop.classList.add('is-open'));
    modal.querySelector('[data-cookie-close]').focus();
  };

  const closePreferences = () => {
    if (backdrop.hidden) return;
    backdrop.classList.remove('is-open');
    document.body.classList.remove('cookie-modal-open');
    window.setTimeout(() => {
      backdrop.hidden = true;
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }, 180);
  };

  if (!readConsent()) {
    window.setTimeout(() => {
      banner.hidden = false;
      window.requestAnimationFrame(() => banner.classList.add('is-visible'));
    }, 550);
  }

  document.querySelectorAll('[data-cookie-settings]').forEach((button) => {
    button.addEventListener('click', openPreferences);
  });
  document.querySelector('[data-cookie-manage]').addEventListener('click', openPreferences);
  document.querySelector('[data-cookie-accept]').addEventListener('click', () => saveConsent('accepted'));
  document.querySelector('[data-cookie-essential]').addEventListener('click', () => saveConsent('essential-only'));
  document.querySelector('[data-cookie-save]').addEventListener('click', () => saveConsent('saved-settings'));
  document.querySelector('[data-cookie-save-essential]').addEventListener('click', () => saveConsent('essential-only'));
  document.querySelector('[data-cookie-close]').addEventListener('click', closePreferences);

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closePreferences();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !backdrop.hidden) closePreferences();
  });
})();
