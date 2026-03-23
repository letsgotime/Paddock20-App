#!/bin/bash

# First create a backup
echo "Creating backup before removing duplicate pages..."
./create_backup.sh duplicate_files_removal_backup

# Define files to be removed - these are the PascalCase/camelCase duplicates
FILES_TO_REMOVE=(
  "client/src/pages/journal.tsx"
  "client/src/pages/marketplace.tsx"
  "client/src/pages/motorsports.tsx" 
  "client/src/pages/settings.tsx"
  "client/src/pages/privacy-policy.tsx"
  "client/src/pages/terms-of-service.tsx"
)

echo "The following files will be removed:"
for file in "${FILES_TO_REMOVE[@]}"; do
  echo "$file"
done

echo -n "Do you want to proceed with removal? (y/n): "
read confirm

if [ "$confirm" == "y" ]; then
  echo "Removing files..."
  for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ]; then
      echo "Removing $file"
      rm "$file"
    else
      echo "File not found: $file"
    fi
  done
  echo "Duplicate files have been removed."
else
  echo "Operation cancelled. No files were removed."
fi