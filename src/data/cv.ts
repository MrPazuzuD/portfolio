// Tout le contenu du site et du CV PDF vient de ce fichier.
// Règle : rien de privé ici (ni téléphone, ni adresse, ni mail perso). Le dépôt est public.

export type Track = 'pro' | 'formation' | 'crea';

export interface Clip {
  id: string;
  track: Track;
  /** Ligne de la timeline (V1, V2, A1...) */
  lane: string;
  title: string;
  org: string;
  /** Libellé court affiché sur la timeline */
  short?: string;
  place?: string;
  /** Format AAAA-MM. `end: null` = en cours */
  start: string;
  end: string | null;
  /** Durée écrite à la main quand le calcul au mois près serait trompeur (passages courts) */
  dur?: string;
  /** Autres passages au même poste, affichés comme clips séparés sur la timeline */
  more?: { start: string; end: string }[];
  /** Texte affiché pour les dates (le CV n'a parfois que les années) */
  period: string;
  tag?: string;
  points: string[];
}

export const profile = {
  firstName: 'Marine',
  lastName: 'Rimpot',
  title: 'Technicienne support & systèmes',
  current: 'Hotline et support logiciel chez 2DCOM (Chavigny, 54)',
  location: 'Épinal (88)',
  locationLabel: 'Basée à Épinal (88)',
  pitch:
    'Je dépanne, j’explique, j’automatise quand je peux. Le reste du temps, je monte des vidéos, je chante et je joue.',
  // Mettre le chemin d'une image dans public/ (ex. '/photo.webp') pour afficher la photo
  photo: null as string | null,
  // Laisser vide tant qu'il n'y a pas d'adresse pro dédiée
  email: '' as string,
  links: {
    linkedin: 'https://www.linkedin.com/in/marine-rimpot-927815208/',
    github: 'https://github.com/MrPazuzuD',
    twitch: 'https://www.twitch.tv/pazuzuuu_',
    youtube: 'https://www.youtube.com/@pazuzuuu_',
    steam: 'https://steamcommunity.com/profiles/76561199040627675/',
    senscritique: 'https://www.senscritique.com/Pazuzuuu',
    // Chaîne pour laquelle je fais l'essentiel de mon montage (lien à confirmer)
    tacxtv: 'https://www.youtube.com/@tacxtv' as string,
  },
  cvPdf: '/cv/Marine-Rimpot-CV.pdf',
};

export const experiences: Clip[] = [
  {
    id: '2dcom',
    track: 'pro',
    lane: 'V1',
    title: 'Hotlineuse, support logiciel',
    org: '2DCOM',
    place: 'Chavigny (54)',
    start: '2026-10',
    end: null,
    period: 'Depuis oct. 2026',
    tag: 'CDI',
    points: [
      'Assistance téléphonique sur des logiciels de gestion pour les professionnels du livre',
      'Analyse des demandes, diagnostic et résolution',
      'Accompagnement des clients dans la prise en main des logiciels',
    ],
  },
  {
    id: 'sidsic',
    track: 'pro',
    lane: 'V1',
    title: 'Technicienne support & systèmes',
    org: 'Préfecture des Vosges, SIDSIC',
    short: 'SIDSIC',
    place: 'Épinal',
    start: '2022-09',
    end: '2024-08',
    period: '2022 – 2024',
    tag: 'Alternance',
    points: [
      'Support N1/N2 sur site : incidents matériel, logiciel et réseau',
      'Configuration et déploiement de postes Windows, Active Directory et GPO',
      'Gestion des tickets et de l’inventaire du parc (GLPI, OCS Inventory)',
      'Administratrice locale WAPT sur un parc de 450 postes Windows (projet pilote national, Ministère de l’Intérieur) : installation et configuration du serveur WAPT sur Debian 12 en environnement de test, création et correction de paquets Python, déploiement sur le parc, formation des techniciens',
    ],
  },
  {
    id: 'leclerc',
    track: 'pro',
    lane: 'V1',
    title: 'Mise en rayon et inventaire',
    org: 'E.Leclerc',
    short: 'Leclerc',
    place: 'Neufchâteau',
    start: '2021-07',
    end: '2021-09',
    period: 'Juil. – sept. 2021',
    tag: 'Saisonnier',
    points: ['Réassort, inventaire et rigueur sur les stocks'],
  },
  {
    id: 'alterboutique',
    track: 'pro',
    lane: 'V1',
    title: 'Préparation de commandes',
    org: 'Alterboutique',
    short: 'Alterboutique',
    place: 'Toul',
    start: '2018-07',
    end: '2018-08',
    more: [{ start: '2026-08', end: '2026-09' }],
    dur: 'Environ 2 mois (2 passages)',
    period: 'Août – sept. 2026 · juil. 2018',
    tag: 'Saisonnier',
    points: ['Préparation et expédition des commandes'],
  },
  {
    id: 'mjc',
    track: 'pro',
    lane: 'V1',
    title: 'Animatrice enfants',
    org: 'MJC Beauregard',
    short: 'MJC',
    place: 'Nancy',
    start: '2019-09',
    end: '2020-07',
    period: 'Sept. 2019 – juil. 2020',
    points: ['Préparation et animation d’activités pour des groupes d’enfants'],
  },
];

