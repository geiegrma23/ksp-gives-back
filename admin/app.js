// KSP Gives Back — Admin Panel App
// Vanilla JS SPA: loads content from API, renders editor, saves changes

(function () {
  'use strict';

  const API = '/api/content';
  const contentArea = document.getElementById('contentArea');
  const saveBtn = document.getElementById('saveBtn');
  const saveStatus = document.getElementById('saveStatus');
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');

  let data = { fields: {}, mission_cards: [], values_items: [], goals: [] };

  // ── Section definitions ──
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

  // ── Load content from API ──
  async function loadContent() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Failed to load content');
      data = await res.json();
      render();
    } catch (err) {
      contentArea.innerHTML = `<div class="loading" style="color:var(--red-glow);">Error loading content: ${err.message}</div>`;
    }
  }

  // ── Render all sections ──
  function render() {
    contentArea.innerHTML = '';

    SECTIONS.forEach((section, i) => {
      const el = document.createElement('div');
      el.className = 'editor-section';
      el.id = `section-${section.id}`;

      const isOpen = i === 0; // First section open by default
      el.innerHTML = `
        <div class="section-header" data-section="${section.id}">
          <h3>${section.title}</h3>
          <span class="section-toggle ${isOpen ? 'open' : ''}">&#9660;</span>
        </div>
        <div class="section-body ${isOpen ? 'open' : ''}">
          ${renderFields(section.fields)}
          ${section.collection ? renderCollection(section.collection) : ''}
        </div>
      `;
      contentArea.appendChild(el);
    });

    bindEvents();
  }

  // ── Render singleton fields ──
  function renderFields(fields) {
    return fields.map(f => {
      const val = escapeHtml(data.fields[f.key] || '');
      if (f.type === 'textarea') {
        return `<div class="field">
          <label>${f.label}</label>
          <textarea data-key="${f.key}" rows="3">${val}</textarea>
        </div>`;
      }
      return `<div class="field">
        <label>${f.label}</label>
        <input type="text" data-key="${f.key}" value="${val}">
      </div>`;
    }).join('');
  }

  // ── Render collection (repeatable items) ──
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
          <strong style="color:var(--gold); font-family:'Oswald',sans-serif; text-transform:uppercase; font-size:0.85rem; letter-spacing:0.06em;">
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

  // ── Bind all interactive events ──
  function bindEvents() {
    // Collapsible sections
    contentArea.querySelectorAll('.section-header').forEach(header => {
      header.addEventListener('click', () => {
        const body = header.nextElementSibling;
        const toggle = header.querySelector('.section-toggle');
        body.classList.toggle('open');
        toggle.classList.toggle('open');
      });
    });

    // Add item buttons
    contentArea.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        const colName = btn.dataset.add;
        const colDef = findCollectionDef(colName);
        if (!colDef) return;

        const newItem = {};
        colDef.fields.forEach(f => { newItem[f.key] = ''; });
        data[colName].push(newItem);
        render();
        scrollToSection(colName);
      });
    });

    // Remove item buttons
    contentArea.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const colName = btn.dataset.remove;
        const idx = parseInt(btn.dataset.idx, 10);
        data[colName].splice(idx, 1);
        render();
        scrollToSection(colName);
      });
    });

    // Move up buttons
    contentArea.querySelectorAll('[data-move-up]').forEach(btn => {
      btn.addEventListener('click', () => {
        const colName = btn.dataset.moveUp;
        const idx = parseInt(btn.dataset.idx, 10);
        if (idx > 0) {
          const arr = data[colName];
          [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
          render();
          scrollToSection(colName);
        }
      });
    });

    // Move down buttons
    contentArea.querySelectorAll('[data-move-down]').forEach(btn => {
      btn.addEventListener('click', () => {
        const colName = btn.dataset.moveDown;
        const idx = parseInt(btn.dataset.idx, 10);
        const arr = data[colName];
        if (idx < arr.length - 1) {
          [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
          render();
          scrollToSection(colName);
        }
      });
    });

    // Track field changes in data object on input
    contentArea.querySelectorAll('[data-key]').forEach(el => {
      el.addEventListener('input', () => {
        data.fields[el.dataset.key] = el.value;
      });
    });

    contentArea.querySelectorAll('[data-col][data-field]').forEach(el => {
      el.addEventListener('input', () => {
        const colName = el.dataset.col;
        const idx = parseInt(el.dataset.idx, 10);
        const field = el.dataset.field;
        if (data[colName] && data[colName][idx]) {
          data[colName][idx][field] = el.value;
        }
      });
    });
  }

  // ── Save all content ──
  async function saveContent() {
    // Collect latest values from DOM (in case input events were missed)
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
    // Singleton fields
    contentArea.querySelectorAll('[data-key]').forEach(el => {
      data.fields[el.dataset.key] = el.value;
    });

    // Collection fields
    contentArea.querySelectorAll('[data-col][data-field]').forEach(el => {
      const colName = el.dataset.col;
      const idx = parseInt(el.dataset.idx, 10);
      const field = el.dataset.field;
      if (data[colName] && data[colName][idx]) {
        data[colName][idx][field] = el.value;
      }
    });
  }

  // ── Helpers ──
  function findCollectionDef(name) {
    for (const s of SECTIONS) {
      if (s.collection && s.collection.name === name) return s.collection;
    }
    return null;
  }

  function scrollToSection(colName) {
    const section = contentArea.querySelector(`[data-collection="${colName}"]`);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  // ── Sidebar navigation ──
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = item.dataset.section;

      // Update active state
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Scroll to section + open it
      const sectionEl = document.getElementById(`section-${sectionId}`);
      if (sectionEl) {
        const body = sectionEl.querySelector('.section-body');
        const toggle = sectionEl.querySelector('.section-toggle');
        if (!body.classList.contains('open')) {
          body.classList.add('open');
          toggle.classList.add('open');
        }
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Close mobile sidebar
      sidebar.classList.remove('open');
    });
  });

  // ── Mobile menu toggle ──
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // ── Save button ──
  saveBtn.addEventListener('click', saveContent);

  // ── Keyboard shortcut: Ctrl+S to save ──
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveContent();
    }
  });

  // ── Init ──
  loadContent();
})();
