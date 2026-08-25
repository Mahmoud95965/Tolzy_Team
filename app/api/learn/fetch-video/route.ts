import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { YoutubeTranscript } from 'youtube-transcript';
import { google } from 'googleapis';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';
import crypto from 'crypto';
import { checkAndConsumeAiQuota } from '@/src/lib/ai-quota';

export const maxDuration = 60;

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

function getProxyConfig() {
    const proxyUrl = process.env.YOUTUBE_PROXY_URL;
    if (!proxyUrl) return undefined;
    try {
        const parsed = new URL(proxyUrl);
        return {
            protocol: parsed.protocol.replace(':', ''),
            host: parsed.hostname,
            port: parseInt(parsed.port || (parsed.protocol === 'https:' ? '443' : '80')),
            auth: parsed.username ? {
                username: decodeURIComponent(parsed.username),
                password: decodeURIComponent(parsed.password)
            } : undefined
        };
    } catch (e) {
        console.error('Invalid YOUTUBE_PROXY_URL format:', e);
        return undefined;
    }
}

// Extract JSON object by variable name from HTML
function extractJsonFromHtml(html: string, varName: string): any {
    const idx = html.indexOf(varName);
    if (idx === -1) return null;
    const startIdx = html.indexOf('{', idx);
    if (startIdx === -1) return null;

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = startIdx; i < html.length; i++) {
        const char = html[i];
        if (escape) {
            escape = false;
            continue;
        }
        if (char === '\\') {
            escape = true;
            continue;
        }
        if (char === '"') {
            inString = !inString;
            continue;
        }
        if (!inString) {
            if (char === '{') depth++;
            else if (char === '}') {
                depth--;
                if (depth === 0) {
                    const jsonStr = html.substring(startIdx, i + 1);
                    try {
                        return JSON.parse(jsonStr);
                    } catch (err) {
                        return null;
                    }
                }
            }
        }
    }
    return null;
}

// Custom Fetch wrapper using Axios to support proxy routing
async function customProxyFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string'
        ? input
        : input instanceof URL
            ? input.toString()
            : input.url;

    const proxyConfig = getProxyConfig();
    if (!proxyConfig) {
        return fetch(input, init);
    }

    // Convert Headers object to plain object
    const headers = init?.headers || {};
    let reqHeaders: Record<string, string> = {};
    if (headers instanceof Headers) {
        headers.forEach((value, key) => {
            reqHeaders[key] = value;
        });
    } else if (typeof headers === 'object') {
        reqHeaders = { ...headers } as Record<string, string>;
    }

    try {
        const response = await axios({
            method: init?.method || 'GET',
            url: url,
            data: init?.body,
            headers: reqHeaders,
            proxy: proxyConfig,
            validateStatus: () => true,
            responseType: 'text',
            timeout: 10000
        });

        return {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            statusText: response.statusText,
            headers: new Headers(response.headers as any),
            text: async () => response.data,
            json: async () => typeof response.data === 'string' ? JSON.parse(response.data) : response.data
        } as unknown as Response;
    } catch (err: any) {
        console.error('Proxy fetch failed:', err.message);
        throw err;
    }
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

// Generate a unique 16-character alphanumeric hash for general web URLs
function generateUrlHash(url: string): string {
    return crypto.createHash('sha256').update(url).digest('hex').substring(0, 16);
}

// Split page text content into readable semantic blocks of up to 1200 chars
function chunkText(text: string, maxChunkLength = 1200): string[] {
    const paragraphs = text.split(/\n\n+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) continue;
        
        if (currentChunk.length + trimmed.length > maxChunkLength) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = trimmed;
        } else {
            currentChunk = currentChunk ? `${currentChunk}\n\n${trimmed}` : trimmed;
        }
    }
    
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    const finalChunks: string[] = [];
    for (const chunk of chunks) {
        if (chunk.length > maxChunkLength * 1.5) {
            const sentences = chunk.match(/[^.!?]+[.!?]+(\s|$)/g) || [chunk];
            let subChunk = '';
            for (const sentence of sentences) {
                if (subChunk.length + sentence.length > maxChunkLength) {
                    if (subChunk) finalChunks.push(subChunk.trim());
                    subChunk = sentence;
                } else {
                    subChunk = subChunk ? `${subChunk}${sentence}` : sentence;
                }
            }
            if (subChunk.trim()) finalChunks.push(subChunk.trim());
        } else {
            finalChunks.push(chunk);
        }
    }

    return finalChunks;
}

