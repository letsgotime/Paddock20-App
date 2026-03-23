#!/bin/bash

# Create or clean the deployment optimization directory
mkdir -p deployment-optimization 

# Check if large images exist and create a backup list
echo "# Large image files to exclude from deployment" > deployment-optimization/large-files-list.txt

# List of directories to check for large images
DIRS=(
  "client/public/assets/gallery"
  "client/public/assets/images"
  "client/public/assets/images/backgrounds"
  "client/public/assets/images/F1"
)

echo "Scanning for large image files..."

# Find and list large files
for dir in "${DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "Checking $dir for large files..."
    find "$dir" -type f -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -size +1M | while read file; do
      echo "$file" >> deployment-optimization/large-files-list.txt
      echo "Found large file: $file ($(du -h "$file" | cut -f1))"
    done
  fi
done

# Create a .replignore.deploy file with the large files added
cat .replignore > deployment-optimization/.replignore.deploy
echo "" >> deployment-optimization/.replignore.deploy
echo "# Large image files excluded for faster deployment" >> deployment-optimization/.replignore.deploy
cat deployment-optimization/large-files-list.txt >> deployment-optimization/.replignore.deploy

# Create a deployment guide README
cat > deployment-optimization/README.md << EOL
# Deployment Optimization Guide

This directory contains files to help optimize the deployment process for Paddock20.

## Large Files Identified

The \`large-files-list.txt\` contains paths to large images and assets that should be:
1. Excluded from deployment packages using the .replignore.deploy file
2. Replaced with optimized versions or served from a CDN
3. Loaded asynchronously in the application

## How to Use for Deployment

1. Replace the current .replignore with .replignore.deploy before deploying:
   \`\`\`
   cp deployment-optimization/.replignore.deploy .replignore
   \`\`\`

2. After deployment, restore the original .replignore:
   \`\`\`
   git checkout -- .replignore
   \`\`\`

## Recommendation for Production

For production environments:
1. Optimize all images using tools like ImageOptim
2. Serve large assets from a CDN instead of bundling them
3. Implement lazy loading for images
4. Consider using responsive images based on device size
EOL

echo "Created deployment optimization files in the deployment-optimization directory"
ls -la deployment-optimization/