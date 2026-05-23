import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

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

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get('q') || '';

        if (!query.trim()) {
            return NextResponse.json({ videos: [] }, { headers: corsHeaders() });
        }

        // Retrieve the API key with fallbacks
        const youtubeApiKey = process.env.YOUTUBE_API_KEY || 
                               process.env.GOOGLE_API_KEY || 
                               process.env.GEMINI_API_KEY || 
                               process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
                               '';

        if (!youtubeApiKey) {
            console.error('Missing YouTube API Key (YOUTUBE_API_KEY, GOOGLE_API_KEY, GEMINI_API_KEY)');
            return NextResponse.json({ 
                error: 'عذراً، محرك البحث يتطلب تهيئة مفتاح يوتيوب (YOUTUBE_API_KEY) في الخادم.' 
            }, { status: 500, headers: corsHeaders() });
        }

        const youtube = google.youtube({
            version: 'v3',
            auth: youtubeApiKey
        });

        // Auto-inject educational keywords to ensure high quality tutorials / courses
        const keywords = ['كورس', 'دورة', 'tutorial'];
        const hasKeyword = keywords.some(kw => query.toLowerCase().includes(kw));
        const enrichedQuery = hasKeyword ? query : `${query} كورس دورة tutorial`;

        // 1. Perform Search
        const searchResponse = await youtube.search.list({
            part: ['snippet'],
            q: enrichedQuery,
            type: ['video'],
            videoCategoryId: '27', // Strict filter: Education category only
            maxResults: 12,
            safeSearch: 'strict',
            relevanceLanguage: 'ar' // Prioritize Arabic content when appropriate
        });

        const items = searchResponse.data.items || [];
        const videoIds = items.map(item => item.id?.videoId).filter(Boolean) as string[];

        // 2. Fetch Duration and content details in a batch request for all videoIds
        let durationsMap: Record<string, string> = {};
        if (videoIds.length > 0) {
            try {
                const videoDetailsResponse = await youtube.videos.list({
                    part: ['contentDetails'],
                    id: videoIds
                });
                
                videoDetailsResponse.data.items?.forEach(item => {
                    if (item.id && item.contentDetails?.duration) {
                        durationsMap[item.id] = parseISO8601Duration(item.contentDetails.duration);
                    }
                });
            } catch (err) {
                console.error('Failed to fetch video durations:', err);
            }
        }

        // 3. Construct premium search results payload
        const videos = items.map(item => {
            const videoId = item.id?.videoId || '';
            return {
                videoId,
                title: item.snippet?.title || '',
                description: item.snippet?.description || '',
                thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.high?.url || '',
                channelTitle: item.snippet?.channelTitle || '',
                publishedAt: item.snippet?.publishedAt || '',
                duration: durationsMap[videoId] || 'فيديو تعليمي'
            };
        });

        return NextResponse.json({ videos }, { headers: corsHeaders() });

    } catch (error: any) {
        console.error('Search YouTube API Global Error:', error.message);
        return NextResponse.json({ 
            error: 'حدث خطأ أثناء الاتصال بخوادم يوتيوب لجلب نتائج البحث' 
        }, { status: 500, headers: corsHeaders() });
    }
}
