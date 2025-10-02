import React from 'react';
import type { VideoLength, StylePreset } from '../types';
import { VIDEO_LENGTH_OPTIONS, STYLE_PRESET_OPTIONS } from '../constants';
import { SparklesIcon } from './IconComponents';

interface InputPanelProps {
  story: string;
  setStory: (story: string) => void;
  length: VideoLength;
  setLength: (length: VideoLength) => void;
  preset: StylePreset;
  setPreset: (preset: StylePreset) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const InputPanel: React.FC<InputPanelProps> = ({ story, setStory, length, setLength, preset, setPreset, onGenerate, isLoading }) => {
  return (
    <div className="bg-brand-surface-light dark:bg-brand-surface rounded-xl shadow-lg p-6 space-y-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-brand-text-light dark:text-brand-text">1. Describe Your Vision</h2>
      <div className="flex-grow flex flex-col">
        <label htmlFor="story-input" className="text-sm font-medium text-brand-subtle-light dark:text-brand-subtle mb-2">
          Enter a scene, idea, or story
        </label>
        <textarea
          id="story-input"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="e.g., A robot chef comically fails at making a simple pancake."
          className="w-full flex-grow bg-gray-50 dark:bg-brand-bg border border-gray-300 dark:border-white/10 rounded-lg p-3 text-sm text-brand-text-light dark:text-brand-text focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 resize-none"
          rows={8}
        />
      </div>
      <div>
        <label htmlFor="video-length" className="text-sm font-medium text-brand-subtle-light dark:text-brand-subtle mb-2 block">
          Target Video Length
        </label>
        <div className="grid grid-cols-3 gap-2">
          {VIDEO_LENGTH_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLength(option.value)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                length === option.value
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-gray-100 dark:bg-brand-bg hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
       <div>
        <label htmlFor="style-preset" className="text-sm font-medium text-brand-subtle-light dark:text-brand-subtle mb-2 block">
          Visual Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STYLE_PRESET_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreset(option.value)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 truncate ${
                preset === option.value
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-gray-100 dark:bg-brand-bg hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full bg-brand-primary hover:bg-purple-600 disabled:bg-purple-400 dark:disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg transform hover:scale-105"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Generate Moodboard
          </>
        )}
      </button>
    </div>
  );
};

export default InputPanel;