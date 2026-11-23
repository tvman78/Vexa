// Increments the patch version (1.1.0 -> 1.1.1) in package.json and prints the new version.
import fs from 'node:fs';

const file = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
const parts = pkg.version.split('.').map(Number);
parts[2] += 1;
pkg.version = parts.join('.');
fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(pkg.version);
