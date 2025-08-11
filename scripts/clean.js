import fs from 'fs';

if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
  console.log('✅ dist/ delete');
}

if (fs.existsSync('dist-cjs')) {
  fs.rmSync('dist-cjs', { recursive: true });
  console.log('✅ dist-cjs/ delete');
}