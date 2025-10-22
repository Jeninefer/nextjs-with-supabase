import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const matches = [];

function detectLicenseType(text) {
  const t = text.toUpperCase();
  if (t.includes('MIT LICENSE') || (t.includes('MIT') && t.includes('PERMISSION IS HEREBY GRANTED'))) return 'MIT';
  if (t.includes('APACHE LICENSE') || t.includes('APACHE')) return 'Apache-2.0';
  if (t.includes('BSD')) return 'BSD';
  if (t.includes('GNU GENERAL PUBLIC LICENSE') || t.includes('GPL')) return 'GPL';
  if (t.includes('MOZILLA PUBLIC LICENSE') || t.includes('MPL')) return 'MPL';
  if (t.includes('ISC LICENSE') || t.includes('ISC')) return 'ISC';
  return 'Unknown';
}

function scanDirectory(dir) {
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      let stat;
      
      try {
        stat = statSync(fullPath);
      } catch (err) {
        continue; // Skip files we can't access
      }
      
      if (stat.isDirectory()) {
        if (['node_modules', '.git', 'dist', 'build', '.cache', '.vite', '.parcel-cache'].includes(entry)) continue;
        scanDirectory(fullPath);
      } else {
        const name = basename(fullPath).toUpperCase();
        if (name === 'LICENSE' || name.startsWith('LICENSE.') || 
            name.startsWith('LICENCE') || name.startsWith('LICENSE-') || 
            name === 'COPYING' || name === 'COPYRIGHT') {
          try {
            const content = readFileSync(fullPath, 'utf8');
            const type = detectLicenseType(content);
            const snippet = content.split('\n').slice(0, 3).join(' ').trim().substring(0, 100);
            const relativePath = fullPath.replace(root, '').replace(/^\//, '');
            matches.push({ 
              path: relativePath, 
              type, 
              snippet,
              size: stat.size
            });
          } catch (err) {
            console.error(`⚠️  Could not read ${fullPath}: ${err.message}`);
          }
        }
      }
    }
  } catch (err) {
    console.error(`⚠️  Error scanning ${dir}: ${err.message}`);
  }
}

console.log('🔎 Scanning for license files...\n');
scanDirectory(root);

if (matches.length === 0) {
  console.log('✅ No license files found.');
  process.exit(0);
}

console.log(`📄 Found ${matches.length} license file(s):\n`);
matches.forEach((m, i) => {
  console.log(`${i + 1}. ${m.path}`);
  console.log(`   Type: ${m.type}`);
  console.log(`   Size: ${m.size} bytes`);
  console.log(`   Preview: ${m.snippet}...\n`);
});

// Summary by type
const summary = matches.reduce((acc, m) => {
  acc[m.type] = (acc[m.type] || 0) + 1;
  return acc;
}, {});

console.log('📊 Summary by detected type:');
Object.entries(summary).forEach(([type, count]) => {
  console.log(`   ${type}: ${count} file(s)`);
});

console.log('\n💡 Tip: Run `npm run cleanup:now` to remove duplicates (keeps root /LICENSE only).');

// Exit with code 1 if duplicates found (useful for CI/CD)
if (matches.length > 1) {
  console.log('\n⚠️  Multiple license files detected!');
  process.exit(1);
}

// Exit with code 0 if only one LICENSE found
process.exit(0);
