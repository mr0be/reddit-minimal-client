import fs from 'fs';
import path from 'path';

const sourceDir = 'dist-cjs';
const targetDir = 'dist';

console.log('Checking directories...');
console.log(`Source: ${sourceDir} exists:`, fs.existsSync(sourceDir));
console.log(`Target: ${targetDir} exists:`, fs.existsSync(targetDir));

if (!fs.existsSync(sourceDir)) {
  console.log('Error: dist-cjs directory not found!');
  process.exit(1);
}

// List all files in source directory
const files = fs.readdirSync(sourceDir);
console.log('Files in dist-cjs:', files);

// Copy .js files as .cjs to target directory
files.forEach(file => {
  if (file.endsWith('.js')) {
    const sourcePath = path.join(sourceDir, file);
    const cjsName = file.replace('.js', '.cjs');
    const targetPath = path.join(targetDir, cjsName);
    
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied: ${file} → ${cjsName}`);
  }
});

// Clean up temporary directory
fs.rmSync(sourceDir, { recursive: true });
console.log('Cleaned up dist-cjs directory');