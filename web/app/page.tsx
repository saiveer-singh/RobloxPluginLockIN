"use client";
import { useState, useEffect } from 'react';
import { Search, Grid, List, Settings, MessageSquare, Plus } from 'lucide-react';
import { ASSETS, Asset, AssetCategory } from '@/lib/assets';
import { SettingsPanel } from '@/components/SettingsPanel'; // Keeping this if it exists
import { useSession, signIn, signOut } from 'next-auth/react'; // Keeping auth logic

// If these components don't exist in the new structure, we might need to remove them or stub them
// But based on previous read, they exist.
// We will focus on the Catalog UI.

export default function Home() {
  const [activeTab, setActiveTab] = useState<AssetCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filtering logic
  const filteredAssets = ASSETS.filter(asset => {
    const matchesTab = activeTab === 'All' || asset.category === activeTab;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const categories: AssetCategory[] = ['All', 'Transit', 'Furniture', 'Structure', 'Prop'];

  return (
    <div className="flex h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-secondary)] px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">Object Library</h1>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-secondary-foreground)]" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 rounded bg-[var(--color-input)] pl-9 pr-4 text-sm text-[var(--color-foreground)] placeholder-[var(--color-secondary-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
           {/* Customization / AI Toggle Placeholder */}
          <button
            className="flex items-center gap-2 rounded bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            onClick={() => alert("Open AI Generator (Customizability Feature)")}
          >
            <Plus className="h-4 w-4" />
            <span>Custom Generator</span>
          </button>

          <div className="h-6 w-px bg-[var(--color-border)] mx-2"></div>

          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[var(--color-hover)] text-white' : 'text-[var(--color-secondary-foreground)] hover:text-white'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
             onClick={() => setViewMode('list')}
             className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[var(--color-hover)] text-white' : 'text-[var(--color-secondary-foreground)] hover:text-white'}`}
          >
            <List className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="ml-2 p-1.5 text-[var(--color-secondary-foreground)] hover:text-white"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] bg-[var(--color-background)] px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === cat
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-secondary-foreground)] hover:text-white'
            }`}
          >
            {cat}
            {activeTab === cat && (
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[var(--color-primary)]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {filteredAssets.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-[var(--color-secondary-foreground)]">
            <Search className="h-12 w-12 opacity-20 mb-4" />
            <p>No assets found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid'
              ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
              : 'flex flex-col gap-2'
            }
          `}>
            {filteredAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} viewMode={viewMode} />
            ))}
          </div>
        )}
      </main>

      {/* Status Bar */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-secondary)] px-4 py-1 text-xs text-[var(--color-secondary-foreground)] flex justify-between">
        <span>Ready</span>
        <span>{filteredAssets.length} items</span>
      </footer>

      {/* Keep Settings Panel if it works, otherwise we need to fix imports */}
       {/* <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} /> */}
    </div>
  );
}

function AssetCard({ asset, viewMode }: { asset: Asset; viewMode: 'grid' | 'list' }) {
  const Icon = asset.icon;

  if (viewMode === 'list') {
    return (
      <div className="group flex items-center gap-4 rounded border border-[var(--color-card)] bg-[var(--color-card)] p-2 hover:border-[var(--color-primary)] hover:bg-[var(--color-hover)] cursor-pointer transition-all">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-[var(--color-background)] text-[var(--color-secondary-foreground)] group-hover:text-white">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="truncate font-medium text-[var(--color-foreground)]">{asset.name}</h3>
          <p className="truncate text-xs text-[var(--color-secondary-foreground)]">{asset.description}</p>
        </div>
        <span className="text-xs text-[var(--color-secondary-foreground)] px-2 py-1 rounded bg-[var(--color-background)]">
          {asset.category}
        </span>
      </div>
    );
  }

  return (
    <div className="group flex flex-col rounded border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden hover:border-[var(--color-primary)] hover:shadow-lg cursor-pointer transition-all">
      {/* Thumbnail Area */}
      <div className="aspect-square w-full bg-[var(--color-input)] flex items-center justify-center p-6 text-[var(--color-secondary-foreground)] group-hover:text-white transition-colors relative">
        <Icon className="h-full w-full opacity-50 group-hover:scale-110 transition-transform duration-200" />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="px-3 py-1 bg-[var(--color-primary)] text-white text-xs font-bold rounded">Insert</span>
        </div>
      </div>

      {/* Label Area */}
      <div className="p-2 border-t border-[var(--color-border)] bg-[var(--color-card)]">
        <h3 className="truncate text-sm font-medium text-[var(--color-foreground)]" title={asset.name}>{asset.name}</h3>
        <p className="truncate text-xs text-[var(--color-secondary-foreground)]" title={asset.category}>{asset.category}</p>
      </div>
    </div>
  );
}
