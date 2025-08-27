'use client';

import React, { useEffect, useRef } from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import MessageInput from './MessageInput';
import ChatMessage from './ChatMessage';
import StreamingMessage from './StreamingMessage';
import ChainOfThoughtBubble from './ChainOfThoughtBubble';
import ToolOutputCard from '../tools/ToolOutputCard';
import { ScrollArea } from '@/components/ui/scroll-area';

const ChatView = () => {
  const { messages, streamingMessage, toolOutputs } = useRonAIStore((state) => ({
    messages: state.messages,
    streamingMessage: state.currentStreamingMessage,
    toolOutputs: state.toolOutputs,
  }));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom on new messages or while streaming
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage, toolOutputs]);

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          <ChainOfThoughtBubble />
          {toolOutputs.map((output, index) => (
            <ToolOutputCard key={index} toolOutput={output} />
          ))}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <StreamingMessage />
          {/* Empty div to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="max-w-4xl mx-auto w-full">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatView;
