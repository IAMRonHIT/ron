'use client';

import React from 'react';
import { Agent } from '@/lib/ron-ai-store';
import { Bot, Cpu } from 'lucide-react';
import StatusIndicator from './StatusIndicator';
import ChatMessage from '../chat/ChatMessage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface MainAgentCardProps {
  agent: Agent;
}

/**
 * A detailed card component that displays comprehensive information about a single agent,
 * including its identity, status, and conversation history.
 */
const MainAgentCard: React.FC<MainAgentCardProps> = ({ agent }) => {
  return (
    <Card className="w-full h-[70vh] flex flex-col bg-secondary/80 border-border/60 glass-morphism">
      {/* Agent Identity Header */}
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border/60">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
                <CardTitle className="text-base font-bold">{agent.name}</CardTitle>
                <CardDescription className="text-xs">{agent.specialization}</CardDescription>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Cpu className="w-3 h-3" />
                    <span>{agent.model}</span>
                </div>
            </div>
        </div>
        <StatusIndicator status={agent.status} label={agent.status.charAt(0).toUpperCase() + agent.status.slice(1)} />
      </CardHeader>

      {/* Current Activity/Status Header */}
      <div className="p-3 bg-black/20 border-b border-border/60">
        <p className="text-xs font-semibold text-muted-foreground truncate">{agent.statusHeader}</p>
      </div>

      {/* Conversation History */}
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
                {agent.conversationHistory.length > 0 ? (
                    agent.conversationHistory.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))
                ) : (
                    <div className="text-center text-sm text-muted-foreground py-16">
                        <p>No conversation history yet.</p>
                        <p className="text-xs">This agent is idle.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MainAgentCard;
