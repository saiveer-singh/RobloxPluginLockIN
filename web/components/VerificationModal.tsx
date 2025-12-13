"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Key, Clock, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (userData: { userId: string; displayName: string }) => void;
  initialUserId?: string;
}

interface VerificationData {
  verified: boolean;
  displayName?: string;
  verifiedAt?: number;
  hasActiveCode?: boolean;
  expires?: number;
  message?: string;
}

export function VerificationModal({ isOpen, onClose, onVerificationComplete, initialUserId = "" }: VerificationModalProps) {
  // Ensure initialUserId is always a string
  const [userId, setUserId] = useState(typeof initialUserId === 'string' ? initialUserId : String(initialUserId || ''));

  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<VerificationData | null>(null);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(0);
  const [pollingActive, setPollingActive] = useState(false);

  // Check verification status
  const checkVerificationStatus = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/verify?userId=${userId}`);
      const data: VerificationData = await response.json();

      if (response.ok) {
        setVerificationStatus(data);

        if (data.verified && data.displayName) {
          // Auto-close if verified
          setTimeout(() => {
            onVerificationComplete({
              userId,
              displayName: data.displayName!
            });
            onClose();
          }, 1000);
        }

        // Calculate time until next code refresh
        if (data.expires) {
          const now = Date.now() / 1000;
          const timeLeft = Math.max(0, data.expires - now);
          setTimeUntilRefresh(timeLeft);
        }
      } else {
        setError(data.message || 'Failed to check verification status');
      }
    } catch (err) {
      setError('Network error checking verification status');
      console.error('Verification status check error:', err);
    }
  };

  // Handle verification submission
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim() || !verificationCode.trim()) {
      setError('Please enter both User ID and verification code');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId.trim(),
          code: verificationCode.trim().toUpperCase()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Verification successful
        onVerificationComplete({
          userId: data.userId,
          displayName: data.displayName
        });
        onClose();
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Network error during verification');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Start polling for verification status
  useEffect(() => {
    if (isOpen && userId && !verificationStatus?.verified) {
      setPollingActive(true);

      // Initial check
      checkVerificationStatus();

      // Poll every 2 seconds
      const interval = setInterval(checkVerificationStatus, 2000);

      return () => {
        clearInterval(interval);
        setPollingActive(false);
      };
    }
  }, [isOpen, userId, verificationStatus?.verified]);

  // Countdown timer
  useEffect(() => {
    if (timeUntilRefresh > 0) {
      const timer = setTimeout(() => {
        setTimeUntilRefresh(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeUntilRefresh]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-card border-0 sm:border border-border rounded-none sm:rounded-xl shadow-2xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto animate-scale-in">

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border safe-area-top">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-primary animate-pulse" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Account Verification</h2>
          </div>
          <p className="text-sm text-secondary">
            Enter the verification code from your Roblox game to securely link your account
          </p>
        </div>

        {/* Status */}
        <div className="p-6 border-b border-border">
          {verificationStatus?.verified ? (
            <div className="flex items-center gap-3 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <div>
                <div className="font-medium">Verification Complete</div>
                <div className="text-sm opacity-80">
                  Welcome, {verificationStatus.displayName}!
                </div>
              </div>
            </div>
          ) : verificationStatus?.hasActiveCode ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-blue-500">
                <Clock className="w-5 h-5" />
                <div>
                  <div className="font-medium">Waiting for Verification</div>
                  <div className="text-sm opacity-80">
                    Code active for {formatTime(timeUntilRefresh)}
                  </div>
                </div>
              </div>
              {pollingActive && (
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Checking status automatically...
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-yellow-500">
              <AlertCircle className="w-5 h-5" />
              <div>
                <div className="font-medium">No Active Code</div>
                <div className="text-sm opacity-80">
                  Join Roblox game to generate a verification code
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Roblox User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your Roblox User ID..."
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder-secondary focus:outline-none focus:border-primary transition-colors"
              disabled={verificationStatus?.verified}
            />
            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-400 font-medium mb-1">How to find your User ID:</p>
              <ol className="text-xs text-blue-300/80 space-y-1 list-decimal list-inside">
                <li>Go to your Roblox profile page</li>
                <li>Look at the URL: roblox.com/users/<span className="text-blue-400 font-mono">123456789</span>/profile</li>
                <li>The number is your User ID</li>
              </ol>
            </div>
          </div>

          {/* Game Link */}
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Step 1: Join the verification game</p>
            <a
              href="https://www.roblox.com/games/126061369263728/buy-coins-for-the-tissue-plugin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Shield className="w-4 h-4" />
              Open Verification Game
            </a>
            <p className="text-xs text-secondary mt-2">Click "Get Code" in the game to receive your verification code</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Verification Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code..."
                maxLength={6}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 pr-10 text-foreground placeholder-secondary focus:outline-none focus:border-primary transition-colors font-mono text-center text-lg tracking-wider"
                disabled={verificationStatus?.verified || loading}
              />
              <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            </div>
            <p className="text-xs text-secondary mt-1">
              Code from Roblox game (expires in 15 seconds)
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-card border border-border hover:bg-hover text-foreground rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || verificationStatus?.verified || !userId.trim() || !verificationCode.trim()}
              className="flex-1 px-4 py-3 bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Verify Account
                </>
              )}
            </button>
          </div>

          {verificationStatus?.hasActiveCode && (
            <button
              type="button"
              onClick={checkVerificationStatus}
              className="w-full px-4 py-2 bg-card border border-border hover:bg-hover text-secondary rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh Status
            </button>
          )}
        </form>

        {/* Instructions */}
        <div className="p-6 border-t border-border bg-card/50">
          <h3 className="font-medium text-foreground mb-2">How to Verify:</h3>
          <ol className="text-sm text-secondary space-y-1 list-decimal list-inside">
            <li>Join the Roblox game with the plugin</li>
            <li>Wait for the verification code to appear in chat</li>
            <li>Enter your Roblox User ID above</li>
            <li>Enter the 6-character verification code</li>
            <li>Click "Verify Account" to complete</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
