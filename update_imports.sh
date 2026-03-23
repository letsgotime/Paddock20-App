#!/bin/bash

# Create a backup of the original file
cp client/src/App.tsx client/src/App.tsx.original

# Update import statements in App.tsx
sed -i 's/import NotFound from "@\/pages\/not-found";/import NotFound from "@\/pages\/not-found";/g' client/src/App.tsx
sed -i 's/import Home from "@\/pages\/Home";/import Home from "@\/pages\/home";/g' client/src/App.tsx
sed -i 's/import Garage from "@\/pages\/Garage";/import Garage from "@\/pages\/garage";/g' client/src/App.tsx
sed -i 's/import Journal from "@\/pages\/Journal";/import Journal from "@\/pages\/journal";/g' client/src/App.tsx
sed -i 's/import Marketplace from "@\/pages\/Marketplace";/import Marketplace from "@\/pages\/marketplace";/g' client/src/App.tsx
sed -i 's/import Motorsports from "@\/pages\/Motorsports";/import Motorsports from "@\/pages\/motorsports";/g' client/src/App.tsx
sed -i 's/import Settings from "@\/pages\/Settings";/import Settings from "@\/pages\/settings";/g' client/src/App.tsx
sed -i 's/import Events from ".\/pages\/Events";/import Events from ".\/pages\/events";/g' client/src/App.tsx
sed -i 's/import JuiceBox from ".\/pages\/JuiceBox";/import JuiceBox from ".\/pages\/juice-box";/g' client/src/App.tsx
sed -i 's/import Weather from ".\/pages\/Weather";/import Weather from ".\/pages\/weather";/g' client/src/App.tsx
sed -i 's/import PrivacyPolicy from ".\/pages\/PrivacyPolicyPage";/import PrivacyPolicy from ".\/pages\/privacy-policy-page";/g' client/src/App.tsx
sed -i 's/import TermsOfService from ".\/pages\/TermsOfServicePage";/import TermsOfService from ".\/pages\/terms-of-service-page";/g' client/src/App.tsx
sed -i 's/import BetaAgreement from ".\/pages\/BetaAgreement";/import BetaAgreement from ".\/pages\/beta-agreement";/g' client/src/App.tsx
sed -i 's/import VehicleModsPage from ".\/pages\/VehicleModsPage";/import VehicleModsPage from ".\/pages\/vehicle-mods-page";/g' client/src/App.tsx
sed -i 's/import GoTimeGarageVault from ".\/pages\/GoTimeGarageVault";/import GoTimeGarageVault from ".\/pages\/go-time-garage-vault";/g' client/src/App.tsx
sed -i 's/import TiresTimepieces from ".\/pages\/TiresTimepieces";/import TiresTimepieces from ".\/pages\/tires-timepieces";/g' client/src/App.tsx
sed -i 's/import SpotifyEnvCheck from ".\/pages\/SpotifyEnvCheck";/import SpotifyEnvCheck from ".\/pages\/spotify-env-check";/g' client/src/App.tsx
sed -i 's/import MoodEnergyTrackerPage from ".\/pages\/MoodEnergyTrackerPage";/import MoodEnergyTrackerPage from ".\/pages\/mood-energy-tracker-page";/g' client/src/App.tsx
sed -i 's/import PreDriveChecklistPage from ".\/pages\/PreDriveChecklistPage";/import PreDriveChecklistPage from ".\/pages\/pre-drive-checklist-page";/g' client/src/App.tsx

grep -n "import.*from.*pages" client/src/App.tsx | head
