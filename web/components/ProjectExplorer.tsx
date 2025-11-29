import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Box, Code, Zap, Image as ImageIcon, Type } from 'lucide-react';
import { useProject, ProjectAsset } from '@/lib/project-context';

const AssetIcon = ({ className }: { className: string }) => {
  const lower = className.toLowerCase();
  if (lower.includes('script')) return <Code className="w-4 h-4 text-blue-400" />;
  if (lower.includes('folder') || lower.includes('model')) return <Folder className="w-4 h-4 text-yellow-400" />;
  if (lower.includes('part') || lower.includes('mesh')) return <Box className="w-4 h-4 text-orange-400" />;
  if (lower.includes('light') || lower.includes('effect') || lower.includes('emitter')) return <Zap className="w-4 h-4 text-yellow-200" />;
  if (lower.includes('gui') || lower.includes('frame') || lower.includes('label')) return <ImageIcon className="w-4 h-4 text-green-400" />;
  return <File className="w-4 h-4 text-gray-400" />;
};

const TreeNode = ({ node, depth = 0 }: { node: ProjectAsset; depth?: number }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div 
        className="flex items-center gap-1 py-1 px-2 hover:bg-white/5 rounded cursor-pointer text-sm"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <span className={`text-gray-500 transition-transform ${hasChildren ? '' : 'opacity-0'}`}>
           {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </span>
        
        <AssetIcon className={node.className} />
        
        <span className="text-gray-200 truncate">{node.name}</span>
        <span className="text-gray-600 text-xs ml-2">[{node.className}]</span>
      </div>
      
      {isOpen && hasChildren && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export function ProjectExplorer() {
  const { projectTree, clearProject } = useProject();

  if (projectTree.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <p>No assets created yet.</p>
        <p className="mt-2 text-xs">Ask the AI to create something to see it here!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <span className="text-sm font-medium text-gray-300">Project Explorer</span>
        <button 
          onClick={clearProject}
          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-white/5"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {projectTree.map(node => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
