import React from 'react';
import { Sparkles, Calendar, Code, Palette, MessageSquare, Image } from 'lucide-react';

const TolzyComingSoon: React.FC = () => {
  const upcomingTools = [
    { icon: Code, name: 'Tolzy Code', color: 'text-blue-500 bg-blue-500/10' },
    { icon: Palette, name: 'Tolzy Design', color: 'text-purple-500 bg-purple-500/10' },
    { icon: MessageSquare, name: 'Tolzy Chat', color: 'text-green-500 bg-green-500/10' },
    { icon: Image, name: 'Tolzy Image', color: 'text-orange-500 bg-orange-500/10' }
  ];

  return (
    <div className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 border border-slate-200/50 dark:border-white/5 shadow-2xl shadow-indigo-500/5 group">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-5 text-right">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
              أدوات Tolzy القادمة
            </h3>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span>الإطلاق المرتقب: 2026</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {upcomingTools.map((tool, index) => (
            <div
              key={index}
              className={`flex items-center justify-center w-12 h-12 ${tool.color} rounded-2xl border border-white/10 shadow-sm hover:scale-110 transition-transform duration-300`}
              title={tool.name}
            >
              <tool.icon className="h-6 w-6" />
            </div>
          ))}
        </div>

        <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95">
          انتظر المفاجأة
        </button>
      </div>
    </div>
  );
};

export default TolzyComingSoon;
