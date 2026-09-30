const fs = require('fs');

const po = fs.readFileSync('src/locales/ur/messages.po', 'utf8');
const entries = po.split(/\n\n+/);
const landingEmpty = [];
const landingFilled = [];

for (const entry of entries) {
  if (entry.includes('src/features/landing/') && !entry.trim().startsWith('#~')) {
    const idMatch = entry.match(/msgid "([^"]+)"/);
    const strMatch = entry.match(/msgstr "([^"]*)"/);
    if (idMatch) {
      const id = idMatch[1];
      const str = strMatch ? strMatch[1] : '';
      if (!str) {
        landingEmpty.push({ id, entry });
      } else {
        landingFilled.push({ id, str });
      }
    }
  }
}

console.log('Total landing items:', landingEmpty.length + landingFilled.length);
console.log('Untranslated in ur:', landingEmpty.length);
console.log('Translated in ur:', landingFilled.length);
console.log('Untranslated list:');
landingEmpty.forEach(item => console.log(' - ' + item.id));
