'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ContentArea from './ContentArea';
import OrchestrationRail from '../orchestration/OrchestrationRail';
import OutputDrawer from '../drawer/OutputDrawer';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-canvas text-foreground font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={80}>
            <ContentArea>
              {children}
            </ContentArea>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={20} maxSize={30} minSize={15} collapsible>
            <OrchestrationRail />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <OutputDrawer />
    </div>
  );
};

export default DashboardLayout;
