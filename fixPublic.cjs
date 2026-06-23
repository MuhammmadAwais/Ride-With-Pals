const fs = require('fs');
const files = [
  'src/features/public-club/pages/Marketplace.tsx',
  'src/features/public-club/pages/Overviews.tsx',
  'src/features/public-club/pages/Shop.tsx',
  'src/features/public-club/pages/Ride.tsx',
  'src/features/public-club/pages/MyPurchases.tsx'
];

for (const filePath of files) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // Same replacements
  content = content.replace(/text-white(?!\/)/g, 'text-text-main');
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
}
console.log('Fixed related public club pages');
