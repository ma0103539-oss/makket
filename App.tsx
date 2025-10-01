import React, { useState } from 'react';
import HomePage from './components/HomePage';
import UploadPage from './components/UploadPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { ToastProvider } from './hooks/useToast';
import ToastContainer from './components/ToastContainer';

type View = 'home' | 'upload';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');

  const navigateToUploader = () => setView('upload');
  const navigateToHome = () => setView('home');

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        <Header onLogoClick={navigateToHome} />
        <main className="flex-grow container mx-auto px-4 py-8">
          {view === 'home' && <HomePage onStart={navigateToUploader} />}
          {view === 'upload' && <UploadPage />}
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </ToastProvider>
  );
};

export default App;
