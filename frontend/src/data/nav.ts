// Itens da navegação principal, compartilhados por todas as abas para não divergirem.
// As telas leem pelo useNavPrincipal, que acrescenta o sorteio quando há um aberto
// e traduz o rótulo pela chave. NAV_ESTUDIO ainda não migrou: o estúdio segue com
// rótulo fixo em português até a própria área ser traduzida.
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

export const NAV_ESTUDIO = [
  { label: 'Trilhas', to: '/estudio' },
  { label: 'Roadmaps', to: '/estudio/roadmaps' },
  { label: 'Usuários', to: '/estudio/usuarios' },
  { label: 'Simulados', to: '/estudio/simulados' },
  { label: 'Desafios', to: '/estudio/desafios' },
  { label: 'Comunicados', to: '/estudio/comunicados' },
  { label: 'Sorteios', to: '/estudio/sorteios' },
  { label: 'Assinaturas', to: '/estudio/assinaturas' },
  { label: 'Voltar ao app', to: '/home' },
];
