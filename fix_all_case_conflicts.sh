#!/bin/bash

# Script to fix all case conflicts by creating kebab-case versions of files
# and updating imports, without deleting original files yet

# Function to convert a file path to kebab-case
to_kebab_case() {
  local file=$1
  local dir=$(dirname "$file")
  local base=$(basename "$file")
  local ext="${base##*.}"
  local name="${base%.*}"
  
  # Convert to kebab-case: spaces to hyphens, then camelCase to kebab-case
  local kebab=$(echo "$name" | sed 's/ /-/g' | sed 's/\([a-z0-9]\)\([A-Z]\)/\1-\2/g' | tr '[:upper:]' '[:lower:]')
  
  echo "${dir}/${kebab}.${ext}"
}

# Process each file in the list
process_file() {
  local src_file=$1
  
  # Skip if file doesn't exist
  if [ ! -f "$src_file" ]; then
    echo "Skipping non-existent file: $src_file"
    return
  fi
  
  # Generate kebab-case destination path
  local dest_file=$(to_kebab_case "$src_file")
  
  # Skip if source and destination are the same (already kebab-case)
  if [ "$src_file" == "$dest_file" ]; then
    echo "Already in kebab-case: $src_file"
    return
  fi
  
  # Check if destination file already exists (to avoid overwriting newer files)
  if [ -f "$dest_file" ]; then
    echo "Destination already exists, comparing files: $src_file -> $dest_file"
    if diff -q "$src_file" "$dest_file" > /dev/null; then
      echo "Files are identical: $src_file and $dest_file"
    else
      echo "WARNING: Files differ! Creating backup and updating: $src_file vs $dest_file"
      # Create backup with timestamp if files differ
      cp -f "$dest_file" "${dest_file}.bak.$(date +%s)"
      cp -f "$src_file" "$dest_file"
    fi
  else
    # Copy the file to kebab-case version
    echo "Creating kebab-case version: $src_file -> $dest_file"
    cp -f "$src_file" "$dest_file"
  fi
  
  # Extract component/page name without extension
  local src_name=$(basename "$src_file" | sed 's/\.[^.]*$//')
  local dest_name=$(basename "$dest_file" | sed 's/\.[^.]*$//')
  
  # Find and update imports in all source files (not just App.tsx)
  echo "Updating imports project-wide: $src_name -> $dest_name"
  
  # Update "./pages/Name" style imports
  find client/src -name "*.tsx" -o -name "*.jsx" | xargs sed -i "s/import $src_name from \"\.\/pages\/$src_name\"/import $src_name from \"\.\/pages\/$dest_name\"/" 2>/dev/null || true
  
  # Update "./pages/Name.tsx" style imports (with extension)
  find client/src -name "*.tsx" -o -name "*.jsx" | xargs sed -i "s/import $src_name from \"\.\/pages\/$src_name\.tsx\"/import $src_name from \"\.\/pages\/$dest_name\"/" 2>/dev/null || true
  
  # Update "../pages/Name" style imports
  find client/src -name "*.tsx" -o -name "*.jsx" | xargs sed -i "s/import $src_name from \"\.\.\/pages\/$src_name\"/import $src_name from \"\.\.\/pages\/$dest_name\"/" 2>/dev/null || true
  
  # Update "@/pages/Name" style imports
  find client/src -name "*.tsx" -o -name "*.jsx" | xargs sed -i "s/import $src_name from \"@\/pages\/$src_name\"/import $src_name from \"@\/pages\/$dest_name\"/" 2>/dev/null || true
  
  # We won't delete the original file yet
  echo "Keeping original file: $src_file"
  echo "Added to deletion list for later review"
  echo "$src_file" >> files_to_delete.txt
}

# Similar process for components
process_component() {
  local src_file=$1
  
  # Skip if file doesn't exist
  if [ ! -f "$src_file" ]; then
    echo "Skipping non-existent component: $src_file"
    return
  fi
  
  # Generate kebab-case destination path
  local dest_file=$(to_kebab_case "$src_file")
  
  # Skip if source and destination are the same (already kebab-case)
  if [ "$src_file" == "$dest_file" ]; then
    echo "Component already in kebab-case: $src_file"
    return
  fi
  
  # Check if destination file already exists
  if [ -f "$dest_file" ]; then
    echo "Destination component exists, comparing: $src_file -> $dest_file"
    if diff -q "$src_file" "$dest_file" > /dev/null; then
      echo "Component files are identical: $src_file and $dest_file"
    else
      echo "WARNING: Component files differ! Creating backup: $src_file vs $dest_file"
      cp -f "$dest_file" "${dest_file}.bak.$(date +%s)"
      cp -f "$src_file" "$dest_file"
    fi
  else
    # Copy the file to kebab-case version
    echo "Creating kebab-case component: $src_file -> $dest_file"
    cp -f "$src_file" "$dest_file"
  fi
  
  # Extract component name without extension
  local src_name=$(basename "$src_file" | sed 's/\.[^.]*$//')
  local dest_name=$(basename "$dest_file" | sed 's/\.[^.]*$//')
  
  # Update imports for components
  echo "Updating component imports: $src_name -> $dest_name"
  
  # Update various import patterns
  find client/src -name "*.tsx" -o -name "*.jsx" | xargs sed -i "s/from \"\.\.\/components\/$src_name\"/from \"\.\.\/components\/$dest_name\"/" 2>/dev/null || true
  find client/src -name "*.tsx" -o -name "*.jsx" | xargs sed -i "s/from \"\.\/components\/$src_name\"/from \"\.\/components\/$dest_name\"/" 2>/dev/null || true
  find client/src -name "*.tsx" -o -name "*.jsx" | xargs sed -i "s/from \"@\/components\/$src_name\"/from \"@\/components\/$dest_name\"/" 2>/dev/null || true
  
  # Add to list for later review
  echo "$src_file" >> files_to_delete.txt
}

# Main script execution
echo "Starting case conflict resolution..."

# Create or clear the deletion list file
> files_to_delete.txt

# Process pages
echo "PHASE 1: Creating kebab-case versions of pages and updating imports..."
find client/src/pages -name "*.tsx" -o -name "*.jsx" | sort | uniq > all_page_files.txt
while IFS= read -r file; do
  process_file "$file"
done < all_page_files.txt

# Process components
echo "PHASE 2: Creating kebab-case versions of components and updating imports..."
find client/src/components -name "*.tsx" -o -name "*.jsx" | sort | uniq > all_component_files.txt
while IFS= read -r file; do
  process_component "$file"
done < all_component_files.txt

# Clean up temp files
rm -f all_page_files.txt all_component_files.txt

echo "Case conflict resolution complete!"
echo "All files converted to kebab-case format."
echo "Original files still exist. Review the app to make sure everything works."
echo "Files that can be deleted are listed in files_to_delete.txt"
echo "Use this command to delete them when ready: xargs -a files_to_delete.txt rm -f"