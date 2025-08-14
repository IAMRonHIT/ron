import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Search, 
  Database, 
  Microscope, 
  Stethoscope, 
  FileText, 
  Zap,
  CheckCircle,
  Clock,
  ArrowRight,
  Activity
} from 'lucide-react';

interface AgentActivity {
  id: string;
  type: 'search' | 'fetch' | 'analysis' | 'synthesis' | 'thinking' | 'tool' | 'coordination' | 'orchestration';
  agent: string;
  description: string;
  status: 'running' | 'completed' | 'error' | 'planning';
  timestamp: Date;
  details?: any;
  progress?: number;
  isMainAgent?: boolean; // New: distinguish main orchestrating agent
  orchestrationPhase?: 'planning' | 'delegating' | 'monitoring' | 'synthesizing' | 'finalizing';
}

interface AgentOrchestrationProps {
  activities: AgentActivity[];
  currentAgent?: string;
  isActive: boolean;
}

const getIconForActivityType = (type: string) => {
  switch (type) {
    case 'search': return Search;
    case 'fetch': return Database;
    case 'analysis': return Microscope;
    case 'synthesis': return Stethoscope;
    case 'thinking': return Brain;
    case 'tool': return Zap;
    default: return Activity;
  }
};

const getColorForStatus = (status: string) => {
  switch (status) {
    case 'running': return 'blue';
    case 'completed': return 'green';
    case 'error': return 'red';
    default: return 'gray';
  }
};

export const AgentOrchestration: React.FC<AgentOrchestrationProps> = ({
  activities,
  currentAgent,
  isActive
}) => {
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  
  // Calculate overall progress
  const completedCount = activities.filter(a => a.status === 'completed').length;
  const totalCount = activities.length;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Group activities by agent
  const agentGroups = activities.reduce((acc, activity) => {
    if (!acc[activity.agent]) {
      acc[activity.agent] = [];
    }
    acc[activity.agent].push(activity);
    return acc;
  }, {} as Record<string, AgentActivity[]>);

  if (!isActive || activities.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Brain className="h-5 w-5" />
            Agent Orchestration
            {currentAgent && (
              <Badge variant="secondary" className="ml-2">
                {currentAgent}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            {completedCount}/{totalCount} completed
          </div>
        </div>
        
        {/* Overall Progress */}
        <div className="space-y-2">
          <Progress value={overallProgress} className="h-2" />
          <p className="text-sm text-gray-600">
            Research workflow progress: {Math.round(overallProgress)}%
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-64">
          <div className="space-y-4">
            {Object.entries(agentGroups).map(([agent, agentActivities]) => (
              <div key={agent} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {agent}
                </div>
                
                <div className="ml-4 space-y-1">
                  {agentActivities.map((activity) => {
                    const Icon = getIconForActivityType(activity.type);
                    const isExpanded = expandedActivity === activity.id;
                    
                    return (
                      <div
                        key={activity.id}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          activity.status === 'running' 
                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                            : activity.status === 'completed'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${
                            activity.status === 'running' ? 'animate-spin text-blue-600' :
                            activity.status === 'completed' ? 'text-green-600' :
                            'text-gray-600'
                          }`} />
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {activity.progress !== undefined && (
                              <div className="w-16">
                                <Progress value={activity.progress} className="h-1" />
                              </div>
                            )}
                            
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                getColorForStatus(activity.status) === 'blue' ? 'border-blue-300 text-blue-700' :
                                getColorForStatus(activity.status) === 'green' ? 'border-green-300 text-green-700' :
                                'border-red-300 text-red-700'
                              }`}
                            >
                              {activity.status === 'running' && <Clock className="h-3 w-3 mr-1" />}
                              {activity.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {activity.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Expanded Details */}
                        {isExpanded && activity.details && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-600 space-y-1">
                              {typeof activity.details === 'string' ? (
                                <p>{activity.details}</p>
                              ) : (
                                <pre className="whitespace-pre-wrap font-mono bg-gray-100 p-2 rounded text-xs">
                                  {JSON.stringify(activity.details, null, 2)}
                                </pre>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Real-time Activity Indicator */}
        {activities.some(a => a.status === 'running') && (
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            </div>
            <span>Agents coordinating research...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentOrchestration;
