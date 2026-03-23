#!/bin/bash

# Update the first import
sed -i '1s/import PreDriveChecklistPage from ".\/pages\/PreDriveChecklistPage";/import PreDriveChecklistPage from ".\/pages\/pre-drive-checklist-page";/g' client/src/App.tsx

# Update EnhancedLogoutPage import
sed -i '12s/import EnhancedLogoutPage from ".\/pages\/EnhancedLogoutPage";/import EnhancedLogoutPage from ".\/pages\/enhanced-logout-page";/g' client/src/App.tsx

# Continue updating remaining imports
sed -i 's/import GaragePage from ".\/pages\/GaragePage";/import GaragePage from ".\/pages\/garage-page";/g' client/src/App.tsx
sed -i 's/import AddVehiclePage from ".\/pages\/AddVehiclePage";/import AddVehiclePage from ".\/pages\/add-vehicle-page";/g' client/src/App.tsx
sed -i 's/import TiresTimepieces from ".\/pages\/TiresTimepieces";/import TiresTimepieces from ".\/pages\/tires-timepieces";/g' client/src/App.tsx
sed -i 's/import ManifestationStationPage from ".\/pages\/ManifestationStationPage";/import ManifestationStationPage from ".\/pages\/manifestation-station-page";/g' client/src/App.tsx
sed -i 's/import ModPlannerPage from ".\/pages\/ModPlannerPage";/import ModPlannerPage from ".\/pages\/mod-planner-page";/g' client/src/App.tsx
sed -i 's/import ConciergePage from ".\/pages\/ConciergePage";/import ConciergePage from ".\/pages\/concierge-page";/g' client/src/App.tsx
sed -i 's/import HustlePlannerPage from ".\/pages\/HustlePlannerPage";/import HustlePlannerPage from ".\/pages\/hustle-planner-page";/g' client/src/App.tsx
sed -i 's/import RoutePlannerPage from ".\/pages\/RoutePlannerPage";/import RoutePlannerPage from ".\/pages\/route-planner-page";/g' client/src/App.tsx
sed -i 's/import DriveJournalPage from ".\/pages\/DriveJournalPage";/import DriveJournalPage from ".\/pages\/drive-journal-page";/g' client/src/App.tsx
sed -i 's/import DiscountsPage from ".\/pages\/DiscountsPage";/import DiscountsPage from ".\/pages\/discounts-page";/g' client/src/App.tsx
sed -i 's/import ContactPage from ".\/pages\/ContactPage";/import ContactPage from ".\/pages\/contact-page";/g' client/src/App.tsx
sed -i 's/import ChatFeedPage from ".\/pages\/ChatFeedPage";/import ChatFeedPage from ".\/pages\/chat-feed-page";/g' client/src/App.tsx
sed -i 's/import ShareDemoPage from ".\/pages\/ShareDemoPage";/import ShareDemoPage from ".\/pages\/share-demo-page";/g' client/src/App.tsx
sed -i 's/import MoodEnergyTrackerPage from ".\/pages\/MoodEnergyTrackerPage";/import MoodEnergyTrackerPage from ".\/pages\/mood-energy-tracker-page";/g' client/src/App.tsx
sed -i 's/import MotorsportsGalleryPage from ".\/pages\/MotorsportsGalleryPage";/import MotorsportsGalleryPage from ".\/pages\/motorsports-gallery-page";/g' client/src/App.tsx
sed -i 's/import PodiumPursuitPage from ".\/pages\/PodiumPursuitPage";/import PodiumPursuitPage from ".\/pages\/podium-pursuit-page";/g' client/src/App.tsx

grep -n "import.*from.*pages" client/src/App.tsx | head -5
