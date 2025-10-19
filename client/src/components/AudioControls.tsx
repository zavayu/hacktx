import React from 'react';
import { motion } from 'framer-motion';
import { 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon, 
  PlayIcon, 
  StopIcon,
} from '@heroicons/react/24/solid';

interface AudioControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: () => void;
  onStop: () => void;
  disabled?: boolean;
  className?: string;
}

export function AudioControls({
  isPlaying,
  isLoading,
  onPlay,
  onStop,
  disabled = false,
  className = ''
}: AudioControlsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Play/Stop Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={isPlaying ? onStop : onPlay}
        disabled={disabled || isLoading}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center transition-all
          ${disabled 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : isPlaying 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }
        `}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : isPlaying ? (
          <StopIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5 ml-0.5" />
        )}
      </motion.button>

      {/* Audio Status Indicator */}
      <div className="flex items-center gap-1">
        {isPlaying && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-green-500"
          >
            <SpeakerWaveIcon className="w-4 h-4" />
          </motion.div>
        )}
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-purple-500"
          >
            <SpeakerWaveIcon className="w-4 h-4" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface AudioSettingsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export function AudioSettings({ enabled, onToggle, className = '' }: AudioSettingsProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm text-gray-600">Audio:</span>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onToggle(!enabled)}
        className={`
          w-12 h-6 rounded-full flex items-center transition-all
          ${enabled ? 'bg-purple-500' : 'bg-gray-300'}
        `}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-5 h-5 bg-white rounded-full shadow-md"
        />
      </motion.button>
      <span className="text-sm text-gray-600">
        {enabled ? 'On' : 'Off'}
      </span>
    </div>
  );
}
