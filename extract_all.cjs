const fs = require('fs');

const file = fs.readFileSync('src/features/landing/components/ConvertedLanding.tsx', 'utf8');

const sections = [
  'Hero Section',
  'How it Works Section',
  'Bento Section',
  'Features Section',
  'Comparison Section',
  'Testimonials Section',
  'Pricing Section',
  'FAQ Section',
  'Blog Section',
  'CTA Section'
];

sections.forEach(name => {
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
    let sectionHtml = file.substring(startIndex, endIndex);
    
    // Fix tabIndex and path
    sectionHtml = sectionHtml.replace(/<\/path>/g, '');
    sectionHtml = sectionHtml.replace(/tabindex/g, 'tabIndex');
    
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
});

// Also extract Nav
const navStartMatch = file.match(/<nav name="Navigation"/);
if (navStartMatch) {
  const startIndex = navStartMatch.index;
  let nesting = 0;
  let endIndex = -1;
  for (let i = startIndex; i < file.length; i++) {
    if (file.substr(i, 5) === '<nav ' || file.substr(i, 5) === '<nav>') {
      nesting++;
    } else if (file.substr(i, 6) === '</nav>') {
      nesting--;
      if (nesting === 0) {
        endIndex = i + 6;
        break;
      }
    }
  }
  if (endIndex !== -1) {
    let navHtml = file.substring(startIndex, endIndex);
    navHtml = navHtml.replace(/<\/path>/g, '');
    navHtml = navHtml.replace(/tabindex/g, 'tabIndex');
    const output = `
import React from 'react';

export const Navigation: React.FC = () => {
  return (
    ${navHtml}
  );
};
`;
    fs.writeFileSync(`src/features/landing/components/Navigation.tsx`, output);
    console.log(`Successfully extracted Navigation`);
  }
}
