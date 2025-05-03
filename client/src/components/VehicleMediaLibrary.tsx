import React, { useState, useEffect } from 'react';
import { 
  Image, Film, FileText, Bookmark, FolderOpen,
  Download, Share2, Search, Filter, ChevronDown,
  Trash2, Eye, Edit, Plus, Grid, List, ExternalLink
} from 'lucide-react';
import { Vehicle } from '../contexts/VehicleContext';

// Define media item types
export interface MediaItem {
  id: string;
  vehicleId: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  name: string;
  description?: string;
  tags: string[];
  category: string;
  createdAt: string;
  size?: number;
  duration?: number; // For videos
  fileType?: string; // For documents
}

// Mock data service - in a real implementation, this would fetch from your API/database
const getVehicleMedia = (vehicleId: string): MediaItem[] => {
  // This would be replaced with actual API calls
  const mediaItems: MediaItem[] = [];
  
  // Generate some mock images
  for (let i = 0; i < 5; i++) {
    mediaItems.push({
      id: `img_${vehicleId}_${i}`,
      vehicleId,
      type: 'image',
      url: `/assets/vehicle-images/sample-${i + 1}.jpg`,
      thumbnail: `/assets/vehicle-images/sample-${i + 1}-thumb.jpg`,
      name: `Vehicle Photo ${i + 1}`,
      description: i % 2 === 0 ? 'Front angle shot' : 'Side profile shot',
      tags: ['exterior', i % 2 === 0 ? 'front' : 'side'],
      category: 'vehicle-shots',
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      size: 1200000 + (i * 100000)
    });
  }
  
  // Add some detailing related images
  for (let i = 0; i < 3; i++) {
    mediaItems.push({
      id: `det_${vehicleId}_${i}`,
      vehicleId,
      type: 'image',
      url: `/assets/detailing/detail-${i + 1}.jpg`,
      thumbnail: `/assets/detailing/detail-${i + 1}-thumb.jpg`,
      name: `Detailing Progress ${i + 1}`,
      description: 'Documenting detailing work',
      tags: ['detailing', 'paint', 'gloss'],
      category: 'detailing',
      createdAt: new Date(Date.now() - (i + 10) * 86400000).toISOString(),
      size: 1500000 + (i * 120000)
    });
  }
  
  // Add a couple of videos
  mediaItems.push({
    id: `vid_${vehicleId}_1`,
    vehicleId,
    type: 'video',
    url: `/assets/videos/drive-clip-1.mp4`,
    thumbnail: `/assets/videos/drive-clip-1-thumb.jpg`,
    name: 'Mountain Drive Footage',
    description: 'Scenic drive through the mountains',
    tags: ['driving', 'scenic', 'mountains'],
    category: 'drives',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    size: 25000000,
    duration: 145 // seconds
  });
  
  mediaItems.push({
    id: `vid_${vehicleId}_2`,
    vehicleId,
    type: 'video',
    url: `/assets/videos/engine-sound.mp4`,
    thumbnail: `/assets/videos/engine-sound-thumb.jpg`,
    name: 'Engine Sound After Mod',
    description: 'Capturing the sound after exhaust modification',
    tags: ['engine', 'sound', 'exhaust', 'modifications'],
    category: 'modifications',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    size: 18000000,
    duration: 65 // seconds
  });
  
  // Add some documents
  mediaItems.push({
    id: `doc_${vehicleId}_1`,
    vehicleId,
    type: 'document',
    url: `/assets/documents/maintenance-log.pdf`,
    name: 'Maintenance Records',
    description: 'Complete maintenance history',
    tags: ['maintenance', 'service', 'records'],
    category: 'maintenance',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    size: 2500000,
    fileType: 'pdf'
  });
  
  mediaItems.push({
    id: `doc_${vehicleId}_2`,
    vehicleId,
    type: 'document',
    url: `/assets/documents/mod-specs.pdf`,
    name: 'Modification Specifications',
    description: 'Technical details of installed mods',
    tags: ['modifications', 'specs', 'technical'],
    category: 'modifications',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    size: 1800000,
    fileType: 'pdf'
  });
  
  return mediaItems;
};

// Utility for formatting file sizes
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(1) + ' GB';
};

// Utility for formatting duration
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

interface VehicleMediaLibraryProps {
  vehicle: Vehicle;
  category?: string;
  onSelectMedia?: (media: MediaItem) => void;
  compact?: boolean;
  maxItems?: number;
}

const VehicleMediaLibrary: React.FC<VehicleMediaLibraryProps> = ({
  vehicle,
  category,
  onSelectMedia,
  compact = false,
  maxItems
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(category || 'all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // Fetch media on component mount and when vehicle changes
  useEffect(() => {
    const fetchedMedia = getVehicleMedia(vehicle.id);
    setMediaItems(fetchedMedia);
    
    // Apply initial filtering
    let filtered = [...fetchedMedia];
    if (category) {
      filtered = filtered.filter(item => item.category === category);
    }
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }
    setFilteredItems(filtered);
  }, [vehicle.id, category, maxItems]);
  
  // Handle search and filtering
  useEffect(() => {
    let filtered = [...mediaItems];
    
    // Apply category filter if not showing all
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }
    
    // Apply search term filtering
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        (item.description?.toLowerCase().includes(term)) ||
        item.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Apply max items limitation
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }
    
    setFilteredItems(filtered);
  }, [mediaItems, searchTerm, activeCategory, maxItems]);
  
  // Get unique categories from media items
  const categories = ['all', ...new Set(mediaItems.map(item => item.category))];
  
  // Handle media item click
  const handleMediaClick = (media: MediaItem) => {
    if (onSelectMedia) {
      onSelectMedia(media);
    } else {
      // Default preview behavior if no selection handler provided
      if (media.type === 'image') {
        window.open(media.url, '_blank');
      } else if (media.type === 'video') {
        // Open video in a modal or new window
        window.open(media.url, '_blank');
      } else if (media.type === 'document') {
        // Open document
        window.open(media.url, '_blank');
      }
    }
  };
  
  if (compact) {
    return (
      <div className="bg-gray-900/60 border border-blue-900/30 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-blue-400 font-orbitron text-sm flex items-center">
            <FolderOpen size={16} className="mr-2" />
            Vehicle Media
          </h3>
          <button className="text-blue-300 hover:text-blue-100 text-xs">
            View All
          </button>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="text-center py-3 text-gray-400 text-sm">
            No media found for this vehicle
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filteredItems.slice(0, 6).map(item => (
              <div 
                key={item.id}
                className="bg-black/50 rounded overflow-hidden cursor-pointer relative group"
                onClick={() => handleMediaClick(item)}
              >
                {item.type === 'image' && (
                  <img 
                    src={item.thumbnail || item.url} 
                    alt={item.name}
                    className="w-full h-16 object-cover"
                  />
                )}
                
                {item.type === 'video' && (
                  <div className="relative w-full h-16 bg-gray-800">
                    {item.thumbnail ? (
                      <img 
                        src={item.thumbnail} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Film size={20} className="text-blue-400" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/70 text-xs text-white px-1 rounded">
                      {item.duration ? formatDuration(item.duration) : ''}
                    </div>
                  </div>
                )}
                
                {item.type === 'document' && (
                  <div className="flex items-center justify-center h-16 bg-gray-800">
                    <FileText size={24} className="text-amber-400" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye size={16} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900/60 border border-blue-900/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-blue-400 font-orbitron text-lg flex items-center">
          <FolderOpen size={18} className="mr-2" />
          Vehicle Media Library
        </h3>
        
        <div className="flex space-x-2">
          <button 
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-800 text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <Grid size={18} />
          </button>
          <button 
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-800 text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
        <div className="relative flex-grow">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="relative">
          <button
            className="flex items-center space-x-1 bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white hover:bg-gray-700"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Filter size={16} />
            <span>Filter</span>
            <ChevronDown size={14} />
          </button>
          
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 min-w-[200px]">
              <div className="p-2 border-b border-gray-700">
                <h4 className="text-sm text-gray-400">Categories</h4>
              </div>
              <div className="p-2 max-h-[300px] overflow-y-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`block w-full text-left px-3 py-2 rounded ${activeCategory === cat ? 'bg-blue-900/50 text-blue-200' : 'text-white hover:bg-gray-700'}`}
                    onClick={() => {
                      setActiveCategory(cat);
                      setShowFilterMenu(false);
                    }}
                  >
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4">
          <Plus size={16} />
          <span>Add Media</span>
        </button>
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
          <FolderOpen size={48} className="text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg text-gray-300 mb-2">No Media Found</h4>
          <p className="text-gray-400 max-w-md mx-auto">
            No media items match your current search or filter criteria. Try different search terms or clear filters.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map(item => (
            <div 
              key={item.id}
              className="bg-gray-800/60 rounded-lg overflow-hidden group cursor-pointer"
              onClick={() => handleMediaClick(item)}
            >
              <div className="relative h-32">
                {item.type === 'image' && (
                  <img 
                    src={item.thumbnail || item.url} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {item.type === 'video' && (
                  <div className="relative w-full h-full bg-gray-800">
                    {item.thumbnail ? (
                      <img 
                        src={item.thumbnail} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Film size={32} className="text-blue-400" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-xs text-white px-1.5 py-0.5 rounded">
                      {item.duration ? formatDuration(item.duration) : ''}
                    </div>
                  </div>
                )}
                
                {item.type === 'document' && (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-800">
                    <FileText size={32} className="text-amber-400 mb-2" />
                    <span className="text-xs text-gray-400 uppercase bg-gray-900 px-2 py-0.5 rounded">
                      {item.fileType}
                    </span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <button className="p-1.5 bg-blue-600 rounded-full">
                      <Eye size={16} className="text-white" />
                    </button>
                    <button className="p-1.5 bg-gray-700 rounded-full">
                      <Download size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <h4 className="text-white text-sm font-medium truncate">{item.name}</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-blue-300">
                    {item.type === 'video' && item.duration ? 
                      formatDuration(item.duration) : 
                      item.size ? formatFileSize(item.size) : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="text-left p-3 text-gray-400 text-sm font-medium">Name</th>
                <th className="text-left p-3 text-gray-400 text-sm font-medium">Type</th>
                <th className="text-left p-3 text-gray-400 text-sm font-medium">Category</th>
                <th className="text-left p-3 text-gray-400 text-sm font-medium">Date</th>
                <th className="text-left p-3 text-gray-400 text-sm font-medium">Size</th>
                <th className="text-left p-3 text-gray-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredItems.map(item => (
                <tr key={item.id} className="bg-gray-900/50 hover:bg-gray-800/70">
                  <td className="p-3">
                    <div className="flex items-center">
                      {item.type === 'image' && <Image size={16} className="text-blue-400 mr-2" />}
                      {item.type === 'video' && <Film size={16} className="text-green-400 mr-2" />}
                      {item.type === 'document' && <FileText size={16} className="text-amber-400 mr-2" />}
                      <span className="text-white">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-gray-300 capitalize">{item.type}</span>
                  </td>
                  <td className="p-3">
                    <span className="bg-gray-800 text-blue-300 text-xs px-2 py-0.5 rounded capitalize">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-gray-300 text-sm">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-gray-300 text-sm">
                      {item.type === 'video' && item.duration ? 
                        formatDuration(item.duration) : 
                        item.size ? formatFileSize(item.size) : '-'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-1">
                      <button 
                        className="p-1 text-blue-400 hover:text-blue-300" 
                        title="View"
                        onClick={() => handleMediaClick(item)}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-300" 
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-300" 
                        title="Share"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VehicleMediaLibrary;