import React from 'react';

const Sidebar = () => {
  // Using the new dark theme colors: bg-secondary for the charcoal background
  return (
    <aside className="w-64 flex-shrink-0 bg-secondary p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Ron.AI</h1>
        <p className="text-sm text-muted-foreground">v2.0 Foundation</p>
      </div>
      <nav className="flex flex-col space-y-2">
        <a href="#" className="py-2 px-3 rounded-md bg-primary/10 text-primary font-semibold">
          Chat
        </a>
        <a href="#" className="py-2 px-3 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
          Research
        </a>
        <a href="#" className="py-2 px-3 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
          Code
        </a>
        <a href="#" className="py-2 px-3 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
          Browser
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
