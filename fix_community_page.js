const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'views', 'CommunityPage.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

console.log(`Total lines before: ${lines.Length}`);

// Lines are 1-indexed in view_file. 
// We want to KEEP lines 0..956 (indices) and lines 1175..(end) (indices 1174..end)
// The orphaned block is lines 957..1175 (1-indexed) = indices 957..1175
const kept = [...lines.slice(0, 957), ...lines.slice(1175)];

console.log(`Total lines after: ${kept.length}`);
fs.writeFileSync(filePath, kept.join('\n'), 'utf8');
console.log('Done! Orphaned code removed.');
