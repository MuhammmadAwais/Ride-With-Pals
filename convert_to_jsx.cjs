const fs = require('fs');
const HTMLtoJSX = require('html-to-jsx');

const html = fs.readFileSync('src/features/landing/landing.html', 'utf8');

const converter = new HTMLtoJSX({
  createClass: false,
});

let jsx = converter.convert(html);

// Remove the html comments from JSX since they might be poorly translated if they are between tags
jsx = jsx.replace(/{\/\*[\s\S]*?\*\/}/g, '');

const output = `
import React from 'react';

const ConvertedLanding: React.FC = () => {
  return (
    <>
      ${jsx}
    </>
  );
};

export default ConvertedLanding;
`;

fs.writeFileSync('src/features/landing/components/ConvertedLanding.tsx', output);
console.log('Conversion complete');
