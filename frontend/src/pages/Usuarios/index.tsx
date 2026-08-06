import { useState, useEffect } from 'react';
import { EstudioTopbar } from '../../components/EstudioTopbar';
import { ChevronLeft, ChevronRight } from '../../components/Icons';
import { useRequisicao } from '../../hooks/useRequisicao';
import { obterVisaoGeral, listarUsuariosCrm, type UsuarioCrm } from '../../services/admin';
import { GraficoCrescimento } from './GraficoCrescimento';
import { GraficoMensal } from './GraficoMensal';
import { GraficoTrilhas } from './GraficoTrilhas';
import { FunilOnboarding } from './FunilOnboarding';
import '../../styles/painel.css';

const POR_PAGINA = 20;

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
  const [pagina, setPagina] = useState(1);
  const [ordem, setOrdem] = useState<{ col: Coluna; desc: boolean }>({ col: 'criadoEm', desc: true });

  useEffect(() => {
    const id = setTimeout(() => {
      setBuscaDeb(busca);
      setPagina(1);
    }, 350);
    return () => clearTimeout(id);
  }, [busca]);

  const { dados: paginaCrm, carregando } = useRequisicao(
    () =>
      listarUsuariosCrm({
        busca: buscaDeb,
        pagina,
        porPagina: POR_PAGINA,
        ordenarPor: ordem.col,
        direcao: ordem.desc ? 'desc' : 'asc',
      }),
    [buscaDeb, pagina, ordem],
  );

  const usuarios = paginaCrm?.rows ?? [];
  const total = paginaCrm?.total ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  function ordenarPor(col: Coluna) {
    setPagina(1);
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
      <EstudioTopbar crumb={<b>Usuários</b>} />

      <div className="estudio-home estudio-home--painel">
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

        {overview && <GraficoMensal cadastros={overview.cadastrosPorDia} />}

        {overview && (
          <div className="painel-duplo">
            <GraficoTrilhas dados={overview.usuariosPorTrilha} />
            <FunilOnboarding porAno={overview.funilPorAno} />
          </div>
        )}

        <div className="painel-toolbar">
          <input
            className="estudio-form__input"
            style={{ margin: 0, maxWidth: 340 }}
            placeholder="Buscar por nome, username ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <span className="painel-toolbar__contagem">
            {total} usuário{total === 1 ? '' : 's'}
          </span>
        </div>

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
                <Th col="criadoEm" label="Cadastro" ordem={ordem} onClick={ordenarPor} />
              </tr>
            </thead>
            <tbody className={carregando ? 'painel-tabela__body is-carregando' : 'painel-tabela__body'}>
              {usuarios.map((u) => (
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
                      {u.origem !== 'social'
                        ? 'Email'
                        : u.provider === 'github'
                          ? 'GitHub'
                          : u.provider === 'google'
                            ? 'Google'
                            : 'Social'}
                    </span>
                  </td>
                  <td className="num">{u.aulas}</td>
                  <td className="num">{u.trilhas}</td>
                  <td className="num">{u.simulados}</td>
                  <td className="num">{u.desafios}</td>
                  <td className="num">{u.conquistas}</td>
                  <td className="num">{u.xp}</td>
                  <td>{fmtData(u.ultimaAtividade)}</td>
                  <td>{fmtData(u.criadoEm)}</td>
                </tr>
              ))}
              {!carregando && usuarios.length === 0 && (
                <tr>
                  <td colSpan={10} className="painel-tabela__vazia">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="painel-pag">
          <span className="painel-pag__info">
            Página {pagina} de {totalPaginas}
          </span>
          <div className="painel-pag__botoes">
            <button
              className="painel-pag__btn"
              disabled={pagina <= 1 || carregando}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              className="painel-pag__btn"
              disabled={pagina >= totalPaginas || carregando}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              Próxima <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
