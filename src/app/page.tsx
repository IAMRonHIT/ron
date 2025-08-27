'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AgentCardGrid from '@/components/agent-cards/AgentCardGrid';
import ChatView from '@/components/chat/ChatView';
import AgentEcosystemView from '@/components/agents/AgentEcosystemView';
import BrowserView from '@/components/browser/BrowserView';
import CodeView from '@/components/code/CodeView';
import ResearchView from '@/components/research/ResearchView';
import { useRonAIStore } from '@/lib/ron-ai-store';

/**
 * Main application page for the Ron AI Frontend Redesign.
 * This component serves as the root of the new layout, integrating the
 * dashboard structure and conditionally rendering the active view based
 * on the state from the Zustand store.
 */
export default function RonAIRedesignPage() {
  const activeView = useRonAIStore((state) => state.activeView);

  const renderContent = () => {
    switch (activeView) {
      case 'chat':
        return <ChatView />;
      case 'agents':
        return <AgentEcosystemView />;
      case 'research':
        return <ResearchView />;
      case 'code':
        return <CodeView />;
      case 'browser':
        return <BrowserView />;
      default:
        // The default view is the agent grid, which we can consider the "dashboard"
        return <AgentCardGrid />;
    }
  };

  return (
    <main className="dark">
      <DashboardLayout>
        {renderContent()}
      </DashboardLayout>
    </main>
  );
}
