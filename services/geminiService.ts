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

const systemPrompt = `You are "Moodboard Architect", an elite AI assistant acting as a professional Hollywood storyboard artist and film director. Your mission is to transform even the briefest story ideas into comprehensive, structured JSON moodboards for high-end video production. Your output must be valid JSON that strictly adheres to the provided schema. Do not add any commentary outside the JSON structure.

Core Directives:
1.  **Infer the Vision:** Analyze the user's input to understand the core story, unspoken tone, and desired outcome (e.g., romantic, epic, comedic, thriller). Your choices must reflect this inferred vision.
2.  **Direct with Authority:** Structure the storyboard with a clear narrative arc: a beginning, middle, and end, even from a short prompt.
3.  **Fill Gaps Creatively:** When details are missing, make smart, cinematic assumptions for camera angles, lighting, mood, pacing, and transitions. Always choose the most visually compelling and emotionally resonant option. Never ask for clarification.
4.  **Masterful Prompts:** For each scene, create a concise, visually descriptive prompt for an AI image generator. The 'final_prompt' must be a masterpiece of prompt engineering, ready for advanced text-to-video platforms (like RunwayML, Pika, Sora), weaving all elements into a professional, actionable script.`;


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
              angle: { type: Type.STRING, description: "Camera angle relative to the subject, e.g., 'eye-level', 'low angle', 'high angle', 'dutch angle'." },
              shot_type: { type: Type.STRING, description: "Framing of the shot, e.g., 'establishing shot', 'wide shot', 'medium shot', 'close-up', 'extreme close-up'." },
              focal_length: { type: Type.STRING, description: "Lens focal length, e.g., '35mm', '85mm portrait', '14mm wide-angle'." },
              aperture: { type: Type.STRING, description: "Aperture setting for depth of field, e.g., 'f/1.4 for shallow depth of field', 'f/16 for deep focus'." },
              shutter_speed: { type: Type.STRING, description: "Shutter speed for motion blur effect, e.g., '1/50s for natural motion', '1/1000s to freeze action'." },
              movement: { type: Type.STRING, description: "e.g., 'static', 'handheld follow', 'slow push-in', 'dolly zoom'." },
            },
            required: ['angle', 'shot_type', 'focal_length', 'aperture', 'shutter_speed', 'movement']
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
      description: `A single, masterful, copy-and-paste ready prompt for a professional text-to-video AI generator (like Sora, Pika, RunwayML). This prompt must be a masterpiece of cinematic language and technical detail. It must:
1.  **Narrative Flow:** Weave all scenes into a single, cohesive narrative. Use clear scene delineations.
2.  **Precise Timing:** Specify exact timestamps for key actions, character expressions, and camera movements (e.g., "@2s, a micro-expression of doubt; @4s, camera begins slow push-in").
3.  **Pro-Level Cinematography:** Detail professional camera and lens choices (e.g., 'shot on ARRI Alexa Mini with 35mm anamorphic lenses'). Specify exact settings like aperture ('f/1.4 for extremely shallow DoF'), shutter speed ('1/120s for cinematic motion blur'), and ISO. Describe complex camera movements ('a dynamic crane shot that swoops down and transitions into a handheld follow').
4.  **Artistic Lighting:** Describe lighting with professional terminology (e.g., 'dramatic chiaroscuro lighting using a single key light', 'soft, diffused light from a large silk', 'golden hour magic light creating long shadows and lens flare').
5.  **Signature Visual Style:** Dictate a specific and opinionated visual style. Mention color grading techniques ('moody teal and orange grade with crushed blacks', 'a bleach bypass process for a gritty, desaturated look'), film stock emulation ('emulating the grain and color science of Kodak Vision3 500T'), and atmospheric effects ('volumetric haze to catch light rays', 'rain-slicked streets reflecting neon signs').
6.  **Evocative Audio Design:** Include a detailed audio plan. Describe the musical score's evolution, specifying instruments and mood. Pinpoint key sound effects (SFX) and their emotional purpose (e.g., 'a single, sharp sound of a breaking glass to punctuate the tension').
7.  **Technical Specs:** Explicitly state the aspect ratio and frames per second (fps).
This prompt should be written as if a seasoned Director of Photography is giving instructions to their crew, leaving no room for ambiguity and aiming for a visually stunning, award-winning result.`
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
    Analyze the following user input for its inherent story, tone, and genre. Then, using that understanding and the provided style preset, create a complete moodboard.
    
    USER_INPUT: "${storyInput}"
    
    STYLE_PRESET: "${preset}" - Use this as a strong guideline, but let the tone of the USER_INPUT override specifics if there's a creative conflict. For example, if the story is dark but the preset is 'comedy', lean into dark comedy.

    CONSTRAINTS: ${getLengthConstraints(length)}. The final video's aspect ratio must be ${aspectRatio} at 24fps. Ensure the final_prompt includes specific music/SFX cues. Output valid JSON only.
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
    // Create a version of the moodboard without the heavy base64 image data to avoid exceeding token limits.
    const moodboardForPrompt = {
        title: moodboard.title,
        scenes: moodboard.scenes.map(scene => {
            const { thumbnail_url, ...sceneWithoutImage } = scene;
            return sceneWithoutImage;
        }),
    };

    const prompt = `
        You are an expert prompt engineer for text-to-video AI models.
        Given the following JSON data for a video moodboard, you must generate a new 'final_prompt' that is a masterpiece of cinematic language and technical detail, ready for platforms like Sora, Pika, or RunwayML.

        The prompt MUST be exceptionally detailed and follow these professional directives:
        1.  **Narrative Flow:** Weave all scenes into a single, cohesive narrative. Use clear scene delineations.
        2.  **Precise Timing:** Specify exact timestamps for key actions, character expressions, and camera movements (e.g., "@2s, a micro-expression of doubt; @4s, camera begins slow push-in").
        3.  **Pro-Level Cinematography:** Detail professional camera and lens choices (e.g., 'shot on ARRI Alexa Mini with 35mm anamorphic lenses'). Specify exact settings like aperture ('f/1.4 for extremely shallow DoF'), shutter speed ('1/120s for cinematic motion blur'), and ISO. Describe complex camera movements ('a dynamic crane shot that swoops down and transitions into a handheld follow').
        4.  **Artistic Lighting:** Describe lighting with professional terminology (e.g., 'dramatic chiaroscuro lighting using a single key light', 'soft, diffused light from a large silk', 'golden hour magic light creating long shadows and lens flare').
        5.  **Signature Visual Style:** Dictate a specific and opinionated visual style. Mention color grading techniques ('moody teal and orange grade with crushed blacks', 'a bleach bypass process for a gritty, desaturated look'), film stock emulation ('emulating the grain and color science of Kodak Vision3 500T'), and atmospheric effects ('volumetric haze to catch light rays', 'rain-slicked streets reflecting neon signs').
        6.  **Evocative Audio Design:** Include a detailed audio plan. Describe the musical score's evolution, specifying instruments and mood. Pinpoint key sound effects (SFX) and their emotional purpose (e.g., 'a single, sharp sound of a breaking glass to punctuate the tension').
        
        The final output should be written as if a seasoned Director of Photography is giving instructions to their crew, leaving no room for ambiguity.

        MOODBOARD JSON DATA:
        ${JSON.stringify(moodboardForPrompt, null, 2)}

        Respond with ONLY the final prompt text. Do not include any extra explanations, labels, or markdown formatting.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error regenerating final prompt:", error);
        if (error instanceof Error && error.message.includes('token count')) {
            throw new Error("The moodboard description is too long to process. Please try shortening some of the text fields.");
        }
        throw new Error("Failed to update the final prompt.");
    }
};