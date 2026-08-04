// Seed da trilha Aplicações com LLMs, estagio 5 do roadmap de Engenharia de IA.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-aplicacoes-llms.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Aplicações com LLMs";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Construir com a API crua, em Python: a anatomia de uma chamada de chat, prompt engineering na prática, system prompts que funcionam, saídas estruturadas e function calling, streaming, memória de conversa e um chatbot completo servido por API própria. Da primeira requisição ao produto que conversa.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - A primeira chamada",
    aulas: [
        {
            titulo: "A anatomia de uma chamada de chat",
            blocks: [
                {
                    type: "text",
                    value: "# O formato que todo provedor fala\n\nNa trilha de Fundamentos você aprendeu o que o modelo faz; agora começa a parte de construir. E a primeira boa notícia da prática: as APIs de chat dos grandes provedores convergiram para o mesmo formato. Uma chamada é, essencialmente, uma lista de MENSAGENS, cada uma com um papel (role) e um conteúdo, mais o nome do modelo e alguns parâmetros.\n\nOs três papéis que importam: system (as instruções da SUA aplicação: quem o assistente é, o que pode e o que não pode), user (o que a pessoa enviou) e assistant (as respostas anteriores do modelo). A resposta da API é uma nova mensagem de assistant, que você guarda e reenvia na chamada seguinte para manter a conversa.",
                },
                {
                    type: "code",
                    value: '{\n  "model": "nome-do-modelo",\n  "max_tokens": 500,\n  "messages": [\n    { "role": "system", "content": "Voce e o assistente da loja X. Responda em portugues, em ate 3 frases." },\n    { "role": "user", "content": "Qual o prazo de entrega para Recife?" },\n    { "role": "assistant", "content": "Para Recife, o prazo e de 4 a 7 dias uteis." },\n    { "role": "user", "content": "E o frete, quanto fica?" }\n  ]\n}\n// A resposta vem como a proxima mensagem de assistant',
                },
                {
                    type: "table",
                    value: '[["Papel","Quem escreve","Para que serve"],["system","A sua aplicação","Regras, persona e limites do assistente"],["user","A pessoa usuária","A pergunta ou instrução do turno"],["assistant","O modelo","As respostas; reenviadas para manter contexto"]]',
                },
                {
                    type: "quote",
                    value: "Uma conversa é só uma lista de mensagens que cresce. A API é sem estado: o que você não reenviar, o modelo não sabe. Quem monta a lista manda no comportamento.",
                },
                {
                    type: "text",
                    value: "## Pequenas diferenças entre provedores\n\nO formato geral é o mesmo, com detalhes que variam: alguns provedores recebem o system como uma mensagem na lista, outros como um campo separado (system) fora dela; o nome do limite de saída varia (max_tokens, max_output_tokens); e cada um tem seus extras. Os SDKs oficiais absorvem essas diferenças, e o módulo inteiro vale para qualquer provedor.\n\nNesta trilha os exemplos usam o formato geral e apontam a variação quando ela importa. O que você precisa levar desta aula é o modelo mental: chamada = modelo + parâmetros + lista de mensagens com papéis.",
                },
            ],
            questions: [
                {
                    statement: "O que compõe, essencialmente, uma chamada de chat?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Modelo, parâmetros e a lista de mensagens com papéis",
                            isCorrect: true,
                        },
                        {
                            text: "O endereço do servidor e a senha do banco de dados",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas o texto da pergunta, sem estrutura nenhuma",
                            isCorrect: false,
                        },
                        {
                            text: "Um arquivo com o histórico compilado em binário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual papel carrega as regras e a persona definidas pela aplicação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "system",
                            isCorrect: true,
                        },
                        {
                            text: "user",
                            isCorrect: false,
                        },
                        {
                            text: "assistant",
                            isCorrect: false,
                        },
                        {
                            text: "admin",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como a conversa continua entre um turno e outro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A aplicação reenvia a lista de mensagens com a resposta anterior incluída",
                            isCorrect: true,
                        },
                        {
                            text: "O provedor guarda a sessão de chat aberta no servidor e lembra tudo sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo grava a conversa nos próprios parâmetros",
                            isCorrect: false,
                        },
                        {
                            text: "O navegador mantém a conexão HTTP aberta para sempre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "As mensagens de papel assistant na lista representam o quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As respostas anteriores do modelo, reenviadas como contexto",
                            isCorrect: true,
                        },
                        {
                            text: "As instruções internas escritas pelo time de produto da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Os erros de rede das chamadas que falharam antes",
                            isCorrect: false,
                        },
                        {
                            text: "Os comentários do desenvolvedor sobre cada turno",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time quer trocar de provedor de LLM. Segundo a aula, o que muda na estrutura das chamadas?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Detalhes como a posição do system e nomes de parâmetros; o formato geral fica",
                            isCorrect: true,
                        },
                        {
                            text: "Tudo: cada provedor usa um paradigma de chamadas completamente diferente",
                            isCorrect: false,
                        },
                        {
                            text: "Nada: as APIs são idênticas até nos nomes dos campos",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas o idioma em que as mensagens devem ser escritas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Preparando o ambiente e a chave de API",
            blocks: [
                {
                    type: "text",
                    value: "# Antes da primeira linha\n\nPara chamar um LLM você precisa de três coisas: uma conta no provedor, uma chave de API e o SDK instalado. A chave é a sua identidade e o seu cartão de crédito: qualquer pessoa com ela gasta na sua conta. Isso define as regras de manuseio, que valem para qualquer segredo, e com chave de LLM a fatura chega rápido.\n\nA regra número um: a chave NUNCA entra no código, nem em repositório (nem privado). Ela vive em variável de ambiente ou em um gerenciador de segredos, e o código a lê na inicialização. Os SDKs já leem a variável padrão do provedor sozinhos (por exemplo, uma variável como PROVIDER_API_KEY), então o código fica limpo.",
                },
                {
                    type: "code",
                    value: '# .env (fora do controle de versao; adicione ao .gitignore)\n# PROVIDER_API_KEY=sk-...\n\n# terminal\npip install provider-sdk python-dotenv\n\n# app.py\nimport os\nfrom dotenv import load_dotenv\n\nload_dotenv()\nassert os.environ.get("PROVIDER_API_KEY"), "chave ausente no ambiente"\n# O SDK le a variavel padrao sozinho na criacao do cliente',
                },
                {
                    type: "table",
                    value: '[["Prática","Certo","Errado"],["Onde guardar a chave","Variável de ambiente ou cofre de segredos","Hardcoded no código ou no repositório"],["Escopo da chave","Uma chave por ambiente e por aplicação","A mesma chave em dev, prod e nos testes"],["Limite de gasto","Configurar alerta e teto no painel do provedor","Descobrir o vazamento na fatura"],["Rotação","Revogar e trocar ao menor sinal de exposição","Manter a chave vazada funcionando"]]',
                },
                {
                    type: "quote",
                    value: "Chave de API vazada em repositório é gasto de terceiros em minutos: bots varrem o GitHub por chaves o dia inteiro. Variável de ambiente, teto de gasto e rotação não são paranoia, são o básico.",
                },
                {
                    type: "text",
                    value: "## Custo de aprender\n\nBoa notícia para estudar: errar é barato. Uma chamada de teste com um modelo pequeno custa frações de centavo, e os exercícios desta trilha inteira cabem em poucos dólares. Configure um teto de gasto baixo no painel do provedor (5 ou 10 dólares) antes de começar: aprender com rede de proteção tira o medo de experimentar.\n\nCom ambiente pronto e chave no lugar, a próxima aula faz a primeira requisição de verdade e disseca a resposta.",
                },
            ],
            questions: [
                {
                    statement: "Onde a chave de API deve viver?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Em variável de ambiente ou gerenciador de segredos",
                            isCorrect: true,
                        },
                        {
                            text: "No código-fonte, para facilitar o deploy",
                            isCorrect: false,
                        },
                        {
                            text: "Em um comentário no topo do arquivo principal",
                            isCorrect: false,
                        },
                        {
                            text: "No banco de dados, na tabela de usuários",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a chave não pode ir para o repositório, nem privado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quem tiver a chave gasta na sua conta; vazamento vira fatura",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o Git corrompe strings longas nos commits",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o provedor bloqueia na hora chaves versionadas em Git",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a chave muda de valor a cada push feito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual conjunto de práticas a aula recomenda antes de começar a estudar com a API?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Chave no ambiente, teto de gasto baixo e alerta no painel",
                            isCorrect: true,
                        },
                        {
                            text: "Chave compartilhada com o time por mensagem no grupo",
                            isCorrect: false,
                        },
                        {
                            text: "Uma única chave global para todos os ambientes",
                            isCorrect: false,
                        },
                        {
                            text: "Desativar os limites para não atrapalhar os testes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma chave apareceu por engano em um commit público que foi apagado em seguida. Qual é a conduta correta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Revogar a chave imediatamente e gerar outra",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: apagar o commit já removeu o risco",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar apenas o nome da variável de ambiente",
                            isCorrect: false,
                        },
                        {
                            text: "Esperar a fatura para confirmar se houve uso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que usar uma chave por ambiente e por aplicação, em vez de uma só?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Isola o estrago do vazamento e permite medir e revogar por uso",
                            isCorrect: true,
                        },
                        {
                            text: "Porque os SDKs recusam chaves usadas em dois lugares",
                            isCorrect: false,
                        },
                        {
                            text: "Porque chaves únicas expiram mais rápido no provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Para deixar o arquivo .env com mais linhas bem organizadas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A primeira requisição em Python",
            blocks: [
                {
                    type: "text",
                    value: "# Do zero à resposta\n\nCom o ambiente pronto, a primeira chamada é curta. O fluxo com qualquer SDK oficial: criar o cliente (que lê a chave do ambiente), montar a lista de mensagens, chamar o endpoint de chat e ler a resposta. O código abaixo usa o formato geral que os SDKs seguem; os nomes exatos variam levemente por provedor.\n\nRepare em três decisões já presentes na chamada mais simples: o MODELO escolhido (com a versão datada, como visto nos Fundamentos), o max_tokens (teto de custo da saída) e o system prompt (mesmo curto, já define o comportamento).",
                },
                {
                    type: "code",
                    value: 'from provider import Client\n\ncliente = Client()  # le a chave do ambiente\n\nresposta = cliente.chat.create(\n    model="modelo-medio-2026-01",\n    max_tokens=300,\n    messages=[\n        {"role": "system", "content": "Voce resume textos em uma frase, em portugues."},\n        {"role": "user", "content": "Resuma: a reuniao definiu o orcamento de 2027..."},\n    ],\n)\n\nprint(resposta.content)          # o texto gerado\nprint(resposta.stop_reason)      # por que a geracao parou\nprint(resposta.usage.input_tokens, resposta.usage.output_tokens)',
                },
                {
                    type: "text",
                    value: "## A resposta tem mais que texto\n\nO texto é só um dos campos. O usage traz a contagem oficial de tokens de entrada e saída (a sua fonte de verdade de custo, registre desde o primeiro dia). O stop_reason (ou finish_reason) diz POR QUE a geração parou: fim natural, teto de tokens atingido ou uma sequência de parada. E o id da resposta identifica a chamada para logs e suporte.\n\nCódigo de produção lê esses campos SEMPRE. Os dois hábitos que separam o script do produto, desde a primeira requisição: conferir o stop_reason (resposta truncada tratada como completa é bug silencioso) e registrar o usage (sem medição não há gestão de custo).",
                },
                {
                    type: "table",
                    value: '[["Campo da resposta","O que traz","Por que ler"],["content / texto","A resposta gerada","É o produto da chamada"],["usage","Tokens de entrada e de saída","Fonte de verdade do custo"],["stop_reason","Motivo do fim da geração","Detecta resposta truncada"],["id","Identificador da chamada","Log, depuração e suporte"]]',
                },
                {
                    type: "quote",
                    value: "Desde a primeira chamada, dois hábitos de gente grande: conferir o stop_reason e registrar o usage. O resto da trilha constrói em cima deles.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o fluxo básico de uma chamada com SDK?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Criar o cliente, montar as mensagens, chamar o chat e ler a resposta",
                            isCorrect: true,
                        },
                        {
                            text: "Abrir o navegador, logar no painel do provedor e colar a pergunta",
                            isCorrect: false,
                        },
                        {
                            text: "Subir um servidor próprio que hospeda o modelo",
                            isCorrect: false,
                        },
                        {
                            text: "Enviar um e-mail para o suporte do provedor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde está a contagem oficial de tokens consumidos pela chamada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No campo usage da resposta",
                            isCorrect: true,
                        },
                        {
                            text: "No cabeçalho da requisição enviada",
                            isCorrect: false,
                        },
                        {
                            text: "No painel, com uma semana de atraso",
                            isCorrect: false,
                        },
                        {
                            text: "No texto gerado, na última linha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que conferir o stop_reason em toda resposta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para detectar resposta truncada pelo teto antes de usá-la",
                            isCorrect: true,
                        },
                        {
                            text: "Para calcular o preço exato da requisição em dólares",
                            isCorrect: false,
                        },
                        {
                            text: "Para descobrir a versão do modelo usada",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a API exige a leitura para faturar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais três decisões já aparecem na chamada mais simples?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Modelo com versão, teto de saída e system prompt",
                            isCorrect: true,
                        },
                        {
                            text: "Banco de dados, framework web e provedor de nuvem",
                            isCorrect: false,
                        },
                        {
                            text: "Idioma, fuso horário e moeda da cobrança",
                            isCorrect: false,
                        },
                        {
                            text: "Nome do arquivo, porta e diretório de logs",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um script trata toda resposta como completa e às vezes salva JSON pela metade. Qual hábito da aula teria pego o problema?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Conferir o stop_reason e tratar o caso de teto atingido",
                            isCorrect: true,
                        },
                        {
                            text: "Registrar o id da chamada em um arquivo de log central",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a temperatura para completar o JSON",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o SDK por chamadas HTTP manuais",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Erros, rate limits e retentativas",
            blocks: [
                {
                    type: "text",
                    value: "# A rede vai falhar; o seu código decide o resto\n\nChamadas de LLM falham por motivos previsíveis: limite de requisições (429, o famoso rate limit), sobrecarga temporária do provedor (503/529), timeouts em respostas longas e erros de requisição malformada (400) ou chave inválida (401). Um produto sério não repassa essas falhas cruas ao usuário: ele distingue o que é transitório do que é definitivo.\n\nA divisão fundamental: erros TRANSITÓRIOS (429, 5xx, timeout) merecem retentativa; erros DEFINITIVOS (400, 401, conteúdo recusado) não, porque repetir a mesma requisição inválida só queima cota. Confundir os dois gera ou desistência precoce ou martelo infinito.",
                },
                {
                    type: "code",
                    value: "import time, random\n\nTRANSITORIOS = {429, 500, 502, 503, 529}\n\ndef chamar_com_retentativa(fazer_chamada, tentativas=4):\n    for i in range(tentativas):\n        try:\n            return fazer_chamada()\n        except ApiError as e:\n            if e.status not in TRANSITORIOS or i == tentativas - 1:\n                raise\n            espera = (2 ** i) + random.uniform(0, 1)  # backoff exponencial com jitter\n            time.sleep(espera)\n# 1s, 2s, 4s (mais o jitter): da tempo de o limite renovar sem martelar",
                },
                {
                    type: "table",
                    value: '[["Erro","Tipo","Ação correta"],["429 rate limit","Transitório","Backoff exponencial e retentar"],["500 / 503 / 529","Transitório","Retentar poucas vezes com espera"],["Timeout de rede","Transitório","Retentar; considerar streaming"],["400 malformada","Definitivo","Corrigir a requisição, não retentar"],["401 chave inválida","Definitivo","Corrigir a credencial, alertar"]]',
                },
                {
                    type: "quote",
                    value: "Backoff exponencial com jitter é o aperto de mão civilizado com a API: espera dobrando a cada tentativa, com um tempero aleatório para os clientes não retentarem todos juntos.",
                },
                {
                    type: "text",
                    value: "## Rate limits são contrato, não surpresa\n\nTodo provedor publica limites por minuto (requisições e tokens) que variam por modelo e por nível de conta. Conhecê-los muda o desenho: um lote de mil documentos não se processa em um for disparado de uma vez, se processa com concorrência controlada dentro do limite. Os SDKs modernos já trazem retentativa automática configurável; saiba o que o seu faz antes de escrever a sua, para não empilhar duas camadas de retry.\n\nCom chamadas resilientes no lugar, o módulo 2 entra no que faz a qualidade da resposta: o prompt.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a divisão fundamental entre os erros de API?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Transitórios (retentar) e definitivos (corrigir, não retentar)",
                            isCorrect: true,
                        },
                        {
                            text: "Erros de manhã e erros do horário de pico",
                            isCorrect: false,
                        },
                        {
                            text: "Erros causados pelo SDK e erros do sistema operacional local",
                            isCorrect: false,
                        },
                        {
                            text: "Erros baratos e erros caros na fatura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa o erro 429?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Limite de requisições atingido (rate limit)",
                            isCorrect: true,
                        },
                        {
                            text: "Chave de API inválida ou revogada",
                            isCorrect: false,
                        },
                        {
                            text: "Requisição malformada no corpo",
                            isCorrect: false,
                        },
                        {
                            text: "Modelo descontinuado pelo provedor da API",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que retentar um erro 400 é inútil?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A requisição é inválida; repetir igual só queima cota",
                            isCorrect: true,
                        },
                        {
                            text: "O erro 400 bloqueia a conta por vinte e quatro horas",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor cobra em dobro cada retentativa",
                            isCorrect: false,
                        },
                        {
                            text: "O SDK converte 400 em 500 automaticamente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o jitter (tempero aleatório) no backoff?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Evitar que muitos clientes retentem todos no mesmo instante",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar a temperatura da geração a cada nova retentativa",
                            isCorrect: false,
                        },
                        {
                            text: "Confundir o provedor para liberar cota extra",
                            isCorrect: false,
                        },
                        {
                            text: "Reduzir o custo dos tokens nas horas cheias",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um lote de mil documentos precisa passar pelo modelo. Qual desenho respeita os rate limits?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Concorrência controlada dentro do limite publicado, com backoff",
                            isCorrect: true,
                        },
                        {
                            text: "Um for disparando as mil chamadas de uma vez só",
                            isCorrect: false,
                        },
                        {
                            text: "Uma chamada única com os mil documentos no prompt",
                            isCorrect: false,
                        },
                        {
                            text: "Criar dez chaves de API diferentes e dividir o lote entre elas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Por baixo do SDK: a API é só HTTP",
            blocks: [
                {
                    type: "text",
                    value: "# Tirando a capa\n\nO SDK é conveniência, não magia: por baixo, toda chamada é um POST HTTPS com JSON, autenticado por um cabeçalho. Ver a requisição crua uma vez vale por dez tutoriais, porque desfaz o mistério e destrava situações onde o SDK não está disponível (outra linguagem, um ambiente restrito, um teste rápido de terminal).\n\nO curl abaixo é uma chamada completa. Os nomes exatos de cabeçalho e campos variam por provedor (autorização via Authorization: Bearer ou via cabeçalho próprio; system dentro ou fora da lista), mas o esqueleto é sempre este.",
                },
                {
                    type: "code",
                    value: 'curl https://api.provedor.com/v1/chat \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer $PROVIDER_API_KEY" \\\n  -d \'{\n    "model": "modelo-medio-2026-01",\n    "max_tokens": 200,\n    "messages": [\n      {"role": "user", "content": "Diga ola em portugues"}\n    ]\n  }\'\n# A resposta e um JSON com content, usage e stop_reason',
                },
                {
                    type: "table",
                    value: '[["Peça da requisição","O que é"],["POST no endpoint de chat","Toda chamada de geração é um POST com corpo JSON"],["Cabeçalho de autorização","A chave de API identificando a conta"],["Corpo JSON","Modelo, parâmetros e a lista de mensagens"],["Resposta JSON","Conteúdo, usage, stop_reason e id"]]',
                },
                {
                    type: "quote",
                    value: "SDK é açúcar sobre um POST com JSON. Quem já viu a chamada crua depura com outra confiança: qualquer HTTP client, em qualquer linguagem, fala com qualquer provedor.",
                },
                {
                    type: "text",
                    value: "## O que o SDK acrescenta de verdade\n\nSe é só HTTP, por que usar SDK? Pelas partes chatas feitas certas: retentativas com backoff embutidas, tipos e validação dos campos, streaming tratado, timeouts sensatos e atualização junto com a API. Em produção, o SDK oficial é o padrão; o conhecimento do HTTP cru fica para depuração (reproduzir um bug com curl isola se o problema é seu ou do SDK) e para ambientes onde o SDK não chega.\n\nFecha aqui o módulo de fundação: você sabe o que é uma chamada, tem ambiente e chave, fez a primeira requisição, tratou erros e viu o HTTP por baixo. O módulo 2 começa a arte de fazer o modelo responder BEM: prompt engineering na prática.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma chamada de LLM por baixo do SDK?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um POST HTTPS com JSON e um cabeçalho de autorização",
                            isCorrect: true,
                        },
                        {
                            text: "Uma conexão direta de banco de dados com o provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Um protocolo binário proprietário e fechado",
                            isCorrect: false,
                        },
                        {
                            text: "Um e-mail estruturado processado em lote",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o cabeçalho de autorização carrega?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A chave de API que identifica a conta",
                            isCorrect: true,
                        },
                        {
                            text: "O nome do modelo a ser usado",
                            isCorrect: false,
                        },
                        {
                            text: "A lista de mensagens da conversa",
                            isCorrect: false,
                        },
                        {
                            text: "O endereço IP do servidor de destino",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual vantagem prática o SDK oficial acrescenta sobre o HTTP cru?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Retentativas, tipos, streaming e timeouts já resolvidos",
                            isCorrect: true,
                        },
                        {
                            text: "Preço por token menor nas chamadas via SDK",
                            isCorrect: false,
                        },
                        {
                            text: "Acesso a modelos exclusivos que não existem na API HTTP",
                            isCorrect: false,
                        },
                        {
                            text: "Respostas sem limite de tokens de saída",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando saber o HTTP cru salva o dia?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Depurando com curl e em ambientes sem o SDK disponível",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre: produção séria dispensa SDKs oficiais",
                            isCorrect: false,
                        },
                        {
                            text: "Nunca: o conhecimento é apenas curiosidade histórica",
                            isCorrect: false,
                        },
                        {
                            text: "Só quando o provedor desliga a API JSON",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um bug estranho aparece nas chamadas em produção. Como isolar se o problema é do seu código, do SDK ou da API?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Reproduzir a mesma requisição crua com curl e comparar",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o max_tokens até o erro desaparecer",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar de provedor imediatamente e comparar preços",
                            isCorrect: false,
                        },
                        {
                            text: "Reiniciar o servidor e limpar o cache do navegador",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Prompt engineering na prática",
    aulas: [
        {
            titulo: "Zero-shot e few-shot: exemplos ensinam",
            blocks: [
                {
                    type: "text",
                    value: '# A técnica mais barata que existe\n\nPrompt engineering começa com uma distinção simples. Zero-shot: você pede a tarefa sem mostrar nenhum exemplo ("classifique este comentário como positivo, negativo ou neutro"). Few-shot: você mostra dois ou três exemplos resolvidos antes de pedir o caso real. Para modelos atuais, zero-shot resolve muita coisa; o few-shot entra quando o formato importa ou quando o critério é sutil.\n\nO que os exemplos ensinam de verdade não é conteúdo, é PADRÃO: o formato exato da saída, o nível de detalhe, o critério de borda (o comentário irônico é negativo ou neutro?). Um exemplo bem escolhido comunica o que três parágrafos de instrução não conseguem.',
                },
                {
                    type: "code",
                    value: 'prompt = """Classifique o sentimento do comentario em: positivo, negativo ou neutro.\nResponda so com a palavra.\n\nComentario: "Chegou rapido, mas veio amassado."\nSentimento: negativo\n\nComentario: "Cumpre o que promete."\nSentimento: positivo\n\nComentario: "Nossa, que atendimento incrivel, esperei so 3 horas na fila..."\nSentimento: negativo\n\nComentario: "{comentario_do_cliente}"\nSentimento:"""\n# O terceiro exemplo ensina o criterio da ironia, dificil de explicar em regra',
                },
                {
                    type: "table",
                    value: '[["Situação","Abordagem","Por quê"],["Tarefa comum, formato livre","Zero-shot","O modelo já sabe; exemplo é custo"],["Formato de saída rígido","Few-shot (1 a 3 exemplos)","Exemplo fixa o formato melhor que instrução"],["Critério sutil ou de borda","Few-shot com o caso difícil","O exemplo carrega o critério"],["Muitos exemplos disponíveis","Selecionar os melhores, não despejar","Tokens custam; qualidade supera volume"]]',
                },
                {
                    type: "quote",
                    value: "Exemplo ensina padrão, não conteúdo: formato, tom e critério de borda. Se a saída veio no formato errado, a primeira correção é mostrar um exemplo, não escrever mais um parágrafo de instrução.",
                },
                {
                    type: "text",
                    value: "## Armadilhas do few-shot\n\nTrês cuidados. Exemplos enviesam: se todos os seus exemplos de classificação são negativos, o modelo tende ao negativo; equilibre. Exemplos custam: cada um é pago em toda chamada (e favorece o cache de prompt se ficarem no prefixo estável, como visto nos Fundamentos). E exemplos DESATUALIZAM: quando a regra de negócio muda, os exemplos embutidos no prompt precisam mudar junto, senão viram instrução contraditória. Trate exemplos como código: revisados, versionados e testados.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença entre zero-shot e few-shot?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Zero-shot pede sem exemplos; few-shot mostra exemplos resolvidos antes",
                            isCorrect: true,
                        },
                        {
                            text: "Zero-shot usa temperatura zero; few-shot exige temperatura bem alta",
                            isCorrect: false,
                        },
                        {
                            text: "Zero-shot é grátis; few-shot é um recurso pago à parte",
                            isCorrect: false,
                        },
                        {
                            text: "Zero-shot é para código; few-shot é para texto livre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que os exemplos de um few-shot ensinam de verdade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O padrão: formato, nível de detalhe e critério de borda",
                            isCorrect: true,
                        },
                        {
                            text: "Fatos novos que o modelo nunca viu no seu treinamento",
                            isCorrect: false,
                        },
                        {
                            text: "O idioma em que o modelo deve pensar",
                            isCorrect: false,
                        },
                        {
                            text: "A velocidade com que a resposta deve sair",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A saída veio no formato errado. Qual é a primeira correção sugerida pela aula?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mostrar um exemplo do formato desejado no prompt",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o max_tokens até caber todo o formato",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o modelo por um maior imediatamente",
                            isCorrect: false,
                        },
                        {
                            text: "Reenviar a mesma chamada até acertar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Todos os exemplos do prompt de classificação são de casos negativos. Qual é o risco?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Enviesar o modelo a classificar tudo como negativo",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhum: exemplos não influenciam a tendência final",
                            isCorrect: false,
                        },
                        {
                            text: "A API recusa prompts com exemplos repetidos",
                            isCorrect: false,
                        },
                        {
                            text: "O custo dobra para exemplos do mesmo tipo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A regra de negócio mudou, mas os exemplos antigos ficaram no prompt. O que acontece?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Instrução e exemplos entram em contradição e a saída degrada",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: o modelo prioriza sempre a instrução mais recente",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor detecta o conflito e avisa por e-mail",
                            isCorrect: false,
                        },
                        {
                            text: "Os exemplos antigos são ignorados após trinta dias",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Chain-of-thought: pensar antes de responder",
            blocks: [
                {
                    type: "text",
                    value: '# Devagar quando o problema pede\n\nChain-of-thought (CoT, cadeia de raciocínio) é pedir que o modelo desenvolva o raciocínio antes da resposta final: "pense passo a passo antes de responder". Em tarefas de lógica, matemática aplicada, análise com várias condições e decisões encadeadas, o ganho é real e medível: gerar os passos intermediários dá ao modelo espaço para computar, em vez de saltar direto para uma conclusão plausível.\n\nO custo também é real: mais tokens de saída (os caros) e mais latência. Em tarefa simples (classificação direta, extração), o CoT é desperdício e pode até piorar, adicionando rodeio onde cabia uma palavra.',
                },
                {
                    type: "code",
                    value: 'prompt = """Um cliente comprou 3 itens de R$ 40 com cupom de 15% e frete de R$ 18.\nO pedido passa de R$ 120 e ganha frete gratis?\n\nPense passo a passo: calcule o subtotal, aplique o cupom,\nverifique a regra do frete e so entao responda.\nTermine com a linha: RESPOSTA: sim ou nao."""\n\n# A ancora final ("RESPOSTA:") facilita extrair a conclusao por codigo,\n# separando o raciocinio (para o modelo) da resposta (para o sistema)',
                },
                {
                    type: "table",
                    value: '[["Tarefa","CoT ajuda?","Observação"],["Cálculo com regras encadeadas","Sim, muito","Passos dão espaço de computação"],["Decisão com várias condições","Sim","Explicita cada condição antes do veredito"],["Classificação simples","Não","Rodeio; encarece sem ganho"],["Extração de campos","Não","Direto ao formato é melhor"],["Modelos de raciocínio (reasoning)","Já embutido","Pensam sozinhos; pedir CoT duplica"]]',
                },
                {
                    type: "quote",
                    value: "Cadeia de raciocínio compra exatidão com tokens e latência. Use onde o erro custa caro e o problema tem etapas; no resto, resposta direta.",
                },
                {
                    type: "text",
                    value: '## CoT e os modelos de raciocínio\n\nOs modelos de raciocínio de 2026 (vistos no módulo de ecossistema dos Fundamentos) trazem o pensar embutido: geram uma cadeia interna antes da resposta, sem você pedir. Com eles, instruções de "pense passo a passo" são redundantes; o dial passa a ser o esforço de raciocínio (reasoning effort) da chamada. A regra de projeto continua a mesma: pensar é caro, reserve para onde muda o resultado. E um detalhe de produto: raciocínio exposto ao usuário raramente é bom UX; prefira a âncora de resposta final e mostre só ela.',
                },
            ],
            questions: [
                {
                    statement: "O que é chain-of-thought?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pedir que o modelo desenvolva o raciocínio antes da resposta final",
                            isCorrect: true,
                        },
                        {
                            text: "Encadear várias chamadas de API em sequência na mesma conversa",
                            isCorrect: false,
                        },
                        {
                            text: "Um formato de JSON com campos aninhados",
                            isCorrect: false,
                        },
                        {
                            text: "A lista de mensagens da conversa completa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em qual tarefa o CoT tende a ajudar de verdade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cálculo com regras encadeadas e condições",
                            isCorrect: true,
                        },
                        {
                            text: "Classificação direta de sentimento",
                            isCorrect: false,
                        },
                        {
                            text: "Extração de um campo simples do texto",
                            isCorrect: false,
                        },
                        {
                            text: "Tradução de uma frase curta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o custo do chain-of-thought?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mais tokens de saída e mais latência por resposta",
                            isCorrect: true,
                        },
                        {
                            text: "Uma taxa fixa cobrada por raciocínio ativado",
                            isCorrect: false,
                        },
                        {
                            text: "A perda do histórico da conversa anterior",
                            isCorrect: false,
                        },
                        {
                            text: "O bloqueio do cache de prompt na chamada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Para que serve a âncora final (tipo "RESPOSTA:") num prompt com CoT?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Separar o raciocínio da conclusão e facilitar a extração por código",
                            isCorrect: true,
                        },
                        {
                            text: "Encerrar a cobrança dos tokens de raciocínio",
                            isCorrect: false,
                        },
                        {
                            text: "Impedir por completo o modelo de pensar além do estritamente necessário",
                            isCorrect: false,
                        },
                        {
                            text: "Marcar a resposta para o cache do provedor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Usando um modelo de raciocínio (reasoning), o que muda no uso de CoT?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O pensar já é embutido; o dial vira o esforço de raciocínio da chamada",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: o pedido explícito de passo a passo continua sendo obrigatório",
                            isCorrect: false,
                        },
                        {
                            text: "O CoT passa a ser proibido pelos provedores",
                            isCorrect: false,
                        },
                        {
                            text: "O raciocínio deixa de consumir qualquer token",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Controlando o formato da saída",
            blocks: [
                {
                    type: "text",
                    value: '# A resposta que o sistema consegue usar\n\nQuando a saída do modelo alimenta OUTRO código (e em produto, quase sempre alimenta), formato deixa de ser estética e vira contrato. As ferramentas do prompt para impor formato, em ordem de força: instrução explícita ("responda só com a palavra, sem explicação"), exemplo do formato (few-shot, a mais eficaz por token investido), delimitadores claros no prompt (separar instrução de dado com marcas) e a âncora de resposta.\n\nDois hábitos que pagam sempre: pedir MENOS ("em até 3 frases", "só a lista, sem introdução") porque modelos adoram preâmbulo, e proibir o que você não quer explicitamente ("sem markdown", "sem desculpas ou avisos").',
                },
                {
                    type: "code",
                    value: 'prompt = """Extraia os dados do e-mail entre as marcas.\n\nRegras:\n- Responda SO com as tres linhas do formato, sem nada antes ou depois\n- Campo ausente: escreva "nao informado"\n\nFormato:\nnome: ...\nempresa: ...\ntelefone: ...\n\n<email>\n{corpo_do_email}\n</email>"""\n# Delimitadores (<email>) separam instrucao de dado; o formato com\n# exemplo literal vale mais que descrever o formato em prosa',
                },
                {
                    type: "table",
                    value: '[["Ferramenta","Força","Exemplo"],["Instrução explícita de formato","Boa","Responda só com a palavra"],["Exemplo literal do formato","Muito boa","Mostrar as três linhas preenchidas"],["Delimitadores de dado","Higiene básica","Texto do usuário entre marcas"],["Proibições explícitas","Complemento","Sem introdução, sem markdown"],["Structured outputs (módulo 4)","Garantia","Schema imposto pela API"]]',
                },
                {
                    type: "quote",
                    value: "Em produto, formato é contrato: o prompt promete, o código valida sempre, e o módulo 4 mostra como a API garante. Confiar sem validar é bug agendado.",
                },
                {
                    type: "text",
                    value: "## Valide mesmo assim\n\nPor melhor que o prompt fique, trate a saída como entrada não confiável: parse com tratamento de erro, valide campos e tenha um caminho para o caso inválido (retentar uma vez com a mensagem do erro, ou cair num padrão seguro). Essa disciplina vira estrutura formal no módulo 4, com structured outputs e function calling, onde o formato deixa de depender de boa vontade do modelo. Até lá, a dupla prompt claro + validação cobre a maioria dos casos.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a ferramenta de formato mais eficaz por token investido?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mostrar um exemplo literal do formato desejado",
                            isCorrect: true,
                        },
                        {
                            text: "Escrever a instrução em letras maiúsculas",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a temperatura da geração",
                            isCorrect: false,
                        },
                        {
                            text: "Repetir a mesma instrução cinco vezes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para que servem os delimitadores (marcas em volta do dado) no prompt?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Separar claramente a instrução do conteúdo a processar",
                            isCorrect: true,
                        },
                        {
                            text: "Comprimir o texto do prompt e economizar tokens de entrada",
                            isCorrect: false,
                        },
                        {
                            text: "Ativar o modo de raciocínio do modelo",
                            isCorrect: false,
                        },
                        {
                            text: "Criptografar o dado dentro da chamada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: 'Por que instruções como "sem introdução, só a lista" são úteis?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Modelos tendem ao preâmbulo; proibir explicitamente corta o excesso",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a API cobra bem menos por respostas entregues sem saudação",
                            isCorrect: false,
                        },
                        {
                            text: "Porque listas sem introdução não contam na janela",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o modelo não entende cortesia em português",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Mesmo com um bom prompt de formato, o que o código deve fazer com a saída?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Tratar como entrada não confiável: parse com erro tratado e validação",
                            isCorrect: true,
                        },
                        {
                            text: "Usar direto: um prompt bem escrito dispensa qualquer validação extra",
                            isCorrect: false,
                        },
                        {
                            text: "Armazenar sem ler para auditoria futura",
                            isCorrect: false,
                        },
                        {
                            text: "Reenviar ao modelo para ele conferir sozinho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "A extração devolveu um campo inválido. Qual caminho a aula sugere?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Retentar uma vez incluindo o erro, ou cair num padrão seguro",
                            isCorrect: true,
                        },
                        {
                            text: "Aceitar o campo inválido para não perder a chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Desligar a validação que está atrapalhando o fluxo normal",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o provedor na mesma requisição",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Decompor: prompts encadeados",
            blocks: [
                {
                    type: "text",
                    value: '# Um prompt gigante ou vários pequenos?\n\nQuando a tarefa cresce ("leia este contrato, extraia as cláusulas de risco, compare com a política interna e escreva um parecer"), enfiar tudo em um prompt único produz respostas rasas: o modelo divide a atenção entre subtarefas e nenhuma sai bem. A alternativa de engenharia é DECOMPOR: uma chamada por etapa, com a saída de uma alimentando a entrada da seguinte.\n\nCada etapa vira um prompt pequeno e focado (extrair; depois comparar; depois redigir), com formato de saída próprio e validável. O pipeline fica mais barato de depurar (a etapa que errou é visível), mais fácil de testar (cada etapa tem seus casos) e permite modelos diferentes por etapa (o barato extrai, o forte redige, o roteamento dos Fundamentos aplicado).',
                },
                {
                    type: "code",
                    value: 'def analisar_contrato(texto):\n    clausulas = chamar(PROMPT_EXTRAI_CLAUSULAS, texto)        # modelo pequeno\n    if not clausulas:\n        return "Nenhuma clausula de risco encontrada."\n    conflitos = chamar(PROMPT_COMPARA_POLITICA, clausulas)    # modelo pequeno\n    parecer = chamar(PROMPT_REDIGE_PARECER, conflitos)        # modelo forte\n    return parecer\n# Tres prompts focados, cada um testavel; o codigo orquestra (if, loops),\n# o modelo faz so o que codigo nao faz',
                },
                {
                    type: "table",
                    value: '[["Aspecto","Prompt único gigante","Pipeline decomposto"],["Qualidade por subtarefa","Diluída","Focada por etapa"],["Depuração","Caixa-preta","A etapa que errou aparece"],["Teste","Difícil isolar","Casos por etapa"],["Custo","Modelo forte para tudo","Modelo certo por etapa"],["Latência","Uma chamada","Várias; pesa em tempo real"]]',
                },
                {
                    type: "quote",
                    value: "Decompor devolve ao CÓDIGO o que é do código: fluxo, condição e repetição. O modelo entra como função focada dentro do pipeline, não como o pipeline inteiro.",
                },
                {
                    type: "text",
                    value: "## O contraponto honesto\n\nDecomposição custa latência (chamadas em série somam) e coordenação (cada fronteira entre etapas é um formato a validar). Tarefa que um prompt bom resolve não merece pipeline; a decomposição entra quando a qualidade do prompt único não basta ou quando as etapas têm valor próprio (log, revisão humana entre elas, retentativa isolada). Esse desenho de etapas com o código no comando é a semente do que os agentes farão sozinhos na trilha 7: lá, quem decide a próxima etapa é o modelo; aqui, ainda é você.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é o sintoma clássico de um prompt tentando fazer coisas demais?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Respostas rasas, com a atenção diluída entre as subtarefas",
                            isCorrect: true,
                        },
                        {
                            text: "O erro 429 de limite de requisições por minuto na API",
                            isCorrect: false,
                        },
                        {
                            text: "A chave de API expirando no meio da chamada",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo respondendo em outro idioma",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é decompor uma tarefa em prompts encadeados?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma chamada focada por etapa, com a saída de uma alimentando a próxima",
                            isCorrect: true,
                        },
                        {
                            text: "Repetir o mesmo prompt até a resposta melhorar",
                            isCorrect: false,
                        },
                        {
                            text: "Dividir o texto em pedaços do mesmo tamanho",
                            isCorrect: false,
                        },
                        {
                            text: "Enviar a tarefa completa para vários provedores diferentes ao mesmo tempo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual vantagem de custo o pipeline decomposto permite?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Usar modelo barato nas etapas simples e forte só onde precisa",
                            isCorrect: true,
                        },
                        {
                            text: "Pagar apenas a primeira chamada do pipeline",
                            isCorrect: false,
                        },
                        {
                            text: "Somar os tokens de todas as etapas num desconto único mensal",
                            isCorrect: false,
                        },
                        {
                            text: "Eliminar por completo os tokens de entrada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o custo real da decomposição?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Latência somada das chamadas e formatos a validar entre etapas",
                            isCorrect: true,
                        },
                        {
                            text: "A perda do histórico da conversa entre as etapas do pipeline",
                            isCorrect: false,
                        },
                        {
                            text: "Uma tarifa extra do provedor por encadeamento",
                            isCorrect: false,
                        },
                        {
                            text: "A obrigação de usar o mesmo modelo em tudo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No pipeline decomposto desta aula, quem decide a próxima etapa? E o que muda com agentes?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Aqui o código decide; com agentes, o modelo passa a decidir o fluxo",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo decide nos dois casos, sem nenhuma diferença na prática",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário final escolhe cada etapa manualmente",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor roteia as etapas automaticamente",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Iterar com método: prompts são engenharia",
            blocks: [
                {
                    type: "text",
                    value: "# Sair do achismo\n\nA cena clássica: alguém mexe no prompt, testa UMA pergunta no olho, acha que melhorou e sobe. Duas semanas depois, casos que funcionavam quebraram e ninguém sabe qual mudança quebrou. Prompt sem método é regressão garantida.\n\nO método mínimo cabe em três hábitos. Um conjunto de casos de teste: 15 a 30 entradas reais com a saída esperada (fáceis, difíceis e as bordas que já morderam), rodadas TODAS a cada mudança. Uma mudança por vez: alterou a instrução E o exemplo E o modelo, o resultado não diz qual mexida causou o quê. E registro: cada versão do prompt com data, motivo e resultado no conjunto (o versionamento formal vem no módulo 3).",
                },
                {
                    type: "code",
                    value: 'CASOS = [\n    {"entrada": "Chegou rapido, mas veio amassado.", "esperado": "negativo"},\n    {"entrada": "Cumpre o que promete.", "esperado": "positivo"},\n    {"entrada": "Que atendimento incrivel, so 3h de fila...", "esperado": "negativo"},\n    # ... casos reais, incluindo os que ja quebraram em producao\n]\n\ndef avaliar(prompt_versao):\n    acertos = sum(\n        1 for c in CASOS\n        if classificar(prompt_versao, c["entrada"]) == c["esperado"]\n    )\n    return acertos / len(CASOS)\n\n# v1: 0.78 | v2 (exemplo de ironia): 0.91 | decisao com numero, nao com impressao',
                },
                {
                    type: "table",
                    value: '[["Hábito","O que evita"],["Conjunto de casos rodado a cada mudança","Melhorar um caso quebrando cinco"],["Uma mudança por vez","Não saber o que causou o efeito"],["Casos de borda que já morderam","Reintroduzir o bug de duas semanas atrás"],["Registro de versão, motivo e resultado","Discussão por impressão, sem número"]]',
                },
                {
                    type: "quote",
                    value: 'A pergunta que separa amador de profissional não é "o prompt melhorou?", é "melhorou EM QUANTO, medido em quê?". Quinze casos reais respondem; uma testada no olho, não.',
                },
                {
                    type: "text",
                    value: "## O gancho para o que vem\n\nEsse conjunto de casos é a forma embrionária do que a trilha de LLMs em Produção formaliza como evals: avaliação sistemática, com métricas, rodando a cada mudança de prompt ou de modelo. Comece pequeno já nos exercícios desta trilha (um arquivo de casos por prompt importante) e o hábito escala junto com o produto.\n\nCom as técnicas de prompt no bolso, o módulo 3 ataca o prompt mais importante da aplicação: o system prompt, onde mora a personalidade e as regras do seu produto.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o método mínimo para evoluir um prompt com segurança?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Conjunto de casos de teste, uma mudança por vez e registro das versões",
                            isCorrect: true,
                        },
                        {
                            text: "Testar uma única pergunta no olho e subir se o resultado parecer bom",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar de modelo a cada ajuste de instrução",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir ao próprio modelo para aprovar a mudança",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que deve compor o conjunto de casos de teste?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Entradas reais com saída esperada, incluindo as bordas que já quebraram",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas os casos mais fáceis do produto, para o número final ficar alto",
                            isCorrect: false,
                        },
                        {
                            text: "Entradas inventadas sem nenhuma resposta definida",
                            isCorrect: false,
                        },
                        {
                            text: "Só o caso que motivou a última mudança",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que mudar uma coisa por vez no prompt?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para saber qual mudança causou o efeito medido",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a API limita o tamanho das alterações",
                            isCorrect: false,
                        },
                        {
                            text: "Para o cache de prompt não ser invalidado",
                            isCorrect: false,
                        },
                        {
                            text: "Porque mudanças juntas custam mais tokens",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma mexida no prompt melhorou o caso novo, e duas semanas depois casos antigos quebraram. O que faltou?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Rodar o conjunto inteiro de casos a cada mudança",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar a temperatura junto com cada mudança",
                            isCorrect: false,
                        },
                        {
                            text: "Escrever o prompt em inglês desde o início",
                            isCorrect: false,
                        },
                        {
                            text: "Usar um modelo maior para o caso novo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O conjunto de casos desta aula é a forma embrionária de qual prática da trilha de produção?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Evals: avaliação sistemática a cada mudança de prompt ou modelo",
                            isCorrect: true,
                        },
                        {
                            text: "Cache de prompt com o prefixo estável primeiro",
                            isCorrect: false,
                        },
                        {
                            text: "Roteamento de modelos por tarefa",
                            isCorrect: false,
                        },
                        {
                            text: "Backoff exponencial com jitter nas retentativas de chamadas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - System prompt: a alma da aplicação",
    aulas: [
        {
            titulo: "O que mora no system prompt",
            blocks: [
                {
                    type: "text",
                    value: "# O prompt que o usuário nunca vê\n\nO system prompt é a mensagem da SUA aplicação, lida antes de qualquer coisa e presente em toda chamada. É nele que o assistente genérico do provedor vira o SEU produto: o tom da sua marca, as regras do seu negócio, os limites do que pode e não pode. Enquanto o prompt do usuário muda a cada turno, o system é estável (e por isso, lembre dos Fundamentos, é o prefixo ideal para o cache).\n\nUm system prompt de produto costuma ter cinco blocos: PAPEL (quem o assistente é e para quem trabalha), TAREFA (o que faz e o que entrega), REGRAS (o que sempre e o que nunca), TOM (como fala) e FORMATO (como estrutura as respostas). Não precisa ser longo; precisa ser inequívoco.",
                },
                {
                    type: "code",
                    value: 'SYSTEM = """Voce e o assistente da Ensina Dev, plataforma de cursos de tecnologia.\n\nSua tarefa: tirar duvidas sobre trilhas, planos e certificados.\n\nRegras:\n- Responda SEMPRE em portugues do Brasil, em ate 4 frases\n- Use apenas as informacoes do contexto fornecido; sem inventar preco ou prazo\n- Sem acesso a dados de pagamento: direcione ao suporte humano\n- Fora do escopo (politica, saude, outros produtos): recuse com gentileza\n  e volte ao assunto da plataforma\n\nTom: proximo e direto, sem girias e sem formalidade excessiva."""',
                },
                {
                    type: "table",
                    value: '[["Bloco","Responde a","Exemplo"],["Papel","Quem é e para quem trabalha","Assistente de suporte da loja X"],["Tarefa","O que faz e entrega","Tirar dúvidas de pedido e troca"],["Regras","O que sempre e o que nunca","Nunca inventar prazo; sempre PT-BR"],["Tom","Como fala","Próximo, direto, sem gírias"],["Formato","Como estrutura","Até 4 frases; listas quando pedir passos"]]',
                },
                {
                    type: "quote",
                    value: "O system prompt é o contrato do produto com o modelo: papel, tarefa, regras, tom e formato. O que não estiver ali, o modelo decide sozinho, e nem sempre como você gostaria.",
                },
                {
                    type: "text",
                    value: "## O que NÃO mora nele\n\nDois inquilinos errados. Dados voláteis (preço do dia, estoque, a data de hoje): entram pelo contexto da chamada, injetados pelo código, senão desatualizam dentro do prompt. E segredos (chaves, URLs internas, instruções que constrangeriam se vazassem): system prompt não é cofre; com esforço, usuários extraem seu conteúdo, então escreva como se pudesse ser lido. As aulas seguintes detalham cada bloco na prática, começando pelas regras que o modelo respeita de verdade.",
                },
            ],
            questions: [
                {
                    statement: "O que diferencia o system prompt da mensagem do usuário?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "É a instrução estável da aplicação, presente em toda chamada",
                            isCorrect: true,
                        },
                        {
                            text: "É gerado automaticamente pelo modelo ao fim de cada conversa",
                            isCorrect: false,
                        },
                        {
                            text: "É digitado pelo usuário na primeira mensagem",
                            isCorrect: false,
                        },
                        {
                            text: "É gratuito, não conta nos tokens de entrada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são os cinco blocos típicos de um system prompt de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Papel, tarefa, regras, tom e formato",
                            isCorrect: true,
                        },
                        {
                            text: "Título, resumo, corpo, anexo e rodapé",
                            isCorrect: false,
                        },
                        {
                            text: "Modelo, temperatura, teto, parada e seed",
                            isCorrect: false,
                        },
                        {
                            text: "Entrada, saída, erro, log e métrica",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o preço do dia NÃO deve ficar escrito no system prompt?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É dado volátil; entra pelo contexto injetado pelo código",
                            isCorrect: true,
                        },
                        {
                            text: "Números são proibidos em mensagens de system",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo não consegue ler valores monetários em reais",
                            isCorrect: false,
                        },
                        {
                            text: "Preços no system dobram o custo da chamada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que escrever o system prompt como se ele pudesse ser lido pelo usuário?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Com esforço, usuários extraem o conteúdo; ele não é cofre",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o provedor publica os prompts em auditoria pública",
                            isCorrect: false,
                        },
                        {
                            text: "Porque ele aparece no console do navegador sempre",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a lei exige exibir o prompt no rodapé",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Manter o system prompt estável (e a parte variável fora dele) favorece qual mecanismo de custo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O cache de prompt, que barateia o prefixo repetido",
                            isCorrect: true,
                        },
                        {
                            text: "O desconto por fidelidade do provedor",
                            isCorrect: false,
                        },
                        {
                            text: "A cobrança única do system no mês",
                            isCorrect: false,
                        },
                        {
                            text: "A isenção total de tokens para as instruções fixas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Regras que o modelo respeita",
            blocks: [
                {
                    type: "text",
                    value: '# Escrever regra é uma habilidade\n\nNem toda instrução tem o mesmo poder. Algumas formas de escrever regras funcionam consistentemente melhor, e conhecê-las poupa rodadas de tentativa.\n\nPrefira o positivo ao negativo: "responda em até 4 frases" supera "não escreva respostas longas" (o negativo deixa o espaço aberto; o positivo define o alvo). Quando o negativo é necessário, emparelhe com a alternativa: "não invente prazos; sem a informação no contexto, diga que vai verificar". Regra sem alternativa deixa o modelo sem saída boa, e ele preenche o vazio inventando.',
                },
                {
                    type: "text",
                    value: '## Especificidade, prioridade e exemplo\n\nRegra vaga rende obediência vaga: "seja conciso" vale menos que "até 4 frases"; "seja profissional" vale menos que "sem gírias, sem emojis, trate por você". Quando regras podem conflitar, diga qual vence: "se a resposta exigir mais de 4 frases para ser correta, a correção vence o limite". E para as regras mais críticas, um mini exemplo dentro do system (pergunta difícil, resposta modelo) ancora o comportamento melhor que qualquer adjetivo.\n\nDuas armadilhas conhecidas: prompts QUILOMÉTRICOS diluem (regra importante enterrada no meio de cinquenta linhas triviais é regra ignorada, lembre do lost in the middle); e regras contraditórias ("seja completo" + "seja breve", sem critério de desempate) produzem comportamento errático.',
                },
                {
                    type: "table",
                    value: '[["Regra fraca","Regra forte"],["Não escreva respostas longas","Responda em até 4 frases"],["Seja profissional","Sem gírias; trate o cliente por você"],["Não invente informações","Use só o contexto; sem a informação, diga que vai verificar"],["Seja útil sempre","Fora do escopo, recuse e ofereça o canal certo"]]',
                },
                {
                    type: "quote",
                    value: "Regra boa tem alvo (positiva e específica), tem saída (a alternativa para o caso proibido) e tem prioridade (quem vence no conflito). O resto é adjetivo.",
                },
                {
                    type: "text",
                    value: "## Teste de regra é teste de borda\n\nRegra se testa com o caso que a desafia, não com o caso comum: a pergunta fora do escopo, o pedido de informação inexistente, o usuário insistindo depois da recusa. Monte esses casos no seu conjunto de teste (módulo 2) e rode a cada mudança do system. A próxima aula trata exatamente do caso mais delicado: como recusar e redirecionar sem quebrar a experiência.",
                },
            ],
            questions: [
                {
                    statement: "Por que regras positivas superam negativas?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Definem o alvo, enquanto o negativo deixa o espaço aberto",
                            isCorrect: true,
                        },
                        {
                            text: "Custam menos tokens na chamada",
                            isCorrect: false,
                        },
                        {
                            text: "São as únicas instruções que o modelo consegue ler direito",
                            isCorrect: false,
                        },
                        {
                            text: "Impedem o cache de ser invalidado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: 'Qual é o par correto para uma proibição como "não invente prazos"?',
                    difficulty: "facil",
                    options: [
                        {
                            text: "A alternativa: sem a informação, dizer que vai verificar",
                            isCorrect: true,
                        },
                        {
                            text: "Uma ameaça explícita de desligamento imediato do assistente",
                            isCorrect: false,
                        },
                        {
                            text: "A mesma proibição repetida em maiúsculas",
                            isCorrect: false,
                        },
                        {
                            text: "Um aumento do teto de tokens de saída",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        '"Seja completo" e "seja breve" convivem no mesmo system prompt. O que falta?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "O critério de desempate dizendo qual regra vence no conflito",
                            isCorrect: true,
                        },
                        {
                            text: "Um exemplo de resposta em outro idioma",
                            isCorrect: false,
                        },
                        {
                            text: "A troca das duas por um único adjetivo",
                            isCorrect: false,
                        },
                        {
                            text: "Nada: o modelo resolve qualquer contradição sozinho, sempre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que um system prompt de cinquenta linhas triviais enfraquece a regra crítica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A regra importante dilui no meio; posição e volume pesam",
                            isCorrect: true,
                        },
                        {
                            text: "A API trunca prompts de sistema com mais de vinte linhas",
                            isCorrect: false,
                        },
                        {
                            text: "Regras só valem nas três primeiras linhas",
                            isCorrect: false,
                        },
                        {
                            text: "O custo alto desativa as instruções extras",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se testa uma regra do system prompt?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Com casos de borda que a desafiam, rodados a cada mudança",
                            isCorrect: true,
                        },
                        {
                            text: "Com a pergunta mais comum do produto, uma vez",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntando ao próprio modelo se ele entendeu a regra",
                            isCorrect: false,
                        },
                        {
                            text: "Lendo o prompt em voz alta para o time",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Persona e tom de voz",
            blocks: [
                {
                    type: "text",
                    value: '# O assistente com a cara da marca\n\nDois produtos podem usar o mesmo modelo e soar completamente diferentes: a diferença é a persona definida no system. Persona não é enfeite: consistência de voz constrói confiança, e a voz errada mina o produto (o banco que responde com piadas, o app jovem que soa como cartório).\n\nDefinir persona é responder poucas perguntas com decisão: registro (formal ou próximo? você ou senhor?), energia (entusiasta ou sóbria?), humor (permitido? em que dose?), identidade (tem nome? se apresenta como assistente virtual?) e vocabulário (termos da marca, palavras a evitar). O erro comum é o adjetivo solto ("seja amigável"); o acerto é o par decisão + exemplo.',
                },
                {
                    type: "code",
                    value: 'TOM = """Tom de voz:\n- Trate por voce; nada de "prezado" nem "senhor(a)"\n- Direto ao ponto: a resposta comeca pela informacao, nao por rodeio\n- Sem exclamacoes em serie e sem jargao tecnico nao explicado\n- Humor leve permitido apenas se o cliente brincar primeiro\n\nExemplo do tom:\nPergunta: "Cade meu pedido????"\nResposta: "Seu pedido saiu do centro de distribuicao hoje cedo e chega\nate quinta. O codigo de rastreio e XYZ123. Qualquer mudanca, te aviso.""""',
                },
                {
                    type: "table",
                    value: '[["Decisão de voz","Opções","Exemplo de escolha"],["Registro","Formal x próximo","Próximo: trata por você"],["Energia","Entusiasta x sóbria","Sóbria: sem exclamações em série"],["Humor","Livre x dosado x nunca","Só se o cliente brincar primeiro"],["Identidade","Nome próprio x genérico","Assistente da marca, sem nome humano"],["Vocabulário","Termos da casa x neutros","Fala trilha, não curso"]]',
                },
                {
                    type: "quote",
                    value: 'Persona se define com decisões e um exemplo, não com adjetivos. "Seja amigável" gera dez interpretações; uma resposta modelo gera uma.',
                },
                {
                    type: "text",
                    value: "## Consistência sob pressão\n\nO teste da persona não é a pergunta simpática, é a situação difícil: cliente irritado, reclamação injusta, pedido que será negado. A voz definida precisa aguentar esses momentos (firmeza sem frieza, desculpa sem servilismo), e é para eles que o exemplo no system mais serve. Inclua no seu conjunto de teste dois ou três casos tensos e avalie se a voz se mantém. Persona que só funciona no dia bom não é persona, é sorte.",
                },
            ],
            questions: [
                {
                    statement: "Por que persona consistente importa em produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Consistência de voz constrói confiança na marca",
                            isCorrect: true,
                        },
                        {
                            text: "O provedor exige persona nos termos de uso",
                            isCorrect: false,
                        },
                        {
                            text: "Personas reduzem o custo dos tokens de saída",
                            isCorrect: false,
                        },
                        {
                            text: "Sem persona o modelo se recusa a responder",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o erro comum ao definir tom de voz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: 'Adjetivos soltos como "seja amigável", sem decisão nem exemplo',
                            isCorrect: true,
                        },
                        {
                            text: "Escolher tratar o cliente sempre por você no chat",
                            isCorrect: false,
                        },
                        {
                            text: "Definir as palavras próprias da marca no vocabulário do bot",
                            isCorrect: false,
                        },
                        {
                            text: "Limitar exclamações nas respostas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que ancora o tom melhor que qualquer descrição?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma resposta modelo de exemplo dentro do system",
                            isCorrect: true,
                        },
                        {
                            text: "O aumento da temperatura de geração",
                            isCorrect: false,
                        },
                        {
                            text: "A repetição do adjetivo em três lugares",
                            isCorrect: false,
                        },
                        {
                            text: "Um parágrafo inteiro sobre a história da empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o verdadeiro teste de uma persona?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As situações difíceis: cliente irritado, pedido negado",
                            isCorrect: true,
                        },
                        {
                            text: "A saudação inicial da primeira mensagem do cliente",
                            isCorrect: false,
                        },
                        {
                            text: "A pergunta mais frequente do FAQ da loja",
                            isCorrect: false,
                        },
                        {
                            text: "A resposta a um elogio do cliente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um banco quer voz sóbria, e um app de festas quer voz solta. O que muda tecnicamente entre os dois produtos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "As decisões de voz e exemplos no system; o modelo pode ser o mesmo",
                            isCorrect: true,
                        },
                        {
                            text: "O provedor: cada tom de voz exige uma empresa de IA diferente",
                            isCorrect: false,
                        },
                        {
                            text: "A linguagem de programação do backend",
                            isCorrect: false,
                        },
                        {
                            text: "Nada: o tom emerge sozinho do público do app",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Recusar bem: escopo e casos difíceis",
            blocks: [
                {
                    type: "text",
                    value: '# O assistente que sabe dizer não\n\nTodo assistente de produto tem fronteira: assuntos fora do escopo, informações que ele não tem, ações que não pode executar. O que separa um produto maduro é COMO essa fronteira aparece. A recusa seca ("não posso ajudar com isso") frustra; a tentativa de ajudar mesmo sem saber gera alucinação, que é pior. O alvo é o meio: reconhecer, recusar com clareza e REDIRECIONAR para o caminho que resolve.\n\nA estrutura da boa recusa: valida a pergunta (sem sermão), nomeia o limite com franqueza e oferece a saída (o canal certo, a alternativa dentro do escopo). E o system precisa listar as saídas: "pagamentos: direcione ao suporte humano pelo chat; assuntos fora da plataforma: recuse com gentileza e ofereça ajudar com trilhas e planos".',
                },
                {
                    type: "code",
                    value: 'REGRAS_ESCOPO = """Fora do escopo:\n- Dados de pagamento e reembolso: "Isso quem resolve rapidinho e o time\n  de suporte, pelo botao Falar com humano. Posso ajudar com algo das trilhas?"\n- Aconselhamento juridico, medico ou financeiro: recuse com gentileza e\n  nao opine, mesmo se o cliente insistir\n- Informacao que nao esta no contexto: "Essa informacao eu nao tenho aqui.\n  Vou te direcionar ao suporte para confirmar direitinho."\n\nInsistencia apos recusa: mantenha a posicao, sem sermao e sem ceder.\nNunca finja executar acoes que voce nao executa (cancelar, reembolsar)."""',
                },
                {
                    type: "table",
                    value: '[["Situação","Resposta ruim","Resposta boa"],["Assunto fora do escopo","Opinar para agradar","Recusar com gentileza e voltar ao escopo"],["Informação ausente do contexto","Inventar plausível","Assumir que não tem e apontar o canal"],["Ação que não executa","Fingir que fez","Dizer o limite e quem pode fazer"],["Insistência após recusa","Ceder na terceira vez","Manter a posição, sem sermão"]]',
                },
                {
                    type: "quote",
                    value: "A pior resposta não é o não: é o sim inventado. Recusa boa valida, nomeia o limite e aponta a saída; e o system precisa dizer QUAL é a saída de cada caso.",
                },
                {
                    type: "text",
                    value: "## Por que isso é arquitetura, não cosmética\n\nCada recusa bem desenhada é uma alucinação evitada e um risco jurídico a menos (aconselhamento indevido, promessa falsa de ação). Os casos difíceis pertencem ao conjunto de teste com prioridade máxima: fora de escopo, informação ausente, insistência, pedido de ação impossível. No módulo 7, o chatbot do projeto implementa essas regras de verdade; e a trilha de Agentes eleva o tema, porque lá recusar errado significa EXECUTAR errado.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a estrutura da boa recusa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Validar, nomear o limite com franqueza e apontar a saída",
                            isCorrect: true,
                        },
                        {
                            text: "Ignorar a pergunta e mudar de assunto",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir desculpas em três parágrafos",
                            isCorrect: false,
                        },
                        {
                            text: "Responder qualquer coisa para não frustrar o cliente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: 'Por que "tentar ajudar mesmo sem saber" é pior que recusar?',
                    difficulty: "facil",
                    options: [
                        {
                            text: "Vira alucinação: informação inventada com cara de resposta",
                            isCorrect: true,
                        },
                        {
                            text: "Porque gasta mais tokens de saída por resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o provedor pune as contas prestativas demais no plano",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o usuário prefere silêncio a resposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o system prompt precisa listar junto com cada limite?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A saída: o canal ou alternativa para cada caso recusado",
                            isCorrect: true,
                        },
                        {
                            text: "A punição prevista para o usuário que insistir no tema",
                            isCorrect: false,
                        },
                        {
                            text: "O custo em tokens de cada recusa",
                            isCorrect: false,
                        },
                        {
                            text: "O nome do desenvolvedor responsável",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O cliente insiste pela terceira vez após uma recusa correta. O que o assistente deve fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Manter a posição com gentileza, sem sermão e sem ceder",
                            isCorrect: true,
                        },
                        {
                            text: "Ceder parcialmente apenas para encerrar logo a conversa",
                            isCorrect: false,
                        },
                        {
                            text: "Encerrar o chat sem responder mais nada",
                            isCorrect: false,
                        },
                        {
                            text: "Dar a resposta com um aviso de incerteza",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Por que "nunca fingir executar ações" é regra crítica num assistente de suporte?',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Promessa falsa de ação (cancelar, reembolsar) vira dano real e passivo jurídico",
                            isCorrect: true,
                        },
                        {
                            text: "Porque as ações fictícias simuladas consomem tokens em dobro na cobrança da API",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o modelo trava ao simular ações",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o cache de prompt registra a promessa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Prompts são código: versione, teste, publique",
            blocks: [
                {
                    type: "text",
                    value: '# O prompt que ninguém sabe quem mudou\n\nEm muitos times, o system prompt vive num lugar frágil: uma string perdida no código, editada por qualquer um, sem histórico do que mudou e por quê. Até que uma edição bem-intencionada muda o comportamento em produção e ninguém consegue responder "o que mudou desde a semana passada?".\n\nA correção é tratar prompt como se trata código, porque ele É: um artefato versionado (no repositório, com diff e revisão de PR), testado (o conjunto de casos do módulo 2 rodando a cada mudança) e publicado com controle (a mudança de prompt é um deploy, com possibilidade de rollback). Times maduros somam um registro simples: versão, data, motivo e resultado nos casos.',
                },
                {
                    type: "code",
                    value: '# prompts/suporte.py\nSUPORTE_V3 = """..."""  # 2026-08: regra de reembolso ao suporte humano\n\n# CHANGELOG do prompt (no proprio arquivo ou no PR):\n# v3 (2026-08-04): reembolso -> suporte humano. Casos: 24/25 (v2: 21/25)\n# v2 (2026-07-20): tom mais direto; exemplo de rastreio\n# v1 (2026-07-01): versao inicial\n\nSYSTEM_ATUAL = SUPORTE_V3  # trocar aqui e um deploy: teste antes, rollback facil',
                },
                {
                    type: "table",
                    value: '[["Prática de código","Aplicada a prompt"],["Versionamento com diff","Prompt no repositório, mudança via PR"],["Testes antes do merge","Conjunto de casos rodando a cada mudança"],["Deploy controlado","Troca de versão explícita, com rollback"],["Changelog","Versão, data, motivo e resultado nos casos"],["Revisão de par","Outra pessoa lê a mudança do prompt"]]',
                },
                {
                    type: "quote",
                    value: "Se mudar uma linha do prompt muda o comportamento do produto, o prompt é código. Merece o mesmo respeito: versão, teste, revisão e rollback.",
                },
                {
                    type: "text",
                    value: "## Fechando o módulo\n\nVocê agora desenha o system prompt inteiro: os cinco blocos, regras que funcionam, persona com decisão e exemplo, recusas com saída e o ciclo de vida versionado. É a alma da aplicação pronta. O módulo 4 dá o passo que transforma o chat em SISTEMA: saídas estruturadas e function calling, quando o modelo para de só conversar e começa a acionar o seu código.",
                },
            ],
            questions: [
                {
                    statement: "Por que tratar prompt como código?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mudar uma linha muda o comportamento do produto em produção",
                            isCorrect: true,
                        },
                        {
                            text: "Porque os prompts são compilados junto com o código do backend",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a API exige prompts em arquivos .py",
                            isCorrect: false,
                        },
                        {
                            text: "Porque strings soltas custam mais tokens",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o changelog de um prompt registra?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Versão, data, motivo e resultado no conjunto de casos",
                            isCorrect: true,
                        },
                        {
                            text: "O número de tokens de cada versão",
                            isCorrect: false,
                        },
                        {
                            text: "Os nomes de todos os usuários que conversaram no mês",
                            isCorrect: false,
                        },
                        {
                            text: "A temperatura usada em cada chamada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o sintoma clássico de prompt sem versionamento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Comportamento mudou em produção e ninguém sabe o que mudou",
                            isCorrect: true,
                        },
                        {
                            text: "O custo por chamada cai sem explicação",
                            isCorrect: false,
                        },
                        {
                            text: "As respostas ficam completamente idênticas por semanas",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo recusa prompts editados demais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a troca de versão do prompt deve ser explícita (um deploy)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Permite testar antes e voltar atrás rápido se degradar",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o provedor cobra por edição de prompt",
                            isCorrect: false,
                        },
                        {
                            text: "Porque prompts antigos expiram em até trinta dias",
                            isCorrect: false,
                        },
                        {
                            text: "Para o cache de prompt cobrar a versão nova",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma edição de prompt melhorou os casos e foi publicada; dois dias depois o tom degradou em produção. Qual prática resolve mais rápido?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Rollback para a versão anterior registrada, enquanto se investiga",
                            isCorrect: true,
                        },
                        {
                            text: "Editar o prompt ao vivo direto em produção até acertar o tom",
                            isCorrect: false,
                        },
                        {
                            text: "Apagar o changelog e começar do zero",
                            isCorrect: false,
                        },
                        {
                            text: "Subir a temperatura da geração para compensar o tom",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Saídas estruturadas e function calling",
    aulas: [
        {
            titulo: "Do texto ao dado: por que JSON confiável é difícil",
            blocks: [
                {
                    type: "text",
                    value: '# O muro entre chat e sistema\n\nAté aqui o modelo devolve texto para gente ler. Sistemas precisam de DADOS: o pedido extraído do e-mail vira registro no banco, a classificação vira campo, a decisão vira chamada de função. E pedir JSON "no prompt" esbarra num problema conhecido: o modelo gera texto por probabilidade (Fundamentos, módulo 1), então às vezes vem a crase de bloco de código em volta, uma vírgula sobrando, um comentário simpático antes do JSON, um campo rebatizado.\n\nCom bom prompt (módulo 2), a taxa de acerto sobe para a casa dos 95% e mais. O problema é que produto multiplica: 95% de acerto em dez mil chamadas por dia são QUINHENTOS JSONs quebrados diários. Formato por boa vontade não escala; é para isso que existem os modos estruturados da API.',
                },
                {
                    type: "code",
                    value: '# O que chega quando se pede JSON \'no peito\':\n\n# Chamada 1 (perfeita):\n# {"nome": "Ana Souza", "empresa": "TechCo", "telefone": "11 99999-0000"}\n\n# Chamada 2 (crase de markdown em volta):\n# ```json\n# {"nome": "Ana Souza", ...}\n# ```\n\n# Chamada 3 (comentario antes):\n# Claro! Segue o JSON extraido:\n# {"nome": "Ana Souza", ...}\n\n# Chamada 4 (campo rebatizado):\n# {"nome_completo": "Ana Souza", ...}\n\n# json.loads() quebra em 2 e 3; o codigo que le "nome" quebra em 4',
                },
                {
                    type: "table",
                    value: '[["Falha típica","O que quebra"],["Bloco de código em volta do JSON","O parse direto com json.loads"],["Texto simpático antes ou depois","O parse direto"],["Vírgula sobrando ou aspas erradas","O parse direto"],["Campo rebatizado ou faltando","O código que consome o dado"],["Enum fora da lista (\\"positivo!\\")","A validação e o banco"]]',
                },
                {
                    type: "quote",
                    value: "95% de JSON válido parece ótimo até multiplicar pelo volume: em dez mil chamadas por dia, são quinhentas quebradas. Formato garantido não é luxo, é aritmética.",
                },
                {
                    type: "text",
                    value: '## O caminho deste módulo\n\nA solução moderna tem dois andares. STRUCTURED OUTPUTS: a API restringe a geração a um schema que você declara, e o JSON volta válido e no formato, por construção. FUNCTION CALLING: um passo além, o modelo escolhe CHAMAR uma função sua, com argumentos estruturados, e o seu código executa. O primeiro resolve "quero dados"; o segundo resolve "quero que o modelo acione meu sistema". As próximas aulas constroem os dois, e o projeto do módulo 7 usa ambos.',
                },
            ],
            questions: [
                {
                    statement: "Por que pedir JSON só no prompt não escala para produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A geração é probabilística; o erro raro multiplica com o volume",
                            isCorrect: true,
                        },
                        {
                            text: "JSON é proibido nas respostas dos provedores",
                            isCorrect: false,
                        },
                        {
                            text: "O prompt não consegue descrever as chaves e os valores de JSON",
                            isCorrect: false,
                        },
                        {
                            text: "JSON gasta mais tokens que texto corrido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual falha típica quebra o json.loads direto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O bloco de código de markdown em volta do JSON",
                            isCorrect: true,
                        },
                        {
                            text: "O uso de acentos nos valores de todos os campos",
                            isCorrect: false,
                        },
                        {
                            text: "Números com mais de dez dígitos",
                            isCorrect: false,
                        },
                        {
                            text: "Campos em ordem diferente da pedida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o structured outputs garante?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A geração restrita a um schema declarado: JSON válido por construção",
                            isCorrect: true,
                        },
                        {
                            text: "Resposta sempre idêntica para a mesma pergunta em todas as chamadas",
                            isCorrect: false,
                        },
                        {
                            text: "Custo zero para os tokens da resposta",
                            isCorrect: false,
                        },
                        {
                            text: "A correção factual de todos os valores extraídos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a diferença de propósito entre structured outputs e function calling?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um devolve dados no formato; o outro aciona funções do seu código",
                            isCorrect: true,
                        },
                        {
                            text: "Um funciona somente em Python; o outro, apenas em JavaScript",
                            isCorrect: false,
                        },
                        {
                            text: "Um é pago; o outro vem grátis nas chamadas",
                            isCorrect: false,
                        },
                        {
                            text: "São dois nomes diferentes do mesmo recurso da API",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um campo veio rebatizado (nome_completo em vez de nome) e o sistema gravou nulo em silêncio. Que camada faltou?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Schema imposto na geração (ou validação estrita no consumo)",
                            isCorrect: true,
                        },
                        {
                            text: "Um retry com backoff exponencial e jitter na mesma chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Um system prompt com persona mais firme",
                            isCorrect: false,
                        },
                        {
                            text: "Temperatura mais alta para variar os nomes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Declarando o schema: structured outputs",
            blocks: [
                {
                    type: "text",
                    value: "# O contrato que a API impõe\n\nNo modo estruturado, você envia junto com a chamada um JSON SCHEMA: a descrição formal do que a resposta deve ser (campos, tipos, obrigatórios, enums). O provedor restringe a própria geração ao schema, e o que volta é JSON válido naquele formato, sem crase, sem comentário, sem campo rebatizado.\n\nEm Python, o caminho ergonômico é declarar o schema como classe Pydantic e deixar a biblioteca gerar o JSON Schema; os SDKs modernos aceitam a classe direto e devolvem o objeto já validado e tipado. O schema vira a fonte única de verdade do formato: quem lê o código sabe exatamente o que a IA devolve.",
                },
                {
                    type: "code",
                    value: 'from pydantic import BaseModel, Field\nfrom typing import Literal\n\nclass Contato(BaseModel):\n    nome: str\n    empresa: str | None = None\n    telefone: str | None = Field(None, description="Com DDD, ex: 11 99999-0000")\n    interesse: Literal["compra", "suporte", "parceria", "outro"]\n\nresposta = cliente.chat.parse(\n    model="modelo-medio-2026-01",\n    messages=[{"role": "user", "content": f"Extraia o contato:\\n{email}"}],\n    response_format=Contato,\n)\ncontato = resposta.parsed  # objeto Contato, validado e tipado\nprint(contato.interesse)   # garantido: um dos quatro valores do Literal',
                },
                {
                    type: "table",
                    value: '[["Peça do schema","Para que serve","Exemplo"],["Tipos (str, int, bool)","O tipo certo por campo","telefone: str"],["Opcional com padrão","Campo que pode faltar","empresa: str | None"],["Literal / enum","Valores fechados","interesse entre quatro opções"],["description no campo","Instrução local ao modelo","Com DDD, ex: 11 99999-0000"],["Aninhamento e listas","Estruturas compostas","lista de itens do pedido"]]',
                },
                {
                    type: "quote",
                    value: "O schema garante FORMA, não VERDADE: o JSON volta válido e tipado, mas o valor pode estar errado. Enum fecha o vocabulário; a exatidão do conteúdo continua sendo problema de prompt e de avaliação.",
                },
                {
                    type: "text",
                    value: '## Desenhando schemas que ajudam o modelo\n\nTrês práticas elevam a qualidade. Enums sempre que o vocabulário é fechado (categoria, status, prioridade): eliminam a variação criativa. Descriptions nos campos ambíguos: são instruções que o modelo lê ("telefone com DDD"), prompt engineering dentro do schema. E um campo de escape quando fizer sentido (interesse: "outro") para o caso que não cabe nas opções, senão o modelo força o encaixe errado. Schema também é código: versionado e testado como o prompt do módulo 3.',
                },
            ],
            questions: [
                {
                    statement: "O que você declara no modo structured outputs?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um JSON Schema com campos, tipos, obrigatórios e enums",
                            isCorrect: true,
                        },
                        {
                            text: "A lista de servidores autorizados a responder na API",
                            isCorrect: false,
                        },
                        {
                            text: "O número máximo de chamadas por minuto",
                            isCorrect: false,
                        },
                        {
                            text: "O idioma permitido na resposta gerada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em Python, qual é o caminho ergonômico para declarar o schema?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Classe Pydantic aceita direto pelo SDK, com objeto validado de volta",
                            isCorrect: true,
                        },
                        {
                            text: "Uma string de JSON Schema montada à mão com replace dentro do código",
                            isCorrect: false,
                        },
                        {
                            text: "Comentários especiais dentro do prompt",
                            isCorrect: false,
                        },
                        {
                            text: "Arquivo XML de configuração no servidor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o Literal/enum no schema?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fechar o vocabulário do campo em valores permitidos",
                            isCorrect: true,
                        },
                        {
                            text: "Tornar o campo sempre opcional na resposta gerada",
                            isCorrect: false,
                        },
                        {
                            text: "Criptografar o valor retornado no campo",
                            isCorrect: false,
                        },
                        {
                            text: "Dobrar a velocidade da geração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a description de um campo faz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Instrui o modelo localmente sobre o preenchimento daquele campo",
                            isCorrect: true,
                        },
                        {
                            text: "Documenta apenas para humanos; o modelo nunca chega a ler o texto",
                            isCorrect: false,
                        },
                        {
                            text: "Define o tipo de dado do campo",
                            isCorrect: false,
                        },
                        {
                            text: "Esconde o campo do usuário final",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: '"O schema garante forma, não verdade" significa que:',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O JSON volta válido e tipado, mas o valor pode estar factualmente errado",
                            isCorrect: true,
                        },
                        {
                            text: "O JSON pode até vir quebrado, mas o conteúdo dele é sempre exato e correto",
                            isCorrect: false,
                        },
                        {
                            text: "A API valida a verdade dos campos contra a internet",
                            isCorrect: false,
                        },
                        {
                            text: "Schemas só funcionam com temperatura zero",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Function calling: o modelo aciona o seu código",
            blocks: [
                {
                    type: "text",
                    value: '# A inversão que muda tudo\n\nNo structured outputs, você pede um dado e o modelo devolve. No function calling, a relação inverte: você DECLARA um catálogo de ferramentas (funções suas, descritas com nome, descrição e schema de parâmetros) e o modelo, ao responder um usuário, pode DECIDIR que precisa de uma delas. Ele não executa nada: devolve uma resposta especial dizendo "chame consultar_pedido com numero=12345". O SEU código executa a função de verdade e devolve o resultado ao modelo, que então formula a resposta final.\n\nEssa é a ponte entre a conversa e o sistema: o modelo vira o intérprete que entende "cadê minha encomenda?" e o transforma na chamada de função certa, com os argumentos certos, extraídos da conversa.',
                },
                {
                    type: "code",
                    value: 'FERRAMENTAS = [{\n    "name": "consultar_pedido",\n    "description": "Consulta o status de um pedido pelo numero. Use quando o cliente perguntar sobre entrega, atraso ou rastreio.",\n    "input_schema": {\n        "type": "object",\n        "properties": {\n            "numero": {"type": "string", "description": "Numero do pedido, ex: PED-12345"}\n        },\n        "required": ["numero"]\n    }\n}]\n\nresposta = cliente.chat.create(model=..., messages=historico, tools=FERRAMENTAS)\n\nif resposta.stop_reason == "tool_use":\n    chamada = resposta.tool_call          # nome + argumentos estruturados\n    resultado = executar(chamada)         # SEU codigo roda a funcao de verdade\n    # devolve o resultado como mensagem e chama o modelo de novo (proxima aula)',
                },
                {
                    type: "table",
                    value: '[["Quem","Faz o quê"],["Você (declaração)","Descreve as ferramentas: nome, descrição, schema"],["Modelo","Decide SE e QUAL ferramenta usar, e com quais argumentos"],["Seu código","Executa a função de verdade e devolve o resultado"],["Modelo (de novo)","Usa o resultado para formular a resposta final"]]',
                },
                {
                    type: "quote",
                    value: "O modelo nunca executa: ele PEDE. Seu código é quem roda a função, e é exatamente essa fronteira que mantém o controle (e a segurança) do seu lado.",
                },
                {
                    type: "text",
                    value: '## O que o modelo decide (e o que isso implica)\n\nTrês decisões ficam com o modelo: usar ou não ferramenta (pergunta trivial se responde direto), qual usar (entre as declaradas) e com quais argumentos (extraídos da conversa). Cada uma pode errar: acionar ferramenta sem necessidade, escolher a errada, alucinar um argumento (o pedido "PED-99999" que o cliente nunca disse). Por isso os schemas de parâmetros importam tanto quanto os de resposta, e por isso ações com consequência (cancelar, pagar) pedem confirmação antes de executar, tema que a trilha de Agentes aprofunda. A próxima aula ensina a escrever ferramentas que induzem decisões certas.',
                },
            ],
            questions: [
                {
                    statement:
                        "No function calling, o que o modelo devolve quando decide usar uma ferramenta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um pedido estruturado com o nome da função e os argumentos",
                            isCorrect: true,
                        },
                        {
                            text: "O resultado da função já executada por ele",
                            isCorrect: false,
                        },
                        {
                            text: "O código-fonte completo da função para você revisar antes",
                            isCorrect: false,
                        },
                        {
                            text: "Um link para o painel do provedor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quem executa a função de verdade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O seu código, fora do modelo",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo, dentro do provedor",
                            isCorrect: false,
                        },
                        {
                            text: "O navegador do usuário final",
                            isCorrect: false,
                        },
                        {
                            text: "Um servidor especial do provedor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que compõe a declaração de uma ferramenta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nome, descrição de quando usar e schema dos parâmetros",
                            isCorrect: true,
                        },
                        {
                            text: "O código-fonte completo da função executada",
                            isCorrect: false,
                        },
                        {
                            text: "A senha de acesso direto ao banco de dados da loja",
                            isCorrect: false,
                        },
                        {
                            text: "Os logs das execuções anteriores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são as três decisões que ficam com o modelo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Se usa ferramenta, qual usa e com quais argumentos",
                            isCorrect: true,
                        },
                        {
                            text: "Quando executar, onde hospedar e quanto cobrar",
                            isCorrect: false,
                        },
                        {
                            text: "Modelo, temperatura e teto de tokens",
                            isCorrect: false,
                        },
                        {
                            text: "Formato, idioma e tom da resposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'O cliente pergunta sobre um pedido sem citar número, e o modelo chama consultar_pedido com "PED-99999". O que aconteceu e o que mitiga?',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Argumento alucinado; schema exigente e instrução de perguntar antes mitigam",
                            isCorrect: true,
                        },
                        {
                            text: "Bug do provedor; apenas retentar resolve",
                            isCorrect: false,
                        },
                        {
                            text: "Comportamento correto do modelo; todo pedido novo tem esse número padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Um erro de rede passageiro; o backoff exponencial resolve",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Desenhando boas ferramentas",
            blocks: [
                {
                    type: "text",
                    value: '# A ferramenta é uma interface para um leitor atento\n\nO modelo decide com base no que você ESCREVEU: nome, descrição e schema são a única janela dele para a sua função. Ferramenta mal descrita produz decisão errada, e a correção quase nunca é trocar o modelo: é reescrever a declaração.\n\nAs regras de ouro: nome que diz a ação (consultar_pedido, não util_a); descrição que diz QUANDO usar e quando NÃO usar ("use para status de entrega; para trocas e devoluções, use iniciar_troca"); parâmetros com descrição e exemplo; e granularidade certa: uma ferramenta por intenção, nem a super-ferramenta faz-tudo (com um parâmetro "acao" que vira decisão dentro da decisão), nem vinte micro-ferramentas que disputam a escolha.',
                },
                {
                    type: "code",
                    value: '# Ruim: generica, sem criterio de quando usar\n{"name": "buscar", "description": "Busca informacoes",\n "input_schema": {"properties": {"q": {"type": "string"}}}}\n\n# Boa: acao clara, criterio de uso, parametro com exemplo\n{"name": "consultar_pedido",\n "description": "Status de entrega de um pedido especifico. Use quando o cliente\\n  perguntar de entrega, atraso ou rastreio E o numero do pedido for conhecido.\\n  Sem o numero, pergunte antes. Para trocas, use iniciar_troca.",\n "input_schema": {"type": "object", "properties": {\n     "numero": {"type": "string", "description": "Formato PED-12345"}},\n  "required": ["numero"]}}',
                },
                {
                    type: "table",
                    value: '[["Sinal de ferramenta ruim","Correção"],["Nome vago (buscar, util, acao)","Nome-verbo específico da intenção"],["Descrição sem critério de uso","Quando usar E quando usar a outra"],["Parâmetro sem formato/exemplo","description com formato e exemplo"],["Super-ferramenta com parâmetro acao","Uma ferramenta por intenção"],["Vinte ferramentas sobrepostas","Consolidar; fronteiras nítidas"]]',
                },
                {
                    type: "quote",
                    value: "O modelo escolhe pelo que está escrito, não pelo que a função faz por dentro. Errou a escolha? O primeiro suspeito é a descrição, não o modelo.",
                },
                {
                    type: "text",
                    value: '## Erros que ensinam\n\nQuando a execução falha, a mensagem de erro devolvida ao modelo é parte da interface: "pedido não encontrado; confirme o número com o cliente" orienta a próxima ação; um stack trace cru, não. Desenhe os erros como desenharia para um colega apressado: o que deu errado e o que fazer agora. E teste as ferramentas como testa prompts: um conjunto de conversas de caso (com a ferramenta certa esperada por caso) rodando a cada mudança de declaração.',
                },
            ],
            questions: [
                {
                    statement: "Com base em que o modelo escolhe a ferramenta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No nome, na descrição e no schema declarados",
                            isCorrect: true,
                        },
                        {
                            text: "No código-fonte interno de cada função",
                            isCorrect: false,
                        },
                        {
                            text: "Na ordem alfabética da lista de ferramentas",
                            isCorrect: false,
                        },
                        {
                            text: "No histórico de faturamento da conta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que uma boa descrição de ferramenta inclui?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quando usar e quando usar outra ferramenta no lugar",
                            isCorrect: true,
                        },
                        {
                            text: "O nome da pessoa que escreveu a função",
                            isCorrect: false,
                        },
                        {
                            text: "A data do último deploy do serviço",
                            isCorrect: false,
                        },
                        {
                            text: "O custo em tokens de cada acionamento da função",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: 'Por que a super-ferramenta com parâmetro "acao" é um problema?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Empurra a decisão para dentro do parâmetro, onde erra mais",
                            isCorrect: true,
                        },
                        {
                            text: "A API limita cada ferramenta a um único parâmetro de texto",
                            isCorrect: false,
                        },
                        {
                            text: "Nomes genéricos pagam tarifa maior",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo não lê valores de parâmetro nunca",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a forma correta de devolver uma falha de execução ao modelo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mensagem orientada à ação: o que falhou e o que fazer agora",
                            isCorrect: true,
                        },
                        {
                            text: "O stack trace completo da exceção",
                            isCorrect: false,
                        },
                        {
                            text: "Silêncio total, para o modelo não se confundir com o erro",
                            isCorrect: false,
                        },
                        {
                            text: "Um código numérico interno sem nenhum texto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O modelo insiste em usar a ferramenta errada para perguntas de troca. Qual é o primeiro ajuste?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Reescrever as descrições marcando a fronteira entre as duas ferramentas",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar imediatamente para o modelo mais caro do catálogo do provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Remover a ferramenta de troca do catálogo declarado",
                            isCorrect: false,
                        },
                        {
                            text: "Subir a temperatura para variar a escolha",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O ciclo completo: da pergunta à resposta com ferramenta",
            blocks: [
                {
                    type: "text",
                    value: "# Fechando o loop\n\nHora de montar o ciclo inteiro, o coração de todo assistente com ferramentas. A sequência: (1) usuário pergunta; (2) modelo responde pedindo uma ferramenta (stop_reason de tool_use); (3) seu código executa e ANEXA ao histórico duas mensagens: o pedido do modelo e o resultado da execução; (4) chama o modelo de novo com o histórico crescido; (5) o modelo responde ao usuário usando o resultado (ou pede OUTRA ferramenta, e o ciclo repete).\n\nO loop precisa de guarda-corpos desde o dia um: um LIMITE de iterações (três a cinco resolve quase tudo; sem limite, um caso patológico vira loop infinito pago por token) e timeout nas execuções.",
                },
                {
                    type: "code",
                    value: 'def responder(historico, max_passos=4):\n    for _ in range(max_passos):\n        r = cliente.chat.create(model=MODELO, messages=historico, tools=FERRAMENTAS)\n        if r.stop_reason != "tool_use":\n            return r.content                     # resposta final ao usuario\n        historico.append(mensagem_do_pedido(r))  # o modelo pediu a ferramenta\n        try:\n            resultado = executar(r.tool_call)    # SEU codigo roda\n        except FerramentaErro as e:\n            resultado = f"erro: {e.orientacao}"  # erro orientado a acao\n        historico.append(mensagem_de_resultado(r.tool_call, resultado))\n    return "Nao consegui concluir; encaminhei ao suporte."  # teto atingido',
                },
                {
                    type: "table",
                    value: '[["Passo","Quem age","O que entra no histórico"],["1. Pergunta","Usuário","Mensagem user"],["2. Pedido de ferramenta","Modelo","Mensagem assistant com tool_use"],["3. Execução","Seu código","Mensagem de resultado da ferramenta"],["4. Nova chamada","Sua aplicação","Histórico completo reenviado"],["5. Resposta final","Modelo","Mensagem assistant com o texto"]]',
                },
                {
                    type: "quote",
                    value: "O histórico conta a história completa: pergunta, pedido de ferramenta, resultado, resposta. Esconder um elo quebra o raciocínio do modelo; limitar as voltas protege o seu bolso.",
                },
                {
                    type: "text",
                    value: "## Você acabou de conhecer o embrião de um agente\n\nRepare no que esse loop já é: o modelo percebe (a pergunta), decide (qual ferramenta), age (via seu código) e observa (o resultado), repetidas vezes até concluir. Esse é literalmente o ciclo de um AGENTE, que a trilha 7 desenvolve com estado, memória, orquestração e segurança. Por ora, o que importa dominar: o protocolo de mensagens do ciclo, os guarda-corpos de iteração e a regra de que resultado de ferramenta também é contexto (conta tokens, entra no orçamento da janela).\n\nO módulo 5 muda o foco para a EXPERIÊNCIA: streaming, a diferença entre a resposta que chega e a resposta que parece chegar.",
                },
            ],
            questions: [
                {
                    statement: "O que entra no histórico depois que o código executa a ferramenta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O pedido do modelo e o resultado da execução",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas a resposta final para o usuário",
                            isCorrect: false,
                        },
                        {
                            text: "O código-fonte da ferramenta executada",
                            isCorrect: false,
                        },
                        {
                            text: "Nada: o resultado vai em um canal separado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como a aplicação sabe que o modelo pediu uma ferramenta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pelo stop_reason indicando tool_use na resposta",
                            isCorrect: true,
                        },
                        {
                            text: "Pelo aumento do custo da chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Por um e-mail de notificação enviado pelo provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Pela resposta vazia sem nenhum campo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o loop de ferramentas precisa de um limite de iterações?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem teto, um caso patológico vira loop infinito pago por token",
                            isCorrect: true,
                        },
                        {
                            text: "A API cobra taxa fixa por loop aberto",
                            isCorrect: false,
                        },
                        {
                            text: "O histórico da conversa é apagado a cada dez voltas do loop",
                            isCorrect: false,
                        },
                        {
                            text: "Ferramentas expiram após três execuções",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que acontece se a aplicação esconder o resultado da ferramenta do histórico?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O modelo perde o elo e não consegue formular a resposta final",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: o modelo consulta o resultado direto no banco de dados",
                            isCorrect: false,
                        },
                        {
                            text: "A resposta sai mais rápida e mais barata",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor reenvia o resultado sozinho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o loop desta aula é chamado de embrião de um agente?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Já tem o ciclo perceber, decidir, agir e observar até concluir",
                            isCorrect: true,
                        },
                        {
                            text: "Porque usa mais de um modelo por conversa",
                            isCorrect: false,
                        },
                        {
                            text: "Porque roda sem nenhuma intervenção do código da aplicação",
                            isCorrect: false,
                        },
                        {
                            text: "Porque dispensa histórico de mensagens",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Streaming e a experiência do chat",
    aulas: [
        {
            titulo: "Por que streaming: a latência que o usuário sente",
            blocks: [
                {
                    type: "text",
                    value: '# Dois relógios diferentes\n\nUma resposta de 500 tokens leva alguns segundos para ser gerada por inteiro. Sem streaming, o usuário encara uma tela parada por todo esse tempo e a resposta despenca pronta de uma vez; com streaming, as primeiras palavras aparecem em menos de um segundo e o texto vai crescendo. O tempo TOTAL é praticamente o mesmo; a experiência é de outro produto.\n\nDaí as duas métricas que separam os relógios: TTFT (time to first token, quanto demora o PRIMEIRO token) e o tempo total. Streaming não reduz o total; reduz brutalmente a espera percebida, porque o usuário começa a ler enquanto o resto é gerado. Todo chat que você já usou faz isso, e é por isso que a resposta "digita".',
                },
                {
                    type: "table",
                    value: '[["Métrica","O que mede","O que melhora ela"],["TTFT (primeiro token)","A espera até algo aparecer","Streaming, prompt menor, cache, modelo rápido"],["Tokens por segundo","A velocidade da digitação","Modelo e infraestrutura do provedor"],["Tempo total","Início ao fim da geração","Resposta mais curta, modelo mais rápido"],["Espera percebida","O que o usuário sente","Streaming acima de tudo"]]',
                },
                {
                    type: "quote",
                    value: "Streaming não entrega a resposta mais cedo; entrega a PRIMEIRA PALAVRA mais cedo, e isso muda a percepção inteira. Em chat, TTFT vale mais que tempo total.",
                },
                {
                    type: "text",
                    value: "## Quando usar e quando não\n\nStreaming é obrigatório no chat com humano esperando e valioso em qualquer geração longa exibida ao vivo. É DISPENSÁVEL (e até atrapalha) quando ninguém está olhando: pipelines de lote, extração estruturada consumida por código, tarefas de fundo. Nesses casos a resposta completa é mais simples de tratar (structured outputs, por exemplo, combina mal com consumo parcial).\n\nRegra prática: humano esperando na tela, stream; máquina consumindo, resposta completa. O resto do módulo ensina a consumir o stream em Python, levá-lo ao navegador e medir o que importa.",
                },
                {
                    type: "code",
                    value: "# A mesma chamada, dois modos:\n\n# Completo (para pipelines): espera tudo, devolve de uma vez\nresposta = cliente.chat.create(model=MODELO, messages=msgs)\n\n# Streaming (para chat): eventos vao chegando\nwith cliente.chat.stream(model=MODELO, messages=msgs) as stream:\n    for trecho in stream.text_deltas:\n        print(trecho, end=\"\", flush=True)   # a resposta 'digitando'\n    final = stream.final_message()          # usage e stop_reason no fim",
                },
            ],
            questions: [
                {
                    statement: "O que o streaming melhora de verdade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A espera percebida: o primeiro token chega muito antes",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo total de geração da resposta completa do modelo",
                            isCorrect: false,
                        },
                        {
                            text: "O custo por token da chamada",
                            isCorrect: false,
                        },
                        {
                            text: "A exatidão factual do conteúdo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é TTFT?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O tempo até o primeiro token da resposta aparecer",
                            isCorrect: true,
                        },
                        {
                            text: "O total de tokens da conversa inteira",
                            isCorrect: false,
                        },
                        {
                            text: "A taxa de transferência do arquivo de log do chat",
                            isCorrect: false,
                        },
                        {
                            text: "O teto de tokens configurado na chamada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em qual cenário o streaming é dispensável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pipeline de lote consumido por código, sem humano esperando",
                            isCorrect: true,
                        },
                        {
                            text: "Chat de suporte com o cliente na tela",
                            isCorrect: false,
                        },
                        {
                            text: "Assistente gerando um texto longo exibido ao vivo na tela",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer chamada com mais de dez tokens",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a regra prática de escolha entre stream e resposta completa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Humano esperando na tela: stream; máquina consumindo: completa",
                            isCorrect: true,
                        },
                        {
                            text: "Prompt curto pede stream; prompt longo pede resposta completa",
                            isCorrect: false,
                        },
                        {
                            text: "Modelo caro: stream; modelo barato: completa",
                            isCorrect: false,
                        },
                        {
                            text: "Manhã: stream; noite: completa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um chat exibe a resposta só quando ela termina, e os usuários reclamam de lentidão, embora o tempo total esteja normal. Qual é o diagnóstico?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Falta streaming: a espera percebida está no TTFT, não no total",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo ficou mais lento com o tempo e precisa ser trocado",
                            isCorrect: false,
                        },
                        {
                            text: "O custo alto está atrasando as respostas",
                            isCorrect: false,
                        },
                        {
                            text: "A janela de contexto está cheia demais",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Consumindo o stream em Python",
            blocks: [
                {
                    type: "text",
                    value: "# Eventos, não um textão\n\nNo modo streaming a API devolve uma SEQUÊNCIA de eventos: começo da mensagem, deltas de texto (os pedacinhos), eventuais blocos de ferramenta, e o encerramento com os metadados (usage, stop_reason). O SDK abstrai o grosso e entrega um iterador; seu trabalho é acumular os deltas e reagir aos eventos que importam.\n\nTrês cuidados de quem faz isso em produção. O usage chega NO FIM: registre depois do último evento, não antes. Erros podem acontecer NO MEIO do stream (a conexão cai com metade da resposta): trate a interrupção (retentar do zero ou mostrar o parcial com aviso). E ferramentas também streamam: o pedido de tool_use chega como evento, e o loop do módulo 4 continua valendo, só que dirigido por eventos.",
                },
                {
                    type: "code",
                    value: 'texto = []\ntry:\n    with cliente.chat.stream(model=MODELO, messages=msgs) as stream:\n        for evento in stream:\n            if evento.type == "text_delta":\n                texto.append(evento.text)\n                exibir(evento.text)              # UI vai pintando\n            elif evento.type == "tool_use":\n                pedido = evento.tool_call        # loop de ferramenta, versao stream\n        final = stream.final_message()\n        registrar_usage(final.usage)             # usage SO existe no fim\nexcept ConexaoInterrompida:\n    tratar_parcial("".join(texto))               # caiu no meio: decidir o que fazer',
                },
                {
                    type: "table",
                    value: '[["Evento","Quando chega","O que fazer"],["Início da mensagem","Primeiro","Preparar a UI (balão vazio)"],["Delta de texto","Muitos, em sequência","Acumular e exibir"],["Pedido de ferramenta","No meio, se houver","Executar e continuar o loop"],["Fim com metadados","Último","Registrar usage e stop_reason"],["Erro de conexão","A qualquer momento","Tratar o parcial; retentar se fizer sentido"]]',
                },
                {
                    type: "quote",
                    value: "As duas pegadinhas do stream: o usage só existe no fim, e a conexão pode cair no meio. Quem registra cedo perde o custo; quem não trata a queda entrega resposta pela metade sem avisar.",
                },
                {
                    type: "text",
                    value: "## Acumular é obrigatório\n\nMesmo exibindo ao vivo, acumule o texto completo em memória: é ele que vai para o histórico da conversa (a próxima chamada precisa da resposta inteira como mensagem de assistant), para o log e para qualquer pós-processamento. O delta é para a tela; o acumulado é para o sistema. Na próxima aula, esse fluxo atravessa a rede até o navegador do usuário.",
                },
            ],
            questions: [
                {
                    statement: "O que a API devolve no modo streaming?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma sequência de eventos, incluindo deltas de texto",
                            isCorrect: true,
                        },
                        {
                            text: "Um arquivo zip compactado com a resposta completa dentro",
                            isCorrect: false,
                        },
                        {
                            text: "Vários JSONs idênticos repetidos",
                            isCorrect: false,
                        },
                        {
                            text: "Um link para baixar a resposta depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando o usage fica disponível no stream?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Apenas no fim, com o evento de encerramento",
                            isCorrect: true,
                        },
                        {
                            text: "No primeiro evento, antes do texto",
                            isCorrect: false,
                        },
                        {
                            text: "A cada delta, atualizado token a token",
                            isCorrect: false,
                        },
                        {
                            text: "Nunca: streaming não informa usage",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A conexão caiu com metade da resposta gerada. O que a aplicação deve fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Tratar o parcial: retentar do zero ou exibir com aviso",
                            isCorrect: true,
                        },
                        {
                            text: "Fingir que a resposta terminou normalmente",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar a metade como resposta final no histórico",
                            isCorrect: false,
                        },
                        {
                            text: "Bloquear o usuário até o provedor voltar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que acumular o texto completo mesmo exibindo ao vivo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O histórico, o log e o pós-processamento precisam da resposta inteira",
                            isCorrect: true,
                        },
                        {
                            text: "Para reenviar o texto completo ao provedor como comprovante de uso",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os deltas somem da memória sozinhos",
                            isCorrect: false,
                        },
                        {
                            text: "Para duplicar a resposta e comparar as versões",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um dashboard de custos registra o usage no primeiro evento do stream e mostra zero em todas as chamadas. Qual é o erro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Registro cedo demais: o usage só chega no evento final",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo escolhido não reporta usage nunca",
                            isCorrect: false,
                        },
                        {
                            text: "O dashboard precisa de permissão de admin",
                            isCorrect: false,
                        },
                        {
                            text: "Streaming é sempre gratuito, então o zero é correto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Levando o stream ao navegador",
            blocks: [
                {
                    type: "text",
                    value: "# O caminho completo do token\n\nNo produto real há três pernas: provedor, seu backend e o navegador. O backend NUNCA expõe a chave ao cliente (regra do módulo 1), então ele fica no meio: recebe o stream do provedor e retransmite ao navegador. A tecnologia padrão dessa segunda perna é o SSE (Server-Sent Events): uma resposta HTTP que fica aberta e envia eventos de texto, exatamente o formato do problema (servidor empurra, cliente exibe; WebSocket é canal bidirecional, mais do que o chat precisa).\n\nNo backend Python, frameworks como FastAPI fazem isso com uma resposta de streaming que itera sobre os deltas do provedor e os repassa; no navegador, o EventSource (ou fetch com leitura de stream) consome e vai concatenando na tela.",
                },
                {
                    type: "code",
                    value: '# FastAPI: repassa os deltas do provedor ao navegador via SSE\nfrom fastapi.responses import StreamingResponse\n\n@app.post("/chat")\ndef chat(corpo: Corpo):\n    def gerar():\n        with cliente.chat.stream(model=MODELO, messages=corpo.messages) as s:\n            for trecho in s.text_deltas:\n                yield f"data: {json.dumps({\'delta\': trecho})}\\n\\n"\n        yield "data: [DONE]\\n\\n"\n    return StreamingResponse(gerar(), media_type="text/event-stream")\n\n# Navegador: acumula e pinta\n# const es = novo EventSource; a cada evento, texto += delta; render(texto)',
                },
                {
                    type: "table",
                    value: '[["Perna","Tecnologia","Cuidado principal"],["Provedor para backend","Stream do SDK","Tratar queda no meio; usage no fim"],["Backend para navegador","SSE (text/event-stream)","Proxies e buffering desligados na rota"],["Navegador","EventSource / fetch stream","Acumular e renderizar incremental"]]',
                },
                {
                    type: "quote",
                    value: "A chave fica no backend; o navegador recebe só os deltas. O SSE é o cano padrão: HTTP simples, servidor empurra, cliente pinta.",
                },
                {
                    type: "text",
                    value: '## As pegadinhas de infraestrutura\n\nDuas mordidas clássicas. BUFFERING: proxies e servidores (nginx à frente, por exemplo) adoram acumular a resposta antes de repassar, o que MATA o streaming silenciosamente (o backend streama, o usuário recebe tudo de uma vez no fim); a rota de SSE precisa de buffering desligado. E TIMEOUTS: conexões longas esbarram em limites de gateway configurados para requisições rápidas; a rota de chat merece limites próprios. Se o streaming "não funciona" em produção mas funciona local, o suspeito número um é a infraestrutura no meio do caminho.',
                },
            ],
            questions: [
                {
                    statement: "Por que o navegador não fala direto com o provedor?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A chave de API não pode ser exposta ao cliente",
                            isCorrect: true,
                        },
                        {
                            text: "Navegadores não sabem fazer requisições POST",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor bloqueia qualquer acesso de navegador",
                            isCorrect: false,
                        },
                        {
                            text: "O SSE não funciona fora do servidor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual tecnologia é o padrão para o backend empurrar deltas ao navegador?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "SSE (Server-Sent Events)",
                            isCorrect: true,
                        },
                        {
                            text: "FTP com arquivos parciais",
                            isCorrect: false,
                        },
                        {
                            text: "E-mails enviados a cada token",
                            isCorrect: false,
                        },
                        {
                            text: "Polling a cada dez segundos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que SSE em vez de WebSocket para o chat típico?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O fluxo é só servidor para cliente; SSE resolve com HTTP simples",
                            isCorrect: true,
                        },
                        {
                            text: "O WebSocket não transporta texto puro, só mensagens binárias",
                            isCorrect: false,
                        },
                        {
                            text: "O SSE é o único protocolo que atravessa firewalls",
                            isCorrect: false,
                        },
                        {
                            text: "WebSocket dobra o custo dos tokens",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O streaming funciona no ambiente local, mas em produção a resposta chega inteira de uma vez no fim. Qual é o suspeito número um?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Buffering de proxy ou servidor acumulando a resposta na rota",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo, que desativa o streaming em ambientes de produção",
                            isCorrect: false,
                        },
                        {
                            text: "O navegador do usuário sem suporte a texto",
                            isCorrect: false,
                        },
                        {
                            text: "A chave de API com permissão parcial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual configuração merece atenção especial na rota de chat com SSE?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Timeouts de gateway maiores e buffering desligado para conexões longas",
                            isCorrect: true,
                        },
                        {
                            text: "Compressão máxima para reduzir os deltas",
                            isCorrect: false,
                        },
                        {
                            text: "Cache agressivo da resposta no CDN",
                            isCorrect: false,
                        },
                        {
                            text: "O redirecionamento automático da rota de chat para HTTP simples sem TLS",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Parar no meio: interrupção e cancelamento",
            blocks: [
                {
                    type: "text",
                    value: '# O botão de parar não é enfeite\n\nTodo chat decente tem o botão "parar de gerar", e ele existe por três motivos: a resposta começou errada (o usuário percebe na segunda linha), ficou longa demais, ou o usuário mudou de ideia. Sem o botão, ele espera (frustrado) ou fecha a aba (pior). E há o cancelamento implícito: o usuário fechou a página no meio do stream; continuar gerando é pagar por tokens que ninguém verá.\n\nA mecânica: no navegador, abortar a conexão (AbortController no fetch, ou fechar o EventSource); no backend, DETECTAR a desconexão do cliente e cancelar a chamada ao provedor (fechar o stream). A cobrança para no ponto do cancelamento: tokens gerados até ali são pagos, o resto não.',
                },
                {
                    type: "code",
                    value: '# Navegador: botao Parar aborta a requisicao\ncontrolador = new AbortController()\nfetch("/chat", { method: "POST", body, signal: controlador.signal })\n# ao clicar em Parar:\ncontrolador.abort()\n\n# Backend (FastAPI): detectar a desconexao e fechar o stream do provedor\nasync def gerar():\n    with cliente.chat.stream(...) as s:\n        for trecho in s.text_deltas:\n            if await request.is_disconnected():\n                s.close()          # para de gerar (e de pagar)\n                return\n            yield formatar(trecho)',
                },
                {
                    type: "table",
                    value: '[["Cenário","Sem tratamento","Com tratamento"],["Usuário clica em Parar","Não existe; espera até o fim","Geração cessa; parcial fica na tela"],["Usuário fecha a aba","Backend gera até o fim, pagando","Desconexão detectada; stream fechado"],["Resposta parcial no histórico","Perdida ou inconsistente","Salva marcada como interrompida"],["Custo","Tokens invisíveis pagos","Cobrança para no cancelamento"]]',
                },
                {
                    type: "quote",
                    value: "Cancelamento é feature de custo tanto quanto de UX: cada stream que continua para uma aba fechada é dinheiro virando token que ninguém lê.",
                },
                {
                    type: "text",
                    value: '## O que fazer com o parcial\n\nResposta interrompida também é estado: decida o destino dela. O padrão dos bons chats: o parcial fica na tela, entra no histórico marcado como interrompido (o modelo saberá que aquela resposta não terminou, se a conversa continuar) e o usuário pode pedir "continue" ou reformular. Jogar o parcial fora é perder contexto; tratá-lo como completo engana o modelo. Com isso o módulo fecha o transporte; a última aula mede tudo isso na prática.',
                },
            ],
            questions: [
                {
                    statement: 'Por que o botão "parar de gerar" existe?',
                    difficulty: "facil",
                    options: [
                        {
                            text: "Resposta que começou errada, longa demais ou mudança de ideia",
                            isCorrect: true,
                        },
                        {
                            text: "Exigência das lojas de aplicativo",
                            isCorrect: false,
                        },
                        {
                            text: "Para reiniciar o servidor de streaming depois de cada resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Para limpar o histórico da conversa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O usuário fechou a aba no meio do stream. O que o backend deve fazer?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Detectar a desconexão e fechar o stream do provedor",
                            isCorrect: true,
                        },
                        {
                            text: "Continuar gerando até o fim normalmente",
                            isCorrect: false,
                        },
                        {
                            text: "Reenviar a resposta completa por e-mail ao usuário",
                            isCorrect: false,
                        },
                        {
                            text: "Bloquear a conta do usuário por abandono",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como fica a cobrança quando o stream é cancelado no meio?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Paga-se o gerado até o cancelamento; o resto não",
                            isCorrect: true,
                        },
                        {
                            text: "A chamada inteira sai de graça",
                            isCorrect: false,
                        },
                        {
                            text: "Paga-se o valor total como se tivesse terminado",
                            isCorrect: false,
                        },
                        {
                            text: "Paga-se em dobro pela interrupção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o destino correto de uma resposta parcial interrompida?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ficar na tela e entrar no histórico marcada como interrompida",
                            isCorrect: true,
                        },
                        {
                            text: "Ser apagada da tela e do histórico",
                            isCorrect: false,
                        },
                        {
                            text: "Entrar no histórico como resposta completa",
                            isCorrect: false,
                        },
                        {
                            text: "Ser reenviada ao provedor para uma conclusão automática depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um produto sem detecção de desconexão nota custo alto em horários de pico de abandono. Qual é a relação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Streams seguem gerando para abas fechadas, pagando tokens invisíveis",
                            isCorrect: true,
                        },
                        {
                            text: "O provedor cobra multa por conexões abandonadas",
                            isCorrect: false,
                        },
                        {
                            text: "Usuários que fecham a aba pagam menos, subindo a média dos demais",
                            isCorrect: false,
                        },
                        {
                            text: "Não há relação: custo e abandono são independentes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Medindo a experiência: latência de verdade",
            blocks: [
                {
                    type: "text",
                    value: "# O que não se mede, piora em silêncio\n\nFechando o módulo, a régua. As métricas que descrevem a experiência do chat: TTFT (a espera até a primeira palavra; o alvo em chat é ficar abaixo de um segundo), tokens por segundo (a fluidez da digitação), tempo total e taxa de interrupção (quantos streams o usuário aborta; alta taxa de Parar cedo denuncia respostas começando mal ou longas demais).\n\nDe onde vem a latência, na ordem típica: o TAMANHO DO PROMPT (prompt gigante atrasa o primeiro token, é processamento antes de gerar; o cache de prompt corta exatamente essa parte), o MODELO (porte maior, TTFT e digitação mais lentos; o raciocinador pensa antes de falar), a REDE e, no fim, a resposta longa esticando o total.",
                },
                {
                    type: "code",
                    value: 'import time\n\ninicio = time.monotonic()\nprimeiro = None\ntokens_saida = 0\n\nwith cliente.chat.stream(model=MODELO, messages=msgs) as s:\n    for trecho in s.text_deltas:\n        if primeiro is None:\n            primeiro = time.monotonic() - inicio      # TTFT\n        exibir(trecho)\n    final = s.final_message()\n\ntotal = time.monotonic() - inicio\ntps = final.usage.output_tokens / max(total - (primeiro or 0), 0.001)\nregistrar({"ttft": primeiro, "total": total, "tokens_por_seg": tps})',
                },
                {
                    type: "table",
                    value: '[["Fonte de latência","Afeta mais","Alavanca"],["Prompt grande (entrada)","TTFT","Enxugar contexto; cache de prompt"],["Porte do modelo","TTFT e tokens/s","Roteamento: menor onde dá"],["Modo raciocínio","TTFT (pensa antes)","Esforço de raciocínio só onde vale"],["Resposta longa","Tempo total","Pedir conciso; max_tokens"],["Rede e infraestrutura","Tudo","Região próxima; SSE sem buffering"]]',
                },
                {
                    type: "quote",
                    value: "Em chat, o alvo de TTFT é a casa de um segundo, e o vilão costumeiro é o prompt inchado: cada mil tokens de contexto atrasam a primeira palavra. Medir por percentil, otimizar o gargalo real.",
                },
                {
                    type: "text",
                    value: "## Fechando o módulo\n\nVocê domina o transporte: por que streamar, consumir eventos, atravessar backend e navegador, cancelar com dignidade e medir com honestidade (registre TTFT e total por chamada desde já; a trilha de produção agrega isso em percentis e dashboards). O módulo 6 volta ao conteúdo da conversa: memória, ou como o chat lembra do que importa sem estourar a janela nem a fatura.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o alvo típico de TTFT num chat?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Em torno de um segundo ou menos",
                            isCorrect: true,
                        },
                        {
                            text: "Trinta segundos",
                            isCorrect: false,
                        },
                        {
                            text: "Cinco minutos",
                            isCorrect: false,
                        },
                        {
                            text: "Não existe alvo: TTFT não importa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que uma taxa alta de cliques em Parar logo no início denuncia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Respostas começando mal ou longas demais",
                            isCorrect: true,
                        },
                        {
                            text: "Usuários satisfeitos com a velocidade",
                            isCorrect: false,
                        },
                        {
                            text: "Problema na cobrança dos tokens",
                            isCorrect: false,
                        },
                        {
                            text: "Excesso de memória no servidor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual fonte de latência afeta principalmente o TTFT?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O tamanho do prompt processado antes de gerar",
                            isCorrect: true,
                        },
                        {
                            text: "O comprimento da resposta gerada",
                            isCorrect: false,
                        },
                        {
                            text: "O número de usuários cadastrados",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de ferramentas declaradas sem uso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual mecanismo corta a latência do prompt grande e repetido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O cache de prompt, que evita reprocessar o prefixo estável",
                            isCorrect: true,
                        },
                        {
                            text: "O aumento do max_tokens da resposta em todas as chamadas",
                            isCorrect: false,
                        },
                        {
                            text: "A troca do transporte de SSE por WebSocket na rota",
                            isCorrect: false,
                        },
                        {
                            text: "O uso de temperatura zero",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O TTFT dobrou depois que o time incluiu um manual inteiro no system prompt. Qual é a explicação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A entrada cresceu: processar o prompt atrasa o primeiro token",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo pune manuais longos com lentidão proposital na fila",
                            isCorrect: false,
                        },
                        {
                            text: "O SSE limita a velocidade de prompts longos",
                            isCorrect: false,
                        },
                        {
                            text: "Coincidência: entrada não afeta latência",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Memória de conversa",
    aulas: [
        {
            titulo: "O estado é seu: estruturando o histórico",
            blocks: [
                {
                    type: "text",
                    value: '# Da teoria à estrutura\n\nOs Fundamentos martelaram: a API é sem estado, quem lembra é a aplicação. Este módulo constrói esse "lembrar" de verdade, começando pela estrutura. Uma conversa no seu sistema é uma entidade com identidade (id, usuário, criada em) e uma lista ordenada de mensagens (papel, conteúdo, timestamp, metadados como tokens e ferramenta usada). No banco: uma tabela de conversas e uma de mensagens, e cada chamada ao modelo monta a lista a partir dali.\n\nA função que monta a chamada é o coração do módulo: ela decide O QUE do histórico entra (tudo? as últimas? um resumo?) e em que ordem, respeitando o orçamento da janela. As próximas aulas são estratégias diferentes para essa função.',
                },
                {
                    type: "code",
                    value: '# Esquema minimo (a logica vale para qualquer banco)\n# conversas:  id | user_id | criada_em | resumo (nullable)\n# mensagens:  id | conversa_id | papel | conteudo | tokens | criada_em\n\ndef montar_chamada(conversa_id, mensagem_nova):\n    historico = carregar_mensagens(conversa_id)      # do banco, em ordem\n    contexto = estrategia_de_memoria(historico)      # o coracao: o que entra\n    return [\n        {"role": "system", "content": SYSTEM},\n        *contexto,\n        {"role": "user", "content": mensagem_nova},\n    ]\n# Apos a resposta: salvar a mensagem nova e a resposta no banco',
                },
                {
                    type: "table",
                    value: '[["Peça","Papel"],["Tabela de conversas","Identidade, dono e metadados da conversa"],["Tabela de mensagens","A lista ordenada com papel e conteúdo"],["Tokens por mensagem","Habilita decidir o que cabe no orçamento"],["Função de montagem","Decide o que do histórico entra na chamada"],["Persistência pós-resposta","Salva pergunta e resposta para o próximo turno"]]',
                },
                {
                    type: "quote",
                    value: "O histórico no banco é a memória bruta; o que vai na chamada é a memória de trabalho. A função que converte um no outro é onde mora a engenharia deste módulo.",
                },
                {
                    type: "text",
                    value: "## Por que registrar tokens por mensagem\n\nGuardar a contagem de tokens de cada mensagem (o usage devolve a cada chamada) transforma as estratégias de memória de chute em aritmética: dá para saber exatamente quanto do orçamento o histórico ocupa e onde cortar. É um campo a mais no insert e economiza recontagens; as aulas seguintes usam esse campo o tempo todo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a estrutura mínima de persistência de um chat?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Tabela de conversas e tabela de mensagens ordenadas",
                            isCorrect: true,
                        },
                        {
                            text: "Um arquivo de texto único com tudo concatenado",
                            isCorrect: false,
                        },
                        {
                            text: "Variável global na memória do servidor",
                            isCorrect: false,
                        },
                        {
                            text: "O próprio provedor guarda; nada a persistir",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a função de montagem da chamada decide?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O que do histórico entra no contexto e em que forma",
                            isCorrect: true,
                        },
                        {
                            text: "O preço que o provedor vai cobrar",
                            isCorrect: false,
                        },
                        {
                            text: "O idioma da resposta do modelo",
                            isCorrect: false,
                        },
                        {
                            text: "A cor do balão de mensagem exibido na tela do chat",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que guardar a contagem de tokens de cada mensagem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Transforma o corte do histórico em aritmética sobre o orçamento",
                            isCorrect: true,
                        },
                        {
                            text: "É uma exigência da LGPD para conversas gravadas",
                            isCorrect: false,
                        },
                        {
                            text: "Reduz o preço cobrado por token",
                            isCorrect: false,
                        },
                        {
                            text: "Permite reenviar mensagens antigas sem o conteúdo original",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre a memória bruta e a memória de trabalho?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Bruta é o histórico completo no banco; de trabalho é o que entra na chamada",
                            isCorrect: true,
                        },
                        {
                            text: "Bruta é a do modelo; de trabalho é a do usuário",
                            isCorrect: false,
                        },
                        {
                            text: "São sinônimos para o mesmo conjunto de dados",
                            isCorrect: false,
                        },
                        {
                            text: "A bruta fica no navegador do cliente; a de trabalho, no servidor do provedor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Depois da resposta do modelo, o que a aplicação deve persistir?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A mensagem do usuário e a resposta, com tokens e metadados",
                            isCorrect: true,
                        },
                        {
                            text: "Somente o system prompt que foi utilizado naquela chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Nada: o histórico se reconstrói do provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas o id da conversa, sem conteúdo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Janela deslizante bem feita",
            blocks: [
                {
                    type: "text",
                    value: '# A estratégia simples, sem as armadilhas\n\nA janela deslizante (enviar só as últimas mensagens) é a estratégia certa para a maioria dos chats: simples, previsível, barata. Mas a versão ingênua ("últimas 10 mensagens") tem armadilhas que a versão profissional evita.\n\nCorte por TOKENS, não por contagem de mensagens: dez mensagens podem ser 300 tokens ou 30 mil; o orçamento é em tokens (aqui entra o campo da aula anterior). Corte em FRONTEIRA DE PAR: nunca deixe um tool_use sem o resultado, nem uma resposta sem a pergunta (pares quebrados confundem o modelo e algumas APIs rejeitam). E reserve orçamento: system + histórico + mensagem nova + resposta esperada precisam caber juntos na janela.',
                },
                {
                    type: "code",
                    value: "def janela_deslizante(historico, orcamento_tokens=6000):\n    selecionadas = []\n    total = 0\n    for msg in reversed(historico):            # do fim para o comeco\n        if total + msg.tokens > orcamento_tokens:\n            break\n        selecionadas.append(msg)\n        total += msg.tokens\n    selecionadas.reverse()\n    return ajustar_fronteira(selecionadas)     # nao comecar no meio de um par\n# ajustar_fronteira: descarta a primeira mensagem se ela for resposta\n# sem pergunta, ou resultado de ferramenta sem o pedido",
                },
                {
                    type: "table",
                    value: '[["Armadilha da versão ingênua","Correção profissional"],["Cortar por número de mensagens","Cortar por tokens somados"],["Quebrar par pergunta-resposta","Cortar só em fronteira de par"],["Separar tool_use do resultado","Par de ferramenta é indivisível"],["Ignorar a resposta esperada","Reservar orçamento para a saída"],["Perder o começo em silêncio","Saber o que caiu (e avisar se preciso)"]]',
                },
                {
                    type: "quote",
                    value: "Janela deslizante profissional corta por tokens, respeita pares e reserva espaço para a resposta. A ingênua corta por contagem e quebra a conversa no meio de um par de ferramenta.",
                },
                {
                    type: "text",
                    value: "## O limite honesto da estratégia\n\nA janela deslizante esquece o que saiu, e para muitos produtos isso é ACEITÁVEL (suporte de loja raramente precisa da mensagem 40). O problema é o esquecimento do que IMPORTA: o nome informado no início, a decisão tomada há vinte mensagens. Quando isso começa a doer, as próximas duas aulas entram: resumo progressivo (preservar o essencial do que saiu) e fatos persistentes (guardar o que nunca deve sair).",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que cortar o histórico por tokens e não por número de mensagens?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O orçamento da janela é em tokens; mensagens variam muito de tamanho",
                            isCorrect: true,
                        },
                        {
                            text: "A API cobra por mensagem, não por token",
                            isCorrect: false,
                        },
                        {
                            text: "Números de mensagens são difíceis de contar com precisão no banco",
                            isCorrect: false,
                        },
                        {
                            text: "Tokens são mais fáceis de exibir na tela do painel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é cortar em fronteira de par?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Nunca separar pergunta de resposta nem tool_use do resultado",
                            isCorrect: true,
                        },
                        {
                            text: "Cortar sempre em número par de mensagens",
                            isCorrect: false,
                        },
                        {
                            text: "Manter apenas mensagens de dois usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Dividir cada mensagem longa em duas partes iguais no envio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Além do histórico, o que precisa caber no orçamento da chamada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "System, a mensagem nova e a resposta esperada",
                            isCorrect: true,
                        },
                        {
                            text: "O log completo do servidor da aplicação",
                            isCorrect: false,
                        },
                        {
                            text: "As conversas de outros usuários do produto",
                            isCorrect: false,
                        },
                        {
                            text: "O código-fonte das ferramentas declaradas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um histórico começa com um resultado de ferramenta cujo pedido foi cortado. Qual é o risco?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Par quebrado confunde o modelo e algumas APIs rejeitam a chamada",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhum: resultados soltos são simplesmente ignorados",
                            isCorrect: false,
                        },
                        {
                            text: "O custo dobra para mensagens órfãs",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo reexecuta a ferramenta sozinho para recuperar o par",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para qual tipo de produto a janela deslizante pura costuma bastar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Chats onde só o passado recente importa, como suporte simples",
                            isCorrect: true,
                        },
                        {
                            text: "Assistentes que prometem lembrar as preferências por meses",
                            isCorrect: false,
                        },
                        {
                            text: "Atendimentos com protocolo que não pode se perder",
                            isCorrect: false,
                        },
                        {
                            text: "Copilotos pessoais de longo prazo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Resumo progressivo na prática",
            blocks: [
                {
                    type: "text",
                    value: "# Comprimir o passado sem perder o enredo\n\nQuando a conversa cresce além da janela e o que saiu ainda IMPORTA, entra o resumo progressivo: as mensagens antigas são substituídas por um resumo gerado pelo próprio modelo, e a chamada passa a ser system + resumo + mensagens recentes íntegras. O usuário não vê nada disso; o assistente apenas continua lembrando.\n\nAs decisões de implementação: o GATILHO (quando o histórico passa de X tokens, resuma os mais antigos, mantendo as últimas N íntegras), o PROMPT do resumo (peça fatos e decisões, não prosa: nomes, números, pendências, o que foi combinado) e a PROGRESSIVIDADE (na próxima compressão, o resumo novo é gerado a partir do resumo anterior + mensagens que saem, então o custo é incremental).",
                },
                {
                    type: "code",
                    value: 'PROMPT_RESUMO = """Resuma a conversa preservando, em topicos:\n- fatos informados (nomes, numeros, datas, pedidos)\n- decisoes tomadas e o que foi combinado\n- pendencias em aberto\nSem prosa, sem opiniao. E um registro de trabalho."""\n\ndef comprimir_se_preciso(conversa, limite=8000, manter_recentes=10):\n    hist = carregar_mensagens(conversa.id)\n    if tokens_de(hist) < limite:\n        return\n    antigas, recentes = hist[:-manter_recentes], hist[-manter_recentes:]\n    base = (conversa.resumo or "") + render(antigas)\n    novo_resumo = chamar_modelo_barato(PROMPT_RESUMO, base)\n    salvar_resumo(conversa.id, novo_resumo)      # e marcar antigas como resumidas\n# Na montagem: system + resumo (como contexto) + recentes integras',
                },
                {
                    type: "table",
                    value: '[["Decisão","Recomendação","Por quê"],["Gatilho","Por tokens do histórico (ex.: 8k)","Determinístico e barato de checar"],["O que resumir","Antigas, mantendo N recentes íntegras","O presente precisa de fidelidade"],["Prompt do resumo","Fatos, decisões, pendências em tópicos","Prosa bonita perde dado"],["Modelo do resumo","Pequeno e barato","Tarefa simples; roda com frequência"],["Onde entra na chamada","Logo após o system, como contexto","Passado comprimido antes do presente"]]',
                },
                {
                    type: "quote",
                    value: "O resumo de conversa é um registro de trabalho, não uma redação: fatos, números, decisões e pendências. O que o resumo perder, o assistente esquece para sempre.",
                },
                {
                    type: "text",
                    value: "## O custo e o risco\n\nO custo é uma chamada extra de vez em quando (barata, com modelo pequeno). O risco é a compressão com perda: se o resumo omitir o número do pedido, ele sumiu. Mitigações: prompt de resumo explícito sobre o que preservar, e para dados CRÍTICOS (protocolo, identificadores), a próxima aula tem resposta melhor: fatos persistentes, que nunca dependem de resumo.",
                },
            ],
            questions: [
                {
                    statement: "O que substitui as mensagens antigas no resumo progressivo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um resumo gerado pelo modelo, mantendo as recentes íntegras",
                            isCorrect: true,
                        },
                        {
                            text: "Um link para o histórico completo no banco",
                            isCorrect: false,
                        },
                        {
                            text: "As mesmas mensagens comprimidas em zip",
                            isCorrect: false,
                        },
                        {
                            text: "Nada: as mensagens antigas apenas somem sem nenhum substituto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o prompt de resumo deve pedir?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Fatos, decisões e pendências em tópicos, sem prosa",
                            isCorrect: true,
                        },
                        {
                            text: "Uma redação elegante sobre a conversa inteira",
                            isCorrect: false,
                        },
                        {
                            text: "A opinião do modelo sobre o cliente",
                            isCorrect: false,
                        },
                        {
                            text: "A tradução da conversa para o inglês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a compressão é progressiva (resumo novo a partir do anterior)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O custo fica incremental: só o que sai é resumido a cada vez",
                            isCorrect: true,
                        },
                        {
                            text: "A API só aceita um resumo por conversa",
                            isCorrect: false,
                        },
                        {
                            text: "Resumos antigos expiram e precisam renovar",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo esquece os resumos que não se repetem na chamada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual modelo usar para gerar os resumos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um pequeno e barato: a tarefa é simples e roda com frequência",
                            isCorrect: true,
                        },
                        {
                            text: "O maior modelo disponível no catálogo, para não perder nada",
                            isCorrect: false,
                        },
                        {
                            text: "Um modelo de embeddings",
                            isCorrect: false,
                        },
                        {
                            text: "O mesmo modelo da conversa, mas com a temperatura no máximo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O número do protocolo sumiu depois de uma compressão. Qual é a lição de arquitetura?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Dados críticos não dependem de resumo: viram fatos persistentes",
                            isCorrect: true,
                        },
                        {
                            text: "Resumos devem ser gerados pelo modelo mais caro",
                            isCorrect: false,
                        },
                        {
                            text: "A conversa deveria ter sido apagada antes",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário deve repetir o número do protocolo a cada turno novo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fatos persistentes: a memória que atravessa sessões",
            blocks: [
                {
                    type: "text",
                    value: '# Lembrar de você amanhã\n\nJanela e resumo vivem DENTRO de uma conversa. A memória que impressiona é a que atravessa: o usuário volta na semana seguinte e o assistente lembra do nome, do plano contratado, da preferência por respostas curtas. Isso é engenharia sua, e o padrão tem três partes: EXTRAIR (identificar fatos memoráveis nas conversas), ARMAZENAR (numa tabela de fatos por usuário, com origem e data) e INJETAR (selecionar os fatos relevantes e colocá-los no contexto de cada chamada nova).\n\nA extração pode ser um passo assíncrono barato: ao fim da conversa (ou de tempos em tempos), um modelo pequeno com structured outputs lê o trecho novo e devolve fatos no schema (tipo, chave, valor). Injeção: os fatos do usuário entram como um bloco curto após o system ("Sobre este usuário: nome Ana; plano Pro; prefere respostas diretas").',
                },
                {
                    type: "code",
                    value: 'class Fato(BaseModel):\n    tipo: Literal["perfil", "preferencia", "contexto"]\n    chave: str          # ex: "nome", "plano", "estilo_resposta"\n    valor: str\n\n# Extracao assincrona pos-conversa (modelo pequeno + structured outputs)\nfatos = extrair_fatos(trecho_novo)          # lista de Fato\nfor f in fatos:\n    upsert_fato(user_id, f)                 # chave repetida: atualiza o valor\n\n# Injecao na proxima conversa\nbloco = render_fatos(carregar_fatos(user_id))   # 5 a 15 linhas, nao um dossie\nmensagens = [system, contexto_de_fatos(bloco), *historico, nova]',
                },
                {
                    type: "table",
                    value: '[["Parte","Como","Cuidado"],["Extrair","Modelo pequeno + schema de Fato","Só o memorável; não gravar conversa inteira"],["Armazenar","Tabela por usuário, chave-valor com data","Upsert por chave; origem rastreável"],["Injetar","Bloco curto após o system","Selecionar relevantes; não virar dossiê"],["Atualizar","Fato novo substitui o antigo da chave","Preferências mudam; data importa"],["Apagar","Usuário pode ver e excluir","LGPD: memória é dado pessoal"]]',
                },
                {
                    type: "quote",
                    value: "Memória entre sessões é pipeline seu: extrair com schema, armazenar com chave e data, injetar com parcimônia. E é dado pessoal: o usuário precisa poder ver e apagar.",
                },
                {
                    type: "text",
                    value: '## Parcimônia e privacidade\n\nDois limites seguram a qualidade. PARCIMÔNIA: injetar cinquenta fatos vira ruído (e tokens); selecione por relevância (fatos de perfil sempre; os demais, quando o assunto encosta, e embeddings ajudam a escolher). PRIVACIDADE: memória persistente é dado pessoal sob LGPD; colete o necessário, mostre ao usuário o que está guardado e ofereça o apagar. "O assistente lembra" encanta; "o assistente lembra e eu não consigo apagar" assusta, com razão.',
                },
            ],
            questions: [
                {
                    statement: "Quais são as três partes do padrão de memória entre sessões?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Extrair, armazenar e injetar",
                            isCorrect: true,
                        },
                        {
                            text: "Comprimir, criptografar e enviar",
                            isCorrect: false,
                        },
                        {
                            text: "Copiar, colar e conferir",
                            isCorrect: false,
                        },
                        {
                            text: "Treinar, ajustar e publicar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como a extração de fatos costuma ser implementada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Modelo pequeno com structured outputs num passo assíncrono",
                            isCorrect: true,
                        },
                        {
                            text: "Fine-tuning do modelo base com as conversas do usuário",
                            isCorrect: false,
                        },
                        {
                            text: "Um formulário que o usuário preenche à mão",
                            isCorrect: false,
                        },
                        {
                            text: "Gravação da conversa inteira como um fato único",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que injetar fatos com parcimônia?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fatos demais viram ruído e tokens; relevância seleciona",
                            isCorrect: true,
                        },
                        {
                            text: "A API limita fatos a três por chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Fatos repetidos apagam o system prompt inteiro da chamada",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo cobra por fato injetado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O usuário mudou de plano e o assistente insiste no antigo. Qual parte do pipeline falhou?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A atualização: o fato novo deveria substituir o da mesma chave",
                            isCorrect: true,
                        },
                        {
                            text: "O streaming da resposta ao navegador",
                            isCorrect: false,
                        },
                        {
                            text: "O backoff exponencial das retentativas de chamadas feitas à API",
                            isCorrect: false,
                        },
                        {
                            text: "A temperatura da geração dos fatos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Por que a memória persistente exige tela de "ver e apagar" para o usuário?',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "É dado pessoal sob a LGPD; transparência e exclusão são obrigação",
                            isCorrect: true,
                        },
                        {
                            text: "Porque fatos antigos corrompem o banco de dados",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o provedor exige essa tela de memória nos termos de uso",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas cortesia: não há exigência real",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A arquitetura completa de memória",
            blocks: [
                {
                    type: "text",
                    value: "# As três camadas juntas\n\nHora de montar o quadro. Um chat maduro combina as três camadas em toda chamada: FATOS PERSISTENTES do usuário (curtos, sempre presentes), RESUMO da parte antiga da conversa atual (quando ela cresceu) e as MENSAGENS RECENTES íntegras (janela deslizante por tokens). Nessa ordem, depois do system: do mais estável ao mais imediato, o que de quebra favorece o cache de prompt (prefixo estável primeiro).\n\nA escolha de quanto investir segue o produto: FAQ simples vive só de janela; suporte com protocolo soma o resumo; copiloto pessoal de longo prazo usa as três. Complexidade de memória é custo permanente (código, chamadas de resumo, privacidade); adicione camadas quando a dor aparecer, não antes.",
                },
                {
                    type: "code",
                    value: 'def montar_contexto(user_id, conversa):\n    partes = [{"role": "system", "content": SYSTEM}]\n    fatos = carregar_fatos(user_id)\n    if fatos:\n        partes.append(contexto("Sobre este usuario:\\n" + render_fatos(fatos)))\n    if conversa.resumo:\n        partes.append(contexto("Resumo da conversa ate aqui:\\n" + conversa.resumo))\n    partes += janela_deslizante(mensagens_nao_resumidas(conversa), orcamento=6000)\n    return partes\n# Ordem: system > fatos > resumo > recentes. Estavel primeiro: cache agradece',
                },
                {
                    type: "table",
                    value: '[["Camada","Vive onde","Escopo","Quando usar"],["Fatos persistentes","Tabela por usuário","Entre sessões","Produto que promete lembrar"],["Resumo progressivo","Campo da conversa","A conversa atual, parte antiga","Conversas que crescem"],["Janela deslizante","Montagem da chamada","O presente imediato","Sempre; é a base"]]',
                },
                {
                    type: "quote",
                    value: "System, fatos, resumo, recentes: do estável ao imediato. Cada camada resolve um esquecimento diferente, e nenhuma dispensa a outra.",
                },
                {
                    type: "text",
                    value: "## Fechando o módulo\n\nMemória deixou de ser mistério: é estrutura no banco, uma função de montagem e três camadas com papéis claros. Você sabe implementar cada uma, quanto custa e quando vale. Resta juntar TUDO que a trilha construiu (chamadas, prompts, system, ferramentas, streaming, memória) num produto de verdade: o módulo 7 é o projeto do chatbot completo, de ponta a ponta.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a ordem das camadas na montagem da chamada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "System, fatos persistentes, resumo, mensagens recentes",
                            isCorrect: true,
                        },
                        {
                            text: "Mensagens recentes, depois resumo, fatos e system",
                            isCorrect: false,
                        },
                        {
                            text: "Resumo, system, recentes, fatos",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem é sorteada de novo a cada chamada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual camada é a base presente em qualquer chat?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A janela deslizante das mensagens recentes",
                            isCorrect: true,
                        },
                        {
                            text: "Os fatos persistentes entre sessões",
                            isCorrect: false,
                        },
                        {
                            text: "O resumo progressivo da conversa",
                            isCorrect: false,
                        },
                        {
                            text: "O fine-tuning do modelo com o histórico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Por que a ordem "do estável ao imediato" também economiza dinheiro?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Prefixo estável favorece o cache de prompt nas chamadas seguintes",
                            isCorrect: true,
                        },
                        {
                            text: "As mensagens no fim da lista custam menos por token processado",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo lê mais rápido o que vem primeiro",
                            isCorrect: false,
                        },
                        {
                            text: "A API dá desconto para chamadas organizadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Um FAQ simples de loja precisa de quais camadas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Em geral, só a janela deslizante",
                            isCorrect: true,
                        },
                        {
                            text: "As três camadas desde o primeiro dia",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas fatos persistentes, sem janela",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma: FAQ dispensa histórico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o critério para adicionar uma camada de memória ao produto?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A dor real do esquecimento aparecer; complexidade é custo permanente",
                            isCorrect: true,
                        },
                        {
                            text: "Adicionar todas as camadas logo no início para nunca mais refatorar",
                            isCorrect: false,
                        },
                        {
                            text: "Seguir o que o concorrente anunciou",
                            isCorrect: false,
                        },
                        {
                            text: "Esperar o provedor lançar uma memória nativa completa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: um chatbot completo",
    aulas: [
        {
            titulo: "O desenho do projeto",
            blocks: [
                {
                    type: "text",
                    value: "# Juntando as peças num produto\n\nO projeto que fecha a trilha: um assistente de suporte para uma loja fictícia (a Livraria Paginacem), servido por uma API própria em FastAPI, com tudo que os módulos construíram. Requisitos: responder dúvidas de catálogo e pedidos (com ferramentas consultando dados de verdade), manter conversas com memória, streamar as respostas, recusar bem o que está fora do escopo e nunca estourar um orçamento por usuário.\n\nA arquitetura em camadas, cada uma já conhecida: rota FastAPI (recebe a mensagem, autentica o usuário), montagem de contexto (módulo 6), o loop de ferramentas (módulo 4), o stream de volta (módulo 5) e a persistência (mensagens, tokens, custos). O provedor de LLM fica atrás de um módulo próprio, para o dia em que você quiser trocar.",
                },
                {
                    type: "table",
                    value: '[["Camada","Responsabilidade","Módulo de origem"],["Rota /chat (FastAPI)","Autenticação, validação, SSE","Módulos 1 e 5"],["Montagem de contexto","System + fatos + resumo + janela","Módulos 3 e 6"],["Loop de ferramentas","tool_use, execução, limite de voltas","Módulo 4"],["Cliente do provedor","Chamadas, retentativas, streaming","Módulos 1 e 5"],["Persistência","Conversas, mensagens, tokens, custo","Módulo 6"]]',
                },
                {
                    type: "quote",
                    value: "Nenhuma peça deste projeto é nova: o projeto É a integração. Se algum módulo ficou nebuloso, ele vai aparecer aqui com nome e sobrenome.",
                },
                {
                    type: "text",
                    value: "## Como percorrer o projeto\n\nAs próximas aulas montam o projeto em camadas: o esqueleto da API e o system prompt, as ferramentas com dados de verdade, o controle de custos e os limites, e o fecho com o roteiro de testes. O código das aulas é o mapa: implemente no seu ritmo, com o SEU provedor, e use o conjunto de casos (módulo 2) como rede de segurança a cada etapa. Errar aqui é barato e é exatamente onde o aprendizado assenta.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o papel do projeto no fim da trilha?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Integrar todas as peças dos módulos num produto de verdade",
                            isCorrect: true,
                        },
                        {
                            text: "Apresentar conteúdo totalmente novo que não coube antes",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir a necessidade de praticar",
                            isCorrect: false,
                        },
                        {
                            text: "Avaliar a memória decorada dos módulos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o provedor de LLM fica atrás de um módulo próprio no projeto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Para poder trocar de provedor sem reescrever a aplicação",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o SDK não funciona dentro de rotas",
                            isCorrect: false,
                        },
                        {
                            text: "Para esconder a chave de API do próprio backend da aplicação",
                            isCorrect: false,
                        },
                        {
                            text: "Por exigência do FastAPI",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual camada cuida do tool_use e do limite de voltas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O loop de ferramentas",
                            isCorrect: true,
                        },
                        {
                            text: "A rota de SSE",
                            isCorrect: false,
                        },
                        {
                            text: "A montagem de contexto",
                            isCorrect: false,
                        },
                        {
                            text: "A persistência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a montagem de contexto reúne a cada chamada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "System, fatos do usuário, resumo e a janela de recentes",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas a última mensagem digitada pelo usuário",
                            isCorrect: false,
                        },
                        {
                            text: "O catálogo completo da loja em texto puro na chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Os logs do servidor da semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a rede de segurança recomendada enquanto se constrói o projeto?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O conjunto de casos de teste rodando a cada etapa",
                            isCorrect: true,
                        },
                        {
                            text: "Testar direto em produção com usuários reais",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o max_tokens até os erros sumirem",
                            isCorrect: false,
                        },
                        {
                            text: "Confiar no comportamento padrão do modelo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O esqueleto: rota, system e conversa",
            blocks: [
                {
                    type: "text",
                    value: "# A primeira fatia vertical\n\nComece pela fatia mais fina que funciona de ponta a ponta: uma rota /chat que recebe a mensagem, carrega (ou cria) a conversa, monta o contexto e devolve a resposta por SSE. Sem ferramentas ainda, sem resumo: só o ciclo completo rodando, com persistência e streaming. Fatia vertical primeiro, camadas de sofisticação depois; assim cada acréscimo tem onde se apoiar e um jeito de ser testado.\n\nO system prompt do projeto aplica o módulo 3 inteiro: papel (assistente da Paginacem), tarefa (catálogo, pedidos, políticas de troca), regras com saída (sem dado de pagamento: suporte humano; livro inexistente: oferecer busca), tom (livreiro atencioso, sem melação) e formato (curto, listas para opções).",
                },
                {
                    type: "code",
                    value: '@app.post("/chat")\nasync def chat(corpo: MensagemEntrada, user=Depends(autenticar)):\n    conversa = obter_ou_criar_conversa(user.id, corpo.conversa_id)\n    salvar_mensagem(conversa.id, "user", corpo.texto)\n\n    contexto = montar_contexto(user.id, conversa)   # modulo 6, ja com o system\n\n    async def gerar():\n        acumulado = []\n        with cliente.chat.stream(model=MODELO, messages=contexto) as s:\n            for trecho in s.text_deltas:\n                acumulado.append(trecho)\n                yield sse({"delta": trecho})\n            final = s.final_message()\n        salvar_mensagem(conversa.id, "assistant", "".join(acumulado),\n                        tokens=final.usage)\n        yield sse({"fim": True, "conversa_id": conversa.id})\n    return StreamingResponse(gerar(), media_type="text/event-stream")',
                },
                {
                    type: "table",
                    value: '[["Passo da fatia","O que valida"],["Rota autenticada recebe mensagem","Contrato da API e identidade"],["Conversa criada ou carregada","Persistência funcionando"],["Contexto montado com system","Personalidade e memória básica"],["Resposta streamada por SSE","Transporte de ponta a ponta"],["Mensagens e usage salvos","Histórico e custo registrados"]]',
                },
                {
                    type: "quote",
                    value: "Fatia vertical primeiro: o ciclo inteiro fino e funcionando vale mais que três camadas grossas que nunca se encontraram. Sofisticação se adiciona sobre o que roda.",
                },
                {
                    type: "text",
                    value: "## Teste da fatia\n\nAntes de avançar, o checklist: duas mensagens seguidas mantêm o contexto (o modelo lembra a primeira)? O SSE pinta incremental no navegador (e não tudo no fim)? As mensagens estão no banco com tokens? O custo da conversa é consultável? Com o esqueleto sólido, a próxima aula dá músculos: as ferramentas.",
                },
            ],
            questions: [
                {
                    statement: "O que é a fatia vertical do projeto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O ciclo completo fino: rota, contexto, stream e persistência",
                            isCorrect: true,
                        },
                        {
                            text: "Todas as ferramentas prontas antes da primeira rota existir",
                            isCorrect: false,
                        },
                        {
                            text: "Só o frontend, com o backend simulado para sempre",
                            isCorrect: false,
                        },
                        {
                            text: "Um diagrama detalhado sem código",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a rota /chat faz ao receber uma mensagem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Autentica, carrega ou cria a conversa, salva e monta o contexto",
                            isCorrect: true,
                        },
                        {
                            text: "Envia a mensagem direto ao provedor sem contexto nenhum montado",
                            isCorrect: false,
                        },
                        {
                            text: "Grava a mensagem e responde um texto fixo",
                            isCorrect: false,
                        },
                        {
                            text: "Redireciona o usuário ao site do provedor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que salvar o usage junto com a mensagem do assistente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Registra custo e tokens por conversa desde o início",
                            isCorrect: true,
                        },
                        {
                            text: "O provedor exige o reenvio do usage depois",
                            isCorrect: false,
                        },
                        {
                            text: "Sem o usage a mensagem não renderiza no frontend",
                            isCorrect: false,
                        },
                        {
                            text: "O SSE só fecha com o usage no payload",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual verificação confirma que a memória básica funciona?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A segunda mensagem obtém resposta que considera a primeira",
                            isCorrect: true,
                        },
                        {
                            text: "O TTFT ficou abaixo de um segundo",
                            isCorrect: false,
                        },
                        {
                            text: "O system prompt aparece na resposta final",
                            isCorrect: false,
                        },
                        {
                            text: "O banco de dados tem uma tabela de conversas ainda vazia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que construir a fatia vertical antes das ferramentas e do resumo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cada acréscimo terá base rodando onde se apoiar e ser testado",
                            isCorrect: true,
                        },
                        {
                            text: "Ferramentas não funcionam em rotas novas",
                            isCorrect: false,
                        },
                        {
                            text: "O resumo progressivo exige um mês de conversas coletadas",
                            isCorrect: false,
                        },
                        {
                            text: "É a única ordem que o framework permite",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Músculos: as ferramentas do bot",
            blocks: [
                {
                    type: "text",
                    value: "# O assistente que consulta de verdade\n\nSem ferramentas, o bot da Paginacem só sabe o que está no system. Com elas, responde com DADOS: consultar_livro (busca no catálogo por título ou autor), status_pedido (pedido do usuário logado pelo número) e politicas_troca (a página de política relevante). Três ferramentas, três intenções, fronteiras nítidas, exatamente como o módulo 4 mandou.\n\nRepare em duas decisões de segurança que já entram naturais: o status_pedido NÃO recebe o id do usuário como parâmetro do modelo (o backend injeta o usuário AUTENTICADO da sessão; o modelo jamais decide de quem é o pedido), e todas as ferramentas são de LEITURA (nada de cancelar ou alterar sem confirmação, tema da trilha de Agentes).",
                },
                {
                    type: "code",
                    value: 'def executar(chamada, user):                      # user vem da SESSAO, nao do modelo\n    if chamada.name == "consultar_livro":\n        return buscar_catalogo(chamada.input["termo"])   # leitura\n    if chamada.name == "status_pedido":\n        pedido = achar_pedido(user.id, chamada.input["numero"])\n        if not pedido:\n            return "pedido nao encontrado PARA ESTE USUARIO; confirme o numero"\n        return render_status(pedido)\n    if chamada.name == "politicas_troca":\n        return politica(chamada.input["assunto"])\n    return "ferramenta desconhecida"\n# O loop do modulo 4 embrulha isso com limite de voltas e erros orientados',
                },
                {
                    type: "table",
                    value: '[["Ferramenta","Intenção","Decisão de segurança"],["consultar_livro","Catálogo por título ou autor","Somente leitura pública"],["status_pedido","Entrega do pedido do cliente","Usuário vem da sessão, não do modelo"],["politicas_troca","Regras de troca e devolução","Conteúdo curado, não inventado"]]',
                },
                {
                    type: "quote",
                    value: "O modelo nunca escolhe DE QUEM é o dado: identidade vem da sessão autenticada. Parâmetro que o modelo preenche é parâmetro que o modelo pode errar (ou ser induzido a errar).",
                },
                {
                    type: "text",
                    value: '## Integração com o streaming\n\nNo fluxo com SSE, o pedido de ferramenta chega como evento no meio do stream: a UI pode mostrar um discreto "consultando seu pedido..." enquanto o backend executa e rechama o modelo. O usuário vê o assistente "trabalhando", o que é honesto e melhora a espera. Teste com os casos: pergunta de catálogo aciona a ferramenta certa? Pedido sem número faz o bot PERGUNTAR o número (e não alucinar um)? Pedido de outro usuário volta "não encontrado"?',
                },
            ],
            questions: [
                {
                    statement:
                        "Por que o status_pedido não recebe o id do usuário como parâmetro do modelo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Identidade vem da sessão autenticada; o modelo não decide de quem é o dado",
                            isCorrect: true,
                        },
                        {
                            text: "Ids numéricos de usuário não cabem no schema de parâmetros das ferramentas",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo não consegue ler identificadores",
                            isCorrect: false,
                        },
                        {
                            text: "Seria mais lento processar o parâmetro extra",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que as ferramentas do projeto são todas de leitura?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ações com consequência exigem confirmação, tema da trilha de Agentes",
                            isCorrect: true,
                        },
                        {
                            text: "Operações de escrita não funcionam com o function calling da API",
                            isCorrect: false,
                        },
                        {
                            text: "O banco da loja é somente leitura",
                            isCorrect: false,
                        },
                        {
                            text: "Operações de leitura não consomem tokens de resposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O cliente pergunta do pedido sem citar número. Qual é o comportamento correto do bot?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Perguntar o número antes de acionar a ferramenta",
                            isCorrect: true,
                        },
                        {
                            text: "Chutar um número plausível e consultar assim",
                            isCorrect: false,
                        },
                        {
                            text: "Listar os pedidos de todos os clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Encerrar a conversa por falta de dados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o pedido de ferramenta convive com o SSE?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Chega como evento no stream; a UI pode indicar a consulta em andamento",
                            isCorrect: true,
                        },
                        {
                            text: "O SSE é encerrado e reaberto do zero",
                            isCorrect: false,
                        },
                        {
                            text: "As ferramentas acionadas desligam o streaming da conversa na hora",
                            isCorrect: false,
                        },
                        {
                            text: "O navegador do cliente executa a ferramenta localmente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um teste importante: consultar um pedido que existe, mas é de OUTRO usuário. Qual resposta o sistema deve dar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Não encontrado para este usuário; a busca é sempre escopada à sessão",
                            isCorrect: true,
                        },
                        {
                            text: "O status completo do pedido, já que o número informado está certo",
                            isCorrect: false,
                        },
                        {
                            text: "O nome completo do outro cliente para conferência",
                            isCorrect: false,
                        },
                        {
                            text: "Um erro 500 derrubando a conversa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Freios: orçamento, limites e abuso",
            blocks: [
                {
                    type: "text",
                    value: "# O produto que não quebra o dono\n\nUm chatbot público sem freios é um cartão de crédito aberto na internet. A camada de proteção do projeto tem três anéis. ORÇAMENTO por usuário: um teto diário de tokens (ou de custo) registrado a cada chamada (você já salva o usage; agora ele soma contra o teto; estourou, resposta educada de limite e reset no dia seguinte). RATE LIMIT próprio: mensagens por minuto por usuário (o rate limit do provedor protege o provedor; o SEU protege o seu bolso e os outros usuários). E TETO POR RESPOSTA: max_tokens dimensionado, histórico com janela, ferramentas com limite de voltas, tudo já visto, aqui somado.\n\nAbuso tem cara conhecida: scripts martelando a rota, prompts gigantes colados, tentativa de usar seu bot como proxy grátis de LLM para outra tarefa. Os anéis acima seguram o custo; registrar padrões estranhos (mensagens enormes, frequência de máquina) prepara o terreno para a trilha de produção.",
                },
                {
                    type: "code",
                    value: 'LIMITE_DIARIO_TOKENS = 50_000        # por usuario\nLIMITE_MSG_MINUTO = 6\n\nasync def chat(corpo, user=Depends(autenticar)):\n    if uso_hoje(user.id) > LIMITE_DIARIO_TOKENS:\n        return resposta_fixa("Voce atingiu o limite diario do assistente. "\n                             "Amanha ele volta; urgencias: suporte humano.")\n    if not rate_limit_ok(user.id, LIMITE_MSG_MINUTO):\n        return resposta_fixa("Muitas mensagens em sequencia. Respira um instante :)")\n    ...  # fluxo normal; ao final, somar usage em uso_hoje(user.id)',
                },
                {
                    type: "table",
                    value: '[["Anel de proteção","Contra o quê","Implementação"],["Orçamento diário por usuário","Custo descontrolado por conta","Somar usage contra teto; reset diário"],["Rate limit próprio","Marteladas e scripts","Contador por usuário por minuto"],["Teto por resposta","Respostas e loops infinitos","max_tokens, janela, limite de voltas"],["Registro de anomalias","Abuso padrão proxy","Log de tamanho e frequência fora da curva"]]',
                },
                {
                    type: "quote",
                    value: "O rate limit do provedor protege o provedor. O SEU rate limit e o SEU orçamento por usuário protegem você. Chatbot público sem freio é fatura surpresa com hora marcada.",
                },
                {
                    type: "text",
                    value: "## Mensagens de limite também são UX\n\nRepare que as respostas de limite do exemplo são educadas e oferecem saída (amanhã volta; urgência vai ao humano). Limite mal comunicado vira ticket de suporte e post irritado; limite bem comunicado é percebido como justo. O tom dessas mensagens pertence ao system... não: elas são RESPOSTA FIXA do código, sem gastar chamada nenhuma, e é assim que devem ser: o freio não paga token para funcionar.",
                },
            ],
            questions: [
                {
                    statement: "Por que ter rate limit próprio se o provedor já tem o dele?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O do provedor protege o provedor; o seu protege seu custo e usuários",
                            isCorrect: true,
                        },
                        {
                            text: "O do provedor só funciona em inglês",
                            isCorrect: false,
                        },
                        {
                            text: "É uma exigência legal para chats que operam no Brasil",
                            isCorrect: false,
                        },
                        {
                            text: "Rate limits duplicados dobram a velocidade das respostas do bot",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o orçamento diário por usuário é implementado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Somando o usage de cada chamada contra um teto, com reset diário",
                            isCorrect: true,
                        },
                        {
                            text: "Confiando apenas no limite global da chave de API do provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Cobrando o usuário por Pix a cada mensagem",
                            isCorrect: false,
                        },
                        {
                            text: "Limitando o tamanho do system prompt",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a resposta de limite deve ser fixa (do código), sem chamar o modelo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O freio não deve gastar token para funcionar",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo se recusa a comunicar limites",
                            isCorrect: false,
                        },
                        {
                            text: "Respostas fixas são obrigatórias por lei",
                            isCorrect: false,
                        },
                        {
                            text: "O SSE não transporta respostas geradas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual padrão sugere que o bot está sendo usado como proxy grátis de LLM?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mensagens enormes fora do domínio, em frequência de máquina",
                            isCorrect: true,
                        },
                        {
                            text: "Perguntas repetidas dos clientes sobre o catálogo da loja",
                            isCorrect: false,
                        },
                        {
                            text: "Conversas curtas com respostas curtas",
                            isCorrect: false,
                        },
                        {
                            text: "Uso concentrado no horário comercial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que uma boa mensagem de limite contém?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O limite com clareza e uma saída (quando volta, canal de urgência)",
                            isCorrect: true,
                        },
                        {
                            text: "Um pedido de desculpas bem longo e sem nenhuma informação útil",
                            isCorrect: false,
                        },
                        {
                            text: "O stack trace completo do contador de rate limit",
                            isCorrect: false,
                        },
                        {
                            text: "A sugestão de criar várias contas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fechando a trilha: teste, checklist e o que vem",
            blocks: [
                {
                    type: "text",
                    value: '# O roteiro de aceitação\n\nO projeto termina quando passa no roteiro, não quando "parece pronto". O checklist da Paginacem, que é o resumo prático da trilha inteira: memória (duas sessões, o contexto se mantém; a conversa longa dispara resumo sem perder o essencial), ferramentas (catálogo, pedido próprio, pedido alheio negado, número ausente perguntado), formato (respostas no tom, recusas com saída), transporte (SSE incremental, botão parar funciona, desconexão cancela a geração), custo (usage salvo por mensagem, orçamento bloqueia no teto, rate limit segura martelada) e resiliência (429 do provedor vira retentativa, erro no meio do stream é tratado).\n\nRode o conjunto de casos do módulo 2 uma última vez por inteiro. O que falhar aponta o módulo a revisitar.',
                },
                {
                    type: "table",
                    value: '[["Área","Teste de aceitação"],["Memória","Sessões mantêm contexto; resumo dispara e preserva fatos"],["Ferramentas","Certa por intenção; escopo por sessão; sem argumento alucinado"],["Persona e recusas","Tom estável sob pressão; fora de escopo com saída"],["Transporte","SSE incremental; cancelamento para geração e cobrança"],["Custo","Usage por mensagem; teto diário e rate limit ativos"],["Resiliência","Backoff nos transitórios; parcial tratado na queda"]]',
                },
                {
                    type: "quote",
                    value: "Pronto é quando o roteiro passa. Cada item do checklist é um módulo da trilha comprimido em uma linha; o que falhar diz exatamente onde voltar.",
                },
                {
                    type: "text",
                    value: "## O que você leva e o que vem\n\nVocê construiu um produto com LLM de ponta a ponta: fala com a API como engenheiro (chamadas, erros, custo), escreve prompts como artefatos versionados, estrutura saídas e aciona código com segurança, streama com dignidade e administra memória em camadas. É o núcleo do ofício de AI engineer.\n\nO próximo passo do roadmap ataca a limitação mais visível do seu chatbot: ele só sabe o que está no system e nas ferramentas. A trilha de RAG na Prática ensina a dar a ele uma base de conhecimento de verdade: os SEUS documentos, buscados por significado e citados na resposta. O assistente da Paginacem vai ganhar a estante inteira.",
                },
            ],
            questions: [
                {
                    statement: "Quando o projeto está pronto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quando o roteiro de aceitação passa por inteiro",
                            isCorrect: true,
                        },
                        {
                            text: "Quando a primeira resposta parece boa",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o código não tem mais nenhum comentário",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o custo por chamada zera",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: 'O teste "pedido de outro usuário é negado" valida o quê?',
                    difficulty: "facil",
                    options: [
                        {
                            text: "O escopo por sessão autenticada nas ferramentas",
                            isCorrect: true,
                        },
                        {
                            text: "A velocidade do streaming da resposta por SSE",
                            isCorrect: false,
                        },
                        {
                            text: "O tom da persona nas respostas",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho da janela de contexto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um item do checklist falhou: a conversa longa perde o número do protocolo após o resumo. Qual módulo revisitar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Memória: prompt de resumo e fatos persistentes",
                            isCorrect: true,
                        },
                        {
                            text: "Streaming: eventos e SSE",
                            isCorrect: false,
                        },
                        {
                            text: "Erros: backoff, jitter e retentativas",
                            isCorrect: false,
                        },
                        {
                            text: "Ferramentas: descrição, schema e fronteiras",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a limitação do chatbot que a próxima trilha (RAG) resolve?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele só sabe o que está no system e nas ferramentas; falta base de conhecimento",
                            isCorrect: true,
                        },
                        {
                            text: "Ele não consegue streamar as respostas mais longas para o navegador do cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Ele não tem persona definida no system",
                            isCorrect: false,
                        },
                        {
                            text: "Ele não registra o custo das conversas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que cada item do checklist final representa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Um módulo da trilha comprimido num teste de aceitação",
                            isCorrect: true,
                        },
                        {
                            text: "Uma exigência contratual imposta pelo provedor da API",
                            isCorrect: false,
                        },
                        {
                            text: "Uma métrica do painel de faturamento",
                            isCorrect: false,
                        },
                        {
                            text: "Um requisito exclusivo de apps mobile",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

export const MODULOS: Modulo[] = [
    MODULO_1,
    MODULO_2,
    MODULO_3,
    MODULO_4,
    MODULO_5,
    MODULO_6,
    MODULO_7,
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: LEVEL,
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    } else {
        const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
        if (existentes.length > 0) {
            console.log(
                "Trilha " + NOME + " ja tem " + existentes.length + " aulas. Nada a fazer.",
            );
            return;
        }
        await db
            .update(trails)
            .set({ workloadHours: CARGA_HORARIA, description: DESCRICAO, trailLevel: LEVEL })
            .where(eq(trails.id, trilha.id));
    }

    let totalAulas = 0;
    let totalQuestoes = 0;
    for (let mi = 0; mi < MODULOS.length; mi++) {
        const m = MODULOS[mi];
        const [mod] = await db
            .insert(modules)
            .values({ trailId: trilha.id, title: m.titulo, position: mi + 1 })
            .returning();
        for (let li = 0; li < m.aulas.length; li++) {
            const a = m.aulas[li];
            const [lesson] = await db
                .insert(lessons)
                .values({
                    trailId: trilha.id,
                    moduleId: mod.id,
                    title: a.titulo,
                    content: null,
                    contentBlocks: a.blocks,
                    position: li + 1,
                    published: true,
                })
                .returning();
            for (let qi = 0; qi < a.questions.length; qi++) {
                const q = a.questions[qi];
                const [questao] = await db
                    .insert(questions)
                    .values({
                        lessonId: lesson.id,
                        statement: q.statement,
                        difficulty: q.difficulty,
                        position: qi + 1,
                    })
                    .returning();
                await db.insert(questionOptions).values(
                    q.options.map((o, k) => ({
                        questionId: questao.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: k + 1,
                    })),
                );
            }
            totalAulas++;
            totalQuestoes += a.questions.length;
        }
    }
    console.log(
        "Seed concluido: " +
            MODULOS.length +
            " modulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questoes.",
    );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
