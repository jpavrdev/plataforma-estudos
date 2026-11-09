import argon2 from "argon2";
import bcrypt from "bcrypt";

// Argon2id is the recommended algorithm (OWASP) for password hashing, and the
// node-argon2 default (with strong memory/time costs). Old bcrypt hashes are still
// verified and move to argon2 at login (transparent rehash), so nobody has to
// reset their password because of the switch.
export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
        if (hash.startsWith("$argon2")) return await argon2.verify(hash, password);
        if (hash.startsWith("$2")) return await bcrypt.compare(password, hash); // legacy bcrypt
        return false;
    } catch (e) {
        console.error("Could not check the password hash", e);
        return false;
    }
}

// Does the hash need rewriting? An old bcrypt one (or an unknown format), or the
// argon2 parameters changed since it was created.
export function needsRehash(hash: string): boolean {
    if (!hash.startsWith("$argon2")) return true;
    try {
        return argon2.needsRehash(hash);
    } catch (e) {
        console.error("Could not read the password hash parameters", e);
        return true;
    }
}

// "Dummy" hash so the login takes a similar time when the user does not exist
// (it mitigates enumeration by timing). Computed once, on demand.
let dummy: Promise<string> | null = null;
export function getDummyHash(): Promise<string> {
    if (!dummy) dummy = hashPassword("uma_senha_qualquer_dummy_para_timing");
    return dummy;
}
