import React, { useState, useEffect } from 'react';

interface Video {
  title: string;
  link: string;
}

interface VideoCategory {
  category: string;
  videos: Video[];
}

function JuiceBoxVideoLibrary() {
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        setIsLoading(true);
        const response = await fetch('/data/VideoLibrary.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch Video Library: ${response.status}`);
        }
        const data = await response.json();
        setVideoCategories(data);
        setError(null);
      } catch (err) {
        console.error('Error loading Video Library:', err);
        setError('Could not load the Video Library. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchVideos();
  }, []);

  return (
    <div className="apex-card">
      <h2 className="apex-header-green mb-6 text-center">Juice Box™ Video Library</h2>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading Video Library...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <p className="text-gray-400 mt-2">
            The Video Library will be available soon. In the meantime, you can browse our other sections.
          </p>
        </div>
      )}

      {!isLoading && !error && videoCategories.length > 0 && videoCategories.map((category, index) => (
        <div key={index} className="mb-10">
          <h3 className="text-blue-400 font-orbitron text-lg uppercase mb-4">{category.category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {category.videos.map((video, idx) => (
              <div key={idx} className="bg-black p-4 rounded-lg shadow-md">
                <a 
                  href={video.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 font-orbitron text-md hover:underline flex items-center"
                >
                  <svg 
                    className="h-6 w-6 mr-2 text-red-500" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                  {video.title}
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default JuiceBoxVideoLibrary;