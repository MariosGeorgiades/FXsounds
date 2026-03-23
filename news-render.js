/* ═══════════════════════════════════════════
   FX SOUND PRODUCTIONS — news-render.js
   Renders dynamic news cards on news.html
   from localStorage, with static fallbacks.
═══════════════════════════════════════════ */

const STATIC_EVENTS = [
  {
    id: 'static-1',
    month: 'AUG',
    day: '15',
    year: '2026',
    title: 'Summer Beach Festival',
    desc: 'We are deploying our massive K1 line-array system and an immersive light show for this 10,000 capacity open-air beach party. Voted biggest event of the year.'
  },
  {
    id: 'static-2',
    month: 'SEP',
    day: '02',
    year: '2026',
    title: 'Cyprus Tech Summit',
    desc: 'Providing comprehensive AV solutions, curved LED video walls, and crystalline audio distribution for the primary corporate tech networking event.'
  },
  {
    id: 'static-3',
    month: 'OCT',
    day: '31',
    year: '2026',
    title: 'Halloween Underground Rave',
    desc: 'Preparing chest-pounding subwoofers and a state-of-the-art cinematic laser installation for an exclusive 2,000 person underground warehouse deep house event.'
  },
  {
    id: 'static-4',
    month: 'NOV',
    day: '20',
    year: '2026',
    title: 'Limassol Winter Symphony',
    desc: "Designing an elegant acoustic environment with flown micro-arrays to perfectly capture and broadcast the city's 80-piece orchestra."
  }
];

async function getAdminEvents() {
  if (!window.supabaseClient) return [];
  const { data, error } = await window.supabaseClient
    .from('news_events')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching admin events:', error);
    return [];
  }
  return (data || []).map(ev => ({ ...ev, desc: ev.description }));
}

function buildCardHTML(ev, isAdmin) {
  const deleteBtn = isAdmin && ev.id && !ev.id.startsWith('static-')
    ? `<button class="nc-delete" onclick="deleteNewsEvent('${ev.id}', event)" title="Delete event">✕</button>`
    : '';
  // NOTE: no 'r' class — cards are injected dynamically after IntersectionObserver is set up,
  // so they'd stay opacity:0 forever. We trigger visibility manually below.
  return `
    <div class="news-card nc-reveal">
      ${deleteBtn}
      <div class="nc-date">
        <span class="nc-month">${ev.month}</span>
        <span class="nc-day">${ev.day}</span>
        <span class="nc-year">${ev.year}</span>
      </div>
      <div class="nc-content">
        <h3 class="nc-title">${ev.title}</h3>
        <p class="nc-desc">${ev.desc}</p>
      </div>
    </div>`;
}

async function renderNewsGrid() {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;

  const isAdmin = !!localStorage.getItem('fxAdminSession');
  const adminEvents = await getAdminEvents();

  // Admin events first (ordered by created_at desc from Supabase), then static events
  const allEvents = [...adminEvents, ...STATIC_EVENTS];

  if (!allEvents.length) {
    grid.innerHTML = '<div class="g-empty"><div class="g-empty-icon">📅</div><p>No upcoming events</p></div>';
    return;
  }

  grid.innerHTML = allEvents.map(ev => buildCardHTML(ev, isAdmin)).join('');

  // Trigger entrance animation — cards are invisible until 'on' is added
  // (can't use IntersectionObserver from scripts.js — that ran before these cards existed)
  grid.querySelectorAll('.nc-reveal').forEach((card, i) => {
    setTimeout(() => card.classList.add('on'), i * 80);
  });


  if (window.matchMedia('(pointer: fine)').matches) {
    const cursor = document.getElementById('cursor');
    grid.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mouseenter', () => cursor?.classList.add('hover'));
      btn.addEventListener('mouseleave', () => {
        cursor?.classList.remove('hover');
        btn.style.transform = 'translate(0,0)';
      });
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
    });
  }
}

async function deleteNewsEvent(id, e) {
  e.preventDefault();
  e.stopPropagation();
  if (!window.supabaseClient) return;
  const { error } = await window.supabaseClient
    .from('news_events')
    .delete()
    .match({ id: id });
  if (error) {
    console.error('Error deleting event:', error);
    alert('Failed to delete event');
    return;
  }
  await renderNewsGrid();
}

// Expose globally for admin panel
window.renderNewsGrid = renderNewsGrid;

renderNewsGrid();
