"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bot, 
  Brain,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  Sparkles,
  Shield,
  Search,
  Phone,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

interface AgentCardProps {
  agentName: string
  agentSpecialty?: string
  task?: string
  result?: any
  status: "pending" | "executing" | "completed" | "error"
  timestamp: Date
  className?: string
}

// Get appropriate icon for agent specialty
const getAgentIcon = (specialty?: string) => {
  if (!specialty) return Bot
  
  const lowerSpecialty = specialty.toLowerCase()
  if (lowerSpecialty.includes('clinical') || lowerSpecialty.includes('medical')) return Shield
  if (lowerSpecialty.includes('research') || lowerSpecialty.includes('search')) return Search
  if (lowerSpecialty.includes('phone') || lowerSpecialty.includes('call')) return Phone
  if (lowerSpecialty.includes('document') || lowerSpecialty.includes('report')) return FileText
  if (lowerSpecialty.includes('insurance') || lowerSpecialty.includes('pharmacy')) return Brain
  
  return Bot
}

// Get color scheme based on agent type
const getAgentColor = (specialty?: string) => {
  if (!specialty) return { bg: "bg-purple-500", border: "border-purple-200 dark:border-purple-800", light: "bg-purple-50 dark:bg-purple-950/30" }
  
  const lowerSpecialty = specialty.toLowerCase()
  if (lowerSpecialty.includes('clinical')) 
    return { bg: "bg-red-500", border: "border-red-200 dark:border-red-800", light: "bg-red-50 dark:bg-red-950/30" }
  if (lowerSpecialty.includes('research')) 
    return { bg: "bg-blue-500", border: "border-blue-200 dark:border-blue-800", light: "bg-blue-50 dark:bg-blue-950/30" }
  if (lowerSpecialty.includes('insurance')) 
    return { bg: "bg-green-500", border: "border-green-200 dark:border-green-800", light: "bg-green-50 dark:bg-green-950/30" }
  if (lowerSpecialty.includes('pharmacy')) 
    return { bg: "bg-orange-500", border: "border-orange-200 dark:border-orange-800", light: "bg-orange-50 dark:bg-orange-950/30" }
  
  return { bg: "bg-purple-500", border: "border-purple-200 dark:border-purple-800", light: "bg-purple-50 dark:bg-purple-950/30" }
}

export function AgentCard({
  agentName,
  agentSpecialty,
  task,
  result,
  status,
  timestamp,
  className
}: AgentCardProps) {
  const Icon = getAgentIcon(agentSpecialty)
  const colors = getAgentColor(agentSpecialty)
  
  // Format result for display
  const formatResult = () => {
    if (!result) return null
    
    if (typeof result === 'string') {
      return result
    } else if (result.success === false) {
      return `Error: ${result.error || 'Operation failed'}`
    } else if (result.json) {
      return JSON.stringify(result.json, null, 2)
    } else if (typeof result === 'object') {
      return JSON.stringify(result, null, 2)
    }
    
    return String(result)
  }
  
  const formattedResult = formatResult()
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      colors.border,
      colors.light,
      "backdrop-blur-sm",
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm relative",
              colors.bg
            )}>
              <Icon className="w-5 h-5 text-white" />
              {status === "executing" && (
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2">
                {agentName}
                {agentSpecialty && (
                  <Badge variant="secondary" className="text-xs">
                    {agentSpecialty}
                  </Badge>
                )}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {status === "pending" && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Preparing...
                  </span>
                )}
                {status === "executing" && (
                  <span className="text-xs text-blue-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Working...
                  </span>
                )}
                {status === "completed" && (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Complete
                  </span>
                )}
                {status === "error" && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Error
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {task && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Task:</p>
            <p className="text-sm">{task}</p>
          </div>
        )}
        
        {formattedResult && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {status === "error" ? "Error Details:" : "Result:"}
            </p>
            <ScrollArea className="max-h-60">
              <div className={cn(
                "text-sm rounded-md p-3",
                status === "error" ? "bg-red-100 dark:bg-red-950/50" : "bg-background/50"
              )}>
                {formattedResult.length > 500 ? (
                  <pre className="whitespace-pre-wrap text-xs font-mono">
                    {formattedResult}
                  </pre>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {formattedResult}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {status === "executing" && !result && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" />
            </div>
            <span>Agent is thinking...</span>
          </div>
        )}
      </div>
    </Card>
  )
}