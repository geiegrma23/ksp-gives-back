// Shared homepage hydration — applies /api/content data to the DOM.
// Used on page load and re-invoked by live-preview.js while editing in the CMS.
(function () {
  'use strict';

  function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  window.__mqvApply = function (data) {
    if (!data) return;
    window.__kspContent = data;
    var f = data.fields || {};

    // Singleton text fields
    document.querySelectorAll('[data-content]').forEach(function (el) {
      var key = el.getAttribute('data-content');
      if (f[key]) el.textContent = f[key];
    });

    // Href links
    document.querySelectorAll('[data-href]').forEach(function (el) {
      var key = el.getAttribute('data-href');
      if (f[key]) el.href = f[key];
    });

    // Mission cards
    var missionGrid = document.querySelector('[data-collection="mission_cards"]');
    if (missionGrid && data.mission_cards && data.mission_cards.length) {
      missionGrid.innerHTML = data.mission_cards.map(function (c) {
        return '<div class="mission-card fade-in visible">' +
          '<h3>' + escHtml(c.title) + '</h3>' +
          '<p>' + escHtml(c.body) + '</p></div>';
      }).join('');
    }

    // Values
    var valuesList = document.querySelector('[data-collection="values_items"]');
    if (valuesList && data.values_items && data.values_items.length) {
      valuesList.innerHTML = data.values_items.map(function (v) {
        return '<div class="value-item fade-in visible">' +
          '<h4>' + escHtml(v.title) + '</h4>' +
          '<p>' + escHtml(v.description) + '</p></div>';
      }).join('');
    }

    // Goals
    var goalsGrid = document.querySelector('[data-collection="goals"]');
    if (goalsGrid && data.goals && data.goals.length) {
      goalsGrid.innerHTML = data.goals.map(function (g) {
        return '<div class="goal-card fade-in visible">' +
          '<div class="goal-number">' + escHtml(g.number) + '</div>' +
          '<div><h4>' + escHtml(g.title) + '</h4>' +
          '<p>' + escHtml(g.description) + '</p></div></div>';
      }).join('');
    }

    // Hero goals
    var heroGoalsList = document.querySelector('[data-collection="hero_goals"]');
    if (heroGoalsList && data.hero_goals && data.hero_goals.length) {
      document.getElementById('heroGoals').style.display = '';
      heroGoalsList.innerHTML = data.hero_goals.map(function (g) {
        return '<li>' + escHtml(g.text) + '</li>';
      }).join('');
    }

    // Hero background image
    if (f.hero_bg_image) {
      var hero = document.getElementById('hero');
      var bgUrl = f.hero_bg_image.startsWith('http') ? f.hero_bg_image : '/media/' + f.hero_bg_image;
      hero.style.backgroundImage = 'url(' + bgUrl + ')';
      hero.classList.add('hero--has-bg');
    }

    // Hero video embed (idempotent: replace any previous embed)
    if (f.hero_video_embed) {
      var heroEl = document.getElementById('hero');
      var prev = heroEl.querySelector('.hero__video-bg');
      if (prev) prev.remove();
      var videoDiv = document.createElement('div');
      videoDiv.className = 'hero__video-bg';
      videoDiv.innerHTML = f.hero_video_embed;
      heroEl.insertBefore(videoDiv, heroEl.firstChild);
    }

    // Donate buttons
    if (f.donate_url) {
      document.querySelectorAll('#heroDonate, #bannerDonate').forEach(function (el) { el.href = f.donate_url; });
    }
    if (f.donate_text) {
      document.querySelectorAll('#heroDonate, #bannerDonate').forEach(function (el) { el.textContent = f.donate_text; });
    }

    // Dynamic links
    if (f.contact_email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
        if (!a.hasAttribute('data-href')) a.href = 'mailto:' + f.contact_email;
      });
    }
    if (f.contact_phone) {
      document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
        a.href = 'tel:' + f.contact_phone.replace(/[^+\d]/g, '');
      });
    }
  };
})();
