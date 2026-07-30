import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Check, Heart, Star } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { aplicarAccent } from '../../utils/accent';
import { NAV_PRINCIPAL as NAV } from '../../data/nav';
import {
  ACCENTS,
  obterStatusApoio,
  criarCobranca,
  criarAssinaturaRecorrente,
  definirAccent,
  cancelarApoio,
  enviarFundo,
  removerFundo,
  definirVeuFundo,
  type StatusApoio,
  type CobrancaPix,
  type PlanoAvulso,
} from '../../services/apoio';
import { aplicarFundo, aplicarVeu } from '../../utils/accent';
import { urlImagem } from '../../utils/urlImagem';

// Só carrega o recortador quando o apoiador vai ajustar o fundo.
const ImageCropper = lazy(() => import('../../components/ImageCropper'));

const GRATIS = [
  'Desafio de código todo dia',
  'Todas as trilhas e aulas',
  'Ranking global e ligas',
  'Simulados de certificação',
  'Comunidade e perfil completo',
];

const PREMIUM = [
  'Selo de apoiador no perfil e no ranking',
  'Estatísticas avançadas de progresso',
  'Cor e imagem de fundo personalizadas',
  'Aquele carinho de manter o projeto vivo',
];

// Quanto mais longo o compromisso, menor o valor por mês.
const CICLOS: {
  id: PlanoAvulso;
  aba: string;
  selo?: string;
  preco: string;
  periodo: string;
  botao: string;
}[] = [
  { id: 'mensal', aba: 'Mensal', preco: 'R$ 5', periodo: '/mês', botao: 'Assinar por R$ 5/mês' },
  {
    id: 'trimestral',
    aba: 'Trimestral',
    selo: 'R$ 4,67/mês',
    preco: 'R$ 14',
    periodo: '/trimestre',
    botao: 'Assinar por R$ 14/trimestre',
  },
  {
    id: 'anual',
    aba: 'Anual',
    selo: '2 meses grátis',
    preco: 'R$ 50',
    periodo: '/ano',
    botao: 'Assinar por R$ 50/ano',
  },
];

const TIPOS_IMG = ['image/png', 'image/jpeg', 'image/webp'];
// A original nunca sobe: o recorte comprime antes. Aqui só barra exagero.
const MAX_IMG = 10 * 1024 * 1024;

function lerArquivo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'));
    reader.readAsDataURL(file);
  });
}

