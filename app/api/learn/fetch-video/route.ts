import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { YoutubeTranscript } from 'youtube-transcript';
import { google } from 'googleapis';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';
import { adminDb } from '@/src/config/firebase-admin';

// Enable CORS
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders() });
}

// Extract YouTube Video ID
function extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Decode HTML Entities from transcript texts
function decodeHTMLEntities(str: string): string {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

// Parse ISO 8601 Duration (e.g. PT1H35M12S -> 01:35:12)
function parseISO8601Duration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "00:00";
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Intelligent temporal chunking algorithm (3-5 minutes per chunk = 180 to 300 seconds)
interface TranscriptSegment {
    text: string;
    duration: number;
    offset: number;
}

interface TranscriptChunk {
    chunk_index: number;
    text: string;
    start_time: number;
    duration: number;
}

function chunkTranscript(segments: TranscriptSegment[], targetDurationSeconds = 240): TranscriptChunk[] {
    const chunks: TranscriptChunk[] = [];
    let currentChunkTexts: string[] = [];
    let currentChunkStart = 0;
    let currentChunkDuration = 0;
    let chunkIndex = 0;

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        // Record start time if beginning a new chunk
        if (currentChunkTexts.length === 0) {
            currentChunkStart = segment.offset;
        }

        const cleanedText = decodeHTMLEntities(segment.text).trim();
        if (cleanedText) {
            currentChunkTexts.push(cleanedText);
        }
        
        // segment.duration is sometimes returned in milliseconds or seconds.
        // youtube-transcript library standardizes durations and offsets to seconds, but let's be safe.
        // If segment.duration is unusually large (>1000), it's likely milliseconds; convert it.
        const segmentDuration = segment.duration > 1000 ? segment.duration / 1000 : segment.duration;
        currentChunkDuration += segmentDuration;

        const isLastSegment = i === segments.length - 1;
        const reachedTarget = currentChunkDuration >= targetDurationSeconds;

        if (reachedTarget || isLastSegment) {
            if (currentChunkTexts.length > 0) {
                chunks.push({
                    chunk_index: chunkIndex++,
                    text: currentChunkTexts.join(' '),
                    start_time: currentChunkStart > 1000 ? currentChunkStart / 1000 : currentChunkStart,
                    duration: currentChunkDuration
                });
            }
            // Reset for next chunk
            currentChunkTexts = [];
            currentChunkDuration = 0;
        }
    }

    return chunks;
}

