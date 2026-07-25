// Seed da trilha Kubernetes (do básico ao avançado). Conteúdo autoral, quiz-only.
// Idempotente e não destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-kubernetes.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Kubernetes";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Kubernetes do básico ao avançado: por que orquestrar containers, a arquitetura do cluster e o modelo declarativo, Pods e workloads, controladores (Deployment, ReplicaSet, DaemonSet, Job), rede e Services, Ingress, ConfigMaps e Secrets, volumes e estado com StatefulSet, saúde e recursos (probes, requests/limits, HPA) e o caminho para produção com RBAC, Helm e GitOps. A plataforma que orquestra containers em escala.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

// Preenchido na montagem, um módulo por vez, a partir da autoria por subagente.
const MODULOS = [
    {
        "titulo": "Módulo 1 - Fundamentos de Kubernetes",
        "aulas": [
            {
                "titulo": "O que é Kubernetes e o problema que resolve",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Do container ao orquestrador\n\nUm container empacota sua aplicação com tudo que ela precisa para rodar: código, bibliotecas e dependências. Isso resolve o velho problema do \"na minha máquina funciona\". O que um container sozinho não resolve é operar dezenas ou centenas deles, espalhados por vários servidores, em produção.\n\nKubernetes (abreviado como K8s) é um orquestrador de containers: um sistema que decide onde cada container roda, os mantém no ar e coordena a comunicação entre eles. Ele nasceu na Google e hoje é mantido pela CNCF, sendo o padrão de mercado para essa função."
                    },
                    {
                        "type": "text",
                        "value": "## Por que fazer na mão não escala\n\nImagine subir 40 containers em 5 servidores manualmente. Algumas perguntas aparecem rápido:\n\n- Em qual servidor ainda cabe mais um container? Quem controla a memória e a CPU livres?\n- Um container caiu às 3 da manhã. Quem percebe e sobe outro no lugar?\n- A carga triplicou na promoção. Quem cria réplicas e depois as remove?\n- Como um container acha o outro se o IP muda a cada reinício?\n- Como atualizar a versão sem derrubar o serviço para os usuários?\n\nResolver isso com scripts e plantão humano funciona para poucos containers, mas vira um trabalho lento e sujeito a erro conforme o número cresce."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tarefa\",\"Na mão\",\"Com Kubernetes\"],[\"Escolher o servidor\",\"Você calcula CPU e memória livres\",\"O scheduler decide sozinho\"],[\"Container que caiu\",\"Alguém precisa notar e subir outro\",\"Recuperação automática\"],[\"Aumento de carga\",\"Criar réplicas manualmente\",\"Escala horizontal sob demanda\"],[\"Comunicação\",\"Rastrear IPs que mudam\",\"Rede e Service com nome fixo\"],[\"Nova versão\",\"Parar e subir na unha\",\"Rollout e rollback controlados\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que o Kubernetes automatiza\n\nO K8s cuida do ciclo de vida das aplicações em container por você:\n\n- **Agendamento (scheduling)**: escolhe em qual nó cada container roda, com base nos recursos disponíveis.\n- **Auto-recuperação (self-healing)**: reinicia containers que falham e substitui os que ficam sem resposta.\n- **Escala**: aumenta ou reduz o número de réplicas conforme a demanda, de forma manual ou automática.\n- **Rede e descoberta de serviço**: dá endereços estáveis para que os containers se encontrem sem depender de IPs.\n- **Atualizações**: aplica novas versões aos poucos (rolling update) e reverte se algo der errado."
                    },
                    {
                        "type": "quote",
                        "value": "Kubernetes é um orquestrador: você declara o estado desejado das aplicações e ele agenda, recupera, escala e conecta os containers para manter esse estado, sem intervenção manual a cada passo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma pessoa está começando com Kubernetes e pergunta qual problema principal a ferramenta resolve. Qual a melhor resposta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Orquestrar containers em escala e mantê-los no ar",
                                "isCorrect": true
                            },
                            {
                                "text": "Empacotar a aplicação e suas dependências em uma imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Compilar o código-fonte da aplicação em um binário",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenar o histórico de versões do código da equipe",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um container da aplicação caiu de madrugada, sem ninguém de plantão. No dia seguinte a equipe percebe que ele voltou a rodar sozinho. Qual recurso do Kubernetes fez isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Auto-recuperação, que substitui containers com falha",
                                "isCorrect": true
                            },
                            {
                                "text": "Agendamento, que escolhe o nó com recursos livres",
                                "isCorrect": false
                            },
                            {
                                "text": "Escala horizontal, que ajusta o número de réplicas",
                                "isCorrect": false
                            },
                            {
                                "text": "Rolling update, que troca a versão da aplicação aos poucos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante uma promoção, o tráfego do site triplica por algumas horas e depois normaliza. A equipe quer que o número de réplicas acompanhe essa variação. Qual capacidade do Kubernetes atende a isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Escala horizontal, ajustando as réplicas pela carga",
                                "isCorrect": true
                            },
                            {
                                "text": "Auto-recuperação, reiniciando containers que falham",
                                "isCorrect": false
                            },
                            {
                                "text": "Rede de serviço, dando nome fixo aos containers",
                                "isCorrect": false
                            },
                            {
                                "text": "Rollback, voltando para uma versão anterior",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe roda 40 containers em 5 servidores subindo cada um na mão. Conforme cresce, o processo fica lento e cheio de erros. Qual é o principal motivo que justifica adotar um orquestrador?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fazer isso na mão em muitos servidores não escala",
                                "isCorrect": true
                            },
                            {
                                "text": "Containers isolados não acessam a rede externa",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada servidor executa apenas um container por vez",
                                "isCorrect": false
                            },
                            {
                                "text": "As imagens de container ficam grandes sem orquestração",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma entrevista, alguém diz que Kubernetes e Docker fazem a mesma coisa. Qual afirmação corrige esse engano?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Docker roda containers; Kubernetes os orquestra entre nós",
                                "isCorrect": true
                            },
                            {
                                "text": "Docker orquestra os nós; Kubernetes gera as imagens de container",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos apenas criam imagens, mudando só a linguagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Docker roda em Linux e Kubernetes roda em Windows",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Do container ao cluster",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## De uma máquina para um conjunto\n\nUm container precisa de uma máquina para rodar. Quando você tem muitas aplicações, uma máquina só não dá conta, e é aí que entra o cluster. Um cluster Kubernetes é um conjunto de máquinas, chamadas nós (nodes), que trabalham juntas como se fossem um recurso único.\n\nCada nó pode ser um servidor físico ou uma máquina virtual, na nuvem ou no seu data center. O Kubernetes enxerga todos os nós somados como um grande pool de CPU e memória disponível para rodar containers."
                    },
                    {
                        "type": "text",
                        "value": "## Dois papéis: control plane e worker\n\nOs nós de um cluster se dividem em dois papéis:\n\n- **Control plane**: o cérebro do cluster. Toma as decisões, guarda o estado desejado e responde quando você pede algo. Não é onde suas aplicações rodam.\n- **Worker nodes**: onde as aplicações de fato rodam, dentro de Pods. É o músculo que executa a carga de trabalho.\n\nEm produção, o control plane costuma ser replicado em várias máquinas para não ter ponto único de falha. Em clusters de estudo, control plane e worker podem ficar na mesma máquina."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Control plane\",\"Worker node\"],[\"Função\",\"Decide e coordena\",\"Executa as cargas\"],[\"Roda suas aplicações?\",\"Não\",\"Sim, nos Pods\"],[\"Guarda o estado do cluster\",\"Sim\",\"Não\"],[\"Exemplo de tarefa\",\"Agendar e reconciliar\",\"Rodar os containers\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O cluster como um computador só\n\nA ideia central é parar de pensar em máquinas individuais. Você não escolhe \"vou rodar esse container no servidor 3\". Você declara o que quer rodar e o Kubernetes decide em qual nó colocar, considerando recursos e regras.\n\nSe um nó cai, o K8s remaneja os Pods daquele nó para outros que tenham espaço. Por isso o cluster se comporta como um único computador lógico, mesmo sendo formado por muitas máquinas."
                    },
                    {
                        "type": "quote",
                        "value": "No cluster você não aponta a máquina de cada container: declara o que precisa rodar e o Kubernetes escolhe o nó. O control plane decide, os worker nodes executam."
                    },
                    {
                        "type": "code",
                        "value": "# Listar os nós do cluster e seus papéis\nkubectl get nodes\n\n# Saída de exemplo:\n# NAME        STATUS   ROLES           AGE   VERSION\n# no-control  Ready    control-plane   10d   v1.30.2\n# no-work-1   Ready    <none>          10d   v1.30.2\n# no-work-2   Ready    <none>          10d   v1.30.2"
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao estudar a estrutura de um cluster, você lê que ele é formado por nós. O que é um nó (node) no Kubernetes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma máquina física ou virtual do cluster",
                                "isCorrect": true
                            },
                            {
                                "text": "Um container em execução dentro da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Um arquivo YAML com a configuração do cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma réplica de Pod criada pelo controlador",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma revisão de conceitos, pedem a definição de cluster no Kubernetes. Qual descreve melhor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um conjunto de nós que atuam como um recurso só",
                                "isCorrect": true
                            },
                            {
                                "text": "Um único container rodando isolado em uma máquina",
                                "isCorrect": false
                            },
                            {
                                "text": "Um arquivo de configuração do control plane do cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma imagem de container pronta para o deploy",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação foi implantada no cluster. Em que tipo de nó os Pods dessa aplicação de fato rodam?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nos worker nodes, que executam as cargas",
                                "isCorrect": true
                            },
                            {
                                "text": "No control plane, que coordena o cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "No etcd, onde fica o estado do cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "No scheduler, que distribui os Pods",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante a análise da arquitetura, alguém pergunta em qual parte ficam as decisões de agendamento e o estado desejado das aplicações. Qual a resposta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No control plane, o cérebro do cluster",
                                "isCorrect": true
                            },
                            {
                                "text": "Nos worker nodes, onde rodam os Pods",
                                "isCorrect": false
                            },
                            {
                                "text": "Na CLI kubectl, instalada na sua máquina",
                                "isCorrect": false
                            },
                            {
                                "text": "No container runtime de cada nó do cluster",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor pergunta em qual servidor ele deve rodar um novo container. Como a ideia de tratar o cluster como um computador só responde a isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Você declara o que rodar e o Kubernetes escolhe o nó",
                                "isCorrect": true
                            },
                            {
                                "text": "Você acessa o servidor por SSH e inicia o container lá",
                                "isCorrect": false
                            },
                            {
                                "text": "Você edita o etcd à mão para fixar o nó do container",
                                "isCorrect": false
                            },
                            {
                                "text": "Você divide a carga entre os nós em uma planilha",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Arquitetura do cluster",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O control plane: quem decide\n\nO control plane reúne os componentes que tomam as decisões do cluster. São quatro peças principais:\n\n- **kube-apiserver**: a porta de entrada do cluster. Toda ordem, sua ou de outro componente, passa por ele via API REST. É o único que fala direto com o etcd.\n- **etcd**: o banco de dados chave-valor que guarda todo o estado do cluster (o que deveria existir e o que existe).\n- **kube-scheduler**: decide em qual nó cada novo Pod vai rodar, olhando recursos e restrições.\n- **kube-controller-manager**: roda os controladores, laços que comparam o estado desejado com o atual e agem para igualar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Componente\",\"Papel no control plane\"],[\"kube-apiserver\",\"Porta de entrada, valida e expõe a API\"],[\"etcd\",\"Guarda o estado do cluster\"],[\"kube-scheduler\",\"Escolhe o nó de cada Pod\"],[\"kube-controller-manager\",\"Roda os laços de reconciliação\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O nó: quem executa\n\nCada worker node roda três componentes que colocam os Pods no ar:\n\n- **kubelet**: o agente do nó. Recebe do API server os Pods que devem rodar ali e garante que os containers estejam de pé.\n- **kube-proxy**: cuida das regras de rede do nó, roteando o tráfego dos Services para os Pods certos.\n- **container runtime**: o software que de fato executa os containers (containerd e CRI-O são os mais comuns; o Docker deixou de ser usado direto).\n\nO control plane também roda esses componentes de nó, já que ele também é um nó do cluster."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Componente\",\"Papel no nó\"],[\"kubelet\",\"Mantém os containers do nó no ar\"],[\"kube-proxy\",\"Roteia a rede dos Services\"],[\"container runtime\",\"Executa os containers\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Decore o fluxo: tudo passa pelo API server, e só ele escreve no etcd. O scheduler escolhe o nó, o controller-manager reconcilia e, no nó, o kubelet põe os containers no ar."
                    },
                    {
                        "type": "code",
                        "value": "# Ver os componentes do control plane rodando como Pods\nkubectl get pods -n kube-system\n\n# NAME                        READY   STATUS    RESTARTS\n# etcd-no-control             1/1     Running   0\n# kube-apiserver-no-control   1/1     Running   0\n# kube-scheduler-no-control   1/1     Running   0\n# kube-controller-manager-x   1/1     Running   0"
                    }
                ],
                "questions": [
                    {
                        "statement": "Um estudo de arquitetura pergunta onde o Kubernetes guarda todo o estado do cluster. Qual componente cumpre esse papel?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "etcd, o banco chave-valor do cluster",
                                "isCorrect": true
                            },
                            {
                                "text": "kube-scheduler, que agenda os Pods do cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "kube-proxy, que cuida da rede",
                                "isCorrect": false
                            },
                            {
                                "text": "kubelet, o agente de cada nó",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um novo Pod foi criado e precisa ir para algum nó. Qual componente do control plane decide em qual nó ele vai rodar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "kube-scheduler",
                                "isCorrect": true
                            },
                            {
                                "text": "kube-apiserver",
                                "isCorrect": false
                            },
                            {
                                "text": "etcd",
                                "isCorrect": false
                            },
                            {
                                "text": "kubelet",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao rodar kubectl apply, sua ordem chega ao cluster. Por qual componente todo comando e toda comunicação interna passam?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "kube-apiserver, a porta de entrada",
                                "isCorrect": true
                            },
                            {
                                "text": "etcd, que persiste o estado do cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "kube-scheduler, que aloca os Pods",
                                "isCorrect": false
                            },
                            {
                                "text": "container runtime, que roda os containers",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um worker node, qual componente recebe do API server a lista de Pods e garante que os containers estejam rodando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "kubelet, o agente do nó",
                                "isCorrect": true
                            },
                            {
                                "text": "kube-proxy, o roteador de rede",
                                "isCorrect": false
                            },
                            {
                                "text": "kube-scheduler, o agendador",
                                "isCorrect": false
                            },
                            {
                                "text": "etcd, o armazenamento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao depurar rede, você descobre que o tráfego de um Service não chega aos Pods. Qual componente do nó é responsável por essas regras de roteamento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "kube-proxy, que roteia os Services",
                                "isCorrect": true
                            },
                            {
                                "text": "container runtime, que roda os containers",
                                "isCorrect": false
                            },
                            {
                                "text": "kubelet, que sobe os containers do nó",
                                "isCorrect": false
                            },
                            {
                                "text": "kube-scheduler, que escolhe o nó do Pod",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "kubectl: falando com o cluster",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## kubectl: o controle remoto do cluster\n\nkubectl é a ferramenta de linha de comando para operar o Kubernetes. Ela não executa nada por conta própria: cada comando vira uma chamada HTTP ao kube-apiserver, que valida, grava no etcd e devolve a resposta.\n\nPara saber com qual cluster falar e como se autenticar, o kubectl lê um arquivo de configuração chamado kubeconfig (por padrão em ~/.kube/config). Sem esse arquivo apontando para um cluster, o kubectl não tem com quem conversar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\",\"Para que serve\"],[\"kubectl get\",\"Lista recursos como pods e nodes\"],[\"kubectl describe\",\"Mostra detalhes e eventos de um recurso\"],[\"kubectl apply\",\"Cria ou atualiza a partir de um YAML\"],[\"kubectl delete\",\"Remove um recurso\"],[\"kubectl logs\",\"Mostra a saída de um container\"],[\"kubectl exec\",\"Roda um comando dentro de um container\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# Listar Pods do namespace atual\nkubectl get pods\n\n# Ver detalhes e eventos de um Pod (ótimo para depurar)\nkubectl describe pod meu-app-123\n\n# Aplicar um manifesto a partir de um arquivo\nkubectl apply -f deployment.yaml\n\n# Ver os logs de um container\nkubectl logs meu-app-123\n\n# Abrir um shell dentro do container\nkubectl exec -it meu-app-123 -- sh"
                    },
                    {
                        "type": "text",
                        "value": "## Contexts e kubeconfig\n\nQuem trabalha com mais de um cluster (dev, homologação, produção) precisa dizer ao kubectl qual usar. Isso vive no kubeconfig, organizado em três listas:\n\n- **clusters**: os endereços dos API servers.\n- **users**: as credenciais de acesso.\n- **contexts**: combinações de cluster, usuário e namespace.\n\nO context ativo define para onde seus comandos vão. Trocar de context é trocar de cluster (ou de namespace) sem reescrever nada."
                    },
                    {
                        "type": "quote",
                        "value": "kubectl nunca age sozinho: traduz cada comando em uma chamada ao API server. O context ativo no kubeconfig decide qual cluster recebe o comando, então confira o context antes de rodar algo em produção."
                    },
                    {
                        "type": "code",
                        "value": "# Ver os contexts disponíveis e qual está ativo\nkubectl config get-contexts\n\n# Trocar para o cluster de produção\nkubectl config use-context producao\n\n# Rodar um comando em outro namespace sem trocar de context\nkubectl get pods -n kube-system"
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao rodar um comando kubectl, com qual componente do cluster a CLI realmente conversa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Com o kube-apiserver, via chamada HTTP",
                                "isCorrect": true
                            },
                            {
                                "text": "Com o etcd, gravando direto no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Com o kubelet de cada nó, um a um",
                                "isCorrect": false
                            },
                            {
                                "text": "Com o container runtime, sem intermediário",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa quer ver rapidamente todos os Pods em execução no namespace atual. Qual comando ela usa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "kubectl get pods",
                                "isCorrect": true
                            },
                            {
                                "text": "kubectl logs pods",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl run pods",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl apply pods",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Pod não sai do estado Pending e a equipe quer ver os eventos que explicam o motivo. Qual comando dá esses detalhes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "kubectl describe pod",
                                "isCorrect": true
                            },
                            {
                                "text": "kubectl get pod -o wide",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl logs pod",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl delete pod",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A aplicação está no ar, mas com erro. A pessoa quer ler o que o container escreveu na saída padrão. Qual comando usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "kubectl logs",
                                "isCorrect": true
                            },
                            {
                                "text": "kubectl describe",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl exec",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl apply",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa tem clusters de dev e de produção no mesmo kubeconfig e quer direcionar os comandos ao de produção. O que ela deve fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar o context com kubectl config use-context",
                                "isCorrect": true
                            },
                            {
                                "text": "Reinstalar o kubectl apontando para produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Editar o etcd de produção pela linha de comando",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar kubectl apply com uma flag de produção",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O modelo declarativo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Objetos e manifests\n\nTudo no Kubernetes é um objeto: Pods, Deployments, Services e por aí vai. Você descreve o objeto que quer em um manifesto YAML e envia ao cluster. Esse manifesto informa o estado desejado, e o Kubernetes trabalha para alcançá-lo.\n\nTodo manifesto tem quatro campos de topo:\n\n- **apiVersion**: a versão da API do objeto.\n- **kind**: o tipo do objeto (Pod, Deployment, Service).\n- **metadata**: identificação, como nome e labels.\n- **spec**: o estado desejado, o que você quer que exista."
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: loja-web\nspec:\n  replicas: 3          # quero 3 réplicas rodando\n  selector:\n    matchLabels:\n      app: loja-web\n  template:\n    metadata:\n      labels:\n        app: loja-web\n    spec:\n      containers:\n        - name: web\n          image: loja-web:1.4"
                    },
                    {
                        "type": "text",
                        "value": "## Estado desejado x estado atual\n\nO coração do Kubernetes é a diferença entre dois estados:\n\n- **Estado desejado (desired state)**: o que você declarou no manifesto (por exemplo, 3 réplicas).\n- **Estado atual (current state)**: o que existe agora no cluster (por exemplo, 2 réplicas no ar).\n\nOs controladores rodam um laço de reconciliação: observam o estado atual, comparam com o desejado e agem para eliminar a diferença. Se uma réplica cai, o laço percebe que há 2 onde deveriam existir 3 e cria outra. A auto-recuperação é consequência direta desse laço."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Declarativo\",\"Imperativo\"],[\"Você informa\",\"O resultado desejado\",\"Os passos a executar\"],[\"Comando típico\",\"kubectl apply -f\",\"kubectl run, kubectl scale\"],[\"Fonte da verdade\",\"O manifesto YAML\",\"O comando digitado\"],[\"Combina com Git\",\"Sim, versiona o YAML\",\"Menos, é ação pontual\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "No modelo declarativo você diz o QUE quer (o estado desejado), não o COMO. Os controladores, em laço de reconciliação, fazem o estado atual convergir para o desejado e o mantêm assim."
                    },
                    {
                        "type": "code",
                        "value": "# Declarativo: descreve o alvo em um arquivo e aplica\nkubectl apply -f deployment.yaml\n\n# Imperativo: dá a ordem direto, sem arquivo\nkubectl scale deployment/loja-web --replicas=3\n\n# O apply pode rodar de novo: se nada mudou, nada acontece"
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao escrever um manifesto YAML e aplicá-lo, o que exatamente você está informando ao Kubernetes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O estado desejado do objeto no cluster",
                                "isCorrect": true
                            },
                            {
                                "text": "O passo a passo para o container subir",
                                "isCorrect": false
                            },
                            {
                                "text": "O log de execução da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "O endereço IP fixo de cada Pod",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O comando kubectl apply -f deployment.yaml representa qual abordagem de trabalho?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Declarativa: você descreve o resultado desejado",
                                "isCorrect": true
                            },
                            {
                                "text": "Imperativa: você dá os passos um a um",
                                "isCorrect": false
                            },
                            {
                                "text": "Interativa: você confirma cada ação no terminal",
                                "isCorrect": false
                            },
                            {
                                "text": "Manual: você edita o etcd diretamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O laço em que um controlador observa o estado atual, compara com o desejado e age para igualar os dois tem qual nome?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reconciliação",
                                "isCorrect": true
                            },
                            {
                                "text": "Balanceamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Escalonamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Roteamento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Deployment está com replicas: 3. Um Pod morre e, segundos depois, o cluster cria outro no lugar sem ninguém agir. O que explica isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O controlador reconcilia o atual com o desejado",
                                "isCorrect": true
                            },
                            {
                                "text": "O kubectl detecta a falha e reenvia o manifesto",
                                "isCorrect": false
                            },
                            {
                                "text": "O usuário roda apply de novo a cada falha do Pod",
                                "isCorrect": false
                            },
                            {
                                "text": "O etcd recria o Pod ao notar a diferença",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer versionar a infraestrutura no Git e aplicar sempre o mesmo arquivo, sem depender de comandos digitados na hora. Qual abordagem combina com isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Declarativa, com manifests aplicados por apply",
                                "isCorrect": true
                            },
                            {
                                "text": "Imperativa, com kubectl run a cada mudança",
                                "isCorrect": false
                            },
                            {
                                "text": "Manual, editando os objetos direto no etcd",
                                "isCorrect": false
                            },
                            {
                                "text": "Interativa, confirmando cada Pod criado no terminal",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Pods e workloads",
        "aulas": [
            {
                "titulo": "O Pod: a menor unidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um Pod\nNo Kubernetes, você não implanta um container isolado: você implanta um Pod. O Pod é a menor unidade que o cluster cria, agenda e gerencia. Ele representa uma instância de uma aplicação em execução e envolve um ou mais containers que precisam rodar juntos.\n\nCada Pod recebe do cluster um contexto próprio: um endereço de rede, espaço de armazenamento e a definição de como os containers devem rodar. Quando o Kubernetes agenda um Pod, ele escolhe um nó e sobe todos os containers daquele Pod ali, no mesmo lugar."
                    },
                    {
                        "type": "text",
                        "value": "## Um ou mais containers\nA maioria dos Pods tem um único container, e pensar em um Pod, um container é um bom ponto de partida. Mas o Pod existe justamente para permitir mais de um container quando eles são fortemente acoplados e precisam compartilhar recursos.\n\nContainers no mesmo Pod são sempre agendados no mesmo nó e sobem e descem como um conjunto. Eles não ficam espalhados pelo cluster: vivem lado a lado."
                    },
                    {
                        "type": "text",
                        "value": "## Rede e volumes compartilhados\nOs containers de um Pod dividem o mesmo namespace de rede. Na prática isso significa:\n- Todos enxergam o mesmo endereço IP, o IP do Pod.\n- Conversam entre si por localhost, sem passar pela rede externa.\n- Precisam combinar as portas, pois disputam o mesmo espaço de portas.\n\nAlém da rede, o Pod pode declarar volumes disponíveis para vários containers ao mesmo tempo, permitindo que um escreva um arquivo e outro leia."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Recurso\", \"Como se comporta dentro do Pod\"], [\"Endereço IP\", \"Um IP por Pod, compartilhado por todos os containers\"], [\"Comunicação interna\", \"Containers falam entre si por localhost\"], [\"Portas\", \"Espaço de portas único, sem repetição entre containers\"], [\"Volumes\", \"Podem ser montados em mais de um container do Pod\"], [\"Agendamento\", \"Todos os containers vão para o mesmo nó\"]]"
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: web\nspec:\n  containers:\n    - name: app\n      image: nginx:1.27\n      ports:\n        - containerPort: 80"
                    },
                    {
                        "type": "quote",
                        "value": "O Pod, e não o container solto, é a menor unidade que o Kubernetes cria, agenda e escala."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um colega afirma que, no Kubernetes, a menor unidade que você cria e agenda é o container isolado. Qual é a correção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A menor unidade é o Pod, que envolve um ou mais containers.",
                                "isCorrect": true
                            },
                            {
                                "text": "O container é a menor unidade, e o Pod é apenas opcional.",
                                "isCorrect": false
                            },
                            {
                                "text": "A menor unidade é o nó, que executa os containers direto.",
                                "isCorrect": false
                            },
                            {
                                "text": "A menor unidade é o Deployment, montado a partir de imagens.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois containers rodam no mesmo Pod e um precisa chamar o outro. Qual endereço ele deve usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "localhost, pois os containers do Pod dividem o mesmo IP.",
                                "isCorrect": true
                            },
                            {
                                "text": "O IP do nó onde o Pod acabou sendo agendado pelo cluster.",
                                "isCorrect": false
                            },
                            {
                                "text": "O IP público exposto pelo balanceador de carga do cluster.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um IP distinto atribuído a cada container dentro do Pod.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o Kubernetes usa o Pod, e não o container avulso, como unidade básica de agendamento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Para juntar containers acoplados que dividem rede e volume.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque um container sozinho não pode receber um endereço IP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Pod dispensa o uso de um runtime de containers.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque agendar por container exigiria sempre mais de um nó.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um Pod com dois containers, um gera arquivos que o outro precisa ler. Qual recurso do Pod resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um volume do Pod montado nos dois containers.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um IP exclusivo atribuído a cada container do Pod.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um Service ligando um container ao outro por rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma cópia da imagem compartilhada entre os containers.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você adiciona um segundo container a um Pod e ele falha porque a porta 8080 já está em uso. Qual é a explicação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Os containers do Pod dividem o mesmo espaço de portas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada container do Pod recebe o seu próprio espaço de portas isolado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A porta 8080 fica reservada pelo Kubernetes para tarefas internas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um segundo container só sobe se declarar um volume compartilhado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ciclo de vida do Pod",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## As fases de um Pod\nTodo Pod tem um campo status.phase que resume, em uma palavra, o momento do seu ciclo de vida. A fase é um retrato de alto nível: ela não descreve cada container em detalhe, mas indica se o Pod ainda está sendo preparado, se está no ar, se concluiu o trabalho ou se falhou.\n\nEntender essas fases é essencial para ler a saída de kubectl get pods e diagnosticar um Pod que não sobe."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fase\", \"Significado\"], [\"Pending\", \"Pod aceito pelo cluster, mas ainda sem todos os containers rodando (agendamento, download de imagem)\"], [\"Running\", \"Pod agendado em um nó e com pelo menos um container em execução\"], [\"Succeeded\", \"Todos os containers terminaram com sucesso e não serão reiniciados\"], [\"Failed\", \"Todos os containers pararam e pelo menos um terminou em erro\"], [\"Unknown\", \"O estado do Pod não pôde ser obtido, em geral por falha de comunicação com o nó\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## restartPolicy: quando reiniciar\nO campo spec.restartPolicy define o que o kubelet faz quando um container do Pod termina. Ele vale para todos os containers do Pod e aceita três valores:\n- Always: reinicia o container a cada saída, qualquer que seja o código. É o padrão e combina com serviços que devem ficar no ar.\n- OnFailure: reinicia apenas quando o container termina em erro.\n- Never: nunca reinicia, deixando o Pod seguir para Succeeded ou Failed.\n\nCargas que rodam até terminar, como um Job, costumam usar OnFailure ou Never."
                    },
                    {
                        "type": "table",
                        "value": "[[\"restartPolicy\", \"Reinicia quando\", \"Uso típico\"], [\"Always\", \"Sempre, em qualquer saída\", \"Serviços de longa duração (padrão)\"], [\"OnFailure\", \"Somente em caso de erro\", \"Tarefas em lote que devem concluir\"], [\"Never\", \"Nunca\", \"Execução única, sem repetição\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Pods são efêmeros\nUm Pod é descartável. Ele não se cura sozinho: se o nó em que roda cai, o Pod some junto e não é recriado em outro lugar por conta própria. Quando um Pod é recriado, ele ganha um novo nome e um novo IP, ou seja, você não deve depender do IP nem tratar um Pod como algo permanente.\n\nPor isso, em produção quase nunca se cria um Pod diretamente. Você declara um controller (como um Deployment) que mantém o número desejado de Pods, recria os que falham e permite escalar e atualizar sem downtime. O Pod continua sendo a unidade, mas quem cuida dele é o controller."
                    },
                    {
                        "type": "quote",
                        "value": "Pods são efêmeros: em produção você declara um controller que os recria, em vez de criar Pods soltos que ninguém reergue."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você roda kubectl get pods e o Pod aparece como Pending há alguns segundos. O que isso indica?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O Pod foi aceito, mas ainda não subiu os containers.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Pod concluiu o trabalho e não será mais reiniciado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Pod está no ar com todos os containers já prontos.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Pod falhou e precisa ser recriado agora manualmente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Pod executou uma tarefa e todos os seus containers terminaram sem erro. Qual fase o Pod assume?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Succeeded, pois terminou bem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Failed, porque terminou em erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Running, porque ainda está no ar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Unknown, porque o estado se perdeu.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço web deve voltar ao ar sempre que o processo cair, não importa o motivo. Qual restartPolicy usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Always, que reinicia o container a cada saída.",
                                "isCorrect": true
                            },
                            {
                                "text": "OnFailure, que reinicia apenas quando há erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "OnSuccess, que reinicia somente quando conclui bem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Never, que nunca reinicia o container do Pod.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação guardou o IP de um Pod para chamá-lo depois. Após o Pod ser recriado, a chamada falha. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pods são efêmeros: ao recriar, ganham um novo IP.",
                                "isCorrect": true
                            },
                            {
                                "text": "O IP do Pod só muda se o nó também for trocado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O IP do Pod é fixo, então o erro está na aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pods recriados mantêm o IP, mas trocam de porta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Pod criado direto, sem controller, estava em um nó que falhou por completo. O que acontece com esse Pod?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ele é perdido e não sobe em outro nó sozinho.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele é movido automaticamente para um nó saudável do cluster.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele fica em Pending até o nó original voltar a funcionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele reinicia no mesmo nó assim que o kubelet permitir.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Múltiplos containers no Pod",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Mais de um container, de propósito\nColocar vários containers em um mesmo Pod não é para juntar aplicações diferentes: é para juntar um container principal com containers de apoio que trabalham a favor dele. Como todos dividem rede e volumes e sobem no mesmo nó, eles cooperam de perto.\n\nDois padrões aparecem o tempo todo nesse cenário: os init containers, que preparam o terreno antes, e os sidecars, que acompanham a aplicação enquanto ela roda."
                    },
                    {
                        "type": "text",
                        "value": "## Init containers\nInit containers rodam antes dos containers de aplicação e precisam terminar com sucesso para o Pod seguir. Quando há mais de um, eles rodam em sequência, um de cada vez, na ordem declarada. Se um init falha, o kubelet o reinicia conforme o restartPolicy e o Pod não avança.\n\nSão úteis para tarefas de preparação: esperar um serviço dependente ficar pronto, aplicar migrações de banco, baixar um arquivo de configuração ou ajustar permissões de um volume."
                    },
                    {
                        "type": "text",
                        "value": "## Sidecar\nO sidecar é um container que roda junto com o principal durante toda a vida do Pod, oferecendo uma função de apoio. Exemplos comuns são um coletor de logs, um proxy de service mesh ou um agente que sincroniza arquivos.\n\nDiferente do init, o sidecar não termina antes: ele convive com a aplicação. Versões recentes do Kubernetes oferecem suporte nativo a sidecars, declarados como um init container com restartPolicy Always, o que garante que ele suba antes e continue rodando."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Init container\", \"Sidecar\"], [\"Quando roda\", \"Antes dos containers de app\", \"Junto com o container de app\"], [\"Ordem\", \"Em sequência, um após o outro\", \"Em paralelo ao principal\"], [\"Término\", \"Termina antes do app iniciar\", \"Vive enquanto o Pod existir\"], [\"Uso típico\", \"Preparar o ambiente\", \"Apoio contínuo (logs, proxy)\"]]"
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: app\nspec:\n  initContainers:\n    - name: espera-db\n      image: busybox:1.36\n      command: [\"sh\", \"-c\", \"until nc -z db 5432; do sleep 1; done\"]\n  containers:\n    - name: app\n      image: minha-api:1.0\n    - name: log-agent\n      image: fluent-bit:3.0"
                    },
                    {
                        "type": "quote",
                        "value": "Init containers rodam até concluir, em ordem, antes da aplicação; sidecars sobem junto e acompanham o Pod enquanto ele viver."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação só pode subir depois que uma migração de banco rodar. Qual recurso do Pod garante essa ordem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um init container, que conclui antes do app.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um sidecar, que roda ao lado do app o tempo todo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um Service que expõe o banco de dados ao app.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um volume montado nos dois containers do Pod.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um container coleta os logs da aplicação e roda o tempo todo ao lado dela, no mesmo Pod. Que padrão é esse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Sidecar",
                                "isCorrect": true
                            },
                            {
                                "text": "Init container",
                                "isCorrect": false
                            },
                            {
                                "text": "Job",
                                "isCorrect": false
                            },
                            {
                                "text": "DaemonSet",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Pod tem três init containers declarados. Como o Kubernetes os executa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Em sequência, na ordem declarada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Todos em paralelo, ao mesmo tempo, sem ordem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em ordem aleatória, até que todos concluam.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o primeiro deles, ignorando o resto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um init container baixa um arquivo de config que o container de app precisa ler depois. Como o arquivo chega até o app?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Por um volume do Pod montado nos dois containers.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pelo IP externo que o init expõe ao container de app.",
                                "isCorrect": false
                            },
                            {
                                "text": "Por uma cópia automática feita entre as imagens.",
                                "isCorrect": false
                            },
                            {
                                "text": "Por um Service que liga o init ao container de app.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time quer rodar frontend e backend, que escalam de forma independente, no mesmo Pod como dois containers. Por que é má ideia?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Containers de um Pod escalam juntos, sem independência.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um Pod só pode conter um único container de aplicação por vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Frontend e backend precisam obrigatoriamente de Pods iguais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Containers no mesmo Pod não conseguem dividir um volume.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Labels, selectors e annotations",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Labels: organizar com chave e valor\nLabels são pares chave/valor que você anexa a objetos do Kubernetes para organizá-los. Exemplos: app=api, env=prod, tier=backend. Elas não mudam o comportamento do objeto por si só, mas dão a ele identidade e categorias que você e o cluster usam para agrupar recursos.\n\nUm mesmo objeto pode ter várias labels, e é comum combiná-las para representar aplicação, ambiente, versão e camada ao mesmo tempo."
                    },
                    {
                        "type": "text",
                        "value": "## Selectors e quem usa as labels\nUm selector é uma consulta sobre labels: quero os objetos com app=api e env=prod, sem citar nomes. Ele pode ser baseado em igualdade (app=api, env!=dev) ou em conjunto (env in (prod, staging)).\n\nLabels são a cola do Kubernetes. Um Deployment não conhece seus Pods pelo nome: ele guarda um selector e gerencia todos os Pods que casam com ele. Um Service faz o mesmo para decidir a quais Pods enviar tráfego. Se as labels do Pod não casam com o selector, o controller não o gerencia e o Service não entrega tráfego a ele."
                    },
                    {
                        "type": "code",
                        "value": "# Pod com labels\napiVersion: v1\nkind: Pod\nmetadata:\n  name: api\n  labels:\n    app: api\n    env: prod\n---\n# Service que seleciona por label\napiVersion: v1\nkind: Service\nmetadata:\n  name: api\nspec:\n  selector:\n    app: api\n  ports:\n    - port: 80\n\n# Filtrar na linha de comando:\n# kubectl get pods -l app=api,env=prod"
                    },
                    {
                        "type": "text",
                        "value": "## Annotations: metadados que não selecionam\nAnnotations também são pares chave/valor, mas guardam metadados não identificadores: informação para pessoas e ferramentas, não para seleção. Exemplos: uma descrição, um e-mail de contato do time, a configuração de um Ingress ou dados que uma ferramenta de automação lê.\n\nVocê não usa annotations em selectors. Elas podem guardar valores maiores e mais estruturados que as labels, que são curtas e voltadas à filtragem."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"Labels\", \"Annotations\"], [\"Objetivo\", \"Identificar e agrupar\", \"Anexar metadado extra\"], [\"Usada em selectors\", \"Sim\", \"Não\"], [\"Conteúdo\", \"Curto, voltado à filtragem\", \"Pode ser maior e estruturado\"], [\"Exemplo\", \"app=api, env=prod\", \"descrição, contato, config de ferramenta\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Controllers e Services encontram seus Pods pelo selector de labels, nunca pelo nome; annotations guardam metadado, mas não selecionam nada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você quer marcar Pods como pertencentes à aplicação de pagamentos e ao ambiente de produção. Que recurso usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Labels, como app=pagamentos e env=prod.",
                                "isCorrect": true
                            },
                            {
                                "text": "Annotations, como app=pagamentos e env=prod.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do Pod, juntando app e ambiente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um namespace por combinação de app e ambiente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Service precisa entregar tráfego a um grupo de Pods. Como ele descobre quais Pods atender?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Por um selector de labels que casa com as dos Pods.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pelo nome de cada Pod listado na configuração do Service.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pelo IP fixo que cada Pod informa ao Service ao subir.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pela ordem de criação dos Pods dentro do namespace.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time quer guardar no objeto um e-mail de contato e uma descrição, sem usar isso para seleção. O que usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Annotations, para metadados não identificadores.",
                                "isCorrect": true
                            },
                            {
                                "text": "Labels, porque todo metadado do objeto precisa virar label.",
                                "isCorrect": false
                            },
                            {
                                "text": "Selectors, que existem para armazenar contatos e descrições.",
                                "isCorrect": false
                            },
                            {
                                "text": "O campo de nome do objeto, separando os dados por vírgula.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Deployment tem selector app=web, mas os Pods têm a label app=frontend. Qual o efeito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Deployment não reconhece esses Pods como seus.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Deployment corrige a label desses Pods sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os Pods passam a ter as duas labels ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Service assume o controle desses Pods no lugar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa listar, em um único comando, os Pods cujo ambiente seja prod ou staging. Qual selector expressa isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "env in (prod, staging), um selector baseado em conjunto.",
                                "isCorrect": true
                            },
                            {
                                "text": "env!=dev, que retorna qualquer ambiente diferente de dev.",
                                "isCorrect": false
                            },
                            {
                                "text": "env=prod,staging, repetindo o valor na igualdade.",
                                "isCorrect": false
                            },
                            {
                                "text": "app=env, associando a label ao ambiente desejado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Namespaces",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um Namespace\nUm Namespace é uma divisão lógica dentro de um mesmo cluster. Ele agrupa recursos e cria uma fronteira organizacional: em vez de deixar tudo junto, você separa objetos (Pods, Services, Deployments) em espaços com nome próprio.\n\nTodo cluster já vem com alguns, como default (onde os recursos caem se você não escolher outro) e kube-system (componentes internos). Dentro de um namespace, o nome de um recurso é único por tipo: você pode ter um Service chamado api em dev e outro api em prod, sem conflito, porque vivem em espaços separados."
                    },
                    {
                        "type": "text",
                        "value": "## Quando usar\nNamespaces fazem sentido quando um cluster é compartilhado e você precisa separar contextos. Casos típicos:\n- Times diferentes no mesmo cluster, cada um no seu namespace.\n- Ambientes como dev, staging e prod convivendo lado a lado.\n- Aplicar RBAC, cotas e limites por grupo de recursos.\n\nNão use namespace para separar versões da mesma aplicação: isso é papel das labels. E vale lembrar que nem todo recurso é namespaced, como mostra a tabela a seguir."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Escopo\", \"Exemplos de recursos\"], [\"Com namespace\", \"Pods, Services, Deployments, ConfigMaps, Secrets\"], [\"Sem namespace (cluster)\", \"Nodes, PersistentVolumes, StorageClass, Namespaces\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Cotas e limites por namespace\nO namespace é também o ponto onde você controla consumo. Com um ResourceQuota você limita o total que aquele namespace pode usar: soma de CPU e memória ou quantidade de objetos. Com um LimitRange você define valores padrão, mínimos e máximos por Pod ou container dentro dele.\n\nAssim um time não consome o cluster inteiro e cada ambiente fica no seu orçamento. Fica o alerta de prova: namespace separa e organiza, mas não é isolamento de rede por si só. O tráfego entre namespaces continua liberado até você aplicar uma NetworkPolicy."
                    },
                    {
                        "type": "code",
                        "value": "# Criar um namespace e rodar algo nele\nkubectl create namespace time-a\nkubectl get pods -n time-a\n\n# Limitar o consumo do namespace\napiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: cota-time-a\n  namespace: time-a\nspec:\n  hard:\n    requests.cpu: \"4\"\n    requests.memory: 8Gi\n    pods: \"20\""
                    },
                    {
                        "type": "quote",
                        "value": "Namespaces dividem o cluster em espaços lógicos com nomes próprios e cotas, mas não criam, sozinhos, isolamento de rede entre os recursos."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um cluster é usado por vários times e você quer separar logicamente os recursos de cada um. Que recurso usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Namespaces, um para cada time.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um cluster novo separado para cada time.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma label env diferente por time nos Pods.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um nó dedicado exclusivo para cada time.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você tenta criar dois Services chamados api no mesmo namespace e recebe erro. Em namespaces diferentes funciona. Por quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O nome é único por tipo dentro de um namespace.",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome precisa ser único em todo o cluster de uma vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Services não podem repetir nome nem entre namespaces.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome só pode repetir se as labels forem iguais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao organizar recursos, você percebe que um deles não pertence a nenhum namespace. Qual é um exemplo desse tipo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Node, que é um recurso do cluster inteiro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pod, que sempre roda dentro de um namespace.",
                                "isCorrect": false
                            },
                            {
                                "text": "Service, que vive dentro de um namespace.",
                                "isCorrect": false
                            },
                            {
                                "text": "ConfigMap, que pertence a um namespace.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time vem consumindo CPU e memória demais e afetando os outros no cluster. O que limita esse consumo por namespace?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ResourceQuota, que limita o total do namespace.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um Service que passa a controlar o tráfego do time.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma label aplicada para reduzir o uso de CPU dos Pods.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um selector que barra os Pods acima de um limite.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time assume que Pods em namespaces diferentes não conseguem se comunicar pela rede. Está correto?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não, sem NetworkPolicy o tráfego entre eles é liberado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, cada namespace roda em uma rede totalmente isolada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, o Kubernetes bloqueia toda a rede entre namespaces.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, mas apenas quando os Pods têm a mesma label.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Controladores e escala",
        "aulas": [
            {
                "titulo": "ReplicaSet",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um ReplicaSet\n\nO ReplicaSet é o controlador que garante que um número definido de réplicas de um Pod esteja rodando a qualquer momento. Você declara quantas cópias quer no campo `replicas`, e o controlador trabalha para manter esse número.\n\nSe um Pod cai (nó reiniciado, processo travado, alguém deletou o Pod na mão), o ReplicaSet compara o estado desejado com o real e cria um Pod novo para repor. Se sobrar Pod além da conta, ele remove o excedente. Esse ciclo de reconciliação é a base da auto-recuperação no Kubernetes."
                    },
                    {
                        "type": "text",
                        "value": "## O selector que liga o ReplicaSet aos Pods\n\nO ReplicaSet não guarda uma lista fixa de Pods. Ele usa o campo `selector` para descobrir, por labels, quais Pods são seus. Todo Pod cujas labels batem com o selector conta como réplica daquele ReplicaSet.\n\nPor isso duas regras importam:\n\n- O `selector.matchLabels` precisa casar com as labels de `template.metadata.labels`. Se não casarem, a criação é rejeitada.\n- Um Pod avulso com as mesmas labels pode ser adotado pelo ReplicaSet, mesmo que você não tenha criado ele por ali. O vínculo real fica gravado no `ownerReferences` de cada Pod."
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: apps/v1\nkind: ReplicaSet\nmetadata:\n  name: web\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n        - name: web\n          image: nginx:1.27"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Objeto\",\"Mantém N réplicas?\",\"Faz rollout e rollback?\"],[\"Pod avulso\",\"Não\",\"Não\"],[\"ReplicaSet\",\"Sim\",\"Não\"],[\"Deployment\",\"Sim, via ReplicaSet\",\"Sim\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que você raramente cria um ReplicaSet direto\n\nNa prática, quase ninguém escreve um ReplicaSet à mão. O motivo é simples: ele sabe manter réplicas, mas não sabe atualizar versão de forma controlada. Trocar a imagem do `template` não dispara uma transição suave entre a versão antiga e a nova.\n\nQuem resolve isso é o Deployment, que cria e gerencia ReplicaSets por baixo dos panos e ainda entrega rollout e rollback. Você declara o Deployment e deixa que ele cuide dos ReplicaSets. Criar ReplicaSet direto fica reservado a casos raros ou a fins didáticos."
                    },
                    {
                        "type": "quote",
                        "value": "O ReplicaSet reconcilia o número de réplicas por label selector, mas não faz rollout. Para atualizar versão com histórico, use um Deployment."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um ReplicaSet está com `replicas: 3` e você deleta na mão um dos três Pods. O que o controlador faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cria um novo Pod para voltar a ter três réplicas",
                                "isCorrect": true
                            },
                            {
                                "text": "Mantém dois Pods, pois respeita a remoção manual",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduz o campo replicas para 2 e para de reconciliar",
                                "isCorrect": false
                            },
                            {
                                "text": "Marca o ReplicaSet como falho e exige intervenção manual",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao aplicar um ReplicaSet, o `selector.matchLabels` define `app: api`, mas o `template` traz as labels `app: web`. Qual o resultado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A criação falha porque selector e template não casam",
                                "isCorrect": true
                            },
                            {
                                "text": "O ReplicaSet sobe e passa a gerenciar Pods com label web",
                                "isCorrect": false
                            },
                            {
                                "text": "O ReplicaSet sobe, mas sem gerenciar nenhum Pod",
                                "isCorrect": false
                            },
                            {
                                "text": "O Kubernetes ajusta as labels do template para api",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sua equipe precisa atualizar a imagem de uma aplicação com histórico e opção de rollback. Por que preferir um Deployment em vez de um ReplicaSet direto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Deployment gerencia ReplicaSets e traz rollout e rollback",
                                "isCorrect": true
                            },
                            {
                                "text": "O ReplicaSet não consegue manter mais de uma réplica de Pod no ar",
                                "isCorrect": false
                            },
                            {
                                "text": "O ReplicaSet não usa selector para encontrar seus Pods",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o Deployment pode definir um template de Pod",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No manifesto de um ReplicaSet, qual campo define quais Pods pertencem a ele?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O `selector`, que casa com as labels dos Pods",
                                "isCorrect": true
                            },
                            {
                                "text": "O campo `replicas`, que lista os nomes dos Pods",
                                "isCorrect": false
                            },
                            {
                                "text": "O `ownerReferences` definido na mão no spec",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome em `metadata.name` do ReplicaSet",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Existe um Pod avulso com a label `app: web` e sem dono. Você cria um ReplicaSet com selector `app: web` e `replicas: 3`. O que tende a acontecer com esse Pod?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Pode ser adotado pelo ReplicaSet como uma das réplicas",
                                "isCorrect": true
                            },
                            {
                                "text": "É deletado na hora por não ter sido criado pelo ReplicaSet",
                                "isCorrect": false
                            },
                            {
                                "text": "Fica intocado, pois Pod avulso nunca entra em um ReplicaSet",
                                "isCorrect": false
                            },
                            {
                                "text": "Gera erro de conflito e impede a criação do ReplicaSet",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Deployment",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O controlador do dia a dia\n\nO Deployment é o objeto que você mais usa para rodar aplicações sem estado no Kubernetes. Você descreve o estado desejado (imagem, número de réplicas, labels) e ele se encarrega de chegar lá e manter.\n\nPor baixo, o Deployment não mexe em Pods diretamente: ele cria e controla ReplicaSets. Cada versão do `template` do Pod dá origem a um ReplicaSet, e o Deployment coordena esses ReplicaSets ao longo do tempo, principalmente durante as atualizações."
                    },
                    {
                        "type": "text",
                        "value": "## Rollout de uma nova versão\n\nQuando você muda algo no `template` do Pod (trocar a imagem, por exemplo), o Deployment inicia um rollout: cria um ReplicaSet novo para a versão atualizada e vai transferindo réplicas do ReplicaSet antigo para o novo, aos poucos.\n\nComandos comuns nesse fluxo:\n\n- `kubectl set image deployment/web web=nginx:1.27` dispara a troca de imagem.\n- `kubectl rollout status deployment/web` acompanha o progresso.\n- `kubectl rollout pause` e `kubectl rollout resume` seguram e retomam o processo.\n\nVale a regra: só mudança no template gera uma nova revisão. Alterar apenas o número de réplicas escala a aplicação, mas não cria revisão."
                    },
                    {
                        "type": "text",
                        "value": "## Histórico e rollback\n\nO Deployment mantém um histórico de revisões, cada uma associada a um ReplicaSet antigo que fica guardado (escalado a zero). É isso que permite voltar atrás quando uma versão sai com defeito.\n\n- `kubectl rollout history deployment/web` lista as revisões.\n- `kubectl rollout undo deployment/web` volta para a revisão anterior.\n- `kubectl rollout undo deployment/web --to-revision=2` volta para uma revisão específica.\n\nQuantas revisões ficam guardadas depende de `revisionHistoryLimit` (padrão 10). A coluna CHANGE-CAUSE do histórico vem da anotação `kubernetes.io/change-cause`, quando você a define."
                    },
                    {
                        "type": "code",
                        "value": "# Atualiza a imagem e registra a causa da mudança\nkubectl set image deployment/web web=nginx:1.27\nkubectl annotate deployment/web kubernetes.io/change-cause=\"sobe para nginx 1.27\"\n\n# Acompanha, revisa e, se preciso, volta atrás\nkubectl rollout status deployment/web\nkubectl rollout history deployment/web\nkubectl rollout undo deployment/web --to-revision=1"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\",\"Para que serve\"],[\"kubectl rollout status\",\"Acompanha o progresso do rollout\"],[\"kubectl rollout history\",\"Lista as revisões guardadas\"],[\"kubectl rollout undo\",\"Volta para a revisão anterior\"],[\"kubectl rollout undo --to-revision=N\",\"Volta para uma revisão específica\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Mudar o template do Pod gera uma nova revisão e um novo ReplicaSet. Mudar só o número de réplicas escala a aplicação, mas não cria revisão."
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao criar um Deployment, qual objeto ele cria e gerencia por baixo dos panos para rodar os Pods?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "ReplicaSet",
                                "isCorrect": true
                            },
                            {
                                "text": "Outro Deployment aninhado",
                                "isCorrect": false
                            },
                            {
                                "text": "DaemonSet",
                                "isCorrect": false
                            },
                            {
                                "text": "StatefulSet",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma nova versão subiu com bug em produção. Qual comando volta o Deployment para a revisão imediatamente anterior?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "kubectl rollout undo deployment/web",
                                "isCorrect": true
                            },
                            {
                                "text": "kubectl rollout status deployment/web",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl delete deployment/web e recriar",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl scale deployment/web --replicas=0",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você aumenta `replicas` de 3 para 5 em um Deployment, sem mexer na imagem. O que acontece com o histórico de revisões?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nada, pois escalar não gera nova revisão",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma nova revisão é criada para o novo número de réplicas",
                                "isCorrect": false
                            },
                            {
                                "text": "O histórico é zerado e recomeça do começo",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma revisão nova é criada e o rollout reinicia",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando lista as revisões guardadas de um Deployment para você escolher uma para rollback?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "kubectl rollout history deployment/web",
                                "isCorrect": true
                            },
                            {
                                "text": "kubectl get pods --show-labels --all-namespaces",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl describe replicaset web",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl rollout pause deployment/web",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de vários rollouts, você percebe vários ReplicaSets antigos escalados a zero. O que controla quantos deles o Deployment mantém guardados?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O campo `revisionHistoryLimit` do Deployment",
                                "isCorrect": true
                            },
                            {
                                "text": "O campo `replicas` de cada ReplicaSet antigo",
                                "isCorrect": false
                            },
                            {
                                "text": "A anotação `kubernetes.io/change-cause`",
                                "isCorrect": false
                            },
                            {
                                "text": "O parâmetro `maxSurge` da estratégia de rollout",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Estratégias de atualização",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Como o Deployment troca de versão\n\nQuando um Deployment atualiza os Pods, ele segue uma estratégia definida em `spec.strategy.type`. São duas opções: `RollingUpdate` (o padrão) e `Recreate`. A escolha muda diretamente se a aplicação fica ou não indisponível durante a troca.\n\nA ideia central: RollingUpdate substitui Pods aos poucos e mantém a aplicação no ar, enquanto Recreate derruba tudo antes de subir a versão nova, aceitando um intervalo de indisponibilidade."
                    },
                    {
                        "type": "text",
                        "value": "## RollingUpdate: maxSurge e maxUnavailable\n\nNo RollingUpdate, dois parâmetros controlam o ritmo da troca:\n\n- `maxSurge`: quantos Pods a mais do que o desejado podem existir durante o rollout. Aceita número ou porcentagem (padrão 25%). Quanto maior, mais rápido, ao custo de mais recursos temporários.\n- `maxUnavailable`: quantos Pods podem ficar indisponíveis ao mesmo tempo durante a troca. Também aceita número ou porcentagem (padrão 25%).\n\nOs dois não podem ser 0 ao mesmo tempo, senão o rollout não teria como avançar. Em porcentagem, maxSurge arredonda para cima e maxUnavailable arredonda para baixo."
                    },
                    {
                        "type": "text",
                        "value": "## Recreate: derruba tudo e sobe de novo\n\nNa estratégia Recreate, o Deployment encerra todos os Pods da versão atual antes de criar os da versão nova. Existe uma janela em que nenhum Pod está no ar, ou seja, downtime.\n\nEla faz sentido quando duas versões não podem rodar ao mesmo tempo. Exemplos: uma migração de banco incompatível entre as versões, ou um processo que trava um recurso exclusivo e não tolera dois donos ao mesmo tempo. Fora esses casos, RollingUpdate costuma ser a melhor escolha."
                    },
                    {
                        "type": "code",
                        "value": "spec:\n  strategy:\n    type: RollingUpdate      # padrão; troca Pods aos poucos\n    rollingUpdate:\n      maxSurge: 1            # 1 Pod extra durante a troca\n      maxUnavailable: 0     # nunca fica abaixo do total desejado"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia\",\"Downtime\",\"Duas versões juntas?\",\"Quando usar\"],[\"RollingUpdate\",\"Sem downtime\",\"Sim, por instantes\",\"Caso geral\"],[\"Recreate\",\"Tem downtime\",\"Não\",\"Versões incompatíveis\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "RollingUpdate mantém a aplicação no ar trocando Pods aos poucos (maxSurge e maxUnavailable). Recreate aceita downtime para nunca ter duas versões juntas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você cria um Deployment sem definir `spec.strategy`. Qual estratégia de atualização entra em ação por padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "RollingUpdate, que troca os Pods aos poucos",
                                "isCorrect": true
                            },
                            {
                                "text": "Recreate, que derruba todos os Pods antes de subir",
                                "isCorrect": false
                            },
                            {
                                "text": "Canary, dividindo o tráfego entre versões",
                                "isCorrect": false
                            },
                            {
                                "text": "Blue-green, com dois ambientes paralelos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sua aplicação não pode ter a versão antiga e a nova rodando juntas, porque disputam um recurso exclusivo. Qual estratégia atende melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Recreate, mesmo com um intervalo de downtime",
                                "isCorrect": true
                            },
                            {
                                "text": "RollingUpdate com maxSurge alto",
                                "isCorrect": false
                            },
                            {
                                "text": "RollingUpdate com maxUnavailable 0",
                                "isCorrect": false
                            },
                            {
                                "text": "RollingUpdate com maxSurge e maxUnavailable padrão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um RollingUpdate, o que o parâmetro `maxUnavailable` define?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quantos Pods podem ficar indisponíveis na troca",
                                "isCorrect": true
                            },
                            {
                                "text": "Quantos Pods a mais do que o desejado podem subir",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantas revisões o Deployment guarda no histórico",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantos nós podem ficar sem o Pod ao mesmo tempo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer que o número de Pods no ar nunca caia abaixo do desejado durante o rollout. Qual ajuste garante isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "maxUnavailable: 0 e maxSurge maior que 0",
                                "isCorrect": true
                            },
                            {
                                "text": "maxSurge: 0 e maxUnavailable maior que zero",
                                "isCorrect": false
                            },
                            {
                                "text": "maxSurge: 0 e maxUnavailable: 0",
                                "isCorrect": false
                            },
                            {
                                "text": "type: Recreate com maxSurge padrão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o principal efeito colateral de usar a estratégia Recreate em um Deployment?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Há uma janela de indisponibilidade da aplicação",
                                "isCorrect": true
                            },
                            {
                                "text": "O histórico de revisões é apagado a cada nova troca",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas versões convivem por vários minutos",
                                "isCorrect": false
                            },
                            {
                                "text": "O rollback deixa de funcionar no Deployment",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escalonamento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Escala manual\n\nEscalar significa mudar o número de réplicas de uma aplicação. No modo manual, há dois caminhos:\n\n- Imperativo: `kubectl scale deployment/web --replicas=5` muda na hora.\n- Declarativo: você ajusta `spec.replicas` no manifesto e aplica com `kubectl apply`.\n\nO modo declarativo é o preferido em produção, porque o manifesto versionado segue como fonte da verdade. Um `kubectl scale` resolve rápido, mas o próximo `apply` do manifesto antigo pode desfazer a mudança."
                    },
                    {
                        "type": "text",
                        "value": "## Horizontal Pod Autoscaler\n\nO HPA ajusta o número de réplicas automaticamente, conforme métricas observadas. O caso clássico é escalar por uso de CPU: se a carga sobe, ele adiciona Pods; se cai, ele remove.\n\nO HPA não mede recursos sozinho. Para métricas de CPU e memória, ele depende do Metrics Server instalado no cluster. A cada ciclo (por volta de 15 segundos), o HPA compara a métrica atual com o alvo e recalcula quantas réplicas são necessárias, respeitando os limites `min` e `max` que você definiu."
                    },
                    {
                        "type": "text",
                        "value": "## Requests como base do cálculo\n\nAqui está o ponto que mais cai em prova: o HPA baseado em CPU calcula o uso como porcentagem do `requests` de CPU do container, não do limite nem da capacidade do nó.\n\nOu seja, se o container pede `requests` de 200m e usa 100m, o HPA enxerga 50% de utilização. Sem `requests` definido, o HPA de CPU fica sem referência e não consegue calcular a porcentagem. Por isso, definir requests é pré-requisito para o autoscaling por CPU funcionar."
                    },
                    {
                        "type": "code",
                        "value": "# Cria um HPA: entre 2 e 10 réplicas, alvo de 50% de CPU\nkubectl autoscale deployment web --cpu-percent=50 --min=2 --max=10\n\n# Consulta o estado atual do autoscaler\nkubectl get hpa"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Escala manual\",\"HPA\"],[\"Quem decide o número\",\"Você\",\"O controlador, por métrica\"],[\"Reação à carga\",\"Nenhuma, é fixo\",\"Automática\"],[\"Precisa de requests\",\"Não\",\"Sim, para CPU\"],[\"Precisa de Metrics Server\",\"Não\",\"Sim, para CPU e memória\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O HPA de CPU mede a utilização como porcentagem do requests do container. Sem requests definido, não há como calcular o alvo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando muda na hora o número de réplicas de um Deployment para 4?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "kubectl scale deployment/web --replicas=4",
                                "isCorrect": true
                            },
                            {
                                "text": "kubectl autoscale deployment/web --max=4 --min=1",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl rollout undo deployment/web",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl edit hpa web",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você configurou um HPA por CPU, mas ele não escala e mostra a utilização como desconhecida. Qual a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os containers não têm `requests` de CPU definido",
                                "isCorrect": true
                            },
                            {
                                "text": "O Deployment está com `replicas` fixo no manifesto",
                                "isCorrect": false
                            },
                            {
                                "text": "A estratégia do Deployment está como Recreate",
                                "isCorrect": false
                            },
                            {
                                "text": "O HPA foi criado com o min igual ao max",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para o HPA escalar por CPU e memória, qual componente precisa estar instalado no cluster?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Metrics Server",
                                "isCorrect": true
                            },
                            {
                                "text": "Ingress Controller",
                                "isCorrect": false
                            },
                            {
                                "text": "CoreDNS",
                                "isCorrect": false
                            },
                            {
                                "text": "Cert-Manager",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um container define `requests` de CPU em 200m e consome 100m. Que utilização o HPA por CPU considera?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "50%, pois usa o requests como base",
                                "isCorrect": true
                            },
                            {
                                "text": "100%, pois usa o consumo absoluto",
                                "isCorrect": false
                            },
                            {
                                "text": "50%, pois usa o limite como base",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende da capacidade de CPU do nó",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Deployment é gerenciado por um HPA. Você roda `kubectl scale --replicas=8` nele. O que tende a acontecer em seguida?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O HPA reajusta as réplicas conforme a métrica",
                                "isCorrect": true
                            },
                            {
                                "text": "O número fica travado em 8 até você remover o HPA",
                                "isCorrect": false
                            },
                            {
                                "text": "O HPA é desativado automaticamente pelo scale",
                                "isCorrect": false
                            },
                            {
                                "text": "O Deployment passa a ignorar o HPA de vez",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "DaemonSet, Job e CronJob",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Um Pod por nó: DaemonSet\n\nNem todo workload quer N réplicas espalhadas pelo cluster. Às vezes você quer exatamente uma cópia do Pod em cada nó. Esse é o papel do DaemonSet.\n\nEle garante que todos os nós (ou um subconjunto, via nodeSelector ou afinidade) rodem uma cópia do Pod. Quando um nó novo entra no cluster, o DaemonSet coloca o Pod nele automaticamente; quando o nó sai, o Pod vai junto. É o formato ideal para agentes de nível de nó: coletor de logs, agente de monitoramento, plugin de rede."
                    },
                    {
                        "type": "text",
                        "value": "## Rodar até concluir: Job\n\nO Job serve para tarefas que têm fim, não para serviços que ficam no ar. Ele cria um ou mais Pods e garante que um número definido deles termine com sucesso. Feito isso, o Job é dado como concluído.\n\nPontos que importam:\n\n- `completions`: quantas execuções bem-sucedidas o Job precisa.\n- `parallelism`: quantos Pods podem rodar em paralelo.\n- `backoffLimit`: quantas retentativas antes de marcar o Job como falho (padrão 6).\n- O `restartPolicy` do Pod precisa ser `OnFailure` ou `Never`, nunca `Always`."
                    },
                    {
                        "type": "text",
                        "value": "## Job agendado: CronJob\n\nO CronJob cria Jobs de forma repetida, num horário definido por uma expressão cron. Serve para rotinas: backup diário, limpeza noturna, envio de relatório.\n\nO campo `schedule` recebe a expressão cron e o `jobTemplate` descreve o Job criado a cada disparo. Um ponto de atenção é o `concurrencyPolicy`, que decide o que fazer quando um disparo chega e o Job anterior ainda roda: `Allow` deixa sobrepor, `Forbid` pula o novo, `Replace` troca o antigo pelo novo."
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: limpeza\nspec:\n  schedule: \"0 3 * * *\"        # todo dia às 03:00\n  concurrencyPolicy: Forbid\n  jobTemplate:\n    spec:\n      backoffLimit: 4\n      template:\n        spec:\n          restartPolicy: OnFailure\n          containers:\n            - name: limpeza\n              image: alpine:3.20\n              command: [\"sh\", \"-c\", \"echo limpando\"]"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Objeto\",\"Quantos Pods\",\"Termina?\",\"Uso típico\"],[\"DaemonSet\",\"Um por nó\",\"Não, fica rodando\",\"Agente de log ou rede\"],[\"Job\",\"Até completar\",\"Sim, ao concluir\",\"Tarefa pontual\"],[\"CronJob\",\"Um Job por horário\",\"Cada Job termina\",\"Rotina agendada\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "DaemonSet coloca um Pod por nó e não termina. Job roda até concluir, com retentativas. CronJob dispara Jobs por uma agenda cron."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você precisa rodar um agente coletor de logs em cada nó do cluster, incluindo os que entrarem depois. Qual objeto usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "DaemonSet",
                                "isCorrect": true
                            },
                            {
                                "text": "Deployment",
                                "isCorrect": false
                            },
                            {
                                "text": "Job",
                                "isCorrect": false
                            },
                            {
                                "text": "StatefulSet",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer rodar um backup automaticamente todo dia às 2 da manhã. Qual objeto é o indicado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "CronJob",
                                "isCorrect": true
                            },
                            {
                                "text": "Job",
                                "isCorrect": false
                            },
                            {
                                "text": "DaemonSet",
                                "isCorrect": false
                            },
                            {
                                "text": "ReplicaSet",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao criar um Job, você define `restartPolicy: Always` no template do Pod. Qual o resultado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É rejeitado: Job aceita só OnFailure ou Never",
                                "isCorrect": true
                            },
                            {
                                "text": "O Job roda, mas nunca marca conclusão com sucesso",
                                "isCorrect": false
                            },
                            {
                                "text": "O Job vira um serviço contínuo, como um Deployment",
                                "isCorrect": false
                            },
                            {
                                "text": "O Pod reinicia apenas quando o container falha",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um CronJob dispara, mas o Job do disparo anterior ainda está rodando. Com `concurrencyPolicy: Forbid`, o que ocorre?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O novo disparo é pulado até o anterior terminar",
                                "isCorrect": true
                            },
                            {
                                "text": "O Job anterior é substituído de imediato pelo novo disparo",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois Jobs rodam ao mesmo tempo em paralelo",
                                "isCorrect": false
                            },
                            {
                                "text": "O CronJob é suspenso até intervenção manual",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Job falha repetidas vezes. Qual campo define o limite de retentativas antes de ele ser marcado como falho?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "backoffLimit",
                                "isCorrect": true
                            },
                            {
                                "text": "completions",
                                "isCorrect": false
                            },
                            {
                                "text": "parallelism",
                                "isCorrect": false
                            },
                            {
                                "text": "activeDeadlineSeconds",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Rede e serviços",
        "aulas": [
            {
                "titulo": "O modelo de rede do Kubernetes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Cada Pod tem seu próprio IP\nNo Kubernetes, a menor unidade de rede não é o container, é o Pod. Cada Pod recebe um endereço IP único dentro do cluster. Os containers de um mesmo Pod compartilham esse IP e conversam entre si por localhost, como se estivessem na mesma máquina.\n\n## Rede plana, sem NAT\nO modelo de rede do Kubernetes tem uma regra central: todo Pod alcança qualquer outro Pod, em qualquer nó, usando o IP do Pod diretamente e sem NAT. Não importa se os dois estão no mesmo nó ou em nós diferentes. Essa rede plana é implementada por um plugin CNI (Container Network Interface), como Calico, Cilium ou Flannel. O Kubernetes define a regra, o plugin faz acontecer."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Regra do modelo de rede\", \"O que ela garante\"], [\"Um IP por Pod\", \"Cada Pod tem endereço próprio e os containers dele dividem esse IP\"], [\"Comunicação sem NAT\", \"Todo Pod fala com qualquer Pod pelo IP real, sem tradução\"], [\"Independe do nó\", \"Tanto faz se os Pods estão no mesmo nó ou em nós diferentes\"], [\"Quem implementa\", \"O plugin CNI (Calico, Cilium, Flannel) cumpre essas regras\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O IP do Pod é efêmero\nO problema é que o IP do Pod não é estável. Quando um Pod morre e o controlador sobe outro no lugar (novo deploy, falha, reescalonamento), o Pod novo ganha um IP diferente. Por isso você nunca deve guardar o IP de um Pod em configuração, código ou em outro Pod, porque ele muda sem aviso.\n\n## Por que isso exige um Service\nSe o backend tem três réplicas e cada uma tem um IP que pode mudar, como o frontend sabe para onde mandar a requisição? É esse o buraco que o Service preenche: ele coloca um endereço estável na frente de um conjunto de Pods. O Service é o tema da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "O IP de um Pod é efêmero e muda quando o Pod é recriado. Por isso nunca se conecta a um Pod pelo IP direto; usa-se um Service na frente."
                    },
                    {
                        "type": "code",
                        "value": "$ kubectl get pods -o wide\nNAME             READY   STATUS    RESTARTS   IP            NODE\napi-7d9f-abcde   1/1     Running   0          10.244.1.12   node-1\napi-7d9f-fghij   1/1     Running   0          10.244.2.31   node-2\n\n# ao recriar o Pod, o IP muda:\n$ kubectl delete pod api-7d9f-abcde\n$ kubectl get pods -o wide\nNAME             READY   STATUS    RESTARTS   IP            NODE\napi-7d9f-klmno   1/1     Running   0          10.244.1.18   node-1"
                    }
                ],
                "questions": [
                    {
                        "statement": "Você roda kubectl get pods -o wide e cada Pod aparece com um IP na coluna IP. No modelo de rede do Kubernetes, esse IP pertence a quem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "a cada container do Pod, com um IP separado por container",
                                "isCorrect": false
                            },
                            {
                                "text": "ao Pod; os containers dele compartilham esse IP",
                                "isCorrect": true
                            },
                            {
                                "text": "ao nó em que o Pod está rodando no momento",
                                "isCorrect": false
                            },
                            {
                                "text": "ao Service que expõe o Pod para o cluster",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Pod no nó A precisa falar com um Pod no nó B. No modelo de rede padrão do Kubernetes, como essa comunicação acontece?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "pelo IP do Pod de destino, direto e sem NAT",
                                "isCorrect": true
                            },
                            {
                                "text": "por NAT feito pelo kubelet do nó de origem",
                                "isCorrect": false
                            },
                            {
                                "text": "somente se os dois Pods estiverem no mesmo nó",
                                "isCorrect": false
                            },
                            {
                                "text": "sempre passando obrigatoriamente por um Service",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dev anotou o IP de um Pod de banco e apontou a aplicação para esse IP. Depois de um redeploy, a aplicação parou de conectar. Qual a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "o IP do Pod é fixo, então a causa é outra",
                                "isCorrect": false
                            },
                            {
                                "text": "o NAT interno do cluster passou a bloquear a conexão",
                                "isCorrect": false
                            },
                            {
                                "text": "o Pod foi recriado e recebeu um novo IP",
                                "isCorrect": true
                            },
                            {
                                "text": "o nó trocou de IP durante o processo de redeploy",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um backend roda com 3 réplicas, cada uma com IP efêmero, e o frontend precisa de um jeito estável de alcançar esse backend. O que resolve isso no Kubernetes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "guardar os três IPs dos Pods numa lista fixa",
                                "isCorrect": false
                            },
                            {
                                "text": "um Service, que fica estável na frente dos Pods",
                                "isCorrect": true
                            },
                            {
                                "text": "trocar o IP do Pod pelo IP do nó em que ele está rodando",
                                "isCorrect": false
                            },
                            {
                                "text": "subir mais réplicas para reduzir a troca de IP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O modelo de rede exige que todo Pod fale com todo Pod sem NAT, mas o Kubernetes não implementa a rede em si. Quem cumpre essa exigência no cluster?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "o kube-proxy, responsável pela rede plana entre nós",
                                "isCorrect": false
                            },
                            {
                                "text": "o CoreDNS, que roteia os pacotes de um Pod a outro",
                                "isCorrect": false
                            },
                            {
                                "text": "o container runtime, como o containerd ou o CRI-O",
                                "isCorrect": false
                            },
                            {
                                "text": "o plugin CNI de rede, por exemplo Calico ou Cilium",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Service ClusterIP",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Um endereço estável na frente dos Pods\nUm Service é um recurso que dá um nome e um IP fixos para um conjunto de Pods. Enquanto os Pods vão e vêm com IPs efêmeros, o Service fica parado no mesmo lugar. Quem quer falar com o backend fala com o Service, e ele encaminha para um dos Pods.\n\n## O selector liga o Service aos Pods\nO Service não aponta para IPs, ele aponta para labels. No campo selector você diz algo como \"todo Pod com a label app=api faz parte deste Service\". O Kubernetes mantém essa lista de Pods sempre atualizada em um objeto de Endpoints (ou EndpointSlice). Se um Pod novo sobe com a label certa, entra no balanceamento; se um Pod morre, sai.\n\n## ClusterIP é o tipo padrão\nQuando você cria um Service sem informar o tipo, ele nasce como ClusterIP. Esse IP só é acessível de dentro do cluster: outros Pods alcançam, mas nada de fora chega até ele diretamente. É o tipo certo para comunicação interna, como frontend falando com backend ou backend falando com um cache."
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: v1\nkind: Service\nmetadata:\n  name: api\nspec:\n  type: ClusterIP        # padrão; pode ser omitido\n  selector:\n    app: api             # liga a todos os Pods com label app=api\n  ports:\n    - port: 80           # porta em que o Service escuta\n      targetPort: 8080   # porta em que o Pod recebe"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Campo do Service\", \"Para que serve\"], [\"selector\", \"Escolhe os Pods pelo label, por exemplo app=api\"], [\"port\", \"Porta em que o Service escuta\"], [\"targetPort\", \"Porta em que o Pod recebe o tráfego\"], [\"clusterIP\", \"IP interno e estável do Service, atribuído pelo cluster\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Balanceamento entre os Pods\nQuando várias réplicas batem com o selector, o Service distribui as conexões entre elas. Por padrão esse balanceamento é feito pelo kube-proxy em cada nó, em uma distribuição próxima de round-robin. Para quem chama existe um único destino, o Service, e o cluster decide para qual Pod cada conexão vai.\n\n## Quando não chega em ninguém\nSe o selector não casa com nenhum Pod, o Service existe mas fica com a lista de Endpoints vazia e não encaminha para lugar nenhum. Esse é um erro comum de configuração: label do Pod diferente do selector do Service."
                    },
                    {
                        "type": "quote",
                        "value": "ClusterIP é o tipo padrão de Service e só responde dentro do cluster. Ele dá IP e nome estáveis e usa o selector de labels para achar os Pods."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você cria um Service e não informa o campo type. Qual tipo o Kubernetes atribui por padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "NodePort",
                                "isCorrect": false
                            },
                            {
                                "text": "LoadBalancer",
                                "isCorrect": false
                            },
                            {
                                "text": "ClusterIP",
                                "isCorrect": true
                            },
                            {
                                "text": "ExternalName",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Service tem selector app=api. Sobe um Pod novo já com a label app=api. O que acontece com esse Pod?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "passa a receber tráfego do Service automaticamente",
                                "isCorrect": true
                            },
                            {
                                "text": "nada, é preciso editar o Service para incluí-lo",
                                "isCorrect": false
                            },
                            {
                                "text": "só entra se for recriado com o mesmo IP anterior",
                                "isCorrect": false
                            },
                            {
                                "text": "o Service precisa ser recriado para reconhecer esse Pod",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação de fora do cluster tenta acessar um Service ClusterIP pelo IP dele e não consegue. Qual a explicação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "o Service está sem nenhum selector configurado",
                                "isCorrect": false
                            },
                            {
                                "text": "o ClusterIP responde apenas dentro do cluster",
                                "isCorrect": true
                            },
                            {
                                "text": "falta liberar a porta 443 no Service em questão",
                                "isCorrect": false
                            },
                            {
                                "text": "o ClusterIP é trocado a cada nova requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Service, port é 80 e targetPort é 8080, e o Pod escuta na 8080. Uma requisição chega ao Service na porta 80. Para onde ela vai?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "para a porta 80 do Pod",
                                "isCorrect": false
                            },
                            {
                                "text": "para a porta 80 do nó",
                                "isCorrect": false
                            },
                            {
                                "text": "para a porta 8080 do Service",
                                "isCorrect": false
                            },
                            {
                                "text": "para a porta 8080 do Pod",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um Service ClusterIP foi criado, mas nada chega aos Pods. O comando kubectl get endpoints mostra a lista vazia. Qual a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "o selector do Service não casa com a label de nenhum Pod",
                                "isCorrect": true
                            },
                            {
                                "text": "o ClusterIP ainda não foi atribuído pelo cluster de destino",
                                "isCorrect": false
                            },
                            {
                                "text": "o targetPort ficou com o mesmo valor de port",
                                "isCorrect": false
                            },
                            {
                                "text": "falta um Ingress na frente desse Service",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Expor para fora: NodePort e LoadBalancer",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## ClusterIP não chega de fora\nO ClusterIP resolve a comunicação interna, mas não é acessível de fora do cluster. Para expor uma aplicação para o mundo, o Kubernetes tem dois tipos de Service que estendem o ClusterIP: NodePort e LoadBalancer.\n\n## NodePort abre uma porta em todos os nós\nUm Service NodePort reserva a mesma porta alta (por padrão na faixa 30000 a 32767) em todos os nós do cluster. Bater em IP-do-nó:porta entrega o tráfego ao Service, que balanceia para os Pods. Como a porta abre em todos os nós, você alcança a aplicação por qualquer um deles, mesmo que o Pod não esteja naquele nó. Vale lembrar: um NodePort também tem um ClusterIP; ele é uma camada a mais por cima."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de Service\", \"Alcance\", \"Como é acessado\"], [\"ClusterIP\", \"Só dentro do cluster\", \"Pelo IP interno do Service\"], [\"NodePort\", \"Externo, pelos nós\", \"IP-do-nó:porta na faixa 30000-32767\"], [\"LoadBalancer\", \"Externo, pela nuvem\", \"Pelo IP público do balanceador\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## LoadBalancer provisiona um balanceador externo\nO tipo LoadBalancer vai um passo além: pede à infraestrutura (em geral uma nuvem como AWS, GCP ou Azure) um balanceador de carga externo, com IP público próprio. O provedor cria o balanceador e o aponta para os NodePorts do Service. É o jeito padrão de expor um serviço na internet em ambiente de nuvem.\n\nNum cluster on-premise sem integração de nuvem, o tipo LoadBalancer fica com o EXTERNAL-IP em pending, a menos que exista algo como o MetalLB para provisionar o balanceador.\n\n## Cada tipo inclui o anterior\nOs três tipos são camadas: LoadBalancer contém um NodePort, que contém um ClusterIP. Criar um LoadBalancer cria junto o NodePort e o ClusterIP correspondentes."
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: v1\nkind: Service\nmetadata:\n  name: web\nspec:\n  type: NodePort\n  selector:\n    app: web\n  ports:\n    - port: 80          # porta do ClusterIP interno\n      targetPort: 8080  # porta do Pod\n      nodePort: 30080   # porta aberta em cada nó (opcional)"
                    },
                    {
                        "type": "quote",
                        "value": "Os tipos de Service são camadas: LoadBalancer contém um NodePort, que contém um ClusterIP. Em nuvem, LoadBalancer expõe na internet; NodePort abre a mesma porta em todos os nós."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um Service NodePort abre uma porta em todos os nós para acesso externo. Em qual faixa fica essa porta por padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "de 0 a 1024",
                                "isCorrect": false
                            },
                            {
                                "text": "de 30000 a 32767",
                                "isCorrect": true
                            },
                            {
                                "text": "de 20000 a 40000",
                                "isCorrect": false
                            },
                            {
                                "text": "de 1 a 65535",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você está em uma nuvem e quer expor a aplicação na internet com IP público, deixando o provedor cuidar do balanceador. Qual tipo de Service usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "LoadBalancer",
                                "isCorrect": true
                            },
                            {
                                "text": "ClusterIP",
                                "isCorrect": false
                            },
                            {
                                "text": "NodePort",
                                "isCorrect": false
                            },
                            {
                                "text": "ExternalName",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Cluster com 3 nós. Um Service NodePort expõe a porta 30080, mas o Pod roda só no nó 2. Você acessa o IP do nó 1 na porta 30080. O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "a conexão falha porque o Pod não está no nó 1",
                                "isCorrect": false
                            },
                            {
                                "text": "o nó 1 devolve um redirecionamento HTTP para o nó 2",
                                "isCorrect": false
                            },
                            {
                                "text": "a requisição entra e é encaminhada ao Pod no nó 2",
                                "isCorrect": true
                            },
                            {
                                "text": "só funcionaria acessando diretamente pelo nó 2",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao criar um Service do tipo LoadBalancer, quais recursos de rede o cluster monta por baixo dele?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "apenas um ClusterIP",
                                "isCorrect": false
                            },
                            {
                                "text": "apenas um NodePort",
                                "isCorrect": false
                            },
                            {
                                "text": "um Ingress junto com um ClusterIP",
                                "isCorrect": false
                            },
                            {
                                "text": "um NodePort e um ClusterIP",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Num cluster on-premise sem integração de nuvem, você cria um Service LoadBalancer e o EXTERNAL-IP fica em pending para sempre. O que explica e resolve isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "o selector do Service está incorreto; basta corrigir esse selector",
                                "isCorrect": false
                            },
                            {
                                "text": "não há provedor para criar o balanceador; usar algo como o MetalLB",
                                "isCorrect": true
                            },
                            {
                                "text": "a porta NodePort saiu da faixa; ajustar o número da porta",
                                "isCorrect": false
                            },
                            {
                                "text": "falta um Ingress Controller; instalar um resolve o pending",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ingress",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Roteamento HTTP para vários Services\nImagine que você tem vários serviços (loja, blog, API) e quer expor todos sob o mesmo IP e a mesma porta 443, escolhendo o destino pelo host ou pelo caminho da URL. Fazer isso com um LoadBalancer por serviço fica caro e trabalhoso. O Ingress resolve isso: é um recurso que define regras de roteamento HTTP e HTTPS, mandando cada requisição para um Service diferente conforme o host (loja.exemplo.com) ou o path (/api).\n\nO Ingress trabalha na camada 7 (HTTP), então enxerga host, path e cabeçalhos. Um Service comum trabalha em camada 3/4 (IP e porta) e não conhece a URL."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Service comum\", \"Ingress\"], [\"Camada\", \"3/4 (IP e porta)\", \"7 (HTTP e HTTPS)\"], [\"Roteia por\", \"IP e porta\", \"Host e path da URL\"], [\"Controlador extra\", \"Não precisa\", \"Precisa de um Ingress Controller\"], [\"TLS\", \"Não termina por si\", \"Termina o TLS na entrada\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Ingress sozinho não faz nada\nAqui mora a pegadinha de prova: criar um objeto Ingress não expõe nada por si só. O Ingress é apenas a regra. Quem executa a regra é o Ingress Controller, um componente que você instala no cluster (NGINX Ingress, Traefik, HAProxy, entre outros). Sem um Ingress Controller rodando, seus objetos Ingress ficam inertes.\n\n## TLS no Ingress\nO Ingress também centraliza o HTTPS. Você referencia um Secret que guarda o certificado e a chave, e o Ingress Controller termina o TLS ali, na entrada. Assim os Services de trás podem receber tráfego HTTP interno, enquanto o mundo fala HTTPS com o cluster."
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: site\nspec:\n  tls:\n    - hosts:\n        - loja.exemplo.com\n      secretName: loja-tls    # Secret com certificado e chave\n  rules:\n    - host: loja.exemplo.com\n      http:\n        paths:\n          - path: /\n            pathType: Prefix\n            backend:\n              service:\n                name: loja      # roteia para o Service \"loja\"\n                port:\n                  number: 80\n          - path: /api\n            pathType: Prefix\n            backend:\n              service:\n                name: api       # roteia para o Service \"api\"\n                port:\n                  number: 80"
                    },
                    {
                        "type": "quote",
                        "value": "O objeto Ingress é só a regra de roteamento HTTP e HTTPS. Ele não funciona sem um Ingress Controller instalado no cluster para executar as regras."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você aplicou um objeto Ingress, mas nenhuma rota funciona e não há Ingress Controller instalado. Qual é o problema?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "o Ingress leva alguns minutos para ativar sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "falta declarar o tipo LoadBalancer dentro do Ingress",
                                "isCorrect": false
                            },
                            {
                                "text": "sem um Ingress Controller, o Ingress não roteia nada",
                                "isCorrect": true
                            },
                            {
                                "text": "o Ingress só funciona com Services do tipo NodePort",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer que loja.exemplo.com vá para o Service da loja e loja.exemplo.com/api vá para o Service da API, na mesma porta 443. O que faz esse roteamento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "um Ingress, roteando por host e por path",
                                "isCorrect": true
                            },
                            {
                                "text": "um Service NodePort para cada uma das rotas",
                                "isCorrect": false
                            },
                            {
                                "text": "um ClusterIP único com vários selectors juntos",
                                "isCorrect": false
                            },
                            {
                                "text": "um LoadBalancer separado para cada caminho da URL",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação diferencia corretamente o Ingress de um Service comum?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "o Service roteia por host e path; o Ingress, por IP e porta",
                                "isCorrect": false
                            },
                            {
                                "text": "o Ingress roteia por host e path; o Service, por IP e porta",
                                "isCorrect": true
                            },
                            {
                                "text": "os dois roteiam por host e path, muda só o nome",
                                "isCorrect": false
                            },
                            {
                                "text": "nenhum dos dois consegue enxergar o path da URL",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Ingress, onde fica o certificado usado para terminar o HTTPS na entrada do cluster?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "em um ConfigMap montado dentro do Pod",
                                "isCorrect": false
                            },
                            {
                                "text": "no próprio YAML do Ingress, em texto puro",
                                "isCorrect": false
                            },
                            {
                                "text": "no campo tls do Service que recebe o tráfego HTTP",
                                "isCorrect": false
                            },
                            {
                                "text": "em um Secret apontado pelo campo tls do Ingress",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Você tem três aplicações web e quer expor as três sob um único IP público, roteando por hostname. Qual a abordagem mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "um Ingress com regras por host, atrás de um Ingress Controller",
                                "isCorrect": true
                            },
                            {
                                "text": "três Services do tipo LoadBalancer, um para cada aplicação web",
                                "isCorrect": false
                            },
                            {
                                "text": "três NodePorts e um DNS apontando para os nós",
                                "isCorrect": false
                            },
                            {
                                "text": "um ClusterIP compartilhado pelas três aplicações",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "DNS interno e descoberta de serviços",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O cluster tem seu próprio DNS\nTodo cluster Kubernetes roda um servidor DNS interno, hoje quase sempre o CoreDNS. Sempre que você cria um Service, o cluster registra um nome DNS para ele automaticamente. Assim, em vez de descobrir e guardar o ClusterIP (que também pode mudar se o Service for recriado), os Pods encontram o Service pelo nome.\n\n## Pods acham Services pelo nome\nUm Pod que quer falar com o Service chamado api simplesmente usa o hostname api. O DNS do cluster resolve esse nome para o ClusterIP atual do Service. É isso que chamamos de descoberta de serviços: a aplicação não precisa saber IP nenhum, só o nome do Service."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Forma do nome\", \"Quando resolve\", \"Exemplo\"], [\"nome-do-service\", \"Pod no mesmo namespace do Service\", \"api\"], [\"nome.namespace\", \"A partir de qualquer namespace\", \"api.producao\"], [\"FQDN completo\", \"Sempre, nome totalmente qualificado\", \"api.producao.svc.cluster.local\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Mesmo namespace ou outro namespace\nSe o Pod e o Service estão no mesmo namespace, basta o nome curto (api). Se estão em namespaces diferentes, você acrescenta o namespace: api.producao, ou o nome completo api.producao.svc.cluster.local. O sufixo svc.cluster.local é o domínio padrão do cluster.\n\n## Por que nome e não IP\nUsar o nome do Service em vez do IP tem uma razão prática: o nome é estável e o IP não é garantido. O ClusterIP costuma durar, mas some se o Service for recriado, e você nunca deveria depender do IP de um Pod, que é efêmero. O nome do Service, ao contrário, é previsível. Por isso configurações e códigos apontam para nomes de Service, não para IPs."
                    },
                    {
                        "type": "code",
                        "value": "# de dentro de um Pod, no mesmo namespace do Service \"api\":\n$ curl http://api/health\n\n# Service em outro namespace (producao):\n$ curl http://api.producao/health\n\n# checando a resolução de nomes:\n$ nslookup api.producao.svc.cluster.local\nName:    api.producao.svc.cluster.local\nAddress: 10.96.34.10"
                    },
                    {
                        "type": "quote",
                        "value": "Pods acham Services pelo nome DNS, não pelo IP. No mesmo namespace basta o nome do Service; entre namespaces use nome.namespace ou o FQDN nome.namespace.svc.cluster.local."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual componente costuma ser o responsável pelo DNS interno em um cluster Kubernetes atual?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "kube-proxy",
                                "isCorrect": false
                            },
                            {
                                "text": "CoreDNS",
                                "isCorrect": true
                            },
                            {
                                "text": "etcd",
                                "isCorrect": false
                            },
                            {
                                "text": "kubelet",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Pod e um Service chamado api estão no mesmo namespace. Que hostname o Pod pode usar para alcançar o Service?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "obrigatoriamente o ClusterIP do Service",
                                "isCorrect": false
                            },
                            {
                                "text": "api.svc, pois sem isso o nome não resolve",
                                "isCorrect": false
                            },
                            {
                                "text": "api",
                                "isCorrect": true
                            },
                            {
                                "text": "o IP atual de um dos Pods do Service",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No nome completo api.producao.svc.cluster.local, o que a parte producao representa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "o namespace em que o Service está",
                                "isCorrect": true
                            },
                            {
                                "text": "o nome do nó que hospeda o Pod",
                                "isCorrect": false
                            },
                            {
                                "text": "o nome do Ingress Controller ativo",
                                "isCorrect": false
                            },
                            {
                                "text": "o tipo do Service, no caso ClusterIP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a recomendação é configurar as aplicações para usar o nome do Service em vez do ClusterIP numérico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "o número IP não funciona de dentro do cluster, só o nome resolve",
                                "isCorrect": false
                            },
                            {
                                "text": "resolver por nome é sempre mais rápido do que por IP na rede",
                                "isCorrect": false
                            },
                            {
                                "text": "o nome é estável, já o IP pode mudar se o Service for recriado",
                                "isCorrect": true
                            },
                            {
                                "text": "o nome conversa direto com o Pod e dispensa usar o Service",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação no namespace web usa o hostname api no código, mas o Service api está no namespace producao, e a resolução falha. Qual a correção mais direta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "reiniciar o CoreDNS para recarregar os nomes",
                                "isCorrect": false
                            },
                            {
                                "text": "usar api.producao (ou o FQDN) no lugar de api",
                                "isCorrect": true
                            },
                            {
                                "text": "renomear o Service de api para algo como web-api",
                                "isCorrect": false
                            },
                            {
                                "text": "criar um segundo Service api dentro do namespace web",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Configuração e estado",
        "aulas": [
            {
                "titulo": "ConfigMap",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Configuração fora da imagem\n\nUma boa imagem de container é genérica: a mesma imagem deve subir em dev, homologação e produção sem recompilar. O que muda entre esses ambientes é a configuração, como a URL do banco, o nível de log ou o número de workers. Se você grava esses valores dentro da imagem, precisa de uma imagem diferente por ambiente, e isso quebra a portabilidade.\n\nO ConfigMap resolve isso guardando a configuração como pares chave-valor no cluster, separada do código. A aplicação lê esses valores em tempo de execução, e a mesma imagem roda em qualquer ambiente, mudando apenas o ConfigMap."
                    },
                    {
                        "type": "text",
                        "value": "## Duas formas de injetar\n\nUm ConfigMap pode chegar ao container de duas maneiras:\n\n- **Variáveis de ambiente**: cada chave vira uma variável dentro do container. É simples, mas as variáveis são lidas na criação do Pod; mudar o ConfigMap não atualiza um Pod que já está rodando.\n- **Arquivos montados em volume**: o ConfigMap é montado como um diretório e cada chave vira um arquivo. Serve bem para arquivos de configuração inteiros, como um nginx.conf, e o conteúdo montado acompanha atualizações do ConfigMap.\n\nA escolha depende de como a aplicação espera ler a config: por ambiente ou por arquivo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Como variável de ambiente\",\"Como arquivo em volume\"],[\"Formato\",\"Chave vira variável\",\"Chave vira arquivo\"],[\"Bom para\",\"Poucos valores simples\",\"Arquivos de config inteiros\"],[\"Atualiza sem recriar o Pod\",\"Não, lida na criação\",\"Sim, o arquivo acompanha\"],[\"Uso típico\",\"LOG_LEVEL, APP_MODE\",\"nginx.conf, application.yml\"]]"
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\ndata:\n  LOG_LEVEL: info\n  APP_MODE: production\n  app.properties: |\n    timeout=30\n    retries=3"
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: app\nspec:\n  containers:\n    - name: app\n      image: minha-app:1.0\n      envFrom:\n        - configMapRef:\n            name: app-config     # todas as chaves viram variáveis\n      volumeMounts:\n        - name: config-vol\n          mountPath: /etc/config # cada chave vira um arquivo\n  volumes:\n    - name: config-vol\n      configMap:\n        name: app-config"
                    },
                    {
                        "type": "quote",
                        "value": "ConfigMap externaliza configuração NÃO sensível em pares chave-valor. A mesma imagem roda em todo ambiente, e você injeta os valores como variáveis de ambiente ou como arquivos montados em volume."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe grava a URL do banco dentro da imagem e precisa recompilar a cada ambiente. O que um ConfigMap oferece para resolver isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Manter a configuração fora da imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografar a URL do banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Recompilar a imagem para cada ambiente",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o container runtime do Pod",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao decidir o que colocar em um ConfigMap, que tipo de dado é o adequado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dados de configuração não sensíveis",
                                "isCorrect": true
                            },
                            {
                                "text": "Senhas e tokens de acesso da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Chaves privadas de certificados TLS",
                                "isCorrect": false
                            },
                            {
                                "text": "O binário compilado da aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A aplicação recebe a config do ConfigMap como variáveis de ambiente. A equipe edita o ConfigMap, mas o Pod em execução segue com os valores antigos. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Variáveis de ambiente são lidas na criação do Pod",
                                "isCorrect": true
                            },
                            {
                                "text": "O ConfigMap não pode ser alterado após criado",
                                "isCorrect": false
                            },
                            {
                                "text": "A alteração exige reiniciar o control plane",
                                "isCorrect": false
                            },
                            {
                                "text": "Variáveis de ambiente só valem para dados sensíveis",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A aplicação lê um arquivo nginx.conf completo em /etc/nginx. Qual a melhor forma de entregar esse arquivo via ConfigMap?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Montar o ConfigMap como volume, virando um arquivo",
                                "isCorrect": true
                            },
                            {
                                "text": "Injetar o arquivo inteiro em uma variável de ambiente",
                                "isCorrect": false
                            },
                            {
                                "text": "Copiar o arquivo para dentro da imagem do container",
                                "isCorrect": false
                            },
                            {
                                "text": "Gravar o conteúdo direto no etcd do cluster",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação precisa que uma alteração no ConfigMap chegue ao container sem recriar o Pod. Qual forma de consumo torna isso possível?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Montado em volume, o arquivo atualiza",
                                "isCorrect": true
                            },
                            {
                                "text": "Em variável de ambiente, que recarrega sozinha",
                                "isCorrect": false
                            },
                            {
                                "text": "Qualquer forma atualiza o Pod na hora",
                                "isCorrect": false
                            },
                            {
                                "text": "Só recriando o Pod a mudança chega",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Secret",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dados sensíveis merecem cuidado à parte\n\nSenhas de banco, tokens de API e chaves privadas não deveriam ficar em um ConfigMap comum nem gravados na imagem. Para esses dados o Kubernetes tem o Secret, um objeto parecido com o ConfigMap, mas pensado para informação confidencial.\n\nNa prática, o Secret é consumido do mesmo jeito que o ConfigMap: como variáveis de ambiente ou como arquivos montados em volume. A diferença está na intenção e no tratamento, já que o cluster lida com Secrets com mais cuidado e permite políticas de acesso mais restritas."
                    },
                    {
                        "type": "text",
                        "value": "## base64 não é criptografia\n\nEste é o ponto que mais cai em prova: por padrão, o valor de um Secret é apenas codificado em base64, não criptografado. base64 é uma codificação reversível, qualquer pessoa decodifica em um comando. Quem tiver acesso de leitura ao Secret, ou ao etcd onde ele é gravado, enxerga o valor em claro.\n\nOu seja, o Secret sozinho não protege nada por mágica. Ele organiza o dado sensível e habilita controles, mas a proteção real vem de restringir quem acessa e de ligar a criptografia em repouso."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"ConfigMap\",\"Secret\"],[\"Tipo de dado\",\"Config não sensível\",\"Dado sensível\"],[\"Armazenamento padrão\",\"Texto em claro\",\"Codificado em base64\"],[\"Criptografado por padrão\",\"Não\",\"Não\"],[\"Formas de consumo\",\"Env e volume\",\"Env e volume\"],[\"Exemplo\",\"LOG_LEVEL\",\"Senha do banco\"]]"
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: v1\nkind: Secret\nmetadata:\n  name: db-credentials\ntype: Opaque\nstringData:            # texto puro; o cluster codifica em base64\n  DB_USER: admin\n  DB_PASSWORD: s3nh4-forte\n---\napiVersion: v1\nkind: Pod\nmetadata:\n  name: app\nspec:\n  containers:\n    - name: app\n      image: minha-app:1.0\n      envFrom:\n        - secretRef:\n            name: db-credentials"
                    },
                    {
                        "type": "text",
                        "value": "## Boas práticas com Secrets\n\nComo o Secret não protege sozinho, algumas medidas são esperadas em produção:\n\n- **RBAC restrito**: dê permissão de ler Secrets apenas a quem realmente precisa, evitando acesso amplo.\n- **Criptografia em repouso**: configure o cluster para criptografar os Secrets no etcd (encryption at rest), para que o disco não guarde o valor em claro.\n- **Não commitar Secret**: nunca versione um manifesto de Secret com o valor real no Git; use ferramentas de gestão de segredos ou Secrets selados para isso.\n- **Preferir Secret a ConfigMap** para qualquer dado sensível, mesmo que ambos aceitem o mesmo consumo."
                    },
                    {
                        "type": "quote",
                        "value": "O ponto de prova sobre Secret: por padrão ele é apenas codificado em base64, não criptografado. A proteção real vem de RBAC restrito, criptografia em repouso no etcd e de nunca commitar o valor no Git."
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao escolher onde guardar um dado da aplicação, qual deles é o caso de uso adequado para um Secret?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A senha de acesso ao banco de dados",
                                "isCorrect": true
                            },
                            {
                                "text": "O nível de log da aplicação, info ou debug",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de réplicas do Deployment",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do namespace da aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colega afirma que colocar a senha em um Secret já a deixa criptografada e segura. Qual correção é adequada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Por padrão o Secret só codifica em base64",
                                "isCorrect": true
                            },
                            {
                                "text": "O Secret criptografa com AES automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "O Secret fica seguro por rodar só em memória",
                                "isCorrect": false
                            },
                            {
                                "text": "O Secret esconde o valor até do administrador",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em relação ao ConfigMap, qual afirmação descreve melhor o Secret?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Serve para dados sensíveis, consumido do mesmo jeito",
                                "isCorrect": true
                            },
                            {
                                "text": "Serve para dados públicos, com consumo diferente",
                                "isCorrect": false
                            },
                            {
                                "text": "É criptografado por padrão, ao contrário do ConfigMap",
                                "isCorrect": false
                            },
                            {
                                "text": "Só pode ser consumido como variável de ambiente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para reduzir o risco de vazamento de Secrets em produção, qual prática é recomendada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ligar a criptografia em repouso no etcd",
                                "isCorrect": true
                            },
                            {
                                "text": "Versionar o Secret com o valor real no Git",
                                "isCorrect": false
                            },
                            {
                                "text": "Dar acesso de leitura a Secrets para todos",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar a senha também em um ConfigMap",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Secret guarda um token. Alguém com permissão de leitura de Secrets no namespace tenta ver o valor. O que ocorre?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Consegue ler: base64 é reversível",
                                "isCorrect": true
                            },
                            {
                                "text": "Falha: o valor está criptografado no etcd",
                                "isCorrect": false
                            },
                            {
                                "text": "Falha: só o control plane decodifica",
                                "isCorrect": false
                            },
                            {
                                "text": "Consegue ler, mas só o hash do valor",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Volumes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O filesystem do container é efêmero\n\nCada container tem seu próprio sistema de arquivos, que nasce da imagem e morre com ele. Se o container reinicia após um crash, por exemplo, tudo que ele escreveu em disco durante a execução se perde e volta ao estado da imagem. Para uma aplicação stateless isso é ótimo, mas muitos casos precisam guardar algo entre reinícios ou compartilhar arquivos.\n\nO volume é a resposta do Kubernetes para isso: um diretório acessível aos containers do Pod, com um ciclo de vida definido pelo Pod, e não pela imagem do container. Você declara o volume no Pod e o monta onde precisar dentro dos containers."
                    },
                    {
                        "type": "text",
                        "value": "## Volume no Pod, montado no container\n\nO volume é declarado no nível do Pod, em spec.volumes, e cada container escolhe onde montá-lo com volumeMounts. Isso traz duas consequências úteis:\n\n- **Sobrevive ao restart do container**: se um container do Pod reinicia, o volume continua ali com os dados, porque ele pertence ao Pod, não ao container.\n- **Pode ser compartilhado**: dois ou mais containers do mesmo Pod podem montar o mesmo volume e trocar arquivos por ele, um padrão comum em sidecars.\n\nO limite é o Pod: quando o Pod é removido, os volumes efêmeros dele também vão embora."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo\",\"O que é\",\"Ciclo de vida\",\"Cuidado\"],[\"emptyDir\",\"Diretório vazio criado com o Pod\",\"Vive enquanto o Pod existe\",\"Some quando o Pod é removido\"],[\"hostPath\",\"Um caminho do disco do nó\",\"Ligado ao nó, não ao Pod\",\"Prende o Pod ao nó e traz risco\"]]"
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: web-com-sidecar\nspec:\n  containers:\n    - name: app\n      image: minha-app:1.0\n      volumeMounts:\n        - name: dados\n          mountPath: /var/dados\n    - name: sidecar\n      image: log-shipper:1.0\n      volumeMounts:\n        - name: dados\n          mountPath: /leitura\n  volumes:\n    - name: dados\n      emptyDir: {}          # criado vazio junto com o Pod"
                    },
                    {
                        "type": "text",
                        "value": "## Quando usar cada um\n\n- **emptyDir**: ideal para dados temporários e para troca entre containers do Pod, como cache, arquivos de scratch ou um buffer que um sidecar processa. Nasce vazio e não sobrevive à remoção do Pod.\n- **hostPath**: monta um caminho do próprio nó dentro do Pod. É útil em casos específicos de acesso ao host, mas amarra o Pod a um nó e abre uma porta de segurança, então costuma ser evitado em aplicações comuns.\n\nPara dados que precisam sobreviver ao Pod inteiro, nenhum dos dois basta: aí entram os PersistentVolumes, tema da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "Guarde a regra do ciclo de vida: o filesystem do container é efêmero e some no restart; o volume vive enquanto o Pod vive e pode ser compartilhado entre os containers do Pod. Para durar além do Pod, é preciso outro recurso."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um container reiniciou após um crash e os arquivos que ele havia gravado sumiram. O que explica esse comportamento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O filesystem do container é efêmero",
                                "isCorrect": true
                            },
                            {
                                "text": "O volume do Pod apaga os dados no restart",
                                "isCorrect": false
                            },
                            {
                                "text": "O Kubernetes limpa o disco do nó",
                                "isCorrect": false
                            },
                            {
                                "text": "O runtime bloqueia escrita em disco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um volume do tipo emptyDir foi criado em um Pod. Até quando os dados nele permanecem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Enquanto o Pod existir",
                                "isCorrect": true
                            },
                            {
                                "text": "Para sempre, mesmo sem o Pod",
                                "isCorrect": false
                            },
                            {
                                "text": "Só durante uma requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Até o container reiniciar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois containers do mesmo Pod precisam trocar arquivos entre si. Qual abordagem resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Montar um mesmo volume nos dois containers",
                                "isCorrect": true
                            },
                            {
                                "text": "Copiar os arquivos pela rede entre os Pods",
                                "isCorrect": false
                            },
                            {
                                "text": "Gravar os arquivos dentro da imagem de cada um",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar um ConfigMap para carregar os arquivos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe usa hostPath para dar a um Pod acesso a um caminho do nó. Qual limitação isso traz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Prende o Pod ao nó onde o caminho existe",
                                "isCorrect": true
                            },
                            {
                                "text": "Impede o Pod de ter variáveis de ambiente",
                                "isCorrect": false
                            },
                            {
                                "text": "Torna o volume somente leitura para o Pod",
                                "isCorrect": false
                            },
                            {
                                "text": "Faz o Pod perder acesso à rede do cluster",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um container do Pod reinicia e os dados no emptyDir continuam lá, mas ao remover o Pod eles somem. O que explica isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O volume pertence ao Pod, não ao container",
                                "isCorrect": true
                            },
                            {
                                "text": "O volume pertence ao container, não ao Pod",
                                "isCorrect": false
                            },
                            {
                                "text": "O emptyDir é gravado no etcd do cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "O volume é recriado a cada restart do container",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "PersistentVolume e PersistentVolumeClaim",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Storage que sobrevive ao Pod\n\nVolumes como emptyDir morrem com o Pod. Para dados que precisam durar, como o banco de uma aplicação, uploads de usuários ou um índice, o Kubernetes separa o storage do ciclo de vida do Pod com dois objetos: o PersistentVolume (PV) e o PersistentVolumeClaim (PVC).\n\nA ideia é desacoplar quem oferece o storage de quem o usa. O administrador ou a nuvem disponibiliza capacidade de armazenamento, e a aplicação apenas pede o quanto precisa, sem saber os detalhes de disco por trás."
                    },
                    {
                        "type": "text",
                        "value": "## PV e PVC: oferta e pedido\n\n- **PersistentVolume (PV)**: o recurso de storage em si, já provisionado no cluster. Representa um disco real, como um EBS, um NFS ou um disco local, com tamanho e modo de acesso definidos. É um objeto de infraestrutura, normalmente cuidado por quem administra o cluster.\n- **PersistentVolumeClaim (PVC)**: o pedido de storage feito pela aplicação. Diz quanto espaço quer e com qual modo de acesso. O Kubernetes casa o PVC com um PV compatível, processo chamado binding.\n\nO Pod não aponta para o PV direto: ele referencia o PVC. Assim a aplicação fica alheia ao disco físico e continua portável."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"PersistentVolume (PV)\",\"PersistentVolumeClaim (PVC)\"],[\"O que é\",\"O recurso de storage\",\"O pedido de storage\"],[\"Quem cria\",\"Admin ou modo dinâmico\",\"Quem sobe a aplicação\"],[\"Responde a\",\"Oferta de disco\",\"Demanda da aplicação\"],[\"Referência no Pod\",\"Indireta\",\"O Pod aponta para o PVC\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Estático x dinâmico e a StorageClass\n\nHá duas formas de o PV surgir:\n\n- **Provisionamento estático**: o administrador cria os PVs à mão, com antecedência. Os PVCs vão sendo casados com esses PVs já existentes.\n- **Provisionamento dinâmico**: o PV é criado sob demanda no momento em que o PVC aparece, sem ninguém preparar disco antes.\n\nO que habilita o modo dinâmico é a **StorageClass**: ela descreve um tipo de storage (o provisionador, o tipo de disco, parâmetros) e permite ao cluster criar o PV automaticamente para atender ao PVC. Um PVC que indica uma StorageClass dispara a criação do disco na hora."
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: dados-pvc\nspec:\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 5Gi\n  storageClassName: standard   # dispara provisionamento dinâmico\n---\napiVersion: v1\nkind: Pod\nmetadata:\n  name: banco\nspec:\n  containers:\n    - name: db\n      image: postgres:16\n      volumeMounts:\n        - name: dados\n          mountPath: /var/lib/postgresql/data\n  volumes:\n    - name: dados\n      persistentVolumeClaim:\n        claimName: dados-pvc"
                    },
                    {
                        "type": "quote",
                        "value": "PV é o storage oferecido; PVC é o pedido da aplicação, que o Pod referencia. No provisionamento estático o admin cria o PV antes; no dinâmico a StorageClass cria o PV sob demanda quando o PVC chega."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação precisa reservar 10Gi de storage durável. Qual objeto ela usa para fazer esse pedido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um PersistentVolumeClaim",
                                "isCorrect": true
                            },
                            {
                                "text": "Um PersistentVolume",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma StorageClass do cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "Um ConfigMap de aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na relação entre PV e PVC, o que cada um representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "PV é o storage; PVC é o pedido da aplicação",
                                "isCorrect": true
                            },
                            {
                                "text": "PV é o pedido; PVC é o storage oferecido",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos são o mesmo objeto com nomes diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "PV é um tipo de Pod; PVC é um volume",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ninguém criou discos com antecedência, mas ao aplicar um PVC o disco surge sozinho. O que tornou isso possível?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma StorageClass provisionando o PV sob demanda",
                                "isCorrect": true
                            },
                            {
                                "text": "O provisionamento estático feito antes pelo admin",
                                "isCorrect": false
                            },
                            {
                                "text": "Um emptyDir criando espaço extra no nó",
                                "isCorrect": false
                            },
                            {
                                "text": "Um ConfigMap gerando o volume do Pod",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Pod com banco de dados é removido e recriado, e os dados continuam lá. Qual recurso garante essa durabilidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um PVC ligado a um PersistentVolume",
                                "isCorrect": true
                            },
                            {
                                "text": "Um volume emptyDir do Pod",
                                "isCorrect": false
                            },
                            {
                                "text": "O filesystem da imagem do container",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma variável de ambiente do Deployment",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença entre provisionamento estático e dinâmico de PVs?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "No estático o PV vem pronto; no dinâmico, sob demanda",
                                "isCorrect": true
                            },
                            {
                                "text": "No estático o Pod cria o PV; no dinâmico o admin cria",
                                "isCorrect": false
                            },
                            {
                                "text": "No estático não existe PVC; no dinâmico não existe PV",
                                "isCorrect": false
                            },
                            {
                                "text": "No estático o disco é sempre local; no dinâmico, remoto",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "StatefulSet",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quando os Pods não são intercambiáveis\n\nUm Deployment trata suas réplicas como intercambiáveis: Pods idênticos, sem nome fixo, que podem ser mortos e recriados em qualquer ordem sem prejuízo. Isso funciona muito bem para aplicações stateless, como uma API web.\n\nBancos de dados, filas e outros sistemas com estado não gostam disso. Uma réplica de banco precisa de identidade estável, de storage próprio que não se confunda com o das outras e, muitas vezes, de uma ordem previsível para subir e descer. Para esse perfil o Kubernetes tem o StatefulSet."
                    },
                    {
                        "type": "text",
                        "value": "## Identidade estável e ordenada\n\nO StatefulSet dá a cada réplica uma identidade fixa, e não um nome aleatório:\n\n- **Nome previsível**: os Pods recebem um índice estável, como banco-0, banco-1, banco-2. Se o banco-1 morre, volta com o mesmo nome, não com um novo.\n- **Ordem controlada**: por padrão os Pods sobem em ordem (0, depois 1, depois 2) e são removidos na ordem inversa, o que ajuda cenários de eleição de líder e replicação.\n- **DNS estável**: junto a um Service headless, cada Pod ganha um endereço de rede próprio e permanente, para que os outros o encontrem sempre no mesmo lugar.\n\nEssa estabilidade é o que um sistema com estado espera dos seus membros."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Deployment\",\"StatefulSet\"],[\"Trata os Pods como\",\"Intercambiáveis\",\"Com identidade própria\"],[\"Nome do Pod\",\"Aleatório no fim\",\"Índice estável 0, 1, 2\"],[\"Ordem de criação\",\"Sem garantia\",\"Ordenada por padrão\"],[\"Storage por réplica\",\"Compartilhado ou nenhum\",\"Próprio, via volumeClaimTemplates\"],[\"Caso de uso\",\"Apps stateless\",\"Bancos, filas, apps com estado\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Storage próprio por réplica\n\nNo StatefulSet, cada Pod tem o seu próprio volume durável, e não um disco dividido com os demais. Isso vem do campo volumeClaimTemplates: em vez de você criar um PVC, o StatefulSet gera um PVC para cada réplica, seguindo o mesmo índice.\n\nAssim, o banco-0 fica ligado ao seu PVC, o banco-1 ao dele, e cada um enxerga apenas os próprios dados. Se um Pod é recriado, ele volta a se ligar ao mesmo PVC de antes, preservando o estado daquela réplica. É essa amarração entre identidade e storage que falta no Deployment."
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: apps/v1\nkind: StatefulSet\nmetadata:\n  name: banco\nspec:\n  serviceName: banco       # Service headless para o DNS estável\n  replicas: 3\n  selector:\n    matchLabels:\n      app: banco\n  template:\n    metadata:\n      labels:\n        app: banco\n    spec:\n      containers:\n        - name: db\n          image: postgres:16\n          volumeMounts:\n            - name: dados\n              mountPath: /var/lib/postgresql/data\n  volumeClaimTemplates:      # um PVC por réplica\n    - metadata:\n        name: dados\n      spec:\n        accessModes:\n          - ReadWriteOnce\n        resources:\n          requests:\n            storage: 10Gi"
                    },
                    {
                        "type": "quote",
                        "value": "StatefulSet é para apps com estado: dá nome estável e ordenado (banco-0, banco-1), storage próprio por réplica via volumeClaimTemplates e ordem controlada. O Deployment, ao contrário, trata os Pods como intercambiáveis."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual tipo de aplicação é o caso de uso típico de um StatefulSet?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um banco de dados com estado",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma API web stateless",
                                "isCorrect": false
                            },
                            {
                                "text": "Um job de processamento único",
                                "isCorrect": false
                            },
                            {
                                "text": "Um proxy reverso sem estado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um StatefulSet chamado banco com 3 réplicas, como os Pods são nomeados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "banco-0, banco-1 e banco-2",
                                "isCorrect": true
                            },
                            {
                                "text": "Com sufixos aleatórios no nome",
                                "isCorrect": false
                            },
                            {
                                "text": "Todos com o nome banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Por IP, sem nome fixo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual diferença marca o StatefulSet em relação ao Deployment?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dá identidade estável a cada Pod",
                                "isCorrect": true
                            },
                            {
                                "text": "Trata os Pods como intercambiáveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Não permite mais de uma réplica",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda apenas no control plane",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Cada réplica de um StatefulSet precisa do seu próprio disco durável. Qual recurso garante isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "volumeClaimTemplates, um PVC por réplica",
                                "isCorrect": true
                            },
                            {
                                "text": "Um emptyDir compartilhado entre as réplicas",
                                "isCorrect": false
                            },
                            {
                                "text": "Um único PVC usado por todas as réplicas",
                                "isCorrect": false
                            },
                            {
                                "text": "Um ConfigMap montado em cada Pod",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um StatefulSet, o Pod banco-1 é recriado após uma falha. O que acontece com o storage dele?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Volta ao mesmo PVC de antes",
                                "isCorrect": true
                            },
                            {
                                "text": "Recebe um PVC novo e vazio",
                                "isCorrect": false
                            },
                            {
                                "text": "Passa a usar o PVC do banco-0",
                                "isCorrect": false
                            },
                            {
                                "text": "Perde o storage, que era efêmero",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Operação, saúde e recursos",
        "aulas": [
            {
                "titulo": "Health checks: probes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Estar rodando não é estar saudável\n\nO Kubernetes percebe quando o processo principal de um container morre, porque o container termina junto. O que ele não enxerga sozinho é um processo que continua de pé, mas quebrado: travado em um deadlock, sem responder, ou ainda carregando dados e sem condição de atender. Para o kubelet o container existe; para o usuário a aplicação não funciona.\n\nAs probes (sondas) fecham essa lacuna. São verificações periódicas que o kubelet faz em cada container para descobrir o estado real da aplicação, além do simples processo vivo ou morto. Com elas, o Kubernetes reage a travamentos e evita mandar tráfego para quem ainda não está pronto."
                    },
                    {
                        "type": "text",
                        "value": "## As três probes\n\nSão três tipos de probe, cada um com uma pergunta e uma ação própria:\n\n- **liveness**: a aplicação ainda está viva? Se a checagem falha, o kubelet reinicia o container. Serve para destravar apps que congelaram sem morrer.\n- **readiness**: a aplicação está pronta para receber requisições? Se falha, o Pod é retirado dos endpoints do Service e para de receber tráfego, mas não é reiniciado. Ao voltar a passar, entra de novo no balanceamento.\n- **startup**: a aplicação já terminou de iniciar? Enquanto não passa, segura as outras duas probes. Serve para apps de partida lenta, que de outra forma seriam mortas pela liveness antes de subir."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Probe\",\"Pergunta que faz\",\"Ação quando falha\"],[\"liveness\",\"A aplicação está viva?\",\"Reinicia o container\"],[\"readiness\",\"Está pronta para atender?\",\"Tira o Pod do tráfego do Service\"],[\"startup\",\"Já terminou de iniciar?\",\"Adia liveness e readiness até passar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como a checagem é feita\n\nQualquer uma das três probes pode verificar o container de três formas, independentes do tipo:\n\n- **httpGet**: faz uma requisição HTTP a um caminho e porta. Passa se o código de resposta ficar na faixa 2xx ou 3xx. É o formato mais comum para APIs web.\n- **tcpSocket**: tenta abrir uma conexão TCP na porta. Passa se a conexão for aceita. Útil para serviços que não falam HTTP, como um banco de dados.\n- **exec**: roda um comando dentro do container. Passa se o comando sai com código 0. Serve para checagens sob medida, como validar um arquivo ou rodar um script.\n\nCampos como initialDelaySeconds, periodSeconds, failureThreshold e timeoutSeconds ajustam quando a probe começa, com que frequência roda e quando é considerada falha."
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: api-web\nspec:\n  containers:\n    - name: api\n      image: api-web:2.1\n      ports:\n        - containerPort: 8080\n      startupProbe:          # até 30s (10 x 3s) para a app subir\n        httpGet:\n          path: /healthz\n          port: 8080\n        failureThreshold: 10\n        periodSeconds: 3\n      readinessProbe:        # só entra no Service quando /ready responde\n        httpGet:\n          path: /ready\n          port: 8080\n        periodSeconds: 5\n      livenessProbe:         # reinicia o container se ele travar\n        httpGet:\n          path: /healthz\n          port: 8080\n        periodSeconds: 10"
                    },
                    {
                        "type": "quote",
                        "value": "Grave a diferença: liveness que falha reinicia o container; readiness que falha só tira o Pod do tráfego, sem reiniciar. A startup existe para apps lentas, segurando as outras duas até a aplicação terminar de iniciar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação às vezes congela em deadlock: o processo segue vivo, mas para de responder e precisa ser derrubado e subir de novo. Qual probe cuida disso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A liveness, que reinicia o container ao falhar",
                                "isCorrect": true
                            },
                            {
                                "text": "A readiness, que apenas corta o tráfego ao falhar",
                                "isCorrect": false
                            },
                            {
                                "text": "A startup, que adia as demais na inicialização",
                                "isCorrect": false
                            },
                            {
                                "text": "A tcpSocket, que testa a porta na inicialização",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante o deploy, um Pod ainda carrega cache e não deve receber requisições, porém não deve ser reiniciado. Qual probe garante isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A readiness, que tira o Pod do tráfego até ficar pronto",
                                "isCorrect": true
                            },
                            {
                                "text": "A liveness, que reinicia o Pod quando não fica pronto",
                                "isCorrect": false
                            },
                            {
                                "text": "A startup, que encerra o Pod se ele demorar a subir",
                                "isCorrect": false
                            },
                            {
                                "text": "A httpGet, que bloqueia o Pod durante o carregamento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aplicativo legado leva quase um minuto para iniciar. Sem ajuste, a liveness o mata antes de ele subir e gera um ciclo de reinícios. Qual probe resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A startup, que adia a liveness até a aplicação iniciar",
                                "isCorrect": true
                            },
                            {
                                "text": "A readiness, que adia a liveness até a aplicação iniciar",
                                "isCorrect": false
                            },
                            {
                                "text": "A liveness, configurada com um comando exec tolerante",
                                "isCorrect": false
                            },
                            {
                                "text": "A tcpSocket, que ignora a demora de inicialização",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um container roda um banco que não expõe HTTP, e a equipe quer checar se ele aceita conexões na porta. Qual tipo de checagem se encaixa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "tcpSocket, que tenta abrir a conexão TCP na porta",
                                "isCorrect": true
                            },
                            {
                                "text": "httpGet, que faz uma requisição a um caminho HTTP",
                                "isCorrect": false
                            },
                            {
                                "text": "exec, que abre a conexão TCP a partir do kubelet",
                                "isCorrect": false
                            },
                            {
                                "text": "portScan, que varre as portas abertas do container",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sob carga alta, um endpoint fica lento e a liveness passa a estourar o timeout. Qual é o efeito colateral indesejado disso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O container é reiniciado, o que pode piorar a carga",
                                "isCorrect": true
                            },
                            {
                                "text": "O Pod é só retirado do Service, sem reinício, aliviando a carga",
                                "isCorrect": false
                            },
                            {
                                "text": "A startup assume o controle e pausa a aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "O Service redireciona a carga para outro cluster",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Requests e limits",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Reserva e teto\n\nCada container pode declarar quanto de CPU e memória quer, em dois níveis:\n\n- **requests**: a quantidade que o container reserva. É o valor que o scheduler usa para escolher o nó, porque ele só coloca o Pod onde couber a soma dos requests. Funciona como um mínimo garantido.\n- **limits**: o teto que o container pode usar. Se tentar passar disso, o Kubernetes intervém, de forma diferente para CPU e para memória.\n\nCPU é medida em cores ou milicores (1000m equivale a 1 core). Memória é medida em bytes, em geral com sufixos como Mi (mebibyte) e Gi (gibibyte). O request pode ser menor que o limit: o container tem o mínimo garantido e cresce até o teto quando há folga no nó."
                    },
                    {
                        "type": "text",
                        "value": "## Estourar o teto: memória x CPU\n\nO que acontece ao bater no limit depende do recurso, porque os dois têm naturezas diferentes:\n\n- **Memória é incompressível**: não dá para usar menos memória à força. Se o container tenta passar do limit de memória, o kernel o encerra com um OOMKill (Out Of Memory). O container termina com o motivo OOMKilled e costuma ser reiniciado.\n- **CPU é compressível**: dá para atrasar o processo. Se o container quer mais CPU que o limit, ele não morre: sofre throttling, ou seja, o kernel o segura e ele passa a rodar mais devagar. A aplicação fica lenta, mas continua de pé.\n\nEssa diferença guia a investigação: memória que estoura derruba o container; CPU que estoura só o atrasa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Recurso\",\"Ao estourar o limit\",\"Efeito no container\"],[\"Memória\",\"OOMKill (incompressível)\",\"Container morto e, em geral, reiniciado\"],[\"CPU\",\"Throttling (compressível)\",\"Fica lento, mas continua vivo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que definir os dois\n\nDeixar requests e limits de fora cobra seu preço:\n\n- **Sem requests**, o scheduler não sabe quanto o Pod precisa e pode empilhar Pods demais em um nó, levando à disputa por recursos.\n- **Sem limits**, um container com vazamento de memória chega a consumir o nó inteiro e prejudica os vizinhos, o chamado noisy neighbor.\n- **Com os dois**, o scheduling fica previsível e os outros Pods ficam protegidos. Os valores ainda definem a classe de QoS do Pod, tema da próxima aula.\n\nUma prática comum é igualar request e limit de memória, para evitar surpresas de OOM, e ser mais folgado no request de CPU do que no limit."
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: processador\nspec:\n  containers:\n    - name: worker\n      image: processador:1.0\n      resources:\n        requests:        # reservado e usado no scheduling\n          cpu: \"250m\"\n          memory: \"256Mi\"\n        limits:          # teto: acima disso, throttle (CPU) ou OOMKill (memória)\n          cpu: \"500m\"\n          memory: \"256Mi\""
                    },
                    {
                        "type": "quote",
                        "value": "Memória é incompressível: estourar o limit gera OOMKill e mata o container. CPU é compressível: estourar o limit gera throttling e só deixa o container lento. Para o scheduler, o que conta é o request; o limit é o teto."
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao escolher em qual nó colocar um Pod, qual valor o scheduler usa como base?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O request, que representa o recurso reservado pelo Pod",
                                "isCorrect": true
                            },
                            {
                                "text": "O limit, que representa o recurso reservado pelo Pod",
                                "isCorrect": false
                            },
                            {
                                "text": "O uso médio de CPU medido na última hora",
                                "isCorrect": false
                            },
                            {
                                "text": "O total de réplicas declaradas no Deployment",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um container tem limit de memória de 256Mi e, por um vazamento, tenta usar mais que isso. O que o Kubernetes faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Mata o container com OOMKill",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixa o container lento por throttling",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduz o request de memória do container",
                                "isCorrect": false
                            },
                            {
                                "text": "Move o container para um nó maior",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço tem limit de CPU e, em um pico, pede mais processamento que o teto. Ele não morre, mas fica lento. Qual mecanismo explica isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Throttling, porque CPU é um recurso compressível",
                                "isCorrect": true
                            },
                            {
                                "text": "OOMKill, porque CPU é um recurso compressível",
                                "isCorrect": false
                            },
                            {
                                "text": "Eviction, porque o nó ficou sem CPU livre",
                                "isCorrect": false
                            },
                            {
                                "text": "Preemption, porque um Pod prioritário chegou",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um nó sem limits, um container com vazamento consome quase toda a RAM e prejudica os vizinhos. Como definir limits ajuda?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Impõe um teto de uso e protege os Pods vizinhos",
                                "isCorrect": true
                            },
                            {
                                "text": "Reserva mais memória e protege os Pods vizinhos",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumenta a memória total disponível no nó",
                                "isCorrect": false
                            },
                            {
                                "text": "Distribui o container entre vários nós de uma vez",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um container com limit de memória de 256Mi é morto por OOMKill, mesmo com o nó tendo vários GB de RAM livres. O que explica isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O limit é um teto por container, não depende da RAM livre do nó",
                                "isCorrect": true
                            },
                            {
                                "text": "O request é um teto por container, não depende da RAM livre do nó",
                                "isCorrect": false
                            },
                            {
                                "text": "O nó reserva toda a RAM livre para o control plane",
                                "isCorrect": false
                            },
                            {
                                "text": "O scheduler contou a RAM do nó de forma equivocada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "QoS e scheduling",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Classes de QoS\n\nA partir dos requests e limits que você define, o Kubernetes classifica cada Pod em uma de três classes de QoS (Quality of Service). Você não escolhe a classe direto: ela é derivada da configuração de recursos.\n\n- **Guaranteed**: todos os containers têm requests e limits definidos e iguais, para CPU e memória. É a classe mais protegida.\n- **Burstable**: ao menos um container tem request, mas o Pod não chega a Guaranteed (por exemplo, limit maior que request). Pode crescer quando há folga.\n- **BestEffort**: nenhum container define request nem limit. É a classe menos protegida.\n\nA classe pesa quando o nó fica sob pressão de memória: o kubelet começa a despejar (evict) Pods para liberar recursos, e a ordem segue a QoS."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Classe de QoS\",\"Como o Pod se qualifica\",\"Ordem de despejo sob pressão\"],[\"Guaranteed\",\"requests e limits iguais em todos os containers\",\"Despejado por último\"],[\"Burstable\",\"tem request, mas não é Guaranteed\",\"Fica no meio\"],[\"BestEffort\",\"sem request e sem limit\",\"Despejado primeiro\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como o scheduler escolhe o nó\n\nQuando um Pod novo aparece sem nó definido, o kube-scheduler decide onde colocá-lo em duas etapas:\n\n- **Filtragem (filtering)**: descarta os nós que não servem. Fica de fora quem não tem recursos para os requests do Pod, quem tem um taint que o Pod não tolera e quem não bate com as regras de afinidade.\n- **Pontuação (scoring)**: entre os nós que sobraram, dá uma nota a cada um e escolhe o de maior nota, equilibrando a carga e respeitando preferências.\n\nSe nenhum nó passa na filtragem, o Pod fica em Pending até surgir espaço ou um nó compatível."
                    },
                    {
                        "type": "text",
                        "value": "## Influenciando onde o Pod roda\n\nTrês mecanismos ajustam a colocação sem fixar o nó na mão:\n\n- **taints**: marcam um nó como repelente. Um nó com taint só aceita Pods que tragam a tolerância correspondente. Serve para reservar nós, por exemplo os que têm GPU.\n- **tolerations**: declaradas no Pod, permitem que ele seja agendado em nós com um dado taint. Tolerar é permissão, não atração: não obriga o Pod a ir para lá.\n- **nodeAffinity**: regras no Pod que o atraem para nós com certos labels, como disktype=ssd. Podem ser exigências (required) ou preferências (preferred).\n\nTaint e toleration agem por exclusão (o nó repele quem não tolera); nodeAffinity age por atração (o Pod prefere ou exige certos nós)."
                    },
                    {
                        "type": "code",
                        "value": "# Passo 1: marcar o nó para repelir quem não tolera\n# kubectl taint nodes no-gpu-1 dedicado=gpu:NoSchedule\n\n# Passo 2: o Pod tolera o taint e exige o nó certo\napiVersion: v1\nkind: Pod\nmetadata:\n  name: treino-modelo\nspec:\n  tolerations:\n    - key: \"dedicado\"\n      operator: \"Equal\"\n      value: \"gpu\"\n      effect: \"NoSchedule\"\n  affinity:\n    nodeAffinity:\n      requiredDuringSchedulingIgnoredDuringExecution:\n        nodeSelectorTerms:\n          - matchExpressions:\n              - key: acelerador\n                operator: In\n                values: [\"gpu\"]\n  containers:\n    - name: treino\n      image: treino:1.0"
                    },
                    {
                        "type": "quote",
                        "value": "A QoS é derivada, não escolhida: requests e limits iguais em tudo dão Guaranteed; nada definido dá BestEffort, o primeiro a ser despejado. Taint repele quem não tolera; nodeAffinity atrai para nós com certos labels."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um Pod tem, em todos os containers, requests e limits definidos e iguais para CPU e memória. Em qual classe de QoS ele cai?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Guaranteed",
                                "isCorrect": true
                            },
                            {
                                "text": "Burstable",
                                "isCorrect": false
                            },
                            {
                                "text": "BestEffort",
                                "isCorrect": false
                            },
                            {
                                "text": "Preferred",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um nó entra em pressão de memória e o kubelet precisa despejar Pods. Qual classe de QoS é despejada primeiro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "BestEffort, que não define requests nem limits",
                                "isCorrect": true
                            },
                            {
                                "text": "Guaranteed, que define requests e limits iguais",
                                "isCorrect": false
                            },
                            {
                                "text": "Burstable, que define requests mas não limits",
                                "isCorrect": false
                            },
                            {
                                "text": "Preferred, que define apenas a afinidade de nó",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A equipe quer reservar nós com GPU para que só cargas específicas rodem neles. Qual mecanismo marca esses nós de forma a repelir Pods não autorizados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "taint no nó, aceito só por Pods com a toleration",
                                "isCorrect": true
                            },
                            {
                                "text": "nodeAffinity no nó, aceito só por Pods com o label",
                                "isCorrect": false
                            },
                            {
                                "text": "request maior de CPU em cada Pod autorizado",
                                "isCorrect": false
                            },
                            {
                                "text": "um Service dedicado que filtra os Pods do nó",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Pod precisa rodar apenas em nós com disco SSD, marcados com o label disktype=ssd. Qual recurso expressa essa exigência a partir do Pod?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "nodeAffinity, que atrai o Pod para nós com o label",
                                "isCorrect": true
                            },
                            {
                                "text": "toleration, que atrai o Pod para nós com o label",
                                "isCorrect": false
                            },
                            {
                                "text": "taint, aplicado ao Pod para escolher o nó",
                                "isCorrect": false
                            },
                            {
                                "text": "request, que reserva o disco SSD do nó",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Nenhum nó do cluster tem CPU livre para os requests de um Pod novo. Em que estado ele fica e por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Pending, porque nenhum nó passa na filtragem",
                                "isCorrect": true
                            },
                            {
                                "text": "Running, porque o scheduler ignora requests na filtragem",
                                "isCorrect": false
                            },
                            {
                                "text": "Evicted, porque sua QoS é BestEffort por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "CrashLoopBackOff, porque o container não sobe",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Autoscaling",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Duas dimensões de escala\n\nQuando falta capacidade, dá para crescer em duas direções diferentes:\n\n- **Escalar Pods (horizontal)**: criar mais réplicas da aplicação para dividir a carga. Depende de haver espaço nos nós.\n- **Escalar nós**: adicionar máquinas ao cluster quando os nós atuais não têm mais recursos para novos Pods.\n\nAs duas se completam. Mais Pods sem nós livres não adianta, porque os Pods extras ficam em Pending. Mais nós sem mais Pods também não resolve, porque a carga segue concentrada nas réplicas que já existem. Por isso o Kubernetes tem um mecanismo para cada dimensão."
                    },
                    {
                        "type": "text",
                        "value": "## HPA: escalar Pods por métrica\n\nO Horizontal Pod Autoscaler (HPA) ajusta o número de réplicas de um Deployment automaticamente, com base em uma métrica. O caso clássico é a CPU: você define um alvo, por exemplo manter a CPU média em 50%, e o HPA cria ou remove réplicas para chegar perto disso.\n\n- Se a CPU média passa do alvo, o HPA aumenta as réplicas, respeitando um máximo.\n- Se cai abaixo, reduz as réplicas, respeitando um mínimo.\n- Além de CPU e memória, o HPA aceita métricas customizadas, como requisições por segundo.\n\nO HPA depende dos requests para calcular o uso relativo. Sem request de CPU, não há base para dizer 50% de quê."
                    },
                    {
                        "type": "text",
                        "value": "## Cluster Autoscaler: escalar nós\n\nO HPA cria réplicas, mas não cria máquinas. Quando os Pods novos não cabem em nenhum nó e ficam em Pending por falta de recursos, entra o Cluster Autoscaler: ele fala com a infraestrutura (nuvem ou provedor) e adiciona nós ao cluster.\n\n- **Para cima**: havendo Pods em Pending por falta de espaço, provisiona novos nós.\n- **Para baixo**: se um nó fica ocioso por um tempo e seus Pods cabem em outros, remove esse nó para economizar.\n\nEle atua no número de nós, não de Pods. É comum HPA e Cluster Autoscaler trabalharem juntos: o HPA pede mais réplicas, elas ficam em Pending, e o Cluster Autoscaler cria o nó que faltava."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"HPA\",\"Cluster Autoscaler\"],[\"O que escala\",\"Réplicas (Pods)\",\"Nós (máquinas)\"],[\"Gatilho\",\"Métrica como CPU acima do alvo\",\"Pods em Pending por falta de recurso\"],[\"Atua sobre\",\"Deployment ou ReplicaSet\",\"Grupo de nós na infraestrutura\"]]"
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: loja-web\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: loja-web\n  minReplicas: 2\n  maxReplicas: 10\n  metrics:\n    - type: Resource\n      resource:\n        name: cpu\n        target:\n          type: Utilization\n          averageUtilization: 50"
                    },
                    {
                        "type": "quote",
                        "value": "HPA escala Pods (réplicas) por métrica; Cluster Autoscaler escala nós (máquinas) quando há Pods em Pending por falta de recursos. Um cria réplicas, o outro cria a capacidade para elas rodarem."
                    }
                ],
                "questions": [
                    {
                        "statement": "O Horizontal Pod Autoscaler entra em ação quando a CPU média passa do alvo. O que ele ajusta automaticamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O número de réplicas do Deployment",
                                "isCorrect": true
                            },
                            {
                                "text": "O número de nós do cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "O limit de CPU de cada container",
                                "isCorrect": false
                            },
                            {
                                "text": "A classe de QoS dos Pods",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Vários Pods estão em Pending porque nenhum nó tem recursos livres. Qual componente adiciona novos nós ao cluster?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O Cluster Autoscaler",
                                "isCorrect": true
                            },
                            {
                                "text": "O Horizontal Pod Autoscaler",
                                "isCorrect": false
                            },
                            {
                                "text": "O kube-scheduler",
                                "isCorrect": false
                            },
                            {
                                "text": "O kube-controller-manager",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe aumenta as réplicas de um app, mas as novas ficam em Pending porque os nós estão lotados. O que precisa escalar de fato?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os nós, adicionados pelo Cluster Autoscaler",
                                "isCorrect": true
                            },
                            {
                                "text": "Os Pods, com mais réplicas criadas pelo HPA",
                                "isCorrect": false
                            },
                            {
                                "text": "Os limits, elevando o teto de CPU dos Pods",
                                "isCorrect": false
                            },
                            {
                                "text": "Os Services, criando novos pontos de entrada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um HPA configurado para manter a CPU em 50% não escala e reclama de métrica indisponível. Qual configuração ausente costuma causar isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O request de CPU, base para calcular o uso relativo",
                                "isCorrect": true
                            },
                            {
                                "text": "O limit de CPU, base para calcular o uso relativo",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma réplica mínima a mais no Deployment",
                                "isCorrect": false
                            },
                            {
                                "text": "Um Service do tipo LoadBalancer no app",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sob um pico, o HPA sobe as réplicas de 3 para 8, mas só 5 ficam Running e 3 seguem Pending. Como HPA e Cluster Autoscaler se combinam aqui?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Cluster Autoscaler provisiona nós para os Pods Pending",
                                "isCorrect": true
                            },
                            {
                                "text": "O HPA reduz o alvo de CPU para caber nos nós atuais",
                                "isCorrect": false
                            },
                            {
                                "text": "O Cluster Autoscaler remove réplicas até sobrar espaço",
                                "isCorrect": false
                            },
                            {
                                "text": "O HPA move os Pods Pending para o control plane",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Troubleshooting",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O kit de diagnóstico\n\nQuando algo dá errado, três comandos resolvem a maior parte das investigações:\n\n- **kubectl describe pod**: mostra o estado detalhado do Pod, seus containers, os motivos de reinício e, no rodapé, os eventos ligados a ele. É quase sempre o primeiro lugar a olhar.\n- **kubectl logs**: mostra a saída (stdout e stderr) do container. Para ler o container anterior, que já morreu e reiniciou, use kubectl logs --previous.\n- **kubectl get events**: lista os eventos do namespace em ordem, úteis para ver falhas de agendamento, de puxada de imagem e de reinício.\n\nA lógica é ir do geral para o específico: describe e events dizem o que o Kubernetes está tentando fazer; logs dizem o que a aplicação fez."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estado\",\"O que significa\",\"Onde investigar\"],[\"Pending\",\"Não foi agendado em nenhum nó\",\"describe e events (recursos, taints)\"],[\"ImagePullBackOff\",\"Falha ao baixar a imagem\",\"describe e events (nome, tag, registry)\"],[\"CrashLoopBackOff\",\"Sobe e cai em repetição\",\"logs e logs --previous\"],[\"OOMKilled\",\"Morto por estourar a memória\",\"describe (limits) e logs\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo cada estado de erro\n\n- **Pending**: o Pod foi criado, mas não recebeu nó. Quase sempre é falta de recursos (nenhum nó atende aos requests) ou restrição de agendamento (taint sem toleration, nodeAffinity sem nó compatível). O describe traz a mensagem do scheduler.\n- **ImagePullBackOff**: o kubelet não conseguiu baixar a imagem. Motivos comuns: nome ou tag errados, imagem em registry privado sem credencial, ou tag que não existe mais. O BackOff indica que ele espera cada vez mais entre as tentativas.\n- **CrashLoopBackOff**: o container inicia e termina logo depois, várias vezes seguidas. A causa está na aplicação: configuração, variável ou dependência faltando, comando errado. Os logs, incluindo o --previous, mostram o motivo.\n- **OOMKilled**: o container passou do limit de memória e foi morto. Aparece no describe como o motivo da última terminação. A saída é rever o limit ou o consumo da aplicação."
                    },
                    {
                        "type": "code",
                        "value": "# Primeiro olhar: estado, containers e eventos do Pod\nkubectl describe pod meu-app-123\n\n# Logs do container atual e do que morreu antes dele\nkubectl logs meu-app-123\nkubectl logs meu-app-123 --previous\n\n# Eventos recentes do namespace, do mais novo ao mais antigo\nkubectl get events --sort-by=.lastTimestamp"
                    },
                    {
                        "type": "quote",
                        "value": "Regra de bolso: Pending é agendamento (veja events), ImagePullBackOff é imagem (confira nome e tag), CrashLoopBackOff é a aplicação caindo (veja logs --previous) e OOMKilled é memória estourada (veja o limit no describe)."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um Pod apresenta problema e você quer, de uma vez, ver o estado dos containers, os motivos de reinício e os eventos ligados a ele. Qual comando começa a investigação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "kubectl describe pod",
                                "isCorrect": true
                            },
                            {
                                "text": "kubectl get pods -o wide",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl delete pod",
                                "isCorrect": false
                            },
                            {
                                "text": "kubectl apply -f pod.yaml",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Pod fica em ImagePullBackOff logo após ser criado. O que esse estado indica?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O kubelet não conseguiu baixar a imagem do container",
                                "isCorrect": true
                            },
                            {
                                "text": "O container subiu e caiu várias vezes seguidas",
                                "isCorrect": false
                            },
                            {
                                "text": "O Pod não foi agendado em nenhum nó do cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "O container estourou o limit de memória e morreu",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Pod fica preso em Pending e o kubectl describe mostra uma mensagem do scheduler sobre falta de recursos. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum nó tem CPU ou memória para os requests do Pod",
                                "isCorrect": true
                            },
                            {
                                "text": "A imagem do container não existe no registry informado",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando de entrada da aplicação falha ao iniciar",
                                "isCorrect": false
                            },
                            {
                                "text": "O container passou do limit de memória e foi morto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No kubectl describe, o motivo da última terminação de um container aparece como OOMKilled. Qual ação ataca a causa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Rever o limit de memória ou o consumo real",
                                "isCorrect": true
                            },
                            {
                                "text": "Rever o request de CPU e o alvo do autoscaler",
                                "isCorrect": false
                            },
                            {
                                "text": "Recriar o Service que expõe o Pod na rede externa",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar a tag da imagem usada pelo container",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Pod em CrashLoopBackOff já reiniciou várias vezes. O kubectl logs do container atual vem quase vazio, pois ele acabou de subir. Como ver o erro que derrubou a execução anterior?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Rodar kubectl logs com a flag --previous",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar kubectl logs com a flag --follow",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar kubectl describe no Deployment inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar kubectl get events em kube-system",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Produção: segurança, pacotes e operação",
        "aulas": [
            {
                "titulo": "RBAC",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Autenticação x autorização\n\nToda chamada à API do Kubernetes passa por duas verificações, nesta ordem:\n\n- **Autenticação**: quem é você? Confirma a identidade de quem faz a chamada, seja uma pessoa ou um serviço.\n- **Autorização**: o que você pode fazer? Com a identidade já confirmada, decide se aquela ação é permitida.\n\nEstar autenticado não libera nada sozinho. É a autorização que aprova ou nega cada operação, e no Kubernetes o mecanismo padrão para isso é o RBAC (Role-Based Access Control), o controle de acesso baseado em papéis."
                    },
                    {
                        "type": "text",
                        "value": "## Role e ClusterRole: conjuntos de permissões\n\nUm papel é um conjunto de permissões, e cada permissão combina três elementos:\n\n- **apiGroups**: o grupo de API do recurso (\"\" para o core, \"apps\" para Deployments).\n- **resources**: o tipo de recurso, como pods, deployments ou secrets.\n- **verbs**: a ação liberada, como get, list, watch, create, update ou delete.\n\nEsse conjunto vem em duas formas, que mudam apenas no alcance:\n\n- **Role**: as permissões valem dentro de um namespace.\n- **ClusterRole**: as permissões valem no cluster todo, útil para recursos de escopo de cluster (como nodes) ou para reusar o mesmo papel em vários namespaces."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Objeto\",\"Alcance\",\"Papel\"],[\"Role\",\"Namespace\",\"Define permissões no namespace\"],[\"ClusterRole\",\"Cluster inteiro\",\"Define permissões amplas ou reutilizáveis\"],[\"RoleBinding\",\"Namespace\",\"Liga sujeito a papel no namespace\"],[\"ClusterRoleBinding\",\"Cluster inteiro\",\"Liga sujeito a papel no cluster todo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Bindings e menor privilégio\n\nRole e ClusterRole apenas descrevem permissões; sozinhos não dão acesso a ninguém. Quem faz a ligação com um sujeito (usuário, grupo ou ServiceAccount) são os bindings:\n\n- **RoleBinding**: concede um papel a um sujeito dentro de um namespace.\n- **ClusterRoleBinding**: concede um ClusterRole a um sujeito em todo o cluster.\n\nO guia para desenhar esse acesso é o **princípio do menor privilégio**: conceda só as permissões necessárias para a tarefa, nada além. Prefira Role e RoleBinding em um namespace a um ClusterRoleBinding amplo, que abre o cluster inteiro."
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nmetadata:\n  namespace: loja\n  name: leitor-de-pods\nrules:\n  - apiGroups: [\"\"]          # grupo core\n    resources: [\"pods\"]\n    verbs: [\"get\", \"list\", \"watch\"]\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: RoleBinding\nmetadata:\n  namespace: loja\n  name: bind-leitor\nsubjects:\n  - kind: User\n    name: ana\n    apiGroup: rbac.authorization.k8s.io\nroleRef:\n  kind: Role\n  name: leitor-de-pods\n  apiGroup: rbac.authorization.k8s.io"
                    },
                    {
                        "type": "quote",
                        "value": "Guarde a divisão: Role e ClusterRole dizem o que pode ser feito; RoleBinding e ClusterRoleBinding dizem a quem. Role e RoleBinding têm escopo de namespace, as versões Cluster valem no cluster inteiro. Sempre conceda o mínimo necessário."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma requisição chega à API do Kubernetes já com a identidade do chamador confirmada. Qual etapa decide se aquela ação específica é permitida?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Autorização, que aprova ou nega a operação",
                                "isCorrect": true
                            },
                            {
                                "text": "Autenticação, que confirma quem faz a chamada",
                                "isCorrect": false
                            },
                            {
                                "text": "Agendamento, que escolhe o nó do Pod",
                                "isCorrect": false
                            },
                            {
                                "text": "Reconciliação, que ajusta o estado do cluster",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao estudar RBAC, você precisa dizer o que um Role define. Qual descrição está correta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um conjunto de permissões num namespace",
                                "isCorrect": true
                            },
                            {
                                "text": "A ligação entre um sujeito e suas permissões",
                                "isCorrect": false
                            },
                            {
                                "text": "A identidade que um Pod usa na API",
                                "isCorrect": false
                            },
                            {
                                "text": "A lista de nós onde o Pod pode rodar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa conceder permissão para listar nodes, que são recursos de escopo de cluster. Qual objeto define esse tipo de permissão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ClusterRole, de alcance no cluster inteiro",
                                "isCorrect": true
                            },
                            {
                                "text": "Role, limitada a um único namespace",
                                "isCorrect": false
                            },
                            {
                                "text": "RoleBinding, que atua dentro de um namespace",
                                "isCorrect": false
                            },
                            {
                                "text": "ServiceAccount, a identidade de um Pod",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Role chamado leitor-de-pods já existe no namespace loja, mas a usuária Ana ainda não consegue listar os Pods. O que falta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um RoleBinding ligando Ana ao Role",
                                "isCorrect": true
                            },
                            {
                                "text": "Um segundo Role com os mesmos verbos",
                                "isCorrect": false
                            },
                            {
                                "text": "Um ClusterRole com escopo de cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma nova imagem de container para o Pod",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao revisar permissões, você vê uma conta de aplicação com um ClusterRoleBinding de admin no cluster todo, mas ela só opera no namespace loja. Qual mudança segue o menor privilégio?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Trocar para um Role e RoleBinding no namespace loja",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter o admin do cluster, apenas renomeando a conta",
                                "isCorrect": false
                            },
                            {
                                "text": "Somar um ClusterRoleBinding de leitura à conta atual",
                                "isCorrect": false
                            },
                            {
                                "text": "Recriar a mesma conta em um segundo namespace",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "ServiceAccounts e security context",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## ServiceAccount: a identidade do Pod\n\nPessoas se autenticam na API para rodar kubectl. Mas e o processo dentro de um Pod que precisa falar com a API do Kubernetes? A identidade dele é a **ServiceAccount**.\n\nTodo Pod roda com uma ServiceAccount. Se você não indicar nenhuma, o Pod usa a ServiceAccount chamada default do namespace. O Kubernetes injeta um token dessa conta no Pod, e é com ele que o Pod se autentica na API.\n\nJuntando com o RBAC: você liga a ServiceAccount a um Role via RoleBinding para dar a ela apenas as permissões necessárias. Uma ServiceAccount sem binding quase não faz nada, e é assim que deve ser por padrão."
                    },
                    {
                        "type": "text",
                        "value": "## Security context: como o container roda\n\nEnquanto a ServiceAccount cuida do que o Pod pode fazer na API, o **security context** define como o container roda no nó, do ponto de vista de segurança do sistema operacional. Ele fica no nível do Pod ou do container e controla, entre outros:\n\n- **runAsNonRoot**: impede o container de rodar como root; se a imagem insistir, o Pod falha.\n- **runAsUser**: fixa o UID do processo, por exemplo 1000, um usuário comum.\n- **readOnlyRootFilesystem**: deixa o sistema de arquivos raiz somente leitura.\n- **allowPrivilegeEscalation**: quando false, impede o processo de ganhar mais privilégios que o pai.\n- **capabilities**: adiciona ou remove capacidades do kernel Linux, permitindo tirar tudo que não é preciso."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Campo\",\"O que faz\",\"Boa prática\"],[\"runAsNonRoot\",\"Barra execução como root\",\"true\"],[\"runAsUser\",\"Define o UID do processo\",\"Um UID não-root, como 1000\"],[\"readOnlyRootFilesystem\",\"Deixa a raiz só leitura\",\"true quando possível\"],[\"allowPrivilegeEscalation\",\"Controla ganho de privilégio\",\"false\"],[\"capabilities\",\"Capacidades do kernel\",\"drop de ALL e add do mínimo\"]]"
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: app-segura\nspec:\n  serviceAccountName: app-loja      # identidade na API\n  securityContext:\n    runAsNonRoot: true\n    runAsUser: 1000\n  containers:\n    - name: web\n      image: loja-web:1.4\n      securityContext:\n        readOnlyRootFilesystem: true\n        allowPrivilegeEscalation: false\n        capabilities:\n          drop: [\"ALL\"]"
                    },
                    {
                        "type": "text",
                        "value": "## Pod Security Standards\n\nPara padronizar essas escolhas, o Kubernetes define os **Pod Security Standards**, três níveis de exigência:\n\n- **Privileged**: sem restrições, aberto. Só para cargas de sistema muito específicas.\n- **Baseline**: barra as configurações mais perigosas, mas ainda é permissivo. Um bom mínimo.\n- **Restricted**: o mais rígido; exige coisas como runAsNonRoot e remoção de capabilities.\n\nEsses níveis podem ser aplicados por namespace pelo **Pod Security Admission**, que audita ou rejeita Pods que não atendem ao nível exigido. É a forma nativa de impedir que um Pod inseguro suba sem ninguém perceber."
                    },
                    {
                        "type": "quote",
                        "value": "Separe os papéis: a ServiceAccount é a identidade do Pod na API, autorizada via RBAC; o security context define como o container roda no nó, com usuário não-root, filesystem só leitura e capabilities mínimas. Os Pod Security Standards padronizam esse rigor por namespace."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um processo dentro de um Pod precisa chamar a API do Kubernetes. Qual objeto representa a identidade desse Pod perante a API?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A ServiceAccount do Pod",
                                "isCorrect": true
                            },
                            {
                                "text": "O security context do container",
                                "isCorrect": false
                            },
                            {
                                "text": "O RoleBinding do namespace",
                                "isCorrect": false
                            },
                            {
                                "text": "O kubelet do nó onde ele roda",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma imagem tenta iniciar o processo como root, e o time quer bloquear isso. Qual configuração do security context impede o container de rodar como root?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "runAsNonRoot: true",
                                "isCorrect": true
                            },
                            {
                                "text": "readOnlyRootFilesystem: true",
                                "isCorrect": false
                            },
                            {
                                "text": "allowPrivilegeEscalation: true",
                                "isCorrect": false
                            },
                            {
                                "text": "hostNetwork: true",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Pod foi criado sem indicar nenhuma ServiceAccount no manifesto. O que acontece com a identidade dele?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele usa a ServiceAccount default do namespace",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele fica sem identidade e não chega a subir",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele herda a conta do usuário que aplicou o YAML",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele recebe permissões de admin no cluster",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para reduzir a superfície de ataque, a equipe quer que o container não consiga escrever no próprio sistema de arquivos raiz. Qual ajuste faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "readOnlyRootFilesystem: true",
                                "isCorrect": true
                            },
                            {
                                "text": "runAsUser: 0 no container",
                                "isCorrect": false
                            },
                            {
                                "text": "privileged: true no container",
                                "isCorrect": false
                            },
                            {
                                "text": "allowPrivilegeEscalation: true",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A empresa quer o nível mais rígido dos Pod Security Standards, que exige runAsNonRoot e remoção de capabilities. Qual nível é esse?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Restricted, o mais rígido dos três",
                                "isCorrect": true
                            },
                            {
                                "text": "Baseline, permissivo com barreiras mínimas",
                                "isCorrect": false
                            },
                            {
                                "text": "Privileged, sem restrições aplicadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Enforced, que audita cada Pod do namespace",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Helm",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O gerenciador de pacotes do Kubernetes\n\nAplicar YAML solto funciona bem no começo. O problema aparece quando a mesma aplicação precisa subir em dev, homologação e produção, cada ambiente com pequenas diferenças: o número de réplicas, a tag da imagem, o domínio. Copiar e editar vários arquivos por ambiente vira fonte de erro.\n\nO **Helm** é o gerenciador de pacotes do Kubernetes, o equivalente ao apt ou ao npm para o cluster. Em vez de um monte de YAML repetido, você empacota a aplicação uma vez e a instala parametrizada em cada ambiente."
                    },
                    {
                        "type": "text",
                        "value": "## Chart, values e release\n\nTrês conceitos sustentam o Helm:\n\n- **Chart**: o pacote. Reúne os manifests da aplicação como templates, com trechos variáveis no lugar de valores fixos.\n- **Values**: a parametrização. Um arquivo de values preenche os trechos variáveis do chart, como réplicas, imagem e domínio. O mesmo chart gera manifests diferentes só trocando os values.\n- **Release**: uma instalação. Cada vez que você instala um chart no cluster, nasce um release com nome próprio. O mesmo chart pode virar vários releases, um por ambiente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conceito\",\"O que é\",\"Analogia\"],[\"Chart\",\"Pacote de manifests templatizados\",\"O pacote instalável\"],[\"Values\",\"Valores que preenchem o template\",\"As opções de instalação\"],[\"Release\",\"Uma instalação do chart no cluster\",\"O app já instalado\"],[\"Repository\",\"Coleção de charts para baixar\",\"O repositório de pacotes\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# Instalar um chart, criando um release chamado loja\nhelm install loja ./chart-loja -f values-prod.yaml\n\n# Ver os releases instalados\nhelm list\n\n# Subir uma nova versão do mesmo release\nhelm upgrade loja ./chart-loja -f values-prod.yaml\n\n# Voltar para a revisão anterior se algo quebrar\nhelm rollback loja 1"
                    },
                    {
                        "type": "text",
                        "value": "## Por que Helm, upgrade e rollback\n\nHelm resolve o que o YAML solto não dá conta:\n\n- **Reuso**: um chart, vários ambientes, mudando só os values.\n- **Versionamento**: cada upgrade cria uma revisão do release, com histórico.\n- **Rollback**: se um upgrade quebra a aplicação, o helm rollback devolve o release a uma revisão anterior em um comando, sem você reconstruir o YAML antigo na mão.\n\nEsse controle de revisões é a grande vantagem operacional. Você trata a aplicação inteira como uma unidade que sobe, atualiza e volta atrás de forma previsível."
                    },
                    {
                        "type": "quote",
                        "value": "Fixe os três termos: o chart é o pacote de manifests templatizados, os values parametrizam esse pacote e o release é uma instalação nomeada no cluster. Cada upgrade vira uma revisão, e o rollback devolve o release a uma revisão anterior em um comando."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em uma conversa sobre ferramentas, alguém pergunta o que é o Helm no ecossistema Kubernetes. Qual resposta está correta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O gerenciador de pacotes do cluster",
                                "isCorrect": true
                            },
                            {
                                "text": "O agendador de Pods nos nós",
                                "isCorrect": false
                            },
                            {
                                "text": "O runtime que executa os containers",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco que guarda o estado do cluster",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao estudar Helm, você precisa dizer o que é um chart. Qual descrição está certa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O pacote de manifests templatizados",
                                "isCorrect": true
                            },
                            {
                                "text": "A instalação de um pacote no cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo de credenciais do cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "O log de execução da aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A mesma aplicação precisa subir com 2 réplicas em dev e 6 em produção, usando o mesmo chart. Onde essa diferença é definida?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nos values de cada ambiente",
                                "isCorrect": true
                            },
                            {
                                "text": "No nome do release instalado",
                                "isCorrect": false
                            },
                            {
                                "text": "No repositório onde o chart mora",
                                "isCorrect": false
                            },
                            {
                                "text": "No runtime de container do nó",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você instala o mesmo chart duas vezes, uma para o time A e outra para o time B, com nomes diferentes. O que representa cada instalação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um release distinto do chart",
                                "isCorrect": true
                            },
                            {
                                "text": "Um novo chart independente",
                                "isCorrect": false
                            },
                            {
                                "text": "Um values compartilhado entre elas",
                                "isCorrect": false
                            },
                            {
                                "text": "Um repositório para cada time",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um helm upgrade colocou no ar uma versão com bug e a aplicação caiu. Qual a forma mais direta de voltar ao estado anterior?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "helm rollback para a revisão que funcionava",
                                "isCorrect": true
                            },
                            {
                                "text": "helm install gerando outro release do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Reaplicar o YAML antigo manualmente com kubectl",
                                "isCorrect": false
                            },
                            {
                                "text": "helm uninstall e depois instalar de novo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Observabilidade e GitOps (conceito)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Observabilidade: enxergar o cluster por dentro\n\nRodar aplicações em produção sem observá-las é operar no escuro. Observabilidade é a capacidade de entender o que acontece dentro do cluster a partir do que ele emite, e se apoia em dois pilares principais:\n\n- **Métricas**: números ao longo do tempo, como uso de CPU, memória, latência e taxa de erros. Servem para gráficos, alertas e tendências.\n- **Logs**: as linhas que as aplicações escrevem, úteis para investigar um caso específico depois que algo deu errado.\n\nMétricas apontam que algo está estranho; logs ajudam a descobrir por quê."
                    },
                    {
                        "type": "text",
                        "value": "## As ferramentas mais comuns\n\nO padrão de mercado para métricas é o **Prometheus**, que coleta (faz scraping) as métricas expostas pelas aplicações e as guarda como séries temporais. Para visualizar, o **Grafana** monta painéis e dashboards sobre esses dados.\n\nJá os logs, que num cluster ficam espalhados por muitos Pods de vida curta, precisam ser reunidos em um lugar só. Essa **agregação de logs** é feita por pilhas como Loki, Elasticsearch ou equivalentes, que centralizam e deixam buscar as linhas de todos os Pods."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal\",\"O que responde\",\"Ferramenta típica\"],[\"Métricas\",\"Está lento ou com erro?\",\"Prometheus\"],[\"Logs\",\"Por que isso aconteceu?\",\"Agregador como Loki\"],[\"Dashboards\",\"Como está a saúde geral?\",\"Grafana\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## GitOps: o Git como fonte da verdade\n\nNo GitOps, o estado desejado do cluster vive em um repositório Git: os manifests ou charts versionados descrevem tudo que deveria existir. Uma ferramenta instalada no cluster, como **Argo CD** ou **Flux**, observa esse repositório e reconcilia o cluster para que ele bata com o que está no Git.\n\nRepare que é o mesmo laço de reconciliação do Kubernetes, agora estendido até o Git. Você não roda kubectl apply na mão: você faz um commit, e a ferramenta aplica a mudança. O cluster segue o repositório."
                    },
                    {
                        "type": "text",
                        "value": "## Por que GitOps\n\nColocar o Git no centro traz ganhos concretos:\n\n- **Auditoria**: cada mudança é um commit, com autor, data e motivo. O histórico do Git vira o histórico do cluster.\n- **Rollback**: voltar atrás é um git revert. Revertido o commit, a ferramenta reconcilia o cluster para o estado anterior.\n- **Consistência**: o que está no Git é o que está rodando. Some o desvio de quem aplicou algo direto no cluster e esqueceu de registrar."
                    },
                    {
                        "type": "quote",
                        "value": "Em GitOps, o repositório Git é a fonte da verdade: o estado desejado vive no Git e uma ferramenta como Argo CD ou Flux reconcilia o cluster com o repositório. Auditoria vira histórico de commits e rollback vira git revert."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para acompanhar CPU, memória e latência ao longo do tempo, com alertas, que tipo de sinal a equipe deve coletar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Métricas, valores medidos no tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "Logs, as linhas escritas pela aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Charts, empacotados pelo Helm",
                                "isCorrect": false
                            },
                            {
                                "text": "Values, que parametrizam a aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No stack de observabilidade, qual ferramenta é conhecida por coletar métricas via scraping e guardá-las como séries temporais?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Prometheus",
                                "isCorrect": true
                            },
                            {
                                "text": "Grafana",
                                "isCorrect": false
                            },
                            {
                                "text": "Elasticsearch",
                                "isCorrect": false
                            },
                            {
                                "text": "OpenTelemetry",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As métricas já estão no Prometheus, mas a equipe quer painéis visuais para acompanhar a saúde do sistema. Qual ferramenta cumpre esse papel?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Grafana, para dashboards",
                                "isCorrect": true
                            },
                            {
                                "text": "etcd, para o estado do cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "kube-proxy, para a rede",
                                "isCorrect": false
                            },
                            {
                                "text": "containerd, para rodar containers",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um modelo GitOps, onde fica o estado desejado do cluster?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Em um repositório Git versionado",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas na memória do kube-scheduler",
                                "isCorrect": false
                            },
                            {
                                "text": "No cache local da CLI kubectl",
                                "isCorrect": false
                            },
                            {
                                "text": "No sistema de arquivos de cada Pod",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de adotar GitOps com Argo CD, um deploy problemático precisa ser desfeito. Qual ação reverte o cluster ao estado anterior?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um git revert do commit problemático",
                                "isCorrect": true
                            },
                            {
                                "text": "Um kubectl edit direto no Pod afetado",
                                "isCorrect": false
                            },
                            {
                                "text": "Um restart do kube-apiserver no control plane",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma remoção do repositório Git da aplicação",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Boas práticas de produção e fechamento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Checklist de produção\n\nLevar uma aplicação ao Kubernetes de produção é mais do que fazer o Pod subir. Alguns cuidados separam um deploy de estudo de um deploy pronto para carga real:\n\n- **Probes**: liveness, readiness e startup configuradas, para o cluster saber quando reiniciar e quando enviar tráfego.\n- **Requests e limits**: cada container declara quanto pede e quanto pode usar de CPU e memória.\n- **RBAC restrito**: contas e usuários com o mínimo de permissões, seguindo o menor privilégio.\n- **Rollout com estratégia**: atualizações com RollingUpdate e limites de indisponibilidade.\n- **Secrets protegidos**: dados sensíveis em Secrets, com acesso controlado, nunca fixos na imagem.\n- **Saúde e observabilidade**: métricas, logs e alertas no ar antes de você precisar deles."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Item\",\"Por que importa\"],[\"Probes\",\"Reinicia o que travou e só envia tráfego ao que está pronto\"],[\"Requests e limits\",\"Garante recursos e evita um vizinho abusando\"],[\"RBAC restrito\",\"Reduz o estrago de uma conta vazada\"],[\"Estratégia de rollout\",\"Atualiza sem derrubar o serviço\"],[\"Secrets protegidos\",\"Evita expor senhas e tokens\"],[\"Observabilidade\",\"Ajuda a achar e resolver problemas rápido\"]]"
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: loja-web\nspec:\n  strategy:\n    type: RollingUpdate         # atualiza sem derrubar tudo\n  template:\n    spec:\n      containers:\n        - name: web\n          image: loja-web:1.4\n          resources:\n            requests: { cpu: \"100m\", memory: \"128Mi\" }\n            limits: { cpu: \"500m\", memory: \"256Mi\" }\n          readinessProbe:\n            httpGet: { path: /health, port: 8080 }"
                    },
                    {
                        "type": "text",
                        "value": "## O caminho que você percorreu\n\nVale olhar para trás e ver como as peças se encaixam. A trilha começou no porquê do Kubernetes e na arquitetura do cluster, com control plane e nós. Passou pelos objetos de carga, como Pods e Deployments, e por como expor e conectar aplicações, com Services e Ingress. Cobriu configuração e dados, com ConfigMaps, Secrets e Volumes, além do ajuste de recursos e escala. Agora, neste módulo, fechou com o que torna tudo isso seguro e operável em produção.\n\nDe um container solto a um cluster observável e seguro: esse foi o percurso."
                    },
                    {
                        "type": "text",
                        "value": "## Próximos passos\n\nKubernetes é vasto, e daqui dá para aprofundar em várias direções, por ora em nível de conceito:\n\n- **Helm**: empacotar e versionar as aplicações como charts reutilizáveis.\n- **GitOps**: operar o cluster a partir do Git, com Argo CD ou Flux.\n- **Service mesh**: camadas como Istio ou Linkerd para tráfego, segurança e telemetria entre serviços, sem tocar no código.\n- **Certificações**: a CKAD, com foco em quem desenvolve e implanta apps, e a CKA, com foco em quem administra o cluster, são as mais reconhecidas."
                    },
                    {
                        "type": "quote",
                        "value": "Um deploy de produção não é só o Pod no ar: é probes, requests e limits, RBAC restrito, rollout com estratégia, Secrets protegidos e observabilidade. Se um desses falta, a aplicação ainda não está pronta para carga real."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em produção, qual é o papel da readiness probe de um container?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Sinalizar quando o Pod pode receber tráfego",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir o UID com que o processo roda",
                                "isCorrect": false
                            },
                            {
                                "text": "Empacotar a aplicação em um chart do Helm",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar o estado desejado no repositório Git",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para evitar que um container consuma toda a CPU do nó e prejudique os vizinhos, o que você configura?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Requests e limits de recursos",
                                "isCorrect": true
                            },
                            {
                                "text": "Um segundo Ingress para a aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Um ClusterRoleBinding de admin",
                                "isCorrect": false
                            },
                            {
                                "text": "Um repositório GitOps dedicado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação precisa de uma senha de banco em produção. Qual a prática correta para esse dado sensível?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Guardar em um Secret, com acesso controlado",
                                "isCorrect": true
                            },
                            {
                                "text": "Fixar a senha direto na imagem do container",
                                "isCorrect": false
                            },
                            {
                                "text": "Colocar a senha no nome do Deployment",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixar a senha em um ConfigMap público",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time quer atualizar a versão da aplicação sem tirar o serviço do ar durante o processo. Qual escolha atende a isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Adotar RollingUpdate como estratégia",
                                "isCorrect": true
                            },
                            {
                                "text": "Deletar o Deployment e criar de novo",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar tudo como um único Pod sem réplicas",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover as probes durante a atualização",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa que desenvolve e implanta aplicações quer uma certificação Kubernetes alinhada a esse perfil. Qual costuma ser a indicada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A CKAD, voltada a quem desenvolve e implanta",
                                "isCorrect": true
                            },
                            {
                                "text": "A CKA, voltada a quem administra o cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "A CKS, uma prova básica de containers",
                                "isCorrect": false
                            },
                            {
                                "text": "A CNCF, uma certificação de redes do cluster",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    }
] as unknown as Modulo[];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO })
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
    console.log(
        "Seed concluído: " + MODULOS.length + " módulos, " + totalAulas + " aulas, " + totalQuestoes + " questões.",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
