/**
 * =====================================================================
 * 🤖 Tolzy Course AI Enrichment Script (OpenRouter Edition)
 * =====================================================================
 * Fetches all courses from Supabase WITHOUT skills yet,
 * sends them to OpenRouter (DeepSeek V3.2) to generate:
 *   1. A unique, attractive Arabic description for each course
 *   2. At least 4 specific skills the learner will gain
 *
 * Skills are saved to: metadata.skills & metadata.what_you_will_learn
 *
 * Usage: node scripts/enrich-courses.mjs
 * Options:
 *   --all       Process ALL courses (including already-enriched ones)
 *   --limit=N   Process only N courses (default: 50)
 * =====================================================================
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ── CLI options ─────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const processAll = args.includes('--all');
const limitArg = args.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1]) : 50;

// ── Setup ──────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}
if (!OPENROUTER_API_KEY) {
    console.error('❌ Missing OPENROUTER_API_KEY in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BATCH_SIZE = 5;          // Courses per API call
const RATE_LIMIT_DELAY = 4000; // ms between batches

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── OpenRouter API Call ─────────────────────────────────────────────────
async function callOpenRouter(prompt) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://www.tolzy.me/learn',
            'X-Title': 'Tolzy Academy Enrichment'
        },
        body: JSON.stringify({
            model: 'deepseek/deepseek-v3.2',
            messages: [
                {
                    role: 'system',
                    content: 'أنت خبير تعليمي متخصص في تحليل الكورسات التقنية. أجب دائماً بـ JSON فقط.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API Error ${response.status}: ${errText.slice(0, 300)}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || null;
    
    // Robust JSON extraction
    if (content && content.includes('{')) {
        content = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
    }
    return content;
}

// ── AI Enrichment Function ─────────────────────────────────────────────
async function enrichCoursesBatch(courses) {
    const courseList = courses.map((c, i) =>
        `[${i + 1}] ID: "${c.id}" | العنوان: "${c.title}" | الفئة: "${c.category}" | الوصف الحالي: "${(c.description || '').slice(0, 100)}"`
    ).join('\n');

    const prompt = `لديك قائمة بالكورسات التالية:
${courseList}

لكل كورس، قم بإنشاء:
1. **وصف جذاب وملهم** باللغة العربية (3-4 جمل، يحفز على التعلم ويوضح القيمة الحقيقية للكورس)
2. **4-5 مهارات محددة وعملية** يكتسبها المتعلم بعد إتمام الكورس (مهارات تقنية وعملية حقيقية)

قواعد مهمة:
- الوصف يجب أن يكون ملهماً ومقنعاً
- المهارات يجب أن تكون محددة جداً وليست عامة
- مثال مهارة جيد: "بناء REST API باستخدام Node.js وExpress"
- مثال مهارة سيئ: "تعلم البرمجة"
- كل كورس يجب أن يكون له مهارات فريدة تناسبه تماماً

أجب بتنسيق JSON فقط:
{
  "courses": [
    {
      "index": 1,
      "description": "نص الوصف الجذاب هنا",
      "skills": ["مهارة محددة 1", "مهارة محددة 2", "مهارة محددة 3", "مهارة محددة 4"]
    }
  ]
}`;

    try {
        const content = await callOpenRouter(prompt);
        if (!content) throw new Error('Empty response');
        
        const parsed = JSON.parse(content);
        return parsed.courses || [];
    } catch (err) {
        console.error('   ❌ OpenRouter Error:', err.message);
        return [];
    }
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
    console.log('==========================================');
    console.log('  🤖 Tolzy Course Skills Enrichment');
    console.log('  🔥 Powered by OpenRouter (DeepSeek V3.2)');
    console.log('==========================================\n');
    console.log(`⚙️  Options: processAll=${processAll} | limit=${LIMIT}\n`);

    // 1. Fetch courses from Supabase
    console.log('📥 Fetching courses from Supabase...');
    
    let query = supabase
        .from('courses')
        .select('id, title, description, category, metadata')
        .order('created_at', { ascending: true })
        .limit(processAll ? 10000 : LIMIT * 3); // fetch more to filter

    const { data: allCourses, error } = await query;

    if (error) {
        console.error('❌ Failed to fetch courses:', error.message);
        process.exit(1);
    }

    if (!allCourses || allCourses.length === 0) {
        console.log('⚠️  No courses found in the database.');
        process.exit(0);
    }

    // 2. Filter out already-enriched courses (unless --all flag)
    let courses;
    if (processAll) {
        courses = allCourses.slice(0, LIMIT);
        console.log(`✅ Processing ALL ${courses.length} courses (--all flag set).\n`);
    } else {
        const unenriched = allCourses.filter(c => {
            const skills = c.metadata?.skills || c.metadata?.what_you_will_learn;
            return !skills || skills.length === 0;
        });
        courses = unenriched.slice(0, LIMIT);
        console.log(`✅ Found ${allCourses.length} total courses.`);
        console.log(`🎯 Targeting ${courses.length} courses WITHOUT skills yet.\n`);
    }

    if (courses.length === 0) {
        console.log('🎉 All courses already have skills! Use --all to re-enrich.');
        process.exit(0);
    }

    // 3. Process courses in batches
    let successCount = 0;
    let failCount = 0;
    const totalBatches = Math.ceil(courses.length / BATCH_SIZE);

    for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
        const batch = courses.slice(batchIdx * BATCH_SIZE, (batchIdx + 1) * BATCH_SIZE);
        const batchNumber = batchIdx + 1;

        console.log(`\n━━━ Batch ${batchNumber}/${totalBatches} (${batch.length} courses) ━━━`);
        batch.forEach((c, i) => console.log(`  ${i + 1}. ${c.title}`));

        const enrichedData = await enrichCoursesBatch(batch);

        if (enrichedData.length === 0) {
            console.warn(`   ⚠️  No data returned for batch ${batchNumber}, skipping.`);
            failCount += batch.length;
            continue;
        }

        // 4. Update each course in Supabase
        for (const enriched of enrichedData) {
            const courseIdx = (enriched.index || 1) - 1;
            if (courseIdx < 0 || courseIdx >= batch.length) continue;

            const course = batch[courseIdx];
            const newDescription = enriched.description?.trim();
            const newSkills = (enriched.skills || []).map(s => s?.trim()).filter(Boolean);

            if (!newDescription && newSkills.length === 0) {
                console.warn(`   ⚠️  Skipped (no data): ${course.title}`);
                failCount++;
                continue;
            }

            // Merge with existing metadata
            const existingMetadata = course.metadata || {};
            const updatedMetadata = {
                ...existingMetadata,
                skills: newSkills,
                what_you_will_learn: newSkills
            };

            const updatePayload = {
                metadata: updatedMetadata,
                updated_at: new Date().toISOString()
            };
            if (newDescription && (!course.description || course.description.length < 50)) {
                updatePayload.description = newDescription;
            }

            const { error: updateError } = await supabase
                .from('courses')
                .update(updatePayload)
                .eq('id', course.id);

            if (updateError) {
                console.error(`   ❌ Failed: "${course.title}" → ${updateError.message}`);
                failCount++;
            } else {
                console.log(`   ✅ "${course.title.slice(0, 50)}" → ${newSkills.length} skills`);
                newSkills.forEach(s => console.log(`      • ${s}`));
                successCount++;
            }
        }

        // Rate limiting between batches
        if (batchIdx < totalBatches - 1) {
            process.stdout.write(`\n⏳ Waiting ${RATE_LIMIT_DELAY / 1000}s before next batch...`);
            await sleep(RATE_LIMIT_DELAY);
            process.stdout.write(' ✓\n');
        }
    }

    // 5. Print Summary
    console.log('\n==========================================');
    console.log('  ✨ Enrichment Complete!');
    console.log('==========================================');
    console.log(`✅ Successfully enriched: ${successCount}/${courses.length} courses`);
    if (failCount > 0) {
        console.log(`❌ Failed/Skipped:       ${failCount} courses`);
    }
    console.log('\n💡 Run again to process more unenriched courses.');
    console.log('💡 Use --all to re-enrich all courses.');
    console.log('💡 Use --limit=100 to process more at once.');
}

main().catch(err => {
    console.error('\n🚨 Critical Error:', err);
    process.exit(1);
});
