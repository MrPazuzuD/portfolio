// Interactions du site. Tout reste lisible sans JavaScript : ce fichier n'ajoute que des effets.
import { achievements } from '../data/achievements';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Tête de lecture + timecode : la page entière dure 2 minutes (le temps d'un recruteur)
const DURATION = 120; // secondes
const FPS = 25;
const tcEls = document.querySelectorAll<HTMLElement>('[data-tc]');
const head = document.querySelector<HTMLElement>('[data-head]');
const fill = document.querySelector<HTMLElement>('[data-fill]');
const pad = (n: number) => String(n).padStart(2, '0');

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  const t = p * DURATION;
  const tc = `00:${pad(Math.floor(t / 60))}:${pad(Math.floor(t % 60))}:${pad(Math.floor((t % 1) * FPS))}`;
  tcEls.forEach((el) => (el.textContent = tc));
  if (head) head.style.left = `${p * 100}%`;
  if (fill) fill.style.width = `${p * 100}%`;
}
let ticking = false;
addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; }
}, { passive: true });
onScroll();

// 2. Lien actif dans la navigation
const navLinks = new Map<string, HTMLElement>();
document.querySelectorAll<HTMLElement>('[data-nav]').forEach((a) => navLinks.set(a.dataset.nav!, a));
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      navLinks.forEach((a) => a.classList.remove('is-active'));
      navLinks.get(e.target.id)?.classList.add('is-active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

// 3. Apparition des blocs au défilement
const reveals = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  reveals.forEach((el) => io.observe(el));
}

// 4. Fermer le menu mobile après un clic
document.querySelectorAll<HTMLAnchorElement>('.menu a').forEach((a) =>
  a.addEventListener('click', () => a.closest('details')?.removeAttribute('open')));

// 5. Forme d'onde : lecture / pause (purement visuel, aucun son)
const waveBtn = document.querySelector<HTMLButtonElement>('[data-wave-toggle]');
const wave = document.querySelector<HTMLElement>('[data-wave]');
waveBtn?.addEventListener('click', () => {
  const on = waveBtn.getAttribute('aria-pressed') !== 'true';
  waveBtn.setAttribute('aria-pressed', String(on));
  wave?.classList.toggle('is-playing', on);
});

