"use client";

import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Cpu,
  Sparkles,
  Bug,
  BookOpen,
  ArrowUp,
  X,
  Loader2,
  Trash2
} from 'lucide-react';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  is_urgent: boolean;
  author_uid: string;
  author_name: string;
  votes_count: number;
  created_at: string;
}

const CATEGORIES = ['تطوير', 'محتوى', 'ميزة ذكية', 'تحسين', 'إصلاح'];

const categoryIcons: Record<string, React.ReactNode> = {
  'تطوير': <Cpu size={28} strokeWidth={1.5} />,
  'محتوى': <BookOpen size={28} strokeWidth={1.5} />,
  'ميزة ذكية': <Sparkles size={28} strokeWidth={1.5} />,
  'تحسين': <Bug size={28} strokeWidth={1.5} />,
  'إصلاح': <Bug size={28} strokeWidth={1.5} />,
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  'تطوير': { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
  'محتوى': { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  'ميزة ذكية': { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  'تحسين': { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  'إصلاح': { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
};

const UpcomingUpdatesPage: React.FC = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('تطوير');
  const [stats, setStats] = useState({ total: 0, implemented: 0, reviewing: 0, topVotes: 0 });

  const fetchSuggestions = useCallback(async () => {
    const { data, error } = await supabase
      .from('feature_suggestions')
      .select('*')
      .order('votes_count', { ascending: false });

    if (!error && data) {
      setSuggestions(data);
      setStats({
        total: data.length,
        implemented: data.filter(s => s.status === 'implemented').length,
        reviewing: data.filter(s => s.status === 'reviewing').length,
        topVotes: data.length > 0 ? data[0].votes_count : 0,
      });
    }
    setLoading(false);
  }, []);

  const fetchUserVotes = useCallback(async () => {
    if (!user?.uid) return;
    const { data } = await supabase
      .from('suggestion_votes')
      .select('suggestion_id')
      .eq('user_uid', user.uid);
    if (data) {
      setUserVotes(new Set(data.map(v => v.suggestion_id)));
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  useEffect(() => {
    fetchUserVotes();
  }, [fetchUserVotes]);

  const handleVote = async (suggestionId: string) => {
    if (!user) {
      toast.error('سجّل دخولك أولاً للتصويت');
      return;
    }

    const hasVoted = userVotes.has(suggestionId);

    if (hasVoted) {
      // Unvote
      await supabase.from('suggestion_votes').delete()
        .eq('suggestion_id', suggestionId)
        .eq('user_uid', user.uid);
      await supabase.from('feature_suggestions').update({
        votes_count: suggestions.find(s => s.id === suggestionId)!.votes_count - 1
      }).eq('id', suggestionId);
      
      setUserVotes(prev => { const n = new Set(prev); n.delete(suggestionId); return n; });
      setSuggestions(prev => prev.map(s => s.id === suggestionId ? { ...s, votes_count: s.votes_count - 1 } : s));
    } else {
      // Vote
      await supabase.from('suggestion_votes').insert({
        suggestion_id: suggestionId,
        user_uid: user.uid,
      });
      await supabase.from('feature_suggestions').update({
        votes_count: suggestions.find(s => s.id === suggestionId)!.votes_count + 1
      }).eq('id', suggestionId);

      setUserVotes(prev => new Set(prev).add(suggestionId));
      setSuggestions(prev => prev.map(s => s.id === suggestionId ? { ...s, votes_count: s.votes_count + 1 } : s));
    }
  };

  const handleSubmit = async () => {
    if (!user) { toast.error('سجّل دخولك أولاً'); return; }
    if (!newTitle.trim() || !newDesc.trim()) { toast.error('يرجى ملء جميع الحقول'); return; }

    setSubmitting(true);
    const { error } = await supabase.from('feature_suggestions').insert({
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      author_uid: user.uid,
      author_name: user.displayName || 'مستخدم',
    });

    if (error) {
      toast.error('حدث خطأ، حاول مرة أخرى');
    } else {
      toast.success('تم إضافة اقتراحك بنجاح! 🎉');
      setNewTitle('');
      setNewDesc('');
      setShowModal(false);
      fetchSuggestions();
    }
    setSubmitting(false);
  };

  const handleDeleteSuggestion = async (suggestionId: string, authorUid: string) => {
    if (!user || user.uid !== authorUid) { toast.error('لا يمكنك حذف هذا الاقتراح'); return; }
    if (!confirm('هل أنت متأكد من حذف هذا الاقتراح؟')) return;

    const { error } = await supabase.from('feature_suggestions').delete().eq('id', suggestionId);
    if (error) {
      toast.error('حدث خطأ أثناء الحذف');
    } else {
      toast.success('تم حذف الاقتراح');
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    }
  };


  return (
    <PageLayout>
      <main className="p-6 md:p-12 w-full max-w-7xl mx-auto">
        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-[#091426] dark:text-white mb-4 tracking-tight leading-tight">
                التحديثات القادمة: صوّت على الميزات
              </h1>
              <p className="text-[#45474c] dark:text-slate-400 text-lg max-w-xl font-medium">
                صوّت على الأفكار التي تريد رؤيتها، أو أضف اقتراحك الخاص للمساعدة في تطوير Tolzy AI.
              </p>
            </div>
            <button
              onClick={() => user ? setShowModal(true) : toast.error('سجّل دخولك أولاً')}
              className="flex items-center justify-center gap-3 bg-gradient-to-br from-[#fea619] to-[#855300] text-white px-8 py-4 rounded-full font-black shadow-lg shadow-[#fea619]/20 hover:shadow-[#fea619]/40 transition-all hover:-translate-y-1 active:scale-95 whitespace-nowrap self-start md:self-center"
            >
              <Plus size={24} />
              <span>إضافة اقتراح جديد</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'الأكثر تصويتاً', value: stats.topVotes.toString(), active: true },
              { label: 'تم التنفيذ', value: stats.implemented.toString(), active: false },
              { label: 'قيد الدراسة', value: stats.reviewing.toString(), active: false },
              { label: 'إجمالي الاقتراحات', value: stats.total.toString(), active: false },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group ${stat.active ? 'border-r-4 border-r-[#fea619]' : ''}`}
              >
                <span className={`text-[11px] font-black uppercase tracking-wider ${stat.active ? 'text-[#fea619]' : 'text-slate-500 dark:text-slate-400'}`}>
                  {stat.label}
                </span>
                <span className="text-3xl font-black text-[#091426] dark:text-white group-hover:scale-110 transition-transform">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#fea619]" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-bold text-slate-400 dark:text-slate-500 mb-4">لا توجد اقتراحات بعد</p>
              <p className="text-slate-500 dark:text-slate-600">كن أول من يضيف اقتراحاً!</p>
            </div>
          ) : (
            /* Suggestions List */
            <div className="space-y-10 relative">
              <div className="absolute right-[27px] top-6 bottom-6 w-0.5 bg-slate-100 dark:bg-white/5 hidden md:block"></div>

              {suggestions.map((suggestion) => {
                const hasVoted = userVotes.has(suggestion.id);
                const colors = categoryColors[suggestion.category] || categoryColors['تطوير'];
                const icon = categoryIcons[suggestion.category] || categoryIcons['تطوير'];

                if (suggestion.is_urgent) {
                  return (
                    <div key={suggestion.id} className="relative flex flex-col md:flex-row-reverse gap-8 items-start">
                      <div className="hidden md:flex absolute -right-2 top-12 w-4 h-4 rounded-full bg-[#fea619] ring-4 ring-white dark:ring-slate-900 z-10 animate-pulse shadow-sm shadow-[#fea619]/50"></div>
                      <div className="w-full bg-[#091426] dark:bg-slate-950 p-8 rounded-[48px] shadow-2xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#fea619]/10 blur-[80px] rounded-full group-hover:bg-[#fea619]/20 transition-all duration-500"></div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                          <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/10">{icon}</div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] bg-[#fea619] text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">عاجل</span>
                                <h3 className="text-2xl font-black text-white leading-tight">{suggestion.title}</h3>
                              </div>
                              <p className="text-slate-300 text-base mb-4 leading-relaxed font-medium">{suggestion.description}</p>
                              <div className="flex gap-2 items-center">
                                <span className="px-4 py-1.5 bg-white/10 text-white/70 text-[10px] font-black rounded-full uppercase">{suggestion.category}</span>
                                <span className="text-white/40 text-xs">بواسطة {suggestion.author_name}</span>
                                {user?.uid === suggestion.author_uid && (
                                  <button onClick={() => handleDeleteSuggestion(suggestion.id, suggestion.author_uid)} className="text-red-400/60 hover:text-red-400 transition-colors mr-2" title="حذف الاقتراح">
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleVote(suggestion.id)} className={`flex flex-col items-center justify-center px-7 py-4 rounded-[28px] transition-all active:scale-95 shadow-xl hover:-translate-y-1 ${hasVoted ? 'bg-white text-[#fea619]' : 'bg-[#fea619] text-white shadow-[#fea619]/20 hover:shadow-[#fea619]/40'}`}>
                            <ArrowUp size={28} strokeWidth={3} className="mb-0.5" />
                            <span className="font-black text-2xl leading-none">{suggestion.votes_count}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={suggestion.id} className="relative flex flex-col md:flex-row-reverse gap-8 items-start">
                    <div className="hidden md:flex absolute -right-2 top-10 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-900 z-10"></div>
                    <div className="w-full bg-white dark:bg-slate-900/50 p-8 rounded-[36px] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group border border-slate-100 dark:border-white/5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-5">
                          <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 shadow-inner`}>{icon}</div>
                          <div>
                            <h3 className="text-2xl font-black text-[#091426] dark:text-white mb-2 leading-tight">{suggestion.title}</h3>
                            <p className="text-[#45474c] dark:text-slate-400 text-base mb-4 leading-relaxed font-medium">{suggestion.description}</p>
                            <div className="flex gap-2 items-center">
                              <span className={`px-4 py-1.5 ${colors.bg} ${colors.text} text-[10px] font-black rounded-full uppercase`}>{suggestion.category}</span>
                              <span className="text-slate-400 text-xs">بواسطة {suggestion.author_name}</span>
                              {user?.uid === suggestion.author_uid && (
                                <button onClick={() => handleDeleteSuggestion(suggestion.id, suggestion.author_uid)} className="text-red-400/40 hover:text-red-500 transition-colors mr-2" title="حذف الاقتراح">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => handleVote(suggestion.id)} className={`flex flex-col items-center justify-center px-6 py-3 rounded-2xl transition-all active:scale-95 border ${hasVoted ? 'bg-[#ffddb8] dark:bg-[#fea619]/20 text-[#855300] dark:text-[#fea619] border-[#fea619]/30' : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-[#fea619]/10 hover:text-[#855300] dark:hover:text-[#fea619] border-slate-100 dark:border-white/5'}`}>
                          <ArrowUp size={24} strokeWidth={hasVoted ? 3 : 2} className="mb-0.5" />
                          <span className="font-black text-xl leading-none">{suggestion.votes_count}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal for New Suggestion */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              <h2 className="text-2xl font-black text-[#091426] dark:text-white">إضافة اقتراح جديد</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 text-right">عنوان الاقتراح</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="مثال: دعم تصدير البيانات إلى Excel"
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-right focus:outline-none focus:ring-2 focus:ring-[#fea619]/50 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 text-right">وصف مفصل</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="اشرح فكرتك بالتفصيل..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-right focus:outline-none focus:ring-2 focus:ring-[#fea619]/50 resize-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 text-right">التصنيف</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${newCategory === cat ? 'bg-[#fea619] text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-gradient-to-br from-[#fea619] to-[#855300] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#fea619]/20 hover:shadow-[#fea619]/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus size={20} />}
                <span>{submitting ? 'جاري الإرسال...' : 'إرسال الاقتراح'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default UpcomingUpdatesPage;
