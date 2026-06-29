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
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
    <path d="M7 6H4.5v.5A2.5 2.5 0 0 0 7 9M17 6h2.5v.5A2.5 2.5 0 0 1 17 9M9.5 19h5M12 13v6" />
  </svg>
);

export const Check = ({ size = 14 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const Play = ({ size = 13 }: IconProps) => (
  <svg {...base(size)} fill="currentColor">
    <polygon points="6,4 20,12 6,20" />
  </svg>
);

export const Bookmark = ({ size = 19 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 3h12v18l-6-4-6 4z" />
  </svg>
);

export const UserPlus = ({ size = 26 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
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

export const ChevronRight = ({ size = 15 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

export const Eye = ({ size = 18 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOff = ({ size = 18 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M9.88 9.88a3 3 0 0 0 4.24 4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const ChevronLeft = ({ size = 13 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 6 9 12 15 18" />
  </svg>
);

export const X = ({ size = 13 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

export const Help = ({ size = 22 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.1 9a3 3 0 1 1 4 2.8c-.9.4-1.6 1.2-1.6 2.2v.5" />
    <line x1="12" y1="18" x2="12" y2="18" />
  </svg>
);

export const Alert = ({ size = 34 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12" y2="17" />
  </svg>
);

export const Trash = ({ size = 16 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const Minus = ({ size = 14 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="6" y1="12" x2="18" y2="12" />
  </svg>
);

export const ChevronDown = ({ size = 12 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const Pencil = ({ size = 15 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

export const AtSign = ({ size = 14 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.9 7.9" />
  </svg>
);

export const MapPin = ({ size = 14 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const Briefcase = ({ size = 14 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export const Calendar = ({ size = 14 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
  </svg>
);

export const Github = ({ size = 15 }: IconProps) => (
  <svg {...base(size)} fill="currentColor">
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.59.69.48A10 10 0 0 0 12 2z" />
  </svg>
);

export const Linkedin = ({ size = 15 }: IconProps) => (
  <svg {...base(size)} fill="currentColor">
    <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.76V21h-4v-5c0-1.19-.02-2.72-1.7-2.72-1.7 0-1.96 1.3-1.96 2.64V21h-4z" />
  </svg>
);

export const Camera = ({ size = 15 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const Star = ({ size = 16 }: IconProps) => (
  <svg {...base(size)} fill="currentColor">
    <path d="M12 2l2.94 5.96 6.58.96-4.76 4.64 1.12 6.56L12 17.77l-5.88 3.09 1.12-6.56L2.5 8.92l6.58-.96z" />
  </svg>
);

export const Medal = ({ size = 16 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8.5 8.5 6 2M15.5 8.5 18 2M9 2h6" />
    <circle cx="12" cy="15" r="6" />
    <path
      d="M12 12.4l.93 1.9 2.07.3-1.5 1.46.35 2.06L12 17.15l-1.85.97.35-2.06-1.5-1.46 2.07-.3z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

// Mapeia a chave de ícone (guardada na conquista) para o componente.
export const CHAVES_ICONE = ['trophy', 'flame', 'star', 'check', 'medal', 'bookmark'] as const;
const MAPA_ICONE = {
  trophy: Trophy,
  flame: Flame,
  star: Star,
  check: Check,
  medal: Medal,
  bookmark: Bookmark,
};

export function IconeConquista({ chave, size = 18 }: { chave: string; size?: number }) {
  const C = MAPA_ICONE[chave as keyof typeof MAPA_ICONE] ?? Trophy;
  return <C size={size} />;
}

export const Lock = ({ size = 14 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const ChevronUp = ({ size = 13 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

/* Capelo de formatura — símbolo da marca */
export const GradCap = ({ size = 19 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 7 L27.5 11.5 L16 16 L4.5 11.5 Z" fill="currentColor" stroke="none" />
    <path
      d="M10.5 13.4 V16.6 C10.5 18.6 21.5 18.6 21.5 16.6 V13.4"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M27.5 11.8 V17" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="27.5" cy="18.6" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
