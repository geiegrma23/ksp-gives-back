// KSP Gives Back — Admin Panel App (Expanded)
// Handles: content editor, nav, media library, events, testimonials, financials

(function () {
  'use strict';

  const API = '/api/content';
  const contentArea = document.getElementById('contentArea');
  const saveBtn = document.getElementById('saveBtn');
  const saveStatus = document.getElementById('saveStatus');
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');

  let data = { fields: {}, mission_cards: [], values_items: [], goals: [] };
  let currentView = 'hero'; // tracks which section/crud view is active
  let mediaList = [];
  let eventsList = [];
  let testimonialsList = [];
  let financialReports = [];
  let financialHighlights = [];
  let navItems = [];

  // Image picker callback
  let imagePickerCallback = null;

  // ── Section definitions (homepage content) ──
  const SECTIONS = [
    {
      id: 'hero',
      title: 'Hero Section',
      fields: [
        { key: 'hero_title', label: 'Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Subtitle', type: 'text' },
        { key: 'hero_description', label: 'Description', type: 'textarea' },
        { key: 'hero_cta_text', label: 'CTA Button Text', type: 'text' },
        { key: 'hero_cta_link', label: 'CTA Button Link', type: 'text' },
        { key: 'hero_bg_image', label: 'Background Image URL', type: 'image' },
        { key: 'hero_video_embed', label: 'Video Embed (YouTube/Vimeo iframe)', type: 'textarea' },
      ],
    },
    {
      id: 'mission',
      title: 'Mission Section',
      fields: [
        { key: 'mission_label', label: 'Section Label', type: 'text' },
        { key: 'mission_title', label: 'Section Title', type: 'text' },
      ],
      collection: {
        name: 'mission_cards',
        itemLabel: 'Card',
        fields: [
          { key: 'title', label: 'Card Title', type: 'text' },
          { key: 'body', label: 'Card Body', type: 'textarea' },
        ],
      },
    },
    {
      id: 'values',
      title: 'Values Section',
      fields: [
        { key: 'values_label', label: 'Section Label', type: 'text' },
        { key: 'values_title', label: 'Section Title', type: 'text' },
      ],
      collection: {
        name: 'values_items',
        itemLabel: 'Value',
        fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
        ],
      },
    },
    {
      id: 'banner',
      title: 'Banner Section',
      fields: [
        { key: 'banner_text', label: 'Main Text', type: 'textarea' },
        { key: 'banner_sub', label: 'Sub Text', type: 'text' },
      ],
    },
    {
      id: 'goals',
      title: 'Goals Section',
      fields: [
        { key: 'goals_label', label: 'Section Label', type: 'text' },
        { key: 'goals_title', label: 'Section Title', type: 'text' },
      ],
      collection: {
        name: 'goals',
        itemLabel: 'Goal',
        fields: [
          { key: 'number', label: 'Number (e.g. 01)', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
        ],
      },
    },
    {
      id: 'contact',
      title: 'Contact Section',
      fields: [
        { key: 'contact_label', label: 'Section Label', type: 'text' },
        { key: 'contact_title', label: 'Section Title', type: 'text' },
        { key: 'contact_intro', label: 'Intro Text', type: 'textarea' },
        { key: 'contact_address', label: 'Address', type: 'text' },
        { key: 'contact_phone', label: 'Phone', type: 'text' },
        { key: 'contact_email', label: 'Email', type: 'text' },
        { key: 'contact_hours', label: 'Hours', type: 'text' },
        { key: 'contact_cta_text', label: 'CTA Button Text', type: 'text' },
        { key: 'contact_cta_link', label: 'CTA Button Link', type: 'text' },
      ],
    },
    {
      id: 'footer',
      title: 'Footer',
      fields: [
        { key: 'footer_copyright', label: 'Copyright Text', type: 'text' },
        { key: 'footer_parent_text', label: 'Parent Company Intro', type: 'text' },
        { key: 'footer_parent_name', label: 'Parent Company Name', type: 'text' },
        { key: 'footer_parent_link', label: 'Parent Company Link', type: 'text' },
      ],
    },
  ];

  // ══════════════════════════════════════════════
  //  LOAD DATA
  // ══════════════════════════════════════════════

  async function loadContent() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Failed to load');
      data = await res.json();
    } catch (err) {
      contentArea.innerHTML = `<div class="loading" style="color:var(--red-glow);">Error: ${err.message}</div>`;
    }
  }

  async function loadNav() {
    try {
      const res = await fetch('/api/nav');
      navItems = res.ok ? await res.json() : [];
    } catch { navItems = []; }
  }

  async function loadMedia() {
    try {
      const res = await fetch('/api/media');
      mediaList = res.ok ? await res.json() : [];
    } catch { mediaList = []; }
  }

  async function loadEvents() {
    try {
      const res = await fetch('/api/events?all=1');
      eventsList = res.ok ? await res.json() : [];
    } catch { eventsList = []; }
  }

  async function loadTestimonials() {
    try {
      const res = await fetch('/api/testimonials?all=1');
      testimonialsList = res.ok ? await res.json() : [];
    } catch { testimonialsList = []; }
  }

  async function loadFinancials() {
    try {
      const res = await fetch('/api/financials?all=1');
      if (res.ok) {
        const d = await res.json();
        financialReports = d.reports || [];
        financialHighlights = d.highlights || [];
        // Merge financials fields into data.fields
        if (d.fields) Object.assign(data.fields, d.fields);
      }
    } catch {}
  }

  // ══════════════════════════════════════════════
  //  RENDER ROUTER
  // ══════════════════════════════════════════════

  function renderView() {
    contentArea.innerHTML = '';

    // Content sections (hero, mission, etc.)
    const contentSection = SECTIONS.find(s => s.id === currentView);
    if (contentSection) {
      renderContentSection(contentSection);
      return;
    }

    // Special sections
    switch (currentView) {
      case 'navigation': renderNavEditor(); break;
      case 'media': renderMediaLibrary(); break;
      case 'events': renderEventsList(); break;
      case 'events-edit': renderEventForm(); break;
      case 'testimonials': renderTestimonialsList(); break;
      case 'testimonials-edit': renderTestimonialForm(); break;
      case 'financials': renderFinancialsEditor(); break;
      case 'financials-report-edit': renderReportForm(); break;
    }
  }

  // ══════════════════════════════════════════════
  //  CONTENT SECTIONS (existing pattern)
  // ══════════════════════════════════════════════

  function renderContentSection(section) {
    const el = document.createElement('div');
    el.className = 'editor-section';
    el.id = `section-${section.id}`;
    el.innerHTML = `
      <div class="section-header">
        <h3>${section.title}</h3>
      </div>
      <div class="section-body open">
        ${renderFields(section.fields)}
        ${section.collection ? renderCollection(section.collection) : ''}
      </div>
    `;
    contentArea.appendChild(el);
    bindContentEvents();
  }

  function renderFields(fields) {
    return fields.map(f => {
      const val = escapeHtml(data.fields[f.key] || '');
      if (f.type === 'textarea') {
        return `<div class="field">
          <label>${f.label}</label>
          <textarea data-key="${f.key}" rows="3">${val}</textarea>
        </div>`;
      }
      if (f.type === 'image') {
        const imgSrc = data.fields[f.key] ? '/media/' + data.fields[f.key] : '';
        return `<div class="field">
          <label>${f.label}</label>
          <div class="image-picker-field">
            <div>
              <input type="text" data-key="${f.key}" value="${val}" placeholder="Select or enter image key">
              <button class="btn btn-add image-picker-btn" data-pick-for="${f.key}">Browse</button>
            </div>
            <div class="image-picker-preview">${imgSrc ? `<img src="${imgSrc}">` : ''}</div>
          </div>
        </div>`;
      }
      return `<div class="field">
        <label>${f.label}</label>
        <input type="text" data-key="${f.key}" value="${val}">
      </div>`;
    }).join('');
  }

  function renderCollection(col) {
    const items = data[col.name] || [];
    const itemsHtml = items.map((item, idx) => renderCollectionItem(col, item, idx, items.length)).join('');
    return `
      <div class="repeatable-section" data-collection="${col.name}">
        <div class="repeatable-list">${itemsHtml}</div>
        <button class="btn btn-add" data-add="${col.name}">+ Add ${col.itemLabel}</button>
      </div>
    `;
  }

  function renderCollectionItem(col, item, idx, total) {
    const fieldsHtml = col.fields.map(f => {
      const val = escapeHtml(item[f.key] || '');
      if (f.type === 'textarea') {
        return `<div class="field">
          <label>${f.label}</label>
          <textarea data-col="${col.name}" data-idx="${idx}" data-field="${f.key}" rows="2">${val}</textarea>
        </div>`;
      }
      return `<div class="field">
        <label>${f.label}</label>
        <input type="text" data-col="${col.name}" data-idx="${idx}" data-field="${f.key}" value="${val}">
      </div>`;
    }).join('');

    return `
      <div class="repeatable-item" data-col="${col.name}" data-index="${idx}">
        <div class="repeatable-item-header">
          <strong style="color:var(--gold);font-family:'Oswald',sans-serif;text-transform:uppercase;font-size:0.85rem;letter-spacing:0.06em;">
            ${col.itemLabel} ${idx + 1}
          </strong>
          <div class="repeatable-item-actions">
            <button class="btn btn-move" data-move-up="${col.name}" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} title="Move up">&uarr;</button>
            <button class="btn btn-move" data-move-down="${col.name}" data-idx="${idx}" ${idx === total - 1 ? 'disabled' : ''} title="Move down">&darr;</button>
            <button class="btn btn-remove" data-remove="${col.name}" data-idx="${idx}">Remove</button>
          </div>
        </div>
        ${fieldsHtml}
      </div>
    `;
  }

  function bindContentEvents() {
    // Add item
    contentArea.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        const colName = btn.dataset.add;
        const colDef = findCollectionDef(colName);
        if (!colDef) return;
        const newItem = {};
        colDef.fields.forEach(f => { newItem[f.key] = ''; });
        data[colName].push(newItem);
        renderView();
      });
    });

    // Remove item
    contentArea.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        data[btn.dataset.remove].splice(parseInt(btn.dataset.idx, 10), 1);
        renderView();
      });
    });

    // Move up/down
    contentArea.querySelectorAll('[data-move-up]').forEach(btn => {
      btn.addEventListener('click', () => {
        const arr = data[btn.dataset.moveUp];
        const idx = parseInt(btn.dataset.idx, 10);
        if (idx > 0) { [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]; renderView(); }
      });
    });
    contentArea.querySelectorAll('[data-move-down]').forEach(btn => {
      btn.addEventListener('click', () => {
        const arr = data[btn.dataset.moveDown];
        const idx = parseInt(btn.dataset.idx, 10);
        if (idx < arr.length - 1) { [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]; renderView(); }
      });
    });

    // Track field changes
    contentArea.querySelectorAll('[data-key]').forEach(el => {
      el.addEventListener('input', () => { data.fields[el.dataset.key] = el.value; });
    });
    contentArea.querySelectorAll('[data-col][data-field]').forEach(el => {
      el.addEventListener('input', () => {
        const colName = el.dataset.col;
        const idx = parseInt(el.dataset.idx, 10);
        if (data[colName] && data[colName][idx]) data[colName][idx][el.dataset.field] = el.value;
      });
    });

    // Image picker buttons
    contentArea.querySelectorAll('[data-pick-for]').forEach(btn => {
      btn.addEventListener('click', () => openImagePicker(key => {
        data.fields[btn.dataset.pickFor] = key;
        renderView();
      }));
    });
  }

  // ══════════════════════════════════════════════
  //  NAVIGATION EDITOR
  // ══════════════════════════════════════════════

  function renderNavEditor() {
    const el = document.createElement('div');
    el.className = 'editor-section';
    let html = `
      <div class="section-header"><h3>Navigation Links</h3></div>
      <div class="section-body open">
        <div class="repeatable-list">
    `;

    navItems.forEach((item, idx) => {
      html += `
        <div class="repeatable-item">
          <div class="repeatable-item-header">
            <strong style="color:var(--gold);font-family:'Oswald',sans-serif;text-transform:uppercase;font-size:0.85rem;">
              Link ${idx + 1}
            </strong>
            <div class="repeatable-item-actions">
              <button class="btn btn-move" data-nav-up="${idx}" ${idx === 0 ? 'disabled' : ''}>&uarr;</button>
              <button class="btn btn-move" data-nav-down="${idx}" ${idx === navItems.length - 1 ? 'disabled' : ''}>&darr;</button>
              <button class="btn btn-remove" data-nav-remove="${idx}">Remove</button>
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Label</label>
              <input type="text" data-nav-field="label" data-nav-idx="${idx}" value="${escapeHtml(item.label || '')}">
            </div>
            <div class="field">
              <label>URL</label>
              <input type="text" data-nav-field="url" data-nav-idx="${idx}" value="${escapeHtml(item.url || '')}">
            </div>
          </div>
          <div class="field-checkbox">
            <input type="checkbox" id="nav-vis-${idx}" data-nav-field="visible" data-nav-idx="${idx}" ${item.visible ? 'checked' : ''}>
            <label for="nav-vis-${idx}">Visible</label>
          </div>
        </div>
      `;
    });

    html += `
        </div>
        <button class="btn btn-add" id="addNavItem">+ Add Link</button>
        <div style="margin-top:1rem;">
          <button class="btn btn-primary" id="saveNav">Save Navigation</button>
        </div>
      </div>
    `;
    el.innerHTML = html;
    contentArea.appendChild(el);

    // Bind nav events
    contentArea.querySelectorAll('[data-nav-field]').forEach(el => {
      const handler = () => {
        const idx = parseInt(el.dataset.navIdx, 10);
        const field = el.dataset.navField;
        navItems[idx][field] = field === 'visible' ? el.checked : el.value;
      };
      el.addEventListener('input', handler);
      el.addEventListener('change', handler);
    });

    contentArea.querySelectorAll('[data-nav-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        navItems.splice(parseInt(btn.dataset.navRemove, 10), 1);
        renderView();
      });
    });

    contentArea.querySelectorAll('[data-nav-up]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.navUp, 10);
        if (i > 0) { [navItems[i - 1], navItems[i]] = [navItems[i], navItems[i - 1]]; renderView(); }
      });
    });

    contentArea.querySelectorAll('[data-nav-down]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.navDown, 10);
        if (i < navItems.length - 1) { [navItems[i], navItems[i + 1]] = [navItems[i + 1], navItems[i]]; renderView(); }
      });
    });

    document.getElementById('addNavItem').addEventListener('click', () => {
      navItems.push({ label: '', url: '/', visible: true });
      renderView();
    });

    document.getElementById('saveNav').addEventListener('click', async () => {
      setStatus('Saving...', 'saving');
      try {
        const res = await fetch('/api/nav', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(navItems),
        });
        if (!res.ok) throw new Error('Save failed');
        navItems = await res.json();
        setStatus('Navigation saved', 'saved');
        setTimeout(() => setStatus(''), 3000);
      } catch (err) {
        setStatus('Error: ' + err.message, 'error');
      }
    });
  }

  // ══════════════════════════════════════════════
  //  MEDIA LIBRARY
  // ══════════════════════════════════════════════

  function renderMediaLibrary() {
    const el = document.createElement('div');
    el.className = 'editor-section';
    let html = `
      <div class="section-header"><h3>Media Library</h3></div>
      <div class="section-body open">
        <div class="media-upload">
          <div class="media-upload-area" id="mediaDropZone">
            <p>Click or drag &amp; drop to upload images</p>
            <input type="file" id="mediaFileInput" accept="image/*,application/pdf" style="display:none;" multiple>
          </div>
        </div>
        <div class="media-grid">
    `;

    mediaList.forEach(m => {
      const isImage = m.content_type && m.content_type.startsWith('image/');
      html += `
        <div class="media-item">
          ${isImage ? `<img src="/media/${escapeHtml(m.key)}" alt="${escapeHtml(m.filename)}" loading="lazy">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--steel);font-size:0.8rem;">${escapeHtml(m.filename)}</div>`}
          <div class="media-item__overlay">
            <div class="media-item__name">${escapeHtml(m.filename)}</div>
            <button class="btn btn-remove" data-media-delete="${m.id}">Delete</button>
            <button class="btn btn-secondary" data-media-copy="${m.key}" style="font-size:0.7rem;padding:0.2rem 0.5rem;">Copy Key</button>
          </div>
        </div>
      `;
    });

    html += '</div></div>';
    el.innerHTML = html;
    contentArea.appendChild(el);

    // Upload
    const dropZone = document.getElementById('mediaDropZone');
    const fileInput = document.getElementById('mediaFileInput');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = 'var(--gold)'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = ''; });
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.style.borderColor = '';
      uploadFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => uploadFiles(fileInput.files));

    // Delete
    contentArea.querySelectorAll('[data-media-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this file?')) return;
        try {
          await fetch('/api/media/' + btn.dataset.mediaDelete, { method: 'DELETE' });
          await loadMedia();
          renderView();
        } catch {}
      });
    });

    // Copy key
    contentArea.querySelectorAll('[data-media-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.mediaCopy);
        setStatus('Key copied', 'saved');
        setTimeout(() => setStatus(''), 2000);
      });
    });
  }

  async function uploadFiles(files) {
    for (const file of files) {
      setStatus('Uploading ' + file.name + '...', 'saving');
      const form = new FormData();
      form.append('file', file);
      try {
        const res = await fetch('/api/media', { method: 'POST', body: form });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Upload failed'); }
      } catch (err) {
        setStatus('Error: ' + err.message, 'error');
        return;
      }
    }
    setStatus('Upload complete', 'saved');
    setTimeout(() => setStatus(''), 3000);
    await loadMedia();
    renderView();
  }

  // ══════════════════════════════════════════════
  //  IMAGE PICKER MODAL
  // ══════════════════════════════════════════════

  function openImagePicker(callback) {
    imagePickerCallback = callback;
    const modal = document.getElementById('imagePickerModal');
    const grid = document.getElementById('imagePickerGrid');
    modal.style.display = '';

    // Refresh media list for picker
    fetch('/api/media')
      .then(r => r.ok ? r.json() : [])
      .then(items => {
        grid.innerHTML = items
          .filter(m => m.content_type && m.content_type.startsWith('image/'))
          .map(m => `<div class="media-picker-item" data-pick-key="${escapeHtml(m.key)}"><img src="/media/${escapeHtml(m.key)}" alt="${escapeHtml(m.filename)}" loading="lazy"></div>`)
          .join('') || '<p style="color:var(--steel);padding:1rem;">No images uploaded yet.</p>';

        grid.querySelectorAll('[data-pick-key]').forEach(item => {
          item.addEventListener('click', () => {
            if (imagePickerCallback) imagePickerCallback(item.dataset.pickKey);
            closeImagePicker();
          });
        });
      });

    // Upload in modal
    const modalInput = document.getElementById('modalUploadInput');
    modalInput.value = '';
    modalInput.onchange = async () => {
      if (!modalInput.files.length) return;
      await uploadFiles(modalInput.files);
      openImagePicker(callback); // refresh
    };
  }

  function closeImagePicker() {
    document.getElementById('imagePickerModal').style.display = 'none';
    imagePickerCallback = null;
  }

  document.getElementById('imagePickerClose').addEventListener('click', closeImagePicker);
  document.getElementById('imagePickerModal').addEventListener('click', e => {
    if (e.target.id === 'imagePickerModal') closeImagePicker();
  });

  // ══════════════════════════════════════════════
  //  EVENTS CRUD
  // ══════════════════════════════════════════════

  let editingEvent = null;

  function renderEventsList() {
    const el = document.createElement('div');
    el.className = 'editor-section';
    let html = `
      <div class="section-header"><h3>Events</h3></div>
      <div class="section-body open">
        <div class="crud-toolbar">
          <span style="color:var(--steel);font-size:0.85rem;">${eventsList.length} event${eventsList.length !== 1 ? 's' : ''}</span>
          <button class="btn btn-add" id="addEvent">+ New Event</button>
        </div>
        <div class="crud-list">
    `;

    eventsList.forEach(ev => {
      const dateStr = ev.date ? new Date(ev.date + 'T00:00:00').toLocaleDateString() : 'No date';
      html += `
        <div class="crud-item" data-event-edit="${ev.id}">
          <div class="crud-item__info">
            <div class="crud-item__title">${escapeHtml(ev.title)}</div>
            <div class="crud-item__meta">${dateStr} ${ev.location ? '&middot; ' + escapeHtml(ev.location) : ''}</div>
          </div>
          <span class="crud-item__status crud-item__status--${ev.status}">${ev.status}</span>
          <div class="crud-item__actions">
            <button class="btn btn-remove" data-event-delete="${ev.id}">Delete</button>
          </div>
        </div>
      `;
    });

    html += '</div></div>';
    el.innerHTML = html;
    contentArea.appendChild(el);

    document.getElementById('addEvent').addEventListener('click', () => {
      editingEvent = { title: '', slug: '', body: '', date: '', end_date: '', time_start: '', time_end: '', location: '', image_url: '', description: '', status: 'draft' };
      currentView = 'events-edit';
      renderView();
    });

    contentArea.querySelectorAll('[data-event-edit]').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.closest('[data-event-delete]')) return;
        editingEvent = { ...eventsList.find(ev => ev.id == item.dataset.eventEdit) };
        currentView = 'events-edit';
        renderView();
      });
    });

    contentArea.querySelectorAll('[data-event-delete]').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm('Delete this event?')) return;
        await fetch('/api/events/' + btn.dataset.eventDelete, { method: 'DELETE' });
        await loadEvents();
        renderView();
      });
    });
  }

  function renderEventForm() {
    const ev = editingEvent;
    const isNew = !ev.id;
    const el = document.createElement('div');
    el.className = 'editor-section';
    el.innerHTML = `
      <div class="section-header"><h3>${isNew ? 'New Event' : 'Edit Event'}</h3></div>
      <div class="section-body open">
        <div class="crud-toolbar">
          <button class="btn crud-back" id="evBack">&larr; Back to Events</button>
        </div>
        <div class="field">
          <label>Title</label>
          <input type="text" id="evTitle" value="${escapeHtml(ev.title)}">
        </div>
        <div class="field">
          <label>Slug</label>
          <input type="text" id="evSlug" value="${escapeHtml(ev.slug || '')}" placeholder="auto-generated from title">
        </div>
        <div class="field">
          <label>Short Description</label>
          <textarea id="evDescription" rows="2">${escapeHtml(ev.description || '')}</textarea>
        </div>
        <div class="field">
          <label>Full Body</label>
          <textarea id="evBody" rows="6">${escapeHtml(ev.body || '')}</textarea>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Start Date</label>
            <input type="date" id="evDate" value="${ev.date || ''}">
          </div>
          <div class="field">
            <label>End Date</label>
            <input type="date" id="evEndDate" value="${ev.end_date || ''}">
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Start Time</label>
            <input type="time" id="evTimeStart" value="${ev.time_start || ''}">
          </div>
          <div class="field">
            <label>End Time</label>
            <input type="time" id="evTimeEnd" value="${ev.time_end || ''}">
          </div>
        </div>
        <div class="field">
          <label>Location</label>
          <input type="text" id="evLocation" value="${escapeHtml(ev.location || '')}">
        </div>
        <div class="field">
          <label>Image</label>
          <div class="image-picker-field">
            <div>
              <input type="text" id="evImageUrl" value="${escapeHtml(ev.image_url || '')}" placeholder="Select image">
              <button class="btn btn-add image-picker-btn" id="evPickImage">Browse</button>
            </div>
            <div class="image-picker-preview">${ev.image_url ? `<img src="/media/${escapeHtml(ev.image_url)}">` : ''}</div>
          </div>
        </div>
        <div class="field">
          <label>Status</label>
          <select id="evStatus">
            <option value="draft" ${ev.status === 'draft' ? 'selected' : ''}>Draft</option>
            <option value="published" ${ev.status === 'published' ? 'selected' : ''}>Published</option>
          </select>
        </div>
        <button class="btn btn-primary" id="evSave">${isNew ? 'Create Event' : 'Save Changes'}</button>
      </div>
    `;
    contentArea.appendChild(el);

    document.getElementById('evBack').addEventListener('click', () => {
      currentView = 'events';
      renderView();
    });

    document.getElementById('evPickImage').addEventListener('click', () => {
      openImagePicker(key => {
        document.getElementById('evImageUrl').value = key;
      });
    });

    document.getElementById('evSave').addEventListener('click', async () => {
      const payload = {
        title: document.getElementById('evTitle').value,
        slug: document.getElementById('evSlug').value,
        description: document.getElementById('evDescription').value,
        body: document.getElementById('evBody').value,
        date: document.getElementById('evDate').value || null,
        end_date: document.getElementById('evEndDate').value || null,
        time_start: document.getElementById('evTimeStart').value || null,
        time_end: document.getElementById('evTimeEnd').value || null,
        location: document.getElementById('evLocation').value,
        image_url: document.getElementById('evImageUrl').value,
        status: document.getElementById('evStatus').value,
      };
      setStatus('Saving...', 'saving');
      try {
        const url = isNew ? '/api/events' : '/api/events/' + ev.id;
        const method = isNew ? 'POST' : 'PUT';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Save failed'); }
        setStatus('Event saved', 'saved');
        setTimeout(() => setStatus(''), 3000);
        await loadEvents();
        currentView = 'events';
        renderView();
      } catch (err) {
        setStatus('Error: ' + err.message, 'error');
      }
    });
  }

  // ══════════════════════════════════════════════
  //  TESTIMONIALS CRUD
  // ══════════════════════════════════════════════

  let editingTestimonial = null;

  function renderTestimonialsList() {
    const el = document.createElement('div');
    el.className = 'editor-section';
    let html = `
      <div class="section-header"><h3>Testimonials</h3></div>
      <div class="section-body open">
        <div class="crud-toolbar">
          <span style="color:var(--steel);font-size:0.85rem;">${testimonialsList.length} testimonial${testimonialsList.length !== 1 ? 's' : ''}</span>
          <button class="btn btn-add" id="addTestimonial">+ New Testimonial</button>
        </div>
        <div class="crud-list">
    `;

    testimonialsList.forEach(t => {
      html += `
        <div class="crud-item" data-test-edit="${t.id}">
          <div class="crud-item__info">
            <div class="crud-item__title">${escapeHtml(t.name)}</div>
            <div class="crud-item__meta">${escapeHtml(t.role || '')} ${t.featured ? '&middot; Featured' : ''}</div>
          </div>
          <span class="crud-item__status crud-item__status--${t.status}">${t.status}</span>
          <div class="crud-item__actions">
            <button class="btn btn-remove" data-test-delete="${t.id}">Delete</button>
          </div>
        </div>
      `;
    });

    html += '</div></div>';
    el.innerHTML = html;
    contentArea.appendChild(el);

    document.getElementById('addTestimonial').addEventListener('click', () => {
      editingTestimonial = { name: '', role: '', quote: '', image_url: '', featured: 0, sort_order: 0, status: 'draft' };
      currentView = 'testimonials-edit';
      renderView();
    });

    contentArea.querySelectorAll('[data-test-edit]').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.closest('[data-test-delete]')) return;
        editingTestimonial = { ...testimonialsList.find(t => t.id == item.dataset.testEdit) };
        currentView = 'testimonials-edit';
        renderView();
      });
    });

    contentArea.querySelectorAll('[data-test-delete]').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm('Delete this testimonial?')) return;
        await fetch('/api/testimonials/' + btn.dataset.testDelete, { method: 'DELETE' });
        await loadTestimonials();
        renderView();
      });
    });
  }

  function renderTestimonialForm() {
    const t = editingTestimonial;
    const isNew = !t.id;
    const el = document.createElement('div');
    el.className = 'editor-section';
    el.innerHTML = `
      <div class="section-header"><h3>${isNew ? 'New Testimonial' : 'Edit Testimonial'}</h3></div>
      <div class="section-body open">
        <div class="crud-toolbar">
          <button class="btn crud-back" id="testBack">&larr; Back to Testimonials</button>
        </div>
        <div class="field">
          <label>Name</label>
          <input type="text" id="testName" value="${escapeHtml(t.name)}">
        </div>
        <div class="field">
          <label>Role / Title</label>
          <input type="text" id="testRole" value="${escapeHtml(t.role || '')}">
        </div>
        <div class="field">
          <label>Quote</label>
          <textarea id="testQuote" rows="4">${escapeHtml(t.quote || '')}</textarea>
        </div>
        <div class="field">
          <label>Photo</label>
          <div class="image-picker-field">
            <div>
              <input type="text" id="testImageUrl" value="${escapeHtml(t.image_url || '')}" placeholder="Select image">
              <button class="btn btn-add image-picker-btn" id="testPickImage">Browse</button>
            </div>
            <div class="image-picker-preview">${t.image_url ? `<img src="/media/${escapeHtml(t.image_url)}">` : ''}</div>
          </div>
        </div>
        <div class="field-checkbox">
          <input type="checkbox" id="testFeatured" ${t.featured ? 'checked' : ''}>
          <label for="testFeatured">Featured on Homepage</label>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Sort Order</label>
            <input type="number" id="testSortOrder" value="${t.sort_order || 0}">
          </div>
          <div class="field">
            <label>Status</label>
            <select id="testStatus">
              <option value="draft" ${t.status === 'draft' ? 'selected' : ''}>Draft</option>
              <option value="published" ${t.status === 'published' ? 'selected' : ''}>Published</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" id="testSave">${isNew ? 'Create Testimonial' : 'Save Changes'}</button>
      </div>
    `;
    contentArea.appendChild(el);

    document.getElementById('testBack').addEventListener('click', () => {
      currentView = 'testimonials';
      renderView();
    });

    document.getElementById('testPickImage').addEventListener('click', () => {
      openImagePicker(key => { document.getElementById('testImageUrl').value = key; });
    });

    document.getElementById('testSave').addEventListener('click', async () => {
      const payload = {
        name: document.getElementById('testName').value,
        role: document.getElementById('testRole').value,
        quote: document.getElementById('testQuote').value,
        image_url: document.getElementById('testImageUrl').value,
        featured: document.getElementById('testFeatured').checked,
        sort_order: parseInt(document.getElementById('testSortOrder').value, 10) || 0,
        status: document.getElementById('testStatus').value,
      };
      setStatus('Saving...', 'saving');
      try {
        const url = isNew ? '/api/testimonials' : '/api/testimonials/' + t.id;
        const method = isNew ? 'POST' : 'PUT';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Save failed'); }
        setStatus('Testimonial saved', 'saved');
        setTimeout(() => setStatus(''), 3000);
        await loadTestimonials();
        currentView = 'testimonials';
        renderView();
      } catch (err) {
        setStatus('Error: ' + err.message, 'error');
      }
    });
  }

  // ══════════════════════════════════════════════
  //  FINANCIALS EDITOR
  // ══════════════════════════════════════════════

  let editingReport = null;

  function renderFinancialsEditor() {
    const el = document.createElement('div');
    el.className = 'editor-section';
    let html = `
      <div class="section-header"><h3>Financials</h3></div>
      <div class="section-body open">
        <h4 style="font-family:'Oswald',sans-serif;color:var(--gold);text-transform:uppercase;letter-spacing:0.06em;font-size:0.95rem;margin-bottom:1rem;">Page Text</h4>
        <div class="field">
          <label>Section Label</label>
          <input type="text" data-key="financials_label" value="${escapeHtml(data.fields.financials_label || '')}">
        </div>
        <div class="field">
          <label>Title</label>
          <input type="text" data-key="financials_title" value="${escapeHtml(data.fields.financials_title || '')}">
        </div>
        <div class="field">
          <label>Intro Text</label>
          <textarea data-key="financials_intro" rows="3">${escapeHtml(data.fields.financials_intro || '')}</textarea>
        </div>

        <h4 style="font-family:'Oswald',sans-serif;color:var(--gold);text-transform:uppercase;letter-spacing:0.06em;font-size:0.95rem;margin:2rem 0 1rem;">Highlights</h4>
        <div class="repeatable-list" id="highlightsList">
    `;

    financialHighlights.forEach((h, idx) => {
      html += `
        <div class="repeatable-item">
          <div class="repeatable-item-header">
            <strong style="color:var(--gold);font-family:'Oswald',sans-serif;text-transform:uppercase;font-size:0.85rem;">Highlight ${idx + 1}</strong>
            <div class="repeatable-item-actions">
              <button class="btn btn-move" data-hl-up="${idx}" ${idx === 0 ? 'disabled' : ''}>&uarr;</button>
              <button class="btn btn-move" data-hl-down="${idx}" ${idx === financialHighlights.length - 1 ? 'disabled' : ''}>&darr;</button>
              <button class="btn btn-remove" data-hl-remove="${idx}">Remove</button>
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Label</label>
              <input type="text" data-hl="label" data-hl-idx="${idx}" value="${escapeHtml(h.label || '')}">
            </div>
            <div class="field">
              <label>Value</label>
              <input type="text" data-hl="value" data-hl-idx="${idx}" value="${escapeHtml(h.value || '')}">
            </div>
          </div>
          <div class="field">
            <label>Description</label>
            <input type="text" data-hl="description" data-hl-idx="${idx}" value="${escapeHtml(h.description || '')}">
          </div>
        </div>
      `;
    });

    html += `
        </div>
        <button class="btn btn-add" id="addHighlight">+ Add Highlight</button>
        <div style="margin-top:1rem;">
          <button class="btn btn-primary" id="saveHighlights">Save Highlights</button>
        </div>

        <h4 style="font-family:'Oswald',sans-serif;color:var(--gold);text-transform:uppercase;letter-spacing:0.06em;font-size:0.95rem;margin:2rem 0 1rem;">Reports</h4>
        <div class="crud-toolbar">
          <span style="color:var(--steel);font-size:0.85rem;">${financialReports.length} report${financialReports.length !== 1 ? 's' : ''}</span>
          <button class="btn btn-add" id="addReport">+ New Report</button>
        </div>
        <div class="crud-list">
    `;

    financialReports.forEach(r => {
      html += `
        <div class="crud-item" data-report-edit="${r.id}">
          <div class="crud-item__info">
            <div class="crud-item__title">${escapeHtml(r.title)}</div>
            <div class="crud-item__meta">${escapeHtml(r.period || '')}</div>
          </div>
          <span class="crud-item__status crud-item__status--${r.status}">${r.status}</span>
          <div class="crud-item__actions">
            <button class="btn btn-remove" data-report-delete="${r.id}">Delete</button>
          </div>
        </div>
      `;
    });

    html += '</div></div>';
    el.innerHTML = html;
    contentArea.appendChild(el);

    // Financials field tracking
    contentArea.querySelectorAll('[data-key]').forEach(el => {
      el.addEventListener('input', () => { data.fields[el.dataset.key] = el.value; });
    });

    // Highlights
    contentArea.querySelectorAll('[data-hl]').forEach(el => {
      el.addEventListener('input', () => {
        const idx = parseInt(el.dataset.hlIdx, 10);
        financialHighlights[idx][el.dataset.hl] = el.value;
      });
    });

    contentArea.querySelectorAll('[data-hl-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        financialHighlights.splice(parseInt(btn.dataset.hlRemove, 10), 1);
        renderView();
      });
    });

    contentArea.querySelectorAll('[data-hl-up]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.hlUp, 10);
        if (i > 0) { [financialHighlights[i - 1], financialHighlights[i]] = [financialHighlights[i], financialHighlights[i - 1]]; renderView(); }
      });
    });

    contentArea.querySelectorAll('[data-hl-down]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.hlDown, 10);
        if (i < financialHighlights.length - 1) { [financialHighlights[i], financialHighlights[i + 1]] = [financialHighlights[i + 1], financialHighlights[i]]; renderView(); }
      });
    });

    document.getElementById('addHighlight').addEventListener('click', () => {
      financialHighlights.push({ label: '', value: '', description: '' });
      renderView();
    });

    document.getElementById('saveHighlights').addEventListener('click', async () => {
      // Also save the financials text fields
      await saveContent();
      setStatus('Saving highlights...', 'saving');
      try {
        const res = await fetch('/api/financial-highlights', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(financialHighlights),
        });
        if (!res.ok) throw new Error('Save failed');
        financialHighlights = await res.json();
        setStatus('Highlights saved', 'saved');
        setTimeout(() => setStatus(''), 3000);
      } catch (err) {
        setStatus('Error: ' + err.message, 'error');
      }
    });

    // Reports
    document.getElementById('addReport').addEventListener('click', () => {
      editingReport = { title: '', period: '', description: '', file_url: '', status: 'draft' };
      currentView = 'financials-report-edit';
      renderView();
    });

    contentArea.querySelectorAll('[data-report-edit]').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.closest('[data-report-delete]')) return;
        editingReport = { ...financialReports.find(r => r.id == item.dataset.reportEdit) };
        currentView = 'financials-report-edit';
        renderView();
      });
    });

    contentArea.querySelectorAll('[data-report-delete]').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm('Delete this report?')) return;
        await fetch('/api/financial-reports/' + btn.dataset.reportDelete, { method: 'DELETE' });
        await loadFinancials();
        renderView();
      });
    });
  }

  function renderReportForm() {
    const r = editingReport;
    const isNew = !r.id;
    const el = document.createElement('div');
    el.className = 'editor-section';
    el.innerHTML = `
      <div class="section-header"><h3>${isNew ? 'New Report' : 'Edit Report'}</h3></div>
      <div class="section-body open">
        <div class="crud-toolbar">
          <button class="btn crud-back" id="reportBack">&larr; Back to Financials</button>
        </div>
        <div class="field">
          <label>Title</label>
          <input type="text" id="reportTitle" value="${escapeHtml(r.title)}">
        </div>
        <div class="field">
          <label>Period (e.g. "Q4 2025", "FY 2025")</label>
          <input type="text" id="reportPeriod" value="${escapeHtml(r.period || '')}">
        </div>
        <div class="field">
          <label>Description</label>
          <textarea id="reportDesc" rows="3">${escapeHtml(r.description || '')}</textarea>
        </div>
        <div class="field">
          <label>PDF / File</label>
          <div class="image-picker-field">
            <div>
              <input type="text" id="reportFileUrl" value="${escapeHtml(r.file_url || '')}" placeholder="Upload a PDF or enter key">
              <button class="btn btn-add image-picker-btn" id="reportUploadPdf">Upload PDF</button>
              <input type="file" id="reportPdfInput" accept="application/pdf" style="display:none;">
            </div>
          </div>
        </div>
        <div class="field">
          <label>Status</label>
          <select id="reportStatus">
            <option value="draft" ${r.status === 'draft' ? 'selected' : ''}>Draft</option>
            <option value="published" ${r.status === 'published' ? 'selected' : ''}>Published</option>
          </select>
        </div>
        <button class="btn btn-primary" id="reportSave">${isNew ? 'Create Report' : 'Save Changes'}</button>
      </div>
    `;
    contentArea.appendChild(el);

    document.getElementById('reportBack').addEventListener('click', () => {
      currentView = 'financials';
      renderView();
    });

    // PDF upload
    const pdfBtn = document.getElementById('reportUploadPdf');
    const pdfInput = document.getElementById('reportPdfInput');
    pdfBtn.addEventListener('click', () => pdfInput.click());
    pdfInput.addEventListener('change', async () => {
      if (!pdfInput.files.length) return;
      const form = new FormData();
      form.append('file', pdfInput.files[0]);
      setStatus('Uploading PDF...', 'saving');
      try {
        const res = await fetch('/api/media', { method: 'POST', body: form });
        if (!res.ok) throw new Error('Upload failed');
        const media = await res.json();
        document.getElementById('reportFileUrl').value = media.key;
        setStatus('PDF uploaded', 'saved');
        setTimeout(() => setStatus(''), 3000);
      } catch (err) {
        setStatus('Error: ' + err.message, 'error');
      }
    });

    document.getElementById('reportSave').addEventListener('click', async () => {
      const payload = {
        title: document.getElementById('reportTitle').value,
        period: document.getElementById('reportPeriod').value,
        description: document.getElementById('reportDesc').value,
        file_url: document.getElementById('reportFileUrl').value,
        status: document.getElementById('reportStatus').value,
      };
      setStatus('Saving...', 'saving');
      try {
        const url = isNew ? '/api/financial-reports' : '/api/financial-reports/' + r.id;
        const method = isNew ? 'POST' : 'PUT';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Save failed'); }
        setStatus('Report saved', 'saved');
        setTimeout(() => setStatus(''), 3000);
        await loadFinancials();
        currentView = 'financials';
        renderView();
      } catch (err) {
        setStatus('Error: ' + err.message, 'error');
      }
    });
  }

  // ══════════════════════════════════════════════
  //  SAVE ALL CONTENT
  // ══════════════════════════════════════════════

  async function saveContent() {
    collectFromDOM();
    saveBtn.disabled = true;
    setStatus('Saving...', 'saving');

    try {
      const res = await fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Save failed (${res.status})`);
      }
      data = await res.json();
      setStatus('All changes saved', 'saved');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setStatus(`Error: ${err.message}`, 'error');
    } finally {
      saveBtn.disabled = false;
    }
  }

  function collectFromDOM() {
    contentArea.querySelectorAll('[data-key]').forEach(el => {
      data.fields[el.dataset.key] = el.value;
    });
    contentArea.querySelectorAll('[data-col][data-field]').forEach(el => {
      const colName = el.dataset.col;
      const idx = parseInt(el.dataset.idx, 10);
      if (data[colName] && data[colName][idx]) data[colName][idx][el.dataset.field] = el.value;
    });
  }

  // ══════════════════════════════════════════════
  //  HELPERS
  // ══════════════════════════════════════════════

  function findCollectionDef(name) {
    for (const s of SECTIONS) {
      if (s.collection && s.collection.name === name) return s.collection;
    }
    return null;
  }

  function setStatus(text, cls) {
    saveStatus.textContent = text;
    saveStatus.className = 'save-status' + (cls ? ' ' + cls : '');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ══════════════════════════════════════════════
  //  SIDEBAR NAVIGATION
  // ══════════════════════════════════════════════

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = item.dataset.section;

      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      currentView = sectionId;
      renderView();

      sidebar.classList.remove('open');
    });
  });

  // Mobile menu toggle
  menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

  // Save button
  saveBtn.addEventListener('click', saveContent);

  // Ctrl+S shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveContent();
    }
  });

  // ══════════════════════════════════════════════
  //  INIT — load everything then render
  // ══════════════════════════════════════════════

  async function init() {
    await Promise.all([
      loadContent(),
      loadNav(),
      loadMedia(),
      loadEvents(),
      loadTestimonials(),
      loadFinancials(),
    ]);
    renderView();
  }

  init();
})();
