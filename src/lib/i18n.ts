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
} as const;

export type Locale = keyof typeof locales;

export const rtlLocales: Locale[] = ['ar', 'ur'];

export const LANGUAGE_META: Record<Locale, { flag: string; native: string; english: string }> = {
  en: { flag: '🇬🇧', native: 'English',    english: 'English'    },
  ur: { flag: '🇵🇰', native: 'اردو',       english: 'Urdu'       },
  hi: { flag: '🇮🇳', native: 'हिन्दी',     english: 'Hindi'      },
  es: { flag: '🇪🇸', native: 'Español',    english: 'Spanish'    },
  nl: { flag: '🇳🇱', native: 'Nederlands', english: 'Dutch'      },
  fr: { flag: '🇫🇷', native: 'Français',   english: 'French'     },
  it: { flag: '🇮🇹', native: 'Italiano',   english: 'Italian'    },
  ar: { flag: '🇸🇦', native: 'العربية',    english: 'Arabic'     },
  ru: { flag: '🇷🇺', native: 'Русский',    english: 'Russian'    },
  pt: { flag: '🇧🇷', native: 'Português',  english: 'Portuguese' },
};

/**
 * Dynamically loads and activates a locale catalog.
 * Also sets html[lang] and html[dir] for RTL support.
 */
export async function dynamicActivate(locale: Locale) {
  // Lazy-load the compiled catalog for this locale
  const { messages } = await import(`../locales/${locale}/messages.ts`);
  i18n.loadAndActivate({ locale, messages });

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
