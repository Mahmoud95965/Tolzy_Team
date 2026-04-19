import type { Metadata } from 'next';
import CommunityPage from '@/src/views/CommunityPage';

export const metadata: Metadata = {
    title: 'مجتمع تولزي: شارك أكوادك، تعلّم من الأفضل، وتطوّر',
    description: 'انضم لمجتمع المبدعين والمطورين العرب. شارك أفكارك، أكوادك، وPrompts عبقرية — واكتشف ما يشاركه الآخرون!',
};

export default function Page() {
    return <CommunityPage />;
}
