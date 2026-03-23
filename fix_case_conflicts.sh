#!/bin/bash

# Define the list of files with case conflicts
declare -a files=(
  "client/src/pages/Settings.tsx:client/src/pages/settings.tsx"
  "client/src/pages/Garage.tsx:client/src/pages/garage.tsx"
  "client/src/pages/Motorsports.tsx:client/src/pages/motorsports.tsx"
  "client/src/pages/Journal.tsx:client/src/pages/journal.tsx"
  "client/src/pages/Events.tsx:client/src/pages/events.tsx"
  "client/src/pages/TiresTimepieces.tsx:client/src/pages/tires-timepieces.tsx"
  "client/src/pages/JuiceBox.tsx:client/src/pages/juice-box.tsx"
  "client/src/pages/SimpleDebug.tsx:client/src/pages/simple-debug.tsx"
  "client/src/pages/SpotifyEnvCheck.tsx:client/src/pages/spotify-env-check.tsx"
  "client/src/pages/api-explorer-page.tsx:client/src/pages/api-explorer-page.tsx"
  "client/src/pages/ResetPassword.tsx:client/src/pages/reset-password.tsx"
  "client/src/pages/BetaAgreement.tsx:client/src/pages/beta-agreement.tsx"
  "client/src/pages/AdminDashboard.tsx:client/src/pages/admin-dashboard.tsx"
  "client/src/pages/admin/AdminDashboard.tsx:client/src/pages/admin/admin-dashboard.tsx"
  "client/src/pages/PrivacyPolicy.tsx:client/src/pages/privacy-policy.tsx"
  "client/src/pages/TermsOfService.tsx:client/src/pages/terms-of-service.tsx"
  "client/src/pages/PersonalizedDashboard.tsx:client/src/pages/personalized-dashboard.tsx"
  "client/src/pages/Marketplace.tsx:client/src/pages/marketplace.tsx"
  "client/src/pages/GoTimeGarageVault.tsx:client/src/pages/go-time-garage-vault.tsx"
  "client/src/pages/Home.tsx:client/src/pages/home.tsx"
  "client/src/pages/JoinTheGrid.tsx:client/src/pages/join-the-grid.tsx"
  "client/src/pages/Weather.tsx:client/src/pages/weather.tsx"
)

# Iterate through the list of files
for file_pair in "${files[@]}"; do
  source_file=$(echo $file_pair | cut -d':' -f1)
  target_file=$(echo $file_pair | cut -d':' -f2)
  
  # Check if the source file exists
  if [ -f "$source_file" ]; then
    # Create the target directory if it doesn't exist
    mkdir -p $(dirname "$target_file")
    
    # Copy the source file to the target file
    cp "$source_file" "$target_file"
    echo "Copied $source_file to $target_file"
  else
    echo "Source file $source_file does not exist"
  fi
done

# Copy the special jsx files we already made
if [ -f "client/src/pages/VehicleModsPage.jsx" ]; then
  cp "client/src/pages/VehicleModsPage.jsx" "client/src/pages/vehicle-mods-page.jsx"
  echo "Copied VehicleModsPage.jsx to vehicle-mods-page.jsx"
fi

if [ -f "client/src/pages/MoodEnergyTrackerPage.jsx" ]; then
  cp "client/src/pages/MoodEnergyTrackerPage.jsx" "client/src/pages/mood-energy-tracker-page.jsx"
  echo "Copied MoodEnergyTrackerPage.jsx to mood-energy-tracker-page.jsx"
fi

if [ -f "client/src/pages/PreDriveChecklistPage.jsx" ]; then
  cp "client/src/pages/PreDriveChecklistPage.jsx" "client/src/pages/pre-drive-checklist-page.jsx"
  echo "Copied PreDriveChecklistPage.jsx to pre-drive-checklist-page.jsx"
fi

