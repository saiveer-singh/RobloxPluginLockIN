"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useSettings } from '@/lib/settings';
import type { ModelProvider } from '@/lib/ai';
import type { ModelInfo } from '@/lib/models';
import { LogIn, LogOut, Search, Menu, MessageSquare, Settings, User, Copy, RefreshCw, Send, Loader2, Brain, Code2, SparklesIcon, Film, Boxes, Lightbulb, ShoppingCart, ZapIcon, Dog, MessageCircle, Mountain, CircleDot, Swords, Sun, Check, ChevronDown, Code } from 'lucide-react';
import { PreviewModal } from '@/components/PreviewModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ModelIcon } from '@/components/ModelIcon';

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
  data?: unknown;
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
  timestamp: number;
}

interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// Helper to clean JSON string
function cleanJson(text: string): string {
  if (!text) return text;
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  return cleaned.trim();
}

export default function Home() {
    const { data: session } = useSession();
    const { settings } = useSettings();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [pluginToken, setPluginToken] = useState<string>("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [showSystemPrompt, setShowSystemPrompt] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<ModelProvider>('openai/gpt-4o' as ModelProvider);
    const [streamingReasoning, setStreamingReasoning] = useState<string | null>(null);
    const [streamingRequestType, setStreamingRequestType] = useState<string | null>(null);
    const [streamingCode, setStreamingCode] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<unknown>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentModel, setCurrentModel] = useState<ModelInfo | null>(null);
    const [username, setUsername] = useState("");


    // Extract userId from session (can be undefined initially)
    const userId = session?.user?.robloxId || undefined;

    // Models list
    const models = useMemo(() => [
      { id: 'x-ai-grok-4.1-fast-free' as ModelProvider, name: 'Grok 4.1 Fast Free', category: 'Grok' },
      { id: 'z-ai-glm-4.5-air-free' as ModelProvider, name: 'GLM 4.5 Air Free', category: 'GLM' },
      { id: 'moonshotai-kimi-k2-free' as ModelProvider, name: 'Kimi K2 Free', category: 'Moonshot' },
      { id: 'qwen-qwen3-coder-free' as ModelProvider, name: 'Qwen 3 Coder Free', category: 'Qwen' }
    ], []);

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

   // Synchronization effect: Load messages when switching threads
   useEffect(() => {
     if (currentThreadId) {
       const thread = threads.find(t => t.id === currentThreadId);
       if (thread) {
         setMessages(thread.messages);
       }
     } else {
       setMessages([]);
     }
     // CRITICAL: Exclude 'threads' from dependency array to prevent infinite loop.
     // We only want to load messages when the ID changes.
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [currentThreadId]);

   // Save messages to current thread
   useEffect(() => {
     if (currentThreadId && messages.length > 0) {
       setThreads((prev: Thread[]) => {
          // Check if we actually need to update to avoid unnecessary re-renders
          const currentThread = prev.find(t => t.id === currentThreadId);
          if (currentThread && JSON.stringify(currentThread.messages) === JSON.stringify(messages)) {
            return prev;
          }

          return prev.map((t: Thread) =>
           t.id === currentThreadId
             ? { ...t, messages, updatedAt: Date.now() }
             : t
         );
       });
     }
   }, [messages, currentThreadId]);

    // Auto-scroll to bottom when new messages arrive (if enabled)
    useEffect(() => {
      if (settings.autoScroll && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, streamingReasoning, streamingRequestType, streamingCode, settings.autoScroll]);

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
      setStreamingCode(null);
      setStreamingRequestType(null);

       try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout

          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: userMsg.content,
              model: selectedModel,
              systemPrompt: systemPrompt || undefined,
              userId
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          // Get metadata from headers
          const requestType = res.headers.get('X-Request-Type');
          const modelId = res.headers.get('X-Model-Id');
          if (requestType) setStreamingRequestType(requestType);

          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let fullText = '';

          if (reader) {
            // Initialize streaming reasoning to empty string to show the UI immediately
            setStreamingReasoning("");
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              fullText += chunk;

              // Heuristic: Find the reasoning field
              // We look for "reasoning": " and capture everything after it
              const reasoningStart = fullText.indexOf('"reasoning"');
              if (reasoningStart !== -1) {
                const valueStart = fullText.indexOf('"', reasoningStart + 11) + 1; // +11 for "reasoning": length approx
                if (valueStart > 0) {
                   // Capture until the next unescaped quote, OR until the end of the string if we are still streaming
                   // This is a bit tricky with regex on incomplete strings, so we use a safer approach
                   // We just try to match the content.
                   const match = fullText.slice(valueStart).match(/^((?:[^"\\]|\\.)*)/);
                   if (match) {
                      let text = match[1];
                      // Unescape basic chars for display
                      try {
                        text = text.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                      } catch (e) { /* ignore */ }
                      setStreamingReasoning(text);
                   }
                }
              }

              // Heuristic: Find the Source code field
              const sourceStart = fullText.indexOf('"Source"');
              if (sourceStart !== -1) {
                const valueStart = fullText.indexOf('"', sourceStart + 8) + 1;
                if (valueStart > 0) {
                   const match = fullText.slice(valueStart).match(/^((?:[^"\\]|\\.)*)/);
                   if (match) {
                      let text = match[1];
                      try {
                         text = text
                           .replace(/\\n/g, '\n')
                           .replace(/\\t/g, '\t')
                           .replace(/\\"/g, '"')
                           .replace(/\\\\/g, '\\');
                      } catch (e) { /* ignore */ }
                      setStreamingCode(text);
                   }
                }
              }
            }
          }

          // Stream finished, parse full JSON
          let data;
          try {
            const cleaned = cleanJson(fullText);
            data = JSON.parse(cleaned);
          } catch (e) {
             console.error('Failed to parse final JSON:', e);
             throw new Error('AI response was not valid JSON');
          }

          if (data?.error) throw new Error(data.error);

          if (data.reasoning) {
            setStreamingReasoning(data.reasoning);
          }



          const aiMsg: Message = {
            role: 'ai',
            content: data.message,
            timestamp: Date.now(),
            reasoning: data.reasoning,
            data: data,
            model: modelId || selectedModel,
            requestType: requestType || data.requestType,
            tokensUsed: data.tokensUsed, // These might be missing in stream response, handled below
            tokensPerSecond: 0,
            duration: 0
          };
          setMessages((prev: Message[]) => [...prev, aiMsg]);
       } catch (e: unknown) {
         console.error('Send message error:', e);
         let errorContent = 'An unexpected error occurred';
         if (e instanceof Error) {
           if (e.name === 'AbortError') {
             errorContent = 'Request timed out after 120 seconds. Please try again.';
           } else {
             errorContent = e.message;
           }
         }
         const errorMsg: Message = {
           role: 'error',
           content: errorContent,
           timestamp: Date.now()
         };
        setMessages((prev: Message[]) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
        setStreamingReasoning(null);
        setStreamingRequestType(null);
        setStreamingCode(null);
      }
    }, [input, loading, currentThreadId, threads, selectedModel, systemPrompt, settings, createNewThread, userId]);

  const copyToken = async () => {
    if (pluginToken) {
      navigator.clipboard.writeText(pluginToken);
    }
  };

  const regenerateToken = useCallback(async () => {
    if (!userId) return;
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
      console.error('Regenerate token error:', e);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    const validateAndSetToken = async () => {
      const storedToken = localStorage.getItem(`plugin-token-${userId}`);
      if (storedToken) {
        try {
          // Verify if the token is still valid on the server
          const res = await fetch(`/api/status?token=${storedToken}`);
          if (!mounted) return;

          if (res.ok) {
             setPluginToken(storedToken);
          } else {
             // Token invalid (server restarted?), regenerate
             console.log('Stored token invalid, regenerating...');
             regenerateToken();
          }
        } catch (e) {
           if (!mounted) return;
           console.error('Token validation failed', e);
           // Fallback to regeneration if validation request fails
           regenerateToken();
        }
      } else {
        regenerateToken();
      }
    };

    validateAndSetToken();

    return () => {
      mounted = false;
    };
  }, [userId, regenerateToken]);



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
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-8 max-w-md mx-auto p-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-primary">RobloxGen AI</h1>
            <p className="text-secondary text-lg">Generate Roblox assets using AI</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-secondary">Choose how to sign in</p>
              <button
                onClick={() => signIn('google')}
                className="w-full bg-primary hover:opacity-90 text-primary-foreground font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
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
                <span className="px-2 bg-background text-secondary">or</span>
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
                  className="w-full bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
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
    <div className={`flex h-screen ${settings.compactMode ? 'compact-mode' : ''}`}>
      {/* Sidebar */}
      <div className={`w-64 border-r border-border p-4 hidden md:flex flex-col gap-4 sidebar-spacing`}>
        <div className="flex items-center gap-3 font-bold text-xl text-foreground">
          <Menu className="w-5 h-5 cursor-pointer hover:text-secondary transition-colors" />
          <span>RobloxGen AI</span>
        </div>

        {/* New Chat Button */}
        <button 
          onClick={createNewThread}
          className="w-full bg-primary hover:opacity-80 text-foreground font-medium py-2.5 px-4 rounded-lg transition-colors"
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
                   currentThreadId === thread.id ? 'bg-primary text-foreground border border-primary' : 'hover:bg-hover'
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
             <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
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
      <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-end gap-3 p-4 border-b border-border">
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                  showSystemPrompt ? 'bg-primary text-foreground' : 'text-secondary hover:text-foreground hover:bg-hover'}`}
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
                  {/* Animated background elements - Confetti and Fireworks */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Confetti pieces */}
                    {Array.from({ length: 20 }, (_, i) => {
                      const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#e4e4e7', '#ffffff'];
                      const left = Math.random() * 100;
                      const delay = Math.random() * 10;
                      const duration = 8 + Math.random() * 4;
                      const size = 4 + Math.random() * 8;
                      return (
                        <div
                          key={`confetti-${i}`}
                          className="absolute animate-confetti-fall"
                          style={{
                            left: `${left}%`,
                            top: '-10px',
                            width: `${size}px`,
                            height: `${size}px`,
                            backgroundColor: colors[i % colors.length],
                            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                            animationDelay: `${delay}s`,
                            animationDuration: `${duration}s`,
                            opacity: 0.7,
                          }}
                        />
                      );
                    })}

                    {/* Fireworks bursts */}
                    {Array.from({ length: 5 }, (_, i) => {
                      const left = 20 + Math.random() * 60;
                      const top = 20 + Math.random() * 60;
                      const delay = 2 + Math.random() * 8;
                      const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ffffff'];
                      return (
                        <div
                          key={`firework-${i}`}
                          className="absolute"
                          style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            animationDelay: `${delay}s`,
                          }}
                        >
                          {/* Firework center */}
                          <div
                            className="absolute w-2 h-2 rounded-full animate-firework-burst"
                            style={{
                              backgroundColor: colors[i % colors.length],
                              animationDuration: '1.5s',
                            }}
                          />
                          {/* Firework particles */}
                          {Array.from({ length: 8 }, (_, j) => {
                            const angle = (j * 45) * (Math.PI / 180);
                            const distance = 30 + Math.random() * 20;
                            const tx = Math.cos(angle) * distance;
                            const ty = Math.sin(angle) * distance;
                            return (
                              <div
                                key={`particle-${i}-${j}`}
                                className="absolute w-1 h-1 rounded-full animate-firework-particle"
                                style={{
                                  backgroundColor: colors[i % colors.length],
                                  '--tx': `${tx}px`,
                                  '--ty': `${ty}px`,
                                  animationDelay: '0.3s',
                                  animationDuration: '1.2s',
                                } as React.CSSProperties}
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                 <div className="text-center space-y-4">
                   <h1 className="text-4xl font-bold text-white">What would you like to create in Roblox?</h1>
                    <p className="text-secondary text-lg">Describe your idea and watch AI bring it to life</p>
                 </div>
                
                {/* Action Buttons - Roblox Asset Types */}
                <div className="flex gap-3 flex-wrap justify-center">
                  {[
                    { icon: Code2, label: 'Scripting', prompt: 'Create a script for' },
                    { icon: SparklesIcon, label: 'VFX', prompt: 'Create a VFX effect for' },
                    { icon: Film, label: 'Animation', prompt: 'Create an animation for' },
                    { icon: Boxes, label: 'Modeling', prompt: 'Create a model for' }
                  ].map(({ icon: Icon, label, prompt }) => (
                    <button
                      key={label}
                      onClick={() => setInput(prompt + ' ')}
                      className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-foreground hover:border-primary transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                 {/* Smart Suggestions - Context Aware */}
                 <div className="space-y-3 w-full">
                    <div className="flex items-center gap-2 text-sm text-secondary font-medium">
                     <Lightbulb className="w-4 h-4" />
                     Smart Suggestions
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                     {[
                       { text: "Script a DataStore leaderboard system", icon: Code2, category: "Systems" },
                       { text: "Create a raycasting gun script", icon: Swords, category: "Combat" },
                       { text: "Make a GUI shop with tweening", icon: ShoppingCart, category: "UI" },
                       { text: "Build a low-poly pet model", icon: Dog, category: "Modeling" },
                       { text: "Create a fire aura particle effect", icon: ZapIcon, category: "VFX" },
                       { text: "Script a round-based game loop", icon: Sun, category: "Gameplay" },
                       { text: "Make a custom character controller", icon: MessageCircle, category: "Systems" },
                       { text: "Create an R15 walking animation", icon: Film, category: "Animation" }
                     ].map((suggestion) => (
                       <button
                         key={suggestion.text}
                         onClick={() => setInput(suggestion.text)}
                           className="flex items-center gap-2 text-left text-secondary hover:text-foreground p-3 rounded-lg hover:bg-hover border border-border hover:border-primary transition-all group"
                       >
                          <suggestion.icon className="w-4 h-4 text-secondary group-hover:text-primary" />
                         <div className="flex-1">
                           <div className="text-sm">{suggestion.text}</div>
                             <div className="text-xs text-secondary group-hover:text-foreground" style={{opacity: 0.7}}>{suggestion.category}</div>
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
                <div className="max-w-2xl p-4 rounded-xl bg-card border border-border">
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
                <div className="max-w-2xl p-4 rounded-xl bg-card border border-border">
                  {streamingRequestType && (
                    <div className="mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        streamingRequestType === 'scripting' ? 'bg-blue-500 text-blue-400 border border-blue-800' :
                        streamingRequestType === 'vfx' ? 'bg-purple-500 text-purple-400 border border-purple-800' :
                        streamingRequestType === 'animation' ? 'bg-pink-500 text-pink-400 border border-pink-800' :
                        'bg-orange-500 text-orange-400 border border-orange-800'
                      }`}>
                        {streamingRequestType === 'scripting' && <Code2 className="w-3 h-3" />}
                        {streamingRequestType === 'vfx' && <SparklesIcon className="w-3 h-3" />}
                        {streamingRequestType === 'animation' && <Film className="w-3 h-3" />}
                        {streamingRequestType === 'modeling' && <Boxes className="w-3 h-3" />}
                        {' '}
                        {streamingRequestType.charAt(0).toUpperCase() + streamingRequestType.slice(1)} Mode
                      </span>
                    </div>
                  )}
                      <div className="mb-3 p-3 bg-primary border border-primary rounded-lg" style={{opacity: 0.1}}>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-primary animate-pulse" />
                       <span className="text-xs font-bold text-primary uppercase">AI Reasoning</span>
                    </div>
                     <p className="text-sm text-primary leading-relaxed whitespace-pre-wrap">
                      {streamingReasoning}
                      <span className="animate-pulse">|</span>
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

            {/* Streaming Code Display */}
            {loading && streamingCode !== null && (
              <div className="flex justify-start">
                <div className="max-w-4xl p-4 rounded-xl bg-card border border-border">
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500 text-green-400 border border-green-800">
                      <Code className="w-3 h-3" />
                      {' '}
                      Live Coding
                    </span>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">
                      {streamingCode}
                      {!streamingCode.endsWith('\n') && <span className="animate-pulse">|</span>}
                    </pre>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-secondary">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
                    </div>
                    <span>Writing code • Adding logic • Optimizing performance</span>
                  </div>
                </div>
              </div>
            )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-2xl p-4 rounded-xl animate-fade-in ${
                  msg.role === 'user' ? 'bg-primary text-foreground' :
                  msg.role === 'error' ? 'bg-error border border-error text-error' : 'bg-card border border-border'
               }`}>
                {/* Request Type Badge */}
                {msg.requestType && (
                  <div className="mb-2">
                     <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                       msg.requestType === 'scripting' ? 'bg-blue-500 text-blue-400 border border-blue-800' :
                       msg.requestType === 'vfx' ? 'bg-purple-500 text-purple-400 border border-purple-800' :
                       msg.requestType === 'animation' ? 'bg-pink-500 text-pink-400 border border-pink-800' :
                       'bg-orange-500 text-orange-400 border border-orange-800'
                      }`}>
                       {msg.requestType === 'scripting' && <Code2 className="w-3 h-3" />}
                       {msg.requestType === 'vfx' && <SparklesIcon className="w-3 h-3" />}
                       {msg.requestType === 'animation' && <Film className="w-3 h-3" />}
                       {msg.requestType === 'modeling' && <Boxes className="w-3 h-3" />}
                       {' '}
                       {msg.requestType.charAt(0).toUpperCase() + msg.requestType.slice(1)} Mode
                     </span>
                  </div>
                )}
                
                {/* Reasoning Display */}
                {msg.reasoning && (
        <div className="mb-3 p-3 bg-primary border border-primary rounded-lg opacity-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-primary" />
                       <span className="text-xs font-bold text-primary uppercase">Reasoning</span>
                    </div>
                    <p className="text-sm text-primary leading-relaxed">{msg.reasoning}</p>
                  </div>
                )}
                
                <div className="mb-2">{msg.content}</div>
                
                {/* Model and Token Info */}
                {msg.model && (
                     <div className="mt-3 pt-3 border-t border-border space-y-1">
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
                        className="flex items-center gap-2 px-3 py-1 bg-secondary hover:bg-secondary rounded text-xs border border-border"
                    >
                        <Code className="w-3 h-3" /> View Data
                    </button>
                      <div className="flex items-center gap-2 px-3 py-1 bg-success text-success rounded text-xs border border-success">
                         sent to plugin
                     </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
            {loading && !streamingReasoning && (
               <div className="flex justify-start">
                   <div className="bg-card border border-border p-4 rounded-xl">
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
        <div className="p-4 bg-card border-t border-border">
          <div className="max-w-4xl mx-auto">
             <div className="relative flex items-center bg-input border border-border rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
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
                  className="flex-1 bg-transparent py-4 pl-4 pr-20 focus:outline-none text-[var(--val-foreground)] placeholder-secondary resize-none"
               />
              <div className="flex items-center gap-2 pr-2">
                <button 
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                     className="px-3 h-8 bg-primary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
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
