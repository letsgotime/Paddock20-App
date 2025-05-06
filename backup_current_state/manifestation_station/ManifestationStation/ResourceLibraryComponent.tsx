import React, { useState, useRef } from 'react';
import { Goal, GoalMedia } from '../../types/manifestation';
import { 
  PlusCircle, 
  Trash2, 
  Link as LinkIcon,
  ExternalLink,
  Video,
  Camera,
  Image as ImageIcon,
  Edit,
  Search,
  Youtube,
  Folder,
  ArrowUpRight,
  RefreshCw,
  PlayCircle,
  InfoIcon,
  Clock
} from 'lucide-react';

interface ResourceLibraryComponentProps {
  goal: Goal;
  onUpdate: (updatedGoal: Goal) => void;
}

type ResourceCategory = 'websites' | 'videos' | 'photos';
type ResourceEntry = GoalMedia & {
  isEditing?: boolean;
};

const ResourceLibraryComponent: React.FC<ResourceLibraryComponentProps> = ({ goal, onUpdate }) => {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('websites');
  const [showBeforeAfterPrompt, setShowBeforeAfterPrompt] = useState<boolean>(false);
  const [takingPhoto, setTakingPhoto] = useState<boolean>(false);
  
  // New resource form state
  const [newResource, setNewResource] = useState({
    name: '',
    url: '',
    description: '',
    type: 'link' as 'link' | 'video' | 'image',
    tags: [] as string[]
  });
  
  // Refs for file inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize media gallery if it doesn't exist
  if (!goal.mediaGallery) {
    goal.mediaGallery = [];
  }
  
  // Get resources filtered by category
  const getResourcesByCategory = (category: ResourceCategory): ResourceEntry[] => {
    switch (category) {
      case 'websites':
        return goal.mediaGallery.filter(media => media.type === 'link') as ResourceEntry[];
      case 'videos':
        return goal.mediaGallery.filter(media => media.type === 'video') as ResourceEntry[];
      case 'photos':
        return goal.mediaGallery.filter(media => media.type === 'image') as ResourceEntry[];
      default:
        return [] as ResourceEntry[];
    }
  };
  
  // Get filtered resources
  const filteredResources = getResourcesByCategory(activeCategory);
  
  // Check if before photo exists
  const hasBeforePhoto = goal.mediaGallery.some(media => 
    media.type === 'image' && media.tags?.includes('before'));
  
  // Get daily progress photos (for the last week)
  const progressPhotos = goal.mediaGallery
    .filter(media => media.type === 'image' && media.tags?.includes('progress'))
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 7); // Last 7 days
  
  // Functions to handle resources
  
  // Add a new resource
  const handleAddResource = () => {
    if (!newResource.name.trim() || (activeCategory !== 'photos' && !newResource.url.trim())) return;
    
    const updatedGoal = { ...goal };
    
    // Create new media item for the resource
    const newMedia: GoalMedia = {
      id: Date.now(),
      type: newResource.type,
      name: newResource.name.trim(),
      url: newResource.url.trim(),
      description: newResource.description,
      dateAdded: new Date().toISOString(),
      tags: newResource.tags
    };
    
    // Add to media gallery
    updatedGoal.mediaGallery.push(newMedia);
    
    // Update the goal
    onUpdate(updatedGoal);
    
    // Reset form
    setNewResource({
      name: '',
      url: '',
      description: '',
      type: activeCategory === 'websites' ? 'link' : 
            activeCategory === 'videos' ? 'video' : 'image',
      tags: []
    });
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // For the demo, we'll just use a placeholder URL
    // In a real app, you would upload this to a storage service
    const objectUrl = URL.createObjectURL(file);
    
    // Update new resource form with file info
    setNewResource({
      ...newResource,
      name: file.name,
      url: objectUrl,
      type,
      tags: type === 'image' ? ['progress'] : []
    });
    
    // Clean up the file input
    event.target.value = '';
  };
  
  // Take a photo
  const capturePhoto = (type: 'before' | 'progress' | 'after') => {
    setTakingPhoto(true);
    
    // For demo purposes, we'll just open the file upload dialog
    // In a real app, you would access the device camera
    if (photoInputRef.current) {
      photoInputRef.current.click();
      
      // Add appropriate tag
      setNewResource({
        ...newResource,
        type: 'image',
        tags: [type]
      });
    }
  };
  
  // Delete a resource
  const handleDeleteResource = (resourceId: number) => {
    const updatedGoal = { ...goal };
    
    // Find the resource index
    const resourceIndex = updatedGoal.mediaGallery.findIndex(media => media.id === resourceId);
    
    if (resourceIndex !== -1) {
      // Remove the resource
      updatedGoal.mediaGallery.splice(resourceIndex, 1);
      
      // Update the goal
      onUpdate(updatedGoal);
    }
  };
  
  // Edit a resource
  const startEditing = (resourceId: number) => {
    const updatedResources = filteredResources.map(resource => 
      resource.id === resourceId ? { ...resource, isEditing: true } : { ...resource, isEditing: false }
    );
    
    // Update local state
    filteredResources.forEach((resource, index) => {
      if (resource.id === resourceId) {
        filteredResources[index].isEditing = true;
      } else {
        filteredResources[index].isEditing = false;
      }
    });
  };
  
  // Parse YouTube URL to get embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Check if it's already an embed URL
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Regular YouTube URL
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : null;
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Determine if a URL is a YouTube link
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-xl text-blue-400 font-orbitron mb-4">RESOURCE LIBRARY</h3>
      
      {/* Category selection */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveCategory('websites')}
          className={`flex-1 py-2 rounded-t-lg ${activeCategory === 'websites' 
            ? 'bg-blue-900 text-blue-400 font-semibold border-b-2 border-blue-400' 
            : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
        >
          <div className="flex items-center justify-center">
            <LinkIcon className="h-4 w-4 mr-1" />
            <span>Websites</span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveCategory('videos')}
          className={`flex-1 py-2 rounded-t-lg ${activeCategory === 'videos' 
            ? 'bg-blue-900 text-blue-400 font-semibold border-b-2 border-blue-400' 
            : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
        >
          <div className="flex items-center justify-center">
            <Video className="h-4 w-4 mr-1" />
            <span>Videos</span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveCategory('photos')}
          className={`flex-1 py-2 rounded-t-lg ${activeCategory === 'photos' 
            ? 'bg-blue-900 text-blue-400 font-semibold border-b-2 border-blue-400' 
            : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
        >
          <div className="flex items-center justify-center">
            <ImageIcon className="h-4 w-4 mr-1" />
            <span>Photos</span>
          </div>
        </button>
      </div>
      
      {/* Description based on category */}
      <div className="mb-4 p-3 bg-gray-800 rounded-md">
        <p className="text-sm text-gray-300">
          {activeCategory === 'websites' && 
            "Save important websites, articles, and online resources related to your dream. Store reference links for easy access."}
          {activeCategory === 'videos' && 
            "Collect inspirational or educational videos from YouTube and other platforms. Build your motivation library."}
          {activeCategory === 'photos' && 
            "Track your progress with photos. Capture daily updates, before/after comparisons, and visual inspiration for your dream."}
        </p>
      </div>
      
      {/* Before/After Photo Prompt (shown on initial load or when requested) */}
      {activeCategory === 'photos' && (showBeforeAfterPrompt || (!hasBeforePhoto && filteredResources.length === 0)) && (
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-md">
          <h4 className="text-blue-400 font-medium mb-2 flex items-center">
            <InfoIcon className="h-4 w-4 mr-2" />
            Capture Your Starting Point
          </h4>
          <p className="text-sm text-gray-300 mb-3">
            Taking a "before" photo now will help you track your progress and celebrate your transformation when you reach your goal.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => capturePhoto('before')}
              className="flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded"
            >
              <Camera className="h-4 w-4 mr-2" />
              <span>Take Before Photo</span>
            </button>
            <button
              onClick={() => setShowBeforeAfterPrompt(false)}
              className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
            >
              Skip
            </button>
          </div>
        </div>
      )}
      
      {/* Photo Actions (only shown for photos category) */}
      {activeCategory === 'photos' && !takingPhoto && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => capturePhoto('progress')}
            className="flex items-center py-1.5 px-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-sm"
          >
            <Camera className="h-3.5 w-3.5 mr-1.5" />
            <span>Daily Progress Photo</span>
          </button>
          
          {hasBeforePhoto && (
            <button
              onClick={() => capturePhoto('after')}
              className="flex items-center py-1.5 px-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-sm"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              <span>Take After Photo</span>
            </button>
          )}
          
          <button
            onClick={() => photoInputRef.current?.click()}
            className="flex items-center py-1.5 px-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-sm"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
            <span>Upload Photo</span>
            <input 
              type="file"
              accept="image/*"
              ref={photoInputRef}
              onChange={(e) => handleFileUpload(e, 'image')}
              className="hidden"
            />
          </button>
        </div>
      )}
      
      {/* Resource List */}
      <div className="space-y-2 mb-6">
        <h4 className="text-gray-300 text-sm font-medium border-b border-gray-700 pb-1 mb-2">
          {activeCategory === 'websites' && 'Saved Websites & Links'}
          {activeCategory === 'videos' && 'Educational & Inspirational Videos'}
          {activeCategory === 'photos' && 'Progress Photos'}
        </h4>
        
        {filteredResources.length === 0 ? (
          <div className="text-gray-500 text-sm py-6 text-center bg-gray-800/50 rounded-md">
            <p className="mb-2 font-medium">No {activeCategory} added yet</p>
            <p className="text-xs max-w-md mx-auto">
              {activeCategory === 'websites' && 'Add important websites and online resources to support your dream journey.'}
              {activeCategory === 'videos' && 'Save videos from YouTube and other platforms for motivation and learning.'}
              {activeCategory === 'photos' && 'Track your progress with photos. Take daily updates to visualize your journey.'}
            </p>
          </div>
        ) : (
          <div className={`
            ${activeCategory === 'photos' ? 'grid grid-cols-2 md:grid-cols-3 gap-3' : 'space-y-3'} 
            max-h-96 overflow-y-auto pr-1`
          }>
            {/* Websites Display */}
            {activeCategory === 'websites' && filteredResources.map(resource => (
              <div 
                key={resource.id} 
                className="flex items-start p-3 rounded bg-gray-800 shadow-sm"
              >
                <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded flex items-center justify-center mr-3">
                  <LinkIcon className="h-4 w-4 text-blue-400" />
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-medium">{resource.name}</h4>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center mt-1"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-xs">{resource.url}</span>
                      </a>
                    </div>
                    
                    <div className="flex space-x-1 ml-2">
                      <button 
                        onClick={() => startEditing(resource.id)}
                        className="text-gray-400 hover:text-white"
                        title="Edit resource"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteResource(resource.id)}
                        className="text-gray-400 hover:text-red-500"
                        title="Remove resource"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {resource.description && (
                    <p className="text-gray-400 text-sm mt-2">
                      {resource.description}
                    </p>
                  )}
                  
                  {/* Date Added */}
                  <div className="text-xs text-gray-500 mt-2 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Saved on {formatDate(resource.dateAdded)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Videos Display */}
            {activeCategory === 'videos' && filteredResources.map(resource => (
              <div 
                key={resource.id} 
                className="p-3 rounded bg-gray-800 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium">{resource.name}</h4>
                  
                  <div className="flex space-x-1 ml-2">
                    <button 
                      onClick={() => startEditing(resource.id)}
                      className="text-gray-400 hover:text-white"
                      title="Edit resource"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteResource(resource.id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Remove resource"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Video Embed */}
                <div className="relative pt-[56.25%] w-full bg-gray-900 rounded overflow-hidden mb-2">
                  {isYouTubeUrl(resource.url) ? (
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={getYouTubeEmbedUrl(resource.url)}
                      title={resource.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center text-blue-400 hover:text-blue-300"
                      >
                        <PlayCircle className="h-12 w-12" />
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Description */}
                {resource.description && (
                  <p className="text-gray-400 text-sm mb-2">
                    {resource.description}
                  </p>
                )}
                
                {/* Date Added */}
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Saved on {formatDate(resource.dateAdded)}</span>
                </div>
              </div>
            ))}
            
            {/* Photos Display */}
            {activeCategory === 'photos' && filteredResources.map(resource => (
              <div 
                key={resource.id} 
                className="rounded bg-gray-800 shadow-sm overflow-hidden flex flex-col"
              >
                {/* Photo */}
                <div className="relative w-full pt-[100%] bg-gray-900">
                  <img
                    src={resource.url}
                    alt={resource.name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                  
                  {/* Tags as badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {resource.tags?.includes('before') && (
                      <span className="text-xs bg-blue-800 text-white px-1.5 py-0.5 rounded">Before</span>
                    )}
                    {resource.tags?.includes('after') && (
                      <span className="text-xs bg-green-800 text-white px-1.5 py-0.5 rounded">After</span>
                    )}
                    {resource.tags?.includes('progress') && (
                      <span className="text-xs bg-purple-800 text-white px-1.5 py-0.5 rounded">Progress</span>
                    )}
                  </div>
                  
                  {/* Controls */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button 
                      onClick={() => handleDeleteResource(resource.id)}
                      className="bg-gray-900/70 hover:bg-red-900/70 text-white p-1 rounded-full"
                      title="Delete photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                
                {/* Photo Info */}
                <div className="p-2">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{formatDate(resource.dateAdded)}</span>
                  </div>
                  
                  {/* Description */}
                  {resource.description && (
                    <p className="text-gray-300 text-xs mt-1 truncate">
                      {resource.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add New Resource Form */}
      {!takingPhoto && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">
            {activeCategory === 'websites' && 'Add New Website'}
            {activeCategory === 'videos' && 'Add New Video'}
            {activeCategory === 'photos' && 'Upload Photo'}
          </h4>
          
          <div className="space-y-3">
            {/* Website/Video Form */}
            {(activeCategory === 'websites' || activeCategory === 'videos') && (
              <>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    placeholder={`Enter ${activeCategory === 'websites' ? 'website' : 'video'} name`}
                    value={newResource.name}
                    onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {activeCategory === 'websites' ? 'URL' : 'Video URL'}
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder={activeCategory === 'websites' 
                        ? 'https://example.com' 
                        : 'https://youtube.com/watch?v=...'}
                      value={newResource.url}
                      onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                      className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-l text-white text-sm"
                    />
                    <button
                      className="bg-gray-700 border border-gray-600 border-l-0 rounded-r px-3 text-gray-400 hover:text-white"
                      title={activeCategory === 'websites' ? 'Open URL' : 'Test video URL'}
                      onClick={() => window.open(newResource.url, '_blank')}
                    >
                      {activeCategory === 'websites' ? 
                        <ExternalLink className="h-4 w-4" /> : 
                        <Youtube className="h-4 w-4" />
                      }
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
                  <textarea
                    placeholder={`Add notes about this ${activeCategory === 'websites' ? 'website' : 'video'}`}
                    value={newResource.description}
                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm h-20 resize-none"
                  />
                </div>
              </>
            )}
            
            {/* Photo Upload Form */}
            {activeCategory === 'photos' && (
              <>
                {newResource.url ? (
                  // Preview uploaded photo
                  <div className="mb-3">
                    <div className="relative w-full pt-[56.25%] bg-gray-900 rounded overflow-hidden mb-2">
                      <img
                        src={newResource.url}
                        alt="Preview"
                        className="absolute top-0 left-0 w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">{newResource.name}</span>
                      <button
                        onClick={() => setNewResource({ ...newResource, url: '', name: '' })}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  // Upload controls
                  <div className="flex justify-center items-center bg-gray-900 rounded-lg p-6 mb-3">
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="flex flex-col items-center text-gray-400 hover:text-blue-400"
                    >
                      <PlusCircle className="h-12 w-12 mb-2" />
                      <span className="text-sm">Click to upload photo</span>
                      <span className="text-xs text-gray-500">JPEG, PNG</span>
                      <input 
                        type="file"
                        accept="image/*"
                        ref={photoInputRef}
                        onChange={(e) => handleFileUpload(e, 'image')}
                        className="hidden"
                      />
                    </button>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Description (optional)</label>
                  <textarea
                    placeholder="Add notes about this photo"
                    value={newResource.description}
                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm h-16 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Photo Type</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setNewResource({
                        ...newResource,
                        tags: ['progress']
                      })}
                      className={`py-1 px-3 rounded-full text-xs ${
                        newResource.tags?.includes('progress')
                          ? 'bg-purple-900 text-purple-200'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Progress Photo
                    </button>
                    
                    <button
                      onClick={() => setNewResource({
                        ...newResource,
                        tags: ['before']
                      })}
                      className={`py-1 px-3 rounded-full text-xs ${
                        newResource.tags?.includes('before')
                          ? 'bg-blue-900 text-blue-200'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Before Photo
                    </button>
                    
                    <button
                      onClick={() => setNewResource({
                        ...newResource,
                        tags: ['after']
                      })}
                      className={`py-1 px-3 rounded-full text-xs ${
                        newResource.tags?.includes('after')
                          ? 'bg-green-900 text-green-200'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      After Photo
                    </button>
                    
                    <button
                      onClick={() => setNewResource({
                        ...newResource,
                        tags: ['inspiration']
                      })}
                      className={`py-1 px-3 rounded-full text-xs ${
                        newResource.tags?.includes('inspiration')
                          ? 'bg-yellow-900 text-yellow-200'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Inspiration
                    </button>
                  </div>
                </div>
              </>
            )}
            
            <button
              onClick={handleAddResource}
              disabled={!newResource.name.trim() || (activeCategory !== 'photos' && !newResource.url.trim())}
              className={`w-full py-2 rounded flex items-center justify-center ${
                (newResource.name.trim() && (activeCategory === 'photos' || newResource.url.trim()))
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              <span>
                {activeCategory === 'websites' && 'Add Website'}
                {activeCategory === 'videos' && 'Add Video'}
                {activeCategory === 'photos' && 'Upload Photo'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceLibraryComponent;