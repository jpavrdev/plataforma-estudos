import type { ChangeEvent, ReactNode } from 'react';

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
      <input
        className="input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
      />
    </label>
  );
}
