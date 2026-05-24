import fs from 'fs';
import path from 'path';

const isCloudflare = process.env.CF_PAGES === '1';

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

if (isCloudflare) {
    console.log('⚡️ [postbuild] Cloudflare Pages Build Complete! Running Postbuild Hook...');

    const apiPath = path.resolve('app/api');
    if (fs.existsSync(apiPath)) {
        console.log('📦 [postbuild] Restoring app/api Route Handlers...');
        let count = 0;
        try {
            walkDir(apiPath, (filePath) => {
                const base = path.basename(filePath);
                if (base === 'route.disabled.ts' || base === 'route.disabled.js') {
                    const dir = path.dirname(filePath);
                    const ext = path.extname(filePath);
                    const newPath = path.join(dir, `route${ext}`);
                    fs.renameSync(filePath, newPath);
                    count++;
                }
            });
            console.log(`✅ [postbuild] Successfully restored ${count} Route Handlers.`);
        } catch (error) {
            console.error('❌ [postbuild] Error during restoring route files:', error.message);
        }
    } else {
        console.log('⚠️ [postbuild] app/api directory not found.');
    }

    console.log('✅ [postbuild] Postbuild script finished successfully.');
} else {
    console.log('⚡️ [postbuild] Local or Vercel build environment detected. Skipping postbuild hooks.');
}
