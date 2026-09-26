/* ═══════════════════════════════════════════════
   THE LEGEND OF RUPESH — interactions & effects
   ═══════════════════════════════════════════════ */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Title screen ─────────────────────────────── */
const titleScreen = document.getElementById('title-screen');

function startAdventure() {
  if (!titleScreen || titleScreen.classList.contains('gone')) return;
  titleScreen.classList.add('gone');
  document.body.style.overflow = '';
  setTimeout(() => titleScreen.remove(), 1000);
}

document.body.style.overflow = 'hidden';
document.getElementById('press-start').addEventListener('click', startAdventure);
titleScreen.addEventListener('click', startAdventure);
window.addEventListener('keydown', startAdventure, { once: false });
// Auto-dismiss after 8s so nobody gets stuck on the title screen
setTimeout(startAdventure, 8000);

/* ── Fireflies canvas ─────────────────────────── */
const canvas = document.getElementById('fireflies');
const ctx = canvas.getContext('2d');
let flies = [];

function sizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function makeFlies() {
  const n = Math.min(60, Math.floor(canvas.width / 22));
  flies = Array.from({ length: n }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 1 + Math.random() * 2.2,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.35,
    phase: Math.random() * Math.PI * 2,
    speed: 0.008 + Math.random() * 0.02,
    hue: Math.random() < 0.8 ? 52 : 160          // mostly gold, a few green
  }));
}

function drawFlies() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const f of flies) {
    f.x += f.vx; f.y += f.vy; f.phase += f.speed;
    if (f.x < -10) f.x = canvas.width + 10;
    if (f.x > canvas.width + 10) f.x = -10;
    if (f.y < -10) f.y = canvas.height + 10;
    if (f.y > canvas.height + 10) f.y = -10;

    const glow = 0.35 + 0.65 * Math.abs(Math.sin(f.phase));
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6);
    g.addColorStop(0, `hsla(${f.hue}, 90%, 70%, ${glow})`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r * 6, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!reducedMotion) requestAnimationFrame(drawFlies);
}

sizeCanvas();
makeFlies();
drawFlies();
window.addEventListener('resize', () => { sizeCanvas(); makeFlies(); });

/* ── Typewriter ───────────────────────────────── */
const roles = ['FULL STACK DEVELOPER', 'REACT · NODE · FASTAPI', 'HERO OF THE CODEBASE'];
const twEl = document.getElementById('typewriter');
let roleIdx = 0, charIdx = 0, deleting = false;

function typeLoop() {
  const word = roles[roleIdx];
  twEl.textContent = word.slice(0, charIdx);
  let delay = deleting ? 40 : 95;

  if (!deleting && charIdx === word.length) { deleting = true; delay = 1800; }
  else if (deleting && charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; delay = 400; }
  else charIdx += deleting ? -1 : 1;

  setTimeout(typeLoop, delay);
}
if (reducedMotion) twEl.textContent = roles[0];
else typeLoop();

/* ── Scroll reveal ────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); }
  }
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Nav: scrolled state, magic meter, active link ── */
const nav = document.getElementById('nav');
const magicFill = document.getElementById('magic-fill');
const navLinks = [...document.querySelectorAll('[data-nav]')];
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);

  const max = document.documentElement.scrollHeight - innerHeight;
  magicFill.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

  let current = null;
  for (const s of sections) if (y >= s.offsetTop - innerHeight * 0.4) current = s.id;
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── Mobile nav ───────────────────────────────── */
const navToggle = document.getElementById('nav-toggle');
const navList = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navList.classList.toggle('open');
});
navList.addEventListener('click', e => {
  if (e.target.tagName === 'A') { navToggle.classList.remove('open'); navList.classList.remove('open'); }
});

/* ── Rupee counters ───────────────────────────── */
const counterObserver = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    counterObserver.unobserve(e.target);
    const target = +e.target.dataset.count;
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / 1400, 1);
      e.target.childNodes[0].nodeValue = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
}, { threshold: 0.6 });
document.querySelectorAll('.count').forEach(el => counterObserver.observe(el));

/* ── Inventory: item descriptions + "item get" pop ── */
const itemDesc = document.getElementById('item-desc');
document.querySelectorAll('.slot').forEach(slot => {
  const show = () => {
    itemDesc.innerHTML = '✨ YOU GOT <b>' + slot.querySelector('b').textContent.toUpperCase() + '</b>! ✨<br>' + slot.dataset.desc;
    slot.classList.remove('got');
    void slot.offsetWidth;               // restart animation
    slot.classList.add('got');
  };
  slot.addEventListener('mouseenter', show);
  slot.addEventListener('focus', show);
  slot.addEventListener('click', show);
});

