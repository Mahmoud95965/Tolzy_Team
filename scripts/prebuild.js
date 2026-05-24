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
    console.log('⚡️ [prebuild] Cloudflare Pages Build Detected! Running Prebuild Hook...');

    // 1. Temporarily rename all route.ts / route.js inside app/api to route.disabled.ts / route.disabled.js
    const apiPath = path.resolve('app/api');
    if (fs.existsSync(apiPath)) {
        console.log('📦 [prebuild] Renaming app/api Route Handlers to exclude them from static export...');
        let count = 0;
        try {
            walkDir(apiPath, (filePath) => {
                const base = path.basename(filePath);
                if (base === 'route.ts' || base === 'route.js') {
                    const dir = path.dirname(filePath);
                    const ext = path.extname(filePath);
                    const newPath = path.join(dir, `route.disabled${ext}`);
                    fs.renameSync(filePath, newPath);
                    count++;
                }
            });
            console.log(`✅ [prebuild] Successfully disabled ${count} Route Handlers.`);
        } catch (error) {
            console.error('❌ [prebuild] Error during renaming route files:', error.message);
        }
    } else {
        console.log('⚠️ [prebuild] app/api directory not found.');
    }

    // 2. Generate public/_redirects file
    const publicPath = path.resolve('public');
    if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true });
    }

    const redirectsPath = path.join(publicPath, '_redirects');
    console.log(`📝 [prebuild] Generating public/_redirects to proxy/redirect API requests to Vercel...`);
    const redirectsContent = `
# Proxy API routes to the primary Vercel deployment
/api/*  https://www.tolzy.me/api/:splat  307

# SPA Route fallbacks for dynamic pages
/admin/articles/edit/*  /admin/articles/edit/[id].html  200
/build/projects/*  /build/projects/[id].html  200
/changelog/*  /changelog/[id].html  200
/copilot/*  /copilot/[chatId].html  200
/paths/*  /paths/[pathId].html  200
`;
    fs.writeFileSync(redirectsPath, redirectsContent.trim() + '\n');
    console.log('✅ [prebuild] public/_redirects successfully generated.');
    console.log('✅ [prebuild] Prebuild script finished successfully.');
} else {
    console.log('⚡️ [prebuild] Local or Vercel build environment detected. Skipping prebuild hooks.');
}
