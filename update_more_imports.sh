#!/bin/bash

# Update more import statements in App.tsx
sed -i 's/import PreDriveChecklistPage from ".\/pages\/PreDriveChecklistPage";/import PreDriveChecklistPage from ".\/pages\/pre-drive-checklist-page";/g' client/src/App.tsx
sed -i 's/import EnhancedLogoutPage from ".\/pages\/EnhancedLogoutPage";/import EnhancedLogoutPage from ".\/pages\/enhanced-logout-page";/g' client/src/App.tsx
sed -i 's/import EventsPage from ".\/pages\/EventsPage";/import EventsPage from ".\/pages\/events-page";/g' client/src/App.tsx
sed -i 's/import JuiceBox from ".\/pages\/JuiceBox";/import JuiceBox from ".\/pages\/juice-box";/g' client/src/App.tsx
sed -i 's/import MotorsportsEventsPage from ".\/pages\/MotorsportsEventsPage";/import MotorsportsEventsPage from ".\/pages\/motorsports-events-page";/g' client/src/App.tsx
sed -i 's/import GlossResetPage from ".\/pages\/GlossResetPage";/import GlossResetPage from ".\/pages\/gloss-reset-page";/g' client/src/App.tsx
sed -i 's/import LoadoutsPage from ".\/pages\/LoadoutsPage";/import LoadoutsPage from ".\/pages\/loadouts-page";/g' client/src/App.tsx
sed -i 's/import GlossGrowthPage from ".\/pages\/GlossGrowthPage";/import GlossGrowthPage from ".\/pages\/gloss-growth-page";/g' client/src/App.tsx
sed -i 's/import VideoLibraryPage from ".\/pages\/VideoLibraryPage";/import VideoLibraryPage from ".\/pages\/video-library-page";/g' client/src/App.tsx
sed -i 's/import BrokerPortalPage from ".\/pages\/BrokerPortalPage";/import BrokerPortalPage from ".\/pages\/broker-portal-page";/g' client/src/App.tsx
sed -i 's/import WeatherPage from ".\/pages\/WeatherPage";/import WeatherPage from ".\/pages\/weather-page";/g' client/src/App.tsx
sed -i 's/import NewGTGWeatherPage from ".\/pages\/NewGTGWeatherPage";/import NewGTGWeatherPage from ".\/pages\/new-gtg-weather-page";/g' client/src/App.tsx
sed -i 's/import RedlineReportPage from ".\/pages\/RedlineReportPage";/import RedlineReportPage from ".\/pages\/redline-report-page";/g' client/src/App.tsx
sed -i 's/import SeasonalChecklistPage from ".\/pages\/SeasonalChecklistPage";/import SeasonalChecklistPage from ".\/pages\/seasonal-checklist-page";/g' client/src/App.tsx
sed -i 's/import EbooksPage from ".\/pages\/EbooksPage";/import EbooksPage from ".\/pages\/ebooks-page";/g' client/src/App.tsx
sed -i 's/import Paddock20HomePage from ".\/pages\/Paddock20HomePage";/import Paddock20HomePage from ".\/pages\/paddock20-home-page";/g' client/src/App.tsx
sed -i 's/import ProductOrganizerPage from ".\/pages\/ProductOrganizerPage";/import ProductOrganizerPage from ".\/pages\/product-organizer-page";/g' client/src/App.tsx
sed -i 's/import UserProfileHubPage from ".\/pages\/UserProfileHubPage";/import UserProfileHubPage from ".\/pages\/user-profile-hub-page";/g' client/src/App.tsx

grep -n "import.*from.*pages" client/src/App.tsx | head -20
