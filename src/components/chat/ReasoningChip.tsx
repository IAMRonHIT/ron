'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { BrainCircuit, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';

const ReasoningChip = () => {
  const currentReasoning = useRonAIStore((state) => state.currentReasoning);
  const isProcessing = useRonAIStore((state) => state.isProcessing);
  const [isOpen, setIsOpen] = React.useState(false);

  if (!isProcessing || !currentReasoning) {
    return null;
  }

  const thoughtBlocks = currentReasoning.split('\n').filter(block => block.trim() !== '');

  return (
    <div className={cn(
        "max-w-md mx-auto w-full my-2 transition-opacity",
        !isOpen && "opacity-70"
    )}>
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full bg-surface-secondary border border-divider rounded-chip"
        >
          <CollapsibleTrigger className="w-full p-2 flex justify-between items-center cursor-pointer group">
            <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-brand-accent-middle" />
                <span className="text-xs font-medium text-muted-foreground">Reasoning</span>
            </div>
            <div className="flex items-center">
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-2 pb-2">
            <div className="mt-2 pt-2 border-t border-divider space-y-2">
              {thoughtBlocks.map((block, index) => (
                <div key={index} className="p-2 bg-surface-tertiary rounded-inner text-xs text-muted-foreground">
                  {block}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
    </div>
  );
};

export default ReasoningChip;
