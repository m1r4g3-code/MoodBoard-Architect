import React, { useState, useCallback } from 'react';
import type { Moodboard } from '../types';
import { CopyIcon, DownloadIcon, CheckIcon, SparklesIcon } from './IconComponents';

interface PromptPanelProps {
  moodboard: Moodboard | null;
  onExportJson: () => void;
  onExportPdf: () => void;
  onUpdatePrompt: () => void;
  isUpdating: boolean;
}

const PromptPanel: React.FC<PromptPanelProps> = ({ moodboard, onExportJson, onExportPdf, onUpdatePrompt, isUpdating }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!moodboard?.final_prompt) return;
    navigator.clipboard.writeText(moodboard.final_prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [moodboard]);

  return (
    <div className="bg-brand-surface-light dark:bg-brand-surface rounded-xl shadow-lg p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-brand-text-light dark:text-brand-text mb-4">3. Final Prompt</h2>
      {moodboard ? (
        <div className="flex flex-col flex-grow">
          {moodboard.isDirty && (
            <div className="mb-4">
               <button
                onClick={onUpdatePrompt}
                disabled={isUpdating}
                className="w-full bg-brand-secondary/80 hover:bg-brand-secondary disabled:bg-teal-300 dark:disabled:bg-teal-800 disabled:cursor-not-allowed text-black font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg text-sm"
              >
                {isUpdating ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <SparklesIcon className="w-5 h-5 mr-2" />
                )}
                Update Prompt
              </button>
               <p className="text-xs text-brand-subtle-light dark:text-brand-subtle mt-2 text-center">Your moodboard has changed. Update the prompt to reflect your edits.</p>
            </div>
          )}
          <div className="bg-gray-50 dark:bg-brand-bg border border-gray-300 dark:border-white/10 rounded-lg p-4 text-xs text-brand-subtle-light dark:text-brand-subtle leading-relaxed flex-grow overflow-y-auto whitespace-pre-wrap font-mono">
            {moodboard.final_prompt}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="bg-brand-primary hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 text-sm"
            >
              {copied ? <CheckIcon className="w-5 h-5 mr-2" /> : <CopyIcon className="w-5 h-5 mr-2" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
             <button
              onClick={onExportJson}
              className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-brand-text-light dark:text-brand-text font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 text-sm"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              JSON
            </button>
             <button
              onClick={onExportPdf}
              className="col-span-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-brand-text-light dark:text-brand-text font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 text-sm"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download as PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center bg-gray-50 dark:bg-brand-bg rounded-lg">
          <p className="text-brand-subtle-light dark:text-brand-subtle text-sm">
            Your generated prompt will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptPanel;