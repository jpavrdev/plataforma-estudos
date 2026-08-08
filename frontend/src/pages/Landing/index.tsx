import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';
import telaDesafio from '../../assets/produto-desafio.webp';
import telaTerminal from '../../assets/produto-terminal.webp';
import terminalWebm from '../../assets/produto-terminal.webm';
import terminalMp4 from '../../assets/produto-terminal.mp4';
import telaProgresso from '../../assets/produto-progresso.webp';
import {
  Zap,
  Flame,
  Trophy,
  BookOpen,
  ClockExam,
  Target,
  ChevronRight,
  Github,
  Linkedin,
  XSocial,
} from '../../components/Icons';

// Vêm do backend para a página nunca anunciar um número que envelheceu no código.
type Estatisticas = {
  trilhas: number;
  aulas: number;
  desafios: number;
  simulados: number;
  questoes: number;
  estudantes: number;
  exerciciosResolvidos: number;
  aulasConcluidas: number;
};

const numero = new Intl.NumberFormat('pt-BR');

// Arredonda para baixo e marca com "+": 1293 vira "1.200+", 16138 vira "16.000+".
// Continua verdadeiro, a vitrine não muda a cada aluno novo, e o passo cresce com
// a grandeza, senão um "16.100+" ficaria preciso demais para uma frase de venda.
function aproximado(n: number): string {
  if (n < 10) return numero.format(n);
  const passo = n >= 10000 ? 1000 : n >= 100 ? 100 : 10;
  return `${numero.format(Math.floor(n / passo) * passo)}+`;
}

// Traço enquanto carrega e também quando o número é zero: numa vitrine, anunciar
// "0 desafios" é pior do que não anunciar nada.
function Numero({ valor }: { valor?: number }) {
  if (!valor) return <span className="lp-stat__num lp-stat__num--vazio">--</span>;
  return <span className="lp-stat__num">{aproximado(valor)}</span>;
}

const RECURSOS = [
  {
    icone: <Zap size={20} />,
    titulo: 'Desafio do dia',
    texto:
      'Um problema novo a cada dia, resolvido no editor da própria plataforma. Roda seus testes na hora e conta XP na primeira vez que passa.',
  },
  {
    icone: <Flame size={20} />,
    titulo: 'Streak que segura o hábito',
    texto:
      'Cada dia de estudo mantém sua sequência viva. É o lembrete diário de que constância vale mais do que maratona.',
  },
  {
    icone: <Trophy size={20} />,
    titulo: 'Ranking e ligas',
    texto:
      'Seu XP te posiciona entre os outros estudantes e sobe as ligas, de Bronze até Diamante.',
  },
  {
    icone: <BookOpen size={20} />,
    titulo: 'Trilhas guiadas',
    texto:
      'Da lógica de programação ao Kubernetes, com aula, exemplo e quiz. Sem pular etapa e sem se perder na ordem.',
  },
  {
    icone: <ClockExam size={20} />,
    titulo: 'Simulados de certificação',
    texto:
      'Provas cronometradas no formato oficial, para AWS, Azure e mais. Ao errar, você vê a resolução passo a passo.',
  },
  {
    icone: <Target size={20} />,
    titulo: 'Progresso que dá para ver',
    texto:
      'Mapa de atividade do ano, XP por trilha, conquistas e meta semanal. Sua evolução em números, não em sensação.',
  },
];

const PASSOS = [
  {
    n: '01',
    titulo: 'Crie sua conta grátis',
    texto: 'Leva menos de um minuto. Sem cartão de crédito, sem complicação.',
  },
  {
    n: '02',
    titulo: 'Escolha por onde começar',
    texto: 'Siga um roadmap de carreira, uma trilha específica ou vá direto no desafio do dia.',
  },
  {
    n: '03',
    titulo: 'Volte amanhã',
    texto: 'Mantenha o streak, junte XP e acompanhe a evolução subindo no ranking.',
  },
];

const LEGENDA_TERMINAL =
  'Terminal Linux dentro de uma aula: o comando falha com permissão negada e depois funciona com sudo';

// Tecnologias que têm trilha de verdade na plataforma.
const TECNOLOGIAS = ['Python', 'JavaScript', 'Java', 'Go', 'Linux', 'Docker', 'Kubernetes', 'AWS'];

