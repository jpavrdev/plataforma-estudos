// Regras de pontuação. Fonte única de XP e nível: /me, ranking e conquistas derivam daqui.
export const XP_POR_AULA = 50;
export const XP_POR_QUESTAO = 10;
export const XP_POR_NIVEL = 500;

// XP de um desafio varia pela dificuldade e é concedido uma vez, na 1ª aprovação.
export const XP_DESAFIO_POR_DIFICULDADE: Record<string, number> = {
    facil: 50,
    medio: 80,
    dificil: 120,
};

export function xpDoDesafio(dificuldade: string): number {
    return XP_DESAFIO_POR_DIFICULDADE[dificuldade] ?? XP_DESAFIO_POR_DIFICULDADE.facil;
}

// desafiosXp já vem somado em XP (não em quantidade), pois cada desafio vale diferente.
export function calcularXp({
    aulas,
    questoes,
    desafiosXp = 0,
}: {
    aulas: number;
    questoes: number;
    desafiosXp?: number;
}): number {
    return aulas * XP_POR_AULA + questoes * XP_POR_QUESTAO + desafiosXp;
}

export function nivelPorXp(xp: number): number {
    return Math.floor(xp / XP_POR_NIVEL) + 1;
}
