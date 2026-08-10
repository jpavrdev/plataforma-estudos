import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Sistemas Operacionais e Concorrência, quinta trilha do
 * roadmap de C++ e Baixo Nível.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento do
 * cenário; as cartas guardam os nomes próprios, as listas fechadas e as
 * armadilhas que a aula enuncia de passagem.
 */
export const sistemasOperacionaisEConcorrencia: CartasDaTrilha = {
    trilha: "Sistemas Operacionais e Concorrência",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que nome o PCB recebe dentro do Linux?",
                        verso: "A task_struct, com PID, estado e registradores.",
                    },
                    {
                        frente: "Quem impõe o isolamento entre os processos?",
                        verso: "O kernel, com ajuda do hardware, não a boa vontade.",
                    },
                    {
                        frente: "Como o kernel sustenta a ilusão de CPU exclusiva?",
                        verso: "Revezando em fatias de milissegundos, com troca de contexto.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que papel o exec cumpre depois do fork?",
                        verso: "Trocar a imagem do processo pelo programa novo.",
                    },
                    {
                        frente: "Que sequência o shell executa ao rodar um comando?",
                        verso: "Fork do próprio shell, exec no filho e wait no pai.",
                    },
                    {
                        frente: "Que faixa de código de saída indica erro?",
                        verso: "De 1 a 255; o zero é o único que diz sucesso.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que limite padrão a pilha tem no Linux?",
                        verso: "Uns 8 MB, ajustáveis pelo ulimit do sistema.",
                    },
                    {
                        frente: "Por que um ponteiro não atravessa dois processos?",
                        verso: "O endereço é virtual e só vale dentro daquele mapa.",
                    },
                    {
                        frente: "Que camada garante o erro claro ao violar uma região?",
                        verso: "A permissão por região, checada a cada acesso.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que risco um handler de sinal corre ao chamar malloc?",
                        verso: "Ele pode ter interrompido a própria função e corromper.",
                    },
                    {
                        frente: "Que dois sinais não podem ser tratados de jeito nenhum?",
                        verso: "O de matar e o de parar, entregues direto ao kernel.",
                    },
                    {
                        frente: "Que sujeira o encerramento imediato deixa para trás?",
                        verso: "Locks, arquivos temporários e transações pela metade.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três perguntas decidem o mecanismo de IPC?",
                        verso: "Fluxo ou mensagem, o volume e quem precisa falar com quem.",
                    },
                    {
                        frente: "Que exigência a FIFO remove em relação ao pipe?",
                        verso: "O parentesco: processos sem laço também se conectam.",
                    },
                    {
                        frente: "Que exemplo real usa memória compartilhada de fato?",
                        verso: "O PostgreSQL, com o cache de páginas entre os backends.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que custo separa criar thread de criar processo?",
                        verso: "Dezenas de microssegundos contra centenas ou milissegundos.",
                    },
                    {
                        frente: "Que exemplo famoso escolhe processo pelo isolamento?",
                        verso: "O Chrome, com cada aba num processo separado.",
                    },
                    {
                        frente: "Que propriedade torna a thread rápida e perigosa?",
                        verso: "A memória compartilhada, vista dos dois lados.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que escolha é padrão entre join e detach?",
                        verso: "O join; a thread solta não pode mais ser esperada.",
                    },
                    {
                        frente: "O que o construtor de thread faz com os argumentos?",
                        verso: "Copia por padrão, para cada thread ter a própria cópia.",
                    },
                    {
                        frente: "Que erro clássico a lambda entregue a uma thread comete?",
                        verso: "Capturar local por referência e sobreviver ao escopo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que resultado o experimento das duas threads espera?",
                        verso: "Dois milhões, e entrega bem menos na prática.",
                    },
                    {
                        frente: "Que três passos o incremento esconde no hardware?",
                        verso: "Ler da memória, somar no registrador e escrever de volta.",
                    },
                    {
                        frente: "Por que o programa com corrida passa nos testes?",
                        verso: "Com pouca carga o entrelaçamento fatal pode não ocorrer.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o mutex realmente protege, afinal?",
                        verso: "Um trecho de código; a ligação com o dado é convenção.",
                    },
                    {
                        frente: "Que caminhos o lock manual deixa descoberto?",
                        verso: "O return antecipado e a exceção no meio da seção.",
                    },
                    {
                        frente: "Que troca a granularidade do cadeado impõe?",
                        verso: "Grosso é simples e serializa; fino é rápido e arriscado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que nome as quatro condições do deadlock recebem?",
                        verso: "As condições de Coffman, que precisam valer juntas.",
                    },
                    {
                        frente: "Que técnica de prevenção ataca a espera circular?",
                        verso: "Uma ordem global de cadeados, seguida em todo o código.",
                    },
                    {
                        frente: "Que ferramenta diagnostica um deadlock em produção?",
                        verso: "O gdb anexado, ou as pilhas coletadas por fora.",
                    },
                ],
            },
        },
    },
};