// 6. Lecteur YouTube léger : rien n'est chargé depuis YouTube avant le clic
document.querySelectorAll<HTMLElement>('[data-yt], [data-yt-off]').forEach((box) => {
  const link = box.querySelector('a');
  link?.addEventListener('click', (ev) => {
    if (!box.dataset.yt) { unlock('trailer'); return; }
    ev.preventDefault();
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1&rel=0`;
    iframe.title = link.querySelector('.sr-only')?.textContent ?? 'Vidéo YouTube';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    link.replaceWith(iframe);
    iframe.focus();
    unlock('trailer');
  });
});

// 7. Timeline : zoom, repère de survol, inspecteur
const tl = document.querySelector<HTMLElement>('[data-tl]');
if (tl) {
  const grid = tl.querySelector<HTMLElement>('[data-tl-grid]')!;
  const scroller = tl.querySelector<HTMLElement>('[data-tl-scroll]')!;
  const range = tl.querySelector<HTMLInputElement>('[data-zoom-range]')!;
  const hover = tl.querySelector<HTMLElement>('[data-tl-hover]')!;
  const total = Number(getComputedStyle(tl).getPropertyValue('--total')) || 168;
  const from = 2010;
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  const setZoom = (z: number, anchor = 0.5) => {
    z = Math.min(4, Math.max(1, z));
    const before = (scroller.scrollLeft + scroller.clientWidth * anchor) / grid.scrollWidth;
    grid.style.setProperty('--zoom', String(z));
    if (z > 1) unlock('zoom');
    range.value = String(z);
    scroller.scrollLeft = before * grid.scrollWidth - scroller.clientWidth * anchor;
  };
  tl.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach((b) =>
    b.addEventListener('click', () => setZoom(Number(range.value) + Number(b.dataset.zoom) * 0.5)));
  range.addEventListener('input', () => setZoom(Number(range.value)));
  tl.querySelector('[data-zoom-fit]')?.addEventListener('click', () => setZoom(1));
  // Ctrl + molette pour zoomer, comme dans un logiciel de montage
  scroller.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const r = scroller.getBoundingClientRect();
    setZoom(Number(range.value) - Math.sign(e.deltaY) * 0.25, (e.clientX - r.left) / r.width);
  }, { passive: false });

  grid.addEventListener('pointermove', (e) => {
    const r = grid.getBoundingClientRect();
    const usable = r.width - 16;
    const x = e.clientX - r.left;
    if (x < 0 || x > usable) return hover.classList.remove('is-on');
    const m = Math.floor((x / usable) * total);
    hover.style.left = `${x}px`;
    hover.querySelector('span')!.textContent = `${months[m % 12]} ${from + Math.floor(m / 12)}`;
    hover.classList.add('is-on');
    if (m < 12) unlock('past');
  });
  grid.addEventListener('pointerleave', () => hover.classList.remove('is-on'));

  const data = JSON.parse(tl.querySelector('[data-insp-data]')?.textContent || '{}');
  const insp = tl.querySelector<HTMLElement>('[data-insp]')!;
  const field = (k: string) => insp.querySelector<HTMLElement>(`[data-i="${k}"]`)!;
  const select = (id: string) => {
    const c = data[id];
    if (!c) return;
    tl.querySelectorAll('.clip').forEach((el) => el.classList.toggle('is-selected', (el as HTMLElement).dataset.clip === id));
    field('t').textContent = c.t;
    field('o').textContent = c.p ? `${c.o} · ${c.p}` : c.o;
    field('d').textContent = c.d;
    field('g').textContent = c.g;
    field('pts').innerHTML = '';
    c.pts.forEach((p: string) => { const li = document.createElement('li'); li.textContent = p; field('pts').append(li); });
    insp.classList.remove('is-swap'); void insp.offsetWidth; insp.classList.add('is-swap');
  };
  tl.querySelectorAll<HTMLAnchorElement>('.clip').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.dataset.clip!;
      // Les clips créa renvoient vers leur section ; les autres s'ouvrent dans l'inspecteur
      if (a.classList.contains('clip--crea')) return;
      e.preventDefault();
      select(id);
      unlock('clip');
    });
  });
  select(tl.querySelector<HTMLElement>('.clip--pro.clip--live')?.dataset.clip ?? '');
}

// 8. Sous-titres de l'accueil
const subs = document.querySelector<HTMLElement>('[data-subs]');
if (subs && !reduceMotion) {
  const lines = [
    '[Bruit de clavier]',
    'Support informatique, bonjour, je vous écoute.',
    'Vous avez essayé de redémarrer ?',
    '[Musique épique]',
    'Rendu terminé. Lecture dans 3, 2, 1…',
  ];
  let i = 0;
  setInterval(() => {
    subs.classList.add('is-out');
    setTimeout(() => {
      i = (i + 1) % lines.length;
      subs.textContent = lines[i];
      subs.classList.remove('is-out');
      // Tous les sous-titres lus, et l'accueil toujours à l'écran
      if (i === lines.length - 1 && scrollY < innerHeight * 0.6) unlock('subs');
    }, 300);
  }, 3200);
}
document.querySelector('#hero-title')?.addEventListener('pointerenter', () => unlock('glitch'));

// 9. Faders de la console : le vumètre suit le curseur
document.querySelectorAll<HTMLInputElement>('[data-fader]').forEach((f) => {
  f.addEventListener('input', () => {
    f.closest<HTMLElement>('.strip')?.style.setProperty('--lv', f.value);
    unlock('mix');
    if (Number(f.value) === 0) unlock('mute');
    if (Number(f.value) === 100) unlock('max');
  });
});

// 10. Inclinaison 3D au survol (souris uniquement)
if (!reduceMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll<HTMLElement>('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-3px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

// 11. Ludothèque : lancer une partie
const played = new Set<number>();
const gameBtns = document.querySelectorAll<HTMLButtonElement>('[data-game]');
gameBtns.forEach((b, i) => {
  b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    if (!on) return;
    played.add(i);
    unlock('play');
    if (played.size === gameBtns.length) unlock('collector');
  });
});

// 11 bis. Agrandir une capture
const zoomDlg = document.querySelector<HTMLDialogElement>('[data-zoom-dialog]');
document.querySelectorAll<HTMLElement>('[data-zoom-img]').forEach((b) => b.addEventListener('click', () => {
  if (!zoomDlg) return;
  const img = zoomDlg.querySelector<HTMLImageElement>('[data-zoom-target]')!;
  img.src = b.querySelector('img')?.getAttribute('src') ?? b.dataset.zoomImg!;
  img.alt = b.querySelector('img')?.alt ?? '';
  zoomDlg.showModal();
}));
zoomDlg?.querySelector('[data-zoom-close]')?.addEventListener('click', () => zoomDlg.close());
zoomDlg?.addEventListener('click', (e) => { if (e.target === zoomDlg) zoomDlg.close(); });

// 12. Liens suivis
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest('a');
  if (!a) return;
  if (a.hasAttribute('download')) unlock('cv');
  if (/linkedin\.com|github\.com/.test(a.href)) unlock('network');
});

// 13. Succès : déblocage, toasts, panneau, progression gardée dans le navigateur
function unlock(id: string) {
  if (unlocked.has(id) || !byId.has(id)) return;
  unlocked.add(id);
  save();
  render();
  toast(id);
  if (id !== 'platine' && unlocked.size === achievements.length - 1) setTimeout(() => unlock('platine'), 900);
}
const byId = new Map<string, (typeof achievements)[number]>(achievements.map((a) => [a.id, a]));
const KEY = 'mr-succes';
const unlocked = new Set<string>();
try { (JSON.parse(localStorage.getItem(KEY) || '[]') as string[]).forEach((id) => byId.has(id) && unlocked.add(id)); } catch { /* stockage indisponible */ }
function save() { try { localStorage.setItem(KEY, JSON.stringify([...unlocked])); } catch { /* rien */ } }
function render() {
  document.querySelectorAll('[data-ach-count]').forEach((el) => (el.textContent = String(unlocked.size)));
  const bar = document.querySelector<HTMLElement>('[data-ach-bar]');
  if (bar) bar.style.width = `${(unlocked.size / achievements.length) * 100}%`;
  document.querySelectorAll<HTMLElement>('[data-ach]').forEach((li) => {
    const on = unlocked.has(li.dataset.ach!);
    li.classList.toggle('is-on', on);
    li.querySelector('[data-ach-state]')!.textContent = on ? 'Débloqué' : 'Verrouillé';
  });
}
function toast(id: string) {
  const a = byId.get(id)!;
  let box = document.querySelector('.toasts');
  if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.append(box); }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="toast__icon" aria-hidden="true">${a.icon}</span><div><b>Succès débloqué : ${a.title}</b><span>${a.hint} · ${unlocked.size}/${achievements.length}</span></div>`;
  box.append(t);
  while (box.children.length > 3) box.firstElementChild?.remove();
  const trophy = document.querySelector('.trophy');
  trophy?.classList.remove('is-bump'); void (trophy as HTMLElement | null)?.offsetWidth; trophy?.classList.add('is-bump');
  setTimeout(() => { t.classList.add('is-out'); setTimeout(() => t.remove(), 400); }, 4200);
}
render();

const dialog = document.querySelector<HTMLDialogElement>('[data-ach-dialog]');
document.querySelector('[data-ach-open]')?.addEventListener('click', () => dialog?.showModal());
dialog?.querySelector('[data-ach-close]')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

// Générique, speedrun et rembobinage
const credits = document.querySelector('.credits');
if (credits) {
  new IntersectionObserver((e) => {
    if (!e[0].isIntersecting) return;
    unlock('end');
    if (performance.now() < 20000) unlock('speedrun');
  }).observe(credits);
}
addEventListener('scroll', () => { if (unlocked.has('end') && scrollY < 80) unlock('rewind'); }, { passive: true });

// Code secret : mode arcade
const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let pos = 0;
addEventListener('keydown', (e) => {
  pos = e.key.toLowerCase() === code[pos].toLowerCase() ? pos + 1 : (e.key === code[0] ? 1 : 0);
  if (pos === code.length) { pos = 0; unlock('konami'); document.documentElement.classList.toggle('arcade'); }
});
