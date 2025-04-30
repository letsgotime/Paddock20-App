import { createClient } from '@supabase/supabase-js';

console.log("Using mocked Supabase client for demo mode");

const isMock = import.meta.env.VITE_USE_MOCK_SUPABASE === 'true' || true; // Force mock for now

// Try to create real Supabase client if configured
const realSupabase = () => {
  try {
    return createClient(
      import.meta.env.VITE_SUPABASE_URL || '',
      import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    );
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return null;
  }
};

// Mock data
const mockVehicles = [
  {
    id: "v-001",
    make: "Ferrari",
    model: "458 Italia",
    year: 2015,
    trim: "Speciale",
    vin: "ZFF75VHB000123456",
    license_plate: "GLOSS1",
    color: "Rosso Corsa",
    image_url: "/assets/ferrari-458.jpg",
    purchase_date: "2023-01-15",
    purchase_price: 180000,
    current_value: 195000,
    status: "Active",
    drivetrain: "RWD",
    engine_type: "V8",
    transmission: "F1 DCT",
    fuel_type: "Premium Unleaded",
    mileage: 12580,
    notes: "Weekend car, ceramic coated",
    created_at: "2023-01-20T12:00:00Z",
    updated_at: "2023-06-01T14:30:00Z",
    user_id: "demo-user",
    maintenance_count: 4,
    modifications_count: 7,
    documents_count: 12,
    last_service_date: "2023-11-15",
    next_service_date: "2024-05-15",
    next_service_miles: 15000,
    insurance_renewal_date: "2024-01-15",
    inspection_due_date: "2024-02-10",
    last_detailed_date: "2023-12-20"
  },
  {
    id: "v-002",
    make: "Porsche",
    model: "911",
    year: 2019,
    trim: "GT3 RS",
    vin: "WP0AF2A90KS123456",
    license_plate: "GT3LIFE",
    color: "Guards Red",
    image_url: "/assets/porsche-911.jpg",
    purchase_date: "2022-08-10",
    purchase_price: 200000,
    current_value: 210000,
    status: "Active",
    drivetrain: "RWD",
    engine_type: "Flat-6",
    transmission: "7-Speed PDK",
    fuel_type: "Premium Unleaded",
    mileage: 8250,
    notes: "Track days only, upgraded brakes",
    created_at: "2022-08-15T10:20:00Z",
    updated_at: "2023-07-20T16:45:00Z",
    user_id: "demo-user",
    maintenance_count: 2,
    modifications_count: 5,
    documents_count: 8,
    last_service_date: "2023-12-05",
    next_service_date: "2024-06-05",
    next_service_miles: 10000,
    insurance_renewal_date: "2024-08-10",
    inspection_due_date: "2024-07-15",
    last_detailed_date: "2024-01-05"
  },
  {
    id: "v-003",
    make: "Aston Martin",
    model: "Vantage",
    year: 2021,
    trim: "V8",
    vin: "SCFSMGAW0NGJ12345",
    license_plate: "SHAKEN",
    color: "Onyx Black",
    image_url: "/assets/aston-martin.jpg",
    purchase_date: "2023-03-22",
    purchase_price: 160000,
    current_value: 155000,
    status: "Stored",
    drivetrain: "RWD",
    engine_type: "4.0L Twin-Turbo V8",
    transmission: "8-Speed Automatic",
    fuel_type: "Premium Unleaded",
    mileage: 5670,
    notes: "Winter storage, summer vehicle",
    created_at: "2023-03-25T09:15:00Z",
    updated_at: "2023-09-10T11:30:00Z",
    user_id: "demo-user",
    maintenance_count: 1,
    modifications_count: 3,
    documents_count: 5,
    last_service_date: "2023-09-10",
    next_service_date: "2024-03-10",
    next_service_miles: 7500,
    insurance_renewal_date: "2024-03-22",
    inspection_due_date: "2024-04-15",
    last_detailed_date: "2023-10-20"
  }
];

