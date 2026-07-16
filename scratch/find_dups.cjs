const fs = require('fs');
const path = require('path');
const files = fs.readdirSync('src/api/types').filter(f => f.endsWith('.ts') && f !== 'index.ts');
const exportsMap = {};
files.forEach(file => {
    const content = fs.readFileSync(path.join('src/api/types', file), 'utf8');
    const regex = /export\s+(?:type|interface)\s+([A-Za-z0-9_]+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const name = match[1];
        if (!exportsMap[name]) exportsMap[name] = [];
        exportsMap[name].push(file);
    }
});
const duplicates = Object.keys(exportsMap).filter(k => exportsMap[k].length > 1);
console.log('Duplicates:');
duplicates.forEach(d => console.log(`${d}: ${exportsMap[d].join(', ')}`));
