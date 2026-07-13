// Seed da trilha SC-900 (Microsoft Security, Compliance, and Identity Fundamentals).
// Idempotente e não destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-sc900.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "AZURE SC-900";
const DESCRICAO =
    "Trilha de fundamentos de segurança, conformidade e identidade da Microsoft para a certificação SC-900: conceitos de SCI, Microsoft Entra (identidade, autenticação, acesso e governança), soluções de segurança (rede no Azure, Defender for Cloud, Microsoft Sentinel e Defender XDR) e conformidade com o Microsoft Purview.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULOS: Modulo[] = [
    {
        "titulo": "Módulo 1 - Conceitos de segurança, conformidade e identidade",
        "aulas": [
            {
                "titulo": "Responsabilidade compartilhada e defesa em profundidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O modelo de responsabilidade compartilhada\nNa computação em nuvem, a segurança é uma responsabilidade compartilhada entre o provedor de nuvem (como a Microsoft) e o cliente. Nenhum dos dois cuida de tudo sozinho: cada um responde por uma parte, e saber onde essa linha é traçada é um dos pontos mais cobrados na prova.\n\nO tamanho da sua fatia depende do modelo de serviço. No local (on-premises) você cuida de tudo. Na IaaS (infraestrutura como serviço), o provedor cuida do hardware e você cuida do sistema operacional para cima. Na PaaS (plataforma como serviço), a divisão fica no meio. Na SaaS (software como serviço), o provedor cuida de quase tudo e sobram para você principalmente os dados e as identidades."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Responsabilidade\",\"On-premises\",\"IaaS\",\"PaaS\",\"SaaS\"],[\"Dados, contas e identidades\",\"Cliente\",\"Cliente\",\"Cliente\",\"Cliente\"],[\"Dispositivos (endpoints)\",\"Cliente\",\"Cliente\",\"Cliente\",\"Cliente\"],[\"Sistema operacional\",\"Cliente\",\"Cliente\",\"Provedor\",\"Provedor\"],[\"Controles de rede\",\"Cliente\",\"Cliente\",\"Compartilhado\",\"Provedor\"],[\"Aplicativos\",\"Cliente\",\"Cliente\",\"Compartilhado\",\"Provedor\"],[\"Infraestrutura física (hosts, rede e datacenter)\",\"Cliente\",\"Provedor\",\"Provedor\",\"Provedor\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que é sempre seu\nRepare no padrão da tabela: três responsabilidades nunca saem do seu colo, não importa o modelo. Os dados e as informações da empresa, as contas e identidades dos usuários e os dispositivos (endpoints) que acessam os recursos são sempre do cliente. No outro extremo, a infraestrutura física (os servidores, a rede física e o datacenter) é sempre do provedor.\n\nO meio é que se desloca conforme o modelo. Por isso a pergunta clássica da prova descreve um cenário de SaaS, PaaS ou IaaS e pergunta de quem é uma responsabilidade específica. A regra de ouro para não errar: dados, identidades e dispositivos são sempre seus."
                    },
                    {
                        "type": "text",
                        "value": "## Defesa em profundidade\nA defesa em profundidade (defense in depth) parte de uma ideia simples: nenhum controle de segurança é infalível, então você empilha várias camadas de proteção. Se uma camada falha, as outras ainda seguram o ataque. É como um castelo com muro, fosso, portão e guardas: o invasor precisa vencer barreira após barreira.\n\nCada camada protege a de dentro, e no centro de tudo estão os dados. O objetivo é atrasar e conter o atacante, reduzindo a chance de ele chegar até a informação. Essas camadas trabalham para preservar a tríade CIA: confidencialidade (só quem pode acessar vê os dados), integridade (os dados não são alterados indevidamente) e disponibilidade (os dados estão acessíveis quando necessário)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"O que protege (exemplo de controle)\"],[\"Segurança física\",\"O acesso físico ao datacenter e ao hardware\"],[\"Identidade e acesso\",\"Quem entra: autenticação, MFA e controle de acesso\"],[\"Perímetro\",\"A borda da rede: proteção contra DDoS e filtragem\"],[\"Rede\",\"A comunicação entre recursos: segmentação e limites de tráfego\"],[\"Computação\",\"Servidores e máquinas: acesso seguro e atualizações\"],[\"Aplicativo\",\"O software: desenvolvimento seguro e correção de falhas\"],[\"Dados\",\"O centro de tudo: criptografia e controle de acesso aos dados\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "No modelo de responsabilidade compartilhada, dados, identidades e dispositivos são sempre responsabilidade sua; a defesa em profundidade empilha camadas para que a falha de uma não exponha os dados no centro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa está definindo responsabilidades de segurança na nuvem. Independentemente de o serviço ser IaaS, PaaS ou SaaS, por quais itens o cliente é sempre responsável?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pelos dados, pelas contas e identidades e pelos dispositivos",
                                "isCorrect": true
                            },
                            {
                                "text": "Pela rede física e pelos servidores do datacenter",
                                "isCorrect": false
                            },
                            {
                                "text": "Por todo o hardware que hospeda os serviços",
                                "isCorrect": false
                            },
                            {
                                "text": "Por absolutamente nada, pois o provedor cuida de tudo na nuvem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a ideia central da defesa em profundidade (defense in depth)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Usar camadas de proteção, para que a falha de uma não comprometa tudo",
                                "isCorrect": true
                            },
                            {
                                "text": "Confiar toda a defesa em um único firewall muito bem configurado",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiar em qualquer usuário que já esteja dentro da rede corporativa",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar a criptografia por senhas cada vez mais longas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa adota o Microsoft 365, um serviço de SaaS. Nesse modelo, quem é responsável por gerenciar as contas de usuário e proteger os dados que a empresa coloca no serviço?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O cliente, pois contas, identidades e dados são sempre responsabilidade dele",
                                "isCorrect": true
                            },
                            {
                                "text": "A Microsoft, que assume todas as responsabilidades no modelo SaaS",
                                "isCorrect": false
                            },
                            {
                                "text": "Ninguém, pois em SaaS não há dados do cliente para proteger",
                                "isCorrect": false
                            },
                            {
                                "text": "Um terceiro obrigatório, contratado à parte especificamente para o SaaS",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao organizar seus controles pelas camadas da defesa em profundidade, uma equipe implementa a autenticação multifator (MFA) para controlar quem consegue entrar. A que camada esse controle pertence?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Identidade e acesso",
                                "isCorrect": true
                            },
                            {
                                "text": "Segurança física",
                                "isCorrect": false
                            },
                            {
                                "text": "Rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Perímetro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa executa máquinas virtuais em um serviço de IaaS na nuvem. Durante uma auditoria, surge a dúvida sobre quem deve aplicar as atualizações de segurança do sistema operacional convidado dessas VMs. Quem é o responsável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O cliente, pois na IaaS o sistema operacional continua sob sua responsabilidade",
                                "isCorrect": true
                            },
                            {
                                "text": "O provedor, que corrige o sistema operacional de todas as VMs dos clientes",
                                "isCorrect": false
                            },
                            {
                                "text": "Ninguém, pois VMs de IaaS não recebem atualização de sistema operacional",
                                "isCorrect": false
                            },
                            {
                                "text": "O provedor, pois na IaaS toda a responsabilidade passa a ser dele",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O modelo Zero Trust",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é Zero Trust\nO modelo antigo de segurança funcionava como um castelo com fosso: erguia-se uma muralha (o firewall) em volta da rede corporativa e confiava-se em tudo que estivesse do lado de dentro. O problema é que, uma vez lá dentro, um invasor circulava à vontade. E com a nuvem, o trabalho remoto e os aplicativos SaaS, esse dentro e fora deixou de existir com clareza.\n\nO Zero Trust (confiança zero) nasce dessa mudança. Seu lema é nunca confie, sempre verifique. Em vez de confiar em uma requisição só porque ela veio da rede interna, o modelo trata toda tentativa de acesso como se viesse de uma rede aberta e não confiável, e a verifica explicitamente, venha de onde vier."
                    },
                    {
                        "type": "text",
                        "value": "## Os três princípios do Zero Trust\nO modelo se apoia em três princípios que caem muito na prova.\n\nVerificar explicitamente: sempre autenticar e autorizar cada acesso com base em todos os dados disponíveis, como a identidade do usuário, o dispositivo, a localização, o serviço solicitado e sinais de risco. Nada é liberado por presunção.\n\nUsar o acesso com privilégio mínimo (least privilege): conceder apenas o acesso estritamente necessário, pelo menor tempo possível, com políticas baseadas em risco. Assim, se uma conta for comprometida, o estrago fica limitado.\n\nAssumir a violação (assume breach): operar como se o invasor já estivesse dentro. Isso leva a segmentar o acesso, criptografar de ponta a ponta e monitorar tudo para detectar e conter ameaças rapidamente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Princípio\",\"O que significa\",\"Na prática\"],[\"Verificar explicitamente\",\"Autenticar e autorizar com base em todos os sinais disponíveis\",\"Avaliar identidade, dispositivo, local e risco a cada acesso\"],[\"Privilégio mínimo\",\"Conceder só o acesso necessário, pelo menor tempo\",\"Just-in-time, just-enough-access e políticas por risco\"],[\"Assumir a violação\",\"Operar como se o invasor já estivesse dentro\",\"Segmentar o acesso, criptografar de ponta a ponta e monitorar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Os seis pilares do Zero Trust\nO Zero Trust não protege uma coisa só: ele se aplica a seis elementos que, juntos, formam a base da estratégia. Cada pilar fornece sinais para as decisões de acesso e é um ponto onde as políticas são aplicadas. A identidade costuma ser o pilar central, porque quase todo acesso começa por ela.\n\nSão eles: identidades, dispositivos (endpoints), aplicativos, dados, infraestrutura e redes. A ideia é ter visibilidade e controle sobre cada um, sem confiar cegamente em nenhum, nem mesmo na rede interna."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pilar\",\"Foco\"],[\"Identidades\",\"Verificar e proteger cada identidade de usuário, serviço ou dispositivo\"],[\"Dispositivos (endpoints)\",\"Checar a saúde e a conformidade dos aparelhos que acessam\"],[\"Aplicativos\",\"Controlar o acesso e as permissões dentro dos aplicativos\"],[\"Dados\",\"Classificar, rotular e proteger os dados onde quer que estejam\"],[\"Infraestrutura\",\"Reforçar a configuração e detectar ameaças em servidores e serviços\"],[\"Redes\",\"Segmentar e criptografar o tráfego, sem confiar na rede interna\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O Zero Trust parte do lema nunca confie, sempre verifique, guiado por três princípios: verificar explicitamente, usar o privilégio mínimo e assumir a violação."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual frase resume melhor a filosofia do modelo Zero Trust?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Nunca confie, sempre verifique",
                                "isCorrect": true
                            },
                            {
                                "text": "Confie em tudo que estiver dentro da rede corporativa",
                                "isCorrect": false
                            },
                            {
                                "text": "Verifique apenas os acessos vindos da internet",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma senha forte basta para liberar qualquer acesso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções a seguir é um dos três princípios do Zero Trust?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Assumir a violação",
                                "isCorrect": true
                            },
                            {
                                "text": "Confiar na rede interna por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminar a autenticação para acelerar o acesso",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter um único perímetro de firewall como defesa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seguindo o Zero Trust, uma empresa passa a conceder a cada funcionário apenas as permissões estritamente necessárias para sua função, e apenas pelo tempo em que precisa delas. Qual princípio está sendo aplicado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Privilégio mínimo",
                                "isCorrect": true
                            },
                            {
                                "text": "Verificar explicitamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Assumir a violação",
                                "isCorrect": false
                            },
                            {
                                "text": "Defesa em profundidade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de segurança projeta o ambiente partindo da suposição de que um atacante já pode estar dentro, então segmenta o acesso e monitora tudo para limitar o alcance de um possível comprometimento. Qual princípio do Zero Trust orienta essa decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Assumir a violação",
                                "isCorrect": true
                            },
                            {
                                "text": "Privilégio mínimo",
                                "isCorrect": false
                            },
                            {
                                "text": "Verificar explicitamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiança implícita na rede local",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Mesmo para um funcionário conectado à rede do escritório, um sistema Zero Trust exige nova avaliação de identidade, saúde do dispositivo, localização e risco a cada acesso a um recurso sensível, sem liberar nada apenas por a origem ser interna. Qual princípio isso representa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Verificar explicitamente",
                                "isCorrect": true
                            },
                            {
                                "text": "Assumir a violação",
                                "isCorrect": false
                            },
                            {
                                "text": "Privilégio mínimo",
                                "isCorrect": false
                            },
                            {
                                "text": "Responsabilidade compartilhada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Criptografia e hashing",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Para que serve a criptografia\nCriptografar é embaralhar uma informação legível (o texto claro) e transformá-la em um texto cifrado que ninguém entende sem a chave certa. Um algoritmo usa essa chave para cifrar e, no sentido inverso, para decifrar. Sem a chave correta, o conteúdo é inútil para quem o intercepta. O objetivo principal é a confidencialidade: garantir que só quem tem autorização consiga ler os dados.\n\n## Dados em repouso e em trânsito\nA criptografia protege os dados em dois momentos. Em repouso é quando os dados estão armazenados, em discos, bancos de dados ou arquivos parados. Em trânsito é quando os dados trafegam por uma rede, como uma página que viaja do servidor até o seu navegador. O ideal é proteger os dois: de nada adianta guardar os dados cifrados se eles viajam abertos pela rede."
                    },
                    {
                        "type": "text",
                        "value": "## Criptografia simétrica e assimétrica\nExistem dois grandes tipos, e a diferença está nas chaves.\n\nNa criptografia simétrica, a mesma chave secreta cifra e decifra. É rápida e ótima para grandes volumes de dados, mas tem um desafio: as duas partes precisam compartilhar essa chave secreta de forma segura.\n\nNa criptografia assimétrica existe um par de chaves: uma pública e uma privada. O que é cifrado com uma só é decifrado com a outra. A chave pública pode ser distribuída livremente, enquanto a privada é mantida em segredo. É mais lenta, então costuma ser usada para trocar chaves com segurança e para assinaturas digitais. Na prática, os dois tipos se combinam: a assimétrica troca com segurança uma chave simétrica, que então cifra o grosso dos dados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Simétrica\",\"Assimétrica\"],[\"Chaves\",\"Uma única chave secreta compartilhada\",\"Um par: chave pública e chave privada\"],[\"Velocidade\",\"Rápida, boa para grandes volumes\",\"Mais lenta, para pequenos volumes\"],[\"Uso típico\",\"Cifrar arquivos e dados em massa\",\"Trocar chaves e assinar digitalmente\"],[\"Principal desafio\",\"Compartilhar a chave com segurança\",\"Proteger a chave privada do par\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Hashing não é criptografia\nO hashing (ou hash) parece criptografia, mas é outra coisa, e a prova adora essa diferença. Uma função de hash pega uma entrada de qualquer tamanho e devolve um valor de tamanho fixo, chamado hash ou resumo. Ela tem duas propriedades importantes: é determinística (a mesma entrada gera sempre o mesmo hash) e é de mão única (a partir do hash não dá para voltar ao valor original). Não há chave envolvida.\n\nÉ justamente por ser irreversível que o hashing é ideal para guardar senhas: o sistema armazena o hash, não a senha. No login, ele calcula o hash do que você digitou e compara com o valor guardado, sem nunca precisar conhecer a senha real. O hashing também serve para verificar integridade: se um único caractere do arquivo muda, o hash muda, denunciando a alteração. Para reforçar, adiciona-se um valor aleatório (salt) antes de gerar o hash, o que evita que senhas iguais gerem o mesmo resultado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Criptografia\",\"Hashing\"],[\"Objetivo\",\"Proteger a confidencialidade\",\"Guardar senhas e verificar integridade\"],[\"É reversível?\",\"Sim, com a chave correta\",\"Não, é de mão única\"],[\"Usa chave?\",\"Sim\",\"Não\"],[\"Saída\",\"Texto cifrado que pode ser decifrado\",\"Valor de tamanho fixo, não decifrável\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A criptografia é reversível com a chave certa e protege a confidencialidade; o hashing é de mão única, não usa chave e serve para guardar senhas e verificar integridade."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a criptografia faz com uma informação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Transforma o texto legível em texto cifrado",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduz o tamanho do arquivo para ocupar menos espaço",
                                "isCorrect": false
                            },
                            {
                                "text": "Apaga os dados de forma permanente e irreversível",
                                "isCorrect": false
                            },
                            {
                                "text": "Copia os dados para um servidor de backup",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação sobre hashing está correta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É uma função de mão única: a partir do hash não se recupera o valor original",
                                "isCorrect": true
                            },
                            {
                                "text": "É facilmente revertido para obter o dado original, desde que se tenha a chave",
                                "isCorrect": false
                            },
                            {
                                "text": "Serve principalmente para acelerar a transmissão de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Gera uma saída de tamanho diferente a cada execução com a mesma entrada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema precisa cifrar rapidamente um grande volume de arquivos e usará a mesma chave tanto para cifrar quanto para decifrar. Que tipo de criptografia é indicado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criptografia simétrica",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografia assimétrica",
                                "isCorrect": false
                            },
                            {
                                "text": "Hashing com salt",
                                "isCorrect": false
                            },
                            {
                                "text": "Assinatura digital",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer proteger os dados de um formulário enquanto eles viajam do navegador do usuário até o servidor, evitando que sejam lidos caso interceptados no caminho. Que proteção é essa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criptografia de dados em trânsito",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografia de dados em repouso",
                                "isCorrect": false
                            },
                            {
                                "text": "Hashing dos dados em repouso",
                                "isCorrect": false
                            },
                            {
                                "text": "Segmentação de rede",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço precisa armazenar as senhas dos usuários de um jeito que nem os próprios administradores consigam descobrir a senha original, mas que ainda permita confirmar a senha no momento do login. Qual técnica atende a esse requisito?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Hashing com salt, pois permite comparar sem guardar a senha original",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografia simétrica, guardando a chave junto ao banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografia assimétrica, publicando a chave privada para conferência",
                                "isCorrect": false
                            },
                            {
                                "text": "Compactação protegida por senha, o que impede a leitura do conteúdo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Governança, risco e conformidade (GRC)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é GRC\nGRC é a sigla para governança, risco e conformidade (governance, risk and compliance). São três disciplinas ligadas que ajudam a organização a se manter segura, organizada e dentro da lei. Elas respondem a perguntas diferentes: como somos dirigidos e controlados (governança), quais ameaças enfrentamos e o que fazer com elas (risco) e se estamos seguindo as regras que nos obrigam (conformidade). Na prova, o mais comum é ler um cenário e apontar qual das três ele descreve."
                    },
                    {
                        "type": "text",
                        "value": "## Governança\nGovernança é o conjunto de regras, práticas e processos pelos quais uma organização é dirigida e controlada. É ela que define as políticas de segurança, os padrões, os papéis e responsabilidades e os controles que todos devem seguir, garantindo que as ações estejam alinhadas aos objetivos do negócio e sejam consistentes em toda a empresa.\n\nNa nuvem, a governança é apoiada por ferramentas que ajudam a definir e a impor essas regras sobre os recursos de forma automática, para que ninguém configure algo fora do padrão aprovado."
                    },
                    {
                        "type": "text",
                        "value": "## Gestão de risco\nRisco é a possibilidade de que uma ameaça cause dano à organização. A gestão de risco é o processo de identificar esses riscos, avaliar a probabilidade de acontecerem e o impacto que teriam, e então decidir como responder. As respostas possíveis costumam ser mitigar (reduzir o risco com controles), aceitar (conviver com ele), transferir (por exemplo, com um seguro) ou evitar (não fazer a atividade arriscada).\n\nQuase nunca se elimina o risco por completo: o que sobra depois dos controles é o risco residual, que a organização precisa conhecer e aceitar de forma consciente."
                    },
                    {
                        "type": "text",
                        "value": "## Conformidade\nConformidade (compliance) é seguir as leis, regulamentos, padrões e políticas internas que se aplicam à organização. Alguns são leis, como a LGPD no Brasil e o GDPR na Europa, que tratam da proteção de dados pessoais. Outros são normas e certificações do setor, como a ISO 27001 e o SOC. Cumprir essas exigências, e conseguir comprovar esse cumprimento, é o objetivo da conformidade.\n\nPara ajudar nisso, a Microsoft oferece recursos como o Service Trust Portal e o Microsoft Purview Compliance Manager, que veremos no módulo de conformidade. Por ora, basta entender que conformidade é atender e demonstrar aderência às regras externas e internas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Disciplina\",\"Pergunta que responde\",\"Exemplo\"],[\"Governança\",\"Como a organização é dirigida e controlada?\",\"Definir políticas, papéis e controles de segurança\"],[\"Risco\",\"Quais ameaças existem e como respondê-las?\",\"Identificar, avaliar e decidir mitigar um risco\"],[\"Conformidade\",\"Estamos seguindo as leis e normas?\",\"Atender à LGPD, ao GDPR ou à ISO 27001\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A governança define as regras e os controles; a gestão de risco identifica, avalia e responde às ameaças; a conformidade garante que a organização siga leis, normas e padrões, e comprove isso."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na sigla GRC, aplicada à segurança, as três letras representam quais disciplinas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Governança, risco e conformidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Gestão, rede e criptografia",
                                "isCorrect": false
                            },
                            {
                                "text": "Governança, recuperação e continuidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Grupos, recursos e contas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Definir as políticas de segurança, os papéis e responsabilidades e os controles que toda a organização deve seguir é uma atividade típica de qual disciplina do GRC?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Governança",
                                "isCorrect": true
                            },
                            {
                                "text": "Gestão de risco",
                                "isCorrect": false
                            },
                            {
                                "text": "Conformidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografia",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe lista as ameaças à empresa, avalia a probabilidade e o impacto de cada uma e decide quais serão mitigadas, aceitas ou transferidas. Qual disciplina do GRC descreve esse trabalho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Gestão de risco",
                                "isCorrect": true
                            },
                            {
                                "text": "Governança",
                                "isCorrect": false
                            },
                            {
                                "text": "Conformidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Defesa em profundidade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa brasileira precisa atender às exigências da LGPD e comprovar, em uma auditoria, que segue a norma ISO 27001. A que disciplina do GRC esse esforço pertence?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Conformidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Governança",
                                "isCorrect": false
                            },
                            {
                                "text": "Gestão de risco",
                                "isCorrect": false
                            },
                            {
                                "text": "Responsabilidade compartilhada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização cria um conjunto de políticas internas que determinam quem pode acessar cada recurso e como os ambientes devem ser configurados, para manter tudo padronizado e alinhado aos objetivos do negócio. Esse esforço é melhor descrito como...?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Governança, pois define regras e controles que dirigem a organização",
                                "isCorrect": true
                            },
                            {
                                "text": "Conformidade, pois toda regra interna equivale a uma lei externa",
                                "isCorrect": false
                            },
                            {
                                "text": "Gestão de risco, pois qualquer política é, na prática, uma avaliação de risco",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografia, pois envolve proteger o acesso aos recursos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Conceitos de identidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A identidade como o principal perímetro de segurança\nDurante muito tempo, proteger uma empresa era proteger o perímetro da rede: erguia-se um firewall em volta da rede corporativa e confiava-se em quem estivesse dentro. Com a nuvem, os aplicativos SaaS, os celulares e o trabalho remoto, os dados e os sistemas passaram a viver fora desse muro, e os usuários a acessá-los de qualquer lugar. O perímetro de rede se dissolveu.\n\nPor isso se diz que a identidade virou o novo e principal perímetro de segurança. Toda decisão de acesso passa a começar por uma pergunta: quem (ou o quê) está pedindo acesso? É essa lógica que sustenta o Zero Trust. E identidade aqui não é só gente: pode ser um usuário, um aplicativo, um serviço, um dispositivo e, mais recentemente, um agente de IA. Uma infraestrutura de identidade costuma ser descrita por quatro pilares: administração, autenticação, autorização e auditoria."
                    },
                    {
                        "type": "text",
                        "value": "## Autenticação e autorização\nDois conceitos muito próximos e muito confundidos. A autenticação (authentication, ou AuthN) é o processo de provar que você é quem diz ser: você se identifica e comprova com algo que sabe (uma senha), algo que tem (um código no celular) ou algo que você é (uma biometria). A autorização (authorization, ou AuthZ) vem depois: já sabendo quem você é, ela define o que você tem permissão de fazer e a quais recursos pode chegar.\n\nA ordem é sempre essa: primeiro autentica, depois autoriza. Uma boa analogia é o aeroporto: mostrar o documento no check-in é autenticação (provar quem você é); o cartão de embarque, que diz em qual voo e assento você pode entrar, é autorização (o que você pode fazer)."
                    },
                    {
                        "type": "text",
                        "value": "## Provedores de identidade e o logon único (SSO)\nUm provedor de identidade (identity provider, ou IdP) é um serviço confiável que cria, armazena e gerencia identidades e cuida da autenticação delas para os aplicativos. Em vez de cada aplicativo manter a sua própria lista de usuários e senhas, todos delegam a autenticação ao provedor. O Microsoft Entra ID é um exemplo de provedor de identidade na nuvem; os botões entrar com Google ou entrar com a conta Microsoft também usam essa ideia.\n\nO grande benefício é o logon único (single sign-on, ou SSO): o usuário se autentica uma vez no provedor e acessa vários aplicativos sem digitar a senha de novo a cada um. Isso reduz o número de senhas, centraliza o controle e facilita aplicar políticas, como a exigência de MFA, em um só lugar."
                    },
                    {
                        "type": "text",
                        "value": "## Serviços de diretório e o Active Directory\nUm serviço de diretório armazena as identidades (usuários, grupos, dispositivos) e seus atributos, e permite autenticá-las e autorizá-las. O exemplo clássico da Microsoft é o Active Directory Domain Services (AD DS), o diretório local tradicional, que organiza a rede corporativa em domínios e unidades organizacionais e funciona muito bem dentro da rede da empresa. Ele não foi feito, porém, para o mundo da web, do SaaS e do mobile. Esse papel, na nuvem, cabe ao Microsoft Entra ID (antigo Azure Active Directory, ou Azure AD), a identidade em nuvem para aplicativos web, SaaS e móveis.\n\n## Federação\nFederação é uma relação de confiança estabelecida entre dois provedores de identidade (ou domínios de organizações diferentes) para que um usuário autenticado no seu próprio provedor acesse recursos de outra organização sem precisar de uma conta separada lá. Quem recebe o acesso confia na autenticação feita pelo provedor de origem. É o que acontece quando você usa as credenciais da sua empresa para entrar no aplicativo de um parceiro, ou quando um site aceita que você entre com a sua conta de outro serviço. A confiança entre as partes é o que torna isso possível, sem duplicar contas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conceito\",\"O que faz ou responde\"],[\"Autenticação (AuthN)\",\"Prova quem você é (verifica a identidade)\"],[\"Autorização (AuthZ)\",\"Define o que você pode fazer (permissões e acesso)\"],[\"Provedor de identidade\",\"Serviço confiável que autentica e gerencia identidades e habilita o SSO\"],[\"Serviço de diretório\",\"Armazena identidades e atributos e permite autenticar e autorizar\"],[\"Active Directory (AD DS)\",\"Diretório local tradicional da Microsoft, para a rede corporativa\"],[\"Microsoft Entra ID\",\"Identidade na nuvem para web, SaaS e mobile (ex-Azure AD)\"],[\"Federação\",\"Confiança entre provedores para acessar sem criar conta separada\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A identidade é o novo perímetro: a autenticação prova quem você é e a autorização define o que você pode fazer; o provedor de identidade habilita o logon único e a federação estende a confiança entre organizações."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que se diz que a identidade se tornou o principal perímetro de segurança nas organizações modernas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque a nuvem e o trabalho remoto dissolveram o perímetro de rede tradicional",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque os firewalls de perímetro deixaram de existir em qualquer rede corporativa",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque as senhas pararam de ser necessárias com a chegada da nuvem",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a identidade substitui por completo a necessidade de autorização",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual processo tem como objetivo comprovar que o usuário é realmente quem ele afirma ser?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Autenticação",
                                "isCorrect": true
                            },
                            {
                                "text": "Autorização",
                                "isCorrect": false
                            },
                            {
                                "text": "Federação",
                                "isCorrect": false
                            },
                            {
                                "text": "Auditoria",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de o usuário fazer login com sucesso, o sistema verifica se ele tem permissão para abrir o relatório financeiro. Que processo é esse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Autorização",
                                "isCorrect": true
                            },
                            {
                                "text": "Autenticação",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografia",
                                "isCorrect": false
                            },
                            {
                                "text": "Provisionamento de identidade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer que seus funcionários se autentiquem uma única vez em um serviço confiável e, a partir daí, acessem vários aplicativos sem digitar a senha de novo a cada um. Que recurso, oferecido por um provedor de identidade, atende a isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O logon único (SSO)",
                                "isCorrect": true
                            },
                            {
                                "text": "A autorização baseada em papéis",
                                "isCorrect": false
                            },
                            {
                                "text": "A criptografia simétrica",
                                "isCorrect": false
                            },
                            {
                                "text": "A tríade CIA",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa fecha uma parceria e quer que os funcionários da parceira acessem um aplicativo compartilhado usando as credenciais corporativas da própria parceira, sem que seja preciso criar novas contas para eles. Qual conceito de identidade torna isso possível?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Federação, a relação de confiança entre provedores de identidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Logon único dentro de um mesmo provedor de identidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Diretório local compartilhado fisicamente entre as empresas",
                                "isCorrect": false
                            },
                            {
                                "text": "Autorização baseada em papéis dentro de um único domínio",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Microsoft Entra ID: identidade e autenticação",
        "aulas": [
            {
                "titulo": "O que é o Microsoft Entra ID",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é o Microsoft Entra ID\nO Microsoft Entra ID é o serviço de identidade e gestão de acesso (IAM) baseado em nuvem da Microsoft. Ele guarda as identidades (pessoas, aplicativos e dispositivos), verifica quem é cada uma na hora do login e decide a que recursos cada uma pode chegar. É o antigo Azure Active Directory (Azure AD), que mudou de nome, mas segue sendo o coração da identidade no Microsoft 365 e no Azure.\n\nNo mundo da nuvem, a identidade virou o novo perímetro de segurança: como os recursos não estão mais só dentro da rede da empresa, é a identidade que controla o acesso. Por isso o Entra ID é a peça central da segurança de identidade e cai bastante na prova."
                    },
                    {
                        "type": "text",
                        "value": "## O que o Entra ID faz\nO Entra ID atua como o provedor de identidade (identity provider, ou IdP) da organização. Ele concentra várias funções:\n\n- **Autenticação**: confirmar que a pessoa ou o serviço é mesmo quem diz ser, validando credenciais e fatores extras.\n- **Autorização**: definir o que cada identidade pode fazer depois de autenticada, por meio de papéis e permissões.\n- **Logon único (SSO)**: entrar uma vez e acessar vários aplicativos sem digitar a senha de novo.\n- **Gestão de aplicativos**: publicar e controlar o acesso a apps da Microsoft, de terceiros (SaaS) e da própria empresa.\n- **Gestão de dispositivos**: registrar dispositivos e usá-los como sinal nas decisões de acesso.\n- **Colaboração externa**: dar acesso controlado a parceiros e fornecedores como usuários convidados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Microsoft Entra ID\",\"Active Directory Domain Services (AD DS)\"],[\"Onde roda\",\"Nuvem (serviço da Microsoft)\",\"Servidores locais da empresa\"],[\"Serve para\",\"Apps de nuvem, SaaS e Microsoft 365\",\"Rede interna, arquivos e impressoras\"],[\"Estrutura\",\"Plana, com usuários e grupos\",\"Domínios, florestas e unidades organizacionais\"],[\"Protocolos\",\"SAML, OAuth 2.0 e OpenID Connect\",\"Kerberos, LDAP, NTLM e GPO\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Entra ID não é o Active Directory local\nUm ponto que confunde: o Microsoft Entra ID não é a versão em nuvem do Active Directory Domain Services (AD DS) que roda nos servidores da empresa. Eles resolvem problemas diferentes. O AD DS cuida da rede interna, com domínios, florestas, unidades organizacionais e políticas de grupo (GPO), usando protocolos como Kerberos e LDAP. O Entra ID foi feito para a nuvem: gerencia acesso a aplicativos web, SaaS e Microsoft 365 usando protocolos modernos como SAML, OAuth 2.0 e OpenID Connect, sem o conceito de domínios ou GPO.\n\nOs dois podem trabalhar juntos, e é aí que entra a identidade híbrida, tema de uma aula mais à frente."
                    },
                    {
                        "type": "quote",
                        "value": "O Microsoft Entra ID é o serviço de identidade em nuvem que autentica e autoriza pessoas, aplicativos e dispositivos; na nuvem, a identidade é o novo perímetro de segurança."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa está migrando para a nuvem e precisa de um serviço que armazene identidades e controle quem acessa o Microsoft 365 e aplicativos SaaS. Qual serviço da Microsoft cumpre esse papel?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Entra ID",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Firewall",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Sentinel",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Key Vault",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No modelo de segurança da nuvem, o que passa a ser considerado o novo perímetro de segurança?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A identidade",
                                "isCorrect": true
                            },
                            {
                                "text": "O firewall de borda da rede",
                                "isCorrect": false
                            },
                            {
                                "text": "O data center físico",
                                "isCorrect": false
                            },
                            {
                                "text": "O cabeamento de rede",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquiteto precisa deixar claro para a equipe a diferença entre o Microsoft Entra ID e o Active Directory Domain Services (AD DS) local. Qual afirmação está correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Entra ID gerencia identidade na nuvem; o AD DS gerencia a rede local com domínios e GPO",
                                "isCorrect": true
                            },
                            {
                                "text": "O Entra ID e o AD DS são exatamente o mesmo produto, só com nome comercial diferente",
                                "isCorrect": false
                            },
                            {
                                "text": "O AD DS é o serviço que roda na nuvem, enquanto o Entra ID depende de servidores locais",
                                "isCorrect": false
                            },
                            {
                                "text": "O Entra ID organiza tudo em domínios, florestas e unidades organizacionais, como o AD DS",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um funcionário quer acessar vários aplicativos de trabalho fazendo login uma única vez, sem digitar a senha repetidamente. Qual recurso do Microsoft Entra ID atende a isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Logon único (SSO)",
                                "isCorrect": true
                            },
                            {
                                "text": "Autorização baseada em papéis",
                                "isCorrect": false
                            },
                            {
                                "text": "Auditoria de acessos",
                                "isCorrect": false
                            },
                            {
                                "text": "Smart lockout",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer que parceiros externos usem as próprias contas para acessar, de forma controlada, alguns aplicativos internos, sem criar senhas novas na empresa. Além disso, o time de segurança afirma que 'a identidade é o novo perímetro'. Qual serviço concentra tanto a colaboração externa quanto esse papel de perímetro baseado em identidade?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Microsoft Entra ID",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Bastion",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure DDoS Protection",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Purview",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tipos de identidade no Entra ID",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quem pode ter uma identidade\nNo Microsoft Entra ID, identidade não é só gente. Uma identidade é qualquer coisa que precise ser autenticada para acessar recursos. Isso inclui pessoas, mas também aplicativos, serviços e dispositivos. Saber diferenciar os tipos de identidade é um dos assuntos mais cobrados do domínio de Entra na prova.\n\nOs principais tipos são: usuários, grupos, entidades de serviço (service principals), identidades gerenciadas (managed identities), dispositivos e, mais recentemente, o agent ID, a identidade dos agentes de IA. As identidades de aplicativos e serviços costumam ser chamadas de identidades de carga de trabalho (workload identities)."
                    },
                    {
                        "type": "text",
                        "value": "## Usuários e grupos\nOs **usuários** representam as pessoas. Eles podem ser membros (member), normalmente os funcionários internos da organização, ou convidados (guest), pessoas de fora, como parceiros e fornecedores, convidadas pela colaboração B2B para acessar recursos com a própria conta.\n\nOs **grupos** juntam identidades para facilitar a gestão: em vez de dar acesso a cada pessoa, você dá acesso ao grupo. Há dois tipos principais: os grupos de segurança (para conceder acesso a recursos) e os grupos do Microsoft 365 (para colaboração, com caixa de correio e site compartilhados). A associação ao grupo pode ser atribuída (assigned), quando alguém adiciona os membros na mão, ou dinâmica (dynamic), quando as pessoas entram e saem automaticamente conforme atributos como departamento ou cargo. A regra abaixo, por exemplo, coloca no grupo, de forma automática, todo usuário ativo do departamento de Vendas:"
                    },
                    {
                        "type": "code",
                        "value": "user.department -eq \"Vendas\" -and user.accountEnabled -eq true"
                    },
                    {
                        "type": "text",
                        "value": "## Identidades de carga de trabalho: service principals e managed identities\nAplicativos e serviços também precisam de identidade para acessar recursos, e não faria sentido usar a conta de uma pessoa para isso. Aí entram as identidades de carga de trabalho.\n\nA **entidade de serviço (service principal)** é a identidade que um aplicativo assume dentro do tenant para se autenticar e receber permissões. É o 'usuário' do aplicativo. O problema é que alguém precisa cuidar das credenciais (segredos ou certificados) dessa identidade, o que dá trabalho e é arriscado.\n\nA **identidade gerenciada (managed identity)** resolve esse problema: é um tipo especial de service principal cujas credenciais o próprio Entra ID cria e rotaciona sozinho, sem o desenvolvedor guardar senha nenhuma. Ela tem dois sabores: atribuída pelo sistema (system-assigned), que nasce e é excluída junto com o recurso do Azure a que está ligada, e atribuída pelo usuário (user-assigned), que existe de forma independente e pode ser compartilhada por vários recursos."
                    },
                    {
                        "type": "text",
                        "value": "## Dispositivos e o novo agent ID\nOs **dispositivos** (computadores, celulares, tablets) também ganham identidade no Entra ID quando são registrados ou ingressados. Isso permite usar o dispositivo como um sinal nas decisões de acesso, por exemplo exigir que o equipamento seja conhecido e esteja em conformidade antes de liberar um recurso.\n\nO **agent ID** é a novidade: uma identidade de primeira classe para agentes de IA. Com a chegada de assistentes e agentes autônomos que agem em nome da empresa, cada agente passa a ter a própria identidade no Entra, separada da de qualquer pessoa. Um service principal comum não foi feito para governar agentes; o agent ID leva a eles os mesmos controles das outras identidades: permissões de menor privilégio, governança e auditoria de tudo o que o agente acessa e faz."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de identidade\",\"O que representa\",\"Exemplo de uso\"],[\"Usuário\",\"Uma pessoa (membro ou convidado)\",\"Funcionário ou parceiro que faz login\"],[\"Grupo\",\"Um conjunto de identidades\",\"Dar acesso a uma pasta a um time inteiro\"],[\"Service principal\",\"A identidade de um aplicativo no tenant\",\"Um app que chama uma API protegida\"],[\"Managed identity\",\"Um service principal gerenciado pelo Entra, sem credencial manual\",\"Uma VM que acessa o Key Vault sem senha\"],[\"Dispositivo\",\"Um computador ou celular registrado\",\"Exigir um dispositivo conhecido no acesso\"],[\"Agent ID\",\"A identidade de um agente de IA\",\"Governar o que um agente autônomo acessa\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma organização quer conceder acesso a uma pasta compartilhada para todo o time de vendas de uma vez, em vez de liberar pessoa por pessoa. Qual tipo de identidade do Entra ID facilita isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Grupo",
                                "isCorrect": true
                            },
                            {
                                "text": "Service principal",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispositivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Managed identity",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um fornecedor externo precisa acessar um aplicativo da empresa usando a própria conta, sem virar funcionário. No Entra ID, ele é adicionado como que tipo de usuário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Usuário convidado (guest)",
                                "isCorrect": true
                            },
                            {
                                "text": "Usuário membro (member)",
                                "isCorrect": false
                            },
                            {
                                "text": "Service principal",
                                "isCorrect": false
                            },
                            {
                                "text": "Agente de IA",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma máquina virtual do Azure precisa ler segredos do Azure Key Vault sem que ninguém tenha de guardar e rotacionar senhas ou certificados no código. Qual tipo de identidade resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Identidade gerenciada (managed identity)",
                                "isCorrect": true
                            },
                            {
                                "text": "Usuário membro (member)",
                                "isCorrect": false
                            },
                            {
                                "text": "Grupo de segurança (security group)",
                                "isCorrect": false
                            },
                            {
                                "text": "Usuário convidado (guest)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa começou a usar agentes de IA autônomos que acessam dados corporativos por conta própria. A equipe de segurança quer dar a cada agente permissões de menor privilégio e auditar o que ele faz, tratando-o como uma identidade separada das pessoas. Qual recurso do Entra ID atende a isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Agent ID",
                                "isCorrect": true
                            },
                            {
                                "text": "Grupo do Microsoft 365",
                                "isCorrect": false
                            },
                            {
                                "text": "Usuário convidado",
                                "isCorrect": false
                            },
                            {
                                "text": "Smart lockout",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa de uma identidade de aplicativo cujas credenciais sejam criadas e rotacionadas automaticamente pelo Entra ID e que possa ser compartilhada por vários recursos do Azure, existindo de forma independente do ciclo de vida deles. Qual opção descreve exatamente essa identidade?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Identidade gerenciada atribuída pelo usuário (user-assigned)",
                                "isCorrect": true
                            },
                            {
                                "text": "Identidade gerenciada atribuída pelo sistema (system-assigned)",
                                "isCorrect": false
                            },
                            {
                                "text": "Service principal com segredo gerenciado manualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Grupo dinâmico",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Identidade híbrida",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é identidade híbrida\nMuitas empresas não vivem só na nuvem: elas têm um Active Directory local (AD DS) rodando há anos e, ao mesmo tempo, usam Microsoft 365 e Azure. A identidade híbrida conecta esses dois mundos, para que cada pessoa tenha uma única identidade que funciona tanto na rede local quanto na nuvem.\n\nO usuário passa a acessar recursos locais e de nuvem com o mesmo login e a mesma senha, sem precisar gerenciar duas contas. Para o usuário é transparente; para a TI, é a ponte entre o AD DS e o Microsoft Entra ID."
                    },
                    {
                        "type": "text",
                        "value": "## Sincronização com o Microsoft Entra Connect\nA ponte é feita por uma ferramenta de sincronização que copia as identidades do AD DS local para o Entra ID. Há duas opções: o **Microsoft Entra Connect**, instalado em um servidor local e indicado para ambientes maiores e cenários complexos, e o **Microsoft Entra Cloud Sync**, mais leve, baseado em um agente e gerenciado a partir da nuvem.\n\nO que a sincronização faz é manter os dois diretórios alinhados: quando um usuário é criado, alterado ou desativado no AD DS local, a mudança flui para o Entra ID. O AD DS local continua sendo a origem das identidades."
                    },
                    {
                        "type": "text",
                        "value": "## Como a autenticação acontece\nSincronizar as contas é só parte da história; ainda é preciso decidir onde a senha é validada. Existem três métodos:\n\n- **Sincronização de hash de senha (PHS)**: um hash do hash da senha é sincronizado para o Entra ID, e a autenticação acontece na nuvem. É o método mais simples e comum, sem depender do ambiente local no momento do login.\n- **Autenticação de passagem (PTA)**: a senha é validada em tempo real contra o AD DS local, por meio de um agente, sem armazenar hashes de senha na nuvem.\n- **Federação (AD FS)**: a autenticação é delegada a uma infraestrutura de federação separada no ambiente local, usada em cenários mais avançados ou com exigências específicas.\n\nEm todos eles, o objetivo é o mesmo: dar ao usuário logon único entre o mundo local e a nuvem."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método de autenticação híbrida\",\"Onde a senha é validada\",\"Quando costuma ser usado\"],[\"Sincronização de hash de senha (PHS)\",\"Na nuvem, no Entra ID\",\"Cenário mais simples e comum\"],[\"Autenticação de passagem (PTA)\",\"No AD DS local, em tempo real\",\"Quando a validação precisa ficar no ambiente local\"],[\"Federação (AD FS)\",\"Em uma infraestrutura de federação separada\",\"Cenários avançados ou requisitos específicos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa na prova\nO ponto central da identidade híbrida é a experiência de identidade única: uma só conta, um só conjunto de credenciais, funcionando dentro e fora da empresa. Isso melhora a produtividade (menos senhas para lembrar) e a segurança (menos contas soltas para gerenciar). A identidade híbrida também é o que permite estender à nuvem recursos como o autoatendimento de senha, com a gravação de volta (writeback) das alterações para o AD DS local. Para o exame, associe híbrido a 'AD local mais Entra ID sincronizados, uma identidade só'."
                    },
                    {
                        "type": "quote",
                        "value": "Identidade híbrida é uma só identidade para o mundo local e a nuvem: o Microsoft Entra Connect sincroniza as contas do AD DS para o Entra ID, e a autenticação pode ser por hash de senha (PHS), de passagem (PTA) ou federação."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa tem um Active Directory local antigo e agora também usa o Microsoft 365. Ela quer que cada funcionário use o mesmo login e a mesma senha nos dois ambientes. Qual abordagem atende a isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Identidade híbrida",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar contas separadas e sem relação em cada ambiente",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar apenas usuários convidados",
                                "isCorrect": false
                            },
                            {
                                "text": "Desativar o Active Directory local",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual ferramenta é usada para sincronizar as identidades do Active Directory local (AD DS) para o Microsoft Entra ID?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Entra Connect",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Sentinel",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Bastion",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Purview",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização quer implementar identidade híbrida com o método mais simples e comum, em que um hash da senha é sincronizado para a nuvem e a autenticação ocorre no próprio Entra ID. Qual método é esse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sincronização de hash de senha (PHS)",
                                "isCorrect": true
                            },
                            {
                                "text": "Autenticação de passagem em tempo real (PTA)",
                                "isCorrect": false
                            },
                            {
                                "text": "Federação com AD FS",
                                "isCorrect": false
                            },
                            {
                                "text": "Smart lockout",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por política interna, uma empresa exige que a validação da senha aconteça sempre nos servidores locais, em tempo real, sem armazenar hashes de senha na nuvem, mas ainda quer logon único no Microsoft 365. Qual método de autenticação híbrida atende?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Autenticação de passagem (PTA)",
                                "isCorrect": true
                            },
                            {
                                "text": "Sincronização de hash de senha (PHS)",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar contas de nuvem independentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar apenas MFA",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma multinacional já tem uma infraestrutura de federação separada no ambiente local para atender requisitos específicos de autenticação e quer que o Microsoft Entra ID delegue a validação de credenciais a essa infraestrutura. Qual método de autenticação híbrida é o indicado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Federação (AD FS)",
                                "isCorrect": true
                            },
                            {
                                "text": "Sincronização de hash de senha (PHS)",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticação de passagem (PTA)",
                                "isCorrect": false
                            },
                            {
                                "text": "Gravação de senha de volta (password writeback)",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Métodos de autenticação e MFA",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## As três categorias de prova de identidade\nAutenticar é provar que você é quem diz ser. O Microsoft Entra ID aceita vários métodos de autenticação, e todos se encaixam em três categorias clássicas:\n\n- **Algo que você sabe**: uma senha, um PIN ou uma resposta de segurança.\n- **Algo que você tem**: o celular, uma chave de segurança física ou um token.\n- **Algo que você é**: uma característica biométrica, como impressão digital ou reconhecimento facial.\n\nA senha é o método mais antigo e também o mais frágil: pode ser adivinhada, roubada, reutilizada ou vazada. Por isso a tendência é reforçá-la com outros fatores ou substituí-la de vez."
                    },
                    {
                        "type": "text",
                        "value": "## Autenticação sem senha (passwordless)\nA autenticação sem senha troca a senha por um método mais forte, normalmente combinando algo que você tem com algo que você é ou sabe. Os principais métodos são:\n\n- **Windows Hello for Business**: usa biometria ou PIN preso ao dispositivo, sem trafegar senha pela rede.\n- **Chaves de segurança FIDO2**: chaves físicas (USB, NFC) resistentes a phishing.\n- **Aplicativo Microsoft Authenticator**: aprova o login por notificação no celular, podendo substituir a senha.\n\nExistem ainda métodos baseados em telefone que servem como segundo fator, como o **SMS** e a **chamada de voz**, em que um código ou uma confirmação chega ao número cadastrado. Eles são práticos, mas considerados menos seguros que os métodos sem senha, porque a rede telefônica é mais vulnerável a interceptação."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método\",\"Categoria\",\"Observação\"],[\"Senha\",\"Algo que você sabe\",\"O mais comum e o mais frágil\"],[\"Microsoft Authenticator\",\"Algo que você tem\",\"Push ou código no celular; pode ser sem senha\"],[\"Chave FIDO2\",\"Algo que você tem\",\"Física e resistente a phishing\"],[\"Windows Hello for Business\",\"Algo que você é ou sabe\",\"Biometria ou PIN preso ao dispositivo\"],[\"SMS ou chamada de voz\",\"Algo que você tem\",\"Segundo fator prático, porém menos seguro\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que é a autenticação multifator (MFA)\nA autenticação multifator (MFA) exige duas ou mais provas de identidade de categorias diferentes. Não basta pedir duas senhas: é preciso combinar, por exemplo, algo que você sabe (a senha) com algo que você tem (um código no Authenticator) ou algo que você é (biometria).\n\nA lógica é simples: mesmo que um atacante descubra a senha, ele ainda não tem o segundo fator, que está no celular ou no corpo da pessoa. Cada fator adicional de categoria diferente aumenta muito a dificuldade de invadir a conta."
                    },
                    {
                        "type": "text",
                        "value": "## O que a MFA mitiga\nA MFA é uma das defesas mais eficazes contra o comprometimento de contas, porque ataca justamente a fraqueza da senha. Ela mitiga:\n\n- **Senhas vazadas ou reutilizadas**: uma senha roubada em outro site não basta para entrar.\n- **Phishing e roubo de credenciais**: capturar a senha não dá acesso sem o segundo fator.\n- **Pulverização de senha (password spray) e força bruta**: adivinhar a senha ainda esbarra no segundo fator.\n\nPor bloquear a esmagadora maioria dos ataques de comprometimento de conta, a MFA é recomendada para todos os usuários e é especialmente crítica para contas administrativas."
                    },
                    {
                        "type": "quote",
                        "value": "MFA é exigir duas ou mais provas de categorias diferentes (algo que você sabe, tem ou é). Mesmo com a senha vazada, o atacante não passa sem o segundo fator, e é por isso que a MFA mitiga phishing, roubo de credenciais e pulverização de senha."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um banco quer que, além da senha, o cliente confirme o login com um código enviado ao aplicativo no celular. Que tipo de proteção de autenticação ele está aplicando?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Autenticação multifator (MFA)",
                                "isCorrect": true
                            },
                            {
                                "text": "Logon único (SSO)",
                                "isCorrect": false
                            },
                            {
                                "text": "Sincronização de hash de senha",
                                "isCorrect": false
                            },
                            {
                                "text": "Federação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A senha é considerada 'algo que você sabe'. Uma impressão digital, usada para autenticar, se encaixa em qual categoria?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Algo que você é",
                                "isCorrect": true
                            },
                            {
                                "text": "Algo que você tem",
                                "isCorrect": false
                            },
                            {
                                "text": "Algo que você sabe",
                                "isCorrect": false
                            },
                            {
                                "text": "Algo que você faz",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer eliminar a senha e adotar um método de autenticação resistente a phishing, baseado em uma chave física conectada por USB. Qual método atende a esse pedido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Chave de segurança FIDO2",
                                "isCorrect": true
                            },
                            {
                                "text": "SMS",
                                "isCorrect": false
                            },
                            {
                                "text": "Senha com resposta de segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "Chamada de voz",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário reclama que precisa digitar duas senhas diferentes para entrar. A equipe explica que isso não é MFA de verdade. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque as duas senhas são da mesma categoria de fator",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a MFA só é válida quando o segundo fator é biometria",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a MFA exige a combinação de exatamente três fatores",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a senha é antiga demais para ser aceita em qualquer MFA",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Após um vazamento em outro site, atacantes tentaram usar as senhas expostas dos funcionários para acessar o Microsoft 365 da empresa, mas nenhuma tentativa teve sucesso, mesmo com a senha correta. Qual controle mais provavelmente barrou os acessos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A MFA, que bloqueou o login sem o segundo fator",
                                "isCorrect": true
                            },
                            {
                                "text": "O logon único (SSO), que reduz o número de senhas",
                                "isCorrect": false
                            },
                            {
                                "text": "A sincronização de hash de senha (PHS)",
                                "isCorrect": false
                            },
                            {
                                "text": "A criação de grupos dinâmicos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Proteção e gestão de senha",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Proteger a senha, mesmo com MFA\nA MFA reforça o login, mas a senha continua existindo e precisa ser protegida e bem administrada. O Microsoft Entra ID traz recursos para reduzir chamados de suporte, barrar senhas fracas e conter ataques de adivinhação. Os três mais cobrados são o autoatendimento de redefinição de senha (SSPR), a proteção de senha com listas de banidas e o smart lockout."
                    },
                    {
                        "type": "text",
                        "value": "## Autoatendimento de redefinição de senha (SSPR)\nO self-service password reset (SSPR) permite que o próprio usuário redefina ou desbloqueie a senha sozinho, sem abrir chamado no help desk. Para isso, ele registra antes métodos de autenticação, como o aplicativo Authenticator, o e-mail alternativo, o telefone ou perguntas de segurança. Na hora de esquecer a senha, o Entra confirma a identidade por esses métodos e libera a redefinição.\n\nO ganho é duplo: menos trabalho e custo para o suporte e mais autonomia para o usuário. Em ambientes híbridos, o SSPR pode gravar a nova senha de volta no AD DS local (password writeback), mantendo os dois mundos em sincronia."
                    },
                    {
                        "type": "text",
                        "value": "## Proteção de senha e listas de banidas\nO Microsoft Entra Password Protection impede que as pessoas escolham senhas fracas ou fáceis de adivinhar. Ele usa uma **lista global de senhas banidas**, mantida pela Microsoft com termos e senhas sabidamente ruins e vazados, e permite ainda uma **lista personalizada** com palavras específicas da organização, como o nome da empresa, os produtos ou a cidade sede.\n\nA verificação é esperta: ela também pega variações e substituições comuns (trocar 'a' por arroba, 'o' por zero), então uma senha como 'Empresa123' é barrada se 'Empresa' estiver na lista. Esse mesmo recurso pode ser estendido ao Active Directory local, aplicando as regras de senha também nas trocas feitas no ambiente on-premises."
                    },
                    {
                        "type": "text",
                        "value": "## Smart lockout\nO smart lockout protege as contas contra ataques de adivinhação de senha, como força bruta e pulverização de senha, bloqueando temporariamente o login após várias tentativas erradas. O diferencial é ser 'esperto': ele tenta distinguir o dono legítimo da conta de um atacante, reconhecendo, por exemplo, locais e padrões conhecidos, para não travar o usuário de verdade enquanto barra o invasor. Assim, quem erra a própria senha algumas vezes não fica refém das tentativas maliciosas que vêm de fora."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Recurso\",\"O que faz\",\"Contra o que protege\"],[\"SSPR\",\"O usuário redefine a própria senha sem o help desk\",\"Custo de suporte e espera do usuário\"],[\"Password Protection (banidas)\",\"Bloqueia senhas fracas, da lista global e da personalizada\",\"Senhas fáceis de adivinhar\"],[\"Smart lockout\",\"Bloqueia o login após tentativas erradas, distinguindo o usuário do atacante\",\"Força bruta e pulverização de senha\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "SSPR devolve ao usuário o poder de redefinir a própria senha; a proteção de senha barra as fracas por listas de banidas; e o smart lockout trava o atacante que fica adivinhando sem prender o dono da conta."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa quer que os funcionários consigam redefinir a própria senha esquecida sem precisar ligar para o suporte. Qual recurso do Microsoft Entra ID atende?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Autoatendimento de redefinição de senha (SSPR)",
                                "isCorrect": true
                            },
                            {
                                "text": "Bloqueio temporário após tentativas erradas (smart lockout)",
                                "isCorrect": false
                            },
                            {
                                "text": "Federação com um provedor externo (AD FS)",
                                "isCorrect": false
                            },
                            {
                                "text": "Grupo dinâmico baseado em atributos do usuário",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual recurso do Entra ID impede que os usuários escolham senhas fracas e conhecidas, como variações de 'senha123'?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Entra Password Protection (lista de senhas banidas)",
                                "isCorrect": true
                            },
                            {
                                "text": "Logon único (SSO), com um único login para todos os aplicativos",
                                "isCorrect": false
                            },
                            {
                                "text": "Managed identity, sem senha para gerenciar",
                                "isCorrect": false
                            },
                            {
                                "text": "Gravação de senha de volta (password writeback)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time de segurança percebe muitas tentativas automatizadas de adivinhar senhas de várias contas. Eles querem bloquear esses ataques sem travar os funcionários legítimos que às vezes erram a própria senha. Qual recurso atende melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Smart lockout",
                                "isCorrect": true
                            },
                            {
                                "text": "SSPR",
                                "isCorrect": false
                            },
                            {
                                "text": "Sincronização de hash de senha",
                                "isCorrect": false
                            },
                            {
                                "text": "Grupo de segurança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização quer proibir que os usuários usem o nome da própria empresa e o nome dos seus produtos como senha, além das senhas fracas que a Microsoft já bloqueia globalmente. Como fazer isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Lista personalizada de senhas banidas no Password Protection",
                                "isCorrect": true
                            },
                            {
                                "text": "Ativar o smart lockout para tentativas repetidas de login",
                                "isCorrect": false
                            },
                            {
                                "text": "Habilitar o SSPR para autoatendimento de redefinição",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma identidade gerenciada para o aplicativo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um ambiente de identidade híbrida, uma empresa habilitou o SSPR e quer que, quando o usuário redefinir a senha na nuvem, a nova senha também passe a valer no Active Directory local. Qual recurso torna isso possível?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Gravação de senha de volta (password writeback)",
                                "isCorrect": true
                            },
                            {
                                "text": "Smart lockout para bloquear tentativas de login",
                                "isCorrect": false
                            },
                            {
                                "text": "Lista de senhas banidas do Password Protection",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticação de passagem (PTA)",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Microsoft Entra: acesso e governança",
        "aulas": [
            {
                "titulo": "Acesso Condicional",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é o Acesso Condicional\nO Acesso Condicional (Conditional Access) é o motor de políticas do Microsoft Entra que decide, a cada tentativa de acesso, se ela pode prosseguir e sob quais condições. Ele funciona como uma regra do tipo se-então (if-then): SE um conjunto de sinais for verdadeiro, ENTÃO aplica-se uma decisão, como bloquear o acesso ou concedê-lo exigindo um controle a mais.\n\nA verificação acontece depois do primeiro fator de autenticação, quando a conta e a senha já foram checadas. O Acesso Condicional entra em seguida para reunir o contexto do login e reforçar a segurança sem atrapalhar quem está em situação de baixo risco. É a peça central do Zero Trust dentro do Entra: nunca confiar cegamente, sempre verificar o contexto."
                    },
                    {
                        "type": "text",
                        "value": "## Os sinais que a política avalia\nA política reúne vários sinais para entender o contexto da tentativa de acesso:\n\n- Usuário ou grupo: quem está tentando entrar (por exemplo, todos os usuários, um grupo específico ou papéis de administrador).\n- Aplicativo ou recurso de destino: o que a pessoa quer acessar (um app de nuvem, o portal de administração, etc.).\n- Localização: de onde vem o acesso, com base no IP ou no país, usando locais nomeados marcados como confiáveis.\n- Dispositivo: a plataforma (Windows, iOS, Android) e o estado do aparelho, como estar registrado, ingressado ou marcado como compatível.\n- Aplicativo cliente: se o acesso vem de um navegador, de um app móvel ou de protocolos de autenticação legada.\n- Risco em tempo real: o risco de entrada e o risco de usuário calculados pelo Entra ID Protection.\n\nQuanto mais sinais a política considera, mais fina fica a decisão."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal\", \"Exemplo\", \"Para que serve\"], [\"Usuário ou grupo\", \"Grupo Financeiro, papéis de administrador\", \"Aplicar regras diferentes por público\"], [\"Aplicativo de destino\", \"App de RH, portal de administração\", \"Proteger recursos mais sensíveis\"], [\"Localização\", \"IP corporativo, país\", \"Distinguir acesso interno de externo\"], [\"Dispositivo\", \"Marcado como compatível, ingressado no Entra\", \"Exigir equipamento gerenciado\"], [\"Aplicativo cliente\", \"Navegador, app móvel, autenticação legada\", \"Bloquear protocolos inseguros\"], [\"Risco (ID Protection)\", \"Entrada de alto risco\", \"Reagir a sinais de comprometimento\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## As decisões e os controles\nDepois de avaliar os sinais, a política toma uma decisão. São duas saídas possíveis:\n\n- Bloquear o acesso: a tentativa é barrada, não importa o resto.\n- Conceder o acesso: liberado, mas normalmente exigindo um ou mais controles de concessão (grant), como:\n  - exigir autenticação multifator (MFA);\n  - exigir que o dispositivo esteja marcado como compatível;\n  - exigir dispositivo ingressado no Microsoft Entra híbrido;\n  - exigir um aplicativo cliente aprovado ou uma política de proteção de aplicativo;\n  - exigir troca de senha ou o aceite dos termos de uso.\n\nHá ainda os controles de sessão, que limitam o que a pessoa pode fazer depois de entrar, como restringir downloads em dispositivos não gerenciados ou definir com que frequência é preciso autenticar de novo. A ideia é conceder o mínimo necessário para cada contexto."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"nome\": \"Exigir MFA fora da rede corporativa\",\n  \"se\": {\n    \"usuarios\": [\"Todos\"],\n    \"aplicativos\": [\"Todas as nuvens\"],\n    \"localizacao\": \"fora dos locais confiaveis\",\n    \"risco_de_entrada\": \"medio ou alto\"\n  },\n  \"entao\": {\n    \"conceder\": true,\n    \"controles\": [\"exigir MFA\", \"exigir dispositivo compativel\"]\n  }\n}"
                    },
                    {
                        "type": "quote",
                        "value": "O Acesso Condicional é uma regra se-então: reúne sinais como usuário, dispositivo, localização e risco e decide entre bloquear o acesso ou concedê-lo exigindo controles como o MFA."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa quer que qualquer acesso feito de fora da rede corporativa exija MFA, mas dispense o MFA quando o acesso vem do escritório. Qual recurso do Microsoft Entra atende a essa regra?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Acesso Condicional",
                                "isCorrect": true
                            },
                            {
                                "text": "Privileged Identity Management (PIM)",
                                "isCorrect": false
                            },
                            {
                                "text": "Revisões de acesso",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerenciamento de titularidade (entitlement management)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Acesso Condicional, depois de avaliar os sinais, qual das opções é um exemplo de controle de concessão (grant)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Exigir autenticação multifator (MFA)",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar um pacote de acesso",
                                "isCorrect": false
                            },
                            {
                                "text": "Ativar um papel elegível no PIM",
                                "isCorrect": false
                            },
                            {
                                "text": "Rotular um documento como confidencial",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização não tem operações em determinados países e quer impedir por completo qualquer tentativa de acesso vinda de lá. Como configurar isso no Acesso Condicional?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma política que usa a localização e bloqueia o acesso",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma revisão de acesso trimestral para esses países",
                                "isCorrect": false
                            },
                            {
                                "text": "Um pacote de acesso com aprovação obrigatória para todos os países",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma atribuição de RBAC do Azure no grupo de recursos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A área de segurança quer permitir o acesso ao e-mail corporativo apenas em dispositivos gerenciados e em conformidade com as políticas da empresa. Que controle do Acesso Condicional resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Conceder o acesso exigindo dispositivo marcado como compatível",
                                "isCorrect": true
                            },
                            {
                                "text": "Bloquear por completo todos os aplicativos de e-mail corporativo",
                                "isCorrect": false
                            },
                            {
                                "text": "Exigir a criação de um pacote de acesso no entitlement management",
                                "isCorrect": false
                            },
                            {
                                "text": "Exigir a ativação do papel de administrador via PIM",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer que, sempre que o Entra detectar uma entrada de alto risco, o usuário seja forçado a fazer MFA antes de concluir o acesso. Qual combinação atende a esse objetivo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Política de Acesso Condicional por risco de entrada, exigindo MFA",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma atribuição de papel do Entra que concede MFA permanente ao usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma revisão de acesso que remove o usuário quando o risco sobe",
                                "isCorrect": false
                            },
                            {
                                "text": "Um pacote de acesso do entitlement management com validade curta",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Papéis do Entra e RBAC do Azure",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Autorização com o mínimo de privilégio\nDepois que a identidade é autenticada, vem a autorização: decidir o que aquela identidade pode fazer. No mundo Microsoft, a autorização por papéis segue o princípio do privilégio mínimo, ou seja, conceder apenas as permissões necessárias para a tarefa e nada além.\n\nO ponto que mais cai na prova é que existem dois sistemas de papéis diferentes e independentes: os papéis do Microsoft Entra e o RBAC do Azure (controle de acesso baseado em função). Eles controlam coisas distintas e não são a mesma coisa."
                    },
                    {
                        "type": "text",
                        "value": "## Papéis do Microsoft Entra\nOs papéis do Entra, também chamados de papéis de diretório, controlam o acesso aos recursos de identidade do próprio Entra: criar e gerenciar usuários, redefinir senhas, administrar grupos, registrar aplicativos, configurar métodos de autenticação e outras tarefas de diretório.\n\nAlguns exemplos comuns:\n- Administrador Global: controle total sobre o tenant, deve ser usado com muita parcimônia.\n- Administrador de Usuário: gerencia usuários e grupos.\n- Administrador de Suporte Técnico (Helpdesk): redefine senhas de usuários.\n- Administrador de Aplicativo: gerencia registros de aplicativos.\n\nEsses papéis costumam valer para todo o tenant, embora unidades administrativas permitam limitar o alcance a um subconjunto de usuários."
                    },
                    {
                        "type": "text",
                        "value": "## RBAC do Azure\nO RBAC do Azure controla o acesso aos recursos do Azure: assinaturas, grupos de recursos, máquinas virtuais, contas de armazenamento, redes e assim por diante.\n\nUma atribuição de RBAC é sempre a combinação de três coisas:\n- Entidade de segurança (quem): um usuário, grupo, entidade de serviço ou identidade gerenciada.\n- Definição de função (o que pode fazer): como Proprietário (Owner), Colaborador (Contributor) ou Leitor (Reader).\n- Escopo (onde vale): o nível em que a permissão se aplica, que pode ser grupo de gerenciamento, assinatura, grupo de recursos ou um recurso específico. As permissões são herdadas dos níveis mais altos para os mais baixos.\n\nAssim você dá a alguém, por exemplo, o papel de Colaborador apenas em um grupo de recursos, sem tocar no resto da assinatura."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Papéis do Microsoft Entra\", \"RBAC do Azure\"], [\"O que controla\", \"Recursos de identidade e diretório\", \"Recursos do Azure\"], [\"Exemplos de tarefa\", \"Criar usuário, redefinir senha, gerenciar grupos\", \"Gerenciar VMs, armazenamento e redes\"], [\"Exemplos de papel\", \"Administrador Global, Administrador de Usuário\", \"Proprietário, Colaborador, Leitor\"], [\"Escopo típico\", \"Tenant ou unidade administrativa\", \"Grupo de gerenciamento, assinatura, grupo de recursos ou recurso\"]]"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cenário\", \"Sistema correto\"], [\"Redefinir a senha de um funcionário\", \"Papel do Entra\"], [\"Dar acesso de leitura a uma conta de armazenamento\", \"RBAC do Azure\"], [\"Registrar um novo aplicativo no diretório\", \"Papel do Entra\"], [\"Permitir gerenciar as VMs de um grupo de recursos\", \"RBAC do Azure\"], [\"Gerenciar os métodos de MFA dos usuários\", \"Papel do Entra\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Papéis do Entra gerenciam identidades e o diretório (usuários, grupos, apps); o RBAC do Azure gerencia recursos do Azure (assinaturas, VMs, armazenamento). São sistemas separados e independentes."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um analista de suporte precisa redefinir senhas e gerenciar contas de usuário no Microsoft Entra, sem tocar em recursos do Azure. Que tipo de papel deve ser atribuído a ele?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um papel do Entra, como Administrador de Suporte Técnico ou de Usuário",
                                "isCorrect": true
                            },
                            {
                                "text": "Um papel de RBAC do Azure, como Colaborador na assinatura",
                                "isCorrect": false
                            },
                            {
                                "text": "Um papel de RBAC do Azure, como Proprietário do grupo de recursos",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum papel; basta habilitar o MFA da conta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Conceder a uma identidade apenas as permissões necessárias para a tarefa, e nada além disso, é a aplicação de qual princípio?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Privilégio mínimo",
                                "isCorrect": true
                            },
                            {
                                "text": "Responsabilidade compartilhada",
                                "isCorrect": false
                            },
                            {
                                "text": "Federação",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografia em repouso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa precisa gerenciar as máquinas virtuais de um único grupo de recursos, sem acesso ao restante da assinatura. Qual é a abordagem correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Atribuir RBAC do Azure como Colaborador, com escopo no grupo de recursos",
                                "isCorrect": true
                            },
                            {
                                "text": "Atribuir o papel de Administrador Global do Entra para toda a organização",
                                "isCorrect": false
                            },
                            {
                                "text": "Atribuir o papel de Administrador de Usuário do Entra no tenant inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma política de Acesso Condicional restrita às VMs",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve corretamente a diferença entre os papéis do Entra e o RBAC do Azure?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Papéis do Entra controlam identidade e diretório; RBAC do Azure controla recursos como VMs",
                                "isCorrect": true
                            },
                            {
                                "text": "Papéis do Entra controlam VMs e armazenamento; o RBAC do Azure controla usuários e grupos",
                                "isCorrect": false
                            },
                            {
                                "text": "São o mesmo sistema, apenas com nomes diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Papéis do Entra valem só para convidados; o RBAC do Azure vale só para funcionários",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colaborador precisa, ao mesmo tempo, gerenciar contas de usuário no diretório e ter acesso de leitura a uma conta de armazenamento do Azure. O que é necessário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um papel do Entra para as contas, e um RBAC do Azure separado para o armazenamento",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas um papel do Entra, que já concede acesso automático aos recursos do Azure",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas uma atribuição de RBAC do Azure, que já cobre o diretório",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada além do MFA, que libera os dois acessos de uma vez",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Entra ID Governance e revisões de acesso",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é o Entra ID Governance\nO Microsoft Entra ID Governance é o conjunto de recursos que garante que as pessoas certas tenham o acesso certo aos recursos certos, no momento certo, equilibrando segurança e produtividade. Ele ajuda a responder quatro perguntas: quais usuários têm acesso a quê, o que eles fazem com esse acesso, existem controles eficazes e os auditores conseguem verificar tudo isso.\n\nOs pilares cobrados no SC-900 são o gerenciamento de titularidade (entitlement management), o gerenciamento do ciclo de vida (lifecycle management) e as revisões de acesso (access reviews). O Privileged Identity Management também faz parte da governança e é o tema da próxima aula."
                    },
                    {
                        "type": "text",
                        "value": "## Gerenciamento de titularidade (entitlement management)\nO entitlement management permite gerenciar o acesso em escala por meio de pacotes de acesso. Um pacote de acesso agrupa todos os recursos de que alguém precisa para um projeto ou função (grupos, aplicativos, sites do SharePoint) junto com uma política que define quem pode solicitar, se há aprovação e quando o acesso expira.\n\nOs pacotes ficam organizados em catálogos. O usuário solicita o pacote por autoatendimento, passa pela aprovação quando existe, recebe o acesso e o perde automaticamente no vencimento. É especialmente útil para conceder acesso a usuários externos, como parceiros e fornecedores, sem que a TI precise liberar recurso por recurso manualmente."
                    },
                    {
                        "type": "text",
                        "value": "## Gerenciamento do ciclo de vida\nO gerenciamento do ciclo de vida cuida da identidade ao longo das fases de entrada, mudança e saída de uma pessoa, o ciclo joiner-mover-leaver (entra, muda, sai). Os fluxos de trabalho de ciclo de vida (lifecycle workflows) automatizam essas tarefas com base nos atributos do usuário.\n\nQuando alguém é contratado, o fluxo pode provisionar contas, adicionar aos grupos certos e enviar as boas-vindas. Quando a pessoa muda de área, ajusta os acessos. Quando se desliga da empresa, remove acessos e desativa a conta. Isso evita que alguém acumule permissões indevidas ou continue com acesso depois de sair."
                    },
                    {
                        "type": "text",
                        "value": "## Revisões de acesso (access reviews)\nAs revisões de acesso verificam periodicamente se as pessoas ainda precisam do acesso que possuem. Em vez de deixar permissões acumuladas para sempre, a organização recertifica de tempos em tempos e remove o que não é mais necessário, sustentando o privilégio mínimo e atendendo à conformidade.\n\nÉ possível revisar a associação a grupos, o acesso a aplicativos, as atribuições de papéis (do Entra e do Azure) e os pacotes de acesso. Os revisores podem ser o próprio usuário, o gestor, o dono do recurso ou pessoas designadas. Ao final, o acesso é aprovado ou removido, e a revisão pode aplicar o resultado automaticamente, inclusive removendo quem não respondeu."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Recurso\", \"Para que serve\", \"Cenário típico\"], [\"Entitlement management\", \"Conceder pacotes de acesso sob solicitação, com aprovação e validade\", \"Fornecedor externo pede acesso a um conjunto de apps\"], [\"Gerenciamento do ciclo de vida\", \"Automatizar entrada, mudança e saída de pessoas\", \"Provisionar e desprovisionar contas de funcionários\"], [\"Revisões de acesso\", \"Recertificar periodicamente quem ainda precisa de acesso\", \"Gestor revisa a cada trimestre a associação a um grupo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O Entra ID Governance dá o acesso certo, à pessoa certa, na hora certa: pacotes de acesso concedem sob solicitação, os fluxos de ciclo de vida automatizam entrada e saída, e as revisões de acesso recertificam quem ainda precisa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Fornecedores externos precisam solicitar por conta própria um conjunto de aplicativos e grupos, com aprovação e um prazo de validade para o acesso. Qual recurso do Entra ID Governance atende a isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Gerenciamento de titularidade, com pacotes de acesso",
                                "isCorrect": true
                            },
                            {
                                "text": "Privileged Identity Management (PIM), com ativação temporária",
                                "isCorrect": false
                            },
                            {
                                "text": "Acesso Condicional, bloqueando por localização",
                                "isCorrect": false
                            },
                            {
                                "text": "Detecção de risco do ID Protection, sinalizando o login",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer verificar de tempos em tempos se os funcionários ainda precisam do acesso que possuem, removendo o que não é mais necessário. Qual recurso faz isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Revisões de acesso",
                                "isCorrect": true
                            },
                            {
                                "text": "Gerenciamento de titularidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticação multifator",
                                "isCorrect": false
                            },
                            {
                                "text": "Federação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O RH quer automatizar as tarefas de quando um funcionário é contratado, muda de área ou é desligado, provisionando e removendo acessos com base nos atributos da pessoa. Qual recurso do Entra ID Governance é indicado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Gerenciamento do ciclo de vida (lifecycle management)",
                                "isCorrect": true
                            },
                            {
                                "text": "Gerenciamento de titularidade com pacotes de acesso",
                                "isCorrect": false
                            },
                            {
                                "text": "Revisões de acesso",
                                "isCorrect": false
                            },
                            {
                                "text": "Privileged Identity Management (PIM)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A cada trimestre, cada gestor deve confirmar se os membros da sua equipe ainda precisam pertencer a um grupo de acesso; se o gestor não responder, o acesso deve ser removido automaticamente. Que recurso oferece esse fluxo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Revisões de acesso",
                                "isCorrect": true
                            },
                            {
                                "text": "Pacotes de acesso do entitlement management",
                                "isCorrect": false
                            },
                            {
                                "text": "Acesso Condicional baseado em risco",
                                "isCorrect": false
                            },
                            {
                                "text": "Ativação de papel via PIM",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer que novos parceiros solicitem por autoatendimento um conjunto de recursos, com aprovação e validade, e também quer recertificar periodicamente se esses parceiros ainda precisam do acesso. Quais dois recursos do Entra ID Governance combinam para isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Gerenciamento de titularidade para a solicitação e revisões de acesso para a recertificação",
                                "isCorrect": true
                            },
                            {
                                "text": "Privileged Identity Management para a solicitação e Acesso Condicional para a recertificação",
                                "isCorrect": false
                            },
                            {
                                "text": "Fluxos de ciclo de vida para a solicitação e detecção de risco para a recertificação",
                                "isCorrect": false
                            },
                            {
                                "text": "Acesso Condicional para a solicitação e RBAC do Azure para a recertificação",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Privileged Identity Management (PIM)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O problema do acesso permanente\nContas com papéis privilegiados de forma permanente são um alvo e tanto. Se um Administrador Global fica sempre ativo, basta comprometer aquela conta para dominar o tenant inteiro. Esse acesso permanente e ocioso, o chamado standing access, aumenta desnecessariamente a superfície de ataque, porque o poder está sempre disponível, mesmo quando ninguém está usando."
                    },
                    {
                        "type": "text",
                        "value": "## O que o PIM faz\nO Privileged Identity Management (PIM) gerencia, controla e monitora o acesso a papéis privilegiados, tanto papéis do Entra quanto papéis do Azure. A ideia central é o acesso just-in-time (JIT): em vez de o administrador ter o papel o tempo todo, ele fica apenas elegível ao papel e o ativa só quando precisa, por um tempo limitado.\n\nA ativação pode exigir controles adicionais: fazer MFA, justificar o motivo, informar um número de chamado e até passar pela aprovação de outra pessoa. Assim, o privilégio é temporário, rastreável e concedido sob demanda, não uma posse permanente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de atribuição\", \"O que significa\", \"Efeito na prática\"], [\"Elegível (eligible)\", \"O usuário pode ativar o papel quando precisar\", \"Sem privilégio permanente; ativa por tempo limitado\"], [\"Ativa (active)\", \"O usuário já tem o papel atribuído\", \"Privilégio disponível o tempo todo até expirar ou ser removido\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Ativação e governança contínua\nQuando um usuário elegível ativa um papel pelo PIM, o acesso vale por uma janela de tempo e expira sozinho ao final, voltando ao estado elegível. Toda ativação pode disparar notificações e fica registrada no histórico de auditoria, o que dá visibilidade de quem usou qual privilégio e quando.\n\nO PIM ainda permite alertas para situações suspeitas e revisões de acesso específicas dos papéis privilegiados, para confirmar de tempos em tempos que cada pessoa ainda precisa continuar elegível. É a aplicação do privilégio mínimo justamente onde o risco é maior."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Necessidade\", \"Como o PIM atende\"], [\"Ninguém deve ter papel de admin permanente\", \"Atribuições elegíveis, ativadas só quando necessário\"], [\"Ativar um papel crítico deve exigir aprovação e MFA\", \"Configurações de ativação do PIM\"], [\"Saber quem usou privilégios e quando\", \"Histórico de auditoria e alertas\"], [\"Revisar periodicamente quem continua admin\", \"Revisões de acesso dos papéis privilegiados\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O PIM troca o acesso permanente pelo acesso just-in-time: o administrador fica apenas elegível e ativa o papel por tempo limitado, com MFA, justificativa e aprovação, reduzindo o privilégio permanente onde o risco é maior."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma organização quer reduzir a quantidade de administradores com poderes permanentes, fazendo com que eles recebam o papel privilegiado apenas quando precisam e por tempo limitado. Qual recurso do Entra faz isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Privileged Identity Management (PIM)",
                                "isCorrect": true
                            },
                            {
                                "text": "Acesso Condicional baseado em localização",
                                "isCorrect": false
                            },
                            {
                                "text": "Revisões de acesso periódicas",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerenciamento de titularidade e pacotes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No PIM, como é chamado o usuário que pode ativar um papel privilegiado quando precisa, mas não o mantém atribuído de forma permanente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Elegível (eligible)",
                                "isCorrect": true
                            },
                            {
                                "text": "Ativo permanente",
                                "isCorrect": false
                            },
                            {
                                "text": "Convidado (guest)",
                                "isCorrect": false
                            },
                            {
                                "text": "Proprietário (owner)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A segurança exige que a ativação do papel de Administrador Global só aconteça com aprovação de outra pessoa, MFA e uma justificativa registrada. Onde esses requisitos de ativação são configurados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nas configurações de ativação do papel no PIM",
                                "isCorrect": true
                            },
                            {
                                "text": "Em uma política de Acesso Condicional de localização",
                                "isCorrect": false
                            },
                            {
                                "text": "Em uma revisão de acesso trimestral",
                                "isCorrect": false
                            },
                            {
                                "text": "Em um pacote de acesso do entitlement management",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o principal benefício de segurança do acesso just-in-time do PIM em comparação a manter administradores com papéis sempre ativos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduz o privilégio permanente, pois o poder só existe durante a ativação",
                                "isCorrect": true
                            },
                            {
                                "text": "Elimina a necessidade de autenticação multifator",
                                "isCorrect": false
                            },
                            {
                                "text": "Concede automaticamente acesso aos recursos do Azure e do diretório de uma só vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui as políticas de Acesso Condicional",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A equipe de segurança determinou que ninguém pode ter o papel de Administrador Global de forma permanente, que cada ativação seja temporária e aprovada, e que a lista de quem continua elegível seja revisada periodicamente. Quais recursos, combinados, atendem a todos esses requisitos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "PIM com ativação elegível e aprovada, mais revisões periódicas de acesso",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas uma política de Acesso Condicional que exige MFA para administradores",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas um pacote de acesso do entitlement management com validade curta",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o Entra ID Protection detectando administradores de risco",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Microsoft Entra ID Protection",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é o Entra ID Protection\nO Microsoft Entra ID Protection detecta, investiga e ajuda a remediar riscos baseados em identidade. Ele analisa continuamente sinais de cada conta e de cada tentativa de entrada, usando a inteligência de ameaças da Microsoft, e calcula um nível de risco (baixo, médio ou alto).\n\nO objetivo não é só apontar o risco, mas permitir reagir a ele automaticamente, por exemplo forçando um MFA ou uma troca de senha antes de liberar o acesso."
                    },
                    {
                        "type": "text",
                        "value": "## Risco de entrada e risco de usuário\nO ID Protection separa o risco em dois tipos, e saber diferenciá-los é o que mais cai na prova:\n\n- Risco de entrada (sign-in risk): a probabilidade de que uma tentativa de entrada específica não seja do dono legítimo da conta. Vem de sinais do momento do login, como um endereço IP anônimo (rede Tor), uma viagem atípica (dois logins distantes em pouco tempo), propriedades de entrada desconhecidas ou um IP ligado a malware.\n- Risco de usuário (user risk): a probabilidade de que a própria conta esteja comprometida. O sinal clássico é o de credenciais vazadas, quando o usuário e a senha aparecem em um vazamento conhecido, além de indicações da inteligência de ameaças do Entra.\n\nEm resumo: o risco de entrada olha para o login atual; o risco de usuário olha para a conta como um todo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Risco de entrada (sign-in)\", \"Risco de usuário (user)\"], [\"Pergunta que responde\", \"Este login é do dono legítimo?\", \"Esta conta está comprometida?\"], [\"Detecções típicas\", \"IP anônimo, viagem atípica, propriedades desconhecidas\", \"Credenciais vazadas, inteligência de ameaças\"], [\"Foco\", \"A tentativa de entrada atual\", \"A conta como um todo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Políticas de risco e relatórios\nO grande valor do ID Protection aparece quando o risco alimenta o Acesso Condicional. Com políticas baseadas em risco, você define reações automáticas: diante de uma entrada de risco médio ou alto, exigir MFA; diante de um usuário de alto risco, exigir uma troca segura de senha; e, se preferir, bloquear.\n\nPara investigar, o ID Protection oferece três relatórios principais: usuários de risco, entradas de risco e detecções de risco. Os dados de risco também podem ser exportados para ferramentas como o Microsoft Sentinel, permitindo correlacionar com outros eventos de segurança."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal detectado\", \"Tipo de risco\"], [\"Login vindo de um IP anônimo (rede Tor)\", \"Risco de entrada\"], [\"Usuário e senha encontrados em um vazamento\", \"Risco de usuário\"], [\"Dois logins em países distantes com minutos de diferença\", \"Risco de entrada (viagem atípica)\"], [\"Conta sinalizada pela inteligência de ameaças do Entra\", \"Risco de usuário\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "No Entra ID Protection, o risco de entrada avalia se o login atual é do dono legítimo (IP anônimo, viagem atípica), e o risco de usuário avalia se a conta está comprometida (credenciais vazadas). Combinado ao Acesso Condicional, ele reage sozinho exigindo MFA ou troca de senha."
                    }
                ],
                "questions": [
                    {
                        "statement": "O Entra descobriu que o usuário e a senha de uma conta apareceram em um vazamento de dados conhecido, o que sugere que a conta pode estar comprometida. Como o ID Protection classifica esse sinal?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Risco de usuário",
                                "isCorrect": true
                            },
                            {
                                "text": "Risco de entrada",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispositivo não compatível",
                                "isCorrect": false
                            },
                            {
                                "text": "Localização confiável",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a função principal do Microsoft Entra ID Protection?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Detectar, investigar e remediar riscos de identidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Gerenciar as permissões de recursos do Azure via RBAC",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar pacotes de acesso para usuários externos",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografar os dados armazenados no tenant",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O Entra registrou dois logins da mesma conta, um no Brasil e outro no Japão, com apenas dez minutos de diferença, algo fisicamente impossível. Que tipo de risco o ID Protection sinaliza aqui?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Risco de entrada (viagem atípica)",
                                "isCorrect": true
                            },
                            {
                                "text": "Risco de usuário (credenciais vazadas)",
                                "isCorrect": false
                            },
                            {
                                "text": "Privilégio permanente excessivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Falha de federação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer que, automaticamente, um usuário sinalizado como de alto risco seja obrigado a fazer uma troca segura de senha antes de continuar, e que entradas de risco médio exijam MFA. Como implementar isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Com Acesso Condicional baseado em risco, integrado ao ID Protection",
                                "isCorrect": true
                            },
                            {
                                "text": "Com atribuições elegíveis no PIM para administradores de risco",
                                "isCorrect": false
                            },
                            {
                                "text": "Com pacotes de acesso do entitlement management com validade curta",
                                "isCorrect": false
                            },
                            {
                                "text": "Com papéis do Entra atribuídos manualmente aos usuários de risco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O ID Protection detectou, para a mesma conta, dois sinais: as credenciais foram encontradas em um vazamento e, em outro momento, houve uma tentativa de login a partir de um endereço IP anônimo (rede Tor). Como esses dois sinais são classificados, respectivamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Risco de usuário (credenciais vazadas) e risco de entrada (IP anônimo)",
                                "isCorrect": true
                            },
                            {
                                "text": "Risco de entrada (credenciais vazadas) e risco de usuário (IP anônimo)",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos como risco de entrada",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos como risco de usuário",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Segurança de infraestrutura no Azure",
        "aulas": [
            {
                "titulo": "Segmentação de rede com redes virtuais (VNets) e sub-redes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Defesa em profundidade começa na rede\nUm dos jeitos mais eficazes de proteger cargas de trabalho na nuvem é não deixar tudo num mesmo espaço aberto. A segmentação de rede divide o ambiente em zonas isoladas, de modo que um problema em uma parte não se espalhe para as outras. É a aplicação do princípio de defesa em profundidade na camada de rede: várias barreiras, uma dentro da outra.\n\nNo Azure, a base dessa segmentação é a rede virtual, a VNet. Uma VNet é a sua rede privada dentro do Azure, isolada por padrão das redes de outros clientes. Dentro dela, os recursos, como máquinas virtuais, conversam entre si de forma privada e segura, e você controla o que entra e o que sai."
                    },
                    {
                        "type": "text",
                        "value": "## Sub-redes dividem a VNet\nUma VNet pode ser fatiada em sub-redes (subnets), que são faixas menores dentro do espaço de endereços da rede. Cada sub-rede agrupa recursos com uma função parecida, e isso permite tratar cada grupo com suas próprias regras de segurança.\n\nO padrão clássico é separar as camadas de uma aplicação em sub-redes diferentes: uma sub-rede para os servidores web que recebem o público, outra para a camada de aplicação e outra para o banco de dados. Assim, o banco de dados nunca fica diretamente exposto à internet, e o tráfego entre as camadas pode ser controlado e limitado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conceito\",\"O que é\",\"Para que serve\"],[\"Rede virtual (VNet)\",\"Rede privada e isolada dentro do Azure\",\"Dar aos recursos um espaço próprio para se comunicar com segurança\"],[\"Sub-rede (subnet)\",\"Uma faixa menor dentro da VNet\",\"Separar recursos por função e aplicar controles a cada grupo\"],[\"Peering de VNets\",\"Conexão privada entre duas VNets\",\"Ligar redes sem passar pela internet pública\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que segmentar reduz o risco\nSegmentar limita o raio de alcance de um ataque. Se um invasor compromete um servidor na sub-rede web, a segmentação dificulta que ele alcance o banco de dados em outra sub-rede, porque o tráfego entre elas pode ser barrado. Esse controle do movimento lateral é o principal ganho de segurança da segmentação.\n\nAlém disso, cada sub-rede pode receber controles diferentes conforme a sua sensibilidade. É sobre a VNet e as sub-redes que os próximos serviços deste módulo vão atuar: os grupos de segurança de rede filtram o tráfego, o Azure Firewall centraliza as regras e o Azure Bastion dá acesso seguro sem expor endereços públicos."
                    },
                    {
                        "type": "quote",
                        "value": "A rede virtual (VNet) é a sua rede privada e isolada no Azure; dividi-la em sub-redes separa os recursos por função e limita o movimento lateral de um invasor."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa vai migrar servidores para o Azure e quer que eles fiquem em uma rede privada e isolada, comunicando-se entre si com segurança. Qual recurso fornece essa rede no Azure?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Rede virtual (VNet)",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Key Vault",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Bastion",
                                "isCorrect": false
                            },
                            {
                                "text": "Web Application Firewall (WAF)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para separar os servidores web, a camada de aplicação e o banco de dados em faixas diferentes dentro da mesma rede virtual, uma equipe deve usar o quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Sub-redes (subnets)",
                                "isCorrect": true
                            },
                            {
                                "text": "Peering de VNets",
                                "isCorrect": false
                            },
                            {
                                "text": "Network security groups (NSGs)",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Firewall",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que dividir uma aplicação em várias sub-redes, com o banco de dados isolado da sub-rede web, melhora a segurança?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque limita o movimento lateral do invasor entre as camadas",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque criptografa automaticamente todos os dados do banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque elimina a necessidade de autenticação entre as camadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque bloqueia sozinha os ataques de negação de serviço volumétricos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas redes virtuais precisam se comunicar de forma privada, sem que o tráfego passe pela internet pública. Qual recurso liga essas VNets?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Peering de VNets",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Bastion",
                                "isCorrect": false
                            },
                            {
                                "text": "Web Application Firewall (WAF)",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Key Vault",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma arquiteta desenhou VNets e sub-redes separando as camadas da aplicação. Um colega afirma que só a existência das sub-redes já impede qualquer tráfego indevido entre elas. Qual é a avaliação correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A segmentação isola os recursos, mas só NSGs ou o Firewall controlam o tráfego entre elas",
                                "isCorrect": true
                            },
                            {
                                "text": "O colega está certo: sub-redes bloqueiam sozinhas todo o tráfego entre camadas por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "O colega está certo, desde que cada sub-rede tenha um endereço IP público",
                                "isCorrect": false
                            },
                            {
                                "text": "Sub-redes só funcionam se houver um Web Application Firewall dentro de cada uma",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Network security groups (NSGs) e regras de entrada/saída",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um network security group\nUm network security group, o NSG, é um filtro de tráfego de rede do Azure. Ele contém uma lista de regras de segurança que permitem (allow) ou negam (deny) o tráfego de entrada (inbound) e de saída (outbound) dos recursos dentro de uma VNet. É a forma mais direta de controlar quem pode falar com quem na rede.\n\nUm NSG pode ser associado a uma sub-rede inteira, protegendo todos os recursos dela de uma vez, ou à interface de rede de uma máquina virtual específica. Ele não tem custo adicional e funciona de forma distribuída, colado aos recursos."
                    },
                    {
                        "type": "text",
                        "value": "## A anatomia de uma regra\nCada regra de um NSG combina alguns campos para decidir o destino do tráfego: a origem e o destino, as portas, o protocolo, a direção (entrada ou saída), a prioridade e a ação (permitir ou negar).\n\nA prioridade é um número, e vale a regra de menor número: as regras são avaliadas em ordem crescente de prioridade e, assim que uma bate com o tráfego, ela decide e as seguintes são ignoradas. O Azure ainda inclui regras padrão que, por exemplo, permitem a comunicação dentro da VNet e negam o restante do tráfego de entrada vindo da internet. O NSG também é stateful: se você permite uma conexão de entrada, o tráfego de resposta é liberado automaticamente, sem precisar de uma regra de saída correspondente."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"nome\": \"Permitir-HTTPS-de-entrada\",\n  \"prioridade\": 100,\n  \"direcao\": \"Entrada\",\n  \"origem\": \"Internet\",\n  \"portaDestino\": 443,\n  \"protocolo\": \"TCP\",\n  \"acao\": \"Permitir\"\n}"
                    },
                    {
                        "type": "text",
                        "value": "## NSG não é o Azure Firewall\nCai muito na prova a diferença entre o NSG e o Azure Firewall. O NSG é um filtro básico, sem custo adicional e distribuído, que trabalha com endereços e portas (camadas 3 e 4), coladinho em sub-redes e interfaces de rede. O Azure Firewall é um serviço gerenciado e centralizado, com recursos mais avançados, que você posiciona para controlar o tráfego de toda uma rede a partir de um ponto único. Um não substitui o outro: é comum usar NSGs para o controle fino junto dos recursos e o Azure Firewall para a política central da rede."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Network security group (NSG)\",\"Azure Firewall\"],[\"O que é\",\"Filtro básico de tráfego por regras\",\"Firewall gerenciado e centralizado\"],[\"Trabalha com\",\"Endereços e portas (camadas 3 e 4)\",\"Rede e aplicação, com recursos avançados\"],[\"Posição\",\"Colado à sub-rede ou à interface de rede\",\"Central, para o tráfego de toda a rede\"],[\"Custo\",\"Sem custo adicional\",\"Serviço pago\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O NSG permite ou nega tráfego de entrada e de saída por regras de prioridade e é stateful; o Azure Firewall é o firewall gerenciado e central da rede. Um faz o controle fino, o outro a política central."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe quer permitir apenas o tráfego HTTPS de entrada em uma sub-rede e negar o restante, sem custo adicional. Qual recurso do Azure faz esse filtro básico de entrada e saída?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Network security group",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Key Vault",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Bastion",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure DDoS Protection",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um NSG, quando mais de uma regra poderia se aplicar ao mesmo tráfego, qual delas prevalece?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A de menor número de prioridade",
                                "isCorrect": true
                            },
                            {
                                "text": "A de maior número de prioridade",
                                "isCorrect": false
                            },
                            {
                                "text": "A que foi criada mais recentemente",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre a regra de negação, independentemente da prioridade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma máquina virtual precisa que o tráfego de resposta a conexões de entrada permitidas seja liberado automaticamente, sem criar uma regra de saída para isso. Que característica do NSG garante esse comportamento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele é stateful: libera automaticamente o tráfego de retorno",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele criptografa o tráfego de retorno com o Azure Key Vault",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele usa o Azure Bastion para intermediar o retorno",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele depende de um WAF para liberar a resposta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização quer uma política de firewall central e gerenciada, com recursos avançados, para controlar o tráfego de várias VNets a partir de um único ponto. Os NSGs sozinhos não bastam. Qual serviço atende?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Firewall",
                                "isCorrect": true
                            },
                            {
                                "text": "Um NSG por interface de rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Key Vault",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Bastion",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um administrador precisa aplicar as mesmas regras de tráfego a todas as máquinas de uma sub-rede de uma só vez e, além disso, uma regra extra apenas em uma VM específica dessa sub-rede. Como os NSGs podem ser usados?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um NSG na sub-rede para as regras comuns, e outro na NIC da VM para a regra extra",
                                "isCorrect": true
                            },
                            {
                                "text": "Associando um NSG apenas ao grupo de recursos que contém a sub-rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Usando o Azure Firewall no lugar do NSG, pois o NSG não pode ser associado a sub-redes",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardando as regras no Azure Key Vault e referenciando-as na VM",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Azure Firewall e Web Application Firewall (WAF)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dois firewalls para dois problemas\nO Azure oferece dois serviços com \"firewall\" no nome que resolvem problemas diferentes, e a prova adora testar a diferença. O Azure Firewall protege o tráfego de rede de uma VNet de forma ampla. O Web Application Firewall, o WAF, protege especificamente aplicações web contra ataques que exploram o próprio código da aplicação."
                    },
                    {
                        "type": "text",
                        "value": "## Azure Firewall: o firewall gerenciado da rede\nO Azure Firewall é um serviço de segurança de rede gerenciado pela Microsoft, com alta disponibilidade e escalabilidade embutidas, que você não precisa instalar nem manter. Ele é um firewall stateful: acompanha o estado das conexões e libera automaticamente o tráfego de resposta de uma conexão que já foi permitida.\n\nEle centraliza a política de tráfego de entrada e de saída de uma ou de várias VNets. Entre seus recursos estão a filtragem por regras de rede (endereços e portas) e por regras de aplicação (por nome de domínio, o FQDN), além da filtragem baseada em inteligência contra ameaças, que pode alertar ou bloquear tráfego de e para domínios e IPs sabidamente maliciosos."
                    },
                    {
                        "type": "text",
                        "value": "## Web Application Firewall: a proteção da aplicação web\nO WAF protege aplicações web contra explorações comuns que miram a camada de aplicação (camada 7), como injeção de SQL e cross-site scripting (XSS). Ele se apoia em conjuntos de regras que reconhecem esses ataques, inspirados na lista OWASP Top 10 das vulnerabilidades web mais frequentes.\n\nO WAF não roda sozinho: ele é oferecido junto de serviços que publicam aplicações web, como o Azure Application Gateway, o Azure Front Door e o Azure CDN. Assim, ele inspeciona as requisições HTTP e HTTPS que chegam à aplicação e barra as maliciosas antes que atinjam o servidor."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Azure Firewall\",\"Web Application Firewall (WAF)\"],[\"Protege\",\"O tráfego de rede de uma VNet\",\"Aplicações web específicas\"],[\"Foco\",\"Rede e portas, com regras de rede e de aplicação\",\"Ataques à camada de aplicação (camada 7)\"],[\"Ameaças típicas\",\"Tráfego malicioso, acesso a domínios e IPs perigosos\",\"Injeção de SQL, cross-site scripting (XSS), OWASP Top 10\"],[\"Onde atua\",\"Central, para toda a rede\",\"Junto do Application Gateway, do Front Door ou do CDN\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como escolher no cenário\nA pergunta que guia é o que você está protegendo. Se o objetivo é controlar e filtrar o tráfego de rede de uma VNet de forma centralizada e gerenciada, é o Azure Firewall. Se o objetivo é blindar uma aplicação web publicada contra ataques como injeção de SQL e XSS, é o WAF. Os dois se complementam: em uma arquitetura completa, o WAF cuida das requisições web na borda e o Azure Firewall governa o tráfego de rede por trás dele."
                    },
                    {
                        "type": "quote",
                        "value": "O Azure Firewall protege o tráfego de rede da VNet de forma central e gerenciada; o WAF protege aplicações web contra ataques de camada 7, como injeção de SQL e XSS, junto do Application Gateway, do Front Door ou do CDN."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma loja online quer proteger seu site contra ataques de injeção de SQL e cross-site scripting (XSS). Qual serviço é o indicado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Web Application Firewall (WAF)",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Bastion",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Key Vault",
                                "isCorrect": false
                            },
                            {
                                "text": "Network security group (NSG)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer um firewall gerenciado e com estado (stateful) para centralizar as regras de tráfego de rede de várias VNets a partir de um ponto único. Qual serviço atende?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Azure Firewall",
                                "isCorrect": true
                            },
                            {
                                "text": "Web Application Firewall (WAF)",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure DDoS Protection",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Key Vault",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O WAF não é implantado de forma isolada. Junto de quais serviços ele costuma proteger aplicações web?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Application Gateway, Azure Front Door e Azure CDN",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Key Vault, Azure Bastion e o Azure Monitor",
                                "isCorrect": false
                            },
                            {
                                "text": "Máquinas virtuais, sub-redes e grupos de recursos do Azure",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure DDoS Protection, NSGs e o Azure Monitor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa inspecionar as requisições HTTP e HTTPS que chegam a um aplicativo web público e bloquear as que correspondem a padrões de ataque conhecidos da OWASP Top 10. Qual serviço é o mais adequado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Web Application Firewall (WAF)",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Firewall central da rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Bastion para acesso remoto seguro",
                                "isCorrect": false
                            },
                            {
                                "text": "Peering de VNets entre duas redes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquiteto quer, de um ponto central, filtrar o tráfego de saída das VMs por nome de domínio (FQDN) e bloquear conexões para IPs maliciosos conhecidos, valendo para toda a rede e não apenas para aplicações web. Qual serviço atende melhor?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Azure Firewall",
                                "isCorrect": true
                            },
                            {
                                "text": "Web Application Firewall (WAF)",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Key Vault",
                                "isCorrect": false
                            },
                            {
                                "text": "Um NSG associado a cada VM",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Azure DDoS Protection",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um ataque de negação de serviço\nUm ataque de negação de serviço (DoS, de Denial of Service) tenta deixar um sistema indisponível sobrecarregando-o com um volume enorme de requisições ou de tráfego, até que ele não consiga mais atender os usuários legítimos. Quando o ataque parte de muitas máquinas ao mesmo tempo, geralmente uma botnet, ele é distribuído: é o DDoS (Distributed Denial of Service).\n\nO objetivo não costuma ser roubar dados, e sim derrubar o serviço, causando prejuízo e indisponibilidade. Por isso a defesa é diferente da de outros ataques: o desafio é absorver e filtrar o excesso de tráfego sem afetar os acessos verdadeiros."
                    },
                    {
                        "type": "text",
                        "value": "## Azure DDoS Protection\nO Azure DDoS Protection defende os recursos publicados no Azure contra esses ataques. Ele monitora o tráfego continuamente (always-on), reconhece os padrões de um ataque em andamento e mitiga o tráfego malicioso automaticamente, deixando passar o tráfego legítimo.\n\nA plataforma do Azure já traz uma proteção básica sempre ativa contra os ataques mais comuns. Além dela, há um nível aprimorado do serviço, que você habilita para recursos específicos e que oferece mitigação mais robusta, ajuste adaptativo ao seu tráfego, telemetria, alertas e relatórios detalhados dos ataques."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de ataque\",\"Como age\",\"Alvo\"],[\"Volumétrico\",\"Inunda a rede com um volume enorme de tráfego\",\"A banda e a capacidade da rede\"],[\"De protocolo\",\"Explora fraquezas de protocolos de rede (camadas 3 e 4)\",\"Recursos de rede e firewalls\"],[\"De camada de aplicação\",\"Sobrecarrega a aplicação com requisições aparentemente válidas (camada 7)\",\"O aplicativo web em si\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## DDoS Protection e WAF se complementam\nVale saber onde o Azure DDoS Protection atua e onde outro serviço começa. Ele é forte contra ataques volumétricos e de protocolo, que miram a rede. Já os ataques na camada de aplicação, que imitam requisições web legítimas, são mais bem tratados junto de um Web Application Firewall. Por isso, para proteger uma aplicação web pública, é comum combinar o DDoS Protection, que absorve os floods de rede, com o WAF, que filtra as requisições maliciosas na camada da aplicação."
                    },
                    {
                        "type": "quote",
                        "value": "O Azure DDoS Protection absorve e mitiga ataques que inundam a rede para derrubar um serviço; ele monitora o tráfego o tempo todo e, contra ataques na camada de aplicação, combina-se com o Web Application Firewall."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um site sofre com ataques que o inundam de tráfego para deixá-lo fora do ar para os usuários reais. Qual serviço do Azure é feito para mitigar esse tipo de ataque?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Azure DDoS Protection",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Key Vault",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Bastion",
                                "isCorrect": false
                            },
                            {
                                "text": "Network security group (NSG)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que caracteriza um ataque de negação de serviço distribuído (DDoS)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Muitas máquinas inundam um serviço até torná-lo indisponível",
                                "isCorrect": true
                            },
                            {
                                "text": "Um invasor rouba silenciosamente segredos e senhas armazenados",
                                "isCorrect": false
                            },
                            {
                                "text": "Um usuário recebe um e-mail de phishing pedindo suas credenciais",
                                "isCorrect": false
                            },
                            {
                                "text": "Um código malicioso é injetado em uma consulta SQL da aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além da proteção básica sempre ativa da plataforma, uma empresa quer mitigação aprimorada, ajuste ao seu próprio tráfego, telemetria e relatórios de ataque para recursos específicos. O que ela deve fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Habilitar o nível aprimorado do DDoS Protection nos recursos",
                                "isCorrect": true
                            },
                            {
                                "text": "Ativar um Web Application Firewall em cada máquina virtual",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar as chaves de acesso no Azure Key Vault",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir os NSGs pelo Azure Bastion",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para proteger um aplicativo web público, uma equipe quer absorver os ataques volumétricos de rede e, ao mesmo tempo, filtrar requisições maliciosas na camada da aplicação, como injeção de SQL. Qual combinação atende?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "DDoS Protection para a rede e um WAF para a aplicação",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas o Azure Bastion, protegendo o acesso administrativo",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Key Vault, guardando as chaves dos dois lados",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas um NSG básico associado à sub-rede web",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de contratar o Azure DDoS Protection, um gerente conclui que o site está protegido também contra injeção de SQL e cross-site scripting. Essa conclusão está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não: o DDoS Protection mitiga floods de rede; SQL injection e XSS cabem ao WAF",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim: o DDoS Protection inspeciona o conteúdo das requisições web e bloqueia injeção de SQL",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim: qualquer proteção de rede cobre também os ataques à camada de aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque nenhum serviço do Azure protege contra injeção de SQL",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Acesso seguro e segredos: Azure Bastion e Key Vault",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O risco de expor o acesso administrativo\nAdministrar máquinas virtuais costuma exigir acesso remoto por RDP (no Windows) ou SSH (no Linux). A forma insegura e antiga de fazer isso é dar um IP público à VM e abrir as portas 3389 (RDP) ou 22 (SSH) para a internet. Isso deixa a máquina exposta a varreduras de porta e a tentativas constantes de invasão. Reduzir essa superfície de ataque é o papel do Azure Bastion."
                    },
                    {
                        "type": "text",
                        "value": "## Azure Bastion: acesso sem IP público\nO Azure Bastion é um serviço gerenciado que você implanta dentro da sua rede virtual e que fornece conectividade RDP e SSH segura às VMs direto pelo portal do Azure, pelo navegador, sobre uma conexão TLS. Com ele, as máquinas não precisam de endereço IP público e você não precisa abrir as portas de RDP ou SSH para a internet.\n\nNa prática, o Bastion funciona como um ponto de entrada protegido e gerenciado: o administrador se conecta pelo portal e o Bastion faz a ponte até a VM pela rede privada. Isso reduz drasticamente a superfície de ataque, protegendo as máquinas contra a exposição direta."
                    },
                    {
                        "type": "text",
                        "value": "## Azure Key Vault: o cofre de segredos, chaves e certificados\nAplicações precisam de segredos, como senhas, cadeias de conexão e chaves de API, além de chaves de criptografia e certificados. Deixar esses itens espalhados no código-fonte ou em arquivos de configuração é um risco sério. O Azure Key Vault é um serviço que centraliza o armazenamento seguro de três tipos de item: segredos, chaves e certificados.\n\nGuardar tudo no Key Vault traz controle de acesso (quem pode ler cada item), registro e auditoria de uso e a possibilidade de proteção reforçada por hardware. As aplicações buscam o item no cofre em tempo de execução, em vez de tê-lo embutido no código, o que reduz muito o risco de vazamento."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de item\",\"Exemplos\",\"Para que serve\"],[\"Segredos\",\"Senhas, cadeias de conexão, chaves de API\",\"Guardar valores sensíveis fora do código da aplicação\"],[\"Chaves\",\"Chaves de criptografia\",\"Cifrar e decifrar dados e assinar informações\"],[\"Certificados\",\"Certificados TLS/SSL\",\"Proteger comunicações e comprovar a identidade de sites\"]]"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Serviço\",\"Para que serve\"],[\"Rede virtual (VNet) e sub-redes\",\"Isolar e segmentar recursos na rede\"],[\"Network security group (NSG)\",\"Filtro básico de tráfego de entrada e saída\"],[\"Azure Firewall\",\"Firewall gerenciado e central da rede\"],[\"Web Application Firewall (WAF)\",\"Proteger aplicações web de ataques de camada 7\"],[\"Azure DDoS Protection\",\"Mitigar ataques que inundam e derrubam serviços\"],[\"Azure Bastion\",\"Acesso RDP/SSH seguro sem IP público\"],[\"Azure Key Vault\",\"Guardar segredos, chaves e certificados\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O Azure Bastion dá acesso RDP e SSH seguro às VMs sem IP público nem portas abertas para a internet; o Azure Key Vault centraliza segredos, chaves e certificados fora do código da aplicação."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa quer que os administradores acessem as VMs por RDP e SSH sem dar IP público às máquinas nem abrir as portas 3389 e 22 para a internet. Qual serviço atende?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Azure Bastion",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Key Vault",
                                "isCorrect": false
                            },
                            {
                                "text": "Web Application Firewall (WAF)",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure DDoS Protection",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Onde uma aplicação no Azure deve guardar de forma centralizada e segura senhas, chaves de criptografia e certificados, em vez de deixá-los no código?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Azure Key Vault",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Bastion",
                                "isCorrect": false
                            },
                            {
                                "text": "Um network security group",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma sub-rede dedicada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de desenvolvimento tem cadeias de conexão e chaves de API escritas direto no código-fonte. Qual serviço ajuda a tirar esses segredos do código e a controlar quem pode acessá-los?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Key Vault",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Bastion",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Firewall",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure DDoS Protection",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um auditor apontou que as VMs de produção têm IP público e a porta RDP aberta para a internet, sofrendo varreduras constantes. Qual serviço remove essa exposição mantendo o acesso administrativo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Bastion, com RDP/SSH pelo portal sem IP público",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Key Vault, guardando a senha de RDP no cofre",
                                "isCorrect": false
                            },
                            {
                                "text": "Um Web Application Firewall na frente da VM",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure DDoS Protection aplicado à porta RDP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização quer duas coisas: (1) que os administradores acessem as VMs sem expor as portas RDP/SSH à internet e (2) que as senhas e os certificados usados pelas aplicações fiquem guardados fora do código. Quais serviços atendem, respectivamente, a cada necessidade?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Azure Bastion para o acesso e Azure Key Vault para os segredos",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Key Vault para o acesso e Azure Bastion para os segredos",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Firewall para o acesso e um NSG para os segredos",
                                "isCorrect": false
                            },
                            {
                                "text": "Web Application Firewall para os dois casos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Defender for Cloud e Microsoft Sentinel",
        "aulas": [
            {
                "titulo": "Microsoft Defender for Cloud: postura e proteção de cargas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é o Microsoft Defender for Cloud\n\nO Microsoft Defender for Cloud é a ferramenta do Azure para cuidar da segurança dos ambientes de nuvem. Ele responde a duas perguntas diferentes: 'quão segura está a minha nuvem e como melhorar?' e 'existe algum ataque acontecendo agora contra os meus recursos?'. A primeira é sobre a postura de segurança; a segunda é sobre a proteção das cargas de trabalho em execução.\n\nMais do que um relatório, o Defender for Cloud avalia continuamente os recursos, aponta o que corrigir e detecta atividades suspeitas. Assim ele ajuda a fortalecer a configuração antes de um incidente e a reagir quando algo escapa."
                    },
                    {
                        "type": "text",
                        "value": "## Os dois pilares: postura e proteção de cargas\n\nO Defender for Cloud se organiza em dois pilares. O primeiro é a gestão da postura de segurança, ou CSPM (Cloud Security Posture Management): ele dá visibilidade de todos os recursos, gera recomendações de correção e resume tudo em um número chamado secure score. É um trabalho proativo, de reduzir a superfície de ataque.\n\nO segundo pilar é a proteção de cargas de trabalho, ou CWP (Cloud Workload Protection): ele monitora os recursos em execução, como máquinas virtuais, armazenamento e bancos de dados, e dispara alertas de segurança quando detecta uma ameaça. É um trabalho reativo, de responder a ataques em andamento. Guardar essa dupla, proativo (postura) e reativo (proteção de cargas), ajuda muito na prova."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pilar\",\"Sigla\",\"O que entrega\"],[\"Gestão da postura de segurança\",\"CSPM\",\"Visibilidade, recomendações e secure score para melhorar a configuração\"],[\"Proteção de cargas de trabalho\",\"CWP\",\"Detecção de ameaças e alertas de segurança para os recursos em execução\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Onde ele atua e como é cobrado\n\nO Defender for Cloud protege recursos do próprio Azure de forma nativa, mas também alcança outras nuvens, como AWS e Google Cloud, por meio de conectores multicloud, e servidores locais ou de outras nuvens por meio do Azure Arc. Assim a empresa enxerga a postura de todo o ambiente em um só lugar.\n\nA gestão de postura básica (foundational CSPM) está disponível de forma gratuita para as assinaturas do Azure, entregando inventário, recomendações e secure score. Os recursos avançados de proteção contra ameaças vêm dos planos do Microsoft Defender, que são pagos e habilitados por tipo de recurso. Veremos esses planos em uma aula específica."
                    },
                    {
                        "type": "quote",
                        "value": "O Defender for Cloud tem dois trabalhos: gerir a postura de segurança (CSPM), de forma proativa, e proteger as cargas de trabalho em execução (CWP), de forma reativa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa quer uma ferramenta que mostre quão segura está a configuração dos seus recursos no Azure e ofereça recomendações para melhorar. Qual serviço atende a isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Defender for Cloud",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Sentinel, o SIEM da Microsoft",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Key Vault, o cofre de segredos",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Entra ID, a identidade em nuvem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quais são as duas grandes capacidades do Microsoft Defender for Cloud?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Gestão de postura (CSPM) e proteção de cargas (CWP)",
                                "isCorrect": true
                            },
                            {
                                "text": "Coleta de logs (SIEM) e automação de resposta (SOAR)",
                                "isCorrect": false
                            },
                            {
                                "text": "Firewall de rede e VPN",
                                "isCorrect": false
                            },
                            {
                                "text": "Gestão de identidades e de senhas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa executa cargas no Azure, na AWS e em servidores locais e quer ver a postura de segurança de todo esse ambiente em um único painel. Como o Defender for Cloud alcança a AWS e os servidores locais?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Com conectores multicloud e o Azure Arc para servidores locais",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas recursos nativos do Azure são suportados atualmente pela ferramenta",
                                "isCorrect": false
                            },
                            {
                                "text": "Instalando o Microsoft Sentinel em cada servidor local",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrando tudo para o Azure antes de habilitar a proteção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time de segurança quer, de forma proativa, reduzir a superfície de ataque corrigindo configurações inseguras dos recursos antes que ocorra um incidente. Qual pilar do Defender for Cloud atende a esse objetivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A gestão da postura de segurança (CSPM)",
                                "isCorrect": true
                            },
                            {
                                "text": "A proteção de cargas de trabalho (CWP)",
                                "isCorrect": false
                            },
                            {
                                "text": "A automação de resposta (SOAR)",
                                "isCorrect": false
                            },
                            {
                                "text": "A federação de identidades",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A postura de uma empresa já está boa, mas ela quer detectar ataques em andamento contra as máquinas virtuais e o armazenamento em execução, recebendo alertas quando algo suspeito acontecer. Qual capacidade do Defender for Cloud atende a essa necessidade?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A proteção de cargas de trabalho (CWP), pelos planos do Defender",
                                "isCorrect": true
                            },
                            {
                                "text": "A gestão de postura (CSPM), pelo secure score e pelas recomendações",
                                "isCorrect": false
                            },
                            {
                                "text": "O inventário de recursos do Azure Resource Graph",
                                "isCorrect": false
                            },
                            {
                                "text": "As recomendações de segurança do painel de conformidade",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "CSPM, secure score e recomendações de postura",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## CSPM: enxergar a postura de segurança\n\nA gestão da postura de segurança na nuvem, ou CSPM, é o pilar do Defender for Cloud que dá visibilidade e orienta melhorias. Ele avalia continuamente os recursos, monta um inventário do que existe e mostra o estado de segurança de cada item. A versão fundamental do CSPM é gratuita para as assinaturas do Azure.\n\nCom essa visão, a equipe deixa de depender de verificações manuais e passa a ter, em tempo quase real, um retrato de onde estão os pontos fracos."
                    },
                    {
                        "type": "text",
                        "value": "## Políticas e padrões por trás das recomendações\n\nO Defender for Cloud não decide sozinho o que é seguro: ele compara os recursos com padrões de segurança. As políticas de segurança são construídas sobre o Azure Policy e definem as regras que os recursos devem cumprir.\n\nPor padrão, o Defender aplica o Microsoft Cloud Security Benchmark (MCSB), um conjunto de boas práticas da Microsoft. Além dele, a empresa pode adicionar padrões de conformidade regulatória, como PCI-DSS, ISO 27001, SOC ou NIST, e acompanhar a aderência a cada um no painel de conformidade regulatória. Sempre que um recurso não cumpre um controle desses padrões, nasce uma recomendação."
                    },
                    {
                        "type": "text",
                        "value": "## Recomendações de segurança\n\nAs recomendações são as ações concretas de correção que o Defender for Cloud sugere, cada uma nascida da diferença entre o padrão esperado e o estado real do recurso. Elas trazem a severidade, os recursos afetados e o passo a passo da correção, por exemplo habilitar a MFA nas contas ou criptografar um disco.\n\nAs recomendações ficam agrupadas em controles de segurança, o que ajuda a priorizar: em vez de tratar cada item solto, a equipe foca nos controles que trazem mais ganho de segurança."
                    },
                    {
                        "type": "text",
                        "value": "## Secure score: a postura em um número\n\nO secure score resume toda a postura em uma única métrica, expressa em porcentagem. Quanto maior o score, melhor a postura. Ele sobe conforme a equipe implementa as recomendações e fortalece os controles de segurança.\n\nComo é um número único e acompanhável ao longo do tempo, o secure score serve tanto para priorizar o próximo passo quanto para mostrar à liderança a evolução da segurança."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Elemento da postura\",\"O que é\"],[\"Inventário de recursos\",\"Visão de todos os recursos e do seu estado de segurança\"],[\"Políticas e padrões\",\"Regras (como o MCSB) contra as quais os recursos são avaliados\"],[\"Recomendações\",\"Ações de correção geradas quando um recurso não atende ao padrão\"],[\"Secure score\",\"Métrica única, em porcentagem, que resume a postura\"],[\"Conformidade regulatória\",\"Painel que mostra a aderência a padrões como PCI-DSS e ISO 27001\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "As recomendações nascem da comparação dos recursos com padrões como o MCSB; corrigi-las eleva o secure score, a métrica única que resume a postura de segurança da nuvem."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o secure score do Microsoft Defender for Cloud representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma métrica em porcentagem que resume a postura de segurança",
                                "isCorrect": true
                            },
                            {
                                "text": "O custo mensal total de todos os planos do Defender habilitados",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de usuários com MFA ativada na assinatura",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de ameaças bloqueadas automaticamente por dia",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual padrão de segurança o Defender for Cloud aplica por padrão para avaliar os recursos e gerar recomendações?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Cloud Security Benchmark (MCSB)",
                                "isCorrect": true
                            },
                            {
                                "text": "PCI-DSS, o padrão de pagamentos",
                                "isCorrect": false
                            },
                            {
                                "text": "ISO 27001, a norma internacional",
                                "isCorrect": false
                            },
                            {
                                "text": "GDPR, a lei europeia de proteção de dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa de pagamentos precisa comprovar aderência ao PCI-DSS e ver, em um painel, quais controles cumpre e quais faltam. Como o Defender for Cloud ajuda nisso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Adicionando o PCI-DSS ao painel de conformidade regulatória",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentando o secure score manualmente todo mês",
                                "isCorrect": false
                            },
                            {
                                "text": "Habilitando o Microsoft Sentinel para o PCI-DSS",
                                "isCorrect": false
                            },
                            {
                                "text": "Criando uma máquina virtual dedicada à auditoria de pagamentos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de algumas semanas, o secure score de uma assinatura aumentou. O que mais provavelmente explica essa melhora?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A equipe implementou recomendações de segurança",
                                "isCorrect": true
                            },
                            {
                                "text": "Foram criados mais recursos na assinatura",
                                "isCorrect": false
                            },
                            {
                                "text": "Foram adicionadas mais licenças de usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "O volume de logs coletados cresceu",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time de segurança quer priorizar as correções que trazem mais ganho de postura, em vez de tratar cada item isoladamente. Que aspecto do CSPM apoia essa priorização?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As recomendações agrupadas em controles de segurança",
                                "isCorrect": true
                            },
                            {
                                "text": "Os alertas de segurança gerados pelos planos do Defender",
                                "isCorrect": false
                            },
                            {
                                "text": "Os conectores de dados do Microsoft Sentinel",
                                "isCorrect": false
                            },
                            {
                                "text": "Os playbooks de automação de resposta",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Proteção de cargas de trabalho: os planos do Defender for Cloud",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## De enxergar para proteger\n\nA gestão de postura mostra onde melhorar, mas não impede um ataque em andamento. Esse é o papel da proteção de cargas de trabalho (CWP): monitorar os recursos em execução e detectar ameaças em tempo real. Essa proteção avançada é ativada pelos planos do Microsoft Defender, que são pagos e habilitados por tipo de recurso.\n\nCada plano entende as ameaças típicas do recurso que protege e, ao identificar algo suspeito, gera um alerta de segurança."
                    },
                    {
                        "type": "text",
                        "value": "## Os planos do Defender\n\nExiste um plano especializado para cada família de carga de trabalho. O Defender para Servidores protege máquinas virtuais e servidores e integra o Microsoft Defender for Endpoint. O Defender para Armazenamento vigia contas de Storage contra malware e acessos anômalos. Há ainda planos para bancos de dados, containers, App Service, Key Vault, o Azure Resource Manager e as APIs.\n\nA ideia é sempre a mesma: ligar o plano correspondente ao recurso que você quer proteger para ganhar detecção de ameaças sob medida para ele."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Plano do Defender\",\"O que protege\"],[\"Defender para Servidores\",\"Máquinas virtuais e servidores (integra o Defender for Endpoint)\"],[\"Defender para Armazenamento\",\"Contas do Azure Storage, contra malware e acessos suspeitos\"],[\"Defender para Bancos de Dados\",\"Bancos SQL e outros, contra injeção e acessos anômalos\"],[\"Defender para Containers\",\"Clusters de Kubernetes e imagens de contêiner\"],[\"Defender para App Service\",\"Aplicações web hospedadas no App Service\"],[\"Defender para Key Vault\",\"Cofres de chaves, contra acesso incomum a segredos\"],[\"Defender para Resource Manager\",\"Operações de gerenciamento de recursos do Azure\"],[\"Defender para APIs\",\"APIs publicadas, contra abuso e ameaças\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Alertas de segurança\n\nQuando um plano do Defender detecta atividade maliciosa, ele gera um alerta de segurança. O alerta descreve o que foi identificado, o recurso afetado, a severidade, as táticas do atacante e os passos de resposta sugeridos.\n\nAqui vale separar dois conceitos que a prova adora confundir. A recomendação aponta uma falha de configuração a corrigir de forma proativa (postura). O alerta sinaliza uma ameaça ativa que exige resposta (proteção de cargas). Recomendação previne; alerta reage. Esses alertas ainda podem ser enviados ao Microsoft Sentinel e ao Microsoft Defender XDR para uma resposta coordenada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Recomendação\",\"Alerta de segurança\"],[\"Origem\",\"CSPM (postura)\",\"Planos do Defender (proteção de cargas)\"],[\"Natureza\",\"Falha de configuração a corrigir\",\"Ameaça ativa detectada\"],[\"Postura\",\"Proativa: reduz a superfície de ataque\",\"Reativa: responde a um ataque em andamento\"],[\"Exemplo\",\"Habilitar MFA nas contas\",\"Tentativa de força bruta em uma VM\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Os planos do Defender ativam a proteção de cargas de trabalho: cada plano detecta ameaças no seu tipo de recurso e gera alertas de segurança, enquanto as recomendações do CSPM apenas apontam falhas de configuração a corrigir."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa quer detecção de ameaças para as suas máquinas virtuais no Azure, como tentativas de força bruta e execução de processos suspeitos. Qual plano do Defender for Cloud atende?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Defender para Servidores",
                                "isCorrect": true
                            },
                            {
                                "text": "Defender para Armazenamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Defender para Key Vault",
                                "isCorrect": false
                            },
                            {
                                "text": "Defender para APIs",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Defender for Cloud, o que indica um alerta de segurança?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma ameaça ativa detectada contra um recurso, que exige resposta",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma falha de configuração a ser corrigida de forma proativa",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor atual do secure score",
                                "isCorrect": false
                            },
                            {
                                "text": "Um padrão de conformidade regulatória adicionado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa guarda dados sensíveis no Azure Storage e quer ser avisada sobre uploads de malware e padrões de acesso incomuns. Qual plano do Defender ela deve habilitar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Defender para Armazenamento",
                                "isCorrect": true
                            },
                            {
                                "text": "Defender para Servidores",
                                "isCorrect": false
                            },
                            {
                                "text": "Defender para Resource Manager",
                                "isCorrect": false
                            },
                            {
                                "text": "Defender para App Service",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença entre uma recomendação e um alerta de segurança no Defender for Cloud?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A recomendação aponta uma falha a corrigir; o alerta sinaliza uma ameaça ativa",
                                "isCorrect": true
                            },
                            {
                                "text": "São dois nomes para a mesma coisa",
                                "isCorrect": false
                            },
                            {
                                "text": "A recomendação sinaliza ataques e o alerta sugere melhorias de configuração",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos servem apenas para calcular o secure score",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa executa suas aplicações em clusters de Kubernetes e quer detecção de ameaças em tempo de execução e reforço de segurança para esses clusters e imagens. Qual plano do Defender for Cloud é o indicado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Defender para Containers",
                                "isCorrect": true
                            },
                            {
                                "text": "Defender para Servidores",
                                "isCorrect": false
                            },
                            {
                                "text": "Defender para App Service",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Endpoint",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Microsoft Sentinel: os conceitos de SIEM e SOAR",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é o Microsoft Sentinel\n\nO Microsoft Sentinel é a solução de SIEM e SOAR nativa da nuvem da Microsoft. Ele foi feito para o centro de operações de segurança (SOC): reúne, em um só lugar, os sinais de segurança de toda a organização, sejam de serviços Microsoft ou de terceiros, da nuvem ou dos servidores locais.\n\nEle roda no Azure, é escalável e se apoia em um workspace do Log Analytics, onde os dados coletados ficam armazenados e podem ser consultados. Como é entregue como serviço, não exige montar e manter servidores próprios de SIEM."
                    },
                    {
                        "type": "text",
                        "value": "## SIEM: reunir e analisar eventos\n\nSIEM significa Security Information and Event Management, ou gestão de informações e eventos de segurança. Um SIEM coleta e centraliza logs e eventos de muitas fontes, correlaciona esses dados e os analisa para detectar ameaças que passariam despercebidas se cada fonte fosse olhada isoladamente.\n\nÉ o SIEM que dá ao analista a visão ampla: um login suspeito em uma fonte somado a um acesso anômalo em outra pode, juntos, revelar um ataque que nenhum dos dois eventos denunciaria sozinho."
                    },
                    {
                        "type": "text",
                        "value": "## SOAR: orquestrar e automatizar a resposta\n\nSOAR significa Security Orchestration, Automation and Response, ou orquestração, automação e resposta de segurança. Enquanto o SIEM detecta, o SOAR age: automatiza tarefas de resposta que, feitas à mão, seriam lentas e repetitivas.\n\nNo Sentinel, essa automação acontece por playbooks, que podem, por exemplo, desabilitar uma conta comprometida, bloquear um endereço IP ou abrir um chamado, tudo sem esperar por uma ação manual."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sigla\",\"Nome\",\"O que faz\"],[\"SIEM\",\"Security Information and Event Management\",\"Coleta e analisa eventos e logs de toda a organização para detectar ameaças\"],[\"SOAR\",\"Security Orchestration, Automation and Response\",\"Orquestra e automatiza a resposta às ameaças com playbooks\"]]"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Microsoft Defender for Cloud\",\"Microsoft Sentinel\"],[\"Função\",\"Postura e proteção de cargas na nuvem\",\"SIEM e SOAR de toda a organização\"],[\"Foco\",\"Proteger e melhorar os seus recursos de nuvem\",\"Reunir, correlacionar e responder a sinais de muitas fontes\"],[\"Escopo\",\"Recursos de Azure, AWS, GCP e híbridos\",\"Fontes Microsoft e de terceiros, nuvem e on-premises\"],[\"Entrega típica\",\"Secure score, recomendações e alertas\",\"Incidentes, investigação e resposta automatizada\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O Microsoft Sentinel é SIEM e SOAR na nuvem: como SIEM, coleta e correlaciona eventos de toda a organização para detectar ameaças; como SOAR, automatiza a resposta com playbooks."
                    }
                ],
                "questions": [
                    {
                        "statement": "O Microsoft Sentinel é uma solução de qual tipo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "SIEM e SOAR nativa da nuvem",
                                "isCorrect": true
                            },
                            {
                                "text": "Firewall de aplicação web (WAF)",
                                "isCorrect": false
                            },
                            {
                                "text": "Gestão de identidades e acessos",
                                "isCorrect": false
                            },
                            {
                                "text": "Cofre de chaves e segredos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o papel do componente SIEM em uma solução como o Microsoft Sentinel?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Coletar e correlacionar logs da organização para detectar ameaças",
                                "isCorrect": true
                            },
                            {
                                "text": "Automatizar a resposta às ameaças por meio de playbooks de ação",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografar os discos de todas as máquinas virtuais",
                                "isCorrect": false
                            },
                            {
                                "text": "Emitir certificados digitais para todos os usuários",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma solução SIEM/SOAR, qual componente é responsável por automatizar e orquestrar a resposta às ameaças?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O SOAR, por meio de playbooks",
                                "isCorrect": true
                            },
                            {
                                "text": "O SIEM, por meio da coleta de logs",
                                "isCorrect": false
                            },
                            {
                                "text": "O CSPM, por meio do secure score",
                                "isCorrect": false
                            },
                            {
                                "text": "O Azure Policy",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um centro de operações de segurança quer um único lugar para coletar logs do Azure, da AWS, do Microsoft 365 e de firewalls locais, correlacionar tudo e detectar ameaças em toda a organização. Qual serviço atende?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Microsoft Sentinel",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender for Cloud",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Bastion",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Entra ID",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa já usa o Defender for Cloud para cuidar da postura e proteger os recursos do Azure. Agora quer uma camada que reúna os alertas do Defender for Cloud, do Microsoft 365 e de firewalls de terceiros, correlacione tudo e automatize a resposta no SOC. O que ela deve adicionar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Microsoft Sentinel",
                                "isCorrect": true
                            },
                            {
                                "text": "Mais planos do Defender for Cloud",
                                "isCorrect": false
                            },
                            {
                                "text": "Um segundo secure score",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Firewall",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Detecção e mitigação de ameaças no Microsoft Sentinel",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## As quatro etapas da defesa no Sentinel\n\nO trabalho do Microsoft Sentinel contra ameaças segue quatro etapas: coletar, detectar, investigar e responder. Coletar traz os dados das fontes; detectar transforma esses dados em alertas e incidentes; investigar analisa o que aconteceu; responder age para conter a ameaça. Entender esse fluxo é a espinha dorsal desta aula."
                    },
                    {
                        "type": "text",
                        "value": "## Coletar com conectores de dados\n\nA coleta começa pelos conectores de dados, que ligam o Sentinel às fontes: serviços da Microsoft (como o Entra ID, o Microsoft 365 e o Defender for Cloud), outras nuvens, appliances de rede e servidores locais, além de feeds de inteligência de ameaças. Muitos conectores já vêm prontos.\n\nTodos esses dados vão para um workspace do Log Analytics, onde podem ser consultados com a linguagem KQL (Kusto Query Language). Sem coleta, não há o que detectar."
                    },
                    {
                        "type": "text",
                        "value": "## Detectar com regras de análise\n\nSobre os dados coletados, o Sentinel aplica regras de análise (analytics rules) que procuram sinais de ameaça. Quando uma regra encontra algo, ela gera um alerta, e os alertas relacionados são agrupados em um incidente, que é a unidade que o analista investiga.\n\nExistem regras prontas baseadas em consultas agendadas, regras de segurança da Microsoft e detecções por aprendizado de máquina que apontam anomalias. A inteligência de ameaças ajuda a reconhecer indicadores já conhecidos como maliciosos."
                    },
                    {
                        "type": "text",
                        "value": "## Investigar e responder\n\nNa investigação, o analista abre o incidente e usa o grafo de investigação para ver como alertas e entidades (usuários, hosts, endereços IP) se conectam. Os workbooks trazem painéis visuais, e o hunting permite caçar ameaças de forma proativa, rodando consultas KQL alinhadas ao framework MITRE ATT&CK antes mesmo de um alerta disparar.\n\nNa resposta entra o SOAR: os playbooks, construídos sobre o Azure Logic Apps, executam ações automáticas, como isolar um host, desabilitar uma conta ou notificar a equipe. As regras de automação orquestram quando e como esses playbooks são disparados, acelerando a contenção."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\",\"O que acontece\",\"Recurso do Sentinel\"],[\"Coletar\",\"Trazer logs e eventos das fontes\",\"Conectores de dados e workspace do Log Analytics\"],[\"Detectar\",\"Gerar alertas e agrupá-los em incidentes\",\"Regras de análise (analytics rules)\"],[\"Investigar\",\"Analisar o incidente e caçar ameaças\",\"Grafo de investigação, workbooks e hunting\"],[\"Responder\",\"Agir sobre a ameaça de forma automatizada\",\"Playbooks e regras de automação\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "No Sentinel, os conectores coletam, as regras de análise detectam e agrupam alertas em incidentes, o hunting e o grafo de investigação ajudam a investigar, e os playbooks respondem de forma automatizada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Como o Microsoft Sentinel traz para dentro dele os logs e eventos das diversas fontes da organização?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Por meio de conectores de dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Por meio de playbooks",
                                "isCorrect": false
                            },
                            {
                                "text": "Por meio do secure score",
                                "isCorrect": false
                            },
                            {
                                "text": "Por meio de rótulos de confidencialidade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Microsoft Sentinel, como são chamados os agrupamentos de alertas relacionados que o analista investiga como uma unidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Incidentes",
                                "isCorrect": true
                            },
                            {
                                "text": "Conectores",
                                "isCorrect": false
                            },
                            {
                                "text": "Workbooks",
                                "isCorrect": false
                            },
                            {
                                "text": "Recomendações",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual recurso do Microsoft Sentinel avalia os dados coletados e gera os alertas quando encontra sinais de ameaça?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As regras de análise (analytics rules)",
                                "isCorrect": true
                            },
                            {
                                "text": "Os conectores de dados de origem",
                                "isCorrect": false
                            },
                            {
                                "text": "Os playbooks de resposta automática",
                                "isCorrect": false
                            },
                            {
                                "text": "O secure score da assinatura",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um SOC quer que, ao surgir um incidente, uma conta comprometida seja desabilitada e a equipe notificada automaticamente, sem passos manuais. Qual recurso do Sentinel atende a isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um playbook (automação SOAR)",
                                "isCorrect": true
                            },
                            {
                                "text": "Um conector de dados de origem",
                                "isCorrect": false
                            },
                            {
                                "text": "Um workbook de visualização",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma regra de análise agendada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Os analistas querem procurar proativamente sinais de comprometimento nos dados já coletados, antes que qualquer alerta dispare, usando consultas alinhadas ao framework MITRE ATT&CK. Qual capacidade do Sentinel é essa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O hunting (caça a ameaças)",
                                "isCorrect": true
                            },
                            {
                                "text": "Os playbooks",
                                "isCorrect": false
                            },
                            {
                                "text": "Os conectores de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Os workbooks",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Proteção contra ameaças com o Microsoft Defender XDR",
        "aulas": [
            {
                "titulo": "O que é o Microsoft Defender XDR e o portal do Defender",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é o Microsoft Defender XDR\n\nO Microsoft Defender XDR é uma suíte de defesa corporativa que faz detecção e resposta estendidas (XDR, de extended detection and response). Em vez de cada ferramenta olhar só o seu pedaço, ele reúne e correlaciona sinais de e-mail, dispositivos, identidades e aplicativos de nuvem para enxergar um ataque inteiro, de ponta a ponta.\n\nA sigla XDR aponta justamente essa visão estendida: a detecção e a resposta vão além de um único domínio. Cada serviço da família cuida de uma carga de trabalho, e o Defender XDR junta o que todos veem para identificar ataques que passariam despercebidos se cada alerta fosse analisado sozinho."
                    },
                    {
                        "type": "text",
                        "value": "## Correlação de sinais e incidentes\n\nO grande valor do XDR é a correlação. Um ataque real costuma deixar rastros em vários lugares: um e-mail de phishing, um dispositivo infectado, uma identidade comprometida e um acesso suspeito a um app de nuvem. Isolados, cada um vira um alerta solto. O Defender XDR agrupa os alertas relacionados em um único incidente, que conta a história completa do ataque.\n\nAlém de agrupar, ele automatiza a investigação e a resposta (AIR, automated investigation and response): pode conter um dispositivo, bloquear um e-mail malicioso ou desativar uma conta sem esperar a ação manual de um analista. Isso reduz o tempo entre detectar e reagir."
                    },
                    {
                        "type": "text",
                        "value": "## O portal do Defender\n\nOs serviços da família são operados a partir do portal do Microsoft Defender (security.microsoft.com), um painel único onde a equipe de segurança acompanha incidentes e alertas, faz caça a ameaças (threat hunting), consulta a análise de ameaças (threat analytics) e revisa o Microsoft Secure Score. Em vez de abrir um console para e-mail, outro para dispositivos e outro para identidades, tudo aparece em um só lugar, já correlacionado.\n\nO portal também é o ponto de integração com o Microsoft Sentinel, o SIEM e SOAR da Microsoft, quando a organização quer juntar esses sinais aos dados de toda a empresa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Serviço\",\"Carga de trabalho que protege\",\"Exemplo de ameaça\"],[\"Defender for Office 365\",\"E-mail e ferramentas de colaboração\",\"Phishing e anexo malicioso no e-mail\"],[\"Defender for Endpoint\",\"Dispositivos e endpoints\",\"Malware ou ransomware num notebook\"],[\"Defender for Identity\",\"Identidades do Active Directory local\",\"Movimento lateral a partir de um controlador de domínio\"],[\"Defender for Cloud Apps\",\"Aplicativos SaaS de nuvem\",\"Shadow IT e uso de risco de apps SaaS\"],[\"Defender Vulnerability Management\",\"Vulnerabilidades dos ativos\",\"Software desatualizado com falha conhecida\"],[\"Defender Threat Intelligence\",\"Inteligência sobre ameaças\",\"Perfil de um grupo atacante e seus indicadores\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Defender XDR não é o Defender for Cloud\n\nDuas peças confundem muita gente na prova. O Defender XDR protege as cargas de trabalho do dia a dia dos usuários: e-mail, dispositivos, identidades e aplicativos SaaS. Já o Defender for Cloud, visto antes, protege a infraestrutura e as cargas de trabalho na nuvem, como máquinas virtuais, contêineres e bancos de dados do Azure e de outras nuvens, cuidando de postura de segurança (CSPM) e proteção de workloads.\n\nCuidado ainda com a dupla de nomes parecidos: o Defender for Cloud Apps cuida de aplicativos SaaS (é um CASB), enquanto o Defender for Cloud cuida de recursos de infraestrutura na nuvem. São serviços diferentes com nomes quase iguais."
                    },
                    {
                        "type": "quote",
                        "value": "O Defender XDR correlaciona sinais de e-mail, dispositivos, identidades e apps de nuvem, agrupa alertas relacionados em um único incidente e é operado pelo portal do Defender. O Defender for Cloud, à parte, cuida da infraestrutura na nuvem."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe de segurança quer parar de analisar alertas de e-mail, dispositivos e identidades em consoles separados e ver tudo correlacionado em um único painel. Qual solução oferece isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Defender XDR",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Firewall",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Bastion",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Purview",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que melhor descreve o Microsoft Defender XDR?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma suíte que correlaciona sinais e agrupa alertas em incidentes",
                                "isCorrect": true
                            },
                            {
                                "text": "Um firewall de rede que filtra o tráfego entre sub-redes do Azure",
                                "isCorrect": false
                            },
                            {
                                "text": "Um serviço de backup e recuperação de máquinas virtuais no Azure",
                                "isCorrect": false
                            },
                            {
                                "text": "Um cofre para guardar chaves e segredos de aplicativos na nuvem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um phishing por e-mail levou à infecção de um notebook e depois a um acesso suspeito em um app SaaS. Em vez de três alertas soltos, a equipe quer que o sistema junte tudo em uma única investigação. Que capacidade do Defender XDR faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A correlação de alertas em um único incidente",
                                "isCorrect": true
                            },
                            {
                                "text": "Os Links Seguros do e-mail no clique",
                                "isCorrect": false
                            },
                            {
                                "text": "Um grupo de segurança de rede (NSG) na sub-rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma revisão de acesso (access review) trimestral",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual portal a equipe de segurança acompanha os incidentes, faz caça a ameaças e revisa o Secure Score dos serviços do Defender XDR?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No portal do Microsoft Defender (security.microsoft.com)",
                                "isCorrect": true
                            },
                            {
                                "text": "No portal do Microsoft Purview",
                                "isCorrect": false
                            },
                            {
                                "text": "No centro de administração do Microsoft Entra",
                                "isCorrect": false
                            },
                            {
                                "text": "No portal de conformidade do Microsoft Service Trust Portal",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa precisa proteger máquinas virtuais e bancos de dados hospedados no Azure e em outra nuvem, com avaliação da postura de segurança. Esse é o papel de qual solução, e não do Defender XDR?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Microsoft Defender for Cloud",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender for Cloud Apps",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Endpoint",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Identity",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Microsoft Defender for Office 365",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que o Defender for Office 365 protege\n\nO Microsoft Defender for Office 365 protege as cargas de e-mail e de colaboração da organização. Isso inclui o e-mail (as caixas do Exchange Online) e as ferramentas onde as pessoas trocam arquivos e mensagens: Microsoft Teams, SharePoint Online e OneDrive.\n\nO alvo dele são as ameaças que chegam por essas vias: phishing, malware escondido em anexos, links maliciosos e o comprometimento de e-mail corporativo (BEC). É a resposta certa sempre que o cenário fala em proteger e-mail, anexos, links ou colaboração."
                    },
                    {
                        "type": "text",
                        "value": "## Anexos Seguros e Links Seguros\n\nDois recursos são a marca do Defender for Office 365. Os Anexos Seguros (Safe Attachments) abrem o anexo em um ambiente isolado (sandbox) antes de entregá-lo, para ver se ele se comporta como malware. Só depois de considerado seguro o arquivo chega ao destinatário.\n\nOs Links Seguros (Safe Links) verificam a URL no momento do clique, e não só quando o e-mail chega. Assim, se um link estava limpo na entrega mas virou malicioso depois, ele ainda é bloqueado quando o usuário clica. Essa verificação também vale para links no Teams e nos apps do Office."
                    },
                    {
                        "type": "text",
                        "value": "## Antiphishing, investigação e simulação\n\nO Defender for Office 365 traz ainda políticas antiphishing que usam inteligência para detectar falsificação de remetente e tentativas de se passar por executivos. Para a equipe de segurança, oferece investigação e caça a ameaças (com recursos como o Threat Explorer e as detecções em tempo real) e a resposta automatizada a incidentes de e-mail.\n\nEle também inclui o treinamento de simulação de ataque (attack simulation training), que dispara campanhas de phishing controladas contra os próprios funcionários para treiná-los a reconhecer golpes. É prevenção pelo lado humano."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Recurso\",\"O que faz\"],[\"Anexos Seguros (Safe Attachments)\",\"Abre anexos em uma sandbox antes de entregá-los\"],[\"Links Seguros (Safe Links)\",\"Verifica a URL no momento do clique\"],[\"Políticas antiphishing\",\"Detecta falsificação e tentativas de personificação\"],[\"Threat Explorer e detecções em tempo real\",\"Investigação e caça a ameaças de e-mail\"],[\"Treinamento de simulação de ataque\",\"Simula phishing para treinar os funcionários\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como reconhecer o cenário\n\nA palavra-chave é e-mail e colaboração. Se o problema envolve anexos perigosos, links maliciosos, phishing ou golpes que chegam pela caixa de entrada, pelo Teams, pelo SharePoint ou pelo OneDrive, o serviço é o Defender for Office 365. Se o problema é malware no dispositivo em si, aí já é o Defender for Endpoint, tema da próxima aula. A pergunta a fazer é: a ameaça chega pelo e-mail e pela colaboração, ou pelo aparelho?"
                    },
                    {
                        "type": "quote",
                        "value": "Defender for Office 365 é o guardião do e-mail e da colaboração: Anexos Seguros testam arquivos numa sandbox, Links Seguros checam URLs no clique e a simulação de ataque treina os funcionários contra phishing."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa quer se proteger de e-mails de phishing e de anexos maliciosos que chegam pela caixa de entrada e pelo Teams. Qual serviço é o indicado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Defender for Office 365",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender for Endpoint",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Identity",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Firewall",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual recurso abre os anexos de e-mail em um ambiente isolado (sandbox) para verificar se são maliciosos antes de entregá-los ao destinatário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Anexos Seguros (Safe Attachments)",
                                "isCorrect": true
                            },
                            {
                                "text": "Links Seguros (Safe Links)",
                                "isCorrect": false
                            },
                            {
                                "text": "Redução da superfície de ataque",
                                "isCorrect": false
                            },
                            {
                                "text": "Acesso Condicional (Conditional Access)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer que os links dos e-mails sejam verificados no momento em que o usuário clica, e não apenas na entrega, porque um link limpo pode virar malicioso depois. Qual recurso atende a isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Links Seguros (Safe Links)",
                                "isCorrect": true
                            },
                            {
                                "text": "Anexos Seguros (Safe Attachments)",
                                "isCorrect": false
                            },
                            {
                                "text": "Políticas antiphishing",
                                "isCorrect": false
                            },
                            {
                                "text": "Detecção e resposta de endpoint (EDR)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time de segurança quer disparar campanhas de phishing controladas contra os próprios funcionários para treiná-los a reconhecer golpes. Que recurso do Defender for Office 365 faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Treinamento de simulação de ataque (attack simulation)",
                                "isCorrect": true
                            },
                            {
                                "text": "Links Seguros (Safe Links) no momento do clique",
                                "isCorrect": false
                            },
                            {
                                "text": "Análise de ameaças (threat analytics) do Defender",
                                "isCorrect": false
                            },
                            {
                                "text": "Revisões de acesso (access reviews) trimestrais",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas necessidades surgem: (A) bloquear anexos e links maliciosos que chegam por e-mail e Teams e (B) deter e investigar malware que já está rodando nos notebooks. Qual serviço atende à necessidade A?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Microsoft Defender for Office 365",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender for Endpoint",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Cloud Apps",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Identity",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Microsoft Defender for Endpoint",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que o Defender for Endpoint protege\n\nO Microsoft Defender for Endpoint protege os dispositivos, ou endpoints, da organização: notebooks, desktops, servidores e celulares. Ele funciona em Windows, macOS, Linux, Android e iOS. O foco é prevenir, detectar, investigar e responder a ameaças que atingem esses aparelhos, como malware, ransomware e ataques que exploram o próprio sistema.\n\nSempre que o cenário fala em proteger a máquina em si, o dispositivo do funcionário ou o servidor, o serviço é o Defender for Endpoint."
                    },
                    {
                        "type": "text",
                        "value": "## Prevenção, detecção e resposta (EDR)\n\nO coração do Defender for Endpoint é a detecção e resposta de endpoint (EDR, endpoint detection and response): ele registra o comportamento de cada dispositivo, detecta atividades suspeitas e permite investigar e reagir, inclusive isolando um aparelho comprometido da rede.\n\nAntes disso, a proteção de próxima geração (next-generation protection) é o antivírus avançado que barra malware conhecido e desconhecido. E a redução da superfície de ataque (attack surface reduction) fecha portas que os atacantes costumam explorar, como macros perigosas e scripts. A investigação e correção automatizadas (AIR) resolvem sozinhas muitos alertas, sem esperar o analista."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Recurso\",\"O que faz\"],[\"Proteção de próxima geração\",\"Antivírus avançado contra malware conhecido e novo\"],[\"Redução da superfície de ataque (ASR)\",\"Fecha caminhos comuns de ataque, como macros e scripts\"],[\"Detecção e resposta de endpoint (EDR)\",\"Detecta comportamento suspeito e permite isolar o dispositivo\"],[\"Investigação e correção automatizadas\",\"Resolve alertas de forma automática\"],[\"Gestão de ameaças e vulnerabilidades\",\"Aponta falhas e configurações fracas dos dispositivos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Visibilidade dos dispositivos\n\nO Defender for Endpoint também traz um inventário dos dispositivos e uma avaliação de risco por meio da gestão de ameaças e vulnerabilidades, que se apoia no Microsoft Defender Vulnerability Management (tema de uma aula à frente). Com isso, ele mostra quais aparelhos têm software desatualizado ou configuração fraca e contribui para o Microsoft Secure Score, a pontuação que mede a postura de segurança da organização."
                    },
                    {
                        "type": "text",
                        "value": "## Como reconhecer o cenário\n\nCompare com a aula anterior. Se a ameaça chega pela caixa de e-mail, pelos anexos ou pela colaboração, é Defender for Office 365. Se a ameaça está no dispositivo (um malware rodando num notebook, um ransomware criptografando arquivos ou a necessidade de isolar uma máquina infectada da rede), é Defender for Endpoint. A pergunta é sempre: o alvo é o e-mail ou o aparelho?"
                    },
                    {
                        "type": "quote",
                        "value": "Defender for Endpoint protege os dispositivos: a proteção de próxima geração barra malware, a redução da superfície de ataque fecha portas e o EDR detecta e isola a máquina comprometida."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa quer proteger notebooks e servidores contra malware e ransomware e poder isolar da rede uma máquina infectada. Qual serviço atende a isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Defender for Endpoint",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender for Office 365",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Cloud Apps",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Firewall",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual serviço do Defender XDR é voltado para proteger dispositivos como notebooks, servidores e celulares?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Defender for Endpoint",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender for Identity",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Office 365",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender Threat Intelligence",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer fechar caminhos que os atacantes costumam explorar nos dispositivos, como macros perigosas do Office e scripts suspeitos. Que recurso do Defender for Endpoint faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Redução da superfície de ataque (ASR)",
                                "isCorrect": true
                            },
                            {
                                "text": "Links Seguros (Safe Links)",
                                "isCorrect": false
                            },
                            {
                                "text": "Anexos Seguros (Safe Attachments)",
                                "isCorrect": false
                            },
                            {
                                "text": "Descoberta de nuvem (Cloud Discovery)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de detectar comportamento malicioso, a equipe precisa isolar imediatamente um notebook comprometido da rede e investigar o ocorrido. Qual capacidade do Defender for Endpoint permite isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Detecção e resposta de endpoint (EDR)",
                                "isCorrect": true
                            },
                            {
                                "text": "Políticas antiphishing",
                                "isCorrect": false
                            },
                            {
                                "text": "Treinamento de simulação de ataque",
                                "isCorrect": false
                            },
                            {
                                "text": "Rótulos de confidencialidade (sensitivity labels)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um ataque começou com um e-mail de phishing (1) e terminou com um ransomware criptografando um servidor (2). Qual par de serviços do Defender atende, respectivamente, à ameaça 1 e à ameaça 2?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Defender for Office 365 e Defender for Endpoint",
                                "isCorrect": true
                            },
                            {
                                "text": "Defender for Endpoint e Defender for Office 365",
                                "isCorrect": false
                            },
                            {
                                "text": "Defender for Identity e Defender for Cloud Apps",
                                "isCorrect": false
                            },
                            {
                                "text": "Defender for Cloud Apps e Defender for Identity",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Defender for Cloud Apps e Defender for Identity",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Defender for Cloud Apps, o CASB\n\nO Microsoft Defender for Cloud Apps é um agente de segurança de acesso à nuvem, o CASB (cloud access security broker). Ele fica entre os usuários e os aplicativos SaaS de nuvem que a empresa usa, dando visibilidade e controle sobre esses apps.\n\nUma de suas funções mais cobradas é a descoberta de nuvem (cloud discovery), que revela o shadow IT: os aplicativos de nuvem usados pelos funcionários sem o conhecimento da TI. Além disso, ele avalia o risco de cada app, protege as informações que trafegam por eles, detecta ameaças e comportamentos anômalos dentro dos serviços SaaS e apoia a conformidade."
                    },
                    {
                        "type": "text",
                        "value": "## Defender for Identity e o Active Directory local\n\nO Microsoft Defender for Identity protege as identidades do Active Directory local (o AD DS que roda nos controladores de domínio da empresa). Ele coleta sinais desses controladores de domínio e usa a nuvem para detectar ataques baseados em identidade.\n\nEle é especialista em flagrar as fases de um ataque a identidades: o reconhecimento (o atacante mapeia usuários e recursos), o comprometimento de credenciais, o movimento lateral (pular de máquina em máquina usando contas roubadas) e a dominância de domínio (assumir o controle do ambiente). É a resposta quando o cenário fala em ameaças à identidade no Active Directory local."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Serviço\",\"Carga que protege\",\"Ameaças que detecta\"],[\"Defender for Cloud Apps\",\"Aplicativos SaaS de nuvem\",\"Shadow IT e uso de risco de apps SaaS\"],[\"Defender for Identity\",\"Identidades do Active Directory local\",\"Reconhecimento, movimento lateral e roubo de credenciais\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Não confunda os nomes parecidos\n\nDois pares confundem na prova. O primeiro é de nomes quase iguais: o Defender for Cloud Apps cuida de aplicativos SaaS, enquanto o Defender for Cloud (visto antes) cuida da infraestrutura na nuvem, como máquinas virtuais e bancos de dados.\n\nO segundo é entre Defender for Identity e Microsoft Entra ID Protection. O Defender for Identity olha as ameaças ao Active Directory local, no ambiente on-premises. O Entra ID Protection (visto no domínio de identidade) avalia o risco das identidades na nuvem do Microsoft Entra ID, como logins suspeitos e credenciais vazadas. Regra rápida: identidade local é Defender for Identity; identidade na nuvem é Entra ID Protection."
                    },
                    {
                        "type": "quote",
                        "value": "Defender for Cloud Apps é o CASB dos aplicativos SaaS e revela o shadow IT. Defender for Identity detecta ataques às identidades do Active Directory local, como reconhecimento e movimento lateral."
                    }
                ],
                "questions": [
                    {
                        "statement": "A TI quer descobrir quais aplicativos de nuvem os funcionários usam sem autorização (shadow IT) e avaliar o risco de cada um. Qual serviço atende a isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Defender for Cloud Apps",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender for Identity",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Endpoint",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Firewall",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual serviço usa sinais dos controladores de domínio do Active Directory local para detectar ataques a identidades?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Defender for Identity",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender for Cloud Apps",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Office 365",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Sentinel",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um atacante roubou credenciais e está pulando de máquina em máquina no Active Directory local, num movimento lateral rumo ao controle do domínio. Qual serviço do Defender é feito para detectar isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Microsoft Defender for Identity",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender for Cloud Apps",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Endpoint",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Office 365",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer monitorar e controlar o uso de aplicativos SaaS como Salesforce e Dropbox, detectando comportamento anômalo dentro deles. Qual serviço é o CASB feito para isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Microsoft Defender for Cloud Apps",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender for Cloud",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Endpoint",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Identity",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização já usa o Microsoft Entra ID Protection para o risco das contas na nuvem. Agora quer detectar reconhecimento e movimento lateral contra as identidades do Active Directory local. Qual serviço complementa o Entra ID Protection nesse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Microsoft Defender for Identity",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender for Cloud Apps",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Cloud",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Endpoint",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Defender Vulnerability Management e Defender Threat Intelligence",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Defender Vulnerability Management\n\nO Microsoft Defender Vulnerability Management cuida da gestão de vulnerabilidades: encontrar e corrigir as fraquezas dos ativos antes que um atacante as explore. Ele faz a descoberta e o inventário contínuo dos ativos, avalia as vulnerabilidades (as falhas de software conhecidas, os CVEs), verifica configurações inseguras e recomenda correções priorizadas pelo risco real.\n\nEm vez de uma lista enorme e sem ordem de falhas, ele destaca o que corrigir primeiro, com base no impacto e na probabilidade de exploração. É a resposta quando o cenário fala em descobrir, priorizar e remediar vulnerabilidades para reduzir a superfície de ataque."
                    },
                    {
                        "type": "text",
                        "value": "## Defender Threat Intelligence (Defender TI)\n\nO Microsoft Defender Threat Intelligence, ou Defender TI, mapeia o cenário global de ameaças. Ele reúne inteligência sobre os adversários: perfis de grupos atacantes, suas ferramentas e táticas, indicadores de comprometimento (IOCs) como domínios e endereços maliciosos, e vulnerabilidades exploradas ativamente.\n\nCom isso, a equipe de segurança entende quem são os atacantes e como agem, o que enriquece as investigações e a caça a ameaças. Enquanto a gestão de vulnerabilidades olha para dentro (as suas próprias fraquezas), a inteligência de ameaças olha para fora (os adversários e o que eles usam)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Serviço\",\"Foco\",\"O que cobre\"],[\"Defender for Office 365\",\"E-mail e colaboração\",\"Phishing, anexos e links maliciosos\"],[\"Defender for Endpoint\",\"Dispositivos\",\"Malware, ransomware e EDR\"],[\"Defender for Identity\",\"Identidades do AD local\",\"Reconhecimento e movimento lateral\"],[\"Defender for Cloud Apps\",\"Apps SaaS (CASB)\",\"Shadow IT e ameaças em SaaS\"],[\"Defender Vulnerability Management\",\"Vulnerabilidades dos ativos\",\"Falhas conhecidas e configurações fracas\"],[\"Defender Threat Intelligence\",\"Adversários e ameaças globais\",\"Perfis de atacantes e IOCs\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Olhar para dentro e para fora\n\nEsses dois serviços se completam. O Defender Vulnerability Management mostra as suas fraquezas, ou seja, o que precisa ser corrigido nos seus ativos. O Defender Threat Intelligence mostra as ameaças externas, ou seja, quem ataca e com o quê. Junto com os demais serviços da família, ambos alimentam o Defender XDR, que correlaciona tudo em incidentes no portal do Defender.\n\nSaber para que serve cada serviço é o que a prova mais cobra. Vulnerabilidade é fraqueza sua; inteligência de ameaças é conhecimento sobre o inimigo."
                    },
                    {
                        "type": "quote",
                        "value": "Defender Vulnerability Management encontra e prioriza as suas vulnerabilidades (olhar para dentro); Defender Threat Intelligence perfila os atacantes e seus indicadores (olhar para fora)."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa quer descobrir seus ativos, listar as vulnerabilidades de software e receber recomendações de correção priorizadas pelo risco. Qual serviço atende a isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Defender Vulnerability Management",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender Threat Intelligence",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Office 365",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Identity",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual serviço fornece perfis de grupos atacantes, suas ferramentas e indicadores de comprometimento (IOCs) para enriquecer as investigações de segurança?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Defender Threat Intelligence (Defender TI)",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender Vulnerability Management (MDVM)",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Endpoint, com o EDR ativado",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Cloud Apps, atuando como CASB",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time de segurança quer saber quais falhas corrigir primeiro nos seus servidores, priorizadas pelo risco de exploração. Qual serviço é o indicado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Microsoft Defender Vulnerability Management",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender Threat Intelligence",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Cloud Apps",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Office 365",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante uma investigação, a equipe quer entender as táticas e os indicadores de um grupo atacante conhecido para caçar sinais dele no ambiente. Qual serviço fornece essa inteligência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Microsoft Defender Threat Intelligence (Defender TI)",
                                "isCorrect": true
                            },
                            {
                                "text": "Microsoft Defender Vulnerability Management (MDVM)",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Identity, olhando o AD local",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Defender for Endpoint, isolando o dispositivo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Associe corretamente: para (1) revelar shadow IT em apps SaaS e (2) priorizar a correção de vulnerabilidades dos ativos, os serviços certos são, respectivamente:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Defender for Cloud Apps e Defender Vulnerability Management",
                                "isCorrect": true
                            },
                            {
                                "text": "Defender Vulnerability Management e Defender for Cloud Apps",
                                "isCorrect": false
                            },
                            {
                                "text": "Defender for Identity e Defender Threat Intelligence",
                                "isCorrect": false
                            },
                            {
                                "text": "Defender Threat Intelligence e Defender for Endpoint",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Conformidade e governança de dados com o Microsoft Purview",
        "aulas": [
            {
                "titulo": "Service Trust Portal, privacidade e o portal do Purview",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Confiança, conformidade e o Service Trust Portal\nO Domínio 4 do SC-900 trata de como a Microsoft ajuda uma organização a cumprir leis, normas e padrões e a governar seus dados. O ponto de partida é confiar na nuvem: como uma empresa sabe que os serviços da Microsoft cumprem normas como ISO e SOC?\n\nA resposta é o Service Trust Portal (STP), o site público onde a Microsoft publica sua documentação de segurança, privacidade e conformidade. Nele estão relatórios de auditoria independentes (ISO, SOC, FedRAMP), guias de proteção de dados e materiais por setor e região. É a fonte que uma empresa usa para fazer sua devida diligência e comprovar a auditores que a nuvem da Microsoft é confiável."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Recurso do Service Trust Portal\",\"O que oferece\"],[\"Relatórios de auditoria\",\"Relatórios ISO, SOC, FedRAMP e outros sobre os serviços da Microsoft\"],[\"Documentos de confiança\",\"Guias de segurança, proteção de dados e resposta a incidentes\"],[\"Recursos por setor e região\",\"Materiais de conformidade específicos de indústrias e países\"],[\"Recursos para sua organização\",\"Ferramentas para avaliar o uso dos serviços de nuvem\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Os princípios de privacidade da Microsoft\nA Microsoft baseia o tratamento de dados em seis princípios de privacidade que descrevem seu compromisso com quem usa os serviços. Na prova, eles caem no formato 'qual princípio corresponde a este cenário'.\n\nOs seis são: controle, transparência, segurança, proteções legais robustas, nenhum direcionamento com base em conteúdo e benefícios para você. O mais lembrado é o de nenhum direcionamento com base em conteúdo: a Microsoft não usa seu email, chat ou arquivos para exibir anúncios direcionados. O de controle diz que é você quem decide sobre seus dados e configurações de privacidade."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Princípio de privacidade\",\"O que significa\"],[\"Controle\",\"Você controla seus dados e as configurações de privacidade\"],[\"Transparência\",\"A Microsoft é clara sobre a coleta e o uso dos dados\"],[\"Segurança\",\"Os dados são protegidos com segurança forte e criptografia\"],[\"Proteções legais robustas\",\"A Microsoft respeita as leis locais de privacidade\"],[\"Nenhum direcionamento com base em conteúdo\",\"Seu email, chat e arquivos não são usados para direcionar anúncios\"],[\"Benefícios para você\",\"Quando há coleta, os dados servem para melhorar sua experiência\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O portal do Microsoft Purview\nO Microsoft Purview (antigo Microsoft 365 Compliance) é a família de soluções de conformidade e governança de dados da Microsoft, e o portal do Purview é onde você acessa todas elas em um só lugar.\n\nDe dentro do portal você chega ao Compliance Manager, à proteção da informação e aos rótulos de confidencialidade, à prevenção de perda de dados (DLP), à gestão do ciclo de vida e de registros, à gestão de risco interno, ao eDiscovery e à auditoria. Cada um desses temas é uma aula deste módulo. A diferença essencial: o Service Trust Portal mostra a conformidade da própria Microsoft, enquanto o portal do Purview é onde você administra a conformidade da sua organização."
                    },
                    {
                        "type": "quote",
                        "value": "O Service Trust Portal traz a documentação de conformidade da própria Microsoft; o portal do Purview é onde você administra a conformidade da sua organização. Não confunda os dois."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um auditor pede as evidências de que os serviços de nuvem da Microsoft cumprem normas como ISO e SOC. Onde a empresa encontra esses relatórios de auditoria?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Service Trust Portal",
                                "isCorrect": true
                            },
                            {
                                "text": "Compliance Manager",
                                "isCorrect": false
                            },
                            {
                                "text": "Portal do Microsoft Purview",
                                "isCorrect": false
                            },
                            {
                                "text": "Portal do Microsoft Defender",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual princípio de privacidade da Microsoft garante que seu email, chat e arquivos não sejam usados para direcionar anúncios?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Nenhum direcionamento com base em conteúdo",
                                "isCorrect": true
                            },
                            {
                                "text": "Transparência sobre a coleta de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Controle total do usuário sobre os dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Segurança forte com criptografia",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer administrar suas próprias atividades de conformidade, como avaliações e ações de melhoria. Em qual portal ela deve trabalhar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Portal do Microsoft Purview",
                                "isCorrect": true
                            },
                            {
                                "text": "Service Trust Portal",
                                "isCorrect": false
                            },
                            {
                                "text": "Portal do Azure",
                                "isCorrect": false
                            },
                            {
                                "text": "Portal do Microsoft Defender",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao revisar as configurações do serviço, o cliente pode decidir quais dados compartilha e ajustar sua privacidade. Qual princípio de privacidade da Microsoft isso representa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Controle",
                                "isCorrect": true
                            },
                            {
                                "text": "Segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "Transparência",
                                "isCorrect": false
                            },
                            {
                                "text": "Benefícios para você",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença entre o Service Trust Portal e o Compliance Manager?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Service Trust Portal publica a conformidade da própria Microsoft; o Compliance Manager gerencia a da sua organização",
                                "isCorrect": true
                            },
                            {
                                "text": "O Service Trust Portal gerencia a conformidade da sua empresa e o Compliance Manager apenas hospeda relatórios da Microsoft",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos fazem exatamente a mesma coisa, são nomes diferentes para o mesmo serviço",
                                "isCorrect": false
                            },
                            {
                                "text": "O Service Trust Portal aplica rótulos de confidencialidade e o Compliance Manager bloqueia vazamentos de dados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Compliance Manager e o compliance score",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é o Compliance Manager\nO Compliance Manager, disponível no portal do Microsoft Purview, ajuda a organização a gerenciar seus requisitos de conformidade de ponta a ponta. Ele traduz normas e regulamentos em ações práticas e mede o progresso.\n\nEle trabalha com quatro peças. O controle é um requisito de uma norma, padrão ou política interna. A avaliação (assessment) agrupa os controles de um regulamento específico, como LGPD ou ISO 27001. O modelo (template) é a base pronta usada para criar uma avaliação. E a ação de melhoria é a recomendação que, ao ser concluída, aproxima a empresa da conformidade e soma pontos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conceito\",\"O que é\"],[\"Controle\",\"Um requisito de um regulamento, padrão ou política interna\"],[\"Avaliação (assessment)\",\"Agrupamento de controles para um regulamento ou padrão específico\"],[\"Modelo (template)\",\"Base pronta usada para criar uma avaliação a partir de um regulamento\"],[\"Ação de melhoria\",\"Recomendação que, ao ser concluída, aumenta a pontuação de conformidade\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O compliance score\nO compliance score (pontuação de conformidade) resume, em um número, o quanto a organização já avançou. Ele parte de uma linha de base de proteção de dados e sobe conforme você conclui ações de melhoria; cada ação vale uma quantidade de pontos.\n\nA pontuação reflete dois lados. As ações gerenciadas pela Microsoft já vêm cumpridas pela plataforma e contam a favor da empresa. As ações gerenciadas por você são as que sua equipe precisa implementar e testar. Assim, o compliance score é uma medida de responsabilidade compartilhada: parte do trabalho é da Microsoft, parte é sua."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Categoria da ação\",\"O que faz\",\"Exemplo\"],[\"Preventiva\",\"Reduz o risco antes que ele aconteça\",\"Criptografar dados em repouso\"],[\"Detectiva\",\"Monitora para identificar riscos ou violações\",\"Ativar a auditoria de atividades\"],[\"Corretiva\",\"Responde e limita o dano após um incidente\",\"Executar um plano de resposta a vazamento\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Tipos de ação de melhoria\nCada ação de melhoria tem uma categoria que ajuda a entender seu papel. As ações preventivas reduzem o risco antes que ele aconteça, como criptografar dados. As detectivas monitoram o ambiente para identificar riscos e violações, como ativar a auditoria. As corretivas entram em cena depois de um incidente, para limitar o dano.\n\nAlém disso, uma ação pode ser obrigatória, quando não pode ser contornada pelo usuário, ou discricionária, quando depende de as pessoas seguirem uma boa prática. Saber distinguir preventiva, detectiva e corretiva é o que a prova mais cobra aqui."
                    },
                    {
                        "type": "quote",
                        "value": "O compliance score reflete tanto ações gerenciadas pela Microsoft quanto as suas: você ganha pontos ao concluir ações de melhoria, que podem ser preventivas, detectivas ou corretivas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual ferramenta do Microsoft Purview ajuda a gerenciar os requisitos de conformidade e fornece uma pontuação que mede o progresso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Compliance Manager",
                                "isCorrect": true
                            },
                            {
                                "text": "Service Trust Portal",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsoft Sentinel",
                                "isCorrect": false
                            },
                            {
                                "text": "Content explorer",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Compliance Manager, o que é uma avaliação (assessment)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um agrupamento de controles para um regulamento específico",
                                "isCorrect": true
                            },
                            {
                                "text": "Um relatório de auditoria publicado pela Microsoft",
                                "isCorrect": false
                            },
                            {
                                "text": "Um rótulo de confidencialidade aplicado a documentos",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma máquina virtual usada para testes de conformidade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A pontuação de conformidade de uma empresa aumentou depois que a equipe concluiu várias recomendações no Compliance Manager. O que fez a pontuação subir?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A conclusão de ações de melhoria",
                                "isCorrect": true
                            },
                            {
                                "text": "A criação de novas máquinas virtuais no Azure",
                                "isCorrect": false
                            },
                            {
                                "text": "O aumento do número de usuários licenciados",
                                "isCorrect": false
                            },
                            {
                                "text": "A abertura de mais casos de eDiscovery",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização ativa a auditoria para monitorar e identificar atividades suspeitas em seu ambiente. No Compliance Manager, que categoria de ação de melhoria é essa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Detectiva",
                                "isCorrect": true
                            },
                            {
                                "text": "Preventiva",
                                "isCorrect": false
                            },
                            {
                                "text": "Corretiva",
                                "isCorrect": false
                            },
                            {
                                "text": "Discricionária",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para reduzir o risco antes que ele ocorra, uma empresa passa a criptografar todos os dados em repouso. No Compliance Manager, como essa ação de melhoria é classificada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Preventiva",
                                "isCorrect": true
                            },
                            {
                                "text": "Detectiva",
                                "isCorrect": false
                            },
                            {
                                "text": "Corretiva",
                                "isCorrect": false
                            },
                            {
                                "text": "Obrigatória",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Classificação de dados e proteção da informação",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Classificação de dados\nAntes de proteger um dado, é preciso saber que dado é esse. A classificação de dados do Microsoft Purview identifica informações sensíveis no conteúdo da organização usando três abordagens.\n\nOs tipos de informação confidencial (sensitive information types, ou SITs) reconhecem dados por padrões, palavras-chave e validações, como um número de cartão de crédito ou um CPF. Os classificadores treináveis usam aprendizado de máquina para reconhecer conteúdo por exemplos, úteis quando não há um padrão fixo, como identificar currículos ou contratos. A correspondência exata de dados (EDM) compara o conteúdo com os valores de uma base específica, como a lista real de clientes da empresa.\n\n## Content explorer e Activity explorer\nDuas ferramentas ajudam a enxergar os dados classificados. O Content explorer mostra um retrato atual de onde o conteúdo classificado e rotulado está guardado, permitindo abrir e inspecionar os itens. O Activity explorer mostra, ao longo do tempo, as atividades feitas sobre esse conteúdo, como um rótulo aplicado, alterado ou rebaixado e arquivos compartilhados. Em resumo: Content explorer é onde os dados estão agora; Activity explorer é o que aconteceu com eles."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método de classificação\",\"Como identifica os dados\",\"Exemplo\"],[\"Tipo de informação confidencial (SIT)\",\"Por padrões, palavras-chave e validações\",\"Número de cartão de crédito ou CPF\"],[\"Classificador treinável\",\"Por aprendizado de máquina, a partir de exemplos\",\"Reconhecer currículos ou contratos\"],[\"Correspondência exata de dados (EDM)\",\"Comparando com valores de uma base específica\",\"Uma lista real de clientes da empresa\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Rótulos de confidencialidade (sensitivity labels)\nO rótulo de confidencialidade é a etiqueta que classifica e protege um item, como Público, Interno ou Confidencial. Ele acompanha o arquivo aonde quer que ele vá e pode aplicar proteções concretas: criptografar o conteúdo, marcá-lo com cabeçalho, rodapé ou marca d'água, restringir o acesso e proteger contêineres como sites do SharePoint e equipes do Teams.\n\nOs rótulos são publicados aos usuários por meio de políticas de rótulo (label policies), que definem quem vê quais rótulos, qual é o rótulo padrão, se rotular é obrigatório e se é preciso justificar ao rebaixar um rótulo. Os rótulos também podem ser aplicados automaticamente (auto-labeling) quando o conteúdo contém dados sensíveis, sem depender do usuário."
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que um rótulo de confidencialidade pode fazer\",\"Exemplo\"],[\"Criptografar o conteúdo\",\"Só quem tem permissão consegue abrir o arquivo\"],[\"Marcar o conteúdo\",\"Adicionar cabeçalho, rodapé ou marca d'água\"],[\"Proteger contêineres\",\"Aplicar regras a sites do SharePoint, Teams e grupos\"],[\"Aplicar-se automaticamente\",\"Rotular por conta própria ao detectar dados sensíveis\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Prevenção de perda de dados (DLP)\nClassificar e rotular diz o que é sensível; a prevenção de perda de dados (Data Loss Prevention, DLP) impede que esse dado escape. Uma política de DLP monitora locais como email do Exchange, SharePoint, OneDrive, Teams e os dispositivos dos usuários e age quando detecta informação sensível saindo de forma indevida.\n\nA política pode bloquear o compartilhamento, alertar o administrador, exigir justificativa ou mostrar uma dica de política (policy tip) que avisa o usuário na hora. Com a DLP de endpoint (Endpoint DLP), o alcance chega aos dispositivos, controlando ações como copiar um arquivo confidencial para um pen drive ou imprimi-lo. É a DLP que transforma a classificação em uma regra que de fato impede o vazamento."
                    },
                    {
                        "type": "quote",
                        "value": "Classificar identifica os dados sensíveis; o rótulo de confidencialidade os protege (criptografa e marca); a DLP impede que eles vazem. Content explorer mostra onde estão; Activity explorer, o que aconteceu com eles."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa quer identificar automaticamente números de cartão de crédito e de documentos nos arquivos, usando padrões e validações. Qual recurso de classificação faz isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Tipo de informação confidencial (SIT)",
                                "isCorrect": true
                            },
                            {
                                "text": "Classificador treinável por exemplos",
                                "isCorrect": false
                            },
                            {
                                "text": "Rótulo de retenção do documento",
                                "isCorrect": false
                            },
                            {
                                "text": "Activity explorer do Purview",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Que recurso aplica a um documento uma etiqueta como 'Confidencial' e ainda pode criptografá-lo e inserir uma marca d'água?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Rótulo de confidencialidade (sensitivity label)",
                                "isCorrect": true
                            },
                            {
                                "text": "Rótulo de retenção aplicado ao documento",
                                "isCorrect": false
                            },
                            {
                                "text": "Tipo de informação confidencial (SIT) do texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Política de DLP configurada no Purview",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A organização precisa classificar documentos que não seguem um padrão fixo, como currículos e contratos, com base em exemplos fornecidos. Qual recurso é o mais indicado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Classificador treinável",
                                "isCorrect": true
                            },
                            {
                                "text": "Tipo de informação confidencial baseado em padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Correspondência exata de dados (EDM)",
                                "isCorrect": false
                            },
                            {
                                "text": "Content explorer",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um administrador quer ver um retrato atual de onde estão guardados os documentos que contêm dados classificados. Qual ferramenta usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Content explorer",
                                "isCorrect": true
                            },
                            {
                                "text": "Activity explorer",
                                "isCorrect": false
                            },
                            {
                                "text": "Compliance Manager",
                                "isCorrect": false
                            },
                            {
                                "text": "Service Trust Portal",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer impedir que os funcionários enviem por email para fora, ou copiem para um pen drive, arquivos que contenham números de cartão de crédito, avisando o usuário no momento da ação. Qual recurso do Purview atende a isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Prevenção de perda de dados (DLP)",
                                "isCorrect": true
                            },
                            {
                                "text": "Rótulo de confidencialidade, que classifica o arquivo mas não bloqueia o envio",
                                "isCorrect": false
                            },
                            {
                                "text": "Política de retenção",
                                "isCorrect": false
                            },
                            {
                                "text": "Gestão de risco interno",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ciclo de vida dos dados e gestão de registros",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Governança do ciclo de vida dos dados\nDados não devem viver para sempre nem sumir cedo demais. A gestão do ciclo de vida de dados (Data Lifecycle Management) do Microsoft Purview define por quanto tempo o conteúdo é mantido e o que acontece com ele no fim: manter, excluir, ou manter e depois excluir.\n\nManter conteúdo por um período ajuda a cumprir obrigações legais e regulatórias; excluir o que não é mais necessário reduz risco e custo. Essa retenção é aplicada por meio de políticas de retenção e rótulos de retenção."
                    },
                    {
                        "type": "text",
                        "value": "## Políticas de retenção x rótulos de retenção\nAs duas formas de reter têm alcances diferentes. A política de retenção é ampla: aplica uma regra a locais inteiros, como todas as caixas do Exchange, sites do SharePoint, contas do OneDrive e o Teams, sem exigir nenhuma ação do usuário. É a escolha para valer uma regra geral de uma vez só.\n\nO rótulo de retenção é preciso: aplica a regra a itens específicos, como um documento ou um email, de forma manual ou automática. Só o rótulo de retenção pode iniciar uma revisão de descarte no fim do período e declarar um item como registro, ligando a retenção à gestão de registros."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Política de retenção\",\"Rótulo de retenção\"],[\"Aplicada a\",\"Locais inteiros (Exchange, SharePoint, OneDrive, Teams)\",\"Itens individuais (documentos e emails)\"],[\"Como é aplicada\",\"Automaticamente ao local, sem ação do usuário\",\"Manual ou automaticamente, item a item\"],[\"Recursos extras\",\"Retém e/ou exclui o conteúdo\",\"Pode iniciar revisão de descarte e declarar registros\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Gestão de registros (records management)\nAlguns documentos precisam ser preservados como registros oficiais por exigência legal. A gestão de registros do Microsoft Purview usa rótulos de retenção para declarar um item como registro (record) ou como registro regulatório (regulatory record).\n\nAo ser declarado registro, o item ganha restrições: sua exclusão passa a ser controlada e há trilha de auditoria. O registro regulatório é ainda mais rígido: fica bloqueado, não pode ser editado e seu rótulo não pode ser alterado nem removido. No fim do período de retenção, uma revisão de descarte (disposition review) permite que um responsável decida se o item é excluído ou mantido, e o plano de arquivos (file plan) organiza todos os rótulos de retenção em escala."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo\",\"Pode ser editado?\",\"Pode ter o rótulo alterado ou removido?\"],[\"Registro (record)\",\"Sim, com controle e trilha de auditoria\",\"Sim, por quem tem permissão\"],[\"Registro regulatório (regulatory record)\",\"Não, fica bloqueado\",\"Não, não pode ser alterado nem removido\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Política de retenção age em locais inteiros sem ação do usuário; o rótulo de retenção age em itens e pode declarar registros. Um registro regulatório fica bloqueado e não pode ser editado nem ter o rótulo removido."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa precisa manter os emails financeiros por sete anos e, depois desse prazo, excluí-los automaticamente. Qual recurso do Purview atende a isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Retenção, por política ou rótulo",
                                "isCorrect": true
                            },
                            {
                                "text": "Rótulo de confidencialidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Prevenção de perda de dados (DLP)",
                                "isCorrect": false
                            },
                            {
                                "text": "eDiscovery",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para aplicar uma regra de retenção a um documento específico, e não a um local inteiro, qual recurso é usado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Rótulo de retenção",
                                "isCorrect": true
                            },
                            {
                                "text": "Política de retenção",
                                "isCorrect": false
                            },
                            {
                                "text": "Rótulo de confidencialidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Tipo de informação confidencial",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A empresa quer aplicar, de uma só vez e sem ação dos usuários, uma regra de retenção a todas as caixas de correio do Exchange e a todos os sites do SharePoint. Qual recurso é o mais indicado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Política de retenção",
                                "isCorrect": true
                            },
                            {
                                "text": "Rótulo de retenção aplicado item a item",
                                "isCorrect": false
                            },
                            {
                                "text": "Rótulo de confidencialidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Política de DLP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um documento precisa ser declarado registro oficial, de modo que sua exclusão passe a ser controlada e auditada. Qual recurso do Purview faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Gestão de registros, por meio de rótulo de retenção",
                                "isCorrect": true
                            },
                            {
                                "text": "Rótulo de confidencialidade aplicado ao arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Política de DLP monitorando o compartilhamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Content explorer mostrando onde o item está",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma norma exige que certos documentos fiquem totalmente bloqueados: não podem ser editados, e seu rótulo não pode ser alterado nem removido durante todo o período de guarda. Que recurso atende a essa exigência?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Declarar o item como registro regulatório (regulatory record)",
                                "isCorrect": true
                            },
                            {
                                "text": "Declarar o item como registro comum (record), que ainda permite edição controlada",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar um rótulo de confidencialidade com criptografia",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar uma retenção simples, sem declarar registro",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Gestão de risco interno, eDiscovery e auditoria",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Gestão de risco interno (insider risk management)\nNem toda ameaça vem de fora. A gestão de risco interno do Microsoft Purview ajuda a detectar, investigar e agir sobre atividades de risco praticadas por pessoas de dentro da organização, como roubo de dados por quem está de saída, vazamento de informações confidenciais e violações de políticas de segurança.\n\nEla usa políticas baseadas em modelos e combina sinais de vários serviços, inclusive dados de RH, para apontar comportamentos suspeitos. Por lidar com pessoas, é construída com privacidade em mente: por padrão os usuários aparecem pseudonimizados e o acesso é baseado em papéis, para investigar sem expor identidades sem necessidade."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cenário de risco interno\",\"Exemplo\"],[\"Roubo de dados por quem vai sair\",\"Funcionário baixa arquivos logo após pedir demissão\"],[\"Vazamento de dados\",\"Envio de informações confidenciais para fora da empresa\"],[\"Violação de políticas de segurança\",\"Uso indevido de dados ou recursos por um usuário interno\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## eDiscovery\nQuando há um processo judicial ou uma investigação, a empresa precisa localizar, preservar e entregar o conteúdo eletrônico relevante. É isso que faz o eDiscovery (descoberta eletrônica): pesquisar dados em serviços como Exchange, SharePoint, OneDrive e Teams, colocá-los em espera (hold) para que não sejam alterados nem apagados e exportá-los.\n\nExistem dois níveis. O eDiscovery (Standard) permite criar casos, aplicar retenções, pesquisar e exportar. O eDiscovery (Premium) acrescenta um fluxo completo de investigação: gestão de custodiantes, avisos de retenção legal, conjuntos de revisão (review sets) e análises avançadas, como reduzir duplicados e priorizar os documentos mais relevantes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Recurso\",\"eDiscovery (Standard)\",\"eDiscovery (Premium)\"],[\"Casos, retenções e busca\",\"Sim\",\"Sim\"],[\"Exportar conteúdo\",\"Sim\",\"Sim\"],[\"Custodiantes e avisos de retenção legal\",\"Não\",\"Sim\"],[\"Conjuntos de revisão e análise avançada\",\"Não\",\"Sim\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Auditoria (audit)\nA solução de auditoria registra as atividades realizadas nos serviços da Microsoft 365: quem acessou, criou, alterou ou excluiu o quê e quando. Esses logs são pesquisáveis no portal do Purview e sustentam investigações de segurança, análises forenses e comprovação de conformidade.\n\nHá dois níveis. A auditoria (Standard) registra e permite pesquisar os eventos por um período padrão. A auditoria (Premium) amplia o período de retenção dos logs, dá acesso a mais eventos considerados relevantes para investigações e oferece maior largura de banda de acesso via API para análises mais profundas."
                    },
                    {
                        "type": "quote",
                        "value": "Risco interno cuida de ameaças vindas de dentro; o eDiscovery preserva e exporta conteúdo para processos legais; a auditoria registra quem fez o quê e quando."
                    }
                ],
                "questions": [
                    {
                        "statement": "A empresa suspeita que funcionários prestes a sair estão baixando arquivos confidenciais para levar consigo. Qual solução do Purview ajuda a detectar e investigar esse comportamento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Gestão de risco interno (insider risk management)",
                                "isCorrect": true
                            },
                            {
                                "text": "eDiscovery para processos judiciais em andamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Auditoria (audit) dos acessos e alterações",
                                "isCorrect": false
                            },
                            {
                                "text": "Compliance Manager e o compliance score da empresa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Que solução do Purview registra quem acessou, alterou ou excluiu itens e quando, servindo de base para investigações de segurança e forense?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Auditoria (audit)",
                                "isCorrect": true
                            },
                            {
                                "text": "eDiscovery",
                                "isCorrect": false
                            },
                            {
                                "text": "Gestão de risco interno",
                                "isCorrect": false
                            },
                            {
                                "text": "Compliance Manager",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O departamento jurídico precisa localizar, preservar em espera e exportar emails e documentos relevantes para um processo judicial em andamento. Qual solução usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "eDiscovery",
                                "isCorrect": true
                            },
                            {
                                "text": "Gestão de risco interno",
                                "isCorrect": false
                            },
                            {
                                "text": "Auditoria (audit)",
                                "isCorrect": false
                            },
                            {
                                "text": "Prevenção de perda de dados (DLP)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma investigação jurídica complexa exige gerir custodiantes, enviar avisos de retenção legal e revisar documentos em conjuntos de revisão com análise avançada. Qual recurso atende a esse fluxo completo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "eDiscovery (Premium)",
                                "isCorrect": true
                            },
                            {
                                "text": "eDiscovery (Standard)",
                                "isCorrect": false
                            },
                            {
                                "text": "Auditoria (Standard)",
                                "isCorrect": false
                            },
                            {
                                "text": "Gestão de risco interno",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer, de forma proativa, monitorar sinais de que um usuário interno pode estar vazando dados, mesmo sem nenhum processo judicial em curso e antes que isso vire um incidente. Qual solução é a adequada, em vez de preservar provas para um processo ou apenas consultar registros do passado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Gestão de risco interno (insider risk management)",
                                "isCorrect": true
                            },
                            {
                                "text": "eDiscovery (Premium), voltado a preservar e revisar provas para processos legais",
                                "isCorrect": false
                            },
                            {
                                "text": "Auditoria, que apenas registra ações já ocorridas",
                                "isCorrect": false
                            },
                            {
                                "text": "Service Trust Portal",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: "iniciante", description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.");
        return;
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
    console.log("Seed concluído: " + MODULOS.length + " módulos, " + totalAulas + " aulas, " + totalQuestoes + " questões.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
