import type { Metadata } from 'next';
import CreatorTechProfileView from '@/src/views/CreatorTechProfileView';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateStaticParams() {
  return [{ username: 'placeholder' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username || 'مبدع');
  return {
    title: `${decodedUsername} - الملف التقني | TOLZY`,
    description: `استكشف الملف التقني وحزم الأدوات والمنشورات والمقارنات للمبدع ${decodedUsername} في مجتمع TOLZY.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function UserProfileShortPage({ params }: PageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username || '');
  return <CreatorTechProfileView identifier={decodedUsername} />;
}
