import { adminDb } from '@/src/config/firebase-admin';
import * as admin from 'firebase-admin';

export interface QuotaCheckResult {
    allowed: boolean;
    isPro: boolean;
    remaining: number;
    error?: string;
}

/**
 * فحص واستهلاك حصة الذكاء الاصطناعي الموحدة لجميع الأدوات (5 طلبات يومياً للمستخدم المجاني)
 */
export async function checkAndConsumeAiQuota(userId: string | undefined | null, clientPlan?: string): Promise<QuotaCheckResult> {
    if (!userId) {
        return {
            allowed: false,
            isPro: false,
            remaining: 0,
            error: 'يرجى تسجيل الدخول أولاً للاستفادة من أدوات الذكاء الاصطناعي.'
        };
    }

    if (!adminDb) {
        const isClientPro = String(clientPlan || '').toLowerCase().includes('pro') || String(clientPlan || '').toLowerCase().includes('ultra');
        return { allowed: true, isPro: isClientPro, remaining: isClientPro ? 9999 : 5 };
    }

    try {
        const userRef = adminDb.collection('users').doc(userId);
        
        const firestorePromise = userRef.get();
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Firestore Timeout')), 2000)
        );
        const userSnap: any = await Promise.race([firestorePromise, timeoutPromise]);
        const userData = userSnap.data();

        const plan = String(userData?.plan || clientPlan || 'free').toLowerCase();
        const isPro = plan.includes('pro') || plan.includes('ultra');

        if (isPro) {
            return { allowed: true, isPro: true, remaining: 999999 };
        }

        // Daily Free Quota check (5 requests max for free users across all tools)
        const count = userData?.aiRequestCount ?? userData?.copilotRequestCount ?? 0;
        const lastDate = userData?.lastAiRequestDate?.toDate?.() || userData?.lastCopilotRequestDate?.toDate?.() || new Date(0);
        const ONE_DAY = 24 * 60 * 60 * 1000;
        const elapsed = Date.now() - lastDate.getTime();
        
        const currentCount = elapsed > ONE_DAY ? 0 : count;

        if (currentCount >= 5) {
            const hoursLeft = Math.ceil((ONE_DAY - elapsed) / 3600000);
            return {
                allowed: false,
                isPro: false,
                remaining: 0,
                error: `لقد استهلكت جميع طلباتك المجانية المتاحة (5 طلبات). ستتجدد بعد ${hoursLeft > 0 ? hoursLeft : 1} ساعة، أو قم بالترقية إلى باقة Pro لفتح وصول غير محدود لجميع أدوات الذكاء الاصطناعي!`
            };
        }

        // Increment quota count
        userRef.set({
            aiRequestCount: currentCount + 1,
            copilotRequestCount: currentCount + 1,
            lastAiRequestDate: admin.firestore.FieldValue.serverTimestamp(),
            lastCopilotRequestDate: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true }).catch(console.error);

        return {
            allowed: true,
            isPro: false,
            remaining: 4 - currentCount
        };

    } catch (err: any) {
        console.error('Error verifying unified AI quota with Firestore:', err);
        const isClientPro = String(clientPlan || '').toLowerCase().includes('pro') || String(clientPlan || '').toLowerCase().includes('ultra');
        return { allowed: true, isPro: isClientPro, remaining: 1 };
    }
}
