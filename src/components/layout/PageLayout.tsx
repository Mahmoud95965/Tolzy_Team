import React from 'react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import CopilotFloatingButton from '../common/CopilotFloatingButton';
import AppSidebar from './AppSidebar';
import MobileBottomNav from '../common/MobileBottomNav';

interface PageLayoutProps {
  children: React.ReactNode;
  showCopilot?: boolean;
  showSidebar?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  showCopilot = true, 
  showSidebar = false 
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 overflow-x-hidden w-full">
      <Navbar />
      <div className="flex flex-1">
        {showSidebar && <AppSidebar />}
        <main className={`flex-grow w-full min-w-0 pb-[72px] md:pb-0 ${showSidebar ? 'lg:mr-64' : ''}`}>
          {children}
        </main>
      </div>
      {showCopilot && <CopilotFloatingButton />}
      <div className="hidden md:block"><Footer /></div>
      <MobileBottomNav />
    </div>
  );
};

export default PageLayout;