/* ── Quest card 3D tilt ───────────────────────── */
if (!reducedMotion && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ── Gold sparkle cursor trail (throttled) ────── */
const sparkles = document.getElementById('sparkles');
let lastSpark = 0;
window.addEventListener('mousemove', e => {
  if (reducedMotion) return;
  const now = performance.now();
  if (now - lastSpark < 60) return;
  lastSpark = now;

  const s = document.createElement('span');
  s.className = 'spark';
  s.style.left = (e.clientX + (Math.random() * 14 - 7)) + 'px';
  s.style.top = (e.clientY + (Math.random() * 14 - 7)) + 'px';
  sparkles.appendChild(s);
  setTimeout(() => s.remove(), 700);
});

/* ── Legendary chest → resume download ────────── */
const chestBtn = document.getElementById('resume-chest');
const fanfare = document.getElementById('chest-fanfare');
let chestBusy = false;

const giveLoot = () => {
  const a = document.createElement('a');
  a.href = 'resume.pdf';
  a.download = 'resume.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
};

chestBtn.addEventListener('click', () => {
  // already open: just hand over the resume again
  if (chestBtn.classList.contains('open')) {
    if (!chestBusy) giveLoot();
    return;
  }
  chestBusy = true;
  chestBtn.classList.add('open');

  // burst of gold sparks from the chest mouth
  const r = chestBtn.getBoundingClientRect();
  for (let i = 0; i < 16; i++) {
    setTimeout(() => {
      const s = document.createElement('span');
      s.className = 'spark';
      s.style.left = r.left + r.width / 2 + (Math.random() * 140 - 70) + 'px';
      s.style.top = r.top + r.height * 0.35 + (Math.random() * 60 - 50) + 'px';
      sparkles.appendChild(s);
      setTimeout(() => s.remove(), 700);
    }, 350 + i * 50);
  }

  setTimeout(() => fanfare.classList.add('show'), 800);

  // hand over the loot; the chest stays open from here on
  setTimeout(() => {
    giveLoot();
    chestBusy = false;
  }, 1300);
});

/* ── Konami code → rupee rain ─────────────────── */
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let kIdx = 0;
window.addEventListener('keydown', e => {
  kIdx = (e.key === KONAMI[kIdx]) ? kIdx + 1 : (e.key === KONAMI[0] ? 1 : 0);
  if (kIdx === KONAMI.length) { kIdx = 0; rupeeRain(); }
});

function rupeeRain() {
  const colors = ['#46e08a', '#56b4ff', '#ff6b5e', '#e8c547', '#c47aff'];
  for (let i = 0; i < 60; i++) {
    const r = document.createElement('span');
    r.className = 'rain-rupee';
    r.style.left = Math.random() * 100 + 'vw';
    r.style.background = colors[Math.floor(Math.random() * colors.length)];
    r.style.boxShadow = `0 0 12px ${r.style.background}`;
    r.style.animationDuration = 1.6 + Math.random() * 2.2 + 's';
    r.style.animationDelay = Math.random() * 1.2 + 's';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 5200);
  }
}

/* ── Tiny chiptune blips (WebAudio, no files) ─── */
let audioCtx = null;

function playNotes(seq, type = 'triangle', vol = 0.1) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime;
    for (const [freq, start, dur] of seq) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t0 + start);
      gain.gain.linearRampToValueAtTime(vol, t0 + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + start + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t0 + start);
      osc.stop(t0 + start + dur + 0.05);
    }
  } catch (e) { /* audio blocked — stay silent */ }
}

const blipCollect = () => playNotes([[880, 0, 0.09], [1320, 0.07, 0.14]], 'square', 0.06);
const chimeFanfare = () => playNotes([[523, 0, 0.12], [659, 0.11, 0.12], [784, 0.22, 0.12], [1047, 0.33, 0.45]]);
const thudHurt = () => playNotes([[220, 0, 0.12], [165, 0.1, 0.18]], 'sawtooth', 0.05);

/* ── Toast messages ───────────────────────────── */
const toast = document.getElementById('toast');
let toastTimer;

function showToast(msg, dur = 3800) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), dur);
}

/* ── Hidden collectible rupees + wallet ───────── */
const walletEl = document.getElementById('rupee-count');
const RUPEE_COLORS = { 1: '#46e08a', 5: '#56b4ff', 20: '#ff6b5e' };
const rupeeSpots = [['about', 1], ['skills', 5], ['quests', 20], ['journey', 5], ['contact', 1]];
let wallet = 0;
let remaining = rupeeSpots.length;

