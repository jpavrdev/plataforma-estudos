import { useTranslation } from 'react-i18next';
import { NAV_PRINCIPAL, NAV_SORTEIO } from '../data/nav';
import { useSorteioAtivo } from '../contexts/SorteioContext';

// Entrega os itens da navegação já traduzidos, para nenhuma tela precisar saber
// de i18n. O rótulo some do data/nav: aqui ele nasce pela chave.
export function useNavPrincipal() {
  const { t } = useTranslation();
  const { sorteio } = useSorteioAtivo();
  const base = sorteio ? [...NAV_PRINCIPAL, NAV_SORTEIO] : NAV_PRINCIPAL;
  return base.map((item) => ({ to: item.to, label: t(`nav.${item.key}`) }));
}
