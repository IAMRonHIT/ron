'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { Button } from '@/components/ui/button';
import { Rocket, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A component that provides a button to trigger a deployment process and
 * displays the current status of that deployment.
 */
const DeployButton = () => {
    const {
        deploymentStatus,
        deploymentMessage,
        deployToVercel
    } = useRonAIStore((state) => ({
        deploymentStatus: state.deploymentStatus,
        deploymentMessage: state.deploymentMessage,
        deployToVercel: state.deployToVercel,
    }));

    const handleDeploy = () => {
        // In a real application, the project ID would come from props or context.
        deployToVercel('project_ron-ai-relic');
    };

    const renderButtonContent = () => {
        switch (deploymentStatus) {
            case 'in-progress':
                return <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deploying...</>;
            case 'success':
                return <><CheckCircle className="mr-2 h-4 w-4" /> Deployed Successfully</>;
            case 'error':
                return <><XCircle className="mr-2 h-4 w-4" /> Retry Deployment</>;
            default:
                return <><Rocket className="mr-2 h-4 w-4" /> Deploy to Vercel</>;
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-secondary/80 rounded-lg border border-border/60">
            <h3 className="font-bold text-lg">Vercel Deployment</h3>
            <p className="text-xs text-muted-foreground text-center">
                One-click deployment of the generated project to Vercel.
            </p>
            <Button
                onClick={handleDeploy}
                disabled={deploymentStatus === 'in-progress' || deploymentStatus === 'success'}
                className={cn(
                    "w-full max-w-xs",
                    deploymentStatus === 'success' && 'bg-green-600 hover:bg-green-700',
                    deploymentStatus === 'error' && 'bg-red-600 hover:bg-red-700'
                )}
            >
                {renderButtonContent()}
            </Button>
            <div className="h-4 mt-2">
                {deploymentStatus !== 'idle' && (
                    <p className="text-xs text-muted-foreground text-center animate-fade-in">
                        {deploymentMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default DeployButton;
