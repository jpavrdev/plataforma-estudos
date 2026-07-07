import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { formatPhone } from '../utils/phone';

const GENDER_OPTIONS = [
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'outro', label: 'Outro' },
  { value: 'prefiro_nao_dizer', label: 'Prefiro não dizer' },
];

const USERNAME_MIN = 3;
const USERNAME_MAX = 20;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const BIRTH_DATE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

type ProfileFieldKey = 'username' | 'birthDate' | 'gender' | 'phone';

export type ProfileCompletionValues = {
  username: string;
  birthDate: string;
  gender: string;
  phone: string;
};

export function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, USERNAME_MAX);
}

export function normalizeBirthDateDisplay(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function birthDateDisplayToIso(value: string): string | null {
  const match = value.match(BIRTH_DATE_REGEX);
  if (!match) return null;
  const [, dayStr, monthStr, yearStr] = match;
  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);
  if (month < 1 || month > 12) return null;
  const maxDay = new Date(year, month, 0).getDate();
  if (day < 1 || day > maxDay) return null;
  return `${yearStr}-${monthStr}-${dayStr}`;
}

export function validateProfileCompletionFields(
  values: ProfileCompletionValues,
): Partial<Record<ProfileFieldKey, string>> {
  const errors: Partial<Record<ProfileFieldKey, string>> = {};
  const username = values.username.trim();
  if (username.length < USERNAME_MIN) {
    errors.username = 'Usuário deve ter ao menos 3 caracteres';
  } else if (username.length > USERNAME_MAX) {
    errors.username = 'Usuário deve ter no máximo 20 caracteres';
  } else if (!USERNAME_REGEX.test(username)) {
    errors.username = 'Use apenas letras, números e underscore';
  }
  if (!values.birthDate.trim()) {
    errors.birthDate = 'Informe sua data de nascimento';
  } else if (!birthDateDisplayToIso(values.birthDate)) {
    errors.birthDate = 'Data inválida';
  }
  if (!values.gender) {
    errors.gender = 'Selecione o gênero';
  }
  if (!values.phone.trim()) {
    errors.phone = 'Informe seu telefone';
  }
  return errors;
}

interface ProfileCompletionFieldsProps {
  username: string;
  onUsernameChange: (value: string) => void;
  birthDate: string;
  onBirthDateChange: (value: string) => void;
  gender: string;
  onGenderChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  errors?: Partial<Record<ProfileFieldKey, string>>;
  onClearError?: (field: ProfileFieldKey) => void;
  required?: boolean;
}

export function ProfileCompletionFields({
  username,
  onUsernameChange,
  birthDate,
  onBirthDateChange,
  gender,
  onGenderChange,
  phone,
  onPhoneChange,
  errors,
  onClearError,
  required = true,
}: ProfileCompletionFieldsProps) {
  return (
    <>
      <FormField
        label="Nome de usuário"
        placeholder="seu_usuario"
        value={username}
        onChange={(e) => {
          onUsernameChange(normalizeUsername(e.target.value));
          onClearError?.('username');
        }}
        required={required}
        error={errors?.username}
      />
      <FormField
        label="Data de nascimento"
        type="text"
        placeholder="dd/mm/aaaa"
        autoComplete="bday"
        value={birthDate}
        onChange={(e) => {
          onBirthDateChange(normalizeBirthDateDisplay(e.target.value));
          onClearError?.('birthDate');
        }}
        required={required}
        error={errors?.birthDate}
      />
      <SelectField
        label="Gênero"
        value={gender}
        onChange={(e) => {
          onGenderChange(e.target.value);
          onClearError?.('gender');
        }}
        options={GENDER_OPTIONS}
        placeholder="Selecione"
        required={required}
        error={errors?.gender}
      />
      <FormField
        label="Telefone"
        type="tel"
        autoComplete="tel"
        placeholder="(11) 98888-7777"
        value={phone}
        onChange={(e) => {
          onPhoneChange(formatPhone(e.target.value));
          onClearError?.('phone');
        }}
        required={required}
        error={errors?.phone}
      />
    </>
  );
}