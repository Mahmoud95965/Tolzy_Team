import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/components/common/Navbar.tsx',
  'src/components/home/EnhancedHero.tsx',
  'src/components/home/HomeClient.tsx',
  'src/components/home/NewsPanelSection.tsx',
  'src/components/home/NewsTickerBanner.tsx',
  'src/components/home/WhatIsTolzy.tsx',
  'src/components/layout/WelcomeBanner.tsx',
  'src/config/seo.config.ts',
  'src/utils/seoHelpers.ts',
  'src/views/DocsPage.tsx',
  'src/views/PricingPage.tsx',
  'src/views/ToolsPage.tsx'
];

function updateFile(filePath) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  // Replace text instances of 630
  // e.g. 630+, +630, target={630}, 630 أداة, etc.
  content = content.replace(/630\+/g, '1000+');
  content = content.replace(/\+630/g, '+1000');
  content = content.replace(/target=\{630\}/g, 'target={1000}');
  content = content.replace(/630\s*أداة/g, '1000 أداة');
  content = content.replace(/630\s*من\s*الأدوات/g, '1000 من الأدوات');
  
  // Replace instances of 630 in strings where it stands for tools, but not heights
  content = content.replace(/(?<!height:\s*|height:\s|ogHeight:\s*|ogHeight:\s)630(?!px)/g, '1000');

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`No changes: ${filePath}`);
  }
}

filesToUpdate.forEach(updateFile);
console.log('Finished updating 630 to 1000! ✅');
