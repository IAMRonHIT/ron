'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

const isCodeLike = (text: string): boolean => {
    const trimmed = text.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
            JSON.parse(trimmed);
            return true;
        } catch (e) {
            // Not valid JSON
        }
    }
    const codeChars = ['{', '}', ';', '(', ')', '=', '>', '<', '/', '=>', 'const', 'let', 'def', 'import'];
    return codeChars.some(char => text.includes(char));
};

const ToolOutputPanel = () => {
    const { toolOutputs, activeDrawerId } = useRonAIStore((state) => ({
        toolOutputs: state.toolOutputs,
        activeDrawerId: state.activeDrawerId,
    }));
    const { toast } = useToast();

    const activeOutput = toolOutputs.find(o => o.id === activeDrawerId);

    if (!activeOutput) {
        return <div className="p-4 text-text-secondary">No tool output selected or found.</div>;
    }

    const outputString = typeof activeOutput.output === 'string'
        ? activeOutput.output
        : JSON.stringify(activeOutput.output, null, 2);

    const language = isCodeLike(outputString) && (outputString.trim().startsWith('{') || outputString.trim().startsWith('[')) ? 'json' : 'javascript';

    const handleCopy = () => {
        navigator.clipboard.writeText(outputString);
        toast({
            title: "Copied to clipboard!",
            description: `Output from ${activeOutput.toolName} has been copied.`,
        });
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-2 flex-shrink-0">
                <h4 className="font-semibold text-text-secondary">{activeOutput.toolName}</h4>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="w-3 h-3 mr-2" /> Copy
                </Button>
            </div>
            <div className="bg-black/50 rounded-inner overflow-auto flex-grow text-xs border border-border-divider">
                {isCodeLike(outputString) ? (
                    <SyntaxHighlighter
                        language={language}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, background: 'transparent', height: '100%' }}
                        wrapLongLines={true}
                        showLineNumbers
                    >
                        {outputString}
                    </SyntaxHighlighter>
                ) : (
                    <pre className="whitespace-pre-wrap p-4 font-mono h-full">
                        {outputString}
                    </pre>
                )}
            </div>
        </div>
    );
};

export default ToolOutputPanel;
