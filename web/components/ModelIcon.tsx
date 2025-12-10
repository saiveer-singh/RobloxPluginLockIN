"use client";
import React from 'react';

// Model icon component that returns appropriate brand icons/logos
export function ModelIcon({ modelId, className = "w-4 h-4" }: { modelId: string; className?: string }): React.JSX.Element {
  const lowerId = modelId.toLowerCase();
  
  // OpenAI models - Modern ChatGPT-style icon
  if (lowerId.includes('openai') || (lowerId.includes('gpt') && !lowerId.includes('openrouter'))) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#10A37F"/>
        <path d="M7 9h10v2H7V9zm0 3h10v2H7v-2zm0 3h7v2H7v-2z" fill="white"/>
        <circle cx="17" cy="8" r="1.5" fill="white"/>
      </svg>
    );
  }
  
  // Google/Gemini models - Modern Gemini icon
  if (lowerId.includes('gemini') || lowerId.includes('google')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#4285F4"/>
        <path d="M8 7l3 3-3 3V7zm6 0v6l3-3-3-3z" fill="white"/>
        <circle cx="12" cy="12" r="1" fill="white"/>
      </svg>
    );
  }
  
  // Anthropic/Claude models - Modern Claude icon
  if (lowerId.includes('claude') || lowerId.includes('anthropic')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#D97706"/>
        <path d="M7 9h10v6H7V9zm2 2v2h6v-2H9z" fill="white"/>
        <circle cx="17" cy="7" r="1.5" fill="white"/>
      </svg>
    );
  }
  
  // Meta/Llama models - Modern Meta icon
  if (lowerId.includes('llama') || lowerId.includes('meta')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#1877F2"/>
        <path d="M8 8h2v8H8V8zm3 0h2v8h-2V8zm3 0h2v8h-2V8z" fill="white"/>
        <circle cx="17" cy="7" r="1.5" fill="white"/>
      </svg>
    );
  }
  
  // Mistral models - Modern Mistral icon
  if (lowerId.includes('mistral') || lowerId.includes('mixtral')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#FF6D00"/>
        <path d="M7 8l3 3-3 3V8zm5 0l3 3-3 3V8z" fill="white"/>
        <circle cx="12" cy="11" r="1" fill="white"/>
      </svg>
    );
  }
  
  // Moonshot/Kimi - Modern Kimi icon
  if (lowerId.includes('kimi') || lowerId.includes('moonshot')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#FF6B6B"/>
        <path d="M8 7l4 4-4 4V7zm4 0l4 4-4 4V7z" fill="white"/>
        <circle cx="12" cy="11" r="1" fill="white"/>
      </svg>
    );
  }
  
  // Cohere models - Modern Cohere icon
  if (lowerId.includes('cohere') || lowerId.includes('command')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#FF6D00"/>
        <path d="M7 9h10v2H7V9zm0 3h10v2H7v-2zm0 3h6v2H7v-2z" fill="white"/>
        <circle cx="17" cy="8" r="1.5" fill="white"/>
      </svg>
    );
  }
  
  // DeepSeek models - Modern DeepSeek icon
  if (lowerId.includes('deepseek')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#1E40AF"/>
        <path d="M7 9h10v2H7V9zm0 3h10v2H7v-2zm0 3h6v2H7v-2z" fill="white"/>
        <circle cx="17" cy="8" r="1.5" fill="white"/>
      </svg>
    );
  }
  
  // Perplexity models - Modern Perplexity icon
  if (lowerId.includes('perplexity') || lowerId.includes('sonar')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#6366F1"/>
        <path d="M8 7l4 4-4 4V7zm4 0l4 4-4 4V7z" fill="white"/>
        <circle cx="12" cy="11" r="1" fill="white"/>
      </svg>
    );
  }
  
  // Qwen models - Modern Qwen icon
  if (lowerId.includes('qwen')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#8B5CF6"/>
        <path d="M8 8h8v2H8V8zm0 3h8v2H8v-2zm0 3h5v2H8v-2z" fill="white"/>
        <circle cx="17" cy="7" r="1.5" fill="white"/>
      </svg>
    );
  }
  
  // Code models (CodeLlama, StarCoder, etc.) - Modern code icon
  if (lowerId.includes('code') || lowerId.includes('codellama') || lowerId.includes('starcoder') || lowerId.includes('phind')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#10B981"/>
        <path d="M8 8l2 2-2 2V8zm4 0l2 2-2 2V8zm-4 4l2 2-2 2v-4zm4 0l2 2-2 2v-4z" fill="white"/>
        <circle cx="12" cy="12" r="1" fill="white"/>
      </svg>
    );
  }
  
    // Grok/xAI models - Modern Grok icon
    if (lowerId.includes('grok') || lowerId.includes('x-ai')) {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#FF6B35"/>
          <path d="M8 7l4 4-4 4V7zm4 0l4 4-4 4V7z" fill="white"/>
          <circle cx="12" cy="11" r="1" fill="white"/>
        </svg>
      );
    }

    // GLM models - Modern GLM icon
    if (lowerId.includes('glm')) {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#8B5CF6"/>
          <path d="M7 9h10v2H7V9zm0 3h10v2H7v-2zm0 3h6v2H7v-2z" fill="white"/>
          <circle cx="17" cy="8" r="1.5" fill="white"/>
        </svg>
      );
    }

    // OpenRouter - Modern OpenRouter icon
    if (lowerId.includes('openrouter')) {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#6366F1"/>
          <path d="M7 8h10v2H7V8zm0 3h10v2H7v-2zm0 3h6v2H7v-2z" fill="white"/>
          <circle cx="17" cy="7" r="1.5" fill="white"/>
        </svg>
      );
    }
  
  // Default AI icon - Modern default icon
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#6B7280"/>
      <path d="M8 10l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="16" cy="8" r="1.5" fill="white"/>
    </svg>
  );
}
