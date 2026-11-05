// Desliga o 2FA de uma conta, para quem perdeu o celular e os códigos de
// recuperação. Apaga o segredo e os códigos, e encerra as sessões abertas; a
// pessoa entra só com a senha e configura de novo pelo perfil.
//
// Rodar:   docker compose exec -T backend node scripts/desativar-2fa.ts <email>
// Em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/desativar-2fa.ts <email> < /dev/null
import { and, eq } from "drizzle-orm";
import { db } from "../db.ts";
import { tokens, users } from "../schema.ts";
import { doisFatoresService } from "../src/services/doisFatores.service.ts";

async function main() {
    const email = process.argv[2]?.trim().toLowerCase();
    if (!email) {
        console.error("Uso: node scripts/desativar-2fa.ts <email>");
        process.exit(1);
    }

    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (!user) {
        console.error(`Nenhuma conta com o email ${email}.`);
        process.exit(1);
    }

    if (!(await doisFatoresService.ativo(user.id))) {
        console.log(`A conta ${email} não tem 2FA ativo. Nada mudou.`);
        process.exit(0);
    }

    await doisFatoresService.desativar(user.id);
    await db.delete(tokens).where(and(eq(tokens.userId, user.id), eq(tokens.type, "refresh")));
    console.log(`2FA desativado para ${email}, e as sessões abertas foram encerradas.`);
    process.exit(0);
}

main().catch((e) => {
    console.error("Falha ao desativar o 2FA:", e);
    process.exit(1);
});
