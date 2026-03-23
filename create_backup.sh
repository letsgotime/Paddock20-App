#!/bin/bash

# Create a timestamped backup of the entire project
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="project_backup_${TIMESTAMP}"

echo "Creating backup of the entire project to: ${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}"

# Copy all files and directories
cp -r client "${BACKUP_DIR}/"
cp -r server "${BACKUP_DIR}/"
cp -r shared "${BACKUP_DIR}/"
cp -r public "${BACKUP_DIR}/" 2>/dev/null || echo "No public directory to backup"
cp -r assets "${BACKUP_DIR}/" 2>/dev/null || echo "No assets directory to backup"

# Copy configuration files
cp package.json "${BACKUP_DIR}/" 2>/dev/null || echo "No package.json to backup"
cp package-lock.json "${BACKUP_DIR}/" 2>/dev/null || echo "No package-lock.json to backup"
cp tsconfig.json "${BACKUP_DIR}/" 2>/dev/null || echo "No tsconfig.json to backup"
cp vite.config.ts "${BACKUP_DIR}/" 2>/dev/null || echo "No vite.config.ts to backup"
cp .env "${BACKUP_DIR}/" 2>/dev/null || echo "No .env to backup"
cp .gitignore "${BACKUP_DIR}/" 2>/dev/null || echo "No .gitignore to backup"

# Copy any other important files in the root directory
for file in *.js *.ts *.tsx *.jsx *.md *.html; do
  cp $file "${BACKUP_DIR}/" 2>/dev/null || true
done

echo "Backup complete! All files saved to ${BACKUP_DIR}/"
echo "If anything goes wrong, you can restore files from this directory."