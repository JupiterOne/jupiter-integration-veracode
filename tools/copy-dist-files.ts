import fs from 'fs';

/* tslint:disable-next-line:no-var-requires */
const packageContent = require('../package.json');
fs.writeFileSync('dist/package.json', JSON.stringify(
  {
    ...packageContent,
    devDependencies: {},
    scripts: {},
  }, null, 2,
));

fs.copyFileSync('LICENSE', 'dist/LICENSE');
fs.copyFileSync('README.md', 'dist/README.md');
