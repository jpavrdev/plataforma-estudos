import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Check, X, Alert, Info, Zap, DocLines, Redo, Star } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { NAV_PRINCIPAL as NAV } from '../../data/nav';
import {
  analisarCurriculo,
  listarAnalises,
  obterAnalise,
  obterStatusCurriculo,
  type Analise,
  type Prioridade,
  type ResumoAnalise,
  type StatusCurriculo,
  type Tom,
} from '../../services/curriculo';

const MAX_PDF = 5 * 1024 * 1024;
const MIN_VAGA = 120;

const ROTULO_PRIORIDADE: Record<Prioridade, string> = {
  alta: 'Prioridade alta',
  media: 'Média',
  baixa: 'Refinamento',
};

// A análise com IA passa de um minuto e meio, e uma barra parada nesse tempo
// passa a impressão de travamento.
const ETAPAS = [
  'Lendo o PDF do currículo...',
  'Extraindo as palavras-chave da vaga...',
  'Comparando com o seu currículo...',
  'Procurando o que você fez mas não nomeou...',
  'Montando as sugestões...',
];
const SEGUNDOS_POR_ETAPA = 22;

function corDaNota(score: number): string {
  if (score >= 80) return 'var(--success)';
  if (score >= 60) return 'var(--gold)';
  if (score >= 40) return 'var(--bronze)';
  return 'var(--av-red)';
}

function classeTom(tom: Tom): string {
  return tom === 'bom'
    ? 'cur__tom--bom'
    : tom === 'atencao'
      ? 'cur__tom--atencao'
      : 'cur__tom--ruim';
}

function lerArquivo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'));
    reader.readAsDataURL(file);
  });
}

function Anel({ score }: { score: number }) {
  const raio = 78;
  const volta = 2 * Math.PI * raio;
  return (
    <div className="cur__anel">
      <svg viewBox="0 0 180 180" role="img" aria-label={`Nota ${score} de 100`}>
        <circle className="cur__anel-trilho" cx="90" cy="90" r={raio} />
        <circle
          className="cur__anel-valor"
          cx="90"
          cy="90"
          r={raio}
          stroke={corDaNota(score)}
          strokeDasharray={`${(score / 100) * volta} ${volta}`}
        />
      </svg>
      <div className="cur__anel-texto">
        <strong style={{ color: corDaNota(score) }}>{score}</strong>
        <span>de 100</span>
      </div>
    </div>
  );
}

