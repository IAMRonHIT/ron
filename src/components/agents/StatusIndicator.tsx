import React from 'react';
import { cn } from '@/lib/utils';
import { Agent } from '@/lib/ron-ai-store'; // Using the Agent status type

type Status = Agent['status'];

interface StatusIndicatorProps {
  status: Status;
  label?: string;
  className?: string;
}

const statusConfig: { [key in Status]: { color: string; label: string; } } = {
  idle: { color: 'bg-green-500', label: 'Idle' },
  working: { color: 'bg-yellow-500 animate-pulse', label: 'Working' },
  finished: { color: 'bg-blue-500', label: 'Finished' },
  error: { color: 'bg-red-500', label: 'Error' },
};

/**
 * A generic component to display a status with a colored dot and an optional label.
 * It's designed to be reusable for agents, tools, sessions, etc.
 */
const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label, className }) => {
  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("h-2.5 w-2.5 rounded-full", config.color)} />
      {label && (
        <span className="text-xs font-medium text-muted-foreground">
            {label}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;
