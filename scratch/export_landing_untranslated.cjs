const fs = require('fs');

const po = fs.readFileSync('src/locales/ur/messages.po', 'utf8');
const entries = po.split(/\n\n+/);
const untranslated = [];

for (const entry of entries) {
  if (entry.includes('src/features/landing/') && !entry.trim().startsWith('#~')) {
    const idMatch = entry.match(/msgid "([^"]+)"/);
    const strMatch = entry.match(/msgstr "([^"]*)"/);
    if (idMatch && (!strMatch || !strMatch[1])) {
      untranslated.push({
        id: idMatch[1],
        entry: entry.trim()
      });
    }
  }
}

fs.writeFileSync('scratch/untranslated_ur.json', JSON.stringify(untranslated, null, 2));
console.log('Saved', untranslated.length, 'untranslated items to scratch/untranslated_ur.json');
