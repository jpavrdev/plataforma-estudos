// Mesma regra de backend/src/domain/contatos.ts: as duas mudam juntas.

export type Canal = 'whatsapp' | 'instagram' | 'email';

export type Contato =
  | { canal: 'whatsapp'; pais: string; ddi: string; ddd: string | null; numero: string }
  | { canal: 'instagram'; usuario: string }
  | { canal: 'email'; email: string };

export interface Contatos {
  primario: Contato;
  secundario: Contato | null;
}

export type ContatoEntrada =
  | { canal: 'whatsapp'; pais: string; ddd?: string; numero: string }
  | { canal: 'instagram'; usuario: string }
  | { canal: 'email'; email: string };

export interface InscricaoEntrada {
  primario: ContatoEntrada;
  secundario: ContatoEntrada | null;
}

export const CANAIS: Canal[] = ['whatsapp', 'instagram', 'email'];

export const ROTULO_CANAL: Record<Canal, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  email: 'Email',
};

export function ehCanal(valor: string): valor is Canal {
  return (CANAIS as string[]).includes(valor);
}

export interface Pais {
  codigo: string;
  nome: string;
  nomeEn: string;
  ddi: string;
}

// Nome do país no idioma ativo, com fallback para o português.
export function nomeDoPais(pais: Pais, lingua: string): string {
  return lingua.startsWith('pt') ? pais.nome : pais.nomeEn;
}

const BRASIL = 'BR';

const LISTA_DE_PAISES: Pais[] = [
  { codigo: 'BR', nome: 'Brasil', nomeEn: 'Brazil', ddi: '55' },
  { codigo: 'PT', nome: 'Portugal', nomeEn: 'Portugal', ddi: '351' },
  { codigo: 'AO', nome: 'Angola', nomeEn: 'Angola', ddi: '244' },
  { codigo: 'MZ', nome: 'Moçambique', nomeEn: 'Mozambique', ddi: '258' },
  { codigo: 'CV', nome: 'Cabo Verde', nomeEn: 'Cape Verde', ddi: '238' },
  { codigo: 'GW', nome: 'Guiné-Bissau', nomeEn: 'Guinea-Bissau', ddi: '245' },
  { codigo: 'ST', nome: 'São Tomé e Príncipe', nomeEn: 'São Tomé and Príncipe', ddi: '239' },
  { codigo: 'TL', nome: 'Timor-Leste', nomeEn: 'Timor-Leste', ddi: '670' },
  { codigo: 'US', nome: 'Estados Unidos', nomeEn: 'United States', ddi: '1' },
  { codigo: 'CA', nome: 'Canadá', nomeEn: 'Canada', ddi: '1' },
  { codigo: 'AR', nome: 'Argentina', nomeEn: 'Argentina', ddi: '54' },
  { codigo: 'CL', nome: 'Chile', nomeEn: 'Chile', ddi: '56' },
  { codigo: 'CO', nome: 'Colômbia', nomeEn: 'Colombia', ddi: '57' },
  { codigo: 'MX', nome: 'México', nomeEn: 'Mexico', ddi: '52' },
  { codigo: 'PY', nome: 'Paraguai', nomeEn: 'Paraguay', ddi: '595' },
  { codigo: 'UY', nome: 'Uruguai', nomeEn: 'Uruguay', ddi: '598' },
  { codigo: 'ES', nome: 'Espanha', nomeEn: 'Spain', ddi: '34' },
  { codigo: 'FR', nome: 'França', nomeEn: 'France', ddi: '33' },
  { codigo: 'IT', nome: 'Itália', nomeEn: 'Italy', ddi: '39' },
  { codigo: 'DE', nome: 'Alemanha', nomeEn: 'Germany', ddi: '49' },
  { codigo: 'NL', nome: 'Países Baixos', nomeEn: 'Netherlands', ddi: '31' },
  { codigo: 'BE', nome: 'Bélgica', nomeEn: 'Belgium', ddi: '32' },
  { codigo: 'CH', nome: 'Suíça', nomeEn: 'Switzerland', ddi: '41' },
  { codigo: 'IE', nome: 'Irlanda', nomeEn: 'Ireland', ddi: '353' },
  { codigo: 'GB', nome: 'Reino Unido', nomeEn: 'United Kingdom', ddi: '44' },
  { codigo: 'JP', nome: 'Japão', nomeEn: 'Japan', ddi: '81' },
  { codigo: 'AU', nome: 'Austrália', nomeEn: 'Australia', ddi: '61' },
];

