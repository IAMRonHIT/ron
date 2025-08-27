'use client';

import React from 'react';
import { useRonAIStore, RonAIState } from '@/lib/ron-ai-store';
import { cn } from '@/lib/utils';
import { MessageCircle, BrainCircuit, FlaskConical, Code, Globe, Search } from 'lucide-react';

const Sidebar = () => {
  const { activeView, setActiveView } = useRonAIStore((state) => ({
    activeView: state.activeView,
    setActiveView: state.setActiveView,
  }));

  const navItems: { view: RonAIState['activeView']; label: string; icon: React.ElementType }[] = [
    { view: 'chat', label: 'Chat', icon: MessageCircle },
    { view: 'search', label: 'Search', icon: Search },
    { view: 'agents', label: 'Agents', icon: BrainCircuit },
    { view: 'research', label: 'Research', icon: FlaskConical },
    { view: 'code', label: 'Code', icon: Code },
    { view: 'browser', label: 'Browser', icon: Globe },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-secondary p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Ron.AI</h1>
        <p className="text-sm text-muted-foreground">Agent Ecosystem</p>
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={cn(
                "py-2 px-3 rounded-md text-left transition-colors flex items-center gap-3",
                activeView === item.view
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
