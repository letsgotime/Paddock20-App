import React, { useState, useEffect } from 'react';

interface GalleryImage {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  featured?: boolean;
}

const MotorsportsGallery: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  // Gallery images with paths to the public folder
  const images: GalleryImage[] = [
    {
      src: '/assets/gallery/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg',
      alt: 'Ferrari 458 With HRE P101 Wheels',
      title: 'Ferrari 458',
      description: 'Custom HRE P101 wheels by TAG Motorsports',
      featured: true
    },
    {
      src: '/assets/gallery/ferrari-mountain-road.png',
      alt: 'Ferrari on mountain road',
      title: 'Mountain Run',
      description: 'Precision engineering meets the perfect road'
    },
    {
      src: '/assets/gallery/ferrari-f1.png',
      alt: 'Ferrari F1 Race Car',
      title: 'F1 Heritage',
      description: 'The pinnacle of motorsport engineering'
    },
    {
      src: '/assets/gallery/ferrari-desert.png',
      alt: 'Ferrari in the desert',
      title: 'Desert Drive',
      description: 'Performance in any environment'
    },
    {
      src: '/assets/gallery/mclaren-4184249_1280.jpg',
      alt: 'McLaren supercar',
      title: 'McLaren Excellence',
      description: 'British engineering at its finest'
    },
    {
      src: '/assets/gallery/porsche-911-gt2-5795128_1280.jpg',
      alt: 'Porsche 911 GT2',
      title: 'Porsche 911 GT2',
      description: 'German precision and track-ready performance'
    },
    {
      src: '/assets/gallery/race-car-8338236_1280.jpg',
      alt: 'Professional race car',
      title: 'Track Dominance',
      description: 'Where seconds matter and precision is everything'
    },
    {
      src: '/assets/gallery/redbull-f1-motion.jpg',
      alt: 'Red Bull F1 car in motion',
      title: 'Speed Captured',
      description: 'The art of aerodynamics and velocity',
      featured: true
    }
  ];

  // Auto-advance the gallery
  useEffect(() => {
    if (isHovering) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images.length, isHovering]);

  // Get featured image for main display
  const featuredImage = images.find(img => img.featured) || images[0];
  const activeImage = images[activeIndex];

  return (
    <div 
      className="motorsports-gallery w-full rounded-xl overflow-hidden bg-gradient-to-br from-black to-gray-900 border border-blue-900/30 shadow-xl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Featured image with F1-style telemetry overlay */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img 
          src={activeImage.src} 
          alt={activeImage.alt}
          className="w-full h-full object-cover object-center transition-all duration-700 ease-in-out"
        />
        
        {/* F1-style telemetry overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="mb-4">
              <h3 className="text-white font-orbitron text-2xl">{activeImage.title}</h3>
              <p className="text-gray-300 text-sm">{activeImage.description}</p>
            </div>
            
            {/* F1-style telemetry data bar */}
            <div className="bg-black/60 rounded px-4 py-2 backdrop-blur-sm border border-blue-900/30">
              <div className="flex justify-between text-xs">
                <div>
                  <span className="text-blue-400">SESSION</span>
                  <span className="text-white ml-2">LIVE</span>
                </div>
                <div>
                  <span className="text-blue-400">SECTOR</span>
                  <span className="text-white ml-2">S3</span>
                </div>
                <div>
                  <span className="text-blue-400">DELTA</span>
                  <span className="text-green-500 ml-2">-0.153</span>
                </div>
                <div>
                  <span className="text-blue-400">ERS</span>
                  <span className="text-white ml-2">83%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Thumbnail gallery navigation */}
      <div className="px-4 py-3 bg-black/80">
        <h4 className="text-blue-400 text-xs uppercase tracking-wider mb-3">GoTime Motorsports Gallery</h4>
        <div className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-all ${activeIndex === index ? 'ring-2 ring-blue-500 scale-105' : 'opacity-60 hover:opacity-100'}`}
            >
              <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MotorsportsGallery;