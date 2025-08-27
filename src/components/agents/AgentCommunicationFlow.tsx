'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * A placeholder component for the future agent communication visualization graph.
 * For now, it displays a message indicating that the feature is coming soon.
 */
const AgentCommunicationFlow = () => {
  return (
    <Card className="h-full flex flex-col bg-secondary/80 border-border/60">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Zap className="w-5 h-5 text-primary" />
        <CardTitle className="text-base">Communication Flow</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <div className="text-center text-muted-foreground p-8 border-2 border-dashed border-border/50 rounded-lg">
          <p className="text-sm font-semibold">Communication Visualization Coming Soon</p>
          <p className="text-xs mt-2">
            This area will display a real-time graph of agent interactions,
            <br />
            message passing, and tool usage.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCommunicationFlow;
