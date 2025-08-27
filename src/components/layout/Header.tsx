import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';

const Header = () => {
  const activeView = useRonAIStore((state) => state.activeView);

  // Capitalize the first letter of the view name for the title
  const title = activeView.charAt(0).toUpperCase() + activeView.slice(1);

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-background border-b border-border">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div>
        {/* Placeholder for user profile, theme toggle, etc. */}
        <div className="w-8 h-8 rounded-full bg-primary"></div>
      </div>
    </header>
  );
};

export default Header;