export function Apoie() {
  const { user: authUser, atualizarUsuario } = useAuth();
  const [ciclo, setCiclo] = useState<PlanoAvulso>('mensal');
  const [status, setStatus] = useState<StatusApoio | null>(null);
  const [cobranca, setCobranca] = useState<CobrancaPix | null>(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [enviandoFundo, setEnviandoFundo] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [cropperFundo, setCropperFundo] = useState<string | null>(null);
  const polling = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputFundo = useRef<HTMLInputElement>(null);
  const debounceCor = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceVeu = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayName = authUser?.name ?? '';
  const initials = getInitials(displayName || 'A');
  const cicloAtual = CICLOS.find((c) => c.id === ciclo) ?? CICLOS[0];

  async function carregarStatus() {
    try {
      const s = await obterStatusApoio();
      setStatus(s);
      return s;
    } catch (e) {
      console.error('Falha ao carregar o status de apoio:', e);
      return null;
    }
  }

  useEffect(() => {
    carregarStatus();
    return () => {
      if (polling.current) clearInterval(polling.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enquanto o QR está na tela, checa a confirmação do pagamento.
  useEffect(() => {
    if (!cobranca) return;
    polling.current = setInterval(async () => {
      const s = await carregarStatus();
      if (s?.apoiador) {
        setCobranca(null);
        atualizarUsuario({ apoiador: true });
        if (polling.current) clearInterval(polling.current);
      }
    }, 4000);
    return () => {
      if (polling.current) clearInterval(polling.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cobranca]);

  async function assinar() {
    if (gerando) return;
    setErro('');
    setGerando(true);
    try {
      // Mensal usa o Pix Automático quando o gateway o oferece; senão, Pix avulso de 30 dias.
      if (ciclo === 'mensal' && status?.pixAutomatico) {
        const { url } = await criarAssinaturaRecorrente();
        window.location.href = url;
        return;
      }
      setCobranca(await criarCobranca(ciclo));
    } catch (e: unknown) {
      const axiosErro = e as { response?: { data?: { erro?: string } } };
      setErro(axiosErro.response?.data?.erro ?? 'Não foi possível gerar a cobrança.');
    } finally {
      setGerando(false);
    }
  }

  async function copiarCodigo() {
    if (!cobranca) return;
    try {
      await navigator.clipboard.writeText(cobranca.brCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (e) {
      console.error('Falha ao copiar o código Pix:', e);
    }
  }

  async function escolherCor(cor: string | null) {
    try {
      await definirAccent(cor);
      aplicarAccent(cor);
      atualizarUsuario({ accent: cor });
    } catch (e) {
      console.error('Falha ao salvar a cor:', e);
    }
  }

  // O seletor livre dispara a cada arrasto: aplica na hora e salva com folga.
  function corLivre(cor: string) {
    aplicarAccent(cor);
    if (debounceCor.current) clearTimeout(debounceCor.current);
    debounceCor.current = setTimeout(() => escolherCor(cor), 600);
  }

  async function escolherFundo(file: File) {
    if (!TIPOS_IMG.includes(file.type)) {
      setAviso('Use uma imagem PNG, JPG ou WEBP.');
      return;
    }
    if (file.size > MAX_IMG) {
      setAviso('Imagem muito grande (máximo 10MB).');
      return;
    }
    const dataUrl = await lerArquivo(file);
    const bitmap = await createImageBitmap(file);
    setAviso(
      bitmap.width < 1280
        ? `Essa imagem tem só ${bitmap.width}px de largura e pode ficar borrada como fundo. O ideal é 1920px ou mais.`
        : '',
    );
    bitmap.close();
    setCropperFundo(dataUrl);
  }

  async function enviarRecorteFundo(dataUrl: string) {
    setCropperFundo(null);
    setEnviandoFundo(true);
    try {
      const { backgroundUrl } = await enviarFundo(dataUrl);
      atualizarUsuario({ backgroundUrl });
      aplicarFundo(urlImagem(backgroundUrl));
    } catch (e) {
      console.error('Falha ao enviar o fundo:', e);
      setAviso('Não foi possível enviar a imagem.');
    } finally {
      setEnviandoFundo(false);
    }
  }

  // O slider dispara a cada arrasto: aplica na hora e salva com folga.
  function regularVeu(dim: number) {
    aplicarVeu(dim);
    atualizarUsuario({ backgroundDim: dim });
    if (debounceVeu.current) clearTimeout(debounceVeu.current);
    debounceVeu.current = setTimeout(async () => {
      try {
        await definirVeuFundo(dim);
      } catch (e) {
        console.error('Falha ao salvar a intensidade do véu:', e);
      }
    }, 600);
  }

  async function tirarFundo() {
    try {
      await removerFundo();
      atualizarUsuario({ backgroundUrl: null });
      aplicarFundo(null);
    } catch (e) {
      console.error('Falha ao remover o fundo:', e);
    }
  }

  async function confirmarCancelamento() {
    if (cancelando) return;
    setCancelando(true);
    try {
      const r = await cancelarApoio();
      await carregarStatus();
      setCancelModal(false);
      setAviso(
        r.pixAuto
          ? 'Assinatura cancelada. Lembre de revogar a autorização do Pix Automático no app do seu banco.'
          : 'Assinatura cancelada. Seus benefícios valem até o fim do período pago.',
      );
    } catch (e) {
      console.error('Falha ao cancelar a assinatura:', e);
    } finally {
      setCancelando(false);
    }
  }

  const apoiador = Boolean(status?.apoiador);

  return (
    <div className="home-shell">
      {cropperFundo && (
        <Suspense fallback={null}>
          <ImageCropper
            image={cropperFundo}
            aspect={16 / 9}
            maxWidth={1920}
            alvoKB={900}
            titulo="Ajustar imagem de fundo"
            onConfirm={enviarRecorteFundo}
            onCancel={() => setCropperFundo(null)}
          />
        </Suspense>
      )}
      <div className="home">
        <header className="topbar">
          <MobileMenu />
          <Logo variant="solid" size={20} to="/home" />
          <nav className="nav">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav__item${item.to === '/apoie' ? ' nav__item--active' : ''}`}
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

        <div className="apoie">
          <div className="apoie__hero">
            <span className="apoie__badge">
              <Star size={13} /> Apoie a plataforma
            </span>
            <h1 className="apoie__title">O Ensina Dev é e sempre será gratuito</h1>
            <p className="apoie__sub">
              Assine só se quiser apoiar o projeto. Por <b>R$ 5/mês</b> você ganha alguns extras e
              ajuda a manter tudo de pé, sem nunca perder acesso ao que já usa.
            </p>

            {!apoiador && (
              <div className="apoie__ciclos">
                {CICLOS.map((c) => (
                  <button
                    key={c.id}
                    className={`apoie__ciclo${ciclo === c.id ? ' apoie__ciclo--on' : ''}`}
                    onClick={() => setCiclo(c.id)}
                  >
                    {c.aba} {c.selo && <span className="apoie__gratis-tag">{c.selo}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {erro && <div className="auth__alert">{erro}</div>}

          {apoiador && (
            <div className="card apoie__ativo">
              <div className="apoie__selo-grande">
                <Heart size={15} /> Você é apoiador
              </div>
              <p className="apoie__ativo-msg">
                {status?.cancelada
                  ? `Sua assinatura está cancelada e não renova. Os benefícios valem até ${status?.expiresAt ? new Date(status.expiresAt).toLocaleDateString('pt-BR') : ''}.`
                  : status?.plano === 'pix_auto'
                    ? 'Sua assinatura renova todo mês pelo Pix Automático. Obrigado por manter o projeto vivo!'
                    : `Seu apoio vale até ${status?.expiresAt ? new Date(status.expiresAt).toLocaleDateString('pt-BR') : ''}. Obrigado por manter o projeto vivo!`}
              </p>
              {aviso && <p className="apoie__aviso">{aviso}</p>}

              <div className="apoie__cores">
                <span className="apoie__cores-label">Sua cor de destaque:</span>
                {ACCENTS.map((cor) => (
                  <button
                    key={cor}
                    className={`apoie__cor${(authUser?.accent ?? ACCENTS[0]) === cor ? ' apoie__cor--on' : ''}`}
                    style={{ background: cor }}
                    onClick={() => escolherCor(cor === ACCENTS[0] ? null : cor)}
                    aria-label={`Usar a cor ${cor}`}
                  />
                ))}
                <label className="apoie__cor apoie__cor--livre" title="Escolher qualquer cor">
                  <input
                    type="color"
                    value={authUser?.accent ?? ACCENTS[0]}
                    onChange={(e) => corLivre(e.target.value)}
                  />
                  +
                </label>
              </div>

              <div className="apoie__fundo">
                <span className="apoie__cores-label">Imagem de fundo do app:</span>
                <button
                  className="btn btn--ghost"
                  onClick={() => inputFundo.current?.click()}
                  disabled={enviandoFundo}
                >
                  {enviandoFundo
                    ? 'Enviando...'
                    : authUser?.backgroundUrl
                      ? 'Trocar imagem'
                      : 'Enviar imagem'}
                </button>
                {authUser?.backgroundUrl && (
                  <button className="btn btn--ghost" onClick={tirarFundo}>
                    Remover
                  </button>
                )}
                <input
                  ref={inputFundo}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) escolherFundo(f);
                    e.target.value = '';
                  }}
                />
              </div>

              {authUser?.backgroundUrl && (
                <div className="apoie__veu">
                  <span className="apoie__cores-label">
                    Intensidade do véu: {authUser?.backgroundDim ?? 60}%
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={5}
                    value={authUser?.backgroundDim ?? 60}
                    onChange={(e) => regularVeu(Number(e.target.value))}
                  />
                  <span className="apoie__veu-dica">
                    Menos véu = imagem mais viva; mais véu = leitura mais fácil.
                  </span>
                </div>
              )}

              {!status?.cancelada && (
                <p className="apoie__cancelar">
                  <button className="link link--btn" onClick={() => setCancelModal(true)}>
                    Cancelar assinatura
                  </button>
                </p>
              )}
            </div>
          )}

          {!apoiador && (
            <div className="apoie__planos">
              <div className="card apoie__plano">
                <div className="apoie__plano-kicker">GRÁTIS</div>
                <div className="apoie__preco-linha">
                  <span className="apoie__preco">R$ 0</span>
                  <span className="apoie__preco-sub">para sempre</span>
                </div>
                <p className="apoie__plano-desc">Tudo que você precisa para aprender.</p>
                <hr className="rule" />
                <div className="apoie__lista">
                  {GRATIS.map((item) => (
                    <div key={item} className="apoie__item">
                      <span className="apoie__check apoie__check--verde">
                        <Check size={12} />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
                <button className="apoie__atual" disabled>
                  <Check size={13} /> Seu plano atual
                </button>
                <p className="apoie__nota">Grátis para sempre, sem pegadinha.</p>
              </div>

              <div className="card apoie__plano apoie__plano--premium">
                <span className="apoie__fita">APOIADOR</span>
                <div className="apoie__plano-kicker apoie__plano-kicker--premium">
                  <span className="apoie__star">
                    <Star size={12} />
                  </span>
                  PREMIUM
                </div>
                <div className="apoie__preco-linha">
                  <span className="apoie__preco">{cicloAtual.preco}</span>
                  <span className="apoie__preco-sub">{cicloAtual.periodo}</span>
                </div>
                <p className="apoie__plano-desc">Cancele quando quiser. Sem fidelidade.</p>
                <hr className="rule" />
                <div className="apoie__lista-titulo">Tudo do grátis, mais:</div>
                <div className="apoie__lista">
                  {PREMIUM.map((item) => (
                    <div key={item} className="apoie__item">
                      <span className="apoie__check apoie__check--azul">
                        <Check size={12} />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
                <button className="btn btn--accent btn--block" onClick={assinar} disabled={gerando}>
                  {gerando ? 'Gerando...' : cicloAtual.botao}
                </button>
                <p className="apoie__nota">Você continua com tudo de graça se não assinar.</p>
              </div>
            </div>
          )}

          <div className="apoie__paywall">
            <span className="apoie__paywall-icone">
              <Heart size={17} />
            </span>
            <p>
              <b>Nada fica atrás de paywall.</b> Desafios diários, trilhas, ranking, simulados e
              comunidade continuam 100% gratuitos. O Premium é só uma forma de apoiar quem quiser.
            </p>
          </div>

          <p className="apoie__rodape">
            Pagamento seguro via <b>Pix</b>
          </p>
        </div>

        {cancelModal && (
          <div className="cmn-overlay">
            <div className="cmn-card">
              <div className="cmn-card__kicker">Assinatura</div>
              <h3 className="cmn-card__title">Cancelar sua assinatura?</h3>
              <p className="cmn-card__msg">
                Você continua com todos os benefícios até{' '}
                <b>
                  {status?.expiresAt
                    ? new Date(status.expiresAt).toLocaleDateString('pt-BR')
                    : 'o fim do período pago'}
                </b>
                . Depois disso, nada renova e nada é cobrado.
                {status?.plano === 'pix_auto' &&
                  ' Como seu plano é o Pix Automático, revogue também a autorização no app do seu banco.'}
              </p>
              <div className="cmn-card__row">
                <button className="btn btn--ghost" onClick={() => setCancelModal(false)}>
                  Voltar
                </button>
                <button
                  className="btn btn--perigo"
                  onClick={confirmarCancelamento}
                  disabled={cancelando}
                >
                  {cancelando ? 'Cancelando...' : 'Cancelar assinatura'}
                </button>
              </div>
            </div>
          </div>
        )}

        {cobranca && (
          <div className="cmn-overlay">
            <div className="cmn-card">
              <div className="cmn-card__kicker">Apoio via Pix</div>
              <h3 className="cmn-card__title">Escaneie para pagar</h3>
              <p className="cmn-card__msg">
                Abra o app do seu banco e escaneie o QR Code, ou copie o código. A confirmação
                aparece aqui sozinha em instantes.
              </p>
              {cobranca.brCodeBase64 && (
                <img
                  className="apoie__qr"
                  src={
                    cobranca.brCodeBase64.startsWith('data:')
                      ? cobranca.brCodeBase64
                      : `data:image/png;base64,${cobranca.brCodeBase64}`
                  }
                  alt="QR Code Pix"
                />
              )}
              <div className="cmn-card__row">
                <button className="btn btn--ghost" onClick={() => setCobranca(null)}>
                  Cancelar
                </button>
                <button className="btn btn--accent" onClick={copiarCodigo}>
                  {copiado ? 'Copiado!' : 'Copiar código Pix'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
