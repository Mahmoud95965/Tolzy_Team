import type { Metadata } from 'next';
import CommunityPromptPage from '@/src/views/CommunityPromptPage';
import { generateDiscussionForumSchema } from '@/src/utils/seoHelpers';

export const metadata: Metadata = {
    title: 'مجتمع TOLZY — شارك أفكارك مع المجتمع',
    description: 'انضم لمجتمع TOLZY! شارك أفكارك، أكوادك، ومقالاتك مع مجتمع المطورين والمبدعين العرب ونقاشات حول الذكاء الاصطناعي والبرمجة 2026.',
    openGraph: {
        title: 'مجتمع TOLZY — شارك أفكارك مع المجتمع',
        description: 'انضم لمجتمع TOLZY! شارك أفكارك، أكوادك، ومقالاتك مع مجتمع المطورين والمبدعين العرب ونقاشات حول الذكاء الاصطناعي والبرمجة 2026.',
        url: 'https://tolzy.me/community',
        type: 'website',
    },
    alternates: {
        canonical: 'https://tolzy.me/community',
    },
};

export default function Page() {
    // Representative high-value community threads for search indexing
    const indexedThreads = [
        {
            id: 'deepseek-v3-guide',
            title: 'دليل شامل لاستخدام نموذج DeepSeek-V3 ومقارنته مع GPT-4o',
            content: 'كيفية دمج واستخدام DeepSeek-V3 في مشاريعك البرمجية والحصول على أفضل كفاءة بأقل تكلفة ممكنة.',
            author: 'محمود موسى',
            createdAt: '2026-05-10T12:00:00Z',
            repliesCount: 14,
        },
        {
            id: 'cursor-ai-tips',
            title: 'أفضل الاختصارات والبرومبتات لتسريع الإنتاجية باستخدام Cursor AI',
            content: 'نصائح وحيل احترافية للمطورين لتسريع كتابة الأكواد وأتمتة المهام الروتينية بمساعدة الذكاء الاصطناعي.',
            author: 'أحمد خالد',
            createdAt: '2026-05-15T09:30:00Z',
            repliesCount: 8,
        },
        {
            id: 'ai-design-tools-2026',
            title: 'مستقبل التصميم: هل تحل أدوات توليد الصور بالـ AI بديل المصمم الجرافيكي؟',
            content: 'نقاش مفتوح حول اندماج أدوات الذكاء الاصطناعي في سير عمل المصممين وكيفية استغلالها لزيادة السرعة والإبداع.',
            author: 'سارة علي',
            createdAt: '2026-05-18T15:45:00Z',
            repliesCount: 22,
        }
    ];

    const forumSchema = generateDiscussionForumSchema(indexedThreads);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(forumSchema) }}
            />
            <CommunityPromptPage />
        </>
    );
}
