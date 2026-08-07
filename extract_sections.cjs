const fs = require('fs');

const file = fs.readFileSync('src/features/landing/components/ConvertedLanding.tsx', 'utf8');

function extractSection(name, idPattern) {
  // Find start
  const startStr = `<section className="framer-[^"]+" data-framer-name="${name}"`;
  const regexStart = new RegExp(startStr);
  const startMatch = file.match(regexStart);
  
  if (!startMatch) {
    console.log(`Could not find ${name}`);
    return;
  }
  
  const startIndex = startMatch.index;
  let nesting = 0;
  let endIndex = -1;
  
  for (let i = startIndex; i < file.length; i++) {
    if (file.substr(i, 9) === '<section ' || file.substr(i, 8) === '<section>') {
      nesting++;
    } else if (file.substr(i, 10) === '</section>') {
      nesting--;
      if (nesting === 0) {
        endIndex = i + 10;
        break;
      }
    }
  }
  
  if (endIndex !== -1) {
    const sectionHtml = file.substring(startIndex, endIndex);
    
    // Create React component string
    const componentName = name.replace(/[^a-zA-Z0-9]/g, '');
    const output = `
import React from 'react';

export const ${componentName}: React.FC = () => {
  return (
    ${sectionHtml}
  );
};
`;
    fs.writeFileSync(`src/features/landing/components/${componentName}.tsx`, output);
    console.log(`Successfully extracted ${componentName}`);
  }
}

extractSection('How it Works Section');
extractSection('Bento Section');
extractSection('Testimonials'); // Let's check names in a bit if this doesn't match
