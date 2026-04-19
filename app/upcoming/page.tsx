import type { Metadata } from 'next';
import UpcomingUpdatesPage from '@/src/views/UpcomingUpdatesPage';

export const metadata: Metadata = {
    title: 'صوّت على الميزة القادمة: شارك في تشكيل مستقبل Tolzy!',
    description: 'اقتراحات المجتمع والتحديثات القادمة. صوّت على الميزات التي تريدها وأضف أفكارك — صوتك يصنع الفرق!',
};

export default function Page() {
    return <UpcomingUpdatesPage />;
}
