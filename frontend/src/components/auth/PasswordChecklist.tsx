import { useTranslation } from 'react-i18next';
import { Check } from '../Icons';

// Password requirements (they mirror the backend schema, the source of truth).
export const PASSWORD_MIN = 12;
export const PASSWORD_RULES = [
  { key: 'length', ok: (s: string) => s.length >= PASSWORD_MIN },
  { key: 'upper', ok: (s: string) => /[A-Z]/.test(s) },
  { key: 'lower', ok: (s: string) => /[a-z]/.test(s) },
  { key: 'digit', ok: (s: string) => /[0-9]/.test(s) },
  { key: 'special', ok: (s: string) => /[^A-Za-z0-9]/.test(s) },
] as const;
export const isValidPassword = (s: string) => PASSWORD_RULES.every((r) => r.ok(s));

// Live checklist of the password rules, marking each one as the user types.
export function PasswordChecklist({ value }: { value: string }) {
  const { t } = useTranslation();
  return (
    <ul className="pw-reqs">
      {PASSWORD_RULES.map((rule) => (
        <li key={rule.key} className={`pw-reqs__item${rule.ok(value) ? ' pw-reqs__item--ok' : ''}`}>
          <Check size={12} /> {t(`auth.passwordRules.${rule.key}`, { min: PASSWORD_MIN })}
        </li>
      ))}
    </ul>
  );
}
