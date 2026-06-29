import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRequisicao } from '../../hooks/useRequisicao';
import { Logo } from '../../components/Logo';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Avatar } from '../../components/Avatar';
import { Flame, Search, Trophy, Check, Lock, ChevronUp, ChevronDown } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { user as homeUser } from '../../data/home';
import { obterRanking, type RankingResposta, type RankingPeriodo } from '../../services/trails';

const NAV = [
  { label: 'Início', to: '/home' },
  { label: 'Trilhas', to: '/trilhas' },
  { label: 'Ranking', to: '/ranking' },
  { label: 'Comunidade', to: '/comunidade' },
];
const CORES = ['#5B8DEF', '#E0655A', '#2E9E6B', '#E0A82E', '#8B5CF6'];
const MEDAL: Record<number, string> = { 1: 'var(--gold)', 2: 'var(--silver)', 3: 'var(--bronze)' };
const PODIO: Record<number, { size: number; font: number; pedestal: number }> = {
  1: { size: 76, font: 27, pedestal: 132 },
  2: { size: 62, font: 22, pedestal: 104 },
  3: { size: 58, font: 20, pedestal: 88 },
};
const PERIODOS: { label: string; value: RankingPeriodo }[] = [
  { label: 'Semana', value: 'week' },
  { label: 'Mês', value: 'month' },
  { label: 'Geral', value: 'all' },
];
const LIGAS = [
  { name: 'Bronze', color: '#C77B3B', threshold: 0 },
  { name: 'Prata', color: '#A9AEB8', threshold: 1500 },
  { name: 'Ouro', color: '#E0A82E', threshold: 3500 },
  { name: 'Platina', color: '#3FBEC6', threshold: 6000 },
  { name: 'Diamante', color: '#56C5E8', threshold: 10000 },
];

function ligaAtual(totalXp: number): number {
  let idx = 0;
  for (let i = 0; i < LIGAS.length; i++) if (totalXp >= LIGAS[i].threshold) idx = i;
  return idx;
}
const fmtXp = (n: number) => n.toLocaleString('pt-BR');

function Delta({ delta }: { delta: number }) {
  if (delta > 0)
    return (
      <span className="rk-delta rk-delta--up">
        <ChevronUp size={13} />
      </span>
    );
  if (delta < 0)
    return (
      <span className="rk-delta rk-delta--down">
        <ChevronDown size={13} />
      </span>
    );
  return <span className="rk-delta rk-delta--same">–</span>;
}

