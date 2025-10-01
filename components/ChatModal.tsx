import React, { useState, useEffect, useRef } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { SparklesIcon } from './icons/SparklesIcon';

export interface ChatMessage {
  author: 'user' | 'ai';
  content: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onApplyPrompt: (prompt: string) => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, imageSrc, messages, onSendMessage, isLoading, onApplyPrompt }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const extractPrompt = (content: string): string | null => {
    const match = content.match(/\[PROMPT\](.*?)\[\/PROMPT\]/);
    return match ? match[1].trim() : null;
  };

  const lastMessage = messages[messages.length - 1];
  const finalPrompt = lastMessage?.author === 'ai' ? extractPrompt(lastMessage.content) : null;
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999]"
      onClick={onClose}
    >
      <div
        className="bg-base-200 rounded-xl shadow-2xl flex flex-col max-w-4xl w-full h-[90vh] max-h-[700px]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-base-300">
            <h2 className="text-xl font-bold text-white">AI Edit Assistant</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-base-300">
                <XCircleIcon className="w-8 h-8 text-gray-400" />
            </button>
        </header>

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            {/* Image Preview */}
            <div className="w-full md:w-1/2 p-4 bg-base-100 flex items-center justify-center border-b md:border-b-0 md:border-r border-base-300">
                <img src={imageSrc} alt="Editing preview" className="max-w-full max-h-full object-contain rounded-lg" />
            </div>

            {/* Chat Area */}
            <div className="w-full md:w-1/2 flex flex-col h-full">
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => {
                        const isLastMessage = index === messages.length - 1;
                        const isAiTyping = isLastMessage && msg.author === 'ai' && isLoading;

                        return (
                            <div key={index} className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${msg.author === 'user' ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-200'}`}>
                                    {isAiTyping && !msg.content ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                                       </div>
                                    ) : (
                                        msg.content.replace(/\[PROMPT\].*?\[\/PROMPT\]/g, '').trim()
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                
                 {finalPrompt && (
                    <div className="p-4 bg-base-300/50 border-t border-base-300">
                        <p className="text-sm text-gray-300 mb-2">AI has generated a final prompt:</p>
                        <p className="text-sm font-mono bg-base-100 p-2 rounded">"{finalPrompt}"</p>
                        <button 
                            onClick={() => onApplyPrompt(finalPrompt)}
                            className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors inline-flex items-center justify-center gap-2"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Apply This Edit
                        </button>
                    </div>
                )}
                
                <div className="p-4 border-t border-base-300">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g., 'Make the sky galaxy-themed'"
                            className="flex-grow bg-base-300 border border-gray-600 text-white rounded-lg p-2 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-brand-primary p-2 rounded-lg text-white disabled:bg-base-300" disabled={isLoading || !input.trim()}>
                            <PaperAirplaneIcon className="w-6 h-6"/>
                        </button>
                    </form>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;