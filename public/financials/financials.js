// Financials page
(function () {
  'use strict';

  function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  fetch('/api/financials')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data) return;

      var f = data.fields || {};

      // Page text
      if (f.financials_label) document.getElementById('finLabel').textContent = f.financials_label;
      if (f.financials_title) document.getElementById('finTitle').textContent = f.financials_title;
      document.getElementById('finIntro').innerHTML = f.financials_intro
        ? '<p>' + escHtml(f.financials_intro) + '</p>'
        : '';

      // Highlights
      var highlights = data.highlights || [];
      if (highlights.length) {
        document.getElementById('finHighlights').style.display = '';
        document.getElementById('highlightsGrid').innerHTML = highlights.map(function (h) {
          return '<div class="highlight-card fade-in">' +
            '<div class="highlight-card__value">' + escHtml(h.value) + '</div>' +
            '<div class="highlight-card__label">' + escHtml(h.label) + '</div>' +
            (h.description ? '<div class="highlight-card__desc">' + escHtml(h.description) + '</div>' : '') +
          '</div>';
        }).join('');
      }

      // Reports
      var reports = data.reports || [];
      if (reports.length) {
        document.getElementById('finReports').style.display = '';
        document.getElementById('reportsList').innerHTML = reports.map(function (r) {
          return '<div class="report-item fade-in">' +
            '<div class="report-item__icon">PDF</div>' +
            '<div class="report-item__info">' +
              '<div class="report-item__title">' + escHtml(r.title) + '</div>' +
              (r.period ? '<div class="report-item__meta">' + escHtml(r.period) + '</div>' : '') +
              (r.description ? '<div class="report-item__desc">' + escHtml(r.description) + '</div>' : '') +
            '</div>' +
            (r.file_url ? '<a class="report-item__download" href="/media/' + escHtml(r.file_url) + '" target="_blank" rel="noopener">Download</a>' : '') +
          '</div>';
        }).join('');
      }

      if (!highlights.length && !reports.length) {
        document.getElementById('finIntro').innerHTML += '<div class="financials-empty"><p>Financial information will be available soon.</p></div>';
      }

      // Scroll reveal
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            setTimeout(function () { entry.target.classList.add('visible'); }, i * 80);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      document.querySelectorAll('.fade-in').forEach(function (el) { observer.observe(el); });
    })
    .catch(function () {
      document.getElementById('finIntro').innerHTML = '<p style="color:var(--steel);">Unable to load financial data.</p>';
    });
})();
