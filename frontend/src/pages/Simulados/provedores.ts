// Config de cada provedor de certificação: nome exibido, rótulo curto do filtro,
// cor e sigla do selo. Compartilhado entre a lista e o briefing.
export const PROVEDORES: Record<
  string,
  { nome: string; label: string; cor: string; sigla: string }
> = {
  aws: { nome: 'Amazon Web Services', label: 'AWS', cor: '#ff9900', sigla: 'aws' },
  azure: { nome: 'Microsoft Azure', label: 'Azure', cor: '#0078d4', sigla: 'Az' },
  gcp: { nome: 'Google Cloud', label: 'Google Cloud', cor: '#1a73e8', sigla: 'GC' },
  databricks: { nome: 'Databricks', label: 'Databricks', cor: '#ff3621', sigla: 'db' },
  isc2: { nome: 'ISC2', label: 'ISC2', cor: '#00a4a6', sigla: 'i2' },
  istqb: { nome: 'ISTQB', label: 'ISTQB', cor: '#243c7a', sigla: 'IQ' },
  'scrum-org': { nome: 'Scrum.org', label: 'Scrum.org', cor: '#5b4bc4', sigla: 'S.o' },
};

const PROV_PADRAO = { nome: 'Certificação', label: 'Outros', cor: '#6b7280', sigla: '•' };

export const ORDEM_PROV = ['aws', 'azure', 'gcp', 'databricks', 'isc2', 'istqb', 'scrum-org'];

export function provedorDe(p: string | null) {
  return (p && PROVEDORES[p]) || PROV_PADRAO;
}

// Chave do filtro: provedor fora da tabela cai no mesmo "Outros", senão cada
// um vira um filtro próprio com o mesmo rótulo.
export function chaveProvedor(p: string | null) {
  return p && PROVEDORES[p] ? p : 'outros';
}

// Remove o código entre parênteses e o prefixo "Microsoft " do nome, já que o
// código e o provedor aparecem à parte.
export function nomeLimpo(name: string, code: string | null) {
  let n = name;
  if (code) n = n.replace(` (${code})`, '');
  return n.replace(/^Microsoft\s+/, '');
}

export function nivelClasse(level: string) {
  const l = level.toLowerCase();
  if (l.includes('assoc')) return 'assoc';
  if (l.includes('prof') || l.includes('expert')) return 'prof';
  return 'fund';
}
