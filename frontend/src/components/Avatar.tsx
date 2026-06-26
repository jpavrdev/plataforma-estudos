interface AvatarProps {
  initials: string;
  background?: string;
  color?: string;
  size?: 'sm' | 'lg';
  className?: string;
}

export function Avatar({
  initials,
  background,
  color = '#fff',
  size = 'sm',
  className = '',
}: AvatarProps) {
  const classes = `avatar avatar--${size}${className ? ` ${className}` : ''}`;
  return (
    <span className={classes} style={{ background, color }}>
      {initials}
    </span>
  );
}
