// Google Drive API Integration Service
// This service handles authentication and fetching media from Google Drive

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; // We'll ask for this secret
const CLIENT_ID = '994272362522-fgb2e894117ccvpbv8ctonk9fdfap4us.apps.googleusercontent.com'; // From your uploaded client secret
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

// Specific Google Drive folder ID to fetch media from
// This will need to be provided by the user
let FOLDER_ID = '';

// Track authentication state
let isInitialized = false;
let isAuthenticated = false;

/**
 * Initialize the Google Drive API client
 * @returns {Promise} Promise that resolves when the client is ready
 */
export function initializeGoogleDriveClient(folderId) {
  if (folderId) {
    FOLDER_ID = folderId;
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client:auth2', () => {
        window.gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(() => {
          isInitialized = true;
          
          // Listen for sign-in state changes
          window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
          
          // Handle the initial sign-in state
          updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
          
          resolve();
        }).catch(error => {
          console.error('Error initializing Google Drive API client', error);
          reject(error);
        });
      });
    };
    script.onerror = (error) => {
      console.error('Error loading Google API script', error);
      reject(error);
    };
    
    document.body.appendChild(script);
  });
}

/**
 * Update local authentication state when sign-in status changes
 * @param {boolean} isSignedIn 
 */
function updateSigninStatus(isSignedIn) {
  isAuthenticated = isSignedIn;
}

/**
 * Sign in the user to Google
 * @returns {Promise}
 */
export function signInToGoogle() {
  if (!isInitialized) {
    return Promise.reject(new Error('Google Drive API client not initialized'));
  }
  return window.gapi.auth2.getAuthInstance().signIn();
}

/**
 * Sign out from Google
 */
export function signOutFromGoogle() {
  if (!isInitialized) {
    return Promise.reject(new Error('Google Drive API client not initialized'));
  }
  return window.gapi.auth2.getAuthInstance().signOut();
}

/**
 * Check if user is authenticated with Google
 * @returns {boolean}
 */
export function isUserAuthenticated() {
  return isAuthenticated;
}

/**
 * List all media files from the specified Google Drive folder
 * @param {number} maxResults Maximum number of results to return (default: 100)
 * @returns {Promise<Array>} Array of file metadata
 */
export async function listMediaFromDrive(maxResults = 100) {
  if (!isInitialized || !isAuthenticated) {
    throw new Error('Not authenticated with Google Drive');
  }
  
  if (!FOLDER_ID) {
    throw new Error('No Google Drive folder ID specified');
  }
  
  try {
    // Search for media files in the specified folder
    const response = await window.gapi.client.drive.files.list({
      q: `'${FOLDER_ID}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`,
      fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: maxResults
    });
    
    return response.result.files || [];
  } catch (error) {
    console.error('Error listing files from Google Drive', error);
    throw error;
  }
}

/**
 * Get a direct download URL for a file
 * @param {string} fileId Google Drive file ID
 * @returns {Promise<string>} Download URL
 */
export async function getMediaDownloadUrl(fileId) {
  if (!isInitialized || !isAuthenticated) {
    throw new Error('Not authenticated with Google Drive');
  }
  
  try {
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'webContentLink,webViewLink'
    });
    
    // For direct download, webContentLink needs to be modified
    // to remove the "download" query parameter
    let downloadUrl = response.result.webContentLink;
    if (downloadUrl) {
      downloadUrl = downloadUrl.replace('&export=download', '');
    } else {
      // Fallback to the view link if download link isn't available
      downloadUrl = response.result.webViewLink;
    }
    
    return downloadUrl;
  } catch (error) {
    console.error('Error getting file download URL', error);
    throw error;
  }
}

/**
 * Get public URL for an image or video to use in the gallery
 * @param {string} fileId Google Drive file ID
 * @returns {Promise<string>} Public URL
 */
export async function getMediaPublicUrl(fileId) {
  if (!isInitialized || !isAuthenticated) {
    throw new Error('Not authenticated with Google Drive');
  }
  
  // For images, we can use the Google Drive thumbnail API
  // This works well for images but not for videos
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Set the Google Drive folder ID to fetch media from
 * @param {string} folderId Google Drive folder ID
 */
export function setGoogleDriveFolderId(folderId) {
  FOLDER_ID = folderId;
}