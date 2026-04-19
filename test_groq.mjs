import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function run() {
    const courseBatch = [
        {
            id: 'course-1',
            name: 'Introduction to Python',
            description: 'Learn Python programming language from scratch.'
        }
    ];

    const systemPrompt = `You are an expert educational translator and content analyzer.`;
    const userPrompt = `
        I am passing you a JSON array of ${courseBatch.length} online courses.
        Your task is to returning EXACTLY the same length JSON array, with every object translated to highly professional Arabic.
        
        For each course, return a JSON object containing:
        - title: Beautifully translated Arabic title
        - description: Engaging Arabic description
        - category: Auto-categorize it into ONE of these Arabic categories: ['برمجة الويب', 'الذكاء الاصطناعي', 'الأمن السيبراني', 'علم البيانات', 'تصميم واجهات', 'عام']
        - metadata: A JSON object where you must include the keys "duration" (e.g. "4 أسابيع"), "level" (["مبتدئ", "متوسط", "متقدم"]), "what_you_will_learn" (Array of 3-4 strings), and ANY other interesting keys you find in the course description (examples: "prerequisites", "language"). Map them to their Arabic string values or boolean values.
        
        Input Data:
        ${JSON.stringify(courseBatch.map(c => ({ id: c.id, name: c.name, description: c.description })), null, 2)}
        
        OUTPUT FORMAT: Return ONLY valid JSON array with no markdown blocks (\`\`\`json) and no conversational text. example: [{"id": "...", "title": "...", "description": "...", "category": "...", "metadata": {"duration": "...", "level": "...", "what_you_will_learn": ["...", "..."], "key": "value"}}]
        `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.1, // Low temp for strictly formatted JSON
            stream: false
        })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

run();
