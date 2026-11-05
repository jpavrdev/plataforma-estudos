// Turns off 2FA for one account, for someone who lost both the phone and the
// recovery codes. Deletes the secret and the codes and ends the open sessions;
// the person signs in with the password only and sets 2FA up again.
//
// Run:     docker compose exec -T backend node scripts/disable-2fa.ts <email>
// In prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/disable-2fa.ts <email> < /dev/null
import { and, eq } from "drizzle-orm";
import { db } from "../db.ts";
import { tokens, users } from "../schema.ts";
import { twoFactorService } from "../src/services/twoFactor.service.ts";

async function main() {
    const email = process.argv[2]?.trim().toLowerCase();
    if (!email) {
        console.error("Usage: node scripts/disable-2fa.ts <email>");
        process.exit(1);
    }

    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (!user) {
        console.error(`No account with the email ${email}.`);
        process.exit(1);
    }

    if (!(await twoFactorService.isEnabled(user.id))) {
        console.log(`The account ${email} does not have 2FA enabled. Nothing changed.`);
        process.exit(0);
    }

    await twoFactorService.disable(user.id);
    await db.delete(tokens).where(and(eq(tokens.userId, user.id), eq(tokens.type, "refresh")));
    console.log(`2FA disabled for ${email}, and its open sessions were ended.`);
    process.exit(0);
}

main().catch((e) => {
    console.error("Failed to disable 2FA:", e);
    process.exit(1);
});
