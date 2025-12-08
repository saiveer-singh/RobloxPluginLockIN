import { useState, useMemo } from 'react';
import { Settings, X, Monitor, Zap, MessageSquare, RotateCcw, Cpu, Search, Check, ChevronDown, Palette, BarChart3, Copy, RefreshCw } from 'lucide-react';
import { useSettings, ThemePreset, themePresets, ThemeColors, type TokenUsageEntry } from '@/lib/settings';
import { ModelIcon } from './ModelIcon';
import { ALL_MODELS, getCategories, type ModelInfo } from '@/lib/models';

function UsageChart({ history }: { history: TokenUsageEntry[] }) {
  // Group data by day for the last 30 days
  const now = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }

  const data = days.map(day => {
    const dayUsage = history
      .filter(entry => new Date(entry.timestamp).toISOString().split('T')[0] === day)
      .reduce((sum, entry) => sum + entry.tokens, 0);
    return { day, tokens: dayUsage };
  });

  const maxTokens = Math.max(...data.map(d => d.tokens));

  return (
    <svg viewBox="0 0 400 200" className="w-full h-full">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(level => (
        <line
          key={level}
          x1="0"
          y1={180 - level * 180}
          x2="400"
          y2={180 - level * 180}
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth="1"
        />
      ))}

      {/* Bars */}
      {data.map((entry, index) => {
        const height = maxTokens > 0 ? (entry.tokens / maxTokens) * 180 : 0;
        const x = (index / (data.length - 1)) * 350 + 25;

        return (
          <g key={entry.day}>
            {/* Bar */}
            <rect
              x={x - 2}
              y={180 - height}
              width="4"
              height={height}
              fill="currentColor"
              className="text-primary/60 hover:text-primary transition-colors"
            />
            {/* Hover area for tooltip */}
            <rect
              x={x - 8}
              y="0"
              width="16"
              height="200"
              fill="transparent"
              className="cursor-pointer"
            >
              <title>
                {new Date(entry.day).toLocaleDateString()}: {entry.tokens.toLocaleString()} tokens (${(entry.tokens * 0.00002).toFixed(4)})
              </title>
            </rect>
          </g>
        );
      })}

      {/* Y-axis labels */}
      {[0, 1].map((level, i) => (
        <text
          key={level}
          x="15"
          y={`${185 - level * 180}`}
          textAnchor="end"
          className="fill-current text-xs text-secondary"
        >
          {level === 0 ? '0' : Math.round(maxTokens / 1000).toLocaleString() + 'k'}
        </text>
      ))}
    </svg>
  );
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pluginToken: string;
  copyToken: () => void;
  regenerateToken: () => void;
}

