// Get the current build number
let buildNumber = require('./package.json').version;
// Increment the build number
buildNumber++;
// Update the build number in the package.json file
require('fs').writeFileSync('./package.json', JSON.stringify({ version: buildNumber }, null, 2));
