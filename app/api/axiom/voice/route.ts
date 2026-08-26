import { NextRequest, NextResponse } from 'next/server';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { checkAndConsumeAiQuota, parsePlan, canAccessTolzyVoice, recordActualTokenUsage } from '@/src/lib/ai-quota';

export const maxDuration = 60;

export const SUPPORTED_VOICES = [
    { id: 'ar-EG-SalmaNeural', name: 'سلمى (مصر)', gender: 'أنثى', dialect: 'مصرية / فصحى', sampleText: 'أهلاً بك في منصة تولزي' },
    { id: 'ar-EG-ShakirNeural', name: 'شاكر (مصر)', gender: 'ذكر', dialect: 'مصرية / فصحى', sampleText: 'مرحباً، كيف أساعدك اليوم؟' },
    { id: 'ar-SA-HamedNeural', name: 'حامد (فصحى)', gender: 'ذكر', dialect: 'فصحى / سعودية', sampleText: 'أهلاً بكم في المستقبل مع تولزي' },
    { id: 'ar-SA-ZariyahNeural', name: 'زارية (فصحى)', gender: 'أنثى', dialect: 'فصحى / سعودية', sampleText: 'تحياتي لكم من منظومة الذكاء الاصطناعي' },
    { id: 'ar-AE-FatimaNeural', name: 'فاطمة (الإمارات)', gender: 'أنثى', dialect: 'خليجية / فصحى', sampleText: 'مرحبا بكم في عالم الابتكار' },
    { id: 'ar-AE-HamdanNeural', name: 'حمدان (الإمارات)', gender: 'ذكر', dialect: 'خليجية / فصحى', sampleText: 'أهلاً بكم في منصتنا' },
    { id: 'en-US-JennyNeural', name: 'Jenny (US)', gender: 'Female', dialect: 'English (US)', sampleText: 'Welcome to Tolzy Voice AI' },
    { id: 'en-US-GuyNeural', name: 'Guy (US)', gender: 'Male', dialect: 'English (US)', sampleText: 'Hello from Tolzy Voice AI' },
];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            text,
            voice = 'ar-EG-SalmaNeural',
            userId,
            userPlan = 'free',
            returnJson = false,
            speed = 1.0,
            pitch = 0
        } = body;

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: 'يرجى تقديم النص المراد تحويله لصوت.' }, { status: 400 });
        }

        // =======================
        // 🔒 1. Plan Verification (PRO & MAX ONLY)
        // =======================
        const parsedUserPlan = parsePlan(userPlan);
        const hasAccess = canAccessTolzyVoice(parsedUserPlan);

        if (!hasAccess && parsedUserPlan === 'free') {
            return NextResponse.json({
                error: 'نموذج TOLZY Voice متاح حصرياً لمشتركي باقات Pro و MAX. يرجى ترقية حسابك للوصول إلى توليد الأصوات.',
                code: 'UPGRADE_REQUIRED',
                isProRequired: true
            }, { status: 403 });
        }

        // =======================
        // 🔒 2. Quota Check
        // =======================
        const estimatedTokens = Math.max(50, Math.ceil(text.length / 2));
        const quota = await checkAndConsumeAiQuota(userId, userPlan, estimatedTokens);
        if (!quota.allowed) {
            return NextResponse.json({ error: quota.error }, { status: 429 });
        }

        // =======================
        // 🎙️ 3. Azure Speech SDK Configuration
        // =======================
        const speechKey = (process.env.AZURE_SPEECH_KEY || process.env.AZURE_AI_KEY || '').trim();
        const speechRegion = (process.env.AZURE_SPEECH_REGION || process.env.AZURE_AI_REGION || 'eastus').trim();

        if (!speechKey) {
            console.error('❌ [Azure Speech] AZURE_SPEECH_KEY is missing.');
            return NextResponse.json({
                error: 'خدمة توليد الصوت غير مهيأة حالياً. يرجى التأكد من مفاتيح Azure Speech (AZURE_SPEECH_KEY).',
                code: 'CONFIG_ERROR'
            }, { status: 500 });
        }

        const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
        speechConfig.speechSynthesisVoiceName = voice;
        speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null as any);

        const xmlEscapeMap: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' };
        const safeText = text.replace(/[<>&"']/g, (c: string) => xmlEscapeMap[c] || c);

        const ssml = `
            <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-EG">
                <voice name="${voice}">
                    <prosody rate="${speed >= 0.5 && speed <= 2 ? (speed * 100 - 100).toFixed(0) + '%' : '0%'}" pitch="${pitch}%">
                        ${safeText}
                    </prosody>
                </voice>
            </speak>
        `.trim();

        return new Promise<NextResponse>((resolve) => {
            synthesizer.speakSsmlAsync(
                ssml,
                async (result) => {
                    if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                        const audioBuffer = Buffer.from(result.audioData);
                        synthesizer.close();

                        // Record token usage
                        if (userId) {
                            recordActualTokenUsage(userId, estimatedTokens, estimatedTokens).catch(console.error);
                        }

                        if (returnJson) {
                            const base64Audio = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;
                            resolve(NextResponse.json({
                                success: true,
                                audioUrl: base64Audio,
                                voice,
                                text,
                                byteLength: audioBuffer.length
                            }));
                        } else {
                            resolve(
                                new NextResponse(audioBuffer, {
                                    headers: {
                                        'Content-Type': 'audio/mpeg',
                                        'Content-Length': audioBuffer.length.toString(),
                                        'Cache-Control': 'public, max-age=31536000, immutable',
                                    },
                                })
                            );
                        }
                    } else {
                        synthesizer.close();
                        console.error('❌ [Azure Speech Error]:', result.errorDetails);
                        resolve(
                            NextResponse.json(
                                { error: 'فشل توليد الصوت عبر محرك Azure Speech', details: result.errorDetails },
                                { status: 500 }
                            )
                        );
                    }
                },
                (error) => {
                    synthesizer.close();
                    console.error('❌ [Azure Speech Synthesis Exception]:', error);
                    resolve(NextResponse.json({ error: String(error) }, { status: 500 }));
                }
            );
        });

    } catch (error: any) {
        console.error('❌ [TOLZY Voice Error]:', error);
        return NextResponse.json({ error: error.message || 'حدث خطأ غير متوقع أثناء توليد الصوت' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        model: 'TOLZY Voice',
        version: '2.0-neural',
        voices: SUPPORTED_VOICES,
        tier: 'PRO_AND_MAX_EXCLUSIVE'
    });
}
