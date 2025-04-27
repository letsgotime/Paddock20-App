/**
 * Mock Supabase client for demonstration purposes
 * This simulates the functionality of Supabase in a demo environment
 * In a production application, this would use the actual Supabase client
 */

// Demo data
const mockData = {
  vehicles: [
    {
      id: 1,
      userId: 1,
      make: 'Ferrari',
      model: 'F8 Tributo',
      year: 2022,
      color: 'Rosso Corsa',
      vin: 'ZFF92LMC000123456',
      purchaseDate: '2022-02-15',
      image: 'https://placehold.co/600x400?text=Ferrari+F8',
      notes: 'Weekend track car. New ceramic brakes installed.',
    },
    {
      id: 2,
      userId: 1,
      make: 'Porsche',
      model: '911 GT3',
      year: 2023,
      color: 'Racing Yellow',
      vin: 'WP0AC2A93KS184356',
      purchaseDate: '2023-05-20',
      image: 'https://placehold.co/600x400?text=Porsche+911',
      notes: 'Daily driver. Recent service at 5,000 miles.',
    },
    {
      id: 3,
      userId: 1,
      make: 'Aston Martin',
      model: 'Vantage',
      year: 2021,
      color: 'Quantum Silver',
      vin: 'SCFSMGAW3MGJ02133',
      purchaseDate: '2021-11-10',
      image: 'https://placehold.co/600x400?text=Aston+Martin',
      notes: 'Weekend cruiser. Custom exhaust installed.',
    }
  ],
  maintenance: [
    {
      id: 1,
      vehicleId: 1,
      title: 'Annual Service',
      description: 'Full service including oil change, filters, and fluid check',
      date: '2023-02-10',
      odometer: 5230,
      cost: 1250,
      shopName: 'Ferrari of Beverly Hills',
      completed: true
    },
    {
      id: 2,
      vehicleId: 1,
      title: 'Brake Pad Replacement',
      description: 'Replace front and rear brake pads with ceramic pads',
      date: '2023-05-15',
      odometer: 8450,
      cost: 3200,
      shopName: 'Ferrari of Beverly Hills',
      completed: true
    },
    {
      id: 3,
      vehicleId: 2,
      title: 'Tire Rotation',
      description: 'Rotate and balance all tires',
      date: '2023-06-22',
      odometer: 12500,
      cost: 350,
      shopName: 'Porsche Service Center',
      completed: true
    }
  ],
  mods: [
    {
      id: 1,
      vehicleId: 1,
      title: 'Exhaust System',
      description: 'Aftermarket titanium exhaust system',
      installDate: '2023-03-20',
      cost: 8500,
      provider: 'Novitec',
      status: 'completed'
    },
    {
      id: 2,
      vehicleId: 2,
      title: 'Carbon Fiber Interior',
      description: 'Carbon fiber trim package for interior',
      installDate: '2023-07-05',
      cost: 4200,
      provider: 'Porsche Exclusive',
      status: 'completed'
    },
    {
      id: 3,
      vehicleId: 3,
      title: 'ECU Tune',
      description: 'Performance ECU tune for increased horsepower',
      installDate: '2023-08-12',
      cost: 2800,
      provider: 'AMR Performance',
      status: 'completed'
    }
  ],
  dreamAssets: [
    {
      id: 1,
      userId: 1,
      type: 'vehicle',
      make: 'Lamborghini',
      model: 'Revuelto',
      year: 2024,
      estimatedPrice: 650000,
      targetDate: '2025-06-01',
      notes: 'Next flagship purchase. Looking for Verde Mantis color.',
      progress: 65
    },
    {
      id: 2,
      userId: 1,
      type: 'watch',
      brand: 'Audemars Piguet',
      model: 'Royal Oak Offshore',
      year: 2023,
      estimatedPrice: 85000,
      targetDate: '2024-12-15',
      notes: 'Black ceramic version. Already on waiting list.',
      progress: 80
    },
    {
      id: 3,
      userId: 1,
      type: 'property',
      name: 'Track House',
      location: 'Thermal Club, Palm Springs',
      estimatedPrice: 2500000,
      targetDate: '2026-01-01',
      notes: 'Villa with 4 car garage and track access.',
      progress: 30
    }
  ]
};

console.log('Using mocked Supabase client for demo mode');

// Create a mock Supabase client
const supabase = {
  // Auth methods
  auth: {
    signIn: async ({ email, password }) => {
      return { 
        data: { user: { id: 1, email } }, 
        error: null 
      };
    },
    signUp: async ({ email, password }) => {
      return { 
        data: { user: { id: 1, email } }, 
        error: null 
      };
    },
    signOut: async () => {
      return { error: null };
    }
  },
  
  // Database methods
  from: (table) => ({
    select: (columns = '*') => ({
      eq: (column, value) => {
        const result = mockData[table]?.filter(item => item[column] === value) || [];
        return Promise.resolve({ data: result, error: null });
      },
      order: (column, { ascending = true } = {}) => {
        const sorted = [...(mockData[table] || [])].sort((a, b) => {
          if (ascending) {
            return a[column] > b[column] ? 1 : -1;
          } else {
            return a[column] < b[column] ? 1 : -1;
          }
        });
        return Promise.resolve({ data: sorted, error: null });
      },
      then: (resolve) => {
        resolve({ data: mockData[table] || [], error: null });
        return Promise.resolve({ data: mockData[table] || [], error: null });
      }
    }),
    insert: (data) => {
      if (!mockData[table]) {
        mockData[table] = [];
      }
      
      const newId = mockData[table].length > 0 
        ? Math.max(...mockData[table].map(item => item.id)) + 1 
        : 1;
      
      const newItem = {
        id: newId,
        ...data,
        created_at: new Date().toISOString()
      };
      
      mockData[table].push(newItem);
      
      return Promise.resolve({ data: newItem, error: null });
    },
    update: (data) => ({
      eq: (column, value) => {
        const index = mockData[table]?.findIndex(item => item[column] === value);
        
        if (index !== undefined && index !== -1) {
          mockData[table][index] = {
            ...mockData[table][index],
            ...data,
            updated_at: new Date().toISOString()
          };
          
          return Promise.resolve({ 
            data: mockData[table][index], 
            error: null 
          });
        }
        
        return Promise.resolve({ 
          data: null, 
          error: { message: 'Item not found' } 
        });
      }
    }),
    delete: () => ({
      eq: (column, value) => {
        const index = mockData[table]?.findIndex(item => item[column] === value);
        
        if (index !== undefined && index !== -1) {
          const deleted = mockData[table].splice(index, 1);
          return Promise.resolve({ data: deleted[0], error: null });
        }
        
        return Promise.resolve({ 
          data: null, 
          error: { message: 'Item not found' } 
        });
      }
    })
  }),
  
  // Storage methods
  storage: {
    from: (bucket) => ({
      upload: (path, file) => {
        return Promise.resolve({ 
          data: { path }, 
          error: null 
        });
      },
      getPublicUrl: (path) => {
        return { 
          data: { publicUrl: `https://placehold.co/600x400?text=Uploaded+Image` } 
        };
      }
    })
  }
};

export default supabase;