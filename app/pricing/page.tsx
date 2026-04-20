'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Phone, Send, Wallet, X, Upload, Loader, Check, Zap, Gift, Copy, Sparkles, Rocket, Brain } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { createClient } from '@supabase/supabase-js';

const styles = `
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
`;

interface Plan {
  title: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  serviceKey?: string;
  isPro?: boolean;
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
  const { user, userProfile } = useAuth();
  
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
      setPromoError('✗ عذراً، انتهت جميع مقاعد العرض الخاص');
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
      description: 'انطلاقة مثالية لتجربة أدوات الذكاء الاصطناعي مجاناً وبلا التزامات.',
      features: ['📊 10 طلبات ذكية يومياً', '📚 وصول لأكثر من 630 أداة متخصصة', '🤖 مساعد Tolzy الأساسي', '⚡ أداء مستقر للسيرفرات'],
      cta: 'ابدأ مجاناً الآن',
      isPro: false,
    },
    {
      title: 'باقة المحترفين (Pro)',
      price: ORIGINAL_PRICE,
      description: 'أطلق العنان لإنتاجيتك مع صلاحيات كاملة وأدوات مصممة للمحترفين.',
      features: [
        '♾️ استخدام غير محدود لجميع الأدوات',
        '🧠 وصول حصري لنموذج المفكر (Thinker)',
        '🚀 مساعد الجيار V2.5 المُطور',
        '⚡ أولوية قصوى على السيرفرات السريعة',
        '🎟️ وصول مبكر لمنصة Tolzy Hex',
        '👨‍💼 أولوية في الدعم الفني',
      ],
      cta: 'انضم للمحترفين',
      serviceKey: 'pro',
      isPro: true,
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden font-sans">
        
        {/* Active Promo Banner */}
        {!promoLoading && promoStatus?.is_available && promoStatus?.remaining_seats > 0 && (
          <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-amber-900/40 dark:to-orange-900/40 backdrop-blur-md py-3 px-4 border-b border-amber-200 dark:border-amber-700/50">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <p className="font-bold text-sm sm:text-base text-center text-amber-900 dark:text-amber-100">
                🔥 عرض محدود: استخدم كود <span className="bg-amber-200 dark:bg-amber-600/50 text-amber-900 dark:text-amber-50 px-2 py-0.5 rounded mx-1 font-black">MOFATHY10</span> للحصول على الباقة بـ <span className="font-black">209 ج.م</span>
              </p>
              <span className="bg-amber-900 text-amber-50 dark:bg-amber-500/20 dark:text-amber-200 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                ⏳ المقاعد المتبقية: {promoStatus.remaining_seats}/10
              </span>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-20 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>منصة Tolzy المتكاملة</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-slate-900 dark:text-white tracking-tight">
              استثمر في إنتاجيتك مع خطط تناسب طموحك
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              اختر الباقة المناسبة لاحتياجاتك واستفد من أكثر من 630 أداة ذكية متخصصة لدعم أعمالك.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-start mb-24">
            {plans.map((plan) => (
              <div
                key={plan.title}
                className={`relative flex flex-col p-8 md:p-10 rounded-[2rem] transition-all duration-300 ${
                  plan.isPro 
                    ? 'bg-white dark:bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/10 lg:-mt-4 lg:mb-4'
                    : 'bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none'
                }`}
              >
                {plan.isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                    الأكثر طلباً
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className={`text-2xl font-bold mb-3 ${plan.isPro ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                    {plan.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                      {promoApplied && plan.isPro ? currentPrice : plan.price}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-bold mb-1">ج.م / شهرياً</span>
                  </div>
                  {promoApplied && plan.isPro && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-slate-400 dark:text-slate-500 line-through text-lg">{plan.price} ج.م</span>
                      <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">وفرت {ORIGINAL_PRICE - PROMO_PRICE} ج.م</span>
                    </div>
                  )}
                </div>

                <div className="flex-grow space-y-4 mb-10">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1 rounded-full ${plan.isPro ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                  {plan.isPro && (
                    <div className="relative">
                      {promoStatus?.remaining_seats === 0 ? (
                        <div className="w-full px-4 py-3 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 text-center">
                          انتهت مقاعد العرض المخفض
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="أدخل كود الخصم (اختياري)"
                            value={promoCode}
                            onChange={(e) => handlePromoCodeChange(e.target.value)}
                            className={`w-full px-4 py-3.5 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-950 border transition-all outline-none text-center
                              ${promoApplied 
                                ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10' 
                                : 'border-slate-200 dark:border-slate-800 focus:border-cyan-500 dark:focus:border-cyan-500 placeholder:text-slate-400'
                              }`}
                          />
                          {promoApplied && <Check className="absolute right-4 top-4 w-4 h-4 text-emerald-500" />}
                          {promoError && <p className="text-red-500 text-xs mt-2 text-center font-medium">{promoError}</p>}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={() => plan.isPro && promoStatus?.remaining_seats > 0 ? handleCheckout() : null}
                    disabled={plan.isPro && promoStatus?.remaining_seats === 0}
                    className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 ${
                      promoStatus?.remaining_seats === 0 && plan.isPro
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : plan.isPro
                        ? 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-white shadow-lg'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white'
                    }`}
                  >
                    {plan.isPro && isUploading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : promoStatus?.remaining_seats === 0 && plan.isPro ? 'نفدت المقاعد' : plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-24">
            {[
              { icon: <Brain />, title: 'التحليل العميق', desc: 'وصول مباشر لنماذج متقدمة لحل المشكلات البرمجية والتحليلية المعقدة.' },
              { icon: <Rocket />, title: 'سرعة فائقة', desc: 'أولوية الاستخدام وسرعة استجابة تضمن سير عملك بدون انقطاع.' },
              { icon: <Zap />, title: 'مكتبة أدوات متكاملة', desc: 'تشمل توليد النصوص، الصور، الأكواد، وتحليل البيانات بضغطة زر.' },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/30 transition-colors shadow-sm">
                <div className="w-12 h-12 mb-6 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-black text-center mb-12 text-slate-900 dark:text-white">الأسئلة الشائعة</h2>
            <div className="space-y-4">
              {[
                { q: 'ما هي مميزات باقة Tolzy Pro؟', a: <span>تعرف على جميع المميزات والفوائد التي نقدمها في باقة المحترفين من خلال <a href="#" className="text-cyan-600 dark:text-cyan-400 font-semibold underline">هذا الملف التوضيحي</a>.</span> },
                { q: 'ما هي مدة تفعيل الاشتراك؟', a: 'يتم تفعيل الاشتراك في مدة تتراوح بين 15 دقيقة وساعتين كحد أقصى بعد رفع الإيصال.' },
                { q: 'هل يمكنني الإلغاء في أي وقت؟', a: 'نعم بالتأكيد، يمكنك التوقف عن التجديد متى شئت دون أي التزامات.' },
                { q: 'ما هي طرق الدفع المتاحة؟', a: 'ندعم حالياً التحويل المباشر عبر (فودافون كاش) وتطبيق (InstaPay) داخل مصر.' },
              ].map((faq, i) => (
                <details key={i} className="group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-slate-800 dark:text-slate-200 list-none">
                    {faq.q}
                    <span className="transition-transform group-open:rotate-180 text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            © {new Date().getFullYear()} Tolzy AI. جميع الحقوق محفوظة.
          </p>
        </footer>

        {/* Payment Modal */}
        {isManualPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl relative">
              <div className="p-6 sm:p-8">
                
                <button
                  type="button"
                  onClick={() => setIsManualPaymentModalOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-8 pt-2">
                  <div className="w-14 h-14 bg-cyan-50 dark:bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-cyan-600 dark:text-cyan-400">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">تأكيد الاشتراك</h3>
                  
                  {/* Progress Steps */}
                  <div className="flex items-center justify-center gap-2 mt-6">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${paymentStep === s ? 'w-8 bg-cyan-500' : 'w-2 bg-slate-200 dark:bg-slate-800'}`} />
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Step 1: User Info */}
                  {paymentStep === 1 && (
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-cyan-600 dark:text-cyan-500 uppercase tracking-widest mb-1">الخطوة 1: البيانات الشخصية</p>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed outline-none"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="الاسم الأول" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400" />
                        <input type="text" placeholder="اسم العائلة" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400" />
                      </div>
                      <input type="tel" placeholder="رقم الهاتف (للتواصل)" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400" />
                      <button onClick={() => { if (!firstName || !lastName || !phoneNumber) return alert('يرجى ملء جميع البيانات'); setPaymentStep(2); }} className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 transition-colors mt-2">التالي: طرق الدفع</button>
                    </div>
                  )}

                  {/* Step 2: Payment Methods */}
                  {paymentStep === 2 && (
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-cyan-600 dark:text-cyan-500 uppercase tracking-widest mb-1">الخطوة 2: التحويل البنكي أو المحفظة</p>
                      
                      <div className="grid gap-4">
                        {/* Vodafone Cash */}
                        <div onClick={() => copyToClipboard(vodafoneCash, 'vodafone')} className={`cursor-pointer p-4 rounded-2xl border transition-all ${copiedText === 'vodafone' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-500"><Phone className="w-5 h-5" /></div>
                              <div>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">فودافون كاش</p>
                                <p className="text-lg font-black font-mono text-slate-900 dark:text-white">{vodafoneCash}</p>
                              </div>
                            </div>
                            {copiedText === 'vodafone' ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
                          </div>
                        </div>

                        {/* Instapay */}
                        <div onClick={() => copyToClipboard(instapay, 'instapay')} className={`cursor-pointer p-4 rounded-2xl border transition-all ${copiedText === 'instapay' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500"><Sparkles className="w-5 h-5" /></div>
                              <div>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">InstaPay</p>
                                <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">{instapay}</p>
                              </div>
                            </div>
                            {copiedText === 'instapay' ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6 pt-2">
                        <button onClick={() => setPaymentStep(1)} className="flex-1 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">السابق</button>
                        <button onClick={() => setPaymentStep(3)} className="flex-[2] py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 transition-colors">التالي: إرفاق الإيصال</button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Upload Receipt */}
                  {paymentStep === 3 && (
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-cyan-600 dark:text-cyan-500 uppercase tracking-widest mb-1">الخطوة 3: تأكيد الدفع</p>
                      
                      <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-center font-bold text-cyan-700 dark:text-cyan-400">
                        إجمالي المبلغ المطلوب إيداعه: {currentPrice} ج.م
                      </div>

                      <label className="block cursor-pointer">
                        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${receiptFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-cyan-500'}`}>
                          {receiptFile ? (
                            <div className="flex flex-col items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                              <Check className="w-8 h-8 mb-2" />
                              <span>تم إرفاق الإيصال بنجاح</span>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {compressing ? <Loader className="w-8 h-8 animate-spin mx-auto text-cyan-500" /> : <Upload className="w-8 h-8 mx-auto text-slate-400" />}
                              <p className="font-bold text-slate-700 dark:text-slate-300">اضغط هنا لرفع صورة الإيصال</p>
                              <p className="text-xs text-slate-500">JPG, PNG (بحد أقصى 5MB)</p>
                            </div>
                          )}
                          <input type="file" accept="image/*" onChange={handleFileUpload} disabled={compressing} className="hidden" />
                        </div>
                      </label>

                      <div className="flex flex-col gap-3 mt-6 pt-2">
                        <button onClick={handleSendViaWhatsApp} disabled={isUploading || compressing || !receiptFile} className="w-full py-4 rounded-xl font-bold text-lg text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                          {isUploading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                          <span>إرسال وتأكيد الاشتراك</span>
                        </button>
                        <button onClick={() => setPaymentStep(2)} className="w-full py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">رجوع لتعديل البيانات</button>
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
    -webkit-text-fill-color: transparent;
  }

  .glass-card {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .pro-card-glow {
    position: relative;
  }


  .pro-card-glow::before {
    display: none;
  }


  .pro-card-glow:hover::before {
    opacity: 0.6;
  }


  .mesh-bg {
    background-color: #000000;
  }


  .custom-scrollbar::-webkit-scrollbar {
    width: 5px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
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
  
  const { user, userProfile } = useAuth();
  
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

  // Fetch promo status
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

  // Handle promo code change
  const handlePromoCodeChange = (value: string) => {
    const upperValue = value.toUpperCase().trim();
    setPromoCode(upperValue);
    
    // Check if offer is sold out (10 Pro users reached)
    const isSoldOut = !promoStatus?.is_available || promoStatus?.remaining_seats === 0;
    
    if (upperValue === '') {
      setPromoApplied(false);
      setPromoError('');
    } else if (isSoldOut) {
      setPromoApplied(false);
      setPromoError('✗ انتهت جميع المقاعد المتاحة للعرض الخاص');
    } else if (VALID_PROMO_CODES[upperValue] && promoStatus?.is_available) {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoApplied(false);
      setPromoError('✗ كود الخصم غير صحيح أو انتهى');
    }
  };

  const currentPrice = promoApplied && (promoStatus?.remaining_seats > 0) ? PROMO_PRICE : ORIGINAL_PRICE;
  const savings = promoApplied && (promoStatus?.remaining_seats > 0) ? ORIGINAL_PRICE - PROMO_PRICE : 0;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCheckout = () => {
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً');
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

    // Validate file type - must be an allowed image type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const validFormats = ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ');
      alert(`❌ نوع الملف غير مدعوم.\n\nالصيغ المسموح بها: ${validFormats}`);
      e.target.value = ''; // Clear input
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`❌ الملف كبير جداً.\n\nالحد الأقصى: ${MAX_FILE_SIZE_MB}MB\nحجم ملفك: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      e.target.value = ''; // Clear input
      return;
    }

    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setReceiptFile(compressed);
    } catch (error) {
      alert('❌ حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.');
      console.error('Image compression error:', error);
    } finally {
      setCompressing(false);
    }
  };

  const handleSendViaWhatsApp = async () => {
    if (!firstName || !lastName || !phoneNumber || !receiptFile) {
      alert('يرجى ملء جميع البيانات ورفع صورة الإيصال');
      return;
    }

    // Final validation before upload
    if (!ALLOWED_IMAGE_TYPES.includes(receiptFile.type)) {
      alert('❌ الملف المرفوع ليس صورة صحيحة. يرجى رفع صورة الإيصال (JPG, PNG، إلخ)');
      setReceiptFile(null);
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get user session info for debugging
      const { data: { session } } = await supabase.auth.getSession();
      console.log('📊 User session:', session?.user?.email);

      const fileName = `receipts/${Date.now()}-${receiptFile.name}`;
      console.log('📤 Attempting to upload:', fileName);
      
      // Note: If RLS error occurs, you need to disable RLS in Supabase Storage Policies
      // See SUPABASE_DISABLE_RLS.md for instructions
      try {
        const { error: uploadError } = await supabase.storage.from('payments').upload(fileName, receiptFile);
        
        if (uploadError) {
          console.error('❌ Upload Error:', uploadError);
          if (uploadError.message.includes('not found')) {
            throw new Error('❌ خادم التخزين غير متوفر. تأكد من وجود bucket "payments".\n\nاقرأ: SUPABASE_DISABLE_RLS.md');
          }
          throw uploadError;
        }

        const { data } = supabase.storage.from('payments').getPublicUrl(fileName);

        // Update promo counter if using promo code and offer is still available
        if (promoApplied && promoStatus?.is_available) {
          try {
            const { data: currentPromo } = await supabase
              .from('promotions')
              .select('mofathy_promo_count')
              .eq('id', 1)
              .single();

            const currentCount = currentPromo?.mofathy_promo_count || 0;
            
            // Only update if still under 10
            if (currentCount < 10) {
              await supabase
                .from('promotions')
                .update({ mofathy_promo_count: currentCount + 1 })
                .eq('id', 1);
              
              console.log('✅ Promo counter updated:', currentCount + 1);
              
              // Refresh promo status
              const res = await fetch('/api/promo/status');
              const newStatus = await res.json();
              setPromoStatus(newStatus);
            }
          } catch (updateError) {
            console.error('⚠️ Could not update promo counter:', updateError);
            // Don't fail the subscribe process if counter update fails
          }
        }

        // Activate user subscription in user_limits table immediately after payment receipt uploaded
        if (user?.uid) {
          try {
            const planToActivate = 'pro';
            await supabase
              .from('user_limits')
              .upsert({
                user_id: user.uid,
                plan: planToActivate,
                email: user?.email || '',
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });
            
            console.log('✅ User subscription activated immediately in user_limits');
          } catch (subscriptionError) {
            console.error('⚠️ Could not activate subscription in database:', subscriptionError);
            // Don't fail the subscribe process if database update fails
          }
        }

        const message = `🎉 طلب اشتراك جديد\n\n👤 الاسم: ${firstName} ${lastName}\n📧 البريد: ${user?.email}\n📱 الجوال: ${phoneNumber}\n💰 السعر: ${currentPrice} ج.م\n${promoApplied ? `🎁 كود: ${promoCode}` : ''}\n\nالإيصال: ${data.publicUrl}`;

        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');

        setIsManualPaymentModalOpen(false);
        setFirstName('');
        setLastName('');
        setPhoneNumber('');
        setReceiptFile(null);
      } catch (storageError: any) {
        console.error('💥 Storage Error Details:', storageError);
        console.error('📋 Error Message:', storageError?.message);
        console.error('🔍 Error JSON:', JSON.stringify(storageError));
        
        const errorMessage = storageError?.message || '';
        
        if (errorMessage.includes('42501') || errorMessage.includes('must be owner')) {
          alert('❌ مشكلة في صلاحيات Supabase.\n\nاستخدم واجهة Supabase الرسومية:\nStorage → payments bucket → Policies\n\nأضف سياسات للأمان من هناك.');
        } else if (errorMessage.includes('not found')) {
          alert('❌ خادم التخزين غير متوفر حالياً.\n\nتأكد من أنك أنشأت bucket باسم "payments" في Supabase.');
        } else if (errorMessage.includes('row-level security') || errorMessage.includes('violates')) {
          alert('❌ مشكلة في سياسات الأمان (RLS).\n\n✅ الحل السريع:\n1. Supabase → Storage → payments\n2. اضغط "Policies"\n3. اختر "Disable RLS"\n\n📖 اقرأ تفاصيل أكثر في:\nSUPABASE_DISABLE_RLS.md');
        } else if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
          alert('❌ لا توجد صلاحية لرفع الملفات.\n\nربما لم تسجل دخول أو هناك مشكلة في الصلاحيات.\n\nحل: استخدم "Disable RLS" كما في SUPABASE_DISABLE_RLS.md');
        } else if (errorMessage.includes('size')) {
          alert('❌ الملف كبير جداً.\n\nيرجى اختيار صورة أصغر (أقل من 5MB).');
        } else {
          alert(`❌ خطأ في الرفع:\n${errorMessage}\n\nملاحظة: اذا استمرت المشكلة، تحقق من الـ Console (F12) لمزيد من التفاصيل`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUploading(false);
    }
  };

  const plans: Plan[] = [
    {
      title: 'باقة المبتدئين',
      price: 0,
      description: 'ابدأ استخدام أدوات الذكاء الاصطناعي مجاناً وبدون أي التزامات.',
      features: ['📊 10 طلبات يومية ذكية', '📚 وصول لـ 630+ أداة متخصصة', '🤖 مساعد TOLZY الأساسي', '⚡ سرعة سيرفرات عادية'],
      cta: 'ابدأ مجاناً الآن',
    },
    {
      title: 'باقة المحترفين PRO',
      price: ORIGINAL_PRICE,
      description: 'جميع الميزات التي تحتاجها لزيادة إنتاجيتك باستخدام أقوى أدوات الذكاء الاصطناعي.',
      features: [
        '♾️ استخدام غير محدود لجميع الأدوات',
        '🧠 وصول كامل لنموذج "المفكر" (Thinker)',
        '🚀 مساعد الجيار V2.5 المطور',
        '⚡ أولوية قصوى على أسرع السيرفرات',
        '📚 وصول لـ 630+ أداة بدون قيود',
        '🎟️ وصول حصري لمنصة TOLZY Hex القادمة',
        '👨‍💼 دعم فني مباشر VIP',
      ],
      cta: 'انضم للمحترفين الآن',
      serviceKey: 'pro',
      isPro: true,
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Scarcity Banner - Sold Out State - HIDDEN */}
        {false && !promoLoading && promoStatus?.remaining_seats === 0 && (
          <div className="sticky top-0 z-50 bg-gradient-to-r from-red-700/95 via-red-700/95 to-red-700/95 backdrop-blur-md py-4 px-4 shadow-2xl border-b-2 border-red-500">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
              <span className="text-3xl animate-bounce">⏹️</span>
              <p className="font-black text-base sm:text-lg text-center text-white drop-shadow-lg">
                تم بيع جميع المقاعد المتاحة - العرض الخاص انتهى نهائياً! شكراً لك 🙏
              </p>
            </div>
          </div>
        )}

        {/* Scarcity Banner - Active Offer - HIDDEN */}
        {false && !promoLoading && promoStatus?.is_available && promoStatus?.remaining_seats > 0 && (
          <div className="sticky top-0 z-50 bg-gradient-to-r from-red-600/95 via-orange-600/95 to-red-600/95 backdrop-blur-md py-3 px-4 shadow-2xl border-b-2 border-yellow-300">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3">
              <span className="flex h-3 w-3 rounded-full bg-yellow-300 animate-ping"></span>
              <p className="font-black text-sm sm:text-base text-center text-white drop-shadow-lg">
                🔥 عرض محدود: استخدم كود <span className="bg-yellow-300 text-red-700 px-2 py-1 rounded-sm mx-1 font-black animate-pulse">MOFATHY10</span> بـ <span className="text-yellow-300 font-black underline decoration-wavy">209 ج.م</span>
                <br className="sm:hidden" />
                <span className="hidden sm:inline mx-2 text-yellow-300">|</span>
                <span className="mx-2 sm:mx-2 bg-yellow-300 text-red-700 px-3 py-1 rounded-lg inline-flex items-center gap-2 font-black shadow-lg">
                  <span className="text-2xl animate-ping">⏳</span>
                  متبقي <span className="font-black text-2xl text-red-700">{promoStatus.remaining_seats}</span>/10
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Ambient Glows */}



        <div className="max-w-6xl mx-auto px-4 py-24 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-24 max-w-3xl mx-auto animate-fade-in-down">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-800 text-gray-400 text-xs font-bold mb-6">
              <Sparkles className="w-3 h-3" />
              <span>منصة TOLZY المتكاملة</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              خطط أسعار بسيطة وشفافة
            </h1>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
              اختر الباقة المناسبة لاحتياجاتك واستفد من أكثر من 630 أداة ذكية متخصصة.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-stretch mb-32">
            {plans.map((plan, idx) => (
              <div
                key={plan.title}
                className={`group flex flex-col p-8 md:p-10 rounded-3xl transition-all duration-500 ${
                  plan.isPro 
                    ? 'bg-[#111] border border-white/10 md:scale-105'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className={`text-2xl font-bold mb-2 ${plan.isPro ? 'text-white' : 'text-gray-200'}`}>{plan.title}</h3>
                    <p className="text-gray-400 text-sm max-w-[200px]">{plan.description}</p>
                  </div>
                  {plan.isPro && (
                    <div className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold uppercase">
                      الأكثر طلباً
                    </div>
                  )}
                </div>

                <div className="mb-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-black">
                      {promoApplied && plan.isPro ? currentPrice : plan.price}
                    </span>
                    <span className="text-gray-400 font-bold uppercase tracking-tighter">ج.م</span>
                  </div>
                  {promoApplied && plan.isPro && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-gray-500 line-through text-lg">{plan.price} ج.م</span>
                      <span className="text-emerald-400 text-sm font-bold animate-pulse">✓ تم التعرف على الكود</span>
                    </div>
                  )}
                </div>

                <div className="flex-grow space-y-4 mb-10">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-3 group/item">
                      <div className={`mt-1 p-0.5 rounded-full ${plan.isPro ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-gray-300 text-sm md:text-base leading-snug group-hover/item:text-white transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mt-auto">
                  {plan.isPro && (
                    <div className="relative group/promo">
                      {/* Sold Out State */}
                      {promoStatus?.remaining_seats === 0 ? (
                        <div className="w-full px-4 py-3 rounded-xl text-sm font-bold bg-gray-900 border border-red-500/50 text-red-400 text-center">
                          ⏹️ انتهت جميع المقاعد
                        </div>
                      ) : (
                        <>
                          <input
                            type="text"
                            placeholder="هل لديك كود خصم؟"
                            value={promoCode}
                            onChange={(e) => handlePromoCodeChange(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl text-sm font-bold bg-slate-900 border transition-all placeholder:text-gray-600 text-center outline-none ${
                              promoApplied ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400' : 'border-white/10 focus:border-cyan-500/50'
                            }`}
                          />
                          {promoApplied && (
                            <div className="absolute right-3 top-3.5">
                              <Check className="w-4 h-4 text-emerald-400" />
                            </div>
                          )}
                          {promoError && (
                            <p className="text-red-400 text-xs mt-2 text-center font-medium">{promoError}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={() => plan.isPro && promoStatus?.remaining_seats > 0 ? handleCheckout() : null}
                    disabled={plan.isPro && promoStatus?.remaining_seats === 0}
                    className={`w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 transform active:scale-95 ${
                      promoStatus?.remaining_seats === 0 && plan.isPro
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                        : plan.isPro
                        ? 'bg-white text-black hover:bg-gray-200'
                        : 'bg-white/10 text-gray-400 cursor-default border border-white/5'
                    }`}
                  >
                    {plan.isPro && isUploading ? <Loader className="w-6 h-6 animate-spin mx-auto text-white" /> : promoStatus?.remaining_seats === 0 && plan.isPro ? '❌ انتهت المقاعد' : plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof Section */}
          <div className="text-center mb-32 py-16 border-y border-white/5 bg-white/[0.02]">
            <p className="text-gray-500 text-sm font-bold mb-8 uppercase tracking-[0.2em]">موثوق من قبل المبدعين في</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale contrast-125">
               <span className="text-2xl font-black tracking-tighter">CREATIVE</span>
               <span className="text-2xl font-black tracking-tighter">VISION</span>
               <span className="text-2xl font-black tracking-tighter">AGENCY</span>
               <span className="text-2xl font-black tracking-tighter">AI LABS</span>
            </div>
            <div className="mt-12 inline-flex items-center gap-2 text-cyan-400 font-bold">
              <span className="flex -space-x-3 rtl:space-x-reverse grayscale-[0.5]">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px]">👤</div>
                ))}
              </span>
              <span className="mr-4 text-sm font-medium text-gray-400">انضم إلى أكثر من 15,000 مستخدم نشط</span>
            </div>
          </div>

          {/* Features Detail Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-32">
            {[
              { 
                icon: <Brain className="w-6 h-6" />, 
                title: 'التحليل العميق',
                desc: 'وصول مباشر لنماذج متقدمة لحل المشكلات البرمجية والتحليلية المعقدة.',
                bgClass: 'bg-cyan-500/10',
                textClass: 'text-cyan-400',
                hoverClass: 'hover:border-cyan-500/30'
              },
              { 
                icon: <Rocket className="w-6 h-6" />, 
                title: 'سرعة فائقة', 
                desc: 'أولوية الاستخدام وسرعة استجابة فائقة لضمان سير عملك بدون انقطاع.',
                bgClass: 'bg-blue-500/10',
                textClass: 'text-blue-400',
                hoverClass: 'hover:border-blue-500/30'
              },
              { 
                icon: <Zap className="w-6 h-6" />, 
                title: '630+ أداة ذكية', 
                desc: 'مكتبة أدوات متكاملة تشمل الكتابة، توليد الصور، البرمجة، وتحليل البيانات.',
                bgClass: 'bg-cyan-500/10',
                textClass: 'text-cyan-400',
                hoverClass: 'hover:border-cyan-500/30'
              },
            ].map((feature, idx) => (
              <div key={idx} className={`p-8 rounded-3xl bg-slate-900/50 border border-white/5 transition-all duration-300 group ${feature.hoverClass}`}>
                <div className={`mb-6 p-3 rounded-2xl inline-block ${feature.bgClass} ${feature.textClass} group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-4">{feature.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-16">الأسئلة الشائعة</h2>
            <div className="space-y-4">
              {[
                { q: 'ما هي مميزات باقة TOLZY Pro؟', a: <span>تعرف على جميع المميزات والفوائد التي نقدمها في باقة المحترفين. <a href="https://zdhjnbsjkglumsakpmoj.supabase.co/storage/v1/object/public/article-pdfs/gklfkgflgkfgkfgf.pdf" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 font-semibold underline">فتح الملف الكامل</a></span> },
                { q: 'ما هي مدة تفعيل الاشتراك؟', a: 'يتم تفعيل الاشتراك خلال فترة تتراوح بين 15 دقيقة وساعتين بعد إرسال الإيصال.' },
                { q: 'هل يمكنني الإلغاء في أي وقت؟', a: 'نعم، يمكنك إلغاء أو إيقاف التجديد في أي وقت بدون التزامات.' },
                { q: 'هل تتوفر طرق دفع دولية؟', a: 'ندعم حالياً فودافون كاش وإنستا باي داخل مصر، وقريباً سنوفر طرق دفع دولية.' },
              ].map((faq, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                  <details className="group">
                    <summary className="flex items-center justify-between p-6 cursor-pointer font-bold list-none">
                      {faq.q}
                      <span className="transition-transform group-open:rotate-180">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Accent */}
        <div className="mt-32 border-t border-white/10 py-12 text-center text-gray-600 text-xs">
          © {new Date().getFullYear()} TOLZY AI. جميع الحقوق محفوظة.
        </div>

        {/* Payment Modal Redesign */}
        {isManualPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-6 overscroll-none animate-in fade-in duration-300">
            <div className="w-full max-w-xl height-auto max-h-[85vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2.5rem] bg-[#050505] border border-white/10 shadow-[0_0_80px_rgba(34,211,238,0.15)] relative scroll-smooth">
              <div className="p-5 sm:p-10 pb-12">
                <button
                  type="button"
                  onClick={() => setIsManualPaymentModalOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/5 z-50 group"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>

                <div className="text-center mb-8 mt-4">
                  <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-cyan-400">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-1 tracking-tight">تأكيد الاشتراك</h3>
                  
                  {/* Step Indicators */}
                  <div className="flex items-center justify-center gap-2 mt-6">
                    {[1, 2, 3].map((s) => (
                      <div 
                        key={s} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          paymentStep === s ? 'w-8 bg-cyan-500' : 'w-2 bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Step 1: Info */}
                  {paymentStep === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                      <div className="flex items-center gap-2 text-xs font-black text-cyan-500 uppercase tracking-widest mb-2">
                        <span>الخطوة 1: البيانات الشخصية</span>
                      </div>
                      <input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-white/5 text-gray-400 cursor-not-allowed outline-none"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="الاسم الأول"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl bg-slate-900 border border-white/10 focus:border-cyan-500/50 outline-none transition-all"
                        />
                        <input
                          type="text"
                          placeholder="العائلة"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl bg-slate-900 border border-white/10 focus:border-cyan-500/50 outline-none transition-all"
                        />
                      </div>
                      <input
                        type="tel"
                        placeholder="رقم الموبايل المرتبط بالحساب"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-900 border border-white/10 focus:border-cyan-500/50 outline-none transition-all"
                      />
                      <button
                        onClick={() => {
                          if (!firstName || !lastName || !phoneNumber) {
                            alert('يرجى ملء جميع البيانات');
                            return;
                          }
                          setPaymentStep(2);
                        }}
                        className="w-full py-4 rounded-2xl font-black text-lg premium-gradient text-white shadow-lg mt-4"
                      >
                        التالي: طرق التحويل
                      </button>
                    </div>
                  )}

                  {/* Step 2: Payment Details */}
                  {paymentStep === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                      <div className="flex items-center gap-2 text-xs font-black text-cyan-500 uppercase tracking-widest mb-2">
                        <span>الخطوة 2: طرق الدفع والتحويل</span>
                      </div>
                      <div className="grid gap-4">
                        <div 
                          onClick={() => copyToClipboard(vodafoneCash, 'vodafone')}
                          className={`relative group cursor-pointer p-4 sm:p-5 rounded-3xl border transition-all duration-300 ${
                            copiedText === 'vodafone' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900/50 border-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <Phone className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">فودافون كاش</p>
                                <p className="text-xl font-black font-mono tracking-wider">{vodafoneCash}</p>
                              </div>
                            </div>
                            {copiedText === 'vodafone' ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-600" />}
                          </div>
                        </div>

                        <div 
                          onClick={() => copyToClipboard(instapay, 'instapay')}
                          className={`relative group cursor-pointer p-4 sm:p-5 rounded-3xl border transition-all duration-300 ${
                            copiedText === 'instapay' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900/50 border-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Sparkles className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">InstaPay</p>
                                <p className="text-base font-black font-mono tracking-tight opacity-80">{instapay}</p>
                              </div>
                            </div>
                            {copiedText === 'instapay' ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-600" />}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setPaymentStep(1)}
                          className="flex-1 py-4 rounded-2xl font-bold bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
                        >
                          السابق
                        </button>
                        <button
                          onClick={() => setPaymentStep(3)}
                          className="flex-[2] py-4 rounded-2xl font-black text-lg premium-gradient text-white"
                        >
                          التالي: تأكيد الإيداع
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Receipt */}
                  {paymentStep === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                      <div className="flex items-center gap-2 text-xs font-black text-cyan-500 uppercase tracking-widest mb-2">
                        <span>الخطوة 3: إثبات التحويل</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center text-sm font-bold text-cyan-400">
                        إجمالي المبلغ المطلوب: {currentPrice} ج.م
                      </div>
                      <label className="block group cursor-pointer">
                        <div className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                          receiptFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 group-hover:border-cyan-500/50 bg-slate-900/50'
                        }`}>
                          {receiptFile ? (
                            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                              <Check className="w-5 h-5" />
                              <span>تم اختيار الصورة</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {compressing ? <Loader className="w-8 h-8 animate-spin mx-auto text-cyan-500" /> : <Upload className="w-8 h-8 mx-auto text-gray-500 group-hover:text-cyan-400 transition-colors" />}
                              <p className="font-bold">ارفع صورة الإيصال هنا</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest">PNG, JPG حتى 5MB</p>
                            </div>
                          )}
                          <input type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.bmp,image/jpeg,image/png,image/webp,image/gif,image/bmp" onChange={handleFileUpload} disabled={compressing} className="hidden" />
                        </div>
                      </label>

                      <div className="flex flex-col gap-3 mt-6">
                        <button
                          onClick={handleSendViaWhatsApp}
                          disabled={isUploading || compressing || !receiptFile}
                          className="w-full py-5 rounded-3xl font-black text-xl premium-gradient text-white shadow-xl shadow-cyan-500/20 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3"
                        >
                          {isUploading ? <Loader className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                          <span>إرسال عبر واتساب</span>
                        </button>
                        <button
                          onClick={() => setPaymentStep(2)}
                          className="w-full py-3 rounded-2xl font-bold text-gray-500 hover:text-white transition-colors"
                        >
                          الرجوع لتعديل البيانات
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setIsManualPaymentModalOpen(false)}
                    className="w-full py-3 mt-2 rounded-2xl font-bold text-[10px] text-gray-600 uppercase tracking-[0.2em] hover:text-gray-400 transition-colors"
                  >
                    إغلاق وبدء العملية لاحقاً
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
