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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que forma tem o registro de sessão criado no login?",
                        verso: "Algo como usuarioId 42, associado a um id de sessão único.",
                    },
                    {
                        frente: "Que tipo de valor serve como id de sessão?",
                        verso: "Aleatório e longo, tipo um UUID, impossível de adivinhar.",
                    },
                    {
                        frente: "Que peça faz o id de sessão viajar sem código no front-end?",
                        verso: "O cookie, que o navegador guarda e reenvia sozinho.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que dois headers formam o par de ida e volta do cookie?",
                        verso: "Set-Cookie na resposta e Cookie na requisição seguinte.",
                    },
                    {
                        frente: "A que o cookie fica associado, além do domínio?",
                        verso: "Opcionalmente a um caminho específico dentro do site.",
                    },
                    {
                        frente: "Que problema o cookie de sessão sem atributos ainda tem?",
                        verso: "Pode ser lido por JavaScript e enviado onde não deveria.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre SameSite Strict e Lax?",
                        verso: "Strict só vai do próprio site; Lax ainda vai em clique de link.",
                    },
                    {
                        frente: "Que atributos o cookie de sessão ideal combina?",
                        verso: "HttpOnly, Secure e SameSite ao mesmo tempo.",
                    },
                    {
                        frente: "Que risco os atributos Expires e Max-Age mitigam?",
                        verso: "Uma sessão antiga continuar valendo por tempo indefinido.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que nome tem o armazenamento padrão do express-session?",
                        verso: "MemoryStore, na memória do próprio processo Node.",
                    },
                    {
                        frente: "Que recurso do Redis combina com o tempo de vida da sessão?",
                        verso: "A expiração automática de chaves, que é nativa nele.",
                    },
                    {
                        frente: "Que vantagem guardar sessão no banco de dados oferece?",
                        verso: "Ele já existe no sistema e é fácil de consultar e auditar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que duas coisas um logout correto faz?",
                        verso: "Apaga o registro no servidor e manda o navegador descartar o cookie.",
                    },
                    {
                        frente: "Qual das duas partes do logout de fato revoga o acesso?",
                        verso: "A invalidação no servidor; limpar no cliente só tira a referência.",
                    },
                    {
                        frente: "O que complica escalar horizontalmente com sessão?",
                        verso: "Toda instância precisa enxergar o mesmo estado de sessão.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Onde o cliente costuma guardar o token recebido no login?",
                        verso: "No localStorage, numa variável ou no armazenamento seguro do app.",
                    },
                    {
                        frente: "Que diferença de envio separa cookie de token?",
                        verso: "O cookie vai sozinho; o token o código do cliente precisa anexar.",
                    },
                    {
                        frente: "O que um servidor precisa saber para validar um token?",
                        verso: "Só o segredo usado para assinar; nada mais é consultado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a sigla JWT significa, e como se pronuncia?",
                        verso: "JSON Web Token, pronunciado como a palavra jot em inglês.",
                    },
                    {
                        frente: "O que o Base64url troca em relação ao Base64 comum?",
                        verso: "Os caracteres mais e barra por hífen e underscore.",
                    },
                    {
                        frente: "Que duas informações o header de um JWT carrega?",
                        verso: "O algoritmo que assina e o tipo, que é sempre JWT.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a claim sub identifica num JWT?",
                        verso: "O subject: quem é o dono do token, em geral o id do usuário.",
                    },
                    {
                        frente: "Em que unidade a claim iat registra o momento de emissão?",
                        verso: "Em segundos desde 1970, o chamado Unix time.",
                    },
                    {
                        frente: "Por que o payload de um JWT costuma ficar pequeno?",
                        verso: "Ele viaja inteiro em toda requisição feita à API.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que duas garantias a assinatura de um JWT dá?",
                        verso: "Autenticidade de quem emitiu e integridade do conteúdo.",
                    },
                    {
                        frente: "Qual é a diferença entre HS256 e RS256?",
                        verso: "HS256 usa um segredo único; RS256 usa um par de chaves.",
                    },
                    {
                        frente: "Que nome de claim esta plataforma usa no lugar de sub?",
                        verso: "userId; o JWT aceita qualquer nome fora dos poucos reservados.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que tipo de token a plataforma usa como refresh?",
                        verso: "Um token opaco de vida longa, guardado e revogável no banco.",
                    },
                    {
                        frente: "O que o JWT ganha ao não guardar estado, e o que perde?",
                        verso: "Ganha escala sem estado compartilhado; perde revogação imediata.",
                    },
                    {
                        frente: "Que uso típico cada abordagem costuma ter?",
                        verso: "Sessão em aplicação web de um domínio só; token entre serviços.",
                    },
                ],
            },
        },
    },
};
