const fs = require('fs');
const items = JSON.parse(fs.readFileSync('scratch/untranslated_ur.json', 'utf8'));
const groups = {};

for (const item of items) {
  const fileMatch = item.entry.match(/#:\s*([^\n]+)/);
  const file = fileMatch ? fileMatch[1].split(':')[0].trim() : 'unknown';
  if (!groups[file]) groups[file] = [];
  groups[file].push(item.id);
}

for (const k in groups) {
  console.log(`\n=== ${k} (${groups[k].length}) ===`);
  groups[k].forEach(id => console.log(`  - ${id}`));
}
