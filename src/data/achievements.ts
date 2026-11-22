// Succès secrets : partagés entre la page (liste) et le script (déblocage)
export const achievements = [
  { id: 'clip', icon: '🎬', title: 'Monteuse en herbe', hint: 'Ouvrir un clip dans l’inspecteur' },
  { id: 'zoom', icon: '🔍', title: 'Plan serré', hint: 'Zoomer sur la timeline' },
  { id: 'past', icon: '🕰️', title: 'Retour en 2010', hint: 'Remonter le temps sur la timeline' },
  { id: 'glitch', icon: '👾', title: 'Bug visuel', hint: 'Survoler mon nom' },
  { id: 'subs', icon: '💬', title: 'Spectatrice attentive', hint: 'Lire tous les sous-titres de l’accueil' },
  { id: 'mix', icon: '🎚️', title: 'Ingé son', hint: 'Bouger un fader de la console' },
  { id: 'mute', icon: '🔇', title: 'Silence radio', hint: 'Couper complètement une piste' },
  { id: 'max', icon: '🔊', title: 'Tout à fond', hint: 'Pousser une piste au maximum' },
  { id: 'trailer', icon: '🍿', title: 'Avant-première', hint: 'Lancer la bande-annonce de Miratopia' },
  { id: 'play', icon: '🎮', title: 'Partie rapide', hint: 'Lancer un jeu de la ludothèque' },
  { id: 'collector', icon: '💿', title: 'Collectionneuse', hint: 'Lancer tous les jeux de la ludothèque' },
  { id: 'cv', icon: '📄', title: 'Recrutement express', hint: 'Télécharger le CV' },
  { id: 'network', icon: '🤝', title: 'Réseau', hint: 'Ouvrir mon LinkedIn ou mon GitHub' },
  { id: 'end', icon: '🏁', title: 'Jusqu’au générique', hint: 'Arriver au bout de la page' },
  { id: 'speedrun', icon: '⏱️', title: 'Speedrun', hint: 'Atteindre le générique en moins de 20 secondes' },
  { id: 'rewind', icon: '⏪', title: 'Rembobiner', hint: 'Revenir au début après le générique' },
  { id: 'konami', icon: '🕹️', title: 'Code secret', hint: 'Un code de triche bien connu' },
  { id: 'platine', icon: '🏆', title: 'Platine', hint: 'Débloquer tous les autres succès' },
] as const;

export type AchievementId = (typeof achievements)[number]['id'];
