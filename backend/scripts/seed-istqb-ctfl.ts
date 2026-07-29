// Seed do simulado ISTQB Certified Tester Foundation Level (CTFL), no formato da
// prova v4.0: 40 questoes por tentativa, 60 minutos, corte de 65%. O banco tem 100
// questoes (fator 2,5x), distribuidas pelo peso real de cada capitulo do syllabus.
// O topic e o capitulo oficial, entao o filtro de assuntos funciona de imediato.
//
// Aditivo por enunciado: re-rodar acrescenta as questoes novas sem duplicar.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-istqb-ctfl.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";

const SLUG = "istqb-ctfl";

type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

const QUESTOES: Questao[] = [
    {
        statement:
            "Uma equipe executa o sistema com dados variados para descobrir se o comportamento corresponde ao esperado. Em paralelo, um desenvolvedor recebe um relatório de falha, investiga o código, localiza a linha responsável e corrige. Como se classificam essas duas atividades?",
        explanation:
            "Teste é o conjunto de atividades que expõe falhas ao exercitar o software e comparar o resultado obtido com o esperado. Depuração é a atividade de desenvolvimento que localiza a causa do defeito no código, analisa e corrige. Testar não corrige; depurar não descobre. Depois da correção, o teste de confirmação volta para verificar se o defeito foi mesmo resolvido.",
        options: [
            ["A primeira é teste e a segunda é depuração.", true],
            ["A primeira é depuração e a segunda é teste de confirmação da correção feita.", false],
            ["Ambas são teste, uma na fase dinâmica e outra na fase estática do processo.", false],
            [
                "Ambas são depuração, porque as duas lidam com defeitos encontrados no sistema.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement: "Qual das opções descreve um objetivo típico do teste?",
        explanation:
            "Avaliar se o produto atende aos requisitos e reduzir o nível de risco são objetivos típicos do teste, junto com prevenir defeitos, encontrar falhas, dar informação para decisão e cumprir exigências contratuais ou legais. Provar ausência de defeitos é impossível, corrigir código é depuração e a decisão de liberar a versão cabe ao negócio, com base na informação que o teste fornece.",
        options: [
            ["Reduzir o nível de risco de qualidade do software.", true],
            ["Provar que o software está completamente livre de defeitos antes da entrega.", false],
            ["Corrigir os defeitos encontrados durante a execução dos casos planejados.", false],
            ["Decidir sozinho se a versão pode ou não ser liberada para o cliente final.", false],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Uma pessoa da equipe interpreta a regra de negócio de forma equivocada e escreve o operador errado no código. Meses depois, um cliente relata que o desconto não é aplicado. Como se classificam, respectivamente, a interpretação equivocada, o operador errado no código e o desconto não aplicado?",
        explanation:
            "O erro (ou engano) é o ato humano que produz um resultado incorreto, aqui a interpretação equivocada. O defeito é a imperfeição gravada no artefato, aqui o operador errado no código. A falha é o comportamento observado quando o defeito é executado, aqui o desconto que não aparece. A cadeia é sempre erro, defeito e, se executado, falha.",
        options: [
            ["Erro, defeito e falha.", true],
            [
                "Defeito, erro e falha, na ordem em que cada um aparece durante o ciclo do produto.",
                false,
            ],
            [
                "Falha, defeito e erro, porque a percepção do cliente é sempre o ponto de partida.",
                false,
            ],
            [
                "Erro, falha e defeito, já que o comportamento observado antecede a análise do código.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Nem toda falha é causada por um defeito no código. Qual das situações abaixo é um exemplo válido disso?",
        explanation:
            "Falhas podem ter origem em condições ambientais e em outras influências externas, como radiação, campos eletromagnéticos e poluição, que alteram o hardware ou o firmware e provocam comportamento incorreto sem que exista defeito no código. As demais opções descrevem defeitos: no código, no requisito e na configuração usada pelo sistema.",
        options: [
            ["Radiação ou campo eletromagnético alterando o comportamento do hardware.", true],
            [
                "Um requisito ambíguo que levou a equipe a implementar a regra de forma incorreta.",
                false,
            ],
            [
                "Uma variável de ambiente configurada com o valor errado no servidor de produção.",
                false,
            ],
            [
                "Um laço que não trata o caso da lista vazia e provoca erro durante a execução.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Após uma sequência de falhas em produção, a equipe descobre que a maioria dos defeitos veio de requisitos escritos sem exemplos concretos, o que gerou interpretações divergentes. Que atividade a equipe realizou ao chegar a essa conclusão?",
        explanation:
            "A análise de causa raiz investiga por que os defeitos surgiram e busca a origem comum a vários deles, permitindo agir sobre o processo em vez de tratar cada sintoma. Identificar que a ausência de exemplos nos requisitos gera divergência é uma causa raiz, e a ação correspondente melhora o processo para reduzir defeitos futuros.",
        options: [
            ["Análise de causa raiz.", true],
            [
                "Teste de confirmação, para verificar se as correções aplicadas resolveram os defeitos.",
                false,
            ],
            [
                "Análise de risco de produto, estimando probabilidade e impacto de cada área do sistema.",
                false,
            ],
            [
                "Controle de qualidade, inspecionando o produto construído em busca de novos defeitos.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Qual afirmação descreve corretamente a relação entre garantia da qualidade e teste?",
        explanation:
            "A garantia da qualidade é orientada ao processo e busca a implementação e a melhoria adequada dos processos, com a premissa de que bom processo tende a produzir bom produto. O teste faz parte do controle de qualidade, que é orientado ao produto e busca alcançar níveis apropriados de qualidade no que foi construído. As duas se complementam e nenhuma substitui a outra.",
        options: [
            [
                "Garantia da qualidade foca no processo e o teste faz parte do controle de qualidade.",
                true,
            ],
            [
                "Garantia da qualidade e teste são sinônimos, mudando apenas o nome usado em cada empresa.",
                false,
            ],
            [
                "O teste foca no processo de trabalho e a garantia da qualidade foca no produto entregue.",
                false,
            ],
            [
                "A garantia da qualidade substitui o teste quando o processo da equipe está maduro.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Uma equipe executou toda a suíte planejada e nenhum caso falhou. O gerente conclui que o produto está livre de defeitos. Qual princípio de teste essa conclusão contraria?",
        explanation:
            "O princípio de que o teste mostra a presença de defeitos, mas não a ausência, estabelece que testar reduz a probabilidade de defeitos não descobertos permanecerem, sem jamais provar que o software está correto. Ausência de falhas na execução não é prova de ausência de defeitos, apenas de que o que foi verificado, do jeito que foi verificado, passou.",
        options: [
            ["Teste mostra a presença de defeitos, não a ausência.", true],
            [
                "Teste exaustivo é impossível, então é preciso escolher com base em risco e prioridade.",
                false,
            ],
            [
                "Defeitos se agrupam, ou seja, poucos módulos concentram a maioria dos problemas.",
                false,
            ],
            ["Testar cedo economiza tempo e dinheiro ao longo do ciclo de vida do produto.", false],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Uma suíte de regressão roda há dois anos sem alteração e deixou de encontrar defeitos novos, embora continue passando. Qual princípio explica esse comportamento e qual a ação recomendada?",
        explanation:
            "O paradoxo do pesticida diz que os mesmos testes repetidos deixam de encontrar defeitos novos, porque o que eles cobrem já foi corrigido. A recomendação é revisar e atualizar os testes periodicamente, e escrever casos novos, possivelmente complementando com teste exploratório. A suíte antiga continua útil contra regressão, mas não descobre novidade.",
        options: [
            ["Paradoxo do pesticida, e a ação é revisar e criar casos novos.", true],
            [
                "Agrupamento de defeitos, e a ação é concentrar o esforço nos módulos mais problemáticos.",
                false,
            ],
            [
                "Ilusão da ausência de erros, e a ação é validar se o produto atende à necessidade real.",
                false,
            ],
            [
                "Teste exaustivo é impossível, e a ação é reduzir a quantidade de casos executados.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Um sistema foi entregue praticamente sem defeitos, mas os usuários não conseguem realizar a tarefa principal porque ele resolve um problema diferente do que eles têm. Qual princípio de teste isso ilustra?",
        explanation:
            "A ilusão da ausência de erros afirma que encontrar e corrigir muitos defeitos não ajuda se o sistema construído não atende às necessidades e expectativas dos usuários. Qualidade não é apenas ausência de defeitos: é atender à necessidade real, o que reforça a importância da validação junto de quem vai usar.",
        options: [
            ["Ilusão da ausência de erros.", true],
            [
                "Teste mostra a presença de defeitos, mas nunca consegue provar a ausência deles.",
                false,
            ],
            [
                "O teste depende do contexto, então cada produto exige uma abordagem diferente.",
                false,
            ],
            [
                "Testar cedo economiza tempo e dinheiro no decorrer do ciclo de vida do produto.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Uma empresa aplica o mesmo nível de rigor e as mesmas técnicas para testar um jogo casual de celular e o software embarcado de um equipamento hospitalar. Qual princípio de teste está sendo desrespeitado?",
        explanation:
            "O princípio de que o teste depende do contexto estabelece que a abordagem, as técnicas, a profundidade e o rigor variam conforme o domínio, o risco, as exigências regulatórias e as características do produto. Software com risco à vida exige rigor incompatível com o de um jogo casual, e tratar os dois igual desperdiça esforço num caso e assume risco inaceitável no outro.",
        options: [
            ["O teste depende do contexto.", true],
            [
                "Defeitos se agrupam em poucos módulos, normalmente os mais complexos e alterados.",
                false,
            ],
            [
                "Teste exaustivo é impossível, então nunca se consegue cobrir todas as combinações.",
                false,
            ],
            [
                "O paradoxo do pesticida faz com que testes repetidos deixem de encontrar novidade.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Durante o planejamento, a equipe percebe que os módulos de faturamento e de integração bancária concentraram a maioria dos defeitos das últimas entregas, e decide investir mais teste neles. Que princípio orientou a decisão?",
        explanation:
            "O agrupamento de defeitos estabelece que uma pequena quantidade de módulos costuma conter a maioria dos defeitos ou responder pela maioria das falhas operacionais. Esse princípio serve de entrada para a análise de risco e orienta onde concentrar o esforço, que é exatamente o que a equipe fez.",
        options: [
            ["Agrupamento de defeitos.", true],
            [
                "Testar cedo, antecipando as atividades de qualidade para o início do ciclo de vida.",
                false,
            ],
            [
                "Teste exaustivo é impossível, o que obriga a escolher um subconjunto de cenários.",
                false,
            ],
            [
                "Teste mostra a presença de defeitos, sem nunca conseguir provar a ausência deles.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Qual é a ordem correta das atividades do processo de teste, conforme o conjunto de atividades definido no syllabus?",
        explanation:
            "O processo de teste percorre planejamento, monitoramento e controle, análise, modelagem, implementação, execução e conclusão. Monitoramento e controle acontecem de forma contínua ao longo das demais, e as atividades podem se sobrepor ou ocorrer em paralelo, mas a sequência lógica é essa.",
        options: [
            ["Planejamento, análise, modelagem, implementação, execução e conclusão.", true],
            [
                "Análise, planejamento, modelagem, execução, implementação e conclusão do ciclo.",
                false,
            ],
            [
                "Planejamento, modelagem, análise, implementação, conclusão e execução dos casos.",
                false,
            ],
            [
                "Modelagem, análise, planejamento, execução, implementação e encerramento das atividades.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            'Em qual atividade do processo de teste a equipe identifica as condições de teste a partir da base de teste, respondendo à pergunta "o que testar?"',
        explanation:
            "A análise de teste examina a base de teste para identificar características testáveis e definir as condições de teste associadas, respondendo o que deve ser testado e considerando o nível de risco. A modelagem responde como testar, transformando as condições em casos concretos, e a implementação prepara o testware necessário para a execução.",
        options: [
            ["Análise de teste.", true],
            [
                "Modelagem de teste, quando as condições viram casos concretos com dados e resultados.",
                false,
            ],
            [
                "Implementação de teste, quando o testware necessário para executar fica pronto.",
                false,
            ],
            [
                "Planejamento de teste, quando o escopo, os objetivos e a abordagem são definidos.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Qual conjunto abaixo representa exemplos de testware produzidos durante a atividade de implementação de teste?",
        explanation:
            "A implementação de teste produz e organiza o testware necessário para executar, como procedimentos de teste, suítes, dados de teste criados e carregados no ambiente, e scripts automatizados. Condições de teste são produto da análise, casos de teste são produto da modelagem, e o relatório de conclusão pertence à atividade de conclusão.",
        options: [
            ["Procedimentos, suítes de teste e dados carregados no ambiente.", true],
            [
                "Condições de teste derivadas da base e priorizadas conforme o risco de cada área.",
                false,
            ],
            [
                "Casos de teste com entradas, pré-condições e resultados esperados bem definidos.",
                false,
            ],
            [
                "Relatório de conclusão de teste, com o resumo do que foi executado e do que ficou aberto.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Qual é o principal benefício de manter rastreabilidade entre a base de teste, as condições, os casos e os resultados de execução?",
        explanation:
            "A rastreabilidade permite avaliar a cobertura em relação à base de teste, analisar o impacto de mudanças, tornar a auditoria possível e atender a critérios de governança de TI. Ela também ajuda a tornar os relatórios de progresso compreensíveis ao ligar o resultado da execução aos objetivos de negócio.",
        options: [
            ["Avaliar cobertura, analisar impacto de mudanças e permitir auditoria.", true],
            [
                "Reduzir a quantidade total de casos de teste necessários para cobrir os requisitos.",
                false,
            ],
            [
                "Garantir que nenhum defeito escape para o ambiente de produção após a entrega.",
                false,
            ],
            [
                "Substituir a necessidade de análise de risco na priorização do que será testado.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Uma equipe adota a abordagem de time completo (whole team approach) para qualidade. O que isso significa na prática?",
        explanation:
            "Na abordagem de time completo, qualquer membro com o conhecimento e as habilidades necessárias pode executar qualquer tarefa, e todos são responsáveis pela qualidade. Testadores trabalham junto com representantes de negócio e desenvolvedores para garantir que os níveis desejados de qualidade sejam atingidos, o que promove entendimento compartilhado e visão ampla.",
        options: [
            ["Todos são responsáveis pela qualidade e colaboram nas tarefas necessárias.", true],
            [
                "A equipe de teste passa a aprovar formalmente cada entrega antes da publicação.",
                false,
            ],
            [
                "Cada especialista atua apenas na própria disciplina, sem sobreposição de tarefas.",
                false,
            ],
            [
                "O papel de testador deixa de existir, e os desenvolvedores assumem todo o teste.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Qual é o principal benefício de manter algum grau de independência entre quem testa e quem desenvolve?",
        explanation:
            "Testadores independentes tendem a reconhecer tipos diferentes de falhas em comparação com desenvolvedores, por causa de formação, perspectiva e vieses distintos. O revés é o possível isolamento da equipe, atrasos no feedback e a percepção, por parte dos desenvolvedores, de perda de responsabilidade pela qualidade.",
        options: [
            ["Reconhecer tipos diferentes de falhas, por causa de vieses distintos.", true],
            [
                "Reduzir o custo total do projeto, já que menos pessoas precisam analisar o produto.",
                false,
            ],
            [
                "Garantir que o desenvolvedor deixe de precisar testar o próprio trabalho antes de entregar.",
                false,
            ],
            [
                "Assegurar que nenhum defeito chegue ao ambiente de produção depois da entrega feita.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Entre as habilidades esperadas de quem trabalha com teste, qual das descrições corresponde a pensamento crítico e ceticismo saudável?",
        explanation:
            "Pensamento crítico e ceticismo saudável descrevem a postura de não aceitar afirmações sem evidência, questionar suposições e buscar comprovação do comportamento. As demais opções descrevem outras habilidades esperadas, como comunicação eficaz, conhecimento do domínio e atenção a detalhes, todas relevantes mas distintas.",
        options: [
            ["Questionar suposições e buscar evidência antes de aceitar afirmações.", true],
            [
                "Explicar achados de forma clara para públicos técnicos e de negócio da organização.",
                false,
            ],
            [
                "Conhecer o domínio do negócio para entender o impacto real de cada comportamento.",
                false,
            ],
            [
                "Perceber pequenas diferenças entre o resultado obtido e o resultado esperado no sistema.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Uma pessoa de teste comunica um defeito dizendo que o desenvolvedor foi descuidado ao escrever aquele trecho. Qual princípio de comunicação está sendo violado?",
        explanation:
            "A comunicação sobre defeitos e falhas deve ser construtiva e focada em fatos, não em pessoas. O syllabus orienta enfatizar a colaboração, tentar entender como a outra pessoa se sente e confirmar o entendimento mútuo, para evitar que a informação seja recebida como crítica pessoal e o relacionamento com a equipe se deteriore.",
        options: [
            ["A comunicação deve tratar de fatos e ser construtiva, não pessoal.", true],
            [
                "O defeito precisa ser registrado na ferramenta antes de qualquer conversa com a equipe.",
                false,
            ],
            [
                "A comunicação sobre defeitos deve ser feita apenas por quem gerencia a equipe de teste.",
                false,
            ],
            [
                "O relato precisa incluir a análise de causa raiz para ser considerado completo e útil.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Segundo o syllabus, qual das responsabilidades abaixo pertence tipicamente ao papel de gerência de teste, e não ao papel de teste?",
        explanation:
            "A gerência de teste assume responsabilidade geral pelo processo, pela liderança da equipe e pelas atividades, incluindo o planejamento das atividades e a redação e atualização dos planos de teste. O papel de teste assume responsabilidade técnica, como analisar, modelar, implementar e executar testes, avaliar resultados e reportar defeitos.",
        options: [
            ["Planejar as atividades de teste e escrever o plano de teste.", true],
            [
                "Analisar a base de teste para identificar as condições de teste da entrega atual.",
                false,
            ],
            [
                "Executar os casos de teste, avaliar os resultados e registrar os defeitos encontrados.",
                false,
            ],
            [
                "Preparar o ambiente e os dados necessários para executar os cenários planejados.",
                false,
            ],
        ],
        topic: "Fundamentos de teste",
    },
    {
        statement:
            "Uma equipe adota um ciclo de vida sequencial, em que cada fase começa só quando a anterior termina. Qual é a consequência típica disso para o teste dinâmico?",
        explanation:
            "Em modelos sequenciais, o teste dinâmico só pode acontecer depois que existe software executável, o que costuma concentrá-lo no fim do projeto. O teste estático, por outro lado, pode começar assim que os primeiros artefatos existem. Em modelos iterativos e incrementais, o teste acompanha cada incremento e o feedback chega mais cedo.",
        options: [
            ["Ele se concentra no fim, porque depende de software executável.", true],
            [
                "Ele acontece de forma contínua desde o início, acompanhando cada fase do projeto.",
                false,
            ],
            [
                "Ele deixa de ser necessário, já que a revisão de cada fase substitui a execução.",
                false,
            ],
            [
                "Ele passa a ser responsabilidade exclusiva de quem escreve o código do sistema.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement:
            "Em qual abordagem o desenvolvedor escreve primeiro um teste que falha, depois escreve o código mínimo para fazê-lo passar e por fim refatora, tudo guiado por casos de teste em nível de código?",
        explanation:
            "No desenvolvimento orientado a testes (TDD), o teste vem primeiro e guia a escrita do código, em ciclos curtos de vermelho, verde e refatoração. No ATDD os testes derivam dos critérios de aceitação definidos com o negócio, e no BDD o comportamento desejado é expresso em linguagem natural estruturada, normalmente no formato dado, quando e então.",
        options: [
            ["Desenvolvimento orientado a testes (TDD).", true],
            [
                "Desenvolvimento orientado a comportamento (BDD), com cenários escritos em linguagem natural.",
                false,
            ],
            [
                "Desenvolvimento orientado a testes de aceitação (ATDD), a partir dos critérios acordados.",
                false,
            ],
            [
                "Integração contínua, com a suíte executada automaticamente a cada alteração enviada.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement: "Qual das opções descreve corretamente o BDD?",
        explanation:
            "No desenvolvimento orientado a comportamento (BDD), o comportamento desejado do software é expresso em linguagem natural estruturada, de modo que pessoas de negócio, desenvolvimento e teste compartilhem o mesmo entendimento. Esses cenários podem ser traduzidos em testes executáveis. O foco é comunicação e entendimento comum, e não a ferramenta usada.",
        options: [
            ["O comportamento é descrito em linguagem natural estruturada e compartilhada.", true],
            [
                "Os testes são escritos antes do código, em nível de unidade, guiando a implementação.",
                false,
            ],
            [
                "Os critérios de aceitação viram testes automatizados executados no pipeline de entrega.",
                false,
            ],
            [
                "O código é integrado várias vezes ao dia, com verificação automática a cada integração.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement:
            "Segundo boas práticas de teste em qualquer ciclo de vida, o que deve acontecer com cada nível de desenvolvimento?",
        explanation:
            "Uma boa prática é que cada atividade de desenvolvimento tenha uma atividade de teste correspondente, e que cada nível de teste tenha objetivos específicos. Além disso, a análise e a modelagem devem começar durante a fase correspondente do desenvolvimento, e os testadores devem se envolver na revisão dos artefatos assim que rascunhos ficam disponíveis.",
        options: [
            ["Deve existir uma atividade de teste correspondente, com objetivos próprios.", true],
            [
                "Deve existir uma fase de teste ao final, agrupando a verificação de todos os níveis.",
                false,
            ],
            [
                "Deve existir aprovação formal da equipe de teste antes do início da fase seguinte.",
                false,
            ],
            [
                "Deve existir uma suíte automatizada cobrindo todo o código produzido naquela fase.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement: "O que caracteriza a abordagem conhecida como shift left?",
        explanation:
            "Shift left significa antecipar as atividades de teste no ciclo de vida, realizando-as o mais cedo possível. Exemplos incluem revisar a especificação sob a ótica de teste, escrever casos antes do código, usar integração contínua e executar análise estática antes do teste dinâmico. Antecipar não elimina o teste nas fases seguintes, apenas reduz o que chega até elas.",
        options: [
            ["Antecipar as atividades de teste para o mais cedo possível no ciclo de vida.", true],
            [
                "Concentrar o esforço de teste na fase final, quando o sistema já está integrado.",
                false,
            ],
            [
                "Transferir a execução dos testes da equipe de qualidade para quem desenvolve o produto.",
                false,
            ],
            [
                "Automatizar todos os testes de interface antes de escrever os testes de unidade.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement: "Qual das práticas de DevOps traz benefício direto para o teste?",
        explanation:
            "DevOps traz feedback rápido sobre a qualidade do código, promove a integração e a entrega contínuas com testes automatizados em cada estágio do pipeline, e incentiva a visão de qualidade como responsabilidade compartilhada. Também exige investimento e esforço de configuração, e não elimina o teste manual nem o exploratório.",
        options: [
            ["Feedback rápido de qualidade a cada alteração enviada ao repositório.", true],
            [
                "A eliminação da necessidade de teste exploratório, já que o pipeline cobre os cenários.",
                false,
            ],
            [
                "A redução do investimento inicial necessário para montar o ambiente de automação.",
                false,
            ],
            [
                "A garantia de que nenhum defeito chegará ao ambiente de produção após a implantação.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement:
            "Uma equipe realiza, ao fim de cada iteração, uma reunião em que discute o que funcionou bem, o que não funcionou e o que pode melhorar no processo. Qual é o benefício disso para o teste?",
        explanation:
            "As retrospectivas geram melhoria de processo e, no contexto de teste, ajudam a aumentar a eficácia e a eficiência do sistema de teste, a qualidade do testware e a competência da equipe, além de melhorar a colaboração e a base de teste. Elas são o mecanismo de melhoria contínua do próprio processo de teste.",
        options: [
            ["Melhorar a eficácia do sistema de teste e a qualidade do testware.", true],
            [
                "Registrar formalmente os defeitos encontrados durante a iteração que acabou de terminar.",
                false,
            ],
            [
                "Aprovar a entrega do incremento para o ambiente de produção junto com quem cuida do produto.",
                false,
            ],
            [
                "Estimar o esforço de teste necessário para a próxima iteração de desenvolvimento.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement:
            "Qual nível de teste foca nas interfaces e nas interações entre componentes do próprio sistema, e não na comunicação com sistemas externos?",
        explanation:
            "O teste de integração de componentes verifica as interfaces e as interações entre componentes do sistema. Já o teste de integração de sistemas verifica as interfaces entre o sistema e outros sistemas ou serviços externos. O teste de componente verifica componentes isolados, e o teste de sistema verifica o comportamento e as capacidades do sistema como um todo.",
        options: [
            ["Teste de integração de componentes.", true],
            [
                "Teste de integração de sistemas, que trata das interfaces com serviços externos ao sistema.",
                false,
            ],
            [
                "Teste de componente, que verifica cada unidade de forma isolada das demais partes.",
                false,
            ],
            [
                "Teste de sistema, que verifica o comportamento do sistema completo de ponta a ponta.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement:
            "Uma pessoa da área de negócio executa cenários no sistema pronto para decidir se ele atende às suas necessidades e se pode ser aceito. Que forma de teste de aceitação é essa?",
        explanation:
            "O teste de aceitação do usuário verifica se o sistema atende às necessidades dos usuários em um ambiente operacional, real ou simulado, com foco em adequação ao uso. O teste de aceitação operacional foca em aspectos como backup, restauração e segurança pela ótica de quem opera. Os testes alfa e beta são realizados por usuários potenciais, no local do desenvolvedor e no local do usuário, respectivamente.",
        options: [
            ["Teste de aceitação do usuário.", true],
            [
                "Teste de aceitação operacional, com foco em backup, restauração e tarefas de operação.",
                false,
            ],
            [
                "Teste alfa, realizado por usuários potenciais nas instalações da organização que desenvolve.",
                false,
            ],
            [
                "Teste beta, realizado por usuários potenciais no próprio ambiente e local deles.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement: "Qual das verificações abaixo é um exemplo de teste não funcional?",
        explanation:
            "O teste não funcional avalia características de qualidade como eficiência de desempenho, compatibilidade, usabilidade, confiabilidade, segurança, manutenibilidade e portabilidade. Medir o tempo de resposta sob determinada carga avalia eficiência de desempenho. As demais opções verificam o que o sistema faz, o que caracteriza teste funcional.",
        options: [
            ["Medir o tempo de resposta do sistema com quinhentos usuários simultâneos.", true],
            [
                "Conferir se o cálculo de desconto aplica o percentual correto para cada faixa de valor.",
                false,
            ],
            [
                "Verificar se o cadastro recusa um CPF já existente e exibe a mensagem apropriada.",
                false,
            ],
            [
                "Checar se o pedido cancelado devolve o item ao estoque disponível para venda.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement: "Qual é a diferença entre teste de caixa-branca e teste de caixa-preta?",
        explanation:
            "O teste de caixa-branca deriva os testes da estrutura interna ou da implementação do sistema, e o teste de caixa-preta deriva os testes da documentação externa e do comportamento esperado, sem considerar a estrutura interna. Os dois são tipos de teste que podem ser aplicados em qualquer nível, e não níveis de teste.",
        options: [
            [
                "O de caixa-branca deriva da estrutura interna e o de caixa-preta do comportamento externo.",
                true,
            ],
            [
                "O de caixa-branca é executado por quem programa e o de caixa-preta pela equipe de qualidade.",
                false,
            ],
            [
                "O de caixa-branca só existe no nível de componente e o de caixa-preta no nível de sistema.",
                false,
            ],
            [
                "O de caixa-branca verifica requisitos não funcionais e o de caixa-preta os funcionais.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement:
            "Depois que um defeito é corrigido, a equipe executa novamente o caso que havia falhado e, em seguida, executa uma seleção de casos de áreas relacionadas. Como se chamam, respectivamente, essas duas execuções?",
        explanation:
            "O teste de confirmação verifica se o defeito foi de fato corrigido, executando o caso que falhou. O teste de regressão verifica se a mudança não introduziu efeitos adversos em partes não alteradas do software ou em outros sistemas relacionados. Os dois são executados em conjunto após correções e mudanças.",
        options: [
            ["Teste de confirmação e teste de regressão.", true],
            [
                "Teste de regressão e teste de confirmação, nessa ordem, conforme o impacto da correção.",
                false,
            ],
            [
                "Teste de fumaça e teste de sanidade, aplicados após a implantação da versão corrigida.",
                false,
            ],
            [
                "Reteste de aceitação e teste de manutenção, executados no ambiente de homologação.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement:
            "Um sistema em produção há cinco anos precisa ser migrado para uma nova versão do banco de dados. Que tipo de teste é acionado por essa situação?",
        explanation:
            "O teste de manutenção é acionado por modificações, migrações e aposentadoria do sistema. Migração para outra plataforma ou banco exige teste operacional do novo ambiente, além do teste das mudanças no software, e pode incluir teste de conversão quando dados são transferidos de outra aplicação.",
        options: [
            ["Teste de manutenção.", true],
            [
                "Teste de aceitação do usuário, para confirmar que o sistema segue atendendo à necessidade.",
                false,
            ],
            [
                "Teste de integração de componentes, verificando as interfaces internas afetadas pela troca.",
                false,
            ],
            [
                "Teste de fumaça, para decidir rapidamente se vale a pena seguir com a bateria completa.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement:
            "Qual dos fatores abaixo influencia diretamente o escopo do teste de manutenção?",
        explanation:
            "O escopo do teste de manutenção depende do grau de risco da mudança, do tamanho do sistema existente e do tamanho da mudança. Quanto maior o sistema e a alteração, maior o esforço necessário para verificar que nada mais quebrou, e a análise de impacto ajuda a identificar as áreas afetadas.",
        options: [
            ["O grau de risco da mudança e o tamanho do sistema existente.", true],
            [
                "A quantidade de pessoas disponíveis na equipe de teste durante aquele período do projeto.",
                false,
            ],
            [
                "O modelo de ciclo de vida adotado pela organização no momento da construção original.",
                false,
            ],
            [
                "A quantidade de defeitos que foram encontrados na última entrega feita para produção.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement: "Para que serve a análise de impacto no contexto do teste de manutenção?",
        explanation:
            "A análise de impacto identifica as áreas do sistema afetadas por uma mudança, indicando o efeito pretendido, os efeitos colaterais possíveis e as áreas que precisam de teste de regressão. Ela pode ser difícil quando a especificação está desatualizada, quando falta rastreabilidade ou quando quem conhecia o sistema não está mais disponível.",
        options: [
            ["Identificar as áreas afetadas e onde a regressão é necessária.", true],
            [
                "Estimar o custo financeiro que a mudança vai gerar para a organização contratante.",
                false,
            ],
            [
                "Definir os critérios de saída que precisam ser atingidos antes da entrega da versão.",
                false,
            ],
            [
                "Determinar a severidade e a prioridade dos defeitos encontrados durante a manutenção.",
                false,
            ],
        ],
        topic: "Teste no ciclo de vida",
    },
    {
        statement: "Qual das opções descreve corretamente o que o teste estático permite fazer?",
        explanation:
            "O teste estático examina artefatos sem executar o software, o que permite detectar defeitos diretamente, e não apenas as falhas que eles causariam. Isso torna possível encontrar problemas na origem, antes de virar código, e avaliar artefatos que sequer são executáveis, como requisitos, contratos e modelos.",
        options: [
            ["Detectar defeitos diretamente, sem executar o software.", true],
            [
                "Observar as falhas provocadas pelos defeitos durante a execução dos cenários planejados.",
                false,
            ],
            [
                "Medir o tempo de resposta do sistema sob a carga esperada no ambiente de produção.",
                false,
            ],
            [
                "Confirmar que um defeito corrigido não se manifesta mais no cenário que havia falhado.",
                false,
            ],
        ],
        topic: "Teste estático",
    },
    {
        statement: "Quais destes artefatos podem ser examinados por teste estático?",
        explanation:
            "Praticamente qualquer artefato pode ser examinado por teste estático, desde que seja legível e compreensível: requisitos, código-fonte, planos de teste, casos de teste, backlog de produto, contratos, modelos e guias de configuração. Artefatos difíceis de alterar depois de prontos, como contratos, são candidatos especialmente valiosos.",
        options: [
            ["Requisitos, código-fonte, casos de teste, contratos e modelos.", true],
            [
                "Apenas o código-fonte, que é o único artefato analisável por ferramentas de análise.",
                false,
            ],
            [
                "Apenas requisitos e especificações, porque os demais artefatos exigem execução.",
                false,
            ],
            [
                "Apenas artefatos executáveis, já que a análise depende de rodar o que foi construído.",
                false,
            ],
        ],
        topic: "Teste estático",
    },
    {
        statement: "Qual é o principal valor do teste estático em relação ao custo do defeito?",
        explanation:
            "O teste estático permite detectar defeitos nas fases iniciais do ciclo de vida, cumprindo o princípio de testar cedo. Isso torna a correção muito mais barata, já que o defeito é corrigido antes de virar código, de se propagar para outros artefatos e de exigir retrabalho em várias frentes.",
        options: [
            ["Encontrar defeitos cedo, quando corrigir custa muito menos.", true],
            [
                "Reduzir a quantidade de casos de teste dinâmicos necessários na fase de execução.",
                false,
            ],
            [
                "Substituir a necessidade de teste dinâmico nos sistemas de baixo risco operacional.",
                false,
            ],
            [
                "Garantir que o produto atenda às necessidades reais das pessoas que vão utilizá-lo.",
                false,
            ],
        ],
        topic: "Teste estático",
    },
    {
        statement: "Além de encontrar defeitos, qual benefício adicional a revisão traz?",
        explanation:
            "Além de detectar defeitos, a revisão traz benefícios como aumentar a compreensão comum entre os participantes, treinar novos membros da equipe, criar propriedade compartilhada do produto e melhorar a comunicação. Esses ganhos são frequentemente tão valiosos quanto os defeitos encontrados.",
        options: [
            ["Aumentar o entendimento comum e criar propriedade compartilhada.", true],
            [
                "Garantir que o artefato revisado não precise de teste dinâmico posteriormente no ciclo.",
                false,
            ],
            [
                "Permitir medir a cobertura de código atingida pelos testes escritos até aquele momento.",
                false,
            ],
            [
                "Reduzir o tempo total do projeto por dispensar a etapa formal de aceitação do cliente.",
                false,
            ],
        ],
        topic: "Teste estático",
    },
    {
        statement:
            "Qual é a diferença essencial entre teste estático e teste dinâmico quanto ao que cada um encontra?",
        explanation:
            "O teste estático encontra defeitos diretamente nos artefatos, incluindo aqueles que dificilmente seriam detectados por teste dinâmico, como código morto, desvios de padrão e requisitos incompletos ou inconsistentes. O teste dinâmico observa falhas durante a execução e revela comportamento que só aparece rodando, como problemas de desempenho e de confiabilidade.",
        options: [
            ["O estático acha defeitos em artefatos; o dinâmico revela falhas na execução.", true],
            [
                "O estático acha falhas de desempenho; o dinâmico acha inconsistências nos requisitos.",
                false,
            ],
            [
                "O estático é feito por ferramentas e o dinâmico obrigatoriamente por pessoas da equipe.",
                false,
            ],
            [
                "O estático se aplica ao código e o dinâmico apenas à interface apresentada ao usuário.",
                false,
            ],
        ],
        topic: "Teste estático",
    },
    {
        statement:
            "Qual é o benefício de envolver as partes interessadas cedo e com frequência, dando feedback contínuo sobre os artefatos?",
        explanation:
            "Feedback antecipado e frequente comunica cedo o impacto potencial de problemas, permite prevenir mal-entendidos sobre requisitos e garante que a equipe entenda o que é mais importante para as partes interessadas. Isso reduz o risco de construir algo que não atende à necessidade e evita retrabalho caro.",
        options: [
            ["Prevenir mal-entendidos sobre requisitos e reduzir retrabalho.", true],
            [
                "Transferir para as partes interessadas a responsabilidade formal pela qualidade do produto.",
                false,
            ],
            [
                "Dispensar a necessidade de teste de aceitação ao final do desenvolvimento do sistema.",
                false,
            ],
            [
                "Aumentar a cobertura de código atingida pela suíte automatizada construída pela equipe.",
                false,
            ],
        ],
        topic: "Teste estático",
    },
    {
        statement: "Qual é a ordem correta das atividades do processo de revisão?",
        explanation:
            "O processo de revisão percorre planejamento, início da revisão, revisão individual, comunicação e análise dos achados, e correção e relato. No planejamento define-se escopo, critérios e papéis; no início, o material é distribuído e o contexto explicado; na revisão individual cada participante examina o artefato e registra achados.",
        options: [
            [
                "Planejamento, início, revisão individual, comunicação e análise, correção e relato.",
                true,
            ],
            [
                "Início, planejamento, revisão individual, correção, comunicação e relato dos achados.",
                false,
            ],
            [
                "Revisão individual, planejamento, comunicação, início, análise e correção dos achados.",
                false,
            ],
            [
                "Planejamento, revisão individual, início, correção, análise e comunicação dos achados.",
                false,
            ],
        ],
        topic: "Teste estático",
    },
    {
        statement:
            "Em uma revisão, quem é responsável por garantir que a reunião ocorra de forma eficaz, mediando quando necessário e mantendo o foco no artefato?",
        explanation:
            "O moderador (ou facilitador) garante o andamento eficaz das reuniões de revisão, media entre pontos de vista divergentes e frequentemente é a pessoa de quem depende o sucesso da revisão. O autor cria e corrige o artefato, o escriba registra os achados e o líder da revisão assume responsabilidade geral, decidindo quem participa e quando ocorre.",
        options: [
            ["O moderador.", true],
            [
                "O autor, que criou o artefato e conhece melhor o conteúdo que está sendo examinado.",
                false,
            ],
            [
                "O escriba, que registra os achados e as decisões tomadas durante a reunião de revisão.",
                false,
            ],
            [
                "A gerência, que aloca as pessoas e o tempo necessário para a atividade acontecer.",
                false,
            ],
        ],
        topic: "Teste estático",
    },
    {
        statement:
            "Uma equipe conduz uma revisão em que o autor guia os participantes pelo artefato passo a passo, explicando o conteúdo e coletando comentários, sem preparação individual obrigatória. Que tipo de revisão é essa?",
        explanation:
            "No walkthrough (passagem), o autor lidera a sessão e guia os participantes pelo artefato, com o objetivo de estabelecer entendimento comum, encontrar defeitos e avaliar qualidade. A preparação individual antes da reunião é opcional. A revisão técnica envolve pares tecnicamente qualificados com preparação prévia, e a inspeção é a mais formal, com papéis definidos, métricas e critérios de saída.",
        options: [
            ["Walkthrough.", true],
            [
                "Inspeção, que é o tipo mais formal e segue um processo definido com métricas coletadas.",
                false,
            ],
            [
                "Revisão técnica, conduzida por pares qualificados com preparação individual obrigatória.",
                false,
            ],
            [
                "Revisão informal, sem processo definido nem produção de documentação dos resultados.",
                false,
            ],
        ],
        topic: "Teste estático",
    },
    {
        statement: "Qual dos fatores abaixo contribui para o sucesso de uma revisão?",
        explanation:
            "Entre os fatores de sucesso estão definir objetivos claros e mensuráveis, escolher o tipo de revisão adequado ao contexto, dividir documentos grandes em partes, dar feedback construtivo, evitar comportamentos que gerem percepção negativa e oferecer treinamento adequado. Revisar tudo de uma vez e usar a revisão para avaliar pessoas são exatamente o oposto.",
        options: [
            ["Dividir documentos grandes em partes menores para revisar aos poucos.", true],
            [
                "Revisar o documento inteiro numa única sessão longa, para não perder o contexto geral.",
                false,
            ],
            [
                "Usar os achados da revisão como insumo na avaliação de desempenho de quem escreveu.",
                false,
            ],
            [
                "Deixar os objetivos em aberto, para que os participantes encontrem o que acharem relevante.",
                false,
            ],
        ],
        topic: "Teste estático",
    },
    {
        statement: "Como as técnicas de teste são classificadas no syllabus?",
        explanation:
            "As técnicas se dividem em caixa-preta, que derivam os testes da análise da base de teste sem considerar a estrutura interna, caixa-branca, que derivam da estrutura interna e da implementação, e baseadas em experiência, que usam conhecimento e habilidade de quem testa para prever onde os defeitos provavelmente estão.",
        options: [
            ["Caixa-preta, caixa-branca e baseadas em experiência.", true],
            [
                "Funcionais, não funcionais e de regressão, conforme o objetivo de cada verificação.",
                false,
            ],
            [
                "Estáticas, dinâmicas e exploratórias, conforme a necessidade de executar o software.",
                false,
            ],
            [
                "De componente, de integração, de sistema e de aceitação, conforme o nível aplicado.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement: "Qual é a característica comum às técnicas de caixa-preta?",
        explanation:
            "As técnicas de caixa-preta derivam os testes da análise da base de teste apropriada, focam nas entradas e saídas do objeto de teste sem considerar a estrutura interna, e a cobertura é medida em relação aos itens testados na base de teste e à técnica aplicada. Estrutura de código e cobertura de comando pertencem à caixa-branca.",
        options: [
            ["Focam em entradas e saídas, sem considerar a estrutura interna.", true],
            [
                "Medem a cobertura pelas linhas e ramos do código executados durante a bateria de testes.",
                false,
            ],
            [
                "Exigem acesso ao código-fonte para derivar os cenários que serão executados no sistema.",
                false,
            ],
            [
                "Dependem exclusivamente da experiência acumulada por quem projeta os casos de teste.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Um campo aceita a idade do cliente e a regra é: de 0 a 17 recusa, de 18 a 64 tarifa cheia, de 65 em diante meia tarifa. Aplicando partição de equivalência apenas às partições válidas, quantos casos são necessários para cobertura de 100%?",
        explanation:
            "A partição de equivalência divide os dados em partições em que se espera que todos os membros sejam processados da mesma forma. Aqui existem três partições válidas: 0 a 17, 18 a 64 e 65 em diante. A cobertura de 100% das partições válidas exige um caso para cada uma, ou seja, três casos.",
        options: [
            ["Três.", true],
            [
                "Seis, contando também as partições inválidas como valor negativo, texto e campo vazio.",
                false,
            ],
            [
                "Dois, porque a recusa e a aceitação são os únicos dois comportamentos distintos possíveis.",
                false,
            ],
            [
                "Cinco, somando as três partições válidas com os dois valores de fronteira entre elas.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Ao aplicar partição de equivalência, o que deve ser observado em relação às partições inválidas?",
        explanation:
            "As partições inválidas também devem ser testadas, e a recomendação é testá-las individualmente, ou seja, sem combiná-las com outras partições inválidas. Isso evita que uma validação mascare a outra e permite saber exatamente qual tratamento de erro funcionou ou falhou.",
        options: [
            [
                "Devem ser testadas individualmente, sem combinar duas inválidas no mesmo caso.",
                true,
            ],
            [
                "Devem ser ignoradas, já que o sistema não precisa processar valores fora da faixa aceita.",
                false,
            ],
            [
                "Devem ser combinadas em um único caso, para reduzir a quantidade total de execuções.",
                false,
            ],
            [
                "Devem ser testadas apenas quando existir requisito explícito descrevendo cada mensagem.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Um sistema concede frete grátis para compras a partir de R$ 200,00. Aplicando análise de valor limite de dois valores, quais valores devem ser testados nessa fronteira?",
        explanation:
            "A análise de valor limite de dois valores usa, para cada fronteira, o valor da fronteira e o vizinho mais próximo do outro lado. Com a regra de aceitar a partir de 200, os valores de teste são 199,99 e 200,00. A variante de três valores acrescentaria 200,01, o vizinho do mesmo lado da fronteira.",
        options: [
            ["199,99 e 200,00.", true],
            [
                "199,99, 200,00 e 200,01, cobrindo os dois vizinhos e o próprio valor da fronteira.",
                false,
            ],
            [
                "200,00 e 200,01, porque o interesse está no comportamento a partir do valor da regra.",
                false,
            ],
            [
                "100,00 e 300,00, valores claramente abaixo e acima do limite definido pela regra.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Por que a análise de valor limite é aplicada preferencialmente sobre partições ordenadas e numéricas?",
        explanation:
            "A análise de valor limite só pode ser usada quando a partição é ordenada e consiste em dados numéricos ou sequenciais, porque os valores mínimo e máximo de uma partição precisam existir e ser identificáveis. Sem ordem não há fronteira definida, e a técnica perde sentido.",
        options: [
            ["Porque os valores mínimo e máximo precisam ser identificáveis na partição.", true],
            [
                "Porque valores numéricos são processados mais rapidamente pelo sistema em teste.",
                false,
            ],
            [
                "Porque partições não numéricas já são cobertas pela técnica de tabela de decisão.",
                false,
            ],
            [
                "Porque a técnica exige que a base de teste descreva os limites de forma explícita.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement: "Qual é a relação entre partição de equivalência e análise de valor limite?",
        explanation:
            "A análise de valor limite é uma extensão da partição de equivalência, aplicável quando a partição é ordenada e numérica. Ela se baseia na observação de que defeitos tendem a se concentrar próximo aos valores extremos das partições, e por isso os limites recebem atenção especial depois que as partições foram identificadas.",
        options: [
            [
                "A análise de valor limite estende a partição, focando nos extremos das partições.",
                true,
            ],
            [
                "São técnicas independentes, aplicadas a tipos completamente diferentes de requisito.",
                false,
            ],
            [
                "A partição de equivalência estende a análise de valor limite para dados não numéricos.",
                false,
            ],
            [
                "A análise de valor limite substitui a partição quando existem muitas faixas na regra.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Um sistema tem uma regra com três condições independentes de sim ou não. Qual é a quantidade máxima de colunas de uma tabela de decisão completa antes de qualquer simplificação?",
        explanation:
            "Numa tabela de decisão completa, cada coluna representa uma combinação única das condições. Com três condições binárias, o total é dois elevado a três, ou seja, oito combinações. Colunas impossíveis podem ser eliminadas e condições irrelevantes podem ser marcadas como indiferentes, o que reduz a tabela.",
        options: [
            ["Oito.", true],
            [
                "Seis, resultado da multiplicação entre o número de condições e os valores possíveis.",
                false,
            ],
            [
                "Três, uma coluna para cada condição que participa da regra descrita no requisito.",
                false,
            ],
            [
                "Nove, resultado de elevar ao quadrado o número de condições existentes na regra.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement: "Qual é o principal benefício da tabela de decisão como técnica de teste?",
        explanation:
            "A tabela de decisão dá uma forma sistemática de registrar combinações complexas de regras de negócio, com a vantagem de expor todas as combinações, inclusive aquelas que a especificação deixou de descrever. Isso ajuda a encontrar lacunas no requisito antes que virem defeitos no código.",
        options: [
            ["Expor todas as combinações, inclusive as que o requisito não descreveu.", true],
            [
                "Reduzir a quantidade de casos necessários em relação à partição de equivalência.",
                false,
            ],
            [
                "Permitir medir a cobertura de decisão atingida no código construído pela equipe.",
                false,
            ],
            [
                "Verificar o comportamento do sistema conforme a sequência de eventos recebidos.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement: "O que significa alcançar cobertura de 100% em teste por tabela de decisão?",
        explanation:
            "A cobertura mínima em tabela de decisão é normalmente ter ao menos um caso de teste por coluna da tabela, o que inclui as combinações de condições que foram consideradas viáveis. Cobrir apenas as regras descritas no requisito deixaria de fora justamente as combinações omitidas, que são a maior contribuição da técnica.",
        options: [
            ["Ter ao menos um caso de teste para cada coluna da tabela.", true],
            [
                "Ter ao menos um caso de teste para cada condição declarada na regra de negócio.",
                false,
            ],
            [
                "Ter ao menos um caso de teste para cada ação possível descrita na tabela construída.",
                false,
            ],
            [
                "Ter casos suficientes para exercitar todas as linhas do código que implementa a regra.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Um pedido pode estar aguardando pagamento, pago, enviado, entregue ou cancelado, e nem toda mudança entre esses estados é permitida. Qual técnica é a mais adequada para derivar os casos de teste?",
        explanation:
            "O teste de transição de estados é indicado quando o comportamento do sistema depende do estado atual e dos eventos recebidos. Ele modela estados, eventos, transições e ações, e permite derivar testes tanto para as transições válidas quanto para as inválidas, que costumam revelar defeitos importantes.",
        options: [
            ["Teste de transição de estados.", true],
            [
                "Tabela de decisão, que registra combinações de condições e as ações correspondentes.",
                false,
            ],
            [
                "Análise de valor limite, que verifica o comportamento nos extremos de cada partição.",
                false,
            ],
            [
                "Partição de equivalência, que agrupa valores processados da mesma forma pelo sistema.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "No teste de transição de estados, o que significa alcançar cobertura de todas as transições, também chamada de cobertura de nível 0 de sequência?",
        explanation:
            "A cobertura de todas as transições exige que cada transição válida do modelo seja exercitada ao menos uma vez. Cobrir apenas os estados é mais fraco, porque um estado pode ser alcançado sem que todas as transições que levam a ele tenham sido exercitadas. Cobrir sequências de transições é um critério mais forte.",
        options: [
            ["Exercitar cada transição válida do modelo pelo menos uma vez.", true],
            [
                "Visitar cada estado do modelo pelo menos uma vez durante a bateria de testes executada.",
                false,
            ],
            [
                "Exercitar todas as sequências possíveis de duas transições consecutivas do modelo criado.",
                false,
            ],
            [
                "Exercitar todas as transições inválidas, verificando que o sistema as recusa corretamente.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement: "Por que testar transições inválidas costuma ser valioso?",
        explanation:
            "Testar transições inválidas verifica se o sistema recusa corretamente eventos que não deveriam ser aceitos naquele estado. Muitos defeitos nascem exatamente de transições que deveriam ser impossíveis e não foram bloqueadas, permitindo que o sistema entre em estados inconsistentes.",
        options: [
            ["Porque transições impossíveis muitas vezes não foram bloqueadas no sistema.", true],
            [
                "Porque elas acontecem com mais frequência do que as transições válidas no uso diário.",
                false,
            ],
            [
                "Porque a cobertura de todas as transições exige que as inválidas também sejam exercitadas.",
                false,
            ],
            [
                "Porque elas são mais fáceis de reproduzir do que os cenários de caminho permitido.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Considere o trecho a seguir.\n\n```\nse (saldo > 0) entao\n    liberar()\nfim\nregistrar()\n```\n\nUm único caso de teste com saldo igual a 100 é executado. Qual cobertura é atingida?",
        explanation:
            "Com saldo igual a 100 todos os comandos são executados, então a cobertura de comando é de 100%. A cobertura de decisão, porém, exige que a decisão seja avaliada como verdadeira e como falsa. Como só o caminho verdadeiro foi exercitado, a cobertura de decisão fica em 50%.",
        options: [
            ["Comando 100% e decisão 50%.", true],
            [
                "Comando 100% e decisão 100%, já que todos os comandos do trecho foram executados.",
                false,
            ],
            [
                "Comando 50% e decisão 50%, porque apenas um dos dois caminhos possíveis foi exercitado.",
                false,
            ],
            [
                "Comando 50% e decisão 100%, porque a decisão foi avaliada durante a única execução feita.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement: "O que é medido pela cobertura de comando?",
        explanation:
            "A cobertura de comando mede a porcentagem de comandos executáveis que foram exercitados por um conjunto de testes. Atingir 100% de cobertura de comando garante que todo comando foi executado ao menos uma vez, mas não garante que toda decisão foi avaliada com resultado verdadeiro e falso.",
        options: [
            ["A porcentagem de comandos executáveis exercitados pelos testes.", true],
            [
                "A porcentagem de decisões avaliadas como verdadeiras e como falsas durante a execução.",
                false,
            ],
            [
                "A porcentagem de requisitos da base de teste cobertos pelos casos que foram executados.",
                false,
            ],
            [
                "A porcentagem de caminhos possíveis percorridos no fluxo de controle do programa.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Qual afirmação sobre a relação entre cobertura de comando e cobertura de decisão está correta?",
        explanation:
            "Alcançar 100% de cobertura de decisão implica alcançar 100% de cobertura de comando, porque exercitar todos os resultados possíveis de todas as decisões necessariamente executa todos os comandos alcançáveis. O contrário não é verdadeiro: é possível executar todos os comandos sem exercitar ambos os resultados de uma decisão.",
        options: [
            ["Cobertura de decisão de 100% implica cobertura de comando de 100%.", true],
            [
                "Cobertura de comando de 100% implica cobertura de decisão de 100% no mesmo conjunto.",
                false,
            ],
            [
                "As duas coberturas são sempre iguais quando o programa não possui laços de repetição.",
                false,
            ],
            [
                "As duas coberturas são independentes e nenhuma delas implica a outra em nenhum caso.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Considere o trecho a seguir.\n\n```\nse (idade >= 18 e possuiCarteira) entao\n    aprovar()\nsenao\n    recusar()\nfim\n```\n\nQuantos casos de teste bastam para atingir 100% de cobertura de decisão?",
        explanation:
            "A cobertura de decisão exige que a decisão seja avaliada como verdadeira e como falsa, o que se consegue com dois casos: um em que a condição composta resulta verdadeira e outro em que resulta falsa. Cobrir todas as combinações das condições individuais é um critério mais forte e não é exigido pela cobertura de decisão.",
        options: [
            ["Dois.", true],
            [
                "Quatro, uma para cada combinação possível das duas condições que formam a decisão.",
                false,
            ],
            [
                "Um, desde que o caso escolhido percorra o caminho de aprovação definido pela regra.",
                false,
            ],
            [
                "Três, cobrindo o caminho verdadeiro, o falso e um valor de fronteira para a idade.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Qual é o valor específico do teste de caixa-branca em relação às técnicas de caixa-preta?",
        explanation:
            "O teste de caixa-branca considera toda a implementação do objeto de teste, o que permite descobrir defeitos mesmo quando a especificação está vaga, desatualizada ou incompleta. Ele também revela código que não é alcançado por nenhum teste derivado da especificação, algo que a caixa-preta não consegue enxergar.",
        options: [
            [
                "Encontra defeitos mesmo quando a especificação está incompleta ou desatualizada.",
                true,
            ],
            [
                "Garante que o software atende às necessidades reais das pessoas que vão utilizá-lo.",
                false,
            ],
            [
                "Substitui as técnicas de caixa-preta em sistemas com alto grau de risco operacional.",
                false,
            ],
            [
                "Permite derivar casos sem que quem testa precise conhecer a linguagem utilizada.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Uma pessoa experiente decide testar diretamente o campo de texto com aspas simples, acentos e strings muito longas, por saber que esses valores costumam causar problema. Que técnica está sendo aplicada?",
        explanation:
            "A suposição de erro é a técnica em que se usa conhecimento e experiência para antecipar erros, defeitos e falhas que possam existir. Listas de defeitos comuns e o histórico de falhas do produto alimentam a técnica, que é sistematizada quando se usa uma abordagem de ataque a defeitos.",
        options: [
            ["Suposição de erro.", true],
            [
                "Teste exploratório, em que aprendizado, modelagem e execução acontecem simultaneamente.",
                false,
            ],
            [
                "Teste baseado em checklist, com uma lista de verificações aplicada ao objeto de teste.",
                false,
            ],
            [
                "Partição de equivalência, agrupando valores tratados da mesma forma pelo sistema.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement: "O que caracteriza o teste exploratório?",
        explanation:
            "No teste exploratório, os testes são projetados, executados e avaliados ao mesmo tempo em que se aprende sobre o objeto de teste, e os resultados vão sendo usados para aprender mais e para criar os testes seguintes. Ele é mais útil quando a especificação é pobre ou inexistente e quando há forte pressão de tempo.",
        options: [
            ["Projetar, executar e avaliar ao mesmo tempo, aprendendo sobre o objeto.", true],
            [
                "Executar um conjunto de casos escritos previamente e registrar o resultado de cada passo.",
                false,
            ],
            [
                "Aplicar uma lista de verificações padronizada em cada tela nova entregue pela equipe.",
                false,
            ],
            [
                "Derivar os casos a partir de um modelo de estados construído junto com quem desenvolve.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement: "Qual mecanismo torna o teste exploratório gerenciável e auditável?",
        explanation:
            "O teste baseado em sessões torna o exploratório estruturado: o teste ocorre dentro de um intervalo de tempo definido, com uma carta de teste que traz os objetivos, e as notas de sessão registram os passos e as descobertas. Isso permite acompanhar, relatar e repetir a atividade.",
        options: [
            ["O teste baseado em sessões, com carta de teste e notas de sessão.", true],
            [
                "A escrita antecipada de casos de teste detalhados a partir da base de teste disponível.",
                false,
            ],
            [
                "A automação dos cenários descobertos durante a exploração feita pela pessoa que testa.",
                false,
            ],
            [
                "A revisão dos achados por outra pessoa da equipe antes do encerramento da atividade.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement: "Qual é o risco típico do teste baseado em checklist ao longo do tempo?",
        explanation:
            "Checklists tendem a crescer com o tempo, por causa dos defeitos encontrados que vão sendo incorporados. Isso pode gerar itens redundantes e listas grandes demais para serem úteis, e por isso elas devem ser mantidas e revisadas regularmente. Os itens também costumam ser de alto nível, o que gera variação entre execuções.",
        options: [
            ["Crescer demais e acumular itens redundantes, perdendo utilidade.", true],
            [
                "Deixar de encontrar defeitos porque os itens são específicos demais para cada tela nova.",
                false,
            ],
            [
                "Exigir conhecimento profundo do código-fonte por parte de quem executa as verificações.",
                false,
            ],
            [
                "Impedir que o teste seja repetido de forma consistente por pessoas diferentes da equipe.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Em uma sessão de escrita colaborativa de história de usuário, quem participa e por quê?",
        explanation:
            "A escrita colaborativa de histórias reúne as três perspectivas conhecidas como três amigos: o negócio, que define o problema, o desenvolvimento, que define como resolver, e o teste, que questiona o que pode dar errado e explora possibilidades. As três juntas produzem histórias mais completas e com menos ambiguidade.",
        options: [
            ["Negócio, desenvolvimento e teste, cada um com uma perspectiva distinta.", true],
            [
                "Apenas quem cuida do produto e quem desenvolve, já que a história descreve o que construir.",
                false,
            ],
            [
                "Apenas quem testa e quem cuida do produto, para garantir critérios de aceitação verificáveis.",
                false,
            ],
            [
                "Toda a organização, incluindo áreas de apoio, para garantir alinhamento entre os times.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement: "Qual é a função dos critérios de aceitação de uma história de usuário?",
        explanation:
            "Os critérios de aceitação definem as condições que devem ser atendidas para que a história seja considerada concluída, e podem ser vistos como as condições de teste que devem ser satisfeitas. Eles servem também para chegar a um entendimento comum entre negócio e equipe e para derivar os casos de teste.",
        options: [
            ["Definir as condições que precisam ser atendidas para a história ser aceita.", true],
            [
                "Descrever os passos que a pessoa usuária vai executar ao utilizar a funcionalidade nova.",
                false,
            ],
            [
                "Estimar o esforço necessário para implementar a funcionalidade descrita pela história.",
                false,
            ],
            [
                "Registrar os defeitos encontrados durante a verificação da história pela equipe de teste.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Um dos formatos comuns de critério de aceitação é o cenário estruturado com contexto, evento e resultado esperado. Qual é o outro formato citado no syllabus?",
        explanation:
            "Os dois formatos comuns são o orientado a cenário, no estilo dado, quando e então, vindo do desenvolvimento orientado a comportamento, e o orientado a regra, normalmente expresso como uma lista com marcadores ou como uma tabela de verificação. Ambos servem ao mesmo objetivo de tornar a condição verificável.",
        options: [
            ["O orientado a regra, em forma de lista ou tabela de verificação.", true],
            [
                "O orientado a código, com o teste automatizado escrito antes da implementação da história.",
                false,
            ],
            [
                "O orientado a persona, descrevendo o perfil da pessoa que vai utilizar a funcionalidade.",
                false,
            ],
            [
                "O orientado a risco, classificando cada condição por probabilidade e por impacto no negócio.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "No desenvolvimento orientado a testes de aceitação (ATDD), quando os testes de aceitação são criados?",
        explanation:
            "No ATDD, os testes de aceitação são criados antes da implementação da história, a partir dos critérios de aceitação, durante a especificação colaborativa entre as partes envolvidas. Isso permite que desenvolvimento e teste partam do mesmo entendimento e que a história já nasça com a verificação definida.",
        options: [
            ["Antes da implementação, a partir dos critérios acordados em conjunto.", true],
            [
                "Depois da implementação, quando a funcionalidade já pode ser executada pela equipe.",
                false,
            ],
            [
                "Durante o teste de aceitação do usuário, junto de quem vai operar o sistema no dia a dia.",
                false,
            ],
            [
                "Ao final da iteração, para confirmar que todas as histórias planejadas foram concluídas.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Ao derivar casos de teste no ATDD, além do caminho positivo, o que deve ser considerado?",
        explanation:
            "No ATDD, os testes costumam ser criados primeiro para o caminho mais provável, ou caminho feliz, e depois para os casos negativos e para requisitos não funcionais, como usabilidade e desempenho. Cobrir apenas o caminho positivo deixaria de fora justamente onde os defeitos mais aparecem.",
        options: [
            ["Casos negativos e requisitos não funcionais, como usabilidade e desempenho.", true],
            [
                "A cobertura de comando e de decisão atingida pelo código que implementa a história.",
                false,
            ],
            [
                "As transições inválidas do modelo de estados construído para a funcionalidade descrita.",
                false,
            ],
            [
                "A prioridade e a severidade dos defeitos que possam vir a ser encontrados na execução.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement:
            "Um analista precisa testar um formulário com um campo numérico de faixa ampla, um campo de seleção com poucas opções e uma regra que combina os dois. Qual combinação de técnicas é a mais adequada?",
        explanation:
            "O campo numérico de faixa ampla pede partição de equivalência com análise de valor limite nas fronteiras. A regra que depende da combinação de dois campos pede tabela de decisão, que expõe as combinações e revela as que não foram especificadas. Transição de estados não se aplica, porque não há dependência do histórico.",
        options: [
            [
                "Partição com valor limite no campo numérico e tabela de decisão na regra combinada.",
                true,
            ],
            [
                "Transição de estados para os dois campos e suposição de erro para a regra combinada.",
                false,
            ],
            [
                "Somente tabela de decisão, que já cobre as faixas do campo numérico do formulário.",
                false,
            ],
            [
                "Somente análise de valor limite, aplicada aos extremos dos dois campos do formulário.",
                false,
            ],
        ],
        topic: "Análise e modelagem de teste",
    },
    {
        statement: "Qual das informações abaixo faz parte do conteúdo típico de um plano de teste?",
        explanation:
            "O plano de teste descreve tipicamente contexto, premissas, partes interessadas, comunicação, registro de riscos, abordagem de teste, critérios de entrada e saída, orçamento e cronograma. O relatório com o resultado das execuções pertence às atividades de monitoramento e conclusão, e os defeitos encontrados vivem na ferramenta de gestão de defeitos.",
        options: [
            ["A abordagem de teste, os critérios de entrada e saída e o cronograma.", true],
            [
                "O resultado detalhado de cada caso executado durante o ciclo de teste da entrega.",
                false,
            ],
            [
                "A lista completa dos defeitos encontrados e a severidade atribuída a cada um deles.",
                false,
            ],
            [
                "O código-fonte dos scripts automatizados que a equipe vai manter durante o projeto.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Além de documentar a estratégia, qual é o benefício do próprio ato de planejar o teste?",
        explanation:
            "O planejamento serve não apenas para produzir o documento, mas para orientar o raciocínio da equipe, obrigando a lidar com os desafios relacionados a objetivos, técnicas, esforço, cronograma e riscos. Esse processo mental costuma valer tanto quanto o artefato resultante.",
        options: [
            ["Obriga a equipe a raciocinar sobre objetivos, esforço, cronograma e riscos.", true],
            [
                "Garante que o cronograma acordado no início será cumprido até o fim do projeto.",
                false,
            ],
            [
                "Elimina a necessidade de replanejar quando o escopo mudar ao longo das iterações.",
                false,
            ],
            [
                "Permite calcular com precisão a quantidade de defeitos que serão encontrados.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Em desenvolvimento iterativo, quais são os dois tipos de planejamento em que a pessoa de teste contribui?",
        explanation:
            "A pessoa de teste contribui no planejamento de release, que trata da visão do produto e do backlog, e no planejamento de iteração, que trata das histórias da iteração corrente. No release ela ajuda a escrever histórias testáveis e a definir critérios; na iteração, participa da análise detalhada, da estimativa do esforço de teste e da identificação de riscos.",
        options: [
            ["Planejamento de release e planejamento de iteração.", true],
            [
                "Planejamento estratégico e planejamento operacional definidos pela gerência da empresa.",
                false,
            ],
            [
                "Planejamento de capacidade e planejamento de infraestrutura do ambiente de execução.",
                false,
            ],
            [
                "Planejamento de contingência e planejamento de continuidade de negócio da organização.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement: "Qual das opções é um exemplo de critério de entrada para começar a testar?",
        explanation:
            "Critérios de entrada definem as pré-condições para iniciar uma atividade, como disponibilidade de recursos, testware, ambiente de teste e nível de qualidade inicial suficiente. Já critérios de saída definem quando parar, tratando de completude, cobertura, defeitos em aberto, prazo e custo.",
        options: [
            ["O ambiente de teste estar disponível e o testware necessário estar pronto.", true],
            [
                "Nenhum defeito de severidade crítica permanecer em aberto ao final da execução.",
                false,
            ],
            [
                "A cobertura planejada da base de teste ter sido alcançada pelos casos executados.",
                false,
            ],
            [
                "O orçamento previsto para a atividade de teste ter sido consumido conforme o plano.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Em desenvolvimento ágil, qual conceito costuma cumprir o papel de critério de saída?",
        explanation:
            "Em desenvolvimento ágil, a definição de pronto define os critérios de saída de uma história ou de um incremento, estabelecendo tudo que precisa estar cumprido para o trabalho ser considerado concluído. Da mesma forma, a definição de preparado costuma cumprir o papel de critério de entrada.",
        options: [
            ["A definição de pronto.", true],
            [
                "A definição de preparado, que estabelece quando uma história pode entrar na iteração.",
                false,
            ],
            [
                "O critério de aceitação de cada história escrita junto com quem cuida do produto.",
                false,
            ],
            [
                "A meta da iteração acordada pela equipe durante a reunião de planejamento do ciclo.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Uma equipe estima o esforço de teste da próxima entrega comparando com o esforço gasto em entregas anteriores de tamanho e complexidade parecidos. Que técnica de estimativa é essa?",
        explanation:
            "A estimativa baseada em rateio usa dados históricos de projetos anteriores, comparando com o esforço efetivamente gasto em trabalho semelhante. As demais opções descrevem outras técnicas: opinião de especialista, os três pontos e o planning poker, todas citadas no syllabus.",
        options: [
            ["Estimativa baseada em rateio, usando dados históricos.", true],
            [
                "Estimativa baseada em opinião de especialista, colhida com quem domina o assunto tratado.",
                false,
            ],
            [
                "Estimativa de três pontos, combinando os cenários otimista, provável e pessimista da tarefa.",
                false,
            ],
            [
                "Planning poker, em que a equipe estima em conjunto usando cartas e discutindo divergências.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Uma tarefa de teste foi estimada em 6 dias no cenário otimista, 9 no mais provável e 18 no pessimista. Usando a estimativa de três pontos, qual é o resultado?",
        explanation:
            "A fórmula da estimativa de três pontos é a soma do otimista, de quatro vezes o mais provável e do pessimista, dividida por seis. Aqui isso dá 6 mais 36 mais 18, igual a 60, dividido por 6, resultando em 10 dias. O peso maior no cenário mais provável é o que diferencia a técnica da média simples.",
        options: [
            ["10 dias.", true],
            [
                "11 dias, que é a média aritmética simples entre os três valores informados na questão.",
                false,
            ],
            [
                "9 dias, que corresponde ao cenário mais provável apontado pela pessoa que estimou.",
                false,
            ],
            [
                "12 dias, somando o cenário mais provável a um terço da diferença entre os extremos.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Qual técnica de estimativa é caracterizada por reunir a equipe para estimar em conjunto, com discussão das divergências até a convergência?",
        explanation:
            "O planning poker é uma técnica de estimativa baseada em sabedoria da multidão, em que os membros da equipe estimam usando cartas com valores, revelam ao mesmo tempo e discutem as diferenças até convergir. A discussão das divergências costuma revelar entendimentos distintos sobre o escopo.",
        options: [
            ["Planning poker.", true],
            [
                "Estimativa de três pontos, que combina cenários otimista, provável e pessimista da tarefa.",
                false,
            ],
            [
                "Estimativa baseada em rateio, que compara o trabalho novo com dados históricos anteriores.",
                false,
            ],
            [
                "Estimativa baseada em opinião de especialista, colhida individualmente com quem domina o tema.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Uma equipe decide executar primeiro os casos que cobrem as funcionalidades mais críticas para o negócio, independentemente de outros fatores. Que estratégia de priorização é essa?",
        explanation:
            "A priorização baseada em risco executa primeiro os testes que cobrem os riscos mais importantes. A priorização baseada em cobertura executa primeiro os que dão maior cobertura. A priorização por requisito segue a prioridade definida pelas partes interessadas para cada requisito. Criticidade para o negócio se encaixa como risco.",
        options: [
            ["Priorização baseada em risco.", true],
            [
                "Priorização baseada em cobertura, executando antes os casos que cobrem mais itens da base.",
                false,
            ],
            [
                "Priorização por requisito, seguindo a ordem definida pelas partes interessadas do projeto.",
                false,
            ],
            [
                "Priorização por tempo de execução, começando pelos casos mais rápidos de serem executados.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Ao definir a ordem de execução, além da prioridade, o que a equipe precisa considerar?",
        explanation:
            "Idealmente os casos são executados em ordem de prioridade, mas as dependências entre eles precisam ser consideradas: se um caso de prioridade mais alta depende de outro de prioridade mais baixa, o de menor prioridade precisa ser executado primeiro. Restrições de ambiente e de dados também influenciam a ordem.",
        options: [
            [
                "As dependências entre casos, que podem obrigar a executar um de menor prioridade antes.",
                true,
            ],
            [
                "A quantidade de defeitos que cada caso encontrou nas execuções anteriores da mesma suíte.",
                false,
            ],
            [
                "A ordem em que os casos foram escritos durante a atividade de modelagem de teste.",
                false,
            ],
            [
                "A preferência de quem vai executar, para manter a produtividade da pessoa ao longo do dia.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement: "O que a pirâmide de testes representa?",
        explanation:
            "A pirâmide de testes mostra que testes de diferentes granularidades devem existir em quantidades diferentes: quanto mais baixo o nível, mais isolados, rápidos e numerosos; quanto mais alto, mais integrados, lentos e em menor quantidade. O modelo orienta a distribuição do esforço de automação entre os níveis.",
        options: [
            ["Que testes de granularidade menor devem ser mais numerosos que os de maior.", true],
            [
                "Que os testes devem ser executados na ordem de baixo para cima ao longo do ciclo de vida.",
                false,
            ],
            [
                "Que cada nível de teste deve ser responsabilidade de um papel diferente da equipe.",
                false,
            ],
            [
                "Que a cobertura de código aumenta conforme se sobe pelos níveis de teste do sistema.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Os quadrantes de teste agrupam os níveis e tipos de teste segundo quais dois eixos?",
        explanation:
            "Os quadrantes de teste agrupam os testes conforme a atividade ser voltada ao negócio ou à tecnologia, e conforme apoiar a equipe (guiar o desenvolvimento) ou criticar o produto (avaliar o que foi construído). Esse modelo ajuda a garantir que todos os tipos e níveis relevantes estejam contemplados.",
        options: [
            ["Voltado ao negócio ou à tecnologia, e apoiar a equipe ou criticar o produto.", true],
            [
                "Funcional ou não funcional, e manual ou automatizado, conforme a natureza da verificação.",
                false,
            ],
            [
                "Caixa-preta ou caixa-branca, e estático ou dinâmico, conforme a técnica que foi aplicada.",
                false,
            ],
            [
                "Componente ou sistema, e interno ou externo, conforme o alcance de cada nível de teste.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement: "Como o risco é definido no contexto de teste?",
        explanation:
            "Risco é um fator que pode resultar em consequências futuras negativas, e seu nível é determinado pela combinação de dois fatores: a probabilidade de o evento acontecer e o impacto, ou seja, o dano provocado caso ele aconteça. Essa combinação é a base da abordagem de teste baseada em risco.",
        options: [
            ["A combinação entre a probabilidade do evento e o impacto que ele causaria.", true],
            [
                "A quantidade de defeitos encontrados em uma área do sistema nas entregas anteriores.",
                false,
            ],
            [
                "A diferença entre o prazo planejado para a entrega e o prazo efetivamente necessário.",
                false,
            ],
            [
                "O custo estimado para corrigir os defeitos que ainda permanecem abertos na entrega.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Qual das situações abaixo é um exemplo de risco de projeto, e não de risco de produto?",
        explanation:
            "Riscos de projeto se relacionam à gestão e ao controle do projeto, incluindo questões organizacionais, de pessoas, técnicas e de fornecedores, como atraso na entrega do ambiente. Riscos de produto se relacionam a características de qualidade do produto, como cálculo incorreto, falha de desempenho ou vazamento de dados.",
        options: [
            [
                "O ambiente de teste não ficar pronto na data combinada com a equipe de infraestrutura.",
                true,
            ],
            [
                "O cálculo de juros produzir um valor incorreto para determinada faixa de contratos.",
                false,
            ],
            [
                "O sistema não suportar o volume de acessos previsto para o período de maior movimento.",
                false,
            ],
            [
                "Dados pessoais de clientes serem expostos por uma falha no controle de acesso da aplicação.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Em uma abordagem de teste baseada em risco, o que a análise de risco de produto determina?",
        explanation:
            "A análise de risco de produto identifica e avalia os riscos, determinando o nível de cada um pela probabilidade e pelo impacto. O resultado orienta o escopo, a extensão e a profundidade do teste, indicando o que testar primeiro, com qual intensidade, e o que pode receber menos esforço.",
        options: [
            ["O escopo, a extensão e a profundidade do teste para cada área do produto.", true],
            [
                "A quantidade exata de defeitos que serão encontrados em cada área analisada do sistema.",
                false,
            ],
            [
                "A severidade e a prioridade que serão atribuídas aos defeitos durante a execução.",
                false,
            ],
            [
                "Os critérios de entrada que precisam ser atendidos antes de a execução começar.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Qual das ações abaixo é um exemplo de controle de risco de produto por mitigação?",
        explanation:
            "Entre as medidas de controle de risco de produto está a mitigação, que reduz probabilidade ou impacto, por exemplo selecionando pessoas com a experiência adequada e aplicando as técnicas de teste apropriadas ao risco identificado. As demais opções descrevem aceitar, transferir e criar plano de contingência.",
        options: [
            [
                "Aplicar técnicas de teste adequadas e alocar pessoas com a experiência necessária.",
                true,
            ],
            [
                "Decidir conviver com o risco e seguir com a entrega, registrando a decisão tomada.",
                false,
            ],
            [
                "Contratar um seguro ou repassar a responsabilidade para outra parte envolvida no projeto.",
                false,
            ],
            [
                "Preparar um plano de resposta a ser acionado caso o risco venha a se materializar.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement: "Ao longo do projeto, o que deve acontecer com a análise de risco de produto?",
        explanation:
            "A análise de risco de produto deve ser revisitada continuamente e de forma iterativa, porque riscos novos surgem, riscos existentes mudam de nível e riscos deixam de existir conforme o produto evolui. Tratá-la como atividade única do início do projeto faz o teste ficar orientado por uma foto desatualizada.",
        options: [
            ["Deve ser revisitada de forma iterativa ao longo de todo o projeto.", true],
            [
                "Deve ser congelada após a aprovação do plano, para manter a estabilidade do escopo.",
                false,
            ],
            [
                "Deve ser refeita apenas quando um defeito de severidade crítica for encontrado.",
                false,
            ],
            [
                "Deve ser transferida para a equipe de desenvolvimento após o início da construção.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement: "Qual das métricas abaixo é uma métrica de progresso de teste?",
        explanation:
            "Métricas comuns de teste incluem progresso de casos preparados e executados, densidade de defeitos, defeitos encontrados e corrigidos, cobertura de requisitos, código ou risco, e métricas de custo. A porcentagem de casos executados mede diretamente o progresso da atividade de execução.",
        options: [
            ["A porcentagem de casos de teste planejados que já foram executados.", true],
            [
                "A quantidade de pessoas alocadas na equipe de teste durante o período analisado.",
                false,
            ],
            [
                "O número de reuniões de alinhamento realizadas ao longo da iteração corrente.",
                false,
            ],
            [
                "A quantidade de linhas de código escritas pela equipe de desenvolvimento na entrega.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Qual é o propósito de um relatório de progresso de teste, em contraste com o relatório de conclusão?",
        explanation:
            "O relatório de progresso de teste apoia o controle contínuo do teste, sendo emitido periodicamente durante a atividade, com o status do período, os impedimentos e o que está planejado para o período seguinte. O relatório de conclusão resume um ciclo encerrado, avaliando se os critérios de saída foram atingidos.",
        options: [
            ["Apoiar o controle contínuo, informando o status e os impedimentos do período.", true],
            [
                "Resumir o ciclo encerrado e avaliar se os critérios de saída foram atingidos ao final.",
                false,
            ],
            [
                "Registrar cada defeito encontrado com passos de reprodução e evidências anexadas.",
                false,
            ],
            [
                "Documentar a abordagem, o escopo e o cronograma acordados no início da atividade.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Ao comunicar o status do teste, o que deve orientar o conteúdo e o formato do relatório?",
        explanation:
            "O conteúdo do relatório varia conforme o público, o projeto e o contexto organizacional, e a comunicação deve ser adaptada a quem vai recebê-la. Um relatório para a equipe traz detalhe técnico; um relatório para a gerência ou para o cliente traz resumo, risco residual e recomendação.",
        options: [
            ["O público a quem o relatório se destina e o contexto do projeto.", true],
            [
                "O padrão definido pela norma adotada, que deve ser seguido igual em todos os casos.",
                false,
            ],
            [
                "A quantidade de defeitos encontrados no período que está sendo reportado pela equipe.",
                false,
            ],
            [
                "A preferência pessoal de quem escreve o relatório sobre nível de detalhe e formato.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement: "Qual é o papel da gestão de configuração no contexto do teste?",
        explanation:
            "A gestão de configuração garante a integridade do objeto de teste e do testware, mantendo tudo identificado de forma única, versionado e rastreável, de modo que a pessoa que testa saiba exatamente qual versão está testando e possa reproduzir os resultados. Sem ela, resultados deixam de ser confiáveis e reproduzíveis.",
        options: [
            ["Garantir que objeto de teste e testware sejam versionados e rastreáveis.", true],
            [
                "Definir os critérios de entrada e de saída que a atividade de teste precisa cumprir antes.",
                false,
            ],
            [
                "Priorizar os casos de teste conforme o risco de cada área do produto construído.",
                false,
            ],
            [
                "Registrar os defeitos encontrados e acompanhar o ciclo de vida de cada um deles.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement:
            "Qual é o objetivo principal do relatório de defeito, além de registrar o problema?",
        explanation:
            "O relatório de defeito visa dar a quem for corrigir informação suficiente para resolver o problema, permitir acompanhar a qualidade do produto e apoiar a melhoria do processo de desenvolvimento. Ele inclui identificador, título, data, versão, passos de reprodução, resultados esperado e obtido, e status.",
        options: [
            ["Dar informação suficiente para a correção e apoiar a melhoria do processo.", true],
            [
                "Registrar formalmente a responsabilidade de quem introduziu o defeito no código.",
                false,
            ],
            [
                "Determinar se a entrega pode ou não ser liberada para o ambiente de produção.",
                false,
            ],
            [
                "Medir a produtividade da equipe de teste ao longo do ciclo de desenvolvimento.",
                false,
            ],
        ],
        topic: "Gestão das atividades de teste",
    },
    {
        statement: "Qual das opções descreve corretamente um tipo de ferramenta de apoio ao teste?",
        explanation:
            "As ferramentas apoiam várias atividades: gestão de teste e requisitos, gestão de defeitos, gestão de configuração, análise estática, modelagem e implementação de teste, execução e comparação, cobertura, teste de desempenho e apoio a necessidades específicas como acessibilidade. Ferramentas de análise estática apoiam o teste estático, sem executar o software.",
        options: [
            ["Ferramentas de análise estática, que examinam o código sem executá-lo.", true],
            [
                "Ferramentas de compilação, que traduzem o código-fonte em um executável para o sistema.",
                false,
            ],
            [
                "Ferramentas de edição de texto usadas para escrever a documentação do projeto entregue.",
                false,
            ],
            [
                "Ferramentas de comunicação por mensagem instantânea usadas pela equipe no dia a dia.",
                false,
            ],
        ],
        topic: "Ferramentas de teste",
    },
    {
        statement: "Qual é um benefício típico da automação de teste?",
        explanation:
            "Entre os benefícios estão economia de tempo com a redução do trabalho manual repetitivo, prevenção de erros humanos simples por maior consistência e repetibilidade, cobertura mais objetiva de aspectos como cobertura de código, e acesso a informação sobre o teste que seria difícil obter manualmente.",
        options: [
            ["Reduzir o trabalho manual repetitivo e aumentar a consistência da execução.", true],
            [
                "Eliminar a necessidade de teste exploratório em produtos com alta taxa de mudança.",
                false,
            ],
            [
                "Garantir que nenhum defeito chegará ao ambiente de produção depois da implantação.",
                false,
            ],
            [
                "Reduzir o custo total do teste desde a primeira execução da suíte automatizada criada.",
                false,
            ],
        ],
        topic: "Ferramentas de teste",
    },
    {
        statement: "Qual é um risco típico da automação de teste?",
        explanation:
            "Entre os riscos estão expectativas irreais sobre o que a ferramenta pode entregar, subestimar o tempo e o esforço necessários para obter benefícios significativos, subestimar o esforço de manter os ativos de teste, e a dependência excessiva da ferramenta em detrimento do raciocínio humano no teste.",
        options: [
            [
                "Subestimar o esforço necessário para manter os ativos de teste ao longo do tempo.",
                true,
            ],
            [
                "Reduzir a consistência da execução em comparação com a execução feita manualmente.",
                false,
            ],
            [
                "Impedir a coleta de métricas objetivas sobre a cobertura atingida pela bateria de testes.",
                false,
            ],
            [
                "Aumentar a quantidade de trabalho manual repetitivo executado pela equipe de qualidade.",
                false,
            ],
        ],
        topic: "Ferramentas de teste",
    },
    {
        statement: "Antes de adotar uma ferramenta de teste em escala, o que o syllabus recomenda?",
        explanation:
            "A recomendação é avaliar a ferramenta no contexto real antes de adotar em escala, considerando maturidade da organização, pontos fortes e fracos, e o retorno esperado. Uma prova de conceito ou projeto piloto permite verificar se a ferramenta funciona com o software e a infraestrutura existentes e o que precisa mudar.",
        options: [
            ["Fazer uma prova de conceito ou projeto piloto no contexto real.", true],
            [
                "Adquirir a licença completa antes, para que a equipe possa explorar todos os recursos.",
                false,
            ],
            [
                "Automatizar toda a suíte de regressão manual existente já no primeiro ciclo de uso.",
                false,
            ],
            [
                "Padronizar a ferramenta em toda a organização para garantir consistência entre os times.",
                false,
            ],
        ],
        topic: "Ferramentas de teste",
    },
    {
        statement:
            "Qual afirmação sobre a relação entre ferramentas e o processo de teste está correta?",
        explanation:
            "Uma ferramenta não corrige um processo ruim, e adotar automação sobre um processo desorganizado tende a amplificar os problemas em vez de resolvê-los. O syllabus destaca que o sucesso depende de fatores como maturidade organizacional, adequação ao contexto e esforço de manutenção, não apenas da capacidade técnica da ferramenta.",
        options: [
            ["Uma ferramenta não corrige um processo de teste mal definido.", true],
            [
                "Uma ferramenta adequada compensa a ausência de estratégia de teste na equipe.",
                false,
            ],
            [
                "A adoção de ferramentas reduz a necessidade de treinar as pessoas que vão utilizá-las.",
                false,
            ],
            [
                "Ferramentas de execução substituem as técnicas de projeto de caso de teste aplicadas.",
                false,
            ],
        ],
        topic: "Ferramentas de teste",
    },
];

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "ISTQB Certified Tester Foundation Level (CTFL)",
                provider: "istqb",
                code: "CTFL",
                level: "Foundation",
                description:
                    "Simulado no formato da prova CTFL v4.0 da ISTQB: 40 questoes, 60 minutos, corte de 65%.",
                durationMinutes: 60,
                questionCount: 40,
                passPercent: 65,
                published: true,
            })
            .returning();
        console.log("Simulado criado: " + simulado.slug);
    }
    await db
        .update(simulados)
        .set({ provider: "istqb", code: "CTFL", level: "Foundation" })
        .where(eq(simulados.id, simulado.id));

    const [{ n }] = await db
        .select({ n: count() })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id));
    const jaExistem = new Set(
        (
            await db
                .select({ statement: simuladoQuestions.statement })
                .from(simuladoQuestions)
                .where(eq(simuladoQuestions.simuladoId, simulado.id))
        ).map((r) => r.statement),
    );
    const inseridas = QUESTOES.filter((q) => !jaExistem.has(q.statement)).length;
    if (inseridas === 0) {
        console.log("Simulado ja tem " + n + " questoes, nada a fazer.");
        return;
    }

    for (const q of QUESTOES) {
        if (jaExistem.has(q.statement)) continue;
        const [questao] = await db
            .insert(simuladoQuestions)
            .values({
                simuladoId: simulado.id,
                statement: q.statement,
                explanation: q.explanation,
                topic: q.topic,
            })
            .returning();
        await db.insert(simuladoOptions).values(
            q.options.map(([text, isCorrect], idx) => ({
                questionId: questao.id,
                text,
                isCorrect,
                position: idx + 1,
            })),
        );
    }
    console.log(
        "Seed: " + inseridas + " questoes novas inseridas (" + QUESTOES.length + " no banco).",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
