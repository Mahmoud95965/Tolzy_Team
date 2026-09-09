import { MetadataRoute } from 'next';
import { getAllToolsFromFirebase, getAllCoursesFromFirebase } from '@/lib/firebase-admin';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://tolzy.me';

    // Static pages with SEO priorities
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
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/build`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.85,
        },
        {
            url: `${baseUrl}/axiom`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
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
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/privacy-policy`,
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

    // Dynamic tool pages - CRITICAL FOR SEO!
    try {
        const tools = await getAllToolsFromFirebase();

        const toolPages: MetadataRoute.Sitemap = tools.map((tool: any) => ({
            url: `${baseUrl}/tools/${tool.id}`,
            lastModified: tool.submittedAt ? new Date(tool.submittedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // Dynamic course pages
        const courses = await getAllCoursesFromFirebase();
        const coursePages: MetadataRoute.Sitemap = courses.map((course: any) => ({
            url: `${baseUrl}/learn/course/${course.id}`,
            lastModified: course.updatedAt ? new Date(course.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.85,
        }));

        // Category pages - Important for SEO!
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

        console.log(`✅ Generated sitemap with ${staticPages.length} static pages, ${toolPages.length} tools, ${coursePages.length} courses, and ${categoryPages.length} categories`);

        return [...staticPages, ...toolPages, ...coursePages, ...categoryPages];
    } catch (error) {
        console.error('❌ Error generating dynamic sitemap:', error);
        return staticPages;
    }
}
