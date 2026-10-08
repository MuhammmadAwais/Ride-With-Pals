import { i18n } from '@lingui/core';

export const locales = {
  en: 'English',
  ur: 'اردو',
  hi: 'हिन्दी',
  es: 'Español',
  nl: 'Nederlands',
  fr: 'Français',
  it: 'Italiano',
  ar: 'العربية',
  ru: 'Русский',
  pt: 'Português',
  de: 'Deutsch',
  ca: 'Català',
  eu: 'Euskara',
  da: 'Dansk',
  gl: 'Galego',
  no: 'Norsk',
  sv: 'Svenska',
} as const;

export type Locale = keyof typeof locales;

/**
 * Backend-supported ISO 639-1 language codes.
 * The backend services support:
 * English (en), Spanish (es), German (de), Catalan (ca), Basque (eu),
 * Danish (da), Dutch (nl), French (fr), Galician (gl), Italian (it),
 * Norwegian (no), Portuguese (pt), Swedish (sv).
 */
export const BACKEND_SUPPORTED_LANGUAGES = [
  'en',
  'es',
  'de',
  'ca',
  'eu',
  'da',
  'nl',
  'fr',
  'gl',
  'it',
  'no',
  'pt',
  'sv',
] as const;
export type BackendLanguage = typeof BACKEND_SUPPORTED_LANGUAGES[number];

/**
 * Maps any app locale to a backend-supported language code.
 * Defaults to 'en' if the user's selected language is not supported on backend.
 */
export const getBackendLanguage = (locale?: string | null): BackendLanguage => {
  if (!locale) return 'en';
  const clean = locale.toLowerCase().split('-')[0];
  if (BACKEND_SUPPORTED_LANGUAGES.includes(clean as BackendLanguage)) {
    return clean as BackendLanguage;
  }
  return 'en';
};

export const rtlLocales: Locale[] = ['ar', 'ur'];

export const LANGUAGE_META: Record<Locale, { flag: string; countryCode: string; native: string; english: string }> = {
  en: { flag: '🇬🇧', countryCode: 'gb', native: 'English',    english: 'English'    },
  ur: { flag: '🇵🇰', countryCode: 'pk', native: 'اردو',       english: 'Urdu'       },
  hi: { flag: '🇮🇳', countryCode: 'in', native: 'हिन्दी',     english: 'Hindi'      },
  es: { flag: '🇪🇸', countryCode: 'es', native: 'Español',    english: 'Spanish'    },
  nl: { flag: '🇳🇱', countryCode: 'nl', native: 'Nederlands', english: 'Dutch'      },
  fr: { flag: '🇫🇷', countryCode: 'fr', native: 'Français',   english: 'French'     },
  it: { flag: '🇮🇹', countryCode: 'it', native: 'Italiano',   english: 'Italian'    },
  ar: { flag: '🇸🇦', countryCode: 'sa', native: 'العربية',    english: 'Arabic'     },
  ru: { flag: '🇷🇺', countryCode: 'ru', native: 'Русский',    english: 'Russian'    },
  pt: { flag: '🇧🇷', countryCode: 'br', native: 'Português',  english: 'Portuguese' },
  de: { flag: '🇩🇪', countryCode: 'de', native: 'Deutsch',    english: 'German'     },
  ca: { flag: '🇪🇸', countryCode: 'es', native: 'Català',     english: 'Catalan'    },
  eu: { flag: '🇪🇸', countryCode: 'es', native: 'Euskara',    english: 'Basque'     },
  da: { flag: '🇩🇰', countryCode: 'dk', native: 'Dansk',      english: 'Danish'     },
  gl: { flag: '🇪🇸', countryCode: 'es', native: 'Galego',     english: 'Galician'   },
  no: { flag: '🇳🇴', countryCode: 'no', native: 'Norsk',      english: 'Norwegian'  },
  sv: { flag: '🇸🇪', countryCode: 'se', native: 'Svenska',    english: 'Swedish'    },
};

/**
 * Dynamically loads and activates a locale catalog.
 * Also sets html[lang] and html[dir] for RTL support.
 */
export async function dynamicActivate(locale: Locale) {
  try {
    // Lazy-load the compiled catalog for this locale
    const { messages } = await import(`../locales/${locale}/messages.ts`);
    i18n.loadAndActivate({ locale, messages });
  } catch (err) {
    console.warn(`[i18n] Failed to load messages for "${locale}", falling back to English:`, err);
    try {
      const { messages } = await import(`../locales/en/messages.ts`);
      i18n.loadAndActivate({ locale, messages });
    } catch {
      // In worst-case fallback, activate without crashing
      i18n.activate(locale);
    }
  }

  // Set lang attribute
  document.documentElement.lang = locale;

  // RTL support for Arabic & Urdu
  const isRtl = rtlLocales.includes(locale);
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

  // Lazy-load Arabic/Urdu font when needed
  if (isRtl) {
    const fontId = 'noto-naskh-arabic-font';
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);

      // Inject RTL font override
      const style = document.createElement('style');
      style.id = 'rwp-rtl-font-override';
      style.innerHTML = `
        [dir="rtl"] * {
          font-family: 'Noto Naskh Arabic', 'Segoe UI', Tahoma, sans-serif !important;
        }
      `;
      document.head.appendChild(style);
    }
  } else {
    // Remove RTL font override when switching back to LTR
    document.getElementById('rwp-rtl-font-override')?.remove();
  }
}

export { i18n };
