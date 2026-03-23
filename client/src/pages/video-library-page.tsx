import React from 'react';
import JuiceBoxVideoLibrary from '../components/JuiceBoxVideoLibrary';

function VideoLibraryPage() {
  return (
    <div className="p-10 bg-black min-h-screen">
      <h1 className="apex-header text-3xl mb-6 text-center">
        ApexVault™ Video Library
      </h1>
      
      <p className="text-white text-center mb-8">
        Comprehensive training videos for every aspect of car care and detailing.
      </p>
      
      <JuiceBoxVideoLibrary />
    </div>
  );
}

export default VideoLibraryPage;