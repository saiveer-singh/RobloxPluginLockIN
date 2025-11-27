"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useSettings } from '@/lib/settings';
import type { ModelProvider } from '@/lib/ai';
import type { ModelInfo } from '@/lib/models';
import { LogIn, LogOut, Search, Menu, Plus, MessageSquare, Settings, User, Copy, RefreshCw, Send, Loader2, Brain, Code2, SparklesIcon, Film, Boxes, Lightbulb, ShoppingCart, ZapIcon, Dog, MessageCircle, Mountain, CircleDot, Swords, Sun, Check, ChevronDown, Code, X } from 'lucide-react';
import { PreviewModal } from '@/components/PreviewModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ModelIcon } from '@/components/ModelIcon';
import { ModernBackground } from '@/components/ModernBackground';

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    robloxId?: string;
  }
  interface Session {
    user: {
      robloxId: string;
    } & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Typing effect component
function TypingText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayedText('');
    setIsComplete(false);
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
}

// Message and thread types
interface Message {
  role: 'user' | 'ai' | 'error';
  content: string;
  timestamp?: number;
  reasoning?: string;
  data?: any;
  model?: string;
  requestType?: string;
  tokensUsed?: number;
  tokensPerSecond?: number;
  duration?: number;
}

interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export default function Home() {
    const { data: session } = useSession();
    const { settings } = useSettings();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [pluginToken, setPluginToken] = useState<string>("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [showSystemPrompt, setShowSystemPrompt] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [threads, setThreads] = useState<any[]>([]);
    const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<ModelProvider>('openai/gpt-4o' as ModelProvider);
    const [streamingReasoning, setStreamingReasoning] = useState<string | null>(null);
    const [streamingRequestType, setStreamingRequestType] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentModel, setCurrentModel] = useState<ModelInfo | null>(null);
    const [username, setUsername] = useState("");
    const [connected, setConnected] = useState(false);

    // Extract userId from session (can be undefined initially)
    const userId = session?.user?.robloxId || undefined;

    // Models list
    const models = [
      { id: 'x-ai-grok-4.1-fast-free' as ModelProvider, name: 'Grok 4.1 Fast Free', category: 'Grok' },
      { id: 'z-ai-glm-4.5-air-free' as ModelProvider, name: 'GLM 4.5 Air Free', category: 'GLM' },
      { id: 'moonshotai-kimi-k2-free' as ModelProvider, name: 'Kimi K2 Free', category: 'Moonshot' },
      { id: 'qwen-qwen3-coder-free' as ModelProvider, name: 'Qwen 3 Coder Free', category: 'Qwen' }
    ];

    // Load system prompt from localStorage on mount
    useEffect(() => {
      const savedPrompt = localStorage.getItem('robloxgen-system-prompt');
      if (savedPrompt) {
        setSystemPrompt(savedPrompt);
      }
    }, []);

    // Save system prompt to localStorage whenever it changes
    useEffect(() => {
      localStorage.setItem('robloxgen-system-prompt', systemPrompt);
    }, [systemPrompt]);

    // Set default model
    useEffect(() => {
      setSelectedModel('x-ai-grok-4.1-fast-free' as ModelProvider);
    }, []);

    // Set currentModel when selectedModel changes
    useEffect(() => {
      const model = models.find(m => m.id === selectedModel);
      setCurrentModel(model || null);
    }, [selectedModel, models]);

    // Generate plugin token
    useEffect(() => {
      const storedToken = localStorage.getItem(`plugin-token-${userId}`);
      if (storedToken) {
        setPluginToken(storedToken);
      } else {
        // Generate new token via API
        fetch('/api/generate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            setPluginToken(data.token);
            localStorage.setItem(`plugin-token-${userId}`, data.token);
          }
        })
        .catch(console.error);
      }
    }, [userId]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    if (showModelDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
   }, [showModelDropdown]);

     // Ensure selectedModel is valid, fallback to first available model or default
    useEffect(() => {
      if (!selectedModel || !models.find(m => m.id === selectedModel)) {
        const defaultModelId = models.find(m => m.id === 'x-ai-grok-4.1-fast-free')?.id || models[0]?.id;
        if (defaultModelId) {
          setSelectedModel(defaultModelId as ModelProvider);
        }
      }
    }, [models, selectedModel]);
  
  // Legacy models list (kept for reference, but now using getEnabledModels)
  const _legacyModels = [
    // OpenAI - Latest
    { id: 'openai-gpt-5' as ModelProvider, name: 'GPT-5', category: 'OpenAI' },
    { id: 'openai-gpt-5-reasoning' as ModelProvider, name: 'GPT-5 (Reasoning)', category: 'OpenAI' },
    { id: 'openai-gpt-5-mini' as ModelProvider, name: 'GPT-5 mini', category: 'OpenAI' },
    { id: 'openai-gpt-5-nano' as ModelProvider, name: 'GPT-5 nano', category: 'OpenAI' },
    { id: 'openai-gpt-5.1-instant' as ModelProvider, name: 'GPT-5.1 (Instant)', category: 'OpenAI' },
    { id: 'openai-gpt-5.1-reasoning' as ModelProvider, name: 'GPT-5.1 (Reasoning)', category: 'OpenAI' },
    { id: 'openai-gpt-4.1' as ModelProvider, name: 'GPT-4.1', category: 'OpenAI' },
    { id: 'openai-gpt-4.1-mini' as ModelProvider, name: 'GPT-4.1 Mini', category: 'OpenAI' },
    { id: 'openai-gpt-4.1-nano' as ModelProvider, name: 'GPT-4.1 Nano', category: 'OpenAI' },
    { id: 'openai-o3' as ModelProvider, name: 'O3', category: 'OpenAI' },
    { id: 'openai-o3-pro' as ModelProvider, name: 'O3 Pro', category: 'OpenAI' },
    { id: 'openai-o3-mini' as ModelProvider, name: 'O3 Mini', category: 'OpenAI' },
    { id: 'openai-o4-mini' as ModelProvider, name: 'O4 Mini', category: 'OpenAI' },
    { id: 'openai-gpt-4o' as ModelProvider, name: 'GPT-4o', category: 'OpenAI' },
    { id: 'openai-gpt-4o-mini' as ModelProvider, name: 'GPT-4o Mini', category: 'OpenAI' },
    { id: 'openai-o1-preview' as ModelProvider, name: 'O1 Preview', category: 'OpenAI' },
    { id: 'openai-o1-mini' as ModelProvider, name: 'O1 Mini', category: 'OpenAI' },
    { id: 'openai-gpt-4-turbo' as ModelProvider, name: 'GPT-4 Turbo', category: 'OpenAI' },
    { id: 'openai-gpt-3.5-turbo' as ModelProvider, name: 'GPT-3.5 Turbo', category: 'OpenAI' },
    // Anthropic Claude - Latest
    { id: 'openrouter-claude-opus-4.5' as ModelProvider, name: 'Claude Opus 4.5', category: 'Anthropic' },
    { id: 'openrouter-claude-3.7-sonnet' as ModelProvider, name: 'Claude 3.7 Sonnet', category: 'Anthropic' },
    { id: 'openrouter-claude-3.7-sonnet-reasoning' as ModelProvider, name: 'Claude 3.7 Sonnet (Reasoning)', category: 'Anthropic' },
    { id: 'openrouter-claude-4-sonnet' as ModelProvider, name: 'Claude 4 Sonnet', category: 'Anthropic' },
    { id: 'openrouter-claude-4-sonnet-reasoning' as ModelProvider, name: 'Claude 4 Sonnet (Reasoning)', category: 'Anthropic' },
    { id: 'openrouter-claude-sonnet-4.5' as ModelProvider, name: 'Claude Sonnet 4.5', category: 'Anthropic' },
    { id: 'openrouter-claude-sonnet-4.5-reasoning' as ModelProvider, name: 'Claude Sonnet 4.5 (Reasoning)', category: 'Anthropic' },
    { id: 'openrouter-claude-4.1-opus' as ModelProvider, name: 'Claude 4.1 Opus', category: 'Anthropic' },
    { id: 'openrouter-claude-haiku-4.5' as ModelProvider, name: 'Claude Haiku 4.5', category: 'Anthropic' },
    { id: 'openrouter-claude-haiku-4.5-reasoning' as ModelProvider, name: 'Claude Haiku 4.5 (Reasoning)', category: 'Anthropic' },
    { id: 'openrouter-claude-3.5-sonnet' as ModelProvider, name: 'Claude 3.5 Sonnet', category: 'Anthropic' },
    { id: 'openrouter-claude-3-opus' as ModelProvider, name: 'Claude 3 Opus', category: 'Anthropic' },
    { id: 'openrouter-claude-3-haiku' as ModelProvider, name: 'Claude 3 Haiku', category: 'Anthropic' },
    // Google Gemini - Latest
    { id: 'gemini-3-pro' as ModelProvider, name: 'Gemini 3 Pro', category: 'Google' },
    { id: 'gemini-2.5-pro' as ModelProvider, name: 'Gemini 2.5 Pro', category: 'Google' },
    { id: 'gemini-2.5-flash' as ModelProvider, name: 'Gemini 2.5 Flash', category: 'Google' },
    { id: 'gemini-2.5-flash-thinking' as ModelProvider, name: 'Gemini 2.5 Flash (Thinking)', category: 'Google' },
    { id: 'gemini-2.5-flash-lite' as ModelProvider, name: 'Gemini 2.5 Flash Lite', category: 'Google' },
    { id: 'gemini-2.5-flash-lite-thinking' as ModelProvider, name: 'Gemini 2.5 Flash Lite (Thinking)', category: 'Google' },
    { id: 'gemini-2.0-flash' as ModelProvider, name: 'Gemini 2.0 Flash', category: 'Google' },
    { id: 'gemini-2.0-flash-lite' as ModelProvider, name: 'Gemini 2.0 Flash Lite', category: 'Google' },
    { id: 'gemini-1.5-pro' as ModelProvider, name: 'Gemini 1.5 Pro', category: 'Google' },
    { id: 'gemini-pro' as ModelProvider, name: 'Gemini Pro', category: 'Google' },
    { id: 'gemini-flash' as ModelProvider, name: 'Gemini Flash', category: 'Google' },
    // Meta Llama - Latest
    { id: 'openrouter-llama-4-maverick' as ModelProvider, name: 'Llama 4 Maverick', category: 'Meta' },
    { id: 'openrouter-llama-4-scout' as ModelProvider, name: 'Llama 4 Scout', category: 'Meta' },
    { id: 'openrouter-llama-3.3-70b' as ModelProvider, name: 'Llama 3.3 70B', category: 'Meta' },
    { id: 'openrouter-llama-3.2-90b' as ModelProvider, name: 'Llama 3.2 90B', category: 'Meta' },
    { id: 'openrouter-llama-3.1-70b' as ModelProvider, name: 'Llama 3.1 70B', category: 'Meta' },
    { id: 'openrouter-llama-3-70b' as ModelProvider, name: 'Llama 3 70B', category: 'Meta' },
    // Mistral - Latest
    { id: 'openrouter-mistral-large-2' as ModelProvider, name: 'Mistral Large 2', category: 'Mistral' },
    { id: 'openrouter-mistral-large' as ModelProvider, name: 'Mistral Large', category: 'Mistral' },
    { id: 'openrouter-mixtral-8x7b' as ModelProvider, name: 'Mixtral 8x7B', category: 'Mistral' },
    // DeepSeek - Latest
    { id: 'openrouter-deepseek-v3.2-exp' as ModelProvider, name: 'DeepSeek v3.2 Exp', category: 'DeepSeek' },
    { id: 'openrouter-deepseek-v3.2-exp-thinking' as ModelProvider, name: 'DeepSeek v3.2 Exp (Thinking)', category: 'DeepSeek' },
    { id: 'openrouter-deepseek-v3.1-terminus' as ModelProvider, name: 'DeepSeek v3.1 Terminus', category: 'DeepSeek' },
    { id: 'openrouter-deepseek-v3.1-terminus-thinking' as ModelProvider, name: 'DeepSeek v3.1 Terminus (Thinking)', category: 'DeepSeek' },
    { id: 'openrouter-deepseek-v3.1' as ModelProvider, name: 'DeepSeek v3.1', category: 'DeepSeek' },
    { id: 'openrouter-deepseek-v3.1-thinking' as ModelProvider, name: 'DeepSeek v3.1 (Thinking)', category: 'DeepSeek' },
    { id: 'openrouter-deepseek-v3-0324' as ModelProvider, name: 'DeepSeek v3 (0324)', category: 'DeepSeek' },
    { id: 'openrouter-deepseek-r1-0528' as ModelProvider, name: 'DeepSeek R1 (0528)', category: 'DeepSeek' },
    { id: 'openrouter-deepseek-r1-qwen-distilled' as ModelProvider, name: 'DeepSeek R1 (Qwen Distilled)', category: 'DeepSeek' },
    { id: 'openrouter-deepseek-r1-original' as ModelProvider, name: 'DeepSeek R1 (Original)', category: 'DeepSeek' },
    { id: 'openrouter-deepseek-v3' as ModelProvider, name: 'DeepSeek V3', category: 'DeepSeek' },
    { id: 'openrouter-deepseek-chat' as ModelProvider, name: 'DeepSeek Chat', category: 'DeepSeek' },
    { id: 'openrouter-deepseek-coder' as ModelProvider, name: 'DeepSeek Coder', category: 'DeepSeek' },
    { id: 'openrouter-deepseek-r1' as ModelProvider, name: 'DeepSeek R1', category: 'DeepSeek' },
    // Qwen - Latest
    { id: 'openrouter-qwen-3-235b' as ModelProvider, name: 'Qwen 3 235B', category: 'Qwen' },
    { id: 'openrouter-qwen-3-235b-thinking' as ModelProvider, name: 'Qwen 3 235B (Thinking)', category: 'Qwen' },
    { id: 'openrouter-qwen-3-coder' as ModelProvider, name: 'Qwen 3 Coder', category: 'Qwen' },
    { id: 'openrouter-qwen-3-32b' as ModelProvider, name: 'Qwen 3 32B', category: 'Qwen' },
    { id: 'openrouter-qwen-2.5-32b' as ModelProvider, name: 'Qwen 2.5 32B', category: 'Qwen' },
    // GLM - Latest
    { id: 'openrouter-glm-4.6' as ModelProvider, name: 'GLM 4.6', category: 'GLM' },
    { id: 'openrouter-glm-4.6-thinking' as ModelProvider, name: 'GLM 4.6 (Thinking)', category: 'GLM' },
    { id: 'openrouter-glm-4.5' as ModelProvider, name: 'GLM 4.5', category: 'GLM' },
    { id: 'openrouter-glm-4.5-thinking' as ModelProvider, name: 'GLM 4.5 (Thinking)', category: 'GLM' },
    { id: 'openrouter-glm-4.5v' as ModelProvider, name: 'GLM 4.5V', category: 'GLM' },
    { id: 'openrouter-glm-4.5v-thinking' as ModelProvider, name: 'GLM 4.5V (Thinking)', category: 'GLM' },
    { id: 'openrouter-glm-4.5-air' as ModelProvider, name: 'GLM 4.5 Air', category: 'GLM' },
    { id: 'openrouter-glm-4.5-air-thinking' as ModelProvider, name: 'GLM 4.5 Air (Thinking)', category: 'GLM' },
    // Grok - Latest
    { id: 'openrouter-grok-4.1-fast' as ModelProvider, name: 'Grok 4.1 Fast', category: 'Grok' },
    { id: 'openrouter-grok-4.1-fast-reasoning' as ModelProvider, name: 'Grok 4.1 Fast (Reasoning)', category: 'Grok' },
    { id: 'openrouter-grok-4-fast' as ModelProvider, name: 'Grok 4 Fast', category: 'Grok' },
    { id: 'openrouter-grok-4-fast-reasoning' as ModelProvider, name: 'Grok 4 Fast (Reasoning)', category: 'Grok' },
    { id: 'openrouter-grok-4' as ModelProvider, name: 'Grok 4', category: 'Grok' },
    { id: 'openrouter-grok-3' as ModelProvider, name: 'Grok 3', category: 'Grok' },
    { id: 'openrouter-grok-3-mini' as ModelProvider, name: 'Grok 3 Mini', category: 'Grok' },
    // Moonshot - Latest
    { id: 'openrouter-kimi-k2-0905' as ModelProvider, name: 'Kimi K2 (0905)', category: 'Moonshot' },
    { id: 'openrouter-kimi-k2-0711' as ModelProvider, name: 'Kimi K2 (0711)', category: 'Moonshot' },
    { id: 'openrouter-kimi-k2-thinking' as ModelProvider, name: 'Kimi K2 (Thinking)', category: 'Moonshot' },
    // MiniMax
    { id: 'openrouter-minimax-m2' as ModelProvider, name: 'MiniMax M2', category: 'MiniMax' },
    // Other
    { id: 'openrouter-bert-nebulon-alpha' as ModelProvider, name: 'Bert Nebulon Alpha', category: 'Other' },
  ];

  useEffect(() => {
    if (!pluginToken) return;
    // Poll for status
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status?token=${encodeURIComponent(pluginToken)}`);
        const data = await res.json();
        setConnected(data.connected);
      } catch (e) {
        setConnected(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [pluginToken]);

   // Load threads from localStorage on mount
   useEffect(() => {
     if (settings.cacheEnabled) {
       const savedThreads = localStorage.getItem('robloxgen-threads');
       if (savedThreads) {
         try {
           const parsed: Thread[] = JSON.parse(savedThreads);
           // Filter out old threads if we exceed maxThreads
           const filteredThreads = parsed
             .sort((a, b) => b.updatedAt - a.updatedAt)
             .slice(0, settings.maxThreads);
           setThreads(filteredThreads);
         } catch (e) {
           console.error('Failed to load threads:', e);
           setThreads([]);
         }
       }
     }
   }, [settings.cacheEnabled, settings.maxThreads]);

   // Save threads to localStorage whenever they change (with auto-save check)
   useEffect(() => {
     if (settings.autoSave && settings.cacheEnabled) {
       localStorage.setItem('robloxgen-threads', JSON.stringify(threads));
     }
   }, [threads, settings.autoSave, settings.cacheEnabled]);

   // Load current thread messages when thread changes
   useEffect(() => {
     if (currentThreadId) {
       const thread = threads.find((t: Thread) => t.id === currentThreadId);
       if (thread) {
         setMessages(thread.messages);
       }
     } else {
       setMessages([]);
     }
   }, [currentThreadId, threads]);

   // Save messages to current thread with proper typing
   useEffect(() => {
     if (currentThreadId && messages.length > 0) {
       setThreads((prev: Thread[]) => prev.map((t: Thread) =>
         t.id === currentThreadId
           ? { ...t, messages, updatedAt: Date.now() }
           : t
       ));
     }
   }, [messages, currentThreadId]);

   // Auto-scroll to bottom when new messages arrive (if enabled)
   useEffect(() => {
     if (settings.autoScroll && scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
     }
   }, [messages, streamingReasoning, streamingRequestType, settings.autoScroll]);

   const createNewThread = useCallback(() => {
     const newThreadId = Date.now().toString();
     const newThread: Thread = {
       id: newThreadId,
       title: 'New Chat',
       messages: [],
       createdAt: Date.now(),
       updatedAt: Date.now()
     };
     setThreads((prev: Thread[]) => [newThread, ...prev]);
     setCurrentThreadId(newThreadId);
     setMessages([]);
     setInput("");
   }, []);

   const sendMessage = useCallback(async () => {
     if (!input.trim() || loading) return;

     // Create new thread if none exists
     if (!currentThreadId) {
       createNewThread();
       await new Promise(resolve => setTimeout(resolve, 100));
     }

     const userMsg: Message = {
       role: 'user',
       content: input.trim(),
       timestamp: Date.now()
     };
     const threadId = currentThreadId || threads[0]?.id;

     setMessages((prev: Message[]) => [...prev, userMsg]);

     // Update thread title from first message if it's still "New Chat"
     if (threadId) {
       const thread = threads.find((t: Thread) => t.id === threadId);
       if (thread && thread.title === 'New Chat') {
         const title = input.length > 30 ? input.substring(0, 30) + '...' : input;
         setThreads((prev: Thread[]) => prev.map((t: Thread) =>
           t.id === threadId ? { ...t, title } : t
         ));
       }
     }

     setInput("");
     setLoading(true);
     setStreamingReasoning(null);

      try {
         const res = await fetch('/api/generate', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             prompt: userMsg.content,
             model: selectedModel,
             systemPrompt: systemPrompt || undefined,
             userId
           })
         });

       if (!res.ok) {
         throw new Error(`HTTP ${res.status}: ${res.statusText}`);
       }

       const data = await res.json();

       if (data.error) throw new Error(data.error);

       // Start streaming the reasoning if enabled
       if (settings.reasoningEnabled && data.reasoning) {
         setStreamingRequestType(data.requestType);
         setStreamingReasoning(data.reasoning);
         // Wait for typing to complete before showing full message
         const typingSpeed = settings.typingSpeed === 'fast' ? 10 : settings.typingSpeed === 'slow' ? 30 : 20;
         await new Promise(resolve => setTimeout(resolve, data.reasoning.length * typingSpeed + 500));
       }

       const aiMsg: Message = {
         role: 'ai',
         content: data.message,
         timestamp: Date.now(),
         reasoning: data.reasoning,
         data: data,
         model: data.model,
         requestType: data.requestType,
         tokensUsed: data.tokensUsed,
         tokensPerSecond: data.tokensPerSecond,
         duration: data.duration
       };
       setMessages((prev: Message[]) => [...prev, aiMsg]);
       setStreamingReasoning(null);
       setStreamingRequestType(null);
     } catch (e: any) {
       console.error('Send message error:', e);
       const errorMsg: Message = {
         role: 'error',
         content: e.message || 'An unexpected error occurred',
         timestamp: Date.now()
       };
       setMessages((prev: Message[]) => [...prev, errorMsg]);
       setStreamingReasoning(null);
       setStreamingRequestType(null);
     } finally {
       setLoading(false);
     }
    }, [input, loading, currentThreadId, threads, selectedModel, systemPrompt, settings, createNewThread]);

  const copyToken = async () => {
    if (pluginToken) {
      navigator.clipboard.writeText(pluginToken);
    }
  };

  const regenerateToken = async () => {
    try {
      const res = await fetch('/api/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.token) {
        setPluginToken(data.token);
        localStorage.setItem(`plugin-token-${userId}`, data.token);
      }
    } catch (e) {
      console.error('Failed to regenerate token:', e);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem(`plugin-token-${userId}`);
    if (storedToken) {
      setPluginToken(storedToken);
    } else {
      regenerateToken();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    const handleCustomSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      if (username.trim()) {
        const result = await signIn('credentials', {
          username: username.trim(),
          redirect: false,
        });
        if (result?.ok) {
          // Force a page reload to update session
          window.location.reload();
        }
      }
    };

    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground relative overflow-hidden">
        {settings.animations && <ModernBackground />}
        <div className="text-center space-y-8 max-w-md mx-auto p-8 relative z-10 bg-card/80 backdrop-blur-md rounded-2xl border border-border shadow-2xl">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-primary">RobloxGen AI</h1>
            <p className="text-secondary text-lg">Generate Roblox assets using AI</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-secondary">Choose how to sign in</p>
              <button
                onClick={() => signIn('google')}
                className="w-full bg-primary hover:opacity-90 text-primary-foreground font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-lg hover:shadow-primary/20"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-secondary">or</span>
              </div>
            </div>

            <form onSubmit={handleCustomSignIn} className="space-y-4">
              <p className="text-secondary">Create a custom account</p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username..."
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!username.trim()}
                  className="w-full bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-lg hover:shadow-primary/20"
                >
                  <LogIn className="w-5 h-5" />
                  Create Account
                </button>
              </div>
              <p className="text-xs text-secondary">No password needed - just pick a username!</p>
            </form>
          </div>
        </div>
      </div>
    );
  }

   return (
    <div className={`flex h-screen ${settings.compactMode ? 'compact-mode' : ''} relative`}>
      {/* Background Component - Rendered behind everything */}
      {settings.animations && messages.length === 0 && <ModernBackground />}

      {/* Sidebar */}
      <div className={`w-64 border-r border-border p-4 hidden md:flex flex-col gap-4 sidebar-spacing bg-background/80 backdrop-blur-sm z-10`}>
        <div className="flex items-center gap-3 font-bold text-xl text-foreground">
          <Menu className="w-5 h-5 cursor-pointer hover:text-secondary transition-colors" />
          <span>RobloxGen AI</span>
        </div>

        {/* New Chat Button */}
        <button 
          onClick={createNewThread}
          className="w-full bg-primary hover:opacity-80 text-foreground font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm"
        >
          New Chat
        </button>

        {/* Search Threads */}
        <div className="relative">
          <Search className="absolute left-3 -translate-y-1/2 w-4 h-4 text-secondary" style={{top: '50%'}} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your threads..."
            className="w-full bg-input border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-foreground placeholder-secondary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
            {/* Threads - filtered by search */}
             {threads.filter(
               (thread: Thread) => !searchQuery || thread.title.toLowerCase().includes(searchQuery.toLowerCase())
             ).map((thread: Thread) => (
             <div
               key={thread.id}
               onClick={() => {
                 setCurrentThreadId(thread.id);
                 setSearchQuery('');
               }}
                className={`text-secondary text-sm p-3 hover:bg-hover rounded-lg cursor-pointer transition-all ${
                   currentThreadId === thread.id ? 'bg-primary text-foreground border border-primary shadow-sm' : 'hover:bg-hover'
                }`}
             >
               <div className="flex items-start justify-between">
                 <div className="flex-1 min-w-0">
                   <div className="truncate font-medium">{thread.title}</div>
                   <div className="flex items-center gap-2 mt-1">
                     {thread.messages.length > 0 && (
                       <span className="text-xs text-secondary">
                         {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}
                       </span>
                     )}
                        <span className="text-xs text-secondary">•</span>
                      <span className="text-xs text-secondary">
                       {new Date(thread.createdAt).toLocaleDateString()}
                     </span>
                   </div>
                 </div>
                 {currentThreadId === thread.id && (
                   <div className="w-2 h-2 bg-primary rounded-full animate-pulse ml-2"></div>
                 )}
               </div>
             </div>
            ))}
            {searchQuery && threads.filter(
              thread => thread.title.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <div className="text-secondary text-sm p-2 text-center">No threads found</div>
            )}
            {!searchQuery && threads.length === 0 && (
              <div className="text-secondary text-sm p-2 text-center">No threads yet</div>
            )}
        </div>
         <div className="border-t border-border pt-4 space-y-3">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-sm">
               U
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-foreground truncate">User</p>
                <p className="text-xs text-secondary">ID: {userId}</p>
              </div>
            </div>

           <div className="space-y-2">
             <p className="text-xs font-medium text-secondary">Plugin Token</p>
             <div className="flex gap-2">
               <input
                 type="text"
                 value={pluginToken}
                 readOnly
                 className="flex-1 px-2 py-1 bg-input border border-border rounded text-xs text-foreground font-mono"
                 placeholder="Generating..."
               />
               <button
                 onClick={copyToken}
                 disabled={!pluginToken}
                 className="p-1 hover:bg-hover rounded transition-colors disabled:opacity-50"
                 title="Copy token"
               >
                 <Copy className="w-4 h-4" />
               </button>
               <button
                 onClick={regenerateToken}
                 className="p-1 hover:bg-hover rounded transition-colors"
                 title="Regenerate token"
               >
                 <RefreshCw className="w-4 h-4" />
               </button>
             </div>
             <p className="text-xs text-secondary">Copy this token to your Roblox plugin settings</p>
           </div>

           <button
             onClick={() => signOut()}
              className="flex items-center gap-2 text-sm text-error hover:text-error transition-colors"
           >
             <LogOut className="w-4 h-4" />
             Sign Out
           </button>
         </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col z-10 relative">
          {/* Top Bar */}
          <div className="flex items-center justify-end gap-3 p-4 border-b border-border bg-background/50 backdrop-blur-sm">
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                  showSystemPrompt ? 'bg-primary text-foreground shadow-sm' : 'text-secondary hover:text-foreground hover:bg-hover'}`}
           >
             <MessageSquare className="w-4 h-4" />
             <span className="text-sm">System Prompt</span>
           </button>
             <button
               onClick={() => setShowSettings(true)}
               className="p-2 text-secondary hover:text-foreground cursor-pointer transition-colors rounded-lg hover:bg-hover"
               title="Settings"
             >
              <Settings className="w-5 h-5" />
            </button>
           <User className="w-5 h-5 text-secondary hover:text-foreground cursor-pointer transition-colors" />
         </div>

         {/* System Prompt Editor */}
         {showSystemPrompt && (
            <div className="p-4 border-b border-border bg-card">
             <div className="max-w-4xl mx-auto">
               <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-secondary">Custom System Prompt</label>
                  <button
                    onClick={() => setSystemPrompt("")}
                    className="text-xs text-secondary hover:text-foreground transition-colors"
                  >
                   Clear
                 </button>
               </div>
               <textarea
                 value={systemPrompt}
                 onChange={(e) => setSystemPrompt(e.target.value)}
                 placeholder="Enter a custom system prompt... (leave empty to use default prompts)"
                  className="w-full h-32 bg-input border border-border rounded-lg p-3 text-sm text-foreground placeholder-secondary focus:outline-none focus:border-primary resize-none"
               />
                <div className="mt-2 text-xs text-secondary">
                 When empty, the system will automatically choose the best prompt based on your request type (scripting, VFX, animation, or modeling).
               </div>
             </div>
           </div>
         )}

        <div className={`flex-1 overflow-y-auto p-4 space-y-4 message-spacing`} ref={scrollRef}>
           {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center gap-8 max-w-3xl mx-auto relative">
                 <div className="text-center space-y-4 animate-fade-in">
                   <h1 className="text-4xl md:text-5xl font-bold text-foreground drop-shadow-sm">
                     What would you like to create?
                   </h1>
                    <p className="text-secondary text-lg max-w-xl mx-auto">
                      Describe your idea and watch AI bring it to life in Roblox
                    </p>
                 </div>
                
                {/* Action Buttons - Roblox Asset Types */}
                <div className="flex gap-3 flex-wrap justify-center animate-fade-in" style={{animationDelay: '0.1s'}}>
                  {[
                    { icon: Code2, label: 'Scripting', prompt: 'Create a script for' },
                    { icon: SparklesIcon, label: 'VFX', prompt: 'Create a VFX effect for' },
                    { icon: Film, label: 'Animation', prompt: 'Create an animation for' },
                    { icon: Boxes, label: 'Modeling', prompt: 'Create a model for' }
                  ].map(({ icon: Icon, label, prompt }) => (
                    <button
                      key={label}
                      onClick={() => setInput(prompt + ' ')}
                      className="flex items-center gap-2 px-5 py-3 bg-card/80 backdrop-blur-sm border border-border rounded-xl text-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all transform hover:-translate-y-1"
                    >
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>

                 {/* Smart Suggestions - Context Aware */}
                 <div className="space-y-3 w-full animate-fade-in" style={{animationDelay: '0.2s'}}>
                    <div className="flex items-center gap-2 text-sm text-secondary font-medium">
                     <Lightbulb className="w-4 h-4 text-accent" />
                     Smart Suggestions
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {[
                       { text: "Create a futuristic shop UI with blur effects", icon: ShoppingCart, category: "UI" },
                       { text: "Make a red laser beam VFX", icon: ZapIcon, category: "VFX" },
                       { text: "Build a pet system with XP & leaderboards", icon: Dog, category: "Systems" },
                       { text: "Create an NPC dialogue system", icon: MessageCircle, category: "Gameplay" },
                       { text: "Make a floating island model", icon: Mountain, category: "Modeling" },
                       { text: "Create a holographic portal effect", icon: CircleDot, category: "VFX" },
                       { text: "Build a weapon system with animations", icon: Swords, category: "Combat" },
                       { text: "Create a day/night cycle system", icon: Sun, category: "Environment" }
                     ].map((suggestion) => (
                       <button
                         key={suggestion.text}
                         onClick={() => setInput(suggestion.text)}
                           className="flex items-center gap-3 text-left text-secondary hover:text-foreground p-3 rounded-xl hover:bg-card border border-transparent hover:border-border transition-all group hover:shadow-sm"
                       >
                          <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                            <suggestion.icon className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
                          </div>
                         <div className="flex-1 min-w-0">
                           <div className="text-sm truncate font-medium">{suggestion.text}</div>
                             <div className="text-xs text-secondary group-hover:text-foreground transition-colors" style={{opacity: 0.7}}>{suggestion.category}</div>
                         </div>
                       </button>
                     ))}
                   </div>
                 </div>
            </div>
          )}
          
            {/* AI Thinking Indicator */}
            {loading && !streamingReasoning && (
              <div className="flex justify-start">
                <div className="max-w-2xl p-4 rounded-xl bg-card border border-border shadow-sm">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="relative">
                     <Brain className="w-5 h-5 text-primary animate-pulse" />
                      <div className="absolute inset-0 w-5 h-5 border-2 border-primary rounded-full animate-ping" style={{opacity: 0.2}}></div>
                   </div>
                   <div>
                      <div className="text-foreground text-sm font-medium">AI is thinking...</div>
                      <div className="text-secondary text-xs">Analyzing your request and planning the solution</div>
                   </div>
                 </div>
                       <div className="flex items-center gap-2 text-xs text-secondary">
                   <div className="flex gap-1">
                     <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                     <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                     <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                     <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '450ms'}}></div>
                     <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '600ms'}}></div>
                   </div>
                   <span>Understanding context • Researching patterns • Designing architecture • Optimizing performance</span>
                 </div>
               </div>
             </div>
           )}

            {/* Streaming Reasoning Display */}
            {loading && streamingReasoning && (
              <div className="flex justify-start">
                <div className="max-w-2xl p-4 rounded-xl bg-card border border-border shadow-sm">
                 {streamingRequestType && (
                   <div className="mb-2">
                     <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                       streamingRequestType === 'scripting' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                       streamingRequestType === 'vfx' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                       streamingRequestType === 'animation' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' :
                       'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                     }`}>
                       {streamingRequestType === 'scripting' && <Code2 className="w-3 h-3 mr-1" />}
                       {streamingRequestType === 'vfx' && <SparklesIcon className="w-3 h-3 mr-1" />}
                       {streamingRequestType === 'animation' && <Film className="w-3 h-3 mr-1" />}
                       {streamingRequestType === 'modeling' && <Boxes className="w-3 h-3 mr-1" />}
                       {streamingRequestType.charAt(0).toUpperCase() + streamingRequestType.slice(1)} Mode
                     </span>
                   </div>
                 )}
                     <div className="mb-3 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                   <div className="flex items-center gap-2 mb-2">
                     <Brain className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-xs font-bold text-primary uppercase">AI Reasoning</span>
                   </div>
                    <p className="text-sm text-foreground/80 leading-relaxed font-mono text-xs">
                     <TypingText text={streamingReasoning} speed={15} />
                   </p>
                 </div>
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <div className="relative">
                       <Loader2 className="w-4 h-4 animate-spin text-primary" />
                       <div className="absolute inset-0 w-4 h-4 border-2 border-primary rounded-full animate-ping opacity-30"></div>
                     </div>
                      <span className="text-secondary text-sm">Generating with {currentModel?.name}...</span>
                   </div>
                    <div className="flex items-center gap-2 text-xs text-secondary">
                     <div className="flex gap-1">
                       <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                       <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                       <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                     </div>
                     <span>Analyzing requirements • Optimizing code • Creating assets</span>
                   </div>
                 </div>
               </div>
             </div>
           )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-2xl p-4 rounded-xl animate-fade-in shadow-sm ${
                  msg.role === 'user' ? 'bg-primary text-foreground' :
                  msg.role === 'error' ? 'bg-error/10 border border-error/20 text-error' : 'bg-card border border-border'
               }`}>
                {/* Request Type Badge */}
                {msg.requestType && (
                  <div className="mb-2">
                     <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                       msg.requestType === 'scripting' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                       msg.requestType === 'vfx' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                       msg.requestType === 'animation' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' :
                       'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      }`}>
                       {msg.requestType === 'scripting' && <Code2 className="w-3 h-3 mr-1" />}
                       {msg.requestType === 'vfx' && <SparklesIcon className="w-3 h-3 mr-1" />}
                       {msg.requestType === 'animation' && <Film className="w-3 h-3 mr-1" />}
                       {msg.requestType === 'modeling' && <Boxes className="w-3 h-3 mr-1" />}
                       {msg.requestType.charAt(0).toUpperCase() + msg.requestType.slice(1)} Mode
                     </span>
                  </div>
                )}
                
                {/* Reasoning Display */}
                {msg.reasoning && (
                  <div className="mb-3 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-primary" />
                       <span className="text-xs font-bold text-primary uppercase">Reasoning</span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed font-mono">{msg.reasoning}</p>
                  </div>
                )}
                
                <div className="mb-2 whitespace-pre-wrap">{msg.content}</div>
                
                {/* Model and Token Info */}
                {msg.model && (
                     <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                       <span className="text-secondary">Model:</span>
                      <span className="text-primary font-medium">{msg.model}</span>
                    </div>
                     {msg.tokensUsed && msg.tokensUsed > 0 && (
                      <>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-secondary">Tokens:</span>
                           <span className="text-foreground">{msg.tokensUsed.toLocaleString()}</span>
                        </div>
                         {msg.tokensPerSecond && msg.tokensPerSecond > 0 && (
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-secondary">Speed:</span>
                            <span className="text-primary font-medium">{msg.tokensPerSecond.toFixed(1)} tokens/s</span>
                          </div>
                        )}
                        {msg.duration && (
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-secondary">Duration:</span>
                             <span className="text-foreground">{msg.duration.toFixed(2)}s</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {msg.data && (
                  <div className="flex gap-2 mt-2">
                    <button 
                        onClick={() => setPreviewData(msg.data)}
                        className="flex items-center gap-2 px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded text-xs border border-border transition-colors"
                    >
                        <Code className="w-3 h-3" /> View Data
                    </button>
                      <div className="flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded text-xs border border-success/20">
                         <Check className="w-3 h-3" /> sent to plugin
                     </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
            {loading && !streamingReasoning && (
               <div className="flex justify-start">
                   <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                          <div className="relative">
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                               <div className="absolute inset-0 w-5 h-5 border-2 border-primary rounded-full animate-ping" style={{opacity: 0.2}}></div>
                          </div>
                          <div>
                               <div className="text-foreground text-sm font-medium">Generating with {currentModel?.name}</div>
                               <div className="text-secondary text-xs">Initializing AI model...</div>
                          </div>
                      </div>
                  <div className="flex items-center gap-2 text-xs text-secondary">
                          <div className="flex gap-1">
                              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
                              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
                              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{animationDelay: '600ms'}}></div>
                          </div>
                          <span>Connecting to AI • Loading model • Preparing workspace</span>
                      </div>
                  </div>
              </div>
           )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-card/80 backdrop-blur-sm border-t border-border">
          <div className="max-w-4xl mx-auto">
             <div className="relative flex items-center bg-input border border-border rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-sm transition-all">
              {/* Model selector - Always visible */}
              <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                     className="flex items-center gap-2 px-3 py-4 text-xs text-foreground border-r border-border hover:text-foreground hover:bg-hover transition-colors min-w-[120px] sm:min-w-[180px]"
                    title={currentModel?.name || 'Select Model'}
                  >
                  {currentModel ? (
                    <>
                      <ModelIcon modelId={currentModel.id} className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline whitespace-nowrap truncate">{currentModel.name}</span>
                      <span className="sm:hidden whitespace-nowrap truncate text-[10px]">{currentModel.name.split(' ')[0]}</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Select Model</span>
                    </>
                  )}
                  <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                </button>
                 {showModelDropdown && models.length > 0 && (
                   <>
                     <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)} />
                     <div className="absolute bottom-full left-0 mb-2 w-72 bg-card border border-border rounded-lg overflow-hidden max-h-96 overflow-y-auto shadow-2xl z-50">
                      {['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral', 'DeepSeek', 'Qwen', 'GLM', 'Grok', 'Moonshot', 'MiniMax', 'Other'].filter(cat => 
                        models.some(m => m.category === cat)
                      ).map((category) => {
                        const categoryModels = models.filter(m => m.category === category);
                        if (categoryModels.length === 0) return null;
                        return (
                          <div key={category}>
                            <div className="px-3 py-1.5 text-xs font-bold text-secondary bg-card border-b border-border sticky top-0">
                              {category}
                            </div>
                            {categoryModels.map((model) => (
                              <button
                                key={model.id}
                                onClick={() => {
                                  setSelectedModel(model.id);
                                  setShowModelDropdown(false);
                                }}
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center gap-2 transition-colors ${
                                  selectedModel === model.id ? 'bg-primary text-foreground' : 'text-foreground'
                                }`}
                              >
                                <ModelIcon modelId={model.id} className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{model.name}</span>
                                {selectedModel === model.id && (
                                  <Check className="w-3 h-3 ml-auto flex-shrink-0 text-primary" />
                                )}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                   </>
                 )}
              </div>
               <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && settings.enterToSend) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                 placeholder="Describe what you want to create in Roblox... (Enter to send, Shift+Enter for new line)"
                  className="flex-1 bg-transparent py-4 pl-4 pr-20 focus:outline-none text-foreground placeholder-secondary resize-none"
               />
              <div className="flex items-center gap-2 pr-2">
                <button 
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                     className="px-3 h-8 bg-primary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors shadow-sm"
                >
                    <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

       {previewData && <PreviewModal data={previewData} onClose={() => setPreviewData(null)} />}
       <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