export const PAISES: Pais[] = [
  ...LISTA_DE_PAISES.filter((p) => p.codigo === BRASIL),
  ...LISTA_DE_PAISES.filter((p) => p.codigo !== BRASIL).sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR'),
  ),
];

const PAIS_POR_CODIGO = new Map(LISTA_DE_PAISES.map((p) => [p.codigo, p]));

export function usaDdd(pais: string): boolean {
  return pais === BRASIL;
}

function faixa(de: number, ate: number): number[] {
  return Array.from({ length: ate - de + 1 }, (_, i) => de + i);
}

const DDDS = new Set(
  [
    faixa(11, 19),
    [21, 22, 24, 27, 28],
    faixa(31, 35),
    [37, 38],
    faixa(41, 49),
    [51, 53, 54, 55],
    faixa(61, 69),
    [71, 73, 74, 75, 77, 79],
    faixa(81, 89),
    faixa(91, 99),
  ]
    .flat()
    .map(String),
);

const MAX_DIGITOS_E164 = 15;
const MAX_DIGITOS_NUMERO = 14;
const MIN_DIGITOS_NUMERO = 7;

function limiteDoNumero(pais: string): number {
  const ddi = PAIS_POR_CODIGO.get(pais)?.ddi ?? '';
  return Math.min(MAX_DIGITOS_NUMERO, MAX_DIGITOS_E164 - ddi.length);
}

function digitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

const PAISES_QUE_MANTEM_O_ZERO = new Set(['IT']);

// O 0 de discagem nacional não entra no formato internacional, menos na Itália.
function semZeroNacional(numero: string, pais: string): string {
  return PAISES_QUE_MANTEM_O_ZERO.has(pais) ? numero : numero.replace(/^0/, '');
}

export function mascararDdd(valor: string): string {
  return digitos(valor).slice(0, 2);
}

export function mascararNumero(valor: string, pais: string): string {
  const numero = digitos(valor);
  if (pais === BRASIL) {
    const celular = numero.slice(0, 9);
    return celular.length > 5 ? `${celular.slice(0, 5)}-${celular.slice(5)}` : celular;
  }
  const zeroDescartado = numero.length - semZeroNacional(numero, pais).length;
  return numero.slice(0, limiteDoNumero(pais) + zeroDescartado);
}

export interface RascunhoContato {
  canal: Canal | '';
  pais: string;
  ddd: string;
  numero: string;
  usuario: string;
  email: string;
}

export type Papel = 'primario' | 'secundario';
export type Rascunhos = Record<Papel, RascunhoContato>;

export type CampoTexto = 'ddd' | 'numero' | 'usuario' | 'email';
export type CampoContato = 'canal' | CampoTexto;
export type ChaveErroContato =
  | 'sorteio.dddRequired'
  | 'sorteio.dddInvalid'
  | 'sorteio.numberRequired'
  | 'sorteio.brPhone'
  | 'sorteio.digitRange'
  | 'sorteio.igRequired'
  | 'sorteio.igFormat'
  | 'sorteio.igDots'
  | 'sorteio.emailRequired'
  | 'sorteio.emailInvalid'
  | 'sorteio.channelRequired'
  | 'sorteio.channelDifferent';
export type ErrosContato = Partial<Record<CampoContato, ChaveErroContato>>;
export type ErrosInscricao = Record<Papel, ErrosContato>;

export const SEM_ERROS: ErrosInscricao = { primario: {}, secundario: {} };

const RASCUNHO_VAZIO: RascunhoContato = {
  canal: '',
  pais: BRASIL,
  ddd: '',
  numero: '',
  usuario: '',
  email: '',
};

