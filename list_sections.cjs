const fs = require('fs');
let html = fs.readFileSync('src/features/landing/landing.html', 'utf8');
const regex = /<section[^>]*data-framer-name="([^"]+)"/g;
let match;
while ((match = regex.exec(html)) !== null) {
  console.log(match[1]);
}
