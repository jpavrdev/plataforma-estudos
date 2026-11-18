import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Check, Heart, Star } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { aplicarAccent } from '../../utils/accent';
import { useNavPrincipal } from '../../hooks/useNavPrincipal';
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

type FreeKey = 'apoie.free1' | 'apoie.free2' | 'apoie.free3' | 'apoie.free4' | 'apoie.free5';
type PremiumKey =
  | 'apoie.premium1'
  | 'apoie.premium2'
  | 'apoie.premium3'
  | 'apoie.premium4'
  | 'apoie.premium5';
type CycleTab = 'apoie.monthly' | 'apoie.quarterly' | 'apoie.yearly';
type PeriodKey = 'apoie.perMonth' | 'apoie.perQuarter' | 'apoie.perYear';
type CtaKey = 'apoie.ctaMonthly' | 'apoie.ctaQuarterly' | 'apoie.ctaYearly';

const GRATIS: FreeKey[] = ['apoie.free1', 'apoie.free2', 'apoie.free3', 'apoie.free4', 'apoie.free5'];

const PREMIUM: PremiumKey[] = [
  'apoie.premium1',
  'apoie.premium2',
  'apoie.premium3',
  'apoie.premium4',
  'apoie.premium5',
];

// Quanto mais longo o compromisso, menor o valor por mês.
const CICLOS: {
  id: PlanoAvulso;
  aba: CycleTab;
  selo?: 'apoie.quarterlySelo' | 'apoie.yearlySelo';
  preco: string;
  periodo: PeriodKey;
  botao: CtaKey;
}[] = [
  {
    id: 'mensal',
    aba: 'apoie.monthly',
    preco: 'R$ 5',
    periodo: 'apoie.perMonth',
    botao: 'apoie.ctaMonthly',
  },
  {
    id: 'trimestral',
    aba: 'apoie.quarterly',
    selo: 'apoie.quarterlySelo',
    preco: 'R$ 14',
    periodo: 'apoie.perQuarter',
    botao: 'apoie.ctaQuarterly',
  },
  {
    id: 'anual',
    aba: 'apoie.yearly',
    selo: 'apoie.yearlySelo',
    preco: 'R$ 50',
    periodo: 'apoie.perYear',
    botao: 'apoie.ctaYearly',
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
  const { t, i18n } = useTranslation();
  const nav = useNavPrincipal();
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
      setErro(axiosErro.response?.data?.erro ?? t('apoie.chargeError'));
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
      setAviso(t('apoie.imgTypeError'));
      return;
    }
    if (file.size > MAX_IMG) {
      setAviso(t('apoie.imgSizeError'));
      return;
    }
    const dataUrl = await lerArquivo(file);
    const bitmap = await createImageBitmap(file);
    setAviso(bitmap.width < 1280 ? t('apoie.narrowImg', { width: bitmap.width }) : '');
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
      setAviso(t('apoie.imgSendError'));
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
      setAviso(r.pixAuto ? t('apoie.cancelledAutoToast') : t('apoie.cancelledToast'));
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
            titulo={t('apoie.cropTitle')}
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
            {nav.map((item) => (
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
              <Star size={13} /> {t('apoie.badge')}
            </span>
            <h1 className="apoie__title">{t('apoie.title')}</h1>
            <p className="apoie__sub">
              <Trans i18nKey="apoie.sub" components={{ b: <b /> }} />
            </p>

            {!apoiador && (
              <div className="apoie__ciclos">
                {CICLOS.map((c) => (
                  <button
                    key={c.id}
                    className={`apoie__ciclo${ciclo === c.id ? ' apoie__ciclo--on' : ''}`}
                    onClick={() => setCiclo(c.id)}
                  >
                    {t(c.aba)} {c.selo && <span className="apoie__gratis-tag">{t(c.selo)}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {erro && <div className="auth__alert">{erro}</div>}

          {apoiador && (
            <div className="card apoie__ativo">
              <div className="apoie__selo-grande">
                <Heart size={15} /> {t('apoie.supporterBadge')}
              </div>
              <p className="apoie__ativo-msg">
                {status?.cancelada
                  ? t('apoie.statusCancelled', {
                      date: status?.expiresAt
                        ? new Date(status.expiresAt).toLocaleDateString(i18n.language)
                        : '',
                    })
                  : status?.plano === 'pix_auto'
                    ? t('apoie.statusAuto')
                    : t('apoie.statusActive', {
                        date: status?.expiresAt
                          ? new Date(status.expiresAt).toLocaleDateString(i18n.language)
                          : '',
                      })}
              </p>
              {aviso && <p className="apoie__aviso">{aviso}</p>}

              <div className="apoie__cores">
                <span className="apoie__cores-label">{t('apoie.accentLabel')}</span>
                {ACCENTS.map((cor) => (
                  <button
                    key={cor}
                    className={`apoie__cor${(authUser?.accent ?? ACCENTS[0]) === cor ? ' apoie__cor--on' : ''}`}
                    style={{ background: cor }}
                    onClick={() => escolherCor(cor === ACCENTS[0] ? null : cor)}
                    aria-label={t('apoie.useColorAria', { color: cor })}
                  />
                ))}
                <label className="apoie__cor apoie__cor--livre" title={t('apoie.anyColor')}>
                  <input
                    type="color"
                    value={authUser?.accent ?? ACCENTS[0]}
                    onChange={(e) => corLivre(e.target.value)}
                  />
                  +
                </label>
              </div>

              <div className="apoie__fundo">
                <span className="apoie__cores-label">{t('apoie.bgLabel')}</span>
                <button
                  className="btn btn--ghost"
                  onClick={() => inputFundo.current?.click()}
                  disabled={enviandoFundo}
                >
                  {enviandoFundo
                    ? t('common.sending')
                    : authUser?.backgroundUrl
                      ? t('apoie.changeImage')
                      : t('apoie.uploadImage')}
                </button>
                {authUser?.backgroundUrl && (
                  <button className="btn btn--ghost" onClick={tirarFundo}>
                    {t('apoie.remove')}
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
                    {t('apoie.veilLabel', { value: authUser?.backgroundDim ?? 60 })}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={5}
                    value={authUser?.backgroundDim ?? 60}
                    onChange={(e) => regularVeu(Number(e.target.value))}
                  />
                  <span className="apoie__veu-dica">{t('apoie.veilHint')}</span>
                </div>
              )}

              {!status?.cancelada && (
                <p className="apoie__cancelar">
                  <button className="link link--btn" onClick={() => setCancelModal(true)}>
                    {t('apoie.cancelSubscription')}
                  </button>
                </p>
              )}
            </div>
          )}

          {!apoiador && (
            <div className="apoie__planos">
              <div className="card apoie__plano">
                <div className="apoie__plano-kicker">{t('apoie.freeKicker')}</div>
                <div className="apoie__preco-linha">
                  <span className="apoie__preco">R$ 0</span>
                  <span className="apoie__preco-sub">{t('apoie.freeForever')}</span>
                </div>
                <p className="apoie__plano-desc">{t('apoie.freeDesc')}</p>
                <hr className="rule" />
                <div className="apoie__lista">
                  {GRATIS.map((chave) => (
                    <div key={chave} className="apoie__item">
                      <span className="apoie__check apoie__check--verde">
                        <Check size={12} />
                      </span>
                      {t(chave)}
                    </div>
                  ))}
                </div>
                <button className="apoie__atual" disabled>
                  <Check size={13} /> {t('apoie.currentPlan')}
                </button>
                <p className="apoie__nota">{t('apoie.freeNote')}</p>
              </div>

              <div className="card apoie__plano apoie__plano--premium">
                <span className="apoie__fita">{t('apoie.fita')}</span>
                <div className="apoie__plano-kicker apoie__plano-kicker--premium">
                  <span className="apoie__star">
                    <Star size={12} />
                  </span>
                  {t('apoie.premiumKicker')}
                </div>
                <div className="apoie__preco-linha">
                  <span className="apoie__preco">{cicloAtual.preco}</span>
                  <span className="apoie__preco-sub">{t(cicloAtual.periodo)}</span>
                </div>
                <p className="apoie__plano-desc">{t('apoie.premiumDesc')}</p>
                <hr className="rule" />
                <div className="apoie__lista-titulo">{t('apoie.listTitle')}</div>
                <div className="apoie__lista">
                  {PREMIUM.map((chave) => (
                    <div key={chave} className="apoie__item">
                      <span className="apoie__check apoie__check--azul">
                        <Check size={12} />
                      </span>
                      {t(chave)}
                    </div>
                  ))}
                </div>
                <button className="btn btn--accent btn--block" onClick={assinar} disabled={gerando}>
                  {gerando ? t('apoie.generating') : t(cicloAtual.botao)}
                </button>
                <p className="apoie__nota">{t('apoie.premiumNote')}</p>
              </div>
            </div>
          )}

          <div className="apoie__paywall">
            <span className="apoie__paywall-icone">
              <Heart size={17} />
            </span>
            <p>
              <Trans i18nKey="apoie.paywall" components={{ b: <b /> }} />
            </p>
          </div>

          <p className="apoie__rodape">
            <Trans i18nKey="apoie.footer" components={{ b: <b /> }} />
          </p>
        </div>

        {cancelModal && (
          <div className="cmn-overlay">
            <div className="cmn-card">
              <div className="cmn-card__kicker">{t('apoie.subscriptionKicker')}</div>
              <h3 className="cmn-card__title">{t('apoie.cancelTitle')}</h3>
              <p className="cmn-card__msg">
                <Trans
                  i18nKey="apoie.cancelBody"
                  values={{
                    date: status?.expiresAt
                      ? new Date(status.expiresAt).toLocaleDateString(i18n.language)
                      : t('apoie.endFallback'),
                  }}
                  components={{ b: <b /> }}
                />
                {status?.plano === 'pix_auto' && t('apoie.pixAutoNote')}
              </p>
              <div className="cmn-card__row">
                <button className="btn btn--ghost" onClick={() => setCancelModal(false)}>
                  {t('apoie.back')}
                </button>
                <button
                  className="btn btn--perigo"
                  onClick={confirmarCancelamento}
                  disabled={cancelando}
                >
                  {cancelando ? t('apoie.canceling') : t('apoie.cancelSubscription')}
                </button>
              </div>
            </div>
          </div>
        )}

        {cobranca && (
          <div className="cmn-overlay">
            <div className="cmn-card">
              <div className="cmn-card__kicker">{t('apoie.pixKicker')}</div>
              <h3 className="cmn-card__title">{t('apoie.scanTitle')}</h3>
              <p className="cmn-card__msg">{t('apoie.scanBody')}</p>
              {cobranca.brCodeBase64 && (
                <img
                  className="apoie__qr"
                  src={
                    cobranca.brCodeBase64.startsWith('data:')
                      ? cobranca.brCodeBase64
                      : `data:image/png;base64,${cobranca.brCodeBase64}`
                  }
                  alt={t('apoie.qrAlt')}
                />
              )}
              <div className="cmn-card__row">
                <button className="btn btn--ghost" onClick={() => setCobranca(null)}>
                  {t('common.cancel')}
                </button>
                <button className="btn btn--accent" onClick={copiarCodigo}>
                  {copiado ? t('apoie.copiedCode') : t('apoie.copyPix')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
