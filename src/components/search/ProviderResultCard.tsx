'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Globe, Microscope } from 'lucide-react';

// Using a simplified interface for now. This will be expanded based on actual API responses.
export interface ProviderResult {
    id: string;
    name: string;
    specialty: string;
    address: string;
    phone: string;
    website?: string;
}

interface ProviderResultCardProps {
  provider: ProviderResult;
  onDeepResearch: (providerId: string) => void;
  isLoadingResearch: boolean;
}

const ProviderResultCard: React.FC<ProviderResultCardProps> = ({ provider, onDeepResearch, isLoadingResearch }) => {
    return (
        <div className="p-4 rounded-inner border border-border-divider bg-surface-secondary transition-all hover:border-border-divider/50">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <p className="text-sm text-text-secondary">{provider.specialty}</p>
                </div>
                <Button
                    onClick={() => onDeepResearch(provider.id)}
                    size="sm"
                    disabled={isLoadingResearch}
                    className="bg-surface-tertiary hover:bg-surface-tertiary/80"
                >
                    <Microscope className="w-4 h-4 mr-2" />
                    Deep Research
                </Button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-text-secondary">
                {provider.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 flex-shrink-0" /><span>{provider.address}</span></div>}
                {provider.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 flex-shrink-0" /><span>{provider.phone}</span></div>}
                {provider.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4 flex-shrink-0" /><a href={provider.website} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{provider.website}</a></div>}
            </div>
        </div>
    );
};

export default ProviderResultCard;
