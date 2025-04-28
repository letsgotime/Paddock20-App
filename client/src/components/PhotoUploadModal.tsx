import React, { useState, useRef } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  getLocalImages, 
  handleImageUpload,
  removeLocalImage
} from '../services/localImageService';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelect: (mediaItem: any) => void;
}

interface Photo {
  id: string;
  url: string;
  thumbnail?: string;
  name: string;
  description?: string;
  dateAdded: string;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ isOpen, onClose, onPhotoSelect }) => {
  const [activeTab, setActiveTab] = useState('gallery');
  const [photos, setPhotos] = useState<Photo[]>(getLocalImages());
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlName, setUrlName] = useState('');
  const [urlError, setUrlError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const file = e.target.files[0];
        const newImage = await handleImageUpload(file);
        setPhotos(getLocalImages());
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error: any) {
        console.error('Error uploading image:', error);
        alert(`Failed to upload image: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };
  
  // Handle selecting a photo
  const handlePhotoSelect = (photo: Photo) => {
    const mediaItem = {
      id: photo.id,
      type: 'image',
      name: photo.name,
      url: photo.url,
      thumbnail: photo.thumbnail || photo.url,
      description: photo.description || `Added on ${photo.dateAdded}`,
      dateAdded: photo.dateAdded
    };
    
    onPhotoSelect(mediaItem);
    onClose();
  };
  
  // Handle URL submission
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!urlInput.trim()) {
      setUrlError('Please enter a valid URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(urlInput);
    } catch (err) {
      setUrlError('Please enter a valid URL (include http:// or https://)');
      return;
    }
    
    setIsUploading(true);
    
    // Create new image element to check if URL loads
    const img = new Image();
    img.onload = () => {
      // Create a media item from the URL
      const mediaItem = {
        id: Date.now().toString(),
        type: 'image',
        name: urlName || 'Web Image',
        url: urlInput,
        thumbnail: urlInput,
        description: `Added from URL on ${new Date().toLocaleDateString()}`,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      
      onPhotoSelect(mediaItem);
      onClose();
      setIsUploading(false);
    };
    
    img.onerror = () => {
      setUrlError('The image at this URL could not be loaded');
      setIsUploading(false);
    };
    
    img.src = urlInput;
  };
  
  // Load gallery data on tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'gallery') {
      setPhotos(getLocalImages());
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl shadow-2xl border border-gray-700 w-full max-w-5xl max-h-[85vh] overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-xl font-orbitron text-blue-400">Add Image</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <Tabs defaultValue="gallery" value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="url">Add from URL</TabsTrigger>
                </TabsList>
                
                {/* Gallery Tab */}
                <TabsContent value="gallery" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white text-lg font-medium">Your Images</h3>
                  </div>
                  
                  {photos.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-6xl mb-4">📷</div>
                      <p>No images in your gallery yet.</p>
                      <p className="mt-2">Upload some images or add from URL to get started.</p>
                      <Button 
                        onClick={() => setActiveTab('upload')} 
                        className="mt-4 bg-blue-600 hover:bg-blue-500"
                      >
                        Upload Images
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {photos.map(photo => (
                        <div 
                          key={photo.id}
                          onClick={() => handlePhotoSelect(photo)}
                          className="bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700 hover:border-blue-500/50"
                        >
                          <div className="aspect-square relative">
                            <img 
                              src={photo.thumbnail || photo.url} 
                              alt={photo.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <div className="text-white font-medium truncate">{photo.name}</div>
                              <div className="text-gray-300 text-sm">{photo.dateAdded}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                {/* Upload Tab */}
                <TabsContent value="upload" className="space-y-6">
                  <div className="bg-gray-800/30 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                    <div className="text-6xl mb-4">📤</div>
                    <h3 className="text-white text-lg font-medium mb-2">Upload an Image</h3>
                    <p className="text-gray-400 mb-6">
                      Select an image file from your device to add to your dream
                    </p>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                    />
                    
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-blue-600 hover:bg-blue-500 w-full max-w-xs"
                    >
                      {isUploading ? 'Uploading...' : 'Select Image'}
                    </Button>
                    
                    <p className="text-gray-500 text-sm mt-4">
                      Supported formats: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                </TabsContent>
                
                {/* URL Tab */}
                <TabsContent value="url" className="space-y-6">
                  <form onSubmit={handleUrlSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="image-url">Image URL</Label>
                        <Input
                          id="image-url"
                          value={urlInput}
                          onChange={(e) => {
                            setUrlInput(e.target.value);
                            setUrlError('');
                          }}
                          placeholder="https://example.com/image.jpg"
                          className="mt-1 bg-gray-800 border-gray-600"
                        />
                        {urlError && (
                          <div className="text-red-500 text-sm mt-1">{urlError}</div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="image-name">Image Name (Optional)</Label>
                        <Input
                          id="image-name"
                          value={urlName}
                          onChange={(e) => setUrlName(e.target.value)}
                          placeholder="Dream Car"
                          className="mt-1 bg-gray-800 border-gray-600"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit"
                      disabled={isUploading || !urlInput.trim()}
                      className="bg-blue-600 hover:bg-blue-500 w-full"
                    >
                      {isUploading ? 'Processing...' : 'Add Image'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default PhotoUploadModal;