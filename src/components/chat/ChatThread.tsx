'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import HeroQuickStarts from './HeroQuickStarts';
import ChatDock from './ChatDock';
// We will need a message list component here later.
// For now, we just need to decide whether to show the hero or the (empty) message list.

/**
 * The main component for the central chat thread. It decides whether to show
 * the initial hero state or the list of messages, and it always includes the ChatDock.
 */
const ChatThread = () => {
    const messages = useRonAIStore((state) => state.messages);

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow">
                {messages.length === 0 ? (
                    <HeroQuickStarts />
                ) : (
                    <div className="p-4">
                        {/*
                          This div will later contain the virtualized message list,
                          including the InlineActionChips, reasoning bubbles, etc.
                          For now, it's a placeholder.
                        */}
                        <p className="text-text-secondary">Message list will appear here.</p>
                        {/* We can map messages for debugging if needed */}
                        {/* {messages.map(m => <div key={m.id}>{m.content}</div>)} */}
                    </div>
                )}
            </div>
            <ChatDock />
        </div>
    );
};

export default ChatThread;
