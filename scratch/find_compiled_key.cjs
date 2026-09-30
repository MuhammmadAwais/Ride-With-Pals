const path = require('path');
const fs = require('fs');

const hiPath = path.join(__dirname, '..', 'src', 'locales', 'hi', 'messages.ts');
const content = fs.readFileSync(hiPath, 'utf8');

// extract the JSON string
const jsonMatch = content.match(/JSON\.parse\("(.*?)"\);/);
if (!jsonMatch) {
  console.log('Could not match JSON.parse');
  process.exit(1);
}

const parsedJson = JSON.parse(jsonMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\'));

let found = 0;
for (const [key, val] of Object.entries(parsedJson)) {
  const str = JSON.stringify(val);
  if (str.includes('गतिविधि') || str.includes('कैलेंडर')) {
    console.log(`Found: [${key}] => ${str}`);
    found++;
  }
}
console.log(`Total found: ${found}`);
