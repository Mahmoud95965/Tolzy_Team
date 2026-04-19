
import type { Metadata } from 'next';
import NewsDetailPage from '@/src/views/NewsDetailPage';
import { getArticleById, getPublishedArticles } from '@/src/services/articles.service';
import { generateNewsMetadata, generateArticleSchema, generateBreadcrumbData } from '@/src/utils/seoHelpers';
import { notFound } from 'next/navigation';

type Props = {
    params: Promise<{ id: string }>;
};

// Generate static paths for top news - Critical for SEO!
// Fetching a reasonable number of latest articles for SSG
export async function generateStaticParams() {
    try {
        const { articles } = await getPublishedArticles(1, 50);

        return articles.map((article) => ({
            id: article.id,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

// Generate metadata for each news page using centralized helper
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const article = await getArticleById(id);

    if (!article) {
        return {
            title: 'الخبر غير موجود - Tolzy',
        };
    }

    // Map Supabase Article (snake_case) to Helper format (camelCase)
    // Map Supabase Article (snake_case) to Helper format (camelCase)
    const seoArticle = {
        id: article.id,
        title: article.title,
        description: article.excerpt || '',
        content: article.content || '',
        category: article.category,
        coverImageUrl: article.cover_image_url,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        author: article.author_name,
        articleType: article.article_type, // Pass the type
    };

    // Use centralized metadata generator
    return generateNewsMetadata(seoArticle);
}


export default async function NewsDetail({ params }: Props) {
    const { id } = await params;
    const article = await getArticleById(id);

    if (!article) {
        notFound();
    }

    // Generate enhanced Article structured data using centralized helper
    const structuredData = generateArticleSchema({
        id: article.id,
        title: article.title,
        description: article.excerpt || article.content?.substring(0, 160) || '',
        content: article.content || '',
        coverImageUrl: article.cover_image_url,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        author: article.author_name,
        category: article.category,
        articleType: article.article_type, // Pass the type
    });

    // Generate Breadcrumbs
    const breadcrumbs = generateBreadcrumbData([
        { name: 'الرئيسية', url: 'https://tolzy.me' },
        { name: 'الأخبار', url: 'https://tolzy.me/news' },
        { name: article.category || 'مقال', url: `https://tolzy.me/news?category=${encodeURIComponent(article.category || '')}` },
        { name: article.title, url: `https://tolzy.me/news/${article.id}` }
    ]);

    const schemas = [structuredData, breadcrumbs].filter(Boolean);

    return (
        <>
            {schemas.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.length === 1 ? schemas[0] : schemas) }}
                />
            )}
            <NewsDetailPage initialArticle={article} />
        </>
    );
}

// Enable ISR
export const revalidate = 3600; // Revalidate every hour
