// Seed do glossário: palavras que travam a leitura de quem está começando, com
// definição curta mostrada como tooltip nas aulas. Três frentes: sigla técnica,
// jargão do ofício e palavra difícil do português que aparece em texto técnico.
//
// Ao acrescentar termo, lembre que ele é destacado UMA vez por parágrafo. Palavra
// comum demais vira poluição visual, e palavra que a própria aula já explica no
// texto não precisa estar aqui.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-glossario.ts
import { db } from "../db.ts";
import { glossary } from "../schema.ts";

const TERMOS: { term: string; definition: string }[] = [
    {
        term: "IaaS",
        definition:
            "Infraestrutura como Serviço. Você aluga a infraestrutura básica (máquinas, rede, armazenamento) e ainda gerencia o sistema operacional e as aplicações. Ex.: uma máquina virtual no Azure ou EC2 na AWS.",
    },
    {
        term: "PaaS",
        definition:
            "Plataforma como Serviço. O provedor cuida da infraestrutura e da plataforma; você só implanta e gerencia a aplicação. Ex.: Azure App Service.",
    },
    {
        term: "SaaS",
        definition:
            "Software como Serviço. Software pronto, acessado pela internet, sem gerenciar nada da infraestrutura. Ex.: Microsoft 365, Gmail.",
    },
    {
        term: "CapEx",
        definition:
            "Despesa de capital. Investimento adiantado em ativos físicos, como comprar servidores e montar um data center. É o modelo típico do ambiente local (on-premises).",
    },
    {
        term: "OpEx",
        definition:
            "Despesa operacional. Gasto contínuo conforme o uso, sem investimento inicial. É o modelo da nuvem: você paga pelo que consome.",
    },
    {
        term: "SLA",
        definition:
            "Acordo de Nível de Serviço. O compromisso do provedor com disponibilidade e desempenho, por exemplo garantir 99,9% de uptime.",
    },
    {
        term: "VM",
        definition:
            "Máquina Virtual. Um computador por software que roda sobre um servidor físico, com seu próprio sistema operacional.",
    },
    {
        term: "CDN",
        definition:
            "Rede de Distribuição de Conteúdo. Servidores espalhados pelo mundo que entregam o conteúdo a partir do ponto mais próximo do usuário, reduzindo a latência.",
    },
    {
        term: "API",
        definition:
            "Interface de Programação de Aplicações. O conjunto de regras pelo qual um software conversa com outro.",
    },
    {
        term: "SDK",
        definition:
            "Kit de Desenvolvimento de Software. Conjunto de ferramentas e bibliotecas para construir aplicações para uma plataforma.",
    },
    {
        term: "OLTP",
        definition:
            "Processamento de Transações Online. Cargas de muitas transações curtas sobre dados atuais (inserções e atualizações), típicas de sistemas operacionais.",
    },
    {
        term: "OLAP",
        definition:
            "Processamento Analítico Online. Cargas de consultas complexas e agregações sobre grandes volumes de dados históricos, voltadas a análise.",
    },
    {
        term: "ACID",
        definition:
            "Atomicidade, Consistência, Isolamento e Durabilidade. As quatro garantias de uma transação confiável em um banco de dados.",
    },
    {
        term: "ETL",
        definition:
            "Extract, Transform, Load. Extrair os dados, transformá-los e só então carregá-los no destino.",
    },
    {
        term: "ELT",
        definition:
            "Extract, Load, Transform. Extrair, carregar os dados brutos no destino e transformá-los lá, aproveitando o poder de processamento do destino.",
    },
    {
        term: "NoSQL",
        definition:
            "Bancos não relacionais, de esquema flexível e que escalam horizontalmente. Incluem modelos de documento, chave-valor, coluna e grafo.",
    },
    {
        term: "LLM",
        definition:
            "Modelo de Linguagem Grande. Modelo de IA treinado em enormes volumes de texto para entender e gerar linguagem natural. É a base da IA generativa, como o GPT.",
    },
    {
        term: "RAG",
        definition:
            "Geração Aumentada por Recuperação. Buscar trechos relevantes de uma fonte confiável e injetá-los no prompt, para o modelo responder com base nesses dados.",
    },
    {
        term: "ORM",
        definition:
            "Mapeamento objeto-relacional. Biblioteca que traduz tabelas do banco em objetos da linguagem, para você escrever menos SQL. Cobra o preço de esconder a consulta que roda de verdade.",
    },
    {
        term: "CRUD",
        definition:
            "Criar, ler, atualizar e remover (create, read, update, delete). As quatro operações básicas sobre um registro, presentes em quase todo sistema.",
    },
    {
        term: "JSON",
        definition:
            "Formato de texto para troca de dados entre sistemas, baseado em pares de nome e valor. Legível por gente e fácil de qualquer linguagem interpretar.",
    },
    {
        term: "HTTP",
        definition:
            "Protocolo que o navegador usa para pedir e receber páginas e dados de um servidor. É a base de praticamente toda comunicação na web.",
    },
    {
        term: "REST",
        definition:
            "Estilo de organizar uma API sobre HTTP, tratando cada coisa do sistema como um recurso com endereço próprio e usando os verbos do protocolo.",
    },
    {
        term: "JWT",
        definition:
            "Token assinado que carrega quem é o usuário. O servidor confere a assinatura em vez de consultar a sessão, o que permite autenticar sem guardar estado.",
    },
    {
        term: "DNS",
        definition:
            "Serviço que traduz nome de site em endereço de rede. É a lista telefônica da internet, e quando ele falha o site parece fora do ar mesmo estando de pé.",
    },
    {
        term: "IDE",
        definition:
            "Ambiente integrado de desenvolvimento. Editor de código com depurador, execução e outras ferramentas juntos, como VS Code ou IntelliJ.",
    },
    {
        term: "MFA",
        definition:
            "Autenticação com mais de um fator: além da senha, algo que você tem (celular, chave física) ou é (digital). Barra a maioria dos ataques por senha vazada.",
    },
    {
        term: "SIEM",
        definition:
            "Plataforma que centraliza registros de muitas fontes, permite consultá-los juntos e gera alerta a partir de regras. Ferramenta central de um time de defesa.",
    },
    {
        term: "idempotente",
        definition:
            "Operação que pode ser repetida sem mudar o resultado. Apagar o mesmo arquivo duas vezes deixa o mesmo estado; cobrar duas vezes, não.",
    },
    {
        term: "latência",
        definition:
            "O tempo de espera entre pedir algo e começar a receber. Diferente de vazão: um caminhão lento entrega muito, mas demora a chegar.",
    },
    {
        term: "cache",
        definition:
            "Cópia guardada perto de quem usa, para não refazer trabalho caro. Rápido, e sempre com o risco de entregar informação velha.",
    },
    {
        term: "deploy",
        definition: "Colocar uma versão nova do sistema no ar, no ambiente onde os usuários estão.",
    },
    {
        term: "build",
        definition:
            "O processo que transforma o código escrito no pacote que de fato roda, e também o resultado desse processo.",
    },
    {
        term: "commit",
        definition:
            "Registro de uma mudança no histórico do código, com autor, data e uma mensagem dizendo o que mudou.",
    },
    {
        term: "refatorar",
        definition:
            "Reorganizar o código para ficar mais claro sem mudar o que ele faz. Se o comportamento muda, não é refatoração.",
    },
    {
        term: "framework",
        definition:
            "Estrutura pronta que já define a forma do seu programa e chama o seu código nos pontos certos. Diferente de biblioteca, que é você quem chama.",
    },
    {
        term: "endpoint",
        definition:
            "Um endereço específico de uma API, com o que ele aceita receber e o que devolve.",
    },
    {
        term: "payload",
        definition:
            "O conteúdo útil que viaja numa mensagem, separado do cabeçalho e dos dados de controle.",
    },
    {
        term: "assíncrono",
        definition:
            "Que não espera terminar para seguir adiante. O programa dispara a tarefa, continua fazendo outra coisa e trata o resultado quando ele chega.",
    },
    {
        term: "escalabilidade",
        definition:
            "A capacidade de aguentar mais carga acrescentando recurso, sem ter que reescrever o sistema.",
    },
    {
        term: "rollback",
        definition:
            "Voltar ao estado anterior depois que algo deu errado, seja desfazendo uma transação no banco ou tirando do ar uma versão ruim.",
    },
    {
        term: "índice",
        definition:
            "Estrutura extra que o banco mantém para achar linhas sem varrer a tabela inteira. Acelera a leitura e cobra em espaço e em escrita mais lenta.",
    },
    {
        term: "schema",
        definition:
            "O desenho da estrutura dos dados: quais tabelas existem, quais colunas cada uma tem e de que tipo é cada coluna.",
    },
    {
        term: "transação",
        definition:
            "Um conjunto de operações que vale tudo ou nada. Se qualquer parte falha, o banco desfaz todas e ninguém vê estado pela metade.",
    },
    {
        term: "overhead",
        definition:
            "O custo extra que uma solução cobra além do trabalho útil, em tempo, memória ou complexidade.",
    },
    {
        term: "legado",
        definition:
            "Sistema antigo que continua em produção porque o negócio depende dele, e que costuma ser caro de mudar.",
    },
    {
        term: "parcimônia",
        definition:
            "Moderação, uso comedido. Usar algo com parcimônia é usar pouco e só quando compensa.",
    },
    {
        term: "heurística",
        definition:
            "Regra prática que costuma dar certo sem garantia de estar certa. Serve para decidir rápido quando calcular a resposta exata sairia caro demais.",
    },
    {
        term: "mitigar",
        definition: "Reduzir o efeito de um problema sem necessariamente eliminá-lo.",
    },
    {
        term: "determinístico",
        definition:
            "Que produz sempre o mesmo resultado a partir da mesma entrada, sem depender de sorte, relógio ou ordem de execução.",
    },
    {
        term: "efêmero",
        definition:
            "Que dura pouco e é descartado. Um container efêmero sobe para uma tarefa e some depois, sem guardar nada.",
    },
    {
        term: "granularidade",
        definition:
            "O tamanho do pedaço com que você trabalha. Granularidade fina significa muitos pedaços pequenos; grossa, poucos e grandes.",
    },
    {
        term: "acoplamento",
        definition:
            "O quanto uma parte do sistema depende de outra. Acoplamento alto faz mexer numa quebrar a outra.",
    },
    {
        term: "coesão",
        definition:
            "O quanto as partes de um mesmo módulo tratam do mesmo assunto. Coesão alta é bom: cada peça faz uma coisa só.",
    },
    {
        term: "resiliência",
        definition:
            "A capacidade de continuar funcionando, mesmo que pior, quando alguma parte falha.",
    },
    {
        term: "ortogonal",
        definition:
            "Independente. Duas escolhas são ortogonais quando mudar uma não obriga a mudar a outra.",
    },
    {
        term: "semântica",
        definition:
            "O significado de algo, em oposição à forma. Duas consultas com sintaxe diferente podem ter a mesma semântica.",
    },
    {
        term: "sintaxe",
        definition:
            "As regras de escrita de uma linguagem: onde vai vírgula, parêntese e palavra-chave. Erro de sintaxe é erro de forma, não de ideia.",
    },
    {
        term: "trivial",
        definition:
            "Simples a ponto de não exigir explicação. Em texto técnico costuma indicar que o caso difícil é outro.",
    },
    {
        term: "arbitrário",
        definition:
            "Escolhido sem uma razão obrigatória. Um limite arbitrário podia ter outro valor sem quebrar nada.",
    },
    {
        term: "verboso",
        definition:
            "Que exige muito texto para dizer pouco. Também descreve registro de log muito detalhado.",
    },
];

async function seed() {
    // Insere o que falta em vez de desistir quando já há termos. O seed antigo
    // parava se o glossário não estivesse vazio, então acrescentar palavra ao
    // arquivo não tinha efeito nenhum em produção.
    const existentes = new Set(
        (await db.select({ term: glossary.term }).from(glossary)).map((g) => g.term),
    );
    const novos = TERMOS.filter((t) => !existentes.has(t.term));
    if (!novos.length) {
        console.log(`Glossário já tem os ${TERMOS.length} termos. Nada a fazer.`);
        return;
    }
    await db.insert(glossary).values(novos);
    console.log(
        `Seed concluído: ${novos.length} termo(s) novo(s) inserido(s), ${existentes.size} já existiam.`,
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