export const formations: Clip[] = [
  {
    id: 'cesi',
    track: 'formation',
    lane: 'V2',
    title: 'Gestionnaire en maintenance et support informatique',
    org: 'CESI',
    place: 'Vandœuvre-lès-Nancy',
    start: '2022-09',
    end: '2024-08',
    period: '2022 – 2024',
    tag: 'Bac+2 obtenu',
    points: ['Formation en alternance, en parallèle du poste au SIDSIC'],
  },
  {
    id: 'psycho',
    track: 'formation',
    lane: 'V2',
    title: 'Études de psychologie',
    org: 'Université de Lorraine',
    short: 'Psychologie',
    place: 'Nancy',
    start: '2017-09',
    end: '2021-06',
    period: '2017 – 2021',
    points: [
      'Présidente de l’association LESPSY (400+ étudiants)',
      'Représentante de promotion et de licence',
    ],
  },
  {
    id: 'bac',
    track: 'formation',
    lane: 'V2',
    title: 'Baccalauréat santé et social',
    org: 'Lycée Arthur Varoquaux',
    short: 'Arthur Varoquaux',
    place: 'Tomblaine',
    start: '2014-09',
    end: '2017-07',
    period: '2014 – 2017',
    tag: 'Obtenu',
    points: [],
  },
  {
    id: 'bt-musique',
    track: 'formation',
    lane: 'V2',
    title: 'Brevet de technicien des métiers de la musique',
    org: 'Lycée Claude Daunot',
    short: 'Claude Daunot',
    place: 'Nancy',
    start: '2010-09',
    end: '2013-07',
    period: '2010 – 2013',
    points: [],
  },
];

// Toujours du plus récent au plus ancien, quel que soit l'ordre de saisie
// (pour un poste occupé plusieurs fois, c'est le passage le plus récent qui compte)
const lastStart = (c: Clip) => [c.start, ...(c.more ?? []).map((m) => m.start)].sort().at(-1)!;
for (const list of [experiences, formations]) list.sort((a, b) => lastStart(b).localeCompare(lastStart(a)));

// Pistes "créa" : affichées sur la timeline, détaillées dans Projets et Hors champ
export const creaClips: Clip[] = [
  {
    id: 'contenu',
    track: 'crea',
    lane: 'A1',
    title: 'Création de contenu',
    org: 'YouTube, TikTok, Twitch',
    start: '2020-01',
    end: null,
    period: 'Depuis 2020',
    points: [],
  },
  {
    id: 'caritatif',
    track: 'crea',
    lane: 'A2',
    title: 'Événements caritatifs gaming',
    org: 'TTV Fest, Téléthon Gaming…',
    start: '2021-01',
    end: null,
    period: 'Depuis 2021',
    points: [],
  },
  {
    id: 'miratopia',
    track: 'crea',
    lane: 'A3',
    title: 'Miratopia',
    org: 'Serveur Minecraft scénarisé',
    start: '2022-01',
    end: null,
    period: 'Depuis 2022',
    points: [],
  },
];

// La fin de l'échelle suit la date du jour (année en cours + 2), recalculée dans le navigateur
export const timelineRange = { from: 2010, yearsAhead: 2 };

