import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { ChatBubbleOvalLeftEllipsisIcon } from './icons/ChatBubbleOvalLeftEllipsisIcon';

interface HomePageProps {
  onStart: () => void;
}

const FeatureCard: React.FC<{ title: string, description: string, icon: React.ReactNode }> = ({ title, description, icon }) => (
    <div className="bg-base-200 p-6 rounded-lg">
        <div className="flex items-center gap-4">
            <div className="bg-brand-primary/20 text-brand-primary p-2 rounded-md">{icon}</div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="mt-2 text-gray-400">{description}</p>
    </div>
);


const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
  return (
    <div className="text-center py-16 sm:py-24">
      <div className="inline-flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full text-sm text-brand-primary mb-4">
        <SparklesIcon className="w-5 h-5" />
        <span>Powered by Gemini AI</span>
      </div>
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
        Free AI Image Enhancer & Transformer
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
        Upscale quality, remove unwanted objects, and apply stunning artistic effects to your photos. 100% free, no sign-up required.
      </p>
      <div className="mt-10">
        <button
          onClick={onStart}
          className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 inline-flex items-center gap-2"
        >
          <span>Start for Free</span>
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>

       <div className="mt-20 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mb-8">What can you do?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
                title="Enhance & Upscale" 
                description="Fix blurry photos, improve colors, and increase resolution up to 8K with incredible detail." 
                icon={<MagicWandIcon className="w-6 h-6"/>}
            />
            <FeatureCard 
                title="Auto Retouch" 
                description="Automatically remove watermarks, text, and other distracting objects. You can also easily remove image backgrounds." 
                icon={<MagicWandIcon className="w-6 h-6"/>}
            />
             <FeatureCard 
                title="AI Chat & Artistic Styles" 
                description="Describe your edit in plain English using our AI assistant, or transform photos into cartoons, anime, and more." 
                icon={<ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6"/>}
            />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
