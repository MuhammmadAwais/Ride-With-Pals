import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'src/features/ClubSide');

const regex = /import DataTable, { Column } from "(@\/components\/ui\/DataTable|..\/..\/components\/ui\/DataTable)";/g;

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Also support single quotes and no semicolon
    const pattern1 = /import DataTable, {\s*Column\s*} from ['"]@\/components\/ui\/DataTable['"];?/g;
    const pattern2 = /import DataTable, {\s*Column\s*} from ['"]\.\.\/\.\.\/components\/ui\/DataTable['"];?/g;

    let changed = false;
    if (pattern1.test(content) || pattern2.test(content)) {
      content = content.replace(pattern1, `import DataTable, { type Column } from "@/components/ui/DataTable";`);
      content = content.replace(pattern2, `import DataTable, { type Column } from "@/components/ui/DataTable";`);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated import in ${file}`);
    }
  }
});
