// Dynamic page serving — pages authored in Payload CMS (rich text pre-rendered
// to HTML at save time by the CMS's beforeChange hook).
import { cmsDocs, mediaName } from '../lib/cms.js';

// Serve a dynamic page as HTML: GET /:slug/
export async function serveDynamicPage(env, slug) {
  const docs = await cmsDocs(
    env,
    `/api/pages?limit=1&depth=1&where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published`
  );
  const page = docs[0];
  if (!page) return null; // not found — let it fall through to static assets

  const html = renderPageHtml(page);
  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

function renderPageHtml(page) {
  const esc = (s) =>
    (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const bodyHtml = page.html || '<p style="color:var(--steel);">This page is under construction.</p>';

  const heroFile = mediaName(page.hero_image, page.image_url);
  const heroImage = heroFile
    ? `<div style="width:100%;max-height:400px;overflow:hidden;margin-bottom:0;">
        <img src="/media/${esc(heroFile)}" alt="${esc(page.title)}" style="width:100%;height:400px;object-fit:cover;display:block;">
      </div>`
    : '';

  const subtitleHtml = page.subtitle
    ? `<p style="font-family:'Source Serif 4',serif;font-size:1.2rem;color:var(--steel);max-width:700px;margin:0 auto 2rem;">${esc(page.subtitle)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(page.title)} — Minnesota Quiet Valor</title>
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=Bebas+Neue&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  ${heroImage}
  <div class="page-header">
    <h1 class="section-title">${esc(page.title)}</h1>
    <div class="divider divider--center"></div>
  </div>
  <section style="padding:3rem 2rem 5rem;">
    <div class="container" style="max-width:800px;margin:0 auto;">
      <div style="text-align:center;">${subtitleHtml}</div>
      <div class="cms-page-body" style="color:var(--text-light);line-height:1.8;font-size:1.1rem;text-align:left;">
        ${bodyHtml}
      </div>
    </div>
  </section>
  <script src="/components/nav.js"></script>
  <script src="/components/footer.js"></script>
</body>
</html>`;
}
