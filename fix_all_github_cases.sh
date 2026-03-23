#!/bin/bash

# Create a backup before making changes
BACKUP_DIR="project_backup_$(date +%Y%m%d_%H%M%S)"
echo "Creating backup before fixing case sensitivity issues..."
mkdir -p "$BACKUP_DIR"
cp -r client "$BACKUP_DIR/" 2>/dev/null || echo "Warning: Some files couldn't be copied to backup"
echo "Backup complete in $BACKUP_DIR"

# List of files to check if they exist and remove - these are the PascalCase or non-standard versions
# Derived from the full file case errors list
declare -a files_to_remove=(
  "client/src/pages/Settings.tsx"
  "client/src/pages/Home.tsx"
  "client/src/pages/Events.tsx"
  "client/src/pages/Weather.tsx"
  "client/src/pages/SpotifyEnvCheck.tsx"
  "client/src/pages/PrivacyPolicy.tsx"
  "client/src/pages/TermsOfService.tsx"
  "client/src/pages/PersonalizedDashboard.tsx"
  "client/src/pages/ResetPassword.tsx"
  "client/src/pages/GoTimeGarageVault.tsx"
  "client/src/pages/Marketplace.tsx"
  "client/src/pages/SimpleDebug.tsx"
  "client/src/pages/Journal.tsx"
  "client/src/pages/Motorsports.tsx"
  "client/src/pages/JoinTheGrid.tsx"
  "client/src/pages/VehicleModsPage.jsx"
  "client/src/pages/Garage.tsx"
  "client/src/pages/JuiceBox.tsx"
  "client/src/pages/GarageVaultPage.jsx"
  "client/src/pages/AdminDashboard.tsx"
  "client/src/pages/BetaAgreement.tsx"
  "client/src/pages/TiresTimepieces.tsx"
  "client/src/pages/admin/AdminDashboard.tsx"
  "client/src/pages/PreDriveChecklistPage.jsx"
  "client/src/pages/MoodEnergyTrackerPage.jsx"
)

# Keep files that may not have kebab-case equivalents - we'll check first
declare -a special_check_files=(
  "client/src/pages/privacy-policy.tsx:client/src/pages/privacy-policy-page.tsx"
  "client/src/pages/terms-of-service.tsx:client/src/pages/terms-of-service-page.tsx"
  "client/src/pages/journal.tsx:client/src/pages/journal-page.tsx"
  "client/src/pages/marketplace.tsx:client/src/pages/marketplace-page.tsx"
  "client/src/pages/motorsports.tsx:client/src/pages/motorsports-page.tsx"
  "client/src/pages/settings.tsx:client/src/pages/settings-page.tsx"
  "client/src/pages/simple-debug.tsx:client/src/pages/debug-page.tsx"
  "client/src/pages/personalized-dashboard.tsx:client/src/pages/dashboard-page.tsx"
  "client/src/pages/reset-password.tsx:client/src/pages/reset-password-page.tsx"
  "client/src/pages/go-time-garage-vault.tsx:client/src/pages/garage-vault-page.tsx"
  "client/src/pages/join-the-grid.tsx:client/src/pages/join-grid-page.tsx"
  "client/src/pages/juice-box.tsx:client/src/pages/juice-box-page.tsx"
  "client/src/pages/beta-agreement.tsx:client/src/pages/beta-agreement-page.tsx"
  "client/src/pages/tires-timepieces.tsx:client/src/pages/tires-timepieces-page.tsx"
  "client/src/pages/admin-dashboard.tsx:client/src/pages/admin/admin-dashboard.tsx"
  "client/src/pages/vehicle-mods-page.jsx:client/src/pages/vehicle-mods-page.tsx"
  "client/src/pages/pre-drive-checklist-page.jsx:client/src/pages/pre-drive-checklist-page.tsx"
  "client/src/pages/mood-energy-tracker-page.jsx:client/src/pages/mood-energy-tracker-page.tsx"
)

echo "Checking and fixing case sensitivity issues..."

# First check the special files - only remove if the alternative exists
for pair in "${special_check_files[@]}"; do
  IFS=':' read -r file_to_check alt_file <<< "$pair"
  if [[ -f "$file_to_check" && -f "$alt_file" ]]; then
    echo "Found duplicate: $file_to_check will be removed (keeping $alt_file instead)"
    rm "$file_to_check"
  fi
done

# Then handle the known files to remove
for file in "${files_to_remove[@]}"; do
  if [[ -f "$file" ]]; then
    # Determine likely kebab-case alternative
    base_name=$(basename "$file" | sed -E 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]')
    dir_name=$(dirname "$file")
    
    # Special case for files ending with Page.jsx/tsx - replace with -page.jsx/tsx
    if [[ "$base_name" == *page.* ]]; then
      base_name=$(echo "$base_name" | sed 's/page\./-page./g')
    fi
    
    # Check if a kebab-case version exists
    kebab_file="$dir_name/$base_name"
    
    if [[ -f "$kebab_file" ]]; then
      echo "Removing duplicate: $file (keeping $kebab_file)"
      rm "$file"
    else
      # If we don't find an exact match, look for similar files with -page suffix
      potential_alt="${kebab_file%.tsx}-page.tsx"
      potential_alt2="${kebab_file%.jsx}-page.jsx"
      
      if [[ -f "$potential_alt" ]]; then
        echo "Removing duplicate: $file (keeping $potential_alt)"
        rm "$file"
      elif [[ -f "$potential_alt2" ]]; then
        echo "Removing duplicate: $file (keeping $potential_alt2)"
        rm "$file"
      else
        echo "Warning: No kebab-case alternative found for $file"
      fi
    fi
  fi
done

echo "Case sensitivity issues fixed. Your project should now work correctly on GitHub."
echo "If you encounter issues, you can restore files from the backup directory: $BACKUP_DIR"