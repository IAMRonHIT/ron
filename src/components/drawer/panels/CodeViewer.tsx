'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRonAIStore } from '@/lib/ron-ai-store';
import { CodeFile } from '@/lib/ron-ai-store';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Folder, File } from 'lucide-react';
import { cn } from '@/lib/utils';

type TreeNode = { [key: string]: TreeNode | CodeFile };

const buildFileTree = (files: CodeFile[]): TreeNode => {
    const tree: TreeNode = {};
    files.forEach(file => {
        let currentLevel = tree;
        const pathParts = file.path.split('/');
        pathParts.forEach((part, index) => {
            if (!currentLevel[part]) {
                if (index === pathParts.length - 1) {
                    currentLevel[part] = file;
                } else {
                    currentLevel[part] = {};
                }
            }
            currentLevel = currentLevel[part] as TreeNode;
        });
    });
    return tree;
};

const FileTree: React.FC<{ tree: TreeNode; onFileSelect: (file: CodeFile) => void; selectedFile: CodeFile | null; level?: number }> = ({ tree, onFileSelect, selectedFile, level = 0 }) => {
    return (
        <ul className="space-y-1">
            {Object.entries(tree).sort(([a], [b]) => a.localeCompare(b)).map(([name, node]) => (
                <li key={name} style={{ paddingLeft: `${level * 1}rem` }}>
                    {'path' in node ? (
                        <button
                            className={cn('flex items-center gap-2 w-full text-left p-1 rounded-md text-sm', selectedFile?.path === node.path ? 'bg-primary/20 text-primary' : 'hover:bg-surface-tertiary')}
                            onClick={() => onFileSelect(node)}
                        >
                            <File className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{name}</span>
                        </button>
                    ) : (
                        <div>
                            <div className="flex items-center gap-2 text-sm font-semibold p-1">
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

const CodeViewerPanel = () => {
    const codeFiles = useRonAIStore((state) => state.codeFiles);
    const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);

    const fileTree = useMemo(() => buildFileTree(codeFiles), [codeFiles]);

    useEffect(() => {
        if (codeFiles.length > 0 && !selectedFile) {
            setSelectedFile(codeFiles[0]);
        }
    }, [codeFiles, selectedFile]);

    return (
        <div className="flex h-full">
            <div className="w-1/3 bg-surface-tertiary p-2 overflow-y-auto border-r border-border-divider">
                <h4 className="p-2 font-semibold text-sm">Project Files</h4>
                <FileTree tree={fileTree} onFileSelect={setSelectedFile} selectedFile={selectedFile} />
            </div>
            <div className="w-2/3 bg-black/80 flex flex-col">
                {selectedFile ? (
                    <div className="flex-grow overflow-y-auto">
                        <SyntaxHighlighter
                            language="javascript" // This should be dynamic based on file extension
                            style={vscDarkPlus}
                            showLineNumbers
                            customStyle={{ margin: 0, height: '100%', background: 'transparent' }}
                        >
                            {selectedFile.content}
                        </SyntaxHighlighter>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-text-secondary">
                        <p>Select a file to view its content.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeViewerPanel;
