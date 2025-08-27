'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { Rss, Zap, Bot, Search, FlaskConical, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const activityIcons: { [key: string]: React.ElementType } = {
    'ResearchAgent': FlaskConical,
    'DataAgent': Search,
    'CodeAgent': Code,
    'default': Bot,
};

/**
 * A live feed of agent activities, displayed in the right-hand rail.
 * Each item links back to a corresponding point in the chat history.
 */
const OrchestrationRail = () => {
    const { agentCommunications, addAgentCommunication } = useRonAIStore((state) => ({
        agentCommunications: state.agentCommunications,
        addAgentCommunication: state.addAgentCommunication,
    }));

    const handleMockActivity = () => {
        const activities = [
            { agentId: 'ResearchAgent', content: 'Searching PubMed for "melanoma treatments"' },
            { agentId: 'DataAgent', content: 'Analyzing search results from 3 sources.' },
            { agentId: 'CodeAgent', content: 'Generating Python script for data visualization.' },
        ];
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        addAgentCommunication(randomActivity);
    };

    const handleItemClick = (communicationId: string) => {
        // In a real implementation, this would scroll the chat thread to an anchor.
        console.log(`Jumping to chat message related to activity: ${communicationId}`);
    };

    return (
        <aside className="w-80 bg-surface-primary p-4 border-l border-border-divider hidden md:flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Rss className="w-5 h-5 text-text-secondary" />
                    <h2 className="text-xl font-bold">Orchestration</h2>
                </div>
                <Button size="sm" variant="outline" onClick={handleMockActivity}>Mock</Button>
            </div>
            <ScrollArea className="flex-grow">
                <div className="space-y-2 pr-2">
                    {agentCommunications.length > 0 ? (
                        [...agentCommunications].reverse().map(comm => {
                            const Icon = activityIcons[comm.agentId] || activityIcons.default;
                            return (
                                <button
                                    key={comm.id}
                                    onClick={() => handleItemClick(comm.id)}
                                    className="w-full text-left p-3 rounded-inner bg-surface-secondary hover:bg-surface-tertiary transition-colors border border-transparent hover:border-border-divider"
                                >
                                    <div className="flex items-start gap-3">
                                        <Icon className="w-4 h-4 text-text-secondary mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold">{comm.agentId}</p>
                                            <p className="text-xs text-text-secondary">{comm.content}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-text-secondary">
                            <p className="text-sm">Agent activities will appear here.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </aside>
    );
};

export default OrchestrationRail;
