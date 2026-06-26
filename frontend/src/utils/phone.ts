/**
 * Aplica máscara de telefone brasileiro enquanto o usuário digita.
 * Celular: (11) 98888-7777 · Fixo: (11) 3888-7777
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length <= 4) return `(${ddd}) ${rest}`;

  // 9 dígitos no número (celular) → 5+4; senão (fixo) → 4+4
  const isMobile = rest.length > 8;
  const splitAt = isMobile ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`;
}
