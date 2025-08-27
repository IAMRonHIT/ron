'use client';

import React, { useState, useEffect } from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { useBrowserManager } from './BrowserSessionManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { PlusCircle, X, RefreshCw, Globe } from 'lucide-react';

/**
 * A multi-tab browser panel that displays and manages active browser sessions.
 * It uses a tabbed interface to switch between sessions and provides controls
 * for creating, closing, and refreshing them.
 */
const BrowserPanel = () => {
  const browserSessions = useRonAIStore((state) => state.browserSessions);
  const { createSession, closeSession, navigateSession } = useBrowserManager();
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  useEffect(() => {
    // If there's no active tab but there are sessions, activate the first one.
    if (!activeTab && browserSessions.length > 0) {
      setActiveTab(browserSessions[0].sessionId);
    }
    // If the active tab is closed, switch to another one.
    if (activeTab && !browserSessions.find(s => s.sessionId === activeTab)) {
      setActiveTab(browserSessions.length > 0 ? browserSessions[0].sessionId : undefined);
    }
  }, [browserSessions, activeTab]);

  const handleCreateSession = async () => {
    const newSessionId = await createSession();
    setActiveTab(newSessionId);
  };

  const handleCloseSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Prevent the tab from being selected when closing
    closeSession(sessionId);
  };

  return (
    <div className="h-full flex flex-col bg-secondary/80 border-border/60 rounded-lg glass-morphism">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <div className="flex items-center p-2 border-b border-border/60">
            <TabsList className="bg-transparent p-0 gap-1">
                {browserSessions.map((session) => (
                    <TabsTrigger
                        key={session.sessionId}
                        value={session.sessionId}
                        className="flex items-center gap-2 text-xs h-8 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                    >
                        <Globe className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{session.title || 'New Tab'}</span>
                        <button
                            onClick={(e) => handleCloseSession(e, session.sessionId)}
                            className="p-0.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive-foreground"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </TabsTrigger>
                ))}
            </TabsList>
            <Button variant="ghost" size="icon" className="h-7 w-7 ml-2 flex-shrink-0" onClick={handleCreateSession}>
                <PlusCircle className="h-4 w-4" />
            </Button>
        </div>

        {browserSessions.map((session) => (
            <TabsContent key={session.sessionId} value={session.sessionId} className="flex-grow bg-black/30 p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => navigateSession(session.sessionId, session.url)} // Mock refresh
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <div className="flex-grow p-2 bg-black/50 rounded-md text-sm text-muted-foreground truncate">
                        {session.url}
                    </div>
                </div>
                <div className="w-full flex-grow bg-black/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border/40">
                    {session.screenshotUrl ? (
                        <img src={session.screenshotUrl} alt={`Screenshot of ${session.title}`} className="object-contain max-h-full max-w-full" />
                    ) : (
                        <p className="text-muted-foreground">Browser content will appear here.</p>
                    )}
                </div>
            </TabsContent>
        ))}
        {browserSessions.length === 0 && (
             <div className="flex-grow flex items-center justify-center text-muted-foreground">
                <p>No active browser sessions. Click '+' to create one.</p>
            </div>
        )}
      </Tabs>
    </div>
  );
};

export default BrowserPanel;
