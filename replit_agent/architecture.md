# Paddock20 Architecture

## Overview

Paddock20 is a full-stack web application centered around automotive and motorsports enthusiasts. The application provides features for vehicle management, weather tracking, user profiles, driving journals, and various specialized components like the "JuiceBox" for detailing and "Manifestation Station" for goal tracking.

The application follows a modern web architecture with a React frontend and a Node.js Express backend. It uses a PostgreSQL database with Drizzle ORM for data persistence and incorporates various third-party APIs for functionality like weather data and authentication.

## System Architecture

### High-Level Architecture

Paddock20 follows a client-server architecture with:

1. **Frontend**: React-based single-page application built with Vite
2. **Backend**: Node.js server using Express
3. **Database**: PostgreSQL with Drizzle ORM
4. **API Integrations**: Multiple third-party APIs (OpenWeather, Unsplash, etc.)

```
┌─────────────┐      ┌────────────┐      ┌─────────────┐
│             │      │            │      │             │
│   Frontend  │<────>│   Backend  │<────>│   Database  │
│  (React/TS) │      │  (Node.js) │      │ (PostgreSQL)│
│             │      │            │      │             │
└─────────────┘      └────────────┘      └─────────────┘
       ▲                   ▲
       │                   │
       ▼                   ▼
┌─────────────┐      ┌────────────┐
│   Browser   │      │ Third-party│
│   Storage   │      │    APIs    │
└─────────────┘      └────────────┘
```

### File Structure

The repository follows a modern full-stack project structure:

- `/client`: Frontend React application
  - `/src`: Source code for the React frontend
    - `/components`: UI components
    - `/contexts`: React context providers
    - `/hooks`: Custom React hooks
    - `/pages`: Page components
    - `/services`: Service modules for API interactions
    - `/store`: State management (Zustand)
    - `/styles`: CSS and style files
    - `/types`: TypeScript type definitions
    - `/utils`: Utility functions
- `/server`: Backend Node.js application
  - `/middleware`: Express middleware functions
  - `/routes`: API route handlers
  - `/services`: Backend services
- `/shared`: Code shared between frontend and backend
  - `schema.ts`: Database schema definitions

## Key Components

### Frontend

1. **React Application**
   - Built with React and TypeScript
   - Uses Vite as the build tool and development server
   - Incorporates shadcn/ui components (based on Radix UI primitives)
   - Styled with Tailwind CSS
   - Follows a component-based architecture

2. **State Management**
   - Uses React Context API for global state (Authentication, Weather, Gallery, etc.)
   - Implements Zustand for more complex state needs (Dashboard, User Profile)
   - TanStack Query for server state management and data fetching

3. **Routing**
   - Uses wouter for client-side routing
   - Implements protected routes for authentication

4. **UI Framework**
   - Uses a custom design system with Tailwind CSS
   - Component library built on Radix UI primitives (via shadcn/ui)
   - Responsive design with mobile support

### Backend

1. **Express Server**
   - Node.js with Express
   - TypeScript for type safety
   - Modular route structure

2. **Authentication System**
   - Passport.js for authentication strategies
   - Local authentication with username/password
   - Two-factor authentication support
   - OAuth integration (Google)
   - Session-based authentication with connect-pg-simple

3. **API Routes**
   - RESTful API structure
   - Consolidated endpoints for efficiency

4. **Health Monitoring**
   - API health checks for external services
   - Structured error handling and logging

### Database

1. **PostgreSQL**
   - Relational database for persistent storage
   - Hosted on Neon Database (serverless PostgreSQL)

2. **ORM**
   - Drizzle ORM for database interactions
   - Schema-based approach with type safety
   - Migration support with drizzle-kit

3. **Schema Design**
   - User-centered data model
   - Relational tables for vehicles, maintenance, etc.
   - JSON fields for flexible data storage

## Data Flow

### Authentication Flow

1. User signs up/logs in through the frontend
2. Server authenticates credentials and creates a session
3. Session ID is stored in a cookie
4. Authenticated requests include the session cookie
5. Two-factor authentication flow when enabled:
   - User logs in with credentials
   - System prompts for 2FA token
   - User provides token from authenticator app
   - System verifies token and grants access

### Vehicle Management Flow

1. User adds vehicle details through the frontend
2. Data is validated and sent to the backend API
3. Backend stores vehicle in the database with user association
4. Frontend receives confirmation and updates local state
5. Vehicle data is used throughout the application for related features

### Weather Data Flow

1. User requests weather data for a location
2. Frontend sends coordinates to the backend
3. Backend checks local cache for recent data
4. If data is not cached or expired, backend queries external weather APIs
5. Data is processed, cached, and returned to the frontend
6. Frontend displays weather information and driving recommendations

## External Dependencies

### Third-Party APIs

1. **Weather Services**
   - OpenWeather API for current conditions and forecasts
   - AccuWeather API as a secondary weather data source

2. **Authentication Providers**
   - Google OAuth for alternative login options

3. **Content Services**
   - Unsplash API for high-quality images

4. **Communication Services**
   - SendGrid for transactional emails
   - Slack integration for notifications and sharing

5. **Payment Processing**
   - Stripe for payment handling

### Cloud Services

1. **Database**
   - Neon Database for serverless PostgreSQL

2. **Storage**
   - Supabase (likely for user-generated content storage)

3. **Deployment**
   - Replit for hosting and development

## Deployment Strategy

The application is configured for deployment on Replit's platform, with:

1. **Development**
   - Local development using Vite dev server
   - TypeScript for type checking
   - Hot module reloading for faster development

2. **Build Process**
   - Vite for frontend bundling and optimization
   - esbuild for server-side code bundling

3. **Production Deployment**
   - Node.js production server
   - Static file serving for frontend assets
   - Environment-specific configuration

4. **Scaling Considerations**
   - Database connection pooling
   - API rate limiting and caching for external services
   - Stateless server design for horizontal scaling

## Security Considerations

1. **Authentication**
   - Password hashing with scrypt
   - Two-factor authentication support
   - Session management with secure cookies
   - CSRF protection

2. **Data Protection**
   - Input validation and sanitization
   - HTTPS for all communications
   - Database query parameterization

3. **API Security**
   - Rate limiting
   - API key management
   - Access control checks

4. **Frontend Security**
   - Content Security Policy considerations
   - Secure local storage practices
   - XSS prevention