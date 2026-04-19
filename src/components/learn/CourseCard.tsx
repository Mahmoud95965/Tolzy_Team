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
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
        >
            {/* Cover Image */}
            <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <Image
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Provider Badge */}
                <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-semibold text-gray-900 shadow-sm flex items-center gap-1.5">
                        {course.sourceUrl ? <Globe className="w-3 h-3 text-indigo-600" /> : <BookOpen className="w-3 h-3 text-indigo-600" />}
                        {course.platform || 'Tolzy'}
                    </span>
                </div>

                {/* Certificate Badge */}
                {course.hasCertificate && (
                    <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] font-medium text-white flex items-center gap-1">
                            <Award className="w-3 h-3 text-yellow-400" />
                            Certificate
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                {/* Title & Instructor */}
                <div className="mb-4 flex-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                        By <span className="font-medium text-gray-700">{course.instructor || 'Unknown Instructor'}</span>
                    </p>
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                        <span className="text-base">{course.rating || 4.8}</span>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < Math.floor(course.rating || 4.8) ? 'fill-current' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <span className="text-gray-400 text-xs">({course.reviewsCount || 120} reviews)</span>
                </div>

                {/* Metadata Divider */}
                <div className="h-px bg-gray-100 mb-4" />

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                            <Clock className="w-3 h-3" />
                            {course.duration || 'Self-paced'}
                        </span>
                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded capitalize">
                            <Users className="w-3 h-3" />
                            {course.studentsCount ? course.studentsCount.toLocaleString() : '0'}
                        </span>
                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded capitalize">
                            <BookOpen className="w-3 h-3" />
                            {course.level || 'Beginner'}
                        </span>
                    </div>

                    <span className={`text-sm font-bold ${course.price === 'free' || !course.price ? 'text-green-600' : 'text-gray-900'}`}>
                        {course.price === 'free' || !course.price ? 'Free' : '$49.99'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
