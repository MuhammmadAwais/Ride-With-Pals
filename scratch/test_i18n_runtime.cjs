const { i18n } = require('@lingui/core');
const babel = require('@babel/core');

// Load compiled hi messages
import('../src/locales/hi/messages.ts').then(({ messages }) => {
  i18n.loadAndActivate({ locale: 'hi', messages });

  console.log('Current locale:', i18n.locale);
  console.log('Has key k1fvK1?', 'k1fvK1' in messages);
  console.log('Has key "Activity & Route Calendar"?', 'Activity & Route Calendar' in messages);

  // Let's see what keys exist around Activity
  for (const [k, v] of Object.entries(messages)) {
    if (JSON.stringify(v).includes('गतिविधि एवं रूट')) {
      console.log('MATCH FOUND IN MESSAGES:', k, v);
    }
  }

  // Transform t`Activity & Route Calendar` with lingui babel macro
  const transformed = babel.transformSync('import { t } from "@lingui/core/macro"; const x = t`Activity & Route Calendar`;', {
    filename: 'test.tsx',
    presets: ['@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]],
    plugins: ['@lingui/babel-plugin-lingui-macro']
  }).code;

  console.log('\nTransformed code:\n', transformed);

  // Now execute the transformed code with our activated i18n instance
  const evalFunc = new Function('_i18n', transformed.replace('import { i18n as _i18n } from "@lingui/core";', '') + '; return x;');
  const result = evalFunc(i18n);
  console.log('\nResult of t`Activity & Route Calendar`:', result);
});
