import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

function runCommand(command, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

const tscExecutable = process.platform === 'win32'
  ? resolve(projectRoot, 'node_modules', '.bin', 'tsc.cmd')
  : resolve(projectRoot, 'node_modules', '.bin', 'tsc');

try {
  await runCommand(tscExecutable, ['--noEmit']);

  const filesOutput = execSync('git ls-files "*.ts" "*.tsx" "*.js" "*.jsx"', {
    cwd: projectRoot,
    encoding: 'utf8',
  });

  const files = filesOutput
    .split('\n')
    .filter(Boolean)
    .filter((relativePath) =>
      relativePath.startsWith('app/') ||
      relativePath.startsWith('components/') ||
      relativePath.startsWith('lib/') ||
      relativePath.startsWith('tests/') ||
      relativePath.startsWith('scripts/') ||
      relativePath === 'middleware.ts'
    );
  const offending = files
    .map((relativePath) => {
      const absolutePath = resolve(projectRoot, relativePath);
      if (!existsSync(absolutePath)) {
        return null;
      }
      const content = readFileSync(absolutePath, 'utf8');
      if (/(^|[^.])console\.log\s*\(/.test(content)) {
        return relativePath;
      }
      return null;
    })
    .filter((value) => value !== null);

  if (offending.length > 0) {
    console.error('\nDisallowed console.log statements found in:');
    for (const file of offending) {
      console.error(` - ${file}`);
    }
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
