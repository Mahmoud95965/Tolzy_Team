export type PlanType = 'free' | 'pro' | 'max' | 'ultra' | 'admin';

export interface PlanConfig {
    name: string;
    tokenAllowance: number;
    isLifetime: boolean;
    maxTokensPerRequest: number;
    rpmLimit: number;
    features: {
        copilot: boolean;
        axiom: boolean;
        omnilearn: boolean;
        buildWithAi: boolean;
        deepReasoning: boolean;
        prioritySpeed: boolean;
        tolzyVoice?: boolean;
    };
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
    free: {
        name: 'الباقة المفتوحة',
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
        }
    },
    pro: {
        name: 'باقة المحترفين (Pro)',
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
        }
    },
    max: {
        name: 'باقة ماكس الفائقة (MAX)',
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
        }
    },
    ultra: {
        name: 'باقة ماكس الفائقة (MAX)',
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
        }
    }
};

export function canAccessTolzyVoice(_rawPlan?: unknown): boolean {
    return true;
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

export function parsePlan(rawPlan: unknown): PlanType {
    const p = String(rawPlan || 'free').toLowerCase().trim();
    if (p.includes('admin')) return 'admin';
    if (p.includes('max') || p.includes('ultra')) return 'max';
    if (p.includes('pro')) return 'pro';
    return 'free';
}

/**
 * 🔒 פحص الحصة الذكية - مفتوح ومجاني بالكامل لكافة المستخدمين 100%
 */
export async function checkAndConsumeAiQuota(
    _userId: string | undefined | null, 
    _clientPlan?: string,
    _estimatedTokens: number = 300
): Promise<QuotaCheckResult> {
    return {
        allowed: true,
        plan: 'free',
        isPro: true,
        isMax: true,
        tokensUsed: 0,
        tokenAllowance: 999_999_999,
        tokensRemaining: 999_999_999,
        remaining: 999_999_999,
        maxTokensForRequest: 16_000
    };
}

/**
 * 📝 تسجيل استهلاك التوكن - لا يوجد قيود
 */
export async function recordActualTokenUsage(
    _userId: string | undefined | null,
    _actualTokensUsed: number,
    _estimatedTokensReserved: number = 300
): Promise<void> {
    // No-op for 100% free directory
}
