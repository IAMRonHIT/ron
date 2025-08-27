'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, FlaskConical, Beaker } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const ChatDock = () => {
  const [inputValue, setInputValue] = useState('');
  const {
    addMessage,
    isProcessing,
    deepResearchEnabled,
    toolsEnabled,
    toggleDeepResearch,
    toggleTools,
  } = useRonAIStore((state) => ({
    addMessage: state.addMessage,
    isProcessing: state.isProcessing,
    deepResearchEnabled: state.deepResearchEnabled,
    toolsEnabled: state.toolsEnabled,
    toggleDeepResearch: state.toggleDeepResearch,
    toggleTools: state.toggleTools,
  }));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    addMessage({ role: 'user', content: inputValue });
    setInputValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  return (
    <div className="p-4">
        <div className={cn('w-full max-w-4xl mx-auto p-3 rounded-outer glass-panel transition-subtle')}>
            <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="flex-shrink-0 group">
                    <Mic className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-subtle" />
                </Button>
                <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Chat with Ron AI..."
                    className="w-full resize-none pr-10 py-2 pl-3 rounded-inner bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px] max-h-48 overflow-y-auto"
                    rows={1}
                    disabled={isProcessing}
                />
                <Button
                    onClick={handleSendMessage}
                    disabled={isProcessing || inputValue.trim() === ''}
                    size="icon"
                    className="bg-accent-gradient text-white rounded-inner flex-shrink-0 w-9 h-9"
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex items-center justify-end gap-4 pt-2 mt-2 border-t border-divider">
                <div className="flex items-center space-x-2">
                    <Beaker className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="deep-research-toggle" className="text-sm font-medium text-muted-foreground">
                        Deep Research
                    </Label>
                    <Switch
                        id="deep-research-toggle"
                        checked={deepResearchEnabled}
                        onCheckedChange={toggleDeepResearch}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="tools-toggle" className="text-sm font-medium text-muted-foreground">
                        Tools
                    </Label>
                    <Switch
                        id="tools-toggle"
                        checked={toolsEnabled}
                        onCheckedChange={toggleTools}
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default ChatDock;
