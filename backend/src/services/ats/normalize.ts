// Todo o casamento acontece sobre o texto normalizado, para "inglês" no
// currículo casar com "ingles" na vaga. O original só serve para exibir.

export function normalizar(texto: string): string {
    if (!texto) return "";
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .normalize("NFC");
}

// Ponto, barra e cerquilha entram no token para preservar "next.js", "ci/cd" e "c#".
const PALAVRA = /[\p{L}\p{N}][\p{L}\p{N}.+/#]*/gu;

export function tokenizar(texto: string): string[] {
    return normalizar(texto).match(PALAVRA) ?? [];
}

export function tokenizarOriginal(texto: string): string[] {
    return texto ? (texto.match(PALAVRA) ?? []) : [];
}

function escaparRegex(texto: string): string {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function contemPalavra(textoNormalizado: string, termo: string): boolean {
    const alvo = normalizar(termo).trim();
    if (!alvo) return false;
    return new RegExp(`(?<![\\p{L}\\p{N}])${escaparRegex(alvo)}(?![\\p{L}\\p{N}])`, "u").test(
        textoNormalizado,
    );
}

// Sem fronteira de palavra: é o que caracteriza a menção fraca (parcial).
export function contemSolto(textoNormalizado: string, termo: string): boolean {
    const alvo = normalizar(termo).trim();
    return alvo.length > 0 && textoNormalizado.includes(alvo);
}

// Filtram o fallback de extração, que pega tokens soltos das linhas de requisito.
// prettier-ignore
export const PALAVRAS_VAZIAS = new Set([
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
