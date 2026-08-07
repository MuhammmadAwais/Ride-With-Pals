const fs = require('fs');
const file = fs.readFileSync('src/features/landing/landingTemplate.ts', 'utf8');
const startIndex = file.indexOf('`');
const endIndex = file.lastIndexOf('`');
const html = file.substring(startIndex + 1, endIndex);
fs.writeFileSync('src/features/landing/landing.html', html);
