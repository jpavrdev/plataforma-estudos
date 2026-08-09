import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Segurança de Aplicações Web, sexta e última trilha do roadmap de QA
 * e Testes.
 *
 * Sem trilhos de linguagem: tudo em "neutra". Trilha de vocabulário técnico
 * denso (nomes de ataque, códigos do OWASP, atributos de cookie), que é
 * exatamente o tipo de coisa que a revisão espaçada segura bem.
 */
export const segurancaDeAplicacoesWeb: CartasDaTrilha = {
    trilha: "Segurança de Aplicações Web",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quais métodos HTTP são idempotentes?",
                        verso: "GET, PUT e DELETE. POST e PATCH não são.",
                    },
                    {
                        frente: "Qual é a intenção do PUT, comparada à do PATCH?",
                        verso: "PUT substitui o recurso inteiro; PATCH altera só uma parte.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o atributo HttpOnly num cookie impede?",
                        verso: "Que o JavaScript da página leia o cookie.",
                    },
                    {
                        frente: "Qual é a diferença entre os status 401 e 403?",
                        verso: "401 é falta de autenticação; 403 é autenticado sem permissão.",
                    },
                    {
                        frente: "Para que serve o cabeçalho Authorization?",
                        verso: "Enviar uma credencial, como um token de acesso.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que fica do lado não confiável numa aplicação web?",
                        verso: "Tudo que roda no navegador: HTML, JavaScript, formulário e cookie.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três partes definem uma origem no navegador?",
                        verso: "Esquema, host e porta. O caminho não conta.",
                    },
                    {
                        frente: "Um subdomínio é a mesma origem do domínio principal?",
                        verso: "Não. Host diferente é origem diferente.",
                    },
                    {
                        frente: "Qual é o objetivo da Same-Origin Policy?",
                        verso: "Impedir que uma página leia dados de outra origem.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é o OWASP Top 10?",
                        verso: "Lista das dez categorias de risco mais críticas, usada como guia.",
                    },
                    {
                        frente: "O que é a superfície de ataque de uma aplicação?",
                        verso: "Os pontos por onde dados entram e podem ser manipulados.",
                    },
                    {
                        frente: "Que categoria lidera o OWASP Top 10 de 2025?",
                        verso: "Controle de acesso quebrado, o A01.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre autenticação e autorização?",
                        verso: "A autenticação prova quem você é; a autorização decide o que pode fazer.",
                    },
                    {
                        frente: "O que o princípio de negar por padrão estabelece?",
                        verso: "Tudo é proibido, e só fica liberado o que for explicitamente permitido.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que caracteriza uma vulnerabilidade de IDOR?",
                        verso: "Buscar o objeto pelo id informado, sem checar se aquele usuário pode vê-lo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que é escalonamento vertical de privilégio?",
                        verso: "O atacante passa a ter permissão de um nível acima do dele.",
                    },
                    {
                        frente: "O que é force browsing?",
                        verso: "Acessar direto uma URL fora do menu, apostando que ela não é protegida.",
                    },
                    {
                        frente: "O que um path traversal tenta alcançar?",
                        verso: "Arquivos fora da pasta prevista, subindo diretórios no caminho.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que política de senha a aula recomenda sobre validade?",
                        verso: "Trocar só sob suspeita de vazamento, não a cada 30 ou 90 dias.",
                    },
                    {
                        frente: "O que vale mais que exigir maiúscula, número e símbolo?",
                        verso: "Bloquear senhas vazadas e comuns.",
                    },
                    {
                        frente: "Que tamanho mínimo de senha a aula recomenda?",
                        verso: "Doze caracteres ou mais, permitindo frases longas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como funciona o credential stuffing?",
                        verso: "Pares de login e senha vazados são testados em massa em outros sites.",
                    },
                    {
                        frente: "O que é password spraying?",
                        verso: "Poucas senhas comuns testadas contra muitas contas.",
                    },
                    {
                        frente: "Que defesa ataca diretamente a força bruta?",
                        verso: "O rate limiting nas tentativas de login.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a causa raiz comum a toda injeção?",
                        verso: "Misturar, numa mesma string, o dado do usuário com o comando.",
                    },
                    {
                        frente: "Que vulnerabilidade a categoria de injeção passou a englobar em 2025?",
                        verso: "O XSS, o cross-site scripting.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a correção principal contra SQL injection?",
                        verso: "A consulta parametrizada, que envia instrução e valores separados.",
                    },
                    {
                        frente: "Que cuidado um ORM não dispensa?",
                        verso: "O SQL bruto embutido, que continua vulnerável.",
                    },
                    {
                        frente: "Por que validar a entrada não substitui a parametrização?",
                        verso: "É defesa extra: só rejeita formato claramente inválido.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um command injection dá ao atacante, no pior caso?",
                        verso: "A capacidade de executar comandos no servidor.",
                    },
                    {
                        frente: "Qual é a defesa contra command injection?",
                        verso: "Passar argumentos separados, sem shell no meio.",
                    },
                    {
                        frente: "Em que uma injeção de NoSQL transforma o dado?",
                        verso: "Em operador de consulta, como maior que ou diferente de.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde vive a carga de um XSS refletido?",
                        verso: "Na própria requisição, em geral na URL.",
                    },
                    {
                        frente: "Qual XSS atinge todo mundo que vê o conteúdo depois?",
                        verso: "O armazenado, que fica salvo no servidor.",
                    },
                    {
                        frente: "Onde a carga de um XSS baseado em DOM é processada?",
                        verso: "No JavaScript do cliente; o servidor pode nem ver.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é um ataque de CSRF?",
                        verso: "Fazer o navegador da vítima logada enviar requisição com o cookie dela.",
                    },
                    {
                        frente: "Que atributo de cookie ajuda contra CSRF?",
                        verso: "O SameSite, que barra o envio em requisição de outro site.",
                    },
                    {
                        frente: "Como funciona o token anti-CSRF?",
                        verso: "Um valor secreto por sessão, exigido na submissão e desconhecido do atacante.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Por que a categoria de exposição de dados virou falha criptográfica?",
                        verso: "A exposição é o sintoma; a causa raiz é falha na criptografia.",
                    },
                    {
                        frente: "Base64 protege um dado?",
                        verso: "Não. É codificação reversível sem chave, não criptografia.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que uma conexão TLS bem configurada oferece?",
                        verso: "Confidencialidade, integridade no caminho e autenticação do servidor.",
                    },
                    {
                        frente: "O que um atacante na mesma rede lê num login sem HTTPS?",
                        verso: "Usuário, senha e cookie de sessão, tudo em texto plano.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a forma correta de guardar senha?",
                        verso: "Hash de mão única com bcrypt, scrypt ou argon2.",
                    },
                    {
                        frente: "O que é o salt no hashing de senha?",
                        verso: "Um valor aleatório e único por usuário, somado antes do hash.",
                    },
                    {
                        frente: "Por que SHA-256 com salt ainda é insuficiente para senha?",
                        verso: "É rápido demais: a GPU testa bilhões por segundo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quando cifrar em vez de hashear um dado?",
                        verso: "Quando é preciso ler o valor original depois.",
                    },
                    {
                        frente: "Qual cifra é recomendada hoje para dado em repouso?",
                        verso: "AES-256 em modo autenticado, com vetor de inicialização único.",
                    },
                    {
                        frente: "Por que o modo ECB é desaconselhado?",
                        verso: "Blocos iguais viram cifra igual, e o padrão do dado vaza.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que hardcodar chave de API no código é perigoso?",
                        verso: "O histórico do Git é permanente, e bots varrem repositórios.",
                    },
                    {
                        frente: "Por que o gerador aleatório comum não serve para segredo?",
                        verso: "Não é criptograficamente seguro: a sequência é previsível.",
                    },
                ],
            },
        },
    },
};
