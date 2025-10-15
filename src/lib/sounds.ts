
'use client';

import { GameSettings } from "@/contexts/game-context";

// Create an AudioContext singleton to avoid creating multiple contexts
let audioContext: AudioContext | null = null;
const getAudioContext = () => {
    if (typeof window !== 'undefined' && !audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

// Define sound profiles
const sounds = {
    key: {
        frequency: 440,
        type: 'sine',
        duration: 0.05,
        volume: 0.3
    },
    success: {
        frequency: 660,
        type: 'sine',
        duration: 0.1,
        volume: 0.4
    },
    error: {
        frequency: 220,
        type: 'square',
        duration: 0.15,
        volume: 0.3
    },
};

type SoundType = keyof typeof sounds;

/**
 * Plays a synthesized sound if sound is enabled in settings.
 * @param type The type of sound to play ('key', 'success', 'error').
 * @param settings The current game settings.
 */
export const playSound = (type: SoundType, settings: GameSettings) => {
    if (!settings.enableSound) {
        return;
    }

    const context = getAudioContext();
    if (!context) {
        return;
    }

    const sound = sounds[type];
    const volume = settings.soundVolume * sound.volume;

    // Create Oscillator node
    const oscillator = context.createOscillator();
    oscillator.type = sound.type as OscillatorType;
    oscillator.frequency.setValueAtTime(sound.frequency, context.currentTime);

    // Create Gain node for volume control
    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(volume, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + sound.duration);

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Start and stop the sound
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + sound.duration);
};

    