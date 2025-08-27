'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Rss } from 'lucide-react';

/**
 * A component that displays a real-time, chronological feed of agent-to-agent
 * communications and activities from the orchestration system.
 */
const OrchestrationFeed = () => {
  const agentCommunications = useRonAIStore((state) => state.agentCommunications);

  return (
    <Card className="h-full flex flex-col bg-secondary/80 border-border/60">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Rss className="w-5 h-5 text-primary" />
        <CardTitle className="text-base">Orchestration Feed</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {agentCommunications.length > 0 ? (
              [...agentCommunications].reverse().map((comm) => (
                <div key={comm.id} className="flex items-start gap-3 text-xs animate-fade-in">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                    <MessageSquare className="w-3 h-3 text-accent" />
                  </div>
                  <div className="flex-grow bg-black/20 p-3 rounded-md">
                    <p className="font-semibold text-muted-foreground">
                      Agent: <span className="text-accent-purple font-bold">{comm.agentId}</span>
                    </p>
                    <p className="text-foreground mt-1 whitespace-pre-wrap">{comm.content}</p>
                    <p className="text-muted-foreground/80 text-right mt-1">
                      {new Date(comm.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-muted-foreground py-16">
                <p>No agent communications yet.</p>
                <p className="text-xs">Activities will appear here as agents work.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default OrchestrationFeed;
