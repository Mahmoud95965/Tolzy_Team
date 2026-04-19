'use client';

import { useState, useEffect } from 'react';
import { Mail, Zap, Sparkles, ArrowRight, Star, Hexagon } from 'lucide-react';

const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
  }

  @keyframes glow-pulse {
    0%, 100% { text-shadow: 0 0 10px rgba(34, 197, 94, 0.3), 0 0 20px rgba(34, 197, 94, 0.2); }
    50% { text-shadow: 0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.4); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes hex-rotate {
    0% { transform: rotate(0deg); }
    360% { transform: rotate(360deg); }
  }

  @keyframes pulse-ring {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.5; }
  }

  .hex-gradient {
    background: linear-gradient(135deg, #22c55e 0%, #10b981 25%, #059669 50%, #047857 75%, #22c55e 100%);
    background-size: 200% auto;
    animation: shimmer 8s linear infinite;
  }

  .text-hex-gradient {
    background: linear-gradient(135deg, #22c55e 0%, #10b981 50%, #059669 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .float-animation {
    animation: float 6s ease-in-out infinite;
  }

  .glow-text {
    animation: glow-pulse 3s ease-in-out infinite;
  }

  .hex-rotate-animation {
    animation: hex-rotate 20s linear infinite;
  }

  .pulse-animation {
    animation: pulse-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .glass-card {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  .glow-border {
    position: relative;
    border: 2px solid rgba(34, 197, 94, 0.3);
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.2), inset 0 0 20px rgba(34, 197, 94, 0.05);
  }

  .mesh-bg {
    background-image: 
      radial-gradient(at 1% 50%, rgba(34, 197, 94, 0.13) 0px, transparent 50%),
      radial-gradient(at 99% 50%, rgba(16, 185, 129, 0.13) 0px, transparent 50%),
      radial-gradient(at 50% 1%, rgba(5, 150, 105, 0.13) 0px, transparent 50%);
  }

  .separator {
    background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.3), transparent);
    height: 1px;
  }
`;

export default function TolzyHex() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    weeks: 0,
    days: 0,
  });

  useEffect(() => {
    // Calculate time until Summer 2026 (June 1, 2026)
    const summerDate = new Date('2026-06-01').getTime();
    const now = new Date().getTime();
    const diff = summerDate - now;

    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const weeks = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24 * 7));
    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));

    setTimeLeft({ months, weeks, days });
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-black text-white relative overflow-hidden mesh-bg">
        {/* Animated Background Elements */}
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-green-600/10 rounded-full blur-[120px] -z-10 pulse-animation"></div>
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] -z-10 pulse-animation" style={{ animationDelay: '1s' }}></div>

        {/* Navigation */}
        <div className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-green-500/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hexagon className="w-8 h-8 text-green-500 float-animation" />
              <span className="text-2xl font-black text-hex-gradient">TOLZY Hex</span>
            </div>
            <a href="/" className="text-green-400 hover:text-green-300 transition-colors font-bold">العودة</a>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            {/* Main Heading */}
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block">
                <Hexagon className="w-16 h-16 text-green-500 float-animation mx-auto mb-6" />
              </div>

              <h1 className="text-6xl md:text-8xl font-black leading-tight glow-text">
                <span className="text-hex-gradient block">TOLZY Hex</span>
              </h1>

              <p className="text-2xl md:text-3xl font-black text-green-400 drop-shadow-lg">
                ثورة جديدة تنتظر العالم العربي
              </p>
            </div>

            {/* Divider */}
            <div className="w-24 h-1 separator mx-auto"></div>

            {/* Mystery Content */}
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="glass-card glow-border p-8 rounded-2xl space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-400 font-bold">
                  <Sparkles className="w-5 h-5" />
                  <span>الغموض هو جمال الحقيقة الجديدة</span>
                  <Sparkles className="w-5 h-5" />
                </div>

                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                  نحن نعمل على شيء استثنائي جداً... شيء سيغير طريقة تفكيرك بالذكاء الاصطناعي في العالم العربي. 
                  <br />
                  <span className="text-green-400 font-bold">الراحة تجسس على الخطط الكبيرة.</span>
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="glass-card glow-border p-6 rounded-xl text-center">
                  <div className="text-green-400 font-black text-3xl mb-2">🚀</div>
                  <p className="text-sm font-bold text-gray-300">
                    أحدث البرامج والموديلات
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    مدربة بعناية للعربية
                  </p>
                </div>

                <div className="glass-card glow-border p-6 rounded-xl text-center">
                  <div className="text-green-400 font-black text-3xl mb-2">⚡</div>
                  <p className="text-sm font-bold text-gray-300">
                    قوة لا تُضاهى
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    تجاوز كل الحدود المعروفة
                  </p>
                </div>

                <div className="glass-card glow-border p-6 rounded-xl text-center">
                  <div className="text-green-400 font-black text-3xl mb-2">🌟</div>
                  <p className="text-sm font-bold text-gray-300">
                    التميز العربي
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    صُنعت للعرب بواسطة العرب
                  </p>
                </div>
              </div>

              {/* Hinted Features */}
              <div className="space-y-3 text-left">
                <p className="text-green-400 font-bold text-center mb-4">إشارات غامضة 👀</p>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Zap className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>تدريب متقدم على أحدث الموديلات العالمية</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Star className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>معايير أداء ستذهل الجميع</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <ArrowRight className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>شيء لم يّر من قبل في المنطقة</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="space-y-6 pt-8">
              <div className="text-gray-400 font-bold text-lg">
                الإطلاق المتوقع
              </div>
              <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-md mx-auto">
                <div className="glass-card glow-border p-4 md:p-6 rounded-xl text-center">
                  <div className="text-green-400 font-black text-3xl md:text-4xl">
                    {timeLeft.months}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400 mt-2 font-bold">
                    أشهر
                  </div>
                </div>
                <div className="glass-card glow-border p-4 md:p-6 rounded-xl text-center">
                  <div className="text-green-400 font-black text-3xl md:text-4xl">
                    {timeLeft.weeks}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400 mt-2 font-bold">
                    أسابيع
                  </div>
                </div>
                <div className="glass-card glow-border p-4 md:p-6 rounded-xl text-center">
                  <div className="text-green-400 font-black text-3xl md:text-4xl">
                    {timeLeft.days}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400 mt-2 font-bold">
                    أيام
                  </div>
                </div>
              </div>
              <p className="text-green-400 font-bold animate-pulse">
                الصيف القادم 2026 🌞
              </p>
            </div>

            {/* Newsletter Signup */}
            <div className="pt-12 space-y-6">
              <p className="text-gray-400 font-bold">
                كن أول من يعرف عن الإطلاق الكبير
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-6 py-3 rounded-xl bg-slate-900 border border-green-500/30 focus:border-green-500 outline-none text-white placeholder:text-gray-500 transition-colors text-center"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-hex-gradient text-black font-black rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all transform active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Mail className="w-5 h-5" />
                  اشترك
                </button>
              </form>
              {subscribed && (
                <p className="text-green-400 font-bold text-sm animate-pulse">
                  ✓ تم تسجيلك بنجاح! شكراً لك 🎉
                </p>
              )}
            </div>

            {/* Warning */}
            <div className="pt-12 pb-20 text-center space-y-4">
              <p className="text-gray-500 text-sm font-bold">
                ⚠️ لا تفصح الكثير الآن...
              </p>
              <p className="text-green-500/70 text-xs">
                السرية هي أساس الابتكار الحقيقي
              </p>
            </div>
          </div>
        </div>

        {/* Floating Hexagons */}
        <div className="fixed bottom-10 right-10 w-20 h-20 border border-green-500/20 rounded-3xl hex-rotate-animation opacity-30"></div>
        <div className="fixed top-1/2 left-10 w-16 h-16 border border-green-500/20 rounded-2xl hex-rotate-animation opacity-20" style={{ animationDirection: 'reverse' }}></div>
      </div>
    </>
  );
}
