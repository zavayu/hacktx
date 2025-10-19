import { useState, useCallback, useRef, useEffect } from 'react';
import { speakText, textToSpeech, playAudio, type TTSOptions, audioPreloader } from './textToSpeech';

export interface UseTextToSpeechOptions {
  enabled?: boolean;
  voiceSettings?: TTSOptions;
  preload?: boolean;
}

export interface UseTextToSpeechReturn {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  speak: (text: string) => Promise<void>;
  stop: () => void;
  preload: (text: string) => Promise<void>;
  clearCache: () => void;
}

/**
 * React hook for text-to-speech functionality
 */
export function useTextToSpeech(options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn {
  const { enabled = true, voiceSettings = {}, preload = false } = options;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentSourceRef.current) {
        currentSourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!enabled || !text.trim()) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      // Stop any currently playing audio
      stop();
      
      // Set up audio context for stopping
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Generate audio buffer for tracking
      const audioBuffer = await textToSpeech(text, voiceSettings);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      currentSourceRef.current = source;
      
      // Handle audio end
      source.onended = () => {
        setIsPlaying(false);
        currentSourceRef.current = null;
      };
      
      source.start();
      setIsPlaying(true);
      
    } catch (err) {
      console.error('Error in speak:', err);
      setError(err instanceof Error ? err.message : 'Failed to play audio');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, voiceSettings, preload, stop]);

  const preloadText = useCallback(async (text: string) => {
    if (!enabled || !text.trim()) return;
    
    try {
      await audioPreloader.preload(text, voiceSettings);
    } catch (err) {
      console.error('Error preloading audio:', err);
    }
  }, [enabled, voiceSettings]);

  const clearCache = useCallback(() => {
    audioPreloader.clearCache();
  }, []);

  return {
    isPlaying,
    isLoading,
    error,
    speak,
    stop,
    preload: preloadText,
    clearCache,
  };
}
