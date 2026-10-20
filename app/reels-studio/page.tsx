import type { Metadata } from 'next';
import ReelsStudio from './components/ReelsStudio';

export const metadata: Metadata = {
  title: 'TOLZY Reels Studio ⚡ - صانع ومصدّر فيديوهات الريلز العمودية 9:16',
  description:
    'استوديو تفاعلي لتوليد وتصدير فيديوهات الريلز العمودية (9:16) بجودة 1080x1920 وبمعدل 60 إطار بالثانية مع مزامنة التعليق الصوتي والترجمة التلقائية لمنصة تولزي.',
  openGraph: {
    title: 'TOLZY Vertical Reels Studio & MP4 Exporter',
    description: 'صانع فيديوهات الريلز العمودية لأدوات الذكاء الاصطناعي مع التصدير المباشر لـ MP4',
  },
};

export default function ReelsStudioPage() {
  return <ReelsStudio />;
}
