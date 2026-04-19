"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Sparkles, TrendingUp, Newspaper, ChevronLeft, ChevronRight, GraduationCap, Check, Volume2, VolumeX, Zap, PlayCircle, Bot, Wand2 } from 'lucide-react';
import { useTools } from '../../hooks/useTools';
import BentoHomeSection from './BentoHomeSection';
import DemoSection from './DemoSection';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Course } from '../../types/learn';
import SmartCourseCard from '../learn/SmartCourseCard';

const LoggedInHome: React.FC = () => {
    const router = useRouter();
    const { featuredTools, newTools } = useTools();
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Courses
                const coursesRef = collection(db, 'courses');
                const q = query(coursesRef, where('isPublished', '==', true));
                const querySnapshot = await getDocs(q);
                let fetchedCourses = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Course[];
                
                // Sort by createdAt descending and keep top 5
                fetchedCourses.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                });
                setCourses(fetchedCourses.slice(0, 5));

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);



    return (
        <div className="w-full min-h-screen bg-slate-50 dark:bg-[#0f1115] relative overflow-hidden">

            {/* Global Layout Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px] animate-pulse-slow delay-2000"></div>
            </div>

            {/* Main Wrapper */}
            <div className="relative z-10 w-full pb-20 space-y-20">
                <DemoSection />

                {/* Hero Layout Container (Slider + Copilot Mini) */}
                <div className="w-[95%] mx-auto mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch min-h-auto xl:min-h-[600px]">
                    
                    {/* Copilot Mini Box (Right Side RTL - Col span 4) */}
                    <div className="xl:col-span-4 bg-white dark:bg-[#111] rounded-[3rem] p-8 flex flex-col justify-center border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/20 dark:group-hover:bg-indigo-500/30 transition-colors duration-500"></div>
                        
                        <div className="relative z-10 w-full">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-800">
                                <Bot className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-3">
                                البحث الذكي السريع
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-sm leading-relaxed">
                                اكتب أي استفسار أو ابحث عن أداة معينة وسيقوم المساعد الذكي Tolzy Copilot بمساعدتك فوراً.
                            </p>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const q = formData.get('q') as string;
                                if (q.trim()) {
                                    window.location.href = `/copilot?q=${encodeURIComponent(q.trim())}`;
                                }
                            }} className="relative w-full">
                                <input 
                                    type="text" 
                                    name="q"
                                    placeholder="أداة لتعديل الفيديوهات بالذكاء..."
                                    required
                                    className="w-full bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl py-4 pr-5 pl-14 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm placeholder:text-slate-400 font-medium"
                                />
                                <button 
                                    type="submit" 
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-md shadow-indigo-500/30"
                                >
                                    <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Hero Static Copilot Banner Container (Left Side RTL - Col span 8) */}
                    <div className="xl:col-span-8 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-sm relative bg-white dark:bg-[#111] h-[300px] md:h-[450px] xl:h-[600px] flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 p-2 md:p-6">
                        <div className="relative z-10 w-full h-full rounded-[2.5rem] overflow-hidden block bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5">
                            <img 
                                src="/image/tools/copilot-demo.png?v=2" 
                                alt="تولزي مساعد مبرمج ذكي" 
                                className="w-full h-full object-contain object-center relative z-10"
                            />
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
                    {/* The New Big T O L Z Y AI Card */}
                    <div className="relative w-full rounded-[3rem] overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 p-10 md:p-16 text-center text-white shadow-2xl shadow-violet-500/20 group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-400/30 rounded-full blur-3xl -ml-20 -mb-20"></div>
                        
                        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto space-y-6">
                           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-sm font-bold backdrop-blur-md mb-2">
                                <Sparkles className="w-4 h-4 text-emerald-300" />
                                <span className="tracking-wide">جديد وحصري لك</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight drop-shadow-md">
                                أطلق العنان لإبداعك 🚀
                            </h2>
                            <p className="text-xl md:text-2xl text-violet-100 font-medium leading-relaxed">
                                <span className="text-white font-bold inline-block border-b-2 border-emerald-400 pb-1">T O L Z Y AI</span> نموذج لغوي كبير يساعدك في التفكير والكتابة والتحليل بسرعة ووضوح.
                            </p>
                            <a 
                                href="https://ai.tolzy.me" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-8 px-10 py-5 bg-white text-violet-700 hover:bg-slate-50 hover:text-indigo-600 rounded-2xl font-black text-xl md:text-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-2 flex items-center gap-4 active:scale-95 group/btn"
                            >
                                <span>ابدأ التصميم الآن مجاناً</span>
                                <Wand2 className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" />
                            </a>
                        </div>
                    </div>

                    <BentoHomeSection newTools={newTools || []} popularTools={featuredTools || []} />

                    {/* Courses Section */}
                    {courses.length > 0 && (
                        <div className="animate-fade-in-up pb-10">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100/50 dark:bg-green-900/30 rounded-2xl">
                                        <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                                        كورسات <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">مقترحة</span>
                                    </h2>
                                </div>
                                <Link href="/learn" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                                    <span>عرض الكل</span>
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                                        <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </Link>
                            </div>

                            <div className="relative -mx-4 px-4">
                                <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
                                    {courses.slice(0, 5).map(course => (
                                        <div key={course.id} className="min-w-[320px] md:min-w-[360px] snap-center hover:-translate-y-2 transition-transform duration-300">
                                            <SmartCourseCard
                                                course={course}
                                                onClick={() => router.push(`/learn/course/${course.id}`)}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute top-0 right-[-1px] w-24 h-full bg-gradient-to-l from-slate-50 dark:from-[#0f1115] to-transparent pointer-events-none hidden md:block"></div>
                                <div className="absolute top-0 left-[-1px] w-24 h-full bg-gradient-to-r from-slate-50 dark:from-[#0f1115] to-transparent pointer-events-none hidden md:block"></div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default LoggedInHome;