// Intelligent temporal chunking algorithm (3-5 minutes per chunk)
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

// Robust 3-Tier Multi-Strategy YouTube Transcript Fetcher
async function getFullYoutubeTranscript(videoId: string): Promise<TranscriptSegment[]> {
    const proxyConfig = getProxyConfig();

    // 1. المحاولة الأولى: جلب الترجمة العربية أو التلقائية (Arabic / Auto Arabic)
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: 'ar',
            fetch: customProxyFetch,
        });
        if (transcript && transcript.length > 0) {
            console.log(`[OmniLearn] Fetched Arabic transcript (${transcript.length} items) via YoutubeTranscript.`);
            return transcript;
        }
    } catch (e: any) {
        console.log('[OmniLearn] Arabic transcript direct fetch failed, trying default/auto fallback...', e?.message || e);
    }

    // 2. المحاولة الثانية: جلب أي لغة متاحة (Default fallback - en, auto, any language)
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
            fetch: customProxyFetch,
        });
        if (transcript && transcript.length > 0) {
            console.log(`[OmniLearn] Fetched default transcript (${transcript.length} items) via YoutubeTranscript.`);
            return transcript;
        }
    } catch (e: any) {
        console.log('[OmniLearn] Default transcript fetch failed, trying raw Innertube player scraping...', e?.message || e);
    }

    // 3. المحاولة الثالثة: سحب مسار الترجمة الخام من صفحة الفيديو مباشرة (Raw Innertube player caption extraction)
    try {
        const res = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept-Language': 'ar,en;q=0.9',
            },
            timeout: 10000,
            proxy: proxyConfig
        });

        const html = res.data;
        const playerResponse = extractJsonFromHtml(html, 'ytInitialPlayerResponse') || (() => {
            const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
            return match ? JSON.parse(match[1]) : null;
        })();

        if (playerResponse) {
            const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

            if (captionTracks && Array.isArray(captionTracks) && captionTracks.length > 0) {
                // تفضيل المسار العربي إن وجد، ثم الإنجليزي، ثم أول مسار متاح
                const targetTrack = captionTracks.find((t: any) => t.languageCode === 'ar' || t.vssId?.includes('.ar') || t.vssId?.includes('a.ar'))
                    || captionTracks.find((t: any) => t.languageCode === 'en' || t.vssId?.includes('.en'))
                    || captionTracks[0];

                if (targetTrack?.baseUrl) {
                    const transcriptXmlRes = await axios.get(targetTrack.baseUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                            'Accept-Language': 'ar,en;q=0.9',
                        },
                        timeout: 10000,
                        proxy: proxyConfig
                    });

                    const xmlData = transcriptXmlRes.data;
                    const $ = cheerio.load(xmlData, { xmlMode: true });

                    const segments: TranscriptSegment[] = [];
                    $('text').each((_, el) => {
                        const rawText = $(el).text();
                        const start = parseFloat($(el).attr('start') || '0');
                        const dur = parseFloat($(el).attr('dur') || $(el).attr('duration') || '0');
                        if (rawText && rawText.trim()) {
                            segments.push({
                                text: decodeHTMLEntities(rawText.trim()),
                                duration: dur * 1000,
                                offset: start * 1000,
                            });
                        }
                    });

                    if (segments.length === 0) {
                        $('p').each((_, el) => {
                            const rawText = $(el).text();
                            const startMs = parseFloat($(el).attr('t') || '0');
                            const durMs = parseFloat($(el).attr('d') || '0');
                            if (rawText && rawText.trim()) {
                                segments.push({
                                    text: decodeHTMLEntities(rawText.trim()),
                                    duration: durMs,
                                    offset: startMs,
                                });
                            }
                        });
                    }

                    if (segments.length > 0) {
                        console.log(`[OmniLearn] Successfully extracted ${segments.length} transcript segments via raw player scraping.`);
                        return segments;
                    }
                }
            }
        }
    } catch (rawError: any) {
        console.error('[OmniLearn] Raw player scraping failed:', rawError?.message || rawError);
    }

    return [];
}

