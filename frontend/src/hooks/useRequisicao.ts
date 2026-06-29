import { useEffect, useState, type DependencyList } from 'react';

// Encapsula um fetch de dados: cuida de carregando/erro/dados e ignora a resposta
// de requisições antigas. Os setState ficam só nos callbacks async (não dispara
// render em cascata no corpo do efeito).
export function useRequisicao<T>(carregar: () => Promise<T>, deps: DependencyList) {
  const [dados, setDados] = useState<T>();
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let ativo = true;
    carregar()
      .then((d) => {
        if (ativo) {
          setDados(d);
          setErro(false);
        }
      })
      .catch(() => {
        if (ativo) setErro(true);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { dados, carregando, erro, recarregar: () => setTick((t) => t + 1) };
}
