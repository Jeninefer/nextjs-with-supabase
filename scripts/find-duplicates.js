import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { createHash } from 'crypto';

const slidesDir = './src/components/slides';
const fileHashes = new Map();
const duplicates = [];

function getFileHash(filepath) {
  const content = readFileSync(filepath, 'utf8');
  // Normalize whitespace for comparison
  const normalized = content.replace(/\s+/g, ' ').trim();
  return createHash('md5').update(normalized).digest('hex');
}

function scanDirectory(dir) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filepath = join(dir, file);
    const stat = statSync(filepath);
    
    if (stat.isDirectory()) {
      scanDirectory(filepath);
    } else if (['.tsx', '.ts'].includes(extname(file))) {
      const hash = getFileHash(filepath);
      
      if (fileHashes.has(hash)) {
        duplicates.push({
          original: fileHashes.get(hash),
          duplicate: filepath
        });
      } else {
        fileHashes.set(hash, filepath);
      }
    }
  });
}

console.log('🔍 Scanning for duplicate files...\n');
scanDirectory(slidesDir);

if (duplicates.length === 0) {
  console.log('✅ No duplicate files found!');
} else {
  console.log(`⚠️  Found ${duplicates.length} duplicate(s):\n`);
  duplicates.forEach(({ original, duplicate }) => {
    console.log(`  Original:  ${original}`);
    console.log(`  Duplicate: ${duplicate}\n`);
  });
}
