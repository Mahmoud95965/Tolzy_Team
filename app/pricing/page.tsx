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
                  
                  {plan.isPro ? (
                    // خطة Pro: زران - Kashier مباشر أو دفع يدوي
                    <div className="space-y-3">
                      {/* زر Kashier الدفع المباشر */}
                      <button
                        onClick={() => {
                          if (!user) {
                            alert('يرجى تسجيل الدخول أولاً للمتابعة');
                            return;
                          }
                          const pageId = 'PP-4542426601,test';
                          const baseUrl = 'https://checkouts.kashier.io/ar/paymentpage';
                          const params = new URLSearchParams({ ppLink: pageId });
                          if (user?.email) params.append('customerEmail', user.email);
                          if (user?.uid) {
                            params.append('reference', user.uid);
                            params.append('merchantOrderId', `tolzy_${Date.now()}`);
                          }
                          window.location.href = `${baseUrl}?${params.toString()}`;
                        }}
                        disabled={promoStatus?.remaining_seats === 0}
                        className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 ${
                          promoStatus?.remaining_seats === 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                        }`}
                      >
                        {promoStatus?.remaining_seats === 0 ? 'نفدت المقاعد' : 'ادفع الآن عبر Kashier '}
                      </button>
                      

                      {/* زر الدفع اليدوي (القديم) */}
                      <button
                        onClick={() => handleCheckout()}
                        disabled={promoStatus?.remaining_seats === 0}
                        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 border border-slate-200 dark:border-slate-700 ${
                          promoStatus?.remaining_seats === 0
                            ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        أو ادفع يدوياً عبر فودافون كاش
                      </button>
                    </div>
                  ) : (
                    // خطة Free
                    <button
                      onClick={() => handleCheckout()}
                      className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white"
                    >
                      {plan.cta}
                    </button>
                  )}
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
