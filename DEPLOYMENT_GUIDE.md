# Paddock20 Deployment Guide

This guide will help you deploy Paddock20 on GitHub.

## GitHub Deployment Configuration

When deploying this application to GitHub, you need to configure the following settings:

### 1. Build and Run Commands

In your GitHub repository settings, configure the deployment with:

- **Build Command:** `npm run build`
- **Run Command:** `node dist/index.js`

### 2. Set Up Port Binding

Ensure your application binds to the correct port:

GitHub expects your application to listen on the port provided by the `PORT` environment variable.
Your server is already configured to use `process.env.PORT || 5000`, which is correct.

### 3. Environment Variables

Ensure you set all the necessary environment variables in your GitHub environment:

- `DATABASE_URL`: Your PostgreSQL database connection string
- `PORT`: Will be set automatically by GitHub
- `SESSION_SECRET`: A secure random string for session encryption
- All OAuth-related keys (Auth0, Spotify, etc.)
- Any other API keys your application needs

### 4. Important Files to Check Before Deployment

1. **server/index.ts**: Make sure there's only one `app.listen()` call and that it binds to `0.0.0.0` (not localhost)
2. **vite.config.ts**: Ensure it's properly configured for building the application

### 5. Troubleshooting Common Issues

- **404 errors**: Check that your static file serving is working correctly
- **API endpoints not found**: Ensure your server is properly registering routes
- **"Application error"**: Check your server logs for more information

### 6. Additional Notes for GitHub Deployment

- GitHub deployment uses Node.js to run your application, not Replit
- You do not need to use the Replit workflows on GitHub
- The symlink warnings in the logs can be safely ignored

## Testing Your Build Locally

To test your build configuration locally before deploying:

1. Run `npm run build` to build the application
2. Run `npm start` to start the server (or `node dist/index.js`)
3. Verify that your application works as expected

## Deployment Checklist

- [ ] All case sensitivity issues resolved
- [ ] Server properly configured to bind to 0.0.0.0
- [ ] Environment variables set up correctly
- [ ] Database connection working
- [ ] Static file serving working properly