function chunkTranscript(segments: TranscriptSegment[], targetDurationSeconds = 240): TranscriptChunk[] {
    const chunks: TranscriptChunk[] = [];
    let currentChunkTexts: string[] = [];
    let currentChunkStart = 0;
    let currentChunkDuration = 0;
    let chunkIndex = 0;

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        if (currentChunkTexts.length === 0) {
            currentChunkStart = segment.offset;
        }

        const cleanedText = decodeHTMLEntities(segment.text).trim();
        if (cleanedText) {
            currentChunkTexts.push(cleanedText);
        }
        
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
            currentChunkTexts = [];
            currentChunkDuration = 0;
        }
    }

    return chunks;
}

// AI Topic Enrichment using Azure AI axiom-core
async function generateTopicsWithAI(title: string, description: string): Promise<string[]> {
    try {
        const { getAzureAiClient, AZURE_AI_MODEL } = await import('@/src/config/azure-ai');
        const openai = getAzureAiClient();

        const prompt = `You are an elite educational content taxonomist and tech curator for Tolzy OmniLearn.
Analyze this video metadata and extract exactly 4 highly specific, attractive, and relevant technical topics/skills covered in the video, in professional Arabic with a fitting emoji for each.

Title: ${title}
Description: ${description}

Output ONLY a valid JSON object with a "topics" array:
{"topics": ["برمجة الويب الحديثة 🌐", "هندسة النظم السحابية ☁️", "الذكاء الاصطناعي التوليدي 🤖", "قواعد البيانات وإدارة الـ SQL 🗄️"]}`;

        const response = await openai.chat.completions.create({
            model: AZURE_AI_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 1000,
            response_format: { type: "json_object" }
        });

        const rawContent = response.choices[0]?.message?.content?.trim() || '{}';
        let cleanJsonText = rawContent;
        if (cleanJsonText.includes('{')) {
            cleanJsonText = cleanJsonText.substring(cleanJsonText.indexOf('{'), cleanJsonText.lastIndexOf('}') + 1);
        }
        
        const parsed = JSON.parse(cleanJsonText);
        if (Array.isArray(parsed)) return parsed.slice(0, 4);
        if (parsed.topics && Array.isArray(parsed.topics)) return parsed.topics.slice(0, 4);
        return ["برمجة 💻", "تطوير ⚙️", "تعليم 🧠"];
    } catch (e) {
        console.error('Topics AI Enrichment Error:', e);
        return ["برمجة 💻", "تطوير ⚙️", "تعليم 🧠"];
    }
}

