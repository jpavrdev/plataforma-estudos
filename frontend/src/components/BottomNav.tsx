import { Link, useLocation } from 'react-router-dom';
import { House, BookOpen, Code, Lightbulb, User } from './Icons';

const TABS = [
  { to: '/home', label: 'Início', Icon: House },
  { to: '/trilhas', label: 'Trilhas', Icon: BookOpen },
  { to: '/desafios', label: 'Desafios', Icon: Code },
  { to: '/simulados', label: 'Simulados', Icon: Lightbulb },
  { to: '/perfil', label: 'Perfil', Icon: User },
];

// Rotas onde a barra inferior não aparece: autenticação, fluxos focados
// (aula, editor de desafio, prova, detalhe de trilha) e o estúdio (admin).
const OCULTAR_EXATO = new Set([
  '/',
  '/cadastro',
  '/verificar-email',
  '/recuperar-senha',
  '/redefinir-senha',
  '/auth/callback',
  '/completar-perfil',
]);
const OCULTAR_PREFIXO = ['/estudio', '/certificados/'];
const OCULTAR_REGEX = [/^\/trilhas\/.+/, /^\/desafios\/.+/, /^\/simulados\/.+/, /^\/roadmaps\/.+/];

// Barra de navegação inferior, exibida apenas no telefone (controlado por CSS).
export function BottomNav() {
  const { pathname } = useLocation();
  const oculto =
    OCULTAR_EXATO.has(pathname) ||
    OCULTAR_PREFIXO.some((p) => pathname.startsWith(p)) ||
    OCULTAR_REGEX.some((r) => r.test(pathname));
  if (oculto) return null;

  return (
    <nav className="botnav" aria-label="Navegação">
      {TABS.map(({ to, label, Icon }) => {
        const ativo = pathname === to || pathname.startsWith(to + '/');
        return (
          <Link key={to} to={to} className={`botnav__item${ativo ? ' botnav__item--on' : ''}`}>
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
