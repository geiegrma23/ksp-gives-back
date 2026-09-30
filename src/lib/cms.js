// Payload CMS client — the site worker reads all content from the mqv-cms
// worker (service binding CMS) via Payload's REST API and maps it to the
// legacy JSON shapes the frontend already renders.

const CMS_ORIGIN = 'https://cms.mnquietvalor.com';

export async function cmsFetch(env, path) {
  const res = await env.CMS.fetch(CMS_ORIGIN + path, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`CMS ${res.status} for ${path}`);
  return res.json();
}

// List endpoints return { docs: [...] }
export async function cmsDocs(env, path) {
  const data = await cmsFetch(env, path);
  return Array.isArray(data.docs) ? data.docs : [];
}

// Media fields: prefer the Payload upload (populated at depth>=1, has
// .filename served by our /media/ fallback), else the legacy filename field.
export function mediaName(upload, legacy) {
  if (upload && typeof upload === 'object' && upload.filename) return upload.filename;
  return legacy || '';
}

export function mapEvent(doc) {
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    body: doc.body || '',
    date: doc.date || null,
    end_date: doc.end_date || null,
    time_start: doc.time_start || null,
    time_end: doc.time_end || null,
    location: doc.location || '',
    image_url: mediaName(doc.image, doc.image_url),
    description: doc.description || '',
    status: doc.status,
  };
}

export function mapTestimonial(doc) {
  return {
    id: doc.id,
    name: doc.name,
    role: doc.role || '',
    quote: doc.quote,
    image_url: mediaName(doc.image, doc.image_url),
    featured: doc.featured ? 1 : 0,
    sort_order: doc.sort_order ?? 0,
    status: doc.status,
  };
}

// Flatten the site-content global into the legacy fields object.
export function mapSiteContentFields(doc) {
  const skip = new Set(['id', 'createdAt', 'updatedAt', 'globalType', 'hero_bg', 'about_img']);
  const fields = {};
  for (const [key, value] of Object.entries(doc || {})) {
    if (skip.has(key)) continue;
    if (value === null || value === undefined) continue;
    if (typeof value === 'string') fields[key] = value;
  }
  // Uploaded images win over legacy filenames
  const heroBg = mediaName(doc?.hero_bg, doc?.hero_bg_image);
  if (heroBg) fields.hero_bg_image = heroBg;
  const aboutImg = mediaName(doc?.about_img, doc?.about_image);
  if (aboutImg) fields.about_image = aboutImg;
  return fields;
}
