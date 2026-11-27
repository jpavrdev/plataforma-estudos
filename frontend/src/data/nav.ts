// Itens da navegação principal, compartilhados por todas as abas para não divergirem.
// As telas leem pelo useNavPrincipal, que acrescenta o sorteio quando há um aberto
// e traduz o rótulo pela chave. O EstudioTopbar faz o mesmo com o NAV_ESTUDIO.
export const NAV_PRINCIPAL = [
  { key: 'home', to: '/home' },
  { key: 'roadmaps', to: '/roadmaps' },
  { key: 'tracks', to: '/trilhas' },
  { key: 'exams', to: '/simulados' },
  { key: 'challenges', to: '/desafios' },
  { key: 'review', to: '/revisao' },
  { key: 'ranking', to: '/ranking' },
  { key: 'community', to: '/comunidade' },
  { key: 'support', to: '/apoie' },
] as const;

export const NAV_SORTEIO = { key: 'giveaway', to: '/sorteio' } as const;

// Gated by the "projetos-guiados" flag in useNavPrincipal: only users released
// in the beta see the tab.
export const NAV_PROJECTS = { key: 'projects', to: '/projetos' } as const;

export const NAV_ESTUDIO = [
  { key: 'nav.studioTracks', to: '/estudio' },
  { key: 'nav.studioRoadmaps', to: '/estudio/roadmaps' },
  { key: 'nav.studioUsers', to: '/estudio/usuarios' },
  { key: 'nav.studioExams', to: '/estudio/simulados' },
  { key: 'nav.studioChallenges', to: '/estudio/desafios' },
  { key: 'nav.studioAnnouncements', to: '/estudio/comunicados' },
  { key: 'nav.studioGiveaways', to: '/estudio/sorteios' },
  { key: 'nav.studioSubscriptions', to: '/estudio/assinaturas' },
  { key: 'nav.backToApp', to: '/home' },
] as const;
