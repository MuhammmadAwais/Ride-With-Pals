const babel = require('@babel/core');
const code = 'import { t } from "@lingui/core/macro"; const x = t`Activity & Route Calendar`;';
const res = babel.transformSync(code, {
  filename: 'test.tsx',
  presets: ['@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]],
  plugins: ['@lingui/babel-plugin-lingui-macro']
});
console.log(res.code);
