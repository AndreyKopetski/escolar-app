import { useApp } from '@/contexts/AppContext';
import { translate } from '@/utils/i18n';

export function useT() {
  const { language } = useApp();
  return (key: string, vars?: Record<string, string | number>) =>
    translate(language, key, vars);
}
