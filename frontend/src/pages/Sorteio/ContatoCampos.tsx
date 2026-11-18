import { useTranslation } from 'react-i18next';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import {
  PAISES,
  ROTULO_CANAL,
  ehCanal,
  nomeDoPais,
  usaDdd,
  type Canal,
  type CampoTexto,
  type ErrosContato,
  type RascunhoContato,
} from '../../utils/contatos';

interface Props {
  titulo: string;
  dica: string;
  opcional?: boolean;
  canais: Canal[];
  rascunho: RascunhoContato;
  erros: ErrosContato;
  onCanal: (canal: Canal | '') => void;
  onCampo: (campo: CampoTexto | 'pais', valor: string) => void;
  onSairDoCampo: (campo: CampoTexto) => void;
}

export function ContatoCampos({
  titulo,
  dica,
  opcional = false,
  canais,
  rascunho,
  erros,
  onCanal,
  onCampo,
  onSairDoCampo,
}: Props) {
  const { t, i18n } = useTranslation();
  const opcoesCanal = [
    ...(opcional ? [{ value: '', label: t('sorteio.noneChannel') }] : []),
    ...canais.map((c) => ({ value: c, label: ROTULO_CANAL[c] })),
  ];
  const opcoesPais = PAISES.map((p) => ({
    value: p.codigo,
    label: `${nomeDoPais(p, i18n.language)} (+${p.ddi})`,
  }));
  const comDdd = usaDdd(rascunho.pais);

  return (
    <fieldset className="srt-contato">
      <legend className="srt-contato__titulo">{titulo}</legend>
      <p className="srt-contato__dica">{dica}</p>
      <div className="srt-contato__campos">
        <SelectField
          label={t('sorteio.channel')}
          value={rascunho.canal}
          options={opcoesCanal}
          placeholder={opcional ? undefined : t('sorteio.channelPlaceholder')}
          onChange={(e) => onCanal(ehCanal(e.target.value) ? e.target.value : '')}
          error={erros.canal ? t(erros.canal) : undefined}
        />

        {rascunho.canal === 'whatsapp' && (
          <div className={`srt-contato__fone${comDdd ? '' : ' srt-contato__fone--sem-ddd'}`}>
            <SelectField
              label={t('sorteio.country')}
              value={rascunho.pais}
              options={opcoesPais}
              onChange={(e) => onCampo('pais', e.target.value)}
            />
            {comDdd && (
              <FormField
                label={t('sorteio.dddLabel')}
                value={rascunho.ddd}
                placeholder="11"
                inputMode="numeric"
                autoComplete="tel-area-code"
                onChange={(e) => onCampo('ddd', e.target.value)}
                onBlur={() => onSairDoCampo('ddd')}
                error={erros.ddd ? t(erros.ddd) : undefined}
              />
            )}
            <FormField
              label={t('sorteio.phone')}
              value={rascunho.numero}
              placeholder={comDdd ? '99999-9999' : t('sorteio.withAreaCode')}
              inputMode="numeric"
              autoComplete={comDdd ? 'tel-local' : 'tel-national'}
              onChange={(e) => onCampo('numero', e.target.value)}
              onBlur={() => onSairDoCampo('numero')}
              error={erros.numero ? t(erros.numero) : undefined}
            />
          </div>
        )}

        {rascunho.canal === 'instagram' && (
          <FormField
            label={t('sorteio.igLabel')}
            value={rascunho.usuario}
            placeholder={t('sorteio.igPlaceholder')}
            autoComplete="off"
            onChange={(e) => onCampo('usuario', e.target.value)}
            onBlur={() => onSairDoCampo('usuario')}
            error={erros.usuario ? t(erros.usuario) : undefined}
          />
        )}

        {rascunho.canal === 'email' && (
          <FormField
            label="Email"
            type="email"
            value={rascunho.email}
            placeholder={t('sorteio.emailPlaceholder')}
            autoComplete="email"
            onChange={(e) => onCampo('email', e.target.value)}
            onBlur={() => onSairDoCampo('email')}
            error={erros.email ? t(erros.email) : undefined}
          />
        )}
      </div>
    </fieldset>
  );
}
