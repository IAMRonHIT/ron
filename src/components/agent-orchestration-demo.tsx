import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AgentActivity {
  id: string
  type: 'search' | 'fetch' | 'analysis' | 'synthesis' | 'thinking' | 'tool'
  agent: string
  description: string
  status: 'running' | 'completed' | 'error'
  timestamp: Date
  details?: any
  progress?: number
}

const mockAgentActivities: AgentActivity[] = [
  {
    id: '1',
    type: 'search',
    agent: 'Research Agent',
    description: 'Searching PubMed for depression breakthrough therapies',
    status: 'completed',
    timestamp: new Date(Date.now() - 5000),
    details: 'Found 25 relevant studies from 2022-2024'
  },
  {
    id: '2',
    type: 'fetch',
    agent: 'Research Agent', 
    description: 'Fetching abstracts for key studies',
    status: 'completed',
    timestamp: new Date(Date.now() - 4000),
    details: 'Retrieved abstracts for 8 PMIDs: [39311825, 39638064, 39428602...]'
  },
  {
    id: '3',
    type: 'search',
    agent: 'Research Agent',
    description: 'Searching psilocybin depression trials',
    status: 'completed', 
    timestamp: new Date(Date.now() - 3000),
    details: 'Found 20 clinical trials on psychedelic therapies'
  },
  {
    id: '4',
    type: 'synthesis',
    agent: 'Clinical Agent',
    description: 'Analyzing breakthrough trends in depression treatment',
    status: 'running',
    timestamp: new Date(Date.now() - 2000),
    progress: 75
  },
  {
    id: '5',
    type: 'analysis',
    agent: 'Analysis Agent',
    description: 'Deep research on novel therapeutic approaches',
    status: 'running',
    timestamp: new Date(Date.now() - 1000),
    progress: 45
  }
];

export const AgentOrchestrationDemo: React.FC = () => {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const startDemo = () => {
    setActivities([]);
    setIsRunning(true);
    
    // Simulate activities appearing over time
    mockAgentActivities.forEach((activity, index) => {
      setTimeout(() => {
        setActivities(prev => [...prev, activity]);
        
        // Simulate completion for running activities
        if (activity.status === 'running') {
          setTimeout(() => {
            setActivities(prev => prev.map(a => 
              a.id === activity.id 
                ? { ...a, status: 'completed' as const, progress: 100 }
                : a
            ));
          }, 3000);
        }
      }, index * 1000);
    });
    
    // Stop demo after all activities complete
    setTimeout(() => {
      setIsRunning(false);
    }, 8000);
  };

  const stopDemo = () => {
    setIsRunning(false);
    setActivities([]);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🧪 Agent Orchestration Demo</span>
          <div className="space-x-2">
            <Button onClick={startDemo} disabled={isRunning} size="sm">
              {isRunning ? 'Running...' : 'Start Demo'}
            </Button>
            <Button onClick={stopDemo} variant="outline" size="sm">
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          This demonstrates how your agent orchestration will look when processing complex research queries. 
          The actual implementation will stream real-time data from your backend agents.
        </p>
        
        {activities.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">
              Simulated Agent Activities ({activities.length} activities)
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              {activities.map(activity => (
                <div key={activity.id} className={`flex items-center gap-2 p-2 rounded ${
                  activity.status === 'running' ? 'bg-blue-50' : 
                  activity.status === 'completed' ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    activity.status === 'running' ? 'bg-blue-500 animate-pulse' :
                    activity.status === 'completed' ? 'bg-green-500' : 'bg-gray-500'
                  }`}></span>
                  <span className="font-medium">{activity.agent}:</span>
                  <span>{activity.description}</span>
                  {activity.progress !== undefined && activity.status === 'running' && (
                    <span className="text-blue-600">({activity.progress}%)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activities.length === 0 && !isRunning && (
          <div className="text-center text-gray-500 py-8">
            Click "Start Demo" to see agent orchestration in action
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentOrchestrationDemo;
