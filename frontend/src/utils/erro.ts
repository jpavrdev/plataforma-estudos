import axios from 'axios';

// Extrai a mensagem de erro do backend (campo `erro`) de forma segura,
// usando o type guard do axios em vez de castar para any.
export function mensagemErro(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as { erro?: string } | undefined;
    if (data?.erro) return data.erro;
  }
  return fallback;
}

// Status HTTP do erro, quando for uma resposta de erro do axios.
export function statusErro(e: unknown): number | undefined {
  return axios.isAxiosError(e) ? e.response?.status : undefined;
}
