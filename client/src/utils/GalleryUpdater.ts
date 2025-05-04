/**
 * GalleryUpdater.ts
 * 
 * A utility to help update the UserGallery instance in the GalleryContext when events
 * are added or removed in other parts of the application. This ensures full bi-directional 
 * connectivity between the gallery and other components.
 */

import { MediaItem, EventGroup } from '../contexts/GalleryContext';
import DataSourceConnector from '../services/DataSourceConnector';
import { useGallery } from '../contexts/GalleryContext';

/**
 * Creates a new event in the gallery and links it to a vehicle, drive, or detailing session
 * @param eventData Basic event data
 * @param media Media items to include in the event
 * @param linkType What type of entity to link this event to
 * @param linkId ID of the entity to link to
 * @returns The created event or null if creation failed
 */
export async function createLinkedEvent(
  eventData: Omit<EventGroup, 'id' | 'media'>,
  media: MediaItem[],
  linkType: 'vehicle' | 'drive' | 'detailing',
  linkId: string
): Promise<EventGroup | null> {
  try {
    // Get gallery context
    const galleryContext = useGallery();
    if (!galleryContext || !galleryContext.addUserEvent) {
      console.error('Gallery context not available for creating linked event');
      return null;
    }
    
    // Create a unique ID for the event
    const eventId = `event-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Create the event structure
    const newEvent: EventGroup = {
      id: eventId,
      name: eventData.name,
      date: eventData.date,
      location: eventData.location,
      description: eventData.description,
      cover: eventData.cover,
      media: [...media],
      // Add appropriate link based on type
      ...(linkType === 'vehicle' ? { vehicleIds: [linkId] } : {}),
      ...(linkType === 'drive' ? { driveJournalId: linkId } : {}),
      ...(linkType === 'detailing' ? { detailingSessionId: linkId } : {})
    };
    
    // Get the current user ID, default to demo-user if not available
    const currentUserId = galleryContext.currentUserGallery?.userId || 'demo-user';
    
    // Add the event to the user's gallery
    galleryContext.addUserEvent(currentUserId, newEvent);
    
    // Ensure bi-directional links are updated
    await DataSourceConnector.syncMediaBetweenSources();
    
    return newEvent;
  } catch (error) {
    console.error('Error creating linked event:', error);
    return null;
  }
}

/**
 * Adds media to an existing event and ensures it's properly linked
 * @param eventId ID of the event to add media to
 * @param media Media item to add
 * @param linkType What type of entity to link this media to (optional)
 * @param linkId ID of the entity to link to (optional)
 * @returns True if media was added successfully
 */
export async function addMediaToEvent(
  eventId: string,
  media: MediaItem,
  linkType?: 'vehicle' | 'drive' | 'detailing',
  linkId?: string
): Promise<boolean> {
  try {
    // Get gallery context
    const galleryContext = useGallery();
    if (!galleryContext || !galleryContext.addMediaToEvent) {
      console.error('Gallery context not available for adding media');
      return false;
    }
    
    // Find the event in the user's gallery
    const userGallery = galleryContext.currentUserGallery || 
      (galleryContext.userGalleries && galleryContext.userGalleries.length > 0 
        ? galleryContext.userGalleries[0] 
        : null);
    
    if (!userGallery) {
      console.error('User gallery not available for adding media');
      return false;
    }
    
    const event = userGallery.events.find(e => e.id === eventId);
    if (!event) {
      console.error(`Event with ID ${eventId} not found in user gallery`);
      return false;
    }
    
    // If we have a link type and ID, update the media with the appropriate linkage
    if (linkType && linkId) {
      if (linkType === 'vehicle') {
        media.vehicleId = linkId;
        
        // Find vehicle name if available
        const vehicle = userGallery.connectedVehicles?.find(v => v.vehicleId === linkId);
        if (vehicle) {
          media.vehicleName = vehicle.vehicleName;
        }
      } else if (linkType === 'drive') {
        media.driveId = linkId;
        
        // Find drive name if available
        const drive = userGallery.connectedDrives?.find(d => d.driveId === linkId);
        if (drive) {
          media.driveName = drive.driveName;
          media.driveDate = drive.driveDate;
        }
      } else if (linkType === 'detailing') {
        media.detailingSessionId = linkId;
        
        // Find session name if available
        const session = userGallery.connectedDetailingSessions?.find(s => s.sessionId === linkId);
        if (session) {
          media.productUsed = []; // Initialize as empty array to be filled
        }
      }
    }
    
    // Add media to the event
    event.media.push(media);
    
    // Update the event's cover if this is the first media item
    if (event.media.length === 1 && media.type === 'image') {
      event.cover = media.src;
    }
    
    // Update media categorization in the user gallery
    updateMediaCategorization(userGallery, media);
    
    // Ensure bi-directional links are synced
    await DataSourceConnector.syncMediaBetweenSources();
    
    return true;
  } catch (error) {
    console.error('Error adding media to event:', error);
    return false;
  }
}

/**
 * Updates categorization structures for a media item in the user gallery
 * @param userGallery User gallery to update
 * @param media Media item to categorize
 */
function updateMediaCategorization(userGallery: any, media: MediaItem): void {
  try {
    // Update mediaByCar if vehicle is specified
    if (media.vehicleName && userGallery.mediaByCar) {
      if (!userGallery.mediaByCar[media.vehicleName]) {
        userGallery.mediaByCar[media.vehicleName] = [];
      }
      userGallery.mediaByCar[media.vehicleName].push(media);
    }
    
    // Update mediaByCategory if category is specified
    if (media.category && userGallery.mediaByCategory) {
      if (!userGallery.mediaByCategory[media.category]) {
        userGallery.mediaByCategory[media.category] = [];
      }
      userGallery.mediaByCategory[media.category].push(media);
    }
    
    // Update mediaByLocation if location is available
    if (media.location && userGallery.mediaByLocation) {
      if (!userGallery.mediaByLocation[media.location]) {
        userGallery.mediaByLocation[media.location] = [];
      }
      userGallery.mediaByLocation[media.location].push(media);
    }
    
    // Update mediaByTag for each tag
    if (media.tags && media.tags.length > 0 && userGallery.mediaByTag) {
      media.tags.forEach(tag => {
        if (!userGallery.mediaByTag[tag]) {
          userGallery.mediaByTag[tag] = [];
        }
        userGallery.mediaByTag[tag].push(media);
      });
    }
    
    // Update mediaByTimeline if date is specified
    if (media.date && userGallery.mediaByTimeline) {
      // Extract year and month for timeline grouping (YYYY-MM)
      const datePrefix = media.date.substring(0, 7);
      if (!userGallery.mediaByTimeline[datePrefix]) {
        userGallery.mediaByTimeline[datePrefix] = [];
      }
      userGallery.mediaByTimeline[datePrefix].push(media);
    }
    
    // Update media counts
    if (userGallery.mediaCounts) {
      userGallery.mediaCounts.total += 1;
      
      // Update type count
      if (!userGallery.mediaCounts.byType[media.type]) {
        userGallery.mediaCounts.byType[media.type] = 0;
      }
      userGallery.mediaCounts.byType[media.type] += 1;
      
      // Update category count
      if (media.category) {
        if (!userGallery.mediaCounts.byCategory[media.category]) {
          userGallery.mediaCounts.byCategory[media.category] = 0;
        }
        userGallery.mediaCounts.byCategory[media.category] += 1;
      }
      
      // Update vehicle count
      if (media.vehicleName) {
        if (!userGallery.mediaCounts.byVehicle[media.vehicleName]) {
          userGallery.mediaCounts.byVehicle[media.vehicleName] = 0;
        }
        userGallery.mediaCounts.byVehicle[media.vehicleName] += 1;
      }
    }
    
    // Add to recent activity
    if (userGallery.recentActivity) {
      userGallery.recentActivity.unshift({
        id: `activity-${Date.now()}`,
        type: 'upload',
        mediaId: media.id,
        mediaTitle: media.title,
        timestamp: new Date().toISOString(),
        details: `Added ${media.type} to ${media.event || 'gallery'}`
      });
      
      // Keep only the most recent 50 activities
      if (userGallery.recentActivity.length > 50) {
        userGallery.recentActivity = userGallery.recentActivity.slice(0, 50);
      }
    }
    
    // Update connected entity media counts
    updateConnectedEntityCounts(userGallery, media);
  } catch (error) {
    console.error('Error updating media categorization:', error);
  }
}

/**
 * Updates the media counts for connected entities
 * @param userGallery User gallery to update
 * @param media Media item that was added
 */
function updateConnectedEntityCounts(userGallery: any, media: MediaItem): void {
  try {
    // Update vehicle media count
    if (media.vehicleId && userGallery.connectedVehicles) {
      const vehicle = userGallery.connectedVehicles.find(v => v.vehicleId === media.vehicleId);
      if (vehicle) {
        vehicle.mediaCount = (vehicle.mediaCount || 0) + 1;
        
        // Set as featured if first media or explicitly featured
        if (!vehicle.featuredMediaId || media.featured) {
          vehicle.featuredMediaId = media.id;
        }
      }
    }
    
    // Update drive media count
    if (media.driveId && userGallery.connectedDrives) {
      const drive = userGallery.connectedDrives.find(d => d.driveId === media.driveId);
      if (drive) {
        drive.mediaCount = (drive.mediaCount || 0) + 1;
        
        // Set as featured if first media or explicitly featured
        if (!drive.featuredMediaId || media.featured) {
          drive.featuredMediaId = media.id;
        }
      }
    }
    
    // Update detailing session media count
    if (media.detailingSessionId && userGallery.connectedDetailingSessions) {
      const session = userGallery.connectedDetailingSessions.find(
        s => s.sessionId === media.detailingSessionId
      );
      if (session) {
        session.mediaCount = (session.mediaCount || 0) + 1;
        
        // Set as featured if first media or explicitly featured
        if (!session.featuredMediaId || media.featured) {
          session.featuredMediaId = media.id;
        }
      }
    }
  } catch (error) {
    console.error('Error updating connected entity counts:', error);
  }
}