export function SettingsPanel({ isOpen, onClose, pluginToken, copyToken, regenerateToken }: SettingsPanelProps) {
  const { settings, updateSettings, resetToDefaults } = useSettings();
  const [activeTab, setActiveTab] = useState<'behavior' | 'appearance' | 'performance' | 'ai' | 'models' | 'plugin' | 'usage'>('behavior');
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
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'performance' as const, label: 'Performance', icon: Zap },
    { id: 'ai' as const, label: 'AI', icon: MessageSquare },
    { id: 'models' as const, label: 'Models', icon: Cpu },
    { id: 'plugin' as const, label: 'Plugin', icon: Check },
    { id: 'usage' as const, label: 'Usage', icon: BarChart3 },
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === id ? 'bg-primary text-white' : 'text-foreground hover:bg-hover'}`}
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
                           settings.enterToSend ? 'bg-green-500' : 'bg-gray-400'
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
                           settings.autoFocus ? 'bg-green-500' : 'bg-gray-400'
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
                           settings.autoScroll ? 'bg-green-500' : 'bg-gray-400'
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
                           settings.soundEnabled ? 'bg-green-500' : 'bg-gray-400'
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

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Theme</h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {(Object.keys(themePresets) as ThemePreset[]).map((theme) => {
                      const isSelected = settings.theme === theme;
                      const buttonClass = `p-3 rounded-lg border text-left transition-all ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'}`;
                      return (
                        <button
                          key={theme}
                          onClick={() => updateSettings({ theme })}
                          className={buttonClass}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-4 h-4 rounded-full border border-white/10"
                              style={{ background: themePresets[theme].background }}
                            />
                            <span className="text-sm font-medium capitalize text-foreground">
                              {theme}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <div
                              className="h-2 w-full rounded-full"
                              style={{ background: themePresets[theme].primary }}
                            />
                            <div
                              className="h-2 w-full rounded-full"
                              style={{ background: themePresets[theme].secondary }}
                            />
                            <div
                              className="h-2 w-full rounded-full"
                              style={{ background: themePresets[theme].accent }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-4">Custom Colors</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {Object.entries(settings.customColors || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground capitalize">
                          {key}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={value as string}
                            onChange={(e) => updateSettings({
                              customColors: {
                                ...settings.customColors,
                                [key]: e.target.value
                              }
                            })}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                          />
                          <button
                            onClick={() => {
                              const newColors = { ...settings.customColors };
                              delete newColors[key as keyof ThemeColors];
                              updateSettings({ customColors: newColors });
                            }}
                            className="p-1 hover:bg-hover rounded"
                          >
                            <X className="w-4 h-4 text-secondary" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="col-span-2">
                      <button
                        onClick={() => {
                          const currentThemeColors = themePresets[settings.theme];
                          updateSettings({
                            customColors: {
                              ...settings.customColors,
                              primary: currentThemeColors.primary
                            }
                          });
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        + Add Custom Color Override
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-4">Display</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Font Size</label>
                        <p className="text-xs text-secondary">Adjust text size</p>
                      </div>
                      <select
                        value={settings.fontSize}
                        onChange={(e) => updateSettings({ fontSize: e.target.value as 'small' | 'medium' | 'large' })}
                        className="px-3 py-1 bg-input border border-border rounded text-sm text-foreground"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Animations</label>
                        <p className="text-xs text-secondary">Enable UI animations</p>
                      </div>
                       <button
                         onClick={() => updateSettings({ animations: !settings.animations })}
                         className={`w-10 h-6 rounded-full transition-colors ${
                           settings.animations ? 'bg-green-500' : 'bg-gray-400'
                         }`}
                       >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.animations ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Compact Mode</label>
                        <p className="text-xs text-secondary">Reduce spacing in UI</p>
                      </div>
                       <button
                         onClick={() => updateSettings({ compactMode: !settings.compactMode })}
                         className={`w-10 h-6 rounded-full transition-colors ${
                           settings.compactMode ? 'bg-green-500' : 'bg-gray-400'
                         }`}
                       >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.compactMode ? 'translate-x-5' : 'translate-x-1'
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
                           settings.autoSave ? 'bg-green-500' : 'bg-gray-400'
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
                           settings.cacheEnabled ? 'bg-green-500' : 'bg-gray-400'
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
                        onChange={(e) => updateSettings({ typingSpeed: e.target.value as 'slow' | 'normal' | 'fast' })}
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
                            settings.reasoningEnabled ? 'bg-green-500' : 'bg-gray-400'
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
                            settings.streamingEnabled ? 'bg-green-500' : 'bg-gray-400'
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

            {activeTab === 'plugin' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Plugin Integration</h3>
                  <p className="text-sm text-secondary mb-6">
                    Connect your Roblox plugin to the AI service using the token below.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">Plugin Token</label>
                        <p className="text-xs text-secondary">Your connection token for Roblox plugin</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={copyToken}
                          disabled={!pluginToken}
                          className="p-2 hover:bg-primary/20 rounded transition-colors disabled:opacity-50"
                          title="Copy token"
                        >
                          <Copy className="w-4 h-4 text-primary" />
                        </button>
                        <button
                          onClick={regenerateToken}
                          className="p-2 hover:bg-primary/20 rounded transition-colors"
                          title="Regenerate token"
                        >
                          <RefreshCw className="w-4 h-4 text-primary" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pluginToken}
                        readOnly
                        className="flex-1 px-3 py-2 bg-primary/20 border border-primary/30 rounded text-sm text-foreground font-mono"
                        placeholder="Generating token..."
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-foreground">User ID</label>
                        <p className="text-xs text-secondary">Your Roblox user ID for purchases and authentication</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.userid}
                        onChange={(e) => updateSettings({ userid: e.target.value })}
                        className={`flex-1 px-3 py-2 bg-input border rounded text-sm text-foreground ${!settings.userid ? 'border-error' : 'border-border'}`}
                        placeholder="Enter your Roblox user ID"
                      />
                      {!settings.userid && (
                        <span className="text-xs text-error ml-1">Required</span>
                      )}
                    </div>

                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <h4 className="text-sm font-semibold text-primary mb-2">How to Use</h4>
                      <ol className="text-xs text-primary/80 space-y-1">
                        <li>1. Copy the token above using the copy button</li>
                        <li>2. Open your Roblox plugin settings</li>
                        <li>3. Paste the token into the "AI Service Token" field</li>
                        <li>4. Enter your Roblox user ID above for purchases</li>
                    <li>5. Save settings and restart your plugin</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
          )}

            {activeTab === 'usage' && (
              <div className="space-y-6">
                {/* Overview Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Usage Overview</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-input rounded-lg border border-border">
                      <div className="text-sm text-secondary mb-1">Total Tokens</div>
                      <div className="text-2xl font-bold text-foreground">
                        {(settings.totalTokensUsed || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-secondary mt-1">All-time usage</div>
                    </div>
                    <div className="p-4 bg-input rounded-lg border border-border">
                      <div className="text-sm text-secondary mb-1">Estimated Cost</div>
                      <div className="text-2xl font-bold text-success">
                        ${((settings.totalTokensUsed || 0) * 0.00002).toFixed(4)}
                      </div>
                      <div className="text-xs text-secondary mt-1">@ $0.00002/token avg</div>
                    </div>
                    <div className="p-4 bg-input rounded-lg border border-border">
                      <div className="text-sm text-secondary mb-1">Total Requests</div>
                      <div className="text-2xl font-bold text-foreground">
                        {(settings.tokenUsageHistory || []).length}
                      </div>
                      <div className="text-xs text-secondary mt-1">API calls made</div>
                    </div>
                  </div>

                  {settings.tokenUsageHistory && settings.tokenUsageHistory.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-input/50 rounded-lg border border-border">
                        <div className="text-xs text-secondary mb-1">Avg Tokens/Request</div>
                        <div className="text-lg font-semibold text-foreground">
                          {Math.round((settings.totalTokensUsed || 0) / settings.tokenUsageHistory.length).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 bg-input/50 rounded-lg border border-border">
                        <div className="text-xs text-secondary mb-1">Avg Speed</div>
                        <div className="text-lg font-semibold text-foreground">
                          {(() => {
                            const withSpeed = settings.tokenUsageHistory.filter(e => e.tokensPerSecond);
                            const avg = withSpeed.length > 0 
                              ? withSpeed.reduce((sum, e) => sum + (e.tokensPerSecond || 0), 0) / withSpeed.length
                              : 0;
                            return Math.round(avg).toLocaleString();
                          })()} t/s
                        </div>
                      </div>
                      <div className="p-3 bg-input/50 rounded-lg border border-border">
                        <div className="text-xs text-secondary mb-1">Avg Duration</div>
                        <div className="text-lg font-semibold text-foreground">
                          {(() => {
                            const withDuration = settings.tokenUsageHistory.filter(e => e.duration);
                            const avg = withDuration.length > 0
                              ? withDuration.reduce((sum, e) => sum + (e.duration || 0), 0) / withDuration.length
                              : 0;
                            return avg.toFixed(1);
                          })()} s
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Model Breakdown */}
                {settings.tokenUsageHistory && settings.tokenUsageHistory.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Usage by Model</h3>
                    <div className="space-y-3">
                      {(() => {
                        const modelStats = settings.tokenUsageHistory.reduce((acc, entry) => {
                          const model = entry.model || 'Unknown';
                          if (!acc[model]) {
                            acc[model] = { tokens: 0, requests: 0, cost: 0 };
                          }
                          acc[model].tokens += entry.tokens;
                          acc[model].requests += 1;
                          acc[model].cost += entry.tokens * 0.00002;
                          return acc;
                        }, {} as Record<string, { tokens: number; requests: number; cost: number }>);

                        return Object.entries(modelStats)
                          .sort((a, b) => b[1].tokens - a[1].tokens)
                          .map(([model, stats]) => {
                            const percentage = ((stats.tokens / (settings.totalTokensUsed || 1)) * 100).toFixed(1);
                            return (
                              <div key={model} className="p-4 bg-input rounded-lg border border-border">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <ModelIcon modelId={model} className="w-5 h-5" />
                                    <span className="font-medium text-foreground">{model}</span>
                                  </div>
                                  <span className="text-sm text-secondary">{percentage}%</span>
                                </div>
                                <div className="w-full bg-border rounded-full h-2 mb-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <div className="text-secondary">Tokens</div>
                                    <div className="font-semibold text-foreground">{stats.tokens.toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-secondary">Requests</div>
                                    <div className="font-semibold text-foreground">{stats.requests}</div>
                                  </div>
                                  <div>
                                    <div className="text-secondary">Cost</div>
                                    <div className="font-semibold text-success">${stats.cost.toFixed(6)}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                      })()}
                    </div>
                  </div>
                )}

                {/* Request Type Breakdown */}
                {settings.tokenUsageHistory && settings.tokenUsageHistory.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Usage by Request Type</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(() => {
                        const typeStats = settings.tokenUsageHistory.reduce((acc, entry) => {
                          const type = entry.requestType || 'General';
                          if (!acc[type]) {
                            acc[type] = { tokens: 0, requests: 0 };
                          }
                          acc[type].tokens += entry.tokens;
                          acc[type].requests += 1;
                          return acc;
                        }, {} as Record<string, { tokens: number; requests: number }>);

                        return Object.entries(typeStats)
                          .sort((a, b) => b[1].tokens - a[1].tokens)
                          .map(([type, stats]) => (
                            <div key={type} className="p-3 bg-input rounded-lg border border-border">
                              <div className="text-sm font-medium text-foreground mb-1 capitalize">{type}</div>
                              <div className="text-xs text-secondary mb-2">{stats.requests} requests</div>
                              <div className="text-lg font-bold text-foreground">{stats.tokens.toLocaleString()}</div>
                              <div className="text-xs text-secondary">tokens</div>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Detailed Usage History */}
                {settings.tokenUsageHistory && settings.tokenUsageHistory.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Usage History</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {settings.tokenUsageHistory.slice().reverse().map((entry, index) => (
                        <div key={index} className="p-4 bg-input rounded-lg border border-border hover:border-primary transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <ModelIcon modelId={entry.model || ''} className="w-6 h-6" />
                              <div>
                                <div className="font-medium text-foreground">{entry.model || 'Unknown Model'}</div>
                                <div className="text-xs text-secondary capitalize">{entry.requestType || 'generation'}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-foreground">{entry.tokens.toLocaleString()} tokens</div>
                              <div className="text-xs text-success">${(entry.tokens * 0.00002).toFixed(6)}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border">
                            <div>
                              <div className="text-xs text-secondary">Timestamp</div>
                              <div className="text-xs font-medium text-foreground">
                                {new Date(entry.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </div>
                            </div>
                            {entry.duration && (
                              <div>
                                <div className="text-xs text-secondary">Duration</div>
                                <div className="text-xs font-medium text-foreground">{entry.duration.toFixed(2)}s</div>
                              </div>
                            )}
                            {entry.tokensPerSecond && (
                              <div>
                                <div className="text-xs text-secondary">Speed</div>
                                <div className="text-xs font-medium text-foreground">{Math.round(entry.tokensPerSecond)} t/s</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Data State */}
                {(!settings.tokenUsageHistory || settings.tokenUsageHistory.length === 0) && (
                  <div className="text-center py-16">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-secondary opacity-50" />
                    <h4 className="text-lg font-semibold text-foreground mb-2">No Usage Data Yet</h4>
                    <p className="text-sm text-secondary mb-6">
                      Start using the AI to see detailed usage statistics, model breakdowns, and cost estimates
                    </p>
                  </div>
                )}

                {/* Actions */}
                {settings.tokenUsageHistory && settings.tokenUsageHistory.length > 0 && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const data = JSON.stringify(settings.tokenUsageHistory, null, 2);
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `usage-history-${new Date().toISOString()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex-1 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm transition-colors"
                    >
                      Export Data
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to reset all usage statistics? This cannot be undone.')) {
                          updateSettings({ totalTokensUsed: 0, tokenUsageHistory: [] });
                        }
                      }}
                      className="px-4 py-2 bg-error/10 text-error hover:bg-error/20 rounded-lg text-sm transition-colors"
                    >
                      Reset Statistics
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
