import type { Metadata } from 'next';
import CommunityPromptPage from '@/src/views/CommunityPromptPage';

export const metadata: Metadata = {
    title: 'مجتمع TOLZY — شارك أفكارك مع المجتمع',
    description: 'انضم لمجتمع TOLZY! شارك أفكارك، أكوادك، ومقالاتك مع مجتمع المطورين والمبدعين العرب.',
};

export default function Page() {
    return <CommunityPromptPage />;
}
