import api from './api';

export interface CertificadoStatus {
  emitido: { code: string; issuedAt: string } | null;
  elegivel: boolean;
  motivo?: 'indisponivel' | 'carga_horaria' | 'manual' | 'progresso';
}

export interface CertificadoPublico {
  code: string;
  studentName: string;
  cpf: string;
  trailName: string;
  language: string | null;
  workloadHours: number;
  startedAt: string;
  completedAt: string;
  issuedAt: string;
}

export async function statusCertificado(trailId: string) {
  const { data } = await api.get<CertificadoStatus>(`/trails/${trailId}/certificado`);
  return data;
}

export async function emitirCertificado(trailId: string, cpf: string) {
  const { data } = await api.post<{ code: string; issuedAt: string }>(
    `/trails/${trailId}/certificado`,
    { cpf },
  );
  return data;
}

export async function validarCertificado(code: string) {
  const { data } = await api.get<CertificadoPublico>(`/certificados/${code}`);
  return data;
}

export function urlPdfCertificado(code: string) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return `${base}/certificados/${code}/pdf`;
}
