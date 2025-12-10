"use client";

import dynamic from 'next/dynamic';
import { ProjectProvider } from '@/lib/project-context';

const ChatInterface = dynamic(() => import('./ChatInterface'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  return (
    <ProjectProvider>
      <ChatInterface />
    </ProjectProvider>
  );
}