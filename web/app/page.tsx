"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useSettings } from '@/lib/settings';
import type { ModelProvider, ModelInfo } from '@/lib/models';
import { MODEL_CONFIGS, ALL_MODELS } from '@/lib/models';
import { LogIn, LogOut, Search, Menu, MessageSquare, Settings, User, Copy, RefreshCw, Send, Loader2, Bot, Code2, Sparkles, Film, Boxes, Lightbulb, ShoppingBag, Target, Trophy, Zap, ChevronDown, Code, Check, Folder, Key, Coins } from 'lucide-react';
import { PreviewModal } from '@/components/PreviewModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ModelIcon } from '@/components/ModelIcon';
import { ProjectProvider, useProject } from '@/lib/project-context';
import { ProjectExplorer } from '@/components/ProjectExplorer';

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

function ChatInterface() {
    const { data: session } = useSession();
    const { settings, updateSettings } = useSettings();
    const { addAssetToTree, getProjectContextString } = useProject();
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
    const [selectedModel, setSelectedModel] = useState<ModelProvider>('grok-code' as ModelProvider);
     const [streamingReasoning, setStreamingReasoning] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentModel, setCurrentModel] = useState<ModelInfo | null>(null);
    const [username, setUsername] = useState("");
    const [showProjectOrg, setShowProjectOrg] = useState(false);
    const [coinBalance, setCoinBalance] = useState<number>(0);
    const [loadingCoins, setLoadingCoins] = useState(false);


    // Extract userId from session (can be undefined initially)
    const userId = "testuser"; // Hardcode for testing

    // Models list
    const models = useMemo(() => ALL_MODELS, []);

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
      setSelectedModel('grok-code' as ModelProvider);
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
        const defaultModelId = models.find(m => m.id === 'grok-code')?.id || models[0]?.id;
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
     }, [messages, streamingReasoning, settings.autoScroll]);

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

   const sendMessage = useCallback(async (text?: string) => {
     const promptText = text || input.trim();
     if (!promptText || loading) return;

     // Create new thread if none exists
     if (!currentThreadId) {
       createNewThread();
       await new Promise(resolve => setTimeout(resolve, 100));
     }

     const userMsg: Message = {
       role: 'user',
       content: promptText,
       timestamp: Date.now()
     };
     const threadId = currentThreadId || threads[0]?.id;

     setMessages((prev: Message[]) => [...prev, userMsg]);

     // Update thread title from first message if it's still "New Chat"
     if (threadId) {
       const thread = threads.find((t: Thread) => t.id === threadId);
       if (thread && thread.title === 'New Chat') {
         const title = promptText.length > 30 ? promptText.substring(0, 30) + '...' : promptText;
         setThreads((prev: Thread[]) => prev.map((t: Thread) =>
           t.id === threadId ? { ...t, title } : t
         ));
       }
     }

      if (!text) setInput(""); // Only clear input if using input field
       setLoading(true);
       setStreamingReasoning(null);

       try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout

          // Inject project context into system prompt
          const currentContext = getProjectContextString();
          const effectiveSystemPrompt = (systemPrompt || "") + "\n\n" + currentContext;

          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: userMsg.content,
              model: selectedModel,
              systemPrompt: effectiveSystemPrompt,
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

           const reader = res.body?.getReader();
           const decoder = new TextDecoder();
           let fullText = '';
           let chunkCount = 0;

           if (reader) {
             // Show loading state while streaming
             setStreamingReasoning("Generating response...");

             while (true) {
               const { done, value } = await reader.read();
               if (done) break;

               const chunk = decoder.decode(value, { stream: true });
               fullText += chunk;
               chunkCount++;

               if (chunkCount % 10 === 0) {
                 console.log(`Received ${chunkCount} chunks, total length: ${fullText.length}`);
               }
             }

             console.log(`Stream complete. Total chunks: ${chunkCount}, final text length: ${fullText.length}`);
             console.log('Final response preview:', fullText.substring(0, 200));
           }

            // Stream finished, parse full JSON
            console.log('Stream finished, checking response...');
            console.log('Response length:', fullText.length);
            console.log('Response preview:', fullText.substring(0, 200));

            if (!fullText.trim()) {
              // Get the correct provider from MODEL_CONFIGS
              const config = MODEL_CONFIGS[selectedModel as keyof typeof MODEL_CONFIGS];
              const provider = config?.provider || 'unknown';

              let suggestion = '';
              if (provider === 'openrouter') {
                suggestion = ' Try switching to an OpenCode model like "Grok Code Fast 1".';
              } else {
                suggestion = ' Try switching to an OpenRouter model.';
              }

              const errorMsg = `AI response was empty. Model: ${selectedModel}, Provider: ${provider}. Please check your API key and model configuration.${suggestion}`;
              console.error(errorMsg);
              throw new Error(errorMsg);
            }

           let data;
           try {
             const cleaned = cleanJson(fullText);
             console.log('Attempting to parse cleaned JSON:', cleaned.substring(0, 200));
             data = JSON.parse(cleaned);
            // Update Project Explorer with new assets
            addAssetToTree(data);
          } catch (e) {
             console.error('Failed to parse final JSON:', e);
             console.error('Raw response:', fullText.substring(0, 500));
             console.error('Cleaned response:', cleanJson(fullText).substring(0, 500));
             
             // Create error message with details
             const errorDetails = fullText.length > 200 
               ? `Response preview: ${fullText.substring(0, 200)}...` 
               : `Full response: ${fullText}`;
             
             throw new Error(`AI response was not valid JSON. ${errorDetails}\n\nError: ${(e as Error).message}`);
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
            tokensUsed: data.tokensUsed,
            tokensPerSecond: 0,
            duration: 0
          };

           // Update token usage stats
           if (data.tokensUsed) {
              const currentTotal = settings.totalTokensUsed || 0;
              const newEntry = {
                timestamp: Date.now(),
                tokens: data.tokensUsed,
                model: modelId || selectedModel,
                requestType: requestType || data.requestType,
                duration: aiMsg.duration,
                tokensPerSecond: aiMsg.tokensPerSecond
              };
              updateSettings({
                totalTokensUsed: currentTotal + data.tokensUsed,
                tokenUsageHistory: [...(settings.tokenUsageHistory || []), newEntry]
              });
           }
           
           // Update coin balance if available
           if (data.remainingCoins !== undefined) {
             setCoinBalance(data.remainingCoins);
           }
           
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
        }
     }, [input, loading, currentThreadId, threads, selectedModel, systemPrompt, settings, createNewThread, userId, addAssetToTree, getProjectContextString, updateSettings]);

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

  // Fetch coin balance
  const fetchCoinBalance = useCallback(async () => {
    if (!userId) return;
    
    setLoadingCoins(true);
    try {
      const res = await fetch(`/api/coins?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCoinBalance(data.coins || 0);
      }
    } catch (error) {
      console.error('Error fetching coin balance:', error);
    } finally {
      setLoadingCoins(false);
    }
  }, [userId]);

  // Fetch coins when user logs in
  useEffect(() => {
    if (userId) {
      fetchCoinBalance();
    }
  }, [userId, fetchCoinBalance]);

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
     <div className={`flex h-screen bg-background text-foreground ${settings.compactMode ? 'compact-mode' : ''}`}>
       {/* Sidebar - Clean and minimal */}
       <div className="w-64 bg-card border-r border-border flex flex-col p-4 h-full">
        <div className="flex items-center gap-3 font-bold text-xl text-foreground mb-6">
          <Menu className="w-5 h-5 cursor-pointer hover:text-secondary transition-colors" />
          <span>RobloxGen AI</span>
        </div>

        {/* Projects Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-secondary flex items-center gap-2">
              <Boxes className="w-4 h-4" />
              Projects
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  // Toggle project organization panel
                  setShowProjectOrg(!showProjectOrg);
                }}
                className="p-1 hover:bg-hover rounded text-secondary"
                title="Organize Projects"
              >
                <Folder className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <button
              onClick={createNewThread}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-hover transition-colors text-secondary"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm">New Project</span>
            </button>
          </div>
        </div>

        {/* Search Threads */}
        <div className="relative mb-4">
          <Search className="absolute left-3 -translate-y-1/2 w-4 h-4 text-secondary" style={{top: '50%'}} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
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
              <div className="text-secondary text-sm p-2 text-center">No projects found</div>
            )}
            {!searchQuery && threads.length === 0 && (
              <div className="text-secondary text-sm p-2 text-center">No projects yet</div>
            )}
        </div>

        {/* User Section - Minimal */}
        <div className="border-t border-border pt-4 mt-auto space-y-3">
           {/* Coin Balance */}
           <div className="bg-card border border-border rounded-lg p-3">
             <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2">
                 <Coins className="w-4 h-4 text-yellow-500" />
                 <span className="text-sm font-semibold text-foreground">Coins</span>
               </div>
               {loadingCoins ? (
                 <Loader2 className="w-4 h-4 animate-spin text-secondary" />
               ) : (
                 <button
                   onClick={fetchCoinBalance}
                   className="p-1 hover:bg-hover rounded transition-colors"
                   title="Refresh balance"
                 >
                   <RefreshCw className="w-3 h-3 text-secondary" />
                 </button>
               )}
             </div>
             <div className="text-2xl font-bold text-yellow-500">
               {coinBalance.toLocaleString()}
             </div>
             <p className="text-xs text-secondary mt-1">1 coin ≈ 1000 tokens</p>
           </div>

           {/* User Info */}
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
               U
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-foreground truncate">User</p>
                <p className="text-xs text-secondary">ID: {userId}</p>
              </div>
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
      <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar - Minimal */}
           <div className="flex items-center justify-between p-4 border-b border-border">
             <h1 className="text-lg font-semibold text-foreground">RobloxGen AI</h1>
             <div className="flex items-center gap-3">
               {/* Model Switcher */}
               <div className="relative" ref={dropdownRef}>
                 <button
                   onClick={() => setShowModelDropdown(!showModelDropdown)}
                   className="flex items-center gap-2 px-3 py-1.5 text-sm bg-card border border-border rounded-lg hover:border-primary transition-colors"
                 >
                    <Bot className="w-4 h-4 text-primary" />
                   <span className="hidden sm:inline">{currentModel?.name || 'Select Model'}</span>
                   <ChevronDown className={`w-3 h-3 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                 </button>
                 {showModelDropdown && models.length > 0 && (
                   <>
                     <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)} />
                     <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg overflow-hidden shadow-lg z-50 max-h-80 overflow-y-auto">
                       {models.map((model) => (
                         <button
                           key={model.id}
                           onClick={() => {
                             setSelectedModel(model.id);
                             setShowModelDropdown(false);
                           }}
                           className={`w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center gap-2 transition-colors ${
                             selectedModel === model.id ? 'bg-primary text-primary-foreground' : 'text-foreground'
                           }`}
                         >
                           <ModelIcon modelId={model.id} className="w-4 h-4 flex-shrink-0" />
                           <span className="truncate">{model.name}</span>
                         </button>
                       ))}
                     </div>
                   </>
                 )}
               </div>
               <button
                 onClick={() => setShowSettings(true)}
                 className="p-2 text-secondary hover:text-foreground cursor-pointer transition-colors rounded-lg hover:bg-hover"
                 title="Settings"
               >
                <Settings className="w-5 h-5" />
               </button>
             </div>
           </div>



        <div className={`flex-1 overflow-y-auto p-4 space-y-4 message-spacing`} ref={scrollRef}>
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto text-center">
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-foreground">Welcome to RobloxGen AI</h1>
                  <p className="text-secondary">Describe what you want to create in Roblox and I'll help you build it.</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 max-w-sm mx-auto">
                  <h3 className="text-sm font-semibold text-primary flex items-center justify-center gap-2">
                    <Key className="w-4 h-4" />
                    Your Plugin Token
                  </h3>
                  <p className="text-xs text-primary/80 mt-2">Look in the left sidebar under "Plugin Token" to find your connection token</p>
                  <p className="text-xs text-primary/60">Copy this token to your Roblox plugin settings</p>
                </div>

                <div className="w-full space-y-3">
                  <div className="text-sm text-secondary font-medium">Quick start:</div>
                  <div className="grid grid-cols-2 gap-2">
                     <button
                       onClick={() => setInput("Create a leaderboard script")}
                       className="p-3 text-left bg-card border border-border rounded-lg hover:border-primary transition-colors flex items-start gap-3"
                     >
                       <Trophy className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                       <div>
                         <div className="text-sm font-medium">Leaderboard Script</div>
                         <div className="text-xs text-secondary">DataStore system</div>
                       </div>
                     </button>
                     <button
                       onClick={() => setInput("Create a gun script")}
                       className="p-3 text-left bg-card border border-border rounded-lg hover:border-primary transition-colors flex items-start gap-3"
                     >
                       <Target className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                       <div>
                         <div className="text-sm font-medium">Gun Script</div>
                         <div className="text-xs text-secondary">Raycasting weapon</div>
                       </div>
                     </button>
                     <button
                       onClick={() => setInput("Create a shop GUI")}
                       className="p-3 text-left bg-card border border-border rounded-lg hover:border-primary transition-colors flex items-start gap-3"
                     >
                       <ShoppingBag className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                       <div>
                         <div className="text-sm font-medium">Shop GUI</div>
                         <div className="text-xs text-secondary">Tweening interface</div>
                       </div>
                     </button>
                     <button
                       onClick={() => setInput("Create a particle effect")}
                       className="p-3 text-left bg-card border border-border rounded-lg hover:border-primary transition-colors flex items-start gap-3"
                     >
                       <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                       <div>
                         <div className="text-sm font-medium">Particle Effect</div>
                         <div className="text-xs text-secondary">VFX system</div>
                       </div>
                     </button>
                  </div>
                </div>
              </div>
            )}
          
           {messages.map((msg, i) => (
             <div key={i}>
               <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                   <div className={`max-w-2xl p-3 rounded-lg animate-fade-in ${
                     msg.role === 'user' ? 'bg-primary text-primary-foreground' :
                     msg.role === 'error' ? 'bg-red-900 border border-red-700 text-red-100' : 'bg-card border border-border text-foreground'
                   }`}>
                   <div className="whitespace-pre-wrap">{msg.content}</div>
                   <div className="flex items-center gap-3 mt-2">
                     {msg.timestamp && (
                       <div className="text-xs opacity-60">
                         {new Date(msg.timestamp).toLocaleTimeString()}
                       </div>
                     )}
                     {msg.role === 'ai' && msg.data && (msg.data as any).coinCost && (
                       <>
                         <span className="text-xs opacity-60">•</span>
                         <div className="flex items-center gap-1 text-xs opacity-60">
                           <Coins className="w-3 h-3 text-yellow-500" />
                           <span>{(msg.data as any).coinCost} coins</span>
                         </div>
                       </>
                     )}
                   </div>
                 </div>
               </div>
               {/* Show loading indicator after user's message when AI is generating */}
               {msg.role === 'user' && loading && i === messages.length - 1 && (
                 <div className="flex justify-start mb-4 animate-fade-in">
                   <div className="max-w-2xl p-3 rounded-lg bg-card border border-border">
                     <div className="flex items-center gap-3">
                       <Loader2 className="w-4 h-4 animate-spin text-primary" />
                       <div className="text-sm text-secondary">AI is generating...</div>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           ))}
          

        </div>

         {/* Input Area */}
         <div className="p-4 bg-card border-t border-border">
           <div className="max-w-4xl mx-auto">
             {/* Coin estimate hint */}
             {input.trim() && (
               <div className="flex items-center gap-2 text-xs text-secondary mb-2">
                 <Coins className="w-3 h-3 text-yellow-500" />
                 <span>Estimated cost: ~1-5 coins (varies by complexity)</span>
               </div>
             )}
             <div className="flex items-center gap-3">
               <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     sendMessage();
                   }
                 }}
                 placeholder="Type your message..."
                 className="flex-1 bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary text-foreground placeholder-secondary"
               />
               <button
                 onClick={() => sendMessage()}
                 disabled={loading || !input.trim()}
                 className="px-4 py-3 bg-primary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
               >
                 <Send className="w-4 h-4" />
               </button>
             </div>
           </div>
          </div>
       </div>

       {previewData && <PreviewModal data={previewData} onClose={() => setPreviewData(null)} />}
       <SettingsPanel
         isOpen={showSettings}
         onClose={() => setShowSettings(false)}
         pluginToken={pluginToken}
         copyToken={copyToken}
         regenerateToken={regenerateToken}
       />
     </div>
  );
}

export default function Home() {
  return (
    <ProjectProvider>
      <ChatInterface />
    </ProjectProvider>
  );
}
