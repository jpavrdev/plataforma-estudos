// All matching happens over normalized text, so "inglês" in the resume matches
// "ingles" in the job description. The original is only used for display.

export function normalize(text: string): string {
    if (!text) return "";
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .normalize("NFC");
}

// Dot, slash and hash join the token to preserve "next.js", "ci/cd" and "c#".
const WORD_PATTERN = /[\p{L}\p{N}][\p{L}\p{N}.+/#]*/gu;

export function tokenize(text: string): string[] {
    return normalize(text).match(WORD_PATTERN) ?? [];
}

export function tokenizeOriginal(text: string): string[] {
    return text ? (text.match(WORD_PATTERN) ?? []) : [];
}

function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function containsWord(normalizedText: string, term: string): boolean {
    const target = normalize(term).trim();
    if (!target) return false;
    return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(target)}(?![\\p{L}\\p{N}])`, "u").test(
        normalizedText,
    );
}

// Without a word boundary: this is what characterizes a weak mention (partial).
export function containsLoose(normalizedText: string, term: string): boolean {
    const target = normalize(term).trim();
    return target.length > 0 && normalizedText.includes(target);
}

// These filter the extraction fallback, which picks loose tokens from requirement lines.
// prettier-ignore
export const STOPWORDS = new Set([
    // Português
    "a", "o", "as", "os", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das", "em",
    "no", "na", "nos", "nas", "por", "para", "com", "sem", "sob", "sobre", "ate", "e", "ou",
    "que", "se", "ao", "aos", "como", "mais", "menos", "muito", "muita", "ser", "ter", "estar",
    "sua", "seu", "suas", "seus", "nosso", "nossa", "nossos", "nossas", "vaga", "pessoa",
    "time", "times", "cultura", "boa", "bom", "leitura", "nivel", "experiencia", "conhecimento",
    "vivencia", "dominio", "fluxo", "anos", "ano", "partir", "designs", "interfaces",
    "aplicacoes", "garantir", "colaborar", "manter", "desenvolver", "implementar", "escrever",
    "construir", "integrar", "buscamos", "produto", "back", "junior", "pleno", "senior",
    "estagio", "trainee", "remoto", "hibrido", "presencial", "intermediario", "documentacao",
    "responsabilidades", "requisitos", "diferenciais", "automatizados", "consumo",
    "versionamento", "desenvolvimento", "responsivas", "web", "performaticas", "acessiveis",
    "agil", "core", "library", "testing", "media", "alta", "baixa", "complexidade", "solucoes",
    "solucao", "codigo", "limpo", "cobertura", "unitarios", "integracao", "qualidade", "seguro",
    "seguros", "autonoma", "autonomo", "forma", "participar", "alem", "sustentacao",
    "incidentes", "producao", "processos", "negocios", "negocio", "parceiros", "ferramentas",
    "tecnologias", "backend", "frontend", "fullstack", "transacionais", "comprovada", "solida",
    "bons", "principios", "design", "orientado", "objetos", "reviews", "atuar", "salario",
    "beneficios", "clt", "pj", "vale", "plano", "saude",
    // Inglês
    "the", "an", "of", "in", "on", "for", "with", "and", "or", "to", "as", "is", "are", "be",
    "by", "at", "from", "this", "that", "your", "our", "we", "you", "it",
]);
