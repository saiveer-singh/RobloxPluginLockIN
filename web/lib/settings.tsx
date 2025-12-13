"use client";

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

export type ThemePreset =
  | 'dark' | 'light' | 'midnight' | 'minimal'
  | 'ocean' | 'forest' | 'sunset' | 'aurora'
  | 'dracula' | 'nord' | 'monokai' | 'solarized'
  | 'gruvbox' | 'onedark' | 'tokyonight' | 'catppuccin'
  | 'rosepine' | 'synthwave' | 'cyberpunk' | 'neon'
  | 'lavender' | 'mint' | 'coral' | 'arctic'
  | 'ember' | 'sapphire' | 'amethyst' | 'jade'
  | 'obsidian' | 'cream' | 'slate' | 'copper';


export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  accent: string;
  border: string;
  card: string;
  input: string;
  hover: string;
  success: string;
  error: string;
  warning: string;
}

export interface TokenUsageEntry {
  timestamp: number;
  tokens: number;
  model?: string;
  requestType?: string;
  duration?: number;
  tokensPerSecond?: number;
}

export interface Settings {
  // Theme
  theme: ThemePreset;
  customColors?: Partial<ThemeColors>;
  accentColor?: string; // Custom accent color override (hex)

  // UI
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  compactMode: boolean;
  showTimestamps: boolean;
  autoScroll: boolean;
  sidebarPosition: 'left' | 'right';
  chatBubbleStyle: 'rounded' | 'square' | 'minimal';
  backgroundStyle: 'solid' | 'gradient' | 'pattern';
  messageDensity: 'compact' | 'comfortable' | 'spacious';

  // Visual Effects
  glassEffect: boolean;
  glowEffects: boolean;

  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  focusIndicators: boolean;
  screenReaderOptimized: boolean;

  // Font & Typography
  fontFamily: 'system' | 'inter' | 'roboto' | 'jetbrains' | 'fira';
  codeFont: 'mono' | 'jetbrains' | 'fira-code' | 'cascadia';
  lineHeight: 'tight' | 'normal' | 'relaxed';

  // AI Behavior
  defaultTemperature: number;
  contextWindow: 'small' | 'medium' | 'large' | 'maximum';
  autoSuggest: boolean;
  codeHighlighting: boolean;
  showTokenCount: boolean;
  showWordCount: boolean;
  showCoinCost: boolean;
  autoGenerateTitle: boolean;
  codeWrap: boolean;
  markdownRendering: boolean;

  // Notifications
  desktopNotifications: boolean;
  notificationSound: 'none' | 'subtle' | 'chime' | 'ping';
  notifyOnComplete: boolean;

  // Privacy & Data
  saveHistory: boolean;
  anonymousMode: boolean;
  clearDataOnClose: boolean;

  // Performance
  autoSave: boolean;
  maxThreads: number;
  cacheEnabled: boolean;
  typingSpeed: 'slow' | 'normal' | 'fast';

  // AI
  reasoningEnabled: boolean;
  streamingEnabled: boolean;
  enabledModels?: string[]; // Array of model IDs that are enabled

  // Behavior
  enterToSend: boolean;
  autoFocus: boolean;
  soundEnabled: boolean;

  // Keyboard Shortcuts
  shortcuts: {
    newChat: string;
    sendMessage: string;
    openSettings: string;
    toggleSidebar: string;
    focusInput: string;
  };

  // Plugin
  userid: string;

  // Usage Stats
  totalTokensUsed: number;
  tokenUsageHistory: TokenUsageEntry[];
}


