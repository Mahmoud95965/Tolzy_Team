import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Award, Globe, MonitorPlay, Users, Star, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { Course } from '../../types/learn';

interface SmartCourseCardProps {
    course: Course;
    onClick: () => void;
    featured?: boolean;
}

const SmartCourseCard: React.FC<SmartCourseCardProps> = ({ course, onClick, featured = false }) => {
    // Simplified 3D effect - reduced intensity for cleaner feel
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["2deg", "-2deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-2deg", "2deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXVal = e.clientX - rect.left;
        const mouseYVal = e.clientY - rect.top;
        const xPct = mouseXVal / width - 0.5;
        const yPct = mouseYVal / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`group relative cursor-pointer h-full ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}
        >
            <div
                style={{ transform: "translateZ(10px)", transformStyle: "preserve-3d" }}
                className={`h-full bg-white dark:bg-slate-900 rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 ${featured ? 'flex flex-col md:flex-row' : 'flex flex-col'}`}
            >
                {/* Thumbnail */}
                <div className={`relative overflow-hidden ${featured ? 'md:w-3/5 h-64 md:h-auto' : 'h-40 md:h-48'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent z-10 opacity-60" />
                    <Image
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop'}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-3 right-3 z-20 flex flex-wrap gap-2 justify-end max-w-[80%]">
                        {course.sourceUrl ? (
                            <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-bold text-slate-900 flex items-center gap-1 shadow-md">
                                <Globe className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-500" />
                                {course.platform || 'خارجي'}
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-indigo-600/90 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
                                <MonitorPlay className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                حصري
                            </span>
                        )}
                    </div>

                    {/* Price Tag */}
                    <div className="absolute top-3 left-3 z-20 text-right">
                        <span className={`px-2 py-0.5 md:px-2.5 md:py-1 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-bold shadow-md ${course.price === 'free'
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-white/90 text-slate-900'
                            }`}>
                            {course.price === 'free' ? 'مجاني' : 'مدفوع'}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className={`p-4 md:p-5 flex flex-col ${featured ? 'md:w-2/5 justify-between' : 'flex-1'}`}>
                    <div>
                        <div className="flex items-center gap-3 text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 md:mb-2 text-right">
                            <span className="flex items-center gap-1">
                                <Users className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                {course.studentsCount ? course.studentsCount.toLocaleString() : '0'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className="flex items-center gap-1 text-amber-500">
                                <Star className="w-3 md:w-3.5 h-3 md:h-3.5 fill-current" />
                                {course.rating || 5.0}
                            </span>
                        </div>

                        <h3 className={`font-bold text-slate-900 dark:text-white leading-tight mb-1.5 md:mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-right ${featured ? 'text-xl md:text-2xl lg:text-3xl' : 'text-base md:text-lg line-clamp-2'}`}>
                            {course.title}
                        </h3>

                        <p className={`text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-3 md:mb-4 text-right ${featured ? 'line-clamp-4' : 'line-clamp-2'}`}>
                            {course.description}
                        </p>
                    </div>

                    <div className="mt-auto">
                        <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {(course.instructor?.[0] || 'T').toUpperCase()}
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] md:text-xs font-bold text-slate-900 dark:text-slate-200">
                                        {course.instructor || 'Tolzy Team'}
                                    </span>
                                    <span className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400">
                                        {course.level || 'مبتدئ'}
                                    </span>
                                </div>
                            </div>

                            <button className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                                <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SmartCourseCard;
