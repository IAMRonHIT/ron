'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { Pill, Stethoscope, FileText } from 'lucide-react';

const QuickStartTile = ({ title, description, icon: Icon, onClick }: { title: string; description: string; icon: React.ElementType; onClick: () => void }) => (
    <div
        onClick={onClick}
        className="p-5 rounded-inner border border-border-divider bg-surface-secondary glow-md cursor-pointer transition-all hover:border-border-divider/50 hover:bg-surface-tertiary"
    >
        <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-text-secondary" />
            <h3 className="font-semibold text-base">{title}</h3>
        </div>
        <p className="text-sm text-text-secondary mt-2">{description}</p>
    </div>
);

/**
 * Displays the initial "hero" state of the chat, with quick-start prompts
 * to guide the user.
 */
const HeroQuickStarts = () => {
    const { addMessage } = useRonAIStore();

    const handleTileClick = (prompt: string) => {
        addMessage({
            role: 'user',
            content: prompt,
        });
    };

    const quickStarts = [
        {
            title: "Explain symptoms",
            description: "Get insights into potential causes and next steps.",
            icon: Stethoscope,
            prompt: "I've been having a persistent headache and occasional dizziness for the past week. What could be the potential causes?",
        },
        {
            title: "Analyze labs",
            description: "Upload and get a breakdown of your lab results.",
            icon: FileText,
            prompt: "Analyze the attached lab results and explain what the high creatinine levels mean.",
        },
        {
            title: "Research treatment",
            description: "Explore the latest treatment options for a condition.",
            icon: Pill,
            prompt: "What are the latest treatment options for type 2 diabetes, including any new medications or lifestyle interventions?",
        },
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="text-center mb-12">
                <h1 className="text-gradient-accent text-4xl mb-2">Ron.AI</h1>
                <p className="text-text-secondary">Your Health Advocacy Co-Pilot</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto w-full">
                {quickStarts.map(qs => (
                    <QuickStartTile
                        key={qs.title}
                        title={qs.title}
                        description={qs.description}
                        icon={qs.icon}
                        onClick={() => handleTileClick(qs.prompt)}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroQuickStarts;
