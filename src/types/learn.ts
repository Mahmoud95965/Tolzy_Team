export interface Attachment {
    id: string;
    title: string;
    url: string;
    type: 'file' | 'audio' | 'book';
}

export interface Lesson {
    id: string;
    title: string;
    content: string; // Markdown content
    videoUrl?: string;
    duration: number; // in minutes
    order: number;
    attachments?: Attachment[];
    likes?: number;
    likedBy?: string[]; // User IDs
}

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    instructor: string;
    price: 'free' | 'paid';
    lessons: Lesson[];
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    studentsCount: number;
    enrolledUserIds?: string[];
    rating: number;
    sourceUrl?: string;
    platform?: string;
    language?: string;
    hasCertificate?: boolean;
    duration?: string;
    instructorRole?: string;
    instructorBio?: string;
    instructorAvatar?: string;
    reviewsCount?: number;
    whatYouWillLearn?: string[];
    metadata?: Record<string, any>;
}

export interface PathStep {
    id: string;
    title: string;
    description: string;
    courses?: string[]; // Course IDs
    resources?: { title: string; url: string; type: 'article' | 'video' | 'project' }[];
    duration?: string;
}

export interface LearningPath {
    id: string;
    title: string;
    description: string;
    icon: any; // Changed to ReactNode to support Lucide icons
    color: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: string;
    steps: PathStep[];
    featured?: boolean;
    jobRole?: string;
    averageSalary?: string;
}

