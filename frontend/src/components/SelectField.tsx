import type { ChangeEvent } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  error,
}: SelectFieldProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <select
        className={`input${error ? ' input--error' : ''}`}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? true : undefined}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}
