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

  // GoatCounter analytics. Loaded here (as a dynamically-created element)
  // rather than as a <script> tag inside the header/footer partials, since
  // tags injected via innerHTML never execute in the browser.
  function loadAnalytics() {
    const s = document.createElement('script');
    s.async = true;
    s.src = '//gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', 'https://wellbizsolutions.goatcounter.com/count');
    document.body.appendChild(s);
  }

  // Our own ads (products & services) from /assets/data/products.json.
  function loadAds() {
    const s = document.createElement('script');
    s.src = '/js/ads.js';
    s.defer = true;
    document.body.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    loadAnalytics();
    loadAds();
    await loadPartial('#header-root', '/partials/header.html');
    initHeader();
    await loadPartial('#footer-root', '/partials/footer.html');
    initFooter();
  });

  // Newsletter sign-up (Brevo). Delegated so it works on the footer that is
  // injected via innerHTML. Posts to Brevo's form endpoint and shows the
  // result inline, without leaving the page.
  document.addEventListener('submit', async function (e) {
    const form = e.target.closest && e.target.closest('.wb-nl-form');
    if (!form) return;
    e.preventDefault();
    const msg = form.querySelector('.wb-nl-msg');
    const email = form.querySelector('input[name="EMAIL"]');
    const btn = form.querySelector('button[type="submit"]');
    msg.className = 'wb-nl-msg';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      msg.textContent = 'Please enter a valid email address. / Tafadhali andika barua pepe sahihi.';
      msg.classList.add('err');
      email.focus();
      return;
    }
    btn.disabled = true;
    try {
      await fetch(form.action, { method: 'POST', mode: 'no-cors', body: new FormData(form) });
      msg.textContent = "Thank you! You're subscribed. / Asante! Umejiunga.";
      msg.classList.add('ok');
      form.reset();
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: 'newsletter-signup', title: 'Newsletter sign-up', event: true });
      }
    } catch (err) {
      msg.textContent = 'Something went wrong. Please try again. / Jaribu tena.';
      msg.classList.add('err');
    } finally {
      btn.disabled = false;
    }
  });
})();
