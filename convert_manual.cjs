const fs = require('fs');

let html = fs.readFileSync('src/features/landing/landing.html', 'utf8');

html = html.replace(/class=/g, 'className=');
html = html.replace(/for=/g, 'htmlFor=');
html = html.replace(/tabindex/g, 'tabIndex');
html = html.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');
html = html.replace(/<\/path>/g, '');
html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
html = html.replace(/\/ fetchpriority="high"/g, 'fetchpriority="high"');

// Convert inline styles to objects
html = html.replace(/style="([^"]*)"/g, (match, styleString) => {
  // Better split: only split by ';' if not inside quotes or parentheses
  // Actually, a simpler way is to just replace escaped quotes so it doesn't break
  const unescaped = styleString.replace(/&quot;/g, "'");
  
  // We'll split by semicolon but join back if it was inside a data URI
  const parts = unescaped.split(';');
  const styles = [];
  let current = '';
  for (const part of parts) {
    if (current.includes('url(') && !current.includes(')')) {
      current += ';' + part;
    } else {
      if (current) styles.push(current);
      current = part;
    }
  }
  if (current) styles.push(current);

  const styleObj = {};
  styles.forEach(s => {
    let [key, ...valueParts] = s.split(':');
    let value = valueParts.join(':').trim();
    if (key && value) {
      key = key.trim();
      if (!key.startsWith('--')) {
        key = key.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
      }
      styleObj[key] = value;
    }
  });
  
  const objStr = Object.entries(styleObj)
    .map(([k, v]) => {
      // Escape single quotes inside the value
      const escapedValue = v.replace(/'/g, "\\'");
      if (k.startsWith('--')) {
        return `'${k}': '${escapedValue}'`;
      }
      return `${k}: '${escapedValue}'`;
    })
    .join(', ');
  
  return `style={{ ${objStr} }}`;
});

['img', 'input', 'br', 'hr', 'path'].forEach(tag => {
  const regex = new RegExp(`<${tag}\\s+([^>]*?)(?<!/)>`, 'gi');
  html = html.replace(regex, `<${tag} $1 />`);
});

const output = `
import React from 'react';

const ConvertedLanding: React.FC = () => {
  return (
    <>
      ${html}
    </>
  );
};

export default ConvertedLanding;
`;

fs.writeFileSync('src/features/landing/components/ConvertedLanding.tsx', output);
console.log('Conversion complete');
