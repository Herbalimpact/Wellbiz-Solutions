// Loads the shared header/footer partials into every page and wires up
// the mobile nav toggle + active-link highlighting + footer year.
(function () {
  async function loadPartial(selector, url) {
    const host = document.querySelector(selector);
    if (!host) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load ' + url);
      host.innerHTML = await res.text();
    } catch (err) {
      console.error(err);
      host.innerHTML = '<p style="padding:16px;font-family:monospace;font-size:12px;">Navigation failed to load.</p>';
    }
  }

  function initHeader() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          links.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
    const current = document.body.getAttribute('data-page');
    if (current) {
      const activeLink = document.querySelector(`a[data-nav="${current}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  }

  function initFooter() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await loadPartial('#header-root', '/partials/header.html');
    initHeader();
    await loadPartial('#footer-root', '/partials/footer.html');
    initFooter();
  });
})();
