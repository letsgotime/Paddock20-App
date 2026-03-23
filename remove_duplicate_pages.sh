#!/bin/bash

# First create a backup
echo "Creating backup before removing duplicate pages..."
./create_backup.sh duplicate_files_removal_backup

echo "Identifying duplicate page files that can be safely removed..."

# Create a temp file to store list of files to remove
TEMP_FILE=$(mktemp)

# Direct approach - check for specific file pairs from the list
declare -a DUPLICATE_PAIRS=(
  "client/src/pages/Settings.tsx:client/src/pages/settings-page.tsx"
  "client/src/pages/Home.tsx:client/src/pages/home-page.tsx"
  "client/src/pages/Events.tsx:client/src/pages/events-page.tsx"
  "client/src/pages/Weather.tsx:client/src/pages/weather-page.tsx"
  "client/src/pages/Garage.tsx:client/src/pages/garage-page.tsx"
  "client/src/pages/Journal.tsx:client/src/pages/journal-page.tsx"
  "client/src/pages/Marketplace.tsx:client/src/pages/marketplace-page.tsx"
  "client/src/pages/Motorsports.tsx:client/src/pages/motorsports-page.tsx"
  "client/src/pages/GoTimeGarageVault.tsx:client/src/pages/go-time-garage-vault.tsx"
  "client/src/pages/JuiceBox.tsx:client/src/pages/juice-box.tsx"
  "client/src/pages/TiresTimepieces.tsx:client/src/pages/tires-timepieces.tsx"
  "client/src/pages/BetaAgreement.tsx:client/src/pages/beta-agreement.tsx"
  "client/src/pages/SpotifyEnvCheck.tsx:client/src/pages/spotify-env-check.tsx"
  "client/src/pages/SimpleDebug.tsx:client/src/pages/simple-debug.tsx"
  "client/src/pages/PrivacyPolicy.tsx:client/src/pages/privacy-policy-page.tsx"
  "client/src/pages/TermsOfService.tsx:client/src/pages/terms-of-service-page.tsx"
  "client/src/pages/ResetPassword.tsx:client/src/pages/reset-password.tsx"
  "client/src/pages/JoinTheGrid.tsx:client/src/pages/join-the-grid.tsx"
  "client/src/pages/PersonalizedDashboard.tsx:client/src/pages/personalized-dashboard.tsx"
  "client/src/pages/MoodEnergyTrackerPage.jsx:client/src/pages/mood-energy-tracker-page.jsx"
  "client/src/pages/PreDriveChecklistPage.jsx:client/src/pages/pre-drive-checklist-page.jsx"
  "client/src/pages/VehicleModsPage.jsx:client/src/pages/vehicle-mods-page.jsx"
  "client/src/pages/GarageVaultPage.jsx:client/src/pages/garage-vault-page.jsx"
  "client/src/pages/admin/AdminDashboard.tsx:client/src/pages/admin-dashboard.tsx"
)

# Loop through each pair
for PAIR in "${DUPLICATE_PAIRS[@]}"; do
  PASCAL_FILE=$(echo $PAIR | cut -d: -f1)
  KEBAB_FILE=$(echo $PAIR | cut -d: -f2)
  
  # Check if both files exist
  if [ -f "$PASCAL_FILE" ] && [ -f "$KEBAB_FILE" ]; then
    # Compare the files
    if cmp -s "$PASCAL_FILE" "$KEBAB_FILE"; then
      echo "$PASCAL_FILE - Safe to remove (identical to $KEBAB_FILE)" | tee -a "$TEMP_FILE"
    else
      echo "$PASCAL_FILE - Might conflict with $KEBAB_FILE (files differ)" | tee -a "$TEMP_FILE"
    fi
  elif [ -f "$PASCAL_FILE" ]; then
    echo "$PASCAL_FILE - Kebab equivalent ($KEBAB_FILE) not found" | tee -a "$TEMP_FILE"
  elif [ -f "$KEBAB_FILE" ]; then
    echo "$KEBAB_FILE - Pascal equivalent ($PASCAL_FILE) not found" | tee -a "$TEMP_FILE"
  else
    echo "Neither $PASCAL_FILE nor $KEBAB_FILE exists" | tee -a "$TEMP_FILE"
  fi
done

echo ""
echo "The following files can be safely removed:"
grep "Safe to remove" "$TEMP_FILE" | cut -d' ' -f1

echo ""
echo "The following files might have conflicts:"
grep "Might conflict" "$TEMP_FILE" | cut -d' ' -f1

echo ""
echo -n "Do you want to remove the files marked as 'Safe to remove'? (y/n): "
read confirm

if [ "$confirm" == "y" ]; then
  echo "Removing duplicate files..."
  grep "Safe to remove" "$TEMP_FILE" | cut -d' ' -f1 | while read file; do
    echo "Removing $file"
    rm "$file"
  done
  echo "Duplicates have been removed!"
else
  echo "Operation cancelled. No files were removed."
fi

# Clean up
rm "$TEMP_FILE"