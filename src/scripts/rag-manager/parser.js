import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

/**
 * دمج البيانات الغنية في وصف واحد للـ AI
 */
const buildRichDescription = (item) => {
    let parts = [];

    // الوصف الطويل أولاً
    if (item.longDescription) {
        parts.push(item.longDescription);
    } else if (item.description) {
        parts.push(item.description);
    }

    // المميزات
    if (item.pros && Array.isArray(item.pros) && item.pros.length > 0) {
        parts.push(`المميزات: ${item.pros.join('، ')}`);
    }

    // العيوب
    if (item.cons && Array.isArray(item.cons) && item.cons.length > 0) {
        parts.push(`العيوب: ${item.cons.join('، ')}`);
    }

    // الميزات الرئيسية
    if (item.features && Array.isArray(item.features) && item.features.length > 0) {
        parts.push(`الميزات: ${item.features.slice(0, 5).join('، ')}`);
    }

    return parts.join(' | ') || item.description || item.name;
};

/**
 * تحويل البيانات لهيكل موحد
 */
const normalizeItem = (item) => {
    const id = item.id || `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
        id: id,
        name: item.name || 'Unknown Tool',
        description: buildRichDescription(item),
        category: item.category || 'General',
        // رابط Tolzy الموحد
        link: `https://www.tolzy.me/tools/${id}`
    };
};

export const parseFile = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.json') {
        try {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            const jsonData = JSON.parse(rawData);

            let items = [];

            // التحقق: هل الملف مصفوفة مباشرة؟
            if (Array.isArray(jsonData)) {
                items = jsonData;
            }
            // التحقق: هل البيانات داخل مفتاح "tools"؟
            else if (jsonData.tools && Array.isArray(jsonData.tools)) {
                items = jsonData.tools;
            }
            else {
                console.warn(`⚠️  Unexpected JSON structure in ${path.basename(filePath)}. Expected array or { "tools": [] }`);
                return [];
            }

            // تحويل كل عنصر للهيكل الموحد مع الوصف الغني
            return items.map(normalizeItem);

        } catch (error) {
            console.error(`❌ Error parsing JSON file ${filePath}:`, error.message);
            return [];
        }
    }

    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const items = xlsx.utils.sheet_to_json(sheet);
            return items.map(normalizeItem);
        } catch (error) {
            console.error(`❌ Error parsing Excel/CSV file ${filePath}:`, error.message);
            return [];
        }
    }

    console.warn(`Skipping unsupported file type: ${filePath}`);
    return [];
};

export const loadDataFromDirectory = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        console.error(`Directory not found: ${dirPath}`);
        return [];
    }

    const files = fs.readdirSync(dirPath);
    let allData = [];

    for (const file of files) {
        // تجاهل الملفات المخفية
        if (file.startsWith('.')) continue;

        const fullPath = path.join(dirPath, file);
        console.log(`Processing file: ${file}`);

        const data = parseFile(fullPath);

        if (data && data.length > 0) {
            console.log(` -> Found ${data.length} items.`);
            allData = [...allData, ...data];
        } else {
            console.log(` -> No valid items found.`);
        }
    }

    return allData;
};