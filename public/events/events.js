// Events page — calendar + list + detail view
(function () {
  'use strict';

  var events = [];
  var currentMonth = new Date();
  var eventDetailEl = document.getElementById('eventDetail');
  var eventsListEl = document.getElementById('eventsList');

  function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  function formatTime(t) {
    if (!t) return '';
    var parts = t.split(':');
    var h = parseInt(parts[0], 10);
    var m = parts[1];
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + m + ' ' + ampm;
  }

  // ── Calendar ──
  function renderCalendar() {
    var year = currentMonth.getFullYear();
    var month = currentMonth.getMonth();
    var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    document.getElementById('calMonth').textContent = monthNames[month] + ' ' + year;

    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = new Date();
    var todayStr = today.toISOString().split('T')[0];

    // Get event dates for this month
    var eventDates = {};
    events.forEach(function (e) {
      if (e.date) {
        var d = e.date.substring(0, 7);
        var key = year + '-' + String(month + 1).padStart(2, '0');
        if (d === key) {
          var day = parseInt(e.date.substring(8, 10), 10);
          eventDates[day] = true;
        }
      }
    });

    var daysHtml = '';

    // Empty cells before first day
    for (var i = 0; i < firstDay; i++) {
      daysHtml += '<div class="calendar__day calendar__day--empty"></div>';
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      var isToday = dateStr === todayStr;
      var hasEvent = eventDates[day];
      var classes = 'calendar__day';
      if (isToday) classes += ' calendar__day--today';
      if (hasEvent) classes += ' calendar__day--has-event';

      daysHtml += '<div class="' + classes + '" data-date="' + dateStr + '">' +
        day + (hasEvent ? '<div class="calendar__dot"></div>' : '') + '</div>';
    }

    document.getElementById('calDays').innerHTML = daysHtml;

    // Click handlers for days with events
    document.querySelectorAll('.calendar__day--has-event').forEach(function (dayEl) {
      dayEl.addEventListener('click', function () {
        var date = dayEl.dataset.date;
        var dayEvents = events.filter(function (e) { return e.date === date; });
        if (dayEvents.length === 1) {
          showDetail(dayEvents[0]);
        } else {
          // Scroll to first matching event in list
          var firstSlug = dayEvents[0] ? dayEvents[0].slug : '';
          var target = document.getElementById('event-' + firstSlug);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  document.getElementById('calPrev').addEventListener('click', function () {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('calNext').addEventListener('click', function () {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
  });

  // ── Event List ──
  function renderList() {
    if (!events.length) {
      eventsListEl.innerHTML = '<div class="events-empty"><p>No upcoming events at the moment. Check back soon!</p></div>';
      return;
    }

    var today = new Date().toISOString().split('T')[0];
    var upcoming = events.filter(function (e) { return e.date >= today; });
    var past = events.filter(function (e) { return e.date < today; });

    var html = '';

    if (upcoming.length) {
      html += '<h3 style="font-family:\'Oswald\',sans-serif;color:var(--gold);text-transform:uppercase;letter-spacing:0.06em;font-size:1rem;margin-bottom:1rem;">Upcoming Events</h3>';
      upcoming.forEach(function (e) { html += renderListItem(e); });
    }

    if (past.length) {
      html += '<h3 style="font-family:\'Oswald\',sans-serif;color:var(--steel);text-transform:uppercase;letter-spacing:0.06em;font-size:1rem;margin:2rem 0 1rem;">Past Events</h3>';
      past.forEach(function (e) { html += renderListItem(e); });
    }

    eventsListEl.innerHTML = html;

    eventsListEl.querySelectorAll('[data-event-slug]').forEach(function (item) {
      item.addEventListener('click', function () {
        var ev = events.find(function (e) { return e.slug === item.dataset.eventSlug; });
        if (ev) showDetail(ev);
      });
    });

    // Check URL hash for direct link
    if (window.location.hash) {
      var slug = window.location.hash.replace('#event-', '');
      var ev = events.find(function (e) { return e.slug === slug; });
      if (ev) showDetail(ev);
    }
  }

  function renderListItem(e) {
    var d = e.date ? new Date(e.date + 'T00:00:00') : null;
    var monthStr = d ? d.toLocaleDateString('en-US', { month: 'short' }) : '';
    var dayStr = d ? d.getDate() : '';
    var timeStr = '';
    if (e.time_start) timeStr = formatTime(e.time_start);
    if (e.time_end) timeStr += ' - ' + formatTime(e.time_end);

    return '<div class="event-list-item" id="event-' + escHtml(e.slug) + '" data-event-slug="' + escHtml(e.slug) + '">' +
      '<div class="event-list-item__date-box">' +
        '<div class="event-list-item__month">' + escHtml(monthStr) + '</div>' +
        '<div class="event-list-item__day">' + escHtml(String(dayStr)) + '</div>' +
      '</div>' +
      '<div class="event-list-item__info">' +
        '<h3>' + escHtml(e.title) + '</h3>' +
        '<div class="event-list-item__meta">' +
          (e.location ? escHtml(e.location) : '') +
          (timeStr ? ' &middot; ' + escHtml(timeStr) : '') +
        '</div>' +
        (e.description ? '<div class="event-list-item__desc">' + escHtml(e.description) + '</div>' : '') +
      '</div>' +
    '</div>';
  }

  // ── Detail View ──
  function showDetail(e) {
    eventsListEl.style.display = 'none';
    document.getElementById('calendar').style.display = 'none';
    eventDetailEl.style.display = '';

    var timeStr = '';
    if (e.time_start) timeStr = formatTime(e.time_start);
    if (e.time_end) timeStr += ' - ' + formatTime(e.time_end);

    var html = '<button class="event-detail__back" id="detailBack">&larr; Back to Events</button>';

    if (e.image_url) {
      html += '<img class="event-detail__image" src="/media/' + escHtml(e.image_url) + '" alt="' + escHtml(e.title) + '">';
    }

    html += '<h2 class="event-detail__title">' + escHtml(e.title) + '</h2>';
    html += '<div class="event-detail__meta">';
    if (e.date) html += '<div class="event-detail__meta-item"><strong>Date</strong>' + escHtml(formatDate(e.date)) + (e.end_date && e.end_date !== e.date ? ' - ' + escHtml(formatDate(e.end_date)) : '') + '</div>';
    if (timeStr) html += '<div class="event-detail__meta-item"><strong>Time</strong>' + escHtml(timeStr) + '</div>';
    if (e.location) html += '<div class="event-detail__meta-item"><strong>Location</strong>' + escHtml(e.location) + '</div>';
    html += '</div>';

    if (e.body) {
      // Simple paragraph rendering
      html += '<div class="event-detail__body">' + e.body.split('\n').map(function (p) { return p.trim() ? '<p>' + escHtml(p) + '</p>' : ''; }).join('') + '</div>';
    }

    eventDetailEl.innerHTML = html;

    document.getElementById('detailBack').addEventListener('click', function () {
      eventDetailEl.style.display = 'none';
      eventsListEl.style.display = '';
      document.getElementById('calendar').style.display = '';
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Init ──
  fetch('/api/events')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (data) {
      events = data;
      renderCalendar();
      renderList();
    })
    .catch(function () {
      eventsListEl.innerHTML = '<div class="events-empty"><p>Unable to load events.</p></div>';
    });
})();