const defaultSettings: Settings = {
  // Theme
  theme: 'dark',

  // UI
  fontSize: 'medium',
  animations: true,
  compactMode: false,
  showTimestamps: false,
  autoScroll: true,
  sidebarPosition: 'left',
  chatBubbleStyle: 'rounded',
  backgroundStyle: 'solid',
  messageDensity: 'comfortable',

  // Visual Effects
  glassEffect: true,
  glowEffects: true,

  // Accessibility
  reducedMotion: false,
  highContrast: false,
  focusIndicators: true,
  screenReaderOptimized: false,

  // Font & Typography
  fontFamily: 'system',
  codeFont: 'mono',
  lineHeight: 'normal',

  // AI Behavior
  defaultTemperature: 0.7,
  contextWindow: 'medium',
  autoSuggest: false,
  codeHighlighting: true,
  showTokenCount: true,
  showWordCount: false,
  showCoinCost: true,
  autoGenerateTitle: true,
  codeWrap: true,
  markdownRendering: true,

  // Notifications
  desktopNotifications: false,
  notificationSound: 'none',
  notifyOnComplete: false,

  // Privacy & Data
  saveHistory: true,
  anonymousMode: false,
  clearDataOnClose: false,

  // Performance
  autoSave: true,
  maxThreads: 50,
  cacheEnabled: true,
  typingSpeed: 'normal',

  // AI
  reasoningEnabled: true,
  streamingEnabled: true,

  // Behavior
  enterToSend: true,
  autoFocus: true,
  soundEnabled: false,

  // Keyboard Shortcuts
  shortcuts: {
    newChat: 'Ctrl+N',
    sendMessage: 'Enter',
    openSettings: 'Ctrl+,',
    toggleSidebar: 'Ctrl+B',
    focusInput: 'Ctrl+/',
  },

  // Plugin
  userid: '',

  // Usage Stats
  totalTokensUsed: 0,
  tokenUsageHistory: [],
};


