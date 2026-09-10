// Registro dos tópicos de entrevista que já têm perguntas autoradas. O seeder
// varre esta lista, e recusa rodar se sobrar arquivo fora dela.
import type { TopicoDeEntrevista } from "../../seed-entrevista.ts";
import { go } from "./go.ts";
import { csharp } from "./csharp.ts";
import { cpp } from "./cpp.ts";
import { docker } from "./docker.ts";
import { git } from "./git.ts";
import { java } from "./java.ts";
import { react } from "./react.ts";
import { node } from "./node.ts";
import { typescript } from "./typescript.ts";
import { systemDesign } from "./system-design.ts";

export const TOPICOS: TopicoDeEntrevista[] = [
    go,
    csharp,
    cpp,
    docker,
    git,
    java,
    react,
    node,
    typescript,
    systemDesign,
];
