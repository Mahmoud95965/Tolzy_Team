'use client';

import React, { useState } from 'react';
import PageLayout from '@/src/components/layout/PageLayout';
import PremiumHero from '@/src/components/common/PremiumHero';
import WaveSVG from '@/src/components/common/WaveSVG';
import { 
  Sparkles, 
  Search, 
  Layers, 
  Compass, 
  Cpu, 
  Palette, 
  Activity, 
  Star, 
  CheckCircle2,
  ExternalLink,
  Sliders,
  Laptop
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShowcasePage() {
  const [activeGlow, setActiveGlow] = useState<'blue' | 'violet' | 'emerald'>('blue');
  const [searchQuery, setSearchQuery] = useState('');
  const [isWaving, setIsWaving] = useState(true);

  // Stats for the showcase card
  const stats = [
    { label: 'أدوات ذكية', value: '+1000', icon: Cpu },
    { label: 'مستخدم مسجل', value: '+2500', icon: Compass },
    { label: 'دقة عالية', value: '100%', icon: Activity },
  ];

  // Glow variation details
  const variationCards = [
    {
      type: 'blue' as const,
      name: 'الأزرق المشع (Radiant Blue)',
      description: 'مثالي لأقسام الأدوات العامة، التقنيات، وقواعد البيانات. يعكس الحيوية والثقة والذكاء التكنولوجي.',
      badgeText: 'أدوات ومطورين',
      badgeIcon: Cpu,
      gradientText: 'من ابتكارك، بقوة الذكاء الاصطناعي',
      accentColor: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
      glowDemoClass: 'bg-blue-500/20',
    },
    {
      type: 'violet' as const,
      name: 'البنفسجي الملكي (Royal Violet)',
      description: 'مثالي للقسم الإبداعي، محركات التوليد الفني، والكورسات الاحترافية. يعكس الفخامة والإلهام والخيال.',
      badgeText: 'إبداع وفن توليدي',
      badgeIcon: Sparkles,
      gradientText: 'تجسيد الأفكار اللانهائية لواقع ملموس',
      accentColor: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
      glowDemoClass: 'bg-purple-500/20',
    },
    {
      type: 'emerald' as const,
      name: 'الزمردي النابض (Vibrant Emerald)',
      description: 'مثالي لأقسام الأعمال، تحسين محركات البحث، التحليلات، والتطوير المالي. يعكس النمو والاستدامة والنجاح المادي.',
      badgeText: 'أعمال واستثمار',
      badgeIcon: Palette,
      gradientText: 'ضاعف إنتاجيتك وحقق قفزات غير مسبوقة',
      accentColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      glowDemoClass: 'bg-emerald-500/20',
    },
  ];

  return (
    <PageLayout navbarOffset={false}>
      {/* 1. PREMIUM HERO SECTION */}
      <PremiumHero
        title={
          <span className="leading-tight block">
            صمم واجهات <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">تنبض بالحياة</span> في Tolzy
          </span>
        }
        subtitle="مكونات واجهة متناسقة وفائقة النعومة تمزج بين تأثيرات الزجاج الجذاب (Glassmorphism) والتوهجات الخلفية ثلاثية الأبعاد لخلق هوية بصرية متميزة وجذابة للمستخدم العربي."
        badgeText="الهوية البصرية الجديدة | Tolzy UI"
        badgeIcon={Sparkles}
        glowColor={activeGlow}
      >
        {/* Interactive Content inside the thin Glassmorphic Slot */}
        <div className="p-4 md:p-6 w-full flex flex-col gap-4 text-right">
          <div className="relative w-full">
            <input
              id="showcase-search"
              type="text"
              placeholder="ابحث عن المكونات أو جرب كتابة شيء ما هنا..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-3 px-12 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-sans text-sm md:text-base text-right"
              dir="rtl"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            
            {searchQuery && (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-indigo-400 animate-pulse font-mono">
                جاري البحث...
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                #تولزي_كوبايلوت
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                #هوية_بصرية
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                #مكونات_NextJS
              </span>
            </div>
            
            <span className="text-xs text-slate-400">
              أدخل كلمة للبحث التفاعلي
            </span>
          </div>
        </div>
      </PremiumHero>

      {/* 2. WAVE INTERACTIVE SVG BRIDGE */}
      <WaveSVG
        fillColor="fill-slate-50 dark:fill-[#0b0f19]"
        backgroundColor="bg-[#090a0f]"
        animate={isWaving}
        secondaryWaveOpacity={0.35}
      />

      {/* 3. CONTENT SECTION (Smoothly transition into light slate or dark indigo) */}
      <section className="py-20 px-4 max-w-7xl mx-auto bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
        
        {/* Interactive Controls for Hero Customization */}
        <div className="mb-16 p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#121829] shadow-xl shadow-slate-100 dark:shadow-none max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
            <Sliders className="w-6 h-6 text-indigo-500" />
            <h2 className="text-xl font-bold text-right w-full">لوحة التحكم التفاعلية بالبث المباشر</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right" dir="rtl">
            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">اختر توهج الخلفية للـ Hero:</p>
              <div className="flex gap-3">
                <button
                  id="glow-blue-btn"
                  onClick={() => setActiveGlow('blue')}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    activeGlow === 'blue'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  أزرق مشع (Default)
                </button>
                <button
                  id="glow-violet-btn"
                  onClick={() => setActiveGlow('violet')}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    activeGlow === 'violet'
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  بنفسجي ملكي
                </button>
                <button
                  id="glow-emerald-btn"
                  onClick={() => setActiveGlow('emerald')}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    activeGlow === 'emerald'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  زمردي نابض
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">حركة المنحنى الانسيابي (Wave):</p>
              <button
                id="toggle-wave-btn"
                onClick={() => setIsWaving(!isWaving)}
                className={`w-full py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                  isWaving
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200'
                }`}
              >
                {isWaving ? 'الحركة نشطة (مورفينج انسيابي)' : 'الحركة متوقفة'}
              </button>
            </div>
          </div>
        </div>

        {/* Introduction Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-normal">
            تفاصيل الهوية البصرية المطوّرة
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed">
            تم بناء هذه المكونات لدعم التحول الكامل نحو تجربة فاخرة تميز Tolzy. التداخل بين الخلفية الداكنة والتوهج الهادئ يركز انتباه الزائر على المحتوى ويسهل تصفح الأدوات.
          </p>
        </div>

        {/* Glow Theme Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 text-right" dir="rtl">
          {variationCards.map((card, i) => {
            const CardIcon = card.badgeIcon;
            return (
              <motion.div
                key={card.type}
                className="group relative rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#121829] p-8 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
              >
                {/* Background soft decorative glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none transition-transform group-hover:scale-125 ${card.glowDemoClass}`} />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${card.accentColor}`}>
                      <CardIcon className="w-3.5 h-3.5" />
                      {card.badgeText}
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">0{i+1}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                    {card.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5 pt-6 mt-4">
                  <div className="flex items-center justify-between">
                    <button
                      id={`apply-glow-${card.type}`}
                      onClick={() => setActiveGlow(card.type)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      تطبيق على الهيرو العلوي <ExternalLink className="w-3 h-3" />
                    </button>
                    <span className="text-xs text-slate-400">كامل التوافق</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Premium Features Checklist & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-right" dir="rtl">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
              ميزات الهندسة الفنية للمكونات الجديدة
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">دعم متكامل للـ RTL والـ LTR</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">تراعي المحاذاة التلقائية اتجاهات اللغة العربية والإنجليزية وتتكيف مع البعد الجمالي المناسب.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">الحد الأقصى للأداء (Performance First)</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">تعتمد الحركة على Morphing الـ SVG وعمليات تحويل Framer Motion التي يتم تسريعها بالمعالج الرسومي (GPU-accelerated).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">قابلية إعادة استخدام تامة (Reusable Props)</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">يمكنك استخدام الهيرو والويف في صفحة الكورسات، صفحة الأدوات، تفاصيل الأداة، أو حتى صفحات التسجيل.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#121829] shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent pointer-events-none" />
            
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-indigo-500" />
              إحصاءات تجربة الواجهة للـ Showcase
            </h4>

            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => {
                const StatIcon = stat.icon;
                return (
                  <div key={stat.label} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181f33] border border-slate-100 dark:border-white/5 text-center">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                      <StatIcon className="w-4 h-4" />
                    </div>
                    <span className="block text-2xl font-extrabold text-slate-900 dark:text-white mb-1 font-mono">
                      {stat.value}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-indigo-600/5 border border-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs leading-relaxed text-center font-medium">
              تتحول الواجهة تلقائياً وبأقصى انسيابية بين النمط الداكن والمضيء، مع الاحتفاظ بجودة التوهج الخلفي الفاخر.
            </div>
          </div>
        </div>

      </section>
    </PageLayout>
  );
}
