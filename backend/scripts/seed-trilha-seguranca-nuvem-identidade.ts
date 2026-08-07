// Seed da trilha Segurança em Nuvem e Identidade, estagio 8 do roadmap de Seguranca
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-seguranca-nuvem-identidade.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Segurança em Nuvem e Identidade";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Segurança de ambientes em nuvem a partir do que realmente falha: responsabilidade compartilhada mal lida, configuração errada e identidade fraca. Percorre IAM, hardening de armazenamento, rede e pipeline, zero trust sem marketing, detecção e resposta quando a máquina some no dia seguinte, e fecha com LGPD, auditoria e o primeiro programa de segurança de uma empresa.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Segurança em nuvem começa diferente",
    aulas: [
        {
            titulo: "Responsabilidade compartilhada, e onde se erra ao lê-la",
            blocks: [
                {
                    type: "text",
                    value: "# O provedor cuida da nuvem, você cuida do que coloca nela\n\nTodo contrato de nuvem começa dividindo trabalho. O provedor responde pela infraestrutura que você não vê: prédio, energia, hardware, hipervisor, o cabo que liga uma região à outra. Você responde por tudo que colocou lá dentro: o dado, o código, as contas, as permissões e as regras de rede que definem quem alcança o quê. A frase que resume isso circula há anos, e é boa: o provedor cuida da segurança da nuvem, o cliente cuida da segurança na nuvem.\n\nA linha entre os dois lados não fica parada. Numa máquina virtual, o provedor entrega o hipervisor funcionando e você aplica correção no sistema operacional, escolhe a regra de firewall e decide se aquela porta fica aberta. Num banco gerenciado, o provedor passa a aplicar correção no motor e a cuidar da réplica, e sobra para você o esquema, a senha e a decisão de expor ou não o serviço. Num software pronto contratado por assinatura, quase tudo é do provedor, exceto as três coisas que nunca saem do seu colo.\n\nEssas três coisas valem gravar, porque elas atravessam todos os modelos: o dado é sempre seu, quem tem acesso é sempre seu, e a configuração é quase sempre sua. Um banco gerenciado com correção em dia, réplica automática e backup diário continua vazando inteiro se a regra de rede liberar a internet e a senha for a padrão. O provedor cumpriu a parte dele, e o incidente é seu.",
                },
                {
                    type: "table",
                    value: '[["Modelo de serviço","Fica com o provedor","Fica com você"],["Infraestrutura como serviço","Prédio, hardware e hipervisor","Sistema operacional, correção e rede"],["Plataforma gerenciada","Motor, réplica e alta disponibilidade","Esquema, acesso e exposição do serviço"],["Contêiner gerenciado","Nós, agendador e plano de controle","Imagem, dependência e permissão da carga"],["Função sem servidor","Execução, escala e isolamento","Código, segredo e papel de execução"],["Software por assinatura","Aplicação inteira e infraestrutura","Usuários, permissões e o próprio dado"]]',
                },
                {
                    type: "text",
                    value: "## Os três jeitos de ler o modelo errado\n\nO primeiro erro é o mais comum e o mais caro: ler o desenho como se o provedor cobrisse também o seu lado. A frase que denuncia esse erro em reunião é alguma variação de que o sistema está na nuvem e portanto está seguro. O provedor de fato investe em segurança física e operacional numa escala que nenhuma empresa média alcança, e isso resolve uma parte real do problema. Só que a parte que sobra é justamente onde os incidentes acontecem.\n\nO segundo erro é ler o contrato como transferência de responsabilidade jurídica. Não é. Na LGPD, quem decide a finalidade e os meios do tratamento é o controlador, e o provedor normalmente atua como operador. Se o dado de um cliente vazou porque alguém do seu time deixou um repositório aberto, quem responde perante o titular e perante a autoridade é a sua empresa. O contrato reparte tarefa entre fornecedores, não reparte a conta com quem teve o dado exposto.\n\nO terceiro erro é mais silencioso: não saber onde a linha está em cada serviço que a empresa usa. Uma organização média consome dezenas de serviços diferentes, e a divisão muda em cada um. Vale ter uma pergunta de bolso para qualquer serviço novo que entra: neste aqui, quem aplica correção, quem controla a chave de cifra e quem responde pela permissão de acesso? Se ninguém na sala souber responder, o serviço ainda não está pronto para produção.",
                },
                {
                    type: "quote",
                    value: "O contrato reparte o trabalho entre fornecedores. Ele não reparte a responsabilidade diante de quem teve o dado exposto.",
                },
                {
                    type: "text",
                    value: "## Transformar o desenho em algo utilizável\n\nO diagrama de responsabilidade compartilhada vira útil quando deixa de ser slide e vira uma tabela por serviço. Para cada serviço em uso, escreva quem corrige, quem cifra, quem guarda a chave, quem registra o acesso e quem responde por indisponibilidade. Leva uma tarde e resolve discussões que se arrastariam por meses, inclusive a discussão que aparece no meio de um incidente, que é a pior hora possível para descobrir de quem era a tarefa.\n\nOutro ponto que confunde gente experiente é a certificação do provedor. Relatórios de auditoria e certificados de conformidade que o provedor publica cobrem o lado dele. Eles são úteis como evidência de que a base é sólida, e não como evidência de que a sua aplicação está em conformidade. O auditor vai olhar a sua configuração, os seus registros e o seu processo de acesso, e o certificado do fornecedor não preenche nenhuma dessas lacunas.\n\nPor fim, a linha se move com o tempo. Provedor lança recurso novo, muda padrão de configuração, passa a oferecer cifra ligada por padrão. Isso é bom, e também significa que a sua tabela envelhece. Revisar essa divisão uma vez por ano, ou quando um serviço relevante muda, custa pouco e evita defender uma fronteira que já mudou de lugar.",
                },
            ],
            questions: [
                {
                    statement: "O que o modelo de responsabilidade compartilhada divide?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O trabalho de segurança entre provedor e cliente",
                            isCorrect: true,
                        },
                        {
                            text: "A responsabilidade jurídica perante o titular do dado",
                            isCorrect: false,
                        },
                        {
                            text: "O custo da infraestrutura entre as áreas da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "O acesso administrativo entre os times de operação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num banco de dados gerenciado, o que continua sendo tarefa do cliente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Decidir quem acessa e se o serviço fica exposto",
                            isCorrect: true,
                        },
                        {
                            text: "Manter a réplica e o plano de alta disponibilidade",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar as correções do motor do banco de dados",
                            isCorrect: false,
                        },
                        {
                            text: "Garantir a redundância física do disco de dados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o erro mais comum ao ler o modelo de responsabilidade compartilhada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Supor que o provedor cobre também o lado do cliente",
                            isCorrect: true,
                        },
                        {
                            text: "Achar que o modelo só vale para serviço gerenciado",
                            isCorrect: false,
                        },
                        {
                            text: "Supor que o cliente responde pela camada física",
                            isCorrect: false,
                        },
                        {
                            text: "Achar que o modelo muda a cada nova região usada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Perante a LGPD, o que o contrato com o provedor não consegue fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Transferir a responsabilidade do controlador do dado",
                            isCorrect: true,
                        },
                        {
                            text: "Registrar as obrigações técnicas de cada uma das partes",
                            isCorrect: false,
                        },
                        {
                            text: "Definir o operador que trata o dado pelo controlador",
                            isCorrect: false,
                        },
                        {
                            text: "Prever a notificação em caso de incidente relevante",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um repositório de objetos com dado de cliente ficou público por uma permissão errada da equipe. Como o modelo trata esse caso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A falha é do cliente, que definiu a permissão errada",
                            isCorrect: true,
                        },
                        {
                            text: "A falha é do provedor, que expôs o serviço por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Não há falha, já que o dado seguia cifrado em repouso",
                            isCorrect: false,
                        },
                        {
                            text: "A falha é dividida, porque o serviço é gerenciado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Quando o perímetro deixa de existir",
            blocks: [
                {
                    type: "text",
                    value: "# A muralha virou um monte de portas espalhadas\n\nO modelo antigo era o do castelo com fosso. Havia um dentro e um fora, o firewall de borda separava os dois, e quem estava dentro era tratado como confiável. Aquilo funcionava porque o mundo era assim: o servidor ficava num prédio da empresa, o funcionário sentava numa mesa ligada por cabo, e o tráfego que importava atravessava um ponto que você controlava.\n\nHoje a aplicação roda num provedor, o e-mail em outro, o sistema comercial em um terceiro, o desenvolvedor está em casa e o celular dele tem acesso ao mesmo painel administrativo. Não existe uma linha para desenhar em volta disso. O pacote entre o notebook do funcionário e o serviço de e-mail nunca passa por nada que a sua empresa opere. Não é que o perímetro tenha ficado fraco: ele deixou de existir como lugar.\n\nA consequência é direta. O controle que decide quem entra saiu da rede e foi para a identidade. Quem apresenta uma credencial válida e passa nas verificações está dentro, esteja em qualquer lugar do mundo. É exatamente por isso que ataque de credencial virou o vetor inicial mais comum: não é preciso furar muralha nenhuma quando a chave abre a porta de qualquer canto.",
                },
                {
                    type: "text",
                    value: "## A rede não perdeu importância, perdeu o posto de juiz\n\nVale desarmar o exagero, porque ele custa caro na outra direção. Segmentação continua valendo muito, só que como contenção, não como decisão de confiança. Ela responde a pergunta de até onde alguém chega depois que entrou, e não a pergunta de quem pode entrar. Quem troca uma coisa pela outra acaba com um ambiente onde qualquer carga de trabalho alcança qualquer outra, e aí o primeiro acesso vira acesso a tudo.\n\nO problema de usar endereço de origem como prova de quem é alguém é que ele parou de significar coisa alguma. A pessoa está atrás de VPN corporativa, o provedor troca o endereço de saída, o escritório usa tradução de endereço, o serviço gerenciado responde de um bloco compartilhado. Uma regra herdada que libera tudo o que vem da faixa interna, num ambiente onde todas as cargas de trabalho vivem na mesma rede virtual, entrega movimentação lateral de graça.\n\nA pergunta que a defesa faz mudou de lugar. Antes era de onde veio o pacote. Agora é quem é essa conta, em que dispositivo, com que histórico, e para fazer o quê. Isso muda inclusive o que você guarda: num ambiente sem perímetro, o registro de autenticação e o registro de chamadas administrativas valem mais que o registro do firewall de borda.",
                },
                {
                    type: "table",
                    value: '[["Decisão","Modelo de perímetro","Modelo centrado em identidade"],["Quem é confiável","Quem já está na rede interna","Quem prova identidade em cada acesso"],["Onde mora o controle","Firewall de borda da empresa","Diretório e política de acesso"],["Sinal principal","Endereço de origem do pacote","Conta, dispositivo e contexto do acesso"],["Efeito de uma invasão","Entrou uma vez, alcança tudo","Alcança o que aquela conta permite"],["Registro mais útil","Log do firewall e do proxy","Log de autenticação e de administração"]]',
                },
                {
                    type: "quote",
                    value: "Se a credencial é a chave e a rede virou corredor público, o registro de autenticação passa a valer mais que o registro do firewall.",
                },
                {
                    type: "text",
                    value: "## O que isso muda no seu trabalho\n\nA primeira mudança é de orçamento e atenção. Autenticação forte, de preferência resistente a phishing, deixa de ser projeto de melhoria e vira controle de base. Sessão curta, revalidação em operação sensível, rotação de chave e revisão de quem tem permissão administrativa passam para o topo da lista, na frente de várias caixas de rede que continuam sendo compradas por inércia.\n\nA segunda mudança é de classificação de ativo. O diretório de identidades vira o ativo mais crítico que a empresa tem, porque quem o controla controla todo o resto. Isso significa tratar as contas de administração do diretório com o mesmo cuidado que se dá a um cofre: poucas, nominais, com fator forte, com estação dedicada quando possível e com todo acesso registrado e revisado.\n\nA terceira mudança é de expectativa. Você não vai impedir que uma credencial seja comprometida algum dia. O que dá para fazer é reduzir o que uma credencial comprometida alcança e diminuir o tempo entre o uso indevido e a percepção. Esse par, limitar alcance e encurtar detecção, é o que a próxima década inteira de arquitetura de segurança vai repetir com nomes diferentes.",
                },
            ],
            questions: [
                {
                    statement: "Por que a identidade passou a ser a fronteira principal em nuvem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O acesso não depende mais de estar na rede interna",
                            isCorrect: true,
                        },
                        {
                            text: "O tráfego passou a ser cifrado de ponta a ponta sempre",
                            isCorrect: false,
                        },
                        {
                            text: "Os provedores deixaram de oferecer firewall gerenciado",
                            isCorrect: false,
                        },
                        {
                            text: "As senhas passaram a ser guardadas fora da empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o problema de usar o endereço de origem como prova de identidade?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele muda com VPN, tradução e endereço dinâmico", isCorrect: true },
                        {
                            text: "Ele só aparece no registro com muitas horas de atraso",
                            isCorrect: false,
                        },
                        {
                            text: "Ele deixou de ser registrado por serviço gerenciado",
                            isCorrect: false,
                        },
                        {
                            text: "Ele exige consulta paga a uma base de reputação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma regra herdada libera todo tráfego vindo da faixa interna, e todas as cargas vivem na mesma rede virtual. Qual é o efeito?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Movimentação lateral fica livre para quem entrar",
                            isCorrect: true,
                        },
                        {
                            text: "A aplicação perde acesso aos serviços gerenciados",
                            isCorrect: false,
                        },
                        {
                            text: "O tráfego passa a sair pela internet em vez do enlace",
                            isCorrect: false,
                        },
                        {
                            text: "A comunicação entre zonas de disponibilidade é cortada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: 'O que a frase "identidade é o novo perímetro" não deve significar?',
                    difficulty: "medio",
                    options: [
                        { text: "Que a segmentação de rede deixou de ter valor", isCorrect: true },
                        {
                            text: "Que o diretório vira um ativo de alta criticidade",
                            isCorrect: false,
                        },
                        {
                            text: "Que o contexto do acesso entra na decisão de liberar",
                            isCorrect: false,
                        },
                        {
                            text: "Que a autenticação precisa de mais de um fator",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num ambiente distribuído entre vários provedores, que registro tende a ser o mais valioso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O de autenticação e o de chamadas administrativas",
                            isCorrect: true,
                        },
                        {
                            text: "O do firewall de borda e o do proxy de navegação",
                            isCorrect: false,
                        },
                        {
                            text: "O de sistema operacional das máquinas virtuais",
                            isCorrect: false,
                        },
                        {
                            text: "O de fluxo de rede entre as sub-redes internas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Em nuvem, quase tudo falha por configuração",
            blocks: [
                {
                    type: "text",
                    value: "# Ninguém precisou explorar coisa nenhuma\n\nQuando você lê o relato de um vazamento grande em nuvem, a expectativa é encontrar uma falha exótica no hipervisor do provedor. Quase nunca é isso. O padrão que se repete há mais de dez anos é bem mais chato: um repositório de objetos deixado público, um banco de dados subido sem senha e alcançável pela internet, uma chave de acesso comitada no repositório de código, um painel administrativo sem segundo fator, uma cópia de segurança compartilhada sem restrição.\n\nO ponto importante é que essas não são vulnerabilidades no sentido clássico. Não existe correção a aplicar, não existe um número de catálogo para acompanhar. É configuração, e configuração é uma decisão que alguém tomou, geralmente com pressa e com boa intenção. O padrão de comportamento por trás é sempre o mesmo: alguém precisava destravar um trabalho, abriu o acesso para testar, o teste funcionou e ninguém voltou para fechar.\n\nA nuvem amplifica isso por um motivo estrutural. Ela expõe uma interface de programação global para criar e alterar recursos, e essa interface responde em segundos, de qualquer lugar, para qualquer credencial válida. O mesmo poder que fez o provisionamento cair de semanas para segundos fez o erro de configuração cair de semanas para segundos. Ninguém mais passa por um comitê antes de tornar um recurso público.",
                },
                {
                    type: "table",
                    value: '[["Erro de configuração","Como aparece na prática","Controle que previne de verdade"],["Armazenamento público","Repositório de objetos aberto a qualquer um","Bloqueio de acesso público no nível da organização"],["Banco exposto","Porta do banco alcançável pela internet","Rede privada obrigatória e negação de saída"],["Chave em código","Credencial de longa vida no repositório","Varredura de segredo e credencial temporária"],["Painel sem fator forte","Console administrativo só com senha","Fator resistente a phishing obrigatório"],["Cópia compartilhada","Imagem ou backup marcado como público","Política que nega compartilhamento externo"]]',
                },
                {
                    type: "quote",
                    value: "Não existe correção para publicar um repositório de objetos. O que existe é um controle que impede a pessoa apressada de fazer isso sem perceber.",
                },
                {
                    type: "text",
                    value: "## O tempo entre errar e ser encontrado é curto\n\nExiste uma ilusão confortável de que um recurso exposto por engano fica anônimo no meio da internet. Não fica. Faixas inteiras de endereço são varridas continuamente por gente que procura exatamente isso, e existem mecanismos de busca públicos que indexam serviços expostos. Um banco de dados aberto sem senha costuma ser encontrado em minutos, não em dias. O relato clássico é o do time que subiu um ambiente de teste no fim da tarde e encontrou, na manhã seguinte, a base apagada e um bilhete pedindo resgate.\n\nIsso muda a estratégia. Não adianta apostar em atenção humana, revisão manual ou treinamento como controle principal, porque o erro acontece justamente quando a pessoa está com pressa. O que funciona é o que a área chama de barreira de proteção: uma política no nível da organização que simplesmente não deixa criar recurso público, uma configuração padrão segura nos modelos que os times usam, e uma verificação contínua que aponta desvio no mesmo dia.\n\nRepare na hierarquia. Impedir é melhor que detectar, detectar é melhor que descobrir pelo noticiário. Quando impedir não é viável, porque existe um caso legítimo de exposição pública, o caminho é exigir uma exceção explícita, com dono e prazo, em vez de deixar o padrão aberto para todo mundo. Exceção documentada é diferente de bagunça, e a diferença é exatamente saber onde ela está.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é a causa mais comum de incidentes graves em ambientes de nuvem?",
                    difficulty: "facil",
                    options: [
                        { text: "Configuração errada feita pelo próprio cliente", isCorrect: true },
                        {
                            text: "Falha do hipervisor explorada por outro inquilino",
                            isCorrect: false,
                        },
                        {
                            text: "Quebra do algoritmo de cifra usado pelo provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Interceptação do tráfego entre regiões do provedor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que erro de configuração não é tratado como vulnerabilidade clássica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não há correção a aplicar, e sim decisão a mudar",
                            isCorrect: true,
                        },
                        {
                            text: "Ele nunca aparece nos registros de auditoria da conta",
                            isCorrect: false,
                        },
                        {
                            text: "Ele só afeta ambiente de teste, nunca o de produção",
                            isCorrect: false,
                        },
                        {
                            text: "Ele depende de acesso físico ao equipamento do provedor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quanto tempo costuma levar até alguém encontrar um banco de dados exposto sem senha?",
                    difficulty: "medio",
                    options: [
                        { text: "Minutos, porque a internet é varrida sem parar", isCorrect: true },
                        {
                            text: "Semanas, porque a faixa de endereço não é divulgada",
                            isCorrect: false,
                        },
                        {
                            text: "Meses, porque a varredura em massa foi criminalizada",
                            isCorrect: false,
                        },
                        {
                            text: "Dias, porque os mecanismos de busca atualizam devagar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que é uma barreira de proteção no contexto de configuração em nuvem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Política da organização que impede a criação insegura",
                            isCorrect: true,
                        },
                        {
                            text: "Alerta que avisa o time quando um recurso vira público",
                            isCorrect: false,
                        },
                        {
                            text: "Treinamento periódico sobre a configuração dos serviços",
                            isCorrect: false,
                        },
                        {
                            text: "Revisão manual de cada recurso antes de ir a produção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time precisa mesmo publicar um recurso na internet, mas a política da organização bloqueia. Qual é o encaminhamento profissional?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Exceção explícita, com dono definido e prazo de revisão",
                            isCorrect: true,
                        },
                        {
                            text: "Desligar a política, já que ela atrapalha o caso legítimo",
                            isCorrect: false,
                        },
                        {
                            text: "Liberar em uma conta separada e não registrar o desvio",
                            isCorrect: false,
                        },
                        {
                            text: "Manter o bloqueio e recusar o caso de uso do time",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Inventário e postura num ambiente que cresce sozinho",
            blocks: [
                {
                    type: "text",
                    value: "# Criar recurso deixou de ter atrito\n\nNo mundo de datacenter próprio, ter um servidor novo exigia orçamento, compra, prazo de entrega, espaço no rack e uma aprovação em algum lugar. Esse atrito era horrível para o negócio e ótimo para o inventário: nada aparecia sem alguém saber. Em nuvem, quem tem uma credencial válida cria vinte máquinas, três bancos e uma fila em menos de um minuto, sem falar com ninguém. Isso é a vantagem da nuvem, e é também a razão pela qual o inventário vence de validade em dias.\n\nO caso concreto é sempre parecido. Um time cria uma conta de laboratório para uma prova de conceito, sobe uma máquina com uma cópia de dado real para testar, a prova de conceito acaba, o projeto muda de rumo e a máquina fica ligada. Oito meses depois, ela continua respondendo na internet, com uma versão de biblioteca abandonada e um arquivo de ambiente contendo credencial que ainda funciona em produção. Ninguém agiu de má-fé em nenhum momento dessa história.\n\nDaí a primeira regra prática: inventário em nuvem precisa ser automático e contínuo, montado a partir da interface de programação do próprio provedor, e não de uma planilha preenchida à mão. Planilha não sobrevive a uma semana de time ativo. E precisa cobrir todas as contas, incluindo as que ninguém lembra que existem, porque justamente essas são as que ficam sem dono e sem monitoramento.",
                },
                {
                    type: "text",
                    value: "## Postura é a diferença entre ter e estar certo\n\nInventário responde o que existe. Postura responde se o que existe está de acordo com a regra. Uma ferramenta de postura compara o estado real do ambiente com o estado desejado e aponta o desvio: repositório público, chave sem rotação há dois anos, papel com permissão administrativa entregue a uma função, banco sem cifra, registro de auditoria desligado numa região.\n\nO problema clássico da adoção é o primeiro relatório. Ele vem com centenas ou milhares de achados, o time olha, sente que é impossível, e a ferramenta vira ruído ignorado em três semanas. A saída não é aumentar o time, é priorizar por exposição real. Um recurso que combina três fatores, alcançável da internet, com dado sensível e com permissão ampla, vale mais que cem achados de etiqueta faltando. Comece pelo topo dessa combinação e ignore o resto sem culpa até fechar a primeira faixa.\n\nVale também combinar com o time uma diferença que evita muita briga: achado não é incidente. Achado é dívida conhecida, entra na fila com prazo. Incidente é evidência de que alguém já usou aquilo. Misturar os dois faz a segurança gritar por tudo e ser levada a sério por nada.",
                },
                {
                    type: "table",
                    value: '[["Pergunta","Instrumento que responde","Sinal de que está ruim"],["O que existe no ambiente","Inventário contínuo pela interface do provedor","Recurso descoberto durante o incidente"],["Está conforme a regra","Verificação de postura contínua","Relatório enorme que ninguém lê"],["Quem é o dono disto","Etiqueta de dono e conta por time","Recurso órfão sem responsável"],["O que é urgente","Priorização por exposição e sensibilidade","Fila ordenada só pela nota da ferramenta"],["Isso já foi usado","Registro de auditoria e detecção","Achado tratado como se fosse incidente"]]',
                },
                {
                    type: "quote",
                    value: "Achado é dívida conhecida e entra na fila com prazo. Incidente é evidência de uso. Quem mistura os dois grita por tudo e é levado a sério por nada.",
                },
                {
                    type: "text",
                    value: "## Separar ambientes é o controle mais barato que existe\n\nA estrutura de contas, assinaturas ou projetos é um instrumento de segurança, e não só de cobrança. Colocar produção, homologação e laboratório em unidades separadas, cada uma com seu próprio conjunto de permissões, limita o raio de explosão de um erro ou de uma credencial vazada. Se o acesso comprometido era do laboratório, ele acaba no laboratório.\n\nEssa separação também simplifica a política. Fica fácil dizer que na unidade de produção ninguém cria recurso público, ninguém desliga registro de auditoria e ninguém usa credencial de longa vida, sem inviabilizar experimentação em outro lugar. Regra única para todo mundo tende a virar regra frouxa, porque ela precisa acomodar o caso mais permissivo que existe na empresa.\n\nHá um custo, e é honesto reconhecer: mais unidades significam mais estrutura para manter, mais cuidado com acesso entre elas e um trabalho inicial de organização que ninguém acha divertido. Ainda assim, entre gastar em ferramenta ou gastar em separar ambiente, separar ambiente costuma render mais. Ferramenta detecta o problema depois; separação limita o tamanho dele antes.",
                },
            ],
            questions: [
                {
                    statement: "Por que o inventário manual não funciona em ambiente de nuvem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Recursos são criados em segundos e sem aprovação",
                            isCorrect: true,
                        },
                        {
                            text: "O provedor não expõe a lista de recursos existentes",
                            isCorrect: false,
                        },
                        {
                            text: "A planilha não aceita a quantidade de linhas exigida",
                            isCorrect: false,
                        },
                        {
                            text: "Os nomes de recurso mudam a cada nova implantação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre inventário e postura?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Inventário diz o que existe; postura, se está conforme",
                            isCorrect: true,
                        },
                        {
                            text: "Inventário cobre a rede; postura cobre só a identidade",
                            isCorrect: false,
                        },
                        {
                            text: "Inventário é contínuo; postura é feita uma vez ao ano",
                            isCorrect: false,
                        },
                        {
                            text: "Inventário é do provedor; postura é sempre do cliente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O primeiro relatório de postura trouxe mil e duzentos achados. Qual é o encaminhamento mais eficaz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Priorizar por exposição, sensibilidade e permissão",
                            isCorrect: true,
                        },
                        {
                            text: "Tratar todos na ordem da nota atribuída pela ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "Suspender a ferramenta até o time crescer o suficiente",
                            isCorrect: false,
                        },
                        {
                            text: "Abrir um incidente para cada achado de nota elevada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a distinção prática entre um achado de postura e um incidente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Achado é risco conhecido; incidente já teve uso",
                            isCorrect: true,
                        },
                        {
                            text: "Achado vem de ferramenta; incidente vem de pessoa",
                            isCorrect: false,
                        },
                        {
                            text: "Achado afeta teste; incidente afeta só a produção",
                            isCorrect: false,
                        },
                        { text: "Achado é técnico; incidente é sempre jurídico", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que separar produção, homologação e laboratório em contas distintas é considerado um controle forte?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Limita o alcance de erro e de credencial vazada",
                            isCorrect: true,
                        },
                        {
                            text: "Elimina a necessidade de política de acesso por time",
                            isCorrect: false,
                        },
                        {
                            text: "Reduz o custo total pago mensalmente ao provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Garante cifra em repouso em todos os ambientes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Regiões, residência de dado e a decisão jurídica",
            blocks: [
                {
                    type: "text",
                    value: "# Onde o dado repousa não é detalhe de infraestrutura\n\nEscolher a região de um serviço parece uma decisão técnica, e em parte é: define latência, custo e quais serviços estão disponíveis. Só que ela define também sob qual ordenamento jurídico aquele dado passa a viver, quais autoridades podem exigir acesso a ele e que obrigações a sua empresa assume ao movimentá-lo. Isso transforma a escolha de região numa decisão compartilhada entre engenharia, jurídico e negócio.\n\nA LGPD não proíbe transferência internacional de dado pessoal. Ela condiciona: a transferência precisa se apoiar em alguma das bases previstas na lei, como país com nível de proteção adequado reconhecido pela autoridade, cláusulas contratuais padrão, normas corporativas globais ou consentimento específico e destacado do titular. Setores regulados acrescentam camadas próprias, e órgãos públicos costumam ter exigência de localização mais rígida.\n\nO exemplo que aparece com frequência é inocente e caro. Um time percebe latência alta para usuários de outro continente e cria uma réplica de leitura numa região de lá para melhorar a experiência. A mudança sobe numa terça-feira, funciona muito bem, e criou uma transferência internacional de dado pessoal, possivelmente de categoria sensível, sem base legal registrada e sem ninguém do jurídico saber. Tecnicamente impecável, juridicamente um problema.",
                },
                {
                    type: "table",
                    value: '[["Conceito","O que significa","Por que importa"],["Região","Área geográfica onde o recurso vive","Define a jurisdição aplicável ao dado"],["Zona","Isolamento de falha dentro da região","Trata disponibilidade, não residência"],["Replicação","Cópia do dado em outro local","Pode criar transferência sem intenção"],["Serviço global","Plano de controle fora da sua região","Metadado pode sair mesmo com dado local"],["Transferência internacional","Dado pessoal cruzando fronteira","Exige base legal prevista na LGPD"]]',
                },
                {
                    type: "quote",
                    value: "Réplica de leitura em outro continente é uma decisão de arquitetura na terça e uma transferência internacional de dado pessoal na quarta.",
                },
                {
                    type: "text",
                    value: "## Os três lugares onde a residência escapa sem avisar\n\nO primeiro é esquecer que dado não é só a tabela principal. Cópia de segurança, réplica, registro de auditoria, telemetria de aplicação, fila de mensagens e cache guardam pedaços do mesmo dado pessoal. Já vi ambiente com banco cuidadosamente fixado numa região e com todo o log de aplicação, cheio de identificador de cliente, indo para uma plataforma hospedada em outro país.\n\nO segundo é a natureza de alguns serviços. Vários recursos são globais por desenho: gestão de identidade, distribuição de conteúdo, resolução de nomes, faturamento. O dado de negócio pode continuar na região escolhida enquanto o metadado, o nome do recurso, o endereço do usuário e o registro de acesso circulam por outro lugar. Isso não é necessariamente proibido, mas precisa estar mapeado e declarado.\n\nO terceiro é o acesso operacional. Suporte do provedor, time de operação terceirizado ou um engenheiro de plantão em outro fuso podem acessar o ambiente de fora do país. Do ponto de vista da lei, acesso remoto a dado também é tratamento. A pergunta correta em qualquer avaliação não é apenas onde o dado está armazenado, e sim de onde ele pode ser acessado e por quem.",
                },
                {
                    type: "text",
                    value: "## Como decidir sem travar o projeto\n\nA sequência que funciona é curta. Primeiro, classifique o dado: pessoal comum, pessoal sensível, dado de pagamento, informação de negócio sem titular. Segundo, identifique quem é o titular e a que regulação ele responde. Terceiro, verifique se existe exigência contratual com cliente, porque muitos contratos corporativos fixam residência mesmo quando a lei não fixaria. Quarto, escolha a região e registre a decisão com a base legal usada.\n\nEsse registro é o que salva a empresa depois. Numa auditoria ou num pedido da autoridade, a pergunta não é se a escolha foi ousada, e sim se ela foi consciente e documentada. Uma decisão razoável e registrada se defende; uma decisão excelente que ninguém sabe explicar não se defende.\n\nPor último, uma nota de bom senso profissional. Segurança não deve decidir isso sozinha, e também não deve terceirizar a decisão inteira para o jurídico e sair de cena. O papel técnico é traduzir a arquitetura para o jurídico em termos claros, que dado sai, para onde, em que momento e quem consegue acessar, e trazer de volta a restrição em forma de configuração aplicada e verificada. Sem essa tradução, a política vira um documento que a infraestrutura contradiz em silêncio.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que a escolha de região de um serviço define além de latência e custo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A jurisdição a que o dado armazenado fica sujeito",
                            isCorrect: true,
                        },
                        {
                            text: "O algoritmo de cifra usado pelo provedor em repouso",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo de retenção obrigatório dos registros de acesso",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de zonas de disponibilidade contratadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como a LGPD trata a transferência internacional de dado pessoal?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Permite, desde que apoiada em uma base prevista na lei",
                            isCorrect: true,
                        },
                        {
                            text: "Proíbe para qualquer categoria de dado pessoal tratado",
                            isCorrect: false,
                        },
                        {
                            text: "Permite livremente quando o dado sai cifrado da origem",
                            isCorrect: false,
                        },
                        {
                            text: "Exige autorização prévia da autoridade em todos os casos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time cria uma réplica de leitura em outra região para reduzir latência. Que risco isso cria?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Transferência internacional sem base legal registrada",
                            isCorrect: true,
                        },
                        {
                            text: "Perda da cifra em repouso durante a cópia inicial",
                            isCorrect: false,
                        },
                        {
                            text: "Interrupção do registro de auditoria na região de origem",
                            isCorrect: false,
                        },
                        {
                            text: "Quebra da consistência entre a réplica e o banco primário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o descuido mais frequente ao fixar a residência de um dado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Esquecer backup, log e telemetria que saem da região",
                            isCorrect: true,
                        },
                        {
                            text: "Escolher uma zona de disponibilidade em vez de região",
                            isCorrect: false,
                        },
                        {
                            text: "Usar cifra gerenciada pelo provedor em vez da própria",
                            isCorrect: false,
                        },
                        {
                            text: "Definir retenção maior do que a exigida pelo regulador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Do ponto de vista da lei, por que perguntar apenas onde o dado está armazenado é insuficiente?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Acesso remoto ao dado também é tratamento de dado",
                            isCorrect: true,
                        },
                        {
                            text: "A cifra em repouso muda a natureza jurídica do dado",
                            isCorrect: false,
                        },
                        {
                            text: "O armazenamento nunca é auditável pelo próprio cliente",
                            isCorrect: false,
                        },
                        {
                            text: "A região informada pelo provedor não pode ser conferida",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Identidade é o novo perímetro",
    aulas: [
        {
            titulo: "Autenticação, autorização e federação",
            blocks: [
                {
                    type: "text",
                    value: "# Três palavras que muita gente usa como se fossem uma só\n\nAutenticação responde quem é você. Autorização responde o que você pode fazer depois de provar quem é. Federação responde em quem eu confio para fazer essa prova por mim. Confundir os três numa conversa custa tempo de reunião. Confundir os três num desenho de sistema custa incidente, e o formato do incidente é sempre parecido: um sistema com tela de login impecável que, uma vez passada a porta, entrega tudo para qualquer pessoa autenticada.\n\nO exemplo mais didático é bancário. Autenticação é o caixa conferir seu documento. Autorização é o caixa verificar se você pode mexer naquela conta específica e até que valor. Um banco que só fizesse a primeira parte deixaria você sacar da conta do vizinho, desde que você provasse ser você. Parece absurdo escrito assim, e é literalmente o que acontece numa interface interna que aceita qualquer token válido sem olhar o que aquele token permite.\n\nExiste uma quarta peça que costuma entrar junto e que a área chama de auditoria ou contabilização: registrar o que foi feito, por quem e quando. Sem ela, as outras três ficam sem verificação. Você pode ter autenticação forte e autorização bem desenhada e ainda assim não conseguir responder, no dia seguinte a um incidente, quem apagou o ambiente de produção. Guardar essa resposta é tão parte do desenho quanto negar o acesso.",
                },
                {
                    type: "text",
                    value: "## Federação, em termos práticos\n\nFederar significa que a aplicação para de guardar senha. Quando alguém tenta entrar, ela redireciona para o provedor de identidade da empresa, que faz a autenticação com os controles dele e devolve uma afirmação assinada dizendo que aquela pessoa é quem diz ser, junto com alguns atributos. Os dois protocolos que você vai encontrar são SAML, mais comum em software corporativo mais antigo, e OpenID Connect, dominante em coisa nova.\n\nAqui mora uma confusão que aparece até em time experiente. OAuth 2.0 não é protocolo de autenticação, é de delegação de autorização: ele existe para uma aplicação agir em nome do usuário sobre um recurso, e o token que ele emite não diz quem o usuário é. OpenID Connect é a camada que foi construída em cima do OAuth exatamente para resolver isso, com um token de identidade separado. Sistemas que usam token de acesso como prova de identidade acabam aceitando token emitido para outra finalidade.\n\nO ganho da federação é enorme e vale o esforço: um único lugar para desligar uma pessoa, um único lugar para exigir segundo fator, e senha que não se espalha por quarenta sistemas. O preço é a concentração. Quem controlar o provedor de identidade controla tudo o que confia nele, e uma afirmação forjada ou um token roubado pulam a senha inteira. É por isso que o próximo assunto do módulo é o diretório, e por que ele merece o cuidado que merece.",
                },
                {
                    type: "table",
                    value: '[["Conceito","Pergunta que ele responde","Falha típica quando é ignorado"],["Autenticação","Quem é você de verdade","Senha única, sem segundo fator algum"],["Autorização","O que você pode fazer aqui","Qualquer autenticado vira administrador"],["Federação","Em quem eu confio para provar","Confiança aceita sem restringir domínio"],["Delegação","Que aplicação age em seu nome","Consentimento amplo demais concedido"],["Auditoria","O que foi feito e por quem","Ninguém sabe quem apagou o recurso"]]',
                },
                {
                    type: "quote",
                    value: "Autenticação sem autorização é a portaria que confere o documento de todo mundo e depois libera geral para a sala do cofre.",
                },
                {
                    type: "text",
                    value: "## O erro de desenho que mais aparece\n\nO padrão errado mais comum em serviço interno é tratar a autenticação como se ela decidisse tudo. A interface valida que o token é legítimo, confirma a assinatura, checa a validade, e libera a operação. Ela nunca pergunta se aquele sujeito específico pode ler aquele recurso específico. Funciona lindamente em teste, porque em teste todo mundo tem acesso a tudo, e vira acesso horizontal completo em produção, onde um cliente lê o dado de outro trocando um identificador na chamada.\n\nA correção não é sofisticada, é disciplina: a decisão de autorização precisa acontecer perto do dado e considerar o objeto, não apenas o verbo. Perguntar se a pessoa pode ler contrato é diferente de perguntar se ela pode ler aquele contrato. Sistemas que só implementam a primeira pergunta ficam vulneráveis a uma classe inteira de falha que aparece em qualquer teste de segurança de aplicação.\n\nUma dica de julgamento profissional para revisão de arquitetura: peça para desenharem, no quadro, onde exatamente a decisão de autorização acontece. Se a resposta for que ela acontece na borda, no gateway, e ninguém souber dizer o que acontece quando uma chamada chega ao serviço sem passar pela borda, você encontrou o problema antes que ele encontrasse você.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença entre autenticação e autorização?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma prova quem é você, a outra diz o que pode fazer",
                            isCorrect: true,
                        },
                        {
                            text: "Uma vale para pessoa, a outra vale só para máquina",
                            isCorrect: false,
                        },
                        {
                            text: "Uma acontece na borda, a outra sempre no banco de dados",
                            isCorrect: false,
                        },
                        {
                            text: "Uma usa senha, a outra usa certificado do dispositivo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que federação de identidade significa na prática?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A aplicação confia na prova feita por outro provedor",
                            isCorrect: true,
                        },
                        {
                            text: "A aplicação guarda a senha em um cofre centralizado",
                            isCorrect: false,
                        },
                        {
                            text: "A aplicação replica os usuários em cada ambiente",
                            isCorrect: false,
                        },
                        {
                            text: "A aplicação exige segundo fator em toda operação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que dizer que OAuth 2.0 é um protocolo de autenticação está errado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele delega autorização e não afirma quem é o usuário",
                            isCorrect: true,
                        },
                        {
                            text: "Ele foi substituído por SAML na maioria dos sistemas",
                            isCorrect: false,
                        },
                        {
                            text: "Ele só funciona quando existe um segundo fator ativo",
                            isCorrect: false,
                        },
                        {
                            text: "Ele emite token sem assinatura e sem prazo de validade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um serviço interno aceita qualquer token válido e não verifica de quem é o recurso pedido. Que falha isso cria?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Acesso ao dado de outro cliente trocando o identificador",
                            isCorrect: true,
                        },
                        {
                            text: "Aceitação de token expirado por falta de conferir validade",
                            isCorrect: false,
                        },
                        {
                            text: "Perda do registro de auditoria das chamadas recebidas",
                            isCorrect: false,
                        },
                        {
                            text: "Escalonamento para administrador pela troca de senha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o papel da auditoria dentro do conjunto de controles de identidade?",
                    difficulty: "facil",
                    options: [
                        { text: "Registrar o que foi feito, por quem e quando", isCorrect: true },
                        {
                            text: "Bloquear a operação quando o risco parecer alto",
                            isCorrect: false,
                        },
                        { text: "Emitir o token de identidade para a aplicação", isCorrect: false },
                        { text: "Confirmar a senha antes de liberar a sessão", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "O diretório corporativo e o que ele controla",
            blocks: [
                {
                    type: "text",
                    value: "# O diretório decide todos os outros sistemas\n\nActive Directory é o diretório local que sustenta a maioria das redes corporativas desde os anos 2000: guarda usuários, grupos, máquinas e políticas, e autentica com Kerberos dentro do domínio. Entra ID é o diretório de nuvem que emite token para aplicações modernas, aplica acesso condicional e federa serviços por OpenID Connect e SAML. Boa parte das empresas roda os dois ao mesmo tempo, sincronizados, no arranjo que se chama híbrido.\n\nVale entender o que exatamente esse componente controla, porque a resposta muda a prioridade de defesa. Ele decide quem existe, quem pertence a qual grupo, que política se aplica a cada acesso e quais aplicações confiam nele. Quem se torna administrador do diretório pode criar identidade nova, colocar a si mesmo em qualquer grupo e, por consequência, alcançar tudo o que aquele grupo alcança. O diretório não é um sistema importante entre outros: é o sistema que decide os outros.\n\nA armadilha operacional mais comum é o grupo aninhado. Alguém coloca o grupo A dentro do grupo B, que já estava dentro do C, e o C concede acesso administrativo a um sistema de produção. Ninguém tomou a decisão de dar produção para os integrantes do A, e mesmo assim o efeito é esse. Uma revisão de identidade que só olha os membros diretos de um grupo passa reto por isso. A pergunta correta é sempre pelo acesso efetivo, e não pelo acesso declarado.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Diretório local clássico","Diretório de nuvem"],["Protocolo típico","Kerberos e LDAP dentro do domínio","OpenID Connect e SAML por token"],["Unidade de agrupamento","Grupo e unidade organizacional","Grupo e papel de aplicação"],["Onde a política atua","Política aplicada na máquina","Acesso condicional na sessão"],["Alcance do comprometimento","Domínio e florestas confiáveis","Todos os serviços federados nele"],["Registro que mais importa","Log do controlador de domínio","Log de entrada e de consentimento"]]',
                },
                {
                    type: "quote",
                    value: "Revisão de acesso que olha só o membro direto de um grupo não enxerga o aninhamento. Pergunte sempre pelo acesso efetivo.",
                },
                {
                    type: "text",
                    value: "## O elo híbrido é onde o problema costuma morar\n\nPara manter os dois diretórios em sincronia, existe um componente de sincronização com credenciais privilegiadas dos dois lados. Ele lê o diretório local e escreve no diretório de nuvem, e em muitas instalações também escreve de volta. Isso faz do servidor que hospeda essa sincronização um dos ativos mais sensíveis da empresa, e ele quase nunca é tratado assim: costuma ser uma máquina qualquer, no meio do mesmo domínio, atualizada quando dá.\n\nA consequência prática é uma ponte de duas mãos. Comprometer o ambiente local abre caminho para o ambiente de nuvem, e configurações específicas de escrita de volta abrem o caminho inverso. Empresas que investiram muito em segurança de nuvem e deixaram o domínio local envelhecendo descobrem isso do jeito ruim, porque o atacante entra pelo lado barato e chega no lado caro pela ponte que a própria empresa construiu.\n\nOutro detalhe que passa despercebido é o que se sincroniza. Contas administrativas locais, contas de serviço antigas e objetos desativados que ninguém limpou vão junto por padrão em muitas configurações. Filtrar o escopo de sincronização para não levar identidade privilegiada de um ambiente para o outro é um trabalho de uma tarde que remove uma classe inteira de caminho de ataque.",
                },
                {
                    type: "text",
                    value: "## O modelo de camadas, que continua sendo o melhor conselho\n\nA ideia é antiga e continua valendo: separe as identidades em camadas pela criticidade do que elas controlam. A camada mais alta é a que administra o próprio diretório e a infraestrutura de identidade. A intermediária administra servidores e aplicações. A mais baixa é a estação de trabalho do dia a dia. A regra única e inegociável é que credencial de uma camada alta nunca é usada em máquina de camada baixa.\n\nO motivo é concreto. Quando um administrador de domínio entra na estação de um usuário para resolver um problema, o rastro dessa credencial fica na memória daquela máquina. Se a estação estiver comprometida, o invasor colhe aquilo e sobe direto para o topo. Muitos incidentes graves têm exatamente esse formato, e o controle que os teria evitado não é uma ferramenta cara, é a disciplina de usar estação dedicada para administração.\n\nNa nuvem o princípio vira o mesmo com outra roupa: conta administrativa separada da conta do dia a dia, sem e-mail e sem navegação, com fator resistente a phishing, usada só para operação privilegiada e com elevação temporária. Se a pessoa lê e-mail com a mesma identidade que administra o ambiente, todo phishing que chegar nela é um phishing contra o ambiente inteiro.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que o diretório de identidades é considerado o ativo mais crítico?",
                    difficulty: "facil",
                    options: [
                        { text: "Quem o controla decide o acesso a todo o resto", isCorrect: true },
                        {
                            text: "Ele guarda a maior parte do dado sensível da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Ele concentra o tráfego de rede de todas as filiais",
                            isCorrect: false,
                        },
                        {
                            text: "Ele mantém a cópia de segurança de todos os sistemas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o risco típico de grupos aninhados no diretório?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Conceder acesso que ninguém decidiu conscientemente",
                            isCorrect: true,
                        },
                        {
                            text: "Impedir a autenticação de quem está em vários grupos",
                            isCorrect: false,
                        },
                        {
                            text: "Duplicar o usuário em cada grupo pai da hierarquia",
                            isCorrect: false,
                        },
                        {
                            text: "Atrasar a replicação entre os controladores do domínio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o servidor de sincronização entre diretório local e de nuvem merece cuidado especial?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele tem credencial privilegiada nos dois ambientes",
                            isCorrect: true,
                        },
                        {
                            text: "Ele armazena as senhas dos usuários em texto claro",
                            isCorrect: false,
                        },
                        {
                            text: "Ele é o único ponto de saída para a internet pública",
                            isCorrect: false,
                        },
                        {
                            text: "Ele emite os certificados usados por toda a empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a regra central do modelo de camadas de administração?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Credencial de camada alta não entra em máquina baixa",
                            isCorrect: true,
                        },
                        {
                            text: "Cada camada usa um provedor de identidade diferente",
                            isCorrect: false,
                        },
                        {
                            text: "Toda administração acontece por acesso remoto cifrado",
                            isCorrect: false,
                        },
                        {
                            text: "A conta de administrador troca de senha toda semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um administrador de nuvem usa a mesma identidade para ler e-mail e para administrar o ambiente. Qual é a consequência mais séria?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Todo phishing recebido vira risco para o ambiente inteiro",
                            isCorrect: true,
                        },
                        {
                            text: "O registro de auditoria deixa de separar as duas atividades",
                            isCorrect: false,
                        },
                        {
                            text: "O acesso condicional não consegue avaliar o dispositivo",
                            isCorrect: false,
                        },
                        {
                            text: "A sessão administrativa expira junto com a do e-mail",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Privilégio mínimo, e por que ele apodrece",
            blocks: [
                {
                    type: "text",
                    value: "# Fácil de enunciar, difícil de manter vivo\n\nPrivilégio mínimo diz que cada identidade recebe exatamente o que precisa para fazer o trabalho, pelo tempo em que precisa, e nada além disso. Todo mundo concorda com o enunciado. Praticamente nenhuma empresa consegue sustentá-lo por dois anos seguidos, e entender por que isso acontece vale mais do que repetir a definição.\n\nO primeiro obstáculo é honesto: no dia em que o acesso é concedido, ninguém sabe direito qual é o mínimo. A pessoa entrou ontem, o sistema é grande, o prazo é hoje. Então alguém concede um conjunto largo para destravar, com a intenção sincera de reduzir depois. Depois não chega, porque reduzir significa arriscar quebrar algo que funciona, e ninguém quer ser a pessoa que quebrou a produção às onze da noite para diminuir uma permissão que ninguém estava reclamando.\n\nO segundo obstáculo é a assimetria de incentivo, e ela explica o resto sozinha. Conceder tem benefício imediato e visível, o time destrava, e risco difuso e futuro. Remover tem risco imediato e visível, algo pode parar, e benefício difuso, um incidente que talvez nunca aconteça. Enquanto essa conta for assim, a permissão só cresce, e nenhuma ferramenta conserta um incentivo. O que dá para fazer é mudar o desenho do processo para que a permissão morra sozinha em vez de precisar ser morta por alguém.",
                },
                {
                    type: "table",
                    value: '[["Prática","O que ela resolve","Custo real de adotar"],["Conceder por papel, não por pessoa","Evita permissão sob medida por indivíduo","Exige desenhar os papéis antes"],["Usar dado de uso real","Substitui o palpite pelo que foi usado","Precisa de janela de observação"],["Prazo de validade em exceção","Faz a permissão expirar sem briga","Alguém precisa renovar quando é legítimo"],["Separar leitura de alteração","Reduz muito o alcance do dia a dia","Duas trilhas de acesso para manter"],["Elevação temporária","Tira o privilégio permanente da mesa","Depende de fluxo rápido de aprovação"]]',
                },
                {
                    type: "quote",
                    value: "Conceder tem benefício visível e risco difuso. Remover tem risco visível e benefício difuso. Enquanto a conta for essa, a permissão só cresce.",
                },
                {
                    type: "text",
                    value: "## O que funciona de verdade\n\nO recurso mais útil que a nuvem trouxe para esse problema é o dado de uso. Os provedores registram quais permissões cada identidade efetivamente exerceu numa janela recente, e isso troca a discussão de opinião por evidência. Em vez de perguntar ao time se ele precisa de escrita naquele serviço, você mostra que a permissão está concedida há catorze meses e nunca foi usada. Fica muito mais difícil defender a permissão, e muito mais fácil remover sem drama.\n\nO segundo recurso é conceder por papel e não por pessoa. Papel sobrevive à rotatividade, pessoa não. Quando alguém sai do time, remover a pessoa do papel resolve, e quando alguém entra, adicionar resolve. Permissão feita sob medida para um indivíduo é a que ninguém revisa, porque a lógica dela morreu junto com o contexto de quem a criou.\n\nO terceiro é o prazo de validade. Toda exceção nasce com data de morte, e a renovação exige uma frase de justificativa. Isso inverte a assimetria: em vez de alguém precisar tomar a iniciativa de remover, com todo o risco que isso carrega, alguém precisa tomar a iniciativa de manter. Nas empresas onde vi isso funcionando, a maior parte das exceções simplesmente não é renovada, porque a necessidade já tinha passado e ninguém tinha percebido.",
                },
                {
                    type: "text",
                    value: "## O que privilégio mínimo não é\n\nNão é virar gargalo. Se o caminho oficial para conseguir um acesso legítimo leva duas semanas e passa por três aprovações, o time cria um atalho, e o atalho é sempre pior do que a permissão que você negou: uma chave compartilhada num canal de conversa, uma conta genérica que todo mundo usa, um serviço rodando com permissão de administrador porque ninguém aguentava mais abrir chamado. Processo lento não produz segurança, produz clandestinidade.\n\nTambém não é revisar tudo o tempo todo. Revisão vale onde o risco está: acesso administrativo, acesso a dado pessoal, acesso de terceiro e permissão que pode apagar ou exfiltrar. Revisar trimestralmente o acesso de leitura a um painel de indicadores consome o mesmo esforço político e não compra risco reduzido.\n\nE não é sinônimo de negar. O trabalho profissional aqui é oferecer o caminho certo mais rápido do que o caminho errado. Quando pedir elevação temporária leva dois minutos e um clique de aprovação, ninguém guarda credencial administrativa permanente. Quando leva um dia, todo mundo guarda. A segurança que ganha é a que é conveniente o suficiente para ser usada.",
                },
            ],
            questions: [
                {
                    statement: "O que o princípio do privilégio mínimo estabelece?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cada identidade recebe só o necessário e pelo tempo certo",
                            isCorrect: true,
                        },
                        {
                            text: "Cada identidade passa a ter uma senha longa e exclusiva",
                            isCorrect: false,
                        },
                        {
                            text: "Cada acesso administrativo exige aprovação de dois chefes",
                            isCorrect: false,
                        },
                        {
                            text: "Cada sistema mantém sua própria base de usuários local",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a permissão concedida tende a nunca ser reduzida depois?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Remover tem risco visível e benefício apenas difuso",
                            isCorrect: true,
                        },
                        {
                            text: "As ferramentas não permitem revogar acesso já concedido",
                            isCorrect: false,
                        },
                        {
                            text: "A auditoria exige manter o histórico de acesso ativo",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor cobra pela alteração de política já aplicada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual recurso da nuvem mais ajuda a reduzir permissão sem discussão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O registro de quais permissões foram de fato usadas",
                            isCorrect: true,
                        },
                        {
                            text: "O relatório de custo por serviço consumido no mês",
                            isCorrect: false,
                        },
                        {
                            text: "O inventário de recursos criados em cada uma das contas",
                            isCorrect: false,
                        },
                        {
                            text: "A nota de risco atribuída pela ferramenta de postura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que colocar prazo de validade em exceções funciona tão bem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Inverte o esforço: manter passa a exigir iniciativa",
                            isCorrect: true,
                        },
                        {
                            text: "Impede que qualquer exceção seja concedida ao time",
                            isCorrect: false,
                        },
                        {
                            text: "Elimina a necessidade de revisar acesso privilegiado",
                            isCorrect: false,
                        },
                        {
                            text: "Transfere a decisão de acesso para a auditoria interna",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O processo oficial para obter acesso legítimo leva duas semanas. Qual é o efeito mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O time cria atalhos piores que a permissão negada",
                            isCorrect: true,
                        },
                        {
                            text: "O time deixa de precisar do acesso e segue sem ele",
                            isCorrect: false,
                        },
                        {
                            text: "A auditoria passa a reprovar o controle de aprovação",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor bloqueia a conta por inatividade do usuário",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Contas de serviço, chaves e o segredo de longa vida",
            blocks: [
                {
                    type: "text",
                    value: "# O problema não é a chave, é o tempo de vida dela\n\nIdentidade de pessoa tem várias coisas boas de graça: um rosto, um gestor, uma data de desligamento, um segundo fator, um comportamento que dá para observar. Identidade de máquina não tem nada disso. Ela é uma credencial dentro de um arquivo de configuração, criada às pressas para destravar uma integração, frequentemente compartilhada entre três sistemas e quase sempre sem dono declarado. Quando alguém pergunta quem é responsável por aquela conta de serviço, a resposta honesta costuma ser o silêncio.\n\nO pior padrão dentro dessa categoria é a chave estática de longa vida. Ela funciona de qualquer origem, para sempre, sem segundo fator e sem expirar. Um par de identificador e segredo assim vaza por caminhos banais: comitado no repositório, impresso num registro de depuração, colado num chamado de suporte, gravado numa camada de imagem de contêiner que foi publicada, exportado numa variável de ambiente que apareceu no rastro de uma exceção.\n\nA alternativa moderna é dar identidade à própria carga de trabalho. Em vez de guardar um segredo, a máquina, o contêiner ou a função recebe da plataforma uma credencial de curta duração, atrelada ao lugar onde ela roda, renovada automaticamente e válida por minutos ou horas. Isso não deixa o problema menor, deixa o problema sem objeto: não existe segredo para vazar, porque não existe segredo guardado. Sempre que o serviço em questão suportar esse modelo, ele é a escolha certa.",
                },
                {
                    type: "table",
                    value: '[["Padrão comum","Por que ele dói","Substituto recomendado"],["Chave estática de longa vida","Vale sempre e de qualquer origem","Identidade da própria carga de trabalho"],["Senha no arquivo de configuração","Vaza no repositório e na imagem","Cofre com injeção no momento da execução"],["Segredo compartilhado por times","Ninguém sabe quem usa nem gira","Um segredo por consumidor identificado"],["Certificado sem inventário","Expira em produção sem aviso","Inventário com renovação automatizada"],["Token de integração amplo","Faz muito mais do que precisaria","Escopo mínimo por integração criada"]]',
                },
                {
                    type: "quote",
                    value: "Credencial de curta duração não some do mundo por magia. Ela some porque o invasor que a roubou tem uma hora, e não dois anos, para usá-la.",
                },
                {
                    type: "text",
                    value: "## O cofre resolve metade do problema\n\nUm cofre de segredos entrega guarda central, controle de acesso, registro de quem leu o quê e um caminho para rotação. É um ganho real e vale implantar. Só que ele traz de volta uma pergunta em looping: para ler o segredo no cofre, a aplicação precisa de uma credencial, e onde essa fica? Se a resposta for outro arquivo com outra chave estática, você moveu o problema um passo e não resolveu nada.\n\nA saída é justamente a identidade de plataforma. O cofre confia na identidade que o provedor atribui àquela carga de trabalho, e ninguém precisa distribuir credencial inicial. Quando isso não é possível, por exemplo em sistema que roda fora da nuvem, o mínimo aceitável é uma credencial de acesso ao cofre com escopo estreito, prazo curto e rotação automática, tratada como o segredo mais sensível do conjunto.\n\nVale desfazer outra ilusão. Colocar um segredo dentro do cofre não faz esse segredo girar. Rotação exige que o sistema que consome aceite receber um valor novo sem cair, e é aí que a maioria dos projetos trava. O trabalho de verdade é preparar a aplicação para ler o segredo a cada uso em vez de na inicialização, e aceitar dois valores válidos durante a janela de troca. Sem isso, o cofre vira um lugar organizado para guardar segredos que nunca mudam.",
                },
                {
                    type: "text",
                    value: "## Quando um segredo vaza\n\nA primeira decisão é a mais importante e costuma ser adiada: considere a credencial comprometida no instante em que ela tocou um lugar onde não deveria estar, mesmo sem prova de uso indevido. Gire primeiro, investigue depois. Discutir por três horas se alguém realmente viu aquilo é tempo que o adversário usa melhor do que você.\n\nRemover o commit do histórico do repositório não resolve. O valor já foi replicado em cópias locais, em bifurcações, em espelhos internos, em cache de plataforma e provavelmente já foi coletado por varredura automática, porque existem robôs monitorando repositórios públicos exatamente para isso, com tempo de captura medido em segundos. A limpeza do histórico é higiene, não contenção.\n\nDepois de girar, o trabalho é procurar uso. Vale varrer o registro de auditoria por chamadas feitas com aquela credencial, principalmente de origens novas, em regiões que a empresa não usa e em horários fora do padrão daquele sistema. E fica um critério importante para declarar o caso fechado: rotação só conta quando o valor antigo foi de fato invalidado. Emitir uma chave nova e deixar a velha ativa por precaução é o mesmo que não ter feito nada.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é o principal problema de uma chave de acesso estática de longa vida?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Vale de qualquer origem e por tempo indeterminado",
                            isCorrect: true,
                        },
                        {
                            text: "Usa um algoritmo de cifra considerado fraco hoje",
                            isCorrect: false,
                        },
                        {
                            text: "Exige troca manual a cada nova versão do sistema",
                            isCorrect: false,
                        },
                        { text: "Só funciona dentro da região onde foi criada", isCorrect: false },
                    ],
                },
                {
                    statement: "O que significa dar identidade à própria carga de trabalho?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A plataforma emite credencial curta para onde o código roda",
                            isCorrect: true,
                        },
                        {
                            text: "Cada aplicação recebe um usuário nominal no diretório",
                            isCorrect: false,
                        },
                        {
                            text: "O segredo passa a ser cifrado dentro do repositório de código",
                            isCorrect: false,
                        },
                        {
                            text: "A aplicação assume a identidade de quem a implantou",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual limitação um cofre de segredos não resolve sozinho?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A credencial necessária para acessar o próprio cofre",
                            isCorrect: true,
                        },
                        {
                            text: "O controle de quem pode ler cada segredo guardado",
                            isCorrect: false,
                        },
                        {
                            text: "O registro de auditoria das leituras realizadas",
                            isCorrect: false,
                        },
                        {
                            text: "O armazenamento cifrado dos valores em repouso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que remover o commit do histórico não contém um segredo vazado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cópias, espelhos e robôs de varredura já captaram o valor",
                            isCorrect: true,
                        },
                        {
                            text: "O provedor mantém o histórico completo por obrigação legal",
                            isCorrect: false,
                        },
                        {
                            text: "A remoção só funciona em repositório privado da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "O valor continua registrado no cofre de segredos da equipe",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma equipe emitiu uma chave nova e manteve a antiga ativa por precaução. Como avaliar essa rotação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Não houve rotação, porque o valor antigo segue válido",
                            isCorrect: true,
                        },
                        {
                            text: "Houve rotação parcial, aceitável durante a transição",
                            isCorrect: false,
                        },
                        {
                            text: "Houve rotação, já que o novo valor passou a ser usado",
                            isCorrect: false,
                        },
                        {
                            text: "Não é possível avaliar sem o registro de uso da chave",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ciclo de vida de acesso: entrada, mudança e saída",
            blocks: [
                {
                    type: "text",
                    value: "# A mudança de área é o pior dos três eventos\n\nO ciclo de vida de acesso tem três momentos: alguém entra, alguém muda de função e alguém sai. As empresas costumam ir bem no primeiro, porque quem chega e não consegue trabalhar reclama no mesmo dia e todo mundo fica sabendo. Vão razoavelmente no terceiro, porque desligamento tem processo de recursos humanos e alguém confere. E vão muito mal no segundo, porque quando uma pessoa muda de área e mantém o acesso antigo, ninguém sofre, ninguém reclama e nada quebra.\n\nÉ exatamente esse silêncio que faz da mudança de área o motor do acúmulo. A pessoa entra no suporte e recebe acesso ao sistema de chamados e à base de clientes. Dois anos depois vai para o financeiro e ganha o sistema fiscal e o painel de pagamentos, sem perder o anterior. Mais três anos e vai para engenharia, onde recebe acesso ao ambiente de produção. Agora existe uma única conta que lê dado de cliente, movimenta pagamento e altera produção, e nenhum gestor jamais aprovaria essa combinação se ela fosse apresentada de uma vez.\n\nO efeito no risco é direto. Se essa conta cair num phishing, o invasor não recebe o acesso de uma função, recebe a união de três. E como cada pedaço foi concedido legitimamente, nenhum controle vai apontar anomalia: está tudo aprovado, tudo registrado, tudo em ordem. O problema não é nenhuma das concessões, é a soma que ninguém nunca olhou junta.",
                },
                {
                    type: "table",
                    value: '[["Evento","O que deveria acontecer","Falha típica na prática"],["Entrada","Acesso pelo papel, com aprovação registrada","Copiar as permissões de um colega"],["Mudança de área","Remover o antigo antes de conceder o novo","Somar o novo e manter todo o anterior"],["Promoção","Rever o conjunto inteiro do papel novo","Herdar tudo do cargo anterior"],["Afastamento longo","Suspender conta e credenciais associadas","Conta ativa sem ninguém usando"],["Saída","Desativar no diretório e girar segredos","Desativar apenas o e-mail corporativo"]]',
                },
                {
                    type: "quote",
                    value: "Ninguém abre chamado reclamando de acesso que sobrou. É por isso que o acúmulo fica invisível até o dia em que alguém usa a conta inteira.",
                },
                {
                    type: "text",
                    value: "## O pedido que parece inofensivo e não é\n\nExiste uma frase que aparece em toda empresa e que merece uma resposta ensaiada: deixa esse novo com o mesmo acesso da Maria. É prático, é rápido e resolve o problema de quem pediu. Também replica, para uma pessoa que entrou ontem, cinco anos de acúmulo da Maria, incluindo aquela permissão temporária de 2021 que ninguém removeu. Depois de três contratações assim, a empresa tem quatro pessoas com o acesso da Maria e ninguém consegue mais dizer qual é o acesso correto do cargo.\n\nA correção é provisionar por papel. Existe um conjunto de acessos definido para analista de suporte, e quem entra recebe aquele conjunto, não o retrato de um colega. Desenhar esses papéis dá trabalho na primeira vez e depois se paga sozinho, porque toda entrada, mudança e auditoria passam a ter uma referência objetiva para comparar. Sem essa referência, revisão de acesso vira uma conversa sobre memória de gestor.\n\nO outro pilar é a origem do gatilho. Quem sabe primeiro que alguém entrou, mudou ou saiu não é a área de tecnologia, é a de pessoas. Ligar o provisionamento ao sistema de recursos humanos, de modo que a mudança de centro de custo dispare a revisão de acesso automaticamente, é o que transforma um processo que depende de alguém lembrar num processo que acontece sozinho.",
                },
                {
                    type: "text",
                    value: "## A saída, e o que quase todo mundo esquece\n\nDesativar a conta no diretório resolve muita coisa de uma vez, e é por isso que a federação vale tanto: tudo o que confia no diretório cai junto. O problema mora no que não passa por ali. Contas locais em sistemas que nunca foram federados, chaves estáticas que a pessoa criou para automatizar o trabalho dela, tokens pessoais no repositório de código, acesso a ferramentas contratadas com cartão corporativo pela própria equipe, e credencial compartilhada que a pessoa conhecia de cor.\n\nA credencial compartilhada é o caso mais desconfortável, porque a única resposta correta é girar o segredo a cada saída, e ninguém quer fazer isso. É por essa razão que segredo compartilhado é um problema de ciclo de vida antes de ser um problema técnico: enquanto ele existir, cada desligamento carrega uma tarefa que a empresa vai adiar até esquecer.\n\nUma boa saída também tem prazo e evidência. Desativar em até vinte e quatro horas para saída planejada, imediatamente para desligamento conflituoso, com registro de o que foi desativado e quando. Esse registro não é burocracia: é a resposta que a auditoria vai pedir, e é o que separa a empresa que sabe quem tinha acesso da empresa que acredita que ninguém mais tem.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual etapa do ciclo de vida de acesso costuma falhar mais nas empresas?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A mudança de área, porque ninguém reclama do excesso",
                            isCorrect: true,
                        },
                        {
                            text: "A entrada, porque o acesso demora a ser concedido",
                            isCorrect: false,
                        },
                        {
                            text: "A saída, porque o diretório não permite desativação",
                            isCorrect: false,
                        },
                        {
                            text: "A promoção, porque exige nova aprovação do gestor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que copiar o acesso de um colega para quem entra é uma prática ruim?",
                    difficulty: "medio",
                    options: [
                        { text: "Replica anos de acúmulo para quem chegou ontem", isCorrect: true },
                        {
                            text: "Impede a federação da nova conta com o diretório",
                            isCorrect: false,
                        },
                        {
                            text: "Cria conflito entre grupos com o mesmo nome no diretório",
                            isCorrect: false,
                        },
                        {
                            text: "Exige aprovação do colega que serviu de referência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza o acúmulo de permissão de quem muda de time?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Somar acessos de várias funções sem perder os antigos",
                            isCorrect: true,
                        },
                        {
                            text: "Perder o acesso antigo antes de receber o novo papel",
                            isCorrect: false,
                        },
                        {
                            text: "Manter duas contas nominais no mesmo diretório ativo",
                            isCorrect: false,
                        },
                        {
                            text: "Receber permissão administrativa por prazo determinado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que ligar o provisionamento ao sistema de recursos humanos ajuda tanto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele sabe antes de todo mundo quem entrou, mudou ou saiu",
                            isCorrect: true,
                        },
                        {
                            text: "Ele guarda a lista de permissões aprovadas por sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Ele consegue desativar as contas locais não federadas",
                            isCorrect: false,
                        },
                        {
                            text: "Ele registra a evidência exigida pela auditoria externa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma pessoa saiu da empresa e a conta do diretório foi desativada. O que ainda pode continuar funcionando?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Chaves estáticas e contas locais fora da federação",
                            isCorrect: true,
                        },
                        {
                            text: "As sessões abertas nas aplicações que usam o diretório",
                            isCorrect: false,
                        },
                        {
                            text: "Os grupos aos quais a pessoa pertencia no diretório",
                            isCorrect: false,
                        },
                        {
                            text: "O acesso administrativo delegado a ela no ambiente",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - IAM na prática",
    aulas: [
        {
            titulo: "Política, papel e permissão: como ler uma política",
            blocks: [
                {
                    type: "text",
                    value: "# Toda política responde as mesmas quatro perguntas\n\nA sintaxe muda de provedor para provedor, mas a estrutura é sempre a mesma, e é isso que permite ler uma política de qualquer nuvem sem nunca ter usado aquela nuvem. Uma política diz quem, o quê, sobre o quê e sob quais circunstâncias, e carimba isso com um efeito: permitir ou negar. Quem é o principal, a identidade que recebe a permissão. O quê são as ações, os verbos daquele serviço. Sobre o quê é o recurso alcançado. As circunstâncias são as condições, que quase todo mundo deixa em branco.\n\nAo lado da política existe o papel, e a confusão entre os dois é a origem de metade das dúvidas de IAM. Permissão anexada a um usuário fica com ele o tempo todo. Papel é um conjunto de permissões que alguém assume temporariamente, recebendo credenciais de curta duração para agir naquele contexto. O papel tem duas políticas diferentes e é fundamental não misturá-las: a de confiança, que diz quem pode assumir aquele papel, e a de permissão, que diz o que o papel consegue fazer depois de assumido.\n\nQuando algo não funciona, o motivo quase sempre está numa dessas duas. Se a pessoa não consegue nem assumir o papel, o problema está na política de confiança. Se ela assume e recebe negado ao agir, o problema está na política de permissão ou em alguma negação vinda de cima, no nível da organização. Fazer essa distinção de cara economiza horas de tentativa e erro, e é a primeira coisa que um profissional experiente pergunta quando alguém chega com um acesso quebrado.",
                },
                {
                    type: "code",
                    value: '{\n  "efeito": "permitir",\n  "principal": "papel/servico-de-relatorios",\n  "acao": [\n    "armazenamento:LerObjeto",\n    "armazenamento:ListarPasta"\n  ],\n  "recurso": "armazenamento://relatorios-financeiros/fechamento/*",\n  "condicao": {\n    "origemDeRede": "10.20.0.0/16",\n    "autenticacaoComFatorForte": true,\n    "conexaoCifrada": true\n  }\n}',
                },
                {
                    type: "table",
                    value: '[["Campo da política","Pergunta que responde","Erro comum nesse campo"],["Efeito","Permite ou nega a ação","Contar com negação implícita esquecida"],["Principal","Quem recebe a permissão","Deixar aberto para qualquer conta"],["Ação","Que operação pode executar","Usar curinga no serviço inteiro"],["Recurso","Sobre o que a ação vale","Apontar para tudo em vez do caminho"],["Condição","Sob que circunstância vale","Não colocar condição nenhuma"]]',
                },
                {
                    type: "quote",
                    value: "Se a pessoa nem consegue assumir o papel, o problema é a política de confiança. Se assume e recebe negado, é a de permissão.",
                },
                {
                    type: "text",
                    value: "## Um roteiro para ler qualquer política em três minutos\n\nComece pelo recurso, porque é ele que define o tamanho do estrago. Se estiver apontando para tudo, nada do resto importa muito. Depois vá para a ação e procure curinga: um asterisco solto significa todas as operações daquele serviço, inclusive as que apagam e as que alteram permissão. Só então olhe o principal, perguntando se ele é mais largo do que uma identidade específica. E termine na condição, que na maioria das políticas que você vai encontrar simplesmente não existe.\n\nO teste mental que resume tudo é este: se esta política vazasse hoje para um estranho, o que exatamente ele conseguiria fazer com ela? A resposta costuma ser bem maior do que o autor imaginava, porque políticas são escritas pensando no caso de uso pretendido e lidas por atacantes pensando em todos os outros casos possíveis.\n\nUm último cuidado, que separa quem leu documentação de quem já operou. A decisão efetiva não vem de uma política isolada: ela é o resultado de tudo o que se aplica àquela identidade, somando política da identidade, política do recurso, permissões herdadas do grupo e limites impostos pela organização. Na prática de quase todo provedor, uma negação explícita vence qualquer permissão. Isso é ótimo, porque permite montar um piso de segurança no nível da organização que nenhuma política local consegue furar.",
                },
            ],
            questions: [
                {
                    statement:
                        "Quais elementos toda política de acesso descreve, independente do provedor?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quem, qual ação, sobre qual recurso e sob que condição",
                            isCorrect: true,
                        },
                        {
                            text: "Quem, em qual região, com qual custo e por quanto tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Qual usuário, qual senha, qual grupo e qual expiração",
                            isCorrect: false,
                        },
                        {
                            text: "Qual serviço, qual porta, qual protocolo e qual origem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a diferença entre a política de confiança e a de permissão de um papel?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma diz quem assume o papel, a outra o que ele faz",
                            isCorrect: true,
                        },
                        {
                            text: "Uma vale para pessoa, a outra vale só para serviço",
                            isCorrect: false,
                        },
                        {
                            text: "Uma é do provedor, a outra é escrita pelo cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Uma nega por padrão, a outra permite por padrão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma identidade consegue assumir o papel, mas recebe negado ao executar a ação. Onde investigar primeiro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Na política de permissão e nas negações da organização",
                            isCorrect: true,
                        },
                        {
                            text: "Na política de confiança do papel que foi assumido",
                            isCorrect: false,
                        },
                        {
                            text: "Na configuração de rede entre a origem e o serviço",
                            isCorrect: false,
                        },
                        {
                            text: "No prazo de validade da credencial temporária emitida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que começar a leitura de uma política pelo campo de recurso?",
                    difficulty: "medio",
                    options: [
                        { text: "É ele que define o tamanho do estrago possível", isCorrect: true },
                        {
                            text: "É o único campo obrigatório em qualquer provedor",
                            isCorrect: false,
                        },
                        {
                            text: "É o campo avaliado primeiro pelo motor de decisão",
                            isCorrect: false,
                        },
                        {
                            text: "É o campo que a auditoria costuma pedir por escrito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na prática da maioria dos provedores, o que acontece quando uma política permite e outra nega a mesma ação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A negação explícita prevalece sobre a permissão",
                            isCorrect: true,
                        },
                        {
                            text: "A política mais específica vence a mais genérica",
                            isCorrect: false,
                        },
                        {
                            text: "A política aplicada mais recentemente é a que vale",
                            isCorrect: false,
                        },
                        {
                            text: "A permissão vence, por ser uma concessão explícita",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Política ampla demais e o vício do curinga",
            blocks: [
                {
                    type: "text",
                    value: "# O curinga é confortável, e é onde tudo desanda\n\nO asterisco existe porque é prático. Quando uma integração não funciona e o prazo é hoje, permitir todas as ações sobre todos os recursos faz o problema sumir na hora. O time comemora, a tarefa fecha e a política fica. Do ponto de vista técnico, o que acabou de ser criado tem outro nome: acesso administrativo à conta inteira, entregue a um componente que precisava ler uma pasta.\n\nO caso concreto que se repete é o do processamento de dados. Um trabalho noturno precisa ler arquivos de um único repositório de objetos. Alguém concede permissão ampla naquele serviço de armazenamento, achando que limitou o escopo, porque restringiu a um serviço só. Só que aquele conjunto de ações inclui apagar repositório, alterar a política do repositório e, dependendo do provedor, tornar o conteúdo público. A permissão que parecia contida cobre exatamente o caminho do vazamento clássico.\n\nO que torna esse erro persistente é que ele não gera sintoma. Permissão excessiva nunca quebra nada, nunca aparece no monitoramento de disponibilidade e nunca incomoda ninguém no dia a dia. Ela só se manifesta uma vez, no dia em que a credencial daquele componente cai na mão errada, e aí se manifesta inteira. É por isso que revisar permissão é um trabalho que precisa ser agendado: ele nunca vai ser puxado pela urgência.",
                },
                {
                    type: "table",
                    value: '[["Padrão perigoso","Como ele aparece","Por que é pior do que parece"],["Ação com curinga","Todas as operações de um serviço","Inclui apagar e alterar permissão"],["Recurso com curinga","Vale para qualquer objeto da conta","Um acesso vira acesso a tudo"],["Principal aberto","Política do recurso sem restrição","É exposição pública com outro nome"],["Conceder permissão","Poder criar e anexar política","Quem concede pode se dar tudo"],["Confiança sem condição","Papel assumido por conta externa","Terceiro assume sem prova adicional"]]',
                },
                {
                    type: "quote",
                    value: "Permissão excessiva nunca quebra nada. Ela não aparece no monitoramento, não incomoda ninguém e só se manifesta uma vez, inteira.",
                },
                {
                    type: "text",
                    value: "## O padrão mais subestimado: poder conceder permissão\n\nEntre todas as permissões perigosas, a que menos parece perigosa é a de administrar acesso: criar política, anexar política a uma identidade, criar papel, entregar um papel a um serviço. Ela costuma ser dada a times de plataforma e a ferramentas de automação sem grande discussão, porque soa operacional. Só que quem pode conceder permissão pode conceder permissão a si mesmo. Na prática, isso é privilégio administrativo total com um passo intermediário.\n\nO mesmo raciocínio vale para a capacidade de entregar um papel a um recurso. Se uma identidade pode criar uma função e associar a ela um papel poderoso, essa identidade alcança o poder daquele papel, mesmo sem tê-lo diretamente. É um caminho de escalonamento clássico em nuvem, e ele aparece em qualquer avaliação séria de permissão. Ao revisar uma política, a pergunta não é apenas o que ela faz, e sim o que ela permite construir.\n\nO outro item da lista que engana é o principal aberto numa política de recurso. Uma fila, um tópico de mensagens ou um repositório de objetos com política que aceita qualquer principal está publicamente acessível, ainda que nenhuma caixa de seleção com a palavra público tenha sido marcada. Ferramentas de postura pegam isso, e é um dos primeiros achados a tratar.",
                },
                {
                    type: "text",
                    value: "## Como sair do curinga sem parar o time\n\nA tentativa de escrever a política mínima no primeiro dia falha quase sempre, porque ninguém conhece o conjunto exato de chamadas que a aplicação faz. O caminho que funciona é observar antes de restringir: rode em ambiente não produtivo com permissão ampla e registro completo, colete quais ações foram efetivamente chamadas durante um ciclo representativo, incluindo o fechamento do mês e o processamento em lote, e gere a política a partir do observado.\n\nDepois de aplicar a versão reduzida em produção, o controle que faz a diferença é alarmar sobre negação. Cada negação registrada vira um dado: ou é uma chamada legítima que faltou mapear, e você acrescenta com contexto, ou é algo que não deveria estar acontecendo, e você acabou de encontrar um problema. Sem esse alarme, restringir vira aposta e o time volta ao curinga no primeiro susto.\n\nPor fim, use negação explícita no nível da organização como piso. Existem coisas que ninguém, em nenhuma conta, deveria poder fazer: desligar o registro de auditoria, apagar o repositório de registros, tornar um recurso público, criar credencial estática de longa vida, sair da região autorizada. Fixar isso lá em cima permite que as políticas locais sejam um pouco mais frouxas sem que o ambiente perca o chão. Essa combinação, piso rígido e liberdade controlada acima dele, é o que mantém segurança e velocidade no mesmo ambiente.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que permitir todas as ações de um único serviço não é um escopo estreito?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Esse conjunto inclui apagar e alterar permissões",
                            isCorrect: true,
                        },
                        {
                            text: "Esse conjunto vale também para os demais serviços",
                            isCorrect: false,
                        },
                        {
                            text: "Esse conjunto ignora as condições escritas na política",
                            isCorrect: false,
                        },
                        {
                            text: "Esse conjunto só pode ser aplicado a usuários humanos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a permissão de administrar acesso é tão perigosa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quem concede permissão pode conceder tudo a si mesmo",
                            isCorrect: true,
                        },
                        {
                            text: "Ela desliga o registro de auditoria das ações tomadas",
                            isCorrect: false,
                        },
                        {
                            text: "Ela funciona mesmo depois da conta ser desativada",
                            isCorrect: false,
                        },
                        {
                            text: "Ela permite ler o segredo guardado no cofre da equipe",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza um principal aberto na política de um recurso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O recurso aceita qualquer principal, o que é exposição",
                            isCorrect: true,
                        },
                        {
                            text: "O recurso aceita apenas identidades da mesma conta",
                            isCorrect: false,
                        },
                        {
                            text: "O recurso exige autenticação com fator forte sempre",
                            isCorrect: false,
                        },
                        {
                            text: "O recurso limita o acesso a uma faixa de rede interna",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o caminho mais confiável para reduzir uma política ampla?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Observar as ações realmente usadas e gerar a partir disso",
                            isCorrect: true,
                        },
                        {
                            text: "Escrever a política mínima antes de subir a aplicação",
                            isCorrect: false,
                        },
                        {
                            text: "Copiar a política de outro serviço parecido já em uso",
                            isCorrect: false,
                        },
                        {
                            text: "Remover metade das ações e esperar alguém reclamar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma identidade só pode criar funções e associar papéis a elas. Por que isso já é um risco de escalonamento?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ela pode associar um papel poderoso e usar esse poder",
                            isCorrect: true,
                        },
                        {
                            text: "Ela pode ler o registro de auditoria de outras contas",
                            isCorrect: false,
                        },
                        {
                            text: "Ela pode alterar a política de confiança da organização",
                            isCorrect: false,
                        },
                        {
                            text: "Ela pode emitir credencial estática para outro usuário",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Acesso temporário e elevação sob demanda",
            blocks: [
                {
                    type: "text",
                    value: "# Privilégio permanente é uma escolha, não uma fatalidade\n\nFaça a conta com um time real. Uma empresa tem doze pessoas com acesso administrativo à nuvem. Cada uma usa esse acesso, na média, umas quatro horas por mês, para alguma manutenção ou investigação. O restante do tempo o privilégio continua lá, ativo, associado a uma conta que lê e-mail, entra em videoconferência e navega na internet. A empresa mantém acesso administrativo disponível vinte e quatro horas por dia para sustentar quatro horas de uso mensal por pessoa.\n\nAcesso temporário inverte isso. A identidade não tem privilégio nenhum no estado normal. Quando precisa, a pessoa solicita elevação para um papel específico, com justificativa, por uma janela curta, e a concessão expira sozinha. O termo que circula é elevação sob demanda, e o efeito no risco é grande: uma credencial administrativa roubada fora da janela é uma credencial sem poder algum.\n\nVale entender por que isso é diferente de simplesmente ter menos administradores. Reduzir o número de pessoas privilegiadas ajuda, mas concentra risco em poucas contas muito valiosas e cria gargalo operacional. Reduzir o tempo em que o privilégio existe ataca outra dimensão do problema: mesmo que as doze pessoas continuem podendo elevar, a janela de exposição real cai para uma fração pequena do mês, e cada elevação vira um evento visível que a detecção consegue usar.",
                },
                {
                    type: "table",
                    value: '[["Modelo de acesso","Exposição que ele cria","Quando ele é a escolha certa"],["Privilégio permanente","Disponível o tempo todo","Só quando não há alternativa viável"],["Elevação sob demanda","Restrita à janela pedida","Padrão para qualquer administração"],["Aprovação por segunda pessoa","Janela mais revisão humana","Ação destrutiva ou em dado sensível"],["Conta de emergência","Guardada e fortemente vigiada","Falha do provedor de identidade"],["Credencial de carga","Curta e renovada sozinha","Integração entre sistemas e serviços"]]',
                },
                {
                    type: "quote",
                    value: "Uma credencial administrativa roubada fora da janela de elevação é uma credencial sem poder nenhum. Esse é o ganho inteiro.",
                },
                {
                    type: "text",
                    value: "## A conta de emergência, que precisa existir e ser chata\n\nSe todo acesso administrativo depende do provedor de identidade, o que acontece quando ele cai ou é comprometido? A resposta responsável é ter uma ou duas contas de emergência, fora da federação, com privilégio alto, credencial longa guardada fisicamente e, quando possível, dividida entre duas pessoas para que ninguém a use sozinho. Elas ficam paradas o ano inteiro e existem para o dia em que nada mais funciona.\n\nEssas contas precisam de dois cuidados que costumam ser esquecidos. O primeiro é o alarme: qualquer autenticação com elas deve gerar aviso imediato para várias pessoas, por um canal que não dependa do sistema que pode estar comprometido. Uso legítimo é raro o suficiente para que um alarme por uso não gere ruído. O segundo é o teste: acesso de emergência que nunca foi exercitado costuma falhar exatamente no dia em que é necessário, porque a senha expirou, o segundo fator estava atrelado ao celular de quem saiu da empresa ou o cofre físico está numa sala que ninguém tem chave.\n\nUm detalhe de desenho que vale a pena: essas contas não devem depender de um segundo fator emitido pelo mesmo provedor que elas existem para contornar. Se o diretório de identidade caiu, o fator que ele emite caiu junto. Chave física de hardware guardada separadamente resolve isso melhor do que qualquer aplicativo.",
                },
                {
                    type: "text",
                    value: "## Onde a elevação sob demanda falha na prática\n\nA falha mais comum é a lentidão da aprovação. Se pedir elevação leva três horas porque depende de alguém ver uma mensagem, as pessoas passam a pedir janelas de oito horas para não precisar pedir de novo, e você reinventou o privilégio permanente com um formulário no meio. A regra é simples: janela curta exige aprovação rápida. Se a aprovação humana não pode ser rápida, aprove automaticamente com registro e alarme, que ainda é muito melhor do que privilégio o tempo todo.\n\nA segunda falha é a justificativa decorativa. Um campo de texto livre que ninguém lê produz elevações justificadas com a palavra manutenção durante anos. Exigir referência a um chamado ou a um incidente, e auditar por amostragem uma vez por mês, transforma o campo em algo que sustenta uma conversa depois. Não precisa auditar tudo, precisa ser crível que alguém vai olhar.\n\nA terceira é desperdiçar o sinal. Elevação é um dos eventos de maior valor que existem para detecção, porque é raro, é nominal e marca exatamente o momento em que uma conta passa a poder fazer estrago. Esse evento deveria estar na plataforma de monitoramento, correlacionado com o que a pessoa fez durante a janela. Muita empresa implanta elevação sob demanda pelo controle preventivo e joga fora todo o valor investigativo que ela produz de graça.",
                },
            ],
            questions: [
                {
                    statement: "O que é elevação sob demanda no controle de acesso privilegiado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Privilégio concedido por uma janela curta quando pedido",
                            isCorrect: true,
                        },
                        {
                            text: "Privilégio dado apenas a um grupo restrito de pessoas",
                            isCorrect: false,
                        },
                        {
                            text: "Privilégio revisado pelo gestor a cada três meses",
                            isCorrect: false,
                        },
                        {
                            text: "Privilégio validado por segundo fator a cada ação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o principal ganho de risco do acesso privilegiado temporário?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Credencial roubada fora da janela não tem poder",
                            isCorrect: true,
                        },
                        {
                            text: "A senha administrativa deixa de precisar de rotação",
                            isCorrect: false,
                        },
                        {
                            text: "O número de pessoas com acesso cai automaticamente",
                            isCorrect: false,
                        },
                        {
                            text: "O registro de auditoria passa a ser dispensável",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a conta de emergência não deve depender do provedor de identidade?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela existe para o caso em que esse provedor falhou",
                            isCorrect: true,
                        },
                        {
                            text: "Ela precisa funcionar sem qualquer segundo fator ativo",
                            isCorrect: false,
                        },
                        {
                            text: "Ela é usada com frequência pela equipe de operação",
                            isCorrect: false,
                        },
                        {
                            text: "Ela não pode aparecer no registro de autenticação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A aprovação de elevação leva três horas na empresa. Qual é a consequência mais provável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As pessoas pedem janelas longas e o ganho se perde",
                            isCorrect: true,
                        },
                        {
                            text: "As pessoas deixam de precisar de acesso privilegiado",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor bloqueia o papel por excesso de solicitações",
                            isCorrect: false,
                        },
                        {
                            text: "A auditoria passa a exigir aprovação de duas pessoas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Além de reduzir exposição, que valor a elevação sob demanda entrega de graça para a defesa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Um evento raro e nominal, ótimo para a detecção usar",
                            isCorrect: true,
                        },
                        {
                            text: "Um inventário atualizado dos recursos daquela conta",
                            isCorrect: false,
                        },
                        {
                            text: "Uma cópia de segurança da configuração antes da ação",
                            isCorrect: false,
                        },
                        {
                            text: "Uma redução direta no custo mensal pago ao provedor",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Federação e o acesso do fornecedor",
            blocks: [
                {
                    type: "text",
                    value: "# Federar com quem é de fora tem outra régua\n\nFederar dentro da empresa é confortável: existe um diretório, um processo de admissão, um processo de desligamento e um jeito de saber quem é cada pessoa. Federar com um terceiro muda todos os termos. O diretório é dele, o processo de contratação é dele, o desligamento é dele, e você não vê nada disso acontecer. Você delegou a decisão de quem é confiável a uma organização cuja segurança interna você conhece por um questionário respondido uma vez, no início do contrato.\n\nO cenário que se repete é banal. Uma consultoria tem acesso ao seu ambiente de produção para sustentar um sistema. Um consultor sai da consultoria numa sexta-feira. A consultoria desliga a conta dele no diretório dela, ou não desliga, e ninguém avisa você em nenhum dos casos. Se a federação estava bem feita, o acesso morre junto. Se cada consultor tinha uma conta local no seu ambiente, o acesso continua vivo, e você só vai descobrir na próxima revisão, se ela existir.\n\nO caso mais grave é o outro: a consultoria é invadida. O invasor não precisa atacar você, porque herda um acesso legítimo ao seu ambiente, com credencial válida, vindo de uma origem esperada, para fazer coisas que aquele fornecedor faz todo dia. Vários incidentes de repercussão nos últimos anos tiveram exatamente esse formato. Do seu lado, tudo parecia normal, e é justamente por isso que acesso de terceiro merece escopo mais estreito e vigilância maior do que acesso interno, e não o contrário.",
                },
                {
                    type: "table",
                    value: '[["Risco do acesso de terceiro","Como ele se manifesta","Controle que responde bem"],["Desligamento invisível","O consultor sai e o acesso permanece","Prazo curto com reconfirmação periódica"],["Fornecedor comprometido","O invasor herda o acesso legítimo","Escopo estreito e conta segregada"],["Acesso amplo por conveniência","Papel administrativo entregue inteiro","Permissão por tarefa e janela definida"],["Confiança sem condição","Qualquer um do outro lado assume","Identificador externo acordado"],["Uso sem visibilidade","Ninguém revisa o que foi feito lá","Registro segregado e revisão mensal"]]',
                },
                {
                    type: "quote",
                    value: "Você não contratou só o serviço do fornecedor. Contratou também a segurança interna dele, e ela costuma ser avaliada uma vez, no começo.",
                },
                {
                    type: "text",
                    value: "## O problema do adjunto confuso\n\nExiste uma armadilha específica em confiança entre organizações que vale conhecer pelo nome. Suponha que você crie um papel no seu ambiente e permita que a conta da empresa fornecedora o assuma. Parece razoável, e é insuficiente. Aquele fornecedor atende dezenas de clientes com a mesma infraestrutura, e se um outro cliente dele conseguir induzir o sistema do fornecedor a assumir o seu papel, ele age dentro do seu ambiente usando a confiança que você depositou no intermediário.\n\nEsse é o padrão que a literatura chama de adjunto confuso: um componente com privilégio é induzido a usar esse privilégio em nome de quem não deveria. A correção padrão é exigir um identificador externo, um valor combinado entre você e o fornecedor, específico do seu contrato, que precisa aparecer na condição da política de confiança. O fornecedor só consegue assumir o seu papel se souber aquele valor, e ele não é adivinhável a partir do nome da sua conta.\n\nO mesmo raciocínio se aplica a integrações de software por assinatura que pedem acesso ao seu ambiente. Quando o fornecedor entrega um modelo pronto de permissão, leia com atenção a política de confiança antes da de permissão. É comum encontrar confiança larga demais em modelos escritos para funcionar em qualquer cliente sem suporte, e ajustar isso é uma conversa perfeitamente razoável de ter com o fornecedor.",
                },
                {
                    type: "text",
                    value: "## Como estruturar acesso de fornecedor sem sofrimento\n\nComece pela separação. Fornecedor trabalha em conta, assinatura ou projeto próprio sempre que possível, com o mínimo de pontes para o resto do ambiente. Isso simplifica tudo o que vem depois: revisão, registro, corte de acesso e resposta a incidente. Se o fornecedor precisa alcançar produção, que alcance por um caminho específico e observável, e não por pertencer ao mesmo espaço que os times internos.\n\nDepois vem a nominalidade. Nada de credencial compartilhada pelo time do fornecedor, porque ela impede qualquer atribuição de ação a pessoa e torna a saída de qualquer um deles um evento de rotação. O caminho melhor é identidade convidada no seu diretório, sujeita à sua política de acesso condicional, ou federação com o diretório do fornecedor, com prazo de validade curto e reconfirmação a cada trimestre.\n\nPor fim, escreva no contrato o que a técnica não resolve: obrigação de avisar quando alguém que tinha acesso deixa a empresa, obrigação de notificar incidente dentro de um prazo definido, direito de auditar o uso e o compromisso de que o acesso será usado apenas por pessoas identificadas. E deixe o registro daquele acesso separado e fácil de extrair, porque no dia em que algo acontecer, essa extração é a primeira coisa que vai ser pedida, por você e provavelmente também pelo jurídico do outro lado.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que o acesso de fornecedor exige mais cuidado que o acesso interno?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O desligamento acontece fora da sua vista e sem aviso",
                            isCorrect: true,
                        },
                        {
                            text: "O fornecedor não pode ser federado com o seu diretório",
                            isCorrect: false,
                        },
                        {
                            text: "O contrato impede a revisão periódica desse acesso",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor cobra a mais por identidade externa ativa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que acontece quando um fornecedor com acesso ao seu ambiente é invadido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O invasor herda um acesso legítimo e esperado ao seu lado",
                            isCorrect: true,
                        },
                        {
                            text: "O acesso é bloqueado automaticamente pela federação ativa",
                            isCorrect: false,
                        },
                        {
                            text: "O incidente fica restrito ao ambiente do próprio fornecedor",
                            isCorrect: false,
                        },
                        {
                            text: "A credencial do fornecedor deixa de ser aceita na sua conta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual problema o identificador externo em uma política de confiança resolve?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Impede que outro cliente do fornecedor assuma seu papel",
                            isCorrect: true,
                        },
                        {
                            text: "Impede que a credencial temporária dure mais que uma hora",
                            isCorrect: false,
                        },
                        {
                            text: "Impede que o fornecedor acesse fora do horário comercial",
                            isCorrect: false,
                        },
                        {
                            text: "Impede que o registro de auditoria misture as duas contas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que credencial compartilhada pela equipe do fornecedor é inaceitável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nenhuma ação pode ser atribuída a uma pessoa específica",
                            isCorrect: true,
                        },
                        {
                            text: "Ela não pode ser usada em conexão cifrada com o serviço",
                            isCorrect: false,
                        },
                        {
                            text: "Ela expira sempre que alguém do time troca de projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Ela impede que a federação com o diretório funcione",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um fornecedor entrega um modelo pronto de permissão para integrar o produto dele. O que revisar primeiro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A política de confiança, que define quem consegue entrar",
                            isCorrect: true,
                        },
                        {
                            text: "A política de permissão, que define as ações liberadas",
                            isCorrect: false,
                        },
                        {
                            text: "A região onde o recurso do fornecedor será implantado",
                            isCorrect: false,
                        },
                        {
                            text: "O custo mensal que a integração acrescenta à fatura",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Revisão de acesso e a evidência que ela produz",
            blocks: [
                {
                    type: "text",
                    value: "# É chato, e é a única coisa que efetivamente remove acesso\n\nTodo o resto deste módulo concede. A revisão periódica é o único mecanismo desenhado para tirar. Sem ela, o ambiente só acumula, porque cada concessão foi feita por um motivo legítimo e nenhuma tem prazo natural de morte. É por isso que praticamente todo referencial de controle, e boa parte dos contratos com clientes corporativos, exige revisão de acesso com periodicidade definida.\n\nO problema é que ela é malfeita na maioria dos lugares, e o formato do fracasso é sempre o mesmo. Uma planilha com oitocentas linhas chega por e-mail para um gestor, com um prazo de três dias e um texto pedindo que ele confirme os acessos da equipe dele. O gestor abre, vê linhas dizendo coisas como escrita no ambiente produtivo do sistema de faturamento, não faz ideia do que significa negar aquilo, aprova tudo em quatro minutos e devolve. A empresa gera evidência de revisão e não remove nada.\n\nA causa raiz não é preguiça do gestor, é desenho ruim do pedido. Ninguém consegue decidir sobre uma permissão técnica descrita em vocabulário de sistema, sem contexto de uso, em lote gigante e com prazo curto. Quem monta a revisão precisa assumir a responsabilidade de tornar a decisão possível, e isso é trabalho de quem pede, não de quem responde.",
                },
                {
                    type: "table",
                    value: '[["Como a revisão é feita","Resultado que produz","Sinal de que virou teatro"],["Planilha anual com tudo","Aprovação em massa sem leitura","Resposta chega em poucos minutos"],["Lote pequeno por sistema","Decisão que dá para pensar","Alguma remoção acontece de fato"],["Com dado de último uso","Remoção fácil de justificar","Gestor explica o que decidiu e por quê"],["Padrão remover quando ocioso","Acesso parado morre sozinho","Reclamação surge só onde importa"],["Foco no acesso privilegiado","Esforço onde o risco está","O escopo cabe no tempo disponível"]]',
                },
                {
                    type: "quote",
                    value: "Gestor que aprova oitocentas linhas em quatro minutos não foi negligente. Ele recebeu um pedido impossível de responder com honestidade.",
                },
                {
                    type: "text",
                    value: "## O que transforma revisão em algo útil\n\nTrês mudanças resolvem quase tudo. A primeira é traduzir: em vez da permissão técnica, mostre o que ela permite fazer em linguagem de negócio, como consultar dados de folha ou alterar configuração do sistema fiscal. A segunda é anexar o uso: mostrar que a pessoa não exerce aquele acesso há sete meses converte a decisão de opinião em fato, e a taxa de remoção sobe sem discussão. A terceira é inverter o padrão: acesso ocioso é removido salvo manifestação contrária, em vez de mantido salvo manifestação contrária.\n\nA quarta mudança é de escopo, e é a mais impopular entre auditores e a mais eficaz na prática. Revisar tudo todo trimestre consome capital político e entrega pouco. Revisar com afinco o acesso privilegiado, o acesso a dado pessoal e o acesso de terceiros, e deixar a leitura de painéis para um ciclo anual leve, concentra o esforço onde o risco mora. Uma revisão que acontece de verdade num escopo menor vale mais que uma revisão completa que ninguém leva a sério.\n\nUm último ajuste: quem revisa deveria ser quem sabe. Para acesso de negócio, o gestor da pessoa. Para acesso técnico privilegiado, o dono do sistema. Mandar tudo para o gestor de pessoas por padrão é o que produz o carimbo automático, porque em metade das linhas ele não tem como ter opinião fundamentada.",
                },
                {
                    type: "text",
                    value: "## A evidência, que é o que sobra depois\n\nUm auditor não pergunta se vocês revisam acesso. Ele pergunta quatro coisas: de onde saiu a lista, quem decidiu, o que foi decidido e a prova de que a remoção aconteceu. A falha mais comum não está nas três primeiras, está na quarta. Existe a planilha assinada dizendo que dezessete acessos deveriam ser removidos, e não existe nada mostrando que eles saíram. Decisão sem execução é pior do que revisão nenhuma, porque documenta que a empresa sabia.\n\nA cadeia que fecha bem é curta: extração com data e origem declarada, decisão nominal registrada, chamado de execução com identificador e uma nova extração depois do prazo mostrando que aquelas permissões não existem mais. Essa segunda extração é o que transforma revisamos em conseguimos provar, e ela custa alguns minutos de automação.\n\nFica ainda um uso pouco explorado da revisão: ela é um termômetro do processo de ciclo de vida. Se todo trimestre a revisão encontra muita coisa para remover, o problema não é a revisão ser insuficiente, é o processo de entrada, mudança e saída estar furado lá atrás. A taxa de achados por ciclo é uma métrica honesta da saúde desse processo, e ela deveria cair com o tempo. Se não cai, revisar com mais frequência apenas enxuga gelo com mais empenho.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a função da revisão periódica de acesso?",
                    difficulty: "facil",
                    options: [
                        { text: "Remover o acesso que deixou de ser necessário", isCorrect: true },
                        { text: "Conceder acesso novo com aprovação do gestor", isCorrect: false },
                        {
                            text: "Registrar as ações executadas por cada usuário",
                            isCorrect: false,
                        },
                        { text: "Definir quais papéis existem em cada sistema", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que a revisão em planilha anual gigante costuma não remover nada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O gestor não tem como decidir linha a linha sem contexto",
                            isCorrect: true,
                        },
                        {
                            text: "A ferramenta não permite marcar remoção sem justificar",
                            isCorrect: false,
                        },
                        {
                            text: "A auditoria proíbe remoção fora da janela de manutenção",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor exige aprovação dupla para revogar permissão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que informação mais aumenta a taxa de remoção numa revisão de acesso?",
                    difficulty: "medio",
                    options: [
                        { text: "A data do último uso efetivo daquela permissão", isCorrect: true },
                        { text: "O custo mensal do serviço associado ao acesso", isCorrect: false },
                        { text: "O nome de quem aprovou a concessão original", isCorrect: false },
                        { text: "A quantidade de pessoas que têm o mesmo papel", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a lacuna mais comum na evidência de uma revisão de acesso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Falta a prova de que a remoção decidida aconteceu",
                            isCorrect: true,
                        },
                        {
                            text: "Falta a assinatura digital do gestor responsável",
                            isCorrect: false,
                        },
                        {
                            text: "Falta a lista dos sistemas incluídos no escopo",
                            isCorrect: false,
                        },
                        {
                            text: "Falta o registro da data em que a lista foi gerada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A revisão trimestral encontra muitos acessos indevidos, ciclo após ciclo. O que isso indica?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O processo de entrada, mudança e saída está furado",
                            isCorrect: true,
                        },
                        {
                            text: "A revisão precisa ser feita com frequência mensal",
                            isCorrect: false,
                        },
                        {
                            text: "Os gestores estão aprovando sem ler a lista enviada",
                            isCorrect: false,
                        },
                        {
                            text: "O escopo da revisão ficou amplo demais para o time",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Configuração e hardening",
    aulas: [
        {
            titulo: "Armazenamento exposto, o clássico dos vazamentos",
            blocks: [
                {
                    type: "text",
                    value: "# O vazamento mais comum da década não teve invasão nenhuma\n\nDesde meados da década passada existe um fluxo contínuo de notícias com o mesmo enredo: alguém encontrou um repositório de objetos aberto contendo cadastro de eleitores, prontuários, currículos, cópias de segurança inteiras de sistemas de produção. Não houve exploração de falha, não houve credencial roubada, não houve malware. Havia um endereço público e um conteúdo que deveria ser privado, e alguém que roda varredura o encontrou antes do dono perceber.\n\nOs provedores reagiram e hoje criam repositórios privados por padrão, com bloqueios adicionais disponíveis. Mesmo assim o problema continua acontecendo, porque público não é uma caixa única de seleção: é um resultado que várias configurações diferentes conseguem produzir. Uma política de recurso aceitando qualquer principal produz o mesmo efeito. Uma lista de controle de acesso legada com leitura para todos produz o mesmo efeito. Uma rede de distribuição de conteúdo servindo a origem sem exigir autenticação produz o mesmo efeito, e nesse caso o repositório continua marcado como privado no painel.\n\nExiste ainda o caminho indireto, que é o mais difícil de enxergar. Um link assinado gerado com validade de um ano e enviado por e-mail circula para fora sem nenhum controle. Um fornecedor recebeu acesso amplo para uma migração e continua com ele. Uma conta de análise de dados copia tudo para outro repositório, num ambiente com regras mais frouxas. O dado não vazou de onde estava bem protegido: ele foi copiado para onde não estava.",
                },
                {
                    type: "table",
                    value: '[["Caminho da exposição","Como ela acontece","O que fecha de verdade"],["Política do recurso","Principal aberto para qualquer conta","Bloqueio público no nível da organização"],["Lista de controle legada","Permissão de leitura para todos","Desativar as listas e usar só política"],["Link assinado longo","Endereço válido por meses circula","Prazo curto e escopo por objeto"],["Distribuição de conteúdo","A borda serve sem exigir autenticação","Origem privada e autenticação na borda"],["Cópia para outro lugar","Análise duplica em ambiente frouxo","Classificação e regra igual no destino"]]',
                },
                {
                    type: "quote",
                    value: "O dado quase nunca vaza de onde estava bem protegido. Ele vaza da cópia que alguém fez para um lugar com regra mais frouxa.",
                },
                {
                    type: "text",
                    value: "## Como se previne de verdade\n\nA primeira camada é impedir, e ela mora acima da conta. Uma política no nível da organização que nega tornar recurso público faz com que nem o administrador da conta consiga cometer o erro, e é a única defesa que sobrevive à pressa. A segunda camada é separar por classe de dado: repositórios de conteúdo estático de site e repositórios de dado de cliente nunca deveriam viver na mesma conta nem compartilhar padrão de configuração, justamente porque o primeiro precisa ser público e o segundo jamais.\n\nA terceira camada é a chave. Cifrar o conteúdo sensível com uma chave gerenciada pelo cliente cria uma segunda porta independente: mesmo quem consegue chamar a leitura do objeto precisa também ter permissão de uso da chave. Isso só funciona, e vale dizer isso com todas as letras, se a política da chave for controlada por gente diferente da que controla a política do repositório. Se o mesmo papel administra as duas, você comprou complexidade sem comprar controle.\n\nA quarta camada é detecção com alarme sobre mudança de política de repositório, e ela é a última da lista de propósito. Detectar é indispensável, mas quando a detecção é o único controle, você está apostando que ninguém varreu a internet naquela janela, e essa aposta se perde em minutos. A ordem correta é impedir, depois detectar, e nunca inverter.",
                },
                {
                    type: "text",
                    value: "## E quando já vazou\n\nA sequência é fechar, preservar e medir. Fechar o acesso primeiro, anotando o horário exato da mudança, porque esse carimbo vai ser a fronteira de toda a análise. Preservar em seguida: registro de acesso do repositório, eventos do plano de controle, registro da rede de distribuição de conteúdo. São essas três fontes que dizem se alguém realmente leu o conteúdo ou se ele apenas esteve aberto, e essa diferença muda tudo no que vem depois.\n\nMedir é a parte que as empresas descobrem tarde. Para comunicar clientes, para responder à autoridade e para dimensionar o problema, é preciso saber quais objetos estavam lá, com que dado, de quantos titulares. Quem não mantém inventário e classificação do conteúdo passa dias tentando reconstruir isso sob pressão, e frequentemente acaba comunicando um número errado, o que costuma ser pior do que comunicar tarde.\n\nA parte legal entra logo depois. A LGPD exige comunicação à autoridade nacional e aos titulares quando o incidente pode acarretar risco ou dano relevante, em prazo razoável. Traduzindo para a rotina técnica: a qualidade do seu registro de acesso e da sua classificação de dado determina se essa comunicação vai ser precisa ou uma estimativa constrangedora. O trabalho que sustenta a resposta legal é feito meses antes do incidente.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que marcar um repositório de objetos como privado no painel pode não bastar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Outras configurações também conseguem torná-lo público",
                            isCorrect: true,
                        },
                        {
                            text: "A marcação privada só vale dentro da região de origem",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor reverte a marcação a cada nova implantação",
                            isCorrect: false,
                        },
                        {
                            text: "A marcação privada não se aplica a objetos já gravados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o risco de um link assinado com validade longa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele circula fora sem qualquer controle de quem usa",
                            isCorrect: true,
                        },
                        {
                            text: "Ele deixa de funcionar quando a chave é rotacionada",
                            isCorrect: false,
                        },
                        {
                            text: "Ele expõe a credencial de quem gerou o endereço",
                            isCorrect: false,
                        },
                        {
                            text: "Ele desativa o registro de acesso daquele objeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Cifrar o conteúdo com chave gerenciada pelo cliente só agrega controle sob qual condição?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A política da chave ser controlada por outro grupo",
                            isCorrect: true,
                        },
                        {
                            text: "A chave ser rotacionada a cada trinta dias corridos",
                            isCorrect: false,
                        },
                        {
                            text: "O algoritmo escolhido ser mais forte que o padrão",
                            isCorrect: false,
                        },
                        {
                            text: "A chave ficar armazenada numa região diferente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a detecção não deve ser o único controle contra exposição de armazenamento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O conteúdo copiado durante a janela já foi perdido",
                            isCorrect: true,
                        },
                        {
                            text: "A detecção só funciona em repositórios com cifra ativa",
                            isCorrect: false,
                        },
                        {
                            text: "O alarme depende de o provedor liberar o registro certo",
                            isCorrect: false,
                        },
                        {
                            text: "A varredura da internet ocorre apenas uma vez por mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um repositório com dado pessoal ficou público por três dias. Que fonte diz se alguém realmente leu o conteúdo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O registro de acesso ao repositório e o da borda",
                            isCorrect: true,
                        },
                        {
                            text: "A política de recurso aplicada durante o período",
                            isCorrect: false,
                        },
                        {
                            text: "O inventário de objetos classificados como sensíveis",
                            isCorrect: false,
                        },
                        {
                            text: "O registro de uso da chave de cifra em repouso",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Rede em nuvem e a importância da saída",
            blocks: [
                {
                    type: "text",
                    value: "# O firewall deixou de ser uma caixa e virou uma propriedade\n\nEm rede tradicional existe um equipamento no caminho e as regras vivem nele. Em nuvem, o controle mais usado é um conjunto de regras com estado colado na interface de cada recurso, o grupo de segurança, e existe também uma lista sem estado na borda da sub-rede. A mudança de modelo é grande: em vez de um ponto central com quinhentas regras, você tem quinhentos pontos com três regras cada.\n\nIsso tem um lado excelente. Microssegmentação, que em datacenter próprio custava caro e dava trabalho, passa a ser barata: cada carga de trabalho pode ter exatamente as portas de que precisa, e nada mais. Tem também um lado ruim, que aparece depois de dois anos de operação: ninguém tem visão global, e um grupo permissivo criado como temporário acaba anexado a quarenta recursos porque virou o grupo que funciona.\n\nO erro mais visível continua sendo a porta de administração aberta para o mundo. Ele parece antigo demais para ainda acontecer e continua sendo um dos primeiros achados de qualquer avaliação. Vale lembrar que administração remota nunca precisa estar exposta na internet: existe acesso por sessão gerenciada pelo próprio provedor, existe bastião, existe rede privada. Deixar essa porta aberta é escolher lutar contra a internet inteira, todos os dias, com uma senha.",
                },
                {
                    type: "text",
                    value: "## Por que a saída importa mais do que a entrada\n\nQuase todo mundo filtra o que entra e libera integralmente o que sai. Só que a entrada é um único passo do ataque, e a saída é usada em todos os outros. Depois do acesso inicial, o invasor precisa baixar a próxima ferramenta, abrir um canal de comando com a infraestrutura dele e, no fim, mandar o dado para fora. Todos esses momentos dependem de a carga de trabalho conseguir alcançar um endereço arbitrário na internet.\n\nO exemplo deixa isso concreto. Imagine um servidor de aplicação comprometido que só consegue falar com o banco de dados, com um repositório interno de pacotes e com os pontos de acesso privados dos serviços gerenciados que ele usa. O invasor está dentro e não tem como buscar o segundo estágio, não tem como receber comando e não tem por onde escoar o dado. Ele não foi impedido de entrar, foi impedido de trabalhar.\n\nOs meios práticos são três e se combinam. Nenhuma rota automática para a internet nas sub-redes de carga de trabalho. Saída obrigatória por um ponto controlado com lista de domínios permitidos. E ponto de acesso privado para os serviços do provedor, o que tira aquele tráfego da internet por completo. O custo honesto é que lista de domínio quebra construção de software e exige manutenção contínua. Por isso comece por produção, onde a taxa de mudança é baixa, e deixe os ambientes de desenvolvimento para uma segunda fase.",
                },
                {
                    type: "table",
                    value: '[["Controle","Onde ele atua","O que ele realmente contém"],["Grupo de segurança","Na interface do próprio recurso","Quem conversa com aquele recurso"],["Lista da sub-rede","Na borda da sub-rede, sem estado","Tráfego amplo por faixa e porta"],["Ponto de acesso privado","Entre a carga e o serviço gerenciado","Tira aquele tráfego da internet"],["Saída controlada","No caminho de saída para fora","Segundo estágio, comando e exfiltração"],["Espelhamento de tráfego","Cópia enviada para análise","Nada, mas entrega visibilidade"]]',
                },
                {
                    type: "quote",
                    value: "Filtrar a entrada atrapalha o primeiro passo do ataque. Filtrar a saída atrapalha todos os passos seguintes.",
                },
                {
                    type: "text",
                    value: "## O detalhe que desmonta a ilusão de rede perfeita\n\nSuponha uma segmentação impecável: cada carga isolada, saída controlada, nenhuma porta administrativa exposta. Agora imagine que uma credencial válida de um desenvolvedor vazou. Com ela, o atacante chama a interface de programação do provedor, direto da internet, e cria uma máquina nova, lê um repositório de objetos, exporta um instantâneo de disco ou apaga um recurso. Nada disso passa por uma única regra de rede sua, porque o plano de controle não fica dentro da sua rede.\n\nEsse é o ponto que fecha o argumento do módulo dois com o deste módulo. Em nuvem, a rede contém e a identidade decide. Investir só em rede produz um ambiente elegante que uma credencial derruba. Investir só em identidade produz um ambiente onde o primeiro comprometimento alcança tudo lateralmente. As duas coisas fazem trabalhos diferentes e nenhuma substitui a outra.\n\nDois erros específicos de segmentação merecem menção final. O primeiro é a rede única e plana com tudo dentro, herdada do desenho do datacenter, que anula o benefício mais barato da nuvem. O segundo é o grupo de segurança que libera outro grupo inteiro em vez de uma porta específica, o que na prática cria confiança mútua entre camadas que deveriam ser separadas. Ambos passam despercebidos porque funcionam perfeitamente, e é exatamente esse o problema.",
                },
            ],
            questions: [
                {
                    statement: "Como o controle de rede muda de forma em ambientes de nuvem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Vira regra colada em cada recurso, não caixa central",
                            isCorrect: true,
                        },
                        {
                            text: "Vira responsabilidade exclusiva do provedor contratado",
                            isCorrect: false,
                        },
                        {
                            text: "Deixa de existir, porque o tráfego já é todo cifrado",
                            isCorrect: false,
                        },
                        {
                            text: "Passa a atuar somente na borda entre regiões usadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que controlar a saída de rede atrapalha tanto um invasor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Segundo estágio, comando e exfiltração dependem dela",
                            isCorrect: true,
                        },
                        {
                            text: "O acesso inicial deixa de funcionar sem rota de saída",
                            isCorrect: false,
                        },
                        {
                            text: "A varredura interna precisa de rota para a internet",
                            isCorrect: false,
                        },
                        {
                            text: "A autenticação do provedor exige saída direta liberada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o custo honesto de adotar lista de domínios permitidos na saída?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quebra construção de software e exige manutenção",
                            isCorrect: true,
                        },
                        {
                            text: "Aumenta muito a latência de toda chamada externa",
                            isCorrect: false,
                        },
                        {
                            text: "Impede o uso de pontos de acesso privados do provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Exige um equipamento físico dedicado em cada região",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com uma credencial válida vazada, o atacante cria recursos pela interface do provedor. Por que a segmentação não impede isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O plano de controle não passa pela sua rede virtual",
                            isCorrect: true,
                        },
                        {
                            text: "Os grupos de segurança não avaliam tráfego de saída",
                            isCorrect: false,
                        },
                        {
                            text: "As regras de sub-rede não têm estado de conexão",
                            isCorrect: false,
                        },
                        {
                            text: "A credencial contorna a cifra aplicada em trânsito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que um grupo de segurança que libera outro grupo inteiro é um desenho fraco?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cria confiança mútua entre camadas que deveriam separar",
                            isCorrect: true,
                        },
                        {
                            text: "Impede que o tráfego entre as camadas seja registrado",
                            isCorrect: false,
                        },
                        {
                            text: "Faz o tráfego sair para a internet antes de retornar",
                            isCorrect: false,
                        },
                        {
                            text: "Deixa de funcionar quando o recurso muda de sub-rede",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Cifra em repouso, em trânsito e quem tem a chave",
            blocks: [
                {
                    type: "text",
                    value: "# Cifra em repouso resolve um problema específico e estreito\n\nCifra em repouso protege o dado contra quem alcança a mídia por fora do caminho previsto: um disco descartado, um instantâneo copiado para outra conta, um backup que foi parar num lugar errado. É um controle indispensável, custa quase nada em nuvem e deve estar ligado em tudo. O que ele não faz é proteger o dado de quem pede o dado pelo caminho normal, porque o serviço decifra de forma transparente para qualquer requisição autorizada.\n\nEssa distinção importa mais do que parece, porque a frase o dado estava cifrado é usada como resposta em incidentes onde ela é completamente irrelevante. Se o repositório estava público e o objeto foi servido por uma conexão cifrada, com cifra ativa em repouso, o atacante recebeu o conteúdo em texto claro do mesmo jeito. Toda a cadeia de cifra funcionou perfeitamente e entregou o dado para quem pediu, que era exatamente o desenho.\n\nA pergunta profissional, então, não é se o dado está cifrado. É quem consegue pedir o dado decifrado, sob quais condições, e o que fica registrado quando alguém pede. Formulada assim, ela devolve a discussão para onde ela pertence, que é controle de acesso, e transforma a cifra de resposta pronta em um dos controles do conjunto.",
                },
                {
                    type: "table",
                    value: '[["Modelo de chave","O que você ganha","O que você assume"],["Chave gerenciada pelo provedor","Ligada por padrão, esforço zero","Sem política própria nem registro de uso"],["Chave do cliente no provedor","Política e registro de uso separados","Gestão de acesso e de rotação da chave"],["Chave em módulo dedicado","Controle forte e isolamento físico","Custo, latência e operação especializada"],["Chave trazida de fora","Independência do provedor","Risco real de perder o dado por engano"],["Chave por ambiente ou cliente","Isolamento entre bases distintas","Muito mais chaves para administrar"]]',
                },
                {
                    type: "quote",
                    value: "A pergunta certa não é se o dado está cifrado. É quem consegue pedir o dado decifrado e o que fica registrado quando pede.",
                },
                {
                    type: "text",
                    value: "## Quem controla a chave, e por que isso vale algo\n\nO valor real de usar chave gerenciada pelo cliente não é matemática mais forte, porque o algoritmo é o mesmo. O valor é que a política da chave vira uma segunda fronteira de autorização, independente da primeira, e o uso da chave gera registro próprio. Alguém que consiga permissão de leitura no repositório mas não tenha permissão de uso da chave recebe conteúdo cifrado e nada mais. Você acabou de exigir que duas falhas aconteçam juntas em vez de uma.\n\nAgora a parte que quase ninguém diz. Isso só é verdade se as duas políticas forem controladas por pessoas ou papéis diferentes. Quando o mesmo administrador de plataforma tem poder total sobre o repositório e sobre a chave, a segunda fronteira não existe: o invasor que roubou aquele acesso simplesmente concede a si mesmo o uso da chave. Nesse caso você adicionou complexidade operacional, risco de indisponibilidade por erro de chave e nenhum ganho de segurança.\n\nHá ainda um poder que a chave dá e que costuma passar despercebido: revogação. Desabilitar uma chave torna ilegível, de uma vez, todo o dado cifrado com ela, inclusive cópias que estejam em lugares que você não controla mais. Isso é uma alavanca poderosa numa resposta a incidente e, exatamente pela mesma razão, é um risco operacional sério. Chave é um ativo que precisa de dono, de inventário, de rotação planejada e de um plano de recuperação testado.",
                },
                {
                    type: "text",
                    value: "## Em trânsito, e o que vem depois\n\nCifra em trânsito virou consenso para o tráfego que sai da empresa, e ainda encontra resistência para o tráfego interno entre serviços, com o argumento de que a rede interna é confiável. Já vimos neste módulo que ela não é. Comunicação entre serviços deve usar TLS, e em ambientes maduros com autenticação mútua, onde os dois lados apresentam certificado. Isso resolve de uma vez a interceptação interna e boa parte do problema de um serviço fingir ser outro.\n\nCertificado é disciplina operacional antes de ser tema de segurança. A causa mais comum de indisponibilidade relacionada a cifra não é ataque, é validade vencida num certificado que ninguém sabia que existia. Inventário de certificado, renovação automatizada e alarme com antecedência confortável evitam o incidente mais previsível do calendário de qualquer empresa.\n\nExiste uma terceira perna emergindo, a cifra durante o uso, com ambientes de execução isolados por hardware. Ela promete proteger o dado inclusive de quem opera a infraestrutura, o que interessa a setores muito regulados e a cenários de processamento entre organizações. Vale acompanhar com interesse e sem pressa: a tecnologia é real, o ecossistema ainda amadurece, e a maioria das empresas tem problemas bem mais baratos de resolver antes de chegar nela.",
                },
            ],
            questions: [
                {
                    statement: "Contra o que a cifra em repouso protege de fato?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Contra quem alcança a mídia fora do caminho previsto",
                            isCorrect: true,
                        },
                        {
                            text: "Contra quem obtém uma credencial válida de leitura",
                            isCorrect: false,
                        },
                        {
                            text: "Contra a interceptação do tráfego entre dois serviços",
                            isCorrect: false,
                        },
                        {
                            text: "Contra a exclusão acidental do conteúdo armazenado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um repositório público serviu objetos cifrados em repouso por conexão cifrada. O atacante obteve o quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O conteúdo em texto claro, decifrado pelo serviço",
                            isCorrect: true,
                        },
                        {
                            text: "O conteúdo cifrado, inútil sem a chave do serviço",
                            isCorrect: false,
                        },
                        {
                            text: "Somente os metadados dos objetos, não o conteúdo",
                            isCorrect: false,
                        },
                        {
                            text: "Nada, porque a cifra bloqueia acesso não autorizado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o ganho real de usar chave de cifra gerenciada pelo cliente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma segunda fronteira de autorização, com registro próprio",
                            isCorrect: true,
                        },
                        {
                            text: "Um algoritmo de cifra mais forte que o oferecido por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Uma cópia da chave guardada fora do ambiente do provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Uma redução no custo de armazenamento do dado cifrado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O mesmo papel administra a política do repositório e a da chave. Qual é a consequência?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A segunda fronteira some, e sobra só a complexidade",
                            isCorrect: true,
                        },
                        {
                            text: "A chave deixa de registrar as operações de uso feitas",
                            isCorrect: false,
                        },
                        {
                            text: "A cifra em repouso é desativada pelo próprio provedor",
                            isCorrect: false,
                        },
                        {
                            text: "A rotação automática da chave para de ser possível",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a causa mais comum de indisponibilidade ligada a certificados?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Validade vencida em certificado que ninguém inventariou",
                            isCorrect: true,
                        },
                        {
                            text: "Uso de autenticação mútua entre serviços internos",
                            isCorrect: false,
                        },
                        {
                            text: "Algoritmo de assinatura incompatível com o cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Revogação indevida feita pela autoridade emissora",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Imagens, contêineres e a cadeia de construção",
            blocks: [
                {
                    type: "text",
                    value: "# Uma imagem é a soma de tudo que outras pessoas colocaram nela\n\nUma imagem de contêiner é uma pilha de camadas: uma imagem base que alguém montou, pacotes vindos de repositórios públicos, as dependências do seu projeto e, no topo, o seu código. Cada camada é uma confiança que você herdou sem negociar. Uma aplicação trivial construída sobre uma base com distribuição completa costuma nascer com centenas de vulnerabilidades conhecidas antes de a primeira linha própria ser escrita, e a maioria delas está em programas que a sua aplicação nunca vai executar.\n\nDaí a recomendação mais eficaz e mais barata: base mínima. Uma imagem que contém apenas o necessário para rodar o processo remove a maior parte da superfície simplesmente por não ter o que remover depois. Tem um efeito colateral excelente para a defesa: uma imagem sem interpretador de comandos, sem gerenciador de pacotes e sem utilitários de rede é um lugar bem desconfortável para o invasor trabalhar depois de conseguir execução.\n\nUma armadilha específica de camadas vale destacar porque pega gente experiente. Se um segredo entrou numa camada e foi apagado numa camada posterior, ele continua na imagem: o apagamento é uma alteração da camada de cima, e a de baixo permanece íntegra e recuperável. Copiar um arquivo de ambiente para dentro da construção e removê-lo em seguida não remove nada. Segredo em tempo de construção pede construção em várias etapas ou montagem temporária, nunca uma cópia seguida de exclusão.",
                },
                {
                    type: "table",
                    value: '[["Elo da cadeia","Risco que ele carrega","Controle correspondente"],["Imagem base","Herda tudo o que outro montou","Base mínima e de origem confiável"],["Dependência pública","Pacote comprometido ou abandonado","Versão fixada e integridade verificada"],["Construção","Segredo entra e fica numa camada","Várias etapas e montagem temporária"],["Registro de imagem","Imagem trocada depois de aprovada","Assinatura verificada na admissão"],["Execução","Contêiner com raiz e privilégio","Usuário comum e sistema somente leitura"]]',
                },
                {
                    type: "quote",
                    value: "Segredo apagado numa camada de cima continua inteiro na camada de baixo. A imagem guarda a história, não só o resultado final.",
                },
                {
                    type: "text",
                    value: "## A cadeia de construção é superfície de ataque\n\nO sistema que constrói e implanta o seu software costuma ter credencial para o registro de imagens, para o repositório de código e para o ambiente de produção. Isso faz dele um alvo melhor do que a própria aplicação: comprometer a construção é comprometer tudo o que ela produz, com assinatura legítima e sem levantar suspeita. Ataques a essa camada cresceram muito na última década, em várias formas: pacote público malicioso com nome parecido com o legítimo, conta de mantenedor invadida, dependência interna sequestrada por um pacote público de mesmo nome.\n\nOs controles são conhecidos e se reforçam. Fixar versão com arquivo de bloqueio e verificação de integridade, para que a construção de hoje traga exatamente o que a de ontem trouxe. Passar os repositórios públicos por um espelho interno, que dá cache, auditoria e um ponto onde bloquear um pacote ruim. Separar a credencial que constrói da credencial que implanta. E assinar o artefato produzido, verificando a assinatura no momento em que o ambiente aceita rodar aquela imagem, porque assinatura sem verificação na admissão é só um carimbo bonito.\n\nO item que mais rende no dia ruim é a lista de materiais do software, o inventário de tudo o que compõe cada artefato. Quando aparece uma falha grave numa biblioteca muito usada, e isso acontece de tempos em tempos, as empresas que responderam em horas não foram as que tinham mais ferramenta: foram as que conseguiram responder onde essa biblioteca está rodando sem precisar perguntar para cada time.",
                },
                {
                    type: "text",
                    value: "## Na execução, onde tudo isso vira regra\n\nAs boas práticas de execução são poucas e fazem diferença real. Rodar como usuário comum em vez de raiz, montar o sistema de arquivos como somente leitura e gravar apenas onde for necessário, remover as capacidades do sistema que o processo não usa e nunca conceder modo privilegiado, que basicamente dissolve o isolamento do contêiner. Limitar processador e memória também é segurança, porque impede que uma carga comprometida consuma o nó inteiro.\n\nNo lado da identidade, a regra que mais evita estrago é não deixar a carga usar a credencial do nó. Se cada contêiner puder pedir a identidade da máquina que o hospeda, todos os contêineres daquele nó têm o mesmo poder, e o menos importante deles vira caminho para o mais importante. Identidade por carga de trabalho, atrelada ao serviço e ao espaço lógico onde ela roda, resolve isso e ainda dá granularidade de auditoria.\n\nO ponto que amarra tudo é a admissão. De nada adianta política de imagem mínima, assinatura e varredura se o ambiente aceita rodar qualquer coisa que alguém empurrar. Uma regra de admissão que recusa imagem sem assinatura válida, sem varredura recente ou que peça privilégio é o lugar onde as decisões dos parágrafos anteriores param de ser recomendação e passam a ser propriedade do ambiente.",
                },
            ],
            questions: [
                {
                    statement: "Por que usar uma imagem base mínima reduz tanto a superfície?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ela não traz programas que a aplicação nunca usa",
                            isCorrect: true,
                        },
                        {
                            text: "Ela recebe correções do fornecedor com mais rapidez",
                            isCorrect: false,
                        },
                        {
                            text: "Ela ocupa menos espaço no registro de imagens usado",
                            isCorrect: false,
                        },
                        {
                            text: "Ela impede que o contêiner rode como usuário raiz",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um arquivo com segredo foi copiado numa camada e apagado na seguinte. O que acontece?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O segredo continua recuperável na camada anterior",
                            isCorrect: true,
                        },
                        {
                            text: "O segredo é removido de todas as camadas da imagem",
                            isCorrect: false,
                        },
                        {
                            text: "O segredo passa a existir apenas em tempo de execução",
                            isCorrect: false,
                        },
                        {
                            text: "O segredo fica cifrado pelo registro de imagens usado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a cadeia de construção é um alvo mais atraente que a aplicação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela produz tudo, com credencial e assinatura legítimas",
                            isCorrect: true,
                        },
                        {
                            text: "Ela roda sem qualquer registro de auditoria disponível",
                            isCorrect: false,
                        },
                        {
                            text: "Ela fica exposta na internet por exigência do serviço",
                            isCorrect: false,
                        },
                        {
                            text: "Ela guarda o dado de cliente durante os testes finais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o valor prático de manter a lista de materiais de cada artefato?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Responder em horas onde uma biblioteca falha está rodando",
                            isCorrect: true,
                        },
                        {
                            text: "Reduzir o tamanho final da imagem publicada no registro",
                            isCorrect: false,
                        },
                        {
                            text: "Garantir que a construção seja reproduzível a cada versão",
                            isCorrect: false,
                        },
                        {
                            text: "Bloquear a instalação de pacotes de origem desconhecida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que deixar o contêiner usar a credencial do nó que o hospeda é um problema sério?",
                    difficulty: "dificil",
                    options: [
                        { text: "Todo contêiner do nó passa a ter o mesmo poder", isCorrect: true },
                        {
                            text: "A credencial do nó não tem prazo curto de validade",
                            isCorrect: false,
                        },
                        {
                            text: "O registro de auditoria deixa de anotar a chamada",
                            isCorrect: false,
                        },
                        {
                            text: "O contêiner passa a rodar em modo privilegiado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Infraestrutura como código e a checagem no pipeline",
            blocks: [
                {
                    type: "text",
                    value: "# Se a infraestrutura virou código, a revisão de segurança vira revisão de código\n\nQuando a configuração do ambiente passa a viver em arquivos versionados, ela ganha tudo o que o código já tinha: histórico de quem mudou o quê, revisão por outra pessoa antes de aplicar, possibilidade de teste automático e reprodutibilidade. Esse é provavelmente o maior presente que a última década deu à segurança de infraestrutura, e a maior parte dos times usa só a metade que aumenta a produtividade.\n\nA metade esquecida é a checagem automática. Analisadores de definição de infraestrutura leem os arquivos e apontam o grupo de segurança que abre porta de administração para o mundo, o repositório sem bloqueio de acesso público, o banco sem cifra, o registro de auditoria desligado. Isso acontece na abertura da proposta de mudança, antes de o recurso existir. O custo de corrigir naquele instante é um comentário na revisão. O custo de corrigir a mesma coisa depois é uma janela de mudança em produção, ou um incidente.\n\nExiste um ganho secundário que aparece com o tempo e que vale mencionar em qualquer conversa de adoção: como a mudança passa a ter autor, revisor e data, a auditoria deixa de depender de entrevista e de captura de tela. A evidência de que a produção só muda por caminho controlado passa a ser um efeito colateral do jeito de trabalhar, e não um relatório produzido às pressas na véspera.",
                },
                {
                    type: "table",
                    value: '[["Momento da checagem","O que costuma pegar","Custo de corrigir ali"],["No editor de quem escreve","Erro evidente de configuração","Segundos, sem ninguém saber"],["Na revisão da mudança","Permissão ampla e desvio de padrão","Minutos e um comentário"],["Antes de aplicar o plano","Diferença entre o proposto e a regra","Uma execução do pipeline"],["Depois de implantado","Desvio real já existente no ambiente","Janela de mudança em produção"],["Na auditoria do ano","Tudo o que passou pelas etapas acima","Plano de ação e constrangimento"]]',
                },
                {
                    type: "quote",
                    value: "Uma regra que bloqueia a entrega precisa ser uma regra com a qual o time concorda. Do contrário, ela não é bloqueio, é uma negociação diária.",
                },
                {
                    type: "text",
                    value: "## Onde essa checagem costuma dar errado\n\nO primeiro tropeço é o ruído. Conjuntos de regras padrão vêm com centenas de verificações, muitas irrelevantes para o contexto, e a primeira execução acusa milhares de problemas. O time olha, conclui que a ferramenta não entende o ambiente e desliga, ou pior, mantém ligada e aprova exceção em todas as entregas, o que treina todo mundo a ignorar o aviso. A saída é começar com um conjunto pequeno de regras bloqueantes, escolhidas junto com quem escreve o código, e deixar o resto como aviso.\n\nO segundo tropeço é confundir severidade com consenso. Uma regra bloqueante precisa ser uma regra que o time acha justa, senão ela vira obstáculo político e alguém encontra o caminho de contornar. É melhor bloquear dez coisas que ninguém defende, como expor porta administrativa e desligar registro de auditoria, e ir crescendo, do que bloquear cinquenta e passar seis meses discutindo exceções.\n\nO terceiro é o desvio entre o código e a realidade. Alguém mexeu no painel durante um incidente às três da manhã, resolveu o problema e não voltou para o código. Agora o arquivo diz uma coisa e o ambiente faz outra, e a próxima aplicação vai desfazer a correção ou falhar. Mudança manual em emergência é legítima e não deve ser demonizada; o que precisa existir é a detecção de desvio e o hábito de reconciliar depois, trazendo a mudança para o código ou revertendo conscientemente.",
                },
                {
                    type: "text",
                    value: "## Segredo, estado e a credencial do próprio pipeline\n\nTrês cuidados específicos fecham o assunto. O primeiro é o arquivo de estado, que várias ferramentas geram para saber o que já foi criado. Ele frequentemente contém valores sensíveis em texto claro, incluindo senhas geradas na criação de recursos. Esse arquivo precisa ficar em armazenamento remoto, cifrado, com acesso restrito e travamento, e jamais no repositório de código junto com o resto.\n\nO segundo é não colocar segredo nas variáveis versionadas. A definição referencia o cofre e o valor é resolvido na aplicação, não guardado no arquivo. Vale a mesma disciplina do módulo anterior: se o segredo entrou no histórico do repositório, ele está comprometido, e a resposta é girar.\n\nO terceiro é a credencial que o próprio pipeline usa para falar com a nuvem, que costuma ser a mais poderosa da empresa e a mais esquecida. Guardar uma chave estática de longa vida na ferramenta de integração contínua é criar exatamente o problema que o módulo dois inteiro pediu para evitar, num sistema que muita gente consegue alterar. O caminho correto é federação: o pipeline apresenta a identidade dele ao provedor e recebe credencial de curta duração, restrita ao repositório e ao ramo específico, sem que exista qualquer segredo guardado para alguém roubar.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o ganho de segurança de tratar infraestrutura como código?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A configuração passa a ter revisão antes de existir",
                            isCorrect: true,
                        },
                        {
                            text: "A configuração deixa de precisar de cifra em repouso",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor assume a correção dos recursos criados",
                            isCorrect: false,
                        },
                        {
                            text: "O ambiente passa a bloquear mudanças manuais nele",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a checagem automática de infraestrutura costuma ser desligada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O conjunto padrão gera ruído demais logo na estreia",
                            isCorrect: true,
                        },
                        {
                            text: "Ela só funciona depois que o recurso já foi criado",
                            isCorrect: false,
                        },
                        {
                            text: "Ela exige licença separada em quase todo provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Ela não consegue ler arquivos versionados no repositório",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que critério define bem quais regras devem bloquear a entrega?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Poucas regras graves e com concordância do time",
                            isCorrect: true,
                        },
                        {
                            text: "Todas as regras marcadas como severas pela ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "As regras exigidas pelo referencial de conformidade",
                            isCorrect: false,
                        },
                        {
                            text: "As regras que a equipe de segurança considerar úteis",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Alguém corrigiu um recurso pelo painel durante um incidente e não voltou ao código. Qual é o encaminhamento correto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Detectar o desvio e reconciliar com o código depois",
                            isCorrect: true,
                        },
                        {
                            text: "Proibir qualquer alteração manual mesmo em emergência",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar o código de novo assim que o incidente fechar",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar a exceção e manter os dois estados distintos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a melhor forma de dar acesso à nuvem para a ferramenta de integração contínua?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Federação com credencial curta por repositório e ramo",
                            isCorrect: true,
                        },
                        {
                            text: "Chave estática guardada no cofre de segredos da equipe",
                            isCorrect: false,
                        },
                        {
                            text: "Usuário dedicado com senha longa e segundo fator ativo",
                            isCorrect: false,
                        },
                        {
                            text: "Chave estática restrita à faixa de saída do executor",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Zero trust sem marketing",
    aulas: [
        {
            titulo: "O que zero trust é, e o que não é",
            blocks: [
                {
                    type: "text",
                    value: "# Zero trust não é produto, é um critério de decisão\n\nO termo apareceu por volta de 2010 num trabalho de analista de mercado e foi ganhando corpo até o NIST publicar a publicação especial 800-207, que é a referência aberta e vendor-neutral que vale ler. A ideia central cabe numa frase: nenhuma confiança é concedida de forma implícita por causa da posição na rede. Cada acesso é decidido no momento em que é pedido, com a informação disponível naquele momento, e a decisão vale para aquele pedido e não para sempre.\n\nÉ mais fácil entender pelo que a proposta nega. Ela nega que estar dentro da rede corporativa signifique alguma coisa. Nega que ter passado pela autenticação de manhã autorize tudo o que a pessoa fizer à tarde. Nega que um serviço interno possa ser confiado só por ser interno. E nega que segurança seja uma fronteira atravessada uma vez, substituindo isso por uma sequência de decisões pequenas e repetidas.\n\nA parte que mais atrapalha o aprendizado é o marketing. Praticamente todo fornecedor de segurança colou o rótulo no que já vendia, e o comprador acredita que adquiriu uma arquitetura quando adquiriu uma funcionalidade. A defesa saudável em qualquer conversa comercial é uma pergunta só: qual dos princípios esse produto implementa, para quais recursos, e o que continua descoberto depois que ele estiver instalado. Fornecedor sério responde isso sem desconforto.",
                },
                {
                    type: "table",
                    value: '[["Afirmação comum","Por que ela é imprecisa","Leitura correta"],["Compramos zero trust","É rótulo colado em produto","Arquitetura montada aos poucos"],["Zero trust é fator duplo","O fator é um verificador entre vários","Verificação contínua e com contexto"],["Zero trust dispensa rede","Segmentação segue sendo essencial","A rede contém, a identidade autoriza"],["É projeto com data de fim","Ele nunca termina de verdade","Programa contínuo, domínio a domínio"],["É desconfiar de todo mundo","Não é postura moral nem cultural","Confiança deixa de ser implícita"]]',
                },
                {
                    type: "quote",
                    value: "Pergunte a qualquer fornecedor qual princípio o produto dele implementa e o que continua descoberto depois. Quem vende arquitetura responde sem desconforto.",
                },
                {
                    type: "text",
                    value: "## Os três princípios que sustentam o resto\n\nO primeiro é verificar explicitamente: toda decisão de acesso usa todos os sinais disponíveis, e não apenas a senha certa. O segundo é privilégio mínimo, agora aplicado também à sessão, e não só ao conjunto de permissões da conta. O terceiro é assumir a violação: projetar partindo do princípio de que o adversário já está dentro de algum lugar, o que empurra segmentação e detecção para o centro. As próximas três aulas são exatamente uma por princípio, e a quinta trata de como adotar isso sem parar a empresa.\n\nA publicação do NIST descreve também um vocabulário de componentes que vale conhecer em termos simples. Existe algo que decide, olhando política e sinais. Existe algo que administra essa decisão e emite a autorização. E existe um ponto no caminho do acesso onde a decisão vira efeito prático, permitindo ou barrando. Você pode implementar isso com produtos diferentes, mas as três funções sempre existem, e quando alguém não consegue apontar onde cada uma vive no ambiente dele, geralmente falta a terceira.\n\nVale registrar uma honestidade histórica: nada disso é ideia nova. Privilégio mínimo é dos anos setenta, autorização por requisição é antiga, desconfiar da rede interna já era conselho de manual antigo. O que mudou foi a viabilidade: hoje existe identidade federada barata, telemetria abundante, política avaliada em milissegundos e dispositivo que reporta o próprio estado. A ideia esperou a tecnologia alcançá-la.",
                },
                {
                    type: "text",
                    value: "## Por que isso virou pauta agora\n\nOs dois primeiros módulos desta trilha já contam essa história. O perímetro se dissolveu porque a carga de trabalho saiu do prédio e o trabalhador também. A identidade virou a fronteira porque foi ela que sobrou como ponto comum de decisão. Zero trust é simplesmente a resposta arquitetural organizada para esse novo cenário, e é por isso que ele aparece com força em orientação de governo, em referencial de setor e em exigência de cliente corporativo.\n\nO risco dessa popularidade é a adoção cerimonial: comprar ferramenta, declarar maturidade, preencher questionário e não mudar decisão nenhuma. O teste para saber se a empresa realmente andou é bem concreto. Pergunte se existe algum lugar onde estar na rede interna ainda dá acesso automático a alguma coisa. Se a resposta for sim, e quase sempre é, você acabou de encontrar a próxima tarefa, e ela vale mais do que qualquer certificado de maturidade.\n\nUm último enquadramento útil para conversar com a liderança. Zero trust não promete impedir invasão, e prometer isso é o jeito mais rápido de perder credibilidade quando o incidente vier. O que ele promete é que a invasão custe caro para o adversário e renda pouco: alcance limitado, tempo curto, rastro visível. Essa é uma promessa que se sustenta e que dá para verificar depois.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a ideia central de zero trust?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Nenhuma confiança é implícita pela posição na rede",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhum usuário externo acessa o ambiente corporativo",
                            isCorrect: false,
                        },
                        {
                            text: "Todo tráfego interno passa a ser inspecionado na borda",
                            isCorrect: false,
                        },
                        {
                            text: "Toda senha é substituída por certificado do dispositivo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quais são os três princípios que sustentam uma arquitetura zero trust?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Verificar sempre, privilégio mínimo e assumir a violação",
                            isCorrect: true,
                        },
                        {
                            text: "Cifrar tudo, registrar tudo e segmentar toda a rede interna",
                            isCorrect: false,
                        },
                        {
                            text: "Autenticar, autorizar e auditar cada acesso solicitado",
                            isCorrect: false,
                        },
                        {
                            text: "Inventariar, corrigir e monitorar de forma contínua",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que dizer que a empresa comprou zero trust é impreciso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É uma arquitetura, montada aos poucos e sem fim",
                            isCorrect: true,
                        },
                        {
                            text: "É um referencial fechado publicado por um órgão",
                            isCorrect: false,
                        },
                        { text: "É um controle exigido apenas do setor público", isCorrect: false },
                        {
                            text: "É uma certificação que a empresa precisa obter",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um fornecedor apresenta a solução dele como zero trust completo. Qual é a pergunta mais útil a fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Que princípio ele cobre e o que segue descoberto",
                            isCorrect: true,
                        },
                        {
                            text: "Quantos clientes do mesmo setor já o utilizam hoje",
                            isCorrect: false,
                        },
                        {
                            text: "Qual referencial de conformidade ele atende inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Quanto tempo leva a implantação completa na empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que zero trust promete de forma sustentável para a liderança?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Que a invasão custe caro, alcance pouco e deixe rastro",
                            isCorrect: true,
                        },
                        {
                            text: "Que a invasão deixe de ocorrer depois da implantação",
                            isCorrect: false,
                        },
                        {
                            text: "Que o investimento em rede possa ser todo redirecionado",
                            isCorrect: false,
                        },
                        {
                            text: "Que a conformidade regulatória fique atendida por inteiro",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Verificar explicitamente, sempre",
            blocks: [
                {
                    type: "text",
                    value: "# Verificar explicitamente significa não presumir nada\n\nA decisão de liberar um acesso deveria usar tudo o que se sabe naquele instante: quem é a identidade, com que força ela se autenticou, em que dispositivo está e qual o estado desse dispositivo, de que rede vem, qual aplicação está sendo pedida, qual a sensibilidade do dado envolvido e o que mudou no comportamento daquela sessão. A senha certa é um sinal entre muitos, e sozinha ela só responde uma parte pequena da pergunta.\n\nO exemplo que faz a ficha cair é o seguinte. A mesma pessoa, a mesma senha, o mesmo segundo fator, num notebook pessoal sem gestão, num país onde a empresa não opera, às três da manhã, pedindo exportação completa da base de clientes. No modelo antigo isso é simplesmente um acesso válido, porque a credencial conferiu. Sob verificação explícita, essa combinação não é o mesmo acesso da mesma pessoa no notebook corporativo às dez da manhã consultando um registro.\n\nO sinal que mais costuma faltar é o do dispositivo, e a ausência dele derruba metade do modelo. Se você não sabe se o notebook está com disco cifrado, com sistema atualizado e com proteção ativa, não tem como incluir isso na decisão. Por isso gestão de dispositivo deixou de ser assunto separado de infraestrutura e virou pré-requisito de zero trust. Sem estado de dispositivo, a política vira apenas identidade mais localização, o que é bem menos do que se anuncia.",
                },
                {
                    type: "table",
                    value: '[["Sinal usado na decisão","O que ele responde","Quando ele muda o resultado"],["Identidade e papel","Quem está pedindo o acesso","Conta privilegiada exige mais garantia"],["Força da autenticação","Como a pessoa provou quem é","Fator fraco limita o que ela pode fazer"],["Estado do dispositivo","Se dá para operar dali com segurança","Sem gestão, apenas leitura é liberada"],["Contexto de rede","De onde a requisição está vindo","Origem inédita pede nova validação"],["Sensibilidade do recurso","O que exatamente está sendo pedido","Dado pessoal exige garantia mais alta"],["Risco da sessão","O que mudou desde o início dela","Sinal de risco encerra a sessão viva"]]',
                },
                {
                    type: "quote",
                    value: "Sem estado do dispositivo, a política de acesso vira identidade mais localização. É bem menos do que a palavra zero trust anuncia.",
                },
                {
                    type: "text",
                    value: "## A palavra sempre é a parte difícil\n\nAutenticar bem na entrada e depois confiar num token por doze horas é confiança implícita com passos a mais. E isso não é hipótese acadêmica: roubo de token de sessão é hoje um dos caminhos mais usados para contornar segundo fator. O atacante não precisa da sua senha nem do seu código, ele precisa do artefato que o navegador guarda depois que você já provou tudo. Do lado do servidor, aquela sessão continua parecendo perfeitamente legítima.\n\nAs respostas para isso existem e se combinam. Sessão mais curta onde o impacto é alto. Revalidação obrigatória antes de operação destrutiva ou de exportação em massa. Avaliação contínua, que encerra sessões vivas quando algo muda de forma relevante, como troca de senha, desligamento da pessoa, dispositivo que saiu de conformidade ou deslocamento geográfico impossível. E, onde a plataforma permitir, vincular o token ao dispositivo, de forma que ele não funcione se for copiado para outro lugar.\n\nO equilíbrio aqui é real e não adianta fingir que não é. Revalidar demais destrói a experiência, e gente com fricção excessiva encontra contorno, inclusive contornos criativos e péssimos. A calibragem correta é por impacto: consultar um painel de indicadores nunca deveria pedir nova prova, exportar a base inteira de clientes deveria pedir sempre. Quem aplica a mesma régua para os dois casos escolheu entre atrapalhar todo mundo ou não proteger nada.",
                },
                {
                    type: "text",
                    value: "## O erro de implantação que queima o programa\n\nO jeito mais rápido de matar uma iniciativa de acesso condicional é ligar a política mais forte para todo mundo de uma vez, numa segunda-feira. O resultado é previsível: centenas de pessoas sem conseguir trabalhar, uma fila de exceções aprovadas às pressas, e a segurança marcada como a área que parou a empresa. As exceções concedidas naquele dia costumam virar permanentes, e a lista de exceções passa a ser a política real do ambiente.\n\nO caminho que funciona começa por classificar aplicações por impacto e aplicar verificação forte primeiro no topo, onde o número de pessoas afetadas é menor e a justificativa é óbvia. Administração de nuvem, sistemas financeiros e bases com dado pessoal entram cedo. Ferramenta de comunicação interna e painel de indicadores entram depois, com política mais leve. Cada etapa serve de aprendizado para a seguinte, inclusive sobre o que a operação não aguenta.\n\nUma regra que evita o apodrecimento: exceção nasce com prazo e com dono, e aparece num relatório que alguém olha. Exceção invisível vira padrão, e um ano depois ninguém consegue mais dizer qual é a política vigente. Vale também deixar caminho de recuperação claro, porque toda política forte produz bloqueio legítimo em algum momento, e uma pessoa presa sem saída é a melhor propaganda contra o programa que existe.",
                },
            ],
            questions: [
                {
                    statement: "O que significa verificar explicitamente em zero trust?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Decidir cada acesso com todos os sinais disponíveis",
                            isCorrect: true,
                        },
                        {
                            text: "Exigir segundo fator em todos os acessos realizados",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar cada acesso concedido para auditar depois",
                            isCorrect: false,
                        },
                        {
                            text: "Confirmar a identidade do usuário uma vez por jornada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a gestão de dispositivo virou pré-requisito de zero trust?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem estado do dispositivo, falta metade dos sinais",
                            isCorrect: true,
                        },
                        {
                            text: "Sem agente instalado, o token de sessão não é emitido",
                            isCorrect: false,
                        },
                        {
                            text: "Sem inventário, o provedor recusa a federação da conta",
                            isCorrect: false,
                        },
                        {
                            text: "Sem cifra de disco, a autenticação não é considerada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o roubo de token de sessão contorna o segundo fator?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele reaproveita a prova que já foi feita pelo usuário",
                            isCorrect: true,
                        },
                        {
                            text: "Ele quebra o código gerado pelo aplicativo do usuário",
                            isCorrect: false,
                        },
                        {
                            text: "Ele força a emissão de um novo fator pelo provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Ele explora uma falha no protocolo de federação usado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o critério certo para calibrar quando pedir nova validação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O impacto da operação que está sendo solicitada",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo decorrido desde o início daquela sessão",
                            isCorrect: false,
                        },
                        { text: "O cargo ocupado pela pessoa dentro da empresa", isCorrect: false },
                        {
                            text: "O volume de acessos feitos por aquela conta no dia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa ligou a política mais forte para todos de uma vez. Qual é o efeito mais provável a médio prazo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A lista de exceções vira a política real do ambiente",
                            isCorrect: true,
                        },
                        {
                            text: "A maturidade de acesso condicional sobe rapidamente",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor limita a quantidade de políticas ativas",
                            isCorrect: false,
                        },
                        {
                            text: "As sessões passam a expirar antes do prazo definido",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Privilégio mínimo e acesso adaptativo",
            blocks: [
                {
                    type: "text",
                    value: "# O mesmo princípio de sempre, agora aplicado à sessão\n\nPrivilégio mínimo, no módulo dois, tratava de quais permissões uma identidade possui. Em zero trust ele ganha uma segunda dimensão: quais permissões estão ativas nesta sessão, neste contexto, para este pedido. Uma pessoa pode ter direito a exportar relatórios e ainda assim não poder exportar agora, do dispositivo em que está. A permissão continua existindo; ela apenas não está disponível nas condições atuais.\n\nÉ isso que a palavra adaptativo quer dizer, e ela é mais interessante do que parece porque muda a natureza da resposta. A maioria dos ambientes só implementa dois resultados possíveis, permitir e bloquear, e com isso perde justamente o meio, que é onde vive quase todo o risco real. Existe um espectro: permitir, permitir exigindo fator adicional, permitir apenas leitura, permitir sem download ou cópia, permitir dentro de uma sessão isolada, e só então bloquear.\n\nO exemplo prático deixa isso concreto. Uma pessoa de vendas no celular pessoal consegue consultar um cliente no sistema comercial, porque isso é o trabalho dela e negar seria absurdo. Ela não consegue exportar a lista inteira daquele mesmo celular, porque essa operação tem outro impacto e outro contexto. Mesma identidade, mesmo conjunto de permissões, sessões diferentes. Quem só tem permitir e bloquear precisa escolher entre impedir o trabalho ou aceitar a exportação, e as duas escolhas são ruins.",
                },
                {
                    type: "table",
                    value: '[["Situação da sessão","Resposta proporcional","O que ela evita na prática"],["Dispositivo gerenciado e em dia","Acesso normal ao que o papel permite","Fricção desnecessária no dia a dia"],["Dispositivo pessoal conhecido","Leitura sim, exportação não","Cópia em massa para fora do controle"],["Origem geográfica inédita","Nova prova antes de continuar","Uso de credencial roubada à distância"],["Operação destrutiva pedida","Fator adicional na hora da ação","Estrago feito com sessão sequestrada"],["Sinal de risco durante a sessão","Encerramento e nova autenticação","Continuidade do acesso já comprometido"]]',
                },
                {
                    type: "quote",
                    value: "Quem só tem permitir e bloquear precisa escolher entre travar o trabalho e aceitar a exportação. O meio do espectro é onde mora o risco real.",
                },
                {
                    type: "text",
                    value: "## Onde o acesso adaptativo azeda\n\nO primeiro problema é a decisão opaca. Se a política nega um acesso e ninguém consegue explicar por quê, nem o usuário nem o atendimento, o sistema perde legitimidade rapidamente e a pressão para criar exceções vira insuportável. Toda negação precisa produzir um motivo compreensível e um caminho claro de resolução, seja atualizar o dispositivo, autenticar de novo ou solicitar uma liberação. Negação sem saída é o que faz as pessoas odiarem segurança com razão.\n\nO segundo é o excesso de condições. Times animados criam dezenas de políticas que se cruzam, e o resultado é um conjunto que ninguém consegue simular mentalmente nem testar por completo. Aí aparecem as combinações estranhas: uma pessoa que consegue acessar de um jeito improvável e não consegue do jeito óbvio. Poucas condições, fortes e bem entendidas, protegem mais do que muitas condições que ninguém audita.\n\nO terceiro é o mais irônico: aplicar tudo isso apenas aos funcionários. Terceiros continuam entrando por caminho antigo, contas de serviço ficam de fora porque não têm dispositivo nem segundo fator, e integrações antigas ganham exceção permanente. Como já vimos nos módulos anteriores, é exatamente aí que o risco está concentrado. Política adaptativa que cobre só quem já era o elo mais controlado consome esforço e move pouco o risco.",
                },
                {
                    type: "text",
                    value: "## A parte de máquina para máquina, que quase todo mundo esquece\n\nQuando se fala em acesso condicional, todo mundo pensa em pessoas com navegador. Só que a maior parte das chamadas num ambiente moderno é de serviço para serviço, e elas costumam ser autorizadas por uma regra bem antiga: se veio da rede interna, é confiável. É o mesmo pressuposto que este módulo inteiro está desmontando, sobrevivendo escondido na camada onde ninguém olha.\n\nO equivalente correto para essa camada tem nome e é aplicável hoje. Cada serviço tem identidade própria, atrelada à carga de trabalho e não à máquina. A comunicação usa autenticação mútua, com os dois lados apresentando certificado, de modo que um serviço não consegue se passar por outro. E a autorização acontece por chamada, com token de escopo estreito, destinado explicitamente ao serviço que vai recebê-lo e com validade curta.\n\nO efeito prático disso é grande na hora do incidente. Num ambiente onde tudo interno confia em tudo interno, comprometer o serviço mais bobo dá acesso ao mais crítico, e a investigação não consegue distinguir chamada legítima de chamada forjada. Num ambiente com identidade por carga e autorização por chamada, cada movimento lateral precisa de uma credencial específica que o atacante não tem, e cada tentativa deixa um registro nominal. É privilégio mínimo aplicado onde o volume de acesso realmente está.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que acesso adaptativo acrescenta ao privilégio mínimo tradicional?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A permissão ativa depende do contexto daquela sessão",
                            isCorrect: true,
                        },
                        {
                            text: "A permissão passa a ser concedida por prazo determinado",
                            isCorrect: false,
                        },
                        {
                            text: "A permissão exige aprovação de um segundo responsável",
                            isCorrect: false,
                        },
                        {
                            text: "A permissão é revisada pelo gestor a cada trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que ter apenas permitir e bloquear como respostas é limitante?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Perde-se o meio do espectro, onde o risco real mora",
                            isCorrect: true,
                        },
                        {
                            text: "Perde-se o registro detalhado de cada decisão tomada",
                            isCorrect: false,
                        },
                        {
                            text: "Perde-se a compatibilidade com federação por token",
                            isCorrect: false,
                        },
                        {
                            text: "Perde-se a capacidade de exigir segundo fator forte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que toda negação de acesso precisa produzir um motivo compreensível?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem motivo e saída, a pressão por exceção fica alta",
                            isCorrect: true,
                        },
                        {
                            text: "Sem motivo registrado, a auditoria reprova o controle",
                            isCorrect: false,
                        },
                        {
                            text: "Sem mensagem clara, o provedor bloqueia a conta usada",
                            isCorrect: false,
                        },
                        {
                            text: "Sem justificativa, a política não pode ser reaplicada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa aplicou política adaptativa só aos funcionários. Por que isso rende pouco?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Terceiros e contas de serviço concentram mais risco",
                            isCorrect: true,
                        },
                        {
                            text: "Funcionários já usam segundo fator em todos os acessos",
                            isCorrect: false,
                        },
                        {
                            text: "A política precisa ser igual para toda identidade ativa",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor não permite política parcial por população",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como aplicar verificação explícita nas chamadas entre serviços internos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Identidade por carga, cifra mútua e token por chamada",
                            isCorrect: true,
                        },
                        {
                            text: "Lista de endereços permitidos entre as sub-redes usadas",
                            isCorrect: false,
                        },
                        {
                            text: "Chave compartilhada entre os serviços da mesma camada",
                            isCorrect: false,
                        },
                        {
                            text: "Segundo fator exigido no início de cada integração",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Assumir a violação",
            blocks: [
                {
                    type: "text",
                    value: "# Assumir a violação é planejamento, não pessimismo\n\nO terceiro princípio pede que você projete partindo do pressuposto de que o adversário já está dentro de algum lugar do ambiente. Não é declaração de derrota nem convite ao desânimo: é uma mudança de pergunta. Em vez de perguntar apenas como impedir a entrada, você passa a perguntar o que acontece depois dela. Quando uma conta ou uma máquina estiver comprometida, o que exatamente o atacante alcança a partir dali, em quanto tempo você percebe e em quanto tempo consegue cortar.\n\nDessa pergunta saem duas consequências diretas. A primeira é segmentação, que responde ao alcance. A segunda é detecção, que responde ao tempo. E existe uma terceira que muita gente esquece: capacidade de resposta preparada. Detectar rápido sem conseguir agir rápido só garante uma poltrona na primeira fila para assistir ao incidente. Se cortar o acesso de uma conta depende de encontrar a pessoa certa numa quinta-feira à noite, sua detecção vale menos do que o gráfico sugere.\n\nExiste um exercício barato e desconfortável que vale fazer com o time nesta semana. Escolha os cinco sistemas mais importantes e pergunte, para cada um, o que aconteceria se a conta de serviço dele fosse comprometida hoje. Quais outros sistemas ela alcança, que dado ela lê, que permissão ela tem além do necessário, e quanto tempo levaria para alguém notar. As respostas costumam ser piores do que a expectativa e produzem uma fila de trabalho melhor do que qualquer relatório de ferramenta.",
                },
                {
                    type: "table",
                    value: '[["Pergunta do exercício","O que ela costuma revelar","Ação que sai dela"],["O que essa conta alcança","Permissão bem além do necessário","Reduzir escopo com base no uso"],["Que dado ela consegue ler","Acesso amplo a base sensível","Separar por classe e por chave"],["Quem mais usa essa credencial","Segredo compartilhado entre sistemas","Um segredo por consumidor"],["Em quanto tempo se percebe","Nenhum alarme para aquele uso","Detecção do movimento inevitável"],["Quem corta o acesso à noite","Depende de uma pessoa específica","Procedimento e plantão definidos"]]',
                },
                {
                    type: "quote",
                    value: "Detectar rápido sem poder agir rápido garante apenas uma poltrona na primeira fila para assistir ao próprio incidente.",
                },
                {
                    type: "text",
                    value: "## Segmentação como consequência, e não como projeto de rede\n\nSegmentar, aqui, é bem mais amplo do que dividir faixas de endereço. Trata-se de limitar alcance em todas as dimensões que existem: rede, identidade, dado, conta ou assinatura, e chave de cifra. Um ambiente bem segmentado não é o que tem mais divisões de rede, é aquele em que comprometer o componente A não entrega o componente B de graça, seja por qual caminho for.\n\nA métrica mental que organiza essa conversa é o raio de explosão. Para cada credencial, cada conta e cada componente, qual é o tamanho do estrago se ele cair? Reduzir esse raio tem meios bem concretos, e todos já apareceram nesta trilha: contas separadas por ambiente, chaves separadas por classe de dado, credencial própria para cada consumidor em vez de segredo compartilhado, papéis diferentes para leitura e alteração, e nenhuma ponte permanente entre ambientes.\n\nVale um aviso contra o exagero. Segmentação sem limite produz um ambiente que ninguém consegue operar, com dezenas de fronteiras que quebram a cada mudança e um time que passa o dia abrindo exceção. O critério de bom senso é segmentar entre coisas com criticidade ou natureza diferentes, e não entre coisas parecidas que trabalham juntas o tempo todo. Separar produção de laboratório vale muito. Separar dois microsserviços que só conversam entre si costuma custar mais do que rende.",
                },
                {
                    type: "text",
                    value: "## Detecção como consequência do mesmo princípio\n\nSe você assume que a violação vai acontecer, o investimento deixa de ser só em prevenção e passa a incluir a capacidade de enxergar. E o critério do que detectar também muda. A ambição de detectar tudo é cara e produz ruído; a estratégia melhor é detectar os movimentos que o atacante não consegue evitar fazer. Ele precisa, em algum momento, elevar privilégio, criar alguma forma de voltar, ler dado em volume incomum ou mandar algo para fora.\n\nEsse recorte tem uma vantagem prática enorme: são poucos eventos, são raros em operação normal e são difíceis de disfarçar. Uma elevação de privilégio fora de janela, uma chave de acesso nova criada por uma conta que nunca criou chave, um papel com confiança alterada, um volume de leitura muito acima do padrão daquela identidade. Cada um desses gera pouquíssimo ruído e cobre uma etapa inteira do caminho do adversário.\n\nO módulo seguinte é dedicado justamente a isso: quais registros importam em nuvem, que sinais indicam comprometimento de identidade, como a persistência funciona nesse ambiente e como responder quando a máquina afetada pode simplesmente não existir mais amanhã. Assumir a violação é o princípio; o próximo módulo é a prática que decorre dele.",
                },
            ],
            questions: [
                {
                    statement: "O que o princípio de assumir a violação muda na forma de projetar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Passa a considerar o que acontece depois da entrada",
                            isCorrect: true,
                        },
                        {
                            text: "Passa a concentrar o investimento em prevenir a entrada",
                            isCorrect: false,
                        },
                        {
                            text: "Passa a exigir seguro contra incidente cibernético",
                            isCorrect: false,
                        },
                        {
                            text: "Passa a tratar todo alerta recebido como incidente real",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são as duas consequências diretas de assumir a violação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Segmentação, para o alcance, e detecção, para o tempo",
                            isCorrect: true,
                        },
                        {
                            text: "Cifra em repouso e registro completo de toda a operação",
                            isCorrect: false,
                        },
                        {
                            text: "Correção acelerada e revisão periódica das permissões",
                            isCorrect: false,
                        },
                        {
                            text: "Seguro cibernético e plano de continuidade do negócio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que detecção rápida sem resposta preparada rende pouco?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Perceber sem conseguir cortar não reduz o estrago",
                            isCorrect: true,
                        },
                        {
                            text: "O alerta perde validade depois de algumas horas",
                            isCorrect: false,
                        },
                        {
                            text: "A detecção deixa de funcionar sem plano formal",
                            isCorrect: false,
                        },
                        {
                            text: "O registro é descartado antes de alguém analisar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa reduzir o raio de explosão de um componente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Limitar o que o comprometimento dele consegue alcançar",
                            isCorrect: true,
                        },
                        {
                            text: "Reduzir a quantidade de recursos criados naquela conta",
                            isCorrect: false,
                        },
                        {
                            text: "Diminuir o tempo de indisponibilidade em caso de falha",
                            isCorrect: false,
                        },
                        {
                            text: "Restringir a região em que aquele componente executa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Assumindo a violação, que critério define melhor o que vale a pena detectar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Os movimentos que o atacante não consegue evitar fazer",
                            isCorrect: true,
                        },
                        {
                            text: "Os eventos com maior volume nos registros disponíveis",
                            isCorrect: false,
                        },
                        {
                            text: "As técnicas mais citadas nos relatórios do último ano",
                            isCorrect: false,
                        },
                        {
                            text: "Os alertas que a ferramenta classifica como críticos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Um caminho de adoção que cabe na empresa real",
            blocks: [
                {
                    type: "text",
                    value: "# Ninguém para a operação para virar zero trust\n\nO jeito errado de adotar é conhecido: um programa grande, com plano de dois anos, compra volumosa no começo e uma promessa de transformação. Ele falha por um motivo estrutural, não por má execução. Ambientes reais têm sistema antigo que não federa, integração que ninguém sabe como funciona, fornecedor com acesso herdado e um time que já está ocupado. Um plano que exige que tudo isso seja resolvido antes de entregar valor não sobrevive à primeira reprioritização.\n\nO caminho que funciona é incremental e por domínio. Escolhe-se uma melhoria mensurável de cada vez, numa ordem em que cada passo entrega valor sozinho e prepara o terreno para o próximo. A sequência que mais vezes vi dar certo começa por colocar a identidade em ordem, porque todo o resto depende dela: diretório único como fonte de verdade, fator resistente a phishing primeiro para quem administra e depois para todo mundo, e fim das contas compartilhadas.\n\nDepois vem inventário de dispositivo e de aplicação, porque não dá para escrever política sobre o que não se conhece. Só então entra verificação forte nas aplicações de maior impacto, seguida de redução da rede plana onde ela mais dói, de privilégio mínimo com elevação sob demanda na administração, de telemetria e detecção, e por fim da extensão de tudo isso a terceiros e a identidades de máquina, que é a parte mais trabalhosa e por isso vem quando o time já sabe o que está fazendo.",
                },
                {
                    type: "table",
                    value: '[["Fase","O que ela entrega","Sinal de que dá para avançar"],["Identidade em ordem","Fonte única e fator forte","Administração sem senha isolada"],["Inventário","Dispositivo e aplicação conhecidos","Lista confiável e atualizada sozinha"],["Verificação forte no topo","Política nas aplicações críticas","Poucas exceções e todas com prazo"],["Fim da rede plana","Alcance lateral reduzido","Carga sem saída livre para a internet"],["Elevação sob demanda","Privilégio permanente perto de zero","Elevação vira evento raro e nominal"],["Telemetria e detecção","Visibilidade dos movimentos-chave","Alerta com dono e tempo de resposta"]]',
                },
                {
                    type: "quote",
                    value: "Cada passo da adoção deveria remover uma dor visível de alguém. Programa que só acrescenta fricção consome capital político até parar.",
                },
                {
                    type: "text",
                    value: "## Como medir sem inventar métrica bonita\n\nDesconfie de percentual de maturidade calculado a partir de questionário de fornecedor. Ele sobe conforme você compra, o que explica a popularidade. As métricas úteis são contáveis, se movem com trabalho real e podem ser conferidas por quem quiser: proporção de autenticações feitas com fator resistente a phishing, quantidade de privilégios administrativos permanentes ainda existentes, tempo mediano entre o desligamento de uma pessoa e a revogação efetiva do acesso dela.\n\nDo lado da carga de trabalho vale medir a proporção de aplicações críticas atrás de política condicional, a proporção de cargas sem saída direta para a internet, a quantidade de credenciais estáticas de longa vida ainda em uso e o tempo entre uma elevação de privilégio e a chegada desse evento ao monitoramento. Nenhuma delas depende de opinião, e todas contam uma história que a liderança entende sem tradução.\n\nUm detalhe de método que evita frustração: escolha três ou quatro métricas e mantenha as mesmas por dois anos. Trocar de indicador a cada semestre é a forma mais confiável de nunca conseguir mostrar progresso, porque a série histórica nunca se forma. E progresso demonstrável é o que financia a fase seguinte.",
                },
                {
                    type: "text",
                    value: "## O que não pode parar por causa disso\n\nZero trust não substitui o feijão com arroz, e vale repetir isso na cara da moda. Corrigir o que está exposto na internet continua sendo prioridade. Cópia de segurança que restaura de verdade, testada, continua sendo o que decide se um ataque de resgate é um dia ruim ou o fim da empresa. Registro que existe e é retido continua sendo a diferença entre investigar e adivinhar. Uma organização que migrou o acesso para um modelo condicional elegante e não consegue restaurar um banco não ficou mais segura.\n\nA outra armadilha é acreditar que a dificuldade é técnica. Na esmagadora maioria dos casos, a adoção emperra por fricção com as pessoas, não por limitação de produto. Por isso a regra política mais valiosa é que cada passo remova uma dor visível de alguém: acabar com a rede privada virtual lenta, reduzir a quantidade de senhas, encurtar a espera por um acesso legítimo. Programa que só adiciona obstáculo consome capital político até parar, mesmo estando tecnicamente certo.\n\nPor fim, aceite que vai sobrar coisa. Sempre existe o sistema de 2009 que não federa, o equipamento industrial que não aceita política, o fornecedor que não muda. O tratamento correto para esses casos não é fingir que estão resolvidos nem travar o programa esperando por eles: é isolar, registrar como risco aceito com dono e data, e monitorar com mais atenção justamente por serem a exceção. Uma arquitetura madura sabe apontar suas próprias bordas mal resolvidas, e essa honestidade vale mais do que qualquer declaração de conformidade.",
                },
            ],
            questions: [
                {
                    statement: "Por que um programa grande e único de zero trust costuma falhar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Exige resolver tudo antes de entregar qualquer valor",
                            isCorrect: true,
                        },
                        {
                            text: "Depende de produtos que ainda não existem no mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Contraria as recomendações publicadas pelos órgãos",
                            isCorrect: false,
                        },
                        {
                            text: "Precisa de aprovação regulatória antes de começar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por onde começar uma adoção incremental de zero trust?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Colocar a identidade em ordem, base para o resto",
                            isCorrect: true,
                        },
                        {
                            text: "Segmentar toda a rede interna antes de qualquer coisa",
                            isCorrect: false,
                        },
                        {
                            text: "Implantar detecção contínua em todos os ambientes",
                            isCorrect: false,
                        },
                        {
                            text: "Migrar as aplicações antigas para o novo provedor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual métrica de progresso é confiável para acompanhar a adoção?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quantidade de privilégios administrativos permanentes",
                            isCorrect: true,
                        },
                        {
                            text: "Percentual de maturidade do questionário do fornecedor",
                            isCorrect: false,
                        },
                        {
                            text: "Número de produtos de segurança instalados no ano",
                            isCorrect: false,
                        },
                        {
                            text: "Quantidade de políticas condicionais já publicadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que não pode ser abandonado enquanto a empresa adota zero trust?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Correção do que está exposto e backup que restaura",
                            isCorrect: true,
                        },
                        {
                            text: "Renovação anual das certificações de conformidade",
                            isCorrect: false,
                        },
                        {
                            text: "Inspeção do tráfego interno no firewall de borda",
                            isCorrect: false,
                        },
                        {
                            text: "Treinamento obrigatório de segurança para todos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Existe um sistema antigo que não federa e não aceita política condicional. Qual é o tratamento profissional?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Isolar, registrar como risco com dono e vigiar de perto",
                            isCorrect: true,
                        },
                        {
                            text: "Segurar o programa até o sistema poder ser substituído",
                            isCorrect: false,
                        },
                        {
                            text: "Declarar conformidade parcial e seguir sem tratar o caso",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar a política mesmo assim e absorver a parada dele",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Detecção e resposta em nuvem",
    aulas: [
        {
            titulo: "Quais registros importam, e por que o do plano de controle",
            blocks: [
                {
                    type: "text",
                    value: "# O registro mais valioso é o das chamadas administrativas\n\nEm nuvem existem três famílias de registro que respondem perguntas diferentes. O plano de controle guarda quem chamou qual operação administrativa, quando, de onde, com qual identidade e com qual resultado. O plano de dados guarda quem leu qual objeto, qual consulta rodou, qual mensagem foi consumida. E existe o registro de dentro da carga de trabalho, do sistema operacional e da aplicação, que é o que a gente já conhecia do mundo antigo.\n\nA primeira dessas famílias é a que mais importa, e a razão é estrutural: absolutamente tudo o que acontece em nuvem passa por ali. Criar máquina, alterar política, ler um segredo, exportar um instantâneo de disco, adicionar uma confiança no diretório, desligar o próprio registro de auditoria. É nominal, é centralizado e não tem como o adversário desviar dele enquanto age por credencial, porque a interface de programação é o único jeito de mexer no ambiente.\n\nO cenário que torna isso óbvio é o do atacante que roubou uma credencial e nunca encosta numa máquina. Ele chama a interface do provedor, lista os recursos, encontra um banco interessante, cria um instantâneo do disco, compartilha esse instantâneo com uma conta dele e vai embora. Nenhum registro de sistema operacional viu nada, porque nada aconteceu dentro de servidor nenhum. O plano de controle viu tudo, passo a passo, com nome e horário. Quem não coleta essa família fica cego exatamente no ataque mais comum de nuvem.",
                },
                {
                    type: "table",
                    value: '[["Família de registro","Pergunta que ela responde","O que se perde sem ela"],["Plano de controle","Quem chamou qual operação e quando","Toda ação feita por credencial roubada"],["Plano de dados","Quem leu ou gravou qual objeto","Se o dado exposto foi mesmo lido"],["Autenticação","Como e de onde cada sessão nasceu","Comprometimento de identidade inteiro"],["Rede em nuvem","Que fluxos existiram entre cargas","Movimentação lateral e exfiltração"],["Sistema e aplicação","O que ocorreu dentro da carga","Detalhe da execução no host afetado"]]',
                },
                {
                    type: "quote",
                    value: "O invasor que age por credencial nunca encosta num servidor. Quem só coleta registro de sistema operacional fica cego no ataque mais comum de nuvem.",
                },
                {
                    type: "text",
                    value: "## Onde a coleta costuma estar furada\n\nO furo mais comum é regional. O registro do plano de controle está ligado na região onde a empresa trabalha e desligado nas outras, que é justamente onde o adversário prefere operar, exatamente porque ninguém olha. A regra correta é ligar em todas as regiões e em todas as contas, incluindo as que a empresa não usa e as que ninguém lembra que existem. O custo de registrar uma região sem atividade é praticamente nulo, e o benefício é enorme.\n\nO segundo furo é o destino. Muita gente grava o registro de auditoria num repositório dentro da mesma conta que está sendo auditada, com as mesmas permissões administrativas. Isso significa que a primeira coisa que um invasor com privilégio faz, apagar o rastro, funciona. O destino precisa ser uma conta separada, de escrita apenas, com trava de retenção e sem permissão de exclusão para ninguém do ambiente auditado, nem para o administrador.\n\nO terceiro é o plano de dados, que costuma vir desligado por padrão porque tem custo por evento. Ligar leitura de objeto em tudo pode ser caro, mas ligar nos repositórios que contêm dado pessoal ou segredo é obrigatório. É essa fonte que responde a pergunta que aparece em todo incidente de exposição: alguém realmente leu, ou o conteúdo só esteve acessível? Sem ela, a resposta honesta é que não se sabe, e do ponto de vista de comunicação legal isso costuma ser tratado como se tivessem lido.",
                },
                {
                    type: "text",
                    value: "## O que olhar primeiro num evento do plano de controle\n\nOs campos que interessam são poucos e sempre os mesmos. A identidade que executou e o tipo dela, porque conta de serviço agindo como pessoa e pessoa agindo como conta de serviço são anomalias por si só. A origem, endereço e agente de cliente, porque uma ferramenta de linha de comando chamando uma operação que só o painel costuma chamar diz muita coisa. A ação e o recurso alvo. E o resultado, sucesso ou negado.\n\nEventos negados são ouro e quase sempre subaproveitados. Sucesso mostra o que a identidade podia fazer; negação mostra o que ela tentou fazer e não podia, que é a informação mais próxima de intenção que existe num registro. Uma sequência de negações de uma conta de serviço que nunca errou é um dos sinais mais limpos que a nuvem oferece, e ele custa nada para monitorar.\n\nOutro padrão vale conhecer: quem acabou de conseguir uma credencial não sabe onde está. A primeira coisa que faz é enumerar, chamando operações de listagem e descrição em vários serviços em pouco tempo. Uma rajada de chamadas de leitura ampla vinda de uma identidade que normalmente faz três tipos de chamada é um sinal precoce muito bom, e chega antes de qualquer estrago. Detectar reconhecimento é sempre mais barato do que detectar exfiltração.",
                },
            ],
            questions: [
                {
                    statement: "Por que o registro do plano de controle é o mais valioso em nuvem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Toda ação administrativa do ambiente passa por ele",
                            isCorrect: true,
                        },
                        {
                            text: "Ele guarda o conteúdo dos objetos que foram lidos",
                            isCorrect: false,
                        },
                        {
                            text: "Ele é o único registro cifrado em repouso por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Ele é gerado dentro de cada carga de trabalho ativa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que ligar o registro de auditoria em regiões não utilizadas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É onde o adversário prefere agir, por ninguém olhar",
                            isCorrect: true,
                        },
                        {
                            text: "É exigência contratual de todos os grandes provedores",
                            isCorrect: false,
                        },
                        {
                            text: "É onde a réplica do registro principal fica guardada",
                            isCorrect: false,
                        },
                        {
                            text: "É a única forma de manter o horário sincronizado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde o registro de auditoria deve ser gravado?",
                    difficulty: "medio",
                    options: [
                        { text: "Em conta separada, sem permissão de exclusão", isCorrect: true },
                        {
                            text: "Na mesma conta, com cifra por chave do cliente",
                            isCorrect: false,
                        },
                        {
                            text: "No sistema de arquivos de cada carga de trabalho",
                            isCorrect: false,
                        },
                        {
                            text: "Em armazenamento de acesso frio desde o início",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um repositório com dado pessoal ficou exposto. Que registro responde se alguém leu o conteúdo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O do plano de dados, com leitura de objeto ligada",
                            isCorrect: true,
                        },
                        {
                            text: "O do plano de controle, com as chamadas de política",
                            isCorrect: false,
                        },
                        {
                            text: "O de autenticação, com as sessões daquele período",
                            isCorrect: false,
                        },
                        {
                            text: "O de rede, com os fluxos de saída daquela sub-rede",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma identidade que sempre fez três tipos de chamada dispara dezenas de listagens em serviços variados. O que isso sugere?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Reconhecimento de quem acabou de obter a credencial",
                            isCorrect: true,
                        },
                        {
                            text: "Exfiltração em andamento de dado já localizado antes",
                            isCorrect: false,
                        },
                        {
                            text: "Falha da automação repetindo a mesma chamada em laço",
                            isCorrect: false,
                        },
                        {
                            text: "Rotação de credencial executada pelo próprio provedor",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Sinais de comprometimento de identidade",
            blocks: [
                {
                    type: "text",
                    value: "# Sem malware para achar, o sinal está no comportamento da conta\n\nBoa parte das intrusões em nuvem não deixa binário nenhum para uma ferramenta encontrar. Não há arquivo suspeito, não há processo estranho, não há assinatura para casar. O que existe é uma conta legítima fazendo coisas que aquela conta normalmente não faz. Isso desloca a detecção do artefato para o comportamento, e é uma mudança de mentalidade que custa um pouco para quem veio do mundo de antivírus.\n\nOs sinais que mais aparecem são poucos e vale conhecê-los de cor. Autenticação a partir de geografia inédita ou com deslocamento impossível entre dois acessos. Registro de um novo método de segundo fator numa conta existente, que é como o invasor garante que continua entrando. Criação de chave de acesso por uma identidade que nunca criou chave. Regra nova de encaminhamento de mensagens na caixa de e-mail, clássico de fraude financeira. Uso de um serviço que aquela conta nunca tocou. E consentimento concedido a uma aplicação desconhecida.\n\nEsse último merece atenção porque engana gente experiente. No golpe de consentimento, a vítima não entrega a senha: ela autoriza uma aplicação, com aparência legítima, a ler a caixa de mensagens dela em nome dela, de forma permanente. Segundo fator não impede, porque a pessoa realmente autenticou. Trocar a senha não resolve, porque a autorização é independente da senha. A única coisa que corta é revogar aquele consentimento e remover a aplicação. Quem não conhece o padrão passa dias tratando o sintoma.",
                },
                {
                    type: "table",
                    value: '[["Sinal observado","O que ele costuma significar","Primeira ação recomendada"],["Novo método de segundo fator","Invasor garantindo o retorno","Remover método e revalidar dono"],["Chave de acesso recém-criada","Persistência por credencial estática","Desativar chave e ver o uso dela"],["Consentimento a app desconhecido","Leitura permanente autorizada","Revogar consentimento e remover app"],["Regra de encaminhamento nova","Preparo de fraude por e-mail","Remover regra e avisar a área"],["Sessão viva de origem inédita","Token de sessão possivelmente roubado","Revogar sessões e reautenticar"]]',
                },
                {
                    type: "quote",
                    value: "No golpe de consentimento a senha nunca vaza. Trocar a senha não resolve nada, porque a autorização concedida não depende dela.",
                },
                {
                    type: "text",
                    value: "## O que separa sinal de ruído\n\nTodos esses eventos acontecem legitimamente o tempo todo. Gente viaja, gente troca de celular e registra um fator novo, times criam chaves. Se você alertar em cada ocorrência isolada, produz uma enxurrada e treina o time a fechar alerta sem ler. O que transforma o mesmo evento em sinal é a linha de base daquela identidade específica: isto é novo para esta conta?\n\nO contraste ilustra bem. Um administrador de infraestrutura que sempre entra das mesmas duas redes, em horário comercial, aparecendo de madrugada por um provedor residencial de outro estado é um sinal forte. Uma pessoa de vendas que viaja toda semana, aparecendo de uma cidade nova, não é sinal nenhum. Mesmo evento, valor completamente diferente, e a diferença vem do contexto que você anexou à identidade: ela é privilegiada, é de serviço, é de terceiro, qual é o padrão dela.\n\nA segunda técnica que mais rende é encadear em vez de alertar por elo. Autenticação de origem nova, sozinha, é fraca. Autenticação de origem nova, seguida de registro de novo fator, seguida de criação de chave de acesso, seguida de listagem ampla de recursos, é uma história inteira e quase não tem falso positivo. Correlacionar essa cadeia custa trabalho de engenharia de detecção e devolve muito mais do que dobrar o número de regras isoladas.",
                },
                {
                    type: "text",
                    value: "## Resposta imediata, e a ordem importa\n\nDiante de uma conta provavelmente comprometida, a ordem correta começa por revogar sessões e tokens, e não por trocar a senha. Esse é o erro mais frequente e mais caro: a troca de senha não invalida sozinha um token de atualização já emitido, então o invasor continua entrando confortavelmente enquanto a equipe comemora a contenção. Revogue primeiro, redefina a credencial depois.\n\nDepois vem a limpeza do que o invasor plantou, e aqui a lista é fixa: métodos de segundo fator registrados no período, chaves de acesso criadas, aplicações consentidas, regras de caixa de mensagem, delegações concedidas a outras contas e qualquer permissão adicionada à identidade. Deixar um único desses itens de pé costuma significar reincidência em poucos dias, com a equipe convencida de que resolveu.\n\nSó então vem a pergunta do impacto: o que essa identidade acessou durante a janela. É aqui que o módulo anterior se paga, porque a resposta depende inteiramente de haver registro de plano de controle e de plano de dados retido por tempo suficiente. E vale fechar com o critério de encerramento: o caso não fecha porque parou de aparecer alerta; ele fecha quando existe uma lista completa do que foi criado ou alterado pelo invasor e a confirmação de que cada item foi tratado.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que a detecção de comprometimento de identidade foca em comportamento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Não há artefato para achar, apenas conta legítima agindo",
                            isCorrect: true,
                        },
                        {
                            text: "As ferramentas de antivírus não funcionam em nuvem pública",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor não disponibiliza o registro de autenticação",
                            isCorrect: false,
                        },
                        {
                            text: "O invasor sempre instala um programa dentro da máquina",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que trocar a senha não resolve um golpe de consentimento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A autorização concedida à aplicação independe da senha",
                            isCorrect: true,
                        },
                        {
                            text: "A aplicação guarda uma cópia da senha antiga do usuário",
                            isCorrect: false,
                        },
                        {
                            text: "O segundo fator continua registrado no dispositivo dele",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor leva horas para propagar a senha alterada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que faz um mesmo evento ser sinal para uma conta e ruído para outra?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A linha de base de comportamento daquela identidade",
                            isCorrect: true,
                        },
                        {
                            text: "O horário em que o evento foi registrado no sistema",
                            isCorrect: false,
                        },
                        {
                            text: "A região de nuvem onde a autenticação foi concluída",
                            isCorrect: false,
                        },
                        {
                            text: "O tipo de dispositivo usado para acessar o recurso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a primeira ação diante de uma conta provavelmente comprometida?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Revogar as sessões e os tokens já emitidos para ela",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar a senha e comunicar o usuário sobre o caso",
                            isCorrect: false,
                        },
                        {
                            text: "Bloquear a origem de rede usada no acesso suspeito",
                            isCorrect: false,
                        },
                        {
                            text: "Abrir um chamado formal e aguardar a análise do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma equipe trocou a senha e considerou o incidente resolvido, mas o acesso indevido continuou. Qual é a causa mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Token de atualização e fator plantado seguiram ativos",
                            isCorrect: true,
                        },
                        {
                            text: "A nova senha foi capturada pelo mesmo programa malicioso",
                            isCorrect: false,
                        },
                        {
                            text: "A propagação da senha entre regiões demorou algumas horas",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário reutilizou a mesma senha que já havia vazado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Persistência em nuvem é outra coisa",
            blocks: [
                {
                    type: "text",
                    value: "# Ela não mora na máquina, mora na configuração\n\nNo mundo de servidor, persistência é tarefa agendada, serviço instalado, chave de inicialização, módulo carregado no arranque. Todo o vocabulário de resposta a incidente foi construído em cima disso, e ele continua válido para a carga de trabalho. O problema é que um adversário que entende de nuvem não precisa de nada disso, porque existe um caminho muito mais confortável e muito mais difícil de remover.\n\nEsse caminho é a própria configuração do ambiente. Criar uma identidade nova com nome parecido com as legítimas. Adicionar uma chave de acesso a uma conta de serviço que já existe e que ninguém acompanha. Criar um papel cuja política de confiança aponta para uma conta externa controlada pelo invasor. Registrar uma aplicação no diretório com permissão permanente de leitura. Acrescentar um provedor de identidade federado, o que permite emitir identidade válida sem passar por senha alguma. Modificar um modelo de inicialização, de forma que toda máquina nova já nasça com o acesso plantado.\n\nA consequência prática merece ser dita com todas as letras, porque ela muda o roteiro de erradicação: persistência em nuvem sobrevive à reinstalação de todas as máquinas. Você pode destruir a frota inteira, recriar tudo do zero a partir do código e continuar com o invasor dentro, porque a relação de confiança que ele acrescentou no diretório não estava em máquina nenhuma. Resposta a incidente em nuvem que só limpa hospedeiro não erradica coisa alguma.",
                },
                {
                    type: "table",
                    value: '[["Mecanismo de persistência","Onde ele vive","Como se procura por ele"],["Identidade nova criada","No diretório ou no serviço de acesso","Contas criadas na janela do incidente"],["Chave em conta existente","Numa conta de serviço esquecida","Chaves criadas e nunca usadas antes"],["Papel com confiança externa","Na política de confiança do papel","Confianças que apontam para fora"],["Aplicação com consentimento","No registro de aplicações do diretório","Permissões amplas concedidas a apps"],["Federação acrescentada","Na configuração do diretório","Provedores de identidade confiáveis"],["Modelo de inicialização","Na definição usada pelas máquinas","Diferença entre o código e o real"]]',
                },
                {
                    type: "quote",
                    value: "Você pode destruir e recriar a frota inteira e continuar com o invasor dentro. A confiança que ele acrescentou no diretório não estava em máquina nenhuma.",
                },
                {
                    type: "text",
                    value: "## A caça muda de objeto\n\nComo a persistência vive na configuração, a caça deixa de procurar arquivos e passa a procurar mudanças. As duas fontes primárias são o registro do plano de controle na janela suspeita e a comparação da configuração atual com um estado conhecido como bom. As perguntas são objetivas e cabem numa lista: que identidades foram criadas, que chaves foram emitidas, que políticas de confiança mudaram, que aplicações receberam permissão, que provedores de federação existem e que políticas foram anexadas a quem.\n\nÉ aqui que a infraestrutura como código do módulo quatro devolve um benefício que quase nunca é citado na hora de justificar o investimento. Se o ambiente deveria estar inteiro descrito em código, então tudo o que existe e não está no código é suspeito por definição. A detecção de desvio, que nasceu como ferramenta de qualidade operacional, vira um detector de persistência de alta qualidade e de custo praticamente zero.\n\nUm cuidado de método: defina a janela antes de caçar. Sem uma hipótese de quando o acesso começou, você vai olhar mudanças de meses e afogar o time. E lembre que a janela costuma ser maior do que o primeiro indício sugere, porque o indício quase sempre é o momento em que o invasor fez algo barulhento, e não o momento em que ele entrou.",
                },
                {
                    type: "text",
                    value: "## Erradicar de verdade\n\nNão dá para declarar um caso encerrado por ter girado uma credencial. A erradicação em nuvem tem uma sequência própria: levantar todas as identidades e credenciais que existiam durante a janela, girar tudo o que poderia ter sido capturado, remover os artefatos criados pelo invasor, e depois fazer uma nova extração de configuração para confirmar que nada voltou. Essa confirmação final é o que separa a suposição da evidência.\n\nExiste um caso em que a conta fica mais dura e vale encarar de frente. Se o invasor teve, em algum momento, permissão de administrar acesso, ou seja, de criar e anexar política, você precisa assumir que a camada de identidade inteira está sob suspeita. Auditar item por item uma camada de identidade grande é lento, incerto e cansativo, e num ambiente já organizado em contas separadas e descrito em código costuma ser mais rápido e mais confiável reconstruir do que auditar.\n\nPor fim, uma decisão que precisa ser tomada com cabeça fria e antes da pressa: girar as credenciais avisa o adversário de que ele foi visto. Fazer isso cedo demais pode encerrar a coleta antes de você entender o alcance; fazer tarde demais dá mais tempo a ele. A prática comum é preparar a erradicação inteira em silêncio, com tudo mapeado, e executar de uma vez só. Erradicação em fatias é o que produz o incidente que volta no mês seguinte.",
                },
            ],
            questions: [
                {
                    statement: "Onde a persistência em ambientes de nuvem costuma se instalar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Na configuração de identidade e acesso do ambiente",
                            isCorrect: true,
                        },
                        {
                            text: "Na inicialização do sistema operacional das máquinas",
                            isCorrect: false,
                        },
                        {
                            text: "No cache do serviço de distribuição de conteúdo usado",
                            isCorrect: false,
                        },
                        {
                            text: "Nos registros de auditoria retidos pela organização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que recriar todas as máquinas pode não erradicar o invasor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A confiança plantada no diretório não vive em máquina",
                            isCorrect: true,
                        },
                        {
                            text: "As imagens novas herdam o mesmo malware do repositório",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor mantém instantâneos das máquinas antigas",
                            isCorrect: false,
                        },
                        {
                            text: "O invasor volta pela mesma falha ainda não corrigida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são as fontes primárias para caçar persistência em nuvem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Plano de controle na janela e desvio da configuração",
                            isCorrect: true,
                        },
                        {
                            text: "Registro do sistema operacional de cada carga ativa",
                            isCorrect: false,
                        },
                        {
                            text: "Captura de pacotes na saída para a internet pública",
                            isCorrect: false,
                        },
                        {
                            text: "Varredura de arquivos nas imagens de contêiner usadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que benefício de detecção a infraestrutura como código entrega de graça?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O que existe e não está no código passa a ser suspeito",
                            isCorrect: true,
                        },
                        {
                            text: "As mudanças manuais deixam de ser possíveis no ambiente",
                            isCorrect: false,
                        },
                        {
                            text: "O registro de auditoria passa a incluir o autor da mudança",
                            isCorrect: false,
                        },
                        {
                            text: "As permissões concedidas são revisadas a cada implantação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O invasor teve permissão de criar e anexar política durante a janela. Como isso muda a erradicação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A camada de identidade inteira passa a estar sob suspeita",
                            isCorrect: true,
                        },
                        {
                            text: "Basta girar as credenciais das contas efetivamente usadas",
                            isCorrect: false,
                        },
                        {
                            text: "A remoção dos artefatos criados encerra o caso com folga",
                            isCorrect: false,
                        },
                        {
                            text: "O foco passa para as máquinas alcançadas naquele período",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Resposta a incidente em ambiente elástico",
            blocks: [
                {
                    type: "text",
                    value: "# A máquina do incidente pode não existir amanhã\n\nA perícia clássica pressupõe uma coisa simples: existe um computador, ele está lá, e você pode ir até ele. Em nuvem esse pressuposto some. A instância comprometida às duas da tarde foi encerrada às três por uma política de escala automática. O contêiner que rodou o processo suspeito viveu quarenta segundos. A função sem servidor não tem hospedeiro para inspecionar. Quando o alerta chega, o objeto do exame pode simplesmente ter deixado de existir.\n\nA primeira consequência é que a preservação precisa ser imediata e, de preferência, automática. Diante de uma máquina suspeita, o reflexo certo não é encerrá-la: é isolá-la. Tirar do balanceador para parar de receber tráfego, aplicar um grupo de segurança de quarentena que bloqueia tudo, manter ligada, tirar instantâneo do volume e capturar a memória se a plataforma permitir. E existe um passo que quase todo mundo esquece na primeira vez: suspender o grupo de escala, senão a própria automação encerra a evidência enquanto você trabalha.\n\nA segunda consequência é que, como a carga é descartável, a telemetria precisa sair dela enquanto ela vive. Registro que fica no disco de uma instância efêmera morre com ela. Enviar em tempo real para fora deixa de ser refinamento de arquitetura e vira requisito de investigação. Vale a compensação honesta: a nuvem tira a máquina do lugar e devolve coisas que datacenter nenhum dava, como instantâneo completo em segundos, cópia idêntica em uma conta isolada de análise e o histórico inteiro de chamadas administrativas.",
                },
                {
                    type: "table",
                    value: '[["Passo da resposta","Como era no mundo clássico","O que muda em nuvem"],["Identificar o afetado","Máquina física ou virtual fixa","Instância que pode já ter sumido"],["Preservar evidência","Imagem de disco no local","Instantâneo e cópia em conta isolada"],["Conter","Desconectar o cabo de rede","Quarentena e escala suspensa"],["Erradicar","Limpar o hospedeiro afetado","Também a configuração e a identidade"],["Recuperar","Restaurar o mesmo servidor","Recriar a partir do código e girar tudo"]]',
                },
                {
                    type: "quote",
                    value: "Diante de uma máquina suspeita, o reflexo certo não é encerrar. É isolar, preservar e só então agir, com a escala automática suspensa.",
                },
                {
                    type: "text",
                    value: "## Conter sem destruir a evidência\n\nExiste uma tensão real em todo incidente e ela não some com boa vontade. O negócio quer que aquilo pare agora, e a investigação quer preservar para entender o que aconteceu. As duas demandas são legítimas, e o que as concilia é a ordem: isolar primeiro, preservar em seguida, agir por último. Isolar dá ao negócio quase tudo o que ele quer, porque o dano para, e mantém intacto quase tudo o que a investigação precisa.\n\nA contenção em nuvem tem uma dimensão de identidade que costuma ser esquecida no calor do momento. Isolar a máquina na rede e deixar a credencial que aquela máquina usava continuar funcionando não contém nada, porque a credencial já foi copiada e funciona de qualquer lugar do mundo. Conter uma carga comprometida significa isolar a rede dela e, ao mesmo tempo, revogar as sessões do papel que ela assumia e girar os segredos que ela tinha em mãos.\n\nHá também o efeito colateral do plano de controle sobre o qual vale pensar antes. Uma ação de contenção agressiva pode encerrar processos legítimos de negócio, e no meio da noite ninguém quer descobrir isso pela reclamação de um cliente. Ter mapeado previamente o que cada carga crítica sustenta transforma uma decisão de risco numa decisão informada, e é um trabalho que só dá para fazer com calma, meses antes.",
                },
                {
                    type: "text",
                    value: "## O que precisa estar pronto antes\n\nA lista é curta e faz uma diferença enorme na primeira vez que for usada. Uma conta isolada de análise, já criada, com acesso aprovado, onde os instantâneos podem ser copiados sem contaminar o ambiente produtivo. Um grupo de segurança de quarentena já existente, porque criar regra sob pressão é como se erra. Um procedimento escrito de suspensão de escala. E papéis de resposta já provisionados para as pessoas que vão responder.\n\nEsse último item merece um parágrafo próprio. Criar permissões durante um incidente é ruim por dois motivos: você está mexendo na camada de identidade que talvez esteja comprometida, e está fazendo isso com pressa, que é como se concede privilégio demais. Papéis de resposta pré-criados, com elevação sob demanda e registro reforçado, resolvem os dois problemas. Vale também combinar um canal de comunicação fora da infraestrutura afetada, porque discutir a resposta a um incidente na ferramenta corporativa que pode estar sendo lida pelo adversário é um erro repetido com frequência.\n\nE exercite. A primeira vez que alguém do time tira um instantâneo para fins de evidência não pode ser durante um incidente real. Um exercício de mesa de duas horas por semestre, seguido de uma execução técnica pequena de verdade, revela as coisas que nenhum documento revela: que a permissão não existia, que o procedimento cita um sistema desativado, que ninguém sabe quem aprova a suspensão de escala às três da manhã.",
                },
            ],
            questions: [
                {
                    statement: "Por que a perícia clássica não se aplica diretamente em nuvem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A carga afetada pode ter deixado de existir antes",
                            isCorrect: true,
                        },
                        {
                            text: "O provedor proíbe qualquer coleta de evidência local",
                            isCorrect: false,
                        },
                        {
                            text: "Os discos em nuvem não permitem cópia bit a bit",
                            isCorrect: false,
                        },
                        {
                            text: "A cifra em repouso impede a leitura do instantâneo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o reflexo correto diante de uma instância suspeita?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Isolar e preservar, mantendo a instância em execução",
                            isCorrect: true,
                        },
                        {
                            text: "Encerrar a instância para interromper o dano em curso",
                            isCorrect: false,
                        },
                        {
                            text: "Reiniciar a instância a partir da imagem base original",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a escala para absorver a carga durante a análise",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que passo é fácil de esquecer ao isolar uma máquina em nuvem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Suspender a escala, que encerraria a evidência sozinha",
                            isCorrect: true,
                        },
                        {
                            text: "Desativar a cifra do volume para permitir a análise",
                            isCorrect: false,
                        },
                        {
                            text: "Migrar a instância para outra zona de disponibilidade",
                            isCorrect: false,
                        },
                        {
                            text: "Remover as etiquetas de identificação daquele recurso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma carga comprometida foi isolada na rede, mas o incidente continuou. Qual é a explicação mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A credencial que ela usava segue válida de qualquer lugar",
                            isCorrect: true,
                        },
                        {
                            text: "O grupo de quarentena permitia tráfego de saída cifrado",
                            isCorrect: false,
                        },
                        {
                            text: "O instantâneo do volume recriou a carga automaticamente",
                            isCorrect: false,
                        },
                        {
                            text: "A instância continuou registrada no balanceador de carga",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que provisionar antes os papéis usados na resposta a incidente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Criar permissão sob pressão concede privilégio demais",
                            isCorrect: true,
                        },
                        {
                            text: "O provedor demora horas para aplicar política nova",
                            isCorrect: false,
                        },
                        {
                            text: "A auditoria exige aprovação prévia de cada acesso",
                            isCorrect: false,
                        },
                        {
                            text: "Os papéis criados no incidente expiram muito rápido",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Custo e limites da coleta em nuvem",
            blocks: [
                {
                    type: "text",
                    value: "# Coletar tudo é uma decisão de orçamento, e ela tem consequência\n\nTelemetria em nuvem custa dinheiro em três pontos diferentes, e quem só olha um deles se surpreende na fatura. Custa na geração, porque alguns registros são cobrados por evento. Custa no armazenamento, que é o mais barato dos três. E custa principalmente na ingestão para a plataforma de análise, que costuma cobrar por volume recebido e é onde o orçamento evapora. O registro de plano de dados de um repositório movimentado consegue, sozinho, ser maior que todo o resto somado.\n\nDaí a decisão de engenharia que ninguém escapa de tomar: o que fica quente, pesquisável em segundos e caro; o que vai para frio, barato e lento de consultar; e o que simplesmente não se coleta. O formato que costuma funcionar é manter de trinta a noventa dias em quente e um ano ou mais em frio, e a razão é comportamental: a detecção acontece na janela recente, mas a investigação quase sempre precisa voltar meses depois que alguém encontrou algo.\n\nEsse ponto merece um número para ficar claro. Se o tempo mediano até detectar um comprometimento na sua empresa é de algumas semanas e a sua retenção pesquisável é de sete dias, você vai encontrar a ponta do fio e nunca a origem. Vai saber que foi invadido e não vai saber por onde, quando nem o que mais foi tocado. A retenção não é um número administrativo: é o que decide se a investigação termina com uma resposta ou com uma suposição.",
                },
                {
                    type: "table",
                    value: '[["Camada de retenção","Custo relativo","Para que ela serve"],["Fluxo em tempo real","Alto por volume ingerido","Alerta e correlação imediata"],["Quente pesquisável","Alto, cresce com o período","Investigação dos últimos meses"],["Frio arquivado","Baixo, mas lento de consultar","Reconstrução tardia e auditoria"],["Amostragem","Muito baixo","Tendência, nunca investigação"],["Não coletado","Zero e irreversível","Aquilo que a empresa aceitou não ver"]]',
                },
                {
                    type: "quote",
                    value: "Se você detecta em semanas e retém por sete dias, vai encontrar a ponta do fio e nunca a origem. Retenção não é número administrativo.",
                },
                {
                    type: "text",
                    value: "## O que a nuvem simplesmente não entrega\n\nAlgumas limitações são estruturais e é melhor conhecê-las antes de descobrir no meio de um incidente. O interior dos serviços gerenciados não é visível para você: quando a suspeita recai sobre o comportamento do próprio serviço, o caminho é abrir chamado com o provedor e depender do que ele investigar. Alguns registros chegam com latência de minutos, o que limita reação verdadeiramente imediata. Certos eventos não são registrados por nenhuma fonte disponível. Captura de pacote costuma ser limitada ou inexistente. E em execução sem servidor não existe hospedeiro para inspecionar depois.\n\nA leitura profissional disso não é lamentar, é desenhar a detecção sobre os sinais que existem, e não sobre os que seriam bons de ter. Quando alguma dessas ausências for realmente crítica para o seu risco, ela vira uma decisão de arquitetura ou de compra a ser tomada com antecedência, como manter aquela carga específica num modelo que dá mais visibilidade. Descobrir a lacuna durante o incidente é a pior hora possível, e é quando ela vira uma frase constrangedora no relatório.\n\nHá ainda um limite jurídico que aparece pouco em material técnico. Registro contém dado pessoal, e frequentemente bastante: endereço de origem, identificador de usuário, conteúdo de requisição. Isso significa que registro tem base legal, tem prazo de retenção que também é máximo e não só mínimo, tem restrição de acesso e entra na conta de residência que vimos no módulo um. Guardar tudo para sempre não é a resposta segura: é outro problema, de outra natureza.",
                },
                {
                    type: "text",
                    value: "## Como decidir de forma defensável\n\nExiste um método simples que sobrevive a qualquer conversa de orçamento. Primeiro, liste as detecções que você realmente quer ter, começando pelos movimentos inevitáveis do adversário que o módulo cinco descreveu. Segundo, para cada detecção, escreva qual registro é indispensável. Terceiro, mantenha exatamente essas fontes em camada quente. Quarto, mande o resto para frio ou não colete, com a decisão registrada. Os pisos de retenção vêm de regulação e de contrato, não de gosto pessoal.\n\nUma auditoria que quase sempre rende: descubra qual proporção do volume ingerido alimenta alguma regra de detecção ou já foi consultada em alguma investigação. Na maioria das empresas essa proporção assusta, com fontes caríssimas que entraram por inércia e nunca foram usadas para nada. Cortar essas fontes financia, sozinho, a retenção maior daquilo que de fato é usado, e é uma conversa muito melhor com a liderança do que pedir mais orçamento.\n\nPor fim, registre a decisão do que não é coletado. Uma lista curta e explícita do que a empresa escolheu não enxergar, com o motivo e o risco aceito, é sinal de maturidade e não de descuido. Ela permite revisar a escolha quando o contexto muda e evita a pior conversa possível depois de um incidente, aquela em que ninguém sabe dizer se a lacuna foi uma decisão consciente ou um esquecimento. E ela conecta com o próximo módulo, porque retenção, base legal e evidência são exatamente onde segurança e conformidade se encontram.",
                },
            ],
            questions: [
                {
                    statement: "Onde o custo de telemetria em nuvem costuma pesar mais?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Na ingestão do volume pela plataforma de análise",
                            isCorrect: true,
                        },
                        {
                            text: "No armazenamento de longo prazo em camada fria",
                            isCorrect: false,
                        },
                        {
                            text: "Na cifra aplicada aos registros durante o transporte",
                            isCorrect: false,
                        },
                        {
                            text: "Na replicação dos registros entre regiões distintas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que reter só sete dias de registro pesquisável compromete a investigação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A detecção costuma levar semanas, e a origem se perde",
                            isCorrect: true,
                        },
                        {
                            text: "O provedor exige retenção mínima de trinta dias",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta em camada fria não retorna o mesmo dado",
                            isCorrect: false,
                        },
                        {
                            text: "O registro é sobrescrito e perde a ordem cronológica",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual limitação estrutural a nuvem impõe à investigação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O interior dos serviços gerenciados não é visível",
                            isCorrect: true,
                        },
                        {
                            text: "O registro do plano de controle não pode ser exportado",
                            isCorrect: false,
                        },
                        {
                            text: "Os instantâneos de volume não podem ser copiados",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor não informa a origem das autenticações",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que guardar todo registro para sempre não é a escolha segura?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Registro contém dado pessoal e tem prazo também máximo",
                            isCorrect: true,
                        },
                        {
                            text: "O provedor limita o volume total que pode ser retido",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta fica lenta demais em bases muito extensas",
                            isCorrect: false,
                        },
                        {
                            text: "A cifra em repouso expira junto com a chave utilizada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que auditoria costuma liberar orçamento para aumentar a retenção do que importa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ver quanto do volume ingerido nunca alimentou detecção",
                            isCorrect: true,
                        },
                        {
                            text: "Comparar o preço por evento entre provedores de nuvem",
                            isCorrect: false,
                        },
                        {
                            text: "Medir o tempo médio de consulta na camada pesquisável",
                            isCorrect: false,
                        },
                        {
                            text: "Levantar quantas regras de detecção estão hoje ativas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Conformidade e o fechamento",
    aulas: [
        {
            titulo: "LGPD para quem opera",
            blocks: [
                {
                    type: "text",
                    value: "# A lei chega na mesa de quem opera, não só na do jurídico\n\nA Lei Geral de Proteção de Dados regula o tratamento de dado pessoal e define papéis que vale saber de cor, porque eles aparecem em toda conversa contratual. O titular é a pessoa a quem o dado se refere. O controlador é quem decide a finalidade e os meios do tratamento, e normalmente é a sua empresa. O operador trata em nome do controlador, e é onde o provedor de nuvem costuma se encaixar. O encarregado é o canal de comunicação com titulares e com a autoridade.\n\nA parte que efetivamente cai sobre a equipe técnica é mais concreta do que o vocabulário sugere. Minimização significa não coletar nem replicar o que não é necessário, o que colide de frente com o hábito confortável de copiar a base de produção inteira para o ambiente de desenvolvimento. Segurança do tratamento significa medidas técnicas e administrativas aptas a proteger, que é exatamente o conteúdo dos seis módulos anteriores. Atender direito de titular exige saber onde o dado está. Eliminar ao fim do tratamento exige saber onde estão todas as cópias.\n\nO exemplo que mais rápido converte discussão jurídica em tarefa de engenharia é o dado de produção em ambiente de teste. É comum, é prático, é quase sempre indefensável e costuma ser o primeiro achado de qualquer avaliação séria. A resposta técnica existe e é conhecida: anonimizar de verdade, gerar dado sintético ou usar um subconjunto mascarado. Nenhuma dessas opções é difícil; elas apenas nunca são prioridade até alguém apontar o problema com o nome certo.",
                },
                {
                    type: "table",
                    value: '[["Obrigação da lei","O que ela exige de quem opera","Onde costuma falhar"],["Minimização","Coletar e copiar só o necessário","Base de produção no ambiente de teste"],["Segurança do tratamento","Medidas técnicas e administrativas","Controle existe, mas sem evidência"],["Direito do titular","Localizar, corrigir e eliminar dado","Ninguém sabe onde estão as cópias"],["Registro do tratamento","Saber o que trata e com que base","Documento desatualizado há dois anos"],["Comunicação de incidente","Informar autoridade e titulares","Falta saber o que foi de fato acessado"]]',
                },
                {
                    type: "quote",
                    value: "Dado de produção em ambiente de teste é o achado mais comum e o mais difícil de defender. A solução técnica é fácil; o que falta é alguém chamar pelo nome.",
                },
                {
                    type: "text",
                    value: "## O direito do titular vira problema de arquitetura\n\nQuando chega o primeiro pedido de exclusão, a empresa descobre o mapa real dos seus dados, e a descoberta costuma ser desconfortável. Apagar um cadastro exige saber onde ele está: na base principal, nas réplicas, nas cópias de segurança, nos registros de aplicação, no armazém analítico, naquela ferramenta contratada por outra área para a qual alguém exportou uma planilha, e no relatório que roda todo mês por e-mail. Sem mapa de dado e classificação, o atendimento vira arqueologia.\n\nA cópia de segurança merece a resposta honesta, porque ela aparece em toda discussão e quase ninguém a enuncia direito. Não é razoável restaurar meses de backup para apagar um registro, e a prática aceita é outra: documentar que a exclusão no acervo de cópias ocorre no ciclo natural de expiração daquelas cópias, e garantir que, se houver restauração, o dado excluído não retorne ao ambiente ativo. O que não se aceita é fingir que o backup não existe.\n\nA lição de arquitetura que fica é anterior a tudo isso. Sistema que guarda dado pessoal precisa nascer sabendo responder três perguntas: onde este dado vive, por quanto tempo, e como ele sai daqui. Quem responde essas três no desenho paga barato. Quem deixa para responder depois vai pagar em trabalho manual, em prazo apertado e sob pressão de alguém que não estava lá quando a decisão foi tomada.",
                },
                {
                    type: "text",
                    value: "## Incidente e comunicação\n\nA lei determina que o controlador comunique à autoridade nacional e aos titulares o incidente de segurança que possa acarretar risco ou dano relevante. O texto original fala em prazo razoável, e a regulamentação da autoridade passou a fixar prazo curto, contado em dias úteis a partir do conhecimento do incidente, junto com o conteúdo mínimo que a comunicação precisa trazer. Na prática do time técnico isso significa que o relógio começa a correr no momento em que alguém percebe, e não quando a análise termina.\n\nEsse prazo transforma o módulo anterior em obrigação legal. Para comunicar com precisão é preciso saber que categorias de dado foram envolvidas, quantos titulares aproximadamente, o que já foi feito para conter e qual o risco para as pessoas. Cada uma dessas respostas depende de registro coletado, retido e pesquisável. A frase não sabemos o que foi acessado é tratada, na prática, como o pior cenário, e a empresa acaba comunicando mais amplamente do que precisaria se tivesse a evidência.\n\nVale ainda ajustar uma percepção comum: a multa não costuma ser o maior custo. O que dói de verdade é a interrupção operacional, a cascata de cláusulas contratuais com clientes corporativos que exigem notificação e auditoria, o tempo de liderança consumido por meses e o efeito comercial. Quem argumenta investimento em segurança apenas pelo valor da sanção está usando o argumento mais fraco que tem à mão.",
                },
            ],
            questions: [
                {
                    statement: "Na LGPD, o que caracteriza o papel do controlador?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Decide a finalidade e os meios do tratamento do dado",
                            isCorrect: true,
                        },
                        {
                            text: "Trata o dado pessoal em nome de outra organização",
                            isCorrect: false,
                        },
                        {
                            text: "Atua como canal entre a empresa e os titulares",
                            isCorrect: false,
                        },
                        { text: "Fiscaliza o cumprimento da lei pelas empresas", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual prática comum de engenharia colide diretamente com a minimização?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Copiar a base de produção para o ambiente de teste",
                            isCorrect: true,
                        },
                        {
                            text: "Manter réplica de leitura na mesma região do primário",
                            isCorrect: false,
                        },
                        {
                            text: "Reter registro de auditoria por mais de um ano inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Cifrar o dado em repouso com chave gerida pelo cliente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como tratar o pedido de exclusão quando o dado também está em backup?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Documentar a exclusão no ciclo de expiração das cópias",
                            isCorrect: true,
                        },
                        {
                            text: "Restaurar cada cópia de segurança e apagar o registro",
                            isCorrect: false,
                        },
                        {
                            text: "Excluir apenas na base ativa e encerrar o atendimento",
                            isCorrect: false,
                        },
                        {
                            text: "Cifrar as cópias antigas com uma chave depois destruída",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a obrigação de comunicar incidente exige do time técnico?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Saber que dado foi envolvido e quantos titulares",
                            isCorrect: true,
                        },
                        {
                            text: "Ter certificação de conformidade emitida por auditor",
                            isCorrect: false,
                        },
                        {
                            text: "Manter seguro cibernético contratado e vigente",
                            isCorrect: false,
                        },
                        {
                            text: "Provar que o controle falho já estava mapeado antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que argumentar investimento em segurança apenas pelo valor da multa é fraco?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O custo maior é operacional, contratual e comercial",
                            isCorrect: true,
                        },
                        {
                            text: "A autoridade raramente aplica sanção a empresa privada",
                            isCorrect: false,
                        },
                        {
                            text: "A multa é limitada a um percentual pequeno do faturamento",
                            isCorrect: false,
                        },
                        {
                            text: "O seguro cibernético costuma cobrir integralmente a sanção",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Frameworks e controles como mapa, não como fim",
            blocks: [
                {
                    type: "text",
                    value: "# Referencial é mapa, e mapa não é o lugar\n\nExistem alguns referenciais abertos que valem conhecer, cada um bom para uma coisa diferente. O referencial de segurança cibernética do NIST organiza o assunto em funções amplas, identificar, proteger, detectar, responder e recuperar, às quais a versão mais recente acrescentou governar. Ele é excelente como língua comum com a liderança, porque cabe num slide sem virar caricatura. Os controles do CIS são uma lista priorizada e muito prática, ótima para quem está começando e precisa saber o que fazer na segunda-feira.\n\nA norma ISO 27001 descreve um sistema de gestão e é certificável, o que a torna a escolha quando a exigência vem de contrato ou de cliente corporativo. O catálogo do NIST 800-53 é profundo e serve como referência detalhada de controle. O OWASP cobre o mundo de aplicação. E existem os setoriais, como o padrão de dados de cartão para quem processa pagamento, que são obrigatórios quando se aplicam e irrelevantes quando não.\n\nO uso errado é sempre o mesmo: tratar o referencial como lista de tarefas a completar, comprar ferramentas que preenchem os itens da lista e declarar o ambiente conforme. O resultado é uma empresa que passa na avaliação e é derrubada por uma credencial vazada, porque a lista nunca soube que o ativo mais importante daquela empresa era um banco específico e que a maior exposição era um fornecedor. Conformidade prova que você fez o combinado; segurança é ter escolhido bem o que combinar.",
                },
                {
                    type: "table",
                    value: '[["Referencial","Para que ele serve melhor","Quando é má escolha"],["Funções do NIST","Língua comum com a liderança","Como plano tático detalhado"],["Controles do CIS","Priorizar o que fazer primeiro","Como resposta a exigência contratual"],["ISO 27001","Certificar a gestão perante clientes","Como primeiro passo de quem tem nada"],["Catálogo 800-53","Detalhar controle com profundidade","Em empresa pequena, vira burocracia"],["OWASP","Guiar segurança de aplicação","Para infraestrutura e identidade"],["Padrão setorial","Cumprir exigência do seu setor","Como base de todo o programa"]]',
                },
                {
                    type: "quote",
                    value: "Conformidade prova que você fez o combinado. Segurança é ter escolhido bem o que combinar. Os dois importam, e não são a mesma coisa.",
                },
                {
                    type: "text",
                    value: "## Como usar isso de verdade\n\nO padrão que funciona na maioria das empresas é escolher um referencial como espinha dorsal e não colecionar três. Uma combinação frequente é usar as funções amplas como vocabulário para conversar com a diretoria e a lista priorizada como ordem de execução para o time. Mapeie os seus controles contra esse referencial uma vez, com honestidade, e mantenha o mapa vivo em vez de refazê-lo a cada demanda.\n\nO retorno aparece em três lugares. O primeiro é encontrar lacuna: quando você marca o que existe, o buraco fica visível sem discussão. O segundo é responder questionário de cliente, que hoje é uma atividade constante em qualquer empresa que venda para outras empresas, e que sem mapa consome semanas de gente cara todo trimestre. O terceiro é orçamento: dizer que a capacidade de detectar está bem atrás da de proteger é um argumento que viaja bem numa reunião de diretoria, muito melhor do que uma explicação técnica correta e intraduzível.\n\nO limite também precisa ser dito. Referencial nenhum conhece o seu risco. Ele não sabe que a joia da coroa é uma base específica, que o time de dados exporta tudo para um armazém sem controle, que o fornecedor de folha tem acesso permanente. Quem conecta o mapa ao território é a avaliação de risco, e é ela que transforma uma lista genérica num plano seu. Sem esse passo, o resultado previsível é implantar cem controles medianos para preencher caixas em vez de dez controles excelentes onde o risco realmente mora.",
                },
            ],
            questions: [
                {
                    statement:
                        "Para que serve melhor um referencial de funções amplas de segurança?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Criar língua comum entre a técnica e a liderança",
                            isCorrect: true,
                        },
                        {
                            text: "Detalhar a configuração de cada controle técnico",
                            isCorrect: false,
                        },
                        {
                            text: "Certificar a empresa perante clientes corporativos",
                            isCorrect: false,
                        },
                        { text: "Definir a ordem exata de execução das tarefas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a diferença entre conformidade e segurança?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Conformidade prova o combinado; segurança escolhe bem",
                            isCorrect: true,
                        },
                        {
                            text: "Conformidade é técnica; segurança é responsabilidade legal",
                            isCorrect: false,
                        },
                        {
                            text: "Conformidade vale por um ano; segurança é permanente",
                            isCorrect: false,
                        },
                        {
                            text: "Conformidade cabe ao jurídico; segurança cabe ao time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o uso errado mais comum de um referencial de controles?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Tratá-lo como lista de tarefas a completar e declarar pronto",
                            isCorrect: true,
                        },
                        {
                            text: "Adaptá-lo ao contexto e deixar controles fora do escopo",
                            isCorrect: false,
                        },
                        {
                            text: "Combiná-lo com outro referencial para cobrir uma lacuna",
                            isCorrect: false,
                        },
                        {
                            text: "Usá-lo para responder questionário enviado por clientes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que transforma um referencial genérico num plano da sua empresa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A avaliação de risco, que liga o mapa ao território",
                            isCorrect: true,
                        },
                        {
                            text: "A certificação emitida por um auditor independente",
                            isCorrect: false,
                        },
                        {
                            text: "A ferramenta que mede a aderência a cada controle",
                            isCorrect: false,
                        },
                        {
                            text: "A política escrita e aprovada pela alta direção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa implantou cem controles medianos para preencher a lista. Qual é o problema disso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O esforço não foi onde o risco da empresa realmente está",
                            isCorrect: true,
                        },
                        {
                            text: "O referencial escolhido não era o adequado ao setor dela",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de controles inviabiliza a certificação anual",
                            isCorrect: false,
                        },
                        {
                            text: "A auditoria exige profundidade maior em cada um deles",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Auditoria e a evidência do dia a dia",
            blocks: [
                {
                    type: "text",
                    value: "# Evidência boa é subproduto do trabalho, não projeto de véspera\n\nO padrão que quase toda empresa vive pelo menos uma vez é o seguinte. A auditoria é marcada, o time passa três semanas produzindo capturas de tela, montando planilha para trás e caçando quem lembra do que aconteceu em março. Todo mundo trabalha demais, a auditoria termina, e o material produzido é fraco justamente porque demonstra um momento e não um processo. Um auditor experiente percebe isso na primeira pergunta de acompanhamento.\n\nA alternativa não é trabalhar mais perto da data, é escolher controles cujo funcionamento normal já deixa rastro. Infraestrutura como código produz histórico de mudança com autor, revisor e data sem ninguém pedir. Revisão de acesso automatizada produz registro nominal de decisão. Fluxo de chamado produz a aprovação. Registro de auditoria com trava de retenção produz a trilha. Quando o controle roda, a evidência nasce junto, e a auditoria vira uma consulta em vez de um projeto.\n\nA comparação deixa a diferença gritante. Imagine provar que produção só muda por caminho aprovado. A versão fraca é uma captura de tela do painel de aprovações mostrando três casos escolhidos. A versão forte é o histórico completo do repositório mais os registros do pipeline mostrando que todas as mudanças do período passaram por revisão. A segunda é mais convincente, cobre o período inteiro e custou zero hora extra de alguém.",
                },
                {
                    type: "table",
                    value: '[["Controle em operação","Evidência que ele gera sozinho","O que o auditor consegue ver"],["Infraestrutura como código","Histórico de mudança revisada","Quem alterou, quando e quem aprovou"],["Revisão de acesso automatizada","Decisão nominal com data","Se houve remoção e se ela ocorreu"],["Elevação sob demanda","Evento de cada elevação pedida","Quem teve privilégio e por quanto tempo"],["Registro com trava de retenção","Trilha íntegra do período","Que nada foi apagado no meio"],["Verificação de postura","Série histórica dos desvios","Se o controle operou o ano inteiro"]]',
                },
                {
                    type: "quote",
                    value: "Se o controle produz evidência ao funcionar, a auditoria vira uma consulta. Se não produz, ela vira um projeto de três semanas todo ano.",
                },
                {
                    type: "text",
                    value: "## O que o auditor de fato pergunta\n\nSão quatro perguntas, e vale conhecê-las porque elas organizam o trabalho o ano inteiro. A primeira é se o controle existe e está desenhado de forma adequada ao risco. A segunda é se ele operou durante todo o período, e não apenas no dia da conversa. A terceira é se ele foi eficaz, ou seja, se produziu o efeito pretendido. A quarta é o que aconteceu com as exceções, porque exceção existe em qualquer empresa e o que se avalia é se ela é gerida ou ignorada.\n\nA que mais reprova é a segunda. É comum encontrar um controle bem desenhado, bem documentado, que rodou duas vezes no ano porque a pessoa responsável ficou ocupada. Do ponto de vista de risco, isso é quase igual a não ter o controle, e do ponto de vista da auditoria é pior, porque a empresa acreditava estar coberta. O hábito que resolve é simples: todo controle relevante precisa de uma prova de operação periódica, de preferência gerada automaticamente, arquivada sem depender de alguém lembrar.\n\nUma armadilha para fechar o assunto: passar na auditoria não é sinônimo de estar seguro. O escopo de uma auditoria é negociado, e é perfeitamente possível receber um parecer limpo com um repositório de dado sensível aberto na internet, desde que ele não estivesse no escopo. Isso não é defeito do auditor, é a natureza do instrumento. Quem confunde parecer favorável com ausência de risco está lendo o documento errado.",
                },
            ],
            questions: [
                {
                    statement: "Por que a evidência produzida na véspera da auditoria é fraca?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ela demonstra um momento e não o processo inteiro",
                            isCorrect: true,
                        },
                        {
                            text: "Ela não pode ser aceita por um auditor independente",
                            isCorrect: false,
                        },
                        {
                            text: "Ela costuma conter dado pessoal sem base legal clara",
                            isCorrect: false,
                        },
                        {
                            text: "Ela exige aprovação da liderança antes de ser usada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza um controle que produz boa evidência?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O funcionamento normal dele já deixa rastro registrado",
                            isCorrect: true,
                        },
                        {
                            text: "Ele gera relatório completo ao fim de cada trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Ele é executado por uma pessoa formalmente designada",
                            isCorrect: false,
                        },
                        {
                            text: "Ele está descrito numa política aprovada pela direção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual das perguntas do auditor mais reprova empresas na prática?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Se o controle operou durante o período todo avaliado",
                            isCorrect: true,
                        },
                        {
                            text: "Se o controle está desenhado de forma adequada",
                            isCorrect: false,
                        },
                        { text: "Se as exceções concedidas foram documentadas", isCorrect: false },
                        {
                            text: "Se o controle está descrito em política vigente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que hábito garante que um controle atenda à prova de operação contínua?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Gerar prova periódica automática e arquivá-la sozinha",
                            isCorrect: true,
                        },
                        {
                            text: "Designar um responsável nominal por cada controle ativo",
                            isCorrect: false,
                        },
                        {
                            text: "Revisar a política do controle uma vez a cada semestre",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar o controle no inventário de risco da empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa recebeu parecer favorável e mesmo assim tinha dado sensível exposto. Como interpretar isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O escopo da auditoria é negociado e pode não cobrir tudo",
                            isCorrect: true,
                        },
                        {
                            text: "O auditor falhou ao executar os testes previstos no plano",
                            isCorrect: false,
                        },
                        {
                            text: "O parecer perde validade quando surge qualquer incidente",
                            isCorrect: false,
                        },
                        {
                            text: "A empresa omitiu informação exigida durante os trabalhos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Por onde começar um programa de segurança",
            blocks: [
                {
                    type: "text",
                    value: "# A empresa não tem nada, e o chapéu caiu na sua cabeça\n\nO cenário é comum: empresa de porte médio ou startup que cresceu rápido, sem área de segurança, e alguém do time de infraestrutura ou de engenharia recebeu a missão. Os dois instintos iniciais são quase sempre errados. O primeiro é comprar uma ferramenta, que gera achado que ninguém tem tempo de tratar. O segundo é escrever uma política de quarenta páginas copiada de um modelo, que ninguém vai ler e que ninguém vai conseguir cumprir.\n\nA ordem que funciona é definida por um critério só: risco removido por hora de trabalho. Começa por inventário, porque não se protege o que não se sabe que existe e porque a lista pronta destrava todo o resto. Vai para identidade, que em nuvem é a fronteira: diretório único, segundo fator forte, fim das contas compartilhadas e fim do privilégio administrativo permanente. Depois cópia de segurança que restaura de verdade, testada com restauração real, porque é o único controle que salva a empresa no pior dia possível.\n\nA sequência continua com correção do que está exposto na internet, que é o vetor inicial mais barato de fechar, e com registro que existe e é retido, sem o qual nenhuma investigação futura será possível. Só então entra política escrita, curta, sobre as poucas coisas que realmente importam, e depois detecção. Repare que ferramenta nova não aparece em nenhum dos seis primeiros passos, e que quase tudo ali é organização e disciplina, não compra.",
                },
                {
                    type: "table",
                    value: '[["Passo","Esforço típico","Risco que ele remove"],["Inventário do que existe","Semanas, e depois automático","Recurso esquecido e sem dono"],["Identidade em ordem","Semanas, com atrito político","Conta compartilhada e senha fraca"],["Backup que restaura","Dias para testar de verdade","Perda total por resgate ou erro"],["Correção do exposto","Contínuo, com fila priorizada","Vetor inicial mais barato de fechar"],["Registro retido","Dias para ligar e centralizar","Investigação impossível depois"],["Política curta e clara","Dias, se for mesmo curta","Ambiguidade sobre o que é aceito"]]',
                },
                {
                    type: "quote",
                    value: "Nos seis primeiros passos de um programa não aparece nenhuma ferramenta nova. Quase tudo ali é organização e disciplina, e é isso que assusta.",
                },
                {
                    type: "text",
                    value: "## O que não fazer no começo\n\nNão compre antes de saber o que você tem, porque toda ferramenta precisa de contexto para ser útil e o contexto é o inventário. Não copie a política de uma empresa grande, porque ela pressupõe times, papéis e processos que você não tem, e uma política impossível de cumprir ensina o time a ignorar política em geral. Não crie processo pesado numa empresa de vinte pessoas: um formulário de aprovação com três etapas numa startup produz contorno, não controle.\n\nNão tente certificar antes de ter o básico. Buscar uma certificação de gestão sem ter backup testado nem inventário é gastar dinheiro para documentar uma organização que não existe, e o resultado costuma ser um sistema de gestão de papel que ninguém sustenta depois do auditor ir embora. E, acima de tudo, não transforme segurança num portão que trava entrega logo no primeiro mês. Você vai precisar de capital político para as mudanças difíceis, e capital político se gasta rápido e se acumula devagar.\n\nExiste uma variação desse erro que merece nome próprio: querer resolver tudo porque tudo está errado. Num ambiente sem programa nenhum, absolutamente tudo vai parecer urgente, e essa sensação é paralisante e contagiosa. Escolher três frentes por trimestre, terminar as três e comunicar o resultado produz mais avanço em um ano do que atacar quinze frentes ao mesmo tempo, e ainda constrói a reputação de que quando a segurança começa algo, aquilo termina.",
                },
                {
                    type: "text",
                    value: "## Como sustentar depois do entusiasmo inicial\n\nTrês coisas seguram um programa novo. A primeira é um patrocinador na liderança que entenda o porquê e banque as decisões impopulares, porque sem isso a primeira reclamação de um diretor derruba meses de trabalho. A segunda é um punhado pequeno de métricas honestas, reportadas com regularidade, sempre as mesmas, com narrativa curta. A terceira é comemorar remoção: privilégio permanente eliminado, credencial estática aposentada, conta órfã desativada. Segurança é uma das poucas áreas em que subtrair é a entrega, e é preciso ensinar a organização a enxergar isso como progresso.\n\nSobre gente, um conselho que economiza anos. Em empresa pequena, segurança funciona quando os controles pertencem a quem opera: quem cuida da infraestrutura cuida do hardening, quem escreve a aplicação cuida das dependências, quem administra identidade cuida da revisão. A pessoa de segurança define o que precisa acontecer, ajuda, mede e cobra. Uma pessoa tentando executar tudo vira gargalo primeiro e culpada depois, quando algo acontecer.\n\nE, por último, escreva as decisões. Não os quarenta capítulos, mas as escolhas: por que estas três frentes e não outras, que risco foi aceito e por quanto tempo, quem é dono do quê. Daqui a um ano você não vai lembrar, o time terá mudado, e essa memória curta é o que permite revisitar decisões com honestidade em vez de recomeçar a discussão do zero a cada troca de gestor.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual critério define a ordem de um programa de segurança que começa do zero?",
                    difficulty: "facil",
                    options: [
                        { text: "Risco removido por hora de trabalho investida", isCorrect: true },
                        {
                            text: "Aderência ao referencial escolhido pela empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Ordem sugerida pela ferramenta de postura usada",
                            isCorrect: false,
                        },
                        { text: "Custo total das licenças a serem contratadas", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o inventário costuma ser o primeiro passo?",
                    difficulty: "medio",
                    options: [
                        { text: "Não se protege o que não se sabe que existe", isCorrect: true },
                        {
                            text: "Ele é exigido por lei para qualquer empresa privada",
                            isCorrect: false,
                        },
                        {
                            text: "Ele reduz de imediato o custo pago ao provedor",
                            isCorrect: false,
                        },
                        {
                            text: "Ele substitui a necessidade de política escrita",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que copiar a política de uma empresa grande é um erro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela pressupõe times e processos que ainda não existem",
                            isCorrect: true,
                        },
                        {
                            text: "Ela costuma estar protegida por direito autoral do autor",
                            isCorrect: false,
                        },
                        {
                            text: "Ela não é aceita pelos auditores em nenhuma hipótese",
                            isCorrect: false,
                        },
                        {
                            text: "Ela precisa ser traduzida para o contexto regulatório",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em empresa pequena, quem deve ser dono da execução dos controles?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quem opera cada área, com segurança medindo e cobrando",
                            isCorrect: true,
                        },
                        {
                            text: "A pessoa de segurança, que executa tudo de ponta a ponta",
                            isCorrect: false,
                        },
                        {
                            text: "Um fornecedor externo contratado para operar os controles",
                            isCorrect: false,
                        },
                        {
                            text: "O comitê de riscos, que aprova cada mudança relevante",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num ambiente sem programa nenhum, tudo parece urgente. Qual é o encaminhamento mais eficaz?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Escolher três frentes por trimestre e terminar as três",
                            isCorrect: true,
                        },
                        {
                            text: "Atacar todas as frentes em paralelo com prazos curtos",
                            isCorrect: false,
                        },
                        {
                            text: "Contratar consultoria para tratar tudo simultaneamente",
                            isCorrect: false,
                        },
                        {
                            text: "Priorizar apenas o que a auditoria já apontou como falho",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento da trilha e do caminho",
            blocks: [
                {
                    type: "text",
                    value: "# O que você levou daqui\n\nEsta trilha começou desarmando a leitura ingênua do modelo de responsabilidade compartilhada e terminou discutindo como montar um programa de segurança do zero. No meio, uma tese única sustentou tudo: em nuvem, a esmagadora maioria dos incidentes nasce de configuração e de identidade, e não de exploração de falha do provedor. Se você lembrar de uma única frase daqui a dois anos, que seja essa, porque ela orienta bem quase toda decisão de prioridade.\n\nDela decorrem as conclusões práticas que se repetiram módulo após módulo. O perímetro não existe mais como lugar, e a identidade é a fronteira que sobrou. Privilégio permanente é uma escolha e quase nunca uma necessidade. Segredo de longa vida é uma dívida que alguém vai cobrar. Impedir vale mais do que detectar, e detectar vale mais do que descobrir pelo noticiário. Segmentação limita alcance, identidade decide acesso, e nenhuma das duas substitui a outra.\n\nE fica uma conclusão desconfortável que vale carregar: o trabalho que mais reduz risco em nuvem é o menos glamouroso que existe. Inventário honesto, revisão de acesso que remove de verdade, correção rápida do que está exposto, backup testado, registro retido. Nada disso rende demonstração impressionante, e é exatamente esse conjunto que separa a empresa que tem um dia ruim da empresa que tem um trimestre ruim.",
                },
                {
                    type: "table",
                    value: '[["Estágio anterior do caminho","O que ele te deu","Como reaparece aqui em nuvem"],["Fundamentos e redes","Como o tráfego e os sistemas funcionam","Segmentação, saída controlada e ponto privado"],["Criptografia e defesa","Cifra, chave e controle de acesso","Chave gerenciada e fronteira dupla"],["Ameaças e ataques","Como uma campanha se desenrola","Persistência que vive na configuração"],["Ofensivo e teste","Como o adversário raciocina","Política ampla e caminho de escalonamento"],["Defesa e monitoramento","Como enxergar e responder","Plano de controle e resposta elástica"],["Nuvem e identidade","Onde tudo isso acontece hoje","O fechamento deste roadmap"]]',
                },
                {
                    type: "quote",
                    value: "O trabalho que mais reduz risco em nuvem é o menos glamouroso que existe. Não rende demonstração, e é ele que separa um dia ruim de um trimestre ruim.",
                },
                {
                    type: "text",
                    value: "## Este é o fim do roadmap de Segurança\n\nVale olhar para trás um instante. Você começou entendendo como sistemas e redes funcionam, porque não dá para proteger o que não se entende. Passou por criptografia e pelos controles de defesa, aprendeu como um ataque real se desenrola em etapas e viu o raciocínio ofensivo por dentro, o que muda para sempre a forma de olhar para uma configuração. Depois veio o lado da operação defensiva, de enxergar, correlacionar e responder. E agora fecha em nuvem e identidade, que é onde a maior parte desse trabalho acontece hoje.\n\nA sequência não foi arbitrária. Cada estágio existe porque o seguinte fica raso sem ele. Detecção sem entender ataque vira alerta sem sentido. Nuvem sem identidade vira console cheio de botões. Identidade sem noção de adversário vira burocracia de permissão. Se em algum momento desta trilha você sentiu que já sabia, provavelmente foi porque os estágios anteriores fizeram o trabalho deles.\n\nO que não termina é o assunto. Segurança é uma área onde o conhecimento envelhece rápido em detalhe e devagar em princípio. Os nomes de serviço vão mudar, as telas vão mudar, os provedores vão lançar coisas novas todo ano. As perguntas continuam as mesmas: quem pode fazer o quê, sob quais condições, o que fica registrado, e o que acontece quando essa credencial cair na mão errada.",
                },
                {
                    type: "text",
                    value: "## Para onde ir a partir daqui\n\nO conselho mais útil é também o mais direto: opere. Segurança em nuvem se aprende mexendo, e a diferença entre quem leu e quem operou fica evidente em cinco minutos de conversa. Abra uma conta própria com limite de gasto configurado, monte um ambiente pequeno com identidade federada, registro ligado, infraestrutura como código e uma detecção simples, e quebre de propósito. Deixe uma chave vazar num repositório de teste e observe o que aparece. O aprendizado que vem de ver o próprio erro no registro não se compra em curso nenhum.\n\nDo lado da leitura, prefira as fontes abertas e primárias: as publicações do NIST, os controles do CIS, o material do OWASP e a documentação pública dos próprios provedores, que é boa e é gratuita. E cultive um hábito que separa profissionais de curiosos: leia relatórios públicos de incidente, dos que as empresas publicam depois de um evento sério. Eles são a coisa mais próxima de experiência emprestada que existe, e quase sempre a causa raiz é algo desta trilha.\n\nUma última palavra sobre postura. Em nuvem, uma pessoa com credencial suficiente destrói um ambiente inteiro em segundos, e recupera errado com a mesma facilidade. A maturidade nessa área não se mede pela ousadia técnica, e sim pelo cuidado: confirmar antes de aplicar, preservar antes de agir, registrar a decisão, avisar quem precisa saber. Essa é a diferença entre alguém em quem se confia o ambiente de produção e alguém muito habilidoso a quem ninguém dá a chave. Boa sorte, e opere com cuidado.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a tese central que sustenta toda esta trilha?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Incidentes em nuvem nascem de configuração e identidade",
                            isCorrect: true,
                        },
                        {
                            text: "Incidentes em nuvem vêm de falhas na infraestrutura física",
                            isCorrect: false,
                        },
                        {
                            text: "Incidentes em nuvem exigem ferramenta específica para achar",
                            isCorrect: false,
                        },
                        {
                            text: "Incidentes em nuvem decorrem de cifra mal implementada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a relação entre segmentação de rede e identidade em nuvem?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma limita o alcance, a outra decide o acesso", isCorrect: true },
                        {
                            text: "Uma substitui a outra em ambientes bem federados",
                            isCorrect: false,
                        },
                        {
                            text: "Uma vale para carga, a outra apenas para pessoas",
                            isCorrect: false,
                        },
                        {
                            text: "Uma é preventiva, a outra serve só para auditoria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o trabalho que mais reduz risco em nuvem é o menos glamouroso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Inventário, revisão e backup rendem pouca demonstração",
                            isCorrect: true,
                        },
                        {
                            text: "As ferramentas modernas já resolvem os casos complexos",
                            isCorrect: false,
                        },
                        {
                            text: "Os incidentes graves são raros demais para justificar",
                            isCorrect: false,
                        },
                        {
                            text: "A liderança prefere investir em controle preventivo caro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual prática acelera mais o aprendizado de segurança em nuvem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Montar um ambiente próprio e quebrá-lo de propósito",
                            isCorrect: true,
                        },
                        {
                            text: "Obter uma certificação reconhecida pelo mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Acompanhar as novidades anunciadas pelos provedores",
                            isCorrect: false,
                        },
                        {
                            text: "Estudar o catálogo completo de controles do referencial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que postura profissional distingue quem recebe a chave de produção?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cuidado: confirmar, preservar, registrar e avisar",
                            isCorrect: true,
                        },
                        {
                            text: "Velocidade: agir rápido para conter qualquer estrago",
                            isCorrect: false,
                        },
                        {
                            text: "Autonomia: resolver sem depender de aprovação alheia",
                            isCorrect: false,
                        },
                        {
                            text: "Profundidade: dominar cada serviço do provedor usado",
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
