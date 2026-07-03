import { useEffect, useState } from 'react';
import { listarGlossario, type TermoGlossario } from '../services/glossario';

// Cache de módulo: o glossário é buscado uma vez e compartilhado por todas as aulas,
// para não refazer a requisição a cada aula aberta.
let cache: TermoGlossario[] | null = null;
let promessa: Promise<TermoGlossario[]> | null = null;

export function useGlossario(): TermoGlossario[] {
  const [glossario, setGlossario] = useState<TermoGlossario[]>(cache ?? []);
  useEffect(() => {
    if (cache) return;
    if (!promessa) {
      promessa = listarGlossario()
        .then((g) => {
          cache = g;
          return g;
        })
        .catch((e) => {
          console.error('Falha ao carregar o glossário', e);
          promessa = null;
          return [];
        });
    }
    let ativo = true;
    promessa.then((g) => {
      if (ativo) setGlossario(g);
    });
    return () => {
      ativo = false;
    };
  }, []);
  return glossario;
}

// Zera o cache para o glossário ser rebuscado (usado após editar no admin).
export function invalidarGlossario() {
  cache = null;
  promessa = null;
}
