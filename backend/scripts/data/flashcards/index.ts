// Registro das trilhas que já têm cartões autorados. O seeder varre esta lista.
import type { CartasDaTrilha } from "../../seed-flashcards.ts";
import { logicaDeProgramacao } from "./logica-de-programacao.ts";

export const TRILHAS: CartasDaTrilha[] = [logicaDeProgramacao];
