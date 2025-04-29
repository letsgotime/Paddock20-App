import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock data for initial listings - this would be replaced with real API calls in a production environment
const initialListings = [
  {
    id: 'watch-1',
    type: 'timepiece',
    brand: 'Patek Philippe',
    model: 'Nautilus',
    reference: '5711/1A-014',
    year: 2021,
    price: 175000,
    currency: 'USD',
    condition: 'New',
    description: 'Olive green dial, stainless steel case and bracelet, extremely rare and highly sought after.',
    serialNumber: 'PP78224591',
    boxPapers: true,
    location: 'New York, NY',
    seller: 'Authorized Dealer',
    sellerRating: 4.9,
    images: ['nautilus-green.jpg'],
    featured: true,
    dateAdded: '2025-04-15',
    sold: false
  },
  {
    id: 'watch-2',
    type: 'timepiece',
    brand: 'Rolex',
    model: 'Daytona',
    reference: '116500LN',
    year: 2024,
    price: 45000,
    currency: 'USD',
    condition: 'New',
    description: 'White dial, Cerachrom bezel, stainless steel case and Oyster bracelet. Includes box and papers.',
    serialNumber: 'RLX287661234',
    boxPapers: true,
    location: 'Miami, FL',
    seller: 'GoTime Brokerage',
    sellerRating: 5.0,
    images: ['daytona-white.jpg'],
    featured: true,
    dateAdded: '2025-04-20',
    sold: false
  },
  {
    id: 'car-1',
    type: 'vehicle',
    brand: 'Ferrari',
    model: '458 Italia',
    year: 2014,
    price: 219000,
    currency: 'USD',
    mileage: 8750,
    condition: 'Excellent',
    description: 'Rosso Corsa, tan interior, carbon fiber accents, recently serviced, 1 owner, complete service history.',
    vin: 'ZFF67NFA4E0198495',
    engineType: '4.5L V8',
    transmission: 'Dual-clutch automatic',
    location: 'Los Angeles, CA',
    seller: 'Paddock20 Premium',
    sellerRating: 4.8,
    images: ['ferrari-458.jpg'],
    featured: true,
    dateAdded: '2025-04-10',
    sold: false
  }
];

// Create a store for marketplace listings
export const useMarketplaceStore = create(
  persist(
    (set, get) => ({
      listings: initialListings,
      isAdmin: false, // By default, users are not admins
      
      // Set admin status (in a real app, this would be determined by authentication)
      setAdminStatus: (status) => set({ isAdmin: status }),
      
      // Add a new listing (admin only)
      addListing: (listing) => {
        if (!get().isAdmin) {
          console.error("Permission denied: Only admins can add listings");
          return false;
        }
        
        const newListing = {
          ...listing,
          id: `${listing.type}-${Date.now()}`,
          dateAdded: new Date().toISOString().split('T')[0],
          sold: false
        };
        
        set((state) => ({
          listings: [...state.listings, newListing]
        }));
        
        return true;
      },
      
      // Update a listing (admin only)
      updateListing: (id, updatedData) => {
        if (!get().isAdmin) {
          console.error("Permission denied: Only admins can update listings");
          return false;
        }
        
        set((state) => ({
          listings: state.listings.map(listing => 
            listing.id === id ? { ...listing, ...updatedData } : listing
          )
        }));
        
        return true;
      },
      
      // Remove a listing (admin only)
      removeListing: (id) => {
        if (!get().isAdmin) {
          console.error("Permission denied: Only admins can remove listings");
          return false;
        }
        
        set((state) => ({
          listings: state.listings.filter(listing => listing.id !== id)
        }));
        
        return true;
      },
      
      // Mark a listing as sold (admin only)
      markAsSold: (id) => {
        if (!get().isAdmin) {
          console.error("Permission denied: Only admins can mark listings as sold");
          return false;
        }
        
        set((state) => ({
          listings: state.listings.map(listing => 
            listing.id === id ? { ...listing, sold: true } : listing
          )
        }));
        
        return true;
      },
      
      // Get listings filtered by type
      getListingsByType: (type) => {
        return get().listings.filter(listing => listing.type === type && !listing.sold);
      },
      
      // Get a single listing by ID
      getListingById: (id) => {
        return get().listings.find(listing => listing.id === id);
      },
      
      // Get featured listings
      getFeaturedListings: () => {
        return get().listings.filter(listing => listing.featured && !listing.sold);
      }
    }),
    {
      name: 'marketplace-storage', // Name for localStorage
      getStorage: () => localStorage // Use localStorage for persistence
    }
  )
);

export default {
  useMarketplaceStore
};