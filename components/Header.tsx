import React from 'react';
import { FilmIcon, SunIcon, MoonIcon } from './IconComponents';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="bg-brand-surface-light/80 dark:bg-brand-surface/50 backdrop-blur-sm border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <FilmIcon className="h-8 w-8 text-brand-primary" />
            <h1 className="text-xl font-bold text-brand-text-light dark:text-brand-text tracking-tight">
              Moodboard Architect
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-brand-subtle-light dark:text-brand-subtle hidden md:block">AI-Powered Video Storyboarding</p>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-brand-subtle-light dark:text-brand-subtle hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-5 w-5" />
              ) : (
                <SunIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;