const fs = require('fs');
const path = require('path');
const { quicktype, InputData, jsonInputForTargetLanguage } = require("quicktype-core");
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

const requestsByCategory = {};

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
      if (!requestsByCategory[currentCategory]) requestsByCategory[currentCategory] = [];
      
      const reqName = sanitizeName(item.name);
      
      if (item.response && item.response.length > 0) {
        for (const resp of item.response) {
          if (resp.body) {
            try {
              JSON.parse(resp.body); // check validity
              requestsByCategory[currentCategory].push({
                name: reqName + 'Response',
                json: resp.body
              });
            } catch (e) {}
          }
        }
      }
    }
  }
}

processItems(collection.item, null);

async function generate() {
  const outputDir = path.join(__dirname, 'src', 'api', 'types');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [filename, requests] of Object.entries(requestsByCategory)) {
    if (requests.length === 0) continue;

    const jsonInput = jsonInputForTargetLanguage("typescript");
    
    for (const req of requests) {
      await jsonInput.addSource({
        name: req.name,
        samples: [req.json]
      });
    }

    const inputData = new InputData();
    inputData.addInput(jsonInput);

    const qtResult = await quicktype({
      inputData,
      lang: "typescript",
      rendererOptions: {
        "just-types": "true",
        "acronym-style": "original",
        "explicit-unions": "true",
        "prefer-unions": "true",
        "prefer-types": "true"
      }
    });

    let code = qtResult.lines.join('\n');
    
    // Quicktype uses `any` for unknown nulls/arrays. User wants strict TS (no any).
    code = code.replace(/\bany\b/g, 'unknown');
    
    // Convert enums to type unions to support erasableSyntaxOnly
    code = code.replace(/export enum (\w+)\s*\{([^}]+)\}/g, (match, name, body) => {
        const values = body
            .split(',')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => {
                const parts = line.split('=');
                return parts.length > 1 ? parts[1].trim() : `"${parts[0].trim()}"`;
            })
            .join(' | ');
        return `export type ${name} = ${values};`;
    });
    
    fs.writeFileSync(path.join(outputDir, filename), code + '\n');
  }
  
  const files = Object.keys(requestsByCategory).filter(k => requestsByCategory[k].length > 0);
  const indexContent = files.map(f => {
    const name = f.replace('.ts', '');
    const namespaceName = name.charAt(0).toUpperCase() + name.slice(1);
    return `export * as ${namespaceName} from './${name}';`;
  }).join('\n');
  fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent + '\n');
  
  console.log('All TS files generated with Quicktype.');
}

generate().catch(console.error);
