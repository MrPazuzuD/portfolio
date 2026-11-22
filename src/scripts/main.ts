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

// 2. Lien actif dans la navigation : la dernière section dont le haut a passé le tiers de l'écran
const navLinks = new Map<string, HTMLElement>();
document.querySelectorAll<HTMLElement>('[data-nav]').forEach((a) => navLinks.set(a.dataset.nav!, a));
const navSections = [...navLinks.keys()].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
let activeId = '';
function updateNav() {
  const line = innerHeight * 0.35;
  let current = '';
  for (const sec of navSections) if (sec.getBoundingClientRect().top <= line) current = sec.id;
  // Tout en bas de la page, la dernière section est active même si elle est courte
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = navSections.at(-1)?.id ?? current;
  if (current === activeId) return;
  activeId = current;
  navLinks.forEach((a, id) => a.classList.toggle('is-active', id === current));
}
let navTick = false;
addEventListener('scroll', () => { if (!navTick) { navTick = true; requestAnimationFrame(() => { updateNav(); navTick = false; }); } }, { passive: true });
addEventListener('resize', updateNav);
updateNav();

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

// 6 bis. Tout ce qui dépend de la date du jour : le site reste à jour sans être reconstruit
const today = new Date();
const monthsBetween = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return (today.getFullYear() - y) * 12 + today.getMonth() - (m - 1);
};
const fmtDuree = (n: number) => {
  n = Math.max(1, n);
  const a = Math.floor(n / 12), m = n % 12;
  const parts = [a ? `${a} an${a > 1 ? 's' : ''}` : '', m ? `${m} mois` : ''].filter(Boolean);
  return parts.join(' ');
};
function stampSince(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-since]').forEach((el) => {
    if (!el.dataset.base) el.dataset.base = el.textContent ?? '';
    el.textContent = `${el.dataset.base} · ${fmtDuree(monthsBetween(el.dataset.since!))}`;
  });
}
stampSince();
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = String(today.getFullYear())));

// 7. Timeline : zoom, repère de survol, inspecteur
const tl = document.querySelector<HTMLElement>('[data-tl]');
if (tl) {
  // Échelle recalculée à la date du jour : de l'année de départ à l'année en cours + 2
  const fromY = Number(tl.dataset.from) || 2010;
  const toY = today.getFullYear() + (Number(tl.dataset.ahead) || 2);
  const span = (toY - fromY) * 12;
  const mIdx = (ym: string) => { const [y, m] = ym.split('-').map(Number); return (y - fromY) * 12 + (m - 1); };
  const nowIdx = (today.getFullYear() - fromY) * 12 + today.getMonth() + today.getDate() / 31;
  tl.style.setProperty('--total', String(span));
  const yearsBox = tl.querySelector<HTMLElement>('[data-tl-years]');
  if (yearsBox) {
    yearsBox.innerHTML = '';
    for (let y = fromY; y < toY; y++) {
      const el = document.createElement('span');
      el.textContent = String(y);
      el.style.left = `${((y - fromY) * 12 / span) * 100}%`;
      yearsBox.append(el);
    }
  }
  tl.querySelectorAll<HTMLElement>('.clip').forEach((c) => {
    const s = mIdx(c.dataset.s!);
    const e = c.dataset.e ? mIdx(c.dataset.e) : span;
    c.style.left = `calc(${(s / span) * 100}% + 1px)`;
    c.style.width = `calc(${(Math.max(e - s, 1) / span) * 100}% - 2px)`;
  });
  tl.querySelector<HTMLElement>('[data-tl-now]')?.style.setProperty('--x', String(nowIdx / span));

  const grid = tl.querySelector<HTMLElement>('[data-tl-grid]')!;
  const scroller = tl.querySelector<HTMLElement>('[data-tl-scroll]')!;
  const range = tl.querySelector<HTMLInputElement>('[data-zoom-range]')!;
  const hover = tl.querySelector<HTMLElement>('[data-tl-hover]')!;
  const total = span;
  const from = fromY;
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
    if (Math.floor(nowIdx) === m) unlock('today');
  });
  grid.addEventListener('pointerleave', () => hover.classList.remove('is-on'));

  const raw = JSON.parse(tl.querySelector('[data-insp-data]')?.textContent || '{}');
  const data = raw.clips ?? {};
  const order: string[] = raw.order ?? [];
  const insp = tl.querySelector<HTMLElement>('[data-insp]')!;
  const field = (k: string) => insp.querySelector<HTMLElement>(`[data-i="${k}"]`)!;
  // Durée totale d'un clip, tous passages additionnés, à la date du jour
  const durOf = (segs: { s: string; e: string | null }[]) => segs.reduce((n, x) => {
    const [ys, ms] = x.s.split('-').map(Number);
    const end = x.e ? x.e.split('-').map(Number) : [today.getFullYear(), today.getMonth() + 1];
    return n + Math.max(1, (end[0] - ys) * 12 + (end[1] - ms) + (x.e ? 1 : 0));
  }, 0);
  let current = '';
  const select = (id: string) => {
    const c = data[id];
    if (!c) return;
    current = id;
    tl.querySelectorAll('.clip').forEach((el) => el.classList.toggle('is-selected', (el as HTMLElement).dataset.clip === id));
    insp.dataset.k = c.k;
    field('lane').textContent = c.lane;
    field('thumb').textContent = (c.sh || c.o).slice(0, 1);
    field('t').textContent = c.t;
    field('o').textContent = c.o;
    field('d').textContent = c.d;
    // Formations : en années scolaires (une année se termine en juillet, pas en septembre)
    const n = durOf(c.segs);
    const yrs = Math.round(n / 12);
    field('dur').textContent = c.dur || (c.k === 'formation' && yrs > 0 ? `${yrs} an${yrs > 1 ? 's' : ''}` : fmtDuree(n));
    field('p').textContent = c.p || '—';
    field('g').textContent = /obtenu/i.test(c.g) ? `✓ ${c.g}` : c.g;
    field('g').classList.toggle('tag--ok', /obtenu/i.test(c.g));
    field('ptk').textContent = c.k === 'formation' ? 'Détails' : 'Missions';
    field('pts').innerHTML = '';
    c.pts.forEach((p: string) => { const li = document.createElement('li'); li.textContent = p; field('pts').append(li); });
    field('ptsbox').hidden = c.pts.length === 0;
    const i = order.indexOf(id);
    field('pos').textContent = i >= 0 ? `${i + 1} / ${order.length}` : '';
    insp.classList.remove('is-swap'); void insp.offsetWidth; insp.classList.add('is-swap');
  };
  insp.querySelectorAll<HTMLButtonElement>('[data-insp-step]').forEach((b) => b.addEventListener('click', () => {
    const i = order.indexOf(current);
    const next = order[(i + Number(b.dataset.inspStep) + order.length) % order.length];
    select(next);
    unlock('clip');
    if (next === 'alterboutique') unlock('colis');
    if (next === 'bt-musique') unlock('sources');
  }));
  tl.querySelectorAll<HTMLAnchorElement>('.clip').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.dataset.clip!;
      // Les clips créa renvoient vers leur section ; les autres s'ouvrent dans l'inspecteur
      if (a.classList.contains('clip--crea')) return;
      e.preventDefault();
      select(id);
      unlock('clip');
      if (id === 'alterboutique') unlock('colis');
      if (id === 'bt-musique') unlock('sources');
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

