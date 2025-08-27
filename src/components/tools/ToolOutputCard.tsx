'use client';

import React from 'react';
import { ToolOutput } from '@/lib/ron-ai-store';
import { Terminal, ChevronDown, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useToast } from "@/components/ui/use-toast";
import { cn } from '@/lib/utils';

interface ToolOutputCardProps {
  toolOutput: ToolOutput;
}

// Simple check to guess if a string is code or JSON
const isCodeLike = (text: string): boolean => {
    const trimmed = text.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
            JSON.parse(trimmed);
            return true; // It's valid JSON, treat as code.
        } catch (e) {
            // Not valid JSON, proceed with other checks
        }
    }
    const codeChars = ['{', '}', ';', '(', ')', '=', '>', '<', '/', '=>', 'const', 'let', 'def', 'import'];
    return codeChars.some(char => text.includes(char));
};

const ToolOutputCard: React.FC<ToolOutputCardProps> = ({ toolOutput }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(true); // Default to open for visibility

  const outputString = typeof toolOutput.output === 'string'
    ? toolOutput.output
    : JSON.stringify(toolOutput.output, null, 2);

  const language = isCodeLike(outputString) && (outputString.trim().startsWith('{') || outputString.trim().startsWith('[')) ? 'json' : 'javascript';

  const handleCopy = () => {
    navigator.clipboard.writeText(outputString);
    toast({
      title: "Copied to clipboard!",
      description: `Output from ${toolOutput.toolName} has been copied.`,
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full my-4 animate-fade-in">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full bg-secondary/60 border border-border/50 rounded-lg backdrop-blur-sm"
      >
        <div className="flex justify-between items-center p-3">
            <CollapsibleTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer group flex-grow">
                    <Terminal className="h-4 w-4 text-accent-purple" />
                    <span className="text-xs font-semibold text-muted-foreground">
                        Tool Executed: <span className="text-accent-purple font-bold">{toolOutput.toolName}</span>
                    </span>
                </div>
            </CollapsibleTrigger>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                    <Copy className="h-3.5 w-3.5" />
                </Button>
                <CollapsibleTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                    </Button>
                </CollapsibleTrigger>
            </div>
        </div>
        <CollapsibleContent>
          <div className="px-3 pb-3">
            <div className="bg-black/70 rounded-md overflow-hidden text-xs">
              {isCodeLike(outputString) ? (
                 <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                    wrapLongLines={true}
                 >
                    {outputString}
                 </SyntaxHighlighter>
              ) : (
                <pre className="whitespace-pre-wrap p-4 font-mono">
                  {outputString}
                </pre>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ToolOutputCard;
