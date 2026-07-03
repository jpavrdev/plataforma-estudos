import { Children, useState, type ReactNode } from 'react';
import type { TermoGlossario } from '../services/glossario';

export interface Matcher {
  regex: RegExp | null;
  defs: Map<string, string>;
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Monta o regex e o mapa de definições a partir do glossário buscado do backend.
// Termos maiores primeiro para o casamento preferir o mais específico.
export function criarMatcher(glossario: TermoGlossario[]): Matcher {
  const defs = new Map(glossario.map((g) => [g.term, g.definition]));
  const termos = glossario.map((g) => g.term).sort((a, b) => b.length - a.length);
  const regex = termos.length ? new RegExp(`\\b(${termos.map(escapar).join('|')})\\b`, 'g') : null;
  return { regex, defs };
}

// Termo com sublinhado pontilhado e a definição num tooltip. Abre no hover (desktop)
// ou no toque/foco (mobile).
function TermoDestacado({ termo, definicao }: { termo: string; definicao: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <span
      className={`glossario${aberto ? ' glossario--aberto' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={`${termo}: ${definicao}`}
      onClick={(e) => {
        e.stopPropagation();
        setAberto((v) => !v);
      }}
      onBlur={() => setAberto(false)}
    >
      {termo}
      <span className="glossario__pop" role="tooltip">
        <b>{termo}</b>
        {definicao}
      </span>
    </span>
  );
}

// Marca a primeira ocorrência de cada termo no parágrafo (palavra inteira, respeitando
// maiúsculas). Termos já usados no parágrafo ficam como texto normal, para não poluir.
function marcarTexto(texto: string, matcher: Matcher, usados: Set<string>): ReactNode {
  const { regex, defs } = matcher;
  if (!regex) return texto;
  regex.lastIndex = 0;
  const out: ReactNode[] = [];
  let ultimo = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(texto)) !== null) {
    const termo = m[0];
    const definicao = defs.get(termo);
    if (!definicao || usados.has(termo)) continue;
    if (m.index > ultimo) out.push(texto.slice(ultimo, m.index));
    out.push(<TermoDestacado key={k++} termo={termo} definicao={definicao} />);
    usados.add(termo);
    ultimo = m.index + termo.length;
  }
  if (out.length === 0) return texto;
  if (ultimo < texto.length) out.push(texto.slice(ultimo));
  return out;
}

// Aplica o glossário aos filhos que são texto puro (não mexe em negrito, código, etc.).
// O set de usados é local a cada chamada (parágrafo), então é uma função pura, segura
// no StrictMode: não depende de estado mutado durante o render.
export function glossariar(children: ReactNode, matcher: Matcher): ReactNode {
  if (!matcher.regex) return children;
  const usados = new Set<string>();
  return Children.map(children, (child) =>
    typeof child === 'string' ? marcarTexto(child, matcher, usados) : child,
  );
}
