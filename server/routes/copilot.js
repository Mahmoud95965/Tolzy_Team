import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getAllTools } from '../utils/toolsHelper.js';

dotenv.config();

const router = express.Router();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Available models for switching
const AVAILABLE_MODELS = {
    'gemini-2.5-flash': {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'سريع ودقيق'
    },
    'gemini-2.5-flash-lite': {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash Lite',
        description: 'أخف وأسرع'
    }
};

const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });

const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD || '0.98');

router.post('/chat', async (req, res) => {
    try {
        const { message, modelId = 'gemini-2.5-flash', enableSearch = false } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Select model based on request
        const selectedModelId = AVAILABLE_MODELS[modelId] ? modelId : 'gemini-2.5-flash';
        const model = genAI.getGenerativeModel({ model: selectedModelId });

        console.log('--- Received Chat Request ---');
        console.log('Message:', message.substring(0, 50) + '...');
        console.log('Env Check: SUPABASE_URL=' + (!!process.env.SUPABASE_URL) + ', GEMINI_API_KEY=' + (!!process.env.GEMINI_API_KEY));

        // 1. Generate Embedding
        console.log('Step 1: Generating Embedding...');
        const embeddingResult = await embeddingModel.embedContent(message);
        const embedding = embeddingResult.embedding.values;

        // 2. Search Cache
        const { data: similarQuestions, error: searchError } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: SIMILARITY_THRESHOLD,
            match_count: 1
        });

        if (searchError) {
            console.error('Supabase Search Error:', searchError);
        }

        if (similarQuestions && similarQuestions.length > 0) {
            const match = similarQuestions[0];
            const now = new Date();
            const createdAt = new Date(match.created_at);
            const diffTime = Math.abs(now - createdAt);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 30) {
                console.log('Cache Hit');
                // Apply same link format corrections to cached data
                let cachedAnswer = match.answer;
                // Try to parse if JSON, otherwise use raw
                try {
                    const parsed = JSON.parse(cachedAnswer);
                    cachedAnswer = parsed.answer || cachedAnswer;
                } catch (e) {
                    // Not JSON, use as is
                }
                // Fix link formats in cached response
                cachedAnswer = cachedAnswer.replace(/tolzy\.com/gi, 'www.tolzy.me');
                cachedAnswer = cachedAnswer.replace(/https:\/\/tolzy\.me/gi, 'https://www.tolzy.me');
                cachedAnswer = cachedAnswer.replace(/\/tool\//g, 'https://www.tolzy.me/tools/');

                return res.json({
                    answer: cachedAnswer,
                    source: 'cache'
                });
            }
        }

        // 3. Cache Miss - RAG Generation
        console.log('Cache Miss, fetching context...');
        console.log('Search enabled:', enableSearch);

        // Fetch Tools from Firestore Helper
        const allTools = await getAllTools();

        // Build Context String
        const toolsContext = allTools.map(t =>
            `- Tool: ${t.name} (ID: ${t.id})
  Description: ${t.description}
  Category: ${t.category}
  Link: https://www.tolzy.me/tools/${t.id}`
        ).join('\n\n');

        // Get random greeting variations for more natural responses
        const randomNumber = Math.floor(Math.random() * 1000);

        // Build search context if search is enabled
        const searchContext = enableSearch ? `
# 🌐 وضع البحث المباشر (مُفعّل):
- أنت الآن في وضع البحث المباشر
- استخدم معلوماتك المحدثة عن الأدوات
- لو السؤال عن أداة جديدة مش في القائمة، اعتمد على معلوماتك العامة
- اذكر إن المعلومات من البحث المباشر
- قارن مع الأدوات اللي عندنا في تولزي لو ممكن
` : '';


        const systemPrompt = `
# 🤖 هويتك:
أنت "تولزي كوبايلوت" - المساعد الذكي المتخصص في أدوات الذكاء الاصطناعي. بتتكلم بالعامية المصرية الطبيعية والودودة.

# 📝 قواعد الأسلوب:
- استخدم العامية المصرية الطبيعية (ممنوع: "يمكنك"، "لدينا"، "أنصحك")
- استخدم تعبيرات ودية: "يا صاحبي"، "يا معلم"، "يا باشا"
- ابدأ بـ: "تمام"، "أيوه"، "طبعاً"، "مظبوط"، "خلاص"
- رقم عشوائي للتنويع: ${randomNumber}

# 🎯 قواعد الإجابة النموذجية (مهم جداً):
1. **التنظيم**: رتب إجابتك بشكل واضح باستخدام:
   - 🔹 أو ✅ للنقاط الرئيسية
   - أرقام للخطوات (1. 2. 3.)
   - عناوين فرعية لو الإجابة طويلة

2. **الأدوات**: لما تذكر أداة لازم تشمل:
   - ✅ **اسم الأداة**: وصف مختصر للأداة
   - 🔗 الرابط: [اسم الأداة](https://www.tolzy.me/tools/{id})  <-- هام جداً هذا التنسيق
   - 💡 أهم ميزة أو استخدام

3. **المقارنات**: لو بتقارن بين أدوات:
   | الأداة | المميزات | العيوب | السعر |
   |--------|----------|--------|-------|

4. **الاختصار**: خليك مختصر ومفيد - مفيش كلام زيادة

# 🔍 لو خاصية البحث مفعلة:
- اعتمد على نتائج البحث الحية
- اذكر المصادر لو متوفرة
- قارن المعلومات مع الأدوات اللي عندنا

# 📋 تنسيق الرد (JSON):
{
  "answer": "إجابتك المنظمة هنا مع الروابط والتنسيق",
  "tool_ids": ["id1", "id2"],
  "needs_clarification": false
}

# 🎨 أمثلة للإجابات النموذجية:

**مثال 1 - ترشيح أداة:**
"تمام يا صاحبي! لو بتدور على أداة للكتابة بالذكاء الاصطناعي، عندي ليك كذا اختيار:

✅ **ChatGPT** - أقوى أداة للمحادثة والكتابة
🔗 [ChatGPT](https://www.tolzy.me/tools/xyz123)
💡 ممتاز للمقالات والأبحاث

✅ **Jasper AI** - متخصصة في المحتوى التسويقي
🔗 [Jasper AI](https://www.tolzy.me/tools/abc456)
💡 قوالب جاهزة للسوشيال ميديا"

**مثال 2 - شرح أداة:**
"أيوه يا باشا! خليني أشرحلك الأداة دي:

🔹 **Adobe Firefly** - أداة لتوليد الصور بالذكاء الاصطناعي

**المميزات:**
1. صور عالية الجودة
2. تكامل مع منتجات Adobe
3. آمنة للاستخدام التجاري

**العيوب:**
- محتاجة اشتراك Adobe
- أبطأ من المنافسين

🔗 [Adobe Firefly](https://www.tolzy.me/tools/def789)"

# 📚 قائمة الأدوات المتاحة:
${toolsContext}

# ⚠️ ملاحظات:
- لو مفيش أداة مناسبة، قول "هرجع لمحمود يضيفها"
- الأدوات العربية لها أولوية
- دايماً استخدم رابط www.tolzy.me/tools/{id}

${searchContext}
`;

        const chat = model.startChat({
            generationConfig: {
                responseMimeType: "application/json",
            },
            tools: enableSearch ? [{ googleSearch: {} }] : [],
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: JSON.stringify({ answer: "فهمت. سأقوم بالرد بتنسيق JSON.", tool_ids: [] }) }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        // Parse JSON Response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", text);
            parsedResponse = { answer: text, tool_ids: [] }; // Fallback
        }

        // SAFETY NET: Force correct format for any AI hallucinations
        if (parsedResponse.answer) {
            // Replace tolzy.com with www.tolzy.me
            parsedResponse.answer = parsedResponse.answer.replace(/tolzy\.com/gi, 'www.tolzy.me');
            // Ensure https://tolzy.me becomes https://www.tolzy.me
            parsedResponse.answer = parsedResponse.answer.replace(/https:\/\/tolzy\.me/gi, 'https://www.tolzy.me');
            // Replace /tool/ with full URL
            parsedResponse.answer = parsedResponse.answer.replace(/\/tool\//g, 'https://www.tolzy.me/tools/');
            // Ensure no double slashes (https://www.tolzy.me//tools/)
            parsedResponse.answer = parsedResponse.answer.replace(/tolzy\.me\/\/tools\//g, 'tolzy.me/tools/');
            // Force correct format for markdown links if they use just the ID
            parsedResponse.answer = parsedResponse.answer.replace(/\]\(([a-zA-Z0-9-]+)\)/g, '](https://www.tolzy.me/tools/$1)');
        }

        // Hydrate Tools
        const recommendedTools = allTools.filter(t => parsedResponse.tool_ids?.includes(t.id));

        // 4. Cache Result (Store stringified JSON for simplicity in existing schema)
        await supabase
            .from('tolzy_cache')
            .insert({
                question: message,
                answer: text, // Store raw JSON
                embedding: embedding
            });

        return res.json({
            answer: parsedResponse.answer,
            tools: recommendedTools, // Full objects with images
            source: 'gemini-rag'
        });

    } catch (error) {
        console.error('CRITICAL COPILOT ERROR:', error);
        console.error('Error Stack:', error.stack);
        if (error.response) {
            console.error('Error Response:', error.response);
        }
        if (error.status === 429) {
            return res.status(429).json({ error: 'Too Many Requests' });
        }
        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
});

