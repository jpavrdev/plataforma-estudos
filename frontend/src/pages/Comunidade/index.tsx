import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  Flame,
  Search,
  House,
  Users,
  Help,
  Check,
  Trophy,
  Code,
  Camera,
  Heart,
  ChatBubble,
  Share,
  Zap,
  Plus,
  X,
} from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { tempoRelativo } from '../../utils/tempo';
import { urlImagem } from '../../utils/urlImagem';
import { comprimirImagem, lerArquivoComoDataUrl } from '../../utils/comprimirImagem';
import { NAV_PRINCIPAL as NAV } from '../../data/nav';
import { getDesafioDoDia, type DesafioDetalhe } from '../../services/desafios';
import {
  obterFeed,
  obterLateral,
  publicarPost,
  alternarCurtida,
  obterPost,
  comentarPost,
  curtirComentario,
  seguir,
  enviarImagem,
  type FeedPost,
  type FiltroFeed,
  type PostKind,
  type BarraLateral,
  type Comentario,
} from '../../services/comunidade';

const PALETA_AVATAR = ['#5b8def', '#2e9e6b', '#d9536b', '#9b6cd6', '#e0a82e', '#2d6bf5', '#e0653b'];

function corDoNome(chave: string): string {
  let h = 0;
  for (let i = 0; i < chave.length; i++) h = (h * 31 + chave.charCodeAt(i)) >>> 0;
  return PALETA_AVATAR[h % PALETA_AVATAR.length];
}

const KIND_META: Record<Exclude<PostKind, 'post'>, { label: string; cls: string; Icon: typeof Help }> = {
  duvida: { label: 'Dúvida', cls: 'ct--duvida', Icon: Help },
  solucao: { label: 'Solução', cls: 'ct--solucao', Icon: Check },
  conquista: { label: 'Conquista', cls: 'ct--conquista', Icon: Trophy },
};

const MENU_ESQUERDO: { key: FiltroFeed; label: string; Icon: typeof House }[] = [
  { key: 'para-voce', label: 'Para você', Icon: House },
  { key: 'seguindo', label: 'Seguindo', Icon: Users },
  { key: 'duvida', label: 'Dúvidas', Icon: Help },
  { key: 'solucao', label: 'Soluções', Icon: Check },
  { key: 'conquista', label: 'Conquistas', Icon: Trophy },
];

const TABS: { key: FiltroFeed; label: string }[] = [
  { key: 'recentes', label: 'Recentes' },
  { key: 'em-alta', label: 'Em alta' },
  { key: 'sem-resposta', label: 'Sem resposta' },
];

const FILTRO_PRINCIPAL: FiltroFeed[] = ['para-voce', 'recentes', 'em-alta', 'sem-resposta'];

const KINDS_COMPOR: { key: PostKind; label: string }[] = [
  { key: 'post', label: 'Post' },
  { key: 'duvida', label: 'Dúvida' },
  { key: 'solucao', label: 'Solução' },
  { key: 'conquista', label: 'Conquista' },
];

function AvatarPessoa({
  name,
  avatarUrl,
  chave,
  className = '',
}: {
  name: string;
  avatarUrl: string | null;
  chave: string;
  className?: string;
}) {
  const url = urlImagem(avatarUrl);
  if (url) return <img src={url} alt={name} className={`com-av ${className}`} />;
  return (
    <span className={`com-av com-av--txt ${className}`} style={{ background: corDoNome(chave) }}>
      {getInitials(name || '?')}
    </span>
  );
}

