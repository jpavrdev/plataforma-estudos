import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import api from '../../services/api';
import { currentLocale } from '../../i18n';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';
import { LanguageToggle } from '../../components/LanguageToggle';
import challengeScreen from '../../assets/produto-desafio.webp';
import terminalScreen from '../../assets/produto-terminal.webp';
import terminalWebm from '../../assets/produto-terminal.webm';
import terminalMp4 from '../../assets/produto-terminal.mp4';
import progressScreen from '../../assets/produto-progresso.webp';
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

// They come from the backend so the page never shows a number that went stale in
// the code. The field names are the API's.
type PublicStats = {
  trilhas: number;
  aulas: number;
  desafios: number;
  simulados: number;
  questoes: number;
  estudantes: number;
  exerciciosResolvidos: number;
  aulasConcluidas: number;
};

const formatNumber = (n: number) => new Intl.NumberFormat(currentLocale()).format(n);

// Rounds down and adds a "+": 1293 becomes "1,200+", 16138 becomes "16,000+". It
// stays true, the showcase does not change with every new student, and the step
// grows with the magnitude, or a "16,100+" would be too precise for a sales line.
function approximate(n: number): string {
  if (n < 10) return formatNumber(n);
  const step = n >= 10000 ? 1000 : n >= 100 ? 100 : 10;
  return `${formatNumber(Math.floor(n / step) * step)}+`;
}

// A dash while loading and also when the number is zero: in a showcase,
// announcing "0 challenges" is worse than announcing nothing.
function StatNumber({ value }: { value?: number }) {
  if (!value) return <span className="lp-stat__num lp-stat__num--vazio">--</span>;
  return <span className="lp-stat__num">{approximate(value)}</span>;
}

const FEATURES: {
  key: 'dailyChallenge' | 'streak' | 'ranking' | 'tracks' | 'exams' | 'progress';
  icon: ReactNode;
}[] = [
  { key: 'dailyChallenge', icon: <Zap size={20} /> },
  { key: 'streak', icon: <Flame size={20} /> },
  { key: 'ranking', icon: <Trophy size={20} /> },
  { key: 'tracks', icon: <BookOpen size={20} /> },
  { key: 'exams', icon: <ClockExam size={20} /> },
  { key: 'progress', icon: <Target size={20} /> },
];

const STEPS = [
  { n: '01', key: 'signUp' },
  { n: '02', key: 'choose' },
  { n: '03', key: 'comeBack' },
] as const;

// Technologies that have a real track on the platform.
const TECHNOLOGIES = ['Python', 'JavaScript', 'Java', 'Go', 'Linux', 'Docker', 'Kubernetes', 'AWS'];

