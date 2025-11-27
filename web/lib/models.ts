import type { ModelProvider } from './ai';

export interface ModelInfo {
  id: ModelProvider;
  name: string;
  category: string;
}

// All available models - this is the master list
export const ALL_MODELS: ModelInfo[] = [
  { id: 'x-ai-grok-4.1-fast-free' as ModelProvider, name: 'Grok 4.1 Fast Free', category: 'Grok' },
  { id: 'z-ai-glm-4.5-air-free' as ModelProvider, name: 'GLM 4.5 Air Free', category: 'GLM' },
  { id: 'moonshotai-kimi-k2-free' as ModelProvider, name: 'Kimi K2 Free', category: 'Moonshot' },
  { id: 'qwen-qwen3-coder-free' as ModelProvider, name: 'Qwen 3 Coder Free', category: 'Qwen' },
];

// Get models filtered by enabled list
export function getEnabledModels(enabledModelIds?: string[]): ModelInfo[] {
  if (!enabledModelIds || enabledModelIds.length === 0) {
    return ALL_MODELS; // Show all if none specified
  }
  return ALL_MODELS.filter(model => enabledModelIds.includes(model.id));
}

// Get unique categories from models
export function getCategories(): string[] {
  return Array.from(new Set(ALL_MODELS.map(m => m.category))).sort();
}

