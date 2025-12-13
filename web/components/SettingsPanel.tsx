import { useState, useMemo } from 'react';
import { Settings, X, Monitor, Zap, MessageSquare, RotateCcw, Cpu, Search, Check, ChevronDown, Palette, BarChart3, Copy, RefreshCw, Accessibility, Type, Bot, Bell, Shield, Keyboard, Download } from 'lucide-react';
import { useSettings, ThemePreset, themePresets, ThemeColors } from '@/lib/settings';
import { useSound } from '@/lib/useSound';
import { ModelIcon } from './ModelIcon';
import { ALL_MODELS, getCategories, type ModelInfo } from '@/lib/models';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pluginToken: string;
  copyToken: () => void;
  regenerateToken: () => void;
}

type SettingsTab = 'appearance' | 'accessibility' | 'typography' | 'ai' | 'notifications' | 'privacy' | 'keyboard' | 'plugin' | 'usage' | 'data';

// Reusable Toggle Switch Component
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{ backgroundColor: enabled ? '#4ade80' : '#52525b' }}
      className="w-14 h-7 rounded-full transition-all duration-200 relative flex-shrink-0"
    >
      <div
        style={{
          backgroundColor: enabled ? '#ffffff' : '#a1a1aa',
          left: enabled ? '1.75rem' : '0.25rem'
        }}
        className="absolute top-1 w-5 h-5 rounded-full shadow-md transition-all duration-200"
      />
    </button>
  );
}

// Sound Button Component with preview
type NotificationSound = 'none' | 'subtle' | 'chime' | 'ping';

