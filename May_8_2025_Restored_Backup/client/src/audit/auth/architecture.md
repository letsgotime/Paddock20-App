# Authentication System Architecture Audit

## Current Auth System Structure

The application implements **three parallel authentication systems** that are layered on top of each other:

### 1. Supabase Auth (External Provider)
- **Location**: `client/src/context/SupabaseAuthContext.tsx`
- **Client**: `client/src/services/supabaseClient.ts`
- **Usage**: Wrapped around the entire app in `main.tsx`
- **Status**: Active, used as the outermost auth wrapper
- **Features**: Full Supabase auth capabilities including session management
- **Notes**: Uses hardcoded credentials for Supabase, not using environment variables

### 2. Native Auth (Internal API)
- **Location**: `client/src/hooks/useNativeAuth.tsx`
- **Usage**: Used in App.tsx to protect routes
- **Status**: Active, primary system handling login/register/logout
- **API Endpoints**: 
  - `/api/auth/me` (authentication check)
  - `/api/auth/login` (login with email/password)
  - `/api/auth/register` (user registration)
  - `/api/auth/logout` (user logout)
- **Features**: Local session management with API calls to backend
- **Notes**: The API endpoints are returning 401s in the console logs

### 3. Auth Compatibility Layer
- **Location**: `client/src/hooks/useAuth.tsx`
- **Usage**: Wrapped inside NativeAuthProvider in App.tsx
- **Status**: Active, serves as a compatibility layer
- **Purpose**: Adapts NativeAuth to a different interface for legacy components
- **Notes**: Directly depends on useNativeAuth, transforming its response format

## Relationships and Dependencies

1. **Supabase Auth** is completely independent of the other two systems
2. **Auth Compatibility Layer** depends on **Native Auth**
3. Component hierarchy:
   - `<SupabaseAuthProvider>` (main.tsx)
     - `<NativeAuthProvider>` (App.tsx)
       - `<AuthProvider>` (Auth compatibility layer)
         - Application components

## Issues Identified

1. **Multiple sources of truth**: The app has three different auth states
2. **Inconsistent APIs**: Each system has different method signatures
3. **Backend connection issues**: Native auth API endpoints returning 401s
4. **Hardcoded credentials**: Supabase credentials hardcoded in the client
5. **Unclear user flow**: The relationship between these systems in the user experience is unclear
6. **Redundant providers**: Multiple providers wrapping the application with similar functionality

## Proposed Solution

### Short-term (Organizational)
1. Decide on a primary auth system (likely NativeAuth based on App.tsx usage)
2. Document dependencies clearly
3. Organize files consistently (move SupabaseAuthContext to hooks directory for consistency)

### Medium-term (Simplification)
1. Reduce to a single primary auth system with clear responsibility
2. Maintain compatibility layers for transitioning components
3. Implement proper environment variable handling for Supabase

### Long-term (Complete Redesign)
1. Implement a single, unified auth system
2. Remove all compatibility layers
3. Ensure consistent API usage throughout the application