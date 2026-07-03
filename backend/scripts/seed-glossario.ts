// Seed do glossário: termos técnicos de nuvem, dados e IA com definição, mostrados
// como tooltip nas aulas. Idempotente: se já houver termos, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-glossario.ts
import { db } from "../db.ts";
import { glossary } from "../schema.ts";
import { count } from "drizzle-orm";

const TERMOS: { term: string; definition: string }[] = [
    {
        term: "IaaS",
        definition:
            "Infraestrutura como Serviço. Você aluga a infraestrutura básica (máquinas, rede, armazenamento) e ainda gerencia o sistema operacional e as aplicações. Ex.: uma máquina virtual no Azure ou EC2 na AWS.",
    },
    {
        term: "PaaS",
        definition:
            "Plataforma como Serviço. O provedor cuida da infraestrutura e da plataforma; você só implanta e gerencia a aplicação. Ex.: Azure App Service.",
    },
    {
        term: "SaaS",
        definition:
            "Software como Serviço. Software pronto, acessado pela internet, sem gerenciar nada da infraestrutura. Ex.: Microsoft 365, Gmail.",
    },
    {
        term: "CapEx",
        definition:
            "Despesa de capital. Investimento adiantado em ativos físicos, como comprar servidores e montar um data center. É o modelo típico do ambiente local (on-premises).",
    },
    {
        term: "OpEx",
        definition:
            "Despesa operacional. Gasto contínuo conforme o uso, sem investimento inicial. É o modelo da nuvem: você paga pelo que consome.",
    },
    {
        term: "SLA",
        definition:
            "Acordo de Nível de Serviço. O compromisso do provedor com disponibilidade e desempenho, por exemplo garantir 99,9% de uptime.",
    },
    {
        term: "VM",
        definition:
            "Máquina Virtual. Um computador por software que roda sobre um servidor físico, com seu próprio sistema operacional.",
    },
    {
        term: "CDN",
        definition:
            "Rede de Distribuição de Conteúdo. Servidores espalhados pelo mundo que entregam o conteúdo a partir do ponto mais próximo do usuário, reduzindo a latência.",
    },
    {
        term: "API",
        definition:
            "Interface de Programação de Aplicações. O conjunto de regras pelo qual um software conversa com outro.",
    },
    {
        term: "SDK",
        definition:
            "Kit de Desenvolvimento de Software. Conjunto de ferramentas e bibliotecas para construir aplicações para uma plataforma.",
    },
    {
        term: "OLTP",
        definition:
            "Processamento de Transações Online. Cargas de muitas transações curtas sobre dados atuais (inserções e atualizações), típicas de sistemas operacionais.",
    },
    {
        term: "OLAP",
        definition:
            "Processamento Analítico Online. Cargas de consultas complexas e agregações sobre grandes volumes de dados históricos, voltadas a análise.",
    },
    {
        term: "ACID",
        definition:
            "Atomicidade, Consistência, Isolamento e Durabilidade. As quatro garantias de uma transação confiável em um banco de dados.",
    },
    {
        term: "ETL",
        definition:
            "Extract, Transform, Load. Extrair os dados, transformá-los e só então carregá-los no destino.",
    },
    {
        term: "ELT",
        definition:
            "Extract, Load, Transform. Extrair, carregar os dados brutos no destino e transformá-los lá, aproveitando o poder de processamento do destino.",
    },
    {
        term: "NoSQL",
        definition:
            "Bancos não relacionais, de esquema flexível e que escalam horizontalmente. Incluem modelos de documento, chave-valor, coluna e grafo.",
    },
    {
        term: "LLM",
        definition:
            "Modelo de Linguagem Grande. Modelo de IA treinado em enormes volumes de texto para entender e gerar linguagem natural. É a base da IA generativa, como o GPT.",
    },
    {
        term: "RAG",
        definition:
            "Geração Aumentada por Recuperação. Buscar trechos relevantes de uma fonte confiável e injetá-los no prompt, para o modelo responder com base nesses dados.",
    },
];

async function seed() {
    const [{ n }] = await db.select({ n: count() }).from(glossary);
    if (Number(n) > 0) {
        console.log(`Glossário já tem ${n} termos, nada a fazer.`);
        return;
    }
    await db.insert(glossary).values(TERMOS);
    console.log(`Seed concluído: ${TERMOS.length} termos inseridos.`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