export const RASCUNHOS_VAZIOS: Rascunhos = {
  primario: RASCUNHO_VAZIO,
  secundario: RASCUNHO_VAZIO,
};

export function canaisDoSecundario(canalDoPrincipal: Canal | ''): Canal[] {
  return CANAIS.filter((c) => c !== canalDoPrincipal);
}

export function escolherCanal(rascunhos: Rascunhos, papel: Papel, canal: Canal | ''): Rascunhos {
  const novos: Rascunhos = { ...rascunhos, [papel]: { ...rascunhos[papel], canal } };
  if (papel === 'primario' && canal && novos.secundario.canal === canal) {
    novos.secundario = { ...novos.secundario, canal: '' };
  }
  return novos;
}

export function editarContato(
  rascunho: RascunhoContato,
  campo: CampoTexto | 'pais',
  valor: string,
): RascunhoContato {
  switch (campo) {
    case 'pais':
      return { ...rascunho, pais: valor, numero: mascararNumero(rascunho.numero, valor) };
    case 'ddd':
      return { ...rascunho, ddd: mascararDdd(valor) };
    case 'numero':
      return { ...rascunho, numero: mascararNumero(valor, rascunho.pais) };
    case 'usuario':
      return { ...rascunho, usuario: valor };
    case 'email':
      return { ...rascunho, email: valor };
  }
}

function normalizarInstagram(valor: string): string {
  return valor.trim().replace(/^@/, '').toLowerCase();
}

function normalizarEmail(valor: string): string {
  return valor.trim().toLowerCase();
}

// A mesma expressão do z.email() do Zod 4, que o servidor usa.
const FORMATO_EMAIL =
  /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+.-]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;
const MAX_EMAIL = 254;
const FORMATO_INSTAGRAM = /^[a-z0-9._]{1,30}$/;

function validarDdd(valor: string): ChaveErroContato | undefined {
  const ddd = digitos(valor);
  if (!ddd) return 'sorteio.dddRequired';
  if (!DDDS.has(ddd)) return 'sorteio.dddInvalid';
  return undefined;
}

function validarNumero(valor: string, pais: string): ChaveErroContato | undefined {
  const digitado = digitos(valor);
  if (!digitado) return 'sorteio.numberRequired';
  if (pais === BRASIL) {
    return /^9\d{8}$/.test(digitado) ? undefined : 'sorteio.brPhone';
  }
  const numero = semZeroNacional(digitado, pais);
  const max = limiteDoNumero(pais);
  if (numero.length < MIN_DIGITOS_NUMERO || numero.length > max) {
    // A faixa real depende do DDI, mas a mensagem é genérica: quem digitou errado
    // precisa saber a ordem de grandeza, não o limite exato do país escolhido.
    return 'sorteio.digitRange';
  }
  return undefined;
}

function validarInstagram(valor: string): ChaveErroContato | undefined {
  const usuario = normalizarInstagram(valor);
  if (!usuario) return 'sorteio.igRequired';
  if (!FORMATO_INSTAGRAM.test(usuario)) return 'sorteio.igFormat';
  if (usuario.startsWith('.') || usuario.endsWith('.') || usuario.includes('..')) {
    return 'sorteio.igDots';
  }
  return undefined;
}

function validarEmail(valor: string): ChaveErroContato | undefined {
  const email = normalizarEmail(valor);
  if (!email) return 'sorteio.emailRequired';
  if (email.length > MAX_EMAIL || !FORMATO_EMAIL.test(email)) return 'sorteio.emailInvalid';
  return undefined;
}

export function validarCampo(
  rascunho: RascunhoContato,
  campo: CampoTexto,
): ChaveErroContato | undefined {
  switch (campo) {
    case 'ddd':
      return validarDdd(rascunho.ddd);
    case 'numero':
      return validarNumero(rascunho.numero, rascunho.pais);
    case 'usuario':
      return validarInstagram(rascunho.usuario);
    case 'email':
      return validarEmail(rascunho.email);
  }
}

