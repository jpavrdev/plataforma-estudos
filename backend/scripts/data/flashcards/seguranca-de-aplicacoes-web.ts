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
    },
};
