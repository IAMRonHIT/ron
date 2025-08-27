'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { BrainCircuit, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils'; // I'll need to make sure this utility exists.

const ChainOfThoughtBubble = () => {
  const currentReasoning = useRonAIStore((state) => state.currentReasoning);
  const isProcessing = useRonAIStore((state) => state.isProcessing);
  const [isOpen, setIsOpen] = React.useState(false);

  // Only render if the AI is processing and has produced some reasoning text.
  if (!isProcessing || !currentReasoning) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto w-full animate-fade-in my-4">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full bg-secondary/60 border border-border/50 rounded-lg backdrop-blur-sm"
        >
          <CollapsibleTrigger className="w-full p-3 flex justify-between items-center cursor-pointer group">
            <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground">Thinking...</span>
            </div>
            <div className="flex items-center">
                <span className="text-xs text-muted-foreground mr-1">{isOpen ? "Hide" : "Show"}</span>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 pb-3">
            <div className="mt-2 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {currentReasoning}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
    </div>
  );
};

export default ChainOfThoughtBubble;
