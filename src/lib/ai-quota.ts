import { adminDb } from '@/src/config/firebase-admin';
import * as admin from 'firebase-admin';

export type PlanType = 'free' | 'pro' | 'max' | 'ultra' | 'admin';

export interface PlanConfig {
    name: string;
    tokenAllowance: number;
    isLifetime: boolean;
    maxTokensPerRequest: number;
    rpmLimit: number; // Requests Per Minute
    features: {
        copilot: boolean;
        axiom: boolean;
        omnilearn: boolean;
        buildWithAi: boolean;
        deepReasoning: boolean;
        prioritySpeed: boolean;
        tolzyVoice?: boolean;
        tolzyImage: boolean;
    };
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
    free: {
        name: 'الباقة الأساسية (Free)',
        tokenAllowance: 10_000, // 10,000 توكن مدى الحياة لجميع الميزات
        isLifetime: true,
        maxTokensPerRequest: 4_000,
        rpmLimit: 15,
        features: {
            copilot: true,
            axiom: true,
            omnilearn: true,
            buildWithAi: true,
            deepReasoning: true,
            prioritySpeed: true,
            tolzyVoice: false,
            tolzyImage: false, // 🔒 حصري لـ Pro و Max
        }
    },
    pro: {
        name: 'باقة المحترفين (Pro)',
        tokenAllowance: 500_000, // 500,000 توكن
        isLifetime: false,
        maxTokensPerRequest: 6_000,
        rpmLimit: 40,
        features: {
            copilot: true,
            axiom: true,
            omnilearn: true,
            buildWithAi: true,
            deepReasoning: true,
            prioritySpeed: true,
            tolzyVoice: true,
            tolzyImage: true,
        }
    },
    max: {
        name: 'باقة ماكس الفائقة (MAX)',
        tokenAllowance: 2_500_000, // 2.5 مليون توكن
        isLifetime: false,
        maxTokensPerRequest: 8_000,
        rpmLimit: 80,
        features: {
            copilot: true,
            axiom: true,
            omnilearn: true,
            buildWithAi: true,
            deepReasoning: true,
            prioritySpeed: true,
            tolzyVoice: true,
            tolzyImage: true,
        }
    },
    ultra: {
        name: 'باقة ماكس الفائقة (MAX)',
        tokenAllowance: 2_500_000,
        isLifetime: false,
        maxTokensPerRequest: 8_000,
        rpmLimit: 80,
        features: {
            copilot: true,
            axiom: true,
            omnilearn: true,
            buildWithAi: true,
            deepReasoning: true,
            prioritySpeed: true,
            tolzyVoice: true,
            tolzyImage: true,
        }
    },
    admin: {
        name: 'حساب الإدارة (Admin)',
        tokenAllowance: 999_999_999,
        isLifetime: true,
        maxTokensPerRequest: 16_000,
        rpmLimit: 200,
        features: {
            copilot: true,
            axiom: true,
            omnilearn: true,
            buildWithAi: true,
            deepReasoning: true,
            prioritySpeed: true,
            tolzyVoice: true,
            tolzyImage: true,
        }
    }
};

export function canAccessTolzyImage(rawPlan: unknown): boolean {
    const plan = parsePlan(rawPlan);
    return PLAN_CONFIGS[plan]?.features?.tolzyImage ?? false;
}

export function canAccessTolzyVoice(rawPlan: unknown): boolean {
    const plan = parsePlan(rawPlan);
    return PLAN_CONFIGS[plan]?.features?.tolzyVoice ?? false;
}

export interface QuotaCheckResult {
    allowed: boolean;
    plan: PlanType;
    isPro: boolean;
    isMax: boolean;
    tokensUsed: number;
    tokenAllowance: number;
    tokensRemaining: number;
    remaining: number;
    maxTokensForRequest: number;
    error?: string;
}

