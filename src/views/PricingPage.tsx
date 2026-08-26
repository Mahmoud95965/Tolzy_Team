'use client';

import { useState, useEffect } from 'react';
import { 
  Check, ArrowRight, Wallet, X, Upload, Loader, 
  Copy, CheckCircle2, Shield, Sparkles, HelpCircle, Phone, Send,
  Download, Clock, ExternalLink, CreditCard, Zap, CheckCheck, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import UserProfile from '@/src/components/auth/UserProfile';

interface Plan {
  id: 'free' | 'pro' | 'max';
  title: string;
  badge?: string;
  subtitle: string;
  priceEgp: number;
  priceUsd: number;
  tokenCount: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
}

export default function PricingPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [isManualPaymentModalOpen, setIsManualPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState<'free' | 'pro' | 'max'>('pro');
  
  // XPay Payment Integration states
  const [paymentMode, setPaymentMode] = useState<'xpay' | 'manual'>('xpay');
  const [isXPayLoading, setIsXPayLoading] = useState(false);
  const [xpaySuccessModalOpen, setXpaySuccessModalOpen] = useState(false);
  const [xpaySuccessPlan, setXpaySuccessPlan] = useState<'pro' | 'max'>('pro');
  const [xpaySuccessTokens, setXpaySuccessTokens] = useState<number>(500000);
  
  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoStatus, setPromoStatus] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState(true);
  const { user } = useAuth();
  
  // Clean, official prices requested by the user with 50% discount on TOLZY2030
  const PRO_ORIGINAL_PRICE = 650;
  const PRO_PROMO_PRICE = 325; // 50% off
  const MAX_ORIGINAL_PRICE = 1950;
  const MAX_PROMO_PRICE = 975; // 50% off

  // File upload validation constants
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const VALID_PROMO_CODES: { [key: string]: boolean } = {
    'TOLZY2030': true,
  };

  // Payment details
  const whatsappNumber = '201026795965';
  const vodafoneCash = '01026795965';
  const instapay = 'mahmoud159208@instapay';

  const [activePlan, setActivePlan] = useState<'free' | 'pro' | 'max' | 'admin'>('free');

  // Handle XPay return redirect verification
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const xpayStatus = urlParams.get('xpay');
    const sessionId = urlParams.get('session_id');

    if (xpayStatus === 'success' && sessionId) {
      const verifyXPay = async () => {
        try {
          const res = await fetch(`/api/payment/xpay/verify?session_id=${sessionId}`);
          const data = await res.json();
          if (data.success) {
            const planResult = data.plan === 'max' ? 'max' : 'pro';
            setXpaySuccessPlan(planResult);
            setXpaySuccessTokens(planResult === 'max' ? 2500000 : 500000);
            setActivePlan(planResult);
            setXpaySuccessModalOpen(true);
          }
        } catch (e) {
          console.error('Failed to verify XPay session on load:', e);
        }
      };
      verifyXPay();
    }
  }, []);

  useEffect(() => {
    const fetchPromoStatus = async () => {
      try {
        const res = await fetch('/api/promo/status');
        const data = await res.json();
        setPromoStatus(data);
      } catch (error) {
        console.error('Failed to fetch promo status:', error);
        setPromoStatus({ is_available: true, remaining_seats: 10 });
      } finally {
        setPromoLoading(false);
      }
    };
    fetchPromoStatus();
  }, []);

  // Fetch the user's true active plan from DB
  useEffect(() => {
    if (!user?.uid) {
      setActivePlan('free');
      return;
    }
    const fetchUserPlan = async () => {
      try {
        let detectedPlan = 'free';
        const res = await fetch(`/api/user/token-usage?userId=${user.uid}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          detectedPlan = String(data.plan || 'free').toLowerCase();
        }

        if (detectedPlan === 'free') {
          const planRes = await fetch(`/api/user/plan?uid=${encodeURIComponent(user.uid)}`, { cache: 'no-store' });
          if (planRes.ok) {
            const planData = await planRes.json();
            if (planData?.plan && planData.plan !== 'free') {
              detectedPlan = String(planData.plan).toLowerCase();
            }
          }
        }

        if (detectedPlan.includes('admin') || user.email === 'mahmoud.m.moussa5310@gmail.com') {
          setActivePlan('admin');
        } else if (detectedPlan.includes('max') || detectedPlan.includes('ultra') || detectedPlan.includes('studio')) {
          setActivePlan('max');
        } else if (detectedPlan.includes('pro') || detectedPlan.includes('plus') || detectedPlan.includes('premium')) {
          setActivePlan('pro');
        } else {
          setActivePlan('free');
        }
      } catch (e) {
        console.error('Failed to fetch user plan on PricingPage:', e);
      }
    };
    fetchUserPlan();
  }, [user?.uid, user?.email]);

  const handlePromoCodeChange = (value: string) => {
    const upperValue = value.toUpperCase().trim();
    setPromoCode(upperValue);
    
    const isSoldOut = !promoStatus?.is_available || promoStatus?.remaining_seats === 0;
    
    if (upperValue === '') {
      setPromoApplied(false);
      setPromoError('');
    } else if (isSoldOut) {
      setPromoApplied(false);
      setPromoError('✗ عذراً، نفدت جميع مقاعد كود الخصم');
    } else if (VALID_PROMO_CODES[upperValue] && promoStatus?.is_available) {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoApplied(false);
      setPromoError('✗ كود الخصم غير صحيح أو منتهي الصلاحية');
    }
  };

  const getPlanPrice = (planId: 'free' | 'pro' | 'max') => {
    if (planId === 'free') return 0;
    if (planId === 'max') {
      return promoApplied && (promoStatus?.remaining_seats > 0) ? MAX_PROMO_PRICE : MAX_ORIGINAL_PRICE;
    }
    return promoApplied && (promoStatus?.remaining_seats > 0) ? PRO_PROMO_PRICE : PRO_ORIGINAL_PRICE;
  };

  const currentPrice = getPlanPrice(selectedPlanId);
  
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getCtaInfo = (planId: 'free' | 'pro' | 'max') => {
    if (!user) {
      if (planId === 'free') return { text: 'ابدأ مجاناً', disabled: false, isCurrent: false };
      if (planId === 'pro') return { text: 'ابدأ مع Pro', disabled: false, isCurrent: false };
      return { text: 'ابدأ مع MAX', disabled: false, isCurrent: false };
    }

    if (activePlan === 'admin') {
      if (planId === 'max') return { text: '✓ مشمولة (حساب الإدارة 👑)', disabled: true, isCurrent: true };
      return { text: '✓ مشمولة في حسابك', disabled: true, isCurrent: false };
    }

    if (activePlan === 'max') {
      if (planId === 'max') return { text: '✓ خطتك الحالية النشطة 👑', disabled: true, isCurrent: true };
      return { text: 'مشمولة في باقة MAX', disabled: true, isCurrent: false };
    }

    if (activePlan === 'pro') {
      if (planId === 'pro') return { text: '✓ خطتك الحالية النشطة ⭐', disabled: true, isCurrent: true };
      if (planId === 'free') return { text: 'الخطة السابقة', disabled: true, isCurrent: false };
      return { text: 'ترقية إلى MAX (2.5M)', disabled: false, isCurrent: false };
    }

    // Default free user
    if (planId === 'free') return { text: '✓ خطتك الحالية', disabled: true, isCurrent: true };
    if (planId === 'pro') return { text: 'ترقية إلى Pro (500K)', disabled: false, isCurrent: false };
    return { text: 'ترقية إلى MAX (2.5M)', disabled: false, isCurrent: false };
  };

  const handleCheckout = (planId: 'free' | 'pro' | 'max') => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    const cta = getCtaInfo(planId);
    if (cta.isCurrent || cta.disabled) {
      window.location.href = '/tools';
      return;
    }
    setSelectedPlanId(planId);
    setPaymentMode('xpay');
    setPaymentStep(1);
    setIsManualPaymentModalOpen(true);
  };

  const handleXPayCheckout = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    setIsXPayLoading(true);
    try {
      const res = await fetch('/api/payment/xpay/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlanId,
          promoCode: promoApplied ? promoCode : '',
          userId: user.uid,
          userEmail: user.email || '',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'فشل إنشاء جلسة الدفع عبر XPay');
      }
      // Redirect directly to XPay Checkout
      window.location.href = data.url;
    } catch (e: any) {
      alert(e.message || 'حدث خطأ أثناء الاتصال ببوابة XPay');
      setIsXPayLoading(false);
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty or failed to process image.'));
              return;
            }
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
            resolve(compressedFile);
          }, 'image/jpeg', 0.7);
        };
        img.onerror = () => reject(new Error('Failed to load image for compression.'));
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const validFormats = ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ');
      alert(`❌ نوع الملف غير مدعوم.\nالصيغ المسموح بها: ${validFormats}`);
      e.target.value = ''; 
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`❌ حجم الملف يتجاوز الحد الأقصى (${MAX_FILE_SIZE_MB}MB)`);
      e.target.value = ''; 
      return;
    }

    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setReceiptFile(compressed);
    } catch (error) {
      alert('❌ حدث خطأ أثناء معالجة الصورة، يرجى المحاولة مرة أخرى.');
      console.error('Image compression error:', error);
    } finally {
      setCompressing(false);
    }
  };

  const [submittedReceiptUrl, setSubmittedReceiptUrl] = useState<string | null>(null);

  const handleSubmitReceipt = async () => {
    if (!firstName || !lastName || !phoneNumber || !receiptFile) {
      alert('يرجى استكمال جميع البيانات وإرفاق صورة الإيصال');
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const fileName = `receipts/${Date.now()}-${receiptFile.name}`;
      
      const { error: uploadError } = await supabase.storage.from('payments').upload(fileName, receiptFile);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('payments').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      // Submit payment request to backend API (saves in DB and notifies Admin via email)
      const res = await fetch('/api/payment/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          userEmail: user?.email,
          firstName,
          lastName,
          phoneNumber,
          plan: selectedPlanId,
          amount: currentPrice,
          promoCode: promoApplied ? promoCode : null,
          receiptUrl: publicUrl
        })
      });

      if (!res.ok) {
        throw new Error('فشل إرسال طلب الاشتراك');
      }

      setSubmittedReceiptUrl(publicUrl);
      
      // Advance to in-app confirmation (NO WhatsApp redirect, strictly waiting for admin)
      setPaymentStep(4);

    } catch (error: any) {
      console.error('Payment submit error:', error);
      alert('❌ حدث خطأ أثناء إرسال البيانات، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUploading(false);
    }
  };

  const plans: Plan[] = [
    {
      id: 'free',
      title: 'الخطة المجانية — Free Plan',
      subtitle: 'البداية المثالية لتجربة قوة الذكاء الاصطناعي واستكشاف المنظومة.',
      priceEgp: 0,
      priceUsd: 0,
      tokenCount: '10,000 توكن ترحيبي',
      features: [
        '10,000 توكن ترحيبي للاستخدام الفوري.',
        'تجربة تلخيص وتحليل الفيديوهات في OmniLearn (حتى 3 فيديوهات).',
        'تخطيط أولي لمشروع برمجي واحد عبر TOLZY Build.',
        'استكشاف مكتبة الأوامر ودليل الأدوات الذكية في Directory & Prompts.',
        'وصول للنماذج الأساسية بسرعة استجابة قياسية.',
      ],
      cta: 'أنت في الخطة المجانية حالياً',
      isPopular: false,
    },
    {
      id: 'pro',
      title: 'الخطة الاحترافية — Pro Plan',
      badge: 'الأكثر شيوعاً / Most Popular',
      subtitle: 'للمطورين، الطلاب، وصناع المحتوى الذين يبحثون عن أقصى إنتاجية يومية.',
      priceEgp: PRO_ORIGINAL_PRICE,
      priceUsd: 19,
      tokenCount: '500,000 توكن شهرياً',
      features: [
        '500,000 توكن شهرياً مدعومة بنماذج الذكاء الاصطناعي الفائقة.',
        'توليد وتصميم الصور الاحترافية فائقة الدقة عبر TOLZY Image (Flux-2 Pro).',
        'استخدام غير محدود لتحليل واستكشاف الأدوات البرمجية والمستشار الذكي AXIOM.',
        'استخدام غير محدود لتحليل المحاضرات والكويزات في OmniLearn.',
        'توليد معماريات برمجية كاملة (Schemas, Prompts, PRD) عبر TOLZY Build.',
        'تصدير العروض التقديمية والمستندات الذكية عبر TOLZY Flow.',
        'زمن استجابة سريع ودعم فني مباشر عبر المنصة.',
      ],
      cta: 'ترقية إلى Pro',
      isPopular: true,
    },
    {
      id: 'max',
      title: 'خطة الاستوديو والفرق — Max / Studio Plan',
      subtitle: 'للمحترفين، المستقلين الكثيفي الاستخدام، والفرق التقنية الناشئة.',
      priceEgp: MAX_ORIGINAL_PRICE,
      priceUsd: 49,
      tokenCount: '2,500,000 توكن شهرياً',
      features: [
        '2,500,000 توكن شهرياً لأداء مكثف وسياق برمجي غير محدود.',
        'توليد صور فائق السرعة وبأعلى دقة 4K بدون حدود عبر TOLZY Image HD (Flux-2 Pro).',
        'أولوية معالجة قصوى (Priority Execution) لجميع الأدوات والمحركات.',
        'استخراج وتصدير مشاريع Build و Flow بصيغ متعددة متكاملة للفرق.',
        'معالجة ملفات ومستندات ضخمة بأعلى سعة سياق مع المستشار الذكي.',
        'شارة العضوية المتقدمة ودعم فني مخصص على مدار الساعة.',
      ],
      cta: 'ترقية إلى MAX',
      isPopular: false,
    },
  ];

  const comparisonFeatures = [
    { name: 'حصة التوكن الذكي (Token Allowance)', free: '10,000 توكن ترحيبي', pro: '500,000 توكن شهرياً', max: '2,500,000 توكن شهرياً' },
    { name: 'المستشار التقني الفائق AXIOM', free: 'وصول قياسي', pro: 'وصول متقدم وسريع', max: 'أولوية قصوى وسياق غير محدود ⚡' },
    { name: 'توليد وتصميم الصور (TOLZY Image Flux-2 Pro)', free: 'غير متوفر (🔒)', pro: 'متاح بالكامل (4K بدقة عالية)', max: 'متاح بأعلى دقة وسرعة قصوى ⚡' },
    { name: 'منصة التعلم الذكي OmniLearn', free: 'حتى 3 فيديوهات', pro: 'استخدام غير محدود وتحليل كامل', max: 'استخدام غير محدود + أولوية معالجة' },
    { name: 'هندسة المشاريع TOLZY Build', free: 'مشروع واحد (تخطيط أولي)', pro: 'معماريات كاملة (SQL, PRD, Prompts)', max: 'تصدير مشاريع متكاملة للفرق بصيغ متعددة' },
    { name: 'العروض والمستندات الذكية TOLZY Flow', free: 'غير متوفر', pro: 'تصدير كامل', max: 'تصدير كامل ومتقدم للفرق' },
    { name: 'معدل الطلبات وأولوية الاستجابة', free: 'سرعة قياسية (5 RPM)', pro: 'استجابة سريعة (30 RPM)', max: 'أولوية معالجة قصوى (80 RPM) ⚡' },
    { name: 'الدعم الفني والخدمة', free: 'دعم المجتمع', pro: 'دعم فني مباشر عبر المنصة', max: 'دعم فني مخصص وشارة العضوية 24/7' },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Top Minimal Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-black text-xl tracking-tight text-black dark:text-white uppercase hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              TOLZY
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              <Link href="/learn" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">تعلّم</Link>
              <Link href="/tools" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">الأدوات</Link>
              <Link href="/pricing" className="text-blue-600 dark:text-blue-400 font-bold">الباقات</Link>
              <Link href="/docs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">الوثائق</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link href="/auth" className="hidden sm:inline-block text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                  تسجيل الدخول
                </Link>
                <Link href="/auth" className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                  ابدأ مجاناً
                </Link>
              </>
            ) : (
              <UserProfile />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        
        {/* Simple & Quiet Header */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 font-medium mb-6">
            <span>خطط واضحة • بدون رسوم خفية</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-black dark:text-white">
            اختر الخطة المناسبة لعملك
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            باقات مدروسة بعناية لتغطية احتياجاتك في النصوص، وهندسة البرمجيات، والتعلم الذكي بأعلى كفاءة.
          </p>

          {/* Minimal Promo Notification */}
          {!promoLoading && promoStatus?.is_available && (
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 text-xs">
              <span className="text-neutral-700 dark:text-neutral-300">
                استخدم كود الخصم <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">TOLZY2030</span> للحصول على خصم 50% فوري
              </span>
            </div>
          )}
        </section>

        {/* Pricing Cards (Clean Monochrome + Blue Accent) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-24">
          {plans.map((plan) => {
            const isPaid = plan.id !== 'free';
            const originalPrice = plan.priceEgp;
            const finalPrice = getPlanPrice(plan.id);
            const ctaInfo = getCtaInfo(plan.id);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between p-7 sm:p-8 rounded-2xl bg-white dark:bg-black border transition-all duration-200 ${
                  ctaInfo.isCurrent
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : plan.isPopular
                    ? 'border-blue-600 dark:border-blue-500 ring-1 ring-blue-600/30 dark:ring-blue-500/30'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}
              >
                {/* Active Plan or Popular Badge */}
                {ctaInfo.isCurrent ? (
                  <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>خطتك الحالية</span>
                  </div>
                ) : plan.badge ? (
                  <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full">
                    {plan.badge}
                  </div>
                ) : null}

                <div>
                  {/* Title & Subtitle */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2 text-black dark:text-white">{plan.title}</h2>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed min-h-[38px]">
                      {plan.subtitle}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-black dark:text-white font-mono">
                        {finalPrice}
                      </span>
                      <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
                        ج.م <span className="text-xs font-normal text-neutral-500">/ شهرياً</span>
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-2 text-xs text-neutral-500 font-mono">
                      <span>أو ${plan.priceUsd} / month</span>
                      {promoApplied && isPaid && (
                        <span className="line-through text-neutral-400">{originalPrice} ج.م</span>
                      )}
                    </div>

                    <div className="mt-3">
                      <span className="inline-block text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-200/40 dark:border-blue-800/40">
                        {plan.tokenCount}
                      </span>
                    </div>
                  </div>

                  {/* Promo Input for Paid plans */}
                  {isPaid && (
                    <div className="mb-6">
                      <input
                        type="text"
                        placeholder="كود الخصم (TOLZY2030)"
                        value={promoCode}
                        onChange={(e) => handlePromoCodeChange(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium bg-neutral-50 dark:bg-neutral-900 border transition-all outline-none ${
                          promoApplied
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 text-black dark:text-white'
                        }`}
                      />
                      {promoError && <p className="text-red-500 text-[11px] mt-1.5">{promoError}</p>}
                    </div>
                  )}

                  {/* Dynamic CTA Button */}
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={ctaInfo.disabled}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all duration-150 mb-8 flex items-center justify-center gap-1.5 ${
                      ctaInfo.isCurrent
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default'
                        : plan.isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : isPaid
                        ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200'
                        : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {ctaInfo.isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    <span>{ctaInfo.text}</span>
                  </button>

                  {/* Features List */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      الميزات المشمولة:
                    </p>
                    {plan.features.map((feature, fidx) => (
                      <div key={fidx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <span className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Feature Comparison Table */}
        <section className="pt-16 border-t border-neutral-200 dark:border-neutral-800">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">
              جدول المقارنة الشامل
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              تفصيل الفروقات التقنية وحصص الاستخدام بين كل خطة
            </p>
          </div>

          <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-4 px-4 font-bold text-neutral-600 dark:text-neutral-400">الخاصية</th>
                  <th className="py-4 px-4 text-center font-bold text-neutral-600 dark:text-neutral-400">الخطة المجانية</th>
                  <th className="py-4 px-4 text-center font-bold text-blue-600 dark:text-blue-400">الخطة الاحترافية (Pro)</th>
                  <th className="py-4 px-4 text-center font-bold text-black dark:text-white">خطة الاستوديو (MAX)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {comparisonFeatures.map((item, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-black dark:text-white">{item.name}</td>
                    <td className="py-3.5 px-4 text-center text-neutral-600 dark:text-neutral-400">{item.free}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600 dark:text-blue-400">{item.pro}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-black dark:text-white">{item.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto pt-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 text-black dark:text-white">
            الأسئلة المتكررة
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'ما هو التوكن (Token) وكيف يتم استهلاكه؟',
                a: 'التوكن هو وحدة قياس معالجة وتوليد النصوص في نماذج الذكاء الاصطناعي (كل 1000 توكن تعادل تقريباً 750 كلمة). يتم حساب الاستهلاك الفعلي بدقة بناءً على حجم السؤال وإجابة النموذج.'
              },
              {
                q: 'هل يتجدد رصيد التوكنات شهرياً؟',
                a: 'نعم، في خطتي Pro و Max يتم تجديد كامل حصة التوكن (500K أو 2.5M) تلقائياً في بداية كل شهر اشتراك.'
              },
              {
                q: 'ما هي طرق الدفع المتاحة لتفعيل الاشتراك؟',
                a: 'نوفر الدفع الفوري والمباشر داخل مصر عبر فودافون كاش وتطبيق إنستاباي (InstaPay)، بالإضافة للتحويلات البنكية للمشتركين دولياً.'
              },
              {
                q: 'كم يستغرق تفعيل الحساب بعد إرسال الإيصال؟',
                a: 'يتم تفعيل الحساب فوراً ومباشرة بمجرد مراجعة وتأكيد صورة الإيصال عبر الواتساب (عادة خلال 15 دقيقة إلى ساعتين كحد أقصى).'
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                <h3 className="font-bold text-sm text-black dark:text-white mb-2">{faq.q}</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-12 text-xs text-neutral-500 text-center">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} TOLZY AI. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">الخصوصية</Link>
            <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">الشروط</Link>
            <Link href="/docs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">المساعدة</Link>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      {isManualPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsManualPaymentModalOpen(false)}
              className="absolute top-5 left-5 p-1.5 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-black dark:text-white">
                تأكيد الاشتراك في {selectedPlanId === 'max' ? 'خطة الاستوديو (MAX)' : 'الخطة الاحترافية (Pro)'}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                المبلغ المطلوب: <span className="font-bold text-blue-600 font-mono">{currentPrice} ج.م</span>
                {promoApplied && <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-1.5">(خصم 50% مطبق)</span>}
              </p>
            </div>

            {/* Payment Mode Selector Tabs (XPay only available for whitelisted testers during trial) */}
            {['m85260877@gmail.com', 'mahmoud.m.moussa5310@gmail.com'].includes(user?.email?.toLowerCase().trim() || '') && (
              <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-900 p-1 mb-6 border border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setPaymentMode('xpay')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    paymentMode === 'xpay'
                      ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-neutral-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>دفع إلكتروني فوري (XPay) [تجريبي] ⚡</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('manual')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    paymentMode === 'manual'
                      ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-neutral-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>تحويل يدوي (فودافون / إنستا)</span>
                </button>
              </div>
            )}

            {/* TAB 1: XPay Direct Checkout (Whitelisted Testers Only) */}
            {paymentMode === 'xpay' && ['m85260877@gmail.com', 'mahmoud.m.moussa5310@gmail.com'].includes(user?.email?.toLowerCase().trim() || '') && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300">بوابة الدفع الإلكترونية XPay</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                      وضع تجريبي (Test Mode)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                    <span className="px-2 py-1 bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800">💳 بطاقات فيزا ومستر كارد وميزة</span>
                    <span className="px-2 py-1 bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800">🏪 فوري (Fawry Pay)</span>
                    <span className="px-2 py-1 bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800">🛍️ فاليو (ValU للتقسيط)</span>
                    <span className="px-2 py-1 bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800">📱 المحافظ الإلكترونية</span>
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    ⚡ يتم تفعيل باقتك تلقائياً وبشكل فوري فور إتمام الدفع بنجاح دون الحاجة لرفع إيصال أو انتظار المراجعة.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">البريد الإلكتروني للحساب</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      dir="ltr"
                      className="w-full px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">الخطة:</span>
                      <span className="font-bold text-black dark:text-white">
                        {selectedPlanId === 'max' ? 'خطة الاستوديو والفرق (2.5M Tokens)' : 'الخطة الاحترافية (500K Tokens)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">المبلغ الإجمالي:</span>
                      <span className="font-bold font-mono text-black dark:text-white">{currentPrice} ج.م</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleXPayCheckout}
                  disabled={isXPayLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {isXPayLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>جاري الاتصال ببوابة XPay...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>المتابعة إلى بوابة الدفع الآمنة XPay ({currentPrice} ج.م)</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 2: Manual Payment Flow */}
            {paymentMode === 'manual' && (
              <>
                {paymentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        dir="ltr"
                        className="w-full px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">الاسم الأول</label>
                        <input
                          type="text"
                          placeholder="محمد"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 text-xs focus:border-blue-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">الاسم الأخير</label>
                        <input
                          type="text"
                          placeholder="فتحي"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 text-xs focus:border-blue-600 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">رقم الهاتف للتواصل عبر واتساب</label>
                      <input
                        type="tel"
                        dir="ltr"
                        placeholder="010XXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 text-xs font-mono focus:border-blue-600 outline-none text-left"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!firstName || !lastName || !phoneNumber) {
                          alert('يرجى استكمال البيانات للمتابعة');
                          return;
                        }
                        setPaymentStep(2);
                      }}
                      className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors mt-4"
                    >
                      التالي: بيانات التحويل
                    </button>
                  </div>
                )}

                {paymentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-3">
                      <div
                        onClick={() => copyToClipboard(vodafoneCash, 'vodafone')}
                        className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:border-neutral-400 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs text-neutral-500 font-semibold mb-0.5">فودافون كاش</p>
                          <p className="text-sm font-bold font-mono" dir="ltr">{vodafoneCash}</p>
                        </div>
                        {copiedText === 'vodafone' ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4 text-neutral-400" />}
                      </div>

                      <div
                        onClick={() => copyToClipboard(instapay, 'instapay')}
                        className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:border-neutral-400 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs text-neutral-500 font-semibold mb-0.5">إنستاباي (InstaPay)</p>
                          <p className="text-sm font-bold font-mono" dir="ltr">{instapay}</p>
                        </div>
                        {copiedText === 'instapay' ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4 text-neutral-400" />}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => setPaymentStep(1)}
                        className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        رجوع
                      </button>
                      <button
                        onClick={() => setPaymentStep(3)}
                        className="flex-[2] py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                      >
                        التالي: إرفاق الإيصال
                      </button>
                    </div>
                  </div>
                )}

                {paymentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <label className="block cursor-pointer">
                      <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${receiptFile ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20' : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400'}`}>
                        {receiptFile ? (
                          <div className="space-y-1">
                            <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-xs font-bold text-black dark:text-white">تم إرفاق الإيصال بنجاح</p>
                            <p className="text-[11px] text-neutral-500 font-mono">{receiptFile.name}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {compressing ? <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600" /> : <Upload className="w-8 h-8 mx-auto text-neutral-400" />}
                            <p className="text-xs font-bold text-black dark:text-white">اضغط هنا لرفع صورة إيصال التحويل</p>
                            <p className="text-[11px] text-neutral-500 font-mono">JPG, PNG (بحد أقصى 5MB)</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileUpload} disabled={compressing} className="hidden" />
                      </div>
                    </label>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={handleSubmitReceipt}
                        disabled={isUploading || compressing || !receiptFile}
                        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        {isUploading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>جاري رفع الإيصال وإشعار المسؤول...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>تأكيد إرسال طلب الاشتراك للإدارة</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setPaymentStep(2)}
                        disabled={isUploading}
                        className="text-xs text-neutral-500 hover:text-black dark:hover:text-white py-1 transition-colors text-center"
                      >
                        تعديل طريقة الدفع
                      </button>
                    </div>
                  </div>
                )}

                {paymentStep === 4 && (
                  <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                      <Clock className="w-8 h-8 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-black dark:text-white">
                        جاري معالجة وتأكيد الحساب من قِبل الإدارة...
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
                        تم استلام صورة الإيصال وبيانات طلبك بنجاح! تم إشعار إدارة المنصة لمراجعة التحويل وتفعيل باقتك فور التحقق.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-right space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">الباقة المطلوبة:</span>
                        <span className="font-bold text-black dark:text-white">
                          {selectedPlanId === 'max' ? 'خطة الاستوديو والفرق (MAX 2.5M) 👑' : 'الخطة الاحترافية (Pro 500K) ⭐'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">المبلغ المدفوع:</span>
                        <span className="font-bold font-mono text-black dark:text-white">{currentPrice} ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">حالة الطلب:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping inline-block"></span>
                          قيد المراجعة والتدقيق من قِبل المسؤول
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      {submittedReceiptUrl && (
                        <a
                          href={submittedReceiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-3 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-2 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>معاينة وتحميل الإيصال</span>
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setIsManualPaymentModalOpen(false);
                          setPaymentStep(1);
                          setReceiptFile(null);
                          setFirstName('');
                          setLastName('');
                          setPhoneNumber('');
                        }}
                        className="flex-1 py-3 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                      >
                        متابعة التصفح
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* XPay Success Celebration Modal */}
      {xpaySuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-950 border border-emerald-200 dark:border-emerald-800/40 shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500" />
            
            <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 text-3xl">
              ✨
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              تهانينا! تم تفعيل اشتراكك بنجاح 🎉
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              تم التحقق من عملية الدفع عبر بوابة <span className="font-bold text-blue-600">XPay</span> وتم ترقية حسابك وإضافة كامل حصتك من التوكن الذكي!
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-right space-y-2 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">الخطة النشطة:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {xpaySuccessPlan === 'max' ? 'خطة الاستوديو والفرق (MAX) 👑' : 'الخطة الاحترافية (Pro) ⭐'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">حصة التوكن المتاحة:</span>
                <span className="font-bold font-mono text-black dark:text-white">
                  {xpaySuccessTokens.toLocaleString('ar-EG')} توكن شهرياً
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">بوابة الدفع:</span>
                <span className="font-bold text-blue-600">XPay Gateway ⚡</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/tools"
                onClick={() => setXpaySuccessModalOpen(false)}
                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xs hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <span>ابدأ استخدام الأدوات 🚀</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

