import fs from 'fs';
import path from 'path';

const ignoreDirs = ['node_modules', '.next', '.git', 'out', '.firebase'];

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        searchDir(fullPath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html'].includes(ext)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('630')) {
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.includes('630')) {
              console.log(`${filePath(fullPath)}:${idx + 1}: ${line.trim()}`);
            }
          });
        }
      }
    }
  }
}

function filePath(p) {
  return path.relative(process.cwd(), p);
}

console.log('Searching for "630" in workspace...');
searchDir(process.cwd());
console.log('Search finished.');
