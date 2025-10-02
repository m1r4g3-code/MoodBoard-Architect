import React, { useState, useCallback, useEffect } from 'react';
import type { Moodboard, VideoLength, StylePreset, Scene, AspectRatio } from './types';
import { generateMoodboard, regenerateFinalPrompt, generateSingleImage } from './services/geminiService';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import MoodboardPanel from './components/MoodboardPanel';
import PromptPanel from './components/PromptPanel';
import AnimatedBackground from './components/AnimatedBackground';

declare const jspdf: any;
declare const html2canvas: any;

type Theme = 'light' | 'dark';

// This function will be the initializer for useState.
// It derives the theme from the DOM state, which is set synchronously by an inline script in index.html.
// This ensures React's initial state matches the initial DOM, preventing hydration errors.
const getInitialThemeFromDOM = (): Theme => {
  if (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  return 'light';
};

const App: React.FC = () => {
  const [storyInput, setStoryInput] = useState<string>('A sleepy teen wakes up late, rushes out, trips on skateboard, comedic beat.');
  const [videoLength, setVideoLength] = useState<VideoLength>('16s');
  const [stylePreset, setStylePreset] = useState<StylePreset>('cinematic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [moodboard, setMoodboard] = useState<Moodboard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialThemeFromDOM);

  // This effect correctly syncs any *changes* to the theme (e.g., from the toggle button)
  // back to the DOM's class and to localStorage for persistence.
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!storyInput.trim()) {
      setError('Please enter a story idea.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMoodboard(null);

    let generatedMoodboard: Moodboard | null = null;
    try {
      // Step 1: Generate the moodboard structure without images.
      generatedMoodboard = await generateMoodboard(storyInput, videoLength, stylePreset, aspectRatio);
      
      // Step 2: Display the moodboard structure immediately.
      setMoodboard({ ...generatedMoodboard, isDirty: false });
      setIsLoading(false); // Turn off main loading spinner.
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
      return; // Stop if structure generation fails.
    }

    // Step 3: Sequentially generate an image for each scene.
    if (generatedMoodboard) {
      const scenesToProcess = [...generatedMoodboard.scenes];

      for (const scene of scenesToProcess) {
        // Set loading state for the current scene's image.
        setMoodboard(prev => {
          if (!prev) return null;
          return {
            ...prev,
            scenes: prev.scenes.map(s => 
              s.id === scene.id ? { ...s, thumbnail_url: 'loading' } : s
            ),
          };
        });

        try {
          // Generate the image.
          const imageUrl = await generateSingleImage(scene.thumbnail_prompt, aspectRatio);
          // Update the scene with the new image URL.
          setMoodboard(prev => {
            if (!prev) return null;
            return {
              ...prev,
              scenes: prev.scenes.map(s => 
                s.id === scene.id ? { ...s, thumbnail_url: imageUrl } : s
              ),
            };
          });
        } catch (imgErr) {
          console.error(`Failed to generate image for scene ${scene.id}:`, imgErr);
          // Update the scene with an error state.
          setMoodboard(prev => {
            if (!prev) return null;
            return {
              ...prev,
              scenes: prev.scenes.map(s => 
                s.id === scene.id ? { ...s, thumbnail_url: 'error' } : s
              ),
            };
          });
        }
      }
    }
  }, [storyInput, videoLength, stylePreset, aspectRatio]);

  const handleSceneUpdate = useCallback((sceneId: string, updatedScene: Scene) => {
    setMoodboard(prev => {
      if (!prev) return null;
      return {
        ...prev,
        isDirty: true,
        scenes: prev.scenes.map(s => s.id === sceneId ? updatedScene : s),
      };
    });
  }, []);

  const handleRegenerateImage = useCallback(async (sceneId: string) => {
    if (!moodboard) return;
    const sceneToUpdate = moodboard.scenes.find(s => s.id === sceneId);
    if (!sceneToUpdate) return;

    // Set loading state for the specific scene's image
    handleSceneUpdate(sceneId, { ...sceneToUpdate, thumbnail_url: 'loading' });

    try {
        const updatedImageUrl = await generateSingleImage(sceneToUpdate.thumbnail_prompt, aspectRatio);
        handleSceneUpdate(sceneId, { ...sceneToUpdate, thumbnail_url: updatedImageUrl });
    } catch(err) {
        console.error(err);
        // Revert to original or show error state
        handleSceneUpdate(sceneId, { ...sceneToUpdate, thumbnail_url: 'error' });
    }
  }, [moodboard, handleSceneUpdate, aspectRatio]);

  const handleUpdatePrompt = useCallback(async () => {
    if (!moodboard) return;
    setIsUpdating(true);
    try {
        const newFinalPrompt = await regenerateFinalPrompt(moodboard);
        setMoodboard(prev => prev ? { ...prev, final_prompt: newFinalPrompt, isDirty: false } : null);
    } catch(err) {
        console.error(err);
        setError("Failed to update the final prompt.");
    } finally {
        setIsUpdating(false);
    }
  }, [moodboard]);

  const handleExportJson = useCallback(() => {
    if (!moodboard) return;
    const { isDirty, ...exportableMoodboard } = moodboard;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportableMoodboard, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `${moodboard.title.replace(/\s+/g, '_').toLowerCase()}.json`;
    link.click();
  }, [moodboard]);

  const handleExportPdf = useCallback(() => {
    if (!moodboard) return;
    const input = document.getElementById('moodboard-content');
    if (!input) return;

    setIsLoading(true);
    setError(null);

    html2canvas(input, {
        backgroundColor: theme === 'dark' ? '#1a1a1f' : '#f9fafb',
        scale: 2, // Higher scale for better quality
        useCORS: true,
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = jspdf;
        
        // Use A4 paper size in points (pt) for standard document format
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Calculate the ratio to fit the image width to the PDF width
        const ratio = pdfWidth / canvasWidth;
        const imgHeight = canvasHeight * ratio;

        let heightLeft = imgHeight;
        let position = 0;
        let page = 1;

        // Add the first page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add new pages if content is taller than one page
        while (heightLeft > 0) {
            position = -pdfHeight * page;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
            page++;
        }

        pdf.save(`${moodboard.title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
        setIsLoading(false);
    }).catch((err: Error) => {
        console.error("PDF generation failed:", err);
        setError("Failed to generate PDF. Please try again.");
        setIsLoading(false);
    });
  }, [moodboard, theme]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground theme={theme} />
      <div className="relative z-0 flex flex-col flex-grow">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <InputPanel
              story={storyInput}
              setStory={setStoryInput}
              length={videoLength}
              setLength={setVideoLength}
              preset={stylePreset}
              setPreset={setStylePreset}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-6">
            <MoodboardPanel
              moodboard={moodboard}
              isLoading={isLoading}
              error={error}
              onSceneUpdate={handleSceneUpdate}
              onRegenerateImage={handleRegenerateImage}
            />
          </div>
          <div className="lg:col-span-3">
            <PromptPanel 
              moodboard={moodboard} 
              onExportJson={handleExportJson}
              onExportPdf={handleExportPdf}
              onUpdatePrompt={handleUpdatePrompt}
              isUpdating={isUpdating}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;