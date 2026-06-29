import { GradCap } from './Icons';

interface LogoProps {
  variant?: 'brand' | 'solid';
  size?: number;
  capSize?: number;
}

/**
 * Logo — capelo + wordmark "ensina.dev".
 * variant="brand"  → tile translúcido (uso sobre o painel azul, texto branco)
 * variant="solid"  → tile na cor de destaque (uso sobre fundo claro/escuro)
 */
export function Logo({ variant = 'solid', size = 20, capSize }: LogoProps) {
  const isBrand = variant === 'brand';
  const tile = Math.round(size * 1.55);
  return (
    <div className="logo">
      <span className={`logo__mark logo__mark--${variant}`} style={{ width: tile, height: tile }}>
        <GradCap size={capSize || Math.round(tile * 0.58)} />
      </span>
      <span className="logo__word" style={{ fontSize: size }}>
        ensina
        <span className={isBrand ? 'logo__suffix--brand' : 'logo__suffix'}>.dev</span>
      </span>
    </div>
  );
}
