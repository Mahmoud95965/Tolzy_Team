import { MetadataRoute } from 'next';
import { getAllToolsFromFirebase, getAllCoursesFromFirebase } from '@/lib/firebase-admin';
import { getFallbackTools } from '@/src/data/fallbackTools';
import { getFallbackCourses } from '@/src/data/fallbackCourses';

export const revalidate = 3600; // Revalidate dynamic sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://tolzy.me';

    // Static canonical pages with SEO priorities (removed deprecated / redirected paths like /axiom and /build)
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/tools`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.95,
        },
        {
            url: `${baseUrl}/learn`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/community`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    try {
        // Dynamic tool pages
        let tools: any[] = [];
        try {
            tools = await getAllToolsFromFirebase();
        } catch (e) {
            console.warn('[sitemap] Could not fetch tools from Firebase Admin:', e);
        }

        if (!tools || tools.length === 0) {
            tools = getFallbackTools();
        }

        const toolPages: MetadataRoute.Sitemap = tools.map((tool: any) => ({
            url: `${baseUrl}/tools/${tool.id}`,
            lastModified: tool.submittedAt || tool.updatedAt ? new Date(tool.submittedAt || tool.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // Dynamic course pages (Firebase + Supabase + Fallback)
        let courses: any[] = [];
        try {
            courses = await getAllCoursesFromFirebase();
        } catch (e) {
            console.warn('[sitemap] Could not fetch courses from Firebase Admin:', e);
        }

        // If no courses from Firebase, try Supabase
        if (!courses || courses.length === 0) {
            try {
                const { createClient } = await import('@supabase/supabase-js');
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://zdhjnbsjkglumsakpmoj.supabase.co';
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
                const supabase = createClient(supabaseUrl, supabaseKey);
                const { data } = await supabase.from('courses').select('id, updated_at');
                if (data && data.length > 0) {
                    courses = data.map((c: any) => ({
                        id: c.id,
                        updatedAt: c.updated_at
                    }));
                }
            } catch (e) {
                // Ignore and use fallback
            }
        }

        // If still empty, use fallback courses
        if (!courses || courses.length === 0) {
            courses = getFallbackCourses().map(c => ({
                id: c.id,
                updatedAt: c.updatedAt || new Date().toISOString()
            }));
        }

        const coursePages: MetadataRoute.Sitemap = courses.map((course: any) => ({
            url: `${baseUrl}/learn/course/${course.id}`,
            lastModified: course.updatedAt ? new Date(course.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.85,
        }));

        // Category pages - 32 Standard Categories for High-Volume SEO Ranking
        const categories = [
            'Writing', 'Design', 'Programming', 'Research', 'Productivity',
            'Language Learning', 'Studying', 'Teaching', 'Test Prep', 'Education',
            'Business', 'Data Science', 'Creativity', 'Communication', 'Collaboration',
            'Project Management', 'Automation', '3D', 'Video', 'Math', 'Science',
            'Reading', 'Memory', 'Games', 'Gamification', 'Lifestyle', 'Technology',
            'Electronics', 'Freelancing', 'Library', 'Online Learning', 'Other'
        ];

        const categoryPages: MetadataRoute.Sitemap = categories.map(category => ({
            url: `${baseUrl}/tools?category=${encodeURIComponent(category)}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        return [...staticPages, ...toolPages, ...coursePages, ...categoryPages];
    } catch (error) {
        console.error('❌ Error generating dynamic sitemap:', error);
        return staticPages;
    }
}
