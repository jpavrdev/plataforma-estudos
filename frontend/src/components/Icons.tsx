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

export const User = ({ size = 22 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6" />
  </svg>
);

export const Lightbulb = ({ size = 22 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3z" />
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

// Logo do X (antigo Twitter).
export const XSocial = ({ size = 15 }: IconProps) => (
  <svg {...base(size)} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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

export const Bug = ({ size = 16 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m8 2 1.88 1.88M14.12 3.88 16 2" />
    <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
    <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4" />
    <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4" />
  </svg>
);

// Mapeia a chave de ícone (guardada na conquista) para o componente.
export const CHAVES_ICONE = ['trophy', 'flame', 'star', 'check', 'medal', 'bookmark', 'bug'] as const;
const MAPA_ICONE = {
  trophy: Trophy,
  flame: Flame,
  star: Star,
  check: Check,
  medal: Medal,
  bookmark: Bookmark,
  bug: Bug,
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

export const ClockExam = ({ size = 18 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const Info = ({ size = 17 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="11" x2="12" y2="16" />
    <line x1="12" y1="8" x2="12" y2="8" />
  </svg>
);

export const Redo = ({ size = 16 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <polyline points="21 3 21 9 15 9" />
  </svg>
);

export const Target = ({ size = 26 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const BookOpen = ({ size = 13 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 6.5C10.5 5 8 4.5 3 4.8V19c5-.3 7.5.2 9 1.7" />
    <path d="M12 6.5C13.5 5 16 4.5 21 4.8V19c-5-.3-7.5.2-9 1.7z" />
  </svg>
);

export const Users = ({ size = 17 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20c0-3.4 3-5.2 6.5-5.2s6.5 1.8 6.5 5.2" />
    <path d="M17 6a3 3 0 0 1 0 6M21 20c0-2.2-1.2-3.8-3.2-4.6" />
  </svg>
);

export const Award = ({ size = 15 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="9" r="5" />
    <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
  </svg>
);

export const Globe = ({ size = 15 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
  </svg>
);

export const DocLines = ({ size = 26 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M9 7h7M9 11h7" />
  </svg>
);

export const Grid4 = ({ size = 17 }: IconProps) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const Zap = ({ size = 16 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2L3 14h8l-1 8 10-12h-8z" />
  </svg>
);

export const Heart = ({ size = 16 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 21C7 16.5 3 13.2 3 9a5 5 0 0 1 9-3.2A5 5 0 0 1 21 9c0 4.2-4 7.5-9 12z" />
  </svg>
);

export const House = ({ size = 18 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10.5V20h12v-9.5" />
  </svg>
);

export const Code = ({ size = 16 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="8 8 4 12 8 16" />
    <polyline points="16 8 20 12 16 16" />
  </svg>
);

export const ChatBubble = ({ size = 16 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" />
  </svg>
);

export const Share = ({ size = 16 }: IconProps) => (
  <svg
    {...base(size)}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 15V4" />
    <path d="m8 8 4-4 4 4" />
    <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
  </svg>
);
