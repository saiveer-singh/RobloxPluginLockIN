"use client";
import React from 'react';

// Model icon component that returns appropriate brand icons/logos
export function ModelIcon({ modelId, className = "w-4 h-4" }: { modelId: string; className?: string }) {
  const lowerId = modelId.toLowerCase();
  
  // OpenAI models - OpenAI logo (simplified)
  if (lowerId.includes('openai') || (lowerId.includes('gpt') && !lowerId.includes('openrouter'))) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.4397-1.9555 6.0462 6.0462 0 0 0-1.185-1.8635 5.9876 5.9876 0 0 0-1.8697-1.252 5.9682 5.9682 0 0 0-4.7557-.1135L7.8139 8.1148a1.0001 1.0001 0 0 0-.5156.8088l-.0088 6.1948a.9994.9994 0 0 0 .5156.8088l2.3759 1.3535a5.9556 5.9556 0 0 0 1.8697 1.252 5.9858 5.9858 0 0 0 4.7557.1135l4.0195-1.4775a1.0005 1.0005 0 0 0 .5156-.8088v-6.1948a.9994.9994 0 0 0-.5156-.8088z" fill="#10A37F"/>
        <path d="M13.1231 16.1119l-1.8697-1.252a.9994.9994 0 0 1-.5156-.8088V7.8562a.9994.9994 0 0 1 .5156-.8088l1.8697-1.252a5.9858 5.9858 0 0 1 4.7557-.1135l4.0195 1.4775a1.0001 1.0001 0 0 1 .5156.8088v6.1948a.9994.9994 0 0 1-.5156.8088l-4.0195 1.4775a5.9556 5.9556 0 0 1-4.7557-.1135z" fill="#10A37F"/>
      </svg>
    );
  }
  
  // Google/Gemini models - Google logo (simplified)
  if (lowerId.includes('gemini') || lowerId.includes('google')) {
    return (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    );
  }
  
  // Anthropic/Claude models
  if (lowerId.includes('claude') || lowerId.includes('anthropic')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#D4A574"/>
        <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  
  // Meta/Llama models
  if (lowerId.includes('llama') || lowerId.includes('meta')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.001.007C5.326.007.007 5.326.007 12S5.326 23.995 12 23.995s11.993-5.319 11.993-11.994S18.676.007 12.001.007zM8.21 16.89c.35 0 .654-.113.915-.338l1.92 1.917 1.917-1.92c.236-.26.349-.564.349-.914 0-.35-.113-.654-.349-.915l-1.912-1.912 1.912-1.917c.236-.26.349-.564.349-.914 0-.35-.113-.654-.349-.915l-1.917-1.912-1.92 1.912c-.26.26-.564.349-.915.349-.35 0-.654-.113-.915-.349L5.374 8.502l-1.917 1.917c-.236.26-.349.564-.349.914 0 .35.113.654.349.915l1.912 1.912-1.912 1.917c-.236.26-.349.564-.349.914 0 .35.113.654.349.915l1.917 1.912 1.92-1.912c.26-.26.564-.349.915-.349zm7.58 0c.35 0 .654-.113.915-.338l1.92 1.917 1.917-1.92c.236-.26.349-.564.349-.914 0-.35-.113-.654-.349-.915l-1.912-1.912 1.912-1.917c.236-.26.349-.564.349-.914 0-.35-.113-.654-.349-.915l-1.917-1.912-1.92 1.912c-.26.26-.564.349-.915.349-.35 0-.654-.113-.915-.349l-1.917-1.917-1.917 1.917c-.236.26-.349.564-.349.914 0 .35.113.654.349.915l1.912 1.912-1.912 1.917c-.236.26-.349.564-.349.914 0 .35.113.654.349.915l1.917 1.912 1.92-1.912c.26-.26.564-.349.915-.349z" fill="#0081FB"/>
      </svg>
    );
  }
  
  // Mistral models
  if (lowerId.includes('mistral') || lowerId.includes('mixtral')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FF6D00" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  
  // Moonshot/Kimi
  if (lowerId.includes('kimi') || lowerId.includes('moonshot')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" fill="#FF6B6B"/>
        <circle cx="12" cy="12" r="2" fill="white"/>
      </svg>
    );
  }
  
  // Cohere models
  if (lowerId.includes('cohere') || lowerId.includes('command')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="#FF6D00"/>
      </svg>
    );
  }
  
  // DeepSeek modelsIt
  if (lowerId.includes('deepseek')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#1E40AF"/>
        <path d="M2 12l10 5 10-5" fill="#3B82F6"/>
        <path d="M2 17l10 5 10-5" fill="#60A5FA"/>
      </svg>
    );
  }
  
  // Perplexity models
  if (lowerId.includes('perplexity') || lowerId.includes('sonar')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#6366F1"/>
        <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  
  // Qwen models
  if (lowerId.includes('qwen')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#8B5CF6"/>
        <circle cx="12" cy="12" r="3" fill="#A78BFA"/>
      </svg>
    );
  }
  
  // Code models (CodeLlama, StarCoder, etc.)
  if (lowerId.includes('code') || lowerId.includes('codellama') || lowerId.includes('starcoder') || lowerId.includes('phind')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5.14v13.72l5-2.49 5 2.49V5.14l-5 2.49-5-2.49zM7 2L2 5v14l5 3 5-3 5 3 5-3V5l-5-3-5 3-5-3z" fill="#10B981"/>
      </svg>
    );
  }
  
   // Grok/xAI models
   if (lowerId.includes('grok') || lowerId.includes('x-ai')) {
     return (
       <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
         <path d="M12 2L13.09 8.26L19 7L13.09 5.74L12 12L10.91 5.74L5 7L10.91 8.26L12 2Z" fill="#FF6B35"/>
         <circle cx="12" cy="12" r="8" fill="none" stroke="#FF6B35" strokeWidth="2"/>
       </svg>
     );
   }

   // GLM models
   if (lowerId.includes('glm')) {
     return (
       <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
         <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="#8B5CF6"/>
       </svg>
     );
   }

   // OpenRouter - network/router icon
   if (lowerId.includes('openrouter')) {
     return (
       <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
         <rect x="4" y="4" width="16" height="16" rx="2" fill="#6366F1" opacity="0.2"/>
         <rect x="6" y="6" width="12" height="12" rx="1" fill="none" stroke="#6366F1" strokeWidth="2"/>
         <circle cx="9" cy="9" r="1" fill="#6366F1"/>
         <circle cx="15" cy="9" r="1" fill="#6366F1"/>
         <circle cx="9" cy="15" r="1" fill="#6366F1"/>
         <circle cx="15" cy="15" r="1" fill="#6366F1"/>
         <line x1="9" y1="9" x2="15" y2="9" stroke="#6366F1" strokeWidth="1"/>
         <line x1="9" y1="15" x2="15" y2="15" stroke="#6366F1" strokeWidth="1"/>
       </svg>
     );
   }
  
  // Default AI icon
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
}
