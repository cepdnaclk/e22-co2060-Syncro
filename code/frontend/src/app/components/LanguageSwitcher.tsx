import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

/**
 * Language switcher dropdown – visible on all pages.
 * Persisting is handled by the i18n bootstrap (i18n/index.ts),
 * which writes to localStorage on every `languageChanged` event.
 */
export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-accent transition-colors">
      <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <select
        aria-label={t('languageSwitcher.ariaLabel')}
        value={i18n.language}
        onChange={handleChange}
        className="bg-transparent text-sm font-medium text-foreground cursor-pointer focus:outline-none appearance-none"
      >
        <option value="en">{t('languageSwitcher.english')}</option>
        <option value="si">{t('languageSwitcher.sinhala')}</option>
      </select>
    </div>
  );
}
