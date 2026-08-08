const fs = require('fs');

let html = fs.readFileSync('footer_raw.html', 'utf8');

html = html.replace(/class=/g, 'className=');
html = html.replace(/for=/g, 'htmlFor=');
html = html.replace(/tabindex/g, 'tabIndex');
html = html.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');
html = html.replace(/<\/path>/g, '');
html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
html = html.replace(/\/ fetchpriority="high"/g, 'fetchpriority="high"');

// Convert inline styles to objects
html = html.replace(/style="([^"]*)"/g, (match, styleString) => {
  const unescaped = styleString.replace(/&quot;/g, "'");
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

export const FooterSection: React.FC = () => {
  return (
    ${html}
  );
};
`;

fs.writeFileSync('src/features/landing/components/FooterSection.tsx', output);
console.log('Conversion complete');
