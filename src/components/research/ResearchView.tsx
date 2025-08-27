'use client';

import React from 'react';
import PubMedViewer from './PubMedViewer';
import DeepResearchStream from './DeepResearchStream';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

/**
 * A container view that assembles all components related to research activities.
 */
const ResearchView = () => {
  return (
    <div className="h-full p-6">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
            <ResizablePanel defaultSize={50} minSize={30}>
                <PubMedViewer />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
                <DeepResearchStream />
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  );
};

export default ResearchView;
