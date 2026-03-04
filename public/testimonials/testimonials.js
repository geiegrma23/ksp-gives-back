// Testimonials page
(function () {
  'use strict';

  var grid = document.getElementById('testimonialsGrid');

  function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  fetch('/api/testimonials')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (items) {
      if (!items.length) {
        grid.innerHTML = '<div class="testimonials-empty"><p>No testimonials yet. Check back soon!</p></div>';
        return;
      }

      grid.innerHTML = items.map(function (t) {
        var photoHtml;
        if (t.image_url) {
          photoHtml = '<img class="testimonial-page-card__photo" src="/media/' + escHtml(t.image_url) + '" alt="' + escHtml(t.name) + '">';
        } else {
          var initials = t.name.split(' ').map(function (w) { return w[0]; }).join('').toUpperCase().substring(0, 2);
          photoHtml = '<div class="testimonial-page-card__photo-placeholder">' + escHtml(initials) + '</div>';
        }

        return '<div class="testimonial-page-card fade-in">' +
          '<div class="testimonial-page-card__quote">' + escHtml(t.quote) + '</div>' +
          '<div class="testimonial-page-card__author">' +
            photoHtml +
            '<div>' +
              '<div class="testimonial-page-card__name">' + escHtml(t.name) + '</div>' +
              (t.role ? '<div class="testimonial-page-card__role">' + escHtml(t.role) + '</div>' : '') +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');

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
      grid.innerHTML = '<div class="testimonials-empty"><p>Unable to load testimonials.</p></div>';
    });
})();
