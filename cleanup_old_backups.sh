#!/bin/bash

# Script to clean up old backups while keeping the most recent ones
# Usage: ./cleanup_old_backups.sh [number_to_keep]

# Default to keeping the 2 most recent backups if not specified
NUM_TO_KEEP=${1:-2}

echo "Cleaning up old backups, keeping the $NUM_TO_KEEP most recent ones..."

# Get list of backup directories sorted by modification time (newest first)
BACKUP_DIRS=$(find . -maxdepth 1 -type d -name "project_backup_*" | xargs stat -c "%y %n" | sort -r)

# Count total number of backup directories
TOTAL_BACKUPS=$(echo "$BACKUP_DIRS" | wc -l)

# Skip if we have fewer or equal to the number we want to keep
if [ "$TOTAL_BACKUPS" -le "$NUM_TO_KEEP" ]; then
  echo "Only $TOTAL_BACKUPS backup directories found. Nothing to clean up."
  exit 0
fi

# Display backup directories that will be kept
echo "Keeping these $NUM_TO_KEEP most recent backups:"
echo "$BACKUP_DIRS" | head -n "$NUM_TO_KEEP" | awk '{print $NF}' | while read dir; do
  echo "  - $dir ($(date -r "$dir" '+%Y-%m-%d %H:%M:%S'))"
done

# Ask for confirmation before deleting
echo ""
echo "The following backups will be DELETED:"
echo "$BACKUP_DIRS" | tail -n +$((NUM_TO_KEEP+1)) | awk '{print $NF}' | while read dir; do
  echo "  - $dir ($(date -r "$dir" '+%Y-%m-%d %H:%M:%S'))"
done

read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Operation cancelled."
  exit 1
fi

# Delete older backup directories
echo "$BACKUP_DIRS" | tail -n +$((NUM_TO_KEEP+1)) | awk '{print $NF}' | while read dir; do
  echo "Removing $dir..."
  rm -rf "$dir"
done

echo "Cleanup complete. Kept the $NUM_TO_KEEP most recent backup directories."