export function Curriculo() {
  const { user: authUser } = useAuth();
  const [status, setStatus] = useState<StatusCurriculo | null>(null);
  const [historico, setHistorico] = useState<ResumoAnalise[]>([]);
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [tituloVaga, setTituloVaga] = useState('');
  const [vaga, setVaga] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [analisando, setAnalisando] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const [erro, setErro] = useState('');
  const inputPdf = useRef<HTMLInputElement>(null);

  const displayName = authUser?.name ?? '';
  const initials = getInitials(displayName || 'A');

  useEffect(() => {
    void carregar();
  }, []);

  useEffect(() => {
    if (!analisando) return;
    const t = setInterval(
      () => setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1)),
      SEGUNDOS_POR_ETAPA * 1000,
    );
    return () => clearInterval(t);
  }, [analisando]);

  async function carregar() {
    try {
      const s = await obterStatusCurriculo();
      setStatus(s);
      if (s.liberado) setHistorico(await listarAnalises());
    } catch (e) {
      console.error('Falha ao carregar o analisador de currículo:', e);
    }
  }

  function escolherArquivo(file: File | undefined) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErro('O currículo precisa estar em PDF.');
      return;
    }
    if (file.size > MAX_PDF) {
      setErro('O PDF passa de 5 MB. Exporte o currículo com menos imagens.');
      return;
    }
    setErro('');
    setArquivo(file);
  }

  async function analisar() {
    if (analisando || !arquivo) return;
    setErro('');
    setEtapa(0);
    setAnalisando(true);
    try {
      const pdf = await lerArquivo(arquivo);
      const resultado = await analisarCurriculo({
        vaga,
        tituloVaga: tituloVaga.trim() || undefined,
        pdf,
      });
      setAnalise(resultado);
      void carregar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      const resposta = e as { response?: { data?: { erro?: string; message?: string } } };
      setErro(
        resposta.response?.data?.erro ??
          resposta.response?.data?.message ??
          'Não foi possível analisar agora. Tente de novo em instantes.',
      );
      console.error('Falha ao analisar o currículo:', e);
    } finally {
      setAnalisando(false);
    }
  }

  async function abrirAnalise(id: string) {
    try {
      setAnalise(await obterAnalise(id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error('Falha ao abrir a análise:', e);
    }
  }

  function novaAnalise() {
    setAnalise(null);
    setArquivo(null);
    setErro('');
    if (inputPdf.current) inputPdf.current.value = '';
  }

  const vagaCurta = vaga.trim().length < MIN_VAGA;

  return (
    <div className="home-shell">
      <div className="home">
        <header className="topbar">
          <MobileMenu />
          <Logo variant="solid" size={20} to="/home" />
          <nav className="nav">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="nav__item">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="topbar__spacer" />
          <div className="streak-pill">
            <Flame size={16} /> {authUser?.streak ?? 0}
          </div>
          <ThemeToggle inline />
          <UserMenu
            initials={initials}
            level={authUser?.level ?? 1}
            name={displayName}
            email={authUser?.email}
          />
        </header>

        <div className="cur">
          <div className="cur__cabecalho">
            <div>
              <h1 className="cur__titulo">Analisador de currículo</h1>
              <p className="cur__sub">
                Cole a descrição da vaga, envie seu currículo em PDF e veja a nota de
                compatibilidade com ATS, as palavras-chave que faltam e o que ajustar antes de se
                candidatar.
              </p>
            </div>
            {status?.liberado && (
              <div className="cur__cota">
                <strong>{status.restantes}</strong>
                <span>
                  {status.restantes === 1 ? 'análise restante' : 'análises restantes'}
                  <br />
                  nos últimos 30 dias
                </span>
              </div>
            )}
          </div>

          {status && !status.liberado && (
            <div className="card cur__paywall">
              <span className="cur__paywall-icone">
                <Star size={18} />
              </span>
              <div>
                <h2>A análise de currículo é um benefício de apoiador</h2>
                <p>
                  Por R$ 5 por mês você libera o analisador e ajuda a manter a plataforma inteira de
                  graça para todo mundo.
                </p>
              </div>
              <Link className="btn btn--accent" to="/apoie">
                Quero apoiar
              </Link>
            </div>
          )}

          {erro && <div className="auth__alert">{erro}</div>}

          {status?.liberado && !analise && (
            <div className="card cur__form">
              <label className="cur__campo">
                <span className="cur__rotulo">Título da vaga (opcional)</span>
                <input
                  className="input"
                  value={tituloVaga}
                  maxLength={160}
                  placeholder="Back-end Pleno na Nubank"
                  onChange={(e) => setTituloVaga(e.target.value)}
                />
                <span className="cur__dica">Só para você reconhecer a análise no histórico.</span>
              </label>

              <label className="cur__campo">
                <span className="cur__rotulo">Descrição da vaga</span>
                <textarea
                  className="input cur__textarea"
                  value={vaga}
                  rows={12}
                  placeholder="Cole aqui a vaga inteira: requisitos, diferenciais e responsabilidades."
                  onChange={(e) => setVaga(e.target.value)}
                />
                <span className="cur__dica">
                  {vagaCurta
                    ? `Faltam ${MIN_VAGA - vaga.trim().length} caracteres. Quanto mais completa a vaga, melhor a análise.`
                    : `${vaga.trim().length} caracteres`}
                </span>
              </label>

              <div className="cur__campo">
                <span className="cur__rotulo">Seu currículo em PDF</span>
                <input
                  ref={inputPdf}
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => escolherArquivo(e.target.files?.[0])}
                />
                <button
                  type="button"
                  className={`cur__dropzone${arquivo ? ' cur__dropzone--ok' : ''}`}
                  onClick={() => inputPdf.current?.click()}
                >
                  <DocLines size={22} />
                  {arquivo ? (
                    <>
                      <strong>{arquivo.name}</strong>
                      <span>{(arquivo.size / 1024).toFixed(0)} KB · clique para trocar</span>
                    </>
                  ) : (
                    <>
                      <strong>Escolher arquivo</strong>
                      <span>PDF de texto, até 5 MB</span>
                    </>
                  )}
                </button>
                <span className="cur__dica">
                  Precisa ser um PDF exportado como texto. Currículo escaneado ou print não dá para
                  ler.
                </span>
              </div>

              <button
                className="btn btn--accent btn--block"
                onClick={analisar}
                disabled={analisando || !arquivo || vagaCurta}
                aria-busy={analisando}
              >
                {analisando ? (
                  <>
                    <span className="cur__girando" aria-hidden="true" />
                    {ETAPAS[etapa]}
                  </>
                ) : (
                  'Analisar currículo'
                )}
              </button>
              {analisando && (
                <p className="cur__espera">
                  A análise costuma levar perto de dois minutos. Pode deixar a aba aberta.
                </p>
              )}
            </div>
          )}

          {analise && (
            <div className="cur__resultado">
              <aside className="card cur__placar">
                <Anel score={analise.score} />
                <h2 style={{ color: corDaNota(analise.score) }}>{analise.veredito}</h2>
                <p>{analise.descricao}</p>
                <hr className="rule" />
                <div className="cur__resumo">
                  {analise.resumo.map((item) => (
                    <div key={item.rotulo} className="cur__resumo-item">
                      <span>{item.rotulo}</span>
                      <strong className={classeTom(item.tom)}>{item.valor}</strong>
                    </div>
                  ))}
                </div>
                <button className="btn btn--ghost btn--block" onClick={novaAnalise}>
                  <Redo size={15} /> Analisar outro currículo
                </button>
              </aside>

              <div className="cur__colunas">
                <section className="card">
                  <h3 className="cur__secao">Compatibilidade por seção</h3>
                  {analise.detalhe.map((item) => (
                    <div key={item.rotulo} className="cur__barra">
                      <div className="cur__barra-topo">
                        <span>{item.rotulo}</span>
                        <strong style={{ color: corDaNota(item.pct) }}>{item.pct}%</strong>
                      </div>
                      <div className="cur__barra-trilho">
                        <div
                          className="cur__barra-valor"
                          style={{ width: `${item.pct}%`, background: corDaNota(item.pct) }}
                        />
                      </div>
                    </div>
                  ))}
                </section>

                <section className="card">
                  <h3 className="cur__secao">
                    Palavras-chave
                    <span className="cur__secao-nota">
                      {analise.encontradas.length}/
                      {analise.encontradas.length +
                        analise.parciais.length +
                        analise.ausentes.length}{' '}
                      encontradas
                    </span>
                  </h3>
                  <GrupoPalavras titulo="Encontradas" tipo="ok" termos={analise.encontradas} />
                  <GrupoPalavras titulo="Vagas" tipo="parcial" termos={analise.parciais} />
                  <GrupoPalavras titulo="Ausentes" tipo="fora" termos={analise.ausentes} />
                </section>

                <section className="card">
                  <h3 className="cur__secao">
                    O que ajustar
                    {analise.motor === 'ia' && (
                      <span className="cur__selo-ia">Revisado por IA</span>
                    )}
                  </h3>
                  {analise.sugestoes.map((s) => (
                    <article
                      key={s.titulo}
                      className={`cur__sugestao cur__sugestao--${s.prioridade}`}
                    >
                      <span className="cur__sugestao-icone">
                        {s.prioridade === 'alta' ? (
                          <Alert size={16} />
                        ) : s.prioridade === 'media' ? (
                          <Zap size={16} />
                        ) : (
                          <Info size={16} />
                        )}
                      </span>
                      <div>
                        <h4>
                          {s.titulo}
                          <span className="cur__prioridade">{ROTULO_PRIORIDADE[s.prioridade]}</span>
                        </h4>
                        <p>{s.texto}</p>
                      </div>
                    </article>
                  ))}
                </section>
              </div>
            </div>
          )}

          {status?.liberado && historico.length > 0 && (
            <section className="card cur__historico">
              <h3 className="cur__secao">Análises anteriores</h3>
              <div className="cur__historico-lista">
                {historico.map((h) => (
                  <button
                    key={h.id}
                    className="cur__historico-item"
                    onClick={() => abrirAnalise(h.id)}
                  >
                    <strong style={{ color: corDaNota(h.score) }}>{h.score}</strong>
                    <span className="cur__historico-vaga">
                      {h.tituloVaga || 'Vaga sem título'}
                      <small>
                        {new Date(h.criadaEm).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </small>
                    </span>
                    <span className="cur__historico-veredito">{h.veredito}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function GrupoPalavras({
  titulo,
  tipo,
  termos,
}: {
  titulo: string;
  tipo: 'ok' | 'parcial' | 'fora';
  termos: string[];
}) {
  if (termos.length === 0) return null;
  return (
    <div className="cur__grupo">
      <div className={`cur__grupo-titulo cur__grupo-titulo--${tipo}`}>
        {titulo} <span>{termos.length}</span>
      </div>
      <div className="cur__chips">
        {termos.map((t) => (
          <span key={t} className={`cur__chip cur__chip--${tipo}`}>
            {tipo === 'ok' ? <Check size={12} /> : tipo === 'fora' ? <X size={12} /> : null}
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
