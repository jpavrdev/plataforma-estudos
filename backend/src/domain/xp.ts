// Regras de pontuação. Fonte única de XP e nível: /me, ranking e conquistas derivam daqui.
export const XP_POR_AULA = 50;
export const XP_POR_QUESTAO = 10;
export const XP_POR_NIVEL = 500;

export function calcularXp({ aulas, questoes }: { aulas: number; questoes: number }): number {
    return aulas * XP_POR_AULA + questoes * XP_POR_QUESTAO;
}

export function nivelPorXp(xp: number): number {
    return Math.floor(xp / XP_POR_NIVEL) + 1;
}
