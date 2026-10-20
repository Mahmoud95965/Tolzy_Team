import type { Metadata } from 'next';
import CreatorTechProfileView from '@/src/views/CreatorTechProfileView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const decodedId = decodeURIComponent(id || 'مبدع');
  return {
    title: `${decodedId} - الملف الشخصي والتقني | TOLZY`,
    description: `استكشف الملف التقني وحزم الأدوات والمنشورات والمقارنات للمبدع ${decodedId} في مجتمع TOLZY.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CommunityUserProfilePage({ params }: PageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id || '');
  return <CreatorTechProfileView identifier={decodedId} />;
}
