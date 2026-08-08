import { useMemo, useRef, lazy, Suspense, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { normalizarFormulasEmBloco, opcoesKatex } from '../utils/katex';

import { parseGrid } from '../utils/tabela';
import { glossariar, criarMatcher } from './Glossario';
import { useGlossario } from '../hooks/useGlossario';

// O xterm pesa, e só as aulas com laboratório precisam dele.
const TerminalLab = lazy(() => import('./TerminalLab').then((m) => ({ default: m.TerminalLab })));

// Bloco genérico de conteúdo (aulas e desafios usam o mesmo formato).
export interface Bloco {
  type: string;
  value: string;
}

// Converte o markdown usando as classes de estilo que já existem no projeto.
export const md: Components = {
  h1: ({ children }) => <h2 className="lesson__h2">{children}</h2>,
  h2: ({ children }) => <h2 className="lesson__h2">{children}</h2>,
  h3: ({ children }) => (
    <h3 className="lesson__h2" style={{ fontSize: 18 }}>
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="lesson__h2" style={{ fontSize: 16 }}>
      {children}
    </h4>
  ),
  p: ({ children }) => <p className="lesson__p">{children}</p>,
  ul: ({ children }) => <ul className="lesson__ul">{children}</ul>,
  ol: ({ children }) => <ol className="lesson__ul">{children}</ol>,
  code: ({ children }) => <code className="code-inline">{children}</code>,
  pre: ({ children }) => (
    <div className="codeblock">
      <div className="codeblock__bar">
        <span className="dot" style={{ background: '#ff5f57' }} />
        <span className="dot" style={{ background: '#febc2e' }} />
        <span className="dot" style={{ background: '#28c840' }} />
      </div>
      <pre className="codeblock__code">{children}</pre>
    </div>
  ),
};

function embedVideo(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return yt ? `https://www.youtube.com/embed/${yt[1]}` : url;
}

// Renderiza negrito (**x**), itálico (_x_) e código (`x`) inline, para os blocos que
// não passam pelo markdown completo (tabela e citação).
function inline(texto: string): ReactNode {
  const re = /\*\*([^*]+?)\*\*|`([^`]+?)`|_([^_]+?)_/g;
  const out: ReactNode[] = [];
  let ultimo = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto)) !== null) {
    if (m.index > ultimo) out.push(texto.slice(ultimo, m.index));
    if (m[1] !== undefined) out.push(<strong key={k++}>{m[1]}</strong>);
    else if (m[2] !== undefined)
      out.push(
        <code key={k++} className="code-inline">
          {m[2]}
        </code>,
      );
    else out.push(<em key={k++}>{m[3]}</em>);
    ultimo = re.lastIndex;
  }
  if (ultimo < texto.length) out.push(texto.slice(ultimo));
  return out;
}

// Citação pode ter várias linhas; preserva as quebras.
function citacaoInline(texto: string): ReactNode {
  return texto.split('\n').map((linha, j) => (
    <span key={j}>
      {j > 0 && <br />}
      {inline(linha)}
    </span>
  ));
}

// Renderiza o conteúdo a partir dos blocos do Estúdio (aulas e enunciados de desafio).
export function BlocosConteudo({ blocks }: { blocks: Bloco[] }) {
  // O glossário vem do backend (cacheado). O matcher fica num ref lido pelos componentes
  // memoizados, então o markdown não remonta quando o glossário carrega, e a marcação é
  // pura (set de usados local por parágrafo), segura no StrictMode.
  const glossario = useGlossario();
  const matcher = useMemo(() => criarMatcher(glossario), [glossario]);
  const matcherRef = useRef(matcher);
  matcherRef.current = matcher;
  const componentes = useMemo<Components>(
    () => ({
      ...md,
      p: ({ children }) => <p className="lesson__p">{glossariar(children, matcherRef.current)}</p>,
      li: ({ children }) => <li>{glossariar(children, matcherRef.current)}</li>,
    }),
    [],
  );
  return (
    <div className="lesson__md">
      {blocks.map((b, i) => {
        if (b.type === 'code') {
          return (
            <div key={i} className="codeblock">
              <div className="codeblock__bar">
                <span className="dot" style={{ background: '#ff5f57' }} />
                <span className="dot" style={{ background: '#febc2e' }} />
                <span className="dot" style={{ background: '#28c840' }} />
              </div>
              <pre className="codeblock__code">{b.value}</pre>
            </div>
          );
        }
        if (b.type === 'image') {
          return b.value ? <img key={i} className="lesson__img" src={b.value} alt="" /> : null;
        }
        if (b.type === 'video') {
          return b.value ? (
            <div key={i} className="lesson__video">
              <iframe
                src={embedVideo(b.value)}
                title="Vídeo"
                allowFullScreen
                style={{ border: 0 }}
              />
            </div>
          ) : null;
        }
        if (b.type === 'terminal') {
          return (
            <Suspense key={i} fallback={<div className="lesson__loading">Carregando...</div>}>
              <TerminalLab />
            </Suspense>
          );
        }
        if (b.type === 'quote') {
          return <blockquote key={i}>{citacaoInline(b.value)}</blockquote>;
        }
        if (b.type === 'table') {
          return <TabelaBloco key={i} value={b.value} />;
        }
        return (
          <ReactMarkdown
            key={i}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[[rehypeKatex, opcoesKatex]]}
            components={componentes}
          >
            {normalizarFormulasEmBloco(b.value)}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}

// Texto curto com fórmulas ($...$ inline, $$...$$ em bloco), para enunciado e opções
// de quiz. Sem <p> para não quebrar o layout inline dos rótulos. Código em cerca
// (```...```) vira bloco com indentação preservada; código inline (`x`) fica inline.
export function TextoMath({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[[rehypeKatex, opcoesKatex]]}
      components={{
        p: ({ children }) => <>{children}</>,
        pre: ({ children }) => (
          <div className="codeblock" style={{ margin: '12px 0' }}>
            <pre className="codeblock__code">{children}</pre>
          </div>
        ),
        code: ({ children }) => {
          const txt = Array.isArray(children) ? children.join('') : String(children ?? '');
          // Multi-linha = bloco (dentro do <pre>, herda o estilo); senão, código inline.
          return txt.includes('\n') ? (
            <code>{children}</code>
          ) : (
            <code className="code-inline">{children}</code>
          );
        },
      }}
    >
      {normalizarFormulasEmBloco(children)}
    </ReactMarkdown>
  );
}

// Renderiza um bloco de tabela. Herda o estilo de .lesson__md table; 1ª linha = cabeçalho.
function TabelaBloco({ value }: { value: string }) {
  const grid = parseGrid(value);
  if (grid.length === 0) return null;
  const [cabecalho, ...corpo] = grid;
  return (
    <table>
      <thead>
        <tr>
          {cabecalho.map((c, j) => (
            <th key={j}>{inline(c)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {corpo.map((linha, i) => (
          <tr key={i}>
            {linha.map((c, j) => (
              <td key={j}>{inline(c)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
