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

export async function emitirCertificado(trailId: string, cpf: string, name: string) {
  const { data } = await api.post<{ code: string; issuedAt: string }>(
    `/trails/${trailId}/certificado`,
    { cpf, name },
  );
  return data;
}

export async function validarCertificado(code: string) {
  const { data } = await api.get<CertificadoPublico>(`/certificados/${code}`);
  return data;
}

export async function baixarPdfCertificado(code: string) {
  const { data } = await api.get<Blob>(`/certificados/${code}/pdf`, { responseType: 'blob' });
  return data;
}
