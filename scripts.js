/* ═══════════════════════════════════
   FX SOUND PRODUCTIONS — scripts.js
   Optimized for 60fps + real-world perf
═══════════════════════════════════ */

// ── SMOOTH SCROLLING (Lenis) ──
let lenis;
if (typeof window.Lenis !== 'undefined') {
  lenis = new window.Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// ── Utility: debounce & throttle ──
function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
function throttle(fn, ms) {
  let last = 0;
  return (...args) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...args); } };
}

// ── PRELOADER ──
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    setTimeout(() => preloader.style.display = 'none', 500);
  }
}, { once: true });

// ── NAV + Back-to-top + Scroll progress (single throttled listener) ──
const _nav = document.getElementById('nav');
const _btt = document.getElementById('backToTop');
const _sp  = document.getElementById('scrollProgress');

const onScroll = throttle(() => {
  const y   = window.scrollY;
  const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  if (_nav) _nav.style.background = y > 60 ? 'rgba(5,5,8,.98)' : 'rgba(5,5,8,.8)';
  if (_btt) _btt.classList.toggle('show', y > 500);
  if (_sp)  _sp.style.width = (y / max * 100) + '%';
}, 50);

window.addEventListener('scroll', onScroll, { passive: true });

// Debounced resize — for any layout-dependent logic
window.addEventListener('resize', debounce(() => {
  const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  if (_sp) _sp.style.width = (window.scrollY / max * 100) + '%';
}, 200), { passive: true });

// ── Scroll reveal (IntersectionObserver — zero scroll cost) ──
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      revealObs.unobserve(e.target); // stop watching once visible
    }
  });
}, { threshold: .08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.r').forEach(el => revealObs.observe(el));

// Hero items trigger immediately with stagger
document.querySelectorAll('.hero .r').forEach((el, i) => {
  setTimeout(() => { el.classList.add('on'); revealObs.unobserve(el); }, i * 120);
});

// ── GALLERY (ALBUMS) — global state ──
// Note: loadGallery / renderAlbums / openAlbum are OWNED by gallery-render.js
// Scripts below are the fallback for pages without gallery-render.js
let albumsData = [];
let currentAlbum = null;
let currentLightboxItems = [];
let openLightboxIdx = 0;

async function loadGallery() {
  // Check sessionStorage cache first — avoids re-fetching on every visit
  const cached = sessionStorage.getItem('fxMediaJson');
  if (cached) {
    try { albumsData = JSON.parse(cached); renderAlbums(); return; } catch(e) {}
  }
  try {
    const res = await fetch('media.json');
    if (!res.ok) throw new Error('Network response not ok');
    albumsData = await res.json();
    sessionStorage.setItem('fxMediaJson', JSON.stringify(albumsData));
  } catch (e) {
    albumsData = [];
  }
  renderAlbums();
}

function renderAlbums() {
  currentAlbum = null;
  const titleEl   = document.getElementById('galleryTitle');
  const tagEl     = document.getElementById('galleryTag');
  const actionsEl = document.getElementById('galleryActions');
  const grid      = document.getElementById('gGrid');
  if (!grid) return;

  if (titleEl)   titleEl.innerHTML  = 'Event Albums';
  if (tagEl)     tagEl.innerHTML    = 'Our Work';
  if (actionsEl) actionsEl.innerHTML = '';

  if (!albumsData || !albumsData.length) {
    grid.innerHTML = '<div class="g-empty"><div class="g-empty-icon">🎬</div><p>No albums yet</p></div>';
    return;
  }

  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;';
  grid.innerHTML = albumsData.map((album, idx) => `
    <div class="album-card" onclick="openAlbum(${idx})" role="button" tabindex="0">
      <img src="images/${album.cover}" alt="${album.title}" loading="lazy" decoding="async" width="400" height="300">
      <div class="album-info">
        <div class="album-title">${album.title}</div>
        <div class="album-meta">${album.photos.length} Photos · ${album.date}</div>
      </div>
    </div>
  `).join('');
}

function openAlbum(idx) {
  currentAlbum = albumsData[idx];
  const titleEl   = document.getElementById('galleryTitle');
  const tagEl     = document.getElementById('galleryTag');
  const actionsEl = document.getElementById('galleryActions');
  const grid      = document.getElementById('gGrid');

  if (titleEl)  titleEl.innerHTML = currentAlbum.title;
  if (tagEl)    tagEl.innerHTML   = 'Album';

  if (actionsEl) {
    actionsEl.innerHTML = `<button class="btn-back-albums" onclick="renderAlbums()">← Back to Albums</button>`;
    if (window.matchMedia('(pointer: fine)').matches) {
      const btn    = actionsEl.querySelector('.btn-back-albums');
      const cursor = document.getElementById('cursor');
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*0.3}px,${(e.clientY-r.top-r.height/2)*0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform=''; cursor?.classList.remove('hover'); });
      btn.addEventListener('mouseenter', ()  => cursor?.classList.add('hover'));
    }
  }

  currentLightboxItems = currentAlbum.photos.map(p => ({ src: 'images/' + p, type: 'photo' }));
  grid.style.cssText = 'display:block;';

  grid.innerHTML = currentAlbum.photos.map((photo, i) => `
    <div class="g-cell" onclick="openLightbox(${i})" role="button" tabindex="0">
      <img src="images/${photo}" loading="lazy" decoding="async" width="600" height="400">
      <div class="g-cell-ov">🔍</div>
    </div>
  `).join('');

  document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── LIGHTBOX — cached refs ──
