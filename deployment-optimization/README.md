# Deployment Optimization Guide

This directory contains files to help optimize the deployment process for Paddock20.

## Large Files Identified

The `large-files-list.txt` contains paths to large images and assets that should be:
1. Excluded from deployment packages using the .replignore.deploy file
2. Replaced with optimized versions or served from a CDN
3. Loaded asynchronously in the application

## How to Use for Deployment

1. Replace the current .replignore with .replignore.deploy before deploying:
   ```
   cp deployment-optimization/.replignore.deploy .replignore
   ```

2. After deployment, restore the original .replignore:
   ```
   git checkout -- .replignore
   ```

## Recommendation for Production

For production environments:
1. Optimize all images using tools like ImageOptim
2. Serve large assets from a CDN instead of bundling them
3. Implement lazy loading for images
4. Consider using responsive images based on device size