export function Landing() {
  const [stats, setStats] = useState<Estatisticas>();
  // Quem pediu menos movimento no sistema recebe o quadro final parado, com a
  // mesma informação, em vez do vídeo em laço.
  const [semAnimacao] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );

  useEffect(() => {
    let ativo = true;
    api
      .get<Estatisticas>('/estatisticas-publicas')
      .then(({ data }) => {
        if (ativo) setStats(data);
      })
      .catch((e) => {
        // A página se sustenta sem os números, então a visita não é interrompida.
        console.error('Não foi possível carregar as estatísticas públicas', e);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className="lp">
      <header className="lp-topbar">
        <div className="lp-container lp-topbar__inner">
          <Logo variant="solid" size={19} to="/" />
          <nav className="lp-nav">
            <a href="#recursos">Recursos</a>
            <a href="#trilhas">Trilhas</a>
            <a href="#como-funciona">Como funciona</a>
          </nav>
          <div className="lp-topbar__acoes">
            <span className="lp-tema">
              <ThemeToggle inline />
            </span>
            <Link className="lp-link-entrar" to="/entrar">
              Entrar
            </Link>
            <Link className="btn btn--accent lp-btn-topo" to="/cadastro">
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-container">
            <div className="lp-hero__texto">
              <span className="lp-badge">
                <Flame size={13} /> Um novo desafio todo dia
              </span>
              <h1 className="lp-h1">
                Aprenda a programar resolvendo <span className="lp-h1__destaque">um desafio</span>{' '}
                por dia.
              </h1>
              <p className="lp-lede">
                O Ensina Dev transforma o aprendizado de programação em hábito. Desafios diários,
                trilhas guiadas, simulados de certificação e um ranking para te manter no ritmo, do
                zero à sua primeira vaga.
              </p>
              <div className="lp-hero__ctas">
                <Link className="btn btn--accent lp-btn-grande" to="/cadastro">
                  Criar conta grátis <ChevronRight size={14} />
                </Link>
                <a className="btn lp-btn-secundario" href="#como-funciona">
                  Ver como funciona
                </a>
              </div>
              <p className="lp-hero__prova">
                {stats ? (
                  <>
                    <strong>{aproximado(stats.estudantes)} alunos</strong> já estudam no Ensina Dev
                  </>
                ) : (
                  <>Comece hoje, de graça</>
                )}
              </p>
            </div>

            <figure className="lp-tela lp-tela--hero">
              <img
                src={telaDesafio}
                width={1400}
                height={683}
                alt="Tela de um desafio no Ensina Dev: enunciado à esquerda, editor de código à direita e o resultado dos testes aprovado"
              />
            </figure>
          </div>
        </section>

        <section className="lp-tecnologias" id="trilhas">
          <div className="lp-container">
            <p className="lp-olho lp-olho--centro">O que você aprende aqui</p>
            <ul className="lp-tecnologias__lista">
              {TECNOLOGIAS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="lp-tecnologias__nota">
              {stats ? (
                <>
                  e mais {numero.format(stats.trilhas - TECNOLOGIAS.length)} trilhas, de lógica de
                  programação a machine learning
                </>
              ) : (
                <>e muitas outras trilhas, de lógica de programação a machine learning</>
              )}
            </p>
          </div>
        </section>

        <section className="lp-numeros">
          <div className="lp-container lp-numeros__grade">
            <div className="lp-stat">
              <Numero valor={stats?.estudantes} />
              <span className="lp-stat__rotulo">alunos</span>
            </div>
            <div className="lp-stat">
              <Numero valor={stats?.aulas} />
              <span className="lp-stat__rotulo">aulas publicadas</span>
            </div>
            <div className="lp-stat">
              <Numero valor={stats?.desafios} />
              <span className="lp-stat__rotulo">desafios de código</span>
            </div>
            <div className="lp-stat">
              <Numero valor={stats?.simulados} />
              <span className="lp-stat__rotulo">simulados de certificação</span>
            </div>
          </div>
        </section>

        <section className="lp-secao lp-secao--alt">
          <div className="lp-container lp-destaque">
            <div className="lp-destaque__texto">
              <p className="lp-olho">Laboratório de verdade</p>
              <h2 className="lp-destaque__titulo">
                Um Linux inteiro dentro da aula, e ele é só seu.
              </h2>
              <p className="lp-destaque__lede">
                Nas aulas de Linux você não lê sobre comando: você digita. Um Debian de verdade sobe
                na hora, com <code className="code-inline">sudo</code> liberado, e some quando você
                termina. Errar ali não quebra nada, porque a máquina é sua e é descartável.
              </p>
              <ul className="lp-lista">
                <li>Sem instalar nada, sem máquina virtual, sem dual boot</li>
                <li>Permissão negada de verdade, e o sudo resolvendo de verdade</li>
                <li>Disponível em 20 aulas, da linha de comando ao bash</li>
              </ul>
            </div>
            <figure className="lp-tela">
              {semAnimacao ? (
                <img src={telaTerminal} width={1240} height={500} alt={LEGENDA_TERMINAL} />
              ) : (
                <video
                  poster={telaTerminal}
                  width={1240}
                  height={500}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label={LEGENDA_TERMINAL}
                >
                  <source src={terminalWebm} type="video/webm" />
                  <source src={terminalMp4} type="video/mp4" />
                </video>
              )}
            </figure>
          </div>
        </section>

        <section className="lp-secao" id="recursos">
          <div className="lp-container">
            <p className="lp-olho lp-olho--centro">Por que Ensina Dev</p>
            <h2 className="lp-h2">Feito para criar o hábito de programar</h2>
            <p className="lp-sub">
              Tudo o que você precisa para sair da teoria e praticar de verdade, todos os dias.
            </p>
            <div className="lp-cards">
              {RECURSOS.map((r) => (
                <article className="lp-card" key={r.titulo}>
                  <span className="lp-card__icone">{r.icone}</span>
                  <h3 className="lp-card__titulo">{r.titulo}</h3>
                  <p className="lp-card__texto">{r.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-secao lp-secao--alt">
          <div className="lp-container lp-destaque lp-destaque--invertido">
            <div className="lp-destaque__texto">
              <p className="lp-olho">Sua evolução</p>
              <h2 className="lp-destaque__titulo">Constância que dá para ver, não para sentir.</h2>
              <p className="lp-destaque__lede">
                Cada dia de estudo vira um quadrado no mapa do ano. Some XP, mantenha o streak e
                acompanhe o domínio de cada trilha. É o painel que mostra se você está mesmo
                avançando ou só se sentindo produtivo.
              </p>
              <ul className="lp-lista">
                <li>Mapa de atividade do ano inteiro</li>
                <li>XP por trilha, conquistas e meta semanal</li>
                <li>Ranking com ligas, de Bronze até Diamante</li>
              </ul>
            </div>
            <figure className="lp-tela">
              <img
                src={telaProgresso}
                width={1500}
                height={787}
                alt="Painel de progresso do Ensina Dev com XP total, meta semanal, mapa de atividade do ano, domínio por trilha e conquistas recentes"
              />
            </figure>
          </div>
        </section>

        <section className="lp-secao" id="como-funciona">
          <div className="lp-container">
            <p className="lp-olho lp-olho--centro">Como funciona</p>
            <h2 className="lp-h2">Comece em 3 passos</h2>
            <div className="lp-passos">
              {PASSOS.map((p) => (
                <article className="lp-passo" key={p.n}>
                  <span className="lp-passo__n">{p.n}</span>
                  <h3 className="lp-card__titulo">{p.titulo}</h3>
                  <p className="lp-card__texto">{p.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Só aparece com os números na mão: a frase não faz sentido sem eles. */}
        {stats && (
          <section className="lp-movimento">
            <div className="lp-container">
              <p className="lp-olho lp-olho--centro">Quem já está aqui</p>
              <p className="lp-movimento__frase">
                Os alunos do Ensina Dev já resolveram{' '}
                <strong>{aproximado(stats.exerciciosResolvidos)}</strong> exercícios e concluíram{' '}
                <strong>{aproximado(stats.aulasConcluidas)}</strong> aulas.
              </p>
            </div>
          </section>
        )}

        <section className="lp-secao">
          <div className="lp-container">
            <div className="lp-cta">
              <h2 className="lp-cta__titulo">Seu próximo desafio começa hoje.</h2>
              <p className="lp-cta__texto">
                Crie sua conta grátis, resolva o desafio do dia e comece seu streak agora mesmo.
              </p>
              <Link className="btn lp-cta__botao" to="/cadastro">
                Criar conta grátis
              </Link>
              <p className="lp-cta__nota">Sem cartão de crédito. Comece em segundos.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-rodape">
        <div className="lp-container lp-rodape__grade">
          <div className="lp-rodape__marca">
            <Logo variant="solid" size={18} />
            <p>
              {stats ? (
                <>
                  {aproximado(stats.aulas)} aulas e {aproximado(stats.questoes)} questões para você
                  praticar programação todo dia.
                </>
              ) : (
                <>Aprenda a programar resolvendo um desafio por dia.</>
              )}
            </p>
          </div>
          <nav className="lp-rodape__col">
            <h4>Plataforma</h4>
            <a href="#recursos">Recursos</a>
            <a href="#trilhas">Trilhas</a>
            <a href="#como-funciona">Como funciona</a>
          </nav>
          <nav className="lp-rodape__col">
            <h4>Conta</h4>
            <Link to="/entrar">Entrar</Link>
            <Link to="/cadastro">Criar conta</Link>
            <Link to="/recuperar-senha">Recuperar senha</Link>
          </nav>
          <nav className="lp-rodape__col">
            <h4>Legal</h4>
            <Link to="/termos">Termos de Uso</Link>
            <Link to="/privacidade">Política de Privacidade</Link>
          </nav>
        </div>
        <div className="lp-container lp-rodape__base">
          <span>© {new Date().getFullYear()} Ensina Dev. Todos os direitos reservados.</span>
          <span className="lp-rodape__redes">
            <a
              href="https://github.com/jpavrdev"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin size={16} />
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
              <XSocial size={16} />
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
