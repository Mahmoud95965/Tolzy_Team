import { generateHuggingFaceEmbedding } from '../../lib/huggingface.js';


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateEmbeddings = async (items) => {
    console.log(`\n🚀 Generating Embeddings for ${items.length} items...`);
    const processedItems = [];
    const batchSize = 10; // لإدارة معدل الطلبات (Rate Limiting)

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // تخطي العناصر التي لا تحتوي على اسم
        if (!item.name) continue;

        // تجهيز النص للتحليل (يدعم العربية والإنجليزية)
        const textToEmbed = `
Tool Name: ${item.name}
Category: ${item.category || 'General'}
Description: ${item.description || item.desc || ''}
`.trim();

        try {
            // إضافة تأخير بسيط كل 10 عناصر لتجنب حظر الـ API
            if (i > 0 && i % batchSize === 0) {
                process.stdout.write('.');
                await sleep(2000);
            }

            const embedding = await generateHuggingFaceEmbedding(textToEmbed);

            processedItems.push({
                ...item,
                embedding
            });
        } catch (error) {
            console.error(`\n❌ Error embedding item "${item.name}":`, error.message);
        }
    }

    console.log(`\n✅ Generated embeddings for ${processedItems.length} items.`);
    return processedItems;
};