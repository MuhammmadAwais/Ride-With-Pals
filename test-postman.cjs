const fs = require('fs');
const data = JSON.parse(fs.readFileSync('User.postman_collection.json', 'utf8'));

function findEndpoint(items) {
  for (const item of items) {
    if (item.name === "Add Rides") {
      console.log(JSON.stringify(item.request.body, null, 2));
      return true;
    }
    if (item.item) {
      if (findEndpoint(item.item)) return true;
    }
  }
  return false;
}

findEndpoint(data.item);
