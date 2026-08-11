import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Segurança em Nuvem e Identidade, quinta trilha do roadmap de
 * Segurança.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento de
 * cenário; as cartas guardam as regras de bolso, as listas fechadas e as
 * frases-chave que a aula usa para fixar cada ideia.
 */
export const segurancaEmNuvemEIdentidade: CartasDaTrilha = {
    trilha: "Segurança em Nuvem e Identidade",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que o contrato de responsabilidade compartilhada reparte?",
                        verso: "O trabalho entre os fornecedores.",
                    },
                    {
                        frente: "O que esse contrato não reparte?",
                        verso: "A responsabilidade diante de quem teve o dado exposto.",
                    },
                    {
                        frente: "Que erro a leitura desse modelo costuma produzir?",
                        verso: "Achar que o fornecedor cobre também a parte do cliente.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que registro passa a valer mais quando o perímetro cai?",
                        verso: "O de autenticação, acima do registro do firewall.",
                    },
                    {
                        frente: "No que a rede virou nesse cenário?",
                        verso: "Num corredor público.",
                    },
                    {
                        frente: "No que a credencial virou nesse cenário?",
                        verso: "Na chave de entrada.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que quase tudo falha em nuvem?",
                        verso: "Por configuração.",
                    },
                    {
                        frente: "Existe correção para publicar um repositório de objetos?",
                        verso: "Não: existe controle que impede o descuido.",
                    },
                    {
                        frente: "Que tipo de controle a aula defende?",
                        verso: "O que impede a pessoa apressada de errar sem perceber.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é um achado, na fila do time?",
                        verso: "Dívida conhecida, que entra na fila com prazo.",
                    },
                    {
                        frente: "O que é um incidente?",
                        verso: "Evidência de uso, e não apenas de exposição.",
                    },
                    {
                        frente: "O que acontece com quem mistura os dois?",
                        verso: "Grita por tudo e é levado a sério por nada.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "No que uma réplica em outro continente vira?",
                        verso: "Transferência internacional de dado pessoal.",
                    },
                    {
                        frente: "Que decisão a escolha de região carrega junto?",
                        verso: "Uma decisão jurídica, além da técnica.",
                    },
                    {
                        frente: "O que a residência de dado define?",
                        verso: "Onde o dado pode ficar fisicamente.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que é autenticação sem autorização?",
                        verso: "A portaria que confere o documento e depois libera geral.",
                    },
                    {
                        frente: "O que a federação permite?",
                        verso: "Usar a identidade de um lugar para entrar em outro.",
                    },
                    {
                        frente: "Que ordem os dois passos seguem?",
                        verso: "Autenticar primeiro, autorizar depois.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a revisão que olha só membro direto não enxerga?",
                        verso: "O aninhamento de grupos.",
                    },
                    {
                        frente: "Que pergunta a revisão de acesso deve fazer?",
                        verso: "Qual é o acesso efetivo daquela pessoa.",
                    },
                    {
                        frente: "O que o diretório corporativo concentra?",
                        verso: "As identidades, os grupos e as regras de acesso.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que o privilégio mínimo apodrece com o tempo?",
                        verso: "Conceder tem benefício visível e risco difuso.",
                    },
                    {
                        frente: "O que remover permissão tem?",
                        verso: "Risco visível e benefício difuso.",
                    },
                    {
                        frente: "O que acontece enquanto essa conta não muda?",
                        verso: "A permissão só cresce.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que a credencial de curta duração protege?",
                        verso: "O invasor tem uma hora, e não dois anos, para usá-la.",
                    },
                    {
                        frente: "Que problema o segredo de longa vida cria?",
                        verso: "Vale enquanto ninguém trocar, mesmo depois de vazar.",
                    },
                    {
                        frente: "O que substitui a chave estática na prática?",
                        verso: "A identidade da carga, com credencial temporária.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Sobre o que ninguém abre chamado?",
                        verso: "Sobre acesso que sobrou.",
                    },
                    {
                        frente: "Até quando o acúmulo de acesso fica invisível?",
                        verso: "Até o dia em que alguém usa a conta inteira.",
                    },
                    {
                        frente: "Que três momentos o ciclo de vida de acesso cobre?",
                        verso: "Entrada, mudança de função e saída.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que indica não conseguir nem assumir o papel?",
                        verso: "Problema na política de confiança.",
                    },
                    {
                        frente: "O que indica assumir o papel e receber negado?",
                        verso: "Problema na política de permissão.",
                    },
                    {
                        frente: "Que três peças compõem a leitura de uma política?",
                        verso: "Quem pode assumir, o que ela permite e sobre qual recurso.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a permissão excessiva nunca faz?",
                        verso: "Quebrar alguma coisa.",
                    },
                    {
                        frente: "Como a permissão excessiva se manifesta?",
                        verso: "Uma vez só, e inteira.",
                    },
                    {
                        frente: "Por que o curinga vira vício?",
                        verso: "Resolve rápido e não incomoda ninguém depois.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que poder tem uma credencial administrativa fora da janela?",
                        verso: "Nenhum poder.",
                    },
                    {
                        frente: "Qual é o ganho inteiro da elevação sob demanda?",
                        verso: "Esvaziar a credencial roubada fora da janela.",
                    },
                    {
                        frente: "O que o acesso temporário exige em troca?",
                        verso: "Um pedido, com prazo e registro.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que se contrata junto com o serviço do fornecedor?",
                        verso: "A segurança interna dele.",
                    },
                    {
                        frente: "Quando essa segurança costuma ser avaliada?",
                        verso: "Uma vez, no começo do contrato.",
                    },
                    {
                        frente: "Que acesso o fornecedor federado recebe?",
                        verso: "O que a política de confiança permitir, e nada além.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que houve com o gestor que aprovou oitocentas linhas?",
                        verso: "Recebeu um pedido impossível de responder com honestidade.",
                    },
                    {
                        frente: "O que a revisão de acesso precisa produzir?",
                        verso: "Evidência de que alguém olhou e decidiu.",
                    },
                    {
                        frente: "Que tamanho a revisão precisa ter para funcionar?",
                        verso: "Um que caiba na atenção de quem revisa.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "De onde o dado quase nunca vaza?",
                        verso: "De onde estava bem protegido.",
                    },
                    {
                        frente: "De onde ele costuma vazar?",
                        verso: "Da cópia feita para um lugar com regra mais frouxa.",
                    },
                    {
                        frente: "Que controle previne o repositório aberto?",
                        verso: "O bloqueio de acesso público no nível da organização.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que filtrar a entrada atrapalha?",
                        verso: "O primeiro passo do ataque.",
                    },
                    {
                        frente: "O que filtrar a saída atrapalha?",
                        verso: "Todos os passos seguintes.",
                    },
                    {
                        frente: "Que etapas dependem da saída liberada?",
                        verso: "O canal de controle e a exfiltração.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a pergunta certa sobre cifra?",
                        verso: "Quem consegue pedir o dado decifrado.",
                    },
                    {
                        frente: "Que registro precisa existir junto?",
                        verso: "O de quem pediu o dado decifrado, e quando.",
                    },
                    {
                        frente: "Que pergunta é insuficiente sozinha?",
                        verso: "Se o dado está cifrado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que acontece com segredo apagado numa camada de cima?",
                        verso: "Continua inteiro na camada de baixo.",
                    },
                    {
                        frente: "O que a imagem guarda?",
                        verso: "A história, e não só o resultado final.",
                    },
                    {
                        frente: "Que cuidado a construção da imagem exige?",
                        verso: "Nunca deixar o segredo entrar em camada nenhuma.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que condição a regra que bloqueia a entrega precisa ter?",
                        verso: "O time precisa concordar com ela.",
                    },
                    {
                        frente: "No que a regra sem acordo vira?",
                        verso: "Numa negociação diária, e não num bloqueio.",
                    },
                    {
                        frente: "O que a checagem no pipeline antecipa?",
                        verso: "O erro de configuração, antes de virar ambiente.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta fazer a um fornecedor de zero trust?",
                        verso: "Qual princípio o produto implementa e o que fica descoberto.",
                    },
                    {
                        frente: "Quem responde essa pergunta sem desconforto?",
                        verso: "Quem vende arquitetura, e não produto isolado.",
                    },
                    {
                        frente: "O que zero trust não é?",
                        verso: "Um produto que se compra pronto.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "No que a política vira sem o estado do dispositivo?",
                        verso: "Em identidade mais localização, e nada além.",
                    },
                    {
                        frente: "O que verificar explicitamente exige?",
                        verso: "Checar identidade, dispositivo e contexto a cada acesso.",
                    },
                    {
                        frente: "O que a palavra zero trust anuncia?",
                        verso: "Bem mais do que identidade e localização entregam.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que escolha sobra a quem só tem permitir e bloquear?",
                        verso: "Travar o trabalho ou aceitar a exportação.",
                    },
                    {
                        frente: "Onde mora o risco real, nesse espectro?",
                        verso: "No meio, entre o permitir e o bloquear.",
                    },
                    {
                        frente: "O que o acesso adaptativo acrescenta?",
                        verso: "Resposta proporcional ao risco daquele acesso.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que detectar rápido sem poder agir garante?",
                        verso: "Uma poltrona na primeira fila do próprio incidente.",
                    },
                    {
                        frente: "O que assumir a violação muda no projeto?",
                        verso: "Presume o invasor dentro e limita o estrago.",
                    },
                    {
                        frente: "Que controles nascem dessa premissa?",
                        verso: "Segmentação, sessão curta e capacidade de revogar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que cada passo da adoção deveria remover?",
                        verso: "Uma dor visível de alguém.",
                    },
                    {
                        frente: "O que o programa que só acrescenta fricção consome?",
                        verso: "O capital político, até parar.",
                    },
                    {
                        frente: "Que ordem a adoção realista segue?",
                        verso: "Começar por onde já dói, e não pelo mais elegante.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Em que o invasor que age por credencial nunca encosta?",
                        verso: "Num servidor.",
                    },
                    {
                        frente: "Quem fica cego no ataque mais comum de nuvem?",
                        verso: "Quem só coleta registro de sistema operacional.",
                    },
                    {
                        frente: "Que registro é indispensável em nuvem?",
                        verso: "O do plano de controle.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que não vaza no golpe de consentimento?",
                        verso: "A senha.",
                    },
                    {
                        frente: "Por que trocar a senha não resolve nesse golpe?",
                        verso: "A autorização concedida não depende dela.",
                    },
                    {
                        frente: "O que precisa ser revogado nesse caso?",
                        verso: "O consentimento dado à aplicação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que recriar a frota inteira não resolve?",
                        verso: "O invasor segue dentro, pelo que deixou no diretório.",
                    },
                    {
                        frente: "Onde a persistência em nuvem costuma morar?",
                        verso: "Na confiança que o invasor acrescentou no diretório.",
                    },
                    {
                        frente: "Que rastro essa persistência não deixa?",
                        verso: "Nenhum em máquina, porque não vive em máquina.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é o reflexo certo diante de máquina suspeita?",
                        verso: "Isolar e preservar, antes de qualquer outra coisa.",
                    },
                    {
                        frente: "O que suspender antes de agir no ambiente elástico?",
                        verso: "A escala automática.",
                    },
                    {
                        frente: "Por que não encerrar a máquina suspeita?",
                        verso: "Encerrar apaga a evidência junto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que acontece detectando em semanas e retendo por dias?",
                        verso: "Você acha a ponta do fio e nunca a origem.",
                    },
                    {
                        frente: "O que a retenção não é?",
                        verso: "Um número administrativo.",
                    },
                    {
                        frente: "Com o que a retenção precisa conversar?",
                        verso: "Com o tempo real até a detecção.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Qual é o achado mais comum e mais difícil de defender?",
                        verso: "Dado de produção em ambiente de teste.",
                    },
                    {
                        frente: "Que parte desse problema é a fácil?",
                        verso: "A solução técnica.",
                    },
                    {
                        frente: "O que costuma faltar nesse caso?",
                        verso: "Alguém chamar o problema pelo nome.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a conformidade prova?",
                        verso: "Que você fez o que foi combinado.",
                    },
                    {
                        frente: "O que é segurança, nessa distinção?",
                        verso: "Ter escolhido bem o que combinar.",
                    },
                    {
                        frente: "Os dois importam igualmente?",
                        verso: "Importam, mas não são a mesma coisa.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "No que a auditoria vira quando o controle produz evidência?",
                        verso: "Numa consulta.",
                    },
                    {
                        frente: "No que ela vira quando o controle não produz?",
                        verso: "Num projeto de três semanas, todo ano.",
                    },
                    {
                        frente: "Que qualidade um bom controle tem?",
                        verso: "Gera evidência ao funcionar, sem esforço extra.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quantas ferramentas novas aparecem nos primeiros passos?",
                        verso: "Nenhuma.",
                    },
                    {
                        frente: "Do que quase tudo ali é feito?",
                        verso: "De organização e disciplina.",
                    },
                    {
                        frente: "Por que isso assusta?",
                        verso: "Porque não dá para comprar pronto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como é o trabalho que mais reduz risco em nuvem?",
                        verso: "O menos glamouroso que existe.",
                    },
                    {
                        frente: "O que esse trabalho não rende?",
                        verso: "Demonstração.",
                    },
                    {
                        frente: "O que ele separa, no fim?",
                        verso: "Um dia ruim de um trimestre ruim.",
                    },
                ],
            },
        },
    },
};
