export type MetaPagina = {
  titulo: string;
  descricao?: string;
  /** Falso vira noindex. Padrão: a rota é indexável. */
  indexar?: boolean;
};

export const SITE = {
  nome: 'Ensina Dev',
  url: 'https://ensinadev.com.br',
  titulo: 'Ensina Dev | Do primeiro if ao primeiro emprego',
  descricao:
    'Trilhas guiadas por carreira, desafios de código corrigidos na hora e simulados de certificação. Grátis, sem plano pago e de código aberto.',
};

// As chaves usam a mesma grafia das rotas do App.tsx: um segmento iniciado por
// dois-pontos casa com qualquer valor. Quase tudo aqui é noindex porque exige
// login: o robô não veria a tela, só o formulário de entrar, e página de login
// repetida em dezenas de endereços é exatamente o tipo de conteúdo duplicado
// que derruba a avaliação do domínio inteiro.
const ROTAS: Record<string, MetaPagina> = {
  '/': { titulo: SITE.titulo, descricao: SITE.descricao },
  '/cadastro': {
    titulo: 'Criar conta grátis | Ensina Dev',
    descricao:
      'Crie sua conta e comece a estudar de graça: trilhas guiadas, desafios corrigidos na hora e simulados de certificação.',
  },
  '/entrar': { titulo: 'Entrar | Ensina Dev', indexar: false },
  '/verificar-email': { titulo: 'Verificar email | Ensina Dev', indexar: false },
  '/recuperar-senha': { titulo: 'Recuperar senha | Ensina Dev', indexar: false },
  '/redefinir-senha': { titulo: 'Redefinir senha | Ensina Dev', indexar: false },
  '/auth/callback': { titulo: 'Entrando | Ensina Dev', indexar: false },
  '/completar-perfil': { titulo: 'Completar perfil | Ensina Dev', indexar: false },
  '/certificados/:code': { titulo: 'Validação de certificado | Ensina Dev', indexar: false },

  '/home': { titulo: 'Início | Ensina Dev', indexar: false },
  '/trilhas': { titulo: 'Trilhas | Ensina Dev', indexar: false },
  '/trilhas/:trailId': { titulo: 'Trilha | Ensina Dev', indexar: false },
  '/trilhas/:trailId/aula/:lessonId': { titulo: 'Aula | Ensina Dev', indexar: false },
  '/roadmaps': { titulo: 'Roadmaps | Ensina Dev', indexar: false },
  '/roadmaps/:slug': { titulo: 'Roadmap | Ensina Dev', indexar: false },
  '/simulados': { titulo: 'Simulados | Ensina Dev', indexar: false },
  '/simulados/:slug': { titulo: 'Simulado | Ensina Dev', indexar: false },
  '/simulados/tentativa/:attemptId': { titulo: 'Tentativa | Ensina Dev', indexar: false },
  '/desafios': { titulo: 'Desafios | Ensina Dev', indexar: false },
  '/desafios/:id': { titulo: 'Desafio | Ensina Dev', indexar: false },
  '/conquistas': { titulo: 'Conquistas | Ensina Dev', indexar: false },
  '/ranking': { titulo: 'Ranking | Ensina Dev', indexar: false },
  '/comunidade': { titulo: 'Comunidade | Ensina Dev', indexar: false },
  '/progresso': { titulo: 'Progresso | Ensina Dev', indexar: false },
  '/perfil': { titulo: 'Meu perfil | Ensina Dev', indexar: false },
  '/curriculo': { titulo: 'Currículo | Ensina Dev', indexar: false },
  '/apoie': { titulo: 'Apoie o projeto | Ensina Dev', indexar: false },
  '/configuracoes': { titulo: 'Configurações | Ensina Dev', indexar: false },
  '/:username': { titulo: 'Perfil | Ensina Dev', indexar: false },
};

const PADRAO_ADMIN: MetaPagina = { titulo: 'Estúdio | Ensina Dev', indexar: false };

function casa(rota: string, caminho: string): boolean {
  const a = rota.split('/');
  const b = caminho.split('/');
  if (a.length !== b.length) return false;
  return a.every((seg, i) => seg.startsWith(':') || seg === b[i]);
}

export function metaDaRota(caminho: string): MetaPagina {
  const limpo = caminho.length > 1 ? caminho.replace(/\/+$/, '') : caminho;
  if (limpo.startsWith('/estudio')) return PADRAO_ADMIN;

  const exata = ROTAS[limpo];
  if (exata) return exata;

  // Sem correspondência exata, vale a rota com parâmetro. O /:username é o
  // curinga mais largo do app, então fica por último para não roubar rotas
  // fixas de um segmento só.
  const chaves = Object.keys(ROTAS).filter((r) => r !== '/:username');
  const achada = chaves.find((r) => r.includes(':') && casa(r, limpo));
  if (achada) return ROTAS[achada];
  if (casa('/:username', limpo)) return ROTAS['/:username'];

  return { titulo: SITE.titulo, descricao: SITE.descricao, indexar: false };
}
