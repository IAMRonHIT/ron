'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * A component to display a real-time stream of findings from the deep research agent.
 * It shows the progress of the research as it happens.
 */
const DeepResearchStream = () => {
    const { deepResearchStreamContent, updateDeepResearchStream } = useRonAIStore((state) => ({
        deepResearchStreamContent: state.deepResearchStreamContent,
        updateDeepResearchStream: state.updateDeepResearchStream,
    }));

    // Mock function to simulate a stream of research findings
    const handleMockStream = () => {
        const mockContent = [
            "Initializing deep research agent...\n",
            "Analyzing query: 'latest treatments for melanoma'...\n",
            "Accessing PubMed database...\n",
            "Found 1,254 relevant articles.\n",
            "Filtering for clinical trials and reviews...\n",
            "Synthesizing findings from top 10 articles...\n",
            "Identified new immunotherapy combination: Ipilimumab + Nivolumab.\n",
            "Cross-referencing with FDA database for approval status...\n",
            "Status: Approved for advanced melanoma.\n",
            "Generating final report...\n",
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < mockContent.length) {
                updateDeepResearchStream(mockContent[i]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 500);
    };

    return (
        <div className="h-full flex flex-col bg-secondary/80 p-4 rounded-lg border border-border/60">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="font-bold">Deep Research Stream</h3>
                <Button onClick={handleMockStream} size="sm" variant="outline">
                    <BrainCircuit className="w-4 h-4 mr-2" />
                    Mock Stream
                </Button>
            </div>
            <ScrollArea className="flex-grow bg-black/50 rounded-md p-4 font-mono text-xs text-green-400">
                <pre className="whitespace-pre-wrap">
                    {deepResearchStreamContent}
                    <span className="inline-block w-2 h-3 bg-green-400 animate-pulse ml-1" />
                </pre>
            </ScrollArea>
        </div>
    );
};

export default DeepResearchStream;
