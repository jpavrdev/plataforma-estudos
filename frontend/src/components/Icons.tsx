/* Conjunto de ícones do ensina.dev (stroke = currentColor).
   Uso: <Flame size={16} />, <Search />, etc. */

interface IconProps {
  size?: number;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
});

export const Flame = ({ size = 16 }: IconProps) => (
  <svg {...base(size)} fill="currentColor">
    <path d="M12 23a7 7 0 0 1-7-7c0-3.2 2.2-5.3 3.2-7.4.6 1.9 1.9 2.6 1.9 2.6.2-2.2-.8-5 2-7.8.1 2 1 3.1 2.4 4.6C19.7 12 19 14 19 16a7 7 0 0 1-7 7z" />
  </svg>
);

export const Search = ({ size = 16 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.5" y2="16.5" />
  </svg>
);

export const Trophy = ({ size = 14 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
    <path d="M7 6H4.5v.5A2.5 2.5 0 0 0 7 9M17 6h2.5v.5A2.5 2.5 0 0 1 17 9M9.5 19h5M12 13v6" />
  </svg>
);

export const Check = ({ size = 14 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const Play = ({ size = 13 }: IconProps) => (
  <svg {...base(size)} fill="currentColor">
    <polygon points="6,4 20,12 6,20" />
  </svg>
);

export const Bookmark = ({ size = 19 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12v18l-6-4-6 4z" />
  </svg>
);

export const UserPlus = ({ size = 26 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="9" r="3.4" />
    <path d="M5 20c0-3.6 3.1-5.4 7-5.4s7 1.8 7 5.4" />
  </svg>
);

export const Plus = ({ size = 12 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="12" y1="6" x2="12" y2="18" />
    <line x1="6" y1="12" x2="18" y2="12" />
  </svg>
);

export const Eye = ({ size = 18 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOff = ({ size = 18 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M9.88 9.88a3 3 0 0 0 4.24 4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* Capelo de formatura — símbolo da marca */
export const GradCap = ({ size = 19 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 7 L27.5 11.5 L16 16 L4.5 11.5 Z" fill="currentColor" stroke="none" />
    <path d="M10.5 13.4 V16.6 C10.5 18.6 21.5 18.6 21.5 16.6 V13.4" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M27.5 11.8 V17" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="27.5" cy="18.6" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
