const fs = require('fs');

const file = fs.readFileSync('src/features/landing/components/ConvertedLanding.tsx', 'utf8');
let rawHtml = fs.readFileSync('src/features/landing/landingTemplate.ts', 'utf8');

function removeSectionFromRawHtml(name) {
  const startStr = `<section class=\\"framer-[^\\"]+\\" data-framer-name=\\"${name}\\"`;
  const regexStart = new RegExp(startStr);
  const startMatch = rawHtml.match(regexStart);
  
  if (!startMatch) {
    console.log(`Could not find ${name} in raw HTML`);
    return;
  }
  
  const startIndex = startMatch.index;
  let nesting = 0;
  let endIndex = -1;
  
  for (let i = startIndex; i < rawHtml.length; i++) {
    if (rawHtml.substr(i, 9) === '<section ' || rawHtml.substr(i, 8) === '<section>') {
      nesting++;
    } else if (rawHtml.substr(i, 10) === '</section>') {
      nesting--;
      if (nesting === 0) {
        endIndex = i + 10;
        break;
      }
    }
  }
  
  if (endIndex !== -1) {
    rawHtml = rawHtml.substring(0, startIndex) + rawHtml.substring(endIndex);
    console.log(`Successfully removed ${name} from rawHtml`);
  }
}

// We already ported Hero manually.
removeSectionFromRawHtml('Hero Section');
removeSectionFromRawHtml('How it Works Section');
removeSectionFromRawHtml('Bento Section');

fs.writeFileSync('src/features/landing/remainingTemplate.ts', rawHtml.replace('export const landingHtml = `', 'export const remainingHtml = `'));
