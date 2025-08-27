'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import ToolOutputView from '../tools/ToolOutputView';
import CodeView from '../code/CodeView';
import BrowserPanel from '../browser/BrowserPanel';
import ResearchView from '../research/ResearchView';

const OutputDrawer = () => {
  const { isDrawerOpen, drawerView, closeDrawer } = useRonAIStore((state) => ({
    isDrawerOpen: state.isDrawerOpen,
    drawerView: state.drawerView,
    closeDrawer: state.closeDrawer,
  }));

  const renderContent = () => {
    switch (drawerView) {
      case 'Tool':
        return <ToolOutputView />;
      case 'Code':
        return <CodeView />;
      case 'Browser':
        return <BrowserPanel />;
      case 'Research':
        return <ResearchView />;
      // Add other cases for other drawer views as needed
      default:
        return (
          <div>
            <DrawerHeader>
              <DrawerTitle>Unknown View</DrawerTitle>
              <DrawerDescription>
                The requested view '{drawerView}' is not available.
              </DrawerDescription>
            </DrawerHeader>
          </div>
        );
    }
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()} direction="bottom">
      <DrawerContent className="h-[60%] bg-surface-primary border-t border-divider glass-panel">
        <div className="overflow-auto h-full">
          {renderContent()}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default OutputDrawer;
