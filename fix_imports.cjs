const fs = require('fs');
const glob = require('glob');
glob.sync('src/**/*.tsx').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.includes('import DataTable, { type Column } from')) {
    content = content.replace(/import DataTable, \{ type Column \} from (["'].*?["']);/g, 
      'import DataTable from $1;\nimport type { Column } from $1;');
    changed = true;
  }
  if (content.includes('import DataTable, { Column } from')) {
    content = content.replace(/import DataTable, \{ Column \} from (["'].*?["']);/g, 
      'import DataTable from $1;\nimport type { Column } from $1;');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed:', file);
  }
});
