import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useSorteioAtivo } from '../../contexts/SorteioContext';
import { useNavPrincipal } from '../../hooks/useNavPrincipal';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Trophy } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { FormularioInscricao } from './FormularioInscricao';
import { InformacoesDoSorteio } from './InformacoesDoSorteio';
import { InscricaoConfirmada } from './InscricaoConfirmada';

function Aviso({ titulo, texto, acao }: { titulo: string; texto: string; acao: ReactNode }) {
  return (
    <div className="card srt__aviso">
      <span className="srt__aviso-icone">
        <Trophy size={20} />
      </span>
      <h1 className="srt__aviso-titulo">{titulo}</h1>
      <p className="srt__aviso-texto">{texto}</p>
      {acao}
    </div>
  );
}

export function Sorteio() {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const nav = useNavPrincipal();
  const { sorteio, carregando, erro, recarregar } = useSorteioAtivo();
  const nome = authUser?.name ?? '';

  let conteudo: ReactNode;
  if (carregando) {
    conteudo = <p className="track__desc">{t('common.loading')}</p>;
  } else if (sorteio?.participacao) {
    conteudo = <InscricaoConfirmada sorteio={sorteio} participacao={sorteio.participacao} />;
  } else if (sorteio) {
    conteudo = (
      <>
        <InformacoesDoSorteio sorteio={sorteio} />
        <FormularioInscricao key={sorteio.id} sorteio={sorteio} />
      </>
    );
  } else if (erro) {
    conteudo = (
      <Aviso
        titulo={t('sorteio.loadTitle')}
        texto={t('sorteio.loadText')}
        acao={
          <button className="btn btn--accent" onClick={() => recarregar()}>
            {t('sorteio.retry')}
          </button>
        }
      />
    );
  } else {
    conteudo = (
      <Aviso
        titulo={t('sorteio.noneTitle')}
        texto={t('sorteio.noneText')}
        acao={
          <Link className="btn btn--ghost" to="/home">
            {t('sorteio.backHome')}
          </Link>
        }
      />
    );
  }

  return (
    <div className="home-shell">
      <div className="home">
        <header className="topbar">
          <MobileMenu />
          <Logo variant="solid" size={20} to="/home" />
          <nav className="nav">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav__item${item.to === '/sorteio' ? ' nav__item--active' : ''}`}
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
            initials={getInitials(nome || 'A')}
            level={authUser?.level ?? 1}
            name={nome}
            email={authUser?.email}
          />
        </header>

        <main className="srt">{conteudo}</main>
      </div>
    </div>
  );
}
