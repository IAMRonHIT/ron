'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

interface ProviderSearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const ProviderSearchForm: React.FC<ProviderSearchFormProps> = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for providers by name, specialty, or location..."
                className="bg-surface-secondary border-border-divider focus:ring-2 focus:ring-teal"
                disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !query.trim()} className="min-w-[120px]">
                {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <SearchIcon className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Searching...' : 'Search'}
            </Button>
        </form>
    );
};

export default ProviderSearchForm;
