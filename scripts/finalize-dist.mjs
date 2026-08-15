/**
 * Deletes declaration files for the generated data modules, which no consumer
 * can reach, then reports the published size.
 */
import { readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

let pruned = 0;
let prunedBytes = 0;
for (const file of walk(join(DIST, 'generated'))) {
  if (!file.endsWith('.d.ts')) continue;
  prunedBytes += statSync(file).size;
  rmSync(file);
  pruned++;
}

const files = walk(DIST);
const groups = new Map();
for (const file of files) {
  const rel = file.slice(DIST.length + 1);
  const group = rel.startsWith('generated/cities/')
    ? 'data: cities'
    : rel.startsWith('generated/states/')
      ? 'data: states'
      : rel.startsWith('generated/')
        ? 'data: core'
        : 'library code';
  const acc = groups.get(group) ?? { bytes: 0, files: 0 };
  acc.bytes += statSync(file).size;
  acc.files++;
  groups.set(group, acc);
}

const total = [...groups.values()].reduce((n, g) => n + g.bytes, 0);
const kb = (n) => `${(n / 1000).toFixed(0)} KB`;

console.log(`pruned ${pruned} unreachable declaration files (${kb(prunedBytes)})`);
console.log('');
console.log('published contents:');
for (const [name, g] of [...groups].sort((a, b) => b[1].bytes - a[1].bytes)) {
  console.log(
    `  ${name.padEnd(16)} ${kb(g.bytes).padStart(9)}  ${String(g.files).padStart(4)} files`
  );
}
console.log(
  `  ${'total'.padEnd(16)} ${kb(total).padStart(9)}  ${String(files.length).padStart(4)} files`
);
