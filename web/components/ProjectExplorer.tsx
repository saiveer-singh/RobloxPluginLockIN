import React, { useState } from 'react';
import { 
  Folder, File, ChevronRight, ChevronDown, Box, Code, Zap, Image as ImageIcon, 
  Type, Globe, Users, Sun, Database, Server, HardDrive, LayoutTemplate, 
  Briefcase, User, Flag, Music, MessageSquare, Boxes, FileCode, Radio, Link, 
  Monitor, Square, Scroll, Lightbulb, Sparkles, Activity, Layers, ArrowDownToLine,
  RefreshCw
} from 'lucide-react';
import { useProject, ProjectAsset } from '@/lib/project-context';

// ... (AssetIcon and TreeNode components remain unchanged)

// Asset Icon Component - Mimics Roblox Studio Icons using Lucide
const AssetIcon = ({ className }: { className: string }) => {
  const cls = className || '';
  
  // Service-level icons
  if (cls === 'Workspace') return <Globe className="w-4 h-4 text-blue-500" />;
  if (cls === 'Players') return <Users className="w-4 h-4 text-green-500" />;
  if (cls === 'Lighting') return <Sun className="w-4 h-4 text-yellow-500" />;
  if (cls === 'ReplicatedFirst') return <ArrowDownToLine className="w-4 h-4 text-blue-400" />;
  if (cls === 'ReplicatedStorage') return <Layers className="w-4 h-4 text-blue-400" />;
  if (cls === 'ServerScriptService') return <Server className="w-4 h-4 text-green-600" />;
  if (cls === 'ServerStorage') return <HardDrive className="w-4 h-4 text-blue-600" />;
  if (cls === 'StarterGui') return <LayoutTemplate className="w-4 h-4 text-purple-500" />;
  if (cls === 'StarterPack') return <Briefcase className="w-4 h-4 text-blue-400" />;
  if (cls === 'StarterPlayer') return <User className="w-4 h-4 text-green-500" />;
  if (cls === 'Teams') return <Flag className="w-4 h-4 text-yellow-600" />;
  if (cls === 'SoundService') return <Music className="w-4 h-4 text-blue-400" />;
  if (cls === 'Chat') return <MessageSquare className="w-4 h-4 text-blue-500" />;

  // Common Assets
  if (cls === 'Folder') return <Folder className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />;
  if (cls === 'Model') return <Boxes className="w-4 h-4 text-white" />;
  if (cls === 'Part' || cls === 'MeshPart' || cls === 'UnionOperation') return <Box className="w-4 h-4 text-gray-300" />;
  
  // Scripts
  if (cls === 'Script') return <FileCode className="w-4 h-4 text-gray-300" />;
  if (cls === 'LocalScript') return <FileCode className="w-4 h-4 text-blue-400" />;
  if (cls === 'ModuleScript') return <FileCode className="w-4 h-4 text-purple-400" />;
  
  // UI
  if (cls === 'ScreenGui') return <Monitor className="w-4 h-4 text-white" />;
  if (cls.includes('Frame')) return <Square className="w-4 h-4 text-white" />;
  if (cls.includes('Text')) return <Type className="w-4 h-4 text-white" />;
  if (cls.includes('Image')) return <ImageIcon className="w-4 h-4 text-orange-400" />;
  if (cls === 'ScrollingFrame') return <Scroll className="w-4 h-4 text-white" />;
  
  // Effects & Logic
  if (cls.includes('Light')) return <Lightbulb className="w-4 h-4 text-yellow-300" />;
  if (cls === 'ParticleEmitter') return <Sparkles className="w-4 h-4 text-yellow-200" />;
  if (cls === 'Trail' || cls === 'Beam') return <Activity className="w-4 h-4 text-orange-400" />;
  if (cls.includes('Event')) return <Radio className="w-4 h-4 text-orange-500" />;
  if (cls.includes('Function')) return <Link className="w-4 h-4 text-green-500" />;
  
  // Fallback
  return <File className="w-4 h-4 text-gray-400" />;
};

const TreeNode = ({ node, depth = 0 }: { node: ProjectAsset; depth?: number }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none font-sans">
      <div 
        className="flex items-center gap-1.5 py-0.5 px-2 hover:bg-white/10 cursor-pointer group transition-colors border-l-2 border-transparent hover:border-blue-500/50"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {/* Arrow */}
        <span className={`text-gray-400 hover:text-white transition-colors flex-shrink-0 ${hasChildren ? '' : 'opacity-0'}`}>
           {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </span>
        
        {/* Icon */}
        <div className="flex-shrink-0">
          <AssetIcon className={node.className} />
        </div>
        
        {/* Name */}
        <span className="text-gray-200 text-sm truncate group-hover:text-white">{node.name}</span>
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
  const { projectTree, clearProject, syncFromStudio } = useProject();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncFromStudio();
    setTimeout(() => setIsSyncing(false), 500);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-[#333]">
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#333]">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Explorer</span>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="text-[10px] text-gray-400 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-1"
            title="Sync from Roblox Studio"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </button>
          {projectTree.length > 0 && (
            <button 
              onClick={clearProject}
              className="text-[10px] text-gray-500 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
        {projectTree.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-gray-500 text-xs italic">
              Empty Project
            </div>
            <div className="mt-2 text-[10px] text-gray-600">
              Generated assets will appear here
            </div>
          </div>
        ) : (
          projectTree.map(node => (
            <TreeNode key={node.id} node={node} />
          ))
        )}
      </div>
    </div>
  );
}
