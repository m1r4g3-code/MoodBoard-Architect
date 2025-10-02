export type VideoLength = '8s' | '16s' | '30s';
export type StylePreset = 'cinematic' | 'comedy-short' | 'edgy-editorial' | 'childrens-story';

export interface Character {
  name: string;
  age_range: string;
  looks: string;
  clothing: string;
  dominant_emotion: string;
}

export interface Camera {
  angle: string;
  lens: string;
  movement: string;
}

export interface Sound {
  music: string;
  sfx: string;
}

export interface Scene {
  id: string;
  summary: string;
  duration_seconds: number;
  camera: Camera;
  characters: Character[];
  lighting: string;
  color_palette: string[];
  sound: Sound;
  shot_instructions: string[];
  thumbnail_prompt: string;
  thumbnail_url?: string | 'loading' | 'error';
}

export interface Moodboard {
  title: string;
  scenes: Scene[];
  final_prompt: string;
  isDirty?: boolean;
}