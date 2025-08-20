"use client"

import { MessageCard } from "@/components/message-card"
import { ThinkingBubble } from "@/components/thinking-bubble"
import { ToolOutputCard } from "@/components/tool-output-card"
import { AgentCard } from "@/components/agent-card"
import { ParallelToolGroup } from "@/components/parallel-tool-group"
import { cn } from "@/lib/utils"
import type { ConversationEvent } from "@/lib/types"

interface ConversationItemProps {
  event: ConversationEvent
  isStreaming?: boolean
  className?: string
}

export function ConversationItem({ 
  event, 
  isStreaming = false,
  className 
}: ConversationItemProps) {
  // Handle parallel tool groups specially
  if (event.type === 'parallel_group' as any) {
    return (
      <ParallelToolGroup
        events={event.data.events as ConversationEvent[]}
        className={className}
      />
    )
  }
  
  // Render based on event type
  switch (event.type) {
    case "user_message":
    case "assistant_message":
      return (
        <MessageCard
          role={event.data.role || "assistant"}
          content={event.data.content || ""}
          timestamp={event.timestamp}
          isStreaming={isStreaming}
          className={className}
        />
      )
      
    case "thinking":
      return (
        <div className={cn("animate-slide-up", className)}>
          <ThinkingBubble
            content={event.data.reasoning || ""}
            tokenCount={event.data.reasoningTokens}
            isStreaming={isStreaming || event.status === "streaming"}
          />
        </div>
      )
      
    case "tool_call":
      return (
        <div className={cn("animate-slide-up", className)}>
          <ToolOutputCard
            toolName={event.data.toolName || "unknown"}
            content={event.data.toolInput}
            timestamp={event.timestamp}
            status={event.status as any}
            isToolCall={true}
          />
        </div>
      )
      
    case "tool_result":
      return (
        <div className={cn("animate-slide-up", className)}>
          <ToolOutputCard
            toolName={event.data.toolName || "unknown"}
            content={event.data.toolOutput}
            timestamp={event.timestamp}
            status="completed"
            isToolResult={true}
          />
        </div>
      )
      
    case "agent_spawn":
    case "agent_result":
      return (
        <div className={cn("animate-slide-up", className)}>
          <AgentCard
            agentName={event.data.agentName || "Agent"}
            agentSpecialty={event.data.agentSpecialty}
            task={event.data.agentTask}
            result={event.type === "agent_result" ? event.data.toolOutput : undefined}
            status={event.status as any}
            timestamp={event.timestamp}
          />
        </div>
      )
      
    case "error":
      return (
        <div className={cn("animate-slide-up", className)}>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <span className="text-sm font-medium">Error</span>
              <span className="text-xs">{event.timestamp.toLocaleTimeString()}</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {event.data.error || "An error occurred"}
            </p>
          </div>
        </div>
      )
      
    default:
      return null
  }
}