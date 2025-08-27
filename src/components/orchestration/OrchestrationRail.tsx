'use client';

import React, { useEffect } from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot,
  Search,
  Code,
  FlaskConical,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader,
  type LucideIcon,
} from 'lucide-react';
import { ConversationEvent } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Helper to get display properties for an activity
const getActivityDisplay = (
  activity: ConversationEvent
): { Icon: LucideIcon; label: string; color: string } => {
  const statusColorMap = {
    pending: 'text-yellow-400',
    executing: 'text-blue-400',
    streaming: 'text-blue-400',
    completed: 'text-green-400',
    error: 'text-red-400',
  };
  const color = statusColorMap[activity.status] || 'text-gray-400';

  switch (activity.type) {
    case 'agent_spawn':
      return { Icon: Bot, label: `Agent spawned: ${activity.data.agentName}`, color };
    case 'tool_call':
      return { Icon: FlaskConical, label: `Tool call: ${activity.data.toolName}`, color };
    case 'tool_result':
        return { Icon: CheckCircle2, label: `Tool result: ${activity.data.toolName}`, color };
    case 'thinking':
      return { Icon: Loader, label: 'Thinking...', color };
    case 'user_message':
      return { Icon: MessageSquare, label: 'User message', color: 'text-gray-400' };
    case 'assistant_message':
      return { Icon: Bot, label: 'Assistant message', color };
    case 'error':
      return { Icon: AlertCircle, label: 'Error occurred', color };
    default:
      return { Icon: Bot, label: 'System event', color };
  }
};

// Individual Activity Item
const ActivityItem = ({ activity }: { activity: ConversationEvent }) => {
  const { Icon, label, color } = getActivityDisplay(activity);

  const handleItemClick = () => {
    // In a future step, this will scroll the chat view to the corresponding message anchor
    console.log(`Scrolling to activity: ${activity.id}`);
  };

  return (
    <div
      onClick={handleItemClick}
      className="flex items-center space-x-3 p-2 rounded-inner hover:bg-surface-tertiary cursor-pointer transition-subtle"
    >
      <div className="flex-shrink-0">
        <Icon className={cn('h-4 w-4', color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
        </p>
      </div>
      <div className={cn('h-2 w-2 rounded-full flex-shrink-0', color.replace('text-', 'bg-'))} />
    </div>
  );
};


// Main Orchestration Rail Component
const OrchestrationRail = () => {
  const { activities, addActivity } = useRonAIStore((state) => ({
    activities: state.activities,
    addActivity: state.addActivity,
  }));

  // Add mock data on mount for demonstration
  useEffect(() => {
    if (activities.length === 0) {
      const mockActivities: Omit<ConversationEvent, 'id' | 'timestamp'>[] = [
        { type: 'user_message', status: 'completed', data: { content: 'Find me a doctor' } },
        { type: 'thinking', status: 'executing', data: {} },
        { type: 'agent_spawn', status: 'completed', data: { agentName: 'ProviderSearchAgent' } },
        { type: 'tool_call', status: 'executing', data: { toolName: 'provider_search' } },
        { type: 'tool_result', status: 'completed', data: { toolName: 'provider_search', toolOutput: 'Found 3 doctors' } },
        { type: 'assistant_message', status: 'streaming', data: { content: 'I found these...' } },
      ];
      mockActivities.forEach((act, index) => {
        setTimeout(() => addActivity(act), index * 500);
      });
    }
  }, []);

  return (
    <div className="h-full w-full bg-surface-primary p-4 border-l border-divider flex flex-col">
      <h2 className="text-lg font-semibold tracking-headings mb-4 flex-shrink-0">
        Orchestration Feed
      </h2>
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default OrchestrationRail;