// Check if URL belongs to supported educational resources and is not a blacklisted distraction domain
function isValidEducationalUrl(urlStr: string): { isValid: boolean; error?: string } {
    try {
        const trimmed = urlStr.trim();
        if (!trimmed) {
            return { isValid: false, error: 'الرجاء إدخال رابط صالح' };
        }
        
        if (!/^https?:\/\//i.test(trimmed)) {
            return { isValid: false, error: 'الرابط يجب أن يبدأ بـ http:// أو https://' };
        }

        const url = new URL(trimmed);
        const hostname = url.hostname.toLowerCase();
        
        const blacklistedDomains = [
            'facebook.com', 'www.facebook.com', 'fb.com',
            'twitter.com', 'www.twitter.com', 'x.com', 'www.x.com',
            'instagram.com', 'www.instagram.com',
            'tiktok.com', 'www.tiktok.com',
            'pinterest.com', 'www.pinterest.com',
            'snapchat.com', 'www.snapchat.com',
            'linkedin.com', 'www.linkedin.com',
            'reddit.com', 'www.reddit.com',
            'netflix.com', 'www.netflix.com',
            'spotify.com', 'www.spotify.com'
        ];

        if (blacklistedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
            return { 
                isValid: false, 
                error: 'هذا الرابط غير مدعوم. يدعم TOLZY OmniLearn فقط منصات يوتيوب، Coursera، والمواقع والمدونات التعليمية والتقنية المفتوحة.' 
            };
        }

        const pathname = url.pathname.toLowerCase();
        const forbiddenExtensions = [
            '.zip', '.rar', '.tar', '.gz', '.7z', 
            '.exe', '.msi', '.apk', '.dmg',
            '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
            '.mp4', '.mp3', '.avi', '.mov', '.mkv', '.webm',
            '.dmg', '.iso', '.bin'
        ];
        if (forbiddenExtensions.some(ext => pathname.endsWith(ext))) {
            return { 
                isValid: false, 
                error: 'هذا الملف غير مدعوم. يدعم TOLZY OmniLearn فقط صفحات الويب النصية ومقاطع الفيديو من يوتيوب وكورسات Coursera.' 
            };
        }

        return { isValid: true };
    } catch (e) {
        return { isValid: false, error: 'تنسيق الرابط غير صالح. يرجى إدخال عنوان URL كامل وصحيح.' };
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url, userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً للتحقق من الصلاحية.' }, { status: 401, headers: corsHeaders() });
        }

        // --- Unified AI Token Quota Check ---
        const quota = await checkAndConsumeAiQuota(userId, undefined, 200);
        if (!quota.allowed) {
            return NextResponse.json({
                error: quota.error || 'لقد استهلكت رصيد التوكنات المتاح في باقتك. يرجى الترقية للحصول على رصيد إضافي!'
            }, { status: 429, headers: corsHeaders() });
        }

        if (!url) {
            return NextResponse.json({ error: 'الرجاء إدخال رابط صحيح' }, { status: 400, headers: corsHeaders() });
        }

        const validation = isValidEducationalUrl(url);
        if (!validation.isValid) {
            return NextResponse.json({ error: validation.error }, { status: 400, headers: corsHeaders() });
        }

        const videoId = extractVideoId(url);
        const isYouTube = !!videoId;
        const resourceId = isYouTube ? videoId : generateUrlHash(url);

        // 1. Database Check (Deduplication)
        const { data: existingCourse } = await supabaseAdmin
            .from('youtube_courses')
            .select('*')
            .eq('video_id', resourceId)
            .maybeSingle();

        if (existingCourse) {
            const { data: existingChunks } = await supabaseAdmin
                .from('youtube_transcript_chunks')
                .select('*')
                .eq('video_id', resourceId)
                .order('chunk_index', { ascending: true });

            return NextResponse.json({
                course: existingCourse,
                chunks: existingChunks || [],
                cached: true
            }, { headers: corsHeaders() });
        }

        let title = "مادة تعليمية";
        let description = "";
        let channel = "موقع تعليمي";
        let durationStr = "موقع مفتوح";
        let thumbnail = "/image/tools/Hero.png";
        let chunksToInsert: any[] = [];

        if (isYouTube) {
            title = "فيديو تعليمي";
            channel = "قناة يوتيوب";
            durationStr = "00:00";
            thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

            // Scrape page metadata first as reliable zero-key fallback
            try {
                const proxyConfig = getProxyConfig();
                const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' },
                    timeout: 8000,
                    proxy: proxyConfig
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

            // 2. Fetch Transcript for YouTube using 3-Tier Multi-Strategy Pipeline
            const transcriptSegments = await getFullYoutubeTranscript(videoId);

            if (transcriptSegments && transcriptSegments.length > 0) {
                // Apply Smart Temporal Chunking Algorithm for YouTube
                const chunks = chunkTranscript(transcriptSegments);
                chunksToInsert = chunks.map(chunk => ({
                    video_id: resourceId,
                    chunk_index: chunk.chunk_index,
                    text: chunk.text,
                    start_time: chunk.start_time,
                    duration: chunk.duration
                }));
            } else {
                // Tier 3 Fallback: Rely on video description & metadata if no captions/transcript available
                console.log(`[OmniLearn] No transcript tracks available for ${videoId}. Using video metadata fallback.`);
                const fallbackText = `عنوان الفيديو: ${title}\nالقناة: ${channel}\n\nتفاصيل ووصف المحتوى التعليمي:\n${description}`;
                
                if (description && description.trim().length > 30) {
                    const textChunks = chunkText(fallbackText);
                    chunksToInsert = textChunks.map((txt, idx) => ({
                        video_id: resourceId,
                        chunk_index: idx,
                        text: txt,
                        start_time: idx * 60,
                        duration: 60
                    }));
                } else {
                    return NextResponse.json({ 
                        error: 'لم نتمكن من العثور على ترجمة أو تفريغ نصي لهذا الفيديو، ووصف الفيديو غير كافٍ لتوليد محتوى تفاعلي.' 
                    }, { status: 400, headers: corsHeaders() });
                }
            }

        } else {
            // 2. Scraping general web page / Coursera
            const isCoursera = url.includes('coursera.org');
            if (isCoursera) {
                channel = "Coursera";
                durationStr = "مساق كامل";
                thumbnail = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60";
            } else {
                try {
                    const parsedUrl = new URL(url);
                    channel = parsedUrl.hostname.replace('www.', '');
                } catch (e) {
                    channel = "موقع تعليمي";
                }
                durationStr = "صفحة تعليمية";
                thumbnail = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60";
            }

            let fullText = "";
            try {
                const proxyUrl = process.env.YOUTUBE_PROXY_URL;
                let proxyConfig = undefined;
                if (proxyUrl) {
                    try {
                        const parsed = new URL(proxyUrl);
                        proxyConfig = {
                            protocol: parsed.protocol.replace(':', ''),
                            host: parsed.hostname,
                            port: parseInt(parsed.port || (parsed.protocol === 'https:' ? '443' : '80')),
                            auth: parsed.username ? {
                                username: decodeURIComponent(parsed.username),
                                password: decodeURIComponent(parsed.password)
                            } : undefined
                        };
                    } catch (e) {
                        console.error('Invalid proxy configuration for scraping:', e);
                    }
                }

                const response = await axios.get(url, {
                    headers: { 
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8'
                    },
                    timeout: 12000,
                    proxy: proxyConfig
                });

                const html = response.data;
                const $ = cheerio.load(html);

                // Clean unwanted tags
                $('script, style, nav, footer, header, iframe, noscript, svg, button, form, head, link, meta').remove();

                // Extract metadata
                title = $('title').text().trim() || $('h1').first().text().trim() || title;
                title = title.replace(/\s+/g, ' ').substring(0, 150);

                const ogDesc = $('meta[property="og:description"]').attr('content');
                const metaDesc = $('meta[name="description"]').attr('content');
                description = ogDesc || metaDesc || '';

                // Extract text paragraphs
                const paragraphs: string[] = [];
                $('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre code').each((_, el) => {
                    const txt = $(el).text().trim();
                    if (txt.length > 30) {
                        paragraphs.push(txt);
                    }
                });

                fullText = paragraphs.join('\n\n');

                if (!description) {
                    description = fullText.slice(0, 200) + (fullText.length > 200 ? '...' : '');
                }

            } catch (scrapingError: any) {
                console.error('Webpage scraping failed:', scrapingError);
                return NextResponse.json({ 
                    error: 'عذراً، فشل جلب محتوى هذا الرابط التعليمي. تأكد من أن الرابط يعمل بشكل صحيح ومفتوح للعامة.' 
                }, { status: 400, headers: corsHeaders() });
            }

            if (!fullText || fullText.length < 100) {
                return NextResponse.json({ 
                    error: 'لم نتمكن من العثور على محتوى نصي تعليمي كافٍ في هذه الصفحة.' 
                }, { status: 400, headers: corsHeaders() });
            }

            const textChunks = chunkText(fullText);
            if (textChunks.length === 0) {
                return NextResponse.json({ 
                    error: 'فشل معالجة وتجزئة محتوى الصفحة.' 
                }, { status: 400, headers: corsHeaders() });
            }

            chunksToInsert = textChunks.map((txt, idx) => ({
                video_id: resourceId,
                chunk_index: idx,
                text: txt,
                start_time: idx * 60,
                duration: 60
            }));
        }

        // 4. AI Topic Enrichment
        const topics = await generateTopicsWithAI(title, description);

        // 5. Save Course to Supabase
        const { data: newCourse, error: insertCourseError } = await supabaseAdmin
            .from('youtube_courses')
            .upsert(
                {
                    video_id: resourceId,
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
            throw new Error('فشل حفظ معلومات المادة التعليمية في قاعدة البيانات');
        }

        // Delete old chunks if we are re-indexing
        await supabaseAdmin
            .from('youtube_transcript_chunks')
            .delete()
            .eq('video_id', resourceId);

        // Set the course_id for chunks
        const finalizedChunks = chunksToInsert.map(chunk => ({
            ...chunk,
            course_id: newCourse.id
        }));

        const { error: insertChunksError } = await supabaseAdmin
            .from('youtube_transcript_chunks')
            .insert(finalizedChunks);

        if (insertChunksError) {
            console.error('Failed to insert chunks to Supabase:', insertChunksError);
            throw new Error('فشل حفظ وتجزئة المحتوى في قاعدة البيانات');
        }

        return NextResponse.json({
            course: newCourse,
            chunks: finalizedChunks,
            cached: false
        }, { headers: corsHeaders() });

    } catch (error: any) {
        console.error('Fetch Resource API Global Error:', error.message);
        return NextResponse.json({ error: error.message || 'حدث خطأ غير متوقع أثناء معالجة الرابط' }, { status: 500, headers: corsHeaders() });
    }
}
