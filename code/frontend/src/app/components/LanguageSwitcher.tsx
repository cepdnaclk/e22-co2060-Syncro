import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

/**
 * Language switcher dropdown – visible on all pages.
 * Persisting is handled by the i18n bootstrap (i18n/index.ts),
 * which writes to localStorage on every `languageChanged` event.
 */
export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-accent transition-colors">
      <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <Select
        value={i18n.language}
        onValueChange={handleChange}
      >
        <SelectTrigger className="border-0 bg-transparent shadow-none p-0 h-auto gap-1 text-sm font-medium focus:ring-0 [&>svg]:w-3 [&>svg]:h-3 [&>svg]:text-muted-foreground">
          <SelectValue aria-label={t('languageSwitcher.ariaLabel')} />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="en">{t('languageSwitcher.english')}</SelectItem>
          <SelectItem value="si">{t('languageSwitcher.sinhala')}</SelectItem>
          <SelectItem value="ta">{t('languageSwitcher.tamil')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
