import { useState, useMemo } from 'react';
import { Settings, X, Monitor, Zap, MessageSquare, Volume2, Eye, Save, RotateCcw, Cpu, Search, Check, ChevronDown } from 'lucide-react';
import { useSettings, ThemePreset, themePresets } from '@/lib/settings';
import type { ModelProvider } from '@/lib/ai';
import { ModelIcon } from './ModelIcon';
import { ALL_MODELS, getCategories, type ModelInfo } from '@/lib/models';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}



export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings, resetToDefaults } = useSettings();
  const [activeTab, setActiveTab] = useState<'behavior' | 'performance' | 'ai' | 'models'>('behavior');
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const categories = getCategories();
  
  // Get enabled models (default to all if not set)
  const enabledModelIds = useMemo(() => {
    return settings.enabledModels && settings.enabledModels.length > 0 
      ? new Set(settings.enabledModels) 
      : new Set(ALL_MODELS.map((m: ModelInfo) => m.id));
  }, [settings.enabledModels]);
  
  // Toggle model enabled state
  const toggleModel = (modelId: string) => {
    const current = enabledModelIds.has(modelId);
    const newEnabled = current
      ? Array.from(enabledModelIds).filter(id => id !== modelId)
      : [...Array.from(enabledModelIds), modelId];
    
    updateSettings({ enabledModels: newEnabled });
  };
  
  // Toggle entire category
  const toggleCategory = (category: string) => {
    const categoryModels = ALL_MODELS.filter(m => m.category === category);
    const allEnabled = categoryModels.every(m => enabledModelIds.has(m.id));
    
    const newEnabled = allEnabled
      ? Array.from(enabledModelIds).filter(id => !categoryModels.some(m => m.id === id))
      : [...Array.from(enabledModelIds), ...categoryModels.map(m => m.id)];
    
    updateSettings({ enabledModels: newEnabled });
  };
  
  // Filter models by search
  const filteredModels = useMemo(() => {
    if (!modelSearchQuery) return ALL_MODELS;
    const query = modelSearchQuery.toLowerCase();
    return ALL_MODELS.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.category.toLowerCase().includes(query) ||
      m.id.toLowerCase().includes(query)
    );
  }, [modelSearchQuery]);
  
  // Toggle category expansion
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'behavior' as const, label: 'Behavior', icon: Monitor },
    { id: 'performance' as const, label: 'Performance', icon: Zap },
    { id: 'ai' as const, label: 'AI', icon: MessageSquare },
    { id: 'models' as const, label: 'Models', icon: Cpu },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-border p-4">
            <nav className="space-y-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === id
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-hover'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-4 border-t border-border">
              <button
                onClick={resetToDefaults}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'behavior' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Input</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Enter to Send</label>
                        <p className="text-xs text-secondary">Send messages with Enter key</p>
                      </div>
                       <button
                         onClick={() => updateSettings({ enterToSend: !settings.enterToSend })}
                         className={`w-10 h-6 rounded-full transition-colors ${
                           settings.enterToSend ? 'bg-[var(--color-success)]' : 'bg-[var(--color-secondary)]'
                         }`}
                       >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.enterToSend ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Auto Focus</label>
                        <p className="text-xs text-secondary">Automatically focus input field</p>
                      </div>
                       <button
                         onClick={() => updateSettings({ autoFocus: !settings.autoFocus })}
                         className={`w-10 h-6 rounded-full transition-colors ${
                           settings.autoFocus ? 'bg-[var(--color-success)]' : 'bg-[var(--color-secondary)]'
                         }`}
                       >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.autoFocus ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Auto Scroll</label>
                        <p className="text-xs text-secondary">Automatically scroll to new messages</p>
                      </div>
                       <button
                         onClick={() => updateSettings({ autoScroll: !settings.autoScroll })}
                         className={`w-10 h-6 rounded-full transition-colors ${
                           settings.autoScroll ? 'bg-[var(--color-success)]' : 'bg-[var(--color-secondary)]'
                         }`}
                       >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.autoScroll ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Audio</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Sound Effects</label>
                        <p className="text-xs text-secondary">Play sounds for actions</p>
                      </div>
                       <button
                         onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                         className={`w-10 h-6 rounded-full transition-colors ${
                           settings.soundEnabled ? 'bg-[var(--color-success)]' : 'bg-[var(--color-secondary)]'
                         }`}
                       >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.soundEnabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Data Management</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Auto Save</label>
                        <p className="text-xs text-secondary">Automatically save conversations</p>
                      </div>
                       <button
                         onClick={() => updateSettings({ autoSave: !settings.autoSave })}
                         className={`w-10 h-6 rounded-full transition-colors ${
                           settings.autoSave ? 'bg-[var(--color-success)]' : 'bg-[var(--color-secondary)]'
                         }`}
                       >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.autoSave ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Cache Enabled</label>
                        <p className="text-xs text-secondary">Cache responses for faster loading</p>
                      </div>
                       <button
                         onClick={() => updateSettings({ cacheEnabled: !settings.cacheEnabled })}
                         className={`w-10 h-6 rounded-full transition-colors ${
                           settings.cacheEnabled ? 'bg-[var(--color-success)]' : 'bg-[var(--color-secondary)]'
                         }`}
                       >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.cacheEnabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Max Threads</label>
                        <p className="text-xs text-secondary">Maximum number of saved conversations</p>
                      </div>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        value={settings.maxThreads}
                        onChange={(e) => updateSettings({ maxThreads: parseInt(e.target.value) || 50 })}
                        className="w-20 px-2 py-1 bg-input border border-border rounded text-sm text-foreground text-center"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Animation Speed</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Typing Speed</label>
                        <p className="text-xs text-secondary">Speed of text animations</p>
                      </div>
                      <select
                        value={settings.typingSpeed}
                        onChange={(e) => updateSettings({ typingSpeed: e.target.value as any })}
                        className="px-3 py-1 bg-input border border-border rounded text-sm text-foreground"
                      >
                        <option value="slow">Slow</option>
                        <option value="normal">Normal</option>
                        <option value="fast">Fast</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">AI Behavior</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Show Reasoning</label>
                        <p className="text-xs text-secondary">Display AI thought process</p>
                      </div>
                       <button
                         onClick={() => updateSettings({ reasoningEnabled: !settings.reasoningEnabled })}
                         className={`w-10 h-6 rounded-full transition-colors ${
                           settings.reasoningEnabled ? 'bg-[var(--color-success)]' : 'bg-[var(--color-secondary)]'
                         }`}
                       >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.reasoningEnabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Streaming</label>
                        <p className="text-xs text-secondary">Real-time response streaming</p>
                      </div>
                       <button
                         onClick={() => updateSettings({ streamingEnabled: !settings.streamingEnabled })}
                         className={`w-10 h-6 rounded-full transition-colors ${
                           settings.streamingEnabled ? 'bg-[var(--color-success)]' : 'bg-[var(--color-secondary)]'
                         }`}
                       >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.streamingEnabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

 
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'models' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Model Management</h3>
                  <p className="text-sm text-secondary mb-4">
                    Enable or disable models to customize your model selection dropdown. 
                    {enabledModelIds.size === ALL_MODELS.length 
                      ? ' All models are currently enabled.' 
                      : ` ${enabledModelIds.size} of ${ALL_MODELS.length} models enabled.`}
                  </p>
                  
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input
                      type="text"
                      value={modelSearchQuery}
                      onChange={(e) => setModelSearchQuery(e.target.value)}
                      placeholder="Search models..."
                      className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder-secondary focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => updateSettings({ enabledModels: ALL_MODELS.map((m: ModelInfo) => m.id) })}
                      className="px-3 py-1.5 text-xs bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                    >
                      Enable All
                    </button>
                    <button
                      onClick={() => updateSettings({ enabledModels: [] })}
                      className="px-3 py-1.5 text-xs bg-error/20 text-error rounded-lg hover:bg-error/30 transition-colors"
                    >
                      Disable All
                    </button>
                    <button
                      onClick={() => {
                        // Enable only mainstream models (first few from each category)
                        const mainstream = ALL_MODELS.filter(m => {
                          if (m.category === 'OpenAI') return m.id.includes('gpt-5.1') || m.id.includes('gpt-4o') || m.id.includes('o3');
                          if (m.category === 'Anthropic') return m.id.includes('claude-3.5') || m.id.includes('claude-4') || m.id.includes('claude-opus-4.5');
                          if (m.category === 'Google') return m.id.includes('gemini-3') || m.id.includes('gemini-2.5');
                          if (m.category === 'Meta') return m.id.includes('llama-4') || m.id.includes('llama-3.3');
                          return false;
                        });
                        updateSettings({ enabledModels: mainstream.map(m => m.id) });
                      }}
                      className="px-3 py-1.5 text-xs bg-success/20 text-success rounded-lg hover:bg-success/30 transition-colors"
                    >
                      Mainstream Only
                    </button>
                  </div>

                  {/* Models by Category */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {categories.map((category) => {
                      const categoryModels = filteredModels.filter(m => m.category === category);
                      if (categoryModels.length === 0) return null;
                      
                      const categoryEnabled = categoryModels.filter(m => enabledModelIds.has(m.id));
                      const allCategoryEnabled = categoryEnabled.length === categoryModels.length;
                      const isExpanded = expandedCategories.has(category);
                      
                      return (
                        <div key={category} className="border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleCategoryExpansion(category)}
                            className="w-full flex items-center justify-between p-3 bg-card hover:bg-hover transition-colors"
                          >
                             <div className="flex items-center gap-3">
                               <div
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   toggleCategory(category);
                                 }}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                                    allCategoryEnabled
                                      ? 'bg-[var(--color-success)] border-[var(--color-success)]'
                                      : categoryEnabled.length > 0
                                      ? 'bg-[var(--color-success)]/50 border-[var(--color-success)]'
                                      : 'border-[var(--color-border)]'
                                  }`}
                               >
                                 {allCategoryEnabled && <Check className="w-3 h-3 text-white" />}
                                 {!allCategoryEnabled && categoryEnabled.length > 0 && (
                                   <div className="w-2 h-2 bg-white rounded-full" />
                                 )}
                               </div>
                              <span className="text-sm font-medium text-foreground">{category}</span>
                              <span className="text-xs text-secondary">
                                ({categoryEnabled.length}/{categoryModels.length})
                              </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {isExpanded && (
                            <div className="border-t border-border p-2 space-y-1 max-h-64 overflow-y-auto">
                              {categoryModels.map((model) => {
                                const isEnabled = enabledModelIds.has(model.id);
                                return (
                                  <button
                                    key={model.id}
                                    onClick={() => toggleModel(model.id)}
                                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-hover transition-colors text-left"
                                  >
                                     <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                       isEnabled ? 'bg-[var(--color-success)] border-[var(--color-success)]' : 'border-[var(--color-border)]'
                                     }`}>
                                      {isEnabled && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <ModelIcon modelId={model.id} className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm text-foreground flex-1">{model.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {filteredModels.length === 0 && (
                    <div className="text-center py-8 text-secondary">
                      No models found matching "{modelSearchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}