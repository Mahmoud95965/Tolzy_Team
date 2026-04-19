import React from 'react';
import Image from 'next/image';
import { PlayCircle, ArrowLeft } from 'lucide-react';

const DemoSection: React.FC = () => {
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);

  return (
    <section className="relative w-full py-24 bg-white dark:bg-[#050505] overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-violet-600/10 dark:bg-violet-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="mb-12">
          <span className="inline-block py-1.5 px-4 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-bold text-sm mb-4">
            T O L Z Y AI
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            شاهد <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">T O L Z Y AI</span> في العمل
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            T O L Z Y AI هو نموذج لغوي كبير (LLM) لمساعدتك في الكتابة والتحليل والأفكار. <br className="hidden md:block" />
            اسأل، استكشف، وابدأ الإنجاز أسرع مع تجربة ذكية وسلسة.
          </p>
        </div>

        {/* Video Wrapper */}
        <div className="relative mx-auto max-w-5xl w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/20 border border-slate-200 dark:border-white/10 group bg-slate-100 dark:bg-slate-900 aspect-video flex items-center justify-center">
          <div className="absolute top-4 right-4 z-40 bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
            متاح الآن لجميع المستخدمين
          </div>
          
          {/* Fallback pattern while waiting for the real video */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 dark:opacity-5"></div>
          
          {/* Optimized Poster using Next.js Image */}
          {!isVideoLoaded && (
            <div className="absolute inset-0 z-20">
              <Image 
                src="/image/tools/Tolzy Video Cover.webp"
                alt="Tolzy AI Video Cover"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          )}

          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            onPlay={() => setIsVideoLoaded(true)}
            className={`w-full h-full object-cover relative z-10 transition-opacity duration-500 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden="true"
          >
            <source src="https://fpikysywaihykgdhoeim.supabase.co/storage/v1/object/public/TOLZY%20AI/Custom%20recording%202026-04-09%2018-15-23.mp4" type="video/mp4" />
            متصفحك لا يدعم تشغيل الفيديو.
          </video>

          {/* Floating Play Icon (Decorative) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="w-20 h-20 bg-white/20 dark:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-xl">
              <PlayCircle className="w-10 h-10 text-white opacity-80" />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <a
            href="https://ai.tolzy.me"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-violet-500/30 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10">ابدأ الإبداع مع T O L Z Y AI</span>
            <ArrowLeft className="w-6 h-6 relative z-10 group-hover:-translate-x-1 transition-transform" />
          </a>
        </div>

      </div>
    </section>
  );
};

export default DemoSection;
