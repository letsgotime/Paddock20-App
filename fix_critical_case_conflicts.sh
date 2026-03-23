#!/bin/bash

# Create a backup first
echo "Creating backup before running targeted case sensitivity fixes..."
./create_backup.sh targeted_case_fixes_backup

echo "Fixing critical case sensitivity issues..."

# Fix specific known case conflicts in the file system
# 1. Home vs HomePage
if [ -f "client/src/pages/home.tsx" ] && [ -f "client/src/pages/home-page.tsx" ]; then
    echo "Resolving conflict: home.tsx vs home-page.tsx"
    # If identical, remove non-kebab version
    if cmp -s "client/src/pages/home.tsx" "client/src/pages/home-page.tsx"; then
        echo "Files are identical, removing home.tsx"
        rm "client/src/pages/home.tsx"
    else
        echo "Files differ, preserving both with new names"
        mv "client/src/pages/home.tsx" "client/src/pages/home-duplicate.tsx"
    fi
fi

# 2. Garage vs GaragePage
if [ -f "client/src/pages/garage.tsx" ] && [ -f "client/src/pages/garage-page.tsx" ]; then
    echo "Resolving conflict: garage.tsx vs garage-page.tsx"
    # If identical, remove non-kebab version
    if cmp -s "client/src/pages/garage.tsx" "client/src/pages/garage-page.tsx"; then
        echo "Files are identical, removing garage.tsx"
        rm "client/src/pages/garage.tsx"
    else
        echo "Files differ, preserving both with new names"
        mv "client/src/pages/garage.tsx" "client/src/pages/garage-duplicate.tsx"
    fi
fi

# 3. Events vs EventsPage
if [ -f "client/src/pages/events.tsx" ] && [ -f "client/src/pages/events-page.tsx" ]; then
    echo "Resolving conflict: events.tsx vs events-page.tsx"
    # If identical, remove non-kebab version
    if cmp -s "client/src/pages/events.tsx" "client/src/pages/events-page.tsx"; then
        echo "Files are identical, removing events.tsx"
        rm "client/src/pages/events.tsx"
    else
        echo "Files differ, preserving both with new names"
        mv "client/src/pages/events.tsx" "client/src/pages/events-duplicate.tsx"
    fi
fi

# 4. Weather vs WeatherPage
if [ -f "client/src/pages/weather.tsx" ] && [ -f "client/src/pages/weather-page.tsx" ]; then
    echo "Resolving conflict: weather.tsx vs weather-page.tsx"
    # If identical, remove non-kebab version
    if cmp -s "client/src/pages/weather.tsx" "client/src/pages/weather-page.tsx"; then
        echo "Files are identical, removing weather.tsx"
        rm "client/src/pages/weather.tsx"
    else
        echo "Files differ, preserving both with new names"
        mv "client/src/pages/weather.tsx" "client/src/pages/weather-duplicate.tsx"
    fi
fi

# 5. Fix SoundService.ts conflict
if [ -f "client/src/services/SoundService.ts" ] && [ -f "client/src/services/soundService.ts" ]; then
    echo "Resolving conflict: SoundService.ts vs soundService.ts"
    # If identical, remove the uppercase version
    if cmp -s "client/src/services/SoundService.ts" "client/src/services/soundService.ts"; then
        echo "Files are identical, removing the non-kebab version"
        rm "client/src/services/SoundService.ts"
    else
        echo "Files differ, preserving both with kebab-case names"
        mv "client/src/services/SoundService.ts" "client/src/services/sound-service.ts"
        mv "client/src/services/soundService.ts" "client/src/services/sound-service-alt.ts"
    fi
fi

# 6. Fix duplicate AuthContext files
if [ -f "client/src/context/AuthContext.tsx" ] && [ -f "client/src/legacy/auth/AuthContext.tsx" ]; then
    echo "Resolving conflict: context/AuthContext.tsx vs legacy/auth/AuthContext.tsx"
    # Keep both but rename the legacy one
    mv "client/src/legacy/auth/AuthContext.tsx" "client/src/legacy/auth/auth-context-legacy.tsx"
    echo "Renamed legacy auth context file"
fi

# Fix App.tsx imports
echo "Fixing imports in App.tsx..."

# Remove duplicate imports for Home/HomePage, Garage/GaragePage, etc.
sed -i '/^import Home from ".\/pages\/home-page";/d' client/src/App.tsx
sed -i '/^import Garage from ".\/pages\/garage-page";/d' client/src/App.tsx
sed -i '/^import Events from ".\/pages\/events-page";/d' client/src/App.tsx
sed -i '/^import Weather from ".\/pages\/weather-page";/d' client/src/App.tsx

# Update any Weather component references to WeatherSimplePage
sed -i 's/component={Weather}/component={WeatherSimplePage}/g' client/src/App.tsx
sed -i 's/component={() => <ProtectedRoute><Weather/component={() => <ProtectedRoute><WeatherSimplePage/g' client/src/App.tsx

echo "Targeted case sensitivity fixes completed!"
echo "The most critical case conflicts have been resolved. You can now proceed with GitHub migration."