"use client";
import React from 'react';
import { Clock, Award, Globe, Star, Users, BookOpen } from 'lucide-react';
import { Course } from '../../types/learn';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CourseCardProps {
    course: Course;
    onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.push(`/learn/course/${course.id}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="group bg-[#0f1322]/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col h-full"
        >
            {/* Cover Image */}
            <div className="relative aspect-video bg-[#090a0f] overflow-hidden">
                <Image
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Provider Badge */}
                <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-[#090a0f]/60 backdrop-blur-md rounded-md text-xs font-bold text-slate-300 border border-white/5 flex items-center gap-1.5">
                        {course.sourceUrl ? <Globe className="w-3 h-3 text-emerald-400" /> : <BookOpen className="w-3 h-3 text-emerald-400" />}
                        {course.platform || 'Tolzy'}
                    </span>
                </div>

                {/* Certificate Badge */}
                {course.hasCertificate && (
                    <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] font-medium text-white flex items-center gap-1">
                            <Award className="w-3 h-3 text-yellow-400" />
                            شهادة معتمدة
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1 text-right" dir="rtl">
                {/* Title & Instructor */}
                <div className="mb-4 flex-1">
                    <h3 className="font-black text-white text-lg leading-tight line-clamp-2 mb-2 group-hover:text-emerald-400 transition-colors">
                        {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center justify-end gap-1 font-bold">
                        بواسطة <span className="text-slate-200">{course.instructor || 'أكاديمية تولزي'}</span>
                    </p>
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center justify-end gap-3 mb-4 text-xs font-bold">
                    <span className="text-slate-500">({course.reviewsCount || 12} تقييم)</span>
                    <div className="flex items-center gap-1 text-amber-400">
                        <span className="text-sm">{course.rating || 4.8}</span>
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < Math.floor(course.rating || 4.8) ? 'fill-current text-amber-400' : 'text-slate-800'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Metadata Divider */}
                <div className="h-px bg-white/5 mb-4" />

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                    <span className={`px-2.5 py-1 rounded-full border ${course.price === 'free' || !course.price 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]'}`}>
                        {course.price === 'free' || !course.price ? 'مجاني' : 'حصري'}
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 bg-[#0f1322] px-2 py-1 rounded-lg border border-white/5 text-[10px]">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            {course.duration || 'مستمر'}
                        </span>
                        <span className="flex items-center gap-1 bg-[#0f1322] px-2 py-1 rounded-lg border border-white/5 text-[10px]">
                            <Users className="w-3 h-3 text-emerald-400" />
                            {course.studentsCount ? course.studentsCount.toLocaleString() : '0'}
                        </span>
                        <span className="flex items-center gap-1 bg-[#0f1322] px-2 py-1 rounded-lg border border-white/5 text-[10px] capitalize">
                            <BookOpen className="w-3 h-3 text-emerald-400" />
                            {course.level === 'beginner' ? 'مبتدئ' : course.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
