// Termos que o analisador reconhece. A ordem daqui é a ordem em que as
// palavras-chave aparecem na tela. `tecnica` marca o que conta na nota de
// habilidades técnicas: processo (Scrum, code review) e idioma ficam de fora
// dessa conta, mas ainda valem como palavra-chave da vaga.

export interface TermoTecnico {
    exibicao: string;
    apelidos: string[];
    tecnica: boolean;
}

export const TERMOS: TermoTecnico[] = [
    // Front-end
    { exibicao: "React", apelidos: ["react", "react.js", "reactjs"], tecnica: true },
    { exibicao: "Next.js", apelidos: ["next.js", "nextjs", "next js"], tecnica: true },
    { exibicao: "Vue", apelidos: ["vue", "vue.js", "vuejs"], tecnica: true },
    { exibicao: "Angular", apelidos: ["angular", "angularjs"], tecnica: true },
    { exibicao: "TypeScript", apelidos: ["typescript"], tecnica: true },
    { exibicao: "JavaScript", apelidos: ["javascript", "ecmascript"], tecnica: true },
    { exibicao: "HTML", apelidos: ["html", "html5"], tecnica: true },
    { exibicao: "CSS", apelidos: ["css", "css3"], tecnica: true },
    {
        exibicao: "Tailwind CSS",
        apelidos: ["tailwind css", "tailwind", "tailwindcss"],
        tecnica: true,
    },
    { exibicao: "SASS", apelidos: ["sass", "scss"], tecnica: true },
    { exibicao: "Redux", apelidos: ["redux"], tecnica: true },
    { exibicao: "Webpack", apelidos: ["webpack"], tecnica: true },
    { exibicao: "Vite", apelidos: ["vite"], tecnica: true },
    { exibicao: "React Native", apelidos: ["react native"], tecnica: true },
    { exibicao: "Flutter", apelidos: ["flutter"], tecnica: true },

    // Linguagens e frameworks de back-end
    { exibicao: "Node.js", apelidos: ["node.js", "nodejs", "node js", "node"], tecnica: true },
    { exibicao: "Express", apelidos: ["express", "express.js", "expressjs"], tecnica: true },
    { exibicao: "NestJS", apelidos: ["nestjs", "nest.js"], tecnica: true },
    { exibicao: "C#", apelidos: ["c#", "csharp", "c sharp"], tecnica: true },
    { exibicao: ".NET", apelidos: [".net", "dotnet", "dot net", ".net core"], tecnica: true },
    {
        exibicao: "ASP.NET Core",
        apelidos: ["asp.net core", "asp.net", "aspnet", "asp net"],
        tecnica: true,
    },
    {
        exibicao: "Entity Framework",
        apelidos: ["entity framework", "ef core", "efcore"],
        tecnica: true,
    },
    { exibicao: "Java", apelidos: ["java"], tecnica: true },
    { exibicao: "Spring Boot", apelidos: ["spring boot", "springboot", "spring"], tecnica: true },
    { exibicao: "Python", apelidos: ["python"], tecnica: true },
    { exibicao: "Django", apelidos: ["django"], tecnica: true },
    { exibicao: "Flask", apelidos: ["flask"], tecnica: true },
    { exibicao: "FastAPI", apelidos: ["fastapi", "fast api"], tecnica: true },
    { exibicao: "PHP", apelidos: ["php"], tecnica: true },
    { exibicao: "Laravel", apelidos: ["laravel"], tecnica: true },
    { exibicao: "Ruby", apelidos: ["ruby"], tecnica: true },
    { exibicao: "Ruby on Rails", apelidos: ["ruby on rails", "rails"], tecnica: true },
    { exibicao: "Go", apelidos: ["golang"], tecnica: true },
    { exibicao: "Kotlin", apelidos: ["kotlin"], tecnica: true },

    // APIs e integração
    {
        exibicao: "APIs REST",
        apelidos: ["apis rest", "api rest", "rest", "restful", "apis restful"],
        tecnica: true,
    },
    { exibicao: "GraphQL", apelidos: ["graphql"], tecnica: true },
    { exibicao: "gRPC", apelidos: ["grpc"], tecnica: true },
    { exibicao: "WebSocket", apelidos: ["websocket", "websockets"], tecnica: true },
    { exibicao: "OpenAPI", apelidos: ["openapi", "swagger"], tecnica: true },
    { exibicao: "JWT", apelidos: ["jwt", "json web token"], tecnica: true },
    { exibicao: "OAuth", apelidos: ["oauth", "oauth2", "oauth 2.0"], tecnica: true },

    // Dados e mensageria
    { exibicao: "SQL", apelidos: ["sql"], tecnica: true },
    { exibicao: "PostgreSQL", apelidos: ["postgresql", "postgres", "postgre"], tecnica: true },
    { exibicao: "MySQL", apelidos: ["mysql"], tecnica: true },
    { exibicao: "SQL Server", apelidos: ["sql server", "sqlserver"], tecnica: true },
    { exibicao: "Oracle", apelidos: ["oracle"], tecnica: true },
    { exibicao: "MongoDB", apelidos: ["mongodb", "mongo"], tecnica: true },
    { exibicao: "Redis", apelidos: ["redis"], tecnica: true },
    { exibicao: "Elasticsearch", apelidos: ["elasticsearch", "elastic search"], tecnica: true },
    { exibicao: "Prisma", apelidos: ["prisma"], tecnica: true },
    { exibicao: "RabbitMQ", apelidos: ["rabbitmq", "rabbit mq"], tecnica: true },
    { exibicao: "Kafka", apelidos: ["kafka", "apache kafka"], tecnica: true },
    {
        exibicao: "Mensageria",
        apelidos: ["mensageria", "messaging", "message broker", "filas"],
        tecnica: true,
    },

    // Cloud, infra e DevOps
    { exibicao: "AWS", apelidos: ["aws", "amazon web services"], tecnica: true },
    { exibicao: "Azure", apelidos: ["azure", "microsoft azure"], tecnica: true },
    { exibicao: "GCP", apelidos: ["gcp", "google cloud", "google cloud platform"], tecnica: true },
    { exibicao: "Cloud", apelidos: ["cloud", "nuvem", "computacao em nuvem"], tecnica: true },
    { exibicao: "Docker", apelidos: ["docker"], tecnica: true },
    { exibicao: "Kubernetes", apelidos: ["kubernetes", "k8s"], tecnica: true },
    { exibicao: "Terraform", apelidos: ["terraform"], tecnica: true },
    {
        exibicao: "CI/CD",
        apelidos: ["ci/cd", "ci cd", "cicd", "integracao continua"],
        tecnica: true,
    },
    { exibicao: "GitHub Actions", apelidos: ["github actions"], tecnica: true },
    { exibicao: "Jenkins", apelidos: ["jenkins"], tecnica: true },
    { exibicao: "Linux", apelidos: ["linux", "unix"], tecnica: true },
    { exibicao: "Nginx", apelidos: ["nginx"], tecnica: true },
    { exibicao: "Git", apelidos: ["git"], tecnica: true },
    {
        exibicao: "Observabilidade",
        apelidos: ["observabilidade", "observability", "tracing"],
        tecnica: false,
    },

    // Testes e qualidade
    { exibicao: "Jest", apelidos: ["jest"], tecnica: true },
    { exibicao: "Vitest", apelidos: ["vitest"], tecnica: true },
    { exibicao: "Cypress", apelidos: ["cypress"], tecnica: true },
    { exibicao: "Playwright", apelidos: ["playwright"], tecnica: true },
    { exibicao: "Selenium", apelidos: ["selenium"], tecnica: true },
    { exibicao: "Testing Library", apelidos: ["testing library"], tecnica: true },
    { exibicao: "JUnit", apelidos: ["junit"], tecnica: true },
    { exibicao: "xUnit", apelidos: ["xunit", "nunit"], tecnica: true },
    { exibicao: "pytest", apelidos: ["pytest"], tecnica: true },
    { exibicao: "PHPUnit", apelidos: ["phpunit"], tecnica: true },
    {
        exibicao: "Testes",
        apelidos: ["testes", "teste", "testes automatizados", "tests"],
        tecnica: false,
    },
    { exibicao: "TDD", apelidos: ["tdd", "test driven development"], tecnica: false },

    // Arquitetura
    { exibicao: "SOLID", apelidos: ["solid"], tecnica: true },
    {
        exibicao: "Clean Architecture",
        apelidos: ["clean architecture", "arquitetura limpa"],
        tecnica: true,
    },
    {
        exibicao: "DDD",
        apelidos: ["ddd", "domain driven design", "domain-driven design"],
        tecnica: true,
    },
    {
        exibicao: "Orientação a Objetos",
        apelidos: [
            "orientacao a objetos",
            "object oriented",
            "oop",
            "programacao orientada a objetos",
        ],
        tecnica: true,
    },
    {
        exibicao: "Microserviços",
        apelidos: ["microservicos", "microsservicos", "microservices"],
        tecnica: true,
    },
    {
        exibicao: "Escalabilidade",
        apelidos: ["escalabilidade", "scalability", "escalavel"],
        tecnica: false,
    },

    // Segurança
    { exibicao: "OWASP", apelidos: ["owasp", "owasp top 10"], tecnica: true },
    {
        exibicao: "Segurança de aplicações",
        apelidos: [
            "seguranca de aplicacoes",
            "application security",
            "appsec",
            "security by design",
        ],
        tecnica: true,
    },
    { exibicao: "LGPD", apelidos: ["lgpd", "gdpr"], tecnica: false },

    // Dados e IA
    {
        exibicao: "Inteligência Artificial",
        apelidos: ["inteligencia artificial", "llm", "llms"],
        tecnica: true,
    },
    {
        exibicao: "Machine Learning",
        apelidos: ["machine learning", "aprendizado de maquina"],
        tecnica: true,
    },
    { exibicao: "Data Science", apelidos: ["data science", "ciencia de dados"], tecnica: true },
    { exibicao: "Power BI", apelidos: ["power bi", "powerbi"], tecnica: true },
    { exibicao: "ETL", apelidos: ["etl"], tecnica: true },

    // Produto, processo e idioma
    { exibicao: "Scrum", apelidos: ["scrum"], tecnica: false },
    {
        exibicao: "Ágil",
        apelidos: ["agile", "metodologias ageis", "metodologia agil"],
        tecnica: false,
    },
    { exibicao: "Kanban", apelidos: ["kanban"], tecnica: false },
    { exibicao: "Code review", apelidos: ["code review", "revisao de codigo"], tecnica: false },
    { exibicao: "Figma", apelidos: ["figma"], tecnica: false },
    {
        exibicao: "Responsivo",
        apelidos: ["responsivo", "responsiva", "responsividade", "responsive"],
        tecnica: false,
    },
    {
        exibicao: "Performance",
        apelidos: ["performance", "core web vitals", "desempenho"],
        tecnica: false,
    },
    {
        exibicao: "Acessibilidade",
        apelidos: ["acessibilidade", "accessibility", "a11y"],
        tecnica: false,
    },
    { exibicao: "WCAG", apelidos: ["wcag"], tecnica: true },
    { exibicao: "Inglês", apelidos: ["ingles", "english"], tecnica: false },
    { exibicao: "Espanhol", apelidos: ["espanhol", "spanish"], tecnica: false },
];
