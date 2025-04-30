// Mock Supabase client for development while we implement our own database solution
// This prevents errors from missing Supabase credentials
console.log("Using mocked Supabase client - switching to our own database solution");

const supabase = {
  _isMockClient: true,
  
  auth: {
    signIn: () => Promise.resolve({ user: { id: '1', email: 'user@example.com' }, error: null }),
    signUp: () => Promise.resolve({ user: { id: '1', email: 'user@example.com' }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    session: () => ({ user: { id: '1', email: 'user@example.com' } }),
    onAuthStateChange: (callback) => {
      // Mock implementation of auth state change listener
      setTimeout(() => {
        callback('SIGNED_IN', { user: { id: '1', email: 'user@example.com' } });
      }, 0);
      const unsubscribe = () => {};
      return { data: { subscription: { unsubscribe } } };
    },
    getSession: () => Promise.resolve({ 
      data: { session: { user: { id: '1', email: 'user@example.com' } } },
      error: null 
    }),
    getUser: () => Promise.resolve({ 
      data: { user: { id: '1', email: 'user@example.com' } },
      error: null 
    }),
  },
  
  from: (table) => ({
    select: (columns = '*') => ({
      eq: (column, value) => ({
        single: () => Promise.resolve({ data: { id: 1, name: 'Sample Data' }, error: null }),
        match: (criteria) => Promise.resolve({ data: [{ id: 1, name: 'Sample Data' }], error: null }),
        order: () => ({ limit: () => Promise.resolve({ data: [{ id: 1, name: 'Sample Data' }], error: null }) }),
      }),
      match: (criteria) => Promise.resolve({ data: [{ id: 1, name: 'Sample Data' }], error: null }),
      order: () => ({ limit: () => Promise.resolve({ data: [{ id: 1, name: 'Sample Data' }], error: null }) }),
    }),
    insert: (data) => Promise.resolve({ data: [{ id: 1, ...data }], error: null }),
    update: (data) => ({
      eq: (column, value) => Promise.resolve({ data: [{ id: 1, ...data }], error: null }),
      match: (criteria) => Promise.resolve({ data: [{ id: 1, ...data }], error: null }),
    }),
    delete: () => ({
      eq: (column, value) => Promise.resolve({ data: [{ id: 1 }], error: null }),
      match: (criteria) => Promise.resolve({ data: [{ id: 1 }], error: null }),
    }),
  }),
  
  storage: {
    from: (bucket) => ({
      upload: (path, file) => Promise.resolve({ data: { path }, error: null }),
      getPublicUrl: (path) => ({ data: { publicUrl: `https://example.com/${path}` } }),
      remove: (paths) => Promise.resolve({ data: {}, error: null }),
      list: (prefix) => Promise.resolve({ data: [{ name: 'sample.jpg' }], error: null }),
    }),
  },
};

export default supabase;