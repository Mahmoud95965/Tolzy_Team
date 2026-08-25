export type SubscriptionPlan = 'free' | 'plus' | 'pro' | 'max' | 'ultra' | 'tolzy_pro' | 'tolzy_max' | 'tolzy_ultra';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
    plan: SubscriptionPlan;
    tokensUsed?: number;
    tokenAllowance?: number;
    createdAt?: string;
    lastLoginAt?: string;
    role?: 'user' | 'admin';
}
