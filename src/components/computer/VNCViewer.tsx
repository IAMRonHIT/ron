'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Power, Tv, Maximize, Keyboard, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VNCViewerProps {
    // In the future, this would take connection details as props
    // e.g., host, port, password
}

/**
 * A placeholder component that simulates the look and feel of a VNC viewer.
 * It establishes the UI foundation for a future full-featured VNC client integration.
 */
const VNCViewer: React.FC<VNCViewerProps> = () => {
  const [isConnected, setIsConnected] = React.useState(false);

  return (
    <div className="h-full flex flex-col bg-black border border-border/60 rounded-lg overflow-hidden glass-morphism">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-secondary/80 border-b border-border/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setIsConnected(!isConnected)}
          >
            {isConnected ? <PowerOff className="w-3 h-3 mr-1 text-red-500" /> : <Power className="w-3 h-3 mr-1 text-green-500" />}
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" disabled={!isConnected}>
            <Keyboard className="w-3 h-3 mr-1" />
            Ctrl+Alt+Del
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" disabled={!isConnected}>
            <Maximize className="w-3 h-3 mr-1" />
            Fit to Screen
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
            <div className={cn("w-2 h-2 rounded-full", isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500')} />
            <span className={cn(isConnected ? 'text-green-400' : 'text-red-400')}>
                {isConnected ? 'Connected' : 'Disconnected'}
            </span>
        </div>
      </div>

      {/* Screen Area */}
      <div className="flex-grow bg-black flex items-center justify-center p-4">
        {isConnected ? (
             <div className="text-center text-muted-foreground">
                <p>Connection established.</p>
                <p className="text-xs">Remote desktop stream would appear here.</p>
             </div>
        ) : (
            <div className="text-center text-muted-foreground">
                <Tv className="w-16 h-16 mx-auto mb-4" />
                <p className="font-semibold">VNC Viewer</p>
                <p className="text-sm">Click "Connect" to start a session.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default VNCViewer;
