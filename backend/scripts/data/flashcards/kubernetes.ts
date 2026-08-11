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
    },
};
