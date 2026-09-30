const fs = require('fs');
const po = fs.readFileSync('src/locales/hi/messages.po', 'utf8');

const blocks = po.split('\n\n');
console.log('Total blocks in po:', blocks.length);

let withMsgid = 0;
let withMsgstr = 0;
for (const b of blocks) {
  if (b.includes('msgid "')) withMsgid++;
  if (b.includes('msgstr "') && !b.includes('msgstr ""')) withMsgstr++;
}
console.log('Blocks with msgid:', withMsgid);
console.log('Blocks with non-empty msgstr:', withMsgstr);
