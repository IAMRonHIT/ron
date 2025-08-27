'use client';

import React from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { TestTube2 } from 'lucide-react';

/**
 * A component to display PubMed articles in a user-friendly accordion interface.
 * Each article can be expanded to view its summary and an embedded iframe of the article page.
 */
const PubMedViewer = () => {
    const { pubmedArticles, setPubMedArticles } = useRonAIStore((state) => ({
        pubmedArticles: state.pubmedArticles,
        setPubMedArticles: state.setPubMedArticles,
    }));

    // Mock function to load sample data for demonstration
    const handleMockLoad = () => {
        setPubMedArticles([
            {
                id: '31317922',
                title: 'Artificial intelligence in medicine',
                authors: ['Jiang F', 'Jiang Y', 'Zhi H', 'Dong Y', 'Li H', 'Ma S', 'Wang Y', 'Dong Q', 'Shen H', 'Wang Y'],
                publication: 'Nat Med',
                summary: 'This Review surveys the state of artificial intelligence in medicine, highlighting key advances and promising applications while also discussing the challenges and limitations of its integration into clinical practice.',
                url: 'https://www.nature.com/articles/s41591-019-0509-1'
            },
            {
                id: '33892833',
                title: 'The role of deep learning in advancing cancer diagnosis',
                authors: ['Zou J', 'Han Y', 'Soerjomataram I'],
                publication: 'Nat Rev Cancer',
                summary: 'Deep learning is revolutionizing cancer detection and diagnosis. This paper reviews the latest deep learning architectures and their application in analyzing medical imaging for various types of cancer.',
                url: 'https://www.nature.com/articles/s41568-021-00346-9'
            },
        ]);
    };

    return (
        <div className="h-full flex flex-col bg-secondary/80 p-4 rounded-lg border border-border/60">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="font-bold">PubMed Research</h3>
                <Button onClick={handleMockLoad} size="sm" variant="outline">
                    <TestTube2 className="w-4 h-4 mr-2" />
                    Load Mock Articles
                </Button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                {pubmedArticles.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {pubmedArticles.map(article => (
                            <AccordionItem value={article.id} key={article.id} className="border-border/50">
                                <AccordionTrigger>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">{article.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{article.authors.join(', ')} - <em>{article.publication}</em></p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-sm mb-4">{article.summary}</p>
                                    <div className="aspect-video bg-white rounded-md">
                                        <iframe src={article.url} title={article.title} className="w-full h-full border-0 rounded-md" sandbox="allow-scripts allow-same-origin" />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        <p>No PubMed articles loaded.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PubMedViewer;
