"use client";
import React from 'react';

export function PreviewModal({ data, onClose }: { data: unknown, onClose: () => void }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card text-foreground rounded-xl w-3/4 h-3/4 flex flex-col overflow-hidden border border-border">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">Asset Preview</h2>
          <button onClick={onClose} className="text-secondary hover:text-foreground">✕</button>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-input font-mono text-sm">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
        <div className="p-4 border-t border-border bg-card flex justify-end gap-2">
            <span className="text-sm text-secondary self-center">
                (This data has been queued for the plugin)
            </span>
            <button onClick={onClose} className="px-4 py-2 bg-primary rounded hover:opacity-80">
                Close
            </button>
        </div>
      </div>
    </div>
  );
}

