// Payload Live Preview bridge — active only when the homepage is loaded inside
// the CMS admin's preview iframe (?lp=1). Receives draft Site Content data as
// the editor types and re-applies it via window.__mqvApply.
(async function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  if (!params.has('lp') || window.parent === window) return;

  var CMS = 'https://cms.mnquietvalor.com';

  // Map the raw site-content global doc to the legacy fields shape
  function mapGlobal(doc) {
    var skip = { id: 1, createdAt: 1, updatedAt: 1, globalType: 1, hero_bg: 1, about_img: 1 };
    var fields = {};
    Object.keys(doc || {}).forEach(function (k) {
      if (!skip[k] && typeof doc[k] === 'string') fields[k] = doc[k];
    });
    if (doc && doc.hero_bg && typeof doc.hero_bg === 'object' && doc.hero_bg.filename) {
      fields.hero_bg_image = doc.hero_bg.filename;
    }
    return fields;
  }

  try {
    var mod = await import('/vendor/payload-live-preview.js');
    if (typeof mod.ready === 'function') mod.ready({ serverURL: CMS });
    mod.subscribe({
      serverURL: CMS,
      depth: 1,
      initialData: (window.__kspContent && window.__kspContent.fields) || {},
      callback: function (doc) {
        if (window.__mqvApply) window.__mqvApply({ fields: mapGlobal(doc) });
      },
    });
  } catch (e) {
    // Preview bridge is best-effort; the page still renders published content
  }
})();