export function Landing() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<PublicStats>();
  // Whoever asked the system for less motion gets the still final frame, with the
  // same information, instead of the looping video.
  const [reducedMotion] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );

  useEffect(() => {
    let active = true;
    api
      .get<PublicStats>('/estatisticas-publicas')
      .then(({ data }) => {
        if (active) setStats(data);
      })
      .catch((e) => {
        // The page stands without the numbers, so the visit is not interrupted.
        console.error('Could not load the public stats', e);
      });
    return () => {
      active = false;
    };
  }, []);

  const terminalCaption = t('landing.lab.caption');

  return (
    <div className="lp">
      <header className="lp-topbar">
        <div className="lp-container lp-topbar__inner">
          <Logo variant="solid" size={19} to="/" />
          <nav className="lp-nav">
            <a href="#recursos">{t('landing.nav.features')}</a>
            <a href="#trilhas">{t('landing.nav.tracks')}</a>
            <a href="#como-funciona">{t('landing.nav.howItWorks')}</a>
          </nav>
          <div className="lp-topbar__acoes">
            <span className="lp-tema">
              <LanguageToggle inline />
              <ThemeToggle inline />
            </span>
            <Link className="lp-link-entrar" to="/entrar">
              {t('landing.signIn')}
            </Link>
            <Link className="btn btn--accent lp-btn-topo" to="/cadastro">
              {t('landing.startFree')}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-container">
            <div className="lp-hero__texto">
              <span className="lp-badge">
                <Flame size={13} /> {t('landing.hero.badge')}
              </span>
              <h1 className="lp-h1">
                <Trans
                  i18nKey="landing.hero.title"
                  components={{ highlight: <span className="lp-h1__destaque" /> }}
                />
              </h1>
              <p className="lp-lede">{t('landing.hero.lede')}</p>
              <div className="lp-hero__ctas">
                <Link className="btn btn--accent lp-btn-grande" to="/cadastro">
                  {t('landing.hero.createAccount')} <ChevronRight size={14} />
                </Link>
                <a className="btn lp-btn-secundario" href="#como-funciona">
                  {t('landing.hero.seeHow')}
                </a>
              </div>
              <p className="lp-hero__prova">
                {stats ? (
                  <Trans
                    i18nKey="landing.hero.proof"
                    values={{ students: approximate(stats.estudantes) }}
                    components={{ strong: <strong /> }}
                  />
                ) : (
                  t('landing.hero.proofFallback')
                )}
              </p>
            </div>

            <figure className="lp-tela lp-tela--hero">
              <img
                src={challengeScreen}
                width={1400}
                height={683}
                alt={t('landing.hero.screenshotAlt')}
              />
            </figure>
          </div>
        </section>

        <section className="lp-tecnologias" id="trilhas">
          <div className="lp-container">
            <p className="lp-olho lp-olho--centro">{t('landing.technologies.eyebrow')}</p>
            <ul className="lp-tecnologias__lista">
              {TECHNOLOGIES.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
            <p className="lp-tecnologias__nota">
              {stats
                ? t('landing.technologies.more', {
                    tracks: formatNumber(stats.trilhas - TECHNOLOGIES.length),
                  })
                : t('landing.technologies.moreFallback')}
            </p>
          </div>
        </section>

        <section className="lp-numeros">
          <div className="lp-container lp-numeros__grade">
            <div className="lp-stat">
              <StatNumber value={stats?.estudantes} />
              <span className="lp-stat__rotulo">{t('landing.stats.students')}</span>
            </div>
            <div className="lp-stat">
              <StatNumber value={stats?.aulas} />
              <span className="lp-stat__rotulo">{t('landing.stats.lessons')}</span>
            </div>
            <div className="lp-stat">
              <StatNumber value={stats?.desafios} />
              <span className="lp-stat__rotulo">{t('landing.stats.challenges')}</span>
            </div>
            <div className="lp-stat">
              <StatNumber value={stats?.simulados} />
              <span className="lp-stat__rotulo">{t('landing.stats.exams')}</span>
            </div>
          </div>
        </section>

        <section className="lp-secao lp-secao--alt">
          <div className="lp-container lp-destaque">
            <div className="lp-destaque__texto">
              <p className="lp-olho">{t('landing.lab.eyebrow')}</p>
              <h2 className="lp-destaque__titulo">{t('landing.lab.title')}</h2>
              <p className="lp-destaque__lede">
                <Trans
                  i18nKey="landing.lab.lede"
                  components={{ code: <code className="code-inline" /> }}
                />
              </p>
              <ul className="lp-lista">
                <li>{t('landing.lab.noInstall')}</li>
                <li>{t('landing.lab.realPermissions')}</li>
                <li>{t('landing.lab.lessons')}</li>
              </ul>
            </div>
            <figure className="lp-tela">
              {reducedMotion ? (
                <img src={terminalScreen} width={1240} height={500} alt={terminalCaption} />
              ) : (
                <video
                  poster={terminalScreen}
                  width={1240}
                  height={500}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label={terminalCaption}
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
            <p className="lp-olho lp-olho--centro">{t('landing.features.eyebrow')}</p>
            <h2 className="lp-h2">{t('landing.features.title')}</h2>
            <p className="lp-sub">{t('landing.features.subtitle')}</p>
            <div className="lp-cards">
              {FEATURES.map((feature) => (
                <article className="lp-card" key={feature.key}>
                  <span className="lp-card__icone">{feature.icon}</span>
                  <h3 className="lp-card__titulo">{t(`landing.features.${feature.key}.title`)}</h3>
                  <p className="lp-card__texto">{t(`landing.features.${feature.key}.text`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-secao lp-secao--alt">
          <div className="lp-container lp-destaque lp-destaque--invertido">
            <div className="lp-destaque__texto">
              <p className="lp-olho">{t('landing.progress.eyebrow')}</p>
              <h2 className="lp-destaque__titulo">{t('landing.progress.title')}</h2>
              <p className="lp-destaque__lede">{t('landing.progress.lede')}</p>
              <ul className="lp-lista">
                <li>{t('landing.progress.activityMap')}</li>
                <li>{t('landing.progress.xp')}</li>
                <li>{t('landing.progress.leagues')}</li>
              </ul>
            </div>
            <figure className="lp-tela">
              <img
                src={progressScreen}
                width={1500}
                height={787}
                alt={t('landing.progress.screenshotAlt')}
              />
            </figure>
          </div>
        </section>

        <section className="lp-secao" id="como-funciona">
          <div className="lp-container">
            <p className="lp-olho lp-olho--centro">{t('landing.steps.eyebrow')}</p>
            <h2 className="lp-h2">{t('landing.steps.title')}</h2>
            <div className="lp-passos">
              {STEPS.map((step) => (
                <article className="lp-passo" key={step.n}>
                  <span className="lp-passo__n">{step.n}</span>
                  <h3 className="lp-card__titulo">{t(`landing.steps.${step.key}.title`)}</h3>
                  <p className="lp-card__texto">{t(`landing.steps.${step.key}.text`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Only shown with the numbers at hand: the sentence makes no sense without them. */}
        {stats && (
          <section className="lp-movimento">
            <div className="lp-container">
              <p className="lp-olho lp-olho--centro">{t('landing.community.eyebrow')}</p>
              <p className="lp-movimento__frase">
                <Trans
                  i18nKey="landing.community.sentence"
                  values={{
                    exercises: approximate(stats.exerciciosResolvidos),
                    lessons: approximate(stats.aulasConcluidas),
                  }}
                  components={{ strong: <strong /> }}
                />
              </p>
            </div>
          </section>
        )}

        <section className="lp-secao">
          <div className="lp-container">
            <div className="lp-cta">
              <h2 className="lp-cta__titulo">{t('landing.cta.title')}</h2>
              <p className="lp-cta__texto">{t('landing.cta.text')}</p>
              <Link className="btn lp-cta__botao" to="/cadastro">
                {t('landing.cta.button')}
              </Link>
              <p className="lp-cta__nota">{t('landing.cta.note')}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-rodape">
        <div className="lp-container lp-rodape__grade">
          <div className="lp-rodape__marca">
            <Logo variant="solid" size={18} />
            <p>
              {stats
                ? t('landing.footer.tagline', {
                    lessons: approximate(stats.aulas),
                    questions: approximate(stats.questoes),
                  })
                : t('landing.footer.taglineFallback')}
            </p>
          </div>
          <nav className="lp-rodape__col">
            <h4>{t('landing.footer.platform')}</h4>
            <a href="#recursos">{t('landing.nav.features')}</a>
            <a href="#trilhas">{t('landing.nav.tracks')}</a>
            <a href="#como-funciona">{t('landing.nav.howItWorks')}</a>
          </nav>
          <nav className="lp-rodape__col">
            <h4>{t('landing.footer.account')}</h4>
            <Link to="/entrar">{t('landing.footer.signIn')}</Link>
            <Link to="/cadastro">{t('landing.footer.createAccount')}</Link>
            <Link to="/recuperar-senha">{t('landing.footer.recoverPassword')}</Link>
          </nav>
          <nav className="lp-rodape__col">
            <h4>{t('landing.footer.legal')}</h4>
            <Link to="/termos">{t('landing.footer.terms')}</Link>
            <Link to="/privacidade">{t('landing.footer.privacy')}</Link>
          </nav>
        </div>
        <div className="lp-container lp-rodape__base">
          <span>{t('landing.footer.rights', { year: new Date().getFullYear() })}</span>
          <span className="lp-rodape__redes">
            {/* The topbar hides its toggles on small screens; here the language stays reachable. */}
            <LanguageToggle inline />
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
