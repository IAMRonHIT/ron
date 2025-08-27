'use client';

import React, { useState } from 'react';
import ProviderSearchForm from './ProviderSearchForm';
import ProviderResultCard, { ProviderResult } from './ProviderResultCard';
import { claudeAPI, parseSSEStream } from '@/lib/api';
import { BrainCircuit } from 'lucide-react';

/**
 * The main container for the Provider Search feature.
 * It handles the search state, live API calls, and result display.
 */
const SearchView = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isResearching, setIsResearching] = useState<string | null>(null);
    const [results, setResults] = useState<ProviderResult[]>([]);
    const [currentReasoning, setCurrentReasoning] = useState('');

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        setResults([]);
        setCurrentReasoning('');

        const prompt = `Find healthcare providers matching the query: "${query}". Use the provider_search tool.`;

        try {
            const stream = await claudeAPI.chatStream({
                messages: [{ role: 'user', content: prompt }],
                tools: ['provider_search'],
                enable_thinking: true,
            });

            for await (const event of parseSSEStream(stream)) {
                if (event.type === 'content_block_delta' && event.delta?.type === 'thinking_delta') {
                    setCurrentReasoning(prev => prev + (event.delta.thinking || ''));
                }
                if (event.type === 'tool_result' && event.tool_name === 'provider_search') {
                    const toolResult = typeof event.result === 'string' ? JSON.parse(event.result) : event.result;
                    if (toolResult && toolResult.results) {
                        setResults(toolResult.results);
                    }
                    break;
                }
            }

        } catch (error) {
            console.error("Failed to fetch provider search results:", error);
            // Here you could set an error state to display to the user
        } finally {
            setIsLoading(false);
            setCurrentReasoning('');
        }
    };

    const { openDrawer, executeTool, updateToolOutput } = useRonAIStore();

    const handleDeepResearch = async (providerId: string) => {
        setIsResearching(providerId);

        const toolId = executeTool('deep_research', { providerId });
        openDrawer('tools', toolId);

        const prompt = `Perform deep research on provider with NPI ${providerId}. Compare their patient reviews, treatment specializations, and any recent publications.`;

        try {
            const stream = await claudeAPI.chatStream({ messages: [{ role: 'user', content: prompt }] });
            for await (const event of parseSSEStream(stream)) {
                if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                    // Stream the content directly to the tool output in the store
                    updateToolOutput(toolId, event.delta.text);
                }
            }
        } catch (error) {
            console.error("Deep research failed:", error);
            updateToolOutput(toolId, `\n\n--- ERROR ---\n${error.message}`);
        } finally {
            setIsResearching(null);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Provider Search</h2>
            <ProviderSearchForm onSearch={handleSearch} isLoading={isLoading} />

            {currentReasoning && (
                <div className="flex items-center gap-2 text-sm text-text-secondary p-2 bg-surface-secondary rounded-inner">
                    <BrainCircuit className="w-4 h-4" />
                    <p>{currentReasoning}</p>
                </div>
            )}

            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {results.map(provider => (
                    <ProviderResultCard
                        key={provider.id}
                        provider={provider}
                        onDeepResearch={handleDeepResearch}
                        isLoadingResearch={isResearching === provider.id}
                    />
                ))}
                {isLoading && results.length === 0 && (
                    <div className="text-center text-text-secondary pt-10">
                        <p>Searching for providers...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchView;
