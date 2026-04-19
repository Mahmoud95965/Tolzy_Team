const fs = require('fs');
const path = require('path');

const sourceDir = process.cwd();
const targetDir = path.join(sourceDir, '../tolzy-auth-system');

const dirsToCreate = [
    '',
    'app',
    'app/auth',
    'src',
    'src/config',
    'src/context',
    'src/types',
    'src/views',
    'src/components',
    'src/components/layout',
    'src/components/common',
    'src/components/icons',
    'public',
    'public/image',
    'public/image/tools'
];

const filesToCopy = [
    { src: 'package.json', dest: 'package.json' },
    { src: 'tsconfig.json', dest: 'tsconfig.json' },
    { src: 'tailwind.config.js', dest: 'tailwind.config.js' },
    { src: 'postcss.config.js', dest: 'postcss.config.js' },
    { src: 'middleware.ts', dest: 'middleware.ts' },
    { src: 'src/index.css', dest: 'app/globals.css' }, // Move standard CSS location
    { src: 'src/config/firebase.ts', dest: 'src/config/firebase.ts' },
    { src: 'src/context/AuthContext.tsx', dest: 'src/context/AuthContext.tsx' },
    { src: 'src/views/AuthPage.tsx', dest: 'src/views/AuthPage.tsx' },
    { src: 'src/types/user.ts', dest: 'src/types/user.ts' },
    { src: 'src/components/layout/PageLayout.tsx', dest: 'src/components/layout/PageLayout.tsx' },
    { src: 'src/components/icons/GoogleIcon.tsx', dest: 'src/components/icons/GoogleIcon.tsx' },
    // Copy logo if possible (blind copy)
    { src: 'public/image/tools/Logo.png', dest: 'public/image/tools/Logo.png', optional: true }
];

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Create subdirectories
dirsToCreate.forEach(dir => {
    const fullPath = path.join(targetDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Copy files
filesToCopy.forEach(file => {
    const srcPath = path.join(sourceDir, file.src);
    const destPath = path.join(targetDir, file.dest);

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file.src} to ${file.dest}`);
    } else if (!file.optional) {
        console.warn(`Warning: Source file not found: ${file.src}`);
    }
});

// Create minimal helper files
const layoutContent = `
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/src/context/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Tolzy Sign In',
    description: 'Authentication System for Tolzy',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body className={inter.className}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
`;

const pageContent = `
import AuthPage from '@/src/views/AuthPage';

export default function Home() {
    return <AuthPage />;
}
`;

const authPageContent = `
import AuthPage from '@/src/views/AuthPage';

export default function Page() {
    return <AuthPage />;
}
`;

// Minimal PageLayout to replace the complex one (if needed rewrite)
// But wait, the copied PageLayout imports Navbar. We need to OVERWRITE it with a simple one.
const simplePageLayout = `
import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  showCopilot?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <main className="flex-grow flex items-center justify-center">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
`;

fs.writeFileSync(path.join(targetDir, 'app/layout.tsx'), layoutContent.trim());
fs.writeFileSync(path.join(targetDir, 'app/page.tsx'), pageContent.trim());
fs.writeFileSync(path.join(targetDir, 'app/auth/page.tsx'), authPageContent.trim());

// Overwrite PageLayout in the NEW directory to remove dependencies on Navbar/Footer
fs.writeFileSync(path.join(targetDir, 'src/components/layout/PageLayout.tsx'), simplePageLayout.trim());

console.log('files separated successfully to ' + targetDir);
