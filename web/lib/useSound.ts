"use client";

import { useCallback, useRef, useEffect } from 'react';
import { useSettings } from './settings';

// Sound URLs - using Web Audio API tones since we don't have actual audio files
// These will be generated programmatically for a lightweight solution
type SoundType = 'subtle' | 'chime' | 'ping' | 'send';

interface UseSoundReturn {
    playMessageComplete: () => void;
    playSend: () => void;
    playNotification: () => void;
}

export function useSound(): UseSoundReturn {
    const { settings } = useSettings();
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize AudioContext on user interaction
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    // Play a tone using Web Audio API
    const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
        if (!settings.soundEnabled) return;

        try {
            const audioContext = getAudioContext();

            // Resume context if suspended (needed for Chrome autoplay policy)
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

            // Envelope for smooth sound
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Failed to play sound:', e);
        }
    }, [settings.soundEnabled, getAudioContext]);

    // Play a subtle notification - soft low tone
    const playSubtle = useCallback(() => {
        playTone(440, 0.15, 'sine', 0.15); // A4, very soft
    }, [playTone]);

    // Play a chime - pleasant two-tone
    const playChime = useCallback(() => {
        playTone(523.25, 0.1, 'sine', 0.2); // C5
        setTimeout(() => playTone(659.25, 0.15, 'sine', 0.2), 100); // E5
    }, [playTone]);

    // Play a ping - sharper single tone
    const playPing = useCallback(() => {
        playTone(880, 0.12, 'triangle', 0.25); // A5, triangle wave
    }, [playTone]);

    // Play a send sound - quick ascending
    const playSend = useCallback(() => {
        if (!settings.soundEnabled) return;
        playTone(392, 0.08, 'sine', 0.15); // G4
        setTimeout(() => playTone(523.25, 0.08, 'sine', 0.15), 50); // C5
    }, [settings.soundEnabled, playTone]);

    // Play notification based on user's sound preference
    const playNotification = useCallback(() => {
        if (!settings.soundEnabled) return;

        switch (settings.notificationSound) {
            case 'subtle':
                playSubtle();
                break;
            case 'chime':
                playChime();
                break;
            case 'ping':
                playPing();
                break;
            case 'none':
            default:
                // No sound
                break;
        }
    }, [settings.soundEnabled, settings.notificationSound, playSubtle, playChime, playPing]);

    // Play sound when AI message completes
    const playMessageComplete = useCallback(() => {
        if (!settings.soundEnabled) return;
        playNotification();
    }, [settings.soundEnabled, playNotification]);

    return {
        playMessageComplete,
        playSend,
        playNotification,
    };
}

// Helper hook for desktop notifications
export function useDesktopNotification() {
    const { settings } = useSettings();

    const requestPermission = useCallback(async () => {
        if (!settings.desktopNotifications) return false;
        if (!('Notification' in window)) return false;

        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') return false;

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }, [settings.desktopNotifications]);

    const showNotification = useCallback(async (title: string, body: string) => {
        if (!settings.desktopNotifications || !settings.notifyOnComplete) return;
        if (!('Notification' in window)) return;

        // Don't show if page is focused
        if (document.hasFocus()) return;

        if (Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/favicon.ico',
                tag: 'nxtai-notification', // Prevents duplicate notifications
            });
        }
    }, [settings.desktopNotifications, settings.notifyOnComplete]);

    // Request permission when desktopNotifications is enabled
    useEffect(() => {
        if (settings.desktopNotifications) {
            requestPermission();
        }
    }, [settings.desktopNotifications, requestPermission]);

    return {
        requestPermission,
        showNotification,
    };
}
