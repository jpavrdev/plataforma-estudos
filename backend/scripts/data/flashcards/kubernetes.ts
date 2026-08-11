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
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que duas formas injetam um ConfigMap no container?",
                        verso: "Como variáveis de ambiente ou como arquivos montados em volume.",
                    },
                    {
                        frente: "Por que a variável de ambiente não acompanha a mudança?",
                        verso: "Ela é lida na criação do Pod, e o Pod já rodando não relê.",
                    },
                    {
                        frente: "Que forma de injeção serve a um arquivo de config inteiro?",
                        verso: "O volume, em que cada chave vira um arquivo no diretório.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que codificação o Secret usa por padrão, e o que ela não é?",
                        verso: "Base64, que é reversível e não é criptografia nenhuma.",
                    },
                    {
                        frente: "Que quatro práticas protegem um Secret de verdade?",
                        verso: "RBAC restrito, cifra em repouso, não commitar e preferir Secret.",
                    },
                    {
                        frente: "O que significa ligar a criptografia em repouso?",
                        verso: "O etcd deixa de guardar o valor do Secret em claro no disco.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que nível o volume é declarado, e onde é montado?",
                        verso: "Declarado no Pod e montado em cada container que precisar.",
                    },
                    {
                        frente: "Por que o volume sobrevive ao restart do container?",
                        verso: "Ele pertence ao Pod, e não ao container que reiniciou.",
                    },
                    {
                        frente: "Que dois problemas o hostPath traz?",
                        verso: "Prende o Pod ao nó e abre uma porta de segurança.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que nome tem o casamento entre um PVC e um PV compatível?",
                        verso: "Binding, feito pelo Kubernetes ao aparecer o pedido.",
                    },
                    {
                        frente: "O que o Pod referencia, e o que ele nunca aponta direto?",
                        verso: "Referencia o PVC; nunca aponta o PV nem o disco físico.",
                    },
                    {
                        frente: "O que a StorageClass descreve, e o que ela habilita?",
                        verso: "O tipo de storage; ela habilita o provisionamento dinâmico.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que ordem o StatefulSet sobe e derruba os Pods?",
                        verso: "Sobe em ordem crescente e remove na ordem inversa.",
                    },
                    {
                        frente: "Que campo dá um volume durável para cada réplica?",
                        verso: "O volumeClaimTemplates, que gera um PVC por índice.",
                    },
                    {
                        frente: "Que Service dá endereço próprio a cada Pod do conjunto?",
                        verso: "O headless, que garante DNS estável por réplica.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que três formas de checagem qualquer probe pode usar?",
                        verso: "httpGet, tcpSocket e exec rodando um comando dentro.",
                    },
                    {
                        frente: "Que faixa de resposta faz um httpGet passar?",
                        verso: "A de 2xx ou 3xx; fora dela conta como falha.",
                    },
                    {
                        frente: "Para que serve a startup probe numa aplicação lenta?",
                        verso: "Segurar as outras duas até a aplicação terminar de iniciar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Em que unidades CPU e memória são medidas?",
                        verso: "CPU em cores ou milicores; memória em bytes, com Mi e Gi.",
                    },
                    {
                        frente: "Que diferença de natureza separa memória de CPU no limite?",
                        verso: "Memória é incompressível e mata; CPU é compressível e atrasa.",
                    },
                    {
                        frente: "Que prática comum evita surpresa de estouro de memória?",
                        verso: "Igualar o request e o limit de memória no container.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que duas etapas o scheduler executa para escolher o nó?",
                        verso: "Filtragem, que descarta, e pontuação, que escolhe a maior nota.",
                    },
                    {
                        frente: "Que diferença separa tolerar de atrair, no agendamento?",
                        verso: "Tolerar é permissão para o nó com taint; a afinidade atrai.",
                    },
                    {
                        frente: "Como um Pod se qualifica como Burstable?",
                        verso: "Tem request em algum container, mas não chega a Guaranteed.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que métricas o HPA aceita, além de CPU e memória?",
                        verso: "Customizadas, como requisições por segundo da aplicação.",
                    },
                    {
                        frente: "Quando o Cluster Autoscaler remove um nó?",
                        verso: "Quando ele fica ocioso e seus Pods cabem em outros nós.",
                    },
                    {
                        frente: "Como HPA e Cluster Autoscaler trabalham juntos?",
                        verso: "O HPA pede réplicas, elas ficam pendentes e o outro cria o nó.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três comandos formam o kit de diagnóstico?",
                        verso: "O describe, o logs com a saída anterior, e o get events.",
                    },
                    {
                        frente: "Que lógica de investigação a aula recomenda?",
                        verso: "Do geral ao específico: describe e events antes dos logs.",
                    },
                    {
                        frente: "O que a palavra BackOff indica nos estados de erro?",
                        verso: "Que o kubelet espera cada vez mais entre as tentativas.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que três elementos toda permissão de RBAC combina?",
                        verso: "O apiGroups, os resources e os verbs liberados.",
                    },
                    {
                        frente: "Que sujeitos um binding pode ligar a um papel?",
                        verso: "Usuário, grupo ou ServiceAccount do cluster.",
                    },
                    {
                        frente: "O que um Role sozinho concede a alguém?",
                        verso: "Nada: sem um binding ele só descreve permissões.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que ServiceAccount um Pod usa quando nenhuma é indicada?",
                        verso: "A chamada default, do namespace onde ele roda.",
                    },
                    {
                        frente: "Que três níveis os Pod Security Standards definem?",
                        verso: "Privileged, sem restrição, Baseline e o rígido Restricted.",
                    },
                    {
                        frente: "Que componente aplica esses níveis por namespace?",
                        verso: "O Pod Security Admission, que audita ou rejeita o Pod.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que quatro conceitos sustentam o Helm?",
                        verso: "Chart, values, release e o repositório de charts.",
                    },
                    {
                        frente: "Quantos releases um mesmo chart pode gerar?",
                        verso: "Vários, um por ambiente, mudando só os values.",
                    },
                    {
                        frente: "O que cada upgrade de um release cria?",
                        verso: "Uma revisão, que o rollback consegue devolver depois.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que divisão de trabalho separa métrica de log?",
                        verso: "A métrica aponta que algo está estranho; o log diz por quê.",
                    },
                    {
                        frente: "Por que os logs de um cluster precisam ser agregados?",
                        verso: "Ficam espalhados por muitos Pods de vida curta.",
                    },
                    {
                        frente: "Que duas ferramentas fazem a reconciliação do GitOps?",
                        verso: "O Argo CD e o Flux, observando o repositório Git.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que seis itens formam o checklist de produção?",
                        verso: "Probes, recursos, RBAC, estratégia de rollout, Secrets e observação.",
                    },
                    {
                        frente: "Que camada cuida de tráfego e telemetria sem tocar no código?",
                        verso: "O service mesh, como o Istio ou o Linkerd.",
                    },
                    {
                        frente: "Que duas certificações a aula cita, e o foco de cada uma?",
                        verso: "A CKAD, para quem desenvolve, e a CKA, para quem administra.",
                    },
                ],
            },
        },
    },
};