// 9. Console de mixage : faders, muet, solo, boutons rotatifs, master
const strips = document.querySelector<HTMLElement>('[data-strips]');
if (strips) {
  const all = [...strips.querySelectorAll<HTMLElement>('[data-strip]')];
  const refresh = () => {
    const soloed = all.filter((st) => st.querySelector('[data-solo]')?.getAttribute('aria-pressed') === 'true');
    all.forEach((st) => {
      const muted = st.querySelector('[data-mute]')?.getAttribute('aria-pressed') === 'true';
      const off = muted || (soloed.length > 0 && !soloed.includes(st));
      st.classList.toggle('is-off', off);
      st.style.setProperty('--on', off ? '0' : '1');
    });
  };
  all.forEach((st) => {
    st.querySelector<HTMLInputElement>('[data-fader]')?.addEventListener('input', (e) => {
      const f = e.target as HTMLInputElement;
      st.style.setProperty('--lv', f.value);
      unlock('mix');
      if (Number(f.value) === 0) unlock('mute');
      if (Number(f.value) === 100) unlock('max');
    });
    st.querySelector('[data-mute]')?.addEventListener('click', (e) => {
      const b = e.currentTarget as HTMLElement;
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      if (on) unlock('mute');
      refresh();
    });
    st.querySelector('[data-solo]')?.addEventListener('click', (e) => {
      const b = e.currentTarget as HTMLElement;
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      if (on) unlock('solo');
      refresh();
    });
    // Bouton rotatif : glisser vers le haut ou le bas, ou flèches du clavier
    const knob = st.querySelector<HTMLElement>('[data-knob]');
    if (knob) {
      let val = Number(knob.getAttribute('aria-valuenow')) || 0, startY = 0, startV = 0, moved = false;
      const set = (v: number) => {
        val = Math.max(-135, Math.min(135, Math.round(v)));
        st.style.setProperty('--r', `${val}deg`);
        knob.setAttribute('aria-valuenow', String(val));
        unlock('mix');
      };
      knob.addEventListener('pointerdown', (e) => { e.preventDefault(); startY = e.clientY; startV = val; moved = false; knob.setPointerCapture(e.pointerId); });
      knob.addEventListener('pointermove', (e) => {
        if (!knob.hasPointerCapture(e.pointerId)) return;
        const dy = startY - e.clientY;
        if (Math.abs(dy) > 2) moved = true;
        set(startV + dy * 2);
      });
      knob.addEventListener('click', () => { if (!moved) set(val + 45 > 135 ? -135 : val + 45); });
      knob.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { set(val + 15); e.preventDefault(); }
        if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { set(val - 15); e.preventDefault(); }
      });
    }
  });
  strips.querySelector<HTMLInputElement>('[data-master]')?.addEventListener('input', (e) => {
    const v = (e.target as HTMLInputElement).value;
    strips.style.setProperty('--master', v);
    unlock('mix');
    if (Number(v) === 0) unlock('mute');
  });
}

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
  unlock('lynx');
}));
zoomDlg?.querySelector('[data-zoom-close]')?.addEventListener('click', () => zoomDlg.close());
zoomDlg?.addEventListener('click', (e) => { if (e.target === zoomDlg) zoomDlg.close(); });

// 12. Liens suivis
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest('a');
  if (!a) return;
  if (a.hasAttribute('download')) unlock('cv');
  const h = a.href;
  if (/linkedin\.com|github\.com/.test(h)) unlock('network');
  if (h.includes('open.spotify.com')) unlock('spotify');
  if (h.includes('steamcommunity.com')) unlock('steam');
  if (h.includes('senscritique.com')) unlock('cine');
  if (/youtube\.com\/@tacxtv/i.test(h)) unlock('coulisses');
  if (/youtube\.com\/@pazuzuuu_/i.test(h)) unlock('creations');
  if (h.includes('twitch.tv')) unlock('live');
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
