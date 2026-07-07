import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { useRequisicao } from '../../hooks/useRequisicao';
import { obterVisaoGeral, listarUsuariosCrm, type UsuarioCrm } from '../../services/admin';
import { GraficoCrescimento } from './GraficoCrescimento';
import '../../styles/painel.css';

const fmtData = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';

type Coluna = keyof Pick<
  UsuarioCrm,
  'name' | 'aulas' | 'trilhas' | 'simulados' | 'desafios' | 'conquistas' | 'xp' | 'ultimaAtividade' | 'criadoEm'
>;

const COLS_NUM = new Set<Coluna>(['aulas', 'trilhas', 'simulados', 'desafios', 'conquistas', 'xp']);

function Th({
  col,
  label,
  ordem,
  onClick,
}: {
  col: Coluna;
  label: string;
  ordem: { col: Coluna; desc: boolean };
  onClick: (c: Coluna) => void;
}) {
  const ativa = ordem.col === col;
  const num = COLS_NUM.has(col);
  return (
    <th
      className={`painel-th${num ? ' num' : ''}${ativa ? ' painel-th--ativa' : ''}`}
      onClick={() => onClick(col)}
    >
      {label}
      {ativa ? (ordem.desc ? ' ↓' : ' ↑') : ''}
    </th>
  );
}

export function Usuarios() {
  const { dados: overview } = useRequisicao(obterVisaoGeral, []);
  const [busca, setBusca] = useState('');
  const [buscaDeb, setBuscaDeb] = useState('');
  const [ordem, setOrdem] = useState<{ col: Coluna; desc: boolean }>({ col: 'criadoEm', desc: true });

  useEffect(() => {
    const id = setTimeout(() => setBuscaDeb(busca), 350);
    return () => clearTimeout(id);
  }, [busca]);

  const { dados: usuariosData, carregando } = useRequisicao(
    () => listarUsuariosCrm(buscaDeb),
    [buscaDeb],
  );

  const filtrados = useMemo(() => {
    const base = usuariosData ?? [];
    const { col, desc } = ordem;
    return base.toSorted((a, b) => {
      const va = a[col] ?? '';
      const vb = b[col] ?? '';
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb));
      return desc ? -cmp : cmp;
    });
  }, [usuariosData, ordem]);

  function ordenarPor(col: Coluna) {
    setOrdem((o) => (o.col === col ? { col, desc: !o.desc } : { col, desc: true }));
  }

  const cards = overview
    ? [
        {
          label: 'Usuários',
          valor: overview.usuarios,
          sub: `${overview.perfilCompleto} com username · ${overview.social} social`,
        },
        { label: 'Ativos (30d)', valor: overview.ativos30d, sub: `${overview.ativos7d} nos últimos 7 dias` },
        { label: 'Novos (30d)', valor: overview.novos30d, sub: `${overview.novos7d} nos últimos 7 dias` },
        {
          label: 'Aulas concluídas',
          valor: overview.aulasConcluidas,
          sub: `${overview.aulasTotal} aulas publicadas`,
        },
        { label: 'Simulados feitos', valor: overview.simuladosFeitos, sub: '' },
        { label: 'Desafios resolvidos', valor: overview.desafiosResolvidos, sub: '' },
      ]
    : [];

  return (
    <div className="home painel-page">
      <header className="topbar studio__bar">
        <div className="studio__brand">
          <Logo variant="solid" size={19} />
          <span className="studio__badge">Estúdio</span>
        </div>
        <span className="studio__divider" />
        <div className="studio__crumb">
          <b>Usuários</b>
        </div>
        <div className="topbar__spacer" />
        <Link className="btn btn--ghost studio__btn" to="/estudio">
          Trilhas
        </Link>
        <Link className="btn btn--ghost studio__btn" to="/estudio/simulados">
          Simulados
        </Link>
        <Link className="btn btn--ghost studio__btn" to="/estudio/desafios">
          Desafios
        </Link>
        <Link className="btn btn--ghost studio__btn" to="/home">
          Voltar ao app
        </Link>
      </header>

      <div className="estudio-home">
        <div className="estudio-home__head">
          <div>
            <h1 className="estudio-home__title">Usuários</h1>
            <p className="estudio-home__sub">Visão geral da base e o progresso de cada aluno.</p>
          </div>
        </div>

        <div className="painel-cards">
          {cards.map((c) => (
            <div key={c.label} className="painel-card">
              <span className="painel-card__valor">{c.valor}</span>
              <span className="painel-card__label">{c.label}</span>
              {c.sub && <span className="painel-card__sub">{c.sub}</span>}
            </div>
          ))}
        </div>

        {overview && <GraficoCrescimento cadastros={overview.cadastrosPorDia} />}

        <div className="painel-toolbar">
          <input
            className="estudio-form__input"
            style={{ margin: 0, maxWidth: 340 }}
            placeholder="Buscar por nome, username ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <span className="painel-toolbar__contagem">{filtrados.length} usuários</span>
        </div>

        {carregando ? (
          <p className="track__desc">Carregando...</p>
        ) : (
          <div className="painel-tabela-wrap">
            <table className="painel-tabela">
              <thead>
                <tr>
                  <Th col="name" label="Usuário" ordem={ordem} onClick={ordenarPor} />
                  <th>Origem</th>
                  <Th col="aulas" label="Aulas" ordem={ordem} onClick={ordenarPor} />
                  <Th col="trilhas" label="Trilhas" ordem={ordem} onClick={ordenarPor} />
                  <Th col="simulados" label="Simul." ordem={ordem} onClick={ordenarPor} />
                  <Th col="desafios" label="Desaf." ordem={ordem} onClick={ordenarPor} />
                  <Th col="conquistas" label="Conq." ordem={ordem} onClick={ordenarPor} />
                  <Th col="xp" label="XP" ordem={ordem} onClick={ordenarPor} />
                  <Th col="ultimaAtividade" label="Últ. atividade" ordem={ordem} onClick={ordenarPor} />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="painel-user__nome">{u.name}</div>
                      <div className="painel-user__sub">
                        {u.username ? (
                          `@${u.username}`
                        ) : (
                          <span className="painel-user__semuser">sem username</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`painel-tag painel-tag--${u.origem}`}>
                        {u.origem === 'social' ? 'Social' : 'Email'}
                      </span>
                    </td>
                    <td className="num">{u.aulas}</td>
                    <td className="num">{u.trilhas}</td>
                    <td className="num">{u.simulados}</td>
                    <td className="num">{u.desafios}</td>
                    <td className="num">{u.conquistas}</td>
                    <td className="num">{u.xp}</td>
                    <td>{fmtData(u.ultimaAtividade)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
