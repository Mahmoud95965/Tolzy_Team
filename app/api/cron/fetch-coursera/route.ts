import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'placeholder-key'; 
const supabase = createClient(supabaseUrl, supabaseKey);

import { getAzureAiClient, AZURE_AI_MODEL } from '@/src/config/azure-ai';

// ==========================================
// COURSE ENRICHMENT WITH AZURE AI (axiom-core)
// ==========================================
async function enrichCourseWithAI(courseBatch: any[]) {
    try {
        const openai = getAzureAiClient();
        const systemPrompt = `You are a Senior Technical Curriculum Strategist for Tolzy Academy. 
Your role is to translate and enrich international online course metadata into high-quality, professional Arabic.
Output ONLY a strictly valid JSON object with a "courses" array.`;
        const userPrompt = `
        Translate and enhance this batch of ${courseBatch.length} online courses into engaging, modern Arabic.
        
        For each course, provide:
        - id: exact original id
        - title: clear, attractive Arabic title preserving core tech keywords (e.g. Docker, Python, Next.js)
        - description: inspiring and comprehensive Arabic summary (2-3 paragraphs)
        - category: strictly one of ['برمجة الويب', 'الذكاء الاصطناعي', 'الأمن السيبراني', 'علم البيانات', 'تصميم واجهات', 'عام']
        - metadata: { level: 'مبتدئ' | 'متوسط' | 'متقدم', duration: 'مثال: 4 أسابيع', what_you_will_learn: ['مهارة 1', 'مهارة 2', 'مهارة 3', 'مهارة 4'] }
        
        Return JSON structure: {"courses": [ { "id": "...", "title": "...", "description": "...", "category": "...", "metadata": {...} } ]}
        
        Input Data:
        ${JSON.stringify(courseBatch.map(c => ({ id: c.id, name: c.name, description: c.description })), null, 2)}
        `;

        const response = await openai.chat.completions.create({
            model: AZURE_AI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.1,
            max_tokens: 4000,
            response_format: { type: "json_object" }
        });

        let aiText = response.choices[0]?.message?.content?.trim() || '{}';
        
        // Robust JSON extraction for object
        if (aiText.includes('{')) {
            aiText = aiText.substring(aiText.indexOf('{'), aiText.lastIndexOf('}') + 1);
        }

        const parsed = JSON.parse(aiText);
        const aiEnrichedData = Array.isArray(parsed.courses) ? parsed.courses : [];

        return courseBatch.map(course => {
            const enriched = aiEnrichedData.find((ai: any) => ai.id === course.id);
            if (!enriched) return null;

            return {
                external_id: `coursera-${course.id}`,
                title: enriched.title,
                description: enriched.description,
                url: `https://www.coursera.org/learn/${course.slug}`,
                provider: 'Coursera',
                category: enriched.category,
                thumbnail: course.photoUrl || null,
                metadata: enriched.metadata || {},
                updated_at: new Date().toISOString()
            };
        }).filter(Boolean);

    } catch (error) {
        console.error('Error in AI enrichment:', error);
        throw error;
    }
}


// ==========================================
// NEXT.JS API ROUTE & SUPABASE UPSERT
// ==========================================
export const maxDuration = 60; 

export async function GET(request: Request) {
    if (process.env.CRON_SECRET) {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        const { searchParams } = new URL(request.url);
        let manualStart = parseInt(searchParams.get('start') || '0');
        
        console.log(`Starting Coursera sync from offset: ${manualStart}`);
        
        const MAX_COURSES_PER_RUN = 10; 
        const BATCH_SIZE = 5; // Reduced from 10 to avoid truncation
        const PAGE_SIZE = 100;
        const MAX_PAGES_TO_SCAN = 5; 

        let newCoursesData: any[] = [];
        let currentStart = manualStart;
        let courseraTotalRetrieved = 0;

        for (let pageIdx = 0; pageIdx < MAX_PAGES_TO_SCAN; pageIdx++) {
            console.log(`Fetching Coursera page ${pageIdx + 1} (start=${currentStart})...`);
            const apiUrl = `https://api.coursera.org/api/courses.v1?fields=description,photoUrl,primaryLanguages&start=${currentStart}&limit=${PAGE_SIZE}`;
            
            const response = await fetch(apiUrl, { next: { revalidate: 0 } });
            if (!response.ok) break;

            const data = await response.json();
            const elements = data.elements || [];
            if (elements.length === 0) break;

            courseraTotalRetrieved += elements.length;

            const elementIds = elements.map((c: any) => `coursera-${c.id}`);
            const { data: existingIdsRecord } = await supabase
                .from('courses')
                .select('external_id')
                .in('external_id', elementIds);

            const existingIdsSet = new Set(existingIdsRecord?.map(r => r.external_id));
            const newOnThisPage = elements.filter((course: any) => !existingIdsSet.has(`coursera-${course.id}`));
            
            newCoursesData = [...newCoursesData, ...newOnThisPage];
            
            console.log(`Page ${pageIdx + 1} yielded ${newOnThisPage.length} new courses.`);

            if (newCoursesData.length >= MAX_COURSES_PER_RUN) {
                console.log(`Found enough new courses (${newCoursesData.length} total). Stopping scan.`);
                break;
            }

            currentStart += PAGE_SIZE;
        }

        console.log(`Scan complete. Total retrieved: ${courseraTotalRetrieved}. New identified: ${newCoursesData.length}`);

        if (newCoursesData.length === 0) {
           return NextResponse.json({ 
                success: true, 
                message: 'No new courses found in the scanned pages.',
                processedCount: 0 
            }, { status: 200 }); 
        }

        const coursesToProcess = newCoursesData.slice(0, MAX_COURSES_PER_RUN);
        console.log(`Will process ${coursesToProcess.length} courses in this run (in batches of ${BATCH_SIZE}).`);

        let allProcessedCourses: any[] = [];
        for (let i = 0; i < coursesToProcess.length; i += BATCH_SIZE) {
             const batch = coursesToProcess.slice(i, i + BATCH_SIZE);
             console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(coursesToProcess.length / BATCH_SIZE)} using OpenRouter AI...`);
             
             try {
                const enrichedBatch = await enrichCourseWithAI(batch);
                allProcessedCourses = [...allProcessedCourses, ...enrichedBatch];
             } catch (error: any) {
                console.error(`AI API Error on batch:`, error.message);
                console.log('Stopping further API calls for this run. Saving what was successful...');
                break; 
             }
        }

        if (allProcessedCourses.length > 0) {
            console.log(`Upserting ${allProcessedCourses.length} translated courses to Supabase...`);
            const { error: upsertError } = await supabase
                .from('courses')
                .upsert(allProcessedCourses, { 
                    onConflict: 'external_id',
                })
                .select();

            if (upsertError) {
                throw new Error(`Failed to upsert data: ${upsertError.message}`);
            }
        } else {
            throw new Error('Failed to process courses this run due to AI API limits or errors. Please wait and click Sync again.');
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully translated ${allProcessedCourses.length} courses. ${newCoursesData.length > 10 ? 'اضغط تحديث مرة أخرى لجلب المزيد.' : 'تم جلب جميع الكورسات.'}`,
            processedCount: allProcessedCourses.length
        }, { status: 200 });

    } catch (error: any) {
        console.error('CRON Job AI Enrichment Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Internal Server Error' 
        }, { status: 500 });
    }
}
