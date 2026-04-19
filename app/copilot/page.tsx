import type { Metadata } from 'next';
import CopilotPage from '@/src/views/CopilotPage';
import { generateCopilotMetadata } from '@/src/utils/seoHelpers';

export const metadata: Metadata = generateCopilotMetadata();

export default function Page() {
    return <CopilotPage />;
}
