'use client';

import React, { useState } from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Settings2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * The main chat input component, styled as a floating glass panel at the bottom of the screen.
 */
const ChatDock = () => {
    const [inputValue, setInputValue] = useState('');
    const { addMessage } = useRonAIStore();

    const handleSendMessage = () => {
        if (inputValue.trim() === '') return;
        // For now, new messages are added directly.
        // In a real scenario, this would trigger the whole orchestration flow.
        addMessage({
            role: 'user',
            content: inputValue,
            // These would be added by the backend/orchestrator
            // reasoning: "User asked a question.",
            // type: 'text',
        });
        setInputValue('');
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          handleSendMessage();
        }
    };

    return (
        <div className="p-4 pb-6">
            <div className="glass-panel rounded-outer p-2 focus-within:ring-2 ring-teal glow-sm">
                <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Start a conversation with Ron AI..."
                    className="w-full bg-transparent border-none focus-visible:ring-0 text-base p-4"
                    rows={1}
                />
                <div className="flex justify-between items-center mt-2 p-2">
                    <Popover>
                        <PopoverTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Settings2 className="w-5 h-5 text-text-secondary" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" side="top" align="start">
                            <div className="p-4 space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch id="deep-research" />
                                    <Label htmlFor="deep-research" className="text-xs">Deep Research</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="tools-enabled" defaultChecked />
                                    <Label htmlFor="tools-enabled" className="text-xs">Tools</Label>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Mic className="w-5 h-5 text-text-secondary" />
                        </Button>
                        <Button onClick={handleSendMessage} size="icon" className="h-9 w-9 bg-surface-tertiary hover:bg-surface-tertiary/80">
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatDock;
