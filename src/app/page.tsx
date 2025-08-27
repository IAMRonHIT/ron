'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AgentCardGrid from '@/components/agent-cards/AgentCardGrid';

/**
 * Main application page for the Ron AI Frontend Redesign.
 * This component serves as the root of the new layout, integrating the
 * dashboard structure and the agent management grid.
 */
export default function RonAIRedesignPage() {
  return (
    <main className="dark">
      <DashboardLayout>
        <AgentCardGrid />
      </DashboardLayout>
    </main>
  );
}
