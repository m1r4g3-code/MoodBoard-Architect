import type { VideoLength, StylePreset, AspectRatio } from './types';

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

export const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string }[] = [
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
];
