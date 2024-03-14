import { readJsonFile } from 'vite-plugin-web-extension';
import { zip } from 'zip-a-folder';

const pkg = readJsonFile('package.json');

const target = process.env.TARGET || 'chrome';

const version = pkg.version;
const name = pkg.name;
const zipFile = `packages/${name}-${target}-v${version}.zip`;

console.log('\n\nZipping...\n');

await zip('dist', zipFile);

console.log('Extension bundle:', zipFile, '\n\n');