// ==================== CHAT HISTORY ENDPOINTS ====================

// Get all conversations for a user
router.get('/conversations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        res.json({ conversations: data || [] });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Save/Update a conversation
router.post('/conversations', async (req, res) => {
    try {
        const { id, userId, title, messages } = req.body;

        if (!userId || !messages) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const conversationData = {
            user_id: userId,
            title: title || messages[0]?.content?.substring(0, 50) + '...' || 'محادثة جديدة',
            messages: JSON.stringify(messages),
            updated_at: new Date().toISOString()
        };

        let result;

        if (id) {
            // Update existing conversation
            const { data, error } = await supabase
                .from('conversations')
                .update(conversationData)
                .eq('id', id)
                .select();

            if (error) throw error;
            result = data[0];
        } else {
            // Create new conversation
            conversationData.created_at = new Date().toISOString();
            const { data, error } = await supabase
                .from('conversations')
                .insert(conversationData)
                .select();

            if (error) throw error;
            result = data[0];
        }

        res.json({ conversation: result });
    } catch (error) {
        console.error('Error saving conversation:', error);
        res.status(500).json({ error: 'Failed to save conversation' });
    }
});

// Delete a conversation
router.delete('/conversations/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

// ==================== SHARING ENDPOINTS REMOVED ====================

export default router;
