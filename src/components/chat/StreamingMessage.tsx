'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * A component that displays the in-progress, streaming message from the AI assistant.
 * It subscribes to the `currentStreamingMessage` from the Zustand store and renders
 * it with a typing indicator.
 */
const StreamingMessage = () => {
  const streamingMessage = useRonAIStore((state) => state.currentStreamingMessage);
  const isProcessing = useRonAIStore((state) => state.isProcessing);

  // Only render this component if we are actively processing and have some content.
  if (!isProcessing || !streamingMessage) {
    return null;
  }

  return (
    <div className="flex items-start gap-4 w-full animate-fade-in">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <Bot className="w-5 h-5 text-primary-foreground" />
      </div>

      {/* Streaming Message Content */}
      <div className="max-w-3xl rounded-2xl p-4 bg-secondary text-secondary-foreground">
        <ReactMarkdown
          className="prose prose-sm dark:prose-invert max-w-none"
          remarkPlugins={[remarkGfm]}
          // The `streaming-text` class from globals.css adds the blinking cursor effect
        >
          {`${streamingMessage}▍`}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default StreamingMessage;
