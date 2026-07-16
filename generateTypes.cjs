const fs = require('fs');
const path = require('path');
const JsonToTS = require('json-to-ts');
const _ = require('lodash');

const collectionPath = path.join(__dirname, 'User.postman_collection.json');
const collectionRaw = fs.readFileSync(collectionPath, 'utf8');
const collection = JSON.parse(collectionRaw);

const categoryMap = {
  "Onboarding & Profile": "authTypes.ts",
  "Club": "clubTypes.ts",
  "News": "newsTypes.ts",
  "Shop": "shopTypes.ts",
  "Shop Orders": "shopOrderTypes.ts",
  "MarketPlace": "marketPlaceTypes.ts",
  "Save Rides": "rideTypes.ts",
  "Discounts": "discountTypes.ts",
  "Club Permissions": "permissionTypes.ts",
  "Subscription": "subscriptionTypes.ts",
  "Connect Stripe Account": "stripeTypes.ts",
  "Club Membership": "membershipTypes.ts",
  "Notifications": "notificationTypes.ts"
};

const output = {};

function sanitizeName(name) {
  return _.upperFirst(_.camelCase(name));
}

function processItems(items, currentCategory) {
  for (const item of items) {
    if (item.item) {
      const cat = currentCategory || categoryMap[item.name] || _.camelCase(item.name) + 'Types.ts';
      processItems(item.item, cat);
    } else {
      if (!currentCategory) currentCategory = 'commonTypes.ts';
      if (!output[currentCategory]) output[currentCategory] = new Set();
      
      const reqName = sanitizeName(item.name);
      
      if (item.response && item.response.length > 0) {
        for (const resp of item.response) {
          if (resp.body) {
            try {
              let bodyJson = JSON.parse(resp.body);
              
              const interfaces = JsonToTS(bodyJson, { rootName: reqName + 'Response' });
              
              interfaces.forEach(i => {
                let code = i;
                // quick and dirty namespace fix for 'Response' and 'Row' collisions
                code = code.replace(/\binterface Response\b/g, `interface ${reqName}Data`);
                code = code.replace(/response: Response;/g, `response: ${reqName}Data;`);
                code = code.replace(/response: Response\[\];/g, `response: ${reqName}Data[];`);
                
                code = code.replace(/\binterface Row\b/g, `interface ${reqName}Row`);
                code = code.replace(/rows: Row\[\];/g, `rows: ${reqName}Row[];`);
                
                code = code.replace(/\bany\b/g, 'unknown');
                
                output[currentCategory].add(code);
              });
            } catch (e) {}
          }
        }
      }
    }
  }
}

processItems(collection.item, null);

const outputDir = path.join(__dirname, 'src', 'api', 'types');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let finalMarkdown = '';

for (const [filename, interfaces] of Object.entries(output)) {
  if (interfaces.size === 0) continue;
  
  // write to disk
  fs.writeFileSync(path.join(outputDir, filename), Array.from(interfaces).join('\n\n') + '\n');
  
  // collect markdown
  finalMarkdown += `// ${filename}\n\`\`\`typescript\n`;
  for (const intf of interfaces) {
    finalMarkdown += intf + '\n\n';
  }
  finalMarkdown += `\`\`\`\n\n`;
}

fs.writeFileSync(path.join(__dirname, 'output.md'), finalMarkdown.trim());
console.log('Fixed types generated');
