// Glossário inicial de termos de nuvem, dados e IA que aparecem nas trilhas.
// O renderizador da aula destaca a primeira ocorrência de cada termo com um tooltip.
// (Na próxima etapa isto vira um CRUD no Configurações e passa a vir do backend.)
export interface TermoGlossario {
  termo: string;
  definicao: string;
}

export const GLOSSARIO: TermoGlossario[] = [
  {
    termo: 'IaaS',
    definicao:
      'Infraestrutura como Serviço. Você aluga a infraestrutura básica (máquinas, rede, armazenamento) e ainda gerencia o sistema operacional e as aplicações. Ex.: uma máquina virtual no Azure ou EC2 na AWS.',
  },
  {
    termo: 'PaaS',
    definicao:
      'Plataforma como Serviço. O provedor cuida da infraestrutura e da plataforma; você só implanta e gerencia a aplicação. Ex.: Azure App Service.',
  },
  {
    termo: 'SaaS',
    definicao:
      'Software como Serviço. Software pronto, acessado pela internet, sem gerenciar nada da infraestrutura. Ex.: Microsoft 365, Gmail.',
  },
  {
    termo: 'CapEx',
    definicao:
      'Despesa de capital. Investimento adiantado em ativos físicos, como comprar servidores e montar um data center. É o modelo típico do ambiente local (on-premises).',
  },
  {
    termo: 'OpEx',
    definicao:
      'Despesa operacional. Gasto contínuo conforme o uso, sem investimento inicial. É o modelo da nuvem: você paga pelo que consome.',
  },
  {
    termo: 'SLA',
    definicao:
      'Acordo de Nível de Serviço. O compromisso do provedor com disponibilidade e desempenho, por exemplo garantir 99,9% de uptime.',
  },
  {
    termo: 'VM',
    definicao:
      'Máquina Virtual. Um computador por software que roda sobre um servidor físico, com seu próprio sistema operacional.',
  },
  {
    termo: 'CDN',
    definicao:
      'Rede de Distribuição de Conteúdo. Servidores espalhados pelo mundo que entregam o conteúdo a partir do ponto mais próximo do usuário, reduzindo a latência.',
  },
  {
    termo: 'API',
    definicao:
      'Interface de Programação de Aplicações. O conjunto de regras pelo qual um software conversa com outro.',
  },
  {
    termo: 'SDK',
    definicao:
      'Kit de Desenvolvimento de Software. Conjunto de ferramentas e bibliotecas para construir aplicações para uma plataforma.',
  },
  {
    termo: 'OLTP',
    definicao:
      'Processamento de Transações Online. Cargas de muitas transações curtas sobre dados atuais (inserções e atualizações), típicas de sistemas operacionais.',
  },
  {
    termo: 'OLAP',
    definicao:
      'Processamento Analítico Online. Cargas de consultas complexas e agregações sobre grandes volumes de dados históricos, voltadas a análise.',
  },
  {
    termo: 'ACID',
    definicao:
      'Atomicidade, Consistência, Isolamento e Durabilidade. As quatro garantias de uma transação confiável em um banco de dados.',
  },
  {
    termo: 'ETL',
    definicao:
      'Extract, Transform, Load. Extrair os dados, transformá-los e só então carregá-los no destino.',
  },
  {
    termo: 'ELT',
    definicao:
      'Extract, Load, Transform. Extrair, carregar os dados brutos no destino e transformá-los lá, aproveitando o poder de processamento do destino.',
  },
  {
    termo: 'NoSQL',
    definicao:
      'Bancos não relacionais, de esquema flexível e que escalam horizontalmente. Incluem modelos de documento, chave-valor, coluna e grafo.',
  },
  {
    termo: 'LLM',
    definicao:
      'Modelo de Linguagem Grande. Modelo de IA treinado em enormes volumes de texto para entender e gerar linguagem natural. É a base da IA generativa, como o GPT.',
  },
  {
    termo: 'RAG',
    definicao:
      'Geração Aumentada por Recuperação. Buscar trechos relevantes de uma fonte confiável e injetá-los no prompt, para o modelo responder com base nesses dados.',
  },
];
