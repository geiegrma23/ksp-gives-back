// Shared navigation component — fetches nav items from API and renders hamburger menu
(function () {
  'use strict';

  function buildNav(items) {
    const currentPath = window.location.pathname;

    const nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.innerHTML = `
      <div class="site-nav__inner">
        <a href="/" class="site-nav__brand">KSP <span>Gives Back</span></a>
        <button class="site-nav__hamburger" aria-label="Toggle navigation">&#9776;</button>
        <ul class="site-nav__links">
          ${items
            .filter(item => item.visible)
            .map(item => {
              const isActive = currentPath === item.url ||
                (item.url !== '/' && currentPath.startsWith(item.url));
              return `<li><a href="${escHtml(item.url)}"${isActive ? ' class="active"' : ''}>${escHtml(item.label)}</a></li>`;
            }).join('')}
        </ul>
      </div>
    `;

    const hamburger = nav.querySelector('.site-nav__hamburger');
    const links = nav.querySelector('.site-nav__links');
    hamburger.addEventListener('click', () => {
      links.classList.toggle('open');
    });

    // Close menu on link click (mobile)
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });

    return nav;
  }

  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // Fetch nav items and inject
  fetch('/api/nav')
    .then(r => r.ok ? r.json() : [])
    .then(items => {
      if (!items.length) {
        // Fallback nav if API fails
        items = [
          { label: 'Home', url: '/', visible: 1 },
          { label: 'Events', url: '/events/', visible: 1 },
          { label: 'Testimonials', url: '/testimonials/', visible: 1 },
          { label: 'Financials', url: '/financials/', visible: 1 },
          { label: 'Gallery', url: '/gallery/', visible: 1 },
          { label: 'Contact', url: '/#contact', visible: 1 },
        ];
      }
      const nav = buildNav(items);
      document.body.insertBefore(nav, document.body.firstChild);
    })
    .catch(() => {
      // Fallback on error
      const nav = buildNav([
        { label: 'Home', url: '/', visible: 1 },
        { label: 'Events', url: '/events/', visible: 1 },
        { label: 'Testimonials', url: '/testimonials/', visible: 1 },
        { label: 'Financials', url: '/financials/', visible: 1 },
        { label: 'Contact', url: '/#contact', visible: 1 },
      ]);
      document.body.insertBefore(nav, document.body.firstChild);
    });
})();
