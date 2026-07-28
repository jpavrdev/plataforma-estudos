import argon2 from "argon2";
import bcrypt from "bcrypt";

// Argon2id é o algoritmo recomendado (OWASP) para hash de senha, e é o default do
// node-argon2 (com custo de memória/tempo já fortes). Hashes antigos em bcrypt
// continuam sendo verificados e migram para argon2 no login (rehash transparente),
// então ninguém precisa redefinir a senha por causa da troca.
export async function hashSenha(senha: string): Promise<string> {
    return argon2.hash(senha);
}

export async function verificarSenha(hash: string, senha: string): Promise<boolean> {
    try {
        if (hash.startsWith("$argon2")) return await argon2.verify(hash, senha);
        if (hash.startsWith("$2")) return await bcrypt.compare(senha, hash); // bcrypt legado
        return false;
    } catch {
        return false;
    }
}

// Precisa reescrever o hash? bcrypt antigo (ou formato desconhecido), ou os
// parâmetros do argon2 mudaram desde que ele foi gerado.
export function precisaRehash(hash: string): boolean {
    if (!hash.startsWith("$argon2")) return true;
    try {
        return argon2.needsRehash(hash);
    } catch {
        return true;
    }
}

// Hash "dummy" para o login gastar um tempo parecido quando o usuário não existe
// (mitiga enumeração por timing). Calculado uma vez, sob demanda.
let dummy: Promise<string> | null = null;
export function getDummyHash(): Promise<string> {
    if (!dummy) dummy = hashSenha("uma_senha_qualquer_dummy_para_timing");
    return dummy;
}
