import type { LinguiConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-po';

const config: LinguiConfig = {
  locales: ['en', 'ur', 'hi', 'es', 'nl', 'fr', 'it', 'ar', 'ru', 'pt'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['src/**'],
      exclude: ['**/node_modules/**'],
    },
  ],
  format: formatter({ lineNumbers: false }),
  compileNamespace: 'ts',
};

export default config;
