// ElevenLabs Text-to-Speech Service
// Using REST API directly for better compatibility

// Available voices (you can customize these)
export const VOICES = {
  MONSTER_FRIENDLY: 'EXAVITQu4vr4xnSDxMaL', // Bella - friendly, warm
  MONSTER_EXCITED: 'VR6AewLTigWG4xSOukaG', // Arnold - energetic
  MONSTER_CALM: 'AZnzlk1XvdvUeBnXmlld', // Domi - calm, professional
  MONSTER_WISE: 'MF3mGyEYCl7XYWbV9V6O', // Elli - wise, mature
} as const;

export type VoiceId = typeof VOICES[keyof typeof VOICES];

export interface TTSOptions {
  voiceId?: VoiceId;
  modelId?: string;
  voiceSettings?: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}

/**
 * Convert text to speech using ElevenLabs REST API
 */
export async function textToSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<AudioBuffer> {
  try {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not found');
    }

    const {
      voiceId = VOICES.MONSTER_FRIENDLY,
      modelId = 'eleven_multilingual_v2',
      voiceSettings = {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.0,
        useSpeakerBoost: true,
      },
    } = options;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: modelId,
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    return audioBuffer;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech');
  }
}

/**
 * Play audio buffer
 */
export async function playAudio(audioBuffer: AudioBuffer): Promise<void> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (error) {
    console.error('Error playing audio:', error);
    throw new Error('Failed to play audio');
  }
}

/**
 * Generate and play text-to-speech in one function
 */
export async function speakText(
  text: string,
  options: TTSOptions = {}
): Promise<void> {
  try {
    const audioBuffer = await textToSpeech(text, options);
    await playAudio(audioBuffer);
  } catch (error) {
    console.error('Error in speakText:', error);
    throw error;
  }
}

/**
 * Get available voices from ElevenLabs
 */
export async function getAvailableVoices() {
  try {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not found');
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Error fetching voices:', error);
    return [];
  }
}

/**
 * Preload audio for better performance
 */
export class AudioPreloader {
  private cache = new Map<string, AudioBuffer>();

  async preload(text: string, options: TTSOptions = {}): Promise<void> {
    const key = `${text}-${JSON.stringify(options)}`;
    if (!this.cache.has(key)) {
      try {
        const audioBuffer = await textToSpeech(text, options);
        this.cache.set(key, audioBuffer);
      } catch (error) {
        console.error('Error preloading audio:', error);
      }
    }
  }

  async play(text: string, options: TTSOptions = {}): Promise<void> {
    const key = `${text}-${JSON.stringify(options)}`;
    const audioBuffer = this.cache.get(key);
    
    if (audioBuffer) {
      await playAudio(audioBuffer);
    } else {
      // Fallback to direct generation
      await speakText(text, options);
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Export a default instance
export const audioPreloader = new AudioPreloader();
