import { NAV_PRINCIPAL, NAV_SORTEIO } from '../data/nav';
import { useSorteioAtivo } from '../contexts/SorteioContext';

const NAV_COM_SORTEIO = [...NAV_PRINCIPAL, NAV_SORTEIO];

export function useNavPrincipal() {
  const { sorteio } = useSorteioAtivo();
  return sorteio ? NAV_COM_SORTEIO : NAV_PRINCIPAL;
}
