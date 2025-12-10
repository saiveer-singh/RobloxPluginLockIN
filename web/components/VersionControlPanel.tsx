"use client";

import { useState } from 'react';
import { useProject } from '@/lib/project-context';
import { Save, RotateCcw, Trash2, X, Clock, MessageSquare } from 'lucide-react';

interface VersionControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VersionControlPanel({ isOpen, onClose }: VersionControlPanelProps) {
  const { versions, saveVersion, restoreVersion, deleteVersion } = useProject();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [versionDescription, setVersionDescription] = useState('');

  const handleSaveVersion = () => {
    if (versionName.trim()) {
      saveVersion(versionName.trim(), versionDescription.trim() || undefined);
      setVersionName('');
      setVersionDescription('');
      setShowSaveDialog(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Version Control</h2>
            <button onClick={onClose} className="p-2 hover:bg-hover rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Project Versions</h3>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors text-sm"
              >
                <Save className="w-4 h-4" />
                Save Version
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {versions.length === 0 ? (
                <div className="text-center py-8 text-secondary">
                  <Save className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No versions saved yet</p>
                  <p className="text-xs">Save your first version to start tracking changes</p>
                </div>
              ) : (
                versions.map((version) => (
                  <div key={version.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{version.name}</h4>
                        {version.description && (
                          <p className="text-sm text-secondary mt-1">{version.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-secondary">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(version.timestamp)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {version.messageCount} messages
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => restoreVersion(version.id)}
                          className="p-1.5 text-secondary hover:text-primary hover:bg-hover rounded transition-colors"
                          title="Restore this version"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteVersion(version.id)}
                          className="p-1.5 text-secondary hover:text-error hover:bg-hover rounded transition-colors"
                          title="Delete this version"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Save Version</h3>
              <button onClick={() => setShowSaveDialog(false)} className="p-1 hover:bg-hover rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Version Name *</label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="e.g., Added leaderboard system"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder-secondary focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description (optional)</label>
                <textarea
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  placeholder="Describe what changed in this version..."
                  rows={3}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder-secondary focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 px-4 py-2 text-secondary hover:bg-hover rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVersion}
                  disabled={!versionName.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Version
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}