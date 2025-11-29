"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

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

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectTree, setProjectTree] = useState<ProjectAsset[]>([]);

  const addAssetToTree = useCallback((assetData: any) => {
    // assetData is the raw JSON from the AI response
    // It usually has an "assets" array
    if (assetData && Array.isArray(assetData.assets)) {
      const newAssets = assetData.assets.map(convertAIAssetToNode);
      
      setProjectTree((prev) => {
        // We append to the root for now.
        // In a more advanced version, we might check names/parents to merge.
        return [...prev, ...newAssets];
      });
    }
  }, []);

  const clearProject = useCallback(() => {
    setProjectTree([]);
  }, []);

  // Recursively build a text representation of the tree for the AI context
  const buildContextString = (nodes: ProjectAsset[], depth: number = 0): string => {
    let result = "";
    const indent = "  ".repeat(depth);
    
    for (const node of nodes) {
      result += `${indent}- [${node.className}] ${node.name}`;
      // Add key properties if relevant (e.g. size, position, script source hint)
      if (node.properties) {
        const props = [];
        if (node.properties.Position) props.push(`Pos: ${node.properties.Position}`);
        if (node.properties.Size) props.push(`Size: ${node.properties.Size}`);
        if (node.properties.Color) props.push(`Color: ${node.properties.Color}`);
        if (node.className.includes('Script')) props.push(`(Has Code)`);
        
        if (props.length > 0) {
          result += ` { ${props.join(', ')} }`;
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
    if (projectTree.length === 0) return "Project is empty.";
    return "Current Project Hierarchy (Created Assets):\n" + buildContextString(projectTree);
  }, [projectTree]);

  return (
    <ProjectContext.Provider value={{ projectTree, addAssetToTree, clearProject, getProjectContextString }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