// AI Topic Enrichment using Groq Llama 3.3
async function generateTopicsWithAI(title: string, description: string): Promise<string[]> {
    if (!process.env.GROQ_API_KEY) {
        return ["برمجة 💻", "تطوير ⚙️", "تعليم 🧠"];
    }

    try {
        const prompt = `You are a high-quality educational content analyzer.
Analyze this YouTube video metadata and suggest exactly 4 technical topics or categories covered in the video, in Arabic with a relevant emoji.

Title: ${title}
Description: ${description}

Output ONLY a valid JSON array of strings, like this:
["برمجة الويب 🌐", "تطوير التطبيقات 📱", "قواعد البيانات 🗄️", "هندسة البرمجيات 🏗️"]`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                response_format: { type: "json_object" }
            }),
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            return ["برمجة 💻", "تطوير ⚙️", "تعليم 🧠"];
        }

        const data = await response.ok ? await response.json() : null;
        if (!data) return ["برمجة 💻", "تطوير ⚙️", "تعليم 🧠"];
        
        const parsed = JSON.parse(data.choices[0].message.content);
        if (Array.isArray(parsed)) return parsed.slice(0, 4);
        if (parsed.topics && Array.isArray(parsed.topics)) return parsed.topics.slice(0, 4);
        return ["برمجة 💻", "تطوير ⚙️", "تعليم 🧠"];
    } catch (e) {
        console.error('Topics AI Enrichment Error:', e);
        return ["برمجة 💻", "تطوير ⚙️", "تعليم 🧠"];
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url, userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً للتحقق من الصلاحية.' }, { status: 401, headers: corsHeaders() });
        }

        // --- Plan check: Ask YouTube Learn is Pro/Ultra only ---
        if (adminDb) {
            try {
                const userRef = adminDb.collection('users').doc(userId);
                const userSnap = await userRef.get();
                const userData = userSnap.data();
                const userPlan = String(userData?.plan || 'free').toLowerCase();
                const isPro = userPlan.includes('pro') || userPlan.includes('ultra');

                if (!isPro) {
                    return NextResponse.json({
                        error: 'عذراً، ميزة Ask YouTube Learn متوفرة فقط لمشتركي باقة Pro. يرجى ترقية حسابك للاستفادة منها.'
                    }, { status: 403, headers: corsHeaders() });
                }
            } catch (e) {
                console.error('YouTube Learn plan check error:', e);
            }
        }

        if (!url) {
            return NextResponse.json({ error: 'الرجاء إدخال رابط يوتيوب صحيح' }, { status: 400, headers: corsHeaders() });
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return NextResponse.json({ error: 'معرف الفيديو غير صالح، يرجى التحقق من الرابط' }, { status: 400, headers: corsHeaders() });
        }

        // 1. Database Check (Deduplication)
        // Check if the video has already been fetched and chunked
        const { data: existingCourse } = await supabaseAdmin
            .from('youtube_courses')
            .select('*')
            .eq('video_id', videoId)
            .maybeSingle();

        if (existingCourse) {
            // Fetch associated chunks
            const { data: existingChunks } = await supabaseAdmin
                .from('youtube_transcript_chunks')
                .select('*')
                .eq('video_id', videoId)
                .order('chunk_index', { ascending: true });

            return NextResponse.json({
                course: existingCourse,
                chunks: existingChunks || [],
                cached: true
            }, { headers: corsHeaders() });
        }

        // 2. Fetch Transcript
        let transcriptSegments: TranscriptSegment[] = [];
        try {
            transcriptSegments = await YoutubeTranscript.fetchTranscript(videoId);
        } catch (transcriptError: any) {
            console.error('Transcript fetch failed for video:', videoId, transcriptError);
            
            const errMsg = transcriptError?.message || '';
            let userFriendlyError = 'لم نتمكن من جلب النص التلقائي لهذا الفيديو. يرجى التأكد من أن الفيديو يحتوي على ترجمة/نص تلقائي (Subtitles/Transcript) مفعل.';
            
            if (errMsg.includes('unavailable') || errMsg.includes('no longer available')) {
                userFriendlyError = 'عذراً، هذا الفيديو غير متوفر (قد يكون خاصاً، غير مدرج، أو تم حذفه).';
            } else if (errMsg.includes('disabled') || errMsg.includes('Disabled')) {
                userFriendlyError = 'الترجمة أو النص التلقائي غير مفعل لهذا الفيديو من قبل صاحب القناة.';
            } else if (errMsg.includes('too many requests') || errMsg.includes('captcha')) {
                userFriendlyError = 'تم حظر الطلب مؤقتاً من قِبل يوتيوب بسبب كثرة الطلبات. يرجى إعادة المحاولة لاحقاً.';
            } else if (errMsg.includes('No transcripts are available')) {
                userFriendlyError = 'لا يوجد نص تلقائي أو ترجمة متوفرة لهذا الفيديو على يوتيوب.';
            }

            return NextResponse.json({ 
                error: userFriendlyError
            }, { status: 400, headers: corsHeaders() });
        }


        if (!transcriptSegments || transcriptSegments.length === 0) {
            return NextResponse.json({ 
                error: 'الترجمة التلقائية لهذا الفيديو فارغة أو غير متوفرة.' 
            }, { status: 400, headers: corsHeaders() });
        }

        // 3. Metadata Gathering (Scraping + YouTube API enrichments)
        let title = "فيديو تعليمي";
        let description = "";
        let channel = "قناة يوتيوب";
        let durationStr = "00:00";
        let thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`; // Fallback to max resolution

        // Scrape page first as reliable zero-key fallback
        try {
            const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' },
                timeout: 8000
            });
            const html = response.data;
            const $ = cheerio.load(html);

            title = $('meta[property="og:title"]').attr('content') || $('title').text() || title;
            description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || description;
            channel = $('link[itemprop="name"]').attr('content') || $('span[itemprop="author"] link[itemprop="name"]').attr('content') || channel;
            
            const scrapedDuration = $('meta[itemprop="duration"]').attr('content');
            if (scrapedDuration) {
                durationStr = parseISO8601Duration(scrapedDuration);
            }
        } catch (scrapeErr) {
            console.warn('Cheerio Scraping failed, will rely on API if available:', scrapeErr);
        }

        // Enrich using YouTube API v3 if key exists
        const youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY || '';
        if (youtubeApiKey) {
            try {
                const youtube = google.youtube({
                    version: 'v3',
                    auth: youtubeApiKey
                });
                const videoRes = await youtube.videos.list({
                    part: ['snippet', 'contentDetails'],
                    id: [videoId]
                });
                if (videoRes.data.items && videoRes.data.items.length > 0) {
                    const snippet = videoRes.data.items[0].snippet;
                    const contentDetails = videoRes.data.items[0].contentDetails;
                    
                    title = snippet?.title || title;
                    description = snippet?.description || description;
                    channel = snippet?.channelTitle || channel;
                    thumbnail = snippet?.thumbnails?.maxres?.url || snippet?.thumbnails?.high?.url || thumbnail;

                    if (contentDetails?.duration) {
                        durationStr = parseISO8601Duration(contentDetails.duration);
                    }
                }
            } catch (apiError) {
                console.warn('YouTube API call failed, falling back to scraped details:', apiError);
            }
        }

        // 4. AI Topic Enrichment
        const topics = await generateTopicsWithAI(title, description);

        // 5. Apply Smart Chunking Algorithm
        const chunks = chunkTranscript(transcriptSegments);

        // 6. Save Course and Chunks to Supabase
        const { data: newCourse, error: insertCourseError } = await supabaseAdmin
            .from('youtube_courses')
            .upsert(
                {
                    video_id: videoId,
                    title: title.trim(),
                    channel: channel.trim(),
                    duration: durationStr,
                    description: description.trim(),
                    topics: topics
                },
                { onConflict: 'video_id' }
            )
            .select()
            .single();

        if (insertCourseError || !newCourse) {
            console.error('Failed to insert course metadata to Supabase:', insertCourseError);
            throw new Error('فشل حفظ معلومات الفيديو في قاعدة البيانات');
        }

        // Delete old chunks if we are re-indexing (to avoid duplicate chunks)
        await supabaseAdmin
            .from('youtube_transcript_chunks')
            .delete()
            .eq('video_id', videoId);

        // Batch insert chunks
        const chunksToInsert = chunks.map(chunk => ({
            course_id: newCourse.id,
            video_id: videoId,
            chunk_index: chunk.chunk_index,
            text: chunk.text,
            start_time: chunk.start_time,
            duration: chunk.duration
        }));

        const { error: insertChunksError } = await supabaseAdmin
            .from('youtube_transcript_chunks')
            .insert(chunksToInsert);

        if (insertChunksError) {
            console.error('Failed to insert chunks to Supabase:', insertChunksError);
            throw new Error('فشل حفظ تفريغ الفيديو وتجزئته في قاعدة البيانات');
        }

        return NextResponse.json({
            course: newCourse,
            chunks: chunksToInsert,
            cached: false
        }, { headers: corsHeaders() });

    } catch (error: any) {
        console.error('Fetch Video API Global Error:', error.message);
        return NextResponse.json({ error: error.message || 'حدث خطأ غير متوقع أثناء معالجة الفيديو' }, { status: 500, headers: corsHeaders() });
    }
}
