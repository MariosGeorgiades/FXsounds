/* ═══════════════════════════════════════════
   FX SOUND PRODUCTIONS — gallery-render.js
   Merges static media.json albums with
   admin-uploaded albums from localStorage.
   Overrides loadGallery / renderAlbums /
   openAlbum from scripts.js.
═══════════════════════════════════════════ */

// ── Helpers ──────────────────────────────
async function getAdminAlbums() {
  if (!window.supabaseClient) return [];
  const { data, error } = await window.supabaseClient
    .from('gallery_albums')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching admin albums:', error);
    return [];
  }
  return data || [];
}

function isAdminSession() {
  return !!localStorage.getItem('fxAdminSession');
}

// ── Load & merge ─────────────────────────
async function loadGallery() {
  let staticRaw = [];
  try {
    const res = await fetch('media.json?v=' + Date.now());
    staticRaw = await res.json();
  } catch (e) { staticRaw = []; }

  // Normalize static albums — prepend 'images/' to paths
  const staticAlbums = staticRaw.map((a, i) => ({
    id: a.id || 'static-' + i,
    title: a.title,
    date: a.date,
    isAdmin: false,
    cover: 'images/' + a.cover,
    photos: (a.photos || []).map(p => ({ src: 'images/' + p }))
  }));

  // Admin albums from Supabase (ordered by created_at desc)
  const adminRaw = await getAdminAlbums();
  const adminAlbums = adminRaw.map(a => ({
    ...a,
    date: a.album_date || a.date,
    isAdmin: true,
    cover: a.photos && a.photos.length ? a.photos[0].src : null,
    photos: (a.photos || []).map(p => ({ src: p.src }))
  }));

  window.albumsData = [...adminAlbums, ...staticAlbums];
  renderAlbums();
}

// ── Render album grid ─────────────────────
function renderAlbums() {
  window.currentAlbum = null;
  const titleEl  = document.getElementById('galleryTitle');
  const tagEl    = document.getElementById('galleryTag');
  const actEl    = document.getElementById('galleryActions');
  const grid     = document.getElementById('gGrid');
  if (!grid) return;

  if (titleEl) titleEl.innerHTML = 'Event Albums';
  if (tagEl)   tagEl.innerHTML   = 'Our Work';
  if (actEl)   actEl.innerHTML   = '';

  const admin = isAdminSession();

  if (!window.albumsData || !window.albumsData.length) {
    grid.innerHTML = '<div class="g-empty"><div class="g-empty-icon">🎬</div><p>No albums yet</p></div>';
    return;
  }

  grid.style.columnCount = 'unset';
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  grid.style.gap = '24px';

  grid.innerHTML = window.albumsData.map((album, idx) => `
    <div class="album-card" onclick="openAlbum(${idx})">
      ${album.cover
        ? `<img src="${album.cover}" alt="${album.title}" loading="lazy">`
        : `<div style="width:100%;height:100%;background:rgba(168,85,247,.1);display:flex;align-items:center;justify-content:center;font-size:48px;">📷</div>`}
      ${admin && album.isAdmin
        ? `<button class="album-admin-del" onclick="deleteAdminAlbum('${album.id}',event)" title="Delete album">✕</button>`
        : ''}
      <div class="album-info">
        <div class="album-title">${album.title}</div>
        <div class="album-meta">${album.photos.length} Photo${album.photos.length !== 1 ? 's' : ''} · ${album.date}</div>
      </div>
    </div>
  `).join('');
}

// ── Open album → photo grid ───────────────
function openAlbum(idx) {
  window.currentAlbum = window.albumsData[idx];
  const titleEl = document.getElementById('galleryTitle');
  const tagEl   = document.getElementById('galleryTag');
  const actEl   = document.getElementById('galleryActions');
  const grid    = document.getElementById('gGrid');
  if (!grid) return;

  if (titleEl) titleEl.innerHTML = window.currentAlbum.title;
  if (tagEl)   tagEl.innerHTML   = 'Album';

  if (actEl) {
    actEl.innerHTML = `<button class="btn-back-albums" onclick="renderAlbums()">← Back to Albums</button>`;
    if (window.matchMedia('(pointer: fine)').matches) {
      const btn    = actEl.querySelector('.btn-back-albums');
      const cursor = document.getElementById('cursor');
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; cursor?.classList.remove('hover'); });
      btn.addEventListener('mouseenter', () => cursor?.classList.add('hover'));
    }
  }

  window.currentLightboxItems = window.currentAlbum.photos.map(p => ({ src: p.src, type: 'photo' }));

  grid.style.display      = 'block';
  grid.style.columnCount  = '';
  grid.style.gap          = '';

  grid.innerHTML = window.currentAlbum.photos.map((photo, i) => `
    <div class="g-cell" onclick="openLightbox(${i})">
      <img src="${photo.src}" loading="lazy">
      <div class="g-cell-ov">🔍</div>
    </div>
  `).join('');

  document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Admin: delete album from gallery card ─
async function deleteAdminAlbum(id, e) {
  e.stopPropagation();
  if (!window.supabaseClient) return;
  const { error } = await window.supabaseClient
    .from('gallery_albums')
    .delete()
    .match({ id: id });
  if (error) {
    console.error('Error deleting album:', error);
    alert('Failed to delete album');
    return;
  }
  await loadGallery();
}

// ── Expose globally (override scripts.js versions) ──
window.loadGallery      = loadGallery;
window.renderAlbums     = renderAlbums;
window.openAlbum        = openAlbum;
window.deleteAdminAlbum = deleteAdminAlbum;

// Bootstrap — call after all overrides are registered
// (scripts.js deferred to us, so this is the correct entry point)
if (document.getElementById('gGrid')) {
  loadGallery();
}
