// Seed da trilha Spring Boot (Spring Boot 4.1). Conteúdo autoral.
// A linha 4 saiu em novembro de 2025 sobre o Spring Framework 7, e a 4.1 de junho
// de 2026 é o alvo recomendado: modularização, Java 25, versionamento de API,
// HTTP Service Clients, conexões preguiçosas e mitigação de SSRF.
//
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml run --rm -T --no-deps backend node scripts/seed-trilha-spring-boot.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

export const NOME = "Spring Boot";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Spring Boot 4.1 do primeiro projeto à produção: injeção de dependência e auto-configuração, REST com validação e tratamento de erros, JPA com relacionamentos e o problema N+1, Spring Security com JWT e autorização, testes com Mockito e Testcontainers, Actuator e observabilidade. Inclui o que a linha 4 trouxe: modularização, Java 25, versionamento de API e clientes HTTP declarativos.";
const CARGA_HORARIA = 24;

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - O Spring e o primeiro projeto",
    aulas: [
        {
            titulo: "O que é Spring e o que o Boot resolve",
            blocks: [
                {
                    type: "text",
                    value: "# Dois nomes, duas coisas\n\nO **Spring Framework** é a base: injeção de dependência, transações, acesso a dados, camada web. Ele existe desde 2003 e é o alicerce de boa parte do Java corporativo.\n\nO **Spring Boot** veio depois, em 2014, para resolver um problema do próprio Spring: configurar tudo dava um trabalho enorme. Ele traz **auto-configuração**, **starters** e um servidor embutido, e transforma dias de configuração em minutos.",
                },
                {
                    type: "table",
                    value: '[["O que o Boot resolve", "Como era antes"], ["auto-configuração", "XML ou classes de configuração à mão"], ["starters", "escolher e casar dezenas de versões"], ["servidor embutido", "publicar um WAR em um servidor externo"], ["padrões sensatos", "configurar tudo do zero"]]',
                },
                {
                    type: "text",
                    value: "## As versões desta trilha\n\nEsta trilha usa o **Spring Boot 4.1**, lançado em 10 de junho de 2026, sobre o **Spring Framework 7.0**.\n\nA linha 4 começou em novembro de 2025 e é uma virada grande: modularização do código, suporte de primeira classe ao **Java 25** mantendo compatibilidade com o Java 17, versionamento de API e clientes HTTP declarativos.",
                },
                {
                    type: "quote",
                    value: "O Boot não substitui o Spring: ele configura o Spring por você. Entender o que está por baixo é o que separa quem copia configuração de quem resolve problema.",
                },
            ],
            questions: [
                {
                    statement: "Qual a relação entre Spring Framework e Spring Boot?",
                    difficulty: "medio",
                    options: [
                        { text: "O Boot configura o Framework por você", isCorrect: true },
                        {
                            text: "O Boot é a versão mais nova, que substituiu o outro",
                            isCorrect: false,
                        },
                        {
                            text: "São projetos independentes, sem relação entre eles",
                            isCorrect: false,
                        },
                        { text: "O Framework é uma extensão opcional do Boot", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Spring Boot trouxe de mais marcante?",
                    difficulty: "medio",
                    options: [
                        { text: "Auto-configuração e servidor embutido", isCorrect: true },
                        { text: "Um banco de dados já configurado no projeto", isCorrect: false },
                        { text: "Uma linguagem própria para escrever serviços", isCorrect: false },
                        { text: "Um substituto para a máquina virtual do Java", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual versão do Spring Boot esta trilha usa?",
                    difficulty: "facil",
                    options: [
                        { text: "Spring Boot 4.1", isCorrect: true },
                        { text: "Spring Boot 2.7", isCorrect: false },
                        { text: "Spring Boot 3.2", isCorrect: false },
                        { text: "Spring Boot 1.5", isCorrect: false },
                    ],
                },
                {
                    statement: "Sobre qual versão do Framework o Spring Boot 4 roda?",
                    difficulty: "medio",
                    options: [
                        { text: "Spring Framework 7.0", isCorrect: true },
                        { text: "Spring Framework 6.2, da linha anterior", isCorrect: false },
                        { text: "Spring Framework 5.3, ainda mantida", isCorrect: false },
                        { text: "Ele não depende do Framework, é independente", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual versão do Java o Spring Boot 4 apoia em primeira classe?",
                    difficulty: "medio",
                    options: [
                        { text: "Java 25", isCorrect: true },
                        { text: "Java 17, que é a versão mínima aceita", isCorrect: false },
                        { text: "Java 11, mantida por compatibilidade", isCorrect: false },
                        { text: "Java 21, a versão anterior de longo prazo", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Criando o projeto",
            blocks: [
                {
                    type: "text",
                    value: "# O Spring Initializr\n\nO ponto de partida é o **start.spring.io**, um gerador que monta o projeto com as dependências escolhidas e as versões que funcionam juntas. A maioria dos editores tem o mesmo gerador integrado.",
                },
                {
                    type: "code",
                    value: "curl https://start.spring.io/starter.zip \\\n  -d dependencies=web,data-jpa,postgresql,validation \\\n  -d type=maven-project \\\n  -d javaVersion=25 \\\n  -d bootVersion=4.1.0 \\\n  -o loja.zip",
                },
                {
                    type: "text",
                    value: "## A classe principal\n\nO projeto gerado tem uma classe com `@SpringBootApplication`. Essa anotação junta três outras, e entender isso ajuda quando algo não é encontrado.",
                },
                {
                    type: "code",
                    value: "@SpringBootApplication\npublic class LojaApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(LojaApplication.class, args);\n    }\n}\n\n// @SpringBootApplication equivale a:\n// @Configuration       esta classe declara beans\n// @EnableAutoConfiguration  ligue a auto-configuração\n// @ComponentScan       procure componentes a partir daqui",
                },
                {
                    type: "text",
                    value: "O `@ComponentScan` procura a partir do **pacote da classe principal e abaixo**. Uma classe em um pacote irmão não é encontrada, e esse é o motivo mais comum de um serviço não ser injetado em projeto novo.\n\n## Rodando",
                },
                {
                    type: "code",
                    value: "./mvnw spring-boot:run\n# ou\n./mvnw package && java -jar target/loja-0.0.1-SNAPSHOT.jar\n\n# O servidor embutido sobe na porta 8080",
                },
            ],
            questions: [
                {
                    statement: "O que o Spring Initializr resolve?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Monta o projeto com versões que funcionam juntas",
                            isCorrect: true,
                        },
                        {
                            text: "Gera o código das entidades e dos controllers do projeto",
                            isCorrect: false,
                        },
                        { text: "Cria o banco de dados usado pela aplicação", isCorrect: false },
                        { text: "Configura o servidor onde o projeto vai rodar", isCorrect: false },
                    ],
                },
                {
                    statement: "Quantas anotações o `@SpringBootApplication` reúne?",
                    difficulty: "medio",
                    options: [
                        { text: "Três", isCorrect: true },
                        { text: "Duas, configuração e escaneamento", isCorrect: false },
                        { text: "Cinco, incluindo as de web e dados", isCorrect: false },
                        { text: "Uma só, que liga tudo de uma vez", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde o `@ComponentScan` procura por componentes?",
                    difficulty: "dificil",
                    options: [
                        { text: "No pacote da classe principal e abaixo", isCorrect: true },
                        { text: "Em todo o projeto, sem restrição de pacote", isCorrect: false },
                        { text: "Apenas no pacote onde a classe foi declarada", isCorrect: false },
                        {
                            text: "Nos pacotes listados no arquivo de configuração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um serviço em um pacote irmão não é injetado?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele fica fora do alcance do escaneamento", isCorrect: true },
                        { text: "Ele precisa ser importado na classe principal", isCorrect: false },
                        {
                            text: "Ele exige uma anotação diferente de componente",
                            isCorrect: false,
                        },
                        {
                            text: "Ele precisa estar no mesmo arquivo do controller",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em qual porta o servidor embutido sobe por padrão?",
                    difficulty: "facil",
                    options: [
                        { text: "8080", isCorrect: true },
                        { text: "80", isCorrect: false },
                        { text: "3000", isCorrect: false },
                        { text: "8443", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Injeção de dependência",
            blocks: [
                {
                    type: "text",
                    value: "# O coração do Spring\n\nEm vez de cada classe criar as suas dependências, o Spring as **cria e entrega**. Esse é o princípio da inversão de controle, e é o que torna o código testável: em teste, você entrega uma implementação falsa no lugar da real.",
                },
                {
                    type: "code",
                    value: "// Acoplado: impossível testar sem banco de verdade\npublic class PedidoService {\n    private final PedidoRepository repo = new PedidoRepositoryJpa();\n}\n\n// Injetado: o Spring entrega, e o teste entrega outro\n@Service\npublic class PedidoService {\n    private final PedidoRepository repo;\n\n    public PedidoService(PedidoRepository repo) {\n        this.repo = repo;\n    }\n}",
                },
                {
                    type: "text",
                    value: "## Sempre por construtor\n\nExistem três formas de injetar: construtor, campo com `@Autowired` e método. A recomendação é **construtor**, e por razões concretas:\n\n- O campo pode ser `final`, então o objeto é imutável\n- Fica impossível criar o objeto sem as dependências\n- O teste instancia a classe direto, sem framework nenhum\n- Uma lista longa de parâmetros denuncia que a classe faz coisas demais\n\nCom um único construtor, o `@Autowired` é dispensável.",
                },
                {
                    type: "table",
                    value: '[["Anotação", "Para que serve"], ["@Component", "componente genérico"], ["@Service", "regra de negócio"], ["@Repository", "acesso a dados"], ["@RestController", "camada web"], ["@Configuration", "classe que declara beans"], ["@Bean", "método que produz um bean"]]',
                },
                {
                    type: "text",
                    value: "As quatro primeiras são a mesma coisa para o Spring: todas registram um bean. A diferença é **semântica**, e ajuda quem lê a saber a responsabilidade de cada classe.",
                },
            ],
            questions: [
                {
                    statement: "O que a injeção de dependência inverte?",
                    difficulty: "medio",
                    options: [
                        { text: "Quem cria as dependências da classe", isCorrect: true },
                        { text: "A ordem em que as classes são carregadas", isCorrect: false },
                        { text: "A direção das chamadas entre as camadas", isCorrect: false },
                        { text: "O sentido do fluxo de dados na aplicação", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual forma de injeção é recomendada?",
                    difficulty: "medio",
                    options: [
                        { text: "Por construtor", isCorrect: true },
                        { text: "Por campo, com a anotação Autowired", isCorrect: false },
                        { text: "Por método setter, após a construção", isCorrect: false },
                        { text: "Tanto faz, as três são equivalentes", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual vantagem a injeção por construtor traz ao teste?",
                    difficulty: "dificil",
                    options: [
                        { text: "A classe pode ser instanciada sem o framework", isCorrect: true },
                        { text: "O teste executa bem mais rápido que os outros", isCorrect: false },
                        { text: "As dependências são criadas automaticamente", isCorrect: false },
                        { text: "O Spring injeta objetos falsos por padrão", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `@Service` e `@Repository` para o Spring?",
                    difficulty: "dificil",
                    options: [
                        { text: "Nenhuma técnica, a diferença é semântica", isCorrect: true },
                        { text: "O Repository ganha transações automáticas", isCorrect: false },
                        { text: "O Service é criado antes do Repository", isCorrect: false },
                        { text: "O Repository só funciona com JPA no projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que uma lista longa de parâmetros no construtor denuncia?",
                    difficulty: "medio",
                    options: [
                        { text: "Que a classe faz coisas demais", isCorrect: true },
                        {
                            text: "Que faltam anotações nos componentes injetados",
                            isCorrect: false,
                        },
                        {
                            text: "Que o escaneamento está encontrando duplicatas",
                            isCorrect: false,
                        },
                        { text: "Que a classe deveria usar injeção por campo", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Configuração e perfis",
            blocks: [
                {
                    type: "text",
                    value: "# Configuração fora do código\n\nO Spring lê configuração de várias fontes, com uma ordem de precedência bem definida. Saber essa ordem resolve a dúvida clássica de por que um valor não está sendo aplicado.",
                },
                {
                    type: "table",
                    value: '[["Fonte", "Precedência"], ["argumentos da linha de comando", "a mais alta"], ["variáveis de ambiente", "alta"], ["application-{perfil}.yml", "média"], ["application.yml", "baixa"], ["valores padrão no código", "a mais baixa"]]',
                },
                {
                    type: "code",
                    value: "# application.yml\nspring:\n  application:\n    name: loja\n  datasource:\n    url: ${DB_URL:jdbc:postgresql://localhost:5432/loja}\n    username: ${DB_USER:postgres}\n    password: ${DB_PASSWORD}\n  jpa:\n    hibernate:\n      ddl-auto: validate\n\nloja:\n  taxa-entrega: 12.50\n  prazo-dias: 5",
                },
                {
                    type: "text",
                    value: "Repare no `${DB_URL:padrão}`: a variável de ambiente vence, e o valor depois dos dois-pontos é o padrão para desenvolvimento.\n\n## Perfis\n\nUm **perfil** é um conjunto de configuração para um ambiente. O arquivo `application-prod.yml` só é lido quando o perfil `prod` está ativo, e seus valores sobrescrevem os do arquivo base.",
                },
                {
                    type: "code",
                    value: 'java -jar loja.jar --spring.profiles.active=prod\nSPRING_PROFILES_ACTIVE=prod java -jar loja.jar\n\n// Um bean que só existe em um perfil\n@Configuration\n@Profile("dev")\npublic class DadosDeExemplo { }',
                },
                {
                    type: "text",
                    value: "## Configuração tipada\n\nEspalhar `@Value` pelo código funciona e não valida nada. `@ConfigurationProperties` agrupa a configuração em uma classe, com tipos e validação.",
                },
                {
                    type: "code",
                    value: '@ConfigurationProperties(prefix = "loja")\n@Validated\npublic record LojaProperties(\n    @NotNull BigDecimal taxaEntrega,\n    @Min(1) int prazoDias\n) {}',
                },
            ],
            questions: [
                {
                    statement: "Qual fonte de configuração tem a maior precedência?",
                    difficulty: "medio",
                    options: [
                        { text: "Os argumentos da linha de comando", isCorrect: true },
                        { text: "As variáveis de ambiente do sistema", isCorrect: false },
                        { text: "O arquivo application.yml do projeto", isCorrect: false },
                        { text: "Os valores padrão declarados no código", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `${DB_URL:jdbc:...}` significa?",
                    difficulty: "medio",
                    options: [
                        { text: "Usa a variável, e o padrão se ela não existir", isCorrect: true },
                        { text: "Concatena a variável com o valor informado", isCorrect: false },
                        {
                            text: "Exige que a variável esteja definida no ambiente",
                            isCorrect: false,
                        },
                        { text: "Usa sempre o valor após os dois-pontos", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando `application-prod.yml` é lido?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando o perfil prod está ativo", isCorrect: true },
                        { text: "Sempre, junto com o arquivo base do projeto", isCorrect: false },
                        { text: "Quando a aplicação roda empacotada em um jar", isCorrect: false },
                        { text: "Quando nenhum outro arquivo é encontrado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de `@ConfigurationProperties` sobre `@Value`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Agrupa a configuração com tipos e validação", isCorrect: true },
                        {
                            text: "Lê os valores bem mais rápido na inicialização",
                            isCorrect: false,
                        },
                        { text: "Permite alterar a configuração em execução", isCorrect: false },
                        {
                            text: "Dispensa a declaração no arquivo de propriedades",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a anotação `@Profile('dev')` faz em uma classe?",
                    difficulty: "medio",
                    options: [
                        { text: "Só registra o bean naquele perfil", isCorrect: true },
                        {
                            text: "Define qual perfil será ativado na inicialização",
                            isCorrect: false,
                        },
                        {
                            text: "Impede que a classe rode em produção por engano",
                            isCorrect: false,
                        },
                        {
                            text: "Carrega o arquivo de configuração daquele perfil",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Auto-configuração e starters",
            blocks: [
                {
                    type: "text",
                    value: "# Como o Boot adivinha\n\nA **auto-configuração** funciona por condições: o Spring Boot olha o que está no classpath, o que já foi configurado e quais propriedades existem, e decide o que criar.\n\nSe o driver do PostgreSQL está presente e há uma URL de banco configurada, ele monta o pool de conexões. Se você declarou o seu, ele **recua** e usa o seu.",
                },
                {
                    type: "code",
                    value: '// É assim que a auto-configuração é escrita\n@AutoConfiguration\n@ConditionalOnClass(DataSource.class)\n@ConditionalOnProperty("spring.datasource.url")\npublic class DataSourceAutoConfiguration {\n\n    @Bean\n    @ConditionalOnMissingBean   // só cria se você não criou\n    public DataSource dataSource() { }\n}',
                },
                {
                    type: "text",
                    value: "O `@ConditionalOnMissingBean` é a chave do modelo: você nunca precisa desligar a auto-configuração, basta declarar o seu bean e ele vence.\n\n## Starters\n\nUm **starter** é um pacote que traz um conjunto de dependências compatíveis entre si. Em vez de escolher cinco bibliotecas e torcer para as versões casarem, você declara um.",
                },
                {
                    type: "table",
                    value: '[["Starter", "O que traz"], ["spring-boot-starter-web", "MVC, REST e servidor embutido"], ["spring-boot-starter-data-jpa", "JPA, Hibernate e transações"], ["spring-boot-starter-security", "autenticação e autorização"], ["spring-boot-starter-validation", "Bean Validation"], ["spring-boot-starter-test", "JUnit, Mockito e AssertJ"]]',
                },
                {
                    type: "text",
                    value: "## Descobrindo o que foi configurado\n\nQuando algo aparece sem você ter pedido, ou não aparece quando deveria, o relatório de auto-configuração mostra exatamente o que foi decidido e por quê.",
                },
                {
                    type: "code",
                    value: "java -jar loja.jar --debug\n# imprime o relatório de condições avaliadas",
                },
            ],
            questions: [
                {
                    statement: "Em que a auto-configuração se baseia para decidir?",
                    difficulty: "medio",
                    options: [
                        { text: "No classpath, nos beans e nas propriedades", isCorrect: true },
                        { text: "Apenas nas dependências declaradas no projeto", isCorrect: false },
                        { text: "Em um arquivo de configuração gerado no build", isCorrect: false },
                        { text: "Na versão do Java usada para compilar", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `@ConditionalOnMissingBean` garante?",
                    difficulty: "dificil",
                    options: [
                        { text: "O bean só é criado se você não criou o seu", isCorrect: true },
                        { text: "O bean é criado apenas uma vez na aplicação", isCorrect: false },
                        { text: "O bean é substituído quando outro é declarado", isCorrect: false },
                        { text: "O bean falha se a dependência estiver ausente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é um starter?",
                    difficulty: "medio",
                    options: [
                        { text: "Um pacote com dependências compatíveis", isCorrect: true },
                        { text: "Um modelo de projeto pronto para começar", isCorrect: false },
                        { text: "Uma classe que inicializa a aplicação", isCorrect: false },
                        {
                            text: "Um perfil de configuração para desenvolvimento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como declarar o seu próprio bean afeta a auto-configuração?",
                    difficulty: "medio",
                    options: [
                        { text: "A auto-configuração recua e usa o seu", isCorrect: true },
                        { text: "Os dois beans são criados e coexistem", isCorrect: false },
                        { text: "A aplicação falha por conflito de definição", isCorrect: false },
                        { text: "É preciso desligar a auto-configuração antes", isCorrect: false },
                    ],
                },
                {
                    statement: "Como ver o que a auto-configuração decidiu?",
                    difficulty: "medio",
                    options: [
                        { text: "Subindo a aplicação com a flag debug", isCorrect: true },
                        { text: "Consultando um endpoint do Actuator", isCorrect: false },
                        { text: "Lendo os arquivos gerados na pasta target", isCorrect: false },
                        { text: "Habilitando o log em nível de rastreamento", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Web e REST",
    aulas: [
        {
            titulo: "Controllers e mapeamentos",
            blocks: [
                {
                    type: "text",
                    value: "# Recebendo requisições\n\nUm `@RestController` responde HTTP e devolve dados serializados, normalmente JSON. As anotações de mapeamento ligam verbo e caminho a um método.",
                },
                {
                    type: "code",
                    value: '@RestController\n@RequestMapping("/api/produtos")\npublic class ProdutoController {\n\n    private final ProdutoService service;\n\n    public ProdutoController(ProdutoService service) {\n        this.service = service;\n    }\n\n    @GetMapping\n    public Page<ProdutoResponse> listar(Pageable paginacao) {\n        return service.listar(paginacao);\n    }\n\n    @GetMapping("/{id}")\n    public ProdutoResponse buscar(@PathVariable Long id) {\n        return service.buscar(id);\n    }\n\n    @PostMapping\n    @ResponseStatus(HttpStatus.CREATED)\n    public ProdutoResponse criar(@RequestBody @Valid CriarProdutoRequest req) {\n        return service.criar(req);\n    }\n}',
                },
                {
                    type: "table",
                    value: '[["Anotação", "De onde vem o valor"], ["@PathVariable", "um trecho da URL"], ["@RequestParam", "a query string"], ["@RequestBody", "o corpo da requisição"], ["@RequestHeader", "um cabeçalho"]]',
                },
                {
                    type: "text",
                    value: "## Controller e RestController\n\n`@Controller` devolve o **nome de uma view** para ser renderizada. `@RestController` é `@Controller` mais `@ResponseBody`: o retorno vira o corpo da resposta.\n\nEm API é sempre `@RestController`. Usar `@Controller` por engano faz o Spring procurar um template com o nome do que você devolveu, e o erro resultante confunde.",
                },
                {
                    type: "text",
                    value: "## Nunca devolva a entidade\n\nDevolver a entidade JPA direto vaza campos internos, expõe a estrutura da tabela e cria carregamento preguiçoso no meio da serialização. Use um record de resposta.",
                },
                {
                    type: "code",
                    value: "public record ProdutoResponse(Long id, String nome, BigDecimal preco) {\n    public static ProdutoResponse de(Produto p) {\n        return new ProdutoResponse(p.getId(), p.getNome(), p.getPreco());\n    }\n}",
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença entre `@Controller` e `@RestController`?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O Rest devolve o corpo, o outro o nome de uma view",
                            isCorrect: true,
                        },
                        {
                            text: "O Rest só aceita requisições do tipo GET e POST",
                            isCorrect: false,
                        },
                        {
                            text: "O Controller não pode receber injeção de dependência",
                            isCorrect: false,
                        },
                        {
                            text: "O Rest exige que o retorno seja sempre um record",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "De onde `@PathVariable` tira o valor?",
                    difficulty: "facil",
                    options: [
                        { text: "De um trecho da URL", isCorrect: true },
                        { text: "Da query string após a interrogação", isCorrect: false },
                        { text: "Do corpo enviado na requisição", isCorrect: false },
                        { text: "De um cabeçalho HTTP da chamada", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que não devolver a entidade JPA na resposta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Vaza campos internos e dispara carregamento preguiçoso",
                            isCorrect: true,
                        },
                        { text: "A entidade não pode ser convertida para JSON", isCorrect: false },
                        {
                            text: "O Spring recusa entidades JPA como retorno de um método",
                            isCorrect: false,
                        },
                        {
                            text: "A serialização fica bem mais lenta que um record",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve `@ResponseStatus(HttpStatus.CREATED)`?",
                    difficulty: "medio",
                    options: [
                        { text: "Definir o código HTTP da resposta", isCorrect: true },
                        { text: "Validar que o recurso foi mesmo criado", isCorrect: false },
                        { text: "Registrar a criação no log da aplicação", isCorrect: false },
                        { text: "Indicar que o método altera o banco de dados", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `@RequestBody` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Converte o corpo da requisição em objeto", isCorrect: true },
                        { text: "Valida o corpo antes de chegar ao método", isCorrect: false },
                        { text: "Lê os parâmetros da query string da URL", isCorrect: false },
                        { text: "Define o formato que a resposta terá", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Validação",
            blocks: [
                {
                    type: "text",
                    value: "# Bean Validation\n\nAs regras de formato ficam no objeto de entrada, como anotações. O `@Valid` no parâmetro do controller aciona a verificação **antes** de o método rodar.",
                },
                {
                    type: "code",
                    value: 'public record CriarProdutoRequest(\n    @NotBlank(message = "O nome é obrigatório")\n    @Size(max = 255)\n    String nome,\n\n    @NotNull\n    @DecimalMin(value = "0.0", inclusive = false)\n    BigDecimal preco,\n\n    @NotNull\n    Long categoriaId,\n\n    @Email\n    String emailContato\n) {}',
                },
                {
                    type: "table",
                    value: '[["Anotação", "Verifica"], ["@NotNull", "que não é nulo"], ["@NotBlank", "texto com conteúdo não vazio"], ["@NotEmpty", "coleção ou texto não vazio"], ["@Size", "tamanho entre mínimo e máximo"], ["@Positive e @Min", "valores numéricos"], ["@Pattern", "expressão regular"]]',
                },
                {
                    type: "text",
                    value: "## A confusão entre NotNull, NotEmpty e NotBlank\n\nElas parecem iguais e recusam coisas diferentes. Para texto vindo de formulário, `@NotBlank` é quase sempre a certa: ela recusa `null`, string vazia e string só com espaços.",
                },
                {
                    type: "table",
                    value: '[["Valor", "@NotNull", "@NotEmpty", "@NotBlank"], ["null", "recusa", "recusa", "recusa"], ["\\"\\"", "aceita", "recusa", "recusa"], ["\\"   \\"", "aceita", "aceita", "recusa"]]',
                },
                {
                    type: "text",
                    value: "## Validação de negócio é outra coisa\n\nBean Validation cuida de **formato**. Regras que dependem do banco ou de outro serviço, como um email já cadastrado, pertencem ao service, não à anotação.",
                },
            ],
            questions: [
                {
                    statement: "O que o `@Valid` no parâmetro aciona?",
                    difficulty: "medio",
                    options: [
                        { text: "A validação antes de o método rodar", isCorrect: true },
                        { text: "A conversão do corpo para o tipo do objeto", isCorrect: false },
                        { text: "O registro dos erros no log da aplicação", isCorrect: false },
                        {
                            text: "A verificação das regras de negócio do service",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual anotação recusa uma string só com espaços?",
                    difficulty: "dificil",
                    options: [
                        { text: "@NotBlank", isCorrect: true },
                        { text: "@NotNull, que verifica o valor nulo", isCorrect: false },
                        { text: "@NotEmpty, que verifica o tamanho", isCorrect: false },
                        { text: "@Size, com o mínimo definido em um", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `@NotNull` aceita que `@NotEmpty` recusa?",
                    difficulty: "medio",
                    options: [
                        { text: "A string vazia", isCorrect: true },
                        { text: "A string com apenas espaços em branco", isCorrect: false },
                        { text: "O valor nulo passado no campo", isCorrect: false },
                        { text: "Uma coleção com um único elemento", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde uma regra que consulta o banco deve ficar?",
                    difficulty: "medio",
                    options: [
                        { text: "No service, não na anotação", isCorrect: true },
                        { text: "Em uma anotação de validação personalizada", isCorrect: false },
                        { text: "No controller, antes de chamar o service", isCorrect: false },
                        { text: "No repository, junto com a consulta", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Bean Validation cuida?",
                    difficulty: "medio",
                    options: [
                        { text: "Do formato dos dados de entrada", isCorrect: true },
                        { text: "Das regras de negócio da aplicação", isCorrect: false },
                        { text: "Da autorização de quem fez a chamada", isCorrect: false },
                        { text: "Da consistência dos dados no banco", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Tratamento de erros",
            blocks: [
                {
                    type: "text",
                    value: "# Uma resposta de erro consistente\n\nSem tratamento, cada exceção vira um 500 com um corpo padrão que expõe detalhes internos. O `@RestControllerAdvice` centraliza o tratamento e devolve a mesma estrutura para toda a API.",
                },
                {
                    type: "code",
                    value: '@RestControllerAdvice\npublic class TratadorDeErros {\n\n    @ExceptionHandler(RecursoNaoEncontrado.class)\n    public ProblemDetail naoEncontrado(RecursoNaoEncontrado e) {\n        var p = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);\n        p.setTitle("Recurso não encontrado");\n        p.setDetail(e.getMessage());\n        return p;\n    }\n\n    @ExceptionHandler(MethodArgumentNotValidException.class)\n    public ProblemDetail invalido(MethodArgumentNotValidException e) {\n        var p = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);\n        p.setTitle("Dados inválidos");\n        p.setProperty("campos", e.getBindingResult().getFieldErrors().stream()\n            .collect(toMap(FieldError::getField, FieldError::getDefaultMessage)));\n        return p;\n    }\n}',
                },
                {
                    type: "text",
                    value: "## ProblemDetail\n\nO `ProblemDetail` implementa a **RFC 7807**, um formato padronizado de resposta de erro com `type`, `title`, `status`, `detail` e `instance`. Usá-lo evita que cada API invente o próprio formato, e clientes conhecidos já sabem lê-lo.",
                },
                {
                    type: "code",
                    value: '{\n  "type": "about:blank",\n  "title": "Dados inválidos",\n  "status": 400,\n  "campos": {\n    "nome": "O nome é obrigatório",\n    "preco": "deve ser maior que 0"\n  }\n}',
                },
                {
                    type: "quote",
                    value: "Nunca devolva a mensagem da exceção original ao cliente. Ela costuma trazer nome de tabela, consulta e caminho de arquivo.",
                },
                {
                    type: "text",
                    value: "## O que registrar\n\nErro esperado, como um recurso não encontrado, é log de nível informativo. Erro inesperado é log de erro **com a pilha**, e resposta genérica para quem chamou.",
                },
            ],
            questions: [
                {
                    statement: "O que o `@RestControllerAdvice` centraliza?",
                    difficulty: "medio",
                    options: [
                        { text: "O tratamento de exceções da API", isCorrect: true },
                        { text: "A validação dos objetos de entrada", isCorrect: false },
                        { text: "A configuração dos controllers do projeto", isCorrect: false },
                        { text: "O registro das rotas da aplicação", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o `ProblemDetail` implementa?",
                    difficulty: "medio",
                    options: [
                        { text: "Um formato padronizado de resposta de erro", isCorrect: true },
                        {
                            text: "Um mecanismo de repetição automática da requisição",
                            isCorrect: false,
                        },
                        { text: "Um contrato de validação dos campos", isCorrect: false },
                        { text: "Um registro estruturado para o log", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que não devolver a mensagem da exceção original?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ela expõe tabelas, consultas e caminhos internos",
                            isCorrect: true,
                        },
                        { text: "Ela costuma estar em inglês para o usuário", isCorrect: false },
                        {
                            text: "Ela acaba deixando a resposta muito maior que o normal",
                            isCorrect: false,
                        },
                        { text: "Ela impede que o cliente trate o erro sozinho", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual nível de log um recurso não encontrado merece?",
                    difficulty: "medio",
                    options: [
                        { text: "Informativo, é um erro esperado", isCorrect: true },
                        { text: "Erro, com a pilha completa registrada", isCorrect: false },
                        { text: "Crítico, por indicar falha na aplicação", isCorrect: false },
                        { text: "Nenhum, esse caso não precisa de log", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece sem nenhum tratamento de erro?",
                    difficulty: "medio",
                    options: [
                        { text: "Toda exceção vira um 500 com detalhes internos", isCorrect: true },
                        {
                            text: "A aplicação inteira para de responder às requisições",
                            isCorrect: false,
                        },
                        { text: "O Spring devolve um 404 para qualquer falha", isCorrect: false },
                        { text: "As exceções são registradas e ignoradas", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Versionamento de API e clientes HTTP",
            blocks: [
                {
                    type: "text",
                    value: "# Versionar API, novidade do Boot 4\n\nQuando uma API muda de forma incompatível, clientes antigos quebram. A saída sempre foi versionar, e cada equipe inventava a sua: caminho com `/v1`, cabeçalho próprio, parâmetro na query.\n\nO **Spring Framework 7**, base do Boot 4, trouxe **suporte de primeira classe a versionamento**, com a versão declarada no próprio mapeamento.",
                },
                {
                    type: "code",
                    value: '@RestController\n@RequestMapping("/api/produtos")\npublic class ProdutoController {\n\n    @GetMapping(version = "1.0")\n    public ProdutoV1 buscarV1(@PathVariable Long id) { }\n\n    @GetMapping(version = "2.0")\n    public ProdutoV2 buscarV2(@PathVariable Long id) { }\n}',
                },
                {
                    type: "text",
                    value: "A estratégia de onde a versão é lida, cabeçalho, caminho ou parâmetro, vira **configuração**, e o mesmo controller atende as duas sem duplicar rota nem escrever filtro.\n\n## HTTP Service Clients\n\nA outra novidade grande é o cliente HTTP **declarativo**. Em vez de montar a chamada na mão, você descreve a interface e o Spring gera a implementação.",
                },
                {
                    type: "code",
                    value: '@HttpExchange("/api/cep")\npublic interface CepClient {\n\n    @GetExchange("/{cep}")\n    Endereco buscar(@PathVariable String cep);\n\n    @PostExchange\n    Endereco cadastrar(@RequestBody NovoEndereco req);\n}\n\n// O Boot 4 registra a implementação sozinho:\n// basta injetar CepClient onde precisar',
                },
                {
                    type: "text",
                    value: "O ganho vai além de escrever menos: a interface **é** o contrato, e testar fica simples porque basta substituir a interface por uma implementação falsa.\n\nNo Spring Boot 4.1, esses clientes também ganharam proteção contra **SSRF**, o ataque em que uma URL controlada pelo atacante faz o servidor chamar um endereço interno.",
                },
            ],
            questions: [
                {
                    statement: "O que o Spring Framework 7 trouxe para versionamento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Suporte de primeira classe, no próprio mapeamento",
                            isCorrect: true,
                        },
                        {
                            text: "Um filtro já pronto para ler a versão vinda do cabeçalho",
                            isCorrect: false,
                        },
                        {
                            text: "Uma anotação que descontinua endpoints antigos",
                            isCorrect: false,
                        },
                        { text: "Um gerador de documentação por versão da API", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde a estratégia de leitura da versão é definida?",
                    difficulty: "medio",
                    options: [
                        { text: "Na configuração da aplicação", isCorrect: true },
                        { text: "Em cada método anotado do controller", isCorrect: false },
                        { text: "No cliente que faz a chamada à API", isCorrect: false },
                        { text: "No arquivo de rotas do projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um HTTP Service Client é?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma interface que descreve as chamadas", isCorrect: true },
                        { text: "Uma classe que monta as requisições na mão", isCorrect: false },
                        { text: "Um proxy que intercepta chamadas de saída", isCorrect: false },
                        { text: "Um servidor embutido para testes de API", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem do cliente declarativo em testes?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Basta trocar a interface por uma implementação falsa",
                            isCorrect: true,
                        },
                        { text: "As chamadas passam a ser feitas em memória", isCorrect: false },
                        {
                            text: "O cliente valida o corpo da resposta automaticamente",
                            isCorrect: false,
                        },
                        { text: "Os testes deixam de precisar de rede", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é um ataque de SSRF?",
                    difficulty: "dificil",
                    options: [
                        { text: "Fazer o servidor chamar um endereço interno", isCorrect: true },
                        { text: "Injetar código malicioso na resposta da API", isCorrect: false },
                        {
                            text: "Enviar requisições em massa para derrubar o servidor",
                            isCorrect: false,
                        },
                        {
                            text: "Interceptar a comunicação entre cliente e servidor",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Paginação, ordenação e boas práticas de API",
            blocks: [
                {
                    type: "text",
                    value: "# Nunca devolva a lista inteira\n\nUm endpoint que devolve todos os registros funciona bem com cem linhas e derruba a aplicação com um milhão. Paginação não é otimização, é requisito.\n\nO Spring Data resolve isso com o `Pageable`, que já lê os parâmetros da URL sozinho.",
                },
                {
                    type: "code",
                    value: '@GetMapping\npublic Page<ProdutoResponse> listar(\n    @PageableDefault(size = 20, sort = "nome") Pageable paginacao\n) {\n    return service.listar(paginacao);\n}\n\n// GET /api/produtos?page=0&size=20&sort=preco,desc',
                },
                {
                    type: "text",
                    value: "## Os códigos de resposta que importam\n\nUsar o código certo permite que o cliente trate a resposta sem ler o corpo.",
                },
                {
                    type: "table",
                    value: '[["Código", "Quando usar"], ["200", "deu certo e há corpo"], ["201", "recurso criado, com Location"], ["204", "deu certo e não há corpo"], ["400", "a requisição está errada"], ["401 e 403", "não autenticado e sem permissão"], ["404", "o recurso não existe"], ["409", "conflito, como duplicidade"], ["422", "entendi, mas a regra não permite"]]',
                },
                {
                    type: "text",
                    value: "A confusão mais comum é entre **401** e **403**: o primeiro é *não sei quem você é*, o segundo é *sei quem você é e você não pode*.\n\n## Idempotência\n\n`GET`, `PUT` e `DELETE` devem ser idempotentes: repetir a chamada leva ao mesmo estado. `POST` não é, e por isso duas submissões criam dois registros. Quando isso importa, uma chave de idempotência enviada pelo cliente resolve.",
                },
            ],
            questions: [
                {
                    statement: "Por que paginação é requisito e não otimização?",
                    difficulty: "medio",
                    options: [
                        { text: "Sem ela a aplicação cai quando a tabela cresce", isCorrect: true },
                        { text: "Porque o Spring Data exige o uso do Pageable", isCorrect: false },
                        {
                            text: "Porque o JSON tem um limite de tamanho definido",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o navegador não renderiza listas grandes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a diferença entre 401 e 403?",
                    difficulty: "medio",
                    options: [
                        { text: "Um é não autenticado, o outro é sem permissão", isCorrect: true },
                        {
                            text: "Um é erro do cliente e o outro é erro do servidor",
                            isCorrect: false,
                        },
                        { text: "Um é temporário e o outro é permanente", isCorrect: false },
                        { text: "Um vale para API e o outro para páginas web", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual código usar ao criar um recurso?",
                    difficulty: "medio",
                    options: [
                        { text: "201, com o cabeçalho Location", isCorrect: true },
                        { text: "200, como em qualquer resposta de sucesso", isCorrect: false },
                        { text: "204, indicando que não há corpo na resposta", isCorrect: false },
                        { text: "202, indicando que foi aceito para processar", isCorrect: false },
                    ],
                },
                {
                    statement: "O que significa uma operação ser idempotente?",
                    difficulty: "dificil",
                    options: [
                        { text: "Repeti-la leva ao mesmo estado final", isCorrect: true },
                        { text: "Ela pode ser executada por qualquer usuário", isCorrect: false },
                        { text: "Ela não altera nenhum dado no banco", isCorrect: false },
                        {
                            text: "Ela devolve sempre a mesma resposta ao cliente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual verbo HTTP não é idempotente?",
                    difficulty: "medio",
                    options: [
                        { text: "POST", isCorrect: true },
                        { text: "PUT, que substitui o recurso inteiro", isCorrect: false },
                        { text: "DELETE, que remove o recurso indicado", isCorrect: false },
                        { text: "GET, que apenas consulta o recurso", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Dados com JPA",
    aulas: [
        {
            titulo: "Entidades e o Hibernate",
            blocks: [
                {
                    type: "text",
                    value: "# JPA, Hibernate e Spring Data\n\nTrês nomes que se confundem:\n\n- **JPA** é a **especificação**: as anotações e a interface\n- **Hibernate** é a **implementação** mais usada dela\n- **Spring Data JPA** é a camada do Spring **em cima** disso, que gera os repositórios",
                },
                {
                    type: "code",
                    value: '@Entity\n@Table(name = "produtos")\npublic class Produto {\n\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n\n    @Column(nullable = false)\n    private String nome;\n\n    @Column(nullable = false, precision = 10, scale = 2)\n    private BigDecimal preco;\n\n    @ManyToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = "categoria_id")\n    private Categoria categoria;\n\n    @Enumerated(EnumType.STRING)\n    private StatusProduto status;\n\n    protected Produto() {}   // exigido pela JPA\n}',
                },
                {
                    type: "text",
                    value: "## Dois detalhes que causam bug em produção\n\n**`@Enumerated(EnumType.STRING)` não é opcional.** O padrão é `ORDINAL`, que grava a **posição** do valor no enum. Inserir um valor no meio do enum depois disso reescreve o significado de todos os registros já gravados, em silêncio.\n\n**`ddl-auto` nunca deve ser `update` em produção.** Ele altera o schema sozinho conforme as entidades, sem revisão e sem histórico. Em produção use `validate`, com as mudanças vindo de migrations.",
                },
                {
                    type: "table",
                    value: '[["ddl-auto", "O que faz", "Onde usar"], ["none", "não mexe no schema", "produção"], ["validate", "confere e falha se divergir", "produção"], ["update", "altera para casar com as entidades", "nunca"], ["create-drop", "recria a cada execução", "teste"]]',
                },
                {
                    type: "quote",
                    value: "Enum gravado como ordinal é uma bomba-relógio: funciona por meses e explode quando alguém acrescenta um valor no meio da lista.",
                },
            ],
            questions: [
                {
                    statement: "Qual a relação entre JPA e Hibernate?",
                    difficulty: "medio",
                    options: [
                        { text: "Um é a especificação e o outro a implementação", isCorrect: true },
                        { text: "São a mesma coisa, com dois nomes diferentes", isCorrect: false },
                        {
                            text: "O Hibernate é a versão nova que substituiu a JPA",
                            isCorrect: false,
                        },
                        {
                            text: "A JPA é uma camada do Spring sobre o Hibernate",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que `@Enumerated(EnumType.STRING)` importa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O padrão grava a posição, que muda ao editar o enum",
                            isCorrect: true,
                        },
                        { text: "O padrão não aceita enums com muitos valores", isCorrect: false },
                        {
                            text: "A string ocupa menos espaço na tabela do banco",
                            isCorrect: false,
                        },
                        {
                            text: "O padrão acaba impedindo a leitura do valor pelo Hibernate",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual valor de `ddl-auto` usar em produção?",
                    difficulty: "medio",
                    options: [
                        { text: "validate ou none", isCorrect: true },
                        { text: "update, para acompanhar as entidades", isCorrect: false },
                        { text: "create-drop, recriando a cada implantação", isCorrect: false },
                        { text: "create, garantindo o schema correto", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `ddl-auto: update` é perigoso?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele altera o schema sem revisão nem histórico", isCorrect: true },
                        { text: "Ele apaga todos os dados a cada inicialização", isCorrect: false },
                        { text: "Ele deixa a aplicação bem mais lenta ao subir", isCorrect: false },
                        { text: "Ele impede o uso de migrations no projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a entidade precisa de um construtor sem argumentos?",
                    difficulty: "medio",
                    options: [
                        { text: "A JPA o exige para instanciar a entidade", isCorrect: true },
                        { text: "O Spring o usa para injetar as dependências", isCorrect: false },
                        { text: "O Jackson o exige para converter em JSON", isCorrect: false },
                        { text: "O banco o usa ao mapear as colunas", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Repositories e query methods",
            blocks: [
                {
                    type: "text",
                    value: "# Consultas geradas pelo nome\n\nO Spring Data cria a implementação do repositório em tempo de execução. Métodos declarados seguindo a convenção de nome viram consultas, sem que você escreva SQL.",
                },
                {
                    type: "code",
                    value: "public interface ProdutoRepository extends JpaRepository<Produto, Long> {\n\n    List<Produto> findByAtivoTrue();\n\n    List<Produto> findByCategoriaIdAndPrecoLessThan(Long categoriaId, BigDecimal teto);\n\n    Optional<Produto> findBySlug(String slug);\n\n    boolean existsBySlug(String slug);\n\n    Page<Produto> findByNomeContainingIgnoreCase(String termo, Pageable p);\n\n    long countByCategoriaId(Long categoriaId);\n}",
                },
                {
                    type: "table",
                    value: '[["Trecho do nome", "Vira"], ["findBy", "select"], ["And e Or", "condições combinadas"], ["LessThan e Between", "comparações"], ["Containing e StartingWith", "like"], ["OrderBy...Desc", "ordenação"], ["existsBy e countBy", "exists e count"]]',
                },
                {
                    type: "text",
                    value: "## Onde a convenção deixa de compensar\n\nO nome cresce junto com a consulta, e chega um ponto em que ele fica ilegível. Nesse momento, `@Query` é mais claro.",
                },
                {
                    type: "code",
                    value: '@Query("""\n    select p from Produto p\n    join fetch p.categoria c\n    where p.ativo = true\n      and (:termo is null or lower(p.nome) like lower(concat(\'%\', :termo, \'%\')))\n    """)\nPage<Produto> buscar(@Param("termo") String termo, Pageable p);',
                },
                {
                    type: "text",
                    value: "## O retorno diz a intenção\n\n`Optional<T>` para o que pode não existir, `List<T>` para várias linhas, `Page<T>` quando há paginação e você quer o total, `Slice<T>` quando quer só saber se há mais. `Page` faz uma consulta extra de contagem; `Slice`, não.",
                },
            ],
            questions: [
                {
                    statement: "Como o Spring Data implementa os métodos do repositório?",
                    difficulty: "medio",
                    options: [
                        { text: "Gerando a implementação em tempo de execução", isCorrect: true },
                        {
                            text: "Exigindo que você escreva a consulta inteira em SQL",
                            isCorrect: false,
                        },
                        { text: "Gerando o código-fonte durante a compilação", isCorrect: false },
                        { text: "Copiando de uma classe base já implementada", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `findByNomeContainingIgnoreCase` gera?",
                    difficulty: "medio",
                    options: [
                        { text: "Um like sem diferenciar maiúsculas", isCorrect: true },
                        { text: "Uma comparação exata do nome informado", isCorrect: false },
                        { text: "Uma busca por texto completo no banco", isCorrect: false },
                        { text: "Uma consulta que ignora o campo quando é nulo", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando trocar o nome longo por `@Query`?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando o nome do método fica ilegível", isCorrect: true },
                        { text: "Quando a consulta usa mais de uma tabela", isCorrect: false },
                        { text: "Quando o retorno é uma página de resultados", isCorrect: false },
                        { text: "Sempre, o nome nunca deve gerar a consulta", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `Page` e `Slice`?",
                    difficulty: "dificil",
                    options: [
                        { text: "O Page faz uma consulta extra de contagem", isCorrect: true },
                        { text: "O Slice não permite ordenar os resultados", isCorrect: false },
                        {
                            text: "O Page só funciona com consultas geradas por nome",
                            isCorrect: false,
                        },
                        { text: "O Slice devolve todos os registros de uma vez", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual retorno usar para algo que pode não existir?",
                    difficulty: "facil",
                    options: [
                        { text: "Optional", isCorrect: true },
                        { text: "List, que fica vazia quando não encontra", isCorrect: false },
                        { text: "O próprio tipo, devolvendo nulo se faltar", isCorrect: false },
                        { text: "Page, com zero elementos no resultado", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Relacionamentos e o problema N+1",
            blocks: [
                {
                    type: "text",
                    value: "# Como as entidades se ligam\n\nOs quatro relacionamentos da JPA espelham os do banco. O lado que **tem a chave estrangeira** é o dono da relação.",
                },
                {
                    type: "code",
                    value: '@Entity\npublic class Pedido {\n    @ManyToOne(fetch = FetchType.LAZY)\n    private Cliente cliente;\n\n    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)\n    private List<ItemPedido> itens = new ArrayList<>();\n}',
                },
                {
                    type: "text",
                    value: "## Sempre LAZY em ManyToOne\n\nO padrão de `@ManyToOne` e `@OneToOne` é **EAGER**, o que significa que carregar um pedido traz o cliente junto, sempre, mesmo quando ninguém vai usá-lo. Em uma cadeia de entidades isso arrasta meio banco.\n\nDeclare `fetch = FetchType.LAZY` em todo `@ManyToOne`. O padrão da JPA aqui é uma escolha antiga e ruim.",
                },
                {
                    type: "text",
                    value: "# O problema N+1\n\nCom carregamento preguiçoso, percorrer uma lista acessando a relação dispara **uma consulta por item**. Cem pedidos viram 101 consultas.\n\nÉ o problema de desempenho mais comum em JPA, e o mais silencioso: em desenvolvimento com dez registros ninguém percebe.",
                },
                {
                    type: "code",
                    value: '// N+1: uma consulta por pedido\nList<Pedido> pedidos = repo.findAll();\nfor (Pedido p : pedidos) {\n    System.out.println(p.getCliente().getNome());\n}\n\n// Solução 1: join fetch na consulta\n@Query("select p from Pedido p join fetch p.cliente")\nList<Pedido> buscarComCliente();\n\n// Solução 2: entity graph, sem escrever a consulta\n@EntityGraph(attributePaths = {"cliente", "itens"})\nList<Pedido> findByStatus(StatusPedido status);',
                },
                {
                    type: "quote",
                    value: "Ligue spring.jpa.show-sql em desenvolvimento. O N+1 fica visível na hora: cem selects iguais em sequência no console.",
                },
            ],
            questions: [
                {
                    statement: "Qual o padrão de carregamento de um `@ManyToOne`?",
                    difficulty: "dificil",
                    options: [
                        { text: "EAGER, e por isso deve ser trocado", isCorrect: true },
                        { text: "LAZY, que é o comportamento desejado", isCorrect: false },
                        { text: "Depende da configuração do Hibernate", isCorrect: false },
                        { text: "Não há padrão, é preciso sempre declarar", isCorrect: false },
                    ],
                },
                {
                    statement: "O que caracteriza o problema N+1?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma consulta extra por item percorrido", isCorrect: true },
                        { text: "Uma consulta que devolve linhas repetidas", isCorrect: false },
                        { text: "Um relacionamento mapeado nos dois lados", isCorrect: false },
                        { text: "Uma tabela sem índice na chave estrangeira", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o N+1 costuma passar despercebido?",
                    difficulty: "dificil",
                    options: [
                        { text: "Com poucos registros o efeito não aparece", isCorrect: true },
                        { text: "O Hibernate esconde as consultas geradas", isCorrect: false },
                        { text: "Ele só acontece em bancos PostgreSQL", isCorrect: false },
                        { text: "O erro aparece apenas no log de nível debug", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `@EntityGraph` permite?",
                    difficulty: "medio",
                    options: [
                        { text: "Carregar relações sem escrever a consulta", isCorrect: true },
                        { text: "Desenhar o modelo de entidades do projeto", isCorrect: false },
                        { text: "Validar as relações mapeadas na inicialização", isCorrect: false },
                        { text: "Gerar o schema a partir das entidades", isCorrect: false },
                    ],
                },
                {
                    statement: "Como tornar o N+1 visível em desenvolvimento?",
                    difficulty: "medio",
                    options: [
                        { text: "Ligando a exibição do SQL gerado", isCorrect: true },
                        { text: "Consultando o Actuator da aplicação", isCorrect: false },
                        { text: "Medindo o tempo de cada requisição", isCorrect: false },
                        { text: "Ativando o perfil de produção localmente", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Transações",
            blocks: [
                {
                    type: "text",
                    value: "# @Transactional\n\nA anotação define o limite de uma transação: tudo dentro dela vale junto ou nada vale. O lugar dela é o **service**, onde a operação de negócio acontece, não o repositório.",
                },
                {
                    type: "code",
                    value: "@Service\npublic class PedidoService {\n\n    @Transactional\n    public Pedido criar(CriarPedidoRequest req) {\n        var pedido = new Pedido(req.clienteId());\n        pedido.adicionarItens(req.itens());\n        estoqueService.reservar(req.itens());   // mesma transação\n        return repo.save(pedido);\n    }\n\n    @Transactional(readOnly = true)\n    public Page<Pedido> listar(Pageable p) {\n        return repo.findAll(p);\n    }\n}",
                },
                {
                    type: "text",
                    value: "`readOnly = true` em consultas não é enfeite: o Hibernate pula a checagem de alterações no fim, o que reduz trabalho e memória em listagens grandes.\n\n## Rollback só em unchecked\n\nPor padrão, o Spring desfaz a transação em `RuntimeException` e `Error`, **não** em exceção verificada. Uma `IOException` lançada no meio deixa a transação confirmar, o que quase nunca é o desejado.",
                },
                {
                    type: "code",
                    value: "// Não desfaz: IOException é verificada\n@Transactional\npublic void processar() throws IOException { }\n\n// Desfaz\n@Transactional(rollbackFor = Exception.class)\npublic void processar() throws IOException { }",
                },
                {
                    type: "text",
                    value: "## A autoinvocação que não funciona\n\nO `@Transactional` funciona por proxy: o Spring envolve o bean. Chamar um método anotado **de dentro da mesma classe** não passa pelo proxy, e a transação simplesmente não começa.\n\nEste é o bug mais comum de transação em Spring, e não dá nenhum aviso.",
                },
                {
                    type: "code",
                    value: "@Service\npublic class Servico {\n    public void externo() {\n        interno();   // NÃO abre transação: não passa pelo proxy\n    }\n\n    @Transactional\n    public void interno() { }\n}",
                },
            ],
            questions: [
                {
                    statement: "Onde o `@Transactional` deve ficar?",
                    difficulty: "medio",
                    options: [
                        { text: "No service, na operação de negócio", isCorrect: true },
                        { text: "No repository, junto do acesso ao banco", isCorrect: false },
                        { text: "No controller, no início da requisição", isCorrect: false },
                        { text: "Na entidade que será alterada", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `readOnly = true` traz de ganho?",
                    difficulty: "medio",
                    options: [
                        { text: "O Hibernate pula a checagem de alterações", isCorrect: true },
                        { text: "A consulta é executada em outra conexão", isCorrect: false },
                        {
                            text: "O resultado é guardado em cache automaticamente",
                            isCorrect: false,
                        },
                        { text: "A transação é aberta com menos privilégios", isCorrect: false },
                    ],
                },
                {
                    statement: "Em quais exceções o Spring desfaz a transação por padrão?",
                    difficulty: "dificil",
                    options: [
                        { text: "Nas não verificadas e nos erros", isCorrect: true },
                        { text: "Em todas as exceções lançadas no método", isCorrect: false },
                        { text: "Apenas nas exceções verificadas do Java", isCorrect: false },
                        { text: "Somente quando o rollback é chamado na mão", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que chamar um método transacional da mesma classe não funciona?",
                    difficulty: "dificil",
                    options: [
                        { text: "A chamada não passa pelo proxy do Spring", isCorrect: true },
                        { text: "O método precisa ser público para funcionar", isCorrect: false },
                        { text: "A transação anterior ainda está aberta", isCorrect: false },
                        { text: "O Spring proíbe transações aninhadas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece quando a autoinvocação ocorre?",
                    difficulty: "dificil",
                    options: [
                        { text: "A transação não começa, e sem nenhum aviso", isCorrect: true },
                        { text: "O Spring lança uma exceção de configuração", isCorrect: false },
                        { text: "A transação é aberta pelo método chamador", isCorrect: false },
                        { text: "O método é executado duas vezes seguidas", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Migrations com Flyway",
            blocks: [
                {
                    type: "text",
                    value: "# O schema versionado\n\nCom `ddl-auto: validate`, alguém precisa criar as tabelas. Esse alguém é uma ferramenta de **migration**: o Flyway ou o Liquibase.\n\nCada mudança vira um arquivo SQL numerado, que roda uma vez e fica registrado. O banco passa a ter histórico, e todo ambiente chega ao mesmo estado.",
                },
                {
                    type: "code",
                    value: "src/main/resources/db/migration/\n  V1__cria_tabela_produtos.sql\n  V2__cria_tabela_categorias.sql\n  V3__adiciona_slug_em_produtos.sql\n  V4__indice_em_produtos_categoria_id.sql",
                },
                {
                    type: "code",
                    value: "-- V3__adiciona_slug_em_produtos.sql\nalter table produtos add column slug varchar(255);\nupdate produtos set slug = lower(replace(nome, ' ', '-'));\nalter table produtos alter column slug set not null;\ncreate unique index idx_produtos_slug on produtos (slug);",
                },
                {
                    type: "text",
                    value: "Repare na ordem: acrescentar a coluna aceitando nulo, preencher os registros existentes e só então exigir o valor. Criar direto como `not null` falha em qualquer tabela com dados.\n\n## Nunca edite uma migration aplicada\n\nO Flyway guarda um **checksum** de cada arquivo. Alterar um já aplicado faz a validação falhar na próxima inicialização, e a aplicação não sobe.\n\nIsso parece rigor excessivo até você lembrar que os outros ambientes já rodaram a versão antiga: a alteração nunca chegaria lá.",
                },
                {
                    type: "table",
                    value: '[["Situação", "O que fazer"], ["a migration ainda não foi aplicada", "pode editar"], ["já rodou só na sua máquina", "limpar o banco e recriar"], ["já rodou em outro ambiente", "criar uma migration nova"]]',
                },
            ],
            questions: [
                {
                    statement: "Por que uma ferramenta de migration é necessária com `validate`?",
                    difficulty: "medio",
                    options: [
                        { text: "Alguém precisa criar e alterar o schema", isCorrect: true },
                        { text: "O Hibernate não consegue validar sem ela", isCorrect: false },
                        { text: "As entidades exigem um arquivo de mapeamento", isCorrect: false },
                        { text: "O Spring Boot não sobe sem migrations", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao editar uma migration já aplicada?",
                    difficulty: "dificil",
                    options: [
                        { text: "O checksum muda e a validação falha", isCorrect: true },
                        { text: "A migration roda de novo com o conteúdo novo", isCorrect: false },
                        { text: "O Flyway ignora a alteração em silêncio", isCorrect: false },
                        { text: "O banco é recriado do zero na inicialização", isCorrect: false },
                    ],
                },
                {
                    statement: "Como acrescentar uma coluna obrigatória em tabela com dados?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Criar aceitando nulo, preencher e depois exigir",
                            isCorrect: true,
                        },
                        {
                            text: "Criar direto como não nula, com um valor padrão",
                            isCorrect: false,
                        },
                        { text: "Apagar os dados antes de criar a coluna", isCorrect: false },
                        { text: "Criar a coluna em uma tabela nova e copiar", isCorrect: false },
                    ],
                },
                {
                    statement: "O que fazer quando a migration já rodou em outro ambiente?",
                    difficulty: "medio",
                    options: [
                        { text: "Criar uma migration nova", isCorrect: true },
                        { text: "Editar a existente e avisar a equipe", isCorrect: false },
                        { text: "Apagar o registro dela na tabela de histórico", isCorrect: false },
                        { text: "Rodar o comando de reparo do Flyway", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o número no nome do arquivo define?",
                    difficulty: "facil",
                    options: [
                        { text: "A ordem em que as migrations rodam", isCorrect: true },
                        { text: "A versão da aplicação naquele momento", isCorrect: false },
                        { text: "A quantidade de comandos dentro do arquivo", isCorrect: false },
                        { text: "O ambiente em que ela deve ser aplicada", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Segurança",
    aulas: [
        {
            titulo: "Spring Security e a cadeia de filtros",
            blocks: [
                {
                    type: "text",
                    value: "# Como o Security funciona\n\nO Spring Security se instala como uma **cadeia de filtros** antes de qualquer controller. Cada filtro tem uma responsabilidade: extrair credenciais, autenticar, verificar autorização, tratar erro.\n\nEntender que é uma cadeia explica por que um erro de segurança nunca chega ao seu código: ele acontece antes.",
                },
                {
                    type: "code",
                    value: '@Configuration\n@EnableWebSecurity\npublic class SecurityConfig {\n\n    @Bean\n    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {\n        return http\n            .csrf(csrf -> csrf.disable())            // API stateless\n            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))\n            .authorizeHttpRequests(auth -> auth\n                .requestMatchers("/api/publico/**").permitAll()\n                .requestMatchers(HttpMethod.GET, "/api/produtos/**").permitAll()\n                .requestMatchers("/api/admin/**").hasRole("ADMIN")\n                .anyRequest().authenticated()\n            )\n            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)\n            .build();\n    }\n}',
                },
                {
                    type: "text",
                    value: "## A ordem das regras importa\n\nAs regras são avaliadas **de cima para baixo**, e a primeira que casa vence. Pôr `anyRequest().authenticated()` antes das específicas faz com que nenhuma delas seja alcançada.\n\n## Desabilitar CSRF exige entender o porquê\n\nCSRF protege contra outro site fazer a requisição usando o **cookie** da vítima. Em API que autentica por token no cabeçalho o ataque não se aplica, porque o navegador não envia o cabeçalho sozinho.\n\nEm aplicação que usa sessão e cookie, desabilitar CSRF é abrir uma porta de verdade.",
                },
                {
                    type: "table",
                    value: '[["Método", "Verifica"], ["permitAll", "libera para qualquer um"], ["authenticated", "exige estar autenticado"], ["hasRole", "exige um papel específico"], ["hasAuthority", "exige uma permissão"], ["denyAll", "bloqueia sempre"]]',
                },
            ],
            questions: [
                {
                    statement: "Como o Spring Security se instala na aplicação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Como uma cadeia de filtros antes dos controllers",
                            isCorrect: true,
                        },
                        {
                            text: "Como uma anotação em cada um dos métodos protegidos",
                            isCorrect: false,
                        },
                        { text: "Como um interceptador depois do controller", isCorrect: false },
                        { text: "Como um proxy em volta de cada service", isCorrect: false },
                    ],
                },
                {
                    statement: "Em que ordem as regras de autorização são avaliadas?",
                    difficulty: "medio",
                    options: [
                        { text: "De cima para baixo, a primeira que casa vence", isCorrect: true },
                        { text: "Da mais específica para a mais genérica", isCorrect: false },
                        { text: "Em ordem alfabética dos caminhos declarados", isCorrect: false },
                        { text: "Todas são avaliadas e a mais restritiva vence", isCorrect: false },
                    ],
                },
                {
                    statement: "Contra o que o CSRF protege?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Outro site usar o cookie da vítima na requisição",
                            isCorrect: true,
                        },
                        {
                            text: "Scripts maliciosos injetados na própria página",
                            isCorrect: false,
                        },
                        {
                            text: "Interceptação do tráfego entre cliente e servidor",
                            isCorrect: false,
                        },
                        { text: "Tentativas repetidas de adivinhar a senha", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando desabilitar CSRF é aceitável?",
                    difficulty: "dificil",
                    options: [
                        { text: "Em API que autentica por token no cabeçalho", isCorrect: true },
                        { text: "Em qualquer API que devolva JSON ao cliente", isCorrect: false },
                        { text: "Quando a aplicação usa HTTPS em produção", isCorrect: false },
                        { text: "Sempre, o CSRF é uma proteção obsoleta", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao pôr `anyRequest().authenticated()` primeiro?",
                    difficulty: "dificil",
                    options: [
                        { text: "As regras seguintes nunca são alcançadas", isCorrect: true },
                        { text: "Todas as regras passam a exigir autenticação", isCorrect: false },
                        { text: "O Spring reordena as regras automaticamente", isCorrect: false },
                        { text: "A configuração falha ao iniciar a aplicação", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Autenticação e senhas",
            blocks: [
                {
                    type: "text",
                    value: "# Quem é o usuário\n\nO Security precisa de duas peças: um `UserDetailsService` que sabe carregar o usuário e um `PasswordEncoder` que sabe verificar a senha.",
                },
                {
                    type: "code",
                    value: '@Service\npublic class UsuarioDetailsService implements UserDetailsService {\n\n    private final UsuarioRepository repo;\n\n    @Override\n    public UserDetails loadUserByUsername(String email) {\n        return repo.findByEmail(email)\n            .orElseThrow(() -> new UsernameNotFoundException("não encontrado"));\n    }\n}\n\n@Bean\nPasswordEncoder passwordEncoder() {\n    return new BCryptPasswordEncoder();\n}',
                },
                {
                    type: "text",
                    value: "## Senha nunca é guardada\n\nO que vai para o banco é o **hash**, gerado por um algoritmo lento de propósito. Bcrypt e Argon2 são os recomendados; MD5 e SHA são rápidos demais e por isso inadequados para senha.\n\nO `BCryptPasswordEncoder` já inclui o **salt** no resultado, então duas pessoas com a mesma senha têm hashes diferentes.",
                },
                {
                    type: "code",
                    value: "// Ao cadastrar\nusuario.setSenha(encoder.encode(senhaDigitada));\n\n// Ao autenticar: nunca compare hashes diretamente\nif (encoder.matches(senhaDigitada, usuario.getSenha())) { }",
                },
                {
                    type: "quote",
                    value: "Diga apenas email ou senha incorretos. Dizer qual dos dois falhou entrega ao atacante a lista de emails cadastrados.",
                },
                {
                    type: "text",
                    value: "## Delegação\n\nO `DelegatingPasswordEncoder`, que é o padrão do Spring Security, grava o algoritmo junto do hash, no formato `{bcrypt}$2a$...`. Isso permite migrar de algoritmo sem invalidar as senhas antigas: as novas usam o algoritmo novo e as antigas continuam sendo verificadas pelo anterior.",
                },
            ],
            questions: [
                {
                    statement: "O que o `UserDetailsService` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Carrega o usuário para o Security", isCorrect: true },
                        { text: "Verifica se a senha informada está correta", isCorrect: false },
                        { text: "Gera o token usado nas próximas requisições", isCorrect: false },
                        { text: "Define quais permissões cada papel tem", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que MD5 e SHA são inadequados para senha?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Eles são rápidos demais, o que facilita a força bruta",
                            isCorrect: true,
                        },
                        {
                            text: "Eles não aceitam senhas que tenham caracteres especiais",
                            isCorrect: false,
                        },
                        { text: "Eles produzem hashes de tamanho variável", isCorrect: false },
                        { text: "Eles foram removidos das bibliotecas do Java", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o BCrypt inclui no resultado além do hash?",
                    difficulty: "medio",
                    options: [
                        { text: "O salt", isCorrect: true },
                        { text: "A data em que a senha foi criada", isCorrect: false },
                        { text: "O identificador do usuário dono da senha", isCorrect: false },
                        { text: "A quantidade de tentativas já realizadas", isCorrect: false },
                    ],
                },
                {
                    statement: "Como verificar se a senha digitada está correta?",
                    difficulty: "medio",
                    options: [
                        { text: "Com o método matches do encoder", isCorrect: true },
                        { text: "Comparando o hash gerado com o do banco", isCorrect: false },
                        { text: "Descriptografando o hash guardado no banco", isCorrect: false },
                        { text: "Consultando o banco pela senha informada", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve gravar o algoritmo junto do hash?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Permitir migrar de algoritmo sem invalidar as senhas",
                            isCorrect: true,
                        },
                        {
                            text: "Acelerar a verificação da senha durante a autenticação",
                            isCorrect: false,
                        },
                        {
                            text: "Impedir que o hash seja usado em outro sistema",
                            isCorrect: false,
                        },
                        { text: "Identificar qual versão da aplicação o gerou", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "JWT e autenticação stateless",
            blocks: [
                {
                    type: "text",
                    value: "# Sessão contra token\n\nEm autenticação com **sessão**, o servidor guarda o estado e o cliente carrega apenas um identificador. Em autenticação com **token**, o próprio token carrega a informação e o servidor não guarda nada.\n\nA segunda escala melhor horizontalmente, porque qualquer instância valida o token sem consultar um repositório compartilhado.",
                },
                {
                    type: "code",
                    value: 'public String gerar(Usuario u) {\n    return JWT.create()\n        .withIssuer("loja")\n        .withSubject(u.getEmail())\n        .withClaim("papel", u.getPapel().name())\n        .withExpiresAt(Instant.now().plus(2, ChronoUnit.HOURS))\n        .sign(Algorithm.HMAC256(segredo));\n}',
                },
                {
                    type: "text",
                    value: "## O que um JWT é, e o que não é\n\nUm JWT é **assinado**, não criptografado. Qualquer pessoa lê o conteúdo dele: basta decodificar a base64. A assinatura garante que ninguém **alterou** o conteúdo, não que ninguém o leu.\n\nA consequência é direta: **nunca coloque dado sensível em um JWT**. Nada de CPF, telefone ou qualquer coisa que não possa ser pública.",
                },
                {
                    type: "table",
                    value: '[["", "Sessão", "JWT"], ["Estado no servidor", "sim", "não"], ["Escala horizontal", "exige repositório compartilhado", "direto"], ["Revogar acesso", "imediato", "difícil"], ["Tamanho no tráfego", "pequeno", "maior"]]',
                },
                {
                    type: "text",
                    value: "## O problema da revogação\n\nComo o servidor não guarda estado, **não há como invalidar um token** antes de ele expirar. Alguém que teve o acesso removido continua entrando até o token vencer.\n\nAs saídas usuais: expiração curta com um refresh token de vida longa, ou uma lista de tokens revogados, que reintroduz o estado que se queria evitar. Não existe solução limpa, e essa é a troca real do modelo stateless.",
                },
            ],
            questions: [
                {
                    statement: "Um JWT é criptografado?",
                    difficulty: "dificil",
                    options: [
                        { text: "Não, ele é apenas assinado", isCorrect: true },
                        { text: "Sim, o conteúdo dele é ilegível sem a chave", isCorrect: false },
                        { text: "Sim, quando o algoritmo escolhido é o HMAC", isCorrect: false },
                        { text: "Depende de a aplicação usar HTTPS ou não", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a assinatura de um JWT garante?",
                    difficulty: "medio",
                    options: [
                        { text: "Que o conteúdo não foi alterado", isCorrect: true },
                        { text: "Que apenas o servidor consegue lê-lo", isCorrect: false },
                        { text: "Que ele não pode ser usado duas vezes", isCorrect: false },
                        { text: "Que ele expira no prazo configurado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que nunca deve ir dentro de um JWT?",
                    difficulty: "medio",
                    options: [
                        { text: "Dado sensível, que não possa ser público", isCorrect: true },
                        {
                            text: "O identificador do usuário que foi autenticado",
                            isCorrect: false,
                        },
                        { text: "A data de expiração do próprio token", isCorrect: false },
                        { text: "O papel que o usuário tem no sistema", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a principal desvantagem do modelo stateless?",
                    difficulty: "dificil",
                    options: [
                        { text: "Não há como revogar o token antes de expirar", isCorrect: true },
                        {
                            text: "O servidor precisa validar em um banco central",
                            isCorrect: false,
                        },
                        { text: "O token só funciona em uma instância por vez", isCorrect: false },
                        {
                            text: "A autenticação fica bem mais lenta por requisição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a saída usual para o problema da revogação?",
                    difficulty: "medio",
                    options: [
                        { text: "Expiração curta com um refresh token", isCorrect: true },
                        { text: "Guardar a sessão do usuário no servidor", isCorrect: false },
                        { text: "Trocar a chave de assinatura periodicamente", isCorrect: false },
                        { text: "Exigir nova autenticação a cada requisição", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Autorização",
            blocks: [
                {
                    type: "text",
                    value: "# Quem pode fazer o quê\n\nA autorização por caminho, na cadeia de filtros, resolve o grosso. Para regras que dependem do dado, a anotação em cima do método é mais precisa.",
                },
                {
                    type: "code",
                    value: '@EnableMethodSecurity\n@Configuration\npublic class MethodSecurityConfig { }\n\n@Service\npublic class PedidoService {\n\n    @PreAuthorize("hasRole(\'ADMIN\')")\n    public void cancelar(Long id) { }\n\n    @PreAuthorize("hasRole(\'ADMIN\') or #email == authentication.name")\n    public Usuario buscarPorEmail(String email) { }\n\n    @PostAuthorize("returnObject.clienteId == authentication.principal.id")\n    public Pedido buscar(Long id) { }\n}',
                },
                {
                    type: "text",
                    value: 'O `@PreAuthorize` roda **antes** do método e evita o trabalho. O `@PostAuthorize` roda depois, quando a decisão depende do que foi devolvido, e por isso o método executa mesmo quando o acesso será negado.\n\n## Role e authority\n\nUm **role** é uma authority com o prefixo `ROLE_`. `hasRole("ADMIN")` procura por `ROLE_ADMIN`, enquanto `hasAuthority("ADMIN")` procura por `ADMIN` exato. Misturar os dois é a causa mais comum de um 403 inexplicável.',
                },
                {
                    type: "text",
                    value: "## A forma mais segura de todas\n\nMelhor que verificar a permissão é **escopar a consulta** pelo usuário. Assim o registro de outra pessoa nem aparece, e não há verificação para esquecer.",
                },
                {
                    type: "code",
                    value: "// Frágil: depende de lembrar da verificação\nPedido p = repo.findById(id).orElseThrow();\nif (!p.getClienteId().equals(usuarioAtual.getId())) throw new AcessoNegado();\n\n// Sólido: o pedido de outra pessoa não existe nesta consulta\nPedido p = repo.findByIdAndClienteId(id, usuarioAtual.getId()).orElseThrow();",
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença entre `@PreAuthorize` e `@PostAuthorize`?",
                    difficulty: "medio",
                    options: [
                        { text: "Um roda antes e o outro depois do método", isCorrect: true },
                        {
                            text: "Um vale para controllers e o outro para services",
                            isCorrect: false,
                        },
                        {
                            text: "Um verifica papel e o outro verifica permissão",
                            isCorrect: false,
                        },
                        { text: "Um lança exceção e o outro devolve nulo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a desvantagem do `@PostAuthorize`?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O método executa mesmo quando o acesso será negado",
                            isCorrect: true,
                        },
                        {
                            text: "Ele não consegue acessar o usuário que foi autenticado",
                            isCorrect: false,
                        },
                        { text: "Ele só funciona em métodos que devolvem lista", isCorrect: false },
                        { text: "Ele exige que a exceção seja tratada na mão", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `hasRole('ADMIN')` procura de fato?",
                    difficulty: "dificil",
                    options: [
                        { text: "A authority ROLE_ADMIN", isCorrect: true },
                        { text: "A authority ADMIN, exatamente como escrita", isCorrect: false },
                        {
                            text: "Qualquer authority que contenha a palavra ADMIN",
                            isCorrect: false,
                        },
                        {
                            text: "Um papel declarado na configuração do Security",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a forma mais segura de proteger o acesso a um registro?",
                    difficulty: "dificil",
                    options: [
                        { text: "Escopar a consulta pelo usuário atual", isCorrect: true },
                        { text: "Verificar o dono depois de buscar o registro", isCorrect: false },
                        { text: "Anotar o método com PreAuthorize e o papel", isCorrect: false },
                        { text: "Filtrar a lista devolvida antes de responder", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `@EnableMethodSecurity` habilita?",
                    difficulty: "medio",
                    options: [
                        { text: "As anotações de autorização nos métodos", isCorrect: true },
                        { text: "A cadeia de filtros de segurança do Spring", isCorrect: false },
                        { text: "A criptografia das senhas gravadas no banco", isCorrect: false },
                        { text: "A autenticação por token nas requisições", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "CORS, segredos e cuidados de produção",
            blocks: [
                {
                    type: "text",
                    value: "# CORS\n\nO navegador bloqueia requisições de um site para uma origem diferente, a menos que o servidor autorize. Esse é o **CORS**, e ele é uma proteção **do navegador**, não do servidor: um cliente que não seja navegador ignora tudo isso.",
                },
                {
                    type: "code",
                    value: '@Bean\nCorsConfigurationSource corsConfigurationSource() {\n    var config = new CorsConfiguration();\n    config.setAllowedOrigins(List.of("https://loja.com.br"));\n    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));\n    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));\n    config.setAllowCredentials(true);\n\n    var source = new UrlBasedCorsConfigurationSource();\n    source.registerCorsConfiguration("/api/**", config);\n    return source;\n}',
                },
                {
                    type: "text",
                    value: "Liberar `*` em produção anula a proteção, e a combinação de `*` com `allowCredentials` nem é aceita pela especificação.\n\n## Segredos\n\nSenha de banco e chave de assinatura **nunca** vão para o repositório. Elas entram por variável de ambiente ou por um gerenciador de segredos, e o `application.yml` referencia a variável.",
                },
                {
                    type: "code",
                    value: "spring:\n  datasource:\n    password: ${DB_PASSWORD}\napp:\n  jwt:\n    segredo: ${JWT_SECRET}",
                },
                {
                    type: "text",
                    value: "## A lista do que conferir antes de subir\n\n- Segredos fora do repositório, vindos do ambiente\n- HTTPS obrigatório, sem exceção\n- CORS restrito às origens que existem\n- Senhas com bcrypt ou argon2\n- Limite de tentativas de login\n- Log sem senha, token ou dado pessoal\n- Dependências verificadas contra vulnerabilidades conhecidas",
                },
            ],
            questions: [
                {
                    statement: "O CORS é uma proteção de quem?",
                    difficulty: "dificil",
                    options: [
                        { text: "Do navegador", isCorrect: true },
                        { text: "Do servidor, que recusa as requisições", isCorrect: false },
                        { text: "Do protocolo HTTP em si, na especificação", isCorrect: false },
                        { text: "Do Spring Security, na cadeia de filtros", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com um cliente que não é navegador?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele ignora o CORS por completo", isCorrect: true },
                        { text: "Ele é bloqueado pelo servidor da aplicação", isCorrect: false },
                        { text: "Ele precisa enviar a origem no cabeçalho", isCorrect: false },
                        { text: "Ele recebe um erro de origem não permitida", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o problema de liberar `*` nas origens?",
                    difficulty: "medio",
                    options: [
                        { text: "A proteção deixa de existir", isCorrect: true },
                        { text: "O navegador passa a exigir HTTPS na chamada", isCorrect: false },
                        { text: "As requisições ficam bem mais lentas", isCorrect: false },
                        { text: "O Spring recusa a configuração ao iniciar", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde a senha do banco deve ficar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Em variável de ambiente ou gerenciador de segredos",
                            isCorrect: true,
                        },
                        { text: "No application.yml, junto do resto", isCorrect: false },
                        {
                            text: "Em um arquivo separado, guardado fora do repositório",
                            isCorrect: false,
                        },
                        { text: "Criptografada dentro do próprio código", isCorrect: false },
                    ],
                },
                {
                    statement: "O que nunca deve aparecer no log?",
                    difficulty: "medio",
                    options: [
                        { text: "Senha, token ou dado pessoal", isCorrect: true },
                        { text: "O identificador da requisição atendida", isCorrect: false },
                        { text: "O tempo que a requisição levou para responder", isCorrect: false },
                        { text: "O caminho que foi chamado pelo cliente", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Testes",
    aulas: [
        {
            titulo: "JUnit e Mockito",
            blocks: [
                {
                    type: "text",
                    value: "# O teste mais barato\n\nO teste de unidade não sobe o Spring: ele instancia a classe direto e entrega dublês no lugar das dependências. Roda em milissegundos, e é onde a regra de negócio deve ser coberta.\n\nÉ aqui que a injeção **por construtor** se paga: sem ela, não há como instanciar a classe fora do framework.",
                },
                {
                    type: "code",
                    value: "@ExtendWith(MockitoExtension.class)\nclass PedidoServiceTest {\n\n    @Mock PedidoRepository repo;\n    @Mock EstoqueService estoque;\n    @InjectMocks PedidoService service;\n\n    @Test\n    void naoCriaPedidoSemEstoque() {\n        when(estoque.disponivel(1L, 5)).thenReturn(false);\n\n        assertThatThrownBy(() -> service.criar(new CriarPedido(1L, 5)))\n            .isInstanceOf(EstoqueInsuficiente.class);\n\n        verify(repo, never()).save(any());\n    }\n}",
                },
                {
                    type: "table",
                    value: '[["Anotação", "O que faz"], ["@Mock", "cria um dublê da dependência"], ["@InjectMocks", "injeta os dublês na classe testada"], ["when e thenReturn", "define o que o dublê responde"], ["verify", "confere se o método foi chamado"]]',
                },
                {
                    type: "text",
                    value: "## Verificar demais engessa o teste\n\n`verify` em toda interação transforma o teste em uma cópia da implementação: qualquer refatoração o quebra, mesmo sem nada ter parado de funcionar.\n\nA regra que funciona: verifique **efeito colateral que importa**, como o `never()` acima garantindo que nada foi gravado. Para o resto, afirme o **resultado**.",
                },
                {
                    type: "quote",
                    value: "Teste que quebra a cada refatoração sem que nada tenha parado de funcionar não protege nada, e a equipe aprende a apagá-lo.",
                },
            ],
            questions: [
                {
                    statement: "O que um teste de unidade não faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Não sobe o contexto do Spring", isCorrect: true },
                        { text: "Não instancia a classe que está sendo testada", isCorrect: false },
                        { text: "Não verifica se os métodos foram chamados", isCorrect: false },
                        { text: "Não usa dublês no lugar das dependências", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `@InjectMocks` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Injeta os dublês na classe testada", isCorrect: true },
                        { text: "Cria um dublê da classe que será testada", isCorrect: false },
                        { text: "Registra a classe no contexto do Spring", isCorrect: false },
                        { text: "Substitui a classe real por uma implementação", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a injeção por construtor ajuda no teste?",
                    difficulty: "dificil",
                    options: [
                        { text: "Permite instanciar a classe fora do framework", isCorrect: true },
                        { text: "Faz o Mockito criar os dublês sozinho", isCorrect: false },
                        { text: "Torna as dependências opcionais no teste", isCorrect: false },
                        {
                            text: "Permite trocar a implementação durante a execução",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o problema de usar `verify` em toda interação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O teste vira cópia da implementação e quebra em refatoração",
                            isCorrect: true,
                        },
                        {
                            text: "Os testes acabam passando a rodar muito mais devagar do que antes",
                            isCorrect: false,
                        },
                        { text: "O Mockito recusa mais de uma verificação", isCorrect: false },
                        { text: "As dependências deixam de ser injetadas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que vale verificar com `verify`?",
                    difficulty: "medio",
                    options: [
                        { text: "Efeito colateral que importa, como não gravar", isCorrect: true },
                        { text: "Toda e qualquer chamada feita às dependências", isCorrect: false },
                        { text: "O valor devolvido pelo método testado", isCorrect: false },
                        { text: "A ordem em que os métodos foram chamados", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Fatias de teste e o contexto completo",
            blocks: [
                {
                    type: "text",
                    value: "# Nem todo teste precisa de tudo\n\nSubir o contexto inteiro para testar um controller é caro: banco, segurança, filas, tudo. As **fatias de teste** sobem apenas a parte relevante.",
                },
                {
                    type: "table",
                    value: '[["Anotação", "O que sobe"], ["@WebMvcTest", "só a camada web"], ["@DataJpaTest", "só JPA e o banco"], ["@JsonTest", "só a serialização"], ["@RestClientTest", "só os clientes HTTP"], ["@SpringBootTest", "a aplicação inteira"]]',
                },
                {
                    type: "code",
                    value: '@WebMvcTest(ProdutoController.class)\nclass ProdutoControllerTest {\n\n    @Autowired MockMvc mvc;\n    @MockitoBean ProdutoService service;   // o service é dublê\n\n    @Test\n    void devolve404QuandoNaoExiste() throws Exception {\n        when(service.buscar(99L)).thenThrow(new RecursoNaoEncontrado("produto"));\n\n        mvc.perform(get("/api/produtos/99"))\n           .andExpect(status().isNotFound())\n           .andExpect(jsonPath("$.title").value("Recurso não encontrado"));\n    }\n}',
                },
                {
                    type: "text",
                    value: "O `@MockitoBean` substitui o bean real no contexto por um dublê. Ele veio no lugar do antigo `@MockBean`, que foi descontinuado.\n\n## O cache de contexto\n\nO Spring **reaproveita** o contexto entre classes de teste com a mesma configuração. Isso é o que mantém uma suíte grande viável.\n\nO efeito colateral: cada combinação diferente de configuração cria um contexto novo, e uma suíte com muitas variações passa mais tempo subindo contexto do que testando. Padronizar a configuração dos testes é uma otimização real.",
                },
                {
                    type: "code",
                    value: '@SpringBootTest\n@AutoConfigureMockMvc\n@ActiveProfiles("test")\nclass FluxoCompletoTest {\n    // sobe tudo: use para o caminho principal, não para cada caso\n}',
                },
            ],
            questions: [
                {
                    statement: "O que `@WebMvcTest` sobe?",
                    difficulty: "medio",
                    options: [
                        { text: "Apenas a camada web", isCorrect: true },
                        { text: "A aplicação inteira, com banco e segurança", isCorrect: false },
                        { text: "A camada web e a de acesso a dados", isCorrect: false },
                        { text: "Somente as classes anotadas no projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `@MockitoBean` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Substitui o bean real no contexto por um dublê", isCorrect: true },
                        { text: "Cria um dublê fora do contexto do Spring", isCorrect: false },
                        { text: "Registra um bean novo apenas para o teste", isCorrect: false },
                        {
                            text: "Verifica se o bean real foi injetado corretamente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o Spring reaproveita o contexto entre testes?",
                    difficulty: "medio",
                    options: [
                        { text: "Subir o contexto é caro e lento", isCorrect: true },
                        {
                            text: "Para que os testes compartilhem o mesmo estado",
                            isCorrect: false,
                        },
                        { text: "Porque cada contexto ocupa muita memória", isCorrect: false },
                        {
                            text: "Para garantir que a ordem dos testes não importe",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que faz o Spring criar um contexto novo?",
                    difficulty: "dificil",
                    options: [
                        { text: "Uma combinação diferente de configuração", isCorrect: true },
                        { text: "Cada classe de teste, sempre, sem exceção", isCorrect: false },
                        { text: "A presença de qualquer dublê no teste", isCorrect: false },
                        { text: "O uso de um perfil ativo na classe", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando usar `@SpringBootTest`?",
                    difficulty: "medio",
                    options: [
                        { text: "No caminho principal, não em cada caso", isCorrect: true },
                        { text: "Em todos os testes, para garantir realismo", isCorrect: false },
                        { text: "Apenas quando o teste envolve o banco", isCorrect: false },
                        { text: "Somente nos testes de unidade de service", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Testcontainers",
            blocks: [
                {
                    type: "text",
                    value: "# Testar contra o banco de verdade\n\nBanco em memória como o H2 é rápido e mente: ele não tem os tipos, as funções nem o comportamento do PostgreSQL. Um teste que passa nele pode falhar em produção por diferença de dialeto.\n\nO **Testcontainers** sobe um container real do banco durante o teste, e o descarta no fim.",
                },
                {
                    type: "code",
                    value: '@SpringBootTest\n@Testcontainers\nclass ProdutoRepositoryIT {\n\n    @Container\n    @ServiceConnection\n    static PostgreSQLContainer<?> postgres =\n        new PostgreSQLContainer<>("postgres:17-alpine");\n\n    @Autowired ProdutoRepository repo;\n\n    @Test\n    void buscaPorSlug() {\n        repo.save(new Produto("Caneca", "caneca", new BigDecimal("29.90")));\n        assertThat(repo.findBySlug("caneca")).isPresent();\n    }\n}',
                },
                {
                    type: "text",
                    value: "O `@ServiceConnection` é o que torna isso prático: ele configura a URL, o usuário e a senha da aplicação apontando para o container, sem nenhuma propriedade escrita à mão.\n\n## Além do banco\n\nO mesmo vale para Redis, Kafka, RabbitMQ e qualquer coisa que rode em container. O teste passa a exercitar a integração de verdade, e não uma imitação.",
                },
                {
                    type: "table",
                    value: '[["", "Banco em memória", "Testcontainers"], ["Fidelidade", "baixa", "é o banco real"], ["Velocidade", "muito rápido", "segundos para subir"], ["Precisa de Docker", "não", "sim"], ["Pega erro de dialeto", "não", "sim"]]',
                },
                {
                    type: "text",
                    value: "## O custo\n\nSubir container leva segundos, então não é para cada teste. O uso comum é: unidade para regra de negócio, fatia para a camada web, e Testcontainers para o que realmente toca o banco, marcados como teste de integração e rodados junto na CI.",
                },
            ],
            questions: [
                {
                    statement: "Qual o problema de testar com banco em memória?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele não reproduz o comportamento do banco real", isCorrect: true },
                        { text: "Ele é lento para subir a cada execução", isCorrect: false },
                        {
                            text: "Ele não aceita as migrations escritas para o projeto",
                            isCorrect: false,
                        },
                        { text: "Ele exige Docker instalado na máquina", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Testcontainers faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Sobe um container real durante o teste", isCorrect: true },
                        { text: "Simula o banco de dados em memória", isCorrect: false },
                        { text: "Conecta no banco usado em desenvolvimento", isCorrect: false },
                        { text: "Gera dados de teste para as tabelas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `@ServiceConnection` resolve?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Aponta a aplicação para o container sem configuração",
                            isCorrect: true,
                        },
                        { text: "Garante que o container suba antes do teste", isCorrect: false },
                        {
                            text: "Reaproveita o mesmo container entre todas as classes",
                            isCorrect: false,
                        },
                        { text: "Verifica se o serviço respondeu corretamente", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o custo do Testcontainers?",
                    difficulty: "medio",
                    options: [
                        { text: "Subir o container leva segundos", isCorrect: true },
                        { text: "Ele não funciona em ambiente de integração", isCorrect: false },
                        { text: "Ele exige uma licença para uso comercial", isCorrect: false },
                        { text: "Ele só funciona com bancos relacionais", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde o Testcontainers se encaixa na pirâmide de testes?",
                    difficulty: "medio",
                    options: [
                        { text: "No que realmente toca o banco", isCorrect: true },
                        { text: "Em todos os testes, por ser mais realista", isCorrect: false },
                        { text: "Apenas nos testes da camada web", isCorrect: false },
                        { text: "Nos testes de unidade dos services", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Testes de API",
            blocks: [
                {
                    type: "text",
                    value: "# Exercitando o endpoint\n\nO `MockMvc` chama o controller passando por toda a pilha web, incluindo conversão de JSON, validação e tratamento de erro, sem abrir uma porta de rede.",
                },
                {
                    type: "code",
                    value: '@Test\nvoid criaProdutoValido() throws Exception {\n    mvc.perform(post("/api/produtos")\n            .contentType(APPLICATION_JSON)\n            .content("""\n                { "nome": "Caneca", "preco": 29.90, "categoriaId": 1 }\n                """))\n       .andExpect(status().isCreated())\n       .andExpect(jsonPath("$.nome").value("Caneca"));\n}\n\n@Test\nvoid recusaPrecoNegativo() throws Exception {\n    mvc.perform(post("/api/produtos")\n            .contentType(APPLICATION_JSON)\n            .content("""\n                { "nome": "Caneca", "preco": -1, "categoriaId": 1 }\n                """))\n       .andExpect(status().isBadRequest())\n       .andExpect(jsonPath("$.campos.preco").exists());\n}',
                },
                {
                    type: "text",
                    value: "## Testando com segurança ligada\n\nCom Spring Security no classpath, todo endpoint passa a exigir autenticação, e testes que passavam começam a devolver 401. As anotações do módulo de teste resolvem isso sem desligar a segurança, o que seria testar outra aplicação.",
                },
                {
                    type: "code",
                    value: '@Test\n@WithMockUser(roles = "ADMIN")\nvoid adminPodeExcluir() throws Exception {\n    mvc.perform(delete("/api/produtos/1"))\n       .andExpect(status().isNoContent());\n}\n\n@Test\n@WithMockUser(roles = "CLIENTE")\nvoid clienteNaoPodeExcluir() throws Exception {\n    mvc.perform(delete("/api/produtos/1"))\n       .andExpect(status().isForbidden());\n}',
                },
                {
                    type: "text",
                    value: "O segundo teste é o mais importante dos dois: testar que **quem não pode não consegue** é o que realmente protege. É comum uma suíte cobrir só o caminho autorizado e deixar o buraco passar.",
                },
                {
                    type: "quote",
                    value: "Para cada permissão, escreva dois testes: um que confirma o acesso de quem pode, e um que confirma a negação de quem não pode.",
                },
            ],
            questions: [
                {
                    statement: "O que o `MockMvc` exercita?",
                    difficulty: "medio",
                    options: [
                        { text: "Toda a pilha web, sem abrir porta de rede", isCorrect: true },
                        { text: "Apenas o método do controller, isoladamente", isCorrect: false },
                        { text: "A aplicação inteira, com banco e filas", isCorrect: false },
                        { text: "A serialização do JSON de resposta apenas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com os testes quando o Security entra no projeto?",
                    difficulty: "medio",
                    options: [
                        { text: "Os endpoints passam a exigir autenticação", isCorrect: true },
                        { text: "Os testes deixam de compilar sem alteração", isCorrect: false },
                        { text: "As fatias de teste deixam de funcionar", isCorrect: false },
                        { text: "As requisições passam a exigir HTTPS", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `@WithMockUser` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Executa o teste como um usuário autenticado", isCorrect: true },
                        {
                            text: "Desliga a segurança durante a execução daquele teste",
                            isCorrect: false,
                        },
                        { text: "Cria um usuário real no banco de teste", isCorrect: false },
                        { text: "Gera um token válido para a requisição", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual teste de permissão é mais importante?",
                    difficulty: "dificil",
                    options: [
                        { text: "O que confirma que quem não pode é bloqueado", isCorrect: true },
                        { text: "O que confirma que quem pode consegue acessar", isCorrect: false },
                        { text: "O que verifica o código HTTP da resposta", isCorrect: false },
                        {
                            text: "O que testa o caminho sem autenticação nenhuma",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que não desligar a segurança nos testes?",
                    difficulty: "dificil",
                    options: [
                        { text: "Seria testar uma aplicação diferente da real", isCorrect: true },
                        { text: "O Spring não permite desligá-la em teste", isCorrect: false },
                        { text: "Os testes ficariam mais lentos ao rodar", isCorrect: false },
                        { text: "As anotações de teste deixariam de funcionar", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "O que testar",
            blocks: [
                {
                    type: "text",
                    value: "# Cobertura não é o objetivo\n\nCem por cento de cobertura com asserções fracas não protege nada, e é fácil de alcançar. O objetivo é que uma **mudança que quebra o comportamento** faça algum teste falhar.\n\nA pergunta útil não é *quanto está coberto*, é *o que aconteceria se eu apagasse esta linha*.",
                },
                {
                    type: "table",
                    value: '[["Camada", "Tipo de teste", "Quantidade"], ["regra de negócio", "unidade", "muitos"], ["repositório com consulta própria", "integração", "alguns"], ["endpoint", "fatia web", "alguns"], ["fluxo principal completo", "integração", "poucos"]]',
                },
                {
                    type: "text",
                    value: "## O que quase sempre vale testar\n\n- Toda regra de negócio com condição, e principalmente os **limites** dela\n- Todo caminho de erro que o sistema trata de propósito\n- Toda consulta escrita à mão, que o compilador não verifica\n- Toda permissão, nos dois sentidos\n- Todo bug corrigido, com um teste que falha antes da correção",
                },
                {
                    type: "text",
                    value: "## O que não vale\n\nGetter e setter, código gerado, e configuração do framework. Testar que o Spring injeta uma dependência é testar o Spring, não a sua aplicação.\n\nE evite testar detalhe de implementação: um teste que conhece a ordem interna das chamadas quebra na primeira melhoria do código.",
                },
                {
                    type: "quote",
                    value: "O melhor momento de escrever um teste é quando você acabou de encontrar um bug: ele documenta o caso e garante que não volta.",
                },
            ],
            questions: [
                {
                    statement: "Qual o objetivo de uma suíte de testes?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Que uma quebra de comportamento faça algum teste falhar",
                            isCorrect: true,
                        },
                        {
                            text: "Alcançar cem por cento de cobertura de todo o código do projeto",
                            isCorrect: false,
                        },
                        { text: "Executar em menos de um minuto na integração", isCorrect: false },
                        { text: "Cobrir todas as classes com ao menos um teste", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual pergunta é mais útil que a cobertura?",
                    difficulty: "dificil",
                    options: [
                        { text: "O que aconteceria se eu apagasse esta linha", isCorrect: true },
                        {
                            text: "Quantos testes já existem escritos para esta classe",
                            isCorrect: false,
                        },
                        { text: "Quanto tempo a suíte leva para rodar", isCorrect: false },
                        { text: "Quantas asserções cada teste possui", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual tipo de teste deve ser o mais numeroso?",
                    difficulty: "medio",
                    options: [
                        { text: "Os de unidade da regra de negócio", isCorrect: true },
                        { text: "Os de integração do fluxo completo", isCorrect: false },
                        { text: "Os da camada web com MockMvc", isCorrect: false },
                        { text: "Os de repositório com Testcontainers", isCorrect: false },
                    ],
                },
                {
                    statement: "O que não vale a pena testar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Getters, código gerado e configuração do framework",
                            isCorrect: true,
                        },
                        { text: "Consultas escritas à mão no repositório", isCorrect: false },
                        {
                            text: "Os caminhos de erro que já são tratados de propósito no código",
                            isCorrect: false,
                        },
                        { text: "Os limites das regras de negócio", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando é um bom momento para escrever um teste?",
                    difficulty: "medio",
                    options: [
                        { text: "Ao encontrar um bug, antes de corrigi-lo", isCorrect: true },
                        { text: "Depois de a funcionalidade estar em produção", isCorrect: false },
                        { text: "Quando a cobertura cai abaixo do limite", isCorrect: false },
                        { text: "Antes de qualquer linha de código ser escrita", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Produção",
    aulas: [
        {
            titulo: "Actuator",
            blocks: [
                {
                    type: "text",
                    value: "# A aplicação se explicando\n\nO **Actuator** expõe endpoints que respondem perguntas operacionais: a aplicação está saudável, quanto de memória está usando, quais propriedades estão valendo, quais beans existem.",
                },
                {
                    type: "code",
                    value: "management:\n  endpoints:\n    web:\n      exposure:\n        include: health,info,metrics,prometheus\n  endpoint:\n    health:\n      show-details: when-authorized\n  server:\n    port: 9090   # porta separada, não exposta ao público",
                },
                {
                    type: "table",
                    value: '[["Endpoint", "Responde"], ["/health", "a aplicação está de pé e íntegra"], ["/info", "versão e dados do build"], ["/metrics", "métricas da aplicação"], ["/prometheus", "as métricas no formato do Prometheus"], ["/env", "as propriedades em vigor"], ["/loggers", "níveis de log, alteráveis em execução"]]',
                },
                {
                    type: "text",
                    value: "## Cuidado com o que é exposto\n\nO padrão expõe apenas `/health` e `/info` pela web, e isso é proposital. `/env` e `/heapdump` revelam configuração e memória, e não podem ficar públicos em hipótese alguma.\n\nA prática comum é pôr o Actuator em uma **porta separada**, acessível só pela rede interna.",
                },
                {
                    type: "text",
                    value: "## Liveness e readiness\n\nEm Kubernetes, dois sinais diferentes importam: **liveness** diz se o processo está vivo, e **readiness** diz se ele pode receber tráfego. Confundir os dois faz o orquestrador reiniciar containers que só estavam aquecendo.",
                },
                {
                    type: "code",
                    value: "GET /actuator/health/liveness\nGET /actuator/health/readiness",
                },
            ],
            questions: [
                {
                    statement: "O que o Actuator expõe?",
                    difficulty: "facil",
                    options: [
                        { text: "Endpoints com informação operacional", isCorrect: true },
                        { text: "A documentação da API para os clientes", isCorrect: false },
                        { text: "Um painel de administração da aplicação", isCorrect: false },
                        { text: "Os logs da aplicação em tempo real", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `/env` não pode ser público?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele revela a configuração em vigor", isCorrect: true },
                        { text: "Ele consome muita memória ao ser chamado", isCorrect: false },
                        {
                            text: "Ele permite alterar as propriedades da aplicação",
                            isCorrect: false,
                        },
                        { text: "Ele expõe as rotas registradas no projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a prática comum para o Actuator em produção?",
                    difficulty: "medio",
                    options: [
                        { text: "Deixá-lo em uma porta separada e interna", isCorrect: true },
                        { text: "Expor todos os endpoints com autenticação", isCorrect: false },
                        { text: "Desligá-lo por completo no ambiente", isCorrect: false },
                        { text: "Publicá-lo em um subdomínio próprio", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre liveness e readiness?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Um diz se está vivo, o outro se pode receber tráfego",
                            isCorrect: true,
                        },
                        {
                            text: "Um deles é para o container e o outro é para a aplicação",
                            isCorrect: false,
                        },
                        {
                            text: "Um é verificado uma vez e o outro continuamente",
                            isCorrect: false,
                        },
                        { text: "Um responde HTTP e o outro apenas um código", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao confundir liveness com readiness?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O orquestrador reinicia containers que só aqueciam",
                            isCorrect: true,
                        },
                        {
                            text: "A aplicação inteira deixa de receber requisições novas",
                            isCorrect: false,
                        },
                        { text: "O container nunca é considerado saudável", isCorrect: false },
                        { text: "As métricas param de ser coletadas", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Observabilidade",
            blocks: [
                {
                    type: "text",
                    value: "# Três sinais\n\nObservabilidade se apoia em três tipos de dado, e cada um responde uma pergunta diferente:\n\n- **Métricas**: quantas requisições, quanto tempo, quantos erros\n- **Logs**: o que aconteceu em cada evento\n- **Traces**: por onde a requisição passou entre serviços",
                },
                {
                    type: "code",
                    value: '@Service\npublic class PedidoService {\n\n    private final Counter pedidosCriados;\n\n    public PedidoService(MeterRegistry registry) {\n        this.pedidosCriados = Counter.builder("pedidos.criados")\n            .description("Total de pedidos criados")\n            .register(registry);\n    }\n\n    @Observed(name = "pedido.criar")\n    public Pedido criar(CriarPedido req) {\n        pedidosCriados.increment();\n        return repo.save(new Pedido(req));\n    }\n}',
                },
                {
                    type: "text",
                    value: "## OpenTelemetry\n\nO **OpenTelemetry** é o padrão aberto para coletar esses três sinais. O ganho é não ficar preso a um fornecedor: a aplicação emite no formato padrão, e a ferramenta de destino é configuração.\n\nO Spring Boot 4.1 melhorou o suporte a ele, e a instrumentação automática cobre requisições web, chamadas de banco e clientes HTTP sem código nenhum.",
                },
                {
                    type: "text",
                    value: "## Log estruturado e correlação\n\nEm produção, log em JSON é consultável; log em texto solto exige expressão regular. E o **trace id** propagado no contexto é o que permite achar todas as linhas de uma mesma requisição, mesmo passando por vários serviços.",
                },
                {
                    type: "code",
                    value: "logging:\n  structured:\n    format:\n      console: ecs   # JSON estruturado\n\n# Cada linha sai com traceId e spanId,\n# preenchidos automaticamente pela instrumentação",
                },
            ],
            questions: [
                {
                    statement: "Quais são os três sinais da observabilidade?",
                    difficulty: "medio",
                    options: [
                        { text: "Métricas, logs e traces", isCorrect: true },
                        { text: "Erros, avisos e mensagens informativas", isCorrect: false },
                        { text: "Requisições, respostas e tempo de resposta", isCorrect: false },
                        { text: "Memória, processador e uso de disco", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um trace responde?",
                    difficulty: "medio",
                    options: [
                        { text: "Por onde a requisição passou entre serviços", isCorrect: true },
                        { text: "Quantas requisições o serviço recebeu", isCorrect: false },
                        {
                            text: "O que exatamente aconteceu em cada evento registrado",
                            isCorrect: false,
                        },
                        { text: "Quanto de memória cada serviço consumiu", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o ganho de usar OpenTelemetry?",
                    difficulty: "medio",
                    options: [
                        { text: "Não ficar preso a um fornecedor", isCorrect: true },
                        {
                            text: "Coletar os dados com menos impacto no desempenho",
                            isCorrect: false,
                        },
                        { text: "Dispensar a instrumentação manual do código", isCorrect: false },
                        { text: "Guardar os dados por mais tempo no destino", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que log em JSON é melhor em produção?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele é consultável sem expressão regular", isCorrect: true },
                        { text: "Ele ocupa menos espaço em disco que o texto", isCorrect: false },
                        { text: "Ele é gravado bem mais rápido pela aplicação", isCorrect: false },
                        { text: "Ele pode ser lido diretamente por pessoas", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o trace id nas linhas de log?",
                    difficulty: "dificil",
                    options: [
                        { text: "Achar todas as linhas de uma mesma requisição", isCorrect: true },
                        {
                            text: "Identificar qual das instâncias gerou cada linha",
                            isCorrect: false,
                        },
                        { text: "Ordenar as linhas por horário de ocorrência", isCorrect: false },
                        { text: "Marcar quais linhas são de erro no sistema", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Cache",
            blocks: [
                {
                    type: "text",
                    value: "# Guardando o que custa caro\n\nO Spring abstrai cache por anotações, e o provedor é configuração: mapa em memória, Redis, Caffeine. Trocar de provedor não muda o código.",
                },
                {
                    type: "code",
                    value: '@Service\npublic class CategoriaService {\n\n    @Cacheable("categorias")\n    public List<Categoria> listarAtivas() {\n        return repo.findByAtivoTrue();\n    }\n\n    @CacheEvict(value = "categorias", allEntries = true)\n    public Categoria salvar(Categoria c) {\n        return repo.save(c);\n    }\n\n    @Cacheable(value = "categoria", key = "#id")\n    public Categoria buscar(Long id) {\n        return repo.findById(id).orElseThrow();\n    }\n}',
                },
                {
                    type: "table",
                    value: '[["Anotação", "O que faz"], ["@Cacheable", "guarda o retorno e reaproveita"], ["@CacheEvict", "remove entradas do cache"], ["@CachePut", "atualiza sem pular o método"], ["@Caching", "combina várias das anteriores"]]',
                },
                {
                    type: "text",
                    value: "## As armadilhas\n\n**A anotação funciona por proxy.** Chamar um método `@Cacheable` de dentro da mesma classe não passa pelo proxy, e o cache não acontece. É a mesma armadilha do `@Transactional`.\n\n**Invalidar é a parte difícil.** Cache que não é limpo entrega dado velho, e é um bug que aparece longe da causa. Toda escrita que afeta o dado precisa do `@CacheEvict` correspondente.\n\n**Cachear o que muda toda hora piora.** O custo de gravar e invalidar supera o de simplesmente consultar.",
                },
                {
                    type: "quote",
                    value: "Cache é a otimização que mais cria bug estranho. Antes de cachear, meça: muitas vezes o problema é um índice faltando no banco.",
                },
            ],
            questions: [
                {
                    statement: "O que `@Cacheable` faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Guarda o retorno e reaproveita na próxima chamada",
                            isCorrect: true,
                        },
                        {
                            text: "Grava o resultado daquela chamada no banco de dados do projeto",
                            isCorrect: false,
                        },
                        { text: "Executa o método em segundo plano", isCorrect: false },
                        { text: "Repete a chamada quando ela falha", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que chamar um método cacheado da mesma classe não funciona?",
                    difficulty: "dificil",
                    options: [
                        { text: "A chamada não passa pelo proxy do Spring", isCorrect: true },
                        { text: "O cache só funciona em métodos públicos", isCorrect: false },
                        { text: "A anotação precisa estar na classe também", isCorrect: false },
                        { text: "O provedor de cache ainda não foi iniciado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a parte difícil de trabalhar com cache?",
                    difficulty: "medio",
                    options: [
                        { text: "Saber quando invalidar as entradas", isCorrect: true },
                        { text: "Escolher o provedor certo para o projeto", isCorrect: false },
                        { text: "Configurar o tempo de expiração das chaves", isCorrect: false },
                        { text: "Serializar os objetos guardados no cache", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao cachear dado que muda toda hora?",
                    difficulty: "dificil",
                    options: [
                        { text: "O custo de gravar e invalidar supera o ganho", isCorrect: true },
                        { text: "O cache passa a ocupar memória demais", isCorrect: false },
                        { text: "As entradas nunca chegam a ser reaproveitadas", isCorrect: false },
                        { text: "O provedor recusa gravar a chave repetida", isCorrect: false },
                    ],
                },
                {
                    statement: "O que checar antes de cachear uma consulta lenta?",
                    difficulty: "medio",
                    options: [
                        { text: "Se não falta um índice no banco", isCorrect: true },
                        { text: "Se o provedor de cache está configurado", isCorrect: false },
                        { text: "Se a consulta devolve muitos registros", isCorrect: false },
                        { text: "Se o método é chamado com frequência", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Assíncrono e agendamento",
            blocks: [
                {
                    type: "text",
                    value: "# Trabalho fora da requisição\n\nEnviar email dentro da requisição faz o usuário esperar por algo que não precisa acontecer agora. O `@Async` devolve a resposta e continua o trabalho em outra thread.",
                },
                {
                    type: "code",
                    value: '@Configuration\n@EnableAsync\npublic class AsyncConfig {\n\n    @Bean\n    Executor taskExecutor() {\n        var executor = new ThreadPoolTaskExecutor();\n        executor.setCorePoolSize(4);\n        executor.setMaxPoolSize(10);\n        executor.setQueueCapacity(100);\n        executor.setThreadNamePrefix("app-async-");\n        executor.initialize();\n        return executor;\n    }\n}\n\n@Async\npublic CompletableFuture<Void> enviarBoasVindas(Usuario u) {\n    mailer.enviar(u.getEmail(), "Bem-vindo");\n    return CompletableFuture.completedFuture(null);\n}',
                },
                {
                    type: "text",
                    value: "Definir o executor é importante: sem ele, o Spring usa um que cria uma thread nova por chamada, sem limite. Sob carga isso derruba a aplicação.\n\nO Spring Boot 4.1 melhorou a **propagação de contexto** em métodos `@Async`, o que faz o trace id e o contexto de segurança acompanharem a thread nova. Antes, o log da tarefa assíncrona perdia a correlação com a requisição que a originou.",
                },
                {
                    type: "text",
                    value: "## Agendamento\n\n`@Scheduled` executa em intervalo ou por expressão cron. Em aplicação com **várias instâncias**, a tarefa roda em todas ao mesmo tempo, e é preciso um mecanismo de trava para garantir uma execução só.",
                },
                {
                    type: "code",
                    value: '@Scheduled(cron = "0 0 3 * * *", zone = "America/Sao_Paulo")\npublic void relatorioDiario() { }\n\n@Scheduled(fixedDelay = 60_000)\npublic void verificarPendencias() { }',
                },
                {
                    type: "quote",
                    value: "Async não é fila. Se o trabalho não pode se perder quando o processo cai, ele precisa de uma fila com persistência, não de outra thread.",
                },
            ],
            questions: [
                {
                    statement: "O que `@Async` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Executa o método em outra thread", isCorrect: true },
                        { text: "Adia a execução para um horário definido", isCorrect: false },
                        { text: "Envia o trabalho para uma fila persistente", isCorrect: false },
                        { text: "Repete o método quando ele falha", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que definir um executor próprio?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O padrão cria threads sem limite e derruba sob carga",
                            isCorrect: true,
                        },
                        {
                            text: "O padrão não funciona com métodos que devolvem valor",
                            isCorrect: false,
                        },
                        {
                            text: "O executor é obrigatório para o @Async funcionar",
                            isCorrect: false,
                        },
                        { text: "O padrão executa as tarefas em ordem inversa", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Spring Boot 4.1 melhorou no assíncrono?",
                    difficulty: "medio",
                    options: [
                        { text: "A propagação do contexto para a thread nova", isCorrect: true },
                        { text: "O desempenho do pool de threads padrão", isCorrect: false },
                        {
                            text: "O tratamento das exceções nos métodos assíncronos",
                            isCorrect: false,
                        },
                        { text: "A quantidade máxima de tarefas simultâneas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com `@Scheduled` em várias instâncias?",
                    difficulty: "dificil",
                    options: [
                        { text: "A tarefa roda em todas ao mesmo tempo", isCorrect: true },
                        { text: "Apenas a primeira instância executa a tarefa", isCorrect: false },
                        { text: "O Spring elege uma instância automaticamente", isCorrect: false },
                        { text: "A tarefa é distribuída entre as instâncias", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando `@Async` não é suficiente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quando o trabalho não pode se perder se o processo cair",
                            isCorrect: true,
                        },
                        { text: "Quando a tarefa demora mais de um minuto", isCorrect: false },
                        { text: "Quando o método precisa devolver um valor", isCorrect: false },
                        {
                            text: "Quando existe mais de uma tarefa rodando ao mesmo tempo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Empacotamento e containers",
            blocks: [
                {
                    type: "text",
                    value: "# O jar executável\n\nO Spring Boot empacota tudo em um jar único, com as dependências e o servidor dentro. Não há servidor externo para instalar: `java -jar` sobe a aplicação.",
                },
                {
                    type: "code",
                    value: "./mvnw clean package\njava -jar target/loja-1.0.0.jar\n\n# Pulando os testes, quando a CI já os rodou\n./mvnw clean package -DskipTests",
                },
                {
                    type: "text",
                    value: "## Camadas na imagem\n\nCopiar o jar inteiro para a imagem Docker desperdiça cache: uma linha alterada no seu código invalida a camada que contém todas as dependências, que são a maior parte do tamanho.\n\nO Boot resolve isso com **jar em camadas**: dependências, dependências de snapshot e o seu código ficam separados. Como as dependências mudam pouco, a camada delas é reaproveitada entre builds.",
                },
                {
                    type: "code",
                    value: 'FROM eclipse-temurin:25-jre AS builder\nWORKDIR /app\nCOPY target/*.jar app.jar\nRUN java -Djarmode=tools -jar app.jar extract --layers --destination extracted\n\nFROM eclipse-temurin:25-jre\nWORKDIR /app\nCOPY --from=builder /app/extracted/dependencies/ ./\nCOPY --from=builder /app/extracted/spring-boot-loader/ ./\nCOPY --from=builder /app/extracted/application/ ./\nENTRYPOINT ["java", "-jar", "app.jar"]',
                },
                {
                    type: "text",
                    value: "## Imagem sem Dockerfile\n\nO próprio Boot constrói a imagem usando buildpacks, escolhendo a base e as configurações da JVM sozinho. Para a maioria dos projetos é melhor do que um Dockerfile escrito à mão.",
                },
                {
                    type: "code",
                    value: "./mvnw spring-boot:build-image",
                },
            ],
            questions: [
                {
                    statement: "O que o jar do Spring Boot contém?",
                    difficulty: "facil",
                    options: [
                        { text: "As dependências e o servidor embutido", isCorrect: true },
                        { text: "Apenas as classes compiladas do projeto", isCorrect: false },
                        { text: "O código-fonte junto com as classes", isCorrect: false },
                        { text: "Um instalador para o servidor de aplicação", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o problema de copiar o jar inteiro para a imagem?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Uma mudança no código invalida a camada das dependências",
                            isCorrect: true,
                        },
                        { text: "A imagem final fica com o dobro do tamanho", isCorrect: false },
                        {
                            text: "O jar precisa ser todo extraído antes de poder ser executado",
                            isCorrect: false,
                        },
                        { text: "As dependências deixam de ser encontradas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o jar em camadas separa?",
                    difficulty: "medio",
                    options: [
                        { text: "Dependências e o código da aplicação", isCorrect: true },
                        { text: "As classes de teste e as de produção", isCorrect: false },
                        { text: "Os recursos estáticos e o código Java", isCorrect: false },
                        { text: "Cada módulo do projeto em uma camada", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a camada de dependências é reaproveitada?",
                    difficulty: "medio",
                    options: [
                        { text: "Elas mudam pouco entre um build e outro", isCorrect: true },
                        { text: "Elas são baixadas de um cache remoto", isCorrect: false },
                        { text: "O Docker as guarda em um volume próprio", isCorrect: false },
                        { text: "Elas são compartilhadas entre os projetos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `spring-boot:build-image` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Constrói a imagem sem precisar de Dockerfile", isCorrect: true },
                        { text: "Publica a imagem gerada em um registro remoto", isCorrect: false },
                        { text: "Gera o Dockerfile a partir do projeto", isCorrect: false },
                        { text: "Testa a imagem antes de empacotá-la", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - O Spring Boot 4",
    aulas: [
        {
            titulo: "O que mudou na linha 4",
            blocks: [
                {
                    type: "text",
                    value: "# Uma virada de geração\n\nO **Spring Boot 4.0** saiu em 20 de novembro de 2025, sobre o **Spring Framework 7.0**. A equipe descreve como o começo de uma geração nova, com foco no Java 25 e no ecossistema atual.\n\nO **Spring Boot 4.1**, de junho de 2026, é o alvo recomendado para projeto novo.",
                },
                {
                    type: "table",
                    value: '[["Novidade do Boot 4", "O que resolve"], ["modularização do código", "jars menores e mais focados"], ["Java 25 em primeira classe", "recursos novos da linguagem"], ["versionamento de API", "evoluir sem quebrar clientes"], ["HTTP Service Clients", "cliente declarativo por interface"]]',
                },
                {
                    type: "text",
                    value: "## Compatibilidade\n\nApesar do salto de versão maior, o Boot 4 mantém compatibilidade com **Java 17**. Não é preciso migrar a versão do Java junto, o que separa duas migrações que seriam arriscadas de fazer ao mesmo tempo.\n\n## O que exige atenção\n\nA modularização significa que alguns pacotes mudaram de artefato. Um projeto que dependia de uma classe interna pode precisar declarar uma dependência nova. Para código que usa as APIs públicas, a migração é tranquila.",
                },
                {
                    type: "quote",
                    value: "Migre uma coisa por vez: primeiro a versão do Spring Boot mantendo o Java, depois a versão do Java. Duas migrações juntas dobram a superfície de erro.",
                },
            ],
            questions: [
                {
                    statement: "Quando o Spring Boot 4.0 foi lançado?",
                    difficulty: "facil",
                    options: [
                        { text: "Em novembro de 2025", isCorrect: true },
                        { text: "Em junho de 2026, junto com a versão 4.1", isCorrect: false },
                        { text: "Em março de 2026, no primeiro trimestre", isCorrect: false },
                        { text: "Em novembro de 2024, um ano antes", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a versão mínima de Java aceita pelo Boot 4?",
                    difficulty: "medio",
                    options: [
                        { text: "Java 17", isCorrect: true },
                        { text: "Java 25, que é a apoiada em primeira classe", isCorrect: false },
                        { text: "Java 21, a versão anterior de longo prazo", isCorrect: false },
                        { text: "Java 11, mantida por compatibilidade", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a modularização do Boot 4 traz?",
                    difficulty: "medio",
                    options: [
                        { text: "Jars menores e mais focados", isCorrect: true },
                        { text: "Um sistema de plugins para a aplicação", isCorrect: false },
                        { text: "A separação entre código e configuração", isCorrect: false },
                        { text: "A divisão do projeto em vários módulos Maven", isCorrect: false },
                    ],
                },
                {
                    statement: "O que pode exigir atenção ao migrar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Pacotes que mudaram de artefato com a modularização",
                            isCorrect: true,
                        },
                        {
                            text: "A reescrita de todas as anotações usadas no projeto",
                            isCorrect: false,
                        },
                        { text: "A migração obrigatória para o Java 25", isCorrect: false },
                        { text: "A troca do Maven pelo Gradle no build", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a estratégia recomendada de migração?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma coisa por vez, Spring antes do Java", isCorrect: true },
                        { text: "Migrar o Spring e o Java na mesma alteração", isCorrect: false },
                        { text: "Migrar o Java primeiro e o Spring depois", isCorrect: false },
                        { text: "Reescrever o projeto do zero na versão nova", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Java 25 no dia a dia",
            blocks: [
                {
                    type: "text",
                    value: "# A linguagem mudou muito\n\nQuem escreveu Java 8 e voltou agora encontra outra linguagem. Vários recursos que exigiam bibliotecas hoje são sintaxe, e o código de uma aplicação Spring fica bem mais curto.",
                },
                {
                    type: "code",
                    value: '// Record: dados imutáveis sem cerimônia\npublic record ProdutoResponse(Long id, String nome, BigDecimal preco) {}\n\n// var: o tipo vem da direita\nvar produtos = repo.findByAtivoTrue();\n\n// Texto em bloco\nvar consulta = """\n    select p from Produto p\n    where p.ativo = true\n    """;\n\n// Switch como expressão, com pattern matching\nvar descricao = switch (status) {\n    case PENDENTE -> "Aguardando pagamento";\n    case PAGO, ENVIADO -> "Em andamento";\n    case CANCELADO -> "Cancelado";\n};',
                },
                {
                    type: "text",
                    value: "## Sealed e pattern matching\n\nUma hierarquia **selada** declara quem pode estendê-la. O compilador então sabe todos os casos possíveis, e passa a **exigir** que o switch os trate todos, do mesmo jeito que uma união discriminada em outras linguagens.",
                },
                {
                    type: "code",
                    value: 'public sealed interface Resultado permits Sucesso, Falha {}\npublic record Sucesso(Pedido pedido) implements Resultado {}\npublic record Falha(String motivo) implements Resultado {}\n\n// O compilador cobra os dois casos\nvar mensagem = switch (resultado) {\n    case Sucesso(var pedido) -> "Pedido " + pedido.getId();\n    case Falha(var motivo) -> "Falhou: " + motivo;\n};',
                },
                {
                    type: "text",
                    value: "## Threads virtuais\n\nO recurso que mais muda o desempenho de uma aplicação web. Threads virtuais são leves o bastante para criar milhares delas, e uma thread bloqueada em entrada e saída deixa de segurar uma thread do sistema.\n\nEm uma aplicação que passa a maior parte do tempo esperando banco e chamadas HTTP, ligar isso muda a capacidade de atendimento com uma linha de configuração.",
                },
                {
                    type: "code",
                    value: "spring:\n  threads:\n    virtual:\n      enabled: true",
                },
            ],
            questions: [
                {
                    statement: "O que um record oferece?",
                    difficulty: "medio",
                    options: [
                        { text: "Dados imutáveis sem escrever cerimônia", isCorrect: true },
                        { text: "Uma classe que gera o mapeamento para o banco", isCorrect: false },
                        { text: "Um objeto que valida os próprios campos", isCorrect: false },
                        { text: "Uma estrutura que substitui as interfaces", isCorrect: false },
                    ],
                },
                {
                    statement: "O que uma hierarquia selada permite ao compilador?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Saber todos os casos e exigir que sejam tratados",
                            isCorrect: true,
                        },
                        {
                            text: "Impedir que a classe seja instanciada diretamente",
                            isCorrect: false,
                        },
                        { text: "Gerar as implementações das subclasses", isCorrect: false },
                        { text: "Otimizar o código gerado para cada caso", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o ganho das threads virtuais em aplicação web?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Uma thread bloqueada não segura uma thread do sistema",
                            isCorrect: true,
                        },
                        {
                            text: "As requisições passam a ser todas processadas em paralelo",
                            isCorrect: false,
                        },
                        { text: "O processador é usado de forma mais eficiente", isCorrect: false },
                        { text: "A memória consumida por requisição diminui", isCorrect: false },
                    ],
                },
                {
                    statement: "Em que tipo de aplicação as threads virtuais mais ajudam?",
                    difficulty: "medio",
                    options: [
                        { text: "Na que passa o tempo esperando banco e HTTP", isCorrect: true },
                        { text: "Na que faz cálculo pesado no processador", isCorrect: false },
                        { text: "Na que processa arquivos grandes em memória", isCorrect: false },
                        { text: "Na que roda tarefas agendadas periódicas", isCorrect: false },
                    ],
                },
                {
                    statement: "Como ligar threads virtuais no Spring Boot?",
                    difficulty: "medio",
                    options: [
                        { text: "Com uma propriedade na configuração", isCorrect: true },
                        { text: "Anotando cada controller da aplicação", isCorrect: false },
                        { text: "Trocando o servidor embutido por outro", isCorrect: false },
                        {
                            text: "Configurando o executor de tarefas assíncronas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "As novidades do Spring Boot 4.1",
            blocks: [
                {
                    type: "text",
                    value: "# A primeira versão menor da linha 4\n\nO **Spring Boot 4.1**, de 10 de junho de 2026, roda sobre o Spring Framework 7.0.8 e é o alvo recomendado para projeto novo. Ele acrescenta várias peças que faltavam.",
                },
                {
                    type: "table",
                    value: '[["Novidade", "O que traz"], ["gRPC com auto-configuração", "serviços gRPC sem configuração manual"], ["proteção contra SSRF", "no cliente HTTP declarativo"], ["Kotlin 2.3", "suporte à versão nova da linguagem"], ["conexões preguiçosas", "o datasource conecta só quando precisa"], ["propagação em @Async", "contexto acompanha a thread nova"], ["OpenTelemetry", "suporte melhorado à instrumentação"]]',
                },
                {
                    type: "text",
                    value: "## Conexões preguiçosas no datasource\n\nPor padrão, uma transação pega a conexão ao começar, mesmo que o método só vá consultar o banco no fim, ou nem consulte. Com a conexão preguiçosa, ela é obtida na **primeira consulta de verdade**.\n\nO ganho aparece em aplicação com muitas requisições curtas: o pool de conexões atende mais gente com o mesmo tamanho.",
                },
                {
                    type: "text",
                    value: "## Proteção contra SSRF\n\nUm ataque de **SSRF** faz o servidor buscar uma URL escolhida pelo atacante, alcançando endereços internos que não são acessíveis de fora. É especialmente perigoso em nuvem, onde endereços internos expõem credenciais da instância.\n\nO cliente HTTP do 4.1 traz mitigação embutida, o que fecha uma porta que antes dependia de cada equipe lembrar de fechar.",
                },
                {
                    type: "quote",
                    value: "Qualquer funcionalidade em que o usuário informa uma URL que o servidor vai buscar é um candidato a SSRF: importar de um link, webhook, avatar por URL.",
                },
            ],
            questions: [
                {
                    statement: "Sobre qual versão do Framework o Boot 4.1 roda?",
                    difficulty: "medio",
                    options: [
                        { text: "Spring Framework 7.0.8", isCorrect: true },
                        { text: "Spring Framework 7.1, lançado junto", isCorrect: false },
                        { text: "Spring Framework 6.2, ainda mantida", isCorrect: false },
                        { text: "Spring Framework 8.0, em desenvolvimento", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a conexão preguiçosa do datasource muda?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A conexão é obtida só na primeira consulta real",
                            isCorrect: true,
                        },
                        { text: "A conexão é mantida aberta por mais tempo", isCorrect: false },
                        { text: "O pool passa a criar conexões sob demanda", isCorrect: false },
                        {
                            text: "As consultas são todas agrupadas antes de executar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde o ganho da conexão preguiçosa aparece?",
                    difficulty: "medio",
                    options: [
                        { text: "Em aplicação com muitas requisições curtas", isCorrect: true },
                        { text: "Em consultas que devolvem muitos registros", isCorrect: false },
                        { text: "Em transações que duram vários segundos", isCorrect: false },
                        { text: "Em aplicações com um único usuário ativo", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que SSRF é especialmente perigoso em nuvem?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Endereços internos podem expor credenciais da instância",
                            isCorrect: true,
                        },
                        { text: "A rede da nuvem é mais lenta para responder", isCorrect: false },
                        {
                            text: "Os provedores de nuvem não permitem bloquear esses endereços",
                            isCorrect: false,
                        },
                        { text: "As instâncias não têm firewall configurado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual funcionalidade é candidata a SSRF?",
                    difficulty: "medio",
                    options: [
                        { text: "Qualquer uma em que o usuário informa uma URL", isCorrect: true },
                        {
                            text: "Qualquer uma que receba o upload de um arquivo",
                            isCorrect: false,
                        },
                        { text: "As que exigem autenticação por token", isCorrect: false },
                        { text: "As que fazem consultas ao banco de dados", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Arquitetura em camadas",
            blocks: [
                {
                    type: "text",
                    value: "# Onde cada coisa mora\n\nUma aplicação Spring bem organizada tem responsabilidades separadas. A divisão mais comum tem três camadas, e o valor dela é que cada uma só conhece a de baixo.",
                },
                {
                    type: "table",
                    value: '[["Camada", "Responsabilidade", "Não deve"], ["controller", "receber e responder HTTP", "ter regra de negócio"], ["service", "a regra de negócio", "conhecer HTTP"], ["repository", "acesso a dados", "ter decisão de negócio"]]',
                },
                {
                    type: "text",
                    value: "## O sinal de que a divisão quebrou\n\nUm controller com `if` decidindo o que fazer, ou um service recebendo `HttpServletRequest`, são sinais de vazamento entre camadas. O efeito prático é que a regra fica impossível de testar sem subir a camada web.\n\n## Organizar por funcionalidade, não por tipo\n\nA estrutura por tipo agrupa todos os controllers, todos os services, todos os repositories. Ela é a mais ensinada e envelhece mal: mexer em uma funcionalidade exige abrir quatro pastas distantes.",
                },
                {
                    type: "code",
                    value: "// Por tipo: comum, e espalha cada mudança\ncom.loja/\n  controller/  ProdutoController, PedidoController, ClienteController\n  service/     ProdutoService, PedidoService, ClienteService\n  repository/  ...\n\n// Por funcionalidade: tudo de um assunto junto\ncom.loja/\n  produto/  ProdutoController, ProdutoService, ProdutoRepository, Produto\n  pedido/   PedidoController, PedidoService, PedidoRepository, Pedido\n  cliente/  ...",
                },
                {
                    type: "text",
                    value: "A segunda forma tem outra vantagem: ela mostra o **tamanho** de cada assunto. Uma pasta que cresceu demais é um candidato natural a virar um módulo separado, e essa informação some quando tudo está misturado por tipo.",
                },
            ],
            questions: [
                {
                    statement: "O que um controller não deve ter?",
                    difficulty: "medio",
                    options: [
                        { text: "Regra de negócio", isCorrect: true },
                        { text: "Injeção de dependências por construtor", isCorrect: false },
                        { text: "Anotações de mapeamento de rota", isCorrect: false },
                        { text: "Tratamento do código HTTP da resposta", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um service recebendo `HttpServletRequest` indica?",
                    difficulty: "dificil",
                    options: [
                        { text: "Vazamento da camada web para o negócio", isCorrect: true },
                        { text: "Que o service precisa de mais dependências", isCorrect: false },
                        { text: "Que o controller está fino demais", isCorrect: false },
                        { text: "Que falta um objeto de transferência de dados", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o efeito prático de a regra vazar para o controller?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ela fica impossível de testar sem a camada web", isCorrect: true },
                        { text: "A aplicação passa a responder mais devagar", isCorrect: false },
                        { text: "O Spring deixa de injetar as dependências", isCorrect: false },
                        {
                            text: "As transações acabam parando de funcionar corretamente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o problema de organizar por tipo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mexer em uma funcionalidade exige abrir várias pastas",
                            isCorrect: true,
                        },
                        { text: "As classes ficam com nomes muito parecidos", isCorrect: false },
                        {
                            text: "O Spring acaba demorando mais para escanear os pacotes",
                            isCorrect: false,
                        },
                        { text: "As camadas passam a depender umas das outras", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual vantagem extra a organização por funcionalidade traz?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ela mostra o tamanho de cada assunto", isCorrect: true },
                        { text: "Ela reduz a quantidade de classes do projeto", isCorrect: false },
                        { text: "Ela dispensa a separação em camadas", isCorrect: false },
                        { text: "Ela facilita a busca por nome de classe", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Projeto final e para onde ir",
            blocks: [
                {
                    type: "text",
                    value: "# Juntando tudo\n\nPara fechar a trilha, construa uma **API de pedidos** que exercite cada módulo:\n\n1. Projeto com os starters de web, JPA, validation e security\n2. Entidades com relacionamentos, migrations em Flyway e `ddl-auto: validate`\n3. Endpoints REST com validação, paginação e `ProblemDetail` nos erros\n4. Autenticação por JWT, com autorização por papel e consultas escopadas\n5. Testes de unidade no service, fatia web nos controllers e Testcontainers no repositório\n6. Actuator, métricas e log estruturado com trace id\n7. Imagem em camadas e um `docker-compose` com banco",
                },
                {
                    type: "code",
                    value: "@Service\n@Transactional\npublic class PedidoService {\n\n    private final PedidoRepository repo;\n    private final EstoqueService estoque;\n\n    public PedidoService(PedidoRepository repo, EstoqueService estoque) {\n        this.repo = repo;\n        this.estoque = estoque;\n    }\n\n    public PedidoResponse criar(CriarPedidoRequest req, Long clienteId) {\n        if (!estoque.disponivel(req.itens())) {\n            throw new EstoqueInsuficiente();\n        }\n        var pedido = repo.save(Pedido.novo(clienteId, req.itens()));\n        estoque.reservar(req.itens());\n        return PedidoResponse.de(pedido);\n    }\n\n    @Transactional(readOnly = true)\n    public Page<PedidoResponse> listarDoCliente(Long clienteId, Pageable p) {\n        return repo.findByClienteId(clienteId, p).map(PedidoResponse::de);\n    }\n}",
                },
                {
                    type: "text",
                    value: "Repare em três coisas do código acima: a injeção é por construtor, a listagem é escopada pelo cliente em vez de verificar permissão depois, e o `readOnly` está na consulta.\n\n## Para onde ir depois\n\n- **Aprofundar JPA**: consultas complexas, projeções, lote e o custo real de cada operação\n- **Mensageria**: Kafka ou RabbitMQ, para desacoplar serviços de verdade\n- **Arquitetura**: quando dividir em serviços, e o custo que isso cobra\n- **Ler o código do Spring**: as auto-configurações são legíveis, e entender uma delas ensina mais que dez tutoriais",
                },
            ],
            questions: [
                {
                    statement: "Por que a listagem é escopada pelo cliente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O pedido de outra pessoa não aparece na consulta",
                            isCorrect: true,
                        },
                        { text: "Para que a consulta execute mais rápido", isCorrect: false },
                        {
                            text: "Porque o Spring Data exige um filtro na consulta",
                            isCorrect: false,
                        },
                        {
                            text: "Para reduzir a quantidade de dados na resposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que `readOnly = true` na listagem?",
                    difficulty: "medio",
                    options: [
                        { text: "O Hibernate pula a checagem de alterações", isCorrect: true },
                        { text: "A consulta passa a usar outra conexão do pool", isCorrect: false },
                        {
                            text: "O resultado é guardado em cache automaticamente",
                            isCorrect: false,
                        },
                        { text: "A transação é aberta com menos privilégios", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual valor de `ddl-auto` o projeto final usa?",
                    difficulty: "medio",
                    options: [
                        { text: "validate, com as mudanças vindo de migrations", isCorrect: true },
                        { text: "update, para acompanhar as entidades", isCorrect: false },
                        {
                            text: "create-drop, recriando todo o schema a cada build",
                            isCorrect: false,
                        },
                        { text: "none, sem nenhuma verificação", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual tipo de teste cobre o repositório no projeto final?",
                    difficulty: "medio",
                    options: [
                        { text: "Integração com Testcontainers", isCorrect: true },
                        { text: "Unidade com dublês do Mockito", isCorrect: false },
                        { text: "Fatia web com o MockMvc configurado", isCorrect: false },
                        { text: "Nenhum, repositório não precisa de teste", isCorrect: false },
                    ],
                },
                {
                    statement: "O que aprender lendo as auto-configurações do Spring?",
                    difficulty: "dificil",
                    options: [
                        { text: "Como o framework decide o que criar e por quê", isCorrect: true },
                        { text: "Quais dependências o projeto precisa declarar", isCorrect: false },
                        { text: "Como escrever testes para a aplicação", isCorrect: false },
                        { text: "Quais propriedades existem na configuração", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

export const MODULOS: Modulo[] = [
    MODULO_1,
    MODULO_2,
    MODULO_3,
    MODULO_4,
    MODULO_5,
    MODULO_6,
    MODULO_7,
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: LEVEL,
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + NOME);
    } else {
        const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
        if (existentes.length > 0) {
            console.log("Trilha já tem aulas, nada a fazer: " + NOME);
            return;
        }
        await db
            .update(trails)
            .set({ workloadHours: CARGA_HORARIA, description: DESCRICAO, trailLevel: LEVEL })
            .where(eq(trails.id, trilha.id));
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
        "Seed concluído: " +
            MODULOS.length +
            " módulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questões.",
    );
}

// Só semeia quando executado direto. Importado, expõe MODULOS/NOME sem rodar nada.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
