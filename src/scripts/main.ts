// Interactions du site. Tout reste lisible sans JavaScript : ce fichier n'ajoute que des effets.
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
document.querySelectorAll<HTMLElement>('[data-yt]').forEach((box) => {
  const link = box.querySelector('a');
  link?.addEventListener('click', (ev) => {
    ev.preventDefault();
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1&rel=0`;
    iframe.title = link.querySelector('.sr-only')?.textContent ?? 'Vidéo YouTube';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    link.replaceWith(iframe);
    iframe.focus();
  });
});
