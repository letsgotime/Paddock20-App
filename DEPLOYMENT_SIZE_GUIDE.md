# PADDOCK20 Deployment Size Guide

This guide addresses the issue of deployment size exceeding Replit's 8GB limit.

## Size Reduction Measures

The following measures have been implemented to reduce the deployment size:

1. Added `.gitignore` entries for large backup folders and media files
2. Added `.gitattributes` with export-ignore settings for backup directories
3. Added `.replignore` specifically for Replit deployment

## Before Deploying

Before hitting the deploy button:

1. **Clean up unnecessary backups**: Consider removing any backup directories that you don't need anymore.

2. **Verify ignored paths**: Check that all large folders are properly ignored in the `.replignore` file.

3. **Necessary image assets**: Only essential images are kept for the application to function correctly. The rest are excluded during deployment.

## Manual Size Check

To check the size of directories before deploying:

```bash
du -sh */
```

This command will show you the size of each top-level directory, helping you identify what's taking up space.

## Deployment Process

1. Make sure all `.gitignore`, `.gitattributes`, and `.replignore` files are properly set up
2. Click the "Deploy" button in Replit
3. If deployment fails due to size, check logs to see what large files/folders are still being included
4. Update the ignore files accordingly and try again

## Additional Recommendations

- Consider moving large asset files to a separate storage solution like Cloudinary
- For future development, keep media assets outside the main codebase when possible
- Use image optimization for any required assets to reduce file sizes