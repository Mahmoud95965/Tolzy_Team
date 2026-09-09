/**
 * سكريبت لتصدير أهم أدوات بناء المواقع من Firebase إلى ملف JSON
 * يستهدف الفئات: Programming, Design, Productivity, Technology
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Admin initialization
const requiredEnvVars = {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY,
};

const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error(`❌ Missing Firebase Admin environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: requiredEnvVars.projectId,
            clientEmail: requiredEnvVars.clientEmail,
            privateKey: requiredEnvVars.privateKey.replace(/\\n/g, '\n'),
        }),
    });
    console.log('✅ Firebase Admin Initialized Successfully');
}

const db = admin.firestore();

// الفئات المتعلقة ببناء المواقع
const WEB_DEVELOPMENT_CATEGORIES = [
    'Programming',
    'Design',
    'Productivity',
    'Technology',
    'Automation',
    'Creativity'
];

// الفئات الفرعية المهمة
const WEB_DEVELOPMENT_SUBCATEGORIES = [
    'Code Generation',
    'Code Review',
    'Debugging',
    'Documentation',
    'Testing',
    'UI/UX Design',
    'Graphic Design',
    'Image Generation',
    'Image Editing',
    'Task Management',
    'Automation'
];

async function exportWebDevelopmentTools() {
    console.log('🔍 جاري البحث عن أدوات بناء المواقع...');

    try {
        const snapshot = await db.collection('tools').get();

        if (snapshot.empty) {
            console.log('⚠️ لا توجد أدوات في قاعدة البيانات');
            return;
        }

        const allTools = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            allTools.push({
                id: doc.id,
                ...data
            });
        });

        console.log(`📊 إجمالي الأدوات في قاعدة البيانات: ${allTools.length}`);

        // تصفية الأدوات المتعلقة ببناء المواقع
        const webDevTools = allTools.filter(tool => {
            const categories = Array.isArray(tool.category) ? tool.category : [tool.category];
            const subcategories = Array.isArray(tool.subcategory) ? tool.subcategory : [tool.subcategory];

            // التحقق من الفئات الرئيسية
            const hasWebCategory = categories.some(cat =>
                WEB_DEVELOPMENT_CATEGORIES.includes(cat)
            );

            // التحقق من الفئات الفرعية
            const hasWebSubcategory = subcategories.some(subcat =>
                WEB_DEVELOPMENT_SUBCATEGORIES.includes(subcat)
            );

            // التحقق من الوسوم المتعلقة بالويب
            const webTags = ['web', 'website', 'frontend', 'backend', 'html', 'css', 'javascript',
                'react', 'vue', 'angular', 'node', 'development', 'coding', 'code',
                'developer', 'api', 'ui', 'ux', 'design', 'hosting', 'deploy'];
            const hasWebTags = (tool.tags || []).some(tag =>
                webTags.some(webTag => tag.toLowerCase().includes(webTag))
            );

            return hasWebCategory || hasWebSubcategory || hasWebTags;
        });

        console.log(`🌐 أدوات بناء المواقع: ${webDevTools.length}`);

        // ترتيب حسب التقييم والشهرة
        const sortedTools = webDevTools.sort((a, b) => {
            // الأولوية للأدوات المميزة
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;

            // ثم الأدوات الشائعة
            if (a.isPopular && !b.isPopular) return -1;
            if (!a.isPopular && b.isPopular) return 1;

            // ثم حسب التقييم
            return (b.rating || 0) - (a.rating || 0);
        });

        // تنسيق البيانات للتصدير
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                totalTools: sortedTools.length,
                categories: WEB_DEVELOPMENT_CATEGORIES,
                description: 'أهم أدوات الذكاء الاصطناعي لبناء المواقع من منصة Tolzy'
            },
            tools: sortedTools.map(tool => ({
                id: tool.id,
                name: tool.name,
                description: tool.description,
                longDescription: tool.longDescription || '',
                category: tool.category,
                subcategory: tool.subcategory || '',
                pricing: tool.pricing,
                url: tool.url,
                imageUrl: tool.imageUrl || tool.image || '',
                rating: tool.rating || 0,
                reviewCount: tool.reviewCount || 0,
                features: tool.features || [],
                pros: tool.pros || [],
                cons: tool.cons || [],
                tags: tool.tags || [],
                isFeatured: tool.isFeatured || false,
                isPopular: tool.isPopular || false,
                isNew: tool.isNew || false,
                tolzyLink: `https://www.tolzy.me/tools/${tool.id}`
            }))
        };

        // حفظ الملف
        const outputPath = path.join(__dirname, '..', '..', 'data', 'web-development-tools.json');

        // إنشاء المجلد إذا لم يكن موجوداً
        const dataDir = path.dirname(outputPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf8');

        console.log(`\n✅ تم تصدير ${sortedTools.length} أداة بنجاح!`);
        console.log(`📁 الملف: ${outputPath}`);

        // عرض إحصائيات
        console.log('\n📊 إحصائيات:');
        const categoryStats = {};
        sortedTools.forEach(tool => {
            const cats = Array.isArray(tool.category) ? tool.category : [tool.category];
            cats.forEach(cat => {
                categoryStats[cat] = (categoryStats[cat] || 0) + 1;
            });
        });

        Object.entries(categoryStats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([cat, count]) => {
                console.log(`   ${cat}: ${count} أداة`);
            });

        const pricingStats = {};
        sortedTools.forEach(tool => {
            pricingStats[tool.pricing] = (pricingStats[tool.pricing] || 0) + 1;
        });

        console.log('\n💰 التسعير:');
        Object.entries(pricingStats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([pricing, count]) => {
                console.log(`   ${pricing}: ${count} أداة`);
            });

    } catch (error) {
        console.error('❌ خطأ في تصدير الأدوات:', error);
        process.exit(1);
    }

    process.exit(0);
}

// تشغيل السكريبت
exportWebDevelopmentTools();
