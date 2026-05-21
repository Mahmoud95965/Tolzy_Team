'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Phone, Send, Wallet, X, Upload, Loader, Check, Zap, Gift, Copy, Sparkles, Rocket, Brain, HelpCircle, Shield, CreditCard, ChevronDown, CheckCircle2, MinusCircle } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700;800;900&display=swap');

  .font-display {
    font-family: 'Cairo', sans-serif;
  }
  .font-body {
    font-family: 'Cairo', sans-serif;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.3);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.5);
  }
  
  /* Smooth transitions */
  * {
    transition-property: background-color, border-color, color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
  }
`;

interface Plan {
  title: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  serviceKey?: string;
  isPro?: boolean;
  icon: any;
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
  
  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoStatus, setPromoStatus] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState(true);
  const { user } = useAuth();
  
  // Pricing constants
  const ORIGINAL_PRICE = 299;
  const PROMO_PRICE = 209;

  // File upload validation constants
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const VALID_PROMO_CODES: { [key: string]: number } = {
    'MOFATHY10': PROMO_PRICE,
  };

  // Payment details
  const whatsappNumber = '201027016529';
  const vodafoneCash = '01027016529';
  const instapay = 'mahmoud159208@instapay';

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

  const handlePromoCodeChange = (value: string) => {
    const upperValue = value.toUpperCase().trim();
    setPromoCode(upperValue);
    
    const isSoldOut = !promoStatus?.is_available || promoStatus?.remaining_seats === 0;
    
    if (upperValue === '') {
      setPromoApplied(false);
      setPromoError('');
    } else if (isSoldOut) {
      setPromoApplied(false);
      setPromoError('✗ عذراً، نفدت جميع مقاعد العرض الخاص');
    } else if (VALID_PROMO_CODES[upperValue] && promoStatus?.is_available) {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoApplied(false);
      setPromoError('✗ كود الخصم غير صحيح أو منتهي الصلاحية');
    }
  };

  const currentPrice = promoApplied && (promoStatus?.remaining_seats > 0) ? PROMO_PRICE : ORIGINAL_PRICE;
  
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCheckout = () => {
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً للمتابعة');
      return;
    }
    setPaymentStep(1);
    setIsManualPaymentModalOpen(true);
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

  const handleSendViaWhatsApp = async () => {
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
      
      try {
        const { error: uploadError } = await supabase.storage.from('payments').upload(fileName, receiptFile);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('payments').getPublicUrl(fileName);

        if (promoApplied && promoStatus?.is_available) {
          try {
            const { data: currentPromo } = await supabase
              .from('promotions')
              .select('mofathy_promo_count')
              .eq('id', 1)
              .single();

            const currentCount = currentPromo?.mofathy_promo_count || 0;
            if (currentCount < 10) {
              await supabase
                .from('promotions')
                .update({ mofathy_promo_count: currentCount + 1 })
                .eq('id', 1);
              
              const res = await fetch('/api/promo/status');
              const newStatus = await res.json();
              setPromoStatus(newStatus);
            }
          } catch (updateError) {
            console.error('⚠️ Promo counter update failed:', updateError);
          }
        }

        if (user?.uid) {
          try {
            await supabase
              .from('user_limits')
              .upsert({
                user_id: user.uid,
                plan: 'pro',
                email: user?.email || '',
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });
          } catch (subscriptionError) {
            console.error('⚠️ DB activation error:', subscriptionError);
          }
        }

        const message = `🎉 طلب اشتراك جديد (Tolzy Pro)\n\n👤 الاسم: ${firstName} ${lastName}\n📧 البريد: ${user?.email}\n📱 الجوال: ${phoneNumber}\n💰 المبلغ: ${currentPrice} ج.م\n${promoApplied ? `🎁 كود الخصم: ${promoCode}` : ''}\n\nرابط الإيصال: ${data.publicUrl}`;

        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');

        setIsManualPaymentModalOpen(false);
        setFirstName('');
        setLastName('');
        setPhoneNumber('');
        setReceiptFile(null);
      } catch (storageError: any) {
        alert('❌ واجهتنا مشكلة أثناء رفع الإيصال. الرجاء المحاولة مجدداً.');
        console.error(storageError);
      }
    } catch (error) {
      alert('حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.');
    } finally {
      setIsUploading(false);
    }
  };

  const plans: Plan[] = [
    {
      title: 'الباقة الأساسية',
      price: 0,
      icon: Brain,
      description: 'انطلاقة مثالية لتجربة أدوات الذكاء الاصطناعي مجاناً وبلا التزامات، تتيح لك اكتشاف قدرات المنصة.',
      features: ['10 طلبات ذكية يومياً', 'وصول لأكثر من 630 أداة متخصصة', '🤖 مساعد Tolzy الأساسي', '⚡ أداء مستقر للسيرفرات'],
      cta: 'ابدأ مجاناً الآن',
      isPro: false,
    },
    {
      title: 'باقة المحترفين (Pro)',
      price: ORIGINAL_PRICE,
      icon: Rocket,
      description: 'أطلق العنان لإنتاجيتك مع صلاحيات كاملة وأدوات مصممة خصيصاً للمحترفين وصناع المحتوى.',
      features: [
        '♾️ استخدام غير محدود لجميع الأدوات',
        '🧠 وصول حصري لنموذج المفكر (Thinker)',
        '🚀 مساعد V2.5 المُطور',
        '⚡ أولوية قصوى على السيرفرات السريعة',
        '🎟️ وصول مبكر لمنصة Tolzy Hex',
        '👨‍💼 أولوية في الدعم الفني',
      ],
      cta: 'اشترك الآن عبر فودافون كاش',
      serviceKey: 'pro',
      isPro: true,
    },
  ];

  const comparisonFeatures = [
    { name: 'الطلبات اليومية', free: '10 طلبات ذكية', pro: 'عدد غير محدود' },
    { name: 'الوصول للأدوات', free: 'أكثر من 630 أداة', pro: 'كافة الأدوات المتقدمة' },
    { name: 'نموذج المفكر (Thinker)', free: 'غير متاح', pro: 'وصول حصري' },
    { name: 'منصة Tolzy Hex', free: 'غير متاح', pro: 'وصول مبكر' },
    { name: 'أولوية الدعم الفني', free: 'عادي', pro: 'أولوية قصوى' },
    { name: 'سرعة السيرفرات', free: 'مستقرة', pro: 'السرعة القصوى' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div dir="rtl" className="min-h-screen bg-[#fbf9f6] dark:bg-[#050507] text-[#1b1c1a] dark:text-slate-200 transition-colors duration-300 font-body antialiased">
        
        {/* TopNavBar */}
        <header className="fixed top-0 w-full z-50 bg-[#fbf9f6]/80 dark:bg-[#050507]/80 backdrop-blur-md border-b border-[#d5c3b9] dark:border-slate-800/60 h-16">
          <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center h-full">
            <div className="flex items-center gap-12">
              <Link href="/" className="font-display text-2xl font-black tracking-tight text-[#1b1c1a] dark:text-white uppercase">Tolzy</Link>
              <nav className="hidden md:flex gap-8 items-center">
                <Link href="/learn" className="text-[#464742] dark:text-slate-400 font-semibold hover:text-black dark:hover:text-white transition-colors">تعلّم</Link>
                <Link href="/tools" className="text-[#464742] dark:text-slate-400 font-semibold hover:text-black dark:hover:text-white transition-colors">الأدوات</Link>
                <Link href="/pricing" className="text-black dark:text-white font-bold border-b-2 border-black dark:border-white pb-1">الباقات</Link>
                <Link href="/docs" className="text-[#464742] dark:text-slate-400 font-semibold hover:text-black dark:hover:text-white transition-colors">الوثائق</Link>
              </nav>
            </div>
            <div className="flex items-center gap-6">
              {!user ? (
                <>
                  <Link href="/auth" className="hidden md:inline-block font-bold text-sm hover:opacity-70 transition-opacity">تسجيل الدخول</Link>
                  <Link href="/auth" className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all">ابدأ مجاناً</Link>
                </>
              ) : (
                <Link href="/profile" className="flex items-center gap-2 font-bold text-sm bg-white dark:bg-slate-900 border border-[#d5c3b9] dark:border-slate-800 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-6 h-6 rounded-full bg-[#7e5538] text-white flex items-center justify-center text-[10px] font-sans">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">حسابي</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="pt-32 pb-24">
          
          {/* Hero Section */}
          <section className="max-w-[1200px] mx-auto px-6 text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#e3e3de] dark:bg-slate-900 border border-[#d5c3b9] dark:border-slate-800 text-[#464742] dark:text-slate-400 text-xs font-bold uppercase tracking-wide mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#7e5538]" />
              <span>خطط أسعار جديدة كلياً</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-8 text-[#1b1c1a] dark:text-white leading-tight">
              استثمر في <span className="text-[#7e5538] dark:text-[#f0bc97]">ذكائك</span>
            </h1>
            <p className="text-xl text-[#464742] dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
              اختر الباقة التي تناسب طموحاتك. أدوات ذكاء اصطناعي قوية صُممت خصيصاً لتلبي احتياجات المبدعين والمطورين والمحترفين.
            </p>

            {/* Promo Banner Integrated */}
            {!promoLoading && promoStatus?.is_available && promoStatus?.remaining_seats > 0 && (
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-[#ffdcc5] dark:bg-[#301400] p-4 rounded-2xl border border-[#d4a27f] dark:border-[#633e23] shadow-md mb-12 transform hover:scale-[1.02] transition-transform">
                <p className="font-bold text-sm text-[#633e23] dark:text-[#f0bc97] flex items-center gap-2">
                  <span>🔥 عرض حصري: استخدم كود</span>
                  <span className="bg-[#f0bc97] dark:bg-[#633e23] px-2.5 py-1 rounded-md font-black font-sans tracking-widest text-black dark:text-white">MOFATHY10</span>
                  <span>لتحصل على الاشتراك بسعر <span className="font-black text-lg">209 ج.م</span></span>
                </p>
                <div className="flex items-center gap-2 bg-white/60 dark:bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-[12px] font-bold text-[#633e23] dark:text-[#f0bc97]">متبقي {promoStatus.remaining_seats} مقاعد فقط</span>
                </div>
              </div>
            )}
          </section>

          {/* Pricing Grid */}
          <section className="max-w-[1000px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {plans.map((plan) => (
              <div
                key={plan.title}
                className={`bg-white dark:bg-slate-900/50 border ${plan.isPro ? 'border-[#7e5538] ring-2 ring-[#7e5538]/20 relative' : 'border-[#d5c3b9] dark:border-slate-800 mt-0 md:mt-6'} p-8 md:p-10 rounded-[2rem] flex flex-col transition-all duration-500 hover:shadow-xl ${plan.isPro ? 'shadow-2xl shadow-[#7e5538]/10' : 'shadow-sm'}`}
              >
                {plan.isPro && (
                  <div className="absolute -top-4 right-8 bg-[#7e5538] text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    الأكثر طلباً
                  </div>
                )}
                <div className="mb-8">
                  <div className={`w-12 h-12 rounded-xl ${plan.isPro ? 'bg-[#7e5538] text-white shadow-lg shadow-[#7e5538]/30' : 'bg-[#e3e3de] dark:bg-slate-800 text-[#1b1c1a] dark:text-white'} flex items-center justify-center mb-6`}>
                    <plan.icon className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-3xl font-bold mb-3 text-[#1b1c1a] dark:text-white">{plan.title}</h2>
                  <p className="text-[#464742] dark:text-slate-400 text-sm leading-relaxed font-medium min-h-[60px]">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-[#1b1c1a] dark:text-white tracking-tight font-sans">
                      {promoApplied && plan.isPro ? currentPrice : plan.price}
                    </span>
                    <span className="text-[#83746c] font-bold text-lg">ج.م <span className="text-sm font-medium opacity-70">/ شهرياً</span></span>
                  </div>
                  {promoApplied && plan.isPro && (
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-[#83746c] line-through text-xl font-sans opacity-60">{plan.price} ج.م</span>
                      <span className="bg-[#f4f4ee] dark:bg-[#1b1c19] text-[#7e5538] dark:text-[#f0bc97] text-xs font-bold px-3 py-1 rounded-full border border-[#d5c3b9] dark:border-slate-800">لقد وفرت {ORIGINAL_PRICE - PROMO_PRICE} ج.م!</span>
                    </div>
                  )}
                </div>

                {plan.isPro && (
                  <div className="mb-8 space-y-4">
                     <div className="p-4 rounded-xl bg-[#fff8e6] dark:bg-[#301400]/40 border border-[#f59e0b]/30 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-bold text-[#1b1c1a] dark:text-white mb-1">تنبيه بخصوص الدفع</p>
                          <p className="text-[#464742] dark:text-slate-300 leading-relaxed">
                            يرجى اختيار <strong>فودافون كاش</strong> للدفع اليدوي لضمان تفعيل حسابك فوراً.
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="هل تمتلك كود خصم؟ (اختياري)"
                          value={promoCode}
                          onChange={(e) => handlePromoCodeChange(e.target.value)}
                          className={`w-full px-5 py-3.5 rounded-xl text-sm font-bold bg-[#fbf9f6] dark:bg-black border-2 transition-all outline-none
                            ${promoApplied 
                              ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10' 
                              : 'border-[#d5c3b9] dark:border-slate-800 focus:border-[#7e5538] dark:focus:border-[#7e5538] placeholder:text-[#83746c]'
                            }`}
                        />
                        {promoApplied && <CheckCircle2 className="absolute left-4 top-3.5 w-5 h-5 text-emerald-500" />}
                        {promoError && <p className="text-red-500 text-xs mt-2 font-bold">{promoError}</p>}
                      </div>
                  </div>
                )}

                <button
                  onClick={() => handleCheckout()}
                  className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 transform active:scale-[0.98] mb-10 shadow-sm ${
                    plan.isPro 
                      ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90 hover:shadow-lg' 
                      : 'bg-white dark:bg-slate-800 text-black dark:text-white border-2 border-[#d5c3b9] dark:border-slate-700 hover:bg-[#f4f4ee] dark:hover:bg-slate-700'
                  }`}
                >
                  {plan.cta}
                </button>

                <div className="space-y-4 flex-grow border-t border-[#d5c3b9]/40 dark:border-slate-800/40 pt-8">
                  <p className="text-xs font-bold text-[#83746c] mb-6">أهم المميزات المشمولة:</p>
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-3 group/item">
                      <div className={`mt-0.5 transition-transform group-hover/item:scale-110 ${plan.isPro ? 'text-[#7e5538]' : 'text-[#83746c]'}`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <span className="text-[#1b1c1a] dark:text-slate-200 text-sm font-semibold leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Feature Comparison */}
          <section className="max-w-[1000px] mx-auto px-6 pt-24 border-t border-[#d5c3b9] dark:border-slate-800">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-[#e3e3de] dark:bg-slate-800 text-[#7e5538] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h2 className="font-display text-4xl font-bold text-[#1b1c1a] dark:text-white">مقارنة شاملة بين الباقات</h2>
            </div>
            
            <div className="overflow-x-auto bg-white dark:bg-slate-900/40 rounded-3xl border border-[#d5c3b9] dark:border-slate-800 shadow-sm p-4 md:p-8">
              <table className="w-full text-right font-body">
                <thead>
                  <tr className="border-b-2 border-[#1b1c1a] dark:border-white">
                    <th className="py-6 px-4 text-sm font-bold text-[#83746c]">الخاصية</th>
                    <th className="py-6 px-4 text-center text-sm font-bold text-[#83746c]">الباقة الأساسية</th>
                    <th className="py-6 px-4 text-center text-sm font-bold text-[#83746c]">باقة المحترفين (Pro)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d5c3b9]/40 dark:divide-slate-800/40">
                  {comparisonFeatures.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#fbf9f6] dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-5 px-4 text-[#1b1c1a] dark:text-white font-bold">{item.name}</td>
                      <td className="py-5 px-4 text-center text-[#464742] dark:text-slate-400 font-medium">{item.free}</td>
                      <td className="py-5 px-4 text-center text-[#7e5538] dark:text-[#f0bc97] font-black">{item.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-3xl mx-auto px-6 pt-32">
            <h2 className="font-display text-4xl font-bold text-center mb-16 text-[#1b1c1a] dark:text-white">الأسئلة الشائعة</h2>
            <div className="space-y-4">
              {[
                { q: 'كم يستغرق تفعيل الحساب بعد الدفع؟', a: 'يستغرق التفعيل عادةً من 15 دقيقة إلى ساعتين كحد أقصى بعد رفع صورة الإيصال بنجاح وتأكيد الطلب.' },
                { q: 'ما هي طرق الدفع المتاحة حالياً؟', a: 'ندعم حالياً الدفع عبر محافظ فودافون كاش، وتطبيق إنستاباي (InstaPay) للتحويلات البنكية داخل مصر.' },
                { q: 'هل يمكنني إلغاء أو تغيير باقتي لاحقاً؟', a: 'نعم بالتأكيد، يمكنك إدارة اشتراكك وتغيير الباقة في أي وقت من خلال إعدادات حسابك الشخصي.' },
                { q: 'هل توجد فترة تجريبية مجانية؟', a: 'الباقة الأساسية لدينا مجانية تماماً وبدون أي التزامات، وتمنحك 10 طلبات يومية لتجربة واكتشاف قوة أدواتنا.' },
              ].map((faq, i) => (
                <details key={i} className="group bg-white dark:bg-slate-900/40 border border-[#d5c3b9] dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-300">
                  <summary className="flex items-center justify-between p-6 md:p-8 cursor-pointer font-bold text-lg text-[#1b1c1a] dark:text-white list-none">
                    <span>{faq.q}</span>
                    <span className="transition-transform duration-300 group-open:rotate-180 text-[#83746c] bg-[#fbf9f6] dark:bg-slate-800 p-2 rounded-full border border-[#d5c3b9] dark:border-slate-700">
                      <ChevronDown className="w-5 h-5" />
                    </span>
                  </summary>
                  <div className="px-6 md:px-8 pb-6 md:pb-8 text-[#464742] dark:text-slate-400 text-base leading-relaxed border-t border-[#f4f4ee] dark:border-slate-800 pt-6 mt-2 font-medium">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-[#1c1c1a] text-[#858382] py-20 mt-10">
          <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1">
              <span className="font-display text-3xl font-black text-[#e5e2e0] mb-6 block uppercase tracking-tighter">Tolzy</span>
              <p className="text-sm font-medium mb-8 leading-relaxed">نبني مستقبل أدوات الذكاء الاصطناعي باللغة العربية لدعم المبدعين والمحترفين.</p>
              <div className="flex gap-4">
                <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#7e5538] hover:text-white transition-all"><Rocket className="w-5 h-5" /></Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#7e5538] hover:text-white transition-all"><Zap className="w-5 h-5" /></Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#7e5538] hover:text-white transition-all"><Brain className="w-5 h-5" /></Link>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[#e5e2e0] font-bold text-sm mb-4 border-b border-white/10 pb-2 inline-block">المنتجات</h4>
              <Link href="/tools" className="hover:text-white transition-colors text-sm">أدوات الذكاء الاصطناعي</Link>
              <Link href="/learn" className="hover:text-white transition-colors text-sm">الدورات التعليمية</Link>
              <Link href="/pricing" className="hover:text-white transition-colors text-sm">خطط الأسعار</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[#e5e2e0] font-bold text-sm mb-4 border-b border-white/10 pb-2 inline-block">المصادر</h4>
              <Link href="/docs" className="hover:text-white transition-colors text-sm">الوثائق البرمجية</Link>
              <Link href="/faq" className="hover:text-white transition-colors text-sm">الأسئلة الشائعة</Link>
              <Link href="/community" className="hover:text-white transition-colors text-sm">المجتمع</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[#e5e2e0] font-bold text-sm mb-4 border-b border-white/10 pb-2 inline-block">الشركة</h4>
              <Link href="/about" className="hover:text-white transition-colors text-sm">من نحن</Link>
              <Link href="/privacy" className="hover:text-white transition-colors text-sm">سياسة الخصوصية</Link>
              <Link href="/terms" className="hover:text-white transition-colors text-sm">شروط الاستخدام</Link>
            </div>
          </div>
          <div className="max-w-[1200px] mx-auto px-6 mt-16 pt-8 border-t border-white/10 text-xs text-center font-medium opacity-60">
            جميع الحقوق محفوظة © {new Date().getFullYear()} شركة Tolzy AI.
          </div>
        </footer>

        {/* Payment Modal */}
        {isManualPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] bg-[#1b1c1a]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-lg max-h-[95vh] overflow-y-auto custom-scrollbar rounded-3xl bg-[#fbf9f6] dark:bg-[#0f172a] border border-[#d5c3b9] dark:border-slate-800 shadow-2xl relative">
              <div className="p-8 md:p-10">
                
                <button
                  type="button"
                  onClick={() => setIsManualPaymentModalOpen(false)}
                  className="absolute top-6 left-6 p-2 rounded-full bg-[#e3e3dd] dark:bg-slate-800 hover:bg-[#dadad5] dark:hover:bg-slate-700 transition-colors text-[#50443d] dark:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-8 pt-2">
                  <div className="w-16 h-16 bg-[#e3e3de] dark:bg-[#7e5538]/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#7e5538]">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#1b1c1a] dark:text-white">تأكيد الاشتراك</h3>
                  
                  {/* Progress Steps */}
                  <div className="flex items-center justify-center gap-2 mt-6" dir="ltr">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${paymentStep === s ? 'w-12 bg-[#7e5538]' : 'w-4 bg-[#d5c3b9] dark:bg-slate-800'}`} />
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Step 1: User Info */}
                  {paymentStep === 1 && (
                    <div className="space-y-5 animate-in slide-in-from-right-4">
                      <div className="flex items-center gap-2 text-[#7e5538] font-bold text-sm mb-4">
                        <span className="w-6 h-6 rounded-full bg-[#7e5538]/10 flex items-center justify-center text-xs">1</span>
                        البيانات الشخصية
                      </div>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        dir="ltr"
                        className="w-full px-5 py-4 rounded-xl bg-[#f4f4ee] dark:bg-slate-900 border border-[#d5c3b9] dark:border-slate-800 text-[#83746c] cursor-not-allowed outline-none font-sans font-bold text-left"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="الاسم الأول" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-white dark:bg-black border border-[#d5c3b9] dark:border-slate-800 focus:border-[#7e5538] outline-none transition-all font-bold placeholder:text-[#83746c]" />
                        <input type="text" placeholder="الاسم الأخير" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-white dark:bg-black border border-[#d5c3b9] dark:border-slate-800 focus:border-[#7e5538] outline-none transition-all font-bold placeholder:text-[#83746c]" />
                      </div>
                      <input type="tel" dir="ltr" placeholder="رقم الهاتف (للتواصل عبر واتساب)" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-white dark:bg-black border border-[#d5c3b9] dark:border-slate-800 focus:border-[#7e5538] outline-none transition-all font-bold font-sans placeholder:text-[#83746c] text-left" />
                      <button onClick={() => { if (!firstName || !lastName || !phoneNumber) return alert('يرجى إكمال جميع البيانات أولاً'); setPaymentStep(2); }} className="w-full py-4 rounded-xl font-bold text-white bg-black dark:bg-[#7e5538] hover:opacity-90 transition-all shadow-md mt-6">التالي: تفاصيل الدفع</button>
                    </div>
                  )}

                  {/* Step 2: Payment Methods */}
                  {paymentStep === 2 && (
                    <div className="space-y-5 animate-in slide-in-from-right-4">
                      <div className="flex items-center gap-2 text-[#7e5538] font-bold text-sm mb-4">
                        <span className="w-6 h-6 rounded-full bg-[#7e5538]/10 flex items-center justify-center text-xs">2</span>
                        طرق وأرقام التحويل
                      </div>
                      
                      <div className="grid gap-4">
                        {/* Vodafone Cash */}
                        <div onClick={() => copyToClipboard(vodafoneCash, 'vodafone')} className={`cursor-pointer p-5 rounded-2xl border transition-all ${copiedText === 'vodafone' ? 'bg-[#ffdcc5] border-[#d4a27f]' : 'bg-white dark:bg-black border-[#d5c3b9] dark:border-slate-800 hover:border-[#7e5538] shadow-sm'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600"><Phone className="w-6 h-6" /></div>
                              <div>
                                <p className="text-xs text-[#83746c] font-bold mb-1">فودافون كاش</p>
                                <p className="text-lg font-black font-sans text-[#1b1c1a] dark:text-white" dir="ltr">{vodafoneCash}</p>
                              </div>
                            </div>
                            {copiedText === 'vodafone' ? <Check className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6 text-[#d5c3b9] hover:text-[#7e5538]" />}
                          </div>
                        </div>

                        {/* Instapay */}
                        <div onClick={() => copyToClipboard(instapay, 'instapay')} className={`cursor-pointer p-5 rounded-2xl border transition-all ${copiedText === 'instapay' ? 'bg-[#ffdcc5] border-[#d4a27f]' : 'bg-white dark:bg-black border-[#d5c3b9] dark:border-slate-800 hover:border-[#7e5538] shadow-sm'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600"><Sparkles className="w-6 h-6" /></div>
                              <div>
                                <p className="text-xs text-[#83746c] font-bold mb-1">إنستاباي (InstaPay)</p>
                                <p className="text-sm font-black font-sans text-[#1b1c1a] dark:text-white" dir="ltr">{instapay}</p>
                              </div>
                            </div>
                            {copiedText === 'instapay' ? <Check className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6 text-[#d5c3b9] hover:text-[#7e5538]" />}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-8 pt-2">
                        <button onClick={() => setPaymentStep(1)} className="flex-1 py-4 rounded-xl font-bold bg-[#e3e3dd] hover:bg-[#dadad5] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#1b1c1a] dark:text-white transition-all">رجوع</button>
                        <button onClick={() => setPaymentStep(3)} className="flex-[2] py-4 rounded-xl font-bold text-white bg-black dark:bg-[#7e5538] hover:opacity-90 transition-all shadow-md">التالي: إرفاق الإيصال</button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Upload Receipt */}
                  {paymentStep === 3 && (
                    <div className="space-y-5 animate-in slide-in-from-right-4">
                      <div className="flex items-center gap-2 text-[#7e5538] font-bold text-sm mb-4">
                        <span className="w-6 h-6 rounded-full bg-[#7e5538]/10 flex items-center justify-center text-xs">3</span>
                        المراجعة النهائية
                      </div>
                      
                      <div className="p-5 rounded-2xl bg-[#ffdcc5]/60 dark:bg-[#301400]/60 border border-[#d4a27f]/50 text-center shadow-sm">
                        <p className="text-sm text-[#633e23] dark:text-[#f0bc97] font-bold mb-1">إجمالي المبلغ المطلوب تحويله</p>
                        <p className="font-black text-2xl text-[#633e23] dark:text-[#f0bc97] font-sans">{currentPrice} ج.م</p>
                      </div>

                      <label className="block cursor-pointer mt-4">
                        <div className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${receiptFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-[#d5c3b9] dark:border-slate-700 bg-white dark:bg-black hover:border-[#7e5538] hover:bg-[#fbf9f6] dark:hover:bg-slate-900/50'}`}>
                          {receiptFile ? (
                            <div className="flex flex-col items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold">
                              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-1"><CheckCircle2 className="w-8 h-8" /></div>
                              <span>تم إرفاق الإيصال بنجاح</span>
                              <span className="text-xs font-sans opacity-70">{receiptFile.name}</span>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {compressing ? <Loader className="w-12 h-12 animate-spin mx-auto text-[#7e5538]" /> : <Upload className="w-12 h-12 mx-auto text-[#83746c]" />}
                              <p className="font-bold text-[#1b1c1a] dark:text-white text-lg">اضغط هنا لرفع صورة الإيصال</p>
                              <p className="text-xs text-[#83746c] font-medium font-sans">JPG, PNG (بحد أقصى 5 ميجابايت)</p>
                            </div>
                          )}
                          <input type="file" accept="image/*" onChange={handleFileUpload} disabled={compressing} className="hidden" />
                        </div>
                      </label>

                      <div className="flex flex-col gap-3 mt-8 pt-2">
                        <button onClick={handleSendViaWhatsApp} disabled={isUploading || compressing || !receiptFile} className="w-full py-5 rounded-2xl font-bold text-lg text-white bg-[#25D366] hover:bg-[#128C7E] shadow-[0_10px_20px_-10px_rgba(37,211,102,0.5)] disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                          {isUploading ? <Loader className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 rotate-180" />}
                          <span>تأكيد الطلب وإرسال عبر واتساب</span>
                        </button>
                        <button onClick={() => setPaymentStep(2)} className="w-full py-2 text-sm font-bold text-[#83746c] hover:text-[#1b1c1a] dark:hover:text-white transition-colors">تعديل بيانات الدفع</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
