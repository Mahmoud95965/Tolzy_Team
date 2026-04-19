'use client';

import React from 'react';

const globalLogos = [
  {
    name: 'Microsoft',
    icon: (
      <svg viewBox="0 0 23 23" fill="currentColor" className="w-5 h-5">
        <path d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z"/>
      </svg>
    ),
  },
  {
    name: 'ElevenLabs',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M6 3L4 21h3L9 3H6zm8 0l-2 18h3l2-18h-3z"/>
      </svg>
    ),
  },
  {
    name: 'HubSpot',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.8 11.5c.3 0 .7.1.9.3.2.2.3.6.3.9s-.1.7-.3.9c-.2.2-.6.3-.9.3h-1.3c-.2 1.4-.9 2.6-2 3.4-1.1.8-2.5 1.1-3.8 1-1.3-.1-2.5-.7-3.4-1.7-.9-1-1.3-2.3-1.1-3.7.1-1.3.7-2.5 1.7-3.4 1-1 2.3-1.4 3.7-1.3 1.1.1 2.2.5 3 1.3l.9-.9c-1.1-1.1-2.6-1.7-4.2-1.9-1.6-.1-3.1.3-4.5 1.2-1.3.9-2.3 2.1-2.8 3.6-.5 1.4-.5 3 .1 4.4.6 1.4 1.6 2.6 3 3.3s3 .8 4.5.4c1.4-.4 2.7-1.3 3.5-2.5.8-1.2 1.1-2.7 1-4.2h.1z"/>
        <circle cx="12" cy="12" r="1.5"/>
        <circle cx="15.5" cy="8.5" r="1"/>
      </svg>
    ),
  },
  {
    name: 'zendesk',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19 19l-7-7 7-7v14zM5 19l7-7-7-7v14z"/>
      </svg>
    ),
  },
  {
    name: 'NVIDIA',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v2h-2zm0 4h2v6h-2z"/>
      </svg>
    ),
  },
  {
    name: 'Meta',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.5 12c-1.1 0-2.1-.4-2.8-1.2l-1.5-1.5-1.5 1.5c-.7.8-1.7 1.2-2.8 1.2s-2.1-.4-2.8-1.2c-.8-.8-1.2-1.7-1.2-2.8s.4-2.1 1.2-2.8c.7-.8 1.7-1.2 2.8-1.2s2.1.4 2.8 1.2l1.5 1.5 1.5-1.5c.7-.8 1.7-1.2 2.8-1.2s2.1.4 2.8 1.2c.8.8 1.2 1.7 1.2 2.8s-.4 2.1-1.2 2.8c-.7.8-1.7 1.2-2.8 1.2z"/>
      </svg>
    ),
  },
  {
    name: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
      </svg>
    ),
  },
];

const LogoItem: React.FC<{ icon: React.ReactNode; name: string }> = ({ icon, name }) => (
  <div className="flex items-center gap-2 px-4 py-3 opacity-55 hover:opacity-100 transition-all duration-300 select-none cursor-default hover:-translate-y-0.5 shrink-0 group">
    <div className="text-slate-900 dark:text-slate-100 transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>
    <span className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200 whitespace-nowrap">
      {name}
    </span>
  </div>
);

const Separator: React.FC = () => (
  <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0 opacity-40 self-center" />
);

const MarqueeRow: React.FC<{ direction: 'ltr' | 'rtl'; speed?: number }> = ({
  direction,
  speed = 28,
}) => {
  const animClass =
    direction === 'ltr' ? 'animate-marquee-ltr' : 'animate-marquee-rtl';

  return (
    <div className="flex w-max overflow-hidden group/row">
      {/* Set A */}
      <div
        className={`flex shrink-0 items-center ${animClass} group-hover/row:[animation-play-state:paused]`}
        style={{ '--marquee-speed': `${speed}s` } as React.CSSProperties}
      >
        {globalLogos.map((logo, i) => (
          <React.Fragment key={`a-${i}`}>
            <LogoItem icon={logo.icon} name={logo.name} />
            {i < globalLogos.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </div>

      {/* Set B — duplicate for seamless loop */}
      <div
        className={`flex shrink-0 items-center ${animClass} group-hover/row:[animation-play-state:paused]`}
        style={{ '--marquee-speed': `${speed}s` } as React.CSSProperties}
        aria-hidden="true"
      >
        {globalLogos.map((logo, i) => (
          <React.Fragment key={`b-${i}`}>
            <LogoItem icon={logo.icon} name={logo.name} />
            {i < globalLogos.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const LogoMarquee: React.FC = () => {
  return (
    <section className="w-full py-10 bg-white dark:bg-[#050505] border-y border-gray-100 dark:border-white/5 overflow-hidden">
      {/* Label */}
      <p className="text-center text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-8">
        أدوات مدمجة من أقوى الشركات العالمية
      </p>

      {/* Rows */}
      <div className="max-w-5xl mx-auto space-y-1 px-4">
        {/* Row 1 — left to right */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-white dark:from-[#050505] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-white dark:from-[#050505] to-transparent" />
          <MarqueeRow direction="ltr" speed={28} />
        </div>

        {/* Row 2 — right to left */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-white dark:from-[#050505] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-white dark:from-[#050505] to-transparent" />
          <MarqueeRow direction="rtl" speed={22} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-ltr {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-rtl {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-ltr {
          animation: marquee-ltr var(--marquee-speed, 28s) linear infinite;
          will-change: transform;
        }
        .animate-marquee-rtl {
          animation: marquee-rtl var(--marquee-speed, 22s) linear infinite;
          will-change: transform;
        }
      `}} />
    </section>
  );
};

export default LogoMarquee;