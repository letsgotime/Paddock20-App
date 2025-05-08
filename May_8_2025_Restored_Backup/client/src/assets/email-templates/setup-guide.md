# Auth0 Email Templates Setup Guide for PADDOCK20

This guide provides step-by-step instructions for configuring Auth0 to use our custom email templates for the beta tester approval system.

## Prerequisites

1. An Auth0 account with administrator access
2. Access to the PADDOCK20 custom email templates

## Step 1: Configure Auth0 Environment Variables

First, you need to set up the required environment variables for Auth0 integration. Add these to your `.env` file:

```
# Auth0 Public Variables (available on frontend)
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-audience-identifier

# Auth0 Private Variables (server-side only)
AUTH0_MANAGEMENT_CLIENT_ID=your-management-api-client-id
AUTH0_MANAGEMENT_CLIENT_SECRET=your-management-api-client-secret
```

## Step 2: Set Up Email Templates in Auth0

### Verification Email Template

1. Log in to your Auth0 Dashboard
2. Navigate to **Authentication > Email Templates**
3. Click on the **Verification Email** template
4. Switch to **Custom HTML Template**
5. Copy and paste the contents of `verification-email.html` into the template editor
6. Click on **Preview** to ensure the template looks correct
7. Save your changes

### Beta Approval Email Template

1. In the Auth0 Dashboard, go to **Email > Templates**
2. Click on **Create**
3. Enter the following details:
   - Template Name: `Beta Approval`
   - Subject: `Beta Tester Status Approved - PADDOCK20`
4. Copy and paste the contents of `beta-approval-email.html` into the HTML editor
5. Save the template

## Step 3: Configure Email Provider

For email delivery, you need to configure an email provider in Auth0:

1. Go to **Email > Provider**
2. Select your preferred provider (SMTP, Mailgun, SendGrid, etc.)
3. Follow the setup instructions specific to your provider
4. Test the configuration by sending a test email

## Step 4: Create Auth0 Rules for Beta Tester Handling

### Beta Tester Status Rule

1. Go to **Actions > Library**
2. Click on **Create**
3. Select **Flow > Login**
4. Name the action `Process Beta Tester Status`
5. Paste in the following code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  // Check if user has the beta tester metadata
  const betaTesterStatus = event.user.user_metadata?.betaTesterStatus;
  
  if (betaTesterStatus) {
    // Add the beta status to the ID token for frontend access
    const namespace = 'https://paddock20.app';
    api.idToken.setCustomClaim(`${namespace}/beta_status`, betaTesterStatus);
    
    // Also add it to the access token
    api.accessToken.setCustomClaim(`${namespace}/beta_status`, betaTesterStatus);
  }
};
```

6. Deploy the action
7. Add the action to your Login flow

## Step 5: Configure Auth0 Permissions & Roles

### Create Custom API

1. Go to **Applications > APIs**
2. Create a new API with the following settings:
   - Name: `PADDOCK20 API`
   - Identifier: same as your `VITE_AUTH0_AUDIENCE` value
   
### Define Permissions

1. In your API settings, go to the **Permissions** tab
2. Add the following permissions:
   - `read:users`
   - `update:users`
   - `update:current_user_metadata`

### Create Admin Role

1. Go to **User Management > Roles**
2. Create a new role called `admin`
3. Go to the **Permissions** tab of this role
4. Add all the permissions created above

### Assign Admin Role

1. Go to **User Management > Users**
2. Find and select the user you want to make an admin
3. Go to the **Roles** tab
4. Assign the `admin` role to this user

## Step 6: Configure Allowed Callbacks

1. Go to **Applications > Applications**
2. Select your PADDOCK20 application
3. Under **Application URIs**, configure:
   - Allowed Callback URLs: `https://your-app-domain/`
   - Allowed Web Origins: `https://your-app-domain`
   - Allowed Logout URLs: `https://your-app-domain`

## Step 7: Testing the System

After configuration, test the beta tester system:

1. Create a new test user account
2. Request beta tester status for this account
3. Log in as an admin user and approve the beta tester
4. Verify the approval email is sent properly
5. Log in as the test user and verify beta access is granted

## Troubleshooting

If you encounter issues:

- Check Auth0 logs for any errors (Auth0 Dashboard > Monitoring > Logs)
- Verify all environment variables are correctly set
- Ensure email templates are properly formatted
- Check that your email provider is properly configured
- Verify that the Auth0 actions are correctly added to the flow

For any Auth0-specific questions, refer to the [Auth0 Documentation](https://auth0.com/docs).