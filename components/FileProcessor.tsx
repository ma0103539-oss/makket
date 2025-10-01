import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { Chat } from '@google/genai';
import { ProcessedFile, FileStatus, ProcessingMode } from '../types';
import { processImage, createChat } from '../services/geminiService';
import { fileToBase64, formatBytes } from '../utils/fileUtils';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { EyeIcon } from './icons/EyeIcon';
import { ChatBubbleOvalLeftEllipsisIcon } from './icons/ChatBubbleOvalLeftEllipsisIcon';
import ImagePreviewModal from './ImagePreviewModal';
import ChatModal, { ChatMessage } from './ChatModal';


interface FileProcessorProps {
  fileData: ProcessedFile;
  onUpdate: (id: string, updates: Partial<ProcessedFile>) => void;
  onRemove: (id: string) => void;
}

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
);

const FileProcessor: React.FC<FileProcessorProps> = ({ fileData, onUpdate, onRemove }) => {
  const { id, file, previewUrl, status, mode, resultUrl, error } = fileData;
  const [isProcessingTriggered, setIsProcessingTriggered] = useState(false);
  const [isJustCompleted, setIsJustCompleted] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // State for AI Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as ProcessingMode;
    // Reset chat if mode is changed away from custom edit
    if (mode === ProcessingMode.CUSTOM_AI_EDIT && newMode !== ProcessingMode.CUSTOM_AI_EDIT) {
      chatSessionRef.current = null;
      setChatMessages([]);
    }
    onUpdate(id, { mode: newMode, status: FileStatus.PENDING, resultUrl: null, error: null });
  };

  const runProcessing = useCallback(async (customPrompt?: string) => {
    try {
      const base64Image = await fileToBase64(file);
      const resultBase64 = await processImage(base64Image, file.type, mode, customPrompt);
      const blob = await (await fetch(`data:${file.type};base64,${resultBase64}`)).blob();
      const newResultUrl = URL.createObjectURL(blob);

      onUpdate(id, { status: FileStatus.COMPLETED, resultUrl: newResultUrl });
    } catch (e: any) {
      onUpdate(id, { status: FileStatus.ERROR, error: e.message || 'An unknown error occurred.' });
    }
  }, [file, id, mode, onUpdate]);

  useEffect(() => {
    if (status === FileStatus.PROCESSING && !isProcessingTriggered) {
       // Do not auto-run for custom edit, it needs a prompt
      if (mode !== ProcessingMode.CUSTOM_AI_EDIT) {
        setIsProcessingTriggered(true);
        runProcessing();
      }
    }
    if (status === FileStatus.PENDING) {
        setIsProcessingTriggered(false);
    }
    if (status === FileStatus.COMPLETED) {
        setIsJustCompleted(true);
        const timer = setTimeout(() => setIsJustCompleted(false), 2000); // Glow for 2 seconds
        return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, runProcessing, mode]);
  
  const handleOpenChat = async () => {
    setIsChatOpen(true);
    if (!chatSessionRef.current) {
      setIsChatLoading(true);
      try {
        const newChat = createChat();
        chatSessionRef.current = newChat;
        
        setChatMessages([{ author: 'ai', content: 'Hello! How would you like to edit this image?' }]);

      } catch (e) {
        console.error("Failed to start chat session", e);
        setChatMessages([{ author: 'ai', content: 'Sorry, I couldn\'t start the chat session. Please try again.' }]);
      } finally {
        setIsChatLoading(false);
      }
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!chatSessionRef.current) return;

    // Determine if this is the first user message before updating state
    const isFirstMessage = chatMessages.filter(m => m.author === 'user').length === 0;

    const newUserMessage: ChatMessage = { author: 'user', content: message };
    // Add user message and an empty placeholder for the AI's streaming response
    setChatMessages(prev => [...prev, newUserMessage, { author: 'ai', content: '' }]);
    setIsChatLoading(true);

    try {
      const base64Image = await fileToBase64(file);
      
      const streamRequest = isFirstMessage
        ? { message: [{ inlineData: { data: base64Image, mimeType: file.type } }, { text: message }] }
        : { message };

      const stream = await chatSessionRef.current.sendMessageStream(streamRequest);

      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setChatMessages(prev => {
          const newMessages = [...prev];
          const lastMessageIndex = newMessages.length - 1;

          // Ensure we're updating the AI's placeholder message
          if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].author === 'ai') {
            // Immutable update of the last message object
            newMessages[lastMessageIndex] = {
              ...newMessages[lastMessageIndex],
              content: fullResponse,
            };
          }
          return newMessages;
        });
      }
    } catch (e: any) {
      console.error("Chat error:", e);
      setChatMessages(prev => {
        const newMessages = [...prev];
        const lastMessageIndex = newMessages.length - 1;
        if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].author === 'ai') {
          // Immutable update for error message
          newMessages[lastMessageIndex] = {
            ...newMessages[lastMessageIndex],
            content: `Sorry, I encountered an error: ${e.message}`,
          };
        }
        return newMessages;
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleApplyPrompt = (prompt: string) => {
    setIsChatOpen(false);
    onUpdate(id, { status: FileStatus.PROCESSING, resultUrl: null, error: null });
    setIsProcessingTriggered(true);
    runProcessing(prompt);
  };

  const handleProcessClick = () => {
    if (status !== FileStatus.PROCESSING) {
      if (mode === ProcessingMode.CUSTOM_AI_EDIT) {
        handleOpenChat();
      } else {
        onUpdate(id, { status: FileStatus.PROCESSING, resultUrl: null, error: null });
      }
    }
  };

  const getProcessButtonContent = () => {
    if (status === FileStatus.PROCESSING) return 'Processing...';
    if (mode === ProcessingMode.CUSTOM_AI_EDIT) {
      return (
        <>
          <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5"/>
          <span>Describe Edit</span>
        </>
      );
    }
    return (
      <>
        <SparklesIcon className="w-5 h-5"/>
        <span>Process</span>
      </>
    );
  };

  const isProcessButtonDisabled = status === FileStatus.PROCESSING;

  return (
    <>
      <div className={`bg-base-200 rounded-xl p-4 md:p-6 shadow-lg transition-all duration-500 ${isJustCompleted ? 'shadow-green-500/30 ring-2 ring-green-500' : 'ring-0 ring-transparent'}`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Image Display */}
          <div className="md:col-span-5">
              <div className="w-full aspect-video flex items-center justify-center bg-base-100 rounded-lg relative">
                  {status === FileStatus.COMPLETED && resultUrl ? (
                      <img src={resultUrl} alt="Processed Result" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                      <img src={previewUrl} alt="Preview" className={`w-full h-full object-contain rounded-lg transition-opacity ${status === FileStatus.PROCESSING ? 'opacity-20' : 'opacity-100'}`} />
                  )}
                  
                  {status !== FileStatus.COMPLETED && (
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                          {status === FileStatus.PROCESSING && <Spinner />}
                          {status === FileStatus.ERROR && <XCircleIcon className="w-12 h-12 text-red-500" />}
                          {status === FileStatus.PENDING && (
                              <div className="text-center bg-black/40 backdrop-blur-sm p-4 rounded-lg">
                                  <p className="text-sm font-semibold text-gray-200">Ready to Process</p>
                                  <p className="text-xs text-gray-400 mt-1">Select an action & click 'Process'</p>
                              </div>
                          )}
                      </div>
                  )}
              </div>
          </div>

          {/* File Info & Controls */}
          <div className="md:col-span-4 space-y-3">
            <div>
              <p className="text-sm font-semibold truncate text-white" title={file.name}>{file.name}</p>
              <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
            </div>
            <select
              value={mode}
              onChange={handleModeChange}
              disabled={status === FileStatus.PROCESSING}
              className="w-full bg-base-300 border border-gray-600 text-white text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block p-2.5"
            >
              {Object.values(ProcessingMode).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            
            {error && <p className="text-xs text-red-400 bg-red-900/50 p-2 rounded">{error}</p>}
          </div>

          {/* Actions */}
          <div className="md:col-span-3 flex flex-col md:items-end gap-2">
              <div className="flex flex-col sm:flex-row md:flex-col items-center gap-2 w-full">
                  {status !== FileStatus.COMPLETED && (
                      <button
                          onClick={handleProcessClick}
                          disabled={isProcessButtonDisabled}
                          className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-base-300 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                      >
                         {getProcessButtonContent()}
                      </button>
                  )}
                  {status === FileStatus.COMPLETED && resultUrl && (
                      <div className="w-full flex flex-col sm:flex-row md:flex-col gap-2">
                        <button
                          onClick={() => setIsPreviewOpen(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors inline-flex items-center justify-center gap-2 text-center"
                        >
                            <EyeIcon className="w-5 h-5"/>
                            <span>Preview</span>
                        </button>
                        <a
                            href={resultUrl}
                            download={`ai-boost-${file.name}`}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors inline-flex items-center justify-center gap-2 text-center"
                        >
                            <DownloadIcon className="w-5 h-5"/>
                            <span>Download</span>
                        </a>
                      </div>
                  )}
                  <button onClick={() => onRemove(id)} title="Remove file" className="w-full sm:w-auto md:w-full p-2 bg-base-300 hover:bg-red-500/80 rounded-md transition-colors inline-flex items-center justify-center gap-2">
                      <TrashIcon className="w-5 h-5 text-gray-300" />
                       <span className="sm:hidden md:hidden">Remove</span>
                  </button>
              </div>
          </div>
        </div>
      </div>
      {isPreviewOpen && resultUrl && (
        <ImagePreviewModal 
            originalSrc={previewUrl} 
            processedSrc={resultUrl} 
            onClose={() => setIsPreviewOpen(false)} 
        />
      )}
      {isChatOpen && (
        <ChatModal 
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            imageSrc={previewUrl}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            onApplyPrompt={handleApplyPrompt}
        />
      )}
    </>
  );
};

export default FileProcessor;