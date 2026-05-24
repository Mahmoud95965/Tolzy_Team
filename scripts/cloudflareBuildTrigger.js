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

function disableRoutes() {
    const apiPath = path.resolve('app/api');
    if (fs.existsSync(apiPath)) {
        console.log('📦 [Cloudflare-Trigger] Disabling app/api Route Handlers to exclude them from static export...');
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
            console.log(`✅ [Cloudflare-Trigger] Successfully disabled ${count} Route Handlers.`);
        } catch (error) {
            console.error('❌ [Cloudflare-Trigger] Error disabling Route Handlers:', error.message);
        }
    }
}

function restoreRoutes() {
    const apiPath = path.resolve('app/api');
    if (fs.existsSync(apiPath)) {
        console.log('📦 [Cloudflare-Trigger] Restoring app/api Route Handlers...');
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
            console.log(`✅ [Cloudflare-Trigger] Successfully restored ${count} Route Handlers.`);
        } catch (error) {
            console.error('❌ [Cloudflare-Trigger] Error restoring Route Handlers:', error.message);
        }
    }
}

if (isCloudflare) {
    // Determine if this is the main parent process to avoid premature cleanup when child workers exit
    const isMainProcess = !process.env.CLOUDFLARE_MAIN_PID || process.env.CLOUDFLARE_MAIN_PID === process.pid.toString();

    if (isMainProcess && !global.cloudflareBuildTriggered) {
        global.cloudflareBuildTriggered = true;
        process.env.CLOUDFLARE_MAIN_PID = process.pid.toString();

        console.log(`⚡️ [Cloudflare-Trigger] Cloudflare Pages Build Detected (Main Process PID: ${process.pid})! Running Prebuild Hook...`);

        // 1. Run prebuild immediately to disable routes
        disableRoutes();

        // 2. Generate public/_redirects file
        const publicPath = path.resolve('public');
        if (!fs.existsSync(publicPath)) {
            fs.mkdirSync(publicPath, { recursive: true });
        }

        const redirectsPath = path.join(publicPath, '_redirects');
        console.log(`📝 [Cloudflare-Trigger] Generating public/_redirects...`);
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
        console.log('✅ [Cloudflare-Trigger] public/_redirects successfully generated.');

        // 3. Register teardown listener to run postbuild ONLY when the main Next.js build process exits
        let cleaned = false;
        const cleanup = () => {
            if (cleaned) return;
            cleaned = true;
            console.log(`⚡️ [Cloudflare-Trigger] Main Process (PID: ${process.pid}) exiting. Running Postbuild Hook...`);
            restoreRoutes();
        };

        process.on('exit', cleanup);
        process.on('SIGINT', () => {
            cleanup();
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            cleanup();
            process.exit(0);
        });
        process.on('uncaughtException', (err) => {
            console.error('❌ [Cloudflare-Trigger] Build hit uncaught exception:', err);
            cleanup();
            process.exit(1);
        });
    } else {
        // Log child process detection silently or briefly to keep build logs clean
        if (process.env.DEBUG) {
            console.log(`⚡️ [Cloudflare-Trigger] Child Process (PID: ${process.pid}, Parent PID: ${process.env.CLOUDFLARE_MAIN_PID}) bypassing prebuild/postbuild hooks.`);
        }
    }
}
