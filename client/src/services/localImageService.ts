/**
 * Local Image Service
 * 
 * A simplified service for handling image uploads without external API dependencies
 */

interface LocalImage {
  id: string;
  url: string;
  thumbnail: string;
  name: string;
  type: string;
  description?: string;
  dateAdded: string;
}

// Mock image gallery that will be replaced with proper file upload functionality
const mockImageGallery = [
  {
    id: 'car1',
    url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    name: 'Sports Car',
    type: 'image/jpeg',
    description: 'Luxury sports car',
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    id: 'car2',
    url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    name: 'Classic Car',
    type: 'image/jpeg',
    description: 'Vintage classic',
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    id: 'car3',
    url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    name: 'SUV',
    type: 'image/jpeg',
    description: 'Premium SUV',
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    id: 'car4',
    url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    name: 'Supercar',
    type: 'image/jpeg',
    description: 'High-performance supercar',
    dateAdded: new Date().toISOString().split('T')[0]
  },
];

// Simulate localStorage persistence
const LOCAL_STORAGE_KEY = 'paddock20_local_images';

// Initialize local storage on first load
function initLocalStorage() {
  if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockImageGallery));
  }
}

// Get all images from local storage
export function getLocalImages(): LocalImage[] {
  initLocalStorage();
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
}

// Add a new image to local storage
export function addLocalImage(image: Omit<LocalImage, 'id' | 'dateAdded'>): LocalImage {
  const newImage: LocalImage = {
    ...image,
    id: Date.now().toString(),
    dateAdded: new Date().toISOString().split('T')[0]
  };
  
  const images = getLocalImages();
  images.push(newImage);
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(images));
  return newImage;
}

// Handle file upload
export async function handleImageUpload(file: File): Promise<LocalImage> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const imageUrl = event.target.result.toString();
          
          // Create a new image element to generate thumbnail
          const img = new Image();
          img.src = imageUrl;
          
          img.onload = () => {
            // Create canvas for thumbnail
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set thumbnail dimensions
            const MAX_WIDTH = 200;
            const MAX_HEIGHT = 200;
            
            let width = img.width;
            let height = img.height;
            
            // Calculate thumbnail dimensions maintaining aspect ratio
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw thumbnail
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Get thumbnail as data URL
            const thumbnailUrl = canvas.toDataURL(file.type);
            
            // Create and save the new image
            const newImage = addLocalImage({
              url: imageUrl,
              thumbnail: thumbnailUrl,
              name: file.name,
              type: file.type,
              description: `Uploaded on ${new Date().toLocaleDateString()}`
            });
            
            resolve(newImage);
          };
        } else {
          reject(new Error('Failed to load image'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
}

// Remove an image from local storage
export function removeLocalImage(id: string): boolean {
  const images = getLocalImages();
  const filteredImages = images.filter(image => image.id !== id);
  
  if (filteredImages.length !== images.length) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredImages));
    return true;
  }
  
  return false;
}

export default {
  getLocalImages,
  addLocalImage,
  handleImageUpload,
  removeLocalImage
};