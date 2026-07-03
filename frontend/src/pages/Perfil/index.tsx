import {
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  Flame,
  Search,
  Pencil,
  Check,
  X,
  Camera,
  AtSign,
  MapPin,
  Briefcase,
  Calendar,
  Github,
  Linkedin,
  XSocial,
  Trash,
  IconeConquista,
} from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { tempoRelativo } from '../../utils/tempo';
import { user as homeUser } from '../../data/home';
import {
  obterXp,
  listarLinguagens,
  obterMinhasConquistas,
  obterAtividades,
  obterRanking,
  type MinhaConquista,
  type Atividade,
} from '../../services/trails';
import { urlImagem } from '../../utils/urlImagem';

const NAV = [
  { label: 'Início', to: '/home' },
  { label: 'Trilhas', to: '/trilhas' },
  { label: 'Desafios', to: '/desafios' },
  { label: 'Ranking', to: '/ranking' },
  { label: 'Comunidade', to: '/comunidade' },
];

// Só carrega o recortador quando o usuário vai trocar foto ou capa.
const ImageCropper = lazy(() => import('../../components/ImageCropper'));

interface PerfilData {
  id: string;
  name: string;
  username: string | null;
  usernameChangedAt: string | null;
  email: string;
  bio: string | null;
  location: string | null;
  occupation: string | null;
  languages: string[] | null;
  github: string | null;
  linkedin: string | null;
  x: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  streak: number;
  createdAt: string;
  role?: string;
}

interface Editavel {
  name: string;
  username: string;
  bio: string;
  location: string;
  occupation: string;
  languages: string[];
  github: string;
  linkedin: string;
  x: string;
}

function membroDesde(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const s = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TIPOS_IMG = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_IMG = 4 * 1024 * 1024; // 4MB

function lerArquivo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'));
    reader.readAsDataURL(file);
  });
}

