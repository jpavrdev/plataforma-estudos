import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Check } from '../../components/Icons';
import { validarCertificado, type CertificadoPublico } from '../../services/certificados';

function dataBr(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function CertificadoValidar() {
  const { code } = useParams();
  const [cert, setCert] = useState<CertificadoPublico | null>(null);
  const [estado, setEstado] = useState<'carregando' | 'valido' | 'invalido'>('carregando');

  useEffect(() => {
    if (!code) return;
    validarCertificado(code)
      .then((c) => {
        setCert(c);
        setEstado('valido');
      })
      .catch(() => setEstado('invalido'));
  }, [code]);

  return (
    <div className="cert-page">
      <div className="cert-box">
        <Logo variant="solid" size={22} />
        {estado === 'carregando' && <p className="cert-box__msg">Verificando certificado...</p>}

        {estado === 'invalido' && (
          <>
            <h1 className="cert-box__title cert-box__title--erro">Certificado não encontrado</h1>
            <p className="cert-box__msg">
              O código informado não corresponde a nenhum certificado emitido pelo Ensina Dev.
              Confira se digitou o código exatamente como aparece no documento.
            </p>
          </>
        )}

        {estado === 'valido' && cert && (
          <>
            <div className="cert-box__selo">
              <Check size={18} /> Certificado válido
            </div>
            <h1 className="cert-box__title">{cert.trailName}</h1>
            <div className="cert-box__grid">
              <div>
                <span>Emitido para</span>
                <b>{cert.studentName}</b>
              </div>
              <div>
                <span>CPF</span>
                <b>{cert.cpf}</b>
              </div>
              {cert.language && (
                <div>
                  <span>Linguagem</span>
                  <b>{cert.language}</b>
                </div>
              )}
              <div>
                <span>Carga horária</span>
                <b>{cert.workloadHours} horas</b>
              </div>
              <div>
                <span>Período de realização</span>
                <b>
                  {dataBr(cert.startedAt)} a {dataBr(cert.completedAt)}
                </b>
              </div>
              <div>
                <span>Data de emissão</span>
                <b>{dataBr(cert.issuedAt)}</b>
              </div>
              <div>
                <span>Código</span>
                <b>{cert.code}</b>
              </div>
            </div>
            <p className="cert-box__msg">
              Confira se os dados acima batem com o documento apresentado. O PDF só pode ser
              baixado pelo dono do certificado, na página da trilha.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
