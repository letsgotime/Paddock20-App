#!/bin/bash

# Create a backup first
echo "Creating comprehensive backup before running case sensitivity fixes..."
./create_backup.sh case_sensitivity_fixes_backup

echo "Fixing case sensitivity issues in file names..."

# Function to normalize a filename to kebab-case and update imports
normalize_file() {
    local file=$1
    local dir=$(dirname "$file")
    local base=$(basename "$file")
    local ext="${base##*.}"
    local name="${base%.*}"
    
    # Convert to kebab-case (lowercase with hyphens)
    local kebab_name=$(echo "$name" | sed -E 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]')
    
    # Skip if already in kebab-case
    if [ "$name" = "$kebab_name" ]; then
        return
    fi
    
    local new_file="$dir/$kebab_name.$ext"
    
    # If the kebab-case file already exists, merge content
    if [ -f "$new_file" ] && [ "$file" != "$new_file" ]; then
        echo "Case conflict detected: $file and $new_file"
        
        # Check if files are identical
        if cmp -s "$file" "$new_file"; then
            echo "Files are identical, removing duplicate: $file"
            rm "$file"
        else
            echo "Files differ, keeping both and renaming conflicting file..."
            mv "$file" "$dir/${kebab_name}-conflict.$ext"
        fi
    elif [ "$file" != "$new_file" ]; then
        echo "Renaming $file to $new_file"
        mv "$file" "$new_file"
        
        # Update imports referencing this file across the codebase
        old_import_path="${file#./client/src/}"
        new_import_path="${new_file#./client/src/}"
        old_import_path="${old_import_path%.*}" # Remove extension
        new_import_path="${new_import_path%.*}" # Remove extension
        
        echo "Updating imports from $old_import_path to $new_import_path"
        
        # Fix import statements - account for different import patterns
        find client/src -type f -name "*.ts*" | xargs sed -i -E "s|from [\"'](.*/)?${old_import_path}[\"']|from \"\1${new_import_path}\"|g"
        find client/src -type f -name "*.ts*" | xargs sed -i -E "s|from [\"']@/${old_import_path}[\"']|from \"@/${new_import_path}\"|g"
        find client/src -type f -name "*.ts*" | xargs sed -i -E "s|from [\"']~/${old_import_path}[\"']|from \"~/${new_import_path}\"|g"
    fi
}

# Handle SoundService.ts / soundService.ts specific conflict first
echo "Handling sound service conflict..."
if [ -f "client/src/services/SoundService.ts" ] && [ -f "client/src/services/soundService.ts" ]; then
    echo "Comparing SoundService.ts and soundService.ts..."
    if cmp -s "client/src/services/SoundService.ts" "client/src/services/soundService.ts"; then
        echo "Sound service files are identical. Removing the non-kebab-case version."
        rm "client/src/services/SoundService.ts"
        
        # Update imports 
        find client/src -type f -name "*.ts*" | xargs sed -i -E "s|from [\"'](.*/)?SoundService[\"']|from \"\1soundService\"|g"
    else
        echo "Sound service files differ. Creating kebab-case version."
        mv "client/src/services/SoundService.ts" "client/src/services/sound-service.ts"
        mv "client/src/services/soundService.ts" "client/src/services/sound-service-alt.ts"
        
        # Update imports
        find client/src -type f -name "*.ts*" | xargs sed -i -E "s|from [\"'](.*/)?SoundService[\"']|from \"\1sound-service\"|g"
        find client/src -type f -name "*.ts*" | xargs sed -i -E "s|from [\"'](.*/)?soundService[\"']|from \"\1sound-service-alt\"|g"
    fi
fi

# Normalize all file names to kebab-case
find client/src -type f -name "*.ts*" | while read file; do
    normalize_file "$file"
done

# Fix case-sensitive imports in App.tsx
echo "Fixing case-sensitive imports in App.tsx..."

# Standardize Home/HomePage pattern
sed -i 's/import Home from ".*\/home-page";/import HomePage from ".\/pages\/home-page";/g' client/src/App.tsx
sed -i 's/import Garage from ".*\/garage-page";/import GaragePage from ".\/pages\/garage-page";/g' client/src/App.tsx
sed -i 's/import Events from ".*\/events-page";/import EventsPage from ".\/pages\/events-page";/g' client/src/App.tsx

# Fix Weather page references
sed -i 's/component={Weather}/component={WeatherSimplePage}/g' client/src/App.tsx
sed -i 's/component={() => <ProtectedRoute><Weather/component={() => <ProtectedRoute><WeatherSimplePage/g' client/src/App.tsx

# Fix route component references
echo "Fixing route component references..."
sed -i 's/component={Settings}/component={SettingsPage}/g' client/src/App.tsx
sed -i 's/component={JuiceBox}/component={JuiceBoxPage}/g' client/src/App.tsx
sed -i 's/component={TiresTimepieces}/component={TiresTimepiecesPage}/g' client/src/App.tsx
sed -i 's/component={SpotifyEnvCheck}/component={SpotifyEnvCheckPage}/g' client/src/App.tsx

echo "Case sensitivity fixes completed!"
echo "Review changes for the project files. Migration to GitHub should be smoother now."