function SoundButton({
  sound,
  currentSound,
  onSelect
}: {
  sound: NotificationSound;
  currentSound: NotificationSound;
  onSelect: (sound: NotificationSound) => void;
}) {
  const { playNotification } = useSound();

  const handleClick = () => {
    onSelect(sound);
    // Play preview if not 'none'
    if (sound !== 'none') {
      // Temporarily enable sound for preview
      setTimeout(() => playNotification(), 50);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1 text-xs rounded-lg border transition-all ${currentSound === sound
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-input border-border text-foreground hover:border-primary/50'
        }`}
    >
      {sound.charAt(0).toUpperCase() + sound.slice(1)}
    </button>
  );
}

export function SettingsPanel({ isOpen, onClose, pluginToken, copyToken, regenerateToken }: SettingsPanelProps): React.JSX.Element | null {
  const { settings, updateSettings, resetToDefaults } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-card text-foreground rounded-none sm:rounded-xl w-full sm:max-w-4xl h-full sm:h-[90vh] flex flex-col overflow-hidden border-0 sm:border border-border animate-scale-in">

        <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center safe-area-top">
          <h2 className="text-xl sm:text-2xl font-bold">Settings</h2>
          <button onClick={onClose} className="text-secondary hover:text-foreground p-2 hover:bg-hover rounded-lg transition-colors ripple active-press">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 h-full">
            {/* Mobile: Horizontal scrollable tabs */}
            <div className="sm:w-64 flex-shrink-0">
              <nav className="flex sm:flex-col gap-2 sm:gap-1 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="hidden sm:block text-xs font-semibold text-secondary uppercase tracking-wider px-3 py-2">General</div>
                {[
                  { id: 'appearance', label: 'Appearance', icon: Palette },
                  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
                  { id: 'typography', label: 'Typography', icon: Type },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as SettingsTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-input text-foreground'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}

                <div className="hidden sm:block text-xs font-semibold text-secondary uppercase tracking-wider px-3 py-2 pt-4">Chat</div>
                {[
                  { id: 'ai', label: 'Chat Settings', icon: Bot },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as SettingsTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-input text-foreground'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}

                <div className="text-xs font-semibold text-secondary uppercase tracking-wider px-3 py-2 pt-4">System</div>
                {[
                  { id: 'privacy', label: 'Privacy & Data', icon: Shield },
                  { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
                  { id: 'plugin', label: 'Plugin', icon: Settings },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as SettingsTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-input text-foreground'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}

                <div className="text-xs font-semibold text-secondary uppercase tracking-wider px-3 py-2 pt-4">Advanced</div>
                {[
                  { id: 'usage', label: 'Usage Stats', icon: BarChart3 },
                  { id: 'data', label: 'Import/Export', icon: Download },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as SettingsTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === id
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
                  {/* Theme Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Theme</h3>
                    <div className="relative">
                      {(() => {
                        // Safely get current theme with fallback
                        const currentTheme = themePresets[settings.theme] ? settings.theme : 'dark';
                        const currentThemeColors = themePresets[currentTheme] || themePresets.dark;

                        return (
                          <>
                            <button
                              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                              className="w-full p-4 rounded-xl border border-border bg-input hover:bg-hover transition-colors flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center"
                                  style={{ background: currentThemeColors.background }}
                                >
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ background: currentThemeColors.primary }}
                                  />
                                </div>
                                <div className="text-left">
                                  <div className="text-sm font-medium capitalize text-foreground">{currentTheme}</div>
                                  <div className="text-xs text-secondary">Current theme</div>
                                </div>
                              </div>
                              <ChevronDown className={`w-5 h-5 text-secondary transition-transform ${themeDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                          </>
                        );
                      })()}

                      {themeDropdownOpen && (
                        <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
                          {/* Core Themes */}
                          <div className="px-3 py-2 text-xs font-semibold text-secondary uppercase tracking-wider bg-input/50 sticky top-0">Core</div>
                          {(['dark', 'light', 'midnight', 'minimal'] as ThemePreset[]).map((theme) => (
                            <button
                              key={theme}
                              onClick={() => { updateSettings({ theme }); setThemeDropdownOpen(false); }}
                              className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-hover transition-colors ${settings.theme === theme ? 'bg-primary/10' : ''}`}
                            >
                              <div className="w-6 h-6 rounded-md border border-white/10" style={{ background: themePresets[theme].background }}>
                                <div className="w-full h-full rounded-md flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full" style={{ background: themePresets[theme].primary }} />
                                </div>
                              </div>
                              <span className="text-sm capitalize text-foreground flex-1 text-left">{theme}</span>
                              {settings.theme === theme && <Check className="w-4 h-4 text-primary" />}
                            </button>
                          ))}

                          {/* Nature Themes */}
                          <div className="px-3 py-2 text-xs font-semibold text-secondary uppercase tracking-wider bg-input/50 sticky top-0">Nature</div>
                          {(['ocean', 'forest', 'sunset', 'aurora', 'arctic'] as ThemePreset[]).map((theme) => (
                            <button
                              key={theme}
                              onClick={() => { updateSettings({ theme }); setThemeDropdownOpen(false); }}
                              className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-hover transition-colors ${settings.theme === theme ? 'bg-primary/10' : ''}`}
                            >
                              <div className="w-6 h-6 rounded-md border border-white/10" style={{ background: themePresets[theme].background }}>
                                <div className="w-full h-full rounded-md flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full" style={{ background: themePresets[theme].primary }} />
                                </div>
                              </div>
                              <span className="text-sm capitalize text-foreground flex-1 text-left">{theme}</span>
                              {settings.theme === theme && <Check className="w-4 h-4 text-primary" />}
                            </button>
                          ))}

                          {/* Code Editor Themes */}
                          <div className="px-3 py-2 text-xs font-semibold text-secondary uppercase tracking-wider bg-input/50 sticky top-0">Code Editor</div>
                          {(['dracula', 'nord', 'monokai', 'solarized', 'gruvbox', 'onedark', 'tokyonight', 'catppuccin', 'rosepine'] as ThemePreset[]).map((theme) => (
                            <button
                              key={theme}
                              onClick={() => { updateSettings({ theme }); setThemeDropdownOpen(false); }}
                              className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-hover transition-colors ${settings.theme === theme ? 'bg-primary/10' : ''}`}
                            >
                              <div className="w-6 h-6 rounded-md border border-white/10" style={{ background: themePresets[theme].background }}>
                                <div className="w-full h-full rounded-md flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full" style={{ background: themePresets[theme].primary }} />
                                </div>
                              </div>
                              <span className="text-sm capitalize text-foreground flex-1 text-left">{theme}</span>
                              {settings.theme === theme && <Check className="w-4 h-4 text-primary" />}
                            </button>
                          ))}

                          {/* Aesthetic Themes */}
                          <div className="px-3 py-2 text-xs font-semibold text-secondary uppercase tracking-wider bg-input/50 sticky top-0">Aesthetic</div>
                          {(['synthwave', 'cyberpunk', 'neon', 'lavender', 'mint', 'coral', 'ember', 'sapphire', 'amethyst', 'jade', 'obsidian', 'cream', 'slate', 'copper'] as ThemePreset[]).map((theme) => (
                            <button
                              key={theme}
                              onClick={() => { updateSettings({ theme }); setThemeDropdownOpen(false); }}
                              className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-hover transition-colors ${settings.theme === theme ? 'bg-primary/10' : ''}`}
                            >
                              <div className="w-6 h-6 rounded-md border border-white/10" style={{ background: themePresets[theme].background }}>
                                <div className="w-full h-full rounded-md flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full" style={{ background: themePresets[theme].primary }} />
                                </div>
                              </div>
                              <span className="text-sm capitalize text-foreground flex-1 text-left">{theme}</span>
                              {settings.theme === theme && <Check className="w-4 h-4 text-primary" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Accent Color */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Custom Accent Color</h3>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={settings.accentColor || themePresets[settings.theme]?.primary || '#3b82f6'}
                        onChange={(e) => updateSettings({ accentColor: e.target.value })}
                        className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={settings.accentColor || themePresets[settings.theme]?.primary || '#3b82f6'}
                          onChange={(e) => updateSettings({ accentColor: e.target.value })}
                          placeholder="#3b82f6"
                          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
                        />
                      </div>
                      <button
                        onClick={() => updateSettings({ accentColor: undefined })}
                        className="px-3 py-2 text-xs text-secondary hover:text-foreground border border-border rounded-lg hover:bg-hover transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Layout Options */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Layout</h3>
                    <div className="space-y-4">
                      {/* Sidebar Position */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-foreground">Sidebar Position</label>
                          <p className="text-xs text-secondary">Choose which side the sidebar appears on</p>
                        </div>
                        <div className="flex gap-2">
                          {(['left', 'right'] as const).map((pos) => (
                            <button
                              key={pos}
                              onClick={() => updateSettings({ sidebarPosition: pos })}
                              className={`px-4 py-2 text-sm rounded-lg border transition-all ${settings.sidebarPosition === pos
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-input border-border text-foreground hover:border-primary/50'
                                }`}
                            >
                              {pos.charAt(0).toUpperCase() + pos.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Message Density */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-foreground">Message Density</label>
                          <p className="text-xs text-secondary">Control spacing between messages</p>
                        </div>
                        <div className="flex gap-2">
                          {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                            <button
                              key={density}
                              onClick={() => updateSettings({ messageDensity: density })}
                              className={`px-3 py-2 text-sm rounded-lg border transition-all ${settings.messageDensity === density
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-input border-border text-foreground hover:border-primary/50'
                                }`}
                            >
                              {density.charAt(0).toUpperCase() + density.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Bubble Style */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Chat Bubble Style</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {(['rounded', 'square', 'minimal'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => updateSettings({ chatBubbleStyle: style })}
                          className={`p-4 rounded-lg border transition-all hover-lift ${settings.chatBubbleStyle === style
                            ? 'border-primary ring-1 ring-primary'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <div className="space-y-2">
                            <div className={`h-3 w-full bg-primary/30 ${style === 'rounded' ? 'rounded-full' :
                              style === 'square' ? 'rounded-sm' :
                                'rounded-none border-l-2 border-primary'
                              }`} />
                            <div className={`h-3 w-3/4 bg-secondary/30 ${style === 'rounded' ? 'rounded-full' :
                              style === 'square' ? 'rounded-sm' :
                                'rounded-none border-l-2 border-secondary'
                              }`} />
                          </div>
                          <span className="text-xs text-foreground mt-2 block capitalize">{style}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background Style */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Background Style</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {(['solid', 'gradient', 'pattern'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => updateSettings({ backgroundStyle: style })}
                          className={`p-4 rounded-lg border transition-all hover-lift ${settings.backgroundStyle === style
                            ? 'border-primary ring-1 ring-primary'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <div className={`h-12 w-full rounded-lg ${style === 'solid' ? 'bg-card' :
                            style === 'gradient' ? 'bg-gradient-to-br from-card to-background' :
                              'bg-card'
                            }`} style={style === 'pattern' ? {
                              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                              backgroundSize: '10px 10px'
                            } : {}} />
                          <span className="text-xs text-foreground mt-2 block capitalize">{style}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Effects */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Visual Effects</h3>
                    <div className="space-y-4">
                      {/* Glass Effect Toggle */}
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Glassmorphism</label>
                          <p className="text-xs text-secondary">Frosted glass effect on cards and modals</p>
                        </div>
                        <Toggle enabled={settings.glassEffect} onToggle={() => updateSettings({ glassEffect: !settings.glassEffect })} />
                      </div>

                      {/* Glow Effects Toggle */}
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Glow Effects</label>
                          <p className="text-xs text-secondary">Subtle glow on buttons and interactive elements</p>
                        </div>
                        <Toggle enabled={settings.glowEffects} onToggle={() => updateSettings({ glowEffects: !settings.glowEffects })} />
                      </div>

                      {/* Animations Toggle */}
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Animations</label>
                          <p className="text-xs text-secondary">Enable smooth transitions and animations</p>
                        </div>
                        <Toggle enabled={settings.animations} onToggle={() => updateSettings({ animations: !settings.animations })} />
                      </div>
                    </div>
                  </div>


                  {/* Reset Button */}
                  <div className="pt-4 border-t border-border">
                    <button
                      onClick={resetToDefaults}
                      className="w-full px-4 py-3 text-sm bg-error/10 text-error hover:bg-error/20 rounded-lg transition-colors"
                    >
                      Reset All Settings to Defaults
                    </button>
                  </div>
                </div>
              )}

              {/* Accessibility Tab */}
              {activeTab === 'accessibility' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Accessibility</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Reduced Motion</label>
                          <p className="text-xs text-secondary">Minimize animations for motion sensitivity</p>
                        </div>
                        <Toggle enabled={settings.reducedMotion} onToggle={() => updateSettings({ reducedMotion: !settings.reducedMotion })} />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">High Contrast</label>
                          <p className="text-xs text-secondary">Increase contrast for better readability</p>
                        </div>
                        <Toggle enabled={settings.highContrast} onToggle={() => updateSettings({ highContrast: !settings.highContrast })} />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Focus Indicators</label>
                          <p className="text-xs text-secondary">Show visible focus rings for keyboard navigation</p>
                        </div>
                        <Toggle enabled={settings.focusIndicators} onToggle={() => updateSettings({ focusIndicators: !settings.focusIndicators })} />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Screen Reader Optimized</label>
                          <p className="text-xs text-secondary">Improve compatibility with screen readers</p>
                        </div>
                        <Toggle enabled={settings.screenReaderOptimized} onToggle={() => updateSettings({ screenReaderOptimized: !settings.screenReaderOptimized })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Typography Tab */}
              {activeTab === 'typography' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Font Family</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {(['system', 'inter', 'roboto', 'jetbrains', 'fira'] as const).map((font) => (
                        <button
                          key={font}
                          onClick={() => updateSettings({ fontFamily: font })}
                          className={`p-4 rounded-lg border transition-all hover-lift ${settings.fontFamily === font
                            ? 'border-primary ring-1 ring-primary'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <span className="text-sm font-medium capitalize text-foreground">{font}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Code Font</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(['mono', 'jetbrains', 'fira-code', 'cascadia'] as const).map((font) => (
                        <button
                          key={font}
                          onClick={() => updateSettings({ codeFont: font })}
                          className={`p-4 rounded-lg border transition-all hover-lift ${settings.codeFont === font
                            ? 'border-primary ring-1 ring-primary'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <span className="text-sm font-medium capitalize text-foreground">{font.replace('-', ' ')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Line Height</h3>
                    <div className="flex gap-2">
                      {(['tight', 'normal', 'relaxed'] as const).map((height) => (
                        <button
                          key={height}
                          onClick={() => updateSettings({ lineHeight: height })}
                          className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-all ${settings.lineHeight === height
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-input border-border text-foreground hover:border-primary/50'
                            }`}
                        >
                          {height.charAt(0).toUpperCase() + height.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Font Size</h3>
                    <div className="flex gap-2">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => updateSettings({ fontSize: size })}
                          className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-all ${settings.fontSize === size
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-input border-border text-foreground hover:border-primary/50'
                            }`}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Settings Tab */}
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Message Display</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Show Timestamps</label>
                          <p className="text-xs text-secondary">Display time on each message</p>
                        </div>
                        <Toggle enabled={settings.showTimestamps !== false} onToggle={() => updateSettings({ showTimestamps: !settings.showTimestamps })} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Compact Messages</label>
                          <p className="text-xs text-secondary">Reduce spacing between messages</p>
                        </div>
                        <Toggle enabled={settings.compactMode} onToggle={() => updateSettings({ compactMode: !settings.compactMode })} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Show Coin Cost</label>
                          <p className="text-xs text-secondary">Display coins used per response</p>
                        </div>
                        <Toggle enabled={settings.showCoinCost !== false} onToggle={() => updateSettings({ showCoinCost: !settings.showCoinCost })} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Input Behavior</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Enter to Send</label>
                          <p className="text-xs text-secondary">Press Enter to send messages (Shift+Enter for newline)</p>
                        </div>
                        <Toggle enabled={settings.enterToSend !== false} onToggle={() => updateSettings({ enterToSend: !settings.enterToSend })} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Auto Focus Input</label>
                          <p className="text-xs text-secondary">Focus input after sending a message</p>
                        </div>
                        <Toggle enabled={settings.autoFocus !== false} onToggle={() => updateSettings({ autoFocus: !settings.autoFocus })} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Auto Scroll</label>
                          <p className="text-xs text-secondary">Automatically scroll to new messages</p>
                        </div>
                        <Toggle enabled={settings.autoScroll !== false} onToggle={() => updateSettings({ autoScroll: !settings.autoScroll })} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Chat Features</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Syntax Highlighting</label>
                          <p className="text-xs text-secondary">Highlight code in responses</p>
                        </div>
                        <Toggle enabled={settings.codeHighlighting} onToggle={() => updateSettings({ codeHighlighting: !settings.codeHighlighting })} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Markdown Rendering</label>
                          <p className="text-xs text-secondary">Render markdown formatting</p>
                        </div>
                        <Toggle enabled={settings.markdownRendering} onToggle={() => updateSettings({ markdownRendering: !settings.markdownRendering })} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Code Wrap</label>
                          <p className="text-xs text-secondary">Wrap long code lines instead of scrolling</p>
                        </div>
                        <Toggle enabled={settings.codeWrap} onToggle={() => updateSettings({ codeWrap: !settings.codeWrap })} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Show Token Count</label>
                          <p className="text-xs text-secondary">Display token usage per message</p>
                        </div>
                        <Toggle enabled={settings.showTokenCount} onToggle={() => updateSettings({ showTokenCount: !settings.showTokenCount })} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Show Word Count</label>
                          <p className="text-xs text-secondary">Display word count per message</p>
                        </div>
                        <Toggle enabled={settings.showWordCount} onToggle={() => updateSettings({ showWordCount: !settings.showWordCount })} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Auto-Generate Titles</label>
                          <p className="text-xs text-secondary">Automatically name conversations</p>
                        </div>
                        <Toggle enabled={settings.autoGenerateTitle} onToggle={() => updateSettings({ autoGenerateTitle: !settings.autoGenerateTitle })} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Show Reasoning</label>
                          <p className="text-xs text-secondary">Display AI reasoning when available</p>
                        </div>
                        <Toggle enabled={settings.reasoningEnabled} onToggle={() => updateSettings({ reasoningEnabled: !settings.reasoningEnabled })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Desktop Notifications</label>
                          <p className="text-xs text-secondary">Show system notifications for new messages</p>
                        </div>
                        <Toggle enabled={settings.desktopNotifications} onToggle={() => updateSettings({ desktopNotifications: !settings.desktopNotifications })} />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Notify on Complete</label>
                          <p className="text-xs text-secondary">Alert when long responses finish generating</p>
                        </div>
                        <Toggle enabled={settings.notifyOnComplete} onToggle={() => updateSettings({ notifyOnComplete: !settings.notifyOnComplete })} />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Sound Effects</label>
                          <p className="text-xs text-secondary">Play sounds for events</p>
                        </div>
                        <Toggle enabled={settings.soundEnabled} onToggle={() => updateSettings({ soundEnabled: !settings.soundEnabled })} />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Notification Sound</label>
                          <p className="text-xs text-secondary">Choose notification sound style</p>
                        </div>
                        <div className="flex gap-2">
                          {(['none', 'subtle', 'chime', 'ping'] as const).map((sound) => (
                            <SoundButton
                              key={sound}
                              sound={sound}
                              currentSound={settings.notificationSound}
                              onSelect={(s) => updateSettings({ notificationSound: s })}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Privacy & Data</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Save Chat History</label>
                          <p className="text-xs text-secondary">Store conversation history locally</p>
                        </div>
                        <Toggle enabled={settings.saveHistory} onToggle={() => updateSettings({ saveHistory: !settings.saveHistory })} />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Anonymous Mode</label>
                          <p className="text-xs text-secondary">Don't save any identifying information</p>
                        </div>
                        <Toggle enabled={settings.anonymousMode} onToggle={() => updateSettings({ anonymousMode: !settings.anonymousMode })} />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Clear on Close</label>
                          <p className="text-xs text-secondary">Clear all data when browser closes</p>
                        </div>
                        <Toggle enabled={settings.clearDataOnClose} onToggle={() => updateSettings({ clearDataOnClose: !settings.clearDataOnClose })} />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Cache Enabled</label>
                          <p className="text-xs text-secondary">Cache data for faster loading</p>
                        </div>
                        <Toggle enabled={settings.cacheEnabled} onToggle={() => updateSettings({ cacheEnabled: !settings.cacheEnabled })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Keyboard Tab */}
              {activeTab === 'keyboard' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Keyboard Shortcuts</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'newChat', label: 'New Chat', default: settings.shortcuts.newChat },
                        { key: 'sendMessage', label: 'Send Message', default: settings.shortcuts.sendMessage },
                        { key: 'openSettings', label: 'Open Settings', default: settings.shortcuts.openSettings },
                        { key: 'toggleSidebar', label: 'Toggle Sidebar', default: settings.shortcuts.toggleSidebar },
                        { key: 'focusInput', label: 'Focus Input', default: settings.shortcuts.focusInput },
                      ].map(({ key, label, default: defaultValue }) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                          <label className="text-sm font-medium text-foreground">{label}</label>
                          <kbd className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm font-mono text-foreground">
                            {defaultValue}
                          </kbd>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-secondary mt-4">Keyboard shortcuts are currently read-only. Custom shortcuts coming soon.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Input Behavior</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Enter to Send</label>
                          <p className="text-xs text-secondary">Press Enter to send messages</p>
                        </div>
                        <Toggle enabled={settings.enterToSend} onToggle={() => updateSettings({ enterToSend: !settings.enterToSend })} />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border">
                        <div>
                          <label className="text-sm font-medium text-foreground">Auto Focus</label>
                          <p className="text-xs text-secondary">Automatically focus input field</p>
                        </div>
                        <Toggle enabled={settings.autoFocus} onToggle={() => updateSettings({ autoFocus: !settings.autoFocus })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Data Tab */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Export Settings</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          const data = JSON.stringify(settings, null, 2);
                          const blob = new Blob([data], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `nxtai-settings-${new Date().toISOString().split('T')[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="w-full p-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg border border-primary/20 transition-colors text-left"
                      >
                        <div className="font-medium">Export Settings</div>
                        <div className="text-xs opacity-80">Download all settings as JSON file</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Import Settings</h3>
                    <div className="space-y-3">
                      <label className="block w-full p-4 bg-input hover:bg-hover rounded-lg border border-border transition-colors text-left cursor-pointer">
                        <div className="font-medium text-foreground">Import Settings</div>
                        <div className="text-xs text-secondary">Load settings from JSON file</div>
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                try {
                                  const imported = JSON.parse(event.target?.result as string);
                                  updateSettings(imported);
                                  alert('Settings imported successfully!');
                                } catch (err) {
                                  alert('Failed to import settings. Invalid file format.');
                                }
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Danger Zone</h3>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
                          resetToDefaults();
                        }
                      }}
                      className="w-full px-4 py-3 text-sm bg-error/10 text-error hover:bg-error/20 rounded-lg transition-colors"
                    >
                      Reset All Settings to Defaults
                    </button>
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
