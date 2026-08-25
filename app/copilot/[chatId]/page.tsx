import { redirect } from 'next/navigation';

export async function generateStaticParams() {
    return [{ chatId: 'placeholder' }];
}

interface PageProps {
    params: Promise<{ chatId: string }>;
}

export default async function CopilotChatPageRedirect({ params }: PageProps) {
    const resolvedParams = await params;
    redirect(`/axiom/${resolvedParams.chatId}`);
}
