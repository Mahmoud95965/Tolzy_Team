"use client";
import ChatInterface from '@/src/components/Copilot/ChatInterface';
import { useParams } from 'next/navigation';

export default function CopilotChatPage() {
    const params = useParams();
    const chatId = params?.chatId as string;

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">

            <ChatInterface initialChatId={chatId} />
        </div>
    );
}