rupeeSpots.forEach(([id, val]) => {
  const sec = document.getElementById(id);
  if (!sec) return;
  const b = document.createElement('button');
  b.className = 'collect-rupee';
  b.setAttribute('aria-label', 'Collect a hidden rupee');
  b.style.left = 6 + Math.random() * 86 + '%';
  b.style.top = 10 + Math.random() * 62 + '%';
  b.style.background = RUPEE_COLORS[val];
  b.style.filter = `drop-shadow(0 0 9px ${RUPEE_COLORS[val]})`;
  sec.appendChild(b);

  b.addEventListener('click', () => {
    if (b.classList.contains('pop')) return;
    b.classList.add('pop');
    blipCollect();
    wallet += val;
    walletEl.textContent = wallet;
    walletEl.classList.remove('bump');
    void walletEl.offsetWidth;
    walletEl.classList.add('bump');
    setTimeout(() => b.remove(), 500);
    if (--remaining === 0) {
      setTimeout(() => {
        showToast('💎 WALLET FULL — A TRUE HERO! 💎');
        chimeFanfare();
        rupeeRain();
      }, 400);
    }
  });
});

/* ── Sword slash on click ─────────────────────── */
window.addEventListener('pointerdown', e => {
  if (reducedMotion || e.pointerType !== 'mouse') return;
  const s = document.createElement('span');
  s.className = 'slash';
  s.style.left = e.clientX + 'px';
  s.style.top = e.clientY + 'px';
  s.style.setProperty('--ang', (Math.random() * 90 - 45) + 'deg');
  sparkles.appendChild(s);
  setTimeout(() => s.remove(), 420);
});

/* ── Hero parallax on mouse move ──────────────── */
if (!reducedMotion && matchMedia('(hover: hover)').matches) {
  const heroEl = document.getElementById('hero');
  const far = document.querySelector('.mtn-far');
  const mid = document.querySelector('.mtn-mid');
  const near = document.querySelector('.mtn-near');
  let px = 0, py = 0, ticking = false;

  heroEl.addEventListener('mousemove', e => {
    px = e.clientX / innerWidth - 0.5;
    py = e.clientY / innerHeight - 0.5;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      far.style.transform = `translate(${px * -8}px, ${py * -3}px)`;
      mid.style.transform = `translate(${px * -16}px, ${py * -6}px)`;
      near.style.transform = `translate(${px * -28}px, ${py * -10}px)`;
      ticking = false;
    });
  });
}

/* ── Magnetic hero buttons ────────────────────── */
if (!reducedMotion && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.hero-btns .btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.22;
      const dy = (e.clientY - r.top - r.height / 2) * 0.3;
      btn.style.transform = `translate(${dx}px, ${dy - 3}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ── Nav hearts: take damage, then full heal ──── */
const heartEls = [...document.querySelectorAll('.nav-hearts .heart')];
heartEls.forEach(h => {
  h.style.cursor = 'pointer';
  h.addEventListener('click', () => {
    if (h.classList.contains('empty')) return;
    h.classList.add('empty');
    thudHurt();
    if (heartEls.every(x => x.classList.contains('empty'))) {
      showToast('💀 GAME OVER? …just kidding. Fully healed! ❤');
      setTimeout(() => {
        heartEls.forEach((x, i) => setTimeout(() => x.classList.remove('empty'), i * 180));
        chimeFanfare();
      }, 1300);
    }
  });
});

/* ── Hero triforce: spin, click 3× for a surprise ── */
const heroTri = document.querySelector('.triforce-float');
let triClicks = 0, triTimer;
heroTri.style.cursor = 'pointer';
heroTri.addEventListener('click', () => {
  heroTri.classList.remove('spin');
  requestAnimationFrame(() => requestAnimationFrame(() => heroTri.classList.add('spin')));
  triClicks++;
  playNotes([[660 + triClicks * 120, 0, 0.15]], 'triangle', 0.07);
  clearTimeout(triTimer);
  triTimer = setTimeout(() => { triClicks = 0; }, 1600);
  if (triClicks >= 3) {
    triClicks = 0;
    chimeFanfare();
    rupeeRain();
    showToast('✨ THE TRIFORCE ANSWERS YOUR CALL ✨');
  }
});

/* ── Chest gets its own fanfare chime ─────────── */
let chestChimed = false;
chestBtn.addEventListener('click', () => {
  if (!chestChimed && chestBtn.classList.contains('open')) {
    chestChimed = true;
    setTimeout(chimeFanfare, 650);
  } else {
    blipCollect();
  }
});