const _lb     = document.getElementById('lightbox');
const _lbWrap = document.getElementById('lbWrap');
const _lbCtr  = document.getElementById('lbCounter');

function openLightbox(idx) {
  openLightboxIdx = idx;
  const item = currentLightboxItems[idx];
  _lbWrap?.querySelectorAll('video,img').forEach(el => el.remove());

  if (item.type === 'video') {
    const v = document.createElement('video');
    v.src = item.src; v.controls = true; v.autoplay = true; v.style.width = '100%';
    _lbWrap?.appendChild(v);
  } else {
    const img = new Image();
    img.src = item.src;
    img.decoding = 'async';
    _lbWrap?.appendChild(img);
  }

  if (_lbCtr) _lbCtr.textContent = `${idx + 1} / ${currentLightboxItems.length}`;
  _lb?.classList.add('open');
}

function prevLightbox(e) {
  if (e) e.stopPropagation();
  if (!currentLightboxItems.length) return;
  openLightbox(openLightboxIdx > 0 ? openLightboxIdx - 1 : currentLightboxItems.length - 1);
}

function nextLightbox(e) {
  if (e) e.stopPropagation();
  if (!currentLightboxItems.length) return;
  openLightbox(openLightboxIdx < currentLightboxItems.length - 1 ? openLightboxIdx + 1 : 0);
}

function closeLightbox() {
  _lb?.classList.remove('open');
  if (_lbWrap) _lbWrap.innerHTML = '';
}

if (_lb) {
  _lb.addEventListener('click', function(e) {
    if (e.target === this || e.target.classList.contains('lb-controls')) closeLightbox();
  });
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', e => {
  if (!_lb?.classList.contains('open')) return;
  if (e.key === 'ArrowRight') nextLightbox();
  else if (e.key === 'ArrowLeft') prevLightbox();
  else if (e.key === 'Escape') closeLightbox();
});

// Swipe support
if (_lb) {
  let txStart = 0;
  _lb.addEventListener('touchstart', e => { txStart = e.changedTouches[0].screenX; }, { passive: true });
  _lb.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].screenX - txStart;
    if (diff < -50) nextLightbox();
    if (diff >  50) prevLightbox();
  }, { passive: true });
}

// ── COOKIE CONSENT ──
const _cb = document.getElementById('cookieBanner');
if (_cb && !localStorage.getItem('fxCookiesAccepted')) {
  setTimeout(() => _cb.classList.add('show'), 2000);
}
function acceptCookies() {
  localStorage.setItem('fxCookiesAccepted', 'true');
  _cb?.classList.remove('show');
}

// ── STATS COUNTER (IntersectionObserver, fires once) ──
const statsArea = document.getElementById('statsArea');
if (statsArea) {
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    document.querySelectorAll('.count-up').forEach(el => {
      const target = parseInt(el.getAttribute('data-target'));
      const start  = performance.now();
      const dur    = 3000;
      const tick   = t => {
        const p = Math.min((t - start) / dur, 1);
        el.textContent = Math.round((p === 1 ? 1 : 1 - Math.pow(2, -10 * p)) * target).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 }).observe(statsArea);
}

// ── CURSOR + TILT + MAGNETIC — fine pointer only ──
if (window.matchMedia('(pointer: fine)').matches) {
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('.srv-card'), {
      max: 7, speed: 400, glare: true, 'max-glare': 0.15
    });
  }

  const cursor     = document.getElementById('cursor');
  const cursorGlow = document.getElementById('cursor-glow');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let glowX  = mouseX, glowY = mouseY;

  // Direct transform — GPU compositor path, zero layout cost
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursor) cursor.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
  }, { passive: true });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    if (cursorGlow) cursorGlow.style.transform = `translate(${glowX - 200}px, ${glowY - 200}px)`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  document.querySelectorAll('a, button, .g-cell, .srv-card, [data-magnetic]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor?.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor?.classList.remove('hover'));
  });

  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*0.3}px,${(e.clientY-r.top-r.height/2)*0.3}px)`;
    }, { passive: true });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}
