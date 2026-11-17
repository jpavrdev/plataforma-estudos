// Terms the analyzer recognizes. The order here is the order the keywords
// appear on screen. `technical` marks what counts towards the technical
// skills score: process (Scrum, code review) and languages are left out of
// that count but still count as job keywords.

export interface TechTerm {
    display: string;
    aliases: string[];
    technical: boolean;
}

export const KEYWORDS: TechTerm[] = [
    // Front-end
    { display: "React", aliases: ["react", "react.js", "reactjs"], technical: true },
    { display: "Next.js", aliases: ["next.js", "nextjs", "next js"], technical: true },
    { display: "Vue", aliases: ["vue", "vue.js", "vuejs"], technical: true },
    { display: "Angular", aliases: ["angular", "angularjs"], technical: true },
    { display: "TypeScript", aliases: ["typescript"], technical: true },
    { display: "JavaScript", aliases: ["javascript", "ecmascript"], technical: true },
    { display: "HTML", aliases: ["html", "html5"], technical: true },
    { display: "CSS", aliases: ["css", "css3"], technical: true },
    {
        display: "Tailwind CSS",
        aliases: ["tailwind css", "tailwind", "tailwindcss"],
        technical: true,
    },
    { display: "SASS", aliases: ["sass", "scss"], technical: true },
    { display: "Redux", aliases: ["redux"], technical: true },
    { display: "Webpack", aliases: ["webpack"], technical: true },
    { display: "Vite", aliases: ["vite"], technical: true },
    { display: "React Native", aliases: ["react native"], technical: true },
    { display: "Flutter", aliases: ["flutter"], technical: true },

    // Back-end languages and frameworks
    { display: "Node.js", aliases: ["node.js", "nodejs", "node js", "node"], technical: true },
    { display: "Express", aliases: ["express", "express.js", "expressjs"], technical: true },
    { display: "NestJS", aliases: ["nestjs", "nest.js"], technical: true },
    { display: "C#", aliases: ["c#", "csharp", "c sharp"], technical: true },
    { display: ".NET", aliases: [".net", "dotnet", "dot net", ".net core"], technical: true },
    {
        display: "ASP.NET Core",
        aliases: ["asp.net core", "asp.net", "aspnet", "asp net"],
        technical: true,
    },
    {
        display: "Entity Framework",
        aliases: ["entity framework", "ef core", "efcore"],
        technical: true,
    },
    { display: "Java", aliases: ["java"], technical: true },
    { display: "Spring Boot", aliases: ["spring boot", "springboot", "spring"], technical: true },
    { display: "Python", aliases: ["python"], technical: true },
    { display: "Django", aliases: ["django"], technical: true },
    { display: "Flask", aliases: ["flask"], technical: true },
    { display: "FastAPI", aliases: ["fastapi", "fast api"], technical: true },
    { display: "PHP", aliases: ["php"], technical: true },
    { display: "Laravel", aliases: ["laravel"], technical: true },
    { display: "Ruby", aliases: ["ruby"], technical: true },
    { display: "Ruby on Rails", aliases: ["ruby on rails", "rails"], technical: true },
    { display: "Go", aliases: ["golang"], technical: true },
    { display: "Kotlin", aliases: ["kotlin"], technical: true },

    // APIs and integration
    {
        display: "APIs REST",
        aliases: ["apis rest", "api rest", "rest", "restful", "apis restful"],
        technical: true,
    },
    { display: "GraphQL", aliases: ["graphql"], technical: true },
    { display: "gRPC", aliases: ["grpc"], technical: true },
    { display: "WebSocket", aliases: ["websocket", "websockets"], technical: true },
    { display: "OpenAPI", aliases: ["openapi", "swagger"], technical: true },
    { display: "JWT", aliases: ["jwt", "json web token"], technical: true },
    { display: "OAuth", aliases: ["oauth", "oauth2", "oauth 2.0"], technical: true },

    // Data and messaging
    { display: "SQL", aliases: ["sql"], technical: true },
    { display: "PostgreSQL", aliases: ["postgresql", "postgres", "postgre"], technical: true },
    { display: "MySQL", aliases: ["mysql"], technical: true },
    { display: "SQL Server", aliases: ["sql server", "sqlserver"], technical: true },
    { display: "Oracle", aliases: ["oracle"], technical: true },
    { display: "MongoDB", aliases: ["mongodb", "mongo"], technical: true },
    { display: "Redis", aliases: ["redis"], technical: true },
    { display: "Elasticsearch", aliases: ["elasticsearch", "elastic search"], technical: true },
    { display: "Prisma", aliases: ["prisma"], technical: true },
    { display: "RabbitMQ", aliases: ["rabbitmq", "rabbit mq"], technical: true },
    { display: "Kafka", aliases: ["kafka", "apache kafka"], technical: true },
    {
        display: "Mensageria",
        aliases: ["mensageria", "messaging", "message broker", "filas"],
        technical: true,
    },

    // Cloud, infra and DevOps
    { display: "AWS", aliases: ["aws", "amazon web services"], technical: true },
    { display: "Azure", aliases: ["azure", "microsoft azure"], technical: true },
    { display: "GCP", aliases: ["gcp", "google cloud", "google cloud platform"], technical: true },
    { display: "Cloud", aliases: ["cloud", "nuvem", "computacao em nuvem"], technical: true },
    { display: "Docker", aliases: ["docker"], technical: true },
    { display: "Kubernetes", aliases: ["kubernetes", "k8s"], technical: true },
    { display: "Terraform", aliases: ["terraform"], technical: true },
    {
        display: "CI/CD",
        aliases: ["ci/cd", "ci cd", "cicd", "integracao continua"],
        technical: true,
    },
    { display: "GitHub Actions", aliases: ["github actions"], technical: true },
    { display: "Jenkins", aliases: ["jenkins"], technical: true },
    { display: "Linux", aliases: ["linux", "unix"], technical: true },
    { display: "Nginx", aliases: ["nginx"], technical: true },
    { display: "Git", aliases: ["git"], technical: true },
    {
        display: "Observabilidade",
        aliases: ["observabilidade", "observability", "tracing"],
        technical: false,
    },

    // Testing and quality
    { display: "Jest", aliases: ["jest"], technical: true },
    { display: "Vitest", aliases: ["vitest"], technical: true },
    { display: "Cypress", aliases: ["cypress"], technical: true },
    { display: "Playwright", aliases: ["playwright"], technical: true },
    { display: "Selenium", aliases: ["selenium"], technical: true },
    { display: "Testing Library", aliases: ["testing library"], technical: true },
    { display: "JUnit", aliases: ["junit"], technical: true },
    { display: "xUnit", aliases: ["xunit", "nunit"], technical: true },
    { display: "pytest", aliases: ["pytest"], technical: true },
    { display: "PHPUnit", aliases: ["phpunit"], technical: true },
    {
        display: "Testes",
        aliases: ["testes", "teste", "testes automatizados", "tests"],
        technical: false,
    },
    { display: "TDD", aliases: ["tdd", "test driven development"], technical: false },

    // Architecture
    { display: "SOLID", aliases: ["solid"], technical: true },
    {
        display: "Clean Architecture",
        aliases: ["clean architecture", "arquitetura limpa"],
        technical: true,
    },
    {
        display: "DDD",
        aliases: ["ddd", "domain driven design", "domain-driven design"],
        technical: true,
    },
    {
        display: "Orientação a Objetos",
        aliases: [
            "orientacao a objetos",
            "object oriented",
            "oop",
            "programacao orientada a objetos",
        ],
        technical: true,
    },
    {
        display: "Microserviços",
        aliases: ["microservicos", "microsservicos", "microservices"],
        technical: true,
    },
    {
        display: "Escalabilidade",
        aliases: ["escalabilidade", "scalability", "escalavel"],
        technical: false,
    },

    // Security
    { display: "OWASP", aliases: ["owasp", "owasp top 10"], technical: true },
    {
        display: "Segurança de aplicações",
        aliases: [
            "seguranca de aplicacoes",
            "application security",
            "appsec",
            "security by design",
        ],
        technical: true,
    },
    { display: "LGPD", aliases: ["lgpd", "gdpr"], technical: false },

    // Data and AI
    {
        display: "Inteligência Artificial",
        aliases: ["inteligencia artificial", "llm", "llms"],
        technical: true,
    },
    {
        display: "Machine Learning",
        aliases: ["machine learning", "aprendizado de maquina"],
        technical: true,
    },
    { display: "Data Science", aliases: ["data science", "ciencia de dados"], technical: true },
    { display: "Power BI", aliases: ["power bi", "powerbi"], technical: true },
    { display: "ETL", aliases: ["etl"], technical: true },

    // Product, process and languages
    { display: "Scrum", aliases: ["scrum"], technical: false },
    {
        display: "Ágil",
        aliases: ["agile", "metodologias ageis", "metodologia agil"],
        technical: false,
    },
    { display: "Kanban", aliases: ["kanban"], technical: false },
    { display: "Code review", aliases: ["code review", "revisao de codigo"], technical: false },
    { display: "Figma", aliases: ["figma"], technical: false },
    {
        display: "Responsivo",
        aliases: ["responsivo", "responsiva", "responsividade", "responsive"],
        technical: false,
    },
    {
        display: "Performance",
        aliases: ["performance", "core web vitals", "desempenho"],
        technical: false,
    },
    {
        display: "Acessibilidade",
        aliases: ["acessibilidade", "accessibility", "a11y"],
        technical: false,
    },
    { display: "WCAG", aliases: ["wcag"], technical: true },
    { display: "Inglês", aliases: ["ingles", "english"], technical: false },
    { display: "Espanhol", aliases: ["espanhol", "spanish"], technical: false },
];
