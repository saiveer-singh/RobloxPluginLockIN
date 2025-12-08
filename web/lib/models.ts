export type ModelProvider =
  | 'x-ai-grok-4-fast-free'
  | 'z-ai-glm-4.5-air-free'
  | 'moonshotai-kimi-k2-free'
  | 'qwen-qwen3-coder-free'
  | 'openai-gpt-oss-120b-free'
  | 'amazon-nova-2-lite-v1-free'
  | 'gpt-5-nano'
  | 'grok-code'
  | 'big-pickle';

export interface ModelConfig {
  provider: string;
  modelId: string;
  displayName: string;
}

export interface ModelInfo {
  id: ModelProvider;
  name: string;
  category: string;
}

export const MODEL_CONFIGS: Record<ModelProvider, ModelConfig> = {
  'x-ai-grok-4-fast-free': {
    provider: 'openrouter',
    modelId: 'x-ai/grok-beta',
    displayName: 'Grok Beta'
  },
  'z-ai-glm-4.5-air-free': {
    provider: 'openrouter',
    modelId: 'z-ai/glm-4.5-air:free',
    displayName: 'GLM 4.5 Air Free'
  },
  'moonshotai-kimi-k2-free': {
    provider: 'openrouter',
    modelId: 'moonshotai/kimi-k2:free',
    displayName: 'Kimi K2 Free'
  },
  'qwen-qwen3-coder-free': {
    provider: 'openrouter',
    modelId: 'qwen/qwen3-coder:free',
    displayName: 'Qwen 3 Coder Free'
  },
  'openai-gpt-oss-120b-free': {
    provider: 'openrouter',
    modelId: 'openai/gpt-oss-120b:free',
    displayName: 'GPT-OSS 120B Free'
  },
  'amazon-nova-2-lite-v1-free': {
    provider: 'openrouter',
    modelId: 'amazon/nova-lite-v1:free',
    displayName: 'Amazon Nova Lite V1 Free'
  },
  'gpt-5-nano': {
    provider: 'opencode',
    modelId: 'gpt-5-nano',
    displayName: 'GPT 5 Nano'
  },
  'grok-code': {
    provider: 'opencode',
    modelId: 'grok-code',
    displayName: 'Grok Code Fast 1'
  },
  'big-pickle': {
    provider: 'opencode',
    modelId: 'big-pickle',
    displayName: 'Big Pickle'
  }
};

// All available models - this is the master list
export const ALL_MODELS: ModelInfo[] = [
  { id: 'x-ai-grok-4-fast-free' as ModelProvider, name: 'Grok Beta', category: 'Grok' },
  { id: 'z-ai-glm-4.5-air-free' as ModelProvider, name: 'GLM 4.5 Air Free', category: 'GLM' },
  { id: 'moonshotai-kimi-k2-free' as ModelProvider, name: 'Kimi K2 Free', category: 'Moonshot' },
  { id: 'qwen-qwen3-coder-free' as ModelProvider, name: 'Qwen 3 Coder Free', category: 'Qwen' },
  { id: 'openai-gpt-oss-120b-free' as ModelProvider, name: 'GPT-OSS 120B Free', category: 'OpenAI' },
  { id: 'amazon-nova-2-lite-v1-free' as ModelProvider, name: 'Amazon Nova Lite V1 Free', category: 'Amazon' },
  { id: 'gpt-5-nano' as ModelProvider, name: 'GPT 5 Nano', category: 'OpenCode' },
  { id: 'grok-code' as ModelProvider, name: 'Grok Code Fast 1', category: 'OpenCode' },
  { id: 'big-pickle' as ModelProvider, name: 'Big Pickle', category: 'OpenCode' }
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

