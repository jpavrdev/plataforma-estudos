import { useTranslation } from 'react-i18next';
import { NAV_PRINCIPAL, NAV_PROJECTS, NAV_SORTEIO } from '../data/nav';
import { useSorteioAtivo } from '../contexts/SorteioContext';
import { useFeature } from '../contexts/AuthContext';

// Delivers the navigation items already translated, so no screen needs to know
// about i18n. The label lives outside data/nav: it is born here from the key.
export function useNavPrincipal() {
  const { t } = useTranslation();
  const { sorteio } = useSorteioAtivo();
  const hasProjects = useFeature('projetos-guiados');
  const base = [...NAV_PRINCIPAL];
  if (hasProjects) {
    // The sprint game sits next to the challenges: both are hands-on practice.
    const afterChallenges = base.findIndex((item) => item.key === 'challenges') + 1;
    base.splice(afterChallenges, 0, NAV_PROJECTS);
  }
  if (sorteio) base.push(NAV_SORTEIO);
  return base.map((item) => ({ to: item.to, label: t(`nav.${item.key}`) }));
}
