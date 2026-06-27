import { useState, type ChangeEvent, type ReactNode } from 'react';
import { Eye, EyeOff } from './Icons';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  /** Conteúdo opcional à direita do label (ex.: link "Esqueceu a senha?"). */
  labelAddon?: ReactNode;
}

export function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  required = false,
  labelAddon,
}: FormFieldProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const ehSenha = type === 'password';
  // Em campo de senha, o toggle alterna o type real entre password e text.
  const tipoInput = ehSenha && mostrarSenha ? 'text' : type;

  return (
    <label className="field">
      {labelAddon ? (
        <span className="field__row">
          <span className="field__label">{label}</span>
          {labelAddon}
        </span>
      ) : (
        <span className="field__label">{label}</span>
      )}
      <div className={ehSenha ? 'input-wrap' : undefined}>
        <input
          className="input"
          type={tipoInput}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
        />
        {ehSenha && (
          <button
            type="button"
            className="input-toggle"
            onClick={() => setMostrarSenha((v) => !v)}
            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            tabIndex={-1}
          >
            {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </label>
  );
}
