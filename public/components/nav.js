// Shared navigation component — fetches nav items from API and renders hamburger menu
(function () {
  'use strict';

  var donateUrl = 'https://link.clover.com/urlshortener/9wHqSt';
  var donateText = 'Donate Now';

  function buildNav(items) {
    var currentPath = window.location.pathname;

    var nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.innerHTML =
      '<div class="site-nav__inner">' +
        '<a href="/" class="site-nav__brand">KSP <span>Gives Back</span></a>' +
        '<button class="site-nav__hamburger" aria-label="Toggle navigation">&#9776;</button>' +
        '<ul class="site-nav__links">' +
          items.filter(function (item) { return item.visible; }).map(function (item) {
            var isActive = currentPath === item.url ||
              (item.url !== '/' && currentPath.startsWith(item.url));
            return '<li><a href="' + escHtml(item.url) + '"' + (isActive ? ' class="active"' : '') + '>' + escHtml(item.label) + '</a></li>';
          }).join('') +
          '<li><a href="' + escHtml(donateUrl) + '" class="site-nav__donate" target="_blank" rel="noopener">' + escHtml(donateText) + '</a></li>' +
        '</ul>' +
      '</div>';

    var hamburger = nav.querySelector('.site-nav__hamburger');
    var links = nav.querySelector('.site-nav__links');
    hamburger.addEventListener('click', function () {
      links.classList.toggle('open');
    });

    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });

    return nav;
  }

  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // Load donate URL from content API, then build nav
  function initNav(items) {
    fetch('/api/content')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && data.fields) {
          if (data.fields.donate_url) donateUrl = data.fields.donate_url;
          if (data.fields.donate_text) donateText = data.fields.donate_text;
        }
      })
      .catch(function () {})
      .finally(function () {
        var nav = buildNav(items);
        document.body.insertBefore(nav, document.body.firstChild);
      });
  }

  var fallbackItems = [
    { label: 'Home', url: '/', visible: 1 },
    { label: 'About', url: '/about/', visible: 1 },
    { label: 'Events', url: '/events/', visible: 1 },
    { label: 'Testimonials', url: '/testimonials/', visible: 1 },
    { label: 'Financials', url: '/financials/', visible: 1 },
    { label: 'Gallery', url: '/gallery/', visible: 1 },
    { label: 'Contact', url: '/#contact', visible: 1 },
  ];

  fetch('/api/nav')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (items) {
      initNav(items.length ? items : fallbackItems);
    })
    .catch(function () {
      initNav(fallbackItems);
    });
})();
