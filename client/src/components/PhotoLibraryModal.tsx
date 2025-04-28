import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Import photo library services
import {
  authenticateWithGooglePhotos,
  isGooglePhotosAuthenticated,
  getGoogleAlbums,
  getGooglePhotosFromAlbum,
  convertGooglePhotoToMediaItem
} from '../services/googlePhotosService';

import {
  isAppleDeviceWithPhotoSupport,
  requestApplePhotoAccess,
  isApplePhotosAuthorized,
  getAppleAlbums,
  getApplePhotosFromAlbum,
  convertApplePhotoToMediaItem
} from '../services/applePhotosService';

interface PhotoLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelect: (mediaItem: any) => void;
}

interface Album {
  id: string;
  title: string;
  coverUrl?: string;
  count?: number | string;
}

interface Photo {
  id: string;
  url: string;
  thumbnail?: string;
  filename?: string;
}

const PhotoLibraryModal: React.FC<PhotoLibraryModalProps> = ({ isOpen, onClose, onPhotoSelect }) => {
  // Active tab state (google or apple)
  const [activeTab, setActiveTab] = useState('google');
  
  // Authentication states
  const [googleAuthenticated, setGoogleAuthenticated] = useState(false);
  const [appleAuthenticated, setAppleAuthenticated] = useState(false);
  
  // Loading states
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  
  // Data states
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  
  // Device capability check for Apple Photos
  const [applePhotoSupported, setApplePhotoSupported] = useState(false);
  
  // Check device capabilities and auth status on mount
  useEffect(() => {
    // Check for Apple device compatibility
    setApplePhotoSupported(isAppleDeviceWithPhotoSupport());
    
    // Check existing auth states
    setGoogleAuthenticated(isGooglePhotosAuthenticated());
    setAppleAuthenticated(isApplePhotosAuthorized());
  }, []);
  
  // Handle authenticating with Google Photos
  const handleGoogleAuth = async () => {
    try {
      const success = await authenticateWithGooglePhotos();
      setGoogleAuthenticated(success);
      
      if (success) {
        loadGoogleAlbums();
      }
    } catch (error) {
      console.error('Failed to authenticate with Google Photos:', error);
    }
  };
  
  // Handle requesting access to Apple Photos
  const handleAppleAuth = async () => {
    if (!applePhotoSupported) {
      alert('This device does not support Apple Photos integration.');
      return;
    }
    
    try {
      const success = await requestApplePhotoAccess();
      setAppleAuthenticated(success);
      
      if (success) {
        loadAppleAlbums();
      }
    } catch (error) {
      console.error('Failed to request Apple Photos access:', error);
    }
  };
  
  // Load Google Photos albums
  const loadGoogleAlbums = async () => {
    setIsLoadingAlbums(true);
    
    try {
      const googleAlbums = await getGoogleAlbums();
      setAlbums(googleAlbums.map(album => ({
        id: album.id,
        title: album.title,
        coverUrl: album.coverPhotoBaseUrl,
        count: album.mediaItemsCount
      })));
    } catch (error) {
      console.error('Failed to load Google Photos albums:', error);
    } finally {
      setIsLoadingAlbums(false);
    }
  };
  
  // Load Apple Photos albums
  const loadAppleAlbums = async () => {
    setIsLoadingAlbums(true);
    
    try {
      const appleAlbums = await getAppleAlbums();
      setAlbums(appleAlbums.map(album => ({
        id: album.id,
        title: album.title,
        coverUrl: album.coverUrl,
        count: album.count
      })));
    } catch (error) {
      console.error('Failed to load Apple Photos albums:', error);
    } finally {
      setIsLoadingAlbums(false);
    }
  };
  
  // Load photos from a selected album
  const handleAlbumSelect = async (albumId: string) => {
    setSelectedAlbumId(albumId);
    setIsLoadingPhotos(true);
    
    try {
      let photoList: Photo[] = [];
      
      if (activeTab === 'google') {
        const googlePhotos = await getGooglePhotosFromAlbum(albumId);
        photoList = googlePhotos.map(photo => ({
          id: photo.id,
          url: photo.baseUrl,
          thumbnail: `${photo.baseUrl}=w200-h200`, // Add Google Photos resize parameter
          filename: photo.filename
        }));
      } else {
        const applePhotos = await getApplePhotosFromAlbum(albumId);
        photoList = applePhotos.map(photo => ({
          id: photo.id,
          url: photo.url,
          thumbnail: photo.thumbnail,
          filename: photo.filename
        }));
      }
      
      setPhotos(photoList);
    } catch (error) {
      console.error(`Failed to load photos from album ${albumId}:`, error);
    } finally {
      setIsLoadingPhotos(false);
    }
  };
  
  // Handle selecting a photo
  const handlePhotoSelect = async (photo: Photo) => {
    try {
      let mediaItem: any;
      
      if (activeTab === 'google') {
        // In a real implementation, we would get the full photo object
        // For demonstration, we'll create a media item from the photo
        mediaItem = {
          id: Date.now(),
          type: 'image',
          name: photo.filename || 'Google Photo',
          url: photo.url,
          thumbnail: photo.thumbnail,
          description: `Imported from Google Photos`,
          dateAdded: new Date().toISOString().split('T')[0]
        };
      } else {
        // In a real implementation, we would get the full photo object
        // For demonstration, we'll create a media item from the photo
        mediaItem = {
          id: Date.now(),
          type: 'image',
          name: photo.filename || 'Apple Photo',
          url: photo.url,
          thumbnail: photo.thumbnail,
          description: `Imported from Apple Photos`,
          dateAdded: new Date().toISOString().split('T')[0]
        };
      }
      
      onPhotoSelect(mediaItem);
      onClose();
    } catch (error) {
      console.error('Failed to select photo:', error);
    }
  };
  
  // Handle changing tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setAlbums([]);
    setPhotos([]);
    setSelectedAlbumId(null);
    
    // Load albums for the selected tab if authenticated
    if (tab === 'google' && googleAuthenticated) {
      loadGoogleAlbums();
    } else if (tab === 'apple' && appleAuthenticated) {
      loadAppleAlbums();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl shadow-2xl border border-gray-700 w-full max-w-5xl max-h-[85vh] overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-xl font-orbitron text-blue-400">Import from Photo Library</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <Tabs defaultValue="google" value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="google">Google Photos</TabsTrigger>
                  <TabsTrigger value="apple" disabled={!applePhotoSupported}>Apple Photos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="google" className="space-y-6">
                  {!googleAuthenticated ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.4203 16.5453C20.0691 17.4762 19.6279 18.3107 19.1023 19.0539C18.3947 20.0477 17.8195 20.7334 17.2803 21.1109C16.4601 21.7445 15.5879 22.07 14.6611 22.0883C13.9847 22.0883 13.1747 21.9211 12.2362 21.5815C11.2947 21.243 10.4408 21.0758 9.67348 21.0758C8.86758 21.0758 8.00258 21.243 7.0795 21.5815C6.155 21.9211 5.40816 22.1 4.83465 22.1183C3.95375 22.1532 3.07441 21.8183 2.19508 21.1109C1.61783 20.6976 1.01733 19.9825 0.393078 18.9657C-0.27793 17.8709 -0.7895 16.6427 -1.04167 15.2768C-1.32166 13.777 -1.46166 12.3224 -1.46166 10.912C-1.46166 9.28282 -1.24391 7.87823 -0.8095 6.70185C-0.458 5.7602 0.05809 4.98352 0.743078 4.37052C1.42809 3.75752 2.2121 3.44311 3.09675 3.42478C3.82025 3.42478 4.74842 3.61685 5.88609 3.99569C7.02008 4.37635 7.74392 4.56902 8.05442 4.56902C8.29034 4.56902 9.1315 4.33827 10.5595 3.87802C11.9016 3.45269 13.0375 3.26719 13.971 3.31635C15.6305 3.4147 16.8838 4.00602 17.723 5.08677C16.2487 5.97444 15.5239 7.23394 15.5479 8.86227C15.5708 10.1329 16.0594 11.1762 17.012 11.9863C17.444 12.3564 17.9254 12.6403 18.459 12.8393C18.3189 13.2828 18.1729 13.7055 18.02 14.1085C17.7297 14.8334 17.4169 15.5246 17.0823 16.1758C16.606 17.0965 16.1818 17.8088 15.8097 18.3146C15.3054 18.9833 14.8257 19.3169 14.3683 19.3169C14.0943 19.3351 13.7294 19.2428 13.274 19.0387C12.8157 18.8334 12.3157 18.7346 11.7737 18.7346C11.2667 18.7346 10.7515 18.8358 10.2273 19.0387C9.70125 19.2428 9.30075 19.3441 9.01333 19.3441C8.57442 19.3441 8.0945 19.0106 7.57459 18.3459L7.57442 18.3458L7.57442 18.3457C7.20025 17.841 6.77617 17.1269 6.30217 16.2042L6.30217 16.2041C5.7914 15.2016 5.37659 14.1491 5.05765 13.0461C4.69681 11.82 4.51639 10.6335 4.51639 9.48694C4.51639 8.1211 4.76523 6.91135 5.26291 5.86177C5.66341 5.00444 6.21775 4.30652 6.92683 3.767C7.63591 3.22746 8.41625 2.94893 9.27125 2.92893C9.91508 2.92893 10.7033 3.09993 11.6323 3.43751C12.5615 3.77651 13.1536 3.94751 13.4086 3.94751L13.4099 3.94751C14.1289 3.94751 15.0103 3.6946 16.0544 3.19093C17.0983 2.68861 17.9232 2.43844 18.5299 2.43844L18.5303 2.43844C19.1851 2.43844 19.768 2.56069 20.2802 2.80335C20.7924 3.04743 21.2158 3.351 21.5504 3.71267C21.3624 3.85551 21.2071 3.99835 21.0778 4.14118C20.3871 4.82602 19.8354 5.72052 19.4239 6.82268C19.0123 7.92627 18.7975 8.91652 18.7795 9.79235C18.7615 10.6682 18.919 11.5085 19.2536 12.3097C19.5881 13.1109 20.0601 13.7719 20.6735 14.2926C20.9137 14.4894 21.1814 14.6555 21.476 14.7932L21.4755 14.7944C21.147 15.3873 20.8029 15.9687 20.4214 16.5384L20.4203 16.5453Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <h3 className="text-white text-lg font-medium">Connect to Google Photos</h3>
                      <p className="text-gray-400 text-center max-w-md">
                        Access your Google Photos library to import high-quality images for your dream assets.
                      </p>
                      <Button 
                        onClick={handleGoogleAuth}
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                      >
                        Connect to Google Photos
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Albums view (when no album is selected) */}
                      {!selectedAlbumId && (
                        <>
                          <div className="flex justify-between items-center">
                            <h3 className="text-white text-lg font-medium">Your Albums</h3>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={loadGoogleAlbums}
                              disabled={isLoadingAlbums}
                            >
                              {isLoadingAlbums ? 'Loading...' : 'Refresh'}
                            </Button>
                          </div>
                          {isLoadingAlbums ? (
                            <div className="flex justify-center py-12">
                              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                              {albums.map(album => (
                                <div 
                                  key={album.id}
                                  onClick={() => handleAlbumSelect(album.id)}
                                  className="bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700 hover:border-blue-500/50"
                                >
                                  <div className="aspect-square relative">
                                    {album.coverUrl ? (
                                      <img 
                                        src={album.coverUrl} 
                                        alt={album.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                        <span className="text-3xl">📁</span>
                                      </div>
                                    )}
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                      <div className="text-white font-medium truncate">{album.title}</div>
                                      <div className="text-gray-300 text-sm">{album.count} items</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {/* Photos view (when an album is selected) */}
                      {selectedAlbumId && (
                        <>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <button 
                                onClick={() => setSelectedAlbumId(null)}
                                className="text-blue-400 hover:text-blue-300 mr-2"
                              >
                                ← Back
                              </button>
                              <h3 className="text-white text-lg font-medium">
                                {albums.find(a => a.id === selectedAlbumId)?.title || 'Album'}
                              </h3>
                            </div>
                          </div>
                          
                          {isLoadingPhotos ? (
                            <div className="flex justify-center py-12">
                              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {photos.map(photo => (
                                <div 
                                  key={photo.id}
                                  onClick={() => handlePhotoSelect(photo)}
                                  className="bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700 hover:border-blue-500/50"
                                >
                                  <div className="aspect-square relative">
                                    <img 
                                      src={photo.thumbnail || photo.url} 
                                      alt={photo.filename || 'Photo'}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="apple" className="space-y-6">
                  {!applePhotoSupported ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-3xl">📱</span>
                      </div>
                      <h3 className="text-white text-lg font-medium">Device Not Supported</h3>
                      <p className="text-gray-400 text-center max-w-md">
                        Apple Photos integration is only available on iOS and macOS devices.
                        Please use the Google Photos tab or try again on an Apple device.
                      </p>
                    </div>
                  ) : !appleAuthenticated ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-3xl">🍎</span>
                      </div>
                      <h3 className="text-white text-lg font-medium">Connect to Apple Photos</h3>
                      <p className="text-gray-400 text-center max-w-md">
                        Access your iPhone, iPad, or Mac photo library to import images for your dream assets.
                      </p>
                      <Button 
                        onClick={handleAppleAuth}
                        className="bg-gray-700 hover:bg-gray-600 text-white"
                      >
                        Allow Photos Access
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Albums view (when no album is selected) */}
                      {!selectedAlbumId && (
                        <>
                          <div className="flex justify-between items-center">
                            <h3 className="text-white text-lg font-medium">Your Albums</h3>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={loadAppleAlbums}
                              disabled={isLoadingAlbums}
                            >
                              {isLoadingAlbums ? 'Loading...' : 'Refresh'}
                            </Button>
                          </div>
                          {isLoadingAlbums ? (
                            <div className="flex justify-center py-12">
                              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                              {albums.map(album => (
                                <div 
                                  key={album.id}
                                  onClick={() => handleAlbumSelect(album.id)}
                                  className="bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700 hover:border-blue-500/50"
                                >
                                  <div className="aspect-square relative">
                                    {album.coverUrl ? (
                                      <img 
                                        src={album.coverUrl} 
                                        alt={album.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                        <span className="text-3xl">📁</span>
                                      </div>
                                    )}
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                      <div className="text-white font-medium truncate">{album.title}</div>
                                      <div className="text-gray-300 text-sm">{album.count} items</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {/* Photos view (when an album is selected) */}
                      {selectedAlbumId && (
                        <>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <button 
                                onClick={() => setSelectedAlbumId(null)}
                                className="text-blue-400 hover:text-blue-300 mr-2"
                              >
                                ← Back
                              </button>
                              <h3 className="text-white text-lg font-medium">
                                {albums.find(a => a.id === selectedAlbumId)?.title || 'Album'}
                              </h3>
                            </div>
                          </div>
                          
                          {isLoadingPhotos ? (
                            <div className="flex justify-center py-12">
                              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {photos.map(photo => (
                                <div 
                                  key={photo.id}
                                  onClick={() => handlePhotoSelect(photo)}
                                  className="bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700 hover:border-blue-500/50"
                                >
                                  <div className="aspect-square relative">
                                    <img 
                                      src={photo.thumbnail || photo.url} 
                                      alt={photo.filename || 'Photo'}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-700 bg-black/20">
              <div className="flex justify-between items-center">
                <p className="text-gray-400 text-sm">
                  Select photos to add to your dream asset gallery
                </p>
                <Button onClick={onClose} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default PhotoLibraryModal;