import { GoogleGenAI, Type } from "@google/genai";
import type { Moodboard, Scene, VideoLength, StylePreset, AspectRatio } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLengthConstraints = (length: VideoLength): string => {
  switch (length) {
    case '8s':
      return "Produce 2 scenes, total ~8s. Scene durations: 3s, 5s.";
    case '16s':
      return "Produce 3 scenes, total ~16s. Scene durations: 4s, 8s, 4s.";
    case '30s':
      return "Produce 4-5 scenes, total ~30s. Use varied durations.";
    default:
      return "Produce 3 scenes, total ~16s.";
  }
};

const getStyleInstructions = (preset: StylePreset): string => {
  switch (preset) {
    case 'comedy-short':
      return "Visual style: bright, saturated, handheld camera, quick cuts. Tone: comedic, upbeat.";
    case 'edgy-editorial':
      return "Visual style: high contrast, desaturated colors with a single color pop, dramatic shadows, slow/unconventional camera moves. Tone: edgy, mysterious, fashion-forward.";
    case 'childrens-story':
      return "Visual style: soft, pastel colors, whimsical and gentle lighting, smooth camera movements. Tone: innocent, magical, heartwarming.";
    case 'cinematic':
    default:
      return "Visual style: cinematic, balanced composition, professional lighting, filmic colors. Tone: engaging, high-quality.";
  }
};


const systemPrompt = `You are "Moodboard Architect", an assistant that transforms short user story text into a structured JSON moodboard for video generation. Output MUST be valid JSON that matches the schema provided. Do not add extra commentary. If uncertain, pick the more cinematic option. Generate a detailed final prompt suitable for a text-to-video generator like Runway or Pika, including aspect ratio, fps, and specific shot timings. For each scene, also create a concise, visually descriptive prompt suitable for an AI image generator to create a thumbnail.`;

const schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A creative title for the video scene." },
    scenes: {
      type: Type.ARRAY,
      description: "An array of scenes that make up the story.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique identifier for the scene, e.g., 's1'." },
          summary: { type: Type.STRING, description: "A brief, one-sentence summary of the scene." },
          duration_seconds: { type: Type.NUMBER, description: "The duration of this scene in seconds." },
          camera: {
            type: Type.OBJECT,
            properties: {
              angle: { type: Type.STRING, description: "e.g., 'close-up', 'wide shot', 'low angle'." },
              lens: { type: Type.STRING, description: "e.g., '50mm', '24mm'." },
              movement: { type: Type.STRING, description: "e.g., 'static', 'handheld follow', 'slow push-in'." },
            },
            required: ['angle', 'lens', 'movement']
          },
          characters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                age_range: { type: Type.STRING },
                looks: { type: Type.STRING },
                clothing: { type: Type.STRING },
                dominant_emotion: { type: Type.STRING },
              },
              required: ['name', 'age_range', 'looks', 'clothing', 'dominant_emotion']
            }
          },
          lighting: { type: Type.STRING, description: "Describe the lighting, e.g., 'soft morning light', 'dramatic neon'." },
          color_palette: {
            type: Type.ARRAY,
            description: "An array of 3-5 hex color codes that define the scene's mood.",
            items: { type: Type.STRING }
          },
          sound: {
            type: Type.OBJECT,
            properties: {
              music: { type: Type.STRING, description: "Mood or style of music." },
              sfx: { type: Type.STRING, description: "Key sound effects." },
            },
            required: ['music', 'sfx']
          },
          shot_instructions: {
            type: Type.ARRAY,
            description: "Specific directions for how to film the scene.",
            items: { type: Type.STRING }
          },
          thumbnail_prompt: {
            type: Type.STRING,
            description: "A concise, descriptive prompt for an AI image generator to create a visual thumbnail for this scene. e.g., 'cinematic photo, sleepy teenager with messy hair in a sunlit bedroom, groggy expression, dutch angle'."
          },
        },
        required: ['id', 'summary', 'duration_seconds', 'camera', 'characters', 'lighting', 'color_palette', 'sound', 'shot_instructions', 'thumbnail_prompt']
      }
    },
    final_prompt: {
      type: Type.STRING,
      description: "A single, detailed, copy-and-paste ready prompt for a text-to-video AI generator. It must consolidate all scene information into a coherent set of instructions, including timings, camera details, style, and audio cues."
    }
  },
  required: ['title', 'scenes', 'final_prompt']
};

export const generateSingleImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    try {
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `${prompt}, cinematic, high detail, vibrant colors`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
            const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        throw new Error("No image was generated.");
    } catch (error) {
        console.error(`Failed to generate single image:`, error);
        throw error;
    }
};

export const generateMoodboard = async (storyInput: string, length: VideoLength, preset: StylePreset, aspectRatio: AspectRatio): Promise<Moodboard> => {
  const userPrompt = `
    USER_INPUT: "${storyInput}"
    CONSTRAINTS: ${getLengthConstraints(length)} ${getStyleInstructions(preset)} Include a Final Prompt tuned for Runway/Pika: include aspect ratio ${aspectRatio}, 24fps, cinematic lens, and specific music/SFX cues. Output JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    if (!parsedJson.title || !Array.isArray(parsedJson.scenes) || !parsedJson.final_prompt) {
        throw new Error("Invalid JSON structure received from API.");
    }
    
    // Return the moodboard structure without images.
    // The thumbnail_url will be undefined for each scene initially.
    return parsedJson as Moodboard;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate moodboard: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while generating the moodboard.");
  }
};

export const regenerateFinalPrompt = async (moodboard: Moodboard): Promise<string> => {
    const prompt = `
        Given the following JSON data for a video moodboard, generate a new 'final_prompt' that is a detailed, copy-and-paste ready prompt for a text-to-video AI generator like Runway or Pika. It must consolidate all scene information into a coherent set of instructions, including timings, camera details, style, and audio cues.
        
        JSON DATA:
        ${JSON.stringify({title: moodboard.title, scenes: moodboard.scenes}, null, 2)}

        Respond with only the final prompt text, no extra explanations or markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error regenerating final prompt:", error);
        throw new Error("Failed to update the final prompt.");
    }
};