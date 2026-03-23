import React from 'react';
import SoundLibraryPreview from '../components/SoundLibraryPreview';

const SoundLibraryPage: React.FC = () => {
  return (
    <div className="py-6">
      <header className="mb-8 text-center">
        <h1 className="apex-header text-3xl mb-2">Ambient Sound Design</h1>
        <p className="text-gray-400">
          Premium motorsport sound effects to enhance user experience
        </p>
      </header>
      
      <div className="max-w-5xl mx-auto">
        <SoundLibraryPreview />
      </div>
    </div>
  );
};

export default SoundLibraryPage;