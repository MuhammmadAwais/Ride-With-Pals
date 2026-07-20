const fs = require('fs');
const data = JSON.parse(fs.readFileSync('User.postman_collection.json', 'utf8'));

function findEndpointResponses(items) {
  for (const item of items) {
    if (item.name === "Add Rides") {
      if (item.response && item.response.length > 0) {
        console.log("Found responses for Add Rides:");
        item.response.forEach(r => {
          console.log(`Response name: ${r.name}, Status: ${r.status}, Code: ${r.code}`);
          console.log(`Body:\n${r.body}`);
        });
      } else {
        console.log("No saved responses found for Add Rides.");
      }
      return true;
    }
    if (item.item) {
      if (findEndpointResponses(item.item)) return true;
    }
  }
  return false;
}

findEndpointResponses(data.item);
