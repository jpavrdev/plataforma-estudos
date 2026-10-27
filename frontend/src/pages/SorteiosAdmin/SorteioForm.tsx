import { useId, useState, type FormEvent } from 'react';
import {
  DESCRICAO_MAX,
  TITULO_MAX,
  mudouAlgo,
  validarFormSorteio,
  type FormSorteio,
} from '../../utils/sorteio';

interface Props {
  titulo: string;
  inicial: FormSorteio;
  rotuloEnviar: string;
  enviando: boolean;
  onEnviar: (valores: FormSorteio) => void;
  onCancelar?: () => void;
}

export function SorteioForm({
  titulo,
  inicial,
  rotuloEnviar,
  enviando,
  onEnviar,
  onCancelar,
}: Props) {
  const id = useId();
  const [form, setForm] = useState(inicial);
  const [erro, setErro] = useState('');

  function mudar(campo: keyof FormSorteio, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErro('');
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const problema = validarFormSorteio(form);
    if (problema) {
      setErro(problema);
      return;
    }
    onEnviar(form);
  }

  return (
    <form className="estudio-form" onSubmit={enviar} noValidate>
      <div className="estudio-form__title">{titulo}</div>

      <label className="studio__label" htmlFor={`${id}-titulo`}>
        Título
      </label>
      <input
        id={`${id}-titulo`}
        className="estudio-form__input"
        value={form.titulo}
        maxLength={TITULO_MAX}
        placeholder="Ex.: Sorteio de três livros de programação"
        onChange={(e) => mudar('titulo', e.target.value)}
      />

      <label className="studio__label" htmlFor={`${id}-descricao`}>
        Descrição
      </label>
      <textarea
        id={`${id}-descricao`}
        className="estudio-form__input estudio-form__textarea"
        value={form.descricao}
        maxLength={DESCRICAO_MAX}
        rows={5}
        placeholder="O que vai ser sorteado e como funciona. As quebras de linha aparecem para o aluno."
        onChange={(e) => mudar('descricao', e.target.value)}
      />

      <div className="des-adm__row">
        <div>
          <label className="studio__label" htmlFor={`${id}-inicio`}>
            Início das inscrições
          </label>
          <input
            id={`${id}-inicio`}
            type="datetime-local"
            className="estudio-form__input"
            value={form.inicio}
            onChange={(e) => mudar('inicio', e.target.value)}
          />
        </div>
        <div>
          <label className="studio__label" htmlFor={`${id}-fim`}>
            Fim das inscrições
          </label>
          <input
            id={`${id}-fim`}
            type="datetime-local"
            className="estudio-form__input"
            value={form.fim}
            onChange={(e) => mudar('fim', e.target.value)}
          />
        </div>
      </div>

      {erro && <div className="auth__alert srt-adm__erro">{erro}</div>}

      <div className="estudio-form__actions">
        {onCancelar && (
          <button type="button" className="btn btn--ghost" onClick={onCancelar}>
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="btn btn--accent"
          disabled={enviando || !mudouAlgo(inicial, form)}
        >
          {enviando ? 'Salvando...' : rotuloEnviar}
        </button>
      </div>
    </form>
  );
}
