/**
 * سكريبت بسيط لتصدير الأدوات من Firebase
 * يستخرج: id, name, description, category فقط
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
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
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

async function exportToolsSimple() {
    console.log('🔍 جاري استخراج الأدوات من Firebase...');

    try {
        const snapshot = await db.collection('tools').get();

        if (snapshot.empty) {
            console.log('⚠️ لا توجد أدوات في قاعدة البيانات');
            return;
        }

        const tools = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            tools.push({
                id: doc.id,
                name: data.name || '',
                description: data.description || '',
                category: data.category || 'Other'
            });
        });

        console.log(`📊 إجمالي الأدوات: ${tools.length}`);

        // ترتيب حسب القسم
        tools.sort((a, b) => {
            const catA = Array.isArray(a.category) ? a.category[0] : a.category;
            const catB = Array.isArray(b.category) ? b.category[0] : b.category;
            return catA.localeCompare(catB);
        });

        // تنسيق البيانات للتصدير
        const exportData = {
            exportDate: new Date().toISOString(),
            totalTools: tools.length,
            tools: tools
        };

        // حفظ الملف
        const outputPath = path.join(__dirname, '..', '..', 'data', 'tools-simple.json');

        // إنشاء المجلد إذا لم يكن موجوداً
        const dataDir = path.dirname(outputPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf8');

        console.log(`\n✅ تم تصدير ${tools.length} أداة بنجاح!`);
        console.log(`📁 الملف: ${outputPath}`);

        // عرض إحصائيات الأقسام
        console.log('\n📊 إحصائيات الأقسام:');
        const categoryStats = {};
        tools.forEach(tool => {
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

        // عرض عينة من البيانات
        console.log('\n📋 عينة من الأدوات:');
        tools.slice(0, 5).forEach(tool => {
            console.log(`   - [${tool.id}] ${tool.name} (${Array.isArray(tool.category) ? tool.category.join(', ') : tool.category})`);
        });

    } catch (error) {
        console.error('❌ خطأ في تصدير الأدوات:', error);
        process.exit(1);
    }

    process.exit(0);
}

// تشغيل السكريبت
exportToolsSimple();
