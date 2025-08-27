'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import OrchestrationRail from '@/components/layout/OrchestrationRail';
import OutputDrawer from '@/components/drawer/OutputDrawer';

// A generic loading component to be displayed while views are being loaded.
const ViewLoader = () => (
  <div className="flex items-center justify-center h-full w-full">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

// Dynamically import the main view components to enable code splitting.
const ChatThread = dynamic(() => import('@/components/chat/ChatThread'), { loading: () => <ViewLoader /> });
const SearchView = dynamic(() => import('@/components/search/SearchView'), { loading: () => <ViewLoader /> });
// Other views will be re-integrated as we rebuild them according to the new spec.

/**
 * Main application page for the Ron AI Frontend Redesign.
 * This component assembles the core three-part architecture and handles view switching.
 */
export default function RonAIRedesignPage() {
  const activeView = useRonAIStore((state) => state.activeView);

  const renderContent = () => {
    switch (activeView) {
      case 'search':
        return <SearchView />;
      // Add cases for 'kanban', 'calendar' etc. as they are built.
      case 'chat':
      default:
        return <ChatThread />;
    }
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-background flex">
        <Sidebar />
        {/* Main Content Area */}
        <div className="flex-grow flex flex-col relative">
            {renderContent()}
            {/* The drawer overlays the main content area */}
            <OutputDrawer />
        </div>

        {/* Right-hand Orchestration Rail */}
        <OrchestrationRail />
    </main>
  );
}
