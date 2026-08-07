import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Check, X } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { user as userMock } from '../../data/home';
import { NAV_PRINCIPAL as NAV } from '../../data/nav';
import {
  filaDoDia,
  obterBaralhos,
  obterEstatisticas,
  obterHistorico,
  resumoFlashcards,
  responderCartao,
  revisaoDaTrilha,
  type Baralhos,
  type Cartao,
  type Estatisticas,
  type Resposta,
  type ResumoFlashcards,
  type SessaoRevisao,
} from '../../services/flashcards';

const BOTOES: { resposta: Resposta; rotulo: string; classe: string }[] = [
  { resposta: 'errei', rotulo: 'Errei', classe: 'errei' },
  { resposta: 'dificil', rotulo: 'Difícil', classe: 'dificil' },
  { resposta: 'intermediaria', rotulo: 'Intermediária', classe: 'intermediaria' },
  { resposta: 'facil', rotulo: 'Fácil', classe: 'facil' },
];

// Tempo da animação de saída da carta. Precisa bater com a duração em revisao.css:
// a carta só é trocada depois de terminar de sair da tela.
const SAIDA_MS = 300;

// Onde a sessão em andamento fica guardada, para um F5 não perder o lugar.
const SESSAO = 'ensina:revisao';

// Teto do campo de quantidade. Acima disso não é sessão, é maratona, e o campo
// precisa de um limite para não aceitar número absurdo digitado sem querer.
const MAX_POR_SESSAO = 100;

const HORA = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const DIA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });

// "Hoje", "Ontem" ou a data. Comparação por dia local, e não por diferença de horas:
// uma sessão das 23h e outra da 1h são dias diferentes mesmo com duas horas entre elas.
function diaDaSessao(iso: string) {
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (mesmoDia(d, hoje)) return 'Hoje';
  if (mesmoDia(d, ontem)) return 'Ontem';
  return DIA.format(d).replace('.', '');
}