const mockDocuments = [
  {
    id: "d-001",
    vehicle_id: "v-001",
    title: "Purchase Agreement",
    document_type: "legal",
    file_url: "https://example.com/documents/purchase_ferrari.pdf",
    created_at: "2023-01-15T12:30:00Z",
    updated_at: "2023-01-15T12:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "d-002",
    vehicle_id: "v-001",
    title: "Service Records",
    document_type: "maintenance",
    file_url: "https://example.com/documents/service_ferrari.pdf",
    created_at: "2023-03-25T16:45:00Z",
    updated_at: "2023-03-25T16:45:00Z",
    user_id: "demo-user"
  },
  {
    id: "d-003",
    vehicle_id: "v-002",
    title: "Track Day Registration",
    document_type: "event",
    file_url: "https://example.com/documents/track_day.pdf",
    created_at: "2023-02-10T09:15:00Z",
    updated_at: "2023-02-10T09:15:00Z",
    user_id: "demo-user"
  }
];

const mockUserProfile = {
  id: "demo-user",
  email: "user@example.com",
  first_name: "Demo",
  last_name: "User",
  membership_tier: "paddock20",
  points: 2500,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-10-15T14:30:00Z"
};

// Enhanced mock Supabase client
const mockSupabase = {
  from: (table) => {
    // Return different mock data based on table name
    const getMockData = () => {
      switch(table) {
        case 'vehicles': return mockVehicles;
        case 'documents': return mockDocuments;
        case 'profiles': return [mockUserProfile];
        default: return [];
      }
    };
    
    return {
      select: (columns = '*') => {
        // Return a chainable object
        return {
          eq: (column, value) => {
            const filteredData = getMockData().filter(item => item[column] === value);
            return {
              single: () => Promise.resolve({ data: filteredData[0] || null, error: null }),
              order: (orderByColumn, { ascending } = { ascending: false }) => ({
                limit: (limitCount) => Promise.resolve({ 
                  data: filteredData.slice(0, limitCount || filteredData.length), 
                  error: null 
                })
              }),
            };
          },
          order: (column, { ascending } = { ascending: false }) => ({
            limit: (limitCount) => Promise.resolve({ 
              data: getMockData().slice(0, limitCount || getMockData().length), 
              error: null 
            })
          }),
          limit: (limitCount) => Promise.resolve({
            data: getMockData().slice(0, limitCount || getMockData().length),
            error: null
          }),
        };
      },
      insert: (data) => ({
        select: () => Promise.resolve({
          data: Array.isArray(data) 
            ? data.map((item, i) => ({ id: `new-${i}`, ...item, created_at: new Date().toISOString() }))
            : [{ id: 'new-1', ...data, created_at: new Date().toISOString() }],
          error: null
        })
      }),
      update: (data) => ({
        eq: (column, value) => ({
          select: () => Promise.resolve({
            data: [{ id: value, ...data, updated_at: new Date().toISOString() }],
            error: null
          })
        })
      }),
      delete: () => ({
        eq: (column, value) => Promise.resolve({ data: null, error: null }),
      }),
    };
  },
  auth: {
    getUser: () => Promise.resolve({ 
      data: { user: { id: 'demo-user', email: 'user@example.com' } }, 
      error: null 
    }),
    signIn: () => Promise.resolve({ user: { id: 'demo-user', email: 'user@example.com' }, error: null }),
    signUp: () => Promise.resolve({ user: { id: 'demo-user', email: 'user@example.com' }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    session: () => ({ user: { id: 'demo-user', email: 'user@example.com' } }),
    onAuthStateChange: (callback) => {
      setTimeout(() => {
        callback('SIGNED_IN', { user: { id: 'demo-user', email: 'user@example.com' } });
      }, 0);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    getSession: () => Promise.resolve({ 
      data: { session: { user: { id: 'demo-user', email: 'user@example.com' } } },
      error: null 
    }),
  },
  storage: {
    from: (bucket) => ({
      upload: (path, file) => Promise.resolve({ data: { path }, error: null }),
      getPublicUrl: (path) => ({ data: { publicUrl: `https://example.com/${path}` } }),
      remove: (paths) => Promise.resolve({ data: {}, error: null }),
      list: (prefix) => Promise.resolve({ data: [{ name: 'sample.jpg' }], error: null }),
    }),
  },
};

// Choose between real and mock client
const supabase = isMock ? mockSupabase : realSupabase();

export default supabase;