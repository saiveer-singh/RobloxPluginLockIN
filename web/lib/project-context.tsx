"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// Simple asset type for the explorer
export interface ProjectAsset {
  id: string;
  name: string;
  className: string;
  children: ProjectAsset[];
  properties?: Record<string, string>;
}

interface ProjectContextType {
  projectTree: ProjectAsset[];
  addAssetToTree: (assetData: any) => void;
  clearProject: () => void;
  getProjectContextString: () => string;
  syncFromStudio: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// ... (DEFAULT_SERVICES constant remains same)

const DEFAULT_SERVICES: ProjectAsset[] = [
  { id: 'workspace', name: 'Workspace', className: 'Workspace', children: [] },
  { id: 'players', name: 'Players', className: 'Players', children: [] },
  { id: 'lighting', name: 'Lighting', className: 'Lighting', children: [] },
  { id: 'replicatedfirst', name: 'ReplicatedFirst', className: 'ReplicatedFirst', children: [] },
  { id: 'replicatedstorage', name: 'ReplicatedStorage', className: 'ReplicatedStorage', children: [] },
  { id: 'serverscriptservice', name: 'ServerScriptService', className: 'ServerScriptService', children: [] },
  { id: 'serverstorage', name: 'ServerStorage', className: 'ServerStorage', children: [] },
  { id: 'startergui', name: 'StarterGui', className: 'StarterGui', children: [] },
  { id: 'starterpack', name: 'StarterPack', className: 'StarterPack', children: [] },
  { id: 'starterplayer', name: 'StarterPlayer', className: 'StarterPlayer', children: [
    { id: 'starterplayerscripts', name: 'StarterPlayerScripts', className: 'Folder', children: [] },
    { id: 'startercharacterscripts', name: 'StarterCharacterScripts', className: 'Folder', children: [] },
  ] },
  { id: 'teams', name: 'Teams', className: 'Teams', children: [] },
  { id: 'soundservice', name: 'SoundService', className: 'SoundService', children: [] },
  { id: 'textchatservice', name: 'TextChatService', className: 'TextChatService', children: [] },
];

// Helper to convert the AI's asset format to our tree format
function convertAIAssetToNode(aiAsset: any): ProjectAsset {
  const node: ProjectAsset = {
    id: Math.random().toString(36).substr(2, 9),
    name: aiAsset.Properties?.Name || aiAsset.ClassName || 'Unknown',
    className: aiAsset.ClassName || 'Folder',
    children: [],
    properties: aiAsset.Properties,
  };

  if (aiAsset.Children && Array.isArray(aiAsset.Children)) {
    node.children = aiAsset.Children.map(convertAIAssetToNode);
  }

  return node;
}

// Heuristic to determine where an asset should go
function getTargetServiceId(asset: ProjectAsset): string {
  const cls = asset.className;
  const name = asset.name.toLowerCase();

  if (cls === 'Script') return 'serverscriptservice';
  if (cls === 'LocalScript') return 'starterplayerscripts'; // Inside StarterPlayer
  if (cls === 'ModuleScript') return 'replicatedstorage';
  if (cls === 'ScreenGui') return 'startergui';
  if (cls === 'Tool' || cls === 'HopperBin') return 'starterpack';
  if (cls === 'RemoteEvent' || cls === 'RemoteFunction') return 'replicatedstorage';
  if (['Part', 'Model', 'MeshPart', 'UnionOperation', 'Accessory'].includes(cls)) return 'workspace';
  if (['Sky', 'Atmosphere', 'BloomEffect', 'BlurEffect', 'ColorCorrectionEffect', 'SunRaysEffect'].includes(cls)) return 'lighting';
  if (cls === 'Sound') return 'soundservice'; // Or workspace, but let's put in service for organization
  
  return 'workspace'; // Default
}

// Helper to merge/update assets
function mergeAssets(existing: ProjectAsset[], incoming: ProjectAsset[]) {
  incoming.forEach(newItem => {
    const existingItemIndex = existing.findIndex(
      e => e.name === newItem.name && e.className === newItem.className
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      const existingItem = existing[existingItemIndex];
      
      // Merge properties (overwrite with new)
      existingItem.properties = {
        ...existingItem.properties,
        ...newItem.properties
      };

      // Recursively merge children if any
      if (newItem.children && newItem.children.length > 0) {
        mergeAssets(existingItem.children, newItem.children);
      }
    } else {
      // Add as new item
      existing.push(newItem);
    }
  });
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [projectTree, setProjectTree] = useState<ProjectAsset[]>(DEFAULT_SERVICES);

  const addAssetToTree = useCallback((assetData: any) => {
    if (assetData && Array.isArray(assetData.assets)) {
      const newAssets = assetData.assets.map(convertAIAssetToNode);
      
      setProjectTree((prevTree) => {
        // Deep clone the tree to avoid mutation
        const newTree = JSON.parse(JSON.stringify(prevTree));

        newAssets.forEach((asset: ProjectAsset) => {
          const targetId = getTargetServiceId(asset);
          
          // Find the service node
          let targetNode = newTree.find((node: ProjectAsset) => node.id === targetId);
          
          // Special case for nested folders (e.g. StarterPlayerScripts)
          if (!targetNode && targetId === 'starterplayerscripts') {
             const starterPlayer = newTree.find((node: ProjectAsset) => node.id === 'starterplayer');
             targetNode = starterPlayer?.children.find((child: ProjectAsset) => child.id === 'starterplayerscripts');
          }

          if (targetNode) {
            // Smart Merge: Check if asset already exists in this container
            mergeAssets(targetNode.children, [asset]);
          } else {
            // Fallback to workspace
            const workspace = newTree.find((node: ProjectAsset) => node.id === 'workspace');
            if (workspace) {
              mergeAssets(workspace.children, [asset]);
            }
          }
        });

        return newTree;
      });
    }
  }, []);

  const clearProject = useCallback(() => {
    setProjectTree(DEFAULT_SERVICES);
  }, []);

  const syncFromStudio = useCallback(async () => {
    if (!session?.user?.robloxId) return;
    try {
      const res = await fetch(`/api/project-state?userId=${session.user.robloxId}`);
      const data = await res.json();
      if (data.tree) {
        // Assuming data.tree matches ProjectAsset[] structure or needs simple conversion
        // Ideally the plugin sends exactly what we need, or we map it here.
        // For now, let's assume the plugin sends a compatible structure or we replace the whole tree.
        // To be safe, we might want to validate/merge, but replacing is "Sync".
        setProjectTree(data.tree);
      }
    } catch (e) {
      console.error("Failed to sync from studio:", e);
    }
  }, [session?.user?.robloxId]);

  // Recursively build a text representation of the tree for the AI context
  const buildContextString = (nodes: ProjectAsset[], depth: number = 0): string => {
    let result = "";
    const indent = "  ".repeat(depth);
    
    for (const node of nodes) {
      result += `${indent}- [${node.className}] ${node.name}`;
      
      if (node.properties) {
        const props = [];
        if (node.properties.Position) props.push(`Pos: ${node.properties.Position}`);
        if (node.properties.Size) props.push(`Size: ${node.properties.Size}`);
        if (node.properties.Color) props.push(`Color: ${node.properties.Color}`);
        
        if (props.length > 0) {
          result += ` { ${props.join(', ')} }`;
        }

        // Include Script Source for context awareness (essential for editing)
        if ((node.className.includes('Script') || node.className === 'ModuleScript') && node.properties.Source) {
           result += `\n${indent}  Source:\n\`\`\`lua\n${node.properties.Source}\n\`\`\``;
        }
      }
      result += "\n";
      
      if (node.children.length > 0) {
        result += buildContextString(node.children, depth + 1);
      }
    }
    return result;
  };

  const getProjectContextString = useCallback(() => {
    return "Current Project Hierarchy:\n" + buildContextString(projectTree);
  }, [projectTree]);

  return (
    <ProjectContext.Provider value={{ projectTree, addAssetToTree, clearProject, getProjectContextString, syncFromStudio }}>
      {children}
    </ProjectContext.Provider>
  );
}
