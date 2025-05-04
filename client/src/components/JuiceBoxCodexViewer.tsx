import React, { useState } from 'react';
import { 
  productCategories, 
  trainingVideos as videoCategories,
  sevenDaySchedule,
  detailingKits
} from '../data/detailingData';
import type { Product } from '../data/detailingData';

interface JuiceBoxCodexViewerProps {
  onAddProduct?: (product: Product) => void;
}

function JuiceBoxCodexViewer({ onAddProduct }: JuiceBoxCodexViewerProps) {
  const [activeSection, setActiveSection] = useState<string>('introduction');

  return (
    <div>
      {/* Navigation for Codex sections */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setActiveSection('introduction')}
          className={`px-3 py-2 rounded-lg font-orbitron text-sm whitespace-nowrap
            ${activeSection === 'introduction' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Juice Box™ Intro
        </button>
        <button
          onClick={() => setActiveSection('products')}
          className={`px-3 py-2 rounded-lg font-orbitron text-sm whitespace-nowrap
            ${activeSection === 'products' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Detailing Arsenal
        </button>
        <button
          onClick={() => setActiveSection('loadouts')}
          className={`px-3 py-2 rounded-lg font-orbitron text-sm whitespace-nowrap
            ${activeSection === 'loadouts' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Juice Box™ Loadouts
        </button>
        <button
          onClick={() => setActiveSection('reset')}
          className={`px-3 py-2 rounded-lg font-orbitron text-sm whitespace-nowrap
            ${activeSection === 'reset' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Gloss Reset System™
        </button>
        <button
          onClick={() => setActiveSection('videos')}
          className={`px-3 py-2 rounded-lg font-orbitron text-sm whitespace-nowrap
            ${activeSection === 'videos' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Training Videos
        </button>
      </div>

      {/* Introduction Section */}
      {activeSection === 'introduction' && (
        <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-orbitron text-blue-400 mb-2">🧃 GoTime Juice Box™</h2>
            <p className="text-white text-lg italic mb-4">The curated, real-world-tested, gloss-backed, expert-approved detailing arsenal.</p>
            <p className="text-gray-300">No hype. No noise. Just what works—again and again.</p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-orbitron text-blue-400 mb-4">Why This Isn't Just a List</h3>
            <p className="text-gray-300 mb-2">We don't use products because of packaging.</p>
            <p className="text-gray-300 mb-2">We don't pick based on what's trending.</p>
            <p className="text-gray-300 mb-4">Every item here earned its spot through:</p>
            
            <ul className="text-white grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✅</span> Repetition
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✅</span> Results
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✅</span> Resale readiness
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✅</span> Rhythm fit
              </li>
            </ul>
            
            <p className="text-white mb-2">This is not a wishlist.</p>
            <p className="text-white mb-2">This is the GoTime Juice Box™</p>
            <p className="text-white mb-2">Use this as your build map.</p>
            <p className="text-white">For your garage, your rig, or your rinse routine.</p>
          </div>

          <div className="text-center mt-8">
            <p className="text-white mb-2">What would you like to explore next?</p>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              <button
                onClick={() => setActiveSection('products')}
                className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-md font-orbitron"
              >
                Detailing Arsenal
              </button>
              <button
                onClick={() => setActiveSection('reset')}
                className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-md font-orbitron"
              >
                Gloss Reset System
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Codex Section */}
      {activeSection === 'products' && (
        <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-orbitron text-blue-400 mb-2">Detailing Arsenal</h2>
            <p className="text-white italic">What We Use. Why We Use It. How It Got In the Juice Box™.</p>
          </div>

          {productCategories.map((category, index) => (
            <div key={index} className="mb-10">
              <h3 className="text-xl font-orbitron text-blue-400 border-b border-gray-700 pb-2 mb-4">
                {category.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.products.map((product, idx) => (
                  <div key={idx} className="bg-black p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <a 
                        href={product.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 font-orbitron hover:underline"
                      >
                        {product.name}
                      </a>
                      {product.affiliate && (
                        <span className="bg-green-500 text-black text-xs px-2 py-1 rounded">
                          Partner
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{product.notes}</p>
                    {onAddProduct && (
                      <button
                        onClick={() => onAddProduct(product)}
                        className="bg-green-500 hover:bg-green-400 text-black text-sm px-3 py-1 rounded w-full"
                      >
                        Add to My Juice Box
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loadouts Section */}
      {activeSection === 'loadouts' && (
        <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-orbitron text-blue-400 mb-2">Juice Box™ Loadouts</h2>
            <p className="text-white italic">Build your arsenal by budget and use case</p>
          </div>

          <div className="space-y-8">
            {detailingKits.map((kit, index) => (
              <div key={index} className="bg-black p-5 rounded-lg">
                <h3 className="text-xl font-orbitron text-blue-400 mb-3">{kit.name}</h3>
                <p className="text-white mb-4">{kit.purpose}</p>
                
                <h4 className="text-green-400 font-orbitron text-md mb-3">Included Items:</h4>
                <ul className="space-y-2 mb-6">
                  {kit.contents.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      <span className="text-white">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-right">
                  <button className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-md">
                    Build This Kit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gloss Reset System Section */}
      {activeSection === 'reset' && (
        <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-orbitron text-blue-400 mb-2">The Gloss Reset System™</h2>
            <p className="text-white italic mb-4">7 Days to Bring the Finish Back—No Matter the Condition</p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-orbitron text-blue-400 mb-4">Why You Need a Reset System</h3>
            <p className="text-gray-300 mb-2">Not every car needs a full correction.</p>
            <p className="text-gray-300 mb-2">Not every flip gets weeks of prep.</p>
            <p className="text-gray-300 mb-4">But every finish needs a way back from:</p>
            
            <ul className="text-white grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
              <li className="flex items-center">
                <span className="text-red-400 mr-2">❌</span> Missed maintenance
              </li>
              <li className="flex items-center">
                <span className="text-red-400 mr-2">❌</span> Road grime
              </li>
              <li className="flex items-center">
                <span className="text-red-400 mr-2">❌</span> Gloss loss
              </li>
              <li className="flex items-center">
                <span className="text-red-400 mr-2">❌</span> Seasonal shifts
              </li>
              <li className="flex items-center">
                <span className="text-red-400 mr-2">❌</span> Quick-sale urgency
              </li>
            </ul>
          </div>

          <h3 className="text-xl font-orbitron text-blue-400 mb-4">The GoTime 7-Day Gloss Reset™</h3>
          <p className="text-white mb-4">Use this for:</p>
          <ul className="text-white grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✅</span> Flip cars
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✅</span> Client preps
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✅</span> Post-vacation daily drivers
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✅</span> Cars that "used to pop"
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✅</span> Vehicles going back to lease
            </li>
          </ul>

          <div className="space-y-6 mt-8">
            {sevenDaySchedule.map((day, index) => (
              <div key={index} className="bg-black p-4 rounded-lg">
                <h3 className="text-lg font-orbitron text-blue-400 mb-3">
                  Day {day.day}: {day.title}
                </h3>
                
                <ul className="space-y-2">
                  {day.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      <span className="text-white">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-white italic">
              This system isn't about rushing gloss.<br/>
              It's about respecting it enough to bring it back right.
            </p>
          </div>
        </div>
      )}

      {/* Training Videos Section */}
      {activeSection === 'videos' && (
        <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-orbitron text-blue-400 mb-2">Training Videos</h2>
            <p className="text-white italic">Gloss Master Academy™ Educational Resources</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            <div>
              <h3 className="text-xl font-orbitron text-blue-400 mb-4">Wash Technique</h3>
              <div className="space-y-4">
                {videoCategories.find(cat => cat.category === "Wash Technique")?.videos.map((video, index) => (
                  <div key={index} className="bg-black p-4 rounded-lg">
                    <h4 className="text-blue-400 font-orbitron text-md mb-2">{video.title}</h4>
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
                      className="bg-green-500 hover:bg-green-400 text-black text-sm block text-center py-2 px-4 rounded"
                    >
                      Watch Now
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-orbitron text-blue-400 mb-4">Drying Techniques</h3>
              <div className="space-y-4">
                {videoCategories.find(cat => cat.category === "Drying Techniques")?.videos.map((video, index) => (
                  <div key={index} className="bg-black p-4 rounded-lg">
                    <h4 className="text-blue-400 font-orbitron text-md mb-2">{video.title}</h4>
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
                      className="bg-green-500 hover:bg-green-400 text-black text-sm block text-center py-2 px-4 rounded"
                    >
                      Watch Now
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-orbitron text-blue-400 mb-4">Glass Cleaning</h3>
              <div className="space-y-4">
                {videoCategories.find(cat => cat.category === "Glass Cleaning")?.videos.map((video, index) => (
                  <div key={index} className="bg-black p-4 rounded-lg">
                    <h4 className="text-blue-400 font-orbitron text-md mb-2">{video.title}</h4>
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
                      className="bg-green-500 hover:bg-green-400 text-black text-sm block text-center py-2 px-4 rounded"
                    >
                      Watch Now
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-orbitron text-blue-400 mb-4">Interior Detailing</h3>
              <div className="space-y-4">
                {videoCategories.find(cat => cat.category === "Interior Detailing")?.videos.map((video, index) => (
                  <div key={index} className="bg-black p-4 rounded-lg">
                    <h4 className="text-blue-400 font-orbitron text-md mb-2">{video.title}</h4>
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
                      className="bg-green-500 hover:bg-green-400 text-black text-sm block text-center py-2 px-4 rounded"
                    >
                      Watch Now
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-orbitron text-blue-400 mb-4">Swirl Removal & Correction</h3>
              <div className="space-y-4">
                {videoCategories.find(cat => cat.category === "Swirl Removal & Correction")?.videos?.map((video, index) => (
                  <div key={index} className="bg-black p-4 rounded-lg">
                    <h4 className="text-blue-400 font-orbitron text-md mb-2">{video.title}</h4>
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
                      className="bg-green-500 hover:bg-green-400 text-black text-sm block text-center py-2 px-4 rounded"
                    >
                      Watch Now
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-orbitron text-blue-400 mb-4">Full Video Library</h3>
              <div className="bg-black p-6 rounded-lg flex flex-col items-center justify-center h-full">
                <p className="text-white mb-6 text-center">
                  Access the complete AMMO NYC educational library with detailed guides on every detailing topic
                </p>
                <a 
                  href="https://www.ammonyc.com/videos/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-green-500 hover:bg-green-400 text-black text-md py-3 px-6 rounded-md font-medium"
                >
                  Visit Complete Library
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JuiceBoxCodexViewer;