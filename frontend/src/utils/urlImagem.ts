const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Caminhos de upload vêm relativos (ex.: /uploads/avatars/x.png); completa com a origem da API.
export function urlImagem(p: string | null | undefined): string | null {
  if (!p) return null;
  return p.startsWith('http') ? p : `${API_BASE}${p}`;
}