export const lanes = [
  { id: 'V1', label: 'Pro', track: 'pro' as Track },
  { id: 'V2', label: 'Formation', track: 'formation' as Track },
  { id: 'A1', label: 'Contenu', track: 'crea' as Track },
  { id: 'A2', label: 'Caritatif', track: 'crea' as Track },
  { id: 'A3', label: 'Miratopia', track: 'crea' as Track },
];

export const skills = [
  {
    group: 'Systèmes',
    items: ['Windows', 'Windows Server', 'Debian / Linux', 'Active Directory', 'GPO', 'Proxmox, Hyper-V'],
    where: 'SIDSIC',
  },
  {
    group: 'Parc & déploiement',
    items: ['GLPI', 'OCS Inventory', 'WAPT', 'Déploiement de postes', 'Gestion de tickets'],
    where: 'SIDSIC',
  },
  {
    group: 'Réseau',
    items: ['TCP/IP', 'Câblage et brassage', 'Surveillance réseau', 'SSH'],
    where: 'SIDSIC',
  },
  {
    group: 'Scripts & outils',
    items: ['PowerShell', 'Python', 'Git et GitHub', 'ffmpeg'],
    where: 'SIDSIC, Video Toolbox',
  },
  {
    group: 'Relation utilisateur',
    items: ['Support téléphonique', 'Diagnostic à distance', 'Pédagogie', 'Analyse des besoins', 'Formation de techniciens'],
    where: '2DCOM, SIDSIC',
  },
  {
    group: 'Savoir-être',
    items: ['Écoute', 'Rigueur', 'Autonomie', 'Gestion d’équipe', 'Organisation d’événements', 'Modération de communautés', 'Adaptabilité'],
    where: 'LESPSY, Miratopia, lives caritatifs',
  },
];

export const projects = [
  {
    id: 'video-toolbox',
    name: 'Video Toolbox',
    kind: 'Application de bureau',
    year: '2026',
    stack: ['Python', 'ffmpeg', 'NVENC', 'Tkinter'],
    summary:
      'Plus de 700 vieilles vidéos DivX que la télé refusait de lire. Plutôt que de tout convertir à la main, j’ai imaginé une application qui le fait proprement : j’ai défini le besoin et les fonctions, puis testé chaque version. Le code a été écrit avec l’IA.',
    points: [
      'Analyse par glisser-déposer et verdict de compatibilité TV',
      'Sept préréglages de conversion, accélération par la carte graphique avec repli automatique sur le processeur',
      'Vérification d’intégrité avant de mettre l’original à la corbeille',
      'Lots décrits en JSON, reprise après interruption',
    ],
    link: null as string | null,
    linkLabel: 'Dépôt public bientôt',
  },
  {
    id: 'miratopia',
    name: 'Miratopia',
    kind: 'Serveur Minecraft scénarisé',
    year: 'Depuis 2022',
    stack: ['Administration', 'Modération', 'Communauté'],
    summary:
      'Un projet monté avec des amis : un serveur Minecraft avec une vraie histoire, des personnages doublés et des quêtes. J’y gère l’administration, la modération et la vie de la communauté.',
    points: [],
    youtube: { id: 'nfwdT6BOSbM', title: 'Bande-annonce de Miratopia', thumb: '/miratopia.webp' },
    link: null as string | null,
    linkLabel: '',
  },
  {
    id: 'caritatif',
    name: 'Événements caritatifs gaming',
    kind: 'Modération & création',
    year: 'Depuis 2021',
    stack: ['Modération', 'Création de contenu', 'Live'],
    summary:
      'Des lives de jeu au profit d’associations : TTV Fest, Téléthon Gaming, Une semaine pour l’espoir, Arma des dons. J’y modère les chats et je crée du contenu pour d’autres streameurs.',
    points: [],
    link: null as string | null,
    linkLabel: '',
  },
];

