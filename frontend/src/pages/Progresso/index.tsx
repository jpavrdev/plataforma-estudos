import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  Flame,
  Zap,
  Check,
  ClockExam,
  ChevronUp,
  Plus,
  Lock,
  IconeConquista,
} from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { tempoRelativo } from '../../utils/tempo';
import { NAV_PRINCIPAL as NAV } from '../../data/nav';
import {
  obterProgresso,
  definirMetaSemanal,
  limparMetaSemanal,
  type PeriodoProgresso,
  type ProgressoData,
} from '../../services/progresso';
import { obterMinhasConquistas, type MinhaConquista } from '../../services/trails';

const PERIODOS: { valor: PeriodoProgresso; label: string; apoiador?: boolean }[] = [
  { valor: '7', label: '7 dias' },
  { valor: '30', label: '30 dias' },
  { valor: '90', label: '90 dias', apoiador: true },
  { valor: '365', label: '12 meses', apoiador: true },
  { valor: 'tudo', label: 'Tudo' },
];

const DIA_LETRA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const LEVEL_HUE: Record<string, string> = {
  iniciante: '#2D6BF5',
  intermediario: '#2E9E6B',
  avancado: '#D9536B',
};

function glyphDoNome(name: string): string {
  const limpo = name.replace(/[^A-Za-zÀ-ú ]/g, '').trim();
  const partes = limpo.split(/\s+/).slice(0, 2);
  return partes.map((p) => p[0]?.toUpperCase() ?? '').join('') || '{}';
}

function formatHoras(min: number): string {
  if (min < 60) return `${min}min`;
  return `${Math.round(min / 60)}h`;
}

// Diferença entre o período atual e o anterior, com sinal (ex.: "+120", "-2h").
function deltaTexto(atual: number, anterior: number | null, horas = false): string | null {
  if (anterior === null) return null;
  const dif = atual - anterior;
  if (dif === 0) return null;
  const valor = horas ? formatHoras(Math.abs(dif)) : String(Math.abs(dif));
  return `${dif > 0 ? '+' : '-'}${valor}`;
}

// Variação percentual (ex.: "+18%"); com base zero cai no valor absoluto.
function deltaPercentual(atual: number, anterior: number | null): string | null {
  if (anterior === null) return null;
  if (anterior === 0) return deltaTexto(atual, anterior);
  const pct = Math.round(((atual - anterior) / anterior) * 100);
  if (pct === 0) return null;
  return `${pct > 0 ? '+' : '-'}${Math.abs(pct)}%`;
}

