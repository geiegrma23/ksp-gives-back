(function () {
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function toParagraphs(text) {
    return text.split('\n').filter(function (p) { return p.trim(); }).map(function (p) {
      return '<p>' + esc(p) + '</p>';
    }).join('');
  }

  fetch('/api/content')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !data.fields) return;
      var f = data.fields;

      if (f.about_label) document.getElementById('aboutLabel').textContent = f.about_label;
      if (f.about_title) document.getElementById('aboutTitle').textContent = f.about_title;
      if (f.about_intro) document.getElementById('aboutIntro').textContent = f.about_intro;

      // Header image
      if (f.about_image) {
        var imgEl = document.getElementById('aboutImage');
        imgEl.innerHTML = '<img src="/media/' + esc(f.about_image) + '" alt="About KSP Gives Back">';
        imgEl.style.display = '';
      }

      // Content blocks
      if (f.about_mission_title) document.getElementById('missionTitle').textContent = f.about_mission_title;
      if (f.about_mission_text) document.getElementById('missionText').innerHTML = toParagraphs(f.about_mission_text);

      if (f.about_governance_title) document.getElementById('governanceTitle').textContent = f.about_governance_title;
      if (f.about_governance_text) document.getElementById('governanceText').innerHTML = toParagraphs(f.about_governance_text);

      if (f.about_commitment_title) document.getElementById('commitmentTitle').textContent = f.about_commitment_title;
      if (f.about_commitment_text) document.getElementById('commitmentText').innerHTML = toParagraphs(f.about_commitment_text);

      // Donate button
      var donateEl = document.getElementById('aboutDonate');
      if (donateEl) {
        if (f.donate_url) donateEl.href = f.donate_url;
        if (f.donate_text) donateEl.textContent = f.donate_text;
      }
    })
    .catch(function () { /* fallback content stays */ });

  // Scroll reveal
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function () { entry.target.classList.add('visible'); }, i * 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.fade-in').forEach(function (el) { observer.observe(el); });
})();
