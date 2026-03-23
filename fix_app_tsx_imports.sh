#!/bin/bash

# Create a backup of App.tsx
cp client/src/App.tsx client/src/App.tsx.bak

# 1. Remove duplicate imports - Keep the *Page version, remove the non-Page version
sed -i '/^import Home from ".\/pages\/home-page";/d' client/src/App.tsx
sed -i '/^import Garage from ".\/pages\/garage-page";/d' client/src/App.tsx
sed -i '/^import Events from ".\/pages\/events-page";/d' client/src/App.tsx

# 2. Standardize weather page imports
sed -i 's/import Weather from ".\/pages\/weather-page";/import WeatherSimplePage from ".\/pages\/weather-page";/' client/src/App.tsx
sed -i 's/import WeatherPage from ".\/pages\/weather-paddock-page";/import WeatherPaddockPage from ".\/pages\/weather-paddock-page";/' client/src/App.tsx

# 3. Update route components to use standardized component names
sed -i 's/<Route path="\/weather-paddock" component={() => <ProtectedRoute><WeatherPage /<Route path="\/weather-paddock" component={() => <ProtectedRoute><WeatherPaddockPage /' client/src/App.tsx
sed -i 's/<Route path="\/weather" component={() => <ProtectedRoute><Weather /<Route path="\/weather" component={() => <ProtectedRoute><WeatherSimplePage /' client/src/App.tsx

echo "Fixed duplicate imports and standardized component names in App.tsx"

# 4. Remove duplicate page files (keeping the kebab-case versions)
rm -f client/src/pages/home.tsx
rm -f client/src/pages/garage.tsx
rm -f client/src/pages/events.tsx
rm -f client/src/pages/weather.tsx

echo "Removed duplicate page files (kept kebab-case versions)"

# 5. Make sure to use consistent kebab-case for weather components in imports
find client/src -type f -name "*.tsx" -exec sed -i 's/from ".\/pages\/weather"/from ".\/pages\/weather-page"/g' {} \;
find client/src -type f -name "*.tsx" -exec sed -i 's/from ".\/pages\/events"/from ".\/pages\/events-page"/g' {} \;
find client/src -type f -name "*.tsx" -exec sed -i 's/from ".\/pages\/garage"/from ".\/pages\/garage-page"/g' {} \;
find client/src -type f -name "*.tsx" -exec sed -i 's/from ".\/pages\/home"/from ".\/pages\/home-page"/g' {} \;

echo "Updated imports to use kebab-case file paths"

echo "Import and file cleanup completed"