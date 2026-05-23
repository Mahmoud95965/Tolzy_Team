import type { Metadata } from 'next';
import ToolDetailPage from '@/src/views/ToolDetailPage';
import { getAllToolsFromFirebase, getToolByIdFromFirebase } from '@/lib/firebase-admin';
import { generateToolMetadata, generateToolSEO, generateBreadcrumbData } from '@/src/utils/seoHelpers';

type Props = {
    params: Promise<{ id: string }>;
};

// Generate static paths for all tools - Critical for SEO!
// Returning empty array at build time allows pages to be rendered dynamically on-demand (ISR) and prevents Firebase quota exhaustion.
export async function generateStaticParams() {
    return [];
}

// Generate metadata for each tool page using centralized helper
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const tool = await getToolByIdFromFirebase(id);

    if (!tool) {
        return {
            title: 'الأداة غير موجودة - Tolzy',
        };
    }

    // Use centralized metadata generator
    return generateToolMetadata(tool);
}


export default async function ToolDetail({ params }: Props) {
    const { id } = await params;
    const tool = await getToolByIdFromFirebase(id);

    // Generate enhanced structured data using centralized helper
    const structuredData = tool ? generateToolSEO(tool).structuredData : null;

    // Generate Breadcrumbs
    const getCategoryString = (cat: any) => Array.isArray(cat) ? cat[0] : (cat || 'أدوات');
    const categoryStr = getCategoryString(tool?.category);
    
    const breadcrumbs = tool ? generateBreadcrumbData([
        { name: 'الرئيسية', url: 'https://tolzy.me' },
        { name: 'الأدوات', url: 'https://tolzy.me/tools' },
        { name: categoryStr, url: `https://tolzy.me/tools?category=${encodeURIComponent(categoryStr)}` },
        { name: tool.name, url: `https://tolzy.me/tools/${tool.id}` }
    ]) : null;

    const schemas = [structuredData, breadcrumbs].filter(Boolean);

    return (
        <>
            {schemas.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.length === 1 ? schemas[0] : schemas) }}
                />
            )}
            <ToolDetailPage initialTool={tool} />
        </>
    );
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour
