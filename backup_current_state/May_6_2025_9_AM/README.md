# PADDOCK20 Backup - May 6, 2025 9 AM

This backup contains a complete snapshot of the PADDOCK20 application made on May 6, 2025 at 9 AM.

## Important Changes Before Backup

1. Fixed API flooding issues in weather services by:
   - Improving caching mechanism in LocationServicesContext
   - Modifying AutomotiveWeatherPanel to use centralized cache
   - Adding safeguards to prevent repeated API calls
   - Implementing proper validation to avoid null reference errors

2. Protected all Manifestation Station files with proper tags

3. Created a dedicated backup of the Manifestation Station component

## Included Files and Directories

- `/client` - All frontend React code
- `/server` - Backend Express server code
- `/shared` - Shared TypeScript types and utilities
- Configuration files:
  - `.env` - Environment variables
  - `package.json` - Dependencies and scripts
  - `tsconfig.json` - TypeScript configuration
  - `vite.config.ts` - Vite build configuration
  - `tailwind.config.ts` - Tailwind CSS settings
  - `postcss.config.js` - PostCSS configuration
  - `components.json` - Shadcn component configuration
  - `drizzle.config.ts` - Database ORM configuration

## Data Warehouse Structure

Main data contexts:
- LocationServicesContext - Central source for location data
- WeatherContext - Weather information
- VehicleContext - Vehicle information
- UserProfileContext - User data
- GalleryContext - Media management
- SpotifyContext - Music integration

This backup is part of the ongoing improvement process for PADDOCK20.