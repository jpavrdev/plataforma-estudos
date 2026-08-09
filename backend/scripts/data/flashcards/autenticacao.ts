import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Autenticação, quinta trilha do roadmap de Back-end.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento de
 * cenário e a leitura de código; as cartas ficam com as definições, os nomes
 * próprios e os números de referência que sustentam esses julgamentos.
 */
export const autenticacao: CartasDaTrilha = {
    trilha: "Autenticação",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que falha aparece quando a autenticação quebra?",
                        verso: "Alguém consegue entrar se passando por outra pessoa.",
                    },
                    {
                        frente: "Em que ordem autenticação e autorização acontecem?",
                        verso: "Autenticação primeiro; a autorização só depois de saber quem é.",
                    },
                    {
                        frente: "Que dois tipos de falha nascem de misturar os dois conceitos?",
                        verso: "Autenticado podendo tudo, ou permissão checada sobre identidade fraca.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quais são os três passos de um login?",
                        verso: "Identificação, autenticação e autorização, nessa ordem.",
                    },
                    {
                        frente: "Qual é o risco próprio do fator biométrico?",
                        verso: "Se vazar não dá pra trocar: ninguém troca de digital.",
                    },
                    {
                        frente: "Qual é a diferença entre os termos 2FA e MFA?",
                        verso: "2FA são exatamente dois fatores; MFA é dois ou mais.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que analogia a aula usa para o HTTP sem estado?",
                        verso: "O atendente que esquece a conversa a cada pergunta nova.",
                    },
                    {
                        frente: "Que duas famílias resolvem o esquecimento do HTTP?",
                        verso: "Sessão com estado no servidor, ou token com prova assinada no cliente.",
                    },
                    {
                        frente: "O que a sessão entrega ao cliente, se guarda o estado no servidor?",
                        verso: "Só uma referência: um id, geralmente dentro de um cookie.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que nome tem a ideia de mandar usuário e senha em toda chamada?",
                        verso: "HTTP Basic Authentication, com tudo no header Authorization.",
                    },
                    {
                        frente: "Que três problemas a senha em toda requisição cria?",
                        verso: "A senha trafega sempre, não dá pra deslogar e conferir sai caro.",
                    },
                    {
                        frente: "Quantas vezes a senha trafega quando existe sessão ou token?",
                        verso: "Uma só, no momento do login.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que formato o token viaja no header Authorization?",
                        verso: "No formato Bearer, seguido do próprio token.",
                    },
                    {
                        frente: "Que dois papéis a plataforma usa para controlar o acesso?",
                        verso: "Admin e aluno, cada um com o que pode acessar.",
                    },
                    {
                        frente: "Que provedores de login social a plataforma aceita?",
                        verso: "GitHub e Google, sem digitar senha nenhuma nela.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que caso de 2009 virou o clássico de senha em texto puro?",
                        verso: "O RockYou: injeção de SQL expôs mais de 32 milhões de contas.",
                    },
                    {
                        frente: "Que nome tem reaproveitar credencial vazada em outros serviços?",
                        verso: "Credential stuffing, que testa email e senha em vários sites.",
                    },
                    {
                        frente: "Que quatro portas expõem a tabela sem passar pela API?",
                        verso: "Backup exposto, injeção de SQL, cópia em teste e acesso interno.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que nome tem a saída de tamanho fixo de uma função de hash?",
                        verso: "Digest, o resultado do cálculo feito sobre a entrada.",
                    },
                    {
                        frente: "O que acontece com o hash ao mudar um caractere da entrada?",
                        verso: "O resultado muda por completo, e não só um pedaço dele.",
                    },
                    {
                        frente: "Que diferença de chave separa hash de criptografia?",
                        verso: "O hash não usa chave nenhuma; a criptografia precisa de uma.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como o atacante recupera senha a partir de um hash vazado?",
                        verso: "Calcula o hash de uma lista de candidatas e compara com o vazado.",
                    },
                    {
                        frente: "Quantos hashes por segundo o hardware comum calcula hoje?",
                        verso: "Bilhões de MD5, e da mesma ordem de grandeza em SHA-256.",
                    },
                    {
                        frente: "Para que o SHA-256 continua sendo excelente?",
                        verso: "Checksum de arquivo baixado e assinatura de commit.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quem gera o salt, e quando?",
                        verso: "O próprio sistema, de forma aleatória, a cada cadastro novo.",
                    },
                    {
                        frente: "Sem salt, o que quebrar um hash uma vez destrava?",
                        verso: "Todas as contas que compartilham aquela mesma senha.",
                    },
                    {
                        frente: "Onde o salt fica guardado?",
                        verso: "Junto do hash, muitas vezes dentro da mesma string.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três algoritmos servem para hash de senha?",
                        verso: "bcrypt, scrypt e argon2, com argon2id sugerido em sistema novo.",
                    },
                    {
                        frente: "Que valores de rounds são comuns em projeto Node?",
                        verso: "Entre 10 e 12; cada round a mais dobra o tempo de cálculo.",
                    },
                    {
                        frente: "Como o bcrypt.compare confere sem gerar um salt novo?",
                        verso: "Ele lê o salt e o custo que já estão embutidos no hash guardado.",
                    },
                ],
            },
        },
    },
};
