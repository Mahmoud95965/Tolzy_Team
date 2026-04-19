import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { adminDb } from '@/src/config/firebase-admin';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Helper to set CORS headers
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

async function enrichWithAI(title: string, description: string) {
    if (!GROQ_API_KEY) return { title, description, category: 'عام', level: 'متوسط', what_you_will_learn: [] };

    try {
        const prompt = `You are an expert technical translator. 
Analyze this course metadata and return a JSON object with:
- title: Professional Arabic title
- description: Detailed Arabic description
- category: One of ['برمجة الويب', 'الذكاء الاصطناعي', 'الأمن السيبراني', 'علم البيانات', 'تصميم واجهات', 'عام']
- level: One of ['مبتدئ', 'متوسط', 'متقدم']
- what_you_will_learn: Array of 3 key points in Arabic.

Input:
Title: ${title}
Description: ${description}

Output ONLY valid JSON.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (e) {
        console.error('AI Enrichment Error:', e);
        return { title, description, category: 'عام', level: 'متوسط', what_you_will_learn: [] };
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url, courseId } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders() });
        }

        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' },
            timeout: 8000
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // 1. Scraping
        const titleRaw = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        const descriptionRaw = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
        const image = $('meta[property="og:image"]').attr('content') || '';
        
        // 2. AI Enrichment (Groq)
        console.log('--- Enriching with Groq AI ---');
        const aiData = await enrichWithAI(titleRaw, descriptionRaw);

        // 3. Metadata Extraction (Scraping Fallbacks)
        let studentsCount = 0;
        const studentPatterns = [/([\d,.]+[kKmM]?)\s+students/i, /([\d,.]+[kKmM]?)\s+learners/i];
        for (const pattern of studentPatterns) {
            const match = $('body').text().match(pattern);
            if (match) {
                let numStr = match[1].toLowerCase().replace(/,/g, '');
                let multiplier = numStr.includes('k') ? 1000 : (numStr.includes('m') ? 1000000 : 1);
                studentsCount = Math.floor(parseFloat(numStr) * multiplier);
                break;
            }
        }

        const finalData = {
            title: aiData.title || titleRaw.trim(),
            description: aiData.description || descriptionRaw.trim(),
            category: aiData.category || 'عام',
            level: aiData.level || 'متوسط',
            what_you_will_learn: aiData.what_you_will_learn || [],
            thumbnail: image,
            studentsCount
        };

        // 4. Update Firestore if ID provided
        if (courseId && adminDb) {
            try {
                await adminDb.collection('courses').doc(courseId).update(finalData);
            } catch (e) {}
        }

        return NextResponse.json(finalData, { headers: corsHeaders() });

    } catch (error: any) {
        console.error('Fetch Course Error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch course data' }, { status: 500, headers: corsHeaders() });
    }
}
