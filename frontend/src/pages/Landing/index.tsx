import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';
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
};

const numero = new Intl.NumberFormat('pt-BR');

// Arredonda para baixo e marca com "+": 1293 vira "1.200+", 142 vira "100+". Continua
// verdadeiro, e a vitrine não muda de número a cada aluno novo que entra.
function aproximado(n: number): string {
  if (n < 10) return numero.format(n);
  const passo = n >= 100 ? 100 : 10;
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

// Tecnologias que têm trilha de verdade na plataforma.
const TECNOLOGIAS = ['Python', 'JavaScript', 'Java', 'Go', 'Linux', 'Docker', 'Kubernetes', 'AWS'];

export function Landing() {
  const [stats, setStats] = useState<Estatisticas>();

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
          <div className="lp-container lp-hero__inner">
            <div className="lp-hero__texto">
              <span className="lp-badge">
                <Flame size={13} /> Um novo desafio todo dia
              </span>
              <h1 className="lp-h1">
                Aprenda a programar resolvendo <span className="lp-h1__destaque">um desafio</span>{' '}
                por dia.
              </h1>
              <p className="lp-lede">
                A ensina.dev transforma o aprendizado de programação em hábito. Desafios diários,
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
                    <strong>{aproximado(stats.estudantes)} alunos</strong> já estudam na ensina.dev
                  </>
                ) : (
                  <>Comece hoje, de graça</>
                )}
              </p>
            </div>

            <div className="lp-mock" aria-hidden="true">
              <div className="lp-mock__barra">
                <span className="lp-mock__ponto" style={{ background: '#ff5f57' }} />
                <span className="lp-mock__ponto" style={{ background: '#febc2e' }} />
                <span className="lp-mock__ponto" style={{ background: '#28c840' }} />
                <span className="lp-mock__arquivo">desafio-do-dia</span>
              </div>
              <div className="lp-mock__corpo">
                <div className="lp-mock__tags">
                  <span className="lp-tag lp-tag--facil">Fácil</span>
                  <span className="lp-tag">+50 XP</span>
                  <span className="lp-tag lp-tag--streak">
                    <Flame size={12} /> 12 dias
                  </span>
                </div>
                <h3 className="lp-mock__titulo">Soma de dois números</h3>
                <pre className="lp-mock__codigo">
                  <code>{`function soma(nums, alvo) {
  const mapa = {};
  for (let i = 0; i < nums.length; i++) {
    // resolva aqui
  }
}`}</code>
                </pre>
                <span className="btn btn--accent lp-mock__botao">Resolver agora</span>
              </div>
            </div>
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

        <section className="lp-secao" id="recursos">
          <div className="lp-container">
            <p className="lp-olho lp-olho--centro">Por que ensina.dev</p>
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

        <section className="lp-secao lp-secao--alt" id="como-funciona">
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
        </div>
        <div className="lp-container lp-rodape__base">
          <span>© {new Date().getFullYear()} ensina.dev. Todos os direitos reservados.</span>
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
