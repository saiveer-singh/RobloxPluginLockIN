"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemePreset = 'dark' | 'light' | 'cyberpunk' | 'minimal' | 'ocean' | 'forest' | 'sunset' | 'midnight';

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
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

export interface Settings {
  // Theme
  theme: ThemePreset;
  customColors?: Partial<ThemeColors>;

  // UI
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  compactMode: boolean;
  showTimestamps: boolean;
  autoScroll: boolean;

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
}

const defaultSettings: Settings = {
  theme: 'sunset',
  fontSize: 'medium',
  animations: true,
  compactMode: false,
  showTimestamps: false,
  autoScroll: true,
  autoSave: true,
  maxThreads: 50,
  cacheEnabled: true,
  typingSpeed: 'normal',
  reasoningEnabled: true,
  streamingEnabled: true,
  enterToSend: true,
  autoFocus: true,
  soundEnabled: false,
};

const themePresets: Record<ThemePreset, ThemeColors> = {
  dark: {
    background: '#0a0a0a',
    foreground: '#ffffff',
    primary: '#8b5cf6',
    secondary: '#374151',
    accent: '#f59e0b',
    border: '#374151',
    card: '#1f2937',
    input: '#111827',
    hover: '#374151',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  light: {
    background: '#ffffff',
    foreground: '#1f2937',
    primary: '#6366f1',
    secondary: '#6b7280',
    accent: '#f59e0b',
    border: '#e5e7eb',
    card: '#ffffff',
    input: '#f9fafb',
    hover: '#f3f4f6',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  cyberpunk: {
    background: '#0a0a0a',
    foreground: '#00ff88',
    primary: '#ff0080',
    secondary: '#1a1a2e',
    accent: '#00ff88',
    border: '#ff0080',
    card: '#16213e',
    input: '#0f0f23',
    hover: '#1a1a2e',
    success: '#00ff88',
    error: '#ff4444',
    warning: '#ffaa00',
  },
  minimal: {
    background: '#ffffff',
    foreground: '#2d3748',
    primary: '#4a5568',
    secondary: '#718096',
    accent: '#718096',
    border: '#e2e8f0',
    card: '#ffffff',
    input: '#f7fafc',
    hover: '#edf2f7',
    success: '#48bb78',
    error: '#f56565',
    warning: '#ed8936',
  },
  ocean: {
    background: '#0f1419',
    foreground: '#e1e8ed',
    primary: '#1da1f2',
    secondary: '#192734',
    accent: '#17bf63',
    border: '#38444d',
    card: '#192734',
    input: '#253341',
    hover: '#2c3e50',
    success: '#17bf63',
    error: '#e0245e',
    warning: '#ffad1f',
  },
  forest: {
    background: '#0a1f0f',
    foreground: '#e8f5e8',
    primary: '#4caf50',
    secondary: '#1b5e20',
    accent: '#8bc34a',
    border: '#2e7d32',
    card: '#1b5e20',
    input: '#0d2818',
    hover: '#2e7d32',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
  },
  sunset: {
    background: '#1a0b2e',
    foreground: '#ffffff',
    primary: '#ff6b6b',
    secondary: '#9ca3af',
    accent: '#ffd93d',
    border: '#4a0e4e',
    card: '#0f0a1a',
    input: '#0f0a1a',
    hover: '#4a0e4e',
    success: '#6bcf7f',
    error: '#ff6b6b',
    warning: '#ffd93d',
  },
  midnight: {
    background: '#000000',
    foreground: '#ffffff',
    primary: '#6366f1',
    secondary: '#1a1a1a',
    accent: '#f59e0b',
    border: '#333333',
    card: '#111111',
    input: '#000000',
    hover: '#1a1a1a',
    success: '#10b981',
    error: '#ef4444',
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
        const saved = localStorage.getItem('robloxgen-settings');
        if (saved) {
          return { ...defaultSettings, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
        // Clear corrupted settings
        localStorage.removeItem('robloxgen-settings');
      }
    }
    return defaultSettings;
  });

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem('robloxgen-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    localStorage.setItem('robloxgen-settings', JSON.stringify(defaultSettings));
  };

  const themeColors = {
    ...themePresets[settings.theme],
    ...settings.customColors,
  };

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.setProperty('--font-size-base', fontSizes[settings.fontSize]);

    // Apply animations
    root.style.setProperty('--animation-duration', settings.animations ? '0.2s' : '0s');
  }, [themeColors, settings.fontSize, settings.animations]);

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