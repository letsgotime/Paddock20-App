# Proposed Authentication Structure

## Core Structure

We should consolidate to a single primary authentication system with clean separation of concerns:

```
├── auth/
│   ├── AuthProvider.tsx         # Main authentication provider (single source of truth)
│   ├── useAuth.tsx              # Primary hook for all components to use
│   ├── types.ts                 # Shared authentication types
│   ├── api.ts                   # API calls to authentication endpoints
│   └── storage.ts               # Local storage utilities for auth state
├── auth-adapters/               # Optional adapters for external auth systems
│   ├── supabase-adapter.ts      # Adapter for Supabase Auth
│   └── auth0-adapter.ts         # Adapter for Auth0
```

## Implementation Strategy

### 1. Single Auth Provider

Create one main `AuthProvider` that:
- Serves as the single source of truth for auth state
- Handles authentication logic (login, logout, registration)
- Interfaces with the backend API
- Manages user session persistence

```tsx
// AuthProvider.tsx
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Authentication methods (login, register, logout)
  // Session checking logic
  // Error handling

  const authValue = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    // Other auth methods
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};
```

### 2. Clean Hook API

Provide a single, well-documented hook for components to use:

```tsx
// useAuth.tsx
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 3. Separation of API Calls

Extract API-related code to a separate module:

```tsx
// api.ts
export async function checkAuthStatus(): Promise<ApiResponse<User>> {
  return apiRequest('GET', '/api/auth/me');
}

export async function loginUser(credentials: LoginCredentials): Promise<ApiResponse<User>> {
  return apiRequest('POST', '/api/auth/login', credentials);
}

// Other API calls
```

## Application Integration

### In main.tsx:

```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);
```

### In App.tsx:

```tsx
function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    // Application components with protection based on isAuthenticated
  );
}
```

## Migration Plan

1. Create the new auth structure in parallel to existing systems
2. Update main.tsx to use the new AuthProvider
3. Gradually migrate components to use the new useAuth hook
4. Once all components are migrated, remove old auth systems

## External Auth Providers (Optional)

If needed, create adapter modules for external providers like Supabase or Auth0:

```tsx
// supabase-adapter.ts
export function initSupabaseAuth(authActions: AuthActions): void {
  const supabase = createClient(...);
  
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      // Map Supabase user to our User type
      const mappedUser = mapSupabaseUser(session.user);
      // Update our auth context
      authActions.setUser(mappedUser);
    } else if (event === 'SIGNED_OUT') {
      authActions.clearUser();
    }
  });
}
```

This architecture provides:
1. One clear source of truth for authentication state
2. Clean separation of concerns
3. Simplified API for components
4. Flexibility to adapt external auth providers if needed
5. Clear migration path from current system