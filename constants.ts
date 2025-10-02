import type { VideoLength, StylePreset } from './types';

export const VIDEO_LENGTH_OPTIONS: { value: VideoLength; label: string }[] = [
  { value: '8s', label: '8 seconds' },
  { value: '16s', label: '16 seconds' },
  { value: '30s', label: '30 seconds' },
];

export const STYLE_PRESET_OPTIONS: { value: StylePreset; label: string }[] = [
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'comedy-short', label: 'Comedy' },
  { value: 'edgy-editorial', label: 'Edgy' },
  { value: 'childrens-story', label: 'Children\'s' },
];