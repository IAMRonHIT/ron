import React from 'react';
import { Agent } from '@/lib/ron-ai-store';

interface AgentCardProps {
  agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const statusIndicator: { [key in Agent['status']]: string } = {
    idle: 'bg-green-500/20 text-green-400 border-green-500/30',
    working: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    finished: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="bg-card p-5 rounded-xl border border-border h-full flex flex-col justify-between glass-morphism hover-lift">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-foreground">{agent.name}</h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusIndicator[agent.status]}`}>
            {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1 font-medium">{agent.specialization}</p>
        <p className="text-xs text-muted-foreground/80">{agent.description}</p>
      </div>
      <div className="mt-5">
        {/* Placeholder for future actions */}
        <button className="w-full bg-primary/10 text-primary text-sm font-semibold py-2 rounded-lg hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
          View Details
        </button>
      </div>
    </div>
  );
};

export default AgentCard;
