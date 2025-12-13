"use client";

import dynamic from 'next/dynamic';
import { ProjectProvider } from '@/lib/project-context';

const ChatInterface = dynamic(() => import('../ChatInterface'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Loading NxtAI</h2>
                <p className="text-secondary">Preparing your AI workspace...</p>
            </div>
        </div>
    )
});

export default function AppPage() {
    return (
        <ProjectProvider>
            <ChatInterface />
        </ProjectProvider>
    );
}
