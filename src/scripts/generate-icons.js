import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../../public/tolzy-logo.svg');
const destWebp = path.join(__dirname, '../../public/image/tools/Logo.webp');

async function convert() {
  if (!fs.existsSync(svgPath)) {
    console.error('tolzy-logo.svg not found!');
    return;
  }

  const svgBuffer = fs.readFileSync(svgPath);

  // 1. Overwrite Logo.webp which is used in Next.js layout metadata and existing components
  await sharp(svgBuffer)
    .resize(512, 512)
    .webp({ quality: 100 })
    .toFile(destWebp);
  console.log('Successfully updated Logo.webp');

  // 2. Generate standard PNG sizes for PWA manifest & Apple Touch Icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, '../../public/tolzy-logo-192.png'));
  
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../../public/tolzy-logo-512.png'));
    
  console.log('Successfully generated PNG icons');
}

convert().catch(console.error);
