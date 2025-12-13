"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Shield, Code2, Layers, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white antialiased">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Gradient orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-500/15 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="fixed w-full z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">NxtAI</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="h-9 px-4 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2"
            >
              Open App
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-16 relative">
        <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 h-8 px-4 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Zero copy-paste workflow
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            The AI agent for
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Roblox development
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/50 max-w-lg mx-auto mb-10 leading-relaxed">
            Describe what you want to build.
            <br />
            Get production-ready code directly in Studio.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/app"
              className="h-12 px-6 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg shadow-white/10"
            >
              Start building
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="h-12 px-6 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
            >
              Learn more
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
            <div className="w-1 h-1.5 rounded-full bg-white/40 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm font-medium text-violet-400 mb-3">FEATURES</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-white/50 max-w-md mx-auto">
              A complete toolkit for Roblox game development, powered by AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Instant generation",
                description: "Get working Lua code in seconds. No debugging, no boilerplate."
              },
              {
                icon: Code2,
                title: "Direct to Studio",
                description: "Plugin automatically inserts generated assets. Zero copy-paste."
              },
              {
                icon: Shield,
                title: "Secure & private",
                description: "Your code stays yours. Nothing is stored or shared."
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm font-medium text-violet-400 mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Three simple steps</h2>
            <p className="text-white/50">From idea to implementation in seconds.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Describe", desc: "Tell NxtAI what you want in plain English" },
              { step: "02", title: "Generate", desc: "AI creates production-ready Lua instantly" },
              { step: "03", title: "Deploy", desc: "Assets appear directly in Roblox Studio" },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-white/5 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 translate-x-1/2">
                    <ChevronRight className="w-5 h-5 text-white/10" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Models */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-violet-400 mb-3">MODELS</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Multiple AI models</h2>
            <p className="text-white/50 max-w-md mx-auto">
              Choose from various models optimized for different tasks.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "GPT-4o", desc: "Best for complex logic" },
              { name: "Claude", desc: "Great for explanations" },
              { name: "Gemini", desc: "Fast & efficient" },
              { name: "DeepSeek", desc: "Code specialist" },
            ].map((model, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-colors">
                <div className="font-medium mb-1">{model.name}</div>
                <p className="text-xs text-white/40">{model.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to build?</h2>
          <p className="text-white/50 mb-8">
            Join developers using NxtAI to create amazing Roblox experiences.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span>NxtAI</span>
          </div>
          <span>© {new Date().getFullYear()} NxtAI. Built for Roblox developers.</span>
        </div>
      </footer>
    </div>
  );
}