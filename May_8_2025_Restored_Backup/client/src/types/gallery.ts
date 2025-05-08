/**
 * Gallery item representing a photo, video, or document
 */
export interface GalleryItem {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  mediaType: 'image' | 'video' | 'document' | 'audio';
  mediaUrl: string; // URL to the media file
  thumbnailUrl?: string; // URL to thumbnail (for videos)
  uploadDate: string;
  collectionId?: string; // ID of collection this item belongs to
  tags?: string[];
  
  // Relations to other entities
  vehicleId?: string;
  driveLogId?: string;
  goalId?: string;
  maintenanceId?: string;
  eventId?: string;
  
  // Photo metadata
  width?: number;
  height?: number;
  size?: number; // in bytes
  location?: {
    latitude: number;
    longitude: number;
    locationName?: string;
  };
  
  // Visibility settings
  isPublic: boolean;
  isProfileImage?: boolean;
  isVehicleImage?: boolean;
  
  // Statistics
  viewCount?: number;
  likeCount?: number;
}

/**
 * Media collection that groups related gallery items
 */
export interface MediaCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  createdDate: string;
  updatedDate?: string;
  type: 'generic' | 'event' | 'vehicle' | 'drive' | 'project' | 'achievement';
  itemIds: string[]; // Array of gallery item IDs in this collection
  relatedEntityId?: string; // ID of related entity (vehicle, drive, etc.)
  relatedEntityType?: string; // Type of related entity (vehicle, drive, etc.)
  tags?: string[];
  location?: {
    latitude: number;
    longitude: number;
    locationName?: string;
  };
  isPublic: boolean;
}

/**
 * Import source for media gallery items
 */
export type ImportSource = 
  | 'local_upload' 
  | 'google_photos' 
  | 'instagram' 
  | 'dropbox' 
  | 'google_drive' 
  | 'icloud' 
  | 'onedrive';