// In-Memory Rate Limiting Tracker (Sliding Window per Minute) to protect against DDoS/Script abuse
interface RateLimitEntry {
    timestamps: number[];
}
const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old rate limit entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitMap.entries()) {
            entry.timestamps = entry.timestamps.filter(ts => now - ts < 60_000);
            if (entry.timestamps.length === 0) {
                rateLimitMap.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

export function parsePlan(rawPlan: unknown): PlanType {
    const p = String(rawPlan || 'free').toLowerCase().trim();
    if (p.includes('admin')) return 'admin';
    if (p.includes('max') || p.includes('ultra')) return 'max';
    if (p.includes('pro')) return 'pro';
    return 'free';
}

/**
 * 🔒 فحص واستهلاك حصة التوكن والأمان الموحد لكافة أدوات الذكاء الاصطناعي
 */
export async function checkAndConsumeAiQuota(
    userId: string | undefined | null, 
    clientPlan?: string,
    estimatedTokens: number = 300
): Promise<QuotaCheckResult> {
    if (!userId) {
        return {
            allowed: false,
            plan: 'free',
            isPro: false,
            isMax: false,
            tokensUsed: 0,
            tokenAllowance: 10_000,
            tokensRemaining: 0,
            remaining: 0,
            maxTokensForRequest: 1_000,
            error: 'يرجى تسجيل الدخول أولاً للاستفادة من أدوات ونماذج الذكاء الاصطناعي.'
        };
    }

    const initialPlan = parsePlan(clientPlan);
    const planConfig = PLAN_CONFIGS[initialPlan] || PLAN_CONFIGS.free;

    // --- 🛡️ 1. Rate Limiting & Anti-Spam (RPM Protection) ---
    const now = Date.now();
    const rateLimitKey = `user_${userId}`;
    let rateEntry = rateLimitMap.get(rateLimitKey);
    if (!rateEntry) {
        rateEntry = { timestamps: [] };
        rateLimitMap.set(rateLimitKey, rateEntry);
    }
    // Filter timestamps within last 60 seconds
    rateEntry.timestamps = rateEntry.timestamps.filter(ts => now - ts < 60_000);

    if (rateEntry.timestamps.length >= planConfig.rpmLimit) {
        const oldest = rateEntry.timestamps[0];
        const waitSec = Math.max(1, Math.ceil((60_000 - (now - oldest)) / 1000));
        return {
            allowed: false,
            plan: initialPlan,
            isPro: initialPlan === 'pro' || initialPlan === 'max' || initialPlan === 'admin',
            isMax: initialPlan === 'max' || initialPlan === 'admin',
            tokensUsed: 0,
            tokenAllowance: planConfig.tokenAllowance,
            tokensRemaining: 0,
            remaining: 0,
            maxTokensForRequest: planConfig.maxTokensPerRequest,
            error: `تم تجاوز الحد المسموح من الطلبات السريعة (${planConfig.rpmLimit} طلب/دقيقة). يرجى الانتظار ${waitSec} ثانية لحماية أمان البنية التحتية.`
        };
    }

    // Add current request to rate limit window
    rateEntry.timestamps.push(now);

    if (!adminDb) {
        const isPro = initialPlan === 'pro' || initialPlan === 'max' || initialPlan === 'admin';
        const isMax = initialPlan === 'max' || initialPlan === 'admin';
        return {
            allowed: true,
            plan: initialPlan,
            isPro,
            isMax,
            tokensUsed: 0,
            tokenAllowance: planConfig.tokenAllowance,
            tokensRemaining: planConfig.tokenAllowance,
            remaining: planConfig.tokenAllowance,
            maxTokensForRequest: planConfig.maxTokensPerRequest
        };
    }

    try {
        const userRef = adminDb.collection('users').doc(userId);
        
        const firestorePromise = userRef.get();
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Firestore Timeout')), 2500)
        );
        const userSnap: any = await Promise.race([firestorePromise, timeoutPromise]);
        const userData = userSnap?.data() || {};

        // Determine verified plan from database
        const dbPlanRaw = userData?.plan || userData?.subscriptionPlan || clientPlan || 'free';
        const activePlan = parsePlan(dbPlanRaw);
        const activeConfig = PLAN_CONFIGS[activePlan] || PLAN_CONFIGS.free;

        const isPro = activePlan === 'pro' || activePlan === 'max' || activePlan === 'admin';
        const isMax = activePlan === 'max' || activePlan === 'admin';

        if (activePlan === 'admin') {
            return {
                allowed: true,
                plan: 'admin',
                isPro: true,
                isMax: true,
                tokensUsed: userData?.tokensUsed || 0,
                tokenAllowance: 999_999_999,
                tokensRemaining: 999_999_999,
                remaining: 999_999_999,
                maxTokensForRequest: 16_000
            };
        }

        // --- 📊 2. Token Usage & Allowance Verification ---
        const totalAllowance = activeConfig.tokenAllowance;
        const currentTokensUsed = Number(userData?.tokensUsed || userData?.aiTokensUsed || 0);
        const remainingTokens = Math.max(0, totalAllowance - currentTokensUsed);

        // Check if user has sufficient tokens remaining for estimated call
        if (remainingTokens <= 0 || currentTokensUsed >= totalAllowance || remainingTokens < Math.min(estimatedTokens, 50)) {
            let errorMsg = '';
            if (activePlan === 'free') {
                errorMsg = `⚠️ رصيدك من التوكن غير كافٍ لتنفيذ هذه العملية (${remainingTokens.toLocaleString('ar-EG')} توكن متبقٍ). لقد استهلكت حصتك الترحيبية. يجب شحن حسابك وترقية الباقة الآن إلى Pro (500K توكن) أو MAX (2.5M توكن) لمتابعة الاستخدام فوراً!`;
            } else if (activePlan === 'pro') {
                errorMsg = `⚠️ رصيدك الحالي من التوكن غير كافٍ (${remainingTokens.toLocaleString('ar-EG')} توكن متبقٍ). لقد استهلكت رصيد باقة Pro. يجب شحن الرصيد أو الترقية إلى باقة MAX (2.5 مليون توكن) للاستمرار بدون انقطاع!`;
            } else {
                errorMsg = `⚠️ لقد استهلكت كامل رصيد باقة MAX. يرجى شحن الرصيد أو التواصل مع الإدارة لتجديد أو زيادة حصتك.`;
            }

            return {
                allowed: false,
                plan: activePlan,
                isPro,
                isMax,
                tokensUsed: currentTokensUsed,
                tokenAllowance: totalAllowance,
                tokensRemaining: remainingTokens,
                remaining: remainingTokens,
                maxTokensForRequest: activeConfig.maxTokensPerRequest,
                error: errorMsg
            };
        }

        // --- 🔒 3. Reserve Pre-flight Estimated Tokens ---
        const incrementAmount = Math.min(estimatedTokens, remainingTokens);
        userRef.set({
            tokensUsed: currentTokensUsed + incrementAmount,
            aiTokensUsed: currentTokensUsed + incrementAmount,
            lastAiRequestDate: admin.firestore.FieldValue.serverTimestamp(),
            lastPlan: activePlan,
            tokenAllowance: totalAllowance,
        }, { merge: true }).catch(console.error);

        return {
            allowed: true,
            plan: activePlan,
            isPro,
            isMax,
            tokensUsed: currentTokensUsed + incrementAmount,
            tokenAllowance: totalAllowance,
            tokensRemaining: Math.max(0, remainingTokens - incrementAmount),
            remaining: Math.max(0, remainingTokens - incrementAmount),
            maxTokensForRequest: activeConfig.maxTokensPerRequest
        };

    } catch (err: any) {
        console.error('Error in checkAndConsumeAiQuota:', err);
        const fallbackIsPro = initialPlan === 'pro' || initialPlan === 'max' || initialPlan === 'admin';
        const fallbackIsMax = initialPlan === 'max' || initialPlan === 'admin';
        return {
            allowed: true,
            plan: initialPlan,
            isPro: fallbackIsPro,
            isMax: fallbackIsMax,
            tokensUsed: 0,
            tokenAllowance: planConfig.tokenAllowance,
            tokensRemaining: planConfig.tokenAllowance,
            remaining: planConfig.tokenAllowance,
            maxTokensForRequest: planConfig.maxTokensPerRequest
        };
    }
}

/**
 * 📝 تسجيل الاستهلاك الفعلي الدقيق للتوكن بعد إتمام استجابة الذكاء الاصطناعي
 */
export async function recordActualTokenUsage(
    userId: string | undefined | null,
    actualTokensUsed: number,
    estimatedTokensReserved: number = 300
): Promise<void> {
    if (!userId || !adminDb || actualTokensUsed <= 0) return;

    try {
        const userRef = adminDb.collection('users').doc(userId);
        const difference = actualTokensUsed - estimatedTokensReserved;

        if (difference !== 0) {
            await userRef.set({
                tokensUsed: admin.firestore.FieldValue.increment(difference),
                aiTokensUsed: admin.firestore.FieldValue.increment(difference),
                lastTokenUpdate: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    } catch (e) {
        console.error('Failed to record actual token usage:', e);
    }
}
