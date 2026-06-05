import ChatInterface from '@/src/components/Copilot/ChatInterface';

export async function generateStaticParams() {
    return [{ chatId: 'placeholder' }];
}

interface PageProps {
    params: Promise<{ chatId: string }>;
}

export default async function CopilotChatPage({ params }: PageProps) {
    const resolvedParams = await params;
    const chatId = resolvedParams.chatId;

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
            {/* Load Google Material Symbols Outlined stylesheet directly in Copilot dynamic chats */}
            <link 
                rel="stylesheet" 
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
            />

            <ChatInterface initialChatId={chatId} />
        </div>
    );
}
