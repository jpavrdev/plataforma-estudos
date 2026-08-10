import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Kubernetes, quinta trilha do roadmap de DevOps.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a escolha no
 * cenário; as cartas ficam com as listas fechadas de componente, os nomes de
 * campo e as regras que a aula enuncia de passagem.
 */
export const kubernetes: CartasDaTrilha = {
    trilha: "Kubernetes",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Onde o Kubernetes nasceu, e quem o mantém hoje?",
                        verso: "Nasceu no Google e hoje é mantido pela CNCF.",
                    },
                    {
                        frente: "Que cinco coisas o Kubernetes automatiza?",
                        verso: "Agendamento, auto-recuperação, escala, rede e atualização.",
                    },
                    {
                        frente: "Por que a sigla K8s substitui o nome inteiro?",
                        verso: "Ela conta as oito letras entre o K e o s de Kubernetes.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que papéis os nós de um cluster assumem?",
                        verso: "Control plane, que decide, e worker, que executa as cargas.",
                    },
                    {
                        frente: "Por que o control plane é replicado em produção?",
                        verso: "Para não existir ponto único de falha no cluster.",
                    },
                    {
                        frente: "O que acontece com os Pods quando um nó cai?",
                        verso: "O Kubernetes remaneja para outros nós que tenham espaço.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que quatro componentes formam o control plane?",
                        verso: "O API server, o etcd, o scheduler e o controller-manager.",
                    },
                    {
                        frente: "Que três componentes todo nó roda?",
                        verso: "O kubelet, o kube-proxy e o container runtime.",
                    },
                    {
                        frente: "Que runtimes de container o Kubernetes usa hoje?",
                        verso: "O containerd e o CRI-O; o Docker saiu do uso direto.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três listas o kubeconfig organiza?",
                        verso: "Clusters, users e contexts que combinam os dois.",
                    },
                    {
                        frente: "O que o context ativo decide, na prática?",
                        verso: "Para qual cluster e namespace os comandos vão.",
                    },
                    {
                        frente: "Que comando roda algo dentro de um container?",
                        verso: "O kubectl exec, útil para inspecionar por dentro.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que quatro campos de topo todo manifesto tem?",
                        verso: "apiVersion, kind, metadata e spec com o estado desejado.",
                    },
                    {
                        frente: "De que o self-healing é consequência direta?",
                        verso: "Do laço de reconciliação, que sempre iguala os dois estados.",
                    },
                    {
                        frente: "Que vantagem o declarativo tem com controle de versão?",
                        verso: "O YAML é versionado no Git; o comando imperativo é pontual.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que contexto próprio o cluster dá a cada Pod?",
                        verso: "Um endereço de rede, armazenamento e como os containers rodam.",
                    },
                    {
                        frente: "Que espaço os containers de um Pod precisam combinar?",
                        verso: "O de portas, que é único e disputado entre eles.",
                    },
                    {
                        frente: "Onde os containers de um mesmo Pod são agendados?",
                        verso: "Sempre no mesmo nó, subindo e descendo como conjunto.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que campo resume o momento do ciclo de vida do Pod?",
                        verso: "O status.phase, um retrato de alto nível em uma palavra.",
                    },
                    {
                        frente: "Que três valores o restartPolicy aceita?",
                        verso: "Always, que é o padrão, OnFailure e Never.",
                    },
                    {
                        frente: "O que muda quando um Pod é recriado?",
                        verso: "Ele ganha um nome e um IP novos, então não se depende deles.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que ordem vários init containers rodam?",
                        verso: "Em sequência, um de cada vez, na ordem declarada.",
                    },
                    {
                        frente: "Como o Kubernetes declara um sidecar nativo hoje?",
                        verso: "Como init container com o restartPolicy sempre ligado.",
                    },
                    {
                        frente: "Que três exemplos de sidecar a aula cita?",
                        verso: "Coletor de log, proxy de service mesh e sincronizador de arquivo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que dois tipos de selector existem sobre labels?",
                        verso: "Por igualdade e por conjunto, com a cláusula de pertencer.",
                    },
                    {
                        frente: "O que acontece se a label do Pod não casa com o selector?",
                        verso: "O controller não o gerencia e o Service não manda tráfego.",
                    },
                    {
                        frente: "Que diferença de tamanho separa label de annotation?",
                        verso: "A label é curta pra filtrar; a annotation aceita valor maior.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que recursos ficam fora de qualquer namespace?",
                        verso: "Nodes, PersistentVolumes, StorageClass e os próprios namespaces.",
                    },
                    {
                        frente: "Qual é a diferença entre ResourceQuota e LimitRange?",
                        verso: "A quota limita o total; o limit range define valor por Pod.",
                    },
                    {
                        frente: "Que isolamento o namespace não entrega sozinho?",
                        verso: "O de rede: o tráfego entre eles só para com NetworkPolicy.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que o ReplicaSet faz quando sobra Pod além da conta?",
                        verso: "Remove o excedente até bater o número desejado.",
                    },
                    {
                        frente: "Onde fica gravado o vínculo real entre Pod e ReplicaSet?",
                        verso: "No ownerReferences de cada Pod criado.",
                    },
                    {
                        frente: "Que capacidade falta ao ReplicaSet, e quem a traz?",
                        verso: "Rollout com histórico; o Deployment é quem entrega isso.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que mudança gera uma revisão nova no Deployment?",
                        verso: "Só a do template do Pod; mexer nas réplicas não gera.",
                    },
                    {
                        frente: "Quantas revisões o Deployment guarda por padrão?",
                        verso: "Dez, controladas pelo revisionHistoryLimit.",
                    },
                    {
                        frente: "O que acontece com os ReplicaSets antigos após um rollout?",
                        verso: "Ficam guardados, escalados a zero, para permitir voltar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que valores padrão maxSurge e maxUnavailable têm?",
                        verso: "Vinte e cinco por cento cada um, no RollingUpdate.",
                    },
                    {
                        frente: "Por que maxSurge e maxUnavailable não podem ser zero juntos?",
                        verso: "O rollout não teria como avançar sem folga em nenhum lado.",
                    },
                    {
                        frente: "Como cada um dos dois arredonda quando é porcentagem?",
                        verso: "O maxSurge para cima e o maxUnavailable para baixo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que a escala declarativa vence a imperativa em produção?",
                        verso: "O manifesto é a fonte da verdade e o apply desfaz o scale.",
                    },
                    {
                        frente: "De que componente o HPA depende para CPU e memória?",
                        verso: "Do Metrics Server instalado no cluster.",
                    },
                    {
                        frente: "Sobre qual valor o HPA calcula a utilização de CPU?",
                        verso: "Sobre o requests do container, não o limite nem o nó.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três campos ajustam o comportamento de um Job?",
                        verso: "completions, parallelism e o backoffLimit de retentativas.",
                    },
                    {
                        frente: "Quantas retentativas um Job faz por padrão?",
                        verso: "Seis, definidas pelo backoffLimit.",
                    },
                    {
                        frente: "Que três valores o concurrencyPolicy do CronJob aceita?",
                        verso: "Allow para sobrepor, Forbid para pular e Replace para trocar.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que plugin implementa a rede plana do cluster?",
                        verso: "O CNI, como o Calico, o Cilium ou o Flannel.",
                    },
                    {
                        frente: "Que três regras o modelo de rede garante?",
                        verso: "Um IP por Pod, comunicação sem NAT e independência do nó.",
                    },
                    {
                        frente: "Por que nunca se guarda o IP de um Pod em configuração?",
                        verso: "Ele muda sem aviso quando o Pod é recriado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Em que objeto o cluster mantém a lista de Pods do Service?",
                        verso: "Em Endpoints, ou EndpointSlice, sempre atualizado.",
                    },
                    {
                        frente: "Quem faz o balanceamento entre os Pods de um Service?",
                        verso: "O kube-proxy em cada nó, perto de um rodízio.",
                    },
                    {
                        frente: "O que indica um Service com a lista de Endpoints vazia?",
                        verso: "O selector não casou com nenhuma label de Pod.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como os três tipos de Service se relacionam?",
                        verso: "Em camadas: o LoadBalancer contém NodePort, que contém ClusterIP.",
                    },
                    {
                        frente: "Por que o NodePort responde por qualquer nó do cluster?",
                        verso: "A porta abre em todos, mesmo sem Pod naquele nó.",
                    },
                    {
                        frente: "O que acontece com LoadBalancer num cluster sem nuvem?",
                        verso: "O IP externo fica pendente, a menos que exista algo como MetalLB.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que controladores conhecidos executam as regras de Ingress?",
                        verso: "O NGINX Ingress, o Traefik e o HAProxy, entre outros.",
                    },
                    {
                        frente: "O que o Ingress enxerga que um Service comum não vê?",
                        verso: "Host, caminho e cabeçalho, porque trabalha na camada 7.",
                    },
                    {
                        frente: "De onde o Ingress tira o certificado para terminar o TLS?",
                        verso: "De um Secret que guarda o certificado e a chave.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que sufixo forma o domínio padrão de um cluster?",
                        verso: "O svc.cluster.local, no fim do nome completo.",
                    },
                    {
                        frente: "Quando o nome DNS de um Service é registrado?",
                        verso: "Automaticamente, assim que o Service é criado.",
                    },
                    {
                        frente: "Que três formas de nome resolvem um Service?",
                        verso: "O nome curto, o nome com namespace e o nome completo.",
                    },
                ],
            },
        },
    },
};