export function Comunidade() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [filtro, setFiltro] = useState<FiltroFeed>('para-voce');
  const [tag, setTag] = useState<string | null>(params.get('tag'));
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [lateral, setLateral] = useState<BarraLateral | null>(null);
  const [desafio, setDesafio] = useState<DesafioDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [copiado, setCopiado] = useState<string | null>(null);
  const [seguindo, setSeguindo] = useState<Set<string>>(new Set());
  const [comporAberto, setComporAberto] = useState(false);

  const displayName = user?.name ?? '';
  const initials = getInitials(displayName || 'A');

  async function carregarFeed(f: FiltroFeed, t: string | null) {
    setCarregando(true);
    setErro('');
    try {
      setPosts(await obterFeed(f, t));
    } catch {
      setErro('Não foi possível carregar o feed. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarFeed(filtro, tag);
  }, [filtro, tag]);

  useEffect(() => {
    obterLateral().then(setLateral).catch(() => setLateral(null));
    getDesafioDoDia().then(setDesafio).catch(() => setDesafio(null));
  }, []);

  function abrirTag(t: string) {
    setTag(t);
    setFiltro('para-voce');
    setParams(t ? { tag: t } : {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function limparTag() {
    setTag(null);
    setParams({});
  }

  function selecionarFiltro(f: FiltroFeed) {
    setTag(null);
    setParams({});
    setFiltro(f);
  }

  async function toggleCurtida(post: FeedPost) {
    const eraCurtido = post.curtido;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, curtido: !eraCurtido, likes: p.likes + (eraCurtido ? -1 : 1) } : p,
      ),
    );
    try {
      const r = await alternarCurtida(post.id);
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, curtido: r.curtido, likes: r.likes } : p)));
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, curtido: eraCurtido, likes: post.likes } : p)),
      );
    }
  }

  function compartilhar(post: FeedPost) {
    const link = `${window.location.origin}/comunidade?post=${post.id}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopiado(post.id);
    setTimeout(() => setCopiado((c) => (c === post.id ? null : c)), 1600);
  }

  async function seguirSugestao(username: string) {
    setSeguindo((prev) => new Set(prev).add(username));
    try {
      await seguir(username);
    } catch {
      setSeguindo((prev) => {
        const n = new Set(prev);
        n.delete(username);
        return n;
      });
    }
  }

  const postsFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return posts;
    return posts.filter(
      (p) =>
        p.content.toLowerCase().includes(termo) ||
        p.autor.name.toLowerCase().includes(termo) ||
        (p.autor.username ?? '').toLowerCase().includes(termo) ||
        p.tags.some((t) => t.includes(termo)),
    );
  }, [posts, busca]);

  const postDestaque = params.get('post');

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
                className={`nav__item${item.to === '/comunidade' ? ' nav__item--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="topbar__spacer" />
          <label className="searchbar com-search">
            <Search size={16} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar na comunidade…"
            />
          </label>
          <div className="streak-pill">
            <Flame size={16} /> {user?.streak ?? 0}
          </div>
          <ThemeToggle inline />
          <UserMenu
            initials={initials}
            level={user?.level ?? 1}
            name={displayName}
            email={user?.email}
          />
        </header>

        <div className="com">
          <aside className="com__left">
            <nav className="com-menu">
              {MENU_ESQUERDO.map(({ key, label, Icon }) => {
                const ativo =
                  key === 'para-voce' ? FILTRO_PRINCIPAL.includes(filtro) && !tag : filtro === key && !tag;
                const badge = key === 'duvida' ? lateral?.duvidasAbertas ?? 0 : 0;
                return (
                  <button
                    key={key}
                    className={`com-menu__item${ativo ? ' com-menu__item--on' : ''}`}
                    onClick={() => selecionarFiltro(key)}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                    {badge > 0 && <span className="com-menu__badge">{badge}</span>}
                  </button>
                );
              })}
            </nav>

            {lateral && lateral.topicos.length > 0 && (
              <div className="card com-topicos">
                <div className="com-topicos__titulo">Tópicos populares</div>
                {lateral.topicos.map((t) => (
                  <button key={t.tag} className="com-topicos__item" onClick={() => abrirTag(t.tag)}>
                    <span className="com-topicos__tag">#{t.tag}</span>
                    <span className="com-topicos__n">{formatarMilhar(t.count)}</span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <main className="com__feed">
            {/* Composer inline (desktop). No telefone some e dá lugar ao "+". */}
            <div className="com-composer-inline">
              <Composer
                nome={displayName}
                avatarUrl={user?.avatarUrl ?? null}
                chave={user?.username ?? user?.email ?? displayName}
                apoiador={Boolean(user?.apoiador)}
                onPublicado={() => carregarFeed(filtro, tag)}
              />
            </div>

            {tag ? (
              <div className="com-tagbar">
                <span>
                  Publicações com <strong>#{tag}</strong>
                </span>
                <button onClick={limparTag} className="com-tagbar__x">
                  <X size={14} /> limpar
                </button>
              </div>
            ) : (
              FILTRO_PRINCIPAL.includes(filtro) && (
                <div className="com-tabs">
                  {TABS.map((t) => {
                    const ativo = filtro === t.key || (t.key === 'recentes' && filtro === 'para-voce');
                    return (
                      <button
                        key={t.key}
                        className={`com-tab${ativo ? ' com-tab--on' : ''}`}
                        onClick={() => setFiltro(t.key)}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              )
            )}

            {erro && <div className="auth__alert">{erro}</div>}
            {carregando && posts.length === 0 && <p className="com-vazio">Carregando publicações…</p>}
            {!carregando && postsFiltrados.length === 0 && !erro && (
              <p className="com-vazio">
                {busca
                  ? 'Nada encontrado para essa busca.'
                  : tag
                    ? 'Ainda não há publicações com essa tag.'
                    : filtro === 'seguindo'
                      ? 'Você ainda não segue ninguém, ou quem você segue ainda não publicou.'
                      : 'Ainda não há publicações por aqui. Seja o primeiro a compartilhar.'}
              </p>
            )}

            {postsFiltrados.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                destaque={post.id === postDestaque}
                copiado={copiado === post.id}
                onCurtir={() => toggleCurtida(post)}
                onCompartilhar={() => compartilhar(post)}
                onTag={abrirTag}
                onPerfil={(u) => navigate(`/${u}`)}
              />
            ))}
          </main>

          <aside className="com__right">
            <button className="com-desafio" onClick={() => navigate('/desafios')}>
              <div className="com-desafio__eyebrow">Desafio de hoje</div>
              <div className="com-desafio__titulo">{desafio ? desafio.title : 'Desafios diários'}</div>
              <p className="com-desafio__desc">
                {desafio
                  ? `Resolva e ganhe +${desafio.xp} XP. Mantenha sua sequência viva.`
                  : 'Resolva um desafio por dia, ganhe XP e mantenha sua sequência.'}
              </p>
              <span className="com-desafio__cta">
                <Zap size={15} /> {desafio?.solved ? 'Revisar desafio' : 'Resolver agora'}
              </span>
            </button>

            {lateral && lateral.discussoes.length > 0 && (
              <div className="card com-side">
                <div className="com-side__titulo">Discussões em alta</div>
                {lateral.discussoes.map((d) => (
                  <button key={d.id} className="com-disc" onClick={() => compartilharDiscussao(d.id, setParams)}>
                    {d.tag && <span className="com-disc__tag">#{d.tag}</span>}
                    <span className="com-disc__titulo">{d.titulo}</span>
                    <span className="com-disc__n">{d.comentarios} respostas</span>
                  </button>
                ))}
              </div>
            )}

            {lateral && lateral.sugestoes.length > 0 && (
              <div className="card com-side">
                <div className="com-side__titulo">Sugestões para seguir</div>
                {lateral.sugestoes.map((s) => (
                  <div key={s.username} className="com-sug">
                    <button className="com-sug__pessoa" onClick={() => navigate(`/${s.username}`)}>
                      <AvatarPessoa name={s.name} avatarUrl={s.avatarUrl} chave={s.username} />
                      <span className="com-sug__info">
                        <span className="com-sug__nome">{s.name}</span>
                        <span className="com-sug__sub">
                          Nível {s.level}
                          {s.respostas > 0 ? ` · ${s.respostas} respostas` : ''}
                        </span>
                      </span>
                    </button>
                    <button
                      className={`com-sug__btn${seguindo.has(s.username) ? ' com-sug__btn--on' : ''}`}
                      disabled={seguindo.has(s.username)}
                      onClick={() => seguirSugestao(s.username)}
                    >
                      {seguindo.has(s.username) ? 'Seguindo' : 'Seguir'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

        {/* Botão flutuante de compor (telefone), estilo Twitter. */}
        <button
          className="com-fab"
          aria-label="Nova publicação"
          onClick={() => setComporAberto(true)}
        >
          <Plus size={24} />
        </button>

        {comporAberto && (
          <div className="com-modal-scrim" onClick={() => setComporAberto(false)}>
            <div className="com-modal" onClick={(e) => e.stopPropagation()}>
              <div className="com-modal__head">
                <button
                  className="com-modal__x"
                  aria-label="Fechar"
                  onClick={() => setComporAberto(false)}
                >
                  <X size={20} />
                </button>
                <span className="com-modal__titulo">Nova publicação</span>
              </div>
              <Composer
                nome={displayName}
                avatarUrl={user?.avatarUrl ?? null}
                chave={user?.username ?? user?.email ?? displayName}
                apoiador={Boolean(user?.apoiador)}
                iniciarAberto
                onFechar={() => setComporAberto(false)}
                onPublicado={() => {
                  carregarFeed(filtro, tag);
                  setComporAberto(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatarMilhar(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',')}k`;
  return String(n);
}

function compartilharDiscussao(id: string, setParams: ReturnType<typeof useSearchParams>[1]) {
  setParams({ post: id });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function Composer({
  nome,
  avatarUrl,
  chave,
  apoiador,
  onPublicado,
  iniciarAberto = false,
  onFechar,
}: {
  nome: string;
  avatarUrl: string | null;
  chave: string;
  apoiador: boolean;
  onPublicado: () => void;
  iniciarAberto?: boolean;
  onFechar?: () => void;
}) {
  const [aberto, setAberto] = useState(iniciarAberto);
  const [kind, setKind] = useState<PostKind>('post');
  const [content, setContent] = useState('');
  const [comCodigo, setComCodigo] = useState(false);
  const [code, setCode] = useState('');
  const [linguagem, setLinguagem] = useState('javascript');
  const [tagsTexto, setTagsTexto] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setAberto(false);
    setKind('post');
    setContent('');
    setComCodigo(false);
    setCode('');
    setTagsTexto('');
    setImagem(null);
    setErro('');
  }

  async function escolherImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await lerArquivoComoDataUrl(file);
      setImagem(await comprimirImagem(dataUrl));
      setAberto(true);
    } catch {
      setErro('Não foi possível carregar a imagem.');
    }
  }

  async function publicar() {
    if (enviando) return;
    if (!content.trim()) {
      setErro('Escreva algo antes de publicar.');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      let imageUrl: string | undefined;
      if (imagem) imageUrl = await enviarImagem(imagem);
      const tags = tagsTexto
        .split(/[\s,]+/)
        .map((t) => t.replace(/^#/, '').trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 5);
      await publicarPost({
        kind,
        content: content.trim(),
        code: comCodigo && code.trim() ? code : undefined,
        codeLanguage: comCodigo && code.trim() ? linguagem : undefined,
        tags,
        imageUrl,
      });
      reset();
      onPublicado();
    } catch {
      setErro('Não foi possível publicar. Tente novamente.');
      setEnviando(false);
    }
  }

  return (
    <div className="card com-composer">
      <div className="com-composer__topo">
        <AvatarPessoa name={nome} avatarUrl={avatarUrl} chave={chave} />
        {aberto ? (
          <textarea
            className="com-composer__area"
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Compartilhe uma dúvida, solução ou conquista…"
            rows={3}
            maxLength={2000}
          />
        ) : (
          <button className="com-composer__fake" onClick={() => setAberto(true)}>
            Compartilhe uma dúvida, solução ou conquista…
          </button>
        )}
      </div>

      {aberto && (
        <>
          <div className="com-composer__kinds">
            {KINDS_COMPOR.map((k) => (
              <button
                key={k.key}
                className={`com-kchip${kind === k.key ? ' com-kchip--on' : ''}`}
                onClick={() => setKind(k.key)}
              >
                {k.label}
              </button>
            ))}
          </div>

          {comCodigo && (
            <div className="com-composer__code">
              <div className="com-composer__codehead">
                <select value={linguagem} onChange={(e) => setLinguagem(e.target.value)}>
                  {['javascript', 'typescript', 'python', 'java', 'c++', 'go', 'sql', 'html', 'css', 'bash'].map(
                    (l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ),
                  )}
                </select>
                <button onClick={() => setComCodigo(false)} className="com-composer__coderm">
                  <X size={13} /> remover código
                </button>
              </div>
              <textarea
                className="com-composer__codearea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Cole seu código aqui…"
                spellCheck={false}
                rows={5}
              />
            </div>
          )}

          {imagem && (
            <div className="com-composer__img">
              <img src={imagem} alt="Prévia" />
              <button onClick={() => setImagem(null)} className="com-composer__imgrm">
                <X size={14} />
              </button>
            </div>
          )}

          <input
            className="com-composer__tags"
            value={tagsTexto}
            onChange={(e) => setTagsTexto(e.target.value)}
            placeholder="Tags separadas por espaço: logica while array"
          />

          {erro && <div className="com-composer__erro">{erro}</div>}

          <div className="com-composer__acoes">
            <div className="com-composer__ferramentas">
              <button
                className={`com-composer__ferr${comCodigo ? ' com-composer__ferr--on' : ''}`}
                onClick={() => setComCodigo((v) => !v)}
              >
                <Code size={16} /> Código
              </button>
              {apoiador && (
                <>
                  <button className="com-composer__ferr" onClick={() => fileRef.current?.click()}>
                    <Camera size={15} /> Imagem
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={escolherImagem}
                  />
                </>
              )}
            </div>
            <div className="com-composer__enviar">
              <button
                className="com-composer__cancelar"
                onClick={() => {
                  reset();
                  onFechar?.();
                }}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                className="btn btn--accent com-composer__publicar"
                onClick={publicar}
                disabled={enviando || !content.trim()}
              >
                {enviando ? 'Publicando…' : 'Publicar'}
              </button>
            </div>
          </div>
        </>
      )}

      {!aberto && (
        <div className="com-composer__atalhos">
          <button className="com-composer__ferr" onClick={() => { setComCodigo(true); setAberto(true); }}>
            <Code size={16} /> Código
          </button>
          {apoiador && (
            <>
              <button className="com-composer__ferr" onClick={() => fileRef.current?.click()}>
                <Camera size={15} /> Imagem
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={escolherImagem}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ComentarioItem({
  c,
  onCurtir,
  onResponder,
}: {
  c: Comentario;
  onCurtir: () => void;
  onResponder: () => void;
}) {
  return (
    <div className="com-coment">
      <AvatarPessoa
        name={c.autor.name}
        avatarUrl={c.autor.avatarUrl}
        chave={c.autor.username ?? c.autor.name}
      />
      <div className="com-coment__corpo">
        <div className="com-coment__head">
          <span className="com-coment__nome">{c.autor.name}</span>
          <span className="com-coment__lv">Lv {c.autor.level}</span>
          <span className="com-coment__tempo">{tempoRelativo(c.createdAt)}</span>
        </div>
        <p className="com-coment__texto">{c.content}</p>
        <div className="com-coment__acoes">
          <button
            className={`com-coment__acao${c.curtido ? ' com-coment__acao--curtido' : ''}`}
            onClick={onCurtir}
          >
            <Heart size={14} />
            {c.likes > 0 && <span>{c.likes}</span>}
          </button>
          <button className="com-coment__acao" onClick={onResponder}>
            Responder
          </button>
        </div>
      </div>
    </div>
  );
}

function PostCard({
  post,
  destaque,
  copiado,
  onCurtir,
  onCompartilhar,
  onTag,
  onPerfil,
}: {
  post: FeedPost;
  destaque: boolean;
  copiado: boolean;
  onCurtir: () => void;
  onCompartilhar: () => void;
  onTag: (t: string) => void;
  onPerfil: (username: string) => void;
}) {
  const [abertoComentarios, setAbertoComentarios] = useState(destaque);
  const [comentarios, setComentarios] = useState<Comentario[] | null>(null);
  const [carregandoCom, setCarregandoCom] = useState(false);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoCom, setEnviandoCom] = useState(false);
  const [totalCom, setTotalCom] = useState(post.comentarios);
  const [respondendoA, setRespondendoA] = useState<{ threadId: string; nome: string } | null>(null);
  const [textoResposta, setTextoResposta] = useState('');
  const cardRef = useRef<HTMLElement>(null);

  const meta = post.kind !== 'post' ? KIND_META[post.kind] : null;

  useEffect(() => {
    if (destaque && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarComentarios() {
    setCarregandoCom(true);
    try {
      const detalhe = await obterPost(post.id);
      setComentarios(detalhe.comentariosLista);
      setTotalCom(detalhe.comentarios);
    } catch {
      setComentarios([]);
    } finally {
      setCarregandoCom(false);
    }
  }

  function alternarComentarios() {
    const abrir = !abertoComentarios;
    setAbertoComentarios(abrir);
    if (abrir && comentarios === null) carregarComentarios();
  }

  useEffect(() => {
    if (destaque && comentarios === null) carregarComentarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function enviarComentario() {
    const texto = novoComentario.trim();
    if (!texto || enviandoCom) return;
    setEnviandoCom(true);
    try {
      await comentarPost(post.id, texto);
      setNovoComentario('');
      await carregarComentarios();
    } catch (err) {
      console.error('Falha ao comentar; o texto foi mantido para nova tentativa.', err);
    } finally {
      setEnviandoCom(false);
    }
  }

  async function enviarResposta() {
    const texto = textoResposta.trim();
    if (!texto || enviandoCom || !respondendoA) return;
    setEnviandoCom(true);
    try {
      await comentarPost(post.id, texto, respondendoA.threadId);
      setTextoResposta('');
      setRespondendoA(null);
      await carregarComentarios();
    } catch (err) {
      console.error('Falha ao responder; o texto foi mantido para nova tentativa.', err);
    } finally {
      setEnviandoCom(false);
    }
  }

  function alternarResposta(threadId: string, nome: string) {
    setRespondendoA((atual) => (atual?.threadId === threadId ? null : { threadId, nome }));
    setTextoResposta('');
  }

  async function toggleCurtidaComentario(cm: Comentario) {
    const atualiza = (curtido: boolean, likes: number) =>
      setComentarios((prev) =>
        prev ? prev.map((x) => (x.id === cm.id ? { ...x, curtido, likes } : x)) : prev,
      );
    atualiza(!cm.curtido, cm.likes + (cm.curtido ? -1 : 1));
    try {
      const r = await curtirComentario(cm.id);
      atualiza(r.curtido, r.likes);
    } catch {
      atualiza(cm.curtido, cm.likes);
    }
  }

  const principais = comentarios?.filter((c) => !c.parentId) ?? [];
  const respostasPor = new Map<string, Comentario[]>();
  for (const c of comentarios ?? []) {
    if (!c.parentId) continue;
    const arr = respostasPor.get(c.parentId) ?? [];
    arr.push(c);
    respostasPor.set(c.parentId, arr);
  }

  return (
    <article ref={cardRef} className={`com-post${destaque ? ' com-post--destaque' : ''}`}>
      <div className="com-post__head">
        <button className="com-post__autor" onClick={() => post.autor.username && onPerfil(post.autor.username)}>
          <AvatarPessoa name={post.autor.name} avatarUrl={post.autor.avatarUrl} chave={post.autor.username ?? post.autor.name} />
          <span className="com-post__ident">
            <span className="com-post__nome">
              {post.autor.name}
              <span className="com-post__lv">Lv {post.autor.level}</span>
              {post.autor.apoiador && <span className="com-post__apoiador">Apoiador</span>}
            </span>
            <span className="com-post__meta">
              {post.autor.username ? `@${post.autor.username}` : 'sem @'} · {tempoRelativo(post.createdAt)}
            </span>
          </span>
        </button>
        {meta && (
          <span className={`com-ct ${meta.cls}`}>
            <meta.Icon size={13} /> {meta.label}
          </span>
        )}
      </div>

      <p className="com-post__texto">{post.content}</p>

      {post.code && (
        <pre className="com-post__code">
          <code>{post.code}</code>
        </pre>
      )}

      {post.imageUrl && (
        <div className="com-post__imagem">
          <img src={urlImagem(post.imageUrl) ?? ''} alt="Imagem da publicação" loading="lazy" />
        </div>
      )}

      {post.tags.length > 0 && (
        <div className="com-post__tags">
          {post.tags.map((t) => (
            <button key={t} className="com-hash" onClick={() => onTag(t)}>
              #{t}
            </button>
          ))}
        </div>
      )}

      <div className="com-post__acoes">
        <button
          className={`com-acao${post.curtido ? ' com-acao--curtido' : ''}`}
          onClick={onCurtir}
        >
          <Heart size={17} /> {post.likes}
        </button>
        <button className="com-acao" onClick={alternarComentarios}>
          <ChatBubble size={17} /> {totalCom}
        </button>
        <button className="com-acao" onClick={onCompartilhar}>
          <Share size={16} /> {copiado ? 'Copiado!' : 'Compartilhar'}
        </button>
      </div>

      {abertoComentarios && (
        <div className="com-thread">
          <div className="com-thread__novo">
            <textarea
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              placeholder="Escreva um comentário…"
              rows={2}
              maxLength={1000}
            />
            <button
              className="btn btn--accent com-thread__enviar"
              onClick={enviarComentario}
              disabled={enviandoCom || !novoComentario.trim()}
            >
              {enviandoCom ? '...' : 'Responder'}
            </button>
          </div>
          {carregandoCom && <p className="com-thread__vazio">Carregando comentários…</p>}
          {principais.map((c) => (
            <div key={c.id} className="com-fio">
              <ComentarioItem
                c={c}
                onCurtir={() => toggleCurtidaComentario(c)}
                onResponder={() => alternarResposta(c.id, c.autor.name)}
              />
              {(respostasPor.get(c.id) ?? []).map((r) => (
                <div key={r.id} className="com-fio__resposta">
                  <ComentarioItem
                    c={r}
                    onCurtir={() => toggleCurtidaComentario(r)}
                    onResponder={() => alternarResposta(c.id, r.autor.name)}
                  />
                </div>
              ))}
              {respondendoA?.threadId === c.id && (
                <div className="com-thread__novo com-fio__nova">
                  <textarea
                    autoFocus
                    value={textoResposta}
                    onChange={(e) => setTextoResposta(e.target.value)}
                    placeholder={`Responda a ${respondendoA.nome}…`}
                    rows={2}
                    maxLength={1000}
                  />
                  <button
                    className="btn btn--accent com-thread__enviar"
                    onClick={enviarResposta}
                    disabled={enviandoCom || !textoResposta.trim()}
                  >
                    {enviandoCom ? '...' : 'Responder'}
                  </button>
                </div>
              )}
            </div>
          ))}
          {comentarios && comentarios.length === 0 && !carregandoCom && (
            <p className="com-thread__vazio">Ainda não há comentários. Seja o primeiro a responder.</p>
          )}
        </div>
      )}
    </article>
  );
}
