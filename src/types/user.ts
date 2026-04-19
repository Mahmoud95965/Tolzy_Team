export type SubscriptionPlan = 'free' | 'plus' | 'pro' | 'ultra' | 'tolzy_pro' | 'tolzy_ultra';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
    plan: SubscriptionPlan;
    createdAt?: string;
    lastLoginAt?: string;
    role?: 'user' | 'admin';
}
