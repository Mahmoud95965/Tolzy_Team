'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Zap, UserCircle, Crown } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

type PlanId = 'free' | 'basic' | 'pro';
type UserPlan = 'free' | 'plus' | 'pro' | 'ultra' | 'tolzy_pro' | 'tolzy_ultra';

type Plan = {
  id: PlanId;
  title: string;
  description: string;
  amount: number;
  highlight?: boolean;
  badge?: string;
  features: string[];
};

function formatEGP(amount: number) {
  if (amount === 0) return 'مجاني';
  return `${amount} ج.م`;
}

// مكون زر الدفع المربوط بـ Kashier Payment Page
function CheckoutButton({ amount, userEmail, userId, className }: { amount: number; userEmail: string; userId: string; className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    setLoading(true);

    try {
      // 1. تحديد الـ ID بناءً على الخطة (مع إضافة ,test)
      let pageId = '';
      if (amount === 299) {
        pageId = 'PP-4542426601,test'; // خطة PRO
      } else if (amount === 149) {
        pageId = 'PP-XXXXXX,test'; // خطة BASIC - غيّر الـ ID لما تعمل صفحتها
      } else {
        pageId = 'PP-4542426601,test'; // افتراضي: PRO
      }

      // 2. بناء الرابط النهائي
      const baseUrl = 'https://checkouts.kashier.io/ar/paymentpage';
      const params = new URLSearchParams({
        ppLink: pageId,
      });

      // 3. إضافة الإيميل لو موجود عشان يسهل على المستخدم
      if (userEmail) {
        params.append('customerEmail', userEmail);
      }

      // 4. إضافة reference (userId) للـ Webhook
      if (userId) {
        params.append('reference', userId);
        params.append('merchantOrderId', `tolzy_${Date.now()}`);
      }

      // 5. التوجيه المباشر للصفحة
      window.location.href = `${baseUrl}?${params.toString()}`;
      
    } catch (error) {
      console.error('Redirect Error:', error);
      alert('حدث خطأ أثناء تحويلك لصفحة الدفع.');
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className={
        className ||
        'inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60'
      }
    >
      {loading ? 'جاري التحويل...' : 'اشترك الآن'}
    </button>
  );
}

// Map system plan IDs to pricing page plan IDs
function mapUserPlanToPricingPlan(userPlan: UserPlan | undefined): PlanId {
  if (!userPlan) return 'free';
  const plan = userPlan.toLowerCase();
  if (plan.includes('pro') || plan.includes('ultra')) return 'pro';
  if (plan.includes('plus')) return 'basic';
  return 'free';
}

// Get display name for user's plan
function getPlanDisplayName(userPlan: UserPlan | undefined): string {
  if (!userPlan) return 'مجانية';
  const plan = userPlan.toLowerCase();
  if (plan.includes('ultra')) return 'Ultra';
  if (plan.includes('pro')) return 'Pro';
  if (plan.includes('plus')) return 'Plus';
  return 'مجانية';
}

export default function PricingPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  // User's current plan from AuthContext
  const currentUserPlan: UserPlan = (userProfile?.plan as UserPlan) || 'free';
  const currentPricingPlanId = mapUserPlanToPricingPlan(currentUserPlan);
  const isPaidUser = currentUserPlan !== 'free' && user;

  const plans: Plan[] = useMemo(
    () => [
      {
        id: 'free',
        title: 'الخطة المجانية',
        description: 'ابدأ بسرعة واستكشف المنصة بدون أي التزام مادي.',
        amount: 0,
        features: ['لوحة تحكم أساسية', 'عدد محدود من المشاريع (3 كحد أقصى)', 'دعم عبر البريد الإلكتروني'],
      },
      {
        id: 'basic',
        title: 'الخطة الأساسية',
        description: 'مناسبة للأفراد والمستقلين الذين يبحثون عن إنتاجية أعلى.',
        amount: 149,
        badge: 'الأكثر شيوعاً',
        highlight: true,
        features: ['مشاريع غير محدودة', 'الوصول لقوالب التصميم المتقدمة', 'أولوية في الدعم الفني', 'مزايا تنظيم وإدارة محسنة'],
      },
      {
        id: 'pro',
        title: 'الخطة المتقدمة',
        description: 'للشركات والفرق التي تحتاج تحكم كامل وتجربة خالية من القيود.',
        amount: 299,
        features: ['كل مزايا الخطة الأساسية', 'إدارة صلاحيات فريق العمل', 'تخصيصات أعمق للواجهة', 'دعم فني فوري (Live Chat)'],
      },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100" dir="rtl">
      {/* خلفيات مضيئة (Gradients) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[90px]" />
        <div className="absolute -bottom-32 left-0 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-[90px]" />
        <div className="absolute -bottom-32 right-0 h-[520px] w-[520px] rounded-full bg-violet-500/10 blur-[90px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        
        {/* الهيدر */}
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            خطط أسعار Tolzy
          </div>
          <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            خطط مرنة لتبدأ بسرعة وتكبر بثقة
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-300 sm:text-base">
            اختر الخطة التي تناسب احتياجاتك. (يرجى تسجيل الدخول للاشتراك في الخطط المدفوعة).
          </p>
        </header>

        {/* قسم الحالة والمميزات العامة (Bento Layout) */}
        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur sm:p-8 lg:col-span-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 transition hover:bg-white/10">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Zap className="h-4 w-4 text-cyan-300" />
                  سرعة وأداء
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">تجربة سلسة ومتجاوبة بالكامل على الموبايل والديسكتوب.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 transition hover:bg-white/10">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Check className="h-4 w-4 text-emerald-300" />
                  تفعيل فوري
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">بمجرد إتمام الدفع، يتم تفعيل مميزات خطتك بشكل لحظي.</p>
              </div>
            </div>
          </section>

          {/* مربع حالة حساب المستخدم مع الخطة الحالية */}
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur sm:p-8 lg:col-span-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <UserCircle className="h-4 w-4" />
              حالة الحساب
            </div>
            <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">
                  {authLoading ? 'جاري التحقق...' : user ? userProfile?.displayName || 'مرحباً بك' : 'غير مسجل الدخول'}
                </div>
                {user && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    currentUserPlan === 'free' 
                      ? 'bg-slate-500/20 text-slate-300' 
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    <Crown className="h-3 w-3" />
                    {getPlanDisplayName(currentUserPlan)}
                  </span>
                )}
              </div>
              <div className="mt-1 break-words text-sm text-cyan-200">
                {user ? user.email : 'سجل الدخول لإتمام الاشتراك.'}
              </div>
              {user && currentUserPlan !== 'free' && (
                <div className="mt-3 text-xs text-slate-400">
                  أنت مشترك حالياً في خطة <span className="text-cyan-300 font-semibold">{getPlanDisplayName(currentUserPlan)}</span>
                </div>
              )}
              {!user && !authLoading && (
                <button
                  type="button"
                  onClick={() => router.push('/auth')}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  تسجيل الدخول
                </button>
              )}
            </div>
          </aside>
        </div>

        {/* كروت الأسعار مع تمييز الخطة الحالية */}
        <section className="mt-8 grid gap-6 md:grid-cols-3 items-start">
          {plans.map((plan) => {
            const isCurrentPlan = user && plan.id === currentPricingPlanId;
            const cardBase = 'group relative flex flex-col overflow-hidden rounded-3xl border bg-white/5 p-6 shadow-sm backdrop-blur transition duration-300 hover:bg-white/[0.07] sm:p-7';
            const heightClass = plan.highlight && !isCurrentPlan ? 'md:h-[105%] z-10' : 'h-full';
            
            // Border styling: current plan gets special border, highlighted plan gets cyan glow
            let cardBorder = 'border-white/10';
            if (isCurrentPlan) {
              cardBorder = 'border-emerald-400/50 shadow-[0_0_30px_rgba(52,211,153,0.15)]';
            } else if (plan.highlight) {
              cardBorder = 'border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.15)]';
            }

            return (
              <div key={plan.id} className={`${cardBase} ${cardBorder} ${heightClass}`}>
                {isCurrentPlan ? (
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
                  </div>
                ) : plan.highlight ? (
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent" />
                  </div>
                ) : null}

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xl font-bold text-white">{plan.title}</div>
                      <div className="mt-2 text-sm leading-relaxed text-slate-300">{plan.description}</div>
                    </div>
                    {isCurrentPlan && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
                        <Check className="h-3 w-3" />
                        خطتك الحالية
                      </span>
                    )}
                  </div>
                  
                  {plan.badge && !isCurrentPlan && (
                    <div className="mt-4 inline-table">
                      <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="mt-6 flex items-end gap-2">
                    <div className="text-4xl font-bold tracking-tight text-white">{formatEGP(plan.amount)}</div>
                    {plan.amount > 0 && <div className="pb-1 text-sm text-slate-400">/ شهرياً</div>}
                  </div>

                  <div className="mt-6 h-px w-full bg-white/10" />

                  <ul className="mt-6 space-y-4 text-sm text-slate-200 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="leading-relaxed text-slate-300">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {!user ? (
                      <button
                        type="button"
                        onClick={() => router.push('/auth')}
                        className={
                          plan.highlight
                            ? 'inline-flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3.5 text-sm font-bold text-slate-950 transition duration-200 hover:bg-cyan-400'
                            : 'inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white transition duration-200 hover:bg-white/20'
                        }
                      >
                        سجل الدخول للاشتراك
                      </button>
                    ) : isCurrentPlan ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-sm font-bold text-emerald-300 cursor-default"
                      >
                        <Check className="ml-2 h-4 w-4" />
                        خطتك الحالية
                      </button>
                    ) : plan.amount === 0 ? (
                      <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white transition duration-200 hover:bg-white/20"
                      >
                        الذهاب للوحة التحكم
                      </button>
                    ) : (
                      <CheckoutButton
                        amount={plan.amount}
                        userEmail={user.email || ''}
                        userId={user.uid}
                        className={
                          plan.highlight
                            ? 'inline-flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3.5 text-sm font-bold text-slate-950 transition duration-200 hover:bg-cyan-400 disabled:opacity-70'
                            : 'inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white transition duration-200 hover:bg-white/20 disabled:opacity-70'
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}