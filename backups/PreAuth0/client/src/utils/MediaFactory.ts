/**
 * MediaFactory.ts
 * 
 * A utility for creating standardized media items with consistent formatting
 * and required metadata to ensure proper gallery integration.
 */

import { MediaItem } from '../contexts/GalleryContext';

/**
 * Basic media creation options
 */
export interface CreateMediaOptions {
  src: string;
  title: string;
  description?: string;
  event?: string;
  category?: string;
  featured?: boolean;
  tags?: string[];
  vehicleId?: string;
  vehicleName?: string;
  vehicleYear?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  driveId?: string;
  driveName?: string;
  detailingSessionId?: string;
  location?: string;
  owner?: string;
  accessLevel?: 'public' | 'private' | 'shared';
}

/**
 * Image-specific options
 */
export interface CreateImageOptions extends CreateMediaOptions {
  alt?: string;
  dimensions?: { width: number; height: number };
  externalSource?: string;
  gpsCoordinates?: { lat: number; lng: number };
}

/**
 * Video-specific options
 */
export interface CreateVideoOptions extends CreateMediaOptions {
  alt?: string;
  duration?: number;
  dimensions?: { width: number; height: number };
  thumbnail?: string;
}

/**
 * Audio-specific options
 */
export interface CreateAudioOptions extends CreateMediaOptions {
  duration?: number;
}

/**
 * Document-specific options
 */
export interface CreateDocumentOptions extends CreateMediaOptions {
  fileSize?: number;
  mimetype?: string;
}

/**
 * Creates an image media item with consistent formatting
 * @param options Image creation options
 * @returns A formatted image media item
 */
export function createImageMedia(options: CreateImageOptions): MediaItem {
  return {
    id: `img-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type: 'image',
    src: options.src,
    alt: options.alt || options.title,
    title: options.title,
    description: options.description,
    date: new Date().toISOString().split('T')[0],
    event: options.event,
    featured: options.featured || false,
    category: options.category,
    tags: options.tags || [],
    // Vehicle association
    vehicleId: options.vehicleId,
    vehicleName: options.vehicleName,
    vehicleYear: options.vehicleYear,
    vehicleMake: options.vehicleMake,
    vehicleModel: options.vehicleModel,
    // Drive association
    driveId: options.driveId,
    driveName: options.driveName,
    // Detailing association
    detailingSessionId: options.detailingSessionId,
    // Ownership
    owner: options.owner,
    accessLevel: options.accessLevel || 'public',
    // Technical metadata
    dimensions: options.dimensions,
    gpsCoordinates: options.gpsCoordinates,
    location: options.location,
    externalSource: options.externalSource
  };
}

/**
 * Creates a video media item with consistent formatting
 * @param options Video creation options
 * @returns A formatted video media item
 */
export function createVideoMedia(options: CreateVideoOptions): MediaItem {
  return {
    id: `vid-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type: 'video',
    src: options.src,
    alt: options.alt || options.title,
    title: options.title,
    description: options.description,
    date: new Date().toISOString().split('T')[0],
    event: options.event,
    featured: options.featured || false,
    thumbnail: options.thumbnail,
    category: options.category,
    tags: options.tags || [],
    // Vehicle association
    vehicleId: options.vehicleId,
    vehicleName: options.vehicleName,
    vehicleYear: options.vehicleYear,
    vehicleMake: options.vehicleMake,
    vehicleModel: options.vehicleModel,
    // Drive association
    driveId: options.driveId,
    driveName: options.driveName,
    // Detailing association
    detailingSessionId: options.detailingSessionId,
    // Ownership
    owner: options.owner,
    accessLevel: options.accessLevel || 'public',
    // Technical metadata
    duration: options.duration,
    dimensions: options.dimensions,
    location: options.location
  };
}

/**
 * Creates an audio media item with consistent formatting
 * @param options Audio creation options
 * @returns A formatted audio media item
 */
export function createAudioMedia(options: CreateAudioOptions): MediaItem {
  return {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type: 'audio',
    src: options.src,
    alt: 'Audio: ' + options.title,
    title: options.title,
    description: options.description,
    date: new Date().toISOString().split('T')[0],
    event: options.event,
    featured: options.featured || false,
    category: options.category,
    tags: options.tags || [],
    // Vehicle association
    vehicleId: options.vehicleId,
    vehicleName: options.vehicleName,
    // Drive association
    driveId: options.driveId,
    driveName: options.driveName,
    // Detailing association
    detailingSessionId: options.detailingSessionId,
    // Ownership
    owner: options.owner,
    accessLevel: options.accessLevel || 'public',
    // Technical metadata
    duration: options.duration,
    location: options.location
  };
}

/**
 * Creates a document media item with consistent formatting
 * @param options Document creation options
 * @returns A formatted document media item
 */
export function createDocumentMedia(options: CreateDocumentOptions): MediaItem {
  return {
    id: `doc-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type: 'document',
    src: options.src,
    alt: 'Document: ' + options.title,
    title: options.title,
    description: options.description,
    date: new Date().toISOString().split('T')[0],
    event: options.event,
    featured: options.featured || false,
    category: options.category,
    tags: options.tags || [],
    // Vehicle association
    vehicleId: options.vehicleId,
    vehicleName: options.vehicleName,
    // Drive association
    driveId: options.driveId,
    driveName: options.driveName,
    // Detailing association
    detailingSessionId: options.detailingSessionId,
    // Ownership
    owner: options.owner,
    accessLevel: options.accessLevel || 'public',
    // Technical metadata
    fileSize: options.fileSize,
    mimetype: options.mimetype
  };
}

/**
 * Creates a voice note media item with consistent formatting
 * @param options Audio creation options (for voice notes)
 * @returns A formatted voice note media item
 */
export function createVoiceNoteMedia(options: CreateAudioOptions): MediaItem {
  return {
    id: `vn-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type: 'voice_note',
    src: options.src,
    alt: 'Voice Note: ' + options.title,
    title: options.title,
    description: options.description,
    date: new Date().toISOString().split('T')[0],
    event: options.event,
    featured: options.featured || false,
    category: options.category,
    tags: options.tags || [],
    // Vehicle association
    vehicleId: options.vehicleId,
    vehicleName: options.vehicleName,
    // Drive association
    driveId: options.driveId,
    driveName: options.driveName,
    // Detailing association
    detailingSessionId: options.detailingSessionId,
    // Ownership
    owner: options.owner,
    accessLevel: options.accessLevel || 'public',
    // Technical metadata
    duration: options.duration,
    location: options.location
  };
}

/**
 * Creates a 3D model media item with consistent formatting
 * @param options Basic media creation options
 * @returns A formatted 3D model media item
 */
export function create3DModelMedia(options: CreateMediaOptions): MediaItem {
  return {
    id: `3d-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type: '3d_model',
    src: options.src,
    alt: '3D Model: ' + options.title,
    title: options.title,
    description: options.description,
    date: new Date().toISOString().split('T')[0],
    event: options.event,
    featured: options.featured || false,
    category: options.category,
    tags: options.tags || [],
    // Vehicle association
    vehicleId: options.vehicleId,
    vehicleName: options.vehicleName,
    vehicleYear: options.vehicleYear,
    vehicleMake: options.vehicleMake,
    vehicleModel: options.vehicleModel,
    // Ownership
    owner: options.owner,
    accessLevel: options.accessLevel || 'public'
  };
}