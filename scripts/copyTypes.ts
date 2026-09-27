import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dir, '..');
const source = path.join(root, 'server', 'src', 'sharedTypes');
const target = path.join(root, 'client', 'src', 'sharedTypes');

if (!existsSync(source)) {
  console.error(`clone:types: source directory not found: ${path.relative(root, source)}`);
  process.exit(1);
}

function countFiles(dir: string): number {
  return readdirSync(dir, { withFileTypes: true }).reduce((total, entry) => {
    if (entry.isDirectory()) return total + countFiles(path.join(dir, entry.name));
    return total + (entry.isFile() ? 1 : 0);
  }, 0);
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });

console.log(`clone:types: copied ${countFiles(target)} files to ${path.relative(root, target)}`);
