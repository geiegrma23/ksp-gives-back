// Shared footer component — renders site footer with dynamic content
(function () {
  'use strict';

  function buildFooter(fields) {
    var f = fields || {};
    var footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML =
      '<div class="footer-stars">\u2605 \u2605 \u2605 \u2605 \u2605</div>' +
      '<p>' + escHtml(f.footer_copyright || '\u00A9 2025 KSP Gives Back \u2014 All Rights Reserved.') + '</p>' +
      '<p style="margin-top:0.4rem;font-size:0.8rem;color:rgba(138,155,176,0.6);">' +
        escHtml(f.footer_parent_text || 'A philanthropic program of') + ' ' +
        '<a href="' + escHtml(f.footer_parent_link || 'https://kspfulfillment.com') + '" target="_blank" rel="noopener">' +
        escHtml(f.footer_parent_name || 'KSP Technologies') + '</a>' +
      '</p>' +
      '<div class="site-footer__links">' +
        '<a href="/">Home</a>' +
        '<a href="/events/">Events</a>' +
        '<a href="/testimonials/">Testimonials</a>' +
        '<a href="/financials/">Financials</a>' +
      '</div>';
    return footer;
  }

  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // Try to use globally cached content data, otherwise fetch
  function getFields() {
    if (window.__kspContent && window.__kspContent.fields) {
      return Promise.resolve(window.__kspContent.fields);
    }
    return fetch('/api/content')
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (data) { return data.fields || {}; })
      .catch(function () { return {}; });
  }

  getFields().then(function (fields) {
    document.body.appendChild(buildFooter(fields));
  });
})();
