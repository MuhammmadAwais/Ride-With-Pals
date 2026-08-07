const fs = require('fs');
const path = require('path');
const dir = 'src/features/landing/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Strip all bis_ attributes
  content = content.replace(/ bis_[a-z_]+="[^"]*"/g, '');
  content = content.replace(/ bis_[a-z_]+=\{[^}]+\}/g, '');
  
  // Strip other framer specific weird attributes
  content = content.replace(/ parentsize="[^"]*"/g, '');
  content = content.replace(/ _constraints="[^"]*"/g, '');
  content = content.replace(/ rotation="[^"]*"/g, '');
  content = content.replace(/ shadows="[^"]*"/g, '');
  
  // Cast style objects to any to bypass strict TS checking for CSS vars
  content = content.replace(/style=\{\{([^}]+)\}\}/g, 'style={{$1} as any}');
  
  fs.writeFileSync(path.join(dir, file), content);
}
