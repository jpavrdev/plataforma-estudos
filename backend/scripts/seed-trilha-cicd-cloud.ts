// Seed da trilha CI/CD e Cloud (intermediario), estagio 9 do roadmap de Back-end.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-cicd-cloud.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "CI/CD e Cloud";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Automatize o caminho do código até o ar: integração contínua rodando testes a cada push, GitHub Actions construindo e publicando sua imagem, entrega e deploy contínuos, e onde a aplicação roda na nuvem, com HTTPS, secrets e observabilidade. Da branch ao deploy sem passo manual.";

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
        "titulo": "Módulo 1 - Por que CI/CD",
        "aulas": [
            {
                "titulo": "O problema do deploy manual",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 1: por que CI/CD\n\nVocê já sabe empacotar sua API Node.js num container Docker: uma imagem que carrega o runtime, as dependências e o código, e roda igual na sua máquina, no ambiente de teste e no servidor. Falta uma peça: como essa imagem sai do seu notebook e chega, sozinha, rodando em produção?\n\nHoje esse caminho ainda é manual, feito na mão, passo a passo. É exatamente esse roteiro manual que a gente vai automatizar ao longo dessa trilha."
                    },
                    {
                        "type": "text",
                        "value": "## O roteiro de um deploy manual\n\nImagina o dia a dia de subir uma mudança pra produção sem nenhuma automação. Alguém do time abre o terminal e segue, de cabeça ou anotado num bloco de notas, uma sequência parecida com essa:\n\n- Rodar os testes localmente (ou nem rodar, achando que a mudança era pequena demais pra quebrar algo)\n- Buildar a imagem Docker com a tag certa\n- Publicar essa imagem no registry\n- Conectar na VPS via SSH\n- Baixar a imagem nova e reiniciar os containers com aquele mesmo docker compose usado em dev\n- Lembrar de aplicar as migrations pendentes do banco\n- Conferir se a aplicação subiu e está respondendo\n\nSete passos manuais, todos dependendo de uma pessoa lembrar de cada um, na ordem certa, sem pular nenhum."
                    },
                    {
                        "type": "code",
                        "value": "$ npm test\n...\nTests: 42 passed, 42 total\n\n$ docker build -t seunome/minha-api:latest .\n$ docker push seunome/minha-api:latest\n\n$ ssh SEU_USUARIO@meu-servidor.com\n$ cd /opt/app\n$ docker compose pull\n$ docker compose up -d\n$ docker compose exec backend npm run migrate\n\n# nove comandos, digitados por uma pessoa, numa ordem que precisa\n# ser lembrada de cor toda vez que alguem faz deploy"
                    },
                    {
                        "type": "text",
                        "value": "## Erro humano não é falta de cuidado\n\nO problema desse roteiro não é a falta de atenção de quem está deployando. É que qualquer processo manual, repetido dezenas de vezes ao longo de semanas ou meses, eventualmente falha em algum passo. Alguém esquece de rodar a migration antes de reiniciar os containers. Alguém builda a imagem sem puxar a versão mais nova do código. Alguém pula os testes porque a mudança parecia pequena demais pra dar problema.\n\nNenhum desses erros é exclusivo de gente desatenta. É o formato do processo que garante que, cedo ou tarde, um passo vai ficar pra trás."
                    },
                    {
                        "type": "text",
                        "value": "## O medo de deployar na sexta\n\nEsse tipo de processo cria uma cultura conhecida em qualquer time de back-end: o medo de deployar na sexta-feira. Se o deploy é manual e alguma coisa pode dar errado sem ninguém perceber na hora, ninguém quer ser a pessoa que solta uma mudança em produção horas antes do fim de semana, sem tempo pra corrigir se algo quebrar.\n\nRepare que o medo não é do código em si, é do processo de levar o código até o ar. Um time que confia no próprio processo de deploy consegue deployar qualquer dia da semana, várias vezes ao dia, sem drama."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa manual\",\"O que pode dar errado\"],[\"Rodar os testes\",\"Pular o teste achando que a mudança era pequena demais pra quebrar algo\"],[\"Buildar a imagem\",\"Buildar a partir de um código desatualizado, sem o último commit\"],[\"Publicar no registry\",\"Esquecer de publicar a tag nova e o deploy usar a imagem antiga\"],[\"Conectar na VPS e atualizar\",\"Rodar o comando no servidor errado, ou pular um passo da sequência\"],[\"Aplicar as migrations\",\"Esquecer de aplicar e a aplicação subir com o banco desatualizado\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O Docker resolveu rodar igual em qualquer lugar. Ainda falta resolver quem lembra de levar o container até lá, sem pular um passo, toda vez que o time faz deploy."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual desses passos é típico de um deploy manual, feito por alguém no terminal?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Buildar a imagem, publicar no registry e reiniciar os containers",
                                "isCorrect": true
                            },
                            {
                                "text": "Gerar a documentação da API automaticamente a cada commit novo",
                                "isCorrect": false
                            },
                            {
                                "text": "Compilar o código pra um binário nativo do sistema operacional",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografar o banco de dados antes de cada release em produção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa builda a imagem Docker antes de dar git pull da última versão do código. O que acontece?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A imagem é construída a partir de uma versão desatualizada do código",
                                "isCorrect": true
                            },
                            {
                                "text": "O build falha imediatamente e nenhuma imagem chega a ser gerada",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker baixa sozinho o commit mais recente do repositório",
                                "isCorrect": false
                            },
                            {
                                "text": "O registry rejeita o push por causa da tag estar desatualizada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o medo de fazer deploy numa sexta-feira costuma aparecer em times com processo manual?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque um processo manual pode falhar num passo sem ninguém perceber a tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a maioria dos servidores reinicia sozinha durante os fins de semana",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque as equipes de suporte não costumam trabalhar aos sábados e domingos",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o tráfego do site costuma cair bastante nas sextas-feiras à noite",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time decide pular os testes antes de um deploy, achando a mudança pequena demais pra quebrar algo. Qual é o risco real dessa decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mudanças pequenas também podem esconder efeitos colaterais que só o teste revela",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum, mudanças de texto nunca afetam o funcionamento do restante do sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker detecta sozinho qualquer erro introduzido por uma mudança pequena",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco só existe se a mudança envolver diretamente alguma rota da API",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Reduzir de nove passos manuais pra cinco automatizados diminui o risco de erro humano. Por que esse risco não chega a zero enquanto sobrar qualquer passo manual?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque um único passo manual ainda depende de alguém lembrar dele certo",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque ferramentas de automação sempre falham depois de algumas execuções seguidas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Docker exige reconstruir a imagem inteira a cada passo manual",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque testes automatizados não cobrem cenários criados por passos manuais",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que é Integração Contínua",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é Integração Contínua\n\nIntegração Contínua (CI, de Continuous Integration) é a prática de integrar código com frequência na branch principal e validar cada mudança automaticamente. Na prática, CI é o primeiro passo que sai da mão de alguém e passa a rodar sozinho: em vez de uma pessoa lembrar de rodar npm test antes de cada merge, um serviço de CI faz isso a cada push, sempre da mesma forma."
                    },
                    {
                        "type": "text",
                        "value": "## Integrar com frequência\n\nA palavra integração no nome não é acidente. CI pressupõe integrar mudanças pequenas na branch principal com frequência, às vezes várias vezes por dia, em vez de deixar uma branch viver semanas isolada até juntar tudo de uma vez. Quanto mais tempo o código fica separado da main, maior a chance de conflito, e mais difícil fica revisar a mudança inteira de uma vez."
                    },
                    {
                        "type": "code",
                        "value": "$ git add .\n$ git commit -m \"corrige validacao do formulario de cadastro\"\n$ git push origin main\n\n# esse push e o gatilho: em segundos, o servico de CI detecta\n# a mudanca e comeca a rodar sozinho, sem ninguem pedir:\n#   1. baixa o codigo que acabou de subir\n#   2. instala as dependencias (npm ci)\n#   3. roda o typecheck\n#   4. roda a suite de testes\n#\n# se qualquer passo falhar, o time fica sabendo em minutos"
                    },
                    {
                        "type": "text",
                        "value": "## Validar a cada push, com a main sempre no verde\n\nO objetivo não é validar só antes do deploy: é validar a cada push e a cada pull request, cedo, antes do código ir mais longe. Aqueles testes que você escreveu na trilha de Testes agora rodam sozinhos, a cada mudança, sem ninguém precisar lembrar de digitar npm test.\n\nCom isso, a branch principal tende a ficar sempre num estado que builda e passa nos testes, o que o time costuma chamar de manter a main verde. Qualquer pessoa pode criar uma branch nova a partir dela a qualquer momento e confiar que está partindo de uma base que funciona."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Sem CI\",\"Com CI\"],[\"Quando os testes rodam\",\"Quando (e se) alguém lembra de rodar na mão\",\"Automaticamente, a cada push\"],[\"Quem costuma achar um bug\",\"O usuário, já em produção\",\"O próprio time, minutos depois do push\"],[\"Tempo até perceber o erro\",\"Horas, dias, ou só depois do deploy\",\"Minutos\"],[\"Confiança na branch principal\",\"Depende de quem testou por último\",\"Alta, todo push já foi validado\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Integração Contínua não é sobre nunca ter bug. É sobre descobrir o bug em minutos, sozinho, em vez de descobrir em produção, por acidente."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa, na prática, Integração Contínua?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Integrar código com frequência e validar cada mudança de forma automática",
                                "isCorrect": true
                            },
                            {
                                "text": "Integrar times diferentes numa única reunião semanal de alinhamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar manualmente os testes antes de cada merge pra branch principal",
                                "isCorrect": false
                            },
                            {
                                "text": "Publicar a aplicação em produção assim que o código é aprovado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que costuma disparar a validação automática de um pipeline de CI?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um push de código ou a abertura de um pull request",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma reunião de planejamento marcada pelo time no início da sprint",
                                "isCorrect": false
                            },
                            {
                                "text": "Um horário fixo, configurado pra rodar todo fim de tarde",
                                "isCorrect": false
                            },
                            {
                                "text": "Um clique manual de alguém aprovando o deploy em produção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois devs trabalham em branches separadas por três semanas sem integrar com a principal. Na hora de juntar tudo, o que costuma acontecer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Conflitos grandes e difíceis de resolver, por causa do tempo sem integrar",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum problema, porque branches longas nunca geram conflito nenhum no Git",
                                "isCorrect": false
                            },
                            {
                                "text": "O CI bloqueia sozinho qualquer branch com mais de uma semana de vida",
                                "isCorrect": false
                            },
                            {
                                "text": "O merge é sempre resolvido automaticamente pela ferramenta de CI usada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de configurar CI, o time continua escrevendo código em branches que vivem semanas antes de integrar. O pipeline de CI, sozinho, resolve o problema da integração?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, CI automatiza a validação, mas integrar com frequência depende do time",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, o CI reduz automaticamente o tamanho de qualquer branch antiga",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o CI força um merge diário mesmo sem intervenção humana",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, CI só funciona se o time usar exatamente uma única branch",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que manter a branch principal sempre passando no CI é mais importante do que só rodar testes de vez em quando?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque qualquer pessoa pode partir dali a qualquer momento e confiar que funciona",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque testes ocasionais custam mais tempo de máquina do que testes contínuos",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a branch principal só aceita commits assinados digitalmente pelo autor",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque rodar testes de vez em quando desativa o restante do pipeline",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Entrega x Deploy Contínuo (CD)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## De validar pra entregar\n\nCI garante que a branch principal está sempre validada: builda e passa nos testes. Mas estar validada não é o mesmo que estar no ar. O que acontece depois que o pipeline de CI passa é o território do CD, e CD é uma sigla que esconde duas práticas parecidas, mas diferentes: Entrega Contínua e Deploy Contínuo."
                    },
                    {
                        "type": "text",
                        "value": "## Entrega Contínua: pronto pra ir, falta um clique\n\nEntrega Contínua (Continuous Delivery) significa que, depois do CI validar a mudança, ela fica empacotada e pronta pra ir pra produção a qualquer momento. Falta só uma decisão: alguém do time escolhe o momento e aciona o deploy, geralmente com um clique ou uma aprovação manual. O pipeline faz o trabalho pesado; a pessoa decide o quando."
                    },
                    {
                        "type": "text",
                        "value": "## Deploy Contínuo: passou, foi\n\nDeploy Contínuo (Continuous Deployment) vai um passo além: toda mudança que passa no CI é deployada automaticamente, sem esperar aprovação de ninguém. Não existe o clique final, o próprio pipeline decide. Isso exige mais confiança na suíte de testes, porque não sobra uma checagem humana entre o código passar e o código estar no ar."
                    },
                    {
                        "type": "code",
                        "value": "# Entrega continua (Continuous Delivery)\n# push -> CI valida -> imagem fica pronta -> aguarda alguem acionar o deploy\n\n# Deploy continuo (Continuous Deployment)\n# push -> CI valida -> imagem fica pronta -> deploy acontece sozinho, sem espera"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Integração Contínua\",\"Entrega Contínua\",\"Deploy Contínuo\"],[\"O que garante\",\"Que a mudança builda e passa nos testes\",\"Que a mudança fica pronta pra ir ao ar a qualquer momento\",\"Que a mudança chega sozinha em produção\"],[\"Aprovação humana\",\"Não se aplica, só valida\",\"Sim, alguém decide o momento\",\"Não, o pipeline decide sozinho\"],[\"Quando o deploy acontece\",\"Não acontece deploy nessa etapa\",\"Quando alguém decidir, com um clique\",\"Assim que o pipeline passa\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Qual escolher\n\nA escolha depende de quanto o time confia na própria suíte de testes e de quanto controle ele quer manter sobre o momento do deploy. É basicamente o desenho que a própria ensina.dev usa: um workflow com job de teste, job de build do frontend e job de deploy, e esse último só roda quando o push é na branch principal, nas outras branches ele é pulado.\n\nTimes que preferem mais controle usam entrega contínua, com uma aprovação manual antes de ir pra produção. Times com suítes de teste robustas e bem cobertas costumam ir de deploy contínuo direto."
                    },
                    {
                        "type": "quote",
                        "value": "Entrega contínua deixa tudo pronto pra ir ao ar com um clique. Deploy contínuo tira até o clique do caminho. A diferença é quem aperta o gatilho final: uma pessoa, ou o próprio pipeline."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual a diferença central entre entrega contínua e deploy contínuo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Na entrega, alguém decide o momento do deploy; no contínuo, ele acontece sozinho",
                                "isCorrect": true
                            },
                            {
                                "text": "Entrega contínua só existe em times pequenos, deploy contínuo só em times grandes",
                                "isCorrect": false
                            },
                            {
                                "text": "Deploy contínuo não passa por nenhum teste automatizado antes de ir ao ar",
                                "isCorrect": false
                            },
                            {
                                "text": "Entrega contínua não builda a aplicação, só executa os testes automatizados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa esteira de entrega contínua, o que ainda precisa acontecer pra mudança ir ao ar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Alguém aprovar ou clicar pra liberar o deploy daquela versão pronta",
                                "isCorrect": true
                            },
                            {
                                "text": "O pipeline esperar sete dias corridos antes de liberar qualquer deploy",
                                "isCorrect": false
                            },
                            {
                                "text": "Um segundo pipeline, separado do primeiro, revalidar os mesmos testes",
                                "isCorrect": false
                            },
                            {
                                "text": "A equipe de infraestrutura reconfigurar o servidor a cada nova versão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time adota deploy contínuo: toda mudança que passa no CI vai pra produção sozinha. Um push com um bug passa despercebido pelos testes. O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O bug vai pra produção automaticamente, porque os testes não pegaram o problema",
                                "isCorrect": true
                            },
                            {
                                "text": "O deploy é bloqueado, porque deploy contínuo sempre exige revisão humana antes",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline detecta o bug sozinho e cancela o deploy no último passo",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada é publicado até alguém rodar os testes de novo manualmente depois",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe prefere manter uma aprovação manual antes de qualquer deploy pra produção, mesmo com os testes passando sozinhos. Isso é compatível com qual prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Entrega contínua, que deixa tudo pronto mas aguarda alguém decidir o momento",
                                "isCorrect": true
                            },
                            {
                                "text": "Deploy contínuo, que sempre inclui uma aprovação manual como última etapa",
                                "isCorrect": false
                            },
                            {
                                "text": "Integração Contínua, que decide sozinha quando algo vai pra produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Deploy contínuo, porque toda entrega validada deve virar deploy em algum momento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma startup decide pular a entrega contínua e ir direto pra deploy contínuo, sem nunca ter usado aprovação manual antes. Qual risco esse salto pode trazer?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Bugs que os testes não cobrem chegam à produção sem nenhuma checagem extra",
                                "isCorrect": true
                            },
                            {
                                "text": "O pipeline de CI para de funcionar assim que o deploy contínuo é ativado",
                                "isCorrect": false
                            },
                            {
                                "text": "A imagem Docker deixa de ser publicada no registry durante o processo",
                                "isCorrect": false
                            },
                            {
                                "text": "O time perde acesso ao histórico de commits anteriores ao deploy contínuo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O pipeline e seu vocabulário",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A esteira, do commit ao deploy\n\nUm pipeline de CI/CD é, no fundo, uma esteira: o commit entra numa ponta, passa por uma sequência de etapas automáticas (instalar dependências, rodar testes, buildar a imagem, publicar, deployar), e do outro lado sai uma versão nova da aplicação no ar. Cada etapa só começa depois que a anterior termina com sucesso; se uma etapa falha, a esteira para ali."
                    },
                    {
                        "type": "text",
                        "value": "## As peças que formam um pipeline\n\nPra falar sobre pipeline sem se perder, vale fixar um vocabulário pequeno, que aparece em qualquer ferramenta de CI/CD (GitHub Actions, GitLab CI, CircleCI): pipeline, gatilho, job, step, runner e artifact. São seis palavras que descrevem a esteira inteira."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Termo\",\"O que é\"],[\"Pipeline\",\"A esteira inteira: a sequência de etapas do commit até o deploy\"],[\"Gatilho (trigger)\",\"O evento que liga a esteira, como um push ou um pull request\"],[\"Job\",\"Um bloco de trabalho dentro do pipeline, por exemplo testar ou buildar\"],[\"Step\",\"Um passo dentro de um job, como instalar dependências ou rodar um comando\"],[\"Runner\",\"A máquina que executa os steps de um job\"],[\"Artifact\",\"Um arquivo gerado num job e reaproveitado depois, como uma imagem Docker\"]]"
                    },
                    {
                        "type": "code",
                        "value": "name: CI\n\non:\n  push:\n    branches: [main]\n\njobs:\n  testar:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm test"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo o arquivo com o vocabulário novo\n\nEsse arquivo inteiro é o pipeline. O bloco on.push é o gatilho: liga a esteira quando alguém dá push na main. testar é o nome do job, o bloco de trabalho que vai rodar. runs-on: ubuntu-latest diz qual runner vai executar esse job, nesse caso uma máquina Linux gerenciada pela própria GitHub Actions. Cada linha dentro de steps é um step: primeiro faz o checkout do código, depois roda npm ci, depois npm test."
                    },
                    {
                        "type": "text",
                        "value": "## Onde entra o artifact\n\nEsse workflow ainda não gera nenhum artifact, mas é comum um job de build produzir um, e um job seguinte (como o de deploy) precisar dele. O exemplo mais direto pra quem já fez a trilha de Docker: a imagem publicada num registry depois do build é, na prática, o artifact que o job de deploy vai consumir depois. O GitHub Actions também tem actions prontas pra isso, como actions/upload-artifact e actions/download-artifact, pra passar arquivos menores entre jobs sem precisar de um registry."
                    },
                    {
                        "type": "quote",
                        "value": "Pipeline é a esteira inteira. Job e step são as estações e as tarefas dentro dela. Runner é quem executa. Gatilho é o que liga a esteira. Artifact é o que sai pronto de uma estação pra outra."
                    }
                ],
                "questions": [
                    {
                        "statement": "No vocabulário de CI/CD, o que é um runner?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A máquina que executa os steps de um job do pipeline",
                                "isCorrect": true
                            },
                            {
                                "text": "O arquivo YAML que descreve o pipeline inteiro do projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "O evento que liga o pipeline, como um push ou um PR",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo gerado por um job e reaproveitado por outro depois",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que representa o campo on, com push por exemplo, num workflow do GitHub Actions?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O gatilho que dispara o pipeline quando o evento acontece",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome do job que vai rodar dentro daquele workflow",
                                "isCorrect": false
                            },
                            {
                                "text": "A máquina virtual onde os passos do job serão executados",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo que guarda o resultado final gerado pelo pipeline",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um workflow tem um job chamado testar, com três steps: checkout, npm ci e npm test. O segundo falha. O que costuma acontecer com o terceiro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Por padrão, o job para ali e o terceiro step não chega a rodar",
                                "isCorrect": true
                            },
                            {
                                "text": "O terceiro step roda normalmente, sem nenhuma relação com o segundo",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline inteiro reinicia do zero, incluindo o checkout do código",
                                "isCorrect": false
                            },
                            {
                                "text": "O terceiro step roda, mas marcado como falho junto com o segundo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois jobs do mesmo pipeline rodam em runners diferentes: um testa, o outro faz o deploy. Se o job de deploy precisa de algo gerado no job de teste, como isso costuma ser resolvido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Publicando esse arquivo como um artifact, ou num registry acessível aos dois",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois jobs sempre compartilham o mesmo runner, então o arquivo já está lá",
                                "isCorrect": false
                            },
                            {
                                "text": "O GitHub Actions copia sozinho tudo do disco de um runner pro outro",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso não é possível, cada job de um pipeline roda isolado dos outros",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um workflow tem dois jobs, sem nenhuma dependência declarada entre eles. Qual costuma ser o comportamento padrão de execução?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Os dois jobs rodam em paralelo, cada um no seu próprio runner",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois jobs rodam em sequência, na ordem em que foram escritos",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o primeiro job declarado no arquivo chega a ser executado",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois jobs disputam o mesmo runner até um deles ser cancelado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Os benefícios de automatizar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que muda quando o processo é automático\n\nDepois de quatro aulas, dá pra juntar as peças: CI valida cada push, entrega ou deploy contínuo levam a mudança até (perto de) produção, e o pipeline inteiro fala um vocabulário comum de jobs, steps e runners. Vale fechar o módulo perguntando o principal: por que vale a pena montar tudo isso?"
                    },
                    {
                        "type": "text",
                        "value": "## Feedback rápido\n\nO primeiro benefício é o mais direto: feedback rápido. No processo manual da primeira aula, um bug podia ficar escondido por dias, até alguém lembrar de testar aquele trecho, ou até um usuário esbarrar nele em produção. Com o pipeline rodando a cada push, o time descobre em minutos se alguma coisa quebrou, ainda com o contexto da mudança fresco na cabeça."
                    },
                    {
                        "type": "text",
                        "value": "## Menos erro humano, releases pequenas e frequentes\n\nCada passo que sai da mão de uma pessoa e passa pro pipeline é um passo que não depende mais de alguém lembrar dele. Isso, combinado com feedback rápido, muda o tamanho das releases: em vez de acumular semanas de mudanças num deploy grande e arriscado, o time ganha confiança pra integrar e deployar mudanças pequenas, com frequência, cada uma validada do mesmo jeito."
                    },
                    {
                        "type": "code",
                        "value": "$ git log --oneline -4\na3f21c9 fix: corrige validacao de e-mail no cadastro\n7bd910e feat: adiciona filtro por categoria na listagem\n02e88f1 fix: ajusta timeout da fila de e-mails\nf88a012 feat: adiciona endpoint de exportacao de relatorio\n\n$ git tag\nv1.4.0\nv1.4.1\nv1.4.2\nv1.4.3\n\n# quatro versoes em poucas semanas, cada uma pequena,\n# cada uma testada e deployada pelo mesmo pipeline"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Processo manual\",\"Com CI/CD\"],[\"Tempo até detectar um erro\",\"Dias, ou só em produção\",\"Minutos, logo após o push\"],[\"Tamanho típico de cada release\",\"Grande, acumulando semanas de mudanças\",\"Pequeno, uma mudança de cada vez\"],[\"Deploy numa sexta-feira\",\"Evitado, por medo de algo dar errado\",\"Tranquilo, o processo é sempre o mesmo\"],[\"Quem garante que os passos foram seguidos\",\"A memória de quem está deployando\",\"O pipeline, sempre na mesma ordem\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Confiança pra deployar\n\nNo fim, todos esses ganhos apontam pra uma coisa só: confiança. Confiança de que um push não vai quebrar a main sem ninguém perceber, confiança de que o deploy vai seguir sempre os mesmos passos, confiança pra soltar uma mudança pequena numa sexta-feira sem medo. Automatizar não elimina bug, elimina a incerteza de um processo que muda dependendo de quem está de plantão.\n\nNo próximo módulo, a gente detalha a primeira metade dessa esteira: a Integração Contínua na prática, o gatilho de push e pull request, e como o pipeline passa a barrar um merge quebrado antes que ele chegue na main."
                    },
                    {
                        "type": "quote",
                        "value": "Automatizar não é sobre tirar o time do processo. É sobre parar de confiar na memória de alguém pra fazer, sempre da mesma forma, o que uma máquina faz melhor: repetir sem esquecer nenhum passo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual desses é um benefício direto de automatizar build, teste e deploy?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Descobrir um erro em minutos, logo após o push, não dias depois",
                                "isCorrect": true
                            },
                            {
                                "text": "Eliminar totalmente a necessidade de escrever testes automatizados",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o tamanho da imagem Docker gerada a cada novo build",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir a necessidade de um banco de dados em produção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que releases pequenas e frequentes costumam ser menos arriscadas do que uma release grande, feita a cada poucos meses?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque uma mudança pequena é mais fácil de entender e reverter se falhar",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque releases pequenas nunca passam por nenhum tipo de teste automatizado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o servidor de produção reinicia sozinho a cada release pequena",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque releases grandes são sempre bloqueadas pelo pipeline de CI",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de adotar CI/CD, um time percebe que os pushes pra main viraram menores e mais frequentes do que antes. Isso costuma acontecer por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a confiança no pipeline reduz o medo de integrar mudanças pequenas",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o pipeline de CI passa a exigir um tamanho máximo por commit",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Git bloqueia pushes grandes automaticamente depois de configurado o CI",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a equipe reduz o número de pessoas que podem dar push",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time automatiza build e testes, mas o deploy continua sendo feito manualmente, por uma pessoa, seguindo um roteiro escrito. Esse time já colhe todos os benefícios de CI/CD?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não totalmente, o passo manual que resta ainda pode falhar por erro humano",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, automatizar build e testes já elimina qualquer risco do processo inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque sem automatizar o deploy o pipeline de testes para de funcionar",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o deploy manual sempre segue exatamente o roteiro escrito",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Automatizar o pipeline reduz erro humano nos passos que ele cobre. Por que, mesmo assim, a confiança do time pra deployar depende também da qualidade dos testes?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque um pipeline só é confiável se os testes cobrirem os cenários certos",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a automação substitui completamente a necessidade de qualquer teste manual",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque testes de qualidade tornam a automação do pipeline desnecessária no fim",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o runner escolhido no pipeline determina sozinho a cobertura dos testes",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Integração Contínua: validar a cada push",
        "aulas": [
            {
                "titulo": "O gatilho: push e pull request",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Integração Contínua: validar a cada push\n\nNo módulo anterior você conheceu o pipeline como uma esteira: o código entra de um lado, passa por validações automáticas e sai do outro lado pronto (ou não) pra seguir adiante. Agora é hora de colocar a primeira parte dessa esteira pra rodar de verdade, a Integração Contínua (CI).\n\nA ideia é simples: toda vez que alguém manda código pro repositório, um processo automático valida esse código, sem ninguém precisar lembrar de rodar nada na mão."
                    },
                    {
                        "type": "text",
                        "value": "## O gatilho: eventos do repositório\n\nO pipeline não fica rodando o tempo todo: ele espera um gatilho (trigger). No GitHub Actions, esse gatilho é configurado no campo `on` do workflow, e os dois eventos mais comuns pra CI são:\n\n- **push**: alguém enviou um ou mais commits pra uma branch do repositório.\n- **pull_request**: alguém abriu, atualizou ou reabriu um pull request.\n\nRepare que nenhum dos dois depende de uma pessoa clicar em \"rodar pipeline\". O próprio ato de enviar código já é o gatilho."
                    },
                    {
                        "type": "code",
                        "value": "name: CI\n\non: [push, pull_request]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm test"
                    },
                    {
                        "type": "text",
                        "value": "## push x pull_request: pra que serve cada um\n\nOs dois eventos parecem parecidos, mas cumprem papéis diferentes:\n\n- Um **push** dispara a cada commit que chega numa branch, seja a `main`, seja uma branch de feature. Serve pra validar qualquer mudança enviada ao repositório.\n- Um **pull_request** dispara quando o PR é aberto e de novo a cada novo commit enviado pra ele (o evento `synchronize`). Serve pra validar a mudança antes dela ser aceita na branch de destino.\n\nNa prática, a maioria dos times configura os dois juntos, como no exemplo acima: `on: [push, pull_request]`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"push\", \"pull_request\"], [\"Quando dispara\", \"A cada commit enviado pra uma branch\", \"Quando o PR é aberto, atualizado ou reaberto\"], [\"Roda contra qual código\", \"O código da branch que recebeu o push\", \"O resultado da mescla entre a branch e o destino\"], [\"Uso típico\", \"Validar toda mudança enviada ao repositório\", \"Validar a mudança antes de aceitar o merge\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## branches: nem todo push interessa\n\nTambém dá pra restringir o gatilho a branches específicas, com o campo `branches` dentro de `on`. Isso é útil quando você só quer rodar a esteira completa em certas branches (por exemplo, `main` e `develop`) e deixar branches de experimento de fora. O módulo 3 volta nesse arquivo de workflow com mais detalhe; por enquanto, o que importa é entender que o gatilho é configurável, ele não precisa ser tudo ou nada."
                    },
                    {
                        "type": "quote",
                        "value": "O gatilho transforma lembrar de testar em automatismo: a partir do primeiro push, o pipeline testa por você."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual desses eventos faz o pipeline de CI disparar automaticamente no GitHub Actions?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um push numa branch do repositório",
                                "isCorrect": true
                            },
                            {
                                "text": "Um comentário deixado num commit antigo",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma branch criada e nunca enviada ao remoto",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma alteração salva só localmente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num workflow do GitHub Actions, qual campo define os eventos que disparam o pipeline?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O campo on",
                                "isCorrect": true
                            },
                            {
                                "text": "O campo runs-on",
                                "isCorrect": false
                            },
                            {
                                "text": "O campo steps",
                                "isCorrect": false
                            },
                            {
                                "text": "O campo jobs",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dev abre um pull request e, minutos depois, envia mais um commit pra mesma branch, atualizando o PR. Com o workflow configurado em on: pull_request, o que esse novo commit faz com o pipeline?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Só dispara se o PR for fechado e reaberto manualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispara o pipeline de novo, validando o PR atualizado",
                                "isCorrect": true
                            },
                            {
                                "text": "Não dispara nada, porque o PR já tinha rodado antes",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispara, mas roda só o job de build, não os outros",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença prática entre configurar on: push e on: pull_request num workflow?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "push valida commits na branch; pull_request valida o PR",
                                "isCorrect": true
                            },
                            {
                                "text": "push só roda em produção; pull_request só em homologação",
                                "isCorrect": false
                            },
                            {
                                "text": "push roda uma vez por dia; pull_request a cada minuto",
                                "isCorrect": false
                            },
                            {
                                "text": "push exige aprovação manual; pull_request roda sozinho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um workflow tem on: push com branches: [main] configurado. Um dev cria a branch feature/login e dá push nela. O pipeline dispara?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sim, porque push sempre dispara em qualquer branch",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só quando a feature virar pull request",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque push nunca aceita filtro de branch",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque o filtro de branches restringe ao main",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que a CI valida: lint, typecheck, build e testes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Da esteira mínima pros checks de verdade\n\nNo exemplo da aula anterior, o job `test` só tinha um passo: `npm test`. Isso já garante alguma validação, mas a CI costuma ir além. Numa esteira madura, o mesmo job (ou jobs separados) roda quatro tipos de verificação a cada push: lint, typecheck, build e a suíte de testes."
                    },
                    {
                        "type": "text",
                        "value": "## lint: padronização antes de tudo\n\nO lint verifica o estilo e os padrões do código: identação, variáveis não usadas, imports fora de ordem, convenções do time. Ferramentas como o ESLint fazem isso sem executar o código, só analisando o texto-fonte. É a validação mais rápida e mais barata da esteira, e por isso costuma vir primeiro."
                    },
                    {
                        "type": "text",
                        "value": "## typecheck: erro de tipo sem rodar nada\n\nEm projetos TypeScript, o typecheck (`tsc`) analisa se os tipos batem: uma função que espera `number` e recebe `string`, um campo opcional acessado sem checagem. Assim como o lint, ele não executa a aplicação, só analisa o código, mas pega uma categoria de erro que o lint não enxerga."
                    },
                    {
                        "type": "text",
                        "value": "## build e testes: fechando a esteira\n\nDepois do lint e do typecheck, a CI ainda roda:\n\n- **build**: compila e empacota o projeto, do jeito que ele rodaria em produção. Se algum arquivo quebra a compilação, o build falha aqui, não no servidor.\n- **testes**: roda a suíte de testes unitários e de integração (aqueles que você escreveu na trilha de Testes), validando o comportamento, não só a sintaxe.\n\nCada etapa pega um tipo de problema diferente: o lint não vê erro de tipo, o typecheck não vê regra de negócio quebrada, e por aí vai."
                    },
                    {
                        "type": "code",
                        "value": "name: CI\n\non: [push, pull_request]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run typecheck\n      - run: npm run build\n      - run: npm test"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\", \"O que verifica\", \"Exemplo de ferramenta\"], [\"Lint\", \"Padrão e estilo do código\", \"ESLint\"], [\"Typecheck\", \"Tipos incompatíveis, sem rodar o código\", \"tsc --noEmit\"], [\"Build\", \"Se o projeto compila e empacota\", \"tsc, webpack, esbuild\"], [\"Testes\", \"Se o comportamento esperado se mantém\", \"Jest, Vitest\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Lint, typecheck, build e testes são quatro perguntas diferentes feitas ao mesmo código: está no padrão? os tipos batem? compila? funciona como deveria?"
                    }
                ],
                "questions": [
                    {
                        "statement": "Depois do checkout do código, qual comando costuma instalar as dependências de forma reprodutível num job de CI Node.js?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "npm ci, que respeita exatamente o lockfile",
                                "isCorrect": true
                            },
                            {
                                "text": "npm run dev, que liga o modo watch do projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "npm start, que sobe o servidor em modo dev",
                                "isCorrect": false
                            },
                            {
                                "text": "npm audit, que verifica vulnerabilidades",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto TypeScript tem uma função que espera number e recebe string. Em qual etapa da CI isso costuma ser pego, mesmo sem nenhum teste cobrir esse trecho?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "No deploy, que sobe a aplicação pro servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "No typecheck, que analisa tipos sem executar",
                                "isCorrect": true
                            },
                            {
                                "text": "No lint, que analisa a formatação do código",
                                "isCorrect": false
                            },
                            {
                                "text": "No build, que empacota os arquivos da aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O job de CI roda, nessa ordem, lint, typecheck, build e testes. O lint encontra um problema de formatação e falha. O que acontece com as etapas seguintes desse job, por padrão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O job para ali, as etapas seguintes não rodam",
                                "isCorrect": true
                            },
                            {
                                "text": "Só o typecheck é pulado, build e testes rodam",
                                "isCorrect": false
                            },
                            {
                                "text": "Todas rodam em paralelo, nada muda com a falha",
                                "isCorrect": false
                            },
                            {
                                "text": "As etapas seguintes rodam, mas o job fica falho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um workflow separa a validação em quatro steps (lint, typecheck, build e testes) em vez de um único comando que faz tudo. Qual a vantagem prática disso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Assim o job usa menos minutos de execução no runner",
                                "isCorrect": false
                            },
                            {
                                "text": "Não faz diferença real, é só estilo de quem escreveu",
                                "isCorrect": false
                            },
                            {
                                "text": "Fica claro qual etapa falhou; cada uma valida algo",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada etapa roda numa branch diferente do repositório",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dev roda lint, typecheck, build e testes localmente, e está tudo passando na sua máquina. Mesmo assim, ele abre o PR e deixa a CI rodar os mesmos checks de novo. Qual a razão prática mais forte pra isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A CI substitui a necessidade de revisão de código",
                                "isCorrect": false
                            },
                            {
                                "text": "A CI roda num ambiente limpo, igual pro time",
                                "isCorrect": true
                            },
                            {
                                "text": "A CI costuma ser mais rápida que rodar local",
                                "isCorrect": false
                            },
                            {
                                "text": "A CI grava o histórico de commits do repositório",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Checks obrigatórios e branch protection",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O pipeline rodou, e agora?\n\nAté aqui, a CI roda e mostra um resultado: verde ou vermelho. Mas só rodar e mostrar não impede ninguém de mesclar um código quebrado, é preciso um mecanismo que trave o merge quando o pipeline falha. No GitHub, esse mecanismo se chama branch protection."
                    },
                    {
                        "type": "text",
                        "value": "## branch protection: proteger a branch principal\n\nUma branch protection rule define exigências pra poder mesclar numa branch (normalmente a `main`). Entre as opções mais usadas estão: exigir pull request antes de mesclar, exigir revisão de outra pessoa, e exigir que determinados checks de status passem."
                    },
                    {
                        "type": "text",
                        "value": "## status checks obrigatórios\n\nAo configurar a branch protection, você escolhe quais checks são obrigatórios (required status checks), geralmente pelo nome do job no workflow, algo como `test / lint` ou `test / build`. Enquanto um check obrigatório não passa, o GitHub mantém o botão de mesclar bloqueado, mesmo que a pessoa tenha permissão de escrita no repositório."
                    },
                    {
                        "type": "code",
                        "value": "Checks obrigatórios neste pull request:\n\n  test / lint          sucesso (38s)\n  test / typecheck     sucesso (15s)\n  test / build          falhou (6s)\n\n1 de 3 checks obrigatórios falhou.\nMerge bloqueado até o check test / build passar."
                    },
                    {
                        "type": "text",
                        "value": "## pipeline vermelho x pipeline verde\n\nNo dia a dia, o time passa a enxergar o estado do PR por uma cor. Verde significa que todos os checks obrigatórios passaram, o código está no padrão esperado. Vermelho significa que algo falhou, e é sinal pra parar e corrigir antes de seguir, não pra ignorar e mesclar assim mesmo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Pipeline verde\", \"Pipeline vermelho\"], [\"O que significa\", \"Todos os checks passaram\", \"Pelo menos um check falhou\"], [\"Efeito no merge\", \"Botão de mesclar liberado\", \"Merge bloqueado pela branch protection\"], [\"Ação esperada do dev\", \"Seguir com o merge normalmente\", \"Corrigir o problema e enviar de novo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Branch protection é o que transforma um pipeline informativo num pipeline que decide: sem todos os checks verdes, o merge simplesmente não acontece."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é, na prática, uma branch protection rule num repositório do GitHub?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um limite de commits permitido numa branch",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma regra que define exigências pra mesclar",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma cópia de segurança automática da branch",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma senha extra exigida pra clonar o repositório",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um repositório exige, via branch protection, que o check test passe na main. Um pull request está com esse check em vermelho. O botão de mesclar fica disponível?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Sim, o merge fica liberado normalmente, sem aviso",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, mas dá pra mesclar direto puxando local",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, o GitHub bloqueia o merge até o check passar",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, mas só um admin recebe um aviso por e-mail",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um workflow tem dois jobs, lint e test. Na branch protection, só o job test foi marcado como check obrigatório. O job lint falha nesse pull request. O que acontece com o merge?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O PR fecha automaticamente quando um job falha",
                                "isCorrect": false
                            },
                            {
                                "text": "Continua liberado; só o test bloqueia o merge",
                                "isCorrect": true
                            },
                            {
                                "text": "É bloqueado até alguém revisar o lint manualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "É bloqueado, porque qualquer job vermelho trava",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O nome que aparece na lista de checks obrigatórios do GitHub (por exemplo, test / lint) vem de onde, dentro do workflow?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Do nome do job definido em jobs, no workflow",
                                "isCorrect": true
                            },
                            {
                                "text": "Do título do pull request escrito pelo autor",
                                "isCorrect": false
                            },
                            {
                                "text": "De um campo separado, configurado fora do YAML",
                                "isCorrect": false
                            },
                            {
                                "text": "Do nome do arquivo .yml que define o workflow",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe marcou test / build como check obrigatório. Meses depois, alguém renomeia esse job no workflow pra test / compile, sem atualizar a branch protection. O que tende a acontecer nos próximos PRs?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O merge libera normal, o nome do check não importa",
                                "isCorrect": false
                            },
                            {
                                "text": "O check antigo nunca chega, e o merge fica travado",
                                "isCorrect": true
                            },
                            {
                                "text": "O GitHub atualiza o nome sozinho na branch protection",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline para de rodar até o nome ser corrigido",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Pegar o erro cedo e barato",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que pegar cedo importa tanto\n\nUm mesmo bug custa preços bem diferentes dependendo de onde é encontrado. Encontrado no editor, antes até do commit, custa quase nada: o dev ajusta e segue. Encontrado em produção, depois do deploy, custa muito mais: rollback, hotfix, e talvez um usuário que já viu o erro na tela."
                    },
                    {
                        "type": "text",
                        "value": "## o custo sobe a cada etapa\n\nEsse aumento de custo não é só sensação. Quanto mais etapas o código atravessa antes do bug aparecer, mais gente e mais processo estão envolvidos pra corrigir: revisar de novo, gerar um novo pull request, esperar a CI rodar de novo, às vezes até coordenar um novo deploy fora do horário combinado. A CI existe, entre outras coisas, pra pegar o problema antes dessa bola de neve começar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Onde o bug é pego\", \"Custo típico de corrigir\"], [\"No editor, com lint e typecheck local\", \"Baixo: o dev ajusta antes mesmo de commitar\"], [\"No pull request, pela CI\", \"Baixo ou médio: corrige antes de afetar o time\"], [\"Em produção, depois do deploy\", \"Alto: rollback, hotfix e usuário impactado\"]]"
                    },
                    {
                        "type": "code",
                        "value": "FAIL src/services/pedidos.test.js\n  cria pedido com itens válidos ... ok (12ms)\n  rejeita pedido sem itens ... falhou (5ms)\n\n    esperado: status 400\n    recebido: status 200\n\nTestes: 1 falhou, 1 passou, 2 no total\nO pull request fica bloqueado até esse teste passar."
                    },
                    {
                        "type": "text",
                        "value": "## a CI como primeira linha de defesa\n\nA CI não substitui revisão de código nem testes manuais, mas é a primeira barreira automática entre um erro e a branch principal. Ela roda em segundos ou minutos, sem depender de ninguém lembrar de nada, e por isso pega a fatia de bugs mais óbvia (erro de tipo, teste quebrado, build que não compila) bem antes de qualquer humano precisar olhar pro problema."
                    },
                    {
                        "type": "text",
                        "value": "## quanto mais tarde, mais caro\n\nVale reforçar: nenhuma dessas etapas é perfeita sozinha. O lint não pega bug de regra de negócio, e um teste mal escrito não pega nada. Mas cada camada que roda cedo reduz a chance de um problema simples virar um incidente em produção, e é exatamente esse o objetivo prático da Integração Contínua."
                    },
                    {
                        "type": "quote",
                        "value": "O bug mais barato é o que nunca sai da sua máquina; o segundo mais barato é o que a CI pega no pull request."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em qual ponto da esteira um bug costuma ser mais barato de corrigir?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Depois que a imagem já está publicada",
                                "isCorrect": false
                            },
                            {
                                "text": "Depois que o usuário relata o problema",
                                "isCorrect": false
                            },
                            {
                                "text": "Depois que o deploy já subiu em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Ainda no pull request, antes do merge",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um erro de tipo sobe direto pra branch principal porque não havia CI configurada, e só é percebido quando o build de produção falha. Se a CI estivesse ativa, quando esse erro provavelmente teria sido pego?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Só depois, numa auditoria manual mensal do código",
                                "isCorrect": false
                            },
                            {
                                "text": "No próprio pull request, antes de chegar na main",
                                "isCorrect": true
                            },
                            {
                                "text": "Só quando outro dev abrisse esse arquivo de novo",
                                "isCorrect": false
                            },
                            {
                                "text": "No exato momento em que o dev salvou o arquivo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um bug pego no editor, com lint e typecheck local, custa menos que o mesmo bug pego em produção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque, em produção, não dá mais pra corrigir nada",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o custo de corrigir é igual em qualquer etapa",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o editor corrige esse tipo de erro sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Corrigir é local e imediato, sem afetar mais ninguém",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um bug de validação passa despercebido pelo pull request, porque não existia teste cobrindo esse caso, e só é notado em produção. Além de corrigir o bug, o que a equipe deveria fazer pra baratear a próxima vez?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Remover a CI do projeto, já que ela deixou passar",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever um teste que cubra o caso, CI pega cedo",
                                "isCorrect": true
                            },
                            {
                                "text": "Proibir deploy às sextas-feiras dali em diante",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o tempo mínimo de code review pra dias",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Times que priorizam pegar o erro cedo investem tempo escrevendo lint, typecheck e testes que rodam a cada push, mesmo isso deixando o PR um pouco mais lento pra abrir. Qual a lógica econômica por trás dessa troca?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O tempo da CI é irrelevante, ninguém repara nisso",
                                "isCorrect": false
                            },
                            {
                                "text": "PR mais lento significa código de mais qualidade",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo da CI custa menos que um bug em produção",
                                "isCorrect": true
                            },
                            {
                                "text": "A CI existe só pra cumprir uma exigência formal",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Seus testes rodando sozinhos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Lembrando a trilha de Testes\n\nNa trilha de Testes você escreveu testes unitários (funções e regras isoladas) e testes de integração (fluxos que envolvem banco de dados, API, várias peças juntas). Até então, provavelmente você rodava tudo isso na mão, com um `npm test` antes de subir o código. A partir de agora, esses mesmos testes ganham um novo dono: o pipeline."
                    },
                    {
                        "type": "text",
                        "value": "## do npm test manual pro pipeline automático\n\nA diferença não está nos testes em si, eles continuam os mesmos, com os mesmos `describe` e `expect`. O que muda é quem roda e quando: em vez de depender de alguém lembrar de rodar `npm test` antes do push, o job de CI faz isso sozinho, a cada push e a cada pull request, sem exceção."
                    },
                    {
                        "type": "code",
                        "value": "name: CI\n\non: [push, pull_request]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    services:\n      postgres:\n        image: postgres:16\n        env:\n          POSTGRES_PASSWORD: postgres\n        ports:\n          - 5432:5432\n        options: >-\n          --health-cmd pg_isready\n          --health-interval 10s\n          --health-timeout 5s\n          --health-retries 5\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm test\n        env:\n          DATABASE_URL: postgres://postgres:postgres@localhost:5432/postgres"
                    },
                    {
                        "type": "text",
                        "value": "## um banco efêmero, só pro job\n\nRepare no bloco `services` do exemplo acima: ele sobe um Postgres do zero, só pra esse job, e derruba no final. É a mesma lógica do container do banco que você já usa no seu `docker compose` local, só que descartável: os testes de integração rodam contra um banco de verdade, sem risco de sujar dado nenhum de produção ou de dev."
                    },
                    {
                        "type": "text",
                        "value": "## guardando a branch principal\n\nJuntando com o que os módulos anteriores mostraram: branch protection exige que o check `test` passe, e esse check só fica verde se lint, typecheck, build e os testes passarem. Ou seja, a branch principal só recebe código que já provou, de forma automática, que não quebrou nada que os testes cobrem."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Antes (manual)\", \"Agora (com CI)\"], [\"Quem roda os testes\", \"O dev, na própria máquina\", \"O pipeline, sozinho\"], [\"Quando roda\", \"Se e quando alguém lembrar\", \"A cada push e pull request\"], [\"Risco de esquecer\", \"Alto: depende da disciplina de cada um\", \"Baixo: dispara automaticamente\"], [\"Cobertura garantida\", \"Só quem lembrou de testar antes\", \"Todo push e todo PR, sem exceção\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Os testes que você escreveu não sumiram, ganharam um funcionário que roda todos eles, do mesmo jeito, a cada push, pra sempre."
                    }
                ],
                "questions": [
                    {
                        "statement": "Os testes unitários e de integração escritos na trilha de Testes, depois que a CI é configurada, passam a rodar quando?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Só uma vez, na primeira configuração da CI",
                                "isCorrect": false
                            },
                            {
                                "text": "Só quando alguém lembra de rodar na máquina",
                                "isCorrect": false
                            },
                            {
                                "text": "Só depois que a aplicação já está no ar",
                                "isCorrect": false
                            },
                            {
                                "text": "Automaticamente, a cada push e pull request",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "No workflow de CI, o que costuma substituir o comando que o dev rodava manualmente pra testar (como npm test) na própria máquina?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um comando totalmente diferente, exclusivo da nuvem",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum comando, a CI só analisa o código visualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Um step do job que roda esse mesmo comando de teste",
                                "isCorrect": true
                            },
                            {
                                "text": "Um serviço externo que reescreve os testes sozinho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Testes de integração costumam precisar de um banco de dados de verdade. Num job de CI no GitHub Actions, como isso costuma ser resolvido sem depender de um banco externo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Com um serviço de banco efêmero, só pro job",
                                "isCorrect": true
                            },
                            {
                                "text": "Instalando o banco direto na máquina do dev",
                                "isCorrect": false
                            },
                            {
                                "text": "Pulando os testes de integração dentro da CI",
                                "isCorrect": false
                            },
                            {
                                "text": "Apontando os testes pro banco de produção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pull request tem um teste de integração que falha só na CI (na máquina do dev local, passava). Investigando, o dev percebe que o teste dependia de um dado que só existia no banco da própria máquina. O que isso revela sobre o teste?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele deveria ter sido apagado da suíte de testes",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele estava correto, quem falha sempre é a CI",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele não era isolado o bastante pro ambiente da CI",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele só funciona quando é rodado depois das 18h",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Com a CI rodando os testes a cada push, um time percebe que o pipeline de um PR ficou verde, mas mesmo assim um bug de regra de negócio chega em produção dias depois. O que essa situação diz sobre o que a CI garante?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A CI garante regra de negócio, não sintaxe",
                                "isCorrect": false
                            },
                            {
                                "text": "A CI só funciona bem em times pequenos",
                                "isCorrect": false
                            },
                            {
                                "text": "A CI só garante o que os testes cobrem",
                                "isCorrect": true
                            },
                            {
                                "text": "A CI garante que o código nunca tem bug",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - GitHub Actions na prática",
        "aulas": [
            {
                "titulo": "O arquivo de workflow e o gatilho",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# GitHub Actions na prática\n\nNos módulos anteriores você entendeu por que automatizar o caminho do código até o ar e como a Integração Contínua barra um merge quebrado. Chegou a hora de abrir o capô e ver como isso é escrito de verdade: com **GitHub Actions**, a ferramenta de CI/CD que roda direto no seu repositório do GitHub, sem precisar de um servidor separado só pra isso.\n\nTudo começa com um arquivo. Um arquivo de texto, em YAML, que descreve o que deve acontecer e quando. Esse arquivo é o **workflow**."
                    },
                    {
                        "type": "text",
                        "value": "## Onde o workflow mora\n\nTodo workflow do GitHub Actions vive dentro da pasta `.github/workflows/` na raiz do repositório, num arquivo `.yml` (ou `.yaml`). Não existe configuração externa, não precisa cadastrar nada em outro serviço: o GitHub olha essa pasta automaticamente. Assim que você faz push de um arquivo ali dentro, ele já está valendo.\n\nUm repositório pode ter vários workflows ao mesmo tempo, cada um no seu próprio arquivo: um pra testar o código, outro pra publicar a imagem Docker, outro pra fazer deploy. O nome do arquivo é livre (`ci.yml`, `tests.yml`, `deploy.yml`), quem manda é o conteúdo dentro dele."
                    },
                    {
                        "type": "code",
                        "value": "name: CI\n\non: push\n\njobs:\n  ola-mundo:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo \"Rodando no GitHub Actions\"\n"
                    },
                    {
                        "type": "text",
                        "value": "## O gatilho: o campo on\n\nO campo `on` define **o que dispara** o workflow. Sem gatilho, o arquivo fica parado, ele nunca roda sozinho. Os gatilhos mais comuns num projeto de back-end são:\n\n- `push`: dispara a cada envio de commits pra um branch.\n- `pull_request`: dispara quando um PR é aberto ou atualizado, antes mesmo do merge.\n- `workflow_dispatch`: permite disparar manualmente, pelo próprio GitHub.\n- `schedule`: dispara em horários fixos, como um cron job.\n\nÉ comum combinar `push` e `pull_request` no mesmo workflow: assim o código é validado tanto quando alguém sobe direto num branch quanto quando abre um PR pedindo revisão."
                    },
                    {
                        "type": "code",
                        "value": "on:\n  push:\n    branches:\n      - main\n  pull_request:\n    branches:\n      - main\n"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Gatilho\", \"Quando dispara\"], [\"push\", \"A cada commit enviado para o branch configurado\"], [\"pull_request\", \"Ao abrir ou atualizar um pull request\"], [\"workflow_dispatch\", \"Quando alguém aciona manualmente pelo GitHub\"], [\"schedule\", \"Em horários definidos, no formato de cron\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Sem gatilho não tem automação: é o campo on que transforma um arquivo YAML parado num pipeline que reage ao que acontece no repositório."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em que pasta do repositório o GitHub Actions procura os arquivos de workflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": ".github/workflows/",
                                "isCorrect": true
                            },
                            {
                                "text": ".github/actions/",
                                "isCorrect": false
                            },
                            {
                                "text": ".github/pipelines/",
                                "isCorrect": false
                            },
                            {
                                "text": ".ci/workflows/",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual campo do workflow define o evento que dispara sua execução?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "on",
                                "isCorrect": true
                            },
                            {
                                "text": "jobs",
                                "isCorrect": false
                            },
                            {
                                "text": "runs-on",
                                "isCorrect": false
                            },
                            {
                                "text": "steps",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer que o workflow rode quando alguém abrir um pull request pro branch main, mas não a cada push direto nesse branch. Qual configuração usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "on: pull_request, filtrando pro branch main",
                                "isCorrect": true
                            },
                            {
                                "text": "on: push, filtrando também pro branch main",
                                "isCorrect": false
                            },
                            {
                                "text": "on: workflow_dispatch, disparado a cada PR",
                                "isCorrect": false
                            },
                            {
                                "text": "on: schedule, configurado a cada abertura de PR",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual extensão de arquivo o GitHub Actions reconhece para um workflow?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": ".yml",
                                "isCorrect": true
                            },
                            {
                                "text": ".json",
                                "isCorrect": false
                            },
                            {
                                "text": ".config",
                                "isCorrect": false
                            },
                            {
                                "text": ".actions",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um workflow tem on: push, sem nenhum filtro de branches. Em quais branches ele passa a rodar a cada push?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Em qualquer branch do repositório que receber um push",
                                "isCorrect": true
                            },
                            {
                                "text": "Somente no branch main, que o GitHub assume por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente nos branches que já tiverem um pull request aberto",
                                "isCorrect": false
                            },
                            {
                                "text": "Em nenhum branch, até alguém adicionar um filtro",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Jobs, steps, uses e run",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Jobs: as fases do pipeline\n\nDentro de um workflow, o trabalho é organizado em **jobs**. Cada job roda numa máquina virtual (o runner) do zero, isolada dos outros jobs. Por padrão, se um workflow tem mais de um job, eles rodam **em paralelo**, ao mesmo tempo, cada um na sua própria máquina.\n\nIsso muda quando um job depende do resultado de outro (por exemplo, só publicar a imagem Docker se os testes passarem). Nesse caso existe o campo `needs`, que faz um job esperar outro terminar antes de começar. Sem `needs`, é cada job por si."
                    },
                    {
                        "type": "text",
                        "value": "## runs-on: escolhendo o runner\n\nTodo job precisa dizer em que tipo de máquina ele roda, no campo `runs-on`. O mais comum em projetos de back-end é `ubuntu-latest`: uma máquina virtual Linux, limpa, que o GitHub sobe, usa e descarta a cada execução. Também existem `windows-latest` e `macos-latest`, pra quando o projeto precisa testar em outro sistema operacional.\n\nComo o runner é descartado ao fim da execução, ele sempre começa vazio: sem o seu código, sem Node instalado, sem nada. Cada workflow precisa montar esse ambiente do zero, e é isso que os steps fazem."
                    },
                    {
                        "type": "code",
                        "value": "jobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Mostrar versão do sistema\n        run: cat /etc/os-release\n      - name: Rodar os testes\n        run: npm test\n"
                    },
                    {
                        "type": "text",
                        "value": "## steps, uses e run\n\nUm job é uma sequência de **steps**, executados um após o outro, de cima pra baixo. Se um step falhar, os seguintes não rodam e o job inteiro é marcado como falho.\n\nCada step faz uma coisa de dois jeitos possíveis:\n\n- `run`: executa um comando de shell diretamente, o mesmo que você digitaria no terminal (`npm install`, `npm test`, `echo \"oi\"`).\n- `uses`: aponta pra uma **action** já pronta, um bloco de automação reutilizável, publicado por alguém (o próprio GitHub, ou a comunidade)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Campo\", \"O que faz\"], [\"run\", \"Executa um ou mais comandos de shell direto no runner\"], [\"uses\", \"Executa uma action pronta, identificada como dono/repositorio@versao\"]]"
                    },
                    {
                        "type": "code",
                        "value": "steps:\n  - name: Instalar e validar\n    run: |\n      npm ci\n      npx tsc --noEmit\n      npm test\n"
                    },
                    {
                        "type": "quote",
                        "value": "Job é a unidade que roda numa máquina isolada; step é cada tarefa dentro dele. run manda o runner executar um comando; uses pede emprestado um bloco de automação que outra pessoa já escreveu."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o campo runs-on define dentro de um job?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A máquina virtual onde o job vai rodar",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome do repositório onde o workflow mora",
                                "isCorrect": false
                            },
                            {
                                "text": "O horário em que o job deve começar a rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de vezes que o job será repetido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença entre um step com run e um step com uses?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "run executa comandos de shell; uses executa actions prontas",
                                "isCorrect": true
                            },
                            {
                                "text": "run executa actions prontas; uses executa comandos de shell",
                                "isCorrect": false
                            },
                            {
                                "text": "run só roda em runners Linux; uses só roda em runners Windows",
                                "isCorrect": false
                            },
                            {
                                "text": "run roda um step por vez; uses roda vários steps de uma vez",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de um job, um step do meio da lista falha. O que acontece com os steps seguintes desse mesmo job?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Eles não são executados, e o job é marcado como falho",
                                "isCorrect": true
                            },
                            {
                                "text": "Eles continuam rodando normalmente, só aquele step falha",
                                "isCorrect": false
                            },
                            {
                                "text": "Eles são executados novamente do início, até passar",
                                "isCorrect": false
                            },
                            {
                                "text": "Eles são pulados só nesse job, mas rodam nos outros jobs",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um workflow tem dois jobs, test e deploy. Você quer que deploy só comece depois que test terminar com sucesso. Qual campo usar no job deploy?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "needs, apontando para o job test",
                                "isCorrect": true
                            },
                            {
                                "text": "runs-on, apontando para o job test",
                                "isCorrect": false
                            },
                            {
                                "text": "on, apontando para o job test",
                                "isCorrect": false
                            },
                            {
                                "text": "steps, apontando para o job test",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por padrão, sem usar needs, como dois jobs de um mesmo workflow se comportam um em relação ao outro?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Rodam em paralelo, em runners separados, sem se esperar",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodam em sequência, na ordem em que aparecem no arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodam no mesmo runner, compartilhando a mesma máquina virtual",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodam só quando o primeiro job termina com falha",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Actions reutilizáveis (checkout, setup-node)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que reaproveitar\n\nToda vez que um runner sobe, ele começa do zero. Quase todo workflow de back-end precisa fazer duas coisas logo de cara: baixar o código do repositório e instalar o runtime (Node, no nosso caso). Dá pra escrever isso na mão com comandos `run`, mas o GitHub e a comunidade já resolveram esse problema: são as **actions**.\n\nUma action é um pacote de automação pronto, versionado, que você referencia pelo campo `uses`, no formato `dono/repositorio@versao`. Duas delas aparecem em praticamente todo workflow de Node: `actions/checkout` e `actions/setup-node`."
                    },
                    {
                        "type": "text",
                        "value": "## actions/checkout: baixando o código\n\nO runner não vem com o seu repositório clonado. Sem esse primeiro step, os comandos seguintes (`npm ci`, `npm test`) não encontrariam nenhum arquivo pra trabalhar. A `actions/checkout` resolve isso: ela clona o repositório, no commit exato que disparou o workflow, direto na máquina do runner."
                    },
                    {
                        "type": "code",
                        "value": "steps:\n  - name: Baixar o código\n    uses: actions/checkout@v4\n"
                    },
                    {
                        "type": "text",
                        "value": "## actions/setup-node: instalando o Node\n\nDepois do código, falta o runtime. A `actions/setup-node` instala a versão do Node.js que você especificar, deixando `node` e `npm` disponíveis pros próximos steps. O parâmetro `node-version` é passado pelo campo `with`, que serve pra configurar qualquer action."
                    },
                    {
                        "type": "code",
                        "value": "steps:\n  - name: Baixar o código\n    uses: actions/checkout@v4\n  - name: Instalar o Node\n    uses: actions/setup-node@v4\n    with:\n      node-version: \"20\"\n"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Action\", \"O que faz\"], [\"actions/checkout\", \"Clona o repositório no runner, no commit que disparou o workflow\"], [\"actions/setup-node\", \"Instala uma versão do Node.js e disponibiliza npm no runner\"], [\"actions/cache\", \"Guarda arquivos entre execuções, como dependências já baixadas\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O runner nasce vazio a cada execução: checkout traz o código, setup-node traz o runtime. Nenhum comando de teste ou build funciona sem essas duas peças antes."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para que serve a action actions/checkout num workflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Para clonar o código do repositório no runner",
                                "isCorrect": true
                            },
                            {
                                "text": "Para instalar a versão do Node.js no runner",
                                "isCorrect": false
                            },
                            {
                                "text": "Para publicar a imagem Docker num registry",
                                "isCorrect": false
                            },
                            {
                                "text": "Para enviar uma notificação ao final do workflow",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No step uses: actions/setup-node@v4, com with: node-version: \"20\", pra que serve o campo with?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Para passar parâmetros de configuração pra action",
                                "isCorrect": true
                            },
                            {
                                "text": "Para definir em qual branch aquele step vai rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "Para listar os outros steps que vêm depois dele",
                                "isCorrect": false
                            },
                            {
                                "text": "Para nomear o job inteiro que contém aquele step",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O job de teste falha logo no primeiro comando, com um erro de que o arquivo package.json não foi encontrado, e o workflow não tem nenhum uses configurado. Qual step provavelmente está faltando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "actions/checkout, pra baixar o código antes dos outros comandos",
                                "isCorrect": true
                            },
                            {
                                "text": "actions/setup-node, pra instalar o Node antes dos outros comandos",
                                "isCorrect": false
                            },
                            {
                                "text": "actions/cache, pra restaurar as dependências antes dos outros comandos",
                                "isCorrect": false
                            },
                            {
                                "text": "actions/upload-artifact, pra salvar os arquivos antes dos outros comandos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No trecho uses: actions/setup-node@v4, o que representa o @v4?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A versão da action que está sendo usada",
                                "isCorrect": true
                            },
                            {
                                "text": "A versão do Node.js que será instalada",
                                "isCorrect": false
                            },
                            {
                                "text": "A versão do npm que acompanha o runner",
                                "isCorrect": false
                            },
                            {
                                "text": "A versão do sistema operacional do runner",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que mesmo um job simples, que só roda um comando de teste, geralmente precisa de actions/checkout como primeiro step?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o runner sobe limpo a cada execução, sem nenhum código",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o comando de teste só funciona depois de duas actions seguidas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o GitHub exige pelo menos duas actions em todo job por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque actions/checkout também instala as dependências do projeto",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Um workflow de CI de ponta a ponta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Juntando as peças\n\nChegou a hora de escrever um workflow completo, do tipo que você usaria de verdade num projeto Node com Postgres (o mesmo que foi ganhando forma nas trilhas de Testes, Banco de Dados e Docker). O objetivo: a cada push ou pull request, o GitHub Actions baixa o código, instala as dependências, confere os tipos e roda a suíte de testes, tudo sozinho, sem ninguém digitar um comando."
                    },
                    {
                        "type": "code",
                        "value": "name: CI\n\non:\n  push:\n    branches:\n      - main\n  pull_request:\n    branches:\n      - main\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Baixar o código\n        uses: actions/checkout@v4\n\n      - name: Instalar o Node\n        uses: actions/setup-node@v4\n        with:\n          node-version: \"20\"\n\n      - name: Instalar as dependências\n        run: npm ci\n\n      - name: Checar os tipos\n        run: npx tsc --noEmit\n\n      - name: Rodar os testes\n        run: npm test\n"
                    },
                    {
                        "type": "text",
                        "value": "## O que cada step faz\n\nRepare que o workflow é só a sequência que você já executaria na sua máquina, formalizada em YAML:\n\n- **checkout** e **setup-node** preparam o ambiente (código e runtime), como visto na aula anterior.\n- **npm ci** instala as dependências exatamente como estão travadas no `package-lock.json`.\n- **npx tsc --noEmit** roda o compilador do TypeScript só pra checar os tipos, sem gerar nenhum arquivo `.js` de saída.\n- **npm test** executa a suíte de testes da trilha de Testes, agora disparada automaticamente a cada mudança.\n\nA ordem importa: checkout antes de tudo (sem código não tem o que instalar), setup-node antes do npm ci (sem Node não tem npm), e o typecheck antes dos testes, pra pegar erro de tipo antes de gastar tempo rodando teste."
                    },
                    {
                        "type": "code",
                        "value": "npm ci\nnpx tsc --noEmit\nnpm test\n"
                    },
                    {
                        "type": "text",
                        "value": "## npm ci, não npm install\n\nEm ambiente de CI, o comando certo é `npm ci`, não `npm install`. A diferença parece pequena, mas importa: `npm ci` instala exatamente o que está no `package-lock.json`, sem recalcular nada, e falha se o lockfile estiver desalinhado com o `package.json`. Isso torna a instalação reprodutível, mais rápida, e garante que o CI está testando as mesmas versões que rodam em produção."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"npm ci\", \"npm install\"], [\"Usa o package-lock.json\", \"Exatamente como está, sem alterar\", \"Pode atualizar o lockfile\"], [\"Velocidade\", \"Mais rápido, feito pra automação\", \"Mais lento, faz mais checagens\"], [\"Se o lockfile estiver desalinhado\", \"Falha imediatamente\", \"Ajusta e segue em frente\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um workflow de CI não inventa nada novo: ele automatiza a mesma sequência de comandos que você já roda na sua máquina antes de dar push."
                    }
                ],
                "questions": [
                    {
                        "statement": "No workflow de CI, qual comando garante que as dependências instaladas batem exatamente com o package-lock.json?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "npm ci",
                                "isCorrect": true
                            },
                            {
                                "text": "npm install",
                                "isCorrect": false
                            },
                            {
                                "text": "npm update",
                                "isCorrect": false
                            },
                            {
                                "text": "npm audit",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o comando npx tsc --noEmit faz num step do workflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Confere os tipos do TypeScript, sem gerar arquivos",
                                "isCorrect": true
                            },
                            {
                                "text": "Compila o TypeScript e gera os arquivos finais",
                                "isCorrect": false
                            },
                            {
                                "text": "Instala o compilador do TypeScript no runner",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda a suíte de testes automatizados do projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No job de teste, o step npm ci passa, mas npx tsc --noEmit falha com erro de tipo. O que acontece com o step npm test e com o job?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "npm test não roda, e o job é marcado como falho",
                                "isCorrect": true
                            },
                            {
                                "text": "npm test roda normalmente, e o job é marcado como concluído",
                                "isCorrect": false
                            },
                            {
                                "text": "npm test roda em modo de aviso, e o job fica pendente",
                                "isCorrect": false
                            },
                            {
                                "text": "npm test roda antes, pra decidir se o tsc deveria ter rodado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o step de checkout precisa vir antes do step que roda npm ci no workflow?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o npm ci depende do código que o checkout traz pro runner",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o npm ci depende do Node que o checkout instala no runner",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a ordem dos steps não importa, isso é só uma convenção",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o GitHub Actions exige checkout como primeiro step sempre",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além de reprodutibilidade, por que o npm ci costuma ser mais indicado que o npm install dentro de um pipeline de CI?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ele é mais rápido, porque pula o recálculo de dependências",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele é mais lento, porque valida cada pacote contra o registry",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele ignora o package-lock.json, o que acelera a instalação",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele instala só as dependências de dev, o que acelera tudo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Secrets, cache e matrix",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Secrets: dado sensível nunca no código\n\nToken de API, senha de banco, chave de deploy: nada disso pode aparecer escrito no YAML nem em nenhum arquivo versionado no Git. Quem olhar o histórico do repositório veria tudo, mesmo que o arquivo seja apagado depois.\n\nO GitHub Actions resolve isso com **secrets**: valores cadastrados nas configurações do repositório (ou da organização), fora do código, e acessados dentro do workflow pela sintaxe `${{ secrets.NOME }}`. O valor nunca aparece no log de execução: o próprio GitHub mascara qualquer secret que tente vazar na saída."
                    },
                    {
                        "type": "code",
                        "value": "jobs:\n  test:\n    runs-on: ubuntu-latest\n    env:\n      DATABASE_URL: ${{ secrets.DATABASE_URL }}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"20\"\n      - run: npm ci\n      - run: npm test\n"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Onde fica o valor\", \"Quem vê\", \"Indicado pra dado sensível\"], [\"Direto no YAML\", \"Qualquer um com acesso ao repositório\", \"Nunca\"], [\"Variável de ambiente comum\", \"Aparece em log e em debug com facilidade\", \"Não\"], [\"Secret do Actions (${{ secrets.NOME }})\", \"Mascarado nos logs, gerenciado à parte\", \"Sim\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Cache: não baixar tudo de novo toda vez\n\nSem cache, todo job de teste baixa as mesmas dependências do zero, sempre. A action `actions/setup-node` já traz um jeito simples de resolver isso: o parâmetro `cache`, que guarda a pasta de dependências do npm entre uma execução e outra. O ganho aparece no tempo total do pipeline, que cai bastante em projetos com muitas dependências."
                    },
                    {
                        "type": "code",
                        "value": "jobs:\n  test:\n    runs-on: ubuntu-latest\n    strategy:\n      matrix:\n        node-version: [\"18.x\", \"20.x\"]\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: ${{ matrix.node-version }}\n          cache: \"npm\"\n      - run: npm ci\n      - run: npm test\n"
                    },
                    {
                        "type": "text",
                        "value": "## matrix: testando mais de uma versão de uma vez\n\nO campo `strategy.matrix`, visto no código acima, faz o GitHub Actions rodar o mesmo job várias vezes, uma pra cada valor da lista, em paralelo. No exemplo, o job de teste roda duas vezes: uma no Node 18, outra no Node 20. É útil pra garantir que o projeto funciona nas versões que importam pra ele, sem duplicar o workflow inteiro.\n\nIsso tudo (secrets, cache, matrix) é o mesmo tipo de peça que sustenta o workflow real da plataforma: a própria ensina.dev roda no GitHub Actions, com um job de teste, um de build do frontend e um de deploy (esse último só dispara no branch principal; nos demais, é pulado)."
                    },
                    {
                        "type": "quote",
                        "value": "Secret protege o que não pode vazar, cache economiza tempo repetido, matrix multiplica a cobertura: nenhum dos três muda o que o pipeline testa, só torna a esteira mais segura e mais rápida."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual sintaxe é usada pra acessar um secret configurado no GitHub Actions dentro de um workflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "${{ secrets.NOME }}",
                                "isCorrect": true
                            },
                            {
                                "text": "$secrets(NOME)",
                                "isCorrect": false
                            },
                            {
                                "text": "#{secrets.NOME}",
                                "isCorrect": false
                            },
                            {
                                "text": "@secrets[NOME]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma senha de banco não deve ser escrita direto no arquivo YAML do workflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque fica exposta pra qualquer um que acessar o repositório",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o GitHub Actions não permite salvar arquivos com senhas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o YAML não aceita texto com caracteres especiais",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o workflow não roda se houver uma senha no arquivo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seu job de testes precisa de uma URL de conexão com o banco pra rodar os testes de integração, e essa URL contém a senha do banco. Qual é a forma correta de disponibilizar esse valor pro job?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Guardar como secret e usar ${{ secrets.DATABASE_URL }}",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever a URL direto no campo env do job, pra ficar visível",
                                "isCorrect": false
                            },
                            {
                                "text": "Colocar a URL num arquivo .env e commitar junto com o código",
                                "isCorrect": false
                            },
                            {
                                "text": "Passar a URL como comentário no topo do arquivo de workflow",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o parâmetro cache: \"npm\" no step do actions/setup-node faz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reaproveita dependências baixadas entre execuções",
                                "isCorrect": true
                            },
                            {
                                "text": "Impede que o npm ci rode mais de uma vez no workflow",
                                "isCorrect": false
                            },
                            {
                                "text": "Guarda o resultado dos testes pra não rodar de novo",
                                "isCorrect": false
                            },
                            {
                                "text": "Publica os pacotes instalados num registry privado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um workflow define strategy.matrix com node-version: [\"18.x\", \"20.x\"] no job de teste. Quantas vezes esse job roda, e como?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Duas vezes, em paralelo, uma pra cada versão listada",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma vez só, testando as duas versões dentro do mesmo runner",
                                "isCorrect": false
                            },
                            {
                                "text": "Duas vezes, em sequência, esperando a primeira terminar",
                                "isCorrect": false
                            },
                            {
                                "text": "Quatro vezes, cruzando as versões com os sistemas operacionais",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Build e publicação da imagem",
        "aulas": [
            {
                "titulo": "Buildar a imagem no pipeline",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A imagem Docker entra no pipeline\n\n## Do docker build na sua máquina pro docker build no pipeline\n\nNo módulo anterior o pipeline ganhou um job de teste: a cada push, ele faz checkout, roda `npm ci` e executa o typecheck e os testes sozinho. Se algo quebrar, o merge fica barrado. Só que até aqui a imagem Docker da aplicação, aquela que você escreveu lá na trilha de Docker com `docker build -t minha-api .`, continua sendo construída na mão, por alguém, na própria máquina.\n\nEsse módulo fecha essa lacuna: depois que os testes passam, o próprio pipeline builda a imagem e publica ela num registry, sem ninguém digitar docker build de novo."
                    },
                    {
                        "type": "code",
                        "value": "name: Pipeline\n\non:\n  push:\n    branches: [main]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm test\n\n  build:\n    needs: test\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Build da imagem\n        run: docker build -t minha-api:${{ github.sha }} ."
                    },
                    {
                        "type": "text",
                        "value": "## O build depende do teste passar\n\nRepare no `needs: test` dentro do job build: é ele quem diz pro GitHub Actions que esse job só deve rodar depois que o test terminar com sucesso. Sem esse campo, os dois jobs rodariam em paralelo, e o pipeline poderia acabar construindo (e mais adiante publicando) a imagem de um código que nem passou nos testes.\n\nSe o job test falhar, o build nem chega a rodar: o GitHub Actions marca esse job como pulado e o restante do pipeline para ali. É a mesma lógica de barrar o merge que você já viu no módulo de Integração Contínua, agora aplicada a mais um estágio da esteira."
                    },
                    {
                        "type": "code",
                        "value": "# na trilha de Docker, esse comando rodava na sua máquina\ndocker build -t minha-api .\n\n# no pipeline, o mesmo build roda no runner, a cada push\ndocker build -t minha-api:${{ github.sha }} ."
                    },
                    {
                        "type": "text",
                        "value": "## Uma máquina nova a cada execução\n\nO runs-on: ubuntu-latest sobe uma máquina limpa pra cada job, o runner. Ela não tem nada do que rodou antes: nem o código, nem camadas de imagem, nem node_modules. É por isso que o primeiro step do build é sempre um actions/checkout, buscando o repositório de novo, mesmo que o job test já tenha feito checkout minutos antes. Cada job do workflow roda isolado, em runners diferentes, sem disco compartilhado entre eles por padrão.\n\nA vantagem de reconstruir do zero a cada vez é justamente essa: a imagem publicada nunca depende de uma pasta esquecida ou de uma dependência instalada só na máquina de um desenvolvedor. Ela nasce sempre do mesmo jeito, a partir do Dockerfile versionado no repositório."
                    },
                    {
                        "type": "quote",
                        "value": "Antes, buildar a imagem era mais um passo pra alguém lembrar de fazer certo. Agora é só mais um job do pipeline: roda depois do teste, sempre do mesmo jeito, sem exceção."
                    }
                ],
                "questions": [
                    {
                        "statement": "Dentro de um job do workflow, qual campo faz esse job só rodar depois que outro job (test, por exemplo) terminar com sucesso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "needs: test, listando o job test como pré-requisito do job atual.",
                                "isCorrect": true
                            },
                            {
                                "text": "on: test, apontando o job test como gatilho do job atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "depends: test, declarando o job test como dependência direta.",
                                "isCorrect": false
                            },
                            {
                                "text": "steps: test, referenciando o job test dentro da lista de steps.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O job test falhou numa execução do pipeline, e o job build declara needs: test. O que acontece com o build nessa execução?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Não roda: o GitHub Actions pula jobs que dependem de um job que falhou.",
                                "isCorrect": true
                            },
                            {
                                "text": "Roda normalmente: needs só define a ordem, não bloqueia em caso de falha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda, mas pulando só os steps que fazem docker build dentro dele.",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda em paralelo ao test, já que needs não afeta jobs de build.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que faz mais sentido buildar a imagem Docker dentro do pipeline, e não só na máquina de quem vai fazer o deploy?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Garante que a imagem seja sempre construída do mesmo jeito, a partir do código já testado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Builds feitos numa máquina local ficam bloqueados pelo Docker Hub atualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O runner do GitHub Actions compila o código bem mais rápido que qualquer notebook.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma imagem construída localmente sempre acaba ficando maior que uma feita em CI.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que significa dizer que o runner do GitHub Actions é efêmero, no contexto do job de build?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma máquina nova sobe a cada execução e some ao final, sem guardar estado.",
                                "isCorrect": true
                            },
                            {
                                "text": "O runner guarda o cache de builds anteriores indefinidamente entre execuções.",
                                "isCorrect": false
                            },
                            {
                                "text": "O job só pode rodar em horários específicos configurados dentro do runner.",
                                "isCorrect": false
                            },
                            {
                                "text": "A imagem construída ali fica hospedada permanentemente dentro do runner.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O job build usa needs: test e roda em runs-on: ubuntu-latest, numa máquina diferente da que rodou o test. Isso atrapalha o build de alguma forma?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não: o build faz checkout do repositório de novo, sem depender de arquivos do job test.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim: os arquivos gerados no job test precisam ser copiados manualmente pro build.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim: dois jobs de um mesmo workflow nunca podem rodar em runners diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não: o GitHub Actions sincroniza automaticamente o disco entre todos os jobs.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O registry (Docker Hub, GHCR) e o artefato",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Pra onde a imagem construída vai\n\nLá na trilha de Docker, docker pull postgres ou docker pull redis baixavam uma imagem pronta de algum lugar: o Docker Hub. Esse lugar é um registry, um serviço que guarda imagens Docker de forma versionada, cada uma identificada por nome e tag, pronta pra ser baixada com docker pull por qualquer máquina autorizada.\n\nO job build do módulo anterior constrói a imagem dentro do runner, mas ela some quando o runner é descartado, a menos que seja publicada em algum registry antes disso. É o próximo passo da esteira."
                    },
                    {
                        "type": "text",
                        "value": "## Docker Hub e GitHub Container Registry\n\nOs dois registries mais comuns num pipeline de GitHub Actions são o Docker Hub (o mesmo de onde vêm as imagens oficiais do Postgres e do Redis, e que também aceita imagens suas) e o GitHub Container Registry, o GHCR (ghcr.io), que vive dentro da própria conta ou organização do GitHub, junto do repositório.\n\nEm produção também é comum ver registries embutidos nas nuvens (ECR na AWS, Artifact Registry no GCP, ACR no Azure) ou de outras ferramentas de CI/CD, como o registry do GitLab. O fluxo de autenticar, taggear e publicar é parecido em todos: muda basicamente o endereço e como você se autentica."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Docker Hub\",\"GitHub Container Registry (GHCR)\"],[\"Endereço da imagem\",\"seunome/minha-api (docker.io implícito)\",\"ghcr.io/seunome/minha-api\"],[\"Onde configura\",\"Conta separada em hub.docker.com\",\"Dentro da própria conta ou organização do GitHub\"],[\"Autenticação comum\",\"Access token criado no Docker Hub\",\"GITHUB_TOKEN do próprio workflow, ou um PAT\"],[\"Limite de pull gratuito\",\"Existe rate limit em contas no plano free\",\"Sem rate limit adicional dentro do GitHub\"],[\"Visibilidade padrão\",\"Pode ser pública ou privada, à sua escolha\",\"Herda a visibilidade do repositório, ajustável à parte\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# apontando a mesma imagem local pros dois registries\ndocker tag minha-api:${{ github.sha }} seunome/minha-api:${{ github.sha }}\ndocker tag minha-api:${{ github.sha }} ghcr.io/seunome/minha-api:${{ github.sha }}"
                    },
                    {
                        "type": "text",
                        "value": "## A imagem como artefato\n\nA partir do momento em que a imagem é publicada, ela vira o artefato que representa aquele código: o que o job de deploy vai baixar e rodar não é mais o repositório, é a imagem pronta. Isso muda o que a produção precisa ter instalado: nada de Node, nada de npm ci, só Docker e acesso ao registry.\n\nRepare no docker-compose.yml que você escreveu na trilha de Docker: em desenvolvimento, o service da API provavelmente usa build: ., construindo a imagem ali mesmo. Em produção, depois desse módulo, esse mesmo service passa a usar image:, apontando pro registry, e o Compose só faz o pull."
                    },
                    {
                        "type": "code",
                        "value": "# docker-compose.yml (dev): builda a imagem localmente\nservices:\n  api:\n    build: .\n\n# docker-compose.prod.yml (producao): usa a imagem publicada\nservices:\n  api:\n    image: ghcr.io/seunome/minha-api:${IMAGE_TAG}"
                    },
                    {
                        "type": "quote",
                        "value": "O registry é a ponte entre o pipeline e a produção: uma vez que a imagem está lá, não importa mais em qual runner ela foi construída, só importa que ela existe, versionada, pronta pra rodar."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um registry de imagens Docker, dentro do fluxo do pipeline?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O lugar onde a imagem construída fica armazenada e versionada, pronta pra ser baixada.",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor de produção que executa a aplicação direto a partir do código-fonte.",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo de configuração que lista as dependências usadas dentro da imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "O log que guarda o histórico detalhado de cada execução do pipeline de CI.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além do Docker Hub, qual outro registry é comum de usar, por já vir integrado ao GitHub?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O GitHub Container Registry (GHCR), ligado à mesma conta e repositório.",
                                "isCorrect": true
                            },
                            {
                                "text": "O GitHub Pages, que passa a hospedar a imagem junto do site estático.",
                                "isCorrect": false
                            },
                            {
                                "text": "O GitHub Codespaces, que guarda as imagens dos ambientes de desenvolvimento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O GitHub Marketplace, onde as imagens ficam listadas pra outros times.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que a imagem foi publicada no registry, o que o servidor de produção precisa fazer pra rodar a versão nova?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Só dar um pull da imagem no registry e reiniciar o container com ela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Clonar o repositório de novo e rodar o docker build direto na VPS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Recriar o Dockerfile do zero, conferindo se bate com o usado no build.",
                                "isCorrect": false
                            },
                            {
                                "text": "Instalar na VPS as mesmas devDependencies que o job test já usou.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma imagem publicada no Docker Hub costuma ser referenciada como seunome/minha-api. Como fica essa mesma referência publicada no GHCR?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ghcr.io/seunome/minha-api, com o domínio do registry explícito no nome.",
                                "isCorrect": true
                            },
                            {
                                "text": "minha-api.ghcr.io, com o nome da imagem antes do domínio do registry.",
                                "isCorrect": false
                            },
                            {
                                "text": "github.com/seunome/minha-api, reaproveitando a URL do próprio repositório.",
                                "isCorrect": false
                            },
                            {
                                "text": "ghcr/seunome/minha-api, sem o domínio completo do registry na frente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time troca o registry de Docker Hub pra GHCR, só pra centralizar tudo dentro do GitHub. Isso muda algo no docker-compose.yml de produção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sim: o campo image muda, porque o nome da imagem inclui o registry.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não: o Compose descobre sozinho de qual registry puxar a imagem certa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só no docker-compose.yml usado dentro do ambiente de teste.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não: o GHCR só funciona junto do Kubernetes, nunca do Docker Compose.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Login seguro via secret",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que a senha não pode estar no workflow\n\nPra publicar uma imagem num registry privado (ou até no seu próprio namespace de um registry público), o pipeline precisa se autenticar antes do docker push, do mesmo jeito que você digitava docker login na sua máquina na trilha de Docker.\n\nA diferença é que o arquivo .github/workflows/*.yml fica versionado no repositório. Colocar usuário e senha em texto puro ali expõe essa credencial pra qualquer pessoa com acesso ao código, e deixa ela guardada pra sempre no histórico do Git. É o mesmo problema de secrets que o módulo de GitHub Actions já apresentou, agora aplicado ao login do registry."
                    },
                    {
                        "type": "code",
                        "value": "- name: Login no registry\n  run: echo \"${{ secrets.REGISTRY_TOKEN }}\" | docker login ghcr.io -u ${{ github.actor }} --password-stdin"
                    },
                    {
                        "type": "text",
                        "value": "## O secret fica fora do código\n\nsecrets.REGISTRY_TOKEN não é um valor escrito no YAML: é uma referência a um segredo cadastrado nas configurações do repositório, em Settings > Secrets and variables > Actions, visível só pra quem tem permissão de administrar o repositório. O GitHub Actions injeta o valor real só durante a execução, e ainda mascara qualquer ocorrência dele nos logs, trocando por asteriscos se o valor aparecer impresso.\n\nO --password-stdin também importa: ele lê a senha pela entrada padrão, em vez de recebê-la como argumento (--password), evitando que ela fique visível na lista de processos da máquina."
                    },
                    {
                        "type": "code",
                        "value": "- name: Login no registry\n  uses: docker/login-action@v3\n  with:\n    registry: ghcr.io\n    username: ${{ github.actor }}\n    password: ${{ secrets.REGISTRY_TOKEN }}"
                    },
                    {
                        "type": "text",
                        "value": "## GITHUB_TOKEN ou um token à parte\n\nPra publicar no GHCR, geralmente basta o secrets.GITHUB_TOKEN, um token que o próprio GitHub Actions gera sozinho a cada execução do workflow, com permissão configurável de escrita em packages. Não precisa cadastrar nada à mão.\n\nJá pro Docker Hub (ou outro registry fora do GitHub), é preciso criar um access token nas configurações da sua conta nesse registry e cadastrar esse valor como secret do repositório, geralmente com um nome como REGISTRY_TOKEN ou DOCKERHUB_TOKEN. A ideia se repete: nunca a senha da conta direto, sempre um token dedicado, que dá pra revogar sem trocar a senha principal."
                    },
                    {
                        "type": "quote",
                        "value": "Login em registry não é diferente de qualquer outro segredo do pipeline: nunca escrito no código, sempre injetado em tempo de execução, e revogável sem depender de trocar a senha de ninguém."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que não se deve colocar usuário e senha do registry direto no arquivo do workflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o workflow fica versionado no repositório, visível pra quem tiver acesso a ele.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o GitHub Actions não aceita nenhuma string solta escrita dentro do YAML.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso deixa o job de build sensivelmente mais lento pra executar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Docker rejeita comandos de login escritos dentro de um arquivo YAML.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Onde fica guardado o valor usado como secrets.REGISTRY_TOKEN num workflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Nas configurações de secrets do repositório no GitHub, fora do código versionado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Num arquivo .env versionado junto com o restante dos arquivos do workflow.",
                                "isCorrect": false
                            },
                            {
                                "text": "No próprio arquivo .yml, como um valor criptografado escrito dentro dele.",
                                "isCorrect": false
                            },
                            {
                                "text": "Num comentário no topo do Dockerfile, lido pelo Actions durante o build.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um step faz o login com echo do token e --password-stdin, em vez de passar a senha direto na flag --password. Qual o ganho disso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Evita que a senha fique exposta em texto puro na lista de processos da máquina.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixa a autenticação no registry consideravelmente mais rápida de acontecer.",
                                "isCorrect": false
                            },
                            {
                                "text": "É obrigatório, porque a flag --password foi removida das versões atuais do Docker.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só funciona assim pro GHCR: outros registries exigem sempre a flag --password.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a vantagem prática de usar a action docker/login-action em vez de escrever o docker login na mão num step run?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Padroniza o login em vários registries, usando poucos parâmetros prontos.",
                                "isCorrect": true
                            },
                            {
                                "text": "É a única forma que o GitHub Actions aceita pra autenticar num registry.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispensa o uso de secrets, porque essa action autentica de forma automática.",
                                "isCorrect": false
                            },
                            {
                                "text": "Já builda e publica a imagem sozinha, sem precisar de nenhum step depois.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Pra publicar no GHCR, muitos workflows usam secrets.GITHUB_TOKEN em vez de criar um token à parte. Por que isso funciona?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O GITHUB_TOKEN é gerado a cada execução e pode ter permissão de escrita em packages.",
                                "isCorrect": true
                            },
                            {
                                "text": "O GHCR aceita qualquer secret cadastrado no repositório, mesmo sem relação com ele.",
                                "isCorrect": false
                            },
                            {
                                "text": "O GITHUB_TOKEN sempre tem acesso de administrador a qualquer registry externo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O GITHUB_TOKEN substitui por completo o step de login, dispensando o docker login.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tags e rastreabilidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Uma imagem, vários nomes\n\nNa trilha de Docker, docker tag minha-api:1.4.0 seunome/minha-api:1.4.0 criava uma segunda referência pra mesma imagem, sem reconstruir nada. No pipeline, esse mesmo mecanismo se repete a cada execução, só que automático: a cada push, a imagem construída ganha uma ou mais tags, decididas pelo próprio workflow, sem alguém escolher um número de versão na mão."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tag\",\"Exemplo\",\"Quando usar\"],[\"sha do commit\",\"minha-api:a1b2c3d\",\"Sempre: identifica de forma exata o código que gerou a imagem\"],[\"latest\",\"minha-api:latest\",\"Apontar pro build mais recente de uma branch, pra testes manuais rápidos\"],[\"versão semântica\",\"minha-api:1.4.0\",\"Marcar releases, geralmente a partir de uma tag do Git\"],[\"branch ou ambiente\",\"minha-api:staging\",\"Publicar builds específicos de um ambiente, como staging\"]]"
                    },
                    {
                        "type": "code",
                        "value": "IMAGE=ghcr.io/seunome/minha-api\n\ndocker build \\\n  -t $IMAGE:${{ github.sha }} \\\n  -t $IMAGE:latest \\\n  .\n\ndocker push $IMAGE:${{ github.sha }}\ndocker push $IMAGE:latest"
                    },
                    {
                        "type": "text",
                        "value": "## Saber exatamente o que está no ar\n\nA tag latest é conveniente, mas ambígua: daqui a um mês, minha-api:latest vai apontar pra um build completamente diferente do de hoje, e olhando só o nome não dá pra saber qual. Já minha-api:a1b2c3d não muda nunca: esse sha sempre representa o mesmo commit, com o mesmo código.\n\nNa prática, isso significa que, se algo quebrar em produção, dá pra olhar qual tag está rodando (no docker ps, no docker compose config, ou no log do próprio deploy) e ir direto pro commit correspondente no GitHub, sem precisar adivinhar qual código gerou aquele comportamento."
                    },
                    {
                        "type": "code",
                        "value": "# publicando tambem uma tag pelo nome da branch, pra ambientes de teste\ndocker tag minha-api:${{ github.sha }} $IMAGE:${{ github.ref_name }}\ndocker push $IMAGE:${{ github.ref_name }}"
                    },
                    {
                        "type": "quote",
                        "value": "A tag latest responde qual é o mais novo. O sha do commit responde qual código exatamente é esse. Um pipeline maduro publica os dois, mas só confia no segundo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual tag identifica, de forma exata, qual commit gerou determinada imagem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A tag com o sha do commit, porque é gerada a partir de github.sha.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tag latest, porque aponta pro build mais recente disponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tag dev, porque é usada durante o desenvolvimento da funcionalidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tag stable, porque é reservada pras versões consideradas estáveis.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Pra que serve taggear a mesma imagem mais de uma vez, por exemplo com latest e com o sha do commit?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dá pra referenciar a mesma imagem de formas diferentes, sem duplicar o build.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada tag nova gera uma cópia física separada da imagem, guardada de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker exige pelo menos duas tags antes de aceitar qualquer push.",
                                "isCorrect": false
                            },
                            {
                                "text": "Toda tag nova dispara automaticamente uma nova reconstrução da imagem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um deploy, aparece um bug em produção e o time precisa saber exatamente qual código está rodando. Qual tag responde isso sem chute?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A tag com o sha, porque aponta exatamente pro commit que gerou a imagem.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tag latest, porque sempre reflete o estado mais recente do repositório.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tag de ambiente, tipo staging, porque indica onde a imagem foi publicada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma tag resolve isso: só reconstruindo a imagem localmente pra comparar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num workflow, a tag minha-api:${{ github.sha }} é montada a partir de qual valor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Do hash do commit que disparou aquela execução do workflow.",
                                "isCorrect": true
                            },
                            {
                                "text": "Do número sequencial dessa execução dentro do workflow (o run number).",
                                "isCorrect": false
                            },
                            {
                                "text": "Do nome da branch que recebeu o push que disparou o workflow.",
                                "isCorrect": false
                            },
                            {
                                "text": "Da data e hora em que o job de build começou a rodar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Comparando com o versionamento manual feito na trilha de Docker (docker tag minha-api:1.4.0), qual a vantagem de taggear automaticamente com o sha a cada push?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Toda mudança ganha uma tag rastreável, sem exigir que alguém lembre disso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma tag com sha ocupa bem menos espaço em disco do que uma tag de versão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Registries privados como o GHCR só aceitam imagens tagueadas com o sha.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tag com sha dispensa a necessidade de testar a imagem antes do deploy.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cache de build no CI",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O cache que não sobrevive entre execuções\n\nNa trilha de Docker, a aula sobre camadas mostrou que o Docker reaproveita camadas que não mudaram entre um docker build e outro, e que a ordem das instruções no Dockerfile importa justamente por causa disso: copiar o package.json e rodar npm ci antes de copiar o resto do código evita reinstalar dependências toda vez que só um arquivo .js muda.\n\nO problema é que, no pipeline, cada execução sobe um runner novo, sem nenhuma camada de builds anteriores. Sem ajuda extra, todo docker build no CI recomeça do zero, mesmo que nada tenha mudado nas dependências."
                    },
                    {
                        "type": "text",
                        "value": "## Guardando o cache fora do runner\n\nA solução é guardar as camadas em algum lugar que sobrevive entre execuções, e recuperar esse cache no início do próximo build. Duas fontes comuns: o cache do próprio GitHub Actions (type=gha), pensado exatamente pra isso, ou a última imagem já publicada no registry, usada como fonte de camadas (type=registry). Escrever esse encadeamento na mão, com docker build --cache-from, é possível, mas a forma mais comum hoje é delegar isso a uma action pronta."
                    },
                    {
                        "type": "code",
                        "value": "- name: Build e push da imagem\n  uses: docker/build-push-action@v6\n  with:\n    context: .\n    push: true\n    tags: ghcr.io/seunome/minha-api:${{ github.sha }}\n    cache-from: type=gha\n    cache-to: type=gha,mode=max"
                    },
                    {
                        "type": "text",
                        "value": "## Uma action, três comandos a menos\n\nA docker/build-push-action substitui, num único step, a sequência que esse módulo vem montando na mão: docker build, docker tag e docker push. Os parâmetros context e tags fazem o papel do -t e do caminho do docker build; push: true já dispara o docker push ao final, sem step separado.\n\ncache-from: type=gha diz pra essa action buscar camadas salvas de execuções anteriores antes de começar a buildar. cache-to: type=gha,mode=max diz pra salvar as camadas da execução atual de volta nesse mesmo cache, incluindo camadas intermediárias, pra que a próxima execução aproveite ainda mais."
                    },
                    {
                        "type": "code",
                        "value": "# alternativa: usar a propria imagem publicada como fonte de cache\n- name: Build e push da imagem\n  uses: docker/build-push-action@v6\n  with:\n    context: .\n    push: true\n    tags: ghcr.io/seunome/minha-api:${{ github.sha }}\n    cache-from: type=registry,ref=ghcr.io/seunome/minha-api:latest\n    cache-to: type=inline"
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o módulo\n\nJuntando as cinco aulas: o job build roda depois que o teste passa, se autentica no registry com um secret, builda e taggeia a imagem (com sha, com latest, talvez com versão), publica tudo com docker push (ou numa única action, já com cache), e alguém, ou algo, no fim do pipeline, sempre sabe exatamente qual imagem representa qual commit.\n\nO que falta agora é o outro lado: pegar essa imagem publicada e efetivamente colocá-la rodando em produção. Esse é o assunto do próximo módulo, Entrega e Deploy Contínuos."
                    },
                    {
                        "type": "quote",
                        "value": "Cache de build não muda o que a imagem final contém, só o quanto você espera pra ver isso publicado. Num pipeline que roda a cada push, esse tempo importa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que o cache de camadas do Docker, que já existe na sua máquina local, não ajuda por padrão dentro de um runner do GitHub Actions?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque cada execução usa uma máquina nova, sem o cache de builds anteriores.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o GitHub Actions desativa o cache do Docker por política de segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o docker build não gera camadas quando roda dentro de um runner.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cache de camadas só funciona em imagens públicas do Docker Hub.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o efeito esperado de reaproveitar cache de camadas entre execuções do pipeline?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O build fica mais rápido, pulando camadas que não mudaram desde a última vez.",
                                "isCorrect": true
                            },
                            {
                                "text": "A imagem final passa a ter menos camadas do que teria sem nenhum cache.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os testes do job anterior deixam de ser necessários a partir desse ponto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O push da imagem pro registry passa a ser um passo opcional no pipeline.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que muda no pipeline ao trocar os steps separados de docker build e docker push pela action docker/build-push-action?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Build, tag e push passam a rodar num único step, configurado por parâmetros.",
                                "isCorrect": true
                            },
                            {
                                "text": "O push passa a acontecer antes mesmo do build terminar de rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "A imagem deixa de precisar de uma tag pra ser publicada no registry.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os testes do job anterior passam a rodar dentro dessa mesma action.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um step configura cache-from: type=gha e cache-to: type=gha,mode=max na docker/build-push-action. O que esses dois parâmetros fazem juntos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Buscam cache de execuções anteriores e salvam o cache novo pra próxima vez.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas medem quanto tempo o build levou, sem alterar o resultado final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Forçam o pipeline a ignorar qualquer cache existente e buildar tudo do zero.",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardam uma cópia extra da imagem final fora do registry configurado no job.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Mesmo com cache configurado, mudar o package.json bem no topo do Dockerfile invalida o cache de todas as camadas seguintes, mesmo as que não mudaram. Por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O cache de camadas é sequencial: mudou uma instrução, ela e tudo depois é reconstruído.",
                                "isCorrect": true
                            },
                            {
                                "text": "O cache-from: type=gha só guarda a primeira camada declarada no Dockerfile.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mudar qualquer arquivo do projeto sempre invalida o cache da imagem inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dependências listadas dentro do package.json não podem ser cacheadas pelo Docker.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Entrega e Deploy Contínuos: do merge ao ar",
        "aulas": [
            {
                "titulo": "Entrega contínua x deploy contínuo: quem aperta o botão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A imagem está pronta no registry. E agora?\n\nNo módulo passado, o job de build terminou com a imagem nova publicada num registry, versionada, esperando. Chegou a hora de responder a pergunta que fecha a esteira: como essa imagem sai do registry e vai parar no ar, na frente do usuário?\n\nExistem dois jeitos de responder isso, e a diferença entre eles não é técnica, é uma escolha de quanto controle humano o time quer manter sobre o momento exato do deploy. Os nomes são parecidos e é fácil confundir: entrega contínua e deploy contínuo."
                    },
                    {
                        "type": "text",
                        "value": "## Entrega contínua: pronta pra ir, falta alguém clicar\n\nNa **entrega contínua** (Continuous Delivery), toda mudança que passa pela esteira, testada, buildada e publicada, fica pronta pra ir pra produção a qualquer momento. Só que o último passo, o que efetivamente coloca a versão nova no ar, espera uma decisão humana: alguém revisa e aprova o deploy, geralmente com um clique.\n\nIsso não significa que o processo seja manual. Só o gatilho final é manual; tudo antes dele (testar, buildar, publicar) continua tão automático quanto sempre foi."
                    },
                    {
                        "type": "text",
                        "value": "## Deploy contínuo: passou em tudo, já está no ar\n\nNo **deploy contínuo** (Continuous Deployment), esse último passo também é automático. Se o código passa em todos os checks da esteira, a versão nova vai pro ar sozinha, sem ninguém clicar em nada. Um merge na branch principal pode significar produção atualizada minutos depois, sem intervenção.\n\nO nome CI/CD, aliás, costuma englobar os três: Integração Contínua (módulo 2), e as duas leituras de CD, entrega ou deploy contínuo, dependendo de onde o time decide colocar (ou não) uma aprovação manual."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Entrega contínua (Delivery)\", \"Deploy contínuo (Deployment)\"], [\"Quem decide o momento de ir pro ar\", \"Uma pessoa, aprovando manualmente\", \"O próprio pipeline, sozinho\"], [\"O que já é automático\", \"Testar, buildar e publicar a imagem\", \"Testar, buildar, publicar e também subir\"], [\"Tempo até chegar em produção\", \"Depende de quando alguém aprova\", \"Minutos após o merge\"], [\"O que a esteira precisa merecer\", \"Confiança alta, com checagem humana no fim\", \"Confiança muito alta, sem checagem humana\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O trade-off: controle x velocidade\n\nNenhum dos dois modelos é \"o certo\". Entrega contínua dá controle: o time decide o melhor momento pra liberar (evitar sexta à tarde, coordenar com o suporte, agrupar mudanças), ao custo de depender de alguém disponível pra aprovar. Deploy contínuo dá velocidade: cada mudança chega ao usuário rápido, em lotes pequenos, mais fáceis de investigar se algo der errado, ao custo de exigir uma esteira de testes em quem o time confia de verdade, porque não existe mais um humano de plantão checando antes do ar.\n\nMuitos times começam com entrega contínua e migram pra deploy contínuo conforme a confiança na esteira cresce."
                    },
                    {
                        "type": "code",
                        "value": "jobs:\n  deploy:\n    needs: [test, build]\n    if: github.ref == 'refs/heads/main'\n    runs-on: ubuntu-latest\n    # exige aprovação de quem estiver configurado no ambiente \"production\"\n    # (a regra fica em Settings > Environments do repositório, não é um campo do YAML)\n    environment: production\n    steps:\n      - name: Deploy\n        run: echo \"sobe a versão nova\""
                    },
                    {
                        "type": "quote",
                        "value": "Entrega contínua deixa a mudança pronta pra ir; deploy contínuo já manda ela pra produção sozinha. A diferença não está na esteira, está em quanto ela é confiável o bastante pra dispensar um humano no fim."
                    }
                ],
                "questions": [
                    {
                        "statement": "Numa esteira de entrega contínua (Continuous Delivery), o que precisa acontecer pra uma mudança já testada e publicada chegar em produção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma pessoa aprova e dispara o deploy manualmente.",
                                "isCorrect": true
                            },
                            {
                                "text": "O pipeline espera a próxima janela de manutenção.",
                                "isCorrect": false
                            },
                            {
                                "text": "O time reconstrói a imagem localmente antes do deploy.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um segundo pipeline refaz os testes antes de liberar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No deploy contínuo (Continuous Deployment), quem decide o momento em que uma mudança aprovada nos testes vai pro ar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O próprio pipeline, sem intervenção humana no meio.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um gerente de produto, antes do fim do expediente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O time de operação, numa reunião após o merge.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quem escreveu o código, testando tudo manualmente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seu time quer controlar exatamente quando cada release vai pro ar, por exemplo, nunca numa sexta-feira à tarde. Isso pede qual dos dois modelos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Entrega contínua, com aprovação manual antes do deploy.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deploy contínuo, com o gatilho restrito a dias úteis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Integração contínua, com um step extra de aprovação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deploy contínuo, com a branch protegida às sextas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline de deploy contínuo está configurado, mas a suíte de testes cobre pouca coisa do sistema. Qual é o risco mais direto disso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mudanças com bug chegam à produção sem checagem humana.",
                                "isCorrect": true
                            },
                            {
                                "text": "O pipeline passa a rodar mais devagar a cada commit novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O registry rejeita builds com cobertura de teste baixa.",
                                "isCorrect": false
                            },
                            {
                                "text": "O deploy some da esteira até alguém escrever testes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que o job de build publica a imagem no registry, o que muda de fato entre entrega contínua e deploy contínuo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Só o último passo muda, entre aprovação manual e automática.",
                                "isCorrect": true
                            },
                            {
                                "text": "O formato da imagem muda, conforme o modelo escolhido.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ferramenta de CI muda, cada modelo exige outro provedor.",
                                "isCorrect": false
                            },
                            {
                                "text": "A branch testada muda, cada modelo usa uma branch diferente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ambientes: dev, staging e produção",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Da esteira pro ambiente certo\n\nTanto faz se o deploy é aprovado por alguém ou disparado sozinho: a versão nova sempre pousa em algum lugar. Esse lugar tem nome, e o nome muda o que está em jogo. A maioria dos times organiza o caminho da mudança em três ambientes: **dev**, **staging** e **produção**."
                    },
                    {
                        "type": "text",
                        "value": "## Dev: onde o código nasce\n\nÉ o ambiente mais próximo de quem programa: a sua máquina, ou um ambiente compartilhado de desenvolvimento. É o docker compose que você já vem usando desde a trilha de Docker, com dado fake, hot reload, e a expectativa de que vai quebrar, porque é ali que se experimenta.\n\n## Staging (homologação): o ensaio geral\n\nStaging, também chamado de homologação, é uma cópia do ambiente de produção: mesma imagem Docker, mesma topologia de containers, dado parecido com o real (geralmente uma versão anonimizada), mas sem usuário de verdade por trás. É o lugar que pega o que os testes automatizados do CI não pegam: como a aplicação se comporta na infraestrutura real, com o proxy na frente, volume de dado de verdade, a rede entre os containers exatamente como em produção. Por isso staging existe antes de produção: é mais barato achar o problema ali, onde só o time esbarra nele, do que no ar, onde é o usuário quem esbarra."
                    },
                    {
                        "type": "text",
                        "value": "## Produção: onde o usuário está\n\nProdução é o ambiente que importa de verdade: onde o usuário final acessa o sistema, onde o dado é real, e onde um erro tem consequência de verdade, desde um cadastro perdido até uma cobrança errada. Tudo que a esteira faz até aqui, testar, buildar, publicar, validar em staging, existe pra proteger esse ambiente de mudança quebrada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Dev\", \"Staging (homologação)\", \"Produção\"], [\"Dado\", \"Fake, criado à vontade\", \"Cópia anonimizada do real\", \"Dado real do usuário\"], [\"Quem acessa\", \"Quem desenvolve\", \"Time interno e QA\", \"Usuário final\"], [\"Propósito\", \"Escrever e testar código rápido\", \"Validar antes de liberar de vez\", \"Servir quem usa o sistema\"], [\"Pode quebrar?\", \"Sim, é esperado\", \"O mínimo possível\", \"Não\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Promovendo a mesma imagem entre ambientes\n\nUm erro comum é buildar uma imagem pra staging e outra, separada, pra produção. Isso reabre exatamente o problema que o Docker resolveu lá atrás: funciona num ambiente e quebra no outro, porque os dois nunca foram, de fato, a mesma coisa.\n\nA prática correta é **promover a mesma imagem**: builda uma vez (módulo anterior), sobe essa imagem em staging, valida, e se estiver tudo certo, sobe a EXATA mesma imagem, pela mesma tag, em produção. Nada é reconstruído entre um ambiente e outro, só a variável que diz qual imagem cada ambiente deve rodar."
                    },
                    {
                        "type": "code",
                        "value": "# o docker-compose.*.yml de cada ambiente referencia a imagem por essa variável (TAG)\nexport TAG=${{ github.sha }}\ndocker compose -f docker-compose.staging.yml pull\ndocker compose -f docker-compose.staging.yml up -d\n\n# depois de validar em staging, produção sobe a MESMA tag (nada é reconstruído)\nexport TAG=${{ github.sha }}\ndocker compose -f docker-compose.prod.yml pull\ndocker compose -f docker-compose.prod.yml up -d"
                    },
                    {
                        "type": "quote",
                        "value": "Ambiente não é onde o código roda, é o quanto de confiança e consequência existe ao redor dele. Dev experimenta, staging valida, produção responde pelo resultado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual desses ambientes existe justamente pra validar uma mudança antes dela chegar nos usuários de verdade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Staging (homologação), o mais parecido possível com produção.",
                                "isCorrect": true
                            },
                            {
                                "text": "Dev, onde o código roda direto na máquina de quem programa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Produção, que já recebe tráfego real desde o primeiro deploy.",
                                "isCorrect": false
                            },
                            {
                                "text": "O registry de imagens, que guarda cada versão publicada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual ambiente é normal o sistema quebrar enquanto alguém testa uma ideia nova?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em dev, onde quebrar faz parte do processo de desenvolver.",
                                "isCorrect": true
                            },
                            {
                                "text": "Em staging, onde o time valida antes de liberar de vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em produção, onde o usuário final sente qualquer instabilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "No registry, onde as imagens publicadas ficam armazenadas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que a imagem passa nos testes em staging, o que a boa prática de \"promover a mesma imagem\" recomenda pra produção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Subir em produção a mesma imagem, pela mesma tag validada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reconstruir a imagem com as variáveis de produção certas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerar uma imagem nova, a partir da branch de produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Buildar de novo, já com o NODE_ENV de produção definido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A equipe builda uma imagem nova pra staging e OUTRA imagem nova pra produção, cada uma na sua própria etapa do pipeline. Qual problema isso pode causar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A imagem de produção pode se comportar diferente da testada.",
                                "isCorrect": true
                            },
                            {
                                "text": "O pipeline passa a exigir duas contas separadas no registry.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker recusa builds repetidos da mesma imagem em sequência.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas imagens ficam obrigatoriamente com a mesma tag final.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um bug só aparece em produção, nunca em staging, mesmo com a mesma imagem publicada rodando nos dois lugares. O que é mais provável ter causado essa diferença?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Algo além da imagem diverge entre eles, como dado ou config.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tag da imagem foi sobrescrita automaticamente entre os ambientes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker recompila a imagem de forma diferente em cada ambiente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O registry entrega versões diferentes conforme o ambiente pede.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O job de deploy: SSH e docker compose, ou um serviço gerenciado",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Do registry até o servidor rodando\n\nA imagem já está publicada (módulo anterior), e você já viu se o time aprova o deploy manualmente ou deixa a esteira decidir sozinha, e em qual ambiente ela vai pousar (as duas últimas aulas). Falta só a parte mecânica: o job de deploy, o step que efetivamente troca a versão rodando por essa imagem nova.\n\nExistem dois formatos comuns pra esse job. No primeiro, você mesmo é dono do servidor: a esteira conecta nele via SSH e roda os comandos que sobem a imagem nova. No segundo, um serviço gerenciado cuida disso por trás, e o seu job só precisa avisar que a versão nova está pronta."
                    },
                    {
                        "type": "text",
                        "value": "## O caminho da VPS: SSH + docker compose\n\nSe a aplicação roda numa VPS com Docker (como a sua, desde a trilha de Docker), o job de deploy só precisa fazer duas coisas depois de entrar no servidor: `docker compose pull`, que baixa as camadas da imagem nova que ainda não existem ali, e `docker compose up -d`, que recria, em segundo plano, qualquer container cuja imagem mudou. O container antigo para, o novo sobe, e o `docker-compose.prod.yml` que já vive no servidor (desde a trilha de Docker) continua sendo a fonte da verdade de como a stack é composta."
                    },
                    {
                        "type": "code",
                        "value": "jobs:\n  deploy:\n    needs: [test, build]\n    if: github.ref == 'refs/heads/main'\n    runs-on: ubuntu-latest\n    steps:\n      - name: Configurar chave SSH\n        run: |\n          mkdir -p ~/.ssh\n          echo \"${{ secrets.SSH_KEY }}\" > ~/.ssh/deploy_key\n          chmod 600 ~/.ssh/deploy_key\n          ssh-keyscan -H meu-servidor.com >> ~/.ssh/known_hosts\n\n      - name: Deploy via SSH\n        run: |\n          ssh -i ~/.ssh/deploy_key SEU_USUARIO@meu-servidor.com '\n            cd /opt/app &&\n            docker compose pull &&\n            docker compose up -d\n          '"
                    },
                    {
                        "type": "text",
                        "value": "## Só a branch principal\n\nRepare nas duas primeiras linhas do job: `needs: [test, build]` garante que o deploy só roda depois que teste e build passaram; `if: github.ref == 'refs/heads/main'` garante que ele só roda na branch principal. Num pull request de uma branch de feature, o job de deploy nem começa, ele é pulado. É exatamente esse desenho que a própria plataforma que você estuda usa: o workflow tem um job de deploy que só age quando o push é direto na branch principal; em qualquer outra situação, ele fica de fora."
                    },
                    {
                        "type": "text",
                        "value": "## O caminho gerenciado: sem SSH nenhum\n\nNem todo time quer administrar servidor. Serviços como Render, Railway ou Fly.io, ou um serviço gerenciado de contêiner numa nuvem como AWS, GCP ou Azure, fazem esse mesmo trabalho por trás: você aponta pra imagem publicada (ou conecta o repositório) e o próprio serviço cuida de puxar a versão nova, subir e derrubar a antiga. O job de deploy, nesse caso, costuma virar um único step chamando a CLI ou o webhook do serviço, sem chave SSH pra gerenciar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"SSH + docker compose (VPS própria)\", \"Serviço gerenciado\"], [\"O que o job de deploy faz\", \"Conecta por SSH e roda docker compose pull/up\", \"Aponta o serviço pra imagem nova\"], [\"Segredo que a esteira guarda\", \"Chave SSH privada do servidor\", \"Token de API do serviço\"], [\"Quem atualiza o sistema operacional\", \"Você\", \"O provedor\"], [\"Esforço pra configurar do zero\", \"Provisionar servidor, Docker e rede\", \"Criar conta e apontar o repositório\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "SSH e docker compose, ou um serviço gerenciado: dois jeitos de responder a mesma pergunta, quem cuida do servidor por trás do seu deploy, você ou outra pessoa."
                    }
                ],
                "questions": [
                    {
                        "statement": "No job de deploy via SSH, qual comando faz o servidor baixar as camadas novas da imagem publicada no registry?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker compose pull, baixando as camadas novas da imagem no registry.",
                                "isCorrect": true
                            },
                            {
                                "text": "docker compose fetch, baixando as camadas novas da imagem no registry.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose sync, baixando as camadas novas da imagem no registry.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose refresh, baixando as camadas novas da imagem no registry.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No workflow de deploy, onde deve ficar guardada a chave privada usada pra autenticar no servidor via SSH?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Num secret do repositório, referenciado como secrets.SSH_KEY.",
                                "isCorrect": true
                            },
                            {
                                "text": "Direto no arquivo do workflow, dentro do step que faz SSH.",
                                "isCorrect": false
                            },
                            {
                                "text": "Num arquivo .env, versionado junto do código-fonte do repo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Numa variável de ambiente pública, visível no log do job.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O job de deploy tem needs: [test, build] e if: github.ref == 'refs/heads/main'. Um colaborador abre um pull request a partir de uma branch de feature. O job de deploy roda?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, porque a condição da branch principal não é satisfeita.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, mas só depois que alguém aprovar manualmente o pull request.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o needs já garante que só código testado vai ao ar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque pull requests não disparam nenhum job da esteira.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time pequeno não quer manter chave SSH, cuidar de atualização de sistema operacional nem escrever o job de docker compose. Qual caminho reduz esse esforço operacional?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um serviço gerenciado, que assume o servidor por trás.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma VPS própria, compartilhada entre vários projetos do time.",
                                "isCorrect": false
                            },
                            {
                                "text": "O mesmo job de SSH, com uma chave mais simples de gerar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um segundo servidor, só pra guardar a chave privada usada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O docker-compose.prod.yml do servidor aponta pra imagem pela tag latest. O job de deploy roda docker compose pull e depois up -d. De onde vem o código-fonte novo que passa a rodar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Da imagem baixada do registry, não de um git pull no servidor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Do repositório Git, clonado de novo a cada execução do job.",
                                "isCorrect": false
                            },
                            {
                                "text": "Do cache local de build do Docker, reaproveitado a cada deploy.",
                                "isCorrect": false
                            },
                            {
                                "text": "Do próprio docker-compose.prod.yml, que guarda o código embutido.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Migrations no deploy: o schema chega antes da aplicação",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O schema precisa chegar junto\n\nLá na trilha de Banco de Dados você viu que uma migration é um passo versionado de alteração do schema, e que em produção quem aplica as migrations pendentes é o comando `prisma migrate deploy`, nunca um ajuste manual direto no banco. Falta encaixar esse comando dentro da esteira: o deploy não pode só trocar a imagem da aplicação, ele também precisa levar o banco pro schema que essa versão nova espera encontrar.\n\nÉ esse exato passo que o pipeline da própria plataforma que você estuda executa: as migrations do banco rodam dentro do job de deploy, antes da aplicação nova assumir."
                    },
                    {
                        "type": "text",
                        "value": "## Migrar antes de trocar a aplicação\n\nA ordem importa, e é sempre a mesma: primeiro a migration roda contra o banco, só depois a aplicação nova entra no ar. Se a ordem se inverte, mesmo que por alguns segundos, a versão nova do código já está de pé tentando consultar uma coluna ou tabela que ainda não existe, e o pedido quebra. Migrar antes garante que, no instante em que o container novo assume, o banco já está pronto pra ele."
                    },
                    {
                        "type": "code",
                        "value": "jobs:\n  deploy:\n    needs: [test, build]\n    if: github.ref == 'refs/heads/main'\n    runs-on: ubuntu-latest\n    environment: production\n    steps:\n      - name: Deploy e aplicar migrations\n        run: |\n          ssh -i ~/.ssh/deploy_key SEU_USUARIO@meu-servidor.com '\n            cd /opt/app &&\n            docker compose pull &&\n            docker compose run --rm -T backend npx prisma migrate deploy &&\n            docker compose up -d\n          '"
                    },
                    {
                        "type": "text",
                        "value": "## Cuidado com migration destrutiva\n\nRepare em dois detalhes do comando acima: `docker compose run --rm` cria um container avulso só pra rodar a migration e descarta ele em seguida (o container da aplicação continua de pé até o `up -d` seguinte); o `-T` desliga a alocação de terminal, necessária porque esse comando roda dentro de um script não interativo, sem terminal nenhum do outro lado.\n\nCom o comando entendido, vale desconfiar do conteúdo: nem toda migration é segura de aplicar sem aviso. Migrations **destrutivas**, como `DROP COLUMN`, `DROP TABLE` ou renomear uma coluna (o Prisma pode tratar isso como remover uma coluna e criar outra), apagam dado. Uma vez aplicadas, não existe `git revert` que traga esse dado de volta, só um backup."
                    },
                    {
                        "type": "text",
                        "value": "## Uma tática mais segura: aditiva primeiro\n\nQuando dá pra escolher, prefira migrations **aditivas**: adicionar uma coluna nova opcional é seguro, porque nada que já existia deixa de funcionar. Trocas mais arriscadas (remover uma coluna antiga, tornar um campo obrigatório) ficam mais seguras quando viram duas migrations em momentos diferentes: primeiro a coluna nova convive com a antiga e o código migra pra usar a nova, e só numa entrega seguinte a antiga é removida, já sem ninguém dependendo dela."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mudança no schema\", \"Exemplo\", \"Risco\"], [\"Adicionar coluna opcional\", \"ADD COLUMN apelido TEXT\", \"Baixo, código antigo ignora a coluna nova\"], [\"Adicionar coluna obrigatória sem default\", \"ADD COLUMN cpf TEXT NOT NULL\", \"Alto, quebra ao inserir em linhas existentes\"], [\"Remover coluna\", \"DROP COLUMN telefone_antigo\", \"Alto, dado se perde, sem backup não tem volta\"], [\"Renomear coluna\", \"telefone vira telefone_celular\", \"Alto, pode virar um DROP mais um ADD sem querer\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Migration não tem botão de desfazer de verdade: o git revert volta o código, mas o dado que um DROP COLUMN apagou continua apagado. Migrar antes de trocar a aplicação evita quebra; migrar com cuidado evita perda."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que o deploy precisa aplicar as migrations do banco, e não só trocar a imagem da aplicação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o código novo espera um schema que ainda não existe.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Docker exige uma migration antes de qualquer pull.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o registry recusa imagens sem migration associada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Postgres apaga os dados ao receber uma imagem nova.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando aplica, em produção, as migrations que já existem e estão versionadas, sem gerar nenhuma nova?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "npx prisma migrate deploy, que só aplica as já existentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "npx prisma migrate dev, que só aplica as já existentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "npx prisma generate, que só aplica as já existentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "npx prisma migrate reset, que só aplica as já existentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No job de deploy, a migration roda ANTES do docker compose up -d trocar a aplicação pra versão nova. O que essa ordem evita?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A aplicação nova consultar colunas que o banco ainda não tem.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Docker reconstruir a imagem duas vezes no mesmo deploy.",
                                "isCorrect": false
                            },
                            {
                                "text": "O registry guardar duas tags diferentes da mesma aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O SSH abrir duas conexões simultâneas com o mesmo servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma migration roda DROP COLUMN numa coluna que a versão anterior da aplicação ainda está lendo, porque o deploy da nova versão falhou logo depois. O que acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A versão antiga, ainda no ar, falha ao ler a coluna removida.",
                                "isCorrect": true
                            },
                            {
                                "text": "A migration é desfeita automaticamente pelo Prisma sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres recria a coluna sozinho, ao detectar o erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O deploy da versão nova tenta de novo automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Comparado a reverter a aplicação pra imagem anterior, por que reverter uma migration que já rodou DROP COLUMN é mais arriscado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o dado apagado não volta sozinho, só com um backup.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Docker não permite subir uma imagem antiga depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Git bloqueia checkout de commits antes da migration.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o registry apaga tags antigas ao publicar uma nova.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A esteira completa e o rollback",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A esteira, do início ao fim\n\nEsse módulo inteiro descreveu pedaços de um caminho só. Vale juntar tudo numa linha do tempo: alguém dá `git push` numa branch, abre um pull request, e se ele for aceito e chegar na branch principal, a esteira inteira roda sozinha, sem mais nenhum comando digitado à mão. Primeiro o job de teste (módulo 2), depois o build da imagem e a publicação no registry (módulo 4), e por fim o deploy que você viu nas últimas aulas: SSH, migration, `docker compose pull` e `up -d`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estágio\", \"O que acontece\", \"Se falhar\"], [\"push\", \"Código novo chega na branch principal\", \"Nenhum deploy é disparado\"], [\"test\", \"Lint, typecheck e testes automatizados rodam\", \"Esteira para aqui, nada é publicado\"], [\"build\", \"A imagem Docker é construída a partir do código testado\", \"Esteira para, sem imagem nova\"], [\"publish\", \"A imagem vai pro registry, com uma tag nova\", \"Deploy não tem o que baixar depois\"], [\"deploy\", \"SSH no servidor, migration, docker compose pull e up -d\", \"Versão anterior segue no ar normalmente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando dá ruim: o rollback\n\nMesmo com teste, build e publicação passando limpos, um bug pode escapar: um caso que a suíte não cobria, uma condição que só aparece com tráfego e dado reais. Quando isso acontece em produção, a pergunta não é mais \"como corrigir o código\", é \"como parar de incomodar o usuário agora\". Na maioria das vezes, a resposta mais rápida não é consertar pra frente, é voltar pra trás: rollback."
                    },
                    {
                        "type": "text",
                        "value": "## Rollback por tag\n\nO rollback só é simples porque o módulo 4 já te preparou pra isso: cada imagem publicada carrega uma tag fixa (o commit sha, por exemplo), nunca sobrescrita. O `docker-compose.prod.yml` do servidor lê essa tag de uma variável, não de um valor fixo. Voltar pra versão anterior é trocar o valor dessa variável pra tag que já rodou bem antes, e repetir o mesmo `pull` e `up -d` de sempre. Nenhum rebuild, nenhum PR novo, nenhuma pressa em escrever código sob pressão."
                    },
                    {
                        "type": "code",
                        "value": "# em produção, algo quebrou depois do último deploy\n# volta pra última tag que já tinha rodado bem (o commit sha anterior)\nssh -i ~/.ssh/deploy_key SEU_USUARIO@meu-servidor.com '\n  cd /opt/app &&\n  export TAG=a1b2c3d &&\n  docker compose pull &&\n  docker compose up -d\n'"
                    },
                    {
                        "type": "text",
                        "value": "## Rollback tem limite\n\nTrocar a imagem de volta resolve bug de código. Não resolve tudo: se o deploy problemático também aplicou uma migration destrutiva (aula passada), o dado que sumiu não volta só porque a aplicação voltou pra versão anterior, o schema pode nem bater mais com o que essa versão antiga espera. É outro motivo pra migration destrutiva pedir cuidado redobrado: ela não tem o mesmo \"botão de voltar\" fácil que a aplicação tem."
                    },
                    {
                        "type": "quote",
                        "value": "Uma esteira boa não é a que nunca quebra, é a que deixa qualquer pessoa do time voltar pro estado anterior em minutos, por uma tag conhecida, sem depender de lembrar o que foi feito."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na esteira completa, o que precisa acontecer ANTES da imagem Docker ser construída?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O código passar pelo job de testes, lint e testes automatizados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O deploy já ter sido feito numa versão anterior da aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "A imagem anterior ser removida do registry, pra abrir espaço.",
                                "isCorrect": false
                            },
                            {
                                "text": "O rollback da versão anterior ser confirmado manualmente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é possível fazer rollback só trocando a tag da imagem, sem reconstruir nada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque cada versão publicada já é uma imagem pronta e imutável.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Docker guarda automaticamente as últimas dez versões.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o registry reconstrói a imagem anterior sob demanda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o rollback dispara o mesmo job de build de novo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O job de build falhou por um erro de sintaxe no Dockerfile. O que acontece com o job de deploy, que vem depois dele na esteira?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não roda, porque depende do build ter passado antes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Roda do mesmo jeito, usando a última imagem publicada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda em modo de espera, até alguém corrigir o Dockerfile.",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda parcialmente, só a parte de conectar via SSH.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um deploy, um bug crítico aparece em produção. O bug é só de código, e a migration aplicada nesse deploy foi aditiva (uma coluna nova opcional). Qual ação resolve mais rápido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Rollback: subir de novo a imagem com a tag da versão anterior.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reverter a migration, já que ela é sempre a origem do problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reconstruir a imagem do zero, sem usar a tag antiga como base.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esperar o próximo push corrigir o bug automaticamente sozinho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O deploy de uma versão nova incluiu uma migration que removeu uma coluna (DROP COLUMN), e essa versão tem um bug grave. O time faz rollback da aplicação pra tag anterior. O que esse rollback resolve, e o que ele NÃO resolve?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Resolve o bug de código; não traz de volta o dado apagado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Resolve os dois, porque a imagem anterior restaura o schema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não resolve nenhum dos dois, a migration trava o rollback.",
                                "isCorrect": false
                            },
                            {
                                "text": "Resolve o dado apagado; o bug de código exige outro deploy.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Cloud: onde a aplicação roda",
        "aulas": [
            {
                "titulo": "Modelos de nuvem: IaaS, PaaS e serverless",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Modelos de nuvem: IaaS, PaaS e serverless\n\nAté aqui você containerizou a aplicação e automatizou o caminho dela até o deploy. Falta uma pergunta: onde essa aplicação vai rodar de verdade? A resposta não é única. Existem modelos diferentes de nuvem, e cada um desloca uma fatia diferente do trabalho de infraestrutura pra você ou pro provedor.\n\nOs três modelos mais comuns são IaaS, PaaS e serverless (também chamado de FaaS). A diferença entre eles não é tecnologia mágica: é quanto da pilha (hardware, sistema operacional, runtime, aplicação) fica sob sua responsabilidade."
                    },
                    {
                        "type": "text",
                        "value": "## IaaS: Infrastructure as a Service\n\nNo IaaS você aluga a máquina, não um serviço pronto. O provedor entrega um servidor virtual (CPU, memória, disco, rede) e a partir daí a responsabilidade é sua: instalar o sistema operacional (ou usar uma imagem pronta), configurar o runtime, instalar o Docker, subir a aplicação, cuidar de atualização de segurança, monitorar se o processo caiu.\n\nExemplos: uma VPS (DigitalOcean, Hetzner, Contabo) ou uma instância EC2 na AWS. É o modelo que dá mais controle e também mais trabalho manual."
                    },
                    {
                        "type": "text",
                        "value": "## PaaS: Platform as a Service\n\nNo PaaS a plataforma cuida do servidor. Você entrega código ou uma imagem, e ela decide onde e como rodar: provisiona a máquina, instala o runtime, expõe uma URL, reinicia o processo se ele cair. Você não precisa fazer `ssh` em lugar nenhum.\n\nExemplos: Render, Railway, Fly.io, Heroku. O ganho é velocidade pra colocar algo no ar; o custo é menos controle sobre o ambiente e, geralmente, um preço maior conforme a aplicação cresce."
                    },
                    {
                        "type": "text",
                        "value": "## Serverless (FaaS): funções sob demanda\n\nServerless empurra a abstração ainda mais longe. Você não pensa em servidor nem em processo que fica de pé o tempo todo: escreve uma função, ela roda quando é chamada (uma requisição HTTP, uma mensagem numa fila, um evento agendado) e desliga sozinha logo depois. Você paga pelo tempo de execução, não por um servidor ligado 24 horas.\n\nExemplo clássico: AWS Lambda (também Cloud Functions no GCP, Azure Functions). Funciona bem pra cargas esporádicas ou picos irregulares; fica menos natural pra uma API que mantém conexão persistente com banco o tempo todo, por causa do cold start (o tempo que a função leva pra *acordar* numa chamada nova).\n\nOs três modelos formam uma régua: IaaS no extremo do controle (e do trabalho manual), serverless no extremo da conveniência (e da menor liberdade sobre como o código roda por baixo), PaaS no meio. Nenhum é o melhor; a pergunta é quem no seu time vai operar o que você não terceirizar."
                    },
                    {
                        "type": "code",
                        "value": "# IaaS: você opera o servidor (exemplo numa VPS)\nssh SEU_USUARIO@meu-servidor.com\nsudo apt update && sudo apt install docker.io -y\n\n# PaaS: você entrega código, a plataforma cuida do resto\ngit push heroku main\n\n# Serverless: você entrega só a função\naws lambda update-function-code --function-name minha-funcao --zip-file fileb://build.zip"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Modelo\", \"Você gerencia\", \"Exemplos\", \"Controle\", \"Esforço operacional\"], [\"IaaS\", \"Sistema operacional, runtime, deploy e monitoramento\", \"VPS (DigitalOcean, Hetzner), EC2 (AWS)\", \"Alto\", \"Alto\"], [\"PaaS\", \"Só o código ou a imagem da aplicação\", \"Render, Railway, Fly.io, Heroku\", \"Médio\", \"Baixo\"], [\"Serverless / FaaS\", \"Só a função\", \"AWS Lambda, Cloud Functions, Azure Functions\", \"Baixo\", \"Mínimo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Escolher modelo de nuvem é decidir quanto de infraestrutura você quer operar e quanto quer terceirizar. O que você não opera, alguém opera por você, e cobra por isso."
                    }
                ],
                "questions": [
                    {
                        "statement": "No modelo IaaS (Infrastructure as a Service), quem cuida de instalar o sistema operacional e manter o runtime atualizado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quem aluga a máquina, já que o provedor só entrega o hardware virtual",
                                "isCorrect": true
                            },
                            {
                                "text": "O provedor de nuvem, que administra o sistema operacional sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Ninguém precisa, porque a imagem já vem com tudo atualizado",
                                "isCorrect": false
                            },
                            {
                                "text": "A plataforma de deploy, do mesmo jeito que acontece num PaaS",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que caracteriza um PaaS (Platform as a Service) como Render ou Railway?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A plataforma cuida do servidor; você só entrega código ou imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Você aluga a máquina virtual e configura o sistema operacional",
                                "isCorrect": false
                            },
                            {
                                "text": "Você escreve funções que só rodam quando um evento acontece",
                                "isCorrect": false
                            },
                            {
                                "text": "Você compra o hardware físico e instala tudo manualmente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função Lambda demora mais na primeira chamada depois de um tempo parada, e responde rápido nas chamadas seguintes. Como se chama esse comportamento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cold start: o tempo que a função leva pra iniciar numa chamada nova",
                                "isCorrect": true
                            },
                            {
                                "text": "Warm cache: o tempo que o provedor leva pra atualizar o código",
                                "isCorrect": false
                            },
                            {
                                "text": "Rate limit: o provedor limitando quantas chamadas chegam por vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Failover: a função trocando de servidor depois de um erro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pequena, sem time de infraestrutura dedicado, quer colocar uma API no ar rápido e não se importa em pagar um pouco mais por isso. Qual modelo tende a fazer mais sentido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "PaaS, porque a plataforma assume boa parte da operação do servidor",
                                "isCorrect": true
                            },
                            {
                                "text": "IaaS, porque a VPS é mais barata e simples de configurar sozinha",
                                "isCorrect": false
                            },
                            {
                                "text": "Serverless, porque elimina completamente qualquer custo de operação",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum: sem time de infra, a aplicação não deveria ir pra produção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que dizemos que serverless está no extremo da conveniência e IaaS no extremo do controle, com PaaS no meio dessa régua?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque cada modelo desloca uma fatia diferente da pilha pro provedor",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque serverless é mais barato e IaaS é sempre mais caro no fim",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque IaaS não permite usar containers e serverless obriga a usá-los",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque PaaS é uma versão antiga do que IaaS e serverless fazem hoje",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "VPS com Docker x PaaS: quem cuida do servidor",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## VPS com Docker ou PaaS: duas formas de rodar a mesma imagem\n\nNo módulo de Docker você empacotou a aplicação numa imagem que roda igual em qualquer lugar. Agora entra a pergunta prática: esse container vai subir numa VPS que você administra, ou numa plataforma que abstrai o servidor pra você? Os dois caminhos partem da mesma imagem Docker; o que muda é quem opera a infraestrutura por baixo."
                    },
                    {
                        "type": "text",
                        "value": "## VPS com Docker Compose em produção\n\nÉ o que esta plataforma faz: uma VPS (uma máquina IaaS comum, do tipo que você viu na aula anterior) com Docker e Docker Compose instalados, rodando o mesmo `docker-compose.yml` (ou uma variação dele) que você já usa em desenvolvimento. Em vez de subir o código com `npm run dev`, o servidor sobe os containers com `docker compose up -d`: API, banco, e o que mais fizer parte da stack.\n\nA vantagem é controle total: você decide a versão de cada serviço, configura a rede entre containers, ajusta recursos, instala o que quiser na máquina. A contrapartida é que você também é responsável por manter o Docker atualizado, monitorar se algum container caiu, cuidar de espaço em disco e da segurança do sistema operacional."
                    },
                    {
                        "type": "code",
                        "value": "ssh SEU_USUARIO@meu-servidor.com\ncd /opt/app\ngit pull origin main\ndocker compose pull\ndocker compose up -d\ndocker compose ps"
                    },
                    {
                        "type": "text",
                        "value": "## PaaS: sem `ssh`, sem gerenciar servidor\n\nNum PaaS como Render, Railway ou Fly.io, você aponta o repositório (ou publica a imagem) e a plataforma decide onde rodar. Ela provisiona a máquina, expõe a URL, reinicia o processo se ele cair, e geralmente já entrega HTTPS e algum nível de escala automática sem configuração extra. Você continua descrevendo a aplicação (às vezes com o próprio Dockerfile do projeto), mas não decide em qual servidor físico ou virtual ela vai parar.\n\nO ganho é velocidade: da imagem pronta até uma URL funcionando pode levar minutos, sem entender de sistema operacional. A perda é personalização: coisas como rede entre containers, volumes específicos ou ajuste fino do servidor ficam limitadas ao que o PaaS permite configurar."
                    },
                    {
                        "type": "text",
                        "value": "## Quando cada um faz sentido\n\nVPS com Docker Compose compensa quando a equipe já sabe operar Linux e Docker, o custo por recurso importa (uma VPS costuma sair mais barata que o equivalente em PaaS), ou a stack tem particularidades que um PaaS genérico não atende bem (múltiplos serviços, rede customizada, um banco pesado rodando ao lado da API).\n\nPaaS compensa quando o time é pequeno ou não tem ninguém dedicado a infraestrutura, a prioridade é validar algo rápido, ou o projeto ainda não justifica o tempo de operar servidor. Muitos times começam num PaaS e migram pra uma VPS (ou pra uma nuvem gerenciada maior) quando o custo ou a necessidade de controle cresce."
                    },
                    {
                        "type": "code",
                        "value": "# Deploy num PaaS (exemplo com a CLI do Fly.io)\nfly launch\nfly deploy\nfly status"
                    },
                    {
                        "type": "quote",
                        "value": "Não existe stack certa, existe stack que combina com o tamanho do time e o quanto de operação ele consegue sustentar. A imagem Docker é a mesma; o que muda é quem cuida do servidor que a executa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Numa VPS com Docker Compose em produção, qual comando sobe os containers da aplicação no servidor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker compose up -d, que sobe os containers em segundo plano",
                                "isCorrect": true
                            },
                            {
                                "text": "docker compose deploy, que publica a stack direto no registry",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose start --prod, que ativa o modo de produção",
                                "isCorrect": false
                            },
                            {
                                "text": "docker run --all, que inicia todos os containers do projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de subir a imagem pra um PaaS como Render, quem decide em qual servidor físico ou virtual a aplicação roda?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A própria plataforma, que provisiona e gerencia isso por trás",
                                "isCorrect": true
                            },
                            {
                                "text": "O desenvolvedor, escolhendo a máquina no painel antes do deploy",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker Compose, que define isso no arquivo da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "O DNS do domínio, que aponta pra um servidor específico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pequena, sem ninguém dedicado a administrar Linux, precisa validar um produto novo o quanto antes. Qual caminho tende a exigir menos esforço operacional inicial?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Subir a imagem num PaaS e deixar a plataforma cuidar do servidor",
                                "isCorrect": true
                            },
                            {
                                "text": "Alugar uma VPS e configurar Docker, rede e firewall do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Comprar um servidor físico e instalar o sistema operacional",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever a aplicação em serverless puro, sem usar Docker",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma stack com múltiplos serviços e rede customizada entre containers, tocada por uma equipe que já sabe operar Linux, tende a se beneficiar mais de qual abordagem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "VPS com Docker Compose, que dá controle total da rede",
                                "isCorrect": true
                            },
                            {
                                "text": "PaaS genérico, que abstrai toda a configuração de rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Serverless, que elimina de vez a necessidade de containers",
                                "isCorrect": false
                            },
                            {
                                "text": "Qualquer opção, já que a rede não muda entre os modelos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que times costumam migrar de um PaaS pra uma VPS com Docker Compose conforme o produto cresce, e não o contrário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o custo por recurso e o controle importam mais em escala",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque PaaS deixa de funcionar tecnicamente depois de um tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque VPS é sempre mais simples de configurar que um PaaS",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a imagem Docker só funciona em servidor próprio, não em PaaS",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Banco em produção e backups",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Onde o banco de dados mora em produção\n\nA API você já sabe rodar em container. E o banco? Dá pra rodar um Postgres dentro de outro container, do lado da API, no mesmo `docker-compose.yml`. Também dá pra usar um banco gerenciado, que roda numa infraestrutura separada, mantida por um provedor especializado. As duas opções funcionam; a diferença aparece quando algo dá errado."
                    },
                    {
                        "type": "text",
                        "value": "## Banco gerenciado\n\nUm banco gerenciado (RDS na AWS, Neon, Supabase, entre outros) é um serviço à parte: você não instala o Postgres, só se conecta numa string de conexão. O provedor cuida de backup automático, atualização de versão, replicação, e muitas vezes de escalar o banco sem downtime. Em troca, você paga um preço por esse serviço e tem menos controle sobre a configuração fina do banco."
                    },
                    {
                        "type": "text",
                        "value": "## Banco no container, e por que isso pede cuidado extra\n\nRodar o Postgres num container ao lado da API é mais simples de começar: só mais um serviço no `docker-compose.yml`, sem custo de outro provedor. O risco mora em onde o dado fica guardado. Por padrão, os dados de um container vivem dentro dele; lá no módulo de Docker você já usou volumes pra persistir dados entre reinícios, e em produção isso deixa de ser detalhe e vira decisão crítica. O volume nomeado precisa existir fora do ciclo de vida do container, pra sobreviver a um `docker compose down`, uma atualização de imagem, ou a substituição do container por um novo. Container é descartável por design; o volume (e o backup dele) é que precisa ser durável."
                    },
                    {
                        "type": "code",
                        "value": "services:\n  db:\n    image: postgres:16\n    restart: always\n    environment:\n      POSTGRES_DB: ${POSTGRES_DB}\n      POSTGRES_USER: ${POSTGRES_USER}\n      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\nvolumes:\n  pgdata:"
                    },
                    {
                        "type": "code",
                        "value": "# backup manual do banco rodando em container\ndocker compose exec db pg_dump -U SEU_USUARIO nome_do_banco > backup-$(date +%F).sql\n\n# restaurar a partir de um backup\ncat backup-2026-01-01.sql | docker compose exec -T db psql -U SEU_USUARIO nome_do_banco"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Banco gerenciado\", \"Banco no container\"], [\"Backup\", \"Automático, cuidado pelo provedor\", \"Manual, cuidado pela equipe\"], [\"Custo\", \"Preço do serviço gerenciado\", \"Só o custo da VPS\"], [\"Controle\", \"Limitado ao que o provedor expõe\", \"Total sobre versão e configuração\"], [\"Risco operacional\", \"Baixo, provedor cuida da durabilidade\", \"Alto, sem volume e backup bem feitos\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O container que roda o banco é descartável por design. O dado que está dentro dele não pode ser. Backup que só existe como plano na cabeça de alguém não é backup."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que um banco gerenciado (como RDS, Neon ou Supabase) tira da responsabilidade da equipe?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Backup automático, atualização de versão e replicação do banco",
                                "isCorrect": true
                            },
                            {
                                "text": "Toda a modelagem das tabelas e o design do schema da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "A escrita das queries que a aplicação usa no dia a dia",
                                "isCorrect": false
                            },
                            {
                                "text": "A definição de qual banco de dados o projeto vai usar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que os dados de um banco rodando num container comum podem sumir se o container for removido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque por padrão os dados vivem dentro do próprio container",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Postgres apaga os dados sozinho a cada reinício",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque containers não conseguem rodar bancos de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Docker Compose bloqueia bancos sem um provedor externo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time roda `docker compose down -v` sem perceber que o -v remove volumes, num servidor onde o Postgres roda em container sem backup configurado. O que acontece com os dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São perdidos junto com o volume, sem forma de recuperar depois",
                                "isCorrect": true
                            },
                            {
                                "text": "Ficam guardados automaticamente num backup criado pelo Docker",
                                "isCorrect": false
                            },
                            {
                                "text": "Continuam intactos, porque o -v só afeta a rede dos containers",
                                "isCorrect": false
                            },
                            {
                                "text": "São movidos pro registry de imagens até o próximo deploy",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a vantagem prática de declarar um volume nomeado (tipo pgdata) no docker-compose.yml do banco, em vez de deixar sem volume?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os dados sobrevivem ao `docker compose down` ou troca de imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "A query do banco fica mais rápida por causa do volume nomeado",
                                "isCorrect": false
                            },
                            {
                                "text": "O container do banco passa a reiniciar automaticamente sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "A senha do banco passa a ficar protegida dentro do volume nomeado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que ter um banco gerenciado não elimina completamente a necessidade da equipe pensar em backup?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque a equipe ainda precisa validar restauração e reter cópias",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque bancos gerenciados nunca fazem backup automático de fato",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o backup automático só funciona em ambiente de teste",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque backup gerenciado custa mais caro do que manter na VPS",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Config e secrets em produção",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A mesma imagem, comportamentos diferentes\n\nA imagem Docker que você builda no CI é a mesma que sobe em desenvolvimento, staging ou produção. O que muda o comportamento dela não é o código dentro da imagem, é a configuração que entra por fora: variáveis de ambiente. É por isso que a mesma imagem pode se conectar num banco de teste ou num banco de produção, dependendo só do que é passado pra ela no momento de rodar."
                    },
                    {
                        "type": "text",
                        "value": "## Variáveis de ambiente\n\nEm vez de escrever a URL do banco, a chave de API ou o segredo do JWT direto no código, a aplicação lê tudo isso de variáveis de ambiente (`process.env.DATABASE_URL`, por exemplo). Isso já é familiar de módulos anteriores; em produção o princípio é o mesmo, só que o risco de errar sobe: vazar uma credencial de produção é bem mais grave do que vazar uma de desenvolvimento."
                    },
                    {
                        "type": "text",
                        "value": "## O .env de produção fora do versionamento\n\nO arquivo `.env` nunca deveria ir pro repositório, e isso vale ainda mais em produção. Ele fica listado no `.gitignore` e existe só na máquina que roda a aplicação (a VPS) ou como secret configurado na ferramenta de deploy. Quem tem acesso ao servidor tem acesso às credenciais; por isso o acesso à VPS de produção costuma ser mais restrito do que o acesso ao repositório."
                    },
                    {
                        "type": "code",
                        "value": "NODE_ENV=production\nPORT=3000\nDATABASE_URL=postgresql://SEU_USUARIO:SUA_SENHA@db:5432/nome_do_banco\nJWT_SECRET=SUBSTITUA_POR_UM_SEGREDO_FORTE\nREDIS_URL=redis://redis:6379\nALLOWED_ORIGIN=https://meudominio.com"
                    },
                    {
                        "type": "text",
                        "value": "## Gerenciadores de secrets\n\nPra times maiores, um `.env` num servidor já não é suficiente: fica difícil saber quem acessou o quê, difícil trocar uma credencial vazada em todos os lugares de uma vez, difícil auditar. Gerenciadores de secrets (AWS Secrets Manager, HashiCorp Vault, Doppler, ou os próprios secrets do GitHub Actions que você já usa no workflow) resolvem isso: guardam o segredo criptografado, controlam quem lê, e às vezes trocam a credencial automaticamente. A aplicação continua lendo variável de ambiente; só muda de onde essa variável é preenchida."
                    },
                    {
                        "type": "code",
                        "value": "- name: Deploy via SSH\n  env:\n    DATABASE_URL: ${{ secrets.DATABASE_URL }}\n  run: |\n    ssh SEU_USUARIO@meu-servidor.com 'cd /opt/app && docker compose up -d'"
                    },
                    {
                        "type": "quote",
                        "value": "Segredo em variável de ambiente, nunca no código; `.env` de produção fora do versionamento, sempre. A imagem não muda; o que muda é o que você entrega pra ela rodar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que a mesma imagem Docker pode se comportar de forma diferente em desenvolvimento e em produção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o comportamento muda pela configuração, não pelo código",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Docker gera um código-fonte diferente pra cada ambiente",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a imagem de produção é sempre recompilada do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada ambiente roda uma linguagem de programação diferente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Onde o arquivo .env de produção deveria existir?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Só no servidor de produção ou num gerenciador de secrets",
                                "isCorrect": true
                            },
                            {
                                "text": "No repositório, dentro de uma pasta chamada producao",
                                "isCorrect": false
                            },
                            {
                                "text": "No repositório, junto com o docker-compose.yml da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Na imagem Docker, copiado durante o docker build",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor precisa que a aplicação use uma URL de banco diferente em staging e em produção, sem alterar uma linha de código. Como fazer isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Configurar a variável DATABASE_URL diferente em cada ambiente",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar uma branch separada do código pra cada ambiente",
                                "isCorrect": false
                            },
                            {
                                "text": "Buildar uma imagem Docker diferente e específica pra cada banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Editar o código pra checar em qual servidor ele está rodando",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o principal ganho de usar um gerenciador de secrets (Vault, AWS Secrets Manager, Doppler) em vez de só um .env no servidor, num time grande?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Controle de quem acessa e troca fácil de uma credencial vazada",
                                "isCorrect": true
                            },
                            {
                                "text": "A aplicação fica mais rápida ao ler as variáveis de ambiente",
                                "isCorrect": false
                            },
                            {
                                "text": "O código da aplicação para de precisar de variáveis de ambiente",
                                "isCorrect": false
                            },
                            {
                                "text": "O deploy passa a não precisar mais de nenhuma credencial",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que vazar uma credencial de produção costuma ser considerado mais grave do que vazar a mesma credencial em desenvolvimento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque em produção a credencial dá acesso a dados reais de usuários",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque credenciais de produção são sempre tecnicamente mais longas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o ambiente de desenvolvimento não aceita autenticação",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só a produção usa variável de ambiente pra guardar segredo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Domínio, DNS, HTTPS e escala",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Do IP pro domínio\n\nAté aqui a aplicação já roda numa VPS, com banco persistido e config vinda de fora da imagem. Falta o que o usuário final vê: um endereço fácil de lembrar (`meudominio.com`) em vez de um IP de números. Um domínio comprado num registrador (Registro.br, Namecheap, GoDaddy) não sabe sozinho onde a aplicação está: isso é resolvido por registros DNS. O mais comum é um registro do tipo A, que aponta o domínio direto pro IP do servidor; também existe o CNAME, que aponta um subdomínio (tipo `www`) pra outro nome de domínio. Depois de criar o registro, a propagação pela internet pode levar de minutos a algumas horas."
                    },
                    {
                        "type": "code",
                        "value": "Tipo    Nome    Valor               TTL\nA       @       SEU.IP.DO.SERVIDOR  3600\nCNAME   www     meudominio.com      3600"
                    },
                    {
                        "type": "text",
                        "value": "## HTTPS com um reverse proxy na frente\n\nA aplicação Node.js não deveria falar HTTPS diretamente: quem cuida disso é um reverse proxy na frente dela (nginx, Caddy ou Traefik), rodando na mesma VPS. Ele recebe a conexão criptografada do navegador, decifra, e repassa a requisição pra API por dentro da rede interna (geralmente em HTTP puro, container a container). O certificado que viabiliza isso vem do Let's Encrypt, gratuito e renovado automaticamente pela maioria dessas ferramentas (o Caddy, por exemplo, resolve isso sozinho sem configuração extra)."
                    },
                    {
                        "type": "code",
                        "value": "server {\n    listen 443 ssl;\n    server_name meudominio.com;\n\n    ssl_certificate     /etc/letsencrypt/live/meudominio.com/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/meudominio.com/privkey.pem;\n\n    location / {\n        proxy_pass http://api:3000;\n        proxy_set_header Host $host;\n    }\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Escalar quando o servidor não aguenta mais\n\nQuando uma VPS começa a engasgar sob carga, existem dois caminhos. Escalar verticalmente é trocar por uma máquina maior (mais CPU, mais memória); simples de fazer, mas tem teto físico e geralmente exige reiniciar o servidor. Escalar horizontalmente é colocar mais de uma instância da aplicação rodando em paralelo, com um load balancer na frente distribuindo as requisições entre elas; dá mais capacidade e resiliência (se uma instância cair, as outras seguem respondendo), mas exige que a aplicação seja stateless, sem depender de guardar algo só na memória local do processo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Escala\", \"O que muda\", \"Vantagem\", \"Limite\"], [\"Vertical\", \"Máquina maior: mais CPU e memória\", \"Simples de aplicar\", \"Teto físico da máquina\"], [\"Horizontal\", \"Mais instâncias rodando em paralelo\", \"Mais capacidade e resiliência\", \"Exige app stateless e load balancer\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Domínio e HTTPS são a parte que o usuário vê; escalar é a parte que ele nem percebe quando funciona bem. Os dois são configuração, não mágica, e cabem no mesmo servidor que já roda a aplicação."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual tipo de registro DNS aponta um domínio direto pro endereço IP de um servidor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O registro do tipo A, que liga o domínio a um IP específico",
                                "isCorrect": true
                            },
                            {
                                "text": "O registro do tipo CNAME, que sempre aponta pra outro IP direto",
                                "isCorrect": false
                            },
                            {
                                "text": "O registro do tipo MX, que direciona o tráfego HTTP do domínio",
                                "isCorrect": false
                            },
                            {
                                "text": "O registro do tipo TTL, que define o tempo de vida do domínio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a aplicação Node.js normalmente não fala HTTPS diretamente em produção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o reverse proxy na frente cuida da conexão criptografada",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Node.js tecnicamente não é capaz de rodar HTTPS sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque HTTPS só consegue funcionar dentro de containers Docker",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Let's Encrypt exige que a API rode em outra porta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time percebe que a VPS atual não aguenta mais o pico de tráfego das sextas-feiras, mas a aplicação guarda sessão de usuário na memória do processo. Qual limitação isso impõe pra escalar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Escalar horizontalmente fica difícil sem tornar a app stateless",
                                "isCorrect": true
                            },
                            {
                                "text": "Escalar verticalmente deixa de ser uma opção válida nesse caso",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer precisa ser removido antes de qualquer mudança",
                                "isCorrect": false
                            },
                            {
                                "text": "A aplicação não pode mais rodar dentro de containers Docker",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a principal vantagem de escalar horizontalmente (várias instâncias com load balancer) em vez de verticalmente (uma máquina maior)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mais capacidade e resiliência, já que uma instância pode cair",
                                "isCorrect": true
                            },
                            {
                                "text": "Configuração mais simples, sem precisar de load balancer",
                                "isCorrect": false
                            },
                            {
                                "text": "Custo sempre menor, independente de quantas instâncias rodam",
                                "isCorrect": false
                            },
                            {
                                "text": "Elimina de vez a necessidade de monitorar a aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o Let's Encrypt sendo gratuito não elimina totalmente o trabalho de configurar HTTPS num servidor próprio?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque ainda é preciso configurar o proxy e renovar o certificado",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Let's Encrypt cobra depois do primeiro ano de uso",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque certificados gratuitos não funcionam em domínios próprios",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só funciona se a aplicação estiver fora de um container",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Operar em produção: observabilidade e boas práticas",
        "aulas": [
            {
                "titulo": "Logs em produção",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 7 - Operar em produção: observabilidade e boas práticas\n\nSua aplicação já está no ar. O workflow do GitHub Actions roda os testes, builda o frontend e faz o deploy na VPS a cada push na branch principal, do jeito que você montou lá atrás; nas outras branches, o job de deploy é pulado. Só que colocar no ar é só metade do trabalho: agora alguém precisa saber se a aplicação continua funcionando, se está lenta, se está devolvendo erro pra usuário, e descobrir isso antes que o usuário reclame no suporte.\n\nEsse é o assunto deste módulo, o último da trilha: observabilidade (entender o que está acontecendo dentro do sistema em produção) e um punhado de boas práticas de operação. Começamos pelo mais básico: os logs.\n\n## Por que centralizar logs\n\nQuando a aplicação rodava só na sua máquina, bastava olhar o terminal onde o `npm start` estava rodando. Em produção isso não existe: o processo roda dentro de um container, numa VPS que você não fica olhando o tempo todo, e pode ter mais de uma instância rodando ao mesmo tempo. Se der erro às 3 da manhã, você precisa conseguir voltar no tempo e ver exatamente o que aconteceu, sem depender de estar com o terminal aberto no momento exato da falha."
                    },
                    {
                        "type": "text",
                        "value": "## Níveis de log\n\nNem toda mensagem de log tem a mesma importância, por isso log tem nível. Os três mais comuns:\n\n- **info**: funcionamento normal (servidor subiu, usuário fez login, pedido foi criado). Ajuda a entender o fluxo, mas não pede ação de ninguém.\n- **warn**: algo fora do esperado, mas que não quebrou nada (uma tentativa de retry, uma fila crescendo mais que o normal). Vale ficar de olho.\n- **error**: algo falhou de verdade (exceção não tratada, conexão com o banco que caiu, requisição externa que não respondeu). É o nível que costuma acionar alguém.\n\nSeparar por nível é o que permite filtrar o ruído depois: em operação normal você quer ver só warn e error; investigando um bug específico, aí sim vale olhar os info também."
                    },
                    {
                        "type": "code",
                        "value": "logger.info('servidor iniciado na porta 3000');\nlogger.warn('fila de envio de e-mail com 150 itens pendentes');\n\ntry {\n  await db.query('SELECT * FROM usuarios WHERE id = $1', [id]);\n} catch (erro) {\n  logger.error('falha ao consultar usuário no banco', {\n    userId: id,\n    erro: erro.message\n  });\n}\n\n// saída de um logger estruturado (formato JSON), uma linha por evento:\n{\"level\":\"error\",\"message\":\"falha ao consultar usuário no banco\",\"userId\":42,\"erro\":\"connection timeout\",\"timestamp\":\"2026-07-12T03:14:10.000Z\"}"
                    },
                    {
                        "type": "text",
                        "value": "## Logs estruturados\n\nUm log como `Usuário 123 fez login` é fácil de ler, mas difícil de processar: pra achar todos os logins de um usuário específico, ou contar quantos erros aconteceram numa hora, alguém teria que vasculhar texto solto. Log estruturado resolve isso: em vez de uma frase, você registra um objeto (geralmente em JSON) com campos fixos, tipo `level`, `message`, `timestamp` e o contexto que importa (`userId`, `requestId`, `erro`).\n\nCom log estruturado, buscar e filtrar vira consulta: \"todo log de nível error nas últimas 2 horas\" ou \"todo log com esse requestId\". Bibliotecas como pino e winston, no Node.js, já formatam a saída em JSON estruturado por padrão; na prática você troca o `console.log` solto por uma dessas e ganha isso de graça."
                    },
                    {
                        "type": "text",
                        "value": "## Onde ver os logs: docker compose logs e além\n\nNo dia a dia, o primeiro lugar pra olhar log de um serviço containerizado é o próprio Docker Compose. Ele guarda a saída (stdout e stderr) de cada container e deixa você consultar a qualquer momento, sem precisar configurar nada extra.\n\nIsso resolve bem numa VPS com poucos containers. Quando o cenário cresce (várias réplicas do mesmo serviço, vários serviços diferentes, ou histórico que precisa sobreviver a um container que já morreu), o próximo passo é um agregador de logs: uma ferramenta que puxa os logs de tudo, guarda num lugar central e permite buscar. Alguns nomes comuns nesse espaço: a stack ELK (Elasticsearch, Logstash e Kibana), o Grafana Loki, e serviços gerenciados como Datadog ou o CloudWatch Logs da AWS. Fica como vocabulário por cima aqui, mas vale saber que existe esse próximo degrau."
                    },
                    {
                        "type": "code",
                        "value": "docker compose logs\ndocker compose logs -f\ndocker compose logs -f app\ndocker compose logs --tail=100 app\ndocker compose logs --since=1h app"
                    },
                    {
                        "type": "quote",
                        "value": "Log é a memória da sua aplicação: se não registrar direito, quando algo quebrar você vai ficar tentando adivinhar o que aconteceu."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a função do nível warn em um log?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Sinalizar algo fora do esperado que ainda não quebrou nada",
                                "isCorrect": true
                            },
                            {
                                "text": "Registrar o funcionamento normal da aplicação, sem exigir ação",
                                "isCorrect": false
                            },
                            {
                                "text": "Indicar que uma falha real aconteceu e alguém precisa agir",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir o nível error nos horários fora do expediente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando acompanha, em tempo real, a saída de log do serviço app com Docker Compose?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker compose logs -f app",
                                "isCorrect": true
                            },
                            {
                                "text": "docker compose logs app --tail=0",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose ps app",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose restart app",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time só consegue ver uma lista enorme de texto solto quando abre os logs, sem conseguir filtrar por gravidade nem por usuário. O que provavelmente falta nessa aplicação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Logs estruturados, com nível e contexto, no lugar de texto solto",
                                "isCorrect": true
                            },
                            {
                                "text": "Um servidor mais potente pra processar os logs com mais rapidez",
                                "isCorrect": false
                            },
                            {
                                "text": "Mais linhas de log, cobrindo mais partes do código-fonte",
                                "isCorrect": false
                            },
                            {
                                "text": "Um docker compose logs configurado com limite de memória maior",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer investigar um erro que aconteceu há cerca de 1 hora, sem revisar todo o histórico de log do serviço. Qual comando ajuda a limitar a busca?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "docker compose logs --since=1h app",
                                "isCorrect": true
                            },
                            {
                                "text": "docker compose logs --tail=1 app",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose restart --since=1h app",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose logs -f app",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A aplicação roda em três containers idênticos atrás de um load balancer. Um usuário reporta um erro específico, mas ninguém sabe em qual container a requisição dele caiu. O que ajuda a rastrear essa requisição nos logs?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Incluir um requestId no log, repetido em todos os containers",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o nível de log de todos os containers para error, sempre",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de réplicas da aplicação pra um container só",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o load balancer por um proxy que não distribui carga",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Health check e disponibilidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um health check\n\nLog ajuda a entender o que já aconteceu, depois do fato. Health check é a outra ponta: uma forma de alguém perguntar pra aplicação, agora, \"você está bem?\", sem precisar esperar dar problema pra descobrir.\n\nNa prática é um endpoint HTTP simples, normalmente `/health` (ou `/healthz`), que devolve uma resposta rápida dizendo se o processo está de pé e consegue responder. Quem pergunta isso o tempo todo não é gente: é o orquestrador de containers, o load balancer, ou uma ferramenta de monitoramento de uptime, batendo nesse endpoint de tempos em tempos."
                    },
                    {
                        "type": "text",
                        "value": "## Pra que serve na prática\n\nO valor do health check está em quem consome a resposta. Um load balancer com várias instâncias da aplicação atrás dele usa o `/health` pra decidir pra qual instância mandar cada requisição: se uma instância para de responder (ou passa a responder com erro), ela sai da lista até voltar a ficar saudável, e o tráfego vai só pras instâncias que estão bem. Um orquestrador de containers faz parecido: se o health check falha repetidas vezes, ele reinicia o container sozinho, sem esperar alguém perceber.\n\nA própria ensina.dev expõe um endpoint de health check: depois que o job de deploy do workflow sobe a nova versão na VPS, ele confere se esse endpoint responde antes de considerar o deploy concluído com sucesso."
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst app = express();\n\napp.get('/health', (req, res) => {\n  res.status(200).json({ status: 'ok' });\n});\n\napp.listen(3000, () => {\n  console.log('servidor rodando na porta 3000');\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Liveness e readiness, por cima\n\nEm setups mais robustos (Kubernetes é o exemplo clássico), essa pergunta \"você está bem?\" costuma se dividir em duas:\n\n- **Liveness**: o processo está vivo, ou travou de um jeito que só reiniciar resolve? Se a resposta for não, o orquestrador mata e sobe o container de novo.\n- **Readiness**: o processo está de pé, mas está pronto pra receber tráfego agora? Ele pode estar vivo mas ainda inicializando, ou temporariamente sem conseguir falar com o banco. Nesse caso não deveria receber requisição ainda, mas também não precisa ser reiniciado.\n\nNum setup mais simples, como uma VPS com Docker Compose, é comum um único endpoint `/health` cobrir os dois casos. Vale conhecer a distinção porque ela aparece em qualquer ferramenta de orquestração mais séria."
                    },
                    {
                        "type": "code",
                        "value": "services:\n  app:\n    build: .\n    ports:\n      - \"3000:3000\"\n    healthcheck:\n      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:3000/health\"]\n      interval: 30s\n      timeout: 5s\n      retries: 3"
                    },
                    {
                        "type": "text",
                        "value": "## Disponibilidade é mais que o processo de pé\n\nHealth check é a base, mas disponibilidade de verdade envolve mais coisa: quanto tempo a aplicação fica no ar sem interrupção, quão rápido ela detecta e se recupera de um problema, e se continua respondendo bem mesmo sob carga. O health check alimenta essa cadeia toda: é o dado bruto que orquestrador, load balancer e ferramenta de monitoramento usam pra decidir o que fazer. Na próxima aula entra a outra metade dessa história: métricas e alertas."
                    },
                    {
                        "type": "quote",
                        "value": "Um endpoint /health não evita que a aplicação quebre, mas garante que ninguém continue mandando tráfego pra quem já quebrou."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o principal objetivo de um endpoint como /health?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Informar rápido se a aplicação está de pé e responde a requisições",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir os logs da aplicação por um resumo do dia inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "Executar a suíte de testes automatizados dentro da produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar as migrations pendentes a cada nova requisição recebida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença mais comum entre um teste de liveness e um de readiness?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Liveness olha se o processo está vivo; readiness, se está pronto",
                                "isCorrect": true
                            },
                            {
                                "text": "Liveness roda antes do deploy; readiness, só depois que ele termina",
                                "isCorrect": false
                            },
                            {
                                "text": "Liveness verifica o banco; readiness verifica só a memória livre",
                                "isCorrect": false
                            },
                            {
                                "text": "Liveness é tarefa da infra; readiness é tarefa do desenvolvimento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No healthcheck do compose (campos test, interval, timeout, retries), o que o campo retries define?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quantas falhas seguidas o container tolera até virar unhealthy",
                                "isCorrect": true
                            },
                            {
                                "text": "Quantas vezes o container tenta subir antes do Compose desistir",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantos segundos o Docker espera entre uma checagem e a outra",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantas requisições simultâneas o endpoint de saúde aceita",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço acabou de subir e ainda está abrindo conexão com o banco; não travou, mas também não deve receber requisição ainda. Qual conceito descreve esse estado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Vivo, mas ainda não pronto (not ready) pra receber tráfego",
                                "isCorrect": true
                            },
                            {
                                "text": "Com o healthcheck mal configurado dentro do compose",
                                "isCorrect": false
                            },
                            {
                                "text": "Já deveria estar marcado como unhealthy pelo orquestrador",
                                "isCorrect": false
                            },
                            {
                                "text": "Com vazamento de memória logo no início da execução",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que costuma ser má ideia fazer o /health consultar todas as dependências pesadas (banco, cache, fila) a cada chamada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Deixa a checagem lenta e pode derrubar a instância por algo alheio",
                                "isCorrect": true
                            },
                            {
                                "text": "Endpoints de saúde não podem, por definição, acessar outro serviço",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker bloqueia chamada de rede feita de dentro de um healthcheck",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer já testa banco e fila sem precisar da aplicação",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Métricas e alertas (o que monitorar)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## De log e health check pra métrica\n\nLog conta a história de um evento específico: essa requisição, esse erro, esse usuário. Health check diz se o processo está de pé agora. Métrica é a peça que falta: um número acompanhado ao longo do tempo (erros por minuto, tempo de resposta, uso de CPU) que mostra tendência e permite alarme automático, sem ninguém precisar ficar lendo log o dia inteiro.\n\n## O que vale a pena monitorar\n\nNem toda métrica importa igual. Um punhado cobre a maior parte dos problemas que aparecem numa aplicação em produção:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Métrica\", \"O que mede\", \"Por que importa\"], [\"Taxa de erro\", \"Percentual de requisições que terminam em erro (status 5xx, exceções)\", \"Pico de erro é o sinal mais direto de que algo quebrou\"], [\"Latência\", \"Tempo entre a requisição chegar e a resposta ser enviada\", \"Aplicação lenta é uma forma de indisponibilidade que passa despercebida\"], [\"Throughput\", \"Quantidade de requisições processadas por segundo (ou minuto)\", \"Mostra a carga real sobre o sistema e ajuda a planejar capacidade\"], [\"Uso de CPU\", \"Percentual de processamento consumido pelos containers\", \"CPU no limite derruba o tempo de resposta antes de derrubar o serviço de vez\"], [\"Uso de memória\", \"Quantidade de RAM consumida pela aplicação\", \"Vazamento de memória costuma terminar em container reiniciado à força\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Os quatro sinais de ouro, por cima\n\nEsse conjunto de métricas não é invenção sua: existe um nome consagrado pra ele. O time de SRE do Google popularizou os \"quatro sinais de ouro\" (golden signals): latência, tráfego, erros e saturação. Latência e erros já apareceram na tabela; tráfego é outro nome pra throughput; saturação é o quão perto do limite os recursos estão (CPU e memória entram aí). Não precisa decorar o nome, mas vale saber que esse framework existe: é uma forma testada de garantir que você está olhando pras métricas certas."
                    },
                    {
                        "type": "text",
                        "value": "## Dashboards e alertas\n\nMétrica solta numa tabela não ajuda muito; o valor aparece quando ela vira gráfico ao longo do tempo, num dashboard que mostra o estado da aplicação de relance. Ferramentas como Grafana, Datadog ou o painel nativo da nuvem que você estiver usando cumprem esse papel: juntam as métricas e desenham os gráficos.\n\nDashboard você olha quando quer; alerta é o dashboard vindo te procurar. Você define um limite (taxa de erro acima de 5% por 5 minutos, latência acima de 2 segundos) e a ferramenta notifica alguém (Slack, e-mail, SMS) quando esse limite é ultrapassado. O cuidado aqui é não exagerar: alerta demais, pra coisa que não precisa de ação imediata, ensina o time a ignorar alerta, e aí quando importar de verdade ninguém presta atenção."
                    },
                    {
                        "type": "code",
                        "value": "// jeito simples de acompanhar taxa de erro, sem nenhuma ferramenta externa\nconst contadores = { total: 0, erros: 0 };\n\napp.use((req, res, next) => {\n  contadores.total++;\n  res.on('finish', () => {\n    if (res.statusCode >= 500) contadores.erros++;\n  });\n  next();\n});\n\napp.get('/metrics', (req, res) => {\n  const taxaDeErro = contadores.erros / contadores.total;\n  res.json({ ...contadores, taxaDeErro });\n});"
                    },
                    {
                        "type": "quote",
                        "value": "Métrica não evita o problema, mas é o que te avisa antes do cliente."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a métrica de latência mede?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O tempo entre a requisição chegar e a resposta ser enviada",
                                "isCorrect": true
                            },
                            {
                                "text": "A quantidade de requisições que a aplicação recebe por segundo",
                                "isCorrect": false
                            },
                            {
                                "text": "O percentual de requisições que terminam em erro no servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de memória RAM que o processo está consumindo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Segundo os quatro sinais de ouro, o que \"saturação\" representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quão perto do limite estão recursos como CPU e memória",
                                "isCorrect": true
                            },
                            {
                                "text": "Quanto o time de infraestrutura está sobrecarregado",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantos logs de erro foram gerados na última hora",
                                "isCorrect": false
                            },
                            {
                                "text": "Quanto tempo o deploy leva desde o push até o ar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O dashboard mostra taxa de erro em 0,5% (normal), mas usuários reclamam que o site está lento. Qual métrica tende a confirmar o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Latência, que pode subir mesmo com taxa de erro baixa",
                                "isCorrect": true
                            },
                            {
                                "text": "Taxa de erro, a única métrica capaz de indicar lentidão",
                                "isCorrect": false
                            },
                            {
                                "text": "Throughput, já que menos requisição sempre é lentidão",
                                "isCorrect": false
                            },
                            {
                                "text": "Uso de disco, porque lentidão sempre vem de disco cheio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que definir o alerta como 'CPU acima de 90% por 10 minutos', em vez de disparar assim que a CPU passa de 90%?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Picos curtos de CPU são normais e alertar neles vira ruído",
                                "isCorrect": true
                            },
                            {
                                "text": "Ferramentas de monitoramento não medem CPU abaixo de 10 minutos",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker limita a frequência com que a CPU é consultada",
                                "isCorrect": false
                            },
                            {
                                "text": "Alertas de CPU só funcionam configurados em múltiplos de 10",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time cria alerta pra toda métrica que existe, com limites bem apertados, achando que assim nada passa despercebido. Depois de um mês, o time começa a ignorar as notificações no Slack. Qual é o problema mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Alerta em excesso virou ruído que o time aprendeu a ignorar",
                                "isCorrect": true
                            },
                            {
                                "text": "O Slack tem limite técnico de mensagens pra alertas confiáveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Métricas em excesso deixam o dashboard lento até travar",
                                "isCorrect": false
                            },
                            {
                                "text": "Limites apertados fazem a aplicação consumir mais CPU sozinha",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Deploy sem downtime e releases",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O problema do deploy que derruba\n\nLá no Módulo 5, o job de deploy fazia algo direto: conectava na VPS e rodava `docker compose pull` seguido de `docker compose up -d`. Isso funciona, mas tem uma lacuna: entre parar o container da versão antiga e o da versão nova ficar pronto pra receber requisição, existe uma janela, curta, mas existe, em que a aplicação não responde. Pra maioria dos produtos isso é inaceitável: usuário não aceita erro só porque alguém decidiu fazer deploy naquele horário.\n\nO objetivo das estratégias desta aula é reduzir essa janela a zero: trocar a versão da aplicação sem nenhum momento em que ela para de responder."
                    },
                    {
                        "type": "text",
                        "value": "## Rolling e blue-green, por cima\n\nDuas estratégias resolvem isso de formas diferentes:\n\n- **Rolling deploy**: em vez de derrubar tudo de uma vez, troca as instâncias aos poucos, uma (ou algumas) por vez. Sempre sobra pelo menos uma instância respondendo, então o tráfego nunca fica sem quem atenda.\n- **Blue-green deploy**: mantém dois ambientes completos, um servindo tráfego (\"blue\") e outro recebendo a versão nova (\"green\"). Sobe a versão nova inteira no green, confere que está tudo bem, e só então troca o tráfego de uma vez, geralmente no load balancer ou reverse proxy. Se algo der errado, volta o tráfego pro blue na mesma hora.\n\nCada uma tem seu custo: rolling é mais simples de montar, mas convive por um tempo com duas versões respondendo ao mesmo tempo; blue-green evita isso, mas exige o dobro de recursos rodando durante a troca."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia\", \"Como funciona\", \"Downtime\"], [\"Deploy direto\", \"Para a versão antiga e sobe a nova no lugar dela\", \"Existe, dura o tempo do restart\"], [\"Rolling deploy\", \"Troca as instâncias aos poucos, uma de cada vez\", \"Praticamente zero, sempre sobra instância no ar\"], [\"Blue-green deploy\", \"Sobe a versão nova em paralelo e só depois troca o tráfego de uma vez\", \"Zero, a troca em si é instantânea\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Versionamento e tags de release\n\nPra trocar de versão sem downtime, primeiro precisa dar nome às versões. É pra isso que serve o versionamento: uma tag como `v1.4.0` marca exatamente qual código está em produção num dado momento. O padrão mais comum é o versionamento semântico (`MAJOR.MINOR.PATCH`): o primeiro número muda quando quebra compatibilidade, o segundo quando adiciona funcionalidade sem quebrar nada, o terceiro pra correção de bug.\n\nEssa tag não fica só no Git: lá no Módulo 4, quando a imagem Docker é publicada no registry, ela pode levar a mesma versão como tag da imagem, além de `latest` e da tag por commit sha. Assim, \"o que está em produção\" vira uma pergunta com resposta exata: dá pra olhar a tag da imagem rodando, saber qual release é, e voltar pra tag anterior se precisar de rollback."
                    },
                    {
                        "type": "code",
                        "value": "git tag -a v1.4.0 -m \"Adiciona exportação de relatório em PDF\"\ngit push origin v1.4.0"
                    },
                    {
                        "type": "text",
                        "value": "## Estratégia de branches e feature flags, por cima\n\nA esteira de CI/CD desta trilha girou em torno de uma ideia: a branch principal reflete o que está (ou vai ficar) em produção, e toda mudança chega nela por pull request, depois de passar pela integração contínua. Esse modelo, branch principal sempre estável e branches de feature de vida curta, é chamado de forma geral de trunk-based development, e é o que a maioria dos times com deploy frequente usa. Existem variações mais elaboradas (como o git-flow, com branches separadas de desenvolvimento e release), mas pra deploy frequente, quanto mais simples a estratégia de branch, melhor.\n\nFeature flag é outra peça comum nesse cenário: em vez de decidir \"essa funcionalidade vai pro ar\" no momento do deploy, o código já sobe pra produção escondido atrás de uma flag (uma configuração, geralmente ligada por variável de ambiente ou um serviço externo) que decide se ela fica visível. Isso separa duas decisões que normalmente andam juntas: quando o código vai pro ar (deploy) e quando a funcionalidade fica visível pro usuário (release). Dá pra ligar a flag só pra um grupo pequeno, testar em produção de verdade, e desligar na hora se algo der errado, sem precisar de outro deploy."
                    },
                    {
                        "type": "quote",
                        "value": "Deploy sem downtime não é mágica: é sempre ter alguém saudável respondendo enquanto o novo sobe."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza um rolling deploy?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Trocar as instâncias aos poucos, mantendo sempre alguma no ar",
                                "isCorrect": true
                            },
                            {
                                "text": "Derrubar todas as instâncias de vez e subir a nova em seguida",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter duas versões rodando para sempre, sem desligar a antiga",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar os testes automatizados direto no ambiente de produção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No blue-green deploy, o que costuma acontecer com o ambiente 'blue' logo depois que o tráfego troca pro 'green'?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Fica parado, disponível como opção rápida de rollback",
                                "isCorrect": true
                            },
                            {
                                "text": "É apagado na hora, pra liberar espaço em disco na VPS",
                                "isCorrect": false
                            },
                            {
                                "text": "Continua recebendo metade do tráfego, dividido com o green",
                                "isCorrect": false
                            },
                            {
                                "text": "Vira automaticamente o novo ambiente de testes da equipe",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time faz deploy da tag v2.0.0 e minutos depois percebe que uma funcionalidade crítica quebrou. A imagem da versão anterior (v1.9.3) ainda está publicada no registry. Qual é o caminho mais direto pra reverter?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Subir de novo a imagem v1.9.3 pra reverter a versão",
                                "isCorrect": true
                            },
                            {
                                "text": "Editar o código direto na VPS até a funcionalidade voltar",
                                "isCorrect": false
                            },
                            {
                                "text": "Esperar o próximo push na branch principal corrigir sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Apagar a tag v2.0.0 do Git pra desfazer o deploy sozinho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal vantagem de uma feature flag no lançamento de uma funcionalidade nova?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Separa o momento do deploy do momento em que ela fica visível",
                                "isCorrect": true
                            },
                            {
                                "text": "Elimina de vez a necessidade de testar antes do deploy",
                                "isCorrect": false
                            },
                            {
                                "text": "Garante que a funcionalidade nunca vai ter nenhum bug",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui a branch principal como lugar do código versionado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time usa blue-green deploy com banco de dados compartilhado entre blue e green, e a versão green inclui uma migration que renomeia uma coluna usada pelo código antigo. O que tende a dar errado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A versão blue, ainda no ar, quebra ao usar uma coluna que sumiu",
                                "isCorrect": true
                            },
                            {
                                "text": "O deploy falha na hora, porque blue-green exige bancos separados",
                                "isCorrect": false
                            },
                            {
                                "text": "A migration não roda, porque blue-green bloqueia mudar o schema",
                                "isCorrect": false
                            },
                            {
                                "text": "O green herda os dados antigos e não aplica a migration nova",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Segurança, recap e o próximo passo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Secrets e configuração seguros\n\nIsso já apareceu em módulos anteriores, mas vale reforçar porque é onde mais gente erra: secret (senha de banco, chave de API, token de deploy) nunca vai no código, nunca vai commitado no repositório, mesmo um repositório privado. No GitHub Actions, secret vive em `${{ secrets.NOME }}`, configurado no repositório; em produção, vive em variável de ambiente, geralmente num arquivo `.env` que fica só no servidor e nunca é versionado.\n\nUm detalhe que combina com a aula de logs: cuidado pra não vazar secret sem querer num log estruturado. É comum logar o corpo inteiro de uma requisição ou um objeto de configuração pra debugar, e esquecer que ali dentro tem um token. Se log vai pra um lugar centralizado, e secret vaza pro log, o secret agora está espalhado em outro sistema inteiro."
                    },
                    {
                        "type": "text",
                        "value": "## Menor privilégio no deploy\n\nPrincípio do menor privilégio: cada peça do sistema deve ter acesso só ao que precisa pra fazer seu trabalho, nada a mais. Aplicado ao deploy desta trilha:\n\n- A chave SSH que o job de deploy usa pra entrar na VPS deveria pertencer a um usuário com acesso restrito ao necessário pra rodar o `docker compose`, não à conta root sem necessidade.\n- O usuário que a aplicação usa pra conectar no banco não precisa ser o superusuário do Postgres; precisa só das permissões nas tabelas que a aplicação de fato usa.\n- Um token de registry (Docker Hub ou GHCR) usado só pra publicar imagem pode ser restrito a isso, sem acesso de administrador da conta inteira.\n\nCada credencial mais restrita é um limite a menos que um vazamento consegue explorar."
                    },
                    {
                        "type": "text",
                        "value": "## Manter as dependências em dia\n\nDependência desatualizada é uma das portas de entrada mais comuns pra vulnerabilidade: uma falha de segurança é descoberta numa biblioteca, vira pública, e quem não atualizou fica exposto. Ferramentas como o Dependabot (nativo do GitHub) cuidam disso de forma automática: monitoram as dependências do projeto e abrem pull request sozinhas quando existe uma versão nova, principalmente quando ela corrige uma falha de segurança conhecida.\n\nO motivo de isso funcionar sem dar medo é exatamente o que essa trilha inteira construiu: o PR do Dependabot passa pelo mesmo pipeline de CI que qualquer outro, roda o typecheck e os testes, e só chega em produção se continuar tudo verde. Sem integração contínua, atualizar dependência é um risco manual; com ela, é rotina."
                    },
                    {
                        "type": "code",
                        "value": "// nunca faça isso: o valor do token vaza pro log\nlogger.info('chamando API externa', { token: apiToken });\n\n// melhor: registra que o token existe, sem expor o valor\nlogger.info('chamando API externa', { tokenPresente: Boolean(apiToken) });"
                    },
                    {
                        "type": "text",
                        "value": "## Recapitulando a trilha\n\nSete módulos depois, vale olhar pra trás pro caminho inteiro:\n\n- **Por que CI/CD**: trocar build, teste e deploy manuais por uma esteira automática, com feedback rápido e menos erro humano.\n- **Integração Contínua**: cada push dispara lint, typecheck, build e teste sozinho, e barra o merge quando algo quebra.\n- **GitHub Actions na prática**: o workflow em `.github/workflows`, com jobs, steps e actions reutilizáveis fazendo esse trabalho.\n- **Build e publicação da imagem**: a imagem Docker do módulo anterior sendo construída no CI e publicada num registry, taggeada e pronta pra ser consumida.\n- **Entrega e Deploy Contínuos**: a esteira completa, do push até o ar, promovendo entre ambientes e aplicando migration no deploy.\n- **Cloud**: onde a aplicação roda de fato, de VPS com Docker Compose a PaaS, com domínio, HTTPS e banco gerenciado.\n- **Operação** (este módulo): logs, health check, métricas, deploy sem downtime e segurança, pra manter tudo isso de pé depois que já está no ar.\n\nDo primeiro push até um alerta de produção, é a mesma esteira, ficando mais completa a cada módulo."
                    },
                    {
                        "type": "text",
                        "value": "## O próximo passo: operar em escala\n\nAté aqui, o desenho assumido foi relativamente simples: uma aplicação, talvez com mais de uma réplica, e um banco de dados, rodando atrás de um load balancer. Isso resolve a imensa maioria dos casos, e é o ponto de partida certo.\n\nMas em algum momento, se o produto crescer, esse desenho esbarra num limite: um serviço monolítico só, não importa quantas réplicas, começa a ficar difícil de escalar e manter conforme times e funcionalidades crescem junto. É aí que a arquitetura evolui: filas pra processar coisa pesada de forma assíncrona, cache pra tirar carga do banco, réplicas de banco pra leitura, e responsabilidades separadas em serviços menores conversando entre si. Esse é o tipo de tema que aparece mais adiante no seu roadmap.\n\nE o CI/CD que você aprendeu aqui não fica pra trás nessa evolução, pelo contrário: quanto mais peças o sistema tiver, mais importa ter uma esteira automática e confiável, pra colocar mudança no ar em qualquer uma delas sem medo."
                    },
                    {
                        "type": "quote",
                        "value": "CI/CD não é sobre ferramenta, é sobre confiança: confiança pra colocar código no ar todo dia, sabendo que, se algo quebrar, você vai ficar sabendo rápido e vai conseguir voltar atrás."
                    }
                ],
                "questions": [
                    {
                        "statement": "Onde um secret como uma senha de banco de dados deve ficar, segundo as boas práticas vistas na trilha?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em variável de ambiente ou no mecanismo de secrets do CI",
                                "isCorrect": true
                            },
                            {
                                "text": "Direto no código-fonte, num arquivo conhecido só pela equipe",
                                "isCorrect": false
                            },
                            {
                                "text": "Num comentário no Dockerfile, fácil de consultar depois",
                                "isCorrect": false
                            },
                            {
                                "text": "No nome da branch, visível durante o code review",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o princípio do menor privilégio recomenda pra credencial de banco usada pela aplicação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ter acesso só às tabelas e operações que ela realmente usa",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar sempre o superusuário do banco, pra nunca faltar permissão",
                                "isCorrect": false
                            },
                            {
                                "text": "Compartilhar a mesma senha do banco com todos os serviços",
                                "isCorrect": false
                            },
                            {
                                "text": "Ficar sem senha nenhuma, já que a rede interna é confiável",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um PR aberto automaticamente pelo Dependabot atualiza uma biblioteca por causa de uma falha de segurança. O que acontece com esse PR antes de poder ser mergeado, no mesmo pipeline de qualquer outro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Roda o mesmo job de teste que valida qualquer outro PR",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada, PRs do Dependabot pulam a integração contínua por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "O merge acontece sozinho, sem revisão nem pipeline nenhum",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o job de deploy roda, pra confirmar que a versão sobe sem erro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual opção resume melhor a diferença entre o que o CI/CD resolve e o que a escalabilidade da arquitetura resolve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "CI/CD entrega mudança com segurança; escala é aguentar mais carga",
                                "isCorrect": true
                            },
                            {
                                "text": "CI/CD e Arquitetura & escala tratam do mesmo assunto, sem diferença",
                                "isCorrect": false
                            },
                            {
                                "text": "Arquitetura & escala substitui a necessidade de pipeline de CI/CD",
                                "isCorrect": false
                            },
                            {
                                "text": "Escalar significa trocar o GitHub Actions por outra ferramenta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a trilha argumenta que ter uma esteira de CI/CD sólida fica ainda mais importante quando a arquitetura evolui pra vários serviços, filas e réplicas, e não menos importante?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Mais serviços multiplicam os pontos que precisam de teste e deploy seguros",
                                "isCorrect": true
                            },
                            {
                                "text": "Sistemas distribuídos não funcionam sem pipeline de deploy automatizado",
                                "isCorrect": false
                            },
                            {
                                "text": "Filas e réplicas só podem ser criadas por um workflow do GitHub Actions",
                                "isCorrect": false
                            },
                            {
                                "text": "Quanto mais serviços existem, menos teste automatizado é necessário",
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
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " ja tem " + existentes.length + " aulas. Nada a fazer.");
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
    console.log("Seed concluido: " + MODULOS.length + " modulos, " + totalAulas + " aulas, " + totalQuestoes + " questoes.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
