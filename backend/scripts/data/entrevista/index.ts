// Registro dos tópicos de entrevista que já têm perguntas autoradas. O seeder
// varre esta lista, e recusa rodar se sobrar arquivo fora dela.
import type { TopicoDeEntrevista } from "../../seed-entrevista.ts";
import { go } from "./go.ts";
import { csharp } from "./csharp.ts";

export const TOPICOS: TopicoDeEntrevista[] = [go, csharp];
