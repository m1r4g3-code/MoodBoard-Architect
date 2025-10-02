import React from 'react';
import {
  FilmIcon as Film,
  SunIcon as Sun,
  MoonIcon as Moon,
  SparklesIcon as Sparkles,
  DocumentDuplicateIcon as Copy,
  CheckIcon as Check,
  ArrowDownTrayIcon as Download,
  CameraIcon as Camera,
  LightBulbIcon as Lightbulb,
  SpeakerWaveIcon as Volume2,
  UserIcon as User,
  SwatchIcon as Palette,
  ListBulletIcon as List,
  ExclamationTriangleIcon as AlertTriangle,
} from '@heroicons/react/24/outline';


// Icons used with explicit className prop, simple alias is enough
export const FilmIcon = Film;
export const SunIcon = Sun;
export const MoonIcon = Moon;
export const SparklesIcon = Sparkles;
export const CopyIcon = Copy;
export const CheckIcon = Check;
export const DownloadIcon = Download;
export const AlertIcon = AlertTriangle;

// Icons used inside a sized container, need to fill it by default.
// They are defined as components to merge provided classNames correctly.
export const CameraIcon: React.FC<{className?: string}> = ({className, ...props}) => (
    <Camera className={`w-full h-full ${className || ''}`.trim()} {...props} />
);
export const LightbulbIcon: React.FC<{className?: string}> = ({className, ...props}) => (
    <Lightbulb className={`w-full h-full ${className || ''}`.trim()} {...props} />
);
export const SoundIcon: React.FC<{className?: string}> = ({className, ...props}) => (
    <Volume2 className={`w-full h-full ${className || ''}`.trim()} {...props} />
);
export const CharacterIcon: React.FC<{className?: string}> = ({className, ...props}) => (
    <User className={`w-full h-full ${className || ''}`.trim()} {...props} />
);
export const PaletteIcon: React.FC<{className?: string}> = ({className, ...props}) => (
    <Palette className={`w-full h-full ${className || ''}`.trim()} {...props} />
);
export const ListIcon: React.FC<{className?: string}> = ({className, ...props}) => (
    <List className={`w-full h-full ${className || ''}`.trim()} {...props} />
);