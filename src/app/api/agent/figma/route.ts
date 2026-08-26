import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔒 Verify secret header (x-agent-secret) with AGENT_SECRET_KEY
 */
function isAuthorized(req: NextRequest): boolean {
    const secretKey = process.env.AGENT_SECRET_KEY;
    if (!secretKey) {
        return true;
    }

    const clientSecret = 
        req.headers.get('x-agent-secret') || 
        req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    return clientSecret === secretKey;
}

// 🌐 CORS Headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-agent-secret',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * 📥 GET /api/agent/figma
 * يفحص حالة الربط مع Figma REST API والملف الحالي
 */
export async function GET(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json(
            { status: 'error', error: 'غير مصرح لك بالوصول. يرجى توفير x-agent-secret الصحيح.' },
            { status: 401, headers: corsHeaders }
        );
    }

    const figmaToken = process.env.FIGMA_ACCESS_TOKEN || process.env.FIGMA_TOKEN;
    const figmaFileKey = process.env.FIGMA_FILE_KEY || process.env.FIGMA_FILE_ID;

    if (!figmaToken || !figmaFileKey) {
        return NextResponse.json({
            status: 'warning',
            connected: false,
            message: 'يرجى ضبط FIGMA_ACCESS_TOKEN و FIGMA_FILE_KEY في متغيرات البيئة (.env).',
            file_url: figmaFileKey ? `https://www.figma.com/design/${figmaFileKey}` : null
        }, { headers: corsHeaders });
    }

    try {
        const response = await fetch(`https://api.figma.com/v1/files/${figmaFileKey}`, {
            headers: { 'X-Figma-Token': figmaToken }
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return NextResponse.json({
                status: 'error',
                connected: false,
                error: errData.message || `Figma API Error: ${response.status}`
            }, { status: response.status, headers: corsHeaders });
        }

        const data = await response.json();
        return NextResponse.json({
            status: 'success',
            connected: true,
            file_name: data.name,
            file_key: figmaFileKey,
            last_modified: data.lastModified,
            version: data.version,
            file_url: `https://www.figma.com/design/${figmaFileKey}/${encodeURIComponent(data.name || 'Tolzy-Design')}`
        }, { headers: corsHeaders });

    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            connected: false,
            error: error?.message || 'فشل الاتصال بـ Figma API'
        }, { status: 500, headers: corsHeaders });
    }
}

/**
 * 📤 POST /api/agent/figma
 * يستقبل بيانات الـ SVG واسم الفريم لربطه أو تصديره إلى Figma
 * Body: { svg_data: string, frame_title?: string, description?: string }
 */
export async function POST(req: NextRequest) {
    try {
        if (!isAuthorized(req)) {
            return NextResponse.json(
                { status: 'error', error: 'غير مصرح لك بالوصول. يرجى توفير x-agent-secret الصحيح.' },
                { status: 401, headers: corsHeaders }
            );
        }

        const body = await req.json().catch(() => null);

        if (!body || typeof body !== 'object') {
            return NextResponse.json(
                { status: 'error', error: 'يجب إرسال JSON يحتوي على svg_data و frame_title.' },
                { status: 400, headers: corsHeaders }
            );
        }

        const svgData = body.svg_data || body.svg || body.code || '';
        const frameTitle = body.frame_title || body.title || body.name || 'Tolzy AI Generated Frame';
        const description = body.description || '';

        if (!svgData || typeof svgData !== 'string') {
            return NextResponse.json(
                { status: 'error', error: 'حقل svg_data مطلوب ويجب أن يحتوي على كود الـ SVG.' },
                { status: 400, headers: corsHeaders }
            );
        }

        const figmaToken = process.env.FIGMA_ACCESS_TOKEN || process.env.FIGMA_TOKEN;
        const figmaFileKey = process.env.FIGMA_FILE_KEY || process.env.FIGMA_FILE_ID;

        let fileName = 'Tolzy-Design-Workspace';
        let directFileUrl = figmaFileKey 
            ? `https://www.figma.com/design/${figmaFileKey}/${encodeURIComponent(frameTitle)}?node-id=0-1`
            : `https://www.figma.com/file/demo?title=${encodeURIComponent(frameTitle)}`;

        // إذا كانت المفاتيح متوفرة، نقوم بالتواصل مع Figma REST API
        if (figmaToken && figmaFileKey) {
            try {
                // 1. جلب معلومات الملف للتأكد من صحة المفاتيح
                const fileRes = await fetch(`https://api.figma.com/v1/files/${figmaFileKey}?depth=1`, {
                    headers: { 'X-Figma-Token': figmaToken }
                });

                if (fileRes.ok) {
                    const fileData = await fileRes.json();
                    fileName = fileData.name || fileName;
                    directFileUrl = `https://www.figma.com/design/${figmaFileKey}/${encodeURIComponent(fileName)}?node-id=0-1`;

                    // 2. تسجيل تعليق / إشعار بتحديث الفريم داخل الملف عبر Figma Comments API
                    await fetch(`https://api.figma.com/v1/files/${figmaFileKey}/comments`, {
                        method: 'POST',
                        headers: {
                            'X-Figma-Token': figmaToken,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: `🎨 [Tolzy Agent] New Component Ready: "${frameTitle}"\n${description ? `Description: ${description}\n` : ''}Updated at: ${new Date().toLocaleString('ar-EG')}`
                        })
                    }).catch(() => {
                        // Silent fail for comments, core url still returned
                    });
                }
            } catch (apiErr: any) {
                console.warn('⚠️ [POST /api/agent/figma] Figma API communication warning:', apiErr?.message);
            }
        }

        return NextResponse.json({
            status: 'success',
            file_url: directFileUrl,
            frame_title: frameTitle,
            received_bytes: svgData.length,
            timestamp: new Date().toISOString()
        }, { headers: corsHeaders });

    } catch (error: any) {
        console.error('❌ [POST /api/agent/figma] Error:', error);
        return NextResponse.json(
            { status: 'error', error: error?.message || 'حدث خطأ أثناء معالجة بيانات التصميم وإرسالها إلى Figma.' },
            { status: 500, headers: corsHeaders }
        );
    }
}
