import { useState, useMemo } from 'react';
import { Settings, X, Monitor, Zap, MessageSquare, RotateCcw, Cpu, Search, Check, ChevronDown, Palette, BarChart3, Copy, RefreshCw } from 'lucide-react';
import { useSettings, ThemePreset, themePresets, ThemeColors } from '@/lib/settings';
import { ModelIcon } from './ModelIcon';
import { ALL_MODELS, getCategories, type ModelInfo } from '@/lib/models';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pluginToken: string;
  copyToken: () => void;
  regenerateToken: () => void;
}

export function SettingsPanel({ isOpen, onClose, pluginToken, copyToken, regenerateToken }: SettingsPanelProps): React.JSX.Element | null {
  const { settings, updateSettings, resetToDefaults } = useSettings();
  const [activeTab, setActiveTab] = useState<'appearance' | 'models' | 'plugin' | 'usage'>('appearance');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card text-foreground rounded-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-border">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button onClick={onClose} className="text-secondary hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-6 h-full">
            <div className="w-64 flex-shrink-0">
              <nav className="space-y-2">
                {[
                  { id: 'appearance', label: 'Appearance', icon: Palette },
                  { id: 'models', label: 'Models', icon: Cpu },
                  { id: 'plugin', label: 'Plugin', icon: Settings },
                  { id: 'usage', label: 'Usage', icon: BarChart3 }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as 'appearance' | 'models' | 'plugin' | 'usage')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-input text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex-1">
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
                  </div>
                </div>
              )}

            {activeTab === 'models' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Model Management</h3>
                  <p>Models tab content</p>
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
                        <li>3. Paste the token into the &quot;AI Service Token&quot; field</li>
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
    </div>
  );
}
