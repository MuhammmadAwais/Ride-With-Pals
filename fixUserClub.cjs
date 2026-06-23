const fs = require('fs');
const filePath = 'src/features/public-club/pages/UserClub.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Themed replacements
content = content.replace(/text-white(?!\/)/g, 'text-text-main');
// Wait, we need to keep text-white for buttons with bg-[#EB712B]
content = content.replace(/bg-\[#EB712B\] hover:bg-\[#ff8036\] text-text-main/g, 'bg-[#EB712B] hover:bg-[#ff8036] text-white');

content = content.replace(/bg-black/g, 'bg-main-bg');
content = content.replace(/bg-\[#111\]/g, 'bg-surface');
content = content.replace(/bg-\[#1a1a1a\]/g, 'bg-hover');
content = content.replace(/border-white\/10/g, 'border-border');
content = content.replace(/border-white\/20/g, 'border-border');
content = content.replace(/text-gray-400/g, 'text-text-muted');
content = content.replace(/text-gray-300/g, 'text-text-muted');
content = content.replace(/text-gray-500/g, 'text-text-muted');
content = content.replace(/bg-white\/5/g, 'bg-hover');

fs.writeFileSync(filePath, content);
console.log('Fixed UserClub');
