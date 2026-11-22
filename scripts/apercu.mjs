// Prépare une copie de dist/ pour l'aperçu privé sur claude.ai :
// chemins relatifs, polices latin uniquement, vidéo YouTube ouverte dans un nouvel onglet
// (les iframes externes sont bloquées dans ce cadre). Résultat dans apercu/ (ignoré par Git).
import { cpSync, rmSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';

const out = 'apercu';
rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}/assets`, { recursive: true });
cpSync('dist/index.html', `${out}/index.html`);
cpSync('dist/favicon.svg', `${out}/favicon.svg`);
for (const f of readdirSync('dist/assets')) {
  if (f.endsWith('.css') || f.endsWith('.js') || /-latin(-ext)?-wght/.test(f)) cpSync(`dist/assets/${f}`, `${out}/assets/${f}`);
}
const html = readFileSync(`${out}/index.html`, 'utf8')
  .replaceAll('"/assets/', '"./assets/')
  .replaceAll('"/favicon.svg"', '"./favicon.svg"')
  .replaceAll('data-yt=', 'data-yt-off=');
writeFileSync(`${out}/index.html`, html);
for (const f of readdirSync(`${out}/assets`).filter((f) => f.endsWith('.css'))) {
  const p = `${out}/assets/${f}`;
  writeFileSync(p, readFileSync(p, 'utf8').replaceAll('url(/assets/', 'url(./'));
}
console.log(readdirSync(`${out}/assets`).map((f) => `assets/${f}`).join('\n'));
