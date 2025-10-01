
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="bg-base-200/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={onLogoClick}
          >
            <SparklesIcon className="w-8 h-8 text-brand-primary" />
            <h1 className="text-xl font-bold text-white">
              AI Photo Boost
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
