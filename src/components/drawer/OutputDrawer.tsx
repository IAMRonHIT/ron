'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Panel components will be created and imported in subsequent steps.
// For now, we'll define placeholders.
const ToolOutput = () => <div className="p-4">Tool Output Panel</div>;
const CodeViewer = () => <div className="p-4">Code Viewer Panel</div>;
const BrowserPanel = () => <div className="p-4">Browser Panel</div>;
const PubMedViewer = () => <div className="p-4">PubMed Viewer Panel</div>;
const LivePreviewCard = () => <div className="p-4">Live Preview Panel</div>;

/**
 * The main container for the Output Drawer, which slides up from the bottom.
 * It conditionally renders different content panels based on the global state.
 */
const OutputDrawer = () => {
    const { isDrawerOpen, closeDrawer, drawerContentType } = useRonAIStore((state) => ({
        isDrawerOpen: state.isDrawerOpen,
        closeDrawer: state.closeDrawer,
        drawerContentType: state.drawerContentType,
    }));

    const renderPanel = () => {
        switch (drawerContentType) {
            case 'tools': return <ToolOutput />;
            case 'code': return <CodeViewer />;
            case 'browser': return <BrowserPanel />;
            case 'pubmed': return <PubMedViewer />;
            case 'live-preview': return <LivePreviewCard />;
            default:
                return (
                    <div className="flex items-center justify-center h-full text-text-secondary">
                        <p>No content selected for the drawer.</p>
                    </div>
                );
        }
    };

    return (
        <div
            className={cn(
                "absolute bottom-0 left-0 right-0 h-2/5 bg-surface-secondary/80 border-t border-border-divider z-20 glass-panel transition-transform duration-300 ease-in-out",
                isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
            )}
        >
            <div className="flex justify-between items-center p-2 pr-4 border-b border-border-divider">
                <h2 className="text-base font-semibold capitalize pl-4">
                    {drawerContentType ? `${drawerContentType.replace('-', ' ')}` : 'Output'}
                </h2>
                <Button onClick={closeDrawer} variant="ghost" size="icon">
                    <X className="w-5 h-5" />
                </Button>
            </div>
            <div className="h-[calc(100%-53px)] overflow-y-auto">
                {renderPanel()}
            </div>
        </div>
    );
};

export default OutputDrawer;
