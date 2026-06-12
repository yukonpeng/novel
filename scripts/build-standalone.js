import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const viteBin = resolve(root, 'node_modules/vite/bin/vite.js');

try {
  execFileSync(process.execPath, [viteBin, 'build', '--config', 'vite.config.standalone.ts'], {
    cwd: root,
    stdio: 'inherit',
  });
} catch {
  process.exit(1);
}
