/**
 * Google Photos Service
 * 
 * This service handles authentication and interaction with the Google Photos API.
 * It implements the OAuth 2.0 flow to get proper access to a user's Google Photos library.
 */

// Configuration - these would typically come from environment variables
const GOOGLE_API_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_SCOPE = 'https://www.googleapis.com/auth/photoslibrary.readonly';
const REDIRECT_URI = `${window.location.origin}/oauth2callback`;

interface Album {
  id: string;
  title: string;
  coverPhotoBaseUrl?: string;
  mediaItemsCount?: number;
}

interface Photo {
  id: string;
  baseUrl: string;
  filename: string;
  description?: string;
  mimeType: string;
  mediaMetadata?: {
    width: string;
    height: string;
    creationTime: string;
  };
}

/**
 * Initiates the Google OAuth flow for Photos access
 */
export const initiateGooglePhotosAuth = () => {
  if (!GOOGLE_API_CLIENT_ID) {
    throw new Error('Missing Google API Client ID');
  }

  // Store the current URL so we can return to it after authentication
  localStorage.setItem('googleAuthReturnUrl', window.location.href);

  // Create the OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  
  // Add query parameters
  authUrl.searchParams.append('client_id', GOOGLE_API_CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', GOOGLE_API_SCOPE);
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');

  // Open the authorization URL in a popup window
  const popup = window.open(
    authUrl.toString(),
    'GoogleAuth',
    'width=600,height=600,menubar=no,toolbar=no,location=no,status=no'
  );

  // Set up message listener to catch the response
  return new Promise<string>((resolve, reject) => {
    const messageListener = (event: MessageEvent) => {
      // Ensure the message is from our domain
      if (event.origin !== window.location.origin) return;

      // Check if it's our auth response
      if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        // Remove the listener
        window.removeEventListener('message', messageListener);
        
        // Close the popup
        if (popup) popup.close();
        
        // Resolve with the auth code
        resolve(event.data.code);
      }
    };

    // Add event listener
    window.addEventListener('message', messageListener);
    
    // Handle case where popup is closed without completing auth
    const popupCheckInterval = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(popupCheckInterval);
        window.removeEventListener('message', messageListener);
        reject(new Error('Authentication was canceled'));
      }
    }, 1000);
  });
};

/**
 * Exchanges an OAuth authorization code for access token
 */
export const exchangeCodeForToken = async (code: string) => {
  try {
    const response = await fetch('/api/google-auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, redirectUri: REDIRECT_URI }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    
    // Store the tokens in localStorage (in a real app, consider more secure options)
    localStorage.setItem('googleAccessToken', data.access_token);
    localStorage.setItem('googleRefreshToken', data.refresh_token);
    localStorage.setItem('googleTokenExpiry', (Date.now() + data.expires_in * 1000).toString());
    
    return data.access_token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

/**
 * Get a list of Google Photos albums
 */
export const getGoogleAlbums = async (): Promise<Album[]> => {
  try {
    // For demo purposes, we'll return some mock albums
    // In a real implementation, this would fetch actual albums from the Google Photos API
    return [
      { 
        id: 'album1', 
        title: 'Car Photos', 
        coverPhotoBaseUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Car+Photos',
        mediaItemsCount: 24
      },
      { 
        id: 'album2', 
        title: 'Dream Cars', 
        coverPhotoBaseUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Dream+Cars',
        mediaItemsCount: 15
      },
      { 
        id: 'album3', 
        title: 'Track Days', 
        coverPhotoBaseUrl: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Track+Days',
        mediaItemsCount: 32
      }
    ];
  } catch (error) {
    console.error('Error fetching Google Photos albums:', error);
    throw error;
  }
};

/**
 * Get photos from a specific Google Photos album
 */
export const getGoogleAlbumPhotos = async (albumId: string): Promise<Photo[]> => {
  try {
    // For demo purposes, return mock photos
    // In a real implementation, this would fetch actual photos from the Google Photos API
    return Array(8).fill(null).map((_, index) => ({
      id: `photo-${albumId}-${index}`,
      baseUrl: `https://via.placeholder.com/800x600/333333/FFFFFF?text=Photo+${index}`,
      filename: `photo_${index}.jpg`,
      mimeType: 'image/jpeg',
      mediaMetadata: {
        width: '800',
        height: '600',
        creationTime: new Date().toISOString()
      }
    }));
  } catch (error) {
    console.error('Error fetching album photos:', error);
    throw error;
  }
};

/**
 * Search Google Photos
 */
export const searchGooglePhotos = async (query: string): Promise<Photo[]> => {
  try {
    // For demo purposes, return mock search results
    // In a real implementation, this would search Google Photos API with the query
    return Array(5).fill(null).map((_, index) => ({
      id: `search-${query}-${index}`,
      baseUrl: `https://via.placeholder.com/800x600/222222/FFFFFF?text=${query}+${index}`,
      filename: `${query}_${index}.jpg`,
      mimeType: 'image/jpeg',
      mediaMetadata: {
        width: '800',
        height: '600',
        creationTime: new Date().toISOString()
      }
    }));
  } catch (error) {
    console.error('Error searching Google Photos:', error);
    throw error;
  }
};

export default {
  initiateGooglePhotosAuth,
  exchangeCodeForToken,
  getGoogleAlbums,
  getGoogleAlbumPhotos,
  searchGooglePhotos
};