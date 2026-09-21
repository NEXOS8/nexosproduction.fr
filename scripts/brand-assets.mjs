import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const runtimeRequire = createRequire(path.resolve(path.dirname(process.execPath), '../package.json'));
let sharp;
try { sharp = require('sharp'); }
catch { sharp = runtimeRequire('sharp'); }
const assets = fileURLToPath(new URL('../assets/', import.meta.url));
const favicon = path.join(assets, 'favicon.svg');

for (const [filename, size] of [
  ['icon-192-v2.png', 192],
  ['icon-512-v2.png', 512],
  ['apple-touch-icon-v2.png', 180],
]) {
  await sharp(favicon, { density: 768 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(path.join(assets, filename));
  process.stdout.write(`${filename}: ${size} × ${size}\n`);
}

for (const version of ['v2', 'v3']) {
  await sharp(path.join(assets, `social-${version}.svg`))
    .png({ compressionLevel: 9 })
    .toFile(path.join(assets, `social-${version}.png`));
  process.stdout.write(`social-${version}.png: 1200 × 630\n`);
}
