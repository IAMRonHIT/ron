'use client';

import React from 'react';
import ClaudeCodeIntegration from './ClaudeCodeIntegration';
import DeployButton from '../deploy/DeployButton';

/**
 * A container view that assembles all components related to code generation and deployment.
 */
const CodeView = () => {
  return (
    <div className="h-full flex flex-col gap-6 p-6">
      <div className="flex-grow">
        <ClaudeCodeIntegration />
      </div>
      <div className="flex-shrink-0">
        <DeployButton />
      </div>
    </div>
  );
};

export default CodeView;
