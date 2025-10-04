import React, { useState } from 'react';
import type { Scene } from '../types';
import { CameraIcon, CharacterIcon, LightbulbIcon, SoundIcon, PaletteIcon, ListIcon, SparklesIcon, AlertIcon } from './IconComponents';

interface SceneCardProps {
  scene: Scene;
  sceneNumber: number;
  onUpdate: (sceneId: string, updatedScene: Scene) => void;
  onRegenerateImage: (sceneId: string) => void;
}

const EditableField: React.FC<{ value: string, onChange: (newValue: string) => void, isTextArea?: boolean }> = ({ value, onChange, isTextArea=false }) => {
    const commonClasses = "w-full bg-gray-100/50 dark:bg-brand-surface/50 p-1 rounded-md text-brand-subtle-light dark:text-brand-subtle focus:bg-white dark:focus:bg-brand-bg focus:text-brand-text-light dark:focus:text-brand-text focus:ring-1 focus:ring-brand-primary outline-none transition";
    if (isTextArea) {
        return <textarea value={value} onChange={(e) => onChange(e.target.value)} className={`${commonClasses} resize-y min-h-[40px]`} />;
    }
    return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={commonClasses} />;
};

const SceneCard: React.FC<SceneCardProps> = ({ scene, sceneNumber, onUpdate, onRegenerateImage }) => {
  const [isImageLoading, setIsImageLoading] = useState(false);

  const handleUpdate = (field: keyof Scene | keyof Scene['camera'] | keyof Scene['sound'] | keyof Scene['characters'][0], value: any, subField?: keyof Scene, charIndex?: number) => {
    let updatedScene = { ...scene };
    if (subField === 'camera') {
      updatedScene.camera = { ...updatedScene.camera, [field]: value };
    } else if (subField === 'sound') {
        updatedScene.sound = { ...updatedScene.sound, [field]: value };
    } else if (subField === 'characters' && charIndex !== undefined) {
        updatedScene.characters = updatedScene.characters.map((c, i) => i === charIndex ? { ...c, [field]: value } : c);
    } else {
      updatedScene = { ...updatedScene, [field]: value };
    }
    onUpdate(scene.id, updatedScene);
  };

  const handleRegenImage = () => {
      setIsImageLoading(true);
      onRegenerateImage(scene.id);
      // Loading state will be managed by props now
  };

  return (
    <div className="bg-white/50 dark:bg-brand-bg/50 border border-gray-200 dark:border-white/10 rounded-lg transition-shadow hover:shadow-2xl hover:border-brand-primary/50 overflow-hidden">
      <div className="relative">
        {scene.thumbnail_url && scene.thumbnail_url !== 'loading' && scene.thumbnail_url !== 'error' && (
            <img 
              src={scene.thumbnail_url} 
              alt={`Visual for scene ${sceneNumber}: ${scene.summary}`}
              className="w-full h-48 object-cover" 
            />
        )}
        {scene.thumbnail_url === 'loading' && (
             <div className="w-full h-48 bg-gray-100 dark:bg-brand-surface flex items-center justify-center">
                 <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
             </div>
        )}
         {scene.thumbnail_url === 'error' && (
             <div className="w-full h-48 bg-red-100 dark:bg-red-900/20 flex flex-col items-center justify-center text-red-500 dark:text-red-400">
                 <AlertIcon className="w-8 h-8 mb-2" />
                 <span className="text-sm">Image failed</span>
             </div>
        )}
        <button 
            onClick={handleRegenImage}
            className="absolute top-2 right-2 bg-black/50 hover:bg-brand-primary text-white p-2 rounded-full transition-all backdrop-blur-sm"
            title="Regenerate Image"
        >
            <SparklesIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-brand-primary">Scene {sceneNumber}</h3>
          <span className="bg-brand-primary/20 text-brand-primary text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            {scene.duration_seconds}s
          </span>
        </div>
        <div className="mb-5">
          <EditableField value={scene.summary} onChange={(val) => handleUpdate('summary', val)} isTextArea />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-5 h-5 mr-2 text-brand-secondary"><CameraIcon /></div>
              <span className="font-semibold text-brand-text-light dark:text-brand-text text-sm">Camera Details</span>
            </div>
            <div className="pl-7 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <EditableField value={scene.camera.shot_type} onChange={(val) => handleUpdate('shot_type', val, 'camera')} />
                <EditableField value={scene.camera.angle} onChange={(val) => handleUpdate('angle', val, 'camera')} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <EditableField value={scene.camera.focal_length} onChange={(val) => handleUpdate('focal_length', val, 'camera')} />
                <EditableField value={scene.camera.aperture} onChange={(val) => handleUpdate('aperture', val, 'camera')} />
                <EditableField value={scene.camera.shutter_speed} onChange={(val) => handleUpdate('shutter_speed', val, 'camera')} />
              </div>
              <EditableField value={scene.camera.movement} onChange={(val) => handleUpdate('movement', val, 'camera')} />
            </div>
          </div>
          <div className="flex items-center">
              <div className="flex-shrink-0 w-5 h-5 mr-2 text-brand-secondary"><LightbulbIcon/></div>
              <EditableField value={scene.lighting} onChange={(val) => handleUpdate('lighting', val)} />
          </div>
          <div className="flex items-center">
              <div className="flex-shrink-0 w-5 h-5 mr-2 text-brand-secondary"><SoundIcon/></div>
              <EditableField value={scene.sound.music} onChange={(val) => handleUpdate('music', val, 'sound')} />
              <EditableField value={scene.sound.sfx} onChange={(val) => handleUpdate('sfx', val, 'sound')} />
          </div>
          <div className="flex items-center">
              <div className="flex-shrink-0 w-5 h-5 mr-2 text-brand-secondary"><PaletteIcon /></div>
                <div className="inline-flex items-center space-x-1.5 ml-1">
                  {scene.color_palette.map((color) => (
                    <div
                      key={color}
                      className="w-4 h-4 rounded-full border border-gray-300 dark:border-white/20"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
          </div>

          {scene.characters.map((char, index) => (
            <div key={index} className="md:col-span-2 bg-gray-100/50 dark:bg-brand-surface/50 p-3 rounded-md flex items-start">
              <div className="flex-shrink-0 w-5 h-5 mr-2 text-brand-secondary"><CharacterIcon /></div>
              <div className="w-full space-y-1">
                <EditableField value={char.name} onChange={(val) => handleUpdate('name', val, 'characters', index)} />
                <EditableField value={`${char.age_range}, ${char.looks}, wearing ${char.clothing}. Emotion: ${char.dominant_emotion}`} onChange={(val) => {
                    // This is a simplified handler. A more robust solution might split these into individual fields.
                    const parts = val.split(', ');
                    handleUpdate('looks', parts.slice(1).join(', '), 'characters', index)
                }} isTextArea />
              </div>
            </div>
          ))}
          
          <div className="md:col-span-2 flex items-start">
              <div className="flex-shrink-0 w-5 h-5 mr-2 text-brand-secondary"><ListIcon /></div>
               <div className="w-full">
                 <span className="font-semibold text-brand-text-light dark:text-brand-text text-sm">Shot Instructions:</span>
                 <EditableField value={scene.shot_instructions.join('\n')} onChange={(val) => handleUpdate('shot_instructions', val.split('\n'))} isTextArea />
               </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SceneCard;