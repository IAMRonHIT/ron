'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Paperclip } from 'lucide-react';

const MessageInput = () => {
  const [inputValue, setInputValue] = useState('');
  const addMessage = useRonAIStore((state) => state.addMessage);
  const isProcessing = useRonAIStore((state) => state.isProcessing);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    addMessage({
      role: 'user',
      content: inputValue,
    });

    setInputValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  return (
    <div className="p-4 bg-card/50 backdrop-blur-sm border-t border-border">
      <div className="flex items-end gap-2">
        {/* Placeholder buttons for future features */}
        <Button variant="ghost" size="icon" className="flex-shrink-0">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="flex-shrink-0">
          <Mic className="h-5 w-5 text-muted-foreground" />
        </Button>

        <div className="relative flex-grow">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start a conversation with Ron.AI..."
            className="w-full resize-none pr-12 py-2 pl-4 rounded-lg bg-secondary border-border min-h-[44px] max-h-48 overflow-y-auto"
            rows={1}
            disabled={isProcessing}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isProcessing || inputValue.trim() === ''}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            size="icon"
            variant="ghost"
          >
            <Send className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