export function Progresso() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<PeriodoProgresso>('30');
  const [dados, setDados] = useState<ProgressoData | null>(null);
  const [conquistas, setConquistas] = useState<MinhaConquista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [metaModal, setMetaModal] = useState(false);
  const [metaKind, setMetaKind] = useState<'aulas' | 'dias'>('aulas');
  const [metaTarget, setMetaTarget] = useState('2');
  const [salvandoMeta, setSalvandoMeta] = useState(false);

  useEffect(() => {
    obterMinhasConquistas()
      .then(setConquistas)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    obterProgresso(periodo)
      .then((d) => {
        if (ativo) setDados(d);
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar seu progresso.');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [periodo]);

  const displayName = authUser?.name ?? '';
  const initials = getInitials(displayName || 'A');

  const ganhas = useMemo(
    () =>
      conquistas
        .filter((c) => c.earned && c.earnedAt)
        .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
        .slice(0, 4),
    [conquistas],
  );

  // Grade do heatmap: 52 semanas terminando hoje, colunas de domingo a sábado.
  const heat = useMemo(() => {
    if (!dados) return null;
    const porDia = new Map(dados.heatmap.map((h) => [h.d, h.n]));
    const hoje = new Date(dados.hoje + 'T00:00:00Z');
    const fim = new Date(hoje);
    fim.setUTCDate(fim.getUTCDate() + (6 - fim.getUTCDay()));
    const colunas: { d: string; n: number; futuro: boolean }[][] = [];
    const mesPorColuna: string[] = [];
    const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    let mesAnterior = -1;
    for (let s = 51; s >= 0; s--) {
      const celulas: { d: string; n: number; futuro: boolean }[] = [];
      for (let dia = 0; dia < 7; dia++) {
        const dt = new Date(fim);
        dt.setUTCDate(dt.getUTCDate() - s * 7 - (6 - dia));
        const iso = dt.toISOString().slice(0, 10);
        celulas.push({ d: iso, n: porDia.get(iso) ?? 0, futuro: iso > dados.hoje });
      }
      const mes = new Date(celulas[0].d + 'T00:00:00Z').getUTCMonth();
      mesPorColuna.push(mes !== mesAnterior ? MESES[mes] : '');
      mesAnterior = mes;
      colunas.push(celulas);
    }
    return { colunas, mesPorColuna };
  }, [dados]);

  const maxXpDia = dados ? Math.max(1, ...dados.xpPorDia.map((b) => b.xp)) : 1;
  const meta = dados?.metaSemana ?? { tipo: 'padrao' as const, valor: 0, alvo: 7 };
  const metaPct = Math.round((meta.valor / meta.alvo) * 100);
  const anelPerimetro = 2 * Math.PI * 64;
  const faltamMeta = meta.alvo - meta.valor;

  async function recarregarProgresso() {
    try {
      setDados(await obterProgresso(periodo));
    } catch (e) {
      console.error('Falha ao recarregar o progresso:', e);
    }
  }

  function abrirMetaModal() {
    if (dados?.metaSemana.tipo === 'aulas') {
      setMetaKind('aulas');
      setMetaTarget(String(dados.metaSemana.alvoDiario));
    } else if (dados?.metaSemana.tipo === 'dias') {
      setMetaKind('dias');
      setMetaTarget(String(dados.metaSemana.alvo));
    } else {
      setMetaKind('aulas');
      setMetaTarget('2');
    }
    setMetaModal(true);
  }

  async function salvarMeta() {
    const alvo = Number(metaTarget);
    if (!alvo || salvandoMeta) return;
    setSalvandoMeta(true);
    try {
      await definirMetaSemanal(metaKind, alvo);
      setMetaModal(false);
      await recarregarProgresso();
    } catch (e) {
      console.error('Falha ao salvar a meta:', e);
    } finally {
      setSalvandoMeta(false);
    }
  }

  async function removerMeta() {
    if (salvandoMeta) return;
    setSalvandoMeta(true);
    try {
      await limparMetaSemanal();
      setMetaModal(false);
      await recarregarProgresso();
    } catch (e) {
      console.error('Falha ao remover a meta:', e);
    } finally {
      setSalvandoMeta(false);
    }
  }

  const nivelHeat = (n: number): number => (n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : 3);

  function dataBr(iso: string) {
    const [, m, d] = iso.split('-');
    return `${d}/${m}`;
  }

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

        <div className="prg">
          <div className="prg-head">
            <div>
              <h1 className="prg-head__title">Meu progresso</h1>
              <p className="prg-head__sub">
                Acompanhe sua evolução, constância e domínio em cada trilha.
              </p>
            </div>
            <div className="prg-periodos">
              {PERIODOS.map((p) => {
                const travado = p.apoiador && !authUser?.apoiador;
                return (
                  <button
                    key={p.valor}
                    className={`prg-periodo${p.valor === periodo ? ' prg-periodo--on' : ''}${travado ? ' prg-periodo--lock' : ''}`}
                    title={travado ? 'Exclusivo para apoiadores' : undefined}
                    onClick={() => (travado ? navigate('/apoie') : setPeriodo(p.valor))}
                  >
                    {travado && <Lock size={11} />} {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {erro && <div className="auth__alert">{erro}</div>}
          {carregando && !dados && <p className="track__desc">Carregando progresso...</p>}

          {dados && (
            <>
              <div className="prg-stats">
                <StatCard
                  icon={<Zap size={19} />}
                  valor={dados.xpTotal.toLocaleString('pt-BR')}
                  label="XP total"
                  delta={deltaPercentual(dados.periodo.atual.xp, dados.periodo.anterior?.xp ?? null)}
                />
                <StatCard
                  icon={<Flame size={19} />}
                  valor={`${dados.streakAtual} ${dados.streakAtual === 1 ? 'dia' : 'dias'}`}
                  label="Streak atual"
                  extra={`recorde ${dados.streakRecorde}d`}
                />
                <StatCard
                  icon={<Check size={17} />}
                  valor={String(dados.periodo.atual.exercicios)}
                  label={
                    dados.periodo.dias
                      ? `Exercícios em ${dados.periodo.dias === 365 ? '12 meses' : `${dados.periodo.dias} dias`}`
                      : 'Exercícios'
                  }
                  delta={
                    dados.periodo.anterior
                      ? deltaTexto(
                          dados.periodo.atual.exercicios,
                          dados.periodo.anterior.exercicios,
                        )
                      : null
                  }
                />
                <StatCard
                  icon={<ClockExam size={19} />}
                  valor={formatHoras(dados.periodo.atual.minutos)}
                  label={
                    dados.periodo.dias
                      ? `Estudo em ${dados.periodo.dias === 365 ? '12 meses' : `${dados.periodo.dias} dias`}`
                      : 'Tempo de estudo'
                  }
                  delta={
                    dados.periodo.anterior
                      ? deltaTexto(dados.periodo.atual.minutos, dados.periodo.anterior.minutos, true)
                      : null
                  }
                />
              </div>

              <div className="prg-linha1">
                <div className="card prg-chart">
                  <div className="prg-chart__head">
                    <div>
                      <div className="prg-card__title">XP conquistado</div>
                      <div className="prg-card__sub">Últimas 2 semanas</div>
                    </div>
                    <div className="prg-chart__total">
                      <div className="prg-chart__num">
                        {dados.xpPorDia.reduce((s, b) => s + b.xp, 0).toLocaleString('pt-BR')}
                      </div>
                      <div className="prg-card__sub">XP no período</div>
                    </div>
                  </div>
                  <div className="prg-bars">
                    {dados.xpPorDia.map((b, i) => (
                      <div key={b.d} className="prg-bar" title={`${b.xp} XP em ${dataBr(b.d)}`}>
                        <div
                          className={`prg-bar__fill${i >= dados.xpPorDia.length - 3 ? ' prg-bar__fill--on' : ''}`}
                          style={{ height: `${Math.round((b.xp / maxXpDia) * 100)}%` }}
                        />
                        <span className="prg-bar__label">
                          {DIA_LETRA[new Date(b.d + 'T00:00:00Z').getUTCDay()]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card prg-meta">
                  <div className="prg-meta__topo">
                    <div>
                      <div className="prg-card__title">Meta semanal</div>
                      {meta.tipo !== 'padrao' && (
                        <div className="prg-card__sub">
                          {meta.tipo === 'aulas'
                            ? `${meta.alvoDiario} ${meta.alvoDiario === 1 ? 'aula' : 'aulas'} por dia`
                            : `${meta.alvo} dias seguidos`}
                        </div>
                      )}
                    </div>
                    <button
                      className="prg-plus"
                      onClick={abrirMetaModal}
                      aria-label="Definir meta semanal"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="prg-meta__anel">
                    <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="75" cy="75" r="64" fill="none" stroke="var(--surface-2)" strokeWidth="14" />
                      <circle
                        cx="75"
                        cy="75"
                        r="64"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="14"
                        strokeLinecap="round"
                        strokeDasharray={anelPerimetro}
                        strokeDashoffset={anelPerimetro * (1 - Math.min(1, meta.valor / meta.alvo))}
                      />
                    </svg>
                    <div className="prg-meta__centro">
                      <div className="prg-meta__pct">{metaPct}%</div>
                      <div className="prg-card__sub">
                        {meta.valor} de {meta.alvo} dias
                      </div>
                    </div>
                  </div>
                  <p className="prg-meta__msg">
                    {meta.valor >= meta.alvo ? (
                      <>
                        Meta batida! <b>{meta.alvo} de {meta.alvo} dias</b>. Continue assim!
                      </>
                    ) : (
                      <>
                        {faltamMeta === 1 ? 'Falta' : 'Faltam'}{' '}
                        <b>
                          {faltamMeta} {faltamMeta === 1 ? 'dia' : 'dias'}
                          {meta.tipo === 'dias' ? ' seguidos' : ''}
                        </b>{' '}
                        para bater sua meta. Você consegue!
                      </>
                    )}
                  </p>
                </div>
              </div>

              {heat && (
                <div className="card prg-heat">
                  <div className="prg-heat__head">
                    <div className="prg-card__title">
                      {dados.aulasAno.toLocaleString('pt-BR')}{' '}
                      {dados.aulasAno === 1 ? 'aula concluída' : 'aulas concluídas'} no último ano
                    </div>
                  </div>
                  <div className="prg-heat__corpo">
                    <div className="prg-heat__dias">
                      {['', 'Seg', '', 'Qua', '', 'Sex', ''].map((d, i) => (
                        <div key={i} className="prg-heat__dia">
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="prg-heat__grade-wrap">
                      <div className="prg-heat__meses">
                        {heat.mesPorColuna.map((m, i) => (
                          <div key={i} className="prg-heat__mes">
                            {m}
                          </div>
                        ))}
                      </div>
                      <div className="prg-heat__grade">
                        {heat.colunas.map((col, i) => (
                          <div key={i} className="prg-heat__col">
                            {col.map((c) => (
                              <span
                                key={c.d}
                                className={`prg-cel prg-cel--${nivelHeat(c.n)}${c.futuro ? ' prg-cel--futuro' : ''}`}
                                title={
                                  c.futuro
                                    ? undefined
                                    : c.n === 0
                                      ? `Nenhuma aula em ${dataBr(c.d)}`
                                      : `${c.n} ${c.n === 1 ? 'aula' : 'aulas'} em ${dataBr(c.d)}`
                                }
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="prg-heat__foot">
                    <span>Cada quadrado é um dia: quanto mais aulas concluídas, mais forte o tom.</span>
                    <div className="prg-heat__legenda">
                      menos
                      <span className="prg-cel prg-cel--0" />
                      <span className="prg-cel prg-cel--1" />
                      <span className="prg-cel prg-cel--2" />
                      <span className="prg-cel prg-cel--3" />
                      mais
                    </div>
                  </div>
                </div>
              )}

              <div className="prg-linha3">
                <div className="card">
                  <div className="prg-card__title prg-card__title--mb">Domínio por trilha</div>
                  {dados.dominio.length === 0 ? (
                    <p className="track__desc">
                      Responda os quizzes de uma trilha para acompanhar seu domínio aqui.
                    </p>
                  ) : (
                    <div className="prg-skills">
                      {dados.dominio.map((t) => {
                        const hue = LEVEL_HUE[t.trailLevel] ?? 'var(--accent)';
                        return (
                          <Link
                            key={t.trailId}
                            to={`/trilhas/${t.trailId}`}
                            className="prg-skill"
                            title={`${t.acertos} de ${t.total} questões acertadas`}
                          >
                            <div className="prg-skill__head">
                              <span
                                className="prg-skill__glyph"
                                style={{
                                  color: hue,
                                  background: `color-mix(in srgb, ${hue} 16%, transparent)`,
                                }}
                              >
                                {glyphDoNome(t.name)}
                              </span>
                              <span className="prg-skill__nome">{t.name}</span>
                              <span className="prg-skill__pct" style={{ color: hue }}>
                                {t.pct}%
                              </span>
                            </div>
                            <div className="prg-skill__track">
                              <div
                                className="prg-skill__fill"
                                style={{ background: hue, width: `${t.pct}%` }}
                              />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="card">
                  <div className="prg-conq__head">
                    <div className="prg-card__title">Conquistas recentes</div>
                    <Link className="link" to="/conquistas">
                      Ver todas
                    </Link>
                  </div>
                  {ganhas.length === 0 ? (
                    <p className="track__desc">Nenhuma conquista desbloqueada ainda.</p>
                  ) : (
                    <div className="prg-conqs">
                      {ganhas.map((c) => (
                        <div key={c.id} className="prg-conq">
                          <span className="prg-conq__icone">
                            <IconeConquista chave={c.icon} size={20} />
                          </span>
                          <div className="prg-conq__corpo">
                            <div className="prg-conq__nome">{c.name}</div>
                            <div className="prg-card__sub">{c.description}</div>
                          </div>
                          <span className="prg-conq__quando">{tempoRelativo(c.earnedAt!)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {metaModal && (
          <div className="cmn-overlay">
            <div className="cmn-card">
              <div className="cmn-card__kicker">Meta semanal</div>
              <h3 className="cmn-card__title">Definir sua meta</h3>
              <div className="prg-meta-tipos">
                <button
                  className={`prg-meta-tipo${metaKind === 'aulas' ? ' prg-meta-tipo--on' : ''}`}
                  onClick={() => {
                    setMetaKind('aulas');
                    setMetaTarget('2');
                  }}
                >
                  Aulas por dia
                </button>
                <button
                  className={`prg-meta-tipo${metaKind === 'dias' ? ' prg-meta-tipo--on' : ''}`}
                  onClick={() => {
                    setMetaKind('dias');
                    setMetaTarget('7');
                  }}
                >
                  Dias seguidos
                </button>
              </div>
              <p className="cmn-card__msg">
                {metaKind === 'aulas'
                  ? 'Quantas aulas você quer concluir por dia? O anel mostra em quantos dos últimos 7 dias você cumpriu.'
                  : 'Quantos dias seguidos de atividade você quer manter? O anel acompanha seu streak até a meta.'}
              </p>
              <input
                className="cmn-texto"
                style={{ resize: 'none' }}
                type="number"
                min={metaKind === 'aulas' ? 1 : 2}
                max={metaKind === 'aulas' ? 20 : 60}
                value={metaTarget}
                onChange={(e) => setMetaTarget(e.target.value)}
              />
              <div className="cmn-card__row">
                <button className="btn btn--ghost" onClick={() => setMetaModal(false)}>
                  Cancelar
                </button>
                <button
                  className="btn btn--accent"
                  onClick={salvarMeta}
                  disabled={!Number(metaTarget) || salvandoMeta}
                >
                  {salvandoMeta ? 'Salvando...' : 'Salvar meta'}
                </button>
              </div>
              {dados?.metaSemana.tipo !== 'padrao' && (
                <p className="prg-meta__reset">
                  <button className="link link--btn" onClick={removerMeta}>
                    Voltar à meta padrão (7 dias ativos)
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  valor,
  label,
  delta,
  extra,
}: {
  icon: ReactNode;
  valor: string;
  label: string;
  delta?: string | null;
  extra?: string;
}) {
  return (
    <div className="card prg-stat">
      <div className="prg-stat__topo">
        <span className="prg-stat__icone">{icon}</span>
        {delta && (
          <span className={`prg-stat__delta${delta.startsWith('-') ? ' prg-stat__delta--down' : ''}`}>
            <ChevronUp size={12} />
            {delta.replace('-', '')}
          </span>
        )}
        {!delta && extra && <span className="prg-stat__extra">{extra}</span>}
      </div>
      <div className="prg-stat__valor">{valor}</div>
      <div className="prg-stat__label">{label}</div>
    </div>
  );
}