// Relógio da carta. Sem décimos de propósito: a intenção é a pessoa perceber quando
// está garimpando uma resposta que não vem, não correr contra o cronômetro.
function cronometro(s: number) {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Tempo típico de uma carta. Abaixo de dez segundos o decimal importa: a diferença
// entre 3,4s e 8s é a diferença entre lembrar na hora e garimpar a resposta.
function segundos(ms: number) {
  if (!ms) return '--';
  const s = ms / 1000;
  return s < 10 ? `${s.toFixed(1)}s` : `${Math.round(s)}s`;
}

function duracao(ms: number) {
  if (!ms) return '--';
  const min = Math.round(ms / 60000);
  if (min < 1) return '<1min';
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto ? `${h}h${String(resto).padStart(2, '0')}` : `${h}h`;
}

export function Revisao() {
  const { user: authUser } = useAuth();
  const [params] = useSearchParams();
  const trilhaId = params.get('trilha');

  const displayName = authUser?.name ?? userMock.name;
  const initials = getInitials(displayName);

  const [resumo, setResumo] = useState<ResumoFlashcards | null>(null);
  const [baralhos, setBaralhos] = useState<Baralhos | null>(null);
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [historico, setHistorico] = useState<SessaoRevisao[]>([]);
  // Trilhas escolhidas. Vazio significa o baralho inteiro, e é como a aba abre.
  const [selecao, setSelecao] = useState<Set<string>>(new Set());
  const [comGlossario, setComGlossario] = useState(false);
  const [escolhendo, setEscolhendo] = useState(false);
  const [vazio, setVazio] = useState(false);
  // Quantas cartas a sessão entrega, como o aluno digitou. Vazio é "vai até acabar".
  const [limiteTexto, setLimiteTexto] = useState('');
  // Nulo é "sessão não começou"; a fila só é buscada quando o aluno manda começar.
  const [fila, setFila] = useState<Cartao[] | null>(null);
  const [indice, setIndice] = useState(0);
  const [aberto, setAberto] = useState(false);
  const [revelado, setRevelado] = useState(false);
  // A carta pode voltar para a pergunta depois de virada, mas os botões continuam:
  // quem já viu a resposta pode querer reler o enunciado antes de se avaliar.
  const [jaViu, setJaViu] = useState(false);
  const [saindo, setSaindo] = useState<Resposta | null>(null);
  const [decorrido, setDecorrido] = useState(0);
  const [erro, setErro] = useState('');
  const [feitos, setFeitos] = useState(0);
  const timer = useRef<number | null>(null);
  // Quando a carta atual apareceu. O tempo de resposta é medido daqui até o aluno se
  // avaliar, e não a partir da virada: pensar antes de virar faz parte do exercício.
  const mostradaEm = useRef<number>(0);

  const limite = limiteTexto ? Math.min(Number(limiteTexto), MAX_POR_SESSAO) : null;

  const carregarSala = useCallback(async () => {
    setErro('');
    try {
      const [r, b, e, h] = await Promise.all([
        resumoFlashcards(),
        obterBaralhos(),
        obterEstatisticas(),
        obterHistorico(),
      ]);
      setResumo(r);
      setBaralhos(b);
      setStats(e);
      setHistorico(h);
    } catch (err) {
      console.error('Falha ao carregar a revisão.', err);
      setErro('Não foi possível carregar seus cartões.');
    }
  }, []);

  const iniciarSessao = useCallback((cartoes: Cartao[], abrir = true) => {
    setFila(cartoes);
    setIndice(0);
    setRevelado(false);
    setJaViu(false);
    setSaindo(null);
    setFeitos(0);
    setAberto(abrir && cartoes.length > 0);
  }, []);

  async function comecar() {
    const escolha = { trilhas: [...selecao], glossario: comGlossario, limite };
    setVazio(false);
    try {
      const cartoes = await filaDoDia(escolha, limite);
      // Escolha sem nada vencido é avisada aqui, e não desabilitando a linha na lista:
      // linha apagada contaria quanto tem em cada baralho, que é o que não queremos
      // mostrar.
      if (!cartoes.length) {
        setVazio(true);
        return;
      }
      // A sessão fica guardada para sobreviver a um F5. Não guardamos as cartas: no
      // retorno a fila é remontada do servidor, e o que já foi respondido não vence
      // mais, então o progresso se preserva sozinho.
      localStorage.setItem(SESSAO, JSON.stringify(escolha));
      setEscolhendo(false);
      iniciarSessao(cartoes);
    } catch (err) {
      console.error('Falha ao montar a fila de revisão.', err);
      setErro('Não foi possível montar a fila.');
    }
  }

  function terminar() {
    localStorage.removeItem(SESSAO);
    setFila(null);
    setAberto(false);
    void carregarSala();
  }

  useEffect(() => {
    void carregarSala();
  }, [carregarSala]);

  // Recarregar a página no meio da revisão não pode jogar o aluno de volta para a
  // escolha. A sessão volta parada, com o botão de continuar, e não abre sozinha.
  useEffect(() => {
    if (trilhaId) return;
    const bruto = localStorage.getItem(SESSAO);
    if (!bruto) return;
    let escolha: {
      trilhas?: string[];
      glossario?: boolean;
      limite?: number | null;
      restam?: number;
    };
    try {
      escolha = JSON.parse(bruto);
    } catch (err) {
      console.error('Sessão de revisão salva ilegível, descartando.', err);
      localStorage.removeItem(SESSAO);
      return;
    }
    setSelecao(new Set(escolha.trilhas ?? []));
    setComGlossario(Boolean(escolha.glossario));
    setLimiteTexto(escolha.limite ? String(escolha.limite) : '');
    filaDoDia(escolha, escolha.restam ?? escolha.limite)
      .then((cartoes) => {
        if (cartoes.length) iniciarSessao(cartoes, false);
        else localStorage.removeItem(SESSAO);
      })
      .catch((err) => {
        console.error('Falha ao retomar a revisão.', err);
        localStorage.removeItem(SESSAO);
      });
  }, [trilhaId, iniciarSessao]);

  // O link do fim da aula promete a revisão da trilha, então ele já entra na sessão.
  // Entrar pela aba, não: ali o aluno escolhe primeiro o que quer revisar.
  useEffect(() => {
    if (!trilhaId) return;
    revisaoDaTrilha(trilhaId)
      .then(iniciarSessao)
      .catch((err) => {
        console.error('Falha ao carregar a revisão da trilha.', err);
        setErro('Não foi possível carregar os cartões da trilha.');
        setFila([]);
      });
  }, [trilhaId, iniciarSessao]);

  useEffect(() => () => window.clearTimeout(timer.current ?? undefined), []);

  const total = fila?.length ?? 0;
  const acabou = fila !== null && indice >= total;
  const atual = fila?.[indice] ?? null;

  useEffect(() => {
    if (acabou) localStorage.removeItem(SESSAO);
  }, [acabou]);

  // A sessão termina sozinha quando a fila acaba: sem carta não há modal, e a sala
  // atrás mostra o resultado.
  const modalAberto = aberto && !!atual;

  // Fechar desvira a carta. Sem isto, sair na resposta e voltar entregaria a resposta
  // de graça, e a carta não teria mais nada a perguntar.
  function fechar() {
    setAberto(false);
    setRevelado(false);
    setJaViu(false);
  }

  // Com a carta na frente da tela, rolar a página atrás não faz sentido.
  useEffect(() => {
    if (!modalAberto) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = antes;
    };
  }, [modalAberto]);

  // Um relógio por carta. Ele zera junto com a carta e conta de segundo em segundo.
  useEffect(() => {
    mostradaEm.current = Date.now();
    setDecorrido(0);
    if (!modalAberto) return;
    const id = window.setInterval(() => {
      setDecorrido(Math.floor((Date.now() - mostradaEm.current) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [atual?.id, modalAberto]);

  function alternarTrilha(id: string) {
    setSelecao((antes) => {
      const nova = new Set(antes);
      if (nova.has(id)) nova.delete(id);
      else nova.add(id);
      return nova;
    });
  }

  function tudo() {
    setSelecao(new Set());
    setComGlossario(false);
  }

  function virar() {
    if (saindo) return;
    setRevelado((v) => !v);
    setJaViu(true);
  }

  async function avaliar(resposta: Resposta) {
    if (!atual || saindo) return;
    // A troca de carta espera a animação de saída, mas a resposta sobe na hora: se a
    // rede demorar, quem está revisando não fica esperando a carta sumir.
    setSaindo(resposta);
    timer.current = window.setTimeout(() => {
      setRevelado(false);
      setJaViu(false);
      setSaindo(null);
      setIndice((i) => i + 1);
    }, SAIDA_MS);
    setFeitos((n) => n + 1);
    // O que falta é anotado a cada resposta. Sem isso, recarregar no meio de uma
    // sessão de 10 traria 10 cartas novas em vez das que sobraram.
    if (limite) {
      const bruto = localStorage.getItem(SESSAO);
      if (bruto) {
        try {
          localStorage.setItem(
            SESSAO,
            JSON.stringify({ ...JSON.parse(bruto), restam: Math.max(0, total - indice - 1) }),
          );
        } catch (err) {
          console.error('Sessão de revisão salva ilegível, descartando.', err);
          localStorage.removeItem(SESSAO);
        }
      }
    }
    try {
      // A data que a resposta gerou não volta para a tela de propósito: saber que
      // "este volta em 4 meses" convida a responder pensando no calendário, e não em
      // quanto a pessoa de fato lembrou.
      await responderCartao(atual.id, atual.origem, resposta, Date.now() - mostradaEm.current);
    } catch (err) {
      console.error('Falha ao registrar a resposta do cartão.', err);
    }
  }

  // Atalhos de teclado: revisar no mouse a cada carta cansa rápido, e quem usa Anki
  // espera espaço para virar e 1 a 4 para avaliar.
  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (!modalAberto || saindo) return;
      if (e.code === 'Escape') {
        fechar();
        return;
      }
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        virar();
        return;
      }
      if (jaViu) {
        const i = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
        if (i >= 0) {
          e.preventDefault();
          void avaliar(BOTOES[i].resposta);
        }
      }
    }
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  const restantes = total - indice;
  const tudoMarcado = selecao.size === 0 && !comGlossario;
  const baralhoVazio = (resumo?.total ?? 0) === 0;
  const descricaoSelecao = tudoMarcado
    ? 'Todo o seu baralho'
    : [
        ...(baralhos?.trilhas ?? []).filter((t) => selecao.has(t.id)).map((t) => t.nome),
        ...(comGlossario ? ['Glossário'] : []),
      ].join(' + ');
  // Quantas cartas a escolha atual tem vencidas hoje. Sem trilha marcada, o baralho todo.
  const escolhidos = tudoMarcado
    ? (resumo?.vencidos ?? 0)
    : (baralhos?.trilhas ?? [])
        .filter((t) => selecao.has(t.id))
        .reduce((soma, t) => soma + t.vencidos, 0) +
      (comGlossario ? (baralhos?.glossario.vencidos ?? 0) : 0);

  return (
    <div className="home-shell">
      <div className="home">
        <header className="topbar">
          <MobileMenu />
          <Logo variant="solid" size={20} to="/home" />
          <nav className="nav">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav__item${item.label === 'Revisão' ? ' nav__item--active' : ''}`}
              >
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

        {/* A sala é a página normal, e é o que fica escurecido atrás quando a carta
            sobe. Ela guarda a escolha do conteúdo, as estatísticas e o histórico. */}
        <div className="rev-sala">
          <div className="rev-sala__head">
            <h1 className="rev-sala__titulo">
              {trilhaId ? 'Revisão da trilha' : 'Revisão do dia'}
            </h1>
            <p className="rev-sala__sub">
              {trilhaId
                ? 'Todos os cartões das aulas que você concluiu nesta trilha, na ordem em que estudou.'
                : 'Cartões que voltam hoje. Cada acerto empurra o próximo encontro para mais longe.'}
            </p>
          </div>

          {erro && <div className="rev-sala__erro">{erro}</div>}

          {!trilhaId && baralhos && fila === null && escolhidos > 0 && (
            <div className="rev-sala__aviso">
              <div className="rev-sala__baralho" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <h3>Tem carta esperando por você</h3>
              <p>Uma de cada vez. Tente lembrar antes de virar.</p>

              {/* O conteúdo escolhido fica escrito aqui, e clicar abre a lista. Sem
                  isso o aluno não sabe o que vai cair antes de começar. */}
              <button
                type="button"
                className="rev-sala__selecao"
                onClick={() => setEscolhendo(true)}
              >
                <span>{descricaoSelecao}</span>
                <b>Trocar</b>
              </button>

              <button className="btn btn--accent" onClick={() => void comecar()}>
                Começar revisão
              </button>
            </div>
          )}

          {/* Fila vazia não é falha, é o estado normal de quem está em dia. O texto
              muda conforme o motivo: baralho ainda sem carta, tudo agendado para
              frente, ou só a escolha atual sem nada vencido. */}
          {!trilhaId && baralhos && fila === null && escolhidos === 0 && (
            <div className="rev-sala__aviso">
              <span className="rev-sala__check">
                <Check size={22} />
              </span>
              {baralhoVazio ? (
                <>
                  <h3>Seu baralho começa na próxima aula</h3>
                  <p>
                    As cartas nascem quando você conclui uma aula. Estude uma e ela já entra aqui
                    para você rever nos próximos dias.
                  </p>
                  <Link to="/trilhas" className="btn btn--accent">
                    Ir para as trilhas
                  </Link>
                </>
              ) : tudoMarcado ? (
                <>
                  <h3>Você está em dia</h3>
                  <p>
                    Nenhuma carta venceu ainda. Cada uma volta na data que a sua resposta marcou, e
                    o que você achou fácil volta bem mais tarde.
                  </p>
                </>
              ) : (
                <>
                  <h3>Este conteúdo está em dia</h3>
                  <p>Nada venceu no que você escolheu. Troque para revisar outra coisa.</p>
                  <button
                    type="button"
                    className="rev-sala__selecao"
                    onClick={() => setEscolhendo(true)}
                  >
                    <span>{descricaoSelecao}</span>
                    <b>Trocar</b>
                  </button>
                </>
              )}
            </div>
          )}

          {trilhaId && fila !== null && total === 0 && (
            <div className="rev-sala__aviso">
              <span className="rev-sala__check">
                <Check size={22} />
              </span>
              <h3>Esta trilha ainda não tem cartões</h3>
              <p>Os cartões aparecem aqui conforme as aulas ganharem revisão.</p>
              <Link to="/trilhas" className="btn btn--accent">
                Ir para as trilhas
              </Link>
            </div>
          )}

          {acabou && total > 0 && (
            <div className="rev-sala__aviso">
              <span className="rev-sala__check">
                <Check size={22} />
              </span>
              <h3>Sessão concluída</h3>
              <p>
                {feitos} {feitos === 1 ? 'cartão revisado' : 'cartões revisados'}. Cada um voltou
                para uma data diferente, conforme você se avaliou.
              </p>
              <button className="btn btn--accent" onClick={terminar}>
                Voltar
              </button>
            </div>
          )}

          {!aberto && !acabou && fila !== null && total > 0 && (
            <div className="rev-sala__aviso">
              <div className="rev-sala__baralho" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <h3>
                {restantes} {restantes === 1 ? 'carta restante' : 'cartas restantes'}
              </h3>
              <p>
                {feitos > 0
                  ? `Você já revisou ${feitos} nesta sessão.`
                  : 'Uma de cada vez. Tente lembrar antes de virar.'}
              </p>
              {/* Parar no meio é uma escolha legítima, e sem este botão a única saída
                  era navegar para fora e deixar a sessão pendurada. */}
              <div className="rev-sala__par">
                <button className="btn btn--ghost" onClick={terminar}>
                  Terminar revisão
                </button>
                <button className="btn btn--accent" onClick={() => setAberto(true)}>
                  Continuar revisão
                </button>
              </div>
            </div>
          )}

          {/* Estatísticas das respostas, não do baralho: elas saem do histórico de
              cada revisão, então mostram como o aluno se saiu, e não quanto ele tem. */}
          {stats && stats.respostas > 0 && (
            <div className="rev-stats">
              <h2>Suas respostas</h2>
              <div className="rev-stats__numeros">
                <div>
                  <b>{stats.respostas}</b>
                  <span>revisões feitas</span>
                </div>
                <div>
                  <b>{stats.taxaAcerto}%</b>
                  <span>lembrou na hora</span>
                </div>
                <div>
                  <b>{stats.diasAtivos}</b>
                  <span>dias ativos em 30</span>
                </div>
                <div>
                  <b>{stats.estabilidadeMedia}d</b>
                  <span>memória média</span>
                </div>
                <div>
                  <b>{segundos(stats.tempoTipicoMs)}</b>
                  <span>por carta</span>
                </div>
                <div>
                  <b>{duracao(stats.tempoTotalMs)}</b>
                  <span>revisando ao todo</span>
                </div>
              </div>

              <div className="rev-stats__barra" aria-hidden="true">
                {BOTOES.map((b) => {
                  const n = stats.porResposta[b.resposta];
                  if (!n) return null;
                  return (
                    <span
                      key={b.resposta}
                      className={`rev-stats__fatia rev-stats__fatia--${b.classe}`}
                      style={{ width: `${(n / stats.respostas) * 100}%` }}
                    />
                  );
                })}
              </div>
              <div className="rev-stats__legenda">
                {BOTOES.map((b) => (
                  <span key={b.resposta}>
                    <i className={`rev-stats__ponto rev-stats__ponto--${b.classe}`} />
                    {b.rotulo} <b>{stats.porResposta[b.resposta]}</b>
                  </span>
                ))}
              </div>

              <p className="rev-stats__nota">
                {stats.dominados > 0
                  ? `${stats.dominados} ${stats.dominados === 1 ? 'cartão já dorme' : 'cartões já dormem'} por mais de três semanas, e ${stats.emAprendizado} ainda estão em aprendizado.`
                  : `${stats.emAprendizado} ${stats.emAprendizado === 1 ? 'cartão ainda está' : 'cartões ainda estão'} em aprendizado. Passando de três semanas de intervalo, eles saem quase de vez da fila.`}
              </p>
            </div>
          )}

          {/* Histórico de sessões. Ele é reconstruído das respostas, então aparece
              inteiro para quem já revisava antes de a tela existir. */}
          {historico.length > 0 && (
            <div className="rev-hist">
              <h2>Suas sessões</h2>
              <div className="rev-hist__lista">
                {historico.map((s) => (
                  <div key={s.inicio} className="rev-hist__item">
                    <div className="rev-hist__topo">
                      <span className="rev-hist__quando">
                        {diaDaSessao(s.inicio)}, {HORA.format(new Date(s.inicio))} às{' '}
                        {HORA.format(new Date(s.fim))}
                      </span>
                      <span className="rev-hist__peso">
                        {s.cartas} {s.cartas === 1 ? 'carta' : 'cartas'} · {duracao(s.duracaoMs)}
                      </span>
                    </div>
                    {s.conteudos.length > 0 && (
                      <div className="rev-hist__conteudo">{s.conteudos.join(', ')}</div>
                    )}
                    <div className="rev-hist__barra" aria-hidden="true">
                      {BOTOES.map((b) => {
                        const n = s.porResposta[b.resposta];
                        if (!n) return null;
                        return (
                          <span
                            key={b.resposta}
                            className={`rev-stats__fatia rev-stats__fatia--${b.classe}`}
                            style={{ width: `${(n / s.cartas) * 100}%` }}
                          />
                        );
                      })}
                    </div>
                    <div className="rev-hist__legenda">
                      {BOTOES.filter((b) => s.porResposta[b.resposta] > 0).map((b) => (
                        <span key={b.resposta}>
                          <i className={`rev-stats__ponto rev-stats__ponto--${b.classe}`} />
                          {b.rotulo} <b>{s.porResposta[b.resposta]}</b>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Escolher o conteúdo é uma decisão à parte, e por isso tem tela própria:
            na página ela virava uma fileira de botões que ninguém lia. */}
        {escolhendo && baralhos && (
          <div
            className="rev-modal rev-modal--painel"
            role="dialog"
            aria-modal="true"
            aria-label="Escolher o que revisar"
            onClick={() => setEscolhendo(false)}
          >
            <div className="rev-escolha" onClick={(e) => e.stopPropagation()}>
              <div className="rev-escolha__topo">
                <h2>O que você quer revisar</h2>
                <button
                  className="rev-escolha__x"
                  onClick={() => setEscolhendo(false)}
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="rev-escolha__ajuda">
                Marque mais de um para embaralhar tudo na mesma sessão.
              </p>

              <div className="rev-escolha__lista">
                <button
                  type="button"
                  className={`rev-item${tudoMarcado ? ' rev-item--on' : ''}`}
                  onClick={tudo}
                >
                  <span className="rev-item__check">{tudoMarcado && <Check size={13} />}</span>
                  <span className="rev-item__nome">Todo o seu baralho</span>
                </button>

                {baralhos.trilhas.map((t) => {
                  const marcado = selecao.has(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`rev-item${marcado ? ' rev-item--on' : ''}`}
                      onClick={() => alternarTrilha(t.id)}
                    >
                      <span className="rev-item__check">{marcado && <Check size={13} />}</span>
                      <span className="rev-item__nome">{t.nome}</span>
                    </button>
                  );
                })}

                {baralhos.glossario.total > 0 && (
                  <button
                    type="button"
                    className={`rev-item${comGlossario ? ' rev-item--on' : ''}`}
                    onClick={() => setComGlossario((v) => !v)}
                  >
                    <span className="rev-item__check">{comGlossario && <Check size={13} />}</span>
                    <span className="rev-item__nome">Glossário</span>
                  </button>
                )}
              </div>

              <div className="rev-escolha__quantas">
                <label htmlFor="rev-quantas">Quantas cartas</label>
                <input
                  id="rev-quantas"
                  className="rev-quant"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="todas"
                  value={limiteTexto}
                  onChange={(e) => setLimiteTexto(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  onBlur={() =>
                    setLimiteTexto((v) =>
                      v ? String(Math.min(Math.max(1, Number(v)), MAX_POR_SESSAO)) : '',
                    )
                  }
                />
              </div>

              {vazio && (
                <p className="rev-escolha__vazio">
                  Nada venceu no que você escolheu. Marque outro conteúdo.
                </p>
              )}

              <div className="rev-escolha__rodape">
                <button
                  className="btn btn--accent"
                  onClick={() => {
                    void comecar();
                  }}
                >
                  Começar revisão
                </button>
              </div>
            </div>
          </div>
        )}

        {/* A carta sobe acima da tela, com o resto escurecido atrás. */}
        {modalAberto && (
          <div className="rev-modal" role="dialog" aria-modal="true" aria-label="Revisão">
            <button className="rev-modal__fechar" onClick={fechar} aria-label="Fechar revisão">
              <X size={18} />
            </button>

            <div className="rev-modal__topo">
              <div className="rev-modal__barra">
                <div
                  className="rev-modal__barra-fill"
                  style={{ width: `${((indice + 1) / total) * 100}%` }}
                />
              </div>
              <div className="rev-modal__contador">
                <span>
                  {indice + 1} de {total}
                </span>
                <span className="rev-modal__relogio">{cronometro(decorrido)}</span>
              </div>
            </div>

            {/* A cena entra e sai da tela; a carta gira dentro dela. A key força o
                React a montar um elemento novo a cada carta, senão a animação de
                entrada não roda de novo. */}
            <div
              key={atual.id}
              className={[
                'rev__cena',
                saindo ? `rev__cena--saindo rev__cena--saindo-${saindo}` : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* Camada só do balanço. O giro fica na carta e a entrada na cena; se as
                  três transformações dividissem o mesmo elemento, uma anularia a outra. */}
              <div className="rev__flutua">
                <div
                  className={`rev__carta${revelado ? ' rev__carta--virada' : ''}`}
                  onClick={virar}
                  role="button"
                  tabIndex={0}
                  aria-label={revelado ? 'Ver a pergunta' : 'Mostrar resposta'}
                >
                  <div className="rev__face rev__face--frente">
                    <span className="rev__origem">
                      {atual.origem === 'glossario' ? 'Glossário' : atual.trilha}
                    </span>
                    <p className="rev__texto">{atual.frente}</p>
                    <span className="rev__rodape">
                      {atual.origem === 'glossario' ? 'Termo do glossário' : atual.aula}
                    </span>
                  </div>
                  <div className="rev__face rev__face--verso">
                    <span className="rev__origem">Resposta</span>
                    <p className="rev__texto rev__texto--verso">{atual.verso}</p>
                    {/* O link só existe no verso: na frente ele convidaria a fugir
                        antes de tentar lembrar. Aqui a pessoa já sabe se precisa
                        reler, e é o momento em que a dúvida está viva. Abre em outra
                        aba para a sessão não ser interrompida, e para o clique com
                        stopPropagation, senão a carta viraria junto. */}
                    {atual.trilhaId && atual.aulaId ? (
                      <a
                        className="rev__rodape rev__rodape--link"
                        href={`/trilhas/${atual.trilhaId}/aula/${atual.aulaId}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Reler {atual.aula}
                      </a>
                    ) : (
                      <span className="rev__rodape">
                        {atual.origem === 'glossario' ? 'Termo do glossário' : atual.aula}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="rev-modal__pista">
              Clique na carta ou aperte <b>espaço</b> para {revelado ? 'ver a pergunta' : 'virar'}
            </p>

            <div className={`rev__acoes${jaViu ? ' rev__acoes--visivel' : ''}`}>
              {BOTOES.map((b) => (
                <button
                  key={b.resposta}
                  className={`rev__botao rev__botao--${b.classe}`}
                  onClick={() => void avaliar(b.resposta)}
                  tabIndex={jaViu ? 0 : -1}
                  aria-hidden={!jaViu}
                >
                  {b.rotulo}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
