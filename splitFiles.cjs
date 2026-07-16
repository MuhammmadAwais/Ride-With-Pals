const fs = require('fs');
const path = require('path');

const outputMdPath = path.join(__dirname, 'output.md');
const mdContent = fs.readFileSync(outputMdPath, 'utf8');

const outputDir = path.join(__dirname, 'src', 'api', 'types');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let currentFile = null;
let currentContent = [];
const lines = mdContent.split('\n');

for (const line of lines) {
  if (line.startsWith('// ') && line.endsWith('.ts')) {
    if (currentFile) {
      fs.writeFileSync(path.join(outputDir, currentFile), currentContent.join('\n').trim() + '\n');
    }
    currentFile = line.substring(3).trim();
    currentContent = [];
  } else if (line.startsWith('```typescript') || line.startsWith('```')) {
    continue;
  } else {
    currentContent.push(line);
  }
}

if (currentFile) {
  fs.writeFileSync(path.join(outputDir, currentFile), currentContent.join('\n').trim() + '\n');
}

console.log('Files created in src/api/types/');
