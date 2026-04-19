import React from 'react';
import ChatInterface from '../components/Copilot/ChatInterface';

const CopilotPage: React.FC = () => {
    return (
        <div className="fixed inset-0 h-[100dvh] bg-[#FDFDFD] dark:bg-[#050505] overflow-hidden font-sans selection:bg-[#fea619]/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#fea619]/5 dark:bg-[#fea619]/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow delay-700" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10 h-full">
                <ChatInterface />
            </div>
        </div>
    );
};

export default CopilotPage;