export function Ranking() {
  const { user: authUser } = useAuth();
  const [period, setPeriod] = useState<RankingPeriodo>('all');
  const { dados: resp, carregando } = useRequisicao(() => obterRanking(period), [period]);
  const dados: RankingResposta = resp ?? { me: null, rows: [] };

  const displayName = authUser?.name ?? homeUser.name;
  const totalXp = dados.me?.totalXp ?? 0;
  const nivel = dados.me?.level ?? 1;
  const ligaIdx = ligaAtual(totalXp);
  const liga = LIGAS[ligaIdx];
  const progresso = (ligaIdx / (LIGAS.length - 1)) * 72 + 14; // % da linha preenchida

  const podio = [dados.rows[1], dados.rows[0], dados.rows[2]]; // [#2, #1, #3]
  const tabela = dados.rows.slice(3);

  return (
    <div className="home-shell">
      <div className="home">
        <header className="topbar">
          <Logo variant="solid" size={20} />
          <nav className="nav">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav__item${item.to === '/ranking' ? ' nav__item--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="topbar__spacer" />
          <div className="searchbar">
            <Search size={16} />
            <span>Buscar exercício…</span>
          </div>
          <div className="streak-pill">
            <Flame size={16} /> {authUser?.streak ?? 0}
          </div>
          <ThemeToggle inline />
          <UserMenu
            initials={getInitials(displayName)}
            level={nivel}
            name={displayName}
            email={authUser?.email}
          />
        </header>

        <div className="rk">
          <div className="rk-head">
            <div>
              <div className="rk-head__title-row">
                <h1 className="rk-title">Ranking global</h1>
                <span className="rk-league-badge">
                  <Trophy size={13} /> Liga {liga.name}
                </span>
              </div>
              <p className="rk-sub">
                Classificação por XP. Resolva exercícios e conclua aulas para subir.
              </p>
            </div>
            <div className="seg">
              {PERIODOS.map((p) => (
                <button
                  key={p.value}
                  className={`seg__item${period === p.value ? ' seg__item--active' : ''}`}
                  onClick={() => setPeriod(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ligas */}
          <div className="leagues">
            <div className="leagues__head">
              <h3 className="card__title">Ligas</h3>
              <span className="leagues__rule">Sua liga depende do XP total acumulado</span>
            </div>
            <div className="leagues__track">
              <span className="leagues__line" />
              <span
                className="leagues__line leagues__line--progress"
                style={{ width: `${progresso}%` }}
              />
              <div className="leagues__grid">
                {LIGAS.map((g, i) => {
                  const done = i < ligaIdx;
                  const current = i === ligaIdx;
                  const locked = i > ligaIdx;
                  return (
                    <div key={g.name} className="league" style={{ opacity: locked ? 0.7 : 1 }}>
                      <div
                        className="league__emblem"
                        style={{
                          background: locked ? 'var(--surface-2)' : g.color,
                          color: locked ? 'var(--muted)' : g.name === 'Ouro' ? '#5a3d00' : '#fff',
                          boxShadow: current
                            ? '0 0 0 4px color-mix(in srgb, var(--accent) 32%, transparent)'
                            : 'none',
                        }}
                      >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2 L19.5 9 L12 22 L4.5 9 Z" opacity=".92" />
                          <path d="M4.5 9 L19.5 9 L12 2 Z" opacity=".6" />
                        </svg>
                        {done && (
                          <span className="league__seal league__seal--done">
                            <Check size={11} />
                          </span>
                        )}
                        {locked && (
                          <span className="league__seal league__seal--lock">
                            <Lock size={10} />
                          </span>
                        )}
                      </div>
                      <div
                        className="league__name"
                        style={{
                          color: locked ? 'var(--muted)' : 'var(--text)',
                          fontWeight: current ? 700 : 600,
                        }}
                      >
                        {g.name}
                      </div>
                      {current ? (
                        <span className="league__here">Você está aqui</span>
                      ) : (
                        <span className="league__xp">{fmtXp(g.threshold)} XP</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pódio */}
          {dados.rows.length > 0 && (
            <div className="podium">
              <span className="podium__glow" />
              <div className="podium__grid">
                {podio.map((p, slot) => {
                  if (!p) return <div className="podium__col" key={slot} />;
                  const meta = PODIO[p.position] ?? PODIO[3];
                  const cor = MEDAL[p.position] ?? 'var(--muted)';
                  return (
                    <div key={p.position} className="podium__col">
                      {p.position === 1 && (
                        <svg
                          className="podium__crown"
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="var(--gold)"
                        >
                          <path d="M3 7l4 4 5-7 5 7 4-4-1.5 12h-15z" />
                        </svg>
                      )}
                      <div className="podium__avatar-wrap">
                        <div
                          className="podium__avatar"
                          style={{
                            width: meta.size,
                            height: meta.size,
                            fontSize: meta.font,
                            background: p.you ? 'var(--accent)' : CORES[p.position % CORES.length],
                            color: '#fff',
                            borderColor: cor,
                          }}
                        >
                          {getInitials(p.name)}
                        </div>
                        <span className="podium__rank" style={{ background: cor }}>
                          {p.position}
                        </span>
                      </div>
                      <div className="podium__name">{p.you ? 'Você' : p.name}</div>
                      <div className="podium__xp">{fmtXp(p.xp)} XP</div>
                      <div
                        className="podium__pedestal"
                        style={{
                          height: meta.pedestal,
                          background: `linear-gradient(180deg, color-mix(in srgb, ${cor} 28%, var(--surface)), color-mix(in srgb, ${cor} 10%, var(--surface)))`,
                          color: `color-mix(in srgb, ${cor} 80%, var(--text))`,
                        }}
                      >
                        {p.position}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sua posição */}
          {dados.me && (
            <div className="rk-you">
              <span className="rk-you__label">Sua posição</span>
              <span className="rk-you__rank">#{dados.me.position}</span>
              <Avatar initials={getInitials(displayName)} background="var(--accent)" />
              <div className="rk-you__id">
                <div className="rk-you__name">Você</div>
                <div className="rk-you__user">@{dados.me.username ?? 'voce'}</div>
              </div>
              {dados.me.delta !== 0 && (
                <span
                  className="rk-you__delta"
                  style={{ color: dados.me.delta > 0 ? 'var(--success)' : 'var(--av-red)' }}
                >
                  {dados.me.delta > 0 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {dados.me.delta > 0 ? 'subiu' : 'caiu'} {Math.abs(dados.me.delta)}{' '}
                  {Math.abs(dados.me.delta) === 1 ? 'posição' : 'posições'}
                </span>
              )}
              <span className="rk-you__streak">
                <Flame size={15} /> {dados.me.streak} dias
              </span>
              <span className="rk-you__xp">{fmtXp(dados.me.xp)} XP</span>
            </div>
          )}

          {/* Tabela */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="rk-table__head">
              <div>#</div>
              <div>Estudante</div>
              <div>Streak</div>
              <div>Nível</div>
              <div className="rk-right">XP</div>
            </div>
            {carregando ? (
              <p className="track__desc" style={{ padding: '18px 20px' }}>
                Carregando ranking...
              </p>
            ) : tabela.length === 0 ? (
              <p className="track__desc" style={{ padding: '18px 20px' }}>
                {dados.rows.length === 0
                  ? 'Ninguém pontuou ainda. Conclua aulas para aparecer aqui.'
                  : 'Sem mais posições por enquanto.'}
              </p>
            ) : (
              tabela.map((r) => (
                <div key={r.position} className={`rk-row${r.you ? ' rk-row--you' : ''}`}>
                  <div className="rk-row__rank">
                    <span style={{ color: MEDAL[r.position] || 'var(--text)' }}>{r.position}</span>
                    <Delta delta={r.delta} />
                  </div>
                  <div className="rk-row__student">
                    <Avatar
                      initials={getInitials(r.name)}
                      background={r.you ? 'var(--accent)' : CORES[r.position % CORES.length]}
                    />
                    <div className="rk-row__id">
                      <div className="rk-row__name" style={{ fontWeight: r.you ? 700 : 600 }}>
                        {r.you ? 'Você' : r.name}
                      </div>
                      <div className="rk-row__user">@{r.username ?? 'usuario'}</div>
                    </div>
                  </div>
                  <div className="rk-row__streak">
                    <Flame size={14} />
                    {r.streak}
                  </div>
                  <div>
                    <span className="rk-row__level">Lv {r.level}</span>
                  </div>
                  <div
                    className="rk-row__xp"
                    style={{ color: r.you ? 'var(--accent)' : 'var(--text)' }}
                  >
                    {fmtXp(r.xp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
