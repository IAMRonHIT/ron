import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ContentArea from './ContentArea';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <ContentArea>
          {children}
        </ContentArea>
      </div>
    </div>
  );
};

export default DashboardLayout;
