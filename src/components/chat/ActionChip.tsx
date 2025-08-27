'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { Button } from '@/components/ui/button';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionChipProps {
  icon: LucideIcon;
  label: string;
  status: 'idle' | 'in-progress' | 'completed' | 'error';
  drawerView: string;
  onClick?: () => void;
}

const ActionChip: React.FC<ActionChipProps> = ({
  icon: Icon,
  label,
  status,
  drawerView,
  onClick,
}) => {
  const openDrawer = useRonAIStore((state) => state.openDrawer);

  const statusClasses = {
    idle: 'border-divider bg-surface-secondary hover:bg-surface-tertiary',
    'in-progress': 'border-blue-500/50 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20',
    completed: 'border-green-500/50 bg-green-500/10 text-green-300 hover:bg-green-500/20',
    error: 'border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20',
  };

  const statusDotClasses = {
    idle: 'bg-gray-400',
    'in-progress': 'bg-blue-400 animate-pulse',
    completed: 'bg-green-400',
    error: 'bg-red-400',
  };

  const handleChipClick = () => {
    openDrawer(drawerView);
    if (onClick) {
      onClick();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleChipClick}
      className={cn(
        'h-auto px-3 py-1.5 rounded-chip text-xs font-medium transition-subtle',
        statusClasses[status]
      )}
    >
      <Icon className="h-4 w-4 mr-2" />
      <span>{label}</span>
      <div className={cn('h-2 w-2 rounded-full ml-2', statusDotClasses[status])} />
    </Button>
  );
};

export default ActionChip;
