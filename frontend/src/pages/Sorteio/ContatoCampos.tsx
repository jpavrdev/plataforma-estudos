import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import {
  PAISES,
  ROTULO_CANAL,
  ehCanal,
  usaDdd,
  type Canal,
  type CampoTexto,
  type ErrosContato,
  type RascunhoContato,
} from '../../utils/contatos';

const OPCOES_PAIS = PAISES.map((p) => ({ value: p.codigo, label: `${p.nome} (+${p.ddi})` }));

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
  const opcoesCanal = [
    ...(opcional ? [{ value: '', label: 'Nenhum' }] : []),
    ...canais.map((c) => ({ value: c, label: ROTULO_CANAL[c] })),
  ];
  const comDdd = usaDdd(rascunho.pais);

  return (
    <fieldset className="srt-contato">
      <legend className="srt-contato__titulo">{titulo}</legend>
      <p className="srt-contato__dica">{dica}</p>
      <div className="srt-contato__campos">
        <SelectField
          label="Canal"
          value={rascunho.canal}
          options={opcoesCanal}
          placeholder={opcional ? undefined : 'Escolha um canal'}
          onChange={(e) => onCanal(ehCanal(e.target.value) ? e.target.value : '')}
          error={erros.canal}
        />

        {rascunho.canal === 'whatsapp' && (
          <div className={`srt-contato__fone${comDdd ? '' : ' srt-contato__fone--sem-ddd'}`}>
            <SelectField
              label="País"
              value={rascunho.pais}
              options={OPCOES_PAIS}
              onChange={(e) => onCampo('pais', e.target.value)}
            />
            {comDdd && (
              <FormField
                label="DDD"
                value={rascunho.ddd}
                placeholder="11"
                inputMode="numeric"
                autoComplete="tel-area-code"
                onChange={(e) => onCampo('ddd', e.target.value)}
                onBlur={() => onSairDoCampo('ddd')}
                error={erros.ddd}
              />
            )}
            <FormField
              label="Telefone"
              value={rascunho.numero}
              placeholder={comDdd ? '99999-9999' : 'Com o código de área'}
              inputMode="numeric"
              autoComplete={comDdd ? 'tel-local' : 'tel-national'}
              onChange={(e) => onCampo('numero', e.target.value)}
              onBlur={() => onSairDoCampo('numero')}
              error={erros.numero}
            />
          </div>
        )}

        {rascunho.canal === 'instagram' && (
          <FormField
            label="Seu @ no Instagram"
            value={rascunho.usuario}
            placeholder="@seu.usuario"
            autoComplete="off"
            onChange={(e) => onCampo('usuario', e.target.value)}
            onBlur={() => onSairDoCampo('usuario')}
            error={erros.usuario}
          />
        )}

        {rascunho.canal === 'email' && (
          <FormField
            label="Email"
            type="email"
            value={rascunho.email}
            placeholder="voce@exemplo.com"
            autoComplete="email"
            onChange={(e) => onCampo('email', e.target.value)}
            onBlur={() => onSairDoCampo('email')}
            error={erros.email}
          />
        )}
      </div>
    </fieldset>
  );
}
