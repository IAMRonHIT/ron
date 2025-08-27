'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { CodeFile } from '@/lib/ron-ai-store';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Folder, File, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TreeNode = { [key: string]: TreeNode | CodeFile };

// Helper function to build a file tree from a flat list of paths
const buildFileTree = (files: CodeFile[]): TreeNode => {
    const tree: TreeNode = {};
    files.forEach(file => {
        let currentLevel = tree;
        const pathParts = file.path.split('/');
        pathParts.forEach((part, index) => {
            if (!currentLevel[part]) {
                if (index === pathParts.length - 1) {
                    currentLevel[part] = file; // It's a file
                } else {
                    currentLevel[part] = {}; // It's a directory
                }
            }
            currentLevel = currentLevel[part] as TreeNode;
        });
    });
    return tree;
};

// Recursive component to render the file tree
const FileTree: React.FC<{ tree: TreeNode; onFileSelect: (file: CodeFile) => void; selectedFile: CodeFile | null; level?: number }> = ({ tree, onFileSelect, selectedFile, level = 0 }) => {
    return (
        <ul className="space-y-1">
            {Object.entries(tree).sort(([a], [b]) => a.localeCompare(b)).map(([name, node]) => (
                <li key={name} style={{ paddingLeft: `${level * 1}rem` }}>
                    {'path' in node ? ( // It's a file
                        <button
                            className={cn(
                                'flex items-center gap-2 w-full text-left p-1 rounded-md text-sm',
                                selectedFile?.path === node.path ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'
                            )}
                            onClick={() => onFileSelect(node)}
                        >
                            <File className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{name}</span>
                        </button>
                    ) : ( // It's a directory
                        <div>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Folder className="w-4 h-4 flex-shrink-0" />
                                <span>{name}</span>
                            </div>
                            <div className="mt-1">
                                <FileTree tree={node} onFileSelect={onFileSelect} selectedFile={selectedFile} level={level + 1} />
                            </div>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
};

/**
 * A component that displays a file tree and code viewer for files generated
 * by the Claude Code AI agent.
 */
const ClaudeCodeIntegration = () => {
    const codeFiles = useRonAIStore((state) => state.codeFiles);
    const { addCodeFile, updateCodeFile } = useRonAIStore();
    const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);

    const fileTree = useMemo(() => buildFileTree(codeFiles), [codeFiles]);

    useEffect(() => {
        if (codeFiles.length > 0 && !selectedFile) {
            setSelectedFile(codeFiles[0]);
        }
    }, [codeFiles, selectedFile]);

    // Mock streaming logic for demonstration purposes
    const handleMockStream = () => {
        addCodeFile({ path: 'src/index.js', content: '' });
        let counter = 0;
        const interval = setInterval(() => {
            if (counter < 10) {
                updateCodeFile('src/index.js', `\n// line ${counter}`);
                counter++;
            } else {
                addCodeFile({ path: 'src/components/Button.jsx', content: 'const Button = () => <button>Click Me</button>;' });
                clearInterval(interval);
            }
        }, 300);
    };

    return (
        <div className="flex h-full gap-4">
            {/* File Tree Panel */}
            <div className="w-1/4 flex flex-col bg-secondary/80 p-4 rounded-lg border border-border/60">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Project Files</h3>
                    <Button size="sm" variant="outline" onClick={handleMockStream}>
                        <ChevronsRight className="w-4 h-4 mr-2" />
                        Mock Stream
                    </Button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <FileTree tree={fileTree} onFileSelect={setSelectedFile} selectedFile={selectedFile} />
                </div>
            </div>

            {/* Code Viewer Panel */}
            <div className="w-3/4 bg-black/80 rounded-lg overflow-hidden border border-border/60 flex flex-col">
                {selectedFile ? (
                    <>
                        <div className="p-3 bg-secondary/90 border-b border-border/60">
                            <p className="text-sm font-mono">{selectedFile.path}</p>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <SyntaxHighlighter
                                language="javascript"
                                style={vscDarkPlus}
                                showLineNumbers
                                customStyle={{ margin: 0, height: '100%', background: 'transparent' }}
                            >
                                {selectedFile.content}
                            </SyntaxHighlighter>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Select a file to view its content.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClaudeCodeIntegration;