export function Perfil() {
  const { user: authUser, atualizarUsuario } = useAuth();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [xp, setXp] = useState({ xp: 0, level: 1, lessonsCompleted: 0, questionsCorrect: 0 });
  const [carregando, setCarregando] = useState(true);
  const [linguagens, setLinguagens] = useState<string[]>([]);
  const [conquistas, setConquistas] = useState<MinhaConquista[]>([]);
  const [verTodasConquistas, setVerTodasConquistas] = useState(false);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [posicao, setPosicao] = useState<number | null>(null);
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<Editavel>({
    name: '',
    username: '',
    bio: '',
    location: '',
    occupation: '',
    languages: [],
    github: '',
    linkedin: '',
    x: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [cropper, setCropper] = useState<{ image: string; tipo: 'avatar' | 'cover' } | null>(null);
  const inputFoto = useRef<HTMLInputElement>(null);
  const inputCapa = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const [me, stats, langs, conq, ativ, rank] = await Promise.all([
          api.get<PerfilData>('/me'),
          obterXp(),
          listarLinguagens().catch(() => []),
          obterMinhasConquistas().catch(() => []),
          obterAtividades().catch(() => []),
          obterRanking().catch(() => null),
        ]);
        if (!ativo) return;
        setPerfil(me.data);
        setXp(stats);
        setLinguagens(langs.map((l) => l.name));
        setConquistas(conq);
        setAtividades(ativ);
        setPosicao(rank?.me?.position ?? null);
      } catch {
        if (ativo) setErro('Não foi possível carregar o perfil.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  function editar() {
    if (!perfil) return;
    setErro('');
    setDraft({
      name: perfil.name,
      username: perfil.username ?? '',
      bio: perfil.bio ?? '',
      location: perfil.location ?? '',
      occupation: perfil.occupation ?? '',
      languages: (perfil.languages ?? []).filter((l) => linguagens.includes(l)),
      github: perfil.github ?? '',
      linkedin: perfil.linkedin ?? '',
      x: perfil.x ?? '',
    });
    setEditando(true);
  }

  function cancelar() {
    setEditando(false);
    setErro('');
  }

  async function salvar() {
    if (salvando) return;
    setSalvando(true);
    setErro('');
    try {
      const { data } = await api.patch<PerfilData>('/me', draft);
      // Preserva campos derivados (streak) que o PATCH não retorna.
      setPerfil((prev) => (prev ? { ...prev, ...data } : data));
      atualizarUsuario({ name: data.name });
      setEditando(false);
    } catch (e) {
      const msg = (e as { response?: { data?: { erro?: string } } })?.response?.data?.erro;
      setErro(msg ?? 'Não foi possível salvar as alterações.');
    } finally {
      setSalvando(false);
    }
  }

  // Valida o arquivo escolhido e abre o recortador; o envio acontece após o corte.
  async function escolherImagem(file: File, tipo: 'avatar' | 'cover') {
    if (!TIPOS_IMG.includes(file.type)) {
      setErro('Use uma imagem PNG, JPG ou WEBP.');
      return;
    }
    if (file.size > MAX_IMG) {
      setErro('Imagem muito grande (máximo 4MB).');
      return;
    }
    setErro('');
    setCropper({ image: await lerArquivo(file), tipo });
  }

  // Envia a imagem já recortada (data URL) para o avatar ou a capa.
  async function enviarRecorte(dataUrl: string) {
    if (!cropper) return;
    const avatar = cropper.tipo === 'avatar';
    const setBusy = avatar ? setEnviandoFoto : setEnviandoCapa;
    setCropper(null);
    setBusy(true);
    setErro('');
    try {
      const { data } = await api.post<PerfilData>(avatar ? '/me/avatar' : '/me/cover', {
        image: dataUrl,
      });
      setPerfil((prev) => (prev ? { ...prev, ...data } : data));
      if (avatar) atualizarUsuario({ avatarUrl: data.avatarUrl });
    } catch (e) {
      const msg = (e as { response?: { data?: { erro?: string } } })?.response?.data?.erro;
      setErro(msg ?? 'Não foi possível enviar a imagem.');
    } finally {
      setBusy(false);
    }
  }

  // Remove o avatar ou a capa (volta às iniciais / capa padrão).
  async function removerImagem(rota: '/me/avatar' | '/me/cover', setBusy: (v: boolean) => void) {
    setBusy(true);
    setErro('');
    try {
      const { data } = await api.delete<PerfilData>(rota);
      setPerfil((prev) => (prev ? { ...prev, ...data } : data));
      if (rota === '/me/avatar') atualizarUsuario({ avatarUrl: data.avatarUrl });
    } catch (e) {
      const msg = (e as { response?: { data?: { erro?: string } } })?.response?.data?.erro;
      setErro(msg ?? 'Não foi possível remover a imagem.');
    } finally {
      setBusy(false);
    }
  }

  function onPickFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) escolherImagem(file, 'avatar');
  }

  function onPickCapa(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) escolherImagem(file, 'cover');
  }

  function addLang(v: string) {
    if (!v || draft.languages.includes(v)) return;
    setDraft((d) => ({ ...d, languages: [...d.languages, v] }));
  }

  function removeLang(i: number) {
    setDraft((d) => ({ ...d, languages: d.languages.filter((_, idx) => idx !== i) }));
  }

  const displayName = perfil?.name ?? authUser?.name ?? homeUser.name;
  const initials = getInitials(displayName);
  const nivel = xp.level;
  const langsVisiveis = editando ? draft.languages : (perfil?.languages ?? []);
  const langsDisponiveis = linguagens.filter((l) => !draft.languages.includes(l));
  const fotoUrl = urlImagem(perfil?.avatarUrl);
  const capaUrl = urlImagem(perfil?.coverUrl);
  const conquistasGanhas = conquistas.filter((c) => c.earned);

  // Trava de 30 dias para trocar o username.
  const usernameLiberaEm = perfil?.usernameChangedAt
    ? new Date(new Date(perfil.usernameChangedAt).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;
  const usernameTravado = !!usernameLiberaEm && usernameLiberaEm.getTime() > Date.now();

  return (
    <div className="home-shell">
      {cropper && (
        <Suspense fallback={null}>
          <ImageCropper
            image={cropper.image}
            aspect={cropper.tipo === 'avatar' ? 1 : 3}
            round={cropper.tipo === 'avatar'}
            maxWidth={cropper.tipo === 'avatar' ? 512 : 1400}
            titulo={cropper.tipo === 'avatar' ? 'Ajustar foto' : 'Ajustar capa'}
            onConfirm={enviarRecorte}
            onCancel={() => setCropper(null)}
          />
        </Suspense>
      )}
      <div className="home">
        <header className="topbar">
          <MobileMenu />
          <Logo variant="solid" size={20} />
          <nav className="nav">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="nav__item">
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
          <UserMenu initials={initials} level={nivel} name={displayName} email={authUser?.email} />
        </header>

        {carregando ? (
          <p className="track__desc" style={{ padding: '40px 26px' }}>
            Carregando perfil...
          </p>
        ) : !perfil ? (
          <p className="track__desc" style={{ padding: '40px 26px' }}>
            {erro || 'Perfil não encontrado.'}
          </p>
        ) : (
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
                {editando && (
                  <button
                    type="button"
                    className="pf-banner__edit"
                    onClick={() => inputCapa.current?.click()}
                    disabled={enviandoCapa}
                  >
                    <Camera size={14} /> {enviandoCapa ? 'Enviando...' : 'Trocar capa'}
                  </button>
                )}
                {editando && capaUrl && (
                  <button
                    type="button"
                    className="pf-banner__rm"
                    onClick={() => removerImagem('/me/cover', setEnviandoCapa)}
                    disabled={enviandoCapa}
                  >
                    <Trash size={13} /> Remover
                  </button>
                )}
                <input
                  ref={inputCapa}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  onChange={onPickCapa}
                />
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
                    {fotoUrl ? <img src={fotoUrl} alt={perfil.name} /> : initials}
                  </div>
                  {editando && (
                    <button
                      type="button"
                      className="pf-avatar-wrap__cam"
                      onClick={() => inputFoto.current?.click()}
                      disabled={enviandoFoto}
                      aria-label="Trocar foto"
                    >
                      <Camera size={14} />
                    </button>
                  )}
                  {editando && fotoUrl && (
                    <button
                      type="button"
                      className="pf-avatar-wrap__rm"
                      onClick={() => removerImagem('/me/avatar', setEnviandoFoto)}
                      disabled={enviandoFoto}
                      aria-label="Remover foto"
                    >
                      <Trash size={13} />
                    </button>
                  )}
                  <input
                    ref={inputFoto}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={onPickFoto}
                  />
                </div>
                <div className="pf-id">
                  <div className="pf-id__row">
                    {editando ? (
                      <input
                        className="pf-id__name-input"
                        value={draft.name}
                        maxLength={255}
                        placeholder="Seu nome"
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      />
                    ) : (
                      <span className="pf-id__name">{perfil.name}</span>
                    )}
                    <span className="pf-id__level">Nível {nivel}</span>
                  </div>
                  <div className="pf-id__user">
                    @{(editando ? draft.username : perfil.username) || 'sem_usuario'}
                  </div>
                </div>
                {!editando ? (
                  <div className="pf-actions">
                    <button className="btn btn--accent pf-actions__btn" onClick={editar}>
                      <Pencil size={14} /> Editar perfil
                    </button>
                  </div>
                ) : (
                  <div className="pf-actions">
                    <button className="btn btn--ghost pf-actions__btn" onClick={cancelar}>
                      Cancelar
                    </button>
                    <button className="pf-save" disabled={salvando} onClick={salvar}>
                      <Check size={15} /> {salvando ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                  </div>
                )}
              </div>
              <div className="pf-stats">
                <Stat
                  value={String(perfil.streak)}
                  label="dias de streak"
                  icon={<Flame size={18} />}
                />
                <Stat value={xp.xp.toLocaleString('pt-BR')} label="XP total" />
                <Stat value={posicao ? `#${posicao}` : '—'} label="no ranking global" />
                <Stat value={String(xp.questionsCorrect)} label="exercícios resolvidos" />
                <Stat value={String(xp.lessonsCompleted)} label="aulas concluídas" />
              </div>
            </div>

            <div className="pf-grid">
              <div className="pf-col">
                <div className="card">
                  <h3 className="card__title card__title--mb">Sobre</h3>
                  {!editando ? (
                    <p className="pf-bio">{perfil.bio || 'Sem descrição ainda.'}</p>
                  ) : (
                    <textarea
                      className="pf-textarea"
                      value={draft.bio}
                      maxLength={500}
                      placeholder="Conte um pouco sobre você"
                      onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                    />
                  )}
                </div>

                <div className="card">
                  <h3 className="card__title card__title--mb">Informações</h3>
                  <div className="pf-fields">
                    {!editando ? (
                      <Campo
                        icon={<AtSign size={14} />}
                        label="Usuário"
                        value={perfil.username ? `@${perfil.username}` : '—'}
                      />
                    ) : (
                      <div>
                        <div className="pf-field__label">
                          <span className="pf-field__icon">
                            <AtSign size={14} />
                          </span>
                          Usuário
                        </div>
                        {usernameTravado ? (
                          <>
                            <div className="pf-field__value">@{perfil.username}</div>
                            <span className="pf-field__hint">
                              Você poderá mudar novamente em{' '}
                              {usernameLiberaEm!.toLocaleDateString('pt-BR')}.
                            </span>
                          </>
                        ) : (
                          <>
                            <input
                              className="pf-input"
                              value={draft.username}
                              maxLength={20}
                              placeholder="seu_usuario"
                              onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                            />
                            <span className="pf-field__hint">
                              Só pode ser alterado uma vez a cada 30 dias.
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    <CampoEdit
                      icon={<MapPin size={14} />}
                      label="Localização"
                      value={perfil.location}
                      editando={editando}
                      draft={draft.location}
                      placeholder="Cidade, País"
                      onChange={(v) => setDraft({ ...draft, location: v })}
                    />
                    <CampoEdit
                      icon={<Briefcase size={14} />}
                      label="Função"
                      value={perfil.occupation}
                      editando={editando}
                      draft={draft.occupation}
                      placeholder="Ex: Estudante de programação"
                      onChange={(v) => setDraft({ ...draft, occupation: v })}
                    />
                    <Campo
                      icon={<Calendar size={14} />}
                      label="Membro desde"
                      value={membroDesde(perfil.createdAt)}
                    />

                    <div>
                      <div className="pf-field__label">Linguagens</div>
                      <div className="pf-langs">
                        {langsVisiveis.map((l, i) => (
                          <span key={l + i} className="pf-lang">
                            {l}
                            {editando && (
                              <button
                                className="pf-lang__x"
                                onClick={() => removeLang(i)}
                                aria-label={`Remover ${l}`}
                              >
                                <X size={11} />
                              </button>
                            )}
                          </span>
                        ))}
                        {editando && langsDisponiveis.length > 0 && (
                          <select
                            className="pf-lang-add"
                            value=""
                            onChange={(e) => addLang(e.target.value)}
                          >
                            <option value="" disabled>
                              + Adicionar
                            </option>
                            {langsDisponiveis.map((l) => (
                              <option key={l} value={l}>
                                {l}
                              </option>
                            ))}
                          </select>
                        )}
                        {!editando && langsVisiveis.length === 0 && (
                          <span className="pf-field__value" style={{ color: 'var(--muted)' }}>
                            —
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="pf-field__label">Links</div>
                      <div className="pf-links">
                        <LinkEdit
                          icon={<Github size={15} />}
                          value={perfil.github}
                          editando={editando}
                          draft={draft.github}
                          placeholder="github.com/voce"
                          prefixo="https://github.com/"
                          onChange={(v) => setDraft({ ...draft, github: v })}
                        />
                        <LinkEdit
                          icon={<Linkedin size={15} />}
                          value={perfil.linkedin}
                          editando={editando}
                          draft={draft.linkedin}
                          placeholder="linkedin.com/in/voce"
                          prefixo="https://www.linkedin.com/in/"
                          onChange={(v) => setDraft({ ...draft, linkedin: v })}
                        />
                        <LinkEdit
                          icon={<XSocial size={15} />}
                          value={perfil.x}
                          editando={editando}
                          draft={draft.x}
                          placeholder="x.com/voce"
                          prefixo="https://x.com/"
                          onChange={(v) => setDraft({ ...draft, x: v })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pf-col">
                <div className="card">
                  <div className="card__head">
                    <h3 className="card__title">Conquistas</h3>
                    {conquistasGanhas.length > 6 && (
                      <button
                        type="button"
                        className="link"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          font: 'inherit',
                        }}
                        onClick={() => setVerTodasConquistas((v) => !v)}
                      >
                        {verTodasConquistas ? 'Ver menos' : 'Ver todas'}
                      </button>
                    )}
                  </div>
                  {conquistasGanhas.length === 0 ? (
                    <p className="track__desc">Nenhuma conquista desbloqueada.</p>
                  ) : (
                    <div className="pf-badges">
                      {(verTodasConquistas ? conquistasGanhas : conquistasGanhas.slice(0, 6)).map(
                        (c) => (
                          <div key={c.id} className="pf-badge">
                            <span className="pf-badge__icon">
                              <IconeConquista chave={c.icon} size={24} />
                            </span>
                            <div className="pf-badge__name">{c.name}</div>
                            <div className="pf-badge__sub">{c.description}</div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
                <div className="card">
                  <h3 className="card__title card__title--mb">Atividade recente</h3>
                  {atividades.length === 0 ? (
                    <p className="track__desc">
                      Nenhuma atividade ainda. Conclua uma aula para começar.
                    </p>
                  ) : (
                    <div className="pf-timeline">
                      {atividades.map((a, i) => (
                        <div key={i} className="pf-act">
                          <span
                            className={`pf-act__icon pf-act__icon--${a.type === 'achievement' ? 'accent' : 'green'}`}
                          >
                            <IconeConquista chave={a.icon} size={14} />
                          </span>
                          <div className="pf-act__body">
                            <div className="pf-act__text">{a.text}</div>
                            <div className="pf-act__time">{tempoRelativo(a.at)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {erro && (
              <div className="auth__alert" style={{ marginTop: 16 }}>
                {erro}
              </div>
            )}
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

interface CampoEditProps {
  icon: ReactNode;
  label: string;
  value: string | null;
  editando: boolean;
  draft: string;
  placeholder?: string;
  onChange: (v: string) => void;
}

function CampoEdit({ icon, label, value, editando, draft, placeholder, onChange }: CampoEditProps) {
  return (
    <div>
      <div className="pf-field__label">
        <span className="pf-field__icon">{icon}</span>
        {label}
      </div>
      {!editando ? (
        <div className="pf-field__value">{value || '—'}</div>
      ) : (
        <input
          className="pf-input"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

interface LinkEditProps {
  icon: ReactNode;
  value: string | null;
  editando: boolean;
  draft: string;
  placeholder?: string;
  prefixo: string;
  onChange: (v: string) => void;
}

// Monta a URL do link: aceita URL completa, domínio com caminho (github.com/voce) ou só o usuário.
function urlSocial(valor: string, prefixo: string): string {
  const v = valor.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (v.includes('.')) return `https://${v.replace(/^\/+/, '')}`;
  return `${prefixo}${v.replace(/^@/, '')}`;
}

function LinkEdit({ icon, value, editando, draft, placeholder, prefixo, onChange }: LinkEditProps) {
  if (!editando) {
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
  return (
    <div className="pf-link-edit">
      <span className="pf-link__icon">{icon}</span>
      <input
        className="pf-input pf-input--bare"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
