
"use client";

import { useGame } from './use-game';
import { translations, TranslationKey } from '@/lib/translations';

export const useTranslations = () => {
  const { settings } = useGame();
  const lang = settings.language;

  const t = (key: TranslationKey, ...args: (string | number)[]) => {
    let text = translations[lang][key] || translations['FR'][key] || key;
    if (args.length > 0) {
        args.forEach((arg, index) => {
            text = text.replace(`{${index}}`, String(arg));
        });
    }
    return text;
  };

  return t;
};