const themePresets: Record<ThemePreset, ThemeColors> = {
  // === CORE THEMES ===
  dark: {
    background: '#0a0a0a',
    foreground: '#ffffff',
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#a1a1aa',
    accent: '#8b5cf6',
    border: '#27272a',
    card: '#18181b',
    input: '#27272a',
    hover: '#3f3f46',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  light: {
    background: '#ffffff',
    foreground: '#09090b',
    primary: '#2563eb',
    primaryForeground: '#ffffff',
    secondary: '#71717a',
    accent: '#7c3aed',
    border: '#e4e4e7',
    card: '#fafafa',
    input: '#f4f4f5',
    hover: '#e4e4e7',
    success: '#16a34a',
    error: '#dc2626',
    warning: '#d97706',
  },
  midnight: {
    background: '#020617',
    foreground: '#f8fafc',
    primary: '#6366f1',
    primaryForeground: '#ffffff',
    secondary: '#94a3b8',
    accent: '#a855f7',
    border: '#1e293b',
    card: '#0f172a',
    input: '#1e293b',
    hover: '#334155',
    success: '#10b981',
    error: '#f43f5e',
    warning: '#f59e0b',
  },
  minimal: {
    background: '#fafafa',
    foreground: '#18181b',
    primary: '#18181b',
    primaryForeground: '#fafafa',
    secondary: '#71717a',
    accent: '#52525b',
    border: '#d4d4d8',
    card: '#ffffff',
    input: '#f4f4f5',
    hover: '#e4e4e7',
    success: '#16a34a',
    error: '#dc2626',
    warning: '#ca8a04',
  },
  // === NATURE THEMES ===
  ocean: {
    background: '#0c1929',
    foreground: '#e0f2fe',
    primary: '#0ea5e9',
    primaryForeground: '#ffffff',
    secondary: '#7dd3fc',
    accent: '#06b6d4',
    border: '#164e63',
    card: '#0f2942',
    input: '#1e3a5f',
    hover: '#2563eb',
    success: '#14b8a6',
    error: '#f43f5e',
    warning: '#fbbf24',
  },
  forest: {
    background: '#052e16',
    foreground: '#dcfce7',
    primary: '#22c55e',
    primaryForeground: '#ffffff',
    secondary: '#86efac',
    accent: '#16a34a',
    border: '#166534',
    card: '#14532d',
    input: '#166534',
    hover: '#15803d',
    success: '#4ade80',
    error: '#f87171',
    warning: '#fbbf24',
  },
  sunset: {
    background: '#1c1917',
    foreground: '#fef3c7',
    primary: '#f97316',
    primaryForeground: '#ffffff',
    secondary: '#fdba74',
    accent: '#ef4444',
    border: '#44403c',
    card: '#292524',
    input: '#44403c',
    hover: '#57534e',
    success: '#84cc16',
    error: '#dc2626',
    warning: '#fbbf24',
  },
  aurora: {
    background: '#0f0f23',
    foreground: '#e0f7fa',
    primary: '#00bcd4',
    primaryForeground: '#ffffff',
    secondary: '#80deea',
    accent: '#ab47bc',
    border: '#263238',
    card: '#1a1a2e',
    input: '#263238',
    hover: '#37474f',
    success: '#4caf50',
    error: '#e91e63',
    warning: '#ffc107',
  },
  arctic: {
    background: '#f0f9ff',
    foreground: '#0c4a6e',
    primary: '#0284c7',
    primaryForeground: '#ffffff',
    secondary: '#38bdf8',
    accent: '#0369a1',
    border: '#bae6fd',
    card: '#f8fafc',
    input: '#e0f2fe',
    hover: '#bae6fd',
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706',
  },
  // === CODE EDITOR THEMES ===
  dracula: {
    background: '#282a36',
    foreground: '#f8f8f2',
    primary: '#bd93f9',
    primaryForeground: '#282a36',
    secondary: '#6272a4',
    accent: '#ff79c6',
    border: '#44475a',
    card: '#21222c',
    input: '#44475a',
    hover: '#6272a4',
    success: '#50fa7b',
    error: '#ff5555',
    warning: '#f1fa8c',
  },
  nord: {
    background: '#2e3440',
    foreground: '#eceff4',
    primary: '#88c0d0',
    primaryForeground: '#2e3440',
    secondary: '#81a1c1',
    accent: '#5e81ac',
    border: '#4c566a',
    card: '#3b4252',
    input: '#434c5e',
    hover: '#4c566a',
    success: '#a3be8c',
    error: '#bf616a',
    warning: '#ebcb8b',
  },
  monokai: {
    background: '#272822',
    foreground: '#f8f8f2',
    primary: '#a6e22e',
    primaryForeground: '#272822',
    secondary: '#75715e',
    accent: '#f92672',
    border: '#49483e',
    card: '#3e3d32',
    input: '#49483e',
    hover: '#75715e',
    success: '#a6e22e',
    error: '#f92672',
    warning: '#e6db74',
  },
  solarized: {
    background: '#002b36',
    foreground: '#839496',
    primary: '#268bd2',
    primaryForeground: '#ffffff',
    secondary: '#586e75',
    accent: '#2aa198',
    border: '#073642',
    card: '#073642',
    input: '#073642',
    hover: '#094959',
    success: '#859900',
    error: '#dc322f',
    warning: '#b58900',
  },
  gruvbox: {
    background: '#282828',
    foreground: '#ebdbb2',
    primary: '#fabd2f',
    primaryForeground: '#282828',
    secondary: '#a89984',
    accent: '#fe8019',
    border: '#3c3836',
    card: '#3c3836',
    input: '#504945',
    hover: '#665c54',
    success: '#b8bb26',
    error: '#fb4934',
    warning: '#fabd2f',
  },
  onedark: {
    background: '#282c34',
    foreground: '#abb2bf',
    primary: '#61afef',
    primaryForeground: '#282c34',
    secondary: '#5c6370',
    accent: '#c678dd',
    border: '#3e4451',
    card: '#21252b',
    input: '#3e4451',
    hover: '#4b5263',
    success: '#98c379',
    error: '#e06c75',
    warning: '#e5c07b',
  },
  tokyonight: {
    background: '#1a1b26',
    foreground: '#c0caf5',
    primary: '#7aa2f7',
    primaryForeground: '#1a1b26',
    secondary: '#565f89',
    accent: '#bb9af7',
    border: '#292e42',
    card: '#16161e',
    input: '#292e42',
    hover: '#3b4261',
    success: '#9ece6a',
    error: '#f7768e',
    warning: '#e0af68',
  },
  catppuccin: {
    background: '#1e1e2e',
    foreground: '#cdd6f4',
    primary: '#89b4fa',
    primaryForeground: '#1e1e2e',
    secondary: '#6c7086',
    accent: '#cba6f7',
    border: '#313244',
    card: '#181825',
    input: '#313244',
    hover: '#45475a',
    success: '#a6e3a1',
    error: '#f38ba8',
    warning: '#f9e2af',
  },
  rosepine: {
    background: '#191724',
    foreground: '#e0def4',
    primary: '#c4a7e7',
    primaryForeground: '#191724',
    secondary: '#6e6a86',
    accent: '#ebbcba',
    border: '#26233a',
    card: '#1f1d2e',
    input: '#26233a',
    hover: '#403d52',
    success: '#9ccfd8',
    error: '#eb6f92',
    warning: '#f6c177',
  },
  // === AESTHETIC THEMES ===
  synthwave: {
    background: '#1a1a2e',
    foreground: '#eaeaea',
    primary: '#ff00ff',
    primaryForeground: '#ffffff',
    secondary: '#a855f7',
    accent: '#00ffff',
    border: '#4a0080',
    card: '#16213e',
    input: '#0f3460',
    hover: '#6b21a8',
    success: '#00ff88',
    error: '#ff0080',
    warning: '#ffff00',
  },
  cyberpunk: {
    background: '#0a0a0a',
    foreground: '#00ff88',
    primary: '#ff0080',
    primaryForeground: '#ffffff',
    secondary: '#00ffff',
    accent: '#ffff00',
    border: '#ff0080',
    card: '#111111',
    input: '#1a1a1a',
    hover: '#2a2a2a',
    success: '#00ff88',
    error: '#ff0000',
    warning: '#ffff00',
  },
  neon: {
    background: '#0d0d0d',
    foreground: '#ffffff',
    primary: '#00ff88',
    primaryForeground: '#000000',
    secondary: '#888888',
    accent: '#ff00ff',
    border: '#333333',
    card: '#161616',
    input: '#1f1f1f',
    hover: '#2a2a2a',
    success: '#00ff88',
    error: '#ff0044',
    warning: '#ffff00',
  },
  lavender: {
    background: '#1e1b2e',
    foreground: '#e8e4f3',
    primary: '#a78bfa',
    primaryForeground: '#ffffff',
    secondary: '#8b7fc7',
    accent: '#f0abfc',
    border: '#3b3455',
    card: '#2a2640',
    input: '#3b3455',
    hover: '#4c4670',
    success: '#86efac',
    error: '#fca5a5',
    warning: '#fcd34d',
  },
  mint: {
    background: '#0d1b14',
    foreground: '#d1fae5',
    primary: '#34d399',
    primaryForeground: '#ffffff',
    secondary: '#6ee7b7',
    accent: '#2dd4bf',
    border: '#064e3b',
    card: '#132a1f',
    input: '#1b3a2d',
    hover: '#047857',
    success: '#4ade80',
    error: '#f87171',
    warning: '#fbbf24',
  },
  coral: {
    background: '#1c1412',
    foreground: '#fff1f0',
    primary: '#fb7185',
    primaryForeground: '#ffffff',
    secondary: '#fda4af',
    accent: '#f43f5e',
    border: '#44312d',
    card: '#2a1f1c',
    input: '#3d2f2b',
    hover: '#5c4843',
    success: '#86efac',
    error: '#ef4444',
    warning: '#fbbf24',
  },
  ember: {
    background: '#1a0f0c',
    foreground: '#fef2f2',
    primary: '#ef4444',
    primaryForeground: '#ffffff',
    secondary: '#f87171',
    accent: '#f97316',
    border: '#450a0a',
    card: '#2a1410',
    input: '#3d1e17',
    hover: '#7f1d1d',
    success: '#84cc16',
    error: '#dc2626',
    warning: '#fbbf24',
  },
  sapphire: {
    background: '#0a1628',
    foreground: '#e0f2fe',
    primary: '#2563eb',
    primaryForeground: '#ffffff',
    secondary: '#60a5fa',
    accent: '#3b82f6',
    border: '#1e3a5f',
    card: '#0f2042',
    input: '#1e3a5f',
    hover: '#1d4ed8',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#fbbf24',
  },
  amethyst: {
    background: '#1a0f25',
    foreground: '#f3e8ff',
    primary: '#a855f7',
    primaryForeground: '#ffffff',
    secondary: '#c084fc',
    accent: '#9333ea',
    border: '#3b1a5c',
    card: '#2a1640',
    input: '#3b1a5c',
    hover: '#6b21a8',
    success: '#4ade80',
    error: '#f43f5e',
    warning: '#fbbf24',
  },
  jade: {
    background: '#0a1a14',
    foreground: '#ecfdf5',
    primary: '#10b981',
    primaryForeground: '#ffffff',
    secondary: '#34d399',
    accent: '#059669',
    border: '#064e3b',
    card: '#132a21',
    input: '#1b3d2e',
    hover: '#047857',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  obsidian: {
    background: '#0c0c0c',
    foreground: '#e4e4e7',
    primary: '#a1a1aa',
    primaryForeground: '#0c0c0c',
    secondary: '#71717a',
    accent: '#52525b',
    border: '#27272a',
    card: '#141414',
    input: '#1c1c1c',
    hover: '#27272a',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  cream: {
    background: '#fefce8',
    foreground: '#422006',
    primary: '#ca8a04',
    primaryForeground: '#ffffff',
    secondary: '#a16207',
    accent: '#eab308',
    border: '#fde68a',
    card: '#fffbeb',
    input: '#fef9c3',
    hover: '#fef08a',
    success: '#16a34a',
    error: '#dc2626',
    warning: '#d97706',
  },
  slate: {
    background: '#0f172a',
    foreground: '#f1f5f9',
    primary: '#64748b',
    primaryForeground: '#ffffff',
    secondary: '#94a3b8',
    accent: '#475569',
    border: '#334155',
    card: '#1e293b',
    input: '#334155',
    hover: '#475569',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  copper: {
    background: '#1c1410',
    foreground: '#fef7ed',
    primary: '#ea580c',
    primaryForeground: '#ffffff',
    secondary: '#fb923c',
    accent: '#c2410c',
    border: '#431407',
    card: '#292018',
    input: '#3d2f20',
    hover: '#7c2d12',
    success: '#84cc16',
    error: '#dc2626',
    warning: '#f59e0b',
  },
};


interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  themeColors: ThemeColors;
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nxtai-settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Validate theme - if it doesn't exist, reset to 'dark'
          if (parsed.theme && !themePresets[parsed.theme as ThemePreset]) {
            console.log(`Invalid theme "${parsed.theme}" found, resetting to dark`);
            parsed.theme = 'dark';
          }
          return { ...defaultSettings, ...parsed };
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
        // Clear corrupted settings
        localStorage.removeItem('nxtai-settings');
      }
    }
    return defaultSettings;
  });

  // Also run on client mount to catch any SSR hydration issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Validate theme on client side in case SSR loaded an invalid theme
      if (settings.theme && !themePresets[settings.theme as ThemePreset]) {
        console.log(`Invalid theme "${settings.theme}" detected on mount, resetting to dark`);
        setSettings(prev => ({ ...prev, theme: 'dark' }));
        localStorage.setItem('nxtai-settings', JSON.stringify({ ...settings, theme: 'dark' }));
      }
    }
  }, []);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('nxtai-settings', JSON.stringify(newSettings));
      }
      return newSettings;
    });
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nxtai-settings', JSON.stringify(defaultSettings));
    }
  };

  const themeColors = useMemo(() => {
    // Use dark theme as fallback if current theme is invalid
    const validTheme = themePresets[settings.theme] ? settings.theme : 'dark';
    return {
      ...(themePresets[validTheme] || themePresets.dark),
      ...settings.customColors,
    };
  }, [settings.theme, settings.customColors]);

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
      // Set the underlying CSS variable that the theme maps to
      root.style.setProperty(`--val-${key}`, value);
      if (key === 'primary') {
        // Also set primary-foreground if not present (simple logic for now)
        root.style.setProperty('--val-primary-foreground', '#ffffff');
      }
    });

    // Handle missing primaryForeground for custom themes that might not have it yet
    if (!themeColors.primaryForeground) {
      root.style.setProperty('--val-primary-foreground', '#ffffff');
    }

    // Apply custom accent color override
    if (settings.accentColor) {
      root.style.setProperty('--val-primary', settings.accentColor);
      root.style.setProperty('--val-accent', settings.accentColor);
    }

    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.setProperty('--font-size-base', fontSizes[settings.fontSize]);

    // Apply animations
    root.style.setProperty('--animation-duration', settings.animations ? '0.2s' : '0s');

    // Apply font family
    const fontFamilies: Record<string, string> = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      inter: '"Inter", sans-serif',
      roboto: '"Roboto", sans-serif',
      jetbrains: '"JetBrains Mono", monospace',
      fira: '"Fira Sans", sans-serif',
    };
    root.style.setProperty('--font-body', fontFamilies[settings.fontFamily] || fontFamilies.system);

    // Apply code font
    const codeFonts: Record<string, string> = {
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      jetbrains: '"JetBrains Mono", monospace',
      'fira-code': '"Fira Code", monospace',
      cascadia: '"Cascadia Code", monospace',
    };
    root.style.setProperty('--font-code', codeFonts[settings.codeFont] || codeFonts.mono);

    // Apply line height
    const lineHeights: Record<string, string> = {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    };
    root.style.setProperty('--line-height-base', lineHeights[settings.lineHeight] || lineHeights.normal);

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Apply high contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }

    // Apply focus indicators
    if (settings.focusIndicators) {
      root.classList.remove('no-focus-indicators');
    } else {
      root.classList.add('no-focus-indicators');
    }
  }, [themeColors, settings.fontSize, settings.animations, settings.accentColor, settings.fontFamily, settings.codeFont, settings.lineHeight, settings.reducedMotion, settings.highContrast, settings.focusIndicators]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, themeColors, resetToDefaults }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export { themePresets };
