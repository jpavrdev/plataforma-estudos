import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSorteioAtivo } from '../../contexts/SorteioContext';
import { useNavPrincipal } from '../../hooks/useNavPrincipal';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Calendar, Flame, Trophy } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { dataHoraPorExtenso } from '../../utils/tempo';
import { FormularioInscricao } from './FormularioInscricao';

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
  const { user: authUser } = useAuth();
  const nav = useNavPrincipal();
  const { sorteio, carregando, erro, recarregar } = useSorteioAtivo();
  const nome = authUser?.name ?? '';

  let conteudo: ReactNode;
  if (carregando) {
    conteudo = <p className="track__desc">Carregando...</p>;
  } else if (sorteio) {
    conteudo = (
      <>
        <div className="srt__cabecalho">
          <span className="srt__selo">
            <Trophy size={13} /> Sorteio aberto
          </span>
          <h1 className="srt__titulo">{sorteio.titulo}</h1>
          <p className="srt__descricao">{sorteio.descricao}</p>
          <p className="srt__prazo">
            <Calendar size={15} /> Inscrições até {dataHoraPorExtenso(sorteio.fim)}
          </p>
        </div>
        {/* Só remonta quando a inscrição muda: a busca periódica não apaga o que foi digitado. */}
        <FormularioInscricao
          key={`${sorteio.id}:${sorteio.participacao?.atualizadoEm ?? 'sem-inscricao'}`}
          sorteio={sorteio}
        />
      </>
    );
  } else if (erro) {
    conteudo = (
      <Aviso
        titulo="Não foi possível carregar o sorteio"
        texto="Confira sua conexão e tente de novo."
        acao={
          <button className="btn btn--accent" onClick={() => recarregar()}>
            Tentar de novo
          </button>
        }
      />
    );
  } else {
    conteudo = (
      <Aviso
        titulo="Nenhum sorteio aberto agora"
        texto="Quando um sorteio abrir, ele aparece no menu e as inscrições ficam por aqui."
        acao={
          <Link className="btn btn--ghost" to="/home">
            Voltar ao início
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
