import type { ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseGrid } from '../utils/tabela';

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
        if (b.type === 'quote') {
          return <blockquote key={i}>{citacaoInline(b.value)}</blockquote>;
        }
        if (b.type === 'table') {
          return <TabelaBloco key={i} value={b.value} />;
        }
        return (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={md}>
            {b.value}
          </ReactMarkdown>
        );
      })}
    </div>
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
