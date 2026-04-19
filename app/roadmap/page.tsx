import type { Metadata } from 'next';
import RoadmapPage from '@/src/views/RoadmapPage';

export const metadata: Metadata = {
    title: 'خارطة طريق Tolzy: اكتشف ما نبنيه للمستقبل',
    description: 'تعرّف على خطط Tolzy AI المستقبلية — ميزات قيد التطوير، تحسينات قادمة، ورؤيتنا لأقوى منصة ذكاء اصطناعي عربية.',
    openGraph: {
        title: 'خارطة طريق Tolzy: اكتشف ما نبنيه للمستقبل',
        description: 'خطط التطوير المستقبلية لمنصة Tolzy AI',
        url: 'https://www.tolzy.me/roadmap',
    },
};

export default function Roadmap() {
    return <RoadmapPage />;
}
