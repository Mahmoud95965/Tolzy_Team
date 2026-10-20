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
  /** إضافة padding-top لتعويض الـ Navbar الثابت (للصفحات بدون hero section) */
  navbarOffset?: boolean;
  hideNavbar?: boolean;
  hideFooter?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  showCopilot = false, 
  showSidebar = false,
  navbarOffset = true,
  hideNavbar = false,
  hideFooter = false
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#ffffff] text-[#14140f] overflow-x-hidden w-full selection:bg-[#beff50] selection:text-[#14140f]">
      {!hideNavbar && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
      )}
      <div className="flex flex-1">
        {showSidebar && <AppSidebar />}
        <main className={`flex-grow w-full min-w-0 pb-[72px] md:pb-0 ${navbarOffset && !hideNavbar ? 'pt-20' : ''} ${showSidebar ? 'lg:mr-64' : ''}`}>
          {children}
        </main>
      </div>
      {showCopilot && <CopilotFloatingButton />}
      {!hideFooter && <div className="hidden md:block"><Footer /></div>}
      <MobileBottomNav />
    </div>
  );
};

export default PageLayout;