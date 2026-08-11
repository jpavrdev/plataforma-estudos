import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de ISC2 Certified in Cybersecurity, trilha de certificação sem
 * roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cenário; as
 * cartas guardam as definições fechadas, as listas de fases e controles e
 * as separações entre conceitos parecidos.
 */
export const isc2Cc: CartasDaTrilha = {
    trilha: "ISC2 Certified in Cybersecurity (CC)",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que três pilares a tríade CIA reúne?",
                        verso: "Confidencialidade, integridade e disponibilidade.",
                    },
                    {
                        frente: "Que pergunta a tríade ajuda a responder num incidente?",
                        verso: "Qual dos pilares foi violado.",
                    },
                    {
                        frente: "O que a integridade garante?",
                        verso: "Que o dado não foi alterado indevidamente.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que é a identificação?",
                        verso: "A afirmação de quem você é.",
                    },
                    {
                        frente: "O que é a autenticação?",
                        verso: "A prova dessa afirmação.",
                    },
                    {
                        frente: "Que três fatores sustentam essa prova?",
                        verso: "Algo que você sabe, algo que tem e algo que é.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a MFA combina?",
                        verso: "Fatores de categorias diferentes.",
                    },
                    {
                        frente: "Que risco ela reduz?",
                        verso: "O de um único ponto de falha.",
                    },
                    {
                        frente: "Como a inteligência artificial reforça essa proteção?",
                        verso: "Calculando o risco de cada tentativa de acesso.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o não repúdio garante?",
                        verso: "Que a ação não pode ser negada por quem a praticou.",
                    },
                    {
                        frente: "De que ele depende?",
                        verso: "De identidade comprovada, integridade e registro.",
                    },
                    {
                        frente: "Que tecnologia costuma sustentá-lo?",
                        verso: "A assinatura digital.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a privacidade regula?",
                        verso: "Como os dados pessoais são coletados, usados e compartilhados.",
                    },
                    {
                        frente: "De que ela depende para se tornar real?",
                        verso: "Dos mesmos controles de segurança da informação.",
                    },
                    {
                        frente: "Que cuidado a inteligência artificial acrescenta?",
                        verso: "O dado usado no treino também precisa de base legal.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "De onde o risco nasce?",
                        verso: "Do encontro entre uma ameaça e uma vulnerabilidade.",
                    },
                    {
                        frente: "O que é a ameaça?",
                        verso: "O agente capaz de causar o dano.",
                    },
                    {
                        frente: "O que gerenciar risco não significa?",
                        verso: "Eliminar todo o risco.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o apetite a risco define?",
                        verso: "Quanto risco a organização topa correr.",
                    },
                    {
                        frente: "O que a tolerância marca?",
                        verso: "Os limites aceitáveis para um risco específico.",
                    },
                    {
                        frente: "Que respostas ao risco existem?",
                        verso: "Aceitar, mitigar, transferir e evitar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o controle físico protege?",
                        verso: "O ambiente.",
                    },
                    {
                        frente: "O que o controle técnico protege?",
                        verso: "Os sistemas.",
                    },
                    {
                        frente: "O que o controle administrativo orienta?",
                        verso: "As pessoas e os processos.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que valor abre o preâmbulo do código de ética?",
                        verso: "A segurança e o bem-estar da sociedade.",
                    },
                    {
                        frente: "Quantos cânones o código de ética tem?",
                        verso: "Quatro.",
                    },
                    {
                        frente: "Que dever o código cita junto do interesse público?",
                        verso: "O dever para com quem contrata o profissional.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que uma política diz?",
                        verso: "O quê e por quê.",
                    },
                    {
                        frente: "O que um padrão diz?",
                        verso: "O quanto.",
                    },
                    {
                        frente: "O que um procedimento diz?",
                        verso: "O como.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Para que a continuidade de negócios existe?",
                        verso: "Manter as funções essenciais durante e depois da interrupção.",
                    },
                    {
                        frente: "Em que ela se apoia?",
                        verso: "Em política, plano e equipe designada.",
                    },
                    {
                        frente: "O que ela cobre além da tecnologia?",
                        verso: "Pessoas, processos e comunicação.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a análise de impacto no negócio identifica?",
                        verso: "Os processos críticos do negócio.",
                    },
                    {
                        frente: "O que o RTO define?",
                        verso: "Quanto tempo até restaurar.",
                    },
                    {
                        frente: "O que o RPO define?",
                        verso: "Quanto dado se aceita perder.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que é a recuperação de desastres?",
                        verso: "O braço técnico da continuidade de negócios.",
                    },
                    {
                        frente: "O que ela restaura?",
                        verso: "Sistemas, dados e infraestrutura.",
                    },
                    {
                        frente: "Que sites alternativos existem?",
                        verso: "Quente, morno e frio.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para que a resposta a incidentes existe?",
                        verso: "Detectar, conter e resolver eventos de segurança.",
                    },
                    {
                        frente: "O que ela reduz?",
                        verso: "O dano e o tempo de recuperação.",
                    },
                    {
                        frente: "Quem conduz esse trabalho?",
                        verso: "A equipe de resposta a incidentes, com papéis definidos.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quantas fases o ciclo de resposta a incidentes tem?",
                        verso: "Seis.",
                    },
                    {
                        frente: "Que fases abrem o ciclo?",
                        verso: "Preparação, detecção e contenção.",
                    },
                    {
                        frente: "Que fases fecham o ciclo?",
                        verso: "Erradicação, recuperação e lições aprendidas.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta a identificação responde?",
                        verso: "Quem é você.",
                    },
                    {
                        frente: "Que pergunta a autenticação responde?",
                        verso: "Como provar isso.",
                    },
                    {
                        frente: "Que pergunta a autorização responde?",
                        verso: "O que você pode fazer.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "De que o controle físico preventivo depende?",
                        verso: "Da combinação de várias barreiras, e não de uma só.",
                    },
                    {
                        frente: "O que o CPTED propõe?",
                        verso: "Prevenir pelo desenho do próprio ambiente.",
                    },
                    {
                        frente: "Que mecanismos físicos a aula cita?",
                        verso: "Crachá, catraca e fechadura.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a prevenção sozinha não faz?",
                        verso: "Perceber quando alguém passou por ela.",
                    },
                    {
                        frente: "Que combinação permite perceber isso?",
                        verso: "Câmeras, alarmes e registros de acesso.",
                    },
                    {
                        frente: "Que papel o registro cumpre depois do fato?",
                        verso: "Permite reconstruir quem passou, e quando.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o menor privilégio limita?",
                        verso: "O que uma única conta consegue fazer.",
                    },
                    {
                        frente: "O que a segregação de funções garante?",
                        verso: "Que ninguém sozinho controle um processo inteiro.",
                    },
                    {
                        frente: "O que os dois reduzem juntos?",
                        verso: "O estrago de uma conta comprometida ou mal usada.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Com quem o modelo discricionário deixa a decisão?",
                        verso: "Com o dono do recurso.",
                    },
                    {
                        frente: "Como o modelo obrigatório decide?",
                        verso: "Por rótulos e habilitações definidos por uma autoridade.",
                    },
                    {
                        frente: "A que o modelo por papéis amarra o acesso?",
                        verso: "Ao papel da pessoa na organização.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Quantas camadas o modelo OSI tem?",
                        verso: "Sete.",
                    },
                    {
                        frente: "Que camada fica na base do modelo?",
                        verso: "A física, que lida com bits.",
                    },
                    {
                        frente: "Que camada fica no topo?",
                        verso: "A de aplicação, que o usuário enxerga.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantas camadas o modelo TCP/IP tem?",
                        verso: "Quatro.",
                    },
                    {
                        frente: "O que o TCP entrega na camada de transporte?",
                        verso: "Confiabilidade, ao custo de velocidade.",
                    },
                    {
                        frente: "O que o UDP entrega?",
                        verso: "Velocidade, sem garantia de entrega.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantos bits um endereço IPv4 tem?",
                        verso: "Trinta e dois.",
                    },
                    {
                        frente: "Por que o IPv4 está se esgotando?",
                        verso: "Pela explosão de dispositivos conectados.",
                    },
                    {
                        frente: "O que todo dispositivo precisa para ser localizado?",
                        verso: "Um endereço único na rede.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que uma porta identifica?",
                        verso: "Qual serviço, dentro do mesmo endereço, recebe os dados.",
                    },
                    {
                        frente: "Que porta o HTTPS usa?",
                        verso: "A porta 443.",
                    },
                    {
                        frente: "Que porta o SSH usa?",
                        verso: "A porta 22.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o Wi-Fi trocou, e o que trouxe junto?",
                        verso: "Trocou o cabo por ondas de rádio, e trouxe novos riscos.",
                    },
                    {
                        frente: "De que a segurança da rede sem fio mais depende?",
                        verso: "Do protocolo de criptografia em uso.",
                    },
                    {
                        frente: "Qual é o protocolo mais recente dessa evolução?",
                        verso: "O WPA3.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que separa vírus, worm e trojan?",
                        verso: "A forma como cada um se espalha.",
                    },
                    {
                        frente: "Como o worm se espalha?",
                        verso: "Sozinho, sem ação humana.",
                    },
                    {
                        frente: "Como o trojan chega?",
                        verso: "Disfarçado de algo legítimo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o IDS faz?",
                        verso: "Detecta e alerta, sem bloquear sozinho.",
                    },
                    {
                        frente: "O que o IPS acrescenta?",
                        verso: "Fica no caminho do tráfego e bloqueia.",
                    },
                    {
                        frente: "Que formas o IDS pode ter?",
                        verso: "De host e de rede.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que sustenta a disponibilidade da rede?",
                        verso: "O data center, com sua infraestrutura física.",
                    },
                    {
                        frente: "O que cobre a falta de energia no curto prazo?",
                        verso: "O nobreak.",
                    },
                    {
                        frente: "O que cobre o longo prazo?",
                        verso: "O gerador.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que princípio une o design seguro de rede?",
                        verso: "A defesa em profundidade.",
                    },
                    {
                        frente: "O que esse princípio evita?",
                        verso: "Depender de um único controle perfeito.",
                    },
                    {
                        frente: "O que a segmentação acrescenta ao design?",
                        verso: "Limita o alcance de quem conseguir entrar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que separa os modelos de serviço em nuvem?",
                        verso: "Quanto da infraestrutura o cliente gerencia.",
                    },
                    {
                        frente: "O que a nuvem híbrida combina?",
                        verso: "Infraestrutura própria com serviços de nuvem pública.",
                    },
                    {
                        frente: "O que muda na segurança conforme o modelo?",
                        verso: "A fatia da responsabilidade que fica com o cliente.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que vantagem a criptografia simétrica tem?",
                        verso: "É rápida.",
                    },
                    {
                        frente: "Que desafio ela carrega?",
                        verso: "Distribuir a chave com segurança.",
                    },
                    {
                        frente: "Como a assimétrica resolve isso?",
                        verso: "Com um par de chaves, uma pública e uma privada.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que classificar um dado diz?",
                        verso: "O quanto ele importa.",
                    },
                    {
                        frente: "O que rotular faz?",
                        verso: "Avisa quem encontra o dado sobre essa classificação.",
                    },
                    {
                        frente: "O que o descarte seguro garante?",
                        verso: "Que o dado não possa ser recuperado depois.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o logging faz?",
                        verso: "Registra o que aconteceu.",
                    },
                    {
                        frente: "O que o monitoramento faz?",
                        verso: "Observa esses registros de perto.",
                    },
                    {
                        frente: "O que o SIEM acrescenta?",
                        verso: "Correlaciona eventos de todas as fontes.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o hardening reduz?",
                        verso: "O que pode ser atacado.",
                    },
                    {
                        frente: "O que a gestão de configuração garante?",
                        verso: "Que essa redução se mantenha ao longo do tempo.",
                    },
                    {
                        frente: "O que os patches corrigem?",
                        verso: "Falhas já conhecidas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que nenhum sistema técnico substitui?",
                        verso: "Uma pessoa treinada para desconfiar na hora certa.",
                    },
                    {
                        frente: "O que a engenharia social ataca?",
                        verso: "A confiança, e não o código.",
                    },
                    {
                        frente: "Que risco a IA generativa acrescenta ao golpe?",
                        verso: "Mensagens mais convincentes, e em escala.",
                    },
                ],
            },
        },
    },
};
