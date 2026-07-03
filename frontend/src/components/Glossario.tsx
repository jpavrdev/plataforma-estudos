import { Children, useState, type ReactNode } from 'react';
import { GLOSSARIO } from '../data/glossario';

const DEFS = new Map(GLOSSARIO.map((g) => [g.termo, g.definicao]));
// Termos maiores primeiro para o casamento preferir o mais específico.
const TERMOS = GLOSSARIO.map((g) => g.termo).sort((a, b) => b.length - a.length);
const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const REGEX = new RegExp(`\\b(${TERMOS.map(escapar).join('|')})\\b`, 'g');

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

// Marca a primeira ocorrência de cada termo no texto. Termos já usados na aula
// (no set compartilhado) ficam como texto normal, para não poluir.
function marcarTexto(texto: string, usados: Set<string>): ReactNode {
  REGEX.lastIndex = 0;
  const out: ReactNode[] = [];
  let ultimo = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = REGEX.exec(texto)) !== null) {
    const termo = m[0];
    const definicao = DEFS.get(termo);
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
// O set de usados é local a cada chamada (parágrafo), então é uma função pura: não
// depende de estado mutado durante o render, o que evita o bug com o StrictMode.
export function glossariar(children: ReactNode): ReactNode {
  const usados = new Set<string>();
  return Children.map(children, (child) =>
    typeof child === 'string' ? marcarTexto(child, usados) : child,
  );
}