export const music = {
  // main : mes deux atouts, mis en avant ; les autres apparaissent en second plan
  instruments: [
    { name: 'Chant', note: 'depuis toujours', main: true },
    { name: 'Guitare', note: 'depuis 23 ans', main: true },
    { name: 'Piano', note: 'un peu', main: false },
    { name: 'Batterie', note: 'un peu', main: false },
  ],
  // Tranches de la console : j'écoute de tout, donc tous les curseurs sont en haut
  genres: [
    'Jazz', 'Rock', 'Metal', 'Rap', 'Électro', 'Techno', 'Classique',
    'Musiques du monde', 'BO de films', 'BO de jeux', 'Danse de salon', 'Reprises',
  ],
  // Mettre ici le lien public de la playlist Spotify pour afficher le bouton
  playlist: { name: 'Souvenir d’enfant', count: '3 900+', spotify: 'https://open.spotify.com/playlist/3zofhGkDNWlSXyc4t15vP5' as string },
  text: 'Le chant et la guitare sont mes deux instruments : je chante depuis toujours et je joue de la guitare depuis 23 ans. Je me débrouille aussi un peu au piano et à la batterie. Côté écoute, je passe de tout à tout, sans étiquette : la musique, pour moi, c’est surtout de la mémoire et de l’émotion.',
};

// Chiffres de ma bibliothèque Steam (à mettre à jour de temps en temps)
export const steamStats = { games: 346, dlc: 441 };

// Jaquettes : visuels officiels Steam, recadrés et optimisés dans public/games/
export const games = [
  { name: 'Red Dead Redemption 2', cover: '/games/rdr2.webp', fav: true },
  { name: 'Hunt: Showdown 1896', cover: '/games/hunt.webp', fav: true },
  { name: 'Cyberpunk 2077', cover: '/games/cyberpunk.webp', fav: true },
  { name: 'Satisfactory', cover: '/games/satisfactory.webp' },
  { name: 'Subnautica 2', cover: '/games/subnautica2.webp' },
  // Illustration officielle de l'événement d'Halloween (Steam), recadrée, avec le logo officiel sans le « 2 »
  { name: 'Overwatch', cover: '/games/overwatch.webp' },
  { name: 'Dead by Daylight', cover: '/games/dbd.webp' },
  { name: 'Rust', cover: '/games/rust.webp' },
  { name: 'ARC Raiders', cover: '/games/arc.webp' },
  { name: 'GTA V', cover: '/games/gta.webp' },
  { name: 'Eco', cover: '/games/eco.webp' },
  { name: '007 First Light', cover: '/games/007.webp' },
  { name: 'The Wolf Among Us', cover: '/games/wolf.webp' },
  { name: 'Life is Strange: Reunion', cover: '/games/lis.webp' },
  { name: 'The Dark Pictures : House of Ashes', cover: '/games/darkpictures.webp' },
  { name: 'Age of Empires IV', cover: '/games/aoe4.webp' },
  { name: 'Planet Zoo', cover: '/games/planetzoo.webp' },
] as { name: string; cover: string; fav?: boolean; showTitle?: boolean }[];

// Affiches : visuels officiels (Wikipédia), recadrés et optimisés dans public/films/
export const films = [
  { title: 'Carol', year: 2015, img: '/films/carol.webp' },
  { title: 'Rencontre avec Joe Black', year: 1998, img: '/films/joe-black.webp' },
  { title: 'Le diable s’habille en Prada', year: 2006, img: '/films/prada.webp' },
  { title: 'Jurassic Park', year: 1993, img: '/films/jurassic-park.webp' },
  { title: 'Australia', year: 2008, img: '/films/australia.webp' },
  { title: 'Star Wars : épisode III', year: 2005, img: '/films/star-wars-3.webp' },
  { title: 'Le Journal de Bridget Jones', year: 2001, img: '/films/bridget-jones.webp' },
  { title: 'Le Dernier Samouraï', year: 2003, img: '/films/dernier-samourai.webp' },
  { title: 'The Dark Knight', year: 2008, img: '/films/dark-knight.webp' },
  { title: 'Terminator', year: 1984, img: '/films/terminator.webp' },
  { title: 'Her', year: 2013, img: '/films/her.webp' },
  { title: '12 Years a Slave', year: 2013, img: '/films/12-years.webp' },
];

export const sections = [
  { id: 'parcours', label: 'Parcours' },
  { id: 'competences', label: 'Compétences' },
  { id: 'projets', label: 'Projets' },
  { id: 'hors-champ', label: 'Hors champ' },
  { id: 'contact', label: 'Contact' },
];
