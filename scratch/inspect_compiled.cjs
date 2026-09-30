const fs = require('fs');
const content = fs.readFileSync('src/locales/hi/messages.ts', 'utf8');

// Find JSON string inside JSON.parse("...")
// In JS: JSON.parse("...") - the argument is a JSON-encoded string!
// Let's extract the argument properly:
const prefix = 'export const messages=JSON.parse(';
const startIdx = content.indexOf(prefix);
if (startIdx !== -1) {
  const jsonStringLiteral = content.slice(startIdx + prefix.length, content.lastIndexOf(');'));
  const parsedJsonString = JSON.parse(jsonStringLiteral);
  const messagesObj = JSON.parse(parsedJsonString);
  const keys = Object.keys(messagesObj);
  console.log('Actual keys in messages.ts:', keys.length);
  console.log('Sample keys:', keys.slice(0, 10));
} else {
  console.log('Prefix not found');
}
