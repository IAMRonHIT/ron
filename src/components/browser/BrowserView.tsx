'use client';

import React from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import BrowserPanel from './BrowserPanel';
import VNCViewer from '../computer/VNCViewer';
import LivePreview from '../preview/LivePreview';

/**
 * A container component that assembles the browser integration UI.
 * It uses a resizable panel layout to display the multi-tab browser,
 * the VNC viewer, and the live preview system.
 */
const BrowserView = () => {
  return (
    <div className="h-full p-6">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">

        {/* Main Browser Panel */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <BrowserPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* VNC and Live Preview Panel */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <ResizablePanelGroup direction="vertical">

            <ResizablePanel defaultSize={50} minSize={25}>
                <VNCViewer />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={50} minSize={25}>
                <LivePreview />
            </ResizablePanel>

          </ResizablePanelGroup>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
};

export default BrowserView;