function camposDoCanal(rascunho: RascunhoContato): CampoTexto[] {
  switch (rascunho.canal) {
    case 'whatsapp':
      return usaDdd(rascunho.pais) ? ['ddd', 'numero'] : ['numero'];
    case 'instagram':
      return ['usuario'];
    case 'email':
      return ['email'];
    case '':
      return [];
  }
}

function validarContato(rascunho: RascunhoContato): ErrosContato {
  const erros: ErrosContato = {};
  for (const campo of camposDoCanal(rascunho)) {
    const erro = validarCampo(rascunho, campo);
    if (erro) erros[campo] = erro;
  }
  return erros;
}

function paraEntrada(rascunho: RascunhoContato): ContatoEntrada | null {
  switch (rascunho.canal) {
    case 'whatsapp':
      return usaDdd(rascunho.pais)
        ? { canal: 'whatsapp', pais: rascunho.pais, ddd: rascunho.ddd, numero: rascunho.numero }
        : { canal: 'whatsapp', pais: rascunho.pais, numero: rascunho.numero };
    case 'instagram':
      return { canal: 'instagram', usuario: rascunho.usuario.trim() };
    case 'email':
      return { canal: 'email', email: rascunho.email.trim() };
    case '':
      return null;
  }
}

// Como o servidor vai guardar. O corpo do POST vai cru para não normalizar duas vezes.
function contatoNormalizado(rascunho: RascunhoContato): Contato | null {
  switch (rascunho.canal) {
    case 'whatsapp': {
      const ddi = PAIS_POR_CODIGO.get(rascunho.pais)?.ddi ?? '';
      const numero = digitos(rascunho.numero);
      return usaDdd(rascunho.pais)
        ? { canal: 'whatsapp', pais: rascunho.pais, ddi, ddd: digitos(rascunho.ddd), numero }
        : {
            canal: 'whatsapp',
            pais: rascunho.pais,
            ddi,
            ddd: null,
            numero: semZeroNacional(numero, rascunho.pais),
          };
    }
    case 'instagram':
      return { canal: 'instagram', usuario: normalizarInstagram(rascunho.usuario) };
    case 'email':
      return { canal: 'email', email: normalizarEmail(rascunho.email) };
    case '':
      return null;
  }
}

export type ResultadoInscricao =
  | { valida: true; entrada: InscricaoEntrada; contatos: Contatos }
  | { valida: false; erros: ErrosInscricao };

export function prepararInscricao({ primario, secundario }: Rascunhos): ResultadoInscricao {
  const erros: ErrosInscricao = {
    primario: validarContato(primario),
    secundario: validarContato(secundario),
  };
  if (!primario.canal) erros.primario.canal = 'sorteio.channelRequired';
  if (secundario.canal && secundario.canal === primario.canal) {
    erros.secundario.canal = 'sorteio.channelDifferent';
  }

  const entradaPrincipal = paraEntrada(primario);
  const contatoPrincipal = contatoNormalizado(primario);
  const temErro = Object.keys(erros.primario).length + Object.keys(erros.secundario).length > 0;
  if (temErro || !entradaPrincipal || !contatoPrincipal) return { valida: false, erros };
  return {
    valida: true,
    entrada: { primario: entradaPrincipal, secundario: paraEntrada(secundario) },
    contatos: { primario: contatoPrincipal, secundario: contatoNormalizado(secundario) },
  };
}

export function descreverContato(contato: Contato): string {
  switch (contato.canal) {
    case 'whatsapp':
      return contato.ddd
        ? `+${contato.ddi} (${contato.ddd}) ${mascararNumero(contato.numero, contato.pais)}`
        : `+${contato.ddi} ${contato.numero}`;
    case 'instagram':
      return `@${contato.usuario}`;
    case 'email':
      return contato.email;
  }
}

export function linkDoContato(contato: Contato): string {
  switch (contato.canal) {
    case 'whatsapp':
      return `https://wa.me/${contato.ddi}${contato.ddd ?? ''}${contato.numero}`;
    case 'instagram':
      return `https://instagram.com/${contato.usuario}`;
    case 'email':
      return `mailto:${contato.email}`;
  }
}
