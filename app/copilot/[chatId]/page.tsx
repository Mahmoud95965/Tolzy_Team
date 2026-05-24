"use client";
import ChatInterface from '@/src/components/Copilot/ChatInterface';
import { useParams } from 'next/navigation';

export default function CopilotChatPage() {
    const params = useParams();
    const chatId = params?.chatId as string;

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
