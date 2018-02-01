import fs from 'fs';
import path from 'path';

let colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

['docs/js', 'docs/css', 'docs/assets', 'dist/js', 'dist/css', 'dist/assets'].forEach(function checkIfCriticalRouteExist(item) {
  let [routeFolders, route] = [item.split('/'), process.cwd()];

  routeFolders.forEach(function generateFolder(folder) {
    route += `${path.sep}${folder}`;

    if (!fs.existsSync(route)) {
      fs.mkdirSync(route);
      console.log(`${colors.green}%s${colors.reset}`, `Created: ${route}`);
    }
  });
});
