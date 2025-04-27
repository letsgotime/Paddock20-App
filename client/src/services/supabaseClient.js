// Mock Supabase client for demo mode
const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: new Date().getTime() + 3600000,
  token_type: 'bearer',
  user: {
    id: 'preview-user',
    email: 'preview@example.com',
    role: 'authenticated',
    app_metadata: { provider: 'email' },
    user_metadata: { name: 'Preview User' },
    aud: 'authenticated',
    created_at: new Date().toISOString()
  }
};

const supabase = {
  from: (table) => ({
    select: (columns) => {
      return {
        data: table === 'Vehicles' ? [
          {
            id: 1,
            car_name: 'Ferrari 458 Italia',
            vin: 'ZFF67NFA3D0189245',
            tire_pressure_front: '35',
            tire_pressure_rear: '32',
            torque_spec: '94',
            mileage: '4380',
            service_history: 'Full dealer service history',
            insurance_docs: 'Updated 04/01/2025',
            ownership_docs: 'Clear title'
          },
          {
            id: 2,
            car_name: 'Porsche 911 GT3',
            vin: 'WP0AC2A92KS161247',
            tire_pressure_front: '32',
            tire_pressure_rear: '30',
            torque_spec: '96',
            mileage: '2310',
            service_history: 'Routine maintenance up to date',
            insurance_docs: 'Updated 03/15/2025',
            ownership_docs: 'Clear title'
          }
        ] : table === 'VehicleMods' ? [
          {
            id: 1,
            vehicle_id: 1,
            name: 'Novitec Carbon Fiber Rear Wing',
            date_installed: '2025-03-15',
            description: 'Increases downforce by approximately 30% at high speeds',
            cost: 4250.00
          },
          {
            id: 2,
            vehicle_id: 1,
            name: 'Akrapovic Titanium Exhaust System',
            date_installed: '2025-02-10',
            description: '+15hp, -12kg weight reduction over stock',
            cost: 6800.00
          }
        ] : table === 'UserChecklists' ? [
          {
            id: 1,
            user_id: 'preview-user',
            checklist_name: 'seasonal',
            item_name: 'Check tire pressure',
            is_complete: false
          }
        ] : [],
        error: null,
        eq: (field, value) => ({
          data: [{ is_complete: false }],
          error: null,
          eq: (field2, value2) => ({
            data: [{ is_complete: false }],
            error: null,
            single: () => ({
              data: { is_complete: false },
              error: null
            })
          }),
          single: () => ({
            data: { is_complete: false },
            error: null
          })
        })
      };
    },
    insert: (data) => {
      const newItem = Array.isArray(data) ? data[0] : data;
      return {
        data: [{ ...newItem, id: Math.floor(Math.random() * 1000) }],
        error: null,
        select: () => ({
          data: [{ ...newItem, id: Math.floor(Math.random() * 1000) }],
          error: null
        })
      };
    },
    upsert: (data) => {
      return Promise.resolve({
        data: { ...data, id: Math.floor(Math.random() * 1000) },
        error: null
      });
    },
    eq: (field, value) => {
      if (table === 'VehicleMods') {
        return {
          data: [
            {
              id: 1,
              vehicle_id: value,
              name: 'Novitec Carbon Fiber Rear Wing',
              date_installed: '2025-03-15',
              description: 'Increases downforce by approximately 30% at high speeds',
              cost: 4250.00
            },
            {
              id: 2,
              vehicle_id: value,
              name: 'Akrapovic Titanium Exhaust System',
              date_installed: '2025-02-10',
              description: '+15hp, -12kg weight reduction over stock',
              cost: 6800.00
            }
          ],
          error: null,
          // Support for chaining .eq() calls
          eq: (field2, value2) => ({
            data: [{
              id: 1,
              is_complete: false,
              item_name: value2
            }],
            error: null,
            single: () => ({
              data: { is_complete: false },
              error: null
            })
          })
        };
      }
      return {
        select: () => {
      console.log(`Supabase mock client selecting from table: ${table}`);
          return {
            data: table === 'Vehicles' && field === 'id' && value === '1' ? 
              { id: 1, car_name: 'Ferrari 458 Italia' } :
              { id: 2, car_name: 'Porsche 911 GT3' },
            error: null
          };
        },
        single: () => {
          return {
            data: table === 'Vehicles' && field === 'id' && value === '1' ? 
              { id: 1, car_name: 'Ferrari 458 Italia' } :
              { id: 2, car_name: 'Porsche 911 GT3' },
            error: null
          };
        },
        // Support for chaining .eq() calls
        eq: (field2, value2) => ({
          data: [{
            id: 1,
            is_complete: false,
            item_name: value2
          }],
          error: null,
          single: () => ({
            data: { is_complete: false },
            error: null
          })
        })
      };
    },
    single: () => {
      return {
        data: { id: 1, car_name: 'Ferrari 458 Italia' },
        error: null
      };
    }
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: { id: 'preview-user' } } }),
    getSession: () => Promise.resolve({ data: { session: mockSession } }),
    signOut: () => Promise.resolve({ error: null }),
    signIn: () => Promise.resolve({ data: { session: mockSession }, error: null }),
    signUp: () => Promise.resolve({ data: { session: mockSession }, error: null }),
    onAuthStateChange: (callback) => {
      // Immediately call the callback with the mock session
      setTimeout(() => callback('SIGNED_IN', mockSession), 0);
      
      // Return a mock subscription
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};

console.log('Using mocked Supabase client for demo mode');

export default supabase;