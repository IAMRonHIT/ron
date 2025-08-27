'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import AgentCard from './AgentCard';
import { Button } from '@/components/ui/button'; // Using the existing ShadCN button

const AgentCardGrid = () => {
  const agents = useRonAIStore((state) => state.agents);
  const spawnAgent = useRonAIStore((state) => state.spawnAgent);

  // A function to create a new agent with some default/randomized data
  const handleSpawnAgent = () => {
    const agentNumber = agents.length + 1;
    const specializations = ['Data Analysis', 'Research Synthesis', 'Code Generation', 'UI/UX Design'];
    const selectedSpec = specializations[Math.floor(Math.random() * specializations.length)];

    spawnAgent({
      name: `Ron-Agent-${agentNumber}`,
      specialization: selectedSpec,
      type: 'general',
      description: `A specialized agent for ${selectedSpec}.`,
    });
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Agent Ecosystem</h2>
        <Button onClick={handleSpawnAgent} className="glow-button">
          Spawn New Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-20 px-6 bg-card rounded-xl border-2 border-dashed border-border">
          <h3 className="text-lg font-semibold text-foreground">No Active Agents</h3>
          <p className="text-muted-foreground mt-2">
            Click the "Spawn New Agent" button to create your first AI agent.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentCardGrid;
