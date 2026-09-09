import fs from 'fs';
import path from 'path';
import { formatter } from '@lingui/format-po';

import es from './es.js';
import fr from './fr.js';
import it from './it.js';
import nl from './nl.js';
import pt from './pt.js';
import ru from './ru.js';
import ar from './ar.js';
import ur from './ur.js';
import hi from './hi.js';

const translations = { es, fr, it, nl, pt, ru, ar, ur, hi };
const f = formatter({ lineNumbers: false });

console.log('--- Applying translations to PO files ---');

for (const [locale, dict] of Object.entries(translations)) {
  const filePath = path.join('src', 'locales', locale, 'messages.po');
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    continue;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const catalog = f.parse(raw);

  let translatedCount = 0;
  let missingCount = 0;

  for (const [id, item] of Object.entries(catalog)) {
    const msg = item.message;
    if (dict[msg]) {
      item.translation = dict[msg];
      translatedCount++;
    } else {
      missingCount++;
      console.warn(`[${locale}] Missing translation for: "${msg}"`);
    }
  }

  const serialized = f.serialize(catalog, { locale });
  fs.writeFileSync(filePath, serialized, 'utf-8');

  console.log(`[${locale.toUpperCase()}] Translated: ${translatedCount}, Missing: ${missingCount}`);
}

console.log('--- Finished applying translations ---');
