import React from 'react';
import type { Moodboard, Scene } from '../types';
import SceneCard from './SceneCard';
import { FilmIcon, SparklesIcon } from './IconComponents';

interface MoodboardPanelProps {
  moodboard: Moodboard | null;
  isLoading: boolean;
  error: string | null;
  onSceneUpdate: (sceneId: string, updatedScene: Scene) => void;
  onRegenerateImage: (sceneId: string) => void;
}

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-brand-surface rounded-md w-3/4"></div>
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-gray-100 dark:bg-brand-surface p-4 rounded-lg space-y-3">
        <div className="h-48 bg-gray-200 dark:bg-brand-bg rounded-md w-full"></div>
        <div className="h-6 bg-gray-200 dark:bg-brand-bg rounded-md w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-brand-bg rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-brand-bg rounded-md w-5/6"></div>
      </div>
    ))}
  </div>
);

const WelcomeMessage: React.FC = () => (
  <div className="text-center flex flex-col items-center justify-center h-full p-8 bg-brand-surface-light dark:bg-brand-surface rounded-xl">
    <FilmIcon className="w-16 h-16 text-brand-primary opacity-50 mb-4" />
    <h3 className="text-xl font-bold text-brand-text-light dark:text-brand-text">Welcome to Moodboard Architect</h3>
    <p className="mt-2 text-brand-subtle-light dark:text-brand-subtle max-w-sm">
      Describe your story idea on the left, select a video length, and click 'Generate Moodboard' to see the magic happen.
    </p>
  </div>
);


const MoodboardPanel: React.FC<MoodboardPanelProps> = ({ moodboard, isLoading, error, onSceneUpdate, onRegenerateImage }) => {
  return (
    <div className="bg-brand-surface-light dark:bg-brand-surface rounded-xl shadow-lg p-6 h-full overflow-y-auto" id="moodboard-panel">
      {isLoading && <LoadingSkeleton />}
      {!isLoading && error && (
        <div className="text-center p-8 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <h3 className="font-bold text-lg">Oops! Something went wrong.</h3>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      )}
      {!isLoading && !error && !moodboard && <WelcomeMessage />}
      {!isLoading && !error && moodboard && (
        <div id="moodboard-content">
          <h2 className="text-2xl font-bold text-brand-text-light dark:text-brand-text mb-2 flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2 text-brand-secondary" />
            {moodboard.title}
          </h2>
          <p className="text-brand-subtle-light dark:text-brand-subtle mb-6 border-b border-gray-200 dark:border-white/10 pb-4">
            Total Length: {moodboard.scenes.reduce((acc, s) => acc + s.duration_seconds, 0)}s
          </p>
          <div className="space-y-4">
            {moodboard.scenes.map((scene, index) => (
              <SceneCard 
                key={scene.id} 
                scene={scene} 
                sceneNumber={index + 1} 
                onUpdate={onSceneUpdate}
                onRegenerateImage={onRegenerateImage}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodboardPanel;