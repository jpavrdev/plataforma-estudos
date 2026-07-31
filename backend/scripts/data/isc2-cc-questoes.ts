// Banco de questões do simulado ISC2 Certified in Cybersecurity (CC).
// Compartilhado pelo seed (instalação nova) e pelo script de atualização
// (instalação que já tem o simulado). Regras do banco: distratores da mesma
// categoria da resposta e a correta não pode ser a única opção mais longa,
// nem a única mais curta por folga visível. A prova CC real é toda de
// resposta única, então o banco não tem questões DUAS.

export type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

export const QUESTOES: Questao[] = [
    {
        statement:
            "Um hospital armazena prontuários eletrônicos de pacientes em um servidor. Para impedir que pessoas não autorizadas leiam esses dados, mesmo que consigam acesso físico ao disco rígido, a equipe de TI aplica criptografia nos arquivos. Qual princípio da tríade CIA essa medida protege prioritariamente?",
        explanation:
            "A criptografia de dados em repouso impede que pessoas não autorizadas leiam a informação, protegendo a confidencialidade, pilar da tríade CIA voltado a impedir acesso e divulgação indevidos. Integridade trata da exatidão dos dados, não de quem pode lê-los, disponibilidade trata do acesso pelos usuários autorizados no momento necessário, e não repúdio não faz parte da tríade CIA, sendo um conceito relacionado a garantir que uma ação não possa ser negada por quem a praticou.",
        topic: "Princípios de Segurança",
        options: [
            ["Confidencialidade", true],
            ["Integridade", false],
            ["Disponibilidade", false],
            ["Não repúdio", false],
        ],
    },
    {
        statement:
            "Durante a transferência de um arquivo crítico entre dois servidores, a equipe de segurança calcula um hash do arquivo antes do envio e compara com o hash calculado após o recebimento. Se os valores forem diferentes, o arquivo foi corrompido ou alterado no caminho. Essa prática protege principalmente qual pilar da tríade CIA?",
        explanation:
            "O hash permite detectar qualquer alteração não autorizada no conteúdo do arquivo, o que protege a integridade, isto é, a garantia de que a informação permanece exata e completa. Confidencialidade diz respeito a impedir leitura por quem não deveria ter acesso, disponibilidade trata do acesso no momento necessário, e autenticidade, embora relacionada, não é um dos três pilares da tríade CIA cobrados no exame CC.",
        topic: "Princípios de Segurança",
        options: [
            ["Integridade", true],
            ["Confidencialidade", false],
            ["Disponibilidade", false],
            ["Autenticidade", false],
        ],
    },
    {
        statement:
            "Uma empresa de comércio eletrônico investe em servidores redundantes, geradores de energia de backup e um plano de mitigação contra ataques de negação de serviço para garantir que o site continue funcionando mesmo diante de falhas ou ataques. Essas medidas têm como foco principal qual pilar da tríade CIA?",
        explanation:
            "Redundância, energia de backup e mitigação de ataques de negação de serviço existem para manter o sistema acessível aos usuários autorizados quando eles precisarem, o que é a definição de disponibilidade. Confidencialidade e integridade tratam de quem pode ler e da exatidão dos dados, respectivamente, e privacidade é um conceito distinto voltado ao tratamento adequado de dados pessoais, não à continuidade do serviço.",
        topic: "Princípios de Segurança",
        options: [
            ["Disponibilidade", true],
            ["Confidencialidade", false],
            ["Integridade", false],
            ["Privacidade", false],
        ],
    },
    {
        statement:
            "Ao fazer login em um sistema, um funcionário digita seu nome de usuário e uma senha que só ele deveria conhecer. Essa senha representa qual fator de autenticação?",
        explanation:
            "Senha é conhecimento memorizado pelo usuário, por isso se enquadra na categoria algo que você sabe. O fator algo que você tem refere-se a um objeto físico, como um token ou cartão inteligente. O fator algo que você é refere-se a características biométricas, como impressão digital. Algo que você faz não é um dos três fatores de autenticação reconhecidos pelo exame CC.",
        topic: "Princípios de Segurança",
        options: [
            ["Algo que você sabe", true],
            ["Algo que você tem", false],
            ["Algo que você é", false],
            ["Algo que você faz", false],
        ],
    },
    {
        statement:
            "Para acessar o sistema financeiro da empresa, além da senha, o analista precisa inserir um código gerado a cada 30 segundos por um aplicativo instalado em seu celular pessoal. Esse código representa qual fator de autenticação?",
        explanation:
            "O código gerado por um aplicativo autenticador depende da posse de um dispositivo físico específico, o celular com o app instalado, caracterizando o fator algo que você tem. O fator algo que você sabe seria a senha memorizada, algo que você é seria uma característica biométrica, e localização geográfica não é um dos três fatores de autenticação clássicos cobrados no exame CC.",
        topic: "Princípios de Segurança",
        options: [
            ["Algo que você tem", true],
            ["Algo que você sabe", false],
            ["Algo que você é", false],
            ["Algo relacionado à sua localização geográfica", false],
        ],
    },
    {
        statement:
            "Um smartphone permite que o proprietário desbloqueie a tela apenas apontando a câmera para o próprio rosto. Esse mecanismo de autenticação se baseia em qual fator?",
        explanation:
            "O reconhecimento facial usa uma característica física do próprio usuário, o que caracteriza o fator algo que você é, também chamado de biometria. Algo que você tem envolve a posse de um objeto físico, algo que você sabe envolve conhecimento memorizado, e algo que você faz não integra os três fatores clássicos de autenticação do exame CC.",
        topic: "Princípios de Segurança",
        options: [
            ["Algo que você é", true],
            ["Algo que você tem", false],
            ["Algo que você sabe", false],
            ["Algo que você faz", false],
        ],
    },
    {
        statement:
            "Um funcionário teve a senha do e-mail corporativo descoberta em um vazamento de dados de outro site, já que reutilizava a mesma senha em vários lugares. Mesmo assim, o invasor não conseguiu acessar a conta porque o sistema exigiu também um código enviado por aplicativo autenticador. Esse cenário demonstra o principal benefício de qual prática de segurança?",
        explanation:
            "A autenticação multifator combina dois ou mais fatores diferentes, de forma que o comprometimento de um único fator, como a senha, não seja suficiente para o invasor acessar a conta. Criptografia de disco protege dados armazenados, segregação de funções divide responsabilidades entre pessoas para evitar fraude interna, e classificação de dados organiza informações por nível de sensibilidade, nenhuma dessas medidas evitaria o acesso nesse cenário específico.",
        topic: "Princípios de Segurança",
        options: [
            ["Autenticação multifator (MFA)", true],
            ["Criptografia de disco completo", false],
            ["Segregação de funções", false],
            ["Classificação de dados", false],
        ],
    },
    {
        statement:
            "Uma empresa implementa assinatura digital em contratos eletrônicos, de forma que, uma vez assinado, o signatário não possa alegar posteriormente que não realizou aquela assinatura. Esse controle está associado a qual conceito de segurança?",
        explanation:
            "Não repúdio é a garantia de que uma pessoa não pode negar ter realizado uma ação, como assinar um documento, geralmente comprovada por assinatura digital e registros de auditoria. Confidencialidade protege contra leitura indevida, disponibilidade garante acesso quando necessário, e privacidade trata do tratamento adequado de dados pessoais, nenhum desses conceitos trata diretamente da impossibilidade de negar uma ação.",
        topic: "Princípios de Segurança",
        options: [
            ["Não repúdio", true],
            ["Confidencialidade", false],
            ["Disponibilidade", false],
            ["Privacidade", false],
        ],
    },
    {
        statement:
            "Uma empresa trata como segredo comercial a fórmula de um produto e, separadamente, também protege os dados de CPF e endereço de seus clientes. Qual é a principal diferença entre proteger a fórmula, um caso de confidencialidade, e proteger os dados dos clientes, um caso de privacidade?",
        explanation:
            "Privacidade é um conceito focado especificamente em como dados pessoais de indivíduos são coletados, usados, armazenados e compartilhados, muitas vezes regulado por lei, como a LGPD. Confidencialidade é um princípio mais amplo da tríade CIA, aplicável a qualquer informação sensível, pessoal ou não, como uma fórmula de produto. As demais opções descrevem relações incorretas entre os conceitos ou responsabilidades que não refletem a prática de segurança.",
        topic: "Princípios de Segurança",
        options: [
            [
                "Privacidade trata do tratamento de dados pessoais; confidencialidade é mais ampla, valendo para qualquer informação sensível",
                true,
            ],
            [
                "Não existe diferença prática entre os dois conceitos, ambos significam exatamente a mesma coisa",
                false,
            ],
            [
                "Privacidade se aplica somente a informações financeiras, enquanto confidencialidade se aplica a qualquer outro tipo de dado",
                false,
            ],
            [
                "Confidencialidade é responsabilidade exclusiva do time jurídico, enquanto privacidade é responsabilidade exclusiva do time de TI",
                false,
            ],
        ],
    },
    {
        statement:
            "Um cliente envia um e-mail para uma empresa brasileira solicitando a exclusão de seus dados pessoais armazenados no sistema de marketing, alegando que não deseja mais receber comunicações. Sob a ótica da LGPD, essa solicitação representa o exercício de qual conceito?",
        explanation:
            "A LGPD garante ao titular dos dados o direito de solicitar acesso, correção ou eliminação de suas informações pessoais, e empresas que atuam no Brasil devem ter processos de governança para atender esse tipo de pedido. Não se trata de incidente de disponibilidade nem de integridade, e tratar a solicitação como engenharia social ignoraria um direito legítimo previsto em lei.",
        topic: "Princípios de Segurança",
        options: [
            ["O direito do titular dos dados sobre suas próprias informações pessoais", true],
            [
                "Uma violação de disponibilidade que deve ser tratada como incidente de segurança",
                false,
            ],
            ["Uma quebra de integridade que exige recálculo de hash nos registros", false],
            ["Uma tentativa de engenharia social que deve ser recusada por padrão", false],
        ],
    },
    {
        statement:
            "Um servidor web está rodando uma versão desatualizada de software com uma falha conhecida e ainda não corrigida. Um grupo de invasores está ativamente escaneando a internet em busca de servidores com exatamente essa falha para explorar. Como esse cenário deve ser descrito em termos de gestão de risco?",
        explanation:
            "No vocabulário do exame CC, vulnerabilidade é uma fraqueza que pode ser explorada, nesse caso a falha não corrigida, ameaça é o agente ou evento capaz de explorar essa fraqueza, nesse caso o grupo de invasores, e risco é a combinação da probabilidade de exploração com o impacto potencial ao negócio. As demais opções invertem essas definições ou tratam os termos como sinônimos, o que é tecnicamente incorreto.",
        topic: "Princípios de Segurança",
        options: [
            ["A falha não corrigida é a vulnerabilidade, o grupo de invasores é a ameaça", true],
            ["A falha não corrigida é a ameaça, e o grupo de invasores é a vulnerabilidade", false],
            ["O servidor desatualizado é o risco, e a exploração da falha é a ameaça", false],
            [
                "Ameaça, vulnerabilidade e risco são sinônimos e podem ser usados indistintamente nesse cenário",
                false,
            ],
        ],
    },
    {
        statement:
            "Antes de decidir quais medidas de segurança implementar, uma organização primeiro cataloga seus ativos e possíveis ameaças, depois analisa a probabilidade e o impacto de cada risco identificado, e só então decide como tratar cada um. Esse processo ordenado descreve qual etapa fundamental da gestão de risco?",
        explanation:
            "A gestão de risco segue uma sequência lógica: primeiro identificar ativos e ameaças, depois avaliar, analisando probabilidade e impacto, e só então decidir o tratamento adequado. Aceitação e transferência são apenas duas das possíveis formas de tratamento, não etapas iniciais do processo, e auditoria de conformidade é uma atividade de verificação distinta da avaliação de risco.",
        topic: "Princípios de Segurança",
        options: [
            [
                "Identificação e avaliação de risco, que devem ocorrer antes da decisão sobre tratamento",
                true,
            ],
            ["Aceitação de risco, que deve ser sempre a primeira etapa do processo", false],
            ["Transferência de risco, que substitui a necessidade de identificação prévia", false],
            [
                "Auditoria de conformidade, que só ocorre depois que todos os controles já foram implementados",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma pequena empresa avalia o risco de incêndio em seu escritório e decide contratar um seguro contra incêndio, em vez de investir pesadamente em sistemas de supressão automática. Qual estratégia de tratamento de risco essa decisão representa?",
        explanation:
            "Contratar um seguro transfere o impacto financeiro do risco para um terceiro, a seguradora, caracterizando a transferência de risco. Mitigação envolveria reduzir a probabilidade ou o impacto agindo diretamente sobre o risco, como instalar sistemas de supressão automática, aceitação significaria conviver com o risco sem ação adicional, e evitar o risco significaria eliminar a atividade que o gera, por exemplo encerrando a operação naquele local. Nenhuma dessas três últimas opções descreve a contratação de um seguro.",
        topic: "Princípios de Segurança",
        options: [
            ["Transferência do risco", true],
            ["Mitigação do risco", false],
            ["Aceitação do risco", false],
            ["Evitar o risco (evasão)", false],
        ],
    },
    {
        statement:
            "A diretoria de uma empresa define que está disposta a aceitar um nível moderado de risco em novos projetos de inovação, mas também estabelece limites específicos de variação aceitável para cada tipo de risco antes que uma ação corretiva se torne obrigatória. Esses dois conceitos representam, respectivamente, o quê?",
        explanation:
            "Apetite a risco é o nível geral e estratégico de risco que a organização aceita perseguir em busca de seus objetivos, enquanto tolerância a risco define os limites operacionais e específicos de variação aceitável dentro desse apetite. As demais opções invertem os conceitos, os tratam como sinônimos ou os confundem com estratégias de tratamento de risco, que são conceitos diferentes.",
        topic: "Princípios de Segurança",
        options: [
            ["Apetite a risco, o nível geral que a organização está disposta a aceitar", true],
            [
                "Tolerância a risco e, em seguida, apetite a risco, na ordem inversa da descrita",
                false,
            ],
            [
                "Ambos os conceitos descrevem exatamente a mesma coisa, apenas com nomes diferentes",
                false,
            ],
            ["Mitigação de risco e transferência de risco", false],
        ],
    },
    {
        statement:
            "Uma empresa configura uma lista de controle de acesso em seu firewall para permitir tráfego apenas de endereços IP previamente autorizados. Esse tipo de controle é classificado como qual categoria?",
        explanation:
            "Regras de firewall e listas de controle de acesso são implementadas por meio de tecnologia, o que as classifica como controles técnicos, também chamados de lógicos. Controles administrativos são políticas e procedimentos, controles físicos protegem o ambiente tangível, e controle de integridade mistura a classificação de controles por tipo com os pilares da tríade CIA, que são conceitos relacionados mas distintos: a regra de firewall é, por natureza, um controle técnico, independentemente de qual pilar da tríade ela apoia.",
        topic: "Princípios de Segurança",
        options: [
            ["Controle técnico (lógico)", true],
            ["Controle administrativo", false],
            ["Controle físico", false],
            ["Controle de integridade", false],
        ],
    },
    {
        statement:
            "Antes de contratar um novo funcionário para o setor financeiro, o RH exige a verificação de antecedentes criminais e a assinatura de um termo de confidencialidade. Esse procedimento é um exemplo de qual tipo de controle?",
        explanation:
            "Verificação de antecedentes e assinatura de termos fazem parte de políticas e procedimentos organizacionais relacionados a pessoas, o que caracteriza um controle administrativo. Controles técnicos dependem de tecnologia aplicada a sistemas, controles físicos protegem o ambiente tangível, e controle de detecção automatizada normalmente se refere a ferramentas tecnológicas de monitoramento, não a processos de RH.",
        topic: "Princípios de Segurança",
        options: [
            ["Controle administrativo", true],
            ["Controle técnico", false],
            ["Controle físico", false],
            ["Controle de detecção automatizada", false],
        ],
    },
    {
        statement:
            "Um data center exige que visitantes passem por uma catraca com leitor de crachá e depois por uma segunda porta controlada antes de ter acesso à sala de servidores, impedindo que mais de uma pessoa entre por vez com uma única credencial. Esse conjunto de medidas é um exemplo de qual tipo de controle?",
        explanation:
            "Catracas, leitores de crachá em portas físicas e câmaras de entrada controlada são barreiras tangíveis que restringem o acesso ao ambiente físico, caracterizando controles físicos. Controles administrativos são políticas e processos, controles técnicos envolvem tecnologia aplicada a sistemas e dados, e controle corretivo é uma classificação por função, usada para restaurar a normalidade após um incidente, diferente da classificação por natureza usada nesse contexto.",
        topic: "Princípios de Segurança",
        options: [
            ["Controle físico", true],
            ["Controle administrativo", false],
            ["Controle técnico", false],
            ["Controle corretivo", false],
        ],
    },
    {
        statement:
            "Um profissional certificado pela ISC2 se depara com uma situação em que cumprir uma instrução direta de seu gestor entraria em conflito com a proteção do bem comum e da infraestrutura pública. De acordo com o Código de Ética da ISC2, como esse profissional deve resolver esse conflito?",
        explanation:
            "O Código de Ética da ISC2 estabelece que os cânones devem ser seguidos em ordem de precedência quando entram em conflito, e o primeiro cânone, proteger a sociedade, o bem comum, a confiança pública e a infraestrutura, tem prioridade sobre interesses organizacionais internos. Priorizar cegamente a instrução do gestor, ignorar o código ou simplesmente se omitir sem buscar orientação contrariam o compromisso ético esperado de um profissional certificado.",
        topic: "Princípios de Segurança",
        options: [
            [
                "Seguindo a ordem de precedência dos cânones: a sociedade e o bem comum vêm antes de interesses internos",
                true,
            ],
            [
                "Sempre priorizando a instrução do gestor, já que a hierarquia organizacional está acima do Código de Ética",
                false,
            ],
            [
                "Ignorando o Código de Ética nesse caso, pois ele só se aplica a situações técnicas, não a decisões de gestão",
                false,
            ],
            [
                "Recusando-se a agir e mantendo sigilo absoluto sobre o conflito, sem buscar orientação",
                false,
            ],
        ],
    },
    {
        statement:
            "Um profissional de segurança descobre uma vulnerabilidade grave em um sistema que, se explorada, poderia afetar a infraestrutura crítica de fornecimento de energia de uma região. Qual cânone do Código de Ética da ISC2 orienta diretamente a conduta esperada nesse caso?",
        explanation:
            "O primeiro cânone do Código de Ética da ISC2 trata diretamente da proteção da sociedade, do bem comum, da confiança pública e da infraestrutura, o que se aplica diretamente a um cenário envolvendo infraestrutura crítica de energia. Os demais cânones também são válidos e fazem parte do código, mas tratam de conduta pessoal, qualidade do serviço prestado e valorização da profissão, sendo menos diretamente relacionados à proteção da infraestrutura nesse cenário específico.",
        topic: "Princípios de Segurança",
        options: [
            [
                "Proteger a sociedade, o bem comum, a confiança pública necessária e a infraestrutura",
                true,
            ],
            [
                "Agir de forma honrosa, honesta, justa, responsável e legal em qualquer circunstância",
                false,
            ],
            ["Prestar serviço diligente e competente aos protegidos", false],
            ["Avançar e proteger a profissão", false],
        ],
    },
    {
        statement:
            "Durante uma entrevista de emprego, um candidato já certificado pela ISC2 exagera suas certificações e sua experiência para parecer mais qualificado do que realmente é. Essa atitude estaria em desacordo com qual cânone do Código de Ética?",
        explanation:
            "Exagerar qualificações é um ato de desonestidade pessoal, o que viola diretamente o cânone que exige agir de forma honrosa, honesta, justa, responsável e legal. Os outros cânones tratam de proteção da sociedade e da infraestrutura, qualidade técnica do serviço prestado e valorização da profissão como um todo, temas relacionados mas que não descrevem especificamente o ato de mentir sobre as próprias credenciais.",
        topic: "Princípios de Segurança",
        options: [
            ["Agir de forma honrosa, honesta, justa, responsável e legal", true],
            [
                "Proteger a sociedade, o bem comum, a confiança pública necessária e a infraestrutura",
                false,
            ],
            ["Prestar serviço diligente e competente aos protegidos", false],
            ["Avançar e proteger a profissão", false],
        ],
    },
    {
        statement:
            "A empresa publica um documento de alto nível assinado pela diretoria estabelecendo que todos os dados de clientes devem ser protegidos contra acesso não autorizado, e um segundo documento detalhando que senhas devem ter no mínimo 12 caracteres, incluindo letras, números e símbolos. Esses dois documentos representam, respectivamente, quais elementos da governança de segurança?",
        explanation:
            "Política é a diretriz geral e de alto nível que define a intenção da organização, enquanto padrão especifica requisitos obrigatórios e mensuráveis para cumprir essa política, como o tamanho mínimo de senha. Procedimento seria o passo a passo de como executar uma tarefa, diretriz seria uma recomendação não obrigatória, e lei ou regulamento são exigências externas impostas por um governo, não documentos internos da organização.",
        topic: "Princípios de Segurança",
        options: [
            [
                "Política, a diretriz geral de alto nível, e padrão, a exigência específica e obrigatória",
                true,
            ],
            ["Procedimento e diretriz, nessa ordem", false],
            ["Lei e regulamento, nessa ordem", false],
            [
                "Ambos os documentos são exemplos de políticas, apenas com níveis diferentes de detalhe",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa brasileira que também atende clientes na União Europeia precisa cumprir simultaneamente a LGPD e o GDPR, mesmo que suas próprias políticas internas de privacidade sejam mais permissivas. Isso ilustra qual característica das leis e regulamentos dentro da estrutura de governança de segurança?",
        explanation:
            "Leis e regulamentos, como a LGPD e o GDPR, são impostos por governos ou blocos regulatórios externos à organização e devem ser cumpridos independentemente do que dizem as políticas internas, que precisam se adequar a eles e não o contrário. As demais opções descrevem incorretamente leis como algo opcional, dispensável ou de origem interna, o que não corresponde à realidade da governança de segurança.",
        topic: "Princípios de Segurança",
        options: [
            [
                "Leis e regulamentos são exigências externas e obrigatórias que prevalecem sobre políticas internas da organização",
                true,
            ],
            [
                "Leis e regulamentos podem ser ignorados sempre que a política interna da organização for mais recente que eles",
                false,
            ],
            [
                "Leis e regulamentos têm o mesmo peso que diretrizes internas e podem ser tratados como opcionais",
                false,
            ],
            [
                "Leis e regulamentos são criados pela própria empresa para uso exclusivamente interno",
                false,
            ],
        ],
    },
    {
        statement:
            "Um sistema de segurança percebe que um usuário, que normalmente faz login a partir de São Paulo em horário comercial, tentou acessar a conta às 3 da manhã a partir de um país diferente, usando um dispositivo nunca antes registrado. O sistema automaticamente bloqueia o acesso e solicita verificação adicional. Essa capacidade é um exemplo do uso de qual tecnologia na autenticação?",
        explanation:
            "Sistemas modernos usam inteligência artificial para aprender o padrão normal de comportamento de um usuário, como local, horário e dispositivo, e identificar automaticamente desvios que indicam possível comprometimento da conta, solicitando verificação adicional. Criptografia simétrica protege dados em trânsito ou em repouso, segregação de funções divide responsabilidades entre pessoas, e controle físico de perímetro protege o ambiente tangível, nenhum desses conceitos explica a detecção automática de comportamento anômalo de login.",
        topic: "Princípios de Segurança",
        options: [
            ["Inteligência artificial aplicada à análise comportamental de logins", true],
            ["Criptografia simétrica aplicada ao tráfego de rede", false],
            ["Segregação de funções aplicada ao controle de acesso dos usuários", false],
            ["Um controle físico de perímetro", false],
        ],
    },
    {
        statement:
            "Funcionários de uma empresa começaram a colar trechos de documentos internos confidenciais em uma ferramenta pública de inteligência artificial generativa para obter resumos rapidamente, sem que a empresa tivesse conhecimento ou controle sobre esse uso. Do ponto de vista de governança, qual é a ação mais adequada para reduzir esse risco?",
        explanation:
            "A governança de segurança deve acompanhar o surgimento de novas tecnologias, e criar uma política de uso aceitável de IA, comunicada e reforçada por treinamento, é a forma correta de reduzir o risco de vazamento de dados confidenciais em ferramentas públicas de IA generativa. Ignorar o risco desconsidera um problema real de exposição de dados, proibir toda a tecnologia digital é uma reação desproporcional e inviável, e transferir toda a responsabilidade ao fornecedor externo ignora o dever da organização de proteger suas próprias informações.",
        topic: "Princípios de Segurança",
        options: [
            [
                "Criar e comunicar uma política de uso aceitável de IA, definindo o que pode ser inserido em ferramentas externas",
                true,
            ],
            [
                "Ignorar a situação, já que ferramentas de IA pública não representam risco algum de vazamento de dados",
                false,
            ],
            [
                "Proibir totalmente o uso de qualquer tecnologia digital na empresa, incluindo e-mail e navegadores",
                false,
            ],
            [
                "Transferir toda a responsabilidade para o fornecedor da ferramenta de IA, sem nenhuma necessidade de ação interna",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma clínica odontológica de médio porte quer garantir que, mesmo diante de uma enchente que danifique seu escritório principal, o atendimento a pacientes e o faturamento continuem operando, ainda que de forma reduzida, em outro local. Qual conceito está mais diretamente relacionado a esse objetivo?",
        explanation:
            "A Continuidade de Negócios (BC) tem como propósito manter as funções essenciais do negócio operando durante e depois de uma interrupção, exatamente o que a clínica busca ao continuar atendendo pacientes e faturando em outro local. A Recuperação de Desastres (DR) é mais restrita: foca na restauração da infraestrutura de TI e dos sistemas técnicos, não do negócio como um todo. A Resposta a Incidentes (IR) trata da identificação e do tratamento de incidentes de segurança, o que não é o caso de uma enchente. Já a Análise de Impacto no Negócio (BIA) é uma ferramenta usada dentro do planejamento de BC para identificar processos críticos, mas não é o conceito guarda-chuva que a situação descreve.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["Continuidade de Negócios (BC)", true],
            ["Recuperação de Desastres (DR)", false],
            ["Resposta a Incidentes (IR)", false],
            ["Análise de Impacto no Negócio (BIA)", false],
        ],
    },
    {
        statement:
            "Durante o planejamento de continuidade de negócios de uma empresa de comércio eletrônico, a equipe responsável precisa identificar quais processos são mais críticos, como o processamento de pagamentos, e estimar o impacto financeiro e operacional caso cada um fique indisponível por diferentes períodos de tempo. Essa atividade corresponde a:",
        explanation:
            "A Análise de Impacto no Negócio (BIA) é exatamente o processo de identificar os processos críticos e medir o impacto de sua indisponibilidade ao longo do tempo, servindo de base para definir prioridades de recuperação, incluindo RTO e RPO. O Plano de Recuperação de Desastres (DRP) é o documento técnico com os passos de restauração de sistemas, elaborado depois que os critérios de criticidade já foram definidos. O teste de invasão avalia vulnerabilidades técnicas exploráveis, sem relação direta com impacto de indisponibilidade de processos de negócio. A auditoria de conformidade verifica aderência a normas e regulamentos, não a criticidade operacional dos processos.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["Análise de Impacto no Negócio (BIA)", true],
            ["Plano de Recuperação de Desastres (DRP)", false],
            ["Teste de invasão (pentest)", false],
            ["Auditoria de conformidade regulatória", false],
        ],
    },
    {
        statement:
            "O sistema de emissão de notas fiscais de uma empresa é considerado crítico. Depois de conversar com as áreas de negócio, a equipe de TI define que esse sistema precisa voltar a funcionar em, no máximo, 4 horas após uma interrupção, independentemente da quantidade de dados que possa ser perdida nesse intervalo. Esse prazo de 4 horas representa:",
        explanation:
            "O RTO (Recovery Time Objective) é o tempo máximo aceitável para que um sistema ou processo volte a funcionar após uma interrupção, o que corresponde exatamente às 4 horas do cenário. O RPO (Recovery Point Objective) mede outra coisa: a quantidade máxima de dados que a empresa tolera perder, e não o tempo de restabelecimento do serviço. O SLA é um acordo mais amplo sobre níveis de serviço, que pode até mencionar prazos de disponibilidade, mas o conceito específico usado para expressar o tempo máximo de indisponibilidade é o RTO. O MTBF é uma métrica de confiabilidade que mede o tempo médio entre falhas de um equipamento, não o tempo de recuperação.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["RTO (Recovery Time Objective)", true],
            ["RPO (Recovery Point Objective)", false],
            ["SLA (Service Level Agreement)", false],
            ["MTBF (Mean Time Between Failures)", false],
        ],
    },
    {
        statement:
            "Uma instituição financeira define que, em caso de falha catastrófica no banco de dados de transações, não pode perder mais do que 15 minutos de dados, o que exige que os backups ou a replicação ocorram com frequência compatível com essa janela. Esse limite de 15 minutos representa:",
        explanation:
            "O RPO (Recovery Point Objective) define a quantidade máxima de dados, medida em tempo, que a organização tolera perder em caso de falha, determinando diretamente a frequência necessária de backup ou replicação, exatamente o que o cenário descreve. O RTO trata da duração máxima de indisponibilidade do sistema, não da perda de dados. O MTD é o tempo máximo que o negócio consegue sobreviver sem determinada função antes de sofrer danos graves, um conceito relacionado ao RTO, mas não à perda de dados. A BIA é o processo de análise que pode ajudar a chegar a esse número, mas o valor de 15 minutos em si é o RPO, não a análise que o originou.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["RPO (Recovery Point Objective)", true],
            ["RTO (Recovery Time Objective)", false],
            ["MTD (Maximum Tolerable Downtime)", false],
            ["BIA (Business Impact Analysis)", false],
        ],
    },
    {
        statement:
            "Depois que um incêndio destrói a sala de servidores de uma empresa, a equipe de TI segue um documento técnico com os passos para restaurar os servidores, recuperar os backups e realocar a infraestrutura em um site alternativo. Esse documento é conhecido como:",
        explanation:
            "O Plano de Recuperação de Desastres (DRP) é o documento técnico focado especificamente em restaurar sistemas, dados e infraestrutura de TI depois de um desastre, o que combina exatamente com os passos descritos. O Plano de Continuidade de Negócios (BCP) é mais amplo, cobrindo a continuidade do negócio como um todo, incluindo pessoas, processos, instalações e fornecedores, e não apenas os passos técnicos de restauração de servidores. O Plano de Resposta a Incidentes (IRP) trata do tratamento de incidentes de segurança, como invasões ou vazamentos, não de desastres físicos como incêndio. Uma política de segurança da informação estabelece regras e diretrizes gerais, mas não traz o passo a passo técnico de recuperação.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["Plano de Recuperação de Desastres (DRP)", true],
            ["Plano de Continuidade de Negócios (BCP)", false],
            ["Plano de Resposta a Incidentes (IRP)", false],
            ["Política de Segurança da Informação", false],
        ],
    },
    {
        statement:
            "Uma empresa de processamento de pagamentos não pode tolerar mais do que poucos minutos de indisponibilidade. Por isso, mantém um site alternativo com servidores ativos, dados replicados quase em tempo real e toda a infraestrutura pronta para assumir as operações quase imediatamente após um desastre no site principal. Esse tipo de site alternativo é chamado de:",
        explanation:
            "O site quente (hot site) mantém infraestrutura totalmente equipada e dados sincronizados quase em tempo real, permitindo failover quase imediato, o que atende a exigências de RTO e RPO muito baixos como no cenário. O site morno (warm site) tem parte do equipamento e dos dados prontos, mas ainda exige horas de trabalho para ficar totalmente operacional. O site frio (cold site) oferece apenas espaço físico, energia e conectividade básica, sem sistemas pré instalados, levando dias ou semanas para entrar em operação. O acordo recíproco é um arranjo em que duas organizações concordam em se apoiar mutuamente em caso de desastre, geralmente mais lento e menos confiável do que manter um site quente dedicado.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["Site quente (hot site)", true],
            ["Site morno (warm site)", false],
            ["Site frio (cold site)", false],
            ["Acordo recíproco entre empresas (reciprocal agreement)", false],
        ],
    },
    {
        statement:
            "Durante um incidente de ransomware, a equipe de resposta a incidentes já identificou quais sistemas foram afetados e agora está isolando esses sistemas da rede para impedir que o ransomware se espalhe para outros servidores, antes de removê-lo definitivamente. Essa ação corresponde a qual fase do ciclo de vida de resposta a incidentes?",
        explanation:
            "A contenção consiste em isolar os sistemas afetados para impedir que o incidente se espalhe antes de eliminar a ameaça, exatamente o que está sendo feito no cenário. A erradicação é a etapa seguinte, quando a causa raiz e o próprio ransomware são efetivamente removidos dos sistemas. A detecção e análise já havia ocorrido antes, quando a equipe identificou quais sistemas foram afetados. As lições aprendidas acontecem somente depois que o incidente é totalmente resolvido, quando a equipe revisa o que funcionou e o que pode melhorar.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["Contenção", true],
            ["Erradicação", false],
            ["Detecção e análise", false],
            ["Lições aprendidas", false],
        ],
    },
    {
        statement:
            "Antes de qualquer incidente ocorrer, uma empresa define papéis e responsabilidades da equipe de resposta, elabora playbooks para os tipos de incidentes mais prováveis e garante que as ferramentas de monitoramento estejam configuradas corretamente. Essas atividades pertencem a qual fase do ciclo de vida de resposta a incidentes?",
        explanation:
            "A preparação é a fase que antecede qualquer incidente, dedicada a definir papéis, responsabilidades, playbooks e ferramentas, para que a equipe esteja pronta para agir quando algo acontecer, exatamente o que o cenário descreve. A contenção ocorre durante um incidente já em andamento, isolando sistemas afetados. A recuperação acontece depois da erradicação, quando os sistemas voltam à operação normal. A detecção e análise é a fase em que a equipe percebe que um incidente está ocorrendo e avalia sua extensão, o que também pressupõe que o incidente já começou.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["Preparação", true],
            ["Contenção", false],
            ["Recuperação", false],
            ["Detecção e análise", false],
        ],
    },
    {
        statement:
            "Uma seguradora usa um modelo de inteligência artificial para detectar automaticamente solicitações de sinistro fraudulentas. Com o passar dos meses, o comportamento dos fraudadores muda, e o modelo, treinado com dados antigos, passa a errar cada vez mais, deixando de identificar fraudes reais. Do ponto de vista de continuidade de negócios, esse fenômeno de degradação de desempenho do modelo ao longo do tempo deve ser tratado como:",
        explanation:
            "O model drift, ou degradação do modelo, reduz de forma silenciosa a confiabilidade de um serviço do qual o negócio depende, então deve ser monitorado, medido e mitigado, por exemplo com retreinamento periódico, como qualquer outro risco que ameace a disponibilidade ou a qualidade de um processo crítico, dentro da lógica de continuidade de negócios. Tratá-lo como problema exclusivo da ciência de dados ignora o impacto direto na operação e no risco da empresa. Também não é o mesmo que um ataque de segurança: o drift normalmente decorre da mudança natural dos dados ao longo do tempo, não de uma ação maliciosa direta contra o modelo. Esperar o modelo parar de funcionar por completo para agir contraria o princípio de gestão proativa de riscos, permitindo que fraudes passem despercebidas por meses.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            [
                "Um risco de continuidade a monitorar e mitigar, como outros riscos que afetam a disponibilidade de um serviço crítico",
                true,
            ],
            [
                "Um problema exclusivamente técnico do time de ciência de dados, sem relação com os processos de continuidade de negócios",
                false,
            ],
            [
                "Uma falha de segurança que só deve ser tratada pela equipe de resposta a incidentes, como se fosse um ataque",
                false,
            ],
            [
                "Um evento que só precisa ser corrigido quando o modelo parar de funcionar completamente",
                false,
            ],
        ],
    },
    {
        statement:
            "Em um escritório corporativo, cada funcionário recebe um crachá com foto e um chip de proximidade que precisa ser aproximado do leitor para liberar a catraca de entrada. Esse crachá é um exemplo de qual tipo de controle de acesso?",
        explanation:
            "O crachá com leitor de proximidade é um controle físico, pois sua função é restringir a entrada em um espaço físico (o prédio ou uma sala). Controles lógicos atuam sobre sistemas e dados, como senhas e permissões em um servidor. Chamá-lo de controle administrativo está errado porque controle administrativo se refere a políticas e procedimentos, não ao mecanismo em si. E RBAC é um modelo de controle de acesso lógico baseado em papéis dentro de sistemas, não se aplica a catracas físicas.",
        topic: "Controle de Acesso",
        options: [
            ["Controle de acesso lógico", false],
            ["Controle administrativo, pois depende de uma política escrita", false],
            ["Controle de acesso físico", true],
            ["Controle de acesso lógico baseado em papéis (RBAC)", false],
        ],
    },
    {
        statement:
            "Uma empresa de tecnologia identificou que funcionários frequentemente seguravam a porta para colegas entrarem sem que cada um passasse individualmente pelo leitor de crachá, prática conhecida como piggybacking (ou tailgating). Qual controle físico é mais eficaz para impedir especificamente esse comportamento?",
        explanation:
            "A mantrap é projetada justamente para impedir que mais de uma pessoa passe por vez, forçando cada indivíduo a autenticar sua própria entrada, o que elimina o piggybacking na prática. CFTV grava e ajuda a detectar o comportamento depois, mas não impede na hora. Trocar o método de autenticação não resolve o problema, porque a pessoa mal-intencionada continuaria aproveitando a porta aberta por outra. E avisos e políticas escritas são controles administrativos que dependem da adesão voluntária das pessoas, sendo bem menos eficazes que uma barreira física.",
        topic: "Controle de Acesso",
        options: [
            [
                "Instalar uma mantrap (eclusa com duas portas), que permite a passagem de uma pessoa por vez",
                true,
            ],
            ["Aumentar o número de câmeras de CFTV na entrada", false],
            ["Trocar os crachás de proximidade por senhas numéricas", false],
            [
                "Publicar um aviso na entrada lembrando os funcionários da política de segurança de acesso",
                false,
            ],
        ],
    },
    {
        statement:
            "O CFTV (circuito fechado de televisão) instalado nos corredores de um data center é classificado, do ponto de vista funcional, principalmente como um controle de que tipo?",
        explanation:
            "O CFTV é primariamente um controle detectivo: ele grava o que acontece e permite identificar e investigar eventos após ocorrerem, servindo de evidência. Ele não impede fisicamente a entrada de ninguém (isso seria função de uma porta trancada ou de um guarda), por isso não é preventivo. Também não corrige nada sozinho, pois não restaura o ambiente após um incidente, apenas registra. E embora câmeras visíveis possam desestimular alguns comportamentos, resumir sua função a 'apenas dissuasivo' ignora seu papel central de detecção e registro.",
        topic: "Controle de Acesso",
        options: [
            ["Preventivo, porque impede fisicamente a entrada de pessoas não autorizadas", false],
            ["Corretivo, porque restaura o ambiente ao estado anterior após um incidente", false],
            ["Dissuasivo apenas, sem nenhuma outra função", false],
            ["Detectivo, porque registra e permite identificar eventos que já ocorreram", true],
        ],
    },
    {
        statement:
            "Comparado a uma fechadura eletrônica programada, um guarda de segurança posicionado na entrada de um prédio tem como principal vantagem:",
        explanation:
            "A grande vantagem de um controle humano, como um guarda, é a capacidade de julgamento e adaptação a situações imprevistas que um sistema automatizado simplesmente não reconheceria, por exemplo, decidir se libera a entrada de alguém que esqueceu o crachá mas é claramente reconhecido. Guardas normalmente custam mais para manter ao longo do tempo do que um sistema eletrônico, então a opção de custo está invertida. Pessoas também estão sujeitas a erros de julgamento, fadiga e engenharia social, então não são imunes a falhas. E, diferentemente de um sistema eletrônico, guardas precisam de escalas, intervalos e trocas de turno, não funcionam de forma totalmente automática e ininterrupta.",
        topic: "Controle de Acesso",
        options: [
            ["Custo de manutenção sempre menor do que o de um sistema eletrônico", false],
            ["A capacidade de usar julgamento humano para avaliar situações inesperadas", true],
            ["Imunidade a erros, já que pessoas não cometem falhas de avaliação", false],
            ["Funcionamento automático 24 horas sem necessidade de escala ou intervalo", false],
        ],
    },
    {
        statement:
            "Um sensor de movimento conectado a um sistema que dispara um alarme sonoro sempre que detecta atividade em uma sala de servidores fora do horário comercial é um exemplo de controle físico do tipo:",
        explanation:
            "O alarme detecta a presença de alguém e sinaliza o evento em tempo real, o que o caracteriza como um controle detectivo. Ele não trava a porta nem impede fisicamente ninguém de entrar, então não é preventivo por si só, costuma trabalhar junto com uma porta trancada. Também não é um controle administrativo, porque administrativo diz respeito a políticas e procedimentos, e aqui o alarme é um mecanismo físico e tecnológico. E não é compensatório, porque compensatório é um controle alternativo usado quando o controle principal não pode ser aplicado, e o alarme não substitui a necessidade de fechaduras e controle de acesso, ele complementa.",
        topic: "Controle de Acesso",
        options: [
            ["Preventivo, pois impede fisicamente a entrada na sala", false],
            ["Administrativo, pois depende de uma norma interna para funcionar", false],
            [
                "Detectivo, pois identifica e sinaliza uma possível violação enquanto ela está ocorrendo",
                true,
            ],
            [
                "Compensatório, pois substitui a necessidade do controle de acesso físico à sala restrita",
                false,
            ],
        ],
    },
    {
        statement:
            "Manter registros detalhados de quem entrou e saiu de uma sala restrita, com data, hora e identificação da pessoa, atende principalmente a qual objetivo de segurança?",
        explanation:
            "Os logs de acesso existem principalmente para permitir accountability, ou seja, saber exatamente quem fez o quê e quando, o que é essencial para investigar incidentes e para auditorias de conformidade. Eles não impedem fisicamente a entrada de ninguém, esse é o papel de fechaduras, catracas e guardas. Os logs também não substituem crachás e leitores, pelo contrário, eles normalmente são gerados a partir do uso desses mecanismos. E logs de acesso físico não têm relação direta com a disponibilidade dos sistemas, que é uma preocupação de continuidade operacional, não de rastreabilidade de entrada.",
        topic: "Controle de Acesso",
        options: [
            ["Responsabilização (accountability), com auditoria e investigação posterior", true],
            [
                "Impedir fisicamente que pessoas não autorizadas consigam entrar na sala restrita",
                false,
            ],
            ["Substituir a necessidade de crachás e leitores de proximidade", false],
            ["Garantir a disponibilidade dos sistemas hospedados na sala", false],
        ],
    },
    {
        statement:
            "O conceito de CPTED (Crime Prevention Through Environmental Design, ou Prevenção ao Crime Através do Desenho Ambiental) propõe reduzir riscos de segurança física principalmente por meio de:",
        explanation:
            "CPTED trata do desenho físico do ambiente (iluminação adequada, visibilidade, paisagismo que não crie esconderijos, definição clara de territórios) para tornar comportamentos indevidos mais visíveis e arriscados para quem tenta praticá-los, é uma abordagem preventiva baseada em arquitetura e urbanismo. Não se trata de eliminar guardas e substituí-los por câmeras, CPTED é sobre o desenho do espaço, não sobre qual tecnologia de vigilância usar. Também não tem relação com criptografia de dados, que é um controle lógico voltado à proteção da informação, não do ambiente físico. E não envolve exigir mais senhas em sistemas, isso é controle de acesso lógico, fora do escopo do CPTED.",
        topic: "Controle de Acesso",
        options: [
            [
                "Substituição total dos guardas humanos por câmeras de vigilância com monitoramento remoto contínuo",
                false,
            ],
            ["Criptografia dos dados armazenados nos servidores do prédio", false],
            ["Aumento do número de senhas exigidas para acessar sistemas internos", false],
            [
                "Elementos do ambiente construído que aumentam a vigilância natural, como iluminação e linhas de visão",
                true,
            ],
        ],
    },
    {
        statement:
            "Qual das práticas a seguir melhor reduz o risco de acesso físico não autorizado por parte de visitantes em um escritório?",
        explanation:
            "O cadastro, o crachá temporário com validade limitada e o acompanhamento por um funcionário (escort) garantem que o visitante seja identificado, tenha acesso restrito apenas às áreas necessárias e esteja sempre sob supervisão, reduzindo bastante o risco. Permitir circulação livre com base apenas em informação verbal não autentica nem restringe nada, é essencialmente não ter controle. Emitir um crachá permanente igual ao dos funcionários apaga a distinção entre pessoal autorizado permanente e visitante temporário, o que é o oposto do que se busca. E deixar a recepção sem controle em qualquer horário, mesmo fora do pico, cria uma janela de exposição desnecessária.",
        topic: "Controle de Acesso",
        options: [
            [
                "Permitir que qualquer visitante circule livremente desde que informe verbalmente o nome de quem vai visitar",
                false,
            ],
            [
                "Exigir cadastro na recepção, crachá temporário e acompanhamento por um funcionário durante toda a visita",
                true,
            ],
            [
                "Emitir um crachá permanente idêntico ao dos funcionários para agilizar visitas recorrentes",
                false,
            ],
            [
                "Deixar a recepção sem controle de entrada fora do horário de pico para não atrapalhar o fluxo",
                false,
            ],
        ],
    },
    {
        statement:
            "O princípio do menor privilégio (least privilege) estabelece que um usuário deve receber:",
        explanation:
            "Menor privilégio significa dar exatamente o necessário para a função, nem mais, nem menos, o que reduz a superfície de ataque e o estrago possível em caso de comprometimento da conta. Dar o maior número possível de permissões antecipadamente é o oposto do princípio e aumenta o risco desnecessariamente. Dar as mesmas permissões a todos de um departamento ignora que pessoas no mesmo setor podem ter funções diferentes com necessidades de acesso diferentes. E acesso administrativo total revisado raramente é um risco grave, viola tanto o menor privilégio quanto boas práticas de revisão periódica de acesso.",
        topic: "Controle de Acesso",
        options: [
            [
                "O maior número possível de permissões, para evitar solicitações futuras de acesso",
                false,
            ],
            [
                "As mesmas permissões de todos os demais usuários do mesmo departamento, sem nenhuma exceção possível",
                false,
            ],
            [
                "Apenas as permissões estritamente necessárias para realizar as tarefas do seu cargo, nada além disso",
                true,
            ],
            ["Acesso administrativo total, revisado apenas uma vez por ano", false],
        ],
    },
    {
        statement:
            "Em um departamento financeiro, a mesma pessoa é responsável por cadastrar novos fornecedores no sistema e por aprovar os pagamentos para esses fornecedores. Isso representa uma violação de qual princípio de controle de acesso?",
        explanation:
            "Esse é um caso clássico de violação da segregação de funções: quando uma única pessoa pode cadastrar um fornecedor e também aprovar pagamentos para ele, abre-se a possibilidade de fraude, como criar um fornecedor fictício e aprovar pagamentos para si mesmo, sem nenhum segundo controle independente. Não tem relação com menor privilégio, que trata de limitar permissões, não de dar mais poder a uma única pessoa. Também não é uma questão de MAC, que é um modelo baseado em rótulos de sigilo e não está em discussão aqui. E não é sobre não repúdio, que trata da capacidade de provar a autoria de uma ação, e não sobre concentração indevida de poder em uma única função.",
        topic: "Controle de Acesso",
        options: [
            ["Segregação de funções (separation of duties)", true],
            [
                "Menor privilégio, pois a pessoa deveria ter ainda mais permissões para concluir o processo sozinha",
                false,
            ],
            ["Controle de acesso obrigatório (MAC)", false],
            ["Não repúdio, pois não é possível provar quem cadastrou o fornecedor", false],
        ],
    },
    {
        statement:
            "No modelo de Controle de Acesso Discricionário (DAC), quem decide quais outros usuários podem acessar um determinado recurso?",
        explanation:
            "DAC significa justamente isso: o dono do recurso (por exemplo, quem criou um arquivo) tem a discricionariedade de decidir quem mais pode acessá-lo e com que permissões, como acontece em sistemas operacionais comuns ao compartilhar uma pasta. Um administrador central seguindo rótulos de classificação descreve o MAC, não o DAC. O sistema decidir automaticamente com base no cargo descreve o RBAC. E a ideia de um comitê aprovando cada solicitação individualmente não corresponde a nenhum dos três modelos clássicos citados no exame, foge da definição de DAC.",
        topic: "Controle de Acesso",
        options: [
            [
                "Um administrador central, seguindo os rótulos de classificação definidos previamente pela própria organização",
                false,
            ],
            ["O sistema operacional, automaticamente, com base no cargo do usuário", false],
            [
                "O proprietário do recurso, que tem discricionariedade para conceder ou revogar acesso a outros usuários",
                true,
            ],
            ["Um comitê de segurança que aprova cada solicitação individualmente", false],
        ],
    },
    {
        statement:
            "No modelo de Controle de Acesso Obrigatório (MAC), o acesso a um recurso é concedido com base em:",
        explanation:
            "MAC é chamado de 'obrigatório' justamente porque o acesso é determinado por uma política central, com rótulos de classificação (como confidencial, secreto, ultrassecreto) e níveis de habilitação dos usuários, e nem o dono do recurso nem o usuário comum podem mudar essas regras por conta própria, é o modelo típico de ambientes militares e governamentais. A decisão pessoal do criador do arquivo descreve o DAC, o oposto do MAC. Basear o acesso em papel ou cargo descreve o RBAC. E não existe modelo de votação da equipe entre os modelos clássicos de controle de acesso cobrados no exame.",
        topic: "Controle de Acesso",
        options: [
            [
                "Decisão pessoal do criador do arquivo, que pode compartilhá-lo livremente com quem quiser, sem supervisão",
                false,
            ],
            [
                "Rótulos de classificação e níveis de habilitação (clearance) definidos centralmente pela organização",
                true,
            ],
            ["Papel ou cargo do usuário dentro da estrutura organizacional", false],
            ["Votação da equipe sobre quem deve ter acesso a cada novo arquivo", false],
        ],
    },
    {
        statement:
            "Uma empresa organiza as permissões de sistema de forma que todo usuário com o papel 'Analista Financeiro' recebe automaticamente o mesmo conjunto de acessos, e todo usuário com o papel 'Gerente de RH' recebe outro conjunto específico. Esse é um exemplo de qual modelo de controle de acesso?",
        explanation:
            "No RBAC, as permissões são associadas a papéis (roles) que refletem funções dentro da organização, e cada usuário recebe as permissões do papel que ocupa, o que facilita muito a administração em empresas com muitos funcionários. Não é DAC, porque no DAC quem decide o acesso é o dono individual de cada recurso, não uma definição de papel corporativo. Também não é MAC, que se baseia em rótulos de classificação de sigilo e níveis de habilitação, não em cargos funcionais do dia a dia. E CPTED nem é um modelo de controle de acesso lógico, é um conceito de segurança física relacionado ao desenho do ambiente.",
        topic: "Controle de Acesso",
        options: [
            ["DAC (Discretionary Access Control), controle de acesso discricionário", false],
            ["MAC (Mandatory Access Control), controle de acesso obrigatório", false],
            ["RBAC (Role-Based Access Control), controle de acesso baseado em papéis", true],
            ["CPTED, prevenção ao crime através do desenho ambiental", false],
        ],
    },
    {
        statement:
            "Uma agência de inteligência governamental precisa garantir que documentos classificados como 'ultrassecreto' só sejam acessados por pessoas com a habilitação de segurança correspondente, e que nenhum usuário, nem mesmo o autor do documento, possa reduzir esse nível de restrição por conta própria. Qual modelo de controle de acesso é mais adequado a esse cenário?",
        explanation:
            "O cenário descreve exatamente a essência do MAC: rótulos de classificação (ultrassecreto) e níveis de habilitação definidos de forma centralizada e obrigatória, sem que o usuário individual, nem mesmo o criador do documento, possa flexibilizar essas regras. O DAC está descartado justamente porque o requisito é impedir que o autor tenha esse poder de decisão, que é a característica central do DAC. RBAC baseia-se em papéis funcionais e não captura a granularidade de níveis de sigilo como ultrassecreto, secreto e confidencial, então não atende sozinho ao requisito. E depender de um acordo verbal não é um controle de acesso formal nem oferece nenhuma garantia técnica de que o documento não será acessado indevidamente.",
        topic: "Controle de Acesso",
        options: [
            ["MAC (Mandatory Access Control)", true],
            [
                "DAC (Discretionary Access Control), pois o autor do documento pode ajustar o acesso conforme julgar necessário",
                false,
            ],
            ["RBAC (Role-Based Access Control)", false],
            [
                "Nenhum modelo formal é necessário, desde que haja um acordo verbal de confidencialidade entre os envolvidos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de médio porte está tendo dificuldade para administrar permissões porque, a cada novo funcionário contratado, o time de TI precisa configurar manualmente dezenas de acessos individuais, e erros de concessão de permissão são frequentes. Qual modelo de controle de acesso tende a resolver melhor esse problema operacional?",
        explanation:
            "RBAC resolve exatamente esse tipo de problema operacional, porque, ao definir papéis padronizados com os acessos já mapeados, basta associar o novo funcionário ao papel correto em vez de configurar dezenas de permissões manualmente, o que reduz erros e acelera o processo. MAC é um modelo pesado, típico de ambientes militares e governamentais com níveis de sigilo, e não foi desenhado para resolver agilidade operacional em uma empresa comum. DAC pioraria o problema, porque descentraliza ainda mais a decisão, deixando a cargo de cada colega individual, o que tende a gerar mais inconsistência, não menos. E CPTED é um conceito de segurança física de ambiente, não tem relação com administração de permissões em sistemas.",
        topic: "Controle de Acesso",
        options: [
            [
                "MAC, exigindo que cada novo funcionário receba um nível de habilitação de segurança nacional antes mesmo de começar a trabalhar",
                false,
            ],
            [
                "DAC, deixando que cada colega decida individualmente o que compartilhar com o novo funcionário",
                false,
            ],
            [
                "CPTED, redesenhando o layout físico do escritório para facilitar a supervisão dos novos funcionários",
                false,
            ],
            [
                "RBAC, atribuindo permissões a papéis padronizados; o novo funcionário só precisa ser associado ao papel correto",
                true,
            ],
        ],
    },
    {
        statement:
            "Para reduzir o risco de que um administrador de sistemas malicioso apague os próprios registros de auditoria depois de realizar uma ação indevida, qual controle é mais apropriado?",
        explanation:
            "Segregar a administração do sistema da gestão dos logs de auditoria é a aplicação clássica de segregação de funções para esse risco específico: se o mesmo administrador não tem controle sobre os próprios registros de auditoria, ele não consegue apagar as evidências de uma ação indevida sozinho. Dar acesso irrestrito a tudo, incluindo os logs, é o oposto da solução e aumenta o risco. Eliminar os logs de auditoria remove justamente a ferramenta de rastreabilidade e responsabilização, piorando a postura de segurança. E trocar a senha periodicamente sem mudar as permissões não resolve o problema de fundo, que é o excesso de poder concentrado em uma única função.",
        topic: "Controle de Acesso",
        options: [
            [
                "Dar ao administrador acesso irrestrito a tudo, incluindo os logs, para que ele possa corrigir rapidamente qualquer problema que surgir",
                false,
            ],
            [
                "Segregar a função de administração do sistema da função de gestão dos logs de auditoria, atribuindo-as a pessoas ou equipes diferentes",
                true,
            ],
            [
                "Eliminar os logs de auditoria, já que eles podem ser apagados de qualquer forma",
                false,
            ],
            ["Trocar a senha do administrador semanalmente, sem alterar suas permissões", false],
        ],
    },
    {
        statement:
            "Um estagiário foi contratado para dar suporte apenas ao sistema de tickets de atendimento ao cliente. O gestor de TI, para 'facilitar' futuras tarefas, cogita conceder a ele acesso também ao sistema financeiro e ao servidor de RH, mesmo sem necessidade imediata. Do ponto de vista de controle de acesso, essa prática:",
        explanation:
            "Conceder acesso a sistemas que não são necessários para a função atual do estagiário viola diretamente o princípio do menor privilégio, e também o conceito relacionado de 'necessidade de conhecer' (need to know), aumentando desnecessariamente a superfície de ataque e o dano possível em caso de uso indevido ou comprometimento da conta. Não tem relação com segregação de funções, que busca justamente dividir responsabilidades entre pessoas diferentes, e não concentrar múltiplos sistemas em uma só. Antecipar acessos 'para facilitar' é uma justificativa comum, mas tecnicamente equivocada, já que o acesso deve ser concedido quando a necessidade surgir, não antes. E um termo de confidencialidade é um controle administrativo complementar, mas não elimina o risco técnico criado por permissões desnecessárias.",
        topic: "Controle de Acesso",
        options: [
            [
                "É uma boa prática de segregação de funções, pois centraliza vários sistemas sob uma única pessoa",
                false,
            ],
            ["É recomendada", false],
            ["Viola o princípio do menor privilégio", true],
            [
                "Não representa nenhum risco, desde que o estagiário assine um termo de confidencialidade",
                false,
            ],
        ],
    },
    {
        statement:
            "Em uma pequena empresa que usa um servidor de arquivos onde cada funcionário pode compartilhar suas próprias pastas com quem quiser, um funcionário descontente compartilhou uma pasta confidencial com um concorrente antes de sair da empresa. Esse incidente evidencia principalmente uma fraqueza característica de qual modelo de controle de acesso?",
        explanation:
            "O incidente mostra exatamente a fraqueza típica do DAC: como o próprio usuário decide com quem compartilhar seus recursos, sem uma autoridade central validando cada decisão, um funcionário mal-intencionado consegue vazar informação sem que exista um controle que exija aprovação de terceiros. Não é uma fraqueza do MAC, porque no MAC o próprio ponto é impedir esse tipo de decisão individual descontrolada, então citar MAC aqui inverte a lógica do problema. RBAC também não é a causa, porque o cenário descreve compartilhamento discricionário por pasta individual, não atribuição de papéis, e dizer que RBAC 'impede qualquer' compartilhamento indevido é uma generalização exagerada. E CPTED trata do ambiente físico, sem relação com um incidente de compartilhamento de arquivo em um servidor.",
        topic: "Controle de Acesso",
        options: [
            [
                "DAC, pois a discricionariedade do dono do recurso permite compartilhar sem supervisão central",
                true,
            ],
            [
                "MAC, pois os rótulos de classificação não podem ser definidos pelos usuários individuais de cada equipe",
                false,
            ],
            [
                "RBAC, pois papéis organizacionais impedem qualquer tipo de compartilhamento indevido",
                false,
            ],
            ["CPTED, pois o ambiente físico do escritório não foi projetado corretamente", false],
        ],
    },
    {
        statement:
            "Um sistema de segurança usa Inteligência Artificial para aprender o padrão normal de acesso de cada funcionário (horários habituais, localização, recursos acessados) e gerar um alerta automático quando um comportamento foge muito desse padrão, como um login às 3h da manhã vindo de outro país. Essa capacidade é conhecida como:",
        explanation:
            "O cenário descreve UEBA (User and Entity Behavior Analytics), uma aplicação de IA que aprende o comportamento habitual de cada usuário e sinaliza desvios significativos, como horários incomuns ou localizações inesperadas, funcionando como uma camada extra de detecção de possíveis contas comprometidas ou uso indevido. Não é DAC, que é um modelo de concessão de permissões baseado na discricionariedade do dono do recurso, e não tem relação com análise comportamental de padrões de uso. Também não é CPTED, que é um conceito de segurança física do ambiente construído, sem qualquer aplicação a redes ou sistemas. E não é segregação de funções, que trata da divisão de responsabilidades entre pessoas, e não da separação física de sistemas por IA.",
        topic: "Controle de Acesso",
        options: [
            [
                "Controle de Acesso Discricionário (DAC), pois o próprio sistema decide sozinho quem pode acessar cada recurso",
                false,
            ],
            ["CPTED, pois o ambiente de rede foi redesenhado para reduzir riscos", false],
            [
                "Segregação de funções automatizada, pois separa fisicamente os sistemas acessados",
                false,
            ],
            ["Detecção de anomalias de acesso baseada em análise comportamental (UEBA)", true],
        ],
    },
    {
        statement:
            "Uma organização implementou um mecanismo em que a Inteligência Artificial calcula, em tempo real, um nível de risco para cada tentativa de acesso (considerando dispositivo, localização e horário) e, com base nesse risco, decide se libera o acesso direto, exige uma verificação adicional (como MFA) ou bloqueia a tentativa. Esse uso de IA está associado principalmente a qual finalidade dentro do controle de acesso?",
        explanation:
            "Esse é um exemplo de autorização adaptativa apoiada por IA (também chamada de acesso baseado em risco), em que o sistema ajusta dinamicamente a exigência de autenticação e a decisão de liberar ou não o acesso, com base no risco calculado para aquela tentativa específica, indo além de uma regra estática de tudo ou nada. Esse tipo de mecanismo atua no mundo lógico e não substitui controles de acesso físico, que continuam necessários para proteger instalações e equipamentos. Também não elimina a necessidade de senhas ou outros fatores, pelo contrário, muitas vezes reforça a exigência de um fator adicional quando o risco é considerado alto. E nenhum sistema de IA é infalível, então dizer que jamais haverá falsos positivos é uma afirmação irreal sobre a tecnologia.",
        topic: "Controle de Acesso",
        options: [
            [
                "Substituição definitiva da necessidade de qualquer controle de acesso físico no ambiente corporativo",
                false,
            ],
            [
                "Apoio adaptativo à autorização, com risco calculado dinamicamente, mais flexível que uma regra fixa",
                true,
            ],
            ["Eliminação total da necessidade de senhas ou outros fatores de autenticação", false],
            ["Garantia de que nenhum falso positivo jamais ocorrerá durante a análise", false],
        ],
    },
    {
        statement:
            "Um roteador recebe um pacote e decide para qual rede encaminhá-lo com base no endereço IP de destino. Esse processo de encaminhamento acontece em qual camada do modelo OSI?",
        explanation:
            "A camada de rede (camada 3) é responsável pelo endereçamento lógico (IP) e pelo roteamento de pacotes entre redes diferentes, exatamente a função descrita. A camada de enlace de dados (2) trata do endereçamento físico (MAC) e da entrega dentro do mesmo segmento de rede, não do roteamento entre redes distintas. A camada de transporte (4) cuida da entrega fim a fim e do controle por portas (TCP/UDP), sem decidir o caminho do pacote pela rede. A camada de aplicação (7) é onde ficam os protocolos usados pelos programas, como HTTP e DNS, sem relação direta com o encaminhamento de pacotes.",
        topic: "Segurança de Redes",
        options: [
            ["Camada de rede (camada 3 do OSI)", true],
            ["Camada de enlace de dados (camada 2)", false],
            ["Camada de transporte (camada 4)", false],
            ["Camada de aplicação (camada 7)", false],
        ],
    },
    {
        statement:
            "Ao comparar o modelo OSI de 7 camadas com o modelo TCP/IP, uma estudante percebe que o modelo TCP/IP tem menos camadas. Isso ocorre porque o modelo TCP/IP:",
        explanation:
            "O modelo TCP/IP é mais enxuto porque agrupa as responsabilidades das camadas de aplicação, apresentação e sessão do OSI em uma única camada de aplicação, além de combinar enlace e física em uma camada de acesso à rede. Ele continua usando endereçamento IP normalmente, então dizer que elimina essa necessidade está errado. Ele também não substitui a camada de transporte por segurança, TCP e UDP continuam existindo nela normalmente. E ele não adiciona nenhuma camada nova, na verdade reduz o número de camadas em relação ao modelo OSI.",
        topic: "Segurança de Redes",
        options: [
            [
                "Combina as camadas de aplicação, apresentação e sessão do OSI em uma única camada de aplicação",
                true,
            ],
            [
                "Elimina completamente a necessidade de endereçamento IP em todas as redes modernas conectadas",
                false,
            ],
            ["Substitui a camada de transporte por uma camada de segurança", false],
            ["Adiciona uma camada extra entre a camada física e a de enlace", false],
        ],
    },
    {
        statement:
            "Uma pequena empresa configura sua rede interna usando endereços como 192.168.1.10 e 192.168.1.11 para os computadores dos funcionários. Para que esses computadores acessem a internet, o roteador da empresa precisa traduzir esses endereços privados para um endereço público. Qual tecnologia realiza essa tradução?",
        explanation:
            "NAT (Network Address Translation) é a tecnologia que traduz endereços IP privados, como os da faixa 192.168.x.x reservada para uso interno, para um endereço IP público, permitindo que vários dispositivos internos compartilhem uma única saída para a internet. DHCP apenas distribui endereços IP automaticamente aos dispositivos da rede, mas não faz tradução de endereços. DNS traduz nomes de domínio, como exemplo.com, em endereços IP, e não endereços privados em públicos. VLAN é usada para segmentar uma rede local em sub-redes lógicas isoladas, sem relação com tradução de endereços.",
        topic: "Segurança de Redes",
        options: [
            ["NAT (Network Address Translation)", true],
            ["DHCP (Dynamic Host Configuration Protocol)", false],
            ["DNS (Domain Name System)", false],
            ["VLAN (Virtual Local Area Network)", false],
        ],
    },
    {
        statement:
            "O IPv4 utiliza endereços de 32 bits, o que limita o total de endereços possíveis a cerca de 4,3 bilhões, número já insuficiente para a quantidade de dispositivos conectados à internet atualmente. Qual é a principal razão para a adoção crescente do IPv6?",
        explanation:
            "O IPv6 usa endereços de 128 bits, o que gera um espaço de endereçamento muito maior, resolvendo o problema de escassez de endereços do IPv4. Ele não elimina a necessidade de criptografia, os recursos de segurança continuam sendo aplicados nas camadas de transporte e aplicação como antes. Ele funciona tanto em redes locais quanto na internet pública, exatamente como o IPv4, não é restrito a redes locais. E ele não substitui o TCP, que continua sendo o protocolo de transporte confiável usado acima da camada de rede, tanto em IPv4 quanto em IPv6.",
        topic: "Segurança de Redes",
        options: [
            [
                "Ele usa endereços de 128 bits, o que amplia enormemente o espaço de endereços disponíveis",
                true,
            ],
            ["Ele elimina a necessidade de qualquer tipo de criptografia na rede", false],
            [
                "Ele funciona exclusivamente dentro de redes locais, sem nenhum tipo de acesso à internet pública",
                false,
            ],
            ["Ele substitui o protocolo TCP por um protocolo mais rápido", false],
        ],
    },
    {
        statement:
            "O administrador de uma empresa bloqueia a porta 443 no firewall de borda por engano, durante uma manutenção. Qual será o impacto mais provável para os funcionários?",
        explanation:
            "A porta 443 é a porta padrão do HTTPS, usada para tráfego web criptografado com TLS, então bloqueá-la impede o acesso à maioria dos sites atuais. SMTP usa as portas 25 ou 587, não a 443, então o envio de e-mail não seria afetado diretamente por esse bloqueio específico. DNS usa a porta 53, responsável pela resolução de nomes, também não relacionada à 443. SSH usa a porta 22 para acesso remoto seguro a servidores, outra porta distinta da 443.",
        topic: "Segurança de Redes",
        options: [
            [
                "Eles não conseguirão acessar sites HTTPS, já que essa é a porta padrão do tráfego web criptografado",
                true,
            ],
            [
                "Eles não conseguirão mais receber e-mails, já que essa é a porta padrão do protocolo SMTP",
                false,
            ],
            [
                "Eles não conseguirão resolver nomes de domínio, já que essa é a porta padrão do DNS",
                false,
            ],
            [
                "Eles não conseguirão acessar servidores remotamente via SSH, já que essa é a porta padrão desse protocolo",
                false,
            ],
        ],
    },
    {
        statement:
            "O site de uma loja virtual fica fora do ar depois de receber um volume anormal de requisições simultâneas, originadas de milhares de dispositivos diferentes ao redor do mundo, ao mesmo tempo. Qual tipo de ataque melhor descreve essa situação?",
        explanation:
            "O ataque de negação de serviço distribuída (DDoS) usa um grande número de dispositivos comprometidos, uma botnet, espalhados pelo mundo para sobrecarregar um servidor ou serviço com tráfego, tirando-o do ar, exatamente o cenário descrito. Phishing é uma técnica de engenharia social para enganar vítimas e roubar credenciais ou dados, sem relação com sobrecarga de tráfego. Ataque de força bruta tenta adivinhar senhas testando várias combinações, não gera indisponibilidade por volume de requisições distribuídas. Ransomware é um malware que criptografa arquivos da vítima para exigir resgate, um tipo de ataque totalmente diferente do descrito.",
        topic: "Segurança de Redes",
        options: [
            ["Negação de serviço distribuída (DDoS)", true],
            ["Phishing por e-mail em massa", false],
            ["Ataque de força bruta contra senhas", false],
            ["Ransomware", false],
        ],
    },
    {
        statement:
            "Um funcionário baixa uma planilha infectada e a executa em seu computador. O código malicioso se anexa a outros arquivos executáveis do sistema e só se espalha para outros computadores quando esses arquivos infectados são compartilhados e abertos por outras pessoas. Que tipo de malware descreve melhor esse comportamento?",
        explanation:
            "Um vírus precisa se anexar a um arquivo hospedeiro e depende da ação humana, como compartilhar e abrir o arquivo infectado, para se propagar, exatamente como descrito no cenário. Um worm se diferencia por se propagar sozinho pela rede, explorando vulnerabilidades, sem precisar de um arquivo hospedeiro nem de ação do usuário. Spyware é um malware voltado a monitorar e coletar informações da vítima de forma oculta, não a se replicar por meio de arquivos infectados. Ataque de canal lateral nem é um tipo de malware, é uma técnica que explora características físicas de um sistema, como tempo de processamento ou consumo de energia, para obter informações sensíveis.",
        topic: "Segurança de Redes",
        options: [
            ["Vírus", true],
            ["Worm", false],
            ["Spyware", false],
            ["Ataque de canal lateral", false],
        ],
    },
    {
        statement:
            "Durante uma investigação, a equipe de segurança descobre dois incidentes distintos. No primeiro, um malware se espalhou sozinho pela rede corporativa explorando uma vulnerabilidade não corrigida, sem qualquer ação dos usuários. No segundo, um funcionário instalou um programa que parecia ser um utilitário legítimo, mas que na verdade abriu uma porta de acesso remoto para um invasor. Como esses dois malwares são classificados, respectivamente?",
        explanation:
            "O primeiro caso é um worm, malware capaz de se autopropagar pela rede explorando vulnerabilidades, sem depender de ação humana. O segundo é um trojan (cavalo de troia), que se disfarça de programa legítimo para enganar o usuário e, uma vez executado, abre acesso indevido ao sistema, como uma porta dos fundos. Inverter as classificações descreveria os comportamentos ao contrário, já que trojan não se autopropaga e worm não depende de disfarce. Vírus exigiria um arquivo hospedeiro e ação do usuário para se propagar, o que não bate com o primeiro caso. Ransomware exige resgate para liberar dados sequestrados e spyware monitora a vítima secretamente, nenhum dos dois corresponde aos comportamentos descritos.",
        topic: "Segurança de Redes",
        options: [
            ["Worm e trojan (cavalo de troia)", true],
            ["Trojan e worm, nessa ordem", false],
            ["Vírus e worm, nessa ordem", false],
            ["Ransomware e spyware, nessa ordem", false],
        ],
    },
    {
        statement:
            "Um funcionário se conecta a uma rede Wi-Fi aberta em um aeroporto para acessar o sistema interno da empresa. Um invasor, conectado à mesma rede, consegue posicionar seu dispositivo entre o funcionário e o servidor, interceptando e possivelmente alterando os dados trocados sem que nenhum dos dois perceba. Que tipo de ataque é esse?",
        explanation:
            "No ataque man in the middle (MITM), o invasor se posiciona entre duas partes que se comunicam, interceptando e às vezes alterando o tráfego sem que elas percebam, exatamente o cenário de rede Wi-Fi aberta descrito. O ataque de negação de serviço busca tirar um serviço do ar por sobrecarga de tráfego, não interceptar uma comunicação em andamento. Engenharia social manipula pessoas para que revelem informações ou realizem ações, sem necessariamente interceptar tráfego de rede. Ataque de dicionário é uma técnica de quebra de senha que testa palavras comuns, sem relação com interceptação de comunicação em tempo real.",
        topic: "Segurança de Redes",
        options: [
            ["Ataque man in the middle (MITM)", true],
            ["Ataque de negação de serviço", false],
            ["Engenharia social", false],
            ["Ataque de dicionário", false],
        ],
    },
    {
        statement:
            "Um pesquisador de segurança consegue descobrir parte de uma chave criptográfica secreta apenas medindo o tempo que um dispositivo leva para processar diferentes operações e a variação no consumo de energia durante esse processamento, sem explorar nenhuma falha no código do software. Que tipo de ataque é esse?",
        explanation:
            "O ataque de canal lateral (side-channel) explora características físicas indiretas de um sistema, como tempo de execução, consumo de energia ou emissões eletromagnéticas, para deduzir informações sensíveis, sem atacar diretamente uma falha de software, exatamente o que foi descrito. Injeção de SQL explora falhas em consultas de banco de dados mal validadas, um tipo de vulnerabilidade de software, não uma medição física. Ataque de força bruta tenta adivinhar a chave diretamente, testando combinações, e não por meio de medições físicas indiretas. Sequestro de sessão rouba um token de sessão já autenticado para se passar pelo usuário, uma técnica completamente diferente da descrita.",
        topic: "Segurança de Redes",
        options: [
            ["Ataque de canal lateral (side-channel)", true],
            ["Injeção de SQL", false],
            ["Ataque de força bruta", false],
            ["Sequestro de sessão (session hijacking)", false],
        ],
    },
    {
        statement:
            "Uma empresa quer uma solução que não apenas identifique tráfego malicioso na rede, mas também bloqueie automaticamente esse tráfego em tempo real, antes que ele alcance os sistemas internos. Qual tecnologia atende a essa necessidade, e não apenas a detecção com alerta?",
        explanation:
            "O IPS (Intrusion Prevention System) fica em linha com o tráfego e pode bloquear automaticamente atividades maliciosas em tempo real, sem depender de intervenção manual, exatamente a necessidade descrita. Já o IDS (Intrusion Detection System) apenas monitora e gera alertas quando identifica atividade suspeita, mas não tem a capacidade de bloquear o tráfego sozinho. VPN cria um túnel criptografado para conexões remotas seguras, sem função de detecção ou bloqueio de ataques. DMZ é uma sub-rede isolada para hospedar serviços expostos à internet, também sem essa função de prevenção ativa.",
        topic: "Segurança de Redes",
        options: [
            ["IPS (Intrusion Prevention System)", true],
            ["IDS (Intrusion Detection System)", false],
            ["VPN (Virtual Private Network)", false],
            ["DMZ (Zona Desmilitarizada)", false],
        ],
    },
    {
        statement:
            "Uma equipe de segurança quer monitorar continuamente os arquivos de sistema e os registros de eventos de um servidor crítico específico, detectando alterações não autorizadas diretamente naquele host. Qual solução é mais adequada para esse objetivo?",
        explanation:
            "O HIDS (Host-based Intrusion Detection System) é instalado diretamente no host e monitora arquivos de sistema, registros de eventos e outras atividades locais daquele equipamento específico, identificando alterações não autorizadas, exatamente a necessidade descrita. O NIDS (Network-based Intrusion Detection System) monitora o tráfego que passa pela rede como um todo, e não o estado interno de um host específico. NAC controla quais dispositivos podem se conectar à rede com base em critérios de conformidade, sem monitorar arquivos de um servidor. O firewall de borda filtra o tráfego que entra e sai da rede com base em regras, sem visibilidade sobre alterações de arquivos dentro de um host.",
        topic: "Segurança de Redes",
        options: [
            ["HIDS (Host-based Intrusion Detection System)", true],
            ["NIDS (Network-based Intrusion Detection System)", false],
            ["NAC (Network Access Control)", false],
            ["Firewall de borda (perimeter firewall)", false],
        ],
    },
    {
        statement:
            "Um administrador de rede configura uma regra para permitir apenas tráfego de entrada nas portas 80 e 443, bloqueando todas as outras portas não autorizadas na borda da rede corporativa. Qual dispositivo de segurança é responsável por aplicar esse tipo de regra?",
        explanation:
            "O firewall é o dispositivo responsável por filtrar o tráfego de rede com base em regras predefinidas, como liberar ou bloquear portas específicas, controlando o que entra e sai da rede. O IDS apenas monitora e alerta sobre atividades suspeitas, sem aplicar regras de bloqueio de portas por padrão. O antivírus protege dispositivos individuais contra malware, mas não filtra tráfego de rede por porta. Um access point apenas fornece conectividade sem fio aos dispositivos, sem função de filtragem de tráfego baseada em regras.",
        topic: "Segurança de Redes",
        options: [
            ["Firewall", true],
            ["IDS", false],
            ["Antivírus", false],
            ["Access point (ponto de acesso Wi-Fi)", false],
        ],
    },
    {
        statement:
            "Uma empresa quer isolar o tráfego de rede do setor financeiro do restante dos funcionários, por questões de segurança, mas sem instalar cabeamento físico separado para cada setor. Qual solução permite essa segmentação lógica usando a infraestrutura de rede já existente?",
        explanation:
            "A VLAN permite segmentar logicamente uma rede física em sub-redes isoladas, como separar o tráfego do setor financeiro do restante dos funcionários, sem precisar de cabeamento físico adicional. A VPN cria um túnel criptografado para conexões remotas seguras pela internet, não é a ferramenta usada para segmentar uma rede interna já cabeada. NAT traduz endereços IP privados em públicos, sem relação com isolamento de tráfego entre setores. A DMZ é uma sub-rede específica para isolar servidores expostos à internet do restante da rede interna, um propósito diferente do isolamento entre departamentos internos.",
        topic: "Segurança de Redes",
        options: [
            ["VLAN (Virtual Local Area Network)", true],
            ["VPN (Virtual Private Network)", false],
            ["NAT (Network Address Translation)", false],
            ["DMZ (Zona Desmilitarizada)", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa disponibilizar um servidor web acessível pelo público na internet, mas quer garantir que, se esse servidor for comprometido, o invasor não tenha acesso direto à rede interna onde ficam os dados sensíveis. Qual solução de design de rede atende a essa necessidade?",
        explanation:
            "A DMZ é uma sub-rede isolada, posicionada entre a rede interna e a internet, criada justamente para hospedar serviços públicos como servidores web, de forma que, se comprometidos, não deem acesso direto à rede interna. Colocar o servidor na mesma VLAN dos funcionários misturaria tráfego público com a rede interna sensível, aumentando o risco. Conectar o servidor diretamente à rede interna sem segmentação exporia todos os recursos internos em caso de comprometimento do servidor. Exigir VPN dos visitantes não é viável para um site público, que precisa ser acessível a qualquer pessoa na internet, e não resolve o problema de isolamento da rede interna.",
        topic: "Segurança de Redes",
        options: [
            ["Colocar o servidor em uma DMZ (zona desmilitarizada) segmentada", true],
            ["Colocar o servidor na mesma VLAN dos computadores dos funcionários", false],
            ["Conectar o servidor diretamente à rede interna sem nenhuma segmentação", false],
            ["Exigir que todos os visitantes do site usem uma VPN antes de acessar", false],
        ],
    },
    {
        statement:
            "Uma funcionária que trabalha remotamente precisa acessar sistemas internos da empresa pela internet com segurança, como se seu computador estivesse fisicamente conectado à rede corporativa. Qual tecnologia permite isso, criando um túnel criptografado entre o dispositivo dela e a rede da empresa?",
        explanation:
            "A VPN cria um túnel criptografado entre o dispositivo remoto e a rede da empresa, permitindo que a funcionária acesse recursos internos com segurança pela internet, como se estivesse fisicamente na rede corporativa. O NAC verifica se um dispositivo cumpre requisitos de segurança antes de liberar acesso à rede, mas não é ele quem cria o túnel de conexão remota. A DMZ é uma sub-rede para isolar serviços públicos, sem relação com acesso remoto seguro de funcionários. O IPS previne intrusões bloqueando tráfego malicioso, mas não é a tecnologia usada para estabelecer conexões remotas criptografadas.",
        topic: "Segurança de Redes",
        options: [
            ["VPN (Virtual Private Network)", true],
            ["NAC (Network Access Control)", false],
            ["DMZ (Zona Desmilitarizada)", false],
            ["IPS (Intrusion Prevention System)", false],
        ],
    },
    {
        statement:
            "Uma empresa decide não depender apenas do firewall de borda para se proteger e passa a combinar firewall, IDS/IPS, antivírus nos endpoints, segmentação de rede e treinamento de conscientização dos funcionários, de forma que, se uma camada falhar, as outras ainda ofereçam proteção. Esse conceito é conhecido como:",
        explanation:
            "A defesa em profundidade é o conceito de aplicar múltiplas camadas independentes de controle de segurança, de forma que a falha de uma camada não deixe o sistema totalmente exposto, exatamente o cenário descrito. Privilégio mínimo é o princípio de dar a cada usuário apenas o acesso necessário para sua função, um conceito de controle de acesso, não de camadas de defesa de rede. Segregação de funções divide tarefas críticas entre pessoas diferentes para evitar fraude ou erro, também não relacionado a camadas de controles técnicos. Redundância geográfica se refere a manter recursos em locais fisicamente distintos para continuidade de negócios, um conceito de recuperação de desastres, não de defesa em camadas.",
        topic: "Segurança de Redes",
        options: [
            ["Defesa em profundidade", true],
            ["Privilégio mínimo", false],
            ["Segregação de funções", false],
            ["Redundância geográfica", false],
        ],
    },
    {
        statement:
            "Uma empresa quer garantir que somente dispositivos com antivírus atualizado e patches de segurança em dia consigam se conectar à rede corporativa, verificando automaticamente essa conformidade antes de liberar o acesso. Qual solução atende a essa necessidade?",
        explanation:
            "O NAC (Network Access Control) verifica automaticamente se um dispositivo atende a critérios de segurança definidos, como antivírus atualizado e patches em dia, antes de permitir sua conexão à rede, exatamente a necessidade descrita. O IDS apenas detecta e alerta sobre atividades suspeitas depois que o tráfego já está circulando na rede, sem controlar a entrada de dispositivos. A DMZ isola serviços expostos à internet, sem relação com verificação de conformidade de dispositivos internos. Um antivírus centralizado ajuda a gerenciar a proteção dos endpoints, mas sozinho não impede que um dispositivo fora de conformidade se conecte à rede.",
        topic: "Segurança de Redes",
        options: [
            ["NAC (Network Access Control)", true],
            ["IDS (Intrusion Detection System)", false],
            ["DMZ (Zona Desmilitarizada)", false],
            ["Antivírus centralizado", false],
        ],
    },
    {
        statement:
            "Uma empresa passa a usar um sistema de e-mail acessado inteiramente pelo navegador, sem instalar nenhum servidor, sem gerenciar sistema operacional e sem se preocupar com atualizações da aplicação, que ficam totalmente a cargo do provedor. Esse é um exemplo de qual modelo de serviço em nuvem?",
        explanation:
            "No SaaS (Software as a Service), o provedor entrega a aplicação pronta para uso, cuidando de toda a infraestrutura, do sistema operacional e das atualizações, enquanto o cliente apenas usa o software pelo navegador, exatamente o cenário descrito. No IaaS, o cliente aluga a infraestrutura, como servidores e armazenamento, mas ainda precisa instalar e gerenciar o sistema operacional e as aplicações. No PaaS, o provedor entrega uma plataforma para o cliente desenvolver e implantar suas próprias aplicações, sem gerenciar a infraestrutura, mas ainda envolve gestão de código pelo cliente. MSP é um termo mais amplo para empresas terceirizadas que gerenciam serviços de TI, não é, por si só, um dos três modelos clássicos de serviço em nuvem.",
        topic: "Segurança de Redes",
        options: [
            ["SaaS (Software as a Service)", true],
            ["IaaS (Infrastructure as a Service)", false],
            ["PaaS (Platform as a Service)", false],
            ["MSP (Managed Service Provider)", false],
        ],
    },
    {
        statement:
            "Uma equipe de desenvolvimento quer alugar máquinas virtuais na nuvem para ter controle total sobre o sistema operacional, as configurações de rede e o software instalado, responsabilizando-se por tudo acima da camada de infraestrutura física. Qual modelo de serviço em nuvem essa equipe está utilizando?",
        explanation:
            "No IaaS (Infrastructure as a Service), o provedor entrega apenas a infraestrutura básica, como servidores virtuais, armazenamento e rede, e o cliente é responsável por instalar e gerenciar o sistema operacional e tudo que roda sobre ele, exatamente o cenário descrito. No PaaS, o provedor já entrega uma plataforma com sistema operacional e ferramentas de desenvolvimento prontas, e o cliente foca apenas na aplicação, sem gerenciar o sistema operacional. No SaaS, o cliente só usa uma aplicação pronta, sem nenhum controle sobre infraestrutura ou sistema operacional. SLA é um acordo contratual que define níveis de serviço garantidos, como disponibilidade, não um modelo de entrega de serviço em nuvem.",
        topic: "Segurança de Redes",
        options: [
            ["IaaS (Infrastructure as a Service)", true],
            ["PaaS (Platform as a Service)", false],
            ["SaaS (Software as a Service)", false],
            ["SLA (Service Level Agreement) assinado", false],
        ],
    },
    {
        statement:
            "Um firewall tradicional, baseado apenas em regras fixas de porta e endereço IP, não consegue identificar um ataque totalmente novo, sem assinatura conhecida. Uma empresa passa a usar um firewall com recursos de inteligência artificial, que analisa padrões de tráfego e comportamento para identificar atividades suspeitas mesmo sem uma assinatura prévia. Qual é a principal vantagem dessa abordagem em relação ao firewall tradicional?",
        explanation:
            "A principal vantagem da inteligência artificial aplicada a firewalls é a capacidade de reconhecer padrões de comportamento anômalos e identificar ameaças novas, sem assinatura conhecida, algo que regras estáticas não conseguem fazer sozinhas. A IA não elimina a necessidade de revisão humana, pois analistas ainda precisam validar alertas e ajustar o sistema, especialmente para reduzir falsos positivos. Nenhuma tecnologia, incluindo IA, garante proteção absoluta contra todos os ataques, seria uma promessa irreal. E recursos de IA em segurança não têm relação com redução de custo de conexão à internet, um benefício que não faz sentido no contexto de detecção de ameaças.",
        topic: "Segurança de Redes",
        options: [
            [
                "Capacidade de detectar ameaças novas por padrões de comportamento, não só por assinaturas",
                true,
            ],
            [
                "Eliminação total da necessidade de qualquer revisão humana das configurações de segurança",
                false,
            ],
            ["Garantia de que nenhum ataque jamais conseguirá comprometer a rede", false],
            ["Redução do custo de conexão à internet da empresa", false],
        ],
    },
    {
        statement:
            "A equipe de segurança de uma empresa reclama que o IDS tradicional gera um volume enorme de alertas, muitos deles falsos positivos, tornando difícil identificar rapidamente os incidentes reais em meio a tanto ruído. Como o uso de inteligência artificial no IDS pode ajudar a resolver esse problema?",
        explanation:
            "Sistemas de IDS com inteligência artificial aprendem o comportamento normal da rede ao longo do tempo e conseguem priorizar e contextualizar alertas com maior chance de serem ameaças reais, reduzindo o ruído de falsos positivos e agilizando a resposta da equipe. Desligar o IDS quando há muitos alertas deixaria a rede sem monitoramento justamente quando mais precisa dele, o oposto do desejado. Bloquear permanentemente qualquer usuário que gere um alerta puniria também os falsos positivos, prejudicando pessoas legítimas sem necessidade. E a IA apoia a equipe de segurança, mas não substitui completamente o julgamento humano, que continua necessário para decisões mais complexas e para validar as recomendações do sistema.",
        topic: "Segurança de Redes",
        options: [
            [
                "Aprendendo o padrão normal do tráfego e priorizando os alertas com maior chance de ameaça real",
                true,
            ],
            [
                "Desligando automaticamente o IDS sempre que o volume de alertas fica muito alto",
                false,
            ],
            [
                "Bloqueando permanentemente qualquer usuário que gere um alerta, mesmo que seja falso positivo",
                false,
            ],
            [
                "Substituindo completamente a necessidade de uma equipe de segurança monitorar a rede",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de armazenamento em nuvem precisa criptografar um volume de dados de 500 terabytes em repouso, priorizando o menor impacto possível no desempenho. Qual tipo de criptografia é mais indicado para esse cenário?",
        explanation:
            "A criptografia simétrica usa uma única chave para cifrar e decifrar, o que exige bem menos processamento do que a assimétrica, sendo a escolha natural para cifrar grandes volumes de dados em repouso. A criptografia assimétrica é mais lenta e costuma ser usada para troca de chaves ou assinaturas, não para cifrar diretamente grandes massas de dados. Hashing não é reversível, então não serve para proteger dados que precisam ser recuperados depois. Assinatura digital garante integridade e autenticidade, não confidencialidade.",
        topic: "Operações de Segurança",
        options: [
            [
                "Criptografia simétrica, porque usa a mesma chave para cifrar e decifrar e tem desempenho melhor em grandes volumes de dados",
                true,
            ],
            [
                "Criptografia assimétrica, porque o par de chaves pública e privada elimina a necessidade de proteger uma chave compartilhada",
                false,
            ],
            [
                "Hashing, porque transforma os dados em um valor de tamanho fixo que pode ser revertido quando necessário",
                false,
            ],
            [
                "Assinatura digital, porque garante que os dados não foram alterados durante o armazenamento",
                false,
            ],
        ],
    },
    {
        statement:
            "Duas empresas que nunca compartilharam nenhuma informação antes precisam estabelecer uma comunicação segura pela internet, sem ter tido qualquer canal seguro anterior para combinar uma chave secreta. Qual recurso de criptografia resolve esse problema?",
        explanation:
            "A criptografia assimétrica usa um par de chaves, uma pública e outra privada, que permite a duas partes que nunca se encontraram estabelecer uma comunicação segura e combinar uma chave de sessão sem precisar de um canal seguro anterior. A criptografia simétrica, ao contrário, exige que a mesma chave já esteja compartilhada de forma segura entre as partes, o que é justamente o problema do cenário. Hashing não cria nem troca chaves, apenas gera um valor de verificação a partir de dados já existentes. E uma VPN também depende de troca de chaves nos bastidores para formar o túnel seguro, então não elimina o problema, apenas o resolve usando o mesmo princípio de criptografia assimétrica por trás.",
        topic: "Operações de Segurança",
        options: [
            ["Criptografia simétrica", false],
            [
                "Hashing, que gera um valor fixo a partir dos dados e permite que as partes validem a chave combinada entre si",
                false,
            ],
            ["Criptografia assimétrica", true],
            [
                "Uma VPN, que cria um túnel seguro automaticamente entre as duas redes, sem qualquer necessidade de troca de chaves nos bastidores",
                false,
            ],
        ],
    },
    {
        statement:
            "Um desenvolvedor está implementando o cadastro de usuários de um sistema e precisa decidir como armazenar as senhas no banco de dados, de forma que, mesmo se o banco for comprometido, um invasor não consiga recuperar a senha original diretamente. Qual é a abordagem correta?",
        explanation:
            "Uma função de hash com salt é unidirecional: não é possível reverter o valor de hash para obter a senha original, e o salt evita que senhas iguais gerem o mesmo hash, dificultando ataques com tabelas prontas de senhas conhecidas (rainbow tables). Criptografar a senha, seja com algoritmo simétrico ou assimétrico, é reversível: quem tiver acesso à chave correspondente consegue recuperar a senha original, o que é justamente o risco que se quer evitar. Guardar a senha em texto puro é uma prática insegura mesmo com controle de acesso à tabela, pois qualquer falha de configuração ou vazamento expõe as senhas diretamente.",
        topic: "Operações de Segurança",
        options: [
            [
                "Criptografar a senha com um algoritmo simétrico, guardando a chave de decriptação na mesma tabela do banco de dados",
                false,
            ],
            ["Criptografar a senha com a chave pública da empresa", false],
            [
                "Armazenar a senha em texto puro, mas restringir o acesso à tabela apenas para administradores do banco de dados",
                false,
            ],
            ["Aplicar uma função de hash com salt sobre a senha antes de armazená-la", true],
        ],
    },
    {
        statement:
            "Uma empresa organiza suas informações em quatro níveis de classificação: pública, interna, confidencial e restrita. Um analista encontra uma planilha com nomes completos, CPFs e dados de cartão de crédito de clientes. Em qual nível essa planilha deve ser classificada?",
        explanation:
            "Dados pessoais e financeiros de clientes, como CPF e número de cartão de crédito, estão entre os mais sensíveis que uma empresa manuseia, por isso pertencem ao nível mais alto de classificação (confidencial ou restrita), com controles adicionais de acesso, criptografia e monitoramento. Classificar como interna subestima o risco, porque esse nível costuma ser reservado a informações de uso corporativo sem alta sensibilidade. Classificar como pública ignora completamente a exposição de dados de clientes a qualquer pessoa. E dizer que a classificação não é necessária contraria o próprio propósito do manuseio de dados, que usa a classificação para definir os controles adequados a cada tipo de informação, além do simples controle de acesso ao sistema de arquivos.",
        topic: "Operações de Segurança",
        options: [
            [
                "Interna, pois o acesso já é limitado aos funcionários da empresa, o que é suficiente para proteger dados de clientes",
                false,
            ],
            [
                "Restrita ou confidencial, já que dados pessoais e financeiros de clientes exigem o maior grau de proteção",
                true,
            ],
            [
                "Pública, porque a planilha não contém segredos comerciais nem propriedade intelectual da empresa",
                false,
            ],
            [
                "A classificação não é necessária nesse caso, pois o controle de acesso ao sistema de arquivos já protege o conteúdo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa vai descartar um lote de HDs antigos que armazenaram dados financeiros de clientes por anos. Qual é a prática mais adequada antes do descarte físico desses discos?",
        explanation:
            "A destruição segura, por métodos como desmagnetização ou trituração física, garante que os dados não possam ser recuperados depois do descarte, o que é essencial quando o disco guardou informações sensíveis. Formatar o disco ou apagar arquivos manualmente não remove os dados de fato: eles continuam recuperáveis com ferramentas forenses, porque essas operações só removem as referências aos arquivos, não o conteúdo gravado. Guardar os discos indefinidamente não resolve o problema, apenas adia o risco, além de contrariar boas práticas de retenção, que recomendam descartar dados que não têm mais motivo para existir.",
        topic: "Operações de Segurança",
        options: [
            [
                "Realizar a destruição segura dos dados, como desmagnetização (degaussing) ou trituração física",
                true,
            ],
            [
                "Formatar os discos pelo sistema operacional e depois descartá-los normalmente",
                false,
            ],
            ["Excluir manualmente os arquivos visíveis nos discos antes do descarte", false],
            [
                "Guardar os discos indefinidamente em um local seguro em vez de descartá-los, para evitar qualquer risco de vazamento",
                false,
            ],
        ],
    },
    {
        statement:
            "O time de segurança de uma empresa percebe que os registros (logs) de firewalls, servidores e estações de trabalho ficam armazenados apenas localmente, cada um em seu próprio equipamento. Qual é o principal problema de segurança dessa abordagem?",
        explanation:
            "Quando os logs ficam espalhados, cada um isolado em seu próprio equipamento, o time de segurança perde a visão do todo: um ataque que passa por firewall, servidor e estação de trabalho deixa rastros separados, difíceis de conectar sem uma visão centralizada, que é justamente o papel de um SIEM ao agregar e correlacionar logs de múltiplas fontes. O custo de armazenamento é uma questão secundária, não o principal risco de segurança. Acesso remoto a logs locais costuma ser possível por outras vias, e a criptografia automática de logs pelo sistema operacional não é um comportamento padrão nem o problema central do cenário.",
        topic: "Operações de Segurança",
        options: [
            [
                "Os logs locais ocupam mais espaço em disco do que logs armazenados remotamente, o que aumenta o custo de armazenamento",
                false,
            ],
            [
                "Os logs locais não podem ser lidos por administradores sem acesso físico ao equipamento",
                false,
            ],
            [
                "Os logs locais são criptografados automaticamente pelo sistema operacional, o que dificulta a auditoria",
                false,
            ],
            [
                "Fica muito mais difícil correlacionar eventos entre sistemas e detectar um ataque que passe por vários equipamentos",
                true,
            ],
        ],
    },
    {
        statement:
            "Durante uma investigação, o time de segurança percebe que os logs de um servidor comprometido foram apagados pelo próprio invasor para esconder seus rastros. Qual prática de logging poderia ter evitado essa perda de evidências?",
        explanation:
            "Enviar os logs em tempo real para um servidor centralizado, fora do alcance do sistema comprometido, é a prática que protege as evidências: mesmo que o invasor apague os registros locais, uma cópia já estará em um local que ele não controla. Aumentar o tamanho do arquivo local não impede que o invasor, já com acesso ao servidor, apague ou altere os logs. Gerar logs só quando um alerta dispara reduz a visibilidade geral e pode deixar de registrar justamente as ações do invasor antes de o alerta existir. Restringir a leitura ao administrador local não protege contra um invasor que já obteve esse mesmo nível de acesso no servidor comprometido.",
        topic: "Operações de Segurança",
        options: [
            [
                "Aumentar o tamanho máximo do arquivo de log local, para que ele nunca precise ser rotacionado",
                false,
            ],
            [
                "Configurar o sistema para gerar logs apenas quando um alerta de segurança for disparado",
                false,
            ],
            [
                "Enviar os logs em tempo real para um servidor centralizado e protegido, separado de quem os gera",
                true,
            ],
            ["Restringir a leitura dos logs apenas ao administrador do próprio servidor", false],
        ],
    },
    {
        statement:
            "Antes de colocar um novo servidor em produção, a equipe de TI precisa aplicar hardening no sistema operacional recém-instalado. Qual das ações a seguir é um exemplo correto dessa prática?",
        explanation:
            "Hardening consiste em reduzir a superfície de ataque de um sistema antes de colocá-lo em uso, o que inclui desativar serviços, portas e contas que não são necessários, além de substituir senhas e configurações padrão de fábrica, que costumam ser públicas e conhecidas. Instalar mais ferramentas de administração remota aumenta, em vez de reduzir, a superfície de ataque. Manter configurações de fábrica é um erro comum, pois elas priorizam facilidade de uso, não segurança. E esperar o servidor entrar em produção para revisar isso expõe o sistema durante todo esse intervalo, quando o hardening deveria ser aplicado antes de o sistema ficar acessível.",
        topic: "Operações de Segurança",
        options: [
            [
                "Instalar o maior número possível de ferramentas de administração remota, para facilitar o suporte técnico no futuro",
                false,
            ],
            [
                "Desativar serviços e portas desnecessários para a função do servidor e trocar as senhas padrão de fábrica",
                true,
            ],
            [
                "Manter as configurações padrão de fábrica, já que o fabricante já testou a segurança dessas configurações",
                false,
            ],
            [
                "Aguardar até o servidor entrar em produção para então revisar quais serviços podem ser desativados",
                false,
            ],
        ],
    },
    {
        statement:
            "Um fornecedor libera uma atualização crítica de segurança para um sistema usado pela empresa. Qual é a prática mais recomendada antes de aplicar esse patch em todos os servidores de produção?",
        explanation:
            "Mesmo quando um patch é crítico, a prática recomendada é testá-lo primeiro em um ambiente de homologação, que reproduz a produção sem os mesmos riscos, para identificar problemas de compatibilidade antes de uma aplicação ampla. Aplicar direto em produção, sem teste, pode causar indisponibilidade caso o patch tenha algum efeito colateral, trocando um risco de segurança por um risco operacional. Esperar o ciclo trimestral de manutenção é perigoso demais para uma atualização crítica, que pode estar corrigindo uma vulnerabilidade já explorada ativamente. Desativar o sistema até uma nova versão completa não é uma prática real de gestão de patches e deixaria a empresa sem o serviço por tempo indeterminado.",
        topic: "Operações de Segurança",
        options: [
            ["Testar o patch em um ambiente de homologação, separado da produção", true],
            ["Aplicar o patch imediatamente em todos os servidores de produção", false],
            [
                "Esperar o próximo ciclo trimestral de manutenção programada, já que patches podem sempre ser aplicados em lote depois",
                false,
            ],
            [
                "Desativar o sistema até que a próxima versão completa do software seja lançada, evitando aplicar patches isolados",
                false,
            ],
        ],
    },
    {
        statement:
            "Um funcionário passa a usar o e-mail corporativo para divulgar e vender produtos de um negócio pessoal fora do horário de trabalho. Qual política define claramente se esse uso é permitido ou não?",
        explanation:
            "A Política de Uso Aceitável (Acceptable Use Policy, AUP) é o documento que define o que é e o que não é permitido no uso dos recursos de TI da empresa, como e-mail corporativo, internet e equipamentos, incluindo o uso para fins pessoais. A política de BYOD trata especificamente de dispositivos pessoais dos funcionários, não do uso de recursos corporativos. A gestão de mudanças trata da aprovação de alterações técnicas em sistemas, sem relação com conduta de uso. E a política de privacidade regula o tratamento de dados pessoais de terceiros, não o comportamento do próprio funcionário com os recursos da empresa.",
        topic: "Operações de Segurança",
        options: [
            [
                "Política de BYOD, que trata do uso de dispositivos pessoais para acessar recursos corporativos",
                false,
            ],
            [
                "Política de gestão de mudanças, que define como alterações em sistemas de produção devem ser aprovadas",
                false,
            ],
            [
                "Política de privacidade, que define como os dados pessoais de clientes e funcionários são tratados",
                false,
            ],
            [
                "Política de Uso Aceitável (AUP), que estabelece as regras de uso apropriado dos recursos de TI da empresa",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa decide permitir que os funcionários acessem o e-mail corporativo e alguns sistemas internos pelo próprio celular pessoal. Qual controle é mais indicado para reduzir o risco de segurança dessa prática, dentro de uma política de BYOD?",
        explanation:
            "Uma solução de MDM permite aplicar políticas de segurança no dispositivo pessoal, como exigência de senha e criptografia, e principalmente a possibilidade de apagar remotamente apenas os dados corporativos em caso de perda, roubo ou desligamento do funcionário, sem afetar os dados pessoais dele. Proibir bloqueio de tela vai na direção contrária da segurança. Permitir acesso sem nenhum controle ignora que o dispositivo passará a acessar dados corporativos sensíveis, independentemente de quem é o dono do aparelho. E exigir um segundo celular exclusivo descaracteriza o próprio conceito de BYOD, que é justamente usar o dispositivo pessoal já existente.",
        topic: "Operações de Segurança",
        options: [
            [
                "Proibir qualquer tipo de senha ou bloqueio de tela no celular pessoal, para agilizar o acesso aos dados da empresa",
                false,
            ],
            [
                "Permitir o acesso sem qualquer controle adicional, já que o dispositivo pertence ao funcionário e não à empresa",
                false,
            ],
            [
                "Exigir a inscrição do dispositivo em uma solução de gerenciamento de dispositivos móveis (MDM)",
                true,
            ],
            [
                "Exigir que o funcionário compre um segundo celular exclusivo para uso pessoal",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa mantém uma política que obriga os funcionários a trocar a senha a cada 30 dias, com o requisito mínimo de apenas 6 caracteres. Na prática, muitos funcionários passam a usar padrões previsíveis, como acrescentar um número no final da mesma senha a cada troca. Qual mudança de política melhoraria a segurança de forma mais eficaz?",
        explanation:
            "Diretrizes atuais de segurança mostram que senhas mais longas, como frases secretas, combinadas com autenticação multifator, protegem muito mais do que a troca forçada frequente, que na prática incentiva os usuários a criarem padrões previsíveis e fáceis de adivinhar, como no cenário descrito. Reduzir ainda mais o intervalo de troca reforça esse comportamento problemático, piorando a situação. Proibir apenas uma palavra específica é uma medida cosmética que não resolve o padrão previsível criado pela troca frequente. Substituir por um PIN de 4 dígitos reduz drasticamente o espaço de combinações possíveis, tornando a senha muito mais fácil de quebrar.",
        topic: "Operações de Segurança",
        options: [
            [
                "Reduzir o intervalo de troca de senha para a cada 15 dias, mantendo o requisito mínimo de 6 caracteres",
                false,
            ],
            [
                "Exigir senhas mais longas (como uma frase secreta) e habilitar MFA, reduzindo a dependência da troca frequente",
                true,
            ],
            [
                'Manter a política atual, mas proibir apenas o uso da palavra "senha" como parte da senha',
                false,
            ],
            [
                "Eliminar completamente qualquer requisito de senha, substituindo por apenas um PIN numérico de 4 dígitos para simplificar o acesso",
                false,
            ],
        ],
    },
    {
        statement:
            "Um funcionário recebe uma ligação de alguém se identificando como técnico do suporte de TI, que afirma precisar da senha do funcionário para resolver com urgência uma falha no sistema. Que tipo de ataque esse cenário representa?",
        explanation:
            "O cenário descreve pretexting, uma técnica de engenharia social em que o atacante inventa um pretexto (nesse caso, se passar por suporte técnico) para convencer a vítima a entregar informações sensíveis, como uma senha. Não há tentativa de adivinhar a senha por múltiplas combinações, o que descartaria força bruta. Também não há interceptação de comunicação entre duas partes legítimas, o que descartaria man in the middle. E não há sobrecarga de um sistema para tirá-lo do ar, o que descartaria negação de serviço.",
        topic: "Operações de Segurança",
        options: [
            ["Engenharia social, mais especificamente pretexting", true],
            [
                "Ataque de força bruta, em que o atacante tenta adivinhar a senha testando diversas combinações possíveis",
                false,
            ],
            [
                "Man in the middle, em que o atacante intercepta a comunicação entre o funcionário e o servidor de e-mail",
                false,
            ],
            ["Ataque de negação de serviço", false],
        ],
    },
    {
        statement:
            "Depois de um ano realizando campanhas simuladas de phishing e treinamentos periódicos de conscientização, uma empresa percebe que a taxa de funcionários que clicam em links maliciosos simulados caiu significativamente. O que esse resultado demonstra sobre o papel do treinamento de segurança?",
        explanation:
            "A queda na taxa de cliques em phishing simulado mostra que o treinamento contínuo funciona: pessoas bem treinadas reconhecem e reportam tentativas de engenharia social com mais frequência, reduzindo a chance de um ataque real ter sucesso. Isso não significa que o risco foi eliminado, nem que outros controles técnicos deixaram de ser necessários, treinamento é uma camada a mais de defesa, não um substituto. Reduzir a frequência dos treinamentos por causa de um bom resultado tende a reverter o ganho obtido, já que a conscientização precisa ser reforçada continuamente. E abandonar o treinamento humano em favor de filtros técnicos contraria o próprio resultado positivo descrito no cenário.",
        topic: "Operações de Segurança",
        options: [
            [
                "O treinamento eliminou totalmente o risco de engenharia social na empresa, tornando desnecessários outros controles técnicos",
                false,
            ],
            [
                "A queda na taxa de cliques mostra que a empresa já pode reduzir a frequência dos treinamentos, já que o problema foi resolvido",
                false,
            ],
            [
                "O resultado indica que a empresa deveria substituir o treinamento humano por filtros técnicos de e-mail, já que as pessoas continuam sendo o maior risco",
                false,
            ],
            [
                "Treinar continuamente os funcionários reduz o risco de engenharia social, porque as pessoas aprendem a reconhecer e reportar tentativas de ataque",
                true,
            ],
        ],
    },
    {
        statement:
            "O centro de operações de segurança (SOC) de uma empresa recebe milhares de alertas por dia vindos de firewalls, antivírus e sistemas de detecção de intrusão, e a maioria são falsos positivos. Os poucos analistas da equipe não conseguem revisar tudo manualmente. Como a inteligência artificial em uma ferramenta de SIEM pode ajudar nesse cenário?",
        explanation:
            "A IA aplicada a um SIEM ajuda justamente a lidar com o volume alto de alertas: ela correlaciona eventos de diferentes fontes, identifica padrões que indicam ameaças reais e prioriza o que merece atenção humana, reduzindo a fadiga de alertas da equipe. Isso não elimina a necessidade de analistas, que continuam responsáveis por investigar e decidir sobre os alertas priorizados. A ferramenta também não impede ataques sozinha: ela apoia a detecção e a análise, enquanto a prevenção depende de outros controles, como firewalls e IPS. E a IA depende diretamente dos logs e eventos coletados para funcionar: sem esses dados, não haveria nada para correlacionar ou analisar.",
        topic: "Operações de Segurança",
        options: [
            [
                "Eliminando totalmente a necessidade de analistas humanos revisarem qualquer alerta gerado pelo SIEM",
                false,
            ],
            [
                "Correlacionando eventos de múltiplas fontes e priorizando os alertas mais prováveis, reduzindo a análise manual",
                true,
            ],
            [
                "Impedindo automaticamente qualquer tentativa futura de ataque, sem a necessidade de outros controles de segurança",
                false,
            ],
            [
                "Substituindo a necessidade de logs detalhados dos sistemas, já que a IA consegue prever ameaças sem dados históricos",
                false,
            ],
        ],
    },
    {
        statement:
            "Um desenvolvedor cola um trecho do código-fonte proprietário da empresa, incluindo uma chave de API interna, em um chatbot de IA generativa disponível publicamente na internet, para pedir ajuda a depurar um erro. Qual é o principal risco de segurança dessa ação?",
        explanation:
            "Serviços públicos de IA generativa podem reter, registrar ou até usar os dados enviados para treinar futuros modelos, dependendo dos termos do serviço, o que tira da empresa o controle sobre informações sensíveis, como código-fonte proprietário e chaves de API, caracterizando um vazamento de dados. O chatbot recusar a resposta seria apenas um inconveniente, não o risco de segurança em questão. Não é verdade que o uso dessas ferramentas seja proibido por lei em todo lugar: o problema é o tipo de dado compartilhado, não a ferramenta em si. E o código-fonte continua funcionando normalmente depois de ser colado em um chatbot. Isso não tem relação com o risco real do cenário, que é o vazamento de informação confidencial.",
        topic: "Operações de Segurança",
        options: [
            [
                "O chatbot pode se recusar a responder perguntas técnicas sobre código-fonte, o que atrasaria a resolução do problema",
                false,
            ],
            [
                "O uso de ferramentas de IA generativa é sempre proibido por lei em qualquer país, independentemente do conteúdo enviado",
                false,
            ],
            [
                "Os dados enviados podem ser armazenados ou usados pelo provedor da IA, expondo informações confidenciais da empresa",
                true,
            ],
            [
                "O código-fonte enviado deixa de funcionar corretamente depois de ser processado pela IA",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao receber um e-mail supostamente enviado pelo diretor financeiro, o sistema verifica a assinatura digital anexada e confirma que a mensagem realmente partiu dele, e não de um impostor. Qual propriedade de segurança está sendo garantida nesse momento?",
        explanation:
            "A autenticidade garante que a origem alegada de uma comunicação é genuína, o que a verificação da assinatura comprova. Confidencialidade trata do sigilo do conteúdo, disponibilidade do acesso e redundância de cópias, sem confirmar quem enviou a mensagem.",
        topic: "Princípios de Segurança",
        options: [
            ["A disponibilidade.", false],
            [
                "A confidencialidade, que impede que pessoas não autorizadas leiam o conteúdo da mensagem transmitida.",
                false,
            ],
            ["A autenticidade, que confirma que a origem alegada da comunicação é genuína.", true],
            [
                "A redundância, que mantém cópias adicionais da mensagem em servidores distintos para evitar perda de dados.",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao acessar um sistema, João primeiro informa seu nome de usuário, depois digita a senha e, por fim, o sistema verifica que ele pode abrir apenas os relatórios do setor de vendas. Esses três momentos correspondem, respectivamente, a:",
        explanation:
            "Informar o usuário é identificação, comprovar a identidade com a senha é autenticação e definir o que ele pode acessar é autorização. As demais opções trocam a ordem das etapas ou incluem auditoria, que é o registro posterior das ações.",
        topic: "Princípios de Segurança",
        options: [
            ["Identificação, autenticação e autorização.", true],
            ["Autenticação, identificação e auditoria.", false],
            ["Autorização, autenticação e identificação.", false],
            ["Identificação, autorização e responsabilização (accountability).", false],
        ],
    },
    {
        statement:
            "Um banco afirma ter implantado autenticação multifator ao exigir, no login, uma senha e também um PIN numérico memorizado pelo cliente. Um auditor aponta que isso não caracteriza MFA verdadeira. Qual é a justificativa correta?",
        explanation:
            "MFA exige combinar fatores de categorias distintas (algo que se sabe, se tem ou se é); senha e PIN são ambos algo que o usuário sabe, então contam como um único fator. Não são necessários quatro fatores, nem a fraqueza relativa ou o meio de digitação é o motivo.",
        topic: "Princípios de Segurança",
        options: [
            ["MFA exige no mínimo quatro fatores diferentes combinados entre si.", false],
            [
                "O PIN é considerado um fator mais fraco e por isso é desconsiderado na contagem.",
                false,
            ],
            [
                "Como ambos são digitados pelo teclado, o sistema os trata como um único dado de entrada combinado.",
                false,
            ],
            [
                "Senha e PIN pertencem ao mesmo fator de autenticação, algo que o usuário sabe.",
                true,
            ],
        ],
    },
    {
        statement:
            "Durante a análise de risco de um data center, a equipe lista enchentes, um funcionário mal-intencionado e falhas de energia como possíveis causas de dano aos ativos. Como esses itens são classificados na gestão de risco?",
        explanation:
            "Ameaça é qualquer evento ou agente com potencial de causar dano a um ativo. Vulnerabilidade é a fraqueza que a ameaça explora, risco residual é o que permanece após os controles e salvaguardas são os próprios controles de proteção.",
        topic: "Princípios de Segurança",
        options: [
            ["Vulnerabilidades, pois representam fraquezas internas dos sistemas.", false],
            ["Ameaças, pois são eventos ou agentes com potencial de causar dano.", true],
            ["Riscos residuais que permanecem após a aplicação dos controles.", false],
            [
                "Salvaguardas, pois indicam onde controles de proteção precisarão futuramente ser implementados.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa priorizar dois riscos: um com alta probabilidade de ocorrer, mas impacto financeiro pequeno, e outro com baixa probabilidade, porém impacto potencialmente catastrófico. Qual é a forma mais adequada de comparar a severidade dos dois?",
        explanation:
            "A severidade de um risco resulta da combinação entre probabilidade e impacto, não de apenas um dos fatores isoladamente. Olhar só a probabilidade ou só o impacto distorce a priorização, e adiar a análise até a concretização anula o propósito da gestão de risco.",
        topic: "Princípios de Segurança",
        options: [
            [
                "Considerar apenas a probabilidade, tratando primeiro o que tem mais chance de ocorrer.",
                false,
            ],
            ["Considerar apenas o impacto, tratando primeiro o de maior perda potencial.", false],
            ["Avaliar cada risco combinando sua probabilidade com o impacto esperado.", true],
            [
                "Ignorar ambos até que um deles efetivamente se concretize e gere prejuízo mensurável à operação.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa avalia lançar um aplicativo que coletaria dados de saúde dos usuários, mas conclui que os riscos regulatórios e de vazamento superam qualquer benefício e decide cancelar o projeto por completo. Que tratamento de risco foi adotado?",
        explanation:
            "Cancelar por completo a atividade que gera o risco caracteriza evitar o risco. Mitigar seria reduzir o risco com controles, transferir seria repassá-lo a terceiros e aceitar seria conviver com ele mantendo o projeto.",
        topic: "Princípios de Segurança",
        options: [
            ["Evitar o risco.", true],
            ["Mitigar o risco.", false],
            ["Transferir o risco.", false],
            ["Aceitar o risco como parte do custo de inovação da organização.", false],
        ],
    },
    {
        statement:
            "Preocupada com invasões, uma empresa mantém no ar o serviço online que precisa oferecer, mas instala firewall, sistema de detecção de intrusão e aplica atualizações de segurança para reduzir a chance de comprometimento. Esse tratamento de risco é chamado de:",
        explanation:
            "Aplicar controles para reduzir a probabilidade ou o impacto, mantendo a atividade, é mitigar o risco. A empresa não deixou de oferecer o serviço (não evitou), não o repassou a terceiros (não transferiu) e não escolheu apenas conviver com ele (não aceitou).",
        topic: "Princípios de Segurança",
        options: [
            ["Aceitação do risco.", false],
            ["Transferência do risco.", false],
            ["Evitação do risco, já que a empresa deixa de expor o serviço à internet.", false],
            ["Mitigação do risco.", true],
        ],
    },
    {
        statement:
            "Após avaliar o risco de um servidor interno de testes ficar indisponível por algumas horas, a direção conclui que o impacto é mínimo e que qualquer proteção adicional não se justifica, optando por não tomar nenhuma ação além de documentar a decisão. Esse tratamento é:",
        explanation:
            "Reconhecer o risco, julgá-lo tolerável e conviver com ele de forma consciente e documentada é aceitar o risco. Não houve controle adicional (mitigar), repasse a terceiros (transferir) nem eliminação da atividade (evitar).",
        topic: "Princípios de Segurança",
        options: [
            ["Transferência do risco.", false],
            ["Aceitação do risco.", true],
            ["Mitigação do risco.", false],
            [
                "Evitação do risco, com a desativação definitiva do servidor de testes envolvido.",
                false,
            ],
        ],
    },
    {
        statement:
            "Depois de implantar criptografia, controle de acesso e backups para proteger um banco de dados, a equipe reconhece que ainda permanece uma pequena chance de comprometimento. Como se chama o risco que permanece após a aplicação dos controles?",
        explanation:
            "Risco residual é o que sobra após a aplicação dos controles. Risco inerente é o existente antes de qualquer controle e apetite de risco é quanto risco a organização se dispõe a assumir, nenhum deles correspondendo ao que remanesce.",
        topic: "Princípios de Segurança",
        options: [
            ["Risco inerente.", false],
            ["Apetite de risco.", false],
            ["Risco residual.", true],
            [
                "Risco total, que corresponde à soma de todas as ameaças mapeadas no ambiente.",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao classificar seus controles de segurança, uma empresa precisa enquadrar a política de mesa limpa, o treinamento de conscientização e a verificação de antecedentes de candidatos. A que categoria de controle esses três exemplos pertencem?",
        explanation:
            "Políticas, treinamentos e verificações de RH são controles administrativos, baseados em regras e processos definidos por pessoas. Controles físicos protegem o ambiente, técnicos atuam por meio de tecnologia e corretivo se refere à função, não à natureza do controle.",
        topic: "Princípios de Segurança",
        options: [
            ["Controles administrativos.", true],
            ["Controles físicos.", false],
            ["Controles técnicos, também chamados de lógicos.", false],
            [
                "Controles corretivos, aplicados somente após a ocorrência de um incidente de segurança.",
                false,
            ],
        ],
    },
    {
        statement:
            "Após um ataque de ransomware criptografar arquivos, a equipe restaura os dados a partir dos backups e reconstrói os servidores afetados para retornar à operação normal. Quanto à função, esse tipo de controle é classificado como:",
        explanation:
            "Controles corretivos atuam após o incidente para restaurar a operação, como a restauração de backups. Preventivos buscam impedir o incidente, detectivos identificam sua ocorrência e dissuasórios desencorajam o atacante antes da ação.",
        topic: "Princípios de Segurança",
        options: [
            ["Preventivo.", false],
            ["Detectivo.", false],
            [
                "Dissuasório, cujo objetivo é desencorajar o atacante antes de qualquer tentativa.",
                false,
            ],
            ["Corretivo.", true],
        ],
    },
    {
        statement:
            "Uma empresa instala placas visíveis avisando que o local é monitorado e mantém um carro de segurança estacionado à vista na entrada, com o objetivo principal de desencorajar invasores antes que tentem qualquer ação. Quanto à função, esses controles são classificados como:",
        explanation:
            "Controles dissuasórios buscam desencorajar a ação antes que ela ocorra, como avisos e presença ostensiva de segurança. Detectivos identificam eventos, corretivos restauram após o fato e compensatórios substituem outro controle que não pôde ser implementado.",
        topic: "Princípios de Segurança",
        options: [
            ["Corretivos.", false],
            ["Dissuasórios.", true],
            ["Detectivos.", false],
            [
                "Compensatórios, adotados como alternativa quando o controle principal não pode ser implementado.",
                false,
            ],
        ],
    },
    {
        statement:
            "No conjunto de documentos de governança de uma empresa, um deles reúne recomendações e boas práticas sugeridas, que as equipes podem seguir com flexibilidade e sem caráter obrigatório. Esse tipo de documento é conhecido como:",
        explanation:
            "Diretrizes são recomendações e boas práticas de caráter opcional. Políticas definem intenções de alto nível, normas estabelecem requisitos obrigatórios específicos e procedimentos detalham passos obrigatórios de execução.",
        topic: "Princípios de Segurança",
        options: [
            ["Política (policy).", false],
            ["Norma ou padrão (standard).", false],
            ["Diretriz (guideline).", true],
            [
                "Procedimento (procedure), que descreve o passo a passo obrigatório a ser executado.",
                false,
            ],
        ],
    },
    {
        statement:
            "A diretoria de uma empresa publica uma declaração de alto nível afirmando que todo dado de cliente deve ser protegido. Em seguida, a área técnica precisa criar um documento obrigatório determinando que todos os discos sejam criptografados com AES de 256 bits. Esse documento técnico e obrigatório é:",
        explanation:
            "Normas (standards) estabelecem requisitos obrigatórios e específicos, como o algoritmo de criptografia a ser usado, dando concretude à política. Diretrizes são recomendações opcionais, a política é a declaração de alto nível e leis vêm de autoridades externas.",
        topic: "Princípios de Segurança",
        options: [
            ["Uma norma (standard).", true],
            ["Uma diretriz (guideline).", false],
            ["Uma política (policy).", false],
            ["Uma lei, imposta por um órgão externo de regulação do setor de tecnologia.", false],
        ],
    },
    {
        statement:
            "Um analista precisa distinguir duas proteções: cifrar um banco de dados para que apenas pessoas autorizadas leiam seu conteúdo e calcular um valor de hash para perceber se os registros foram alterados sem autorização. Essas duas medidas protegem, respectivamente:",
        explanation:
            "Cifrar para impedir a leitura não autorizada protege a confidencialidade; verificar alterações por hash protege a integridade. Disponibilidade trata do acesso quando necessário e autenticidade da origem, que não são o foco dessas duas medidas.",
        topic: "Princípios de Segurança",
        options: [
            ["A integridade e a disponibilidade.", false],
            ["A disponibilidade e a autenticidade.", false],
            [
                "A confidencialidade e a disponibilidade, garantindo sigilo e acesso contínuo aos registros armazenados.",
                false,
            ],
            ["A confidencialidade e a integridade.", true],
        ],
    },
    {
        statement:
            "Uma empresa mantém constantemente uma equipe pesquisando novas ameaças, revisando fornecedores e verificando se seus controles continuam adequados ao longo do tempo. Essa conduta contínua de investigar e acompanhar para tomar decisões informadas é melhor descrita como:",
        explanation:
            "Due diligence é o esforço contínuo de investigar, monitorar e reunir informações para agir de forma responsável. Due care é a aplicação prática das medidas de proteção no dia a dia; os demais termos tratam de acesso e de risco.",
        topic: "Princípios de Segurança",
        options: [
            ["Due care (devido cuidado).", false],
            ["Due diligence (devida diligência).", true],
            ["Separação de funções.", false],
            [
                "Aceitação de risco formalizada por meio de um termo assinado pela alta direção.",
                false,
            ],
        ],
    },
    {
        statement:
            "Em vez de confiar apenas na senha de login, a empresa protege um sistema crítico combinando senha, autenticação em duas etapas, criptografia dos dados, segmentação de rede e monitoramento de acessos, de modo que a falha de uma camada não comprometa todo o conjunto. Que princípio orienta essa abordagem?",
        explanation:
            "Defesa em profundidade empilha múltiplas camadas de controle para que a falha de uma não exponha todo o sistema. Privilégio mínimo limita permissões, não repúdio impede negar autoria e segurança por obscuridade aposta em esconder detalhes, o que não é o caso.",
        topic: "Princípios de Segurança",
        options: [
            ["Privilégio mínimo.", false],
            ["Não repúdio.", false],
            ["Defesa em profundidade.", true],
            [
                "Segurança por obscuridade, que se baseia em manter secretos os detalhes de funcionamento do sistema.",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao revisar quais dados exigem proteção reforçada de privacidade, uma equipe analisa uma lista de campos. Qual dos itens a seguir é uma informação pessoal identificável (PII) que merece esse tratamento?",
        explanation:
            "O CPF identifica uma pessoa específica, sendo uma informação pessoal identificável (PII). Cotação do dólar, horário de funcionamento e versão de sistema operacional não identificam indivíduos e não são dados pessoais.",
        topic: "Princípios de Segurança",
        options: [
            ["O número de CPF de um cliente da loja.", true],
            ["A cotação atual do dólar comercial.", false],
            ["O horário de funcionamento da loja divulgado ao público.", false],
            [
                "A versão do sistema operacional instalada em um servidor de uso interno da empresa.",
                false,
            ],
        ],
    },
    {
        statement:
            "O Código de Ética da ISC2 organiza a conduta dos profissionais em quatro cânones ordenados por prioridade. Qual preocupação o primeiro cânone coloca acima das demais?",
        explanation:
            "O primeiro cânone determina proteger a sociedade, o bem comum e a confiança pública, tendo precedência sobre os demais. Agir com honra, servir bem os contratantes e zelar pela profissão são os cânones seguintes, subordinados a esse.",
        topic: "Princípios de Segurança",
        options: [
            ["Agir de forma honrada, honesta e legal com cada cliente.", false],
            ["Prestar serviço diligente e competente aos contratantes.", false],
            [
                "Promover e proteger a reputação e o avanço contínuo da própria profissão de segurança.",
                false,
            ],
            ["Proteger a sociedade, o bem comum e a confiança pública.", true],
        ],
    },
    {
        statement:
            "A diretoria pergunta qual é a diferença essencial entre o plano de continuidade de negócios (BCP) e o plano de recuperação de desastres (DRP) da empresa. Qual resposta descreve corretamente essa distinção?",
        explanation:
            "O BCP tem escopo amplo e visa manter o negócio funcionando durante a crise; o DRP é o componente técnico voltado a restaurar sistemas e TI após o desastre. Eles não são o mesmo documento nem se limitam a backups, RH ou comunicação.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            [
                "O BCP trata apenas de backups de dados, ao passo que o DRP cuida da comunicação com a imprensa e com os clientes durante a crise.",
                false,
            ],
            [
                "O BCP mantém as funções essenciais do negócio operando durante a interrupção; o DRP foca em restaurar a TI depois do desastre.",
                true,
            ],
            [
                "O DRP é mais amplo e engloba o BCP, que cuidaria somente da folha de pagamento e dos recursos humanos da organização afetada.",
                false,
            ],
            ["Ambos são o mesmo documento, apenas com nomes diferentes conforme o setor.", false],
        ],
    },
    {
        statement:
            "O time de segurança nota atividades incomuns em um servidor, examina os logs para confirmar se realmente houve comprometimento, determina o escopo e classifica a gravidade da ocorrência. Nenhum sistema foi isolado ainda. A que fase da resposta a incidentes essa atuação corresponde?",
        explanation:
            "Identificar sinais, examinar logs e classificar a gravidade da ocorrência é a fase de detecção e análise. A preparação ocorre antes do incidente, a contenção só começa depois (e nada foi isolado ainda) e o pós-incidente vem ao final.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["Preparação.", false],
            ["Contenção, erradicação e recuperação.", false],
            [
                "Atividade pós-incidente, quando são documentadas as lições aprendidas com o caso.",
                false,
            ],
            ["Detecção e análise.", true],
        ],
    },
    {
        statement:
            "Encerrado um incidente e restabelecida a operação normal, a equipe se reúne para revisar o que funcionou, o que falhou e como atualizar os procedimentos para reduzir a chance de recorrência. Essa reunião faz parte de qual fase?",
        explanation:
            "Revisar o incidente já encerrado para extrair lições e melhorar os processos é a atividade pós-incidente. Detecção, contenção e erradicação acontecem durante o tratamento, e a preparação antecede qualquer incidente.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["Atividade pós-incidente (lições aprendidas).", true],
            ["Detecção e análise.", false],
            ["Contenção e erradicação.", false],
            [
                "Preparação, etapa em que a organização ainda está montando sua capacidade inicial de resposta.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um analista precisa usar a terminologia correta para três casos: um login de rotina bem-sucedido; um acesso não autorizado que efetivamente expôs dados de clientes; e uma tentativa suspeita que infringiu a política de segurança. Como esses casos são melhor classificados, respectivamente?",
        explanation:
            "Um login de rotina é apenas um evento (ocorrência observável); o acesso que expôs dados de clientes é uma violação (breach); a tentativa que infringiu a política é um incidente. Nem toda ocorrência é incidente, e nem todo incidente resulta em breach.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["Incidente, evento e violação de dados.", false],
            ["Violação de dados, incidente e evento.", false],
            ["Evento, violação de dados (breach) e incidente.", true],
            [
                "Todos são incidentes, diferenciados apenas pela gravidade e pelo momento em que são detectados pela equipe.",
                false,
            ],
        ],
    },
    {
        statement:
            "Atacantes começam a explorar uma falha em um software para a qual o fabricante ainda não disponibilizou correção, pois desconhecia o problema. O código ou técnica usado para tirar proveito dessa falha também tem um nome específico. Como se chamam, respectivamente, a falha e a técnica de exploração?",
        explanation:
            "Uma falha ainda desconhecida do fornecedor e sem correção é uma vulnerabilidade de dia zero (zero-day); o código ou técnica que a explora é o exploit. As demais opções invertem os termos ou citam conceitos não relacionados à pergunta.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["Exploit e vulnerabilidade de dia zero.", false],
            ["Vulnerabilidade de dia zero (zero-day) e exploit.", true],
            ["Incidente e violação de dados (breach).", false],
            [
                "Ameaça persistente avançada e engenharia social aplicada em larga escala contra os usuários.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um administrador quer uma estratégia de backup em que cada rotina diária copie somente os arquivos alterados desde o último backup completo, acumulando as mudanças até o próximo backup completo. Que tipo de backup atende a essa descrição?",
        explanation:
            "O backup diferencial copia tudo o que mudou desde o último backup completo, acumulando as alterações. O incremental copia apenas o que mudou desde o último backup de qualquer tipo, e o completo copia todos os dados a cada execução.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["Backup incremental.", false],
            ["Backup completo (full) diário.", false],
            [
                "Backup incremental combinado com espelhamento contínuo dos dados em tempo real.",
                false,
            ],
            ["Backup diferencial.", true],
        ],
    },
    {
        statement:
            "Uma empresa quer um local alternativo capaz de assumir a operação quase imediatamente após um desastre, com hardware, software e dados já replicados e prontos para uso. Que tipo de site de recuperação atende a essa necessidade?",
        explanation:
            "O hot site já possui hardware, software e dados replicados, permitindo retomar a operação quase imediatamente. O warm site tem infraestrutura parcial e exige configuração, o cold site oferece só o espaço básico, e backup offline demanda restauração demorada.",
        topic: "Continuidade, DR e Resposta a Incidentes",
        options: [
            ["Site quente (hot site).", true],
            ["Site morno (warm site).", false],
            ["Site frio (cold site).", false],
            [
                "Backup em nuvem armazenado offline, restaurado manualmente somente após a reconstrução completa do ambiente.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma analista percebe que os funcionários conseguem acessar sites digitando nomes como intranet.empresa.com, mas o serviço responsável por traduzir esses nomes em endereços IP parou de responder e ninguem mais consegue navegar por nome. Qual serviço apresentou falha?",
        explanation:
            "O DNS (Domain Name System), que opera tipicamente na porta 53, traduz nomes como intranet.empresa.com nos endereços IP correspondentes; sem ele, a navegacao por nome falha.",
        topic: "Segurança de Redes",
        options: [
            [
                "DHCP, que distribui automaticamente endereços IP e outras configurações de rede para os dispositivos que se conectam ao segmento",
                false,
            ],
            ["DNS, que resolve nomes de domínio para os endereços IP correspondentes", true],
            ["SMTP, responsável pelo envio de mensagens de e-mail entre servidores", false],
            ["ARP, que associa endereços IP a endereços físicos MAC dentro da rede local", false],
        ],
    },
    {
        statement:
            "Ao conectar um notebook novo a rede cabeada do escritorio, ele recebe automaticamente um endereço IP, a mascara de sub-rede e o gateway padrão, sem que o usuário configure nada manualmente. Qual protocolo fornece essas informações de forma automática?",
        explanation:
            "O DHCP (Dynamic Host Configuration Protocol) atribui dinamicamente endereço IP, mascara, gateway e servidores DNS aos dispositivos, dispensando a configuração manual.",
        topic: "Segurança de Redes",
        options: [
            [
                "DNS, responsável por converter nomes de domínio em endereços IP na internet e também dentro da rede interna da empresa",
                false,
            ],
            ["NAT, que traduz endereços privados em públicos na saída para a internet", false],
            [
                "DHCP, que atribui endereços IP e parâmetros de rede automaticamente aos dispositivos",
                true,
            ],
            ["SNMP, usado para monitorar e gerenciar equipamentos de rede remotamente", false],
        ],
    },
    {
        statement:
            "Uma empresa transfere diariamente arquivos com dados de clientes para um parceiro. A equipe de segurança descobre que o protocolo em uso envia login, senha e conteúdo em texto claro pela rede. Qual alternativa mantem a transferência de arquivos, porem de forma cifrada?",
        explanation:
            "O SFTP realiza a transferência de arquivos sobre um canal criptografado (SSH), protegendo credenciais e conteúdo; o FTP tradicional trafega tudo em texto claro, e restringir IP não protege o dado em transito.",
        topic: "Segurança de Redes",
        options: [
            [
                "Continuar com FTP, mas restringindo o acesso apenas a determinados endereços IP por meio de regras configuradas no firewall de borda",
                false,
            ],
            ["Adotar HTTP para publicar os arquivos em um servidor web interno da empresa", false],
            ["Usar Telnet para acessar o servidor remoto e copiar os arquivos manualmente", false],
            ["Substituir por SFTP, que transfere os arquivos sobre um canal criptografado", true],
        ],
    },
    {
        statement:
            "Uma empresa vai implantar videoconferencia e chamadas de voz em tempo real. Os engenheiros preferem um protocolo de transporte que priorize velocidade e baixa latência, tolerando a perda ocasional de alguns pacotes em vez de retransmiti-los. Qual protocolo atende melhor a esse requisito?",
        explanation:
            "O UDP e sem conexão e não retransmite pacotes perdidos, o que reduz a latência e o torna adequado a voz e video em tempo real; o TCP prioriza a confiabilidade em detrimento da velocidade.",
        topic: "Segurança de Redes",
        options: [
            [
                "TCP, porque estabelece conexão com handshake de três vias e retransmite qualquer pacote perdido para garantir a entrega ordenada",
                false,
            ],
            [
                "ICMP, porque e usado para diagnostico e mensagens de controle entre dispositivos de rede",
                false,
            ],
            ["UDP, porque e sem conexão e prioriza a rapidez em vez de garantir a entrega", true],
            ["HTTP, porque e o protocolo padrão para o tráfego de aplicações web modernas", false],
        ],
    },
    {
        statement:
            "O administrador de e-mail investiga por que as mensagens enviadas pelos funcionários não estao saindo para destinatarios externos, embora o recebimento funcione. Ele suspeita de bloqueio no protocolo usado para enviar mensagens entre servidores de correio. Qual protocolo é responsável por esse envio?",
        explanation:
            "O SMTP (Simple Mail Transfer Protocol), tipicamente nas portas 25 ou 587, realiza o envio de mensagens entre servidores; IMAP e POP3 tratam do recebimento e da leitura.",
        topic: "Segurança de Redes",
        options: [
            [
                "IMAP, que permite ao cliente ler e organizar as mensagens mantidas no servidor a partir de vários dispositivos diferentes",
                false,
            ],
            ["POP3, que baixa as mensagens do servidor para o dispositivo local do usuário", false],
            [
                "SNMP, usado para o gerenciamento e a coleta de métricas de equipamentos de rede",
                false,
            ],
            [
                "SMTP, o protocolo responsável pelo envio de e-mails entre servidores de correio",
                true,
            ],
        ],
    },
    {
        statement:
            "Um analista revisa o modelo OSI e precisa identificar em qual camada operam o enderecamento lógico IP e o roteamento de pacotes entre redes diferentes. Qual camada desempenha essa função?",
        explanation:
            "A camada de rede (camada 3 do OSI) cuida do enderecamento lógico IP e do roteamento de pacotes entre redes distintas; os roteadores operam nessa camada.",
        topic: "Segurança de Redes",
        options: [
            [
                "A camada de rede (camada 3), responsável pelo enderecamento IP e pelo roteamento entre redes",
                true,
            ],
            [
                "A camada de enlace (camada 2), que organiza os bits em quadros e usa endereços MAC dentro do mesmo segmento local",
                false,
            ],
            [
                "A camada de transporte (camada 4), que segmenta os dados e controla a entrega fim a fim",
                false,
            ],
            [
                "A camada física (camada 1), que trata da transmissao eletrica dos bits pelo meio",
                false,
            ],
        ],
    },
    {
        statement:
            "Em uma rede local, um dispositivo recebe quadros e os encaminha apenas para a porta onde esta conectado o destinatario, com base em uma tabela de endereços físicos que ele aprende. Que dispositivo desempenha esse papel dentro do segmento local?",
        explanation:
            "O switch opera na camada de enlace e usa a tabela de endereços MAC para encaminhar quadros somente a porta do destinatario, ao contrario do hub, que réplica para todas as portas.",
        topic: "Segurança de Redes",
        options: [
            [
                "Um roteador, que interliga redes diferentes e decide o caminho dos pacotes com base no endereço IP de destino",
                false,
            ],
            ["Um switch, que encaminha quadros na rede local com base em endereços MAC", true],
            ["Um repetidor, que apenas amplifica o sinal para estender o alcance físico", false],
            ["Um modem, que converte sinais entre a rede local e a operadora", false],
        ],
    },
    {
        statement:
            "Uma empresa quer que todo o acesso dos funcionários a sites externos passe por um único ponto capaz de aplicar filtros de conteúdo, registrar os acessos e ocultar os endereços internos das estacoes. Qual solucao atende diretamente a esse objetivo?",
        explanation:
            "Um proxy de saída (forward proxy) intermedeia as requisições dos usuários a internet, permitindo filtragem de conteúdo, registro de acessos e ocultacao dos IPs internos.",
        topic: "Segurança de Redes",
        options: [
            [
                "Um servidor proxy de saída, que intermedeia as requisições web dos usuários para a internet",
                true,
            ],
            [
                "Um switch gerenciavel, que segmenta a rede em VLANs e separa os domínios de broadcast entre os diferentes setores",
                false,
            ],
            [
                "Um servidor DHCP, que centraliza a distribuição de endereços IP para os dispositivos",
                false,
            ],
            [
                "Um ponto de acesso sem fio, que conecta os dispositivos moveis a rede cabeada",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa tem escritorios em três cidades diferentes e precisa interliga-los para que funcionem como uma única rede corporativa, trocando dados por longas distancias. Que tipo de rede descreve essa interligacao entre sites geograficamente distantes?",
        explanation:
            "Uma WAN (Wide Area Network) interliga redes em locais geograficamente distantes, como escritorios em cidades diferentes; a LAN se limita a uma área local.",
        topic: "Segurança de Redes",
        options: [
            [
                "LAN, uma rede local que conecta dispositivos dentro de um mesmo prédio ou área restrita usando cabeamento próprio",
                false,
            ],
            [
                "VLAN, um agrupamento lógico que separa o tráfego de grupos de dispositivos em um mesmo switch",
                false,
            ],
            [
                "PAN, uma rede pessoal de curtíssimo alcance entre dispositivos de um único usuário",
                false,
            ],
            [
                "WAN, uma rede que interliga escritórios em áreas geograficamente distantes entre si",
                true,
            ],
        ],
    },
    {
        statement:
            "Duas filiais de uma empresa, em cidades diferentes, precisam trocar tráfego interno como se estivessem na mesma rede, usando a internet pública, mas sem expor os dados. A equipe quer um tunel cifrado permanente entre os dois roteadores das filiais. Qual solucao atende?",
        explanation:
            "Uma VPN site a site cria um tunel criptografado permanente entre os gateways das duas redes, permitindo que as filiais troquem tráfego interno com segurança pela internet pública.",
        topic: "Segurança de Redes",
        options: [
            [
                "Publicar os serviços internos de cada filial em uma DMZ acessível pela internet, protegida por um firewall dedicado em cada ponta",
                false,
            ],
            [
                "Uma conta de proxy reverso hospedada na nuvem para encaminhar as requisições entre as filiais",
                false,
            ],
            [
                "Uma VPN site a site, que estabelece um tunel criptografado permanente entre as redes das filiais",
                true,
            ],
            [
                "Um servidor FTP central para que cada filial deposite e retire os arquivos que precisa trocar",
                false,
            ],
        ],
    },
    {
        statement:
            "Durante a análise de um ataque, a equipe descobre que os pacotes maliciosos traziam um endereço IP de origem falsificado, fazendo-os parecer vindos de um servidor confiavel da própria rede. Que tecnica o atacante utilizou?",
        explanation:
            "No spoofing, o atacante falsifica o endereço de origem (por exemplo, IP ou MAC) para se passar por uma entidade confiavel e enganar controles baseados na identidade de rede.",
        topic: "Segurança de Redes",
        options: [
            [
                "Sniffing, capturando passivamente o tráfego que circula pela rede para extrair dados sensiveis que trafegam em texto claro",
                false,
            ],
            [
                "Spoofing, forjando o endereço de origem para se passar por uma fonte confiavel",
                true,
            ],
            [
                "Forca bruta, testando sistematicamente combinacoes de credenciais até acertar",
                false,
            ],
            [
                "Phishing, enviando mensagens fraudulentas para induzir a vitima a revelar informações",
                false,
            ],
        ],
    },
    {
        statement:
            "Em uma rede onde vários serviços ainda usam protocolos sem criptografia, um atacante com acesso ao segmento consegue capturar e ler senhas e mensagens que trafegam entre os dispositivos, sem alterar o tráfego. Qual medida elimina de forma mais direta a exposicao desse conteúdo?",
        explanation:
            "O sniffing e a captura passiva de tráfego; cifrar as comunicacoes com HTTPS, SSH ou TLS torna o conteúdo interceptado ilegivel, neutralizando a leitura de senhas e mensagens.",
        topic: "Segurança de Redes",
        options: [
            [
                "Aumentar a frequência de troca de senhas dos usuários e exigir senhas mais longas em toda a organização",
                false,
            ],
            ["Instalar um antivírus atualizado em cada estação de trabalho da rede", false],
            ["Cifrar as comunicações da rede com protocolos seguros como HTTPS e SSH", true],
            ["Ativar um servidor DHCP redundante para evitar conflitos de endereço IP", false],
        ],
    },
    {
        statement:
            "Uma organização abandona a ideia de que tudo dentro do perimetro da rede e confiavel. Agora, cada tentativa de acesso a um recurso, mesmo partindo de dentro, precisa ser autenticada e autorizada de forma explicita. Que abordagem a empresa adotou?",
        explanation:
            "O modelo zero trust ('nunca confie, sempre verifique') não concede confianca implicita com base na localizacao na rede e exige autenticação e autorização a cada acesso.",
        topic: "Segurança de Redes",
        options: [
            [
                "Defesa em profundidade, empilhando várias camadas independentes de controle para que a falha de uma seja compensada pelas demais",
                false,
            ],
            [
                "Seguranca por obscuridade, baseando a proteção em manter os detalhes do sistema em segredo",
                false,
            ],
            [
                "Rede plana, na qual todos os dispositivos compartilham o mesmo segmento sem divisoes",
                false,
            ],
            [
                "Zero trust, que não confia implicitamente em nenhuma origem e verifica cada acesso",
                true,
            ],
        ],
    },
    {
        statement:
            "Um data center virtualizado quer impedir que, se uma carga de trabalho for comprometida, o atacante consiga se mover lateralmente para as demais. A equipe decide aplicar políticas de isolamento no nível de cada máquina virtual individual, e não apenas por sub-rede. Que tecnica descreve essa abordagem?",
        explanation:
            "A micro-segmentacao define políticas de isolamento granulares no nível de cada carga de trabalho ou máquina virtual, limitando o movimento lateral mesmo dentro do mesmo segmento.",
        topic: "Segurança de Redes",
        options: [
            [
                "Micro-segmentacao, que aplica políticas de isolamento no nível de cada carga de trabalho",
                true,
            ],
            [
                "Balanceamento de carga, que distribui as requisições entre vários servidores para melhorar o desempenho e a disponibilidade do serviço",
                false,
            ],
            [
                "Traducao de endereços NAT, que mapeia os endereços internos para um endereço público na saída",
                false,
            ],
            [
                "Tunelamento VPN, que cifra o tráfego entre um cliente remoto e a rede corporativa",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao configurar a rede sem fio de um novo escritorio, a equipe quer o padrão de segurança mais recente para redes Wi-Fi, com proteção mais forte contra ataques de adivinhacao de senha em comparacao as geracoes anteriores. Qual opção escolher?",
        explanation:
            "O WPA3 e a geracao mais atual de segurança Wi-Fi e oferece proteção mais robusta contra ataques de dicionario e adivinhacao de senha do que o WPA2 e, principalmente, do que o obsoleto WEP.",
        topic: "Segurança de Redes",
        options: [
            [
                "WEP, um dos primeiros esquemas de proteção sem fio, ainda encontrado em equipamentos legados de redes domésticas e corporativas",
                false,
            ],
            ["WPA3, a geração mais recente de segurança para as redes Wi-Fi corporativas", true],
            ["Rede aberta com um portal de autenticação exibido no navegador do usuário", false],
            ["Ocultar o SSID para que a rede não apareça na lista de redes disponíveis", false],
        ],
    },
    {
        statement:
            "Uma equipe de desenvolvimento quer publicar suas aplicações sem se preocupar em instalar e manter sistema operacional, servidores de aplicação ou runtime, apenas enviando o código para um ambiente pronto e gerenciado pelo provedor. Que modelo de nuvem atende a essa necessidade?",
        explanation:
            "No modelo PaaS (Platform as a Service), o provedor gerencia a infraestrutura, o sistema operacional e o runtime, enquanto o cliente foca apenas em desenvolver e implantar suas aplicações.",
        topic: "Segurança de Redes",
        options: [
            [
                "IaaS, no qual o provedor entrega máquinas virtuais e o cliente instala e mantem o sistema operacional e todo o software acima dele",
                false,
            ],
            ["SaaS, no qual o cliente apenas consome um software pronto pela internet", false],
            [
                "PaaS, que oferece uma plataforma pronta para desenvolver e executar aplicações",
                true,
            ],
            [
                "Colocation, em que a empresa aloja seus proprios servidores físicos em um data center de terceiros",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma pequena empresa não tem equipe própria de TI e contrata um terceiro para operar, monitorar e manter remotamente sua infraestrutura de rede e servidores, por meio de um contrato de serviço continuo. Como se chama esse tipo de fornecedor?",
        explanation:
            "Um MSP (Managed Service Provider) assume a gestão e a operação continua da infraestrutura de TI do cliente, opção util para organizacoes sem equipe interna dedicada.",
        topic: "Segurança de Redes",
        options: [
            [
                "ISP, provedor que fornece apenas a conectividade de acesso a internet para a empresa",
                false,
            ],
            [
                "MSP, provedor que gerencia e opera a infraestrutura de TI do cliente de forma continua",
                true,
            ],
            [
                "CDN, rede de distribuição que entrega conteúdo web a partir de servidores geograficamente proximos do usuário final",
                false,
            ],
            [
                "CASB, ferramenta que fica entre o usuário e os serviços de nuvem para aplicar políticas de segurança e visibilidade",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma fabrica instalou dezenas de sensores e cameras inteligentes conectados a rede. A equipe de segurança se preocupa porque muitos vem com senhas padrão de fabrica e raramente recebem atualização. Qual conjunto de medidas reduz melhor esse risco?",
        explanation:
            "Dispositivos IoT costumam ter credenciais padrão fracas e pouca atualização; trocar as senhas de fabrica e segmenta-los em uma rede isolada limita o impacto de um eventual comprometimento.",
        topic: "Segurança de Redes",
        options: [
            [
                "Trocar as credenciais padrão e isolar os dispositivos em um segmento de rede separado do corporativo",
                true,
            ],
            [
                "Confiar na proteção do firewall de borda, já que ele inspeciona todo o tráfego que entra e sai da rede corporativa pela internet",
                false,
            ],
            [
                "Conectar os dispositivos à mesma rede dos servidores para facilitar o gerenciamento centralizado",
                false,
            ],
            [
                "Manter as senhas de fábrica, porém desativar os logs dos dispositivos para economizar armazenamento",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação web coleta dados de cartao de credito dos clientes. A equipe quer garantir que essas informações não possam ser lidas por quem interceptar a comunicacao entre o navegador do cliente e o servidor. Qual medida protege os dados enquanto eles trafegam pela rede?",
        explanation:
            "A criptografia em transito, tipicamente via TLS (HTTPS), protege os dados enquanto eles se movem pela rede; cifrar o banco protege os dados em repouso, mas não durante a transmissao.",
        topic: "Operações de Segurança",
        options: [
            [
                "Cifrar o banco de dados em repouso no servidor, de modo que os arquivos em disco fiquem ilegiveis para quem obtiver acesso físico ao armazenamento",
                false,
            ],
            ["Aplicar hash com sal em todas as senhas dos usuários armazenadas no cadastro", false],
            ["Fazer backups periodicos e criptografados dos dados em uma localidade remota", false],
            [
                "Criptografar a comunicacao com TLS, usando HTTPS entre o navegador e o servidor",
                true,
            ],
        ],
    },
    {
        statement:
            "Um funcionário tem o notebook corporativo furtado. A empresa quer garantir que, mesmo removendo o disco e conectando-o a outra máquina, o ladrao não consiga ler os arquivos armazenados. Qual controle atende diretamente a esse objetivo?",
        explanation:
            "A criptografia de disco completo protege os dados em repouso: sem a chave, o conteúdo permanece ilegivel mesmo que o disco seja removido e lido em outro equipamento. Uma senha de login sozinha não protege o disco retirado.",
        topic: "Operações de Segurança",
        options: [
            [
                "Exigir que o usuário use uma VPN com tunel criptografado sempre que acessar os sistemas internos pela internet a partir de redes externas",
                false,
            ],
            [
                "Criptografia de disco completo no notebook, deixando os dados em repouso ilegiveis sem a chave",
                true,
            ],
            [
                "Uma senha forte de login no sistema operacional, trocada periodicamente conforme a política",
                false,
            ],
            [
                "Um antivirus atualizado com verificacao automática de todos os arquivos abertos",
                false,
            ],
        ],
    },
    {
        statement:
            "Depois de baixar um instalador do site de um fornecedor, um administrador quer confirmar que o arquivo não foi corrompido nem adulterado durante o download. O fornecedor pública um valor de referência ao lado do link. Que tecnica permite essa verificacao?",
        explanation:
            "Uma função de hash gera um valor único para o conteúdo do arquivo; se o hash calculado localmente coincide com o publicado pelo fornecedor, o arquivo esta integro e não foi alterado.",
        topic: "Operações de Segurança",
        options: [
            [
                "Cifrar o arquivo com uma chave simetrica compartilhada previamente com o fornecedor antes de executa-lo na máquina de destino",
                false,
            ],
            [
                "Verificar se o arquivo foi transferido por uma conexão HTTPS válida com o site",
                false,
            ],
            [
                "Comparar o hash calculado do arquivo baixado com o valor publicado pelo fornecedor",
                true,
            ],
            [
                "Executar o instalador em uma conta de usuário sem privilegios administrativos",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao projetar um sistema que precisa cifrar grandes volumes de dados com bom desempenho, mas também resolver o problema de distribuir a chave com segurança entre partes que nunca se comunicaram, um arquiteto combina os dois tipos de criptografia. Como essa combinacao costuma funcionar?",
        explanation:
            "Sistemas hibridos usam a criptografia assimetrica (mais lenta) apenas para trocar com segurança uma chave simetrica, e depois a simetrica (mais rápida) para cifrar o grande volume de dados.",
        topic: "Operações de Segurança",
        options: [
            [
                "Usa criptografia assimetrica para proteger a troca da chave e simetrica para cifrar os dados em massa",
                true,
            ],
            [
                "Usa exclusivamente criptografia assimetrica para tudo, por ser mais rápida do que a simetrica ao processar grandes quantidades de dados de forma continua",
                false,
            ],
            [
                "Usa apenas funções de hash, que permitiriam recuperar o conteúdo original a partir do resumo gerado",
                false,
            ],
            [
                "Usa a mesma chave pública para cifrar e decifrar, compartilhando-a abertamente com todos",
                false,
            ],
        ],
    },
    {
        statement:
            "Apos uma alteração não documentada em um servidor de produção derrubar um sistema critico, a diretoria determina que toda mudanca passe por solicitação formal, avaliacao de impacto, aprovacao e plano de reversao antes de ser aplicada. Que processo esta sendo implantado?",
        explanation:
            "A gestão de mudanca (change management) exige que as alterações passem por solicitação formal, avaliacao de impacto, aprovacao e plano de reversao, reduzindo interrupcoes causadas por mudancas descontroladas.",
        topic: "Operações de Segurança",
        options: [
            [
                "Gestao de incidentes, focada em detectar, responder e restaurar os serviços o mais rápido possível apos uma interrupcao já ocorrida",
                false,
            ],
            [
                "Gestao de patches, restrita a aplicação de correcoes de segurança liberadas pelos fornecedores",
                false,
            ],
            [
                "Analise de risco, que identifica e prioriza as ameacas aos ativos da organização",
                false,
            ],
            [
                "Gestao de mudanca, que formaliza solicitação, avaliacao, aprovacao e reversao das alterações",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma equipe define uma configuração segura padrão para todos os servidores e passa a comparar periodicamente cada máquina com esse padrão, para detectar desvios não autorizados. Que prática descreve o estabelecimento e a manutenção dessa referência?",
        explanation:
            "A gestão de configuração estabelece uma baseline segura de referência e monitora os sistemas em busca de desvios (drift), garantindo que permanecam em um estado conhecido e aprovado.",
        topic: "Operações de Segurança",
        options: [
            ["Gestao de configuração, com uma baseline segura usada para detectar desvios", true],
            ["Recuperacao de desastres", false],
            [
                "Teste de penetracao, em que especialistas simulam ataques para encontrar vulnerabilidades exploraveis",
                false,
            ],
            [
                "Classificacao de dados, que rotula as informações conforme o seu grau de sensibilidade",
                false,
            ],
        ],
    },
    {
        statement:
            "Apos um incidente, os investigadores tiveram dificuldade porque cada servidor guardava seus registros apenas localmente e muitos já haviam sido sobrescritos. A equipe quer garantir que os logs sejam reunidos em um repositório central e preservados por um período definido. Que medida atende a esse objetivo?",
        explanation:
            "Centralizar os logs em um repositório dedicado, com política de retenção definida, evita a perda por sobrescrita local e facilita a correlacao e a investigação apos incidentes.",
        topic: "Operações de Segurança",
        options: [
            [
                "Aumentar o nível de detalhe dos registros em cada servidor, mantendo-os apenas no disco local de cada máquina, para não sobrecarregar a rede",
                false,
            ],
            [
                "Encaminhar os logs para um servidor central e aplicar uma política de retenção",
                true,
            ],
            [
                "Desativar os registros dos sistemas menos criticos para liberar espaco em disco",
                false,
            ],
            [
                "Permitir que cada administrador defina livremente quando apagar os proprios logs",
                false,
            ],
        ],
    },
    {
        statement:
            "Em um sistema de controle de acesso, uma analista de RH acessa um arquivo com a folha de pagamento armazenado em um servidor. Nessa interação, como são classificados a analista e o arquivo, respectivamente?",
        explanation:
            "O sujeito e a entidade ativa que solicita acesso (a analista), e o objeto e o recurso passivo acessado (o arquivo). Processos e servidores também podem atuar como sujeitos, mas aqui quem inicia o acesso e a pessoa.",
        topic: "Controle de Acesso",
        options: [
            ["A analista e o sujeito e o arquivo e o objeto.", true],
            ["A analista e o objeto e o arquivo e o sujeito.", false],
            ["Ambos são objetos, já que o servidor é o único sujeito da operação.", false],
            [
                "A analista e o objeto porque e ela quem sofre a acao de autenticação, enquanto o servidor que hospeda o arquivo assume o papel de sujeito ativo da transação.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer que o acesso a cada documento seja decidido dinamicamente combinando vários atributos ao mesmo tempo: o departamento do usuário, a localizacao de onde ele se conecta, o horário e o tipo de dispositivo. Qual modelo de controle de acesso atende melhor a essa necessidade?",
        explanation:
            "O ABAC (Attribute-Based Access Control) decide o acesso avaliando atributos do sujeito, do objeto e do ambiente, sendo ideal quando as regras dependem de múltiplos fatores contextuais. O RBAC associa permissões apenas a papeis fixos.",
        topic: "Controle de Acesso",
        options: [
            ["RBAC, pois basta criar um papel para cada departamento.", false],
            ["ABAC, que avalia atributos do usuário, do recurso e do contexto.", true],
            ["MAC, já que o sistema operacional impoe rotulos fixos aos arquivos.", false],
            [
                "DAC, porque o proprietario de cada documento pode ajustar manualmente as permissões conforme o departamento, o horário e o dispositivo de cada colega.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma analista possui liberacao de segurança no nível 'confidencial', o mesmo nível de um relatório de um projeto interno. Ainda assim, o sistema nega seu acesso porque ela não faz parte da equipe daquele projeto. Qual principio justifica essa negacao?",
        explanation:
            "O need-to-know (necessidade de conhecer) restringe o acesso apenas a quem precisa da informação para executar suas tarefas, mesmo que a pessoa tenha o nível de classificacao adequado. Ter a liberacao correta é necessário, mas não suficiente.",
        topic: "Controle de Acesso",
        options: [
            [
                "Separacao de funções, que impede que uma única pessoa concentre etapas conflitantes de um mesmo processo critico de negócio.",
                false,
            ],
            ["Menor privilegio apenas, já que o nível de liberacao dela e suficiente.", false],
            [
                "Need-to-know, pois ter o nível de liberacao não basta sem necessidade de conhecer.",
                true,
            ],
            ["Não repudio, que garante a autoria das acoes realizadas no sistema.", false],
        ],
    },
    {
        statement:
            "A porta de uma sala de servidores usa um leitor de iris para liberar a entrada. A equipe de segurança esta preocupada com a taxa de falsa aceitacao (FAR) desse leitor. O que uma FAR alta significa na prática?",
        explanation:
            "A taxa de falsa aceitacao (FAR) mede com que frequência o sistema biometrico aceita por engano uma pessoa não autorizada, o que representa uma falha de segurança. Ja a falsa rejeicao (FRR) recusa pessoas legitimas.",
        topic: "Controle de Acesso",
        options: [
            ["Pessoas não autorizadas podem ser aceitas indevidamente pelo leitor.", true],
            ["Pessoas autorizadas são rejeitadas com frequência ao tentar entrar.", false],
            ["O leitor demora muito para cadastrar novos usuários no sistema.", false],
            [
                "O leitor passa a exigir um segundo fator de autenticação sempre que a iluminacao do ambiente muda, tornando a entrada mais lenta para todos.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um funcionário com acesso a vários sistemas criticos e desligado da empresa. Do ponto de vista de controle de acesso, qual e a acao mais importante a ser tomada imediatamente?",
        explanation:
            "No desprovisionamento (offboarding), as contas de quem sai devem ser desativadas imediatamente para evitar acessos indevidos por parte de ex-funcionários. Contas órfãs ou ativas apos o desligamento são um risco comum.",
        topic: "Controle de Acesso",
        options: [
            ["Trocar a senha do Wi-Fi corporativo para todos os funcionários.", false],
            [
                "Manter as contas ativas por 90 dias para o caso de o funcionário ser recontratado e precisar retomar suas atividades sem retrabalho.",
                false,
            ],
            ["Desabilitar ou revogar todas as contas de acesso dele sem demora.", true],
            ["Registrar o desligamento no sistema de RH e aguardar a revisao trimestral.", false],
        ],
    },
    {
        statement:
            "Para agilizar a criação de contas de novos funcionários, um administrador costuma copiar todas as permissões de um colega antigo da mesma área. Qual é o principal risco dessa prática de provisionamento?",
        explanation:
            "Copiar (clonar) o perfil de outro usuário costuma conceder acessos além do necessário, violando o menor privilegio e favorecendo o acumulo de permissões (privilege creep). O provisionamento deve se basear no cargo e em aprovacao formal.",
        topic: "Controle de Acesso",
        options: [
            ["A senha do colega antigo é revelada durante a cópia das permissões.", false],
            [
                "O sistema de RH deixa de registrar a data de admissão do novo funcionário, o que impede o cálculo correto do tempo de casa e dos benefícios.",
                false,
            ],
            ["O colega antigo perde suas próprias permissões ao servir de modelo.", false],
            ["O novo usuário acumula permissões desnecessárias ao cargo que ocupa.", true],
        ],
    },
    {
        statement:
            "Um administrador de sistemas usa a mesma conta com privilegios de administrador para tarefas do dia a dia, como ler e-mails e navegar na internet. Qual recomendacao de segurança para contas privilegiadas ele esta deixando de seguir?",
        explanation:
            "Contas privilegiadas devem ser separadas das contas de uso cotidiano e utilizadas apenas para tarefas administrativas específicas, reduzindo a exposicao em caso de comprometimento. Navegar e ler e-mails com uma conta de administrador amplia o impacto de um ataque.",
        topic: "Controle de Acesso",
        options: [
            [
                "Compartilhar a conta de administrador com toda a equipe de TI para que qualquer um possa resolver incidentes fora do horário comercial sem depender de uma só pessoa.",
                false,
            ],
            ["Usar uma conta comum no dia a dia e a privilegiada só quando necessário.", true],
            ["Desabilitar completamente a conta de administrador e nunca mais utiliza-la.", false],
            ["Compartilhar a senha privilegiada com o gestor para fins de auditoria.", false],
        ],
    },
    {
        statement:
            "Uma auditoria descobriu que vários funcionários que mudaram de área ao longo dos anos ainda mantem acessos de suas funções anteriores. Qual prática de controle de acesso teria evitado esse acumulo?",
        explanation:
            "A revisao periodica de acessos (recertificacao) verifica se cada usuário ainda precisa das permissões que possui, corrigindo o acumulo causado por transferencias (privilege creep). MFA e senhas fortes não resolvem permissões excessivas.",
        topic: "Controle de Acesso",
        options: [
            ["Exigir autenticação multifator no login de todos os sistemas.", false],
            [
                "Aumentar a complexidade exigida das senhas e reduzir o prazo de expiracao para que os usuários troquem suas credenciais com mais frequência.",
                false,
            ],
            ["Revisar periodicamente os acessos de cada usuário e remover os indevidos.", true],
            ["Criptografar os discos das estacoes de trabalho de todos os funcionários.", false],
        ],
    },
    {
        statement:
            "Uma empresa possui os seguintes controles: uma política de uso aceitavel assinada pelos funcionários, uma catraca na entrada do prédio e uma regra de firewall que bloqueia portas. Como esses três controles são classificados, na ordem?",
        explanation:
            "Politicas e procedimentos são controles administrativos, barreiras como catracas e portas são controles físicos, e mecanismos como firewalls e senhas são controles tecnicos (logicos). A mesma proteção pode combinar os três tipos.",
        topic: "Controle de Acesso",
        options: [
            ["Administrativo, físico e tecnico (lógico).", true],
            ["Fisico, administrativo e tecnico (lógico).", false],
            ["Tecnico (lógico), físico e administrativo.", false],
            [
                "Todos são considerados controles tecnicos, pois envolvem tecnologia e documentos que precisam ser gerenciados por sistemas informatizados da empresa.",
                false,
            ],
        ],
    },
    {
        statement:
            "Para liberar uma transferência bancaria acima de um valor alto, um banco exige que dois funcionários diferentes aprovem a operação, cada um com sua própria credencial. Que mecanismo de controle de acesso esta sendo aplicado?",
        explanation:
            "O controle dual (dual control ou regra das duas pessoas) exige que dois individuos autorizados atuem em conjunto para executar uma operação sensivel, reduzindo fraude e erro. E uma forma de reforcar a segregacao de funções.",
        topic: "Controle de Acesso",
        options: [
            [
                "Menor privilegio, pois cada funcionário recebe apenas as permissões estritamente necessarias para desempenhar as tarefas específicas do seu cargo no banco.",
                false,
            ],
            ["Controle dual, que exige duas pessoas para concluir uma acao critica.", true],
            ["Autenticacao multifator, que combina senha e token no login.", false],
            ["Federacao de identidades entre diferentes sistemas do banco.", false],
        ],
    },
    {
        statement:
            "As portas eletronicas de uma empresa são configuradas para destrancar automaticamente em caso de falta de energia, priorizando a saída rápida das pessoas em uma emergencia. Como esse comportamento de fechadura e chamado?",
        explanation:
            "Uma fechadura fail-safe destranca na falta de energia para priorizar a vida (life safety), enquanto uma fail-secure permanece trancada para priorizar a proteção do ativo. A escolha depende do que se quer proteger em cada porta.",
        topic: "Controle de Acesso",
        options: [
            [
                "Fail-secure, pois a prioridade absoluta e impedir qualquer entrada não autorizada mesmo durante uma emergencia com risco a vida das pessoas no prédio.",
                false,
            ],
            ["Fail-closed, garantindo que as portas permanecam trancadas.", false],
            ["Fail-safe, que prioriza a segurança das pessoas destrancando as portas.", true],
            ["Tolerancia a falhas, que mantem o sistema de crachas sempre online.", false],
        ],
    },
    {
        statement:
            "Uma empresa implementa uma solucao em que o funcionário se autentica uma única vez pela manha e, a partir dai, acessa o e-mail, o ERP e a intranet sem digitar a senha novamente. Como se chama esse recurso?",
        explanation:
            "O Single Sign-On (SSO) permite que o usuário se autentique uma vez e acesse vários sistemas sem novo login, melhorando a experiência e a gestão de credenciais. Em contrapartida, exige proteção reforcada dessa credencial única.",
        topic: "Controle de Acesso",
        options: [
            ["Autenticacao multifator (MFA).", false],
            ["Logon único (Single Sign-On, SSO).", true],
            [
                "Federacao obrigatória de crachas físicos, que sincroniza a entrada no prédio com o desbloqueio automático de todos os aplicativos corporativos.",
                false,
            ],
            ["Menor privilegio aplicado as credenciais.", false],
        ],
    },
    {
        statement:
            "Em um setor, vários operadores utilizam uma mesma conta genérica chamada 'operador01' para acessar o sistema. Do ponto de vista de controle de acesso, qual e o maior problema dessa configuração?",
        explanation:
            "Contas compartilhadas eliminam a responsabilizacao individual (accountability), pois as acoes não podem ser atribuidas a uma pessoa específica, prejudicando auditoria e não repudio. Cada usuário deve ter sua própria conta.",
        topic: "Controle de Acesso",
        options: [
            [
                "As senhas compartilhadas expiram mais rápido do que as individuais, obrigando toda a equipe a redefinir a credencial simultaneamente várias vezes por mês.",
                false,
            ],
            ["Contas genéricas não conseguem receber permissões de leitura em arquivos.", false],
            ["Não é possível saber qual pessoa realizou cada ação feita na conta genérica.", true],
            ["O sistema passa a exigir autenticação multifator para todos os setores.", false],
        ],
    },
    {
        statement:
            "Para dificultar ataques de tentativa e erro de senha, um sistema e configurado para bloquear a conta apos cinco tentativas de login malsucedidas seguidas. Que tipo de controle de acesso e ameaca essa medida combate?",
        explanation:
            "O bloqueio de conta apos várias tentativas e um controle tecnico (lógico) que dificulta ataques de forca bruta, nos quais o atacante testa muitas senhas em sequência. Ele previne o acesso, não apenas o registra.",
        topic: "Controle de Acesso",
        options: [
            ["Um controle físico contra o acesso de visitantes ao prédio.", false],
            [
                "Um controle administrativo que substitui a necessidade de qualquer política de senha escrita, pois o próprio sistema passa a definir sozinho as regras de complexidade.",
                false,
            ],
            ["Um controle de deteccao que apenas registra as tentativas sem impedi-las.", false],
            ["Um controle lógico contra ataques de forca bruta de senha.", true],
        ],
    },
    {
        statement:
            "Depois que um usuário comprova sua identidade com senha e token, o sistema verifica se ele tem permissão para excluir um registro específico do banco de dados. Essa verificacao de permissão corresponde a qual etapa?",
        explanation:
            "A autorização ocorre apos a autenticação e determina quais recursos e acoes o usuário já identificado tem permissão de acessar. Autenticacao prova quem e o usuário; autorização define o que ele pode fazer.",
        topic: "Controle de Acesso",
        options: [
            ["Autenticacao, que confirma a identidade declarada pelo usuário.", false],
            [
                "Identificacao, o momento inicial em que o usuário apenas declara quem e ao digitar o nome de usuário, antes de qualquer comprovacao de identidade.",
                false,
            ],
            ["Autorizacao, que define o que o usuário pode fazer no sistema.", true],
            ["Auditoria, que registra as acoes executadas para análise posterior.", false],
        ],
    },
    {
        statement:
            "Uma aplicação web precisa apenas ler registros de uma tabela de produtos, mas seu desenvolvedor configurou a conta de serviço do banco de dados com permissões de administrador. Qual principio foi violado e qual seria a correcao?",
        explanation:
            "O menor privilegio também se aplica a contas de serviço e de aplicação, que devem ter apenas as permissões estritamente necessarias para sua função. Uma conta de serviço com direitos de administrador amplia muito o impacto de uma invasao.",
        topic: "Controle de Acesso",
        options: [
            [
                "A segregacao de funções foi violada; a correcao e dividir a aplicação em dois modulos operados por equipes diferentes para que ninguem controle todo o fluxo.",
                false,
            ],
            ["O menor privilegio foi violado; conceda a conta apenas permissão de leitura.", true],
            ["O não repudio foi violado; a correcao e assinar digitalmente cada consulta.", false],
            [
                "A defesa em profundidade foi violada; a correcao e adicionar um segundo firewall.",
                false,
            ],
        ],
    },
    {
        statement:
            "Depois de classificar suas informações em níveis como 'público' e 'confidencial', uma empresa carimba cada documento e adiciona metadados indicando o nível a que ele pertence. Qual é o principal objetivo dessa rotulagem?",
        explanation:
            "A rotulagem (labeling) torna visivel a classificacao da informação para que pessoas e sistemas apliquem as regras de manuseio, armazenamento e descarte adequadas. O rotulo orienta o tratamento, mas não substitui os controles de acesso.",
        topic: "Operações de Segurança",
        options: [
            ["Sinalizar como cada informação deve ser tratada e protegida.", true],
            ["Criptografar automaticamente o conteúdo de todos os documentos.", false],
            [
                "Substituir a necessidade de controles de acesso, já que o rotulo por si só impede tecnicamente que pessoas não autorizadas abram o arquivo.",
                false,
            ],
            ["Reduzir o tamanho dos arquivos armazenados no servidor da empresa.", false],
        ],
    },
    {
        statement:
            "O setor juridico informa que certos contratos precisam ser guardados por cinco anos por exigencia legal, e depois disso não há motivo para mante-los. Qual política orienta por quanto tempo os dados devem ser conservados antes do descarte?",
        explanation:
            "A política de retenção de dados define por quanto tempo cada tipo de informação deve ser mantida para atender a requisitos legais e de negócio, e quando deve ser descartada com segurança. Guardar dados além do necessário aumenta risco e custo.",
        topic: "Operações de Segurança",
        options: [
            [
                "A política de uso aceitavel, que descreve as formas permitidas e proibidas de utilizar os recursos e sistemas de informação disponibilizados pela empresa.",
                false,
            ],
            ["A política de retenção de dados.", true],
            ["A política de senhas.", false],
            ["A política de mesa limpa.", false],
        ],
    },
    {
        statement:
            "Uma empresa vai se desfazer de vários SSDs (unidades de estado solido) que armazenaram dados sensiveis. A equipe lembra que a desmagnetizacao (degaussing) funciona em HDs magneticos, mas não em SSDs. Qual é a abordagem adequada para sanitizar esses SSDs?",
        explanation:
            "SSDs não são afetados por desmagnetizacao e distribuem os dados internamente, então a sanitizacao confiavel usa apagamento criptografico (crypto-erase) ou destruicao física. Apagar arquivos ou formatar rapidamente não remove os dados de fato.",
        topic: "Operações de Segurança",
        options: [
            ["Desmagnetizar cada SSD com um degausser potente antes do descarte.", false],
            ["Usar apagamento criptografico ou destruicao física da unidade.", true],
            ["Apagar os arquivos e esvaziar a lixeira do sistema operacional.", false],
            [
                "Formatar rapidamente a unidade várias vezes seguidas, o que sobrescreve todos os blocos de memória flash de forma garantida por causa do gerenciamento interno do SSD.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa passa a exigir que os funcionários guardem documentos em papel em gavetas trancadas e bloqueiem a tela ao se ausentar da mesa. Que política de segurança esta sendo implementada?",
        explanation:
            "A política de mesa limpa (clean desk) e tela bloqueada reduz o risco de pessoas não autorizadas verem ou levarem informações sensiveis deixadas a vista. E especialmente util contra curiosos e visitantes no ambiente de trabalho.",
        topic: "Operações de Segurança",
        options: [
            [
                "Politica BYOD, que estabelece as condicoes sob as quais dispositivos pessoais dos funcionários podem se conectar aos sistemas e a rede corporativa da empresa.",
                false,
            ],
            ["Politica de retenção de dados.", false],
            ["Politica de mesa limpa e tela bloqueada.", true],
            ["Politica de classificacao de dados.", false],
        ],
    },
    {
        statement:
            "Uma empresa envia lembretes rapidos, cartazes e e-mails para manter a segurança na mente dos funcionários no dia a dia, sem ensinar nenhuma habilidade tecnica específica. Como se classifica melhor esse tipo de iniciativa?",
        explanation:
            "A conscientizacao (awareness) usa lembretes e mensagens para reforcar comportamentos seguros, sem ensinar habilidades tecnicas. O treinamento desenvolve competencias práticas, e a educacao aprofunda o entendimento teorico.",
        topic: "Operações de Segurança",
        options: [
            [
                "Treinamento, que ensina habilidades práticas e específicas para que o funcionário saiba executar uma tarefa tecnica de segurança, como configurar corretamente uma ferramenta.",
                false,
            ],
            ["Educacao, que aprofunda conceitos teoricos em nível avançado.", false],
            ["Auditoria, que avalia a conformidade com as políticas internas.", false],
            ["Conscientizacao (awareness), que mantem a segurança presente no cotidiano.", true],
        ],
    },
    {
        statement:
            "Ao projetar a sala de servidores de uma nova instalacao, a equipe se preocupa em controlar temperatura e umidade e em instalar um sistema de supressao de incendio adequado a equipamentos eletronicos. Que categoria de controle de segurança física ela esta tratando?",
        explanation:
            "Temperatura, umidade, supressao de incendio e energia fazem parte dos controles ambientais da segurança física, que protegem os equipamentos e a disponibilidade. Agua comum, por exemplo, não e adequada para incendios em equipamentos eletricos.",
        topic: "Operações de Segurança",
        options: [
            ["Controle de acesso lógico dos usuários aos servidores da sala.", false],
            ["Controles ambientais da instalação física, como climatização e energia.", true],
            [
                "Controles de segregação de funções entre os administradores, garantindo que nenhum deles consiga concluir sozinho uma alteração crítica na configuração dos servidores.",
                false,
            ],
            ["Controles criptográficos dos dados em repouso nos discos.", false],
        ],
    },
    {
        statement:
            "Em uma empresa, surge a duvida sobre quem deve definir o nível de classificacao de um conjunto de dados. Segundo as boas práticas de segurança da informação, essa responsabilidade e principalmente de quem?",
        explanation:
            "A classificacao e responsabilidade do proprietario (data owner) da informação, que conhece seu valor e sensibilidade para o negócio. O custodiante apenas protege os dados conforme a classificacao definida pelo proprietario.",
        topic: "Operações de Segurança",
        options: [
            [
                "Do usuário final que consome os dados no dia a dia, pois e ele quem melhor conhece a rotina operacional e decide o nível conforme a conveniencia de cada tarefa.",
                false,
            ],
            ["Do administrador de rede que configura os firewalls da empresa.", false],
            [
                "Do proprietario (owner) dos dados, responsável por defini-los e classifica-los.",
                true,
            ],
            ["Da equipe de limpeza que tem acesso físico as instalacoes.", false],
        ],
    },
];
