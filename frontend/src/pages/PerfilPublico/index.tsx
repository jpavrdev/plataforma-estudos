import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  Flame,
  AtSign,
  MapPin,
  Briefcase,
  Calendar,
  Github,
  Linkedin,
  XSocial,
  Check,
  Heart,
  IconeConquista,
} from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { urlImagem } from '../../utils/urlImagem';
import { NAV_PRINCIPAL as NAV } from '../../data/nav';
import { obterPerfilPublico, type PerfilPublicoData } from '../../services/perfis';
import { estadoSeguir, seguir, deixarDeSeguir } from '../../services/comunidade';

const NIVEL: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

function membroDesde(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const s = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function urlSocial(valor: string, prefixo: string): string {
  const v = valor.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (v.includes('.')) return `https://${v.replace(/^\/+/, '')}`;
  return `${prefixo}${v.replace(/^@/, '')}`;
}

export function PerfilPublico() {
  const { username } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [perfil, setPerfil] = useState<PerfilPublicoData | null>(null);
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'nao_encontrado'>('carregando');
  const [copiado, setCopiado] = useState(false);
  const [seguindo, setSeguindo] = useState<boolean | null>(null);
  const [salvandoSeguir, setSalvandoSeguir] = useState(false);

  useEffect(() => {
    if (!username) return;
    setEstado('carregando');
    obterPerfilPublico(username)
      .then((p) => {
        setPerfil(p);
        setEstado('ok');
      })
      .catch(() => setEstado('nao_encontrado'));
  }, [username]);

  useEffect(() => {
    setSeguindo(null);
    if (!username || !isAuthenticated) return;
    estadoSeguir(username)
      .then(setSeguindo)
      .catch(() => setSeguindo(null));
  }, [username, isAuthenticated]);

  async function alternarSeguir() {
    if (!username || salvandoSeguir || seguindo === null) return;
    const antes = seguindo;
    setSeguindo(!antes);
    setSalvandoSeguir(true);
    try {
      if (antes) await deixarDeSeguir(username);
      else await seguir(username);
    } catch {
      setSeguindo(antes);
    } finally {
      setSalvandoSeguir(false);
    }
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${username}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (e) {
      console.error('Falha ao copiar o link:', e);
    }
  }

  const fotoUrl = urlImagem(perfil?.avatarUrl);
  const capaUrl = urlImagem(perfil?.coverUrl);

  return (
    <div className="home-shell">
      <div className="home">
        {isAuthenticated ? (
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
              <Flame size={16} /> {user?.streak ?? 0}
            </div>
            <ThemeToggle inline />
            <UserMenu
              initials={getInitials(user?.name || 'A')}
              level={user?.level ?? 1}
              name={user?.name ?? ''}
              email={user?.email}
            />
          </header>
        ) : (
          <header className="topbar">
            <Logo variant="solid" size={20} to="/" />
            <div className="topbar__spacer" />
            <ThemeToggle inline />
            <Link className="btn btn--ghost" to="/">
              Entrar
            </Link>
          </header>
        )}

        {estado === 'carregando' && (
          <p className="track__desc" style={{ padding: '40px 26px' }}>
            Carregando perfil...
          </p>
        )}

        {estado === 'nao_encontrado' && (
          <p className="track__desc" style={{ padding: '40px 26px' }}>
            Perfil não encontrado. Confira o endereço.
          </p>
        )}

        {estado === 'ok' && perfil && (
          <div className="pf">
            <div className="pf-card">
              <div
                className="pf-banner"
                style={
                  capaUrl
                    ? {
                        backgroundImage: `url(${capaUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : undefined
                }
              >
                {!capaUrl && (
                  <>
                    <span className="pf-banner__glow pf-banner__glow--a" />
                    <span className="pf-banner__glow pf-banner__glow--b" />
                  </>
                )}
              </div>
              <div className="pf-head">
                <div className="pf-avatar-wrap">
                  <div
                    className="pf-avatar"
                    style={{
                      width: 104,
                      height: 104,
                      fontSize: 38,
                      border: '4px solid var(--surface)',
                    }}
                  >
                    {fotoUrl ? <img src={fotoUrl} alt={perfil.name} /> : getInitials(perfil.name)}
                  </div>
                </div>
                <div className="pf-id">
                  <div className="pf-id__row">
                    <span className="pf-id__name">{perfil.name}</span>
                    <span className="pf-id__level">Nível {perfil.level}</span>
                    {perfil.apoiador && (
                      <span className="selo-apoiador selo-apoiador--chip" title="Apoiador do Ensina Dev">
                        <Heart size={12} /> Apoiador
                      </span>
                    )}
                  </div>
                  <div className="pf-id__user">@{perfil.username}</div>
                </div>
                <div className="pf-actions">
                  {isAuthenticated && seguindo !== null && (
                    <button
                      className={`btn ${seguindo ? 'btn--ghost' : 'btn--accent'} pf-actions__btn`}
                      onClick={alternarSeguir}
                      disabled={salvandoSeguir}
                    >
                      {seguindo ? (
                        <>
                          <Check size={14} /> Seguindo
                        </>
                      ) : (
                        'Seguir'
                      )}
                    </button>
                  )}
                  <button className="btn btn--ghost pf-actions__btn" onClick={copiarLink}>
                    {copiado ? (
                      <>
                        <Check size={14} /> Copiado!
                      </>
                    ) : (
                      'Copiar link'
                    )}
                  </button>
                </div>
              </div>
              <div className="pf-stats">
                <Stat
                  value={String(perfil.streak)}
                  label="dias de streak"
                  icon={<Flame size={18} />}
                />
                <Stat value={perfil.xp.toLocaleString('pt-BR')} label="XP total" />
                <Stat value={String(perfil.lessonsCompleted)} label="aulas concluídas" />
                <Stat value={String(perfil.questionsCorrect)} label="exercícios resolvidos" />
                <Stat value={String(perfil.challengesCompleted)} label="desafios resolvidos" />
              </div>
            </div>

            <div className="pf-grid">
              <div className="pf-col">
                <div className="card">
                  <h3 className="card__title card__title--mb">Sobre</h3>
                  <p className="pf-bio">{perfil.bio || 'Sem descrição ainda.'}</p>
                </div>

                <div className="card">
                  <h3 className="card__title card__title--mb">Informações</h3>
                  <div className="pf-fields">
                    <Campo
                      icon={<AtSign size={14} />}
                      label="Usuário"
                      value={`@${perfil.username}`}
                    />
                    <Campo
                      icon={<MapPin size={14} />}
                      label="Localização"
                      value={perfil.location || '—'}
                    />
                    <Campo
                      icon={<Briefcase size={14} />}
                      label="Função"
                      value={perfil.occupation || '—'}
                    />
                    <Campo
                      icon={<Calendar size={14} />}
                      label="Membro desde"
                      value={membroDesde(perfil.memberSince)}
                    />

                    <div>
                      <div className="pf-field__label">Linguagens</div>
                      <div className="pf-langs">
                        {perfil.languages.map((l, i) => (
                          <span key={l + i} className="pf-lang">
                            {l}
                          </span>
                        ))}
                        {perfil.languages.length === 0 && (
                          <span className="pf-field__value" style={{ color: 'var(--muted)' }}>
                            —
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="pf-field__label">Links</div>
                      <div className="pf-links">
                        <LinkSocial
                          icon={<Github size={15} />}
                          value={perfil.github}
                          prefixo="https://github.com/"
                        />
                        <LinkSocial
                          icon={<Linkedin size={15} />}
                          value={perfil.linkedin}
                          prefixo="https://www.linkedin.com/in/"
                        />
                        <LinkSocial
                          icon={<XSocial size={15} />}
                          value={perfil.x}
                          prefixo="https://x.com/"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pf-col">
                {perfil.certificados.length > 0 && (
                  <div className="card">
                    <h3 className="card__title card__title--mb">Certificados</h3>
                    <div className="pf-certs">
                      {perfil.certificados.map((c) => (
                        <Link key={c.code} className="pf-cert" to={`/certificados/${c.code}`}>
                          <div className="pf-cert__name">{c.trailName}</div>
                          <div className="pf-cert__meta">
                            {c.workloadHours} horas
                            {c.language ? ` · ${c.language}` : ''} ·{' '}
                            {new Date(c.issuedAt).toLocaleDateString('pt-BR')} · código {c.code}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card">
                  <h3 className="card__title card__title--mb">Conquistas</h3>
                  {perfil.conquistas.length === 0 ? (
                    <p className="track__desc">Nenhuma conquista desbloqueada.</p>
                  ) : (
                    <div className="pf-badges">
                      {perfil.conquistas.slice(0, 6).map((c) => (
                        <div key={c.id} className="pf-badge">
                          <span className="pf-badge__icon">
                            <IconeConquista chave={c.icon} size={24} />
                          </span>
                          <div className="pf-badge__name">{c.name}</div>
                          <div className="pf-badge__sub">{c.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {perfil.trilhas.length > 0 && (
                  <div className="card">
                    <h3 className="card__title card__title--mb">Trilhas</h3>
                    <div className="pf-certs">
                      {perfil.trilhas.map((t) => (
                        <div key={t.name} className="pf-cert pf-cert--flat">
                          <div className="pf-cert__name">{t.name}</div>
                          <div className="pf-cert__meta">
                            {NIVEL[t.trailLevel]} · {t.completedLessons}/{t.totalLessons} aulas ·{' '}
                            {t.progress}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon?: ReactNode }) {
  return (
    <div className="pf-stat">
      <div className="pf-stat__value">
        {icon && <span className="pf-stat__icon">{icon}</span>}
        {value}
      </div>
      <div className="pf-stat__label">{label}</div>
    </div>
  );
}

function Campo({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="pf-field__label">
        <span className="pf-field__icon">{icon}</span>
        {label}
      </div>
      <div className="pf-field__value">{value}</div>
    </div>
  );
}

function LinkSocial({
  icon,
  value,
  prefixo,
}: {
  icon: ReactNode;
  value: string | null;
  prefixo: string;
}) {
  if (!value) {
    return (
      <div className="pf-link">
        <span className="pf-link__icon">{icon}</span>—
      </div>
    );
  }
  return (
    <a
      className="pf-link pf-link--click"
      href={urlSocial(value, prefixo)}
      target="_blank"
      rel="noreferrer noopener"
    >
      <span className="pf-link__icon">{icon}</span>
      {value}
    </a>
  );
}
