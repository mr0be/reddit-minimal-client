import fs from 'fs';
import path from 'path';


function renameFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.js')) {
      const oldPath = path.join(dir, file);
      const newPath = path.join(dir, file.replace('.js', '.cjs'));
      fs.renameSync(oldPath, newPath);
    }
  });
}

renameFiles('dist-cjs');