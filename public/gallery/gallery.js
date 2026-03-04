// Gallery page — displays all uploaded images with lightbox slideshow
(function () {
  'use strict';

  var grid = document.getElementById('galleryGrid');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var images = [];
  var currentIndex = 0;

  function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // Fetch all media (public images only)
  fetch('/api/media/public')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (items) {
      images = items.filter(function (m) {
        return m.content_type && m.content_type.startsWith('image/');
      });

      if (!images.length) {
        grid.innerHTML = '<div class="gallery-empty"><p>No photos yet. Check back soon!</p></div>';
        return;
      }

      grid.innerHTML = images.map(function (m, i) {
        var name = m.filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        return '<div class="gallery-item fade-in" data-gallery-idx="' + i + '">' +
          '<img src="/media/' + escHtml(m.key) + '" alt="' + escHtml(name) + '" loading="lazy">' +
          '<div class="gallery-item__overlay">' +
            '<div class="gallery-item__name">' + escHtml(name) + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      // Click to open lightbox
      grid.querySelectorAll('[data-gallery-idx]').forEach(function (item) {
        item.addEventListener('click', function () {
          currentIndex = parseInt(item.dataset.galleryIdx, 10);
          showLightbox();
        });
      });

      // Scroll reveal
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            setTimeout(function () { entry.target.classList.add('visible'); }, i * 50);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      document.querySelectorAll('.fade-in').forEach(function (el) { observer.observe(el); });
    })
    .catch(function () {
      grid.innerHTML = '<div class="gallery-empty"><p>Unable to load gallery.</p></div>';
    });

  // Lightbox
  function showLightbox() {
    if (!images.length) return;
    var img = images[currentIndex];
    lightboxImg.src = '/media/' + img.key;
    lightboxCaption.textContent = img.filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    lightbox.style.display = '';
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    showLightbox();
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showLightbox();
  }

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxNext').addEventListener('click', nextImage);
  document.getElementById('lightboxPrev').addEventListener('click', prevImage);

  // Click background to close
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard nav
  document.addEventListener('keydown', function (e) {
    if (lightbox.style.display === 'none') return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });
})();
