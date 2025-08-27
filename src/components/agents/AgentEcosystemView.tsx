'use client';

import React, { useState, useEffect } from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import MainAgentCard from './MainAgentCard';
import OrchestrationFeed from './OrchestrationFeed';
import AgentCommunicationFlow from './AgentCommunicationFlow';
import { Button } from '@/components/ui/button';
import { Agent } from '@/lib/ron-ai-store';
import { PlusCircle } from 'lucide-react';

/**
 * A container component that assembles the entire agent ecosystem interface,
 * including the agent roster, the main agent view, and the orchestration/flow feeds.
 */
const AgentEcosystemView = () => {
  const agents = useRonAIStore((state) => state.agents);
  const spawnAgent = useRonAIStore((state) => state.spawnAgent);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    // Automatically select the first agent if none is selected
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
    // If the selected agent is removed, deselect it
    if (selectedAgent && !agents.find(a => a.id === selectedAgent.id)) {
        setSelectedAgent(agents.length > 0 ? agents[0] : null);
    }
  }, [agents, selectedAgent]);

  const handleSpawnAgent = () => {
    spawnAgent({
      name: `Specialist Agent #${agents.length + 1}`,
      specialization: 'Task Decomposition',
      type: 'general',
      description: 'An agent specialized in breaking down complex tasks into smaller, manageable steps.',
      model: 'claude-3-opus-20240229',
    });
  };

  return (
    <div className="flex h-full gap-6 p-6 bg-background">
      {/* Left panel: Agent Roster */}
      <div className="w-1/4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Agent Roster</h2>
            <Button onClick={handleSpawnAgent} size="sm" variant="ghost">
                <PlusCircle className="w-4 h-4 mr-2" />
                Spawn Agent
            </Button>
          </div>
          <div className="flex-grow space-y-2 overflow-y-auto pr-2">
            {agents.map(agent => (
                <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedAgent?.id === agent.id ? 'bg-primary/20 border-primary' : 'bg-secondary border-border hover:border-border/60'}`}
                >
                    <p className="font-semibold text-sm">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.specialization}</p>
                </div>
            ))}
          </div>
      </div>

      {/* Center panel: Main Agent Card */}
      <div className="w-1/2">
        {selectedAgent ? (
          <MainAgentCard agent={selectedAgent} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary rounded-lg border-2 border-dashed border-border/60">
            <div className="text-center">
                <p>No Agent Selected</p>
                <p className="text-xs">Spawn an agent or select one from the roster.</p>
            </div>
          </div>
        )}
      </div>

      {/* Right panel: Feeds */}
      <div className="w-1/4 flex flex-col gap-6">
        <div className="h-1/2">
            <OrchestrationFeed />
        </div>
        <div className="h-1/2">
            <AgentCommunicationFlow />
        </div>
      </div>
    </div>
  );
};

export default AgentEcosystemView;
