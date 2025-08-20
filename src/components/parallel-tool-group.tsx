"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ToolOutputCard } from "@/components/tool-output-card"
import { AgentCard } from "@/components/agent-card"
import { 
  Zap,
  GitBranch
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConversationEvent } from "@/lib/types"

interface ParallelToolGroupProps {
  events: ConversationEvent[]
  className?: string
}

export function ParallelToolGroup({
  events,
  className
}: ParallelToolGroupProps) {
  if (events.length === 0) return null
  
  // Check if all tools are complete
  const allComplete = events.every(e => e.status === "completed")
  const hasErrors = events.some(e => e.status === "error")
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      "bg-gradient-to-r from-indigo-50/30 to-purple-50/30",
      "dark:from-indigo-950/10 dark:to-purple-950/10",
      "border-indigo-200 dark:border-indigo-800",
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-indigo-200/50 dark:border-indigo-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2">
                Parallel Execution
                <Badge variant="secondary" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  {events.length} tools
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Running multiple tools simultaneously for faster results
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allComplete && !hasErrors && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                All Complete
              </Badge>
            )}
            {hasErrors && (
              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Some Failed
              </Badge>
            )}
            {!allComplete && !hasErrors && (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                In Progress
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Tool Grid */}
      <div className="p-4">
        <div className={cn(
          "grid gap-3",
          events.length === 2 ? "md:grid-cols-2" : 
          events.length === 3 ? "md:grid-cols-3" : 
          events.length >= 4 ? "md:grid-cols-2 lg:grid-cols-3" : 
          "grid-cols-1"
        )}>
          {events.map((event) => {
            // Render appropriate card based on event type
            if (event.type === "agent_spawn" || event.type === "agent_result") {
              return (
                <div key={event.id} className="animate-slide-up">
                  <AgentCard
                    agentName={event.data.agentName || "Agent"}
                    agentSpecialty={event.data.agentSpecialty}
                    task={event.data.agentTask}
                    result={event.type === "agent_result" ? event.data.toolOutput : undefined}
                    status={event.status as any}
                    timestamp={event.timestamp}
                    className="h-full"
                  />
                </div>
              )
            } else {
              return (
                <div key={event.id} className="animate-slide-up">
                  <ToolOutputCard
                    toolName={event.data.toolName || "unknown"}
                    content={event.status === "completed" ? event.data.toolOutput : event.data.toolInput}
                    timestamp={event.timestamp}
                    status={event.status as any}
                    className="h-full"
                  />
                </div>
              )
            }
          })}
        </div>
        
        {/* Progress indicator for running tools */}
        {!allComplete && (
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" />
              </div>
              <span>Processing in parallel...</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}