/**
 * Preferências de tela guardadas no navegador.
 *
 * O acesso vai sempre dentro de try: em aba anônima, com dados de site bloqueados
 * ou com a cota estourada, o próprio localStorage lança, e uma preferência de
 * conveniência nunca pode derrubar a página. Sem valor guardado, ou com valor
 * ilegível, volta o padrão.
 *
 * As chaves são limpas no logout junto com o resto, porque o AuthContext chama
 * localStorage.clear(), então a escolha de uma pessoa não aparece para a seguinte.
 */
export function lerPreferencia<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave);
    if (!bruto) return padrao;
    return { ...padrao, ...(JSON.parse(bruto) as Partial<T>) };
  } catch (err) {
    console.error(`Preferência "${chave}" ilegível, usando o padrão.`, err);
    return padrao;
  }
}

export function gravarPreferencia(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (err) {
    console.error(`Não foi possível guardar a preferência "${chave}".`, err);
  }
}
