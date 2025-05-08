import React, { useState } from 'react';
import { VideoCategory } from '../data/detailingData';

interface TrainingVideosProps {
  videoCategories: VideoCategory[];
}

function TrainingVideos({ videoCategories }: TrainingVideosProps) {
  const [activeCategory, setActiveCategory] = useState<string>(videoCategories[0].category);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const selectedCategory = videoCategories.find(cat => cat.category === activeCategory);

  return (
    <div className="apex-card mb-8">
      <h2 className="apex-header-green mb-6 text-center">Gloss Master Academy™ Videos</h2>
      
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {videoCategories.map((category) => (
          <button
            key={category.category}
            onClick={() => handleCategoryChange(category.category)}
            className={`px-3 py-2 rounded-lg text-xs font-orbitron whitespace-nowrap
              ${activeCategory === category.category 
                ? 'bg-green-500 text-black' 
                : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            {category.category}
          </button>
        ))}
      </div>
      
      {selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedCategory.videos.map((video, index) => (
            <div key={index} className="bg-black p-4 rounded-lg">
              <h3 className="text-blue-400 font-orbitron text-md mb-3">{video.title}</h3>
              <div className="relative aspect-video bg-gray-900 mb-3 flex items-center justify-center">
                <a 
                  href={video.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </a>
              </div>
              <a 
                href={video.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="apex-button block text-center"
              >
                Watch Now
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrainingVideos;