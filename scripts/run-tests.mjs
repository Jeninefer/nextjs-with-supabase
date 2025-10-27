import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync, rmSync, readdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const testOutputDir = resolve(projectRoot, '.test-dist');

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

if (existsSync(testOutputDir)) {
  rmSync(testOutputDir, { recursive: true, force: true });
}

const tscExecutable = process.platform === 'win32'
  ? resolve(projectRoot, 'node_modules', '.bin', 'tsc.cmd')
  : resolve(projectRoot, 'node_modules', '.bin', 'tsc');

function collectTestFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTestFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
      files.push(entryPath);
    }
  }

  return files;
}

try {
  await runCommand(tscExecutable, ['-p', 'tsconfig.test.json']);
  const compiledTests = collectTestFiles(resolve(testOutputDir, 'tests'));

  if (compiledTests.length === 0) {
    console.warn('No compiled test files were found.');
    process.exitCode = 1;
  } else {
    const aliasBootstrap = resolve(__dirname, 'test-alias.cjs');
    await runCommand(process.execPath, ['--require', aliasBootstrap, '--test', ...compiledTests]);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
