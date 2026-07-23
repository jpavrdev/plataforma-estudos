import { Link } from 'react-router-dom';
import { GradCap } from './Icons';

interface LogoProps {
  variant?: 'brand' | 'solid';
  size?: number;
  capSize?: number;
  to?: string;
}

/**
 * Logo: capelo + wordmark "Ensina Dev".
 * variant="brand"  → tile translúcido (uso sobre o painel azul, texto branco)
 * variant="solid"  → tile na cor de destaque (uso sobre fundo claro/escuro)
 */
export function Logo({ variant = 'solid', size = 20, capSize, to }: LogoProps) {
  const isBrand = variant === 'brand';
  const tile = Math.round(size * 1.55);
  const conteudo = (
    <>
      <span className={`logo__mark logo__mark--${variant}`} style={{ width: tile, height: tile }}>
        <GradCap size={capSize || Math.round(tile * 0.58)} />
      </span>
      <span className="logo__word" style={{ fontSize: size }}>
        Ensina
        <span className={isBrand ? 'logo__suffix--brand' : 'logo__suffix'}> Dev</span>
      </span>
    </>
  );
  if (to) {
    return (
      <Link className="logo" to={to} aria-label="Ir para o início">
        {conteudo}
      </Link>
    );
  }
  return <div className="logo">{conteudo}</div>;
}
